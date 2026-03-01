(function() {
  var base = (window.VOUCH_BASE_URL || (document.currentScript && document.currentScript.src.replace('/widget.js', '')) || '');
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
      if (e.data && e.data.height && e.source === iframe.contentWindow) {
        iframe.style.height = e.data.height + 'px';
      }
    });
  });
})();
