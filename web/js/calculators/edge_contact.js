//web\js\calculators\edge_contact.js
// 切れ刃接触長の変動（純粋関数）
// shoulder milling, constant ae/ap, down milling, right-hand helix fixed
//
// theta_eng = acos(1 - 2ae/D)   (0..pi)
// engaged window (down milling): [0, theta_eng]  (phase convention fixed)
// helix: phi(z) = phi0 + k*z,  k = 2*tan(beta)/D  [rad/mm]
//
// contact length = measure of z in [0, ap] such that phi(z) mod 2pi is inside engaged window

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function clamp(x, lo, hi) {
        return Math.max(lo, Math.min(hi, x));
    }

    function mod2pi(x) {
        const t = 2 * Math.PI;
        let r = x % t;
        if (r < 0) r += t;
        return r;
    }

    function rad2deg(r) {
        return (r * 180) / Math.PI;
    }

    function computeThetaEng(d_mm, ae_mm) {
        // acos arg = 1 - 2ae/D must be in [-1, 1]
        const c = clamp(1 - (2 * ae_mm) / d_mm, -1, 1);
        return Math.acos(c); // 0..pi
    }

    function isEngagedDown(phi, thetaEng) {
        // down milling engaged window: [0, thetaEng]
        // when thetaEng>=2pi (never), but thetaEng<=pi by definition here.
        return phi >= 0 && phi <= thetaEng;
    }

    // representative tooth contact length for a given base angle phi0
    function contactLengthOneTooth(phi0, ap_mm, k_rad_per_mm, thetaEng, zSamples) {
        const N = Math.max(10, Math.floor(zSamples));
        const dz = ap_mm / N;

        let engagedCount = 0;
        for (let i = 0; i < N; i++) {
            // sample at mid-point
            const z = (i + 0.5) * dz;
            const phi = mod2pi(phi0 + k_rad_per_mm * z);
            if (isEngagedDown(phi, thetaEng)) engagedCount += 1;
        }
        return engagedCount * dz;
    }

    function calcWaveforms(params) {
        const {
            d_mm, ae_mm, ap_mm, teeth, helix_deg,
            revs, points_per_rev, z_samples
        } = params;

        // validate
        if (!isFiniteNumber(d_mm) || !isFiniteNumber(ae_mm) || !isFiniteNumber(ap_mm)) return null;
        if (!isFiniteNumber(teeth) || !isFiniteNumber(helix_deg)) return null;
        if (!isFiniteNumber(revs) || !isFiniteNumber(points_per_rev) || !isFiniteNumber(z_samples)) return null;

        if (d_mm <= 0 || ae_mm <= 0 || ap_mm <= 0) return null;
        if (ae_mm >= d_mm) return null; // geometric sanity (for this simple model)
        if (teeth < 1) return null;

        const Nrev = Math.max(1, Math.min(10, Math.floor(revs)));
        const PPR = Math.max(60, Math.min(720, Math.floor(points_per_rev)));
        const ZS = Math.max(50, Math.min(600, Math.floor(z_samples)));

        const thetaEng = computeThetaEng(d_mm, ae_mm);

        // right-hand helix fixed
        const beta = (helix_deg * Math.PI) / 180;
        const k = (2 * Math.tan(beta)) / d_mm; // rad/mm

        const totalPoints = Nrev * PPR;
        const twoPi = 2 * Math.PI;

        const xs = new Array(totalPoints);
        const yTooth = new Array(totalPoints);
        const yTotal = new Array(totalPoints);

        for (let j = 0; j < totalPoints; j++) {
            const phi0 = (twoPi * j) / PPR; // base angle increases with samples; repeats each rev

            // representative tooth = tooth#0
            const L0 = contactLengthOneTooth(phi0, ap_mm, k, thetaEng, ZS);

            // sum over all teeth
            let sum = 0;
            for (let t = 0; t < Math.floor(teeth); t++) {
                const phi = phi0 + (twoPi * t) / teeth;
                sum += contactLengthOneTooth(phi, ap_mm, k, thetaEng, ZS);
            }

            xs[j] = j / PPR;      // in revolutions
            yTooth[j] = L0;       // mm
            yTotal[j] = sum;      // mm
        }

        function stats(arr) {
            let mn = Infinity, mx = -Infinity, s = 0;
            for (const v of arr) {
                if (v < mn) mn = v;
                if (v > mx) mx = v;
                s += v;
            }
            return { min: mn, max: mx, avg: s / arr.length };
        }

        return {
            theta_eng_deg: rad2deg(thetaEng),
            xs_rev: xs,
            y_tooth_mm: yTooth,
            y_total_mm: yTotal,
            stats_tooth: stats(yTooth),
            stats_total: stats(yTotal),
        };
    }

    global.EdgeContact = {
        calcWaveforms,
    };
})(window);
