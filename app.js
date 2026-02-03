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
  form.append("action", "done");   // 🔑 THIS WAS MISSING
  form.append("token", token);
  form.append("source", task.source);
  form.append("row", task.row);

  await fetch(`${API}/done`, {
    method: "POST",
    body: form
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
let mySpaceData = [];
let currentFolder = "General";

async function loadSpace() {
  const box = document.getElementById("space");
  box.innerHTML = "<div class='empty'>Loading...</div>";

  const form = new URLSearchParams();
  form.append("action", "getSpace");
  form.append("token", token);

  const res = await fetch(`${API}/myspace`, {
    method: "POST",
    body: form
  });

  mySpaceData = await res.json();
  renderFolders();
}

function renderFolders() {
  const box = document.getElementById("space");
  box.innerHTML = "";

  const folders = [...new Set(mySpaceData.map(r => r[2] || "General"))];

  if (!folders.length) {
    box.innerHTML = `<div class="empty">Folder banao 📁</div>`;
    return;
  }

  folders.forEach(f => {
    const div = document.createElement("div");
    div.className = "task-chip";
    div.innerText = "📁 " + f;
    div.onclick = () => openFolder(f);
    box.appendChild(div);
  });
}

function openFolder(folder) {
  currentFolder = folder;
  const box = document.getElementById("space");
  box.innerHTML = "";

  const back = document.createElement("div");
  back.className = "task-chip";
  back.innerText = "← Back";
  back.onclick = renderFolders;
  box.appendChild(back);

  mySpaceData
    .filter(r => (r[2] || "General") === folder)
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "task-chip";
      div.innerHTML = `
        <div class="task-text">${r[3]}</div>
        ${r[4] ? `<a href="${r[4]}" target="_blank">Open</a>` : ""}
      `;
      box.appendChild(div);
    });
}

const _addItem = addItem;
addItem = function () {
  if (currentView !== "space") return _addItem();

  const isFolder = confirm("Create folder?");
  let title = prompt(isFolder ? "Folder name" : "Item title");
  if (!title) return;

  const form = new URLSearchParams();
  form.append("action", "addSpace");
  form.append("token", token);
  form.append("type", isFolder ? "folder" : "task");
  form.append("folder", isFolder ? title : currentFolder);
  form.append("title", title);

  fetch(`${API}/myspace`, {
    method: "POST",
    body: form
  }).then(loadSpace);
};
