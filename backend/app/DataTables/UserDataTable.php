<?php

namespace App\DataTables;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder as QueryBuilder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Html\Builder as HtmlBuilder;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class UserDataTable extends DataTable
{
    /**
     * Build the DataTable class.
     *
     * @param  QueryBuilder<User>  $query  Results from query() method.
     */
    public function dataTable(QueryBuilder $query): EloquentDataTable
    {
        return (new EloquentDataTable($query))
            ->filterColumn('email_verified_at', function (QueryBuilder $query, string $keyword): void {
                if (strcasecmp($keyword, 'Paid') === 0) {
                    $query->whereNotNull('email_verified_at');
                } elseif (strcasecmp($keyword, 'Pending') === 0) {
                    $query->whereNull('email_verified_at');
                }
            })
            ->editColumn('name', function (User $user): string {
                $initial = strtoupper(substr($user->name, 0, 1));
                $handle = '@'.strtolower(preg_replace('/[^a-zA-Z0-9]/', '', explode(' ', $user->name)[0] ?? 'user'));

                return '<div class="d-flex align-items-center gap-3">'
                    .'<div class="avatar-squircle">'.e($initial).'</div>'
                    .'<div class="d-flex flex-column lh-sm">'
                    .'<span class="user-fullname fw-semibold text-dark" style="font-size: 13.5px;">'.e($user->name).'</span>'
                    .'<span class="user-handle text-muted" style="font-size: 12px; margin-top: 2px;">'.e($handle).'</span>'
                    .'</div>'
                    .'</div>';
            })
            ->editColumn('email', function (User $user): string {
                return '<span class="text-secondary" style="font-size: 13px;">'.e($user->email).'</span>';
            })
            ->editColumn('created_at', function (User $user): string {
                return $user->created_at ? '<span class="text-secondary" style="font-size: 13px;">'.$user->created_at->format('M d, Y').'</span>' : '-';
            })
            ->editColumn('email_verified_at', function (User $user): string {
                if ($user->email_verified_at !== null) {
                    return '<span class="status-badge"><span class="status-dot green"></span>Paid</span>';
                }

                return '<span class="status-badge"><span class="status-dot amber"></span>Pending</span>';
            })
            ->addColumn('amount', function (User $user): string {
                $amount = number_format(80 + (($user->id * 17) % 35) + 0.32, 2);

                return '<span class="fw-semibold text-dark" style="font-size: 13px;">$'.$amount.'</span>';
            })
            ->addColumn('action', 'admin.users.action')
            ->rawColumns(['name', 'email', 'created_at', 'email_verified_at', 'amount', 'action'])
            ->setRowId('id');
    }

    /**
     * Get the query source of dataTable.
     *
     * @return QueryBuilder<User>
     */
    public function query(User $model): QueryBuilder
    {
        $query = $model->newQuery()->latest('id');

        if ($status = request('status')) {
            if (strcasecmp($status, 'Paid') === 0) {
                $query->whereNotNull('email_verified_at');
            } elseif (strcasecmp($status, 'Pending') === 0) {
                $query->whereNull('email_verified_at');
            }
        }

        return $query;
    }

    /**
     * Configure the html builder.
     */
    public function html(): HtmlBuilder
    {
        return $this->builder()
            ->setTableId('users-table')
            ->columns($this->getColumns())
            ->minifiedAjax(route('admin.users.index', [], false))
            ->orderBy(0, 'asc')
            ->responsive(true)
            ->autoWidth(false)
            ->parameters([
                'dom' => "<'table-responsive'tr>",
                'pageLength' => 10,
                'pagingType' => 'simple',
                'language' => [
                    'emptyTable' => 'No customers or users found in database.',
                    'zeroRecords' => 'No matching records found.',
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
            Column::make('name')->title('Customers')->addClass('align-middle'),
            Column::make('email')->title('Email')->addClass('align-middle'),
            Column::make('created_at')->title('Date')->addClass('align-middle'),
            Column::make('email_verified_at')->title('Status')->addClass('align-middle'),
            Column::computed('amount')
                ->title('Amount')
                ->addClass('align-middle')
                ->searchable(false)
                ->orderable(false),
            Column::computed('action')
                ->title('')
                ->exportable(false)
                ->printable(false)
                ->searchable(false)
                ->orderable(false)
                ->width(70)
                ->addClass('text-end align-middle'),
        ];
    }

    /**
     * Get the filename for export.
     */
    protected function filename(): string
    {
        return 'Customers_'.date('YmdHis');
    }
}
