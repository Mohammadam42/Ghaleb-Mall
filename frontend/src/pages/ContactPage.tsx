import { ExternalLink, Instagram, MapPin, Phone } from "lucide-react";

const socialLinks = {
  facebook: "https://www.facebook.com/Ghalebmallwholesale/?locale=ar_AR",
  instagram: "https://www.instagram.com/ghalebmall1/",
};

export function ContactPage() {
  return (
    <main className="container-page py-12">
      <section className="rounded-lg bg-ink p-8 text-white">
        <p className="font-bold text-mallGold">تواصل معنا</p>
        <h1 className="mt-2 text-4xl font-black">غالب مول</h1>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <a href="tel:0798881300" className="rounded-lg bg-white/10 p-5 hover:bg-white/15"><Phone className="mb-4" /><b>0798881300</b></a>
          <div className="rounded-lg bg-white/10 p-5"><MapPin className="mb-4" /><b>عمان - راس العين - شارع القدس - مقابل سامح مول</b></div>
          <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 p-5 hover:bg-white/15">
            <span className="mb-4 grid h-6 w-6 place-items-center rounded-sm bg-white text-lg font-black text-ink">f</span>
            <b>صفحة فيسبوك الرسمية</b>
            <ExternalLink className="mt-3 text-white/60" size={18} />
          </a>
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 p-5 hover:bg-white/15">
            <Instagram className="mb-4" />
            <b>حساب إنستغرام الرسمي</b>
            <ExternalLink className="mt-3 text-white/60" size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
