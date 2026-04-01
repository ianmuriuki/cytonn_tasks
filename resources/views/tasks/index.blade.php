@extends('layouts.app')

@section('content')

<!-- Stats bar -->
<section class="stats-bar" id="stats-bar">
    <div class="stat-card" id="stat-total">
        <span class="stat-value">0</span>
        <span class="stat-label">Total</span>
    </div>
    <div class="stat-card" id="stat-pending">
        <span class="stat-value">0</span>
        <span class="stat-label">Pending</span>
    </div>
    <div class="stat-card" id="stat-in-progress">
        <span class="stat-value">0</span>
        <span class="stat-label">In Progress</span>
    </div>
    <div class="stat-card" id="stat-done">
        <span class="stat-value">0</span>
        <span class="stat-label">Done</span>
    </div>
</section>

<!-- Controls row -->
<section class="controls-row">
    <div class="filter-group">
        <select id="filter-status" class="filter-select mono-text">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
        </select>
        <select id="filter-priority" class="filter-select mono-text">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        </select>
        <button id="btn-report" class="btn btn-outline mono-text">◎ Daily Report</button>
    </div>
    <button id="btn-new-task" class="btn btn-primary">+ New Task</button>
</section>

<!-- Task table -->
<section class="task-section">
    <div class="table-wrapper">
        <table class="task-table" id="task-table">
            <thead>
                <tr>
                    <th class="mono-text">#</th>
                    <th>Title</th>
                    <th class="mono-text">Due Date</th>
                    <th class="mono-text">Priority</th>
                    <th class="mono-text">Status</th>
                    <th class="mono-text">Actions</th>
                </tr>
            </thead>
            <tbody id="task-tbody">
                <tr id="empty-row">
                    <td colspan="6" class="empty-state">
                        <span class="empty-icon">◫</span>
                        <span>No tasks yet. Create your first task.</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</section>

<!-- Create / Edit Task Modal -->
<div id="task-modal" class="modal-overlay" aria-hidden="true">
    <div class="modal-box" role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
            <h2 class="modal-title" id="modal-title">New Task</h2>
            <button class="modal-close" id="modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label mono-text" for="task-title">Title</label>
                <input type="text" id="task-title" class="form-input" placeholder="Enter task title" maxlength="255" />
                <span class="field-error" id="err-title"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label mono-text" for="task-due-date">Due Date</label>
                    <input type="date" id="task-due-date" class="form-input mono-text" />
                    <span class="field-error" id="err-due-date"></span>
                </div>
                <div class="form-group">
                    <label class="form-label mono-text" for="task-priority">Priority</label>
                    <select id="task-priority" class="form-input mono-text">
                        <option value="">Select priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <span class="field-error" id="err-priority"></span>
                </div>
            </div>
            <div class="form-group" id="status-group" style="display:none;">
                <label class="form-label mono-text" for="task-status">Status</label>
                <select id="task-status" class="form-input mono-text">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>
            <span class="field-error" id="err-general"></span>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-submit">Create Task</button>
        </div>
    </div>
</div>

<!-- Daily Report Modal -->
<div id="report-modal" class="modal-overlay" aria-hidden="true">
    <div class="modal-box modal-box--wide" role="dialog" aria-labelledby="report-title">
        <div class="modal-header">
            <h2 class="modal-title" id="report-title">Daily Report</h2>
            <button class="modal-close" id="report-modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body" id="report-body">
            <p class="mono-text">Loading...</p>
        </div>
    </div>
</div>

@endsection