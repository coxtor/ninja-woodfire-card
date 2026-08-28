/**
 * Tests for the card's translation layer.
 *
 *   node test/i18n.test.mjs
 *
 * The card is a single browser file with no build step, so it is loaded here
 * against minimal DOM stubs and its translation helpers pulled out. The point
 * is to catch the failure mode that matters when someone adds a language: a
 * missing or misspelled key rendering a raw placeholder in the UI.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "dist", "woodfire-grill-card.js"), "utf8");

const sandbox = {
  HTMLElement: class {},
  customElements: { define() {} },
  window: {},
  console: { info() {} },
  setInterval() {}, clearInterval() {}, setTimeout() {}, clearTimeout() {},
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(
  source + "\n;globalThis.__t = { TRANSLATIONS, pickLanguage, stringsFor, fill };",
  sandbox
);
const { TRANSLATIONS, pickLanguage, stringsFor, fill } = sandbox.__t;

let failures = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
};

console.log("translation layer\n");

test("English is complete and is the fallback base", () => {
  assert.ok(TRANSLATIONS.en, "no English block");
  for (const section of ["state", "advisory", "mode", "header", "banner",
                         "pending", "button", "temp", "lid", "probe",
                         "control", "progress"]) {
    assert.ok(TRANSLATIONS.en[section], `en.${section} missing`);
  }
});

test("every language uses only sections English defines", () => {
  const known = new Set(Object.keys(TRANSLATIONS.en));
  for (const [lang, block] of Object.entries(TRANSLATIONS)) {
    for (const section of Object.keys(block)) {
      assert.ok(known.has(section),
        `${lang}.${section} is not a section English defines (typo?)`);
    }
  }
});

test("every language uses only keys English defines", () => {
  for (const [lang, block] of Object.entries(TRANSLATIONS)) {
    if (lang === "en") continue;
    for (const [section, entries] of Object.entries(block)) {
      for (const key of Object.keys(entries)) {
        assert.ok(key in TRANSLATIONS.en[section],
          `${lang}.${section}.${key} has no English counterpart (typo?)`);
      }
    }
  }
});

test("no translated value is left empty", () => {
  for (const [lang, block] of Object.entries(TRANSLATIONS)) {
    for (const [section, entries] of Object.entries(block)) {
      for (const [key, value] of Object.entries(entries)) {
        assert.ok(typeof value === "string" && value.trim(),
          `${lang}.${section}.${key} is empty`);
      }
    }
  }
});

test("placeholders survive translation", () => {
  // A language that drops {min} or {time} would render a sentence with the
  // number silently missing, which is worse than an untranslated string.
  const withPlaceholders = { header: ["cook", "endsIn"], probe: ["name", "target"],
                             progress: ["preheatPct"] };
  for (const [lang, block] of Object.entries(TRANSLATIONS)) {
    for (const [section, keys] of Object.entries(withPlaceholders)) {
      for (const key of keys) {
        const value = block[section]?.[key];
        if (value === undefined) continue;
        const expected = TRANSLATIONS.en[section][key].match(/\{\w+\}/g) || [];
        for (const token of expected) {
          assert.ok(value.includes(token),
            `${lang}.${section}.${key} is missing ${token}`);
        }
      }
    }
  }
});

test("language resolution handles regions and unknowns", () => {
  assert.equal(pickLanguage({ language: "de" }), "de");
  assert.equal(pickLanguage({ language: "de-DE" }), "de");
  assert.equal(pickLanguage({ language: "de_AT" }), "de");
  assert.equal(pickLanguage({ language: "DE" }), "de");
  assert.equal(pickLanguage({ language: "en-GB" }), "en");
  assert.equal(pickLanguage({ language: "sv" }), "en", "unknown should fall back");
  assert.equal(pickLanguage({}), "en");
  assert.equal(pickLanguage(null), "en");
  // hass.locale wins over hass.language, matching how HA reports it
  assert.equal(pickLanguage({ locale: { language: "de" }, language: "en" }), "de");
});

test("a partial language falls back to English per key", () => {
  const strings = stringsFor("de");
  assert.equal(strings.state.idle, "Bereit");
  // Every English key must be present after the overlay, translated or not.
  for (const [section, entries] of Object.entries(TRANSLATIONS.en)) {
    for (const key of Object.keys(entries)) {
      assert.ok(strings[section][key] !== undefined,
        `de is missing a fallback for ${section}.${key}`);
    }
  }
});

test("unknown language yields pure English", () => {
  assert.deepEqual(stringsFor("sv"), stringsFor("en"));
});

test("fill substitutes and leaves unknown tokens visible", () => {
  assert.equal(fill("Cook {min} min", { min: 8 }), "Cook 8 min");
  assert.equal(fill("Probe {n} target", { n: 2 }), "Probe 2 target");
  assert.equal(fill("Preheating {pct}%", { pct: 40 }), "Preheating 40%");
  // An unknown token stays literal rather than becoming "undefined"
  assert.equal(fill("{nope}", {}), "{nope}");
  assert.equal(fill(undefined, {}), "");
});

test("state and mode tables cover what the firmware reports", () => {
  // Values observed from the integration's own captures.
  const states = ["idle", "preheat", "cooking", "heat", "rest", "done",
                  "powered OFF", "powered_off", "lid open", "unknown", "unavailable"];
  const modes = ["grill", "smoker", "bake", "roast", "dehydrate", "reheat", "air crisp"];
  for (const lang of Object.keys(TRANSLATIONS)) {
    const strings = stringsFor(lang);
    for (const s of states) {
      assert.ok(strings.state[s], `${lang}: no label for state ${s}`);
    }
    for (const m of modes) {
      assert.ok(strings.mode[m], `${lang}: no label for mode ${m}`);
    }
  }
});

console.log(`\n${failures ? `${failures} failing` : "all passing"}`);
process.exit(failures ? 1 : 0);
