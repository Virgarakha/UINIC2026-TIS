<header class="synto-topbar d-flex align-items-center justify-content-between">
    <!-- Left: Sidebar Toggle & Search Input -->
    <div class="d-flex align-items-center gap-3">
        <button class="topbar-icon-btn d-md-none border-0" type="button" data-bs-toggle="collapse" data-bs-target=".synto-sidebar">
            <i class="bi bi-list fs-5"></i>
        </button>

        <!-- Synto Search Bar -->
        <div class="synto-search-box d-none d-sm-block">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control" placeholder="Search anything...">
        </div>
    </div>

    <!-- Right: Quick Action Icons & Profile -->
    <div class="d-flex align-items-center gap-2">
        <!-- Direct Link to Frontend Home -->
        <a href="https://uinic-2026-tis.vercel.app/" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1 fw-bold text-decoration-none" style="font-size: 11.5px; border-color: #0EB29A; color: #0EB29A;" title="Buka Halaman Beranda Frontend">
            <i class="bi bi-globe2"></i>
            <span class="d-none d-sm-inline">Portal Warga</span>
            <i class="bi bi-box-arrow-up-right small opacity-75"></i>
        </a>

        <!-- API Version Badge -->
        <a href="{{ route('admin.api-docs.index') }}" class="text-decoration-none" title="Dokumentasi & Paket API">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 d-none d-lg-inline-block fw-semibold" style="font-size: 11px;">
                <i class="bi bi-lightning-charge-fill text-warning me-1"></i> REST API v1
            </span>
        </a>

        <!-- Fullscreen Button -->
        <button class="topbar-icon-btn" type="button" title="Toggle Fullscreen" onclick="if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); } else { document.exitFullscreen(); }">
            <i class="bi bi-arrows-fullscreen"></i>
        </button>

        <!-- Notification Bell with Counter -->
        <a href="#" class="topbar-icon-btn" title="Notifications" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-bell"></i>
            <span class="topbar-badge">3</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2" style="width: 280px;">
            <li class="px-3 py-2 border-bottom fw-bold text-dark d-flex align-items-center justify-content-between">
                <span>Notifikasi</span>
                <span class="badge bg-primary-subtle text-primary">3 Baru</span>
            </li>
            <li>
                <a class="dropdown-item py-2 d-flex gap-2 align-items-start" href="#">
                    <div class="stat-icon green p-1" style="width: 28px; height: 28px; font-size: 13px;"><i class="bi bi-person-check"></i></div>
                    <div style="font-size: 12px;">
                        <span class="fw-semibold d-block text-dark">User Baru Terdaftar</span>
                        <small class="text-muted">Baru saja melalui form</small>
                    </div>
                </a>
            </li>
            <li>
                <a class="dropdown-item py-2 d-flex gap-2 align-items-start" href="#">
                    <div class="stat-icon blue p-1" style="width: 28px; height: 28px; font-size: 13px;"><i class="bi bi-key"></i></div>
                    <div style="font-size: 12px;">
                        <span class="fw-semibold d-block text-dark">Sanctum Token Aktif</span>
                        <small class="text-muted">Admin access token ready</small>
                    </div>
                </a>
            </li>
        </ul>

        <!-- User Profile Dropdown (Synto Style) -->
        <div class="dropdown ms-1">
            <a href="#" class="d-flex align-items-center text-dark text-decoration-none dropdown-toggle gap-2" id="userMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="position-relative">
                    <span class="stat-icon purple fw-bold" style="width: 36px; height: 36px; font-size: 13px;">
                        AD
                    </span>
                    <span class="position-absolute bottom-0 end-0 bg-success rounded-circle" style="width: 9px; height: 9px; border: 2px solid #fff;"></span>
                </div>
                <div class="d-none d-md-block text-start lh-sm">
                    <span class="fw-bold d-block text-dark" style="font-size: 13.5px;">Administrator</span>
                    <small class="text-secondary" style="font-size: 11px;">Super Admin</small>
                </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2" aria-labelledby="userMenuDropdown">
                <li class="px-3 py-2 border-bottom">
                    <span class="fw-bold d-block" style="font-size: 13px;">Admin UINIC</span>
                    <small class="text-muted" style="font-size: 11px;">admin@uinic.com</small>
                </li>
                <li><a class="dropdown-item py-2" href="{{ route('admin.users.index') }}"><i class="bi bi-person me-2 text-primary"></i>Kelola User</a></li>
                <li><a class="dropdown-item py-2" href="#" data-bs-toggle="modal" data-bs-target="#apiDocsModal"><i class="bi bi-journal-code me-2 text-info"></i>Dokumentasi API</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-primary fw-semibold" href="https://uinic-2026-tis.vercel.app/"><i class="bi bi-box-arrow-up-right me-2"></i>Halaman Beranda Frontend</a></li>
            </ul>
        </div>
    </div>
</header>
