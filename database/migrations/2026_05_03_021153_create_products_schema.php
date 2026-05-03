<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $াবাহ) {
            $াবাহ->id();
            $াবাহ->string('name');
            $াবাহ->text('description')->nullable();
            $াবাহ->decimal('price', 8,2);
            $াবাহ->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $াবাহ) {
            $াবাহ->id();
            $াবাহ->foreignId('product_id')->constrained()->onDelete('cascade');
            $াবাহ->string('color_name');
            $াবাহ->string('color_hex');
            $াবাহ->timestamps();
        });

        Schema::create('product_images', function (Blueprint $াবাহ) {
            $াবাহ->id();
            $াবাহ->foreignId('product_variant_id')->constrained()->onDelete('cascade');
            $াবাহ->string('path'); // Ruta del archivo en el servidor
            $াবাহ->timestamps();
        });

        Schema::create('product_sizes', function (Blueprint $াবাহ) {
            $াবাহ->id();
            $াবাহ->foreignId('product_variant_id')->constrained()->onDelete('cascade');
            $াবাহ->string('size');
            $াবাহ->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('product_sizes');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};
