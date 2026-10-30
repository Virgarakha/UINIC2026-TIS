<aside class="synto-sidebar d-flex flex-column flex-shrink-0">
    <!-- Brand / Logo (TRINFO) -> Links to Frontend Home -->
    <a href="https://uinic-2026-tis.vercel.app/" class="synto-brand text-decoration-none" title="Kunjungi Halaman Beranda Frontend">
        <div class="synto-brand-logo p-1 d-flex align-items-center justify-content-center" style="background: rgba(14, 178, 154, 0.15); border-radius: 10px;">
            <img src="{{ asset('images/logo.png') }}" alt="TRINFO" style="height: 28px; width: auto; object-fit: contain;">
        </div>
        <div class="d-flex flex-column">
            <div class="d-flex align-items-center gap-1.5">
                <span class="fs-5 fw-bold text-white tracking-wide lh-1">TRINFO</span>
                <i class="bi bi-box-arrow-up-right text-secondary" style="font-size: 10px;"></i>
            </div>
            <small class="text-secondary" style="font-size: 10px; letter-spacing: 0.5px;">TRASH INFORMATION SYSTEM</small>
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
        <div class="synto-menu-header">PORTAL & INTEGRASI</div>
        <a href="https://uinic-2026-tis.vercel.app/" class="synto-nav-link text-white fw-semibold mb-1" style="background: rgba(14, 178, 154, 0.15); border: 1px solid rgba(14, 178, 154, 0.3);">
            <i class="bi bi-globe2 text-primary"></i>
            <span>Portal Warga (Web)</span>
            <i class="bi bi-box-arrow-up-right ms-auto fs-6 opacity-75 text-primary"></i>
        </a>
        <a href="{{ route('admin.api-docs.index') }}" class="synto-nav-link {{ request()->routeIs('admin.api-docs.*') ? 'active' : '' }}">
            <i class="bi bi-file-earmark-code-fill"></i>
            <span>Dokumentasi & Paket API</span>
            <span class="badge bg-primary-subtle text-primary ms-auto fw-bold" style="font-size: 10px;">Berbayar</span>
        </a>
        <a href="{{ url('/api/v1/users') }}" target="_blank" class="synto-nav-link">
            <i class="bi bi-terminal-fill"></i>
            <span>Endpoint Live (v1)</span>
            <i class="bi bi-arrow-up-right ms-auto fs-6 opacity-50"></i>
        </a>
    </div>

   
</aside>
