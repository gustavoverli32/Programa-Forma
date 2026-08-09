(function (root, factory) {
  "use strict";

  root.NextuberSecurity = factory(root);
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function safeUrl(value, options) {
    if (typeof value !== "string" || !value.trim()) return "";

    var raw = value.trim();
    var allowImageData = !!(options && options.allowImageData);
    if (allowImageData && /^data:image\/(?:png|gif|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(raw)) {
      return raw;
    }

    try {
      var base = root.location && root.location.origin ? root.location.origin : "https://nextuber.invalid";
      var UrlConstructor = root.URL || URL;
      var parsed = new UrlConstructor(raw, base);
      var isLocalHttp = parsed.protocol === "http:" && /^(?:localhost|127\.0\.0\.1|\[::1\])$/.test(parsed.hostname);
      if (parsed.protocol !== "https:" && !isLocalHttp) return "";
      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  return Object.freeze({
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    safeUrl: safeUrl,
  });
});
