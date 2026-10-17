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
        Schema::create('alamat_pengguna', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('label_alamat', 50)->default('Rumah'); // Rumah, Kantor, dll
            $table->string('nama_penerima', 100);
            $table->string('no_telepon', 20);
            $table->text('alamat_lengkap');
            $table->string('kota', 100)->default('Malang');
            $table->string('kode_pos', 10)->nullable();
            $table->boolean('is_utama')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_utama']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alamat_pengguna');
    }
};
