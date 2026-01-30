/************ CONFIG ************/
const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");

let currentUser = null;
let currentMode = "today";

/************ SAFETY ************/
if (!token) {
  document.body.innerHTML = `
    <div style="padding:2rem;text-align:center">
      <h3>Access link required</h3>
    </div>`;
  throw new Error("Token missing");
}

/************ INIT ************/
init();

async function init() {
  const me = await fetch(`${API}?action=me&token=${token}`).then(r => r.json());
  if (me.error) {
    document.body.innerHTML = "<h3>Unauthorized</h3>";
    return;
  }

  currentUser = me;
  document.getElementById("username").innerText = me.name;

  loadTasks("today");
  loadMySpace();
}

/************ MODE SWITCH ************/
function switchMode(btn) {
  document.querySelectorAll(".mode button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  loadTasks(btn.dataset.mode);
}

/************ TASKS ************/
async function loadTasks(mode) {
  currentMode = mode;
  const res = await fetch(
    `${API}?action=tasks&token=${token}&mode=${mode}&date=${new Date().toISOString()}`
  );
  const json = await res.json();

  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (!json.tasks || json.tasks.length === 0) {
    box.innerHTML = `<div class="chip">No tasks</div>`;
    return;
  }

  for (const t of json.tasks) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <span class="dot ${t.status === "Done" ? "done" : ""}"></span>
      <span style="flex:1">${t.task}</span>
      ${
        t.status !== "Done" && currentUser.role === "doer"
          ? `<button onclick="markDone('${t.source}',${t.row})">✔</button>`
          : ""
      }
    `;
    box.appendChild(chip);
  }
}

/************ MARK DONE ************/
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

/************ MY SPACE ************/
async function loadMySpace() {
  const json = await fetch(
    `${API}?action=mySpace&token=${token}`
  ).then(r => r.json());

  const box = document.getElementById("myspace");
  box.innerHTML = "";

  if (!json.items || json.items.length === 0) {
    box.innerHTML = `<div class="chip">Empty</div>`;
    return;
  }

  for (const i of json.items) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <span class="dot done"></span>
      <span style="flex:1">${i.title}</span>
      <button onclick="removeMySpace(${i.row})">✕</button>
    `;
    box.appendChild(chip);
  }
}

/************ QUICK ADD ************/
async function addQuick() {
  const title = prompt("Add to My Space");
  if (!title) return;

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "addMySpace",
      token,
      type: "note",
      title
    })
  });

  loadMySpace();
}

/************ REMOVE ************/
async function removeMySpace(row) {
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

/************ THEME ************/
function toggleTheme() {
  document.body.classList.toggle("light");
}
