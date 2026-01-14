// 送り計算（純粋関数）
// vf = fz * z * n
// fz = vf / (z * n)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcVfFromFzZN(fz, z, n) {
        if (!isFiniteNumber(fz) || !isFiniteNumber(z) || !isFiniteNumber(n)) return null;
        if (fz <= 0 || z <= 0 || n <= 0) return null;
        return fz * z * n;
    }

    function calcFzFromVfZN(vf, z, n) {
        if (!isFiniteNumber(vf) || !isFiniteNumber(z) || !isFiniteNumber(n)) return null;
        if (vf <= 0 || z <= 0 || n <= 0) return null;
        return vf / (z * n);
    }

    global.FeedCalc = {
        calcVfFromFzZN,
        calcFzFromVfZN,
    };
})(window);
