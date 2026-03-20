const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware - these run on EVERY request before your route handlers
app.use(helmet());       // Security headers
app.use(cors());         // Allow cross-origin requests
app.use(morgan('combined')); // Request logging
app.use(express.json()); // Parse JSON request bodies

// In-memory storage (we'll swap this for a real DB later)
let tasks = [];
let nextId = 1;

// Home page — Full Task Manager App
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager — Cloud-Native DevOps</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-primary: #0a0e1a;
      --bg-secondary: #111827;
      --bg-card: rgba(17, 24, 39, 0.8);
      --bg-input: rgba(30, 41, 59, 0.6);
      --border: rgba(99, 102, 241, 0.2);
      --border-hover: rgba(99, 102, 241, 0.5);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #22c55e;
      --success-bg: rgba(34, 197, 94, 0.12);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --warning: #f59e0b;
      --radius: 12px;
      --radius-lg: 20px;
      --shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
      background-image:
        radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    }

    .app {
      width: 100%;
      max-width: 680px;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .header h1 {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #818cf8, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.4rem;
      letter-spacing: -0.5px;
    }
    .header p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 400;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 0.8rem;
      padding: 0.35rem 1rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .badge .dot {
      width: 6px; height: 6px;
      background: var(--success);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* ── Stats Bar ── */
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      flex: 1;
      padding: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      text-align: center;
      transition: border-color 0.3s, transform 0.2s;
    }
    .stat-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    .stat-card .number {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-light);
      line-height: 1;
    }
    .stat-card .label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-top: 0.3rem;
    }

    /* ── Add Task Form ── */
    .add-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }
    .form-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .form-row:last-child { margin-bottom: 0; }
    .add-form input, .add-form textarea {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--bg-input);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.3s, box-shadow 0.3s;
      resize: none;
    }
    .add-form input:focus, .add-form textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .add-form input::placeholder, .add-form textarea::placeholder {
      color: var(--text-muted);
    }
    .btn-add {
      padding: 0.75rem 1.8rem;
      border: none;
      border-radius: var(--radius);
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.3s, opacity 0.2s;
      white-space: nowrap;
    }
    .btn-add:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
    }
    .btn-add:active { transform: translateY(0); }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ── Filter Tabs ── */
    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .filter-btn {
      padding: 0.45rem 1rem;
      border: 1px solid var(--border);
      border-radius: 2rem;
      background: transparent;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
    .filter-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    /* ── Task List ── */
    .task-list { display: flex; flex-direction: column; gap: 0.6rem; }

    .task-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.2rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      transition: border-color 0.3s, transform 0.2s, opacity 0.3s;
      animation: slideIn 0.3s ease-out;
    }
    .task-item:hover {
      border-color: var(--border-hover);
      transform: translateX(4px);
    }
    .task-item.completed { opacity: 0.55; }
    .task-item.removing {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOut {
      to { opacity: 0; transform: translateX(40px); height: 0; padding: 0; margin: 0; overflow: hidden; }
    }

    /* Custom checkbox */
    .checkbox {
      width: 22px; height: 22px;
      border: 2px solid var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      transition: all 0.2s;
    }
    .checkbox:hover { border-color: var(--accent-light); }
    .checkbox.checked {
      background: var(--success);
      border-color: var(--success);
    }
    .checkbox.checked::after {
      content: '✓';
      color: white;
      font-size: 13px;
      font-weight: 700;
    }

    .task-content { flex: 1; min-width: 0; }
    .task-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
      word-break: break-word;
    }
    .task-item.completed .task-title {
      text-decoration: line-through;
      color: var(--text-muted);
    }
    .task-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      word-break: break-word;
    }
    .task-meta {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
      opacity: 0.7;
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.2s;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .btn-delete:hover {
      background: var(--danger-bg);
      color: var(--danger);
    }

    /* ── Empty State ── */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }
    .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
    .empty-state p { font-size: 0.95rem; }
    .empty-state .hint { font-size: 0.8rem; margin-top: 0.4rem; opacity: 0.7; }

    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .footer a {
      color: var(--accent-light);
      text-decoration: none;
    }
    .footer a:hover { text-decoration: underline; }

    /* ── Loading spinner ── */
    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 500px) {
      .stats { flex-wrap: wrap; }
      .stat-card { min-width: calc(50% - 0.5rem); }
      .form-row { flex-direction: column; }
      .header h1 { font-size: 1.7rem; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="header">
      <h1>📋 Task Manager</h1>
      <p>Cloud-Native DevOps Capstone Project</p>
      <span class="badge"><span class="dot"></span> Service Running</span>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="number" id="totalCount">0</div>
        <div class="label">Total Tasks</div>
      </div>
      <div class="stat-card">
        <div class="number" id="activeCount">0</div>
        <div class="label">Active</div>
      </div>
      <div class="stat-card">
        <div class="number" id="completedCount">0</div>
        <div class="label">Completed</div>
      </div>
    </div>

    <form class="add-form" id="addForm">
      <div class="form-row">
        <input type="text" id="taskTitle" placeholder="What needs to be done?" required autocomplete="off" />
        <button type="submit" class="btn-add" id="addBtn">Add Task</button>
      </div>
      <div class="form-row">
        <textarea id="taskDesc" placeholder="Description (optional)" rows="1"></textarea>
      </div>
    </form>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </div>

    <div class="task-list" id="taskList"></div>

    <footer class="footer">
      <p>Built with Node.js & Express — Deployed via CI/CD Pipeline</p>
      <p style="margin-top:0.3rem;">
        <a href="/health">/health</a> · <a href="/api/tasks">/api/tasks</a> · <a href="/metrics">/metrics</a>
      </p>
    </footer>
  </div>

  <script>
    const API = '/api/tasks';
    let currentFilter = 'all';
    let allTasks = [];

    // ── Fetch & Render ──
    async function loadTasks() {
      try {
        const res = await fetch(API);
        allTasks = await res.json();
        renderTasks();
        updateStats();
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    }

    function renderTasks() {
      const list = document.getElementById('taskList');
      let filtered = allTasks;
      if (currentFilter === 'active') filtered = allTasks.filter(t => !t.completed);
      if (currentFilter === 'completed') filtered = allTasks.filter(t => t.completed);

      if (filtered.length === 0) {
        const messages = {
          all: ["No tasks yet", "Add your first task above to get started!"],
          active: ["All clear! 🎉", "No active tasks — you\\'re all caught up!"],
          completed: ["Nothing completed yet", "Complete a task to see it here."]
        };
        list.innerHTML =
          '<div class="empty-state">' +
            '<div class="icon">📭</div>' +
            '<p>' + messages[currentFilter][0] + '</p>' +
            '<p class="hint">' + messages[currentFilter][1] + '</p>' +
          '</div>';
        return;
      }

      list.innerHTML = filtered.map(task => {
        const date = new Date(task.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return '<div class="task-item ' + (task.completed ? 'completed' : '') + '" data-id="' + task.id + '">' +
          '<div class="checkbox ' + (task.completed ? 'checked' : '') + '" onclick="toggleTask(' + task.id + ', ' + !task.completed + ')"></div>' +
          '<div class="task-content">' +
            '<div class="task-title">' + escapeHtml(task.title) + '</div>' +
            (task.description ? '<div class="task-desc">' + escapeHtml(task.description) + '</div>' : '') +
            '<div class="task-meta">' + date + '</div>' +
          '</div>' +
          '<button class="btn-delete" onclick="deleteTask(' + task.id + ')" title="Delete task">🗑️</button>' +
        '</div>';
      }).join('');
    }

    function updateStats() {
      const total = allTasks.length;
      const completed = allTasks.filter(t => t.completed).length;
      document.getElementById('totalCount').textContent = total;
      document.getElementById('activeCount').textContent = total - completed;
      document.getElementById('completedCount').textContent = completed;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // ── Add Task ──
    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleEl = document.getElementById('taskTitle');
      const descEl = document.getElementById('taskDesc');
      const btn = document.getElementById('addBtn');
      const title = titleEl.value.trim();
      if (!title) return;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description: descEl.value.trim() })
        });
        titleEl.value = '';
        descEl.value = '';
        titleEl.focus();
        await loadTasks();
      } catch (err) {
        console.error('Failed to add task:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Add Task';
      }
    });

    // ── Toggle Complete ──
    async function toggleTask(id, completed) {
      try {
        await fetch(API + '/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed })
        });
        await loadTasks();
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    }

    // ── Delete Task ──
    async function deleteTask(id) {
      const item = document.querySelector('[data-id="' + id + '"]');
      if (item) item.classList.add('removing');

      setTimeout(async () => {
        try {
          await fetch(API + '/' + id, { method: 'DELETE' });
          await loadTasks();
        } catch (err) {
          console.error('Failed to delete task:', err);
        }
      }, 250);
    }

    // ── Filters ──
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
      });
    });

    // ── Auto-resize textarea ──
    document.getElementById('taskDesc').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // ── Init ──
    loadTasks();
  </script>
</body>
</html>`);
});

// Health check endpoint - critical for Kubernetes later!
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const task = {
    id: nextId++,
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, completed } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;

  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  res.status(204).send();
});

// Metrics endpoint - Prometheus will scrape this later!
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/tasks"} 0
# HELP app_uptime_seconds Application uptime
# TYPE app_uptime_seconds gauge
app_uptime_seconds ${process.uptime()}
  `.trim());
});

module.exports = app;
