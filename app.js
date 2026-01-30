const API = "https://script.google.com/macros/s/AKfycbxn6R1E7iaazqJfLw6Cyk1WT4AEhissMycTy9rJvBDZuEioNOheegG7itN1bJJYWhjS/exec";
const token = new URLSearchParams(location.search).get("token");

let currentDate = new Date();
let currentView = "tasks";

if (!token) {
  document.body.innerHTML = "Access link required";
  throw "";
}

/* THEME */
if (localStorage.getItem("rk-theme")==="light") {
  document.body.classList.add("light");
}
function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem(
    "rk-theme",
    document.body.classList.contains("light")?"light":"dark"
  );
}

/* INIT */
loadTasks();

/* DATE NAV */
function moveDate(d){
  currentDate.setDate(currentDate.getDate()+d);
  loadTasks();
}
function goToday(){
  currentDate = new Date();
  loadTasks();
}

/* VIEW */
function switchView(v){
  currentView=v;
  tasks.classList.toggle("hidden",v!=="tasks");
  space.classList.toggle("hidden",v!=="space");
  if(v==="space") loadSpace();
}

/* TASKS */
async function loadTasks(){
  dateLabel.innerText = currentDate.toDateString();
  const res = await fetch(
    `${API}?action=tasks&token=${token}&date=${currentDate.toISOString()}`
  );
  const json = await res.json();
  tasks.innerHTML="";

  if(!json.tasks.length){
    tasks.innerHTML=`<div style="text-align:center;opacity:.6">
      Aaj koi kaam nahi 😌<br>Kal phir hustle 💪
    </div>`;
    return;
  }

  json.tasks.forEach(t=>{
    const c=document.createElement("div");
    c.className="chip";
    c.innerHTML=`
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
      <button onclick="done(this,'${t.source}',${t.row})">Done</button>
    `;
    tasks.appendChild(c);
  });
}

function done(btn,source,row){
  const chip=btn.closest(".chip");
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
async function loadSpace(){
  const json = await fetch(
    `${API}?action=mySpace&token=${token}`
  ).then(r=>r.json());
  space.innerHTML="";

  if(!json.items.length){
    space.innerHTML=`<div style="text-align:center;opacity:.6">
      Yeh tumhari jagah hai 📁
    </div>`;
    return;
  }

  json.items.forEach(i=>{
    const c=document.createElement("div");
    c.className="chip";
    c.innerHTML=`
      <span class="dot space"></span>
      <span style="flex:1">${i.title}${i.value?" • "+i.value:""}</span>
      <button onclick="remove(this,${i.row})">✕</button>
    `;
    space.appendChild(c);
  });
}

function addItem(){
  if(currentView!=="space") return alert("System tasks sheet se aate hain 🙂");
  const t=prompt("Title");
  if(!t) return;

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      action:"addMySpace",
      token,title:t
    })
  }).then(loadSpace);
}

function remove(btn,row){
  const chip=btn.closest(".chip");
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
