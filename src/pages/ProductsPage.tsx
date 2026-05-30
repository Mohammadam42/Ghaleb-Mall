import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import type { Category, Product } from "../types";

export function ProductsPage({ offersOnly = false }: { offersOnly?: boolean }) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";
  const category = params.slug || searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  const title = offersOnly ? "العروض والخصومات" : category ? categories.find((item) => item.slug === category)?.name_ar || "منتجات القسم" : "كل المنتجات";

  const apiQuery = useMemo(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (sort) next.set("sort", sort);
    if (offersOnly) next.set("offers", "true");
    next.set("page_size", "60");
    return `?${next.toString()}`;
  }, [category, offersOnly, query, sort]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getProducts(apiQuery).then((data) => {
      setProducts(data.items);
      setTotal(data.total);
    }).catch(() => {
      setProducts([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  }, [apiQuery]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <main className="container-page py-10">
      <div className="mb-8 rounded-lg bg-ink p-8 text-white">
        <p className="font-bold text-mallGold">Ghaleb Mall</p>
        <h1 className="mt-2 text-4xl font-black">{title}</h1>
        <p className="mt-3 text-white/70">بحث، فلترة، ترتيب، وعروض متجددة بالدينار الأردني.</p>
      </div>
      <div className="mb-8 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <Filter className="absolute right-3 top-3.5 text-ink/40" size={18} />
          <input className="input pr-10" placeholder="ابحث عن منتج..." value={query} onChange={(event) => updateParam("q", event.target.value)} />
        </label>
        <select className="input" value={category} onChange={(event) => updateParam("category", event.target.value)}>
          <option value="">كل الأقسام</option>
          {categories.map((item) => <option value={item.slug} key={item.id}>{item.name_ar}</option>)}
        </select>
        <select className="input" value={sort} onChange={(event) => updateParam("sort", event.target.value)}>
          <option value="newest">الأحدث</option>
          <option value="price_asc">السعر من الأقل</option>
          <option value="price_desc">السعر من الأعلى</option>
        </select>
      </div>
      <div className="mb-5 flex items-center justify-between text-ink/60">
        <span>{loading ? "جاري التحميل..." : `${total} منتج`}</span>
        <span className="inline-flex items-center gap-2"><SlidersHorizontal size={18} /> طرق عرض مناسبة للموبايل والديسكتوب</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {!loading && products.length === 0 && <div className="rounded-lg border border-ink/10 bg-white p-10 text-center font-bold text-ink/60">لا توجد منتجات مطابقة حاليًا.</div>}
    </main>
  );
}

