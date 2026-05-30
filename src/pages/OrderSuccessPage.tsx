import { BadgeCheck, Clock, MessageCircle, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { api } from "../api/client";
import { formatPrice } from "../components/ProductCard";
import type { Order } from "../types";

export function OrderSuccessPage() {
  const { orderNumber = "" } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as { order?: Order } | null)?.order || null);

  useEffect(() => {
    if (!order && orderNumber) api.getOrder(orderNumber).then(setOrder).catch(() => setOrder(null));
  }, [order, orderNumber]);

  if (!order) return <main className="container-page py-16 text-center font-bold text-ink/60">جاري تحميل بيانات الطلب...</main>;
  const productsText = order.items.map((item) => `${item.product_name_snapshot} x${item.quantity}`).join("، ");
  const whatsappText = encodeURIComponent([
    `طلب مؤكد من موقع غالب مول`,
    `رقم الطلب: ${order.order_number}`,
    `الاسم: ${order.customer_name}`,
    `الهاتف: ${order.customer_phone}`,
    `العنوان: ${order.customer_address}`,
    `المنتجات: ${productsText}`,
    `الإجمالي: ${formatPrice(order.total_amount)}`,
    `طريقة الدفع: الدفع عند الاستلام`,
    `ملاحظة التوصيل: خلال 48 ساعة`,
  ].join("\n"));
  const whatsappUrl = `https://wa.me/962798881300?text=${whatsappText}`;

  return (
    <main className="container-page py-10">
      <section className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white p-8 text-center shadow-glow">
        <BadgeCheck className="mx-auto mb-4 text-mallOrange" size={56} />
        <h1 className="text-3xl font-black">تم تثبيت طلبك بنجاح</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg leading-8 text-ink/65">سيتم التواصل معك وتجهيز الطلب، وسيصلك خلال 48 ساعة. الدفع عند الاستلام.</p>
        <div className="mt-6 grid gap-3 text-right sm:grid-cols-2">
          <Info label="رقم الطلب" value={order.order_number} />
          <Info label="الاسم" value={order.customer_name} />
          <Info label="الهاتف" value={order.customer_phone} />
          <Info label="الإجمالي" value={formatPrice(order.total_amount)} />
          <Info label="العنوان" value={order.customer_address} wide />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-4 py-2 font-black text-ink"><WalletCards size={18} /> الدفع عند الاستلام</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-4 py-2 font-black text-ink"><Clock size={18} /> خلال 48 ساعة</span>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary bg-mallOrange hover:bg-ink"><MessageCircle size={19} /> إرسال الطلب عبر واتساب</a>
          <Link to="/products" className="btn-secondary">متابعة التسوق</Link>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-md bg-soft p-4 ${wide ? "sm:col-span-2" : ""}`}><span className="block text-sm text-ink/50">{label}</span><b>{value}</b></div>;
}
