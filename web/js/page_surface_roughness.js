// web/js/page_surface_roughness.js
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

    function setRaFromHUm(h_um) {
        const raEl = $("ra_um");
        if (!raEl) return;

        const ra = window.SurfaceRoughness?.estimateRaFromH(h_um);
        if (ra == null) {
            raEl.value = "";
            return;
        }
        raEl.value = String(round(ra, 3)); // Raは小数3桁
    }

    function onCalcH() {
        const R = toNumber($("r_mm")?.value);
        const f = toNumber($("f_mmrev")?.value);

        const h_mm = window.SurfaceRoughness?.calcHFromRAndF(R, f);
        if (h_mm == null) {
            setMsg("入力値を確認してください（R と f は正の数）。", true);
            setRaFromHUm(NaN);
            return;
        }

        const h_um = round(mmToUm(h_mm), 1); // µmは小数1桁
        $("h_um").value = String(h_um);
        setRaFromHUm(h_um);

        setMsg("計算しました。", false);
    }

    function onCalcF() {
        const R = toNumber($("r_mm")?.value);
        const h_um = toNumber($("h_um")?.value);
        const h_mm = umToMm(h_um);

        const f = window.SurfaceRoughness?.calcFFromRAndH(R, h_mm);
        if (f == null) {
            setMsg("入力値を確認してください（R と h は正の数）。", true);
            setRaFromHUm(NaN);
            return;
        }

        $("f_mmrev").value = String(round(f, 3)); // fは小数3桁
        setRaFromHUm(h_um);

        setMsg("逆算しました。", false);
    }

    function onCalcFFromRa() {
        const R = toNumber($("r_mm")?.value);
        const ra_um = toNumber($("ra_um")?.value);

        const f = window.SurfaceRoughness?.calcFFromRAndRa(R, ra_um);
        if (f == null) {
            setMsg("入力値を確認してください（R と Ra は正の数）。", true);
            return;
        }

        // Ra → h(µm) は h ≒ 4Ra
        const h_um = 4 * ra_um;

        $("f_mmrev").value = String(round(f, 3)); // fは小数3桁
        const hEl = $("h_um");
        if (hEl) hEl.value = String(round(h_um, 1)); // hは小数1桁
        setRaFromHUm(h_um);

        setMsg("逆算しました（参考値）。", false);
    }

    const b1 = $("btn_calc_h");
    const b2 = $("btn_calc_f");
    const b3 = $("btn_calc_f_from_ra");
    if (b1) b1.addEventListener("click", onCalcH);
    if (b2) b2.addEventListener("click", onCalcF);
    if (b3) b3.addEventListener("click", onCalcFFromRa);
})();
