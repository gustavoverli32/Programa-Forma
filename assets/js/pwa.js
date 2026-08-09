// Registro do PWA sem apagar o cache a cada carregamento.
(function registerNextuberPWA() {
  if (!('serviceWorker' in navigator)) return;

  var registration = null;
  var reloading = false;
  var lastUpdateCheck = 0;
  var alreadyControlled = !!navigator.serviceWorker.controller;

  function checkForUpdate(force) {
    if (!registration) return;
    var now = Date.now();
    if (!force && now - lastUpdateCheck < 60 * 60 * 1000) return;
    lastUpdateCheck = now;
    registration.update().catch(function (error) {
      console.warn('Não foi possível atualizar o PWA:', error);
    });
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!alreadyControlled || reloading) return;
    reloading = true;
    window.location.reload();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') checkForUpdate(false);
  });

  window.addEventListener('focus', function () {
    checkForUpdate(false);
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(function (registered) {
        registration = registered;
        checkForUpdate(true);
      })
      .catch(function (error) {
        console.warn('Não foi possível registrar o PWA:', error);
      });
  });
})();
