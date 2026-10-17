<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RiwayatPoin;
use Illuminate\Contracts\View\View;

class RiwayatPoinController extends Controller
{
    /**
     * Display points transaction ledger.
     */
    public function index(): View
    {
        $riwayatList = RiwayatPoin::with('user')->latest('id')->paginate(15);

        $stats = [
            'total_transaksi' => RiwayatPoin::count(),
            'poin_masuk' => (int) RiwayatPoin::where('jenis_transaksi', 'masuk')->sum('jumlah_poin'),
            'poin_keluar' => (int) RiwayatPoin::where('jenis_transaksi', 'keluar')->sum('jumlah_poin'),
        ];

        return view('admin.riwayat-poin.index', compact('riwayatList', 'stats'));
    }
}
