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
        Schema::create('penjemputan_sampah', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporan_sampah')->cascadeOnDelete();
            $table->foreignId('pengepul_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status_jemput', 30)->default('klaim'); // klaim, menuju_lokasi, selesai, dibatalkan
            $table->decimal('timbangan_riil_kg', 8, 2)->nullable();
            $table->string('foto_bukti_bersih_url', 500)->nullable();
            $table->timestamp('waktu_klaim')->useCurrent();
            $table->timestamp('waktu_selesai')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['pengepul_id', 'status_jemput']);
            $table->index('status_jemput');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjemputan_sampah');
    }
};
