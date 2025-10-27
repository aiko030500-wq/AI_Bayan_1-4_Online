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
    vocabulary: Object.values(AI_BAYAN_DATA.vocabulary).flat().length,
    listening: AI_BAYAN_DATA.listening.length,
    reading: AI_BAYAN_DATA.reading.length,
    speaking: AI_BAYAN_DATA.speaking.length,
    writing: AI_BAYAN_DATA.writing.length,
    irregular: AI_BAYAN_DATA.irregularVerbs.length,
    clock: AI_BAYAN_DATA.clockTasks.length,
    dictionary: AI_BAYAN_DATA.dictionary.length,
    chat: 1, journal: 1
  };
  const done = S.progress[section] ? Object.keys(S.progress[section]).length : 0;
  return Math.min(100, Math.round((done/Math.max(totals[section],1))*100));
}

// Grammar
function renderGrammar(el){
  el.innerHTML = `<h2>📘 Grammar</h2>
  <div class="grid">
    ${AI_BAYAN_DATA.grammar.map((g,i)=>`
      <div class="card-sm">
        <div><b>Grade ${g.grade}</b></div>
        <div>${g.title} — <i>${g.ru}</i></div>
        <ul>${g.ex.map(x=>`<li>${x}</li>`).join("")}</ul>
        <button onclick="markDone('grammar','${i}')">Mark done</button>
      </div>
    `).join("")}
  </div>`;
}

// Phonics
function renderPhonics(el){
  el.innerHTML = `<h2>🔤 Phonics</h2>
  <div class="grid">
    ${AI_BAYAN_DATA.phonics.map((p,i)=>`
      <div class="card-sm">
        <div><b>Grade ${p.grade}</b></div>
        <div>${p.title}</div>
        <ul>${p.items.map(x=>`<li>${x}</li>`).join("")}</ul>
        <button onclick="markDone('phonics','${i}')">Mark done</button>
      </div>
    `).join("")}
  </div>`;
}

// Vocabulary
function renderVocabulary(el){
  el.innerHTML = `<h2>🧠 Vocabulary</h2>
  ${Object.entries(AI_BAYAN_DATA.vocabulary).map(([grade,topics])=>`
    <div class="card-sm" style="margin-bottom:10px">
      <div><b>Grade ${grade}</b></div>
      <div>${topics.map(t=>`<span class="badge" style="margin:4px">${t}</span>`).join("")}</div>
      <button onclick="markDone('vocabulary','g${grade}')">Mark done</button>
    </div>
  `).join("")}`;
}

// Listening (speech synthesis)
function speakText(t){
  if(!('speechSynthesis' in window)){ alert('Speech Synthesis not supported'); return; }
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'en-GB';
  window.speechSynthesis.speak(u);
}
function renderListening(el){
  el.innerHTML = `<h2>🎧 Listening</h2>
  <div class="grid">
    ${AI_BAYAN_DATA.listening.map((l,i)=>`
      <div class="card-sm">
        <div><b>Grade ${l.grade}</b></div>
        <p>${l.text}</p>
        <button onclick="speakText(${JSON.stringify(l.text)})">▶️ Play</button>
        <button onclick="markDone('listening','${i}')">Mark done</button>
      </div>
    `).join("")}
  </div>`;
}

// Reading
function renderReading(el){
  el.innerHTML = `<h2>📖 Reading</h2>
  ${AI_BAYAN_DATA.reading.map((r,i)=>`
    <div class="card-sm">
      <div><b>Grade ${r.grade}</b> — ${r.title}</div>
      <p>${r.text}</p>
      <button onclick="markDone('reading','${i}')">Mark done</button>
    </div>
  `).join("")}`;
}

// Speaking
function renderSpeaking(el){
  el.innerHTML = `<h2>🗣️ Speaking</h2>
  ${AI_BAYAN_DATA.speaking.map((s,i)=>`
    <div class="card-sm">
      <div><b>Grade ${s.grade}</b></div>
      <p>${s.prompt}</p>
      <button onclick="markDone('speaking','${i}')">Mark done</button>
    </div>
  `).join("")}
  <p><small>Tip: Use your phone's recorder to practice pronunciation.</small></p>`;
}

// Writing
function renderWriting(el){
  el.innerHTML = `<h2>✍️ Writing</h2>
  ${AI_BAYAN_DATA.writing.map((w,i)=>`
    <div class="card-sm">
      <div><b>Grade ${w.grade}</b></div>
      <p>${w.prompt}</p>
      <textarea id="w${i}" rows="4" style="width:100%;border-radius:12px;padding:8px"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button onclick="saveWriting(${i})">Save</button>
        <button onclick="markDone('writing','${i}')">Mark done</button>
      </div>
    </div>
  `).join("")}`;
}
function saveWriting(i){
  const val = $("#w"+i).value;
  S.progress.writing_texts = S.progress.writing_texts || {};
  S.progress.writing_texts[i] = val;
  saveProgress();
  alert("Saved!");
}

// Irregular verbs
function renderIrregular(el){
  el.innerHTML = `<h2>📑 Irregular Verbs</h2>
  <table>
    <tr><th>Infinitive</th><th>Past</th><th>Participle</th><th>RU</th></tr>
    ${AI_BAYAN_DATA.irregularVerbs.map(v=>`
      <tr><td>${v[0]}</td><td>${v[1]}</td><td>${v[2]}</td><td>${v[3]}</td></tr>
    `).join("")}
  </table>`;
}

// Clock
function renderClock(el){
  el.innerHTML = `<h2>🕒 Clock</h2>
  ${AI_BAYAN_DATA.clockTasks.map((t,i)=>`
    <div class="card-sm">
      <div class="badge">${t.time}</div>
      <p>${t.q}</p>
      <input id="ct${i}" placeholder="Your answer">
      <button onclick="checkClock(${i})">Check</button>
      <p id="cm${i}"></p>
    </div>
  `).join("")}`;
}
function checkClock(i){
  const val = ($("#ct"+i).value||"").trim().toLowerCase();
  const ok = AI_BAYAN_DATA.clockTasks[i].a.some(x=>x.toLowerCase()===val);
  const msg = $("#cm"+i);
  if(ok){ msg.textContent = "✅ Correct"; msg.className="ok"; markDone('clock',''+i); }
  else { msg.textContent = "❌ Try again"; msg.className="error"; }
}

// Dictionary
function renderDictionary(el){
  el.innerHTML = `<h2>📚 Dictionary</h2>
  <input id="dSearch" placeholder="Type English word" style="width:100%;padding:10px;border-radius:12px">
  <div id="dResults" class="grid" style="margin-top:10px"></div>`;
  $("#dSearch").addEventListener("input", ()=>{
    const q = $("#dSearch").value.toLowerCase();
    const res = AI_BAYAN_DATA.dictionary.filter(w=>w.en.startsWith(q));
    $("#dResults").innerHTML = res.map(w=>`<div class="card-sm"><b>${w.en}</b><div>${w.ru}</div></div>`).join("");
  });
}

// Chat
function renderChat(el){
  el.innerHTML = `<h2>🤖 AI Chat Bayan</h2>
    <div class="card-sm">
      <p>Hello, I am <b>Bayan</b> — your English buddy. Ask me about grammar, words, or practice a dialog.</p>
      <div id="chatBox" style="height:260px;overflow:auto;border:1px solid #f1c96b;border-radius:12px;padding:8px;background:#fff">
        <div><b>Bayan:</b> Hi ${S.user?.name || ""}! How can I help you today?</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input id="chatInput" placeholder="Type your message…" style="flex:1;padding:10px;border-radius:12px">
        <button onclick="sendChat()">Send</button>
      </div>
    </div>`;
}
function sendChat(){
  const box = $("#chatBox");
  const msg = $("#chatInput").value.trim();
  if(!msg) return;
  box.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  const reply = bayanRuleBased(msg);
  box.innerHTML += `<div><b>Bayan:</b> ${reply}</div>`;
  box.scrollTop = box.scrollHeight;
  $("#chatInput").value = "";
  markDone('chat','used');
}
function bayanRuleBased(text){
  const t = text.toLowerCase();
  if(t.includes("present simple")){
    return "Present Simple: use base verb (I/you/we/they play) and +s with he/she/it (He plays).";
  }
  if(t.includes("past simple")){
    return "Past Simple: add -ed to regular verbs, irregular have special forms (went, saw).";
  }
  if(t.includes("hello") || t.includes("hi")){
    return "Hello! Let's practice English. Ask me about grammar or vocabulary.";
  }
  if(t.includes("translate ")){
    const w = t.replace("translate ","").trim();
    const f = AI_BAYAN_DATA.dictionary.find(x=>x.en===w);
    return f ? `${f.en} → ${f.ru}` : "I don't have this word yet.";
  }
  return "I see. Try to ask about grammar or say 'translate apple'.";
}

// Journal
function renderJournal(){
  const el = $("#view");
  if(!el) return;
  const rows = [];
  for(const sec of Object.keys(S.progress)){
    if(typeof S.progress[sec] !== 'object') continue;
    const keys = Object.keys(S.progress[sec]);
    keys.forEach(k=>rows.push([sec,k]));
  }
  el.innerHTML = `<h2>🏅 Journal</h2>
    <p>Total completed items: <b>${rows.length}</b></p>
    <table><tr><th>Section</th><th>Item</th></tr>
      ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}
    </table>`;
}

