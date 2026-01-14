// web/js/page_drill_point_height.js
(function () {
    const $ = (id) => document.getElementById(id);

    function toNumber(value) {
        if (value === "" || value === null || value === undefined) return NaN;
        return Number(value);
    }

    function setMsg(elId, text, isError) {
        const el = $(elId);
        if (!el) return;
        el.textContent = text || "";
        el.classList.toggle("error", !!isError);
    }

    function round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    function setOut(id, v) {
        const el = $(id);
        if (!el) return;
        el.value = (v === null || v === undefined || !Number.isFinite(v)) ? "" : String(v);
    }

    function onCalcPointHeight() {
        if (!window.DrillCalc) {
            setMsg("msg", "drill.js が読み込まれていません。", true);
            return;
        }

        const d = toNumber($("d_mm")?.value);
        const theta = toNumber($("theta_deg")?.value);

        const res = window.DrillCalc.calcPointHeightFromDiameterAndAngle(d, theta);
        if (!res) {
            setMsg("msg", "入力値を確認してください（D>0、0<θ<180）。", true);
            setOut("alpha_deg", NaN);
            setOut("h_mm", NaN);
            return;
        }

        setOut("alpha_deg", round(res.alpha_deg, 3));
        setOut("h_mm", round(res.h_mm, 3));
        setMsg("msg", "計算しました。", false);
    }

    // --- Countersink helpers ---
    function syncCsAlpha() {
        const theta = toNumber($("cs_theta_deg")?.value);
        if (!Number.isFinite(theta) || !(theta > 0 && theta < 180)) {
            setOut("cs_alpha_deg", NaN);
            return;
        }
        setOut("cs_alpha_deg", round(theta / 2.0, 3));
    }

    function onCalcCsDepth() {
        if (!window.DrillCalc) {
            setMsg("cs_msg", "drill.js が読み込まれていません。", true);
            return;
        }

        const d1 = toNumber($("cs_d1_mm")?.value);
        const d2 = toNumber($("cs_d2_mm")?.value);
        const theta = toNumber($("cs_theta_deg")?.value);

        const depth = window.DrillCalc.calcCountersinkDepthFromD1D2Theta(d1, d2, theta);
        if (depth == null) {
            setMsg("cs_msg", "入力値を確認してください（D1≥D2、0<θ<180）。", true);
            return;
        }

        setOut("cs_t_mm", round(depth, 3));
        syncCsAlpha();
        setMsg("cs_msg", "t を計算しました。", false);
    }

    function onCalcCsD1() {
        if (!window.DrillCalc) {
            setMsg("cs_msg", "drill.js が読み込まれていません。", true);
            return;
        }

        const depth = toNumber($("cs_t_mm")?.value);
        const d2 = toNumber($("cs_d2_mm")?.value);
        const theta = toNumber($("cs_theta_deg")?.value);

        const d1 = window.DrillCalc.calcCountersinkD1FromDepthD2Theta(depth, d2, theta);
        if (d1 == null) {
            setMsg("cs_msg", "入力値を確認してください（t>0、D2>0、0<θ<180）。", true);
            return;
        }

        setOut("cs_d1_mm", round(d1, 3));
        syncCsAlpha();
        setMsg("cs_msg", "D1 を計算しました。", false);
    }

    // wire up
    $("btn_calc")?.addEventListener("click", onCalcPointHeight);

    $("btn_cs_calc_t")?.addEventListener("click", onCalcCsDepth);
    $("btn_cs_calc_d1")?.addEventListener("click", onCalcCsD1);

    // optional: keep alpha updated when theta changes
    $("cs_theta_deg")?.addEventListener("input", syncCsAlpha);

    // init alpha
    syncCsAlpha();
})();
