<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriHadiah;
use App\Models\KategoriSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\StatusLaporan;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MasterDataController extends Controller
{
    /**
     * Display the 5 micro-tables master data management.
     */
    public function index(): View
    {
        $kategoriSampah = KategoriSampah::withCount('laporan')->orderBy('id')->get();
        $statusLaporan = StatusLaporan::withCount('laporan')->orderBy('urutan')->get();
        $kategoriHadiah = KategoriHadiah::withCount('hadiah')->orderBy('id')->get();
        $jenisSampah = MasterJenisSampah::withCount('analisisAi')->orderBy('id')->get();
        $tipeTanggapan = MasterTipeTanggapan::withCount('tanggapan')->orderBy('id')->get();

        return view('admin.master.index', compact(
            'kategoriSampah',
            'statusLaporan',
            'kategoriHadiah',
            'jenisSampah',
            'tipeTanggapan'
        ));
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Kategori Sampah CRUD
    |--------------------------------------------------------------------------
    */

    public function storeKategoriSampah(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:kategori_sampah,slug'],
            'deskripsi' => ['nullable', 'string'],
            'is_daur_ulang' => ['nullable', 'boolean'],
        ]);

        $validated['slug'] = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['nama']);
        $validated['is_daur_ulang'] = $request->boolean('is_daur_ulang');

        $kategori = KategoriSampah::create($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $kategori]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-kategori')
            ->with('success', "Kategori sampah '{$kategori->nama}' berhasil ditambahkan.");
    }

    public function updateKategoriSampah(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $kategori = KategoriSampah::findOrFail($id);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', Rule::unique('kategori_sampah', 'slug')->ignore($id)],
            'deskripsi' => ['nullable', 'string'],
            'is_daur_ulang' => ['nullable', 'boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['slug']);
        $validated['is_daur_ulang'] = $request->boolean('is_daur_ulang');

        $kategori->update($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $kategori]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-kategori')
            ->with('success', "Kategori sampah '{$kategori->nama}' berhasil diperbarui.");
    }

    public function destroyKategoriSampah(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $kategori = KategoriSampah::findOrFail($id);

        if ($kategori->laporan()->count() > 0) {
            $msg = "Kategori '{$kategori->nama}' tidak dapat dihapus karena masih digunakan oleh {$kategori->laporan()->count()} laporan sampah.";
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return redirect()->route('admin.master.index')->with('active_tab', 'tab-kategori')->with('error', $msg);
        }

        $nama = $kategori->nama;
        $kategori->delete();

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "Kategori '{$nama}' berhasil dihapus."]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-kategori')
            ->with('success', "Kategori '{$nama}' berhasil dihapus.");
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Status Laporan CRUD
    |--------------------------------------------------------------------------
    */

    public function storeStatusLaporan(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:status_laporan,kode'],
            'nama' => ['required', 'string', 'max:100'],
            'badge_color' => ['required', 'string', 'max:30'],
            'urutan' => ['required', 'integer', 'min:0'],
        ]);

        $validated['kode'] = Str::slug($validated['kode'], '_');
        $status = StatusLaporan::create($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $status]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-status')
            ->with('success', "Status laporan '{$status->nama}' berhasil ditambahkan.");
    }

    public function updateStatusLaporan(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $status = StatusLaporan::findOrFail($id);

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', Rule::unique('status_laporan', 'kode')->ignore($id)],
            'nama' => ['required', 'string', 'max:100'],
            'badge_color' => ['required', 'string', 'max:30'],
            'urutan' => ['required', 'integer', 'min:0'],
        ]);

        $validated['kode'] = Str::slug($validated['kode'], '_');
        $status->update($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $status]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-status')
            ->with('success', "Status laporan '{$status->nama}' berhasil diperbarui.");
    }

    public function destroyStatusLaporan(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $status = StatusLaporan::findOrFail($id);

        if ($status->laporan()->count() > 0) {
            $msg = "Status '{$status->nama}' tidak dapat dihapus karena masih digunakan oleh {$status->laporan()->count()} laporan sampah.";
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return redirect()->route('admin.master.index')->with('active_tab', 'tab-status')->with('error', $msg);
        }

        $nama = $status->nama;
        $status->delete();

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "Status '{$nama}' berhasil dihapus."]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-status')
            ->with('success', "Status '{$nama}' berhasil dihapus.");
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Master Jenis Sampah CRUD
    |--------------------------------------------------------------------------
    */

    public function storeJenisSampah(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'nilai_ekonomi_per_kg' => ['required', 'numeric', 'min:0'],
            'dapat_didaur_ulang' => ['nullable', 'boolean'],
        ]);

        $validated['dapat_didaur_ulang'] = $request->boolean('dapat_didaur_ulang');
        $jenis = MasterJenisSampah::create($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $jenis]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-jenis')
            ->with('success', "Jenis sampah '{$jenis->nama}' berhasil ditambahkan.");
    }

    public function updateJenisSampah(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $jenis = MasterJenisSampah::findOrFail($id);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'nilai_ekonomi_per_kg' => ['required', 'numeric', 'min:0'],
            'dapat_didaur_ulang' => ['nullable', 'boolean'],
        ]);

        $validated['dapat_didaur_ulang'] = $request->boolean('dapat_didaur_ulang');
        $jenis->update($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $jenis]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-jenis')
            ->with('success', "Jenis sampah '{$jenis->nama}' berhasil diperbarui.");
    }

    public function destroyJenisSampah(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $jenis = MasterJenisSampah::findOrFail($id);

        if ($jenis->analisisAi()->count() > 0) {
            $msg = "Jenis sampah '{$jenis->nama}' tidak dapat dihapus karena tercatat dalam evaluasi analisis AI.";
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return redirect()->route('admin.master.index')->with('active_tab', 'tab-jenis')->with('error', $msg);
        }

        $nama = $jenis->nama;
        $jenis->delete();

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "Jenis sampah '{$nama}' berhasil dihapus."]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-jenis')
            ->with('success', "Jenis sampah '{$nama}' berhasil dihapus.");
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Kategori Hadiah CRUD
    |--------------------------------------------------------------------------
    */

    public function storeKategoriHadiah(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:kategori_hadiah,slug'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['slug'] = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['nama']);
        $kat = KategoriHadiah::create($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $kat]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-hadiah')
            ->with('success', "Kategori hadiah '{$kat->nama}' berhasil ditambahkan.");
    }

    public function updateKategoriHadiah(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $kat = KategoriHadiah::findOrFail($id);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', Rule::unique('kategori_hadiah', 'slug')->ignore($id)],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['slug'] = Str::slug($validated['slug']);
        $kat->update($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $kat]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-hadiah')
            ->with('success', "Kategori hadiah '{$kat->nama}' berhasil diperbarui.");
    }

    public function destroyKategoriHadiah(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $kat = KategoriHadiah::findOrFail($id);

        if ($kat->hadiah()->count() > 0) {
            $msg = "Kategori hadiah '{$kat->nama}' tidak dapat dihapus karena memiliki {$kat->hadiah()->count()} item hadiah terkait.";
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return redirect()->route('admin.master.index')->with('active_tab', 'tab-hadiah')->with('error', $msg);
        }

        $nama = $kat->nama;
        $kat->delete();

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "Kategori hadiah '{$nama}' berhasil dihapus."]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-hadiah')
            ->with('success', "Kategori hadiah '{$nama}' berhasil dihapus.");
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Master Tipe Tanggapan CRUD
    |--------------------------------------------------------------------------
    */

    public function storeTipeTanggapan(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:master_tipe_tanggapan,kode'],
            'nama' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        $validated['kode'] = Str::slug($validated['kode'], '_');
        $tipe = MasterTipeTanggapan::create($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $tipe]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-tanggapan')
            ->with('success', "Tipe tanggapan '{$tipe->nama}' berhasil ditambahkan.");
    }

    public function updateTipeTanggapan(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $tipe = MasterTipeTanggapan::findOrFail($id);

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', Rule::unique('master_tipe_tanggapan', 'kode')->ignore($id)],
            'nama' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        $validated['kode'] = Str::slug($validated['kode'], '_');
        $tipe->update($validated);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $tipe]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-tanggapan')
            ->with('success', "Tipe tanggapan '{$tipe->nama}' berhasil diperbarui.");
    }

    public function destroyTipeTanggapan(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $tipe = MasterTipeTanggapan::findOrFail($id);

        if ($tipe->tanggapan()->count() > 0) {
            $msg = "Tipe tanggapan '{$tipe->nama}' tidak dapat dihapus karena telah digunakan dalam {$tipe->tanggapan()->count()} respon warga.";
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return redirect()->route('admin.master.index')->with('active_tab', 'tab-tanggapan')->with('error', $msg);
        }

        $nama = $tipe->nama;
        $tipe->delete();

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "Tipe tanggapan '{$nama}' berhasil dihapus."]);
        }

        return redirect()->route('admin.master.index')
            ->with('active_tab', 'tab-tanggapan')
            ->with('success', "Tipe tanggapan '{$nama}' berhasil dihapus.");
    }
}
