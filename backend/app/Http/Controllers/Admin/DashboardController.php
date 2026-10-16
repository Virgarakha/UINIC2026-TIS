<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(UserService $userService): View
    {
        $stats = $userService->getDashboardStats();

        $stats['total_tokens'] = DB::table('personal_access_tokens')->count();
        $stats['db_driver'] = config('database.default');
        $stats['laravel_version'] = app()->version();
        $stats['php_version'] = PHP_VERSION;

        $recentUsers = User::latest('id')->take(5)->get();

        return view('admin.dashboard.index', compact('stats', 'recentUsers'));
    }
}
