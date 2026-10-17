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
        Schema::create('tanggapan_laporan', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporan_sampah')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('tipe_tanggapan_id')->nullable()->constrained('master_tipe_tanggapan')->nullOnDelete();
            $table->text('komentar')->nullable();
            $table->string('foto_bukti_tambahan_url', 500)->nullable();
            $table->timestamps();

            $table->index(['laporan_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tanggapan_laporan');
    }
};
