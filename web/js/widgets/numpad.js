// Simple in-app numpad (shared widget)
// - Attach to inputs with data-numpad="decimal" or "int"
// - Uses readonly inputs to suppress OS keyboard
// - Updates the focused input's value

(function () {
    const NUMPAD_ID = "numpad";
    const BACKDROP_ID = "numpad_backdrop";

    /** @type {HTMLInputElement|null} */
    let activeInput = null;
    let clearOnFirstInput = false;

    function ensureNumpad() {
        if (document.getElementById(NUMPAD_ID)) return;

        // Backdrop
        const backdrop = document.createElement("div");
        backdrop.id = BACKDROP_ID;
        backdrop.className = "numpad-backdrop hidden";
        backdrop.addEventListener("click", () => hideNumpad());
        document.body.appendChild(backdrop);

        // Numpad container
        const pad = document.createElement("div");
        pad.id = NUMPAD_ID;
        pad.className = "numpad hidden";
        pad.innerHTML = `
      <div class="numpad-bar">
        <div class="numpad-title">テンキー入力</div>
        <button type="button" class="numpad-close" data-action="close" aria-label="close">×</button>
      </div>

      <div class="numpad-preview">
        <div class="numpad-preview-label">入力:</div>
        <div class="numpad-preview-value" id="numpad_preview_value">-</div>
      </div>

      <div class="numpad-grid">
        <button type="button" class="key" data-key="7">7</button>
        <button type="button" class="key" data-key="8">8</button>
        <button type="button" class="key" data-key="9">9</button>
        <button type="button" class="key key-fn" data-action="bksp">⌫</button>

        <button type="button" class="key" data-key="4">4</button>
        <button type="button" class="key" data-key="5">5</button>
        <button type="button" class="key" data-key="6">6</button>
        <button type="button" class="key key-fn" data-action="clear">C</button>

        <button type="button" class="key" data-key="1">1</button>
        <button type="button" class="key" data-key="2">2</button>
        <button type="button" class="key" data-key="3">3</button>
        <button type="button" class="key key-fn" data-action="sign">±</button>

        <button type="button" class="key key-wide" data-key="0">0</button>
        <button type="button" class="key key-fn" data-action="dot">.</button>
        <button type="button" class="key key-ok" data-action="ok">OK</button>
      </div>
    `;

        pad.addEventListener("click", (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;

            const action = t.getAttribute("data-action");
            const key = t.getAttribute("data-key");

            if (action) {
                handleAction(action);
                return;
            }
            if (key) {
                handleKey(key);
                return;
            }
        });

        document.body.appendChild(pad);
    }

    function showNumpad(input) {
        ensureNumpad();
        activeInput = input;
        clearOnFirstInput = true;

        const backdrop = document.getElementById(BACKDROP_ID);
        const pad = document.getElementById(NUMPAD_ID);
        if (!backdrop || !pad) return;

        backdrop.classList.remove("hidden");
        pad.classList.remove("hidden");

        updatePreview();
        // Visual focus hint
        document.querySelectorAll("[data-numpad]").forEach((el) => el.classList.remove("numpad-active"));
        input.classList.add("numpad-active");
    }

    function hideNumpad() {
        const backdrop = document.getElementById(BACKDROP_ID);
        const pad = document.getElementById(NUMPAD_ID);
        if (backdrop) backdrop.classList.add("hidden");
        if (pad) pad.classList.add("hidden");

        document.querySelectorAll("[data-numpad]").forEach((el) => el.classList.remove("numpad-active"));
        activeInput = null;
    }

    function updatePreview() {
        const el = document.getElementById("numpad_preview_value");
        if (!el) return;
        el.textContent = activeInput ? (activeInput.value || "0") : "-";
    }

    function getMode() {
        if (!activeInput) return "decimal";
        const mode = activeInput.getAttribute("data-numpad") || "decimal";
        return mode; // "decimal" | "int"
    }


    function handleKey(digit) {
        if (!activeInput) return;

        let v = activeInput.value || "";

        // ★ 最初の入力だけ、既存値をクリア
        if (clearOnFirstInput) {
            v = "";
            clearOnFirstInput = false;
        }

        // 0 の連続入力を自然に
        if (v === "0") v = "";

        v = v + digit;
        activeInput.value = v;
        activeInput.dispatchEvent(new Event("input", { bubbles: true }));
        updatePreview();
    }

    function handleAction(action) {
        if (!activeInput) {
            if (action === "close" || action === "ok") hideNumpad();
            return;
        }

        const mode = getMode();
        let v = activeInput.value || "";

        switch (action) {
            case "bksp": {
                v = v.slice(0, -1);
                if (v === "" || v === "-" || v === "-0") v = "";
                activeInput.value = v;
                activeInput.dispatchEvent(new Event("input", { bubbles: true }));
                updatePreview();
                break;
            }
            case "clear": {
                activeInput.value = "";
                clearOnFirstInput = false; // ★
                activeInput.dispatchEvent(new Event("input", { bubbles: true }));
                updatePreview();
                break;
            }
            case "dot": {
                if (mode === "int") return;

                if (clearOnFirstInput) {
                    v = "";
                    clearOnFirstInput = false;
                }

                if (v === "") v = "0";
                if (!v.includes(".")) {
                    v = v + ".";
                    activeInput.value = v;
                    activeInput.dispatchEvent(new Event("input", { bubbles: true }));
                    updatePreview();
                }
                break;
            }
            case "sign": {
                // allow negative only if min < 0 or min is not set
                const minAttr = activeInput.getAttribute("min");
                const min = minAttr ? Number(minAttr) : null;
                const allowNeg = min === null || !Number.isFinite(min) || min < 0;
                if (!allowNeg) return;

                if (v.startsWith("-")) v = v.slice(1);
                else v = v ? "-" + v : "-";
                activeInput.value = v;
                activeInput.dispatchEvent(new Event("input", { bubbles: true }));
                updatePreview();
                break;
            }
            case "ok":
            case "close": {
                clearOnFirstInput = false; // ★
                hideNumpad();
                break;
            }
            default:
                break;
        }
    }

    function isNumpadTarget(el) {
        return el instanceof HTMLInputElement && el.hasAttribute("data-numpad");
    }

    function init() {
        ensureNumpad();

        // Tap/focus on any input with data-numpad -> show
        document.addEventListener("click", (e) => {
            const t = e.target;
            if (isNumpadTarget(t)) {
                // Suppress OS keyboard: readonly input recommended
                showNumpad(t);
            }
        });

        // Escape closes (for PC)
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") hideNumpad();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
