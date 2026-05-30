import { CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { formatPrice } from "../components/ProductCard";
import { useCart } from "../context/CartContext";

export function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!items.length) {
      setError("السلة فارغة. أضف منتجات قبل تثبيت الطلب.");
      return;
    }
    setLoading(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      });
      clearCart();
      navigate(`/order-success/${order.order_number}`, { state: { order } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تثبيت الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <section className="admin-card">
        <h1 className="mb-2 text-4xl font-black">تثبيت الطلب</h1>
        <p className="mb-7 text-ink/60">أدخل الاسم ورقم الهاتف والعنوان فقط. الدفع عند الاستلام.</p>
        <form className="grid gap-4" onSubmit={submit}>
          <input className="input" required placeholder="الاسم الكامل" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
          <input className="input" required placeholder="رقم الهاتف 079xxxxxxx" value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} />
          <textarea className="input min-h-32" required placeholder="العنوان الكامل" value={form.customer_address} onChange={(event) => setForm({ ...form, customer_address: event.target.value })} />
          {error && <p className="rounded-md bg-red-50 p-3 font-bold text-red-700">{error}</p>}
          <button className="btn-primary" disabled={loading}>{loading ? "جاري التثبيت..." : "تأكيد الطلب"}</button>
        </form>
      </section>
      <aside className="admin-card h-fit">
        <h2 className="text-2xl font-black">الدفع والتوصيل</h2>
        <div className="my-5 space-y-3 text-ink/70">
          <p className="flex items-center gap-2"><CheckCircle2 className="text-mallOrange" /> الدفع عند الاستلام فقط</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="text-mallOrange" /> سيتم التواصل معك لتجهيز الطلب</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="text-mallOrange" /> التوصيل خلال 48 ساعة</p>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-4 text-xl">
          <span>الإجمالي</span>
          <b>{formatPrice(totalAmount)}</b>
        </div>
      </aside>
    </main>
  );
}

