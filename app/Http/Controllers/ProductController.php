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
        // Retornamos todos los productos con sus variantes, imágenes y tallas
        return Product::with(['variants.images', 'variants.sizes'])->get();
    }

    public function store(Request $request)
    {
        // Validamos la entrada
        $request->validate([
            'name' => 'required|string',
            'piece' => 'required|string',
            'price' => 'required|string',
            'variants' => 'required|array',
            'variants.*.color_name' => 'required|string',
            'variants.*.color_hex' => 'required|string',
            'variants.*.sizes' => 'required|array',
            'variants.*.images' => 'required|array',
            'variants.*.images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120', // Máx 5MB por imagen
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Crear el producto
            $product = Product::create([
                'name' => $request->name,
                'piece' => $request->piece,
                'price' => $request->price,
                'description' => $request->description,
            ]);

            foreach ($request->variants as $variantData) {
                // 2. Crear la variante
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'color_name' => $variantData['color_name'],
                    'color_hex' => $variantData['color_hex'],
                ]);

                // 3. Guardar tallas
                foreach ($variantData['sizes'] as $size) {
                    ProductSize::create([
                        'product_variant_id' => $variant->id,
                        'size' => $size,
                    ]);
                }

                // 4. Subir y guardar imágenes
                if (isset($variantData['images'])) {
                    foreach ($variantData['images'] as $imageFile) {
                        // Guardamos físicamente en storage/app/public/products
                        $path = $imageFile->store('products', 'public');
                        
                        ProductImage::create([
                            'product_variant_id' => $variant->id,
                            'path' => $path,
                        ]);
                    }
                }
            }

            return response()->json($product->load('variants.images', 'variants.sizes'), 201);
        });
    }
}
