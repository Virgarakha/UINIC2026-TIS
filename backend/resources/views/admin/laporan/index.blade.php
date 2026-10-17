@extends('layouts.admin')

@section('title', 'Laporan Sampah')
@section('page_title', 'Laporan Sampah & Monitoring Titik')

@section('content')
<!-- Header & Stats Row -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Laporan</span>
                <div class="stat-icon blue"><i class="bi bi-trash3"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['total_laporan']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Semua titik tercatat</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Kritis Luapan Banjir</span>
                <div class="stat-icon amber"><i class="bi bi-exclamation-triangle-fill text-danger"></i></div>
            </div>
            <h3 class="fw-bold text-danger mb-0">{{ number_format($stats['laporan_kritis']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Sumbatan saluran air</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Siap Pengepul</span>
                <div class="stat-icon purple"><i class="bi bi-recycle"></i></div>
            </div>
            <h3 class="fw-bold text-dark mb-0">{{ number_format($stats['siap_pengepul']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Bernilai ekonomi daur ulang</small>
        </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold" style="font-size: 13px;">Selesai Dibersihkan</span>
                <div class="stat-icon green"><i class="bi bi-check-circle-fill text-success"></i></div>
            </div>
            <h3 class="fw-bold text-success mb-0">{{ number_format($stats['laporan_selesai']) }}</h3>
            <small class="text-muted" style="font-size: 11px;">Ditangani dinas / warga</small>
        </div>
    </div>
</div>

<!-- Main Table Card -->
<div class="synto-card p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 gap-3 border-bottom">
        <div>
            <h5 class="fw-bold text-dark mb-1">Daftar Laporan Sampah Masuk</h5>
            <p class="text-secondary mb-0" style="font-size: 13px;">Kelola laporan masyarakat, evaluasi risiko AI, dan status penanganan dinas.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
            <a href="{{ route('admin.peta.index') }}" class="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1.5 px-3 py-2 fw-semibold">
                <i class="bi bi-map-fill"></i> Tampilkan di Peta Live
            </a>
        </div>
    </div>

    <!-- DataTable Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'laporan-table']) !!}
    </div>
</div>

<!-- Modal Update Status Laporan -->
<div class="modal fade" id="updateStatusModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="updateStatusForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark">Ubah Status Laporan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label for="modal_status_id" class="form-label fw-semibold text-dark" style="font-size: 13px;">Status Baru <span class="text-danger">*</span></label>
                        <select class="form-select rounded-3" id="modal_status_id" name="status_id" required>
                            @foreach($statuses as $st)
                                <option value="{{ $st->id }}">{{ $st->nama }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="modal_catatan" class="form-label fw-semibold text-dark" style="font-size: 13px;">Catatan Tindak Lanjut</label>
                        <textarea class="form-control rounded-3" id="modal_catatan" name="catatan" rows="3" placeholder="Contoh: Petugas UPT Kebersihan telah diterjunkan ke lokasi..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-top pt-3">
                    <button type="button" class="btn btn-light rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn text-white rounded-3 px-4" style="background-color: #4f46e5;">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
{!! $dataTable->scripts() !!}
<script>
    $(document).on('click', '.btn-update-status', function() {
        const id = $(this).data('id');
        const statusId = $(this).data('status-id');
        const form = document.getElementById('updateStatusForm');
        form.action = `/admin/laporan/${id}`;
        $('#modal_status_id').val(statusId);
        $('#updateStatusModal').modal('show');
    });
</script>
@endpush
