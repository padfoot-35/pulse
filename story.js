/* Pulse: Story mode: the case for the product, inside the prototype */
(function(){
const P = window.PULSE, E = window.PE;
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SECTIONS = [["why","Why this stage"],["problem","The problem"],["vyom","Vyom (simulated)"],["people","Personas"],["stake","Stakeholders"],["how","How it works"],["road","Roadmap & trust"],["land","Landscape"],["metrics","Success metrics"],["assume","Assumptions"],["sources","Sources"]];
function video(){
  const d = window.PA.modal(`<div class="row between" style="margin-bottom:12px;gap:12px"><div><div class="eyebrow">Narrated walkthrough · 3 min 50 s · sound on</div><h3>One renewal, end to end, across five people</h3></div><button class="btn sec sm" data-close>Close</button></div>
    <video class="demovid" src="demo.mp4" poster="demo-poster.jpg" controls autoplay playsinline preload="metadata"></video>
    <div class="row between" style="margin-top:12px;gap:12px;flex-wrap:wrap"><span class="small muted">Screen recorded from this prototype, unedited. Voiceover is AI-generated. Synthetic company and data; AI answers shown are the stored ones.</span><button class="btn pri sm" id="vidtry">Now try it yourself →</button></div>`);
  d.querySelector(".modal").classList.add("vidmodal");
  const v = d.querySelector("video"); if(v){ const p = v.play(); if(p && p.catch) p.catch(() => {}); }
  d.querySelector("#vidtry").onclick = () => { window.PA.close(); window.PA.go("radar", "priya"); };
}
const go = (r, p) => `data-start="${r}" data-sp="${p}"`;

function hero(){
  const cs = P.suppliers[0], c = E.clock(cs);
  const a = E.TODAY, z = c.renewOn, span = E.daysBetween(a, z), pos = d => (E.daysBetween(a, d) / span * 100).toFixed(1) + "%";
  return `<div class="hero"><div class="single heroGrid">
    <div><span class="pill">Concept prototype · Stage 3, intelligent repository</span>
    <h1>Every supplier contract, decided before the deadline.</h1>
    <p class="lede">Pulse reads every contract and amendment, turns them into cited terms, and gives the person who owns each supplier a 60-second say before money moves. It starts with renewals, the one moment where auto-renewals, missed service levels and wrong invoices all meet.</p>
    <div class="row"><button class="btn pri" ${go("radar","priya")}>Try the product →</button><button class="btn sec" style="background:transparent;color:#f5f6f6;border-color:#5d939a" data-video="1">▶ Watch the video (4 min)</button><button class="btn ghost" style="color:#cfe0e2" data-jump="why">Read the case ↓</button></div>
    <p class="small heroalt">Have a contract to hand, or none at all? <button class="linkbtn" data-start="add" data-sp="priya">Test Pulse on a contract</button>: upload one, or generate a realistic one for any industry.</p></div>
    <div class="heroCard" aria-label="Preview of an owner check-in">
      <div class="chat-h" style="border-radius:14px 14px 0 0"><b># Pulse</b><span style="opacity:.75">· Kavya Rao</span></div>
      <div style="padding:16px;background:#fff;border-radius:0 0 14px 14px;color:var(--ink)">
        <div class="msg"><span class="av bot">P</span><div class="bd"><div class="nm">Pulse<span>APP</span></div>Hi Kavya, quick one about a supplier you own.
          <div class="box">Your <b>CleanSpace</b> contract renews on <b>1 Mar 2027</b> (₹1.86 Cr). To change anything, Vyom must tell them by <b>30 Nov</b>, which is 8 days from now.<div class="small" style="margin-top:6px;color:var(--teal);text-decoration:underline">Show me where it says this</div></div>
          <div class="choices"><button tabindex="-1">Keep it as it is</button><button tabindex="-1" class="on">Keep it, but change something</button><button tabindex="-1">We don't need it any more</button></div></div></div>
        <p class="small muted" style="margin:10px 0 0;text-align:center">Two questions, no login. Procurement gets the rest.</p></div></div>
    </div>
    <div class="ribbon"><div class="single">
      <div class="row between" style="margin-bottom:18px"><div><div class="eyebrow" style="color:#8fc1c7">The deadline nobody saw</div><h3 style="color:#f5f6f6">CleanSpace housekeeping · ₹1.86 Cr a year</h3></div><span class="small" style="color:#9fbcc0">One of six real-world patterns simulated in this prototype</span></div>
      <div class="rtime" style="position:relative;height:120px;margin:0 8px">
        <div style="position:absolute;left:0;right:0;top:56px;height:4px;background:#24434c;border-radius:2px"></div>
        <div style="position:absolute;left:0;width:${pos(c.deadline)};top:56px;height:4px;background:#c7325f;border-radius:2px"></div>
        ${[[a,"Today","#f5f6f6","demo date",0],[c.deadline,"Real deadline","#ff7fa3","90 days, per Amendment 1",1],[c.trackerDeadline,"Tracker's deadline","#9fbcc0","30 days, outdated",0],[z,"Auto-renews","#f5f6f6","for 12 more months",1]].map(([d, t, col, sub, up]) => `<div style="position:absolute;left:${pos(d)};top:0;transform:translateX(${d === a ? "0" : d === z ? "-100%" : "-50%"});text-align:${d === a ? "left" : d === z ? "right" : "center"};width:190px">
          <div style="${up ? "" : "margin-top:72px"};color:${col};font-size:14px;font-weight:600">${t} · ${E.fmtDs(d)}</div><div style="${up ? "" : ""}color:#9fbcc0;font-size:12.5px">${sub}</div></div>
          <div style="position:absolute;left:${pos(d)};top:50px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:${col};border:3px solid #0f242d"></div>`).join("")}
      </div>
      <div class="rlist">${[["Today", a, "#f5f6f6", "demo date"],["Real deadline", c.deadline, "#ff7fa3", "90 days' notice, per Amendment 1"],["Tracker's deadline", c.trackerDeadline, "#9fbcc0", "30 days, outdated: too late"],["Auto-renews", z, "#f5f6f6", "for 12 more months"]].map(([t, d, col, sub]) => `<div class="rli"><span class="rdot" style="background:${col}"></span><span><b style="color:${col}">${t} · ${E.fmtDs(d)}</b><br><span style="color:#9fbcc0;font-size:12.5px">${sub}</span></span></div>`).join("")}</div>
      <p style="color:#c4d6d9;max-width:760px;margin-top:10px">A June 2025 amendment changed the notice period from 30 to 90 days. The team's tracker never caught it, so it shows a deadline <b style="color:#fff">${c.trackerGap} days after</b> the real one. By then, ₹1.86 Cr is committed for another year. Pulse reads the whole contract family, so it gets the real date.</p>
    </div></div></div>`;
}


function briefPanel(){
  const req = [
    ["1","Why this stage","Repository. Four of the brief's five pains happen after signature, and that's Sirion's home ground.","why"],
    ["2","Stakeholder map","10 stakeholders on a power/interest map, 6 named conflicts, who does what at each moment.","stake"],
    ["3","The problem","Nobody owns a contract after signature. 9% of value leaks; simulated with 6 documented failure patterns.","problem"],
    ["4","Working prototype","5 roles including the supplier, one connected flow, live AI with clause-checked answers, and a test-your-own-contract mode that feeds the live workflow.","product"],
    ["5","Success metrics","North star: renewals decided before the deadline. Guardrails and pre-set kill criteria.","metrics"]];
  const decide = [["Who we build for","The business owner who never reads the contract, plus Procurement, Legal and Finance."],["How much the AI does","Reads and drafts on its own; anything to a supplier or about money needs a human click."],["Our assumptions","A fictional 3,000-person company with 2,500 suppliers, no CLM, Slack and an ERP. All listed."]];
  return `<section class="briefsec"><div class="single"><div class="row between" style="margin-bottom:14px"><div><div class="eyebrow">The brief, answered</div><h2 style="font-size:28px">Everything the brief asked for, in one place</h2></div><span class="small muted">Click any tile to jump to it</span></div>
  <div class="grid briefgrid">${req.map(([n, t, a, id]) => `<button class="card brieftile" ${id === "product" ? 'data-start="radar" data-sp="priya"' : `data-jump="${id}"`}><span class="bn">${n}</span><b>${t}</b><span class="small ink2">${a}</span><span class="small" style="color:var(--teal);margin-top:auto">${id === "product" ? "Open the product →" : "See section ↓"}</span></button>`).join("")}</div>
  <div class="grid g3" style="margin-top:12px">${decide.map(([t, a]) => `<div class="callout"><b>${t}:</b> ${a}</div>`).join("")}</div></div></section>`;
}

function why(){
  const rows = [["Requests get lost, approvals stall","Intake"],["Once signed, contracts are rarely looked at again","Repository"],["Unreviewed auto-renewals","Repository"],["Missed service levels","Repository"],["Invoices that don't match agreed prices","Repository"]];
  return `<section class="sec" id="why"><div class="single"><div class="eyebrow">1 · Why this stage</div><h2>Four of the brief's five pains happen after signature</h2>
  <p class="tldr"><span>In short</span>We chose the repository stage, starting with renewals: that's where most of the brief's pains and most of the lost money sit, and it's Sirion's home ground.</p>
  <p class="lead">Only one symptom belongs to intake, and none describes a negotiation problem. The three that cost money all appear once the contract is signed and filed away.</p>
  <div class="grid g2" style="align-items:start"><div class="card scroll"><table><thead><tr><th>Symptom in the brief</th><th>Where it lives</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b === "Repository" ? '<span class="chip purple">Post-signature</span>' : '<span class="chip line">Intake</span>'}</td></tr>`).join("")}</tbody></table></div>
  <div class="grid"><div class="card pad"><h4>Where value leaks</h4><p class="small ink2" style="margin-top:6px">WorldCC finds procurement contracts lose about 11% of value <i>after</i> signature, partly because Procurement and Legal step away just when they're needed.</p></div>
    <div class="card pad"><h4>Where AI does real work</h4><p class="small ink2" style="margin-top:6px">Reading 7,000 messy documents, working out which amendment overrides which clause, and quoting the source: this is hard for people and well suited to AI.</p></div>
    <div class="card pad"><h4>Where Sirion is strongest</h4><p class="small ink2" style="margin-top:6px">Sirion began in post-signature supplier governance and invoice checking. Its 2026 message is the contract "system of record". This stage plays to that.</p></div></div></div>
  <div class="grid g3" style="margin-top:16px">
    <div class="callout"><b>Why renewals first?</b> The renewal is the one moment that pulls in all three money pains at once: the notice deadline, service-level history as leverage, and the price asked against the contract's cap.</div>
    <div class="callout"><b>Why not intake?</b> The easiest to build, but crowded (Zip, Omnea, SAP Ariba, Ironclad), and the value is speed, which is hard to put a number on.</div>
    <div class="callout"><b>Why not negotiation?</b> This is the home of Sirion's flagship agents (issue detection, redlining), and the brief describes no negotiation pain.</div></div></div></section>`;
}

function problem(){
  const scen = [["cleanspace","Amendment changes the notice period; tracker misses it","Reads the contract family; latest document wins; Legal confirms"],["sentinel","Service levels missed; credits never claimed and expire","Tracks credit claim windows; drafts the claim"],["talentbridge","Supplier asks above the cap; invoice bills the wrong rate","Compares letters and invoices against the clause"],["lumen","Buyer has left; renewal goes to a dead inbox; licences unused","Spots ownerless contracts; suggests a new owner from usage"],["northstar","\"Tariff surcharge\" announced without contractual basis","Tests the letter against notice, evidence and cap"],["brightwave","Retainer keeps billing after the work ended","Flags rolling spend with no active work"]];
  return `<section class="sec" id="problem"><div class="single"><div class="eyebrow">2 · The problem</div><h2>Nobody owns the contract when it matters</h2>
  <p class="tldr"><span>In short</span>After signature, nobody clearly owns a supplier contract, so deadlines, credits and price caps slip. Published research puts the leak at about 9% of contract value.</p>
  <p class="lead">After signature, the person who actually manages a supplier is a business manager, not a contracts professional. They never see the contract again. Procurement assumes the business is watching it; the business assumes Procurement is.</p>
  <div class="grid g4">${[["Business owners","Surprise bills and lapsed services; no idea they own a contract"],["Procurement","Covers ~2,500 suppliers with 6 people; reviews only the biggest renewals"],["Finance","Checks invoices against the purchase order, not the contract"],["Legal","Answers the same \"can we cancel?\" question every week"]].map(([a, b]) => `<div class="card pad"><h4>${a}</h4><p class="small ink2" style="margin-top:6px">${b}</p></div>`).join("")}</div>
  <h3 style="margin:34px 0 12px">How we know it's real</h3>
  <div class="grid g4">${P.evidence.slice(0, 8).map(e => `<div class="card stat"><div class="row between" style="align-items:flex-start"><div class="k">${h(e.k)}</div><span class="chip line" style="white-space:normal;text-align:right">${h(e.ty || "")}</span></div><div class="t">${h(e.t)}</div><a href="${e.u}" target="_blank" rel="noopener">${h(e.s)}</a></div>`).join("")}</div>
  <h3 style="margin:34px 0 12px">Six simulated scenarios, each based on a documented pattern</h3>
  <div class="card scroll"><table class="stack"><thead><tr><th>Supplier (fictional)</th><th>What goes wrong</th><th>What Pulse does</th><th></th></tr></thead><tbody>${scen.map(([id, a, b]) => { const s = P.suppliers.find(x => x.id === id); return `<tr><td><b style="font-weight:600">${h(s.name)}</b><div class="small muted">${h(s.category)}</div></td><td>${h(a)}</td><td>${h(b)}</td><td><button class="btn sec sm" ${go("packet-" + id,"priya")}>See it</button></td></tr>`; }).join("")}</tbody></table></div>
  <details class="more"><summary><b>In practitioners' own words</b><span> · ${P.stories.length} published accounts behind the scenarios</span></summary>
  <div class="grid g2">${P.stories.map(s => `<div class="quote"><p>"${h(s.q)}"</p><a class="small" href="${s.u}" target="_blank" rel="noopener">${h(s.s)}</a></div>`).join("")}</div></details>
  <div class="callout warn" style="margin-top:20px"><b>Method, stated plainly.</b> We did not interview users for this prototype. The company, personas and scenarios are an <b>evidence-based simulation</b>, built from published practitioner accounts, industry research and product reviews, each linked above. The first step of a real pilot is to test the riskiest assumptions with 8–10 interviews (see Success metrics).</div></div></section>`;
}

function vyom(){
  const cats = [["Software / SaaS",600,"22%","Team leads"],["Staffing & contractors",180,"20%","Engineering & delivery managers"],["Consultants",300,"14%","Function heads"],["Facilities",350,"13%","Site admin managers"],["Marketing & agencies",250,"10%","Marketing leads"],["Logistics & travel",200,"9%","Operations / admin"],["IT hardware & telecom",150,"8%","IT"],["Long tail",470,"4%","Anyone"]];
  return `<section class="sec" id="vyom"><div class="single"><div class="eyebrow">3 · The company (simulated)</div><h2>Vyom Technologies: 3,000 people, 2,500 suppliers, no contract system</h2>
  <p class="tldr"><span>In short</span>A fictional Indian tech company whose contracts live in Drive, email and a tracker nobody trusts: a typical starting point, not an edge case.</p>
  <p class="lead">A B2B software and IT services company headquartered in Bengaluru, which grew from 1,200 to 3,000 people in three years. Contracts live in Google Drive, Gmail, Slack and an Excel tracker last fully updated nine months ago.</p>
  <div class="grid g3">${[["~₹1,000 Cr","third-party spend a year (assumption)"],["~7,000","contract documents"],["~850","renewals in any 12 months, ~60% automatic"],["6 · 4 · 7","people in Procurement · Legal · Accounts payable"],["~400","managers who each own at least one supplier"],["9 months","since the renewal tracker was fully updated"]].map(([k, l]) => `<div class="card kpi"><div class="k">${k}</div><div class="l">${l}</div></div>`).join("")}</div>
  <details class="more"><summary><b>Supplier categories and who really owns them</b><span> · 8 categories, 2,500 suppliers</span></summary><div class="card scroll"><table><thead><tr><th>Category</th><th class="r">Suppliers</th><th class="r">Spend</th><th>Who really owns it</th></tr></thead><tbody>${cats.map(c => `<tr><td>${c[0]}</td><td class="r num">${c[1]}</td><td class="r num">${c[2]}</td><td class="small">${c[3]}</td></tr>`).join("")}</tbody></table></div></details>
  <p class="small muted" style="margin-top:12px">The brief is domain-agnostic, so Pulse treats every category the same way: a renewal, an amendment or a price letter works identically for a software tool, a staffing agency or a security firm. Software-only renewal tools (Vertice, Zylo, Tropic) don't cover most of this spend.</p></div></section>`;
}

const GROUND = { arjun:["Practitioner account: contract kept renewing after its buyer left","Tropic: renewal ownership vacuum"], kavya:["Armanino: unclaimed credits and unenforced penalties","WorldCC: value leaks after signature"], priya:["Vertice: 70% of tail renewals get no review","Redress: 1 in 5 auto-renewal notices missed without an owner"], meera:["Redress: 1 in 12 invoices has a material error","apexanalytix: price drift between contract and ERP"], rahul:["Gartner: 40%+ agentic AI projects cancelled over risk controls","PwC: ~20% trust agents with money"], sup:["Stakeholder analysis; supplier side of every scenario"] };
const TRACE = [
  ["Kavya, Arjun","Never know a deadline; renewals happen silently","WorldCC; Tropic","60-second check-in in Slack, Teams or email","inbox","kavya","Check-in reply rate"],
  ["Priya","Small renewals roll over unreviewed","Vertice 70%","Renewal radar ranked by money × days left","radar","priya","Deliberate-decision rate (north star)"],
  ["Priya","Amendments change terms; trackers miss it","Sirion & WorldCC: 71% use shared drives","Contract families; latest document wins; clause links","c-cleanspace","priya","Critical-term accuracy"],
  ["Rahul","Fears wrong answers from AI","Gartner; PwC","Confidence scores, Legal queue, stricter date until confirmed","verify","rahul","Share auto-accepted · accuracy ≥ 98%"],
  ["Rahul","Same \"can we cancel?\" question every week","Practitioner pattern","Owner Q&A answered from the clause","inbox","kavya","Legal questions a week"],
  ["Meera","Invoices matched to the PO, not the contract","Redress 1 in 12","Contract-aware invoice and quote checks","finance","meera","Value held, disputed or credited"],
  ["Priya","Buyer leaves; renewal goes to a dead inbox","Practitioner account","Ownerless-contract detection and reassignment","packet-lumen","priya","Contracts with no active owner"],
  ["Sneha, Priya","Tariff surcharges with unclear basis","KPMG 51%; Agiloft 92%","Clause tests on supplier letters; tariff-shock query","packet-northstar","priya","Surcharges handled with a contract basis"],
  ["Supplier","Late surprises; disputes months later","Stakeholder map","Clause-backed messages with a reply channel","supplier","supplier","Disputes after notices"]];
function trace(){ return `<h3 style="margin:34px 0 6px">Every feature traces to a named person's pain</h3><p class="small muted" style="margin:0 0 12px">If a feature can't be traced to a pain and a metric, it isn't in the prototype.</p>
  <div class="card scroll"><table class="stack"><thead><tr><th>Who</th><th>Pain</th><th>Evidence</th><th>Feature</th><th>Measured by</th><th></th></tr></thead><tbody>${TRACE.map(([w, p, e, f, r, pp, m]) => `<tr><td><b style="font-weight:600">${w}</b></td><td class="small">${p}</td><td class="small muted">${e}</td><td class="small">${f}</td><td class="small">${m}</td><td><button class="btn sec sm" ${go(r, pp)}>See it</button></td></tr>`).join("")}</tbody></table></div>`; }
function people(){
  const L = [
    ["arjun","Supplier owner","Engineering Manager. Owns 2 staffing agencies and 3 tools.","Keep my team staffed and tooled with no paperwork.","Finds out about renewals from invoices. Doesn't know notice periods or that rates are capped.","A Slack check-in with two questions; plain-English answers with the clause one tap away.","inbox"],
    ["kavya","Supplier owner","Workplace & Admin Manager, Pune. Owns housekeeping, security and cafeteria vendors.","Services delivered as promised; complaints acted on.","She flags poor service by email, but nobody turns it into credits. No usage dashboards exist for her suppliers.","Her rating becomes leverage; she sees the final decision before anything is sent.","inbox"],
    ["priya","Procurement","Category Manager for IT, staffing and facilities, about 400 suppliers.","Spend limited time on the renewals worth negotiating, and prove savings.","Stale tracker; owners answer at the last minute; tail renewals go unreviewed.","A ranked radar, a ready packet with leverage, a contract-correct draft, one-click approval.","radar"],
    ["meera","Finance","Lead, Accounts Payable. About 2,000 invoices a month.","Pay the right amount on time; no audit findings.","Invoices are checked against the PO, not the contract. Caps and credits are invisible.","Invoices and quotes that break a contract are flagged with the clause and amount.","finance"],
    ["rahul","Legal","Commercial Counsel. Team of four.","Fewer repeat questions; no wrong answers from AI.","\"Can we cancel X?\" every week; fear of a mis-sent termination notice.","Sees only low-confidence reads; Pulse uses the stricter date until he confirms.","verify"],
    [null,"Supplier (external)","Account manager at an agency or vendor.","Predictable renewal and fast payment.","Late cancellations; disputes months after the fact.","Earlier, clearer, clause-backed conversations; fewer surprise disputes.",null]];
  return `<section class="sec" id="people"><div class="single"><div class="eyebrow">4 · Personas</div><h2>Designed for the person who gives it 60 seconds</h2>
  <p class="tldr"><span>In short</span>We design for the accidental contract owner, who will give 60 seconds and no more, and for the Procurement, Legal and Finance teams who depend on that answer.</p>
  <p class="lead">The hero is the <b>accidental contract owner</b>: the manager who asked for a supplier and now owns the relationship but never reads the contract. Two variants (Arjun for tech and staffing, Kavya for physical services) keep the design domain-agnostic.</p>
  <div class="grid g3">${L.map(([id, grp, role, job, pain, win, r]) => { const p = id ? P.people[id] : { name:"Supplier account manager", init:"SA" };
    return `<div class="card persona"><div class="row"><span class="av lg ${["arjun","kavya"].includes(id) ? "p" : ""}">${p.init}</span><div><b style="font-weight:600">${h(p.name)}</b><div class="small muted">${grp}</div></div></div>
      <dl><dt>Context</dt><dd>${h(role)}</dd><dt>Job to be done</dt><dd>${h(job)}</dd><dt>Pain today</dt><dd>${h(pain)}</dd><dt>What Pulse gives them</dt><dd>${h(win)}</dd><dt>Grounded in</dt><dd>${(GROUND[id || "sup"] || []).map(g => `<span class="chip line" style="margin:2px 4px 2px 0;white-space:normal">${h(g)}</span>`).join("")}</dd></dl>
      ${r ? `<button class="btn sec sm" style="align-self:flex-start;margin-top:auto" ${go(r, id)}>See ${h(p.name.split(" ")[0])}'s view →</button>` : ""}</div>`; }).join("")}</div>
  ${trace()}
  <div class="callout" style="margin-top:16px"><b>Economic buyer:</b> the CFO, who signs off on the tool and wants leakage recovered in money terms. <b>Approver:</b> Vikram Shah, Head of Procurement, for renewals above ₹50 L a year.</div></div></section>`;
}

const GAINS = [
  ["Business owner","No paperwork; their view shapes the decision","60 seconds of time; accountability becomes visible","Replies within 2 working days"],
  ["Procurement","Ranked work queue, leverage, proof of savings","Must act on alerts and trust AI-read terms","Decided-on-time rate; value protected"],
  ["Legal","Sees only uncertain items; fewer repeat questions","Fast turnaround on confirmations","Zero mis-sent notices; confirmation time"],
  ["Finance / AP","Clause-backed holds and disputes; reliable forecast","Some supplier friction when payments are held","Overpayment recovered; forecast accuracy"],
  ["CFO","Leakage recovered in money terms","Tool cost and rollout effort","Payback within two quarters (target)"],
  ["IT & security","Governed AI with an audit trail","Another system reading every contract","No access incidents; data stays in region"],
  ["Supplier","Clear terms, faster agreements, fewer surprises","Revenue from silent auto-renewals","Time to agree; disputes after notices"],
  ["Audit & compliance","A complete, current contract register","None significant","Audit findings closed"]];
function stake(){
  const dots = [["CFO",64,10],["Head of Procurement",78,18],["Procurement (Priya)",93,27],["Business owner",88,40,1],["Legal (Rahul)",62,32],["IT & security",10,20],["Finance / AP (Meera)",90,62],["Supplier",70,76],["Audit & compliance",10,60],["Employees using it",10,82]];
  const conf = [["Business owner ↔ Procurement","Owner wants an easy renewal of a vendor they like; Procurement wants leverage.","Owner gets a 60-second say; Procurement gets the evidence. Neither chases the other."],["Procurement ↔ Supplier","Supplier's revenue depends on silent auto-renewal; Procurement wants a real decision.","Earlier, clause-backed conversations. Fair to both: the contract is the referee."],["Legal ↔ Speed","Legal wants certainty; the business wants fast answers.","Only low-confidence reads reach Legal; stricter dates protect the business meanwhile."],["Finance ↔ Procurement","Holding a disputed invoice can strain supplier terms.","Holds only the disputed amount, with the clause attached (pay the undisputed part)."],["IT & security ↔ Everyone","An AI that reads every contract raises data and access questions.","Role-based access; extraction runs in the platform; no cross-customer data sharing."],["Owner ↔ Employees","Cutting a tool or service affects people who use it.","Usage data plus the owner's check-in before any reduction."]];
  const raci = [["Read and extract the contract","Pulse","Legal confirms low-confidence","None","None"],["Calculate deadlines","Pulse (code)","None","Procurement","None"],["Say if still needed, rate service","Owner","None","Procurement","None"],["Recommend and draft","Pulse","Procurement","Owner, Legal","None"],["Decide and approve","Procurement","Head of Procurement (>₹50 L)","Owner","Finance"],["Send to supplier","Procurement","None","Legal (exits)","Supplier"],["Pay, hold or claim credits","Finance","None","Procurement","Supplier"]];
  return `<section class="sec" id="stake"><div class="single"><div class="eyebrow">5 · Stakeholder map</div><h2>Who has a stake in a renewal, and where they pull apart</h2>
  <p class="tldr"><span>In short</span>Pulse is built around six real conflicts between these stakeholders, and settles each one by giving every side the evidence it needs instead of another chore.</p>
  <p class="lead">Ten stakeholders, four of whom hold real power over the outcome. Pulse is designed around the conflicts, not around a happy path.</p>
  <div class="grid g2" style="align-items:start"><div><div class="matrix" role="img" aria-label="Stakeholders by power and interest">
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr)"><div style="border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:10px" class="small muted">Keep satisfied</div><div style="border-bottom:1px solid var(--line);padding:10px;background:var(--purple-tint);text-align:right" class="small"><b>Manage closely</b></div><div style="border-right:1px solid var(--line);padding:10px;display:flex;align-items:flex-end" class="small muted">Monitor</div><div style="padding:10px;display:flex;align-items:flex-end;justify-content:flex-end" class="small muted">Keep informed</div></div>
    ${dots.map(([t, x, y, hi]) => { const left = x < 50; const dot = `<span class="dot" style="width:${hi ? 14 : 10}px;height:${hi ? 14 : 10}px;background:${hi ? "var(--purple)" : "var(--teal)"};flex:none"></span>`;
      const lab = `<span class="small" style="line-height:1.2;white-space:nowrap;${hi ? "font-weight:600" : ""}">${t}</span>`;
      return `<div style="position:absolute;left:${x}%;top:${y + 6}%;transform:translate(${left ? "-5px" : "calc(-100% + 5px)"},-50%);display:flex;align-items:center;gap:6px">${left ? dot + lab : lab + dot}</div>`; }).join("")}
  </div><div class="row between small muted" style="margin-top:6px"><span>← lower interest in renewal outcomes</span><span>higher →</span></div><p class="small muted">Vertical axis: power over the decision (top = more). Placement is our assessment.</p></div>
  <div class="card scroll"><table><thead><tr><th>Conflict</th><th>How Pulse handles it</th></tr></thead><tbody>${conf.map(([a, b, c]) => `<tr><td><b style="font-weight:600">${a}</b><div class="small muted">${b}</div></td><td class="small">${c}</td></tr>`).join("")}</tbody></table></div></div>
  <details class="more"><summary><b>What each stakeholder gains, gives up, and how they'd judge success</b><span> · 8 stakeholders</span></summary>
  <div class="card scroll"><table class="stack"><thead><tr><th>Stakeholder</th><th>Gains</th><th>Gives up or worries about</th><th>Their measure of success</th></tr></thead><tbody>${GAINS.map(r => `<tr><td><b style="font-weight:600">${r[0]}</b></td><td class="small">${r[1]}</td><td class="small">${r[2]}</td><td class="small">${r[3]}</td></tr>`).join("")}</tbody></table></div>
  </details>
  <details class="more"><summary><b>Who does what at each moment</b><span> · responsibility map for every step of a renewal</span></summary>
  <div class="card scroll"><table class="stack"><thead><tr><th>Moment</th><th>Does it</th><th>Approves / checks</th><th>Consulted</th><th>Informed</th></tr></thead><tbody>${raci.map(r => `<tr>${r.map((c, i) => `<td class="${i ? "small" : ""}">${i === 1 && /Pulse/.test(c) ? `<span class="chip ai">${c}</span>` : h(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details></div></section>`;
}

function how(){
  const steps = [["Read","Drop a folder. Pulse groups each supplier's documents (master agreement, amendments, statements of work, letters) and extracts terms with a verbatim quote."],["Verify","High-confidence terms go straight in. The rest go to Legal; until then the stricter date applies."],["Watch","Code calculates each notice deadline and credit window, then ranks renewals by money at stake and days left."],["Ask the owner","60 days out, the owner gets a two-question check-in in Slack, Teams or email."],["Decide","Procurement gets a packet: what the contract says, what's happening, what the owner said, options with amounts, and a contract-correct draft."],["Close the loop","After approval, Finance's forecast updates and the next invoice is checked against the new terms."]];
  const ladder = [["0","Inform","Extract, cite and answer questions","Yes"],["1","Watch and nudge","Calculate deadlines; remind and escalate internally","Yes"],["2","Recommend and draft","Options with amounts; a draft email or notice","Yes"],["3","Act with approval","Send to the supplier; hold an invoice; claim credits","Yes, one human click each"],["4","Act within guardrails","e.g. auto-cancel unused tools under ₹5 L","Later, once accuracy is proven (98%+ on 500+ decisions)"]];
  const prin = [["One question at a time","Two questions, three buttons, no login for owners."],["Show me where it says this","Every fact opens the exact clause, highlighted."],["AI reads, code calculates","No deadline or amount is ever generated by the AI."],["Say what you're not sure about","Confidence is visible; doubtful terms go to Legal."],["Stricter until confirmed","An unconfirmed term uses the earlier deadline, so nothing is missed."],["Nothing leaves without a human","Every message to a supplier needs one approval click."]];
  return `<section class="sec" id="how"><div class="single"><div class="eyebrow">6 · How it works</div><h2>AI reads, code calculates, humans commit</h2>
  <p class="tldr"><span>In short</span>AI reads contracts and drafts letters, code works out every date and amount, and a person approves anything that touches money or a supplier.</p>
  <p class="lead">The brief asks whether the product should only inform or also act. Pulse acts where a mistake is cheap and reversible, and asks a person wherever money or a supplier relationship is at stake.</p>
  <div class="grid g3">${steps.map(([t, d], i) => `<div class="card pad"><div class="eyebrow">${i + 1}</div><h4>${t}</h4><p class="small ink2" style="margin-top:6px">${d}</p></div>`).join("")}</div>
  <div class="grid g2" style="margin-top:24px;align-items:start"><div><h3 style="margin-bottom:12px">How much the AI does on its own</h3><div class="ladder">${ladder.map(([l, t, d, v]) => `<div class="st"><span class="lv">${l}</span><span><b style="font-weight:600">${t}</b><br><span class="small muted">${d}</span></span><span class="chip ${v.startsWith("Yes") ? "green" : "line"}" style="white-space:normal;text-align:center">${v}</span></div>`).join("")}</div>
    <p class="small muted" style="margin-top:10px">Why this line: Gartner expects over 40% of agentic AI projects to be cancelled by 2027 over cost and weak risk controls, and only about 20% of leaders trust agents with financial transactions. Autonomy is earned with measured accuracy, not assumed.</p></div>
  <div><h3 style="margin-bottom:12px">Design principles</h3><div class="grid g2">${prin.map(([t, d]) => `<div class="card pad"><h4>${t}</h4><p class="small ink2" style="margin-top:4px">${d}</p></div>`).join("")}</div></div></div></div></section>`;
}


function road(){
  const ph = [["Now","v1 · Renewal decision desk","Repository from shared drives, renewal radar, owner check-ins, packets, Legal queue.","Decided on time ≥ 70% · owner replies ≥ 60% · term accuracy ≥ 98%"],
    ["+1 quarter","v2 · Invoice and credit checks","Connect the ERP: every invoice checked against rate cards, caps and service credits before payment.","≥ 1% of audited spend recovered · false flags < 10%"],
    ["+2 quarters","v3 · Event radar","Tariffs, supplier acquisitions, sanctions and insolvency news matched to the clauses that matter.","≥ 50% of alerts acted on within a week"],
    ["+3 quarters","v4 · Guarded autonomy","Pulse acts alone in narrow cases: e.g. cancelling unused tools under ₹5 L, claiming credits automatically.","98%+ accuracy over 500+ decisions · Legal sign-off per category"]];
  const roll = [["Week 0","8–10 interviews to test the riskiest assumptions: do owners know their deadlines, and will they answer a 60-second check-in?"],["Weeks 1–2","Onboard two categories, facilities and software (~300 suppliers), from their real folders."],["Weeks 3–8","Pilot against a business unit still on the tracker; track the north star weekly."],["Week 9","Scale, adjust or stop, using the kill criteria set in advance."]];
  const trust = [["Who sees what","Owners see only their own suppliers; suppliers see only what Vyom sends them; amounts and tactics stay with Procurement."],["Every AI action is logged","What it read, the quote, its confidence, and who approved anything that left the building."],["No training on customer contracts","Vyom's contracts are never used to train shared models."],["Data stays in region","Contracts are stored and processed in India for an India-based customer."],["Humans hold the keys","Nothing reaches a supplier or touches money without approval; Legal sets the autonomy level per category."],["One switch to stop","Autonomy can be turned down to inform-only instantly, per category or globally."]];
  return `<section class="sec" id="road"><div class="single"><div class="eyebrow">7 · Roadmap, rollout and trust</div><h2>Built to earn its way to more autonomy</h2>
  <p class="tldr"><span>In short</span>Four stages, each unlocked by a measurable gate, so the AI earns more autonomy instead of assuming it.</p>
  <p class="lead">Each stage ships only when the previous one hits its gate. That is how Pulse avoids becoming one of the agentic AI projects that get cancelled.</p>
  <div class="grid g4">${ph.map(([w, t, d, g], i) => `<div class="card pad" style="${i === 0 ? "border:2px solid var(--purple)" : ""}"><div class="eyebrow">${w}</div><h4>${t}</h4><p class="small ink2" style="margin:6px 0 10px">${d}</p><div class="callout" style="font-size:13px"><b>Gate to next:</b> ${g}</div></div>`).join("")}</div>
  <h3 style="margin:28px 0 12px">Trust and data</h3><div class="grid g3">${trust.map(([t, d]) => `<div class="card pad"><h4>${t}</h4><p class="small ink2" style="margin-top:4px">${d}</p></div>`).join("")}</div>
  <details class="more"><summary><b>Rollout at Vyom, week by week</b><span> · from validation interviews to the go/no-go review</span></summary><div class="card scroll"><table><tbody>${roll.map(([a, b]) => `<tr><td style="width:110px"><b style="font-weight:600">${a}</b></td><td class="small">${b}</td></tr>`).join("")}</tbody></table></div></details></div></section>`;
}

function land(){
  const cols = ["Renewal alerts","AI renewal brief","Owner input as a structured step","Built for non-software suppliers","Useful on day one from a shared drive"];
  const R = [["Sirion","✓","◐","?","✓","◐"],["Ironclad (Renewal Agent, May 2026)","✓","✓","◐ names likely owner","◐","◐"],["Icertis (Vera agents)","✓","✓","?","✓","◐ long rollouts reported"],["Docusign (Iris agents)","✓","◐ custom agents","?","◐","◐"],["Tropic, Vertice, Zylo","✓","✓","◐ via usage data","✗ mostly software","✓"],["Pulse (this concept)","✓","✓","✓","✓","✓"]];
  return `<section class="sec" id="land"><div class="single"><div class="eyebrow">8 · Landscape</div><h2>Renewal alerts aren't new. Who they're built for is.</h2>
  <p class="tldr"><span>In short</span>Every major contract platform now tracks renewals. What we couldn't find in public material is one built around the business owner's input, for any supplier type, working from a shared drive on day one.</p>
  <p class="lead">Every major contract platform now tracks renewals, and Ironclad launched a dedicated Renewal Agent in May 2026. The gap is in emphasis: today's tools serve Legal and Procurement, while the person who actually knows whether a supplier is worth keeping is a business manager.</p>
  <div class="card scroll"><table><thead><tr><th></th>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${R.map(r => `<tr style="${r[0].startsWith("Pulse") ? "background:var(--purple-tint)" : ""}">${r.map((c, i) => `<td class="${i ? "small" : ""}">${i ? c : `<b style="font-weight:600">${c}</b>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <p class="small muted" style="margin-top:8px">✓ clearly offered · ◐ partly / configurable · ✗ not a focus · ? not visible in public material. Based on public product pages and news up to Nov 2026; not verified in live products.</p>
  <div class="grid g3" style="margin-top:20px">
    <div class="card pad"><h4>Our angle</h4><p class="small ink2" style="margin-top:6px">The <b>owner's side</b> of the contract: a 60-second check-in that turns business knowledge into negotiating leverage, for <b>any kind of supplier</b>, from a messy shared drive on day one.</p></div>
    <div class="card pad"><h4>Where it fits in Sirion</h4><p class="small ink2" style="margin-top:6px">A workflow layer on top of Sirion's Extraction and obligation agents, adding two new agents: <b>Owner check-in</b> and <b>Renewal decision</b>. It could also be a fast-start edition for fast-growing companies without a CLM. It complements Sirion's command centre rather than competing with it.</p></div>
    <div class="card pad"><h4>What we deliberately left out</h4><p class="small ink2" style="margin-top:6px">Cross-customer price benchmarks. Sharing what other companies pay a supplier can raise competition-law (information-exchange) concerns, so any future benchmark would need to be aggregated, historical and legally reviewed.</p></div></div></div></section>`;
}

function metrics(){
  const M = [["Outcome","Value protected per quarter (avoided renewals, uplift held to caps, credits and overbilling recovered)","Business case in CFO terms","Track; target set after a baseline"],["Trust","Critical-term accuracy after verification","Without trust, nobody acts on alerts","≥ 98%"],["Trust","Share of terms auto-accepted vs sent to Legal","Legal workload","≥ 85% auto-accepted"],["Adoption","Owner check-in response rate and time to reply","Tests the core persona bet","≥ 70% within 2 working days"],["Efficiency","Procurement minutes per renewal; Legal \"what does it say\" questions a week","Capacity freed","−50%"],["Guardrail","Alert ignore rate; false-alarm rate; supplier disputes after notices","Fatigue and relationship damage","Ignore < 25%; no rise in disputes"]];
  return `<section class="sec" id="metrics"><div class="single"><div class="eyebrow">9 · Success metrics</div><h2>North star: decided on time</h2>
  <p class="tldr"><span>In short</span>The north star is the share of renewals where someone made a deliberate decision before the deadline: about 30% today, 90% as the six-month target, with kill criteria fixed in advance.</p>
  <div class="grid g2" style="align-items:start;margin-top:18px"><div class="card pad" style="border:2px solid var(--purple)"><div class="eyebrow">North-star metric</div><h3>Deliberate-decision rate</h3><p class="ink2" style="margin-top:8px">The share of renewal notice deadlines where someone recorded a decision (renew, renegotiate, reduce or exit) <b>before</b> the deadline passed.</p>
    <p class="small muted">Why this one: it captures behaviour (someone decided) and value (a silent rollover is where money leaks), and it is a leading indicator of savings. Baseline estimate ~30%, from Vertice's finding that 70% of tail renewals get no review. 6-month target: 90%.</p>
    <button class="btn sec sm" ${go("log","priya")}>See it in the product →</button></div>
  <div class="card pad"><h3>What would make us rethink</h3><p class="small muted" style="margin:4px 0 10px">Decided in advance, so we can't move the goalposts.</p>
    <div class="check"><i class="q">!</i><span><b>Owners ignore more than half the check-ins</b> after two nudges. The accidental-owner bet is wrong; pivot to a Procurement-only console.</span></div>
    <div class="check"><i class="q">!</i><span><b>Legal still spends more than 5 minutes per contract</b> verifying after the first 200. The read-and-verify economics don't work at 2,500 suppliers.</span></div>
    <div class="check"><i class="q">!</i><span><b>More than 80% of value comes from software alone.</b> Then we're a SaaS-management tool, a crowded space, and should reposition.</span></div>
    <div class="check"><i class="q">!</i><span><b>Decisions happen, but invoices still don't follow them.</b> The real moment is payment; lead with invoice checks instead.</span></div></div></div>
  <div class="card pad" style="margin-top:16px"><div class="row between"><h3>What the pilot should look like</h3><span class="chip amber">Projection, not data</span></div>
    <p class="small muted" style="margin:4px 0 8px">Deliberate-decision rate by pilot week, against the 90% six-month target</p>
    <div class="cols" style="height:200px;position:relative">${[30,38,47,55,62,68,73,78,82].map((v, i) => `<div class="c"><span class="small num">${v}%</span><div class="b ${i ? "p" : ""}" style="height:${v * 1.5}px"></div><span>${i ? "Wk " + i : "Today"}</span></div>`).join("")}
      <div style="position:absolute;left:0;right:0;bottom:${90 * 1.5 + 20}px;border-top:2px dashed var(--ink);"><span class="small" style="background:#fff;padding:0 6px;position:relative;top:-11px">Target 90%</span></div></div></div>
  <div class="card scroll" style="margin-top:16px"><table class="stack"><thead><tr><th>Layer</th><th>Metric</th><th>Why it matters</th><th>Target</th></tr></thead><tbody>${M.map(r => `<tr>${r.map((c, i) => `<td class="${i ? "small" : ""}">${i ? h(c) : `<span class="chip teal">${c}</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <div class="callout" style="margin-top:16px"><b>How we'd prove it:</b> an 8-week pilot with two categories (facilities and software), about 120 renewals, compared against a business unit still on the tracker. Week 0: 8–10 interviews to test the riskiest assumptions: do owners know their renewal dates (we bet no), and will they answer a 60-second check-in (we bet yes)?</div></div></section>`;
}

function assume(){
  const A = [["Company","Fictional Vyom Technologies: 3,000 people, 2,500 suppliers, about ₹1,000 Cr of third-party spend, India-headquartered. Amounts in rupees."],["Systems","Google Drive, Gmail, Slack, an ERP (NetSuite) for POs and invoices, single sign-on. No CLM today."],["Teams","Procurement 6, Legal 4, Accounts payable 7; about 400 managers own at least one supplier."],["Data","Service-level results available monthly from site audits or ticketing tools; software usage from single sign-on logs."],["Approval","Procurement approves up to ₹50 L a year; Head of Procurement above that."]];
  const SR = [["Six supplier contracts and their amendments, letters and quotes","Synthetic, written in standard commercial structure for this demo"],["Extracted terms for the six suppliers","Stored AI reading, every quote checked word-for-word against the text"],["39 other suppliers in the radar","Synthetic tracker records (background only)"],["Live extraction, Q&A, critique and draft polishing","Real AI calls when your session allows; otherwise clearly labelled stored results"],["Deadlines, credits, amounts, options","Calculated by code at run time, from the demo date of 22 Nov 2026"],["Sending, holds and disputes","Simulated; nothing is emailed or paid"]];
  return `<section class="sec" id="assume"><div class="single"><div class="eyebrow">10 · Assumptions and what's real here</div><h2>What we assumed, and what is simulated</h2>
  <p class="tldr"><span>In short</span>The company, contracts and research are simulated and labelled as such, built from published evidence. The product logic, live AI and calculations are real.</p>
  <div class="card scroll" style="margin-top:18px"><table><thead><tr><th>In this prototype</th><th>Real or simulated</th></tr></thead><tbody>${SR.map(([a, b]) => `<tr><td class="small">${a}</td><td class="small">${b}</td></tr>`).join("")}</tbody></table></div>
  <details class="more"><summary><b>Every assumption about Vyom</b><span> · company, systems, people, data, approvals</span></summary><div class="card scroll"><table><tbody>${A.map(([a, b]) => `<tr><td style="width:120px"><b style="font-weight:600">${a}</b></td><td class="small">${b}</td></tr>`).join("")}</tbody></table></div></details></div></section>`;
}

function sources(){
  const extra = [["Sirion: agentic CLM launch, Oct 2025","https://www.businesswire.com/news/home/20251009924272/en"],["Sirion: contract renewal management","https://www.sirion.ai/library/contract-negotiation/contract-renewals/"],["Ironclad: Renewal Agent (May 2026)","https://support.ironcladapp.com/hc/en-us/articles/40504286943895-What-s-New-in-Ironclad-Special-Edition-May-2026"],["Icertis: agentic AI in contract management","https://www.icertis.com/learn/agentic-ai-contract-management/"],["Docusign: Iris assistant and agents, May 2026","https://www.docusign.com/blog/new-ai-assistant-and-agents"],["Pramata: Tariff Risk Analyzer","https://businesswire.com/news/home/20250520769403/en/Pramata-Rolls-Out-Tariff-Risk-Analyzer-Giving-Businesses-Powerful-Contract-AI-Tool-to-Navigate-Supply-Chain-Disruptions"],["Supply Chain Dive: tariff clauses (Agiloft survey)","https://www.supplychaindive.com/news/tariff-clauses-in-business-contracts-proliferate-amid-trade-disruption-trump/760576/"],["FTC: information exchange among competitors","https://www.ftc.gov/node/74029?page=0"],["Beam, citing PwC: trust in AI agents","https://beam.ai/agentic-insights/40-percent-agentic-ai-projects-will-fail-heres-how-to-be-in-the-60"]];
  const all = P.evidence.map(e => [e.s, e.u]).concat(P.stories.map(s => [s.s, s.u])).concat(extra);
  return `<section class="sec" id="sources" style="border-bottom:0"><div class="single"><div class="eyebrow">11 · Sources</div><h2>Where the evidence comes from</h2>
  <ul style="margin-top:16px;columns:2 320px;column-gap:32px;font-size:14.5px">${all.map(([t, u]) => `<li style="break-inside:avoid;margin-bottom:6px"><a href="${u}" target="_blank" rel="noopener">${h(t)}</a></li>`).join("")}</ul>
  <div class="row" style="margin-top:24px"><button class="btn pri" ${go("radar","priya")}>Try the product →</button></div></div></section>`;
}

function render(){
  return hero() + briefPanel() + `<nav class="storynav" aria-label="Story sections"><div class="single">${SECTIONS.map(([id, t]) => `<button data-jump="${id}">${t}</button>`).join("")}</div></nav>` +
    why() + problem() + vyom() + people() + stake() + how() + road() + land() + metrics() + assume() + sources() +
    `<footer class="foot">Pulse is a concept prototype made for a Sirion product assessment. It is not a Sirion product and is not affiliated with or endorsed by Sirion. All companies, people and contracts in the demo are fictional.</footer>`;
}
function bind(){
  document.querySelectorAll("[data-jump]").forEach(b => b.onclick = () => document.getElementById(b.dataset.jump).scrollIntoView({ behavior:"smooth" }));
  document.querySelectorAll("[data-start]").forEach(b => b.onclick = () => window.PA.go(b.dataset.start, b.dataset.sp));
  document.querySelectorAll("[data-tourstart]").forEach(b => b.onclick = () => window.PT.start(0));
  document.querySelectorAll("[data-watch]").forEach(b => b.onclick = () => window.PT.watch());
  document.querySelectorAll("[data-video]").forEach(b => b.onclick = video);
}
window.PS = { render, bind };
})();
