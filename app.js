/**************** CONFIG ****************/
const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(window.location.search).get("token");

let currentUser = null;
let currentMode = "today";

/**************** SAFETY ****************/
if (!token) {
  document.body.innerHTML = `
    <div style="padding:2rem;text-align:center">
      <h2>Access Link Required 📚</h2>
      <p>Please open the app using your personal link.</p>
    </div>
  `;
  throw new Error("Token missing");
}

/**************** INIT ****************/
async function init() {
  const res = await fetch(`${API}?action=me&token=${token}`);
  const me = await res.json();

  if (me.error) {
    document.body.innerHTML = "<h3>Unauthorized</h3>";
    return;
  }

  currentUser = me;
  document.getElementById("username").innerText = me.name;

  loadTasks("today");
}

init();

/**************** TAB SWITCH ****************/
function showTab(tab) {
  document.getElementById("tasks").classList.toggle("hidden", tab !== "tasks");
  document.getElementById("myspace").classList.toggle("hidden", tab !== "myspace");

  document.getElementById("tabTasks").classList.toggle("active", tab === "tasks");
  document.getElementById("tabMySpace").classList.toggle("active", tab === "myspace");

  if (tab === "myspace") {
    loadMySpace();
  }
}

/**************** TASKS ****************/
async function loadTasks(mode) {
  currentMode = mode;

  const date = new Date().toISOString().slice(0, 10);

  const res = await fetch(
    `${API}?action=tasks&token=${token}&mode=${mode}&date=${date}`
  );
  const json = await res.json();

  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (!json.tasks || json.tasks.length === 0) {
    box.innerHTML = `<div class="card">No tasks for this day 📖</div>`;
    return;
  }

  json.tasks.forEach(t => {
    box.innerHTML += `
      <div class="card">
        <h4>${t.task}</h4>
        <small>
          ${t.source.toUpperCase()} • 
          ${new Date(t.planned).toDateString()}
        </small>
        <p>Status: <strong>${t.status}</strong></p>

        ${
          t.status !== "Done" && currentUser.role === "doer"
            ? `<button onclick="markDone('${t.source}', ${t.row})">✔ Mark Done</button>`
            : ""
        }
      </div>
    `;
  });
}

/**************** MARK DONE ****************/
async function markDone(source, row) {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "markDone",
      token,
      source,
      row
    })
  });

  loadTasks(currentMode);
}

/**************** MY SPACE ****************/
async function loadMySpace() {
  const res = await fetch(`${API}?action=mySpace&token=${token}`);
  const json = await res.json();

  const box = document.getElementById("myspace");
  box.innerHTML = `
    <div class="card">
      <h4>Add to My Space</h4>

      <select id="msType">
        <option value="task">Task</option>
        <option value="url">URL</option>
        <option value="sheet">Sheet</option>
      </select>

      <input id="msTitle" placeholder="Title">
      <input id="msValue" placeholder="Link (optional)">
      <button onclick="addMySpace()">Add</button>
    </div>
  `;

  if (!json.items || json.items.length === 0) {
    box.innerHTML += `<div class="card">Your space is empty 📚</div>`;
    return;
  }

  json.items.forEach(i => {
    box.innerHTML += `
      <div class="card">
        <h4>${i.title}</h4>
        ${
          i.value
            ? `<a href="${i.value}" target="_blank">${i.value}</a>`
            : ""
        }
        <button onclick="deleteMySpace(${i.row})">Remove</button>
      </div>
    `;
  });
}

/**************** ADD MY SPACE ****************/
async function addMySpace() {
  const type = document.getElementById("msType").value;
  const title = document.getElementById("msTitle").value.trim();
  const value = document.getElementById("msValue").value.trim();

  if (!title) {
    alert("Title is required");
    return;
  }

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "addMySpace",
      token,
      type,
      title,
      value
    })
  });

  loadMySpace();
}

/**************** DELETE MY SPACE ****************/
async function deleteMySpace(row) {
  if (!confirm("Remove this item?")) return;

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "deleteMySpace",
      token,
      row
    })
  });

  loadMySpace();
}

/**************** THEME ****************/
function toggleTheme() {
  document.body.classList.toggle("light");
}
