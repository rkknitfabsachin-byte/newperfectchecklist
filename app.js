const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

const tasksView = document.getElementById("tasksView");
const spaceView = document.getElementById("spaceView");
const dateLabel = document.getElementById("dateLabel");

let currentDate = new Date();
let view = "tasks";

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  bindUI();
  renderDate();
  loadTasks();
});

/* UI */
function bindUI() {
  document.getElementById("tabTasks").onclick = () => switchView("tasks");
  document.getElementById("tabSpace").onclick = () => switchView("space");
  document.getElementById("themeToggle").onclick = toggleTheme;
}

function switchView(v) {
  view = v;
  tasksView.classList.toggle("hidden", v !== "tasks");
  spaceView.classList.toggle("hidden", v !== "space");
  document.getElementById("tabTasks").classList.toggle("active", v === "tasks");
  document.getElementById("tabSpace").classList.toggle("active", v === "space");

  v === "tasks" ? loadTasks() : loadSpace();
}

/* DATE */
function renderDate() {
  dateLabel.innerText = currentDate.toDateString();
}

/* TASKS */
async function loadTasks() {
  tasksView.innerHTML = "";

  const stats = await getStats();
  tasksView.appendChild(stats);

  const res = await fetch(
    `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`
  );
  const data = await res.json();

  if (!data.length) {
    tasksView.innerHTML += `<div class="card">No tasks today 🌱</div>`;
    return;
  }

  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "card task";
    div.innerHTML = `
      <div>${t.task}</div>
      <button>Done</button>
    `;
    div.querySelector("button").onclick = () => markDone(t, div);
    tasksView.appendChild(div);
  });
}

async function markDone(task, el) {
  el.style.opacity = "0.4";

  const form = new URLSearchParams({
    action: "done",
    token,
    source: task.source,
    row: task.row
  });

  await fetch(`${API}/done`, { method: "POST", body: form });
  el.remove();
}

/* STATS */
async function getStats() {
  const form = new URLSearchParams({ action: "getTaskStats", token });
  const res = await fetch(`${API}/myspace`, { method: "POST", body: form });
  const s = await res.json();

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    🔥 Streak: ${s.streak}<br>
    📅 Week: ${s.weekly} &nbsp; 📊 Month: ${s.monthly}
  `;
  return div;
}

/* MY SPACE (UNCHANGED BASIC VIEW) */
async function loadSpace() {
  spaceView.innerHTML = `<div class="card">My Space is safe 🌱</div>`;
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
