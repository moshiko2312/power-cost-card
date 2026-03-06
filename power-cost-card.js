class PowerCostCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _emitConfig(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _getEntities() {
    return Array.isArray(this._config?.entities) ? [...this._config.entities] : [];
  }

  _saveEntities(entities) {
    const config = { ...(this._config || {}) };
    config.entities = entities.filter((x) => x && x.entity);
    this._config = config;
    this._emitConfig(config);
    this._render();
  }

  _updateTopField(field, rawValue, isBoolean = false, isNumber = false) {
    const config = { ...(this._config || {}) };

    if (isBoolean) {
      config[field] = Boolean(rawValue);
    } else if (isNumber) {
      config[field] = rawValue === "" ? undefined : Number(rawValue);
    } else {
      config[field] = rawValue;
    }

    this._config = config;
    this._emitConfig(config);
  }

  _addEntityRow() {
    const entities = this._getEntities();
    entities.push({
      entity: "",
      name: "",
      power_w: undefined,
      power_entity: undefined,
      price_per_kwh: undefined,
      icon: undefined,
      active_icon_color: undefined,
      allow_minimize: true,
      currency: this._config?.currency || "₪",
    });
    this._config = { ...(this._config || {}), entities };
    this._emitConfig(this._config);
    this._render();
  }

  _removeEntityRow(index) {
    const entities = this._getEntities();
    entities.splice(index, 1);
    this._saveEntities(entities);
  }

  _updateEntityRow(index, key, rawValue) {
    const entities = this._getEntities();

    while (entities.length <= index) {
      entities.push({
        entity: "",
        name: "",
        power_w: undefined,
        power_entity: undefined,
        price_per_kwh: undefined,
        icon: undefined,
        active_icon_color: undefined,
        allow_minimize: true,
        currency: this._config?.currency || "₪",
      });
    }

    const next = { ...(entities[index] || {}) };

    if (["power_w", "price_per_kwh"].includes(key)) {
      next[key] = rawValue === "" ? undefined : Number(rawValue);
    } else if (["allow_minimize"].includes(key)) {
      next[key] = Boolean(rawValue);
    } else {
      next[key] = rawValue === "" ? undefined : rawValue;
    }

    entities[index] = next;
    this._saveEntities(entities);
  }

  _entityOptions(domains) {
    const states = this._hass?.states || {};
    const options = Object.keys(states)
      .filter((entityId) => domains.includes(entityId.split(".")[0]))
      .sort((a, b) => {
        const aName = states[a]?.attributes?.friendly_name || a;
        const bName = states[b]?.attributes?.friendly_name || b;
        return aName.localeCompare(bName, "he");
      });

    return options
      .map((entityId) => {
        const friendly = states[entityId]?.attributes?.friendly_name || entityId;
        return `<option value="${entityId}">${friendly} (${entityId})</option>`;
      })
      .join("");
  }







  _iconButtonLabel(iconValue) {
    return iconValue || "ברירת מחדל של הישות";
  }

  _iconGridOptions(selectedIcon) {
    const states = this._hass?.states || {};
    const seen = new Set();
    const icons = [];

    const addIcon = (icon) => {
      if (!icon || seen.has(icon) || !String(icon).startsWith("mdi:")) return;
      seen.add(icon);
      icons.push(icon);
    };

    Object.values(states).forEach((stateObj) => addIcon(stateObj?.attributes?.icon));

    [
      "mdi:lightbulb",
      "mdi:lightbulb-on",
      "mdi:ceiling-light",
      "mdi:lamp",
      "mdi:power-plug",
      "mdi:power-socket-eu",
      "mdi:radiator",
      "mdi:fan",
      "mdi:air-conditioner",
      "mdi:flash",
      "mdi:fire",
      "mdi:water-boiler",
      "mdi:microwave",
      "mdi:kettle",
      "mdi:television",
      "mdi:desktop-classic",
      "mdi:washing-machine",
      "mdi:dishwasher",
      "mdi:fridge-outline",
      "mdi:oven",
      "mdi:heater",
      "mdi:coffee-maker-outline",
      "mdi:hair-dryer"
    ].forEach(addIcon);

    return icons
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => `
        <button class="icon-option ${selectedIcon === icon ? "selected" : ""}" type="button" data-icon-select="${icon}">
          <ha-icon icon="${icon}"></ha-icon>
          <span class="icon-option-name">${icon.replace("mdi:", "")}</span>
        </button>
      `)
      .join("");
  }


  _colorPresets() {
    return [
      ["", "ברירת מחדל"],
      ["#ffb300", "צהוב חם"],
      ["#ffd54f", "צהוב רך"],
      ["#ff9800", "כתום"],
      ["#ef6c00", "כתום כהה"],
      ["#00c853", "ירוק"],
      ["#00bfa5", "טורקיז"],
      ["#00b0ff", "תכלת"],
      ["#2979ff", "כחול"],
      ["#7c4dff", "סגול"],
      ["#ff4081", "ורוד"],
      ["#ff5252", "אדום"],
      ["white", "לבן"],
    ];
  }

  _colorPresetDots(selectedColor, index) {
    return this._colorPresets()
      .map(([value, label]) => {
        if (!value) {
          return `<button class="color-dot ${selectedColor === value ? "selected" : ""}" type="button" data-color-dot="${index}" data-color-value="" title="${label}" aria-label="${label}" style="background: var(--card-background-color);"></button>`;
        }
        return `<button class="color-dot ${selectedColor === value ? "selected" : ""}" type="button" data-color-dot="${index}" data-color-value="${value}" title="${label}" aria-label="${label}" style="background:${value};"></button>`;
      })
      .join("");
  }

  _render() {
    const config = this._config || {};
    const entities = this._getEntities();
    const mainEntityOptions = this._entityOptions(["light", "switch", "fan", "climate"]);
    const powerEntityOptions = this._entityOptions(["sensor"]);

    this.innerHTML = `
      <style>
        .wrap {
          display: grid;
          gap: 12px;
          padding: 12px 0;
        }
        label {
          display: grid;
          gap: 6px;
          font-size: 14px;
        }
        input, select {
          font: inherit;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          min-width: 0;
        }
        .checks {
          display: grid;
          gap: 8px;
        }
        .checks label {
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.3;
        }
        .checks input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
          flex: 0 0 auto;
        }
        .entity-rows {
          display: grid;
          gap: 12px;
        }
        .entity-row {
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .entity-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .row-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .btn {
          font: inherit;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
        }
        .hint {
          font-size: 12px;
          opacity: 0.75;
          line-height: 1.4;
        }
        .icon-picker {
          position: relative;
        }
        .icon-picker-button {
          width: 100%;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          box-sizing: border-box;
        }
        .icon-picker-button-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .icon-preview {
          width: 34px;
          height: 34px;
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          flex: 0 0 auto;
        }
        .icon-picker-label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .icon-picker-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 20;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          padding: 10px;
          display: none;
        }
        .icon-picker.open .icon-picker-menu {
          display: block;
        }
        .icon-search {
          width: 100%;
          margin-bottom: 8px;
          box-sizing: border-box;
        }
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
          gap: 8px;
          max-height: 220px;
          overflow: auto;
          padding: 2px;
        }
        .icon-option {
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          padding: 8px 6px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          min-height: 72px;
        }
        .icon-option.selected {
          border-color: var(--primary-color);
        }
        .icon-option-name {
          font-size: 11px;
          line-height: 1.2;
          word-break: break-word;
        }
        .icon-picker-hidden-value {
          display: none;
        }
        .color-field-wrap {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          align-items: center;
        }
        .color-presets {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .color-dot {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          border: 2px solid var(--divider-color);
          cursor: pointer;
          padding: 0;
          outline: none;
          box-sizing: border-box;
          background: transparent;
          position: relative;
        }
        .color-dot.selected {
          border-color: var(--primary-color);
          transform: scale(1.08);
        }
        .color-dot.custom {
          background:
            linear-gradient(45deg, #ff5252 0 25%, #ffd54f 25% 50%, #00c853 50% 75%, #2979ff 75% 100%);
        }
      </style>
      <div class="wrap">
        <label>
          <span>כותרת</span>
          <input data-field="title" value="${config.title || ""}">
        </label>

        <label>
          <span>מטבע ברירת מחדל</span>
          <input data-field="currency" value="${config.currency || "₪"}">
        </label>

        <label>
          <span>מחיר ברירת מחדל לקוט"ש</span>
          <input data-field="default_price_per_kwh" type="number" step="0.001" value="${config.default_price_per_kwh ?? ""}">
        </label>

        <label>
          <span>רענון בשניות</span>
          <input data-field="refresh_seconds" type="number" min="10" step="1" value="${config.refresh_seconds ?? 60}">
        </label>

        <div class="checks">
          <label><input data-field="show_period_selector" type="checkbox" ${config.show_period_selector !== false ? "checked" : ""}> בורר תקופה</label>
          <label><input data-field="show_toggle" type="checkbox" ${config.show_toggle !== false ? "checked" : ""}> טוגל הפעלה/כיבוי</label>
          <label><input data-field="show_total" type="checkbox" ${config.show_total !== false ? "checked" : ""}> סיכום כולל</label>
          <label><input data-field="show_details" type="checkbox" ${config.show_details !== false ? "checked" : ""}> טבלת ישויות</label>
          <label><input data-field="show_formula" type="checkbox" ${config.show_formula !== false ? "checked" : ""}> הצג נוסחת חישוב</label>
          <label><input data-field="show_graph" type="checkbox" ${config.show_graph === true ? "checked" : ""}> הצג גרף בכרטיס</label>
          <label><input data-field="show_minimize" type="checkbox" ${config.show_minimize !== false ? "checked" : ""}> אפשר מזעור כרטיסים</label>
          <label><input data-field="enable_icon_animation" type="checkbox" ${config.enable_icon_animation !== false ? "checked" : ""}> אפשר אנימציית אייקון</label>
        </div>

        <div>
          <span>ישויות</span>
          <div class="entity-rows">
            ${entities.map((row, index) => `
              <div class="entity-row">
                <div class="entity-grid">
                  <label>
                    <span>Entity</span>
                    <select data-row-field="entity" data-index="${index}">
                      <option value="">בחר light / switch / fan / climate</option>
                      ${mainEntityOptions}
                    </select>
                  </label>

                  <label>
                    <span>שם להצגה</span>
                    <input data-row-field="name" data-index="${index}" value="${row.name || ""}">
                  </label>

                  <label>
                    <span>אייקון</span>
                    <div class="icon-picker" data-icon-picker data-index="${index}">
                      <input class="icon-picker-hidden-value" data-row-field="icon" data-index="${index}" value="${row.icon || ""}">
                      <button class="icon-picker-button" type="button" data-icon-toggle="${index}">
                        <span class="icon-picker-button-main">
                          <span class="icon-preview">
                            <ha-icon icon="${row.icon || 'mdi:flash'}"></ha-icon>
                          </span>
                          <span class="icon-picker-label">${this._iconButtonLabel(row.icon || "")}</span>
                        </span>
                        <span>▾</span>
                      </button>
                      <div class="icon-picker-menu">
                        <input class="icon-search" type="text" placeholder="חפש אייקון..." data-icon-search="${index}">
                        <div class="icon-grid">
                          <button class="icon-option ${!row.icon ? "selected" : ""}" type="button" data-icon-select="">
                            <ha-icon icon="mdi:flash"></ha-icon>
                            <span class="icon-option-name">ברירת מחדל</span>
                          </button>
                          ${this._iconGridOptions(row.icon || "")}
                        </div>
                      </div>
                    </div>
                  </label>

                  <label>
                    <span>צבע אייקון כשהישות דולקת</span>
                    <div class="color-field-wrap">
                      <div class="color-presets">
                        ${this._colorPresetDots(row.active_icon_color || "", index)}
                        <button class="color-dot custom ${(!this._colorPresets().some(([value]) => value === (row.active_icon_color || "")) && (row.active_icon_color || "")) ? "selected" : ""}" type="button" data-color-dot="${index}" data-color-custom="1" title="צבע מותאם אישית" aria-label="צבע מותאם אישית"></button>
                      </div>
                      <input data-row-field="active_icon_color" data-index="${index}" value="${row.active_icon_color || ""}" placeholder="לדוגמה: #ffb300 או orange">
                    </div>
                  </label>

                  <label>
                    <span>אפשר מזעור לישות</span>
                    <input data-row-field="allow_minimize" data-index="${index}" type="checkbox" ${row.allow_minimize !== false ? "checked" : ""}>
                  </label>

                  <label>
                    <span>Power קבוע ב-W</span>
                    <input data-row-field="power_w" data-index="${index}" type="number" step="0.1" value="${row.power_w ?? ""}">
                  </label>

                  <label>
                    <span>Power entity</span>
                    <select data-row-field="power_entity" data-index="${index}">
                      <option value="">בחר sensor</option>
                      ${powerEntityOptions}
                    </select>
                  </label>

                  <label>
                    <span>מחיר לקוט"ש</span>
                    <input data-row-field="price_per_kwh" data-index="${index}" type="number" step="0.001" value="${row.price_per_kwh ?? ""}">
                  </label>

                  <label>
                    <span>מטבע</span>
                    <input data-row-field="currency" data-index="${index}" value="${row.currency || config.currency || "₪"}">
                  </label>
                </div>

                <div class="row-actions">
                  <div class="hint">בשדה הראשי מוצגים רק light / switch / fan / climate. בשדה power_entity מוצגים רק sensor.</div>
                  <button class="btn" type="button" data-remove-index="${index}">מחק שורה</button>
                </div>
              </div>
            `).join("")}
          </div>
          <div style="margin-top: 10px;">
            <button class="btn" type="button" data-add-entity="1">הוסף ישות</button>
          </div>
        </div>

        <div class="hint">
          כדי לשמור שורה, חייב להיות entity ראשי. אפשר לבחור אייקון מותאם אישית, power_w קבוע או power_entity מסוג sensor.
        </div>
      </div>
    `;

    this.querySelectorAll("[data-field]").forEach((el) => {
      const field = el.dataset.field;
      if (el.type === "checkbox") {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.checked, true, false));
      } else if (["refresh_seconds", "default_price_per_kwh"].includes(field)) {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.value, false, true));
      } else {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.value, false, false));
      }
    });

    this.querySelectorAll("[data-add-entity]").forEach((el) => {
      el.addEventListener("click", () => this._addEntityRow());
    });

    this.querySelectorAll("[data-remove-index]").forEach((el) => {
      el.addEventListener("click", () => this._removeEntityRow(Number(el.dataset.removeIndex)));
    });

    this.querySelectorAll("[data-row-field]").forEach((el) => {
      const index = Number(el.dataset.index);
      const key = el.dataset.rowField;
      const current = entities[index]?.[key];

      if (el.type === "checkbox") {
        el.checked = current !== false;
      } else {
        el.value = current ?? "";
      }

      el.addEventListener("change", (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
        this._updateEntityRow(index, key, value);
      });
    });

    this.querySelectorAll("[data-color-dot]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const index = Number(ev.currentTarget.dataset.colorDot);
        if (ev.currentTarget.dataset.colorCustom === "1") {
          const input = this.querySelector(`[data-row-field="active_icon_color"][data-index="${index}"]`);
          input?.focus();
          input?.select?.();
          return;
        }
        const value = ev.currentTarget.dataset.colorValue || "";
        this._updateEntityRow(index, "active_icon_color", value);
      });
    });

    this.querySelectorAll("[data-icon-toggle]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const picker = el.closest("[data-icon-picker]");
        this.querySelectorAll("[data-icon-picker]").forEach((p) => {
          if (p !== picker) p.classList.remove("open");
        });
        picker?.classList.toggle("open");
      });
    });

    this.querySelectorAll("[data-icon-select]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const picker = el.closest("[data-icon-picker]");
        const index = Number(picker?.dataset.index);
        const value = el.dataset.iconSelect || "";
        this._updateEntityRow(index, "icon", value);
      });
    });

    this.querySelectorAll("[data-icon-search]").forEach((el) => {
      el.addEventListener("input", (ev) => {
        const query = String(ev.target.value || "").toLowerCase().trim();
        const picker = el.closest("[data-icon-picker]");
        picker?.querySelectorAll("[data-icon-select]").forEach((btn) => {
          const val = String(btn.dataset.iconSelect || "").toLowerCase();
          const text = String(btn.textContent || "").toLowerCase();
          btn.style.display = (!query || val.includes(query) || text.includes(query)) ? "" : "none";
        });
      });
    });

    document.addEventListener("click", () => {
      this.querySelectorAll("[data-icon-picker]").forEach((p) => p.classList.remove("open"));
    }, { once: true });
  }
}

class PowerCostCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._historyMap = new Map();
    this._loadingMap = new Map();
    this._errorMap = new Map();
    this._lastFetchKeys = new Map();
    this._period = "day";
    this._interval = null;
    this._expandedGraphs = {};
    this._collapsedCards = {};
    this._boundClick = this._handleClick.bind(this);
    this._boundChange = this._handleChange.bind(this);
  }

  static getConfigElement() {
    return document.createElement("power-cost-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:power-cost-card",
      title: "עלות צריכת חשמל",
      currency: "₪",
      default_price_per_kwh: 0.52,
      refresh_seconds: 60,
      show_period_selector: true,
      show_toggle: true,
      show_total: true,
      show_details: true,
      show_formula: true,
      show_graph: false,
      show_minimize: true,
      enable_icon_animation: true,
      entities: [
        {
          entity: "light.bedroom",
          name: "מנורת חדר",
          power_w: 10,
          price_per_kwh: 0.52,
          active_icon_color: "#ffb300",
          allow_minimize: true,
          currency: "₪",
        },
      ],
    };
  }

  _buildStorageKey(entities) {
    const entityIds = (entities || []).map((x) => x.entity).filter(Boolean).sort().join("|");
    return `power-cost-card:${entityIds}`;
  }

  _loadUiState() {
    try {
      if (!this._storageKey) return;
      const raw = window.localStorage.getItem(this._storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this._collapsedCards = parsed?.collapsedCards || {};
      this._expandedGraphs = parsed?.expandedGraphs || {};
    } catch (err) {
      // ignore storage errors
    }
  }

  _saveUiState() {
    try {
      if (!this._storageKey) return;
      const payload = {
        collapsedCards: this._collapsedCards || {},
        expandedGraphs: this._expandedGraphs || {},
      };
      window.localStorage.setItem(this._storageKey, JSON.stringify(payload));
    } catch (err) {
      // ignore storage errors
    }
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");

    const normalizedEntities = this._normalizeEntities(config);
    if (!normalizedEntities.length) {
      throw new Error("At least one entity is required");
    }

    this._storageKey = this._buildStorageKey(normalizedEntities);
    this._loadUiState();

    const nextEntityIds = new Set(normalizedEntities.map((x) => x.entity));
    this._collapsedCards = Object.fromEntries(
      Object.entries(this._collapsedCards || {}).filter(([entityId]) => nextEntityIds.has(entityId))
    );
    this._expandedGraphs = Object.fromEntries(
      Object.entries(this._expandedGraphs || {}).filter(([entityId]) => nextEntityIds.has(entityId))
    );
    this._saveUiState();

    this._config = {
      title: config.title || "עלות צריכת חשמל",
      currency: config.currency || "₪",
      default_price_per_kwh:
        config.default_price_per_kwh != null ? Number(config.default_price_per_kwh) : undefined,
      refresh_seconds: Math.max(10, Number(config.refresh_seconds || 60)),
      show_period_selector: config.show_period_selector !== false,
      show_toggle: config.show_toggle !== false,
      show_total: config.show_total !== false,
      show_details: config.show_details !== false,
      show_formula: config.show_formula !== false,
      show_graph: config.show_graph === true,
      show_minimize: config.show_minimize !== false,
      enable_icon_animation: config.enable_icon_animation !== false,
      entities: normalizedEntities,
    };

    this._render();
    this._startTimer();
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._boundClick);
    this.shadowRoot.addEventListener("change", this._boundChange);
    this._startTimer();
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._boundClick);
    this.shadowRoot.removeEventListener("change", this._boundChange);
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
  }

  set hass(hass) {
    this._hass = hass;
    this._refreshAllHistory();
    this._render();
  }

  getCardSize() {
    const count = this._config?.entities?.length || 1;
    return Math.max(3, Math.min(8, count + 2));
  }

  _normalizeEntities(config) {
    if (Array.isArray(config.entities) && config.entities.length) {
      return config.entities
        .filter((x) => x && x.entity)
        .map((x) => ({
          entity: x.entity,
          name: x.name || null,
          icon: x.icon || null,
          active_icon_color: x.active_icon_color || null,
          allow_minimize: x.allow_minimize !== false,
          power_w: x.power_w != null && x.power_w !== "" ? Number(x.power_w) : undefined,
          power_entity: x.power_entity || null,
          price_per_kwh:
            x.price_per_kwh != null && x.price_per_kwh !== ""
              ? Number(x.price_per_kwh)
              : undefined,
          currency: x.currency || null,
        }));
    }

    if (config.entity) {
      return [
        {
          entity: config.entity,
          name: config.name || null,
          icon: config.icon || null,
          active_icon_color: config.active_icon_color || null,
          allow_minimize: config.allow_minimize !== false,
          power_w: config.power_w != null ? Number(config.power_w) : undefined,
          power_entity: config.power_entity || null,
          price_per_kwh:
            config.price_per_kwh != null ? Number(config.price_per_kwh) : undefined,
          currency: config.currency || null,
        },
      ];
    }

    return [];
  }

  _startTimer() {
    if (this._interval) clearInterval(this._interval);
    if (!this._config) return;

    this._interval = setInterval(() => {
      this._refreshAllHistory(true);
      this._render();
    }, this._config.refresh_seconds * 1000);
  }

  _handleClick(ev) {
    const period = ev.target?.dataset?.period;
    const moreInfoEntity =
      ev.target?.dataset?.moreInfo || ev.target?.closest?.("[data-more-info]")?.dataset?.moreInfo;

    if (period) {
      this._period = period;
      this._refreshAllHistory(true);
      this._render();
      return;
    }

    const graphToggleEntity = ev.target?.dataset?.graphToggle;
    const collapseToggleEntity = ev.target?.dataset?.collapseToggle;

    if (ev.target?.closest?.("[data-toggle]")) {
      ev.stopPropagation();
      return;
    }

    if (collapseToggleEntity && this._config?.show_minimize) {
      ev.stopPropagation();
      this._collapsedCards[collapseToggleEntity] = !this._collapsedCards[collapseToggleEntity];
      this._saveUiState();
      this._render();
      return;
    }

    if (graphToggleEntity) {
      ev.stopPropagation();
      this._expandedGraphs[graphToggleEntity] = !this._expandedGraphs[graphToggleEntity];
      this._saveUiState();
      this._render();
      return;
    }

    if (moreInfoEntity) {
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: moreInfoEntity },
        })
      );
    }
  }

  _handleChange(ev) {
    const toggleEntity = ev.target?.dataset?.toggle || ev.target?.closest?.("[data-toggle]")?.dataset?.toggle;
    if (!toggleEntity || !this._hass) return;

    const checked = ev.target?.checked ?? false;
    const domain = String(toggleEntity).split(".")[0];
    let service = checked ? "turn_on" : "turn_off";

    if (domain === "fan" || domain === "light" || domain === "switch" || domain === "climate") {
      this._hass.callService(domain, service, { entity_id: toggleEntity });
    } else {
      this._hass.callService("homeassistant", checked ? "turn_on" : "turn_off", { entity_id: toggleEntity });
    }

    ev.stopPropagation();
  }

  _getPeriodStart(period) {
    const now = new Date();
    const d = new Date(now);

    if (period === "month") {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (period === "week") {
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    d.setHours(0, 0, 0, 0);
    return d;
  }

  _periodLabel(period) {
    if (period === "month") return "החודש";
    if (period === "week") return "השבוע";
    return "היום";
  }

  _isOnState(state) {
    return ["on", "playing", "heat", "cool", "fan_only", "dry"].includes(String(state));
  }

  _parseNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  _entityPower(entityCfg) {
    if (entityCfg.power_entity && this._hass?.states?.[entityCfg.power_entity]) {
      const sensorState = this._hass.states[entityCfg.power_entity];
      const parsed = this._parseNumber(sensorState.state);
      if (parsed != null) return parsed;
    }
    return entityCfg.power_w;
  }

  _entityPrice(entityCfg) {
    if (entityCfg.price_per_kwh != null) return entityCfg.price_per_kwh;
    return this._config.default_price_per_kwh;
  }

  _entityCurrency(entityCfg) {
    return entityCfg.currency || this._config.currency || "₪";
  }

  async _refreshAllHistory(force = false) {
    if (!this._hass || !this._config?.entities?.length) return;
    await Promise.all(this._config.entities.map((entityCfg) => this._maybeRefreshHistory(entityCfg, force)));
  }

  async _maybeRefreshHistory(entityCfg, force = false) {
    const entityId = entityCfg.entity;
    if (!entityId || !this._hass) return;
    if (this._loadingMap.get(entityId)) return;

    const stateObj = this._hass.states[entityId];
    const start = this._getPeriodStart(this._period);
    const end = new Date();
    const fetchKey = [
      entityId,
      this._period,
      start.toISOString(),
      end.getHours(),
      end.getMinutes(),
      stateObj?.state || "unknown",
      stateObj?.last_changed || "",
    ].join("|");

    if (!force && this._lastFetchKeys.get(entityId) === fetchKey) return;
    this._lastFetchKeys.set(entityId, fetchKey);

    this._loadingMap.set(entityId, true);
    this._errorMap.delete(entityId);

    try {
      const path =
        `history/period/${encodeURIComponent(start.toISOString())}` +
        `?filter_entity_id=${encodeURIComponent(entityId)}` +
        `&end_time=${encodeURIComponent(end.toISOString())}`;

      const data = await this._hass.callApi("GET", path);
      const rows = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
      this._historyMap.set(entityId, rows);
    } catch (err) {
      this._historyMap.set(entityId, []);
      this._errorMap.set(entityId, err?.message || String(err));
    } finally {
      this._loadingMap.set(entityId, false);
      this._render();
    }
  }

  _calculateOnMs(entityCfg) {
    const entityId = entityCfg.entity;
    const history = [...(this._historyMap.get(entityId) || [])]
      .filter((x) => x && x.last_changed)
      .sort((a, b) => new Date(a.last_changed) - new Date(b.last_changed));

    const stateObj = this._hass?.states?.[entityId];
    const start = this._getPeriodStart(this._period);
    const end = new Date();

    if (!stateObj && history.length === 0) return 0;

    if (history.length === 0) {
      if (stateObj && this._isOnState(stateObj.state)) {
        const from = new Date(stateObj.last_changed);
        return Math.max(0, end - (from > start ? from : start));
      }
      return 0;
    }

    let onMs = 0;
    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const next = history[i + 1];
      const intervalStart = new Date(current.last_changed);
      const effectiveStart = intervalStart > start ? intervalStart : start;
      const intervalEnd = next ? new Date(next.last_changed) : end;

      if (this._isOnState(current.state) && intervalEnd > effectiveStart) {
        onMs += intervalEnd - effectiveStart;
      }
    }

    return onMs;
  }

  _formatDuration(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const remainingMinutesAfterDays = totalMinutes % (60 * 24);
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const minutes = remainingMinutesAfterDays % 60;

    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");

    if (days > 0) {
      return `${days} יום ${h}:${m}`;
    }

    return `${h}:${m}`;
  }

  _formatMoney(value, currency) {
    const v = Number(value).toFixed(2);
    return `<span dir="ltr">${currency} ${v}</span>`;
  }


  _getDisplayIcon(icon, isOn) {
    if (!isOn) return icon;

    const onMap = {
      "mdi:lightbulb": "mdi:lightbulb-on",
      "mdi:ceiling-light": "mdi:ceiling-light",
      "mdi:lamp": "mdi:lamp",
      "mdi:radiator": "mdi:radiator",
      "mdi:fan": "mdi:fan",
      "mdi:power-socket-eu": "mdi:power-plug",
      "mdi:flash": "mdi:flash",
      "mdi:air-conditioner": "mdi:air-conditioner",
    };

    return onMap[icon] || icon;
  }


  _historyIntervals(entityCfg) {
    const entityId = entityCfg.entity;
    const history = [...(this._historyMap.get(entityId) || [])]
      .filter((x) => x && x.last_changed)
      .sort((a, b) => new Date(a.last_changed) - new Date(b.last_changed));
    const start = this._getPeriodStart(this._period);
    const end = new Date();
    const powerW = this._entityPower(entityCfg) || 1;
    const intervals = [];

    if (history.length === 0) {
      const stateObj = this._hass?.states?.[entityId];
      if (stateObj && this._isOnState(stateObj.state)) {
        const from = new Date(stateObj.last_changed);
        intervals.push({
          start: from > start ? from : start,
          end,
          value: powerW,
        });
      }
      return intervals;
    }

    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const next = history[i + 1];
      const intervalStart = new Date(current.last_changed);
      const effectiveStart = intervalStart > start ? intervalStart : start;
      const intervalEnd = next ? new Date(next.last_changed) : end;

      if (this._isOnState(current.state) && intervalEnd > effectiveStart) {
        intervals.push({
          start: effectiveStart,
          end: intervalEnd,
          value: powerW,
        });
      }
    }

    return intervals;
  }

  _buildGraphSeries(entityCfg, points = 18) {
    const start = this._getPeriodStart(this._period);
    const end = new Date();
    const totalMs = Math.max(1, end - start);
    const bucketMs = totalMs / points;
    const intervals = this._historyIntervals(entityCfg);
    const values = new Array(points).fill(0);

    for (let i = 0; i < points; i++) {
      const bucketStart = new Date(start.getTime() + i * bucketMs);
      const bucketEnd = new Date(start.getTime() + (i + 1) * bucketMs);
      let v = 0;

      intervals.forEach((it) => {
        const overlap = Math.max(0, Math.min(bucketEnd, it.end) - Math.max(bucketStart, it.start));
        if (overlap > 0) {
          v += (overlap / bucketMs) * it.value;
        }
      });

      values[i] = Number(v.toFixed(4));
    }

    const max = Math.max(...values, 0);
    return {
      values,
      max,
    };
  }


  _renderGraphToggle(entityId) {
    const expanded = !!this._expandedGraphs[entityId];
    const buttonLabel = expanded ? "הסתר גרף" : "הצג גרף";
    return `<button class="graph-toggle-btn" data-graph-toggle="${entityId}">${buttonLabel}</button>`;
  }

  _renderPremiumGraph(entityCfg) {
    const entityId = entityCfg.entity;
    const expanded = !!this._expandedGraphs[entityId];
    const buttonLabel = expanded ? "הסתר גרף" : "הצג גרף";

    if (!expanded) {
      return "";
    }

    const { values, max } = this._buildGraphSeries(entityCfg, 18);
    const width = 460;
    const height = 118;
    const padX = 10;
    const topPad = 14;
    const bottomPad = 20;
    const usableH = height - topPad - bottomPad;
    const usableW = width - padX * 2;
    const denom = max > 0 ? max : 1;
    const pts = values.map((v, i) => {
      const x = padX + (usableW * i / Math.max(1, values.length - 1));
      const y = topPad + (usableH - ((v / denom) * usableH));
      return [x, y];
    });

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
    const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(2)} ${(height - bottomPad).toFixed(2)} L ${pts[0][0].toFixed(2)} ${(height - bottomPad).toFixed(2)} Z`;
    const depthPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${(p[0] + 4).toFixed(2)} ${(p[1] + 8).toFixed(2)}`).join(" ") +
      ` L ${(pts[pts.length - 1][0] + 4).toFixed(2)} ${(height - bottomPad + 8).toFixed(2)} L ${(pts[0][0] + 4).toFixed(2)} ${(height - bottomPad + 8).toFixed(2)} Z`;
    const safeId = entityId.replace(/[^a-zA-Z0-9_-]/g, "-");

    return `
      <div class="graph-box">
        <svg class="premium-graph" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="graph ${safeId}">
          <defs>
            <linearGradient id="graphFill-${safeId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,183,0,0.92)"/>
              <stop offset="60%" stop-color="rgba(255,183,0,0.24)"/>
              <stop offset="100%" stop-color="rgba(255,183,0,0.03)"/>
            </linearGradient>
            <linearGradient id="graphDepth-${safeId}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="rgba(255,145,0,0.30)"/>
              <stop offset="100%" stop-color="rgba(255,145,0,0.02)"/>
            </linearGradient>
            <filter id="graphGlow-${safeId}" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <path d="${depthPath}" fill="url(#graphDepth-${safeId})"></path>
          <path d="${areaPath}" fill="url(#graphFill-${safeId})"></path>
          <path d="${linePath}" fill="none" stroke="rgba(255,210,110,0.98)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#graphGlow-${safeId})"></path>

          ${pts.map((p, i) => `
            <circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${i === pts.length - 1 ? 4.5 : 2.8}" fill="rgba(255,227,160,0.95)"></circle>
          `).join("")}
        </svg>
      </div>
    `;
  }

  _computeRow(entityCfg) {
    const entityId = entityCfg.entity;
    const stateObj = this._hass?.states?.[entityId];
    const onMs = this._calculateOnMs(entityCfg);
    const onHours = onMs / 3600000;
    const powerW = this._entityPower(entityCfg);
    const pricePerKwh = this._entityPrice(entityCfg);
    const currency = this._entityCurrency(entityCfg);
    const energyKwh = powerW != null ? (powerW / 1000) * onHours : 0;
    const cost = pricePerKwh != null ? energyKwh * pricePerKwh : 0;
    const name = entityCfg.name || stateObj?.attributes?.friendly_name || entityId;
    const icon = entityCfg.icon || stateObj?.attributes?.icon || "mdi:flash";
    const state = stateObj?.state || "unknown";
    const isOn = this._isOnState(state);
    const activeIconColor = entityCfg.active_icon_color || "var(--warning-color)";
    const displayIcon = this._getDisplayIcon(icon, isOn);
    const error = this._errorMap.get(entityId) || "";
    const isDynamicPower = Boolean(entityCfg.power_entity);
    const allowMinimize = entityCfg.allow_minimize !== false;

    return {
      entityId,
      name,
      icon,
      state,
      isOn,
      activeIconColor,
      displayIcon,
      onMs,
      onHours,
      energyKwh,
      cost,
      currency,
      powerW,
      pricePerKwh,
      error,
      isDynamicPower,
      allowMinimize,
    };
  }


  _iconOptions() {
    const states = this._hass?.states || {};
    const seen = new Set();
    const icons = [];

    const addIcon = (icon) => {
      if (!icon || seen.has(icon)) return;
      seen.add(icon);
      icons.push(icon);
    };

    Object.values(states).forEach((stateObj) => addIcon(stateObj?.attributes?.icon));

    [
      "mdi:lightbulb",
      "mdi:lightbulb-on",
      "mdi:ceiling-light",
      "mdi:lamp",
      "mdi:power-plug",
      "mdi:power-socket-eu",
      "mdi:radiator",
      "mdi:fan",
      "mdi:air-conditioner",
      "mdi:flash",
      "mdi:fire",
      "mdi:water-boiler",
      "mdi:microwave",
      "mdi:kettle",
      "mdi:television",
      "mdi:desktop-classic",
      "mdi:washing-machine",
      "mdi:dishwasher",
      "mdi:fridge-outline",
      "mdi:oven",
      "mdi:heater",
      "mdi:coffee-maker-outline",
      "mdi:hair-dryer",
    ].forEach(addIcon);

    return icons
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => `<option value="${icon}"></option>`)
      .join("");
  }

  _render() {
    if (!this._config) return;

    const rows = this._config.entities.map((entityCfg) => this._computeRow(entityCfg));
    const totalEnergy = rows.reduce((sum, row) => sum + row.energyKwh, 0);
    const currency = rows[0]?.currency || this._config.currency || "₪";
    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    const anyDynamic = rows.some((row) => row.isDynamicPower);
    const mostExpensive = rows.length ? rows.reduce((a,b)=> b.cost>a.cost?b:a) : null;
    const top3 = [...rows].sort((a,b)=>b.cost-a.cost).slice(0,3);
    const anyError = rows.some((row) => row.error);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          direction: rtl;
          --pcc-radius: 18px;
          --pcc-gap: 12px;
        }

        ha-card {
          overflow: hidden;
        }

        .wrap {
          padding: 16px;
        }

        .head {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 14px;
          text-align: center;
        }

        .title {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
        }

        .periods {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 14px;
        }

        .period-btn {
          border: 1px solid color-mix(in srgb, var(--primary-text-color) 22%, transparent);
          background: color-mix(in srgb, var(--card-background-color) 70%, transparent);
          color: var(--primary-text-color);
          border-radius: 999px;
          padding: 10px 18px;
          cursor: pointer;
          font: inherit;
          font-weight: 600;
          min-width: 110px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .period-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.16);
          border-color: color-mix(in srgb, var(--primary-text-color) 35%, transparent);
        }

        .period-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0,0,0,0.14);
        }

        .period-btn.active {
          background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 92%, white 8%), color-mix(in srgb, var(--primary-color) 78%, black 22%));
          color: var(--text-primary-color, white);
          border-color: transparent;
          box-shadow: 0 10px 24px color-mix(in srgb, var(--primary-color) 32%, transparent);
        }

        .toggle-switch-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-switch {
          --control-switch-checked-color: var(--primary-color);
          --switch-checked-button-color: var(--primary-color);
          --switch-checked-track-color: color-mix(in srgb, var(--primary-color) 35%, transparent);
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--pcc-gap);
          margin-bottom: 14px;
        }

        .box {
          background: transparent;
          border: 1px solid var(--divider-color);
          border-radius: var(--pcc-radius);
          padding: 14px;
        }

        .label {
          font-size: 12px;
          opacity: 0.72;
          margin-bottom: 6px;
        }

        .value {
          font-size: 22px;
          font-weight: 700;
          line-height: 1.2;
        }

        .sub {
          font-size: 12px;
          opacity: 0.75;
          margin-top: 6px;
        }

        
        .top-devices-title {
          text-align:center;
          font-weight:700;
          font-size:16px;
          margin:16px 0 8px;
        }

        .top-devices{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:10px;
          margin-bottom:14px;
        }

        .top-device-card{
          border:1px solid var(--divider-color);
          border-radius:10px;
          padding:10px;
          text-align:center;
          background:transparent;
        }

        .rows {
          display: grid;
          gap: var(--pcc-gap);
        }

        .row {
          border: 1px solid var(--divider-color);
          border-radius: var(--pcc-radius);
          padding: 14px;
          display: grid;
          gap: 12px;
        }

        .row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .row-title {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          cursor: pointer;
        }

        @keyframes powerCostIconPulse {
          0% {
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.35));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0));
          }
        }

        .entity-icon {
          transition: color 160ms ease, transform 160ms ease, opacity 160ms ease, filter 160ms ease;
          transform-origin: center;
        }

        .entity-icon.on {
          animation: powerCostIconPulse 2.2s ease-in-out infinite;
        }

        .name-wrap {
          min-width: 0;
        }

        .name {
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .state {
          font-size: 12px;
          opacity: 0.72;
          margin-top: 3px;
        }

        .state.on {
          color: var(--success-color);
          opacity: 1;
          font-weight: 700;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .metric {
          background: transparent;
          border: 1px solid var(--divider-color);
          border-radius: 14px;
          padding: 10px;
        }

        .metric .v {
          font-size: 18px;
          font-weight: 700;
        }

        .bottom-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 12px;
          align-items: stretch;
        }

        .graph-box {
          border: 1px solid var(--divider-color);
          border-radius: 18px;
          padding: 12px 14px 10px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(0,0,0,0.04));
          overflow: hidden;
        }

        .graph-box-collapsed {
          align-items: center;
        }

        .graph-toggle-btn {
          border: 1px solid var(--divider-color);
          background: transparent;
          color: var(--primary-text-color);
          border-radius: 999px;
          padding: 7px 12px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
        }

        .collapse-btn {
          border: 1px solid var(--divider-color);
          background: transparent;
          color: var(--primary-text-color);
          border-radius: 999px;
          padding: 7px 12px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          min-width: 78px;
        }

        .row-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .row.collapsed {
          padding: 12px 14px;
        }

        .row.collapsed .row-top {
          margin: 0;
        }

        .row.collapsed .row-title {
          min-height: 36px;
        }

        .premium-graph {
          width: 100%;
          height: 108px;
          display: block;
        }

        .metric-cost {
          width: 220px;
          justify-self: end;
        }

        .sub-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .warn,
        .error,
        .footer {
          font-size: 12px;
          line-height: 1.5;
        }

        .warn {
          margin-top: 12px;
          color: var(--warning-color);
        }

        .error {
          color: var(--error-color);
        }

        .footer {
          margin-top: 12px;
          opacity: 0.78;
        }
      </style>

      <ha-card>
        <div class="wrap">
          <div class="head">
            <div class="title">${this._config.title}</div>
          </div>

          ${this._config.show_period_selector ? `
            <div class="periods">
              <button class="period-btn ${this._period === "day" ? "active" : ""}" data-period="day">היום</button>
              <button class="period-btn ${this._period === "week" ? "active" : ""}" data-period="week">השבוע</button>
              <button class="period-btn ${this._period === "month" ? "active" : ""}" data-period="month">החודש</button>
            </div>
          ` : ""}

          ${this._config.show_total ? `
            <div class="summary">
              <div class="box">
                <div class="label">עלות כוללת ${this._periodLabel(this._period)}</div>
                <div class="value">${this._formatMoney(totalCost, currency)}</div>
                <div class="sub">${rows.length} ישויות בכרטיס</div>
              </div>
              <div class="box">
                <div class="label">צריכה כוללת</div>
                <div class="value">kWh ${totalEnergy.toFixed(3)}</div>
                <div class="sub">חישוב לפי זמן פעילות והספק</div>
              </div>
            </div>
          ` : ""}

          ${top3.length ? `
            <div class="top-devices-title">המכשירים הכי בזבזניים</div>
            <div class="top-devices" style="grid-template-columns: repeat(${Math.min(top3.length, 3)}, minmax(0, 1fr));">
              ${top3.map((d)=>`
                <div class="top-device-card">
                  <div class="name">${d.name}</div>
                  <div class="v">kWh ${d.energyKwh.toFixed(3)}</div>
                  <div class="v">${this._formatMoney(d.cost, d.currency)}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${this._config.show_details ? `
            <div class="rows">
              ${rows.map((row) => `
                <div class="row ${this._config.show_minimize && row.allowMinimize && this._collapsedCards[row.entityId] ? "collapsed" : ""}">
                  <div class="row-top">
                    <div class="row-title" data-more-info="${row.entityId}" title="פתח מידע נוסף">
                      <ha-icon
                        class="entity-icon ${row.isOn && this._config.enable_icon_animation ? "on" : ""}"
                        icon="${row.displayIcon}"
                        style="${row.isOn ? `color: ${row.activeIconColor};` : ""}"
                      ></ha-icon>
                      <div class="name-wrap">
                        <div class="name">${row.name}</div>
                      </div>
                    </div>
                    <div class="row-controls">
                      ${this._config.show_minimize && row.allowMinimize ? `
                        <button class="collapse-btn" data-collapse-toggle="${row.entityId}">
                          ${this._collapsedCards[row.entityId] ? "הצג" : "מזער"}
                        </button>
                      ` : ""}
                      ${this._config.show_toggle ? `
                        <div class="toggle-switch-wrap">
                          <ha-switch
                            class="toggle-switch"
                            data-toggle="${row.entityId}"
                            aria-label="toggle ${row.name}"
                            ${row.isOn ? "checked" : ""}
                          ></ha-switch>
                        </div>
                      ` : ""}
                    </div>
                  </div>

                  ${this._config.show_minimize && row.allowMinimize && this._collapsedCards[row.entityId] ? "" : `
                    <div class="metrics">
                      <div class="metric">
                        <div class="label">זמן פעיל ${this._periodLabel(this._period)}</div>
                        <div class="v">${this._formatDuration(row.onMs)}</div>
                      </div>
                      <div class="metric">
                        <div class="label">הספק לחישוב</div>
                        <div class="v">${row.powerW != null ? `${row.powerW}W` : "—"}</div>
                      </div>
                      <div class="metric">
                        <div class="label">צריכה</div>
                        <div class="v">kWh ${row.energyKwh.toFixed(3)}</div>
                      </div>
                    </div>

                    ${this._config.show_graph && this._expandedGraphs[row.entityId] ? `
                      <div class="bottom-row">
                        <div class="metric">
                          <div class="label">עלות</div>
                          <div class="v">${this._formatMoney(row.cost, row.currency)}</div>
                        </div>
                        ${this._renderPremiumGraph(this._config.entities.find((x) => x.entity === row.entityId) || { entity: row.entityId })}
                      </div>
                    ` : `
                      <div class="metric metric-cost">
                        <div class="label">עלות</div>
                        <div class="v">${this._formatMoney(row.cost, row.currency)}</div>
                      </div>
                    `}

                    <div class="sub sub-row">
                      <span>
                        מחיר לקוט"ש: ${row.pricePerKwh != null ? row.pricePerKwh : "—"}
                        ${row.isDynamicPower ? ` • מבוסס כרגע על ${this._config.entities.find((x) => x.entity === row.entityId)?.power_entity}` : ""}
                      </span>
                      ${this._config.show_graph ? this._renderGraphToggle(row.entityId) : ""}
                    </div>

                    ${row.error ? `<div class="error">שגיאה בטעינת היסטוריה: ${row.error}</div>` : ""}
                  `}
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${anyDynamic ? `
            <div class="warn">
              ישויות עם power_entity מחושבות לפי ערך ההספק הנוכחי בזמן התצוגה. זה נוח, אבל פחות מדויק אם ההספק השתנה לאורך התקופה.
            </div>
          ` : ""}

          ${anyError ? `
            <div class="warn">
              אם אין היסטוריה לישות מסוימת, ודא שהיא נרשמת ב-recorder ושיש לה נתוני history זמינים.
            </div>
          ` : ""}

          ${this._config.show_formula ? `
            <div class="footer">
              נוסחה: זמן פעילות × הספק בוואט ÷ 1000 × מחיר לקוט"ש. הכרטיס מחשב לפי מצב פעיל של הישות בתקופה שנבחרה.
            </div>
          ` : ""}
        </div>
      </ha-card>
    `;
  }
}

customElements.define("power-cost-card", PowerCostCard);
customElements.define("power-cost-card-editor", PowerCostCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "power-cost-card",
  name: "Power Cost Card",
  description: "חשב זמן פעילות, צריכה ועלות לישות אחת או כמה ישויות",
  preview: true,
});
