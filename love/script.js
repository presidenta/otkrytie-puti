/* ============================================================================
   ПЯТЬ ЯЗЫКОВ ЛЮБВИ · Genesis Solar Life
   script.js — логика теста. Текстов здесь нет, они в content-ru.js / content-ua.js.
   ----------------------------------------------------------------------------
   Как и в основной анкете, состояние хранит только ЧИСЛА: какой язык выбран
   в каждой паре и какой стороной показана пара. Текст подставляется при
   отрисовке из активного языка — поэтому переключение языка не сбивает
   ни прогресс, ни готовый результат.
   ============================================================================ */
(function () {
'use strict';

var CFG = {
  languages: ['ru', 'ua'],
  defaultLang: 'ru',
  storeKey: 'genesis_love_v1',
  submitUrl: ''          // адрес Google Apps Script; пусто — ничего не отправляется
};

var state = {
  lang:  CFG.defaultLang,
  name:  '',
  index: 0,
  picks: [],   // picks[i] = номер выбранного языка 1–5, либо null
  sides: [],   // sides[i] = true, если пара показана перевёрнутой
  date:  ''
};

var $ = function (id) { return document.getElementById(id); };
var elIntro = $('screen-intro'), elQuiz = $('screen-quiz'), elResult = $('screen-result');
var elName = $('user-name'), elToast = $('toast'), elToastText = $('toast-text');

function L()  { return window.LOVE[state.lang]; }
function U()  { return L().ui; }
function IT() { return L().items; }
function LG() { return L().langs; }
var TOTAL = 30;   // проверяется при загрузке

/* ============================================================
   Утилиты
   ============================================================ */
function t(str, vars) {
  if (!str) return '';
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, function (all, k) {
    return vars[k] !== undefined ? vars[k] : all;
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function load()   { try { return JSON.parse(localStorage.getItem(CFG.storeKey)); } catch (e) { return null; } }
function store(v) { try { localStorage.setItem(CFG.storeKey, JSON.stringify(v)); } catch (e) {} }

function today() {
  var d = new Date(), p = function (n) { return String(n).length < 2 ? '0' + n : String(n); };
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

var toastTimer = null;
function toast(text, ms) {
  elToastText.textContent = text;
  elToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { elToast.classList.remove('show'); }, ms || 4000);
}
elToast.addEventListener('click', function () { elToast.classList.remove('show'); });

function showScreen(el) {
  [elIntro, elQuiz, elResult].forEach(function (s) { s.classList.add('hidden'); });
  el.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   Проверка контента
   ============================================================ */
function validate() {
  var problems = [], base = window.LOVE[CFG.defaultLang];
  if (!base) { console.error('Нет языкового пакета ' + CFG.defaultLang); return false; }

  TOTAL = base.items.length;

  CFG.languages.forEach(function (code) {
    var pack = window.LOVE[code];
    if (!pack) { problems.push('Не подключён язык: ' + code); return; }
    if (pack.items.length !== base.items.length) {
      problems.push(code + ': пар ' + pack.items.length + ', а должно быть ' + base.items.length);
      return;
    }
    pack.items.forEach(function (it, i) {
      var b = base.items[i], where = code + ', пара ' + (i + 1);
      if (!it.a.t || !it.b.t) problems.push(where + ': пустое утверждение');
      if (it.a.k !== b.a.k || it.b.k !== b.b.k) problems.push(where + ': языки не совпадают с ' + CFG.defaultLang);
      if (it.a.k === it.b.k) problems.push(where + ': оба утверждения об одном языке');
    });
    for (var n = 1; n <= 5; n++) if (!pack.langs[n]) problems.push(code + ': нет описания языка ' + n);
  });

  /* Сбалансированность: каждый язык ровно 12 раз, каждое сочетание ровно 3 раза */
  var count = {}, combo = {};
  base.items.forEach(function (it) {
    count[it.a.k] = (count[it.a.k] || 0) + 1;
    count[it.b.k] = (count[it.b.k] || 0) + 1;
    var key = Math.min(it.a.k, it.b.k) + '-' + Math.max(it.a.k, it.b.k);
    combo[key] = (combo[key] || 0) + 1;
  });
  for (var k = 1; k <= 5; k++) {
    if (count[k] !== base.items.length * 2 / 5)
      problems.push('Язык ' + k + ' встречается ' + count[k] + ' раз вместо ' + (base.items.length * 2 / 5));
  }
  Object.keys(combo).forEach(function (key) {
    if (combo[key] !== 3) problems.push('Сочетание ' + key + ' встречается ' + combo[key] + ' раз вместо 3');
  });

  if (problems.length) {
    console.error('%c[Пять языков любви] Проблемы в контенте:', 'color:#FF4D4D;font-weight:bold');
    problems.forEach(function (p) { console.error('  • ' + p); });
    return false;
  }
  console.log('%c[Пять языков любви] Контент в порядке: ' + TOTAL +
              ' пар, каждый язык по ' + (TOTAL * 2 / 5) + ' раз.', 'color:#D4AF37');
  return true;
}

/* ============================================================
   Языки интерфейса
   ============================================================ */
function buildLangSwitch() {
  var box = $('lang-switch');
  box.innerHTML = '';
  CFG.languages.forEach(function (code) {
    if (!window.LOVE[code]) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (code === state.lang ? ' active' : '');
    b.textContent = window.LOVE[code].ui.label;
    b.addEventListener('click', function () {
      if (code === state.lang) return;
      state.lang = code;
      save();
      applyLanguage();
    });
    box.appendChild(b);
  });
}

function applyLanguage() {
  var u = U();
  document.documentElement.lang = u.code;
  document.title = u.brandTitle + ' | Genesis Solar Life';

  $('brand-tag').textContent   = u.brandTag;
  $('brand-title').textContent = u.brandTitle;
  $('brand-sub').textContent   = u.brandSub;

  $('intro-lead').innerHTML     = u.intro.lead;
  $('intro-note').innerHTML     = u.intro.note;
  $('name-label').textContent   = u.intro.nameLabel;
  elName.placeholder            = u.intro.namePlaceholder;
  $('btn-start').textContent    = u.intro.start;
  $('btn-last').textContent     = u.intro.last;
  $('intro-author').textContent = u.intro.author;
  $('pair-hint').textContent    = u.quiz.hint;
  $('btn-back').textContent     = u.quiz.back;

  var badges = $('intro-badges');
  badges.innerHTML = '';
  u.intro.badges.forEach(function (text) {
    var s = document.createElement('span');
    s.className = 'badge';
    s.textContent = text;
    badges.appendChild(s);
  });

  var resume = $('btn-resume');
  if (!resume.classList.contains('hidden')) {
    resume.textContent = t(u.intro.resume, { n: state.index + 1, m: TOTAL });
  }

  buildLangSwitch();
  if (!elQuiz.classList.contains('hidden')) renderPair();
  if (!elResult.classList.contains('hidden')) renderResult();
}

/* ============================================================
   Экран пары
   ============================================================ */
function renderPair() {
  var i = state.index, item = IT()[i], u = U();

  $('pair-counter').textContent = t(u.quiz.counter, { n: i + 1, m: TOTAL });
  $('pair-fill').style.width = ((i + 1) / TOTAL * 100) + '%';
  $('btn-back').classList.toggle('hidden', i === 0);

  /* sides[i] решает, какое утверждение показать первым — чтобы место
     на экране не влияло на выбор */
  var first  = state.sides[i] ? item.b : item.a;
  var second = state.sides[i] ? item.a : item.b;

  var box = $('pair');
  box.innerHTML = '';
  [first, second].forEach(function (opt) {
    var card = document.createElement('div');
    card.className = 'opt pair-card' + (state.picks[i] === opt.k ? ' chosen' : '');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = '<div class="pair-text">' + esc(opt.t) + '</div>';
    var choose = function () { pick(opt.k); };
    card.addEventListener('click', choose);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });
    box.appendChild(card);
  });

  box.classList.remove('swap');
  void box.offsetWidth;
  box.classList.add('swap');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pick(k) {
  state.picks[state.index] = k;
  save();
  if (state.index + 1 < TOTAL) {
    state.index++;
    renderPair();
  } else {
    finish();
  }
}

function back() {
  if (state.index === 0) return;
  state.index--;
  save();
  renderPair();
}

/* ============================================================
   Сохранение
   ============================================================ */
function save() {
  var d = load() || {};
  d.lang = state.lang;
  d.name = state.name;
  d.progress = { index: state.index, picks: state.picks, sides: state.sides };
  store(d);
}

function saveRun() {
  var d = load() || {};
  d.lang = state.lang;
  d.name = state.name;
  d.run = { picks: state.picks, sides: state.sides, name: state.name, date: state.date };
  delete d.progress;
  store(d);
}

/* ============================================================
   Расчёт
   ============================================================ */
function calculate() {
  var scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  state.picks.forEach(function (k) { if (k) scores[k]++; });

  var ranking = Object.keys(scores).map(function (k) {
    return { k: +k, n: scores[k], pct: Math.round(scores[k] / TOTAL * 100) };
  }).sort(function (a, b) { return b.n - a.n || a.k - b.k; });

  return {
    date: state.date || today(),
    name: state.name || U().intro.namePlaceholder,
    ranking: ranking,
    main: ranking[0],
    second: ranking[1],
    tie: ranking[0].n === ranking[1].n,
    flat: (ranking[0].n - ranking[4].n) <= 3
  };
}

/* ============================================================
   Результат
   ============================================================ */
function finish() {
  state.date = today();
  saveRun();
  renderResult();
  showScreen(elResult);
  submit();
}

function renderResult() {
  var r = calculate(), u = U().result, langs = LG();
  var M = langs[r.main.k], S = langs[r.second.k];

  var bars = r.ranking.map(function (row, idx) {
    var cls = idx === 0 ? ' top' : (idx === 1 ? ' second' : '');
    return '<div class="bar-row' + cls + '">' +
             '<div class="bar-name">' + esc(langs[row.k].name) + '</div>' +
             '<div class="bar-val">' + row.pct + '% · ' + t(u.ofPicks, { n: row.n, m: TOTAL }) + '</div>' +
             '<div class="bar-track"><div class="bar-fill" data-w="' + row.pct + '"></div></div>' +
           '</div>';
  }).join('');

  var how = M.how.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');

  var note = '';
  if (r.tie) {
    note = '<div class="pill"><h4>' + esc(u.balancedTitle) + '</h4><p>' + esc(u.balancedText) + '</p></div>';
  } else if (r.flat) {
    note = '<div class="pill"><h4>' + esc(u.flatTitle) + '</h4><p>' + esc(u.flatText) + '</p></div>';
  }

  elResult.innerHTML =
    '<div class="result-top">' +
      '<div class="result-chip">' + esc(u.chip) + '</div>' +
      '<div class="result-name">' + t(esc(u.dateLine), { name: '<b>' + esc(r.name) + '</b>', date: r.date }) + '</div>' +
    '</div>' +

    '<div class="block">' +
      '<div class="sub-label">' + esc(u.mainLabel) + '</div>' +
      '<div class="love-main">' +
        '<div class="vector-name shimmer-text">' + esc(M.name) + '</div>' +
        '<div class="love-pct">' + r.main.pct + '%</div>' +
      '</div>' +
      '<div class="vector-score">' + esc(M.tagline) + ' · ' + esc(t(u.ofPicks, { n: r.main.n, m: TOTAL })) + '</div>' +
      '<p class="vector-desc">' + esc(M.desc) + '</p>' +
      '<div class="spacer-s"></div><div class="pill"><p>' + esc(u.mirrorNote) + '</p></div>' +
      (note ? '<div class="spacer-s"></div>' + note : '') +
    '</div>' +

    '<div class="block">' +
      '<div class="block-title">' + esc(u.howTitle) + '</div>' +
      '<ul class="task-list">' + how + '</ul>' +
      '<div class="spacer-m"></div>' +
      '<div class="pill burn"><h4>' + esc(u.hurtsTitle) + '</h4><p>' + esc(M.hurts) + '</p></div>' +
    '</div>' +

    '<div class="block">' +
      '<div class="sub-label">' + esc(u.secondLabel) + '</div>' +
      '<div class="vector-name silver">' + esc(S.name) + '</div>' +
      '<div class="vector-score">' + r.second.pct + '% · ' + esc(S.tagline) + '</div>' +
      '<p class="vector-desc">' + esc(S.desc) + '</p>' +
    '</div>' +

    '<div class="block">' +
      '<div class="block-title">' + esc(u.allLabel) + '</div>' +
      '<div class="bars">' + bars + '</div>' +
    '</div>' +

    '<div class="actions no-print">' +
      '<button id="btn-copy" class="btn btn-emerald">' + esc(u.copy) + '</button>' +
      '<button id="btn-print" class="btn btn-sapphire">' + esc(u.print) + '</button>' +
    '</div>' +

    '<button id="btn-restart" class="btn btn-ghost no-print">' + esc(u.restart) + '</button>' +
    '<p class="legal">' + esc(t(u.legal, { date: r.date })) + '<br>' + esc(U().intro.author) + '</p>';

  requestAnimationFrame(function () {
    Array.prototype.forEach.call(elResult.querySelectorAll('[data-w]'), function (f) {
      f.style.width = f.dataset.w + '%';
    });
  });

  $('btn-copy').addEventListener('click', copyReport);
  $('btn-print').addEventListener('click', function () { window.print(); });
  $('btn-restart').addEventListener('click', function () { showScreen(elIntro); });
}

/* ============================================================
   Копирование
   ============================================================ */
function buildReport() {
  var r = calculate(), R = U().report, langs = LG();
  var M = langs[r.main.k], S = langs[r.second.k];
  var line = new Array(43).join('=');

  var out = [
    R.title,
    t(R.user, { name: r.name }),
    t(R.date, { date: r.date }),
    line,
    '',
    t(R.main, { name: M.name, pct: r.main.pct, n: r.main.n, m: TOTAL }),
    t(R.second, { name: S.name, pct: r.second.pct }),
    '',
    R.all
  ];
  r.ranking.forEach(function (row) {
    out.push('  ' + langs[row.k].name + ' — ' + row.pct + '%');
  });
  out.push('', R.how);
  M.how.forEach(function (x) { out.push('  • ' + x); });
  out.push('', t(R.hurts, { text: M.hurts }), '', line, R.footer);
  return out.join('\n');
}

function copyReport() {
  var text = buildReport();
  var ok = function () { toast(U().toast.copied, 3500); };
  var no = function () { toast(U().toast.copyFail, 5000); };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(ok, function () { legacyCopy(text) ? ok() : no(); });
  } else {
    legacyCopy(text) ? ok() : no();
  }
}

function legacyCopy(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length);
    var okFlag = document.execCommand('copy');
    document.body.removeChild(ta);
    return okFlag;
  } catch (e) { return false; }
}

/* ============================================================
   Отправка результата (включается адресом в CFG.submitUrl)
   ============================================================ */
function submit() {
  if (!CFG.submitUrl) return;
  var r = calculate(), langs = LG();
  var payload = {
    kind: 'love',
    ts: new Date().toISOString(),
    date: r.date,
    lang: state.lang,
    name: state.name || '',
    main: langs[r.main.k].name,
    mainPct: r.main.pct,
    second: langs[r.second.k].name,
    secondPct: r.second.pct,
    all: r.ranking.map(function (x) { return langs[x.k].name + ': ' + x.pct + '%'; }).join(' | ')
  };
  fetch(CFG.submitUrl, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  })['catch'](function () {});
}

/* ============================================================
   Запуск
   ============================================================ */
function startTest() {
  state.name  = (elName.value || '').trim().slice(0, 40);
  state.index = 0;
  state.date  = '';
  state.picks = [];
  state.sides = [];
  for (var i = 0; i < TOTAL; i++) {
    state.picks.push(null);
    state.sides.push(Math.random() < 0.5);
  }
  save();
  $('btn-resume').classList.add('hidden');
  showScreen(elQuiz);
  renderPair();
}

$('btn-start').addEventListener('click', startTest);
$('btn-back').addEventListener('click', back);
elName.addEventListener('keydown', function (e) { if (e.key === 'Enter') startTest(); });

document.addEventListener('keydown', function (e) {
  if (elQuiz.classList.contains('hidden')) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  var cards = $('pair').querySelectorAll('.pair-card');
  if (e.key === '1' && cards[0]) cards[0].click();
  if (e.key === '2' && cards[1]) cards[1].click();
});

(function init() {
  var saved = load() || {};
  if (saved.lang && window.LOVE[saved.lang]) state.lang = saved.lang;
  validate();
  if (saved.name) elName.value = saved.name;

  var p = saved.progress;
  if (p && p.picks && p.picks.length === TOTAL && p.sides && p.sides.length === TOTAL) {
    var btn = $('btn-resume');
    btn.classList.remove('hidden');
    state.index = p.index;
    btn.addEventListener('click', function () {
      state.name  = (elName.value || '').trim().slice(0, 40) || saved.name || '';
      state.picks = p.picks;
      state.sides = p.sides;
      state.index = p.index;
      showScreen(elQuiz);
      renderPair();
    });
  }

  if (saved.run && saved.run.picks && saved.run.picks.length === TOTAL) {
    var btnLast = $('btn-last');
    btnLast.classList.remove('hidden');
    btnLast.addEventListener('click', function () {
      state.picks = saved.run.picks;
      state.sides = saved.run.sides || [];
      state.name  = saved.run.name || '';
      state.date  = saved.run.date;
      renderResult();
      showScreen(elResult);
    });
  }

  applyLanguage();
})();

})();
