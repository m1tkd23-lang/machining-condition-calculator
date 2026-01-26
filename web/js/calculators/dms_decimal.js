// web/js/calculators/dms_decimal.js
(function (global) {
    "use strict";

    function _round(value, digits) {
        const p = Math.pow(10, digits);
        return Math.round(value * p) / p;
    }

    // DMS（deg, min, sec）→ 十進角
    // 符号は deg に持たせる（deg が - の場合、全体が -）
    function dmsToDecimal(deg, min, sec) {
        if (![deg, min, sec].every(Number.isFinite)) return NaN;
        if (min < 0 || sec < 0) return NaN;

        const sign = deg < 0 ? -1 : 1;
        const adeg = Math.abs(deg);
        return sign * (adeg + min / 60 + sec / 3600);
    }

    // 十進角 → DMS（deg, min, sec）
    // secDigits: 秒の丸め桁数
    function decimalToDms(decimal, secDigits) {
        if (!Number.isFinite(decimal)) return null;

        const sign = decimal < 0 ? -1 : 1;
        let x = Math.abs(decimal);

        let deg = Math.trunc(x);
        x = (x - deg) * 60;

        let min = Math.trunc(x);
        let sec = (x - min) * 60;

        const digits = Number.isFinite(secDigits) ? secDigits : 3;
        sec = _round(sec, digits);

        // 丸めで 60 に到達した場合の繰り上げ
        if (sec >= 60) {
            sec = 0;
            min += 1;
        }
        if (min >= 60) {
            min = 0;
            deg += 1;
        }

        deg *= sign;
        return { deg, min, sec };
    }

    global.DmsDecimal = {
        dmsToDecimal,
        decimalToDms,
    };
})(window);
