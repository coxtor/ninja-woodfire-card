/**
 * Minimal DOM + Home Assistant stub for driving the real card file in Node.
 *
 * The card is a single browser file with no build step, so tests load it into
 * a VM context against the smallest DOM that its own rendering actually uses:
 * a parsed element tree (so querySelector/closest/childNodes behave), a fake
 * clock (countdown, watchdogs, dirty-timeouts) and a fake `hass` whose service
 * calls are recorded and resolved by the test.
 *
 * No dependencies — same philosophy as the product file.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));

// --- tiny DOM -------------------------------------------------------------

const VOID_TAGS = new Set(["input", "img", "br", "hr", "meta", "link", "source"]);
const RAW_TAGS = new Set(["style", "script"]);

class FText {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = text;
    this.parentNode = null;
  }
}

class ClassList {
  constructor(el) { this._el = el; this._set = new Set(); }
  add(...n) { n.forEach(x => this._set.add(x)); }
  remove(...n) { n.forEach(x => this._set.delete(x)); }
  contains(n) { return this._set.has(n); }
  toggle(n, force) {
    const on = force === undefined ? !this._set.has(n) : !!force;
    if (on) this._set.add(n); else this._set.delete(n);
    return on;
  }
  get value() { return [...this._set].join(" "); }
}

class FEl {
  constructor(tag) {
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.localName = String(tag).toLowerCase();
    this.attributes = new Map();
    this.childNodes = [];
    this.parentNode = null;
    this.classList = new ClassList(this);
    this.dataset = {};
    this.style = {};
    this.listeners = new Map();
    this._value = null;
    this.checked = false;
    this._rawHTML = null;
  }

  // structure ------------------------------------------------------------
  appendChild(node) {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  get previousElementSibling() {
    if (!this.parentNode) return null;
    const sibs = this.parentNode.children;
    const i = sibs.indexOf(this);
    return i > 0 ? sibs[i - 1] : null;
  }

  // attributes -----------------------------------------------------------
  setAttribute(name, value) {
    const v = String(value);
    this.attributes.set(name, v);
    if (name === "class") {
      this.classList._set = new Set(v.split(/\s+/).filter(Boolean));
    } else if (name.startsWith("data-")) {
      this.dataset[camel(name.slice(5))] = v;
    } else if (name === "hidden") {
      this._hidden = true;
    }
  }
  getAttribute(name) {
    if (name === "class") return this.classList.value;
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "hidden") this._hidden = false;
  }
  toggleAttribute(name, force) {
    const on = force === undefined ? !this.attributes.has(name) : !!force;
    if (on) this.setAttribute(name, ""); else this.removeAttribute(name);
    return on;
  }
  get hidden() { return !!this._hidden; }
  set hidden(v) { this._hidden = !!v; if (v) this.attributes.set("hidden", ""); else this.attributes.delete("hidden"); }
  get disabled() { return this.attributes.has("disabled"); }

  // form-ish properties ---------------------------------------------------
  get value() {
    if (this._value != null) return this._value;
    const attr = this.getAttribute("value");
    return attr == null ? "" : attr;
  }
  set value(v) { this._value = String(v); }
  get min() { const v = this.getAttribute("min"); return v == null ? "" : v; }
  set min(v) { this.setAttribute("min", v); }
  get max() { const v = this.getAttribute("max"); return v == null ? "" : v; }
  set max(v) { this.setAttribute("max", v); }
  get step() { const v = this.getAttribute("step"); return v == null ? "" : v; }
  set step(v) { this.setAttribute("step", v); }
  get options() { return this.children.filter(c => c.tagName === "OPTION"); }
  blur() {}
  focus() {}
  checkValidity() { return true; }

  // content ---------------------------------------------------------------
  get textContent() {
    return this.childNodes.map(n => n.nodeType === 3 ? n.textContent : n.textContent).join("");
  }
  set textContent(text) {
    this.childNodes = [];
    this._rawHTML = null;
    this.appendChild(new FText(String(text)));
  }
  get innerHTML() { return this._rawHTML == null ? serialize(this) : this._rawHTML; }
  set innerHTML(html) {
    this.childNodes = [];
    parseInto(String(html), this);
    this._rawHTML = String(html);
  }

  // queries ----------------------------------------------------------------
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    const out = [];
    const parts = String(sel).trim().split(/\s+/);
    const walk = (node) => {
      for (const child of node.children) {
        if (matchesChain(child, parts)) out.push(child);
        walk(child);
      }
    };
    walk(this);
    return out;
  }
  matches(sel) { return matchesCompound(this, String(sel).trim()); }
  closest(sel) {
    let n = this;
    while (n && n.nodeType === 1) {
      if (n.matches(sel)) return n;
      n = n.parentNode;
    }
    return null;
  }

  // events ------------------------------------------------------------------
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  dispatchEvent(ev) {
    ev.target = ev.target || this;
    (this.listeners.get(ev.type) || []).forEach(fn => fn(ev));
    return true;
  }
  /** Test helper: fire a listener registered by the card. */
  fire(type, extra = {}) {
    return this.dispatchEvent({ type, target: this, stopPropagation() {}, ...extra });
  }
}

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const matchesCompound = (el, compound) => {
  const tokens = compound.match(/[#.]?[\w-]+|\[[^\]]+\]/g) || [];
  return tokens.every(tok => {
    if (tok.startsWith("#")) return el.getAttribute("id") === tok.slice(1);
    if (tok.startsWith(".")) return el.classList.contains(tok.slice(1));
    if (tok.startsWith("[")) {
      const [name, value] = tok.slice(1, -1).split("=");
      if (value === undefined) {
        return el.hasAttribute(name) || el.dataset[camel(name.replace(/^data-/, ""))] !== undefined;
      }
      return el.getAttribute(name) === value.replace(/^["']|["']$/g, "");
    }
    return el.localName === tok.toLowerCase();
  });
};

const matchesChain = (el, parts) => {
  if (!matchesCompound(el, parts[parts.length - 1])) return false;
  let node = el.parentNode;
  for (let i = parts.length - 2; i >= 0; i--) {
    while (node && node.nodeType === 1 && !matchesCompound(node, parts[i])) node = node.parentNode;
    if (!node || node.nodeType !== 1) return false;
    node = node.parentNode;
  }
  return true;
};

const serialize = (el) => el.childNodes
  .map(n => n.nodeType === 3 ? n.textContent : `<${n.localName}>${serialize(n)}</${n.localName}>`)
  .join("");

function parseInto(html, parent) {
  const stack = [parent];
  const top = () => stack[stack.length - 1];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      if (i < html.length) top().appendChild(new FText(html.slice(i)));
      break;
    }
    if (lt > i) top().appendChild(new FText(html.slice(i, lt)));
    if (html.startsWith("<!--", lt)) { i = html.indexOf("-->", lt) + 3; continue; }
    let j = lt + 1, quote = null;
    while (j < html.length) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === ">") break;
      j++;
    }
    const raw = html.slice(lt + 1, j);
    i = j + 1;
    if (raw[0] === "/") { if (stack.length > 1) stack.pop(); continue; }
    const selfClose = raw.trimEnd().endsWith("/");
    const body = selfClose ? raw.trimEnd().slice(0, -1) : raw;
    const m = /^([\w-]+)([\s\S]*)$/.exec(body);
    if (!m) continue;
    const tag = m[1].toLowerCase();
    const el = new FEl(tag);
    const attrRe = /([\w:@.-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    while ((a = attrRe.exec(m[2]))) {
      el.setAttribute(a[1], a[3] ?? a[4] ?? a[5] ?? "");
    }
    top().appendChild(el);
    if (RAW_TAGS.has(tag)) {
      const close = html.indexOf(`</${tag}>`, i);
      const end = close === -1 ? html.length : close;
      el.appendChild(new FText(html.slice(i, end)));
      i = end + tag.length + 3;
      continue;
    }
    if (!selfClose && !VOID_TAGS.has(tag)) stack.push(el);
  }
}

// --- fake clock -----------------------------------------------------------

class Clock {
  constructor(start) { this.now = start; this.timers = []; this.seq = 0; }
  setTimeout(fn, ms) {
    const id = ++this.seq;
    this.timers.push({ id, at: this.now + (ms || 0), fn, repeat: 0 });
    return id;
  }
  setInterval(fn, ms) {
    const id = ++this.seq;
    this.timers.push({ id, at: this.now + (ms || 0), fn, repeat: ms || 1 });
    return id;
  }
  clear(id) { this.timers = this.timers.filter(t => t.id !== id); }
  /** Advance the clock, running every timer that comes due. */
  advance(ms) {
    const target = this.now + ms;
    for (;;) {
      const due = this.timers.filter(t => t.at <= target).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      this.now = due.at;
      if (due.repeat) due.at = this.now + due.repeat;
      else this.timers = this.timers.filter(t => t !== due);
      due.fn();
    }
    this.now = target;
  }
}

// --- card loader ----------------------------------------------------------

export function loadCard(clock) {
  const source = readFileSync(join(here, "..", "dist", "woodfire-grill-card.js"), "utf8");
  class FakeDate extends Date {
    constructor(...args) { if (!args.length) super(clock.now); else super(...args); }
    static now() { return clock.now; }
  }
  const sandbox = {
    HTMLElement: class {
      constructor() { this._events = []; }
      attachShadow() { this.shadowRoot = new FEl("shadow-root"); return this.shadowRoot; }
      addEventListener() {}
      dispatchEvent(ev) { this._events.push(ev); return true; }
    },
    CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    customElements: { define() {}, get() {} },
    window: {},
    console: { info() {}, warn() {}, log() {} },
    Date: FakeDate,
    setTimeout: (fn, ms) => clock.setTimeout(fn, ms),
    clearTimeout: (id) => clock.clear(id),
    setInterval: (fn, ms) => clock.setInterval(fn, ms),
    clearInterval: (id) => clock.clear(id),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source + "\n;globalThis.__card = WoodfireGrillCard;", sandbox);
  return sandbox.__card;
}

// --- hass stub ------------------------------------------------------------

/**
 * `entities` maps "domain.translation_key" to a state string, or to
 * { state, attributes, last_updated }. A null value means the entity does not
 * exist at all (integration not loaded / optional entity missing).
 */
export function makeHass(entities, { language = "en", deviceId = "dev1", devices } = {}) {
  const hass = {
    language,
    states: {},
    entities: {},
    devices: devices || { [deviceId]: { identifiers: [["ninja_woodfire", "DSN123"]], serial_number: "DSN123" } },
    calls: [],
    _pending: [],
    callService(domain, service, data) {
      const call = { domain, service, data };
      hass.calls.push(call);
      const p = new Promise((resolve, reject) => { call.resolve = resolve; call.reject = reject; });
      // Swallow unhandled-rejection noise; tests assert on the recorded call.
      p.catch(() => {});
      call.promise = p;
      return p;
    },
  };
  for (const [spec, value] of Object.entries(entities)) {
    if (value === null) continue;
    const [domain, key] = spec.split(".");
    const eid = `${domain}.woodfire_${key}`;
    hass.entities[eid] = { platform: "ninja_woodfire", translation_key: key, device_id: deviceId };
    const s = typeof value === "object" ? value : { state: value };
    hass.states[eid] = {
      entity_id: eid,
      state: String(s.state),
      attributes: s.attributes || {},
      last_updated: s.last_updated || null,
      last_changed: s.last_changed || s.last_updated || null,
    };
  }
  hass.set = (spec, value) => {
    const [domain, key] = spec.split(".");
    const eid = `${domain}.woodfire_${key}`;
    const s = typeof value === "object" && value !== null ? value : { state: value };
    if (!hass.entities[eid]) {
      hass.entities[eid] = { platform: "ninja_woodfire", translation_key: key, device_id: deviceId };
    }
    hass.states[eid] = {
      entity_id: eid,
      state: String(s.state),
      attributes: s.attributes || {},
      last_updated: s.last_updated || null,
      last_changed: s.last_changed || s.last_updated || null,
    };
  };
  return hass;
}

/** A grill mid-cook with the entities the card looks for. */
export const ACTIVE_COOK = {
  "sensor.grill_state": "cooking",
  "sensor.cook_state": "heat",
  "sensor.active_mode": "grill",
  "sensor.setpoint": "Hi",
  "sensor.cloud_backend": "aws",
  "sensor.grill_temp": { state: "200", attributes: { unit_of_measurement: "°C" } },
  "sensor.cook_progress": { state: "20", attributes: { phase: "cook" } },
  "button.start_cook": "unknown",
  "button.stop_cook": "unknown",
  "button.skip_preheat": "unknown",
  "select.cook_mode": { state: "grill", attributes: { options: ["grill", "smoker", "bake"] } },
  "number.cook_temp": { state: "3", attributes: { min: 1, max: 3, step: 1 } },
  "number.cook_duration": { state: "30", attributes: { min: 1, max: 720, step: 1, unit_of_measurement: "min" } },
  "number.probe0_target_temp": { state: "60", attributes: { min: 30, max: 110, step: 1 } },
  "switch.cook_smoke": "off",
  "switch.cook_skip_preheat": "off",
  "switch.probe0_enabled": "off",
};

/** Build a card bound to a fake hass; returns helpers used by the tests. */
export function makeCard(entities, { config = {}, language = "en", now = Date.parse("2026-10-18T12:00:00Z"), devices } = {}) {
  const clock = new Clock(now);
  const Card = loadCard(clock);
  const card = new Card();
  card.setConfig(config);
  const hass = makeHass(entities, { language, devices });
  card.hass = hass;
  const render = () => card._render();
  render();
  const $ = (sel) => card.shadowRoot.querySelector(sel);
  return { card, hass, clock, render, $, calls: hass.calls };
}
