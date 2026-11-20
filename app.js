const $=id=>document.getElementById(id);
const KEY="focusflow-pro-v2";
const defaults={
  tasks:[
    {id:1,text:"Review today's lecture notes",priority:"High",due:"",done:false,created:Date.now()},
    {id:2,text:"Finish the web design assignment",priority:"Medium",due:"",done:false,created:Date.now()},
    {id:3,text:"Take a short break and reset",priority:"Low",due:"",done:true,created:Date.now()}
  ],
  focusMinutes:0,displayName:"",theme:"dark",habits:[
    {id:"water",icon:"♧",name:"Drink water",description:"Stay hydrated throughout the day.",count:0},
    {id:"read",icon:"▤",name:"Read for 15 minutes",description:"Give your mind a little quiet time.",count:0},
    {id:"stretch",icon:"↗",name:"Stretch and move",description:"Take a movement break.",count:0},
    {id:"study",icon:"✎",name:"Learn something new",description:"Make a little space for learning.",count:0},
    {id:"plan",icon:"☷",name:"Plan tomorrow",description:"End the day with a clear next step.",count:0},
    {id:"sleep",icon:"☾",name:"Wind down on time",description:"Create a calmer evening routine.",count:0}
  ],completedByDay:{}
};
let data;
try{data={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};}catch{data={...defaults};}
data.tasks=data.tasks||defaults.tasks;data.habits=data.habits||defaults.habits;data.completedByDay=data.completedByDay||{};
let currentView="dashboard",taskFilter="all",timerDuration=25*60,timerRemaining=timerDuration,timerRunning=false,timerId=null,toastId=null,confirmAction=null;

function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(toastId);toastId=setTimeout(()=>$("toast").classList.remove("show"),2300);}
function dayKey(date=new Date()){return date.toISOString().slice(0,10);}
function dateLabel(){return new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"}).format(new Date());}
function greeting(){let h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";}
function pending(){return data.tasks.filter(t=>!t.done);}
function done(){return data.tasks.filter(t=>t.done);}
function rate(){return data.tasks.length?Math.round(done().length/data.tasks.length*100):0;}
function updateStats(){
  $("statDone").textContent=done().length;$("statPending").textContent=pending().length;$("statFocus").textContent=data.focusMinutes;$("statRate").textContent=rate();$("statProgress").style.width=rate()+"%";
  $("navPending").textContent=pending().length;$("taskPageCount").textContent=data.tasks.length;$("focusPageTotal").textContent=data.focusMinutes+" min";
  $("insightDone").textContent=done().length;$("insightFocus").textContent=data.focusMinutes+"m";$("insightRate").textContent=rate()+"%";
  $("insightMessage").textContent=done().length?`You've completed ${done().length} task${done().length===1?"":"s"}. That's real progress. Keep choosing a clear next step.`:"Your progress starts with the first task. Add something small and give yourself a chance to complete it.";
}
function taskNode(task,compact=false){
  const row=document.createElement("div");row.className=(compact?"dash-task":"full-task")+(task.done?" completed":"");
  const check=document.createElement("input");check.type="checkbox";check.checked=task.done;check.setAttribute("aria-label","Mark task complete");
  check.addEventListener("change",()=>{task.done=check.checked;if(task.done){data.completedByDay[dayKey()]=(data.completedByDay[dayKey()]||0)+1;}save();renderAll();toast(task.done?"Task completed. Nice work!":"Task moved back to to do.");});
  const text=document.createElement(compact?"span":"div");
  if(compact){text.textContent=task.text;}else{text.className="full-task-info";const b=document.createElement("b");b.textContent=task.text;const small=document.createElement("small");small.textContent=task.due?"Due "+new Date(task.due+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"}):"No due date";text.append(b,small);}
  const priority=document.createElement("span");priority.className=compact?"dash-priority":"priority "+task.priority;priority.textContent=task.priority;
  row.append(check,text,priority);
  if(!compact){const del=document.createElement("button");del.className="delete-btn";del.textContent="×";del.title="Delete task";del.addEventListener("click",()=>{data.tasks=data.tasks.filter(t=>t.id!==task.id);save();renderAll();toast("Task deleted.");});row.append(del);}
  return row;
}
function renderTasks(){
  const dash=$("dashboardTasks");dash.innerHTML="";
  const first=[...pending()].sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]-({High:0,Medium:1,Low:2}[b.priority]))).slice(0,4);
  if(!first.length){const p=document.createElement("p");p.className="muted";p.textContent="You're all caught up. Add a new task when you're ready.";dash.append(p);}else first.forEach(t=>dash.append(taskNode(t,true)));
  const list=$("fullTaskList");list.innerHTML="";
  const q=$("taskSearch").value.trim().toLowerCase();
  const filtered=data.tasks.filter(t=>(taskFilter==="all"||(taskFilter==="active"&&!t.done)||(taskFilter==="done"&&t.done))&&t.text.toLowerCase().includes(q));
  $("taskEmpty").style.display=filtered.length?"none":"block";filtered.forEach(t=>list.append(taskNode(t,false)));
}
function chartMarkup(target){
  const labels=["Mon","Tue","Wed","Thu","Fri","Sat","Today"];
  const now=new Date(),offset=(now.getDay()+6)%7;
  const vals=labels.map((_,i)=>{let d=new Date(now);d.setDate(now.getDate()-(offset+(6-i)));return data.completedByDay[dayKey(d)]||0;});
  target.innerHTML="";
  labels.forEach((label,i)=>{const col=document.createElement("div");col.className="chart-bar"+(i===6?" today":"");const bar=document.createElement("i");bar.style.height=Math.max(5,Math.min(100,vals[i]*16+5))+"%";bar.title=vals[i]+" completed";const small=document.createElement("small");small.textContent=label;col.append(bar,small);target.append(col);});
}
const nudges=[
"Start with the task that would make today feel successful. Give it your freshest attention.",
"Try a 10-minute start. You don't need to finish the whole task; you just need to begin.",
"Put similar tasks together. Switching less often can make your work feel lighter.",
"Take a short reset between tasks. A clear mind is part of a productive plan.",
"Make your next action specific. 'Study' becomes easier when it turns into 'review two pages'.",
"Protect one distraction-free block today. Even 25 minutes of focus can move things forward."
];
function refreshNudge(){const p=$("dailyNudge");let options=nudges.filter(n=>n!==p.textContent);p.textContent=options[Math.floor(Math.random()*options.length)];}
function renderHabits(){
 const grid=$("habitGrid");grid.innerHTML="";
 data.habits.forEach(h=>{
  const card=document.createElement("article");card.className="surface habit-card";
  const icon=document.createElement("div");icon.className="habit-icon";icon.textContent=h.icon;
  const title=document.createElement("h2");title.textContent=h.name;
  const desc=document.createElement("p");desc.textContent=h.description;
  const count=document.createElement("div");count.className="habit-count";count.textContent=h.count+" day"+(h.count===1?"":"s")+" checked";
  const btn=document.createElement("button");btn.className="btn "+(h.lastDone===dayKey()?"btn-soft":"btn-outline");btn.textContent=h.lastDone===dayKey()?"✓ Done today":"Mark done today";btn.disabled=h.lastDone===dayKey();btn.addEventListener("click",()=>{h.count++;h.lastDone=dayKey();save();renderHabits();toast("Habit checked off. Keep it up!");});
  card.append(icon,title,desc,count,btn);grid.append(card);
 });
}
function renderAll(){updateStats();renderTasks();chartMarkup($("weekChart"));chartMarkup($("insightChart"));renderHabits();$("userNameSide").textContent=data.displayName||"Your workspace";$("greeting").innerHTML=`${greeting()}. <span>Let's make it count.</span>`;$("top-avatar");$("profileButton").textContent=(data.displayName||"Y").charAt(0).toUpperCase();$("displayName").value=data.displayName||"";if(timerRunning===false)updateTimerUI();}
function navigate(view){
 const valid=["dashboard","tasks","planner","focus","insights","habits","settings"];if(!valid.includes(view))view="dashboard";
 currentView=view;document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+view));
 document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.view===view));
 const names={dashboard:"Overview",tasks:"My tasks",planner:"Smart planner",focus:"Focus room",insights:"Insights",habits:"Habits",settings:"Settings"};$("crumbName").textContent=names[view];
 $("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
 if(location.hash!=="#"+view)history.replaceState(null,"","#"+view);
}
document.querySelectorAll("[data-view]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();navigate(a.dataset.view);}));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
window.addEventListener("hashchange",()=>navigate(location.hash.slice(1)));
$("taskForm").addEventListener("submit",e=>{e.preventDefault();const text=$("taskInput").value.trim();if(!text)return;data.tasks.unshift({id:Date.now(),text,priority:$("taskPriority").value,due:$("taskDate").value,done:false,created:Date.now()});$("taskInput").value="";$("taskDate").value="";save();renderAll();toast("Task added to your workspace.");});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");taskFilter=b.dataset.filter;renderTasks();}));
$("taskSearch").addEventListener("input",renderTasks);$("clearDone").addEventListener("click",()=>{if(!done().length){toast("No completed tasks to clear.");return;}data.tasks=data.tasks.filter(t=>!t.done);save();renderAll();toast("Completed tasks cleared.");});
function updateTimerUI(){
 const min=Math.floor(timerRemaining/60),sec=timerRemaining%60,txt=String(min).padStart(2,"0")+":"+String(sec).padStart(2,"0");
 $("timerDisplay").textContent=txt;$("miniTimer").textContent=txt;
 const progress=1-timerRemaining/timerDuration,deg=Math.max(0,Math.min(360,progress*360));
 $("bigTimerRing").style.background=`conic-gradient(#a58aff 0deg,#688ff5 ${deg}deg,#27334f ${deg}deg 360deg)`;
}
function setTimer(minutes){
 clearInterval(timerId);timerId=null;timerRunning=false;timerDuration=minutes*60;timerRemaining=timerDuration;
 $("timerStart").textContent="Start focus";$("timerMode").textContent=minutes===5?"SHORT BREAK":"FOCUS SESSION";$("timerStatus").textContent="Ready when you are";
 document.querySelectorAll(".preset").forEach(b=>b.classList.toggle("active",Number(b.dataset.minutes)===minutes));updateTimerUI();
}
document.querySelectorAll(".preset").forEach(b=>b.addEventListener("click",()=>setTimer(Number(b.dataset.minutes))));
$("timerStart").addEventListener("click",()=>{
 if(timerRunning){clearInterval(timerId);timerRunning=false;$("timerStart").textContent="Resume";$("timerStatus").textContent="Paused";return;}
 if(timerRemaining<=0)setTimer(timerDuration/60);
 timerRunning=true;$("timerStart").textContent="Pause";$("timerStatus").textContent="You're in focus mode";
 timerId=setInterval(()=>{timerRemaining--;updateTimerUI();if(timerRemaining<=0){clearInterval(timerId);timerId=null;timerRunning=false;$("timerStart").textContent="Start again";$("timerStatus").textContent="Session complete";
  if(timerDuration!==300){data.focusMinutes+=Math.round(timerDuration/60);save();updateStats();$("focusPageTotal").textContent=data.focusMinutes+" min";toast("Focus session complete. Excellent work!");}else toast("Break complete. Welcome back!");
 }},1000);
});
$("timerReset").addEventListener("click",()=>{setTimer(timerDuration/60);$("timerStatus").textContent="Timer reset";});
$("refreshNudge").addEventListener("click",refreshNudge);
$("generatePlan").addEventListener("click",()=>{
 const goal=$("plannerGoal").value.trim(),hours=Number($("plannerHours").value),energy=$("plannerEnergy").value;
 const tasks=pending().slice().sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]-({High:0,Medium:1,Low:2}[b.priority])));
 const max=energy==="low"?Math.min(2,tasks.length):energy==="medium"?Math.min(3,tasks.length):Math.min(4,tasks.length);
 const chosen=tasks.slice(0,max);const output=$("planOutput");output.innerHTML="";$("planTitle").textContent=goal?"A plan for your goal":"A realistic plan for today";
 const total=Math.max(1,Math.floor(hours*60/(chosen.length+1)));
 const items=[];
 if(goal)items.push({time:"Start",title:"Your main goal",desc:goal});
 chosen.forEach((t,i)=>items.push({time:`${String(9+i).padStart(2,"0")}:00`,title:t.text,desc:`${total} minute work block · ${t.priority.toLowerCase()} priority`}));
 items.push({time:"Reset",title:"Take a proper break",desc:energy==="low"?"Take 15 minutes to recharge.":"Take 10 minutes away from your screen."});
 if(!chosen.length&&!goal)items.unshift({time:"First",title:"Add a task to your list",desc:"Your planner can organise tasks once you add them."});
 items.forEach((item,i)=>{const div=document.createElement("div");div.className="plan-item";div.style.animationDelay=(i*.06)+"s";const time=document.createElement("div");time.className="plan-time";time.textContent=item.time;const detail=document.createElement("div");detail.className="plan-detail";const b=document.createElement("b");b.textContent=item.title;const p=document.createElement("p");p.textContent=item.desc;detail.append(b,p);div.append(time,detail);output.append(div);});
 toast("Your day plan is ready.");
});
function showConfirm(title,message,action){$("modalHeading").textContent=title;$("modalText").textContent=message;$("confirmModal").classList.add("show");confirmAction=action;}
function closeConfirm(){$("confirmModal").classList.remove("show");confirmAction=null;}
$("modalClose").addEventListener("click",closeConfirm);$("modalCancel").addEventListener("click",closeConfirm);$("confirmModal").addEventListener("click",e=>{if(e.target===$("confirmModal"))closeConfirm();});
$("modalConfirm").addEventListener("click",()=>{if(confirmAction)confirmAction();closeConfirm();});
$("resetData").addEventListener("click",()=>showConfirm("Reset your workspace?","This removes your saved tasks, habits and focus totals from this browser.",()=>{data={...defaults,tasks:[],focusMinutes:0,habits:defaults.habits.map(h=>({...h,count:0}))};save();renderAll();toast("Workspace reset.");}));
$("saveSettings").addEventListener("click",()=>{data.displayName=$("displayName").value.trim();save();renderAll();toast("Settings saved.");});
function toggleTheme(){document.body.classList.toggle("light");data.theme=document.body.classList.contains("light")?"light":"dark";$("themeToggle").textContent=data.theme==="light"?"☾":"☼";save();}
$("themeToggle").addEventListener("click",toggleTheme);$("settingsTheme").addEventListener("click",toggleTheme);
$("exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="focusflow-backup.json";a.click();URL.revokeObjectURL(url);toast("Your data export is ready.");});
$("profileButton").addEventListener("click",()=>navigate("settings"));$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeConfirm();$("sidebar").classList.remove("open");}});
$("dateChip").textContent=dateLabel();if(data.theme==="light"){document.body.classList.add("light");$("themeToggle").textContent="☾";}
$("sidebarQuote").textContent="Focus on progress, not perfection.";
renderAll();navigate(location.hash.slice(1)||"dashboard");updateTimerUI();
