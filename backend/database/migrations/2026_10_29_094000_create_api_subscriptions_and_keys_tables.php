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
        Schema::create('api_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('plan_tier')->default('free'); // free, pro, enterprise
            $table->string('status')->default('active'); // active, inactive, canceled
            $table->bigInteger('requests_limit')->default(1000); // -1 for unlimited
            $table->bigInteger('requests_used')->default(0);
            $table->integer('rate_limit_per_minute')->default(30);
            $table->string('billing_cycle')->default('monthly');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name')->default('Default API Key');
            $table->string('key_prefix')->default('trinfo_live_');
            $table->string('plain_token')->nullable(); // stored masked or first 16 chars
            $table->string('key_hash')->unique();
            $table->boolean('is_active')->default(true);
            $table->bigInteger('requests_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('api_request_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('api_key_id')->nullable()->constrained('api_keys')->onDelete('cascade');
            $table->string('endpoint');
            $table->string('method', 10)->default('GET');
            $table->integer('status_code')->default(200);
            $table->integer('response_time_ms')->default(45);
            $table->string('ip_address', 45)->default('127.0.0.1');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_request_logs');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('api_subscriptions');
    }
};
