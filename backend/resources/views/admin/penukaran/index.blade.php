@extends('layouts.admin')

@section('title', 'Klaim & Penukaran Hadiah')
@section('page_title', 'Klaim Hadiah & Status Pengiriman')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Klaim Masuk</span>
                <div class="stat-icon purple"><i class="bi bi-box2-heart"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_penukaran']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Semua order penukaran</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Menunggu Konfirmasi</span>
                <div class="stat-icon amber"><i class="bi bi-hourglass-split text-warning"></i></div>
            </div>
            <h3 class="fw-bold text-warning mb-0">{{ number_format($stats['menunggu_konfirmasi']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Perlu verifikasi admin</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Sedang Dikirim (Ekspedisi)</span>
                <div class="stat-icon blue"><i class="bi bi-truck text-primary"></i></div>
            </div>
            <h3 class="fw-bold text-primary mb-0">{{ number_format($stats['dikirim']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Dalam perjalanan kirim resi</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Selesai Diterima Warga</span>
                <div class="stat-icon green"><i class="bi bi-check2-circle text-success"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['selesai']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Pengiriman tuntas</small>
        </div>
    </div>
</div>

<!-- Main Table Card -->
<div class="synto-card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Daftar Penukaran Poin & Pengiriman Hadiah</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Pantau alamat snapshot pengiriman dan kelola nomor resi paket reward.</p>
        </div>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'penukaran-table']) !!}
    </div>
</div>
@endsection

@push('scripts')
{!! $dataTable->scripts() !!}
@endpush
