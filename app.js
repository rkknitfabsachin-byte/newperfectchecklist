const API = "https://newchecklist.rkknitfabsachin.workers.dev";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();

/* ================= LOAD TASKS ================= */

async function loadTasks() {
  if (!token) {
    showMessage("Access token missing ❌");
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
      showMessage("Server error ❌");
      return;
    }

    // 🔴 IMPORTANT FIX
    if (!Array.isArray(data)) {
      console.error("API returned error:", data);
      showMessage(data.error || "No data available");
      return;
    }

    renderTasks(data);

  } catch (err) {
    console.error("Fetch failed:", err);
    showMessage("Network error ❌");
  }
}

/* ================= RENDER ================= */

function renderTasks(tasks) {
  const box = document.getElementById("tasks");
  box.innerHTML = "";

  if (tasks.length === 0) {
    box.innerHTML = `
      <div class="empty">
        Aaj koi kaam nahi 😌<br>
        Kal phir hustle 💪
      </div>
    `;
    return;
  }

  const frag = document.createDocumentFragment();

  tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "chip";
    div.innerHTML = `
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
    `;
    frag.appendChild(div);
  });

  box.appendChild(frag);
}

/* ================= UI HELPERS ================= */

function showMessage(msg) {
  const box = document.getElementById("tasks");
  box.innerHTML = `<div class="empty">${msg}</div>`;
}

/* ================= DATE NAV ================= */

function nextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  loadTasks();
}

function prevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  loadTasks();
}

/* ================= INIT ================= */

loadTasks();
