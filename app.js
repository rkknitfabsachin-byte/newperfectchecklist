const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();

async function loadTasks() {
  if (!token) {
    alert("Access token missing");
    return;
  }

  const url = `${API}/tasks?token=${token}&date=${currentDate.toISOString()}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from API:", text);
      return;
    }

    renderTasks(data);
  } catch (e) {
    console.error("Fetch failed", e);
  }
}

function renderTasks(tasks) {
  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (!tasks.length) {
    box.innerHTML = `
      <div class="empty">
        Aaj koi task nahi 😌<br>
        Kal phir hustle 💪
      </div>
    `;
    return;
  }

  tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "chip";
    div.innerHTML = `
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
    `;
    box.appendChild(div);
  });
}

/* DATE NAV */
function nextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  loadTasks();
}
function prevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  loadTasks();
}

/* INIT */
loadTasks();
