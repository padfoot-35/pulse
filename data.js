/* Structured data for the Pulse prototype. Simulated company: Vyom Technologies (fictional).
   Every extracted term carries the document, clause and verbatim quote it came from.
   conf = extraction confidence (0–1). Below 0.85 goes to Legal's verification queue. */
window.PULSE = {
  today: "2026-11-22",
  company: { name: "Vyom Technologies", employees: 3000, suppliers: 2500, docs: 7000, spendCr: 1000 },

  people: {
    priya:  { name: "Priya Nair",    role: "Category Manager, Procurement", init: "PN" },
    arjun:  { name: "Arjun Mehta",   role: "Engineering Manager",           init: "AM" },
    kavya:  { name: "Kavya Rao",     role: "Workplace & Admin Manager, Pune", init: "KR" },
    meera:  { name: "Meera Iyer",    role: "Lead, Accounts Payable",         init: "MI" },
    rahul:  { name: "Rahul Sen",     role: "Commercial Counsel, Legal",      init: "RS" },
    ananya: { name: "Ananya Desai",  role: "Marketing Lead",                 init: "AD" },
    sneha:  { name: "Sneha Pillai",  role: "Operations & Admin Lead, Bengaluru", init: "SP" },
    rohit:  { name: "Rohit Kulkarni",role: "Former Analytics Lead (left Aug 2026)", init: "RK", left: true },
    vikram: { name: "Vikram Shah",   role: "Head of Procurement",            init: "VS" },
    supplier:{ name: "Supplier contacts", role: "External · sees only what Vyom sends", init: "SC", ext: true }
  },

  suppliers: [
  { id:"cleanspace", name:"CleanSpace Facility Services", category:"Facilities", sub:"Housekeeping · Pune & Bengaluru", owner:"kavya",
    annual: 18600000, docs:["CS-MSA","CS-AMD1"],
    term:{ start:"2024-03-01", initialEnd:"2027-02-28", renewMonths:12, auto:true },
    tracker:{ notice:30, note:"Excel tracker (last updated Feb 2025) still shows 30 days' notice" },
    terms:[
      {f:"end", v:"28 Feb 2027 (initial term)", doc:"CS-MSA", cl:"2.1", q:"continues for an initial term of thirty-six (36) months, ending on 28 February 2027", c:.98},
      {f:"renewal", v:"Auto-renews for 12 months", doc:"CS-MSA", cl:"2.2", q:"shall automatically renew for successive periods of twelve (12) months each", c:.97},
      {f:"notice", v:30, doc:"CS-MSA", cl:"14.2", q:"written notice of non-renewal not less than thirty (30) days before the end of the Initial Term", c:.95},
      {f:"notice", v:90, doc:"CS-AMD1", cl:"3.1", q:"the words \"thirty (30) days\" shall be replaced with \"ninety (90) days\"", c:.78},
      {f:"noticeHow", v:"Registered post or courier to registered office + email legal@cleanspace.in", doc:"CS-MSA", cl:"14.1", q:"delivered by registered post or courier to the registered office of the receiving Party, with a copy by email to legal@cleanspace.in", c:.93},
      {f:"cap", v:"6% a year (CPI-linked)", doc:"CS-MSA", cl:"3.2", q:"any annual increase shall not exceed six per cent (6%) of the fees for the preceding year", c:.96},
      {f:"cap", v:"5% a year (CPI-linked)", doc:"CS-AMD1", cl:"2.1", q:"any annual increase shall not exceed five per cent (5%) of the fees for the preceding year", c:.95},
      {f:"fee", v:"₹13.2 L / month (2 sites)", doc:"CS-MSA", cl:"3.1", q:"currently INR 13,20,000 per month for both sites", c:.95},
      {f:"fee", v:"₹15.5 L / month (3 sites)", doc:"CS-AMD1", cl:"1.1", q:"increased to INR 15,50,000 per month for all three sites", c:.94},
      {f:"sla", v:"Hygiene audit ≥ 90% per site; complaints answered in 2 h", doc:"CS-MSA", cl:"4.1–4.2", q:"monthly hygiene audit score of at least ninety per cent (90%) at each site", c:.95},
      {f:"credit", v:"3% of monthly fee per missed month (max 10%)", doc:"CS-MSA", cl:"4.3", q:"credit three per cent (3%) of that month's fee, subject to a maximum of ten per cent (10%) of the monthly fee", c:.94},
      {f:"tfc", v:"Yes, 90 days' notice", doc:"CS-MSA", cl:"5.1", q:"terminate this Agreement for convenience by giving the Service Provider not less than ninety (90) days' written notice", c:.97},
      {f:"pay", v:"30 days from invoice", doc:"CS-MSA", cl:"3.3", q:"payable within thirty (30) days of receipt of a valid invoice", c:.97}
    ],
    ops:{ slaLabel:"Hygiene audit score (target 90%)", slaTarget:90, sla:[["Jun",92],["Jul",91],["Aug",88],["Sep",93],["Oct",89]], monthlyFee:1550000, creditPct:3 },
    checkin:{ q1:"Is CleanSpace still needed at all three Pune and Bengaluru sites?", q2:"How has the service been over the last 6 months?" },
    story:"An amendment signed in June 2025 quietly changed the notice period from 30 to 90 days. The team's tracker still says 30."
  },

  { id:"sentinel", name:"Sentinel Guarding Services", category:"Facilities", sub:"Security · Pune", owner:"kavya",
    annual: 11160000, docs:["SG-MSA"],
    term:{ start:"2025-04-01", initialEnd:"2027-03-31", renewMonths:12, auto:true },
    terms:[
      {f:"end", v:"31 Mar 2027", doc:"SG-MSA", cl:"2.1", q:"from 1 April 2025 to 31 March 2027", c:.97},
      {f:"renewal", v:"Auto-renews for 12 months", doc:"SG-MSA", cl:"2.2", q:"shall renew automatically for further periods of twelve (12) months", c:.96},
      {f:"notice", v:60, doc:"SG-MSA", cl:"2.2", q:"at least sixty (60) days prior to the expiry of the then-current term", c:.96},
      {f:"noticeHow", v:"Email contracts@sentinelguarding.in + courier", doc:"SG-MSA", cl:"6.1", q:"sent by email to contracts@sentinelguarding.in and by courier", c:.95},
      {f:"cap", v:"Only statutory minimum-wage changes, with notification", doc:"SG-MSA", cl:"3.2", q:"limited to changes in statutory minimum wages notified by the State Government", c:.88},
      {f:"fee", v:"₹9.3 L / month", doc:"SG-MSA", cl:"3.1", q:"a monthly charge of INR 9,30,000", c:.97},
      {f:"sla", v:"Guard post coverage ≥ 98% a month", doc:"SG-MSA", cl:"4.1", q:"guard post coverage of not less than ninety-eight per cent (98%) of scheduled post-hours", c:.97},
      {f:"credit", v:"5% of monthly charge per missed month (max 15%)", doc:"SG-MSA", cl:"4.2", q:"service credit equal to five per cent (5%) of that month's charges, subject to an aggregate cap of fifteen per cent (15%)", c:.95},
      {f:"claim", v:"Claim within 60 days of month end, or credit is lost", doc:"SG-MSA", cl:"4.3", q:"within sixty (60) days after the end of the month to which it relates, failing which the service credit shall be deemed waived", c:.93},
      {f:"tfc", v:"Yes, 60 days' notice", doc:"SG-MSA", cl:"5.1", q:"terminate this Agreement without cause on sixty (60) days' written notice", c:.96}
    ],
    ops:{ slaLabel:"Guard post coverage (target 98%)", slaTarget:98, sla:[["Jul",98.6],["Aug",96.1],["Sep",95.4],["Oct",94.8]], monthlyFee:930000, creditPct:5, claimDays:60 },
    checkin:{ q1:"Do you still need Sentinel at both Pune offices?", q2:"How has guard coverage felt on the ground?" },
    story:"Coverage has missed the 98% target three months running. Kavya complained by email, but nobody claimed the credits, and the contract makes them expire 60 days after month end."
  },

  { id:"talentbridge", name:"TalentBridge Staffing Solutions", category:"Staffing", sub:"Contract engineers · Bengaluru", owner:"arjun",
    annual: 29000000, docs:["TB-MSA","TB-RATE","TB-LTR"],
    term:{ start:"2024-02-01", initialEnd:"2026-01-31", renewMonths:12, auto:true },
    terms:[
      {f:"end", v:"Initial term ended 31 Jan 2026; now in a 1-year renewal", doc:"TB-MSA", cl:"2.1", q:"remain in force for an initial period of two (2) years", c:.9},
      {f:"renewal", v:"Auto-extends for 1 year at a time", doc:"TB-MSA", cl:"2.2", q:"automatically extended for consecutive one (1) year periods", c:.95},
      {f:"notice", v:60, doc:"TB-MSA", cl:"2.2", q:"no later than sixty (60) days before the end of the then-current period", c:.96},
      {f:"noticeHow", v:"Email accounts@talentbridge.co.in + courier to registered office", doc:"TB-MSA", cl:"6.1", q:"sent by email to accounts@talentbridge.co.in with a copy to the Supplier's registered office by courier", c:.94},
      {f:"cap", v:"Rate rise ≤ 5%, with 45 days' written notice", doc:"TB-MSA", cl:"3.2", q:"written notice is given at least forty-five (45) days before the renewal date and the revision does not exceed five per cent (5%) of the rates then in force", c:.95},
      {f:"rates", v:"L1 ₹1,450 · L2 ₹1,900 · L3 ₹2,600 · L4 ₹3,300 per hour; billed level must match work order", doc:"TB-RATE", cl:"Note (b)", q:"The role level billed must match the role level stated in the Work Order", c:.92},
      {f:"dispute", v:"Dispute invoices within 30 days; pay undisputed part", doc:"TB-MSA", cl:"3.4", q:"dispute any invoice amount in good faith by written notice within thirty (30) days of receipt", c:.94},
      {f:"tfc", v:"Yes, 30 days' notice", doc:"TB-MSA", cl:"5.1", q:"terminate this Agreement or any Work Order for convenience on thirty (30) days' written notice", c:.96},
      {f:"pay", v:"45 days for undisputed invoices", doc:"TB-MSA", cl:"3.3", q:"pay undisputed invoices within forty-five (45) days", c:.96},
      {f:"proposal", v:"Supplier proposes +9% from 1 Feb 2027", doc:"TB-LTR", cl:"Letter", q:"revised upward by nine per cent (9%) with effect from 1 February 2027", c:.97}
    ],
    ops:{ invoice:{ id:"INV-TB-2610", month:"October 2026", total:7184000, lines:22, issue:"4 associates on L2 (Engineer) work orders billed at L3 (Senior) rate", hours:168, billed:2600, contracted:1900, count:4, received:"2026-11-05" } },
    checkin:{ q1:"How many TalentBridge associates will you need from February?", q2:"How has their quality been?" },
    story:"TalentBridge wants +9% from February, but the contract caps rises at 5%. October's invoice also bills four L2 engineers at the senior rate."
  },

  { id:"lumen", name:"Lumen Analytics", category:"Software", sub:"BI platform · 40 licences", owner:"rohit",
    annual: 3840000, docs:["LU-OF","LU-QUOTE"],
    term:{ start:"2025-01-15", initialEnd:"2027-01-14", renewMonths:12, auto:true },
    terms:[
      {f:"end", v:"14 Jan 2027", doc:"LU-OF", cl:"1.1", q:"ends on 14 January 2027", c:.97},
      {f:"renewal", v:"Auto-renews for 12 months", doc:"LU-OF", cl:"1.2", q:"automatically renew for additional periods of twelve (12) months at Lumen's then-current list price", c:.9},
      {f:"notice", v:45, doc:"LU-OF", cl:"1.2", q:"at least forty-five (45) days before the end of the current term", c:.95},
      {f:"noticeHow", v:"Email renewals@lumenanalytics.com from an authorised Vyom address", doc:"LU-OF", cl:"5.1", q:"must be sent to renewals@lumenanalytics.com from an authorised Customer email address", c:.95},
      {f:"cap", v:"Per-user fee rise ≤ 7% on renewal", doc:"LU-OF", cl:"2.1", q:"shall not increase by more than seven per cent (7%) over the fee for the immediately preceding term", c:.83},
      {f:"reduce", v:"Can cut licences at renewal, same notice window", doc:"LU-OF", cl:"2.2", q:"Customer may reduce the number of licences at renewal", c:.92},
      {f:"fee", v:"₹96,000 per user per year (₹38.4 L)", doc:"LU-OF", cl:"Fees", q:"INR 96,000 per user per year (INR 38,40,000 per year)", c:.97},
      {f:"sla", v:"99.5% monthly availability", doc:"LU-OF", cl:"4.1", q:"available 99.5% of the time in each calendar month", c:.93},
      {f:"pay", v:"30 days from invoice", doc:"LU-OF", cl:"3.1", q:"payable within thirty (30) days of the invoice date", c:.96},
      {f:"proposal", v:"Renewal quote at +10%: ₹42.2 L", doc:"LU-QUOTE", cl:"Quote", q:"This reflects our 2027 list price (an increase of 10%).", c:.96}
    ],
    ops:{ seats:40, active:12, usageNote:"12 of 40 licences used in the last 90 days (from single sign-on logs)" },
    checkin:{ q1:"Does your team still use Lumen? How many people need it?", q2:"Is there a tool you'd rather use instead?" },
    story:"The person who bought Lumen left in August. Renewal quotes go to his dead inbox. Only 12 of 40 licences are used, and the quote breaks the 7% cap."
  },

  { id:"northstar", name:"Northstar Logistics", category:"Logistics", sub:"Courier & freight · Bengaluru", owner:"sneha",
    annual: 7440000, docs:["NS-RC","NS-LTR"],
    term:{ start:"2026-01-01", initialEnd:"2026-12-31", renewMonths:12, auto:true },
    terms:[
      {f:"end", v:"31 Dec 2026", doc:"NS-RC", cl:"2.1", q:"valid from 1 January 2026 to 31 December 2026", c:.97},
      {f:"renewal", v:"Auto-renews for 12 months on same terms", doc:"NS-RC", cl:"2.2", q:"shall stand renewed for a further period of twelve (12) months on the same terms", c:.95},
      {f:"notice", v:30, doc:"NS-RC", cl:"2.2", q:"thirty (30) days' prior written notice of non-renewal", c:.95},
      {f:"noticeHow", v:"Email commercial@northstarlogistics.in", doc:"NS-RC", cl:"6.1", q:"sent by email to commercial@northstarlogistics.in", c:.95},
      {f:"cap", v:"Rates firm for the term", doc:"NS-RC", cl:"3.1", q:"The rates in Annexure 1 are firm for the term of this contract.", c:.96},
      {f:"adjust", v:"Only for duty/tariff/levy changes or >10% diesel move; 30 days' notice + evidence; max 3% a year", doc:"NS-RC", cl:"3.2–3.3", q:"requires at least thirty (30) days' prior written notice to Vyom, accompanied by documentary evidence of the change, and shall not exceed three per cent (3%)", c:.94},
      {f:"pay", v:"30 days", doc:"NS-RC", cl:"4.1", q:"Invoices are payable within thirty (30) days.", c:.97},
      {f:"proposal", v:"Supplier announces 6% surcharge from 1 Dec 2026", doc:"NS-LTR", cl:"Letter", q:"a surcharge of six per cent (6%) will be applied to all shipments with effect from 1 December 2026", c:.97}
    ],
    ops:{ monthlySpend:620000 },
    checkin:{ q1:"Is Northstar still the right partner for courier and freight?", q2:"Any service problems this year?" },
    story:"Northstar announced a 6% 'tariff and fuel' surcharge with 17 days' notice and no evidence. The contract allows at most 3%, with 30 days' notice and documents."
  },

  { id:"brightwave", name:"Brightwave Creative", category:"Marketing", sub:"Creative agency retainer · Mumbai", owner:"ananya",
    annual: 5400000, docs:["BW-RET","BW-SOW"],
    term:{ start:"2025-06-01", initialEnd:"2026-05-31", renewMonths:1, auto:true, evergreen:true },
    terms:[
      {f:"end", v:"Month-to-month since 1 Jun 2026", doc:"BW-RET", cl:"2.1–2.2", q:"continues on a month-to-month basis until terminated by either party on thirty (30) days' written notice", c:.96},
      {f:"renewal", v:"Rolls monthly (evergreen)", doc:"BW-RET", cl:"2.2", q:"continues on a month-to-month basis", c:.96},
      {f:"notice", v:30, doc:"BW-RET", cl:"2.2", q:"terminated by either party on thirty (30) days' written notice", c:.95},
      {f:"noticeHow", v:"Email accounts@brightwave.co", doc:"BW-RET", cl:"5.1", q:"sent by email to accounts@brightwave.co", c:.95},
      {f:"fee", v:"₹4.5 L / month for up to 120 hours", doc:"BW-RET", cl:"3.1", q:"a monthly retainer of INR 4,50,000", c:.98},
      {f:"tfc", v:"Yes, 30 days' notice", doc:"BW-RET", cl:"2.2", q:"terminated by either party on thirty (30) days' written notice", c:.95},
      {f:"sowEnd", v:"Only active SOW ended 31 Mar 2026", doc:"BW-SOW", cl:"2", q:"Period: 1 October 2025 to 31 March 2026.", c:.96},
      {f:"pay", v:"30 days", doc:"BW-RET", cl:"4.1", q:"payable within thirty (30) days", c:.96}
    ],
    ops:{ hours:[["Aug",34],["Sep",21],["Oct",18]], included:120 },
    checkin:{ q1:"Do you have upcoming work planned with Brightwave?", q2:"How happy are you with their creative quality?" },
    story:"The only campaign ended in March, but the ₹4.5 L monthly retainer rolls on. Only 18 of 120 included hours were used in October."
  }
  ],

  /* the persona strip shown inside the product: who you are playing and why */
  personaInfo: {
    priya:  { goal:"Spend her limited time on the renewals worth negotiating, and prove the savings.", pain:"The tracker is stale and owners reply at the last minute; small renewals roll over unreviewed.", src:"Vertice: 70% of tail renewals get no review" },
    kavya:  { goal:"Services delivered as promised; complaints acted on.", pain:"She flags poor service by email but nobody turns it into credits; she has never read the contract.", src:"WorldCC: value leaks after signature" },
    arjun:  { goal:"Keep his team staffed and tooled with zero paperwork.", pain:"Finds out about renewals from invoices; doesn't know notice periods or rate caps.", src:"Tropic: renewal ownership vacuum" },
    ananya: { goal:"Keep the agency relationship ready for the next launch.", pain:"The retainer keeps billing whether or not there is work.", src:"Armanino: value leakage patterns" },
    sneha:  { goal:"Shipments move on time at the agreed price.", pain:"Suppliers announce surcharges and she can't tell whether they're allowed.", src:"KPMG: 51% renegotiating over tariffs" },
    rahul:  { goal:"Fewer repeat questions; no wrong answers from AI.", pain:"\"Can we cancel X?\" every week; fears a mis-sent termination notice.", src:"Gartner: AI risk controls" },
    meera:  { goal:"Pay the right amount, on time, with no audit findings.", pain:"Invoices are matched to the PO, not the contract; caps and credits are invisible.", src:"Redress: 1 in 12 invoices has a material error" },
    supplier:{ goal:"Predictable renewals and fast payment.", pain:"Late cancellations and disputes raised months after the fact.", src:"Stakeholder map" }
  },
  supplierContacts: { cleanspace:"Rakesh Jain · Managing Director", sentinel:"Contracts desk · Sentinel", talentbridge:"Neha Kapoor · Account Director", lumen:"Renewals desk · Lumen", northstar:"Commercial team · Northstar", brightwave:"Ishaan Rao · Client Lead" },

  fieldLabels: {
    end:"Term end", renewal:"Renewal", notice:"Notice to stop renewal", noticeHow:"How notice must be sent",
    cap:"Price-increase limit", fee:"Current fee", sla:"Service level", credit:"Service credits", claim:"Credit claim window",
    tfc:"Exit anytime (termination for convenience)", pay:"Payment terms", rates:"Rate card", dispute:"Invoice disputes",
    reduce:"Reduce licences", adjust:"Price adjustment / pass-through", proposal:"Latest supplier proposal", sowEnd:"Work scope"
  },

  /* Evidence board: real, public sources behind the simulated scenarios */
  evidence: [
    { k:"9%", ty:"Research body", t:"Average value lost every year to poor contract management (best performers ~3%, worst 15%+).", s:"World Commerce & Contracting, 2025", u:"https://info.worldcc.com/contract-management-aug-2025" },
    { k:"11%", ty:"Research body", t:"Procurement contracts lose value after signature, partly because Procurement and Legal step away when they are most needed.", s:"WorldCC, Closing the Procurement Value Gap", u:"https://info.worldcc.com/closing-the-procurement-value-gap" },
    { k:"71%", ty:"Vendor + research body", t:"of North American organisations keep contract data in shared drives; only 27% hold all signed contracts in a CLM.", s:"Sirion & WorldCC, Trusted Contract Data, May 2026", u:"https://procurementmag.com/news/deloitte-sirion-join-forces-to-advance-ai-native-clm" },
    { k:"70%", ty:"Vendor data", t:"of tail-spend software renewals go through with no review, versus 14.6% of large contracts.", s:"Vertice, Q3 2026", u:"https://www.vertice.one/insights/auto-renewal-clauses" },
    { k:"1 in 12", ty:"Advisory firm", t:"supplier invoices carries a material error; cap breaches and rate drift are among the biggest causes.", s:"Redress Compliance, 2026", u:"https://redresscompliance.com/software-invoice-reconciliation-guide" },
    { k:"51%", ty:"Consultancy survey", t:"of executives were renegotiating supplier contracts in response to tariffs (77% in consumer goods).", s:"KPMG, 2025", u:"https://kpmg.com/us/en/articles/2025/supply-chains-under-pressure.html" },
    { k:"40%+", ty:"Analyst forecast", t:"of agentic AI projects are expected to be cancelled by end-2027 over cost, unclear value and weak risk controls.", s:"Gartner via RCR Wireless", u:"https://www.rcrwireless.com/?p=424668" }
  ],
  stories: [
    { q:"The contract didn't leave with him, it just kept renewing every 12 months… The notice window had closed 19 days earlier.", s:"Practitioner account, LinkedIn", u:"https://lu.linkedin.com/in/scott-wilson-11114512", scen:"lumen" },
    { q:"Procurement trusts that department heads will manage it. The business assumes procurement has it covered.", s:"Tropic, on renewal ownership", u:"https://tropicapp.io/blog/software-renewal-management", scen:"cleanspace" },
    { q:"The cap lives on page 41 of a PDF while the invoice lives in AP, and nobody checks.", s:"Redress Compliance (paraphrased)", u:"https://redresscompliance.com/software-invoice-reconciliation-guide", scen:"talentbridge" },
    { q:"Value leaks through unclaimed credits, pricing errors, overlooked rebates and unenforced performance penalties.", s:"Armanino (paraphrased)", u:"https://www.armanino.com/articles/vendor-contract-leakage-risk-factors/", scen:"sentinel" }
  ]
};

/* ── Portfolio: lighter records for the rest of the supplier base (synthetic, seeded so it is stable) ── */
(function(){
  const P = window.PULSE;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const cats = [
    ["Software", ["Notion Workspace","Figma Org","Postman Team","Datadog","Sentry","Miro Business","Zoom Workplace","DocuSign","LucidChart","1Password Teams","Freshdesk","Canva Teams","Grammarly Business","Jira Cloud"], ["arjun","ananya","sneha","priya"], [6,40]],
    ["Staffing", ["Quantum Talent","CoreSkill Staffing","Nimbus Contract Labs","PeopleFirst HR Services"], ["arjun"], [60,260]],
    ["Facilities", ["GreenLeaf Pantry Services","AquaPure Water Systems","Spark Electricals AMC","CoolAir HVAC AMC","PestGuard India","LiftCare Elevators"], ["kavya","sneha"], [8,90]],
    ["Consulting", ["Meridian Advisory","Ledgerline Tax Partners","Northwind HR Consulting","Atlas Cyber Assurance"], ["vikram","meera","priya"], [20,140]],
    ["Marketing", ["PixelMint Studio","Echo PR Partners","Fieldwork Events"], ["ananya"], [15,80]],
    ["Logistics & travel", ["SwiftCab Corporate","Skyline Travel Desk","BlueDart Express Account"], ["sneha","kavya"], [10,70]],
    ["IT & telecom", ["Airtel Business Leased Line","Jio SD-WAN","Dell Hardware Care","Lenovo Premier Support","Cisco SmartNet"], ["arjun","sneha"], [12,120]]
  ];
  const today = new Date(P.today + "T00:00:00Z");
  const list = [];
  cats.forEach(([cat, names, owners, [lo, hi]]) => names.forEach(n => {
    const notice = pick([30, 30, 45, 60, 60, 90]);
    let days = Math.floor(notice + 6 + rnd() * 320);
    if(n === "Zoom Workplace" || n === "PestGuard India") days = notice - 12;   /* two recent misses: the status quo */
    const end = new Date(today.getTime() + days * 864e5).toISOString().slice(0, 10);
    const conf = rnd() < 0.12 ? 0.7 + rnd() * 0.12 : 0.88 + rnd() * 0.11;
    list.push({ id: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: n, category: cat, owner: pick(owners),
      annual: Math.round((lo + rnd() * (hi - lo)) * 100000), end, notice, auto: rnd() < 0.78, conf: +conf.toFixed(2), light: true,
      scanned: conf < 0.82 });
  }));
  P.portfolio = list;
})();
