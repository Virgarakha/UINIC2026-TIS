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
        Schema::create('peringatan_dini', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporan_sampah')->cascadeOnDelete();
            $table->string('level_peringatan', 20)->default('WASPADA'); // WASPADA, SIAGA, AWAS
            $table->integer('radius_terdampak_meter')->default(500);
            $table->text('pesan_broadcast');
            $table->boolean('status_aktif')->default(true);
            $table->timestamp('waktu_broadcast')->useCurrent();
            $table->timestamp('waktu_kedaluwarsa')->nullable();
            $table->timestamps();

            $table->index(['status_aktif', 'level_peringatan']);
            $table->index('waktu_broadcast');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peringatan_dini');
    }
};
