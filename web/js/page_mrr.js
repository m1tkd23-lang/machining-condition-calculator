// web/js/page_mrr.js
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

    function setQOutputs(q_mm3min) {
        $("q_mm3min").value = String(Math.round(q_mm3min));
        $("q_cm3min").value = String(round(q_mm3min / 1000.0, 2));
    }

    // ---- mode state ----
    let aeMode = "ae_mm";         // "ae_mm" | "ae_pct"
    let vfMode = "vf_direct";     // "vf_direct" | "vf_from_vc"

    // ---- tabs ----
    function setActiveAeMode(mode) {
        aeMode = mode;

        // ★ タブ切替で状態が変わるのでテンキーを閉じて activeInput をリセット
        if (window.Numpad?.hide) window.Numpad.hide();

        const tabA = $("tab_ae_mm");
        const tabB = $("tab_ae_pct");
        const panelA = $("panel_ae_mm");
        const panelB = $("panel_ae_pct");

        const isA = mode === "ae_mm";
        tabA.classList.toggle("active", isA);
        tabB.classList.toggle("active", !isA);
        tabA.setAttribute("aria-selected", isA ? "true" : "false");
        tabB.setAttribute("aria-selected", !isA ? "true" : "false");
        panelA.classList.toggle("hidden", !isA);
        panelB.classList.toggle("hidden", isA);

        setMsg("", false);
        syncAeEffective(true);
        // ae%モードで周速モードなら、Dが使われるのでvfも同期しやすい
        syncVfEffective(true);
    }

    function setActiveVfMode(mode) {
        vfMode = mode;

        // ★ タブ切替で状態が変わるのでテンキーを閉じて activeInput をリセット
        if (window.Numpad?.hide) window.Numpad.hide();

        const tabA = $("tab_vf_direct");
        const tabB = $("tab_vf_from_vc");
        const panelA = $("panel_vf_direct");
        const panelB = $("panel_vf_from_vc");

        const isA = mode === "vf_direct";
        tabA.classList.toggle("active", isA);
        tabB.classList.toggle("active", !isA);
        tabA.setAttribute("aria-selected", isA ? "true" : "false");
        tabB.setAttribute("aria-selected", !isA ? "true" : "false");
        panelA.classList.toggle("hidden", !isA);
        panelB.classList.toggle("hidden", isA);

        setMsg("", false);
        // 周速モードへ切り替えた瞬間、現在値で同期
        syncVfEffective(true);
    }

    // ---- effective ae ----
    function setAePreview(text) {
        const el = $("ae_eff_preview");
        if (el) el.textContent = text || "";
    }

    function getAeEffectiveMm() {
        if (aeMode === "ae_mm") {
            return toNumber($("ae_mm")?.value);
        }
        // ae/D mode (1 = 100%)
        const D = toNumber($("tool_d_mm")?.value);
        const ratio = toNumber($("ae_pct")?.value);
        if (!Number.isFinite(D) || !Number.isFinite(ratio)) return NaN;
        return D * ratio;
    }

    function syncAeEffective(silent) {
        if (aeMode !== "ae_pct") {
            setAePreview("");
            return;
        }
        const D = toNumber($("tool_d_mm")?.value);
        const ratio = toNumber($("ae_pct")?.value);
        const ae = getAeEffectiveMm();

        if (!Number.isFinite(D) || !Number.isFinite(ratio) || !(ae > 0)) {
            setAePreview("");
            if (!silent) setMsg("入力値を確認してください（D と ae/D は 0 より大きい値）。", true);
            return;
        }
        setAePreview(`ae ≒ ${round(ae, 3)} mm（D × ae/D）`);
    }

    // ---- effective vf ----
    function setVfPreview(text) {
        const el = $("vf_eff_preview");
        if (el) el.textContent = text || "";
    }

    function getToolDForRpm() {
        return toNumber($("tool_d_mm")?.value);
    }

    function syncVfEffective(silent) {
        if (vfMode !== "vf_from_vc") {
            setVfPreview("");
            return;
        }

        const D = getToolDForRpm();
        const Vc = toNumber($("vc_mmin")?.value);
        const z = toNumber($("teeth")?.value);
        const fz = toNumber($("fz")?.value);

        const rpm = window.CuttingSpeed?.calcRpmFromVcAndD(Vc, D);
        if (rpm == null || !(z > 0) || !(fz > 0)) {
            setVfPreview("");
            if (!silent) setMsg("入力値を確認してください（D, Vc, z, fz は 0 より大きい値）。", true);
            return;
        }

        const vf = window.FeedCalc?.calcVfFromFzZN(fz, z, rpm);
        if (vf == null) {
            setVfPreview("");
            if (!silent) setMsg("vfの計算に失敗しました（値を確認）。", true);
            return;
        }

        // 表示・計算用に vf欄へ反映（共通の“vf入力”として扱う）
        $("vf_mmin").value = String(Math.round(vf));
        setVfPreview(`n≒${Math.round(rpm)} rpm / vf≒${Math.round(vf)} mm/min`);
        if (!silent) setMsg("vf を同期しました。", false);
    }

    function getVfEffective() {
        return toNumber($("vf_mmin")?.value);
    }

    // ---- calc buttons ----
    function onCalcQ() {
        const ap = toNumber($("ap_mm")?.value);
        const ae = getAeEffectiveMm();
        const vf = getVfEffective();

        const q = window.MRR?.calcQ(ap, ae, vf);
        if (q == null) {
            setMsg("入力値を確認してください（ap・ae・vf は 0 より大きい値）。", true);
            return;
        }

        setQOutputs(q);
        setMsg("計算しました。", false);
    }

    function onCalcVfFromQ() {
        const ap = toNumber($("ap_mm")?.value);
        const ae = getAeEffectiveMm();
        const q = toNumber($("q_mm3min")?.value);

        const vf = window.MRR?.calcVfFromQ(ap, ae, q);
        if (vf == null) {
            setMsg("入力値を確認してください（ap・ae・Q は 0 より大きい値）。", true);
            return;
        }

        $("vf_mmin").value = String(Math.round(vf));
        if (vfMode === "vf_from_vc") {
            setVfPreview("※vfを逆算で上書きしました（周速同期とは一致しない場合あり）");
        }
        const q2 = window.MRR.calcQ(ap, ae, Math.round(vf));
        setQOutputs(q2);

        setMsg("逆算しました。", false);
    }

    // ---- wire up ----
    // init tabs
    setActiveAeMode("ae_mm");
    setActiveVfMode("vf_direct");

    // tab events
    $("tab_ae_mm")?.addEventListener("click", () => setActiveAeMode("ae_mm"));
    $("tab_ae_pct")?.addEventListener("click", () => setActiveAeMode("ae_pct"));
    $("tab_vf_direct")?.addEventListener("click", () => setActiveVfMode("vf_direct"));
    $("tab_vf_from_vc")?.addEventListener("click", () => setActiveVfMode("vf_from_vc"));

    // buttons
    $("btn_calc_q")?.addEventListener("click", onCalcQ);
    $("btn_calc_vf")?.addEventListener("click", onCalcVfFromQ);
    $("btn_sync_vf")?.addEventListener("click", () => syncVfEffective(false));

    // auto-sync on input changes (numpad triggers input event)
    $("tool_d_mm")?.addEventListener("input", () => {
        syncAeEffective(true);
        syncVfEffective(true);
    });
    $("ae_pct")?.addEventListener("input", () => syncAeEffective(true));

    $("vc_mmin")?.addEventListener("input", () => syncVfEffective(true));
    $("teeth")?.addEventListener("input", () => syncVfEffective(true));
    $("fz")?.addEventListener("input", () => syncVfEffective(true));
})();
