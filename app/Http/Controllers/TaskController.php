<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     * List all tasks, optional ?status= and ?priority= filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::query()->orderBy('due_date', 'asc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $tasks,
            'count'   => $tasks->count(),
        ]);
    }

    /**
     * POST /api/tasks
     * Create a new task.
     * Rule: title cannot duplicate on the same due_date.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'    => [
                'required',
                'string',
                'max:255',
                Rule::unique('tasks')->where(function ($query) use ($request) {
                    return $query->whereDate('due_date', $request->due_date);
                }),
            ],
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status'   => 'sometimes|in:pending,in_progress,done',
        ], [
            'title.unique' => 'A task with this title already exists on the selected due date.',
        ]);

        $task = Task::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
            'data'    => $task,
        ], 201);
    }

    /**
     * GET /api/tasks/{id}
     * Show a single task.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $task,
        ]);
    }

    /**
     * PATCH /api/tasks/{id}
     * Update task status (and optionally other fields).
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title'    => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('tasks')->where(function ($query) use ($request, $task) {
                    return $query->whereDate('due_date', $request->due_date ?? $task->due_date);
                })->ignore($task->id),
            ],
            'due_date' => 'sometimes|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status'   => 'sometimes|in:pending,in_progress,done',
        ]);

        $task->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data'    => $task->fresh(),
        ]);
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully.',
        ]);
    }

    /**
     * GET /api/tasks/report
     * BONUS: Daily report — tasks due today grouped by status.
     */
    public function report(): JsonResponse
    {
        $today = today()->toDateString();

        $tasks = Task::whereDate('due_date', $today)->get();

        $grouped = $tasks->groupBy('status')->map(fn($group) => $group->values());

        $summary = [
            'date'       => $today,
            'total'      => $tasks->count(),
            'pending'    => $tasks->where('status', 'pending')->count(),
            'in_progress'=> $tasks->where('status', 'in_progress')->count(),
            'done'       => $tasks->where('status', 'done')->count(),
            'by_priority' => [
                'high'   => $tasks->where('priority', 'high')->count(),
                'medium' => $tasks->where('priority', 'medium')->count(),
                'low'    => $tasks->where('priority', 'low')->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'report'  => $summary,
            'tasks'   => $grouped,
        ]);
    }
}