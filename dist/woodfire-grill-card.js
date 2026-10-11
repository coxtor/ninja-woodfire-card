/**
 * woodfire-grill-card
 *
 * Companion Lovelace card for the Ninja Woodfire Home Assistant
 * integration. Vanilla web component, no build step, no dependencies.
 *
 * Config:
 *   type: custom:woodfire-grill-card
 *   dsn: <your grill's DSN>   (optional with a single grill)
 */

const VERSION = "0.17.0";
const INTEGRATION_PLATFORM = "ninja_woodfire";
console.info(
  `%c WOODFIRE-GRILL-CARD %c ${VERSION} `,
  "color:white;background:#e74c3c;padding:2px 4px;border-radius:3px 0 0 3px",
  "color:white;background:#444;padding:2px 4px;border-radius:0 3px 3px 0"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtTime = (sec) => {
  if (sec == null || isNaN(sec) || sec < 0) return "—";
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ---------------------------------------------------------------------------
// Translations
//
// The card follows the language the user has chosen in Home Assistant. Each
// language is plain data, so adding one means adding a block below — no code
// changes. Anything a block leaves out falls back to English, which makes
// partial translations safe to contribute.
//
// Keys are the firmware's own state/mode names. Both the spaced and
// underscored spellings appear in the wild, so both are listed.
// ---------------------------------------------------------------------------

const TRANSLATIONS = {
  en: {
    state: {
      idle: "Ready",
      preheat: "Preheating",
      preheating: "Preheating",
      start: "Starting",
      ignition: "Igniting",
      // `heat` is the active cook phase (firmware holding the setpoint), not
      // the preheat ramp — label it as cooking so it is not mistaken for
      // preheat after a skip.
      heat: "Cooking",
      cooking: "Cooking",
      cook: "Cooking",
      rest: "Resting",
      resting: "Resting",
      flip: "Flip food",
      flip_food: "Flip food",
      insert_food: "Add food",
      "insert food": "Add food",
      get_food: "Remove food",
      "get food": "Remove food",
      done: "Done",
      error: "Error",
      "lid open": "Lid open",
      lid_open: "Lid open",
      unknown: "Unknown",
      unavailable: "Unavailable",
      "powered OFF": "Off",
      powered_off: "Off",
      off: "Off",
    },
    // Sub-phases that drive the yellow advisory banner rather than the
    // main state label.
    advisory: {
      flip: "Time to flip",
      flip_food: "Time to flip",
      insert_food: "Add food",
      "insert food": "Add food",
      get_food: "Remove food",
      "get food": "Remove food",
      halftime: "Halfway",
    },
    mode: {
      grill: "Grill",
      smoker: "Smoker",
      bake: "Bake",
      roast: "Roast",
      dehydrate: "Dehydrate",
      reheat: "Reheat",
      "air crisp": "Air Crisp",
      air_crisp: "Air Crisp",
    },
    header: {
      cook: "Cook {min} min",
      endsIn: "ends in {time}",
      notLoaded: "Integration not loaded",
      disconnected: "No connection to the grill",
      off: "Grill is off \u2014 tap Power on to wake it",
      idleHint: "Put something on the grill when you start",
    },
    banner: {
      notLoaded: "Ninja Woodfire integration not loaded \u2014 check Settings \u2192 Devices & Services.",
      unreachable: "Grill unreachable \u2014 cloud connection lost.",
      unreachableShort: "Grill unreachable",
    },
    pending: { start: "Starting\u2026", power: "Waking\u2026", stop: "Stopping\u2026", skip: "Skipping\u2026" },
    button: { power: "Power on", noConnection: "No connection", start: "Start", stop: "Stop", skip: "Skip preheat" },
    temp: { grill: "Grill", air: "Air", smoke: "Smoke", lid: "Lid" },
    lid: { open: "open", closed: "closed" },
    probe: { name: "Probe {n}", target: "Probe {n} target" },
    control: {
      title: "Cook settings",
      mode: "Mode",
      heat: "Heat",
      temp: "Temp",
      duration: "Duration (min)",
      smoke: "Smoke (Woodfire)",
      skipPreheat: "Skip preheat",
    },
    progress: { preheat: "Preheating", preheatPct: "Preheating {pct}%" },
    level: { 1: "Lo", 2: "Med", 3: "Hi" },
    toast: { callFailed: "Woodfire: {service} failed ({reason})" },
  },

  de: {
    state: {
      idle: "Bereit",
      preheat: "Vorheizen",
      preheating: "Vorheizen",
      start: "Startet",
      ignition: "Z\u00fcndung",
      heat: "Grillen",
      cooking: "Grillen",
      cook: "Grillen",
      rest: "Ruhen",
      resting: "Ruhen",
      flip: "Wenden",
      flip_food: "Wenden",
      insert_food: "Essen einlegen",
      "insert food": "Essen einlegen",
      get_food: "Essen entnehmen",
      "get food": "Essen entnehmen",
      done: "Fertig",
      error: "Fehler",
      "lid open": "Deckel offen",
      lid_open: "Deckel offen",
      unknown: "Unbekannt",
      unavailable: "Nicht verf\u00fcgbar",
      "powered OFF": "Aus",
      powered_off: "Aus",
      off: "Aus",
    },
    advisory: {
      flip: "Bitte wenden",
      flip_food: "Bitte wenden",
      insert_food: "Essen einlegen",
      "insert food": "Essen einlegen",
      get_food: "Essen entnehmen",
      "get food": "Essen entnehmen",
      halftime: "Halbzeit",
    },
    mode: {
      grill: "Grillen",
      smoker: "Smoker",
      bake: "Backen",
      roast: "Braten",
      dehydrate: "D\u00f6rren",
      reheat: "Aufw\u00e4rmen",
      "air crisp": "Air Crisp",
      air_crisp: "Air Crisp",
    },
    header: {
      cook: "Garzeit {min} min",
      endsIn: "endet in {time}",
      notLoaded: "Integration nicht geladen",
      disconnected: "Keine Verbindung zum Grill",
      off: "Grill ist aus \u2014 auf Einschalten tippen zum Aufwecken",
      idleHint: "Lege etwas auf den Grill, wenn du startest",
    },
    banner: {
      notLoaded: "Ninja-Woodfire-Integration nicht geladen \u2014 Settings \u2192 Devices & Services pr\u00fcfen.",
      unreachable: "Grill nicht erreichbar \u2014 Cloud-Verbindung verloren.",
      unreachableShort: "Grill nicht erreichbar",
    },
    pending: { start: "Startet\u2026", power: "Aufwecken\u2026", stop: "Stoppt\u2026", skip: "Springt\u2026" },
    button: { power: "Einschalten", noConnection: "Keine Verbindung", start: "Start", stop: "Stopp", skip: "Vorheizen \u00fcberspringen" },
    temp: { grill: "Grill", air: "Luft", smoke: "Rauch", lid: "Deckel" },
    lid: { open: "offen", closed: "zu" },
    probe: { name: "Sonde {n}", target: "Sonde {n} Ziel" },
    control: {
      title: "Kochen einstellen",
      mode: "Modus",
      heat: "Hitze",
      temp: "Temp",
      duration: "Dauer (min)",
      smoke: "Rauch (Woodfire)",
      skipPreheat: "Vorheizen \u00fcberspringen",
    },
    progress: { preheat: "Vorheizen", preheatPct: "Vorheizen {pct}%" },
    level: { 1: "Niedrig", 2: "Mittel", 3: "Hoch" },
    toast: { callFailed: "Woodfire: {service} fehlgeschlagen ({reason})" },
  },
};

/** Which translation block to use for a Home Assistant language code. */
const pickLanguage = (hass) => {
  const raw = hass?.locale?.language || hass?.language || "en";
  const lower = String(raw).toLowerCase();
  if (TRANSLATIONS[lower]) return lower;
  // "de-DE", "en_GB" and friends fall back to the base language.
  const base = lower.split(/[-_]/)[0];
  return TRANSLATIONS[base] ? base : "en";
};

/** English overlaid with the chosen language, so gaps fall back rather than
 *  rendering a raw key. One level of nesting is all the table has. */
const stringsFor = (lang) => {
  const base = TRANSLATIONS.en;
  const over = TRANSLATIONS[lang] || {};
  const out = {};
  for (const section of Object.keys(base)) {
    out[section] = { ...base[section], ...(over[section] || {}) };
  }
  return out;
};

/** Fill {placeholders} in a translated string. */
const fill = (text, values) =>
  String(text ?? "").replace(/\{(\w+)\}/g, (_, k) =>
    values[k] === undefined ? `{${k}}` : String(values[k]));

const ICON_FOR_STATE = {
  cooking: "mdi:fire",
  cook: "mdi:fire",
  preheat: "mdi:fire-alert",
  preheating: "mdi:fire-alert",
  heat: "mdi:fire",
  rest: "mdi:timer-pause",
  resting: "mdi:timer-pause",
  done: "mdi:check-circle",
  error: "mdi:alert-circle",
  "powered OFF": "mdi:power",
  powered_off: "mdi:power",
  off: "mdi:power",
};



const COLOR_FOR_STATE = {
  idle: "var(--disabled-color)",
  preheat: "#ff9800",
  preheating: "#ff9800",
  heat: "#e74c3c",
  cooking: "#e74c3c",
  cook: "#e74c3c",
  rest: "#3498db",
  resting: "#3498db",
  done: "#4caf50",
  error: "#f44336",
  "powered OFF": "var(--disabled-color)",
  powered_off: "var(--disabled-color)",
  off: "var(--disabled-color)",
};

const ACTIVE_STATES = new Set([
  "preheat", "preheating", "start", "ignition",
  "heat", "cooking", "cook", "rest", "resting",
  "flip", "flip_food", "get food", "get_food",
  "insert food", "insert_food", "lid open", "lid_open",
]);

const SETPOINT_LEVELS = { lo: 1, med: 2, hi: 3, high: 3 };

const MODE_TRANSITION_TIMEOUT_MS = 5000;

const escapeHtml = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// ---------------------------------------------------------------------------
// Card element
// ---------------------------------------------------------------------------

class WoodfireGrillCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._renderTimer = null;
    this._tickTimer = null;
    this._lastRender = 0;
    this._built = false;
    // Language the skeleton was built with. The skeleton is built once, so a
    // language change in Home Assistant has to force a rebuild or the static
    // labels would keep the old language until a page reload.
    this._builtLang = null;
    this._lang = "en";
    this._L = stringsFor("en");
    // Cached options/attrs from last build — used to detect when we *do* need
    // to rebuild (e.g. select-options finally arrived, mode-dependent unit
    // changed). Without this the inputs would never refresh ranges/options.
    this._builtSig = "";
    // Open-state of the cook-config panel. We own this state and
    // mirror it to the DOM on every render — replaces an earlier
    // <details>-based design that had race conditions with re-renders.
    this._panelOpen = false;
    // Pending-action tracking. After a button press we keep all
    // action buttons disabled until either the grill state changes
    // (action took effect) or the watchdog timeout fires (assume the
    // command was lost). Stops the user from spamming actions during
    // the 1-3s cloud round-trip.
    this._pendingAction = null;       // "start" | "stop" | "skip" | "power" | null
    this._pendingFromState = null;     // grill_state value at click time
    this._pendingDeadline = 0;         // unix ms; pending self-clears after this
    // Mode-transition: between selecting a new mode and HA pushing
    // the new ranges/units back, the temp + duration controls are
    // momentarily mismatched. Values stay muted until the cook_temp
    // range/unit changes, the new mode is reported, or the timeout hits.
    this._modeTransitionUntil = 0;     // unix ms; values muted while now < this
    this._modeTransitionSig = "";
    this._modeTransitionTarget = null;
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    // DSN is kept as-typed; entity-resolution is case-insensitive.
    this._config = { ...config, dsn: config.dsn ? String(config.dsn) : "" };
    this._built = false;
    this._entityCache = new Map();
    this._entityRegistry = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._scheduleRender();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    // Tick the live countdown every second
    this._tickTimer = setInterval(() => this._render(), 1000);
  }

  disconnectedCallback() {
    if (this._tickTimer) clearInterval(this._tickTimer);
    if (this._renderTimer) clearTimeout(this._renderTimer);
    this._tickTimer = null;
    this._renderTimer = null;
  }

  _scheduleRender() {
    if (this._renderTimer) return;
    this._renderTimer = setTimeout(() => {
      this._renderTimer = null;
      this._render();
    }, 16);
  }

  getCardSize() {
    return 8;
  }

  // Device registry id of the configured grill. With a dsn, only a
  // device carrying that identifier / serial number matches; without
  // one, the first ninja_woodfire device is used.
  _deviceId() {
    const devices = this._hass.devices;
    if (!devices) return null;
    const dsnLow = this._config.dsn.toLowerCase();
    for (const [id, dev] of Object.entries(devices)) {
      const ids = (dev && dev.identifiers) || [];
      const ours = ids.filter(i => i && i[0] === INTEGRATION_PLATFORM);
      if (!ours.length) continue;
      if (!dsnLow) return id;
      if (ours.some(i => String(i[1]).toLowerCase() === dsnLow)
          || String(dev.serial_number || "").toLowerCase() === dsnLow) {
        return id;
      }
    }
    return null;
  }

  _findEntity(domain, key) {
    const hass = this._hass;
    if (!hass || !hass.entities) return null;
    if (this._entityRegistry !== hass.entities
        || this._deviceRegistry !== hass.devices) {
      this._entityRegistry = hass.entities;
      this._deviceRegistry = hass.devices;
      this._entityCache = new Map();
      this._deviceIdCached = this._deviceId();
    }
    const cacheKey = `${domain}.${key}`;
    if (this._entityCache.has(cacheKey)) return this._entityCache.get(cacheKey);

    const deviceId = this._deviceIdCached;
    let pick = null;
    if (deviceId || !this._config.dsn) {
      for (const [eid, ent] of Object.entries(hass.entities)) {
        if (!eid.startsWith(domain + ".")) continue;
        if (!ent || ent.platform !== INTEGRATION_PLATFORM) continue;
        if (ent.translation_key !== key) continue;
        if (deviceId && ent.device_id !== deviceId) continue;
        pick = eid;
        break;
      }
    }
    this._entityCache.set(cacheKey, pick);
    return pick;
  }

  _eid(domain, key) {
    return this._findEntity(domain, key);
  }

  _state(domain, key, fallback = null) {
    if (!this._hass) return fallback;
    const eid = this._findEntity(domain, key);
    if (!eid) return fallback;
    const e = this._hass.states[eid];
    if (!e) return fallback;
    if (e.state === "unknown" || e.state === "unavailable") return fallback;
    return e.state;
  }

  // Raw state including "unknown" / "unavailable", or null if the
  // entity doesn't exist at all (integration not loaded). Used for
  // distinguishing "grill is unreachable" from "grill is idle".
  _rawState(domain, key) {
    if (!this._hass) return null;
    const eid = this._findEntity(domain, key);
    if (!eid) return null;
    const e = this._hass.states[eid];
    return e ? e.state : null;
  }

  _num(domain, key, fallback = null) {
    const v = this._state(domain, key);
    if (v == null) return fallback;
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  _bool(domain, key) {
    return this._state(domain, key) === "on";
  }

  _attr(domain, key, attr) {
    if (!this._hass) return undefined;
    const eid = this._findEntity(domain, key);
    if (!eid) return undefined;
    const e = this._hass.states[eid];
    return e ? e.attributes[attr] : undefined;
  }

  _hassState(domain, key) {
    if (!this._hass) return null;
    const eid = this._findEntity(domain, key);
    if (!eid) return null;
    return this._hass.states[eid] || null;
  }

  _call(domain, service, data) {
    if (!this._hass) return;
    // Service calls go through the websocket. During a transient disconnect
    // the call rejects with a numeric error code (e.g. `3`). Surface the
    // failure as an HA toast and release any pending/muted UI state.
    try {
      const p = this._hass.callService(domain, service, data);
      if (p && typeof p.catch === "function") {
        p.catch(err => this._callFailed(domain, service, err));
      }
    } catch (err) {
      this._callFailed(domain, service, err);
    }
  }

  _callFailed(domain, service, err) {
    const reason = (err && (err.message || err.code)) || String(err);
    this.dispatchEvent(new CustomEvent("hass-notification", {
      detail: { message: fill(this._L.toast.callFailed, { service: `${domain}.${service}`, reason }) },
      bubbles: true,
      composed: true,
    }));
    this._pendingAction = null;
    this._pendingFromState = null;
    this._modeTransitionUntil = 0;
    this._render();
  }

  _press(key) {
    const eid = this._findEntity("button", key);
    if (!eid) {
      console.warn(`[woodfire-grill-card] no button entity for key=${key}`);
      return;
    }
    this._call("button", "press", { entity_id: eid });
  }

  _setNumber(key, value) {
    const eid = this._findEntity("number", key);
    if (!eid) return;
    this._call("number", "set_value", {
      entity_id: eid,
      value: Number(value),
    });
  }

  _setSelect(key, option) {
    const eid = this._findEntity("select", key);
    if (!eid) return;
    this._call("select", "select_option", {
      entity_id: eid,
      option,
    });
  }

  _setSwitch(key, on) {
    const eid = this._findEntity("switch", key);
    if (!eid) return;
    this._call("switch", on ? "turn_on" : "turn_off", {
      entity_id: eid,
    });
  }

  // Rendering ---------------------------------------------------------------

  _render() {
    if (!this._hass || !this._config) return;

    // Follow the user's Home Assistant language.
    const lang = pickLanguage(this._hass);
    if (lang !== this._lang) {
      this._lang = lang;
      this._L = stringsFor(lang);
    }
    if (this._built && this._builtLang !== lang) this._built = false;

    // Skeleton is built ONCE — never rebuilt. All dynamic content
    // (mode options, heat-group vs slider, slider ranges) is patched
    // in-place by `_refreshControlValues`. This guarantees the
    // <details> open-state, scroll-position, focus etc. never get reset.
    if (!this._built) {
      this._buildShadow();
      this._built = true;
      this._builtLang = lang;
    }
    // Re-apply tracked open-state to the manual toggle. We own the
    // state (no native <details>), so re-renders just mirror it back
    // to the DOM without browser/theme races.
    const panel = this.shadowRoot.querySelector("#ctl-panel");
    const toggleBtn = this.shadowRoot.querySelector("#ctl-toggle");
    if (panel) panel.hidden = !this._panelOpen;
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", String(this._panelOpen));
      toggleBtn.classList.toggle("open", this._panelOpen);
    }
    this._refreshControlValues();

    // Distinguish "integration not loaded" / "grill unreachable" from
    // "grill is idle". The integration's state-sensors all go
    // unavailable when the cloud connection is down or the entry isn't
    // loaded; that's our signal for the unavail banner.
    const rawGrillState = this._rawState("sensor", "grill_state");
    const integrationLoaded = rawGrillState != null;
    const cloudReachable = integrationLoaded && rawGrillState !== "unavailable";
    const grillState = this._state("sensor", "grill_state", "unknown");
    const cookState = this._state("sensor", "cook_state");
    // Pending-action: clear once the state has actually changed since
    // the click (or the watchdog has elapsed). Done before any UI
    // logic so the buttons re-enable on the same render.
    this._clearPendingIfTransitioned(rawGrillState);
    const cookMode = this._state("sensor", "active_mode") ||
                     this._state("select", "cook_mode", "—");
    // Prefer the integration's setpoint sensor (already rendered as
    // "Lo/Med/Hi" for grill mode); fall back to the cook_temp number
    // entity so we still show *something* when idle.
    const setpointSensorState = this._state("sensor", "setpoint");
    const setpointDisplay = setpointSensorState != null
      ? setpointSensorState
      : (this._num("number", "cook_temp") ?? null);

    let grillTemp = this._num("sensor", "grill_temp");
    let airTemp = this._num("sensor", "air_temp");
    let smokeTemp = this._num("sensor", "smoke_temp");
    const lidOpen = this._bool("binary_sensor", "lid_open");
    // Belt-and-braces stale-reading filter on top of the integration's
    // own logic. While the grill is idle / off / unknown, the cloud
    // keeps returning whatever value was last seen — mute anything
    // above ambient so the dashboard doesn't lie.
    const _grillIdle = !ACTIVE_STATES.has(String(grillState));
    if (_grillIdle) {
      if (grillTemp != null && grillTemp > 50) grillTemp = null;
      if (airTemp != null && airTemp > 50) airTemp = null;
      if (smokeTemp != null && smokeTemp > 50) smokeTemp = null;
    }

    const endIso = this._state("sensor", "end_time");
    const endTimeSec = endIso ? new Date(endIso).getTime() / 1000 : null;
    const nowSec = Date.now() / 1000;
    const remaining = endTimeSec ? endTimeSec - nowSec : null;

    const cookProgressFromSensor = this._num("sensor", "cook_progress");
    const totalSeconds = (this._num("number", "cook_duration") ?? 0) * 60;

    const isActive = grillState !== "idle" && grillState !== "unknown" &&
                     grillState !== "unavailable" &&
                     grillState !== "powered OFF" && grillState !== "powered_off";
    const isOff = grillState === "powered OFF" || grillState === "powered_off";

    const probe1Connected = this._bool("binary_sensor", "probe0_plugged_in");
    const probe2Connected = this._bool("binary_sensor", "probe1_plugged_in");

    // ----- Update header -----
    // Prefer cook_state during an active cook because it tells the
    // sub-phase (preheat / heat / cooking / rest / get_food / flip_food).
    // grill_state often just stays "cooking" for the whole session.
    const phaseState = isActive && cookState && cookState !== "none"
      ? cookState
      : grillState;
    const stateLabel = this._L.state[phaseState] || phaseState;
    const stateColor = COLOR_FOR_STATE[phaseState]
      || COLOR_FOR_STATE[grillState]
      || "var(--primary-color)";
    const stateIcon = ICON_FOR_STATE[phaseState]
      || ICON_FOR_STATE[grillState]
      || "mdi:grill";
    this._setHTML("header-icon", `<ha-icon icon="${stateIcon}" style="--mdc-icon-size:48px;color:${stateColor}"></ha-icon>`);
    this._setText("header-state", stateLabel);
    this._setStyle("header", "borderLeft", `4px solid ${stateColor}`);

    const PREHEAT_LIKE = new Set([
      "preheat", "preheating", "start", "ignition",
    ]);
    const inPreheat = PREHEAT_LIKE.has(grillState)
                      || PREHEAT_LIKE.has(cookState);

    let sub = "";
    const cookModeLabel = this._L.mode[cookMode] || cookMode;
    if (isActive && cookMode) sub += escapeHtml(cookModeLabel);
    if (isActive && setpointDisplay != null) {
      sub += sub ? " · " : "";
      // Setpoint sensor returns string ("Lo"/"Med"/"Hi") for grill mode,
      // numeric °C otherwise.
      const isLevel = typeof setpointDisplay === "string" &&
                      isNaN(parseFloat(setpointDisplay));
      const level = isLevel && SETPOINT_LEVELS[setpointDisplay.toLowerCase()];
      sub += isLevel
        ? escapeHtml(level ? this._L.level[level] : setpointDisplay)
        : `${setpointDisplay}${cookMode === "grill" ? "" : "°C"}`;
    }
    // The cook timer counts down even during preheat (firmware
    // behaviour). Showing "endet in X" + "Y%" while the food isn't
    // even in the grill is misleading, so during preheat we just
    // show the *planned* total cook duration instead.
    if (isActive && !inPreheat && cookProgressFromSensor != null) {
      sub += sub ? " · " : "";
      sub += `${cookProgressFromSensor}%`;
    }
    if (isActive && inPreheat) {
      const totalMin = Math.round(totalSeconds / 60);
      if (totalMin > 0) {
        sub += sub ? " · " : "";
        sub += fill(this._L.header.cook, { min: totalMin });
      }
    } else if (remaining != null && remaining > 0) {
      sub += sub ? " · " : "";
      sub += fill(this._L.header.endsIn, { time: fmtTime(remaining) });
    }
    if (!sub) {
      if (!integrationLoaded) {
        sub = this._L.header.notLoaded;
      } else if (!cloudReachable) {
        sub = this._L.header.disconnected;
      } else if (isOff) {
        sub = this._L.header.off;
      } else {
        sub = this._L.header.idleHint;
      }
    }
    this._setHTML("header-sub", sub);

    // ----- Advisory banner (flip / get food / insert food / halftime) -----
    let advisoryText = this._L.advisory[cookState];
    if (!advisoryText && isActive && totalSeconds > 0 && remaining != null
        && remaining > 0 && remaining <= totalSeconds / 2 && remaining > totalSeconds / 2 - 60) {
      advisoryText = this._L.advisory.halftime;
    }
    const advisoryEl = this.shadowRoot.querySelector("#advisory");
    if (advisoryEl) {
      if (advisoryText) {
        advisoryEl.textContent = advisoryText;
        advisoryEl.style.display = "flex";
      } else {
        advisoryEl.style.display = "none";
      }
    }

    // ----- Progress bar -----
    // During preheat the cook timer is silently counting down (firmware
    // does it that way), but showing a "cook progress" bar then would
    // mislead the user into thinking the food's been cooking for a while.
    // We swap the bar for a preheat indicator: pulsing fill, no countdown.
    const bar = this.shadowRoot.querySelector(".progress-bar");
    if (bar) {
      if (!isActive || remaining == null) {
        bar.style.display = "none";
      } else {
        bar.style.display = "block";
        if (inPreheat) {
          // Use the firmware-reported preheat percentage if available;
          // otherwise leave the bar full so it visually distinguishes
          // from the cook-progress bar.
          const preheatPct = this._num("sensor", "preheat_progress");
          this._setStyle("progress-fill", "width",
            preheatPct != null ? `${preheatPct}%` : "100%");
          bar.classList.add("preheat-mode");
          this._setText("progress-label",
            preheatPct != null
              ? fill(this._L.progress.preheatPct, { pct: Math.round(preheatPct) })
              : this._L.progress.preheat);
        } else {
          bar.classList.remove("preheat-mode");
          let pct = 0;
          if (cookProgressFromSensor != null) pct = cookProgressFromSensor;
          else if (totalSeconds > 0 && remaining != null) {
            pct = Math.max(0, Math.min(100,
              ((totalSeconds - remaining) / totalSeconds) * 100));
          }
          this._setStyle("progress-fill", "width", `${pct}%`);
          this._setText("progress-label",
            remaining > 0 ? fmtTime(remaining) : "");
        }
      }
    }

    // ----- Temps -----
    this._setTempCell("grill-temp", grillTemp, "°C");
    this._setTempCell("air-temp", airTemp, "°C");
    this._setTempCell("smoke-temp", smokeTemp, "°C");
    this._setText("lid-value", lidOpen ? this._L.lid.open : this._L.lid.closed);
    const lidIconEl = this.shadowRoot.querySelector("#lid-icon");
    if (lidIconEl) {
      lidIconEl.setAttribute("icon", lidOpen ? "mdi:square-rounded-outline" : "mdi:square-rounded");
      lidIconEl.style.color = lidOpen ? "#ff9800" : "#4caf50";
    }

    // ----- Probes -----
    this._renderProbe(1, probe1Connected);
    this._renderProbe(2, probe2Connected);

    // ----- Unavailable banner -----
    const banner = this.shadowRoot.querySelector("#unavail-banner");
    const bannerText = this.shadowRoot.querySelector("#unavail-text");
    if (banner) {
      if (!integrationLoaded) {
        banner.style.display = "flex";
        if (bannerText) bannerText.textContent =
          this._L.banner.notLoaded;
      } else if (!cloudReachable) {
        banner.style.display = "flex";
        if (bannerText) bannerText.textContent =
          this._L.banner.unreachable;
      } else {
        banner.style.display = "none";
      }
    }

    // ----- Action button states -----
    // The Start button morphs to a Power-on button whenever cooking
    // isn't possible — grill off, unreachable, integration unloaded.
    // Skip-preheat and Stop are hidden in those cases too.
    const startBtn = this.shadowRoot.querySelector("#btn-start");
    const startIcon = this.shadowRoot.querySelector("#btn-start-icon");
    const startLabel = this.shadowRoot.querySelector("#btn-start-label");
    const skipBtn = this.shadowRoot.querySelector("#btn-skip");
    const stopBtn = this.shadowRoot.querySelector("#btn-stop");

    const showAsPower = isOff || !cloudReachable || !integrationLoaded;
    // Power-on fires stop_cook; without a reachable grill / button
    // entity it can't do anything, so show "no connection" instead.
    const stopEntityState = this._rawState("button", "stop_cook");
    const noConnection = !cloudReachable || stopEntityState == null
                         || stopEntityState === "unavailable";
    const pending = this._pendingAction;
    // Map button → label/icon to swap in while it's the pending one.
    const PENDING_LABEL = this._L.pending;

    if (startBtn && startIcon && startLabel) {
      if (showAsPower) {
        startBtn.classList.add("is-power");
        startIcon.setAttribute("icon", noConnection ? "mdi:cloud-off-outline" : "mdi:power");
        startLabel.textContent = noConnection ? this._L.button.noConnection : this._L.button.power;
        startBtn.toggleAttribute("disabled", noConnection);
      } else {
        startBtn.classList.remove("is-power");
        startIcon.setAttribute("icon", "mdi:play");
        startLabel.textContent = this._L.button.start;
        this._setBtnDisabled("btn-start", isActive);
      }
      // Pending overrides everything: spinner + label + disable.
      if (pending === "start" || pending === "power") {
        startIcon.setAttribute("icon", "mdi:loading");
        startIcon.classList.add("spin");
        startLabel.textContent = PENDING_LABEL[pending];
      } else {
        startIcon.classList.remove("spin");
      }
    }
    if (stopBtn) {
      this._setBtnDisabled("btn-stop", !isActive);
      stopBtn.style.display = (showAsPower) ? "none" : "";
      const stopIcon = stopBtn.querySelector("ha-icon");
      if (pending === "stop") {
        if (stopIcon) {
          stopIcon.setAttribute("icon", "mdi:loading");
          stopIcon.classList.add("spin");
        }
        stopBtn.childNodes.forEach(n => {
          if (n.nodeType === 3) n.textContent = " " + PENDING_LABEL.stop;
        });
      } else {
        if (stopIcon) {
          stopIcon.setAttribute("icon", "mdi:stop");
          stopIcon.classList.remove("spin");
        }
        stopBtn.childNodes.forEach(n => {
          if (n.nodeType === 3) n.textContent = " " + this._L.button.stop;
        });
      }
    }
    if (skipBtn) {
      // Skip-preheat is always visible during an active cook — the
      // user expects to see the option. Disable it when not actually
      // in a preheat-ish phase rather than hiding (less surprising
      // than the button vanishing). `inPreheat` is computed earlier
      // in this render pass.
      skipBtn.style.display = showAsPower ? "none" : "";
      skipBtn.toggleAttribute("disabled", !inPreheat || pending != null);
      const skipIcon = skipBtn.querySelector("ha-icon");
      if (pending === "skip") {
        if (skipIcon) {
          skipIcon.setAttribute("icon", "mdi:loading");
          skipIcon.classList.add("spin");
        }
        skipBtn.childNodes.forEach(n => {
          if (n.nodeType === 3) n.textContent = " " + PENDING_LABEL.skip;
        });
      } else {
        if (skipIcon) {
          skipIcon.setAttribute("icon", "mdi:fast-forward");
          skipIcon.classList.remove("spin");
        }
        skipBtn.childNodes.forEach(n => {
          if (n.nodeType === 3) n.textContent = " " + this._L.button.skip;
        });
      }
    }
    // While any action is pending, disable ALL action buttons so the
    // user can't fire a different command on top.
    if (pending) {
      [startBtn, stopBtn, skipBtn].forEach(b => b && b.setAttribute("disabled", ""));
    }
    // Reflow the actions row so the visible buttons fill the width
    // evenly when only Start (= Power on) is shown.
    const actions = this.shadowRoot.querySelector(".actions-primary");
    if (actions) {
      const visible = [startBtn, stopBtn, skipBtn].filter(b => b && b.style.display !== "none").length;
      actions.style.gridTemplateColumns = `repeat(${visible || 1}, 1fr)`;
    }
  }

  _setTempCell(id, value, unit) {
    const cell = this.shadowRoot.querySelector(`#${id}`);
    if (!cell) return;
    const valueEl = cell.querySelector(".temp-value");
    const iconEl = cell.querySelector("ha-icon");
    if (value == null) {
      cell.classList.add("dim");
      if (valueEl) valueEl.textContent = "—";
      if (iconEl) iconEl.style.color = "var(--disabled-color)";
    } else {
      cell.classList.remove("dim");
      if (valueEl) valueEl.textContent = `${Math.round(value * 10) / 10}${unit}`;
    }
  }

  // UI labels probes 1/2; integration uses 0-indexed keys probe0_*/probe1_*.
  _renderProbe(uiIdx, connected) {
    const block = this.shadowRoot.querySelector(`#probe-${uiIdx}`);
    if (!block) return;
    if (!connected) {
      block.style.display = "none";
      return;
    }
    block.style.display = "grid";
    const k = uiIdx - 1;
    const temp = this._num("sensor", `probe${k}_temp`);
    const target = this._num("sensor", `probe${k}_setpoint`);
    const progress = this._num("sensor", `probe${k}_progress`, 0);
    const active = this._bool("binary_sensor", `probe${k}_active`);
    const pct = Math.max(0, Math.min(100, progress));
    const color = pct >= 100 ? "#4caf50" : pct >= 80 ? "#ff9800" : "#e74c3c";
    const setText = (sel, text) => {
      const el = block.querySelector(sel);
      if (el.textContent !== text) el.textContent = text;
    };
    block.querySelector(".dot").style.display = active ? "" : "none";
    setText(".probe-temp", temp != null ? `${Math.round(temp * 10) / 10}°C` : "—");
    block.querySelector(".probe-target-wrap").hidden = !target;
    setText(".probe-target", target ? `${target}°C` : "");
    setText(".probe-pct", `(${Math.round(pct)}%)`);
    const fillEl = block.querySelector(".probe-fill");
    fillEl.style.width = `${pct}%`;
    fillEl.style.background = color;
    const icon = block.querySelector("ha-icon");
    if (icon) icon.style.color = color;
  }

  _setBtnDisabled(id, disabled) {
    const btn = this.shadowRoot.querySelector(`#${id}`);
    if (!btn) return;
    if (disabled) btn.setAttribute("disabled", "");
    else btn.removeAttribute("disabled");
  }

  // Patches inputs/switches in the cook-config panel from current HA state.
  // Skips elements marked dirty so we don't yank their slider mid-drag.
  _refreshControlValues() {
    const root = this.shadowRoot;
    if (!root) return;

    if (Date.now() < this._modeTransitionUntil &&
        (this._cookTempSig() !== this._modeTransitionSig ||
         this._state("select", "cook_mode") === this._modeTransitionTarget)) {
      this._modeTransitionUntil = 0;
    }

    // Sub-renderers handle their own variant-switching and value patching.
    this._renderModeOptions();
    this._renderTempControl();
    this._renderDurationControl();

    const setSwitch = (sel, key) => {
      const el = root.querySelector(sel);
      if (!el) return;
      // Mode-aware availability: HA sets these entities to
      // `unavailable` when the current cook_mode doesn't support
      // them (e.g. cook_smoke in dehydrate). Reflect that in the UI
      // by disabling + dimming, not just hiding — the user should
      // see *why* a control is grayed out.
      const rawState = this._rawState("switch", key);
      const unavailable = rawState === "unavailable" || rawState == null;
      el.toggleAttribute("disabled", unavailable);
      // Dim the whole grid row containing this switch.
      const row = el.closest(".row") || el.previousElementSibling;
      if (row) row.classList.toggle("disabled-row", unavailable);
      // Also dim the <label> that immediately precedes the switch.
      const prev = el.previousElementSibling;
      if (prev && prev.tagName === "LABEL") {
        prev.classList.toggle("disabled-row", unavailable);
      }
      if (el.dataset.dirty === "1") return;
      const on = this._bool("switch", key);
      if (el.checked !== on) el.checked = on;
    };
    setSwitch("#ctl-smoke", "cook_smoke");
    setSwitch("#ctl-skip", "cook_skip_preheat");
    setSwitch("#ctl-probe1en", "probe0_enabled");
    setSwitch("#ctl-probe2en", "probe1_enabled");

    // Probe target-temp inputs: dim when the matching enable-switch
    // is unavailable (mode doesn't support probes at all) or off.
    const setProbeTemp = (sel, enableKey) => {
      const inp = root.querySelector(sel);
      if (!inp) return;
      const enableState = this._rawState("switch", enableKey);
      const enableOn = enableState === "on";
      const enableAvail = enableState === "on" || enableState === "off";
      inp.toggleAttribute("disabled", !enableAvail || !enableOn);
    };
    setProbeTemp("#ctl-probe1temp", "probe0_enabled");
    setProbeTemp("#ctl-probe2temp", "probe1_enabled");

    const setIfClean = (sel, value) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (el.dataset.dirty === "1") return;
      if (el.value !== String(value)) el.value = value;
    };
    const p1 = this._num("number", "probe0_target_temp");
    const p2 = this._num("number", "probe1_target_temp");
    if (p1 != null) setIfClean("#ctl-probe1temp", p1);
    if (p2 != null) setIfClean("#ctl-probe2temp", p2);
  }

  _cookTempSig() {
    const a = this._hassState("number", "cook_temp")?.attributes || {};
    return `${a.min}|${a.max}|${a.unit_of_measurement}`;
  }

  _setText(id, text) {
    const el = this.shadowRoot.querySelector(`#${id}`);
    if (el && el.textContent !== text) el.textContent = text;
  }

  _setHTML(id, html) {
    const el = this.shadowRoot.querySelector(`#${id}`);
    if (el && el.innerHTML !== html) el.innerHTML = html;
  }

  _setStyle(id, prop, value) {
    const el = this.shadowRoot.querySelector(`#${id}`);
    if (el) el.style[prop] = value;
  }

  _markPending(action) {
    // Capture the state at click time so the next poll's render can
    // detect the transition and clear the pending flag.
    this._pendingAction = action;
    this._pendingFromState = this._rawState("sensor", "grill_state");
    this._pendingDeadline = Date.now() + 10000;  // 10s watchdog
    this._render();
  }

  _clearPendingIfTransitioned(currentState) {
    // Clear when:
    //   1) state has reached the target the action was expected to
    //      produce — clearing on *any* state change is too eager
    //      because the cloud sometimes streams intermediate phases
    //      (e.g. stop briefly passes through "heat" before "idle"),
    //      and clearing on those would show stale labels for one
    //      render tick.
    //   2) watchdog deadline elapsed (assume command was lost).
    if (!this._pendingAction) return;
    if (Date.now() >= this._pendingDeadline) {
      this._pendingAction = null;
      this._pendingFromState = null;
      return;
    }

    const STOP_LIKE = new Set([
      "idle", "done", "powered OFF", "powered_off", "off",
    ]);
    const targetReached = (() => {
      switch (this._pendingAction) {
        case "start":
          return ACTIVE_STATES.has(currentState);
        case "stop":
          return STOP_LIKE.has(currentState);
        case "skip":
          // After skip-preheat the firmware moves preheat → heat/cooking.
          return currentState !== "preheat" && currentState !== "preheating"
                 && currentState != null && currentState !== this._pendingFromState;
        case "power":
          // Wake: anything that isn't powered_off / unavailable.
          return currentState != null
                 && !["powered OFF", "powered_off", "off", "unavailable"]
                      .includes(currentState);
        default:
          return false;
      }
    })();

    if (targetReached) {
      this._pendingAction = null;
      this._pendingFromState = null;
    }
  }

  _buildShadow() {
    // Static skeleton — built once, never replaced. Slots that need
    // dynamic content (mode <option>s, heat-vs-slider, slider ranges)
    // have placeholder containers (#ctl-mode, #ctl-temp-slot) that
    // _refreshControlValues fills in-place.
    const L = this._L;
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        <div id="unavail-banner" class="unavail-banner" style="display:none">
          <ha-icon icon="mdi:cloud-off-outline"></ha-icon>
          <span id="unavail-text">${L.banner.unreachableShort}</span>
        </div>
        <div id="header" class="header">
          <div id="header-icon" class="header-icon"></div>
          <div class="header-text">
            <div id="header-state" class="header-state"></div>
            <div id="header-sub" class="header-sub"></div>
          </div>
        </div>

        <div class="progress-bar" style="display:none">
          <div id="progress-fill" class="progress-fill"></div>
          <div id="progress-label" class="progress-label"></div>
        </div>

        <div id="advisory" class="advisory" style="display:none"></div>

        <div class="temps">
          <div id="grill-temp" class="temp">
            <ha-icon icon="mdi:thermometer" style="--mdc-icon-size:28px;color:#e74c3c"></ha-icon>
            <div class="temp-label">${L.temp.grill}</div>
            <div class="temp-value">—</div>
          </div>
          <div id="air-temp" class="temp">
            <ha-icon icon="mdi:thermometer-low" style="--mdc-icon-size:28px;color:#f39c12"></ha-icon>
            <div class="temp-label">${L.temp.air}</div>
            <div class="temp-value">—</div>
          </div>
          <div id="smoke-temp" class="temp">
            <ha-icon icon="mdi:smoke" style="--mdc-icon-size:28px;color:#7f8c8d"></ha-icon>
            <div class="temp-label">${L.temp.smoke}</div>
            <div class="temp-value">—</div>
          </div>
          <div class="temp">
            <ha-icon id="lid-icon" icon="mdi:square-rounded" style="--mdc-icon-size:28px"></ha-icon>
            <div class="temp-label">${L.temp.lid}</div>
            <div id="lid-value" class="temp-value">—</div>
          </div>
        </div>

        <div id="probe-1" class="probe" style="display:none">
          <ha-icon icon="mdi:thermometer-probe" style="--mdc-icon-size:24px"></ha-icon>
          <div class="probe-text">
            <div class="probe-name">${fill(L.probe.name, { n: 1 })}<span class="dot" style="display:none"></span></div>
            <div class="probe-stats"><span class="probe-temp">—</span><span class="probe-target-wrap" hidden> → <strong class="probe-target"></strong></span> <span class="probe-pct"></span></div>
          </div>
          <div class="probe-bar"><div class="probe-fill"></div></div>
        </div>
        <div id="probe-2" class="probe" style="display:none">
          <ha-icon icon="mdi:thermometer-probe" style="--mdc-icon-size:24px"></ha-icon>
          <div class="probe-text">
            <div class="probe-name">${fill(L.probe.name, { n: 2 })}<span class="dot" style="display:none"></span></div>
            <div class="probe-stats"><span class="probe-temp">—</span><span class="probe-target-wrap" hidden> → <strong class="probe-target"></strong></span> <span class="probe-pct"></span></div>
          </div>
          <div class="probe-bar"><div class="probe-fill"></div></div>
        </div>

        <div class="control">
          <button type="button" id="ctl-toggle" class="ctl-toggle" aria-expanded="false">
            <span class="summary-icon">⚙</span>
            <span class="summary-label">${L.control.title}</span>
            <span class="summary-arrow">▾</span>
          </button>
          <div id="ctl-panel" class="ctl-panel" hidden>
            <div class="ctrl-grid">
              <label>${L.control.mode}</label>
              <select id="ctl-mode"></select>

              <label id="ctl-temp-label">${L.control.heat}</label>
              <div id="ctl-temp-slot"></div>

              <label>${L.control.duration}</label>
              <div class="row">
                <input id="ctl-dur" type="range" min="1" max="720" value="30">
                <span id="ctl-dur-badge" class="badge">30m</span>
              </div>

              <label>${L.control.smoke}</label>
              <ha-switch id="ctl-smoke"></ha-switch>

              <label>${L.control.skipPreheat}</label>
              <ha-switch id="ctl-skip"></ha-switch>

              <label>${fill(L.probe.target, { n: 1 })}</label>
              <div class="row">
                <ha-switch id="ctl-probe1en"></ha-switch>
                <input id="ctl-probe1temp" type="number" min="30" max="110" value="60" class="num">
              </div>

              <label>${fill(L.probe.target, { n: 2 })}</label>
              <div class="row">
                <ha-switch id="ctl-probe2en"></ha-switch>
                <input id="ctl-probe2temp" type="number" min="30" max="110" value="60" class="num">
              </div>
            </div>
          </div>
        </div>

        <div class="actions actions-primary">
          <button id="btn-start" class="btn btn-start">
            <ha-icon id="btn-start-icon" icon="mdi:play"></ha-icon>
            <span id="btn-start-label">${L.button.start}</span>
          </button>
          <button id="btn-stop" class="btn btn-stop"><ha-icon icon="mdi:stop"></ha-icon> ${L.button.stop}</button>
          <button id="btn-skip" class="btn btn-skip"><ha-icon icon="mdi:fast-forward"></ha-icon> ${L.button.skip}</button>
        </div>
      </ha-card>
    `;

    // Wire static listeners. Listeners on the dynamically-built temp
    // input/heat-group are added in `_renderTempControl` only when that
    // sub-tree is rebuilt.
    const $ = (sel) => this.shadowRoot.querySelector(sel);
    const markDirty = (el) => { if (el) el.dataset.dirty = "1"; };
    // The element may have been removed from the DOM by the time the
    // 2s setTimeout fires (re-renders, custom-element disconnect,
    // etc.) — guard against that to avoid Cannot-read-of-null.
    const clearDirty = (el) => { if (el) delete el.dataset.dirty; };

    const durInput = $("#ctl-dur");
    durInput.addEventListener("input", e => {
      markDirty(e.target);
      $("#ctl-dur-badge").textContent = `${e.target.value}m`;
    });
    durInput.addEventListener("change", e => {
      e.target.blur();
      this._setNumber("cook_duration", e.target.value);
      setTimeout(() => clearDirty(e.target), 2000);
    });

    const modeSel = $("#ctl-mode");
    modeSel.addEventListener("change", e => {
      markDirty(e.target);
      e.target.blur();
      // Mode change snaps temp + duration ranges on the integration
      // side. Mute the dependent controls until the new cook_temp
      // range/unit (or the new mode) arrives, bounded by a timeout.
      this._modeTransitionUntil = Date.now() + MODE_TRANSITION_TIMEOUT_MS;
      this._modeTransitionSig = this._cookTempSig();
      this._modeTransitionTarget = e.target.value;
      this._setSelect("cook_mode", e.target.value);
      setTimeout(() => clearDirty(e.target), 2000);
      this._scheduleRender();
    });

    const wireSwitch = (sel, key) => {
      const el = $(sel);
      el.addEventListener("change", () => {
        markDirty(el);
        this._setSwitch(key, el.checked);
        setTimeout(() => clearDirty(el), 2000);
      });
    };
    wireSwitch("#ctl-smoke", "cook_smoke");
    wireSwitch("#ctl-skip", "cook_skip_preheat");
    wireSwitch("#ctl-probe1en", "probe0_enabled");
    wireSwitch("#ctl-probe2en", "probe1_enabled");

    const wireNum = (sel, key) => {
      const el = $(sel);
      el.addEventListener("input", () => markDirty(el));
      el.addEventListener("change", e => {
        this._setNumber(key, e.target.value);
        setTimeout(() => clearDirty(el), 2000);
      });
    };
    wireNum("#ctl-probe1temp", "probe0_target_temp");
    wireNum("#ctl-probe2temp", "probe1_target_temp");

    $("#btn-start").addEventListener("click", () => {
      if (this._pendingAction) return;
      // The Start button doubles as a Power-on button when the grill
      // is off / unavailable. .is-power is applied by the render loop
      // based on rawGrillState; firing stop_cook in that mode wakes
      // the grill (cloud has no dedicated wake endpoint).
      const startBtnEl = this.shadowRoot.querySelector("#btn-start");
      const wakeMode = startBtnEl?.classList.contains("is-power");
      // Closing the panel on Start is a small thing that makes the
      // tile feel "committed" — the card is now showing live state,
      // not configuration.
      this._panelOpen = false;
      const panelEl = $("#ctl-panel");
      const toggleEl = $("#ctl-toggle");
      if (panelEl) panelEl.hidden = true;
      if (toggleEl) {
        toggleEl.setAttribute("aria-expanded", "false");
        toggleEl.classList.remove("open");
      }
      this._markPending(wakeMode ? "power" : "start");
      this._press(wakeMode ? "stop_cook" : "start_cook");
    });
    $("#btn-stop").addEventListener("click", () => {
      if (this._pendingAction) return;
      this._markPending("stop");
      this._press("stop_cook");
    });
    $("#btn-skip").addEventListener("click", () => {
      if (this._pendingAction) return;
      this._markPending("skip");
      this._press("skip_preheat");
    });

    // Manual toggle for the cook-config panel. Replaces the native
    // <details> element which had reproducible races with re-renders
    // and theme shadow-DOMs.
    const toggleBtn = this.shadowRoot.querySelector("#ctl-toggle");
    const panel = this.shadowRoot.querySelector("#ctl-panel");
    if (toggleBtn && panel) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._panelOpen = !this._panelOpen;
        panel.hidden = !this._panelOpen;
        toggleBtn.setAttribute("aria-expanded", String(this._panelOpen));
        toggleBtn.classList.toggle("open", this._panelOpen);
      });
    }
  }

  // Patch the temp control (heat-group vs slider) in-place. Detects when
  // the variant needs to change (e.g. user switched mode → unit changed)
  // and replaces only the inner widget, leaving <details>, focus, scroll
  // position untouched.
  _renderTempControl() {
    const slot = this.shadowRoot.querySelector("#ctl-temp-slot");
    const labelEl = this.shadowRoot.querySelector("#ctl-temp-label");
    if (!slot || !labelEl) return;

    const inModeTransition = Date.now() < this._modeTransitionUntil;
    const tempE = this._hassState("number", "cook_temp");
    const tempMin = tempE?.attributes?.min ?? 1;
    const tempMax = tempE?.attributes?.max ?? 300;
    const tempUnit = tempE?.attributes?.unit_of_measurement || "";
    const tempVal = tempE ? parseFloat(tempE.state) : NaN;
    const isHeatLevel = !tempUnit || tempUnit.toLowerCase() === "level";

    const wantVariant = isHeatLevel ? "heat" : "slider";
    const variantChanged = slot.dataset.variant !== wantVariant;
    if (variantChanged) {
      labelEl.textContent = isHeatLevel
        ? this._L.control.heat
        : `${this._L.control.temp}${tempUnit ? ` (${tempUnit})` : ""}`;

      if (isHeatLevel) {
        slot.innerHTML = `
          <div id="ctl-heat" class="seg-group">
            <button type="button" class="seg" data-val="1">${this._L.level[1]}</button>
            <button type="button" class="seg" data-val="2">${this._L.level[2]}</button>
            <button type="button" class="seg" data-val="3">${this._L.level[3]}</button>
          </div>
        `;
        const group = slot.querySelector("#ctl-heat");
        slot.querySelectorAll("button.seg").forEach(btn => {
          btn.addEventListener("click", () => {
            if (btn.hasAttribute("disabled")) return;
            const v = parseInt(btn.dataset.val, 10);
            slot.querySelectorAll("button.seg").forEach(b =>
              b.classList.toggle("active", b === btn));
            group.dataset.dirty = "1";
            this._setNumber("cook_temp", v);
            setTimeout(() => delete group.dataset.dirty, 2000);
          });
        });
      } else {
        slot.innerHTML = `
          <div class="row">
            <input id="ctl-temp" type="range">
            <span id="ctl-temp-badge" class="badge"></span>
          </div>
        `;
        const tempInput = slot.querySelector("#ctl-temp");
        const badge = slot.querySelector("#ctl-temp-badge");
        tempInput.addEventListener("input", e => {
          e.target.dataset.dirty = "1";
          badge.textContent = `${e.target.value}${tempUnit}`;
        });
        tempInput.addEventListener("change", e => {
          e.target.blur();
          this._setNumber("cook_temp", e.target.value);
          setTimeout(() => delete e.target.dataset.dirty, 2000);
        });
      }
      slot.dataset.variant = wantVariant;
    }

    // Mute the value display while ranges are in flight after a
    // mode change. Disabled inputs prevent the user from clicking
    // a now-out-of-range value.
    slot.classList.toggle("muted", inModeTransition);

    // Patch values inside the active variant.
    if (isHeatLevel) {
      // cook_temp holds the level 1..3; fall back to the setpoint
      // sensor's "Lo"/"Med"/"Hi" if the number reports anything else.
      const level = Number.isInteger(tempVal) && tempVal >= 1 && tempVal <= 3
        ? tempVal
        : SETPOINT_LEVELS[String(this._state("sensor", "setpoint") ?? "").toLowerCase()];
      const group = slot.querySelector("#ctl-heat");
      const dirty = group && group.dataset.dirty === "1";
      slot.querySelectorAll("button.seg").forEach(btn => {
        const v = parseInt(btn.dataset.val, 10);
        if (!dirty) btn.classList.toggle("active", !inModeTransition && v === level);
        if (inModeTransition || v < tempMin || v > tempMax) {
          btn.setAttribute("disabled", "");
        } else {
          btn.removeAttribute("disabled");
        }
      });
    } else {
      const tempInput = slot.querySelector("#ctl-temp");
      const badge = slot.querySelector("#ctl-temp-badge");
      if (tempInput) {
        if (tempInput.min !== String(tempMin)) tempInput.min = tempMin;
        if (tempInput.max !== String(tempMax)) tempInput.max = tempMax;
        if (inModeTransition) {
          tempInput.setAttribute("disabled", "");
          if (badge) badge.textContent = "…";
        } else {
          tempInput.removeAttribute("disabled");
          if (tempInput.dataset.dirty !== "1" && !isNaN(tempVal)) {
            if (tempInput.value !== String(tempVal)) tempInput.value = tempVal;
            if (badge) badge.textContent = `${tempVal}${tempUnit}`;
          }
        }
      }
    }
  }

  // Patch <select> options in-place. Adds/removes/updates options without
  // recreating the element, so user's open <details> survives.
  _renderModeOptions() {
    const sel = this.shadowRoot.querySelector("#ctl-mode");
    if (!sel) return;
    const opts = this._attr("select", "cook_mode", "options") || [];
    const current = this._state("select", "cook_mode");

    // Compare existing options to wanted; rebuild only if list differs.
    const currentValues = Array.from(sel.options).map(o => o.value);
    const same = currentValues.length === opts.length &&
                 currentValues.every((v, i) => v === opts[i]);
    if (!same) {
      sel.innerHTML = opts
        .map(o => `<option value="${escapeHtml(o)}">${escapeHtml(this._L.mode[o] || o)}</option>`)
        .join("");
    }

    if (sel.dataset.dirty !== "1" && current && sel.value !== current) {
      sel.value = current;
    }
  }

  // Patch duration slider min/max in-place.
  _renderDurationControl() {
    const inp = this.shadowRoot.querySelector("#ctl-dur");
    const badge = this.shadowRoot.querySelector("#ctl-dur-badge");
    if (!inp) return;
    const inModeTransition = Date.now() < this._modeTransitionUntil;
    const e = this._hassState("number", "cook_duration");
    const dmin = e?.attributes?.min ?? 1;
    const dmax = e?.attributes?.max ?? 720;
    if (inp.min !== String(dmin)) inp.min = dmin;
    if (inp.max !== String(dmax)) inp.max = dmax;
    if (inModeTransition) {
      inp.setAttribute("disabled", "");
      if (badge) badge.textContent = "…";
      return;
    }
    inp.removeAttribute("disabled");
    const v = e ? parseFloat(e.state) : null;
    if (v != null && !isNaN(v) && inp.dataset.dirty !== "1") {
      if (inp.value !== String(v)) inp.value = v;
      if (badge && badge.textContent !== `${v}m`) badge.textContent = `${v}m`;
    }
  }

  _styles() {
    return `
      :host { display: block; }
      ha-card { padding: 0; overflow: hidden; }
      .header {
        display: flex; align-items: center; gap: 16px;
        padding: 16px;
        background: var(--card-background-color);
      }
      .header-icon { flex: 0 0 auto; }
      .header-text { flex: 1; min-width: 0; }
      .header-state {
        font-size: 1.4em; font-weight: 600; line-height: 1.2;
      }
      .header-sub {
        font-size: 0.95em; color: var(--secondary-text-color);
      }
      .progress-bar {
        position: relative; height: 22px; margin: 0 16px 12px;
        background: var(--divider-color); border-radius: 11px; overflow: hidden;
      }
      .progress-fill {
        height: 100%; background: linear-gradient(90deg, #f39c12, #e74c3c);
        transition: width 1s linear;
      }
      /* Preheat: solid orange + soft pulse so it can't be confused
         with cook progress. */
      .progress-bar.preheat-mode .progress-fill {
        background: #ff9800;
        animation: preheat-pulse 1.6s ease-in-out infinite;
      }
      @keyframes preheat-pulse {
        0%, 100% { opacity: 0.55; }
        50%      { opacity: 1; }
      }
      .progress-label {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.85em; font-weight: 600;
        color: var(--primary-text-color); mix-blend-mode: difference;
      }
      .temps {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 8px; padding: 8px 16px;
      }
      .temp {
        display: flex; flex-direction: column; align-items: center;
        padding: 8px 4px; border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .temp.dim { opacity: 0.4; }
      .temp-label {
        font-size: 0.75em; color: var(--secondary-text-color); margin-top: 2px;
      }
      .temp-value { font-size: 1em; font-weight: 600; }
      .probe {
        display: grid; grid-template-columns: auto 1fr 80px;
        gap: 12px; align-items: center; padding: 8px 16px;
      }
      .probe-name { font-weight: 500; display: flex; align-items: center; gap: 6px; }
      .dot {
        display: inline-block; width: 8px; height: 8px;
        border-radius: 50%; background: #e74c3c;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse { 50% { opacity: 0.4; } }
      .probe-stats { font-size: 0.85em; color: var(--secondary-text-color); }
      .probe-bar {
        height: 6px; background: var(--divider-color);
        border-radius: 3px; overflow: hidden;
      }
      .probe-fill { height: 100%; transition: width 0.5s, background 0.5s; }
      .control { padding: 8px 16px; border-top: 1px solid var(--divider-color); }
      .ctl-toggle {
        display: flex; align-items: center; gap: 8px;
        width: 100%; padding: 8px 0;
        background: transparent; border: none; cursor: pointer;
        color: var(--primary-text-color);
        font: inherit; font-weight: 500; text-align: left;
        user-select: none;
      }
      .ctl-toggle > * { pointer-events: none; }
      .ctl-toggle:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: 4px;
      }
      .summary-icon { font-size: 1.1em; opacity: 0.8; }
      .summary-arrow {
        margin-left: auto;
        font-size: 0.9em;
        opacity: 0.6;
        transition: transform 0.2s;
      }
      .ctl-toggle.open .summary-arrow { transform: rotate(180deg); }
      .ctl-panel[hidden] { display: none; }
      .muted { opacity: 0.5; pointer-events: none; }
      /* Mode-incompatible controls: dim the row + label so the user
         sees *why* a switch is unresponsive (e.g. smoke in dehydrate). */
      .disabled-row { opacity: 0.45; }
      .ctrl-grid input[disabled],
      .ctrl-grid select[disabled],
      .ctrl-grid ha-switch[disabled] {
        cursor: not-allowed;
      }
      .ctrl-grid {
        display: grid; grid-template-columns: max-content 1fr;
        gap: 8px 16px; align-items: center; padding: 8px 0;
      }
      .ctrl-grid label {
        font-size: 0.9em; color: var(--secondary-text-color);
      }
      .ctrl-grid select, .ctrl-grid input.num {
        padding: 6px 8px;
        border: 1px solid var(--divider-color); border-radius: 4px;
        background: var(--card-background-color); color: var(--primary-text-color);
        font-size: 0.95em; max-width: 120px;
      }
      .ctrl-grid input[type=range] { flex: 1; }
      .row { display: flex; gap: 8px; align-items: center; }
      .badge {
        min-width: 50px; text-align: right;
        font-variant-numeric: tabular-nums; font-weight: 600;
      }
      .seg-group {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 4px; padding: 2px;
        background: var(--secondary-background-color); border-radius: 8px;
      }
      .seg {
        padding: 8px 4px;
        background: transparent; color: var(--primary-text-color);
        border: none; border-radius: 6px;
        font-weight: 600; font-size: 0.9em; cursor: pointer;
        transition: background 0.15s, color 0.15s, opacity 0.15s;
      }
      .seg:hover:not([disabled]):not(.active) {
        background: var(--divider-color);
      }
      .seg.active {
        background: var(--primary-color); color: var(--text-primary-color, white);
      }
      .seg[disabled] { opacity: 0.3; cursor: not-allowed; }
      .unavail-banner {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 16px;
        background: rgba(231, 76, 60, 0.15);
        border-bottom: 1px solid rgba(231, 76, 60, 0.4);
        color: var(--primary-text-color);
        font-size: 0.9em;
      }
      .unavail-banner ha-icon {
        --mdc-icon-size: 18px;
        color: #e74c3c;
      }
      .advisory {
        margin: 0 16px 12px;
        padding: 10px 14px;
        border-radius: 8px;
        background: rgba(243, 156, 18, 0.15);
        border-left: 4px solid #f39c12;
        color: var(--primary-text-color);
        font-weight: 600;
        display: flex; align-items: center; gap: 8px;
      }
      .advisory::before {
        content: "⚠";
        font-size: 1.1em;
      }
      .actions {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        gap: 8px; padding: 12px 16px 16px;
        border-top: 1px solid var(--divider-color);
      }
      /* Start button morphs into a Power-on button when grill is off
         or unavailable. .btn-start-power swaps the green for a more
         neutral tone so the user knows it's a wake action, not a cook
         start. */
      .btn-start.is-power {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }
      .btn {
        padding: 12px 8px;
        border: none; border-radius: 8px;
        font-size: 0.95em; font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        gap: 4px;
        transition: opacity 0.2s, transform 0.1s;
      }
      .btn:active:not([disabled]) { transform: scale(0.97); }
      .btn[disabled] { opacity: 0.4; cursor: not-allowed; }
      /* Spinner for pending-action icon. mdi:loading is just a circle —
         we rotate it ourselves. */
      ha-icon.spin {
        animation: ha-icon-spin 1s linear infinite;
      }
      @keyframes ha-icon-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      /* See note on summary > *. ha-icon's shadow DOM can intercept the
         click and stop it bubbling to the <button>'s click handler. */
      .btn > * { pointer-events: none; }
      .btn-start { background: #4caf50; color: white; }
      .btn-stop { background: #e74c3c; color: white; }
      .btn-skip { background: #3498db; color: white; }
    `;
  }
}

if (!customElements.get("woodfire-grill-card")) {
  customElements.define("woodfire-grill-card", WoodfireGrillCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "woodfire-grill-card",
    name: "Ninja Woodfire Grill",
    description: "Compact Ninja Woodfire dashboard with live timer and one-tap controls.",
    preview: false,
  });
}
