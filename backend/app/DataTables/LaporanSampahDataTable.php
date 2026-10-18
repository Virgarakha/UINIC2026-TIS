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
                $fullDate = $laporan->created_at ? $laporan->created_at->translatedFormat('d F Y, H:i') : '-';
                $diffTime = $laporan->created_at ? $laporan->created_at->diffForHumans() : '-';

                return '<div class="d-flex align-items-center gap-2.5">'
                    .'<div class="position-relative cursor-pointer report-photo-trigger" data-img-src="'.$url.'" data-title="Laporan #LAP-'.$laporan->id.'" title="Klik untuk perbesar foto">'
                    .'<img src="'.$url.'" class="rounded-3 border object-fit-cover shadow-xs" style="width: 48px; height: 48px; min-width: 48px;" alt="Bukti" onerror="this.src=\'https://placehold.co/48x48?text=Foto\'">'
                    .'<span class="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 16px; height: 16px; font-size: 9px;"><i class="bi bi-zoom-in"></i></span>'
                    .'</div>'
                    .'<div class="d-flex flex-column lh-sm">'
                    .'<a href="javascript:void(0)" class="fw-bold text-primary text-decoration-none btn-detail-laporan mb-0.5" data-id="'.$laporan->id.'" style="font-size: 13px;">#LAP-'.$laporan->id.'</a>'
                    .'<small class="text-secondary" style="font-size: 11px;" title="'.$fullDate.'"><i class="bi bi-clock me-1"></i>'.$diffTime.'</small>'
                    .'</div>'
                    .'</div>';
            })
            ->editColumn('alamat_lokasi', function (LaporanSampah $laporan): string {
                $pelapor = $laporan->pelapor;
                $pelaporName = $pelapor ? e($pelapor->name) : 'Warga Anonim / Publik';
                $roleBadge = match($pelapor?->role) {
                    'pengepul' => '<span class="badge border px-1.5 py-0.5 rounded-pill" style="font-size: 9.5px; background-color: #ede9fe; color: #6d28d9; border-color: #ddd6fe;"><i class="bi bi-truck me-0.5"></i>Pengepul</span>',
                    'admin' => '<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-1.5 py-0.5 rounded-pill" style="font-size: 9.5px;"><i class="bi bi-shield-lock me-0.5"></i>Admin</span>',
                    default => '<span class="badge bg-light text-secondary border px-1.5 py-0.5 rounded-pill" style="font-size: 9.5px;"><i class="bi bi-person me-0.5"></i>Warga</span>',
                };

                $coords = '';
                if ($laporan->latitude && $laporan->longitude) {
                    $mapsUrl = 'https://www.google.com/maps?q='.$laporan->latitude.','.$laporan->longitude;
                    $coords = '<a href="'.$mapsUrl.'" target="_blank" class="text-decoration-none text-muted d-inline-flex align-items-center gap-1 mt-0.5" style="font-size: 11px;" title="Buka Koordinat GPS di Google Maps">'
                        .'<i class="bi bi-geo-alt text-danger"></i> '.number_format($laporan->latitude, 4).', '.number_format($laporan->longitude, 4)
                        .'</a>';
                }

                return '<div class="d-flex flex-column" style="max-width: 250px;">'
                    .'<span class="fw-semibold text-dark text-truncate" title="'.e($laporan->alamat_lokasi).'" style="font-size: 13px;">'.e($laporan->alamat_lokasi ?? 'Lokasi GPS').'</span>'
                    .'<div class="d-flex align-items-center gap-1.5 mt-0.5 text-truncate">'
                    .'<span class="text-secondary small fw-medium" style="font-size: 11.5px;">'.$pelaporName.'</span>'
                    .$roleBadge
                    .'</div>'
                    .$coords
                    .'</div>';
            })
            ->editColumn('kategori_id', function (LaporanSampah $laporan): string {
                $kat = $laporan->kategori;
                $nama = $kat ? e($kat->nama) : 'Umum';
                $recyclable = ($kat && $kat->is_daur_ulang)
                    ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-pill px-1.5 py-0.5 ms-1" style="font-size: 9.5px;"><i class="bi bi-recycle"></i> Bernilai</span>'
                    : '';

                return '<div class="d-flex flex-column align-items-start gap-1">'
                    .'<span class="badge bg-light text-dark border px-2 py-1 rounded-3 fw-semibold" style="font-size: 11.5px;">'.$nama.'</span>'
                    .$recyclable
                    .'</div>';
            })
            ->editColumn('status_id', function (LaporanSampah $laporan): string {
                $status = $laporan->status;
                $color = $status?->badge_color ?? 'secondary';
                $nama = $status ? e($status->nama) : 'Menunggu';

                return '<span class="badge bg-'.$color.' bg-opacity-10 text-'.$color.' border border-'.$color.' border-opacity-25 px-2.5 py-1.5 rounded-pill fw-bold" style="font-size: 11.5px;">'
                    .'<span class="d-inline-block rounded-circle bg-'.$color.' me-1.5" style="width: 6px; height: 6px;"></span>'
                    .$nama
                    .'</span>';
            })
            ->editColumn('is_resiko_banjir', function (LaporanSampah $laporan): string {
                $ai = $laporan->analisisAi;
                $hazard = $laporan->tipe_bahaya;
                if (! $hazard && $laporan->is_resiko_banjir) {
                    $hazard = 'Banjir & Luapan';
                }

                $risk = $ai?->tingkat_resiko_banjir ?? ($laporan->is_resiko_banjir ? 'KRITIS' : 'RENDAH');
                $riskColor = match(strtoupper($risk)) {
                    'KRITIS' => 'danger',
                    'TINGGI' => 'warning',
                    'SEDANG' => 'primary',
                    default => 'success',
                };

                $aiConfidence = '';
                if ($ai && $ai->ai_confidence_score) {
                    $pct = $ai->ai_confidence_score > 1.0 ? round($ai->ai_confidence_score) : round($ai->ai_confidence_score * 100);
                    $aiConfidence = '<span class="badge bg-light text-secondary border px-1.5 py-0.5 rounded-pill" style="font-size: 10px;" title="Skor Akurasi AI Vision">'
                        .'<i class="bi bi-cpu text-primary me-0.5"></i>'.$pct.'% AI'
                        .'</span>';
                }

                $volume = '';
                if ($ai && $ai->estimasi_volume_m3 > 0) {
                    $volume = '<small class="text-secondary fw-semibold mt-0.5" style="font-size: 10.5px;">'
                        .'Vol: '.$ai->estimasi_volume_m3.' m³'
                        .($ai->estimasi_sumbatan_persen > 0 ? ' (Sumbatan '.$ai->estimasi_sumbatan_persen.'%)' : '')
                        .'</small>';
                }

                $hazardBadge = '';
                if ($hazard) {
                    $hazardBadge = '<span class="badge bg-'.$riskColor.' bg-opacity-10 text-'.$riskColor.' border border-'.$riskColor.' border-opacity-25 px-2 py-0.5 rounded-pill fw-bold" style="font-size: 10.5px;">'
                        .'<i class="bi bi-exclamation-triangle-fill me-1"></i>'.e($hazard)
                        .'</span>';
                } else {
                    $hazardBadge = '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-2 py-0.5 rounded-pill" style="font-size: 10.5px;">'
                        .'<i class="bi bi-shield-check me-1"></i>Aman'
                        .'</span>';
                }

                return '<div class="d-flex flex-column align-items-start gap-1">'
                    .'<div class="d-flex align-items-center gap-1 flex-wrap">'
                    .$hazardBadge
                    .$aiConfidence
                    .'</div>'
                    .$volume
                    .'</div>';
            })
            ->addColumn('tanggapan', function (LaporanSampah $laporan): string {
                return '<div class="d-flex align-items-center gap-2 text-secondary" style="font-size: 12px;">'
                    .'<span class="badge bg-light text-dark border px-2 py-1 rounded-pill" title="Respon & Tanggapan Komunitas">'
                    .'<i class="bi bi-chat-dots-fill text-primary me-1"></i>'.$laporan->total_tanggapan
                    .'</span>'
                    .'<span class="badge bg-light text-dark border px-2 py-1 rounded-pill" title="Foto Bukti Tambahan">'
                    .'<i class="bi bi-camera-fill text-info me-1"></i>'.$laporan->total_foto_tambahan
                    .'</span>'
                    .'</div>';
            })
            ->addColumn('action', function (LaporanSampah $laporan): string {
                return view('admin.laporan.action', compact('laporan'))->render();
            })
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
        $query = $model->newQuery()
            ->with([
                'pelapor',
                'kategori',
                'status',
                'analisisAi.jenisSampahDominan',
                'dataLingkungan',
                'tanggapan',
            ])
            ->latest('id');

        if ($statusId = request('status_id')) {
            $query->where('status_id', $statusId);
        }

        if ($kategoriId = request('kategori_id')) {
            $query->where('kategori_id', $kategoriId);
        }

        if (request('kritis') === '1' || request('hazard') === 'kritis') {
            $query->where(function (QueryBuilder $q): void {
                $q->where('is_resiko_banjir', true)
                    ->orWhereNotNull('tipe_bahaya');
            });
        } elseif (request('hazard') === 'aman') {
            $query->where('is_resiko_banjir', false)->whereNull('tipe_bahaya');
        }

        if ($risk = request('risk_level')) {
            $query->whereHas('analisisAi', fn ($q) => $q->where('tingkat_resiko_banjir', strtoupper($risk)));
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
                'dom' => "<'row align-items-center mb-3'<'col-12 col-md-6'l><'col-12 col-md-6 d-flex justify-content-md-end'f>>"
                    ."<'table-responsive'tr>"
                    ."<'row align-items-center mt-3'<'col-12 col-md-5'i><'col-12 col-md-7 d-flex justify-content-md-end'p>>",
                'pageLength' => 10,
                'lengthMenu' => [[10, 25, 50, -1], [10, 25, 50, 'Semua']],
                'pagingType' => 'simple_numbers',
                'language' => [
                    'search' => '_INPUT_',
                    'searchPlaceholder' => 'Cari laporan, lokasi, atau pelapor...',
                    'lengthMenu' => 'Tampilkan _MENU_ data',
                    'info' => 'Menampilkan _START_ sampai _END_ dari _TOTAL_ laporan',
                    'infoEmpty' => 'Menampilkan 0 laporan',
                    'infoFiltered' => '(disaring dari _MAX_ total laporan)',
                    'emptyTable' => 'Belum ada data laporan sampah.',
                    'zeroRecords' => 'Tidak ditemukan data laporan yang cocok.',
                    'paginate' => [
                        'first' => '<i class="bi bi-chevron-double-left"></i>',
                        'previous' => '<i class="bi bi-chevron-left"></i>',
                        'next' => '<i class="bi bi-chevron-right"></i>',
                        'last' => '<i class="bi bi-chevron-double-right"></i>',
                    ],
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
            Column::make('is_resiko_banjir')->title('Potensi Bahaya & AI')->addClass('align-middle'),
            Column::computed('tanggapan')->title('Respon Warga')->addClass('align-middle text-center')->searchable(false)->orderable(false),
            Column::computed('action')->title('Aksi Operasional')->addClass('text-end align-middle')->searchable(false)->orderable(false)->width(140),
        ];
    }
}
