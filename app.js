const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const qs = new URLSearchParams(location.search);
const token = qs.get("token");
const isAdmin = qs.get("admin") === "true";

const tasksView = document.getElementById("tasksView");
const spaceView = document.getElementById("spaceView");
const kpiRow = document.getElementById("kpiRow");
const dateLabel = document.getElementById("dateLabel");

let currentDate = new Date();

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  bindUI();
  dateLabel.textContent = currentDate.toDateString();

  if (isAdmin) {
    loadAdmin();
  } else {
    loadTasks();
  }
});

/* UI */
function bindUI() {
  tabTasks.onclick = () => switchView("tasks");
  tabSpace.onclick = () => switchView("space");
  themeToggle.onclick = toggleTheme;

  if (isAdmin) {
    tabSpace.style.display = "none";
  }
}

function switchView(v) {
  tasksView.classList.toggle("hidden", v !== "tasks");
  spaceView.classList.toggle("hidden", v !== "space");
  kpiRow.classList.toggle("hidden", v !== "tasks");

  tabTasks.classList.toggle("active", v === "tasks");
  tabSpace.classList.toggle("active", v === "space");

  v === "tasks" ? loadTasks() : loadSpace();
}

/* ================= DOER TASKS ================= */

async function loadTasks() {
  tasksView.innerHTML = "";
  kpiRow.innerHTML = "";

  await loadKPIs();

  const res = await fetch(
    `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`
  );
  const tasks = await res.json();

  if (!tasks.length) {
    tasksView.innerHTML = `<div class="card">No tasks today 🌱</div>`;
    return;
  }

  tasks.forEach(t => {
    const card = document.createElement("div");
    card.className = `card ${t.source}`;
    card.innerHTML = `
      <div>${t.task}</div>
      <button>Done</button>
    `;
    card.querySelector("button").onclick = () => markDone(t, card);
    tasksView.appendChild(card);
  });
}

async function markDone(task, card) {
  const form = new URLSearchParams({
    action: "done",
    token,
    source: task.source,
    row: task.row
  });

  await fetch(`${API}/done`, { method: "POST", body: form });
  card.remove();
}

/* KPI */
async function loadKPIs() {
  const form = new URLSearchParams({ action: "getTaskStats", token });
  const res = await fetch(`${API}/myspace`, { method: "POST", body: form });
  const s = await res.json();

  kpiRow.innerHTML = `
    <div class="kpi"><div class="label">Streak</div><div class="value">${s.streak}</div></div>
    <div class="kpi"><div class="label">This Week</div><div class="value">${s.weekly}</div></div>
    <div class="kpi"><div class="label">This Month</div><div class="value">${s.monthly}</div></div>
  `;
}

/* ================= ADMIN ================= */

async function loadAdmin() {
  tabTasks.classList.add("active");
  tasksView.innerHTML = "";
  kpiRow.innerHTML = "";

  const form = new URLSearchParams({
    action: "getAdminSummary",
    token
  });

  const res = await fetch(`${API}/myspace`, {
    method: "POST",
    body: form
  });

  const a = await res.json();

  kpiRow.innerHTML = `
    <div class="kpi"><div class="label">Active Users</div><div class="value">${a.users}</div></div>
    <div class="kpi"><div class="label">Done Today</div><div class="value">${a.doneToday}</div></div>
    <div class="kpi"><div class="label">Avg Streak</div><div class="value">${a.avgStreak}</div></div>
  `;

  tasksView.innerHTML = `
    <div class="card">
      Admin dashboard ready ✅<br><br>
      Next: user-wise performance
    </div>
  `;
}

/* ================= MY SPACE ================= */

async function loadSpace() {
  spaceView.innerHTML = `<div class="card">My Space 🌱</div>`;
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("rkTheme", document.body.classList.contains("light"));
}

function restoreTheme() {
  if (localStorage.getItem("rkTheme") === "true") {
    document.body.classList.add("light");
  }
}
