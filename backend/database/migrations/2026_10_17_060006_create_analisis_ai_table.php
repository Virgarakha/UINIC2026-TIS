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
        Schema::create('analisis_ai', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->unique()->constrained('laporan_sampah')->cascadeOnDelete();
            $table->decimal('estimasi_volume_m3', 6, 2)->default(0.00);
            $table->integer('estimasi_sumbatan_persen')->default(0); // 0 - 100%
            $table->foreignId('jenis_sampah_dominan_id')->nullable()->constrained('master_jenis_sampah')->nullOnDelete();
            $table->string('tingkat_resiko_banjir', 20)->default('RENDAH'); // RENDAH, SEDANG, TINGGI, KRITIS
            $table->decimal('ai_confidence_score', 4, 3)->default(0.000); // 0.000 - 1.000
            $table->jsonb('raw_payload_json')->nullable();
            $table->string('model_version', 50)->default('v1.0-multimodal-gemini');
            $table->timestamp('analyzed_at')->useCurrent();
            $table->timestamps();

            $table->index('tingkat_resiko_banjir');
            $table->index('estimasi_sumbatan_persen');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analisis_ai');
    }
};
