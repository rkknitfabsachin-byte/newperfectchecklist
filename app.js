const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");

let currentMode = "today";
let currentView = "tasks";

if(!token){
  document.body.innerHTML = `<div class="empty">Access link required</div>`;
  throw "";
}

init();

/* ---------- INIT ---------- */
async function init(){
  const me = await fetch(`${API}?action=me&token=${token}`).then(r=>r.json());
  if(me.error) return;

  document.getElementById("subtitle").innerText = "Tasks";
  loadTasks("today");
}

/* ---------- VIEW SWITCH ---------- */
function switchView(view){
  currentView = view;

  document.getElementById("tasksView").classList.toggle("hidden", view !== "tasks");
  document.getElementById("spaceView").classList.toggle("hidden", view !== "space");
  document.getElementById("taskControls").classList.toggle("hidden", view !== "tasks");

  document.getElementById("subtitle").innerText =
    view === "tasks" ? "Tasks" : "My Space";

  if(view === "space") loadMySpace();
}

/* ---------- TASKS ---------- */
function switchMode(btn){
  document.querySelectorAll(".mode button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadTasks(btn.dataset.mode);
}

async function loadTasks(mode){
  currentMode = mode;
  const res = await fetch(
    `${API}?action=tasks&token=${token}&mode=${mode}&date=${new Date().toISOString()}`
  );
  const json = await res.json();
  const box = document.getElementById("tasksView");
  box.innerHTML = "";

  if(!json.tasks || json.tasks.length === 0){
    box.innerHTML = `
      <div class="empty">
        Sab kaam complete 🎉<br>
        Aaj ka din productive raha 💪
      </div>`;
    return;
  }

  json.tasks.forEach(t=>{
    const chip = document.createElement("div");
    chip.className="chip";
    chip.innerHTML = `
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
      <button onclick="done('${t.source}',${t.row})">Done</button>
    `;
    box.appendChild(chip);
  });
}

async function done(source,row){
  await fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"markDone",
      token,source,row
    })
  });
  loadTasks(currentMode);
}

/* ---------- MY SPACE ---------- */
async function loadMySpace(){
  const json = await fetch(`${API}?action=mySpace&token=${token}`).then(r=>r.json());
  const box = document.getElementById("spaceView");
  box.innerHTML="";

  if(!json.items || json.items.length===0){
    box.innerHTML = `
      <div class="empty">
        Yeh aapki personal jagah hai 📁<br>
        Jo zaroori ho, yahin rakho.
      </div>`;
    return;
  }

  json.items.forEach(i=>{
    const chip=document.createElement("div");
    chip.className="chip";
    chip.innerHTML=`
      <span class="dot space"></span>
      <span style="flex:1">${i.title}${i.value?` • ${i.value}`:""}</span>
      <button onclick="remove(${i.row})">✕</button>
    `;
    box.appendChild(chip);
  });
}

/* ---------- FAB ---------- */
function fabAction(){
  if(currentView === "tasks"){
    alert("System tasks sirf sheet se aate hain 🙂");
    return;
  }

  const title = prompt("Title (file / habit / task)");
  if(!title) return;

  const time = prompt("Time (optional, eg 07:00 AM)");
  const folder = prompt("Folder name (optional)");

  const finalTitle = folder ? `[${folder}] ${title}` : title;

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"addMySpace",
      token,
      type:"item",
      title:finalTitle,
      value:time || ""
    })
  }).then(loadMySpace);
}

/* ---------- REMOVE ---------- */
async function remove(row){
  await fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"deleteMySpace",
      token,row
    })
  });
  loadMySpace();
}
