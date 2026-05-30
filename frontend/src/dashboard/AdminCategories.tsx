import { FormEvent, useEffect, useState } from "react";

import { api, assetUrl } from "../api/client";
import type { Category } from "../types";

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name_ar: "", name_en: "", description: "", banner_image: "", sort_order: 0, is_active: true });
  const load = () => api.getCategories().then(setCategories);
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.createCategory(form);
    setForm({ name_ar: "", name_en: "", description: "", banner_image: "", sort_order: 0, is_active: true });
    load();
  };
  return (
    <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form className="admin-card grid h-fit gap-3" onSubmit={submit}>
        <h1 className="text-2xl font-black">إضافة قسم</h1>
        <input className="input" required placeholder="اسم القسم" value={form.name_ar} onChange={(event) => setForm({ ...form, name_ar: event.target.value })} />
        <input className="input" placeholder="English name" value={form.name_en} onChange={(event) => setForm({ ...form, name_en: event.target.value })} />
        <input className="input" placeholder="رابط صورة القسم" value={form.banner_image} onChange={(event) => setForm({ ...form, banner_image: event.target.value })} />
        <textarea className="input" placeholder="الوصف" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="btn-primary">حفظ القسم</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <article key={category.id} className="admin-card">
            <img src={assetUrl(category.banner_image)} alt={category.name_ar} className="mb-4 h-36 w-full rounded-md object-cover" />
            <h2 className="text-xl font-black">{category.name_ar}</h2>
            <p className="text-ink/50">{category.description}</p>
            <button className="mt-4 rounded-md bg-red-600 px-3 py-2 font-bold text-white" onClick={() => api.deleteCategory(category.id).then(load)}>حذف</button>
          </article>
        ))}
      </div>
    </section>
  );
}
