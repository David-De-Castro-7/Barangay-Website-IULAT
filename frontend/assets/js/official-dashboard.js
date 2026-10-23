(function () {
    'use strict';

    // Change this if your login page has a different file name.
    var LOGIN_PAGE = 'login.html';
    var STORE_KEY = 'iulat_official_data';

    var VIEWS = {
        dashboard:     { title: 'Dashboard',          crumb: 'Overview' },
        announcements: { title: 'Announcements',      crumb: 'Announcements' },
        residents:     { title: 'Residents',          crumb: 'Residents' },
        reports:       { title: 'Incident Reports',   crumb: 'Incident Reports' },
        services:      { title: 'Services & Payouts', crumb: 'Services & Payouts' },
        settings:      { title: 'Settings',           crumb: 'Settings' }
    };

    /* ---------- helpers ---------- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function slug(value) { return String(value).toLowerCase().replace(/\s+/g, '-'); }

    function today() {
        return new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function emptyState(text) { return '<p class="empty">' + esc(text) + '</p>'; }

    /* ---------- data ---------- */
    function defaults() {
        return {
            announcements: [],
            residents: [],
            reports: [],
            services: [],
            profile: { name: 'Barangay Official', role: 'Official account' }
        };
    }

    function load() {
        var base = defaults();
        try {
            var saved = JSON.parse(localStorage.getItem(STORE_KEY));
            if (saved) {
                Object.keys(base).forEach(function (k) { if (saved[k]) base[k] = saved[k]; });
            }
        } catch (e) { /* storage unavailable or corrupted: use defaults */ }
        return base;
    }

    var data = load();

    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
    }

    /* ---------- tabs ---------- */
    function showView(name) {
        if (!VIEWS[name]) { name = 'dashboard'; }

        $all('.view').forEach(function (v) {
            var active = v.id === 'view-' + name;
            v.hidden = !active;
            v.classList.toggle('active', active);
        });

        $all('.official-nav-link[data-view]').forEach(function (link) {
            var active = link.getAttribute('data-view') === name;
            link.classList.toggle('active', active);
            if (active) { link.setAttribute('aria-current', 'page'); }
            else { link.removeAttribute('aria-current'); }
        });

        $('#pageTitle').textContent = VIEWS[name].title;
        $('#crumb').textContent = VIEWS[name].crumb;
        document.title = VIEWS[name].title + ' | iUlat';

        closeSidebar();
        window.scrollTo(0, 0);
    }

    function currentViewFromHash() {
        return (location.hash || '#dashboard').replace('#', '');
    }

    /* ---------- renderers ---------- */
    function renderStats() {
        var open = data.reports.filter(function (r) { return r.status !== 'Resolved'; }).length;
        $('#statAnnouncements').textContent = data.announcements.length;
        $('#statResidents').textContent = data.residents.length;
        $('#statReports').textContent = data.reports.length;
        $('#statReportsNote').textContent = open + ' still open';
        $('#statServices').textContent = data.services.length;
    }

    function renderRecent() {
        var ann = data.announcements.slice(0, 3);
        $('#recentAnnouncements').innerHTML = ann.length
            ? ann.map(function (a) {
                return '<div class="mini-row"><strong>' + esc(a.title) + '</strong>' +
                       '<small>' + esc(a.category) + ' · ' + esc(a.date) + '</small></div>';
            }).join('')
            : emptyState('No announcements yet. Publish one from the Announcements tab.');

        var rep = data.reports.slice(0, 3);
        $('#recentReports').innerHTML = rep.length
            ? rep.map(function (r) {
                return '<div class="mini-row"><strong>' + esc(r.title) + '</strong>' +
                       '<small>' + esc(r.status) + ' · ' + esc(r.location) + '</small></div>';
            }).join('')
            : emptyState('No incident reports yet. Log one from the Incident Reports tab.');
    }

    function deleteButton(col, id) {
        return '<button type="button" class="btn btn-ghost" data-delete="' + col + '" data-id="' + id + '">Delete</button>';
    }

    function renderAnnouncements() {
        $('#announcementList').innerHTML = data.announcements.length
            ? data.announcements.map(function (a) {
                return '<article class="item">' +
                    '<div class="item-head"><span class="badge badge-' + slug(a.category) + '">' + esc(a.category) + '</span>' +
                    '<small>' + esc(a.date) + '</small></div>' +
                    '<h4>' + esc(a.title) + '</h4><p>' + esc(a.message) + '</p>' +
                    deleteButton('announcements', a.id) + '</article>';
            }).join('')
            : emptyState('No announcements yet. Use the form to publish your first notice.');
    }

    function renderResidents() {
        var q = $('#residentSearch').value.trim().toLowerCase();
        var list = data.residents.filter(function (r) {
            return !q || (r.name + ' ' + r.address).toLowerCase().indexOf(q) !== -1;
        });

        $('#residentRows').innerHTML = list.length
            ? list.map(function (r) {
                return '<tr><td data-label="Name">' + esc(r.name) + '</td>' +
                    '<td data-label="Address">' + esc(r.address) + '</td>' +
                    '<td data-label="Contact">' + esc(r.contact) + '</td>' +
                    '<td class="cell-action">' + deleteButton('residents', r.id) + '</td></tr>';
            }).join('')
            : '<tr><td colspan="4">' + emptyState(q ? 'No residents match your search.' : 'No residents yet. Add one using the form.') + '</td></tr>';
    }

    function renderReports() {
        var filter = $('#reportFilter').value;
        var list = data.reports.filter(function (r) { return !filter || r.status === filter; });

        $('#reportRows').innerHTML = list.length
            ? list.map(function (r) {
                var options = ['Pending', 'In progress', 'Resolved'].map(function (s) {
                    return '<option' + (r.status === s ? ' selected' : '') + '>' + s + '</option>';
                }).join('');
                return '<tr><td data-label="Report"><strong>' + esc(r.title) + '</strong>' +
                    '<small class="sub">' + esc(r.location) + ' · ' + esc(r.date) + '</small>' +
                    (r.details ? '<small class="sub">' + esc(r.details) + '</small>' : '') + '</td>' +
                    '<td data-label="Urgency"><span class="badge badge-' + slug(r.urgency) + '">' + esc(r.urgency) + '</span></td>' +
                    '<td data-label="Status"><select class="status-select" data-status="' + r.id + '" aria-label="Status for ' + esc(r.title) + '">' + options + '</select></td>' +
                    '<td class="cell-action">' + deleteButton('reports', r.id) + '</td></tr>';
            }).join('')
            : '<tr><td colspan="4">' + emptyState(filter ? 'No reports with this status.' : 'No incident reports yet. Log one using the form.') + '</td></tr>';
    }

    function renderServices() {
        $('#serviceList').innerHTML = data.services.length
            ? data.services.map(function (s) {
                return '<article class="item">' +
                    '<div class="item-head"><span class="badge badge-' + slug(s.type) + '">' + esc(s.type) + '</span>' +
                    '<small>' + esc(s.schedule) + '</small></div>' +
                    '<h4>' + esc(s.title) + '</h4>' +
                    (s.details ? '<p>' + esc(s.details) + '</p>' : '') +
                    deleteButton('services', s.id) + '</article>';
            }).join('')
            : emptyState('No services or payouts yet. Use the form to list one.');
    }

    function renderProfile() {
        var name = data.profile.name;
        var initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('') || 'BO';
        $('#userName').textContent = name;
        $('#userRole').textContent = data.profile.role;
        $('#userAvatar').textContent = initials;
        $('#setName').value = name;
        $('#setRole').value = data.profile.role;
    }

    function renderAll() {
        renderStats();
        renderRecent();
        renderAnnouncements();
        renderResidents();
        renderReports();
        renderServices();
        renderProfile();
    }

    /* ---------- forms ---------- */
    $all('form[data-form]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            var col = form.getAttribute('data-form');
            var record = { id: Date.now() + Math.floor(Math.random() * 1000), date: today() };

            new FormData(form).forEach(function (value, key) { record[key] = String(value).trim(); });
            if (col === 'reports') { record.status = 'Pending'; }

            data[col].unshift(record);
            save();
            form.reset();
            renderAll();
        });
    });

    $('#profileForm').addEventListener('submit', function (e) {
        e.preventDefault();
        data.profile.name = $('#setName').value.trim() || 'Barangay Official';
        data.profile.role = $('#setRole').value.trim() || 'Official account';
        save();
        renderProfile();
        $('#profileNote').textContent = 'Profile saved.';
        setTimeout(function () { $('#profileNote').textContent = ''; }, 2500);
    });

    /* ---------- delete / status / filters ---------- */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-delete]');
        if (!btn) { return; }

        if (!confirm('Delete this record? This cannot be undone.')) { return; }

        var col = btn.getAttribute('data-delete');
        var id = Number(btn.getAttribute('data-id'));
        data[col] = data[col].filter(function (item) { return item.id !== id; });
        save();
        renderAll();
    });

    document.addEventListener('change', function (e) {
        var sel = e.target.closest('[data-status]');
        if (!sel) { return; }

        var id = Number(sel.getAttribute('data-status'));
        data.reports.forEach(function (r) { if (r.id === id) { r.status = sel.value; } });
        save();
        renderStats();
        renderRecent();
        renderReports();
    });

    $('#residentSearch').addEventListener('input', renderResidents);
    $('#reportFilter').addEventListener('change', renderReports);

    $('#clearData').addEventListener('click', function () {
        if (!confirm('Clear all announcements, residents, reports, and services?')) { return; }
        var profile = data.profile;
        data = defaults();
        data.profile = profile;
        save();
        renderAll();
    });

    /* ---------- sidebar (mobile) ---------- */
    var sidebar = $('#officialSidebar');
    var overlay = $('#sidebarOverlay');
    var toggle = $('#sidebarToggle');

    function openSidebar() {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-visible');
        document.body.classList.add('official-sidebar-open');
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        document.body.classList.remove('official-sidebar-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
        if (sidebar.classList.contains('is-open')) { closeSidebar(); } else { openSidebar(); }
    });
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSidebar(); } });

    /* ---------- sign out ---------- */
    $('#signOutButton').addEventListener('click', function () {
        if (confirm('Sign out of the official portal?')) {
            window.location.href = LOGIN_PAGE;
        }
    });

    /* ---------- start ---------- */
    window.addEventListener('hashchange', function () { showView(currentViewFromHash()); });
    renderAll();
    showView(currentViewFromHash());
})();