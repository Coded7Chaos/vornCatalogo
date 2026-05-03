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
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    });
});

// Esta es la ruta a la que apunta el correo electrónico (FUERA DE API)
Route::get('/admin/reset-password', function () {
    return view('app');
})->name('password.reset');

Route::get('/fix-storage', function () {
    try {
        if (file_exists(public_path('storage'))) {
            rename(public_path('storage'), public_path('storage_old_' . time()));
        }
        
        Artisan::call('storage:link');
        return 'Storage link created successfully.';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
