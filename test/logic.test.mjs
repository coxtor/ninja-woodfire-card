/**
 * Behaviour tests for the card's logic, driven against the real product file.
 *
 *   node test/logic.test.mjs
 *
 * Each test covers a reviewed defect: K01-K12 of the 2026-10-18 card review
 * (apply/draft handling, Stop and Wake availability, effective draft state,
 * units, entity metadata, state classification, countdown and labelling) and
 * N01-N06 of its follow-up (in-flight drafts, the atomic configure_cook
 * service, Stop cancelling an apply, hybrid Wake, input validation and the
 * paused countdown) and R1-R3 of the second follow-up (the seconds_left
 * countdown across a pause, the rest phase being live but not editable, and a
 * draft that outlives the cook phase it was made in).
 */
import assert from "node:assert/strict";
import { makeCard, ACTIVE_COOK } from "./harness.mjs";

let failures = 0;
const queue = [];
const test = (name, fn) => queue.push([name, fn]);
const tick = () => new Promise(r => setImmediate(r));

// --- K01: Apply is serialised, confirmed and failure-safe -------------------

const stageTwoEdits = (t) => {
  const dur = t.$("#ctl-dur");
  dur.value = "45";
  dur.fire("change");
  const smoke = t.$("#ctl-smoke");
  smoke.checked = true;
  smoke.fire("change");
  t.render();
};

test("K01 Apply sends the draft as one call and keeps it until confirmed", async () => {
  const t = makeCard(ACTIVE_COOK);
  stageTwoEdits(t);
  assert.equal(Object.keys(t.card._staged).length, 2, "both edits staged");
  assert.equal(t.calls.length, 0, "nothing sent before Apply");

  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1, "both edits travel in one command");
  assert.equal(Object.keys(t.card._staged).length, 2, "draft not cleared optimistically");
  t.render();
  assert.ok(t.$("#btn-confirm").hasAttribute("disabled"), "Apply locked while in flight");

  t.calls[0].resolve();
  await tick();
  assert.equal(t.calls.length, 1, "no follow-up calls");
  assert.equal(Object.keys(t.card._staged).length, 0, "draft cleared after success");
  t.render();
  assert.ok(!t.$("#btn-confirm").hasAttribute("disabled"), "Apply unlocked again");
});

test("K01 a failed Apply keeps the draft editable and re-submittable", async () => {
  const t = makeCard(ACTIVE_COOK);
  stageTwoEdits(t);
  t.$("#btn-confirm").fire("click");
  await tick();
  t.calls[0].reject(new Error("boom"));
  await tick();
  await tick();
  assert.equal(t.calls.length, 1, "no further call after a failure");
  assert.ok(Object.keys(t.card._staged).length >= 1, "draft survives the failure");
  t.render();
  assert.ok(!t.$("#btn-confirm").hasAttribute("disabled"), "Apply is usable again");
});

// --- K02: Stop stays reachable ---------------------------------------------

test("K02 Stop stays available while editing, while pending and when offline", () => {
  const t = makeCard(ACTIVE_COOK);
  stageTwoEdits(t);
  assert.notEqual(t.$("#btn-stop").style.display, "none", "Stop visible while staging");

  t.card._markPending("start");
  t.hass.set("sensor.grill_state", "unavailable");
  t.render();
  const stop = t.$("#btn-stop");
  assert.notEqual(stop.style.display, "none", "Stop visible when offline");
  assert.ok(!stop.hasAttribute("disabled"), "Stop enabled despite pending start/offline");

  stop.fire("click");
  assert.equal(t.calls.length, 1, "exactly one service call");
  assert.deepEqual(
    [t.calls[0].domain, t.calls[0].service, t.calls[0].data.entity_id],
    ["button", "press", "button.woodfire_stop_cook"]);
});

// --- K03: BLE wake ----------------------------------------------------------

const BLE_OFFLINE = {
  ...ACTIVE_COOK,
  "sensor.grill_state": "unavailable",
  "sensor.cloud_backend": "ble",
  "binary_sensor.ble_connected": "off",
  "button.wake": "unknown",
  "button.stop_cook": "unavailable",
};

test("K03 BLE + offline offers Wake and presses the wake entity", () => {
  const t = makeCard(BLE_OFFLINE);
  const btn = t.$("#btn-start");
  assert.ok(btn.classList.contains("is-power"), "Start morphs into Wake");
  assert.ok(!btn.hasAttribute("disabled"), "Wake is enabled");
  assert.equal(t.$("#btn-start-label").textContent, "Wake");
  btn.fire("click");
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].data.entity_id, "button.woodfire_wake");
});

test("K03 BLE without a wake entity does not fake a pending action", () => {
  const t = makeCard({ ...BLE_OFFLINE, "button.wake": null });
  const btn = t.$("#btn-start");
  assert.ok(btn.hasAttribute("disabled"), "no wake path -> disabled");
  assert.equal(t.$("#btn-start-label").textContent, "No connection");
  btn.fire("click");
  assert.equal(t.calls.length, 0, "no call");
  assert.equal(t.card._pendingAction, null, "no 10s pending state");
});

test("K03 cloud + offline keeps the useless wake action disabled", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "unavailable",
    "sensor.cloud_backend": "aws",
    "button.stop_cook": "unavailable",
  });
  const btn = t.$("#btn-start");
  assert.ok(btn.classList.contains("is-power"));
  assert.ok(btn.hasAttribute("disabled"));
});

// --- K04: staged mode and its dependent controls ----------------------------

test("K04 a staged mode mutes the controls that belong to the old mode", () => {
  const t = makeCard(ACTIVE_COOK);
  const sel = t.$("#ctl-mode");
  sel.value = "smoker";
  sel.fire("change");
  t.render();
  assert.equal(t.card._staged.cook_mode.value, "smoker", "mode staged, not sent");
  assert.equal(t.calls.length, 0);
  // The short mode-transition mute expires; the draft mode does not.
  t.clock.advance(6000);
  t.render();
  assert.equal(sel.value, "smoker", "dropdown keeps the draft mode");
  assert.ok(t.$("#ctl-dur").hasAttribute("disabled"), "duration not editable with stale range");
  assert.ok(t.$("#ctl-temp-slot").classList.contains("muted"), "temp control muted");
  t.$("#ctl-temp-slot").querySelectorAll("button.seg").forEach(b =>
    assert.ok(b.hasAttribute("disabled"), "old-mode heat levels not selectable"));
});

// --- K05: effective draft value for every temp variant ----------------------

test("K05 a staged heat level survives more than two seconds", () => {
  const t = makeCard({ ...ACTIVE_COOK, "number.cook_temp": { state: "1", attributes: { min: 1, max: 3, step: 1 } } });
  const segs = t.$("#ctl-temp-slot").querySelectorAll("button.seg");
  segs[2].fire("click");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.card._staged.cook_temp.value, 3);
  assert.ok(segs[2].classList.contains("active"), "draft level stays selected");
  assert.ok(!segs[0].classList.contains("active"), "live level is not restored");
});

test("K05 a staged celsius temp shows in slider and badge", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.active_mode": "smoker",
    "select.cook_mode": { state: "smoker", attributes: { options: ["grill", "smoker"] } },
    "number.cook_temp": { state: "120", attributes: { min: 50, max: 250, step: 1, unit_of_measurement: "°C" } },
  });
  const slider = t.$("#ctl-temp");
  slider.value = "180";
  slider.fire("change");
  t.clock.advance(3000);
  t.render();
  assert.equal(slider.value, "180", "slider keeps the draft");
  assert.equal(t.$("#ctl-temp-badge").textContent, "180°C", "badge follows the draft");

  t.$("#btn-cancel").fire("click");
  t.render();
  assert.equal(slider.value, "120", "cancel restores live");
  assert.equal(t.$("#ctl-temp-badge").textContent, "120°C");
});

// --- K06: probe enable + target in one draft --------------------------------

test("K06 enabling a probe makes its target editable right away", () => {
  const t = makeCard(ACTIVE_COOK);
  const sw = t.$("#ctl-probe1en");
  sw.checked = true;
  sw.fire("change");
  t.render();
  assert.ok(!t.$("#ctl-probe1temp").hasAttribute("disabled"),
    "target input follows the staged enable");
});

// --- K07: temperature units -------------------------------------------------

test("K07 sensor units are rendered, not assumed to be celsius", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_temp": { state: "212", attributes: { unit_of_measurement: "°F" } },
  });
  assert.equal(t.$("#grill-temp").querySelector(".temp-value").textContent, "212°F");
});

test("K07 the idle stale-reading filter normalises to celsius", () => {
  const idle = { ...ACTIVE_COOK, "sensor.grill_state": "idle", "sensor.cook_state": "none" };
  const warm = makeCard({ ...idle, "sensor.grill_temp": { state: "70", attributes: { unit_of_measurement: "°F" } } });
  assert.equal(warm.$("#grill-temp").querySelector(".temp-value").textContent, "70°F",
    "70 °F is room temperature, not a stale cook reading");
  const hot = makeCard({ ...idle, "sensor.grill_temp": { state: "212", attributes: { unit_of_measurement: "°F" } } });
  assert.equal(hot.$("#grill-temp").querySelector(".temp-value").textContent, "—",
    "212 °F is stale and gets muted");
});

// --- K08: entity metadata ---------------------------------------------------

test("K08 sliders and probe inputs take min/max/step from their entity", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "number.cook_duration": { state: "30", attributes: { min: 10, max: 600, step: 10 } },
    "number.probe0_target_temp": { state: "60", attributes: { min: 20, max: 95, step: 5 } },
  });
  assert.equal(t.$("#ctl-dur").step, "10");
  assert.equal(t.$("#ctl-dur").min, "10");
  const probe = t.$("#ctl-probe1temp");
  assert.equal(probe.min, "20");
  assert.equal(probe.max, "95");
  assert.equal(probe.step, "5");
});

test("K08 an empty probe target is rejected instead of sending 0", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "idle",
    "sensor.cook_state": "none",
    "switch.probe0_enabled": "on",
  });
  const probe = t.$("#ctl-probe1temp");
  probe.value = "";
  probe.fire("change");
  assert.equal(t.calls.length, 0, "no number.set_value for an empty field");
});

// --- K09: state classification ----------------------------------------------

const classify = (state) => {
  const t = makeCard({ ...ACTIVE_COOK, "sensor.grill_state": state, "sensor.cook_state": "none" });
  return { active: t.card._active, power: t.$("#btn-start").classList.contains("is-power"), t };
};

test("K09 off / done / unknown states are not treated as a running cook", () => {
  assert.equal(classify("off").active, false, "off is not active");
  assert.equal(classify("off").power, true, "off offers Wake");
  assert.equal(classify("powered OFF").active, false);
  assert.equal(classify("done").active, false, "done is not a running cook");
  assert.equal(classify("brand new firmware state").active, false,
    "unknown states are not assumed to be cooking");
  assert.equal(classify("cooking").active, true);
  assert.equal(classify("lid open").active, true);
  assert.equal(classify("wait lid closed before cook").active, false);
});

// --- K10: countdown and preheat bar -----------------------------------------

const COUNTDOWN = {
  ...ACTIVE_COOK,
  "sensor.seconds_left": { state: "120", last_updated: "2026-10-18T12:00:00Z" },
};

test("K10 the seconds_left fallback keeps ticking between polls", () => {
  const t = makeCard(COUNTDOWN);
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00");
});

test("K10 a paused phase does not extrapolate the countdown", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.grill_state": "lid open", "sensor.cook_state": "lid open" });
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
});

test("a resting probe's Rest countdown keeps ticking, unlike an ordinary 'get food' pause", () => {
  // "get food" is overloaded: usually a genuine pause (no real countdown
  // running), but also the grill-wide label for a probe's 300s post-target
  // Rest window, which does have a live countdown - freezing that one would
  // look like a stuck timer instead of the smooth Rest experience the
  // hardware itself gives.
  const t = makeCard({
    ...COUNTDOWN,
    "sensor.grill_state": "get food",
    "sensor.cook_state": "get food",
    "sensor.probe1_state": "resting",
  });
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00");
});

test("an ordinary 'get food' pause with no resting probe still freezes the countdown", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.grill_state": "get food", "sensor.cook_state": "get food" });
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
});

test("K10 preheat progress shows a bar without a remaining time", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "preheat",
    "sensor.cook_state": "preheat",
    "sensor.cook_progress": { state: "0", attributes: { phase: "preheat" } },
    "sensor.preheat_progress": "40",
  });
  const bar = t.card.shadowRoot.querySelector(".progress-bar");
  assert.notEqual(bar.style.display, "none", "preheat bar is shown");
  assert.equal(t.card.shadowRoot.querySelector("#progress-fill").style.width, "40%");
});

// --- a timerless probe-driven cook shows probe progress, not a hidden bar ---

test("a probe-driven cook with no grill timer shows the probe's own progress", () => {
  // The integration deliberately leaves the timer unset for this case (see
  // coordinator.py's _real_duration_seen / timerless_probe_cook) rather than
  // fake one - remaining stays null here same as plain ACTIVE_COOK.
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.cook_progress": null,
    "binary_sensor.probe0_active": "on",
    "sensor.probe0_progress": "35",
  });
  const bar = t.card.shadowRoot.querySelector(".progress-bar");
  assert.notEqual(bar.style.display, "none", "probe progress bar is shown");
  assert.equal(t.card.shadowRoot.querySelector("#progress-fill").style.width, "35%");
  assert.equal(t.$("#progress-label").textContent, "Probe 35% to target");
});

test("a cook with neither a timer nor an active probe hides the progress bar", () => {
  const t = makeCard({ ...ACTIVE_COOK, "sensor.cook_progress": null });
  const bar = t.card.shadowRoot.querySelector(".progress-bar");
  assert.equal(bar.style.display, "none");
});

test("a probe that already hit its target hides the glance progress bar, not a stale percentage", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.cook_progress": null,
    "binary_sensor.probe0_active": "on",
    "sensor.probe0_progress": "0",
    "sensor.probe0_state": "get_food",
  });
  const bar = t.card.shadowRoot.querySelector(".progress-bar");
  assert.equal(bar.style.display, "none");
});

test("a finished probe hides its own row's percent and bar instead of showing 0%", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
    "binary_sensor.probe0_active": "on",
    "sensor.probe0_temp": { state: "42", attributes: { unit_of_measurement: "°C" } },
    "sensor.probe0_setpoint": { state: "42", attributes: { unit_of_measurement: "°C" } },
    "sensor.probe0_progress": "0",
    "sensor.probe0_state": "get_food",
  });
  assert.ok(t.$("#probe-1 .probe-pct").hidden);
  assert.ok(t.$("#probe-1 .probe-bar").hidden);
});

test("a cooking probe still shows its percent and bar", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
    "binary_sensor.probe0_active": "on",
    "sensor.probe0_temp": { state: "30", attributes: { unit_of_measurement: "°C" } },
    "sensor.probe0_setpoint": { state: "42", attributes: { unit_of_measurement: "°C" } },
    "sensor.probe0_progress": "71",
    "sensor.probe0_state": "cooking",
  });
  assert.ok(!t.$("#probe-1 .probe-pct").hidden);
  assert.ok(!t.$("#probe-1 .probe-bar").hidden);
});

// --- K11: explicit device selection -----------------------------------------

test("K11 a BLE grill can be selected by its bluetooth address", () => {
  const devices = {
    cloudDev: { identifiers: [["ninja_woodfire", "DSN123"]], serial_number: "DSN123" },
    bleDev: {
      identifiers: [["ninja_woodfire", "AA:BB:CC:DD:EE:FF"]],
      connections: [["bluetooth", "AA:BB:CC:DD:EE:FF"]],
    },
  };
  const t = makeCard(ACTIVE_COOK, { config: { dsn: "aa:bb:cc:dd:ee:ff" }, devices });
  assert.equal(t.card._deviceId(), "bleDev");
});

// --- K12: accessible names --------------------------------------------------

test("K12 every input has a programmatic label", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "number.cook_temp": { state: "120", attributes: { min: 50, max: 250, step: 1, unit_of_measurement: "°C" } },
  });
  const root = t.card.shadowRoot;
  assert.ok(root.querySelector("label[for=ctl-mode]"), "mode select has a label");
  assert.ok(root.querySelector("label[for=ctl-dur]"), "duration slider has a label");
  assert.equal(root.querySelector("#ctl-temp-label").getAttribute("for"), "ctl-temp",
    "temp slider label points at the slider");
  for (const sel of ["#ctl-smoke", "#ctl-skip", "#ctl-probe1en", "#ctl-probe2en",
                     "#ctl-probe1temp", "#ctl-probe2temp"]) {
    const el = root.querySelector(sel);
    assert.ok((el.getAttribute("aria-label") || "").trim(), `${sel} has an aria-label`);
  }
});

// --- N01: edits made while an Apply is in flight -----------------------------

test("N01 an edit made during an in-flight Apply is not swallowed", async () => {
  const t = makeCard(ACTIVE_COOK);
  const dur = t.$("#ctl-dur");
  dur.value = "45";
  dur.fire("change");
  t.render();
  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1, "apply is in flight");
  assert.equal(t.calls[0].data.duration, 45, "the staged value was sent");

  dur.value = "55";
  dur.fire("change");
  assert.equal(t.card._staged.cook_duration.value, 55, "the new edit is drafted");

  t.calls[0].resolve();
  await tick();
  assert.ok(t.card._staged.cook_duration, "the newer draft survives the old apply");
  assert.equal(t.card._staged.cook_duration.value, 55);

  t.render();
  assert.notEqual(t.$("#btn-confirm").style.display, "none", "Apply still offered");
  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 2);
  assert.equal(t.calls[1].data.duration, 55, "the newer value is sent");
});

test("N01 a field edited during an apply of another field survives", async () => {
  const t = makeCard(ACTIVE_COOK);
  const dur = t.$("#ctl-dur");
  dur.value = "45";
  dur.fire("change");
  t.render();
  t.$("#btn-confirm").fire("click");
  await tick();
  const smoke = t.$("#ctl-smoke");
  smoke.checked = true;
  smoke.fire("change");
  t.calls[0].resolve();
  await tick();
  assert.equal(t.card._staged.cook_smoke.value, true, "second field kept as draft");
  assert.ok(!t.card._staged.cook_duration, "the applied field is cleared");
});

// --- N02: one atomic configure_cook call ------------------------------------

test("N02 probe enable + target go out as a single configure_cook", async () => {
  const t = makeCard(ACTIVE_COOK);
  const sw = t.$("#ctl-probe1en");
  sw.checked = true;
  sw.fire("change");
  t.render();
  const inp = t.$("#ctl-probe1temp");
  inp.value = "75";
  inp.fire("change");
  t.render();

  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1, "exactly one service call");
  const call = t.calls[0];
  assert.equal(call.domain, "ninja_woodfire");
  assert.equal(call.service, "configure_cook");
  assert.deepEqual({ ...call.data }, {
    device_id: "dev1", probe_0_enabled: true, probe_0_target: 75,
  }, "only the changed fields, never the old target");
  call.resolve();
  await tick();
  assert.equal(Object.keys(t.card._staged).length, 0, "draft cleared after success");
});

test("N02 temp, duration and smoke apply in one call", async () => {
  const t = makeCard(ACTIVE_COOK);
  t.$("#ctl-temp-slot").querySelectorAll("button.seg")[1].fire("click");
  const dur = t.$("#ctl-dur");
  dur.value = "50";
  dur.fire("change");
  const smoke = t.$("#ctl-smoke");
  smoke.checked = true;
  smoke.fire("change");
  t.render();

  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1);
  assert.deepEqual({ ...t.calls[0].data }, {
    device_id: "dev1", temp: 2, duration: 50, smoke: true,
  }, "duration in minutes, no unchanged fields");
});

test("N02 a failed configure_cook keeps the whole draft", async () => {
  const t = makeCard(ACTIVE_COOK);
  stageTwoEdits(t);
  t.$("#btn-confirm").fire("click");
  await tick();
  t.calls[0].reject(new Error("boom"));
  await tick();
  await tick();
  assert.equal(t.calls.length, 1, "no retry storm");
  assert.equal(Object.keys(t.card._staged).length, 2, "the complete draft survives");
});

test("N02 a staged mode is applied with the values that depend on it", async () => {
  const t = makeCard(ACTIVE_COOK);
  const sel = t.$("#ctl-mode");
  sel.value = "smoker";
  sel.fire("change");
  t.render();
  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1);
  assert.deepEqual({ ...t.calls[0].data }, { device_id: "dev1", mode: "smoker" });
});

test("N02 staging a mode drops the values drafted for the old mode", () => {
  const t = makeCard(ACTIVE_COOK);
  const dur = t.$("#ctl-dur");
  dur.value = "50";
  dur.fire("change");
  t.$("#ctl-temp-slot").querySelectorAll("button.seg")[0].fire("click");
  t.render();
  const sel = t.$("#ctl-mode");
  sel.value = "smoker";
  sel.fire("change");
  t.render();
  assert.equal(t.card._staged.cook_duration, undefined, "old-mode duration dropped");
  assert.equal(t.card._staged.cook_temp, undefined, "old-mode heat level dropped");
  assert.equal(t.card._staged.cook_mode.value, "smoker");
});

// --- N03: Stop cancels a running apply sequence ------------------------------

test("N03 Stop cancels the rest of an apply sequence", async () => {
  // No resolvable device -> the legacy per-field path, which is the one that
  // can still fire a second call after Stop.
  const t = makeCard(ACTIVE_COOK, { devices: {} });
  stageTwoEdits(t);
  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1, "first field in flight");

  t.$("#btn-stop").fire("click");
  assert.equal(t.calls.length, 2, "Stop went out immediately");
  assert.equal(t.calls[1].data.entity_id, "button.woodfire_stop_cook");

  t.calls[0].resolve();
  await tick();
  await tick();
  assert.equal(t.calls.length, 2, "no field call started after Stop");
});

test("N03 Stop during a configure_cook stops the apply from continuing", async () => {
  const t = makeCard(ACTIVE_COOK);
  stageTwoEdits(t);
  t.$("#btn-confirm").fire("click");
  await tick();
  t.$("#btn-stop").fire("click");
  t.calls[0].resolve();
  await tick();
  assert.equal(t.calls.length, 2, "only apply + stop");
  assert.equal(t.card._applying, false, "apply released");
});

// --- N04: hybrid wake --------------------------------------------------------

test("N04 a cloud backend with a BLE sensor does not offer a no-op Wake", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "unavailable",
    "sensor.cloud_backend": "aws",
    "binary_sensor.ble_connected": "off",
    "button.wake": "unknown",
    "button.stop_cook": "unavailable",
  });
  assert.equal(t.card._wakeTarget(), null, "the integration would not wake over aws");
  const btn = t.$("#btn-start");
  assert.ok(btn.hasAttribute("disabled"), "Wake stays disabled");
  btn.fire("click");
  assert.equal(t.calls.length, 0);
});

test("a grill the integration flags as likely asleep shows Wake, not Start", () => {
  // grill_state still reads "idle" -- the beacon looks identical whether the
  // grill is genuinely idle or asleep-but-radio-reachable. The integration's
  // likely_asleep attribute (set once a Start went unconfirmed) is the only
  // way to tell the two apart.
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "idle",
    "sensor.cloud_backend": "ble",
    "binary_sensor.ble_connected": { state: "on", attributes: { likely_asleep: true } },
    "button.wake": "unknown",
  });
  t.render();
  const btn = t.$("#btn-start");
  assert.ok(btn.classList.contains("is-power"), "shows as the Wake/power button");
  btn.fire("click");
  assert.deepEqual(
    [t.calls[0].domain, t.calls[0].service, t.calls[0].data.entity_id],
    ["button", "press", "button.woodfire_wake"]);
});

test("a grill not flagged as asleep still shows Start while idle", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "idle",
    "sensor.cloud_backend": "ble",
    "binary_sensor.ble_connected": { state: "on", attributes: { likely_asleep: false } },
    "button.wake": "unknown",
  });
  t.render();
  const btn = t.$("#btn-start");
  assert.ok(!btn.classList.contains("is-power"), "ordinary Start, not Wake");
});

// --- N05: input validation and heat availability ----------------------------

test("N05 an out-of-range probe target is rejected, not drafted", () => {
  const t = makeCard({ ...ACTIVE_COOK, "switch.probe0_enabled": "on" });
  const inp = t.$("#ctl-probe1temp");
  inp.value = "999";
  inp.fire("change");
  assert.equal(t.card._staged.probe0_target_temp, undefined, "999 > max is not drafted");
  inp.value = "10";
  inp.fire("change");
  assert.equal(t.card._staged.probe0_target_temp, undefined, "10 < min is not drafted");
  assert.equal(t.calls.length, 0, "and nothing is sent");
  inp.value = "75";
  inp.fire("change");
  assert.equal(t.card._staged.probe0_target_temp.value, 75, "a valid value is drafted");
});

test("N05 a value that violates the step is rejected", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "number.cook_duration": { state: "30", attributes: { min: 10, max: 600, step: 10 } },
  });
  const dur = t.$("#ctl-dur");
  dur.value = "45";
  dur.fire("change");
  assert.equal(t.card._staged.cook_duration, undefined, "45 is not a multiple of 10");
  dur.value = "50";
  dur.fire("change");
  assert.equal(t.card._staged.cook_duration.value, 50);
});

test("N05 heat-level buttons follow entity availability", () => {
  const t = makeCard({ ...ACTIVE_COOK, "number.cook_temp": "unavailable" });
  const segs = t.$("#ctl-temp-slot").querySelectorAll("button.seg");
  assert.equal(segs.length, 3);
  segs.forEach(b => assert.ok(b.hasAttribute("disabled"), "unavailable entity -> disabled"));
  segs[2].fire("click");
  assert.equal(t.calls.length, 0, "and a click does nothing");
});

// --- N06: paused sub-phases freeze the countdown -----------------------------

test("N06 a paused cook sub-phase stops the seconds_left countdown", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.grill_state": "cooking", "sensor.cook_state": "lid open" });
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00", "lid open pauses the timer");
});

test("N06 the end_time countdown freezes and resumes", () => {
  const withEnd = {
    ...ACTIVE_COOK,
    "sensor.grill_state": "cooking",
    "sensor.cook_state": "flip food",
    "sensor.end_time": "2026-10-18T12:02:00Z",
  };
  const t = makeCard(withEnd);
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00", "frozen while paused");
  t.hass.set("sensor.cook_state", "heat");
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00", "resumes from the held value");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00", "and ticks on from there");
});

// --- connection-stale hint: a quiet BLE beacon warns without guessing -------

test("a stale BLE beacon shows a connection hint during an active cook", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.cloud_backend": "ble",
    "binary_sensor.ble_connected": { state: "on", attributes: { beacon_age_seconds: 45 } },
  });
  assert.equal(t.$("#advisory").style.display, "flex");
  assert.match(t.$("#advisory").textContent, /connection|stale|unstable/i);
});

test("a fresh BLE beacon shows no connection hint", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.cloud_backend": "ble",
    "binary_sensor.ble_connected": { state: "on", attributes: { beacon_age_seconds: 2 } },
  });
  assert.equal(t.$("#advisory").style.display, "none");
});

test("a stale beacon on a cloud backend does not show the BLE hint", () => {
  // beacon_age_seconds can exist (hybrid setup) while the cloud is still the
  // one actually feeding this display - the hint would be misleading there.
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.cloud_backend": "aws",
    "binary_sensor.ble_connected": { state: "off", attributes: { beacon_age_seconds: 999 } },
  });
  assert.equal(t.$("#advisory").style.display, "none");
});

test("a stale beacon while idle shows no connection hint", () => {
  const t = makeCard({
    "sensor.grill_state": "idle",
    "sensor.cloud_backend": "ble",
    "binary_sensor.ble_connected": { state: "on", attributes: { beacon_age_seconds: 999 } },
  });
  assert.equal(t.$("#advisory").style.display, "none");
});

// --- probe food/doneness presets ---------------------------------------------

test("selecting a food preset sends select.select_option immediately", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_enabled": "on",
    "select.probe0_food": { state: "Manual", attributes: { options: ["Manual", "Beef", "Fish"] } },
    "select.probe0_doneness": { state: "—", attributes: { options: ["—"] } },
  });
  const sel = t.$("#ctl-probe1food");
  assert.deepEqual(
    Array.from(sel.options).map(o => o.value), ["Manual", "Beef", "Fish"]
  );
  sel.value = "Beef";
  sel.fire("change");
  const call = t.calls.find(c => c.service === "select_option" && c.data.option === "Beef");
  assert.ok(call, "select_option called with Beef");
  assert.equal(call.data.entity_id, "select.woodfire_probe0_food");
});

test("the doneness select follows the food's own dynamic options", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef", "Fish"] } },
    "select.probe0_doneness": {
      state: "Rare 2",
      attributes: { options: ["Rare 1", "Rare 2", "Medium 5"] },
    },
  });
  const sel = t.$("#ctl-probe1doneness");
  assert.deepEqual(
    Array.from(sel.options).map(o => o.value), ["Rare 1", "Rare 2", "Medium 5"]
  );
  assert.equal(sel.value, "Rare 2");
});

test("doneness labels are translated in German, matching the app's own wording", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
    "select.probe0_doneness": {
      state: "Rare 2",
      attributes: { options: ["Rare 1", "Rare 2", "M. Rare 3"] },
    },
  }, { language: "de" });
  const sel = t.$("#ctl-probe1doneness");
  const labels = Array.from(sel.options).map(o => o.textContent);
  assert.deepEqual(labels, ["Fast roh 1", "Fast roh 2", "Halb durchgebraten 3"]);
});

test("the header shows time-based when no probe is driving the cook", () => {
  const t = makeCard(ACTIVE_COOK);
  assert.ok(t.$("#header-sub").textContent.includes("Time-based"));
});

test("the header shows temp-based when a probe is driving the cook", () => {
  const t = makeCard({ ...ACTIVE_COOK, "binary_sensor.probe0_active": "on" });
  assert.ok(t.$("#header-sub").textContent.includes("Temp-based"));
});

test("a probe-driven preheat shows no planned duration in the glance header", () => {
  // Bug reported live: the glance still said "Cook 10 min" during a
  // temp-based preheat - a probe-driven cook has no duration at all
  // (mutual exclusivity), so showing the staged/leftover duration there
  // is misleading.
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "preheat",
    "sensor.cook_state": "preheat",
    "sensor.cook_progress": { state: "0", attributes: { phase: "preheat" } },
    "binary_sensor.probe0_active": "on",
  });
  assert.ok(!t.$("#header-sub").textContent.includes("min"));
});

test("a time-based preheat still shows the planned duration in the glance header", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "sensor.grill_state": "preheat",
    "sensor.cook_state": "preheat",
    "sensor.cook_progress": { state: "0", attributes: { phase: "preheat" } },
  });
  assert.ok(t.$("#header-sub").textContent.includes("30 min"));
});

// --- cook-by toggle: time vs. temperature (cosmetic only, same backend calls)

test("the cook-by toggle defaults to time when no probe is enabled", () => {
  const t = makeCard(ACTIVE_COOK);
  assert.ok(t.$("#ctl-style-time").classList.contains("active"));
  assert.ok(!t.$("#ctl-style-temp").classList.contains("active"));
  assert.equal(t.$("#ctl-dur-row").style.display, "");
  // The probe itself stays usable as a plain temperature alarm in time
  // style; only the food/doneness presets (which imply the probe drives
  // the cook) are hidden.
  assert.ok(!t.$("#ctl-probe1en").hasAttribute("hidden"));
  assert.equal(t.$("#ctl-probe1food-row").style.display, "none");
});

test("the cook-by toggle defaults to temperature when a probe is already enabled", () => {
  const t = makeCard({ ...ACTIVE_COOK, "switch.probe0_enabled": "on" });
  assert.ok(t.$("#ctl-style-temp").classList.contains("active"));
  assert.equal(t.$("#ctl-dur-row").style.display, "none");
  assert.equal(t.$("#ctl-probe1food-row").style.display, "");
});

test("clicking the cook-by toggle switches which panel half is shown", () => {
  const t = makeCard(ACTIVE_COOK);
  t.$("#ctl-style-temp").fire("click");
  assert.ok(t.$("#ctl-style-temp").classList.contains("active"));
  assert.equal(t.$("#ctl-dur-row").style.display, "none");
  assert.equal(t.$("#ctl-probe1food-row").style.display, "");

  t.$("#ctl-style-time").fire("click");
  assert.ok(t.$("#ctl-style-time").classList.contains("active"));
  assert.equal(t.$("#ctl-dur-row").style.display, "");
  assert.equal(t.$("#ctl-probe1food-row").style.display, "none");
});

test("the probe stays usable as a temperature alarm while cooking by time", () => {
  const t = makeCard({ ...ACTIVE_COOK, "binary_sensor.probe0_plugged_in": "on" });
  // Not gated on cook style - same as it always was, independent of time/temp.
  assert.ok(!t.$("#ctl-probe1en").hasAttribute("disabled"));
});

test("an explicit cook-by choice survives a re-render", () => {
  const t = makeCard(ACTIVE_COOK);
  t.$("#ctl-style-temp").fire("click");
  t.render();
  assert.ok(t.$("#ctl-style-temp").classList.contains("active"));
});

// --- extend-cook buttons: +1 / +5 min, only while a real timer is running ---

test("extend buttons show during a running timer and press the right button", () => {
  const t = makeCard({
    ...COUNTDOWN,
    "button.extend_cook_1min": "unknown",
    "button.extend_cook_5min": "unknown",
  });
  assert.notEqual(t.$("#extend-actions").style.display, "none");
  t.$("#btn-extend1").fire("click");
  assert.equal(t.calls[0].domain, "button");
  assert.equal(t.calls[0].service, "press");
  assert.equal(t.calls[0].data.entity_id, "button.woodfire_extend_cook_1min");
  t.$("#btn-extend5").fire("click");
  assert.equal(t.calls[1].data.entity_id, "button.woodfire_extend_cook_5min");
});

test("extend buttons are hidden for a probe-driven cook with no timer", () => {
  const t = makeCard(ACTIVE_COOK);  // no seconds_left/end_time -> remaining is null
  assert.equal(t.$("#extend-actions").style.display, "none");
});

// --- probe temperature alarm: plain HA entities, independent of the cook draft ---

test("flipping the alarm switch applies immediately, even mid-cook", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_alarm_enabled": "off",
    "number.probe0_alarm_temp": { state: "60", attributes: { min: 30, max: 110, step: 1 } },
  });
  t.$("#ctl-probe1alarmen").checked = true;
  t.$("#ctl-probe1alarmen").fire("change");
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].domain, "switch");
  assert.equal(t.calls[0].service, "turn_on");
  assert.equal(t.calls[0].data.entity_id, "switch.woodfire_probe0_alarm_enabled");
});

test("editing the alarm temperature applies immediately, not via configure_cook", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_alarm_enabled": "on",
    "number.probe0_alarm_temp": { state: "60", attributes: { min: 30, max: 110, step: 1 } },
  });
  const inp = t.$("#ctl-probe1alarmtemp");
  inp.value = "75";
  inp.fire("change");
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].domain, "number");
  assert.equal(t.calls[0].service, "set_value");
  assert.equal(t.calls[0].data.entity_id, "number.woodfire_probe0_alarm_temp");
  assert.equal(t.calls[0].data.value, 75);
});

test("the alarm temp input rejects a value outside its own min/max", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_alarm_enabled": "on",
    "number.probe0_alarm_temp": { state: "60", attributes: { min: 30, max: 110, step: 1 } },
  });
  const inp = t.$("#ctl-probe1alarmtemp");
  inp.value = "999";
  inp.fire("change");
  assert.equal(t.calls.length, 0);
  assert.equal(inp.getAttribute("aria-invalid"), "true");
});

test("a probe with no preset selected shows a disabled doneness select", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "select.probe0_food": { state: "Manual", attributes: { options: ["Manual", "Beef"] } },
    "select.probe0_doneness": { state: "unavailable", attributes: { options: ["—"] } },
  });
  assert.ok(t.$("#ctl-probe1doneness").hasAttribute("disabled"));
});

test("the preset selects are disabled while the probe's target is off", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_enabled": "off",
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
    "select.probe0_doneness": { state: "Rare 1", attributes: { options: ["Rare 1"] } },
  });
  assert.ok(t.$("#ctl-probe1food").hasAttribute("disabled"));
  assert.ok(t.$("#ctl-probe1doneness").hasAttribute("disabled"));
});

test("the preset selects become usable once the probe's target is on", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "switch.probe0_enabled": "on",
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
    "select.probe0_doneness": { state: "Rare 1", attributes: { options: ["Rare 1"] } },
  });
  assert.ok(!t.$("#ctl-probe1food").hasAttribute("disabled"));
  assert.ok(!t.$("#ctl-probe1doneness").hasAttribute("disabled"));
});

test("the connected icon reflects whether the probe is plugged in", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
    "binary_sensor.probe1_plugged_in": "off",
  });
  assert.equal(t.$("#ctl-probe1-connected").getAttribute("icon"), "mdi:thermometer-check");
  assert.ok(t.$("#ctl-probe1-connected").classList.contains("is-connected"));
  assert.equal(t.$("#ctl-probe2-connected").getAttribute("icon"), "mdi:thermometer-off");
  assert.ok(!t.$("#ctl-probe2-connected").classList.contains("is-connected"));
});

test("a probe's enable toggle is locked with a hint while it is not plugged in", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "off",
  });
  const sw = t.$("#ctl-probe1en");
  assert.ok(sw.hasAttribute("disabled"));
  assert.equal(sw.title, "Probe not plugged in");
});

test("a plugged-in probe's enable toggle stays usable", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
  });
  const sw = t.$("#ctl-probe1en");
  assert.ok(!sw.hasAttribute("disabled"));
  assert.equal(sw.title, "");
});

test("the active preset shows next to the probe name during a cook", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
    "select.probe0_doneness": { state: "Medium 6", attributes: { options: ["Medium 6"] } },
  });
  assert.equal(t.$("#probe-1 .probe-preset").textContent, " · Beef, Medium 6");
});

test("a probe left on Manual shows no preset label", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "binary_sensor.probe0_plugged_in": "on",
    "select.probe0_food": { state: "Manual", attributes: { options: ["Manual", "Beef"] } },
  });
  assert.equal(t.$("#probe-1 .probe-preset").textContent, "");
});

test("show_probe_presets: false hides the preset selects from the card", () => {
  const t = makeCard(
    {
      ...ACTIVE_COOK,
      "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
    },
    { config: { show_probe_presets: false } },
  );
  assert.equal(t.$("#ctl-probe1food"), null);
  assert.equal(t.$("#ctl-probe1doneness"), null);
  // The rest of the probe control (enable switch, manual target) stays.
  assert.ok(t.$("#ctl-probe1temp"));
});

test("the preset selects show by default", () => {
  const t = makeCard({
    ...ACTIVE_COOK,
    "select.probe0_food": { state: "Beef", attributes: { options: ["Manual", "Beef"] } },
  });
  assert.ok(t.$("#ctl-probe1food"));
});

// --- R1: the seconds_left fallback holds its value across a pause ------------

test("R1 the seconds_left countdown holds on pause and resumes from the held value", () => {
  const t = makeCard(COUNTDOWN);
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00");
  t.hass.set("sensor.cook_state", "lid open");
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00",
    "entering the pause holds the value reached, not the stale sensor value");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00", "frozen while paused");
  t.hass.set("sensor.cook_state", "heat");
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00", "resumes from the held value");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:54 left of 30:00", "and ticks on from there");
});

test("R1 a cook that is already paused at mount resumes without a jump", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.cook_state": "lid open" });
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.hass.set("sensor.cook_state", "heat");
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00", "the pause is not counted off");
  t.clock.advance(3000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:57 left of 30:00");
});

test("R1 a fresh seconds_left report re-anchors a paused countdown", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.cook_state": "lid open" });
  t.clock.advance(3000);
  t.render();
  t.hass.set("sensor.seconds_left", { state: "90", last_updated: "2026-10-18T12:00:03Z" });
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:30 left of 30:00", "a new reading wins over the held value");
});

test("R1 the end of a cook drops the pause correction", () => {
  const t = makeCard({ ...COUNTDOWN, "sensor.cook_state": "lid open" });
  t.clock.advance(10000);
  t.render();
  assert.equal(t.$("#progress-label").textContent, "2:00 left of 30:00");
  t.hass.set("sensor.grill_state", "idle");
  t.render();
  t.hass.set("sensor.grill_state", "cooking");
  t.hass.set("sensor.cook_state", "heat");
  t.render();
  assert.equal(t.$("#progress-label").textContent, "1:50 left of 30:00",
    "a new cook counts off the sensor again instead of inheriting the pause");
});

// --- R2: the rest phase is live but not editable -----------------------------

const RESTING = { ...ACTIVE_COOK, "sensor.grill_state": "cooking", "sensor.cook_state": "rest" };
const EDITABLE_CONTROLS = ["#ctl-mode", "#ctl-dur", "#ctl-smoke", "#ctl-skip",
                           "#ctl-probe1en", "#ctl-probe1temp"];

test("R2 the rest phase locks the controls the integration refuses to re-issue", () => {
  const t = makeCard(RESTING);
  for (const sel of EDITABLE_CONTROLS) {
    assert.ok(t.$(sel).hasAttribute("disabled"), `${sel} is disabled while resting`);
  }
  for (const seg of t.card.shadowRoot.querySelectorAll("#ctl-heat button.seg")) {
    assert.ok(seg.hasAttribute("disabled"), "heat levels are disabled while resting");
  }
  const dur = t.$("#ctl-dur");
  dur.value = "45";
  dur.fire("change");
  t.render();
  assert.deepEqual(Object.keys(t.card._staged), [], "no edit is drafted");
  assert.equal(t.$("#btn-confirm").style.display, "none", "no Apply is offered");
  assert.equal(t.calls.length, 0, "and nothing is sent");
});

test("R2 resting is locked whichever state reports it, and Stop stays reachable", () => {
  for (const phase of [
    { "sensor.grill_state": "rest", "sensor.cook_state": "none" },
    { "sensor.grill_state": "resting", "sensor.cook_state": "none" },
    { "sensor.grill_state": "cooking", "sensor.cook_state": "resting" },
    { "sensor.grill_state": "cooking", "sensor.cook_progress": { state: "99", attributes: { phase: "rest" } } },
  ]) {
    const t = makeCard({ ...ACTIVE_COOK, ...phase });
    for (const sel of EDITABLE_CONTROLS) {
      assert.ok(t.$(sel).hasAttribute("disabled"), `${sel} disabled for ${JSON.stringify(phase)}`);
    }
    const smoke = t.$("#ctl-smoke");
    smoke.checked = true;
    smoke.fire("change");
    t.render();
    assert.equal(t.calls.length, 0, "no live change is sent while resting");
    assert.deepEqual(Object.keys(t.card._staged), [], "and none is drafted");
    const stop = t.$("#btn-stop");
    assert.ok(!stop.hasAttribute("disabled"), "Stop stays available");
    stop.fire("click");
    assert.deepEqual(t.calls.map(c => `${c.domain}.${c.service}`), ["button.press"]);
  }
});

// --- R3: a draft staged while cooking survives into rest, but can't be applied

const REST_PHASES = [
  { "sensor.grill_state": "rest" },
  { "sensor.grill_state": "resting" },
  { "sensor.cook_state": "rest" },
  { "sensor.cook_state": "resting" },
  { "sensor.cook_progress": { state: "99", attributes: { phase: "rest" } } },
  { "sensor.cook_progress": { state: "99", attributes: { phase: "resting" } } },
];

test("R3 a draft from the cook is no longer applied once the grill rests", async () => {
  for (const phase of REST_PHASES) {
    const t = makeCard(ACTIVE_COOK);
    assert.ok(t.card._setNumber("cook_duration", 45), "draft accepted while cooking");
    for (const [spec, value] of Object.entries(phase)) t.hass.set(spec, value);
    t.render();

    const confirm = t.$("#btn-confirm");
    const offered = confirm.style.display !== "none" && !confirm.hasAttribute("disabled");
    assert.ok(!offered, `no Apply is offered for ${JSON.stringify(phase)}`);

    confirm.fire("click");
    await tick();
    await t.card._applyStaged();
    assert.equal(t.calls.length, 0, "no call leaves the card while resting");
    assert.equal(t.card._stagedValue("cook_duration"), 45, "the draft stays readable");

    const stop = t.$("#btn-stop");
    assert.ok(!stop.hasAttribute("disabled"), "Stop stays available");
    stop.fire("click");
    assert.deepEqual(t.calls.map(c => `${c.domain}.${c.service}`), ["button.press"]);
  }
});

test("R3 the same draft still applies as one call while the cook is editable", async () => {
  const t = makeCard(ACTIVE_COOK);
  assert.ok(t.card._setNumber("cook_duration", 45));
  t.render();
  t.$("#btn-confirm").fire("click");
  await tick();
  assert.equal(t.calls.length, 1, "exactly one call");
  assert.equal(t.calls[0].service, "configure_cook");
  assert.equal(t.calls[0].data.duration, 45);
});

// --- runner -----------------------------------------------------------------

console.log("card logic\n");
for (const [name, fn] of queue) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}
console.log(`\n${failures ? `${failures} failing` : "all passing"}`);
process.exit(failures ? 1 : 0);
