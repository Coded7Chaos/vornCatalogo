import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Package,
  Check,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { useAdmin, AdminProduct, AdminVariant } from "./AdminStore";
import { toast } from "sonner";
import heic2any from "heic2any";

/* ─── helpers ─── */
const glassCard = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  boxShadow:
    "0 1px 0 rgba(255,255,255,0.85) inset, 0 8px 32px rgba(20,20,40,0.07)",
};

const processImage = async (file: File): Promise<string> => {
  console.log(`[ImageProcess] Iniciando procesamiento de: ${file.name} (${file.type}) - Tamaño: ${(file.size / 1024).toFixed(2)} KB`);
  let blob: Blob = file;

  // 1. Manejo de HEIC (iPhone)
  if (file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic") {
    console.log(`[ImageProcess] Detectado formato HEIC, convirtiendo...`);
    try {
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });
      blob = Array.isArray(converted) ? converted[0] : converted;
      console.log(`[ImageProcess] HEIC convertido a JPEG exitosamente.`);
    } catch (e) {
      console.error("[ImageProcess] Error al convertir HEIC:", e);
      throw new Error(`No se pudo procesar el formato HEIC de ${file.name}`);
    }
  }

  // 2. Conversión a WebP y compresión vía Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar para optimizar (crítico para Hostinger/Performance)
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
          console.log(`[ImageProcess] Redimensionando de ${img.width}x${img.height} a ${width}x${height}`);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No se pudo obtener el contexto del canvas");
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exportar a WebP con calidad 0.8 para balancear peso y calidad
        const webpData = canvas.toDataURL("image/webp", 0.8);
        console.log(`[ImageProcess] Conversión a WebP completada para ${file.name}. Final: ${(webpData.length / 1024).toFixed(2)} KB (Base64)`);
        resolve(webpData);
      };
      img.onerror = (err) => {
        console.error("[ImageProcess] Error cargando imagen en canvas:", err);
        reject(`Error al cargar los píxeles de ${file.name}`);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => {
      console.error("[ImageProcess] Error en FileReader:", err);
      reject(`Error de lectura en ${file.name}`);
    };
    reader.readAsDataURL(blob);
  });
};

const inputCls =
  "w-full rounded-xl border border-neutral-900/10 bg-white/80 px-3 py-2 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:bg-white";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* ─── Variant editor ─── */
function VariantEditor({
  variant,
  onChange,
  onRemove,
  canRemove,
}: {
  variant: AdminVariant;
  idx: number;
  onChange: (field: keyof AdminVariant, value: AdminVariant[keyof AdminVariant]) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSize = (size: string) => {
    const currentSizes = variant.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    onChange("sizes", newSizes);
  };

  const handleFiles = async (files: FileList | File[]) => {
    console.log(`[Upload] Iniciando procesamiento de ${files.length} archivos...`);
    const toastId = toast.loading("Procesando imágenes...");
    
    try {
      const processedImages: string[] = [];
      const fileArray = Array.from(files);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        console.log(`[Upload] Procesando archivo ${i + 1}/${fileArray.length}: ${file.name}`);
        
        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) {
          console.warn(`[Upload] Archivo omitido (formato no soportado): ${file.name}`);
          continue;
        }

        try {
          const webpBase64 = await processImage(file);
          processedImages.push(webpBase64);
        } catch (err) {
          console.error(`[Upload] Error procesando ${file.name}:`, err);
        }
      }

      const currentImages = variant.images || [];
      // Filtrar duplicados exactos para evitar problemas con las llaves de React y Reorder
      const uniqueNewImages = processedImages.filter(newImg => !currentImages.includes(newImg));
      
      const spaceLeft = 6 - currentImages.length;
      const imagesToAdd = uniqueNewImages.slice(0, spaceLeft);

      if (imagesToAdd.length > 0) {
        onChange("images", [...currentImages, ...imagesToAdd]);
        toast.success(`${imagesToAdd.length} imágenes añadidas correctamente.`, { id: toastId });
        console.log(`[Upload] Finalizado: ${imagesToAdd.length} imágenes añadidas al estado.`);
      } else {
        if (processedImages.length > 0 && spaceLeft <= 0) {
          toast.error("Límite de 6 imágenes alcanzado para esta variante.", { id: toastId });
          console.warn("[Upload] No se añadieron imágenes: límite alcanzado.");
        } else {
          toast.dismiss(toastId);
          console.warn("[Upload] No se procesaron imágenes válidas o estaban duplicadas.");
        }
      }
    } catch (error: any) {
      console.error("[Upload] Error crítico en handleFiles:", error);
      toast.error("Ocurrió un error al procesar las imágenes.", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log("[DragDrop] Evento soltar detectado. Verificando archivos...");
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log(`[DragDrop] ${e.dataTransfer.files.length} archivos detectados.`);
      handleFiles(e.dataTransfer.files);
    } else {
      console.warn("[DragDrop] No se detectaron archivos en el evento drop.");
    }
  };

  const removeImage = (imgIdx: number) => {
    console.log(`[Image] Eliminando imagen en índice: ${imgIdx}`);
    const currentImages = variant.images || [];
    onChange("images", currentImages.filter((_, i) => i !== imgIdx));
  };

  const reorderImages = (newOrder: string[]) => {
    console.log("[Reorder] Nuevo orden aplicado a las imágenes:", newOrder.length, "elementos.");
    onChange("images", newOrder);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-300 p-4 ${
        isDragging ? "border-neutral-900 bg-neutral-900/5 ring-4 ring-neutral-900/10" : "border-neutral-900/8 bg-white/55"
      }`}
      onDragOver={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(true); 
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={variant.color}
            onChange={(e) => onChange("color", e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border border-neutral-200 p-0.5"
            title="Color"
          />
          <input
            type="text"
            value={variant.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nombre del color (ej. Onyx)"
            className={`${inputCls} w-40`}
          />
        </div>

        {canRemove && (
          <button
            onClick={onRemove}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-neutral-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <X className="h-3 w-3" />
            Eliminar variante
          </button>
        )}
      </div>

      {/* Sizes Selection */}
      <div className="mb-4">
        <div className="mb-2 text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Tallas disponibles
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`min-w-[40px] rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
                (variant.sizes || []).includes(size)
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Images Section */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-3 w-3 text-neutral-400" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">
              Imágenes {isDragging ? "(Suelta aquí)" : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] text-neutral-600 hover:bg-neutral-200 transition"
          >
            <Upload className="h-3 w-3" />
            Subir múltiples
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.heic"
            className="hidden"
          />
        </div>

        <Reorder.Group
          axis="x"
          values={variant.images || []}
          onReorder={reorderImages}
          className="flex flex-wrap gap-2"
        >
          {(variant.images || []).map((img, imgIdx) => (
            <Reorder.Item
              key={img}
              value={img}
              className="group relative h-20 w-16 cursor-grab active:cursor-grabbing overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
            >
              <img src={img} className="h-full w-full object-cover pointer-events-none" alt="Preview" />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(imgIdx); }}
                className="absolute right-1 top-1 z-10 rounded-full bg-white/95 p-1 text-red-500 shadow-sm transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Reorder.Item>
          ))}
          {(!variant.images || variant.images.length === 0) && (
            <div className="flex h-20 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-300">
               <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </Reorder.Group>
        <div className="mt-2 text-[9px] text-neutral-400 italic">
          Tip: Arrastra archivos aquí o mueve las fotos para cambiar su orden.
        </div>
      </div>
    </div>
  );
}

/* ─── Inline edit form ─── */
function ProductEditForm({
  product,
  onChange,
  onSave,
  onCancel,
  onDelete,
  isNew,
}: {
  product: AdminProduct;
  onChange: (updated: AdminProduct) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isNew: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setField = (field: keyof AdminProduct, value: string) => {
    onChange({ ...product, [field]: value });
  };

  const updateVariant = (
    variantIdx: number,
    field: keyof AdminVariant,
    value: AdminVariant[keyof AdminVariant]
  ) => {
    const variants = product.variants.map((v, i) =>
      i === variantIdx ? { ...v, [field]: value } : v
    );
    onChange({ ...product, variants });
  };

  const removeVariant = (variantIdx: number) => {
    onChange({ ...product, variants: product.variants.filter((_, i) => i !== variantIdx) });
  };

  const addVariant = () => {
    onChange({
      ...product,
      variants: [
        ...product.variants,
        { name: "", color: "#e5e5e5", images: [], sizes: [] },
      ],
    });
  };

  return (
    <div className="border-t border-neutral-900/6 px-5 py-5">
      {/* Product fields */}
      <div className="mb-6">
        <div className="mb-3 text-[10px] tracking-[0.28em] uppercase text-neutral-500 font-semibold">
          Información General
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Nombre de la prenda</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ej. Atlas Overcoat"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Precio</label>
              <input
                type="text"
                value={product.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="Bs. 0.00"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="mb-3 text-[10px] tracking-[0.28em] uppercase text-neutral-500 font-semibold">
          Variantes y Tallas
        </div>
        <div className="flex flex-col gap-4">
          {product.variants.map((v, vi) => (
            <VariantEditor
              key={vi}
              variant={v}
              idx={vi}
              onChange={(field, value) => updateVariant(vi, field, value)}
              onRemove={() => removeVariant(vi)}
              canRemove={product.variants.length > 1}
            />
          ))}
        </div>
        <button
          onClick={addVariant}
          className="mt-3.5 flex items-center gap-1.5 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-[12px] text-neutral-600 hover:border-neutral-400 hover:bg-white/60 transition w-full justify-center"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir nueva variante de color
        </button>
      </div>

      {/* Action row */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900/6 pt-5">
        {!isNew && (
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[12px] text-red-600">¿Confirmas la eliminación?</span>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] text-white hover:bg-red-700 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[12px] text-neutral-500 hover:text-neutral-800 transition"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar prenda
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onCancel}
            className="rounded-xl border border-neutral-900/10 px-5 py-2.5 text-[12px] text-neutral-600 hover:bg-neutral-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-6 py-2.5 text-[12px] text-white hover:bg-neutral-700 transition shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            {isNew ? "Crear prenda" : "Actualizar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Product Row ─── */
function ProductRow({
  product,
  isExpanded,
  onToggle,
  onSave,
  onDelete,
}: {
  product: AdminProduct;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (updated: AdminProduct) => void;
  onDelete: () => void;
}) {
  const [editState, setEditState] = useState<AdminProduct>(() =>
    JSON.parse(JSON.stringify(product))
  );

  const thumb = product.variants[0]?.images?.[0];
  const allSizes = Array.from(new Set(product.variants.flatMap(v => v.sizes || []))).sort((a, b) => 
    AVAILABLE_SIZES.indexOf(a) - AVAILABLE_SIZES.indexOf(b)
  );

  return (
    <div className="border-b border-neutral-900/[0.05] last:border-b-0 transition-colors hover:bg-neutral-900/[0.01]">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-5 text-left"
      >
        <div
          className="h-14 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-900/8 shadow-sm"
          style={{
            background: thumb
              ? `url(${thumb}) center/cover`
              : "rgba(0,0,0,0.05)",
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "-0.01em" }}>
              {product.name || "Nueva Prenda"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
                {product.variants.map((v, i) => (
                    <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full border border-white/50 shadow-sm"
                        style={{ background: v.color }}
                        title={v.name}
                    />
                ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {allSizes.map(s => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-bold">{s}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className="tabular-nums text-[14px] font-medium text-neutral-800">{product.price}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-semibold">
                {product.variants.length} variantes
            </div>
          </div>
          <div className="text-neutral-400">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ProductEditForm
              product={editState}
              onChange={setEditState}
              onSave={() => onSave(editState)}
              onCancel={() => {
                setEditState(JSON.parse(JSON.stringify(product)));
                onToggle();
              }}
              onDelete={onDelete}
              isNew={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main component ─── */
export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<AdminProduct | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleAddProduct = () => {
    setExpandedId(null);
    const blank: AdminProduct = {
      id: `new-${Date.now()}`,
      name: "",
      price: "Bs. 0",
      variants: [{ name: "", color: "#e5e5e5", images: [], sizes: [] }],
      totalSales: 0,
      totalViews: 0,
    };
    setNewProduct(blank);
  };

  const handleSaveNew = (updated: AdminProduct) => {
    addProduct(updated);
    setNewProduct(null);
  };

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setNewProduct(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <div className="text-[10px] tracking-[0.32em] uppercase text-neutral-500 font-bold">
            VØRN · Dashboard
          </div>
          <h1
            className="mt-1"
            style={{ fontSize: "24px", fontWeight: 500, letterSpacing: "-0.03em" }}
          >
            Gestión de Productos
          </h1>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[12px] font-medium text-white hover:bg-neutral-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva Prenda
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar prendas por nombre..."
          className="w-full rounded-2xl border border-white/60 py-3.5 pl-11 pr-4 text-[14px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white/90"
          style={{
            background: "rgba(255,255,255,0.62)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* New product form */}
      <AnimatePresence>
        {newProduct && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-neutral-900/10 overflow-hidden"
            style={glassCard}
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-900/6 bg-neutral-900/[0.02]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-600 font-bold">
                Nueva Prenda
              </span>
            </div>
            <ProductEditForm
              product={newProduct}
              onChange={setNewProduct}
              onSave={() => handleSaveNew(newProduct)}
              onCancel={() => setNewProduct(null)}
              onDelete={() => setNewProduct(null)}
              isNew
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products list */}
      <div
        className="overflow-hidden rounded-2xl border border-white/60"
        style={glassCard}
      >
        <div className="flex items-center justify-between border-b border-neutral-900/6 px-5 py-4 bg-neutral-900/[0.01]">
          <div className="text-[10px] tracking-[0.28em] uppercase text-neutral-500 font-bold">
            Catálogo: {filteredProducts.length} prendas
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-neutral-400">
            <Package className="h-12 w-12 opacity-20" />
            <div className="text-[14px]">
              {searchQuery
                ? `Sin resultados para "${searchQuery}"`
                : "Aún no has añadido ninguna prenda"}
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isExpanded={expandedId === product.id}
              onToggle={() => handleToggle(product.id)}
              onSave={(updated) => {
                updateProduct(updated);
                setExpandedId(null);
              }}
              onDelete={() => {
                deleteProduct(product.id);
                setExpandedId(null);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
