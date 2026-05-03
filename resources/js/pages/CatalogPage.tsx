import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "../components/Nav";
import { LookSection } from "../components/LookSection";
import { Marquee } from "../components/Marquee";
import { Orb } from "../components/Orb";
import { useAdmin } from "../admin/AdminStore";

export function CatalogPage() {
  const { products } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

const filteredProducts = useMemo(() => {
  return products
    .map((product) => {
      if (selectedSize === "") return product;
    
      const matchingVariants = product.variants.filter((v) =>
        (v.sizes || []).includes(selectedSize)
      );
  
      return { ...product, variants: matchingVariants };
    })
    .filter((product) => {
      // Verificamos que coincida con el texto de búsqueda
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
   
            // Solo aprobamos el producto si quedó con al menos 1 variante
          const hasVariants = product.variants.length > 0;
   
            return matchesSearch && hasVariants;
          });
      }, [products, searchQuery, selectedSize]);

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden text-neutral-900"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% 20%, #ffffff 0%, #f4f5f7 45%, #e8eaee 100%)",
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <Orb className="-top-24 -left-24" size={380} />
        <Orb className="top-[40%] -right-32" size={480} delay={3} />
        <Orb className="bottom-[-10%] left-[10%]" size={380} delay={6} />
      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <Nav 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
      />

      <main
        className="relative h-[100svh] w-full overflow-x-hidden overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {filteredProducts.map((look, i) => (
          <LookSection key={look.id} look={look} index={i} total={filteredProducts.length} />
        ))}

        {filteredProducts.length === 0 && (
            <section className="flex h-screen items-center justify-center flex-col gap-4 text-neutral-400">
                <div className="italic">No se encontraron prendas con esos criterios</div>
                <button 
                    onClick={() => { setSearchQuery(""); setSelectedSize(""); }}
                    className="text-[11px] uppercase tracking-widest text-neutral-900 border-b border-neutral-900"
                >
                    Limpiar filtros
                </button>
            </section>
        )}

        <section
          className="relative border-t border-neutral-200/60 py-6"
          style={{ scrollSnapAlign: "start" }}
        >
          <Marquee
            items={[
              "VØRN · COLECCIÓN 2026",
              "BEYOND TRENDS",
              "TAILORED FIT",
              "ENVÍOS A TODO EL PAÍS",
              "ATENCIÓN PERSONAL",
            ]}
          />
        </section>

        <section className="relative mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <div className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
                Colección · 2026
              </div>
              <div className="flex flex-col gap-5">
  {/* Título Principal */}
  <h2 
    className="font-medium tracking-[-0.03em] leading-[1.05] text-neutral-900"
    style={{ fontSize: "clamp(28px, 5vw, 52px)" }}
  >
    <span className="block text-neutral-400">No seguimos tendencias.</span>
    <span className="block">Custodiamos el estilo.</span>
  </h2>

  {/* Párrafo de descripción */}
  <p className="max-w-md text-[15px] leading-relaxed text-neutral-600">
    <strong className="font-medium text-neutral-900">VØRN</strong> es un estudio de contención y elegancia. Piezas seleccionadas bajo un estándar absoluto de excelencia, terminadas con un cuidado obsesivo.
  </p>
</div>
              {/* <h2
                className="mt-4"
                style={{
                  fontSize: "clamp(32px, 7vw, 64px)",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >No seguimos</h2>
              <h2
                className="mt-4"
                style={{
                  fontSize: "clamp(32px, 7vw, 64px)",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                 TENDENCIAS.
                <br />
                Custodiamos el estilo.
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-neutral-600">
                VØRN is a study in restraint — garments cut from a single idea,
                finished with obsessive care.
              </p> */}
            </div>
            <div className="flex items-center gap-3">
              
              <button 
                onClick={() => navigate('/contactanos')}
                className="rounded-full bg-neutral-900 px-4 py-2.5 text-[12px] tracking-wide text-white transition hover:bg-neutral-700"
              >
                Contáctanos
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
