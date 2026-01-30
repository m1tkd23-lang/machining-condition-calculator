// web/js/page_ball_end_surface_roughness.js
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

    function setOut(id, v) {
        const el = $(id);
        if (!el) return;
        el.value = (v === null || v === undefined || !Number.isFinite(v)) ? "" : String(v);
    }

    function umToMm(um) { return um / 1000.0; }
    function mmToUm(mm) { return mm * 1000.0; }

    function setRaFromHUm(h_um) {
        const raEl = $("ra_um");
        if (!raEl) return;
        const ra = window.BallEndSurfaceRoughness?.estimateRaFromH(h_um);
        raEl.value = (ra == null) ? "" : String(round(ra, 3));
    }

    function computeDeffAndReff() {
        const R = toNumber($("r_mm")?.value);
        const theta = toNumber($("theta_deg")?.value);

        const deff = window.BallEndSurfaceRoughness?.calcDeffFromRAndThetaDeg(R, theta);
        if (deff == null) return { deff: null, reff: null };

        return { deff, reff: deff / 2 };
    }

    function onCalcH() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const ae = toNumber($("ae_mm")?.value);
        const { deff, reff } = computeDeffAndReff();

        if (deff == null || reff == null) {
            setMsg("入力値を確認してください（R>0, 0<θ<90）。", true);
            setOut("deff_mm", NaN);
            setOut("h_um", NaN);
            setRaFromHUm(NaN);
            return;
        }

        const h_mm = window.BallEndSurfaceRoughness.calcCuspHeightMmFromReffAndAe(reff, ae);
        if (h_mm == null) {
            setMsg("入力値を確認してください（ae が大きすぎる可能性）。", true);
            setOut("deff_mm", round(deff, 3));
            setOut("h_um", NaN);
            setRaFromHUm(NaN);
            return;
        }

        const h_um = round(mmToUm(h_mm), 1);
        setOut("deff_mm", round(deff, 3));
        setOut("h_um", h_um);
        setRaFromHUm(h_um);
        setMsg("計算しました。", false);
    }

    function onCalcAe() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const h_um = toNumber($("h_um")?.value);
        const h_mm = umToMm(h_um);
        const { deff, reff } = computeDeffAndReff();

        if (deff == null || reff == null) {
            setMsg("入力値を確認してください（R>0, 0<θ<90）。", true);
            setOut("deff_mm", NaN);
            setOut("ae_mm", NaN);
            setRaFromHUm(NaN);
            return;
        }

        const ae = window.BallEndSurfaceRoughness.calcAeFromReffAndHmm(reff, h_mm);
        if (ae == null) {
            setMsg("入力値を確認してください（h が大きすぎる可能性）。", true);
            setOut("deff_mm", round(deff, 3));
            setOut("ae_mm", NaN);
            setRaFromHUm(NaN);
            return;
        }

        setOut("deff_mm", round(deff, 3));
        setOut("ae_mm", String(round(ae, 3)));
        setRaFromHUm(h_um);
        setMsg("逆算しました。", false);
    }

    function onCalcAeFromRa() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const ra_um = toNumber($("ra_um")?.value);
        const h_um = 4 * ra_um;     // Ra ≒ h/4 → h ≒ 4Ra
        const h_mm = umToMm(h_um);

        const { deff, reff } = computeDeffAndReff();
        if (deff == null || reff == null) {
            setMsg("入力値を確認してください（R>0, 0<θ<90）。", true);
            setOut("deff_mm", NaN);
            setOut("ae_mm", NaN);
            setOut("h_um", NaN);
            return;
        }

        const ae = window.BallEndSurfaceRoughness.calcAeFromReffAndHmm(reff, h_mm);
        if (ae == null) {
            setMsg("入力値を確認してください（Ra が大きすぎる可能性）。", true);
            setOut("deff_mm", round(deff, 3));
            setOut("ae_mm", NaN);
            setOut("h_um", NaN);
            return;
        }

        setOut("deff_mm", round(deff, 3));
        setOut("ae_mm", String(round(ae, 3)));
        setOut("h_um", String(round(h_um, 1)));
        setRaFromHUm(h_um);
        setMsg("逆算しました（参考値）。", false);
    }

    $("btn_calc_h")?.addEventListener("click", onCalcH);
    $("btn_calc_ae")?.addEventListener("click", onCalcAe);
    $("btn_calc_ae_from_ra")?.addEventListener("click", onCalcAeFromRa);
})();
