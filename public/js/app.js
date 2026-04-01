/**
 * Cytonn Tasks — Vanilla JS Frontend
 * Pure JS, no frameworks, no dependencies.
 */

(function () {
    'use strict';

    // ---- Config ----
    const API_BASE = '/api/tasks';
    const CSRF    = document.querySelector('meta[name="csrf-token"]')?.content || '';

    // ---- State ----
    let tasks       = [];
    let editingId   = null;

    // ---- DOM refs ----
    const tbody      = document.getElementById('task-tbody');
    const emptyRow   = document.getElementById('empty-row');
    const filterStatus   = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');

    // Stats
    const statTotal    = document.querySelector('#stat-total .stat-value');
    const statPending  = document.querySelector('#stat-pending .stat-value');
    const statInProg   = document.querySelector('#stat-in-progress .stat-value');
    const statDone     = document.querySelector('#stat-done .stat-value');

    // Modal — task form
    const taskModal   = document.getElementById('task-modal');
    const modalTitle  = document.getElementById('modal-title');
    const modalSubmit = document.getElementById('modal-submit');
    const titleInput  = document.getElementById('task-title');
    const dueDateInput= document.getElementById('task-due-date');
    const priorityInput= document.getElementById('task-priority');
    const statusInput  = document.getElementById('task-status');
    const statusGroup  = document.getElementById('status-group');

    // Modal — report
    const reportModal  = document.getElementById('report-modal');
    const reportBody   = document.getElementById('report-body');

    // Toast
    const toastEl = document.getElementById('toast');
    let toastTimer;

    // ---- Clock & Date ----
    function updateClock() {
        const now   = new Date();
        const clock = document.getElementById('live-clock');
        const dateEl= document.getElementById('today-date');
        if (clock) {
            clock.textContent = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateEl && !dateEl.dataset.set) {
            dateEl.textContent = now.toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            dateEl.dataset.set = 'true';
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ---- API helpers ----
    async function apiFetch(url, options = {}) {
        const defaults = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': CSRF,
                'Accept':       'application/json',
            },
        };
        const res = await fetch(url, Object.assign(defaults, options));
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    }

    // ---- Load tasks ----
    async function loadTasks() {
        let url = API_BASE;
        const params = new URLSearchParams();
        if (filterStatus.value)   params.set('status',   filterStatus.value);
        if (filterPriority.value) params.set('priority', filterPriority.value);
        if ([...params].length) url += '?' + params.toString();

        const { ok, data } = await apiFetch(url);
        if (!ok) { showToast('Failed to load tasks.', 'error'); return; }

        tasks = data.data || [];
        renderTasks();
        updateStats();
    }

    // ---- Render ----
    function renderTasks() {
        // Remove all non-empty rows
        Array.from(tbody.querySelectorAll('tr:not(#empty-row)')).forEach(r => r.remove());

        if (tasks.length === 0) {
            emptyRow.style.display = '';
            return;
        }

        emptyRow.style.display = 'none';

        tasks.forEach((task, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = task.id;

            tr.innerHTML = `
                <td class="mono-text">${String(index + 1).padStart(2, '0')}</td>
                <td class="task-title-cell">${escHtml(task.title)}</td>
                <td class="task-date mono-text">${formatDate(task.due_date)}</td>
                <td>${priorityBadge(task.priority)}</td>
                <td>${statusBadge(task.status)}</td>
                <td>
                    <div class="action-group">
                        <button class="btn btn-edit" data-action="edit" data-id="${task.id}" title="Edit task">✎</button>
                        <button class="btn btn-danger" data-action="delete" data-id="${task.id}" title="Delete task">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function priorityBadge(priority) {
        const labels = { low: 'Low', medium: 'Med', high: 'High' };
        return `<span class="badge badge-${priority}">${labels[priority] || priority}</span>`;
    }

    function statusBadge(status) {
        const labels = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };
        return `<span class="status-badge status-badge--${status}"><span class="status-dot"></span>${labels[status] || status}</span>`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const clean = String(dateStr).substring(0, 10);
        const parts = clean.split('-');
        if (parts.length !== 3) return clean;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return parts[2] + ' ' + (months[parseInt(parts[1], 10) - 1] || '') + ' ' + parts[0];
    }

    function escHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ---- Stats ----
    function updateStats() {
        // When filtered, still fetch full stats from raw tasks data
        // Re-fetch all for accurate counts
        apiFetch(API_BASE).then(({ data }) => {
            const all = data.data || [];
            statTotal.textContent   = all.length;
            statPending.textContent = all.filter(t => t.status === 'pending').length;
            statInProg.textContent  = all.filter(t => t.status === 'in_progress').length;
            statDone.textContent    = all.filter(t => t.status === 'done').length;
        });
    }

    // ---- Modal helpers ----
    function openModal() {
        taskModal.classList.add('is-open');
        taskModal.setAttribute('aria-hidden', 'false');
        titleInput.focus();
    }

    function closeModal() {
        taskModal.classList.remove('is-open');
        taskModal.setAttribute('aria-hidden', 'true');
        resetForm();
    }

    function resetForm() {
        editingId = null;
        titleInput.value    = '';
        dueDateInput.value  = '';
        priorityInput.value = '';
        statusInput.value   = 'pending';
        statusGroup.style.display = 'none';
        modalTitle.textContent  = 'New Task';
        modalSubmit.textContent = 'Create Task';
        clearErrors();
    }

    function clearErrors() {
        ['err-title', 'err-due-date', 'err-priority', 'err-general'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
        [titleInput, dueDateInput, priorityInput].forEach(el => el.classList.remove('is-error'));
    }

    function showErrors(errors) {
        clearErrors();
        const map = { title: ['err-title', titleInput], due_date: ['err-due-date', dueDateInput], priority: ['err-priority', priorityInput] };
        let hasField = false;
        Object.entries(errors).forEach(([field, msgs]) => {
            if (map[field]) {
                const [errId, inputEl] = map[field];
                document.getElementById(errId).textContent = msgs[0];
                inputEl.classList.add('is-error');
                hasField = true;
            }
        });
        if (!hasField) {
            document.getElementById('err-general').textContent = 'Something went wrong. Please try again.';
        }
    }

    // ---- Create / Update task ----
    async function submitTask() {
        clearErrors();
        const payload = {
            title:    titleInput.value.trim(),
            due_date: dueDateInput.value,
            priority: priorityInput.value,
        };
        if (editingId) {
            payload.status = statusInput.value;
        }

        if (!payload.title)    { document.getElementById('err-title').textContent = 'Title is required.'; titleInput.classList.add('is-error'); return; }
        if (!payload.due_date) { document.getElementById('err-due-date').textContent = 'Due date is required.'; dueDateInput.classList.add('is-error'); return; }
        if (!payload.priority) { document.getElementById('err-priority').textContent = 'Priority is required.'; priorityInput.classList.add('is-error'); return; }

        const url     = editingId ? `${API_BASE}/${editingId}` : API_BASE;
        const method  = editingId ? 'PATCH' : 'POST';
        modalSubmit.disabled = true;
        modalSubmit.textContent = editingId ? 'Saving...' : 'Creating...';

        const { ok, data } = await apiFetch(url, { method, body: JSON.stringify(payload) });

        modalSubmit.disabled = false;
        modalSubmit.textContent = editingId ? 'Save Changes' : 'Create Task';

        if (ok) {
            closeModal();
            await loadTasks();
            showToast(editingId ? 'Task updated.' : 'Task created.', 'success');
        } else if (data.errors) {
            showErrors(data.errors);
        } else {
            document.getElementById('err-general').textContent = data.message || 'An error occurred.';
        }
    }

    // ---- Delete task ----
    async function deleteTask(id) {
        if (!confirm('Delete this task? This cannot be undone.')) return;
        const { ok } = await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (ok) {
            await loadTasks();
            showToast('Task deleted.', 'success');
        } else {
            showToast('Failed to delete task.', 'error');
        }
    }

    // ---- Edit task (pre-fill form) ----
    function openEditModal(id) {
        const task = tasks.find(t => t.id == id);
        if (!task) return;
        editingId              = id;
        titleInput.value       = task.title;
        dueDateInput.value     = task.due_date ? task.due_date.substring(0, 10) : '';
        priorityInput.value    = task.priority;
        statusInput.value      = task.status;
        statusGroup.style.display = '';
        modalTitle.textContent  = 'Edit Task';
        modalSubmit.textContent = 'Save Changes';
        openModal();
    }

    // ---- Daily report ----
    async function openReport() {
        reportBody.innerHTML = '<p class="mono-text" style="color:var(--text-muted)">Fetching report...</p>';
        reportModal.classList.add('is-open');
        reportModal.setAttribute('aria-hidden', 'false');

        const { ok, data } = await apiFetch(`${API_BASE}/report`);
        if (!ok) { reportBody.innerHTML = '<p style="color:var(--red)">Failed to load report.</p>'; return; }

        const r = data.report;
        reportBody.innerHTML = `
            <p class="report-date mono-text">Report for: ${r.date}</p>
            <div class="report-summary">
                <div class="report-stat">
                    <span class="report-stat-value">${r.total}</span>
                    <span class="report-stat-label">Total Today</span>
                </div>
                <div class="report-stat">
                    <span class="report-stat-value">${r.in_progress}</span>
                    <span class="report-stat-label">In Progress</span>
                </div>
                <div class="report-stat">
                    <span class="report-stat-value">${r.done}</span>
                    <span class="report-stat-label">Completed</span>
                </div>
            </div>
            <div class="report-priority-row">
                <div class="report-priority-item"><strong>${r.by_priority.high}</strong>High Priority</div>
                <div class="report-priority-item"><strong>${r.by_priority.medium}</strong>Medium Priority</div>
                <div class="report-priority-item"><strong>${r.by_priority.low}</strong>Low Priority</div>
            </div>
            ${r.total === 0 ? '<p style="margin-top:16px;font-size:0.78rem;color:var(--text-muted)">No tasks are due today.</p>' : ''}
        `;
    }

    // ---- Toast ----
    function showToast(message, type = 'info') {
        clearTimeout(toastTimer);
        toastEl.textContent = message;
        toastEl.className = `toast toast--${type} show`;
        toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, 3200);
    }

    // ---- Event listeners ----
    document.getElementById('btn-new-task').addEventListener('click', () => {
        resetForm();
        openModal();
    });

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    modalSubmit.addEventListener('click', submitTask);

    // Close modal on overlay click
    taskModal.addEventListener('click', e => { if (e.target === taskModal) closeModal(); });

    // Report modal
    document.getElementById('btn-report').addEventListener('click', openReport);
    document.getElementById('report-modal-close').addEventListener('click', () => {
        reportModal.classList.remove('is-open');
        reportModal.setAttribute('aria-hidden', 'true');
    });
    reportModal.addEventListener('click', e => {
        if (e.target === reportModal) {
            reportModal.classList.remove('is-open');
            reportModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Table action delegation
    tbody.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'edit')   openEditModal(id);
        if (action === 'delete') deleteTask(id);
    });

    // Filter changes
    filterStatus.addEventListener('change', loadTasks);
    filterPriority.addEventListener('change', loadTasks);

    // Keyboard: Escape closes modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            reportModal.classList.remove('is-open');
            reportModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Enter submits form
    [titleInput, dueDateInput, priorityInput].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') submitTask(); });
    });

    // ---- Init ----
    loadTasks();

})();