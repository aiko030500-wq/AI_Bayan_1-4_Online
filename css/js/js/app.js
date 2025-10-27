const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Simple state
const S = {
  user: null,
  progress: JSON.parse(localStorage.getItem("ai_bayan_progress")||"{}")
};

function saveProgress(){
  localStorage.setItem("ai_bayan_progress", JSON.stringify(S.progress));
}
function markDone(section, key){
  S.progress[section] = S.progress[section] || {};
  S.progress[section][key] = true;
  saveProgress();
  renderJournal();
}

// --- Login
$("#btnLogin").addEventListener("click", ()=>{
  const name = $("#studentName").value.trim();
  const code = $("#accessCode").value.trim();
  if(!name){ $("#loginError").textContent = "Введите имя."; return; }
  if(code !== "7856"){ $("#loginError").textContent = "Неверный код. Попробуйте 7856."; return; }
  $("#loginError").textContent = "";
  S.user = {name};
  $("#welcomeName").textContent = "👋 " + name;
  $("#login").classList.add("hidden");
  $("#shell").classList.remove("hidden");
  navigate("home");
});

$("#btnLogout").addEventListener("click", ()=>{ location.reload(); });

// --- Navigation
$$("nav#menu button").forEach(b=>{
  b.addEventListener("click", ()=>{
    $$("nav#menu button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    navigate(b.dataset.view);
  });
});

function navigate(view){
  const el = $("#view");
  el.innerHTML = "";
  switch(view){
    case "home": renderHome(el); break;
    case "grammar": renderGrammar(el); break;
    case "phonics": renderPhonics(el); break;
    case "vocabulary": renderVocabulary(el); break;
    case "listening": renderListening(el); break;
    case "reading": renderReading(el); break;
    case "speaking": renderSpeaking(el); break;
    case "writing": renderWriting(el); break;
    case "irregular": renderIrregular(el); break;
    case "clock": renderClock(el); break;
    case "dictionary": renderDictionary(el); break;
    case "chat": renderChat(el); break;
    case "journal": renderJournal(el); break;
  }
}

// --- Views
function renderHome(el){
  const total = countTotalTasks();
  const done = countDoneTasks();
  el.innerHTML = `
    <div class="section">
      <h2>Welcome to AI Bayan — Grades 1–4</h2>
      <p>🎓 Complete tasks in grammar, phonics, vocabulary, listening, reading, speaking and writing. Your progress is saved locally on this device.</p>
      <div class="grid">
        ${["grammar","phonics","vocabulary","listening","reading","speaking","writing","irregular","clock","dictionary","chat","journal"].map(s=>`
          <div class="card-sm">
            <div><span class="badge">${s.toUpperCase()}</span></div>
            <div class="progress" style="margin:10px 0"><span style="width:${progressPct(s)}%"></span></div>
            <button onclick="navigate('${s}')">Open</button>
          </div>
        `).join("")}
      </div>
      <p><b>Overall progress:</b></p>
      <div class="progress"><span style="width:${(done/Math.max(1,total)*100).toFixed(0)}%"></span></div>
    </div>
  `;
}

function countTotalTasks(){
  let n=0;
  n += AI_BAYAN_DATA.grammar.length;
  n += AI_BAYAN_DATA.phonics.length;
  n += Object.values(AI_BAYAN_DATA.vocabulary).flat().length;
  n += AI_BAYAN_DATA.listening.length;
  n += AI_BAYAN_DATA.reading.length;
  n += AI_BAYAN_DATA.speaking.length;
  n += AI_BAYAN_DATA.writing.length;
  n += AI_BAYAN_DATA.irregularVerbs.length;
  n += AI_BAYAN_DATA.clockTasks.length;
  n += AI_BAYAN_DATA.dictionary.length;
  return n;
}
function countDoneTasks(){
  return Object.values(S.progress).reduce((a,sec)=>a+Object.keys(sec).length,0);
}
function progressPct(section){
  const totals = {
    grammar: AI_BAYAN_DATA.grammar.length,
    phonics: AI_BAYAN_DATA.phonics.length,
    vocabulary: Object.values(AI_BAYAN_DATA.vocabulary).flat().lengt
