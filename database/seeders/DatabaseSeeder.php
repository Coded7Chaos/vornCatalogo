<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpieza fuera de la transacción (TRUNCATE hace commit implícito)
        Schema::disableForeignKeyConstraints();
        User::truncate();
        ProductSize::truncate();
        ProductImage::truncate();
        ProductVariant::truncate();
        Product::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Poblar datos dentro de la transacción
        DB::transaction(function () {
            // Crear usuario administrador
            User::create([
                'name' => 'Nicole',
                'email' => 'mila.eloc@gmail.com',
                'password' => Hash::make('NicoleRodas'),
            ]);

            User::create([
                'name' => 'Jeziel',
                'email' => 'jeziel.carrillo@gmail.com',
                'password' => Hash::make('JezielCarrillo'),
            ]);

            // 1. Atlas Overcoat
            $p1 = Product::create([
                'name' => 'Atlas Overcoat',
                'price' => '2480',
                'description' => 'Abrigo largo confeccionado en mezcla de lana y cashmere.',
            ]);

            $v1_1 = ProductVariant::create([
                'product_id' => $p1->id,
                'color_name' => 'Verde Saco',
                'color_hex' => '#4a5d4e',
            ]);
            $this->addSizes($v1_1, ['S', 'M', 'L', 'XL']);
            $this->addImage($v1_1, 'products/saco_verde.png');
            $this->addImage($v1_1, 'products/sv_delante.png');
            $this->addImage($v1_1, 'products/sv_atras.png');

            // 2. Linear Trouser
            $p2 = Product::create([
                'name' => 'Linear Trouser',
                'price' => '840',
                'description' => 'Pantalón de sastre con caída fluida.',
            ]);

            $v2_1 = ProductVariant::create([
                'product_id' => $p2->id,
                'color_name' => 'Azul Polera',
                'color_hex' => '#3a4a5d',
            ]);
            $this->addSizes($v2_1, ['S', 'M']);
            $this->addImage($v2_1, 'products/polera_azul.png');
            $this->addImage($v2_1, 'products/polera_azul_delantera.png');
            $this->addImage($v2_1, 'products/polera_azul_trasera.png');

            // 3. Void Shirt
            $p3 = Product::create([
                'name' => 'Void Shirt',
                'price' => '420',
                'description' => 'Camisa de popelín de algodón orgánico.',
            ]);

            $v3_1 = ProductVariant::create([
                'product_id' => $p3->id,
                'color_name' => 'Plomo',
                'color_hex' => '#7a7a7a',
            ]);
            $this->addSizes($v3_1, ['M', 'L', 'XL']);
            $this->addImage($v3_1, 'products/polera_ploma.png');
            $this->addImage($v3_1, 'products/polera_ploma_adelante.png');
            $this->addImage($v3_1, 'products/polera_ploma_atras.png');

            // 4. Basalt Knit
            $p4 = Product::create([
                'name' => 'Basalt Knit',
                'price' => '960',
                'description' => 'Jersey de punto grueso en lana merino.',
            ]);

            $v4_1 = ProductVariant::create([
                'product_id' => $p4->id,
                'color_name' => 'SR',
                'color_hex' => '#5d5d5a',
            ]);
            $this->addSizes($v4_1, ['S', 'M', 'L']);
            $this->addImage($v4_1, 'products/sr_normal.png');
            $this->addImage($v4_1, 'products/sr_delantera.png');
            $this->addImage($v4_1, 'products/sr_atras.png');

            // 5. Uno Collection
            $p5 = Product::create([
                'name' => 'Uno Tee',
                'price' => '120',
                'description' => 'Camiseta de algodón pesado.',
            ]);

            $v5_1 = ProductVariant::create([
                'product_id' => $p5->id,
                'color_name' => 'Uno',
                'color_hex' => '#d1d1d1',
            ]);
            $this->addSizes($v5_1, ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
            $this->addImage($v5_1, 'products/uno.png');
            $this->addImage($v5_1, 'products/uno_frente.png');
            $this->addImage($v5_1, 'products/uno_espalda.png');
        });
    }

    private function addSizes($variant, $sizes)
    {
        foreach ($sizes as $size) {
            ProductSize::create([
                'product_variant_id' => $variant->id,
                'size' => $size,
            ]);
        }
    }

    private function addImage($variant, $path)
    {
        ProductImage::create([
            'product_variant_id' => $variant->id,
            'path' => $path,
        ]);
    }
}
