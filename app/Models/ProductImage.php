<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = ['product_variant_id', 'path'];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // Accessor para obtener la URL completa de la imagen
    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }
    
    protected $appends = ['url'];
}
