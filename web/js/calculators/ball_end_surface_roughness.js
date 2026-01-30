// web/js/calculators/ball_end_surface_roughness.js
//
// ボール仕上げ面粗さ（ピックフィード/傾斜）
// θ = 工具軸と面法線のなす角（deg）
// Deff = 2R sinθ
// r_eff = Deff/2
//
// カスプ高（厳密, 断面円）
// h = r_eff - sqrt(r_eff^2 - (ae/2)^2)
// 逆算
// ae = 2*sqrt(2*r_eff*h - h^2)
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

    function calcDeffFromRAndThetaDeg(R_mm, theta_deg) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(theta_deg)) return null;
        if (R_mm <= 0) return null;
        if (theta_deg <= 0 || theta_deg >= 90) return null; // 0はDeff=0になるので除外（実務上も危険域）
        const th = degToRad(theta_deg);
        const deff = 2 * R_mm * Math.sin(th);
        if (!(deff > 0)) return null;
        return deff;
    }

    // h(mm) from r_eff(mm) and ae(mm)
    function calcCuspHeightMmFromReffAndAe(reff_mm, ae_mm) {
        if (!isFiniteNumber(reff_mm) || !isFiniteNumber(ae_mm)) return null;
        if (reff_mm <= 0 || ae_mm <= 0) return null;

        const half = ae_mm / 2;
        if (half > reff_mm) return null; // 幾何的に成立しない

        const inside = reff_mm * reff_mm - half * half;
        if (inside < 0) return null;

        const h_mm = reff_mm - Math.sqrt(inside);
        return h_mm;
    }

    // ae(mm) from r_eff(mm) and h(mm)
    function calcAeFromReffAndHmm(reff_mm, h_mm) {
        if (!isFiniteNumber(reff_mm) || !isFiniteNumber(h_mm)) return null;
        if (reff_mm <= 0 || h_mm <= 0) return null;
        if (h_mm >= 2 * reff_mm) return null;

        const inside = 2 * reff_mm * h_mm - h_mm * h_mm;
        if (inside < 0) return null;

        return 2 * Math.sqrt(inside);
    }

    function estimateRaFromH(h_um) {
        if (!isFiniteNumber(h_um)) return null;
        if (h_um <= 0) return null;
        return h_um / 4;
    }

    global.BallEndSurfaceRoughness = {
        calcDeffFromRAndThetaDeg,
        calcCuspHeightMmFromReffAndAe,
        calcAeFromReffAndHmm,
        estimateRaFromH,
    };
})(window);
