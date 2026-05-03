import React, { createContext, useContext, useState, useEffect } from "react";

/* ─────────────────────────── Types ─────────────────────────── */

export type AdminVariant = {
  name: string;
  color: string;
  images: string[];
  sizes: string[];
};

export type AdminProduct = {
  id: string;
  name: string;
  piece: string;
  price: string;
  description?: string;
  variants: AdminVariant[];
  totalSales: number;
  totalViews: number;
};

export type SalesPoint = {
  month: string;
  revenue: number;
  units: number;
};

export type ViewsPoint = {
  month: string;
  views: number;
};

type AdminContextType = {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  products: AdminProduct[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: AdminProduct) => void;
  updateProduct: (product: AdminProduct) => void;
  deleteProduct: (id: string) => void;
  salesData: SalesPoint[];
  viewsData: ViewsPoint[];
};

/* ─────────────────────────── Constants ─────────────────────── */

export const MOCK_SALES_DATA: SalesPoint[] = [
  { month: "Nov '25", revenue: 18400, units: 12 },
  { month: "Dec '25", revenue: 34200, units: 23 },
  { month: "Jan '26", revenue: 22800, units: 15 },
  { month: "Feb '26", revenue: 28600, units: 19 },
  { month: "Mar '26", revenue: 41300, units: 27 },
  { month: "Apr '26", revenue: 38900, units: 25 },
];

export const MOCK_VIEWS_DATA: ViewsPoint[] = [
  { month: "Nov '25", views: 4820 },
  { month: "Dec '25", views: 8360 },
  { month: "Jan '26", views: 6140 },
  { month: "Feb '26", views: 7230 },
  { month: "Mar '26", views: 11480 },
  { month: "Apr '26", views: 9750 },
];

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth-check');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated) setUser(data.user);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      const transformedProducts = data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        piece: p.piece,
        price: p.price,
        description: p.description,
        totalSales: p.total_sales,
        totalViews: p.total_views,
        variants: p.variants.map((v: any) => ({
          name: v.color_name,
          color: v.color_hex,
          images: v.images.map((img: any) => img.url),
          sizes: v.sizes.map((s: any) => s.size)
        }))
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        }
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addProduct = (product: AdminProduct) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (product: AdminProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        products,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        salesData: MOCK_SALES_DATA,
        viewsData: MOCK_VIEWS_DATA,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
