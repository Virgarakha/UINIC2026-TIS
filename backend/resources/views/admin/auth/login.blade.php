<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Masuk Admin DLH | TRINFO</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo.png') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 & Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        :root {
            --trinfo-primary: #0EB29A;
            --trinfo-primary-dark: #0a8e7a;
            --trinfo-dark: #18231D;
            --trinfo-sidebar: #2B3752;
        }

        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #f4f7fb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #1e293b;
        }

        .auth-card {
            width: 100%;
            max-width: 440px;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(226, 232, 240, 0.8);
            overflow: hidden;
        }

        .auth-header {
            background: linear-gradient(135deg, #2B3752, #1a2335);
            padding: 2.25rem 2rem 1.75rem;
            color: #ffffff;
            text-align: center;
            position: relative;
        }

        .auth-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0EB29A, #4f46e5);
        }

        .auth-brand-logo {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: rgba(14, 178, 154, 0.15);
            border: 1px solid rgba(14, 178, 154, 0.3);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.85rem;
        }

        .auth-body {
            padding: 2rem;
        }

        .form-control {
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 13.5px;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            transition: all 0.2s ease;
        }

        .form-control:focus {
            background-color: #ffffff;
            border-color: var(--trinfo-primary);
            box-shadow: 0 0 0 3px rgba(14, 178, 154, 0.15);
        }

        .btn-primary-trinfo {
            background-color: var(--trinfo-primary);
            border: none;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(14, 178, 154, 0.25);
        }

        .btn-primary-trinfo:hover {
            background-color: var(--trinfo-primary-dark);
            color: #ffffff;
            box-shadow: 0 6px 16px rgba(14, 178, 154, 0.35);
        }

        .dummy-account-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 14px;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }

        .dummy-badge-btn {
            background: #ffffff;
            border: 1px solid #86efac;
            color: #166534;
            font-weight: 700;
            font-size: 12px;
            padding: 0.4rem 0.85rem;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .dummy-badge-btn:hover {
            background: #dcfce7;
            border-color: #4ade80;
        }
    </style>
</head>
<body>

<div class="auth-card">
    <!-- Header -->
    <div class="auth-header">
        <div class="auth-brand-logo">
            <img src="{{ asset('images/logo.png') }}" alt="TRINFO" style="height: 32px; width: auto; object-fit: contain;">
        </div>
        <h4 class="fw-bold mb-1 tracking-wide">TRINFO Command Center</h4>
        <p class="text-white text-opacity-75 small mb-0">Portal Khusus Dinas Lingkungan Hidup (DLH)</p>
    </div>

    <!-- Body -->
    <div class="auth-body">
        <!-- Flash & Error Messages -->
        @if (session('success'))
            <div class="alert alert-success d-flex align-items-center py-2 px-3 rounded-3 small mb-3" role="alert">
                <i class="bi bi-check-circle-fill me-2 fs-6"></i>
                <div>{{ session('success') }}</div>
            </div>
        @endif

        @if ($errors->any())
            <div class="alert alert-danger py-2 px-3 rounded-3 small mb-3" role="alert">
                <div class="fw-bold mb-0.5"><i class="bi bi-exclamation-triangle-fill me-1"></i> Gagal Masuk:</div>
                <ul class="mb-0 ps-3">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Dummy Account Quick Access Box -->
        <div class="dummy-account-box">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-success fw-bold small d-flex align-items-center gap-1">
                    <i class="bi bi-shield-lock-fill"></i> Akun Demo / Dummy
                </span>
                <button type="button" class="dummy-badge-btn" id="btnFillDummy" onclick="fillDummyCredentials()">
                    <i class="bi bi-box-arrow-in-right"></i> Isi Otomatis
                </button>
            </div>
            <div class="bg-white p-2 rounded-2 border border-success border-opacity-25 small" style="font-size: 11.5px;">
                <div class="d-flex justify-content-between text-muted mb-1">
                    <span>Email:</span>
                    <strong class="text-dark font-monospace" id="dummyEmail">admin@gmail.com</strong>
                </div>
                <div class="d-flex justify-content-between text-muted">
                    <span>Kata Sandi:</span>
                    <strong class="text-dark font-monospace" id="dummyPassword">12345</strong>
                </div>
            </div>
        </div>

        <!-- Login Form -->
        <form action="{{ route('admin.login.post') }}" method="POST">
            @csrf

            <!-- Email Input -->
            <div class="mb-3">
                <label for="email" class="form-label small fw-bold text-dark">Email Administrator</label>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 border-slate rounded-start-3 text-muted">
                        <i class="bi bi-envelope"></i>
                    </span>
                    <input type="email" name="email" id="email" class="form-control border-start-0 ps-0" placeholder="admin@gmail.com" value="{{ old('email', 'admin@gmail.com') }}" required autofocus>
                </div>
            </div>

            <!-- Password Input -->
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <label for="password" class="form-label small fw-bold text-dark mb-1">Kata Sandi</label>
                </div>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
                        <i class="bi bi-key"></i>
                    </span>
                    <input type="password" name="password" id="password" class="form-control border-start-0 border-end-0 px-0" placeholder="••••••••" value="12345" required>
                    <button class="btn btn-outline-secondary border-start-0 rounded-end-3 bg-white text-muted" type="button" onclick="togglePasswordVisibility()">
                        <i class="bi bi-eye" id="toggleIcon"></i>
                    </button>
                </div>
            </div>

            <!-- Remember Me -->
            <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" name="remember" id="remember" checked>
                <label class="form-check-label small text-secondary" for="remember">
                    Ingat sesi saya di peramban ini
                </label>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary-trinfo w-100 d-flex align-items-center justify-content-center gap-2">
                <span>Masuk ke Dashboard</span>
                <i class="bi bi-arrow-right-short fs-5"></i>
            </button>
        </form>

        <!-- Back to Citizen Portal -->
        <div class="text-center mt-4 pt-2 border-top">
            <a href="https://uinic-2026-tis.vercel.app/" class="text-decoration-none small text-secondary fw-semibold">
                <i class="bi bi-arrow-left me-1"></i> Kembali ke Portal Beranda Warga
            </a>
        </div>
    </div>
</div>

<script>
    function fillDummyCredentials() {
        document.getElementById('email').value = 'admin@gmail.com';
        document.getElementById('password').value = '12345';
    }

    function togglePasswordVisibility() {
        const passInput = document.getElementById('password');
        const icon = document.getElementById('toggleIcon');
        if (passInput.type === 'password') {
            passInput.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            passInput.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }
</script>

</body>
</html>
