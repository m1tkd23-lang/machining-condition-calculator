(function () {
    const PI = Math.PI;

    function isFiniteNumber(x) {
        return Number.isFinite(x);
    }

    function isPos(x) {
        return Number.isFinite(x) && x > 0;
    }

    function deg2rad(deg) {
        return (deg * PI) / 180.0;
    }

    function rad2deg(rad) {
        return (rad * 180.0) / PI;
    }

    // 合成傾き γ（deg）: cosγ = cos(lead)cos(tilt)
    function calcGammaDegFromLeadTilt(lead_deg, tilt_deg) {
        if (!isFiniteNumber(lead_deg) || !isFiniteNumber(tilt_deg)) return null;
        if (lead_deg < 0 || tilt_deg < 0) return null;

        const a = deg2rad(lead_deg);
        const b = deg2rad(tilt_deg);

        const c = Math.cos(a) * Math.cos(b);
        const cc = Math.max(-1, Math.min(1, c)); // 数値誤差ガード
        const gamma = Math.acos(cc);

        return rad2deg(gamma);
    }

    // 切削点直径 Dcp = 2R sin(γ)
    function calcContactDiameterMm(r_mm, gamma_deg) {
        if (!isFiniteNumber(r_mm) || !isFiniteNumber(gamma_deg)) return null;
        if (!(r_mm > 0)) return null;
        if (gamma_deg < 0 || gamma_deg > 90.0 + 1e-9) return null;

        const g = deg2rad(gamma_deg);
        return 2.0 * r_mm * Math.sin(g);
    }

    // 参考：先端からの高さ h = R(1 - cosγ)
    function calcTipHeightMm(r_mm, gamma_deg) {
        if (!isFiniteNumber(r_mm) || !isFiniteNumber(gamma_deg)) return null;
        if (!(r_mm > 0)) return null;
        if (gamma_deg < 0 || gamma_deg > 90.0 + 1e-9) return null;

        const g = deg2rad(gamma_deg);
        return r_mm * (1.0 - Math.cos(g));
    }

    // ★追加：Vc = π × D × n / 1000
    function calcVcFromDAndRpm(d_mm, rpm) {
        if (!isPos(d_mm) || !isPos(rpm)) return null;
        return (PI * d_mm * rpm) / 1000.0;
    }

    window.BallEndContact = {
        calcGammaDegFromLeadTilt,
        calcContactDiameterMm,
        calcTipHeightMm,
        calcVcFromDAndRpm, // ★追加
    };

    // ★追加：rpm = 1000*Vc / (π*D)
    function calcRpmFromVcAndD(vc_mmin, d_mm) {
        if (!isPos(vc_mmin) || !isPos(d_mm)) return null;
        return (1000.0 * vc_mmin) / (PI * d_mm);
    }

    window.BallEndContact = {
        calcGammaDegFromLeadTilt,
        calcContactDiameterMm,
        calcTipHeightMm,
        calcVcFromDAndRpm,
        calcRpmFromVcAndD, // ★追加
    };
})();
