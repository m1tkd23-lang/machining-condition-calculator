//web\js\calculators\chip_thinning.js

// チップ薄化補正（純粋関数）
// down milling / simple model
// theta_eng = acos(1 - 2ae/D)
// theta_max = min(pi/2, theta_eng)
// h_eff = fz * sin(theta_max)
// K = 1 / sin(theta_max)  (>=1 when ae < D/2, else 1)
// fz_adj = h_target / sin(theta_max)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function clamp(x, lo, hi) {
        return Math.max(lo, Math.min(hi, x));
    }

    function rad2deg(r) {
        return (r * 180) / Math.PI;
    }

    function calcChipThinning(d_mm, ae_mm, fz_mm, h_target_mm) {
        if (!isFiniteNumber(d_mm) || !isFiniteNumber(ae_mm) || !isFiniteNumber(fz_mm)) return null;
        if (d_mm <= 0 || ae_mm <= 0 || fz_mm <= 0) return null;

        // ae must be < D to make geometric sense in this simple model
        if (ae_mm >= d_mm) return null;

        // acos argument should be within [-1, 1]
        const c = clamp(1 - (2 * ae_mm) / d_mm, -1, 1);

        const thetaEng = Math.acos(c);          // 0..pi
        const thetaMax = Math.min(Math.PI / 2, thetaEng);  // 0..pi/2

        const s = Math.sin(thetaMax);
        if (!(s > 0)) return null;

        const hEff = fz_mm * s;

        const hTarget = (isFiniteNumber(h_target_mm) && h_target_mm > 0) ? h_target_mm : fz_mm;
        const k = 1 / s;
        const fzAdj = hTarget / s;

        return {
            theta_eng_deg: rad2deg(thetaEng),
            theta_max_deg: rad2deg(thetaMax),
            h_eff_mm: hEff,
            k_factor: k,
            fz_adj_mm: fzAdj,
            h_target_mm: hTarget,
        };
    }

    global.ChipThinning = { calcChipThinning };
})(window);
