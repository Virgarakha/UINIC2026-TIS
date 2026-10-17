<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\PenjemputanSampahDataTable;
use App\Http\Controllers\Controller;
use App\Models\PenjemputanSampah;

class PenjemputanController extends Controller
{
    /**
     * Display a listing of recycler pickups using Yajra DataTables.
     */
    public function index(PenjemputanSampahDataTable $dataTable): mixed
    {
        $stats = [
            'total_penjemputan' => PenjemputanSampah::count(),
            'selesai' => PenjemputanSampah::where('status_jemput', 'selesai')->count(),
            'sedang_proses' => PenjemputanSampah::whereIn('status_jemput', ['klaim', 'menuju_lokasi'])->count(),
            'total_berat_kg' => (float) PenjemputanSampah::sum('timbangan_riil_kg'),
        ];

        return $dataTable->render('admin.penjemputan.index', compact('stats'));
    }
}
