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

function tick(cards) {
  const now = new Date();
  const digits = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  cards.forEach((card, i) => animateDigit(card, digits[i]));
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

  // Sync interval to the start of the next second
  const msToNextSecond = 1000 - now.getMilliseconds();
  setTimeout(() => {
    tick(cards);
    setInterval(() => tick(cards), 1000);
  }, msToNextSecond);
}
