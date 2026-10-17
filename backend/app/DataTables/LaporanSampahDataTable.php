<?php

namespace App\DataTables;

use App\Models\LaporanSampah;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class LaporanSampahDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<LaporanSampah>  $query
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->editColumn('foto_url', function (LaporanSampah $laporan): string {
                $url = e($laporan->foto_url);

                return '<div class="d-flex align-items-center gap-2">'
                    .'<img src="'.$url.'" class="rounded-3 border object-fit-cover shadow-xs" style="width: 44px; height: 44px;" alt="Bukti" onerror="this.src=\'https://placehold.co/44x44?text=Foto\'">'
                    .'<div class="d-flex flex-column lh-sm">'
                    .'<span class="fw-bold text-dark" style="font-size: 13px;">#LAP-'.$laporan->id.'</span>'
                    .'<small class="text-muted" style="font-size: 11px;">'.($laporan->created_at ? $laporan->created_at->diffForHumans() : '-').'</small>'
                    .'</div>'
                    .'</div>';
            })
            ->editColumn('alamat_lokasi', function (LaporanSampah $laporan): string {
                $pelapor = $laporan->pelapor ? e($laporan->pelapor->name) : 'Anonim / Publik';

                return '<div class="d-flex flex-column">'
                    .'<span class="fw-semibold text-dark text-truncate" style="max-width: 240px; font-size: 13px;">'.e($laporan->alamat_lokasi ?? 'Lokasi GPS').'</span>'
                    .'<small class="text-secondary" style="font-size: 11.5px;">Pelapor: '.$pelapor.'</small>'
                    .'</div>';
            })
            ->editColumn('kategori_id', function (LaporanSampah $laporan): string {
                $nama = $laporan->kategori ? e($laporan->kategori->nama) : 'Umum';

                return '<span class="badge bg-light text-dark border px-2 py-1 rounded-pill" style="font-size: 11.5px;">'.$nama.'</span>';
            })
            ->editColumn('status_id', function (LaporanSampah $laporan): string {
                $status = $laporan->status;
                $color = $status?->badge_color ?? 'secondary';
                $nama = $status ? e($status->nama) : 'Menunggu';

                return '<span class="badge bg-'.$color.' bg-opacity-10 text-'.$color.' border border-'.$color.' border-opacity-25 px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 11.5px;">'.$nama.'</span>';
            })
            ->editColumn('is_resiko_banjir', function (LaporanSampah $laporan): string {
                $hazard = $laporan->tipe_bahaya;
                if (! $hazard && $laporan->is_resiko_banjir) {
                    $hazard = 'Banjir & Luapan';
                }

                if ($hazard) {
                    $icon = 'bi-exclamation-triangle-fill';
                    $color = 'danger';
                    $lower = strtolower($hazard);

                    if (str_contains($lower, 'banjir')) {
                        $icon = 'bi-water';
                        $color = 'danger';
                    } elseif (str_contains($lower, 'wabah') || str_contains($lower, 'dbd')) {
                        $icon = 'bi-virus';
                        $color = 'warning';
                    } elseif (str_contains($lower, 'kebakaran') || str_contains($lower, 'metana')) {
                        $icon = 'bi-fire';
                        $color = 'danger';
                    } elseif (str_contains($lower, 'bau') || str_contains($lower, 'pencemaran')) {
                        $icon = 'bi-radioactive';
                        $color = 'dark';
                    } elseif (str_contains($lower, 'longsor')) {
                        $icon = 'bi-triangle-half';
                        $color = 'warning';
                    }

                    return '<span class="badge bg-'.$color.' bg-opacity-10 text-'.$color.' border border-'.$color.' border-opacity-25 px-2.5 py-1 rounded-pill fw-bold" style="font-size: 11px;"><i class="bi '.$icon.' me-1"></i>'.e($hazard).'</span>';
                }

                return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-2 py-1 rounded-pill" style="font-size: 11px;"><i class="bi bi-shield-check me-1"></i>Aman</span>';
            })
            ->addColumn('tanggapan', function (LaporanSampah $laporan): string {
                return '<div class="d-flex align-items-center gap-2 text-secondary" style="font-size: 12px;">'
                    .'<span title="Tanggapan Warga"><i class="bi bi-chat-dots-fill text-primary me-1"></i>'.$laporan->total_tanggapan.'</span>'
                    .'<span title="Foto Tambahan"><i class="bi bi-camera-fill text-info me-1"></i>'.$laporan->total_foto_tambahan.'</span>'
                    .'</div>';
            })
            ->addColumn('action', 'admin.laporan.action')
            ->rawColumns(['foto_url', 'alamat_lokasi', 'kategori_id', 'status_id', 'is_resiko_banjir', 'tanggapan', 'action'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<LaporanSampah>
     */
    public function query(LaporanSampah $model): QueryBuilder
    {
        $query = $model->newQuery()->with(['pelapor', 'kategori', 'status'])->latest('id');

        if ($statusId = request('status_id')) {
            $query->where('status_id', $statusId);
        }

        if (request('kritis') === '1') {
            $query->where(function (QueryBuilder $q): void {
                $q->where('is_resiko_banjir', true)
                    ->orWhereNotNull('tipe_bahaya');
            });
        }

        return $query;
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('laporan-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.laporan.index', [], false))
            ->orderBy(0, 'desc')
            ->responsive(true)
            ->autoWidth(false)
            ->parameters([
                'dom' => "<'table-responsive'tr>",
                'pageLength' => 10,
                'pagingType' => 'simple',
                'language' => [
                    'emptyTable' => 'Belum ada data laporan sampah.',
                    'zeroRecords' => 'Tidak ditemukan data laporan yang cocok.',
                ],
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
            Column::make('foto_url')->title('Laporan')->addClass('align-middle'),
            Column::make('alamat_lokasi')->title('Lokasi & Pelapor')->addClass('align-middle'),
            Column::make('kategori_id')->title('Kategori')->addClass('align-middle'),
            Column::make('status_id')->title('Status')->addClass('align-middle'),
            Column::make('is_resiko_banjir')->title('Potensi Bahaya')->addClass('align-middle'),
            Column::computed('tanggapan')->title('Respon Warga')->addClass('align-middle')->searchable(false)->orderable(false),
            Column::computed('action')->title('')->addClass('text-end align-middle')->searchable(false)->orderable(false)->width(100),
        ];
    }
}
