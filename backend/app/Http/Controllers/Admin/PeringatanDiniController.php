<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\PeringatanDiniDataTable;
use App\Http\Controllers\Controller;
use App\Models\LaporanSampah;
use App\Models\PeringatanDini;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PeringatanDiniController extends Controller
{
    /**
     * Display a listing of early warning broadcasts using DataTables.
     */
    public function index(PeringatanDiniDataTable $dataTable): mixed
    {
        $laporanKritis = LaporanSampah::where('is_resiko_banjir', true)
            ->orWhereNotNull('tipe_bahaya')
            ->latest('id')
            ->get();

        if ($laporanKritis->isEmpty()) {
            $laporanKritis = LaporanSampah::latest('id')->take(20)->get();
        }

        $stats = [
            'total_broadcast' => PeringatanDini::count(),
            'aktif' => PeringatanDini::where('status_aktif', true)->count(),
            'level_awas' => PeringatanDini::where('level_peringatan', 'AWAS')->count(),
            'level_siaga' => PeringatanDini::where('level_peringatan', 'SIAGA')->count(),
        ];

        return $dataTable->render('admin.peringatan-dini.index', compact('laporanKritis', 'stats'));
    }

    /**
     * Store a newly created early warning broadcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'laporan_id' => ['required', 'exists:laporan_sampah,id'],
            'tipe_bahaya' => ['required', 'string', 'max:60'],
            'level_peringatan' => ['required', 'in:WASPADA,SIAGA,AWAS'],
            'radius_terdampak_meter' => ['required', 'integer', 'min:50'],
            'pesan_broadcast' => ['required', 'string', 'max:500'],
        ]);

        PeringatanDini::create($validated);

        return redirect()
            ->route('admin.peringatan-dini.index')
            ->with('success', 'Peringatan dini bahaya lingkungan berhasil dirilis ke publik.');
    }
}
