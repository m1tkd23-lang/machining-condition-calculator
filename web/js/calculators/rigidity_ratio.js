// 剛性倍率（純粋関数）
// k_ratio = (d_ratio^4) / (l_ratio^3)
// 片持ち梁・材質同一・相似形を想定

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcRigidityRatio(l_ratio, d_ratio) {
        if (!isFiniteNumber(l_ratio) || !isFiniteNumber(d_ratio)) return null;
        if (l_ratio <= 0 || d_ratio <= 0) return null;

        const k = Math.pow(d_ratio, 4) / Math.pow(l_ratio, 3);
        return k;
    }

    global.RigidityRatio = { calcRigidityRatio };
})(window);
