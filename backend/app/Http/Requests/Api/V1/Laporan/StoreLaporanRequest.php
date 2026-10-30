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
     * Prepare data for validation.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [];

        if ($this->has('tipe_bahaya') && is_string($this->tipe_bahaya)) {
            $mergeData['tipe_bahaya'] = mb_substr($this->tipe_bahaya, 0, 60);
        }

        if ($this->has('kategori_id')) {
            $catId = (int) $this->kategori_id;
            $categoryExists = \Illuminate\Support\Facades\DB::table('kategori_sampah')->where('id', $catId)->exists();
            if (!$categoryExists) {
                $fallbackId = \Illuminate\Support\Facades\DB::table('kategori_sampah')
                    ->where('slug', 'tps-liar-lahan-kosong')
                    ->value('id')
                    ?? \Illuminate\Support\Facades\DB::table('kategori_sampah')->value('id');

                if ($fallbackId) {
                    $mergeData['kategori_id'] = $fallbackId;
                }
            }
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
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
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'analisis_ai' => ['nullable', 'array'],
            'data_lingkungan' => ['nullable', 'array'],
            'weather' => ['nullable', 'array'],
        ];
    }
}
