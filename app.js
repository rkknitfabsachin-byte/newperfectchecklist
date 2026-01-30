const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");

let currentMode = "today";
let currentView = "tasks";

if(!token){
  document.body.innerHTML = `<div class="empty">Access link required</div>`;
  throw "";
}

init();

/* INIT */
async function init(){
  const me = await fetch(`${API}?action=me&token=${token}`).then(r=>r.json());
  if(me.error) return;
  loadTasks("today");
}

/* VIEW SWITCH */
function switchView(view){
  currentView = view;
  tasksView.classList.toggle("hidden", view!=="tasks");
  spaceView.classList.toggle("hidden", view!=="space");
  taskControls.classList.toggle("hidden", view!=="tasks");
  subtitle.innerText = view==="tasks" ? "Tasks" : "My Space";
  if(view==="space") loadMySpace();
}

/* MODE */
function switchMode(btn){
  document.querySelectorAll(".mode button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadTasks(btn.dataset.mode);
}

/* TASKS */
async function loadTasks(mode){
  currentMode = mode;
  const res = await fetch(
    `${API}?action=tasks&token=${token}&mode=${mode}&date=${new Date().toISOString()}`
  );
  const json = await res.json();
  tasksView.innerHTML = "";

  if(!json.tasks || json.tasks.length===0){
    tasksView.innerHTML = `
      <div class="empty">
        Sab kaam complete 🎉<br>
        Aaj ka din productive raha 💪
      </div>`;
    return;
  }

  json.tasks.forEach(t=>{
    const chip=document.createElement("div");
    chip.className="chip";
    chip.innerHTML=`
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
      <button onclick="done(this,'${t.source}',${t.row})">Done</button>
    `;
    tasksView.appendChild(chip);
  });
}

/* DONE WITH ANIMATION */
function done(btn,source,row){
  const chip = btn.closest(".chip");
  chip.classList.add("removing");

  setTimeout(()=>chip.remove(),180);

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"markDone",
      token,source,row
    })
  });
}

/* MY SPACE */
async function loadMySpace(){
  const json = await fetch(`${API}?action=mySpace&token=${token}`).then(r=>r.json());
  spaceView.innerHTML="";

  if(!json.items || json.items.length===0){
    spaceView.innerHTML = `
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
      <button onclick="removeItem(this,${i.row})">✕</button>
    `;
    spaceView.appendChild(chip);
  });
}

/* REMOVE MY SPACE WITH ANIMATION */
function removeItem(btn,row){
  const chip = btn.closest(".chip");
  chip.classList.add("removing");
  setTimeout(()=>chip.remove(),180);

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"deleteMySpace",
      token,row
    })
  });
}

/* FAB */
function fabAction(){
  if(currentView==="tasks"){
    alert("System tasks sheet se aate hain 🙂");
    return;
  }

  const title = prompt("Title");
  if(!title) return;

  const time = prompt("Time (optional)");
  const folder = prompt("Folder (optional)");
  const finalTitle = folder ? `[${folder}] ${title}` : title;

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"addMySpace",
      token,
      type:"item",
      title:finalTitle,
      value:time||""
    })
  }).then(loadMySpace);
}

/* THEME */
function toggleTheme(el){
  document.body.classList.toggle("light", el.checked);
}
