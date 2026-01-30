const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();
let currentView = "tasks";

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    showMessage("Access link invalid ❌");
    return;
  }
  loadTasks();
});

/* ================= DATE NAV ================= */

function moveDate(step) {
  currentDate.setDate(currentDate.getDate() + step);
  if (currentView === "tasks") loadTasks();
}

function goToday() {
  currentDate = new Date();
  if (currentView === "tasks") loadTasks();
}

/* ================= VIEW SWITCH ================= */

function switchView(view) {
  currentView = view;

  const tasksEl = document.getElementById("tasks");
  const spaceEl = document.getElementById("space");

  if (view === "tasks") {
    tasksEl.classList.remove("hidden");
    spaceEl.classList.add("hidden");
    loadTasks();
  } else {
    tasksEl.classList.add("hidden");
    spaceEl.classList.remove("hidden");
    loadSpace();
  }
}

/* ================= LOAD TASKS ================= */

async function loadTasks() {
  const container = document.getElementById("tasks");
  const dateLabel = document.getElementById("dateLabel");

  container.innerHTML = "";
  dateLabel.innerText = currentDate.toDateString();

  const url = `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON:", text);
      showMessage("Server error ❌");
      return;
    }

    if (!Array.isArray(data)) {
      console.error("API error:", data);
      showMessage(data.error || "No tasks");
      return;
    }

    renderTasks(data);

  } catch (err) {
    console.error("Fetch failed:", err);
    showMessage("Network error ❌");
  }
}

/* ================= RENDER TASKS ================= */

function renderTasks(list) {
  const container = document.getElementById("tasks");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        Aaj ka kaam complete 🎉<br>
        Thoda relax kar lo 😌
      </div>
    `;
    return;
  }

  const frag = document.createDocumentFragment();

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "chip";
    div.innerHTML = `
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
    `;
    frag.appendChild(div);
  });

  container.appendChild(frag);
}

/* ================= MY SPACE (SAFE PLACEHOLDER) ================= */

function loadSpace() {
  const space = document.getElementById("space");
  space.innerHTML = `
    <div class="empty">
      My Space coming soon 📁
    </div>
  `;
}

/* ================= HELPERS ================= */

function showMessage(msg) {
  document.getElementById("tasks").innerHTML =
    `<div class="empty">${msg}</div>`;
}
