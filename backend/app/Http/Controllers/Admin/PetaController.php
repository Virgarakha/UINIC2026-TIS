<?php

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
        $allReports = LaporanSampah::with(['status', 'kategori', 'analisisAi.jenisSampahDominan', 'pelapor'])
            ->latest('id')
            ->get();

        // Active reports to display on map and radar feed (exclude completed ones)
        $activeReports = $allReports->filter(function ($r) {
            $statusKode = strtolower($r->status?->kode ?? '');
            $statusNama = strtolower($r->status?->nama ?? '');
            return !in_array($statusKode, ['selesai', 'tuntas']) && !str_contains($statusNama, 'selesai') && !str_contains($statusNama, 'tuntas');
        })->values();

        $stats = [
            'total_titik' => $activeReports->count(),
            'kritis' => $activeReports->filter(fn ($r) => $r->is_resiko_banjir || !empty($r->tipe_bahaya))->count(),
            'siap_pengepul' => $activeReports->where('status.kode', 'siap_diambil_pengepul')->count(),
            'selesai' => $allReports->filter(function ($r) {
                $statusKode = strtolower($r->status?->kode ?? '');
                $statusNama = strtolower($r->status?->nama ?? '');
                return in_array($statusKode, ['selesai', 'tuntas']) || str_contains($statusNama, 'selesai') || str_contains($statusNama, 'tuntas');
            })->count(),
        ];

        return view('admin.peta.index', ['reports' => $activeReports, 'stats' => $stats]);
    }

    /**
     * Return markers data as JSON for live AJAX polling.
     */
    public function markers(): JsonResponse
    {
        $reports = LaporanSampah::with(['status', 'kategori', 'analisisAi.jenisSampahDominan'])
            ->whereHas('status', function ($q) {
                $q->whereNotIn('kode', ['selesai', 'tuntas']);
            })
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }
}
