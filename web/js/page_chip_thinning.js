//web\js\page_chip_thinning.js


(function () {
    const $ = (id) => document.getElementById(id);

    function toNumber(value) {
        if (value === "" || value === null || value === undefined) return NaN;
        return Number(value);
    }

    function round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    function setMsg(text, isError) {
        const el = $("msg");
        if (!el) return;
        el.textContent = text || "";
        el.classList.toggle("error", !!isError);
    }

    function setValue(id, v) {
        const el = $(id);
        if (!el) return;
        el.value = v;
    }

    function onCalc() {
        const d = toNumber($("d_mm")?.value);
        const ae = toNumber($("ae_mm")?.value);
        const fz = toNumber($("fz_mm")?.value);
        const hTarget = toNumber($("h_target_mm")?.value);

        const r = window.ChipThinning?.calcChipThinning(d, ae, fz, hTarget);
        if (!r) {
            setMsg("入力値を確認してください（D>0, ae>0, fz>0, ae<D）。", true);
            return;
        }

        setValue("theta_eng_deg", String(round(r.theta_eng_deg, 2)));
        setValue("theta_max_deg", String(round(r.theta_max_deg, 2)));
        setValue("h_eff_mm", String(round(r.h_eff_mm, 4)));
        setValue("k_factor", String(round(r.k_factor, 3)));
        setValue("fz_adj_mm", String(round(r.fz_adj_mm, 4)));

        // 薄化の強さに応じた段階表示
        let msg = "";
        if (r.k_factor <= 1.05) {
            msg = "薄化はほぼ発生していません。";
        } else if (r.k_factor <= 1.5) {
            msg = "薄化が発生しています（条件次第）。";
        } else {
            msg = "薄化が強く発生しています（補正推奨）。";
        }
        setMsg(msg, false);
    }

    const btn = $("btn_calc");
    if (btn) btn.addEventListener("click", onCalc);
})();
