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
 * Creates a Web Audio click-sound synthesiser that emulates the mechanical
 * snap of a physical split-flap card. Returns a play() function.
 *
 * The AudioContext is created lazily on the first play() call and is
 * resumed automatically on the next user gesture (browsers block audio
 * until interaction — sounds will begin working after the first click/tap).
 */
function createSoundPlayer() {
  let ctx = null;

  function ensureContext() {
    if (ctx) return;
    try {
      ctx = new AudioContext();
    } catch (e) {
      return;
    }
    // Resume on first user gesture so sounds start as soon as the user
    // interacts with the page (satisfies browser autoplay policy).
    const resume = () => { if (ctx.state === 'suspended') ctx.resume(); };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
  }

  return function play() {
    ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    const { currentTime: now, sampleRate } = ctx;

    // --- Tick: high-frequency transient (the latch releasing) ---
    const tickLen = Math.floor(sampleRate * 0.02);
    const tickBuf = ctx.createBuffer(1, tickLen, sampleRate);
    const tickData = tickBuf.getChannelData(0);
    for (let i = 0; i < tickLen; i += 1) {
      const t = i / tickLen;
      tickData[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t);
    }

    const tickSrc = ctx.createBufferSource();
    tickSrc.buffer = tickBuf;

    const tickFilter = ctx.createBiquadFilter();
    tickFilter.type = 'bandpass';
    tickFilter.frequency.value = 3200;
    tickFilter.Q.value = 2.5;

    const tickGain = ctx.createGain();
    tickGain.gain.setValueAtTime(0.18, now);

    // --- Clack: lower-frequency thud (the card landing) ---
    const clackLen = Math.floor(sampleRate * 0.05);
    const clackBuf = ctx.createBuffer(1, clackLen, sampleRate);
    const clackData = clackBuf.getChannelData(0);
    for (let i = 0; i < clackLen; i += 1) {
      const t = i / clackLen;
      clackData[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * (1 - t);
    }

    const clackSrc = ctx.createBufferSource();
    clackSrc.buffer = clackBuf;

    const clackFilter = ctx.createBiquadFilter();
    clackFilter.type = 'bandpass';
    clackFilter.frequency.value = 700;
    clackFilter.Q.value = 1.2;

    const clackGain = ctx.createGain();
    clackGain.gain.setValueAtTime(0, now);
    clackGain.gain.setValueAtTime(0.12, now + 0.008); // 8 ms after tick

    // Wire up and play
    tickSrc.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ctx.destination);

    clackSrc.connect(clackFilter);
    clackFilter.connect(clackGain);
    clackGain.connect(ctx.destination);

    tickSrc.start(now);
    clackSrc.start(now);
  };
}

function tick(cards, playClick) {
  const now = new Date();
  const digits = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  cards.forEach((card, i) => {
    const changed = card.dataset.value !== digits[i];
    animateDigit(card, digits[i]);
    // Stagger clicks by card index (8 ms apart) for a natural cascade effect
    if (changed && playClick) setTimeout(playClick, i * 8);
  });
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

  // Optional click sound — enabled with the 'sound' variant class
  const playClick = block.classList.contains('sound') ? createSoundPlayer() : null;

  // Sync interval to the start of the next second
  const msToNextSecond = 1000 - now.getMilliseconds();
  setTimeout(() => {
    tick(cards, playClick);
    setInterval(() => tick(cards, playClick), 1000);
  }, msToNextSecond);
}
