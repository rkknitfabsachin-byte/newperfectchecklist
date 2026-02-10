const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();
let currentView = "tasks";

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  goToday();
});

/* DATE */
function goToday() {
  currentDate = new Date();
  loadTasks();
}

function moveDate(step) {
  currentDate.setDate(currentDate.getDate() + step);
  loadTasks();
}

/* VIEW */
function switchView(v) {
  currentView = v;
  document.getElementById("tasks").classList.toggle("hidden", v !== "tasks");
  document.getElementById("space").classList.toggle("hidden", v !== "space");
  if (v === "tasks") loadTasks();
}

/* TASKS */
async function loadTasks() {
  const box = document.getElementById("tasks");
  box.innerHTML = "";

  await loadTaskStats();

  const res = await fetch(
    `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`
  );
  const tasks = await res.json();

  if (!tasks.length) {
    box.innerHTML += `<div class="empty">Aaj koi task nahi 😌</div>`;
    return;
  }

  tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "task-chip " + t.source;
    div.innerHTML = `
      <div>${t.task}</div>
      <button onclick="markDone('${t.source}',${t.row},this)">✓</button>
    `;
    box.appendChild(div);
  });
}

async function markDone(source, row, btn) {
  const form = new URLSearchParams();
  form.append("action", "done");
  form.append("token", token);
  form.append("source", source);
  form.append("row", row);

  await fetch(`${API}/done`, { method: "POST", body: form });
  btn.parentElement.remove();
}

/* STATS CARD */
async function loadTaskStats() {
  const form = new URLSearchParams();
  form.append("action", "getTaskStats");
  form.append("token", token);

  const res = await fetch(`${API}/myspace`, {
    method: "POST",
    body: form
  });

  const s = await res.json();
  document.getElementById("tasks").innerHTML = `
    <div class="task-chip">
      🔥 Streak: ${s.streak} |
      📅 Week: ${s.weekly} |
      📊 Month: ${s.monthly}
    </div>
  `;
}
