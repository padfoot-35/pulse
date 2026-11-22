/* Pulse: basic contract reader (rules, no AI), contract health check, answer-key scorecard,
   and the step that turns a read contract into a live supplier record. */
(function(){
const P = window.PULSE, E = window.PE;
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = t => String(t || "").replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();

/* ── dates ── */
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const mIdx = m => { const i = MONTHS.findIndex(x => x.startsWith(String(m).toLowerCase().slice(0, 3))); return i; };
const isoOf = (d, m, y) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const DATE_RE = /(\d{1,2})(?:st|nd|rd|th)?(?:\s+day\s+of)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?,?\s+(\d{4})|(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i;
function dateIn(s){ const m = DATE_RE.exec(s); if(!m) return null; return m[1] ? isoOf(+m[1], mIdx(m[2]), +m[3]) : isoOf(+m[5], mIdx(m[4]), +m[6]); }
function datesIn(s){ const re = new RegExp(DATE_RE.source, "gi"); const out = []; let m; while((m = re.exec(s))) out.push(m[1] ? isoOf(+m[1], mIdx(m[2]), +m[3]) : isoOf(+m[5], mIdx(m[4]), +m[6])); return out; }

/* ── numbers written as words ── */
const W = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,fifteen:15,eighteen:18,twenty:20,thirty:30,forty:40,"forty-five":45,fifty:50,sixty:60,seventy:70,"seventy-five":75,eighty:80,ninety:90,"one hundred and twenty":120,"one hundred and eighty":180 };
function daysIn(s){ const out = []; let m; const re = /\((\d{1,3})\)\s*(?:calendar\s+|business\s+|working\s+)?days|(\d{1,3})\s*(?:calendar\s+|business\s+|working\s+)?days/gi;
  while((m = re.exec(s))) out.push(+(m[1] || m[2]));
  if(!out.length){ const w = /\b(one hundred and (?:twenty|eighty)|forty-five|seventy-five|thirty|sixty|ninety|fifteen|forty|twenty|ten)\s+(?:calendar\s+|business\s+|working\s+)?days/gi; while((m = w.exec(s))) out.push(W[m[1].toLowerCase()]); }
  return out; }
function monthsIn(s){ let m = /\((\d{1,3})\)\s*(months|years)/i.exec(s) || /(\d{1,3})\s*(months|years)/i.exec(s); if(m) return +m[1] * (/year/i.test(m[2]) ? 12 : 1);
  m = /\b(one|two|three|twelve|twenty-four|thirty-six)\s+(months?|years?)\b/i.exec(s); if(m){ const n = { one:1, two:2, three:3, twelve:12, "twenty-four":24, "thirty-six":36 }[m[1].toLowerCase()]; return n * (/year/i.test(m[2]) ? 12 : 1); } return null; }
const pctIn = s => { const m = /(\d{1,2}(?:\.\d{1,2})?)\s?%/.exec(s) || /(\d{1,2}(?:\.\d{1,2})?)\s+per\s?cent/i.exec(s); return m ? +m[1] : null; };
function moneyIn(s){ const m = /(?:INR|Rs\.?|₹)\s?([\d,]+(?:\.\d+)?)(?:\/-)?/i.exec(s); if(!m) return null; return +m[1].replace(/,/g, ""); }

/* ── split one file into the agreement and any amendment bound in with it ── */
function splitDocs(text){
  const m = /(^|\n)\s*(AMENDMENT(?: NO\.?\s*\d+)?\b[^\n]*)/.exec(text) || /(^|\n)\s*(Amendment No\.?\s*\d+\s+(?:to|is made)[^\n]*)/.exec(text);
  if(!m || m.index < 400) return [{ kind:"main", text, start:0 }];
  const at = m.index + m[1].length;
  return [{ kind:"main", text:text.slice(0, at).trim(), start:0 }, { kind:"amendment", text:text.slice(at).trim(), start:at }];
}

/* sentence-sized units, each with the clause number it sits under */
function units(text){
  const out = []; let clause = "", buf = "", start = 0;
  const flush = end => { const raw = buf; const t = raw.trim(); if(t){ const cm = /^(\d{1,2}(?:\.\d{1,2}){0,2})[.)]?\s+\S/.exec(t); if(cm) clause = cm[1]; out.push({ t, clause, start }); } buf = ""; start = end; };
  for(let i = 0; i < text.length; i++){
    const ch = text[i]; buf += ch;
    if(ch === "\n" && (text[i + 1] === "\n" || /^[ \t]*(\d{1,2}(\.\d{1,2}){0,2}[.)]?\s+[A-Z(]|[A-Z][A-Z ,&-]{6,}$)/m.test(text.slice(i + 1, i + 90).split("\n")[0]))){ flush(i + 1); continue; }
    if((ch === "." || ch === ";") && /\s/.test(text[i + 1] || " ")){
      const tail = buf.slice(-6).toLowerCase();
      if(/\b(no|cl|rs|nos|e\.g|i\.e|pvt|ltd|co|sr|dr|mr|ms|art|sec|para|vs)\.$/.test(tail) || /\b\d{1,2}\.$/.test(buf.trim()) && buf.trim().length < 6) continue;
      flush(i + 1);
    }
  }
  flush(text.length); return out;
}
/* a verbatim quote of at most ~40 words, centred on the match */
function quote(u, re){ const words = u.t.split(/\s+/); if(words.length <= 42) return u.t.replace(/\s+/g, " ");
  let at = 0; if(re){ const m = re.exec(u.t); if(m){ at = u.t.slice(0, m.index).split(/\s+/).length - 1; } }
  const a = Math.max(0, Math.min(at - 12, words.length - 40)); return words.slice(a, a + 40).join(" "); }

/* ── the rules reader ── */
function rules(text){
  const docs = splitDocs(text), main = units(docs[0].text), amd = docs[1] ? units(docs[1].text) : [];
  const all = main.map(u => ({ ...u, src:"main" })).concat(amd.map(u => ({ ...u, src:"amendment" })));
  const r = { method:"rules", terms:[] };
  const firstLine = text.trim().split(/\n/)[0].trim();
  r.agreement_type = firstLine.length < 90 ? (firstLine === firstLine.toUpperCase() ? firstLine.replace(/\b\w+/g, w => /^(IT|HR|AMC|SLA|MPLS|SAAS)$/.test(w) ? (w === "SAAS" ? "SaaS" : w) : /^(OF|TO|AND|FOR|THE)$/.test(w) ? w.toLowerCase() : w[0] + w.slice(1).toLowerCase()) : firstLine) : "Agreement";
  const sm = /\band\s+([A-Z][A-Za-z0-9&.'\s-]{2,70}?(?:Private Limited|Pvt\.? Ltd\.?|Limited|LLP|Inc\.?|LLC|GmbH|Ltd\.?))/.exec(text.slice(0, 2500));
  r.supplier = sm && !/vyom/i.test(sm[1]) ? sm[1].replace(/\s+/g, " ").trim() : "";
  const effU = main.find(u => /effective date|is made on|made on|dated|entered into on/i.test(u.t) && dateIn(u.t));
  r.effective_iso = effU ? dateIn(effU.t) : null;
  const add = (field, value, u, re, conf, extra) => r.terms.push({ field, value, clause:u.clause, quote:quote(u, re), confidence:conf, source:u.src, ...(extra || {}) });

  /* term and renewal */
  const endU = main.find(u => /(initial term|term of this agreement|shall (?:continue|remain in force))/i.test(u.t) && /(ending on|expir\w* on|until|up to and including)/i.test(u.t) && dateIn(u.t.slice(u.t.search(/ending on|expir\w* on|until|up to and including/i))));
  if(endU){ r.term_end_iso = dateIn(endU.t.slice(endU.t.search(/ending on|expir\w* on|until|up to and including/i))); add("term_end", E.fmtD(r.term_end_iso) + " (initial term)", endU, /ending on|expir|until/i, .95); }
  else { const tU = main.find(u => /initial term|period of/i.test(u.t) && monthsIn(u.t)); if(tU && r.effective_iso){ const mo = monthsIn(tU.t); r.term_end_iso = E.addDays(E.addMonths(r.effective_iso, mo), -1); add("term_end", `${E.fmtD(r.term_end_iso)} (${mo} months from the start date)`, tU, /initial term|period of/i, .82); } }
  const noRen = all.find(u => /shall not (?:be )?renew|no automatic renewal|will not renew automatically|expire[s]? .{0,40}unless (?:renewed|extended)/i.test(u.t));
  const renU = all.find(u => /automatic(?:ally)?\s+(?:be\s+)?renew|renew\s+automatically|auto-?renew|deemed (?:to be )?renewed/i.test(u.t));
  if(renU && !noRen){ r.auto_renews = true; r.renewal_months = monthsIn(renU.t.slice(renU.t.search(/renew/i))) || 12; add("renewal", `Auto-renews for ${r.renewal_months} months`, renU, /renew/i, .93); }
  else if(noRen){ r.auto_renews = false; r.renewal_months = null; add("renewal", "Does not renew automatically", noRen, null, .85); }

  /* notice to stop renewal: an amendment that replaces the words wins */
  const isNotice = u => /non-?renewal|not to renew|prevent (?:the )?(?:automatic )?renewal|intention not to (?:renew|extend)|notice period/i.test(u.t) && daysIn(u.t).length;
  const nMain = main.filter(isNotice), nAmd = amd.filter(u => (isNotice(u) || /replaced|substituted|amended to read|shall read/i.test(u.t) && /clause\s*\d/i.test(u.t)) && daysIn(u.t).length);
  if(nMain.length){ const u = nMain[0], d = daysIn(u.t); const vals = [...new Set(nMain.map(x => daysIn(x.t)[0]))];
    if(nAmd.length){ const a = nAmd[0], da = daysIn(a.t); const nv = da[da.length - 1];
      r.notice_days = nv; add("notice_days", `${nv} days`, { ...a, src:"amendment" }, /replaced|days/i, .78, { previous_value:`${d[0]} days`, previous_quote:quote(u, /days/i), previous_clause:u.clause }); }
    else { r.notice_days = d[0]; add("notice_days", `${d[0]} days`, u, /days/i, vals.length > 1 ? .7 : .9); } }
  else if(nAmd.length){ const a = nAmd[0], da = daysIn(a.t); r.notice_days = da[da.length - 1]; add("notice_days", `${r.notice_days} days`, a, /days/i, .75); }

  /* how notice must be sent */
  const howU = all.find(u => /notices?\b/i.test(u.t) && /(registered post|courier|e-?mail|hand[- ]deliver|speed post|by post)/i.test(u.t) && !/non-?renewal/i.test(u.t));
  if(howU){ const em = (/[\w.+-]+@[\w-]+\.[\w.]+/.exec(howU.t) || [""])[0].replace(/\.$/, ""); const ways = ["registered post","courier","speed post","hand delivery"].filter(w => new RegExp(w.replace(" ", "[- ]"), "i").test(howU.t));
    add("notice_method", `${ways.length ? ways.map(w => w[0].toUpperCase() + w.slice(1)).join(" or ") : "In writing"}${em ? (ways.length ? " + email " : " by email to ") + em : ""}`, howU, /notice/i, .9); }

  /* price increases */
  const capRe = /(increase|escalat|revis|adjust|rise|hike)/i, notCap = /credit|liabilit|service level|uptime|availability|interest|penalt|late payment|gst|tax/i;
  const capMain = main.filter(u => capRe.test(u.t) && !notCap.test(u.t) && /fee|price|rate|charge/i.test(u.t));
  const capAmd = amd.filter(u => capRe.test(u.t) && !notCap.test(u.t) && pctIn(u.t) != null);
  const withPct = capMain.find(u => pctIn(u.t) != null);
  if(capAmd.length){ const a = capAmd[0]; r.cap_pct = pctIn(a.t); add("price_limit", `Up to ${r.cap_pct}% a year`, a, /%|per cent/i, .9, withPct ? { previous_value:`Up to ${pctIn(withPct.t)}% a year`, previous_quote:quote(withPct, /%|per cent/i), previous_clause:withPct.clause } : {}); }
  else if(withPct){ r.cap_pct = pctIn(withPct.t); add("price_limit", `Up to ${r.cap_pct}% a year`, withPct, /%|per cent/i, .92); }
  else if(capMain.length){ r.cap_open = true; add("price_limit", "No limit stated: the supplier can revise fees at renewal", capMain[0], capRe, .8); }

  /* fees */
  const feeRe = /(INR|Rs\.?|₹)\s?[\d,]+/i;
  const feeA = amd.find(u => feeRe.test(u.t) && /fee|price|charge|consideration/i.test(u.t)), feeM = main.find(u => feeRe.test(u.t) && /fee|price|charge|consideration/i.test(u.t) && !/liabilit/i.test(u.t));
  const feeVal = u => { const n = moneyIn(u.t), per = /per month|a month|monthly|per mensem/i.test(u.t) ? "month" : /per annum|a year|per year|annual/i.test(u.t) ? "year" : ""; return { n, per, txt:`${E.inr(n)}${per ? " / " + per : ""}` }; };
  if(feeA){ const v = feeVal(feeA); r.fee = v; add("fees", v.txt, feeA, feeRe, .9, feeM ? { previous_value:feeVal(feeM).txt, previous_quote:quote(feeM, feeRe), previous_clause:feeM.clause } : {}); }
  else if(feeM){ const v = feeVal(feeM); r.fee = v; add("fees", v.txt, feeM, feeRe, .9); }

  /* service level, credits, exit, payment */
  const slaU = main.find(u => pctIn(u.t) != null && /(at least|not less than|minimum of)[^.;]{0,80}(%|per cent)|(uptime|availability)[^.;]{0,40}(%|per cent)/i.test(u.t) && !/credit/i.test(u.t) && !capRe.test(u.t.slice(0, 40)));
  if(slaU) add("service_level", slaU.t.replace(/^\d+(\.\d+)*\s+/, "").replace(/^The \w+( \w+)? shall /i, "").replace(/\.$/, "").slice(0, 140), slaU, /at least|not less than|%/i, .85);
  const crU = main.find(u => /credit/i.test(u.t) && pctIn(u.t) != null);
  if(crU){ const all2 = [...crU.t.matchAll(/(\d{1,2}(?:\.\d+)?)\s?%/g)].map(m => +m[1]); add("service_credits", `${all2[0]}% of the monthly fee per missed month${all2[1] ? `, max ${all2[1]}%` : ""}`, crU, /credit/i, .9); r.credit_pct = all2[0]; }
  const tfcU = all.find(u => /for convenience|without cause|without assigning any reason/i.test(u.t) && daysIn(u.t).length);
  if(tfcU){ r.tfc_days = daysIn(tfcU.t)[0]; add("exit_right", `Yes, on ${r.tfc_days} days' notice`, tfcU, /convenience|without cause/i, .92); }
  const payU = all.find(u => /(payable|pay|paid|settle)[^.]{0,80}within[^.]{0,30}days?\s+(?:of|from)\s+(?:the\s+)?(?:date of\s+)?(?:receipt|invoice)/i.test(u.t));
  if(payU){ const d = daysIn(payU.t.slice(payU.t.search(/within/i))); if(d.length){ r.pay_days = d[0]; add("payment_terms", `${d[0]} days from invoice`, payU, /within/i, .93); } }
  return r;
}

/* ── normalise an AI reading into the same shape ── */
function fromAI(j){ const nd = v => typeof v === "string" ? v.replace(/\s*\u2014\s*/g, ", ") : v;
  (j.terms || []).forEach(t => { t.value = nd(t.value); t.previous_value = nd(t.previous_value); });
  const r = { method:"ai", terms:j.terms || [], supplier:j.supplier, agreement_type:j.agreement_type, effective_iso:j.effective_iso, term_end_iso:j.term_end_iso, auto_renews:j.auto_renews, renewal_months:j.renewal_months, notice_days:j.notice_days };
  const t = f => r.terms.find(x => x.field === f);
  if(t("price_limit")) r.cap_pct = pctIn(t("price_limit").value); if(t("price_limit") && r.cap_pct == null) r.cap_open = /no (limit|cap)|not (limited|capped)/i.test(t("price_limit").value);
  if(t("fees")){ const v = t("fees").value; let n = moneyIn(v); if(n == null){ const l = /([\d.]+)\s*(lakh|l\b)/i.exec(v); if(l) n = +l[1] * 1e5; const c = /([\d.]+)\s*(crore|cr\b)/i.exec(v); if(c) n = +c[1] * 1e7; }
    r.fee = { n, per:/month/i.test(v) ? "month" : /year|annum|annual/i.test(v) ? "year" : "", txt:v }; }
  if(t("service_credits")) r.credit_pct = pctIn(t("service_credits").value);
  if(t("exit_right")){ const d = daysIn(t("exit_right").value); r.tfc_days = /^no\b|not (allowed|permitted)|none/i.test(t("exit_right").value) ? null : d[0] || null; }
  if(t("payment_terms")){ const d = daysIn(t("payment_terms").value); r.pay_days = d[0] || null; }
  return r; }

/* current term and deadline, by code */
function clockOf(r){
  if(!r.term_end_iso || !/^\d{4}-\d{2}-\d{2}$/.test(r.term_end_iso) || r.notice_days == null) return null;
  let end = r.term_end_iso, rolled = 0; if(r.auto_renews && r.renewal_months) while(end < E.TODAY){ end = E.addDays(E.addMonths(E.addDays(end, 1), r.renewal_months), -1); rolled++; }
  const deadline = E.addDays(end, -r.notice_days); return { end, rolled, deadline, days:E.daysBetween(E.TODAY, deadline) };
}

/* ── contract health: what a careful buyer would want, and whether it's there ── */
function health(r){
  const t = f => r.terms.find(x => x.field === f), c = clockOf(r), out = [];
  const nh = t("notice_method");
  out.push(r.cap_pct != null ? { ok:true, t:`Price rises are capped at ${r.cap_pct}% a year.` } : { ok:false, t:"No limit on price increases. The supplier can raise prices at every renewal.", fix:"Ask for a yearly cap (for example CPI or 5%) at this renewal." });
  out.push(r.tfc_days ? { ok:true, t:`Vyom can exit early on ${r.tfc_days} days' notice.` } : { ok:"q", t:"No exit for convenience. Vyom can only leave at the end of a term.", fix:"Ask for a 60–90 day exit right." });
  out.push(r.credit_pct != null ? { ok:true, t:`Missed service levels earn credits (${r.credit_pct}% of the monthly fee).` } : { ok:"q", t:"No service credits. A missed service level costs the supplier nothing.", fix:"Link a credit to the main service level." });
  if(r.auto_renews && r.renewal_months > 12) out.push({ ok:"q", t:`Renews for ${r.renewal_months} months at a time: a missed deadline locks Vyom in for long.` });
  if(r.notice_days >= 90) out.push({ ok:"q", t:`Long notice period (${r.notice_days} days). Renewals like this are the easiest to miss.` });
  if(nh && /post|courier|hand/i.test(nh.value)) out.push({ ok:"q", t:"Notice must go by post or courier, not just email. Pulse books the physical copy on approval." });
  if(t("notice_days") && t("notice_days").previous_value) { const pv = daysIn(t("notice_days").previous_value)[0], nv = r.notice_days != null ? r.notice_days : daysIn(t("notice_days").value).slice(-1)[0];
    out.push({ ok:false, t:pv != null && nv != null ? `An amendment changed the notice period from ${pv} to ${nv} days. Any tracker built from the original is now wrong.` : "An amendment changed the notice period. Any tracker built from the original is now wrong." }); }
  if(r.pay_days != null && r.pay_days < 30) out.push({ ok:"q", t:`Short payment terms (${r.pay_days} days).` });
  if(c && c.days >= 0 && c.days <= 30) out.push({ ok:false, t:`The notice deadline is ${E.fmtD(c.deadline)}: ${c.days} days from today.` });
  if(c && c.days < 0) out.push({ ok:false, t:`The notice deadline (${E.fmtD(c.deadline)}) has passed: the contract will renew for another term.` });
  return out;
}
function healthHTML(r){ const H = health(r), bad = H.filter(x => x.ok !== true).length;
  return `<div class="card pad" style="margin-top:14px"><div class="row between"><h3>Contract health check</h3><span class="chip ${bad ? "amber" : "green"}">${bad ? bad + " to look at" : "Looks healthy"}</span></div>
    <p class="small muted" style="margin:4px 0 8px">Rules any buyer would apply, checked against what Pulse found. No AI involved.</p>
    ${H.map(x => `<div class="check"><i class="${x.ok === false ? "no" : x.ok === "q" ? "q" : ""}">${x.ok === false ? "✕" : x.ok === "q" ? "!" : "✓"}</i><span>${h(x.t)}${x.fix ? `<span class="small muted"> ${h(x.fix)}</span>` : ""}</span></div>`).join("")}</div>`; }

/* ── score against a generated contract's answer key ── */
function score(r, key){
  const c = clockOf(r), t = f => r.terms.find(x => x.field === f);
  const got = {
    notice:[r.notice_days != null ? r.notice_days + " days" : "not found", r.notice_days],
    end:[c ? E.fmtD(c.end) : "not found", c && c.end],
    deadline:[c ? E.fmtD(c.deadline) : "not found", c && c.deadline],
    renewal:[r.auto_renews ? `Yes, ${r.renewal_months} months` : r.auto_renews === false ? "No" : "not found", r.auto_renews ? r.renewal_months : null],
    cap:[r.cap_pct != null ? r.cap_pct + "% a year" : r.cap_open ? "None (open-ended)" : "not found", r.cap_pct != null ? r.cap_pct : r.cap_open ? null : undefined],
    fee:[r.fee && r.fee.n ? E.inr(r.fee.per === "year" ? r.fee.n / 12 : r.fee.n) + " a month" : "not found", r.fee && r.fee.n ? Math.round(r.fee.per === "year" ? r.fee.n / 12 : r.fee.n) : undefined],
    pay:[r.pay_days != null ? r.pay_days + " days" : "not found", r.pay_days],
    credit:[r.credit_pct != null ? r.credit_pct + "%" : "not found", r.credit_pct],
    tfc:[r.tfc_days ? `Yes, ${r.tfc_days} days` : t("exit_right") ? "No" : "not found", r.tfc_days || (t("exit_right") ? null : undefined)]
  };
  return key.map(k => { const g = got[k.f]; let ok;
    if(k.iso) ok = g[1] === k.iso; else if(k.f === "cap" || k.f === "tfc") ok = k.n == null ? (g[1] === null || g[1] === undefined && k.f === "tfc") : g[1] === k.n; else ok = g[1] === k.n;
    return { ...k, got:g[0], ok:!!ok }; });
}
function scoreHTML(rows, trap){ const n = rows.filter(x => x.ok).length, amd = rows.find(x => x.f === "notice");
  return `<div class="card pad" style="margin-top:14px;border:2px solid ${n === rows.length ? "var(--green)" : "var(--amber)"}"><div class="row between"><h3>How did Pulse do?</h3><span class="chip ${n === rows.length ? "green" : "amber"}">${n} of ${rows.length} correct</span></div>
    <p class="small muted" style="margin:4px 0 10px">This is a generated test contract, so Pulse knows the right answers. ${trap ? (amd.ok ? "<b>It caught the amendment hidden at the back.</b>" : "It missed the amendment hidden at the back.") : ""}</p>
    <div class="scroll"><table><thead><tr><th>Term</th><th>Answer key</th><th>Pulse found</th><th></th></tr></thead><tbody>${rows.map(x => `<tr><td>${h(x.label)}${x.note ? `<div class="small muted">${h(x.note)}</div>` : ""}</td><td>${h(x.truth)}</td><td>${h(x.got)}</td><td>${x.ok ? '<span class="chip green">✓</span>' : '<span class="chip red">✕</span>'}</td></tr>`).join("")}</tbody></table></div></div>`; }

/* ── turn a reading into a live supplier: radar, Legal queue, owner check-in, renewal packet ── */
const FMAP = { term_end:"end", renewal:"renewal", notice_days:"notice", notice_method:"noticeHow", price_limit:"cap", fees:"fee", service_level:"sla", service_credits:"credit", exit_right:"tfc", payment_terms:"pay" };
function register(rec){
  rec.docs.forEach(d => { if(!E.DOCS[d.id]){ E.DOCS[d.id] = d; window.PULSE_DOCS.push(d); } });
  if(!P.suppliers.find(s => s.id === rec.sup.id)) P.suppliers.push(rec.sup);
}
function toSupplier(r, text, opt){
  const id = "u" + Date.now().toString(36).slice(-6);
  const parts = splitDocs(text), eff = r.effective_iso || (r.term_end_iso ? E.addMonths(E.addDays(r.term_end_iso, 1), -12) : E.TODAY);
  const amdDate = parts[1] ? (datesIn(parts[1].text.slice(0, 600))[0] || E.addDays(eff, 200)) : null;
  const title = r.agreement_type && r.agreement_type.length < 80 ? r.agreement_type : "Agreement";
  const docs = [{ id:id + "-main", title, type:/order form/i.test(title) ? "Order form" : "Master agreement", effective:eff, text:parts[0].text }];
  if(parts[1]) docs.push({ id:id + "-amd", title:"Amendment No. 1", type:"Amendment", effective:amdDate > eff ? amdDate : E.addDays(eff, 1), text:parts[1].text });
  const docFor = q => { if(parts[1] && norm(parts[1].text).includes(norm(q))) return docs[1].id; return docs[0].id; };
  const terms = [];
  r.terms.forEach(t => { const f = FMAP[t.field]; if(!f || !t.quote || !norm(text).includes(norm(t.quote))) return;
    const v = f === "notice" ? (r.notice_days != null ? r.notice_days : (daysIn(t.value)[0] || 0)) : t.value;
    if(t.previous_quote && norm(text).includes(norm(t.previous_quote))) terms.push({ f, v: f === "notice" ? (daysIn(t.previous_value || "")[0] || v) : t.previous_value, doc:docs[0].id, cl:t.previous_clause || "", q:t.previous_quote, c:.95 });
    terms.push({ f, v, doc:docFor(t.quote), cl:t.clause || "", q:t.quote, c:Math.min(.99, Math.max(.3, +t.confidence || .8)) }); });
  /* edits the person made before adding win, and count as confirmed */
  if(opt.noticeDays != null && opt.noticeDays !== r.notice_days){ const nt = terms.filter(x => x.f === "notice").pop(); if(nt){ nt.v = opt.noticeDays; nt.c = .99; } }
  const name = (opt.name || r.supplier || "New supplier").replace(/\s+(Private Limited|Pvt\.? Ltd\.?)$/i, "");
  const sup = { id, name, category:opt.category || "Services", sub:(opt.sub || title), owner:opt.owner || "kavya", annual:opt.annual || 2400000,
    docs:docs.map(d => d.id), added:true, method:r.method,
    term:{ start:eff, initialEnd:opt.termEnd || r.term_end_iso, renewMonths:r.renewal_months || 12, auto:r.auto_renews !== false },
    terms, ops:{}, health:health(r).filter(x => x.ok !== true).map(x => x.t),
    checkin:{ q1:`Is ${name} still needed, at the same scope?`, q2:"How has the service been over the last 6 months?" },
    story:`Added by Priya from an uploaded contract (${r.method === "ai" ? "read with live AI" : "basic reading, AI off"}).`, ref:opt.ref || null };
  const rec = { sup, docs }; register(rec);
  E.S.added = (E.S.added || []).concat([rec]); E.S.nudged[id] = 1; E.save();
  return sup;
}

/* re-register added contracts after a reload, and forget them on reset */
(E.S.added || []).forEach(register);
const baseReset = E.reset;
E.reset = function(){ P.suppliers = P.suppliers.filter(s => !s.added); baseReset();
  try { localStorage.removeItem("pulse-gen-v1"); } catch(e){}
  if(window.PX) window.PX.reset(); if(window.PV && window.PV.resetLocal) window.PV.resetLocal(); };

window.PR = { rules, fromAI, clockOf, health, healthHTML, score, scoreHTML, toSupplier, splitDocs, FMAP };
})();
