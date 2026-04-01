# Task Management System

A web-based Task Management application built with Laravel 11, MySQL, and Vanilla JS. Allows users to create, track, update, and delete tasks with priority levels and status tracking. Includes a bonus daily report endpoint.


## Features

- Create tasks with a title, due date, and priority level
- View all tasks in a clean table with filters by status and priority
- Update a task's status as work progresses
- Delete tasks that are no longer needed
- Daily report showing all tasks due today grouped by status and priority
- Duplicate title prevention — same title cannot be used twice on the same due date


## Tech Stack

| Layer    | Choice              |
|----------|---------------------|
| Backend  | Laravel 11 (PHP)    |
| Database | MySQL               |
| Frontend | Blade + Vanilla JS  |
| Styling  | Custom CSS          |


## Setup

```bash
# 1. Install dependencies
composer install

# 2. Copy and configure environment
cp .env.example .env
php artisan key:generate

# 3. Set your database credentials in .env
DB_DATABASE=cytonn_tasks
DB_USERNAME=your_user
DB_PASSWORD=your_password

# 4. Run migrations
php artisan migrate

# 5. Start the server
php artisan serve
```

Visit `http://localhost:8000`


## API Endpoints

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | /api/tasks          | List all tasks               |
| POST   | /api/tasks          | Create a task                |
| PATCH  | /api/tasks/{id}     | Update a task                |
| DELETE | /api/tasks/{id}     | Delete a task                |
| GET    | /api/tasks/report   | Daily report for today       |

### Filters
```
GET /api/tasks?status=pending
GET /api/tasks?priority=high
```

### Create Task — Example
```json
POST /api/tasks
{
    "title": "Review investment proposals",
    "due_date": "2026-04-01",
    "priority": "high"
}
```

### Priority values: `low` `medium` `high`
### Status values: `pending` `in_progress` `done`


## Database

MySQL — dump file included as `cytonn_tasks.sql`

To import:
```bash
mysql -u root -p cytonn_tasks < cytonn_tasks.sql
```