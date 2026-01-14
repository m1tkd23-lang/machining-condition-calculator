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

    function onCalcRpm() {
        const d = toNumber($("diameter_mm")?.value);
        const vc = toNumber($("vc_mmin")?.value);

        const rpm = window.CuttingSpeed?.calcRpmFromVcAndD(vc, d);
        if (rpm == null) {
            setMsg("入力値を確認してください（DとVcは正の数）。", true);
            return;
        }

        $("rpm").value = String(Math.round(rpm));
        setMsg("計算しました。", false);
    }

    function onCalcVc() {
        const d = toNumber($("diameter_mm")?.value);
        const rpm = toNumber($("rpm")?.value);

        const vc = window.CuttingSpeed?.calcVcFromRpmAndD(rpm, d);
        if (vc == null) {
            setMsg("入力値を確認してください（Dとnは正の数）。", true);
            return;
        }

        $("vc_mmin").value = String(round(vc, 1));
        setMsg("計算しました。", false);
    }

    const b1 = $("btn_calc_rpm");
    const b2 = $("btn_calc_vc");
    if (b1) b1.addEventListener("click", onCalcRpm);
    if (b2) b2.addEventListener("click", onCalcVc);
})();
