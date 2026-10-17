<?php

namespace App\DataTables;

use App\Models\PenukaranHadiah;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class PenukaranHadiahDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<PenukaranHadiah>  $query
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->editColumn('user_id', function (PenukaranHadiah $item): string {
                $user = $item->user;
                $nama = $user ? e($user->name) : 'User';

                return '<div class="d-flex flex-column">'
                    .'<span class="fw-semibold text-dark" style="font-size: 13px;">'.$nama.'</span>'
                    .'<small class="text-secondary" style="font-size: 11.5px;">'.($user ? e($user->email) : '-').'</small>'
                    .'</div>';
            })
            ->editColumn('hadiah_id', function (PenukaranHadiah $item): string {
                $namaHadiah = $item->hadiah ? e($item->hadiah->nama_hadiah) : 'Item Hadiah';

                return '<div class="d-flex flex-column">'
                    .'<span class="fw-bold text-dark" style="font-size: 13px;">'.$namaHadiah.'</span>'
                    .'<span class="text-warning fw-semibold" style="font-size: 11.5px;"><i class="bi bi-coin me-1"></i>'.number_format($item->poin_digunakan).' Poin</span>'
                    .'</div>';
            })
            ->editColumn('status_pengiriman', function (PenukaranHadiah $item): string {
                $badge = match ($item->status_pengiriman) {
                    'selesai' => 'bg-success text-success border-success',
                    'dikirim' => 'bg-info text-info border-info',
                    'diproses' => 'bg-primary text-primary border-primary',
                    default => 'bg-warning text-warning border-warning',
                };

                return '<span class="badge '.$badge.' bg-opacity-10 border border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold text-capitalize" style="font-size: 11.5px;">'
                    .str_replace('_', ' ', $item->status_pengiriman).'</span>';
            })
            ->editColumn('no_resi', function (PenukaranHadiah $item): string {
                if ($item->no_resi) {
                    return '<code class="fw-bold text-dark px-2 py-0.5 rounded bg-light border" style="font-size: 12px;">'.e($item->no_resi).'</code>';
                }

                return '<span class="text-muted" style="font-size: 12px;">Belum ada resi</span>';
            })
            ->editColumn('created_at', function (PenukaranHadiah $item): string {
                return $item->created_at ? '<span class="text-secondary" style="font-size: 12.5px;">'.$item->created_at->format('d M Y H:i').'</span>' : '-';
            })
            ->rawColumns(['user_id', 'hadiah_id', 'status_pengiriman', 'no_resi', 'created_at'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<PenukaranHadiah>
     */
    public function query(PenukaranHadiah $model): QueryBuilder
    {
        return $model->newQuery()->with(['user', 'hadiah', 'alamat'])->latest('id');
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('penukaran-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.penukaran.index', [], false))
            ->orderBy(4, 'desc')
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
            Column::make('user_id')->title('Penerima Hadiah')->addClass('align-middle'),
            Column::make('hadiah_id')->title('Hadiah Diklaim')->addClass('align-middle'),
            Column::make('status_pengiriman')->title('Status Pengiriman')->addClass('align-middle'),
            Column::make('no_resi')->title('Nomor Resi')->addClass('align-middle'),
            Column::make('created_at')->title('Tanggal Klaim')->addClass('align-middle'),
        ];
    }
}
