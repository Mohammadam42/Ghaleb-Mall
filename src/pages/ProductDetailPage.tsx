import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, assetUrl } from "../api/client";
import { formatPrice, priceOf } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    api.getProduct(slug).then((item) => {
      setProduct(item);
      setSelected(item.main_image || item.images[0]?.image_url || "");
    }).catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <main className="container-page py-16 text-center font-bold text-ink/60">جاري تحميل المنتج...</main>;
  const gallery = [product.main_image, ...product.images.map((item) => item.image_url)].filter(Boolean) as string[];

  return (
    <main className="container-page grid gap-8 py-10 lg:grid-cols-2">
      <section>
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
          <img src={assetUrl(selected || product.main_image)} alt={product.name_ar} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {gallery.slice(0, 5).map((image) => (
            <button key={image} className={`overflow-hidden rounded-md border ${selected === image ? "border-mallOrange" : "border-ink/10"}`} onClick={() => setSelected(image)}>
              <img src={assetUrl(image)} alt={product.name_ar} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <Link to={`/category/${product.category?.slug}`} className="font-bold text-mallOrange">{product.category?.name_ar}</Link>
        <h1 className="text-4xl font-black">{product.name_ar}</h1>
        <p className="text-lg leading-8 text-ink/65">{product.description_ar}</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-mallOrange">{formatPrice(priceOf(product))}</span>
          {product.discount_price && <span className="text-lg text-ink/40 line-through">{formatPrice(product.price)}</span>}
          {product.discount_percentage > 0 && <span className="rounded-md bg-mallOrange px-3 py-1 font-black text-white">خصم {product.discount_percentage}%</span>}
        </div>
        <div className="flex max-w-xs items-center justify-between rounded-md border border-ink/10 bg-white p-2">
          <button aria-label="Decrease quantity" className="rounded-md p-2 hover:bg-ink/5" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button>
          <span className="text-xl font-black">{quantity}</span>
          <button aria-label="Increase quantity" className="rounded-md p-2 hover:bg-ink/5" onClick={() => setQuantity(quantity + 1)}><Plus /></button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => addToCart(product, quantity)}><ShoppingBag size={19} /> إضافة للسلة</button>
        </div>
        <div className="rounded-lg bg-soft p-5 text-ink/70">
          <b className="block text-ink">الدفع عند الاستلام فقط</b>
          ثبت الطلب باسمك ورقم الهاتف والعنوان، وسيتم التواصل معك وتجهيز الطلب خلال 48 ساعة.
        </div>
      </section>
    </main>
  );
}
