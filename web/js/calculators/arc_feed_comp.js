// web/js/calculators/arc_feed_comp.js
// 円弧送り補正（純粋関数）
// - 指令vfは工具中心点の送り
// - 仕上げ径上の加工点の送りは径比で変化する
//
// 内径(ID): D_path = D_work - D_tool
// 外形(OD): D_path = D_work + D_tool
// k_arc = D_work / D_path
// vf_surface = vf_cmd * k_arc
//
// オプション：ヘリカル角度（参考）
// α = atan(dz / (π * D_path))   dz: 1周あたりZ量
// dz = tan(α) * (π * D_path)
//
// オプション薄化（ダウンカット簡易）
// φ = arccos(1 - 2ae/D_tool)
// h_eff = fz_surface * sin(φ)
// k_thin = 1/sin(φ)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function clamp(x, a, b) {
        return Math.max(a, Math.min(b, x));
    }

    function calcArcFeedComp(d_work, d_tool, mode, vf_cmd, rpm, teeth, ae_opt, dz_per_rev_opt) {
        if (!isFiniteNumber(d_work) || !isFiniteNumber(d_tool)) return null;
        if (d_work <= 0 || d_tool <= 0) return null;

        if (mode !== "ID" && mode !== "OD") return null;

        if (!isFiniteNumber(vf_cmd) || vf_cmd <= 0) return null;
        if (!isFiniteNumber(rpm) || rpm <= 0) return null;
        if (!isFiniteNumber(teeth) || teeth <= 0) return null;

        const d_path = (mode === "ID") ? (d_work - d_tool) : (d_work + d_tool);
        if (d_path <= 0) return null;

        const k_arc = d_work / d_path;
        const vf_surface = vf_cmd * k_arc;
        const fz_surface = vf_surface / (teeth * rpm);

        // --- optional: helix angle ---
        let helix_deg = null;
        const dz = dz_per_rev_opt;
        if (isFiniteNumber(dz) && dz > 0) {
            const circ = Math.PI * d_path;
            if (circ > 0) {
                const a = Math.atan(dz / circ);
                helix_deg = a * 180 / Math.PI;
            }
        }

        // --- optional: thinning ---
        let phi_deg = null;
        let h_eff = null;
        let k_thin = null;

        const ae = ae_opt;
        if (isFiniteNumber(ae) && ae > 0) {
            if (ae < d_tool) {
                const c = 1 - (2 * ae) / d_tool;
                const cc = clamp(c, -1, 1);
                const phi = Math.acos(cc);
                phi_deg = phi * 180 / Math.PI;

                const s = Math.sin(phi);
                if (s > 0) {
                    h_eff = fz_surface * s;
                    k_thin = 1 / s;
                }
            }
        }

        return {
            d_path_mm: d_path,
            k_arc,
            vf_surface,
            fz_surface,

            helix_deg,

            phi_deg,
            h_eff_mm: h_eff,
            k_thin,
        };
    }

    function invDzPerRevFromHelixDeg(helix_deg, d_path_mm) {
        if (!isFiniteNumber(helix_deg) || helix_deg <= 0) return null;
        if (!isFiniteNumber(d_path_mm) || d_path_mm <= 0) return null;

        const a = helix_deg * Math.PI / 180;
        const circ = Math.PI * d_path_mm;
        return Math.tan(a) * circ;
    }

    global.ArcFeedComp = {
        calcArcFeedComp,
        invDzPerRevFromHelixDeg,
    };
})(window);
