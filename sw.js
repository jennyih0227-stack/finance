/* 誠毅傳承 · 財經判讀 PWA Service Worker */
const CACHE = "cyc-hub-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./decode.html",
  "./cards.html",
  "./read.html",
  "./talk.html",
  "./report.html",
  "./brief.json",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

// 安裝：預快取 App 殼
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// 啟用：清除舊快取
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 抓取：快取優先，回退網路；成功抓到的跨網域資源(字型/JSZip)也快取起來供離線用
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // 只快取成功且可快取的回應
        if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        // 離線且未快取：若是導航請求，回首頁
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
