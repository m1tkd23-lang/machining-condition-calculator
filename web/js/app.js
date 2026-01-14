//web/js/app.js
(function () {
    const $ = (id) => document.getElementById(id);

    async function onHealth() {
        const out = $("health_result");
        if (!out) return;
        out.textContent = "checking...";
        try {
            const res = await fetch("/health", { cache: "no-store" });
            const json = await res.json();
            out.textContent = JSON.stringify(json);
        } catch (e) {
            out.textContent = "ERROR";
        }
    }

    // PWA（失敗しても動作には影響なし）
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js").catch(() => { });
    }

    const btnHealth = $("btn_health");
    if (btnHealth) btnHealth.addEventListener("click", onHealth);
})();
