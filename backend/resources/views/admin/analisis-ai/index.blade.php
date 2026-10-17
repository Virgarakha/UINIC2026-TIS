@extends('layouts.admin')

@section('title', 'Analisis AI & Hidrologi')
@section('page_title', 'Evaluasi Multimodal AI & Sensor Hidrologi')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Foto Dievaluasi AI</span>
                <div class="stat-icon purple"><i class="bi bi-cpu"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_dianalisis']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Computer Vision + GEMINI</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Rata-rata Akurasi AI</span>
                <div class="stat-icon blue"><i class="bi bi-percent"></i></div>
            </div>
            <h3 class="fw-bold text-primary mb-0">{{ $stats['rata_rata_confidence'] }}%</h3>
            <small class="text-muted" style="font-size: 11px;">Confidence Score</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Risiko Tinggi / Kritis</span>
                <div class="stat-icon amber"><i class="bi bi-exclamation-triangle-fill text-danger"></i></div>
            </div>
            <h3 class="fw-bold text-danger mb-0">{{ number_format($stats['risiko_tinggi_kritis']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Potensi luapan air tinggi</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Lolos Anti-Fraud (Poin)</span>
                <div class="stat-icon green"><i class="bi bi-shield-check text-success"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['lolos_anti_fraud']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Confidence &ge; 70%</small>
        </div>
    </div>
</div>

<!-- AI Analytics Cards Grid -->
<div class="row g-3">
    @forelse($analisisList as $item)
        <div class="col-12 col-md-6 col-xl-4">
            <div class="synto-card p-4 h-100 d-flex flex-column">
                <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                    <span class="fw-bold text-primary" style="font-size: 13px;">#LAP-{{ $item->laporan_id }}</span>
                    @php
                        $riskBadge = match($item->tingkat_resiko_banjir) {
                            'KRITIS' => 'bg-danger text-white',
                            'TINGGI' => 'bg-warning text-dark',
                            'SEDANG' => 'bg-info text-white',
                            default => 'bg-success text-white',
                        };
                    @endphp
                    <span class="badge {{ $riskBadge }} rounded-pill px-2.5 py-1 fw-bold" style="font-size: 11px;">
                        Risiko {{ $item->tingkat_resiko_banjir }}
                    </span>
                </div>

                <div class="d-flex align-items-start gap-3 mb-3">
                    <img src="{{ $item->laporan ? $item->laporan->foto_url : '' }}" class="rounded-3 border object-fit-cover shadow-xs" style="width: 70px; height: 70px;" onerror="this.src='https://placehold.co/70x70?text=Foto'">
                    <div class="flex-grow-1 min-w-0">
                        <span class="fw-bold text-dark d-block text-truncate" style="font-size: 13px;">{{ $item->laporan ? $item->laporan->alamat_lokasi : 'Lokasi' }}</span>
                        <small class="text-secondary d-block" style="font-size: 11.5px;">Model: {{ $item->model_version }}</small>
                        <div class="mt-1">
                            @if($item->isLolosAntiFraud())
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5" style="font-size: 10px;">
                                    <i class="bi bi-shield-check"></i> Valid Anti-Fraud ({{ round($item->ai_confidence_score * 100) }}%)
                                </span>
                            @else
                                <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-2 py-0.5" style="font-size: 10px;">
                                    <i class="bi bi-shield-x"></i> Review Manual ({{ round($item->ai_confidence_score * 100) }}%)
                                </span>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- AI Metrics Box -->
                <div class="bg-light p-3 rounded-3 mb-3" style="font-size: 12px;">
                    <div class="d-flex justify-content-between mb-1.5">
                        <span class="text-secondary">Estimasi Sumbatan:</span>
                        <span class="fw-bold text-dark">{{ $item->estimasi_sumbatan_persen }}%</span>
                    </div>
                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar {{ $item->estimasi_sumbatan_persen >= 40 ? 'bg-danger' : 'bg-primary' }}" style="width: {{ $item->estimasi_sumbatan_persen }}%;"></div>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                        <span class="text-secondary">Estimasi Volume:</span>
                        <span class="fw-semibold text-dark">{{ number_format($item->estimasi_volume_m3, 2) }} m³</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-secondary">Sampah Dominan:</span>
                        <span class="fw-semibold text-dark">{{ $item->jenisSampahDominan ? $item->jenisSampahDominan->nama : '-' }}</span>
                    </div>
                </div>

                <!-- Raw JSON Accordion -->
                <div class="mt-auto">
                    <button class="btn btn-sm btn-outline-secondary w-100 rounded-2 text-start d-flex align-items-center justify-content-between py-1.5 px-2.5" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#json-{{ $item->id }}" 
                            style="font-size: 11px;">
                        <span><i class="bi bi-code-slash me-1"></i> Lihat Raw JSON Payload</span>
                        <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="collapse mt-2" id="json-{{ $item->id }}">
                        <pre class="bg-dark text-light p-2 rounded-2 mb-0 overflow-x-auto" style="font-size: 10.5px; max-height: 120px;">{{ json_encode($item->raw_payload_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
                    </div>
                </div>
            </div>
        </div>
    @empty
        <div class="col-12">
            <div class="synto-card p-5 text-center text-secondary">
                <i class="bi bi-cpu display-6 d-block mb-2 opacity-50"></i>
                <p class="mb-0">Belum ada evaluasi AI yang tercatat.</p>
            </div>
        </div>
    @endforelse
</div>

<div class="d-flex justify-content-end mt-4">
    {{ $analisisList->links() }}
</div>
@endsection
