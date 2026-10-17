<?php

namespace App\Services;

use App\Models\KatalogHadiah;
use App\Models\PenukaranHadiah;
use Illuminate\Database\Eloquent\Builder;

class HadiahService extends BaseService
{
    /**
     * Get base query for rewards catalog.
     *
     * @return Builder<KatalogHadiah>
     */
    public function getKatalogQuery(): Builder
    {
        return KatalogHadiah::query()->with('kategori')->latest('id');
    }

    /**
     * Get base query for redemptions.
     *
     * @return Builder<PenukaranHadiah>
     */
    public function getPenukaranQuery(): Builder
    {
        return PenukaranHadiah::query()->with(['user', 'hadiah', 'alamat'])->latest('id');
    }

    /**
     * Create new reward item.
     *
     * @param  array<string, mixed>  $data
     */
    public function createKatalog(array $data): KatalogHadiah
    {
        return $this->transactional(function () use ($data): KatalogHadiah {
            $hadiah = KatalogHadiah::create($data);
            $this->logInfo('Katalog hadiah created', ['hadiah_id' => $hadiah->id]);

            return $hadiah;
        });
    }

    /**
     * Update reward item.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateKatalog(KatalogHadiah|int $hadiah, array $data): KatalogHadiah
    {
        return $this->transactional(function () use ($hadiah, $data): KatalogHadiah {
            $model = $hadiah instanceof KatalogHadiah ? $hadiah : KatalogHadiah::findOrFail($hadiah);
            $model->update($data);
            $this->logInfo('Katalog hadiah updated', ['hadiah_id' => $model->id]);

            return $model->fresh('kategori');
        });
    }

    /**
     * Update shipment status of a redemption.
     */
    public function updateStatusPenukaran(PenukaranHadiah|int $penukaran, string $status, ?string $noResi = null): PenukaranHadiah
    {
        return $this->transactional(function () use ($penukaran, $status, $noResi): PenukaranHadiah {
            $model = $penukaran instanceof PenukaranHadiah ? $penukaran : PenukaranHadiah::findOrFail($penukaran);

            $updateData = ['status_pengiriman' => $status];
            if ($noResi !== null) {
                $updateData['no_resi'] = $noResi;
            }

            $model->update($updateData);
            $this->logInfo('Status penukaran hadiah updated', [
                'penukaran_id' => $model->id,
                'status' => $status,
                'no_resi' => $noResi,
            ]);

            return $model->fresh(['user', 'hadiah', 'alamat']);
        });
    }

    /**
     * Get aggregate statistics for rewards.
     *
     * @return array<string, int>
     */
    public function getStats(): array
    {
        return [
            'total_katalog' => KatalogHadiah::count(),
            'total_stok' => (int) KatalogHadiah::sum('stok'),
            'total_penukaran' => PenukaranHadiah::count(),
            'menunggu_konfirmasi' => PenukaranHadiah::where('status_pengiriman', 'menunggu_konfirmasi')->count(),
            'dikirim' => PenukaranHadiah::where('status_pengiriman', 'dikirim')->count(),
            'selesai' => PenukaranHadiah::where('status_pengiriman', 'selesai')->count(),
        ];
    }
}
