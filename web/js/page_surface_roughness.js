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

    // UIでは h を µm で扱う（計算は mm に変換）
    function umToMm(um) { return um / 1000.0; }
    function mmToUm(mm) { return mm * 1000.0; }

    function onCalcH() {
        const R = toNumber($("r_mm")?.value);
        const f = toNumber($("f_mmrev")?.value);

        const h_mm = window.SurfaceRoughness?.calcHFromRAndF(R, f);
        if (h_mm == null) {
            setMsg("入力値を確認してください（R と f は正の数）。", true);
            return;
        }

        $("h_um").value = String(round(mmToUm(h_mm), 1)); // µmは小数1桁
        setMsg("計算しました。", false);
    }

    function onCalcF() {
        const R = toNumber($("r_mm")?.value);
        const h_um = toNumber($("h_um")?.value);
        const h_mm = umToMm(h_um);

        const f = window.SurfaceRoughness?.calcFFromRAndH(R, h_mm);
        if (f == null) {
            setMsg("入力値を確認してください（R と h は正の数）。", true);
            return;
        }

        $("f_mmrev").value = String(round(f, 3)); // fは小数3桁
        setMsg("逆算しました。", false);
    }

    const b1 = $("btn_calc_h");
    const b2 = $("btn_calc_f");
    if (b1) b1.addEventListener("click", onCalcH);
    if (b2) b2.addEventListener("click", onCalcF);
})();
