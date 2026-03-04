(function () {
  var BACKENDS = {
    production: 'https://mafia-api-9z0w.onrender.com',
    local: ''
  };

  var hostname = window.location.hostname;
  var isProduction =
    hostname === 'sportmafia.app' ||
    hostname === 'www.sportmafia.app' ||
    hostname.endsWith('.netlify.app');

  var API_BASE = isProduction ? BACKENDS.production : BACKENDS.local;

  window.__APP_CONFIG__ = {
    API_BASE: API_BASE,
    isProduction: isProduction
  };

  window.apiFetch = function (path, options) {
    var url = API_BASE + path;
    var defaultOpts = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    };
    var merged = Object.assign({}, defaultOpts, options || {});
    if (options && options.headers) {
      merged.headers = Object.assign({}, defaultOpts.headers, options.headers);
    }
    return fetch(url, merged);
  };

  var _originalIo = window.io;
  if (typeof _originalIo === 'function') {
    window.io = function (urlOrOpts, opts) {
      if (arguments.length === 0) {
        return API_BASE ? _originalIo(API_BASE) : _originalIo();
      }
      if (arguments.length === 1 && typeof urlOrOpts === 'object') {
        return API_BASE ? _originalIo(API_BASE, urlOrOpts) : _originalIo(urlOrOpts);
      }
      return _originalIo.apply(this, arguments);
    };
    Object.keys(_originalIo).forEach(function (key) {
      window.io[key] = _originalIo[key];
    });
  }

  console.log('[config.env] env=' + (isProduction ? 'production' : 'local') +
    ', API_BASE=' + (API_BASE || '(same-origin)'));
})();
