<footer class="footer bg-white border-top py-3 px-4 mt-auto">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span class="text-secondary" style="font-size: 12.5px;">
            &copy; {{ date('Y') }} <strong class="text-dark">Synto</strong> - Admin & REST API Dashboard. Crafted for Competition.
        </span>
        <div class="d-flex align-items-center gap-3">
            <span class="badge bg-light text-secondary border px-2 py-1" style="font-size: 11px;">Laravel v{{ app()->version() }}</span>
            <span class="badge bg-light text-secondary border px-2 py-1" style="font-size: 11px;">PHP v{{ PHP_VERSION }}</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style="font-size: 11px;">Yajra DataTables</span>
        </div>
    </div>
</footer>
