// web/js/page_edge_contact_length.js
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

    function formatStats(s) {
        return `min ${round(s.min, 3)} / max ${round(s.max, 3)} / avg ${round(s.avg, 3)}`;
    }

    /**
     * HiDPI対応のシンプル折れ線グラフ描画（外部ライブラリなし）
     * - Canvasの「内部解像度」と「表示サイズ」を一致させ、ぼけを防止
     * - 座標系はCSS px基準で扱えるようにする
     */
    function drawLineChart(canvas, xs, ys, title) {
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- HiDPI crisp rendering (fix blur) ---
        const dpr = window.devicePixelRatio || 1;

        // CSS表示サイズを基準に、内部解像度を合わせる
        const rect = canvas.getBoundingClientRect();
        const cssW = Math.max(1, Math.round(rect.width));
        const cssH = Math.max(1, Math.round(rect.height));

        const targetW = Math.round(cssW * dpr);
        const targetH = Math.round(cssH * dpr);

        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
        }

        // 以降の描画は「CSS px」の座標系で書ける
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ここから w/h は CSS px として扱う
        const w = cssW;
        const h = cssH;

        // 念のため（画像系のぼけ対策。折れ線中心なので保険）
        ctx.imageSmoothingEnabled = false;

        // padding
        const padL = 56,
            padR = 14,
            padT = 28,
            padB = 28;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        if (plotW <= 10 || plotH <= 10) return;
        if (!xs || !ys || xs.length !== ys.length || xs.length < 2) return;

        // ranges
        const xmin = xs[0];
        const xmax = xs[xs.length - 1];

        let ymin = Infinity,
            ymax = -Infinity;
        for (const v of ys) {
            if (v < ymin) ymin = v;
            if (v > ymax) ymax = v;
        }
        if (!Number.isFinite(ymin) || !Number.isFinite(ymax)) return;
        if (Math.abs(ymax - ymin) < 1e-9) {
            ymax = ymin + 1; // avoid zero range
        }

        function xToPx(x) {
            return padL + ((x - xmin) / (xmax - xmin)) * plotW;
        }
        function yToPx(y) {
            return padT + (1 - (y - ymin) / (ymax - ymin)) * plotH;
        }

        // clear
        ctx.clearRect(0, 0, w, h);

        // grid lines (light)
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gy = 4;
        for (let i = 0; i <= gy; i++) {
            const y = padT + (plotH * i) / gy;
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
        }
        ctx.stroke();

        // axes
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + plotH);
        ctx.lineTo(padL + plotW, padT + plotH);
        ctx.stroke();

        // title
        ctx.fillStyle = "rgba(245,245,245,0.92)";
        ctx.font = "16px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(title, padL, 20);

        // y labels (min/max)
        ctx.fillStyle = "rgba(245,245,245,0.70)";
        ctx.font =
            '12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        ctx.fillText(`${round(ymax, 3)} mm`, 8, padT + 10);
        ctx.fillText(`${round(ymin, 3)} mm`, 8, padT + plotH);

        // x labels (start/end in rev)
        ctx.fillText(`${round(xmin, 2)} rev`, padL, h - 10);
        const endLabel = `${round(xmax, 2)} rev`;
        const m = ctx.measureText(endLabel);
        ctx.fillText(endLabel, padL + plotW - m.width, h - 10);

        // line (accent-ish)
        ctx.strokeStyle = "rgba(73,216,54,0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < xs.length; i++) {
            const x = xToPx(xs[i]);
            const y = yToPx(ys[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function onCalc() {
        const params = {
            d_mm: toNumber($("d_mm")?.value),
            ae_mm: toNumber($("ae_mm")?.value),
            ap_mm: toNumber($("ap_mm")?.value),
            teeth: toNumber($("teeth")?.value),
            helix_deg: toNumber($("helix_deg")?.value),
            revs: toNumber($("revs")?.value),
            points_per_rev: toNumber($("points_per_rev")?.value),
            z_samples: toNumber($("z_samples")?.value),
        };

        const r = window.EdgeContact?.calcWaveforms(params);
        if (!r) {
            setMsg("入力値を確認してください（D>0, ae>0, ap>0, ae<D, z>=1）。", true);
            return;
        }

        setValue("theta_eng_deg", String(round(r.theta_eng_deg, 2)));
        setValue("stats_tooth", formatStats(r.stats_tooth));
        setValue("stats_total", formatStats(r.stats_total));

        const c1 = $("chart_tooth");
        const c2 = $("chart_total");
        drawLineChart(c1, r.xs_rev, r.y_tooth_mm, "代表1枚の刃：接触刃長 L_tooth(φ)");
        drawLineChart(c2, r.xs_rev, r.y_total_mm, "全刃合計：接触刃長 L_total(φ)");

        setMsg("計算しました。", false);
    }

    // 初期表示：一度描画（canvasのぼけ確認もしやすい）
    function onInit() {
        const btn = $("btn_calc");
        if (btn) btn.addEventListener("click", onCalc);

        // 画面サイズ変更でcanvasのCSS幅が変わるため、再描画が必要
        // （HiDPI対応で内部解像度を都度合わせる）
        window.addEventListener("resize", () => {
            // 計算結果が既にある場合のみ再描画したいが、
            // シンプルに「無条件で再計算」だと入力途中が嫌なので、
            // ここでは何もしない（必要なら後で改善）。
        });
    }

    onInit();
})();
