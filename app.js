/* Pulse: shell, routing, shared UI. Product views live in views.js; the narrative in story.js. */
(function(){
const P = window.PULSE, E = window.PE;
const $ = s => document.querySelector(s);
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const byId = id => P.suppliers.find(s => s.id === id) || P.portfolio.find(s => s.id === id);

const PERSONAS = [
  { id:"priya", home:"radar", group:"Procurement" },
  { id:"kavya", home:"inbox", group:"Supplier owners (business)" },
  { id:"arjun", home:"inbox", group:"Supplier owners (business)" },
  { id:"ananya", home:"inbox", group:"Supplier owners (business)" },
  { id:"sneha", home:"inbox", group:"Supplier owners (business)" },
  { id:"rahul", home:"verify", group:"Legal" },
  { id:"meera", home:"finance", group:"Finance" },
  { id:"supplier", home:"supplier", group:"External" }
];
const OWNERS = ["kavya","arjun","ananya","sneha"];
const NAV = {
  priya:[["radar","Renewal radar"],["contracts","Contracts"],["onboard","Onboard a shared drive"],["ask","Ask Pulse"],["add","Add a contract"],["log","Decisions & value"]],
  owner:[["inbox","My check-ins"],["mine","My suppliers"],["ask","Ask Pulse"]],
  rahul:[["verify","Verification queue"],["contracts","Contracts"],["onboard","Onboard a shared drive"],["ask","Ask Pulse"],["add","Add a contract"]],
  meera:[["finance","Commitments & invoices"],["contracts","Contracts"],["ask","Ask Pulse"],["log","Decisions & value"]],
  supplier:[["supplier","Messages from Vyom"]]
};
const navFor = p => NAV[p] || NAV.owner;

const GUIDE = [
  { p:"priya", r:"radar", t:"See every renewal that needs a decision, ranked", w:"Priya · Procurement" },
  { p:"priya", r:"onboard", t:"Watch a messy shared drive become the repository", w:"Priya · Procurement" },
  { p:"priya", r:"c-cleanspace", t:"Open CleanSpace: find the amendment trap", w:"Priya · Procurement" },
  { p:"rahul", r:"verify", t:"Confirm the 90-day notice clause", w:"Rahul · Legal" },
  { p:"kavya", r:"inbox", t:"Answer the 60-second check-in", w:"Kavya · supplier owner" },
  { p:"priya", r:"packet-cleanspace", t:"Review the packet and approve the notice", w:"Priya · Procurement" },
  { p:"supplier", r:"supplier", t:"See it from the supplier's side", w:"Supplier · external" },
  { p:"priya", r:"packet-lumen", t:"Lumen: the owner left, so reassign it", w:"Priya · Procurement" },
  { p:"meera", r:"finance", t:"Catch invoices that break the contract", w:"Meera · Finance" },
  { p:"priya", r:"ask", t:"Simulate a tariff shock", w:"Priya · Procurement" },
  { p:"priya", r:"add", t:"Test Pulse on a contract (yours or generated)", w:"Priya · Procurement" },
  { p:"priya", r:"log", t:"See decisions, value and the north star", w:"Procurement · Finance" }
];

/* ── routing ── */
function route(){ const r = (location.hash || "#story").slice(1); return r || "story"; }
function go(r, persona){ if(persona) setPersona(persona, true); if(location.hash === "#" + r) render(); else location.hash = r; }
function setPersona(id, silent){ if(E.S.persona !== id) switchedTo = id; E.S.persona = id; E.save(); if(!silent) render(); }
window.addEventListener("hashchange", render);

/* ── top bar ── */
function topbar(){
  const r = route(), story = r === "story", me = P.people[E.S.persona];
  const groups = [...new Set(PERSONAS.map(p => p.group))];
  return `<header class="top">
    <a class="brand" href="#story" aria-label="Pulse home">${logo()}<b>Pulse</b><span>a concept for Sirion</span></a>
    <nav class="modes" aria-label="Mode"><a href="#story" class="${story?"on":""}">Story</a><a href="#${homeOf(E.S.persona)}" class="${story?"":"on"}">Product</a></nav>
    <div class="grow"></div>
    <span class="datechip" title="All dates in the demo are calculated from this day">Demo date · ${E.fmtD(E.TODAY)}</span>
    ${story ? "" : `<div class="who" id="who"><button aria-haspopup="true" aria-label="Switch persona"><span class="av ${OWNERS.includes(E.S.persona)?"p":""}">${me.init}</span><span class="small" style="text-align:left;line-height:1.2">Viewing as<br><b style="font-weight:600">${h(me.name)}</b></span></button>
      <div class="menu" role="menu">${groups.map(g => `<div class="lbl">${g}</div>` + PERSONAS.filter(p => p.group === g).map(p => { const pp = P.people[p.id]; return `<button data-persona="${p.id}" class="${p.id===E.S.persona?"on":""}"><span class="av ${OWNERS.includes(p.id)?"p":""}">${pp.init}</span><span><b style="font-weight:600">${h(pp.name)}</b><br><span class="r">${h(pp.role)}</span></span></button>`; }).join("")).join("")}</div></div>
      <button class="btn-tour" id="tourBtn">Guided tour</button><button class="btn-reset" id="reset" title="Clear demo progress">Reset demo</button>`}
  </header>`;
}
const homeOf = p => (PERSONAS.find(x => x.id === p) || {}).home || "radar";
function logo(){ return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="#0d5e68"/><path d="M4 15h5l2.5-6 4 11 3-8 1.5 3H24" fill="none" stroke="#f5f6f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }

/* ── persona strip: who you're playing, their goal and frustration ── */
function strip(r){ const p = E.S.persona, me = P.people[p], inf = (P.personaInfo || {})[p]; if(!inf) return "";
  E.S.strip = E.S.strip || {}; if(!E.S.strip[p]){ E.S.strip[p] = r; E.save(); }
  const mini = E.S.strip[p] !== r;
  return `<div class="pstrip ${mini ? "mini" : ""} ${justSwitched ? "flash" : ""}"><span class="av ${OWNERS.includes(p) ? "p" : ""}">${me.init}</span><span><b>You're ${h(me.name.split(" ")[0] === "Supplier" ? "a supplier contact" : me.name.split(" ")[0])}</b> · ${h(me.role)}</span>
    <span class="pk"><span class="pl">Goal</span>${h(inf.goal)}</span><span class="pk"><span class="pl">Frustration today</span>${h(inf.pain)}</span>${mini ? `<button class="pkt" data-stripx aria-expanded="false">Goal and frustration</button>` : ""}${nextMini(r)}</div>`; }

/* ── side nav ── */
function sidebar(r){
  const p = E.S.persona, me = P.people[p];
  const counts = { radar: E.allRows().filter(x => x.c.days != null && x.c.days >= 0 && x.c.days <= 14 && !E.S.decisions[x.s.id]).length,
    verify: window.PV.verifyItems().length + (E.S.legal || []).filter(x => x.status === "open").length, inbox: window.PV.myThreads(p).filter(t => !E.S.checkins[t.id]).length };
  return `<aside class="side"><div class="pp"><span class="av lg ${OWNERS.includes(p)?"p":""}">${me.init}</span><span class="nm2"><b>${h(me.name)}</b><span>${h(me.role)}</span></span></div>
  ${navFor(p).map(([k, l]) => `<a class="nav ${r === k || r.startsWith(k.slice(0,3)+"-") && k==="contracts" ? "on" : ""}" href="#${k}">${l}${counts[k] ? `<span class="ct">${counts[k]}</span>` : ""}</a>`).join("")}
  <div class="sep">Live AI</div><div class="aip" id="aip">${aiPanel()}</div>
  ${guideList(r)}
  <p class="small muted" style="padding:16px 10px 0;font-size:12px;line-height:1.4">Concept prototype for a Sirion assessment. Not a Sirion product. All companies, people and contracts are fictional.</p>
  <div class="sep">Try another role</div>
  ${PERSONAS.filter(x => x.id !== p).map(x => `<a class="nav" href="#${x.home}" data-persona="${x.id}"><span class="av ${OWNERS.includes(x.id)?"p":""}" style="width:24px;height:24px;font-size:10px">${P.people[x.id].init}</span>${h(P.people[x.id].name.split(" ")[0])}</a>`).join("")}
  </aside>`;
}
const CLAUDE_URL = "https://claude.ai/artifact/QnBrTMmTd8EDzQWVsR9q3q#live";
const ON_CLAUDE = !!window.claude;
const TRY = [
  ["ask", "Ask your contracts anything"],
  ["read", "Read any contract"],
  ["challenge", "Challenge a recommendation"],
  ["polish", "Rewrite the supplier email"],
  ["slack", "Ask from the Slack check-in"]
];
function aiPanel(){
  const st = E.aiState;
  const badge = st === "live" ? `<span class="badge-ai">● Live AI on</span>` : st === "checking" ? `<span class="badge-ai off">Checking…</span>` : `<span class="badge-ai off">Live AI off · prepared answers</span>`;
  const line = st === "live" ? "New questions and new contracts get fresh AI answers. Try:" : "Live AI answers new questions and reads any contract. Without it, Pulse uses prepared answers. Try:";
  const btn = st === "live" || st === "checking" ? "" : ON_CLAUDE ? `<button class="btn ai sm aion" id="aion">Turn on live AI</button>` : `<a class="btn ai sm aion" href="${CLAUDE_URL}" target="_blank" rel="noopener">Open the live-AI version ↗</a>`;
  return `${badge}${btn}<button class="aitoggle" id="aitoggle" aria-expanded="${aiOpen}">${aiOpen ? "Hide" : "What can live AI do? ▸"}</button>${aiOpen ? `<p class="ailine">${line}</p><ul class="aitry">${TRY.map(([k, t]) => `<li><button data-try="${k}">${t}</button></li>`).join("")}</ul><button class="aiwhat" id="aiwhat">What changes with live AI?</button>` : ""}`;
}
function aiWhat(){
  const rows = [["Ask Pulse","Ask anything across all contracts, in your own words, with clause citations","Six prepared questions"],
    ["Add a contract","Reads any wording in any format and explains each term","Basic rules reader: standard clauses only"],
    ["Challenge a recommendation","A fresh critique of the recommendation","A prepared critique"],
    ["Polish the supplier email","Rewrites in your chosen tone, then checks no amount, date or clause changed","The prepared draft"],
    ["Owner's Slack check-in","The owner can ask a question about the contract","Not available"],
    ["Test-contract generator","Writes a scope of services for any industry you type","A generic description"]];
  modal(`<div class="row between" style="margin-bottom:6px"><h3>What changes with live AI</h3><button class="btn sec sm" data-close>Close</button></div>
    <p class="small muted" style="margin:0 0 12px">Dates, amounts, deadlines and checks are always calculated by code. Live AI matters when you bring something new.</p>
    <div class="scroll"><table><thead><tr><th>Where</th><th>With live AI</th><th>Without it</th></tr></thead><tbody>${rows.map(r => `<tr><td><b style="font-weight:600">${r[0]}</b></td><td class="small">${r[1]}</td><td class="small muted">${r[2]}</td></tr>`).join("")}</tbody></table></div>
    ${E.aiState === "live" ? "" : ON_CLAUDE ? `<p class="small" style="margin-top:12px">To turn it on: be signed in to Claude, then click <b>Turn on live AI</b> and choose <b>Continue</b> when Claude asks.</p>` : `<p class="small" style="margin-top:12px">This copy has no AI connection. <a href="${CLAUDE_URL}" target="_blank" rel="noopener">Open the live-AI version ↗</a>, sign in to Claude, and click Continue when asked.</p>`}`);
}
/* jump to the place where each live-AI feature lives, and point at it */
function tryAI(k){
  const T = { ask:["ask","priya","#askq"], read:["add","priya",'[data-tour="upload"]'], challenge:["packet-cleanspace","priya","#explainBtn"], polish:["packet-cleanspace","priya","#polish"], slack:["inbox","kavya","#askc"] }[k];
  if(!T) return; if(k === "slack" && window.PV.selectThread) window.PV.selectThread("kavya", "cleanspace");
  go(T[0], T[1]);
  setTimeout(() => { const el = document.querySelector(T[2]); if(!el) return; el.scrollIntoView({ block:"center", behavior:"smooth" });
    el.classList.add("tryhl"); setTimeout(() => el.classList.remove("tryhl"), 2600); if(el.tagName === "INPUT") setTimeout(() => el.focus({ preventScroll:true }), 500); }, 250);
}
function aiBadge(){ const st = E.aiState; return st === "live" ? `<span class="badge-ai" title="AI calls run live in this view">● Live AI on</span>` : st === "checking" ? `<span class="badge-ai off">Checking AI…</span>` : `<span class="badge-ai off" title="Live AI isn't connected here, so Pulse uses prepared answers">Live AI off · prepared answers</span>`; }

/* ── demo guide: a list in the sidebar + one floating "next step" button ── */
/* a step counts as done when its action is done, not when its page was opened */
function doneMap(){ const v = E.S.visited || {}, S = E.S, X = window.PX || {};
  const ok = [ !!v[0], !!X.obDone, !!v[2], !!S.verified["cleanspace.notice"], !!S.checkins.cleanspace, !!S.decisions.cleanspace,
    !!v[6] && Object.keys(S.decisions).length > 0, !!S.reassigned.lumen, Object.keys(S.finance || {}).length > 0, !!X.shock, !!S.readOne || (S.added || []).length > 0, !!v[11] && Object.keys(S.decisions).length > 0 ];
  const m = {}; ok.forEach((x, i) => { if(x) m[i] = 1; }); return m; }
function guideList(r){
  const done = doneMap(), curIdx = GUIDE.findIndex(g => g.r === r && g.p === E.S.persona);
  const n = GUIDE.filter((g, i) => done[i]).length;
  return `<div class="sep">Demo path · ${n}/${GUIDE.length}</div><div class="sguide"><ol>${GUIDE.map((g, i) => `<li data-g="${i}" class="${done[i] ? "done" : ""} ${i === curIdx ? "cur" : ""}"><span class="n">${done[i] ? "✓" : i + 1}</span><span>${h(g.t)}</span></li>`).join("")}</ol></div>`;
}
function nextStep(r){
  const done = doneMap(), curIdx = GUIDE.findIndex(g => g.r === r && g.p === E.S.persona);
  let nx = GUIDE.findIndex((g, i) => !done[i] && i !== curIdx); if(nx < 0) return null; return { nx, g:GUIDE[nx], n:GUIDE.filter((g, i) => done[i]).length };
}
function guide(r){
  const x = nextStep(r);
  if(!x) return `<div class="nextbar"><div><span class="k">Demo path complete · ${GUIDE.length} of ${GUIDE.length}</span><b>You've seen every step. The Story has the why and the evidence.</b></div><button class="btn pri" data-g="-1">Back to the story →</button></div>`;
  return `<div class="nextbar"><div><span class="k">Demo path · ${x.n} of ${GUIDE.length} done · next is step ${x.nx + 1}, as ${h(x.g.w)}</span><b>${h(x.g.t)}</b></div><button class="btn pri" data-g="${x.nx}">Continue →</button></div>`;
}
function nextMini(r){ const x = nextStep(r); if(!x) return ""; return `<button class="nextmini" data-g="${x.nx}" title="${h(x.g.t)}"><span>Demo ${x.n}/${GUIDE.length}</span><b>Next: step ${x.nx + 1} →</b></button>`; }
function markGuide(r){ const i = GUIDE.findIndex(g => g.r === r && g.p === E.S.persona); if(i >= 0 && !E.S.visited[i]){ E.S.visited[i] = 1; E.save(); } }

/* ── modal / toast ── */
function modal(html){ close(); const d = document.createElement("div"); d.className = "scrim"; d.id = "scrim"; d.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  d.addEventListener("click", e => { if(e.target === d || e.target.closest("[data-close]")) close(); }); document.body.appendChild(d); return d; }
function close(){ const d = $("#scrim"); if(d) d.remove(); }
let tt; function toast(t){ let el = $("#toast"); if(!el){ el = document.createElement("div"); el.className = "toast"; el.id = "toast"; document.body.appendChild(el); } el.textContent = t; el.style.display = "block"; clearTimeout(tt); tt = setTimeout(() => el.style.display = "none", 4200); }
document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });

/* show me where it says this */
function docHTML(docId, quote){ const d = E.DOCS[docId]; let t = h(d.text);
  if(quote){ const q = h(quote); const i = t.indexOf(q); if(i >= 0) t = t.slice(0, i) + `<mark id="hl">${q}</mark>` + t.slice(i + q.length); }
  return t; }
function showClause(docId, quote, cl){ const d = E.DOCS[docId];
  modal(`<div class="row between" style="margin-bottom:10px"><div><div class="eyebrow">${h(d.type)} · effective ${E.fmtD(d.effective)}</div><h3>${h(d.title)}</h3></div><button class="btn sec sm" data-close>Close</button></div>
    ${cl ? `<p class="small muted">Clause ${h(cl)} · the highlighted text is what Pulse read.</p>` : ""}
    <div class="card doc" style="max-height:60vh">${docHTML(docId, quote)}</div>`);
  setTimeout(() => { const m = $("#hl"); if(m) m.scrollIntoView({ block:"center" }); }, 30); }

/* ── render ── */
let lastRoute = null;
/* live AI couldn't start: say exactly what to do */
function signIn(){
  /* Claude's page decides sign-in when it loads, so after signing in the page must load again: a fresh tab is the reliable way */
  const d = modal(`<div class="signin"><div class="si-arrow" aria-hidden="true">↗ Claude's own sign-in is also at the top right of this page</div>
    <h3>Live AI needs you signed in to Claude</h3>
    <ol class="si-steps">
      <li><b>Sign in to Claude.</b> <a class="btn ai sm" href="https://claude.ai/login" target="_blank" rel="noopener">Sign in to Claude ↗</a><span class="small muted">Opens in a new tab. Already signed in? Skip to step 2.</span></li>
      <li><b>Open Pulse again in a fresh tab.</b> <a class="btn pri sm" href="${CLAUDE_URL}" target="_blank" rel="noopener">Open Pulse with live AI ↗</a><span class="small muted">This page was loaded before you signed in, so it can't see your sign-in. A fresh tab can. (Or reload this whole page with your browser's reload button.)</span></li>
      <li><b>Choose “Continue”</b> when Claude asks to let Pulse use it.</li></ol>
    <div class="row" style="gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn sec" id="si-retry">Try again in this tab</button><button class="btn sec" data-close>Continue without live AI</button></div>
    <p class="small muted" style="margin:12px 0 0">Every step of the demo still works without live AI, using prepared answers.</p></div>`);
  const r = d.querySelector("#si-retry"); if(r) r.onclick = async () => { r.disabled = true; r.textContent = "Asking Claude…"; const ok = await E.retryAI();
    if(ok){ close(); toast("Live AI is on. Open “What can live AI do?” for ideas to try."); }
    else { r.disabled = false; r.textContent = "Still not connected: use step 2"; } };
}
function bindAI(){
  const tg = $("#aitoggle"); if(tg) tg.onclick = () => { aiOpen = !aiOpen; const ap = $("#aip"); if(ap){ ap.innerHTML = aiPanel(); bindAI(); } };
  document.querySelectorAll("[data-try]").forEach(b => b.onclick = () => tryAI(b.dataset.try));
  const w = $("#aiwhat"); if(w) w.onclick = aiWhat;
  const on = $("#aion"); if(on && on.tagName === "BUTTON") on.onclick = async () => {
    on.disabled = true; on.textContent = "Asking Claude…";
    const ok = await E.retryAI();
    if(ok) toast("Live AI is on. Open “What can live AI do?” for ideas to try."); else signIn();
  };
}
let switchedTo = null, justSwitched = false, aiOpen = false;
function render(){
  const r = route(), app = $("#app");
  if(lastRoute !== null && r !== lastRoute && !(window.PT && window.PT.on)) close();
  if(r !== "story"){
    const before = E.S.persona;
    const pid = PERSONAS.find(p => p.home === r);
    const allowed = navFor(E.S.persona).some(([k]) => k === r) || r.startsWith("c-") || (r === "mine" && OWNERS.includes(E.S.persona));
    if(!allowed && pid) { E.S.persona = pid.id; E.save(); }
    else if(!allowed && !r.startsWith("packet-")) { E.S.persona = "priya"; E.save(); }
    if(r.startsWith("packet-") && E.S.persona !== "priya"){ E.S.persona = "priya"; E.save(); }
    if(before !== E.S.persona) switchedTo = E.S.persona;
    justSwitched = !!switchedTo; 
    markGuide(r);
  }
  document.title = r === "story" ? "Pulse: contract renewals, decided on time" : "Pulse";
  if(r === "story"){ app.innerHTML = topbar() + window.PS.render(); window.PS.bind(); }
  else { app.innerHTML = topbar() + `<div class="shell">${sidebar(r)}<main class="main" id="main">${strip(r)}${window.PV.view(r)}${guide(r)}</main></div>`; window.PV.bind(r); }
  const from = lastRoute;
  if(switchedTo){ const m = P.people[switchedTo]; if(!(window.PT && window.PT.on) && from && from !== "story") toast(`Now viewing as ${m.name.split(" ")[0] === "Supplier" ? "the supplier" : m.name} · ${m.role.split(" · ")[0]}`); switchedTo = null; }
  bindShell(); if(r !== lastRoute) window.scrollTo(0, 0); lastRoute = r;
  /* offer the tour at the moment of choosing the product: on every Story → Product switch, or a first direct visit */
  const enteringProduct = r !== "story" && r === homeOf(E.S.persona) && (from === "story" || (from === null && !E.S.tourSeen));
  if(window.PT){ if(enteringProduct && !window.PT.on && !document.getElementById("scrim")) setTimeout(() => { if(!window.PT.on) window.PT.welcome(); }, 250); window.PT.after(); }
}
function bindShell(){
  const who = $("#who"); if(who){ who.querySelector("button").onclick = e => { e.stopPropagation(); who.classList.toggle("open"); }; document.addEventListener("click", () => who.classList.remove("open"), { once:true }); }
  document.querySelectorAll("[data-persona]:not([data-goto])").forEach(b => b.addEventListener("click", e => { e.preventDefault(); const id = b.dataset.persona; if(E.S.persona !== id) switchedTo = id; E.S.persona = id; E.save(); const home = homeOf(id); const r = route();
    const keep = navFor(id).some(([k]) => k === r); go(keep ? r : home); }));
  bindAI();
  const sx = document.querySelector("[data-stripx]"); if(sx) sx.onclick = () => { const st = sx.closest(".pstrip"); const open = st.classList.toggle("open"); sx.setAttribute("aria-expanded", open); sx.textContent = open ? "Hide" : "Goal and frustration"; };
  const tb = $("#tourBtn"); if(tb) tb.onclick = () => window.PT.start(0);
  const rs = $("#reset"); if(rs) rs.onclick = () => { modal(`<h3>Reset the demo?</h3><p class="muted" style="margin-top:8px">This clears everything you did in this browser: check-ins, Legal confirmations, decisions, supplier replies, the shared-drive onboarding, the tariff scenario, and any contracts you generated, read or added. The demo starts again from 22 Nov 2026.</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn sec" data-close>Cancel</button><button class="btn pri" id="doreset">Reset</button></div>`); $("#doreset").onclick = () => { E.reset(); close(); go("radar", "priya"); toast("Demo reset."); }; };
  document.querySelectorAll(".sguide li,.nextbar [data-g],.nextmini").forEach(li => li.onclick = () => { const i = +li.dataset.g; if(i < 0){ go("story"); return; } const s = GUIDE[i]; go(s.r, s.p); });
  document.querySelectorAll("[data-where]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); const [d, i] = b.dataset.where.split("|"); const s = P.suppliers.find(x => x.terms.some(t => t.doc === d)); const t = s ? s.terms[+i] : null; showClause(d, t ? t.q : null, t ? t.cl : null); }));
}
document.addEventListener("ai-state", () => { document.querySelectorAll("#aib,.aib").forEach(el => el.innerHTML = aiBadge()); const ap = document.getElementById("aip"); if(ap){ ap.innerHTML = aiPanel(); bindAI(); } });

window.PA = { h, $, byId, go, toast, modal, close, showClause, docHTML, render, OWNERS, PERSONAS, aiBadge, setPersona, GUIDE };
/* arriving from the GitHub copy's "Open the live-AI version": skip the Story and the welcome, land on the product */
let fromCopy = false;
/* every full page load (new visit or reload) starts on the Story, even if the address carries an old page tag (e.g. #radar); only the live-AI link (#live) and Back/Forward skip it */
(function(){ let nav = ""; try { const e = performance.getEntriesByType("navigation")[0]; nav = e ? e.type : ""; } catch(e){}
  if((nav === "navigate" || nav === "reload") && location.hash && location.hash !== "#live" && location.hash !== "#story"){ try { history.replaceState(null, "", location.pathname + location.search + "#story"); } catch(e){ location.hash = "story"; } } })();
/* deep links for the submission note: ?s=<section id> opens the Story at that section, ?s=product opens the product */
let deepSection = null;
(function(){ let sp = null; try { sp = new URLSearchParams(location.search).get("s"); } catch(e){}
  if(!sp || !/^[a-z]+$/.test(sp)) return;
  const tgt = sp === "product" ? "#radar" : "#story"; if(sp !== "product") deepSection = sp;
  try { history.replaceState(null, "", location.pathname + tgt); } catch(e){ location.hash = tgt.slice(1); } })();
if(location.hash === "#live"){ fromCopy = true; E.S.tourSeen = 1; E.save(); try { history.replaceState(null, "", location.pathname + location.search + "#radar"); } catch(e){ location.hash = "radar"; } }
document.addEventListener("DOMContentLoaded", () => { render();
  if(deepSection){ const jump = () => { const el = document.getElementById(deepSection); if(el) el.scrollIntoView(); }; setTimeout(jump, 150); try { document.fonts.ready.then(() => setTimeout(jump, 200)); } catch(e){} }
  if(fromCopy){ aiOpen = true; { const ap = $("#aip"); if(ap){ ap.innerHTML = aiPanel(); bindAI(); } } const hl = () => { const ap = $("#aip"); if(ap){ ap.classList.add("tryhl"); setTimeout(() => ap.classList.remove("tryhl"), 3200); } };
    E.aiReady.then(() => { hl(); toast(E.aiState === "live" ? "You're on the live-AI version, and live AI is on. Try the shortcuts in the left panel." : "You're on the live-AI version. Click “Turn on live AI” in the left panel to start."); }); } });
})();
