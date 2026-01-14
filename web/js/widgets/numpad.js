// web/js/widgets/numpad.js
(function () {
    const NUMPAD_ID = "numpad";
    const BACKDROP_ID = "numpad_backdrop";

    let activeInput = null;
    let clearOnFirstInput = false;

    function ensureNumpad() {
        if (document.getElementById(NUMPAD_ID)) return;

        const backdrop = document.createElement("div");
        backdrop.id = BACKDROP_ID;
        backdrop.className = "numpad-backdrop hidden";
        backdrop.addEventListener("click", hideNumpad);
        document.body.appendChild(backdrop);

        const pad = document.createElement("div");
        pad.id = NUMPAD_ID;
        pad.className = "numpad hidden";
        pad.innerHTML = `
          <div class="numpad-bar">
            <div class="numpad-title">テンキー入力</div>
            <button type="button" class="numpad-close" data-action="close">×</button>
          </div>
          <div class="numpad-preview">
            <div class="numpad-preview-label">入力:</div>
            <div class="numpad-preview-value" id="numpad_preview_value">-</div>
          </div>
          <div class="numpad-grid">
            ${[7, 8, 9].map(n => `<button class="key" data-key="${n}">${n}</button>`).join("")}
            <button class="key key-fn" data-action="bksp">⌫</button>
            ${[4, 5, 6].map(n => `<button class="key" data-key="${n}">${n}</button>`).join("")}
            <button class="key key-fn" data-action="clear">C</button>
            ${[1, 2, 3].map(n => `<button class="key" data-key="${n}">${n}</button>`).join("")}
            <button class="key key-fn" data-action="sign">±</button>
            <button class="key key-wide" data-key="0">0</button>
            <button class="key key-fn" data-action="dot">.</button>
            <button class="key key-ok" data-action="ok">OK</button>
          </div>
        `;

        pad.addEventListener("click", onPadClick);
        document.body.appendChild(pad);
    }

    function showNumpad(input) {
        ensureNumpad();
        activeInput = input;
        clearOnFirstInput = true;

        document.getElementById(NUMPAD_ID)?.classList.remove("hidden");
        document.getElementById(BACKDROP_ID)?.classList.remove("hidden");

        document.querySelectorAll(".numpad-active").forEach(e => e.classList.remove("numpad-active"));
        input.classList.add("numpad-active");

        updatePreview();
    }

    function hideNumpad() {
        document.getElementById(NUMPAD_ID)?.classList.add("hidden");
        document.getElementById(BACKDROP_ID)?.classList.add("hidden");
        document.querySelectorAll(".numpad-active").forEach(e => e.classList.remove("numpad-active"));
        activeInput = null;
    }

    function updatePreview() {
        const el = document.getElementById("numpad_preview_value");
        if (el) el.textContent = activeInput?.value || "0";
    }

    function onPadClick(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !activeInput) return;

        const key = t.dataset.key;
        const action = t.dataset.action;
        let v = activeInput.value || "";

        // 入力モード（int/decimal）
        const mode = activeInput.getAttribute("data-numpad") || "decimal";

        if (action === "close" || action === "ok") return hideNumpad();

        if (action === "clear") {
            v = "";
            clearOnFirstInput = false;
        }
        else if (action === "bksp") {
            v = v.slice(0, -1);
            clearOnFirstInput = false;
        }
        else if (action === "dot") {
            // ★ int では小数点は入れない
            if (mode === "int") {
                updatePreview();
                return;
            }

            // ★ 最初の入力で . を押したら置き換え開始（他のキーと同じ挙動）
            if (clearOnFirstInput) {
                v = "";
                clearOnFirstInput = false;
            }

            // ★ 2個目の . を絶対に入れない（MRRのクリア原因）
            if (v.includes(".")) {
                updatePreview();
                return;
            }

            v = v || "0";
            v += ".";
        }
        else if (action === "sign") {
            if (clearOnFirstInput) {
                // 符号反転を最初に押した場合も「入力開始」として扱う
                clearOnFirstInput = false;
            }
            v = v.startsWith("-") ? v.slice(1) : "-" + v;
        }
        else if (key) {
            if (clearOnFirstInput) {
                v = "";
                clearOnFirstInput = false;
            }
            if (v === "0") v = "";
            v += key;
        }

        activeInput.value = v;
        activeInput.dispatchEvent(new Event("input", { bubbles: true }));
        updatePreview();
    }

    // フォーカスが入った input のみでテンキーを開く
    document.addEventListener("focusin", (e) => {
        const t = e.target;
        if (t instanceof HTMLInputElement && t.hasAttribute("data-numpad")) {
            showNumpad(t);
        }
    });

    // モバイル向け：input タップ時に確実に focus させる
    document.addEventListener("click", (e) => {
        const input = e.target.closest("input[data-numpad]");
        if (input instanceof HTMLInputElement) {
            input.focus();
        }
    });

    window.Numpad = { hide: hideNumpad };
})();
