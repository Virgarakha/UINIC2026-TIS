@extends('layouts.admin')

@section('title', 'Dokumentasi REST API & Paket Langganan')
@section('page_title', 'Dokumentasi REST API & Skema Paket Berbayar')

@section('content')
<!-- Hero Header -->
<div class="synto-card p-4 mb-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #2B3752 0%, #1e273b 100%); color: white; border-radius: 18px;">
    <div class="row align-items-center g-3">
        <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 font-monospace" style="font-size: 11px;">
                    <i class="bi bi-shield-check me-1"></i> API v1.2 LIVE
                </span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 font-monospace" style="font-size: 11px;">
                    <i class="bi bi-lightning-charge me-1"></i> Sanctum Token Ready
                </span>
            </div>
            <h2 class="fw-bold mb-2 text-white">TRINFO REST API Developer Portal</h2>
            <p class="text-white-50 mb-3" style="font-size: 13.5px; max-width: 680px;">
                Akses terstandarisasi untuk integrasi data geospasial timbunan sampah, peringatan dini bencana lingkungan, pelacakan armada truk & motor realtime, serta pipeline visi komputer klasifikasi limbah.
            </p>
            <div class="d-flex flex-wrap gap-2">
                <div class="p-2 px-3 rounded-3 bg-white bg-opacity-10 font-monospace text-white d-flex align-items-center gap-2 border border-white border-opacity-10" style="font-size: 12px;">
                    <span class="text-white-50">Base URL:</span>
                    <strong>{{ url('/api/v1') }}</strong>
                </div>
                <button class="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5" onclick="navigator.clipboard.writeText('{{ url('/api/v1') }}'); alert('Base URL disalin ke clipboard!');">
                    <i class="bi bi-clipboard"></i> Salin URL
                </button>
            </div>
        </div>
        <div class="col-lg-4 text-lg-end d-none d-lg-block">
            <div class="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 d-inline-block text-start" style="width: 260px;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-white-50 small">API Health Uptime</span>
                    <span class="badge bg-success">99.98%</span>
                </div>
                <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar bg-success" style="width: 99.9%"></div>
                </div>
                <div class="d-flex justify-content-between text-white-50 small" style="font-size: 10px;">
                    <span>Latency: 42ms</span>
                    <span>PostgreSQL 17 Geo</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- SECTION 1: Skema Tingkat Langganan Berbayar (Fitur 5) -->
<div class="mb-5">
    <div class="d-flex align-items-center justify-content-between mb-3">
        <div>
            <h4 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-tags-fill text-primary"></i>
                Skema Tingkat Langganan API Berbayar
            </h4>
            <p class="text-secondary small mb-0">
                Pilih paket kuota kuota request harian sesuai skala kebutuhan organisasi, dinas pemerintah, atau aplikasi Anda.
            </p>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 fw-bold" style="font-size: 12px;">
            <i class="bi bi-credit-card me-1"></i> Penagihan Bulanan Fleksibel
        </span>
    </div>

    <div class="row g-3">
        @foreach($packages as $pkg)
        <div class="col-12 col-md-6 col-xl-3">
            <div class="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden {{ $pkg['is_popular'] ? 'border-2 border-primary shadow' : '' }}" style="background: #ffffff; transition: transform 0.2s ease;">
                @if($pkg['is_popular'])
                <div class="position-absolute top-0 end-0 bg-primary text-white text-center py-1 px-3 fw-bold shadow-sm" style="font-size: 10px; border-bottom-left-radius: 12px; letter-spacing: 0.5px;">
                    TERPOPULER
                </div>
                @endif

                <div class="card-body p-4 d-flex flex-column">
                    <div class="mb-2">
                        <span class="badge bg-{{ $pkg['badge_color'] }}-subtle text-{{ $pkg['badge_color'] }} border border-{{ $pkg['badge_color'] }}-subtle px-2 py-0.5 fw-bold" style="font-size: 11px;">
                            {{ $pkg['badge'] }}
                        </span>
                    </div>

                    <h5 class="fw-bold text-dark mb-1">{{ $pkg['name'] }}</h5>
                    <p class="text-secondary small mb-3" style="font-size: 12px; min-height: 42px;">
                        {{ $pkg['description'] }}
                    </p>

                    <!-- Price Block -->
                    <div class="p-3 rounded-3 bg-light border border-light-subtle mb-3">
                        <div class="d-flex align-items-baseline gap-1">
                            <span class="fs-4 fw-black text-dark">{{ $pkg['price'] }}</span>
                            <span class="text-muted small">{{ $pkg['period'] }}</span>
                        </div>
                        <div class="mt-2 pt-2 border-top border-secondary-subtle small d-flex justify-content-between">
                            <span class="text-secondary">Batas Kuota:</span>
                            <strong class="text-primary">{{ $pkg['quota'] }}</strong>
                        </div>
                        <div class="small d-flex justify-content-between mt-1">
                            <span class="text-secondary">Rate Limit:</span>
                            <strong class="text-dark">{{ $pkg['rate_limit'] }}</strong>
                        </div>
                    </div>

                    <!-- Features Checklist -->
                    <div class="mb-4 flex-grow-1">
                        <span class="text-uppercase text-secondary fw-bold d-block mb-2" style="font-size: 10.5px; letter-spacing: 0.5px;">Fitur Termasuk:</span>
                        <ul class="list-unstyled mb-0 space-y-2">
                            @foreach($pkg['features'] as $feat)
                            <li class="d-flex align-items-start gap-2 mb-2 text-secondary" style="font-size: 12px;">
                                <i class="bi bi-check-circle-fill text-success flex-shrink-0 mt-0.5"></i>
                                <span>{{ $feat }}</span>
                            </li>
                            @endforeach
                        </ul>
                    </div>

                    <!-- Order / Subscription CTA -->
                    <button type="button" class="btn {{ $pkg['cta_class'] }} w-full py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs" data-bs-toggle="modal" data-bs-target="#subscribeModal" data-package-name="{{ $pkg['name'] }}" data-package-price="{{ $pkg['price'] }}" data-package-quota="{{ $pkg['quota'] }}">
                        <i class="bi bi-cart-check"></i>
                        <span>{{ $pkg['cta'] }}</span>
                    </button>
                </div>
            </div>
        </div>
        @endforeach
    </div>
</div>

<!-- SECTION 2: Dokumentasi Endpoint REST API Lengkap -->
<div class="mb-5">
    <div class="d-flex align-items-center justify-content-between mb-3">
        <div>
            <h4 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-code-square text-success"></i>
                Katalog & Spesifikasi Endpoint REST API (v1)
            </h4>
            <p class="text-secondary small mb-0">
                Dokumentasi skema parameter request, response JSON, dan contoh eksekusi curl.
            </p>
        </div>
        <div class="d-flex gap-2">
            <span class="badge bg-secondary-subtle text-secondary px-2.5 py-1.5 font-monospace" style="font-size: 11px;">
                Header: Accept: application/json
            </span>
        </div>
    </div>

    <!-- API Nav Tabs -->
    <ul class="nav nav-pills gap-2 mb-4 p-1.5 bg-white rounded-3 shadow-sm border border-slate-200" id="apiTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active rounded-3 px-3 py-2 fw-semibold" id="tab-laporan" data-bs-toggle="pill" data-bs-target="#pane-laporan" type="button" role="tab" style="font-size: 12.5px;">
                <i class="bi bi-trash3-fill me-1.5"></i> Laporan Sampah
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-3 px-3 py-2 fw-semibold" id="tab-peringatan" data-bs-toggle="pill" data-bs-target="#pane-peringatan" type="button" role="tab" style="font-size: 12.5px;">
                <i class="bi bi-shield-exclamation me-1.5"></i> Peringatan Dini
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-3 px-3 py-2 fw-semibold" id="tab-armada" data-bs-toggle="pill" data-bs-target="#pane-armada" type="button" role="tab" style="font-size: 12.5px;">
                <i class="bi bi-truck me-1.5"></i> Pelacakan Armada
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-3 px-3 py-2 fw-semibold" id="tab-tanggapan" data-bs-toggle="pill" data-bs-target="#pane-tanggapan" type="button" role="tab" style="font-size: 12.5px;">
                <i class="bi bi-chat-dots-fill me-1.5"></i> Forum Respon Warga
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link rounded-3 px-3 py-2 fw-semibold" id="tab-auth" data-bs-toggle="pill" data-bs-target="#pane-auth" type="button" role="tab" style="font-size: 12.5px;">
                <i class="bi bi-key-fill me-1.5"></i> Autentikasi
            </button>
        </li>
    </ul>

    <!-- Tab Contents -->
    <div class="tab-content" id="apiTabsContent">
        <!-- PANE 1: Laporan Sampah -->
        <div class="tab-pane fade show active" id="pane-laporan" role="tabpanel">
            <div class="space-y-4">
                <!-- Endpoint 1 -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                    <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-success font-monospace px-2.5 py-1 fw-bold">GET</span>
                            <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/laporan</span>
                        </div>
                        <span class="badge bg-info-subtle text-info fw-semibold">Publik / Pro / Enterprise</span>
                    </div>
                    <div class="card-body p-4">
                        <p class="text-secondary small mb-3">
                            Mengambil seluruh daftar titik lokasi tumpukan sampah untuk visualisasi peta radar dan analitik spasial. Otomatis mengecualikan laporan yang telah selesai/dibersihkan.
                        </p>
                        <h6 class="fw-bold text-dark small mb-2">Query Parameters:</h6>
                        <div class="table-responsive mb-3">
                            <table class="table table-sm table-bordered align-middle mb-0" style="font-size: 12px;">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 20%;">Parameter</th>
                                        <th style="width: 15%;">Tipe</th>
                                        <th>Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code class="text-primary font-monospace">status_id</code></td>
                                        <td>Integer (Opsional)</td>
                                        <td>Filter status spesifik (1: Menunggu, 2: Terverifikasi, 5: OTW, 6: Selesai)</td>
                                    </tr>
                                    <tr>
                                        <td><code class="text-primary font-monospace">kategori_id</code></td>
                                        <td>Integer (Opsional)</td>
                                        <td>Filter kategori (1: Organik, 2: Anorganik, 3: B3, 4: Elektronik)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h6 class="fw-bold text-dark small mb-2">Contoh Response (200 OK):</h6>
                        <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px; max-height: 240px; overflow-y: auto;">
{
  "success": true,
  "message": "Daftar laporan untuk peta berhasil diambil",
  "data": [
    {
      "id": 4,
      "judul": "Tumpukan Limbah Sungai Brantas",
      "deskripsi": "Sampah menyumbat aliran air di bawah jembatan",
      "latitude": -7.9812,
      "longitude": 112.6354,
      "alamat_lokasi": "Jl. Basuki Rahmat No. 12, Klojen, Malang",
      "perkiraan_berat_kg": 45.0,
      "is_resiko_banjir": true,
      "tipe_bahaya": "Potensi Banjir",
      "foto_url": "http://localhost:8000/storage/laporan/sampah_6ad4e3d5130462.37064354.jpg",
      "status": {
        "id": 1,
        "kode": "menunggu_verifikasi",
        "nama": "Menunggu Verifikasi"
      }
    }
  ]
}</pre>
                    </div>
                </div>

                <!-- Endpoint 2 -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                    <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary font-monospace px-2.5 py-1 fw-bold">POST</span>
                            <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/laporan</span>
                        </div>
                        <span class="badge bg-warning-subtle text-warning fw-semibold">Bearer Token Diperlukan</span>
                    </div>
                    <div class="card-body p-4">
                        <p class="text-secondary small mb-3">
                            Mengunggah laporan temuan sampah baru dari warga lengkap dengan foto base64/multipart, koordinat GPS, dan deteksi resiko bencana.
                        </p>
                        <h6 class="fw-bold text-dark small mb-2">Request Body (multipart/form-data atau JSON):</h6>
                        <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px;">
{
  "judul": "Tumpukan Sampah Liar TPS Ilegal",
  "deskripsi": "Tumpukan plastik dan sisa ranting menutupi bahu jalan",
  "latitude": -7.9826,
  "longitude": 112.6308,
  "alamat_lokasi": "Jl. Ijen No. 45, Klojen, Kota Malang",
  "kategori_sampah_id": 2,
  "foto": "(binary file atau data:image/jpeg;base64,...)"
}</pre>
                    </div>
                </div>
            </div>
        </div>

        <!-- PANE 2: Peringatan Dini -->
        <div class="tab-pane fade" id="pane-peringatan" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-success font-monospace px-2.5 py-1 fw-bold">GET</span>
                        <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/peringatan-dini</span>
                    </div>
                    <span class="badge bg-info-subtle text-info fw-semibold">Publik & Radar Spasial</span>
                </div>
                <div class="card-body p-4">
                    <p class="text-secondary small mb-3">
                        Mengambil daftar peringatan dini darurat bencana lingkungan yang sedang aktif (SIAGA / AWAS) dengan radius terdampak dalam meter. Otomatis membersihkan titik yang sampahnya telah diangkut tuntas.
                    </p>
                    <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px;">
{
  "success": true,
  "message": "Daftar peringatan dini aktif berhasil diambil",
  "data": [
    {
      "id": 1,
      "laporan_id": 4,
      "level_peringatan": "AWAS",
      "tipe_bahaya": "Potensi Banjir Aliran Sungai",
      "radius_terdampak_meter": 500,
      "pesan_broadcast": "Waspada luapan air akibat sumbatan sampah pada radius 500m",
      "status_aktif": true,
      "waktu_broadcast": "2026-10-19T14:30:00Z"
    }
  ]
}</pre>
                </div>
            </div>
        </div>

        <!-- PANE 3: Pelacakan Armada -->
        <div class="tab-pane fade" id="pane-armada" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-primary font-monospace px-2.5 py-1 fw-bold">POST</span>
                        <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/penjemputan/lokasi-truk</span>
                    </div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold">Telemetry Realtime</span>
                </div>
                <div class="card-body p-4">
                    <p class="text-secondary small mb-3">
                        Mengirimkan telemetri posisi GPS armada berjalan (truk bak hidrolik atau sepeda motor DLH) secara berkelanjutan, sinkron dengan peta seluruh pengguna.
                    </p>
                    <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px;">
{
  "laporan_id": 4,
  "pengepul_id": 30,
  "latitude": -7.9818,
  "longitude": 112.6349,
  "heading": 87.5,
  "kecepatan_kmh": 24.5,
  "status_jemput": "otw",
  "vehicle_type": "motorcycle" // atau "driving"
}</pre>
                </div>
            </div>
        </div>

        <!-- PANE 4: Forum Respon Warga -->
        <div class="tab-pane fade" id="pane-tanggapan" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-success font-monospace px-2.5 py-1 fw-bold">GET</span>
                        <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/tanggapan/{laporan_id}</span>
                    </div>
                    <span class="badge bg-success-subtle text-success fw-semibold">Reward +10 Poin</span>
                </div>
                <div class="card-body p-4">
                    <p class="text-secondary small mb-3">
                        Mengambil umpan balik dan validasi situasi terkini titik sampah secara kolaboratif oleh komunitas warga.
                    </p>
                    <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px;">
{
  "success": true,
  "data": [
    {
      "id": 12,
      "laporan_id": 4,
      "komentar": "Tumpukan botol dan kasur masih menyumbat aliran air, tinggi genangan mulai naik",
      "tipe_tanggapan": {
        "id": 1,
        "nama": "Masih Ada"
      },
      "user": {
        "id": 2,
        "name": "Budi Santoso",
        "role": "warga"
      },
      "created_at": "2026-10-19T14:45:10Z"
    }
  ]
}</pre>
                </div>
            </div>
        </div>

        <!-- PANE 5: Autentikasi -->
        <div class="tab-pane fade" id="pane-auth" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-primary font-monospace px-2.5 py-1 fw-bold">POST</span>
                        <span class="fw-bold font-monospace text-dark" style="font-size: 13.5px;">/api/v1/auth/login</span>
                    </div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold">Token Generator</span>
                </div>
                <div class="card-body p-4">
                    <p class="text-secondary small mb-3">
                        Mendapatkan access token Sanctum untuk mengakses endpoint berproteksi (Simpan, Tanggapan Warga, Dispatch Armada).
                    </p>
                    <pre class="p-3 rounded-3 bg-dark text-light font-monospace small mb-0" style="font-size: 11.5px;">
{
  "email": "admin@trinfo.id",
  "password": "password"
}

// Response (200 OK)
{
  "success": true,
  "token": "3|abcdef123456789...",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@trinfo.id",
    "role": "admin"
  }
}</pre>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Dialog Pembelian Paket Langganan API -->
<div class="modal fade" id="subscribeModal" tabindex="-1" aria-labelledby="subscribeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-dark text-white p-3.5">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon green p-1" style="width: 28px; height: 28px; font-size: 13px;">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <h5 class="modal-title fw-bold mb-0" id="subscribeModalLabel" style="font-size: 15px;">Konfirmasi Berlangganan API</h5>
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <div class="p-3 rounded-3 bg-light border border-slate-200 mb-3 text-center">
                    <span class="text-secondary small d-block">Paket Terpilih:</span>
                    <h4 class="fw-black text-dark mb-1" id="modalPkgName">Paket Pro</h4>
                    <span class="fs-5 fw-bold text-primary" id="modalPkgPrice">Rp 50.000 / bulan</span>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle mt-1 d-inline-block" id="modalPkgQuota">100 Request / hari</span>
                </div>

                <div class="space-y-3 mb-3">
                    <div class="mb-2">
                        <label class="form-label small fw-bold text-dark mb-1">Nama Organisasi / Pengembang:</label>
                        <input type="text" class="form-control" value="Dinas Lingkungan Hidup / Pengembang Swasta" placeholder="Nama organisasi">
                    </div>
                    <div class="mb-2">
                        <label class="form-label small fw-bold text-dark mb-1">Email Pemberitahuan Billing:</label>
                        <input type="email" class="form-control" value="developer@instansi.go.id" placeholder="email@instansi.go.id">
                    </div>
                    <div>
                        <label class="form-label small fw-bold text-dark mb-1">Metode Pembayaran:</label>
                        <select class="form-select">
                            <option selected>Virtual Account Bank Mandiri / BCA / BNI</option>
                            <option>QRIS Dinamis (GOPAY, OVO, ShopeePay)</option>
                            <option>Invoice B2B Pemda / SPK Pengadaan</option>
                        </select>
                    </div>
                </div>

                <div class="p-2.5 rounded-3 bg-emerald-50 border border-emerald-200 text-emerald-800 small d-flex items-center gap-2">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span>Kunci API Key akan otomatis aktif setelah pembayaran terverifikasi.</span>
                </div>
            </div>
            <div class="modal-footer bg-light p-3 border-top d-flex justify-content-between">
                <button type="button" class="btn btn-secondary rounded-3 px-3" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary rounded-3 px-4 fw-bold" onclick="alert('Pesanan paket API berhasil dibuat! API Key Sanctum Token telah digenerate.'); var modal = bootstrap.Modal.getInstance(document.getElementById('subscribeModal')); modal.hide();">
                    Bayar & Dapatkan API Key
                </button>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    var subscribeModal = document.getElementById('subscribeModal');
    if (subscribeModal) {
        subscribeModal.addEventListener('show.bs.modal', function (event) {
            var button = event.relatedTarget;
            if (!button) return;
            var name = button.getAttribute('data-package-name');
            var price = button.getAttribute('data-package-price');
            var quota = button.getAttribute('data-package-quota');

            document.getElementById('modalPkgName').textContent = name || 'Paket Pro';
            document.getElementById('modalPkgPrice').textContent = (price || 'Rp 50.000') + ' / bulan';
            document.getElementById('modalPkgQuota').textContent = quota || '100 Request / hari';
        });
    }
});
</script>
@endsection
