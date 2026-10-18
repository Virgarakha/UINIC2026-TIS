<div class="d-flex align-items-center justify-content-end gap-1.5 flex-nowrap">
    {{-- Button Detail Laporan --}}
    <button type="button" 
            class="btn btn-sm btn-light border rounded-3 px-2 py-1 text-primary btn-detail-laporan shadow-2xs" 
            data-id="{{ $laporan->id }}"
            title="Lihat Detail Lengkap & Evaluasi AI">
        <i class="bi bi-eye-fill"></i> <span class="d-none d-xxl-inline" style="font-size: 11.5px;">Detail</span>
    </button>

    {{-- Button Ubah Status --}}
    <button type="button" 
            class="btn btn-sm btn-light border rounded-3 px-2 py-1 text-dark btn-update-status shadow-2xs" 
            data-id="{{ $laporan->id }}"
            data-status-id="{{ $laporan->status_id }}"
            data-status-nama="{{ $laporan->status?->nama ?? '-' }}"
            data-pelapor-id="{{ $laporan->user_id }}"
            title="Ubah Status & Disposisi">
        <i class="bi bi-pencil-square text-warning"></i> <span class="d-none d-xxl-inline" style="font-size: 11.5px;">Status</span>
    </button>

    {{-- Button Buka di Peta GIS --}}
    @if($laporan->latitude && $laporan->longitude)
    <a href="{{ route('admin.peta.index', ['lat' => $laporan->latitude, 'lng' => $laporan->longitude, 'id' => $laporan->id]) }}" 
       class="btn btn-sm btn-light border rounded-3 px-2 py-1 text-success shadow-2xs" 
       title="Fokuskan di Peta Interaktif GIS">
        <i class="bi bi-geo-alt-fill"></i>
    </a>
    @endif

    {{-- Button Hapus Laporan --}}
    <button type="button" 
            class="btn btn-sm btn-light border rounded-3 px-2 py-1 text-danger btn-delete-laporan shadow-2xs" 
            data-id="{{ $laporan->id }}"
            title="Hapus Laporan">
        <i class="bi bi-trash3"></i>
    </button>
</div>
