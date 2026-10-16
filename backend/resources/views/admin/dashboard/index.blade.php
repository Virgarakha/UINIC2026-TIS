@extends('layouts.admin')

@section('title', 'Synto Dashboard')
@section('page_title', 'Dashboard')

@section('content')
<!-- Page Header: Title & Breadcrumbs (Synto Style) -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
    <div>
        <h4 class="fw-bold mb-1 text-dark">Dashboard</h4>
        <small class="text-secondary">Welcome back to Synto Admin & REST API Dashboard.</small>
    </div>
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 bg-white px-3 py-1.5 rounded-pill border shadow-xs" style="font-size: 12.5px;">
            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}" class="text-decoration-none text-muted">Home</a></li>
            <li class="breadcrumb-item active fw-semibold text-primary" aria-current="page">Dashboard</li>
        </ol>
    </nav>
</div>

<!-- 4 Top Stat Cards (Synto Exact Style) -->
<div class="row g-3 mb-4">
    <!-- Stat 1: API Requests Volume -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon purple">
                        <i class="bi bi-wallet2"></i>
                    </div>
                    <span class="text-secondary fw-semibold" style="font-size: 13px;">API Requests</span>
                </div>
                <span class="trend-pill up">
                    <i class="bi bi-arrow-up-short"></i> 20%
                </span>
            </div>
            <h3 class="fw-bold text-dark mb-1">268,420</h3>
            <small class="text-muted" style="font-size: 11.5px;">vs last week</small>
        </div>
    </div>

    <!-- Stat 2: Total Users -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon blue">
                        <i class="bi bi-people"></i>
                    </div>
                    <span class="text-secondary fw-semibold" style="font-size: 13px;">Total Users</span>
                </div>
                <span class="trend-pill up">
                    <i class="bi bi-arrow-up-short"></i> 12.5%
                </span>
            </div>
            <h3 class="fw-bold text-dark mb-1">{{ number_format($stats['total_users']) }}</h3>
            <small class="text-muted" style="font-size: 11.5px;">registered accounts</small>
        </div>
    </div>

    <!-- Stat 3: Verified Accounts -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon amber">
                        <i class="bi bi-patch-check"></i>
                    </div>
                    <span class="text-secondary fw-semibold" style="font-size: 13px;">Verified Users</span>
                </div>
                @php
                    $verifiedPercent = $stats['total_users'] > 0 ? round(($stats['verified_users'] / $stats['total_users']) * 100, 1) : 0;
                @endphp
                <span class="trend-pill neutral">
                    {{ $verifiedPercent }}%
                </span>
            </div>
            <h3 class="fw-bold text-dark mb-1">{{ number_format($stats['verified_users']) }}</h3>
            <small class="text-muted" style="font-size: 11.5px;">email verified accounts</small>
        </div>
    </div>

    <!-- Stat 4: Active API Tokens -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="synto-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="stat-icon green">
                        <i class="bi bi-key"></i>
                    </div>
                    <span class="text-secondary fw-semibold" style="font-size: 13px;">Active Tokens</span>
                </div>
                <span class="trend-pill up">
                    <i class="bi bi-check-lg"></i> 100%
                </span>
            </div>
            <h3 class="fw-bold text-dark mb-1">{{ number_format($stats['total_tokens']) }}</h3>
            <small class="text-muted" style="font-size: 11.5px;">Sanctum access tokens</small>
        </div>
    </div>
</div>

<!-- Middle Section: Analytics Charts (Synto Style) -->
<div class="row g-3 mb-4">
    <!-- Bar Chart: API Traffic Overview (Sales Over View in Synto) -->
    <div class="col-12 col-lg-8">
        <div class="synto-card h-100">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <div>
                    <h6 class="fw-bold text-dark mb-1">API Traffic Overview</h6>
                    <small class="text-secondary">Monthly volume and response times breakdown</small>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="d-inline-flex align-items-center gap-1" style="font-size: 12px; color: #4f46e5; font-weight: 600;">
                        <span class="rounded-circle" style="width: 8px; height: 8px; background-color: #4f46e5;"></span>
                        Requests (k)
                    </span>
                    <span class="d-inline-flex align-items-center gap-1" style="font-size: 12px; color: #06b6d4; font-weight: 600;">
                        <span class="rounded-circle" style="width: 8px; height: 8px; background-color: #06b6d4;"></span>
                        Latency (ms)
                    </span>
                </div>
            </div>

            <!-- ApexCharts Bar Chart Container -->
            <div id="trafficOverviewChart" style="min-height: 300px;"></div>
        </div>
    </div>

    <!-- Donut/Radial Chart: API Success Rate (Sale Value in Synto) -->
    <div class="col-12 col-lg-4">
        <div class="synto-card h-100 d-flex flex-column justify-content-between">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold text-dark mb-0">API Performance</h6>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li><a class="dropdown-item" href="#">Today</a></li>
                        <li><a class="dropdown-item" href="#">This Week</a></li>
                    </ul>
                </div>
            </div>

            <!-- Radial Gauge Chart -->
            <div id="performanceRadialChart" class="my-auto py-2"></div>

            <!-- Breakdown Metrics Under Chart -->
            <div class="row text-center pt-3 border-top g-2">
                <div class="col-6 border-end">
                    <small class="text-secondary d-block" style="font-size: 11px;">Success Rate</small>
                    <span class="fw-bold text-dark fs-6">99.4%</span>
                    <span class="d-block text-success" style="font-size: 10px;">+0.23% uptime</span>
                </div>
                <div class="col-6">
                    <small class="text-secondary d-block" style="font-size: 11px;">Avg Latency</small>
                    <span class="fw-bold text-dark fs-6">38ms</span>
                    <span class="d-block text-success" style="font-size: 10px;">-5ms faster</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Lower Section: Recent Users (Top Customers in Synto) & Architecture Highlights -->
<div class="row g-3">
    <!-- Recent Users List (Synto Top Customers Card) -->
    <div class="col-12 col-lg-7">
        <div class="synto-card h-100">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-people-fill text-primary me-2"></i>Latest Registered Users</h6>
                    <small class="text-muted">Directly synced with database</small>
                </div>
                <a href="{{ route('admin.users.index') }}" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold" style="font-size: 12px;">
                    View All Users <i class="bi bi-arrow-right ms-1"></i>
                </a>
            </div>

            <div class="table-responsive">
                <table class="table table-borderless align-middle mb-0">
                    <tbody>
                        @forelse($recentUsers as $user)
                            <tr>
                                <td style="width: 44px; padding-left: 0;">
                                    <div class="stat-icon purple" style="width: 36px; height: 36px; font-size: 13px; font-weight: 700;">
                                        {{ strtoupper(substr($user->name, 0, 1)) }}
                                    </div>
                                </td>
                                <td>
                                    <span class="fw-semibold text-dark d-block lh-sm" style="font-size: 13.5px;">{{ $user->name }}</span>
                                    <small class="text-secondary" style="font-size: 12px;">{{ $user->email }}</small>
                                </td>
                                <td class="text-center">
                                    @if($user->email_verified_at)
                                        <span class="trend-pill up" style="font-size: 10.5px;">Verified</span>
                                    @else
                                        <span class="trend-pill neutral" style="font-size: 10.5px;">Unverified</span>
                                    @endif
                                </td>
                                <td class="text-end text-muted" style="font-size: 12px; padding-right: 0;">
                                    {{ $user->created_at ? $user->created_at->diffForHumans() : '-' }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted py-3">Belum ada user yang terdaftar.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Architecture & Quick API Test Card -->
    <div class="col-12 col-lg-5">
        <div class="synto-card h-100">
            <h6 class="fw-bold text-dark mb-3"><i class="bi bi-cpu-fill text-primary me-2"></i>Clean Architecture & Stack</h6>

            <div class="d-flex flex-column gap-2 mb-3">
                <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
                    <span class="small fw-semibold text-dark"><i class="bi bi-check-circle-fill text-success me-2"></i>Service Layer</span>
                    <span class="badge bg-primary-subtle text-primary">UserService</span>
                </div>
                <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
                    <span class="small fw-semibold text-dark"><i class="bi bi-check-circle-fill text-success me-2"></i>Server-Side Table</span>
                    <span class="badge bg-success-subtle text-success">Yajra DataTables</span>
                </div>
                <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
                    <span class="small fw-semibold text-dark"><i class="bi bi-check-circle-fill text-success me-2"></i>API Authentication</span>
                    <span class="badge bg-warning-subtle text-warning">Sanctum Token</span>
                </div>
            </div>

            <div class="p-3 rounded-3 bg-dark text-white">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <small class="text-secondary" style="font-size: 11px;">QUICK API CURL TEST</small>
                    <span class="badge bg-success" style="font-size: 9px;">GET /api/v1/users</span>
                </div>
                <code class="text-info d-block text-truncate" style="font-size: 12px;">curl -H "Accept: application/json" {{ url('/api/v1/users') }}</code>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // 1. Synto Bar Chart (API Traffic Overview)
        const trafficOptions = {
            series: [{
                name: 'API Requests (k)',
                data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 75, 82, 95]
            }, {
                name: 'Latency (ms)',
                data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 88, 70, 52]
            }],
            chart: {
                type: 'bar',
                height: 310,
                toolbar: { show: false },
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '45%',
                    borderRadius: 4
                },
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            colors: ['#4f46e5', '#06b6d4'],
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: { style: { colors: '#94a3b8', fontSize: '12px' } }
            },
            yaxis: {
                labels: { style: { colors: '#94a3b8', fontSize: '12px' } }
            },
            fill: { opacity: 1 },
            legend: { show: false },
            grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 3
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val;
                    }
                }
            }
        };

        const trafficChart = new ApexCharts(document.querySelector("#trafficOverviewChart"), trafficOptions);
        trafficChart.render();

        // 2. Synto Radial Gauge Chart (API Performance)
        const radialOptions = {
            series: [75],
            chart: {
                height: 240,
                type: 'radialBar',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '70%',
                    },
                    track: {
                        background: '#f1f5f9',
                        strokeWidth: '100%',
                    },
                    dataLabels: {
                        name: {
                            show: true,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#64748b',
                            offsetY: -8
                        },
                        value: {
                            offsetY: 4,
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#1e293b',
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            colors: ['#4f46e5'],
            labels: ['Uptime'],
        };

        const radialChart = new ApexCharts(document.querySelector("#performanceRadialChart"), radialOptions);
        radialChart.render();
    });
</script>
@endpush
