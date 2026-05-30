import type { AdminStats, Category, CustomPage, LogoState, Order, Product, ProductListResponse } from "../types";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export function assetUrl(url?: string | null): string {
  if (!url) return "/ghaleb-logo-transparent.png";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_URL}${url}`;
}

export function getToken(): string | null {
  return localStorage.getItem("ghaleb_admin_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("ghaleb_admin_token", token);
  else localStorage.removeItem("ghaleb_admin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      message = await response.text();
    }
    throw new Error(Array.isArray(message) ? message.map((item) => item.msg).join(", ") : message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getLogo: () => request<LogoState>("/settings/logo"),
  getCategories: () => request<Category[]>("/categories"),
  getProducts: (params = "") => request<ProductListResponse>(`/products${params}`),
  getProduct: (identifier: string | number) => request<Product>(`/products/${identifier}`),
  getPages: () => request<CustomPage[]>("/pages"),
  getPage: (slug: string) => request<CustomPage>(`/pages/${slug}`),
  createOrder: (payload: unknown) => request<Order>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (orderNumber: string) => request<Order>(`/orders/${orderNumber}`),
  login: (email: string, password: string) => request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<{ email: string; full_name: string }>("/auth/me"),
  stats: () => request<AdminStats>("/admin/stats"),
  adminOrders: (params = "") => request<Order[]>(`/admin/orders${params}`),
  updateOrderStatus: (id: number, status: string) => request<Order>(`/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  cancelOrder: (id: number) => request<Order>(`/admin/orders/${id}/cancel`, { method: "PUT" }),
  createProduct: (payload: unknown) => request<Product>("/admin/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id: number, payload: unknown) => request<Product>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id: number) => request(`/admin/products/${id}`, { method: "DELETE" }),
  createCategory: (payload: unknown) => request<Category>("/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id: number, payload: unknown) => request<Category>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id: number) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  createPage: (payload: unknown) => request<CustomPage>("/admin/pages", { method: "POST", body: JSON.stringify(payload) }),
  updatePage: (id: number, payload: unknown) => request<CustomPage>(`/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePage: (id: number) => request(`/admin/pages/${id}`, { method: "DELETE" }),
  media: () => request("/admin/media"),
  uploadMedia: (form: FormData) => request("/admin/media/upload", { method: "POST", body: form }),
  deleteMedia: (id: number) => request(`/admin/media/${id}`, { method: "DELETE" }),
  uploadLogo: (form: FormData) => request<LogoState>("/admin/logo/upload", { method: "POST", body: form }),
  logoPreview: () => request<LogoState>("/admin/logo/preview"),
  confirmLogo: () => request<LogoState>("/admin/logo/confirm", { method: "POST" }),
  importProducts: (form: FormData) => request("/admin/import/products/excel", { method: "POST", body: form }),
  discountProduct: (form: FormData) => request("/admin/discounts/product", { method: "POST", body: form }),
  discountCategory: (form: FormData) => request("/admin/discounts/category", { method: "POST", body: form }),
};

export const fileUrl = {
  productTemplate: `${API_URL}/admin/excel/template`,
  productsExport: `${API_URL}/admin/export/products/excel`,
  ordersExport: `${API_URL}/admin/orders/export/excel`,
};

export async function downloadAdminFile(path: string, filename: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}
