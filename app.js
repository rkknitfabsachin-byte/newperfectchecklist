/********************
 * GLOBALS
 ********************/
const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

if (!token) {
  document.body.innerHTML = "❌ Invalid access link";
  throw new Error("Missing token");
}

let currentDate = new Date();
let currentView = "tasks";
let mySpaceData = [];
let currentFolder = "General";

/********************
 * INIT
 ********************/
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  goToday();
});

/********************
 * DATE HANDLING
 ********************/
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

/********************
 * VIEW SWITCH
 ********************/
function switchView(view) {
  currentView = view;
  document.getElementById("tasks").classList.toggle("hidden", view !== "tasks");
  document.getElementById("space").classList.toggle("hidden", view !== "space");
  document.getElementById("tabTasks").classList.toggle("active", view === "tasks");
  document.getElementById("tabSpace").classList.toggle("active", view === "space");

  if (view === "tasks") loadTasks();
  else loadSpace();
}

/********************
 * TASKS (UNCHANGED)
 ********************/
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
    const div = document.createElement("div");
    div.className = `task-chip ${task.source}`;
    div.innerHTML = `
      <div class="task-text">${task.task}</div>
      <button class="done-btn">✓</button>
    `;
    div.querySelector("button").onclick = () => markDone(task, div);
    box.appendChild(div);
  });
}

async function markDone(task, el) {
  el.classList.add("swipe-out");

  const form = new URLSearchParams();
  form.append("action", "done");
  form.append("token", token);
  form.append("source", task.source);
  form.append("row", task.row);

  await fetch(`${API}/done`, { method: "POST", body: form });
  setTimeout(() => el.remove(), 250);
}

/********************
 * MY SPACE
 ********************/
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
  renderStats();
  renderFolders();
}

/********************
 * STATS
 ********************/
async function renderStats() {
  const form = new URLSearchParams();
  form.append("action", "getStats");
  form.append("token", token);

  const res = await fetch(`${API}/myspace`, {
    method: "POST",
    body: form
  });

  const stats = await res.json();

  const box = document.getElementById("space");
  box.innerHTML = `
    <div class="task-chip">
      🔥 Weekly: ${stats.weekly} &nbsp;|&nbsp;
      📊 Monthly: ${stats.monthly}
    </div>
  `;
}

/********************
 * FOLDERS
 ********************/
function renderFolders() {
  const box = document.getElementById("space");

  const folders = [...new Set(
    mySpaceData.map(r => r[2] || "General")
  )];

  if (!folders.length) {
    box.innerHTML += `
      <div class="empty">
        Folder banao aur start karo 📁
      </div>`;
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
  box.innerHTML = `
    <div class="task-chip" onclick="renderFolders()">← Back</div>
  `;

  mySpaceData
    .filter(r => (r[2] || "General") === folder)
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "task-chip";
      div.innerHTML = `
        <div class="task-text">${r[3]}</div>
        <div class="task-actions">
          ${r[4] ? `<a href="${r[4]}" target="_blank">Open</a>` : ""}
          <button onclick="doneMySpace('${r[3]}')">Done</button>
        </div>
      `;
      box.appendChild(div);
    });
}

/********************
 * MY SPACE DONE
 ********************/
async function doneMySpace(title) {
  const form = new URLSearchParams();
  form.append("action", "doneMySpace");
  form.append("token", token);
  form.append("title", title);

  await fetch(`${API}/myspace`, { method: "POST", body: form });
  loadSpace();
}

/********************
 * ADD ITEM (FAB)
 ********************/
const _addItem = addItem;
addItem = function () {
  if (currentView !== "space") return _addItem();

  const isFolder = confirm("Folder banana hai?");
  let title = prompt(isFolder ? "Folder name" : "Title");
  if (!title) return;

  let url = "";
  if (!isFolder) {
    url = prompt("Link (optional)") || "";
  }

  const form = new URLSearchParams();
  form.append("action", "addSpace");
  form.append("token", token);
  form.append("type", isFolder ? "folder" : (url ? "link" : "task"));
  form.append("folder", isFolder ? title : currentFolder);
  form.append("title", title);
  form.append("url", url);

  fetch(`${API}/myspace`, { method: "POST", body: form })
    .then(loadSpace);
};

/********************
 * THEME
 ********************/
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
