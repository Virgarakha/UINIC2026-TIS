<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Show admin login form.
     */
    public function showLoginForm(Request $request)
    {
        if (Auth::check() && Auth::user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        // Support optional 1-click auto-login from frontend shortcut (?auto=admin)
        if ($request->query('auto') === 'admin' || $request->query('demo') === '1') {
            $admin = User::where('role', 'admin')->first()
                ?? User::where('email', 'admin@gmail.com')->first();

            if ($admin) {
                Auth::login($admin, true);
                return redirect()->route('admin.dashboard')->with('success', 'Selamat datang kembali, Administrator DLH!');
            }
        }

        return view('admin.auth.login');
    }

    /**
     * Handle admin login submission.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                Auth::logout();
                return back()->withInput($request->only('email'))
                    ->withErrors(['email' => 'Akses ditolak: Akun Anda tidak memiliki hak akses Administrator.']);
            }

            $request->session()->regenerate();
            return redirect()->intended(route('admin.dashboard'))
                ->with('success', 'Selamat datang di Dashboard Admin TRINFO!');
        }

        return back()->withInput($request->only('email'))
            ->withErrors(['email' => 'Email atau kata sandi tidak valid.']);
    }

    /**
     * Handle admin logout.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('success', 'Anda telah berhasil keluar dari sistem admin.');
    }
}
