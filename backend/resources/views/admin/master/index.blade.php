@extends('layouts.admin')

@section('title', 'Master Kategori & Status')
@section('page_title', 'Master Data Sistem (5 Micro-Tables - Full CRUD)')

@section('content')
<!-- Header Intro -->
<div class="synto-card p-4 mb-4">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
            <h5 class="fw-bold text-dark mb-1">Pengaturan Master Data & Kategorisasi Sistem</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Kelola 5 micro-tables secara dinamis untuk menjaga fleksibilitas dan integritas relasional data operasional.</p>
        </div>
        <span class="badge text-white px-3 py-2 rounded-pill fw-semibold shadow-xs" style="background-color: #4f46e5; font-size: 11.5px;">
            <i class="bi bi-shield-check me-1"></i> 5 Micro-Tables Siap CRUD
        </span>
    </div>
</div>

<!-- Flash Alerts -->
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show rounded-3 border-0 shadow-xs mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show rounded-3 border-0 shadow-xs mb-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if($errors->any())
    <div class="alert alert-danger alert-dismissible fade show rounded-3 border-0 shadow-xs mb-4" role="alert">
        <div class="fw-bold mb-1"><i class="bi bi-x-circle-fill me-1"></i> Terdapat kesalahan input data:</div>
        <ul class="mb-0 ps-3" style="font-size: 13px;">
            @foreach($errors->all() as $err)
                <li>{{ $err }}</li>
            @endforeach
        </ul>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Tabs Navigation -->
<div class="synto-card p-4">
    <ul class="nav nav-pills mb-4 gap-2 border-bottom pb-3" id="masterTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-3 py-1.5 fw-semibold" style="font-size: 12.5px;" id="kategori-tab" data-bs-toggle="tab" data-bs-target="#tab-kategori" type="button" role="tab">
                <i class="bi bi-tag me-1"></i> Kategori Sampah ({{ $kategoriSampah->count() }})
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-3 py-1.5 fw-semibold" style="font-size: 12.5px;" id="status-tab" data-bs-toggle="tab" data-bs-target="#tab-status" type="button" role="tab">
                <i class="bi bi-clock-history me-1"></i> Status Laporan ({{ $statusLaporan->count() }})
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-3 py-1.5 fw-semibold" style="font-size: 12.5px;" id="jenis-tab" data-bs-toggle="tab" data-bs-target="#tab-jenis" type="button" role="tab">
                <i class="bi bi-recycle me-1"></i> Jenis Sampah ({{ $jenisSampah->count() }})
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-3 py-1.5 fw-semibold" style="font-size: 12.5px;" id="hadiah-tab" data-bs-toggle="tab" data-bs-target="#tab-hadiah" type="button" role="tab">
                <i class="bi bi-gift me-1"></i> Kategori Hadiah ({{ $kategoriHadiah->count() }})
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-3 py-1.5 fw-semibold" style="font-size: 12.5px;" id="tanggapan-tab" data-bs-toggle="tab" data-bs-target="#tab-tanggapan" type="button" role="tab">
                <i class="bi bi-chat-quote me-1"></i> Tipe Tanggapan ({{ $tipeTanggapan->count() }})
            </button>
        </li>
    </ul>

    <!-- Tab Contents -->
    <div class="tab-content" id="masterTabsContent">
        
        <!-- ==========================================
             TAB 1: KATEGORI SAMPAH
             ========================================== -->
        <div class="tab-pane fade" id="tab-kategori" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Master Kategori Titik Sampah</h6>
                <button type="button" class="btn btn-sm text-white rounded-3 px-3 py-1.5 fw-semibold shadow-xs" style="background-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalAddKategori">
                    <i class="bi bi-plus-lg"></i> Tambah Kategori
                </button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                        <tr>
                            <th>Nama Kategori</th>
                            <th>Slug</th>
                            <th>Daur Ulang</th>
                            <th>Deskripsi</th>
                            <th>Laporan Terkait</th>
                            <th class="text-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($kategoriSampah as $item)
                            <tr>
                                <td class="fw-bold text-dark" style="font-size: 13.5px;">{{ $item->nama }}</td>
                                <td><code>{{ $item->slug }}</code></td>
                                <td>
                                    @if($item->is_daur_ulang)
                                        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1">Ya (Bernilai)</span>
                                    @else
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2.5 py-1">Non-Daur Ulang</span>
                                    @endif
                                </td>
                                <td class="text-secondary" style="font-size: 12.5px; max-width: 250px;">{{ $item->deskripsi ?? '-' }}</td>
                                <td><span class="badge bg-light text-dark border px-2.5 py-1 rounded">{{ $item->laporan_count }} Laporan</span></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-primary btn-edit-kategori me-1"
                                            data-id="{{ $item->id }}"
                                            data-nama="{{ $item->nama }}"
                                            data-slug="{{ $item->slug }}"
                                            data-deskripsi="{{ $item->deskripsi }}"
                                            data-is-daur-ulang="{{ $item->is_daur_ulang ? '1' : '0' }}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="{{ route('admin.master.kategori-sampah.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus kategori {{ addslashes($item->nama) }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="text-center py-4 text-secondary">Belum ada kategori sampah.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ==========================================
             TAB 2: STATUS LAPORAN
             ========================================== -->
        <div class="tab-pane fade" id="tab-status" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Master Status Laporan & Alur Sistem</h6>
                <button type="button" class="btn btn-sm text-white rounded-3 px-3 py-1.5 fw-semibold shadow-xs" style="background-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalAddStatus">
                    <i class="bi bi-plus-lg"></i> Tambah Status
                </button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                        <tr>
                            <th>Urutan</th>
                            <th>Kode Status</th>
                            <th>Nama Status</th>
                            <th>Badge Tampilan</th>
                            <th>Laporan Terkait</th>
                            <th class="text-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($statusLaporan as $item)
                            <tr>
                                <td class="fw-bold text-secondary">{{ $item->urutan }}</td>
                                <td><code>{{ $item->kode }}</code></td>
                                <td class="fw-bold text-dark" style="font-size: 13.5px;">{{ $item->nama }}</td>
                                <td>
                                    <span class="badge bg-{{ $item->badge_color }} bg-opacity-10 text-{{ $item->badge_color }} border border-{{ $item->badge_color }} border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold">
                                        {{ $item->nama }}
                                    </span>
                                </td>
                                <td><span class="badge bg-light text-dark border px-2.5 py-1 rounded">{{ $item->laporan_count }} Laporan</span></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-primary btn-edit-status me-1"
                                            data-id="{{ $item->id }}"
                                            data-kode="{{ $item->kode }}"
                                            data-nama="{{ $item->nama }}"
                                            data-badge-color="{{ $item->badge_color }}"
                                            data-urutan="{{ $item->urutan }}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="{{ route('admin.master.status-laporan.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus status {{ addslashes($item->nama) }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="text-center py-4 text-secondary">Belum ada status laporan.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ==========================================
             TAB 3: MASTER JENIS SAMPAH
             ========================================== -->
        <div class="tab-pane fade" id="tab-jenis" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Master Jenis Material Sampah & Harga Pengepul</h6>
                <button type="button" class="btn btn-sm text-white rounded-3 px-3 py-1.5 fw-semibold shadow-xs" style="background-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalAddJenis">
                    <i class="bi bi-plus-lg"></i> Tambah Jenis Sampah
                </button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                        <tr>
                            <th>Nama Material Sampah</th>
                            <th>Nilai Ekonomi / Kg</th>
                            <th>Dapat Didaur Ulang</th>
                            <th>Tercatat di Evaluasi AI</th>
                            <th class="text-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($jenisSampah as $item)
                            <tr>
                                <td class="fw-bold text-dark" style="font-size: 13.5px;">{{ $item->nama }}</td>
                                <td>
                                    @if($item->nilai_ekonomi_per_kg > 0)
                                        <span class="fw-bold text-success" style="font-size: 13px;">Rp {{ number_format($item->nilai_ekonomi_per_kg, 0, ',', '.') }} / kg</span>
                                    @else
                                        <span class="text-muted" style="font-size: 12px;">Rp 0 (Residu)</span>
                                    @endif
                                </td>
                                <td>
                                    @if($item->dapat_didaur_ulang)
                                        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1">Bisa Didaur Ulang</span>
                                    @else
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2.5 py-1">Non-Daur Ulang</span>
                                    @endif
                                </td>
                                <td><span class="badge bg-light text-dark border px-2.5 py-1 rounded">{{ $item->analisis_ai_count }} Analisis</span></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-primary btn-edit-jenis me-1"
                                            data-id="{{ $item->id }}"
                                            data-nama="{{ $item->nama }}"
                                            data-nilai="{{ $item->nilai_ekonomi_per_kg }}"
                                            data-dapat-didaur-ulang="{{ $item->dapat_didaur_ulang ? '1' : '0' }}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="{{ route('admin.master.jenis-sampah.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus material {{ addslashes($item->nama) }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="text-center py-4 text-secondary">Belum ada data jenis sampah.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ==========================================
             TAB 4: KATEGORI HADIAH
             ========================================== -->
        <div class="tab-pane fade" id="tab-hadiah" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Master Kategori Hadiah & Reward Poin</h6>
                <button type="button" class="btn btn-sm text-white rounded-3 px-3 py-1.5 fw-semibold shadow-xs" style="background-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalAddKatHadiah">
                    <i class="bi bi-plus-lg"></i> Tambah Kategori Hadiah
                </button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                        <tr>
                            <th>Ikon</th>
                            <th>Nama Kategori</th>
                            <th>Slug</th>
                            <th>Jumlah Item Hadiah</th>
                            <th class="text-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($kategoriHadiah as $item)
                            <tr>
                                <td>
                                    <div class="rounded-circle bg-light border d-flex align-items-center justify-content-center text-primary" style="width: 34px; height: 34px;">
                                        <i class="bi {{ $item->icon ?? 'bi-gift' }}"></i>
                                    </div>
                                </td>
                                <td class="fw-bold text-dark" style="font-size: 13.5px;">{{ $item->nama }}</td>
                                <td><code>{{ $item->slug }}</code></td>
                                <td><span class="badge bg-light text-dark border px-2.5 py-1 rounded">{{ $item->hadiah_count }} Item</span></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-primary btn-edit-kat-hadiah me-1"
                                            data-id="{{ $item->id }}"
                                            data-nama="{{ $item->nama }}"
                                            data-slug="{{ $item->slug }}"
                                            data-icon="{{ $item->icon }}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="{{ route('admin.master.kategori-hadiah.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus kategori hadiah {{ addslashes($item->nama) }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="text-center py-4 text-secondary">Belum ada kategori hadiah.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ==========================================
             TAB 5: MASTER TIPE TANGGAPAN
             ========================================== -->
        <div class="tab-pane fade" id="tab-tanggapan" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Master Tipe Tanggapan Crowdsourcing</h6>
                <button type="button" class="btn btn-sm text-white rounded-3 px-3 py-1.5 fw-semibold shadow-xs" style="background-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalAddTipe">
                    <i class="bi bi-plus-lg"></i> Tambah Tipe Respon
                </button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                        <tr>
                            <th>Ikon</th>
                            <th>Kode Respon</th>
                            <th>Nama Tipe Respon</th>
                            <th>Deskripsi Fungsi</th>
                            <th>Total Digunakan</th>
                            <th class="text-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($tipeTanggapan as $item)
                            <tr>
                                <td>
                                    <div class="rounded-circle bg-light border d-flex align-items-center justify-content-center text-primary" style="width: 34px; height: 34px;">
                                        <i class="bi {{ $item->icon ?? 'bi-chat' }}"></i>
                                    </div>
                                </td>
                                <td><code>{{ $item->kode }}</code></td>
                                <td class="fw-bold text-dark" style="font-size: 13.5px;">{{ $item->nama }}</td>
                                <td class="text-secondary" style="font-size: 12.5px; max-width: 250px;">{{ $item->deskripsi ?? '-' }}</td>
                                <td><span class="badge bg-light text-dark border px-2.5 py-1 rounded">{{ $item->tanggapan_count }} Respon</span></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-primary btn-edit-tipe me-1"
                                            data-id="{{ $item->id }}"
                                            data-kode="{{ $item->kode }}"
                                            data-nama="{{ $item->nama }}"
                                            data-icon="{{ $item->icon }}"
                                            data-deskripsi="{{ $item->deskripsi }}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="{{ route('admin.master.tipe-tanggapan.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus tipe respon {{ addslashes($item->nama) }}?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-light border rounded-2 px-2 py-1 text-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="text-center py-4 text-secondary">Belum ada tipe tanggapan.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>

<!-- =========================================================================
     MODALS FOR CREATE & EDIT (5 MICRO-TABLES)
     ========================================================================= -->

<!-- Modal 1: Tambah / Edit Kategori Sampah -->
<div class="modal fade" id="modalAddKategori" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.master.kategori-sampah.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Kategori Sampah</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Kategori <span class="text-danger">*</span></label>
                        <input type="text" name="nama" class="form-control rounded-3" required placeholder="Contoh: Saluran Air Irigasi">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Slug URL (Opsional)</label>
                        <input type="text" name="slug" class="form-control rounded-3" placeholder="Otomatis dari nama jika kosong">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Deskripsi Kategori</label>
                        <textarea name="deskripsi" class="form-control rounded-3" rows="2" placeholder="Keterangan singkat tipe sampah ini..."></textarea>
                    </div>
                    <div class="form-check form-switch mt-2">
                        <input class="form-check-input" type="checkbox" name="is_daur_ulang" value="1" id="add_is_daur_ulang">
                        <label class="form-check-label fw-semibold text-dark" for="add_is_daur_ulang" style="font-size: 13px;">Bernilai Daur Ulang (Pengepul)</label>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Kategori</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditKategori" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="formEditKategori" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Edit Kategori Sampah</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Kategori <span class="text-danger">*</span></label>
                        <input type="text" id="edit_kat_nama" name="nama" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Slug URL <span class="text-danger">*</span></label>
                        <input type="text" id="edit_kat_slug" name="slug" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Deskripsi Kategori</label>
                        <textarea id="edit_kat_deskripsi" name="deskripsi" class="form-control rounded-3" rows="2"></textarea>
                    </div>
                    <div class="form-check form-switch mt-2">
                        <input class="form-check-input" type="checkbox" name="is_daur_ulang" value="1" id="edit_kat_is_daur_ulang">
                        <label class="form-check-label fw-semibold text-dark" for="edit_kat_is_daur_ulang" style="font-size: 13px;">Bernilai Daur Ulang (Pengepul)</label>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Perbarui Kategori</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal 2: Tambah / Edit Status Laporan -->
<div class="modal fade" id="modalAddStatus" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.master.status-laporan.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Status Laporan Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Kode Status Unik <span class="text-danger">*</span></label>
                        <input type="text" name="kode" class="form-control rounded-3" required placeholder="Contoh: investigasi_lapangan">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Tampilan Status <span class="text-danger">*</span></label>
                        <input type="text" name="nama" class="form-control rounded-3" required placeholder="Contoh: Investigasi Lapangan">
                    </div>
                    <div class="row g-2">
                        <div class="col-6 mb-3">
                            <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Warna Badge <span class="text-danger">*</span></label>
                            <select name="badge_color" class="form-select rounded-3" required>
                                <option value="primary">Primary (Biru)</option>
                                <option value="success">Success (Hijau)</option>
                                <option value="warning">Warning (Kuning)</option>
                                <option value="danger">Danger (Merah)</option>
                                <option value="info">Info (Sian)</option>
                                <option value="secondary">Secondary (Abu-abu)</option>
                                <option value="dark">Dark (Hitam)</option>
                            </select>
                        </div>
                        <div class="col-6 mb-3">
                            <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Urutan Alur <span class="text-danger">*</span></label>
                            <input type="number" name="urutan" class="form-control rounded-3" value="1" min="0" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Status</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditStatus" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="formEditStatus" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Edit Status Laporan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Kode Status <span class="text-danger">*</span></label>
                        <input type="text" id="edit_st_kode" name="kode" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Tampilan Status <span class="text-danger">*</span></label>
                        <input type="text" id="edit_st_nama" name="nama" class="form-control rounded-3" required>
                    </div>
                    <div class="row g-2">
                        <div class="col-6 mb-3">
                            <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Warna Badge <span class="text-danger">*</span></label>
                            <select id="edit_st_badge" name="badge_color" class="form-select rounded-3" required>
                                <option value="primary">Primary (Biru)</option>
                                <option value="success">Success (Hijau)</option>
                                <option value="warning">Warning (Kuning)</option>
                                <option value="danger">Danger (Merah)</option>
                                <option value="info">Info (Sian)</option>
                                <option value="secondary">Secondary (Abu-abu)</option>
                                <option value="dark">Dark (Hitam)</option>
                            </select>
                        </div>
                        <div class="col-6 mb-3">
                            <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Urutan Alur <span class="text-danger">*</span></label>
                            <input type="number" id="edit_st_urutan" name="urutan" class="form-control rounded-3" min="0" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Perbarui Status</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal 3: Tambah / Edit Master Jenis Sampah -->
<div class="modal fade" id="modalAddJenis" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.master.jenis-sampah.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Material Sampah Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Material <span class="text-danger">*</span></label>
                        <input type="text" name="nama" class="form-control rounded-3" required placeholder="Contoh: Kaleng Alumunium / Logam Ringan">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Estimasi Harga Pengepul (Rp / Kg) <span class="text-danger">*</span></label>
                        <input type="number" name="nilai_ekonomi_per_kg" step="100" min="0" class="form-control rounded-3" required placeholder="Contoh: 6000">
                    </div>
                    <div class="form-check form-switch mt-2">
                        <input class="form-check-input" type="checkbox" name="dapat_didaur_ulang" value="1" id="add_dapat_daur" checked>
                        <label class="form-check-label fw-semibold text-dark" for="add_dapat_daur" style="font-size: 13px;">Dapat Didaur Ulang oleh Pengepul</label>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Material</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditJenis" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="formEditJenis" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Edit Material Sampah</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Material <span class="text-danger">*</span></label>
                        <input type="text" id="edit_jen_nama" name="nama" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Estimasi Harga Pengepul (Rp / Kg) <span class="text-danger">*</span></label>
                        <input type="number" id="edit_jen_nilai" name="nilai_ekonomi_per_kg" step="100" min="0" class="form-control rounded-3" required>
                    </div>
                    <div class="form-check form-switch mt-2">
                        <input class="form-check-input" type="checkbox" name="dapat_didaur_ulang" value="1" id="edit_jen_daur">
                        <label class="form-check-label fw-semibold text-dark" for="edit_jen_daur" style="font-size: 13px;">Dapat Didaur Ulang oleh Pengepul</label>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Perbarui Material</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal 4: Tambah / Edit Kategori Hadiah -->
<div class="modal fade" id="modalAddKatHadiah" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.master.kategori-hadiah.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Kategori Hadiah Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Kategori Hadiah <span class="text-danger">*</span></label>
                        <input type="text" name="nama" class="form-control rounded-3" required placeholder="Contoh: Paket Bibit Tanaman">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Slug URL (Opsional)</label>
                        <input type="text" name="slug" class="form-control rounded-3" placeholder="Otomatis jika kosong">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Icon Bootstrap (Contoh: bi-tree, bi-wallet2)</label>
                        <input type="text" name="icon" class="form-control rounded-3" value="bi-gift" placeholder="bi-gift">
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Kategori</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditKatHadiah" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="formEditKatHadiah" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Edit Kategori Hadiah</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Kategori <span class="text-danger">*</span></label>
                        <input type="text" id="edit_hdh_nama" name="nama" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Slug URL <span class="text-danger">*</span></label>
                        <input type="text" id="edit_hdh_slug" name="slug" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Icon Bootstrap</label>
                        <input type="text" id="edit_hdh_icon" name="icon" class="form-control rounded-3">
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Perbarui Kategori</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal 5: Tambah / Edit Master Tipe Tanggapan -->
<div class="modal fade" id="modalAddTipe" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.master.tipe-tanggapan.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Tipe Respon Warga</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Kode Unik Respon <span class="text-danger">*</span></label>
                        <input type="text" name="kode" class="form-control rounded-3" required placeholder="Contoh: banjir_surut">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Tipe Respon <span class="text-danger">*</span></label>
                        <input type="text" name="nama" class="form-control rounded-3" required placeholder="Contoh: Laporan Banjir Telah Surut">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Icon Bootstrap (Contoh: bi-droplet-half)</label>
                        <input type="text" name="icon" class="form-control rounded-3" value="bi-chat-dots" placeholder="bi-chat-dots">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Deskripsi Fungsi</label>
                        <textarea name="deskripsi" class="form-control rounded-3" rows="2" placeholder="Jelaskan kapan warga memilih respon ini..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Tipe Respon</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditTipe" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="formEditTipe" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Edit Tipe Respon Warga</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Kode Respon <span class="text-danger">*</span></label>
                        <input type="text" id="edit_tip_kode" name="kode" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Tipe Respon <span class="text-danger">*</span></label>
                        <input type="text" id="edit_tip_nama" name="nama" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Icon Bootstrap</label>
                        <input type="text" id="edit_tip_icon" name="icon" class="form-control rounded-3">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-dark" style="font-size: 13px;">Deskripsi Fungsi</label>
                        <textarea id="edit_tip_deskripsi" name="deskripsi" class="form-control rounded-3" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Perbarui Tipe Respon</button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // Tab preservation: check session or URL hash
        const activeTabId = "{{ session('active_tab', '') }}" || window.location.hash.replace('#', '');
        if (activeTabId) {
            const triggerEl = document.querySelector(`button[data-bs-target="#${activeTabId}"]`);
            if (triggerEl) {
                bootstrap.Tab.getOrCreateInstance(triggerEl).show();
            }
        } else {
            // Default to first tab
            const firstTab = document.querySelector('#masterTabs button');
            if (firstTab) bootstrap.Tab.getOrCreateInstance(firstTab).show();
        }

        // Save active tab in hash when user clicks
        document.querySelectorAll('#masterTabs button').forEach(button => {
            button.addEventListener('shown.bs.tab', function (event) {
                const target = event.target.getAttribute('data-bs-target');
                if (target) window.location.hash = target.replace('#', '');
            });
        });

        // 1. Edit Kategori Sampah
        $('.btn-edit-kategori').on('click', function() {
            const id = $(this).data('id');
            $('#formEditKategori').attr('action', `/admin/master/kategori-sampah/${id}`);
            $('#edit_kat_nama').val($(this).data('nama'));
            $('#edit_kat_slug').val($(this).data('slug'));
            $('#edit_kat_deskripsi').val($(this).data('deskripsi'));
            $('#edit_kat_is_daur_ulang').prop('checked', $(this).data('is-daur-ulang') == '1');
            $('#modalEditKategori').modal('show');
        });

        // 2. Edit Status Laporan
        $('.btn-edit-status').on('click', function() {
            const id = $(this).data('id');
            $('#formEditStatus').attr('action', `/admin/master/status-laporan/${id}`);
            $('#edit_st_kode').val($(this).data('kode'));
            $('#edit_st_nama').val($(this).data('nama'));
            $('#edit_st_badge').val($(this).data('badge-color'));
            $('#edit_st_urutan').val($(this).data('urutan'));
            $('#modalEditStatus').modal('show');
        });

        // 3. Edit Jenis Sampah
        $('.btn-edit-jenis').on('click', function() {
            const id = $(this).data('id');
            $('#formEditJenis').attr('action', `/admin/master/jenis-sampah/${id}`);
            $('#edit_jen_nama').val($(this).data('nama'));
            $('#edit_jen_nilai').val($(this).data('nilai'));
            $('#edit_jen_daur').prop('checked', $(this).data('dapat-didaur-ulang') == '1');
            $('#modalEditJenis').modal('show');
        });

        // 4. Edit Kategori Hadiah
        $('.btn-edit-kat-hadiah').on('click', function() {
            const id = $(this).data('id');
            $('#formEditKatHadiah').attr('action', `/admin/master/kategori-hadiah/${id}`);
            $('#edit_hdh_nama').val($(this).data('nama'));
            $('#edit_hdh_slug').val($(this).data('slug'));
            $('#edit_hdh_icon').val($(this).data('icon'));
            $('#modalEditKatHadiah').modal('show');
        });

        // 5. Edit Tipe Tanggapan
        $('.btn-edit-tipe').on('click', function() {
            const id = $(this).data('id');
            $('#formEditTipe').attr('action', `/admin/master/tipe-tanggapan/${id}`);
            $('#edit_tip_kode').val($(this).data('kode'));
            $('#edit_tip_nama').val($(this).data('nama'));
            $('#edit_tip_icon').val($(this).data('icon'));
            $('#edit_tip_deskripsi').val($(this).data('deskripsi'));
            $('#modalEditTipe').modal('show');
        });
    });
</script>
@endpush
