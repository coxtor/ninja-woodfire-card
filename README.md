# Ninja Woodfire Grill Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

> **Hobby project — published as-is, no support, no warranty.**
> See [Status & support](#status--support) and [Disclaimer](#disclaimer)
> below before installing.

Compact Lovelace card for the Ninja Woodfire Home Assistant integration —
live state, temperatures, probes, and one-tap controls on a single tile.

## Features

- Live grill / air / smoke temperature with stale-reading filter
- Live cook countdown that ticks every second
- Per-probe display with progress bar towards target temperature
- Mode-aware temperature input (heat-level segments for grill mode,
  Celsius slider for everything else)
- Cook-mode dropdown, duration slider, smoke / skip-preheat toggles
- Start / Stop / Skip-Preheat actions
- Follows the Home Assistant user's language (English and German; anything
  else falls back to English)

## Requirements

- Home Assistant with the
  [Ninja Woodfire integration](https://github.com/coxtor/ninja-woodfire-integration)
  installed and configured.

## Installation

### HACS (recommended)

1. Open HACS → Frontend → ⋮ → *Custom repositories*
2. Add this repository, category *Lovelace*
3. Install *Ninja Woodfire Grill Card*
4. HACS 2.x usually registers the resource automatically. If not, add
   it under *Settings → Dashboards → ⋮ → Resources*:
   ```yaml
   url: /hacsfiles/ninja-woodfire-card/woodfire-grill-card.js
   type: module
   ```
5. Hard-refresh your browser

### Manual

1. Copy `dist/woodfire-grill-card.js` to `/config/www/woodfire-grill-card.js`
2. Add a Lovelace resource:
   ```yaml
   url: /local/woodfire-grill-card.js
   type: module
   ```
3. Hard-refresh the dashboard.

## Configuration

```yaml
type: custom:woodfire-grill-card
dsn: AC000W0XXXXXXXX   # optional, only needed with multiple grills
```

| Option | Required | Description |
|--------|----------|-------------|
| `dsn`  | no       | The grill's DSN (case-insensitive), shown as serial number under *Settings → Devices → Ninja Woodfire*. Without it the card uses the first Ninja Woodfire device. |

## Languages

The card uses whatever language is set on the Home Assistant profile, falling
back to English for anything it does not have. Regional codes work too, so
`de-AT` and `de-DE` both resolve to German.

Adding a language is data, not code. Copy the `en` block in `TRANSLATIONS` near
the top of `dist/woodfire-grill-card.js`, translate the values, and key it by the
language code:

```js
const TRANSLATIONS = {
  en: { /* … */ },
  de: { /* … */ },
  nl: { state: { idle: "Gereed", /* … */ } },   // new
};
```

Partial translations are fine: any key left out falls back to English rather
than showing a raw placeholder, so a block can be filled in over time. Mode
names that are product terms (*Smoker*, *Air Crisp*) are usually left
untranslated, as the appliance itself does.

Two checks after editing:

```bash
node test/i18n.test.mjs     # missing keys, typos, dropped {placeholders}
open test/preview.html      # renders every language side by side, no HA needed
```

## Status & support

This is a personal hobby project published as-is. There is **no
support, no warranty, no guarantee of fitness for any purpose**.
Issues and pull requests may be ignored. The author has no
obligation to respond, fix bugs, or keep the project working.

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

This is an unofficial, independent project. It is **not affiliated
with, endorsed by, sponsored by, or supported by SharkNinja
Operating LLC** or any of its subsidiaries.

"Ninja", "Woodfire", and related product names are trademarks of
their respective owners and are used here only descriptively to
identify which integration this card pairs with. No claim of
trademark ownership or affiliation is made or implied.
