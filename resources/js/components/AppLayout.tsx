import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/sonner";

export function AppLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
