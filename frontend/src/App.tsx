import { Route, Routes } from "react-router-dom";

import { AdminLayout } from "./components/AdminLayout";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminCategories } from "./dashboard/AdminCategories";
import { AdminDiscounts } from "./dashboard/AdminDiscounts";
import { AdminImportExport } from "./dashboard/AdminImportExport";
import { AdminLogin } from "./dashboard/AdminLogin";
import { AdminLogo } from "./dashboard/AdminLogo";
import { AdminMedia } from "./dashboard/AdminMedia";
import { AdminOrders } from "./dashboard/AdminOrders";
import { AdminPages } from "./dashboard/AdminPages";
import { AdminProducts } from "./dashboard/AdminProducts";
import { DashboardOverview } from "./dashboard/DashboardOverview";
import { AboutPage } from "./pages/AboutPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContactPage } from "./pages/ContactPage";
import { CustomPage } from "./pages/CustomPage";
import { HomePage } from "./pages/HomePage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductsPage } from "./pages/ProductsPage";

export function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/category/:slug" element={<ProductsPage />} />
        <Route path="/offers" element={<ProductsPage offersOnly />} />
        <Route path="/pages/:slug" element={<CustomPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="logo" element={<AdminLogo />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="import" element={<AdminImportExport />} />
        </Route>
      </Route>
    </Routes>
  );
}

