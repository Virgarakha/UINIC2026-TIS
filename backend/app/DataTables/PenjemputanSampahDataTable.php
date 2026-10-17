<?php

namespace App\DataTables;

use App\Models\PenjemputanSampah;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class PenjemputanSampahDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<PenjemputanSampah>  $query
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->editColumn('pengepul_id', function (PenjemputanSampah $item): string {
                $nama = $item->pengepul ? e($item->pengepul->name) : 'Belum Diklaim';

                return '<div class="d-flex align-items-center gap-2">'
                    .'<div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 13px;">'
                    .strtoupper(substr($nama, 0, 1))
                    .'</div>'
                    .'<div class="d-flex flex-column">'
                    .'<span class="fw-semibold text-dark" style="font-size: 13px;">'.$nama.'</span>'
                    .'<small class="text-secondary" style="font-size: 11px;">Mitra Pengepul</small>'
                    .'</div>'
                    .'</div>';
            })
            ->editColumn('laporan_id', function (PenjemputanSampah $item): string {
                $alamat = $item->laporan ? e($item->laporan->alamat_lokasi) : 'Laporan #'.$item->laporan_id;

                return '<span class="text-dark fw-medium text-truncate d-inline-block" style="max-width: 220px; font-size: 13px;">'.$alamat.'</span>';
            })
            ->editColumn('status_jemput', function (PenjemputanSampah $item): string {
                $badge = match ($item->status_jemput) {
                    'selesai' => 'bg-success text-success border-success',
                    'menuju_lokasi' => 'bg-primary text-primary border-primary',
                    'klaim' => 'bg-warning text-warning border-warning',
                    default => 'bg-secondary text-secondary border-secondary',
                };

                return '<span class="badge '.$badge.' bg-opacity-10 border border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold text-capitalize" style="font-size: 11.5px;">'
                    .str_replace('_', ' ', $item->status_jemput).'</span>';
            })
            ->editColumn('timbangan_riil_kg', function (PenjemputanSampah $item): string {
                if ($item->timbangan_riil_kg !== null) {
                    return '<span class="fw-bold text-dark" style="font-size: 13px;">'.number_format($item->timbangan_riil_kg, 1).' kg</span>';
                }

                return '<span class="text-muted" style="font-size: 12px;">Menunggu timbang</span>';
            })
            ->editColumn('foto_bukti_bersih_url', function (PenjemputanSampah $item): string {
                if ($item->foto_bukti_bersih_url) {
                    return '<a href="'.e($item->foto_bukti_bersih_url).'" target="_blank" class="d-inline-flex align-items-center gap-1 text-primary text-decoration-none fw-semibold" style="font-size: 12px;">'
                        .'<i class="bi bi-image"></i> Lihat Bukti</a>';
                }

                return '<span class="text-muted" style="font-size: 12px;">-</span>';
            })
            ->editColumn('created_at', function (PenjemputanSampah $item): string {
                return $item->created_at ? '<span class="text-secondary" style="font-size: 12.5px;">'.$item->created_at->format('d M Y H:i').'</span>' : '-';
            })
            ->rawColumns(['pengepul_id', 'laporan_id', 'status_jemput', 'timbangan_riil_kg', 'foto_bukti_bersih_url', 'created_at'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<PenjemputanSampah>
     */
    public function query(PenjemputanSampah $model): QueryBuilder
    {
        return $model->newQuery()->with(['pengepul', 'laporan'])->latest('id');
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('penjemputan-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.penjemputan.index', [], false))
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
            Column::make('pengepul_id')->title('Mitra Pengepul')->addClass('align-middle'),
            Column::make('laporan_id')->title('Titik Lokasi Sampah')->addClass('align-middle'),
            Column::make('status_jemput')->title('Status Angkut')->addClass('align-middle'),
            Column::make('timbangan_riil_kg')->title('Timbangan Riil')->addClass('align-middle'),
            Column::make('foto_bukti_bersih_url')->title('Proof of Pickup')->addClass('align-middle'),
            Column::make('created_at')->title('Waktu Klaim')->addClass('align-middle'),
        ];
    }
}
