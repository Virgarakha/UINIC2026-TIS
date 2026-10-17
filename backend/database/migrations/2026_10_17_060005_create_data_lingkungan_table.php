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
        Schema::create('data_lingkungan', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporan_sampah')->cascadeOnDelete();
            $table->decimal('intensitas_hujan_mm', 5, 2)->default(0.00);
            $table->decimal('ketinggian_air_cm', 5, 2)->default(0.00);
            $table->decimal('kecepatan_arus_m_s', 4, 2)->default(0.00);
            $table->string('prakiraan_cuaca', 100)->nullable();
            $table->string('sumber_data', 50)->default('BMKG_SENSORS');
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index(['laporan_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_lingkungan');
    }
};
