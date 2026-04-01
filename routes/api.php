<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// Daily report must be declared before {task} to avoid route model binding conflict
Route::get('/tasks/report', [TaskController::class, 'report']);

Route::apiResource('tasks', TaskController::class);