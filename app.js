const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const DONE_API = "https://script.google.com/macros/s/AKfycbxIWgtBmEKAorE8IHDtXGhLuJsunw2kIUAvcTj7J0IDrz-oUoNXLoJ__KYNgtFVT4RN/exec";

const token = new URLSearchParams(location.search).get("token");
if (!token) {
  document.body.innerHTML = `
    <div style="padding:40px;text-align:center">
      ❌ Invalid link<br><br>
      Please use your personal task link.
    </div>`;
  throw new Error("Missing token");
}

let currentDate = new Date();
let currentView = "tasks";

document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  goToday();
});

/* DATE */
function updateDateLabel() {
  document.getElementById("dateLabel").innerText = currentDate.toDateString();
}
function moveDate(step) {
  currentDate.setDate(currentDate.getDate() + step);
  if (currentView === "tasks") loadTasks();
}
function goToday() {
  currentDate = new Date();
  if (currentView === "tasks") loadTasks();
}

/* VIEW */
function switchView(v) {
  currentView = v;
  document.getElementById("tasks").classList.toggle("hidden", v !== "tasks");
  document.getElementById("space").classList.toggle("hidden", v !== "space");
  document.getElementById("tabTasks").classList.toggle("active", v === "tasks");
  document.getElementById("tabSpace").classList.toggle("active", v === "space");
  v === "tasks" ? loadTasks() : loadSpace();
}

/* TASKS */
async function loadTasks() {
  updateDateLabel();
  const res = await fetch(
    `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`
  );
  const tasks = await res.json();

  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (!tasks.length) {
    box.innerHTML = `<div class="empty">Aaj koi task nahi 😌</div>`;
    return;
  }

  tasks.forEach(t => {
    const card = document.createElement("div");
    card.className = `task-chip ${t.source}`;
    card.innerHTML = `
      <div class="task-text">${t.task}</div>
      <button class="done-btn">✓</button>
    `;
    card.querySelector("button").onclick = () => markDone(t, card);
    box.appendChild(card);
  });
}

async function markDone(task, el) {
  el.classList.add("swipe-out");

  const form = new URLSearchParams();
  form.append("token", token);
  form.append("source", task.source);
  form.append("row", task.row);

  await fetch(DONE_API, {
    method: "POST",
    body: form   // 🔑 NO headers, NO JSON
  });

  setTimeout(() => el.remove(), 250);
}


/* MY SPACE */
function loadSpace() {
  document.getElementById("space").innerHTML =
    `<div class="empty">My Space coming soon 📁</div>`;
}
function addItem() {
  alert("My Space editor coming next");
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("rk-theme",
    document.body.classList.contains("light") ? "light" : "dark");
}
function restoreTheme() {
  if (localStorage.getItem("rk-theme") === "light") {
    document.body.classList.add("light");
  }
}
