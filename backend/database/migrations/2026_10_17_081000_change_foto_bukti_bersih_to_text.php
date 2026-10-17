<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penjemputan_sampah', function (Blueprint $table): void {
            $table->text('foto_bukti_bersih_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('penjemputan_sampah', function (Blueprint $table): void {
            $table->string('foto_bukti_bersih_url', 500)->nullable()->change();
        });
    }
};
