<?php

namespace App\DataTables;

use App\Models\KatalogHadiah;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class KatalogHadiahDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<KatalogHadiah>  $query
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->editColumn('foto_hadiah_url', function (KatalogHadiah $item): string {
                $url = e($item->foto_hadiah_url ?? 'https://placehold.co/44x44?text=Hadiah');

                return '<div class="d-flex align-items-center gap-2">'
                    .'<img src="'.$url.'" class="rounded-3 border object-fit-cover shadow-xs" style="width: 44px; height: 44px;" alt="Hadiah">'
                    .'<div class="d-flex flex-column">'
                    .'<span class="fw-bold text-dark" style="font-size: 13px;">'.e($item->nama_hadiah).'</span>'
                    .'<small class="text-secondary" style="font-size: 11.5px;">'.($item->kategori ? e($item->kategori->nama) : 'Kategori').'</small>'
                    .'</div>'
                    .'</div>';
            })
            ->editColumn('poin_dibutuhkan', function (KatalogHadiah $item): string {
                return '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-30 px-2.5 py-1 rounded-pill fw-bold" style="font-size: 12px;">'
                    .'<i class="bi bi-coin text-warning me-1"></i>'.number_format($item->poin_dibutuhkan).' Poin</span>';
            })
            ->editColumn('stok', function (KatalogHadiah $item): string {
                $badge = $item->stok > 10 ? 'bg-success' : ($item->stok > 0 ? 'bg-warning' : 'bg-danger');

                return '<span class="badge '.$badge.' bg-opacity-10 text-dark border px-2 py-1 rounded-pill" style="font-size: 11.5px;">'
                    .number_format($item->stok).' unit</span>';
            })
            ->editColumn('is_aktif', function (KatalogHadiah $item): string {
                if ($item->is_aktif) {
                    return '<span class="badge bg-success text-white px-2 py-1 rounded-pill" style="font-size: 11px;">Aktif</span>';
                }

                return '<span class="badge bg-secondary text-white px-2 py-1 rounded-pill" style="font-size: 11px;">Non-Aktif</span>';
            })
            ->rawColumns(['foto_hadiah_url', 'poin_dibutuhkan', 'stok', 'is_aktif'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<KatalogHadiah>
     */
    public function query(KatalogHadiah $model): QueryBuilder
    {
        return $model->newQuery()->with('kategori')->latest('id');
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('hadiah-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.hadiah.index', [], false))
            ->orderBy(1, 'desc')
            ->responsive(true)
            ->autoWidth(false)
            ->parameters([
                'dom' => "<'table-responsive'tr>",
                'pageLength' => 10,
                'pagingType' => 'simple',
            ]);
    }

    /**
     * Get the dataTable columns definition.
     *
     * @return array<int, Column>
     */
    public function getColumns(): array
    {
        return [
            Column::make('foto_hadiah_url')->title('Item Hadiah')->addClass('align-middle'),
            Column::make('poin_dibutuhkan')->title('Biaya Poin')->addClass('align-middle'),
            Column::make('stok')->title('Sisa Stok')->addClass('align-middle'),
            Column::make('is_aktif')->title('Status')->addClass('align-middle'),
        ];
    }
}
