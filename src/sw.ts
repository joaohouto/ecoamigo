import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Pré-cacheia todos os assets gerados pelo build do Next.js
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,

  runtimeCaching: [
    // Fontes do Google — cache permanente
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
      handler: new CacheFirst({
        cacheName: "eco-amigo-fonts",
        plugins: [{ cacheWillUpdate: async ({ response }) =>
          response?.status === 200 ? response : null }],
      }),
    },
    // Ícones Iconify (emojis) — cache permanente
    {
      matcher: /^https:\/\/api\.iconify\.design\//,
      handler: new CacheFirst({
        cacheName: "eco-amigo-iconify",
        plugins: [{ cacheWillUpdate: async ({ response }) =>
          response?.status === 200 ? response : null }],
      }),
    },
    // Sons e imagens dos animais — cache permanente
    {
      matcher: /\/(sounds|animals|ui)\/.+/,
      handler: new CacheFirst({
        cacheName: "eco-amigo-media",
        plugins: [{ cacheWillUpdate: async ({ response }) =>
          response?.status === 200 ? response : null }],
      }),
    },
    // API do placar — rede primeiro, silencia falha offline
    {
      matcher: /\/api\/placar/,
      handler: new NetworkFirst({
        cacheName: "eco-amigo-api",
        networkTimeoutSeconds: 4,
        plugins: [{ cacheWillUpdate: async ({ response }) =>
          response?.status === 200 ? response : null }],
      }),
    },
    // Páginas — stale-while-revalidate
    {
      matcher: /\//,
      handler: new StaleWhileRevalidate({
        cacheName: "eco-amigo-pages",
      }),
    },
  ],
});

serwist.addEventListeners();
