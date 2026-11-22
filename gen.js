/* Pulse: test-contract generator. Builds a realistic, synthetic supplier contract for any industry,
   with a known answer key, so an evaluator can upload it and check Pulse's reading against the truth.
   Everything is deterministic from the contract reference, so the answer key survives a cleared browser. */
(function(){
const E = window.PE;

/* ── seeded random ── */
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (r, a) => a[Math.floor(r() * a.length)];

/* ── numbers in words, the way contracts write them ── */
const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function words(n){ if(n < 20) return ONES[n]; if(n < 100) return TENS[Math.floor(n/10)] + (n % 10 ? "-" + ONES[n % 10] : ""); if(n < 1000) return ONES[Math.floor(n/100)] + " hundred" + (n % 100 ? " and " + words(n % 100) : ""); return String(n); }
const wn = n => `${words(n)} (${n})`;
const pct = n => `${words(n)} per cent (${n}%)`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const longD = s => { const d = E.D(s); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const inrW = n => "INR " + Math.round(n).toLocaleString("en-IN");

/* ── industries: what the work is, how it's measured, what it costs ── */
const IND = {
  it:{ label:"IT managed services", kw:/\b(it|software|tech|cloud|managed service|helpdesk|infra)/i, title:"Managed IT Services Agreement", provider:"Service Provider",
    names:[["Nimbus","Stackline","Kernel","Bluegrid","Orbit"],["Infotech","Digital Services","Systems","Technologies"]], dom:"tech",
    scope:"provide end-user IT support, device management, patching and monitoring of the Customer's laptops, servers and network equipment across its Pune and Bengaluru offices, through a service desk available from 8:00 to 20:00 IST on working days",
    sla:"resolve at least ninety-five per cent (95%) of priority-one incidents within four (4) hours in each calendar month", slaShort:"95% of P1 incidents resolved within 4 hours", fee:[600000, 1800000] },
  saas:{ label:"Software subscription (SaaS)", kw:/\b(saas|subscription|licen[cs]e|platform|crm|hrms|erp)/i, title:"Subscription and Services Agreement", provider:"Provider",
    names:[["Cobalt","Ledgerly","Pinnacle","Brightfield","Quanta"],["Software","Cloud","Labs","SaaS"]], dom:"io",
    scope:"provide the Customer with access to its cloud workforce-planning platform for up to two hundred and fifty (250) named users, together with implementation support, standard integrations and product updates",
    sla:"make the platform available at least ninety-nine point five per cent (99.5%) of the time in each calendar month, excluding scheduled maintenance", slaShort:"99.5% monthly uptime", fee:[300000, 1200000] },
  fac:{ label:"Facilities management", kw:/\b(facilit|housekeep|clean|maintenance of building|property|security guard|guard)/i, title:"Integrated Facilities Management Agreement", provider:"Service Provider",
    names:[["Crestline","Urbancare","Tidewell","Prime Habitat","Evergreen"],["Facility Services","Facilities","Property Services"]], dom:"in",
    scope:"provide housekeeping, pantry, front-desk and minor maintenance services at the Customer's offices in Pune and Bengaluru, with trained staff deployed in the shifts set out in Schedule A",
    sla:"achieve a monthly site audit score of at least ninety per cent (90%) at each location", slaShort:"Monthly site audit at least 90%", fee:[700000, 1600000] },
  log:{ label:"Logistics and freight", kw:/\b(logistic|freight|courier|transport|shipping|warehous|3pl|trucking)/i, title:"Logistics Services Agreement", provider:"Carrier",
    names:[["Swiftline","Meridian","Roadstar","Coastal","Arrow"],["Logistics","Freight Services","Express","Cargo"]], dom:"in",
    scope:"collect, transport and deliver the Customer's hardware shipments between its warehouses and customer sites across India, including reverse logistics for returned equipment",
    sla:"deliver at least ninety-six per cent (96%) of consignments within the committed transit time in each calendar month", slaShort:"96% of consignments delivered on time", fee:[800000, 2200000] },
  staff:{ label:"Staffing and contract labour", kw:/\b(staff|recruit|manpower|contract labou?r|temp|talent|outsourc)/i, title:"Master Staffing Services Agreement", provider:"Agency",
    names:[["Peoplewise","Talentnest","Northbridge","Skillbay","Keystone"],["Staffing Solutions","HR Services","Workforce"]], dom:"in",
    scope:"supply qualified contract professionals to the Customer against individual work orders, and handle their payroll, statutory compliance and replacement within the agreed timelines",
    sla:"provide a suitable replacement for any departing associate within ten (10) working days in at least ninety per cent (90%) of cases", slaShort:"90% of replacements within 10 working days", fee:[900000, 2500000] },
  mfg:{ label:"Raw materials supply (manufacturing)", kw:/\b(manufactur|raw material|steel|chemical|component|packag|plastic|supply of goods|parts)/i, title:"Supply Agreement", provider:"Supplier",
    names:[["Vardhan","Sterling","Ironclad Metals","Unity","Shakti"],["Industries","Polymers","Components","Materials"]], dom:"in",
    scope:"manufacture and supply corrugated packaging and moulded inserts to the Customer's assembly plant in Chakan, Pune, against monthly purchase orders and the specifications in Schedule A",
    sla:"deliver at least ninety-seven per cent (97%) of ordered quantities on or before the confirmed delivery date in each calendar month", slaShort:"97% on-time, in-full delivery", fee:[1000000, 3000000] },
  mkt:{ label:"Marketing or creative agency", kw:/\b(marketing|advertis|creative|agency|pr\b|media|brand|digital marketing)/i, title:"Creative Services Retainer Agreement", provider:"Agency",
    names:[["Lumière","Inkwell","Kaleido","Northlight","Redfern"],["Creative","Communications","Studio","Media"]], dom:"in",
    scope:"provide brand, campaign and digital content services to the Customer, including up to eighty (80) hours of creative and account time each month",
    sla:"deliver at least ninety per cent (90%) of agreed creative assets by the dates set out in each monthly content plan", slaShort:"90% of assets delivered on time", fee:[250000, 900000] },
  med:{ label:"Medical equipment maintenance", kw:/\b(medical|hospital|health|clinic|diagnostic|biomedical|lab)/i, title:"Comprehensive Maintenance Agreement", provider:"Service Provider",
    names:[["Medilink","Carewave","Biotronix","Lifeline","Sanjeevani"],["Healthcare Services","Biomedical","Medical Systems"]], dom:"in",
    scope:"maintain, calibrate and repair the diagnostic imaging and laboratory equipment listed in Schedule A, including preventive maintenance visits every quarter and spare parts",
    sla:"keep each listed equipment item operational at least ninety-five per cent (95%) of scheduled hours in each calendar month", slaShort:"95% equipment uptime", fee:[400000, 1400000] },
  tel:{ label:"Telecom and connectivity", kw:/\b(telecom|network|internet|bandwidth|connectivity|isp|mpls|mobile)/i, title:"Connectivity Services Agreement", provider:"Service Provider",
    names:[["Skynet","Fibrelink","Airwave","Netcore","Spectra"],["Communications","Telecom","Networks"]], dom:"net",
    scope:"provide dedicated internet leased lines and an MPLS network connecting the Customer's offices in Pune, Bengaluru and Hyderabad, with 24x7 network operations support",
    sla:"make each circuit available at least ninety-nine point five per cent (99.5%) of the time in each calendar month", slaShort:"99.5% circuit availability", fee:[350000, 1100000] },
  gen:{ label:"Other (type your own)", kw:/^$/, title:"Services Agreement", provider:"Service Provider",
    names:[["Apex","Keystone","Silverline","Horizon","Trident"],["Services","Solutions","Enterprises"]], dom:"in",
    scope:"provide the services described in Schedule A to the Customer at its offices in Pune and Bengaluru",
    sla:"complete at least ninety-five per cent (95%) of service requests within the response times set out in Schedule A in each calendar month", slaShort:"95% of requests on time", fee:[300000, 1500000] },
  food:{ label:"Cafeteria and catering", kw:/\b(cater|cafeteria|canteen|food|meal|pantry)/i, title:"Catering Services Agreement", provider:"Caterer",
    names:[["Annapurna","Tasteful","Greenleaf","Saffron","Spice Route"],["Hospitality","Food Services","Catering"]], dom:"in",
    scope:"run the employee cafeterias at the Customer's Pune and Bengaluru offices, serving breakfast, lunch and evening snacks on working days to the menu and hygiene standards in Schedule A",
    sla:"achieve a monthly food-safety audit score of at least ninety per cent (90%) and an employee satisfaction score of at least four (4) out of five (5)", slaShort:"Food-safety audit at least 90%", fee:[500000, 1500000] }
};
const CODES = Object.keys(IND);

function industryFor(text){ const t = String(text || "").trim(); if(!t) return null;
  for(const k of CODES) if(k !== "gen" && IND[k].kw.test(t) || IND[k].label.toLowerCase() === t.toLowerCase()) return k; return null; }

/* ── reference: PT-<code>-<seed>-<S|T>; everything below is derived from it ── */
function makeRef(code, trap, custom){ const seed = 10000 + Math.floor(Math.random() * 89999); return `PT-${code.toUpperCase()}${custom ? "X" : ""}-${seed}-${trap ? "T" : "S"}`; }
function parseRef(ref){ const m = /PT-([A-Z]+?)(X?)-(\d{5})-([ST])/.exec(ref || ""); if(!m) return null; const code = m[1].toLowerCase(); if(!IND[code]) return null; return { code, custom:!!m[2], seed:+m[3], trap:m[4] === "T", ref:m[0] }; }

/* the terms, chosen so the deadline lands in the next few weeks: that's when a renewal needs a decision */
function params(p){
  const r = rng(p.seed * 7 + (p.trap ? 3 : 1)), ind = IND[p.code];
  const notice = pick(r, p.trap ? [60, 90, 90] : [30, 45, 60, 90]);
  const notice0 = p.trap ? pick(r, [30, 30, 45]) : null;
  const daysToDeadline = 10 + Math.floor(r() * 50);
  const periodEnd = E.addDays(E.TODAY, daysToDeadline + notice);
  const renewMonths = 12, termMonths = pick(r, [24, 36]);
  const rolled = r() < 0.35 ? 1 : 0;
  const initialEnd = rolled ? E.addDays(E.addMonths(E.addDays(periodEnd, 1), -12), -1) : periodEnd;
  const start = E.addMonths(E.addDays(initialEnd, 1), -termMonths);
  const [lo, hi] = ind.fee; const monthly = Math.round((lo + r() * (hi - lo)) / 5000) * 5000;
  const cap = pick(r, [5, 6, 7, 8]), cap0 = p.trap ? cap + pick(r, [1, 2]) : null;
  const credit = pick(r, [2, 3, 5]), creditMax = pick(r, [10, 15]);
  const hasTfc = r() < 0.6, tfcDays = pick(r, [60, 90]);
  const hasCap = p.trap ? true : r() < 0.8;
  const pay = pick(r, [30, 45, 60]);
  const n1 = pick(r, ind.names[0]), n2 = pick(r, ind.names[1]);
  const name = `${n1} ${n2} Private Limited`, short = n1.split(" ")[0];
  const email = `legal@${short.toLowerCase().replace(/[^a-z]/g, "")}${ind.dom === "in" ? ".co.in" : "." + ind.dom}`;
  const amdDate = p.trap ? E.addMonths(start, Math.max(8, termMonths - 14)) : null;
  const monthly1 = p.trap ? Math.round(monthly * 1.12 / 5000) * 5000 : monthly;
  const deadline = E.addDays(periodEnd, -notice);
  return { ...p, ind, notice, notice0, periodEnd, initialEnd, start, renewMonths, termMonths, rolled, monthly, monthly1, cap, cap0, credit, creditMax, hasTfc, tfcDays, hasCap, pay, name, short, email, amdDate, deadline,
    annual: monthly1 * 12, city: pick(r, ["Andheri East, Mumbai","Whitefield, Bengaluru","Hinjewadi, Pune","Gachibowli, Hyderabad","Sector 62, Noida"]) };
}

/* ── the document ── */
function build(ref, scopeOverride, slaOverride, industryName){
  const p0 = parseRef(ref); if(!p0) return null; const q = params(p0), ind = q.ind;
  const scope = scopeOverride || ind.scope, sla = slaOverride || ind.sla;
  const title = ind.title.toUpperCase(), prov = ind.provider;
  const noticeMain = p0.trap ? q.notice0 : q.notice, capMain = p0.trap ? q.cap0 : q.cap;
  const L = [];
  const H = t => L.push({ h:t }), T = t => L.push({ t });
  L.push({ title });
  T(`This ${ind.title} (the "Agreement") is made on ${longD(q.start)} (the "Effective Date") between Vyom Technologies Private Limited, a company incorporated under the Companies Act, 2013, having its registered office at Plot 12, Baner Road, Pune 411045 (the "Customer"), and ${q.name}, having its registered office at ${q.city} (the "${prov}").`);
  T(`Contract reference: ${ref}. ${industryName ? `Industry: ${industryName}. ` : ""}This is a synthetic test contract generated by Pulse for demonstration. It is not a real agreement.`);
  H("1. SERVICES");
  T(`1.1 The ${prov} shall ${scope}.`);
  T(`1.2 The ${prov} shall perform the Services with reasonable skill and care, in accordance with applicable law and the Customer's site policies notified to it in writing.`);
  H("2. TERM AND RENEWAL");
  T(`2.1 This Agreement commences on the Effective Date and continues for an initial term of ${wn(q.termMonths)} months, ending on ${longD(q.initialEnd)} (the "Initial Term").`);
  T(`2.2 Upon expiry of the Initial Term, this Agreement shall automatically renew for successive periods of ${wn(q.renewMonths)} months each (each a "Renewal Term"), unless either Party gives the other written notice of non-renewal not less than ${wn(noticeMain)} days before the end of the Initial Term or the then-current Renewal Term.`);
  H("3. FEES AND PAYMENT");
  T(`3.1 In consideration of the Services, the Customer shall pay the ${prov} a fixed monthly fee of ${inrW(q.monthly)} per month, exclusive of applicable GST.`);
  if(q.hasCap) T(`3.2 The fees may be revised once in each contract year with effect from the start of a Renewal Term, provided that any annual increase shall not exceed ${pct(capMain)} of the fees for the preceding year and is notified in writing at least forty-five (45) days in advance.`);
  else T(`3.2 The ${prov} may revise its fees from the start of any Renewal Term by giving the Customer written notice of the revised fees.`);
  T(`3.3 The ${prov} shall invoice monthly in arrears. Undisputed invoices are payable within ${wn(q.pay)} days of receipt of a valid invoice.`);
  T(`3.4 The Customer may dispute any invoice in good faith by notice within thirty (30) days of receipt, and shall pay the undisputed portion on time.`);
  H("4. SERVICE LEVELS AND SERVICE CREDITS");
  T(`4.1 The ${prov} shall ${sla}.`);
  T(`4.2 The ${prov} shall report performance against the service levels to the Customer by the fifth (5th) working day of each month.`);
  T(`4.3 If a service level in Clause 4.1 is not met in any month, the ${prov} shall credit ${pct(q.credit)} of that month's fee, subject to a maximum of ${pct(q.creditMax)} of the monthly fee. Service credits are without prejudice to the Customer's other rights.`);
  H("5. TERMINATION");
  if(q.hasTfc) T(`5.1 The Customer may terminate this Agreement for convenience by giving the ${prov} not less than ${wn(q.tfcDays)} days' written notice.`);
  else T(`5.1 Either Party may terminate this Agreement by written notice if the other Party commits a material breach and fails to remedy it within thirty (30) days of being notified of it.`);
  T(`5.2 Either Party may terminate this Agreement immediately by written notice if the other Party becomes insolvent or ceases to carry on business.`);
  H("6. CONFIDENTIALITY AND DATA");
  T(`6.1 Each Party shall keep the other Party's confidential information secret and use it only for the purposes of this Agreement. The ${prov} shall process any personal data only on the Customer's documented instructions and in line with the Digital Personal Data Protection Act, 2023.`);
  H("7. LIABILITY");
  T(`7.1 Except for breach of confidentiality, data protection or fraud, each Party's total liability under this Agreement in any contract year shall not exceed the fees paid or payable in that contract year.`);
  H("8. NOTICES");
  T(`8.1 All notices under this Agreement shall be in writing and delivered by registered post or courier to the registered office of the receiving Party, with a copy by email to ${q.email} in the case of notices to the ${prov}.`);
  H("9. GOVERNING LAW");
  T(`9.1 This Agreement is governed by the laws of India. The courts at Pune shall have exclusive jurisdiction.`);
  T(`Signed for Vyom Technologies Private Limited: Priya Nair, Category Manager, Procurement. Signed for ${q.name}: Authorised Signatory.`);
  if(p0.trap){
    L.push({ page:true });
    L.push({ title:`AMENDMENT NO. 1 TO THE ${title}` });
    T(`This Amendment No. 1 is made on ${longD(q.amdDate)} between Vyom Technologies Private Limited (the "Customer") and ${q.name} (the "${prov}"), and amends the ${ind.title} dated ${longD(q.start)} (the "Agreement"). Contract reference: ${ref}.`);
    T(`1. Scope. With effect from ${longD(q.amdDate)}, the Services are extended to the Customer's new office in Hyderabad, and the monthly fee in Clause 3.1 is increased to ${inrW(q.monthly1)} per month.`);
    T(`2. Price revision. In Clause 3.2, any annual increase shall not exceed ${pct(q.cap)} of the fees for the preceding year.`);
    T(`3. Notice period. In Clause 2.2, the words "${wn(q.notice0)} days" shall be replaced with "${wn(q.notice)} days".`);
    T(`4. All other terms of the Agreement remain unchanged and in full force.`);
    T(`Signed for Vyom Technologies Private Limited: Priya Nair. Signed for ${q.name}: Authorised Signatory.`);
  }
  const text = L.map(x => x.title ? x.title : x.h ? x.h : x.t ? x.t : "").filter(Boolean).join("\n\n");
  const key = answerKey(q);
  return { ref, q, lines:L, text, key, filename:`${q.short}-${ind.title.replace(/[^A-Za-z]+/g, "-")}-${ref}`.replace(/-+/g, "-") };
}

/* the truth, for the scorecard */
function answerKey(q){
  const k = [
    { f:"notice", label:"Notice to stop renewal", truth:`${q.notice} days`, n:q.notice, note: q.trap ? `the amendment changed it from ${q.notice0} to ${q.notice}` : "" },
    { f:"end", label:"Current term ends", truth:E.fmtD(q.periodEnd), iso:q.periodEnd, note: q.rolled ? "the initial term already renewed once" : "" },
    { f:"deadline", label:"Notice deadline", truth:E.fmtD(q.deadline), iso:q.deadline },
    { f:"renewal", label:"Auto-renewal", truth:`Yes, ${q.renewMonths} months`, n:q.renewMonths },
    { f:"cap", label:"Price-increase limit", truth:q.hasCap ? `${q.cap}% a year` : "None (open-ended)", n:q.hasCap ? q.cap : null, note: q.trap ? `the amendment lowered it from ${q.cap0}%` : "" },
    { f:"fee", label:"Current monthly fee", truth:E.inr(q.monthly1) + " a month", n:q.monthly1 },
    { f:"pay", label:"Payment terms", truth:`${q.pay} days`, n:q.pay },
    { f:"credit", label:"Service credits", truth:`${q.credit}% a month, max ${q.creditMax}%`, n:q.credit },
    { f:"tfc", label:"Exit for convenience", truth:q.hasTfc ? `Yes, ${q.tfcDays} days` : "No", n:q.hasTfc ? q.tfcDays : null }
  ];
  return k;
}

/* ── a tiny, dependency-free PDF writer (Helvetica, A4, text only, uncompressed) ── */
function pdf(doc){
  const W = 595, Hh = 842, M = 56, size = 10, lead = 14.2;
  const esc = s => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7E]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const wrap = (s, max) => { const out = []; let cur = ""; s.split(/\s+/).forEach(w => { if((cur + " " + w).trim().length > max){ out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }); if(cur) out.push(cur); return out; };
  const pages = [[]]; let y = Hh - M;
  const line = (txt, font, sz) => { if(y < M + 30){ pages.push([]); y = Hh - M; } pages[pages.length - 1].push(`BT /${font} ${sz} Tf ${M} ${y.toFixed(1)} Td (${esc(txt)}) Tj ET`); y -= sz === size ? lead : sz * 1.45; };
  doc.lines.forEach(x => {
    if(x.page){ pages.push([]); y = Hh - M; return; }
    if(x.title){ wrap(x.title, 60).forEach(t => line(t, "F2", 13)); y -= 8; return; }
    if(x.h){ y -= 4; line(x.h, "F2", 10.5); y -= 2; return; }
    wrap(x.t, 98).forEach(t => line(t, "F1", size)); y -= 6;
    pages[pages.length - 1].push("BT /F1 1 Tf 0 0 Td () Tj ET");
  });
  pages.forEach((pg, i) => pg.push(`BT /F1 8 Tf ${M} 30 Td (${esc(`${doc.ref} - synthetic test contract generated by Pulse - page ${i + 1} of ${pages.length}`)}) Tj ET`));
  const objs = []; const add = s => { objs.push(s); return objs.length; };
  const cat = add(null), pagesId = add(null), f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"), f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids = pages.map(pg => { const content = pg.join("\n"); const cid = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${Hh}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cid} 0 R >>`); });
  objs[cat - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
  let out = "%PDF-1.4\n", offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("") + `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R /Info << /Title (${esc(doc.ref)}) /Producer (Pulse test-contract generator) >> >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type:"application/pdf" });
}

/* read back a PDF this generator wrote (works even when the full PDF reader can't load) */
function readOwnPdf(buf){
  const s = new TextDecoder("latin1").decode(buf); if(!/Pulse test-contract generator/.test(s)) return null;
  const lines = []; const re = /\((.*?)(?<!\\)\)\s*Tj/g; let m;
  while((m = re.exec(s))) lines.push(m[1].replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\"));
  return lines.filter(l => !/synthetic test contract generated by Pulse - page/.test(l)).join("\n").replace(/\n(?=\n)/g, "\n").replace(/\n\n+/g, "\n\n").trim();
}

function download(blob, name){ const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }

/* optional: live AI writes the scope and service level for an industry we don't have a template for */
async function tailor(industry){
  const out = await E.ask(`Write two short clauses for a supplier services contract in the "${industry}" industry, for an Indian technology company buying the service. Reply with ONLY JSON: {"scope":"...","sla":"..."}.
"scope" completes the sentence "The Service Provider shall ..." in one sentence of 25-45 words, concrete and specific. "sla" completes "The Service Provider shall ..." with one measurable monthly service level that includes a percentage written as words and digits, e.g. "ninety-five per cent (95%)". No other text.`, { timeout:30000 });
  const j = JSON.parse(out.text.replace(/^[^{]*/, "").replace(/[^}]*$/, ""));
  const clean = s => String(s || "").trim().replace(/^the service provider shall\s*/i, "").replace(/\.$/, "");
  if(!clean(j.scope) || !/%/.test(j.sla || "")) throw new Error("bad");
  return { scope:clean(j.scope), sla:clean(j.sla) };
}

/* remember generated docs (custom scope text) so a reload can still rebuild them */
const KEY = "pulse-gen-v1";
const store = { get(){ try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){ return {}; } }, set(ref, v){ try { const all = store.get(); all[ref] = v; localStorage.setItem(KEY, JSON.stringify(all)); } catch(e){} } };
function rebuild(ref){ const p = parseRef(ref); if(!p) return null; const x = store.get()[p.ref] || {}; return build(p.ref, x.scope, x.sla, x.industry); }

window.PG = { IND, CODES, industryFor, makeRef, parseRef, build, rebuild, pdf, readOwnPdf, download, tailor, store, words };
})();
