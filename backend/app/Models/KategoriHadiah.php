<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'slug', 'icon'])]
class KategoriHadiah extends Model
{
    use HasFactory;

    protected $table = 'kategori_hadiah';

    /**
     * @return HasMany<KatalogHadiah, $this>
     */
    public function hadiah(): HasMany
    {
        return $this->hasMany(KatalogHadiah::class, 'kategori_id');
    }
}
