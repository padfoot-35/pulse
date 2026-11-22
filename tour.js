/* Pulse: guided tour: one spotlight at a time, hands-on steps, role switches announced */
(function(){
const E = window.PE;
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ROLE = { priya:"Priya · Procurement", rahul:"Rahul · Legal", kavya:"Kavya · supplier owner", meera:"Meera · Finance", supplier:"Supplier · external" };

const BASE = [
  { r:"radar", p:"priya", t:'.kpi', title:"You're Priya, in Procurement",
    body:"Six people look after 2,500 suppliers at Vyom. This number is what renews automatically in the next 14 days unless someone acts." },
  { r:"radar", p:"priya", t:'tr.click', title:"Ranked by money and days left",
    body:"Each notice deadline is calculated from the contract itself. The chips say why a renewal needs attention. CleanSpace has 8 days left, and an amendment changed its notice period." },
  { r:"onboard", p:"priya", t:'#obgo', title:"Where the repository comes from", act:() => { const b = q('#obgo'); if(b && !window.PX.obDone) b.click(); },
    body:"Vyom has no contract system, just folders. Click <b>Start onboarding</b> and watch Pulse sort 15 messy files (duplicates, emails, a scan, a template) into supplier families with cited terms. Day one, no data entry.",
    until:() => window.PX && window.PX.obDone, wait:"Click “Start onboarding” and watch" },
  { r:"c-cleanspace", p:"priya", t:'.callout.bad', title:"The deadline nobody saw",
    body:"The team's Excel tracker still says 30 days' notice. A June 2025 amendment changed it to 90. Trusting the tracker would miss the real deadline by 60 days, and ₹1.86 Cr would renew for another year." },
  { r:"c-cleanspace", p:"priya", t:'[data-tour="notice"]', title:"Every fact shows its source", act:() => { const b = q('[data-tour="notice"] .where'); if(b) b.click(); },
    body:"Click <b>Show me where it says this</b>. The amendment opens on the right with the exact words highlighted. The purple chip means the AI is only 78% sure, so Legal checks it. Until then Pulse uses the stricter date." },
  { r:"verify", p:"rahul", t:'[data-tour="vitem"]', title:"Now you're Rahul, in Legal", act:() => { const b = q('[data-ok="cleanspace.notice"]'); if(b) b.click(); }, role:true,
    body:"Legal sees only what the AI isn't sure about, never the whole pile. Compare the two clauses, then click <b>Confirm 90 days</b>.",
    until:() => !!E.S.verified["cleanspace.notice"], wait:"Click “Confirm 90 days” to continue" },
  { r:"inbox", p:"kavya", t:'.phone', title:"Now you're Kavya, who owns CleanSpace", act:async () => { const c = sel => q(sel) && q(sel).click(); c('[data-need="keep"]'); await w8(900); c('[data-rate="2"]'); await w8(900); const i = q('#cmt'); if(i){ i.value = 'Kharadi washrooms are often not cleaned on time'; i.dispatchEvent(new Event('input')); } await w8(900); c('#sendci'); }, role:true,
    body:"Kavya never logs in to a contract system. Pulse messages her in Slack with two questions. Answer them, then press <b>Send to Procurement</b>. Tip: rate the service low, she's unhappy with it.",
    until:() => !!E.S.checkins.cleanspace, wait:"Answer both questions and send" },
  { r:"inbox", p:"kavya", t:'[data-tour="mirror"]', title:"Her answer lands with Procurement",
    body:"Here the two experiences connect. Kavya gives the business view in 60 seconds. Priya gets it inside her renewal packet, with no chasing." },
  { r:"packet-cleanspace", p:"priya", t:'.opt.rec', title:"Back to Priya: decide", role:true,
    body:"Pulse lays out the options. Its recommendation uses the contract terms, Kavya's answer and the service data. The money amounts are calculated, not made up by the AI." },
  { r:"packet-cleanspace", p:"priya", t:'[data-tour="draft"]', title:"A draft that follows the contract", act:async () => { const a = q('#approve'); if(a) a.click(); await w8(1600); const c = q('#confirmSend'); if(c) c.click(); },
    body:"The email cites the right clauses and goes to the address the contract requires. The checklist confirms the deadline and approval limit. Click <b>Approve and send</b>; nothing goes out without a human click.",
    until:() => !!E.S.decisions.cleanspace, wait:"Click “Approve and send”, then confirm" },
  { r:"supplier", p:"supplier", t:'.mailbody', title:"Now you're the supplier", role:true,
    body:"CleanSpace receives a clear message with the exact contract clauses attached, so there's no argument about what was agreed. They can acknowledge, propose an alternative or ask a question, and the reply lands back in Priya's packet." },
  { r:"packet-lumen", p:"priya", t:'[data-tour="owner"]', title:"When nobody owns a contract", act:() => { const b = q('#reassign'); if(b) b.click(); },
    body:"Lumen's buyer left in August, so its renewal quote went to an inactive inbox. Pulse suggests a new owner from who actually uses the tool. Click <b>Make Arjun the owner</b>.",
    until:() => !!E.S.reassigned.lumen, wait:"Click “Make Arjun the owner…”" },
  { r:"finance", p:"meera", t:'[data-tour="exceptions"]', title:"Now you're Meera, in Finance", role:true,
    body:"Accounts payable usually checks an invoice against the purchase order. Pulse also checks it against the contract, and catches a staffing agency billing the wrong rate and a surcharge the contract doesn't allow." },
  { r:"ask", p:"priya", t:'.shockc', title:"When the world changes", act:() => { const b = q('#shockgo'); if(b) b.click(); },
    body:"Tariffs and trade rules keep shifting. Click <b>Run the scenario</b>: Pulse checks every contract's price-adjustment terms and shows who can pass costs on to Vyom, and on what terms, in seconds.",
    until:() => window.PX && window.PX.shock, wait:"Click “Run the scenario”" },
  { r:"add", p:"priya", t:'.gencard', title:"Try it on any contract",
    body:"Upload your own contract, or generate a realistic test one for any industry and upload the PDF. Pulse reads it (live AI, or a basic rules reader when AI is off), checks every quote, scores itself against the answer key, runs a health check, and can add it to the live workflow." },
  { r:"log", p:"priya", t:'.kpi', title:"The north star",
    body:"Did someone make a deliberate decision before each deadline? That is what stops silent renewals. That's the loop. Explore freely, or open <b>Story</b> for the why and the evidence.", last:true }
];
let STEPS = BASE, custom = false;

let on = false, i = 0, layer, card, ring, auto = false, timer = null;
const q = s => document.querySelector("#main " + s) || document.querySelector(s);
const w8 = ms => new Promise(r => setTimeout(r, ms));
function el(){ if(layer) return; layer = document.createElement("div"); layer.id = "tourLayer";
  layer.innerHTML = `<div class="tring" id="tring"></div><div class="tcard" id="tcard" role="dialog" aria-live="polite"></div>`;
  document.body.appendChild(layer); ring = layer.querySelector("#tring"); card = layer.querySelector("#tcard");
  window.addEventListener("scroll", place, { passive:true }); window.addEventListener("resize", place); }

function watch(){ auto = true; start(0); }
function start(from = 0){ el(); if(from === 0){ E.reset(); if(window.PX) window.PX.reset(); STEPS.forEach(x => x._armed = false); } on = true; i = from; E.S.tourSeen = 1; E.save(); layer.style.display = "block"; show(); }
function stop(){ STEPS = BASE; custom = false; auto = false; clearTimeout(timer); on = false; if(layer) layer.style.display = "none"; document.body.classList.remove("touring"); window.PA.render(); }
function show(){
  const s = STEPS[i]; document.body.classList.add("touring"); if(s.pre) s.pre();
  const r = (location.hash || "").slice(1);
  if(r !== s.r || E.S.persona !== s.p){ window.PA.go(s.r, s.p); return; }   /* after() re-enters once rendered */
  paint();
}
function stepLabel(s){ if(custom) return `${i + 1} of ${STEPS.length}`; const G = window.PA.GUIDE || [], ch = G.findIndex(g => g.r === s.r && g.p === s.p); if(ch < 0) return `${i + 1} of ${STEPS.length}`;
  const same = STEPS.filter(x => x.r === s.r && x.p === s.p), k = same.indexOf(s) + 1;
  return `Step ${ch + 1} of ${G.length}${same.length > 1 ? ` · part ${k} of ${same.length}` : ""}`; }
function paint(){
  const s = STEPS[i], done = s.until ? s.until() : true;
  card.innerHTML = `<div class="row between" style="gap:8px"><span class="chip ${s.role ? "purple" : "teal"}">${h(ROLE[s.p] || (window.PULSE.people[s.p] ? window.PULSE.people[s.p].name.split(" ")[0] + " · supplier owner" : ""))}</span><span class="small muted">${stepLabel(s)}</span></div>
    <h3 style="margin:10px 0 6px">${h(s.title)}</h3><p class="small ink2" style="margin:0">${s.body}</p>
    ${s.until ? `<div class="twait ${done ? "ok" : ""}">${done ? "✓ Done" : h(s.wait)}</div>` : ""}
    ${auto ? `<div class="twatch"><span class="tbar"><span style="animation-duration:${dwell(s)}ms"></span></span><span class="small">Playing automatically</span><button class="btn ghost sm" id="tpause">Pause and take over</button></div>` : ""}
    <div class="row between" style="margin-top:14px"><button class="btn ghost sm" id="tskip">${s.last ? "Close" : "Exit tour"}</button>
      <span class="row" style="gap:6px">${i ? `<button class="btn sec sm" id="tback">Back</button>` : ""}<button class="btn pri sm" id="tnext">${s.last ? "Finish" : s.until && !done ? "Skip step" : "Next"}</button></span></div>`;
  card.querySelector("#tskip").onclick = () => stop();
  const pz = card.querySelector("#tpause"); if(pz) pz.onclick = () => { auto = false; clearTimeout(timer); paint(); };
  card.querySelector("#tnext").onclick = () => next();
  const b = card.querySelector("#tback"); if(b) b.onclick = () => { i--; show(); };
  const t = target(); if(t){ const rc = t.getBoundingClientRect(); if(rc.top < 80 || rc.bottom > innerHeight - 40) t.scrollIntoView({ block:"center" }); }
  place();
  if(auto && !s._armed){ s._armed = true; clearTimeout(timer); const me = i;
    timer = setTimeout(async () => { if(!auto || i !== me) return; s._armed = false;
      if(s.act && !(s.until && s.until())){ await s.act(); }
      if(!s.until){ if(auto && i === me) next(); } }, dwell(s)); }
}
function dwell(s){ return Math.min(9000, 3200 + s.body.replace(/<[^>]+>/g, "").length * 22); }
function target(){ const s = STEPS[i]; return s ? document.querySelector("#main " + s.t) || document.querySelector(s.t) : null; }
function place(){
  if(!on || !card) return; const t = target();
  if(!t){ ring.style.display = "none"; card.style.cssText = ""; card.classList.add("tfloat"); return; }
  card.classList.remove("tfloat");
  const r = t.getBoundingClientRect(), pad = 6;
  ring.style.display = "block";
  Object.assign(ring.style, { top:(r.top - pad) + "px", left:(r.left - pad) + "px", width:(r.width + pad*2) + "px", height:(Math.min(r.height, innerHeight - 40) + pad*2) + "px" });
  if(innerWidth < 760){ card.style.cssText = ""; card.classList.add("tfloat"); return; }
  const cw = 340; card.style.cssText = `width:${cw}px;top:-9999px;left:0`; const ch = card.offsetHeight || 230, M = 14;
  let top = null, left = Math.min(Math.max(16, r.left), innerWidth - cw - 16);
  if(r.bottom + M + ch < innerHeight - 10) top = r.bottom + M;                 /* below */
  else if(r.top - M - ch > 70) top = r.top - M - ch;                           /* above */
  else if(r.left - cw - M > 10){ left = r.left - cw - M; top = Math.min(Math.max(80, r.top), innerHeight - ch - 12); }   /* left side */
  else if(innerWidth - r.right - cw - M > 10){ left = r.right + M; top = Math.min(Math.max(80, r.top), innerHeight - ch - 12); } /* right side */
  if(top == null){ card.style.cssText = ""; card.classList.add("tfloat"); return; }
  card.style.cssText = `top:${top}px;left:${left}px;width:${cw}px`;
}
function next(){ STEPS.forEach(x => x._armed = false); if(STEPS[i].last){ const wasAuto = auto; stop(); if(custom) window.PA.toast("That's your contract, end to end."); else if(wasAuto) window.PA.toast("That was the full loop. Try it yourself, or open Story for the evidence."); else window.PA.toast("Tour complete. Everything is yours to explore."); return; } i++; show(); }

/* called by the app after every render */
let lastDone = false;
function after(){
  if(!on) return; const s = STEPS[i]; const r = (location.hash || "").slice(1);
  if(r === "story" || r === ""){ on = false; if(layer) layer.style.display = "none"; document.body.classList.remove("touring"); return; }
  if(r !== s.r) return;   /* user wandered off: keep the card but don't fight them */
  setTimeout(() => { paint(); const d = s.until && s.until(); if(d && !lastDone){ lastDone = true; setTimeout(() => { lastDone = false; if(on && STEPS[i] === s) next(); }, 1100); } }, 30);
}
function welcome(){
  window.PA.modal(`<div class="eyebrow">Product demo · about 5 minutes</div><h2 style="font-size:28px">Follow one renewal from shared drive to supplier</h2>
    <p class="ink2" style="margin-top:12px">Vyom Technologies has 2,500 suppliers and no contract system. A housekeeping contract worth ₹1.86 Cr is about to renew itself, and the real deadline is 8 days away. You'll play each person involved:</p>
    <div class="grid g2" style="margin:14px 0">${[["PN","Priya","Procurement: sees what's due, decides"],["RS","Rahul","Legal: checks what the AI isn't sure of"],["KR","Kavya","Supplier owner: answers two questions"],["MI","Meera","Finance: pays what the contract says"],["SC","The supplier","Receives a clear, clause-backed message"]].map(([a, n, d]) => `<div class="row" style="gap:10px;align-items:flex-start;flex-wrap:nowrap"><span class="av ${n === "Kavya" ? "p" : ""}">${a}</span><span class="small"><b>${n}</b><br><span class="muted">${d}</span></span></div>`).join("")}</div>
    <div class="row" style="justify-content:flex-end;margin-top:8px;gap:8px"><button class="btn ghost" id="wfree">Explore on my own</button><button class="btn sec" id="wwatch">▶ Watch it play (about 2 min)</button><button class="btn pri" id="wgo">Take the guided tour</button></div>`);
  document.getElementById("wwatch").onclick = () => { window.PA.close(); watch(); };
  document.getElementById("wgo").onclick = () => { window.PA.close(); start(0); };
  document.getElementById("wfree").onclick = () => { E.S.tourSeen = 1; E.save(); window.PA.close(); };
}
/* follow one contract the person added, through every role */
function follow(id){
  const P = window.PULSE, sp = P.suppliers.find(x => x.id === id); if(!sp) return;
  const o = E.ownerOf(sp), first = o.name.split(" ")[0], q0 = window.PV.verifyItems().filter(x => x.s.id === id).length, hasQ = q0 > 0;
  const c = E.clock(sp);
  const st = [
    { r:"radar", p:"priya", t:`tr[data-open="${id}"]`, title:"Your contract is on the radar", body:`<b>${h(sp.name)}</b> is now ranked with every other renewal: notice due <b>${E.fmtD(c.deadline)}</b>, ${c.days} days away. The chips say why it needs attention.` },
    { r:"c-" + id, p:"priya", t:'[data-tour="notice"]', title:"Every term is cited", body:"Each line links to the exact words in your document. Click <b>Show me where it says this</b> to see the clause highlighted.", act:() => { const b = document.querySelector('[data-tour="notice"] .where'); if(b) b.click(); } }
  ];
  if(hasQ) st.push({ r:"verify", p:"rahul", t:`[data-sid="${id}"]`, title:"Legal checks only what's uncertain", role:true, body:"Rahul sees just the terms Pulse wasn't sure about in your contract. Confirm one to continue.",
    act:() => { const b = document.querySelector(`[data-sid="${id}"] [data-ok]`); if(b) b.click(); }, until:() => window.PV.verifyItems().filter(x => x.s.id === id).length < q0, wait:"Click Confirm to continue" });
  st.push({ r:"inbox", p:o.id, t:".phone", title:`${first} answers in 60 seconds`, role:true, pre:() => window.PV.selectThread(o.id, id), body:`${h(first)} owns this supplier and never logs in to a contract system. Answer the two questions, then press <b>Send to Procurement</b>.`,
    act:async () => { const c2 = sel => document.querySelector(sel) && document.querySelector(sel).click(); c2('[data-need="keep"]'); await w8(800); c2('[data-rate="3"]'); await w8(800); c2('#sendci'); }, until:() => !!E.S.checkins[id], wait:"Answer both questions and send" });
  st.push({ r:"packet-" + id, p:"priya", t:'[data-tour="draft"]', title:"Priya decides", role:true, body:"Options with computed values, a draft that cites your contract's clauses, and a checklist. Click <b>Approve and send</b>, then confirm.",
    act:async () => { const a = document.querySelector('#approve'); if(a) a.click(); await w8(1400); const cf = document.querySelector('#confirmSend'); if(cf) cf.click(); }, until:() => !!E.S.decisions[id], wait:"Click “Approve and send”, then confirm" });
  st.push({ r:"supplier", p:"supplier", t:".mailbody", title:"What the supplier receives", role:true, pre:() => window.PV.selectMail(id), body:"A clear message with the clauses attached. Their reply lands back in Priya's packet." });
  st.push({ r:"log", p:"priya", t:".kpi", title:"Counted in the north star", body:"A deliberate decision, made before the deadline. That's the number Pulse exists to move.", last:true });
  el(); STEPS = st; custom = true; auto = false; on = true; i = 0; E.S.tourSeen = 1; E.save(); layer.style.display = "block"; show();
}
window.PT = { start, stop, after, welcome, watch, follow, get on(){ return on; }, get auto(){ return auto; } };
})();
