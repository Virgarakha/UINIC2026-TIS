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
            'total_penjemputan' => PenjemputanSampah::whereNotNull('laporan_id')->count(),
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

        // Monthly Waste Statistics strictly synced with real database reports
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $cleanedPerMonth = array_fill(0, 12, 0);
        $uncleanedPerMonth = array_fill(0, 12, 0);

        $allReports = LaporanSampah::with('status')->get();
        foreach ($allReports as $rep) {
            $monthIdx = $rep->created_at ? ($rep->created_at->month - 1) : (now()->month - 1);
            $isSelesai = in_array(strtolower($rep->status?->kode ?? ''), ['selesai', 'tuntas']);
            if ($isSelesai) {
                $cleanedPerMonth[$monthIdx]++;
            } else {
                $uncleanedPerMonth[$monthIdx]++;
            }
        }

        $totalCleaned = array_sum($cleanedPerMonth);
        $totalUncleaned = array_sum($uncleanedPerMonth);
        $cleanRate = ($totalCleaned + $totalUncleaned) > 0
            ? round(($totalCleaned / ($totalCleaned + $totalUncleaned)) * 100, 1)
            : 0;

        $chartData = [
            'categories' => $months,
            'sudah_dibersihkan' => $cleanedPerMonth,
            'belum_dibersihkan' => $uncleanedPerMonth,
            'clean_rate' => $cleanRate,
        ];

        return view('admin.dashboard.index', compact('stats', 'recentUsers', 'recentReports', 'chartData'));
    }
}
