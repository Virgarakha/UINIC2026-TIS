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
        Schema::create('pengepul_ulasan', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pengepul_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('warga_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reviewer_name', 100);
            $table->string('reviewer_role', 50)->default('Warga Binaan');
            $table->integer('rating')->default(5);
            $table->text('komentar');
            $table->timestamps();

            $table->index('pengepul_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengepul_ulasan');
    }
};
