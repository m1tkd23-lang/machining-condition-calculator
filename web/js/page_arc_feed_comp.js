// web/js/page_arc_feed_comp.js
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

    function setPreview(text) {
        const el = $("vf_from_vc_preview");
        if (el) el.textContent = text || "";
    }

    function setHelixPreview(text) {
        const el = $("helix_inv_preview");
        if (el) el.textContent = text || "";
    }

    // ---- tab state ----
    let currentTab = "vf_direct"; // vf_direct | vf_from_vc

    function setActiveTab(tabName) {
        currentTab = tabName;

        if (window.Numpad?.hide) window.Numpad.hide();

        const tabA = $("tab_vf_direct");
        const tabB = $("tab_vf_from_vc");
        const panelA = $("panel_vf_direct");
        const panelB = $("panel_vf_from_vc");

        if (!tabA || !tabB || !panelA || !panelB) return;

        const isA = tabName === "vf_direct";

        tabA.classList.toggle("active", isA);
        tabB.classList.toggle("active", !isA);
        tabA.setAttribute("aria-selected", isA ? "true" : "false");
        tabB.setAttribute("aria-selected", !isA ? "true" : "false");

        panelA.classList.toggle("hidden", !isA);
        panelB.classList.toggle("hidden", isA);

        setMsg("", false);

        if (!isA) {
            syncVfFromVc(true);
        }
    }

    function onClickTab(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const tab = t.getAttribute("data-tab");
        if (!tab) return;
        setActiveTab(tab);
    }

    // ---- vf from D_tool, Vc, z, fz ----
    function syncVfFromVc(silent) {
        if (currentTab !== "vf_from_vc") return;

        // ★ 工具径は上段の D_tool を使う
        const d = toNumber($("d_tool_mm")?.value);
        const vc = toNumber($("vc_mmin")?.value);
        const z = toNumber($("teeth")?.value);
        const fz = toNumber($("fz_from_vc")?.value);

        const rpm = window.CuttingSpeed?.calcRpmFromVcAndD(vc, d);
        if (rpm == null) {
            setPreview("");
            if (!silent) setMsg("入力値を確認してください（D_tool と Vc は 0 より大きい値）。", true);
            return;
        }

        const vf = window.FeedCalc?.calcVfFromFzZN(fz, z, rpm);
        if (vf == null) {
            setPreview("");
            if (!silent) setMsg("入力値を確認してください（z と fz は 0 より大きい値）。", true);
            return;
        }

        const rpmInt = Math.round(rpm);
        const vfInt = Math.round(vf);

        setValue("rpm", String(rpmInt));
        setValue("vf_cmd", String(vfInt));

        setPreview(`n ≒ ${rpmInt} rpm / vf_cmd ≒ ${vfInt} mm/min`);

        if (!silent) setMsg("vf_cmd（テーブル送り）を計算して反映しました。", false);
    }

    function onCalcVfFromVc() {
        syncVfFromVc(false);
    }

    function onVcInputsChanged() {
        syncVfFromVc(true);
    }

    // ---- helical inverse ----
    function onInvHelix() {
        const d_work = toNumber($("d_work_mm")?.value);
        const d_tool = toNumber($("d_tool_mm")?.value);
        const mode = $("mode")?.value || "ID";

        if (!(d_work > 0 && d_tool > 0)) {
            setHelixPreview("");
            setMsg("逆算：D_work と D_tool を確認してください。", true);
            return;
        }
        if (mode === "ID" && d_work <= d_tool) {
            setHelixPreview("");
            setMsg("逆算：内径（ID）は D_work > D_tool が必要です。", true);
            return;
        }

        const d_path = (mode === "ID") ? (d_work - d_tool) : (d_work + d_tool);
        if (!(d_path > 0)) {
            setHelixPreview("");
            setMsg("逆算：D_path が正になりません。", true);
            return;
        }

        const a = toNumber($("helix_target_deg")?.value);
        const dz = window.ArcFeedComp?.invDzPerRevFromHelixDeg(a, d_path);
        if (dz == null) {
            setHelixPreview("");
            setMsg("逆算：α_target は 0 より大きい値にしてください。", true);
            return;
        }

        setValue("dz_req_mm", String(round(dz, 4)));
        setHelixPreview(`D_path=${round(d_path, 3)}mm で dz ≒ ${round(dz, 4)} mm/rev`);
        setMsg("逆算しました。", false);
    }

    // ---- main calc ----
    function onCalc() {
        const d_work = toNumber($("d_work_mm")?.value);
        const d_tool = toNumber($("d_tool_mm")?.value);
        const mode = $("mode")?.value || "ID";

        const rpm = toNumber($("rpm")?.value);
        const z = toNumber($("teeth")?.value);

        const vf_cmd = toNumber($("vf_cmd")?.value);

        const ae = toNumber($("ae_mm")?.value);
        const dz_per_rev = toNumber($("dz_per_rev_mm")?.value);

        if (!(d_work > 0 && d_tool > 0 && rpm > 0 && z > 0 && vf_cmd > 0)) {
            setMsg("入力値を確認してください（D_work, D_tool, n, z, vf は 0 より大きい値）。", true);
            return;
        }
        if (mode === "ID" && d_work <= d_tool) {
            setMsg("内径（ID）の場合、D_work は D_tool より大きい必要があります。", true);
            return;
        }

        const r = window.ArcFeedComp?.calcArcFeedComp(d_work, d_tool, mode, vf_cmd, rpm, z, ae, dz_per_rev);
        if (!r) {
            setMsg("入力値を確認してください（内径は D_work > D_tool、外形は任意）。", true);
            return;
        }

        setValue("d_path_mm", String(round(r.d_path_mm, 3)));
        setValue("k_arc", String(round(r.k_arc, 4)));
        setValue("vf_surface", String(Math.round(r.vf_surface)));
        setValue("fz_surface", String(round(r.fz_surface, 4)));

        const fz_cmd = window.FeedCalc?.calcFzFromVfZN(vf_cmd, z, rpm);
        setValue("fz_cmd", (fz_cmd != null) ? String(round(fz_cmd, 4)) : "");

        setValue("helix_deg", (r.helix_deg != null) ? String(round(r.helix_deg, 3)) : "");

        if (r.h_eff_mm != null && r.k_thin != null && r.phi_deg != null) {
            setValue("h_eff_mm", String(round(r.h_eff_mm, 4)));
            setValue("k_thin", String(round(r.k_thin, 3)));
            setValue("phi_deg", String(round(r.phi_deg, 2)));
        } else {
            setValue("h_eff_mm", "");
            setValue("k_thin", "");
            setValue("phi_deg", "");
        }

        setMsg("計算しました。", false);
    }

    // ---- wire up ----
    setActiveTab("vf_direct");

    const tabA = $("tab_vf_direct");
    const tabB = $("tab_vf_from_vc");
    if (tabA) tabA.addEventListener("click", onClickTab);
    if (tabB) tabB.addEventListener("click", onClickTab);

    const btnVfFromVc = $("btn_calc_vf_from_vc");
    if (btnVfFromVc) btnVfFromVc.addEventListener("click", onCalcVfFromVc);

    // ★ 自動同期：D_tool変更も効くように追加
    const toolEl = $("d_tool_mm");
    const vcEl = $("vc_mmin");
    const fzEl = $("fz_from_vc");
    const zEl = $("teeth");
    if (toolEl) toolEl.addEventListener("input", onVcInputsChanged);
    if (vcEl) vcEl.addEventListener("input", onVcInputsChanged);
    if (fzEl) fzEl.addEventListener("input", onVcInputsChanged);
    if (zEl) zEl.addEventListener("input", onVcInputsChanged);

    const btn = $("btn_calc");
    if (btn) btn.addEventListener("click", onCalc);

    const btnInv = $("btn_inv_helix");
    if (btnInv) btnInv.addEventListener("click", onInvHelix);
})();
