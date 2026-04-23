// Labels for the 10 most common languages by native speakers
const LABELS = {
  en: ['Hours', 'Minutes', 'Seconds'],
  zh: ['时', '分', '秒'],
  hi: ['घंटे', 'मिनट', 'सेकंड'],
  es: ['Horas', 'Minutos', 'Segundos'],
  fr: ['Heures', 'Minutes', 'Secondes'],
  ar: ['ساعات', 'دقائق', 'ثواني'],
  bn: ['ঘণ্টা', 'মিনিট', 'সেকেন্ড'],
  ru: ['Часы', 'Минуты', 'Секунды'],
  pt: ['Horas', 'Minutos', 'Segundos'],
  ja: ['時間', '分', '秒'],
};

/**
 * Reads two-column block rows as key→value config pairs.
 * Authors add rows like: | background | #1a1a2e |
 */
function parseConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const val = cells[1].textContent.trim();
    if (key && val) cfg[key] = val;
  });
  return cfg;
}

function createDigitCard() {
  const card = document.createElement('div');
  card.className = 'flip-card';
  card.dataset.value = '0';
  card.innerHTML = `
    <div class="flip-card-top"><span>0</span></div>
    <div class="flip-card-bottom"><span>0</span></div>
    <div class="flip-card-fold-top"><span>0</span></div>
    <div class="flip-card-fold-bottom"><span>0</span></div>
  `;
  return card;
}

function animateDigit(card, newVal) {
  const oldVal = card.dataset.value;
  if (newVal === oldVal) return;

  card.querySelector('.flip-card-fold-top span').textContent = oldVal;
  card.querySelector('.flip-card-fold-bottom span').textContent = newVal;
  card.querySelector('.flip-card-top span').textContent = newVal;
  card.querySelector('.flip-card-bottom span').textContent = newVal;
  card.dataset.value = newVal;

  card.classList.remove('is-flipping');
  void card.offsetWidth; // eslint-disable-line no-void
  card.classList.add('is-flipping');

  setTimeout(() => card.classList.remove('is-flipping'), 700);
}

function createSeparator(id) {
  const sep = document.createElement('div');
  sep.className = `flip-clock-sep flip-clock-${id}`;
  sep.innerHTML = '<span></span><span></span>';
  return sep;
}

function createUnit(label, id) {
  const unit = document.createElement('div');
  unit.className = `flip-clock-unit flip-clock-${id}`;

  const group = document.createElement('div');
  group.className = 'flip-clock-group';
  group.append(createDigitCard(), createDigitCard());

  const lbl = document.createElement('span');
  lbl.className = 'flip-clock-label';
  lbl.textContent = label;

  unit.append(group, lbl);
  return unit;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Single shared AudioContext for all sounds on this clock.
 * Lazily created; resumes automatically on the first user gesture
 * (browsers block audio until interaction).
 *
 * Returns { playClick, playDing }.
 */
function createAudioManager() {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new AudioContext();
      } catch (e) {
        return null;
      }
      const resume = () => { if (ctx.state === 'suspended') ctx.resume(); };
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
    }
    return ctx;
  }

  function playClick() {
    const ac = getCtx();
    if (!ac || ac.state !== 'running') return;
    const { currentTime: now, sampleRate } = ac;

    // Tick — high-frequency transient (latch releasing)
    const tickLen = Math.floor(sampleRate * 0.02);
    const tickBuf = ac.createBuffer(1, tickLen, sampleRate);
    const tickData = tickBuf.getChannelData(0);
    for (let i = 0; i < tickLen; i += 1) {
      const t = i / tickLen;
      tickData[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t);
    }
    const tickSrc = ac.createBufferSource();
    tickSrc.buffer = tickBuf;
    const tickFilter = ac.createBiquadFilter();
    tickFilter.type = 'bandpass';
    tickFilter.frequency.value = 3200;
    tickFilter.Q.value = 2.5;
    const tickGain = ac.createGain();
    tickGain.gain.setValueAtTime(0.18, now);
    tickSrc.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ac.destination);
    tickSrc.start(now);

    // Clack — lower-frequency thud (card landing, 8 ms delayed)
    const clackLen = Math.floor(sampleRate * 0.05);
    const clackBuf = ac.createBuffer(1, clackLen, sampleRate);
    const clackData = clackBuf.getChannelData(0);
    for (let i = 0; i < clackLen; i += 1) {
      const t = i / clackLen;
      clackData[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * (1 - t);
    }
    const clackSrc = ac.createBufferSource();
    clackSrc.buffer = clackBuf;
    const clackFilter = ac.createBiquadFilter();
    clackFilter.type = 'bandpass';
    clackFilter.frequency.value = 700;
    clackFilter.Q.value = 1.2;
    const clackGain = ac.createGain();
    clackGain.gain.setValueAtTime(0, now);
    clackGain.gain.setValueAtTime(0.12, now + 0.008);
    clackSrc.connect(clackFilter);
    clackFilter.connect(clackGain);
    clackGain.connect(ac.destination);
    clackSrc.start(now);
  }

  function playDing(count) {
    const ac = getCtx();
    if (!ac || ac.state !== 'running') return;
    const freq = 523.25; // C5 — pleasant bell fundamental
    const t0 = ac.currentTime + 0.05;

    for (let d = 0; d < count; d += 1) {
      const t = t0 + d * 1.4; // 1.4 s between dings

      // Fundamental
      const osc1 = ac.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;
      const g1 = ac.createGain();
      g1.gain.setValueAtTime(0.001, t);
      g1.gain.exponentialRampToValueAtTime(0.35, t + 0.004);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
      osc1.connect(g1);
      g1.connect(ac.destination);
      osc1.start(t);
      osc1.stop(t + 2.6);

      // Inharmonic partial (2.756× fundamental) — gives bell its character
      const osc2 = ac.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2.756;
      const g2 = ac.createGain();
      g2.gain.setValueAtTime(0.001, t);
      g2.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc2.connect(g2);
      g2.connect(ac.destination);
      osc2.start(t);
      osc2.stop(t + 1.3);
    }
  }

  return { playClick, playDing };
}

/**
 * Determine which card indices (0-5: h0,h1,m0,m1,s0,s1) should trigger
 * the click sound.  Controlled by the `sound` config row value:
 *   minutes (default) | hours | seconds | all | hours,seconds  etc.
 */
function getSoundUnits(cfg) {
  const val = (cfg.sound || 'minutes').toLowerCase();
  if (val === 'all') return new Set([0, 1, 2, 3, 4, 5]);
  const units = new Set();
  if (val.includes('hours')) { units.add(0); units.add(1); }
  if (val.includes('minutes')) { units.add(2); units.add(3); }
  if (val.includes('seconds')) { units.add(4); units.add(5); }
  return units.size > 0 ? units : new Set([2, 3]); // default: minutes
}

/**
 * audio = { click, soundUnits, ding, dingCount }
 *   click      — playClick fn or null
 *   soundUnits — Set of card indices that trigger the click
 *   ding       — playDing fn or null
 *   dingCount  — true → ding × (hour % 12), false → single ding
 */
function tick(cards, audio) {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const digits = `${pad(h)}${pad(m)}${pad(s)}`;

  cards.forEach((card, i) => {
    const changed = card.dataset.value !== digits[i];
    animateDigit(card, digits[i]);
    if (changed && !audio.muted && audio.click && audio.soundUnits.has(i)) {
      setTimeout(audio.click, i * 8); // stagger 8 ms per card
    }
  });

  // Ding on the hour (fires once when m and s both become 0)
  if (m === 0 && s === 0 && !audio.muted && audio.ding) {
    const count = audio.dingCount ? (h % 12 || 12) : 1;
    setTimeout(() => audio.ding(count), 200);
  }
}

export default function decorate(block) {
  const cfg = parseConfig(block);

  // Language: class wins (e.g. lang-es), then config row, then en
  const langClass = [...block.classList].find((c) => c.startsWith('lang-'));
  const lang = langClass ? langClass.slice(5) : (cfg.lang || 'en');
  const base = LABELS[lang] || LABELS.en;
  const labels = [
    cfg['label-hours'] || base[0],
    cfg['label-minutes'] || base[1],
    cfg['label-seconds'] || base[2],
  ];

  const inner = document.createElement('div');
  inner.className = 'flip-clock-inner';
  inner.setAttribute('role', 'timer');
  inner.setAttribute('aria-live', 'off');
  inner.setAttribute('aria-label', 'Current time');

  const hoursUnit = createUnit(labels[0], 'hours');
  const minutesUnit = createUnit(labels[1], 'minutes');
  const secondsUnit = createUnit(labels[2], 'seconds');

  inner.append(
    hoursUnit,
    createSeparator('sep-hm'),
    minutesUnit,
    createSeparator('sep-ms'),
    secondsUnit,
  );

  // Apply color tokens from config rows via CSS custom properties
  if (cfg.background) block.style.setProperty('--fc-bg', cfg.background);
  if (cfg.color) block.style.setProperty('--fc-digit', cfg.color);

  // Per-unit colors inherit via --fc-unit-color set on each unit element
  if (cfg['hours-color']) hoursUnit.style.setProperty('--fc-unit-color', cfg['hours-color']);
  if (cfg['minutes-color']) minutesUnit.style.setProperty('--fc-unit-color', cfg['minutes-color']);
  if (cfg['seconds-color']) secondsUnit.style.setProperty('--fc-unit-color', cfg['seconds-color']);

  block.replaceChildren(inner);

  const cards = [...inner.querySelectorAll('.flip-card')];

  // Set initial values without animation
  const now = new Date();
  const digits = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  cards.forEach((card, i) => {
    const v = digits[i];
    card.dataset.value = v;
    card.querySelectorAll('span').forEach((span) => { span.textContent = v; });
  });

  // ── Sound setup ──────────────────────────────────────────────
  const soundEnabled = block.classList.contains('sound') || !!cfg.sound;
  const dingEnabled = block.classList.contains('ding') || !!cfg.ding;

  const audio = {
    click: null,
    soundUnits: new Set(),
    ding: null,
    dingCount: false,
    muted: false,
  };

  if (soundEnabled || dingEnabled) {
    const manager = createAudioManager();
    if (soundEnabled) {
      audio.click = manager.playClick;
      audio.soundUnits = getSoundUnits(cfg);
    }
    if (dingEnabled) {
      audio.ding = manager.playDing;
      // | ding | count | → dings equal to the hour number (1–12)
      audio.dingCount = (cfg.ding || '').toLowerCase() === 'count';
    }

    // Click anywhere on the clock to toggle mute
    block.classList.add('has-sound');
    block.addEventListener('click', () => {
      audio.muted = !audio.muted;
      block.classList.toggle('is-muted', audio.muted);
    });
  }

  // Sync interval to the start of the next second
  const msToNextSecond = 1000 - now.getMilliseconds();
  setTimeout(() => {
    tick(cards, audio);
    setInterval(() => tick(cards, audio), 1000);
  }, msToNextSecond);
}
