import { FormEvent, useEffect, useState } from "react";

import { api } from "../api/client";
import type { CustomPage, Product } from "../types";

export function AdminPages() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ title_ar: "", title_en: "", description: "", banner_image: "", is_published: true, product_ids: [] as number[] });
  const load = () => {
    api.getPages().then(setPages);
    api.getProducts("?page_size=100").then((data) => setProducts(data.items));
  };
  useEffect(load, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.createPage(form);
    setForm({ title_ar: "", title_en: "", description: "", banner_image: "", is_published: true, product_ids: [] });
    load();
  };
  const toggleProduct = (id: number) => {
    setForm((current) => ({
      ...current,
      product_ids: current.product_ids.includes(id) ? current.product_ids.filter((item) => item !== id) : [...current.product_ids, id],
    }));
  };
  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form className="admin-card grid h-fit gap-3" onSubmit={submit}>
        <h1 className="text-2xl font-black">صفحة ترويجية جديدة</h1>
        <input className="input" required placeholder="العنوان العربي" value={form.title_ar} onChange={(event) => setForm({ ...form, title_ar: event.target.value })} />
        <input className="input" placeholder="English title" value={form.title_en} onChange={(event) => setForm({ ...form, title_en: event.target.value })} />
        <input className="input" placeholder="رابط البانر" value={form.banner_image} onChange={(event) => setForm({ ...form, banner_image: event.target.value })} />
        <textarea className="input" placeholder="الوصف" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="max-h-60 overflow-auto rounded-md border border-ink/10 p-3">
          {products.map((product) => (
            <label key={product.id} className="mb-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.product_ids.includes(product.id)} onChange={() => toggleProduct(product.id)} />
              {product.name_ar}
            </label>
          ))}
        </div>
        <label className="font-bold"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> منشورة</label>
        <button className="btn-primary">إنشاء الصفحة</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => (
          <article key={page.id} className="admin-card">
            <p className="text-sm font-bold text-mallOrange">/{page.slug}</p>
            <h2 className="text-xl font-black">{page.title_ar}</h2>
            <p className="text-ink/60">{page.description}</p>
            <button className="mt-4 rounded-md bg-red-600 px-3 py-2 font-bold text-white" onClick={() => api.deletePage(page.id).then(load)}>حذف</button>
          </article>
        ))}
      </div>
    </section>
  );
}

