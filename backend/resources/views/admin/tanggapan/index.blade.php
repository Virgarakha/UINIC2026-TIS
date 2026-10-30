@extends('layouts.admin')

@section('title', 'Tanggapan Warga (Crowdsourcing)')
@section('page_title', 'Tanggapan Warga & Konfirmasi Komunitas')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Tanggapan Masuk</span>
                <div class="stat-icon blue"><i class="bi bi-chat-left-text"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_tanggapan']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Konfirmasi & update warga</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Foto Bukti Perkembangan</span>
                <div class="stat-icon purple"><i class="bi bi-camera"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_foto_tambahan']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Foto tambahan dari titik sama</small>
        </div>
    </div>
    <div class="col-12 col-sm-4">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Warga Berpartisipasi</span>
                <div class="stat-icon green"><i class="bi bi-people"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['warga_berpartisipasi']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Kontributor aktif crowdsourcing</small>
        </div>
    </div>
</div>

<!-- Responses Table -->
<div class="synto-card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Linimasa Tanggapan Warga di Lokasi Laporan</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Warga lain yang mengonfirmasi keberadaan sampah atau mengunggah foto perkembangan.</p>
        </div>
    </div>

    <div class="table-responsive">
        <table class="table align-middle w-100">
            <thead class="table-light" style="font-size: 12px; text-transform: uppercase;">
                <tr>
                    <th>Warga Penanggap</th>
                    <th>Titik Laporan Utama</th>
                    <th>Tipe Respon</th>
                    <th>Komentar / Catatan</th>
                    <th>Foto Tambahan</th>
                    <th>Waktu Respon</th>
                </tr>
            </thead>
            <tbody>
                @forelse($tanggapanList as $item)
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 12px;">
                                    {{ strtoupper(substr($item->user ? $item->user->name : 'W', 0, 1)) }}
                                </div>
                                <div class="d-flex flex-column">
                                    <span class="fw-semibold text-dark" style="font-size: 13px;">{{ $item->user ? $item->user->name : 'Warga Anonim' }}</span>
                                    <small class="text-secondary" style="font-size: 11px;">{{ $item->user ? $item->user->email : '-' }}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-column" style="max-width: 220px;">
                                <a href="{{ route('admin.laporan.index') }}" class="fw-bold text-primary text-decoration-none" style="font-size: 12.5px;">#LAP-{{ $item->laporan_id }}</a>
                                <span class="text-dark text-truncate" style="font-size: 12px;">{{ $item->laporan ? $item->laporan->alamat_lokasi : '-' }}</span>
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border px-2 py-1 rounded-pill" style="font-size: 11.5px;">
                                <i class="bi {{ $item->tipeTanggapan ? $item->tipeTanggapan->icon : 'bi-chat-dots' }} me-1 text-primary"></i>
                                {{ $item->tipeTanggapan ? $item->tipeTanggapan->nama : 'Respon' }}
                            </span>
                        </td>
                        <td>
                            <span class="text-dark" style="font-size: 12.5px;">{{ $item->komentar ?? '-' }}</span>
                        </td>
                        <td>
                            @if($item->foto_bukti_tambahan_url)
                                <a href="{{ $item->foto_bukti_tambahan_url }}" target="_blank">
                                    <img src="{{ $item->foto_bukti_tambahan_url }}" class="rounded-2 border object-fit-cover shadow-xs" style="width: 40px; height: 40px;" alt="Bukti Tambahan">
                                </a>
                            @else
                                <span class="text-muted" style="font-size: 12px;">-</span>
                            @endif
                        </td>
                        <td>
                            <span class="text-secondary" style="font-size: 12px;">{{ $item->created_at ? $item->created_at->format('d M Y H:i') : '-' }}</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-center py-4 text-secondary">Belum ada respon tanggapan warga yang tercatat.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="d-flex justify-content-end mt-3">
        {{ $tanggapanList->links('pagination::bootstrap-5') }}
    </div>
</div>
@endsection
