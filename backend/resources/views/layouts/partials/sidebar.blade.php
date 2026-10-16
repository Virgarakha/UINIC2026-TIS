<aside class="synto-sidebar d-flex flex-column flex-shrink-0">
    <!-- Brand / Logo (Synto Style) -->
    <a href="{{ route('admin.dashboard') }}" class="synto-brand text-decoration-none">
        <div class="synto-brand-logo">
            <i class="bi bi-boxes"></i>
        </div>
        <div class="d-flex flex-column">
            <span class="fs-5 fw-bold text-white tracking-wide lh-1">synto</span>
            <small class="text-secondary" style="font-size: 10px; letter-spacing: 0.5px;">API DASHBOARD</small>
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

        <!-- Section: GENERAL -->
        <div class="synto-menu-header">GENERAL</div>
        <a href="{{ route('admin.users.index') }}" class="synto-nav-link {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
            <i class="bi bi-people-fill"></i>
            <span>Manage Users</span>
        </a>

        <!-- Section: API & INTEGRATION -->
        <div class="synto-menu-header">API & INTEGRATION</div>
        <a href="{{ url('/api/v1/users') }}" target="_blank" class="synto-nav-link">
            <i class="bi bi-terminal-fill"></i>
            <span>API Endpoints</span>
            <i class="bi bi-arrow-up-right ms-auto fs-6 opacity-50"></i>
        </a>
        <a href="#" class="synto-nav-link" data-bs-toggle="modal" data-bs-target="#apiDocsModal">
            <i class="bi bi-file-earmark-code-fill"></i>
            <span>API Specs (v1)</span>
        </a>
    </div>

    <!-- Bottom System Status Card -->
    <div class="p-3 border-top border-white border-opacity-10 mt-auto">
        <div class="p-2 rounded-3 bg-black bg-opacity-30 border border-white border-opacity-10">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="badge bg-indigo text-white px-2 py-1" style="background-color: #4f46e5; font-size: 10px;">
                    Laravel {{ app()->version() }}
                </span>
                <span class="d-inline-flex align-items-center gap-1 text-success" style="font-size: 11px;">
                    <span class="spinner-grow spinner-grow-sm text-success" style="width: 7px; height: 7px;" role="status"></span>
                    Online
                </span>
            </div>
            <small class="text-secondary d-block text-truncate" style="font-size: 11px;">
                <i class="bi bi-database-fill-check text-info me-1"></i> PostgreSQL Connected
            </small>
        </div>
    </div>
</aside>
