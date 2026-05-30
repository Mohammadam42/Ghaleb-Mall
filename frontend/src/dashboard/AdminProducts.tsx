import { FormEvent, useEffect, useState } from "react";

import { api, assetUrl } from "../api/client";
import { formatPrice } from "../components/ProductCard";
import type { Category, Product } from "../types";

const emptyForm = {
  name_ar: "",
  name_en: "",
  category_id: 0,
  price: 1,
  discount_price: "",
  description_ar: "",
  description_en: "",
  main_image: "",
  images: "",
  is_available: true,
  is_featured: false,
  is_offer: false,
  stock: 20,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const load = () => {
    api.getProducts("?page_size=100").then((data) => setProducts(data.items));
    api.getCategories().then((data) => {
      setCategories(data);
      setForm((current) => ({ ...current, category_id: current.category_id || data[0]?.id || 0 }));
    });
  };
  useEffect(load, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const images = form.images.split(",").map((item) => item.trim()).filter(Boolean);
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      discount_percentage: 0,
      images,
    };
    try {
      if (editing) await api.updateProduct(editing.id, payload);
      else await api.createProduct(payload);
      setMessage("تم حفظ المنتج بنجاح.");
      setEditing(null);
      setForm({ ...emptyForm, category_id: categories[0]?.id || 0 });
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حفظ المنتج");
    }
  };

  const edit = (product: Product) => {
    setEditing(product);
    setForm({
      name_ar: product.name_ar,
      name_en: product.name_en || "",
      category_id: product.category_id,
      price: product.price,
      discount_price: product.discount_price ? String(product.discount_price) : "",
      description_ar: product.description_ar || "",
      description_en: product.description_en || "",
      main_image: product.main_image || "",
      images: product.images.map((item) => item.image_url).join(", "),
      is_available: product.is_available,
      is_featured: product.is_featured,
      is_offer: product.is_offer,
      stock: product.stock,
    });
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form className="admin-card grid h-fit gap-3" onSubmit={submit}>
        <h1 className="text-2xl font-black">{editing ? "تعديل منتج" : "إضافة منتج"}</h1>
        <input className="input" required placeholder="اسم المنتج بالعربي" value={form.name_ar} onChange={(event) => setForm({ ...form, name_ar: event.target.value })} />
        <input className="input" placeholder="English name" value={form.name_en} onChange={(event) => setForm({ ...form, name_en: event.target.value })} />
        <select className="input" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: Number(event.target.value) })}>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name_ar}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="السعر" />
          <input className="input" type="number" step="0.01" value={form.discount_price} onChange={(event) => setForm({ ...form, discount_price: event.target.value })} placeholder="السعر بعد الخصم" />
        </div>
        <input className="input" placeholder="رابط الصورة الرئيسية" value={form.main_image} onChange={(event) => setForm({ ...form, main_image: event.target.value })} />
        <textarea className="input min-h-24" placeholder="روابط صور إضافية مفصولة بفواصل" value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} />
        <textarea className="input min-h-24" placeholder="وصف المنتج" value={form.description_ar} onChange={(event) => setForm({ ...form, description_ar: event.target.value })} />
        <div className="grid grid-cols-3 gap-2 text-sm font-bold">
          <label><input type="checkbox" checked={form.is_available} onChange={(event) => setForm({ ...form, is_available: event.target.checked })} /> متوفر</label>
          <label><input type="checkbox" checked={form.is_featured} onChange={(event) => setForm({ ...form, is_featured: event.target.checked })} /> مميز</label>
          <label><input type="checkbox" checked={form.is_offer} onChange={(event) => setForm({ ...form, is_offer: event.target.checked })} /> عرض</label>
        </div>
        {message && <p className="rounded-md bg-soft p-3 font-bold text-ink/70">{message}</p>}
        <button className="btn-primary">{editing ? "حفظ التعديل" : "إضافة المنتج"}</button>
      </form>
      <div className="admin-card overflow-x-auto">
        <h2 className="mb-4 text-2xl font-black">المنتجات</h2>
        <table className="w-full min-w-[760px] text-right">
          <thead className="text-sm text-ink/50"><tr><th>الصورة</th><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-ink/10">
                <td className="py-3"><img src={assetUrl(product.main_image)} alt={product.name_ar} className="h-16 w-16 rounded-md object-cover" /></td>
                <td className="font-bold">{product.name_ar}</td>
                <td>{product.category?.name_ar}</td>
                <td>{formatPrice(product.discount_price || product.price)}</td>
                <td>{product.is_offer ? "عرض" : product.is_featured ? "مميز" : "عادي"}</td>
                <td className="space-x-2 space-x-reverse">
                  <button className="rounded-md bg-ink px-3 py-2 text-white" onClick={() => edit(product)}>تعديل</button>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-white" onClick={() => api.deleteProduct(product.id).then(load)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

