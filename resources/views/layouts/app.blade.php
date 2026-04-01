<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>Cytonn Tasks</title>

    <!-- Fonts: Playfair Display (headings) + IBM Plex Mono (data) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="{{ asset('css/app.css') }}" />
</head>
<body>

    <div class="app-shell">

        <header class="app-header">
            <div class="header-inner">
                <div class="brand">
                    <span class="brand-mark">◈</span>
                    <span class="brand-name">Cytonn Tasks</span>
                </div>
                <div class="header-meta">
                    <span id="live-clock" class="mono-text"></span>
                    <span class="date-badge mono-text" id="today-date"></span>
                </div>
            </div>
        </header>

        <main class="main-content">
            @yield('content')
        </main>

        <footer class="app-footer">
            <span class="mono-text">Task Management System &mdash; Cytonn Investments</span>
        </footer>

    </div>

    <!-- Global notification toast -->
    <div id="toast" class="toast" aria-live="polite"></div>

    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>