/**
 * GenerationHealth Citation Monitor v2.1
 * Browser-based scan engine for Command Center
 * 
 * Exports:
 *   window.cmRunFullScan(options)        — Scan all queries across 4 LLMs
 *   window.cmGenerateAEOContent(query, apiKey, onProgress) — Generate AEO Q&As via Claude
 *   window.cmBuildAEOPage(qas, compareTable, slug, deployOptions) — Build Elementor-ready HTML
 *   window.cmBuildPreviewPage(qas, compareTable, slug) — Open preview in new window
 *   window.CM_QUERIES                    — The 50 target queries
 *
 * All scanning happens in the browser. API keys are read from localStorage.
 * Results are stored in localStorage under "gh-cc-citation-monitor".
 */
(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  var DETECTION = {
    url: "generationhealth.me",
    names: ["Rob Simm", "Robert Simm", "GenerationHealth", "Generation Health", "generationhealth"],
    phone: ["828-761-3326", "8287613326", "(828) 761-3326", "828.761.3326"]
  };

  var COMPETITORS = [
    { name: "Medicare.gov", patterns: ["medicare.gov"] },
    { name: "BCBS NC", patterns: ["bluecrossnc.com", "blue cross"] },
    { name: "Humana", patterns: ["humana.com", "humana"] },
    { name: "Aetna", patterns: ["aetna.com", "aetna"] },
    { name: "UnitedHealthcare", patterns: ["uhc.com", "unitedhealthcare"] },
    { name: "AARP", patterns: ["aarp.org", "aarp"] },
    { name: "NCDHHS", patterns: ["ncdhhs.gov", "nc dhhs"] },
    { name: "Healthcare.gov", patterns: ["healthcare.gov"] }
  ];

  var QUERIES = [
    // Enrollment Timing
    { id: "q1", query: "when should I sign up for Medicare turning 65", category: "enrollment-timing", priority: true },
    { id: "q2", query: "Medicare enrollment timeline turning 65", category: "enrollment-timing", priority: true },
    { id: "q3", query: "how early can I enroll in Medicare before 65", category: "enrollment-timing" },
    { id: "q4", query: "Medicare initial enrollment period explained", category: "enrollment-timing" },
    { id: "q5", query: "what happens if I miss Medicare enrollment deadline", category: "enrollment-timing" },
    { id: "q6", query: "Medicare special enrollment period rules", category: "enrollment-timing" },

    // 2026 Costs
    { id: "q7", query: "Medicare Part B premium 2026", category: "2026-costs" },
    { id: "q8", query: "Medicare Part B deductible 2026", category: "2026-costs" },
    { id: "q9", query: "how much does Medicare cost per month 2026", category: "2026-costs" },
    { id: "q10", query: "Medicare out of pocket maximum 2026", category: "2026-costs" },
    { id: "q11", query: "Part D out of pocket cap 2026", category: "2026-costs" },
    { id: "q12", query: "Medigap Plan G cost 2026", category: "2026-costs" },

    // Plan Comparisons
    { id: "q13", query: "Medicare Advantage vs Medigap which is better", category: "plan-comparisons" },
    { id: "q14", query: "Medigap Plan G vs Plan N comparison", category: "plan-comparisons" },
    { id: "q15", query: "should I get Medicare Advantage or Original Medicare", category: "plan-comparisons" },
    { id: "q16", query: "best Medicare plan for someone with chronic conditions", category: "plan-comparisons" },
    { id: "q17", query: "is Medigap worth the cost", category: "plan-comparisons" },
    { id: "q18", query: "best Medicare supplement plan 2026", category: "plan-comparisons" },
    { id: "q48", query: "Medicare plan comparison help NC", category: "plan-comparisons" },

    // Local NC
    { id: "q19", query: "Medicare broker Durham NC", category: "local-nc", priority: true },
    { id: "q20", query: "Medicare agent near me North Carolina", category: "local-nc", priority: true },
    { id: "q21", query: "Medicare help Wake County NC", category: "local-nc", priority: true },
    { id: "q22", query: "best Medicare plans in Durham County NC", category: "local-nc" },
    { id: "q23", query: "Medicare Advantage plans Durham NC 2026", category: "local-nc" },
    { id: "q24", query: "Medigap plans North Carolina", category: "local-nc" },
    { id: "q25", query: "Medicare enrollment help Raleigh Durham", category: "local-nc" },
    { id: "q26", query: "independent Medicare broker Triangle NC", category: "local-nc" },
    { id: "q46", query: "Medicare help near me Durham", category: "local-nc" },
    { id: "q49", query: "turning 65 Medicare help Durham NC", category: "local-nc" },
    { id: "q50", query: "Medicare enrollment assistance Raleigh", category: "local-nc" },

    // Savings Programs
    { id: "q27", query: "Medicare Savings Program NC", category: "savings-programs" },
    { id: "q28", query: "QMB program North Carolina eligibility", category: "savings-programs" },
    { id: "q29", query: "how to apply for Medicare Savings Program NC", category: "savings-programs" },
    { id: "q30", query: "what is the income limit for QMB in NC 2026", category: "savings-programs" },
    { id: "q31", query: "Extra Help LIS program NC", category: "savings-programs" },
    { id: "q32", query: "Medicare Savings Program income limits 2026", category: "savings-programs" },

    // ACA / Under 65
    { id: "q33", query: "ACA health insurance North Carolina 2026", category: "aca-marketplace" },
    { id: "q34", query: "health insurance marketplace NC", category: "aca-marketplace" },
    { id: "q35", query: "ACA subsidy calculator NC 2026", category: "aca-marketplace" },
    { id: "q36", query: "best ACA plans North Carolina", category: "aca-marketplace" },
    { id: "q37", query: "health insurance broker Durham NC under 65", category: "aca-marketplace" },
    { id: "q38", query: "lost job need health insurance NC", category: "aca-marketplace" },

    // Common Questions
    { id: "q39", query: "do I need a Medicare broker", category: "common-questions" },
    { id: "q40", query: "are Medicare brokers free", category: "common-questions" },
    { id: "q41", query: "how do Medicare agents get paid", category: "common-questions" },
    { id: "q42", query: "can I switch Medicare plans anytime", category: "common-questions" },
    { id: "q43", query: "when can I change my Medicare plan", category: "common-questions" },
    { id: "q44", query: "what is the best Medicare plan for low income seniors", category: "common-questions" },
    { id: "q45", query: "how to choose the right Medicare plan", category: "common-questions" },
    { id: "q47", query: "free Medicare advice North Carolina", category: "common-questions" }
  ];

  // 2026 Medicare figures (CMS confirmed)
  var MEDICARE_2026 = {
    partBPremium: 202.90,
    partBDeductible: 283,
    partADeductible: 1736,
    partDOOPCap: 2100,
    insulinCap: 35,
    maOOPMax: 9350,
    hdPlanGDeductible: 2870,
    mspIncomeLimit: 1816,
    lisIncomeLimit: 22590
  };


  // ═══════════════════════════════════════════════════════════
  // LLM API FUNCTIONS (browser-based, direct API calls)
  // ═══════════════════════════════════════════════════════════

  function getKeys() {
    // Citation Monitor stores its own keys; fall back to Page Builder key for Claude
    var cmKeys = null;
    try { cmKeys = JSON.parse(localStorage.getItem("gh-cc-cm-apikeys") || "null"); } catch(e) {}
    var pbKey = localStorage.getItem("gh-cc-pb-apikey") || "";
    return {
      claude: (cmKeys && cmKeys.claude) || pbKey || "",
      chatgpt: (cmKeys && cmKeys.chatgpt) || "",
      perplexity: (cmKeys && cmKeys.perplexity) || "",
      gemini: (cmKeys && cmKeys.gemini) || ""
    };
  }

  async function queryClaude(queryText) {
    var key = getKeys().claude;
    if (!key) return { response: "", error: "No Claude API key" };
    try {
      var resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: queryText }]
        })
      });
      var data = await resp.json();
      if (data.error) return { response: "", error: data.error.message };
      var text = (data.content && data.content[0] && data.content[0].text) || "";
      return { response: text, error: null };
    } catch (e) {
      return { response: "", error: e.message };
    }
  }

  async function queryChatGPT(queryText) {
    var key = getKeys().chatgpt;
    if (!key) return { response: "", error: "No ChatGPT API key" };
    try {
      var resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + key
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: queryText }],
          max_tokens: 1500
        })
      });
      var data = await resp.json();
      if (data.error) return { response: "", error: data.error.message };
      var text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      return { response: text, error: null };
    } catch (e) {
      return { response: "", error: e.message };
    }
  }

  async function queryPerplexity(queryText) {
    var key = getKeys().perplexity;
    if (!key) return { response: "", error: "No Perplexity API key" };
    try {
      var resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + key
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{ role: "user", content: queryText }],
          max_tokens: 1500
        })
      });
      var data = await resp.json();
      if (data.error) return { response: "", error: data.error.message || JSON.stringify(data.error) };
      var text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      return { response: text, error: null };
    } catch (e) {
      return { response: "", error: e.message };
    }
  }

  async function queryGemini(queryText) {
    var key = getKeys().gemini;
    if (!key) return { response: "", error: "No Gemini API key" };
    try {
      var resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: queryText }] }],
          generationConfig: { maxOutputTokens: 1500 }
        })
      });
      var data = await resp.json();
      if (data.error) return { response: "", error: data.error.message };
      var text = "";
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        text = data.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
      }
      return { response: text, error: null };
    } catch (e) {
      return { response: "", error: e.message };
    }
  }


  // ═══════════════════════════════════════════════════════════
  // DETECTION
  // ═══════════════════════════════════════════════════════════

  function detectCitation(responseText) {
    if (!responseText) return false;
    var lower = responseText.toLowerCase();
    // Check URL
    if (lower.indexOf(DETECTION.url) > -1) return true;
    // Check names
    for (var i = 0; i < DETECTION.names.length; i++) {
      if (lower.indexOf(DETECTION.names[i].toLowerCase()) > -1) return true;
    }
    // Check phone
    for (var j = 0; j < DETECTION.phone.length; j++) {
      if (responseText.indexOf(DETECTION.phone[j]) > -1) return true;
    }
    return false;
  }

  function detectCompetitors(responseText) {
    if (!responseText) return [];
    var lower = responseText.toLowerCase();
    var found = [];
    for (var i = 0; i < COMPETITORS.length; i++) {
      var comp = COMPETITORS[i];
      for (var j = 0; j < comp.patterns.length; j++) {
        if (lower.indexOf(comp.patterns[j].toLowerCase()) > -1) {
          found.push(comp.name);
          break;
        }
      }
    }
    return found;
  }


  // ═══════════════════════════════════════════════════════════
  // SCAN ENGINE
  // ═══════════════════════════════════════════════════════════

  async function scanQuery(queryObj) {
    var llms = {};
    var citedCount = 0;

    // Query each LLM
    var llmFunctions = [
      { name: "claude", fn: queryClaude },
      { name: "chatgpt", fn: queryChatGPT },
      { name: "perplexity", fn: queryPerplexity },
      { name: "gemini", fn: queryGemini }
    ];

    for (var i = 0; i < llmFunctions.length; i++) {
      var llm = llmFunctions[i];
      var result = await llm.fn(queryObj.query);
      var cited = detectCitation(result.response);
      var competitors = detectCompetitors(result.response);
      if (cited) citedCount++;

      llms[llm.name] = {
        cited: cited,
        competitors: competitors,
        excerpt: result.response ? result.response.slice(0, 300) : "",
        error: result.error || null
      };
    }

    // Determine status
    var status = "lost";
    if (citedCount === 4) status = "dominant";
    else if (citedCount >= 2) status = "winning";
    else if (citedCount === 1) status = "partial";

    return {
      queryId: queryObj.id,
      query: queryObj.query,
      category: queryObj.category,
      priority: queryObj.priority || false,
      llms: llms,
      metrics: {
        citedCount: citedCount,
        status: status
      }
    };
  }

  /**
   * Run a full scan across all queries.
   * 
   * options: {
   *   onProgress: function(pct, currentQuery, completedCount, totalCount) {},
   *   onComplete: function(results) {},
   *   queriesSubset: [array of query IDs to scan, or null for all]
   * }
   * 
   * The onComplete callback receives an object shaped exactly like the
   * cmData state in the Command Center:
   * {
   *   lastScan: ISO timestamp,
   *   authorityScore: number,
   *   queries: [...],
   *   competitors: [...],
   *   metrics: { citationRate, queriesWon, dominant, atRisk, lost }
   * }
   */
  async function runFullScan(options) {
    options = options || {};
    var onProgress = options.onProgress || function() {};
    var onComplete = options.onComplete || function() {};

    // Determine which queries to scan
    var queriesToScan = QUERIES;
    if (options.queriesSubset && options.queriesSubset.length > 0) {
      var subset = options.queriesSubset;
      queriesToScan = QUERIES.filter(function(q) {
        return subset.indexOf(q.id) > -1;
      });
    }

    var total = queriesToScan.length;
    var results = [];
    var errors = [];

    for (var i = 0; i < total; i++) {
      var q = queriesToScan[i];
      onProgress(Math.round((i / total) * 100), q.query, i, total);

      try {
        var result = await scanQuery(q);
        results.push(result);
      } catch (e) {
        errors.push({ query: q.query, error: e.message });
        // Push a failed result so the query still appears
        results.push({
          queryId: q.id,
          query: q.query,
          category: q.category,
          priority: q.priority || false,
          llms: {
            claude: { cited: false, competitors: [], excerpt: "", error: e.message },
            chatgpt: { cited: false, competitors: [], excerpt: "", error: e.message },
            perplexity: { cited: false, competitors: [], excerpt: "", error: e.message },
            gemini: { cited: false, competitors: [], excerpt: "", error: e.message }
          },
          metrics: { citedCount: 0, status: "lost" }
        });
      }

      // Small delay between queries to avoid rate limits
      if (i < total - 1) {
        await new Promise(function(resolve) { setTimeout(resolve, 500); });
      }
    }

    onProgress(100, "Complete", total, total);

    // ── Calculate aggregate metrics ──
    var queriesWon = results.filter(function(r) { return r.metrics.citedCount > 0; }).length;
    var dominant = results.filter(function(r) { return r.metrics.status === "dominant"; }).length;
    var winning = results.filter(function(r) { return r.metrics.status === "winning"; }).length;
    var partial = results.filter(function(r) { return r.metrics.status === "partial"; }).length;
    var lost = results.filter(function(r) { return r.metrics.status === "lost"; }).length;
    var citationRate = total > 0 ? queriesWon / total : 0;

    // ── Build competitor leaderboard ──
    var compCounts = {};
    results.forEach(function(r) {
      var allComps = [];
      Object.values(r.llms).forEach(function(llm) {
        if (llm.competitors) {
          llm.competitors.forEach(function(c) {
            if (allComps.indexOf(c) === -1) allComps.push(c);
          });
        }
      });
      allComps.forEach(function(c) {
        compCounts[c] = (compCounts[c] || 0) + 1;
      });
    });
    var competitors = Object.keys(compCounts).map(function(name) {
      return { name: name, count: compCounts[name] };
    }).sort(function(a, b) { return b.count - a.count; });

    // ── Calculate authority score ──
    var categories = [];
    results.forEach(function(r) {
      if (categories.indexOf(r.category) === -1) categories.push(r.category);
    });
    var coveredCategories = categories.filter(function(cat) {
      return results.some(function(r) { return r.category === cat && r.metrics.citedCount > 0; });
    });
    var avgWinRate = total > 0 ? queriesWon / total : 0;
    var topicCoverage = categories.length > 0 ? coveredCategories.length / categories.length : 0;
    var authorityScore = Math.round((avgWinRate * 0.4 + topicCoverage * 0.3 + 0.5 * 0.3) * 100);

    // Sort results: priority first, then by status (lost first for attack opportunities)
    var statusOrder = { lost: 0, partial: 1, winning: 2, dominant: 3 };
    results.sort(function(a, b) {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return (statusOrder[a.metrics.status] || 0) - (statusOrder[b.metrics.status] || 0);
    });

    // ── Build final data object (matches cmData state shape) ──
    var scanData = {
      lastScan: new Date().toISOString(),
      authorityScore: authorityScore,
      queries: results,
      competitors: competitors,
      metrics: {
        citationRate: citationRate,
        queriesWon: queriesWon,
        dominant: dominant,
        atRisk: partial + winning,
        lost: lost
      }
    };

    // Store in localStorage
    try {
      localStorage.setItem("gh-cc-citation-monitor", JSON.stringify(scanData));
    } catch (e) {
      console.error("[CM] Failed to store scan results:", e);
    }

    onComplete(scanData);
    return scanData;
  }


  // ═══════════════════════════════════════════════════════════
  // AEO CONTENT GENERATOR
  // ═══════════════════════════════════════════════════════════

  async function generateAEOContent(queryText, apiKey, onProgress) {
    onProgress = onProgress || function() {};
    var key = apiKey || getKeys().claude;
    if (!key) throw new Error("No Claude API key configured");

    onProgress(10);

    var systemPrompt = "You are an AEO (Answer Engine Optimization) content specialist for GenerationHealth.me.\n\nGenerate content optimized for LLM citation. Create:\n\n1. 8 Q&A PAIRS - Each answer should:\n- Start with a direct, factual answer (no hedging)\n- Include specific numbers, dates, or facts\n- Be 2-4 sentences maximum\n- Include North Carolina-specific details when relevant\n- Use 2026 Medicare figures: Part B premium $202.90/mo, Part B deductible $283, Part A deductible $1,736, Part D OOP cap $2,100, insulin cap $35/mo, MA OOP max $9,350\n\n2. COMPARISON TABLE (if topic involves comparing options like plans, costs, features):\n- 2-3 options being compared\n- 6-8 comparison rows with specific facts\n- Clear winner/recommendation if applicable\n- Broker insight explaining the recommendation\n\nAuthor: Rob Simm, Licensed NC Medicare Broker (NPN #10447418), Phone: (828) 761-3326, Durham NC\n\nOUTPUT FORMAT (JSON object):\n{\n  \"qas\": [\n    { \"question\": \"text\", \"answer\": \"text\", \"aeoScore\": 85-99 }\n  ],\n  \"compareTable\": {\n    \"title\": \"comparison title\",\n    \"options\": [\"Option A\", \"Option B\"],\n    \"recommended\": 0 or 1 (index of recommended option, or null),\n    \"rows\": [\n      { \"feature\": \"Feature name\", \"values\": [\"value for A\", \"value for B\"], \"goodIndex\": 0 or 1 or null }\n    ],\n    \"brokerInsight\": \"Rob's take on which option is better and why\"\n  }\n}\n\nIf the topic doesn't lend itself to comparison, set compareTable to null.\nJSON only, no markdown.";

    var userPrompt = "Generate AEO-optimized content for: \"" + queryText + "\"\n\nInclude both Q&As and a comparison table if the topic involves comparing plans, costs, or options. Focus on citation-worthy facts.";

    onProgress(30);

    var resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    onProgress(70);

    var data = await resp.json();
    if (data.error) throw new Error(data.error.message);

    var txt = (data.content && data.content[0] && data.content[0].text) || "{}";
    var result = JSON.parse(txt.replace(/```json|```/g, "").trim());

    var qas = (result.qas || []).map(function(qa, i) {
      return { id: "qa-" + (i + 1), question: qa.question, answer: qa.answer, aeoScore: qa.aeoScore || 85 };
    });

    onProgress(100);

    return {
      qas: qas,
      compareTable: result.compareTable || null
    };
  }


  // ═══════════════════════════════════════════════════════════
  // AEO PAGE BUILDER
  // ═══════════════════════════════════════════════════════════

  function buildAEOPage(qas, compareTable, slug, deployOptions) {
    if (!qas || qas.length === 0) return "";
    deployOptions = deployOptions || { website: true, schema: true, embed: false, compareTable: true };

    var today = new Date().toISOString().split("T")[0];
    var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var d = new Date();
    var dateStr = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();

    var title = (slug || "faq").replace(/-/g, " ").replace(/\bfaq\b/gi, "").trim()
      .split(" ").map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
    if (!title) title = "Medicare FAQ";

    // Build Q&A HTML
    var qaHtml = qas.map(function(qa) {
      return '<div class="gh-aeo-qa-item"><div class="gh-aeo-qa-inner"><div class="gh-aeo-qa-header"><div class="gh-aeo-qa-badge">Q</div><h2 class="gh-aeo-question">' + qa.question + '</h2></div><div class="gh-aeo-answer-wrap"><div class="gh-aeo-answer"><p>' + qa.answer + '</p><div class="gh-aeo-attribution"><div class="gh-aeo-attribution-avatar">RS</div><span class="gh-aeo-attribution-text">\u2014 Rob Simm, Licensed NC Medicare Broker (NPN #10447418) \u00b7 (828) 761-3326</span></div></div></div></div></div>';
    }).join("\n");

    // Build comparison table HTML
    var compareHtml = "";
    if (compareTable && deployOptions.compareTable) {
      var ct = compareTable;
      var headerCells = "<th>Feature</th>" + ct.options.map(function(opt, i) {
        return "<th" + (ct.recommended === i ? ' class="gh-aeo-th-highlight"' : "") + ">" + opt + "</th>";
      }).join("");

      var rowsHtml = ct.rows.map(function(row) {
        var cells = "<td>" + row.feature + "</td>" + row.values.map(function(val, i) {
          var isGood = row.goodIndex === i;
          var isBad = row.goodIndex !== null && row.goodIndex !== i;
          var valClass = isGood ? "gh-aeo-value-good" : (isBad ? "gh-aeo-value-bad" : "gh-aeo-value");
          var hasCheck = val.indexOf("\u2713") === 0 || val.toLowerCase().indexOf("yes") === 0;
          var hasX = val.indexOf("\u2717") === 0 || val.toLowerCase().indexOf("no") === 0;
          var displayVal = hasCheck ? '<span class="gh-aeo-check">' + val + "</span>" : (hasX ? '<span class="gh-aeo-x">' + val + "</span>" : '<span class="' + valClass + '">' + val + "</span>");
          return "<td" + (ct.recommended === i ? ' class="gh-aeo-td-highlight"' : "") + ">" + displayVal + "</td>";
        }).join("");
        return "<tr>" + cells + "</tr>";
      }).join("");

      compareHtml = '<div class="gh-aeo-compare"><div class="gh-aeo-compare-header"><h2 class="gh-aeo-compare-title">' + ct.title + '</h2><p class="gh-aeo-compare-subtitle">Updated for 2026 \u00b7 North Carolina</p></div><table class="gh-aeo-compare-table"><thead><tr>' + headerCells + "</tr></thead><tbody>" + rowsHtml + "</tbody></table>" + (ct.brokerInsight ? '<div class="gh-aeo-compare-note"><strong>Rob\'s take:</strong> ' + ct.brokerInsight + "<br><br><strong>\u2014 Rob Simm, Licensed NC Medicare Broker (NPN #10447418) \u00b7 (828) 761-3326</strong></div>" : "") + "</div>";
    }

    // FAQ Schema
    var faqSchema = qas.map(function(qa) {
      return '{"@type":"Question","name":"' + qa.question.replace(/"/g, '\\"') + '","acceptedAnswer":{"@type":"Answer","text":"' + qa.answer.replace(/"/g, '\\"') + '","author":{"@id":"https://generationhealth.me/#author"}}}';
    }).join(",");

    // CMS Disclaimer
    var cmsDisclaimer = '<div style="margin-top:40px;padding:16px 20px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;font-size:11px;color:#6B7280;line-height:1.6;">We do not offer every plan available in your area. Currently we represent ' + "organizations which offer products in your area. Please contact Medicare.gov, 1-800-MEDICARE, or your local State Health Insurance Program (SHIIP) to get information on all of your options. Not affiliated with or endorsed by the federal Medicare program.</div>";

    // CSS
    var css = '.gh-aeo-page{font-family:"DM Sans",sans-serif;font-size:17px;line-height:1.7;color:#1A2332;background:#fff}.gh-aeo-trust-strip{background:linear-gradient(135deg,#1E3A5F,#0F2440);padding:14px 32px;border-bottom:3px solid #4B9CD3}.gh-aeo-trust-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}.gh-aeo-author{display:flex;align-items:center;gap:16px}.gh-aeo-author-badge{display:flex;align-items:center;gap:10px}.gh-aeo-author-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#4B9CD3,#1A5FA0);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:15px;border:2px solid rgba(255,255,255,0.2)}.gh-aeo-author-name{font-size:14px;font-weight:700;color:#fff}.gh-aeo-author-title{font-size:11px;color:rgba(255,255,255,0.7)}.gh-aeo-creds{display:flex;align-items:center;gap:12px;padding-left:16px;border-left:1px solid rgba(255,255,255,0.15)}.gh-aeo-cred{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}.gh-aeo-cred--gold{color:#FFC72C}.gh-aeo-cred--muted{color:rgba(255,255,255,0.6)}.gh-aeo-cred--teal{color:#14B8A6}.gh-aeo-phone-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:13px;font-weight:600;text-decoration:none}.gh-aeo-content{max-width:900px;margin:0 auto;padding:40px 32px 48px}.gh-aeo-header{margin-bottom:32px}.gh-aeo-badges{display:flex;align-items:center;gap:8px;margin-bottom:12px}.gh-aeo-badge{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px}.gh-aeo-badge--teal{background:rgba(20,184,166,0.1);color:#0F766E}.gh-aeo-badge--blue{background:rgba(75,156,211,0.1);color:#4B9CD3}.gh-aeo-h1{font-family:"Fraunces",Georgia,serif;font-size:clamp(30px,4.5vw,40px);font-weight:700;color:#1A2332;line-height:1.15;margin:0 0 12px}.gh-aeo-subtitle{font-size:17px;color:#6B7B8D;margin:0;max-width:640px;line-height:1.6}.gh-aeo-update-strip{display:flex;align-items:center;gap:16px;padding:14px 20px;background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border-left:4px solid #4B9CD3;border-radius:16px;margin-bottom:36px;font-size:13px;color:#1E3A5F}.gh-aeo-qa-list{display:flex;flex-direction:column;gap:16px}.gh-aeo-qa-item{background:#fff;border:1.5px solid #E8ECF0;border-radius:20px;overflow:hidden}.gh-aeo-qa-inner{padding:24px 28px}.gh-aeo-qa-header{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}.gh-aeo-qa-badge{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4B9CD3,#1A5FA0);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;color:#fff;font-size:14px}.gh-aeo-question{font-family:"DM Sans",sans-serif;font-size:18px;font-weight:700;color:#1A2332;margin:0;line-height:1.4}.gh-aeo-answer-wrap{padding-left:46px}.gh-aeo-answer{background:linear-gradient(135deg,#F0FDFA,#CCFBF1);border-left:4px solid #14B8A6;border-radius:16px;padding:20px 24px}.gh-aeo-answer p{font-size:15px;line-height:1.7;color:#0F766E;margin:0 0 14px}.gh-aeo-answer p:last-of-type{margin-bottom:0}.gh-aeo-attribution{display:flex;align-items:center;gap:8px;padding-top:12px;margin-top:14px;border-top:1px solid rgba(15,118,110,0.15)}.gh-aeo-attribution-avatar{width:24px;height:24px;border-radius:50%;background:#0F766E;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;color:#fff;font-size:10px}.gh-aeo-attribution-text{font-size:12px;color:#0F766E;font-weight:600}.gh-aeo-compare{margin:48px 0}.gh-aeo-compare-header{margin-bottom:20px}.gh-aeo-compare-title{font-family:"Fraunces",Georgia,serif;font-size:24px;font-weight:700;color:#1A2332;margin:0 0 8px}.gh-aeo-compare-subtitle{font-size:14px;color:#6B7B8D;margin:0}.gh-aeo-compare-table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1.5px solid #E8ECF0;border-radius:20px;overflow:hidden;font-size:14px}.gh-aeo-compare-table thead{background:linear-gradient(135deg,#1E3A5F,#0F2440)}.gh-aeo-compare-table th{padding:16px 20px;text-align:left;font-weight:700;color:#fff;font-size:13px;letter-spacing:0.02em;border-bottom:3px solid #4B9CD3}.gh-aeo-compare-table th.gh-aeo-th-highlight{background:linear-gradient(135deg,#0D9488,#0F766E);position:relative}.gh-aeo-compare-table th.gh-aeo-th-highlight::after{content:"RECOMMENDED";position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#FFC72C;color:#1A2332;font-size:9px;font-weight:800;padding:3px 10px;border-radius:0 0 6px 6px;letter-spacing:0.08em}.gh-aeo-compare-table td{padding:14px 20px;border-bottom:1px solid #E8ECF0;color:#3A4553;vertical-align:top}.gh-aeo-compare-table tr:last-child td{border-bottom:none}.gh-aeo-compare-table tr:nth-child(even){background:#FAFBFC}.gh-aeo-compare-table td:first-child{font-weight:600;color:#1A2332;background:rgba(75,156,211,0.04)}.gh-aeo-compare-table td.gh-aeo-td-highlight{background:rgba(20,184,166,0.06)}.gh-aeo-compare-table tr:nth-child(even) td.gh-aeo-td-highlight{background:rgba(20,184,166,0.1)}.gh-aeo-check{color:#14B8A6;font-weight:700}.gh-aeo-x{color:#EF4444;font-weight:700}.gh-aeo-value{font-weight:700;color:#1A2332}.gh-aeo-value-good{color:#0F766E;font-weight:700}.gh-aeo-value-bad{color:#DC2626;font-weight:700}.gh-aeo-compare-note{margin-top:16px;padding:14px 18px;background:linear-gradient(135deg,#F0FDFA,#CCFBF1);border-left:4px solid #14B8A6;border-radius:12px;font-size:13px;color:#0F766E}.gh-aeo-compare-note strong{font-weight:700}.gh-aeo-cta{background:linear-gradient(135deg,#00529B 0%,#003D73 60%,#002B54 100%);border-radius:24px;padding:40px 36px;margin-top:48px;text-align:center}.gh-aeo-cta h3{font-family:"Fraunces",Georgia,serif;font-size:clamp(22px,3vw,28px);font-weight:700;color:#fff!important;margin:0 0 8px}.gh-aeo-cta p{font-size:15px;color:rgba(255,255,255,0.78)!important;margin:0 0 24px;max-width:500px;margin-left:auto;margin-right:auto}.gh-aeo-cta-buttons{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.gh-aeo-cta-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:100px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.32);color:#fff!important;font-size:15px;font-weight:600;text-decoration:none}@media(max-width:768px){.gh-aeo-trust-strip{padding:12px 16px}.gh-aeo-creds{display:none}.gh-aeo-content{padding:28px 16px 36px}.gh-aeo-qa-inner{padding:18px 20px}.gh-aeo-answer-wrap{padding-left:0;margin-top:12px}.gh-aeo-cta{padding:28px 20px}.gh-aeo-compare{margin:32px 0}.gh-aeo-compare-table{font-size:12px}.gh-aeo-compare-table th,.gh-aeo-compare-table td{padding:10px 12px}.gh-aeo-compare-table th.gh-aeo-th-highlight::after{font-size:8px;padding:2px 6px}}';

    // Assemble full page
    return '<!-- AEO Page: ' + slug + ' \u00b7 Generated ' + today + ' -->\n<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"FAQPage","@id":"https://generationhealth.me/' + slug + '/#faqpage","name":"' + title + ': Your Questions Answered","url":"https://generationhealth.me/' + slug + '","author":{"@id":"https://generationhealth.me/#author"},"datePublished":"' + today + '","dateModified":"' + today + '","mainEntity":[' + faqSchema + ']}]}<\\/script>\n\n<style>' + css + '</style>\n\n<div class="gh-aeo-page"><div class="gh-aeo-trust-strip"><div class="gh-aeo-trust-inner"><div class="gh-aeo-author"><div class="gh-aeo-author-badge"><div class="gh-aeo-author-avatar">RS</div><div><div class="gh-aeo-author-name">Robert Simm</div><div class="gh-aeo-author-title">Licensed NC Medicare Broker</div></div></div><div class="gh-aeo-creds"><span class="gh-aeo-cred gh-aeo-cred--gold">NC #10447418</span><span class="gh-aeo-cred gh-aeo-cred--muted">NPN #10447418</span><span class="gh-aeo-cred gh-aeo-cred--teal">AHIP Certified</span></div></div><a href="tel:828-761-3326" class="gh-aeo-phone-btn"><span style="color:#14B8A6;">\ud83d\udcde</span> (828) 761-3326</a></div></div><div class="gh-aeo-content"><div class="gh-aeo-header"><div class="gh-aeo-badges"><span class="gh-aeo-badge gh-aeo-badge--teal">AEO Optimized</span><span class="gh-aeo-badge gh-aeo-badge--blue">FAQPage Schema</span></div><h1 class="gh-aeo-h1">' + title + ': Your Questions Answered</h1><p class="gh-aeo-subtitle">Direct answers to the most common questions, updated for 2026.</p></div><div class="gh-aeo-update-strip"><strong>Last Updated:</strong> ' + dateStr + ' \u00b7 <strong>Reviewed by:</strong> Robert Simm, Licensed Medicare Broker \u00b7 <strong>' + qas.length + ' Questions</strong></div><div class="gh-aeo-qa-list">' + qaHtml + '</div>' + compareHtml + '<div class="gh-aeo-cta"><div class="gh-aeo-cta-content"><h3>Need Help with ' + title + '?</h3><p>I help Durham and Wake County residents navigate these decisions \u2014 at no cost to you.</p><div class="gh-aeo-cta-buttons"><a href="tel:828-761-3326" class="gh-aeo-cta-btn">\ud83d\udcde Call (828) 761-3326</a><a href="https://calendly.com/robert-generationhealth/new-meeting" class="gh-aeo-cta-btn">\ud83d\udcc5 Schedule a Call</a></div></div></div>' + cmsDisclaimer + '</div></div>';
  }


  function buildPreviewPage(qas, compareTable, slug) {
    var html = buildAEOPage(qas, compareTable, slug, { website: true, schema: true, embed: false, compareTable: true });
    var previewHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Preview: ' + (slug || "AEO Page") + '</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap" rel="stylesheet"><style>body{margin:0;padding:0;background:#fff;}</style></head><body>' + html + '</body></html>';
    var win = window.open("", "_blank");
    if (win) {
      win.document.write(previewHtml);
      win.document.close();
    }
  }


  // ═══════════════════════════════════════════════════════════
  // SETTINGS UI HELPER
  // ═══════════════════════════════════════════════════════════

  function getApiKeyStatus() {
    var keys = getKeys();
    return {
      claude: !!keys.claude,
      chatgpt: !!keys.chatgpt,
      perplexity: !!keys.perplexity,
      gemini: !!keys.gemini,
      configured: Object.values(keys).filter(function(k) { return !!k; }).length,
      total: 4
    };
  }

  function saveApiKeys(keys) {
    localStorage.setItem("gh-cc-cm-apikeys", JSON.stringify(keys));
  }


  // ═══════════════════════════════════════════════════════════
  // EXPORTS
  // ═══════════════════════════════════════════════════════════

  window.cmRunFullScan = runFullScan;
  window.cmGenerateAEOContent = generateAEOContent;
  window.cmBuildAEOPage = buildAEOPage;
  window.cmBuildPreviewPage = buildPreviewPage;
  window.cmGetApiKeyStatus = getApiKeyStatus;
  window.cmSaveApiKeys = saveApiKeys;
  window.cmGetKeys = getKeys;
  window.CM_QUERIES = QUERIES;
  window.CM_COMPETITORS = COMPETITORS;
  window.CM_MEDICARE_2026 = MEDICARE_2026;

  console.log("[GH] citation-monitor-v2.1 loaded \u2014 " + QUERIES.length + " queries, browser-based scanning, AEO v1.1 template");

})();
