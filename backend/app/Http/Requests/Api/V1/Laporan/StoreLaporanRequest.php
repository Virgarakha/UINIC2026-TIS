<?php

namespace App\Http\Requests\Api\V1\Laporan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLaporanRequest extends FormRequest
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
            'foto_url' => ['required', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'alamat_lokasi' => ['required', 'string', 'max:500'],
            'deskripsi' => ['nullable', 'string', 'max:2000'],
            'kategori_id' => ['nullable', 'integer', 'exists:kategori_sampah,id'],
            'status_id' => ['nullable', 'integer', 'exists:status_laporan,id'],
            'is_resiko_banjir' => ['nullable', 'boolean'],
            'tipe_bahaya' => ['nullable', 'string', 'max:60'],
            'analisis_ai' => ['nullable', 'array'],
            'data_lingkungan' => ['nullable', 'array'],
            'weather' => ['nullable', 'array'],
        ];
    }
}
