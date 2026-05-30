import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getToken } from "../api/client";

export function ProtectedRoute() {
  const location = useLocation();
  if (!getToken()) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

