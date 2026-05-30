import { Heart, Languages, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/offers", label: "العروض" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

const mobileShoppingLinks = [
  { to: "/category/ستاتي", label: "ستاتي" },
  { to: "/category/ولادي", label: "ولادي" },
  { to: "/category/رجالي", label: "رجالي" },
  { to: "/offers", label: "عروض" },
  { to: "/category/بناتي", label: "بناتي" },
  { to: "/category/فساتين", label: "فساتين" },
  { to: "/category/أحذية-ستاتي", label: "أحذية ستاتي" },
  { to: "/category/أحذية-ولادي", label: "أحذية ولادي" },
  { to: "/category/أخرى", label: "أخرى" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const { totalItems } = useCart();
  const linkClass = ({ isActive }: { isActive: boolean }) => `rounded-md px-3 py-2 text-sm font-bold transition ${isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link aria-label="Search products" to="/products" className="rounded-md p-3 text-ink hover:bg-ink/5"><Search size={20} /></Link>
          <button aria-label="Language toggle" className="rounded-md p-3 text-ink hover:bg-ink/5" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
            <Languages size={20} />
          </button>
          <Link aria-label="Cart" to="/cart" className="relative rounded-md p-3 text-ink hover:bg-ink/5">
            <ShoppingBag size={21} />
            {totalItems > 0 && <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-mallOrange px-1 text-xs font-black text-white">{totalItems}</span>}
          </Link>
          <Link to="/dashboard" className="hidden rounded-md bg-mallGold px-4 py-2 text-sm font-black text-ink transition hover:bg-mallOrange hover:text-white md:inline-flex">
            لوحة التحكم
          </Link>
          <button aria-label="Menu" className="rounded-md p-3 lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden">
          <div className="mr-auto flex min-h-full w-80 max-w-[88vw] flex-col gap-5 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo compact />
              <button aria-label="Close menu" className="rounded-md p-2 hover:bg-ink/5" onClick={() => setOpen(false)}><X /></button>
            </div>
            {nav.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={linkClass}>{item.label}</NavLink>)}
            <div className="border-t border-ink/10 pt-4">
              <p className="mb-3 text-sm font-black text-ink/50">الأقسام</p>
              <div className="grid grid-cols-2 gap-2">
                {mobileShoppingLinks.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-md border border-ink/10 px-3 py-3 text-center text-sm font-black text-ink transition hover:border-mallOrange hover:text-mallOrange">
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary"><Heart size={18} /> لوحة التحكم</Link>
          </div>
        </div>
      )}
    </header>
  );
}
