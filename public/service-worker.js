// Les premieres versions du site (Create React App) installaient un service
// worker qui met l'application en cache. Celui-ci le remplace, se desinscrit
// et recharge les onglets ouverts pour qu'ils recuperent la version en ligne.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister()
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
