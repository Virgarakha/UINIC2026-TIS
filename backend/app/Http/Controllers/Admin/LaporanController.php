<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\LaporanSampahDataTable;
use App\Http\Controllers\Controller;
use App\Models\AnalisisAi;
use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\RiwayatPoin;
use App\Models\StatusLaporan;
use App\Models\User;
use App\Services\LaporanSampahService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function __construct(
        protected LaporanSampahService $laporanService
    ) {}

    /**
     * Display a listing of waste reports using Yajra DataTables.
     */
    public function index(LaporanSampahDataTable $dataTable): mixed
    {
        $statuses = StatusLaporan::orderBy('urutan')->get();
        $kategoris = KategoriSampah::orderBy('nama')->get();

        $totalLaporan = LaporanSampah::count();
        $laporanKritis = LaporanSampah::where(function ($q) {
            $q->where('is_resiko_banjir', true)
                ->orWhereNotNull('tipe_bahaya');
        })->count();
        $siapPengepul = LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'siap_diambil_pengepul'))->count();
        $laporanSelesai = LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'selesai'))->count();
        $menungguVerifikasi = LaporanSampah::whereHas('status', fn ($q) => $q->whereIn('kode', ['menunggu_analisis', 'menunggu_verifikasi']))->count();
        $terverifikasiAi = LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'terverifikasi_ai'))->count();

        $totalVolumeM3 = (float) AnalisisAi::sum('estimasi_volume_m3');
        $rawConfidence = AnalisisAi::avg('ai_confidence_score');
        $avgConfidence = $rawConfidence !== null 
            ? round($rawConfidence > 1.0 ? (float) $rawConfidence : ((float) $rawConfidence * 100), 1) 
            : 92.4;

        $stats = [
            'total_laporan' => $totalLaporan,
            'laporan_kritis' => $laporanKritis,
            'siap_pengepul' => $siapPengepul,
            'laporan_selesai' => $laporanSelesai,
            'menunggu_verifikasi' => $menungguVerifikasi,
            'terverifikasi_ai' => $terverifikasiAi,
            'total_volume_m3' => round($totalVolumeM3, 2),
            'avg_confidence' => $avgConfidence,
        ];

        return $dataTable->render('admin.laporan.index', compact('statuses', 'kategoris', 'stats'));
    }

    /**
     * Display the specified report details with all relationships.
     */
    public function show(int $id): JsonResponse
    {
        $laporan = $this->laporanService->findById($id);

        return response()->json([
            'success' => true,
            'data' => $laporan,
        ]);
    }

    /**
     * Update the report status, optional notes, and citizen reward points.
     */
    public function update(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'status_id' => ['required', 'exists:status_laporan,id'],
            'catatan' => ['nullable', 'string', 'max:500'],
            'bonus_poin' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        $userId = $request->user()?->id;
        $laporan = $this->laporanService->updateStatus($id, (int) $validated['status_id'], $validated['catatan'] ?? null, $userId);

        // Optional citizen bonus reward point allocation
        $bonusPoin = (int) ($validated['bonus_poin'] ?? 0);
        if ($bonusPoin > 0 && $laporan->user_id) {
            $pelapor = User::find($laporan->user_id);
            if ($pelapor) {
                $pelapor->increment('poin_reward', $bonusPoin);
                $laporan->increment('poin_diberikan', $bonusPoin);

                RiwayatPoin::create([
                    'user_id' => $pelapor->id,
                    'laporan_id' => $laporan->id,
                    'perubahan_poin' => $bonusPoin,
                    'jenis_transaksi' => 'REWARD_LAPORAN_VERIFIED',
                    'deskripsi' => 'Bonus verifikasi laporan #' . $laporan->id . ' disetujui dinas/admin.',
                ]);
            }
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Status laporan berhasil diperbarui.',
                'data' => $laporan->load(['status', 'kategori', 'pelapor']),
            ]);
        }

        return redirect()
            ->route('admin.laporan.index')
            ->with('success', 'Status laporan berhasil diperbarui.');
    }

    /**
     * Remove the specified waste report.
     */
    public function destroy(int $id): RedirectResponse|JsonResponse
    {
        $laporan = LaporanSampah::findOrFail($id);
        $laporan->delete();

        if (request()->ajax() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Laporan sampah #' . $id . ' berhasil dihapus dari sistem.',
            ]);
        }

        return redirect()
            ->route('admin.laporan.index')
            ->with('success', 'Laporan sampah #' . $id . ' berhasil dihapus.');
    }
}
