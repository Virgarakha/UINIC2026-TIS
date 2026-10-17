<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\LaporanSampahDataTable;
use App\Http\Controllers\Controller;
use App\Models\StatusLaporan;
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
        $stats = $this->laporanService->getDashboardStats();

        return $dataTable->render('admin.laporan.index', compact('statuses', 'stats'));
    }

    /**
     * Display the specified report details.
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
     * Update the report status.
     */
    public function update(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'status_id' => ['required', 'exists:status_laporan,id'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $userId = $request->user()?->id;
        $laporan = $this->laporanService->updateStatus($id, (int) $validated['status_id'], $validated['catatan'] ?? null, $userId);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Status laporan berhasil diperbarui.',
                'data' => $laporan,
            ]);
        }

        return redirect()
            ->route('admin.laporan.index')
            ->with('success', 'Status laporan berhasil diperbarui.');
    }
}
