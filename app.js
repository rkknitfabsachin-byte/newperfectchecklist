const API = "https://newchecklist.rkknitfabsachin.workers.dev";
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

/* DATE */
function moveDate(d){
  currentDate.setDate(currentDate.getDate()+d);
  if(currentView==="tasks") loadTasks();
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
  tabTasks.classList.toggle("active",v==="tasks");
  tabSpace.classList.toggle("active",v==="space");
  if(v==="space") loadSpace();
}

/* TASKS */
async function loadTasks(){
  dateLabel.innerText = currentDate.toDateString();

  const res = await fetch(
    `${API}?action=tasks&token=${token}&date=${currentDate.toISOString()}`
  );
  const {tasks:list} = await res.json();

  tasks.innerHTML = "";

  if (!list.length) {
    tasks.innerHTML = `<div class="empty">
      Aaj ka kaam complete 🎉
    </div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  list.forEach(t=>{
    const c = document.createElement("div");
    c.className = "chip";
    c.innerHTML = `
      <span class="dot ${t.source}"></span>
      <span style="flex:1">${t.task}</span>
      <button class="done-btn"
        onclick="done(this,'${t.source}',${t.row})">Done</button>
    `;
    frag.appendChild(c);
  });

  tasks.appendChild(frag);
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
  const res = await fetch(`${API}?action=mySpace&token=${token}`);
  const {items} = await res.json();
  space.innerHTML="";

  if(!items.length){
    space.innerHTML=`<div class="empty">
      Yeh tumhari personal jagah hai 📁
    </div>`;
    return;
  }

  const frag=document.createDocumentFragment();
  items.forEach(i=>{
    const c=document.createElement("div");
    c.className="chip";
    c.innerHTML=`
      <span class="dot space"></span>
      <span style="flex:1">${i.title}${i.value?" • "+i.value:""}</span>
      <button class="done-btn"
        onclick="removeItem(this,${i.row})">✕</button>
    `;
    frag.appendChild(c);
  });
  space.appendChild(frag);
}

function addItem(){
  if(currentView!=="space") return;
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

function removeItem(btn,row){
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
