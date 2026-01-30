// web/js/calculators/ball_end_surface_roughness.js
//
// ボール仕上げ面粗さ（平面のスキャロップ）
// ※スキャロップはRとaeで決まる（θは影響しない）
//
// h = R - sqrt(R^2 - (ae/2)^2)
// ae = 2*sqrt(2*R*h - h^2)
//
// 参考：切削点直径
// Dcp = 2R sinθ
//
// 推定Ra（参考）
// Ra ≒ h/4

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function degToRad(deg) {
        return (deg * Math.PI) / 180.0;
    }

    function calcScallopHeightMmFromRAndAe(R_mm, ae_mm) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(ae_mm)) return null;
        if (R_mm <= 0 || ae_mm <= 0) return null;

        const half = ae_mm / 2;
        if (half > R_mm) return null;

        const inside = R_mm * R_mm - half * half;
        if (inside < 0) return null;

        return R_mm - Math.sqrt(inside);
    }

    function calcAeFromRAndHmm(R_mm, h_mm) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(h_mm)) return null;
        if (R_mm <= 0 || h_mm <= 0) return null;
        if (h_mm >= 2 * R_mm) return null;

        const inside = 2 * R_mm * h_mm - h_mm * h_mm;
        if (inside < 0) return null;

        return 2 * Math.sqrt(inside);
    }

    function estimateRaFromH(h_um) {
        if (!isFiniteNumber(h_um)) return null;
        if (h_um <= 0) return null;
        return h_um / 4;
    }

    function calcDcpFromRAndThetaDeg(R_mm, theta_deg) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(theta_deg)) return null;
        if (R_mm <= 0) return null;
        if (theta_deg < 0 || theta_deg > 90) return null;

        const th = degToRad(theta_deg);
        const dcp = 2 * R_mm * Math.sin(th);
        return dcp;
    }

    global.BallEndSurfaceRoughness = {
        calcScallopHeightMmFromRAndAe,
        calcAeFromRAndHmm,
        estimateRaFromH,
        calcDcpFromRAndThetaDeg,
    };
})(window);
