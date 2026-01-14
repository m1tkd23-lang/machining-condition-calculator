// web/js/page_ball_end_effective.js
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

    function onCalc() {
        if (!window.BallEnd) {
            setMsg("ball_end.js が読み込まれていません。", true);
            return;
        }

        const r = toNumber($("r_mm")?.value);
        const h = toNumber($("h_mm")?.value);
        const rpm = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);
        const fz = toNumber($("fz")?.value);
        const ae = toNumber($("ae_mm")?.value);

        const deff = window.BallEnd.calcDeffFromRAndH(r, h);
        if (deff == null) {
            setMsg("入力値を確認してください（R>0, 0≤h≤2R）。", true);
            setOut("deff_mm", NaN);
            setOut("vc_eff_mmin", NaN);
            setOut("vf_mmin", NaN);
            setOut("rz_feed_mm", NaN);
            setOut("hcusp_mm", NaN);
            return;
        }

        const vcEff = window.BallEnd.calcVcFromDAndRpm(deff, rpm);
        const vf = window.BallEnd.calcVfFromFzZN(fz, z, rpm);

        const rz = window.BallEnd.estimateRzFeedMm(fz, z, deff);
        const cusp = window.BallEnd.estimateCuspHeightMm(ae, deff);

        setOut("deff_mm", round(deff, 3));
        setOut("vc_eff_mmin", vcEff == null ? NaN : round(vcEff, 1));
        setOut("vf_mmin", vf == null ? NaN : Math.round(vf)); // ★ここがvf代入
        setOut("rz_feed_mm", rz == null ? NaN : round(rz, 6));
        setOut("hcusp_mm", cusp == null ? NaN : round(cusp, 6));

        if (vf == null) {
            setMsg("vf が計算できません（fz/z/n を確認）。", true);
        } else {
            setMsg("計算しました。", false);
        }
    }

    $("btn_calc")?.addEventListener("click", onCalc);
})();
