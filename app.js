const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();
let currentView = "tasks";

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  goToday();
});

/* ================= DATE ================= */

function updateDateLabel() {
  document.getElementById("dateLabel").innerText =
    currentDate.toDateString();
}

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

  document.getElementById("tasks").classList.toggle("hidden", view !== "tasks");
  document.getElementById("space").classList.toggle("hidden", view !== "space");

  document.getElementById("tabTasks").classList.toggle("active", view === "tasks");
  document.getElementById("tabSpace").classList.toggle("active", view === "space");

  if (view === "tasks") loadTasks();
  else loadSpace();
}

/* ================= TASKS ================= */

async function loadTasks() {
  updateDateLabel();

  const res = await fetch(
    `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`
  );
  const tasks = await res.json();

  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (!tasks.length) {
    box.innerHTML = `
      <div class="empty">
        Aaj koi task nahi 😌<br>
        Kal phir hustle 💪
      </div>`;
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = `task-chip ${task.source}`;

    card.innerHTML = `
      <div class="task-left">
        <div class="task-text">${task.task}</div>
        <div class="task-meta">${task.source}</div>
      </div>
      <button class="done-btn" title="Mark as done">✓</button>
    `;

    card.querySelector(".done-btn").onclick = () =>
      markDone(task, card);

    box.appendChild(card);
  });
}

/* ================= DONE ACTION ================= */

const DONE_API = "https://script.google.com/macros/s/AKfycbxIWgtBmEKAorE8IHDtXGhLuJsunw2kIUAvcTj7J0IDrz-oUoNXLoJ__KYNgtFVT4RN/exec";

async function markDone(task, el) {
  el.classList.add("swipe-out");

  await fetch(DONE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      source: task.source,
      row: task.row
    })
  });

  setTimeout(() => el.remove(), 250);
}


  // remove from DOM
  setTimeout(() => el.remove(), 250);
}

/* ================= MY SPACE ================= */

function loadSpace() {
  document.getElementById("space").innerHTML = `
    <div class="empty">
      My Space is personal 📁<br>
      Links, habits & notes coming next ✨
    </div>
  `;
}

function addItem() {
  if (currentView === "tasks") {
    alert("Tasks are auto-managed 🙂");
  } else {
    alert("Add item to My Space (next step)");
  }
}

/* ================= THEME ================= */

function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "rk-theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

function restoreTheme() {
  if (localStorage.getItem("rk-theme") === "light") {
    document.body.classList.add("light");
  }
}
