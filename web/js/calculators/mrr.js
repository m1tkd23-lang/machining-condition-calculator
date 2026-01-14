// 除去量（MRR）
// Q_mm3min = ap_mm * ae_mm * vf_mmmin
// vf_mmmin = Q_mm3min / (ap_mm * ae_mm)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcQ(ap_mm, ae_mm, vf_mmmin) {
        if (!isFiniteNumber(ap_mm) || !isFiniteNumber(ae_mm) || !isFiniteNumber(vf_mmmin)) return null;
        if (ap_mm <= 0 || ae_mm <= 0 || vf_mmmin <= 0) return null;
        return ap_mm * ae_mm * vf_mmmin;
    }

    function calcVfFromQ(ap_mm, ae_mm, q_mm3min) {
        if (!isFiniteNumber(ap_mm) || !isFiniteNumber(ae_mm) || !isFiniteNumber(q_mm3min)) return null;
        if (ap_mm <= 0 || ae_mm <= 0 || q_mm3min <= 0) return null;
        return q_mm3min / (ap_mm * ae_mm);
    }

    global.MRR = {
        calcQ,
        calcVfFromQ,
    };
})(window);
