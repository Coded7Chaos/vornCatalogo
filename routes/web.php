<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;

Route::prefix('api')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    
    // Auth routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth-check', [AuthController::class, 'check']);
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Protected routes
    Route::middleware('auth')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::post('/products/{id}', [ProductController::class, 'update']); // Usamos POST para soportar multipart/form-data con imágenes
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    });
});

// Esta es la ruta a la que apunta el correo electrónico (FUERA DE API)
Route::get('/admin/reset-password', function () {
    return view('app');
})->name('password.reset');

Route::get('/fix-storage', function () {
    $target = storage_path('app/public');
    $productsDir = $target . '/products';
    $link = public_path('storage');

    if (!file_exists($productsDir)) {
        mkdir($productsDir, 0775, true);
    }

    try {
        if (file_exists($link)) {
            if (is_link($link)) {
                unlink($link);
            } else {
                rename($link, $link . '_old_' . time());
            }
        }

        if (symlink($target, $link)) {
            return 'Éxito: Carpeta products creada y Enlace simbólico vinculado.';
        } else {
            return 'Fallo al vincular symlink.';
        }
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/view-logs', function () {
    $path = storage_path('logs/laravel.log');
    if (!file_exists($path)) {
        return 'No hay logs todavía.';
    }
    
    // Leemos las últimas 100 líneas
    $file = file($path);
    $lines = array_slice($file, -100);
    
    return '<pre>' . implode('', $lines) . '</pre>';
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
