// ═══════════════════════════════════════════════════════════════════════════
// flattenForElementor-v2 — Reads from GH_HARD_RULES.FLATTENER_RULES
// Replaces the existing flattenForElementor method inside GH_1000
// No hardcoded replacement lists — one source of truth
// ═══════════════════════════════════════════════════════════════════════════

// Standalone script — overrides window.flattenForElementor when loaded via <script src>
// Must load AFTER HARD_RULES.js (reads GH_HARD_RULES.FLATTENER_RULES)

window.flattenForElementor = function(html) {
  if (!html) return '';
  var HR = window.GH_HARD_RULES;
  var out = html;
  
  // ── Step 1: Resolve CSS variables to hex ──
  // Collect all var(--name) references and resolve from TEMPLATE_STRUCTURE tokens
  if (HR && HR.TEMPLATE_STRUCTURE && HR.TEMPLATE_STRUCTURE.tokens) {
    var tokens = HR.TEMPLATE_STRUCTURE.tokens;
    // Map token names to CSS variable format
    var varMap = {};
    Object.keys(tokens).forEach(function(key) {
      varMap['--gh-' + key.replace(/_/g, '-')] = tokens[key];
      // Also handle the raw key as a var name
      varMap['--' + key.replace(/_/g, '-')] = tokens[key];
    });
    // Also add Elementor global overrides
    varMap['--e-global-color-primary'] = tokens.midnight || '#1A2332';
    varMap['--e-global-color-text'] = tokens.charcoal || '#3A4553';
    varMap['--e-global-typography-primary-font-family'] = tokens.font_body || "'DM Sans', sans-serif";
    varMap['--e-global-typography-primary-font-size'] = '16px';
    
    // Replace all var(--name) with resolved values
    out = out.replace(/var\(([^)]+)\)/g, function(match, varName) {
      var name = varName.trim().split(',')[0].trim(); // handle fallbacks
      return varMap[name] || match;
    });
  }
  
  // ── Step 2: Inline critical styles with !important ──
  // The Hello Elementor theme applies its own font-size, font-family, color
  // via inheritance. We must override with !important on key elements.
  
  // Font family enforcement — DM Sans on all text elements
  var bodyFont = (HR && HR.TEMPLATE_STRUCTURE) ? HR.TEMPLATE_STRUCTURE.tokens.font_body : "'DM Sans', sans-serif";
  out = out.replace(/(style="[^"]*)(font-family:[^;"]*)/g, function(match, prefix, fontDecl) {
    if (fontDecl.indexOf('!important') === -1) {
      return prefix + fontDecl + ' !important';
    }
    return match;
  });
  
  // Color enforcement on text
  out = out.replace(/(style="[^"]*)((?:^|;)\s*color:[^;"!]*)([";\s])/g, function(match, prefix, colorDecl, suffix) {
    if (colorDecl.indexOf('!important') === -1 && colorDecl.indexOf('inherit') === -1 && colorDecl.indexOf('currentColor') === -1) {
      return prefix + colorDecl + ' !important' + suffix;
    }
    return match;
  });
  
  // ── Step 3: Extract and consolidate styles ──
  // Move all <style> blocks to one residual block
  // Keep only pseudo-element, hover, keyframe, and media query rules
  var residualCSS = [];
  
  out = out.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function(match, cssContent) {
    // Extract rules we must keep (can't be inlined)
    var keepRules = [];
    // Keyframes
    var kfMatches = cssContent.match(/@keyframes[\s\S]*?\{[\s\S]*?\}\s*\}/g);
    if (kfMatches) keepRules = keepRules.concat(kfMatches);
    // Media queries
    var mqMatches = cssContent.match(/@media[\s\S]*?\{[\s\S]*?\}\s*\}/g);
    if (mqMatches) keepRules = keepRules.concat(mqMatches);
    // Hover/focus pseudo states
    var hoverMatches = cssContent.match(/[^{}]*:(?:hover|focus|active|visited)[^{]*\{[^}]*\}/g);
    if (hoverMatches) keepRules = keepRules.concat(hoverMatches);
    // ::before / ::after
    var pseudoMatches = cssContent.match(/[^{}]*::(?:before|after)[^{]*\{[^}]*\}/g);
    if (pseudoMatches) keepRules = keepRules.concat(pseudoMatches);
    // Details summary marker
    var detailsMatches = cssContent.match(/details[^{]*\{[^}]*\}/g);
    if (detailsMatches) keepRules = keepRules.concat(detailsMatches);
    
    if (keepRules.length > 0) {
      residualCSS = residualCSS.concat(keepRules);
    }
    return ''; // Remove the original <style> block
  });
  
  // Add shimmer keyframes from HARD_RULES if not already present
  if (HR && HR.TEMPLATE_STRUCTURE && HR.TEMPLATE_STRUCTURE.animations) {
    var anims = HR.TEMPLATE_STRUCTURE.animations;
    Object.keys(anims).forEach(function(name) {
      var alreadyHas = residualCSS.some(function(rule) { return rule.indexOf(name) !== -1; });
      if (!alreadyHas) {
        residualCSS.push('@keyframes ' + name + '{' + anims[name] + '}');
      }
    });
  }
  
  // Add mobile responsive rules from HARD_RULES
  if (HR && HR.TEMPLATE_STRUCTURE && HR.TEMPLATE_STRUCTURE.mobile) {
    var mob = HR.TEMPLATE_STRUCTURE.mobile;
    var mobileCSS = '@media(max-width:' + mob.breakpoint + '){';
    mobileCSS += '.gh-hero-actions{' + mob.hero_actions + '}';
    mobileCSS += '.gh-hero-btn,.gh-hero-btn--call,.gh-hero-btn--compare{' + mob.hero_btn + '}';
    mobileCSS += '.gh-ghost,.gh-ghost--call,.gh-ghost--text,.gh-ghost--sched,.gh-ghost--compare{' + mob.ghost_btn + '}';
    mobileCSS += '.gh-cta-grid{' + mob.cta_grid + '}';
    mobileCSS += '.gh-header-phone span{' + mob.header_phone_text + '}';
    mobileCSS += '.gh-header-phone{' + mob.header_phone + '}';
    mobileCSS += '.gh-float-call{' + mob.float_call + '}';
    mobileCSS += '.gh-cred-divider{' + mob.creds_divider + '}';
    mobileCSS += '.gh-comparison{' + mob.comparison + '}';
    mobileCSS += '.gh-hero-inner{padding:48px 24px 32px !important}';
    mobileCSS += '.gh-creds-inner{padding:14px 24px 20px !important}';
    mobileCSS += '}';
    residualCSS.push(mobileCSS);
  }
  
  // Re-insert one consolidated <style> block
  if (residualCSS.length > 0) {
    out = '<style>' + residualCSS.join('\n') + '</style>\n' + out;
  }
  
  // ── Step 4: Strip all <script> blocks ──
  // Elementor removes them anyway; JSON-LD extracted separately
  var jsonLD = [];
  out = out.replace(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi, function(match, content) {
    jsonLD.push(content.trim());
    return '';
  });
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // ── Step 5: Apply FLATTENER_RULES reconciliation ──
  if (HR && HR.FLATTENER_RULES) {
    var FR = HR.FLATTENER_RULES;
    
    // Phone fixes
    if (FR.phone_fixes) {
      FR.phone_fixes.forEach(function(fix) {
        while (out.indexOf(fix.find) !== -1) {
          out = out.replace(fix.find, fix.replace);
        }
      });
    }
    
    // Figure fixes
    if (FR.figure_fixes) {
      FR.figure_fixes.forEach(function(fix) {
        while (out.indexOf(fix.find) !== -1) {
          out = out.replace(fix.find, fix.replace);
        }
      });
    }
    
    // HealthSherpa fixes
    if (FR.healthsherpa_fixes) {
      FR.healthsherpa_fixes.forEach(function(fix) {
        while (out.indexOf(fix.find) !== -1) {
          out = out.replace(fix.find, fix.replace);
        }
      });
    }
  }
  
  // ── Step 6: Also check FAIL_TRIGGERS for any remaining stale values ──
  if (HR && HR.FAIL_TRIGGERS) {
    // Wrong phone — final safety net
    HR.FAIL_TRIGGERS.wrong_phone_patterns.forEach(function(pattern) {
      if (out.indexOf(pattern) !== -1) {
        console.warn("[Flattener] Correcting wrong phone: " + pattern);
        while (out.indexOf(pattern) !== -1) {
          out = out.replace(pattern, HR.BRAND.phone_plain);
        }
      }
    });
    
    // Wrong HealthSherpa
    if (HR.FAIL_TRIGGERS.wrong_healthsherpa) {
      HR.FAIL_TRIGGERS.wrong_healthsherpa.forEach(function(pattern) {
        if (out.indexOf(pattern) !== -1) {
          console.warn("[Flattener] Correcting HealthSherpa ID: " + pattern);
          while (out.indexOf(pattern) !== -1) {
            out = out.replace(pattern, "_agent_id=robert-simm");
          }
        }
      });
    }
  }
  
  // ── Step 7: Bake shimmer spans into ghost buttons if missing ──
  if (HR && HR.TEMPLATE_STRUCTURE && HR.TEMPLATE_STRUCTURE.components.cta_modal) {
    var shimmerConf = HR.TEMPLATE_STRUCTURE.components.cta_modal.shimmer;
    var ghostTypes = ['compare', 'call', 'text', 'sched'];
    ghostTypes.forEach(function(type) {
      var sh = shimmerConf[type];
      if (!sh) return;
      var ghostClass = 'gh-ghost--' + type;
      // If button exists but has no shimmer span, inject one
      var regex = new RegExp('(class="[^"]*' + ghostClass + '[^"]*"[^>]*>)(?!.*?class="ghsb")', 'g');
      out = out.replace(regex, function(match, openTag) {
        var shimmerSpan = '<span class="ghsb" style="position:absolute;top:0;left:-120%;width:85%;height:100%;transform:skewX(-10deg);pointer-events:none;z-index:9;border-radius:inherit;background:linear-gradient(90deg,transparent 0%,' + sh.color + ' 20%,' + sh.color + ' 80%,transparent 100%);animation:ghChain 4.4s linear ' + sh.delay + ' infinite"></span>';
        return openTag + shimmerSpan;
      });
    });
  }
  
  // ── Step 8: Clean up whitespace ──
  out = out.replace(/\n\s*\n\s*\n/g, '\n\n');
  out = out.trim();
  
  // ── Return flattened HTML string (backward compatible) ──
  // JSON-LD is included inline in the output string
  return out;
};

console.log("[GH] flattenForElementor-v2 loaded — reads from GH_HARD_RULES.FLATTENER_RULES");
