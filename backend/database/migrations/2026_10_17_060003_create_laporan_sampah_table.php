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
        Schema::create('laporan_sampah', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori_sampah')->nullOnDelete();
            $table->foreignId('status_id')->default(1)->constrained('status_laporan')->restrictOnDelete();
            $table->text('foto_url');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('alamat_lokasi')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_resiko_banjir')->default(false);
            $table->integer('poin_diberikan')->default(0);
            $table->integer('total_tanggapan')->default(0);
            $table->integer('total_foto_tambahan')->default(0);
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
            $table->index('status_id');
            $table->index('kategori_id');
            $table->index('is_resiko_banjir');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_sampah');
    }
};
