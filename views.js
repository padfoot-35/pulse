/* Pulse: product views */
(function(){
const P = window.PULSE, E = window.PE;
const A = () => window.PA;
const h = s => window.PA.h(s);
const deep = () => P.suppliers;
const sup = id => P.suppliers.find(s => s.id === id);
const L = f => P.fieldLabels[f] || f;
const OWN = ["kavya","arjun","ananya","sneha"];

/* small components */
function days(c){ if(c.evergreen) return `<span class="daysleft"><b>∞</b><span>monthly</span></span>`;
  const d = c.days, k = d < 0 ? "red" : d <= 14 ? "red" : d <= 45 ? "amber" : "";
  return `<span class="daysleft ${k}"><b class="num">${d < 0 ? "Missed" : d}</b><span>${d < 0 ? E.fmtDs(c.deadline) : d === 1 ? "day left" : "days left"}</span></span>`; }
const chip = (t, k = "") => `<span class="chip ${k}">${h(t)}</span>`;
const sigs = s => `<div class="sig">${E.signals(s).map(x => chip(x.t, x.k)).join("")}</div>`;
const where = (s, t) => `<button class="where" data-where="${t.doc}|${s.terms.indexOf(t)}">Show me where it says this</button>`;
function ownerLine(s){ const o = E.ownerOf(s); return `<span class="row" style="gap:8px;flex-wrap:nowrap;align-items:flex-start"><span class="av ${OWN.includes(o.id)?"p":""}" style="width:26px;height:26px;font-size:10.5px">${o.init}</span><span class="small">${h(o.name)}${o.left ? ` ${chip("left Vyom","red")}` : ""}</span></span>`; }
function status(s){
  const d = E.S.decisions[s.id], ci = E.S.checkins[s.id];
  if(d) return `<span class="status" style="color:var(--green)"><span class="dot" style="background:var(--green)"></span>Decided · ${h(d.title)}</span>`;
  if(ci) return `<span class="status" style="color:var(--teal)"><span class="dot" style="background:var(--teal)"></span>Owner replied</span>`;
  if(!s.light && E.ownerOf(s).left) return `<span class="status" style="color:var(--red)"><span class="dot" style="background:var(--red)"></span>No owner</span>`;
  if(E.S.nudged[s.id]) return `<span class="status"><span class="dot" style="background:var(--amber)"></span>Check-in sent</span>`;
  return `<span class="status muted"><span class="dot" style="background:var(--mist)"></span>Not started</span>`; }

function verifyItems(){
  const out = [];
  deep().forEach(s => { const T = E.terms(s); for(const f in T) if(T[f].needsCheck) out.push({ s, f, t:T[f] }); });
  P.portfolio.filter(s => s.scanned && !E.S.verified[s.id + ".scan"]).forEach(s => out.push({ s, f:"scan", light:true }));
  return out; }
function myThreads(p){ return deep().filter(s => E.ownerOf(s).id === p); }

/* ───────── RADAR ───────── */
function radar(){
  const rows = E.allRows();
  const open = r => !E.S.decisions[r.s.id];
  const due14 = rows.filter(r => r.c.days != null && r.c.days >= 0 && r.c.days <= 14);
  const atStake = due14.filter(open).reduce((a, r) => a + r.s.annual, 0);
  const waiting = deep().filter(s => !E.S.checkins[s.id] && !E.S.decisions[s.id]).length;
  const protectedV = Object.values(E.S.decisions).reduce((a, d) => a + (d.value || 0), 0);
  const groups = [
    ["Decide in the next 14 days", r => r.c.days != null && r.c.days >= 0 && r.c.days <= 14],
    ["Rolling monthly: no deadline, but it costs every month", r => r.c.evergreen],
    ["Next 15–60 days", r => r.c.days > 14 && r.c.days <= 60],
    ["61–120 days", r => r.c.days > 60 && r.c.days <= 120],
    ["Missed in the last month (already renewed)", r => r.c.days < 0 && r.c.days > -40]
  ];
  const later = rows.filter(r => r.c.days > 120).length;
  const row = r => { const s = r.s, c = r.c, isDeep = !s.light;
    return `<tr class="click" data-open="${s.id}"><td style="width:84px">${days(c)}</td>
      <td><b style="font-weight:600">${h(s.name)}</b> ${isDeep ? "" : chip("tracker import","line")}<div class="small muted">${h(s.sub || s.category)} · ${c.evergreen ? `exit takes ${c.notice} days` : `renews ${E.fmtD(c.renewOn)} · notice ${c.notice} days`}</div>${sigs(s)}</td>
      <td>${ownerLine(s)}<div style="margin-top:6px">${status(s)}</div></td>
      <td class="r num nowrap">${E.inr(s.annual)}<div class="small muted">a year</div></td>
      <td class="r">${isDeep ? `<a class="btn ${c.days != null && c.days <= 14 || c.evergreen ? "pri" : "sec"} sm" href="#packet-${s.id}">${E.S.decisions[s.id] ? "View" : "Decide"}</a>` : `<button class="btn sec sm" data-light="${s.id}">View</button>`}</td></tr>`; };
  return `<div class="pagehead"><div><div class="eyebrow">Procurement · renewal radar</div><h1>What needs a decision</h1>
    <p>Every notice deadline across ${P.suppliers.length + P.portfolio.length} suppliers in this demo. Deadlines are calculated from each contract's current terms, including amendments, then ranked by money at stake and days left.</p></div>
    <a class="btn sec" href="#contracts">All contracts</a></div>
  <div class="grid g4" style="margin-bottom:8px">
    <div class="card kpi"><div class="k num" style="color:var(--red)">${E.inr(atStake)}</div><div class="l">renews automatically in the next 14 days unless someone acts</div></div>
    <div class="card kpi"><div class="k num">${due14.filter(open).length}</div><div class="l">renewals needing a decision this fortnight</div></div>
    <div class="card kpi"><div class="k num">${waiting}</div><div class="l">owners who haven't answered their check-in</div></div>
    <div class="card kpi"><div class="k num" style="color:var(--green)">${E.inr(protectedV)}</div><div class="l">value protected by decisions so far</div></div>
  </div>
  ${groups.map(([t, f]) => { const g = rows.filter(f).sort((a, b) => (a.c.days ?? 999) - (b.c.days ?? 999) || b.s.annual - a.s.annual); if(!g.length) return "";
    return `<div class="group-h"><h3>${t}</h3>${chip(g.length + "")}</div><div class="card scroll"><table class="stack" style="table-layout:fixed"><colgroup><col style="width:92px"><col><col style="width:230px"><col style="width:110px"><col style="width:96px"></colgroup><thead><tr><th>Deadline</th><th>Supplier</th><th>Owner</th><th class="r">Value</th><th></th></tr></thead><tbody>${g.map(row).join("")}</tbody></table></div>`; }).join("")}
  <p class="small muted" style="margin-top:14px">${later} more renewals fall after 120 days. Supplier records marked "tracker import" are background sample data; the six fully read contracts drive the demo.</p>`;
}

/* light record modal */
function lightModal(id){ const s = P.portfolio.find(x => x.id === id), c = E.clock(s), o = E.ownerOf(s);
  A().modal(`<div class="row between"><div><div class="eyebrow">${h(s.category)} · tracker import</div><h3>${h(s.name)}</h3></div><button class="btn sec sm" data-close>Close</button></div>
  <div class="grid g2" style="margin:16px 0"><div><div class="small muted">Owner</div>${h(o.name)}</div><div><div class="small muted">Value</div>${E.inr(s.annual)} a year</div>
  <div><div class="small muted">Term ends</div>${E.fmtD(s.end)}</div><div><div class="small muted">Notice deadline</div>${E.fmtD(c.deadline)} (${s.notice} days' notice)</div>
  <div><div class="small muted">Renewal</div>${s.auto ? "Auto-renews" : "Expires unless renewed"}</div><div><div class="small muted">Read confidence</div>${Math.round(s.conf*100)}%${s.scanned ? " · scanned PDF" : ""}</div></div>
  <div class="callout">This record came from the legacy Excel tracker. In a live rollout Pulse would read its documents in full, like the six demo suppliers.</div>
  <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn pri" id="nudgeL">${E.S.nudged[s.id] ? "Check-in sent" : "Send owner a check-in"}</button></div>`);
  document.getElementById("nudgeL").onclick = () => { E.S.nudged[s.id] = 1; E.save(); A().close(); A().toast(`Check-in sent to ${o.name}.`); A().render(); };
}

/* ───────── CONTRACTS ───────── */
let q = "", cat = "All";
function contracts(){
  const all = deep().concat(P.portfolio), cats = ["All", ...new Set(all.map(s => s.category))];
  const list = all.filter(s => (cat === "All" || s.category === cat) && (s.name + s.category + (P.people[s.owner]?.name || "")).toLowerCase().includes(q.toLowerCase()));
  return `<div class="pagehead"><div><div class="eyebrow">Repository</div><h1>Contracts</h1><p>One place for every supplier agreement. Each document family (master agreement, amendments, statements of work, letters) is read together, so the terms shown are the ones actually in force.</p></div><a class="btn sec" href="#add">Add a contract</a></div>
  <div class="row" style="margin-bottom:14px"><input id="q" value="${h(q)}" placeholder="Search supplier, category or owner" style="flex:1;min-width:220px;border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:16px;background:#fff">
    <div class="row" style="gap:6px">${cats.map(c => `<button class="chip ${c === cat ? "purple" : "line"}" data-cat="${h(c)}" style="cursor:pointer;min-height:32px">${h(c)}</button>`).join("")}</div></div>
  <div class="card scroll"><table class="stack"><thead><tr><th>Supplier</th><th>Category</th><th>Owner</th><th class="r">Value / yr</th><th>Notice deadline</th><th>Read status</th></tr></thead><tbody>
  ${list.map(s => { const c = E.clock(s), T = s.light ? null : E.terms(s); const low = T ? Object.values(T).filter(x => x.needsCheck).length : (s.scanned && !E.S.verified[s.id + ".scan"] ? 1 : 0);
    return `<tr class="click" ${s.light ? `data-light="${s.id}"` : `data-go="c-${s.id}"`}><td><b style="font-weight:600">${h(s.name)}</b><div class="small muted">${s.light ? "Tracker import" : `${s.docs.length} documents read`}</div></td><td>${h(s.category)}</td><td class="small">${h(E.ownerOf(s).name)}</td><td class="r num">${E.inr(s.annual)}</td>
    <td class="nowrap">${c.evergreen ? "Rolling monthly" : E.fmtD(c.deadline)}</td><td>${low ? chip(low + " to check","purple") : chip("Verified","green")}</td></tr>`; }).join("")}
  </tbody></table></div>`;
}

/* ───────── DOSSIER ───────── */
let curDoc = null, curQuote = null;
function dossier(id){
  const s = sup(id); if(!s){ setTimeout(() => lightModal(id), 0); return contracts(); }
  const T = E.terms(s), c = E.clock(s), o = E.ownerOf(s);
  const docs = s.docs.map(d => E.DOCS[d]);
  if(!curDoc || !s.docs.includes(curDoc)){ curDoc = s.docs[0]; curQuote = null; }
  const order = ["end","renewal","notice","noticeHow","fee","cap","adjust","proposal","rates","sla","credit","claim","tfc","reduce","dispute","sowEnd","pay"];
  const n = T.notice;
  const calc = c.evergreen ? `This agreement now rolls month to month. Either side can end it with <b>${c.notice} days'</b> written notice, so the earliest exit is <b>${E.fmtD(c.earliestExit)}</b> if notice goes today.` :
    `Current term ends <b>${E.fmtD(c.periodEnd)}</b> ${n ? `minus <b>${c.notice} days'</b> notice (${h(E.DOCS[n.cur.doc].type)} cl. ${h(n.cur.cl)})` : ""} = notice must reach the supplier by <b>${E.fmtD(c.deadline)}</b>, ${c.days} days from today.`;
  return `<div class="pagehead"><div><div class="eyebrow">${h(s.category)} · ${h(s.sub)}</div><h1>${h(s.name)}</h1>
    <div class="row" style="margin-top:12px">${ownerLine(s)}${chip(E.inr(s.annual) + " a year","line")}${status(s)}</div></div>
    <a class="btn pri" href="#packet-${s.id}">Open renewal packet</a></div>
  <div class="grid ${s.tracker ? "g2" : ""}" style="margin-bottom:16px">
    <div class="callout"><div class="eyebrow">How Pulse worked out the deadline</div>${calc}<div class="small muted" style="margin-top:6px">Calculated by code from the extracted terms, never generated by the AI.</div></div>
    ${s.tracker ? `<div class="callout bad"><div class="eyebrow" style="color:var(--red)">Why this matters</div>${h(s.tracker.note)}. That puts the deadline at <b>${E.fmtD(c.trackerDeadline)}</b>: <b>${c.trackerGap} days too late</b>. By then the contract would already have renewed for another year.</div>` : ""}
  </div>
  <div class="dossier">
    <div class="card pad"><div class="row between"><h3>Terms in force</h3>${chip(Object.values(T).every(x => !x.needsCheck) ? "All verified" : Object.values(T).filter(x => x.needsCheck).length + " awaiting Legal","purple")}</div>
      <p class="small muted" style="margin-top:4px">Plain-English summary. Each line links to the exact clause.</p>
      ${order.filter(f => T[f]).map(f => { const x = T[f], t = x.cur; const v = f === "notice" ? `${t.v} days before the term ends` : t.v;
        return `<div class="term" ${f === "notice" ? 'data-tour="notice"' : ""}><div class="tl">${h(L(f))}</div><div><div class="tv">${h(v)}</div>
          ${x.hist.length ? `<div class="old">Was: ${h(f === "notice" ? x.hist[0].v + " days" : x.hist[0].v)} (${h(E.DOCS[x.hist[0].doc].type)}), replaced by ${h(E.DOCS[t.doc].title)}</div>` : ""}
          <div class="meta">${where(s, t)} <span class="small muted">· ${h(E.DOCS[t.doc].type)} cl. ${h(t.cl)}</span> ${x.needsCheck ? chip(`${Math.round(t.c*100)}% sure · Legal to confirm`,"purple") : x.verified ? chip("Confirmed by " + x.by,"green") : ""}</div></div></div>`; }).join("")}
    </div>
    <div class="card viewer"><div class="tabs">${docs.map(d => `<button data-doc="${d.id}" class="${d.id === curDoc ? "on" : ""}">${h(d.type)} · ${E.fmtDs(d.effective)} ${d.effective.slice(0,4)}</button>`).join("")}</div>
      <div class="pad" style="padding-bottom:0"><div class="family">${docs.map((d, i) => `<div class="fd ${i ? "child" : ""}">${i ? "↳ " : ""}<b style="font-weight:600">${h(d.title)}</b><span class="small muted" style="margin-left:auto">${E.fmtD(d.effective)}</span></div>`).join("")}</div></div>
      <div class="doc" id="docv">${A().docHTML(curDoc, curQuote)}</div></div>
  </div>`;
}

/* escalation policy: the product doesn't depend on owners replying */
function nudgeTimeline(s){
  const c = E.clock(s); if(c.evergreen) return `<div class="callout"><b>Rolling contract.</b> Pulse re-checks with the owner every quarter and flags any month with no active work.</div>`;
  const pts = [[45,"Check-in to owner"],[30,"Reminder"],[21,"Escalate to owner's manager"],[14,"Procurement decides"],[3,"Protective notice if still undecided"]];
  const ci = E.S.checkins[s.id], dec = E.S.decisions[s.id];
  const rows = pts.map(([d, t]) => ({ d, t, date:E.addDays(c.deadline, -d) })).concat([{ d:null, t:"Today", date:E.TODAY, now:true }]).filter(x => !(s.added && !x.now && x.date < E.TODAY)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.now ? -1 : 1));
  return `<div class="esc">${rows.map(r => r.now ? `<div class="escr now"><span class="ed"></span><span class="et"><b>Today · ${E.fmtDs(r.date)}</b> · ${c.days} days to the deadline</span></div>` :
      `<div class="escr ${r.date < E.TODAY ? "past" : ""}"><span class="ed"></span><span class="et"><b>${E.fmtDs(r.date)}</b> · ${r.t}<span class="muted"> (${r.d} days before)</span></span></div>`).join("")}
    <div class="escr"><span class="ed" style="background:var(--red);border-color:var(--red)"></span><span class="et"><b>${E.fmtDs(c.deadline)}</b> · Notice deadline</span></div></div>
    <p class="small muted" style="margin-top:8px">${s.added ? "Added today, so earlier steps are skipped and the check-in has gone straight to the owner. " : c.days < 21 ? "This contract came from the old tracker, so Pulse found it inside the final weeks. " : ""}Nothing renews silently: if nobody has decided three days out, Pulse prepares a protective non-renewal notice that keeps the option open, for Procurement to approve.${ci ? " Owner replied ✓" : ""}${dec ? " Decided ✓" : ""}</p>`;
}
const CHANGE = {
  cleanspace:"If Kavya rates the service 4–5 and needs all three sites, Pulse still claims the credits but recommends a quiet renewal. If she says it isn't needed, it switches to non-renewal.",
  sentinel:"If coverage recovers above 98% in November and December, renewing becomes reasonable. Either way, the credits should be claimed now.",
  talentbridge:"If the supplier shows wage data justifying more than 5%, the contract still caps the rise. The only route above 5% is a new agreement, for example a longer term.",
  lumen:"If Arjun's team confirms more users, Pulse resizes the renewal. If nobody needs Lumen, it switches to non-renewal and saves the full quote.",
  northstar:"If Northstar provides evidence of a qualifying duty or diesel change with 30 days' notice, up to 3% becomes payable.",
  brightwave:"If Ananya has campaigns planned for Q1 2027, a smaller retainer beats ending it. If not, ending it saves the most."
};

/* ───────── PACKET (Priya) ───────── */
const sel = {};
function packet(id){
  const s = sup(id); if(!s) return contracts();
  const c = E.clock(s), T = E.terms(s), o = E.ownerOf(s), ci = E.S.checkins[s.id], dec = E.S.decisions[s.id];
  const opts = E.options(s); const choose = sel[s.id] || (dec && dec.key) || opts.rec; const op = opts.find(x => x.key === choose) || opts[0];
  const ops = s.ops || {};
  const head = `<div class="pagehead"><div><div class="eyebrow">Renewal packet · prepared by Pulse</div><h1>${h(s.name)}</h1>
    <div class="row" style="margin-top:12px">${ownerLine(s)}${chip(E.inr(s.annual) + " a year","line")}${c.evergreen ? chip("Rolling monthly","amber") : chip(`Notice due ${E.fmtD(c.deadline)} · ${c.days} days`, c.days <= 14 ? "red" : "amber")}</div></div>
    <div class="row"><a class="btn sec" href="#c-${s.id}">View contract</a></div></div>`;

  const ownerBlock = o.left && !ci ? `<div class="callout bad"><b>Nobody owns this contract any more.</b> ${h(o.name)} left in August 2026, so the renewal quote went to an inactive inbox.
      <div class="callout" style="margin-top:10px;background:#fff"><div class="eyebrow">Suggested new owner</div><b>Arjun Mehta</b>, Engineering Manager: 9 of the 12 active Lumen users report into his team (from single sign-on logs).</div>
      <div class="row" style="margin-top:10px"><button class="btn pri" id="reassign">Make Arjun the owner and send him the check-in</button></div></div>`
    : ci ? `<div class="callout good"><div class="eyebrow" style="color:var(--green)">${h(o.name)} replied · ${h(ci.when || "today")}</div>
        <div><b>${h({ keep:"Keep it as it is", change:"Keep it, but change something", drop:"We don't need it any more" }[ci.need])}</b>${ci.detail ? `: ${h(ci.detail)}` : ""}</div>
        <div class="small" style="margin-top:4px">Service rating: ${"★".repeat(ci.rating || 0)}${"☆".repeat(5 - (ci.rating || 0))}${ci.comment ? ` · "${h(ci.comment)}"` : ""}</div></div>`
    : `<div class="callout warn"><div class="eyebrow" style="color:var(--amber)">Waiting for ${h(o.name)}</div>The business owner knows whether this supplier is still needed and how it is performing. ${E.S.nudged[s.id] ? "Check-in sent." : ""}
        <div class="row" style="margin-top:10px">${E.S.nudged[s.id] ? "" : `<button class="btn sec sm" id="nudge">Send the 60-second check-in</button>`}<button class="btn ghost sm" data-persona="${o.id}" data-goto="inbox">See it as ${h(o.name.split(" ")[0])} →</button></div></div>`;

  const facts = [];
  if(ops.sla){ facts.push(`<div class="card pad"><h4>${h(ops.slaLabel)}</h4><div class="bars" style="margin-top:10px">${ops.sla.map(([m, v]) => { const lo = ops.slaTarget - 8; const w = Math.max(4, (v - lo) / (100 - lo) * 100), t = (ops.slaTarget - lo) / (100 - lo) * 100;
      return `<div class="bar"><span>${m}</span><span class="tr"><span class="fl ${v < ops.slaTarget ? "bad" : ""}" style="width:${w}%;display:block"></span><span class="tgt" style="left:${t}%"></span></span><span class="num r" style="text-align:right">${v}%</span></div>`; }).join("")}</div>
      <p class="small muted" style="margin-top:8px">Black line = contract target. Red = missed month.</p>
      ${(() => { const cr = E.credits(s); return cr.items.length ? `<div class="callout ${cr.lost ? "bad" : "warn"}" style="margin-top:8px">${cr.items.map(i => `${i.m}: ${E.inr(i.amt)} credit${i.claimBy ? (i.lost ? `, <b>lost</b> (claim window closed ${E.fmtD(i.claimBy)})` : `, claim by <b>${E.fmtD(i.claimBy)}</b> (${i.days} days)`) : ", claimable"}`).join("<br>")}</div>` : ""; })()}</div>`); }
  if(s.id === "talentbridge"){ const i = ops.invoice; facts.push(`<div class="card pad"><h4>Rates and invoices</h4><p class="small" style="margin-top:8px">Supplier letter (10 Nov): <b>+9%</b> from 1 Feb 2027. Contract cl. 3.2 allows <b>at most 5%</b>, with 45 days' notice.</p>
      <div class="callout warn">Invoice ${h(i.id)} (${h(i.month)}): ${h(i.issue)}. ${i.count} × ${i.hours} h × ₹${(i.billed - i.contracted).toLocaleString("en-IN")} = <b>${E.inr(E.tbOver())}</b> overbilled. Dispute window closes <b>5 Dec 2026</b>.</div></div>`); }
  if(s.id === "lumen"){ facts.push(`<div class="card pad"><h4>Usage and price</h4><div class="bars" style="margin-top:10px"><div class="bar"><span>Used</span><span class="tr"><span class="fl" style="width:${ops.active/ops.seats*100}%;display:block"></span></span><span class="num">${ops.active}/${ops.seats}</span></div></div>
      <p class="small muted" style="margin-top:6px">${h(ops.usageNote)}</p><div class="callout warn">Renewal quote: ₹1,05,600 per user (+10%). Cl. 2.1 caps the rise at 7% (₹1,02,720).</div></div>`); }
  if(s.id === "northstar"){ facts.push(`<div class="card pad"><h4>The surcharge letter vs the contract</h4>
      <div class="check"><i class="no">✕</i><span>Notice: 17 days given (14 Nov → 1 Dec). Contract needs <b>30 days</b> (cl. 3.3).</span></div>
      <div class="check"><i class="no">✕</i><span>Evidence: none attached. Contract requires <b>documentary evidence</b> of a duty, tariff, levy or diesel change.</span></div>
      <div class="check"><i class="no">✕</i><span>Size: 6% asked. Contract caps adjustments at <b>3% a year</b>.</span></div>
      <p class="small muted" style="margin-top:8px">Spend about ${E.inr(ops.monthlySpend)} a month, so 6% ≈ ${E.inr(ops.monthlySpend*0.06)} a month.</p></div>`); }
  if(s.id === "brightwave"){ facts.push(`<div class="card pad"><h4>Retainer use (120 hours included)</h4><div class="bars" style="margin-top:10px">${ops.hours.map(([m, v]) => `<div class="bar"><span>${m}</span><span class="tr"><span class="fl" style="width:${v/ops.included*100}%;display:block"></span></span><span class="num">${v} h</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:8px">The only statement of work ended 31 Mar 2026.</p></div>`); }
  if(s.id === "cleanspace"){ facts.push(`<div class="card pad"><h4>What changed in the contract</h4><div class="check"><i class="q">!</i><span>Amendment No. 1 (Jun 2025) raised the notice period from <b>30 to 90 days</b>. The team tracker still says 30.</span></div><div class="check"><i>✓</i><span>The same amendment lowered the yearly price-increase cap from 6% to <b>5%</b>: useful leverage.</span></div><div class="check"><i>✓</i><span>Exit for convenience is allowed with 90 days' notice (cl. 5.1).</span></div></div>`); }

  const keyTerms = ["notice","noticeHow","cap","adjust","tfc","credit","claim"].filter(f => T[f]).map(f => { const t = T[f].cur; return `<div class="term" style="grid-template-columns:150px minmax(0,1fr)"><div class="tl">${h(L(f))}</div><div>${h(f === "notice" ? t.v + " days" : t.v)}<div class="meta">${where(s, t)}${T[f].needsCheck ? chip("Legal to confirm","purple") : ""}</div></div></div>`; }).join("");

  const draft = (dec && dec.draft) || window.PD.draft(s, op.key);
  const checks = window.PD.checks(s, op.key);
  const needsVikram = s.annual > 5000000;
  return head + `<div class="grid g2" style="align-items:start">
    <div class="grid">
      <div class="card pad" data-tour="owner"><h3>What the business says</h3><div style="margin-top:12px">${ownerBlock}</div></div>
      <div class="card pad"><h3>If nobody acts</h3><p class="small muted" style="margin:4px 0 12px">Pulse's escalation policy, relative to the notice deadline</p>${nudgeTimeline(s)}</div>
      ${facts.join("")}
      <div class="card pad"><h3>What the contract says</h3>${keyTerms}</div>
    </div>
    <div class="grid">
      <div class="card pad"><div class="row between"><h3>Options</h3><span class="badge-ai">Recommended by Pulse</span></div>
        <p class="small muted" style="margin:6px 0 12px">Rules apply the contract terms, the owner's answer and the data on the left. Amounts are calculated, not generated.</p>
        <div class="grid">${opts.map(x => `<div class="opt ${x.key === opts.rec ? "rec" : ""} ${x.key === choose ? "sel" : ""}" data-opt="${x.key}" tabindex="0" role="button" aria-pressed="${x.key === choose}">
          <div class="row between">${x.key === opts.rec ? chip("Recommended","purple") : "<span></span>"}<span class="v num">${x.value ? "+" + E.inr(x.value) : "₹0"}<span class="small muted" style="font-size:12px;letter-spacing:0"> protected</span></span></div>
          <b style="font-weight:600;font-size:16px">${h(x.title)}</b><ul style="margin:0;padding-left:18px;font-size:14px;color:var(--ink2)">${x.why.map(w => `<li>${h(w)}</li>`).join("")}</ul></div>`).join("")}</div>
        <div class="callout" style="margin-top:12px"><div class="eyebrow">What would change this recommendation</div>${h(CHANGE[s.id] || (s.added ? "If the owner says the service is no longer needed, Pulse switches to non-renewal. If service is rated 4–5 and the supplier agrees to hold prices, a quiet renewal is fine." : ""))}</div>
        <div id="explain" style="margin-top:12px"></div>
        <button class="btn ghost sm" id="explainBtn" style="margin-top:4px">Ask AI to challenge this recommendation</button>
      </div>
      <div class="card pad" data-tour="draft"><div class="row between"><h3>Draft to supplier</h3><button class="btn ai sm" id="polish">Polish with AI</button></div>
        <p class="small muted" style="margin:6px 0 10px">Written from the contract terms. Edit freely. Nothing is sent without your approval.</p>
        <textarea class="draft" id="draft" ${dec ? "readonly" : ""}>${h(draft)}</textarea>
        <div style="margin-top:12px">${checks.map(x => `<div class="check"><i class="${x.ok === false ? "no" : x.ok === "q" ? "q" : ""}">${x.ok === false ? "✕" : x.ok === "q" ? "!" : "✓"}</i><span>${x.t}</span></div>`).join("")}
          <div class="check"><i class="${needsVikram ? "q" : ""}">${needsVikram ? "!" : "✓"}</i><span>Approval: ${needsVikram ? "above ₹50 L a year, so Priya approves and <b>Vikram Shah (Head of Procurement)</b> is copied" : "within Priya's ₹50 L approval limit"}.</span></div></div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">${dec ? `<span class="chip green">Approved ${h(dec.when)} · ${E.inr(dec.value)} protected</span><button class="btn sec sm" id="undo">Undo</button>` : `<button class="btn pri" id="approve">Approve and send</button>`}</div>
        ${dec ? (() => { const rp = (E.S.replies || {})[s.id]; return rp ? `<div class="callout good" style="margin-top:12px"><div class="eyebrow" style="color:var(--green)">${h(s.name)} replied</div><b>${h({ ack:"Acknowledged", alt:"Proposed an alternative", q:"Asked a question" }[rp.type])}</b>${rp.text ? `: "${h(rp.text)}"` : ""}</div>` : `<div class="callout" style="margin-top:12px">Sent. Waiting for ${h(s.name)} to respond. <button class="btn ghost sm" data-goto="supplier" data-persona="supplier">See it as the supplier →</button></div>`; })() : ""}
      </div>
    </div></div>`;
}

/* ───────── OWNER INBOX (phone) ───────── */
let thread = {}, stepTmp = {};
function inbox(){
  const p = E.S.persona, list = myThreads(p);
  if(!list.length) return `<div class="pagehead"><div><h1>No check-ins</h1><p>You don't own any contracts that need a decision right now.</p></div></div>`;
  const cur = list.find(s => s.id === thread[p]) || list[0]; thread[p] = cur.id;
  return `<div class="pagehead"><div><div class="eyebrow">Supplier owner · ${h(P.people[p].role)}</div><h1>Your 60-second check-ins</h1>
    <p>You never log in to a contract system. Pulse reaches you where you already work (Slack, Teams or email), asks two questions, and shows you the clause behind every fact.</p></div></div>
  <div class="grid" style="grid-template-columns:minmax(0,260px) minmax(0,400px) minmax(0,1fr);align-items:start" id="inboxgrid">
    <div class="card" style="padding:8px">${list.map(s => { const c = E.clock(s), done = E.S.checkins[s.id];
      return `<button data-thread="${s.id}" style="display:flex;gap:10px;width:100%;text-align:left;background:${s.id === cur.id ? "var(--ground)" : "none"};border:0;border-radius:8px;padding:12px;cursor:pointer;align-items:center">
      ${days(c)}<span><b style="font-weight:600">${h(s.name)}</b><br><span class="small muted">${done ? "Answered ✓" : c.evergreen ? "Rolling monthly" : "Reply needed"}</span></span></button>`; }).join("")}
      <p class="small muted" style="padding:10px">Shown as a Slack thread. The same check-in works in Teams or email.</p></div>
    <div>${phone(cur)}</div>
    <div>${mirror(cur)}</div></div>
  <style>@media(max-width:1180px){#inboxgrid{grid-template-columns:minmax(0,240px) minmax(0,1fr)!important}#inboxgrid>div:last-child{grid-column:1/-1}}@media(max-width:860px){#inboxgrid{grid-template-columns:minmax(0,1fr)!important}}</style>`;
}
/* what Procurement sees while the owner answers: the two experiences, side by side */
function mirror(s){
  const ci = E.S.checkins[s.id], st = stepTmp[s.id] || {}, need = ci ? ci.need : st.need, rating = ci ? ci.rating : st.rating;
  const lbl = { keep:"Keep it as it is", change:"Keep it, but change something", drop:"We don't need it any more" };
  const opts = E.options(s), rec = opts.find(o => o.key === opts.rec);
  return `<div class="card pad" data-tour="mirror"><div class="eyebrow">Meanwhile, in Priya's renewal packet</div><h3>${h(s.name)}</h3>
    <div class="check" style="margin-top:12px"><i class="${need ? "" : "q"}">${need ? "✓" : "…"}</i><span>Still needed? <b>${need ? lbl[need] : "waiting for you"}</b>${(ci && ci.detail) || st.detail ? `: ${h((ci && ci.detail) || st.detail)}` : ""}</span></div>
    <div class="check"><i class="${rating ? (rating <= 2 ? "no" : "") : "q"}">${rating ? (rating <= 2 ? "!" : "✓") : "…"}</i><span>Service rating: <b>${rating ? rating + " / 5" : "waiting"}</b>${rating && rating <= 2 ? " (leverage for the renewal talk)" : ""}</span></div>
    <div class="check"><i class="${ci ? "" : "q"}">${ci ? "✓" : "…"}</i><span>${ci ? "Sent to Procurement" : "Not sent yet"}</span></div>
    <div class="callout ai" style="margin-top:12px"><div class="eyebrow">Pulse's recommendation updates with your answer</div><b>${h(rec.title)}</b><div class="small muted" style="margin-top:4px">${rec.value ? E.inr(rec.value) + " protected" : ""}</div></div>
    <p class="small muted" style="margin-top:10px">The owner gives the business view; Procurement handles the negotiation. The owner sees the final decision before anything goes to the supplier.</p>
    <button class="btn sec sm" data-goto="packet-${s.id}" data-persona="priya">Open the packet as Priya →</button></div>`;
}
function phone(s){
  const c = E.clock(s), T = E.terms(s), me = E.ownerOf(s), ci = E.S.checkins[s.id], st = stepTmp[s.id] || {};
  const first = me.name.split(" ")[0];
  const n = T.notice.cur;
  const intro = c.evergreen
    ? `Your <b>${h(s.name)}</b> retainer (${E.inr(c.monthly)} a month) renews every month. The only work order ended in March. Ending it takes ${c.notice} days' notice.`
    : `Your <b>${h(s.name)}</b> contract renews automatically on <b>${E.fmtD(c.renewOn)}</b> for another year (${E.inr(s.annual)}). If anything should change, Vyom must tell them by <b>${E.fmtD(c.deadline)}</b>, which is ${c.days} days from now.`;
  const extra = s.id === "lumen" ? `Only ${s.ops.active} of ${s.ops.seats} licences were used in the last 90 days.` : s.id === "sentinel" ? `Guard coverage missed the 98% target in Aug, Sep and Oct.` : s.id === "cleanspace" ? `The hygiene audit missed 90% in Aug and Oct.` : s.id === "talentbridge" ? `TalentBridge has asked for +9% from February.` : s.id === "northstar" ? `Northstar has announced a 6% surcharge from 1 Dec.` : "";
  const bot = (body) => `<div class="msg"><span class="av bot">P</span><div class="bd"><div class="nm">Pulse<span>APP</span></div>${body}</div></div>`;
  let convo = bot(`Hi ${h(first)}, quick one about a supplier you own.<div class="box">${intro} ${extra}<div style="margin-top:6px"><button class="where" data-where="${n.doc}|${s.terms.indexOf(n)}">Show me where it says this</button></div></div>`);
  const need = ci ? ci.need : st.need;
  convo += bot(`<b>1.</b> ${h(s.checkin.q1)}<div class="choices">${[["keep","Keep it as it is"],["change","Keep it, but change something"],["drop","We don't need it any more"]].map(([k, t]) => `<button data-need="${k}" class="${need === k ? "on" : ""}" ${ci ? "disabled" : ""}>${t}</button>`).join("")}</div>`);
  if(need === "change" && !ci){ convo += bot(s.id === "lumen" ? `How many people actually need Lumen?<div class="compose" style="border:0;padding:6px 0 0"><input id="seats" type="number" min="1" max="40" value="${st.seats || 15}" inputmode="numeric"></div>` : `What should change? (one line is fine)<div class="compose" style="border:0;padding:6px 0 0"><input id="detail" value="${h(st.detail || "")}" placeholder="e.g. fewer people, different scope"></div>`); }
  if(need || ci){ const rt = ci ? ci.rating : st.rating;
    convo += bot(`<b>2.</b> ${h(s.checkin.q2)}<div class="stars" style="margin-top:8px">${[1,2,3,4,5].map(n => `<button data-rate="${n}" class="${rt >= n ? "on" : ""}" ${ci ? "disabled" : ""} aria-label="${n} out of 5">${n}</button>`).join("")}</div><div class="small muted" style="margin-top:4px">1 = poor, 5 = excellent</div>`); }
  if(!ci && need && st.rating) convo += `<div class="compose" style="border:0;padding:0 0 0 44px"><input id="cmt" placeholder="Anything Procurement should know? (optional)" value="${h(st.comment || "")}"></div><div style="padding-left:44px"><button class="btn pri sm" id="sendci">Send to Procurement</button></div>`;
  if(ci){ convo += `<div class="mine">${h({ keep:"Keep it as it is", change:"Keep it, but change something", drop:"We don't need it any more" }[ci.need])}${ci.detail ? " · " + h(ci.detail) : ""} · ${ci.rating}/5${ci.comment ? ` · "${h(ci.comment)}"` : ""}</div>` +
    bot(`Thanks ${h(first)}. Priya in Procurement will take it from here. You'll see the final decision before anything goes to ${h(s.name.split(" ")[0])}.`); }
  const LQ = E.S.legal || [];
  ((E.S.qa || {})[s.id] || []).forEach((x, k) => { convo += `<div class="mine">${h(x.q)}</div>` + bot(x.a +
      (x.legal && !x.sent && x.a !== "…" ? `<div style="margin-top:8px"><button class="btn sec sm" data-legal="${k}">Send to Rahul in Legal</button></div>` : "") +
      (x.sent ? ((LQ.find(l => l.id === x.sent) || {}).status === "answered" ? `<div class="small muted" style="margin-top:6px">Sent to Rahul Sen, Legal. He replied below.</div>`
        : `<div class="small muted" style="margin-top:6px">Sent to Rahul Sen, Legal. His reply will appear here once he answers.</div><div class="legalnext"><span>In this demo you play Rahul too.</span><button class="btn pri sm" data-persona="rahul" data-goto="verify">Answer it as Rahul →</button></div>`) : ""));
    const lq = x.sent && LQ.find(l => l.id === x.sent);
    if(lq && lq.status === "answered") convo += `<div class="msg"><span class="av" style="background:#e6eef0;color:var(--teal)">RS</span><div class="bd"><div class="nm">Rahul Sen<span>Legal</span></div>${h(lq.answer)}</div></div>`; });
  return `<div class="phone"><div class="screen"><div class="chat-h"><b># Pulse</b><span style="opacity:.75">· direct message</span></div><div class="chat" id="chat">${convo}</div>
    <div class="compose"><input id="askc" placeholder="Ask about this contract, e.g. can we cancel early?"><button class="btn pri sm" id="askcb">Ask</button></div></div></div>`;
}

/* owner Q&A: answered from extracted terms; live AI when available */
const strip2 = t => String(t || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
function localAnswer(s, q){
  const T = E.terms(s), x = q.toLowerCase();
  if(/\b(start|started|begin|began|commence|effective|signed)\b/.test(x)){ const d0 = E.DOCS[s.docs[0]]; return `The ${h(d0.title)} is dated <b>${E.fmtD(d0.effective)}</b>, which is when it started.${s.docs.length > 1 ? ` Later documents (${s.docs.slice(1).map(id => h(E.DOCS[id].title)).join(", ")}) changed some terms but not the start date.` : ""}`; }
  const pickF = /cancel|exit|terminat|end it|get out/.test(x) ? "tfc" : /notice|deadline|when.*(tell|inform)/.test(x) ? "notice" : /price|increase|rise|hike|cost more/.test(x) ? "cap" : /credit|sla|service level|penalt/.test(x) ? (T.credit ? "credit" : "sla") : /pay|invoice/.test(x) ? "pay" : /renew/.test(x) ? "renewal" : null;
  if(!pickF || !T[pickF]) return null;
  const t = T[pickF].cur;
  return `${h(L(pickF))}: <b>${h(pickF === "notice" ? t.v + " days before the term ends" : t.v)}</b>.<div style="margin-top:4px"><button class="where" data-where="${t.doc}|${s.terms.indexOf(t)}">${h(E.DOCS[t.doc].type)} cl. ${h(t.cl)}: show me</button></div>`;
}

/* ───────── MY SUPPLIERS (owner) ───────── */
function mine(){
  const list = myThreads(E.S.persona);
  return `<div class="pagehead"><div><div class="eyebrow">Supplier owner</div><h1>My suppliers in plain English</h1><p>The five facts owners ask about most, with the clause one tap away.</p></div></div>
  <div class="grid g2">${list.map(s => { const T = E.terms(s), c = E.clock(s);
    const line = (f, txt) => T[f] ? `<div class="term" style="grid-template-columns:120px minmax(0,1fr)"><div class="tl">${txt}</div><div>${h(f === "notice" ? T[f].cur.v + " days' notice" : T[f].cur.v)}<div class="meta">${where(s, T[f].cur)}</div></div></div>` : "";
    return `<div class="card pad"><div class="row between"><h3>${h(s.name)}</h3>${days(c)}</div><p class="small muted">${h(s.sub)}</p>${line("renewal","Renews")}${line("notice","To stop it")}${line("tfc","Exit early")}${line("cap","Price rises")}${line("sla","Promised service")}</div>`; }).join("")}</div>`;
}

/* ───────── VERIFY (Rahul) ───────── */
function verify(){
  const items = verifyItems(), done = Object.entries(E.S.verified);
  return `<div class="pagehead"><div><div class="eyebrow">Legal · verification queue</div><h1>Only what the AI isn't sure about</h1>
    <p>Pulse auto-accepts terms it reads with high confidence and sends you the rest. Until you confirm, it uses the <b>stricter</b> reading, so no deadline is missed while a term waits.</p></div>${chip((items.length + (E.S.legal || []).filter(x => x.status === "open").length) + " waiting","purple")}</div>
  ${legalQs()}
  ${items.length ? "" : `<div class="callout good">All caught up. ${done.length} items confirmed.</div>`}
  <div class="grid">${items.map(it => it.light ? `<div class="card pad"><div class="row between"><div><div class="eyebrow">${h(it.s.category)} · tracker import</div><h3>${h(it.s.name)}</h3></div>${chip(Math.round(it.s.conf*100) + "% read confidence","amber")}</div>
      <p class="small" style="margin-top:8px">Scanned PDF with poor text quality. Pulse read: term ends <b>${E.fmtD(it.s.end)}</b>, <b>${it.s.notice} days'</b> notice, ${it.s.auto ? "auto-renews" : "expires"}.</p>
      <div class="row"><button class="btn pri sm" data-ok="${it.s.id}.scan">These are right</button><button class="btn sec sm" data-ok="${it.s.id}.scan" data-msg="Requested a clean copy from the owner">Request a clean copy</button></div></div>` : vItem(it)).join("")}</div>
  ${done.length ? `<h3 style="margin:28px 0 10px">Confirmed</h3><div class="card scroll"><table><tbody>${done.map(([k, by]) => { const [id, f] = k.split("."); const s = sup(id) || P.portfolio.find(x => x.id === id); return `<tr><td>${h(s ? s.name : id)}</td><td>${h(f === "scan" ? "Scanned record" : L(f))}</td><td class="small muted">Confirmed by ${h(by)}</td></tr>`; }).join("")}</tbody></table></div>` : ""}`;
}
function legalQs(){
  const all = E.S.legal || [], open = all.filter(x => x.status === "open"), ans = all.filter(x => x.status === "answered");
  if(!all.length) return "";
  return `<h3 style="margin:4px 0 10px">Questions from business owners ${open.length ? chip(open.length + " open","purple") : ""}</h3>
  <div class="grid" style="margin-bottom:22px">${open.map(x => { const sp = sup(x.sid), who = P.people[x.from] || { name:"Owner" };
    return `<div class="card pad lq"><div class="row between"><div><div class="eyebrow">${h(sp ? sp.name : x.sid)} · from ${h(who.name)} via Slack</div><h3 style="font-size:17px">"${h(x.q)}"</h3></div><a class="btn sec sm" href="#c-${h(x.sid)}">Open the contract</a></div>
      ${x.context ? `<p class="small muted" style="margin:8px 0 0">Pulse's answer so far: ${h(x.context.slice(0, 260))}${x.context.length > 260 ? "…" : ""}</p>` : ""}
      <textarea class="draft" id="lqa-${x.id}" style="min-height:90px;margin-top:10px" placeholder="Your reply to ${h(who.name.split(" ")[0])}. It goes straight back to their Slack thread."></textarea>
      <div class="row" style="margin-top:8px;gap:8px"><button class="btn ai sm" data-lqdraft="${x.id}">Draft a reply with AI</button><button class="btn pri sm" data-lqsend="${x.id}">Send reply to ${h(who.name.split(" ")[0])}</button></div></div>`; }).join("")}
  ${ans.length ? `<div class="card scroll"><table><tbody>${ans.map(x => `<tr><td class="small"><b style="font-weight:600">${h((sup(x.sid) || {}).name || x.sid)}</b> · "${h(x.q)}"</td><td class="small muted">Answered: ${h(x.answer)}</td><td><button class="btn sec sm" data-lqview="${x.id}">See it in ${h(((P.people[x.from] || {}).name || "the owner").split(" ")[0])}'s thread →</button></td></tr>`).join("")}</tbody></table></div>` : ""}</div>`;
}
function vItem({ s, f, t }){
  const x = t.cur, older = t.hist;
  const reason = s.id === "cleanspace" && f === "notice" ? "The amendment doesn't restate the clause; it replaces words inside clause 14.2. Pulse read the replaced wording as 90 days but flagged it because the change sits in a different document." :
    s.added && older.length ? "An amendment in the uploaded file changes this term. Pulse uses the newer wording but asks Legal to confirm, because the change sits in a separate document." :
    s.added ? "Pulse read this from the uploaded contract but isn't fully sure of the wording." :
    s.id === "lumen" && f === "cap" ? "Clause 1.2 says renewal is at the then-current list price, while clause 2.1 caps any increase at 7%. Pulse reads 2.1 as overriding because it opens with \"Notwithstanding Clause 1.2\"." : "Low confidence reading.";
  const val = f === "notice" ? x.v + " days" : x.v;
  return `<div class="card pad" data-tour="vitem" data-sid="${s.id}"><div class="row between"><div><div class="eyebrow">${h(s.name)}</div><h3>${h(L(f))}: ${h(val)}</h3></div>${chip(Math.round(x.c*100) + "% confidence","purple")}</div>
    <p class="small ink2" style="margin-top:8px">${h(reason)}</p>
    <div class="grid ${older.length ? "g2" : ""}" style="margin:12px 0">${older.map(o => `<div class="callout"><div class="eyebrow">Original · ${h(E.DOCS[o.doc].title)} cl. ${h(o.cl)}</div><span style="font-family:Georgia,serif;font-size:14px">"…${h(o.q)}…"</span></div>`).join("")}
      <div class="callout ai"><div class="eyebrow">Pulse's reading · ${h(E.DOCS[x.doc].title)} cl. ${h(x.cl)}</div><span style="font-family:Georgia,serif;font-size:14px">"…${h(x.q)}…"</span></div></div>
    <div class="row"><button class="btn pri sm" data-ok="${s.id}.${f}">Confirm ${h(val)}</button><button class="btn sec sm" data-where="${x.doc}|${s.terms.indexOf(x)}">Read full clause</button><button class="btn ghost sm" data-ok="${s.id}.${f}" data-msg="Escalated: Pulse keeps the stricter reading until resolved">Not sure: keep the stricter reading</button></div></div>`;
}

/* ───────── FINANCE (Meera) ───────── */
function finance(){
  const rows = E.allRows().filter(r => !r.c.evergreen && r.c.renewOn);
  const months = []; for(let i = 0; i < 6; i++){ const d = E.addMonths("2026-12-01", i); months.push(d.slice(0, 7)); }
  const by = months.map(m => ({ m, open:rows.filter(r => r.c.renewOn.slice(0, 7) === m && !E.S.decisions[r.s.id]).reduce((a, r) => a + r.s.annual, 0), dec:rows.filter(r => r.c.renewOn.slice(0, 7) === m && E.S.decisions[r.s.id]).reduce((a, r) => a + r.s.annual, 0) }));
  const max = Math.max(...by.map(b => b.open + b.dec), 1);
  const ex = window.PD.exceptions();
  const F = E.S.finance;
  const caught = ex.reduce((a, x) => a + x.amt, 0);
  return `<div class="pagehead"><div><div class="eyebrow">Finance · commitments and invoice checks</div><h1>Pay what the contract says</h1>
    <p>Accounts payable usually checks an invoice against the purchase order. Pulse also checks it against the contract: rate cards, price caps, surcharges and service credits.</p></div></div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card kpi"><div class="k num" style="color:var(--red)">${E.inr(caught)}</div><div class="l">at risk across ${ex.length} invoices and quotes that break a contract</div></div>
    <div class="card kpi"><div class="k num">${E.inr(by.reduce((a, b) => a + b.open, 0))}</div><div class="l">auto-renewing Dec–May with no decision yet</div></div>
    <div class="card kpi"><div class="k num" style="color:var(--green)">${E.inr(ex.filter(x => F[x.id]).reduce((a, x) => a + x.amt, 0))}</div><div class="l">held or disputed so far</div></div></div>
  <div class="card pad" style="margin-bottom:16px"><div class="row between"><h3>Committed spend renewing each month</h3><span class="row small"><span class="dot" style="background:var(--teal2)"></span>No decision <span class="dot" style="background:var(--purple)"></span>Decided</span></div>
    <div class="cols">${by.map(b => { const [y, m] = b.m.split("-"); return `<div class="c"><span class="small num">${E.inr(b.open + b.dec)}</span><div style="width:100%;max-width:56px;display:flex;flex-direction:column;justify-content:flex-end;height:${(b.open + b.dec)/max*130}px"><div class="b p" style="height:${b.dec/(b.open+b.dec||1)*100}%;border-radius:6px 6px 0 0"></div><div class="b" style="height:${b.open/(b.open+b.dec||1)*100}%;border-radius:${b.dec ? 0 : "6px 6px"} 0 0"></div></div><span>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${y.slice(2)}</span></div>`; }).join("")}</div></div>
  <h3 style="margin:8px 0 10px">Invoices and quotes that don't match the contract</h3>
  <div class="card scroll" data-tour="exceptions"><table class="stack"><thead><tr><th>Supplier · document</th><th>What's wrong</th><th>Contract says</th><th class="r">Amount</th><th>Action</th></tr></thead><tbody>
  ${ex.map(x => `<tr><td><b style="font-weight:600">${h(x.sup)}</b><div class="small muted">${h(x.doc)}</div></td><td class="small">${x.what}</td><td class="small">${x.rule}<div><button class="where" data-where="${x.where}">Show clause</button></div></td><td class="r num nowrap">${E.inr(x.amt)}</td>
    <td>${F[x.id] ? chip(F[x.id],"green") : `<div class="row" style="gap:6px"><button class="btn pri sm" data-fin="${x.id}" data-act="${x.act}">${x.act}</button></div><div class="small muted" style="margin-top:4px">${x.by}</div>`}</td></tr>`).join("")}
  </tbody></table></div>`;
}

/* ───────── ASK ───────── */
let askLog = [];
const PRESETS = ["Which suppliers can pass tariff or fuel increases on to us?","Which contracts can we exit with 30 days' notice or less?","Where are we owed service credits?","Which renewals or invoices break a price cap?","What must we decide in the next 30 days?","Which contracts have nobody responsible for them?"];
function askView(){
  return `<div class="pagehead"><div><div class="eyebrow">Ask Pulse · whole portfolio</div><h1>Ask your contracts a question</h1><p>Answers come with the clause behind every claim. Useful when the world changes, like a new tariff, and you need to know your position across hundreds of suppliers in minutes.</p></div><span class="aib">${A().aiBadge()}</span></div>
  ${window.PX.shockCard()}
  <div class="card pad" style="margin-top:16px"><div class="eyebrow">Or ask anything</div><form id="askf" class="row"><input id="askq" placeholder="e.g. Which suppliers can raise prices if import duties go up?" style="flex:1;min-width:240px;border:1px solid var(--line);border-radius:8px;padding:12px;font-size:16px"><button class="btn pri">Ask</button></form>
  <div class="row" style="margin-top:12px;gap:8px" data-tour="presets">${PRESETS.map((p, i) => `<button class="chip line" data-pre="${i}" style="cursor:pointer;min-height:34px;white-space:normal;text-align:left;line-height:1.3">${h(p)}</button>`).join("")}</div></div>
  <div id="answers" class="grid" style="margin-top:16px">${askLog.map(x => x.html).join("")}</div>`;
}

/* ───────── ADD (live AI extraction) ───────── */
let addText = "", addResult = null, addBusy = false, gen = null, genBusy = false, genInd = "it", genTrap = true, genFree = "", added = null;
const OWNER_FOR = { it:"arjun", saas:"arjun", tel:"arjun", fac:"kavya", food:"kavya", log:"sneha", mfg:"sneha", staff:"sneha", med:"sneha", mkt:"ananya", gen:"kavya" };
const CAT_FOR = { it:"IT services", saas:"Software", tel:"Telecom", fac:"Facilities", food:"Facilities", log:"Logistics", mfg:"Raw materials", staff:"Staffing", med:"Equipment maintenance", mkt:"Marketing", gen:"Services" };
const RLBL = { term_end:"Term end", renewal:"Renewal", notice_days:"Notice to stop renewal", notice_method:"How notice must be sent", price_limit:"Price-increase limit", fees:"Current fee", service_level:"Service level", service_credits:"Service credits", exit_right:"Exit early (for convenience)", payment_terms:"Payment terms" };
const nrm = t => String(t || "").replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();

function genCard(){
  const G = window.PG;
  return `<div class="card pad gencard" data-tour="gen" style="margin-bottom:16px"><div class="row between" style="align-items:flex-start"><div><div class="eyebrow">No contract to hand?</div><h3>Generate a realistic test contract for any industry</h3>
      <p class="small muted" style="margin-top:4px;max-width:720px">Pulse writes a synthetic supplier contract with its own dates, fees and terms, and keeps the answer key. Download the PDF, upload it below like a real contract, and see how Pulse did.</p></div></div>
    <div class="genrow">
      <label class="fld"><span class="small muted">Industry</span><select id="gind">${G.CODES.map(k => `<option value="${k}" ${k === genInd ? "selected" : ""}>${h(G.IND[k].label)}</option>`).join("")}</select></label>
      <label class="fld" style="flex:1.4"><span class="small muted">…or type any industry</span><input id="gfree" value="${h(genFree)}" placeholder="e.g. solar panel installation, hotel laundry"></label>
      <div class="fld"><span class="small muted">Difficulty</span><div class="seg"><button data-trap="0" class="${genTrap ? "" : "on"}">Straightforward</button><button data-trap="1" class="${genTrap ? "on" : ""}">With a hidden amendment</button></div></div>
      <button class="btn pri" id="ggo" ${genBusy ? "disabled" : ""}>${genBusy ? "Writing…" : "Generate contract"}</button></div>
    ${gen ? `<div class="genout"><div class="gendoc"><span class="pdfic">PDF</span><div><b style="font-weight:600">${h(gen.q.name)}</b><div class="small muted">${h(gen.q.ind.title)}${gen.industry ? " · " + h(gen.industry) : ""} · ${gen.trap ? "agreement + amendment, 2 pages" : "1–2 pages"} · ref ${h(gen.ref)}</div></div></div>
      <div class="row" style="gap:8px"><button class="btn pri sm" id="gpdf">Download PDF</button><button class="btn sec sm" id="gtxt">Download .txt</button><button class="btn ghost sm" id="guse">Skip the download: load it below</button></div>
      <p class="small ink2" style="margin:10px 0 0"><b>Next:</b> click <b>Upload</b> below and pick the PDF you just downloaded, then <b>Read the contract</b>. ${gen.trap ? "This one has an amendment at the back that quietly changes the notice period. Will Pulse catch it?" : ""}</p>
      <details class="small" style="margin-top:8px"><summary style="cursor:pointer;color:var(--teal)">Peek at the answer key</summary><div class="scroll" style="margin-top:8px"><table><tbody>${gen.key.map(k => `<tr><td>${h(k.label)}</td><td><b style="font-weight:600">${h(k.truth)}</b>${k.note ? ` <span class="muted">(${h(k.note)})</span>` : ""}</td></tr>`).join("")}</tbody></table></div></details></div>` : ""}
  </div>`;
}

function resultHTML(r){
  const t = addText, rows = (r.terms || []).map(x => ({ ...x, ok: x.quote && nrm(t).includes(nrm(x.quote)) })), okN = rows.filter(x => x.ok).length;
  const badge = r.live ? `<span class="badge-ai">Live AI</span>` : r.method === "stored" ? `<span class="badge-ai off">Stored AI result</span>` : `<span class="chip teal">Basic reader · no AI</span>`;
  const c = window.PR.clockOf(r);
  const ref = window.PG.parseRef(t), key = ref ? (window.PG.rebuild(ref.ref) || {}).key : null;
  const calc = c ? `<div class="callout ${c.days < 0 ? "bad" : c.days <= 30 ? "warn" : "good"}" style="margin:12px 0"><div class="eyebrow">Deadline, calculated by code</div>${c.rolled ? `The first term ended ${E.fmtD(r.term_end_iso)} and the contract has already renewed itself ${c.rolled === 1 ? "once" : c.rolled + " times"}, so the current term ends <b>${E.fmtD(c.end)}</b>.<br>` : ""}Term ends <b>${E.fmtD(c.end)}</b> − <b>${r.notice_days} days'</b> notice = act by <b>${E.fmtD(c.deadline)}</b> (${c.days < 0 ? Math.abs(c.days) + " days ago" : c.days + " days from " + E.fmtD(E.TODAY)}).</div>`
    : `<div class="callout warn" style="margin:12px 0">Pulse couldn't work out the deadline: ${!r.term_end_iso ? "no term end date found" : "no notice period found"}. Enter it below before adding; it will go to Legal to confirm.</div>`;
  const o = PR_owner(t, r);
  return `<div class="row between"><h3>2. What Pulse found</h3>${badge}</div>
    ${r.note ? `<div class="callout" style="margin-top:10px">${h(r.note)}</div>` : ""}
    <p class="small muted" style="margin-top:8px">${h(r.supplier || "Supplier not named")} · ${h(r.agreement_type || "Agreement")} · <b>${okN} of ${rows.length}</b> quotes found word-for-word in your document</p>
    ${key ? window.PR.scoreHTML(window.PR.score(r, key), ref.trap) : ""}
    ${calc}
    ${window.PR.healthHTML(r)}
    <details class="terms-d" ${key ? "" : "open"}><summary><b>All ${rows.length} terms Pulse found</b><span class="small muted"> · each with its exact quote and clause</span></summary>
    ${rows.map(x => `<div class="term"><div class="tl">${h(RLBL[x.field] || x.field)}</div><div><div class="tv">${h(x.value)}</div>
      ${x.previous_value ? `<div class="old">Was: ${h(x.previous_value)}${x.previous_clause ? ` (cl. ${h(x.previous_clause)})` : ""}, changed by the amendment</div>` : ""}
      <div class="small" style="font-family:Georgia,serif;color:var(--ink2);margin-top:4px">"${h(x.quote)}"</div>
      <div class="meta">${x.clause ? `<span class="small muted">cl. ${h(x.clause)}</span>` : ""} ${x.ok ? '<span class="chip green">✓ quote verified in document</span>' : '<span class="chip red">Quote not found: sent to Legal</span>'} ${x.confidence < .85 ? `<span class="chip purple">${Math.round(x.confidence*100)}% sure · Legal to confirm</span>` : ""}</div></div></div>`).join("") || `<p class="muted" style="margin-top:10px">No standard terms found. Is this a supplier contract?</p>`}</details>
    <div class="card pad addp" style="margin-top:14px" data-tour="addp">${added && sup(added) ? addedHTML() : `<h3>3. Add it to Pulse</h3>
      <p class="small muted" style="margin:4px 0 12px">It joins the renewal radar with its deadline, uncertain terms go to Legal, and the owner gets the 60-second check-in. Check the two numbers that drive the deadline.</p>
      <div class="genrow">
        <label class="fld" style="flex:1.4"><span class="small muted">Supplier</span><input id="ap_name" value="${h((r.supplier || "").replace(/\s+(Private Limited|Pvt\.? Ltd\.?)$/i, ""))}" placeholder="Supplier name"></label>
        <label class="fld"><span class="small muted">Business owner</span><select id="ap_owner">${["kavya","arjun","ananya","sneha"].map(k => `<option value="${k}" ${k === o.owner ? "selected" : ""}>${h(P.people[k].name)} · ${h(P.people[k].role.split(",")[0])}</option>`).join("")}</select></label>
        <label class="fld"><span class="small muted">Value a year (₹)</span><input id="ap_val" type="number" min="0" step="10000" value="${o.annual}"></label></div>
      <div class="genrow" style="margin-top:10px">
        <label class="fld"><span class="small muted">Initial term ends</span><input id="ap_end" type="date" value="${h(r.term_end_iso || "")}"></label>
        <label class="fld"><span class="small muted">Notice to stop renewal (days)</span><input id="ap_notice" type="number" min="0" max="365" value="${r.notice_days != null ? r.notice_days : ""}"></label>
        <button class="btn pri" id="ap_go" style="align-self:flex-end">Add to Pulse →</button></div>`}</div>`;
}
function PR_owner(t, r){ const ref = window.PG.parseRef(t), code = ref ? ref.code : (window.PG.industryFor((r.agreement_type || "") + " " + t.slice(0, 1500)) || "gen");
  const per = r.fee && r.fee.n ? (r.fee.per === "year" ? r.fee.n : r.fee.n * 12) : 2400000;
  return { owner:OWNER_FOR[code] || "kavya", category:CAT_FOR[code] || "Services", annual:Math.round(per) }; }
function addedHTML(){ const s = sup(added); if(!s) return ""; const c = E.clock(s), o = E.ownerOf(s), q = verifyItems().filter(x => x.s.id === s.id).length;
  return `<div class="callout good"><div class="eyebrow" style="color:var(--green)">Added to Pulse</div><b>${h(s.name)}</b> is now a live renewal: notice due <b>${E.fmtD(c.deadline)}</b> (${c.days} days).</div>
    <button class="btn pri" id="ap_follow" style="margin-top:12px;width:100%">▶ Follow this contract through Pulse (${q ? 7 : 6} steps)</button>
    <p class="small muted" style="margin:6px 0 0">A short guided run on your contract: radar, cited terms, ${q ? "Legal, " : ""}the owner's check-in, the decision, and what the supplier receives.</p>
    <div class="sep2">Or jump straight to</div>
    <div class="grid" style="gap:8px;margin-top:8px">
      <a class="btn sec" href="#radar">See it on the renewal radar →</a>
      <a class="btn sec" href="#c-${s.id}">Open the contract with cited terms →</a>
      ${q ? `<button class="btn sec" data-persona="rahul" data-goto="verify">${q} term${q > 1 ? "s" : ""} waiting in Rahul's Legal queue →</button>` : ""}
      <button class="btn sec" data-persona="${o.id}" data-goto="inbox">${h(o.name.split(" ")[0])}'s 60-second check-in →</button>
      <a class="btn sec" href="#packet-${s.id}">Open the renewal packet →</a></div>
    <button class="btn ghost sm" id="ap_again" style="margin-top:10px">Read another contract</button>`; }

function stepper(){ const st = added && sup(added) ? 4 : addResult ? 3 : addText ? 2 : 1;
  const L = ["Get a contract","Read it","Review what Pulse found","Add it to Pulse"];
  return `<ol class="stepper">${L.map((t, i) => `<li class="${i + 1 < st ? "done" : i + 1 === st ? "cur" : ""}"><span class="n">${i + 1 < st ? "✓" : i + 1}</span>${t}</li>`).join("")}</ol>`; }
function add(){
  return `<div class="pagehead"><div><div class="eyebrow">Add a contract</div><h1>Drop in any contract</h1><p>Pulse reads it, pulls out the terms that drive renewals and money, and quotes the exact words for each. It checks every quote really appears in your document, works out the deadline by code, runs a health check, and can add the contract to the live workflow.</p></div><span class="aib">${A().aiBadge()}</span></div>
  ${stepper()}
  ${genCard()}
  <div class="grid g2" style="align-items:start">
    <div class="card pad"><h3>1. Your document</h3>
      <div class="row" style="margin:12px 0"><label class="btn ${gen && !addText ? "pri hl" : "sec"} sm" style="cursor:pointer" data-tour="upload">Upload .pdf, .docx or .txt<input type="file" id="file" accept=".txt,.md,.pdf,.docx" style="display:none"></label>
        <select id="demoDoc" style="border:1px solid var(--line);border-radius:8px;padding:8px;background:#fff;min-height:38px;max-width:100%"><option value="">…or load one of Vyom's contracts</option>${window.PULSE_DOCS.filter(d => !/letter|quote/i.test(d.type) && !/^u/.test(d.id)).map(d => `<option value="${d.id}">${h(d.title)} (${h(E.DOCS[d.id].type)})</option>`).join("")}</select></div>
      <textarea id="addtxt" class="draft" style="min-height:360px;font-family:Georgia,serif;font-size:13.5px" placeholder="…or paste contract text here">${h(addText)}</textarea>
      <div class="row" style="justify-content:space-between;margin-top:12px"><span class="small muted" id="addinfo">${addText ? addText.split(/\s+/).filter(Boolean).length + " words" : ""}</span>
        <span class="row" style="gap:8px"><button class="btn ghost sm" id="extractRules" ${addBusy ? "disabled" : ""} title="Fixed rules only, no AI">Basic reader</button><button class="btn ai ${addText && !addResult && !addBusy ? "hl" : ""}" id="extract" ${addBusy ? "disabled" : ""}>${addBusy ? "Reading…" : "Read the contract"}</button></span></div></div>
    <div class="card pad" id="addres">${addResult ? resultHTML(addResult) : `<h3>2. What Pulse found</h3><p class="muted" style="margin-top:10px">Results appear here: term end, renewal, notice period, how notice must be sent, price limits, fees, service levels, credits, exit rights and payment terms, each with its quote and a verification tick. Then a health check, and a button to add the contract to Pulse.</p>
      <div class="callout" style="margin-top:12px">Live AI reads any wording. When live AI isn't available, a basic rules-based reader takes over, so this works for everyone.</div>`}</div></div>`;
}

/* ───────── LOG + north star ───────── */
function log(){
  const decs = Object.entries(E.S.decisions);
  const due = deep().filter(s => !E.clock(s).evergreen);
  const onTime = due.filter(s => E.S.decisions[s.id]).length;
  const total = decs.reduce((a, [, d]) => a + d.value, 0);
  return `<div class="pagehead"><div><div class="eyebrow">Decisions and value</div><h1>Did the right person decide in time?</h1><p>The north star counts renewals where someone made a deliberate choice (renew, renegotiate, reduce or exit) <b>before</b> the notice deadline.</p></div><a class="btn sec" href="#story">Metrics in the Story</a></div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="card kpi"><div class="k num" style="color:var(--purple)">${onTime} of ${due.length}</div><div class="l">demo renewals decided before their deadline (north star)</div></div>
    <div class="card kpi"><div class="k num" style="color:var(--green)">${E.inr(total)}</div><div class="l">value protected by these decisions</div></div>
    <div class="card kpi"><div class="k num">~30%</div><div class="l">estimated baseline today, from Vertice's finding that 70% of tail renewals get no review</div></div></div>
  <div class="card scroll"><table class="stack"><thead><tr><th>Supplier</th><th>Decision</th><th>Decided</th><th>Deadline</th><th class="r">Value protected</th></tr></thead><tbody>
  ${decs.length ? decs.map(([id, d]) => { const s = sup(id), c = E.clock(s); return `<tr><td><b style="font-weight:600">${h(s.name)}</b></td><td>${h(d.title)}</td><td>${h(d.when)} · ${h(d.by)}</td><td>${c.evergreen ? "Rolling" : E.fmtD(c.deadline) + ` (${c.days} days spare)`}</td><td class="r num">${E.inr(d.value)}</td></tr>`; }).join("") : `<tr><td colspan="5" class="muted">No decisions yet. Approve a renewal packet to log one.</td></tr>`}
  </tbody></table></div>`;
}


/* ───────── SUPPLIER (external) ───────── */
let mailSel = null, replyMode = null;
function supplierView(){
  const sent = Object.entries(E.S.decisions).filter(([id, d]) => d.draft && !/^\(No message/.test(d.draft.split("\n\n").slice(1).join("")));
  const head = `<div class="pagehead"><div><div class="eyebrow">External · supplier's inbox</div><h1>What the supplier receives</h1><p>The supplier sees only what Vyom chooses to send: a clear message with the exact contract clauses attached, so there's no argument about what was agreed. They can acknowledge, propose an alternative or ask a question.</p></div></div>`;
  if(!sent.length) return head + `<div class="card pad" style="text-align:center;padding:40px"><h3>No messages yet</h3><p class="muted" style="margin:8px 0 16px">Approve a renewal packet as Priya, then come back here to see it from the supplier's side.</p><button class="btn pri" data-goto="packet-talentbridge" data-persona="priya">Open TalentBridge's packet as Priya →</button></div>`;
  if(!mailSel || !E.S.decisions[mailSel]) mailSel = sent[0][0];
  const s = sup(mailSel), d = E.S.decisions[mailSel], T = E.terms(s), rep = (E.S.replies || {})[mailSel];
  const lines = d.draft.split("\n"); const subj = (lines.find(l => /^Subject:/.test(l)) || "Subject: Message from Vyom").replace("Subject: ", "");
  const body = d.draft.split("\n").filter(l => !/^(To|Subject):/.test(l)).join("\n").trim();
  const refs = ["notice","cap","adjust","credit","claim","rates","dispute","tfc","reduce"].filter(f => T[f] && body.includes("Clause " + String(T[f].cur.cl).split(/[–-]/)[0]) || (T[f] && (f === "rates" || f === "adjust") && /Schedule A|Clause 3\.[23]/.test(body))).slice(0, 4);
  return head + `<div class="mail"><div class="card" style="padding:6px">${sent.map(([id, x]) => { const ss = sup(id), sj = (x.draft.split("\n").find(l => /^Subject:/.test(l)) || "").replace("Subject: ", "");
      return `<button class="mailitem ${id === mailSel ? "on" : ""}" data-mail="${id}"><span class="small muted">To ${h(P.supplierContacts[id] || ss.name)}</span><br><b style="font-weight:600">${h(ss.name)}</b><br><span class="small ink2">${h(sj)}</span>${(E.S.replies || {})[id] ? `<br><span class="chip green" style="margin-top:6px">Replied</span>` : ""}</button>`; }).join("")}</div>
    <div class="grid"><div class="card pad"><div class="small muted">From: Priya Nair, Procurement, Vyom Technologies &lt;procurement@vyomtech.in&gt; · ${h(d.when)}<br>To: ${h(P.supplierContacts[mailSel] || s.name)}</div><h3 style="margin:10px 0 12px">${h(subj)}</h3><div class="mailbody">${h(body)}</div>
      ${refs.length ? `<div class="callout" style="margin-top:12px"><div class="eyebrow">Contract references attached by Pulse</div>${refs.map(f => `<div style="margin:8px 0"><b style="font-weight:600">${h(E.DOCS[T[f].cur.doc].title)}, cl. ${h(T[f].cur.cl)}</b><div style="font-family:Georgia,serif;font-size:14px;color:var(--ink2)">"…${h(T[f].cur.q)}…"</div></div>`).join("")}</div>` : ""}</div>
      <div class="card pad">${rep ? `<div class="callout good"><div class="eyebrow" style="color:var(--green)">You replied</div><b>${h({ ack:"Acknowledged", alt:"Proposed an alternative", q:"Asked a question" }[rep.type])}</b>${rep.text ? `: "${h(rep.text)}"` : ""}</div><p class="small muted" style="margin-top:8px">Priya sees this inside her packet, logged against the decision.</p><button class="btn sec sm" data-goto="packet-${mailSel}" data-persona="priya">See it in Priya's packet →</button>` :
        `<h3>Reply</h3><div class="row" style="margin-top:10px"><button class="btn pri sm" data-rep="ack">Acknowledge</button><button class="btn sec sm" data-rep="alt">Propose an alternative</button><button class="btn sec sm" data-rep="q">Ask a question</button></div>
        ${replyMode ? `<textarea id="reptxt" class="draft" style="min-height:110px;margin-top:12px" placeholder="${replyMode === "alt" ? "e.g. We can accept 5% if the term is extended to 2 years" : "Your question"}"></textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn pri sm" id="repsend">Send reply</button></div>` : ""}`}</div></div></div>`;
}

/* ───────── router + binding ───────── */
function view(r){
  if(r === "radar") return radar(); if(r === "contracts") return contracts(); if(r === "inbox") return inbox(); if(r === "mine") return mine();
  if(r === "verify") return verify(); if(r === "finance") return finance(); if(r === "ask") return askView(); if(r === "add") return add(); if(r === "log") return log(); if(r === "supplier") return supplierView(); if(r === "onboard") return window.PX.onboard();
  if(r.startsWith("c-")) return dossier(r.slice(2)); if(r.startsWith("packet-")) return packet(r.slice(7));
  return radar();
}
function bind(r){
  const on = (sel, ev, fn) => document.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));
  on("[data-open]", "click", e => { if(e.target.closest("a,button")) return; const id = e.currentTarget.dataset.open; if(sup(id)) A().go("packet-" + id); else lightModal(id); });
  on("[data-light]", "click", e => { e.stopPropagation(); lightModal(e.currentTarget.dataset.light); });
  on("[data-go]", "click", e => A().go(e.currentTarget.dataset.go));
  on("[data-goto]", "click", e => { e.preventDefault(); A().go(e.currentTarget.dataset.goto, e.currentTarget.dataset.persona); });
  /* contracts */
  const qi = document.getElementById("q"); if(qi){ qi.oninput = () => { q = qi.value; const pos = qi.selectionStart; document.getElementById("main").innerHTML = contracts(); bind(r); const n = document.getElementById("q"); n.focus(); n.setSelectionRange(pos, pos); }; }
  on("[data-cat]", "click", e => { cat = e.currentTarget.dataset.cat; A().render(); });
  /* dossier */
  on("[data-doc]", "click", e => { curDoc = e.currentTarget.dataset.doc; curQuote = null; A().render(); });
  if(r.startsWith("c-")){ document.querySelectorAll(".term [data-where]").forEach(b => { b.addEventListener("click", ev => { ev.stopImmediatePropagation(); ev.preventDefault(); const [d, i] = b.dataset.where.split("|"); const s = sup(r.slice(2)); curDoc = d; curQuote = s.terms[+i].q; document.querySelectorAll("[data-doc]").forEach(t => t.classList.toggle("on", t.dataset.doc === d)); const v = document.getElementById("docv"); v.innerHTML = A().docHTML(d, curQuote); const m = document.getElementById("hl"); if(m){ if(window.innerWidth < 1000) v.scrollIntoView({ behavior:"smooth" }); setTimeout(() => m.scrollIntoView({ block:"center", behavior:"smooth" }), 60); } }, true); }); }
  /* packet */
  if(r.startsWith("packet-")) bindPacket(sup(r.slice(7)));
  /* inbox */
  if(r === "inbox") bindInbox();
  /* verify */
  on("[data-lqdraft]", "click", async e => { const b = e.currentTarget, id = b.dataset.lqdraft, q = (E.S.legal || []).find(x => x.id === id), ta = document.getElementById("lqa-" + id); if(!q || !ta) return;
    const sp = sup(q.sid), who = P.people[q.from] || { name:"there" }, first = who.name.split(" ")[0];
    b.disabled = true; b.textContent = "Drafting…";
    try { const docs = sp.docs.map(d => E.DOCS[d]).map(d => `=== ${d.title} (dated ${E.fmtD(d.effective)}) ===\n${d.text}`).join("\n\n");
      const out = await E.ask(`You are Rahul Sen, commercial counsel at Vyom Technologies. Draft a short, friendly reply (3 to 5 sentences) to ${first}, a business owner who asked about the ${sp.name} contract. Base it ONLY on the contract text below; cite clauses like (cl. 7.1). If the contract doesn't settle it, say what it does say, what you'd check next, and that you'll confirm before anything goes to the supplier. Sign off as Rahul. No em dashes.\n\nQUESTION: ${q.q}\n\nCONTRACT:\n${docs.slice(0, 40000)}`, { modelTier:"quick" });
      ta.value = out.text.trim(); }
    catch(err){ const cx = String(q.context || "").replace(/Want me to send it to Rahul in Legal\?|I can send this to Rahul in Legal with one tap\.?|I can't answer that from the terms Pulse has extracted\.?/g, "").trim();
      ta.value = `Hi ${first}, thanks for checking with me. ${cx.length > 20 ? "Pulse's reading is right as far as the contract goes: " + cx + " " : ""}I'll review the ${sp.name} agreement on this point and confirm the position in writing before anything goes to the supplier. Rahul`; }
    b.disabled = false; b.textContent = "Draft a reply with AI"; ta.focus(); });
  on("[data-lqview]", "click", e => { const q = (E.S.legal || []).find(x => x.id === e.currentTarget.dataset.lqview); if(!q) return; selectThreadFor(q); });
  on("[data-lqsend]", "click", e => { const id = e.currentTarget.dataset.lqsend, ta = document.getElementById("lqa-" + id), v = ta ? ta.value.trim() : "";
    if(!v){ A().toast("Write a short reply first."); return; }
    const q = (E.S.legal || []).find(x => x.id === id); if(!q) return; q.status = "answered"; q.answer = v; q.by = "rahul"; E.save();
    const who = P.people[q.from]; A().toast(`Reply sent to ${who ? who.name.split(" ")[0] : "the owner"}'s Slack thread.`); A().render(); });
  function selectThreadFor(q){ thread[q.from] = q.sid; A().go("inbox", q.from); }
  on("[data-ok]", "click", e => { const k = e.currentTarget.dataset.ok, msg = e.currentTarget.dataset.msg; if(msg){ A().toast(msg + "."); if(/clean copy/.test(msg)) return; if(/stricter/.test(msg)) return; } E.S.verified[k] = "Rahul Sen"; E.save(); A().toast("Confirmed. Deadlines and packets now use the verified term."); A().render(); });
  /* finance */
  on("[data-fin]", "click", e => { const b = e.currentTarget; A().modal(`<h3>${h(b.dataset.act)}?</h3><p class="muted" style="margin-top:8px">This is a simulated action in the demo. In production it would place a payment hold in the ERP and email the supplier the clause-backed reason, after this confirmation.</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn sec" data-close>Cancel</button><button class="btn pri" id="finok">${h(b.dataset.act)}</button></div>`);
    document.getElementById("finok").onclick = () => { E.S.finance[b.dataset.fin] = b.dataset.act === "Hold payment" ? "On hold" : b.dataset.act === "Claim credits" ? "Claimed" : "Disputed"; E.save(); A().close(); A().toast("Done. Logged with the clause attached."); A().render(); }; });
  /* ask */
  if(r === "ask") bindAsk();
  if(r === "add") bindAdd();
  if(r === "onboard"){ const b = document.getElementById("obgo"); if(b) b.onclick = () => window.PX.runOnboard(); }
  if(r === "supplier"){
    document.querySelectorAll("[data-mail]").forEach(b => b.onclick = () => { mailSel = b.dataset.mail; replyMode = null; A().render(); });
    document.querySelectorAll("[data-rep]").forEach(b => b.onclick = () => { const t = b.dataset.rep; if(t === "ack"){ E.S.replies = E.S.replies || {}; E.S.replies[mailSel] = { type:"ack", text:"" }; E.save(); A().toast("Acknowledged. Vyom has your reply."); A().render(); } else { replyMode = t; A().render(); } });
    const rs = document.getElementById("repsend"); if(rs) rs.onclick = () => { const tx = document.getElementById("reptxt").value.trim(); if(!tx){ A().toast("Write a short reply first."); return; } E.S.replies = E.S.replies || {}; E.S.replies[mailSel] = { type:replyMode, text:tx }; replyMode = null; E.save(); A().toast("Reply sent to Vyom."); A().render(); };
  }
}

function bindPacket(s){
  const $ = id => document.getElementById(id);
  document.querySelectorAll("[data-opt]").forEach(el => { const f = () => { if(E.S.decisions[s.id]) return; sel[s.id] = el.dataset.opt; A().render(); }; el.onclick = f; el.onkeydown = e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); f(); } }; });
  if($("reassign")) $("reassign").onclick = () => { E.S.reassigned[s.id] = "arjun"; E.S.nudged[s.id] = 1; E.save(); A().toast("Arjun is now the owner. His check-in is on its way."); A().render(); };
  if($("nudge")) $("nudge").onclick = () => { E.S.nudged[s.id] = 1; E.save(); A().toast(`Check-in sent to ${E.ownerOf(s).name}.`); A().render(); };
  if($("approve")) $("approve").onclick = () => { const opts = E.options(s); const op = opts.find(x => x.key === (sel[s.id] || opts.rec)); const c = E.clock(s); const to = (E.terms(s).noticeHow || {}).cur;
    A().modal(`<div class="eyebrow">Confirm before sending</div><h3>${h(op.title)}</h3>
      <div class="check" style="margin-top:12px"><i>✓</i><span>To: ${h(to ? to.v : "supplier")}</span></div>
      ${c.evergreen ? "" : `<div class="check"><i>✓</i><span>Arrives before the deadline: ${E.fmtD(c.deadline)} (${c.days} days left)</span></div>`}
      <div class="check"><i>✓</i><span>Logged value protected: ${E.inr(op.value)}</span></div>
      ${!E.S.checkins[s.id] ? `<div class="callout warn" style="margin-top:10px">The owner hasn't replied yet. You can still decide; Pulse will note that the owner wasn't consulted.</div>` : ""}
      <p class="small muted" style="margin-top:10px">Demo: nothing is actually emailed. In production this sends from your mailbox and books the courier copy where the contract requires it.</p>
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn sec" data-close>Back</button><button class="btn pri" id="confirmSend">Approve and send</button></div>`);
    document.getElementById("confirmSend").onclick = () => { E.S.decisions[s.id] = { key:op.key, title:op.title, value:op.value, when:E.fmtD(E.TODAY), by:"Priya Nair", draft:$("draft") ? document.getElementById("draft").value : "", ownerConsulted:!!E.S.checkins[s.id] }; E.save(); A().close(); A().toast(`Approved. ${E.inr(op.value)} protected, ${c.evergreen ? "logged" : c.days + " days before the deadline"}.`); A().render(); }; };
  if($("undo")) $("undo").onclick = () => { delete E.S.decisions[s.id]; E.save(); A().render(); };
  if($("polish")) $("polish").onclick = async () => { const b = $("polish"), ta = $("draft"); b.disabled = true; b.textContent = "Polishing…";
    try { const facts = window.PD.facts(ta.value); const out = await E.ask(`You are helping a procurement manager at Vyom Technologies (India) write to a supplier. Improve the clarity and professional tone of this draft. Keep it firm and polite. You MUST keep every date, amount, percentage, clause number and email address exactly as written, and must not add any new facts, threats or legal claims. Return only the email text.\n\nFacts that must stay: ${facts.join("; ")}\n\nDRAFT:\n${ta.value}`, { modelTier:"default" });
      const missing = facts.filter(f => !out.text.includes(f)); ta.value = out.text.trim();
      A().toast(missing.length ? `Polished. Check these facts survived: ${missing.join(", ")}` : "Polished. All key facts checked and kept."); }
    catch(e){ A().toast(e && e.code === "unavailable" ? "Live AI isn't available in this view. The draft above was written from the contract terms." : "AI couldn't respond just now. Your draft is unchanged."); }
    b.disabled = false; b.textContent = "Polish with AI"; };
  if($("explainBtn")) $("explainBtn").onclick = async () => { const b = $("explainBtn"), box = $("explain"); b.disabled = true; b.textContent = "Thinking…"; box.innerHTML = `<div class="callout ai"><div class="eyebrow">AI second opinion · thinking…</div></div>`;
    const opts = E.options(s), ctx = window.PD.context(s);
    try { const out = await E.ask(`You are a sceptical procurement advisor. Here is a supplier situation and the options with computed values. In at most 5 short bullet points: say whether the recommended option is right, the biggest risk of choosing it, and one thing to check before sending. Use only the facts given; don't invent numbers.\n\n${ctx}\n\nOptions: ${opts.map(o => `${o.title} (value ${E.inr(o.value)})${o.key === opts.rec ? " [recommended]" : ""}`).join("; ")}\nOwner answer: ${JSON.stringify(E.S.checkins[s.id] || "none yet")}`, { modelTier:"default" });
      box.innerHTML = `<div class="callout ai mdx"><div class="eyebrow">AI second opinion · live</div>${E.md(out.text)}</div>`; }
    catch(e){ box.innerHTML = `<div class="callout ai"><div class="eyebrow">AI second opinion · stored</div>${window.PD.critique(s)}</div>`; }
    b.disabled = false; b.textContent = "Ask AI to challenge this recommendation"; };
}

function bindInbox(){
  const p = E.S.persona; const s = sup(thread[p]); if(!s) return; const st = stepTmp[s.id] = stepTmp[s.id] || {};
  const chat = document.getElementById("chat"); if(chat) chat.scrollTop = chat.scrollHeight;
  document.querySelectorAll("[data-thread]").forEach(b => b.onclick = () => { thread[p] = b.dataset.thread; A().render(); });
  document.querySelectorAll("[data-need]").forEach(b => b.onclick = () => { st.need = b.dataset.need; A().render(); });
  document.querySelectorAll("[data-rate]").forEach(b => b.onclick = () => { const d = document.getElementById("detail"), se = document.getElementById("seats"); if(d) st.detail = d.value; if(se) st.seats = +se.value; st.rating = +b.dataset.rate; A().render(); });
  const d = document.getElementById("detail"); if(d) d.oninput = () => st.detail = d.value;
  const se = document.getElementById("seats"); if(se) se.oninput = () => st.seats = +se.value;
  const cm = document.getElementById("cmt"); if(cm) cm.oninput = () => st.comment = cm.value;
  const send = document.getElementById("sendci"); if(send) send.onclick = () => {
    const detail = s.id === "lumen" && st.need === "change" ? `${st.seats || 15} people need it` : st.detail || "";
    E.S.checkins[s.id] = { need:st.need, detail, seats:s.id === "lumen" && st.need === "change" ? (st.seats || 15) : null, rating:st.rating, comment:st.comment || "", when:"today" }; E.save();
    A().toast("Sent. Priya in Procurement has your answer."); A().render(); };
  const ask = async () => { const inp = document.getElementById("askc"); const qv = inp.value.trim(); if(!qv) return; inp.value = "";
    E.S.qa = E.S.qa || {}; const log = E.S.qa[s.id] = E.S.qa[s.id] || []; const item = { q:qv, a:"…" }; log.push(item); A().render();
    const wantsLegal = /\b(legal|lawyer|counsel|rahul)\b/i.test(qv) && /\b(ask|check|confirm|send|get back|escalat|loop)/i.test(qv);
    const local = localAnswer(s, qv);
    const strip = t => String(t || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    try {
      const docs = s.docs.map(id => E.DOCS[id]).map(d => `=== ${d.title} (${d.type}, dated ${E.fmtD(d.effective)}) ===\n${d.text}`).join("\n\n");
      const hist = log.slice(0, -1).slice(-4).map(x => `Q: ${x.q}\nA: ${strip(x.a)}`).join("\n");
      const out = await E.ask(`You are Pulse, answering a business owner's question in Slack about ONE supplier contract. Use ONLY the computed facts and contract documents below; never invent a fact.
Rules:
- Answer in 2 to 4 plain sentences and cite clauses like (cl. 2.1).
- If the answer is stated in the documents, give it.
- If it is not stated but can be worked out from the text, begin with "Not stated directly. Worked out:" and show the working with clause numbers.
- If it cannot be answered from these documents, or needs a legal judgement, say so in one sentence and end your reply with the marker [LEGAL].
- If the person asks you to check with Legal or a lawyer, say you can send the question to Rahul in Legal with one tap, and end your reply with [LEGAL].
- Where an amendment changes a clause, the newer wording applies.

COMPUTED FACTS (worked out by code; trust these):
${window.PD.context(s)}

CONTRACT DOCUMENTS:
${docs.slice(0, 40000)}
${hist ? `\nCONVERSATION SO FAR:\n${hist}\n` : ""}
QUESTION: ${qv}`, { modelTier:"quick" });
      let t = out.text; item.legal = /\[LEGAL\]/.test(t) || wantsLegal; t = t.replace(/\[LEGAL\]/g, "").trim();
      item.a = E.md(t);
    } catch(e){
      if(wantsLegal){ item.a = "I can send this to Rahul in Legal with one tap."; item.legal = true; }
      else if(local) item.a = local;
      else { item.a = "I can't answer that from the terms Pulse has extracted. Want me to send it to Rahul in Legal?"; item.legal = true; }
    }
    E.save(); A().render(); const ch = document.getElementById("chat"); if(ch) ch.scrollTop = ch.scrollHeight; };
  { const ch = document.getElementById("chat"); if(ch && ((E.S.qa || {})[s.id] || []).length) ch.scrollTop = ch.scrollHeight; }
  document.querySelectorAll("[data-legal]").forEach(b => b.onclick = () => {
    const log = (E.S.qa || {})[s.id] || [], k = +b.dataset.legal, it = log[k]; if(!it) return;
    /* "ask legal about it" refers back to the last real question */
    let q = it.q;
    const rest = q.replace(/[,.;]?\s*(can you |could you |please )?(ask|check with|confirm with|send (it|this) to|loop in|escalate to)( the)? (legal|lawyer|counsel|rahul)( team)?( and get back to me)?[.!]?/ig, "").trim();
    if(rest.length >= 12) q = rest; else if(k > 0) q = log[k - 1].q;
    const id = "lq" + Date.now().toString(36);
    E.S.legal = (E.S.legal || []).concat([{ id, sid:s.id, from:E.S.persona, q, context:(q === (log[k - 1] || {}).q && it.q !== q) ? strip2(log[k - 1].a) : strip2(it.a), status:"open" }]);
    it.sent = id; E.save(); A().toast("Sent to Rahul in Legal. His reply will appear in this thread."); A().render(); });
  const b = document.getElementById("askcb"); if(b) b.onclick = ask;
  const i = document.getElementById("askc"); if(i) i.onkeydown = e => { if(e.key === "Enter") ask(); };
}

function bindAsk(){
  window.PX.bindShock();
  const run = async (qv, pre) => { const card = { html:"" }; askLog.unshift(card);
    const local = pre != null ? window.PD.preset(pre) : null;
    card.html = `<div class="card pad"><div class="eyebrow">You asked</div><h3>${h(qv)}</h3><div class="ans" style="margin-top:10px">${local ? local : '<span class="muted">Reading your contracts…</span>'}</div></div>`; A().render();
    if(local) return;
    try { const ctx = deep().map(s => window.PD.context(s)).join("\n\n"); const out = await E.ask(`You answer questions about a company's supplier contracts. Use ONLY the extracted terms below. For every supplier you mention, cite it as [supplier name, document cl. X]. If a supplier's terms don't cover the question, say so. Be concise: a one-sentence answer first, then a short bullet per relevant supplier.\n\n${ctx}\n\nQuestion: ${qv}`, { modelTier:"default", onText: ({ text }) => { const el = document.querySelector("#answers .ans"); if(el) el.innerHTML = E.md(text); } });
      card.html = `<div class="card pad"><div class="row between"><div><div class="eyebrow">You asked</div><h3>${h(qv)}</h3></div><span class="badge-ai">Live AI</span></div><div class="mdx" style="margin-top:10px">${E.md(out.text)}</div><p class="small muted" style="margin-top:8px">Answered from the six fully read contracts. Click a supplier in Contracts to see each clause.</p></div>`; }
    catch(e){ const guess = /tariff|fuel|duty|surcharge|pass/i.test(qv) ? 0 : /exit|terminat|cancel|30 days/i.test(qv) ? 1 : /credit|sla|service level/i.test(qv) ? 2 : /cap|increase|overbill|invoice|price/i.test(qv) ? 3 : null;
      card.html = `<div class="card pad"><div class="eyebrow">You asked</div><h3>${h(qv)}</h3><div style="margin-top:10px">${guess != null ? `<div class="callout" style="margin-bottom:10px">Live AI isn't available in this view, so here is the closest stored answer.</div>${window.PD.preset(guess)}` : `<div class="callout">Live AI isn't available in this view. Try one of the suggested questions; they're answered directly from the extracted terms.</div>`}</div></div>`; }
    A().render(); };
  const f = document.getElementById("askf"); if(f) f.onsubmit = e => { e.preventDefault(); const v = document.getElementById("askq").value.trim(); if(v) run(v); };
  document.querySelectorAll("[data-pre]").forEach(b => b.onclick = () => run(PRESETS[+b.dataset.pre], +b.dataset.pre));
}

function bindAdd(){
  const ta = document.getElementById("addtxt"), info = document.getElementById("addinfo"), $ = id => document.getElementById(id), G = window.PG;
  ta.oninput = () => { addText = ta.value; info.textContent = addText.split(/\s+/).filter(Boolean).length + " words"; };
  $("demoDoc").onchange = e => { const d = E.DOCS[e.target.value]; if(d){ addText = d.text; addResult = null; added = null; A().render(); } };
  $("file").onchange = async e => { const f = e.target.files[0]; if(!f) return; info.textContent = "Reading file…";
    try { addText = await window.PD.readFile(f); addResult = null; added = null; A().render(); A().toast(`Loaded ${f.name}. Now click "Read the contract".`); }
    catch(err){ info.textContent = err && err.code === "scanned" ? "This PDF looks scanned (no text layer). In production Pulse runs OCR; here, paste the text instead." : err && err.code === "pdfreader" ? "The PDF reader couldn't load in this view. Generated test PDFs always work; for other PDFs, paste the text." : "Couldn't read that file. Try pasting the text instead."; } };
  const run = async mode => { if(!addText.trim()){ A().toast("Add some contract text first."); return; }
    addBusy = true; added = null; A().render();
    const box = $("addres"); if(box) box.innerHTML = `<h3>2. What Pulse found</h3><div class="callout ai" style="margin-top:12px"><div class="eyebrow">${mode === "rules" ? "Reading with the basic reader…" : "Reading the contract…"}</div><span id="prog">Starting</span></div>`;
    try { addResult = await window.PD.extract(addText, { mode, onText: ({ text }) => { const p = document.getElementById("prog"); if(p) p.textContent = `Live AI is extracting terms… ${text.length} characters received`; } }); }
    catch(e){ addResult = null; A().toast("Something went wrong. Please try again."); }
    addBusy = false; A().render(); const r = $("addres"); if(r) r.scrollIntoView({ block:"start", behavior:"smooth" }); if(window.PT) window.PT.after(); };
  $("extract").onclick = () => run("auto");
  $("extractRules").onclick = () => run("rules");
  /* generator */
  $("gind").onchange = e => { genInd = e.target.value; };
  $("gfree").oninput = e => { genFree = e.target.value.slice(0, 60); };
  document.querySelectorAll("[data-trap]").forEach(b => b.onclick = () => { genTrap = b.dataset.trap === "1"; A().render(); });
  $("ggo").onclick = async () => {
    const free = genFree.trim(), code = free ? (G.industryFor(free) || "gen") : genInd, ref = G.makeRef(code, genTrap, !!free && code === "gen");
    let scope = null, sla = null;
    if(free && code === "gen"){ genBusy = true; A().render();
      try { const t = await G.tailor(free); scope = t.scope; sla = t.sla; } catch(e){ scope = `provide ${free.toLowerCase()} services to the Customer at its offices in Pune and Bengaluru, as described in Schedule A`; }
      genBusy = false; }
    G.store.set(ref, { scope, sla, industry:free || null });
    const d = G.build(ref, scope, sla, free || null); gen = { ...d, trap:genTrap, industry:free || null };
    A().render(); A().toast("Test contract ready. Download it, then upload it below."); };
  if($("gpdf")) $("gpdf").onclick = () => { G.download(G.pdf(gen), gen.filename + ".pdf"); A().toast("PDF downloaded. Now click Upload and pick it."); };
  if($("gtxt")) $("gtxt").onclick = () => G.download(new Blob([gen.text], { type:"text/plain" }), gen.filename + ".txt");
  if($("guse")) $("guse").onclick = () => { addText = gen.text; addResult = null; added = null; A().render(); const t = $("addtxt"); if(t) t.scrollIntoView({ block:"center", behavior:"smooth" }); };
  /* add to Pulse */
  if($("ap_go")) $("ap_go").onclick = () => {
    const end = $("ap_end").value, nd = $("ap_notice").value === "" ? null : +$("ap_notice").value;
    if(!end || nd == null){ A().toast("Pulse needs the term end date and notice period to track the deadline."); return; }
    const r = addResult, o = PR_owner(addText, r);
    if(!r.terms.find(x => x.field === "notice_days")){ const base = r.terms.find(x => x.field === "renewal") || r.terms[0]; if(base) r.terms.push({ field:"notice_days", value:nd + " days", clause:base.clause, quote:base.quote, confidence:.5 }); }
    r.notice_days = nd; if(r.term_end_iso !== end){ r.term_end_iso = end; }
    const s = window.PR.toSupplier(r, addText, { name:$("ap_name").value.trim(), owner:$("ap_owner").value, annual:+$("ap_val").value || o.annual, category:o.category, termEnd:end, noticeDays:nd, ref:(G.parseRef(addText) || {}).ref });
    added = s.id; A().render(); A().toast(`${s.name} added. Check-in sent to ${E.ownerOf(s).name}.`); if(window.PT) window.PT.after(); };
  if($("ap_follow")) $("ap_follow").onclick = () => window.PT.follow(added);
  if($("ap_again")) $("ap_again").onclick = () => { addText = ""; addResult = null; added = null; A().render(); window.scrollTo({ top:0 }); };
}

/* everything this screen-level code remembers, cleared by "Reset demo" */
function resetLocal(){ q = ""; cat = "All"; curDoc = null; curQuote = null; for(const k in sel) delete sel[k]; thread = {}; stepTmp = {}; askLog = [];
  addText = ""; addResult = null; addBusy = false; gen = null; genBusy = false; genInd = "it"; genTrap = true; genFree = ""; added = null; mailSel = null; replyMode = null; }
window.PV = { view, bind, verifyItems, myThreads, resetLocal, selectThread:(p, id) => { thread[p] = id; }, selectMail:id => { mailSel = id; } };
})();
