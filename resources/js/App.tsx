import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AdminProvider } from "./admin/AdminStore";
import { CartProvider } from "./cart/CartStore";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AdminProvider>
  );
}