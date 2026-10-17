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
        // 1. Katalog Hadiah
        Schema::create('katalog_hadiah', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori_hadiah')->nullOnDelete();
            $table->string('nama_hadiah', 150);
            $table->text('deskripsi')->nullable();
            $table->integer('poin_dibutuhkan');
            $table->integer('stok')->default(0);
            $table->string('foto_hadiah_url', 500)->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->index(['is_aktif', 'poin_dibutuhkan']);
        });

        // 2. Penukaran Hadiah (Redemption)
        Schema::create('penukaran_hadiah', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('hadiah_id')->nullable()->constrained('katalog_hadiah')->nullOnDelete();
            $table->foreignId('alamat_id')->nullable()->constrained('alamat_pengguna')->nullOnDelete();
            $table->integer('poin_digunakan');
            $table->string('status_pengiriman', 30)->default('menunggu_konfirmasi'); // menunggu_konfirmasi, diproses, dikirim, selesai, dibatalkan
            $table->string('no_resi', 100)->nullable();
            $table->jsonb('alamat_pengiriman_snapshot')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status_pengiriman']);
            $table->index('status_pengiriman');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penukaran_hadiah');
        Schema::dropIfExists('katalog_hadiah');
    }
};
