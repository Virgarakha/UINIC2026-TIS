<?php

namespace App\DataTables;

use App\Models\PeringatanDini;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class PeringatanDiniDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<PeringatanDini>  $query
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->editColumn('level_peringatan', function (PeringatanDini $item): string {
                $color = match ($item->level_peringatan) {
                    'AWAS' => 'danger',
                    'SIAGA' => 'warning',
                    default => 'info',
                };

                return '<span class="badge bg-'.$color.' text-white px-2.5 py-1 rounded-pill fw-bold" style="font-size: 11.5px;">'
                    .'<i class="bi bi-broadcast me-1"></i>'.e($item->level_peringatan).'</span>';
            })
            ->editColumn('tipe_bahaya', function (PeringatanDini $item): string {
                $tipe = $item->tipe_bahaya ?? 'Banjir & Luapan Air';
                $icon = match (true) {
                    str_contains($tipe, 'Penyakit') || str_contains($tipe, 'Wabah') => '🦟',
                    str_contains($tipe, 'Bakar') || str_contains($tipe, 'Gas') => '🔥',
                    str_contains($tipe, 'Bau') || str_contains($tipe, 'Cemar') => '☣️',
                    str_contains($tipe, 'Longsor') || str_contains($tipe, 'Tanggul') => '⚠️',
                    default => '🌊',
                };

                return '<span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 11.5px;">'
                    .$icon.' '.e($tipe).'</span>';
            })
            ->editColumn('pesan_broadcast', function (PeringatanDini $item): string {
                return '<div class="d-flex flex-column">'
                    .'<span class="fw-semibold text-dark" style="font-size: 13px;">'.e($item->pesan_broadcast).'</span>'
                    .'<small class="text-secondary" style="font-size: 11.5px;">Radius: '.number_format($item->radius_terdampak_meter).' meter dari titik bahaya</small>'
                    .'</div>';
            })
            ->editColumn('laporan_id', function (PeringatanDini $item): string {
                $laporan = $item->laporan;
                $alamat = $laporan ? e($laporan->alamat_lokasi) : 'Laporan #'.$item->laporan_id;

                return '<span class="text-dark fw-medium text-truncate d-inline-block" style="max-width: 200px; font-size: 12.5px;">'.$alamat.'</span>';
            })
            ->editColumn('status_aktif', function (PeringatanDini $item): string {
                if ($item->status_aktif) {
                    return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 11px;"><i class="bi bi-dot"></i>Broadcast Aktif</span>';
                }

                return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1 rounded-pill" style="font-size: 11px;">Kedaluwarsa</span>';
            })
            ->editColumn('waktu_broadcast', function (PeringatanDini $item): string {
                return $item->waktu_broadcast ? '<span class="text-secondary" style="font-size: 12.5px;">'.$item->waktu_broadcast->format('d M Y H:i').'</span>' : '-';
            })
            ->rawColumns(['level_peringatan', 'tipe_bahaya', 'pesan_broadcast', 'laporan_id', 'status_aktif', 'waktu_broadcast'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<PeringatanDini>
     */
    public function query(PeringatanDini $model): QueryBuilder
    {
        return $model->newQuery()->with('laporan')->latest('id');
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('peringatan-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.peringatan-dini.index', [], false))
            ->orderBy(5, 'desc')
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
            Column::make('level_peringatan')->title('Tingkat Siaga')->addClass('align-middle'),
            Column::make('tipe_bahaya')->title('Tipe Ancaman / Dampak')->addClass('align-middle'),
            Column::make('pesan_broadcast')->title('Pesan Broadcast & Radius')->addClass('align-middle'),
            Column::make('laporan_id')->title('Titik Lokasi Dampak')->addClass('align-middle'),
            Column::make('status_aktif')->title('Status')->addClass('align-middle'),
            Column::make('waktu_broadcast')->title('Waktu Rilis')->addClass('align-middle'),
        ];
    }
}
