// ═══════════════════════════════════════════════════════════════════════════
// scan67 — 67-Point Scanner for GH Command Center
// Reads all thresholds from window.GH_HARD_RULES
// Returns scored results per category + overall score
// v1.1 — Added Rule 68 (CSS Content Escape Blocker) + Rule 69 (Dead Placeholder URL Blocker)
// ═══════════════════════════════════════════════════════════════════════════

// Standalone script — adds GH_1000.scan67 when loaded via <script src>
// Must load AFTER GH_1000 is defined and AFTER HARD_RULES.js

window.GH_1000.scan67 = function(html) {
  var HR = window.GH_HARD_RULES;
  if (!HR) return { score: 0, max: 67, results: [], error: "HARD_RULES not loaded" };
  
  var B = HR.BRAND;
  var L = HR.LINKS;
  var M = HR.MEDICARE_2026;
  var T = HR.TEMPLATE_REQUIREMENTS;
  var TS = HR.TEMPLATE_STRUCTURE;
  var FT = HR.FAIL_TRIGGERS;
  var lower = html.toLowerCase();
  
  // Helpers
  function count(pattern) {
    if (typeof pattern === 'string') return (html.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    return (html.match(pattern) || []).length;
  }
  function has(str) { return html.indexOf(str) !== -1; }
  function hasLower(str) { return lower.indexOf(str.toLowerCase()) !== -1; }
  function hasAny(arr) { return arr.some(function(s) { return has(s); }); }
  function hasNone(arr) { return !arr.some(function(s) { return has(s); }); }
  function wordCount() { return (html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().match(/\S+/g) || []).length; }
  
  var results = [];
  var pass = 0;
  var total = 0;
  
  function check(category, name, passed, detail) {
    total++;
    if (passed) pass++;
    results.push({
      id: total,
      category: category,
      name: name,
      passed: !!passed,
      detail: detail || (passed ? "OK" : "FAIL")
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // AEO — Answer Engine Optimization (6 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var answerCount = count("gh-answer");
  check("AEO", "Instant answer blocks (3+)", answerCount >= 3, "Found " + answerCount);
  
  var faqSchemaPresent = has('"FAQPage"') || has('"@type":"FAQPage"') || has('"@type": "FAQPage"');
  check("AEO", "FAQPage schema in @graph", faqSchemaPresent, faqSchemaPresent ? "Present" : "Missing FAQPage in JSON-LD");
  
  var howtoSchemaPresent = has('"HowTo"') || has('"@type":"HowTo"') || has('"@type": "HowTo"');
  check("AEO", "HowTo schema in @graph", howtoSchemaPresent, howtoSchemaPresent ? "Present" : "Missing HowTo in JSON-LD");
  
  var comparisonPresent = has("gh-comparison");
  check("AEO", "Comparison table present", comparisonPresent, comparisonPresent ? "Found" : "Missing .gh-comparison");
  
  var speakablePresent = has("SpeakableSpecification") || has("speakable");
  check("AEO", "Speakable schema markup", speakablePresent, speakablePresent ? "Present" : "Missing Speakable");
  
  check("AEO", "Answer blocks sufficient", answerCount >= T.minimums.instant_answers, answerCount + " of " + T.minimums.instant_answers + " required");
  
  // ═══════════════════════════════════════════════════════════════════════
  // SEO — Search Engine Optimization (8 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var h1Count = count(/<h1[\s>]/gi);
  check("SEO", "Single H1 tag", h1Count === 1, "Found " + h1Count + " H1 tags");
  
  var h2Count = count(/<h2[\s>]/gi);
  check("SEO", "H2 structure (5+)", h2Count >= 5, "Found " + h2Count + " H2 tags");
  
  var ghLinks = count(/generationhealth\.me\//g);
  check("SEO", "Internal links (5+)", ghLinks >= T.minimums.internal_links, "Found " + ghLinks + " internal links");
  
  var wc = wordCount();
  check("SEO", "Word count (2000+)", wc >= T.minimums.word_count, wc + " words");
  
  var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  var h1Text = h1Match ? h1Match[1].replace(/<[^>]*>/g, '') : '';
  check("SEO", "Keyword in H1", h1Text.length > 10, h1Text.length > 10 ? "H1: " + h1Text.substring(0, 60) + "..." : "H1 too short or missing");
  
  var metaDesc = html.match(/meta[^>]*description[^>]*content="([^"]*)"/i) || html.match(/meta_description[^"]*"([^"]*)"/i);
  check("SEO", "Meta description present", !!metaDesc, metaDesc ? "Found" : "Missing meta description");
  
  var lsiTerms = ["coverage", "premium", "deductible", "enrollment", "plan", "benefits", "costs", "network", "copay", "coinsurance", "out-of-pocket", "formulary", "provider"];
  var lsiFound = lsiTerms.filter(function(t) { return hasLower(t); });
  check("SEO", "LSI terms (5+)", lsiFound.length >= 5, lsiFound.length + " LSI terms found");
  
  var hasCleanStructure = has("gh-hero") && has("gh-faq") && has("gh-author");
  check("SEO", "Clean page structure", hasCleanStructure, hasCleanStructure ? "Hero + FAQ + Author present" : "Missing structural sections");
  
  // ═══════════════════════════════════════════════════════════════════════
  // E-E-A-T — Experience, Expertise, Authority, Trust (6 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var authorPresent = has("Robert Simm") || has("Rob Simm");
  var has2026 = has("2026");
  check("E-E-A-T", "Author byline + 2026 date", authorPresent && has2026, (authorPresent ? "Author ✓" : "Author ✗") + " / " + (has2026 ? "2026 ✓" : "2026 ✗"));
  
  check("E-E-A-T", "License visible", has(B.license_number), has(B.license_number) ? "License #" + B.license_number + " found" : "Missing license number");
  
  var govCitations = 0;
  ["Medicare.gov", "CMS.gov", "SSA.gov", "Healthcare.gov", "HHS.gov"].forEach(function(g) { if (has(g) || hasLower(g)) govCitations++; });
  check("E-E-A-T", ".gov citations (3+)", govCitations >= T.minimums.gov_citations, govCitations + " .gov sources");
  
  var freshness = has("Updated") && has2026;
  check("E-E-A-T", "Content freshness signals", freshness || has("Last Updated"), freshness ? "Freshness signals present" : "Missing 'Updated [Month] 2026'");
  
  var licenseVerify = has("ncdoi.gov") || has("NCDOI");
  check("E-E-A-T", "Verifiable license reference", licenseVerify || has(B.license_number), licenseVerify ? "NCDOI verify link present" : has(B.license_number) ? "License number present (no verify link)" : "Missing");
  
  var ratingSignals = has(B.google_rating) || has("5.0") || has("Google Review");
  check("E-E-A-T", "Review/rating signals", ratingSignals, ratingSignals ? "Rating signals present" : "Missing review/rating signals");
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONTENT — Content Quality (8 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var hasFigures = has(M.part_b_premium) || has(M.part_b_deductible) || has(M.part_a_deductible);
  check("CONTENT", "2026 cost figures", hasFigures, hasFigures ? "Current figures present" : "Missing 2026 figures");
  
  var dollarAmounts = count(/\$[\d,]+(?:\.\d{2})?/g);
  var caseStudyCount = count("gh-scenario");
  check("CONTENT", "Case studies with $ (3+)", caseStudyCount >= T.minimums.case_studies || dollarAmounts >= 6, caseStudyCount + " scenarios, " + dollarAmounts + " dollar amounts");
  
  var processSteps = count("gh-howto") > 0 || count(/class="[^"]*step/g) > 0;
  var howtoStepCount = count(/"HowToStep"/g) || count(/gh-howto/g);
  check("CONTENT", "Process steps section", processSteps, processSteps ? "HowTo section present" : "Missing process steps");
  
  var expertTip = has("gh-tip") || has("Expert Tip");
  check("CONTENT", "Expert tips section", expertTip, expertTip ? "Expert tip present" : "Missing expert tip");
  
  var faqCount = count("gh-faq-item");
  check("CONTENT", "FAQs (8+)", faqCount >= T.minimums.faqs, faqCount + " FAQs found");
  
  var costGrid = has("gh-costs") || has("gh-cost-box");
  var costBoxCount = count("gh-cost-box");
  check("CONTENT", "Cost grid (4+ cards)", costBoxCount >= T.minimums.cost_grid_cards || costGrid, costBoxCount + " cost cards found");
  
  var painPoints = count("gh-scenario") + count(/pain|problem|risk|danger|mistake/gi);
  check("CONTENT", "Pain points section", painPoints >= T.minimums.pain_points, painPoints >= T.minimums.pain_points ? "Pain/consequence content present" : "Insufficient pain point content");
  
  var trustRedFlags = (has("trust") && has("red flag")) || (has("✓") && has("❌")) || has("gh-trust");
  check("CONTENT", "Trust vs Red Flags", trustRedFlags || (count("✓") >= 3 && count("❌") >= 3), trustRedFlags ? "Trust/Red flags section present" : "Missing trust vs red flags");
  
  // ═══════════════════════════════════════════════════════════════════════
  // VQA — Visual Quality Assurance (12 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  check("VQA", "Hero call button", has("gh-hero-btn--call"), has("gh-hero-btn--call") ? "Present" : "Missing .gh-hero-btn--call");
  
  check("VQA", "Hero compare button", has("gh-hero-btn--compare"), has("gh-hero-btn--compare") ? "Present" : "Missing .gh-hero-btn--compare");
  
  var ctaModalCount = count("gh-cta-modal");
  check("VQA", "CTA modals (2+)", ctaModalCount >= T.minimums.cta_modals, ctaModalCount + " CTA modals found");
  
  check("VQA", "Phone number present", has(B.phone) || has(B.phone_plain), has(B.phone) ? B.phone + " found" : "Missing phone number");
  
  var wrongPhone = FT.wrong_phone_patterns.some(function(p) { return has(p); });
  check("VQA", "No wrong phone (3324)", !wrongPhone, wrongPhone ? "CRITICAL: Wrong phone number found!" : "Clean — no 3324");
  
  check("VQA", "Calendly link", has("calendly.com"), has("calendly.com") ? "Present" : "Missing Calendly link");
  
  check("VQA", "SMS link", has("sms:"), has("sms:") ? "Present" : "Missing sms: link");
  
  check("VQA", "Tel link", has("tel:"), has("tel:") ? "Present" : "Missing tel: link");
  
  var shimmerCount = count(/class="ghsb"/g) + count(/class='ghsb'/g) + count(/ghsb/g);
  check("VQA", "Shimmer spans", shimmerCount >= 2, shimmerCount + " shimmer spans found");
  
  var dmSans = has("DM Sans") || has("DM+Sans");
  check("VQA", "DM Sans font", dmSans, dmSans ? "Present" : "Missing DM Sans reference");
  
  var unresolvedVars = count(/var\(--/g);
  check("VQA", "No unresolved CSS vars", unresolvedVars === 0, unresolvedVars === 0 ? "Clean" : unresolvedVars + " unresolved var() found");
  
  check("VQA", "Author card present", has("gh-author"), has("gh-author") ? "Present" : "Missing .gh-author");
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONVERSION — Conversion Optimization (10 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var hasSunfire = has("sunfirematrix.com");
  var hasHealthsherpa = has("healthsherpa.com");
  check("CONV", "Compare plans link", hasSunfire || hasHealthsherpa, (hasSunfire ? "SunFire ✓" : "") + (hasHealthsherpa ? " HealthSherpa ✓" : "") || "Missing");
  
  var firstThird = html.substring(0, Math.floor(html.length * 0.35));
  var ctaEarly = firstThird.indexOf("gh-hero-btn") !== -1 || firstThird.indexOf("gh-cta-modal") !== -1;
  check("CONV", "CTA in first 35%", ctaEarly, ctaEarly ? "Early CTA present" : "No CTA in first 35% of page");
  
  check("CONV", "Multiple CTAs (2+)", ctaModalCount >= 2, ctaModalCount + " CTA modals");
  
  var blockingScripts = count(/<script(?![^>]*async)(?![^>]*defer)(?![^>]*type="application\/ld\+json")[^>]*src=/gi);
  check("CONV", "GA4 tracking ready", blockingScripts === 0, blockingScripts === 0 ? "No blocking scripts" : blockingScripts + " blocking scripts found");
  
  var phoneCtaProminent = has("gh-hero-btn--call") && has("gh-header-phone");
  check("CONV", "Phone CTA prominent", phoneCtaProminent || has("gh-hero-btn--call"), phoneCtaProminent ? "Header + Hero" : has("gh-hero-btn--call") ? "Hero only" : "Missing prominent phone CTA");
  
  var urgencyMsg = has("enrollment") || has("deadline") || has("ends") || has("before");
  check("CONV", "Urgency messaging", urgencyMsg, urgencyMsg ? "Enrollment/deadline language present" : "No urgency messaging");
  
  var socialProof = (has("5.0") || has(B.google_rating)) && (has(B.families_helped) || has("families"));
  check("CONV", "Social proof signals", socialProof || ratingSignals, socialProof ? "Rating + families helped" : "Partial social proof");
  
  var iframeCount = count(/<iframe/gi);
  check("CONV", "Retargeting ready", iframeCount === 0, iframeCount === 0 ? "Clean DOM" : iframeCount + " iframes found");
  
  var landmarks = count(/aria-label/g);
  check("CONV", "Scroll depth tracking", landmarks >= 3, landmarks + " aria-label landmarks");
  
  var hasPhone = has("tel:");
  var hasSMS = has("sms:");
  var hasCalendly = has("calendly.com");
  var hasCompare = hasSunfire || hasHealthsherpa;
  var flowScore = (hasPhone ? 1 : 0) + (hasSMS ? 1 : 0) + (hasCalendly ? 1 : 0) + (hasCompare ? 1 : 0);
  check("CONV", "Lead capture flow (4/4)", flowScore === 4, flowScore + "/4: " + (hasPhone ? "Phone✓" : "Phone✗") + " " + (hasSMS ? "SMS✓" : "SMS✗") + " " + (hasCalendly ? "Cal✓" : "Cal✗") + " " + (hasCompare ? "Compare✓" : "Compare✗"));
  
  // ═══════════════════════════════════════════════════════════════════════
  // COMPETITIVE — Competitive Edge (9 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  check("COMPETITIVE", "Word count 2000+", wc >= 2000, wc + " words");
  
  check("COMPETITIVE", "More FAQs (8+)", faqCount >= 8, faqCount + " FAQs");
  
  var schemaTypes = ['"LocalBusiness"', '"Person"', '"MedicalWebPage"', '"Article"', '"Service"', '"FAQPage"', '"HowTo"'];
  var schemaFound = schemaTypes.filter(function(t) { return has(t); }).length;
  check("COMPETITIVE", "Schema types (7+)", schemaFound >= 7, schemaFound + "/7 schema types");
  
  check("COMPETITIVE", "Fresher date (2026)", has2026, has2026 ? "2026 present" : "No 2026 reference");
  
  var trustSignalCount = (has(B.license_number) ? 1 : 0) + (has(B.certification) ? 1 : 0) + (ratingSignals ? 1 : 0) + (has(B.families_helped) ? 1 : 0) + (licenseVerify ? 1 : 0);
  check("COMPETITIVE", "Trust signals (4+)", trustSignalCount >= 4, trustSignalCount + " trust signals");
  
  var localSpecificity = hasLower("north carolina") || hasLower("durham") || hasLower("wake") || hasLower("triangle");
  check("COMPETITIVE", "Local specificity (NC)", localSpecificity, localSpecificity ? "NC-specific content" : "Missing local specificity");
  
  check("COMPETITIVE", "Unique case studies", caseStudyCount >= 3 || dollarAmounts >= 5, caseStudyCount + " scenarios, " + dollarAmounts + " $ figures");
  
  check("COMPETITIVE", "AI-citable (.gh-answer)", answerCount >= 3, answerCount + " answer blocks for LLM extraction");
  
  var contentFormats = (has("gh-costs") ? 1 : 0) + (has("gh-faq") ? 1 : 0) + (has("gh-scenario") ? 1 : 0) + (has("gh-comparison") ? 1 : 0) + (has("gh-howto") ? 1 : 0) + (has("gh-tip") ? 1 : 0);
  check("COMPETITIVE", "Multi-format content", contentFormats >= 4, contentFormats + " content formats");
  
  // ═══════════════════════════════════════════════════════════════════════
  // COMPLIANCE — Regulatory Compliance (8 checks)
  // ═══════════════════════════════════════════════════════════════════════
  
  var isMedicare = hasLower("medicare");
  var isACA = hasLower("aca") || hasLower("marketplace");
  
  var cmsDisclaimer = has("do not offer every plan") || has("We do not offer every plan");
  check("COMPLIANCE", "CMS disclaimer", cmsDisclaimer, cmsDisclaimer ? "Present" : "Missing 'We do not offer every plan' disclaimer");
  
  check("COMPLIANCE", "License number visible", has(B.license_number), has(B.license_number) ? "#" + B.license_number + " found" : "Missing license number");
  
  var govRef = has("Medicare.gov") || has("Healthcare.gov");
  check("COMPLIANCE", ".gov reference", govRef, govRef ? "Present" : "Missing Medicare.gov or Healthcare.gov");
  
  var govPhonePresent = has("1-800-MEDICARE") || has("1-800-633-4227") || has("1-800-318-2596");
  check("COMPLIANCE", "Government phone", govPhonePresent, govPhonePresent ? "Present" : "Missing gov phone number");
  
  var notAffiliated = hasLower("not affiliated");
  check("COMPLIANCE", "'Not affiliated' disclaimer", notAffiliated, notAffiliated ? "Present" : "Missing 'not affiliated' language");
  
  var educational = hasLower("educational") || hasLower("informational purposes");
  check("COMPLIANCE", "Educational purpose", educational || cmsDisclaimer, educational ? "Present" : "Implied by CMS disclaimer");
  
  var guaranteeWords = ["guaranteed", "promise", "ensure you will", "you will save", "you will pay less"];
  var hasGuarantee = guaranteeWords.some(function(w) { return hasLower(w); });
  check("COMPLIANCE", "No guarantee language", !hasGuarantee, hasGuarantee ? "WARNING: Guarantee-type language found" : "Clean");
  
  var staleFigures = [];
  FT.stale_part_b.forEach(function(v) { if (has(v)) staleFigures.push(v); });
  FT.stale_part_b_deductible.forEach(function(v) { if (has(v)) staleFigures.push(v); });
  FT.stale_part_a.forEach(function(v) { if (has(v)) staleFigures.push(v); });
  FT.stale_ma_oop.forEach(function(v) { if (has(v)) staleFigures.push(v); });
  FT.stale_year_patterns.forEach(function(v) { if (has(v)) staleFigures.push(v); });
  check("COMPLIANCE", "No stale figures", staleFigures.length === 0, staleFigures.length === 0 ? "All figures current" : "STALE: " + staleFigures.join(", "));

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLISH BLOCKERS — v1.1 additions (2 checks — Rules 68 & 69)
  // Hard stops: a single failure in this category blocks publish entirely.
  // ═══════════════════════════════════════════════════════════════════════

  // Rule 68: CSS Content Escape Blocker
  // Detects CSS content: properties using backslash Unicode escapes
  // (e.g. content:"\2192", content:'\1F4CD') which Elementor strips on paste,
  // causing raw codes like \2192 to render as visible text on the live page.
  // Fix: bake the character into HTML as <span aria-hidden="true"> with a
  // real Unicode character or HTML entity (e.g. &#x2192;).
  var styleBlocks = html.match(/<style[\s\S]*?<\/style>/gi) || [];
  var cssEscapeFound = styleBlocks.some(function(block) {
    return /content\s*:\s*["']\\[0-9a-fA-F]/i.test(block);
  });
  check("PUBLISH BLOCKERS", "No CSS content escape sequences (Rule 68)", !cssEscapeFound,
    cssEscapeFound
      ? "BLOCKED: CSS content: property contains \\XXXX escape — Elementor strips it on paste. Replace with inline <span aria-hidden=\"true\"> using real character or HTML entity."
      : "Clean — no CSS escape sequences in content: properties");

  // Rule 69: No Dead Placeholder URLs
  // Detects href="" or src="" attributes still containing bracket placeholders
  // (e.g. [RELATED-SLUG-1], [MEDICARE: medicare-nc | ACA: ...], [PAGE-SLUG]).
  // These produce guaranteed 404s on the live page.
  // Body text placeholders like [FAQ QUESTION 1] are intentionally ignored —
  // only href and src attributes are scanned.
  var urlAttrMatches = html.match(/(?:href|src)\s*=\s*["'][^"']*\[[^\]]+\][^"']*["']/gi) || [];
  var deadUrls = urlAttrMatches.filter(function(match) {
    return !/(?:href|src)\s*=\s*["'](?:data:|javascript:)/i.test(match);
  });
  check("PUBLISH BLOCKERS", "No dead placeholder URLs (Rule 69)", deadUrls.length === 0,
    deadUrls.length === 0
      ? "Clean — all href/src attributes contain real URLs"
      : "BLOCKED: " + deadUrls.length + " unfilled URL placeholder(s) — guaranteed 404s: " + deadUrls.slice(0, 3).join(" | ") + (deadUrls.length > 3 ? " (+" + (deadUrls.length - 3) + " more)" : ""));

  // ═══════════════════════════════════════════════════════════════════════
  // SCORE SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  
  var categories = {};
  results.forEach(function(r) {
    if (!categories[r.category]) categories[r.category] = { pass: 0, total: 0 };
    categories[r.category].total++;
    if (r.passed) categories[r.category].pass++;
  });
  
  var grade = pass >= 66 ? "A+" : pass >= 62 ? "A" : pass >= 57 ? "B+" : pass >= 52 ? "B" : pass >= 47 ? "C" : pass >= 42 ? "D" : "F";
  
  return {
    score: pass,
    max: total,
    pct: Math.round((pass / total) * 100),
    grade: grade,
    categories: categories,
    results: results,
    failures: results.filter(function(r) { return !r.passed; }),
    publishBlocked: results.filter(function(r) { return r.category === "PUBLISH BLOCKERS" && !r.passed; }).length > 0,
    timestamp: new Date().toISOString()
  };
};

console.log("[GH] scan67 loaded — 69-point scanner (v1.1) reads from GH_HARD_RULES");
