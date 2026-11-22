/* Pulse: drafts, checks, stored answers, file reading and live extraction */
(function(){
const P = window.PULSE, E = window.PE;
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sup = id => P.suppliers.find(s => s.id === id);
const sign = `\n\nRegards,\nPriya Nair\nCategory Manager, Procurement\nVyom Technologies Private Limited`;

function draft(s, key){
  const c = E.clock(s), T = E.terms(s), ci = E.S.checkins[s.id];
  const how = T.noticeHow ? T.noticeHow.cur.v : "", em = how.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const to = em ? em[0] + (/courier|post/i.test(how) ? "  (copy by courier, as the contract requires)" : "") : how;
  const subj = t => `To: ${to}\nSubject: ${t}\n\n`;
  if(s.id === "cleanspace"){
    if(key === "exit") return subj("Notice of non-renewal: Facility Services Agreement dated 1 March 2024") + `Dear Sir/Madam,\n\nIn accordance with Clause 14.2 of the Facility Services Agreement dated 1 March 2024, as amended by Amendment No. 1 dated 1 June 2025, Vyom Technologies gives notice that it does not wish to renew the Agreement beyond the end of the Initial Term on 28 February 2027.\n\nWe would welcome a proposal for a new agreement as part of our re-tender, and we will share the timeline separately.\n\nThis notice is also being sent by registered post to your registered office, as Clause 14.1 requires.` + sign;
    if(key === "renew") return subj("Facility Services Agreement: renewal") + `Dear CleanSpace team,\n\nWe confirm that we are content for the Facility Services Agreement to renew on 1 March 2027 on its current terms.` + sign;
    return subj("Facility Services Agreement: service credits and terms for renewal") + `Dear CleanSpace team,\n\nAhead of the renewal of our Facility Services Agreement on 1 March 2027, we write about three points.\n\n1. Service credits. The hygiene audit score was 88% in August and 89% in October 2026, below the 90% required by Clause 4.1. Under Clause 4.3 we claim credits of 3% of the monthly fee for each month, ₹46,500 per month, ₹93,000 in total. Please reflect these on your next invoice.\n\n2. Improvement plan. Before the renewal, please share a site-level plan to keep the audit score at or above 90% at Kharadi, Whitefield and Hinjewadi.\n\n3. Pricing. Any fee revision for 2027 must stay within the 5% annual cap in Clause 3.2, as amended by Amendment No. 1.${ci && ci.detail ? `\n\nOur site team has also asked us to discuss: ${ci.detail}.` : ""}\n\nPlease respond by 15 December 2026 so we can finalise the renewal.` + sign;
  }
  if(s.id === "sentinel"){
    if(key === "exit") return subj("Claim for service credits and notice of termination: Security Services Agreement") + `Dear Sentinel team,\n\n1. Under Clause 4.3 we claim service credits for September and October 2026, when guard post coverage was 95.4% and 94.8% against the 98% required by Clause 4.1: 5% of the monthly charge for each month, ₹46,500 per month, ₹93,000 in total.\n\n2. Under Clause 5.1, Vyom gives sixty (60) days' written notice to terminate the Agreement without cause. Termination will take effect sixty days from the date of this notice. We will agree handover arrangements with you separately.\n\nThis notice is also being sent by courier, as Clause 6.1 requires.` + sign;
    if(key === "renew") return subj("Security services: no action") + `(No message needed now. Note: the September credit must be claimed by 29 November 2026.)`;
    return subj("Claim for service credits: September and October 2026") + `Dear Sentinel team,\n\nGuard post coverage was 95.4% in September and 94.8% in October 2026, below the 98% required by Clause 4.1 of our Security Services Agreement dated 1 April 2025.\n\nUnder Clause 4.2, we claim service credits of 5% of the monthly charge for each month, ₹46,500 per month, ₹93,000 in total. This claim is made within the 60-day period set by Clause 4.3. Please confirm and adjust your next invoice.\n\nCoverage also fell short in August. We would like a written coverage remedy plan with weekly reporting by 10 December 2026, as this will inform our renewal decision in January.` + sign;
  }
  if(s.id === "talentbridge"){
    if(key === "renew") return subj("Rate revision") + `Dear TalentBridge team,\n\nWe acknowledge your letter of 10 November 2026 and accept the revised rates from 1 February 2027.` + sign;
    const exit = key === "exit" ? `\n\n3. Notice of non-renewal. Under Clause 2.2, Vyom gives notice that it will not renew the Agreement beyond 31 January 2027. We will agree a transition plan for current associates.` : "";
    return subj("Your rate revision proposal and invoice INV-TB-2610") + `Dear TalentBridge team,\n\nThank you for your letter of 10 November 2026.\n\n1. Rate revision. Clause 3.2 of our Master Staffing Services Agreement allows a revision of at most 5% of the rates in force, with 45 days' written notice before the renewal date. We cannot accept the proposed 9% increase. We are open to discussing a revision within the 5% limit, supported by your cost data.\n\n2. Invoice INV-TB-2610 (October 2026). Four associates on Work Orders at role level L2 (Engineer, ₹1,900 per hour) were billed at L3 (Senior Engineer, ₹2,600 per hour). Note (b) of Schedule A requires the billed level to match the Work Order. For 168 hours each, this is an overcharge of ₹4,70,400. Under Clause 3.4 we dispute this amount and will pay the undisputed portion. Please issue a credit note.${exit}` + sign;
  }
  if(s.id === "lumen"){
    const n = ci && ci.seats ? ci.seats : 15;
    if(key === "exit") return subj("Notice of non-renewal: Order Form LA-2025-0117") + `Dear Lumen team,\n\nUnder Clause 1.2 of Order Form LA-2025-0117, Vyom Technologies gives notice that it will not renew its subscription beyond 14 January 2027.\n\nPlease update our account contact from Rohit Kulkarni, who has left Vyom, to Arjun Mehta.` + sign;
    if(key === "renew") return subj("Renewal") + `Dear Lumen team,\n\nWe confirm renewal of 40 licences.` + sign;
    return subj("Order Form LA-2025-0117: licence reduction and renewal pricing") + `Dear Lumen team,\n\nThank you for your renewal quote of 5 November 2026. Please note that Rohit Kulkarni has left Vyom; Arjun Mehta is now our account contact.\n\n1. Licence reduction. Under Clause 2.2, we give notice that we will reduce our subscription from 40 to ${n} named user licences from the renewal on 15 January 2027.\n\n2. Renewal price. Clause 2.1 caps any increase in the per-user fee at 7% over the preceding term. The quoted ₹1,05,600 per user is a 10% increase. The renewal fee should not exceed ₹1,02,720 per user.\n\nPlease send a revised order form for ${n} licences at no more than ₹1,02,720 per user per year.` + sign;
  }
  if(s.id === "northstar"){
    if(key === "renew") return subj("Surcharge notice of 14 November 2026") + `Dear Northstar team,\n\nWe accept the surcharge from 1 December 2026.` + sign;
    const exit = key === "exit" ? `\n\nSeparately, under Clause 2.2 Vyom gives thirty (30) days' notice that it will not renew the Rate Contract beyond 31 December 2026.` : `\n\nWe value our relationship and are content for the Rate Contract to renew on 1 January 2027 on its current terms, as Clause 2.2 provides.`;
    return subj("Your surcharge notice of 14 November 2026") + `Dear Northstar team,\n\nWe have received your notice of a 6% global tariff and fuel surcharge from 1 December 2026. Under our Rate Contract dated 1 January 2026, we cannot accept it, for three reasons:\n\n1. Clause 3.1 makes the rates firm for the term of the contract.\n2. Clause 3.2 allows an adjustment only where a change in government-imposed duty, tariff or levy, or a change of more than 10% in the published diesel price, directly increases your cost. No such change has been evidenced.\n3. Clause 3.3 requires at least 30 days' prior written notice with documentary evidence, and caps any adjustment at 3% in a contract year. Your notice gave 17 days and no evidence.\n\nPlease continue to invoice at the Annexure 1 rates. If a qualifying change occurs, we will review your evidence under Clause 3.3.${exit}` + sign;
  }
  if(s.id === "brightwave"){
    if(key === "renew") return subj("Retainer") + `(No message needed: the retainer continues month to month.)`;
    if(key === "exit") return subj("Notice of termination: Creative Services Retainer Agreement") + `Dear Brightwave team,\n\nUnder Clause 2.2 of the Creative Services Retainer Agreement dated 1 June 2025, Vyom Technologies gives thirty (30) days' written notice to end the Agreement. Thank you for your work on the 2026 brand launch; we hope to work with you again on future projects through statements of work.` + sign;
    return subj("Retainer scope for 2027") + `Dear Brightwave team,\n\nThank you for your work on the 2026 brand launch. Since Statement of Work No. 1 ended on 31 March 2026, our use of the retainer has fallen to 18–34 hours a month against the 120 hours included under Clause 3.1.\n\nWe propose reducing the monthly retainer from ₹4,50,000 to ₹2,00,000 for up to 50 hours, from 1 January 2027, with larger work agreed through statements of work under Clause 3.2. If this doesn't suit, either party may end the Agreement on 30 days' notice under Clause 2.2.\n\nCould we discuss this week?` + sign;
  }
  if(s.added){
    const n = T.notice ? T.notice.cur : null, cap = T.cap ? T.cap.cur : null, docT = E.DOCS[s.docs[0]];
    const ref = `${docT.title} dated ${E.fmtD(docT.effective)}`, first = s.name.split(" ")[0];
    if(key === "exit") return subj(`Notice of non-renewal: ${ref}`) + `Dear Sir/Madam,\n\nIn accordance with ${n ? "Clause " + n.cl : "the notice provisions"} of the ${ref}${s.docs.length > 1 ? ", as amended" : ""}, Vyom Technologies Private Limited gives notice that it will not renew the Agreement beyond ${E.fmtD(c.periodEnd)}.\n\nPlease treat this letter as written notice of non-renewal. We will contact you to agree an orderly handover before that date.` + sign;
    if(key === "renew") return subj(`${docT.title}: renewal`) + `Dear ${first} team,\n\nWe confirm that we are content for the ${ref} to renew on ${E.fmtD(c.renewOn)} on its current terms.` + sign;
    return subj(`${docT.title}: terms for renewal on ${E.fmtD(c.renewOn)}`) + `Dear ${first} team,\n\nOur ${ref} renews on ${E.fmtD(c.renewOn)}. Before it does, we would like to agree two points.\n\n1. Pricing. ${cap && /%/.test(cap.v) ? `Clause ${cap.cl} allows an increase of ${cap.v.replace(/^Up to /i, "up to ")}. We ask that fees for the next term are held at the current level.` : "We ask that fees for the next term are held at the current level, and that any future revision is capped at 5% a year."}\n\n2. Service levels. Please confirm the service levels and service credits that will apply for the next term, and share your performance report for the last six months.\n\nWe would be grateful for your reply by ${E.fmtD(E.addDays(c.deadline, -5))}, as our notice period under ${n ? "Clause " + n.cl : "the Agreement"} ends on ${E.fmtD(c.deadline)}.` + sign;
  }
  return "";
}

function checks(s, key){
  const c = E.clock(s), T = E.terms(s), out = [];
  if(T.noticeHow) out.push({ t:`Addressed the way the contract requires: ${h(T.noticeHow.cur.v)} (cl. ${h(T.noticeHow.cur.cl)})` });
  if(!c.evergreen) out.push({ t:`Before the notice deadline: ${E.fmtD(c.deadline)}, ${c.days} days left`, ok: c.days < 3 ? "q" : true });
  if(/courier|post/i.test(T.noticeHow ? T.noticeHow.cur.v : "") && (key === "exit" || s.id === "cleanspace")) out.push({ t:"A courier or registered-post copy is also required. Pulse will book it on approval", ok:"q" });
  const nc = T.notice; if(nc && nc.needsCheck) out.push({ t:"The notice clause is still awaiting Legal's confirmation. Pulse is using the stricter reading", ok:"q" });
  if(s.id === "sentinel"){ const cr = E.credits(s); const sep = cr.items.find(i => i.m === "Sep"); if(sep) out.push({ t:`September credit claim window closes ${E.fmtD(sep.claimBy)} (${sep.days} days)`, ok: sep.days < 10 ? "q" : true }); }
  if(s.id === "talentbridge") out.push({ t:"Invoice dispute must be raised within 30 days of receipt (by 5 Dec 2026)", ok:"q" });
  if(!E.S.checkins[s.id]) out.push({ t:"Business owner hasn't confirmed yet", ok:"q" });
  else out.push({ t:"Reflects the business owner's answer" });
  return out;
}

/* the facts a polish must keep: every amount, percentage, clause, date and email in the draft */
const facts = text => [...new Set((text.match(/₹[\d,]+|\d+(?:\.\d+)?%|Clause \d+(?:\.\d+)?|\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}|[\w.+-]+@[\w-]+\.[\w.]+|INV-[A-Z]+-\d+/g) || []))];

function context(s){
  const T = E.terms(s), c = E.clock(s);
  return `SUPPLIER: ${s.name} (${s.category}; owner ${E.ownerOf(s).name}; ${E.inr(s.annual)} a year)\n` +
    (c.evergreen ? `Rolling monthly; ${c.notice} days' notice to end.\n` : `Current term ends ${E.fmtD(c.periodEnd)}; notice ${c.notice} days; notice deadline ${E.fmtD(c.deadline)} (${c.days} days from ${E.fmtD(E.TODAY)}).\n`) +
    Object.entries(T).map(([f, x]) => `- ${P.fieldLabels[f] || f}: ${x.cur.v} [${E.DOCS[x.cur.doc].title}, cl. ${x.cur.cl}]${x.hist.length ? ` (replaced earlier: ${x.hist.map(y => y.v).join(", ")})` : ""}`).join("\n") +
    `\nSituation: ${s.story}`;
}

function critique(s){
  const m = {
    cleanspace:"<ul><li>Right call: claiming credits costs nothing and signals you are watching performance.</li><li>Biggest risk: the 30 Nov deadline. If the conversation drags, you lose the option to exit for a year. Consider sending a protective non-renewal notice you can withdraw.</li><li>Check first: that the Hinjewadi site was included in the August and October audits.</li></ul>",
    sentinel:"<ul><li>Right call: the September credit expires on 29 Nov; claim it now and decide on renewal in January.</li><li>Biggest risk: three straight misses suggest a staffing problem the credits won't fix.</li><li>Check first: the post-hour logs behind the coverage numbers, since the supplier may dispute them.</li></ul>",
    talentbridge:"<ul><li>Right call: the 5% cap is explicit, and the invoice error is documented against the work orders.</li><li>Biggest risk: market wage inflation is real; pushing too hard may mean attrition among associates.</li><li>Check first: whether any of the four associates was promoted to L3 by email, without a revised work order.</li></ul>",
    lumen:"<ul><li>Right call: 12 active users can't justify 40 licences.</li><li>Biggest risk: cutting below real need. Confirm the number with Arjun's team leads.</li><li>Check first: that the notice goes from an authorised Vyom address to renewals@lumenanalytics.com by 30 Nov.</li></ul>",
    northstar:"<ul><li>Right call: the letter fails all three contract tests (notice, evidence, cap).</li><li>Biggest risk: if a real tariff change hits their costs, they may push back hard in renewal talks.</li><li>Check first: whether any customs-duty change on IT equipment was actually notified this quarter.</li></ul>",
    brightwave:"<ul><li>Right call: paying for 120 hours while using about 20 is hard to defend.</li><li>Biggest risk: losing the agency team that knows the brand before the 2027 launch.</li><li>Check first: Ananya's pipeline of campaigns for Q1 2027.</li></ul>"
  };
  if(s.added) return `<ul><li>Right call if the owner still needs the service: asking for flat fees costs nothing and is easy to justify before the deadline.</li><li>Biggest risk: the notice deadline. If talks drag past it, Vyom loses the option to exit for a full term.</li><li>Check first: the owner's view of service quality, and any amendment or side letter not included in this upload.</li></ul><p class="small muted" style="margin:6px 0 0">Stored critique. Live AI writes a fresh one when available.</p>`;
  return m[s.id] + `<p class="small muted" style="margin:6px 0 0">Stored critique for the demo. Live AI writes a fresh one when available.</p>`;
}

function exceptions(){
  const tb = sup("talentbridge"), lu = sup("lumen"), ns = sup("northstar"), sg = sup("sentinel"), cs = sup("cleanspace");
  const ix = (s, f) => { const t = E.terms(s)[f].cur; return `${t.doc}|${s.terms.indexOf(t)}`; };
  const cr = E.credits(sg), cc = E.credits(cs);
  return [
    { id:"tb-inv", sup:tb.name, doc:"Invoice INV-TB-2610 · Oct 2026", what:"4 associates on L2 work orders billed at the L3 rate (₹2,600 vs ₹1,900 an hour, 168 h each)", rule:"Billed level must match the work order (Schedule A, note b)", where:ix(tb, "rates"), amt:E.tbOver(), act:"Dispute", by:"Dispute by 5 Dec" },
    { id:"lu-q", sup:lu.name, doc:"Renewal quote · 5 Nov 2026", what:"+10% per user (₹1,05,600) on 40 licences", rule:"Rise capped at 7% (cl. 2.1)", where:ix(lu, "cap"), amt:40 * (105600 - 102720), act:"Hold payment", by:"Renews 15 Jan" },
    { id:"ns-s", sup:ns.name, doc:"Surcharge notice · 14 Nov 2026", what:"6% surcharge on all shipments from 1 Dec, 17 days' notice, no evidence", rule:"Max 3% a year, 30 days' notice + evidence (cl. 3.3)", where:ix(ns, "adjust"), amt:Math.round(ns.ops.monthlySpend * 0.06 * 12), act:"Hold payment", by:"Applies from 1 Dec" },
    { id:"sg-c", sup:sg.name, doc:"Oct 2026 invoice · no credit applied", what:`Coverage below 98% in Sep and Oct; credits not deducted. Aug credit (${E.inr(cr.lost)}) already lost`, rule:"5% credit per missed month, claim within 60 days (cl. 4.2–4.3)", where:ix(sg, "claim"), amt:cr.owed, act:"Claim credits", by:"Sep claim closes 29 Nov" },
    { id:"cs-c", sup:cs.name, doc:"Oct 2026 invoice · no credit applied", what:"Hygiene audit below 90% in Aug and Oct; credits not deducted", rule:"3% credit per missed month (cl. 4.3)", where:ix(cs, "credit"), amt:cc.owed, act:"Claim credits", by:"No expiry, but claim now" }
  ];
}

/* stored portfolio answers: computed from extracted terms, cited */
function preset(i){
  const link = (s, f, txt) => { const t = E.terms(s)[f]; if(!t) return h(txt); return `<button class="where" data-where="${t.cur.doc}|${s.terms.indexOf(t.cur)}">${h(txt)}</button>`; };
  const S = id => sup(id);
  const tag = `<span class="badge-ai off" style="margin-left:6px">From extracted terms</span>`;
  if(i === 0) return `<p><b>Only Northstar's contract lets a supplier pass on tariff or fuel costs, and only within tight limits.</b> Its 14 Nov surcharge letter doesn't meet them. ${tag}</p><ul>
    <li><b>Northstar Logistics</b>: only for a change in government duty, tariff or levy, or a diesel move above 10%; needs 30 days' notice with evidence; max 3% a year. ${link(S("northstar"),"adjust","Rate contract cl. 3.2–3.3")}</li>
    <li><b>Sentinel Guarding</b>: price changes only for statutory minimum-wage changes, with the notification. ${link(S("sentinel"),"cap","cl. 3.2")}</li>
    <li><b>TalentBridge</b>: up to 5% at renewal with 45 days' notice; no tariff clause. ${link(S("talentbridge"),"cap","cl. 3.2")}</li>
    <li><b>CleanSpace</b>: CPI-linked, up to 5% a year. ${link(S("cleanspace"),"cap","Amendment cl. 2.1")}</li>
    <li><b>Lumen</b>: up to 7% at renewal. ${link(S("lumen"),"cap","cl. 2.1")}</li>
    <li><b>Brightwave</b>: no price-adjustment clause found; fees change only by agreement.</li></ul>`;
  if(i === 1) return `<p><b>Two contracts can be exited on 30 days' notice; two more need 60–90 days. Lumen and Northstar have no exit-for-convenience clause.</b> ${tag}</p><ul>
    <li><b>TalentBridge</b>: 30 days, agreement or any work order. ${link(S("talentbridge"),"tfc","cl. 5.1")}</li>
    <li><b>Brightwave</b>: 30 days, either party. ${link(S("brightwave"),"tfc","cl. 2.2")}</li>
    <li><b>Sentinel</b>: 60 days, without cause. ${link(S("sentinel"),"tfc","cl. 5.1")}</li>
    <li><b>CleanSpace</b>: 90 days. ${link(S("cleanspace"),"tfc","cl. 5.1")}</li>
    <li><b>Lumen, Northstar</b>: no exit right found; only non-renewal at term end.</li></ul>`;
  if(i === 2){ const a = E.credits(S("sentinel")), b = E.credits(S("cleanspace"));
    return `<p><b>${E.inr(a.owed + b.owed)} in service credits is claimable now, and ${E.inr(a.lost)} has already been lost.</b> ${tag}</p><ul>
    <li><b>Sentinel Guarding</b>: ${E.inr(a.owed)} for Sep and Oct coverage misses. The September claim must be made by <b>29 Nov</b>; August's window closed on 30 Oct. ${link(S("sentinel"),"claim","cl. 4.3")}</li>
    <li><b>CleanSpace</b>: ${E.inr(b.owed)} for the Aug and Oct hygiene audit misses. ${link(S("cleanspace"),"credit","cl. 4.3")}</li></ul>`; }
  if(i === 3) return `<p><b>Three suppliers are asking for more than their contracts allow, and one invoice bills the wrong rate.</b> ${tag}</p><ul>
    <li><b>TalentBridge</b>: +9% proposed vs a 5% cap; Oct invoice overbilled ${E.inr(E.tbOver())}. ${link(S("talentbridge"),"cap","cl. 3.2")}</li>
    <li><b>Lumen</b>: +10% quote vs a 7% cap. ${link(S("lumen"),"cap","cl. 2.1")}</li>
    <li><b>Northstar</b>: 6% surcharge vs a 3% maximum adjustment. ${link(S("northstar"),"adjust","cl. 3.3")}</li></ul>`;
  if(i === 4){ const rows = E.allRows().filter(r => r.c.days != null && r.c.days >= 0 && r.c.days <= 30).sort((a, b) => a.c.days - b.c.days);
    return `<p><b>${rows.length} notice deadlines fall in the next 30 days, worth ${E.inr(rows.reduce((a, r) => a + r.s.annual, 0))} a year.</b> ${tag}</p><ul>${rows.map(r => `<li><b>${h(r.s.name)}</b>: tell them by ${E.fmtD(r.c.deadline)} (${r.c.days} days) · ${E.inr(r.s.annual)} a year${r.s.light ? "" : ` · <a href="#packet-${r.s.id}">open packet</a>`}</li>`).join("")}</ul>`; }
  if(i === 5){ const lu = S("lumen"), o = E.ownerOf(lu);
    return `<p><b>${o.left ? "One contract has no active owner" : "Every contract has an owner"}.</b> ${tag}</p><ul>${o.left ? `<li><b>Lumen Analytics</b>: bought by Rohit Kulkarni, who left Vyom in Aug 2026. The renewal quote went to his inactive inbox, and the notice deadline is ${E.fmtD(E.clock(lu).deadline)}. <a href="#packet-lumen">Reassign it</a>.</li>` : `<li>Lumen Analytics now belongs to ${h(o.name)}.</li>`}</ul>
    <p class="small muted">Pulse checks owners against the HR directory every week, so a departure triggers a reassignment before the next deadline.</p>`; }
  return "";
}

/* file reading: .txt/.md native; .pdf via pdf.js; .docx via mammoth (loaded on demand from cdnjs) */
const loadScript = src => new Promise((res, rej) => { if(document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
/* rebuild lines and paragraphs from pdf.js text items, using their positions */
function pageText(items){
  let out = "", lastY = null, lastH = 10;
  items.forEach(it => { if(!it.str && !it.hasEOL) return; const y = it.transform ? it.transform[5] : null, hgt = Math.abs((it.transform && it.transform[3]) || it.height || 10);
    if(lastY !== null && y !== null && Math.abs(y - lastY) > 1){ out += Math.abs(y - lastY) > Math.max(lastH, hgt) * 1.75 ? "\n\n" : "\n"; }
    else if(out && !/\s$/.test(out) && it.str && !/^\s/.test(it.str)) out += " ";
    out += it.str; if(y !== null){ lastY = y; lastH = hgt || lastH; } });
  return out.replace(/[ \t]+\n/g, "\n");
}
async function readFile(f){
  const name = f.name.toLowerCase();
  if(name.endsWith(".pdf")){
    const buf = new Uint8Array(await f.arrayBuffer()); const own = window.PG && window.PG.readOwnPdf(buf); if(own) return own;
    try { await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js");
    const lib = window.pdfjsLib; const doc = await lib.getDocument({ data: buf, disableWorker:true }).promise;
    let out = ""; for(let p = 1; p <= Math.min(doc.numPages, 40); p++){ const pg = await doc.getPage(p); const tc = await pg.getTextContent(); out += pageText(tc.items) + "\n\n"; }
    out = out.trim(); if(out.replace(/\s/g, "").length < 200) throw { code:"scanned" }; return out;
    } catch(e){ if(e && e.code === "scanned") throw e; throw { code:"pdfreader" }; }
  }
  if(name.endsWith(".docx")){
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
    const r = await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() }); return r.value;
  }
  return await f.text();
}

/* live extraction; stored results for the sample documents when live AI is off */
const norm = t => t.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();
async function extract(text, opts){
  const fields = [["term_end","Date the current (initial) term ends"],["renewal","Does it renew automatically, and for how long"],["notice_days","Days of notice needed to stop renewal"],["notice_method","How notice must be given (address, method)"],["price_limit","Limits on price increases or adjustments"],["fees","Current fee and period, e.g. INR 4,50,000 per month"],["service_level","Main service level promised"],["service_credits","Service credits or penalties"],["exit_right","Right to terminate for convenience, and notice (say No if none)"],["payment_terms","Payment terms"]];
  const mode = opts && opts.mode;
  if(mode !== "rules"){
    try {
      const out = await E.ask(`Extract renewal and commercial terms from this supplier contract. The file may contain the main agreement followed by amendments. Reply with ONLY a JSON object, no prose and no code fences, in exactly this shape:
{"supplier":"","agreement_type":"","effective_iso":"YYYY-MM-DD or null","term_end_iso":"YYYY-MM-DD or null","auto_renews":true,"renewal_months":12,"notice_days":30,"terms":[{"field":"","value":"","clause":"","quote":"","confidence":0.9,"previous_value":"","previous_quote":"","previous_clause":""}]}
Rules: term_end_iso is the date the INITIAL term ends, computed if needed; do not roll it forward. For each field below that the contract covers, give a short plain-English value, the clause number, a VERBATIM quote of 8–30 words copied exactly from the text, and confidence 0–1. Skip fields that are not covered, except exit_right: if there is no termination-for-convenience right, give value "No" with the closest termination clause as the quote. If an amendment changes a term, give the amended value and quote, and put the original value, quote and clause in previous_value, previous_quote and previous_clause; also lower confidence to at most 0.8 when the amendment replaces words inside an earlier clause. notice_days must be the amended number of days if amended.
Fields: ${fields.map(f => f[0] + " = " + f[1]).join("; ")}

CONTRACT:
${text.slice(0, 60000)}`, { modelTier:"default", keepDashes:true, onText: opts && opts.onText });
      const r = window.PR.fromAI(JSON.parse(out.text.replace(/^[^{]*/, "").replace(/[^}]*$/, "")));
      r.live = true; return r;
    } catch(e){
      const d = window.PULSE_DOCS.find(x => norm(x.text) === norm(text));
      if(d && P.suppliers.find(x => x.docs.includes(d.id) && !x.added)){
        const s = P.suppliers.find(x => x.docs.includes(d.id));
        const back = Object.fromEntries(Object.entries(window.PR.FMAP).map(([a, b]) => [b, a]));
        const r = { method:"stored", supplier:s.name, agreement_type:d.type, terms:s.terms.filter(t => t.doc === d.id && back[t.f]).map(t => ({ field:back[t.f], value:t.f === "notice" ? t.v + " days" : String(t.v), clause:t.cl, quote:t.q, confidence:t.c })) };
        const c = E.clock(s); r.term_end_iso = s.term.initialEnd; r.effective_iso = s.term.start; r.notice_days = c.notice; r.auto_renews = !c.evergreen && s.term.auto; r.renewal_months = s.term.renewMonths;
        const fr = window.PR.fromAI(r); fr.method = "stored"; fr.note = "Stored AI result for this sample contract."; return fr;
      }
      const r = window.PR.rules(text);
      r.note = e && e.code === "unavailable" ? "Pulse read this with its built-in reader:"+" fixed rules that find dates, notice periods, price caps and other standard clauses. It's less flexible than AI on unusual wording, and every quote is still checked against your document." :
        e && e.code === "timeout" ? "The AI took too long, so Pulse used its basic reader instead." : "The AI's answer couldn't be read, so Pulse used its basic reader instead.";
      return r;
    }
  }
  const r = window.PR.rules(text); r.note = "Basic reader: fixed rules, no AI."; return r;
}
window.PD = { draft, checks, facts, context, critique, exceptions, preset, readFile, extract };
})();
