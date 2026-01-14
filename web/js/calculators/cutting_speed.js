// 周速・回転数（純粋関数）
// Vc = π * D * n / 1000
// D: mm, Vc: m/min, n: rpm

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcRpmFromVcAndD(vc_mmin, d_mm) {
        if (!isFiniteNumber(vc_mmin) || !isFiniteNumber(d_mm)) return null;
        if (vc_mmin <= 0 || d_mm <= 0) return null;
        return (1000 * vc_mmin) / (Math.PI * d_mm);
    }

    function calcVcFromRpmAndD(rpm, d_mm) {
        if (!isFiniteNumber(rpm) || !isFiniteNumber(d_mm)) return null;
        if (rpm <= 0 || d_mm <= 0) return null;
        return (Math.PI * d_mm * rpm) / 1000;
    }

    global.CuttingSpeed = {
        calcRpmFromVcAndD,
        calcVcFromRpmAndD,
    };
})(window);
