/* ============================================================================
   ПЯТЬ ЯЗЫКОВ ЛЮБВИ · Genesis Solar Life
   script.js — логика. Текстов здесь нет, они в content-ru.js / content-ua.js.
   ----------------------------------------------------------------------------
   Устроено так же, как основная анкета «Открытие Пути»:
     • таймер на каждый вопрос, чистые цифры, шкала меняет цвет;
     • в каждом вопросе отмечаются три ответа с приоритетами 1 · 2 · 3;
     • баллы 3 / 2 / 1, максимум по одному языку = число вопросов × 3,
       поэтому главный язык может дойти до 100%.

   Состояние хранит только ЧИСЛА: номера выбранных ответов и порядок показа.
   Текст подставляется при отрисовке — переключение языка ничего не сбивает.
   ============================================================================ */
(function () {
'use strict';

var CFG = {
  languages: ['ru', 'ua'],
  defaultLang: 'ru',
  storeKey: 'genesis_love_v3',

  timeLimit: 60,     // секунд на вопрос
  warnAt:    30,     // с этой секунды шкала жёлтая
  dangerAt:  10,     // с этой секунды красная
  weights:   [3, 2, 1],
  picks:     3,      // сколько ответов отмечает участник

  submitUrl: ''      // адрес Google Apps Script; пусто — ничего не отправляется
};

var state = {
  lang:  CFG.defaultLang,
  name:  '',
  index: 0,
  picks: [],   // picks[i] = [номер ответа|null] по приоритетам
  order: [],   // order[i] = порядок показа ответов вопроса i
  timedOut: [],   // на каких вопросах истекло время — там можно идти дальше неполным набором
  tick:  null,
  left:  CFG.timeLimit,
  date:  ''
};

var $ = function (id) { return document.getElementById(id); };
var elIntro = $('screen-intro'), elQuiz = $('screen-quiz'), elResult = $('screen-result');
var elName = $('user-name'), elToast = $('toast'), elToastText = $('toast-text'), elToastIcon = $('toast-icon');
var elOptions = $('options'), elNext = $('btn-next');
var elDigits = $('timer-digits'), elTimerFill = $('timer-fill');

function L()  { return window.LOVE[state.lang]; }
function U()  { return L().ui; }
function QS() { return L().questions; }
function LG() { return L().langs; }

var TOTAL = 20;      // уточняется при загрузке
var MAX_SCORE = 60;  // максимум по одному языку

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

function shuffle(arr) {                       // Fisher–Yates
  var a = arr.slice(), i, j, tmp;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function load()   { try { return JSON.parse(localStorage.getItem(CFG.storeKey)); } catch (e) { return null; } }
function store(v) { try { localStorage.setItem(CFG.storeKey, JSON.stringify(v)); } catch (e) {} }

function today() {
  var d = new Date(), p = function (n) { return String(n).length < 2 ? '0' + n : String(n); };
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

var toastTimer = null;
function toast(text, icon, ms) {
  elToastText.textContent = text;
  elToastIcon.textContent = icon || '💛';
  elToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { elToast.classList.remove('show'); }, ms || 4000);
}
elToast.addEventListener('click', function () { elToast.classList.remove('show'); });

/* Если что-то всё же сломается на чужом устройстве — человек увидит причину. */
window.addEventListener('error', function (e) {
  try { toast('Сбой: ' + (e.message || 'неизвестная ошибка'), '⚠️', 15000); } catch (x) {}
});

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

  TOTAL = base.questions.length;
  MAX_SCORE = TOTAL * CFG.weights[0];

  CFG.languages.forEach(function (code) {
    var pack = window.LOVE[code];
    if (!pack) { problems.push('Не подключён язык: ' + code); return; }
    if (pack.questions.length !== base.questions.length) {
      problems.push(code + ': вопросов ' + pack.questions.length + ', а должно быть ' + base.questions.length);
      return;
    }
    pack.questions.forEach(function (qu, i) {
      var b = base.questions[i], where = code + ', вопрос ' + (i + 1);
      if (!qu.q) problems.push(where + ': пустой текст вопроса');
      if (qu.o.length !== 5) { problems.push(where + ': ответов ' + qu.o.length + ', а должно быть 5'); return; }

      var seen = {};
      qu.o.forEach(function (opt, j) {
        if (!opt.t) problems.push(where + ', ответ ' + (j + 1) + ': пустой текст');
        if (opt.k !== b.o[j].k) problems.push(where + ', ответ ' + (j + 1) + ': язык не совпадает с ' + CFG.defaultLang);
        if (seen[opt.k]) problems.push(where + ': язык ' + opt.k + ' встречается дважды');
        seen[opt.k] = true;
      });
      for (var n = 1; n <= 5; n++) if (!seen[n]) problems.push(where + ': нет ответа для языка ' + n);
    });
    /* Каждый язык должен иметь полный набор рекомендаций */
    for (var m = 1; m <= 5; m++) {
      var lg = pack.langs[m];
      if (!lg) { problems.push(code + ': нет описания языка ' + m); continue; }
      ['name','tagline','desc','critical','phrase','hurts'].forEach(function (f) {
        if (!lg[f]) problems.push(code + ', язык ' + m + ': нет поля ' + f);
      });
      ['behave','never','self'].forEach(function (f) {
        if (!lg[f] || !lg[f].length) problems.push(code + ', язык ' + m + ': пустой список ' + f);
      });
    }
    ['dominant','dual','flat'].forEach(function (s) {
      if (!pack.shapes || !pack.shapes[s]) problems.push(code + ': нет формы профиля ' + s);
    });
  });

  if (CFG.picks > 5) problems.push('Нельзя отметить ' + CFG.picks + ' ответов из 5');

  if (problems.length) {
    console.error('%c[Пять языков любви] Проблемы в контенте:', 'color:#FF4D4D;font-weight:bold');
    problems.forEach(function (p) { console.error('  • ' + p); });
    return false;
  }
  console.log('%c[Пять языков любви] Контент в порядке: ' + TOTAL +
              ' вопросов, максимум по языку ' + MAX_SCORE + ' баллов.', 'color:#D4AF37');
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

  /* Вступление: зачем этот тест и что он снимает */
  $('why-title').textContent    = u.intro.whyTitle;
  $('why-body').innerHTML       = u.intro.why.map(function (p) { return '<p class="vector-desc why-p">' + p + '</p>'; }).join('');
  $('closes-title').textContent = u.intro.closesTitle;
  $('closes-list').innerHTML    = u.intro.closes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  $('closes-after').textContent = u.intro.closesAfter;
  $('name-label').textContent   = u.intro.nameLabel;
  elName.placeholder            = u.intro.namePlaceholder;
  $('btn-start').textContent    = u.intro.start;
  $('btn-last').textContent     = u.intro.last;
  $('intro-author').textContent = u.intro.author;
  $('btn-back').textContent     = u.quiz.back;
  $('timer-label').textContent  = u.quiz.timerLabel;

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
  if (!elQuiz.classList.contains('hidden')) renderQuestion(true);
  if (!elResult.classList.contains('hidden')) renderResult();
}

/* ============================================================
   Таймер
   ============================================================ */
function startTimer() {
  stopTimer();
  state.left = CFG.timeLimit;
  paintTimer();
  resumeTimer();
}

function resumeTimer() {
  if (state.tick || state.left <= 0) return;
  state.tick = setInterval(function () {
    state.left--;
    paintTimer();
    if (state.left <= 0) {
      stopTimer();
      if (isComplete()) nextQuestion();
      else {
        /* Время вышло, а отмечено меньше трёх — не запираем человека:
           разрешаем идти дальше с тем, что он успел отметить. */
        state.timedOut[state.index] = true;
        paintPicks();
        toast(U().toast.timeout, '🕊', 5000);
      }
    }
  }, 1000);
}

function stopTimer() { if (state.tick) { clearInterval(state.tick); state.tick = null; } }

function paintTimer() {
  var left = Math.max(0, state.left);
  elDigits.textContent = left;
  elTimerFill.style.width = (left / CFG.timeLimit * 100) + '%';
  elQuiz.classList.toggle('state-warn',   left <= CFG.warnAt && left > CFG.dangerAt);
  elQuiz.classList.toggle('state-danger', left <= CFG.dangerAt);
}

document.addEventListener('visibilitychange', function () {
  if (elQuiz.classList.contains('hidden')) return;
  if (document.hidden) stopTimer();
  else { paintTimer(); resumeTimer(); }
});

/* ============================================================
   Экран вопроса
   ============================================================ */
function renderQuestion(keepTimer) {
  var i = state.index, qu = QS()[i], u = U();

  $('q-counter').textContent = t(u.quiz.counter, { n: i + 1, m: TOTAL });
  $('q-fill').style.width = ((i + 1) / TOTAL * 100) + '%';
  $('q-title').textContent = qu.q;
  $('btn-back').classList.toggle('hidden', i === 0);

  elOptions.innerHTML = '';
  state.order[i].forEach(function (optIdx) {
    var card = document.createElement('div');
    card.className = 'opt';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.opt = optIdx;
    card.innerHTML = '<div class="slot"></div><div class="opt-text">' + esc(qu.o[optIdx].t) + '</div>';
    card.addEventListener('click', function () { pick(optIdx); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(optIdx); }
    });
    elOptions.appendChild(card);
  });

  elOptions.classList.remove('swap');
  void elOptions.offsetWidth;
  elOptions.classList.add('swap');

  paintPicks();
  if (!keepTimer) startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Клик по ответу: 1 → 2 → 3, повторный клик снимает именно эту цифру */
function pick(optIdx) {
  var slots = state.picks[state.index];
  var at = slots.indexOf(optIdx);

  if (at !== -1) {
    slots[at] = null;
  } else {
    var free = slots.indexOf(null);
    if (free === -1) { toast(U().toast.full, '↺', 2600); return; }
    slots[free] = optIdx;
  }
  paintPicks();
  save();
}

function paintPicks() {
  var slots = state.picks[state.index];
  var cards = elOptions.querySelectorAll('.opt');

  Array.prototype.forEach.call(cards, function (card) {
    var optIdx = +card.dataset.opt;
    var rank = slots.indexOf(optIdx) + 1;
    var slot = card.querySelector('.slot');
    if (rank) { card.dataset.rank = rank; slot.textContent = rank; }
    else { delete card.dataset.rank; slot.textContent = ''; }
  });

  var done = slots.filter(function (v) { return v !== null; }).length;
  var last = state.index === TOTAL - 1;
  var u = U();

  var enough  = done === CFG.picks;
  var allowed = enough || (state.timedOut[state.index] && done > 0);

  elNext.disabled = !allowed;
  elNext.textContent = allowed
    ? (last ? u.quiz.finish : u.quiz.next)
    : t(u.quiz.pickMore, { n: CFG.picks - done });
}

function isComplete() {
  return state.picks[state.index].every(function (v) { return v !== null; });
}

function nextQuestion() {
  stopTimer();
  if (state.index + 1 < TOTAL) {
    state.index++;
    save();
    renderQuestion();
  } else {
    finish();
  }
}

function back() {
  if (state.index === 0) return;
  stopTimer();
  state.index--;
  save();
  renderQuestion();
}

/* ============================================================
   Сохранение
   ============================================================ */
function save() {
  var d = load() || {};
  d.lang = state.lang;
  d.name = state.name;
  d.progress = { index: state.index, picks: state.picks, order: state.order };
  store(d);
}

function saveRun() {
  var d = load() || {};
  d.lang = state.lang;
  d.name = state.name;
  d.run = { picks: state.picks, order: state.order, name: state.name, date: state.date };
  delete d.progress;
  store(d);
}

/* ============================================================
   Расчёт: 1 место = 3 балла, 2 = 2, 3 = 1.
   Максимум по языку = число вопросов × 3, то есть 100%.
   ============================================================ */
function calculate() {
  var scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  state.picks.forEach(function (slots, qi) {
    slots.forEach(function (optIdx, slotPos) {
      if (optIdx === null || optIdx === undefined) return;
      scores[QS()[qi].o[optIdx].k] += CFG.weights[slotPos];
    });
  });

  var ranking = Object.keys(scores).map(function (k) {
    return { k: +k, n: scores[k], pct: Math.round(scores[k] / MAX_SCORE * 100) };
  }).sort(function (a, b) { return b.n - a.n || a.k - b.k; });

  return {
    date: state.date || today(),
    name: state.name || U().intro.namePlaceholder,
    ranking: ranking,
    main: ranking[0],
    second: ranking[1],
    shape: shapeOf(ranking)
  };
}

/* Форма профиля по разбросу процентов.
   Проверяется сверху вниз, поэтому вариант всегда ровно один. */
function shapeOf(ranking) {
  var spread = ranking[0].pct - ranking[4].pct;
  var gap    = ranking[0].pct - ranking[1].pct;
  if (spread <= 15) return 'flat';
  if (gap <= 10)    return 'dual';
  return 'dominant';
}

/* ============================================================
   Результат
   ============================================================ */
function finish() {
  stopTimer();
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
             '<div class="bar-val">' + row.pct + '% · ' + esc(t(u.ofPicks, { n: row.n, m: MAX_SCORE })) + '</div>' +
             '<div class="bar-track"><div class="bar-fill" data-w="' + row.pct + '"></div></div>' +
           '</div>';
  }).join('');

  var list = function (arr) {
    return '<ul class="task-list">' +
           arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
           '</ul>';
  };

  var shape = L().shapes[r.shape];

  elResult.innerHTML =
    '<div class="result-top">' +
      '<div class="result-chip">' + esc(u.chip) + '</div>' +
      '<div class="result-name">' + t(esc(u.dateLine), { name: '<b>' + esc(r.name) + '</b>', date: r.date }) + '</div>' +
    '</div>' +

    /* Главный язык и процент */
    '<div class="block">' +
      '<div class="sub-label">' + esc(u.mainLabel) + '</div>' +
      '<div class="love-main">' +
        '<div class="vector-name shimmer-text">' + esc(M.name) + '</div>' +
        '<div class="love-pct">' + r.main.pct + '%</div>' +
      '</div>' +
      '<div class="vector-score">' + esc(M.tagline) + ' · ' + esc(t(u.ofPicks, { n: r.main.n, m: MAX_SCORE })) + '</div>' +
      '<p class="vector-desc">' + esc(M.desc) + '</p>' +
      '<div class="spacer-s"></div>' +
      '<div class="pill"><h4>' + esc(u.shapeTitle) + ' · ' + esc(shape.title) + '</h4><p>' + esc(shape.text) + '</p></div>' +
      '<div class="spacer-s"></div>' +
      '<div class="pill"><p>' + esc(u.mirrorNote) + '</p></div>' +
    '</div>' +

    /* Что критично + что ранит */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.criticalTitle) + '</div>' +
      '<p class="vector-desc">' + esc(M.critical) + '</p>' +
      '<div class="spacer-m"></div>' +
      '<div class="pill burn"><h4>' + esc(u.hurtsTitle) + '</h4><p>' + esc(M.hurts) + '</p></div>' +
    '</div>' +

    /* Инструкция для близкого человека */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.behaveTitle) + '</div>' +
      list(M.behave) +
      '<div class="spacer-m"></div>' +
      '<div class="sub-label">' + esc(u.neverTitle) + '</div>' +
      list(M.never) +
    '</div>' +

    /* Готовая фраза, которую можно переслать */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.phraseTitle) + '</div>' +
      '<blockquote class="love-phrase">' + esc(M.phrase) + '</blockquote>' +
    '</div>' +

    /* Рекомендации самому участнику */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.selfTitle) + '</div>' +
      list(M.self) +
    '</div>' +

    /* Дополняющий язык */
    '<div class="block">' +
      '<div class="sub-label">' + esc(u.secondLabel) + '</div>' +
      '<div class="vector-name silver">' + esc(S.name) + '</div>' +
      '<div class="vector-score">' + r.second.pct + '% · ' + esc(S.tagline) + '</div>' +
      '<p class="vector-desc">' + esc(S.desc) + '</p>' +
    '</div>' +

    /* Шкала по всем пяти */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.allLabel) + '</div>' +
      '<div class="bars">' + bars + '</div>' +
      '<div class="spacer-m"></div>' +
      '<div class="pill"><p>' + esc(u.tankNote) + '</p></div>' +
    '</div>' +

    /* Если у близкого другой язык */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.differsTitle) + '</div>' +
      u.differsText.map(function (p) { return '<p class="vector-desc why-p">' + p + '</p>'; }).join('') +
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
    t(R.main, { name: M.name, pct: r.main.pct, n: r.main.n, m: MAX_SCORE }),
    t(R.second, { name: S.name, pct: r.second.pct }),
    '',
    R.all
  ];
  r.ranking.forEach(function (row) {
    out.push('  ' + langs[row.k].name + ' — ' + row.pct + '%');
  });
  out.push('', R.critical, '  ' + M.critical);
  out.push('', R.behave);
  M.behave.forEach(function (x) { out.push('  • ' + x); });
  out.push('', R.never);
  M.never.forEach(function (x) { out.push('  • ' + x); });
  out.push('', R.self);
  M.self.forEach(function (x) { out.push('  • ' + x); });
  out.push('', R.phrase, '  «' + M.phrase + '»');
  out.push('', t(R.hurts, { text: M.hurts }), '', line, R.footer);
  return out.join('\n');
}

function copyReport() {
  var text = buildReport();
  var ok = function () { toast(U().toast.copied, '✅', 3500); };
  var no = function () { toast(U().toast.copyFail, '⚠️', 5000); };
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
  state.order = [];
  state.timedOut = [];
  for (var i = 0; i < TOTAL; i++) {
    var slots = [], j;
    for (j = 0; j < CFG.picks; j++) slots.push(null);
    state.picks.push(slots);
    state.order.push(shuffle([0, 1, 2, 3, 4]));   // ответы перемешиваются
    state.timedOut.push(false);
  }
  save();
  $('btn-resume').classList.add('hidden');
  showScreen(elQuiz);
  renderQuestion();
}

elNext.addEventListener('click', function () { if (!elNext.disabled) nextQuestion(); });
$('btn-start').addEventListener('click', startTest);
$('btn-back').addEventListener('click', back);
elName.addEventListener('keydown', function (e) { if (e.key === 'Enter') startTest(); });

/* Клавиши 1–5 отмечают ответ по порядку на экране */
document.addEventListener('keydown', function (e) {
  if (elQuiz.classList.contains('hidden')) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  var n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5) pick(state.order[state.index][n - 1]);
});

(function init() {
  var saved = load() || {};
  if (saved.lang && window.LOVE[saved.lang]) state.lang = saved.lang;
  validate();
  if (saved.name) elName.value = saved.name;

  var p = saved.progress;
  if (p && p.picks && p.picks.length === TOTAL && p.order && p.order.length === TOTAL &&
      p.picks[0] && p.picks[0].length === CFG.picks) {
    var btn = $('btn-resume');
    btn.classList.remove('hidden');
    state.index = p.index;
    btn.addEventListener('click', function () {
      state.name  = (elName.value || '').trim().slice(0, 40) || saved.name || '';
      state.picks = p.picks;
      state.order = p.order;
      state.index = p.index;
      state.timedOut = [];
      showScreen(elQuiz);
      renderQuestion();
    });
  }

  if (saved.run && saved.run.picks && saved.run.picks.length === TOTAL) {
    var btnLast = $('btn-last');
    btnLast.classList.remove('hidden');
    btnLast.addEventListener('click', function () {
      state.picks = saved.run.picks;
      state.order = saved.run.order || [];
      state.name  = saved.run.name || '';
      state.date  = saved.run.date;
      renderResult();
      showScreen(elResult);
    });
  }

  applyLanguage();
})();

})();
