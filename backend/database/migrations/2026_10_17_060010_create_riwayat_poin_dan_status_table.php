<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Riwayat Poin
        Schema::create('riwayat_poin', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('jumlah_poin'); // positif untuk masuk, negatif atau dicatat lewat jenis_transaksi
            $table->string('jenis_transaksi', 20); // masuk, keluar
            $table->string('referensi_tipe', 50)->nullable(); // laporan_sampah, penukaran_hadiah, bonus
            $table->unsignedBigInteger('referensi_id')->nullable();
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        // 2. Riwayat Status Laporan (Audit Trail)
        Schema::create('riwayat_status_laporan', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporan_sampah')->cascadeOnDelete();
            $table->foreignId('status_lama_id')->nullable()->constrained('status_laporan')->nullOnDelete();
            $table->foreignId('status_baru_id')->nullable()->constrained('status_laporan')->nullOnDelete();
            $table->foreignId('diubah_oleh_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['laporan_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_status_laporan');
        Schema::dropIfExists('riwayat_poin');
    }
};
