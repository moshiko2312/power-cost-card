function normalizePowerCostIcon(rawIcon) {
  if (rawIcon == null) return "";
  const readValue = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      const direct = value.value ?? value.icon ?? value.name ?? "";
      if (direct && typeof direct !== "object") return String(direct);
      return "";
    }
    return "";
  };

  let icon = readValue(rawIcon).trim();
  if (!icon) return "";

  // Align "mdi-lightbulb" style with HA expected "mdi:lightbulb".
  if (/^mdi[-_]/i.test(icon)) {
    icon = `mdi:${icon.slice(4)}`;
  }

  return icon.trim().replace(/\s+/g, "").replace(/["'`<>]/g, "").toLowerCase();
}

function isPowerCostIconId(icon) {
  const v = String(icon || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/.test(v);
}

function isPowerCostEntityId(value) {
  return /^[a-z0-9_]+\.[a-z0-9_]+$/i.test(String(value || "").trim());
}

function normalizePowerCostEntityId(rawEntity) {
  const normalizeText = (value) => {
    const text = String(value ?? "").trim();
    if (!text) return null;
    if (isPowerCostEntityId(text)) return text.toLowerCase();

    const match = text.match(/[a-z0-9_]+\.[a-z0-9_]+/i);
    if (match?.[0]) return match[0].toLowerCase();
    return text;
  };

  if (rawEntity == null) return null;
  if (typeof rawEntity === "string" || typeof rawEntity === "number") {
    return normalizeText(rawEntity);
  }
  if (typeof rawEntity === "object") {
    const fields = [
      rawEntity.entity_id,
      rawEntity.entityId,
      rawEntity.entity,
      rawEntity.id,
      rawEntity.value,
      rawEntity.name,
      rawEntity.label,
    ];
    const normalized = fields
      .map((v) => (typeof v === "string" || typeof v === "number" ? normalizeText(v) : null))
      .filter(Boolean);
    const exact = normalized.find((v) => isPowerCostEntityId(v));
    if (exact) return exact.toLowerCase();
    if (normalized[0]) return normalized[0];
    const fallback = normalizeText(rawEntity.toString?.());
    if (fallback) {
      return fallback;
    }
  }
  return null;
}

function hasPowerCostPhaseEntities(cfg) {
  if (!cfg) return false;
  return Boolean(
    normalizePowerCostEntityId(cfg.phase_1_entity) ||
    normalizePowerCostEntityId(cfg.phase_2_entity) ||
    normalizePowerCostEntityId(cfg.phase_3_entity)
  );
}

const POWER_COST_I18N = {
  he: {
    default_title: "עלות צריכת חשמל",
    period_day: "היום",
    period_week: "השבוע",
    period_month: "החודש",
    graph_show: "הצג גרף",
    graph_hide: "הסתר גרף",
    summary_total_cost: "עלות כוללת {period}",
    summary_total_consumption: "צריכה כוללת",
    summary_calc_sub: "חישוב לפי זמן פעילות והספק",
    summary_entities_priced: "{count} ישויות בתמחור",
    top_devices_title: "המכשירים הכי בזבזניים",
    tooltip_more_info: "פתח מידע נוסף",
    tooltip_info: "מידע",
    btn_open: "פתח",
    btn_close: "סגור",
    btn_show: "הצג",
    btn_minimize: "מזער",
    label_active_time: "זמן פעיל {period}",
    label_power_for_calc: "הספק לחישוב",
    label_consumption: "צריכה",
    label_cost: "עלות",
    phase_total_consumption: "צריכה כללית",
    dynamic_based_on: "מבוסס כרגע על {entity}",
    duration_day_singular: "יום",
    duration_day_plural: "ימים",
    row_default_panel: "לוח תלת פאזי",
    row_default_three_phase: "ישות תלת פאזית",
    row_default_entity: "ישות",
    error_history: "שגיאה בטעינת היסטוריה: {error}",
    warn_dynamic_power:
      "ישויות עם power_entity מחושבות לפי ערך ההספק הנוכחי בזמן התצוגה. זה נוח, אבל פחות מדויק אם ההספק השתנה לאורך התקופה.",
    warn_no_history:
      "אם אין היסטוריה לישות מסוימת, ודא שהיא נרשמת ב-recorder ושיש לה נתוני history זמינים.",
    formula_text:
      "נוסחה: זמן פעילות × הספק בוואט ÷ 1000 × מחיר לקוט\"ש. הכרטיס מחשב לפי מצב פעיל של הישות בתקופה שנבחרה.",
  },
  en: {
    default_title: "Power Consumption Cost",
    period_day: "Today",
    period_week: "This week",
    period_month: "This month",
    graph_show: "Show Graph",
    graph_hide: "Hide Graph",
    summary_total_cost: "Total Cost {period}",
    summary_total_consumption: "Total Consumption",
    summary_calc_sub: "Calculated by active time and power",
    summary_entities_priced: "{count} priced entities",
    top_devices_title: "Top Energy Consumers",
    tooltip_more_info: "Open more info",
    tooltip_info: "Info",
    btn_open: "Open",
    btn_close: "Close",
    btn_show: "Show",
    btn_minimize: "Minimize",
    label_active_time: "Active Time {period}",
    label_power_for_calc: "Power for Calculation",
    label_consumption: "Consumption",
    label_cost: "Cost",
    phase_total_consumption: "Total Consumption",
    dynamic_based_on: "Currently based on {entity}",
    duration_day_singular: "day",
    duration_day_plural: "days",
    row_default_panel: "3-phase panel",
    row_default_three_phase: "3-phase entity",
    row_default_entity: "Entity",
    error_history: "History load error: {error}",
    warn_dynamic_power:
      "Entities with power_entity are calculated using current power at render time. This is convenient, but less accurate if power changed during the selected period.",
    warn_no_history:
      "If an entity has no history, verify recorder includes it and history data is available.",
    formula_text:
      "Formula: active time × power in watts ÷ 1000 × price per kWh. The card calculates by entity active state during the selected period.",
  },
  ru: {
    default_title: "Стоимость потребления электроэнергии",
    period_day: "Сегодня",
    period_week: "На этой неделе",
    period_month: "В этом месяце",
    graph_show: "Показать график",
    graph_hide: "Скрыть график",
    summary_total_cost: "Общая стоимость {period}",
    summary_total_consumption: "Общее потребление",
    summary_calc_sub: "Расчет по времени работы и мощности",
    summary_entities_priced: "{count} сущностей с тарифом",
    top_devices_title: "Самые энергозатратные устройства",
    tooltip_more_info: "Открыть подробности",
    tooltip_info: "Информация",
    btn_open: "Открыть",
    btn_close: "Закрыть",
    btn_show: "Показать",
    btn_minimize: "Свернуть",
    label_active_time: "Время работы {period}",
    label_power_for_calc: "Мощность для расчета",
    label_consumption: "Потребление",
    label_cost: "Стоимость",
    phase_total_consumption: "Общее потребление",
    dynamic_based_on: "Сейчас основано на {entity}",
    duration_day_singular: "день",
    duration_day_plural: "дней",
    row_default_panel: "3-фазный щит",
    row_default_three_phase: "3-фазная сущность",
    row_default_entity: "Сущность",
    error_history: "Ошибка загрузки истории: {error}",
    warn_dynamic_power:
      "Сущности с power_entity рассчитываются по текущей мощности на момент отображения. Это удобно, но менее точно, если мощность менялась в выбранном периоде.",
    warn_no_history:
      "Если для сущности нет истории, убедитесь, что recorder ее записывает и история доступна.",
    formula_text:
      "Формула: время работы × мощность в ваттах ÷ 1000 × цена за кВт·ч. Карточка считает по активному состоянию сущности за выбранный период.",
  },
};

function normalizePowerCostLanguage(value) {
  const v = String(value || "he").toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("ru")) return "ru";
  return "he";
}

function powerCostTranslate(lang, key, vars = {}) {
  const safeLang = normalizePowerCostLanguage(lang);
  const template =
    POWER_COST_I18N[safeLang]?.[key] ??
    POWER_COST_I18N.he?.[key] ??
    String(key || "");

  return String(template).replace(/\{([a-z0-9_]+)\}/gi, (_, varKey) => {
    const v = vars?.[varKey];
    return v == null ? "" : String(v);
  });
}

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
    const shouldRender = !this._hass;
    this._hass = hass;
    if (shouldRender) {
      this._render();
    }
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
    config.entities = entities.filter(
      (x) =>
        x &&
        (
          normalizePowerCostEntityId(x.entity) ||
          x.is_three_phase ||
          x.is_three_phase_panel ||
          hasPowerCostPhaseEntities(x)
        )
    );
    this._config = config;
    this._emitConfig(config);
    this._render();
  }

  _updateTopField(field, rawValue, isBoolean = false, isNumber = false) {
    const config = { ...(this._config || {}) };

    if (isBoolean) {
      config[field] = Boolean(rawValue);
      if (field === "radio_mode" && Boolean(rawValue)) {
        config.show_minimize = false;
      }
      if (field === "show_minimize" && Boolean(rawValue)) {
        config.radio_mode = false;
      }
    } else if (isNumber) {
      const num = rawValue === "" ? undefined : Number(rawValue);
      if (field === "background_opacity") {
        config[field] = num == null || Number.isNaN(num) ? undefined : Math.max(0, Math.min(1, num));
      } else {
        config[field] = num;
      }
    } else {
      if (field === "language") {
        const nextLanguage = normalizePowerCostLanguage(rawValue);
        const currentTitle = String(config.title || "").trim();
        const heDefaultTitle = powerCostTranslate("he", "default_title");
        const enDefaultTitle = powerCostTranslate("en", "default_title");
        const ruDefaultTitle = powerCostTranslate("ru", "default_title");
        config[field] = nextLanguage;
        if (
          !currentTitle ||
          currentTitle === heDefaultTitle ||
          currentTitle === enDefaultTitle ||
          currentTitle === ruDefaultTitle
        ) {
          config.title = powerCostTranslate(nextLanguage, "default_title");
        }
      } else {
        config[field] = rawValue;
      }
    }

    this._config = config;
    this._emitConfig(config);
    this._render();
  }

  _addEntityRow() {
    const entities = this._getEntities();
    entities.push({
      entity: "",
      name: "",
      power_w: undefined,
      power_entity: undefined,
      is_three_phase: false,
      is_three_phase_panel: false,
      phase_1_entity: undefined,
      phase_2_entity: undefined,
      phase_3_entity: undefined,
      phase_1_voltage_entity: undefined,
      phase_2_voltage_entity: undefined,
      phase_3_voltage_entity: undefined,
      phase_1_current_entity: undefined,
      phase_2_current_entity: undefined,
      phase_3_current_entity: undefined,
      price_per_kwh: undefined,
      icon: undefined,
      active_icon_color: undefined,
      allow_minimize: true,
      currency: this._config?.currency || "₪",
    });
    this._entityEditorOpen = { ...(this._entityEditorOpen || {}), [entities.length - 1]: true };
    this._config = { ...(this._config || {}), entities };
    this._emitConfig(this._config);
    this._render();
  }

  _removeEntityRow(index) {
    const entities = this._getEntities();
    entities.splice(index, 1);

    const nextOpen = {};
    Object.keys(this._entityEditorOpen || {}).forEach((key) => {
      const oldIndex = Number(key);
      if (oldIndex === index) return;
      const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
      nextOpen[newIndex] = this._entityEditorOpen[key];
    });
    this._entityEditorOpen = nextOpen;

    this._saveEntities(entities);
  }

  _moveEntityRow(fromIndex, toIndex) {
    const entities = this._getEntities();
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= entities.length ||
      toIndex >= entities.length
    ) {
      return;
    }

    const [moved] = entities.splice(fromIndex, 1);
    entities.splice(toIndex, 0, moved);

    const remap = {};
    entities.forEach((_, newIndex) => {
      const sourceIndex =
        newIndex === toIndex
          ? fromIndex
          : fromIndex < toIndex
            ? (newIndex > fromIndex && newIndex <= toIndex ? newIndex - 1 : newIndex)
            : (newIndex >= toIndex && newIndex < fromIndex ? newIndex + 1 : newIndex);

      if (this._entityEditorOpen && sourceIndex in this._entityEditorOpen) {
        remap[newIndex] = this._entityEditorOpen[sourceIndex];
      }
    });
    this._entityEditorOpen = remap;

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
        is_three_phase: false,
        is_three_phase_panel: false,
        phase_1_entity: undefined,
        phase_2_entity: undefined,
        phase_3_entity: undefined,
        phase_1_voltage_entity: undefined,
        phase_2_voltage_entity: undefined,
        phase_3_voltage_entity: undefined,
        phase_1_current_entity: undefined,
        phase_2_current_entity: undefined,
        phase_3_current_entity: undefined,
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
    } else if (key === "icon") {
      const normalizedIcon = normalizePowerCostIcon(rawValue);
      if (normalizedIcon === "") {
        next[key] = undefined;
      } else if (isPowerCostIconId(normalizedIcon)) {
        next[key] = normalizedIcon;
      } else {
        return;
      }
    } else {
      next[key] = rawValue === "" ? undefined : rawValue;
    }

    entities[index] = next;
    this._saveEntities(entities);
  }

  _setEntityMode(index, modeRaw) {
    const entities = this._getEntities();

    while (entities.length <= index) {
      entities.push({
        entity: "",
        name: "",
        power_w: undefined,
        power_entity: undefined,
        is_three_phase: false,
        is_three_phase_panel: false,
        phase_1_entity: undefined,
        phase_2_entity: undefined,
        phase_3_entity: undefined,
        phase_1_voltage_entity: undefined,
        phase_2_voltage_entity: undefined,
        phase_3_voltage_entity: undefined,
        phase_1_current_entity: undefined,
        phase_2_current_entity: undefined,
        phase_3_current_entity: undefined,
        price_per_kwh: undefined,
        icon: undefined,
        active_icon_color: undefined,
        allow_minimize: true,
        currency: this._config?.currency || "₪",
      });
    }

    const next = { ...(entities[index] || {}) };
    const mode = String(modeRaw || "single");

    if (mode === "three_phase") {
      next.is_three_phase = true;
      next.is_three_phase_panel = false;
    } else if (mode === "three_phase_panel") {
      next.is_three_phase = false;
      next.is_three_phase_panel = true;
    } else {
      next.is_three_phase = false;
      next.is_three_phase_panel = false;
    }

    entities[index] = next;
    this._saveEntities(entities);
  }



  _iconDatalistOptions() {
    const states = this._hass?.states || {};
    const seen = new Set();
    const icons = [];

    const addIcon = (icon) => {
      const normalized = normalizePowerCostIcon(icon);
      if (!normalized || seen.has(normalized) || !normalized.startsWith("mdi:")) return;
      seen.add(normalized);
      icons.push(normalized);
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
      "mdi:snowflake",
      "mdi:air-purifier",
      "mdi:toaster-oven",
      "mdi:robot-vacuum"
    ].forEach(addIcon);

    return icons
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => `<option value="${icon}">${icon}</option>`)
      .join("");
  }



  _getAllIcons() {
    const states = this._hass?.states || {};
    const seen = new Set();
    const icons = [];

    const addIcon = (icon) => {
      const normalized = normalizePowerCostIcon(icon);
      if (!normalized || seen.has(normalized) || !normalized.startsWith("mdi:")) return;
      seen.add(normalized);
      icons.push(normalized);
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
      "mdi:snowflake",
      "mdi:air-purifier",
      "mdi:toaster-oven",
      "mdi:robot-vacuum",
      "mdi:home",
      "mdi:script-outline",
      "mdi:cpu-64-bit",
      "mdi:gesture-tap-button",
      "mdi:lightbulb-group",
      "mdi:lightbulb-group-outline",
      "mdi:sine-wave",
      "mdi:toaster-oven"
    ].forEach(addIcon);

    return icons.sort((a, b) => a.localeCompare(b));
  }

  _iconListOptions(selectedIcon) {
    return this._getAllIcons()
      .map((icon) => `
        <button class="icon-list-option ${selectedIcon === icon ? "selected" : ""}" type="button" data-icon-select="${icon}">
          <span class="icon-preview">
            <ha-icon icon="${icon}"></ha-icon>
          </span>
          <span class="icon-list-option-text">${icon}</span>
        </button>
      `)
      .join("");
  }

  _entityDatalistOptions(domains) {
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
        return `<option value="${entityId}" label="${friendly}"></option>`;
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
      const normalized = normalizePowerCostIcon(icon);
      if (!normalized || seen.has(normalized) || !normalized.startsWith("mdi:")) return;
      seen.add(normalized);
      icons.push(normalized);
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


  _isSectionOpen(key) {
    if (!this._editorSections) this._editorSections = {};
    if (!(key in this._editorSections)) this._editorSections[key] = false;
    return this._editorSections[key];
  }

  _toggleSection(key) {
    this._editorSections = { ...(this._editorSections || {}), [key]: !this._isSectionOpen(key) };
    this._render();
  }

  _isEntityEditorOpen(index) {
    if (!this._entityEditorOpen) this._entityEditorOpen = {};
    if (!(index in this._entityEditorOpen)) this._entityEditorOpen[index] = false;
    return this._entityEditorOpen[index];
  }

  _toggleEntityEditor(index) {
    this._entityEditorOpen = { ...(this._entityEditorOpen || {}), [index]: !this._isEntityEditorOpen(index) };
    this._render();
  }

  _colorPickerValue(value) {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "#ffb300";
    if (v === "white") return "#ffffff";
    if (v === "black") return "#000000";
    if (v.startsWith("#")) return v;
    return "#ffb300";
  }

  _colorSelectValue(value) {
    const current = String(value || "");
    const presetValues = this._colorPresets().map(([preset]) => preset);
    return presetValues.includes(current) ? current : "__custom__";
  }

  _colorSelectOptions(selectedColor) {
    const glyphs = ["⚪", "🟡", "🟡", "🟠", "🟠", "🟢", "🟢", "🔵", "🔵", "🟣", "🟣", "🔴", "⚪"];
    return this._colorPresets()
      .map(([value], index) => `<option value="${value}" ${this._colorSelectValue(selectedColor) === value ? "selected" : ""}>${glyphs[index] || "●"}</option>`)
      .join("") + `<option value="__custom__" ${this._colorSelectValue(selectedColor) === "__custom__" ? "selected" : ""}>🎨</option>`;
  }

  _entitySummary(row) {
    const title = row?.name || row?.entity || "ישות חדשה";
    const modeLabel =
      row?.is_three_phase_panel
        ? "לוח תלת-פאזי"
        : (row?.is_three_phase ? "יישות תלת-פאזית" : "יישות בודדת");
    const meta = [
      row?.entity || "",
      modeLabel,
      (!row?.is_three_phase && !row?.is_three_phase_panel) ? (row?.power_entity || "") : "",
      row?.power_w != null && row?.power_w !== "" ? `${row.power_w}W` : ""
    ].filter(Boolean).join(" • ");
    return { title, meta };
  }



  _defaultColorPalette() {
    return ["#F44336", "#FF9800", "#FFC107", "#4CAF50", "#2196F3", "#9C27B0"];
  }

  _openColorPopup(index) {
    this._activeColorPopupIndex = index;
    this._render();
  }

  _closeColorPopup() {
    this._activeColorPopupIndex = null;
    this._render();
  }


  _isSafariMobile() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    return isIOS && isSafari;
  }

  _hexToHue(hex) {
    const value = String(hex || "").trim();
    const match = /^#?([0-9a-fA-F]{6})$/.exec(value);
    if (!match) return 210;
    const n = match[1];
    const r = parseInt(n.slice(0, 2), 16) / 255;
    const g = parseInt(n.slice(2, 4), 16) / 255;
    const b = parseInt(n.slice(4, 6), 16) / 255;
    const maxv = Math.max(r, g, b);
    const minv = Math.min(r, g, b);
    const d = maxv - minv;
    if (d === 0) return 0;
    let h;
    switch (maxv) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    return Math.round(h * 60 < 0 ? h * 60 + 360 : h * 60);
  }

  _hslToHex(h, s = 85, l = 56) {
    const hh = (((Number(h) || 0) % 360) + 360) % 360;
    const ss = Math.max(0, Math.min(100, Number(s))) / 100;
    const ll = Math.max(0, Math.min(100, Number(l))) / 100;

    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs((hh / 60) % 2 - 1));
    const m = ll - c / 2;

    let r = 0, g = 0, b = 0;
    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _render() {
    const config = this._config || {};
    const editorLanguage = normalizePowerCostLanguage(config.language || "he");
    const entities = this._getEntities();
    const mainEntityOptions = this._entityDatalistOptions(["light", "switch", "fan", "climate"]);
    const powerEntityOptions = this._entityDatalistOptions(["sensor"]);

    const renderSection = (key, title, content) => `
      <div class="editor-section">
        <button class="section-header" type="button" data-section-toggle="${key}">
          <span>${title}</span>
          <span class="section-chevron">${this._isSectionOpen(key) ? "▾" : "▸"}</span>
        </button>
        ${this._isSectionOpen(key) ? `<div class="section-body">${content}</div>` : ""}
      </div>
    `;

    const renderEntity = (row, index) => {
      const summary = this._entitySummary(row);
      const isOpen = this._isEntityEditorOpen(index);
      const safeRowIcon = normalizePowerCostIcon(row.icon);
      const displayRowIcon = safeRowIcon || "mdi:flash";
      const mode = row.is_three_phase_panel
        ? "three_phase_panel"
        : (row.is_three_phase ? "three_phase" : "single");

      return `
        <div class="entity-row ${isOpen ? "open" : ""}" data-entity-row="${index}">
          <div class="entity-header">
            <button class="drag-handle" type="button" draggable="true" title="גרור לסידור" aria-label="גרור לסידור" data-drag-handle="${index}">⋮⋮</button>
            <button class="entity-toggle" type="button" data-entity-toggle="${index}">
              <span class="entity-header-main">
                <span class="entity-mini-icon"><ha-icon icon="${displayRowIcon}"></ha-icon></span>
                <span class="entity-texts">
                  <span class="entity-name">${summary.title}</span>
                  <span class="entity-meta">${summary.meta || "הגדרות ישות"}</span>
                </span>
              </span>
              <span class="entity-toggle-right">${isOpen ? "▾" : "▸"}</span>
            </button>
          </div>

          ${isOpen ? `
            <div class="entity-body">
              <div class="entity-actions-row">
                <button class="btn danger delete-row-btn" type="button" data-delete-entity="${index}">מחק ישות</button>
              </div>
              <div class="entity-grid mode-grid">
                <label class="mode-chip ${mode === "single" ? "active" : ""}">
                  <input
                    type="radio"
                    name="entity-mode-${index}"
                    data-row-mode="${index}"
                    value="single"
                    ${mode === "single" ? "checked" : ""}
                  >
                  <span>יישות בודדת</span>
                </label>
                <label class="mode-chip ${mode === "three_phase" ? "active" : ""}">
                  <input
                    type="radio"
                    name="entity-mode-${index}"
                    data-row-mode="${index}"
                    value="three_phase"
                    ${mode === "three_phase" ? "checked" : ""}
                  >
                  <span>יישות תלת פאזית</span>
                </label>
                <label class="mode-chip ${mode === "three_phase_panel" ? "active" : ""}">
                  <input
                    type="radio"
                    name="entity-mode-${index}"
                    data-row-mode="${index}"
                    value="three_phase_panel"
                    ${mode === "three_phase_panel" ? "checked" : ""}
                  >
                  <span>מצב לוח תלת פאזי</span>
                </label>
              </div>
              <div class="entity-grid two-col">
                ${row.is_three_phase_panel ? `
                  <label>
                    <span>שם להצגה</span>
                    <input data-row-field="name" data-index="${index}" value="${row.name || ""}" placeholder="לוח ראשי / 3 פאזות">
                  </label>
                  <div></div>
                ` : `
                  <label>
                    <span>Entity</span>
                    <input
                      data-row-field="entity"
                      data-index="${index}"
                      value="${row.entity || ""}"
                      list="power-cost-entity-list"
                      placeholder="בחר או כתוב entity"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>

                  <label>
                    <span>שם להצגה</span>
                    <input data-row-field="name" data-index="${index}" value="${row.name || ""}">
                  </label>
                `}
              </div>

              <div class="entity-grid two-col">
                <label>
                  <span>אייקון</span>
                  <div class="icon-ha-picker-row">
                    <span class="icon-preview">
                      <ha-icon icon="${displayRowIcon}"></ha-icon>
                    </span>
                    <ha-icon-picker
                      data-icon-picker-native="${index}"
                      placeholder="${safeRowIcon || "mdi:icon-name"}"
                    ></ha-icon-picker>
                  </div>
                </label>

                <label>
                  <span>צבע אייקון כשהישות דולקת</span>
                  <div class="color-select-row" data-color-wrap="${index}">
                    <button class="btn color-btn" type="button" data-open-color-popup="${index}" title="בחר צבע">
                      <span class="color-btn-dot" style="background:${row.active_icon_color || "var(--card-background-color)"};"></span>
                      <span>🎨</span>
                    </button>
                  </div>

                  ${this._activeColorPopupIndex === index ? `
                    <div class="color-popup" data-color-popup="${index}">
                      <div class="color-popup-head">
                        <div class="color-popup-title">בחר צבע</div>
                        <button class="btn color-popup-close" type="button" data-close-color-popup="1">✕</button>
                      </div>

                      <div class="color-popup-palette">
                        ${this._defaultColorPalette().map((color) => `
                          <button
                            class="color-circle ${row.active_icon_color === color ? "selected" : ""}"
                            type="button"
                            data-palette-color="${color}"
                            data-palette-index="${index}"
                            style="background:${color};"
                            aria-label="${color}"
                            title="${color}"
                          ></button>
                        `).join("")}
                      </div>

                      ${this._isSafariMobile() ? `
                        <div class="color-popup-custom">
                          <span>צבע מותאם אישית</span>
                          <div class="safari-hue-wrap">
                            <input
                              class="safari-hue-slider"
                              type="range"
                              min="0"
                              max="360"
                              step="1"
                              value="${this._hexToHue(row.active_icon_color || "#2196F3")}"
                              data-safari-hue="${index}"
                            >
                            <span class="safari-hue-preview" data-safari-preview="${index}" style="background:${row.active_icon_color || "#2196F3"};"></span>
                          </div>
                        </div>
                      ` : `
                        <div class="color-popup-custom">
                          <span>צבע מותאם אישית</span>
                          <label class="btn color-btn color-btn-wrap" title="בחר צבע מותאם">
                            <span class="color-btn-dot" style="background:${row.active_icon_color || "var(--card-background-color)"};"></span>
                            <span>בחר צבע</span>
                            <input class="native-color-input" type="color" data-color-picker="${index}" value="${this._colorPickerValue(row.active_icon_color || "")}">
                          </label>
                        </div>
                      `}
                    </div>
                  ` : ""}
                </label>
              </div>

              ${(!row.is_three_phase && !row.is_three_phase_panel) ? `
                <div class="entity-grid four-col">
                  <label>
                    <span>Power קבוע ב-W</span>
                    <input data-row-field="power_w" data-index="${index}" type="number" step="0.1" value="${row.power_w ?? ""}">
                  </label>

                  <label>
                    <span>Power entity</span>
                    <input
                      data-row-field="power_entity"
                      data-index="${index}"
                      value="${row.power_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="בחר או כתוב sensor"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
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
              ` : `
                <div class="entity-grid two-col">
                  <label>
                    <span>מחיר לקוט"ש</span>
                    <input data-row-field="price_per_kwh" data-index="${index}" type="number" step="0.001" value="${row.price_per_kwh ?? ""}">
                  </label>

                  <label>
                    <span>מטבע</span>
                    <input data-row-field="currency" data-index="${index}" value="${row.currency || config.currency || "₪"}">
                  </label>
                </div>
              `}

              ${(row.is_three_phase || row.is_three_phase_panel) ? `
                <div class="entity-grid three-phase-grid">
                  <label>
                    <span>Phase 1 entity</span>
                    <input
                      data-row-field="phase_1_entity"
                      data-index="${index}"
                      value="${row.phase_1_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l1_power"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>Phase 2 entity</span>
                    <input
                      data-row-field="phase_2_entity"
                      data-index="${index}"
                      value="${row.phase_2_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l2_power"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>Phase 3 entity</span>
                    <input
                      data-row-field="phase_3_entity"
                      data-index="${index}"
                      value="${row.phase_3_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l3_power"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                </div>
                <div class="entity-grid three-phase-grid">
                  <label>
                    <span>L1 voltage entity (optional)</span>
                    <input
                      data-row-field="phase_1_voltage_entity"
                      data-index="${index}"
                      value="${row.phase_1_voltage_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l1_voltage"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>L2 voltage entity (optional)</span>
                    <input
                      data-row-field="phase_2_voltage_entity"
                      data-index="${index}"
                      value="${row.phase_2_voltage_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l2_voltage"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>L3 voltage entity (optional)</span>
                    <input
                      data-row-field="phase_3_voltage_entity"
                      data-index="${index}"
                      value="${row.phase_3_voltage_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l3_voltage"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                </div>
                <div class="entity-grid three-phase-grid">
                  <label>
                    <span>L1 current entity (optional)</span>
                    <input
                      data-row-field="phase_1_current_entity"
                      data-index="${index}"
                      value="${row.phase_1_current_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l1_current"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>L2 current entity (optional)</span>
                    <input
                      data-row-field="phase_2_current_entity"
                      data-index="${index}"
                      value="${row.phase_2_current_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l2_current"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                  <label>
                    <span>L3 current entity (optional)</span>
                    <input
                      data-row-field="phase_3_current_entity"
                      data-index="${index}"
                      value="${row.phase_3_current_entity || ""}"
                      list="power-cost-power-entity-list"
                      placeholder="sensor.l3_current"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                    >
                  </label>
                </div>
              ` : ""}

              <div class="entity-grid single-col">
                <label class="checkbox-like">
                  <input data-row-field="allow_minimize" data-index="${index}" type="checkbox" ${row.allow_minimize !== false ? "checked" : ""}>
                  <span>${row.is_three_phase_panel ? "אפשר מזעור לכרטיס" : "אפשר מזעור לישות"}</span>
                </label>
              </div>

              <div class="hint">במצב תלת-פאזי הכרטיס מחבר את 3 הסנסורים ומציג גם L1/L2/L3. אפשר להזין ישויות מתח/זרם לכל פאזה, ואם לא מזינים הוא ינסה לקרוא מה-attributes של סנסור ההספק. במצב לוח תלת-פאזי אין צורך ב-entity ראשי והוא מציג את שלוש הפאזות והסה"כ בעיצוב רוחבי.</div>
            </div>
          ` : ""}
        </div>
      `;
    };

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
          min-width: 0;
        }
        input, select {
          font: inherit;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          min-width: 0;
          box-sizing: border-box;
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
        .btn.danger {
          white-space: nowrap;
          position: relative;
          z-index: 3;
          pointer-events: auto;
        }
        .entity-actions-row {
          display: flex;
          justify-content: flex-start;
          margin-top: 2px;
        }
        .delete-row-btn {
          min-width: 120px;
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
        }
        .hint {
          font-size: 12px;
          opacity: 0.75;
          line-height: 1.4;
        }
        .editor-section {
          border: 1px solid var(--divider-color);
          border-radius: 14px;
          overflow: hidden;
          background: color-mix(in srgb, var(--card-background-color) 85%, transparent);
        }
        .section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border: 0;
          background: transparent;
          color: var(--primary-text-color);
          cursor: pointer;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
          text-align: right;
        }
        .section-body {
          display: grid;
          gap: 12px;
          padding: 0 14px 14px;
        }
        .compact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .compact-grid.three {
          grid-template-columns: 0.8fr 1.1fr 1fr;
        }
        .checks {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 18px;
        }
        .checks label,
        .checkbox-like {
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.3;
          min-height: 24px;
        }
        
        .checks input[type="checkbox"],
        .checkbox-like input[type="checkbox"]{
          -webkit-appearance:none;
          appearance:none;
          width:18px;
          height:18px;
          border-radius:50%;
          border:2px solid #6fcf97;
          background:transparent;
          cursor:pointer;
          position:relative;
          transition:all .15s ease;
        }

        .checks input[type="checkbox"]:hover,
        .checkbox-like input[type="checkbox"]:hover{
          border-color:#4cd37a;
        }

        .checks input[type="checkbox"]:checked,
        .checkbox-like input[type="checkbox"]:checked{
          border-color:#4cd37a;
        }

        .checks input[type="checkbox"]:checked::after,
        .checkbox-like input[type="checkbox"]:checked::after{
          content:"";
          position:absolute;
          width:8px;
          height:8px;
          border-radius:50%;
          background:#4cd37a;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
        }

        .entity-rows {
          display: grid;
          gap: 10px;
        }
        .entity-row {
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          overflow: hidden;
          background: color-mix(in srgb, var(--card-background-color) 92%, transparent);
        }
        .entity-row.open {
          border-color: color-mix(in srgb, var(--primary-color) 24%, var(--divider-color));
        }
        .entity-header {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          padding: 10px;
        }
        .drag-handle {
          grid-column: 1;
          width: 34px;
          height: 34px;
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          background: transparent;
          color: var(--primary-text-color);
          cursor: grab;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          font-size: 18px;
          position: relative;
          z-index: 2;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .entity-row.dragging {
          opacity: 0.45;
        }
        .entity-row.drop-target {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 20%, transparent) inset;
        }
        .entity-toggle {
          grid-column: 2;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 0;
          background: transparent;
          color: var(--primary-text-color);
          cursor: pointer;
          padding: 0;
          min-width: 0;
          text-align: right;
          font: inherit;
        }
        .entity-header-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .entity-mini-icon {
          width: 34px;
          height: 34px;
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }
        .entity-texts {
          display: grid;
          gap: 2px;
          min-width: 0;
        }
        .entity-name {
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .entity-meta {
          font-size: 12px;
          opacity: 0.7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .entity-body {
          display: grid;
          gap: 12px;
          padding: 0 10px 12px;
          border-top: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        }
        .entity-grid {
          display: grid;
          gap: 10px;
        }
        .entity-grid.two-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .entity-grid.four-col {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .entity-grid.three-phase-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .entity-grid.single-col {
          grid-template-columns: 1fr;
        }
        .entity-grid.mode-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .mode-chip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 8px 10px;
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          cursor: pointer;
          background: var(--card-background-color);
          text-align: center;
          box-sizing: border-box;
          user-select: none;
        }
        .mode-chip input[type="radio"] {
          margin: 0;
        }
        .mode-chip.active {
          border-color: color-mix(in srgb, var(--primary-color) 42%, var(--divider-color));
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 26%, transparent);
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
        .color-select-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .color-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: auto;
          padding-inline: 10px;
          position: relative;
          overflow: hidden;
        }

        .color-btn-wrap {
          cursor: pointer;
        }
        .color-btn-dot {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 2px solid var(--divider-color);
          display: inline-block;
          box-sizing: border-box;
        }
        .native-color-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          border: 0;
          padding: 0;
          margin: 0;
        }
        .color-popup {
          margin-top: 10px;
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 12px;
          background: var(--card-background-color);
        }
        .color-popup-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .color-popup-title {
          font-weight: 700;
          font-size: 14px;
        }
        .color-popup-close {
          min-width: auto;
          padding-inline: 10px;
        }
        .color-popup-palette {
          display: grid;
          grid-template-columns: repeat(3, 34px);
          gap: 12px;
          justify-content: start;
        }

        @media (max-width: 600px) {
          .color-popup-palette {
            grid-template-columns: repeat(3, 30px);
            gap: 10px;
          }
        }
        .color-circle {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 2px solid var(--divider-color);
          padding: 0;
          cursor: pointer;
          box-sizing: border-box;
        }
        .color-circle.selected {
          border-color: var(--primary-color);
          transform: scale(1.08);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 20%, transparent);
        }
        .color-popup-custom {
          display: grid;
          gap: 8px;
          align-items: start;
        }
        .safari-hue-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 34px;
          gap: 10px;
          align-items: center;
        }
        .safari-hue-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 18px;
          border-radius: 999px;
          border: 1px solid var(--divider-color);
          background: linear-gradient(90deg,
            #ff0000 0%,
            #ffff00 17%,
            #00ff00 33%,
            #00ffff 50%,
            #0000ff 67%,
            #ff00ff 83%,
            #ff0000 100%);
          outline: none;
        }
        .safari-hue-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: white;
          border: 2px solid rgba(0,0,0,0.18);
          box-shadow: 0 1px 6px rgba(0,0,0,0.25);
        }
        .safari-hue-preview {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 2px solid var(--divider-color);
          display: inline-block;
          box-sizing: border-box;
        }
        .entity-list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        @media (max-width: 900px) {
          .entity-grid.four-col,
          .compact-grid.three {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .compact-grid,
          .checks,
          .entity-grid.two-col,
          .entity-grid.mode-grid,
          .entity-grid.four-col,
          .entity-grid.three-phase-grid,
          .phase-cards {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="wrap">
        ${renderSection("general", "הגדרות כלליות", `
          <div class="compact-grid three">
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
          </div>
          <div class="compact-grid">
            <label>
              <span>רענון בשניות</span>
              <input data-field="refresh_seconds" type="number" min="10" step="1" value="${config.refresh_seconds ?? 60}">
            </label>
            <label>
              <span>שפת כרטיס</span>
              <select data-field="language">
                <option value="he" ${editorLanguage === "he" ? "selected" : ""}>עברית</option>
                <option value="en" ${editorLanguage === "en" ? "selected" : ""}>English</option>
                <option value="ru" ${editorLanguage === "ru" ? "selected" : ""}>Русский</option>
              </select>
            </label>
          </div>
        `)}

        ${renderSection("display", "תצוגה והתנהגות", `
          <div class="checks">
            <label><input data-field="show_period_selector" type="checkbox" ${config.show_period_selector !== false ? "checked" : ""}> בורר תקופה</label>
            <label><input data-field="show_toggle" type="checkbox" ${config.show_toggle !== false ? "checked" : ""}> טוגל הפעלה/כיבוי</label>
            <label><input data-field="show_total" type="checkbox" ${config.show_total !== false ? "checked" : ""}> סיכום כולל</label>
            <label><input data-field="show_details" type="checkbox" ${config.show_details !== false ? "checked" : ""}> טבלת ישויות</label>
            <label><input data-field="show_formula" type="checkbox" ${config.show_formula !== false ? "checked" : ""}> הצג נוסחת חישוב</label>
            <label><input data-field="show_graph" type="checkbox" ${config.show_graph === true ? "checked" : ""}> הצג גרף בכרטיס</label>
            <label><input data-field="show_minimize" type="checkbox" ${config.show_minimize !== false ? "checked" : ""}> אפשר מזעור כרטיסים</label>
            <label><input data-field="radio_mode" type="checkbox" ${config.radio_mode === true ? "checked" : ""}> מצב רדיו</label>
            <label><input data-field="enable_icon_animation" type="checkbox" ${config.enable_icon_animation !== false ? "checked" : ""}> אפשר אנימציית אייקון</label>
          </div>
        `)}

        ${renderSection("background", "עיצוב ורקע", `
          <div class="compact-grid">
            <label>
              <span>נתיב תמונת רקע</span>
              <input data-field="background_image" placeholder="/media/local/power_bg.jpg" value="${config.background_image || ""}">
            </label>
            <label>
              <span>גודל תמונה</span>
              <select data-field="background_size">
                <option value="cover" ${config.background_size === "cover" || !config.background_size ? "selected" : ""}>Cover / מילוי</option>
                <option value="contain" ${config.background_size === "contain" ? "selected" : ""}>Contain / התאמה</option>
                <option value="auto" ${config.background_size === "auto" ? "selected" : ""}>Auto</option>
              </select>
            </label>
          </div>
          <div class="compact-grid">
            <label>
              <span>שקיפות תמונה (0 עד 1)</span>
              <input data-field="background_opacity" type="number" min="0" max="1" step="0.01" value="${config.background_opacity ?? 0.18}">
            </label>
          </div>
        `)}

        ${renderSection("pricing", "מצב תמחור", `
          <div class="compact-grid">
            <label>
              <span>שיטת חישוב עלות</span>
              <select data-field="pricing_mode">
                <option value="consumption_only" ${config.pricing_mode === "consumption_only" || !config.pricing_mode ? "selected" : ""}>עלות צריכה בלבד</option>
                <option value="energy_plus_fixed" ${config.pricing_mode === "energy_plus_fixed" ? "selected" : ""}>עלות צריכה + תשלום קבוע</option>
                <option value="israel_tariff" ${config.pricing_mode === "israel_tariff" ? "selected" : ""}>תעו"ז ישראלי</option>
                <option value="israel_tariff_plus_fixed" ${config.pricing_mode === "israel_tariff_plus_fixed" ? "selected" : ""}>תעו"ז ישראלי + תשלום קבוע</option>
              </select>
            </label>
            <div></div>
          </div>

          <div class="compact-grid three">
            <label>
              <span>סכום תשלום קבוע</span>
              <input data-field="fixed_charge_amount" type="number" step="0.01" value="${config.fixed_charge_amount ?? 0}">
            </label>
            <label>
              <span>מחזור תשלום קבוע</span>
              <select data-field="fixed_charge_period">
                <option value="monthly" ${config.fixed_charge_period === "monthly" || !config.fixed_charge_period ? "selected" : ""}>חודשי</option>
                <option value="bimonthly" ${config.fixed_charge_period === "bimonthly" ? "selected" : ""}>דו חודשי</option>
              </select>
            </label>
            <label>
              <span>חלוקת תשלום קבוע</span>
              <select data-field="fixed_charge_allocation">
                <option value="proportional" ${config.fixed_charge_allocation === "proportional" || !config.fixed_charge_allocation ? "selected" : ""}>יחסי לצריכה</option>
                <option value="equal" ${config.fixed_charge_allocation === "equal" ? "selected" : ""}>חלוקה שווה</option>
              </select>
            </label>
          </div>

          <div class="compact-grid">
            <label>
              <span>קיץ - שפל (₪/kWh)</span>
              <input data-field="tariff_israel_shfel" type="number" step="0.0001" value="${config.tariff_israel_shfel ?? 0.49}">
            </label>
            <label>
              <span>חורף - שפל (₪/kWh)</span>
              <input data-field="tariff_israel_shfel_winter" type="number" step="0.0001" value="${config.tariff_israel_shfel_winter ?? 0.4226}">
            </label>
          </div>
          <div class="compact-grid">
            <label>
              <span>קיץ - פסגה (₪/kWh)</span>
              <input data-field="tariff_israel_peak" type="number" step="0.0001" value="${config.tariff_israel_peak ?? 1.6627}">
            </label>
            <label>
              <span>חורף - פסגה (₪/kWh)</span>
              <input data-field="tariff_israel_peak_winter" type="number" step="0.0001" value="${config.tariff_israel_peak_winter ?? 1.1654}">
            </label>
          </div>
          <div class="compact-grid">
            <label>
              <span>קיץ - אביב/סתיו (₪/kWh)</span>
              <input data-field="tariff_israel_offpeak" type="number" step="0.0001" value="${config.tariff_israel_offpeak ?? 0.4125}">
            </label>
            <label>
              <span>חורף - אביב/סתיו (₪/kWh)</span>
              <input data-field="tariff_israel_offpeak_winter" type="number" step="0.0001" value="${config.tariff_israel_offpeak_winter ?? 0.4634}">
            </label>
          </div>

          <div class="hint">אם אתה משתמש בתמחור פשוט, אפשר להשאיר את שדות תעו"ז כמו שהם. הם ישפיעו רק במצבי התמחור הישראליים.</div>
        `)}

        ${renderSection("entities", "ניהול ישויות", `
          <div class="entity-list-head">
            <span class="hint">אפשר לבחור מהרשימה או לכתוב entity ידנית. ניתן גם לגרור ישויות כדי לשנות את הסדר שלהן. בחירת האייקון משתמשת בבורר האייקונים של Home Assistant ומציגה את האייקון לפני הבחירה.</span>
            <button class="btn" type="button" data-add-entity="1">הוסף ישות</button>
          </div>
          <div class="entity-rows">
            ${entities.map((row, index) => renderEntity(row, index)).join("")}
          </div>
        `)}

        <datalist id="power-cost-entity-list">
          ${mainEntityOptions}
        </datalist>

        <datalist id="power-cost-power-entity-list">
          ${powerEntityOptions}
        </datalist>

      </div>
    `;

    this.querySelectorAll("[data-section-toggle]").forEach((el) => {
      el.addEventListener("click", () => this._toggleSection(el.dataset.sectionToggle));
    });

    this.querySelectorAll("[data-entity-toggle]").forEach((el) => {
      el.addEventListener("click", () => this._toggleEntityEditor(Number(el.dataset.entityToggle)));
    });
    this.querySelectorAll("button").forEach((el) => {
      if (!el.hasAttribute("data-drag-handle")) {
        el.setAttribute("draggable", "false");
      }
    });


    this.querySelectorAll("[data-field]").forEach((el) => {
      const field = el.dataset.field;
      if (el.type === "checkbox") {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.checked, true, false));
      } else if (["refresh_seconds", "default_price_per_kwh", "background_opacity", "fixed_charge_amount", "tariff_israel_shfel", "tariff_israel_shfel_winter", "tariff_israel_peak", "tariff_israel_peak_winter", "tariff_israel_offpeak", "tariff_israel_offpeak_winter"].includes(field)) {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.value, false, true));
      } else {
        el.addEventListener("change", (ev) => this._updateTopField(field, ev.target.value, false, false));
      }
    });

    this.querySelectorAll("[data-add-entity]").forEach((el) => {
      el.addEventListener("click", () => this._addEntityRow());
    });

    let dragFromIndex = null;

    this.querySelectorAll("[data-drag-handle]").forEach((handleEl) => {
      handleEl.addEventListener("dragstart", (ev) => {
        const rowEl = handleEl.closest("[data-entity-row]");
        dragFromIndex = Number(rowEl?.dataset.entityRow);
        rowEl?.classList.add("dragging");
        ev.dataTransfer.effectAllowed = "move";
        try {
          ev.dataTransfer.setData("text/plain", String(dragFromIndex));
        } catch (err) {}
      });

      handleEl.addEventListener("dragend", () => {
        const rowEl = handleEl.closest("[data-entity-row]");
        rowEl?.classList.remove("dragging");
        this.querySelectorAll("[data-entity-row]").forEach((el) => el.classList.remove("drop-target"));
      });
    });

    this.querySelectorAll("[data-entity-row]").forEach((rowEl) => {
      rowEl.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        rowEl.classList.add("drop-target");
        ev.dataTransfer.dropEffect = "move";
      });

      rowEl.addEventListener("dragleave", () => {
        rowEl.classList.remove("drop-target");
      });

      rowEl.addEventListener("drop", (ev) => {
        ev.preventDefault();
        rowEl.classList.remove("drop-target");
        const toIndex = Number(rowEl.dataset.entityRow);
        const fromIndex = dragFromIndex ?? Number(ev.dataTransfer.getData("text/plain"));
        if (Number.isFinite(fromIndex) && Number.isFinite(toIndex)) {
          this._moveEntityRow(fromIndex, toIndex);
        }
        dragFromIndex = null;
      });
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

    this.querySelectorAll("[data-row-mode]").forEach((el) => {
      el.addEventListener("change", (ev) => {
        if (ev.target.type === "radio" && !ev.target.checked) return;
        const index = Number(ev.target.dataset.rowMode);
        const mode = ev.target.value || "single";
        this._setEntityMode(index, mode);
      });
    });

    this.querySelectorAll("[data-delete-entity]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.deleteEntity);
        if (Number.isFinite(index)) {
          this._removeEntityRow(index);
        }
      });
    });

    this.querySelectorAll("[data-color-select]").forEach((el) => {
      ["click", "mousedown", "pointerdown", "touchstart"].forEach((eventName) => {
        el.addEventListener(eventName, (ev) => {
          ev.stopPropagation();
        }, { passive: false });
      });

      el.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.colorSelect);
        const value = ev.currentTarget.value || "";
        if (value === "__custom__") {
          this.querySelector(`[data-color-picker="${index}"]`)?.click();
          return;
        }
        this._updateEntityRow(index, "active_icon_color", value);
      });
    });


    this.querySelectorAll("[data-color-picker]").forEach((el) => {
      ["click", "mousedown", "pointerdown", "touchstart", "touchend"].forEach((eventName) => {
        el.addEventListener(eventName, (ev) => {
          ev.stopPropagation();
        }, { passive: false });
      });

      el.addEventListener("input", (ev) => {
        ev.stopPropagation();
      });

      el.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.colorPicker);
        const value = ev.currentTarget.value || "";
        this._updateEntityRow(index, "active_icon_color", value);
        this._activeColorPopupIndex = index;
      });
    });

    this.querySelectorAll("[data-color-wrap]").forEach((el) => {
      ["click", "mousedown", "pointerdown", "touchstart"].forEach((eventName) => {
        el.addEventListener(eventName, (ev) => {
          ev.stopPropagation();
        }, { passive: false });
      });
    });



    this.querySelectorAll("[data-icon-toggle]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.iconToggle);
        this._activeIconPickerIndex = this._activeIconPickerIndex === index ? null : index;
        this._render();
      });
    });

    this.querySelectorAll("[data-icon-select]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const picker = ev.currentTarget.closest("[data-icon-picker]");
        const index = Number(picker?.dataset.iconPicker);
        const value = ev.currentTarget.dataset.iconSelect || "";
        this._updateEntityRow(index, "icon", value);
        this._activeIconPickerIndex = index;
      });
    });

    this.querySelectorAll("[data-icon-search]").forEach((el) => {
      el.addEventListener("input", (ev) => {
        ev.stopPropagation();
        const query = String(ev.currentTarget.value || "").toLowerCase().trim();
        const menu = ev.currentTarget.closest("[data-icon-menu]");
        menu?.querySelectorAll("[data-icon-select]").forEach((btn) => {
          const value = String(btn.dataset.iconSelect || "").toLowerCase();
          const text = String(btn.textContent || "").toLowerCase();
          btn.style.display = (!query || value.includes(query) || text.includes(query)) ? "" : "none";
        });
      });
    });


    this.querySelectorAll("[data-icon-picker-native]").forEach((el) => {
      const index = Number(el.dataset.iconPickerNative);
      const currentValue = normalizePowerCostIcon(entities[index]?.icon);

      try {
        if (this._hass) {
          el.hass = this._hass;
        }
      } catch (err) {}

      try {
        if (currentValue && isPowerCostIconId(currentValue)) {
          el.selectedItem = { value: currentValue, label: currentValue };
        }
      } catch (err) {}

      const iconFromEvent = (ev) => {
        const parseIconId = (rawValue, allowBareName = false) => {
          const normalized = normalizePowerCostIcon(rawValue);
          if (!normalized) return "";
          if (isPowerCostIconId(normalized)) return normalized;
          if (!allowBareName) return "";
          if (!/^[a-z0-9][a-z0-9-_]*$/i.test(normalized)) return "";
          return `mdi:${normalized.toLowerCase().replace(/_/g, "-")}`;
        };

        const selectedItemCandidates = [
          ev?.detail?.selectedItem,
          ev?.detail?.item,
          ev?.detail?.selected,
          ev?.target?.selectedItem,
          el?.selectedItem,
        ];

        for (const item of selectedItemCandidates) {
          if (!item) continue;
          const fromValue = parseIconId(item?.value, true);
          if (fromValue) return fromValue;
          const fromIcon = parseIconId(item?.icon, true);
          if (fromIcon) return fromIcon;
          const fromName = parseIconId(item?.name, true);
          if (fromName) return fromName;
        }

        const directSelectionCandidates = [
          ev?.detail?.icon,
          ev?.detail?.name,
        ];
        for (const rawCandidate of directSelectionCandidates) {
          const candidate = parseIconId(rawCandidate, true);
          if (candidate) return candidate;
        }

        const rawValueCandidates = [
          ev?.detail?.value,
          ev?.target?.value,
          el?.value,
        ];
        for (const rawCandidate of rawValueCandidates) {
          const candidate = parseIconId(rawCandidate, false);
          if (candidate) return candidate;
        }

        return "";
      };

      const saveIcon = (ev) => {
        const nextValue = iconFromEvent(ev);
        if (!nextValue) return;
        this._updateEntityRow(index, "icon", nextValue);
      };

      el.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        if (
          !ev?.detail ||
          (typeof ev.detail === "object" &&
            !ev.detail?.selectedItem &&
            !ev.detail?.item &&
            !ev.detail?.selected &&
            !ev.detail?.icon &&
            !ev.detail?.name)
        ) {
          const fallback = normalizePowerCostIcon(ev?.detail?.value ?? ev?.target?.value ?? el?.value);
          if (!isPowerCostIconId(fallback)) return;
          this._updateEntityRow(index, "icon", fallback);
          return;
        }
        saveIcon(ev);
      });

      el.addEventListener("change", (ev) => {
        ev.stopPropagation();
        saveIcon(ev);
        setTimeout(() => saveIcon({ detail: el?.selectedItem, target: el }), 0);
      });

      el.addEventListener("closed", (ev) => {
        ev.stopPropagation();
        saveIcon(ev);
        setTimeout(() => saveIcon({ detail: el?.selectedItem, target: el }), 0);
      });
    });

    this.querySelectorAll("[data-open-color-popup]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this._openColorPopup(Number(ev.currentTarget.dataset.openColorPopup));
      });
    });

    this.querySelectorAll("[data-close-color-popup]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this._closeColorPopup();
      });
    });

    this.querySelectorAll("[data-palette-color]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.paletteIndex);
        const color = ev.currentTarget.dataset.paletteColor || "";
        this._updateEntityRow(index, "active_icon_color", color);
        this._activeColorPopupIndex = index;
      });
    });


    this.querySelectorAll("[data-safari-hue]").forEach((el) => {
      ["click", "mousedown", "pointerdown", "touchstart", "touchmove", "touchend"].forEach((eventName) => {
        el.addEventListener(eventName, (ev) => {
          ev.stopPropagation();
        }, { passive: false });
      });

      el.addEventListener("input", (ev) => {
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.safariHue);
        const color = this._hslToHex(ev.currentTarget.value, 85, 56);

        const preview = this.querySelector(`.safari-hue-preview[data-safari-preview="${index}"]`);
        if (preview) preview.style.background = color;

        const dot = this.querySelector(`[data-open-color-popup="${index}"] .color-btn-dot`);
        if (dot) dot.style.background = color;
      });

      el.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const index = Number(ev.currentTarget.dataset.safariHue);
        const color = this._hslToHex(ev.currentTarget.value, 85, 56);
        this._updateEntityRow(index, "active_icon_color", color);
        this._activeColorPopupIndex = index;
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
    this._graphOpenAnimEntity = null;
    this._graphCloseAnimEntity = null;
    this._boundClick = this._handleClick.bind(this);
    this._boundChange = this._handleChange.bind(this);
  }

  static getConfigElement() {
    return document.createElement("power-cost-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:power-cost-card",
      title: powerCostTranslate("he", "default_title"),
      language: "he",
      background_image: "",
      background_opacity: 0.18,
      background_size: "cover",
      pricing_mode: "consumption_only",
      fixed_charge_amount: 0,
      fixed_charge_period: "monthly",
      fixed_charge_allocation: "proportional",
      tariff_israel_shfel: 0.49,
      tariff_israel_shfel_winter: 0.4226,
      tariff_israel_peak: 1.6627,
      tariff_israel_peak_winter: 1.1654,
      tariff_israel_offpeak: 0.4125,
      tariff_israel_offpeak_winter: 0.4634,
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
      radio_mode: false,
      enable_icon_animation: false,
      entities: [
        {
          entity: "light.bedroom",
          name: null,
          power_w: 10,
          is_three_phase: false,
          is_three_phase_panel: false,
          phase_1_entity: null,
          phase_2_entity: null,
          phase_3_entity: null,
          phase_1_voltage_entity: null,
          phase_2_voltage_entity: null,
          phase_3_voltage_entity: null,
          phase_1_current_entity: null,
          phase_2_current_entity: null,
          phase_3_current_entity: null,
          price_per_kwh: 0.52,
          active_icon_color: "#ffb300",
          allow_minimize: true,
          currency: "₪",
        },
      ],
    };
  }

  _buildStorageKey(entities) {
    const entityIds = (entities || [])
      .map((x) => this._rowIdFromConfig(x))
      .filter(Boolean)
      .sort()
      .join("|");
    return `power-cost-card:${entityIds}`;
  }

  _panelIdFromConfig(cfg) {
    if (!cfg?.is_three_phase_panel) return null;
    const phaseKey = [
      normalizePowerCostEntityId(cfg.phase_1_entity),
      normalizePowerCostEntityId(cfg.phase_2_entity),
      normalizePowerCostEntityId(cfg.phase_3_entity),
    ]
      .filter(Boolean)
      .join("|");
    return `panel:${phaseKey || (cfg.name || "default")}`;
  }

  _threePhaseIdFromConfig(cfg) {
    if (!cfg?.is_three_phase) return null;
    const phaseKey = [
      normalizePowerCostEntityId(cfg.phase_1_entity),
      normalizePowerCostEntityId(cfg.phase_2_entity),
      normalizePowerCostEntityId(cfg.phase_3_entity),
    ]
      .filter(Boolean)
      .join("|");
    return `threephase:${phaseKey || (cfg.name || "default")}`;
  }

  _rowIdFromConfig(cfg) {
    if (!cfg) return null;
    const entityId = normalizePowerCostEntityId(cfg.entity);
    if (entityId) return entityId;
    if (cfg.is_three_phase_panel) return this._panelIdFromConfig(cfg);
    if (cfg.is_three_phase || hasPowerCostPhaseEntities(cfg)) return this._threePhaseIdFromConfig({ ...cfg, is_three_phase: true });
    return null;
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


  _buildRelevantStateSignature(hass) {
    const entities = this._config?.entities || [];
    const parts = [];

    for (const cfg of entities) {
      const ids = [
        normalizePowerCostEntityId(cfg.entity),
        normalizePowerCostEntityId(cfg.power_entity),
        normalizePowerCostEntityId(cfg.phase_1_entity),
        normalizePowerCostEntityId(cfg.phase_2_entity),
        normalizePowerCostEntityId(cfg.phase_3_entity),
        normalizePowerCostEntityId(cfg.phase_1_voltage_entity),
        normalizePowerCostEntityId(cfg.phase_2_voltage_entity),
        normalizePowerCostEntityId(cfg.phase_3_voltage_entity),
        normalizePowerCostEntityId(cfg.phase_1_current_entity),
        normalizePowerCostEntityId(cfg.phase_2_current_entity),
        normalizePowerCostEntityId(cfg.phase_3_current_entity),
      ].filter(Boolean);
      for (const entityId of ids) {
        const st = hass?.states?.[entityId];
        parts.push(
          [
            entityId,
            st?.state ?? "",
            st?.last_changed ?? "",
            st?.attributes?.icon ?? "",
            st?.attributes?.friendly_name ?? "",
          ].join("|")
        );
      }
    }

    return parts.join("||");
  }


  _isRowCollapsed(row) {
    if (!row?.allowMinimize) {
      return false;
    }
    if (!row?.entityId) {
      return false;
    }

    if (this._config?.radio_mode) {
      return this._collapsedCards[row.entityId] !== false;
    }

    return this._config?.show_minimize && !!this._collapsedCards[row.entityId];
  }


  _normalizeBackgroundOpacity(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0.18;
    if (n > 1) return Math.max(0, Math.min(1, n / 100));
    return Math.max(0, Math.min(1, n));
  }

  _resolveBackgroundImage() {
    const raw = this._config?.background_image;
    if (!raw || typeof raw !== "string") return "";
    return raw.trim();
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    const language = normalizePowerCostLanguage(config.language || "he");

    const normalizedEntities = this._normalizeEntities(config);
    if (!normalizedEntities.length) {
      throw new Error("At least one entity is required");
    }

    this._storageKey = this._buildStorageKey(normalizedEntities);
    this._loadUiState();

    const nextEntityIds = new Set(
      normalizedEntities
        .map((x) => this._rowIdFromConfig(x))
        .filter(Boolean)
    );
    this._collapsedCards = Object.fromEntries(
      Object.entries(this._collapsedCards || {}).filter(([entityId]) => nextEntityIds.has(entityId))
    );
    this._expandedGraphs = Object.fromEntries(
      Object.entries(this._expandedGraphs || {}).filter(([entityId]) => nextEntityIds.has(entityId))
    );
    this._saveUiState();

    this._config = {
      title: config.title || powerCostTranslate(language, "default_title"),
      language,
      background_image: config.background_image || "",
      background_opacity: config.background_opacity ?? 0.18,
      background_size: config.background_size || "cover",
      pricing_mode: config.pricing_mode || "consumption_only",
      fixed_charge_amount: config.fixed_charge_amount ?? 0,
      fixed_charge_period: config.fixed_charge_period || "monthly",
      fixed_charge_allocation: config.fixed_charge_allocation || "proportional",
      tariff_israel_shfel: config.tariff_israel_shfel ?? 0.49,
      tariff_israel_shfel_winter: config.tariff_israel_shfel_winter ?? 0.4226,
      tariff_israel_peak: config.tariff_israel_peak ?? 1.6627,
      tariff_israel_peak_winter: config.tariff_israel_peak_winter ?? 1.1654,
      tariff_israel_offpeak: config.tariff_israel_offpeak ?? 0.4125,
      tariff_israel_offpeak_winter: config.tariff_israel_offpeak_winter ?? 0.4634,
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
      radio_mode: config.radio_mode === true,
      enable_icon_animation: config.enable_icon_animation === true,
      entities: normalizedEntities,
    };

    this._render();
    this._startTimer();
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._boundClick);
    this.shadowRoot.addEventListener("change", this._boundChange);
    this.shadowRoot.addEventListener("value-changed", this._boundChange);
    this._startTimer();
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._boundClick);
    this.shadowRoot.removeEventListener("change", this._boundChange);
    this.shadowRoot.removeEventListener("value-changed", this._boundChange);
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
  }

  set hass(hass) {
    const firstLoad = !this._hass;
    this._hass = hass;

    if (!this._config) {
      return;
    }

    const nextSignature = this._buildRelevantStateSignature(hass);

    if (firstLoad) {
      this._lastRelevantStateSignature = nextSignature;
      this._refreshAllHistory();
      this._render();
      return;
    }

    if (nextSignature !== this._lastRelevantStateSignature) {
      this._lastRelevantStateSignature = nextSignature;
      this._render();
    }
  }

  getCardSize() {
    const count = this._config?.entities?.length || 1;
    return Math.max(3, Math.min(8, count + 2));
  }

  _normalizeEntities(config) {
    if (Array.isArray(config.entities) && config.entities.length) {
      return config.entities
        .filter(
          (x) =>
            x &&
            (
              normalizePowerCostEntityId(x.entity) ||
              x.is_three_phase ||
              x.is_three_phase_panel ||
              hasPowerCostPhaseEntities(x)
            )
        )
        .map((x) => {
          const entityId = normalizePowerCostEntityId(x.entity);
          const isThreePhasePanel = x.is_three_phase_panel === true;
          return {
            entity: entityId,
            name: x.name || null,
            icon: normalizePowerCostIcon(x.icon) || null,
            active_icon_color: x.active_icon_color || null,
            allow_minimize: x.allow_minimize !== false,
            power_w: x.power_w != null && x.power_w !== "" ? Number(x.power_w) : undefined,
            is_three_phase: x.is_three_phase === true,
            is_three_phase_panel: isThreePhasePanel,
            phase_1_entity: normalizePowerCostEntityId(x.phase_1_entity),
            phase_2_entity: normalizePowerCostEntityId(x.phase_2_entity),
            phase_3_entity: normalizePowerCostEntityId(x.phase_3_entity),
            phase_1_voltage_entity: normalizePowerCostEntityId(x.phase_1_voltage_entity),
            phase_2_voltage_entity: normalizePowerCostEntityId(x.phase_2_voltage_entity),
            phase_3_voltage_entity: normalizePowerCostEntityId(x.phase_3_voltage_entity),
            phase_1_current_entity: normalizePowerCostEntityId(x.phase_1_current_entity),
            phase_2_current_entity: normalizePowerCostEntityId(x.phase_2_current_entity),
            phase_3_current_entity: normalizePowerCostEntityId(x.phase_3_current_entity),
            power_entity: normalizePowerCostEntityId(x.power_entity),
            price_per_kwh:
              x.price_per_kwh != null && x.price_per_kwh !== ""
                ? Number(x.price_per_kwh)
                : undefined,
            currency: x.currency || null,
          };
        });
    }

    if (normalizePowerCostEntityId(config.entity)) {
      return [
        {
          entity: normalizePowerCostEntityId(config.entity),
          name: config.name || null,
          icon: normalizePowerCostIcon(config.icon) || null,
          active_icon_color: config.active_icon_color || null,
          allow_minimize: config.allow_minimize !== false,
          power_w: config.power_w != null ? Number(config.power_w) : undefined,
          is_three_phase: config.is_three_phase === true,
          is_three_phase_panel: config.is_three_phase_panel === true,
          phase_1_entity: normalizePowerCostEntityId(config.phase_1_entity),
          phase_2_entity: normalizePowerCostEntityId(config.phase_2_entity),
          phase_3_entity: normalizePowerCostEntityId(config.phase_3_entity),
          phase_1_voltage_entity: normalizePowerCostEntityId(config.phase_1_voltage_entity),
          phase_2_voltage_entity: normalizePowerCostEntityId(config.phase_2_voltage_entity),
          phase_3_voltage_entity: normalizePowerCostEntityId(config.phase_3_voltage_entity),
          phase_1_current_entity: normalizePowerCostEntityId(config.phase_1_current_entity),
          phase_2_current_entity: normalizePowerCostEntityId(config.phase_2_current_entity),
          phase_3_current_entity: normalizePowerCostEntityId(config.phase_3_current_entity),
          power_entity: normalizePowerCostEntityId(config.power_entity),
          price_per_kwh:
            config.price_per_kwh != null ? Number(config.price_per_kwh) : undefined,
          currency: config.currency || null,
        },
      ];
    }

    if (config.is_three_phase === true) {
      return [
        {
          entity: null,
          name: config.name || null,
          icon: normalizePowerCostIcon(config.icon) || null,
          active_icon_color: config.active_icon_color || null,
          allow_minimize: config.allow_minimize !== false,
          power_w: config.power_w != null ? Number(config.power_w) : undefined,
          is_three_phase: true,
          is_three_phase_panel: false,
          phase_1_entity: normalizePowerCostEntityId(config.phase_1_entity),
          phase_2_entity: normalizePowerCostEntityId(config.phase_2_entity),
          phase_3_entity: normalizePowerCostEntityId(config.phase_3_entity),
          phase_1_voltage_entity: normalizePowerCostEntityId(config.phase_1_voltage_entity),
          phase_2_voltage_entity: normalizePowerCostEntityId(config.phase_2_voltage_entity),
          phase_3_voltage_entity: normalizePowerCostEntityId(config.phase_3_voltage_entity),
          phase_1_current_entity: normalizePowerCostEntityId(config.phase_1_current_entity),
          phase_2_current_entity: normalizePowerCostEntityId(config.phase_2_current_entity),
          phase_3_current_entity: normalizePowerCostEntityId(config.phase_3_current_entity),
          power_entity: normalizePowerCostEntityId(config.power_entity),
          price_per_kwh:
            config.price_per_kwh != null ? Number(config.price_per_kwh) : undefined,
          currency: config.currency || null,
        },
      ];
    }

    if (hasPowerCostPhaseEntities(config) && config.is_three_phase_panel !== true) {
      return [
        {
          entity: null,
          name: config.name || null,
          icon: normalizePowerCostIcon(config.icon) || null,
          active_icon_color: config.active_icon_color || null,
          allow_minimize: config.allow_minimize !== false,
          power_w: config.power_w != null ? Number(config.power_w) : undefined,
          is_three_phase: true,
          is_three_phase_panel: false,
          phase_1_entity: normalizePowerCostEntityId(config.phase_1_entity),
          phase_2_entity: normalizePowerCostEntityId(config.phase_2_entity),
          phase_3_entity: normalizePowerCostEntityId(config.phase_3_entity),
          phase_1_voltage_entity: normalizePowerCostEntityId(config.phase_1_voltage_entity),
          phase_2_voltage_entity: normalizePowerCostEntityId(config.phase_2_voltage_entity),
          phase_3_voltage_entity: normalizePowerCostEntityId(config.phase_3_voltage_entity),
          phase_1_current_entity: normalizePowerCostEntityId(config.phase_1_current_entity),
          phase_2_current_entity: normalizePowerCostEntityId(config.phase_2_current_entity),
          phase_3_current_entity: normalizePowerCostEntityId(config.phase_3_current_entity),
          power_entity: normalizePowerCostEntityId(config.power_entity),
          price_per_kwh:
            config.price_per_kwh != null ? Number(config.price_per_kwh) : undefined,
          currency: config.currency || null,
        },
      ];
    }

    if (config.is_three_phase_panel === true) {
      return [
        {
          entity: null,
          name: config.name || null,
          icon: normalizePowerCostIcon(config.icon) || null,
          active_icon_color: config.active_icon_color || null,
          allow_minimize: config.allow_minimize !== false,
          power_w: config.power_w != null ? Number(config.power_w) : undefined,
          is_three_phase: false,
          is_three_phase_panel: true,
          phase_1_entity: normalizePowerCostEntityId(config.phase_1_entity),
          phase_2_entity: normalizePowerCostEntityId(config.phase_2_entity),
          phase_3_entity: normalizePowerCostEntityId(config.phase_3_entity),
          phase_1_voltage_entity: normalizePowerCostEntityId(config.phase_1_voltage_entity),
          phase_2_voltage_entity: normalizePowerCostEntityId(config.phase_2_voltage_entity),
          phase_3_voltage_entity: normalizePowerCostEntityId(config.phase_3_voltage_entity),
          phase_1_current_entity: normalizePowerCostEntityId(config.phase_1_current_entity),
          phase_2_current_entity: normalizePowerCostEntityId(config.phase_2_current_entity),
          phase_3_current_entity: normalizePowerCostEntityId(config.phase_3_current_entity),
          power_entity: null,
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
    const period = ev.target?.dataset?.period || ev.target?.closest?.("[data-period]")?.dataset?.period;
    const moreInfoEntity =
      ev.target?.dataset?.moreInfo || ev.target?.closest?.("[data-more-info]")?.dataset?.moreInfo;

    if (period) {
      this._period = period;
      this._refreshAllHistory(true);
      this._render();
      return;
    }

    const graphToggleEntity =
      ev.target?.dataset?.graphToggle || ev.target?.closest?.("[data-graph-toggle]")?.dataset?.graphToggle;
    const collapseToggleEntity =
      ev.target?.dataset?.collapseToggle || ev.target?.closest?.("[data-collapse-toggle]")?.dataset?.collapseToggle;

    if (ev.target?.closest?.("[data-toggle]")) {
      ev.stopPropagation();
      return;
    }

    if (collapseToggleEntity && (this._config?.show_minimize || this._config?.radio_mode)) {
      ev.stopPropagation();

      if (this._config?.radio_mode) {
        const entities = this._config?.entities || [];
        const currentlyCollapsed = this._collapsedCards[collapseToggleEntity] !== false;

        if (currentlyCollapsed) {
          const nextState = {};
          entities.forEach((cfg) => {
            const cfgId = this._rowIdFromConfig(cfg);
            if (cfgId && cfg.allow_minimize !== false) {
              nextState[cfgId] = true;
            }
          });
          nextState[collapseToggleEntity] = false;
          this._collapsedCards = nextState;
        } else {
          this._collapsedCards[collapseToggleEntity] = true;
        }
      } else {
        this._collapsedCards[collapseToggleEntity] = !this._collapsedCards[collapseToggleEntity];
      }

      this._saveUiState();
      this._render();
      return;
    }

    if (graphToggleEntity) {
      ev.stopPropagation();
      const nextExpanded = !this._expandedGraphs[graphToggleEntity];
      this._expandedGraphs[graphToggleEntity] = nextExpanded;
      this._graphOpenAnimEntity = nextExpanded ? graphToggleEntity : null;
      this._graphCloseAnimEntity = nextExpanded ? null : graphToggleEntity;
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
    const toggleEntity =
      ev.target?.dataset?.toggle || ev.target?.closest?.("[data-toggle]")?.dataset?.toggle;
    if (!toggleEntity || !this._hass) return;

    const stateObj = this._hass.states?.[toggleEntity];
    const checked =
      typeof ev.target?.checked === "boolean"
        ? ev.target.checked
        : !this._isOnState(stateObj?.state);

    const domain = String(toggleEntity).split(".")[0];
    const service = checked ? "turn_on" : "turn_off";

    if (["fan", "light", "switch", "climate"].includes(domain)) {
      this._hass.callService(domain, service, { entity_id: toggleEntity });
    } else {
      this._hass.callService("homeassistant", service, { entity_id: toggleEntity });
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
    if (period === "month") return this._t("period_month");
    if (period === "week") return this._t("period_week");
    return this._t("period_day");
  }

  _getLanguage() {
    return normalizePowerCostLanguage(this._config?.language || "he");
  }

  _t(key, vars = {}) {
    return powerCostTranslate(this._getLanguage(), key, vars);
  }

  _isOnState(state) {
    return ["on", "playing", "heat", "cool", "fan_only", "dry"].includes(String(state));
  }

  _parseNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  _entityNumericState(entityId) {
    const normalized = normalizePowerCostEntityId(entityId);
    if (!normalized || !this._hass?.states?.[normalized]) return undefined;
    return this._parseNumber(this._hass.states[normalized].state);
  }

  _entityAttributeNumber(entityId, keys = []) {
    const normalized = normalizePowerCostEntityId(entityId);
    if (!normalized || !this._hass?.states?.[normalized]) return undefined;
    const attrs = this._hass.states[normalized]?.attributes || {};
    for (const key of keys) {
      const parsed = this._parseNumber(attrs[key]);
      if (parsed != null) return parsed;
    }
    return undefined;
  }

  _phaseMetricValue(entityCfg, phaseNum, metric, phasePowerEntityId) {
    const explicitEntityId = entityCfg[`phase_${phaseNum}_${metric}_entity`];
    const explicitValue = this._entityNumericState(explicitEntityId);
    if (explicitValue != null) return explicitValue;

    const attributeKeys = metric === "voltage"
      ? ["voltage", "Voltage", "line_voltage", "phase_voltage", "rms_voltage", "v"]
      : ["current", "Current", "line_current", "phase_current", "rms_current", "amps", "ampere", "a"];
    return this._entityAttributeNumber(phasePowerEntityId, attributeKeys);
  }

  _phasePowerValue(entityId) {
    const parsed = this._entityNumericState(entityId);
    return parsed != null ? parsed : 0;
  }

  _threePhasePower(entityCfg) {
    const l1EntityId = normalizePowerCostEntityId(entityCfg.phase_1_entity);
    const l2EntityId = normalizePowerCostEntityId(entityCfg.phase_2_entity);
    const l3EntityId = normalizePowerCostEntityId(entityCfg.phase_3_entity);
    const l1 = this._phasePowerValue(l1EntityId);
    const l2 = this._phasePowerValue(l2EntityId);
    const l3 = this._phasePowerValue(l3EntityId);

    return {
      l1,
      l2,
      l3,
      l1Voltage: this._phaseMetricValue(entityCfg, 1, "voltage", l1EntityId),
      l2Voltage: this._phaseMetricValue(entityCfg, 2, "voltage", l2EntityId),
      l3Voltage: this._phaseMetricValue(entityCfg, 3, "voltage", l3EntityId),
      l1Current: this._phaseMetricValue(entityCfg, 1, "current", l1EntityId),
      l2Current: this._phaseMetricValue(entityCfg, 2, "current", l2EntityId),
      l3Current: this._phaseMetricValue(entityCfg, 3, "current", l3EntityId),
      total: l1 + l2 + l3,
    };
  }

  _entityPower(entityCfg) {
    if (entityCfg.is_three_phase) {
      return this._threePhasePower(entityCfg).total;
    }
    const powerEntityId = normalizePowerCostEntityId(entityCfg.power_entity);
    if (powerEntityId && this._hass?.states?.[powerEntityId]) {
      const sensorState = this._hass.states[powerEntityId];
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
    const entityId = normalizePowerCostEntityId(entityCfg.entity);
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
    const entityId = normalizePowerCostEntityId(entityCfg.entity);
    if (!entityId) {
      const isEntitylessThreePhase =
        entityCfg.is_three_phase_panel === true ||
        entityCfg.is_three_phase === true ||
        hasPowerCostPhaseEntities(entityCfg);
      if (!isEntitylessThreePhase) {
        return 0;
      }

      const nowTotalPower = this._threePhasePower(entityCfg).total;
      if (!(nowTotalPower > 0)) {
        return 0;
      }

      const start = this._getPeriodStart(this._period);
      const end = new Date();
      return Math.max(0, end - start);
    }

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
      const dayLabel = days === 1 ? this._t("duration_day_singular") : this._t("duration_day_plural");
      return `${days} ${dayLabel} ${h}:${m}`;
    }

    return `${h}:${m}`;
  }

  _formatMoney(value, currency) {
    const v = Number(value).toFixed(2);
    return `<span dir="ltr">${currency} ${v}</span>`;
  }

  _formatPhaseMetric(value, unit, decimals = 0) {
    if (value == null || !Number.isFinite(value)) return `—${unit}`;
    if (decimals > 0) return `${Number(value).toFixed(decimals)}${unit}`;
    return `${Math.round(value)}${unit}`;
  }


  _getDisplayIcon(icon, isOn) {
    const safeIcon = normalizePowerCostIcon(icon) || "mdi:flash";
    if (!isOn) return safeIcon;

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

    return onMap[safeIcon] || safeIcon;
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
    const buttonLabel = expanded ? this._t("graph_hide") : this._t("graph_show");
    return `<button type="button" class="graph-toggle-btn" data-graph-toggle="${entityId}">${buttonLabel}</button>`;
  }

  _renderPremiumGraph(entityCfg) {
    const entityId = entityCfg.entity;
    const expanded = !!this._expandedGraphs[entityId];

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
    const isThreePhasePanel = entityCfg.is_three_phase_panel === true;
    const sourceEntityId = normalizePowerCostEntityId(entityCfg.entity);
    const isThreePhase =
      entityCfg.is_three_phase === true || (!isThreePhasePanel && hasPowerCostPhaseEntities(entityCfg));
    const entityId = this._rowIdFromConfig(entityCfg);
    const stateObj = sourceEntityId ? this._hass?.states?.[sourceEntityId] : null;
    const phaseData =
      (isThreePhase || isThreePhasePanel) ? this._threePhasePower(entityCfg) : null;
    const onMs = this._calculateOnMs(entityCfg);
    const onHours = onMs / 3600000;
    const powerW = phaseData ? phaseData.total : this._entityPower(entityCfg);
    const pricePerKwh = this._entityPrice(entityCfg);
    const currency = this._entityCurrency(entityCfg);
    const energyKwh = powerW != null ? (powerW / 1000) * onHours : 0;
    const cost = pricePerKwh != null ? energyKwh * pricePerKwh : 0;
    const name =
      entityCfg.name ||
      stateObj?.attributes?.friendly_name ||
      (
        isThreePhasePanel
          ? this._t("row_default_panel")
          : (isThreePhase ? this._t("row_default_three_phase") : (sourceEntityId || this._t("row_default_entity")))
      );
    const icon =
      normalizePowerCostIcon(entityCfg.icon) ||
      normalizePowerCostIcon(stateObj?.attributes?.icon) ||
      "mdi:flash";
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
      isThreePhase,
      isThreePhasePanel,
      phaseData,
      sourceEntityId,
    };
  }


  _iconOptions() {
    const states = this._hass?.states || {};
    const seen = new Set();
    const icons = [];

    const addIcon = (icon) => {
      const normalized = normalizePowerCostIcon(icon);
      if (!normalized || seen.has(normalized) || !normalized.startsWith("mdi:")) return;
      seen.add(normalized);
      icons.push(normalized);
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
    const costRows = rows.filter((row) => !row.isThreePhasePanel);
    const hasCostRows = costRows.length > 0;
    const totalEnergy = rows.reduce((sum, row) => sum + row.energyKwh, 0);
    const currency = rows[0]?.currency || this._config.currency || "₪";
    const totalCost = costRows.reduce((sum, row) => sum + row.cost, 0);
    const anyDynamic = costRows.some((row) => row.isDynamicPower);
    const mostExpensive = costRows.length ? costRows.reduce((a,b)=> b.cost>a.cost?b:a) : null;
    const top3 = [...costRows].sort((a,b)=>b.cost-a.cost).slice(0,3);
    const anyError = rows.some((row) => row.error);
    const bgImage = this._resolveBackgroundImage();
    const bgOpacity = this._normalizeBackgroundOpacity(this._config?.background_opacity);
    const bgBlur = Math.max(0, Math.min(8, Number(this._config?.background_blur_removed || 0)));
    const bgSize = this._config?.background_size || "cover";
    const bgFilter = bgBlur > 0 ? `filter: blur(${bgBlur}px);` : "";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          direction: rtl;
          --pcc-radius: 18px;
          --pcc-gap: 12px;
        }

        ha-card {
          position: relative;
          overflow: hidden;
        }

        .pcc-bg-layer {
          position: absolute;
          inset: 0;
          background-image: url("${bgImage}");
          background-size: ${bgSize};
          background-position: center;
          background-repeat: no-repeat;
          opacity: ${bgOpacity};
          ${bgFilter}
          pointer-events: none;
          z-index: 0;
        }

        .pcc-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.18));
          pointer-events: none;
          z-index: 0;
        }

        .wrap {
          position: relative;
          z-index: 1;
        }

        .wrap {
          position: relative;
          z-index: 1;
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
          text-align: center;
        }

        .label {
          font-size: 14px;
          font-weight: 600;
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
            opacity: 0.9;
            filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0));
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
            filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.45));
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
            filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0));
          }
        }

        .entity-icon {
          transition: color 160ms ease, transform 160ms ease, opacity 160ms ease, filter 160ms ease;
          transform-origin: center;
          will-change: transform, opacity, filter;
        }

        .entity-icon.on {
          animation: powerCostIconPulse 1.7s ease-in-out infinite;
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
          box-sizing: border-box;
          min-width: 0;
          text-align: center;
        }

        .metric .v {
          font-size: 18px;
          font-weight: 700;
        }

        .bottom-row {
          display: grid;
          direction: ltr;
          grid-template-columns: minmax(0, calc(100% - 244px)) 220px;
          gap: 24px;
          align-items: stretch;
        }
        .bottom-row.graph-enter {
          animation: graphEnter 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .bottom-row > * {
          direction: rtl;
        }

        .graph-box {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow: hidden;
          box-sizing: border-box;
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

        .radio-btn {
          border: 1px solid var(--divider-color);
          background: transparent;
          color: var(--primary-text-color);
          border-radius: 999px;
          padding: 7px 10px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          min-width: 78px;
        }

        .row.radio {
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .row.radio.open {
          border-color: color-mix(in srgb, var(--primary-color) 28%, var(--divider-color));
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
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
          max-width: 100%;
          min-width: 0;
          height: 108px;
          display: block;
        }

        .metric-cost {
          min-width: 0;
          box-sizing: border-box;
          text-align: center;
        }
        .metric-cost.metric-cost-solo {
          width: 100%;
          max-width: none;
          margin-left: 0;
          justify-self: stretch;
        }
        .metric-cost.metric-cost-solo.cost-expand {
          animation: costExpand 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .bottom-row .metric-cost {
          width: 220px;
          min-width: 220px;
          max-width: 220px;
          margin-left: auto;
          justify-self: end;
          box-sizing: border-box;
        }

        .sub-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .three-phase-values {
          justify-content: flex-start;
          gap: 18px;
        }
        .phase-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          direction: ltr;
        }
        .phase-cards.panel-mode {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .phase-card.total {
          grid-column: 1 / -1;
        }
        .phase-card {
          border: 1px solid var(--divider-color);
          border-radius: 12px;
          padding: 10px;
          text-align: center;
          background: transparent;
        }
        .phase-card.total {
          border-color: color-mix(in srgb, var(--primary-color) 58%, var(--divider-color));
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--primary-color) 10%, transparent),
            color-mix(in srgb, var(--primary-color) 2%, transparent)
          );
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 22%, transparent);
        }
        .phase-card.total .phase-label {
          opacity: 0.88;
          font-weight: 600;
        }
        .phase-label {
          font-size: 14px;
          opacity: 0.82;
          margin-bottom: 6px;
        }
        .phase-value {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
        }
        .phase-extra {
          font-size: 10px;
          opacity: 0.66;
          margin-top: 4px;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        @keyframes graphEnter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes costExpand {
          from {
            opacity: 0.75;
            transform: scale(0.985);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bottom-row.graph-enter,
          .metric-cost.metric-cost-solo.cost-expand {
            animation: none;
          }
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
        ${bgImage ? `<div class="pcc-bg-layer"></div><div class="pcc-bg-overlay"></div>` : ""}
        <div class="wrap">
          <div class="head">
            <div class="title">${this._config.title}</div>
          </div>

          ${this._config.show_period_selector ? `
            <div class="periods">
              <button class="period-btn ${this._period === "day" ? "active" : ""}" data-period="day">${this._t("period_day")}</button>
              <button class="period-btn ${this._period === "week" ? "active" : ""}" data-period="week">${this._t("period_week")}</button>
              <button class="period-btn ${this._period === "month" ? "active" : ""}" data-period="month">${this._t("period_month")}</button>
            </div>
          ` : ""}

          ${this._config.show_total ? `
            <div class="summary">
              ${hasCostRows ? `
                <div class="box">
                  <div class="label">${this._t("summary_total_cost", { period: this._periodLabel(this._period) })}</div>
                  <div class="value">${this._formatMoney(totalCost, currency)}</div>
                  <div class="sub">${this._t("summary_entities_priced", { count: costRows.length })}</div>
                </div>
              ` : ""}
              <div class="box">
                <div class="label">${this._t("summary_total_consumption")}</div>
                <div class="value">kWh ${totalEnergy.toFixed(3)}</div>
                <div class="sub">${this._t("summary_calc_sub")}</div>
              </div>
            </div>
          ` : ""}

          ${top3.length ? `
            <div class="top-devices-title">${this._t("top_devices_title")}</div>
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
                <div class="row ${this._isRowCollapsed(row) ? "collapsed" : ""} ${this._config.radio_mode ? `radio ${this._isRowCollapsed(row) ? "" : "open"}` : ""}">
                  <div class="row-top">
                    <div class="row-title" ${row.sourceEntityId ? `data-more-info="${row.sourceEntityId}" title="${this._t("tooltip_more_info")}"` : `title="${this._t("tooltip_info")}"`}>
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
                      ${(this._config.show_graph && row.sourceEntityId && !this._isRowCollapsed(row)) ? this._renderGraphToggle(row.sourceEntityId) : ""}
                      ${(this._config.show_minimize || this._config.radio_mode) && row.allowMinimize && row.entityId ? `
                        <button type="button" class="${this._config.radio_mode ? "radio-btn" : "collapse-btn"}" data-collapse-toggle="${row.entityId}">
                          ${this._config.radio_mode
                            ? (this._isRowCollapsed(row) ? this._t("btn_open") : this._t("btn_close"))
                            : (this._collapsedCards[row.entityId] ? this._t("btn_show") : this._t("btn_minimize"))}
                        </button>
                      ` : ""}
                      ${(this._config.show_toggle && row.sourceEntityId && !row.isThreePhasePanel) ? `
                        <div class="toggle-switch-wrap" data-toggle="${row.sourceEntityId}">
                          <ha-switch
                            class="toggle-switch"
                            data-toggle="${row.sourceEntityId}"
                            aria-label="toggle ${row.name}"
                            ${row.isOn ? "checked" : ""}
                          ></ha-switch>
                        </div>
                      ` : ""}
                    </div>
                  </div>

                  ${this._isRowCollapsed(row) ? "" : `
                    ${row.isThreePhasePanel ? "" : `
                      <div class="metrics">
                        <div class="metric">
                          <div class="label">${this._t("label_active_time", { period: this._periodLabel(this._period) })}</div>
                          <div class="v">${this._formatDuration(row.onMs)}</div>
                        </div>
                        <div class="metric">
                          <div class="label">${this._t("label_power_for_calc")}</div>
                          <div class="v">${row.powerW != null ? `${row.powerW}W` : "—"}</div>
                        </div>
                        <div class="metric">
                          <div class="label">${this._t("label_consumption")}</div>
                          <div class="v">kWh ${row.energyKwh.toFixed(3)}</div>
                        </div>
                      </div>
                    `}

                    ${this._config.show_graph && row.sourceEntityId && this._expandedGraphs[row.sourceEntityId] ? `
                      <div class="bottom-row ${this._graphOpenAnimEntity === row.entityId ? "graph-enter" : ""}">
                        ${this._renderPremiumGraph(this._config.entities.find((x) => x.entity === row.sourceEntityId) || { entity: row.sourceEntityId })}
                        ${row.isThreePhasePanel ? "" : `
                          <div class="metric metric-cost">
                            <div class="label">${this._t("label_cost")}</div>
                            <div class="v">${this._formatMoney(row.cost, row.currency)}</div>
                          </div>
                        `}
                      </div>
                    ` : `
                      ${row.isThreePhasePanel ? "" : `
                        <div class="metric metric-cost metric-cost-solo ${this._graphCloseAnimEntity === row.entityId ? "cost-expand" : ""}">
                          <div class="label">${this._t("label_cost")}</div>
                          <div class="v">${this._formatMoney(row.cost, row.currency)}</div>
                        </div>
                      `}
                    `}

                    ${(row.isThreePhase || row.isThreePhasePanel) ? `
                      <div class="phase-cards ${row.isThreePhasePanel ? "panel-mode" : ""}">
                        <div class="phase-card">
                          <div class="phase-label">L1</div>
                          <div class="phase-value">${Math.round(row.phaseData?.l1 || 0)}W</div>
                          <div class="phase-extra">${this._formatPhaseMetric(row.phaseData?.l1Voltage, "V")} • ${this._formatPhaseMetric(row.phaseData?.l1Current, "A", 1)}</div>
                        </div>
                        <div class="phase-card">
                          <div class="phase-label">L2</div>
                          <div class="phase-value">${Math.round(row.phaseData?.l2 || 0)}W</div>
                          <div class="phase-extra">${this._formatPhaseMetric(row.phaseData?.l2Voltage, "V")} • ${this._formatPhaseMetric(row.phaseData?.l2Current, "A", 1)}</div>
                        </div>
                        <div class="phase-card">
                          <div class="phase-label">L3</div>
                          <div class="phase-value">${Math.round(row.phaseData?.l3 || 0)}W</div>
                          <div class="phase-extra">${this._formatPhaseMetric(row.phaseData?.l3Voltage, "V")} • ${this._formatPhaseMetric(row.phaseData?.l3Current, "A", 1)}</div>
                        </div>
                        ${(row.isThreePhase || row.isThreePhasePanel) ? `
                          <div class="phase-card total">
                            <div class="phase-label">${this._t("phase_total_consumption")}</div>
                            <div class="phase-value">${Math.round(row.powerW || 0)}W</div>
                          </div>
                        ` : ""}
                      </div>
                    ` : ""}

                    ${row.isThreePhasePanel ? "" : `
                      ${(row.isDynamicPower && !row.isThreePhase && !row.isThreePhasePanel) ? `
                        <div class="sub sub-row">
                          <span>
                            ${this._t("dynamic_based_on", { entity: this._config.entities.find((x) => x.entity === row.sourceEntityId)?.power_entity || "power_entity" })}
                          </span>
                        </div>
                      ` : ""}
                    `}

                    ${row.error ? `<div class="error">${this._t("error_history", { error: row.error })}</div>` : ""}
                  `}
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${anyDynamic ? `
            <div class="warn">
              ${this._t("warn_dynamic_power")}
            </div>
          ` : ""}

          ${anyError ? `
            <div class="warn">
              ${this._t("warn_no_history")}
            </div>
          ` : ""}

          ${this._config.show_formula && hasCostRows ? `
            <div class="footer">
              ${this._t("formula_text")}
            </div>
          ` : ""}
        </div>
      </ha-card>
    `;
    this._graphOpenAnimEntity = null;
    this._graphCloseAnimEntity = null;

    const toggleServiceCall = (toggleEntity, nextChecked) => {
      if (!toggleEntity || !this._hass) return;
      const domain = String(toggleEntity).split(".")[0];
      const service = nextChecked ? "turn_on" : "turn_off";
      if (["fan", "light", "switch", "climate"].includes(domain)) {
        this._hass.callService(domain, service, { entity_id: toggleEntity });
      } else {
        this._hass.callService("homeassistant", service, { entity_id: toggleEntity });
      }
    };

    this.shadowRoot.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const toggleEntity = el.dataset.toggle;
        if (!toggleEntity || !this._hass) return;
        const isCurrentlyOn = this._isOnState(this._hass.states?.[toggleEntity]?.state);
        toggleServiceCall(toggleEntity, !isCurrentlyOn);
      });
    });

    this.shadowRoot.querySelectorAll("ha-switch[data-toggle]").forEach((el) => {
      const handler = (ev) => {
        ev.stopPropagation();
        const toggleEntity = el.dataset.toggle;
        if (!toggleEntity || !this._hass) return;
        const nextChecked =
          typeof ev.detail?.value === "boolean"
            ? ev.detail.value
            : !this._isOnState(this._hass.states?.[toggleEntity]?.state);
        toggleServiceCall(toggleEntity, nextChecked);
      };

      el.addEventListener("change", handler);
      el.addEventListener("value-changed", handler);
      el.addEventListener("click", (ev) => ev.stopPropagation());
    });

    setTimeout(() => {
      const closePicker = (ev) => {
        if (!this.contains(ev.target)) {
          this._activeIconPickerIndex = null;
          document.removeEventListener("click", closePicker, true);
          this._render();
        }
      };
      document.addEventListener("click", closePicker, true);
    }, 0);
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
