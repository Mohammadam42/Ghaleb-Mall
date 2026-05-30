import { MessageCircle, Printer, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { api, assetUrl, downloadAdminFile } from "../api/client";
import { formatPrice } from "../components/ProductCard";
import type { Order } from "../types";

const statuses = ["", "جديد", "قيد التجهيز", "تم التواصل مع العميل", "تم الإرسال", "تم التسليم", "ملغي"];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const load = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    api.adminOrders(`?${params.toString()}`).then(setOrders).catch(() => setOrders([]));
  };
  useEffect(load, [q, status]);

  const totals = useMemo(() => ({
    newOrders: orders.filter((order) => order.status === "جديد").length,
    processing: orders.filter((order) => order.status === "قيد التجهيز").length,
    sales: orders.filter((order) => order.status !== "ملغي").reduce((sum, order) => sum + order.total_amount, 0),
  }), [orders]);

  const whatsapp = (order: Order) => {
    const products = order.items.map((item) => `${item.product_name_snapshot} x${item.quantity}`).join("، ");
    const text = encodeURIComponent(`مرحبا ${order.customer_name}، تم تثبيت طلبك رقم ${order.order_number}. المنتجات: ${products}. الإجمالي ${formatPrice(order.total_amount)}. العنوان: ${order.customer_address}. الدفع عند الاستلام.`);
    return `https://wa.me/962${order.customer_phone.replace(/\D/g, "").replace(/^0/, "")}?text=${text}`;
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">إدارة الطلبات</h1>
          <p className="text-ink/60">عرض، بحث، تحديث حالة، تصدير، وطباعة الطلبات.</p>
        </div>
        <button className="btn-secondary" onClick={() => downloadAdminFile("/admin/orders/export/excel", "ghaleb-mall-orders.xlsx")}>تصدير Excel</button>
      </div>
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <Stat label="طلبات جديدة" value={totals.newOrders} />
        <Stat label="إجمالي الطلبات" value={orders.length} />
        <Stat label="إجمالي المبيعات" value={`${totals.sales.toFixed(2)} JD`} />
        <Stat label="قيد التجهيز" value={totals.processing} />
      </div>
      <div className="mb-5 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-[1fr_240px]">
        <label className="relative">
          <Search className="absolute right-3 top-3.5 text-ink/40" size={18} />
          <input className="input pr-10" placeholder="بحث برقم الطلب، الاسم، أو الهاتف" value={q} onChange={(event) => setQ(event.target.value)} />
        </label>
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((item) => <option key={item || "all"} value={item}>{item || "كل الحالات"}</option>)}
        </select>
      </div>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[920px] text-right">
          <thead className="text-sm text-ink/50"><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>العنوان</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-ink/10">
                <td className="py-3 font-black">{order.order_number}</td>
                <td>{order.customer_name}</td>
                <td><a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a></td>
                <td className="max-w-xs truncate">{order.customer_address}</td>
                <td>{formatPrice(order.total_amount)}</td>
                <td>
                  <select className="rounded-md border border-ink/10 p-2" value={order.status} onChange={(event) => api.updateOrderStatus(order.id, event.target.value).then(load)}>
                    {statuses.filter(Boolean).map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString("ar-JO")}</td>
                <td className="space-x-2 space-x-reverse">
                  <button className="rounded-md bg-ink px-3 py-2 text-white" onClick={() => setSelected(order)}>تفاصيل</button>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-white" onClick={() => api.cancelOrder(order.id).then(load)}>إلغاء</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink/50">رقم الطلب</p>
                <h2 className="text-2xl font-black">{selected.order_number}</h2>
              </div>
              <button className="rounded-md bg-ink px-3 py-2 text-white" onClick={() => setSelected(null)}>إغلاق</button>
            </div>
            <div className="grid gap-3 rounded-lg bg-soft p-4 md:grid-cols-2">
              <p><b>الاسم:</b> {selected.customer_name}</p>
              <p><b>الهاتف:</b> <a href={`tel:${selected.customer_phone}`}>{selected.customer_phone}</a></p>
              <p className="md:col-span-2"><b>العنوان:</b> {selected.customer_address}</p>
              <p><b>مصدر الطلب:</b> تثبيت الطلب من السلة</p>
              <p><b>الدفع:</b> الدفع عند الاستلام</p>
              <p><b>التوصيل:</b> خلال 48 ساعة</p>
            </div>
            <div className="mt-5 space-y-3">
              {selected.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-md border border-ink/10 p-3">
                  <img src={assetUrl(item.product_image_snapshot)} alt={item.product_name_snapshot} className="h-16 w-16 rounded-md object-cover" />
                  <div><b>{item.product_name_snapshot}</b><p className="text-sm text-ink/50">الكمية: {item.quantity}</p></div>
                  <b>{formatPrice(item.subtotal)}</b>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <b className="text-2xl">الإجمالي: {formatPrice(selected.total_amount)}</b>
              <div className="flex gap-2">
                <a className="btn-secondary" href={whatsapp(selected)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> واتساب</a>
                <button className="btn-primary" onClick={() => window.print()}><Printer size={18} /> طباعة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="admin-card"><p className="text-ink/50">{label}</p><b className="text-2xl">{value}</b></div>;
}
