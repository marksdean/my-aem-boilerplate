# Board Block

A Vestaboard-style split-flap display board. Each row of authored content becomes a row of animated flip tiles. Text is automatically converted to uppercase and centred by default. Supports full Vestaboard character encoding (codes 0–70) including inline colour tiles.

## Dimensions

| Model | Columns | Rows |
|---|---|---|
| Flagship (default) | 22 | 6 |
| Note (`note` variant) | 15 | 3 |
| Auto (`auto` variant) | Expands to fit longest line | 6 (or `rows` config) |

## Basic Usage

Each authored row below the block name maps to one row on the board (up to 6 rows for flagship, 3 for Note). Extra rows are ignored; missing rows are blank.

| Board |
|---|
| Good Morning! |
| Have a great day. |

## Variant Classes

Add variants in parentheses: `Board (auto, light)`.

| Variant | Effect |
|---|---|
| `auto` | Expands the column count to fit the longest authored line — no text is ever truncated. Uses full-bleed layout to break out of the page max-width container. |
| `light` | Light theme — white tile cards, light grey housing, dark characters |
| `note` | 3 × 15 Note edition dimensions |
| `left` | Left-align text (default is centred) |
| `right` | Right-align text |

## Config Rows

Add two-column rows anywhere in the block to set colours and dimensions. These rows are not displayed on the board.

| Key | Example value | Description |
|---|---|---|
| `background` | `#0d1b2a` | Outer section background colour |
| `housing` | `#0f1a0f` | Board casing / bezel colour |
| `color` | `#f9a825` | Character colour on all tiles |
| `tile` | `#1a2a1a` | Both tile halves (uniform card colour) |
| `tile-top` | `#222230` | Top half of each tile only |
| `tile-bottom` | `#1a1a28` | Bottom half of each tile (creates split-flap depth) |
| `rows` | `4` | Override row count (default 6, or 3 for `note`) |
| `cols` | `30` | Override column count (ignored when `auto` is set) |

## Inline Colour Tile Codes

Embed `{NN}` codes anywhere in a content row to insert a solid-colour tile at that position. These can be mixed freely with text characters.

| Code | Colour |
|---|---|
| `{63}` | Red |
| `{64}` | Orange |
| `{65}` | Yellow |
| `{66}` | Green |
| `{67}` | Cyan |
| `{68}` | Blue |
| `{69}` | Violet |
| `{70}` | White (cream) |

## Character Encoding

Text is automatically uppercased. Supported characters: A–Z, 0–9, and the following punctuation: `! @ # $ ( ) - + & = ; : ' " % , . / ? °`

Unknown characters (emoji, accented letters, etc.) are rendered as blank tiles.

## Sample Blocks

### Default — classic dark board, centred text

| Board |
|---|
| Good Morning! |
| Today is a great day |
| to build something. |
|  |
|  |
| Let's get to work. |

---

### Auto — no truncation on long lines

| Board (auto) |
|---|
| Good morning, here is your daily briefing! |
| Date: Thursday, April 24, 2026 |
| Weather: Mostly sunny with highs of 24 degrees |
| Meetings: 9am standup and 2pm design review |
| Reminder: Submit your timesheets by Friday |
| Have a fantastic and productive day! |

---

### Note edition (3 × 15)

| Board (note) |
|---|
| Good Morning! |
| Coffee is ready. |
| Lunch at noon :) |

---

### Note edition, auto-sized

| Board (note, auto) |
|---|
| Good morning, enjoy your day! |
| Coffee is ready in the kitchen. |
| Team lunch today at noon :) |

---

### Left-aligned text

| Board (left) |
|---|
| Left-aligned text |
| starts at column 1 |
| no padding added |

---

### Light theme

| Board (light) |
|---|
| Good Morning! |
|  |
| Have a great day. |

---

### Custom background and text colour

| Board |
|---|
| background | #0d1b2a |
| color | #f9a825 |
| Good Morning! |
|  |
| Custom amber on navy. |

---

### Custom tile colour (green terminal)

| Board |
|---|
| background | #0a1a0a |
| housing | #0f2010 |
| tile | #1a3a1a |
| color | #7fff7f |
| Green terminal vibes. |

---

### Custom tile depth (distinct top/bottom halves)

| Board |
|---|
| tile-top | #24243a |
| tile-bottom | #1a1a2e |
| colour | #e0d8f0 |
| Custom split depth. |

---

### Rainbow colour tile rows + text

| Board |
|---|
| {63}{64}{65}{66}{67}{68}{69}{70}{63}{64}{65}{66}{67}{68}{69}{70}{63}{64}{65}{66}{67}{68} |
| {63}{63}{63}{63}Good Morning!{63}{63}{63}{63}{63} |
| Weather: Sunny 24°C |
| 2pm: Team Design Review |
| {68}{68}{68}{68}Have A Great Day{68}{68}{68} |
| {69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69}{69} |

---

### Custom column count — narrow 12-column board

| Board |
|---|
| cols | 12 |
| rows | 4 |
| Good Day! |
| Hello :) |
| See you! |
|  |

---

### Full kitchen-sink — every option used

| Board (auto, light, left) |
|---|
| background | #f5f0e8 |
| housing | #e0d8cc |
| color | #1a1008 |
| tile-top | #fffdf8 |
| tile-bottom | #f0ebe0 |
| rows | 4 |
| {63}{63}{63} Good Morning! Welcome Back. {63}{63}{63} |
| Today: Thursday, April 24 — Sunny 24°C |
| Meetings: 9am standup + 2pm design review |
| {66}{66}{66}{66}{66} Have a great day! {66}{66}{66}{66}{66} |
