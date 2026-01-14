// 切削時間（純粋関数）
// t_min = L_mm / vf_mm_min
// t_sec = t_min * 60

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcTimeFromLengthAndVf(length_mm, vf_mm_min) {
        if (!isFiniteNumber(length_mm) || !isFiniteNumber(vf_mm_min)) return null;
        if (length_mm <= 0 || vf_mm_min <= 0) return null;

        const tMin = length_mm / vf_mm_min;
        const tSec = tMin * 60;
        return { tMin, tSec };
    }

    global.CuttingTime = {
        calcTimeFromLengthAndVf,
    };
})(window);
