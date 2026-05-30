import { BarChart3, Boxes, FileSpreadsheet, Image, LayoutDashboard, LogOut, Package, Percent, ReceiptText, Settings } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { setToken } from "../api/client";
import { Logo } from "./Logo";

const links = [
  { to: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "المنتجات", icon: Package },
  { to: "/dashboard/categories", label: "الأقسام", icon: Boxes },
  { to: "/dashboard/discounts", label: "الخصومات", icon: Percent },
  { to: "/dashboard/pages", label: "الصفحات", icon: BarChart3 },
  { to: "/dashboard/media", label: "الوسائط", icon: Image },
  { to: "/dashboard/logo", label: "الشعار", icon: Settings },
  { to: "/dashboard/orders", label: "الطلبات", icon: ReceiptText },
  { to: "/dashboard/import", label: "Excel", icon: FileSpreadsheet },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    setToken(null);
    navigate("/admin/login");
  };
  return (
    <div className="min-h-screen bg-[#f6f2ec]" dir="rtl">
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-72 border-l border-ink/10 bg-white p-5 lg:block">
        <div className="mb-8"><Logo compact /></div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} end={to === "/dashboard"} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-4 py-3 font-bold transition ${isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink"}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <button className="absolute bottom-5 right-5 flex items-center gap-2 rounded-md px-4 py-3 font-bold text-ink/70 hover:bg-ink/5" onClick={logout}>
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </aside>
      <main className="lg:mr-72">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-white/90 p-4 backdrop-blur lg:hidden">
          <Logo compact />
          <button onClick={logout} className="rounded-md p-2"><LogOut /></button>
        </div>
        <div className="container-page py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

