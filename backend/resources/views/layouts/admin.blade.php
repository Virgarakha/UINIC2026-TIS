<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Dashboard') | {{ config('app.name', 'Synto') }}</title>

    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5.3 & Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- DataTables Bootstrap 5 CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">

    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    <!-- Synto Custom Theme Styles -->
    <style>
        :root {
            --synto-sidebar-bg: #111111;
            --synto-sidebar-hover: #1b2656;
            --synto-sidebar-active: #4f46e5;
            --synto-body: #f3f6f9;
            --synto-card: #ffffff;
            --synto-border: #e2e8f0;
            --synto-text-muted: #8c98ad;
            --synto-primary: #4f46e5;
        }

        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: var(--synto-body);
            color: #1e293b;
            overflow-x: hidden;
        }

        /* Sidebar Styling (Synto Theme) */
        .synto-sidebar {
            width: 260px;
            min-height: 100vh;
            background-color: var(--synto-sidebar-bg);
            transition: all 0.3s ease;
            z-index: 1040;
        }
        .synto-brand {
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .synto-brand-logo {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #4f46e5, #06b6d4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 800;
            font-size: 16px;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
        }
        .synto-menu-header {
            color: #55627a;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding: 1.1rem 1.25rem 0.4rem;
        }
        .synto-nav-link {
            display: flex;
            align-items: center;
            padding: 0.65rem 1.25rem;
            margin: 0.15rem 0.75rem;
            border-radius: 8px;
            color: #8c98ad;
            font-size: 13.5px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        .synto-nav-link i {
            font-size: 16px;
            margin-right: 0.75rem;
            width: 20px;
            text-align: center;
        }
        .synto-nav-link:hover {
            color: #ffffff;
            background-color: var(--synto-sidebar-hover);
        }
        .synto-nav-link.active {
            color: #ffffff !important;
            background: var(--synto-sidebar-active);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
            font-weight: 600;
        }
        .synto-nav-badge {
            margin-left: auto;
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 10px;
        }

        /* Topbar Styling */
        .synto-topbar {
            background-color: #ffffff;
            border-bottom: 1px solid #edf2f7;
            padding: 0.85rem 1.5rem;
            position: sticky;
            top: 0;
            z-index: 1020;
        }
        .synto-search-box {
            position: relative;
            max-width: 320px;
        }
        .synto-search-box input {
            border-radius: 20px;
            padding-left: 2.25rem;
            font-size: 13px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .synto-search-box i {
            position: absolute;
            left: 0.85rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 14px;
        }
        .topbar-icon-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8fafc;
            border: 1px solid #edf2f7;
            color: #64748b;
            text-decoration: none;
            transition: all 0.2s ease;
            position: relative;
        }
        .topbar-icon-btn:hover {
            background-color: #e2e8f0;
            color: #1e293b;
        }
        .topbar-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 16px;
            height: 16px;
            font-size: 9px;
            font-weight: 700;
            border-radius: 50%;
            background-color: #ef4444;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
        }

        /* Cards & Components */
        .synto-card {
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid rgba(226, 232, 240, 0.8);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
            padding: 1.25rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .synto-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        /* Stat Icon Containers */
        .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .stat-icon.purple { background-color: #ede9fe; color: #7c3aed; }
        .stat-icon.blue { background-color: #e0f2fe; color: #0284c7; }
        .stat-icon.amber { background-color: #fef3c7; color: #d97706; }
        .stat-icon.green { background-color: #d1fae5; color: #059669; }

        /* Percentage Trend Pills */
        .trend-pill {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
        }
        .trend-pill.up { background-color: #dcfce7; color: #15803d; }
        .trend-pill.down { background-color: #fee2e2; color: #b91c1c; }
        .trend-pill.neutral { background-color: #fef3c7; color: #b45309; }

        /* DataTables Enhancements */
        .table thead th {
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 12px 14px;
        }
        .table tbody td {
            font-size: 13.5px;
            padding: 12px 14px;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
        }
        .table-hover tbody tr:hover {
            background-color: #f8fafc;
        }
        .dt-buttons-box .btn {
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 5px 12px;
            margin-right: 4px;
        }
        .dataTables_filter input {
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 13px;
            border: 1px solid #cbd5e1;
            margin-left: 6px;
        }
        .page-link {
            border-radius: 6px !important;
            margin: 0 2px;
            font-size: 13px;
            color: #475569;
        }
        .page-item.active .page-link {
            background-color: var(--synto-primary);
            border-color: var(--synto-primary);
            color: #fff;
        }
    </style>

    @stack('styles')
</head>
<body class="d-flex flex-column min-vh-100">
    <div class="d-flex flex-grow-1">
        <!-- Synto Sidebar -->
        @include('layouts.partials.sidebar')

        <!-- Main Wrapper -->
        <div class="d-flex flex-column flex-grow-1 w-100" style="min-width: 0;">
            <!-- Synto Topbar -->
            @include('layouts.partials.navbar')

            <!-- Global Flash Messages -->
            <div class="container-fluid px-4 pt-3">
                @if (session('success'))
                    <div class="alert alert-success alert-dismissible fade show d-flex align-items-center shadow-sm border-0 rounded-3" role="alert">
                        <i class="bi bi-check-circle-fill text-success me-2 fs-5"></i>
                        <div class="fw-medium">{{ session('success') }}</div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @if (session('error'))
                    <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm border-0 rounded-3" role="alert">
                        <i class="bi bi-exclamation-triangle-fill text-danger me-2 fs-5"></i>
                        <div class="fw-medium">{{ session('error') }}</div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
            </div>

            <!-- Main Page Content -->
            <main class="flex-grow-1 px-4 py-3">
                @yield('content')
            </main>

            <!-- Footer -->
            @include('layouts.partials.footer')
        </div>
    </div>

    <!-- API Quick Reference Modal -->
    <div class="modal fade" id="apiDocsModal" tabindex="-1" aria-labelledby="apiDocsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header border-bottom pb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="stat-icon purple" style="width: 34px; height: 34px; font-size: 16px;">
                            <i class="bi bi-code-slash"></i>
                        </div>
                        <h5 class="modal-title fw-bold" id="apiDocsModalLabel">REST API Reference (v1)</h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <p class="text-secondary small mb-3">
                        Format respon API mengadopsi standar uniform JSON <code>{ success, message, data, meta }</code> dengan autentikasi Laravel Sanctum.
                    </p>
                    <div class="table-responsive rounded-3 border">
                        <table class="table table-sm table-striped align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Method</th>
                                    <th>Endpoint</th>
                                    <th>Deskripsi</th>
                                    <th>Auth</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="badge bg-success-subtle text-success border border-success-subtle">POST</span></td>
                                    <td><code>/api/v1/auth/register</code></td>
                                    <td>Registrasi user baru & issue token</td>
                                    <td><span class="badge bg-light text-muted border">Public</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-success-subtle text-success border border-success-subtle">POST</span></td>
                                    <td><code>/api/v1/auth/login</code></td>
                                    <td>Autentikasi email/password</td>
                                    <td><span class="badge bg-light text-muted border">Public</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">GET</span></td>
                                    <td><code>/api/v1/auth/me</code></td>
                                    <td>Get profil pengguna yang sedang login</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-success-subtle text-success border border-success-subtle">POST</span></td>
                                    <td><code>/api/v1/auth/logout</code></td>
                                    <td>Revoke personal access token</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">GET</span></td>
                                    <td><code>/api/v1/users</code></td>
                                    <td>List users (Paginasi & Pencarian)</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-success-subtle text-success border border-success-subtle">POST</span></td>
                                    <td><code>/api/v1/users</code></td>
                                    <td>Tambah data user baru</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-info-subtle text-info border border-info-subtle">PUT</span></td>
                                    <td><code>/api/v1/users/{id}</code></td>
                                    <td>Update data user</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-danger-subtle text-danger border border-danger-subtle">DELETE</span></td>
                                    <td><code>/api/v1/users/{id}</code></td>
                                    <td>Hapus user & revoke tokennya</td>
                                    <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Sanctum</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer border-top bg-light">
                    <button type="button" class="btn btn-secondary btn-sm rounded-3 px-3" data-bs-dismiss="modal">Tutup</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Core Scripts -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- JSZip & PDFMake (Dependencies for DataTables Excel & PDF export) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>

    <!-- DataTables JS & Plugins -->
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.8/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js"></script>

    <!-- ApexCharts (for Synto Interactive Charts) -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script>
        // Setup CSRF header for all AJAX requests
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
    </script>

    @stack('scripts')
</body>
</html>
