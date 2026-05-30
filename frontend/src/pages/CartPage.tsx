import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { assetUrl } from "../api/client";
import { formatPrice, priceOf } from "../components/ProductCard";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { items, totalAmount, removeFromCart, updateQuantity } = useCart();
  return (
    <main className="container-page py-10">
      <h1 className="mb-8 text-4xl font-black">سلة التسوق</h1>
      {items.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-white p-10 text-center">
          <p className="mb-4 text-xl font-bold text-ink/60">السلة فارغة حاليًا.</p>
          <Link to="/products" className="btn-primary">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            {items.map(({ product, quantity }) => (
              <article key={product.id} className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-[110px_1fr_auto]">
                <img src={assetUrl(product.main_image)} alt={product.name_ar} className="aspect-square w-full rounded-md object-cover" />
                <div>
                  <h2 className="text-xl font-black">{product.name_ar}</h2>
                  <p className="text-ink/50">{formatPrice(priceOf(product))}</p>
                  {product.discount_price && <p className="text-sm text-mallOrange">يشمل خصم {product.discount_percentage}%</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-ink/10 p-2" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={17} /></button>
                  <span className="w-8 text-center font-black">{quantity}</span>
                  <button className="rounded-md border border-ink/10 p-2" onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={17} /></button>
                  <button className="rounded-md border border-ink/10 p-2 text-red-600" onClick={() => removeFromCart(product.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </section>
          <aside className="admin-card h-fit">
            <h2 className="text-2xl font-black">ملخص الطلب</h2>
            <div className="my-5 flex justify-between border-b border-ink/10 pb-4 text-lg">
              <span>الإجمالي</span>
              <b>{formatPrice(totalAmount)}</b>
            </div>
            <p className="mb-4 rounded-md bg-soft p-3 text-sm font-bold text-ink/70">الدفع عند الاستلام فقط، والتوصيل خلال 48 ساعة بعد تأكيد الطلب.</p>
            <Link to="/checkout" className="btn-primary w-full">تثبيت الطلب</Link>
          </aside>
        </div>
      )}
    </main>
  );
}

