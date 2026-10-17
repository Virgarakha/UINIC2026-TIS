@extends('layouts.admin')

@section('title', 'Peringatan Dini & Bahaya')
@section('page_title', 'Peringatan Dini & Mitigasi Bahaya Lingkungan')

@section('content')
<!-- Header Stats -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Broadcast</span>
                <div class="stat-icon purple"><i class="bi bi-broadcast"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_broadcast']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Histori peringatan dirilis</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Sedang Aktif (Live)</span>
                <div class="stat-icon red"><i class="bi bi-shield-exclamation text-danger"></i></div>
            </div>
            <h3 class="fw-bold text-danger mb-0">{{ number_format($stats['aktif']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Warga dalam radius waspada</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Status AWAS (Kritis)</span>
                <div class="stat-icon amber"><i class="bi bi-shield-fill-exclamation text-danger"></i></div>
            </div>
            <h3 class="fw-bold text-danger mb-0">{{ number_format($stats['level_awas']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Bahaya darurat lingkungan</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Status SIAGA</span>
                <div class="stat-icon blue"><i class="bi bi-shield-shaded"></i></div>
            </div>
            <h3 class="fw-bold text-warning mb-0">{{ number_format($stats['level_siaga']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Potensi eskalasi bahaya</small>
        </div>
    </div>
</div>

<!-- Main Table Card -->
<div class="synto-card p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 gap-3 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Daftar Peringatan Dini & Bahaya Lingkungan</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Kirim sinyal broadcast peringatan dini multi-bahaya (banjir/luapan, wabah penyakit, gas metana kebakaran, pencemaran air/udara) ke perangkat aplikasi warga sekitar titik bahaya.</p>
        </div>
        <button type="button" class="btn btn-sm btn-danger rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold shadow-sm" data-bs-toggle="modal" data-bs-target="#createWarningModal">
            <i class="bi bi-broadcast"></i> Rilis Peringatan Baru
        </button>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'peringatan-table']) !!}
    </div>
</div>

<!-- Modal Rilis Peringatan Dini Baru -->
<div class="modal fade" id="createWarningModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('admin.peringatan-dini.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Rilis Peringatan Dini Bahaya Lingkungan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label for="laporan_id" class="form-label fw-semibold text-dark" style="font-size: 13px;">Pilih Titik Laporan Terkait <span class="text-danger">*</span></label>
                        <select class="form-select rounded-3" id="laporan_id" name="laporan_id" required>
                            @foreach($laporanKritis as $lap)
                                <option value="{{ $lap->id }}">
                                    #LAP-{{ $lap->id }} - {{ $lap->alamat_lokasi }}
                                    @if($lap->tipe_bahaya) [{{ $lap->tipe_bahaya }}] @elseif($lap->is_resiko_banjir) [Kritis Luapan] @endif
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="tipe_bahaya" class="form-label fw-semibold text-dark" style="font-size: 13px;">Tipe Bahaya Lingkungan <span class="text-danger">*</span></label>
                        <select class="form-select rounded-3" id="tipe_bahaya" name="tipe_bahaya" required>
                            <option value="Banjir & Luapan Air">🌊 Banjir & Luapan Air (Drainase Tersumbat)</option>
                            <option value="Wabah Penyakit & Sanitasi">🦟 Wabah Penyakit & Sanitasi (DBD / Diare / Vektor)</option>
                            <option value="Pencemaran Bau & Kualitas Air">☣️ Pencemaran Bau Menyengat & Toksik Air</option>
                            <option value="Bahaya Kebakaran & Gas Metana">🔥 Bahaya Kebakaran & Gas Metana TPA/TPS</option>
                            <option value="Longsor Timbunan / Erosi Tanggul">⚠️ Longsor Timbunan Sampah / Tanggul Kritis</option>
                            <option value="Limbah Medis / B3 Berbahaya">🛑 Limbah Medis / B3 Liar</option>
                            <option value="Dampak Bahaya Lingkungan Lainnya">📢 Dampak Bahaya Lingkungan Lainnya</option>
                        </select>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label for="level_peringatan" class="form-label fw-semibold text-dark" style="font-size: 13px;">Level Siaga <span class="text-danger">*</span></label>
                            <select class="form-select rounded-3" id="level_peringatan" name="level_peringatan" required>
                                <option value="WASPADA">WASPADA (Kuning)</option>
                                <option value="SIAGA">SIAGA (Oranye)</option>
                                <option value="AWAS">AWAS (Merah)</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label for="radius_terdampak_meter" class="form-label fw-semibold text-dark" style="font-size: 13px;">Radius (Meter) <span class="text-danger">*</span></label>
                            <input type="number" class="form-control rounded-3" id="radius_terdampak_meter" name="radius_terdampak_meter" value="500" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="pesan_broadcast" class="form-label fw-semibold text-dark" style="font-size: 13px;">Pesan Broadcast Warga <span class="text-danger">*</span></label>
                        <textarea class="form-control rounded-3" id="pesan_broadcast" name="pesan_broadcast" rows="3" required placeholder="Contoh: Peringatan bahaya! Timbunan sampah di area ini memicu risiko luapan dan penyebaran vektor penyakit. Warga diimbau waspada..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger rounded-3 px-4">Kirim Broadcast</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
{!! $dataTable->scripts() !!}
@endpush
