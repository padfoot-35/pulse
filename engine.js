/* Pulse engine: deterministic. The AI reads contracts; this code does every date and number. */
(function(){
const P = window.PULSE;
const DOCS = Object.fromEntries(window.PULSE_DOCS.map(d => [d.id, d]));
const TODAY = P.today;

/* ── dates (UTC, ISO strings) ── */
const D = s => new Date(s + "T00:00:00Z");
const iso = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(D(s).getTime() + n * 864e5));
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 864e5);
function addMonths(s, n){ const d = D(s); const day = d.getUTCDate();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  const wasLast = day === new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(wasLast ? last : Math.min(day, last)); return iso(t); }
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtD = s => { if(!s) return "Not set"; const d = D(s); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtDs = s => { const d = D(s); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };

/* ── money (INR, Indian units) ── */
function inr(n, opts = {}){ if(n == null) return "Not set"; const a = Math.abs(n), sg = n < 0 ? "−" : "";
  if(a >= 1e7) return `${sg}₹${(a/1e7).toFixed(a >= 1e8 ? 1 : 2)} Cr`;
  if(a >= 1e5) return `${sg}₹${(a/1e5).toFixed(a >= 1e6 ? 1 : 2).replace(/\.0+$/,"")} L`;
  return `${sg}₹${Math.round(a).toLocaleString("en-IN")}`; }

/* ── state (one viewer's demo progress; safe if storage is blocked) ── */
const KEY = "pulse-demo-v3";
const fresh = () => ({ persona:"priya", verified:{}, checkins:{}, reassigned:{}, decisions:{}, finance:{}, nudged:{}, guideMin:false, visited:{}, replies:{} });
let S; try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch(e){ S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
const reset = () => { S = fresh(); save(); };

/* ── effective terms: latest-dated document wins; history kept ── */
function terms(s){
  const g = {};
  s.terms.forEach(t => (g[t.f] = g[t.f] || []).push(t));
  const out = {};
  for(const f in g){
    const list = g[f].slice().sort((a,b) => DOCS[a.doc].effective < DOCS[b.doc].effective ? -1 : 1);
    const cur = list[list.length - 1];
    const ver = S.verified[s.id + "." + f];
    out[f] = { cur, hist: list.slice(0, -1), verified: !!ver, needsCheck: cur.c < .85 && !ver, by: ver };
  }
  return out;
}

function ownerOf(s){ const id = S.reassigned[s.id] || s.owner; return { id, ...P.people[id] }; }

/* ── the renewal clock ── */
function clock(s){
  if(s.light){
    const deadline = addDays(s.end, -s.notice);
    return { periodEnd:s.end, renewOn:addDays(s.end,1), notice:s.notice, deadline, days:daysBetween(TODAY, deadline), auto:s.auto };
  }
  const T = terms(s);
  const notice = T.notice ? +T.notice.cur.v : 30;
  if(s.term.evergreen){
    return { evergreen:true, notice, auto:true, days:null, monthly: s.annual / 12,
      earliestExit: addDays(TODAY, notice), periodEnd:null, deadline:null };
  }
  let end = s.term.initialEnd;
  while(end < TODAY) end = addMonths(addDays(end, 1), s.term.renewMonths), end = addDays(end, -1);
  const deadline = addDays(end, -notice);
  const c = { periodEnd:end, renewOn:addDays(end, 1), notice, deadline, days:daysBetween(TODAY, deadline), auto:s.term.auto, noticeField:T.notice };
  if(s.tracker){ c.trackerDeadline = addDays(end, -s.tracker.notice); c.trackerGap = daysBetween(c.deadline, c.trackerDeadline); }
  return c;
}

/* ── signals: what Pulse noticed, each traceable to data ── */
function signals(s){
  const out = [];
  if(s.light){ if(s.scanned && !S.verified[s.id + ".scan"]) out.push({t:"Scanned PDF: low-confidence read", k:"amber"}); return out; }
  const T = terms(s), c = clock(s), o = s.ops || {};
  if(c.trackerGap > 0) out.push({t:`Amendment changed notice ${T.notice.hist[0].v}→${T.notice.cur.v} days`, k:"red"});
  if(ownerOf(s).left) out.push({t:"Owner has left Vyom", k:"red"});
  if(o.sla){ const miss = o.sla.filter(m => m[1] < o.slaTarget).length; if(miss) out.push({t:`Service level missed ${miss} of ${o.sla.length} months`, k:"amber"}); }
  if(s.id === "sentinel"){ const cr = credits(s); if(cr.lost) out.push({t:`${inr(cr.lost)} credit already lost`, k:"red"}); }
  if(s.id === "talentbridge") out.push({t:"+9% proposed · contract caps 5%", k:"red"}, {t:`Oct invoice overbilled ${inr(tbOver())}`, k:"amber"});
  if(s.id === "lumen") out.push({t:`${o.active} of ${o.seats} licences used`, k:"amber"}, {t:"+10% quote · contract caps 7%", k:"red"});
  if(s.id === "northstar") out.push({t:"6% surcharge not allowed by contract", k:"red"});
  if(s.id === "brightwave"){ const h = o.hours.at(-1)[1]; out.push({t:"No active work since Mar 2026", k:"amber"}, {t:`${h} of ${o.included} retainer hours used in Oct`, k:"amber"}); }
  if(s.added){
    if(T.notice && T.notice.hist.length && +T.notice.hist[0].v !== +T.notice.cur.v) out.push({t:`Amendment changed notice ${T.notice.hist[0].v}→${T.notice.cur.v} days`, k:"red"});
    if(!T.cap || !/\d\s?%/.test(T.cap.cur.v)) out.push({t:"No price-increase cap", k:"amber"});
    if(!T.tfc || /^no\b/i.test(T.tfc.cur.v)) out.push({t:"No early exit right", k:"amber"});
    out.push({t:"Added from upload", k:"line"});
  }
  const low = Object.values(T).filter(x => x.needsCheck).length; if(low) out.push({t:`${low} term${low>1?"s":""} awaiting Legal check`, k:"purple"});
  return out;
}

/* service credits with claim windows (Sentinel) or without (CleanSpace) */
function credits(s){
  const o = s.ops || {}; if(!o.sla) return { items:[], owed:0, lost:0 };
  const year = 2026, items = [];
  o.sla.forEach(([m, val]) => { if(val >= o.slaTarget) return;
    const mi = MON.indexOf(m), monthEnd = iso(new Date(Date.UTC(year, mi + 1, 0)));
    const amt = Math.round(o.monthlyFee * o.creditPct / 100);
    const claimBy = o.claimDays ? addDays(monthEnd, o.claimDays) : null;
    const lost = claimBy && claimBy < TODAY;
    items.push({ m, val, amt, claimBy, lost, days: claimBy ? daysBetween(TODAY, claimBy) : null });
  });
  return { items, owed: items.filter(i => !i.lost).reduce((a,i) => a + i.amt, 0), lost: items.filter(i => i.lost).reduce((a,i) => a + i.amt, 0) };
}
function tbOver(){ const i = P.suppliers.find(x => x.id === "talentbridge").ops.invoice; return i.count * i.hours * (i.billed - i.contracted); }

/* ── decision options. Rules use contract terms + owner input; amounts are computed, not generated ── */
function options(s){
  const ci = S.checkins[s.id], need = ci && ci.need, T = terms(s), c = clock(s);
  const o = s.ops || {};
  const L = [];
  if(s.id === "cleanspace"){
    const cr = credits(s);
    L.push({ key:"renew", title:"Let it renew as is", value:0, why:[`Commits ${inr(s.annual)} for another 12 months with no review.`, `Leaves ${inr(cr.owed)} of earned service credits unclaimed.`] });
    L.push({ key:"reneg", title:"Renew, but use the leverage", value:cr.owed, why:[`Claim ${inr(cr.owed)} in credits for Aug and Oct audit misses (Cl. 4.3).`, "Ask for a site-level hygiene improvement plan before renewal.", "Confirm any 2027 increase stays within the 5% cap (Amendment Cl. 2.1)."] });
    L.push({ key:"exit", title:"Give notice and re-tender", value:Math.round(s.annual*0.08), why:["Send non-renewal by 30 Nov to keep the option open.", "Re-tendering typically saves 5–10% on facilities services (assumption).", "Risk: a transition in the middle of a site expansion."] });
    L.rec = need === "drop" ? "exit" : "reneg";
  }
  if(s.id === "sentinel"){
    const cr = credits(s);
    L.push({ key:"renew", title:"Do nothing now", value:0, why:[`The September credit (${inr(cr.items.find(i=>i.m==="Sep")?.amt)}) expires on ${fmtD(cr.items.find(i=>i.m==="Sep")?.claimBy)}.`, "The renewal decision isn't due until 30 Jan 2027."] });
    L.push({ key:"reneg", title:"Claim credits now, fix or replace by January", value:cr.owed, why:[`Claim ${inr(cr.owed)} for Sep and Oct coverage misses before the 60-day window closes (Cl. 4.3).`, "Ask for a coverage remedy plan with weekly reporting.", "Revisit renewal in January with three months of data."] });
    L.push({ key:"exit", title:"Claim credits and give 60 days' notice", value:cr.owed, why:["Exit without cause is allowed on 60 days' notice (Cl. 5.1).", "Needs a replacement guarding agency in place first."] });
    L.rec = need === "drop" ? "exit" : "reneg";
  }
  if(s.id === "talentbridge"){
    const cap = Math.round(s.annual * 0.04), over = tbOver();
    L.push({ key:"renew", title:"Accept +9% and pay October in full", value:0, why:[`Adds about ${inr(Math.round(s.annual*0.09))} a year.`, "The contract only allows up to 5% (Cl. 3.2)."] });
    L.push({ key:"reneg", title:"Hold rates to the 5% cap and dispute October", value:cap + over, why:[`Reject the 9% proposal: Cl. 3.2 caps rises at 5%, saving about ${inr(cap)} a year.`, `Dispute ${inr(over)} on invoice INV-TB-2610: 4 L2 engineers billed at L3 (Schedule A, note b).`, "Dispute must be raised by 5 Dec (Cl. 3.4: 30 days from receipt)."] });
    L.push({ key:"exit", title:"Give notice and move to another agency", value:cap + over, why:["Notice needed by 2 Dec (Cl. 2.2).", "High disruption: 22 associates on active projects."] });
    L.rec = "reneg";
  }
  if(s.id === "lumen"){
    const n = ci && ci.seats ? ci.seats : 15, capFee = Math.round(96000 * 1.07), quote = 4224000;
    L.push({ key:"renew", title:"Let it auto-renew at the quote", value:0, why:[`Pays ${inr(quote)} for 40 licences, but only 12 are used.`, "The 10% rise breaks the 7% cap (Cl. 2.1)."] });
    L.push({ key:"reduce", title:`Renew ${n} licences at the capped price`, value:quote - n * capFee, why:[`Cut to ${n} licences (Cl. 2.2 allows reductions in the same notice window).`, `Hold the per-user fee to +7%: ${inr(capFee)} instead of ${inr(105600)}.`, `New annual cost ${inr(n * capFee)} instead of ${inr(quote)}.`] });
    L.push({ key:"exit", title:"Don't renew", value:quote, why:["Saves the full renewal.", "Only if the team confirms it can move to another tool."] });
    L.rec = need === "drop" ? "exit" : "reduce";
  }
  if(s.id === "northstar"){
    const v = Math.round(o.monthlySpend * 0.06 * 12);
    L.push({ key:"renew", title:"Accept the 6% surcharge", value:0, why:[`Adds about ${inr(v)} a year.`, "The surcharge is not allowed under Cl. 3.2–3.3."] });
    L.push({ key:"reneg", title:"Reject the surcharge; renew on the same terms", value:v, why:["Only 17 days' notice given; the contract requires 30 days (Cl. 3.3).", "No evidence of a duty, tariff or diesel change was provided.", "Any adjustment is capped at 3% a year in any case."] });
    L.push({ key:"exit", title:"Give 30 days' notice and re-tender", value:v, why:["Notice needed by 1 Dec.", "Only if service quality is also a problem."] });
    L.rec = need === "drop" ? "exit" : "reneg";
  }
  if(s.id === "brightwave"){
    const m = s.annual / 12;
    L.push({ key:"renew", title:"Keep the retainer", value:0, why:[`Keeps paying ${inr(m)} a month for little used capacity.`] });
    L.push({ key:"reneg", title:"Cut the retainer to ₹2 L for 50 hours", value:(m - 200000) * 12, why:["Matches recent use (18–34 hours a month).", "Keeps the agency relationship for the 2027 launch."] });
    L.push({ key:"exit", title:"Give 30 days' notice", value:m * 11, why:["Exit allowed on 30 days' notice (Cl. 2.2).", `Saves about ${inr(m*11)} over the next 12 months.`] });
    L.rec = need === "drop" ? "exit" : need === "change" || need === "keep" ? "reneg" : "reneg";
  }
  if(s.added){
    const capM = T.cap && /(\d+(?:\.\d+)?)\s?%/.exec(T.cap.cur.v), cap = capM ? +capM[1] : null;
    const hold = Math.round(s.annual * (cap != null ? cap : 5) / 100), tender = Math.round(s.annual * 0.07);
    L.push({ key:"renew", title:"Let it renew as is", value:0, why:[`Commits ${inr(s.annual)} for another ${s.term.renewMonths} months with no review.`, cap != null ? `The supplier may still raise prices by up to ${cap}% at renewal.` : "There is no cap, so the price at renewal is whatever the supplier asks."] });
    L.push({ key:"reneg", title:"Renew, but hold the price", value:hold, why:[cap != null ? `Ask for flat fees for the next term instead of the ${cap}% rise the contract allows (${inr(hold)} a year).` : `Agree a price cap before renewing; holding fees flat avoids a typical 5% rise (${inr(hold)} a year, assumption).`, "Confirm the service levels and credits for the next term in the same letter.", c.days != null ? `Send before ${fmtD(c.deadline)} so the option to exit stays open.` : ""].filter(Boolean) });
    L.push({ key:"exit", title:"Give notice and re-tender", value:tender, why:[`Notice must reach the supplier by ${fmtD(c.deadline)} (${c.notice} days before the term ends).`, "Re-tendering typically saves 5–10% (assumption: 7% used here).", "Only if the owner confirms an alternative is workable."] });
    L.rec = need === "drop" ? "exit" : "reneg";
  }
  return L;
}

/* ── AI (live when the viewer allows it; stored results otherwise) ── */
let AI = null, aiState = "checking";
const aiReady = (async () => { try { if(window.claude && window.claude.use){ AI = await window.claude.use("sample"); } } catch(e){ AI = null; } aiState = AI ? "live" : "off"; document.dispatchEvent(new Event("ai-state")); return AI; })();
async function ask(prompt, opts = {}){ await aiReady; if(!AI) throw { code:"unavailable" };
  const ctl = new AbortController(), ms = opts.timeout || 75000;
  const { timeout, json, keepDashes, ...rest } = opts;
  let timer; const t = new Promise((_, rej) => { timer = setTimeout(() => { try { ctl.abort(); } catch(e){} rej({ code:"timeout" }); }, ms); });
  try { const out = await Promise.race([AI(prompt + (keepDashes ? "" : "\n\nStyle: never use em dashes; use commas, colons or full stops instead."), { ...rest, signal: ctl.signal }), t]);
    return keepDashes ? out : { ...out, text: String(out.text || "").replace(/\s*\u2014\s*/g, ", ") }; } finally { clearTimeout(timer); } }
/* tiny, safe markdown: escape first, then bold, bullets, line breaks */
function md(text){ const esc = String(text ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const lines = esc.split(/\n/); let out = "", inList = false;
  for(const raw of lines){ const l = raw.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]{3,90})\]/g, '<span class="cite">$1</span>');
    const m = l.match(/^\s*[-*•]\s+(.*)/);
    if(m){ if(!inList){ out += "<ul>"; inList = true; } out += `<li>${m[1]}</li>`; }
    else { if(inList){ out += "</ul>"; inList = false; } if(l.trim().replace(/^#+\s*/, "")) out += `<p>${l.replace(/^#+\s*/, "")}</p>`; } }
  if(inList) out += "</ul>"; return out; }

/* ── deadlines across the portfolio ── */
function allRows(){
  const deep = P.suppliers.map(s => ({ s, c:clock(s) }));
  const light = P.portfolio.map(s => ({ s, c:clock(s) }));
  return deep.concat(light);
}

window.PE = { DOCS, TODAY, D, iso, addDays, addMonths, daysBetween, fmtD, fmtDs, inr, get S(){ return S; }, save, reset,
  terms, clock, signals, credits, tbOver, options, ownerOf, allRows, ask, md, aiReady, get aiState(){ return aiState; } };
})();
