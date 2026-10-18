<?php

namespace App\Http\Resources\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ?? 'warga',
            'no_telepon' => $this->no_telepon,
            'no_whatsapp' => $this->no_whatsapp ?? $this->no_telepon,
            'foto_profil' => $this->foto_profil,
            'avatar_url' => $this->foto_profil,
            'poin_reward' => $this->poin_reward ?? 0,
            // Fleet & Pengepul specifics
            'plat_nomor' => $this->plat_nomor,
            'jenis_kendaraan' => $this->jenis_kendaraan,
            'kapasitas_muatan_kg' => $this->kapasitas_muatan_kg,
            'alamat_posko' => $this->alamat_posko,
            'area_operasional' => $this->area_operasional,
            'rating' => (float) ($this->rating ?? 5.0),
            'total_ulasan' => (int) ($this->total_ulasan ?? 0),
            'deskripsi_profil' => $this->deskripsi_profil,
            'ulasan' => $this->whenLoaded('ulasan'),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'is_verified' => $this->email_verified_at !== null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
