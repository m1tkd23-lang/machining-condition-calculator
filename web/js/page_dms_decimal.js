// web/js/page_dms_decimal.js
(function () {
    "use strict";

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

    function setVal(id, v) {
        const el = $(id);
        if (!el) return;
        el.value = (v === null || v === undefined || !Number.isFinite(v)) ? "" : String(v);
    }

    function round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    function onDmsToDec() {
        setMsg("", false);

        if (!window.DmsDecimal) {
            setMsg("dms_decimal.js が読み込まれていません。", true);
            return;
        }

        const deg = toNumber($("dms_deg")?.value);
        const min = toNumber($("dms_min")?.value);
        const sec = toNumber($("dms_sec")?.value);

        const dec = window.DmsDecimal.dmsToDecimal(deg, min, sec);
        if (!Number.isFinite(dec)) {
            setVal("out_decimal", NaN);
            setMsg("入力が不正です（度・分・秒を数値で入力。分/秒は0以上）。", true);
            return;
        }

        // 表示は丸め（必要なら桁数変更）
        setVal("out_decimal", round(dec, 10));
    }

    function onDecToDms() {
        setMsg("", false);

        if (!window.DmsDecimal) {
            setMsg("dms_decimal.js が読み込まれていません。", true);
            return;
        }

        const dec = toNumber($("dec_in")?.value);
        const digits = Number($("sec_digits")?.value ?? 3);

        const dms = window.DmsDecimal.decimalToDms(dec, Number.isFinite(digits) ? digits : 3);
        if (!dms) {
            setVal("out_deg", NaN);
            setVal("out_min", NaN);
            setVal("out_sec", NaN);
            setMsg("入力が不正です（十進角を数値で入力）。", true);
            return;
        }

        $("out_deg").value = String(dms.deg);
        $("out_min").value = String(dms.min);
        $("out_sec").value = String(dms.sec);
    }

    function clearDms() {
        ["dms_deg", "dms_min", "dms_sec", "out_decimal"].forEach((id) => {
            const el = $(id);
            if (el) el.value = "";
        });
        setMsg("", false);
    }

    function clearDec() {
        ["dec_in", "out_deg", "out_min", "out_sec"].forEach((id) => {
            const el = $(id);
            if (el) el.value = "";
        });
        setMsg("", false);
    }

    function init() {
        $("btn_dms_to_dec")?.addEventListener("click", onDmsToDec);
        $("btn_dec_to_dms")?.addEventListener("click", onDecToDms);
        $("btn_clear_dms")?.addEventListener("click", clearDms);
        $("btn_clear_dec")?.addEventListener("click", clearDec);

        // Enterキーでも変換
        ["dms_deg", "dms_min", "dms_sec"].forEach((id) => {
            $(id)?.addEventListener("keydown", (e) => {
                if (e.key === "Enter") onDmsToDec();
            });
        });
        $("dec_in")?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") onDecToDms();
        });
    }

    init();
})();
