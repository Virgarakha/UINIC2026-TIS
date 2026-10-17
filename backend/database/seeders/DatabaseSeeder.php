<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed default Administrator
        $admin = User::firstOrCreate(
            ['email' => 'admin@uinic.com'],
            [
                'name' => 'Admin UINIC',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Generate an initial Sanctum token for admin testing
        if ($admin->tokens()->count() === 0) {
            $admin->createToken('admin-api-key');
        }

        // 2. Seed 25 realistic users for testing DataTables and API pagination
        if (User::count() <= 1) {
            User::factory(25)->create();
        }

        // 3. Seed Micro-Tables & Rewards Master Data
        $this->call(MicroTablesSeeder::class);

        // 4. Seed Realistic Reports, AI Analysis & Operasional Data
        $this->call(LaporanSampahSeeder::class);
    }
}
