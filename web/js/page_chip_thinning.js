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

        // 判定は実効切りくず厚 h_eff を主軸にする
        let msg = "";

        if (r.h_eff_mm < 0.02) {
            msg = "実効切りくず厚が非常に小さいです（擦り寄り・補正推奨）。";
        } else if (r.h_eff_mm < 0.04) {
            msg = "実効切りくず厚は小さめです（条件次第）。";
        } else {
            msg = "実効切りくず厚は十分に確保されています。";
        }

        setMsg(msg, false);
    }

    const btn = $("btn_calc");
    if (btn) btn.addEventListener("click", onCalc);
})();
