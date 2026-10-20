<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;

class ApiDocsController extends Controller
{
    /**
     * Display the REST API Documentation and Subscription Pricing Packages page.
     */
    public function index(): View
    {
        $packages = [
            [
                'id' => 'starter',
                'name' => 'Paket Starter',
                'badge' => 'Gratis / Free',
                'badge_color' => 'secondary',
                'price' => 'Rp 0',
                'period' => '/ bulan',
                'quota' => '20 Request / hari',
                'rate_limit' => '5 Req / menit',
                'description' => 'Akses dasar untuk pengembang independen atau eksplorasi awal dataset titik sampah TRINFO.',
                'features' => [
                    'Akses endpoint publik laporan sampah',
                    'Akses katalog hadiah & poin reward',
                    'Format response JSON standar v1',
                    'Public community support via GitHub',
                ],
                'is_popular' => false,
                'cta' => 'Mulai Gratis',
                'cta_class' => 'btn-outline-secondary',
            ],
            [
                'id' => 'pro',
                'name' => 'Paket Pro',
                'badge' => 'Paling Populer',
                'badge_color' => 'primary',
                'price' => 'Rp 50.000',
                'period' => '/ bulan',
                'quota' => '100 Request / hari',
                'rate_limit' => '30 Req / menit',
                'description' => 'Solusi ideal untuk startup lingkungan, mitra pengepul swasta, dan komunitas peduli sampah terverifikasi.',
                'features' => [
                    'Kuota 100 Request kuota harian',
                    'Webhook notifikasi realtime penjemputan',
                    'Akses data peringatan dini bencana banjir',
                    'Dukungan filter koordinat radius km',
                    'Email & Discord technical support',
                ],
                'is_popular' => true,
                'cta' => 'Pilih Paket Rp 50.000',
                'cta_class' => 'btn-primary',
            ],
            [
                'id' => 'enterprise',
                'name' => 'Paket Enterprise',
                'badge' => 'Kapasitas Tinggi',
                'badge_color' => 'success',
                'price' => 'Rp 100.000',
                'period' => '/ bulan',
                'quota' => '500 Request / hari',
                'rate_limit' => '100 Req / menit',
                'description' => 'Dioptimalkan untuk integrasi dinas pemerintah, armada DLH kota, dan dashboard analitik tingkat lanjut.',
                'features' => [
                    'Kuota 500 Request kuota harian',
                    'Akses pipeline AI analisis citra sampah',
                    'Integrasi GPS live tracking armada truk/motor',
                    'API Key Dedicated dengan SLA 99.9%',
                    'Export histori pelacakan GeoJSON & CSV',
                    'Prioritas penanganan bug 24/7',
                ],
                'is_popular' => false,
                'cta' => 'Pilih Paket Rp 100.000',
                'cta_class' => 'btn-success',
            ],
            [
                'id' => 'unlimited',
                'name' => 'Paket Custom Gov',
                'badge' => 'Unlimited',
                'badge_color' => 'dark',
                'price' => 'Rp 250.000',
                'period' => '/ bulan',
                'quota' => 'Unlimited Request',
                'rate_limit' => 'Tanpa Batasan',
                'description' => 'Paket kustomisasi menyeluruh untuk integrasi Smart City tingkat provinsi dan kementerian lingkungan hidup.',
                'features' => [
                    'Akses penuh seluruh 15+ endpoint REST API',
                    'Unlimited request tanpa batas kuota harian',
                    'Dedicated cloud instance & socket gateway',
                    'SLA ketersediaan 99.99%',
                    'Perjanjian NDA & kustomisasi skema DB',
                ],
                'is_popular' => false,
                'cta' => 'Hubungi Tim Penjualan',
                'cta_class' => 'btn-dark',
            ],
        ];

        return view('admin.api-docs.index', compact('packages'));
    }
}
