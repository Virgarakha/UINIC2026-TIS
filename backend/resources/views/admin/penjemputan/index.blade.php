@extends('layouts.admin')

@section('title', 'Penjemputan Pengepul')
@section('page_title', 'Penjemputan Sampah Daur Ulang (Mitra Pengepul)')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Penjemputan</span>
                <div class="stat-icon purple"><i class="bi bi-truck"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_penjemputan']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Semua order klaim</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Sedang Bergerak</span>
                <div class="stat-icon blue"><i class="bi bi-arrow-repeat"></i></div>
            </div>
            <h3 class="fw-bold text-primary mb-0">{{ number_format($stats['sedang_proses']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Klaim / menuju lokasi</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Selesai Diangkut</span>
                <div class="stat-icon green"><i class="bi bi-check-all"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['selesai']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Lokasi bersih diverifikasi</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Berat Daur Ulang</span>
                <div class="stat-icon amber"><i class="bi bi-recycle text-warning"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_berat_kg'], 1) }} kg</h3>
            <small class="text-muted" style="font-size: 11px;">Timbangan riil pengepul</small>
        </div>
    </div>
</div>

<!-- Main Table Card -->
<div class="synto-card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Daftar Penjemputan Sampah oleh Mitra Pengepul</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Verifikasi timbangan riil dan bukti foto lokasi bersih (*proof of pickup*).</p>
        </div>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'penjemputan-table']) !!}
    </div>
</div>
@endsection

@push('scripts')
{!! $dataTable->scripts() !!}
@endpush
