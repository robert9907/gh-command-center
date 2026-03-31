// ═══════════════════════════════════════════════════════════════════════════
// GH_HARD_RULES v2.1 — THE SINGLE SOURCE OF TRUTH
// 
// Everything Claude needs to know. Everything assembleHTML uses.
// Everything the flattener corrects. Everything the scanner checks.
// No interpretation. No approximation. Fill in the blanks.
//
// Last updated: March 31, 2026
// ═══════════════════════════════════════════════════════════════════════════

window.GH_HARD_RULES = {

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1: BRAND IDENTITY
  // ═══════════════════════════════════════════════════════════════════════════
  
  BRAND: {
    name: "Robert Simm",
    short_name: "Rob Simm",
    title: "Licensed Health Insurance Advisor",
    experience_years: "12+",
    families_helped: "500+",
    google_rating: "5.0",
    review_count: "20+",
    business_name: "GenerationHealth",
    domain: "generationhealth.me",
    phone: "(828) 761-3326",
    phone_tel: "tel:828-761-3326",
    phone_sms: "sms:828-761-3326",
    phone_intl: "+1-828-761-3326",
    phone_plain: "828-761-3326",
    WRONG_PHONE: "(828) 761-3324",
    WRONG_PHONE_PATTERNS: ["761-3324", "3324", "828-761-3324", "(828) 761-3324"],
    license: "NC License #10447418",
    license_number: "10447418",
    npn: "NPN #10447418",
    npn_number: "10447418",
    certification: "AHIP Certified",
    email: "robert@generationhealth.me",
    address_street: "2731 Meridian Pkwy",
    address_city: "Durham",
    address_state: "NC",
    address_zip: "27713",
    address_full: "2731 Meridian Pkwy, Durham, NC 27713",
    primary_counties: ["Durham", "Wake", "Orange", "Chatham"],
    secondary_counties: ["Person", "Granville", "Franklin", "Johnston"],
    all_counties: ["Durham", "Wake", "Orange", "Chatham", "Person", "Granville", "Franklin", "Johnston"],
    region: "Triangle",
    state: "NC",
    state_full: "North Carolina"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2: CTA LINKS
  // ═══════════════════════════════════════════════════════════════════════════
  
  LINKS: {
    sunfire: "https://www.sunfirematrix.com/app/consumer/medicareadvocates/10447418/",
    healthsherpa: "https://www.healthsherpa.com/?_agent_id=robert-simm",
    calendly: "https://calendly.com/robert-generationhealth/new-meeting",
    tel: "tel:828-761-3326",
    sms: "sms:828-761-3326",
    medicare_gov: "https://www.medicare.gov",
    cms_gov: "https://www.cms.gov",
    ssa_gov: "https://www.ssa.gov",
    healthcare_gov: "https://www.healthcare.gov",
    hhs_gov: "https://www.hhs.gov",
    nc_license_verify: "https://www.ncdoi.gov/consumers/verify-license",
    google_reviews: "https://www.google.com/maps/place/GenerationHealth",
    home: "https://generationhealth.me",
    about: "https://generationhealth.me/about",
    contact: "https://generationhealth.me/contact",
    medicare_hub: "https://generationhealth.me/medicare-nc/",
    aca_hub: "https://generationhealth.me/north-carolina-aca-health-insurance-plans/"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3: 2026 MEDICARE FIGURES — CORRECTED
  // Source: CMS.gov official announcements
  // ═══════════════════════════════════════════════════════════════════════════
  
  MEDICARE_2026: {
    part_b_premium: "$202.90",
    part_b_premium_monthly: "$202.90/month",
    part_b_premium_annual: "$2,434.80",
    part_b_deductible: "$283",
    part_a_deductible: "$1,736",
    part_a_coinsurance_days_61_90: "$419/day",
    part_a_coinsurance_lifetime: "$838/day",
    part_d_oop_cap: "$2,100",
    part_d_max_deductible: "$590",
    part_d_base_premium: "$36.78",
    insulin_cap: "$35",
    insulin_cap_monthly: "$35/month",
    ma_oop_max_in_network: "$9,350",
    ma_oop_max_combined: "$14,000",
    hd_plan_g_deductible: "$2,870",
    msp_income_limit_monthly: "$1,816",
    msp_income_limit_annual: "$21,792",
    lis_income_limit_annual: "$22,590",
    source: "CMS.gov",
    source_url: "https://www.cms.gov"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4: 2026 ACA FIGURES
  // Source: HHS.gov Federal Poverty Level guidelines
  // ═══════════════════════════════════════════════════════════════════════════
  
  ACA_2026: {
    fpl_single: "$15,650",
    fpl_couple: "$21,150",
    fpl_family_3: "$26,650",
    fpl_family_4: "$32,150",
    fpl_per_additional: "$5,500",
    medicaid_cutoff: "$21,597",
    medicaid_cutoff_pct: "138%",
    csr_cutoff: "$39,125",
    csr_cutoff_pct: "250%",
    subsidy_cliff: "$62,600",
    subsidy_cliff_pct: "400%",
    medicaid_cutoff_family_4: "$44,367",
    subsidy_cliff_family_4: "$128,600",
    max_oop_individual: "$9,450",
    max_oop_family: "$18,900",
    bronze_avg_deductible: "$7,500",
    silver_avg_deductible: "$5,300",
    oep_start: "November 1",
    oep_end: "January 15",
    jan_1_deadline: "December 15",
    healthcare_gov_phone: "1-800-318-2596",
    source: "HHS.gov",
    source_url: "https://www.hhs.gov"
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5: COMPLIANCE TEXT
  // ═══════════════════════════════════════════════════════════════════════════
  
  COMPLIANCE: {
    medicare_disclaimer: "We do not offer every plan available in your area. Please contact Medicare.gov or 1-800-MEDICARE for information on all of your options.",
    medicare_not_affiliated: "Not affiliated with or endorsed by the U.S. government or the federal Medicare program.",
    medicare_gov_ref: "Medicare.gov",
    medicare_phone: "1-800-MEDICARE",
    medicare_phone_numeric: "1-800-633-4227",
    aca_disclaimer: "We do not offer every plan available in your area. Please contact Healthcare.gov or 1-800-318-2596 for information on all of your options.",
    aca_not_affiliated: "Not affiliated with or endorsed by the U.S. government or the federal Health Insurance Marketplace.",
    aca_gov_ref: "Healthcare.gov",
    aca_phone: "1-800-318-2596",
    dual_disclaimer: "We do not offer every plan available in your area. Please contact Medicare.gov, Healthcare.gov, or call us directly for information on all of your options. Not affiliated with or endorsed by the U.S. government or the federal Medicare program or Health Insurance Marketplace.",
    educational_purpose: "This content is for educational and informational purposes only.",
    required_gov_sources_medicare: ["Medicare.gov", "CMS.gov", "SSA.gov"],
    required_gov_sources_aca: ["Healthcare.gov", "CMS.gov", "HHS.gov"],
    author_disclosure: "Robert Simm is a licensed insurance agent in North Carolina (License #10447418, NPN #10447418)."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6: ENROLLMENT PERIODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  ENROLLMENT_PERIODS: {
    medicare_aep: { name: "Annual Enrollment Period", short: "AEP", start: "October 15", end: "December 7", urgency: "high", coverage_effective: "January 1", description: "Change your Medicare Advantage or Part D plan." },
    medicare_oep: { name: "Open Enrollment Period", short: "OEP", start: "January 1", end: "March 31", urgency: "medium", coverage_effective: "1st of following month", description: "Switch from Medicare Advantage to Original Medicare (or between MA plans)." },
    medicare_iep: { name: "Initial Enrollment Period", short: "IEP", duration: "7 months around 65th birthday", urgency: "high", description: "3 months before, birthday month, 3 months after turning 65." },
    aca_oep: { name: "Open Enrollment", start: "November 1", end: "January 15", urgency: "high", jan_1_deadline: "December 15", description: "Enroll in or change ACA Marketplace plans." },
    sep: { name: "Special Enrollment Period", short: "SEP", duration: "60 days from qualifying event", urgency: "varies", qualifying_events: ["Lost job/coverage", "Got married", "Had a baby", "Moved", "Turned 26", "Lost Medicaid"], description: "Triggered by life events." }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 7: PAGE TYPE RULES
  // ═══════════════════════════════════════════════════════════════════════════
  
  PAGE_TYPES: {
    aca_keywords: ["aca","marketplace","subsidy","self-employed","lost-job","got-married","had-a-baby","turning-26","after-26","lost-health-insurance","without-employer","between-jobs","after-losing","obamacare","healthcare-gov","under-65"],
    broker_keywords: ["health-insurance-broker","insurance-broker","agent-near-me","insurance-agent","find-broker","local-broker","broker-durham","broker-raleigh","broker-wake"],
    medicare_keywords: ["medicare","medicare-advantage","medigap","part-d","part-b","supplement","turning-65","65-years-old","senior","retirement","original-medicare"],
    type_rules: {
      medicare: { cta_link: "sunfire", disclaimer: "medicare_disclaimer", not_affiliated: "medicare_not_affiliated", gov_sources: ["Medicare.gov","CMS.gov","SSA.gov"], gov_phone: "1-800-MEDICARE", service_type: "Medicare Insurance Advisory" },
      aca: { cta_link: "healthsherpa", disclaimer: "aca_disclaimer", not_affiliated: "aca_not_affiliated", gov_sources: ["Healthcare.gov","CMS.gov","HHS.gov"], gov_phone: "1-800-318-2596", service_type: "ACA Marketplace Advisory" },
      dual: { cta_links: ["sunfire","healthsherpa"], disclaimer: "dual_disclaimer", gov_sources: ["Medicare.gov","Healthcare.gov","CMS.gov"], service_type: "Health Insurance Advisory" },
      broker: { cta_links: ["sunfire","healthsherpa"], disclaimer: "dual_disclaimer", gov_sources: ["Medicare.gov","Healthcare.gov","CMS.gov"], service_type: "Health Insurance Advisory" }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 8: NEPQ FRAMEWORK
  // ═══════════════════════════════════════════════════════════════════════════
  
  NEPQ: {
    triggers: {
      SEED_DOUBT: "Plant uncertainty about current situation",
      QUESTION_STATUS_QUO: "Challenge assumptions",
      REVEAL_BLIND_SPOT: "Show what they're missing",
      CONSEQUENCE: "Cost of inaction",
      POSSIBILITY: "Better outcome available",
      PERMISSION: "It's okay to get help",
      URGENCY: "Time-bound the decision",
      HARVEST: "Connect action to relief"
    },
    example_quotes: {
      seed_doubt: "Every plan on the market was built with a weakness.",
      consequence: "A diagnosis. A surgery. A specialist that isn't covered. That's when the affordable plan starts costing thousands.",
      possibility: "What if you could see exactly what your plan costs before you ever needed it?",
      permission: "This isn't something you're supposed to figure out alone.",
      harvest: "One call, 20 minutes, no obligation. You leave knowing exactly what to do."
    },
    voice_characteristics: [
      "Consequence-first (lead with what goes wrong)",
      "Direct but empathetic",
      "Anti-call-center positioning",
      "Local authority (NC-specific)",
      "8th grade reading level",
      "No jargon without explanation"
    ],
    problem_paragraph_pattern: "Here's what most people [doing X] don't realize until it's too late: [specific problem]. [Make it personal]. [Cite a 2026 figure]."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9: TEMPLATE REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  TEMPLATE_REQUIREMENTS: {
    minimums: {
      instant_answers: 3,
      faqs: 8,
      cta_modals: 2,
      process_steps: 4,
      case_studies: 3,
      cost_grid_cards: 4,
      trust_items: 4,
      red_flag_items: 4,
      pain_points: 3,
      internal_links: 5,
      gov_citations: 3,
      word_count: 2000
    },
    schema_types: ["LocalBusiness","Person","MedicalWebPage","Article","Service","FAQPage","HowTo","BreadcrumbList","Review","ClaimReview","SpecialAnnouncement"],
    speakable_selectors: [".gh-answer", ".gh-faq-a"],
    locked_elements: {
      hero_call_button_class: "gh-hero-btn--call",
      hero_compare_button_class: "gh-hero-btn--compare",
      answer_block_class: "gh-answer",
      cta_modal_class: "gh-cta-modal",
      author_card_class: "gh-author",
      faq_item_class: "gh-faq-item",
      faq_answer_class: "gh-faq-a",
      cost_grid_class: "gh-costs",
      howto_class: "gh-howto",
      comparison_class: "gh-comparison",
      scenario_class: "gh-scenario"
    },
    fonts: { body: "DM Sans", display: "Fraunces" },
    freshness: { current_year: 2026, stale_years: [2024, 2025], updated_format: "Updated [Month] 2026", next_review: "October 2026" }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 10: STALE/WRONG VALUES — CORRECTED
  // ═══════════════════════════════════════════════════════════════════════════
  
  FAIL_TRIGGERS: {
    wrong_phone_patterns: ["761-3324", "3324", "828-761-3324"],
    stale_part_b: ["$174.70", "$185.00", "$164.90", "$170.10", "$148.50"],
    stale_part_b_deductible: ["$257", "$240", "$233", "$226", "$203"],
    stale_part_a: ["$1,676", "$1,632", "$1,600", "$1,556", "$1,484"],
    stale_ma_oop: ["$8,850", "$8,300", "$7,550", "$7,500"],
    stale_part_d_oop: ["$2,000", "$3,100", "$3,250"],
    stale_year_patterns: ["2024 Part", "2025 Part", "2024 Medicare", "2025 Medicare", "2024 premium", "2025 premium"],
    wrong_license_patterns: ["10447417", "10447419", "1044741"],
    wrong_healthsherpa: ["_agent_id=hst-t4qptg"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 11: FLATTENER RECONCILIATION RULES
  // flattenForElementor() reads these instead of its own hardcoded list
  // ═══════════════════════════════════════════════════════════════════════════
  
  FLATTENER_RULES: {
    // Phone corrections — find → replace
    phone_fixes: [
      { find: "828-761-3324", replace: "828-761-3326" },
      { find: "828.761.3324", replace: "828.761.3326" },
      { find: "8287613324", replace: "8287613326" },
      { find: "(828) 761-3324", replace: "(828) 761-3326" },
      { find: "828 761 3324", replace: "828-761-3326" }
    ],
    // Figure corrections — find → replace
    figure_fixes: [
      { find: "$185/month", replace: "$202.90/month" },
      { find: "$185.00/month", replace: "$202.90/month" },
      { find: "$185/mo", replace: "$202.90/mo" },
      { find: "Part B deductible: <strong>$257</strong>", replace: "Part B deductible: <strong>$283</strong>" },
      { find: "$257 Part B deductible", replace: "$283 Part B deductible" },
      { find: "Part A deductible: <strong>$1,676</strong>", replace: "Part A deductible: <strong>$1,736</strong>" },
      { find: "$1,676 Part A", replace: "$1,736 Part A" }
    ],
    // HealthSherpa agent ID correction
    healthsherpa_fixes: [
      { find: "_agent_id=hst-t4qptg", replace: "_agent_id=robert-simm" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 12: MASTER TEMPLATE v5.7.2 STRUCTURE
  // One skeleton. Fork points controlled by page type.
  // assembleHTML-v2 reads this to build every page.
  // ═══════════════════════════════════════════════════════════════════════════
  
  TEMPLATE_STRUCTURE: {

    // ── Version ──
    version: "5.7.2",

    // ── Required section order — every page, this sequence ──
    section_order: [
      "schema_jsonld",       // JSON-LD @graph in <head>
      "header",              // Sticky header with logo, phone, CTA
      "hero",                // H1, subtitle, buttons, credential strip
      "nepq_quote_1",        // NEPQ quote break after hero
      "instant_answer",      // .gh-answer — direct answer for AI citation
      "intro_paragraphs",    // NEPQ P1 opener + vision bridge
      "cost_strip",          // 4-box 2026 figures
      "nepq_quote_2",        // NEPQ quote break after costs
      "body_section_1",      // H2 + content (icon cards, checklist, or prose)
      "expert_tip",          // Rob's first-person insider tip
      "comparison",          // Side-by-side comparison cards
      "cta_modal_1",         // First conversion modal (dual card layout)
      "nepq_quote_3",        // NEPQ quote break after CTA
      "scenarios",           // 3 real-situation scenario cards
      "trust_vs_red_flags",  // Trust signals vs red flags grid
      "body_section_2",      // H2 + different visual format
      "howto_steps",         // 4-5 numbered steps with schema
      "cta_modal_2",         // Second conversion modal
      "faq",                 // 8+ FAQs with accordion + schema
      "related_links",       // Internal links + county grid
      "author_card",         // Rob's credentials and contact
      "last_updated",        // Freshness signal
      "footer",              // Compliance disclaimers
      "float_call"           // Mobile floating call button
    ],

    // ── Design tokens — resolved by flattener, used by template ──
    tokens: {
      // Colors
      white: "#FFFFFF", snow: "#FAFBFC", cloud: "#F3F5F7",
      mist: "#E8ECF0", silver: "#C4CDD5", slate: "#6B7B8D",
      charcoal: "#3A4553", midnight: "#1A2332",
      blue_50: "#EFF6FF", blue_100: "#DBEAFE", blue_200: "#BFDBFE",
      blue_600: "#2563EB", blue_700: "#1D4ED8",
      blue_800: "#1E3A5F", blue_900: "#0F2440",
      teal_50: "#F0FDFA", teal_100: "#CCFBF1", teal_500: "#14B8A6",
      teal_600: "#0D9488", teal_700: "#0F766E",
      carolina: "#4B9CD3", carolina_dark: "#1A5FA0",
      nc_gold: "#FFC72C", nc_gold_muted: "#E8B830",
      amber_50: "#FFFBEB", amber_500: "#F59E0B", amber_600: "#D97706",
      success: "#16A34A", success_bg: "#F0FDF4",
      error: "#DC2626", error_bg: "#FEF2F2",
      purple_600: "#7C3AED",
      // Fonts
      font_display: "'Fraunces', Georgia, serif",
      font_body: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      // Sizing
      max_width_prose: "720px",
      max_width_content: "980px",
      max_width_wide: "1200px",
      // Radius
      r_sm: "8px", r_md: "12px", r_lg: "16px",
      r_xl: "20px", r_2xl: "24px", r_full: "100px",
      // Shadows
      sh_sm: "0 2px 8px rgba(0,0,0,.06)",
      sh_md: "0 4px 20px rgba(0,0,0,.08)",
      sh_lg: "0 8px 32px rgba(0,0,0,.10)"
    },

    // ── Component anatomy — exact HTML structure per section ──
    components: {

      // ── HEADER ──
      header: {
        tag: "header",
        classes: ["gh-header"],
        sticky: true,
        backdrop_blur: true,
        children: {
          inner: { classes: ["gh-header-inner"], max_width: "1200px", height: "64px" },
          logo: { classes: ["gh-logo"], tag: "a", href: "https://generationhealth.me", font: "display" },
          phone_btn: { classes: ["gh-header-phone"], tag: "a", href: "tel:828-761-3326", includes_svg: true },
          cta_btn: { classes: ["gh-header-cta"], tag: "a" }
        },
        // FORK: CTA href and label
        fork: {
          medicare: { cta_href: "sunfire", cta_label: "Compare Plans" },
          aca: { cta_href: "healthsherpa", cta_label: "Check Subsidy" },
          broker: { cta_href: "calendly", cta_label: "Free Consultation" }
        }
      },

      // ── HERO ──
      hero: {
        tag: "section",
        classes: ["gh-hero"],
        background: "linear-gradient(165deg, #0F2440 0%, #1E3A5F 40%, #1A2332 100%)",
        children: {
          inner: { classes: ["gh-hero-inner"], padding: "72px 80px 48px" },
          eyebrow: { classes: ["gh-eyebrow"], children: ["gh-eyebrow-text", "gh-eyebrow-rule"] },
          h1: { classes: ["gh-h1"], children: ["gh-h1-line1", "gh-h1-line2"] },
          subtitle: { classes: ["gh-hero-sub"], max_words: 22 },
          actions: { classes: ["gh-hero-actions"], children: ["gh-hero-btn--call", "gh-hero-btn--compare"] },
          creds: {
            classes: ["gh-creds"],
            children: ["gh-creds-rule", "gh-creds-inner"],
            items: ["NC License #10447418", "AHIP Certified", "★ 5.0 — 20+ Google Reviews", "No Spam Calls · $0 Cost", "828-761-3326"]
          }
        },
        // FORK: Compare button href and label
        fork: {
          medicare: { compare_href: "sunfire", compare_label: "Compare Plans" },
          aca: { compare_href: "healthsherpa", compare_label: "Check Your Subsidy" },
          broker: { compare_href: "calendly", compare_label: "Schedule a Call" }
        }
      },

      // ── INSTANT ANSWER ──
      instant_answer: {
        classes: ["gh-answer"],
        role: "note",
        aria_label: "Quick answer",
        children: {
          label: { classes: ["gh-answer-label"], text: "Quick Answer" },
          paragraph: { max_sentences: 4, must_include_figure: true }
        },
        minimum_count: 3  // 3+ answer blocks per page
      },

      // ── COST STRIP ──
      cost_strip: {
        classes: ["gh-costs"],
        background: "linear-gradient(165deg, #0F2440 0%, #1E3A5F 50%, #1A2332 100%)",
        children: {
          header: { classes: ["gh-costs-hd"], children: ["h3", "p"] },
          grid: { classes: ["gh-costs-grid"], min_cards: 4 },
          card: { classes: ["gh-cost-box"], children: ["gh-cost-label", "gh-cost-val", "gh-cost-note"] },
          source: { classes: ["gh-costs-src"], must_include_gov_link: true }
        },
        // FORK: Which figures to show
        fork: {
          medicare: { figures: ["part_b_premium", "part_b_deductible", "part_a_deductible", "part_d_oop_cap"], source: "CMS.gov" },
          aca: { figures: ["subsidy_cliff", "csr_cutoff", "bronze_avg_deductible", "max_oop_individual"], source: "HHS.gov" },
          broker: { figures: ["part_b_premium", "subsidy_cliff", "ma_oop_max_in_network", "max_oop_individual"], source: "CMS.gov / HHS.gov" }
        }
      },

      // ── CTA MODAL ──
      cta_modal: {
        classes: ["gh-cta-modal"],
        minimum_count: 2,
        children: {
          header: { classes: ["gh-cta-hd"], children: ["h2", "p"] },
          grid: { classes: ["gh-cta-grid"], columns: 2 },
          card: {
            classes: ["gh-cta-card"],
            children: ["h3", "p", "ghost_buttons"]
          }
        },
        // Card 1: Compare tool — FORK by page type
        card_1: {
          medicare: { title: "Compare Plans Side by Side", ghost_class: "gh-ghost--compare", href: "sunfire", label: "Let's See What's Available →" },
          aca: { title: "Compare Plans Side by Side", ghost_class: "gh-ghost--compare", href: "healthsherpa", label: "Let's See What's Available →" },
          broker: { title: "Compare Plans Side by Side", ghost_class: "gh-ghost--compare", href: "sunfire", label: "Medicare Plans →", secondary_href: "healthsherpa", secondary_label: "ACA Plans →" }
        },
        // Card 2: Contact stack — same for all types
        card_2: {
          title: "Talk to Rob Directly",
          buttons: [
            { classes: ["gh-ghost", "gh-ghost--call"], tag: "a", href: "tel:828-761-3326", label: "📞 Call 828-761-3326", sub: "Mon–Fri 9am–7pm · Sat 12pm–4pm" },
            { classes: ["gh-ghost", "gh-ghost--text"], tag: "a", href: "sms:828-761-3326", label: "💬 Text Us" },
            { classes: ["gh-ghost", "gh-ghost--sched"], tag: "a", href: "calendly", label: "📅 Book a Free Call" }
          ]
        },
        // Shimmer rules for ghost buttons
        shimmer: {
          compare: { delay: "0s", color: "rgba(255,199,44,.55)", border: "rgba(255,199,44,.7)" },
          call: { delay: "1.1s", color: "rgba(22,163,74,.55)", border: "rgba(22,163,74,.7)" },
          text: { delay: "2.2s", color: "rgba(139,92,246,.55)", border: "rgba(139,92,246,.7)" },
          sched: { delay: "3.3s", color: "rgba(245,158,11,.55)", border: "rgba(245,158,11,.7)" }
        }
      },

      // ── SCENARIOS ──
      scenarios: {
        classes: ["gh-scenarios"],
        minimum_count: 3,
        card: {
          classes: ["gh-scenario"],
          children: {
            header: { classes: ["gh-scenario-hd"], color_variants: ["blue", "green", "purple", "teal", "amber"] },
            badge: { classes: ["gh-scenario-badge"] },
            body: { classes: ["gh-scenario-body"] },
            verdict: { classes: ["gh-verdict"], color_matches_header: true }
          }
        }
      },

      // ── HOWTO STEPS ──
      howto_steps: {
        classes: ["gh-howto"],
        min_steps: 4,
        max_steps: 5,
        requires_schema: true,
        step: {
          children: ["number_circle", "title", "description"],
          number_circle: { background: "linear-gradient(135deg, #0D9488, #14B8A6)", color: "#fff", size: "48px" }
        }
      },

      // ── FAQ ──
      faq: {
        classes: ["gh-faq"],
        minimum_items: 8,
        requires_schema: true,
        item: {
          tag: "details",
          classes: ["gh-faq-item"],
          children: {
            question: { tag: "summary", classes: ["gh-faq-q"], includes_chevron_svg: true },
            answer: { tag: "div", classes: ["gh-faq-a"] }
          }
        }
      },

      // ── AUTHOR CARD ──
      author_card: {
        classes: ["gh-author"],
        required_info: ["name", "license", "npn", "certification", "phone", "address", "google_rating"],
        children: {
          header: { classes: ["gh-author-header"] },
          body: { classes: ["gh-author-body"] },
          contact_box: { classes: ["gh-contact-box"], includes: ["phone", "sms", "email", "address"] },
          hours_box: { classes: ["gh-hours-box"] },
          license_box: { classes: ["gh-license-box"], includes_verify_link: true },
          disclaimer: { classes: ["gh-disclaimer"] }
        }
      },

      // ── RELATED LINKS ──
      related_links: {
        classes: ["gh-related"],
        children: {
          guides: { classes: ["gh-related-grid"], min_links: 6 },
          counties: { classes: ["gh-county-grid"], links: ["Durham", "Wake", "Mecklenburg", "Guilford", "Forsyth", "Buncombe", "Orange", "All NC Counties"] }
        }
      },

      // ── TRUST STRIP ──
      trust_strip: {
        classes: ["gh-trust-strip"],
        badges: [
          { icon: "🔒", title: "No SSN Required", desc: "ZIP code, doctors, and drug list is all it takes to start" },
          { icon: "🔕", title: "No Spam Calls", desc: "One broker. Your information never sold to other agents." },
          { icon: "🛡️", title: "$0 Cost to Compare", desc: "Carriers pay us, not you" }
        ]
      },

      // ── FOOTER ──
      footer: {
        classes: ["gh-footer-trust"],
        background: "#0F2440",
        // FORK: disclaimer text
        fork: {
          medicare: { disclaimer: "medicare_disclaimer", not_affiliated: "medicare_not_affiliated", gov_ref: "Medicare.gov", gov_phone: "1-800-MEDICARE" },
          aca: { disclaimer: "aca_disclaimer", not_affiliated: "aca_not_affiliated", gov_ref: "Healthcare.gov", gov_phone: "1-800-318-2596" },
          broker: { disclaimer: "dual_disclaimer" }
        }
      },

      // ── FLOAT CALL ──
      float_call: {
        classes: ["gh-float-call"],
        tag: "a",
        href: "tel:828-761-3326",
        mobile_only: true
      },

      // ── NEPQ QUOTE BREAK ──
      nepq_quote: {
        classes: ["gh-nepq-block"],
        background: "linear-gradient(135deg, #0F2440 0%, #1E3A5F 100%)",
        count_per_page: 3,
        content_source: "Claude generates from NEPQ.triggers"
      },

      // ── EXPERT TIP ──
      expert_tip: {
        classes: ["gh-tip"],
        children: {
          header: { classes: ["gh-tip-header"], icon: "💡", text: "Expert Tip from Rob Simm" },
          body: { first_person: true, max_sentences: 4 }
        }
      },

      // ── COMPARISON ──
      comparison: {
        classes: ["gh-comparison"],
        layout: "grid 1fr 1fr",
        card: { classes: ["gh-comparison-card"], children: ["h3", "gh-comp-item[]"] },
        item: { classes: ["gh-comp-item"], children: ["gh-comp-label", "gh-comp-value"] }
      }
    },

    // ── Schema @graph structure ──
    schema_graph: {
      required_types: ["LocalBusiness", "Person", "MedicalWebPage", "Article", "Service", "FAQPage", "HowTo"],
      optional_types: ["BreadcrumbList", "Review", "Speakable"],
      speakable: {
        type: "SpeakableSpecification",
        css_selectors: [".gh-answer", ".gh-faq-a"]
      },
      local_business: {
        name: "GenerationHealth",
        telephone: "+1-828-761-3326",
        address: { street: "2731 Meridian Pkwy", city: "Durham", state: "NC", zip: "27713" }
      },
      person: {
        name: "Robert Simm",
        job_title: "Licensed Health Insurance Advisor",
        knows_about: ["Medicare", "Medicare Advantage", "Medigap", "Part D", "ACA Marketplace", "Health Insurance", "North Carolina Health Insurance"]
      }
    },

    // ── Mobile responsive rules ──
    mobile: {
      breakpoint: "768px",
      hero_actions: "flex-direction: column; align-items: stretch",
      hero_btn: "width: 100%; max-width: none; border-radius: 14px; font-size: 15px",
      ghost_btn: "width: 100%; max-width: none; border-radius: 14px; font-size: 14px",
      cta_grid: "grid-template-columns: 1fr",
      header_phone_text: "display: none",
      header_phone: "width: 44px; height: 44px; border-radius: 50%; justify-content: center",
      float_call: "display: flex",
      creds_divider: "display: none",
      comparison: "grid-template-columns: 1fr"
    },

    // ── Shimmer animation keyframes ──
    animations: {
      ghShimmer: "0%{background-position:200% center}100%{background-position:-200% center}",
      ghChain: "0%{left:-120%}22%{left:150%}100%{left:150%}",
      ghSweep: "0%{left:-100%}100%{left:200%}",
      float_pulse: "0%,100%{box-shadow:0 6px 24px rgba(22,163,74,.4)}50%{box-shadow:0 6px 24px rgba(22,163,74,.4),0 0 0 12px rgba(22,163,74,.12)}"
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTION — CORRECTED for $283 / $1,736
// ═══════════════════════════════════════════════════════════════════════════

window.validateHardRules = function(html) {
  var errors = [];
  var warnings = [];
  var rules = window.GH_HARD_RULES;
  
  // CRITICAL: Wrong phone number
  rules.FAIL_TRIGGERS.wrong_phone_patterns.forEach(function(pattern) {
    if (html.indexOf(pattern) !== -1) {
      errors.push("CRITICAL: Found wrong phone '" + pattern + "' — Must use (828) 761-3326");
    }
  });
  
  // CRITICAL: Stale Part B premiums
  rules.FAIL_TRIGGERS.stale_part_b.forEach(function(val) {
    if (html.indexOf(val) !== -1) {
      errors.push("CRITICAL: Found stale Part B premium '" + val + "' — 2026 is $202.90/mo");
    }
  });
  
  // CRITICAL: Stale Part B deductibles (now includes $257)
  rules.FAIL_TRIGGERS.stale_part_b_deductible.forEach(function(val) {
    if (html.indexOf(val) !== -1) {
      errors.push("CRITICAL: Found stale Part B deductible '" + val + "' — 2026 is $283");
    }
  });
  
  // CRITICAL: Stale Part A deductibles (now includes $1,676)
  rules.FAIL_TRIGGERS.stale_part_a.forEach(function(val) {
    if (html.indexOf(val) !== -1) {
      errors.push("CRITICAL: Found stale Part A deductible '" + val + "' — 2026 is $1,736");
    }
  });
  
  // CRITICAL: Stale MA OOP max
  rules.FAIL_TRIGGERS.stale_ma_oop.forEach(function(val) {
    if (html.indexOf(val) !== -1) {
      errors.push("CRITICAL: Found stale MA OOP max '" + val + "' — 2026 is $9,350");
    }
  });
  
  // CRITICAL: Stale year patterns
  rules.FAIL_TRIGGERS.stale_year_patterns.forEach(function(pattern) {
    if (html.indexOf(pattern) !== -1) {
      errors.push("CRITICAL: Found stale year reference '" + pattern + "' — Use 2026 figures only");
    }
  });
  
  // CRITICAL: Wrong HealthSherpa agent ID
  if (rules.FAIL_TRIGGERS.wrong_healthsherpa) {
    rules.FAIL_TRIGGERS.wrong_healthsherpa.forEach(function(pattern) {
      if (html.indexOf(pattern) !== -1) {
        errors.push("CRITICAL: Found wrong HealthSherpa agent ID '" + pattern + "' — Must use _agent_id=robert-simm");
      }
    });
  }
  
  // COMPLIANCE: Medicare pages
  var isMedicare = html.toLowerCase().indexOf("medicare") !== -1;
  if (isMedicare) {
    if (html.indexOf("Medicare.gov") === -1 && html.indexOf("medicare.gov") === -1) {
      errors.push("COMPLIANCE: Missing Medicare.gov reference");
    }
    if (html.indexOf("1-800-MEDICARE") === -1 && html.indexOf("1-800-633-4227") === -1) {
      errors.push("COMPLIANCE: Missing 1-800-MEDICARE reference");
    }
    if (html.toLowerCase().indexOf("not affiliated") === -1) {
      errors.push("COMPLIANCE: Missing 'not affiliated' disclaimer");
    }
    if (html.indexOf("do not offer every plan") === -1 && html.indexOf("We do not offer every plan") === -1) {
      errors.push("COMPLIANCE: Missing CMS disclaimer");
    }
  }
  
  // COMPLIANCE: ACA pages
  var isACA = html.toLowerCase().indexOf("aca") !== -1 || html.toLowerCase().indexOf("marketplace") !== -1;
  if (isACA && !isMedicare) {
    if (html.indexOf("Healthcare.gov") === -1 && html.indexOf("healthcare.gov") === -1) {
      errors.push("COMPLIANCE: Missing Healthcare.gov reference");
    }
    if (html.indexOf("1-800-318-2596") === -1) {
      errors.push("COMPLIANCE: Missing ACA hotline (1-800-318-2596)");
    }
  }
  
  // E-E-A-T: License number
  if (html.indexOf("10447418") === -1) {
    errors.push("E-E-A-T: Missing license number #10447418");
  }
  
  // E-E-A-T: Author presence
  if (html.indexOf("Robert Simm") === -1 && html.indexOf("Rob Simm") === -1) {
    warnings.push("E-E-A-T: Author name not found");
  }
  
  // VQA: Hero buttons
  if (html.indexOf("gh-hero-btn--call") === -1) {
    errors.push("VQA: Missing hero call button (.gh-hero-btn--call)");
  }
  if (html.indexOf("gh-hero-btn--compare") === -1) {
    errors.push("VQA: Missing hero compare button (.gh-hero-btn--compare)");
  }
  
  // VQA: CTA modals (2+ required)
  var ctaModalCount = (html.match(/gh-cta-modal/g) || []).length;
  if (ctaModalCount < 2) {
    errors.push("VQA: Need at least 2 CTA modals, found " + ctaModalCount);
  }
  
  // VQA: SMS link
  if (html.indexOf("sms:") === -1) {
    errors.push("VQA: Missing SMS link (sms:828-761-3326)");
  }
  
  // VQA: Calendly link
  if (html.indexOf("calendly.com") === -1) {
    warnings.push("CONV: Missing Calendly scheduling link");
  }
  
  // AEO: Answer blocks (3+ required)
  var answerBlockCount = (html.match(/gh-answer/g) || []).length;
  if (answerBlockCount < 3) {
    errors.push("AEO: Need at least 3 answer blocks (.gh-answer), found " + answerBlockCount);
  }
  
  // AEO: FAQ schema
  if (html.indexOf('"FAQPage"') === -1) {
    errors.push("AEO: Missing FAQPage schema");
  }
  
  // AEO: HowTo schema
  if (html.indexOf('"HowTo"') === -1) {
    warnings.push("AEO: Missing HowTo schema");
  }
  
  // AEO: Speakable
  if (html.indexOf("SpeakableSpecification") === -1 && html.indexOf("speakable") === -1) {
    warnings.push("AEO: Missing Speakable specification");
  }
  
  // CONTENT: FAQ count (8+ required)
  var faqCount = (html.match(/gh-faq-item/g) || []).length;
  if (faqCount < 8) {
    warnings.push("CONTENT: Need at least 8 FAQs, found " + faqCount);
  }
  
  // VQA: Author card
  if (html.indexOf("gh-author") === -1) {
    errors.push("VQA: Missing author card (.gh-author)");
  }
  
  // VQA: Shimmer spans
  var shimmerCount = (html.match(/class="ghsb"/g) || []).length;
  if (shimmerCount < 2) {
    warnings.push("VQA: Missing shimmer animation spans (.ghsb), found " + shimmerCount);
  }
  
  // VQA: DM Sans font reference
  if (html.indexOf("DM Sans") === -1 && html.indexOf("DM+Sans") === -1) {
    warnings.push("VQA: Missing DM Sans font reference");
  }
  
  // FRESHNESS: 2026 presence
  if (html.indexOf("2026") === -1) {
    warnings.push("FRESHNESS: No 2026 date found");
  }
  
  // CONV: SunFire or HealthSherpa
  var hasSunfire = html.indexOf("sunfirematrix.com") !== -1;
  var hasHealthsherpa = html.indexOf("healthsherpa.com") !== -1;
  if (!hasSunfire && !hasHealthsherpa) {
    errors.push("CONV: Missing compare plans link (SunFire or HealthSherpa)");
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    score: {
      critical_errors: errors.filter(function(e) { return e.indexOf("CRITICAL") !== -1; }).length,
      compliance_errors: errors.filter(function(e) { return e.indexOf("COMPLIANCE") !== -1; }).length,
      vqa_errors: errors.filter(function(e) { return e.indexOf("VQA") !== -1; }).length,
      aeo_errors: errors.filter(function(e) { return e.indexOf("AEO") !== -1; }).length,
      total_errors: errors.length,
      total_warnings: warnings.length
    }
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get current enrollment period
// ═══════════════════════════════════════════════════════════════════════════

window.getCurrentEnrollmentPeriod = function() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var ep = window.GH_HARD_RULES.ENROLLMENT_PERIODS;
  if ((month === 10 && day >= 15) || month === 11 || (month === 12 && day <= 7)) {
    return { period: ep.medicare_aep, type: "medicare", urgency: "high", message: "Annual Enrollment Period ends December 7" };
  }
  if (month === 11 || month === 12 || (month === 1 && day <= 15)) {
    return { period: ep.aca_oep, type: "aca", urgency: "high", message: month === 12 && day <= 15 ? "Enroll by December 15 for January 1 coverage" : "Open Enrollment ends January 15" };
  }
  if (month === 1 || month === 2 || month === 3) {
    return { period: ep.medicare_oep, type: "medicare", urgency: "medium", message: "Medicare Open Enrollment ends March 31" };
  }
  return { period: ep.sep, type: "sep", urgency: "low", message: "Special Enrollment available for qualifying life events" };
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Detect page type from keyword
// ═══════════════════════════════════════════════════════════════════════════

window.detectPageType = function(keyword) {
  var kw = keyword.toLowerCase().replace(/\s+/g, '-');
  var types = window.GH_HARD_RULES.PAGE_TYPES;
  for (var i = 0; i < types.broker_keywords.length; i++) {
    if (kw.indexOf(types.broker_keywords[i]) !== -1) {
      var hasMedicare = types.medicare_keywords.some(function(m) { return kw.indexOf(m) !== -1; });
      var hasACA = types.aca_keywords.some(function(a) { return kw.indexOf(a) !== -1; });
      if (hasMedicare || hasACA) return "dual";
      return "broker";
    }
  }
  for (var j = 0; j < types.aca_keywords.length; j++) {
    if (kw.indexOf(types.aca_keywords[j]) !== -1) return "aca";
  }
  return "medicare";
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get fork value for a component by page type
// ═══════════════════════════════════════════════════════════════════════════

window.getTemplateFork = function(componentId, pageType) {
  var comp = window.GH_HARD_RULES.TEMPLATE_STRUCTURE.components[componentId];
  if (!comp || !comp.fork) return null;
  return comp.fork[pageType] || comp.fork["medicare"] || null;
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get CTA link resolved for page type
// ═══════════════════════════════════════════════════════════════════════════

window.getCtaLink = function(linkKey) {
  return window.GH_HARD_RULES.LINKS[linkKey] || linkKey;
};


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get compliance text for page type
// ═══════════════════════════════════════════════════════════════════════════

window.getComplianceText = function(pageType) {
  var c = window.GH_HARD_RULES.COMPLIANCE;
  var rules = window.GH_HARD_RULES.PAGE_TYPES.type_rules[pageType] || window.GH_HARD_RULES.PAGE_TYPES.type_rules.medicare;
  return {
    disclaimer: c[rules.disclaimer] || c.medicare_disclaimer,
    not_affiliated: c[rules.not_affiliated] || c.medicare_not_affiliated,
    gov_sources: rules.gov_sources || ["Medicare.gov", "CMS.gov", "SSA.gov"],
    gov_phone: rules.gov_phone || "1-800-MEDICARE"
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// LOG CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════

console.log("GH_HARD_RULES v2.1 loaded");
console.log("  Sections: " + Object.keys(window.GH_HARD_RULES).length);
console.log("  Phone: " + window.GH_HARD_RULES.BRAND.phone);
console.log("  License: " + window.GH_HARD_RULES.BRAND.license);
console.log("  Part B Deductible: " + window.GH_HARD_RULES.MEDICARE_2026.part_b_deductible);
console.log("  Part A Deductible: " + window.GH_HARD_RULES.MEDICARE_2026.part_a_deductible);
console.log("  Template: v" + window.GH_HARD_RULES.TEMPLATE_STRUCTURE.version);
console.log("  Sections in order: " + window.GH_HARD_RULES.TEMPLATE_STRUCTURE.section_order.length);
console.log("  Components: " + Object.keys(window.GH_HARD_RULES.TEMPLATE_STRUCTURE.components).length);
console.log("  Minimums: " + Object.keys(window.GH_HARD_RULES.TEMPLATE_REQUIREMENTS.minimums).length + " requirements");
