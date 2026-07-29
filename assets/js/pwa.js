// Registro do PWA sem apagar o cache a cada carregamento.
(function registerNextuberPWA() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(function (registration) {
        registration.update();
      })
      .catch(function (error) {
        console.warn('Não foi possível registrar o PWA:', error);
      });
  });
})();
