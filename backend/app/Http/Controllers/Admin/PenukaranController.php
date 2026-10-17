<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\PenukaranHadiahDataTable;
use App\Http\Controllers\Controller;
use App\Services\HadiahService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PenukaranController extends Controller
{
    public function __construct(
        protected HadiahService $hadiahService
    ) {}

    /**
     * Display a listing of reward redemptions using DataTables.
     */
    public function index(PenukaranHadiahDataTable $dataTable): mixed
    {
        $stats = $this->hadiahService->getStats();

        return $dataTable->render('admin.penukaran.index', compact('stats'));
    }

    /**
     * Update shipping status and tracking code.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status_pengiriman' => ['required', 'in:menunggu_konfirmasi,diproses,dikirim,selesai,dibatalkan'],
            'no_resi' => ['nullable', 'string', 'max:100'],
        ]);

        $this->hadiahService->updateStatusPenukaran($id, $validated['status_pengiriman'], $validated['no_resi'] ?? null);

        return redirect()
            ->route('admin.penukaran.index')
            ->with('success', 'Status pengiriman klaim hadiah berhasil diperbarui.');
    }
}
