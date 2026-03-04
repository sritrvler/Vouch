(function () {
  'use strict';

  var ATTR = 'data-vouch';
  var base =
    window.VOUCH_BASE_URL ||
    (document.currentScript && document.currentScript.src.replace('/embed.js', '')) ||
    '';

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function timeAgo(dateStr) {
    var now = Date.now();
    var then = new Date(dateStr).getTime();
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
    var html = '<span style="display:flex;gap:2px">';
    for (var i = 1; i <= 5; i++) html += starSvg(i <= rating, color);
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
        '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" ' +
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
    var pc = theme.primaryColor || '#6366F1';
    var tc = theme.textColor || '#0f172a';
    var bg = theme.backgroundColor || '#ffffff';
    var cs = theme.cardStyle || 'shadow';
    var border = cs === 'border' ? '1px solid #e2e8f0' : 'none';
    var shadow = cs === 'shadow' ? '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)' : 'none';
    var pad = compact ? '14px 16px' : '20px';
    var gap = compact ? '10' : '14';
    var authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

    // Golden sentence
    var golden = t.golden_sentence;
    var hasGolden = !!(golden && t.content && t.content.indexOf(golden) !== -1);
    var quoteHtml = '';
    if (hasGolden) {
      var idx = t.content.indexOf(golden);
      var before = t.content.slice(0, idx);
      var after = t.content.slice(idx + golden.length);
      quoteHtml =
        (before ? '<span style="color:#9ca3af">' + esc(before) + '</span>' : '') +
        '<span style="color:' + tc + ';font-weight:600">' + esc(golden) + '</span>' +
        (after ? '<span style="color:#9ca3af">' + esc(after) + '</span>' : '');
    } else {
      quoteHtml = '<span style="color:#374151">' + esc(t.content) + '</span>';
    }

    // Verification
    var src = t.source_url || '';
    var isX = src.indexOf('twitter.com') !== -1 || src.indexOf('x.com') !== -1;
    var isLI = src.indexOf('linkedin.com') !== -1;
    var vDate = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    var verifyHtml = '';
    if (isX || isLI) {
      verifyHtml =
        '<a href="' + esc(src) + '" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;color:#9ca3af;text-decoration:none">' +
        (isX ? xIcon : linkedInIcon) + '</a>';
    } else {
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
        html += '<div style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(authorLine) + '</div>';
      }
      if (t.email_domain) {
        html += '<div style="display:flex;align-items:center;gap:3px;margin-top:2px;font-size:10px;font-weight:600;color:#059669">' + shieldIcon + esc(t.email_domain) + '</div>';
      }
      html += '</div></div>';
    }
    html += verifyHtml;
    html += '</div>';

    // Quote
    html +=
      '<blockquote style="margin:0;padding:0"><p style="font-size:' + (compact ? '13' : '14') +
      'px;line-height:1.65;margin:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical">' +
      '&ldquo;' + quoteHtml + '&rdquo;</p></blockquote>';

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
      html += '<span style="font-size:10px;color:#9ca3af;margin-left:auto">' + timeAgo(t.created_at) + '</span>';
    }
    html += '</div>';

    // Video
    if (t.video_url) {
      html +=
        '<video src="' + esc(t.video_url) + '"' +
        (t.video_thumbnail_url ? ' poster="' + esc(t.video_thumbnail_url) + '"' : '') +
        ' controls preload="metadata" style="width:100%;border-radius:8px;margin-top:8px;display:block;background:#000"></video>';
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

    var pc = theme.primaryColor || '#6366F1';
    var tc = theme.textColor || '#0f172a';
    var bg = theme.backgroundColor || '#ffffff';
    var authorLine = [t.author_role, t.author_company].filter(Boolean).join(', ');

    var golden = t.golden_sentence;
    var hasGolden = !!(golden && t.content && t.content.indexOf(golden) !== -1);
    var quoteHtml = '';
    if (hasGolden) {
      var idx = t.content.indexOf(golden);
      quoteHtml =
        (t.content.slice(0, idx) ? '<span style="color:#9ca3af">' + esc(t.content.slice(0, idx)) + '</span>' : '') +
        '<span style="color:' + tc + ';font-weight:600">' + esc(golden) + '</span>' +
        (t.content.slice(idx + golden.length) ? '<span style="color:#9ca3af">' + esc(t.content.slice(idx + golden.length)) + '</span>' : '');
    } else {
      quoteHtml = esc(t.content);
    }

    var src = t.source_url || '';
    var isX = src.indexOf('twitter.com') !== -1 || src.indexOf('x.com') !== -1;
    var isLI = src.indexOf('linkedin.com') !== -1;

    var html =
      '<article style="background:' + bg + ';border-radius:16px;padding:32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08)">';
    if (theme.showRating !== false) {
      html += '<div style="display:flex;justify-content:center;margin-bottom:16px">' + stars(t.rating, pc) + '</div>';
    }
    html +=
      '<blockquote style="margin:0 0 24px"><p style="font-size:18px;line-height:1.7;font-style:italic;margin:0;color:#374151">&ldquo;' +
      quoteHtml + '&rdquo;</p></blockquote>';
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
    var html = '<div style="columns:3;column-gap:16px;padding:4px">';
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

  // ── Schema markup ────────────────────────────────────────────────────────────

  function injectSchema(testimonials, widgetName) {
    if (!testimonials.length) return;
    var totalRating = 0;
    var ratedCount = 0;
    var reviews = [];
    for (var i = 0; i < testimonials.length; i++) {
      var t = testimonials[i];
      if (t.rating > 0) {
        totalRating += t.rating;
        ratedCount++;
      }
      reviews.push({
        '@type': 'Review',
        author: { '@type': 'Person', name: t.author_name },
        reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
        reviewBody: t.content,
        datePublished: t.created_at ? t.created_at.split('T')[0] : undefined,
      });
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

  // ── Main render ──────────────────────────────────────────────────────────────

  function renderWidget(el, data) {
    var w = data.widget;
    var testimonials = data.testimonials || [];
    var theme = w.theme || {};
    var bg = theme.backgroundColor || '#ffffff';
    var tc = theme.textColor || '#0f172a';

    // Create shadow root
    var shadow = el.attachShadow({ mode: 'open' });

    // Base styles (scoped to shadow)
    var style = document.createElement('style');
    style.textContent =
      ':host{display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
      '-webkit-font-smoothing:antialiased;color:' + tc + '}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'img{max-width:100%}' +
      'a{color:inherit}';
    shadow.appendChild(style);

    var container = document.createElement('div');

    if (!testimonials.length) {
      container.innerHTML = '<p style="color:#94a3b8;font-size:14px;text-align:center;padding:32px 16px">No testimonials yet.</p>';
    } else {
      var layout = w.layout || 'grid';
      if (layout === 'carousel') container.innerHTML = renderCarousel(testimonials, theme);
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
      brand.innerHTML =
        '<a href="' + base + '/via" target="_blank" rel="noopener noreferrer" ' +
        'style="font-size:11px;color:#94a3b8;text-decoration:none">Powered by Vouch</a>';
      container.appendChild(brand);
    }

    shadow.appendChild(container);

    // Read-more expander
    var quotes = shadow.querySelectorAll('blockquote p');
    for (var i = 0; i < quotes.length; i++) {
      (function (p) {
        if (p.scrollHeight > p.clientHeight + 2) {
          var btn = document.createElement('button');
          btn.textContent = 'Read more';
          btn.style.cssText =
            'display:inline-block;font-size:11px;color:' + (theme.primaryColor || '#6366F1') +
            ';background:none;border:none;padding:4px 0 0;cursor:pointer;font-weight:600';
          btn.addEventListener('click', function () {
            p.style.overflow = 'visible';
            p.style.display = 'block';
            p.style.webkitLineClamp = 'unset';
            btn.style.display = 'none';
          });
          p.parentNode.appendChild(btn);
        }
      })(quotes[i]);
    }

    // Inject JSON-LD schema into host page
    injectSchema(testimonials, w.name);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function initWidget(el) {
    var id = el.getAttribute(ATTR);
    if (!id || el._vouchLoaded) return;
    el._vouchLoaded = true;

    fetch(base + '/api/testimonials/widget/' + id)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) return;
        renderWidget(el, data);
      })
      .catch(function () {});
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
