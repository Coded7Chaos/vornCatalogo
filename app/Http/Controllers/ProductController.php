<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with(['variants.images', 'variants.sizes'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'piece' => 'required|string',
            'price' => 'required|string',
            'variants' => 'required|array',
            'variants.*.color_name' => 'required|string',
            'variants.*.color_hex' => 'required|string',
            'variants.*.sizes' => 'required|array',
        ]);

        return DB::transaction(function () use ($request) {
            $product = Product::create([
                'name' => $request->name,
                'piece' => $request->piece,
                'price' => $request->price,
                'description' => $request->description,
            ]);

            $this->saveVariants($product, $request->variants);

            return response()->json($product->load('variants.images', 'variants.sizes'), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'piece' => 'required|string',
            'price' => 'required|string',
            'variants' => 'required|array',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'piece' => $request->piece,
                'price' => $request->price,
                'description' => $request->description,
            ]);

            // Para simplificar la edición, eliminamos variantes antiguas y creamos las nuevas
            // Nota: En una app de producción real se compararían IDs, pero para este catálogo esto es seguro.
            foreach ($product->variants as $variant) {
                // Opcional: Podrías decidir no borrar las imágenes del disco aquí si se reutilizan
                $variant->sizes()->delete();
                $variant->images()->delete();
                $variant->delete();
            }

            $this->saveVariants($product, $request->variants);

            return response()->json($product->load('variants.images', 'variants.sizes'));
        });
    }

    private function saveVariants($product, $variantsData)
    {
        foreach ($variantsData as $vData) {
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'color_name' => $vData['color_name'],
                'color_hex' => $vData['color_hex'],
            ]);

            // Tallas
            foreach ($vData['sizes'] as $size) {
                ProductSize::create([
                    'product_variant_id' => $variant->id,
                    'size' => $size,
                ]);
            }

            // Imágenes
            if (isset($vData['images'])) {
                foreach ($vData['images'] as $imageItem) {
                    if ($imageItem instanceof \Illuminate\Http\UploadedFile) {
                        // Es una imagen nueva subida
                        $path = $imageItem->store('products', 'public');
                    } else {
                        // Es una imagen existente (URL o path)
                        $path = $imageItem;
                        // Limpiamos la URL si viene completa para guardar solo el path relativo
                        if (str_contains($path, '/storage/')) {
                            $path = explode('/storage/', $path)[1];
                        }
                    }
                    
                    ProductImage::create([
                        'product_variant_id' => $variant->id,
                        'path' => $path,
                    ]);
                }
            }
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        foreach ($product->variants as $variant) {
            foreach ($variant->images as $image) {
                Storage::disk('public')->delete($image->path);
            }
        }
        $product->delete();
        return response()->json(null, 204);
    }
}
