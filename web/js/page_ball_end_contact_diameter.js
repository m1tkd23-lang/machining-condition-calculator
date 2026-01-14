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
        const rpm = toNumber($("rpm")?.value);

        const gamma = window.BallEndContact.calcGammaDegFromLeadTilt(lead, tilt);
        if (gamma == null) {
            setMsg("入力値を確認してください（R>0, lead/tilt は 0 以上）。", true);
            setOut("gamma_deg", NaN);
            setOut("dcp_mm", NaN);
            setOut("vc_eff_mmin", NaN);
            setOut("h_mm", NaN);
            setOut("rpm_req", NaN);
            return;
        }

        const dcp = window.BallEndContact.calcContactDiameterMm(r, gamma);
        const h = window.BallEndContact.calcTipHeightMm(r, gamma);

        // 先に dcp の妥当性チェック
        if (dcp == null || !(dcp > 0)) {
            setOut("gamma_deg", round(gamma, 2));
            setOut("dcp_mm", NaN);
            setOut("vc_eff_mmin", NaN);
            setOut("h_mm", h == null ? NaN : round(h, 3));
            setOut("rpm_req", NaN);

            setMsg("切削点直径 Dcp が 0 付近です（先端近傍）。角度を増やすか条件を見直してください。", true);
            return;
        }

        const vc = window.BallEndContact.calcVcFromDAndRpm(dcp, rpm);

        // ★ここ：IDをテンプレと一致させる（vc_eff_target）
        const vcTarget = toNumber($("vc_eff_target")?.value);
        const rpmReq = window.BallEndContact.calcRpmFromVcAndD(vcTarget, dcp);

        setOut("gamma_deg", round(gamma, 2));
        setOut("dcp_mm", round(dcp, 3));
        setOut("vc_eff_mmin", vc == null ? NaN : round(vc, 1));
        setOut("h_mm", h == null ? NaN : round(h, 3));
        setOut("rpm_req", rpmReq == null ? NaN : Math.round(rpmReq));

        if (rpmReq == null && Number.isFinite(vcTarget) && vcTarget > 0) {
            setMsg("計算しました（目標Vcからの必要回転数が出せません。入力値を確認）。", true);
            return;
        }

        setMsg("計算しました。", false);
    }

    $("btn_calc")?.addEventListener("click", onCalc);
})();
