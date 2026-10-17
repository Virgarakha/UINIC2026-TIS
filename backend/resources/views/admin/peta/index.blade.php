@extends('layouts.admin')

@section('title', 'Peta Interaktif GIS')
@section('page_title', 'Peta Interaktif Pemantauan Sampah & Bahaya Lingkungan')

@push('styles')
<!-- Leaflet CSS for Admin GIS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<style>
    #adminMap {
        height: 680px;
        width: 100%;
        border-radius: 18px;
        z-index: 10;
    }
    .map-sidebar-card {
        background-color: #111111;
        border-radius: 18px;
        border: 1px solid #262626;
        color: #ffffff;
        height: 680px;
        display: flex;
        flex-direction: column;
    }
    .custom-map-pin {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
    }
    .pin-danger { background-color: #ef4444; }
    .pin-warning { background-color: #f59e0b; }
    .pin-success { background-color: #10b981; }
    .pin-primary { background-color: #4f46e5; }
</style>
@endpush

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-3">
    <div class="col-12 col-md-3">
        <div class="synto-card p-3 d-flex align-items-center gap-3">
            <div class="stat-icon blue"><i class="bi bi-geo-alt-fill"></i></div>
            <div>
                <span class="text-secondary fw-semibold" style="font-size: 12px;">Total Titik Dipetakan</span>
                <h4 class="fw-bold text-dark mb-0">{{ $stats['total_titik'] }} Titik</h4>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-3">
        <div class="synto-card p-3 d-flex align-items-center gap-3">
            <div class="stat-icon red"><i class="bi bi-shield-exclamation text-danger"></i></div>
            <div>
                <span class="text-secondary fw-semibold" style="font-size: 12px;">Potensi Bahaya Kritis</span>
                <h4 class="fw-bold text-danger mb-0">{{ $stats['kritis'] }} Titik</h4>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-3">
        <div class="synto-card p-3 d-flex align-items-center gap-3">
            <div class="stat-icon purple"><i class="bi bi-recycle"></i></div>
            <div>
                <span class="text-secondary fw-semibold" style="font-size: 12px;">Siap Diambil Pengepul</span>
                <h4 class="fw-bold text-primary mb-0">{{ $stats['siap_pengepul'] }} Titik</h4>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-3">
        <div class="synto-card p-3 d-flex align-items-center gap-3">
            <div class="stat-icon green"><i class="bi bi-check2-circle"></i></div>
            <div>
                <span class="text-secondary fw-semibold" style="font-size: 12px;">Selesai Ditangani</span>
                <h4 class="fw-bold text-success mb-0">{{ $stats['selesai'] }} Titik</h4>
            </div>
        </div>
    </div>
</div>

<!-- Map & Live Sidebar Container -->
<div class="row g-3">
    <!-- Map Container -->
    <div class="col-12 col-lg-8">
        <div class="synto-card p-2 position-relative">
            <div id="adminMap"></div>
        </div>
    </div>

    <!-- Live Sidebar Container (#111111 Dark Theme) -->
    <div class="col-12 col-lg-4">
        <div class="map-sidebar-card p-3">
            <!-- Sidebar Header -->
            <div class="pb-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="fw-bold text-white mb-0">Radar Titik Sampah</h6>
                    <small class="text-secondary" style="font-size: 11px;">Update real-time sensor & AI</small>
                </div>
                <span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-2 py-0.5 rounded-pill" style="font-size: 10px;">Live Feed</span>
            </div>

            <!-- List of Points -->
            <div class="flex-grow-1 overflow-y-auto py-2 pe-1" style="max-height: 520px;">
                @forelse($reports as $rep)
                    <div class="p-2.5 rounded-3 mb-2 border transition-all cursor-pointer" 
                         style="background-color: #1a1a1a; border-color: #2e2e2e;"
                         onclick="panToReport({{ $rep->latitude }}, {{ $rep->longitude }}, '{{ addslashes($rep->alamat_lokasi) }}')">
                        <div class="d-flex align-items-start gap-2.5">
                            <img src="{{ $rep->foto_url }}" class="rounded-2 object-fit-cover flex-shrink-0" style="width: 42px; height: 42px;" onerror="this.src='https://placehold.co/42x42?text=Foto'">
                            <div class="flex-grow-1 min-w-0">
                                <div class="d-flex align-items-center justify-content-between">
                                    <span class="fw-bold text-white text-truncate" style="font-size: 12.5px;">{{ $rep->alamat_lokasi ?? 'Titik Koordinat' }}</span>
                                    @if($rep->tipe_bahaya)
                                        <span class="badge bg-danger text-white rounded-pill px-1.5 py-0.5" style="font-size: 9px;">{{ $rep->tipe_bahaya }}</span>
                                    @elseif($rep->is_resiko_banjir)
                                        <span class="badge bg-danger text-white rounded-pill px-1.5 py-0.5" style="font-size: 9px;">Bahaya Kritis</span>
                                    @endif
                                </div>
                                <div class="d-flex align-items-center gap-2 mt-1 text-secondary" style="font-size: 11px;">
                                    <span>{{ $rep->kategori ? $rep->kategori->nama : 'Umum' }}</span>
                                    <span>•</span>
                                    <span>{{ $rep->total_tanggapan }} respon</span>
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-5 text-secondary">
                        <i class="bi bi-geo-alt display-6 d-block mb-2 opacity-50"></i>
                        <span style="font-size: 13px;">Belum ada titik laporan tercatat.</span>
                    </div>
                @endforelse
            </div>

            <!-- Legend Footer -->
            <div class="pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between text-secondary" style="font-size: 11px;">
                <span><span class="d-inline-block rounded-circle bg-danger me-1" style="width: 8px; height: 8px;"></span>Bahaya Lingkungan</span>
                <span><span class="d-inline-block rounded-circle bg-warning me-1" style="width: 8px; height: 8px;"></span>Sedang</span>
                <span><span class="d-inline-block rounded-circle bg-success me-1" style="width: 8px; height: 8px;"></span>Pengepul</span>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
    let map;
    const reportsData = @json($reports);

    document.addEventListener("DOMContentLoaded", function () {
        // Center around Malang (-7.9826, 112.6308)
        map = L.map('adminMap').setView([-7.9826, 112.6308], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        reportsData.forEach(rep => {
            if (!rep.latitude || !rep.longitude) return;

            let pinClass = 'pin-primary';
            let iconText = '📍';

            if (rep.tipe_bahaya || rep.is_resiko_banjir) {
                pinClass = 'pin-danger';
                const hazard = (rep.tipe_bahaya || '').toLowerCase();
                if (hazard.includes('wabah') || hazard.includes('dbd')) {
                    iconText = '🦟';
                } else if (hazard.includes('kebakaran') || hazard.includes('metana')) {
                    iconText = '🔥';
                } else if (hazard.includes('bau') || hazard.includes('pencemaran')) {
                    iconText = '☣️';
                } else if (hazard.includes('longsor')) {
                    iconText = '⚠️';
                } else {
                    iconText = '🌊';
                }
            } else if (rep.status && rep.status.kode === 'siap_diambil_pengepul') {
                pinClass = 'pin-success';
                iconText = '♻️';
            }

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div class="custom-map-pin ${pinClass}">${iconText}</div>`,
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            });

            const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon }).addTo(map);

            const popupContent = `
                <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
                    <img src="${rep.foto_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://placehold.co/220x110?text=Foto'">
                    <h6 style="font-weight: 700; margin-bottom: 2px; font-size: 13px;">${rep.alamat_lokasi || 'Lokasi Laporan'}</h6>
                    <p style="font-size: 11.5px; color: #64748b; margin-bottom: 6px;">${rep.deskripsi || '-'}</p>
                    <div style="display: flex; gap: 4px; font-size: 10.5px; font-weight: 600; margin-bottom: 8px;">
                        <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${rep.kategori ? rep.kategori.nama : 'Umum'}</span>
                        <span style="background: #fef2f2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${rep.total_tanggapan} Respon Warga</span>
                    </div>
                    <a href="/admin/laporan" style="display: block; text-align: center; background: #4f46e5; color: white; text-decoration: none; padding: 5px; border-radius: 6px; font-size: 11px; font-weight: 600;">Lihat di Manajemen Laporan</a>
                </div>
            `;

            marker.bindPopup(popupContent);
        });
    });

    function panToReport(lat, lng, address) {
        if (!map) return;
        map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
</script>
@endpush
