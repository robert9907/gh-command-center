import { useState, useCallback, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────

const ZONES = [
  {id:"z1",color:"#3B82F6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.5)",label:"Zone 1",desc:"Top of Page",pct:0.10},
  {id:"z2",color:"#16A34A",bg:"rgba(22,163,74,0.12)",border:"rgba(22,163,74,0.5)",label:"Zone 2",desc:"Upper Section",pct:0.22},
  {id:"z3",color:"#7C3AED",bg:"rgba(124,58,237,0.12)",border:"rgba(124,58,237,0.5)",label:"Zone 3",desc:"Mid-Upper",pct:0.34},
  {id:"z4",color:"#D97706",bg:"rgba(217,119,6,0.12)",border:"rgba(217,119,6,0.5)",label:"Zone 4",desc:"Middle",pct:0.46},
  {id:"z5",color:"#DC2626",bg:"rgba(220,38,38,0.12)",border:"rgba(220,38,38,0.5)",label:"Zone 5",desc:"Mid-Lower",pct:0.57},
  {id:"z6",color:"#0D9488",bg:"rgba(13,148,136,0.12)",border:"rgba(13,148,136,0.5)",label:"Zone 6",desc:"Lower Section",pct:0.68},
  {id:"z7",color:"#DB2777",bg:"rgba(219,39,119,0.12)",border:"rgba(219,39,119,0.5)",label:"Zone 7",desc:"Near Bottom",pct:0.78},
  {id:"z8",color:"#EA580C",bg:"rgba(234,88,12,0.12)",border:"rgba(234,88,12,0.5)",label:"Zone 8",desc:"Bottom of Page",pct:0.88},
];

const MC = [
  {id:"mc-seed",tag:"SEED",tagline:"Plant the idea — plan weakness",q:"Every plan on the market was built with a weakness.",a:"Medicare salespeople won't tell you which one you're in. I will. Every plan — Medicare Advantage, Medigap, Part D — was designed with trade-offs. A $0 premium plan isn't free. A plan with a big name on the card isn't necessarily the best plan in your county. The weakness isn't in the brochure. It shows up when you need the plan to actually work."},
  {id:"mc-water",tag:"WATER",tagline:"Raise the stakes — real costs",q:"Here's what Medicare Advantage actually costs when something goes wrong.",a:"Your PCP visit is $0. Your blood work is $0. Then you have a cardiac event. A cancer diagnosis. A surgery that requires a specialist who isn't in your network. Now you're looking at an $8,300 out-of-pocket maximum, prior authorization delays, and a facility bill you didn't expect. The $0 premium plan isn't free — you'll find that out the hard way, or you won't."},
  {id:"mc-harvest",tag:"HARVEST",tagline:"Close — 20-minute plan analysis",q:"Every plan I've ever reviewed has a weakness.",a:"Most people don't know theirs until they need it most. Here's what I do: I pull every plan available in your county, run your doctors and prescriptions through each one, and show you the total annual cost side by side — not just the monthly premium. One free call, 20 minutes. You leave knowing exactly which plan fits your life and exactly why. No pressure. No obligation. Just the full picture, finally."},
];

const AC = [
  {id:"ac-seed",tag:"SEED",tagline:"Plant the idea — plan weakness",q:"If you're buying insurance on your own, the plan you picked probably wasn't built for you.",a:"It was built for the healthiest version of you. The marketplace makes it easy to pick a premium and move on. What it doesn't show you is the deductible you'll face before coverage kicks in, whether your doctors are actually in-network, or what your prescriptions will cost under that formulary. The plan that looks affordable in January can cost you thousands by June."},
  {id:"ac-water",tag:"WATER",tagline:"Raise the stakes — real costs",q:"When you call the number on the letterhead, you're not talking to someone who knows your doctors.",a:"You're talking to a call center. They don't know your preferred hospital, your specialist, or whether your medications are covered. They know the plan options on their screen. A local independent broker knows the networks, knows the carriers, and has no incentive to steer you toward the more expensive plan. That's a different conversation entirely."},
  {id:"ac-harvest",tag:"HARVEST",tagline:"Close — free plan review",q:"I can show you in 15 minutes whether your current plan is costing you more than it should.",a:"We look at your actual subsidy based on your real income, run your doctors and prescriptions through every plan available to you, and compare total annual cost — not just the monthly premium. Most people find they're either overpaying or underprotected. Either way, 15 minutes gives you the full picture. No obligation. No follow-up calls from strangers. Just clarity."},
];

const NQ = [
  {id:"nq-situation",tag:"SITUATION",tagline:"Where are they right now?",q:"Are you actually sure you understand what you're signing up for?",a:"Most people turning 65 get buried in Medicare mail, carrier calls, and TV ads — all saying the same thing. Nobody's sitting down with you and walking through what your plan actually covers, what it doesn't, and what it costs when something goes wrong. That's the conversation that's missing."},
  {id:"nq-problem",tag:"PROBLEM AWARENESS",tagline:"Do they know there's a problem?",q:"Do you know what your plan's weakness is?",a:"Every plan on the market was built with one. The $0 premium, the low monthly cost — those numbers look great until something goes wrong. Most people never find the weakness in their plan. They find it when they need the plan to work."},
  {id:"nq-consequence",tag:"CONSEQUENCE",tagline:"What happens if nothing changes?",q:"What happens if you're on the wrong plan when something serious comes up?",a:"Nothing — until it does. A diagnosis. A surgery. A specialist that isn't covered. That's when the affordable plan starts costing you thousands. And by the time you find out, the enrollment window is usually closed. That's not a hypothetical — that's what happens to people every year in North Carolina."},
  {id:"nq-solution",tag:"SOLUTION AWARENESS",tagline:"Do they see the better path?",q:"What if you could see exactly what your plan costs before you ever needed it?",a:"Not just the premium. The total — doctors verified, drugs priced, out-of-pocket maximum calculated. That's how this decision should be made. Most people never get shown their plan this way. When you do, the right choice becomes obvious. That's exactly what I do in a free 20-minute review."},
  {id:"nq-commit",tag:"COMMITTING",tagline:"Lock in the next step",q:"What would it mean to make this decision knowing exactly where you stand?",a:"No stack of mail. No guessing. No finding out later that your plan has a gap you didn't know about. Here's what I do: I pull every plan available in your county, run your doctors and drugs through each one, and show you the total annual cost side by side. One call, 20 minutes, no obligation. You leave knowing exactly what to do — and exactly why."},
];

const GH_LIVE_PAGES = [
  "how-to-enroll-in-medicare-part-a-and-part-b",
  "medicare-advantage-vs-medigap-plan-g-vs-plan-n-nc",
  "compare-medicare-advantage-plans-nc-2026",
  "medicare-costs-2026",
  "medicare-special-enrollment-period-guide",
  "medicare-late-enrollment-penalty-guide",
  "working-past-65-medicare-guide",
  "medicare-enrollment-2026",
];

const GH_CLUSTERS = {
  durham:["medicare-broker-durham-nc","best-medicare-plans-in-durham-county-nc","duke-health-medicare-plans-durham","medicare-advantage-vs-medigap-nc","how-to-enroll-in-medicare-part-a-and-part-b","medicare-costs-2026","medicare-enrollment-2026","medicare-late-enrollment-penalty-guide"],
  wake:["medicare-help-wake-county-nc","whats-the-best-insurance-to-go-with-medicare","best-medicare-plans-for-maximum-coverage-nc","compare-medicare-advantage-plans-nc-2026","how-to-enroll-in-medicare-part-a-and-part-b","medicare-costs-2026","medicare-enrollment-2026","medicare-special-enrollment-period-guide"],
  general:["how-to-enroll-in-medicare-part-a-and-part-b","medicare-advantage-vs-medigap-plan-g-vs-plan-n-nc","compare-medicare-advantage-plans-nc-2026","medicare-costs-2026","medicare-special-enrollment-period-guide","medicare-late-enrollment-penalty-guide","working-past-65-medicare-guide","medicare-enrollment-2026"],
};

const GH_KEYWORD_CLUSTER_MAP = [
  {keywords:["durham"],cluster:"durham"},
  {keywords:["wake","raleigh","cary"],cluster:"wake"},
  {keywords:["mecklenburg","charlotte"],cluster:"mecklenburg"},
  {keywords:["forsyth","winston"],cluster:"forsyth"},
  {keywords:["guilford","greensboro","high point"],cluster:"guilford"},
  {keywords:["buncombe","asheville"],cluster:"buncombe"},
];

// ── Pure utility functions ─────────────────────────────────────────────────

function getRelatedGuides(slug) {
  if (!slug) return GH_CLUSTERS.general;
  const s = slug.toLowerCase();
  for (const km of GH_KEYWORD_CLUSTER_MAP) {
    for (const kw of km.keywords) {
      if (s.indexOf(kw) > -1) return GH_CLUSTERS[km.cluster] || GH_CLUSTERS.general;
    }
  }
  return GH_CLUSTERS.general;
}

function injectRelatedGuides(html, slug) {
  if (!html || !slug) return html;
  const guides = getRelatedGuides(slug).map(g =>
    g === "mecklenburg-county-nc" ? "medicare-agents-in-mecklenburg-north-carolina" : g
  );
  let result = html;
  for (let i = 0; i < 8; i++) {
    const url = "https://generationhealth.me/" + (guides[i] || guides[0]) + "/";
    result = result.split("[RELATED-SLUG-" + (i + 1) + "]").join(url);
    result = result.split("[RELATED GUIDE " + (i + 1) + "]").join(guides[i] ? guides[i].replace(/-/g, " ") : "related guide");
  }
  return result;
}

function scan67(html, pageType) {
  pageType = pageType || "medicare";
  if (!html) return { score: 0, total: 69, pct: 0, checks: [] };
  const htmlNoScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const txt = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const words = txt.split(" ").filter(w => w.trim().length > 2);
  const htmlLower = html.toLowerCase();
  const doc = new DOMParser().parseFromString(htmlNoScripts, "text/html");
  const hasAnswerBlock = !!doc.querySelector(".gh-answer");
  const answerBoxCount = doc.querySelectorAll(".gh-answer").length;
  const faqCount = (html.match(/"@type"\s*:\s*"Question"/g) || []).length;
  const h2Count = html.split("<h2").length - 1;
  const internalLinks = (html.match(/href=["'][^"']*generationhealth\.me[^"']*/gi) || []).length;
  const govLinks = html.split(".gov").length - 1;
  const hasCompTable = !!doc.querySelector(".gh-comparison,.comparison-table,.vs-table,table.gh-compare");
  const checks = [];

  // AEO (6)
  checks.push({id:"aeo-instant",label:"Instant answer block (.gh-answer)",cat:"AEO",catColor:"#60A5FA",pass:hasAnswerBlock});
  checks.push({id:"aeo-citable",label:"AI-citable structure (3+ answer boxes)",cat:"AEO",catColor:"#60A5FA",pass:answerBoxCount>=3});
  checks.push({id:"aeo-faq-schema",label:"FAQPage schema (4+ questions)",cat:"AEO",catColor:"#60A5FA",pass:faqCount>=4});
  checks.push({id:"aeo-howto",label:"HowTo schema or numbered steps",cat:"AEO",catColor:"#60A5FA",pass:htmlLower.indexOf('"@type":"howto"')>-1||htmlLower.indexOf('"@type": "howto"')>-1||(html.match(/<ol[^>]*>[\s\S]*?<li/gi)||[]).length>=3});
  checks.push({id:"aeo-comp-table",label:"Comparison table present",cat:"AEO",catColor:"#60A5FA",pass:hasCompTable});
  checks.push({id:"aeo-speakable",label:"Speakable schema or structured Q&A",cat:"AEO",catColor:"#60A5FA",pass:htmlLower.indexOf("speakable")>-1||answerBoxCount>=2});
  // SEO (8)
  const h1Count = html.split("<h1").length - 1;
  checks.push({id:"seo-h1",label:"Single H1 tag",cat:"SEO",catColor:"#4ADE80",pass:h1Count===1});
  checks.push({id:"seo-h2",label:"H2 structure (5+ headings)",cat:"SEO",catColor:"#4ADE80",pass:h2Count>=5});
  checks.push({id:"seo-word-count",label:"Word count 2000+",cat:"SEO",catColor:"#4ADE80",pass:words.length>=2000});
  checks.push({id:"seo-meta-desc",label:"Meta description present",cat:"SEO",catColor:"#4ADE80",pass:htmlLower.indexOf('name="description"')>-1||htmlLower.indexOf("name='description'")>-1});
  checks.push({id:"seo-title",label:"Page title tag present",cat:"SEO",catColor:"#4ADE80",pass:htmlLower.indexOf("<title")>-1});
  checks.push({id:"seo-internal-links",label:"Internal links (3+)",cat:"SEO",catColor:"#4ADE80",pass:internalLinks>=3});
  checks.push({id:"seo-gov-citations",label:"Gov source citations (2+)",cat:"SEO",catColor:"#4ADE80",pass:govLinks>=2});
  checks.push({id:"seo-breadcrumb",label:"Breadcrumb or BreadcrumbList schema",cat:"SEO",catColor:"#4ADE80",pass:htmlLower.indexOf("breadcrumb")>-1});
  // E-E-A-T (8)
  checks.push({id:"eeat-author",label:"Author card present",cat:"E-E-A-T",catColor:"#F472B6",pass:!!doc.querySelector(".gh-author")||htmlLower.indexOf("gh-author")>-1});
  checks.push({id:"eeat-license",label:"License number present",cat:"E-E-A-T",catColor:"#F472B6",pass:html.indexOf("10447418")>-1});
  checks.push({id:"eeat-phone",label:"Phone number present",cat:"E-E-A-T",catColor:"#F472B6",pass:html.indexOf("761-3326")>-1});
  checks.push({id:"eeat-date",label:"Published/updated date",cat:"E-E-A-T",catColor:"#F472B6",pass:htmlLower.indexOf("2026")>-1&&(htmlLower.indexOf("updated")>-1||htmlLower.indexOf("published")>-1||htmlLower.indexOf("reviewed")>-1)});
  checks.push({id:"eeat-certs",label:"AHIP or credentials mentioned",cat:"E-E-A-T",catColor:"#F472B6",pass:htmlLower.indexOf("ahip")>-1||htmlLower.indexOf("certified")>-1});
  checks.push({id:"eeat-person-schema",label:"Person schema present",cat:"E-E-A-T",catColor:"#F472B6",pass:htmlLower.indexOf('"@type":"person"')>-1||htmlLower.indexOf('"@type": "person"')>-1});
  checks.push({id:"eeat-localbiz",label:"LocalBusiness schema",cat:"E-E-A-T",catColor:"#F472B6",pass:htmlLower.indexOf("localbusiness")>-1});
  checks.push({id:"eeat-reviews",label:"Review or rating schema",cat:"E-E-A-T",catColor:"#F472B6",pass:htmlLower.indexOf('"@type":"review"')>-1||htmlLower.indexOf("aggregaterating")>-1||htmlLower.indexOf("5.0 google")>-1||htmlLower.indexOf("5.0")>-1});
  // CONTENT (10)
  checks.push({id:"cont-2026",label:"2026 figures present",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("2026")>-1});
  checks.push({id:"cont-partb",label:"Part B premium $202.90",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("202.90")>-1});
  checks.push({id:"cont-deductible",label:"Part B deductible $283",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("283")>-1});
  checks.push({id:"cont-parta-ded",label:"Part A deductible $1,736",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("1,736")>-1||html.indexOf("1736")>-1});
  checks.push({id:"cont-oop",label:"MA OOP max $9,350",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("9,350")>-1||html.indexOf("9350")>-1});
  checks.push({id:"cont-partd",label:"Part D OOP cap $2,100",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("2,100")>-1||html.indexOf("2100")>-1});
  checks.push({id:"cont-nc",label:"North Carolina mentioned",cat:"CONTENT",catColor:"#FB923C",pass:htmlLower.indexOf("north carolina")>-1||htmlLower.indexOf(" nc ")>-1});
  checks.push({id:"cont-cta-call",label:"Call CTA with phone",cat:"CONTENT",catColor:"#FB923C",pass:html.indexOf("761-3326")>-1&&(htmlLower.indexOf("call")>-1||htmlLower.indexOf("tel:")>-1)});
  checks.push({id:"cont-compliance",label:"Compliance footer present",cat:"CONTENT",catColor:"#FB923C",pass:htmlLower.indexOf("not offer every plan")>-1||htmlLower.indexOf("1-800-medicare")>-1});
  checks.push({id:"cont-nepq",label:"NEPQ persuasion block",cat:"CONTENT",catColor:"#FB923C",pass:!!doc.querySelector(".gh-nepq-block")||htmlLower.indexOf("gh-nepq")>-1});
  // VQA (8)
  checks.push({id:"vqa-dmsans",label:"DM Sans font loaded",cat:"VQA",catColor:"#A78BFA",pass:htmlLower.indexOf("dm sans")>-1||htmlLower.indexOf("dm+sans")>-1});
  checks.push({id:"vqa-fraunces",label:"Fraunces font loaded",cat:"VQA",catColor:"#A78BFA",pass:htmlLower.indexOf("fraunces")>-1});
  checks.push({id:"vqa-hero",label:"Hero section present",cat:"VQA",catColor:"#A78BFA",pass:!!doc.querySelector(".gh-hero")||htmlLower.indexOf("gh-hero")>-1});
  checks.push({id:"vqa-stats",label:"Stats strip present",cat:"VQA",catColor:"#A78BFA",pass:!!doc.querySelector(".gh-stats")||htmlLower.indexOf("gh-stats")>-1||htmlLower.indexOf("gh-stat")>-1});
  checks.push({id:"vqa-shimmer",label:"Shimmer animation present",cat:"VQA",catColor:"#A78BFA",pass:htmlLower.indexOf("shimmer")>-1||htmlLower.indexOf("ghsb")>-1});
  checks.push({id:"vqa-color-scheme",label:"Brand color #0F2440 present",cat:"VQA",catColor:"#A78BFA",pass:html.indexOf("0F2440")>-1||html.indexOf("0f2440")>-1});
  checks.push({id:"vqa-mobile",label:"Viewport meta tag",cat:"VQA",catColor:"#A78BFA",pass:htmlLower.indexOf("viewport")>-1});
  checks.push({id:"vqa-faq-section",label:"FAQ section present",cat:"VQA",catColor:"#A78BFA",pass:!!doc.querySelector(".gh-faq")||htmlLower.indexOf("gh-faq")>-1||(doc.querySelectorAll("h3,h4").length>=4)});
  // CONV (6)
  checks.push({id:"conv-cta-modal",label:"CTA modal or compare button",cat:"CONV",catColor:"#2DD4BF",pass:!!doc.querySelector(".gh-cta-modal")||htmlLower.indexOf("gh-cta")>-1||htmlLower.indexOf("compare plans")>-1});
  checks.push({id:"conv-calendly",label:"Calendly link present",cat:"CONV",catColor:"#2DD4BF",pass:htmlLower.indexOf("calendly")>-1});
  checks.push({id:"conv-sunfire",label:"SunFire or compare tool link",cat:"CONV",catColor:"#2DD4BF",pass:htmlLower.indexOf("sunfire")>-1||htmlLower.indexOf("medicareadvocates")>-1});
  checks.push({id:"conv-float-cta",label:"Floating call button",cat:"CONV",catColor:"#2DD4BF",pass:!!doc.querySelector(".gh-float-call")||htmlLower.indexOf("gh-float")>-1});
  checks.push({id:"conv-trust-badges",label:"Trust badges or credentials strip",cat:"CONV",catColor:"#2DD4BF",pass:!!doc.querySelector(".gh-trust")||htmlLower.indexOf("gh-trust")>-1||htmlLower.indexOf("gh-cred")>-1});
  checks.push({id:"conv-zip-or-county",label:"County or ZIP specificity",cat:"CONV",catColor:"#2DD4BF",pass:htmlLower.indexOf("county")>-1||(/\b\d{5}\b/).test(html)});
  // COMP (8)
  checks.push({id:"comp-independent",label:"Independent broker positioning",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("independent")>-1});
  checks.push({id:"comp-multiple-carriers",label:"Multiple carriers mentioned",cat:"COMP",catColor:"#FBBF24",pass:(htmlLower.indexOf("humana")>-1||htmlLower.indexOf("aetna")>-1||htmlLower.indexOf("unitedhealthcare")>-1||htmlLower.indexOf("blue cross")>-1)});
  checks.push({id:"comp-duke",label:"Duke Health network mentioned",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("duke health")>-1||htmlLower.indexOf("duke university")>-1});
  checks.push({id:"comp-free",label:"Free consultation mentioned",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("free")>-1&&(htmlLower.indexOf("consult")>-1||htmlLower.indexOf("review")>-1||htmlLower.indexOf("comparison")>-1)});
  checks.push({id:"comp-zero-cost",label:"$0 cost to client stated",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("$0 cost")>-1||htmlLower.indexOf("no cost to you")>-1||htmlLower.indexOf("at no cost")>-1});
  checks.push({id:"comp-local",label:"Local Durham/NC positioning",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("durham")>-1||htmlLower.indexOf("triangle")>-1||htmlLower.indexOf("north carolina")>-1});
  checks.push({id:"comp-tip-warning",label:"Watch out / red flag tip",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("red flag")>-1||htmlLower.indexOf("watch out")>-1||htmlLower.indexOf("captive")>-1||!!doc.querySelector(".gh-tip,.gh-warning")});
  checks.push({id:"comp-case-study",label:"Real example or case study",cat:"COMP",catColor:"#FBBF24",pass:htmlLower.indexOf("real example")>-1||htmlLower.indexOf("saved $")>-1||htmlLower.indexOf("for example")>-1});
  // COMPL (5)
  checks.push({id:"compl-not-affiliated",label:"Not affiliated with Medicare disclaimer",cat:"COMPL",catColor:"#F87171",pass:htmlLower.indexOf("not affiliated")>-1||htmlLower.indexOf("not associated")>-1});
  checks.push({id:"compl-not-all-plans",label:"Does not offer every plan disclaimer",cat:"COMPL",catColor:"#F87171",pass:htmlLower.indexOf("not offer every plan")>-1||htmlLower.indexOf("not all plans")>-1});
  checks.push({id:"compl-1800",label:"1-800-MEDICARE reference",cat:"COMPL",catColor:"#F87171",pass:html.indexOf("1-800-MEDICARE")>-1||html.indexOf("1-800-633-4227")>-1});
  checks.push({id:"compl-npn",label:"NPN number displayed",cat:"COMPL",catColor:"#F87171",pass:html.indexOf("NPN")>-1||html.indexOf("10447418")>-1});
  checks.push({id:"compl-educational",label:"Educational purposes statement",cat:"COMPL",catColor:"#F87171",pass:htmlLower.indexOf("educational")>-1||htmlLower.indexOf("informational purposes")>-1});
  // LINKS (8)
  const guideCount = (html.match(/generationhealth\.me\/[a-z0-9-]+\//g) || []).length;
  const hasNoPlaceholders = html.indexOf("[RELATED-SLUG") === -1 && html.indexOf("[RELATED GUIDE") === -1;
  checks.push({id:"links-guides",label:"8 related guides injected",cat:"LINKS",catColor:"#60A5FA",pass:guideCount>=8});
  checks.push({id:"links-no-placeholders",label:"No placeholder URLs remaining",cat:"LINKS",catColor:"#60A5FA",pass:hasNoPlaceholders});
  checks.push({id:"links-enrollment",label:"Enrollment guide linked",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("enroll-in-medicare")>-1||htmlLower.indexOf("enrollment")>-1});
  checks.push({id:"links-costs",label:"Costs guide linked",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("medicare-costs")>-1||htmlLower.indexOf("costs-2026")>-1});
  checks.push({id:"links-medigap",label:"Medigap guide linked",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("medigap")>-1||htmlLower.indexOf("supplement")>-1});
  checks.push({id:"links-sep",label:"SEP guide linked",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("special-enrollment")>-1||htmlLower.indexOf("sep")>-1});
  checks.push({id:"links-penalty",label:"Penalty guide linked",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("penalty")>-1});
  checks.push({id:"links-hub-intro",label:"Hub intro block present",cat:"LINKS",catColor:"#60A5FA",pass:htmlLower.indexOf("keep reading to understand")>-1||htmlLower.indexOf("gh-hub-intro")>-1||htmlLower.indexOf("hub-intro")>-1});

  const passing = checks.filter(c => c.pass).length;
  return { score: passing, total: checks.length, pct: Math.round(passing / checks.length * 100), checks };
}

function getSrcdoc(rawHtml, applied, activeZone) {
  if (!rawHtml) return '<html><body style="font-family:sans-serif;padding:40px;text-align:center;color:#6B7B8D"><p>Select a page from the queue, then click Generate or Fetch live.</p></body></html>';
  let html = rawHtml;
  if (!html.includes("DM Sans")) {
    html = html.replace(/<head([^>]*)>/i, '<head$1><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fraunces:wght@400;600;700;800&display=swap" rel="stylesheet">');
  }
  const zonesData = JSON.stringify(ZONES);
  const appliedData = JSON.stringify(applied || {});
  const activeZoneData = JSON.stringify(activeZone || null);
  const OT = '<style>.gh-zone-box{margin:0;padding:14px 16px;cursor:pointer;transition:box-shadow .2s;display:flex;align-items:center;gap:8px;position:relative;z-index:100;}.gh-zone-box:hover{box-shadow:0 2px 12px rgba(0,0,0,.15);}.gh-zone-active{outline:3px solid;outline-offset:2px;}.gh-zone-num{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;}.gh-zone-lbl{font-size:10px;font-weight:600;letter-spacing:.05em;flex:1;}.gh-zone-rule{flex:1;height:1px;opacity:.25;margin:0 6px;}.gh-zone-tag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;color:#fff;}.gh-zone-hint{font-size:10px;opacity:.5;}</style>';
  const script = `<script>
(function(){
var ZONES=${zonesData};
var applied=${appliedData};
var activeZone=${activeZoneData};
var BAD=['gh-hero','gh-cta-modal','gh-cta-card','gh-float-call','gh-header','gh-deadline','gh-trust-badge','gh-author','gh-faq-item','gh-nepq-block','gh-tip','gh-answer','gh-warning','gh-related'];
function hasBadAnc(el){var n=el.parentNode,d=0;while(n&&n.tagName&&n.tagName.toLowerCase()!=='body'&&d<12){var t=n.tagName.toLowerCase();if(['button','nav','header','footer','form'].indexOf(t)>-1)return true;if(n.classList){for(var i=0;i<BAD.length;i++){if(n.classList.contains(BAD[i]))return true;}}n=n.parentNode;d++;}return false;}
function mkBox(z){
var d=document.createElement('div');d.className='gh-zone-box';d.id='ghz-'+z.id;d.style.background=z.bg;d.style.border='1.5px solid '+(applied[z.id]?z.color:z.border);
var num=document.createElement('div');num.className='gh-zone-num';num.style.background=z.color;num.textContent=z.id.slice(1);d.appendChild(num);
var lbl=document.createElement('div');lbl.className='gh-zone-lbl';lbl.style.color=z.color;lbl.textContent=z.label+' — '+z.desc;d.appendChild(lbl);
var rule=document.createElement('div');rule.className='gh-zone-rule';rule.style.background=z.color;d.appendChild(rule);
if(applied[z.id]){var tag=document.createElement('span');tag.className='gh-zone-tag';tag.style.background=z.color;tag.textContent='✓ '+applied[z.id].tag;d.appendChild(tag);}
else{var hint=document.createElement('span');hint.className='gh-zone-hint';hint.style.color=z.color;hint.textContent='+ click to activate';d.appendChild(hint);}
d.addEventListener('click',function(){document.querySelectorAll('.gh-zone-box').forEach(function(b){b.classList.remove('gh-zone-active');b.style.outlineColor='';});d.classList.add('gh-zone-active');d.style.outlineColor=z.color;window.parent.postMessage({type:'gh-pb-zone',zoneId:z.id},'*');});return d;}
function getHeadings(){var all=Array.from(document.querySelectorAll('h2,.gh-stats-strip,.gh-deadline-list,.gh-related,.gh-faq,.gh-trust-strip,.gh-cta-modal,.gh-footer-trust'));return all.filter(function(el){if(!el||!el.parentNode)return false;if(el.offsetHeight<4)return false;return !hasBadAnc(el);});}
function init(){var headings=getHeadings();if(!headings.length){document.body.appendChild(mkBox(ZONES[0]));return;}var used=[];ZONES.forEach(function(z,i){var idx=Math.floor(i/ZONES.length*headings.length);var el=null;for(var j=idx;j<headings.length;j++){if(used.indexOf(headings[j])===-1){el=headings[j];break;}}if(!el){for(var k=idx-1;k>=0;k--){if(used.indexOf(headings[k])===-1){el=headings[k];break;}}}if(el&&el.parentNode){used.push(el);el.parentNode.insertBefore(mkBox(z),el);}else{document.body.appendChild(mkBox(z));}});}
window.addEventListener('message',function(e){if(!e||!e.data)return;if(e.data.type==='gh-pb-zone-update'){var zid=e.data.zoneId,newApp=e.data.applied||{};var box=document.getElementById('ghz-'+zid);if(!box)return;var z=null;for(var zi=0;zi<ZONES.length;zi++){if(ZONES[zi].id===zid){z=ZONES[zi];break;}}if(!z)return;while(box.firstChild)box.removeChild(box.firstChild);var num=document.createElement('div');num.className='gh-zone-num';num.style.background=z.color;num.textContent=z.id.slice(1);box.appendChild(num);var lbl=document.createElement('div');lbl.className='gh-zone-lbl';lbl.style.color=z.color;lbl.textContent=z.label+' — '+z.desc;box.appendChild(lbl);var rule=document.createElement('div');rule.className='gh-zone-rule';rule.style.background=z.color;box.appendChild(rule);if(newApp[zid]){var tag=document.createElement('span');tag.className='gh-zone-tag';tag.style.background=z.color;tag.textContent='✓ '+newApp[zid].tag;box.appendChild(tag);box.style.border='1.5px solid '+z.color;box.scrollIntoView({behavior:'smooth',block:'center'});}else{var hint=document.createElement('span');hint.className='gh-zone-hint';hint.style.color=z.color;hint.textContent='+ click to activate';box.appendChild(hint);box.style.border='1.5px solid '+z.border;}}if(e.data.type==='gh-pb-zone-scroll'){var box2=document.getElementById('ghz-'+e.data.zoneId);if(box2)box2.scrollIntoView({behavior:'smooth',block:'center'});}});
function runInit(){init();if(activeZone){var ab=document.getElementById('ghz-'+activeZone);if(ab){var zc=ZONES.filter(function(z){return z.id===activeZone;})[0];ab.classList.add('gh-zone-active');if(zc)ab.style.outlineColor=zc.color;ab.scrollIntoView({behavior:'smooth',block:'center'});}}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(runInit,300);});}else{setTimeout(runInit,300);}
})();
<\/script>`;
  return html.replace(/<\/body>\s*<\/html>\s*$/i, "") + OT + "\n" + script + "\n</body></html>";
}

function injectNepqBlocks(html, zoneApplied) {
  if (!html || !Object.keys(zoneApplied).length) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html.includes("<html") ? html : "<html><body>" + html + "</body></html>", "text/html");
  const BAD = ["gh-hero","gh-cta-modal","gh-author","gh-faq-item","gh-nepq-block","gh-tip","gh-answer","gh-warning","gh-trust-badge","gh-trust-strip"];
  const headings = Array.from(doc.querySelectorAll("h2,.gh-stats-strip,.gh-related,.gh-faq,.gh-trust-strip,.gh-cta-modal,.gh-footer-trust")).filter(el => {
    let n = el.parentNode;
    while (n && n.tagName && n.tagName.toLowerCase() !== "body") {
      if (n.classList) { for (const c of BAD) { if (n.classList.contains(c)) return false; } }
      n = n.parentNode;
    }
    return true;
  });
  const usedIdx = [];
  const zoneHeadingMap = {};
  ZONES.forEach((z, i) => {
    if (!zoneApplied[z.id]) return;
    const idx = Math.floor(i / ZONES.length * headings.length);
    let found = -1;
    for (let j = idx; j < headings.length; j++) { if (!usedIdx.includes(j)) { found = j; break; } }
    if (found === -1) { for (let k = idx - 1; k >= 0; k--) { if (!usedIdx.includes(k)) { found = k; break; } } }
    if (found > -1) { usedIdx.push(found); zoneHeadingMap[z.id] = found; }
  });
  ZONES.filter(z => zoneApplied[z.id] && zoneHeadingMap[z.id] !== undefined).slice().reverse().forEach(z => {
    const heading = headings[zoneHeadingMap[z.id]];
    if (!heading || !heading.parentNode) return;
    const d = zoneApplied[z.id];
    const blockEl = doc.createElement("div");
    blockEl.innerHTML = `<div class="gh-nepq-block" style="padding:28px 32px;background:#F0FDFA !important;border-left:4px solid #0D9488;border-radius:8px;margin:32px 0;color:#1A2332 !important"><p style="font-size:17px;font-weight:700;font-style:italic;color:#1A2332 !important;margin:0 0 12px;line-height:1.6">"${d.q}"</p><p style="font-size:17px;line-height:1.78;color:#3A4553 !important;margin:0">${d.a}</p></div>`;
    if (blockEl.firstChild) heading.parentNode.insertBefore(blockEl.firstChild, heading);
  });
  const body = doc.querySelector("body");
  return body ? body.innerHTML : doc.documentElement.outerHTML;
}

const CAT_ORDER = ["AEO","SEO","E-E-A-T","CONTENT","VQA","CONV","COMP","COMPL","LINKS"];

// ── Main Component ─────────────────────────────────────────────────────────

export default function PageBuilder({ onToggleTheme, isDark: isDarkProp,{ clusters, savedHTML, setSavedHTML, setHasChanges, pbCompleted, setPbCompleted, pbPendingPublish, setPbPendingPublish, setView, focusClusterId }) {

  // State
  const [pbPage, setPbPage] = useState(null);
  const [pbMode, setPbMode] = useState("fix");
  const [pbPageType, setPbPageType] = useState("medicare");
  const [pbActiveZone, setPbActiveZone] = useState(null);
  const [pbActiveTab, setPbActiveTab] = useState("medicare");
  const [pbSelectedCard, setPbSelectedCard] = useState(null);
  const [pbZoneApplied, setPbZoneApplied] = useState({});
  const [pbZoneStore, setPbZoneStore] = useState({});
  const [pbApproved, setPbApproved] = useState(false);
  const [pbFetching, setPbFetching] = useState(false);
  const [pbAiGenerating, setPbAiGenerating] = useState(false);
  const [pbGenerating, setPbGenerating] = useState(null);
  const [pbFixing, setPbFixing] = useState(false);
  const [pbApiKey, setPbApiKey] = useState(() => { try { return localStorage.getItem("gh-cc-pb-apikey") || ""; } catch { return ""; } });
  const [pbShowApiKey, setPbShowApiKey] = useState(false);
  const [pbNewSlug, setPbNewSlug] = useState("");
  const [pbNewTitle, setPbNewTitle] = useState("");
  const [pbScanResults, setPbScanResults] = useState(null);

  // Effects
  useEffect(() => { try { localStorage.setItem("gh-cc-pb-apikey", pbApiKey); } catch {} }, [pbApiKey]);

  useEffect(() => {
    function onMsg(e) { if (e?.data?.type === "gh-pb-zone" && e.data.zoneId) { setPbActiveZone(e.data.zoneId); setPbSelectedCard(null); } }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    if (!pbActiveZone) return;
    const t = setTimeout(() => {
      const ifrEl = document.querySelector('iframe[title="Page Preview v4"]');
      if (ifrEl?.contentWindow) { ifrEl.contentWindow.postMessage({ type: "gh-pb-zone-scroll", zoneId: pbActiveZone }, "*"); }
    }, 150);
    return () => clearTimeout(t);
  }, [pbActiveZone]);

  // Derived
  const allPages = (clusters || []).flatMap(c =>
    c.posts.map((p, i) => ({ name: p.name || p.slug, slug: p.slug, status: p.status, clusterId: c.id, clusterName: c.name, idx: i, key: c.id + "-" + i, html: savedHTML?.[c.id + "-" + i] || null }))
  ).filter(p => !!p.slug);
  const plannedPages = allPages.filter(p => p.status === "planned");
  const livePages = allPages.filter(p => p.status === "done");
  const queuePages = pbMode === "fix" ? livePages : plannedPages;
  const totalPlanned = plannedPages.length;
  const totalLive = livePages.length;
  const totalBuilt = allPages.filter(p => !!(savedHTML?.[p.key])).length;
  const pageKey = pbPage ? pbPage.clusterId + "-" + pbPage.idx : null;
  const pageHtml = pageKey && savedHTML?.[pageKey] ? savedHTML[pageKey] : null;
  const appliedCount = Object.keys(pbZoneApplied).length;
  const srcdoc = getSrcdoc(pageHtml, pbZoneApplied, pbActiveZone);
  const scan = pbPage && pageHtml ? scan67(pageHtml, pbPageType) : null;
  const tabCards = pbActiveTab === "medicare" ? MC : pbActiveTab === "aca" ? AC : NQ;

  const groupedChecks = {};
  if (scan) { scan.checks.forEach(c => { if (!groupedChecks[c.cat]) groupedChecks[c.cat] = []; groupedChecks[c.cat].push(c); }); }

  let finishStep = 0;
  if (pageHtml) finishStep = 1;
  if (finishStep === 1 && appliedCount > 0) finishStep = 2;
  if (finishStep === 2 && scan && scan.pct >= 90) finishStep = 3;
  if (finishStep === 3 && pbApproved) finishStep = 4;

  // Handlers
  const pbFetchPageHTML = useCallback(async function(slug) {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
    const pageUrl = "https://generationhealth.me/" + cleanSlug + "/";
    try { const r1 = await fetch("https://generationhealth.me/tools/scrape-proxy.php?url=" + encodeURIComponent(pageUrl)); if (r1.ok) { const d1 = await r1.json(); if (d1?.html?.length > 500) return d1.html; } } catch {}
    try { const r2 = await fetch("https://corsproxy.io/?" + encodeURIComponent(pageUrl)); if (r2.ok) { const t2 = await r2.text(); if (t2.length > 500) return t2; } } catch {}
    try { const r3 = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(pageUrl)); if (r3.ok) { const t3 = await r3.text(); if (t3.length > 500) return t3; } } catch {}
    try { const r4 = await fetch("https://generationhealth.me/wp-json/wp/v2/pages?slug=" + encodeURIComponent(cleanSlug) + "&_fields=content"); if (r4.ok) { const pages = await r4.json(); if (Array.isArray(pages) && pages.length > 0 && pages[0]?.content?.rendered) return pages[0].content.rendered; } } catch {}
    return null;
  }, []);

  const pbHandleFetch = useCallback(function(page) {
    if (!page?.slug) return;
    setTimeout(async function() {
      setPbFetching(true);
      try {
        const fetched = await pbFetchPageHTML(page.slug);
        if (fetched) {
          const key = page.clusterId + "-" + page.idx;
          setSavedHTML(prev => ({ ...prev, [key]: fetched }));
          setPbPage(p => ({ ...p, html: fetched }));
          setHasChanges(true);
          setPbActiveZone("z1");
          setPbZoneApplied({});
          setPbSelectedCard(null);
          setPbApproved(false);
          setPbScanResults(scan67(fetched, pbPageType));
        } else { alert("Could not fetch page. Check that scrape-proxy.php is deployed."); }
      } catch (err) { alert("Fetch error: " + err.message); }
      setPbFetching(false);
    }, 0);
  }, [pbFetchPageHTML, pbPageType, setSavedHTML, setHasChanges]);

  const pbHandleGenerate = useCallback(async function() {
    if (!pbPage && !pbNewSlug) { alert("Select a page from the queue first."); return; }
    if (!pbApiKey) { alert("Add your Claude API key first."); return; }
    const slug = pbPage ? pbPage.slug : pbNewSlug;
    const title = pbPage ? pbPage.name : (pbNewTitle || pbNewSlug.replace(/-/g, " "));
    if (!slug) { alert("No slug found."); return; }
    setPbAiGenerating(true);
    setPbGenerating("Building prompt...");
    try {
      const sp = [
        "You are building a healthcare insurance page for GenerationHealth.me, operated by Robert Simm, licensed Medicare and ACA broker in Durham, NC (NC License #10447418, NPN #10447418, phone (828) 761-3326). You write with NEPQ persuasion tone.",
        "REQUIRED — all 69 checks must pass:",
        "AEO: 3+ .gh-answer blocks, FAQPage schema 4+ questions, HowTo schema 3+ steps, comparison table .gh-comparison, Speakable markup.",
        "SEO: Single H1, 5+ H2s, 2000+ words, meta description, title tag, 3+ internal generationhealth.me links, 2+ .gov citations, BreadcrumbList schema.",
        "E-E-A-T: .gh-author card with RS/Robert Simm/NC License #10447418, phone (828) 761-3326, 2026 date, AHIP Certified, Person schema, LocalBusiness schema, rating mention.",
        "2026 FIGURES: Part B $202.90, Part B deductible $283, Part A deductible $1,736, MA OOP max $9,350, Part D OOP cap $2,100.",
        "CONTENT: North Carolina, Durham, call CTA (828) 761-3326, compliance footer with 'We do not offer every plan', 1-800-MEDICARE, NEPQ persuasion arc, red flag tip about captive agents, real example with savings, $0 cost to client, free consultation, independent broker, multiple carriers (Humana/Aetna/UnitedHealthcare/Blue Cross).",
        "COMPLIANCE: Not affiliated with Medicare disclaimer, does not offer every plan, 1-800-MEDICARE reference, NPN #10447418 displayed, educational purposes statement.",
        "LINKS: 8 placeholder slots [RELATED-SLUG-1] through [RELATED-SLUG-8].",
        "HUB INTRO: Include a hub intro block after 'keep reading to understand what's at stake'.",
        "FONTS: DM Sans body, Fraunces headings. COLORS: #0F2440 navy, #4B9CD3 blue, #0D9488 teal.",
        "Return complete HTML only. No markdown. No backticks. Start with <!DOCTYPE html>.",
      ];
      const up = ["Build a complete " + pbPageType + " insurance page.", "Topic: " + title, "Slug: " + slug, "Type: " + pbPageType, "Target: Durham and Wake County NC residents turning 65 or newly on Medicare.", "All 69 quality checks must pass.", "Return complete HTML only."];
      setPbGenerating("Calling Claude (30-60 seconds)...");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": pbApiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 16000, system: sp.join("\n\n"), messages: [{ role: "user", content: up.join("\n") }] }),
      });
      if (!resp.ok) { const errData = await resp.json(); throw new Error(errData.error?.message || "API error " + resp.status); }
      setPbGenerating("Assembling HTML...");
      const data = await resp.json();
      let result = data.content?.[0]?.text || "";
      result = result.replace(/^```(?:html|json)?\n?/gm, "").replace(/\n?```$/gm, "").trim();
      setPbGenerating("Injecting related guides...");
      result = injectRelatedGuides(result, slug);
      if (!result.toLowerCase().includes("not offer every plan")) {
        result += '\n<div class="gh-footer-trust" style="max-width:800px;margin:40px auto 0;padding:32px 24px;text-align:center;font-family:\'DM Sans\',sans-serif;font-size:12px;color:#6B7B8D;line-height:1.8"><p style="margin-bottom:12px"><strong>Last updated April 2026</strong> · Reviewed by Rob Simm, NC License #10447418</p><p>We do not offer every plan available in your area. Please contact <a href="https://medicare.gov" style="color:#4B9CD3">Medicare.gov</a> or 1-800-MEDICARE (1-800-633-4227) for information on all of your options. Not affiliated with or endorsed by the federal Medicare program.</p></div>';
      }
      const key = pbPage ? (pbPage.clusterId + "-" + pbPage.idx) : ("custom-" + slug);
      setSavedHTML(prev => ({ ...prev, [key]: result }));
      if (pbPage) setPbPage(p => ({ ...p, html: result }));
      setHasChanges(true);
      setPbZoneApplied({});
      setPbActiveZone("z1");
      setPbSelectedCard(null);
      setPbApproved(false);
      setPbScanResults(scan67(result, pbPageType));
      setPbGenerating(null);
    } catch (err) { setPbGenerating(null); alert("Generation failed: " + err.message); }
    setPbAiGenerating(false);
  }, [pbPage, pbNewSlug, pbNewTitle, pbApiKey, pbPageType, setSavedHTML, setHasChanges]);

  const pbHandleApplyCard = useCallback(function(card, activeZone, zoneApplied) {
    if (!activeZone || !card) return;
    const newApplied = { ...zoneApplied, [activeZone]: { tag: card.tag, q: card.q, a: card.a } };
    setPbZoneApplied(newApplied);
    setPbSelectedCard(card);
    setTimeout(() => {
      const ifrEl = document.querySelector('iframe[title="Page Preview v4"]');
      if (ifrEl?.contentWindow) { ifrEl.contentWindow.postMessage({ type: "gh-pb-zone-update", zoneId: activeZone, applied: newApplied }, "*"); }
    }, 50);
    const ZONE_IDS = ["z1","z2","z3","z4","z5","z6","z7","z8"];
    const currentIdx = ZONE_IDS.indexOf(activeZone);
    for (let i = currentIdx + 1; i < ZONE_IDS.length; i++) {
      if (!newApplied[ZONE_IDS[i]]) { setPbActiveZone(ZONE_IDS[i]); return; }
    }
  }, []);

  const pbHandleFixAll = useCallback(async function(html, s) {
    if (!html || !pbApiKey || !s?.checks) return;
    const failing = s.checks.filter(c => !c.pass);
    if (!failing.length) return;
    setPbFixing(true);
    try {
      const failList = failing.map(c => "- " + c.label + " (" + c.cat + ")").join("\n");
      const fixPrompt = "Fix all failing checks on this page. Return complete corrected HTML.\n\nFailing:\n" + failList + "\n\nCurrent HTML (first 8000 chars):\n" + html.slice(0, 8000);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": pbApiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 16000, messages: [{ role: "user", content: fixPrompt }] }),
      });
      const data = await resp.json();
      let result = data.content?.[0]?.text || "";
      result = result.replace(/^```(?:html)?\n?/gm, "").replace(/\n?```$/gm, "").trim();
      if (result.length > 500 && pbPage) {
        const key = pbPage.clusterId + "-" + pbPage.idx;
        setSavedHTML(prev => ({ ...prev, [key]: result }));
        setPbPage(p => ({ ...p, html: result }));
        setPbScanResults(scan67(result, pbPageType));
        setHasChanges(true);
      }
    } catch (err) { alert("Fix all failed: " + err.message); }
    setPbFixing(false);
  }, [pbApiKey, pbPage, pbPageType, setSavedHTML, setHasChanges]);

  const pbHandleCopyForWP = useCallback(function(html, zoneApplied) {
    if (!html) { alert("No page HTML. Generate or fetch a page first."); return; }
    try {
      let finalHtml = html;
      if (Object.keys(zoneApplied).length > 0) { finalHtml = injectNepqBlocks(html, zoneApplied); }
      if (window.flattenForElementor) finalHtml = window.flattenForElementor(finalHtml);
      navigator.clipboard.writeText(finalHtml).then(() => {
        setPbApproved(true);
        if (pbPage?.key) { setPbCompleted(prev => prev.includes(pbPage.key) ? prev : [...prev, pbPage.key]); setHasChanges(true); }
        alert("✅ Copied! Paste into Elementor Custom HTML widget.");
      }).catch(err => alert("⚠ Clipboard failed: " + err.message));
    } catch (ex) { alert("⚠ Error: " + ex.message); }
  }, [pbPage, setPbCompleted, setHasChanges]);

  const pbHandleSubmit = useCallback(async function() {
    if (!pbPage?.slug) { alert("Select a page first."); return; }
    const url = "https://generationhealth.me/" + pbPage.slug.replace(/^\/+|\/+$/g, "") + "/";
    try {
      const r = await fetch("https://generationhealth.me/tools/indexnow-proxy.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, urlList: [url], host: "generationhealth.me" }),
      });
      if (r.ok) alert("✅ Submitted to Bing, Yandex, and Seznam via IndexNow.\n\nFor Google: Search Console → URL Inspection → Request Indexing.");
      else alert("IndexNow submission failed.");
    } catch (err) { alert("Submit error: " + err.message); }
  }, [pbPage]);

  // ── Render ─────────────────────────────────────────────────────────────
  const isDark = isDarkProp !== undefined ? isDarkProp : true;
  const tc = "#E8ECF0";
  const mc = "#6B7B8D";
  const bdr = "1px solid rgba(255,255,255,0.08)";
  const bgp = "#121C28";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 116px)", overflow: "hidden", fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderBottom: bdr, background: bgp, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tc, whiteSpace: "nowrap" }}>Page builder</span>
        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: "rgba(75,156,211,0.15)", color: "#4B9CD3", fontWeight: 700 }}>v4</span>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", flexShrink: 0, margin: "0 4px" }} />
        {[["build","Build new"],["fix","Fix existing"],["scan","Scan HTML"]].map(([m, label]) => (
          <button key={m} onClick={() => setPbMode(m)} style={{ fontSize: 10, padding: "3px 11px", borderRadius: 20, border: "0.5px solid " + (pbMode === m ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"), background: pbMode === m ? "rgba(255,255,255,0.1)" : "transparent", color: pbMode === m ? tc : mc, cursor: "pointer", fontWeight: pbMode === m ? 600 : 400, whiteSpace: "nowrap", flexShrink: 0 }}>{label}</button>
        ))}
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", flexShrink: 0, margin: "0 4px" }} />
        {[["medicare","Medicare"],["aca","ACA"],["broker","Broker"]].map(([t, label]) => (
          <button key={t} onClick={() => setPbPageType(t)} style={{ fontSize: 10, padding: "3px 11px", borderRadius: 20, border: "0.5px solid " + (pbPageType === t ? "rgba(75,156,211,0.5)" : "rgba(255,255,255,0.1)"), background: pbPageType === t ? "rgba(75,156,211,0.15)" : "transparent", color: pbPageType === t ? "#4B9CD3" : mc, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</button>
        ))}
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", flexShrink: 0, margin: "0 4px" }} />
        <button onClick={() => pbHandleCopyForWP(pageHtml, pbZoneApplied)} style={{ fontSize: 10, padding: "3px 11px", borderRadius: 20, border: "0.5px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "#4ADE80", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>Copy for WP</button>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setPbShowApiKey(p => !p)} style={{ fontSize: 10, padding: "3px 11px", borderRadius: 20, border: "0.5px solid " + (pbApiKey ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"), background: "transparent", color: pbApiKey ? "#4ADE80" : mc, cursor: "pointer", whiteSpace: "nowrap" }}>API key{pbApiKey ? " ✓" : ""}</button>
          {pbShowApiKey && (
            <div style={{ position: "absolute", top: 30, right: 0, width: 260, padding: 12, background: "#1A2840", border: bdr, borderRadius: 10, zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: mc, marginBottom: 6 }}>CLAUDE API KEY</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="password" value={pbApiKey} onChange={e => setPbApiKey(e.target.value)} placeholder="sk-ant-..." style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: bdr, background: "rgba(255,255,255,0.04)", color: tc, fontSize: 11, outline: "none" }} />
                <button onClick={() => setPbShowApiKey(false)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#0D9488", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Save</button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3-COLUMN BODY */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "210px 1fr 248px", overflow: "hidden", minHeight: 0 }}>

        {/* LEFT: QUEUE */}
        <div style={{ borderRight: bdr, display: "flex", flexDirection: "column", overflow: "hidden", background: bgp }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, padding: "7px", borderBottom: bdr, flexShrink: 0 }}>
            {[[totalPlanned,"planned",tc],[totalBuilt,"built","#4ADE80"],[0,"failing","#F87171"],[totalLive,"live",mc]].map(([v, label, color]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 5, padding: "4px 5px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{v}</div>
                <div style={{ fontSize: 8, color: mc, marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 3, padding: "6px 7px", borderBottom: bdr, flexShrink: 0 }}>
            <button onClick={() => setPbMode("build")} style={{ flex: 1, fontSize: 10, padding: "4px 0", textAlign: "center", cursor: "pointer", color: pbMode === "build" ? "#4B9CD3" : mc, borderRadius: 20, border: "0.5px solid " + (pbMode === "build" ? "rgba(75,156,211,0.4)" : "rgba(255,255,255,0.1)"), background: pbMode === "build" ? "rgba(75,156,211,0.1)" : "transparent" }}>Planned ({totalPlanned})</button>
            <button onClick={() => setPbMode("fix")} style={{ flex: 1, fontSize: 10, padding: "4px 0", textAlign: "center", cursor: "pointer", color: pbMode === "fix" ? "#4B9CD3" : mc, borderRadius: 20, border: "0.5px solid " + (pbMode === "fix" ? "rgba(75,156,211,0.4)" : "rgba(255,255,255,0.1)"), background: pbMode === "fix" ? "rgba(75,156,211,0.1)" : "transparent" }}>Live ({totalLive})</button>
          </div>
          {/* Queue list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {queuePages.map(page => {
              const key = page.key;
              const hasHtml = !!(savedHTML?.[key]);
              const isSel = pbPage?.key === key;
              const s = pbPage?.key === key && scan ? scan : { score: 0, total: 69, pct: 0 };
              const sc = s.pct >= 80 ? "#4ADE80" : s.pct >= 60 ? "#FFC72C" : "#F87171";
              const zFilled = hasHtml && isSel ? Object.keys(pbZoneApplied).length : 0;
              const source = page.clusterId.split("-")[0];
              return (
                <div key={key} onClick={() => {
                  if (pbPage && pbPage.key !== key) { setPbZoneStore(prev => ({ ...prev, [pbPage.key]: pbZoneApplied })); }
                  setPbPage(page); setPbSelectedCard(null); setPbApproved(false);
                  setPbZoneApplied(pbZoneStore[key] || {});
                  if (hasHtml) { setPbActiveZone(ZONES[0].id); setTimeout(() => setPbScanResults(scan67(savedHTML[key], pbPageType)), 0); }
                  else { setPbActiveZone(null); setPbScanResults(null); }
                }} style={{ padding: "7px 8px", borderBottom: bdr, cursor: "pointer", background: isSel ? "rgba(75,156,211,0.1)" : "transparent", borderLeft: isSel ? "2px solid #4B9CD3" : "2px solid transparent", transition: "all .1s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 2 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: isSel ? "#4B9CD3" : tc, lineHeight: 1.3, flex: 1, paddingRight: 4 }}>{page.name}</div>
                    <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 20, fontWeight: 600, flexShrink: 0, background: hasHtml ? sc + "20" : "rgba(255,255,255,0.06)", color: hasHtml ? sc : mc }}>{hasHtml ? s.score + "/69" : "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ fontSize: 9, color: mc, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/{page.slug}</div>
                    <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: mc }}>{source}</span>
                    {hasHtml && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 20, background: "rgba(74,222,128,0.12)", color: "#4ADE80" }}>8 links</span>}
                    {isSel && zFilled > 0 && <span style={{ fontSize: 8, color: "#FFC72C" }}>{zFilled}/8</span>}
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasHtml ? (s.pct >= 80 ? "#4ADE80" : s.pct >= 60 ? "#FFC72C" : "#F87171") : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Custom slug inputs */}
          <div style={{ padding: "7px 8px", borderTop: bdr, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: mc, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".05em" }}>Custom page</div>
            <input value={pbNewSlug} onChange={e => setPbNewSlug(e.target.value)} placeholder="page-slug-here" style={{ width: "100%", fontSize: 10, padding: "4px 8px", borderRadius: 20, border: bdr, background: "rgba(255,255,255,0.04)", color: tc, marginBottom: 3, outline: "none", boxSizing: "border-box" }} />
            <input value={pbNewTitle} onChange={e => setPbNewTitle(e.target.value)} placeholder="Page title" style={{ width: "100%", fontSize: 10, padding: "4px 8px", borderRadius: 20, border: bdr, background: "rgba(255,255,255,0.04)", color: tc, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* CENTER: VIEWFINDER */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Zone progress strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "6px 10px", borderBottom: bdr, background: bgp, flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: mc, marginRight: 8, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".06em" }}>Zones</span>
            <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 0 }}>
              {ZONES.map((z, i) => {
                const isApplied = !!pbZoneApplied[z.id];
                const isActive = pbActiveZone === z.id;
                return [
                  <div key={z.id} onClick={() => { setPbActiveZone(z.id); setTimeout(() => { const ifrEl = document.querySelector('iframe[title="Page Preview v4"]'); if (ifrEl?.contentWindow) { ifrEl.contentWindow.postMessage({ type: "gh-pb-zone-scroll", zoneId: z.id }, "*"); } }, 50); }} style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, cursor: "pointer", flexShrink: 0, background: isApplied ? z.color : "transparent", border: "1.5px solid " + (isApplied ? z.color : isActive ? z.color : "rgba(255,255,255,0.15)"), color: isApplied ? "#fff" : isActive ? z.color : mc, transition: "all .15s", boxSizing: "border-box" }}>{z.id.slice(1)}</div>,
                  i < 7 && <div key={z.id + "line"} style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)", minWidth: 2 }} />
                ];
              })}
            </div>
            <span style={{ fontSize: 9, color: mc, marginLeft: 8, whiteSpace: "nowrap" }}>{appliedCount}/8</span>
          </div>

          {/* Viewfinder */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 5, zIndex: 20 }}>
              <button onClick={() => pbPage && pbHandleFetch(pbPage)} disabled={pbFetching || !pbPage} style={{ fontSize: 10, padding: "4px 11px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(15,36,64,0.75)", color: "rgba(255,255,255,0.85)", cursor: (!pbPage || pbFetching) ? "not-allowed" : "pointer", backdropFilter: "blur(4px)", opacity: (!pbPage || pbFetching) ? 0.5 : 1 }}>{pbFetching ? "Fetching..." : "Fetch live"}</button>
              <button onClick={pbHandleGenerate} disabled={pbAiGenerating || (!pbPage && !pbNewSlug)} style={{ fontSize: 10, padding: "4px 14px", borderRadius: 20, border: "none", background: pbAiGenerating ? "#6B7B8D" : "rgba(59,130,246,0.9)", color: "#fff", fontWeight: 600, cursor: (pbAiGenerating || (!pbPage && !pbNewSlug)) ? "not-allowed" : "pointer", opacity: (pbAiGenerating || (!pbPage && !pbNewSlug)) ? 0.6 : 1 }}>{pbAiGenerating ? (pbGenerating || "Generating...") : "▶ Generate"}</button>
            </div>
            <iframe title="Page Preview v4" srcDoc={srcdoc} sandbox="allow-scripts" style={{ width: "100%", height: "100%", border: "none", display: "block" }} />
          </div>

          {/* Finish line */}
          <div style={{ borderTop: bdr, flexShrink: 0, background: bgp, padding: "6px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: mc, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>Finish line</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {[
                { n: 1, label: "Generated", sub: "69 checks", done: finishStep >= 1, active: finishStep === 0 },
                { n: 2, label: "NEPQ zones", sub: appliedCount + "/8 zones", done: finishStep >= 2, active: finishStep === 1 },
                { n: 3, label: "Scan passed", sub: scan ? scan.pct + "%" : "—", done: finishStep >= 3, active: finishStep === 2 },
                { n: 4, label: "Copy for WP", sub: "flatten", done: finishStep >= 4, active: finishStep === 3 },
                { n: 5, label: "Submit", sub: "4 engines", done: false, active: finishStep >= 4 },
              ].map((step, i) => {
                const bg2 = step.done ? "rgba(74,222,128,0.12)" : step.active ? "rgba(75,156,211,0.12)" : "rgba(255,255,255,0.03)";
                const clr = step.done ? "#4ADE80" : step.active ? "#4B9CD3" : mc;
                return [
                  <div key={step.n} onClick={step.n === 4 ? () => pbHandleCopyForWP(pageHtml, pbZoneApplied) : step.n === 5 ? pbHandleSubmit : null} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 3px", borderRadius: 6, background: bg2, cursor: (step.n === 4 || step.n === 5) ? "pointer" : "default" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, background: step.done ? "#4ADE80" : step.active ? "#4B9CD3" : "rgba(255,255,255,0.1)", color: (step.done || step.active) ? "#fff" : mc }}>{step.done ? "✓" : step.n}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: clr, textAlign: "center", lineHeight: 1.2 }}>{step.label}</div>
                    <div style={{ fontSize: 8, color: mc, textAlign: "center" }}>{step.sub}</div>
                  </div>,
                  i < 4 && <div key={"arr" + i} style={{ fontSize: 9, color: mc, padding: "0 2px", flexShrink: 0 }}>→</div>
                ];
              })}
            </div>
            {finishStep >= 4 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, paddingTop: 5, borderTop: bdr }}>
                <span style={{ fontSize: 9, color: mc }}>Submit to:</span>
                {["Google","Bing","Yandex","Seznam"].map(eng => <span key={eng} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "rgba(74,222,128,0.12)", color: "#4ADE80", fontWeight: 600 }}>{eng}</span>)}
                <button onClick={pbHandleSubmit} style={{ marginLeft: "auto", fontSize: 9, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(75,156,211,0.4)", background: "transparent", color: "#4B9CD3", cursor: "pointer" }}>Submit to all 4</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: SCAN + NEPQ */}
        <div style={{ borderLeft: bdr, display: "flex", flexDirection: "column", overflow: "hidden", background: bgp }}>

          {/* Scan panel */}
          <div style={{ borderBottom: bdr, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: mc, textTransform: "uppercase", letterSpacing: ".06em" }}>69-point scan</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {scan && <span style={{ fontSize: 11, fontWeight: 600, color: scan.pct >= 80 ? "#4ADE80" : scan.pct >= 60 ? "#FFC72C" : "#F87171" }}>{scan.score}/{scan.total} · {scan.pct}%</span>}
                <button onClick={() => pbHandleFixAll(pageHtml, scan)} disabled={pbFixing || !pageHtml || !pbApiKey} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(248,113,113,0.4)", background: "transparent", color: "#F87171", cursor: (pbFixing || !pageHtml || !pbApiKey) ? "not-allowed" : "pointer", opacity: (pbFixing || !pageHtml || !pbApiKey) ? 0.4 : 1 }}>{pbFixing ? "Fixing..." : "Fix all"}</button>
              </div>
            </div>
            {scan && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px 6px" }}>
                  <svg width="42" height="42" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
                    <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="21" cy="21" r="17" fill="none" stroke={scan.pct >= 80 ? "#4ADE80" : scan.pct >= 60 ? "#FFC72C" : "#F87171"} strokeWidth="3" strokeDasharray={Math.round(scan.pct / 100 * 107) + " " + Math.round((100 - scan.pct) / 100 * 107)} strokeLinecap="round" transform="rotate(-90 21 21)" />
                    <text x="21" y="26" textAnchor="middle" fontSize="11" fontWeight="600" fill={scan.pct >= 80 ? "#4ADE80" : scan.pct >= 60 ? "#FFC72C" : "#F87171"}>{scan.score}</text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: scan.pct >= 80 ? "#4ADE80" : scan.pct >= 60 ? "#FFC72C" : "#F87171" }}>{scan.pct}%</div>
                    <div style={{ fontSize: 9, color: mc }}>{scan.total - scan.score} failing · {scan.score} passing</div>
                  </div>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", margin: "0 10px 6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: scan.pct + "%", borderRadius: 2, background: scan.pct >= 80 ? "#4ADE80" : scan.pct >= 60 ? "#FFC72C" : "#F87171", transition: "width .3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 10px 2px" }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600, color: "#F87171" }}>Failing</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#F87171" }}>{scan.total - scan.score}</span>
                </div>
                <div style={{ maxHeight: 175, overflowY: "auto" }}>
                  {CAT_ORDER.map(cat => {
                    const catChecks = groupedChecks[cat];
                    if (!catChecks?.length) return null;
                    const catPassed = catChecks.filter(c => c.pass).length;
                    const allPass = catPassed === catChecks.length;
                    return (
                      <div key={cat} style={{ padding: "3px 10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: catChecks[0].catColor }}>{cat}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, color: allPass ? "#4ADE80" : catChecks[0].catColor }}>{catPassed}/{catChecks.length}</span>
                        </div>
                        {allPass
                          ? <div style={{ height: 3, borderRadius: 2, background: "rgba(74,222,128,0.3)", margin: "2px 0 4px" }} />
                          : catChecks.map(c => (
                              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 10, width: 12, flexShrink: 0, color: c.pass ? "#4ADE80" : "#F87171" }}>{c.pass ? "✓" : "✗"}</span>
                                <span style={{ fontSize: 9, flex: 1, lineHeight: 1.3, color: c.pass ? mc : tc, fontWeight: c.pass ? 400 : 500 }}>{c.label}</span>
                              </div>
                            ))
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {!scan && <div style={{ padding: "12px 10px", fontSize: 11, color: mc, textAlign: "center" }}>Generate or fetch a page to run the scan.</div>}
          </div>

          {/* NEPQ cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "7px 10px 0", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: mc, textTransform: "uppercase", letterSpacing: ".06em" }}>NEPQ cards</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "5px 8px 0", flexShrink: 0 }}>
              {["SEED","WATER","HARVEST"].map((tag, i) => {
                const isDoneT = Object.values(pbZoneApplied).some(v => v.tag === tag);
                const isActiveT = pbSelectedCard?.tag === tag;
                return [
                  <div key={tag} style={{ flex: 1, textAlign: "center", padding: "3px 2px", borderRadius: 4, background: isDoneT ? "rgba(74,222,128,0.12)" : isActiveT ? "rgba(75,156,211,0.12)" : "transparent" }}>
                    <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: isDoneT ? "#4ADE80" : isActiveT ? "#4B9CD3" : mc }}>{tag}</div>
                  </div>,
                  i < 2 && <div key={"a" + i} style={{ fontSize: 9, color: mc, padding: "0 2px", flexShrink: 0 }}>→</div>
                ];
              })}
            </div>
            <div style={{ display: "flex", gap: 3, padding: "5px 7px", borderBottom: bdr, flexShrink: 0 }}>
              {[["medicare","Medicare"],["aca","ACA"],["nepq","NEPQ sequence"]].map(([t, label]) => (
                <button key={t} onClick={() => setPbActiveTab(t)} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, cursor: "pointer", color: pbActiveTab === t ? "#4B9CD3" : mc, border: "0.5px solid " + (pbActiveTab === t ? "rgba(75,156,211,0.4)" : "transparent"), background: pbActiveTab === t ? "rgba(75,156,211,0.1)" : "transparent" }}>{label}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "5px 7px", display: "flex", flexDirection: "column", gap: 4 }}>
              {tabCards.map(card => {
                const isApplied = Object.values(pbZoneApplied).some(v => v.q === card.q && v.tag === card.tag);
                const appliedZone = isApplied ? Object.entries(pbZoneApplied).find(([, v]) => v.q === card.q && v.tag === card.tag)?.[0] : null;
                const isSel = pbSelectedCard?.id === card.id;
                const canApply = !!pbActiveZone && !isApplied;
                return (
                  <div key={card.id} onClick={() => { if (canApply) pbHandleApplyCard(card, pbActiveZone, pbZoneApplied); else if (!isApplied) setPbSelectedCard(card); }}
                    style={{ border: "0.5px solid " + (isSel ? "rgba(75,156,211,0.4)" : isApplied ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.08)"), borderRadius: 6, padding: "6px 8px", cursor: isApplied ? "default" : "pointer", opacity: isApplied ? 0.45 : 1, background: isSel ? "rgba(75,156,211,0.08)" : isApplied ? "rgba(74,222,128,0.05)" : "transparent", transition: "all .1s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 1 }}>
                      <span style={{ fontSize: 8, fontWeight: 600, color: "#4ADE80", textTransform: "uppercase", letterSpacing: ".06em" }}>{card.tag}</span>
                      {isApplied && appliedZone && <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 20, fontWeight: 600, background: "rgba(74,222,128,0.12)", color: "#4ADE80" }}>{appliedZone.replace("z", "Zone ")}</span>}
                    </div>
                    <div style={{ fontSize: 8, color: mc, marginBottom: 2 }}>{card.tagline}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: tc, lineHeight: 1.3, marginBottom: 2 }}>{card.q}</div>
                    <div style={{ fontSize: 9, color: mc, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{card.a}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "6px 8px", borderTop: bdr, flexShrink: 0 }}>
              {pbActiveZone
                ? <button onClick={() => { if (pbSelectedCard) pbHandleApplyCard(pbSelectedCard, pbActiveZone, pbZoneApplied); }} disabled={!pbSelectedCard} style={{ width: "100%", fontSize: 10, padding: "5px", borderRadius: 20, border: "0.5px solid rgba(75,156,211,0.4)", background: pbSelectedCard ? "rgba(75,156,211,0.1)" : "transparent", color: pbSelectedCard ? "#4B9CD3" : mc, cursor: pbSelectedCard ? "pointer" : "default", textAlign: "center" }}>
                    {pbSelectedCard ? "Assign " + pbSelectedCard.tag + " → " + pbActiveZone.replace("z", "Zone ") : "Select a card above"}
                  </button>
                : <div style={{ textAlign: "center", fontSize: 10, color: mc, padding: "3px 0" }}>Click a zone to activate it</div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
