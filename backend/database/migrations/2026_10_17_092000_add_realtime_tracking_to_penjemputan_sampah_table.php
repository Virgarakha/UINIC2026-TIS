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
        Schema::table('penjemputan_sampah', function (Blueprint $table): void {
            $table->decimal('current_latitude', 10, 7)->nullable()->after('status_jemput');
            $table->decimal('current_longitude', 10, 7)->nullable()->after('current_latitude');
            $table->decimal('heading', 6, 2)->default(0)->after('current_longitude');
            $table->decimal('kecepatan_kmh', 5, 2)->default(0)->after('heading');
            $table->timestamp('waktu_update_lokasi')->nullable()->after('kecepatan_kmh');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penjemputan_sampah', function (Blueprint $table): void {
            $table->dropColumn([
                'current_latitude',
                'current_longitude',
                'heading',
                'kecepatan_kmh',
                'waktu_update_lokasi',
            ]);
        });
    }
};
