# Flip Clock Block

A live split-flap flip clock that displays the current local time in HH:MM:SS format. No authored content is required — drop the block on any page and it works.

## Basic Usage

| Flip Clock |
|---|
| *(empty row)* |

## Variant Classes

Add variants in parentheses after the block name: `Flip Clock (light, no-seconds)`.

| Variant | Effect |
|---|---|
| `light` | Black digits on white cards (inverts the dark default) |
| `no-minutes` | Hide the minutes unit and its separator |
| `no-seconds` | Hide the seconds unit and its separator |
| `no-labels` | Hide the HOURS / MINUTES / SECONDS label text |
| `font-mono` | Courier monospace — retro digital / LCD feel |
| `font-bold` | Impact / Arial Black — square industrial look |
| `lang-zh` | Chinese labels: 时 / 分 / 秒 |
| `lang-hi` | Hindi labels: घंटे / मिनट / सेकंड |
| `lang-es` | Spanish labels: Horas / Minutos / Segundos |
| `lang-fr` | French labels: Heures / Minutes / Secondes |
| `lang-ar` | Arabic labels: ساعات / دقائق / ثواني |
| `lang-bn` | Bengali labels: ঘণ্টা / মিনিট / সেকেন্ড |
| `lang-ru` | Russian labels: Часы / Минуты / Секунды |
| `lang-pt` | Portuguese labels: Horas / Minutos / Segundos |
| `lang-ja` | Japanese labels: 時間 / 分 / 秒 |

## Config Rows

Add two-column rows below the block name to customise colours and labels. The left cell is the key, the right cell is the value.

| Key | Example value | Description |
|---|---|---|
| `background` | `#1a1a2e` | Clock section background colour |
| `color` | `#f9a825` | Digit colour for all three units |
| `hours-color` | `#ff6b6b` | Digit colour for the hours unit only |
| `minutes-color` | `#4ade80` | Digit colour for the minutes unit only |
| `seconds-color` | `#60a5fa` | Digit colour for the seconds unit only |
| `label-hours` | `HRS` | Custom label text for hours |
| `label-minutes` | `MIN` | Custom label text for minutes |
| `label-seconds` | `SEC` | Custom label text for seconds |
| `lang` | `es` | Language code (alternative to the `lang-XX` class) |

## Sample Blocks

### Default — white on black

| Flip Clock |
|---|
| *(empty)* |

---

### Light theme

| Flip Clock (light) |
|---|
| *(empty)* |

---

### Hours and minutes only, no labels

| Flip Clock (no-seconds, no-labels) |
|---|
| *(empty)* |

---

### Industrial font, dark background

| Flip Clock (font-bold) |
|---|
| *(empty)* |

---

### Custom amber digits on deep navy

| Flip Clock |
|---|
| background | #0d1b2a |
| color | #f9a825 |

---

### Per-unit colours

| Flip Clock |
|---|
| hours-color | #ff6b6b |
| minutes-color | #4ade80 |
| seconds-color | #60a5fa |

---

### Spanish labels

| Flip Clock (lang-es) |
|---|
| *(empty)* |

---

### Japanese labels, no seconds

| Flip Clock (lang-ja, no-seconds) |
|---|
| *(empty)* |

---

### Custom labels

| Flip Clock |
|---|
| label-hours | HRS |
| label-minutes | MIN |
| label-seconds | SEC |

---

### Combined — light theme, bold font, hours only, custom label

| Flip Clock (light, font-bold, no-minutes, no-seconds, no-labels) |
|---|
| *(empty)* |
