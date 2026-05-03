import { createBrowserRouter, Navigate } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminProfile } from "./admin/AdminProfile";
import { ContactPage } from "./pages/ContactPage";
import { AppLayout } from "./components/AppLayout";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <CatalogPage />,
      },
      {
        path: "/contactanos",
        element: <ContactPage />,
      },
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },
      {
        path: "/admin/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/admin/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/admin/profile",
        element: <AdminProfile />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
