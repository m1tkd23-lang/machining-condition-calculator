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

    function isNumpadVisible() {
        const el = document.getElementById(NUMPAD_ID);
        if (!el) return false;
        return !el.classList.contains("hidden");
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

    function applyKeyAction({ key, action }) {
        if (!activeInput) return;

        let v = activeInput.value || "";
        const mode = activeInput.getAttribute("data-numpad") || "decimal";

        if (action === "close" || action === "ok") {
            hideNumpad();
            return;
        }

        if (action === "clear") {
            v = "";
            clearOnFirstInput = false;
        }
        else if (action === "bksp") {
            v = v.slice(0, -1);
            clearOnFirstInput = false;
        }
        else if (action === "dot") {
            if (mode === "int") {
                updatePreview();
                return;
            }
            if (clearOnFirstInput) {
                v = "";
                clearOnFirstInput = false;
            }
            if (v.includes(".")) {
                updatePreview();
                return;
            }
            v = v || "0";
            v += ".";
        }
        else if (action === "sign") {
            if (clearOnFirstInput) clearOnFirstInput = false;
            v = v.startsWith("-") ? v.slice(1) : "-" + v;
        }
        else if (key != null) {
            if (clearOnFirstInput) {
                v = "";
                clearOnFirstInput = false;
            }
            if (v === "0") v = "";
            v += String(key);
        }

        activeInput.value = v;
        activeInput.dispatchEvent(new Event("input", { bubbles: true }));
        updatePreview();
    }

    function onPadClick(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !activeInput) return;

        const key = t.dataset.key;
        const action = t.dataset.action;

        if (key != null && key !== "") {
            applyKeyAction({ key, action: null });
            return;
        }
        if (action) {
            applyKeyAction({ key: null, action });
        }
    }

    // --- PC keyboard support (when numpad is open) ---
    function onKeyDown(e) {
        // テンキーが開いている時だけ介入（既存ページのショートカット等を潰さない）
        if (!activeInput || !isNumpadVisible()) return;

        // IME変換中などは無視
        if (e.isComposing) return;

        const k = e.key;

        // 数字（メインキー / テンキー）
        if (k >= "0" && k <= "9") {
            e.preventDefault();
            applyKeyAction({ key: k, action: null });
            return;
        }

        // 小数点：. と , を許可（日本語配列やテンキー環境差対策）
        if (k === "." || k === ",") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "dot" });
            return;
        }

        // バックスペース
        if (k === "Backspace") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "bksp" });
            return;
        }

        // Delete は「クリア」として扱う（好みがあれば変更可）
        if (k === "Delete") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "clear" });
            return;
        }

        // Enter は OK
        if (k === "Enter") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "ok" });
            return;
        }

        // Esc は閉じる
        if (k === "Escape") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "close" });
            return;
        }

        // 符号：- を押したら ± と同じ扱い
        if (k === "-") {
            e.preventDefault();
            applyKeyAction({ key: null, action: "sign" });
            return;
        }
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

    // PCキーボード入力（テンキー含む）
    document.addEventListener("keydown", onKeyDown);

    window.Numpad = { hide: hideNumpad };
})();
