/* Pulse: onboarding a messy shared drive (the repository being built) and the tariff-shock event */
(function(){
const P = window.PULSE, E = window.PE;
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ── 1. Onboard a shared drive ── */
const FILES = [
  ["Vendor contracts/CleanSpace_FSA_signed_final.pdf","CS-MSA"],["Vendor contracts/CleanSpace_FSA_signed_final (1).pdf","dup"],
  ["Admin/Pune/Amendment 1 - CleanSpace Hinjewadi.pdf","CS-AMD1"],["Admin/Pune/Security/Sentinel SSA 2025.pdf","SG-MSA"],
  ["Eng/Vendors/TalentBridge MSA 2024.docx","TB-MSA"],["Eng/Vendors/TB_ratecard_v3_FINAL.pdf","TB-RATE"],["Arjun inbox/TalentBridge rate revision.eml","TB-LTR"],
  ["Analytics/Lumen order form LA-2025-0117.pdf","LU-OF"],["Rohit (archived)/Lumen renewal quote.eml","LU-QUOTE"],
  ["Ops/Logistics/Northstar rate contract 2026.pdf","NS-RC"],["Ops/Logistics/Northstar surcharge notice.pdf","NS-LTR"],
  ["Marketing/Agency/Brightwave retainer.pdf","BW-RET"],["Marketing/Agency/SOW1 brand refresh.pdf","BW-SOW"],
  ["Legal/Templates/NDA_template_v7.docx","tpl"],["Scans/scan_0043.pdf","scan"]
];
let ob = { running:false, done:false };
function onboard(){
  return `<div class="pagehead"><div><div class="eyebrow">Repository · onboarding</div><h1>From a messy shared drive to trusted terms</h1>
    <p>This is how Vyom's repository gets built on day one: no migration project, no data entry. Point Pulse at the folders where contracts actually live, then watch it sort, group, read and flag them.</p></div></div>
  <div class="grid g2" style="align-items:start">
    <div class="card pad"><div class="row between"><h3>Google Drive · 15 files found</h3><button class="btn pri" id="obgo" ${ob.running ? "disabled" : ""}>${ob.done ? "Run again" : ob.running ? "Reading…" : "Start onboarding"}</button></div>
      <p class="small muted" style="margin:6px 0 10px">Real folder chaos: duplicates, emails, a scan, a template.</p>
      <div id="oblist">${FILES.map(([f], i) => `<div class="obf" id="obf${i}"><span class="obi" id="obi${i}">·</span><span class="small" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${h(f)}</span><span class="small muted" id="obt${i}" style="margin-left:auto;white-space:nowrap"></span></div>`).join("")}</div></div>
    <div class="card pad"><h3>What Pulse built</h3><div id="obsteps" class="obsteps">${["Read every file","Recognise what each document is","Group into supplier families","Extract and cite key terms","Flag what a human must check"].map((t, i) => `<div class="obs" id="obs${i}"><span class="n">${i + 1}</span>${t}</div>`).join("")}</div>
      <div id="obfam" style="margin-top:14px"></div><div id="obsum"></div></div></div>
  <p class="small muted" style="margin-top:12px">Simulation using the demo contracts, so it runs the same for every reviewer. To see live AI read a contract you choose, use <a href="#add">Add a contract</a>.</p>`;
}
function runOnboard(){
  ob.running = true; ob.done = false; window.PA.render();
  const step = n => { document.querySelectorAll(".obs").forEach((e, i) => e.classList.toggle("on", i <= n)); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async () => {
    step(0);
    for(let i = 0; i < FILES.length; i++){ const el = document.getElementById("obi" + i); if(el){ el.textContent = "✓"; el.className = "obi ok"; } await wait(90); }
    step(1);
    for(let i = 0; i < FILES.length; i++){ const id = FILES[i][1], t = document.getElementById("obt" + i); if(!t) return;
      t.innerHTML = id === "dup" ? '<span class="chip amber">Duplicate · skipped</span>' : id === "tpl" ? '<span class="chip line">Template · not a contract</span>' : id === "scan" ? '<span class="chip purple">Scanned · low confidence</span>' : `<span class="chip teal">${h(E.DOCS[id].type)}</span>`; await wait(70); }
    step(2); await wait(300);
    const fam = document.getElementById("obfam"); if(!fam) return;
    fam.innerHTML = P.suppliers.map(s => `<div class="obfam"><b style="font-weight:600">${h(s.name)}</b><div class="small muted">${s.docs.map(d => h(E.DOCS[d].type)).join(" → ")}</div></div>`).join("") + `<div class="obfam"><b style="font-weight:600">PestGuard India</b> <span class="chip purple">from scan</span><div class="small muted">Scanned agreement · OCR confidence 74%</div></div>`;
    await wait(500); step(3);
    const nTerms = P.suppliers.reduce((a, s) => a + s.terms.length, 0), low = P.suppliers.reduce((a, s) => a + s.terms.filter(t => t.c < .85).length, 0);
    await wait(500); step(4);
    document.getElementById("obsum").innerHTML = `<div class="grid g2" style="margin-top:14px">
      <div class="card kpi"><div class="k num">7</div><div class="l">supplier families from 15 files</div></div>
      <div class="card kpi"><div class="k num">${nTerms}</div><div class="l">terms extracted, each with its clause quote</div></div>
      <div class="card kpi"><div class="k num" style="color:var(--purple)">${low + 1}</div><div class="l">items for a human to check: 2 unsure terms go to Legal, 1 poor scan goes back for a clean copy</div></div>
      <div class="card kpi"><div class="k num" style="color:var(--red)">1</div><div class="l">amendment that changes a deadline: CleanSpace, 30 → 90 days</div></div></div>
      <div class="callout good" style="margin-top:12px">Deadlines are now calculated for every family. The renewal radar is live.</div>
      <div class="row" style="margin-top:12px"><a class="btn pri" href="#radar">Open the renewal radar →</a><a class="btn sec" href="#verify">See Legal's queue</a></div>`;
    ob.running = false; ob.done = true; const b = document.getElementById("obgo"); if(b){ b.disabled = false; b.textContent = "Run again"; }
    if(window.PT) window.PT.after();
  })();
}

/* ── 2. Tariff shock: the world changes, Pulse shows the exposure in seconds ── */
let shock = false;
function shockCard(){
  if(!shock) return `<div class="card pad shockc"><div class="row between" style="gap:16px"><div><div class="eyebrow">When the world changes</div><h3>Simulate a tariff shock</h3><p class="small ink2" style="margin:6px 0 0">Suppose the government raises customs duty on imported IT hardware and logistics costs jump. Which suppliers can pass it on to Vyom, and on what terms?</p></div><button class="btn pri" id="shockgo">Run the scenario</button></div></div>`;
  const ns = P.suppliers.find(s => s.id === "northstar"), ix = (s, f) => { const t = E.terms(s)[f].cur; return `${t.doc}|${s.terms.indexOf(t)}`; };
  const hw = P.portfolio.filter(s => /Dell|Lenovo|Cisco/.test(s.name));
  const rows = [
    ["Northstar Logistics","Logistics","Yes, but only with 30 days' notice, documentary evidence, max 3% a year","Its 6% surcharge letter fails all three tests. Reject it and ask for evidence.", "red", ix(ns, "adjust"), "packet-northstar"],
    ...hw.map(s => [s.name, "IT hardware", "Contract not fully read yet (tracker import)", "Flag to the owner; read the full contract this week", "amber", null, null]),
    ["TalentBridge Staffing","Staffing","No tariff clause; rises capped at 5% at renewal only","No exposure","green", ix(P.suppliers.find(s => s.id === "talentbridge"), "cap"), null],
    ["CleanSpace, Sentinel","Facilities","CPI or minimum-wage changes only","No exposure","green", null, null],
    ["Lumen, Brightwave","Software, Marketing","No pass-through clause","No exposure","green", null, null]];
  return `<div class="card pad shockc on"><div class="row between"><div><div class="eyebrow" style="color:var(--red)">Simulated event · ${E.fmtD(E.TODAY)}</div><h3>Customs duty on imported IT hardware raised by 10 points</h3></div><button class="btn ghost sm" id="shockx">Clear</button></div>
    <p class="small ink2" style="margin:6px 0 12px">Pulse checked every contract's price-adjustment, tariff and force-majeure terms in about a second. <b>1 supplier can pass costs on, within limits. 3 need a closer read. The rest can't.</b></p>
    <div class="scroll"><table class="stack"><thead><tr><th>Supplier</th><th>Category</th><th>What the contract allows</th><th>What to do</th></tr></thead><tbody>
    ${rows.map(([n, c, a, d, k, w, link]) => `<tr><td><span class="dot" style="background:var(--${k === "red" ? "red" : k === "amber" ? "amber" : "green"});margin-right:6px"></span><b style="font-weight:600">${h(n)}</b></td><td class="small">${h(c)}</td><td class="small">${h(a)}${w ? `<div><button class="where" data-where="${w}">Show clause</button></div>` : ""}</td><td class="small">${h(d)}${link ? `<div><a href="#${link}">Open packet →</a></div>` : ""}</td></tr>`).join("")}</tbody></table></div>
    <div class="row" style="margin-top:12px"><button class="btn pri sm" id="shockalert" ${hw.every(s => E.S.nudged[s.id]) ? "disabled" : ""}>${hw.every(s => E.S.nudged[s.id]) ? "Owners alerted ✓" : "Alert the 3 IT hardware owners"}</button><a class="btn sec sm" href="#packet-northstar">Draft the reply to Northstar</a></div></div>`;
}
function bindShock(){
  const g = document.getElementById("shockgo"); if(g) g.onclick = () => { shock = true; window.PA.render(); };
  const x = document.getElementById("shockx"); if(x) x.onclick = () => { shock = false; window.PA.render(); };
  const al = document.getElementById("shockalert"); if(al) al.onclick = () => { P.portfolio.filter(s => /Dell|Lenovo|Cisco/.test(s.name)).forEach(s => E.S.nudged[s.id] = 1); E.save(); window.PA.toast("Owners alerted, with the clause each one needs to check."); window.PA.render(); };
}
window.PX = { reset(){ ob = { running:false, done:false }; shock = false; }, onboard, runOnboard, shockCard, bindShock, get shock(){ return shock; }, get obDone(){ return ob.done; } };
})();
