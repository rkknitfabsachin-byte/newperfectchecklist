const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");

async function init() {
  const me = await fetch(`${API}?action=me&token=${token}`).then(r=>r.json());
  document.getElementById("username").innerText = me.name;
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
      </div>
    `;
  });
}

init();
