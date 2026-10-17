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
        Schema::table('peringatan_dini', function (Blueprint $table): void {
            $table->string('tipe_bahaya', 60)->default('Banjir & Luapan Air')->after('level_peringatan');
            $table->index('tipe_bahaya');
        });

        Schema::table('laporan_sampah', function (Blueprint $table): void {
            $table->string('tipe_bahaya', 60)->nullable()->default('Banjir & Luapan Air')->after('is_resiko_banjir');
            $table->index('tipe_bahaya');
        });

        Schema::table('analisis_ai', function (Blueprint $table): void {
            $table->string('potensi_bahaya', 60)->nullable()->after('tingkat_resiko_banjir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peringatan_dini', function (Blueprint $table): void {
            $table->dropColumn('tipe_bahaya');
        });

        Schema::table('laporan_sampah', function (Blueprint $table): void {
            $table->dropColumn('tipe_bahaya');
        });

        Schema::table('analisis_ai', function (Blueprint $table): void {
            $table->dropColumn('potensi_bahaya');
        });
    }
};
