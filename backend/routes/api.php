<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LaporanController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| REST API Routes (v1)
|--------------------------------------------------------------------------
| Prefix: /api/v1
*/

// Authentication Endpoints
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::get('/mitra-pengepul', [AuthController::class, 'mitraPengepul'])->name('mitraPengepul');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});

// Waste Reporting & Geolocation Map Endpoints (Public + Optional Token)
Route::prefix('laporan')->name('laporan.')->group(function () {
    Route::get('/', [LaporanController::class, 'index'])->name('index');
    Route::get('/{id}', [LaporanController::class, 'show'])->name('show');
    Route::post('/', [LaporanController::class, 'store'])->name('store');
    Route::get('/{id}/tanggapan', [LaporanController::class, 'tanggapan'])->name('tanggapan.index');
    Route::post('/{id}/tanggapan', [LaporanController::class, 'storeTanggapan'])->name('tanggapan.store');
});

// Master & Environmental Public Feeds
Route::get('/kategori-sampah', [LaporanController::class, 'kategori'])->name('kategori.index');
Route::get('/tipe-tanggapan', [LaporanController::class, 'tipeTanggapan'])->name('tipeTanggapan.index');
Route::get('/peringatan-dini', [LaporanController::class, 'peringatanDini'])->name('peringatan.index');
Route::get('/katalog-hadiah', [LaporanController::class, 'katalogHadiah'])->name('hadiah.index');

// Pengepul Pickup & Verification Endpoints
Route::prefix('penjemputan')->name('penjemputan.')->group(function () {
    Route::post('/mulai', [LaporanController::class, 'mulaiPenjemputan'])->name('mulai');
    Route::post('/selesai', [LaporanController::class, 'selesaiPenjemputan'])->name('selesai');
    Route::post('/lokasi', [LaporanController::class, 'updateLokasi'])->name('lokasi');
    Route::post('/status-online', [LaporanController::class, 'updateStatusOnline'])->name('statusOnline');
    Route::get('/armada-aktif', [LaporanController::class, 'armadaAktif'])->name('armadaAktif');
    Route::post('/batal', [LaporanController::class, 'batalPenjemputan'])->name('batal');
});

// User Profile Update Endpoint (Supports auth or user_id for demo mode)
Route::post('/user/profile', [UserController::class, 'updateProfile'])->name('user.profile.update');

// Resource Endpoints (Authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});
