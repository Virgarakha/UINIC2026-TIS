@extends('layouts.admin')

@section('title', 'Katalog Hadiah')
@section('page_title', 'Katalog Hadiah & Poin Reward Warga')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Item Katalog</span>
                <div class="stat-icon purple"><i class="bi bi-gift"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_katalog']) }} Item</h3>
            <small class="text-muted" style="font-size: 11px;">Pilihan penukaran poin</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Stok Tersedia</span>
                <div class="stat-icon green"><i class="bi bi-boxes"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['total_stok']) }} Unit</h3>
            <small class="text-muted" style="font-size: 11px;">Siap ditukarkan warga</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Klaim Dilakukan</span>
                <div class="stat-icon blue"><i class="bi bi-box2-heart"></i></div>
            </div>
            <h3 class="fw-bold text-primary mb-0">{{ number_format($stats['total_penukaran']) }} Transaksi</h3>
            <small class="text-muted" style="font-size: 11px;">Hadiah ditukar warga</small>
        </div>
    </div>
</div>

<!-- Main Table Card -->
<div class="synto-card p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 gap-3 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Daftar Katalog Hadiah & Reward</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Kelola saldo e-wallet, voucher pulsa/listrik, sembako, dan merchandise ramah lingkungan.</p>
        </div>
        <button type="button" class="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold shadow-sm" data-bs-toggle="modal" data-bs-target="#createHadiahModal">
            <i class="bi bi-plus-lg"></i> Tambah Item Hadiah
        </button>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'hadiah-table']) !!}
    </div>
</div>

<!-- Modal Tambah Hadiah Baru -->
<div class="modal fade" id="createHadiahModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.hadiah.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Tambah Item Hadiah Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label for="kategori_id" class="form-label fw-semibold text-dark" style="font-size: 13px;">Kategori Hadiah <span class="text-danger">*</span></label>
                        <select class="form-select rounded-3" id="kategori_id" name="kategori_id" required>
                            @foreach($kategoriList as $kat)
                                <option value="{{ $kat->id }}">{{ $kat->nama }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="nama_hadiah" class="form-label fw-semibold text-dark" style="font-size: 13px;">Nama Item Hadiah <span class="text-danger">*</span></label>
                        <input type="text" class="form-control rounded-3" id="nama_hadiah" name="nama_hadiah" required placeholder="Contoh: Voucher Belanja Sembako Rp 100.000">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label for="poin_dibutuhkan" class="form-label fw-semibold text-dark" style="font-size: 13px;">Poin Dibutuhkan <span class="text-danger">*</span></label>
                            <input type="number" class="form-control rounded-3" id="poin_dibutuhkan" name="poin_dibutuhkan" min="1" required placeholder="500">
                        </div>
                        <div class="col-6">
                            <label for="stok" class="form-label fw-semibold text-dark" style="font-size: 13px;">Stok Awal <span class="text-danger">*</span></label>
                            <input type="number" class="form-control rounded-3" id="stok" name="stok" min="0" required placeholder="20">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="foto_hadiah_url" class="form-label fw-semibold text-dark" style="font-size: 13px;">URL Foto Produk</label>
                        <input type="url" class="form-control rounded-3" id="foto_hadiah_url" name="foto_hadiah_url" placeholder="https://example.com/foto-hadiah.jpg">
                    </div>
                    <div class="mb-3">
                        <label for="deskripsi" class="form-label fw-semibold text-dark" style="font-size: 13px;">Deskripsi / Syarat Penukaran</label>
                        <textarea class="form-control rounded-3" id="deskripsi" name="deskripsi" rows="3" placeholder="Jelaskan mekanisme klaim..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Hadiah</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
{!! $dataTable->scripts() !!}
@endpush
