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

    function onCalcTime() {
        const L = toNumber($("length_mm")?.value);
        const vf = toNumber($("vf_mmin")?.value);

        const out = window.CuttingTime?.calcTimeFromLengthAndVf(L, vf);
        if (out == null) {
            setMsg("入力値を確認してください（L と vf は正の数）。", true);
            return;
        }

        $("time_min").value = String(round(out.tMin, 3)); // minは小数3桁
        $("time_sec").value = String(round(out.tSec, 1)); // secは小数1桁
        setMsg("計算しました。", false);
    }

    const btn = $("btn_calc_time");
    if (btn) btn.addEventListener("click", onCalcTime);
})();
