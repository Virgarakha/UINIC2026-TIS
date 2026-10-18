@extends('layouts.admin')

@section('title', 'Laporan Sampah & Titik Rawan')
@section('page_title', 'Laporan Sampah & Monitoring Titik Rawan')

@push('styles')
<!-- Leaflet CSS for Mini Map Preview -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<style>
    .cursor-pointer { cursor: pointer; }
    .shadow-2xs { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); }
    .nav-tabs-custom {
        border-bottom: 2px solid #f1f5f9;
        gap: 0.5rem;
    }
    .nav-tabs-custom .nav-link {
        border: none;
        color: #64748b;
        font-weight: 600;
        font-size: 13.5px;
        padding: 0.65rem 1.1rem;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    .nav-tabs-custom .nav-link:hover {
        color: #1e293b;
        background-color: #f8fafc;
    }
    .nav-tabs-custom .nav-link.active {
        color: #0EB29A;
        background-color: #e6f7f5;
    }
    #modalMiniMap {
        height: 240px;
        width: 100%;
        border-radius: 12px;
        z-index: 10;
    }
    .timeline-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #fff;
    }
</style>
@endpush

@section('content')
<!-- Page Header: Title & Quick Actions -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
    <div>
        <div class="d-flex align-items-center gap-2 mb-1">
            <h4 class="fw-bold mb-0 text-dark">Laporan Sampah & Titik Rawan</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-2 py-0.5 rounded-pill" style="font-size: 11px;">
                <i class="bi bi-broadcast me-1"></i>Live Surveillance
            </span>
        </div>
        <p class="text-secondary mb-0" style="font-size: 13px;">Pusat kendali laporan limbah masyarakat, evaluasi risiko luapan AI multimodal, dan disposisi penanganan dinas.</p>
    </div>
    <div class="d-flex align-items-center gap-2 flex-wrap">
        <a href="{{ route('admin.peta.index') }}" class="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold">
            <i class="bi bi-map-fill"></i> Peta Interaktif (GIS)
        </a>
        <a href="{{ route('admin.analisis-ai.index') }}" class="btn btn-sm btn-light border rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold text-secondary">
            <i class="bi bi-cpu-fill text-primary"></i> Analisis AI & Hidrologi
        </a>
        <a href="{{ route('admin.peringatan-dini.index') }}" class="btn btn-sm text-white rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold" style="background-color: #0EB29A;">
            <i class="bi bi-shield-exclamation"></i> Broadcast Bahaya
        </a>
    </div>
</div>

<!-- 4 Top Stat Cards (Primary KPIs) -->
<div class="row g-3 mb-3">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Laporan Warga</span>
                <div class="stat-icon blue"><i class="bi bi-trash3-fill"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-1">{{ number_format($stats['total_laporan']) }}</h3>
            <div class="d-flex align-items-center gap-1.5 text-secondary" style="font-size: 11.5px;">
                <span class="badge bg-primary bg-opacity-10 text-primary px-1.5 py-0.5 rounded-pill">{{ $stats['menunggu_verifikasi'] }} Menunggu</span>
                <span>• Titik tercatat aktif</span>
            </div>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Bahaya Kritis & Luapan</span>
                <div class="stat-icon amber"><i class="bi bi-exclamation-triangle-fill text-danger"></i></div>
            </div>
            <h3 class="fw-bold text-danger mb-1">{{ number_format($stats['laporan_kritis']) }}</h3>
            <div class="d-flex align-items-center gap-1.5 text-secondary" style="font-size: 11.5px;">
                <span class="badge bg-danger bg-opacity-10 text-danger px-1.5 py-0.5 rounded-pill">Prioritas Tinggi</span>
                <span>• Sumbatan drainase / sungai</span>
            </div>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Siap Diambil Pengepul</span>
                <div class="stat-icon purple"><i class="bi bi-recycle"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-1">{{ number_format($stats['siap_pengepul']) }}</h3>
            <div class="d-flex align-items-center gap-1.5 text-secondary" style="font-size: 11.5px;">
                <span class="badge bg-info bg-opacity-10 text-info px-1.5 py-0.5 rounded-pill">Sirkular Ekonomi</span>
                <span>• Sampah daur ulang terpilah</span>
            </div>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Selesai Dibersihkan</span>
                <div class="stat-icon green"><i class="bi bi-check-circle-fill text-success"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-1">{{ number_format($stats['laporan_selesai']) }}</h3>
            <div class="d-flex align-items-center gap-1.5 text-secondary" style="font-size: 11.5px;">
                <span class="badge bg-success bg-opacity-10 text-success px-1.5 py-0.5 rounded-pill">100% Tuntas</span>
                <span>• Ditangani dinas / mitra</span>
            </div>
        </div>
    </div>
</div>

<!-- Secondary Metrics Strip -->
<div class="synto-card p-3 mb-4 bg-white border">
    <div class="row g-3 align-items-center text-center text-sm-start">
        <div class="col-12 col-sm-6 col-lg-3 border-end-lg">
            <div class="d-flex align-items-center gap-2.5 justify-content-center justify-content-sm-start">
                <div class="p-2 rounded-3 bg-light text-primary">
                    <i class="bi bi-cpu fs-5"></i>
                </div>
                <div>
                    <small class="text-muted d-block" style="font-size: 11.5px;">Terverifikasi AI</small>
                    <span class="fw-bold text-dark" style="font-size: 15px;">{{ $stats['terverifikasi_ai'] }} Titik Lolos AI</span>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3 border-end-lg">
            <div class="d-flex align-items-center gap-2.5 justify-content-center justify-content-sm-start">
                <div class="p-2 rounded-3 bg-light text-success">
                    <i class="bi bi-shield-check fs-5"></i>
                </div>
                <div>
                    <small class="text-muted d-block" style="font-size: 11.5px;">Akurasi Rata-rata AI</small>
                    <span class="fw-bold text-dark" style="font-size: 15px;">{{ $stats['avg_confidence'] }}% Confidence</span>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3 border-end-lg">
            <div class="d-flex align-items-center gap-2.5 justify-content-center justify-content-sm-start">
                <div class="p-2 rounded-3 bg-light text-warning">
                    <i class="bi bi-box-seam fs-5"></i>
                </div>
                <div>
                    <small class="text-muted d-block" style="font-size: 11.5px;">Estimasi Akumulasi Volume</small>
                    <span class="fw-bold text-dark" style="font-size: 15px;">{{ $stats['total_volume_m3'] }} m³ Sampah</span>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
            <div class="d-flex align-items-center gap-2.5 justify-content-center justify-content-sm-start">
                <div class="p-2 rounded-3 bg-light text-info">
                    <i class="bi bi-clock-history fs-5"></i>
                </div>
                <div>
                    <small class="text-muted d-block" style="font-size: 11.5px;">Menunggu Verifikasi</small>
                    <span class="fw-bold text-dark" style="font-size: 15px;">{{ $stats['menunggu_verifikasi'] }} Laporan Antrean</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Main Table Card & Filter Toolbar -->
<div class="synto-card p-4">
    <!-- Filter Toolbar -->
    <div class="p-3 mb-4 rounded-3 border bg-light-subtle">
        <div class="row g-2.5 align-items-end">
            <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-dark fw-semibold mb-1" style="font-size: 12px;">Filter Status</label>
                <select id="filter_status" class="form-select form-select-sm rounded-3">
                    <option value="">Semua Status Laporan</option>
                    @foreach($statuses as $st)
                        <option value="{{ $st->id }}">{{ $st->nama }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-dark fw-semibold mb-1" style="font-size: 12px;">Filter Kategori</label>
                <select id="filter_kategori" class="form-select form-select-sm rounded-3">
                    <option value="">Semua Kategori Sampah</option>
                    @foreach($kategoris as $kt)
                        <option value="{{ $kt->id }}">{{ $kt->nama }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <label class="form-label text-dark fw-semibold mb-1" style="font-size: 12px;">Risiko Banjir & Bahaya</label>
                <select id="filter_hazard" class="form-select form-select-sm rounded-3">
                    <option value="">Semua Tingkat Bahaya</option>
                    <option value="kritis">Bahaya Kritis & Potensi Banjir</option>
                    <option value="aman">Aman / Risiko Rendah</option>
                </select>
            </div>
            <div class="col-12 col-sm-6 col-lg-3 d-flex gap-2">
                <button type="button" id="btn-apply-filters" class="btn btn-sm text-white rounded-3 flex-grow-1 fw-semibold" style="background-color: #0EB29A;">
                    <i class="bi bi-funnel-fill me-1"></i> Terapkan
                </button>
                <button type="button" id="btn-reset-filters" class="btn btn-sm btn-light border rounded-3 fw-semibold text-secondary" title="Reset Filter">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- DataTable Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 gap-3 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-0.5">Daftar Laporan Sampah Masuk</h5>
            <p class="text-secondary mb-0" style="font-size: 12.5px;">Monitoring titik limbah, verifikasi foto warga, dan status tanggap darurat.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
            <button type="button" id="btn-reload-table" class="btn btn-sm btn-light border rounded-3 px-3 py-1.5 fw-semibold text-secondary">
                <i class="bi bi-arrow-repeat me-1"></i> Muat Ulang
            </button>
        </div>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table table-hover align-middle w-100', 'id' => 'laporan-table']) !!}
    </div>
</div>

<!-- ========================================== -->
<!-- MODAL 1: DETAIL LENGKAP & EVALUASI AI -->
<!-- ========================================== -->
<div class="modal fade" id="detailLaporanModal" tabindex="-1" aria-labelledby="detailLaporanModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <!-- Modal Header -->
            <div class="modal-header border-bottom px-4 py-3 bg-light">
                <div class="d-flex align-items-center gap-2.5">
                    <div class="p-2 rounded-3 bg-white border text-primary shadow-2xs">
                        <i class="bi bi-file-earmark-text-fill fs-5"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <h5 class="modal-title fw-bold text-dark mb-0" id="detailModalTitle">Laporan #LAP-</h5>
                            <span id="detailModalStatusBadge" class="badge rounded-pill px-2.5 py-1 fw-bold" style="font-size: 11px;">-</span>
                            <span id="detailModalHazardBadge" class="badge rounded-pill px-2.5 py-1 fw-bold" style="font-size: 11px;">-</span>
                        </div>
                        <small id="detailModalTime" class="text-muted" style="font-size: 11.5px;">-</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Modal Nav Tabs -->
            <div class="px-4 pt-3 border-bottom bg-white">
                <ul class="nav nav-tabs nav-tabs-custom" id="detailTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-summary-btn" data-bs-toggle="tab" data-bs-target="#tab-summary" type="button" role="tab">
                            <i class="bi bi-info-circle me-1.5"></i> Ringkasan & Bukti Foto
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-ai-btn" data-bs-toggle="tab" data-bs-target="#tab-ai" type="button" role="tab">
                            <i class="bi bi-cpu me-1.5"></i> Analisis AI Vision & Hidrologi
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-community-btn" data-bs-toggle="tab" data-bs-target="#tab-community" type="button" role="tab">
                            <i class="bi bi-chat-left-dots me-1.5"></i> Respon Warga & Timeline Audit
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Modal Body Tabs Content -->
            <div class="modal-body p-4 bg-light-subtle">
                <div class="tab-content" id="detailTabsContent">
                    <!-- TAB 1: Ringkasan & Bukti Foto -->
                    <div class="tab-pane fade show active" id="tab-summary" role="tabpanel">
                        <div class="row g-4">
                            <!-- Left: Foto Bukti HD -->
                            <div class="col-12 col-lg-5">
                                <div class="synto-card p-3 h-100 bg-white">
                                    <span class="fw-bold text-dark d-block mb-2" style="font-size: 13px;">Bukti Foto Warga</span>
                                    <div class="position-relative overflow-hidden rounded-3 border bg-dark text-center cursor-pointer report-photo-trigger" id="detailPhotoContainer" style="height: 250px;">
                                        <img id="detailFoto" src="" alt="Bukti Foto" class="w-100 h-100 object-fit-cover">
                                        <div class="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75 text-white d-flex align-items-center justify-content-between" style="font-size: 11px;">
                                            <span><i class="bi bi-zoom-in me-1"></i>Klik untuk perbesar</span>
                                            <span class="badge bg-primary rounded-pill">Bukti Utama</span>
                                        </div>
                                    </div>

                                    <!-- Deskripsi Pelapor -->
                                    <div class="mt-3">
                                        <span class="fw-bold text-dark d-block mb-1" style="font-size: 12.5px;">Deskripsi / Keluhan Warga:</span>
                                        <p id="detailDeskripsi" class="text-secondary p-2.5 rounded-3 border bg-light mb-0" style="font-size: 12.5px;">-</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Pelapor & Lokasi Mini Map -->
                            <div class="col-12 col-lg-7">
                                <div class="row g-3">
                                    <!-- Pelapor Card -->
                                    <div class="col-12">
                                        <div class="synto-card p-3 bg-white">
                                            <span class="fw-bold text-dark d-block mb-2" style="font-size: 13px;">Informasi Pelapor</span>
                                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                <div class="d-flex align-items-center gap-2.5">
                                                    <div id="detailPelaporAvatar" class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; font-size: 16px;">
                                                        U
                                                    </div>
                                                    <div>
                                                        <h6 id="detailPelaporNama" class="fw-bold text-dark mb-0" style="font-size: 14px;">-</h6>
                                                        <small id="detailPelaporEmail" class="text-secondary d-block" style="font-size: 11.5px;">-</small>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-center gap-2">
                                                    <span id="detailPelaporRole" class="badge bg-light text-dark border px-2 py-1 rounded-pill" style="font-size: 11px;">Warga</span>
                                                    <span id="detailPoinReward" class="badge bg-warning bg-opacity-25 text-dark border border-warning border-opacity-50 px-2 py-1 rounded-pill fw-bold" style="font-size: 11px;">
                                                        <i class="bi bi-star-fill text-warning me-1"></i>+0 Poin
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Lokasi & Mini Leaflet Map -->
                                    <div class="col-12">
                                        <div class="synto-card p-3 bg-white">
                                            <div class="d-flex align-items-center justify-content-between mb-2">
                                                <div>
                                                    <span class="fw-bold text-dark" style="font-size: 13px;">Titik Koordinat & Peta Mini</span>
                                                    <small id="detailAlamat" class="text-secondary d-block text-truncate" style="max-width: 320px; font-size: 12px;">-</small>
                                                </div>
                                                <a id="detailGoogleMapsLink" href="#" target="_blank" class="btn btn-sm btn-light border rounded-3 px-2.5 py-1 text-danger" style="font-size: 11.5px;">
                                                    <i class="bi bi-google me-1"></i> Google Maps
                                                </a>
                                            </div>
                                            <!-- Mini Map Container -->
                                            <div id="modalMiniMap" class="border"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: Analisis AI Vision & Hidrologi -->
                    <div class="tab-pane fade" id="tab-ai" role="tabpanel">
                        <div class="row g-3">
                            <!-- Metrik AI -->
                            <div class="col-12 col-md-4">
                                <div class="synto-card p-3 bg-white h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="text-secondary fw-semibold" style="font-size: 12px;">Skor Keyakinan AI</span>
                                        <i class="bi bi-cpu text-primary fs-5"></i>
                                    </div>
                                    <h4 id="detailAiConfidence" class="fw-bold text-primary mb-1">0%</h4>
                                    <div class="progress rounded-pill mb-2" style="height: 6px;">
                                        <div id="detailAiConfidenceBar" class="progress-bar bg-primary" role="progressbar" style="width: 0%;"></div>
                                    </div>
                                    <small id="detailAiModel" class="text-muted" style="font-size: 11px;">Model: Gemini Multimodal</small>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="synto-card p-3 bg-white h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="text-secondary fw-semibold" style="font-size: 12px;">Estimasi Volume & Berat</span>
                                        <i class="bi bi-box-seam text-warning fs-5"></i>
                                    </div>
                                    <h4 id="detailAiVolume" class="fw-bold text-dark mb-1">0 m³</h4>
                                    <small id="detailAiBerat" class="text-secondary d-block" style="font-size: 11.5px;">Estimasi Berat: - kg</small>
                                    <small id="detailAiEkonomi" class="text-success fw-semibold" style="font-size: 11.5px;">Nilai Ekonomi: Rp 0</small>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="synto-card p-3 bg-white h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="text-secondary fw-semibold" style="font-size: 12px;">Potensi Bahaya Luapan</span>
                                        <i class="bi bi-water text-danger fs-5"></i>
                                    </div>
                                    <h4 id="detailAiRisk" class="fw-bold text-danger mb-1">-</h4>
                                    <small id="detailAiSumbatan" class="text-secondary d-block" style="font-size: 11.5px;">Sumbatan Aliran Air: 0%</small>
                                    <small id="detailAiHazard" class="text-muted" style="font-size: 11px;">Tipe Bahaya: -</small>
                                </div>
                            </div>

                            <!-- Detail Deteksi Komputer & Rekomendasi -->
                            <div class="col-12 col-lg-7">
                                <div class="synto-card p-3 bg-white h-100">
                                    <span class="fw-bold text-dark d-block mb-2" style="font-size: 13px;">Objek Terdeteksi & Rekomendasi Tindakan AI</span>
                                    <div class="mb-3">
                                        <span class="text-muted d-block mb-1" style="font-size: 11.5px;">Jenis Sampah Dominan:</span>
                                        <div id="detailAiDominan" class="d-flex flex-wrap gap-1">
                                            <span class="badge bg-light text-dark border px-2 py-1 rounded-pill">-</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-muted d-block mb-1" style="font-size: 11.5px;">Instruksi & Rekomendasi Penanganan:</span>
                                        <div id="detailAiRekomendasi" class="p-3 rounded-3 bg-light border text-dark" style="font-size: 12.5px; line-height: 1.5;">
                                            -
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Sensor Telemetri Hidrologi & Cuaca -->
                            <div class="col-12 col-lg-5">
                                <div class="synto-card p-3 bg-white h-100">
                                    <span class="fw-bold text-dark d-block mb-2" style="font-size: 13px;">Sensor Telemetri Lingkungan BMKG</span>
                                    <div class="d-flex flex-column gap-2" id="detailTelemetriContainer">
                                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border bg-light">
                                            <span class="text-secondary small" style="font-size: 12px;"><i class="bi bi-cloud-rain text-primary me-1.5"></i> Curah Hujan</span>
                                            <span id="detailHujan" class="fw-bold text-dark" style="font-size: 12px;">- mm</span>
                                        </div>
                                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border bg-light">
                                            <span class="text-secondary small" style="font-size: 12px;"><i class="bi bi-water text-info me-1.5"></i> Ketinggian Air</span>
                                            <span id="detailMukaAir" class="fw-bold text-dark" style="font-size: 12px;">- cm</span>
                                        </div>
                                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border bg-light">
                                            <span class="text-secondary small" style="font-size: 12px;"><i class="bi bi-speedometer2 text-warning me-1.5"></i> Kecepatan Aliran</span>
                                            <span id="detailKecepatanArus" class="fw-bold text-dark" style="font-size: 12px;">- m/s</span>
                                        </div>
                                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border bg-light">
                                            <span class="text-secondary small" style="font-size: 12px;"><i class="bi bi-sun text-warning me-1.5"></i> Prakiraan Cuaca</span>
                                            <span id="detailCuaca" class="fw-bold text-dark" style="font-size: 12px;">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 3: Respon Warga, Pengepul & Timeline Audit -->
                    <div class="tab-pane fade" id="tab-community" role="tabpanel">
                        <div class="row g-3">
                            <!-- Tanggapan & Foto Warga -->
                            <div class="col-12 col-lg-7">
                                <div class="synto-card p-3 bg-white h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                        <span class="fw-bold text-dark" style="font-size: 13px;">Respon & Konfirmasi Masyarakat Sekitar</span>
                                        <span id="detailTotalTanggapanBadge" class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0.5" style="font-size: 11px;">0 Tanggapan</span>
                                    </div>
                                    <div id="detailTanggapanList" class="overflow-y-auto pe-1" style="max-height: 380px;">
                                        <!-- Rendered via JS -->
                                    </div>
                                </div>
                            </div>

                            <!-- Audit Trail & Penjemputan -->
                            <div class="col-12 col-lg-5">
                                <div class="synto-card p-3 bg-white h-100">
                                    <span class="fw-bold text-dark d-block mb-3 pb-2 border-bottom" style="font-size: 13px;">Riwayat Status & Audit Trail</span>
                                    <div id="detailRiwayatStatusList" class="position-relative overflow-y-auto ps-3 pe-1" style="max-height: 380px;">
                                        <!-- Rendered via JS -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer border-top px-4 py-3 bg-white d-flex align-items-center justify-content-between">
                <div>
                    <a id="btnDetailOpenMap" href="#" class="btn btn-sm btn-outline-success rounded-3 px-3 fw-semibold">
                        <i class="bi bi-geo-alt-fill me-1"></i> Buka di Peta GIS
                    </a>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-sm btn-light border rounded-3 px-3 fw-semibold text-secondary" data-bs-dismiss="modal">Tutup</button>
                    <button type="button" id="btnDetailTriggerUpdate" class="btn btn-sm text-white rounded-3 px-3 fw-semibold" style="background-color: #4f46e5;">
                        <i class="bi bi-pencil-square me-1"></i> Ubah Status Laporan
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ========================================== -->
<!-- MODAL 2: UBAH STATUS & REWARD POIN WARGA -->
<!-- ========================================== -->
<div class="modal fade" id="updateStatusModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <form id="updateStatusForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom px-4 py-3 bg-light">
                    <div class="d-flex align-items-center gap-2">
                        <div class="stat-icon purple" style="width: 32px; height: 32px; font-size: 15px;">
                            <i class="bi bi-pencil-square"></i>
                        </div>
                        <h5 class="modal-title fw-bold text-dark mb-0">Ubah Status & Disposisi Laporan</h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label for="modal_status_id" class="form-label fw-semibold text-dark" style="font-size: 13px;">Status Penanganan <span class="text-danger">*</span></label>
                        <select class="form-select rounded-3" id="modal_status_id" name="status_id" required>
                            @foreach($statuses as $st)
                                <option value="{{ $st->id }}">{{ $st->nama }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="modal_catatan" class="form-label fw-semibold text-dark" style="font-size: 13px;">Catatan Disposisi / Instruksi Petugas</label>
                        <textarea class="form-control rounded-3" id="modal_catatan" name="catatan" rows="3" placeholder="Contoh: Petugas UPT Kebersihan Sukun telah diterjunkan ke lokasi untuk pembersihan saluran air..."></textarea>
                    </div>
                    <div class="p-3 rounded-3 border bg-warning bg-opacity-10 border-warning border-opacity-25 mb-2">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <label for="modal_bonus_poin" class="form-label fw-bold text-dark mb-0" style="font-size: 12.5px;">
                                <i class="bi bi-gift-fill text-warning me-1"></i> Berikan Bonus Poin Reward ke Warga
                            </label>
                            <span class="badge bg-warning text-dark rounded-pill" style="font-size: 10px;">Opsional</span>
                        </div>
                        <p class="text-secondary mb-2" style="font-size: 11.5px;">Berikan insentif poin tambahan jika laporan warga sangat akurat dan terbukti membantu pencegahan luapan air.</p>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control rounded-start-3" id="modal_bonus_poin" name="bonus_poin" min="0" max="500" placeholder="0">
                            <span class="input-group-text bg-white border-start-0 rounded-end-3 text-muted">Poin</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top px-4 py-3 bg-light">
                    <button type="button" class="btn btn-sm btn-light border rounded-3 px-3 fw-semibold text-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" id="btnSubmitStatus" class="btn btn-sm text-white rounded-3 px-4 fw-semibold" style="background-color: #0EB29A;">
                        <i class="bi bi-check2-circle me-1"></i> Simpan Status
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ========================================== -->
<!-- MODAL 3: LIGHTBOX PREVIEW FOTO HD -->
<!-- ========================================== -->
<div class="modal fade" id="imageLightboxModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-dark">
            <div class="modal-header border-bottom border-secondary border-opacity-25 px-3 py-2 text-white">
                <span id="lightboxTitle" class="fw-bold" style="font-size: 13px;">Bukti Foto</span>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0 text-center bg-black d-flex align-items-center justify-content-center" style="min-height: 420px; max-height: 80vh;">
                <img id="lightboxImage" src="" alt="Bukti Foto HD" class="img-fluid" style="max-height: 80vh; object-fit: contain;">
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- Leaflet JS for Mini Map Preview -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

{!! $dataTable->scripts() !!}

<script>
    let miniMap = null;
    let miniMapMarker = null;
    let currentLaporanData = null;

    $(document).ready(function () {
        const table = window.LaravelDataTables['laporan-table'];

        // Custom Filters Apply & Reset
        $('#btn-apply-filters').on('click', function () {
            applyDataTableFilters();
        });

        $('#btn-reset-filters').on('click', function () {
            $('#filter_status').val('');
            $('#filter_kategori').val('');
            $('#filter_hazard').val('');
            applyDataTableFilters();
        });

        $('#btn-reload-table').on('click', function () {
            table.ajax.reload(null, false);
        });

        function applyDataTableFilters() {
            const statusId = $('#filter_status').val();
            const kategoriId = $('#filter_kategori').val();
            const hazard = $('#filter_hazard').val();

            table.on('preXhr.dt', function (e, settings, data) {
                data.status_id = statusId;
                data.kategori_id = kategoriId;
                data.hazard = hazard;
            });

            table.ajax.reload();
        }

        // Lightbox trigger for images
        $(document).on('click', '.report-photo-trigger', function () {
            const src = $(this).data('img-src') || $(this).find('img').attr('src');
            const title = $(this).data('title') || 'Bukti Foto Laporan';
            if (!src) return;

            $('#lightboxImage').attr('src', src);
            $('#lightboxTitle').text(title);
            $('#imageLightboxModal').modal('show');
        });

        // Detail Laporan Modal Trigger
        $(document).on('click', '.btn-detail-laporan', function () {
            const id = $(this).data('id');
            loadLaporanDetail(id);
        });

        // Update Status Trigger
        $(document).on('click', '.btn-update-status', function () {
            const id = $(this).data('id');
            const statusId = $(this).data('status-id');
            openUpdateStatusModal(id, statusId);
        });

        // Trigger Update from Detail Modal
        $('#btnDetailTriggerUpdate').on('click', function () {
            if (currentLaporanData) {
                $('#detailLaporanModal').modal('hide');
                setTimeout(() => {
                    openUpdateStatusModal(currentLaporanData.id, currentLaporanData.status_id);
                }, 350);
            }
        });

        function openUpdateStatusModal(id, statusId) {
            const form = document.getElementById('updateStatusForm');
            form.action = `/admin/laporan/${id}`;
            $('#modal_status_id').val(statusId);
            $('#modal_catatan').val('');
            $('#modal_bonus_poin').val('');
            $('#updateStatusModal').modal('show');
        }

        // Submit Status Update via AJAX
        $('#updateStatusForm').on('submit', function (e) {
            e.preventDefault();
            const form = $(this);
            const url = form.attr('action');
            const submitBtn = $('#btnSubmitStatus');
            const originalText = submitBtn.html();

            submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Menyimpan...');

            $.ajax({
                url: url,
                type: 'POST',
                data: form.serialize(),
                success: function (res) {
                    $('#updateStatusModal').modal('hide');
                    submitBtn.prop('disabled', false).html(originalText);
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: res.message || 'Status laporan berhasil diperbarui.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    table.ajax.reload(null, false);
                },
                error: function (xhr) {
                    submitBtn.prop('disabled', false).html(originalText);
                    const msg = xhr.responseJSON?.message || 'Gagal memperbarui status laporan.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Terjadi Kesalahan',
                        text: msg,
                    });
                }
            });
        });

        // Delete Report Trigger via AJAX
        $(document).on('click', '.btn-delete-laporan', function () {
            const id = $(this).data('id');
            Swal.fire({
                title: 'Hapus Laporan #' + id + '?',
                text: 'Data laporan, bukti foto, dan riwayat analisis terkait akan dihapus permanen!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Ya, Hapus',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/admin/laporan/${id}`,
                        type: 'DELETE',
                        success: function (res) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Terhapus!',
                                text: res.message || 'Laporan berhasil dihapus.',
                                timer: 1800,
                                showConfirmButton: false
                            });
                            table.ajax.reload(null, false);
                        },
                        error: function (xhr) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal!',
                                text: xhr.responseJSON?.message || 'Gagal menghapus laporan.'
                            });
                        }
                    });
                }
            });
        });

        // Load Report Detail via AJAX
        function loadLaporanDetail(id) {
            Swal.fire({
                title: 'Memuat data laporan...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: `/admin/laporan/${id}`,
                type: 'GET',
                success: function (res) {
                    Swal.close();
                    if (!res.success || !res.data) {
                        Swal.fire('Error', 'Data laporan tidak ditemukan.', 'error');
                        return;
                    }

                    const data = res.data;
                    currentLaporanData = data;

                    // Set Header
                    $('#detailModalTitle').text(`Laporan #LAP-${data.id}`);
                    const statusName = data.status ? data.status.nama : 'Menunggu';
                    const statusColor = data.status ? data.status.badge_color : 'secondary';
                    $('#detailModalStatusBadge')
                        .attr('class', `badge bg-${statusColor} bg-opacity-10 text-${statusColor} border border-${statusColor} border-opacity-25 rounded-pill px-2.5 py-1 fw-bold`)
                        .text(statusName);

                    const hazard = data.tipe_bahaya || (data.is_resiko_banjir ? 'Banjir & Luapan' : null);
                    if (hazard) {
                        $('#detailModalHazardBadge')
                            .attr('class', 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-2.5 py-1 fw-bold')
                            .text(hazard)
                            .show();
                    } else {
                        $('#detailModalHazardBadge').hide();
                    }

                    const createdDate = data.created_at ? new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : '-';
                    $('#detailModalTime').text(`Dilaporkan pada: ${createdDate}`);

                    // TAB 1: Summary
                    $('#detailFoto').attr('src', data.foto_url);
                    $('#detailPhotoContainer').data('img-src', data.foto_url).data('title', `Laporan #LAP-${data.id}`);
                    $('#detailDeskripsi').text(data.deskripsi || 'Tidak ada catatan tambahan dari warga.');

                    // Pelapor
                    if (data.pelapor) {
                        $('#detailPelaporNama').text(data.pelapor.name);
                        $('#detailPelaporEmail').text(data.pelapor.email || '-');
                        $('#detailPelaporAvatar').text(data.pelapor.name.charAt(0).toUpperCase());
                        $('#detailPelaporRole').text(data.pelapor.role.toUpperCase());
                    } else {
                        $('#detailPelaporNama').text('Warga Anonim / Publik');
                        $('#detailPelaporEmail').text('Tidak terdaftar di sistem');
                        $('#detailPelaporAvatar').text('?');
                        $('#detailPelaporRole').text('PUBLIK');
                    }
                    $('#detailPoinReward').html(`<i class="bi bi-star-fill text-warning me-1"></i>+${data.poin_diberikan || 0} Poin`);

                    // Coordinates & Maps
                    $('#detailAlamat').text(data.alamat_lokasi || 'Lokasi GPS');
                    if (data.latitude && data.longitude) {
                        const mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
                        $('#detailGoogleMapsLink').attr('href', mapsUrl);
                        $('#btnDetailOpenMap').attr('href', `/admin/peta?lat=${data.latitude}&lng=${data.longitude}&id=${data.id}`);
                    }

                    // TAB 2: AI & Hidrologi
                    const ai = data.analisis_ai;
                    if (ai) {
                        const confPct = ai.ai_confidence_score > 1.0 ? Math.round(ai.ai_confidence_score) : Math.round(ai.ai_confidence_score * 100);
                        $('#detailAiConfidence').text(`${confPct}%`);
                        $('#detailAiConfidenceBar').css('width', `${confPct}%`);
                        $('#detailAiModel').text(`Model: ${ai.model_version || 'Gemini Multimodal'}`);
                        $('#detailAiVolume').text(`${ai.estimasi_volume_m3 || 0} m³`);

                        const rawPayload = ai.raw_payload_json || {};
                        const weight = rawPayload.estimasi_berat_kg || rawPayload.estimated_weight_kg || '-';
                        $('#detailAiBerat').text(`Estimasi Berat: ${weight} kg`);
                        const nilaiEkonomi = rawPayload.nilai_ekonomi_estimasi ? 'Rp ' + Number(rawPayload.nilai_ekonomi_estimasi).toLocaleString('id-ID') : 'Rp 0';
                        $('#detailAiEkonomi').text(`Nilai Ekonomi: ${nilaiEkonomi}`);

                        $('#detailAiRisk').text(ai.tingkat_resiko_banjir || (data.is_resiko_banjir ? 'KRITIS' : 'RENDAH'));
                        $('#detailAiSumbatan').text(`Sumbatan Aliran Air: ${ai.estimasi_sumbatan_persen || 0}%`);
                        $('#detailAiHazard').text(`Tipe Bahaya: ${data.tipe_bahaya || (data.is_resiko_banjir ? 'Potensi Luapan Banjir' : 'Aman')}`);

                        // Dominant Trash Items
                        let dominanHtml = '';
                        if (ai.jenis_sampah_dominan) {
                            dominanHtml += `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-2 py-1 rounded-pill">${ai.jenis_sampah_dominan.nama || ai.jenis_sampah_dominan}</span>`;
                        } else if (rawPayload.jenis_sampah_dominan) {
                            dominanHtml += `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-2 py-1 rounded-pill">${rawPayload.jenis_sampah_dominan}</span>`;
                        }
                        if (rawPayload.objects && Array.isArray(rawPayload.objects)) {
                            rawPayload.objects.forEach(obj => {
                                dominanHtml += `<span class="badge bg-light text-dark border px-2 py-1 rounded-pill">${obj}</span> `;
                            });
                        }
                        $('#detailAiDominan').html(dominanHtml || '<span class="badge bg-light text-dark border px-2 py-1 rounded-pill">Campuran Umum</span>');

                        const rekomendasi = rawPayload.rekomendasi_tindakan || rawPayload.prediksi_banjir || 'Pembersihan manual dan pemantauan berkala direkomendasikan untuk mencegah akumulasi lebih lanjut.';
                        $('#detailAiRekomendasi').text(rekomendasi);
                    } else {
                        $('#detailAiConfidence').text('Menunggu');
                        $('#detailAiConfidenceBar').css('width', '0%');
                        $('#detailAiModel').text('Analisis AI belum selesai dieksekusi.');
                        $('#detailAiVolume').text('- m³');
                        $('#detailAiBerat').text('Estimasi Berat: -');
                        $('#detailAiEkonomi').text('Nilai Ekonomi: -');
                        $('#detailAiRisk').text(data.is_resiko_banjir ? 'KRITIS' : 'NORMAL');
                        $('#detailAiSumbatan').text('Sumbatan Aliran: -');
                        $('#detailAiHazard').text('Tipe Bahaya: -');
                        $('#detailAiDominan').html('<span class="badge bg-light text-muted border">Belum Terdeteksi</span>');
                        $('#detailAiRekomendasi').text('Laporan dalam antrean analisis vision atau dikirim langsung tanpa deteksi visual.');
                    }

                    // Environmental Sensors (Data Lingkungan)
                    const envData = data.data_lingkungan && data.data_lingkungan.length > 0 ? data.data_lingkungan[0] : null;
                    if (envData) {
                        $('#detailHujan').text(`${envData.intensitas_hujan_mm || 0} mm`);
                        $('#detailMukaAir').text(`${envData.ketinggian_air_cm || 0} cm`);
                        $('#detailKecepatanArus').text(`${envData.kecepatan_arus_m_s || 0} m/s`);
                        $('#detailCuaca').text(envData.prakiraan_cuaca || 'Cerah Berawan');
                    } else {
                        $('#detailHujan').text('0 mm');
                        $('#detailMukaAir').text('Normal');
                        $('#detailKecepatanArus').text('1.0 m/s');
                        $('#detailCuaca').text('Cerah Berawan');
                    }

                    // TAB 3: Community Tanggapans
                    const tanggapans = data.tanggapan || [];
                    $('#detailTotalTanggapanBadge').text(`${tanggapans.length} Tanggapan`);
                    let tanggapanHtml = '';
                    if (tanggapans.length > 0) {
                        tanggapans.forEach(t => {
                            const tUser = t.user ? t.user.name : 'Warga Sekitar';
                            const tTime = t.created_at ? new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
                            const photoProof = t.foto_bukti_tambahan_url 
                                ? `<div class="mt-2"><img src="${t.foto_bukti_tambahan_url}" class="rounded-3 border object-fit-cover cursor-pointer report-photo-trigger" style="width: 80px; height: 80px;" alt="Bukti Foto"></div>`
                                : '';

                            tanggapanHtml += `
                                <div class="p-3 rounded-3 border bg-light mb-2.5">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                        <span class="fw-bold text-dark" style="font-size: 13px;">${tUser}</span>
                                        <small class="text-muted" style="font-size: 11px;">${tTime}</small>
                                    </div>
                                    <p class="text-secondary mb-0" style="font-size: 12.5px;">${t.komentar || '-'}</p>
                                    ${photoProof}
                                </div>
                            `;
                        });
                    } else {
                        tanggapanHtml = `
                            <div class="text-center py-4 text-secondary">
                                <i class="bi bi-chat-dots display-6 d-block mb-1.5 opacity-50"></i>
                                <span style="font-size: 12.5px;">Belum ada tanggapan atau foto tambahan dari warga sekitar.</span>
                            </div>
                        `;
                    }
                    $('#detailTanggapanList').html(tanggapanHtml);

                    // Riwayat Status (Audit Trail)
                    const riwayat = data.riwayat_status || [];
                    let riwayatHtml = '';
                    if (riwayat.length > 0) {
                        riwayat.forEach(r => {
                            const newStatusName = r.status_baru ? r.status_baru.nama : 'Status Diperbarui';
                            const color = r.status_baru ? r.status_baru.badge_color : 'primary';
                            const author = r.diubah_oleh ? r.diubah_oleh.name : 'Sistem / Admin';
                            const rTime = r.created_at ? new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

                            riwayatHtml += `
                                <div class="position-relative ps-3 pb-3 border-start border-2 border-primary border-opacity-25">
                                    <div class="position-absolute start-0 top-0 translate-middle-x timeline-dot bg-${color}"></div>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <span class="fw-bold text-${color}" style="font-size: 12.5px;">${newStatusName}</span>
                                        <small class="text-muted" style="font-size: 10.5px;">${rTime}</small>
                                    </div>
                                    <small class="text-secondary d-block" style="font-size: 11.5px;">Oleh: <strong>${author}</strong></small>
                                    <p class="text-muted small mb-0 mt-0.5" style="font-size: 11px;">${r.catatan || 'Status diperbarui.'}</p>
                                </div>
                            `;
                        });
                    } else {
                        riwayatHtml = `
                            <div class="text-center py-4 text-secondary">
                                <i class="bi bi-clock-history display-6 d-block mb-1.5 opacity-50"></i>
                                <span style="font-size: 12.5px;">Belum ada riwayat perubahan status tercatat.</span>
                            </div>
                        `;
                    }
                    $('#detailRiwayatStatusList').html(riwayatHtml);

                    // Show Modal
                    $('#detailLaporanModal').modal('show');

                    // Initialize or Update Leaflet Mini Map inside Modal
                    setTimeout(() => {
                        initMiniMap(data.latitude, data.longitude, data.alamat_lokasi);
                    }, 400);
                },
                error: function (xhr) {
                    Swal.fire('Error', 'Gagal memuat detail laporan.', 'error');
                }
            });
        }

        function initMiniMap(lat, lng, address) {
            const latitude = parseFloat(lat) || -7.9826;
            const longitude = parseFloat(lng) || 112.6308;

            if (!miniMap) {
                miniMap = L.map('modalMiniMap').setView([latitude, longitude], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(miniMap);
            } else {
                miniMap.invalidateSize();
                miniMap.setView([latitude, longitude], 15);
            }

            if (miniMapMarker) {
                miniMap.removeLayer(miniMapMarker);
            }

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white;"><i class="bi bi-trash3-fill"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            miniMapMarker = L.marker([latitude, longitude], { icon: customIcon }).addTo(miniMap);
            miniMapMarker.bindPopup(`<strong>${address || 'Titik Laporan'}</strong><br><small>${latitude.toFixed(5)}, ${longitude.toFixed(5)}</small>`).openPopup();
        }

        // Invalidate map size when switching to summary tab
        $('#tab-summary-btn').on('shown.bs.tab', function () {
            if (miniMap) {
                miniMap.invalidateSize();
            }
        });
    });
</script>
@endpush
