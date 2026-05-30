import { Boxes, DollarSign, Package, Percent, ReceiptText, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../api/client";
import type { AdminStats } from "../types";

const cards = [
  ["total_products", "إجمالي المنتجات", Package],
  ["total_categories", "الأقسام", Boxes],
  ["discounted_products", "منتجات عليها خصم", Percent],
  ["featured_products", "منتجات مميزة", Star],
  ["new_orders", "طلبات جديدة", ReceiptText],
  ["total_sales", "إجمالي المبيعات", DollarSign],
] as const;

export function DashboardOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null));
  }, []);
  return (
    <section>
      <h1 className="mb-2 text-3xl font-black">لوحة التحكم</h1>
      <p className="mb-8 text-ink/60">إدارة المنتجات، الطلبات، الشعار، الاستيراد من Excel، والصفحات الترويجية.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([key, label, Icon]) => (
          <div key={key} className="admin-card">
            <Icon className="mb-4 text-mallOrange" />
            <p className="text-ink/50">{label}</p>
            <b className="mt-1 block text-3xl">{stats ? (key === "total_sales" ? `${stats[key].toFixed(2)} JD` : stats[key]) : "..."}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

