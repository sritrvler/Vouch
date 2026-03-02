(function() {
  var base = (window.VOUCH_BASE_URL || (document.currentScript && document.currentScript.src.replace('/widget.js', '')) || '');
  // IMPORTANT: attribute name 'data-widget-id' must match exactly what the
  // widget embed code generator in /dashboard/widgets outputs. Do not rename either.
  var widgets = document.querySelectorAll('[data-widget-id]');
  widgets.forEach(function(el) {
    var id = el.getAttribute('data-widget-id');
    if (!id) return;
    var iframe = document.createElement('iframe');
    iframe.src = base + '/embed/' + id;
    iframe.style.cssText = 'width:100%;border:none;min-height:200px;display:block;';
    iframe.scrolling = 'no';
    el.appendChild(iframe);
    window.addEventListener('message', function(e) {
      // Verify sender and that height is a safe positive number (not a CSS string)
      if (e.source === iframe.contentWindow && typeof e.data.height === 'number' && e.data.height > 0) {
        iframe.style.height = e.data.height + 'px';
      }
    });
  });
})();
