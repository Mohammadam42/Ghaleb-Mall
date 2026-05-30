import { FormEvent, useEffect, useState } from "react";

import { api } from "../api/client";
import type { Category, Product } from "../types";

export function AdminDiscounts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productDiscount, setProductDiscount] = useState({ product_id: "", percentage: 15 });
  const [categoryDiscount, setCategoryDiscount] = useState({ category_id: "", percentage: 20 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getProducts("?page_size=100").then((data) => {
      setProducts(data.items);
      setProductDiscount((current) => ({ ...current, product_id: String(data.items[0]?.id || "") }));
    });
    api.getCategories().then((data) => {
      setCategories(data);
      setCategoryDiscount((current) => ({ ...current, category_id: String(data[0]?.id || "") }));
    });
  }, []);

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    const form = new FormData();
    form.append("product_id", productDiscount.product_id);
    form.append("percentage", String(productDiscount.percentage));
    await api.discountProduct(form);
    setMessage("تم تطبيق الخصم على المنتج.");
  };

  const submitCategory = async (event: FormEvent) => {
    event.preventDefault();
    const form = new FormData();
    form.append("category_id", categoryDiscount.category_id);
    form.append("percentage", String(categoryDiscount.percentage));
    await api.discountCategory(form);
    setMessage("تم تطبيق الخصم على القسم.");
  };

  return (
    <section>
      <h1 className="mb-2 text-3xl font-black">إدارة الخصومات</h1>
      <p className="mb-6 text-ink/60">يمكن تطبيق الخصم على منتج واحد أو قسم كامل. نسبة الخصم تحسب السعر الجديد تلقائيًا.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="admin-card grid gap-3" onSubmit={submitProduct}>
          <h2 className="text-xl font-black">خصم على منتج</h2>
          <select className="input" value={productDiscount.product_id} onChange={(event) => setProductDiscount({ ...productDiscount, product_id: event.target.value })}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name_ar}</option>)}
          </select>
          <input className="input" type="number" min={1} max={90} value={productDiscount.percentage} onChange={(event) => setProductDiscount({ ...productDiscount, percentage: Number(event.target.value) })} />
          <button className="btn-primary">تطبيق الخصم</button>
        </form>
        <form className="admin-card grid gap-3" onSubmit={submitCategory}>
          <h2 className="text-xl font-black">خصم على قسم كامل</h2>
          <select className="input" value={categoryDiscount.category_id} onChange={(event) => setCategoryDiscount({ ...categoryDiscount, category_id: event.target.value })}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name_ar}</option>)}
          </select>
          <input className="input" type="number" min={1} max={90} value={categoryDiscount.percentage} onChange={(event) => setCategoryDiscount({ ...categoryDiscount, percentage: Number(event.target.value) })} />
          <button className="btn-primary">تطبيق على القسم</button>
        </form>
      </div>
      {message && <p className="mt-5 rounded-md bg-soft p-4 font-bold text-ink/70">{message}</p>}
    </section>
  );
}

