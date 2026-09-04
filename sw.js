// Service worker: guarda o "esqueleto" do app (HTML, manifest, ícones) E as
// bibliotecas externas usadas (Tailwind, ícones, jsPDF, fontes do Google)
// para o app funcionar 100% OFFLINE depois da primeira vez que for aberto
// com internet.
//
// Estratégia:
// - Página (index.html): tenta buscar a versão mais nova na rede primeiro
//   (para o app se atualizar sozinho quando você publica uma mudança);
//   se não tiver internet, usa a cópia guardada.
// - Arquivos do próprio site e bibliotecas externas confiáveis (Tailwind,
//   unpkg, fontes Google): mostra a cópia guardada na hora (rápido/offline)
//   e atualiza em segundo plano quando há internet.
// - Chamadas do Firebase (login/notas) NÃO passam pelo cache — o próprio
//   Firebase cuida da parte offline delas (fica guardado no IndexedDB).
//
// Dica: se um dia quiser forçar todo mundo a baixar tudo de novo do zero
// (trocou ícones, nomes de arquivo etc.), só mudar o número da versão
// abaixo (v3 -> v4...). Para atualizações normais de conteúdo do
// index.html isso NÃO é necessário.
const CACHE_NAME = "pbf-app-shell-v3";

// Arquivos do próprio site.
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Bibliotecas externas usadas pelo app — sem elas o app perde estilo,
// ícones ou a exportação de PDF quando está offline.
const EXTERNAL_FILES = [
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/lucide@latest",
  "https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js",
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700;800&display=swap"
];

// Hosts externos que podem ser guardados em cache normalmente (bibliotecas
// e fontes). Tudo que não é do próprio site nem está nesta lista (ex:
// domínios do Firebase) passa direto pela rede, sem cache.
const RUNTIME_CACHEABLE_HOSTS = [
  "cdn.tailwindcss.com",
  "unpkg.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Arquivos do próprio site: se algum falhar, o install falha (ok,
      // são poucos e sempre devem existir).
      await cache.addAll(SHELL_FILES);

      // Bibliotecas externas: baixa em modo "no-cors" (funciona mesmo sem
      // cabeçalhos CORS) e ignora silenciosamente qualquer uma que falhar,
      // para não travar a instalação do app por causa de um CDN fora do ar.
      await Promise.allSettled(
        EXTERNAL_FILES.map((url) =>
          fetch(url, { mode: "no-cors" }).then((res) => cache.put(url, res))
        )
      );
    })
  );
  // Faz a nova versão do service worker ficar pronta imediatamente.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Permite que a página peça para o service worker "novo" assumir o
// controle na hora (usado pelo index.html para recarregar sozinho).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCacheableExternal = RUNTIME_CACHEABLE_HOSTS.includes(url.hostname);

  // Não é do próprio site nem é uma biblioteca conhecida (ex: chamadas do
  // Firebase para login/notas) -> deixa passar direto pela rede. O próprio
  // Firebase guarda uma cópia offline dessas informações sozinho.
  if (!isSameOrigin && !isCacheableExternal) {
    return;
  }

  const isPageRequest =
    isSameOrigin &&
    (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html"));

  if (isPageRequest) {
    // NETWORK-FIRST: sempre tenta buscar a página mais nova primeiro. Isso
    // é o que faz o app se atualizar sozinho quando você publica uma
    // mudança. Sem internet, cai para a cópia guardada.
    event.respondWith(
      fetch(req)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return response;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // Demais arquivos (ícones, manifest, Tailwind, lucide, jsPDF, fontes):
  // mostra a cópia guardada na hora (funciona offline) e atualiza o cache
  // em segundo plano quando há internet.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req, isSameOrigin ? {} : { mode: "no-cors" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
