import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { assetUrl } from "../api/client";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function priceOf(product: Product) {
  return product.discount_price || product.price;
}

export function formatPrice(value: number) {
  return `${value.toFixed(2)} JD`;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <article className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-soft">
        <img src={assetUrl(product.main_image)} alt={product.name_ar} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.discount_percentage > 0 && <span className="absolute right-3 top-3 rounded-md bg-mallOrange px-3 py-1 text-sm font-black text-white">خصم {product.discount_percentage}%</span>}
        {product.is_featured && <span className="absolute left-3 top-3 rounded-md bg-white/90 px-3 py-1 text-sm font-black text-ink"><Heart size={14} className="inline" /> مميز</span>}
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/products/${product.slug}`} className="text-lg font-black text-ink hover:text-mallOrange">{product.name_ar}</Link>
          <p className="text-sm text-ink/50">{product.category?.name_ar || "غالب مول"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-mallOrange">{formatPrice(priceOf(product))}</span>
          {product.discount_price && <span className="text-sm text-ink/40 line-through">{formatPrice(product.price)}</span>}
        </div>
        <button className="btn-primary w-full px-3 py-2 text-sm" onClick={() => addToCart(product)}><ShoppingBag size={17} /> إضافة للسلة</button>
      </div>
    </article>
  );
}
