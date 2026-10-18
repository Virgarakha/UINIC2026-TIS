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
        Schema::table('users', function (Blueprint $table): void {
            $table->string('plat_nomor', 50)->nullable()->after('foto_profil');
            $table->string('jenis_kendaraan', 100)->nullable()->after('plat_nomor');
            $table->integer('kapasitas_muatan_kg')->nullable()->after('jenis_kendaraan');
            $table->string('no_whatsapp', 50)->nullable()->after('no_telepon');
            $table->text('alamat_posko')->nullable()->after('no_whatsapp');
            $table->string('area_operasional', 255)->nullable()->after('alamat_posko');
            $table->decimal('rating', 3, 2)->default(5.00)->after('area_operasional');
            $table->integer('total_ulasan')->default(0)->after('rating');
            $table->text('deskripsi_profil')->nullable()->after('total_ulasan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'plat_nomor',
                'jenis_kendaraan',
                'kapasitas_muatan_kg',
                'no_whatsapp',
                'alamat_posko',
                'area_operasional',
                'rating',
                'total_ulasan',
                'deskripsi_profil',
            ]);
        });
    }
};
