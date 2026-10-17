<aside class="synto-sidebar d-flex flex-column flex-shrink-0">
    <!-- Brand / Logo (Sistem Sampah) -->
    <a href="{{ route('admin.dashboard') }}" class="synto-brand text-decoration-none">
        <div class="synto-brand-logo">
            <i class="bi bi-water"></i>
        </div>
        <div class="d-flex flex-column">
            <span class="fs-5 fw-bold text-white tracking-wide lh-1">Sistem Sampah</span>
            <small class="text-secondary" style="font-size: 10px; letter-spacing: 0.5px;">MONITORING & AI EARLY WARNING</small>
        </div>
    </a>

    <!-- Sidebar Navigation -->
    <div class="flex-grow-1 overflow-y-auto py-2">
        <!-- Section: MAIN -->
        <div class="synto-menu-header">MAIN</div>
        <a href="{{ route('admin.dashboard') }}" class="synto-nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
            <i class="bi bi-grid-fill"></i>
            <span>Dashboard</span>
        </a>
        <a href="{{ route('admin.peta.index') }}" class="synto-nav-link {{ request()->routeIs('admin.peta.*') ? 'active' : '' }}">
            <i class="bi bi-geo-alt-fill"></i>
            <span>Peta Interaktif (GIS)</span>
            <span class="badge bg-danger ms-auto rounded-pill px-1.5 py-0.5 text-white" style="font-size: 9.5px;">LIVE</span>
        </a>

        <!-- Section: OPERASIONAL & LAPORAN -->
        <div class="synto-menu-header">OPERASIONAL & LAPORAN</div>
        <a href="{{ route('admin.laporan.index') }}" class="synto-nav-link {{ request()->routeIs('admin.laporan.*') ? 'active' : '' }}">
            <i class="bi bi-trash3-fill"></i>
            <span>Laporan Sampah</span>
        </a>
        <a href="{{ route('admin.tanggapan.index') }}" class="synto-nav-link {{ request()->routeIs('admin.tanggapan.*') ? 'active' : '' }}">
            <i class="bi bi-chat-left-text-fill"></i>
            <span>Tanggapan Warga</span>
        </a>
        <a href="{{ route('admin.analisis-ai.index') }}" class="synto-nav-link {{ request()->routeIs('admin.analisis-ai.*') ? 'active' : '' }}">
            <i class="bi bi-cpu-fill"></i>
            <span>Analisis AI & Hidrologi</span>
        </a>

        <!-- Section: TANGGAP DARURAT & PENJEMPUTAN -->
        <div class="synto-menu-header">TANGGAP DARURAT & PENJEMPUTAN</div>
        <a href="{{ route('admin.peringatan-dini.index') }}" class="synto-nav-link {{ request()->routeIs('admin.peringatan-dini.*') ? 'active' : '' }}">
            <i class="bi bi-shield-exclamation"></i>
            <span>Peringatan Dini & Bahaya</span>
        </a>
        <a href="{{ route('admin.penjemputan.index') }}" class="synto-nav-link {{ request()->routeIs('admin.penjemputan.*') ? 'active' : '' }}">
            <i class="bi bi-truck"></i>
            <span>Penjemputan Pengepul</span>
        </a>

        <!-- Section: GAMIFIKASI & REWARDS -->
        <div class="synto-menu-header">GAMIFIKASI & REWARDS</div>
        <a href="{{ route('admin.hadiah.index') }}" class="synto-nav-link {{ request()->routeIs('admin.hadiah.*') ? 'active' : '' }}">
            <i class="bi bi-gift-fill"></i>
            <span>Katalog Hadiah</span>
        </a>
        <a href="{{ route('admin.penukaran.index') }}" class="synto-nav-link {{ request()->routeIs('admin.penukaran.*') ? 'active' : '' }}">
            <i class="bi bi-box2-heart-fill"></i>
            <span>Klaim / Penukaran</span>
        </a>
        <a href="{{ route('admin.riwayat-poin.index') }}" class="synto-nav-link {{ request()->routeIs('admin.riwayat-poin.*') ? 'active' : '' }}">
            <i class="bi bi-coin"></i>
            <span>Buku Besar Poin</span>
        </a>

        <!-- Section: DATA MASTER & PENGGUNA -->
        <div class="synto-menu-header">DATA MASTER & PENGGUNA</div>
        <a href="{{ route('admin.users.index') }}" class="synto-nav-link {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
            <i class="bi bi-people-fill"></i>
            <span>Kelola Pengguna</span>
        </a>
        <a href="{{ route('admin.master.index') }}" class="synto-nav-link {{ request()->routeIs('admin.master.*') ? 'active' : '' }}">
            <i class="bi bi-sliders2-vertical"></i>
            <span>Master Kategori & Status</span>
        </a>

        <!-- Section: API & INTEGRATION -->
        <div class="synto-menu-header">API & INTEGRATION</div>
        <a href="{{ url('/api/v1/users') }}" target="_blank" class="synto-nav-link">
            <i class="bi bi-terminal-fill"></i>
            <span>REST API (v1)</span>
            <i class="bi bi-arrow-up-right ms-auto fs-6 opacity-50"></i>
        </a>
        <a href="#" class="synto-nav-link" data-bs-toggle="modal" data-bs-target="#apiDocsModal">
            <i class="bi bi-file-earmark-code-fill"></i>
            <span>API Specs & Schema</span>
        </a>
    </div>

    <!-- Bottom System Status Card -->
    <div class="p-3 border-top border-white border-opacity-10 mt-auto">
        <div class="p-2 rounded-3 bg-black bg-opacity-30 border border-white border-opacity-10">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="badge bg-indigo text-white px-2 py-1" style="background-color: #4f46e5; font-size: 10px;">
                    PostgreSQL 17 Tab
                </span>
                <span class="d-inline-flex align-items-center gap-1 text-success" style="font-size: 11px;">
                    <span class="spinner-grow spinner-grow-sm text-success" style="width: 7px; height: 7px;" role="status"></span>
                    Online
                </span>
            </div>
            <small class="text-secondary d-block text-truncate" style="font-size: 11px;">
                <i class="bi bi-shield-check text-info me-1"></i> AI Early Warning Active
            </small>
        </div>
    </div>
</aside>
