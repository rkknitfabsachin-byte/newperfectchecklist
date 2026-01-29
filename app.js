const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");
let currentUser = null;

async function init() {
  currentUser = await fetch(`${API}?action=me&token=${token}`).then(r=>r.json());
  document.getElementById("username").innerText = currentUser.name;

  if (currentUser.role === "admin") {
    document.getElementById("adminStats").classList.remove("hidden");
    loadAdminStats();
  }

  loadTasks("today");
}

async function loadTasks(mode) {
  const date = new Date().toISOString();
  const data = await fetch(
    `${API}?action=tasks&token=${token}&mode=${mode}&date=${date}`
  ).then(r=>r.json());

  const box = document.getElementById("tasks");
  box.innerHTML = "";

  data.forEach(t => {
    box.innerHTML += `
      <div class="card">
        <h4>${t.task}</h4>
        <small>${t.source} • ${new Date(t.planned).toDateString()}</small>
        <p>Status: ${t.status}</p>
        ${
          t.status !== "Done" && currentUser.role === "doer"
            ? `<button onclick="markDone('${t.source}', ${t.row})">✔ Done</button>`
            : ""
        }
      </div>
    `;
  });
}

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

  loadTasks("today");
}


async function loadAdminStats() {
  const data = await fetch(
    `${API}?action=adminStats&token=${token}`
  ).then(r=>r.json());

  const box = document.getElementById("adminStats");
  box.innerHTML = "";

  Object.keys(data).forEach(name => {
    const u = data[name];
    const pct = Math.round((u.done / u.assigned) * 100) || 0;

    box.innerHTML += `
      <div class="card">
        <h4>${name}</h4>
        <p>Assigned: ${u.assigned}</p>
        <p>Done: ${u.done}</p>
        <p>Missed: ${u.missed}</p>
        <strong>${pct}% Complete</strong>
      </div>
    `;
  });
}

function toggleTheme() {
  document.body.classList.toggle("light");
}


init();
