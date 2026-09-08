// Offline stub for Cloudflare Turnstile (challenges.cloudflare.com).
// The contact form's NuxtTurnstile component calls window.turnstile.render(el, opts)
// and expects opts.callback(token) to fire so the form carries cf-turnstile-response.
window.turnstile = {
  render: function (el, opts) {
    if (opts && typeof opts.callback === 'function') {
      setTimeout(function () { opts.callback('offline-stub-token'); }, 50);
    }
    return 'offline-widget';
  },
  reset: function () {},
  remove: function () {},
};