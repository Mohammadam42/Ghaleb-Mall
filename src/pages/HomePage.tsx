import { motion } from "framer-motion";
import { ArrowLeft, MapPin, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, assetUrl } from "../api/client";
import { FashionIntro3D } from "../components/FashionIntro3D";
import { ProductCard } from "../components/ProductCard";
import type { Category, CustomPage, Product } from "../types";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
    api.getProducts("?featured=true&page_size=8").then((data) => setFeatured(data.items)).catch(() => setFeatured([]));
    api.getProducts("?offers=true&page_size=8").then((data) => setOffers(data.items)).catch(() => setOffers([]));
    api.getPages().then(setPages).catch(() => setPages([]));
  }, []);

  return (
    <>
      <FashionIntro3D />
      <main>
        <section className="relative overflow-hidden bg-ink text-white">
          <div className="absolute inset-0 opacity-30">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80" alt="Fashion mall" className="h-full w-full object-cover" />
          </div>
          <div className="container-page relative grid min-h-[calc(100vh-80px)] items-center gap-10 py-14 md:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-mallGold"><Sparkles size={18} /> غالب مول | Ghaleb Mall</span>
              <h1 className="text-5xl font-black leading-tight md:text-7xl">أزياء لكل العائلة من قلب عمان</h1>
              <p className="max-w-2xl text-xl leading-9 text-white/78">رجالي، ستاتي، ولادي، بناتي، فساتين سهرة، أحذية، وإكسسوارات مع عروض متجددة. اختر منتجاتك وثبت الطلب، والدفع عند الاستلام خلال 48 ساعة.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary bg-mallOrange hover:bg-white hover:text-ink">تسوق الآن <ArrowLeft size={18} /></Link>
                <Link to="/offers" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink">شاهد العروض</Link>
              </div>
            </motion.div>
            <div className="hidden p-5 md:block">
              <img src="/ghaleb-logo-transparent.png" alt="Ghaleb Mall logo" className="mx-auto max-h-72 object-contain" />
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-md bg-white/10 p-4"><b className="block text-2xl">80+</b><span className="text-white/70">منتج متوفر</span></div>
                <div className="rounded-md bg-white/10 p-4"><b className="block text-2xl">COD</b><span className="text-white/70">الدفع عند الاستلام</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-14">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-mallOrange">الأقسام الرئيسية</p>
              <h2 className="text-3xl font-black">تسوق حسب القسم</h2>
            </div>
            <Link to="/products" className="font-bold text-ink/60 hover:text-mallOrange">كل المنتجات</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`} className="group relative h-52 overflow-hidden rounded-lg bg-ink">
                <img src={assetUrl(category.banner_image)} alt={category.name_ar} className="h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <div className="absolute bottom-4 right-4 text-white">
                  <h3 className="text-2xl font-black">{category.name_ar}</h3>
                  <p className="text-white/70">{category.name_en}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <ProductSection title="منتجات مميزة" subtitle="اختيارات غالب مول" products={featured} link="/products" />
        <ProductSection title="أحدث العروض" subtitle="خصومات جاهزة للطلب" products={offers} link="/offers" />

        <section className="bg-white py-14">
          <div className="container-page grid gap-6 md:grid-cols-3">
            {pages.map((page) => (
              <Link key={page.id} to={`/pages/${page.slug}`} className="rounded-lg border border-ink/10 bg-soft p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <p className="text-sm font-black text-mallOrange">صفحة ترويجية</p>
                <h3 className="mt-2 text-2xl font-black">{page.title_ar}</h3>
                <p className="mt-3 text-ink/60">{page.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="container-page grid gap-5 py-14 md:grid-cols-3">
          <div className="admin-card"><Truck className="mb-4 text-mallOrange" /><h3 className="text-xl font-black">توصيل خلال 48 ساعة</h3><p className="text-ink/60">بعد تثبيت الطلب سيتم التواصل معك وتجهيز الطلب.</p></div>
          <div className="admin-card"><ShoppingBag className="mb-4 text-mallOrange" /><h3 className="text-xl font-black">أضف للسلة أولًا</h3><p className="text-ink/60">اختَر المنتجات ثم ثبّت الطلب من السلة بخطوات بسيطة.</p></div>
          <div className="admin-card"><MapPin className="mb-4 text-mallOrange" /><h3 className="text-xl font-black">عمان - راس العين</h3><p className="text-ink/60">شارع القدس، مقابل سامح مول.</p></div>
        </section>
      </main>
    </>
  );
}

function ProductSection({ title, subtitle, products, link }: { title: string; subtitle: string; products: Product[]; link: string }) {
  return (
    <section className="container-page py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="font-bold text-mallOrange">{subtitle}</p>
          <h2 className="text-3xl font-black">{title}</h2>
        </div>
        <Link to={link} className="font-bold text-ink/60 hover:text-mallOrange">عرض المزيد</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
