// 理論仕上げ面粗さ（カスプ高さ）
// h_mm = f_mmrev^2 / (8 * R_mm)
// f_mmrev = sqrt(8 * R_mm * h_mm)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcHFromRAndF(R_mm, f_mmrev) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(f_mmrev)) return null;
        if (R_mm <= 0 || f_mmrev <= 0) return null;
        const h_mm = (f_mmrev * f_mmrev) / (8 * R_mm);
        return h_mm;
    }

    function calcFFromRAndH(R_mm, h_mm) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(h_mm)) return null;
        if (R_mm <= 0 || h_mm <= 0) return null;
        const f_mmrev = Math.sqrt(8 * R_mm * h_mm);
        return f_mmrev;
    }

    global.SurfaceRoughness = {
        calcHFromRAndF,
        calcFFromRAndH,
    };
})(window);
