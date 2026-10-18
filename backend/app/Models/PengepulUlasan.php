<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'pengepul_id',
    'warga_id',
    'reviewer_name',
    'reviewer_role',
    'rating',
    'komentar',
])]
class PengepulUlasan extends Model
{
    use HasFactory;

    protected $table = 'pengepul_ulasan';

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function pengepul(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengepul_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function warga(): BelongsTo
    {
        return $this->belongsTo(User::class, 'warga_id');
    }
}
