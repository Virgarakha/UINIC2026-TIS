<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TanggapanLaporan;
use Illuminate\Contracts\View\View;

class TanggapanController extends Controller
{
    /**
     * Display crowdsourced citizen responses and photo updates.
     */
    public function index(): View
    {
        $tanggapanList = TanggapanLaporan::with(['laporan.status', 'user', 'tipeTanggapan'])
            ->latest('id')
            ->paginate(15);

        $stats = [
            'total_tanggapan' => TanggapanLaporan::count(),
            'total_foto_tambahan' => TanggapanLaporan::whereNotNull('foto_bukti_tambahan_url')->count(),
            'warga_berpartisipasi' => TanggapanLaporan::distinct('user_id')->count('user_id'),
        ];

        return view('admin.tanggapan.index', compact('tanggapanList', 'stats'));
    }
}
