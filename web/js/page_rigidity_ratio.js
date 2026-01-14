(function () {
    const $ = (id) => document.getElementById(id);

    function toNumber(value) {
        if (value === "" || value === null || value === undefined) return NaN;
        return Number(value);
    }

    function setMsg(text, isError) {
        const el = $("msg");
        if (!el) return;
        el.textContent = text || "";
        el.classList.toggle("error", !!isError);
    }

    function round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    function onCalc() {
        const L = toNumber($("l_ratio")?.value);
        const d = toNumber($("d_ratio")?.value);

        const k = window.RigidityRatio?.calcRigidityRatio(L, d);
        if (k == null) {
            setMsg("入力値を確認してください（L× と 太さ× は 0 より大きい値が必要です）。", true);
            return;
        }

        $("k_ratio").value = String(round(k, 6));
        setMsg("計算しました。", false);
    }

    const btn = $("btn_calc");
    if (btn) btn.addEventListener("click", onCalc);
})();
