<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_tier',
        'status',
        'requests_limit',
        'requests_used',
        'rate_limit_per_minute',
        'billing_cycle',
        'started_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'requests_limit' => 'integer',
            'requests_used' => 'integer',
            'rate_limit_per_minute' => 'integer',
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
