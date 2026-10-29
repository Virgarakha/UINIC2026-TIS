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
        // 1. Seed default Warga Tanpa Login (User ID 1 - Tamu tanpa login, tidak mendapatkan poin reward)
        User::firstOrCreate(
            ['email' => 'warga.tamu@ecocitizen.id'],
            [
                'name' => 'Warga (Tanpa Login)',
                'password' => Hash::make('password'),
                'role' => 'warga',
                'poin_reward' => 0,
                'email_verified_at' => now(),
            ]
        );

        // Seed default Administrator
        $admin = User::firstOrCreate(
            ['email' => 'admin@uinic.com'],
            [
                'name' => 'Admin UINIC',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Generate an initial Sanctum token for admin testing
        if ($admin->tokens()->count() === 0) {
            $admin->createToken('admin-api-key');
        }

        // Seed default Pengepul (Pak Slamet) for quick demo
        User::firstOrCreate(
            ['email' => 'pengepul@ecocitizen.id'],
            [
                'name' => 'Pak Slamet (Mitra Pengepul)',
                'password' => Hash::make('password'),
                'role' => 'pengepul',
                'poin_reward' => 350,
                'no_telepon' => '0813-3379-4278',
                'email_verified_at' => now(),
            ]
        );

        // Seed default Warga (Budi Santoso) for quick demo
        User::firstOrCreate(
            ['email' => 'budi@ecocitizen.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'warga',
                'poin_reward' => 240,
                'no_telepon' => '0812-3456-7890',
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed 25 realistic users for testing DataTables and API pagination
        if (User::count() <= 1) {
            User::factory(25)->create();
        }

        // 3. Seed Micro-Tables & Rewards Master Data
        $this->call(MicroTablesSeeder::class);

        // 4. Seed Realistic Reports, AI Analysis & Operasional Data
        $this->call(LaporanSampahSeeder::class);
        $this->call(Laporan100JawaSeeder::class);
    }
}
