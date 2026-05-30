import { Instagram, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "./Logo";

const footerSections = [
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

const socialLinks = {
  facebook: "https://www.facebook.com/Ghalebmallwholesale/?locale=ar_AR",
  instagram: "https://www.instagram.com/ghalebmall1/",
};

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-white/70">غالب مول للألبسة في عمان، راس العين، شارع القدس، مقابل سامح مول. منتجات للرجال والنساء والأطفال مع عروض متجددة والدفع عند الاستلام.</p>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-black">الأقسام</h3>
          <div className="grid grid-cols-2 gap-2 text-white/70">
            {footerSections.map((item) => <Link key={item.to} to={item.to} className="hover:text-white">{item.label}</Link>)}
          </div>
        </div>
        <div className="space-y-3 text-white/80">
          <h3 className="text-lg font-black">تواصل معنا</h3>
          <p className="flex items-center gap-2"><MapPin size={18} /> عمان - راس العين - شارع القدس - مقابل سامح مول</p>
          <a className="flex items-center gap-2" href="tel:0798881300"><Phone size={18} /> 0798881300</a>
          <div className="flex gap-2 pt-2">
            <a aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-lg font-black hover:bg-white/20" href={socialLinks.facebook} target="_blank" rel="noreferrer">f</a>
            <a aria-label="Instagram" className="rounded-md bg-white/10 p-3 hover:bg-white/20" href={socialLinks.instagram} target="_blank" rel="noreferrer"><Instagram size={18} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/50">Ghaleb Mall © 2026</div>
    </footer>
  );
}
