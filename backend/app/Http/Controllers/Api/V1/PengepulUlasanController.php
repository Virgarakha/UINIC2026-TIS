<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\PengepulUlasan;
use App\Models\RiwayatPoin;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengepulUlasanController extends BaseApiController
{
    /**
     * Get reviews for a specific collector / driver.
     */
    public function index(int $id): JsonResponse
    {
        $pengepul = User::findOrFail($id);

        $ulasan = PengepulUlasan::where('pengepul_id', $id)
            ->with('warga')
            ->latest()
            ->get();

        return $this->sendResponse([
            'pengepul_id' => $id,
            'pengepul_name' => $pengepul->name,
            'rating' => (float) $pengepul->rating,
            'total_ulasan' => (int) $pengepul->total_ulasan,
            'ulasan' => $ulasan,
        ], 'Daftar ulasan mitra pengepul berhasil diambil');
    }

    /**
     * Store a citizen review/comment with star rating for a collector.
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $pengepul = User::findOrFail($id);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'required|string|min:3|max:1000',
            'reviewer_name' => 'nullable|string|max:100',
            'reviewer_role' => 'nullable|string|max:100',
            'warga_id' => 'nullable|integer|exists:users,id',
        ]);

        $reviewerId = $request->user()?->id ?? $validated['warga_id'] ?? null;
        $reviewerName = $validated['reviewer_name'] ?? $request->user()?->name ?? 'Warga EcoPatrol';
        $reviewerRole = $validated['reviewer_role'] ?? 'Warga Pelapor';

        // 1. Create review record
        $ulasan = PengepulUlasan::create([
            'pengepul_id' => $pengepul->id,
            'warga_id' => $reviewerId,
            'reviewer_name' => $reviewerName,
            'reviewer_role' => $reviewerRole,
            'rating' => (int) $validated['rating'],
            'komentar' => $validated['komentar'],
        ]);

        // 2. Recalculate average rating and total reviews
        $allReviews = PengepulUlasan::where('pengepul_id', $pengepul->id)->get();
        $totalReviews = $allReviews->count();
        $avgRating = round($allReviews->avg('rating'), 2);

        $pengepul->update([
            'rating' => $avgRating,
            'total_ulasan' => $totalReviews,
        ]);

        // 3. Award +15 bonus points to reviewer if identified
        if ($reviewerId) {
            $reviewer = User::find($reviewerId);
            if ($reviewer) {
                $reviewer->increment('poin_reward', 15);
                RiwayatPoin::create([
                    'user_id' => $reviewer->id,
                    'jumlah_poin' => 15,
                    'jenis_transaksi' => 'kredit',
                    'referensi_tipe' => 'ulasan_pengepul',
                    'referensi_id' => $ulasan->id,
                    'keterangan' => 'Reward Ulasan Mitra Armada: ' . $pengepul->name,
                ]);
            }
        }

        return $this->sendResponse([
            'ulasan' => $ulasan,
            'pengepul' => [
                'id' => $pengepul->id,
                'name' => $pengepul->name,
                'rating' => $avgRating,
                'total_ulasan' => $totalReviews,
            ],
            'bonus_poin_diberikan' => 15,
        ], 'Ulasan berhasil dikirim! Anda mendapatkan +15 Poin Reward.', 201);
    }
}
