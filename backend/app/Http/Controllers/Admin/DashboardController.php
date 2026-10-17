<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LaporanSampah;
use App\Models\PenjemputanSampah;
use App\Models\PenukaranHadiah;
use App\Models\PeringatanDini;
use App\Models\User;
use App\Services\LaporanSampahService;
use App\Services\UserService;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with full system statistics.
     */
    public function index(UserService $userService, LaporanSampahService $laporanService): View
    {
        $userStats = $userService->getDashboardStats();
        $laporanStats = $laporanService->getDashboardStats();

        $stats = array_merge($userStats, $laporanStats, [
            'total_tokens' => DB::table('personal_access_tokens')->count(),
            'peringatan_aktif' => PeringatanDini::where('status_aktif', true)->count(),
            'total_penjemputan' => PenjemputanSampah::count(),
            'total_penukaran' => PenukaranHadiah::count(),
            'db_driver' => config('database.default'),
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
        ]);

        $recentUsers = User::latest('id')->take(5)->get();
        $recentReports = LaporanSampah::with(['status', 'kategori', 'analisisAi', 'pelapor'])
            ->latest('id')
            ->take(5)
            ->get();

        return view('admin.dashboard.index', compact('stats', 'recentUsers', 'recentReports'));
    }
}
