import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api, assetUrl } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import type { CustomPage as CustomPageType } from "../types";

export function CustomPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<CustomPageType | null>(null);

  useEffect(() => {
    api.getPage(slug).then(setPage).catch(() => setPage(null));
  }, [slug]);

  if (!page) return <main className="container-page py-16 text-center font-bold text-ink/60">جاري تحميل الصفحة...</main>;

  return (
    <main className="container-page py-10">
      <section className="relative mb-8 overflow-hidden rounded-lg bg-ink p-8 text-white">
        {page.banner_image && <img src={assetUrl(page.banner_image)} alt={page.title_ar} className="absolute inset-0 h-full w-full object-cover opacity-20" />}
        <div className="relative">
          <p className="font-bold text-mallGold">صفحة ترويجية</p>
          <h1 className="mt-2 text-4xl font-black">{page.title_ar}</h1>
          <p className="mt-3 max-w-2xl text-white/70">{page.description}</p>
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(page.products || []).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}

