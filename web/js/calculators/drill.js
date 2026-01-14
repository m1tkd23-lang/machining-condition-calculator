// web/js/calculators/drill.js
(function () {
    // ---- basic checks ----
    function isPos(x) {
        return Number.isFinite(x) && x > 0;
    }

    function isNonNeg(x) {
        return Number.isFinite(x) && x >= 0;
    }

    function degToRad(deg) {
        return (deg * Math.PI) / 180.0;
    }

    // tan(theta/2) を安全に計算
    function tanHalfAngle(theta_deg) {
        if (!isPos(theta_deg)) return null;
        if (!(theta_deg > 0 && theta_deg < 180)) return null;

        const alpha_rad = degToRad(theta_deg / 2.0);
        const t = Math.tan(alpha_rad);

        if (!Number.isFinite(t) || t <= 0) return null;
        return t;
    }

    // ------------------------------------------------------------
    // ドリル先端：肩の高さ（円錐高さ）
    // H = (D/2) / tan(theta/2)
    // ------------------------------------------------------------
    function calcPointHeightFromDiameterAndAngle(d_mm, theta_deg) {
        if (!isPos(d_mm) || !isPos(theta_deg)) return null;
        if (!(theta_deg > 0 && theta_deg < 180)) return null;

        const t = tanHalfAngle(theta_deg);
        if (t == null) return null;

        const alpha_deg = theta_deg / 2.0;
        const h = (d_mm / 2.0) / t;

        return {
            h_mm: h,
            alpha_deg: alpha_deg,
        };
    }

    // ------------------------------------------------------------
    // カウンターシンク：径 → 深さ
    // t = (D1 - D2) / (2 * tan(theta/2))
    // ※ D2 は 0 を許容（完全円錐）
    // ------------------------------------------------------------
    function calcCountersinkDepthFromD1D2Theta(d1_mm, d2_mm, theta_deg) {
        if (!isPos(d1_mm) || !isNonNeg(d2_mm) || !isPos(theta_deg)) return null;
        if (!(d1_mm >= d2_mm)) return null;

        const t = tanHalfAngle(theta_deg);
        if (t == null) return null;

        return (d1_mm - d2_mm) / (2.0 * t);
    }

    // ------------------------------------------------------------
    // カウンターシンク：深さ → 径
    // D1 = D2 + 2 * t * tan(theta/2)
    // ※ D2 は 0 を許容
    // ------------------------------------------------------------
    function calcCountersinkD1FromDepthD2Theta(depth_mm, d2_mm, theta_deg) {
        if (!isPos(depth_mm) || !isNonNeg(d2_mm) || !isPos(theta_deg)) return null;

        const t = tanHalfAngle(theta_deg);
        if (t == null) return null;

        return d2_mm + 2.0 * depth_mm * t;
    }

    // ------------------------------------------------------------
    // 公開API
    // ------------------------------------------------------------
    window.DrillCalc = {
        // ドリル先端
        calcPointHeightFromDiameterAndAngle,

        // カウンターシンク
        calcCountersinkDepthFromD1D2Theta,
        calcCountersinkD1FromDepthD2Theta,
    };
})();
