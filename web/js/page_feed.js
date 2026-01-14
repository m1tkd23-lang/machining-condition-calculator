// web/js/page_feed.js
(function () {
    const $ = (id) => document.getElementById(id);

    function toNumber(value) {
        if (value === "" || value === null || value === undefined) return NaN;
        return Number(value);
    }

    function setMsg(text, isError) {
        const el = $("msg");
        if (!el) return;
        el.textContent = text || "";
        el.classList.toggle("error", !!isError);
    }

    function round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    // ---- mode state ----
    let currentTab = "rpm_direct"; // "rpm_direct" | "rpm_from_vc"

    // ---- tab handling ----
    function setActiveTab(tabName) {
        currentTab = tabName;

        // ★ タブ切替で状態が変わるのでテンキーを閉じて activeInput をリセット
        if (window.Numpad?.hide) window.Numpad.hide();

        const tabA = $("tab_rpm_direct");
        const tabB = $("tab_rpm_from_vc");
        const panelA = $("panel_rpm_direct");
        const panelB = $("panel_rpm_from_vc");

        if (!tabA || !tabB || !panelA || !panelB) return;

        const isA = tabName === "rpm_direct";

        tabA.classList.toggle("active", isA);
        tabB.classList.toggle("active", !isA);
        tabA.setAttribute("aria-selected", isA ? "true" : "false");
        tabB.setAttribute("aria-selected", !isA ? "true" : "false");

        panelA.classList.toggle("hidden", !isA);
        panelB.classList.toggle("hidden", isA);

        setMsg("", false);

        // ★ モードBに切り替えた瞬間、現在のD/Vcでrpmを同期
        if (!isA) {
            syncRpmFromVc(true);
        }
    }

    function onClickTab(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const tab = t.getAttribute("data-tab");
        if (!tab) return;
        setActiveTab(tab);
    }

    // ---- RPM from Vc & D ----
    function setRpmPreview(text) {
        const pv = $("rpm_from_vc_preview");
        if (pv) pv.textContent = text || "";
    }

    /**
     * D/Vc -> rpm を計算して共通rpm欄に反映
     * @param {boolean} silent - trueの場合はメッセージを出さない（自動同期用）
     */
    function syncRpmFromVc(silent) {
        // モードB以外では触らない（直入力を尊重）
        if (currentTab !== "rpm_from_vc") return;

        const d = toNumber($("diameter_mm")?.value);
        const vc = toNumber($("vc_mmin")?.value);

        const rpm = window.CuttingSpeed?.calcRpmFromVcAndD(vc, d);
        if (rpm == null) {
            setRpmPreview("");
            if (!silent) setMsg("入力値を確認してください（D と Vc は 0 より大きい値）。", true);
            return;
        }

        const rpmInt = Math.round(rpm);
        $("rpm").value = String(rpmInt);
        setRpmPreview(`n ≒ ${rpmInt} rpm`);

        if (!silent) setMsg("n を計算して反映しました。", false);
    }

    function onCalcRpmFromVc() {
        // ボタン押下は明示操作なのでメッセージあり
        syncRpmFromVc(false);
    }

    // ★ D/Vc が変わったら自動でrpm更新
    function onVcOrDChanged() {
        // 自動同期なので silent=true
        syncRpmFromVc(true);
    }

    // ---- feed calcs (same as before) ----
    function onCalcVf() {
        const n = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);
        const fz = toNumber($("fz")?.value);

        const vf = window.FeedCalc?.calcVfFromFzZN(fz, z, n);
        if (vf == null) {
            setMsg("入力値を確認してください（n, z, fz は 0 より大きい値）。", true);
            return;
        }

        $("vf").value = String(Math.round(vf));
        setMsg("計算しました。", false);
    }

    function onCalcFz() {
        const n = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);
        const vf = toNumber($("vf")?.value);

        const fz = window.FeedCalc?.calcFzFromVfZN(vf, z, n);
        if (fz == null) {
            setMsg("入力値を確認してください（n, z, vf は 0 より大きい値）。", true);
            return;
        }

        $("fz").value = String(round(fz, 3));
        setMsg("計算しました。", false);
    }

    // ---- wire up ----
    // default tab
    setActiveTab("rpm_direct");

    const tabA = $("tab_rpm_direct");
    const tabB = $("tab_rpm_from_vc");
    if (tabA) tabA.addEventListener("click", onClickTab);
    if (tabB) tabB.addEventListener("click", onClickTab);

    const btnRpm = $("btn_calc_rpm_from_vc");
    if (btnRpm) btnRpm.addEventListener("click", onCalcRpmFromVc);

    // ★ 自動更新：テンキー入力は input イベントが飛ぶのでそれを使う
    const dEl = $("diameter_mm");
    const vcEl = $("vc_mmin");
    if (dEl) dEl.addEventListener("input", onVcOrDChanged);
    if (vcEl) vcEl.addEventListener("input", onVcOrDChanged);

    const b1 = $("btn_calc_vf");
    const b2 = $("btn_calc_fz");
    if (b1) b1.addEventListener("click", onCalcVf);
    if (b2) b2.addEventListener("click", onCalcFz);
})();
