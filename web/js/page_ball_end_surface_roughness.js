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

    function updateRefDcp() {
        const R = toNumber($("r_mm")?.value);
        const theta = toNumber($("theta_deg")?.value);
        const dcp = window.BallEndSurfaceRoughness?.calcDcpFromRAndThetaDeg(R, theta);
        setOut("dcp_mm", dcp == null ? NaN : round(dcp, 3));
    }

    function setRaFromHUm(h_um) {
        const ra = window.BallEndSurfaceRoughness?.estimateRaFromH(h_um);
        setOut("ra_um", ra == null ? NaN : round(ra, 3));
    }

    function onCalcH() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const R = toNumber($("r_mm")?.value);
        const ae = toNumber($("ae_mm")?.value);

        updateRefDcp();

        const h_mm = window.BallEndSurfaceRoughness.calcScallopHeightMmFromRAndAe(R, ae);
        if (h_mm == null) {
            setMsg("入力値を確認してください（R>0, ae>0, ae ≤ 2R）。", true);
            setOut("h_um", NaN);
            setOut("ra_um", NaN);
            return;
        }

        const h_um = round(mmToUm(h_mm), 1);
        setOut("h_um", h_um);
        setRaFromHUm(h_um);

        setMsg("計算しました。", false);
    }

    function onCalcAe() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const R = toNumber($("r_mm")?.value);
        const h_um = toNumber($("h_um")?.value);
        const h_mm = umToMm(h_um);

        updateRefDcp();

        const ae = window.BallEndSurfaceRoughness.calcAeFromRAndHmm(R, h_mm);
        if (ae == null) {
            setMsg("入力値を確認してください（R>0, h>0, h が大きすぎる可能性）。", true);
            setOut("ae_mm", NaN);
            setOut("ra_um", NaN);
            return;
        }

        setOut("ae_mm", round(ae, 3));
        setRaFromHUm(h_um);
        setMsg("逆算しました。", false);
    }

    function onCalcAeFromRa() {
        if (!window.BallEndSurfaceRoughness) {
            setMsg("ball_end_surface_roughness.js が読み込まれていません。", true);
            return;
        }

        const R = toNumber($("r_mm")?.value);
        const ra_um = toNumber($("ra_um")?.value);

        updateRefDcp();

        if (!Number.isFinite(ra_um) || ra_um <= 0) {
            setMsg("入力値を確認してください（Ra は正の数）。", true);
            return;
        }

        const h_um = 4 * ra_um;      // Ra ≒ h/4 → h ≒ 4Ra
        const h_mm = umToMm(h_um);

        const ae = window.BallEndSurfaceRoughness.calcAeFromRAndHmm(R, h_mm);
        if (ae == null) {
            setMsg("入力値を確認してください（Ra が大きすぎる可能性）。", true);
            setOut("ae_mm", NaN);
            setOut("h_um", NaN);
            return;
        }

        setOut("h_um", round(h_um, 1));
        setOut("ae_mm", round(ae, 3));
        setRaFromHUm(h_um);

        setMsg("逆算しました（参考値）。", false);
    }

    $("btn_calc_h")?.addEventListener("click", onCalcH);
    $("btn_calc_ae")?.addEventListener("click", onCalcAe);
    $("btn_calc_ae_from_ra")?.addEventListener("click", onCalcAeFromRa);

    // 参考値なので、初期表示で一度だけ更新しておく
    updateRefDcp();
})();
