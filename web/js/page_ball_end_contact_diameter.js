// web/js/page_ball_end_contact_diameter.js
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
        if (!window.BallEndContact) {
            setMsg("ball_end_contact.js が読み込まれていません。", true);
            return;
        }

        const r = toNumber($("r_mm")?.value);
        const lead = toNumber($("lead_deg")?.value);
        const tilt = toNumber($("tilt_deg")?.value);

        const gamma = window.BallEndContact.calcGammaDegFromLeadTilt(lead, tilt);
        if (gamma == null) {
            setMsg("入力値を確認してください（R>0, lead/tilt は 0 以上）。", true);
            setOut("gamma_deg", NaN);
            setOut("dcp_mm", NaN);
            setOut("h_mm", NaN);
            return;
        }

        const dcp = window.BallEndContact.calcContactDiameterMm(r, gamma);
        const h = window.BallEndContact.calcTipHeightMm(r, gamma);

        setOut("gamma_deg", round(gamma, 2));
        setOut("dcp_mm", dcp == null ? NaN : round(dcp, 3));
        setOut("h_mm", h == null ? NaN : round(h, 3));

        setMsg("計算しました。", false);
    }

    $("btn_calc")?.addEventListener("click", onCalc);
})();

