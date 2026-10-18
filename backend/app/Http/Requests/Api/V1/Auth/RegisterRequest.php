<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'string', 'in:warga,pengepul,admin'],
            'no_telepon' => ['nullable', 'string', 'max:50'],
            'no_whatsapp' => ['nullable', 'string', 'max:50'],
            'foto_profil' => ['nullable', 'string'],
            // Specific Pengepul fleet details
            'plat_nomor' => ['nullable', 'string', 'max:50'],
            'jenis_kendaraan' => ['nullable', 'string', 'max:100'],
            'kapasitas_muatan_kg' => ['nullable', 'numeric', 'min:0'],
            'alamat_posko' => ['nullable', 'string'],
            'area_operasional' => ['nullable', 'string', 'max:255'],
            'deskripsi_profil' => ['nullable', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
