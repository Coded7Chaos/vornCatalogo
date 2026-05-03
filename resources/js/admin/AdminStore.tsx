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

  const addProduct = async (product: AdminProduct) => {
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('piece', product.piece);
      formData.append('price', product.price);
      formData.append('description', product.description || '');

      product.variants.forEach((variant, vIdx) => {
        formData.append(`variants[${vIdx}][color_name]`, variant.name);
        formData.append(`variants[${vIdx}][color_hex]`, variant.color);
        variant.sizes.forEach((size, sIdx) => {
          formData.append(`variants[${vIdx}][sizes][${sIdx}]`, size);
        });
        
        // Handle images
        variant.images.forEach((img, iIdx) => {
          if (img.startsWith('data:image')) {
            // Convert base64 to file
            const byteString = atob(img.split(',')[1]);
            const mimeString = img.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            formData.append(`variants[${vIdx}][images][${iIdx}]`, blob, `image-${vIdx}-${iIdx}.png`);
          }
        });
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add product');
      await fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = async (product: AdminProduct) => {
    // Implement update logic if needed, for now just call add logic or similar
    // Laravel usually uses POST with _method=PUT for multipart/form-data
    console.log("Update not fully implemented in backend yet, but calling fetchProducts to sync");
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
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
