<?php

use App\Http\Controllers\Admin\AnalisisAiController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HadiahController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\PenjemputanController;
use App\Http\Controllers\Admin\PenukaranController;
use App\Http\Controllers\Admin\PeringatanDiniController;
use App\Http\Controllers\Admin\PetaController;
use App\Http\Controllers\Admin\RiwayatPoinController;
use App\Http\Controllers\Admin\TanggapanController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Dashboard Routes
|--------------------------------------------------------------------------
| Prefix: /admin
| Name Prefix: admin.
*/

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

// 1. MAIN
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/peta', [PetaController::class, 'index'])->name('peta.index');
Route::get('/peta/markers', [PetaController::class, 'markers'])->name('peta.markers');

// 2. OPERASIONAL & LAPORAN
Route::controller(LaporanController::class)->prefix('laporan')->name('laporan.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{laporan}', 'show')->name('show');
    Route::put('/{laporan}', 'update')->name('update');
    Route::delete('/{laporan}', 'destroy')->name('destroy');
});

Route::get('/tanggapan', [TanggapanController::class, 'index'])->name('tanggapan.index');
Route::get('/analisis-ai', [AnalisisAiController::class, 'index'])->name('analisis-ai.index');

// 3. TANGGAP DARURAT & PENJEMPUTAN
Route::controller(PeringatanDiniController::class)->prefix('peringatan-dini')->name('peringatan-dini.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
});

Route::get('/penjemputan', [PenjemputanController::class, 'index'])->name('penjemputan.index');

// 4. GAMIFIKASI & REWARDS
Route::controller(HadiahController::class)->prefix('hadiah')->name('hadiah.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
});

Route::controller(PenukaranController::class)->prefix('penukaran')->name('penukaran.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::put('/{penukaran}', 'update')->name('update');
});

Route::get('/riwayat-poin', [RiwayatPoinController::class, 'index'])->name('riwayat-poin.index');

// 5. DATA MASTER & PENGGUNA
Route::controller(UserController::class)->prefix('users')->name('users.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::get('/{user}/edit', 'edit')->name('edit');
    Route::put('/{user}', 'update')->name('update');
    Route::delete('/{user}', 'destroy')->name('destroy');
});

// 5 Micro-Tables Master Data Management (Full CRUD)
Route::controller(MasterDataController::class)->prefix('master')->name('master.')->group(function () {
    Route::get('/', 'index')->name('index');

    // 1. Kategori Sampah
    Route::post('/kategori-sampah', 'storeKategoriSampah')->name('kategori-sampah.store');
    Route::put('/kategori-sampah/{id}', 'updateKategoriSampah')->name('kategori-sampah.update');
    Route::delete('/kategori-sampah/{id}', 'destroyKategoriSampah')->name('kategori-sampah.destroy');

    // 2. Status Laporan
    Route::post('/status-laporan', 'storeStatusLaporan')->name('status-laporan.store');
    Route::put('/status-laporan/{id}', 'updateStatusLaporan')->name('status-laporan.update');
    Route::delete('/status-laporan/{id}', 'destroyStatusLaporan')->name('status-laporan.destroy');

    // 3. Jenis Sampah
    Route::post('/jenis-sampah', 'storeJenisSampah')->name('jenis-sampah.store');
    Route::put('/jenis-sampah/{id}', 'updateJenisSampah')->name('jenis-sampah.update');
    Route::delete('/jenis-sampah/{id}', 'destroyJenisSampah')->name('jenis-sampah.destroy');

    // 4. Kategori Hadiah
    Route::post('/kategori-hadiah', 'storeKategoriHadiah')->name('kategori-hadiah.store');
    Route::put('/kategori-hadiah/{id}', 'updateKategoriHadiah')->name('kategori-hadiah.update');
    Route::delete('/kategori-hadiah/{id}', 'destroyKategoriHadiah')->name('kategori-hadiah.destroy');

    // 5. Tipe Tanggapan
    Route::post('/tipe-tanggapan', 'storeTipeTanggapan')->name('tipe-tanggapan.store');
    Route::put('/tipe-tanggapan/{id}', 'updateTipeTanggapan')->name('tipe-tanggapan.update');
    Route::delete('/tipe-tanggapan/{id}', 'destroyTipeTanggapan')->name('tipe-tanggapan.destroy');
});
