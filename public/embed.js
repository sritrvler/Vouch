(function () {
  'use strict';

  var ATTR = 'data-vouch';
  var base =
    window.VOUCH_BASE_URL ||
    (document.currentScript && document.currentScript.src.replace('/embed.js', '')) ||
    '';

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function safeColor(val, fallback) {
    if (!val) return fallback;
    if (/^#[0-9a-fA-F]{3,8}$/.test(val)) return val;
    if (/^(rgb|hsl)a?\([^)]+\)$/.test(val)) return val;
    return fallback;
  }

  function safeFontUrl(url) {
    if (!url || typeof url !== 'string') return null;
    var trimmed = url.trim();
    if (trimmed.indexOf('https://') !== 0) return null;
    if (/javascript:|data:/i.test(trimmed)) return null;
    return trimmed;
  }

  function safeFontFamily(val) {
    if (!val || typeof val !== 'string') return null;
    var cleaned = val.replace(/[^a-zA-Z0-9 -]/g, '').trim();
    return cleaned || null;
  }

  // Known Google Fonts lookup (value -> CSS URL)
  var GFONT_MAP = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
    'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
    'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap',
    'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    'Source Sans 3': 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap',
    'Work Sans': 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap',
    'DM Sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
    'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
    'Manrope': 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    'Space Grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
  };

  function resolveFontConfig(theme, project) {
    // Widget theme font takes precedence over project font
    var family = (theme && theme.fontFamily) || null;
    var url = (theme && theme.fontUrl) || null;

    // If widget says "inherit", check project-level font
    if (!family || family === 'inherit') {
      family = (project && project.fontFamily) || null;
      url = (project && project.fontUrl) || null;
    }

    // Still inherit or null? No font to load
    if (!family || family === 'inherit') return null;

    var safeName = safeFontFamily(family);
    if (!safeName) return null;

    // Check Google Fonts map first
    var gUrl = GFONT_MAP[safeName];
    if (gUrl) return { family: safeName, url: gUrl };

    // Custom URL
    var safeUrl = safeFontUrl(url);
    if (safeUrl) return { family: safeName, url: safeUrl };

    // Family name but no loadable URL: set family anyway (may already be loaded on host page)
    return { family: safeName, url: null };
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var then = new Date(dateStr).getTime();
    if (isNaN(then)) return '';
    var now = Date.now();
    var diff = Math.max(0, now - then);
    var sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + (min === 1 ? ' minute ago' : ' minutes ago');
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + (hr === 1 ? ' hour ago' : ' hours ago');
    var day = Math.floor(hr / 24);
    if (day < 30) return day + (day === 1 ? ' day ago' : ' days ago');
    var mo = Math.floor(day / 30);
    if (mo < 12) return mo + (mo === 1 ? ' month ago' : ' months ago');
    var yr = Math.floor(mo / 12);
    return yr + (yr === 1 ? ' year ago' : ' years ago');
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function initials(name) {
    return (name || '')
      .split(' ')
      .map(function (w) { return w[0] || ''; })
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function companyDomain(company) {
    return (
      company
        .toLowerCase()
        .replace(/\b(inc|llc|ltd|corp|co|company|technologies|tech|labs|group|solutions|services)\b\.?/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 30) + '.com'
    );
  }

  // ── SVG icons ────────────────────────────────────────────────────────────────

  function starSvg(filled, color) {
    return (
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="' +
      (filled ? color : 'none') +
      '" stroke="' +
      (filled ? color : '#cbd5e1') +
      '" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    );
  }

  function stars(rating, color) {
    var r = typeof rating === 'number' ? rating : 0;
    var html = '<span style="display:flex;gap:2px">';
    for (var i = 1; i <= 5; i++) html += starSvg(i <= r, color);
    html += '</span>';
    return html;
  }

  var xIcon =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  var linkedInIcon =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
  var shieldIcon =
    '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>';

  // ── Avatar ───────────────────────────────────────────────────────────────────

  function avatarHtml(name, avatarUrl, company, primaryColor) {
    var init = esc(initials(name));
    if (avatarUrl) {
      return (
        '<img src="' + esc(avatarUrl) + '" alt="' + esc(name) +
        '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0">'
      );
    }
    if (company) {
      var domain = companyDomain(company);
      return (
        '<span style="position:relative;width:36px;height:36px;flex-shrink:0;display:inline-block">' +
        '<img src="https://logo.clearbit.com/' + esc(domain) +
        '" alt="" data-vouch-fallback ' +
        'style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#f8fafc;padding:4px;border:1px solid #f1f5f9;display:block">' +
        '<span style="display:none;position:absolute;inset:0;width:36px;height:36px;border-radius:50%;background:' +
        primaryColor + '20;color:' + primaryColor +
        ';font-size:12px;font-weight:700;align-items:center;justify-content:center">' + init + '</span></span>'
      );
    }
    return (
      '<span style="width:36px;height:36px;border-radius:50%;background:' +
      primaryColor + '20;color:' + primaryColor +
      ';display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">' +
      init + '</span>'
    );
  }

  // ── Card renderer ────────────────────────────────────────────────────────────

  function renderCard(t, theme, compact) {
    var pc = safeColor(theme.primaryColor, '#6366F1');
    var tc = safeColor(theme.textColor, '#0f172a');
    var bg = safeColor(theme.backgroundColor, '#ffffff');
    var cs = theme.cardStyle || 'shadow';
    var border = cs === 'border' ? '1px solid #e2e8f0' : 'none';
    var shadow = cs === 'shadow' ? '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)' : 'none';
    var pad = compact ? '14px 16px' : '20px';
    var gap = compact ? '10' : '14';
    var authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

    // Golden sentence
    var content = t.content || '';
    var golden = t.golden_sentence;
    var hasGolden = !!(golden && content && content.indexOf(golden) !== -1);
    var quoteHtml = '';
    if (hasGolden) {
      var idx = content.indexOf(golden);
      var before = content.slice(0, idx);
      var after = content.slice(idx + golden.length);
      quoteHtml =
        (before ? '<span style="color:#9ca3af">' + esc(before) + '</span>' : '') +
        '<span style="color:' + tc + ';font-weight:600">' + esc(golden) + '</span>' +
        (after ? '<span style="color:#9ca3af">' + esc(after) + '</span>' : '');
    } else {
      quoteHtml = '<span style="color:' + tc + '">' + esc(content) + '</span>';
    }

    // Skip card if no content at all
    if (!content) return '';

    // Verification
    var src = t.source_url || '';
    var isX = src.indexOf('twitter.com') !== -1 || src.indexOf('x.com') !== -1;
    var isLI = src.indexOf('linkedin.com') !== -1;
    var vDate = '';
    if (t.created_at) {
      var d = new Date(t.created_at);
      if (!isNaN(d.getTime())) {
        vDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }

    var verifyHtml = '';
    if (isX || isLI) {
      verifyHtml =
        '<a href="' + esc(src) + '" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;color:#9ca3af;text-decoration:none">' +
        (isX ? xIcon : linkedInIcon) + '</a>';
    } else if (vDate) {
      verifyHtml =
        '<span style="font-size:10px;color:#9ca3af;flex-shrink:0;white-space:nowrap">&#10003; ' + esc(vDate) + '</span>';
    }

    var html =
      '<article style="background:' + bg + ';border:' + border + ';box-shadow:' + shadow +
      ';border-radius:14px;padding:' + pad + ';display:flex;flex-direction:column;gap:' + gap + 'px">';

    // Identity
    html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">';
    if (theme.showAvatar !== false) {
      html += '<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">';
      html += avatarHtml(t.author_name, t.author_avatar_url, t.author_company, pc);
      html += '<div style="min-width:0">';
      html += '<div style="font-weight:700;font-size:13px;color:' + tc + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(t.author_name) + '</div>';
      if (authorLine) {
        html += '<div style="font-size:11px;color:#6b7280;line-height:1.4">' + esc(authorLine) + '</div>';
      }
      if (t.email_domain) {
        html += '<div style="display:flex;align-items:center;gap:3px;margin-top:2px;font-size:10px;font-weight:600;color:#059669">' + shieldIcon + esc(t.email_domain) + '</div>';
      }
      html += '</div></div>';
    }
    html += verifyHtml;
    html += '</div>';

    // Quote (hidden when show_text is false and testimonial has video)
    if (t.show_text !== false || !t.video_url) {
      html +=
        '<blockquote style="margin:0;padding:0"><p style="font-size:' + (compact ? '13' : '14') +
        'px;line-height:1.65;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical">' +
        '&ldquo;' + quoteHtml + '&rdquo;</p></blockquote>';
    }

    // Proof
    html += '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px">';
    if (theme.showRating !== false) html += stars(t.rating, pc);
    if (t.metric_label) {
      html +=
        '<span style="font-size:10px;font-weight:600;color:' + pc + ';background:' + pc +
        '15;border:1px solid ' + pc + '30;border-radius:999px;padding:2px 8px;white-space:nowrap">' +
        esc(t.metric_label) + '</span>';
    }
    if (theme.showDate !== false) {
      var ago = timeAgo(t.created_at);
      if (ago) {
        html += '<span style="font-size:10px;color:#9ca3af;margin-left:auto">' + ago + '</span>';
      }
    }
    html += '</div>';

    // Video (thumbnail-first: poster + play button, loads video on click)
    if (t.video_url && t.show_video !== false) {
      html +=
        '<div data-vouch-video data-src="' + esc(t.video_url) + '"' +
        (t.video_thumbnail_url ? ' data-poster="' + esc(t.video_thumbnail_url) + '"' : '') +
        ' style="position:relative;width:100%;border-radius:8px;margin-top:8px;overflow:hidden;background:#000;cursor:pointer">' +
        (t.video_thumbnail_url
          ? '<img src="' + esc(t.video_thumbnail_url) + '" alt="" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover" />'
          : '<div style="width:100%;aspect-ratio:16/9"></div>') +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19"/></svg>' +
        '</div></div></div>';
    }

    html += '</article>';
    return html;
  }

  // ── Single layout (different card structure) ─────────────────────────────────

  function renderSingle(testimonials, theme) {
    var t = null;
    for (var i = 0; i < testimonials.length; i++) {
      if (testimonials[i].featured) { t = testimonials[i]; break; }
    }
    if (!t) t = testimonials[0];
    if (!t) return '';

    var pc = safeColor(theme.primaryColor, '#6366F1');
    var tc = safeColor(theme.textColor, '#0f172a');
    var bg = safeColor(theme.backgroundColor, '#ffffff');
    var authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

    var content = t.content || '';
    var golden = t.golden_sentence;
    var hasGolden = !!(golden && content && content.indexOf(golden) !== -1);
    var quoteHtml = '';
    if (hasGolden) {
      var idx = content.indexOf(golden);
      quoteHtml =
        (content.slice(0, idx) ? '<span style="color:#9ca3af">' + esc(content.slice(0, idx)) + '</span>' : '') +
        '<span style="color:' + tc + ';font-weight:600">' + esc(golden) + '</span>' +
        (content.slice(idx + golden.length) ? '<span style="color:#9ca3af">' + esc(content.slice(idx + golden.length)) + '</span>' : '');
    } else {
      quoteHtml = esc(content);
    }

    var src = t.source_url || '';
    var isX = src.indexOf('twitter.com') !== -1 || src.indexOf('x.com') !== -1;
    var isLI = src.indexOf('linkedin.com') !== -1;

    var html =
      '<article style="background:' + bg + ';border-radius:16px;padding:32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08)">';
    if (theme.showRating !== false) {
      html += '<div style="display:flex;justify-content:center;margin-bottom:16px">' + stars(t.rating, pc) + '</div>';
    }
    if (t.show_text !== false || !t.video_url) {
      html +=
        '<blockquote style="margin:0 0 24px"><p style="font-size:18px;line-height:1.7;font-style:italic;margin:0;color:' + tc + '">&ldquo;' +
        quoteHtml + '&rdquo;</p></blockquote>';
    }
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:12px">';
    if (theme.showAvatar !== false) {
      html += avatarHtml(t.author_name, t.author_avatar_url, t.author_company, pc);
    }
    html += '<div style="text-align:left">';
    html += '<div style="font-weight:700;font-size:14px;color:' + tc + '">' + esc(t.author_name) + '</div>';
    if (authorLine) html += '<div style="font-size:12px;color:#6b7280">' + esc(authorLine) + '</div>';
    if (t.metric_label) {
      html +=
        '<span style="font-size:10px;font-weight:600;color:' + pc + ';background:' + pc +
        '15;border-radius:999px;padding:2px 8px;display:inline-block;margin-top:4px">' + esc(t.metric_label) + '</span>';
    }
    html += '</div>';
    if (src && (isX || isLI)) {
      html +=
        '<a href="' + esc(src) + '" target="_blank" rel="noopener noreferrer" style="color:#9ca3af;margin-left:8px;text-decoration:none">' +
        (isX ? xIcon : linkedInIcon) + '</a>';
    }
    html += '</div></article>';
    return html;
  }

  // ── Layouts ──────────────────────────────────────────────────────────────────

  function renderGrid(testimonials, theme) {
    var html = '<div style="columns:280px;column-gap:16px;padding:4px">';
    for (var i = 0; i < testimonials.length; i++) {
      html += '<div style="break-inside:avoid;margin-bottom:16px">' + renderCard(testimonials[i], theme, false) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderCarousel(testimonials, theme) {
    // Fall back to single layout for 1 testimonial (carousel needs 2+)
    if (testimonials.length < 2) return renderSingle(testimonials, theme);
    var doubled = testimonials.concat(testimonials);
    var html =
      '<style>' +
      '@keyframes vouch-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}' +
      '.vouch-track{animation:vouch-scroll 30s linear infinite}' +
      '.vouch-track:hover{animation-play-state:paused}' +
      '</style>' +
      '<div style="overflow:hidden;padding:4px 0"><div class="vouch-track" style="display:flex;gap:16px;width:max-content">';
    for (var i = 0; i < doubled.length; i++) {
      html += '<div style="width:300px;flex-shrink:0">' + renderCard(doubled[i], theme, false) + '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderWall(testimonials, theme) {
    var html = '<div style="columns:280px;column-gap:16px;padding:4px">';
    for (var i = 0; i < testimonials.length; i++) {
      html += '<div style="break-inside:avoid;margin-bottom:16px">' + renderCard(testimonials[i], theme, true) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderList(testimonials, theme) {
    var html = '<div style="display:flex;flex-direction:column;gap:12px;padding:4px">';
    for (var i = 0; i < testimonials.length; i++) {
      html += renderCard(testimonials[i], theme, true);
    }
    html += '</div>';
    return html;
  }

  // ── Editorial layout ─────────────────────────────────────────────────────────

  function parseColorBrightness(color) {
    // Returns 0-255 red channel value, or -1 if unparseable
    if (!color) return -1;
    var hexMatch = color.match(/^#([0-9a-fA-F]{2})/);
    if (hexMatch) return parseInt(hexMatch[1], 16);
    var rgbMatch = color.match(/^rgba?\(\s*(\d+)/);
    if (rgbMatch) return parseInt(rgbMatch[1], 10);
    return -1;
  }

  function editorialStyles(tc, pc) {
    // Compute muted context color from text color
    var isLightText = false;
    var brightness = parseColorBrightness(tc);
    if (brightness >= 0) {
      isLightText = brightness > 160;
    }
    var contextColor = isLightText ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)';
    var goldenColor = tc || (isLightText ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)');
    var mutedColor = isLightText ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
    var ruleColor = isLightText ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    var quoteMarkColor = isLightText ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    var navColor = isLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    var navHoverColor = isLightText ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';

    return (
      '.ed-wrapper{position:relative;max-width:960px;margin:0 auto;padding:48px 0 32px}' +
      '.ed-rule{width:48px;height:1px;background:' + ruleColor + ';margin-bottom:40px}' +
      '.ed-slides{position:relative;overflow:hidden;min-height:120px}' +
      '.ed-slide{position:absolute;inset:0;opacity:0;visibility:hidden;' +
        'transition:opacity 500ms cubic-bezier(0.16,1,0.3,1),visibility 500ms cubic-bezier(0.16,1,0.3,1),' +
        'transform 500ms cubic-bezier(0.16,1,0.3,1)}' +
      '.ed-slide.ed-active{opacity:1;visibility:visible;position:relative;transform:translateY(0)}' +
      '.ed-slide.ed-exit-up{opacity:0;transform:translateY(-8px)}' +
      '.ed-slide.ed-enter-below{opacity:0;transform:translateY(12px)}' +
      '.ed-layout{display:grid;grid-template-columns:200px 1fr;gap:48px;align-items:center}' +
      '.ed-media{display:flex;flex-direction:column;align-items:center;gap:16px}' +
      '.ed-photo{width:88px;height:88px;border-radius:50%;object-fit:cover;flex-shrink:0}' +
      '.ed-initials{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;' +
        'justify-content:center;font-size:28px;font-weight:600;color:#fff;flex-shrink:0}' +
      '.ed-media-name{font-size:15px;font-weight:600;color:' + goldenColor + ';text-align:center;line-height:1.3}' +
      '.ed-media-role{font-size:13px;font-weight:400;color:' + mutedColor + ';text-align:center;line-height:1.3;margin-top:2px;letter-spacing:0.02em}' +
      '.ed-media-logo{max-height:24px;width:auto;opacity:0.45;margin-top:4px;filter:grayscale(100%)}' +
      '.ed-content{position:relative}' +
      '.ed-qmark{position:absolute;top:-16px;left:-6px;font-size:72px;line-height:1;font-weight:300;' +
        'color:' + quoteMarkColor + ';pointer-events:none;user-select:none;font-family:Georgia,serif}' +
      '.ed-quote{font-size:22px;line-height:1.55;margin:0 0 0 0;letter-spacing:-0.01em;position:relative;z-index:1}' +
      '.ed-quote .ed-context{color:' + contextColor + ';font-weight:400}' +
      '.ed-quote .ed-golden{color:' + goldenColor + ';font-weight:500}' +
      '.ed-quote .ed-plain{color:' + goldenColor + ';font-weight:400}' +
      '.ed-nav{display:flex;align-items:center;gap:12px;margin-top:32px;justify-content:flex-end}' +
      '.ed-counter{font-size:13px;font-weight:400;letter-spacing:0.05em;color:' + navColor + ';' +
        'font-variant-numeric:tabular-nums}' +
      '.ed-arrow{width:44px;height:44px;border:none;background:none;cursor:pointer;display:flex;' +
        'align-items:center;justify-content:center;font-size:18px;color:' + navColor + ';' +
        'transition:color 200ms;padding:0;border-radius:50%}' +
      '.ed-arrow:hover{color:' + navHoverColor + '}' +
      '.ed-arrow:focus-visible{outline:2px solid ' + (pc || '#6366f1') + ';outline-offset:2px}' +
      '.ed-video-badge{position:absolute;bottom:8px;right:8px;width:32px;height:32px;border-radius:50%;' +
        'background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer}' +
      '@media(max-width:640px){' +
        '.ed-wrapper{padding:32px 16px 24px}' +
        '.ed-layout{grid-template-columns:1fr;gap:24px;text-align:center}' +
        '.ed-media{flex-direction:row;align-items:center;gap:14px;justify-content:center}' +
        '.ed-photo,.ed-initials{width:56px;height:56px;font-size:20px}' +
        '.ed-media-info{text-align:left}' +
        '.ed-media-logo{display:none}' +
        '.ed-qmark{font-size:48px;top:-12px;left:-4px}' +
        '.ed-quote{font-size:19px;line-height:1.5}' +
        '.ed-nav{justify-content:center;margin-top:24px}' +
        '.ed-rule{margin:0 auto 28px}' +
        '.ed-content{text-align:left}' +
      '}' +
      '@media(max-width:480px){' +
        '.ed-photo,.ed-initials{width:48px;height:48px;font-size:18px}' +
        '.ed-quote{font-size:17px}' +
      '}'
    );
  }

  function renderEditorial(testimonials, theme) {
    if (!testimonials.length) return { html: '', mount: function () {} };

    var tc = safeColor(theme.textColor, '#0f172a');
    var pc = safeColor(theme.primaryColor, '#6366F1');
    var single = testimonials.length === 1;
    var isLight = parseColorBrightness(tc) > 160;
    var borderColor = isLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

    // Build slides HTML
    var slidesHtml = '';
    for (var i = 0; i < testimonials.length; i++) {
      var t = testimonials[i];
      var authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

      // Golden sentence handling: dim context, golden at full contrast
      var content = t.content || '';
      var golden = t.golden_sentence;
      var hasGolden = !!(golden && content && content.indexOf(golden) !== -1);
      var quoteHtml = '';
      if (hasGolden) {
        var idx = content.indexOf(golden);
        var before = content.slice(0, idx);
        var after = content.slice(idx + golden.length);
        quoteHtml =
          (before ? '<span class="ed-context">' + esc(before) + '</span>' : '') +
          '<span class="ed-golden">' + esc(golden) + '</span>' +
          (after ? '<span class="ed-context">' + esc(after) + '</span>' : '');
      } else {
        quoteHtml = '<span class="ed-plain">' + esc(content) + '</span>';
      }

      // Author photo: avatar, Clearbit logo fallback, or initials
      var photoHtml = '';
      if (t.author_avatar_url) {
        photoHtml = '<img class="ed-photo" src="' + esc(t.author_avatar_url) + '" alt="' + esc(t.author_name) + '">';
      } else if (t.author_company) {
        var domain = companyDomain(t.author_company);
        var init = esc(initials(t.author_name));
        photoHtml =
          '<span style="position:relative;width:88px;height:88px;display:inline-block;flex-shrink:0">' +
          '<img class="ed-photo" src="https://logo.clearbit.com/' + esc(domain) +
          '" alt="" data-vouch-fallback style="object-fit:contain;padding:16px;border:1px solid ' + borderColor + '">' +
          '<span class="ed-initials" style="display:none;position:absolute;inset:0;background:' +
          pc + '20;color:' + pc + '">' + init + '</span></span>';
      } else {
        var init2 = esc(initials(t.author_name));
        photoHtml = '<span class="ed-initials" style="background:' + pc + '20;color:' + pc + '">' + init2 + '</span>';
      }

      // Company logo (from project logo or Clearbit)
      var logoHtml = '';
      if (t.author_company) {
        var logoDomain = companyDomain(t.author_company);
        logoHtml = '<img class="ed-media-logo" src="https://logo.clearbit.com/' + esc(logoDomain) +
          '" alt="' + esc(t.author_company) + '" data-vouch-fallback>';
      }

      // Video play badge on photo
      var videoBadgeHtml = '';
      if (t.video_url && t.show_video !== false) {
        videoBadgeHtml =
          '<div class="ed-video-badge" data-vouch-video data-src="' + esc(t.video_url) + '"' +
          (t.video_thumbnail_url ? ' data-poster="' + esc(t.video_thumbnail_url) + '"' : '') + '>' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19"/></svg>' +
          '</div>';
      }

      slidesHtml +=
        '<div class="ed-slide' + (i === 0 ? ' ed-active' : '') + '"' +
        ' role="group" aria-roledescription="slide"' +
        ' aria-label="Testimonial ' + (i + 1) + ' of ' + testimonials.length + '"' +
        (i !== 0 ? ' aria-hidden="true"' : '') + '>' +
        '<div class="ed-layout">' +
          '<div class="ed-media">' +
            '<div style="position:relative">' + photoHtml + videoBadgeHtml + '</div>' +
            '<div class="ed-media-info">' +
              '<div class="ed-media-name">' + esc(t.author_name) + '</div>' +
              (authorLine ? '<div class="ed-media-role">' + esc(authorLine) + '</div>' : '') +
            '</div>' +
            logoHtml +
          '</div>' +
          '<div class="ed-content">' +
            '<span class="ed-qmark" aria-hidden="true">\u201C</span>' +
            '<blockquote class="ed-quote"><p style="margin:0">' + quoteHtml + '</p></blockquote>' +
          '</div>' +
        '</div>' +
        '</div>';
    }

    // Navigation
    var navHtml = '';
    if (!single) {
      navHtml =
        '<div class="ed-nav">' +
        '<button class="ed-arrow ed-prev" aria-label="Previous testimonial">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>' +
        '</button>' +
        '<span class="ed-counter">1 / ' + testimonials.length + '</span>' +
        '<button class="ed-arrow ed-next" aria-label="Next testimonial">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>' +
        '</button>' +
        '</div>';
    }

    var css = editorialStyles(tc, pc);
    var html =
      '<style>' + css + '</style>' +
      '<div class="ed-wrapper"' +
      (!single ? ' tabindex="0" aria-roledescription="carousel" aria-label="Testimonials"' : '') + '>' +
      '<div class="ed-rule" aria-hidden="true"></div>' +
      '<div class="ed-slides">' + slidesHtml + '</div>' +
      navHtml +
      '</div>';

    function mount(rootContainer) {
      if (single) return;

      var shadowRoot = rootContainer.getRootNode();
      var slides = shadowRoot.querySelectorAll('.ed-slide');
      var counter = shadowRoot.querySelector('.ed-counter');
      var prevBtn = shadowRoot.querySelector('.ed-prev');
      var nextBtn = shadowRoot.querySelector('.ed-next');
      var wrapper = shadowRoot.querySelector('.ed-wrapper');
      var total = slides.length;
      var current = 0;
      var interval = null;
      var ROTATE_MS = 8000;

      function goTo(index) {
        var prev = current;
        var next = ((index % total) + total) % total;
        if (next === prev) return;
        var goingForward = (index > current);

        // Exit old slide
        slides[prev].classList.remove('ed-active');
        slides[prev].classList.add(goingForward ? 'ed-exit-up' : 'ed-enter-below');
        slides[prev].setAttribute('aria-hidden', 'true');

        // Enter new slide
        slides[next].classList.remove('ed-exit-up', 'ed-enter-below');
        slides[next].classList.add('ed-active');
        slides[next].removeAttribute('aria-hidden');

        current = next;

        // Clean exit class after transition
        setTimeout(function () {
          slides[prev].classList.remove('ed-exit-up', 'ed-enter-below');
        }, 520);

        // Update counter
        if (counter) counter.textContent = (current + 1) + ' / ' + total;
      }

      function startAutoRotate() {
        stopAutoRotate();
        interval = setInterval(function () {
          // Orphaned timer check
          if (!document.contains(rootContainer)) {
            clearInterval(interval);
            return;
          }
          goTo(current + 1);
        }, ROTATE_MS);
      }

      function stopAutoRotate() {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }

      // Arrow click handlers
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          goTo(current - 1);
          stopAutoRotate();
          startAutoRotate();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          goTo(current + 1);
          stopAutoRotate();
          startAutoRotate();
        });
      }

      // Keyboard navigation
      if (wrapper) {
        wrapper.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(current - 1);
            stopAutoRotate();
            startAutoRotate();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(current + 1);
            stopAutoRotate();
            startAutoRotate();
          }
        });
      }

      // Pause on hover
      if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoRotate);
        wrapper.addEventListener('mouseleave', startAutoRotate);
      }

      // Touch/swipe support
      var touchStartX = 0;
      var touchStartY = 0;
      if (wrapper) {
        wrapper.addEventListener('touchstart', function (e) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        wrapper.addEventListener('touchend', function (e) {
          var dx = e.changedTouches[0].clientX - touchStartX;
          var dy = e.changedTouches[0].clientY - touchStartY;
          // Only trigger if horizontal swipe is dominant and long enough
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            goTo(dx > 0 ? current - 1 : current + 1);
            stopAutoRotate();
            startAutoRotate();
          }
        }, { passive: true });
      }

      // Start auto-rotate
      startAutoRotate();
    }

    return { html: html, mount: mount };
  }

  // ── Schema markup ────────────────────────────────────────────────────────────

  function injectSchema(testimonials, widgetName) {
    if (!testimonials.length) return;
    var totalRating = 0;
    var ratedCount = 0;
    var reviews = [];
    for (var i = 0; i < testimonials.length; i++) {
      var t = testimonials[i];
      if (typeof t.rating === 'number' && t.rating > 0) {
        totalRating += t.rating;
        ratedCount++;
        reviews.push({
          '@type': 'Review',
          author: { '@type': 'Person', name: t.author_name },
          reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
          reviewBody: t.content || '',
          datePublished: t.created_at ? t.created_at.split('T')[0] : undefined,
        });
      }
    }
    if (!ratedCount) return;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: widgetName || 'Customer Reviews',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (totalRating / ratedCount).toFixed(1),
        reviewCount: ratedCount,
        bestRating: 5,
      },
      review: reviews,
    };

    // Don't inject duplicate schema
    var existing = document.querySelectorAll('script[data-vouch-schema]');
    for (var j = 0; j < existing.length; j++) existing[j].parentNode.removeChild(existing[j]);

    var tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.setAttribute('data-vouch-schema', 'true');
    tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
  }

  // ── Post-render fixups (CSP-safe, after layout) ────────────────────────────

  function postRenderFixups(shadow, theme) {
    requestAnimationFrame(function () {
      // Clearbit logo fallback (CSP-safe, no inline onerror)
      var fallbackImgs = shadow.querySelectorAll('img[data-vouch-fallback]');
      for (var i = 0; i < fallbackImgs.length; i++) {
        (function (img) {
          img.addEventListener('error', function () {
            img.style.display = 'none';
            var sib = img.nextElementSibling;
            if (sib) sib.style.display = 'flex';
          });
          // If already failed before listener attached
          if (img.complete && img.naturalWidth === 0) {
            img.style.display = 'none';
            var sib = img.nextElementSibling;
            if (sib) sib.style.display = 'flex';
          }
        })(fallbackImgs[i]);
      }

      // Video thumbnail click-to-play
      var videoWraps = shadow.querySelectorAll('[data-vouch-video]');
      for (var v = 0; v < videoWraps.length; v++) {
        (function (wrap) {
          wrap.addEventListener('click', function () {
            var src = wrap.getAttribute('data-src');
            var poster = wrap.getAttribute('data-poster');
            if (!src) return;
            var video = document.createElement('video');
            video.src = src;
            if (poster) video.poster = poster;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = 'auto';
            video.style.cssText = 'width:100%;display:block;border-radius:8px;background:#000';
            wrap.replaceWith(video);
          });
        })(videoWraps[v]);
      }

      // Read-more expander (needs layout to measure scrollHeight)
      var pc = safeColor(theme.primaryColor, '#6366F1');
      var quotes = shadow.querySelectorAll('blockquote p');
      for (var j = 0; j < quotes.length; j++) {
        (function (p) {
          if (p.scrollHeight > p.clientHeight + 2) {
            var btn = document.createElement('button');
            btn.textContent = 'Read more';
            btn.style.cssText =
              'display:inline-block;font-size:11px;color:' + pc +
              ';background:none;border:none;padding:4px 0 0;cursor:pointer;font-weight:600';
            btn.addEventListener('click', function () {
              p.style.overflow = 'visible';
              p.style.display = 'block';
              p.style.webkitLineClamp = 'unset';
              btn.style.display = 'none';
            });
            p.parentNode.appendChild(btn);
          }
        })(quotes[j]);
      }
    });
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  function renderWidget(el, data) {
    var w = data.widget;
    var testimonials = data.testimonials || [];
    var theme = w.theme || {};
    var tc = safeColor(theme.textColor, '#0f172a');

    // Resolve font
    var fontConfig = resolveFontConfig(theme, data.project);
    var fontStack = fontConfig && fontConfig.family
      ? '"' + fontConfig.family + '",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
      : 'inherit';

    // Create shadow root
    var shadow = el.attachShadow({ mode: 'open' });

    // Inject font stylesheet into shadow root if needed
    if (fontConfig && fontConfig.url) {
      var preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://fonts.googleapis.com';
      shadow.appendChild(preconnect);
      var preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      shadow.appendChild(preconnect2);
      var fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = fontConfig.url;
      shadow.appendChild(fontLink);
    }

    // Base styles (scoped to shadow)
    var style = document.createElement('style');
    style.textContent =
      ':host{display:block;font-family:' + fontStack + ';' +
      '-webkit-font-smoothing:antialiased;color:' + tc + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'img{max-width:100%}' +
      'a{color:inherit}';
    shadow.appendChild(style);

    var container = document.createElement('div');

    // Project logo
    if (data.project && data.project.logoUrl) {
      var logoWrap = document.createElement('div');
      logoWrap.style.cssText = 'text-align:center;margin-bottom:16px';
      var logoImg = document.createElement('img');
      logoImg.src = data.project.logoUrl;
      logoImg.alt = data.project.name || '';
      logoImg.style.cssText = 'height:40px;width:auto;display:inline-block;border-radius:8px;object-fit:contain';
      logoWrap.appendChild(logoImg);
      container.appendChild(logoWrap);
    }

    var editorialMount = null;
    if (!testimonials.length) {
      container.innerHTML = '<p style="color:#94a3b8;font-size:14px;text-align:center;padding:32px 16px">No testimonials yet.</p>';
    } else {
      var layout = w.layout || 'grid';
      if (layout === 'editorial') {
        var editorial = renderEditorial(testimonials, theme);
        container.innerHTML = editorial.html;
        editorialMount = editorial.mount;
      } else if (layout === 'carousel') container.innerHTML = renderCarousel(testimonials, theme);
      else if (layout === 'wall') container.innerHTML = renderWall(testimonials, theme);
      else if (layout === 'list') container.innerHTML = renderList(testimonials, theme);
      else if (layout === 'single') container.innerHTML = renderSingle(testimonials, theme);
      else container.innerHTML = renderGrid(testimonials, theme);
    }

    // Free-tier note
    if (!data.isPro && data.totalApproved > 5) {
      var note = document.createElement('div');
      note.style.cssText = 'text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8';
      note.textContent = 'Showing 5 of ' + data.totalApproved + ' reviews';
      container.appendChild(note);
    }

    // Branding
    if (!w.hideBranding) {
      var brand = document.createElement('div');
      brand.style.cssText = 'text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid #f1f5f9';
      var brandLink = document.createElement('a');
      brandLink.href = base + '/via';
      brandLink.target = '_blank';
      brandLink.rel = 'noopener noreferrer';
      brandLink.style.cssText = 'font-size:11px;color:#94a3b8;text-decoration:none';
      brandLink.textContent = 'Powered by Vouch';
      brand.appendChild(brandLink);
      container.appendChild(brand);
    }

    shadow.appendChild(container);

    // Post-render: avatar fallbacks and read-more buttons (after layout)
    postRenderFixups(shadow, theme);

    // Mount editorial interactivity (after DOM is in shadow)
    if (editorialMount) editorialMount(container);

    // Inject JSON-LD schema into host page
    injectSchema(testimonials, w.name);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function initWidget(el) {
    var id = el.getAttribute(ATTR);
    if (!id || el._vouchLoaded) return;
    el._vouchLoaded = true;

    fetch(base + '/api/testimonials/widget/' + encodeURIComponent(id))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data.error) {
          console.warn('[Vouch] Widget ' + id + ': ' + data.error);
          return;
        }
        renderWidget(el, data);
      })
      .catch(function (err) {
        console.warn('[Vouch] Failed to load widget ' + id + (err.message ? ': ' + err.message : ''));
      });
  }

  function init() {
    var els = document.querySelectorAll('[' + ATTR + ']');
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) initWidget(els[i]);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            observer.unobserve(entries[i].target);
            initWidget(entries[i].target);
          }
        }
      },
      { rootMargin: '200px' }
    );
    for (var j = 0; j < els.length; j++) observer.observe(els[j]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
