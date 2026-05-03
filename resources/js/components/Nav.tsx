import { Search, ShoppingBag, User, Menu, SlidersHorizontal, X, Trash2, ArrowRight } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";
import { useAdmin } from "../admin/AdminStore";
import { useCart } from "../cart/CartStore";

interface NavProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  selectedSize?: string;
  onSizeChange?: (size: string) => void;
}

export function Nav({ searchQuery = "", onSearchChange, selectedSize = "", onSizeChange }: NavProps) {
  const { isAuthenticated } = useAdmin();
  const { totalItems, items, removeItem, updateQuantity } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const links = ["Colección", "Contáctanos"];
  const getLinkPath = (name: string) => {
    if (name === "Colección") return "/";
    if (name === "Contáctanos") return "/contactanos";
    return "#";
  };
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsSearchOpen(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    const phoneNumber = "59178768481";
    const subtotal = items.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
      return sum + (priceNum * item.quantity);
    }, 0);

    let message = "Hola! Quisiera confirmar el siguiente pedido:\n\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.colorName}) - Talla: ${item.size} - Cantidad: ${item.quantity}\n`;
    });
    
    const numSubtotal = Number(subtotal);

    const formattedSubtotal = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: numSubtotal % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
      useGrouping: false
    }).format(numSubtotal);

    message += `\n*Subtotal:* Bs. ${formattedSubtotal}\n\nMuchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-4">
      <div
        className="mx-auto flex items-center justify-between rounded-full border border-white/40 px-6 py-3 transition-all duration-500"
        style={{
          background: "rgba(250,250,252,0.97)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 40px rgba(20,20,40,0.06)",
        }}
      >
        <div className={`items-center gap-8 ${isSearchOpen ? "hidden md:flex" : "flex"}`}>
             <Logo className="h-5 w-auto text-neutral-900" />
  
      <nav className="hidden md:flex items-center gap-6">
               {links.map((l) => {
                 const isActive = (l === "Colección" && location.pathname === "/") ||
   location.pathname.includes(l.toLowerCase());
                 
                 return (
                   <Link
                     key={l}
                     to={getLinkPath(l)}
                     className={`group relative text-[13px] tracking-wide transition-colors ${
                        isActive ? "text-neutral-950 font-medium" : "text-neutral-700 hover:text-neutral-950"
                      }`}
                    >
                      {l}
                      {/* Pseudo-elemento animado */}
                      <span 
                        className={`absolute left-0 -bottom-1 h-px bg-neutral-900 transition-all duration-300
   ease-out ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  );
                })}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate("/admin")}
                    className={`group relative text-[13px] font-medium tracking-widest uppercase
      transition-colors ${
                      location.pathname.startsWith("/admin") ? "text-black" : "text-neutral-900 hover:text-black"
                    }`}
                  >
                    DASHBOARD
                    {/* Pseudo-elemento animado */}
                    <span 
                      className={`absolute left-0 -bottom-1 h-px bg-neutral-900 transition-all duration-300
   ease-out ${
                        location.pathname.startsWith("/admin") ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </button>
                )}
              </nav>


            </div>

        {/* Search & Actions Area */}
        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? "gap-3 pr-4 md:pr-2" : "gap-2 pr-1 md:pr-0"}`}>
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 210, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="Buscar..."
                    className="w-[60vw] md:w-[10vw] max-w-[300px] bg-transparent px-3 py-1 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <IconBtn onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </IconBtn>
          </div>

          <div className="relative">
            <IconBtn 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={selectedSize ? "bg-neutral-900 text-white hover:bg-neutral-800" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {selectedSize && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
              )}
            </IconBtn>
            
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/60 p-3 shadow-xl"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Filtrar por Talla</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          onSizeChange?.(size);
                          setIsFilterOpen(false);
                        }}
                        className={`rounded-lg py-2 text-[11px] font-bold transition flex items-center justify-center ${
                          selectedSize === size 
                            ? "bg-neutral-900 text-white" 
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <button 
                        onClick={() => {
                          onSizeChange?.("");
                          setIsFilterOpen(false);
                        }}
                        className="mt-3 w-full border-t border-neutral-100 pt-2 text-[10px] font-bold uppercase text-neutral-400 hover:text-neutral-600"
                    >
                        Limpiar filtro
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <IconBtn 
               onClick={() => navigate(isAuthenticated ? "/admin/profile" : "/admin/login")}
               className={isSearchOpen ? "hidden md:grid" : ""}
             >
               <User className="h-4 w-4" />
             </IconBtn>
             
             <IconBtn 
               onClick={() => setIsCartOpen(true)}
                className={isSearchOpen ? "hidden md:grid" : ""}
              >
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-neutral-900
                  text-[10px] text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </IconBtn>
          <IconBtn 
            className={isSearchOpen ? "hidden" : "md:hidden"}
            onClick={ () => setIsMenuOpen(true) }
          >
               <Menu className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>

      {/* Cart Modal / Slide Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] h-full w-full bg-white shadow-2xl md:w-[450px]"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-6 py-5">
                  <div>
                    <Logo className="h-4 w-auto text-neutral-900" />
                    <div className="mt-1.5 text-[9px] tracking-[0.35em] uppercase text-neutral-500">
                  {totalItems > 0
                    ? `${totalItems} ${totalItems === 1 ? "prenda seleccionada" : "prendas seleccionadas"}`
                    : "Tu selección"}
                </div>
                  </div>

                  <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-neutral-100 transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                      <ShoppingBag className="h-10 w-10 opacity-20 mb-4" />
                      <div className="text-[13px] uppercase tracking-widest">Tu bolsa está vacía</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.colorName}-${item.size}`} className="flex gap-4">
                          <div className="h-24 w-18 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col justify-between py-1">
                            <div>
                              <div className="flex items-start justify-between">
                                <div className="text-[14px] font-medium">{item.name}</div>
                                <div className="text-[13px] tabular-nums">
                                  Bs. {(() => {
                                    const cleanString = String(item.price).replace(/[^0-9.]/g, "");
                                    const price = Number(cleanString) * item.quantity;
                                    return new Intl.NumberFormat('en-US', {
                                      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
                                      maximumFractionDigits: 2,
                                      useGrouping: false
                                    }).format(price);
                                  })()}
                                </div>
                              </div>
                              <div className="mt-1 text-[11px] text-neutral-500 uppercase tracking-wider">
                                {item.colorName} · Talla {item.size}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              {/* Quantity Pill Selector */}
                              <div className="flex items-center rounded-full bg-neutral-100 p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.colorName, item.size, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900"
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    if (val) updateQuantity(item.id, item.colorName, item.size, parseInt(val));
                                    else if (e.target.value === "") updateQuantity(item.id, item.colorName, item.size, 0);
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === "" || e.target.value === "0") {
                                      removeItem(item.id, item.colorName, item.size);
                                    }
                                  }}
                                  className="h-7 w-10 bg-transparent text-center text-[12px] font-medium text-neutral-900 outline-none"
                                />
                                <button
                                  onClick={() => updateQuantity(item.id, item.colorName, item.size, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900"
                                >
                                  +
                                </button>
                              </div>

                              <button 
                                onClick={() => removeItem(item.id, item.colorName, item.size)}
                                className="text-neutral-400 hover:text-red-500 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t px-8 py-4 bg-neutral-50/30">
                    <div className=" mb-4 flex flex-col items-start gap-1">
                      <div className="leading-none text-[10px] font-light tracking-[0.2em] text-neutral-500 uppercase">Total Estimado</div>
                      <div className="leading-none text-[25px] font-semibold tabular-nums text-neutral-900">
                        Bs. {(() => {
                          const total = items.reduce((sum, item) => {
                            const cleanString = String(item.price).replace(/[^0-9.]/g, "");
                            const priceNum = Number(cleanString) || 0;
                            return sum + (priceNum * item.quantity);
                          }, 0);
                          
                          return new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: total % 1 === 0 ? 0 : 2,
                            maximumFractionDigits: 2,
                            useGrouping: false
                          }).format(total);
                        })()}
                      </div>
                    </div>
                
                    <button 
                      onClick={handleWhatsAppConfirm}
                      className="group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                      background:
                        "linear-gradient(135deg, #1a1a22 0%, #2a2a36 100%)",
                      boxShadow:
                        "0 4px 20px rgba(14,14,22,0.25), 0 1px 0 rgba(255,255,255,0.08) inset",
                    }}
                    >
                      <div className="text-left">
                      <div className="text-[9px] tracking-[0.3em] uppercase opacity-50">
                        Contactar · Sin compromiso
                      </div>
                      <div
                        className="mt-0.5"
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Confirmar por WhatsApp
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                        <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    </button>
                    <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-400">
                      Tu selección se enviará por WhatsApp para coordinar el pedido. Sin compromiso!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
         {/* Menú Lateral para Móviles */}
         <AnimatePresence>
           {isMenuOpen && (
             <>
               {/* Fondo borroso (Backdrop) */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm md:hidden"
                />
                {/* Panel Lateral (mitad de pantalla izquierda) */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 z-[90] h-full w-[65%] bg-white shadow-2xl md:hidden"
                >
                  <div className="flex h-full flex-col px-6 py-6">
                    <div className="flex items-center justify-between mb-10">
                      <Logo className="h-5 w-auto text-neutral-900" />
                      <button onClick={() => setIsMenuOpen(false)} className="rounded-full p-2
   hover:bg-neutral-100 transition">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
   
                    <nav className="flex flex-col gap-8 mt-4">
                      {links.map((l) => {
                        // Lógica para saber si es el link activo. 
                        // Asumimos que "Colección" es la ruta principal "/"
                        const isActive = (l === "Colección" && location.pathname === "/") || location.pathname.includes(l.toLowerCase());
                        
                        return (
                          <Link
                            key={l}
                            to={getLinkPath(l)}
                            onClick={() => setIsMenuOpen(false)}
                            className={`relative text-[15px] tracking-wide w-fit transition-colors ${
                              isActive ? "text-neutral-950 font-semibold" : "text-neutral-500 hover:text-neutral-950"
                            } after:absolute after:left-0 after:-bottom-1.5 after:h-[1.5px]
   after:bg-neutral-900 after:transition-all ${
                              isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                            }`}
                          >
                            {l}
                          </Link>
                        );
                      })}
                      
                      {isAuthenticated && (
                        <div className="mt-2 pt-8 border-t border-neutral-100">
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate("/admin");
                            }}
                            className={`relative text-[13px] font-bold tracking-widest uppercase transition-colors w-fit ${
                              location.pathname.startsWith("/admin") ? "text-black" : "text-neutral-400 hover:text-black"
                            } after:absolute after:left-0 after:-bottom-1.5 after:h-[1.5px] after:bg-neutral-900 after:transition-all ${
                              location.pathname.startsWith("/admin") ? "after:w-full" : "after:w-0 hover:after:w-full"
                            }`}
                          >
                            Dashboard
                          </button>
                        </div>
                      )}
                    </nav>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

    </header>
  );
}

function IconBtn({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative grid h-9 w-9 place-items-center rounded-full text-neutral-800 hover:bg-white/70 transition ${className}`}
    >
      {children}
    </button>
  );
}
