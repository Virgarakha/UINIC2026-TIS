<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\KatalogHadiahDataTable;
use App\Http\Controllers\Controller;
use App\Models\KategoriHadiah;
use App\Services\HadiahService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HadiahController extends Controller
{
    public function __construct(
        protected HadiahService $hadiahService
    ) {}

    /**
     * Display rewards catalog using DataTables.
     */
    public function index(KatalogHadiahDataTable $dataTable): mixed
    {
        $kategoriList = KategoriHadiah::all();
        $stats = $this->hadiahService->getStats();

        return $dataTable->render('admin.hadiah.index', compact('kategoriList', 'stats'));
    }

    /**
     * Store a newly created reward in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_hadiah,id'],
            'nama_hadiah' => ['required', 'string', 'max:150'],
            'deskripsi' => ['nullable', 'string'],
            'poin_dibutuhkan' => ['required', 'integer', 'min:1'],
            'stok' => ['required', 'integer', 'min:0'],
            'foto_hadiah_url' => ['nullable', 'url', 'max:500'],
        ]);

        $this->hadiahService->createKatalog($validated);

        return redirect()
            ->route('admin.hadiah.index')
            ->with('success', 'Item hadiah baru berhasil ditambahkan ke katalog.');
    }
}
