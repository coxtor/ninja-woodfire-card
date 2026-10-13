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

const VERSION = "0.17.4";
const LOGO_URI = "data:image/png;base64,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";
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
      "wait lid closed before cook": "Close the lid",
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
      addfood: "Add food \u2014 open and close the lid to confirm",
      flipfood: "Time to flip",
      getfood: "Remove food",
      done: "Cooking complete",
      halftime: "Halfway",
      error: "Grill error",
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
      off: "Grill is asleep \u2014 tap Wake to bring it back",
      idleHint: "Put something on the grill when you start",
    },
    banner: {
      notLoaded: "Ninja Woodfire integration not loaded \u2014 check Settings \u2192 Devices & Services.",
      unreachable: "Grill unreachable \u2014 cloud connection lost.",
      unreachableShort: "Grill unreachable",
    },
    pending: { start: "Starting\u2026", power: "Waking\u2026", stop: "Stopping\u2026", skip: "Skipping\u2026" },
    button: { power: "Wake", noConnection: "No connection", start: "Start", stop: "Stop", skip: "Skip preheat" },
    temp: { grill: "Grill", air: "Air", smoke: "Smoke", lid: "Lid" },
    diag: { backend: "Connection", local: "Local (BLE)", cloud: "Cloud", firmware: "Firmware", dsn: "Serial", signal: "Signal" },
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
      "wait lid closed before cook": "Deckel schlie\u00dfen",
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
      addfood: "Essen einlegen \u2013 Deckel \u00f6ffnen und schlie\u00dfen zum Best\u00e4tigen",
      flipfood: "Bitte wenden",
      getfood: "Essen entnehmen",
      done: "Garvorgang abgeschlossen",
      halftime: "Halbzeit",
      error: "Grill-Fehler",
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
      off: "Grill schl\u00e4ft \u2014 auf Aufwecken tippen zum Zur\u00fcckholen",
      idleHint: "Lege etwas auf den Grill, wenn du startest",
    },
    banner: {
      notLoaded: "Ninja-Woodfire-Integration nicht geladen \u2014 Einstellungen \u2192 Ger\u00e4te & Dienste pr\u00fcfen.",
      unreachable: "Grill nicht erreichbar \u2014 Cloud-Verbindung verloren.",
      unreachableShort: "Grill nicht erreichbar",
    },
    pending: { start: "Startet\u2026", power: "Aufwecken\u2026", stop: "Stoppt\u2026", skip: "\u00dcberspringe\u2026" },
    button: { power: "Aufwecken", noConnection: "Keine Verbindung", start: "Start", stop: "Stopp", skip: "Vorheizen \u00fcberspringen" },
    temp: { grill: "Grill", air: "Luft", smoke: "Rauch", lid: "Deckel" },
    diag: { backend: "Verbindung", local: "Lokal (BLE)", cloud: "Cloud", firmware: "Firmware", dsn: "Seriennr.", signal: "Signal" },
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

const PREHEAT_LIKE = new Set(["preheat", "preheating", "start", "ignition"]);

const WAITING_STATES = new Set(["wait lid closed before cook"]);

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
    const ninjaDevices = [];
    for (const [id, dev] of Object.entries(devices)) {
      const ids = (dev && dev.identifiers) || [];
      const ours = ids.filter(i => i && i[0] === INTEGRATION_PLATFORM);
      if (!ours.length) continue;
      ninjaDevices.push(id);
      if (dsnLow && (ours.some(i => String(i[1]).toLowerCase() === dsnLow)
          || String(dev.serial_number || "").toLowerCase() === dsnLow)) {
        return id;
      }
    }
    // No dsn configured, or it matches no device (e.g. a local entry whose
    // identifier is the Bluetooth address, not the old cloud DSN): fall back to
    // the sole Ninja Woodfire device so the card still works.
    if (!dsnLow) return ninjaDevices[0] || null;
    return ninjaDevices.length === 1 ? ninjaDevices[0] : null;
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
    // Fall back to the seconds_left sensor when the firmware's end timestamp
    // is absent (e.g. the local BLE transport), so the countdown and progress
    // bar still work instead of vanishing.
    const remaining = endTimeSec ? endTimeSec - nowSec
      : (this._num("sensor", "seconds_left") ?? null);

    const cookProgressFromSensor = this._num("sensor", "cook_progress");
    const totalSeconds = (this._num("number", "cook_duration") ?? 0) * 60;

    const isActive = grillState !== "idle" && grillState !== "unknown" &&
                     grillState !== "unavailable" && !WAITING_STATES.has(grillState) &&
                     grillState !== "powered OFF" && grillState !== "powered_off";
    const isOff = grillState === "powered OFF" || grillState === "powered_off";

    const probe1Connected = this._bool("binary_sensor", "probe0_plugged_in");
    const probe2Connected = this._bool("binary_sensor", "probe1_plugged_in");

    // ----- Update header -----
    // Prefer cook_state during an active cook because it tells the
    // sub-phase (preheat / heat / cooking / rest / get_food / flip_food).
    // grill_state often just stays "cooking" for the whole session.
    // The integration knows when preheat really ended: the firmware keeps
    // cook_state at "preheat" until "add food" is acknowledged on the grill.
    const phase = this._attr("sensor", "cook_progress", "phase");
    const inPreheat = phase != null
      ? phase === "preheat"
      : PREHEAT_LIKE.has(grillState) || PREHEAT_LIKE.has(cookState);
    const prompt = this._state("sensor", "prompt");
    const staleCookState = PREHEAT_LIKE.has(cookState) && !inPreheat;
    const phaseState = isActive && cookState && cookState !== "none" && !staleCookState
      ? cookState
      : grillState;
    const stateLabel = this._L.state[phaseState] || phaseState;
    const stateColor = COLOR_FOR_STATE[phaseState]
      || COLOR_FOR_STATE[grillState]
      || "var(--primary-color)";
    const stateIcon = ICON_FOR_STATE[phaseState] || ICON_FOR_STATE[grillState];
    // A matching cook state shows its mdi glyph; otherwise fall back to the card logo.
    this._setHTML("header-icon", stateIcon
      ? `<ha-icon icon="${stateIcon}" style="--mdc-icon-size:48px;color:${stateColor}"></ha-icon>`
      : `<img src="${LOGO_URI}" alt="" style="width:48px;height:48px;display:block">`);
    this._setText("header-state", stateLabel);
    this._setStyle("header", "borderLeft", `4px solid ${stateColor}`);


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
      const rawLevel = cookMode === "grill" && [1, 2, 3].includes(Number(setpointDisplay))
        ? Number(setpointDisplay) : null;
      sub += isLevel
        ? escapeHtml(level ? this._L.level[level] : setpointDisplay)
        : rawLevel
          ? escapeHtml(this._L.level[rawLevel])
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
        sub += escapeHtml(fill(this._L.header.cook, { min: totalMin }));
      }
    } else if (remaining != null && remaining > 0) {
      sub += sub ? " · " : "";
      sub += escapeHtml(fill(this._L.header.endsIn, { time: fmtTime(remaining) }));
    }
    if (!sub) {
      if (!integrationLoaded) {
        sub = escapeHtml(this._L.header.notLoaded);
      } else if (!cloudReachable) {
        sub = escapeHtml(this._L.header.disconnected);
      } else if (isOff) {
        sub = escapeHtml(this._L.header.off);
      } else {
        sub = escapeHtml(this._L.header.idleHint);
      }
    }
    this._setHTML("header-sub", sub);

    // ----- Advisory banner (flip / get food / insert food / halftime) -----
    let advisoryText = (isActive && this._L.advisory[prompt]) || this._L.advisory[cookState];
    if (!advisoryText && isActive && totalSeconds > 0 && remaining != null
        && remaining > 0 && remaining <= totalSeconds / 2 && remaining > totalSeconds / 2 - 60) {
      advisoryText = this._L.advisory.halftime;
    }
    // Firmware error takes precedence in the advisory banner.
    const errCode = this._num("sensor", "error_code");
    if (errCode) advisoryText = `${this._L.advisory.error} (${errCode})`;
    const advisoryEl = this.shadowRoot.querySelector("#advisory");
    if (advisoryEl) {
      if (advisoryText) {
        advisoryEl.textContent = advisoryText;
        advisoryEl.style.display = "flex";
      } else {
        advisoryEl.style.display = "none";
      }
    }

    // ----- Diagnostics footer (transport / firmware / serial / signal) -----
    this._renderDiag();

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

  _renderDiag() {
    const D = this._L.diag;
    const backend = this._state("sensor", "cloud_backend");
    const parts = [];
    if (backend) {
      const name = backend === "ble" ? D.local : `${D.cloud} (${backend.toUpperCase()})`;
      parts.push([D.backend, name]);
    }
    const fw = this._state("sensor", "firmware_version");
    if (fw) parts.push([D.firmware, fw]);
    const dsn = this._state("sensor", "dsn");
    if (dsn) parts.push([D.dsn, dsn]);
    const rssi = this._num("sensor", "wifi_signal");
    if (rssi != null) parts.push([D.signal, `${rssi} dBm`]);
    const msg = this._state("sensor", "message");
    if (msg) parts.push(["", msg]);
    const el = this.shadowRoot.querySelector("#diag");
    if (!el) return;
    if (!parts.length) { el.style.display = "none"; return; }
    el.innerHTML = parts
      .map(([k, v]) => k
        ? `<span><span class="diag-k">${escapeHtml(k)}:</span> ${escapeHtml(String(v))}</span>`
        : `<span>${escapeHtml(String(v))}</span>`)
      .join("");
    el.style.display = "flex";
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
          <span id="unavail-text">${escapeHtml(L.banner.unreachableShort)}</span>
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
            <div class="temp-label">${escapeHtml(L.temp.grill)}</div>
            <div class="temp-value">—</div>
          </div>
          <div id="air-temp" class="temp">
            <ha-icon icon="mdi:thermometer-low" style="--mdc-icon-size:28px;color:#f39c12"></ha-icon>
            <div class="temp-label">${escapeHtml(L.temp.air)}</div>
            <div class="temp-value">—</div>
          </div>
          <div id="smoke-temp" class="temp">
            <ha-icon icon="mdi:smoke" style="--mdc-icon-size:28px;color:#7f8c8d"></ha-icon>
            <div class="temp-label">${escapeHtml(L.temp.smoke)}</div>
            <div class="temp-value">—</div>
          </div>
          <div class="temp">
            <ha-icon id="lid-icon" icon="mdi:square-rounded" style="--mdc-icon-size:28px"></ha-icon>
            <div class="temp-label">${escapeHtml(L.temp.lid)}</div>
            <div id="lid-value" class="temp-value">—</div>
          </div>
        </div>

        <div id="probe-1" class="probe" style="display:none">
          <ha-icon icon="mdi:thermometer-probe" style="--mdc-icon-size:24px"></ha-icon>
          <div class="probe-text">
            <div class="probe-name">${escapeHtml(fill(L.probe.name, { n: 1 }))}<span class="dot" style="display:none"></span></div>
            <div class="probe-stats"><span class="probe-temp">—</span><span class="probe-target-wrap" hidden> → <strong class="probe-target"></strong></span> <span class="probe-pct"></span></div>
          </div>
          <div class="probe-bar"><div class="probe-fill"></div></div>
        </div>
        <div id="probe-2" class="probe" style="display:none">
          <ha-icon icon="mdi:thermometer-probe" style="--mdc-icon-size:24px"></ha-icon>
          <div class="probe-text">
            <div class="probe-name">${escapeHtml(fill(L.probe.name, { n: 2 }))}<span class="dot" style="display:none"></span></div>
            <div class="probe-stats"><span class="probe-temp">—</span><span class="probe-target-wrap" hidden> → <strong class="probe-target"></strong></span> <span class="probe-pct"></span></div>
          </div>
          <div class="probe-bar"><div class="probe-fill"></div></div>
        </div>

        <div class="control">
          <button type="button" id="ctl-toggle" class="ctl-toggle" aria-expanded="false">
            <span class="summary-icon">⚙</span>
            <span class="summary-label">${escapeHtml(L.control.title)}</span>
            <span class="summary-arrow">▾</span>
          </button>
          <div id="ctl-panel" class="ctl-panel" hidden>
            <div class="ctrl-grid">
              <label>${escapeHtml(L.control.mode)}</label>
              <select id="ctl-mode"></select>

              <label id="ctl-temp-label">${escapeHtml(L.control.heat)}</label>
              <div id="ctl-temp-slot"></div>

              <label>${escapeHtml(L.control.duration)}</label>
              <div class="row">
                <input id="ctl-dur" type="range" min="1" max="720" value="30">
                <span id="ctl-dur-badge" class="badge">30m</span>
              </div>

              <label>${escapeHtml(L.control.smoke)}</label>
              <ha-switch id="ctl-smoke"></ha-switch>

              <label>${escapeHtml(L.control.skipPreheat)}</label>
              <ha-switch id="ctl-skip"></ha-switch>

              <label>${escapeHtml(fill(L.probe.target, { n: 1 }))}</label>
              <div class="row">
                <ha-switch id="ctl-probe1en"></ha-switch>
                <input id="ctl-probe1temp" type="number" min="30" max="110" value="60" class="num">
              </div>

              <label>${escapeHtml(fill(L.probe.target, { n: 2 }))}</label>
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
            <span id="btn-start-label">${escapeHtml(L.button.start)}</span>
          </button>
          <button id="btn-stop" class="btn btn-stop"><ha-icon icon="mdi:stop"></ha-icon> ${escapeHtml(L.button.stop)}</button>
          <button id="btn-skip" class="btn btn-skip"><ha-icon icon="mdi:fast-forward"></ha-icon> ${escapeHtml(L.button.skip)}</button>
        </div>
        <div id="diag" class="diag" style="display:none"></div>
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
            <button type="button" class="seg" data-val="1">${escapeHtml(this._L.level[1])}</button>
            <button type="button" class="seg" data-val="2">${escapeHtml(this._L.level[2])}</button>
            <button type="button" class="seg" data-val="3">${escapeHtml(this._L.level[3])}</button>
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
      .diag {
        margin-top: 10px; padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(255,255,255,0.1));
        font-size: 0.72rem; line-height: 1.5;
        color: var(--secondary-text-color, #9aa0a6);
        display: flex; flex-wrap: wrap; gap: 4px 12px;
      }
      .diag .diag-k { opacity: 0.7; }
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
