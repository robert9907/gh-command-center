// ═══════════════════════════════════════════════════════════════════════════
// buildSystemPrompt-v2.js — Replaces GH_1000.buildSystemPrompt
// Reads everything from window.GH_HARD_RULES. Zero hardcoded figures.
// v2.1 — Added HARD REQUIREMENTS enforcement block for 67/67 compliance
// ═══════════════════════════════════════════════════════════════════════════

window.GH_1000.buildSystemPrompt = function(pageType) {
  var HR = window.GH_HARD_RULES;
  if (!HR) { console.error("[buildSystemPrompt-v2] GH_HARD_RULES not loaded"); return "Error: HARD_RULES not loaded."; }
  
  var B = HR.BRAND;
  var L = HR.LINKS;
  var M = HR.MEDICARE_2026;
  var A = HR.ACA_2026;
  var C = HR.COMPLIANCE;
  var N = HR.NEPQ;
  var T = HR.TEMPLATE_REQUIREMENTS;
  var TS = HR.TEMPLATE_STRUCTURE;
  var PT = HR.PAGE_TYPES;
  var ep = window.getCurrentEnrollmentPeriod ? window.getCurrentEnrollmentPeriod() : { period: { name: "Year-round" }, urgency: "low" };
  
  // Resolve page-type-specific values
  var typeRules = PT.type_rules[pageType] || PT.type_rules.medicare;
  var ctaLink = typeRules.cta_link ? L[typeRules.cta_link] : L.sunfire;
  var ctaLinks = typeRules.cta_links ? typeRules.cta_links.map(function(k) { return L[k]; }) : [ctaLink];
  var disclaimer = C[typeRules.disclaimer] || C.medicare_disclaimer;
  var govSources = typeRules.gov_sources || ["Medicare.gov", "CMS.gov", "SSA.gov"];
  var govPhone = typeRules.gov_phone || "1-800-MEDICARE";
  
  // Minimums with fallback defaults
  var minAnswers = T.minimums.instant_answers || 3;
  var minFaqs = T.minimums.faqs || 8;
  var minSteps = T.minimums.process_steps || 5;
  var minLinks = T.minimums.internal_links || 5;
  var minWords = T.minimums.word_count || 2000;
  var minGov = T.minimums.gov_citations || 3;
  var minCases = T.minimums.case_studies || 3;
  var minCards = T.minimums.cost_grid_cards || 6;
  var minPains = T.minimums.pain_points || 3;
  var minTrust = T.minimums.trust_items || 4;
  var minModals = T.minimums.cta_modals || 2;

  // Build the 67-point checklist string
  var checklist = [
    "",
    "═══ 67-POINT CHECKLIST — YOUR OUTPUT MUST PASS ALL OF THESE ═══",
    "",
    "AEO (6 checks):",
    "  □ Instant answer block (.gh-answer) — " + minAnswers + "+ blocks",
    "  □ FAQ schema (FAQPage in @graph) — " + minFaqs + "+ questions",
    "  □ HowTo schema with " + minSteps + "+ steps",
    "  □ Comparison table (.gh-comparison) present",
    "  □ Speakable schema markup on .gh-answer and .gh-faq-a",
    "  □ " + minAnswers + "+ answer boxes total",
    "",
    "SEO (8 checks):",
    "  □ Single H1 with primary keyword",
    "  □ H2 structure (5+ headings)",
    "  □ Internal links (" + minLinks + "+) to generationhealth.me pages",
    "  □ Word count " + minWords + "+",
    "  □ Keyword naturally in H1",
    "  □ Meta description present",
    "  □ LSI terms (5+ related terms)",
    "  □ Clean URL structure",
    "",
    "E-E-A-T (6 checks):",
    "  □ Author byline: " + B.name + " + 2026 date",
    "  □ License " + B.license + " visible",
    "  □ .gov citations (" + minGov + "+): " + govSources.join(", "),
    "  □ Content freshness signals (Updated [Month] 2026)",
    "  □ Verifiable license reference with NCDOI link",
    "  □ Review/rating signals (5.0 stars, " + B.review_count + " reviews)",
    "",
    "CONTENT (8 checks):",
    "  □ 2026 cost figures throughout (see EXACT FIGURES below)",
    "  □ Case studies with $ amounts (" + minCases + "+)",
    "  □ Process steps section (" + minSteps + "+ steps)",
    "  □ Expert tips section (first person, from Rob)",
    "  □ FAQs (" + minFaqs + "+ questions)",
    "  □ Visual elements (cost grid with " + minCards + " cards)",
    "  □ Pain points section (" + minPains + "+ consequence items)",
    "  □ Trust vs Red Flags (" + minTrust + "+ each)",
    "",
    "VQA (12 checks):",
    "  □ Hero Call button (.gh-hero-btn--call) with tel:" + B.phone_plain,
    "  □ Hero Compare button (.gh-hero-btn--compare) with correct CTA link",
    "  □ CTA modals (" + minModals + "+) with .gh-cta-modal class",
    "  □ Phone " + B.phone + " present",
    "  □ NO old 3324 number anywhere",
    "  □ Calendly link: " + L.calendly,
    "  □ SMS link: " + B.phone_sms,
    "  □ Tel link: " + B.phone_tel,
    "  □ Shimmer animation spans (.ghsb) on CTA buttons",
    "  □ DM Sans font reference",
    "  □ No unresolved CSS variables",
    "  □ Author card section (.gh-author)",
    "",
    "CONVERSION (10 checks):",
    "  □ SunFire or HealthSherpa link (page-type dependent)",
    "  □ CTA in first 35% of page",
    "  □ Multiple CTAs (" + minModals + "+)",
    "  □ GA4 tracking ready (no blocking scripts)",
    "  □ Phone CTA prominent",
    "  □ Urgency messaging (enrollment period context)",
    "  □ Social proof signals (rating, review count, families helped)",
    "  □ Retargeting ready (clean DOM, no interference)",
    "  □ Scroll depth tracking ready",
    "  □ Lead capture flow (phone → text → calendly → compare)",
    "",
    "COMPETITIVE (9 checks):",
    "  □ Word count " + minWords + "+",
    "  □ More FAQs than competitors (" + minFaqs + "+)",
    "  □ Better schema markup (7 types in @graph)",
    "  □ Fresher date (2026)",
    "  □ More trust signals than competitors",
    "  □ Local specificity (NC counties, Triangle region)",
    "  □ Unique case studies with real $ amounts",
    "  □ AI-citable edge (.gh-answer blocks for LLM extraction)",
    "  □ Multi-format content (prose + grid + cards + table + FAQ)",
    "",
    "COMPLIANCE (8 checks):",
    "  □ CMS disclaimer: \"" + disclaimer.substring(0, 60) + "...\"",
    "  □ License number " + B.license_number + " visible",
    "  □ " + govSources[0] + " reference",
    "  □ " + govPhone + " reference",
    "  □ 'Not affiliated' disclaimer",
    "  □ Educational purpose clear",
    "  □ No guarantee language",
    "  □ No stale 2024/2025 figures"
  ].join("\n");

  // Build section order string
  var sectionOrder = TS.section_order.map(function(s, i) { return "  " + (i + 1) + ". " + s; }).join("\n");

  // ═══ HARD REQUIREMENTS ENFORCEMENT BLOCK ═══
  var hardRequirements = [
    "",
    "╔══════════════════════════════════════════════════════════════════╗",
    "║  NON-NEGOTIABLE REQUIREMENTS — OMITTING ANY = AUTOMATIC FAIL  ║",
    "╚══════════════════════════════════════════════════════════════════╝",
    "",
    "These 7 items are the most commonly missed. Your output will be",
    "rejected and regenerated if ANY of these are missing or below minimum.",
    "",
    "1. INSTANT ANSWERS — Generate EXACTLY " + minAnswers + " or more objects in the",
    "   \"instant_answers\" array. Each must have label, text (2-4 sentences",
    "   with a 2026 figure), and source (.gov citation). These become",
    "   .gh-answer blocks that AI models extract for citations.",
    "   MINIMUM: " + minAnswers + " items. DO NOT generate fewer.",
    "",
    "2. FAQ QUESTIONS — Generate EXACTLY " + minFaqs + " or more objects in the",
    "   \"faq\" array. Each must have question, answer (2-3 sentences),",
    "   and schema_answer (concise version for JSON-LD).",
    "   MINIMUM: " + minFaqs + " items. DO NOT generate fewer.",
    "",
    "3. HOWTO STEPS — The \"howto_steps\" object MUST be populated with",
    "   a name (\"How to [action]\"), description, and a \"steps\" array",
    "   containing " + minSteps + "+ step objects. Each step needs name and text.",
    "   This generates HowTo JSON-LD schema. NEVER omit or leave empty.",
    "   MINIMUM: " + minSteps + " steps. DO NOT generate fewer.",
    "",
    "4. COMPARISON TABLE — The \"comparison_table\" object MUST be fully",
    "   populated with title, subtitle, column_headers (3 columns),",
    "   rows (5+ data rows), winner, and footnote.",
    "   NEVER return null, empty, or skip this field.",
    "",
    "5. PROCESS STEPS — The \"process_steps\" array MUST contain " + minSteps + "+",
    "   objects. Each needs number, title, description, and time estimate.",
    "   This is SEPARATE from howto_steps — process_steps renders as a",
    "   visual numbered section, howto_steps generates schema.",
    "   MINIMUM: " + minSteps + " items. DO NOT generate fewer.",
    "",
    "6. AI-CITABLE STRUCTURE — Between instant_answers (" + minAnswers + "+),",
    "   faq (" + minFaqs + "+), and the comparison_table, your output must",
    "   provide at least " + (minAnswers + 3) + " distinct citable blocks that AI",
    "   models can extract and attribute to GenerationHealth.me.",
    "",
    "7. CASE STUDIES — The \"case_studies\" array MUST contain " + minCases + "+",
    "   objects with real dollar amounts in dollar_amount field.",
    "   MINIMUM: " + minCases + " items. DO NOT generate fewer.",
    "",
    "SELF-CHECK BEFORE OUTPUTTING:",
    "  instant_answers.length >= " + minAnswers + "? ___",
    "  faq.length >= " + minFaqs + "? ___",
    "  howto_steps.steps.length >= " + minSteps + "? ___",
    "  comparison_table populated (not null)? ___",
    "  process_steps.length >= " + minSteps + "? ___",
    "  case_studies.length >= " + minCases + "? ___",
    "If ANY answer is NO, fix it before outputting.",
    ""
  ].join("\n");

  // Build the full prompt
  return [
    "You are the GenerationHealth Content Engine v2. Generate complete, structured JSON content for health insurance landing pages.",
    "",
    "═══ BRAND (from GH_HARD_RULES) ═══",
    "Name: " + B.name + " (" + B.short_name + ")",
    "Title: " + B.title,
    "Phone: " + B.phone + " — CRITICAL: Never use 3324",
    "License: " + B.license + " · " + B.npn + " · " + B.certification,
    "Email: " + B.email,
    "Address: " + B.address_full,
    "Experience: " + B.experience_years + " years · " + B.families_helped + " families · " + B.google_rating + " Google rating (" + B.review_count + " reviews)",
    "Counties: " + B.all_counties.join(", "),
    "",
    "═══ CTA LINKS ═══",
    "SunFire (Medicare): " + L.sunfire,
    "HealthSherpa (ACA): " + L.healthsherpa,
    "Calendly: " + L.calendly,
    "Phone: " + B.phone_tel,
    "SMS: " + B.phone_sms,
    "",
    "═══ PAGE TYPE: " + pageType.toUpperCase() + " ═══",
    "Primary CTA: " + ctaLinks.join(" + "),
    "Disclaimer: " + disclaimer,
    "Gov sources: " + govSources.join(", "),
    "Gov phone: " + govPhone,
    "Service type: " + typeRules.service_type,
    "",
    "═══ 2026 MEDICARE FIGURES (EXACT — use these, not approximations) ═══",
    "Part B premium: " + M.part_b_premium + "/month (" + M.part_b_premium_annual + "/year)",
    "Part B deductible: " + M.part_b_deductible,
    "Part A deductible: " + M.part_a_deductible,
    "Part D OOP cap: " + M.part_d_oop_cap + " (Inflation Reduction Act)",
    "Part D max deductible: " + M.part_d_max_deductible,
    "Part D base premium: " + M.part_d_base_premium,
    "Insulin cap: " + M.insulin_cap_monthly,
    "MA OOP max (in-network): " + M.ma_oop_max_in_network,
    "MA OOP max (combined): " + M.ma_oop_max_combined,
    "HD Plan G deductible: " + M.hd_plan_g_deductible,
    "MSP income limit: " + M.msp_income_limit_monthly + "/month",
    "LIS income limit: " + M.lis_income_limit_annual + "/year",
    "",
    "═══ 2026 ACA FIGURES (EXACT) ═══",
    "FPL single: " + A.fpl_single,
    "Medicaid cutoff: " + A.medicaid_cutoff + " (" + A.medicaid_cutoff_pct + " FPL)",
    "CSR cutoff: " + A.csr_cutoff + " (" + A.csr_cutoff_pct + " FPL)",
    "Subsidy cliff: " + A.subsidy_cliff + " (" + A.subsidy_cliff_pct + " FPL)",
    "Max OOP individual: " + A.max_oop_individual,
    "Bronze avg deductible: " + A.bronze_avg_deductible,
    "Silver avg deductible: " + A.silver_avg_deductible,
    "OEP: " + A.oep_start + " – " + A.oep_end,
    "",
    "═══ CURRENT ENROLLMENT PERIOD ═══",
    ep.period.name + " — Urgency: " + ep.urgency,
    ep.message || "",
    "",
    "═══ NEPQ VOICE RULES ═══",
    N.voice_characteristics.join("\n"),
    "Problem paragraph pattern: " + N.problem_paragraph_pattern,
    "",
    "NEPQ triggers to use:",
    Object.keys(N.triggers).map(function(k) { return "  " + k + ": " + N.triggers[k]; }).join("\n"),
    "",
    "═══ TEMPLATE STRUCTURE (v" + TS.version + ") ═══",
    "Page must follow this EXACT section order:",
    sectionOrder,
    "",
    "═══ SCHEMA @GRAPH — REQUIRED TYPES ═══",
    TS.schema_graph.required_types.join(", "),
    "Optional: " + TS.schema_graph.optional_types.join(", "),
    "Speakable selectors: " + TS.schema_graph.speakable.css_selectors.join(", "),
    "",
    checklist,
    "",
    hardRequirements,
    "",
    "═══ STALE VALUES — NEVER USE THESE ═══",
    "Wrong phone: " + HR.FAIL_TRIGGERS.wrong_phone_patterns.join(", "),
    "Stale Part B premiums: " + HR.FAIL_TRIGGERS.stale_part_b.join(", "),
    "Stale Part B deductibles: " + HR.FAIL_TRIGGERS.stale_part_b_deductible.join(", "),
    "Stale Part A deductibles: " + HR.FAIL_TRIGGERS.stale_part_a.join(", "),
    "Stale MA OOP: " + HR.FAIL_TRIGGERS.stale_ma_oop.join(", "),
    "",
    "═══ OUTPUT FORMAT ═══",
    "Return ONLY valid JSON matching this schema. No markdown. No explanation.",
    "All text fields must be complete sentences ready for HTML assembly.",
    "",
    "FINAL REMINDER: Before outputting, verify these counts:",
    "  instant_answers: " + minAnswers + "+ items (REQUIRED)",
    "  faq: " + minFaqs + "+ items (REQUIRED)",
    "  howto_steps.steps: " + minSteps + "+ steps (REQUIRED)",
    "  comparison_table: fully populated (REQUIRED)",
    "  process_steps: " + minSteps + "+ items (REQUIRED)",
    "  case_studies: " + minCases + "+ items (REQUIRED)",
    "",
    "JSON SCHEMA:",
    JSON.stringify({
      meta: { keyword: "string", page_type: pageType, county: "string", page_role: "string", search_intent: "string", user_urgency: "string" },
      analysis: { paa_questions: ["10 strings"], competitor_gaps: ["5 strings"], primary_pain_points: ["3+ strings"], decision_triggers: ["3+ strings"] },
      hero: { eyebrow: "County · 2026 · Free", headline_white: "H1 line 1 — pain", headline_gold: "H1 line 2 — benefit", description: "NEPQ subtitle max 22 words", pain_bullet_1: "consequence 1", pain_bullet_2: "consequence 2", pain_bullet_3: "consequence 3", cta_primary: "button label", cta_secondary: "button label", social_proof: "trust strip text" },
      instant_answers: [{ label: "Quick Answer", text: "2-4 sentences with 2026 figure", source: ".gov citation" }, "MINIMUM " + minAnswers + " ITEMS — generate at least " + minAnswers],
      nepq_quotes: { seed_doubt: "quote", question_status_quo: "quote", reveal_blind_spot: "quote", consequence: "quote", possibility: "quote", permission: "quote", urgency: "quote", harvest: "quote" },
      cost_grid: { title: "string", subtitle: "string", source: ".gov", cards: [{ label: "string", value: "dollar amount", note: "context" }], cta_text: "string" },
      pain_points: [{ emoji: "emoji", title: "string", description: "2-3 sentences" }],
      comparison_table: { title: "REQUIRED — never null", subtitle: "string", column_headers: ["Feature", "Option A", "Option B"], rows: [["5+ rows required"]], winner: "string", footnote: "string" },
      case_studies: [{ tag: "category", tag_color: "red|green|blue|purple|orange", title: "string", situation: "string", outcome: "string", lesson: "string", dollar_amount: "$X,XXX" }, "MINIMUM " + minCases + " ITEMS"],
      process_steps: [{ number: 1, title: "string", description: "string", time: "string" }, "MINIMUM " + minSteps + " ITEMS — separate from howto_steps"],
      expert_tips: { tip_1: "first person", tip_2: "first person", warning: "string", recommendation: "string" },
      trust_vs_red_flags: { trust_title: "string", trust_items: ["4+ strings"], red_flag_title: "string", red_flag_items: ["4+ strings"] },
      urgency_callout: { headline: "string", dates: "enrollment dates", consequence: "what happens if missed", soft_urgency: "gentle nudge" },
      cta_modals: {
        cta_1: { headline: "vision question", subhead: "string", card_1_title: "Compare tool", card_1_description: "string", card_2_title: "Talk to Rob", card_2_description: "string" },
        cta_2: { headline: "different angle", subhead: "string" }
      },
      howto_steps: { name: "How to [action] — REQUIRED, never omit", description: "string", steps: [{ name: "step title", text: "step description" }, "MINIMUM " + minSteps + " STEPS — generates HowTo JSON-LD schema"] },
      savings_programs: [{ name: "string", eligibility: "string", benefit: "string" }],
      faq: [{ question: "string", answer: "2-3 sentences", schema_answer: "concise version for JSON-LD" }, "MINIMUM " + minFaqs + " ITEMS — generates FAQPage schema"],
      objection_handlers: { trust: "string", cost: "string", privacy: "string", diy: "string", satisfied: "string", procrastination: "string" },
      social_proof: { featured_testimonial: { quote: "string", name: "string", location: "County" }, stats: { families: B.families_helped, rating: B.google_rating, reviews: B.review_count, experience: B.experience_years } },
      related_links: [{ title: "string", slug: "string", url: "full URL" }],
      meta_tags: { title_tag: "50-60 chars", meta_description: "150-160 chars", og_title: "string", og_description: "string" },
      internal_links: [{ anchor_text: "string", url: "full generationhealth.me URL", context: "where to place" }]
    }, null, 2)
  ].join("\n");
};

console.log("[GH] buildSystemPrompt-v2 loaded — reads from GH_HARD_RULES");
