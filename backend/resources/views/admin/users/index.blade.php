@extends('layouts.admin')

@section('title', 'Customers')
@section('page_title', 'Customers - User Management')

@push('styles')
<style>
    .customers-card {
        background: #ffffff;
        border-radius: 18px;
        border: 1px solid #eaecf0;
        box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);
        padding: 1.75rem 2rem;
    }
    .avatar-squircle {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #f2f4f7;
        color: #344054;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid #eaecf0;
    }
    .status-badge {
        display: inline-flex;
        align-items: center;
        background: #ffffff;
        border: 1px solid #e4e7ec;
        border-radius: 9999px;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 500;
        color: #344054;
        box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    }
    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
    }
    .status-dot.green { background-color: #12b76a; }
    .status-dot.amber { background-color: #f79009; }

    .action-icon-btn {
        background: transparent;
        border: none;
        color: #98a2b3;
        padding: 4px;
        font-size: 16px;
        cursor: pointer;
        line-height: 1;
        transition: color 0.15s ease, transform 0.15s ease;
    }
    .action-icon-btn:hover {
        color: #475467;
    }
    .action-icon-btn.btn-delete-user:hover {
        color: #d92d20;
    }
    .action-icon-btn.btn-edit-user:hover {
        color: #4f46e5;
    }

    #users-table {
        border-collapse: separate !important;
        border-spacing: 0 !important;
        width: 100% !important;
    }
    #users-table thead th {
        background-color: transparent !important;
        border-top: none !important;
        border-bottom: 1px solid #eaecf0 !important;
        color: #475467 !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        padding: 12px 16px !important;
    }
    #users-table tbody td {
        border-top: none !important;
        border-bottom: 1px solid #f2f4f7 !important;
        padding: 14px 16px !important;
        color: #475467;
        vertical-align: middle;
    }
    #users-table tbody tr:hover td {
        background-color: #f9fafb !important;
    }
    .pagination-btn {
        background-color: #ffffff;
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 600;
        color: #344054;
        transition: all 0.2s ease;
    }
    .pagination-btn:hover:not(:disabled) {
        background-color: #f9fafb;
        border-color: #d0d5dd;
        color: #1d2939;
    }
    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
@endpush

@section('content')
<div class="customers-card">
    <!-- Header Row (Exactly as in Reference Design) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 gap-3">
        <!-- Title & Subtitle -->
        <div>
            <h5 class="fw-bold text-dark mb-0" style="font-size: 18px; letter-spacing: -0.2px;">Customers</h5>
            <p class="text-secondary mb-0" style="font-size: 13.5px; color: #667085 !important;">Manage your customers and User Management profiles here.</p>
        </div>

        <!-- Controls: Search, Filter, Add Customer -->
        <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Search Input -->
            <div class="position-relative">
                <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3" style="color: #667085; font-size: 13px;"></i>
                <input type="text" id="customSearchInput" class="form-control rounded-3 ps-5" placeholder="Search" style="width: 220px; font-size: 13px; border-color: #d0d5dd; padding-top: 7px; padding-bottom: 7px;">
            </div>

            <!-- Status Filter Dropdown -->
            <div class="dropdown">
                <button class="btn btn-outline-secondary dropdown-toggle rounded-3 d-flex align-items-center gap-2 bg-white" type="button" id="statusDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false" style="border-color: #d0d5dd; color: #344054; font-size: 13px; font-weight: 500; padding: 7px 12px;">
                    <span class="status-dot green" id="statusFilterDot" style="display: none;"></span>
                    <span id="statusFilterText">Status • All</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3" aria-labelledby="statusDropdownBtn">
                    <li><a class="dropdown-item status-filter-opt" href="#" data-status="" data-text="Status • All" data-dot="">All Statuses</a></li>
                    <li><a class="dropdown-item status-filter-opt" href="#" data-status="Paid" data-text="Status • Paid" data-dot="green">Paid / Verified</a></li>
                    <li><a class="dropdown-item status-filter-opt" href="#" data-status="Pending" data-text="Status • Pending" data-dot="amber">Pending / Unverified</a></li>
                </ul>
            </div>

            <!-- Add Customer Button -->
            <button type="button" class="btn text-white rounded-3 d-flex align-items-center gap-1 fw-semibold shadow-sm" style="background-color: #4f46e5; border-color: #4f46e5; font-size: 13px; padding: 7px 14px;" data-bs-toggle="modal" data-bs-target="#createUserModal">
                <i class="bi bi-plus-lg"></i> Add Customer
            </button>
        </div>
    </div>

    <!-- Table Container -->
    <div class="table-responsive">
        {!! $dataTable->table(['class' => 'table align-middle w-100', 'id' => 'users-table']) !!}
    </div>

    <!-- Footer Pagination (Matching Reference Exactly) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top mt-2 gap-2" style="border-color: #eaecf0 !important;">
        <!-- Left: Previous / Next Buttons -->
        <div class="d-flex align-items-center gap-2">
            <button type="button" class="pagination-btn" id="tablePrevBtn">Previous</button>
            <button type="button" class="pagination-btn" id="tableNextBtn">Next</button>
        </div>

        <!-- Right: Per Page Dropdown & Page Count -->
        <div class="d-flex align-items-center gap-3">
            <select id="tablePageLength" class="form-select rounded-3 py-1 text-sm shadow-none" style="width: 130px; font-size: 13px; border-color: #d0d5dd; color: #344054;">
                <option value="10" selected>10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
            </select>
            <span id="tablePageInfo" class="fw-medium" style="font-size: 13px; color: #475467;">Page 1 of 1</span>
        </div>
    </div>
</div>

<!-- Modal Create User -->
<div class="modal fade" id="createUserModal" tabindex="-1" aria-labelledby="createUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="createUserForm" action="{{ route('admin.users.store') }}" method="POST">
                @csrf
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark" id="createUserModalLabel">Add New Customer</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div id="create-user-errors" class="alert alert-danger d-none rounded-3"></div>

                    <div class="mb-3">
                        <label for="create_name" class="form-label fw-semibold text-dark" style="font-size: 13px;">Full Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control rounded-3" id="create_name" name="name" required placeholder="e.g. Lily-Rose Chedjou" value="{{ old('name') }}">
                    </div>
                    <div class="mb-3">
                        <label for="create_email" class="form-label fw-semibold text-dark" style="font-size: 13px;">Email Address <span class="text-danger">*</span></label>
                        <input type="email" class="form-control rounded-3" id="create_email" name="email" required placeholder="lilyrose@gmail.com" value="{{ old('email') }}">
                    </div>
                    <div class="mb-3">
                        <label for="create_password" class="form-label fw-semibold text-dark" style="font-size: 13px;">Password <span class="text-danger">*</span></label>
                        <input type="password" class="form-control rounded-3" id="create_password" name="password" required placeholder="Minimum 8 characters">
                    </div>
                    <div class="mb-3">
                        <label for="create_password_confirmation" class="form-label fw-semibold text-dark" style="font-size: 13px;">Confirm Password <span class="text-danger">*</span></label>
                        <input type="password" class="form-control rounded-3" id="create_password_confirmation" name="password_confirmation" required placeholder="Repeat password">
                    </div>
                </div>
                <div class="modal-footer border-top bg-light rounded-bottom-4">
                    <button type="button" class="btn btn-outline-secondary rounded-3 px-3 py-1.5" style="font-size: 13px;" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn text-white rounded-3 px-3 py-1.5 fw-semibold" style="background-color: #4f46e5; font-size: 13px;">Save Customer</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Edit User -->
<div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form id="editUserForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header border-bottom pb-3">
                    <h5 class="modal-title fw-bold text-dark" id="editUserModalLabel">Edit Customer Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div id="edit-user-errors" class="alert alert-danger d-none rounded-3"></div>

                    <input type="hidden" id="edit_id" name="id">
                    <div class="mb-3">
                        <label for="edit_name" class="form-label fw-semibold text-dark" style="font-size: 13px;">Full Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control rounded-3" id="edit_name" name="name" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit_email" class="form-label fw-semibold text-dark" style="font-size: 13px;">Email Address <span class="text-danger">*</span></label>
                        <input type="email" class="form-control rounded-3" id="edit_email" name="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit_password" class="form-label fw-semibold text-dark" style="font-size: 13px;">New Password <small class="text-muted">(Leave empty to keep unchanged)</small></label>
                        <input type="password" class="form-control rounded-3" id="edit_password" name="password" placeholder="Min 8 characters">
                    </div>
                    <div class="mb-3">
                        <label for="edit_password_confirmation" class="form-label fw-semibold text-dark" style="font-size: 13px;">Confirm New Password</label>
                        <input type="password" class="form-control rounded-3" id="edit_password_confirmation" name="password_confirmation" placeholder="Repeat new password">
                    </div>
                </div>
                <div class="modal-footer border-top bg-light rounded-bottom-4">
                    <button type="button" class="btn btn-outline-secondary rounded-3 px-3 py-1.5" style="font-size: 13px;" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn text-white rounded-3 px-3 py-1.5 fw-semibold" style="background-color: #4f46e5; font-size: 13px;">Update Details</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    {!! $dataTable->scripts() !!}

    <script>
        $(document).ready(function () {
            // Wait for DataTable initialization
            const checkDt = setInterval(function () {
                if (window.LaravelDataTables && window.LaravelDataTables['users-table']) {
                    clearInterval(checkDt);
                    const dt = window.LaravelDataTables['users-table'];

                    // Sync custom search input with debounce
                    let searchTimer;
                    $('#customSearchInput').on('input', function () {
                        clearTimeout(searchTimer);
                        const term = this.value;
                        searchTimer = setTimeout(function () {
                            dt.search(term).draw();
                        }, 250);
                    });

                    // Sync status dropdown filter
                    $('.status-filter-opt').on('click', function (e) {
                        e.preventDefault();
                        const status = $(this).data('status');
                        const text = $(this).data('text');
                        const dotClass = $(this).data('dot');

                        $('#statusFilterText').text(text);
                        if (dotClass) {
                            $('#statusFilterDot').removeClass('green amber').addClass(dotClass).show();
                        } else {
                            $('#statusFilterDot').hide();
                        }

                        dt.column('email_verified_at:name').search(status).draw();
                    });

                    // Sync Pagination buttons
                    $('#tablePrevBtn').on('click', function () {
                        dt.page('previous').draw('page');
                    });

                    $('#tableNextBtn').on('click', function () {
                        dt.page('next').draw('page');
                    });

                    // Sync Page Length dropdown
                    $('#tablePageLength').on('change', function () {
                        dt.page.len(parseInt(this.value)).draw();
                    });

                    // Update page info on draw
                    dt.on('draw.dt', function () {
                        const info = dt.page.info();
                        const totalPages = info.pages || 1;
                        const currentPage = info.page + 1;

                        $('#tablePageInfo').text(`Page ${currentPage} of ${totalPages}`);
                        $('#tablePrevBtn').prop('disabled', info.page === 0);
                        $('#tableNextBtn').prop('disabled', info.page >= totalPages - 1);
                    });

                    // Initial info update
                    const initInfo = dt.page.info();
                    if (initInfo) {
                        $('#tablePageInfo').text(`Page ${initInfo.page + 1} of ${initInfo.pages || 1}`);
                        $('#tablePrevBtn').prop('disabled', initInfo.page === 0);
                        $('#tableNextBtn').prop('disabled', initInfo.page >= (initInfo.pages || 1) - 1);
                    }
                }
            }, 50);

            // Reset Create User modal on open
            $('#createUserModal').on('show.bs.modal', function () {
                $('#create-user-errors').addClass('d-none').html('');
                $('#createUserForm')[0].reset();
            });

            // Create User AJAX Handler
            $('#createUserForm').on('submit', function (e) {
                e.preventDefault();
                const form = $(this);
                const submitBtn = form.find('button[type="submit"]');
                const errorBox = $('#create-user-errors');

                errorBox.addClass('d-none').html('');
                submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1" role="status"></span> Saving...');

                $.ajax({
                    url: form.attr('action'),
                    type: 'POST',
                    data: form.serialize(),
                    headers: { 'Accept': 'application/json' },
                    success: function (res) {
                        submitBtn.prop('disabled', false).html('Save Customer');
                        $('#createUserModal').modal('hide');
                        form[0].reset();

                        Swal.fire({
                            title: 'Success!',
                            text: res.message || 'Customer added successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        if (window.LaravelDataTables && window.LaravelDataTables['users-table']) {
                            window.LaravelDataTables['users-table'].ajax.reload(null, false);
                        }
                    },
                    error: function (xhr) {
                        submitBtn.prop('disabled', false).html('Save Customer');
                        if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                            let errHtml = '<ul class="mb-0 ps-3">';
                            $.each(xhr.responseJSON.errors, function (field, msgs) {
                                $.each(msgs, function (_, m) { errHtml += `<li>${m}</li>`; });
                            });
                            errHtml += '</ul>';
                            errorBox.html(errHtml).removeClass('d-none');
                        } else {
                            errorBox.html(xhr.responseJSON?.message || 'Failed to save customer.').removeClass('d-none');
                        }
                    }
                });
            });

            // Edit User Load Modal
            $(document).on('click', '.btn-edit-user', function () {
                const userId = $(this).data('id');
                const url = `{{ url('admin/users') }}/${userId}/edit`;
                const btn = $(this);
                const originalHtml = btn.html();

                $('#edit-user-errors').addClass('d-none').html('');
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" style="width: 13px; height: 13px;" role="status"></span>');

                $.ajax({
                    url: url,
                    type: 'GET',
                    headers: { 'Accept': 'application/json' },
                    success: function (response) {
                        btn.prop('disabled', false).html(originalHtml);
                        if (response.success && response.data) {
                            const user = response.data;
                            $('#edit_id').val(user.id);
                            $('#edit_name').val(user.name);
                            $('#edit_email').val(user.email);
                            $('#edit_password').val('');
                            $('#edit_password_confirmation').val('');
                            $('#editUserForm').attr('action', `{{ url('admin/users') }}/${user.id}`);

                            $('#editUserModal').modal('show');
                        }
                    },
                    error: function (xhr) {
                        btn.prop('disabled', false).html(originalHtml);
                        Swal.fire('Error', xhr.responseJSON?.message || 'Failed to load user details.', 'error');
                    }
                });
            });

            // Edit User AJAX Submit
            $('#editUserForm').on('submit', function (e) {
                e.preventDefault();
                const form = $(this);
                const submitBtn = form.find('button[type="submit"]');
                const errorBox = $('#edit-user-errors');

                errorBox.addClass('d-none').html('');
                submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1" role="status"></span> Updating...');

                $.ajax({
                    url: form.attr('action'),
                    type: 'POST',
                    data: form.serialize(),
                    headers: { 'Accept': 'application/json' },
                    success: function (res) {
                        submitBtn.prop('disabled', false).html('Update Details');
                        $('#editUserModal').modal('hide');

                        Swal.fire({
                            title: 'Updated!',
                            text: res.message || 'Customer updated successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        if (window.LaravelDataTables && window.LaravelDataTables['users-table']) {
                            window.LaravelDataTables['users-table'].ajax.reload(null, false);
                        }
                    },
                    error: function (xhr) {
                        submitBtn.prop('disabled', false).html('Update Details');
                        if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                            let errHtml = '<ul class="mb-0 ps-3">';
                            $.each(xhr.responseJSON.errors, function (field, msgs) {
                                $.each(msgs, function (_, m) { errHtml += `<li>${m}</li>`; });
                            });
                            errHtml += '</ul>';
                            errorBox.html(errHtml).removeClass('d-none');
                        } else {
                            errorBox.html(xhr.responseJSON?.message || 'Failed to update customer.').removeClass('d-none');
                        }
                    }
                });
            });

            // Delete User Handler with SweetAlert2
            $(document).on('click', '.btn-delete-user', function () {
                const userId = $(this).data('id');
                const userName = $(this).data('name') || 'this customer';
                const deleteUrl = `{{ url('admin/users') }}/${userId}`;

                Swal.fire({
                    title: 'Delete Customer?',
                    text: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d92d20',
                    cancelButtonColor: '#667085',
                    confirmButtonText: 'Yes, Delete',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Deleting customer...',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        $.ajax({
                            url: deleteUrl,
                            type: 'DELETE',
                            headers: { 'Accept': 'application/json' },
                            success: function (res) {
                                Swal.fire({
                                    title: 'Deleted!',
                                    text: res.message || 'Customer deleted successfully.',
                                    icon: 'success',
                                    timer: 1500,
                                    showConfirmButton: false
                                });

                                if (window.LaravelDataTables && window.LaravelDataTables['users-table']) {
                                    window.LaravelDataTables['users-table'].ajax.reload(null, false);
                                }
                            },
                            error: function (xhr) {
                                Swal.fire('Error', xhr.responseJSON?.message || 'Failed to delete customer.', 'error');
                            }
                        });
                    }
                });
            });
        });
    </script>
@endpush
