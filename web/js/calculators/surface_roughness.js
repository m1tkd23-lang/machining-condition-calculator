// web/js/calculators/surface_roughness.js

// 理論仕上げ面粗さ（カスプ高さ）
// h_mm = f_mmrev^2 / (8 * R_mm)
// f_mmrev = sqrt(8 * R_mm * h_mm)
//
// 追加：推定Ra（参考）
// Ra_um ≒ h_um / 4
//
// 追加：R(mm) と Ra(µm) から f(mm/rev) を逆算（参考）
// Ra ≒ h/4 → h ≒ 4Ra
// f = sqrt(8 R h)

(function (global) {
    function isFiniteNumber(x) {
        return typeof x === "number" && Number.isFinite(x);
    }

    function calcHFromRAndF(R_mm, f_mmrev) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(f_mmrev)) return null;
        if (R_mm <= 0 || f_mmrev <= 0) return null;
        const h_mm = (f_mmrev * f_mmrev) / (8 * R_mm);
        return h_mm;
    }

    function calcFFromRAndH(R_mm, h_mm) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(h_mm)) return null;
        if (R_mm <= 0 || h_mm <= 0) return null;
        const f_mmrev = Math.sqrt(8 * R_mm * h_mm);
        return f_mmrev;
    }

    // h(µm) → Ra(µm) 推定（参考）
    function estimateRaFromH(h_um) {
        if (!isFiniteNumber(h_um)) return null;
        if (h_um <= 0) return null;
        return h_um / 4;
    }

    // R(mm) と Ra(µm) から f(mm/rev) 逆算（参考）
    function calcFFromRAndRa(R_mm, Ra_um) {
        if (!isFiniteNumber(R_mm) || !isFiniteNumber(Ra_um)) return null;
        if (R_mm <= 0 || Ra_um <= 0) return null;

        const h_mm = (4 * Ra_um) / 1000.0; // µm → mm
        const f_mmrev = Math.sqrt(8 * R_mm * h_mm);
        return f_mmrev;
    }

    global.SurfaceRoughness = {
        calcHFromRAndF,
        calcFFromRAndH,
        estimateRaFromH,
        calcFFromRAndRa,
    };
})(window);
