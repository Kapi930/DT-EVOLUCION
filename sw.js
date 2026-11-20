// DT conserva solo sus recursos. CALWEB comparte origen, nunca sus cachés.
const CACHE = 'dte-app-1';
const BASE = new URL('./', self.location.href);
const FILES = ['install.js','install.js?v=independiente-1','demo-data.json','favicon.ico','app-icon.png','apple-touch-icon.png','sqlite-pc.css','sqlite-pc.css?v=evolucion-3','./','index.html','app.js','style.css','desktop-ui.js','selectors.js','responsive.js','desktop.css','app.js?v=evolucion-2','desktop-ui.js?v=evolucion-1','selectors.js?v=evolucion-1','responsive.js?v=evolucion-1','desktop.css?v=evolucion-1','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','manifest.webmanifest?v=independiente-1','assets/calendario.png','assets/partes_operarios.png','assets/usuarios.png','assets/necesidades.png','assets/cambios_obra.png','assets/diagnostico.png'];
const PATHS = new Set(FILES.map(file => new URL(file, BASE).pathname));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dte-app-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== BASE.origin || !PATHS.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // El servicio se actualiza al abrir DT. Su pantalla inicial ya instalada
    // puede aparecer inmediatamente, incluso con Internet lento o sin señal.
    if(event.request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL('index.html',BASE).pathname)){
      const page=await cache.match(new URL('index.html',BASE).href);
      if(page)return page;
    }
    // Los recursos pertenecen a esta versión del servicio. Abrir la app no
    // necesita esperar a Internet para cada módulo, hoja de estilo o imagen.
    if(event.request.mode !== 'navigate' && url.pathname !== BASE.pathname && !url.pathname.endsWith('.html')){
      const cached = await cache.match(event.request);
      if(cached) return cached;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== 'opaque' && !response.redirected) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL('index.html', BASE).pathname)) {
        const page = await cache.match(new URL('index.html', BASE).href);
        if (page) return page;
      }
      throw error;
    }
  })());
});
