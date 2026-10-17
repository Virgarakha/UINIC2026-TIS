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
        // 1. Kategori Sampah
        Schema::create('kategori_sampah', function (Blueprint $table): void {
            $table->id();
            $table->string('nama', 100);
            $table->string('slug', 100)->unique();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_daur_ulang')->default(false);
            $table->timestamps();
        });

        // 2. Status Laporan
        Schema::create('status_laporan', function (Blueprint $table): void {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama', 100);
            $table->string('badge_color', 30)->default('secondary');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 3. Kategori Hadiah
        Schema::create('kategori_hadiah', function (Blueprint $table): void {
            $table->id();
            $table->string('nama', 100);
            $table->string('slug', 100)->unique();
            $table->string('icon', 50)->nullable();
            $table->timestamps();
        });

        // 4. Master Jenis Sampah
        Schema::create('master_jenis_sampah', function (Blueprint $table): void {
            $table->id();
            $table->string('nama', 100);
            $table->decimal('nilai_ekonomi_per_kg', 10, 2)->default(0.00);
            $table->boolean('dapat_didaur_ulang')->default(true);
            $table->timestamps();
        });

        // 5. Master Tipe Tanggapan
        Schema::create('master_tipe_tanggapan', function (Blueprint $table): void {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama', 100);
            $table->string('icon', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_tipe_tanggapan');
        Schema::dropIfExists('master_jenis_sampah');
        Schema::dropIfExists('kategori_hadiah');
        Schema::dropIfExists('status_laporan');
        Schema::dropIfExists('kategori_sampah');
    }
};
