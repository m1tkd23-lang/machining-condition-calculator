// web/js/calculators/ball_end.js
(function () {
    const PI = Math.PI;

    function isPos(x) {
        return Number.isFinite(x) && x > 0;
    }

    // Deff = 2*sqrt(2Rh - h^2), 0 <= h <= 2R
    function calcDeffFromRAndH(r_mm, h_mm) {
        if (!Number.isFinite(r_mm) || !Number.isFinite(h_mm)) return null;
        if (!(r_mm > 0)) return null;
        if (h_mm < 0 || h_mm > 2 * r_mm) return null;

        const inside = 2 * r_mm * h_mm - h_mm * h_mm;
        if (inside < 0) return null;

        const deff = 2 * Math.sqrt(inside);
        return deff;
    }

    function calcVcFromDAndRpm(d_mm, rpm) {
        if (!isPos(d_mm) || !isPos(rpm)) return null;
        return (PI * d_mm * rpm) / 1000.0; // m/min
    }

    function calcVfFromFzZN(fz, z, rpm) {
        if (!isPos(fz) || !isPos(z) || !isPos(rpm)) return null;
        return fz * z * rpm; // mm/min
    }

    // Rz_feed ≈ f_rev^2 / (8*R_eff), f_rev = fz*z, R_eff = Deff/2
    function estimateRzFeedMm(fz, z, deff_mm) {
        if (!isPos(fz) || !isPos(z) || !isPos(deff_mm)) return null;
        const r_eff = deff_mm / 2;
        if (!(r_eff > 0)) return null;
        const f_rev = fz * z;
        return (f_rev * f_rev) / (8 * r_eff);
    }

    // cusp height h ≈ ae^2 / (8*R_eff)
    function estimateCuspHeightMm(ae_mm, deff_mm) {
        if (!Number.isFinite(ae_mm) || !isPos(deff_mm)) return null;
        if (ae_mm <= 0) return null;
        const r_eff = deff_mm / 2;
        if (!(r_eff > 0)) return null;
        return (ae_mm * ae_mm) / (8 * r_eff);
    }

    window.BallEnd = {
        calcDeffFromRAndH,
        calcVcFromDAndRpm,
        calcVfFromFzZN,
        estimateRzFeedMm,
        estimateCuspHeightMm,
    };
})();
