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

    function onCalcVf() {
        const n = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);
        const fz = toNumber($("fz")?.value);

        const vf = window.FeedCalc?.calcVfFromFzZN(fz, z, n);
        if (vf == null) {
            setMsg("入力値を確認してください（n, z, fz は正の数）。", true);
            return;
        }

        $("vf").value = String(Math.round(vf)); // vf は整数表示（mm/min）
        setMsg("計算しました。", false);
    }

    function onCalcFz() {
        const n = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);
        const vf = toNumber($("vf")?.value);

        const fz = window.FeedCalc?.calcFzFromVfZN(vf, z, n);
        if (fz == null) {
            setMsg("入力値を確認してください（n, z, vf は正の数）。", true);
            return;
        }

        $("fz").value = String(round(fz, 3)); // fz は小数3桁
        setMsg("計算しました。", false);
    }

    const b1 = $("btn_calc_vf");
    const b2 = $("btn_calc_fz");
    if (b1) b1.addEventListener("click", onCalcVf);
    if (b2) b2.addEventListener("click", onCalcFz);
})();
