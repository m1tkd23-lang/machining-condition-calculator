// フェーズ2でキャッシュ実装する想定（現時点は最小）
// ※登録に成功しても何もしません

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
