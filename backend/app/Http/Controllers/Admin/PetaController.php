<?php

namespace App\Models;

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LaporanSampah;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;

class PetaController extends Controller
{
    /**
     * Display the interactive GIS map in admin dashboard.
     */
    public function index(): View
    {
        $reports = LaporanSampah::with(['status', 'kategori', 'analisisAi.jenisSampahDominan', 'pelapor'])
            ->latest('id')
            ->get();

        $stats = [
            'total_titik' => $reports->count(),
            'kritis' => $reports->where('is_resiko_banjir', true)->count(),
            'siap_pengepul' => $reports->where('status.kode', 'siap_diambil_pengepul')->count(),
            'selesai' => $reports->where('status.kode', 'selesai')->count(),
        ];

        return view('admin.peta.index', compact('reports', 'stats'));
    }

    /**
     * Return markers data as JSON for live AJAX polling.
     */
    public function markers(): JsonResponse
    {
        $reports = LaporanSampah::with(['status', 'kategori', 'analisisAi.jenisSampahDominan'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }
}
