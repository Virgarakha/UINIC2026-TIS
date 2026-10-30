@extends('layouts.admin')

@section('title', 'Buku Besar Poin Warga')
@section('page_title', 'Buku Besar & Riwayat Transaksi Poin')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Transaksi Poin</span>
                <div class="stat-icon purple"><i class="bi bi-clock-history"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_transaksi']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Aktivitas reward tercatat</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Poin Diberikan (Masuk)</span>
                <div class="stat-icon green"><i class="bi bi-arrow-down-left text-success"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">+{{ number_format($stats['poin_masuk']) }} Poin</h3>
            <small class="text-muted" style="font-size: 11px;">Dari laporan terverifikasi AI</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Poin Ditukarkan (Keluar)</span>
                <div class="stat-icon amber"><i class="bi bi-arrow-up-right text-warning"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">-{{ number_format($stats['poin_keluar']) }} Poin</h3>
            <small class="text-muted" style="font-size: 11px;">Klaim hadiah warga</small>
        </div>
    </div>
</div>

<!-- Ledger Table -->
<div class="synto-card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Buku Besar Audit Mutasi Poin</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Rekam jejak setiap perolehan poin dari laporan valid dan pengurangan poin klaim reward.</p>
        </div>
    </div>

    <div class="table-responsive">
        <table class="table align-middle w-100">
            <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                <tr>
                    <th>Warga Penerima</th>
                    <th>Jenis Mutasi</th>
                    <th>Nominal Poin</th>
                    <th>Referensi Transaksi</th>
                    <th>Keterangan</th>
                    <th>Waktu Mutasi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($riwayatList as $item)
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 12px;">
                                    {{ strtoupper(substr($item->user ? $item->user->name : 'W', 0, 1)) }}
                                </div>
                                <div class="d-flex flex-column">
                                    <span class="fw-semibold text-dark" style="font-size: 13px;">{{ $item->user ? $item->user->name : 'Warga' }}</span>
                                    <small class="text-secondary" style="font-size: 11px;">{{ $item->user ? $item->user->email : '-' }}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            @if($item->jenis_transaksi === 'masuk')
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 11px;">
                                    <i class="bi bi-arrow-down-left me-1"></i>Poin Masuk
                                </span>
                            @else
                                <span class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 11px;">
                                    <i class="bi bi-arrow-up-right me-1 text-warning"></i>Poin Keluar
                                </span>
                            @endif
                        </td>
                        <td>
                            <span class="fw-bold {{ $item->jenis_transaksi === 'masuk' ? 'text-success' : 'text-danger' }}" style="font-size: 13px;">
                                {{ $item->jenis_transaksi === 'masuk' ? '+' : '-' }}{{ number_format($item->jumlah_poin) }}
                            </span>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border px-2 py-0.5 rounded" style="font-size: 11px;">
                                {{ $item->referensi_tipe ?? '-' }} #{{ $item->referensi_id ?? '-' }}
                            </span>
                        </td>
                        <td>
                            <span class="text-dark" style="font-size: 12.5px;">{{ $item->keterangan ?? '-' }}</span>
                        </td>
                        <td>
                            <span class="text-secondary" style="font-size: 12px;">{{ $item->created_at ? $item->created_at->format('d M Y H:i') : '-' }}</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-center py-4 text-secondary">Belum ada mutasi poin warga yang tercatat.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="d-flex justify-content-end mt-3">
        {{ $riwayatList->links('pagination::bootstrap-5') }}
    </div>
</div>
@endsection
