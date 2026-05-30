import type { AdminStats, Category, CustomPage, LogoState, Order, Product, ProductListResponse } from "../types";

const STORE_KEY = "ghaleb_mall_static_store_v1";
const TOKEN_KEY = "ghaleb_admin_token";
const ADMIN_EMAILS = ["admin@ghalebmall.com", "admin@ghalebmall.local"];
const ADMIN_PASSWORDS = ["12345678", "ChangeMe123!"];

type ProductPayload = Omit<Partial<Product>, "images"> & { images?: string[] };
type CategoryPayload = Partial<Category>;
type PagePayload = Partial<CustomPage> & { product_ids?: number[] };
type MediaFile = { id: number; original_name: string; url: string; content_type: string; size: number };
type StorePage = CustomPage & { product_ids: number[] };

interface Store {
  categories: Category[];
  products: Product[];
  pages: StorePage[];
  orders: Order[];
  media: MediaFile[];
  logo: LogoState;
  nextIds: {
    category: number;
    product: number;
    productImage: number;
    page: number;
    order: number;
    orderItem: number;
    media: number;
  };
}

const imagePool: Record<string, string[]> = {
  "رجالي": [
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  ],
  "ستاتي": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
  ],
  "ولادي": [
    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
  ],
  "بناتي": [
    "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  ],
  "أحذية ولادي": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
  ],
  "أحذية ستاتي": [
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=900&q=80",
  ],
  "فساتين": [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=900&q=80",
  ],
  "أخرى": [
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
  ],
};

const categorySeed = [
  ["رجالي", "Men"],
  ["ستاتي", "Women"],
  ["ولادي", "Boys"],
  ["بناتي", "Girls"],
  ["أحذية ولادي", "Boys Shoes"],
  ["أحذية ستاتي", "Women Shoes"],
  ["فساتين", "Dresses"],
  ["أخرى", "Other"],
] as const;

const productNames: Record<string, string[]> = {
  "رجالي": ["طقم رجالي كاجوال", "بنطلون رجالي كلاسيك", "بلوزة صوف رجالي", "جاكيت رجالي شتوي", "قميص رجالي رسمي", "تيشيرت رجالي يومي", "كنزة رجالي Old Money", "بدلة رجالي خفيفة", "هودي رجالي شبابي", "شورت رجالي صيفي"],
  "ستاتي": ["بلوزة ستاتي ناعمة", "عباءة ستاتي أنيقة", "جاكيت ستاتي قصير", "بنطلون ستاتي واسع", "طقم ستاتي عملي", "قميص ستاتي فاخر", "تنورة ستاتي كلاسيك", "كارديغان ستاتي", "بلوزة Old Money", "تونيك ستاتي مريح"],
  "ولادي": ["طقم ولادي رياضي", "جاكيت ولادي مبطن", "بنطلون ولادي جينز", "بلوزة ولادي قطن", "هودي ولادي", "قميص ولادي مناسبات", "طقم أطفال ولادي", "شورت ولادي", "كنزة ولادي شتوية", "بيجاما ولادي"],
  "بناتي": ["جاكيت بناتي", "طقم بناتي ملون", "فستان بناتي يومي", "تنورة بناتي", "بلوزة بناتي", "هودي بناتي", "بنطلون بناتي", "طقم أطفال بناتي", "كارديغان بناتي", "بيجاما بناتي"],
  "أحذية ولادي": ["حذاء ولادي رياضي", "سنيكرز ولادي خفيف", "بوت ولادي شتوي", "حذاء مدرسة ولادي", "صندل ولادي", "حذاء ولادي كاجوال", "حذاء كرة ولادي", "سليبر ولادي", "حذاء جلد ولادي", "حذاء مشي ولادي"],
  "أحذية ستاتي": ["حذاء ستاتي أنيق", "كعب ستاتي سهرة", "سنيكرز ستاتي", "بوت ستاتي", "صندل ستاتي", "حذاء عمل ستاتي", "حذاء مسطح ستاتي", "حذاء جلد ستاتي", "كعب مريح ستاتي", "حذاء مناسبات ستاتي"],
  "فساتين": ["فستان سهرة فاخر", "فستان ناعم للمناسبات", "فستان خطوبة أنيق", "فستان سهرة مطرز", "فستان قصير راقي", "فستان طويل كلاسيك", "فستان ساتان", "فستان مخمل", "فستان عائلي راقي", "فستان سهرة محتشم"],
  "أخرى": ["حقيبة ستاتي", "إكسسوار شعر", "حزام رجالي", "نظارة شمسية", "محفظة جلد", "وشاح أنيق", "طقم إكسسوارات", "قبعة شبابية", "ربطة عنق", "جوارب قطنية"],
};

function now() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function uniqueSlug(base: string, taken: string[]) {
  const slug = slugify(base);
  let next = slug;
  let counter = 2;
  while (taken.includes(next)) {
    next = `${slug}-${counter}`;
    counter += 1;
  }
  return next;
}

function discountPercentage(price: number, discount?: number | null) {
  if (!discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
}

function seedStore(): Store {
  let productImageId = 1;
  const categories: Category[] = categorySeed.map(([name_ar, name_en], index) => ({
    id: index + 1,
    name_ar,
    name_en,
    slug: slugify(name_ar),
    description: `تشكيلة ${name_ar} المختارة بعناية من غالب مول في عمان.`,
    banner_image: imagePool[name_ar][0],
    sort_order: index + 1,
    is_active: true,
  }));

  const products: Product[] = [];
  categories.forEach((category, categoryIndex) => {
    productNames[category.name_ar].forEach((name, productIndex) => {
      const price = Number((5 + (categoryIndex + 1) * 1.75 + (productIndex + 1) * 1.15).toFixed(2));
      const hasDiscount = [1, 3, 6].includes(productIndex);
      const discountPrice = hasDiscount ? Number((price * 0.82).toFixed(2)) : null;
      const images = imagePool[category.name_ar];
      const created = new Date(Date.now() - products.length * 3600000).toISOString();
      products.push({
        id: products.length + 1,
        name_ar: name,
        name_en: `${category.name_en} item ${productIndex + 1}`,
        slug: uniqueSlug(name, products.map((item) => item.slug)),
        category_id: category.id,
        category,
        price,
        discount_price: discountPrice,
        discount_percentage: discountPercentage(price, discountPrice),
        description_ar: `${name} من غالب مول بخامة عملية وموديل مناسب للتسوق اليومي والمناسبات. متوفر بتشكيلة ألوان ومقاسات.`,
        description_en: `Selected ${category.name_en?.toLowerCase()} item from Ghaleb Mall with practical fabric and modern styling.`,
        main_image: images[productIndex % images.length],
        is_available: true,
        is_featured: [0, 2, 5].includes(productIndex),
        is_offer: hasDiscount,
        stock: 12 + productIndex,
        images: images.map((image_url, sort_order) => ({ id: productImageId++, image_url, sort_order, alt_text: name })),
        created_at: created,
        updated_at: created,
      });
    });
  });

  const pages: StorePage[] = [
    {
      id: 1,
      title_ar: "عروض اليوم",
      title_en: "Today Offers",
      slug: "عروض-اليوم",
      description: "خصومات يومية مختارة على الملابس والأحذية.",
      banner_image: "/ghaleb-logo-transparent.png",
      is_published: true,
      product_ids: products.filter((item) => item.is_offer).slice(0, 16).map((item) => item.id),
    },
    {
      id: 2,
      title_ar: "فساتين سهرة",
      title_en: "Evening Dresses",
      slug: "فساتين-سهرة",
      description: "فساتين سهرة ومناسبات بتصاميم راقية.",
      banner_image: imagePool["فساتين"][0],
      is_published: true,
      product_ids: products.filter((item) => item.category?.name_ar === "فساتين").slice(0, 16).map((item) => item.id),
    },
    {
      id: 3,
      title_ar: "تصفية الموسم",
      title_en: "Season Clearance",
      slug: "تصفية-الموسم",
      description: "قطع مختارة بأسعار مناسبة قبل نهاية الموسم.",
      banner_image: imagePool["ستاتي"][0],
      is_published: true,
      product_ids: products.filter((item) => item.is_offer || item.is_featured).slice(0, 16).map((item) => item.id),
    },
  ];

  const orders = createDemoOrders(products);
  return {
    categories,
    products,
    pages,
    orders,
    media: [],
    logo: {
      confirmed_logo_url: "/ghaleb-logo-transparent.png",
      pending_logo_url: null,
      fallback_text: "غالب مول | Ghaleb Mall",
    },
    nextIds: {
      category: categories.length + 1,
      product: products.length + 1,
      productImage: productImageId,
      page: pages.length + 1,
      order: orders.length + 1,
      orderItem: orders.reduce((max, order) => Math.max(max, ...order.items.map((item) => item.id)), 0) + 1,
      media: 1,
    },
  };
}

function createDemoOrders(products: Product[]): Order[] {
  const customers = [
    ["سارة أحمد", "0798881300", "عمان - راس العين - قرب سامح مول"],
    ["محمد خالد", "0781234567", "عمان - جبل الحسين"],
    ["ليان محمود", "0771234567", "عمان - الوحدات"],
  ];
  let itemId = 1;
  return customers.map(([customer_name, customer_phone, customer_address], index) => {
    const items = products.slice(index * 2, index * 2 + 2).map((product) => {
      const quantity = index + 1;
      const price = product.discount_price || product.price;
      return {
        id: itemId++,
        product_id: product.id,
        product_name_snapshot: product.name_ar,
        product_price_snapshot: price,
        quantity,
        subtotal: Number((price * quantity).toFixed(2)),
        product_image_snapshot: product.main_image,
      };
    });
    const date = new Date(Date.now() - index * 86400000).toISOString();
    return {
      id: index + 1,
      order_number: `GM-${String(index + 1).padStart(6, "0")}`,
      customer_name,
      customer_phone,
      customer_address,
      total_amount: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
      payment_method: "cash_on_delivery",
      delivery_note: "Delivery within 48 hours",
      status: index === 0 ? "جديد" : "قيد التجهيز",
      items,
      created_at: date,
      updated_at: date,
    };
  });
}

function readStore(): Store {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }
  try {
    const store = JSON.parse(raw) as Store;
    return hydrateStore(store);
  } catch {
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }
}

function writeStore(store: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function hydrateStore(store: Store): Store {
  const categories = [...store.categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const products = store.products.map((product) => ({
    ...product,
    category: categories.find((category) => category.id === product.category_id) || null,
    images: product.images || [],
  }));
  return { ...store, categories, products };
}

function withStore<T>(handler: (store: Store) => T): Promise<T> {
  const store = readStore();
  const result = handler(store);
  writeStore(store);
  return Promise.resolve(result);
}

export function assetUrl(url?: string | null): string {
  if (!url) return "/ghaleb-logo-transparent.png";
  return url;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function requireAdmin() {
  if (!getToken()) throw new Error("يرجى تسجيل الدخول للوحة التحكم");
}

function getFormNumber(form: FormData, key: string) {
  return Number(form.get(key) || 0);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

function productWithImages(store: Store, payload: ProductPayload, existing?: Product): Product {
  const date = now();
  const images = (payload.images || existing?.images.map((item) => item.image_url) || []).filter(Boolean);
  const price = Number(payload.price || existing?.price || 1);
  const discount_price = payload.discount_price === undefined ? existing?.discount_price || null : payload.discount_price ? Number(payload.discount_price) : null;
  const name = String(payload.name_ar || existing?.name_ar || "منتج جديد");
  const taken = store.products.filter((item) => item.id !== existing?.id).map((item) => item.slug);
  const product: Product = {
    id: existing?.id || store.nextIds.product++,
    name_ar: name,
    name_en: payload.name_en ?? existing?.name_en ?? "",
    slug: existing?.slug || uniqueSlug(name, taken),
    category_id: Number(payload.category_id || existing?.category_id || store.categories[0]?.id || 1),
    category: null,
    price,
    discount_price,
    discount_percentage: discountPercentage(price, discount_price),
    description_ar: payload.description_ar ?? existing?.description_ar ?? "",
    description_en: payload.description_en ?? existing?.description_en ?? "",
    main_image: payload.main_image || images[0] || existing?.main_image || "/ghaleb-logo-transparent.png",
    is_available: payload.is_available ?? existing?.is_available ?? true,
    is_featured: payload.is_featured ?? existing?.is_featured ?? false,
    is_offer: payload.is_offer ?? Boolean(discount_price),
    stock: Number(payload.stock ?? existing?.stock ?? 20),
    images: images.map((image_url, sort_order) => ({
      id: existing?.images[sort_order]?.id || store.nextIds.productImage++,
      image_url,
      sort_order,
      alt_text: name,
    })),
    created_at: existing?.created_at || date,
    updated_at: date,
  };
  product.category = store.categories.find((category) => category.id === product.category_id) || null;
  return product;
}

function parseParams(params = "") {
  return new URLSearchParams(params.startsWith("?") ? params.slice(1) : params);
}

function exportCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  const headers = Object.keys(rows[0] || { empty: "" });
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename.replace(/\.(xlsx|xls)$/i, ".csv");
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = (lines.shift() || "").split(",").map((item) => item.trim().replace(/^"|"$/g, ""));
  return lines.map((line) => {
    const values = line.split(",").map((item) => item.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

export const api = {
  getLogo: () => withStore((store) => store.logo),
  getCategories: () => withStore((store) => store.categories.filter((category) => category.is_active)),
  getProducts: (params = "") => withStore<ProductListResponse>((store) => {
    const search = parseParams(params);
    let items = [...store.products];
    const q = search.get("q")?.trim().toLowerCase();
    const category = search.get("category");
    const minPrice = Number(search.get("min_price") || 0);
    const maxPrice = Number(search.get("max_price") || 0);
    const offers = search.get("offers");
    const featured = search.get("featured");
    const sort = search.get("sort") || "newest";
    const page = Number(search.get("page") || 1);
    const pageSize = Number(search.get("page_size") || 24);
    if (q) items = items.filter((item) => `${item.name_ar} ${item.name_en} ${item.description_ar}`.toLowerCase().includes(q));
    if (category) items = items.filter((item) => item.category?.slug === category || item.category?.name_ar === category || item.category?.name_en === category);
    if (minPrice) items = items.filter((item) => (item.discount_price || item.price) >= minPrice);
    if (maxPrice) items = items.filter((item) => (item.discount_price || item.price) <= maxPrice);
    if (offers !== null) items = items.filter((item) => item.is_offer === (offers === "true"));
    if (featured !== null) items = items.filter((item) => item.is_featured === (featured === "true"));
    if (sort === "price_asc") items.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    else if (sort === "price_desc") items.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    else items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const total = items.length;
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, page_size: pageSize };
  }),
  getProduct: (identifier: string | number) => withStore((store) => {
    const id = Number(identifier);
    const product = store.products.find((item) => item.slug === identifier || item.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  }),
  getPages: () => withStore<CustomPage[]>((store) => store.pages.filter((page) => page.is_published)),
  getPage: (slug: string) => withStore<CustomPage>((store) => {
    const page = store.pages.find((item) => item.slug === slug && item.is_published);
    if (!page) throw new Error("Page not found");
    return { ...page, products: page.product_ids.map((id) => store.products.find((product) => product.id === id)).filter(Boolean) as Product[] };
  }),
  createOrder: (payload: { customer_name: string; customer_phone: string; customer_address: string; items: { product_id: number; quantity: number }[] }) => withStore((store) => {
    const items = payload.items.map((item) => {
      const product = store.products.find((productItem) => productItem.id === item.product_id);
      if (!product) throw new Error("Product unavailable");
      const price = product.discount_price || product.price;
      return {
        id: store.nextIds.orderItem++,
        product_id: product.id,
        product_name_snapshot: product.name_ar,
        product_price_snapshot: price,
        quantity: item.quantity,
        subtotal: Number((price * item.quantity).toFixed(2)),
        product_image_snapshot: product.main_image,
      };
    });
    const date = now();
    const order: Order = {
      id: store.nextIds.order++,
      order_number: `GM-${String(Date.now()).slice(-6)}`,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_address: payload.customer_address,
      total_amount: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
      payment_method: "cash_on_delivery",
      delivery_note: "Delivery within 48 hours",
      status: "جديد",
      items,
      created_at: date,
      updated_at: date,
    };
    store.orders.unshift(order);
    return order;
  }),
  getOrder: (orderNumber: string) => withStore((store) => {
    const order = store.orders.find((item) => item.order_number === orderNumber);
    if (!order) throw new Error("Order not found");
    return order;
  }),
  login: (email: string, password: string) => Promise.resolve().then(() => {
    if (!ADMIN_EMAILS.includes(email) || !ADMIN_PASSWORDS.includes(password)) throw new Error("بيانات الدخول غير صحيحة");
    return { access_token: "static-demo-admin-token" };
  }),
  me: () => Promise.resolve({ email: "admin@ghalebmall.com", full_name: "Ghaleb Mall Admin" }),
  stats: () => withStore<AdminStats>((store) => ({
    total_products: store.products.length,
    total_categories: store.categories.length,
    discounted_products: store.products.filter((item) => item.is_offer).length,
    featured_products: store.products.filter((item) => item.is_featured).length,
    custom_pages: store.pages.length,
    new_orders: store.orders.filter((item) => item.status === "جديد").length,
    total_orders: store.orders.length,
    total_sales: Number(store.orders.reduce((sum, item) => sum + item.total_amount, 0).toFixed(2)),
    processing_orders: store.orders.filter((item) => item.status === "قيد التجهيز").length,
  })),
  adminOrders: (params = "") => withStore((store) => {
    requireAdmin();
    const search = parseParams(params);
    const q = search.get("q")?.trim();
    const status = search.get("status")?.trim();
    let orders = [...store.orders];
    if (q) orders = orders.filter((order) => `${order.order_number} ${order.customer_name} ${order.customer_phone}`.includes(q));
    if (status) orders = orders.filter((order) => order.status === status);
    return orders;
  }),
  updateOrderStatus: (id: number, status: string) => withStore((store) => {
    requireAdmin();
    const order = store.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");
    order.status = status;
    order.updated_at = now();
    return order;
  }),
  cancelOrder: (id: number) => api.updateOrderStatus(id, "ملغي"),
  createProduct: (payload: ProductPayload) => withStore((store) => {
    requireAdmin();
    const product = productWithImages(store, payload);
    store.products.unshift(product);
    return product;
  }),
  updateProduct: (id: number, payload: ProductPayload) => withStore((store) => {
    requireAdmin();
    const index = store.products.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Product not found");
    const product = productWithImages(store, payload, store.products[index]);
    store.products[index] = product;
    return product;
  }),
  deleteProduct: (id: number) => withStore((store) => {
    requireAdmin();
    store.products = store.products.filter((item) => item.id !== id);
  }),
  createCategory: (payload: CategoryPayload) => withStore((store) => {
    requireAdmin();
    const name = payload.name_ar || "قسم جديد";
    const category: Category = {
      id: store.nextIds.category++,
      name_ar: name,
      name_en: payload.name_en || "",
      slug: uniqueSlug(name, store.categories.map((item) => item.slug)),
      description: payload.description || "",
      banner_image: payload.banner_image || "/ghaleb-logo-transparent.png",
      sort_order: Number(payload.sort_order || store.categories.length + 1),
      is_active: payload.is_active ?? true,
    };
    store.categories.push(category);
    return category;
  }),
  updateCategory: (id: number, payload: CategoryPayload) => withStore((store) => {
    requireAdmin();
    const category = store.categories.find((item) => item.id === id);
    if (!category) throw new Error("Category not found");
    Object.assign(category, payload);
    return category;
  }),
  deleteCategory: (id: number) => withStore((store) => {
    requireAdmin();
    store.categories = store.categories.filter((item) => item.id !== id);
  }),
  createPage: (payload: PagePayload) => withStore((store) => {
    requireAdmin();
    const page: StorePage = {
      id: store.nextIds.page++,
      title_ar: payload.title_ar || "صفحة جديدة",
      title_en: payload.title_en || "",
      slug: uniqueSlug(payload.title_ar || "صفحة جديدة", store.pages.map((item) => item.slug)),
      description: payload.description || "",
      banner_image: payload.banner_image || "/ghaleb-logo-transparent.png",
      is_published: payload.is_published ?? true,
      product_ids: payload.product_ids || [],
    };
    store.pages.unshift(page);
    return page;
  }),
  updatePage: (id: number, payload: PagePayload) => withStore((store) => {
    requireAdmin();
    const page = store.pages.find((item) => item.id === id);
    if (!page) throw new Error("Page not found");
    Object.assign(page, payload);
    return page;
  }),
  deletePage: (id: number) => withStore((store) => {
    requireAdmin();
    store.pages = store.pages.filter((item) => item.id !== id);
  }),
  media: () => withStore((store) => {
    requireAdmin();
    return store.media;
  }),
  uploadMedia: async (form: FormData) => {
    const file = form.get("file") as File | null;
    if (!file) throw new Error("اختر صورة أولا");
    const url = await fileToDataUrl(file);
    return withStore((store) => {
      requireAdmin();
      const media: MediaFile = { id: store.nextIds.media++, original_name: file.name, url, content_type: file.type, size: file.size };
      store.media.unshift(media);
      return media;
    });
  },
  deleteMedia: (id: number) => withStore((store) => {
    requireAdmin();
    store.media = store.media.filter((item) => item.id !== id);
  }),
  uploadLogo: async (form: FormData) => {
    const file = form.get("file") as File | null;
    if (!file) throw new Error("اختر صورة أولا");
    const url = await fileToDataUrl(file);
    return withStore((store) => {
      requireAdmin();
      store.logo.pending_logo_url = url;
      return store.logo;
    });
  },
  logoPreview: () => withStore((store) => {
    requireAdmin();
    return store.logo;
  }),
  confirmLogo: () => withStore((store) => {
    requireAdmin();
    if (store.logo.pending_logo_url) {
      store.logo.confirmed_logo_url = store.logo.pending_logo_url;
      store.logo.pending_logo_url = null;
    }
    return store.logo;
  }),
  importProducts: async (form: FormData) => {
    requireAdmin();
    const file = form.get("file") as File | null;
    const commit = form.get("commit") === "true";
    if (!file) throw new Error("اختر ملف CSV أولا");
    const text = await file.text();
    const rows = parseCsv(text);
    const errors: string[] = [];
    const preview = rows.map((row) => ({
      name_ar: row["اسم المنتج"] || row["product name"] || "",
      category: row["القسم"] || row["category"] || "",
      price: Number(row["السعر"] || row["price"] || 0),
      description_ar: row["الوصف"] || row["description"] || "",
      main_image: row["الصورة"] || row["image"] || "",
    }));
    preview.forEach((row, index) => {
      if (!row.name_ar || !row.category || !row.price) errors.push(`الصف ${index + 2}: الاسم والقسم والسعر مطلوبة`);
    });
    if (commit && errors.length === 0) {
      await withStore((store) => {
        preview.forEach((row) => {
          let category = store.categories.find((item) => item.name_ar === row.category);
          if (!category) {
            category = {
              id: store.nextIds.category++,
              name_ar: row.category,
              name_en: "",
              slug: uniqueSlug(row.category, store.categories.map((item) => item.slug)),
              description: "",
              banner_image: row.main_image || "/ghaleb-logo-transparent.png",
              sort_order: store.categories.length + 1,
              is_active: true,
            };
            store.categories.push(category);
          }
          store.products.unshift(productWithImages(store, {
            name_ar: row.name_ar,
            category_id: category.id,
            price: row.price,
            description_ar: row.description_ar,
            main_image: row.main_image,
            images: row.main_image ? [row.main_image] : [],
          }));
        });
      });
    }
    return { ok: errors.length === 0, created: commit && errors.length === 0 ? preview.length : 0, updated: 0, rows: preview, errors };
  },
  discountProduct: (form: FormData) => withStore((store) => {
    requireAdmin();
    const product = store.products.find((item) => item.id === getFormNumber(form, "product_id"));
    if (!product) throw new Error("Product not found");
    const percentage = getFormNumber(form, "percentage");
    product.discount_price = Number((product.price * (1 - percentage / 100)).toFixed(2));
    product.discount_percentage = percentage;
    product.is_offer = true;
    return product;
  }),
  discountCategory: (form: FormData) => withStore((store) => {
    requireAdmin();
    const categoryId = getFormNumber(form, "category_id");
    const percentage = getFormNumber(form, "percentage");
    store.products.filter((item) => item.category_id === categoryId).forEach((product) => {
      product.discount_price = Number((product.price * (1 - percentage / 100)).toFixed(2));
      product.discount_percentage = percentage;
      product.is_offer = true;
    });
    return { ok: true };
  }),
};

export const fileUrl = {
  productTemplate: "local-template",
  productsExport: "local-products",
  ordersExport: "local-orders",
};

export async function downloadAdminFile(path: string, filename: string) {
  requireAdmin();
  const store = readStore();
  if (path.includes("orders")) {
    exportCsv(filename, store.orders.map((order) => ({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      total_amount: order.total_amount,
      status: order.status,
    })));
    return;
  }
  if (path.includes("template")) {
    exportCsv(filename, [{ "اسم المنتج": "مثال منتج", "القسم": "رجالي", "السعر": 10, "الوصف": "وصف المنتج", "الصورة": "https://example.com/image.jpg" }]);
    return;
  }
  exportCsv(filename, store.products.map((product) => ({
    "اسم المنتج": product.name_ar,
    "القسم": product.category?.name_ar,
    "السعر": product.price,
    "السعر بعد الخصم": product.discount_price,
    "الوصف": product.description_ar,
    "الصورة": product.main_image,
  })));
}
