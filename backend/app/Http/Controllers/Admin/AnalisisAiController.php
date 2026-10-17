<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalisisAi;
use Illuminate\Contracts\View\View;

class AnalisisAiController extends Controller
{
    /**
     * Display AI vision and hydrology analytics.
     */
    public function index(): View
    {
        $analisisList = AnalisisAi::with(['laporan.pelapor', 'jenisSampahDominan'])
            ->latest('id')
            ->paginate(12);

        $stats = [
            'total_dianalisis' => AnalisisAi::count(),
            'rata_rata_confidence' => round((float) AnalisisAi::avg('ai_confidence_score') * 100, 1),
            'risiko_tinggi_kritis' => AnalisisAi::whereIn('tingkat_resiko_banjir', ['TINGGI', 'KRITIS'])->count(),
            'lolos_anti_fraud' => AnalisisAi::where('ai_confidence_score', '>=', 0.70)->count(),
        ];

        return view('admin.analisis-ai.index', compact('analisisList', 'stats'));
    }
}
