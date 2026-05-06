<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with(['variants.images', 'variants.sizes'])->get();
    }

    public function store(Request $request)
    {
        $this->validateProduct($request);

        return DB::transaction(function () use ($request) {
            $product = Product::create([
                'name' => $request->name,
                'price' => $this->cleanPrice($request->price),
                'description' => $request->description,
            ]);

            $this->saveVariants($product, $request->variants);

            return response()->json($product->load('variants.images', 'variants.sizes'), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $this->validateProduct($request);

        return DB::transaction(function () use ($request, $id) {
            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'price' => $this->cleanPrice($request->price),
                'description' => $request->description,
            ]);

            foreach ($product->variants as $variant) {
                $variant->sizes()->delete();
                $variant->images()->delete();
                $variant->delete();
            }

            $this->saveVariants($product, $request->variants);

            return response()->json($product->load('variants.images', 'variants.sizes'));
        });
    }

    private function cleanPrice($price)
    {
        if (is_numeric($price)) {
            return $price;
        }
        
        // Quitar "Bs.", espacios, y normalizar coma decimal a punto
        $cleaned = str_replace(['Bs.', ' ', ','], ['', '', '.'], $price);
        // Mantener solo números y el primer punto decimal
        $cleaned = preg_replace('/[^0-9.]/', '', $cleaned);
        
        return $cleaned ?: 0;
    }

    private function validateProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|string',
            'variants' => 'required|array',
            'variants.*.color_name' => 'required|string',
            'variants.*.color_hex' => 'required|string',
            'variants.*.sizes' => 'required|array',
        ]);
    }

    private function saveVariants($product, $variantsData)
    {
        foreach ($variantsData as $vData) {
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'color_name' => $vData['color_name'],
                'color_hex' => $vData['color_hex'],
            ]);

            foreach ($vData['sizes'] as $size) {
                ProductSize::create([
                    'product_variant_id' => $variant->id,
                    'size' => $size,
                ]);
            }

            if (isset($vData['images'])) {
                foreach ($vData['images'] as $imageItem) {
                    $path = null;
                    if ($imageItem instanceof \Illuminate\Http\UploadedFile) {
                        $path = $imageItem->store('products', 'public');
                    } else if (is_string($imageItem)) {
                        $path = $imageItem;
                        if (str_contains($path, '/storage/')) {
                            $path = explode('/storage/', $path)[1];
                        }
                    }
                    
                    if ($path) {
                        ProductImage::create([
                            'product_variant_id' => $variant->id,
                            'path' => $path,
                        ]);
                    }
                }
            }
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(null, 204);
    }
}
