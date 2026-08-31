/* ============================================================================
   МАТРИЦА ИГРОКА · Genesis Solar Life
   script.js — логика. Текстов здесь нет, они в content-ru.js / content-ua.js.
   ----------------------------------------------------------------------------
   УСТРОЙСТВО

   22 Аркана. В каждом один выбор из пяти. Четыре варианта — ступени
   субъектности (кто в предложении подлежащее), пятый — «такого не
   случалось»: в проценты не идёт, считается отдельно.

   Шут (первый вопрос) в подсчёт не входит: он показывается отдельной
   строкой в результате. Остальное делится на три семёрки по семь Арканов.

   Состояние хранит ТОЛЬКО ЧИСЛА: номер выбранного варианта и порядок
   показа. Текст подставляется при отрисовке, поэтому переключение языка
   посреди анкеты ничего не сбивает.
   ============================================================================ */
(function () {
'use strict';

var CFG = {
  languages:   ['ru', 'ua'],
  defaultLang: 'ru',
  storeKey:    'genesis_matrix_v1',

  timeLimit: 45,     // секунд на вопрос: вопрос короткий, ответы короткие
  warnAt:    20,
  dangerAt:  8,

  /* Пороги для вердикта тому, кто дал ссылку */
  strongZoneAt: 50,  // семёрка считается сильной с этого процента
  authorAt:     70,  // общий процент, с которого человек считается автором
  manyZerosAt:  0.4, // доля ответов нулевого уровня, после которой «много»
  flatFlagAt:   19,  // столько максимумов из 21 — повод проверить разговором
  noExpFlagAt:  5,   // столько «не случалось» — человек просто молод

  /* Адрес Google Apps Script для сбора ответов.
     Пока строка пустая — приложение НИЧЕГО никуда не отправляет.
     Это отдельная анкета со своим набором колонок, поэтому и скрипт
     нужен отдельный: адрес основной анкеты сюда не подходит. */
  submitUrl: ''
};

var state = {
  lang:    CFG.defaultLang,
  name:    '',
  consent: false,
  index:   0,
  picks:   [],   // picks[i] = номер выбранного варианта или null
  order:   [],   // order[i] = порядок показа вариантов вопроса i
  tick:    null,
  left:    CFG.timeLimit,
  date:    ''
};

var $ = function (id) { return document.getElementById(id); };
var elIntro = $('screen-intro'), elQuiz = $('screen-quiz'), elResult = $('screen-result');
var elOptions = $('options'), elNext = $('btn-next'), elBack = $('btn-back');
var elName = $('user-name'), elConsent = $('consent-box');
var elDigits = $('timer-digits'), elTimerFill = $('timer-fill');
var elToast = $('toast'), elToastText = $('toast-text'), elToastIcon = $('toast-icon');

function L()  { return window.MATRIX[state.lang]; }
function U()  { return L().ui; }
function QS() { return L().questions; }

var TOTAL = 22;

/* ============================================================
   1. УТИЛИТЫ
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

/* Фишер–Йейтс. Именно он, а не sort со случайным компаратором:
   тот даёт неравномерные перестановки и подсвечивает исходный порядок. */
function shuffle(arr) {
  var a = arr.slice(), i, j, tmp;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function load()  { try { return JSON.parse(localStorage.getItem(CFG.storeKey)); } catch (e) { return null; } }
function store(v) { try { localStorage.setItem(CFG.storeKey, JSON.stringify(v)); } catch (e) {} }

function today() {
  var d = new Date(), p = function (n) { return String(n).length < 2 ? '0' + n : String(n); };
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

var toastTimer = null;
function toast(text, icon, ms) {
  elToastText.textContent = text;
  elToastIcon.textContent = icon || '🎴';
  elToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { elToast.classList.remove('show'); }, ms || 4000);
}
elToast.addEventListener('click', function () { elToast.classList.remove('show'); });

/* Если что-то сломается на чужом устройстве — человек увидит причину,
   а не пустой экран. */
window.addEventListener('error', function (e) {
  try { toast('Сбой: ' + (e.message || 'неизвестная ошибка'), '⚠️', 15000); } catch (x) {}
});

function showScreen(el) {
  [elIntro, elQuiz, elResult].forEach(function (s) { s.classList.add('hidden'); });
  el.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   2. ПРОВЕРКА КОНТЕНТА
   Расхождение языков ловится здесь, а не у участника на экране.
   ============================================================ */
function validateContent() {
  var problems = [];
  var base = window.MATRIX[CFG.defaultLang];
  if (!base) { console.error('Нет языкового пакета ' + CFG.defaultLang); return false; }

  CFG.languages.forEach(function (code) {
    var pack = window.MATRIX[code];
    if (!pack) { problems.push('Не подключён язык: ' + code); return; }
    if (pack.questions.length !== base.questions.length) {
      problems.push(code + ': вопросов ' + pack.questions.length + ', а должно быть ' + base.questions.length);
      return;
    }
    pack.questions.forEach(function (q, i) {
      var b = base.questions[i], where = code + ', вопрос #' + (i + 1);
      if (q.id !== b.id)     problems.push(where + ': id ' + q.id + ' вместо ' + b.id);
      if (q.sept !== b.sept) problems.push(where + ': семёрка ' + q.sept + ' вместо ' + b.sept);
      if (!q.title)          problems.push(where + ': пустой заголовок');
      if (q.options.length !== b.options.length) {
        problems.push(where + ': вариантов ' + q.options.length + ', а должно быть ' + b.options.length);
        return;
      }
      q.options.forEach(function (o, j) {
        if (!o.text) problems.push(where + ', вариант ' + (j + 1) + ': пустой текст');
        if (o.lvl !== b.options[j].lvl)
          problems.push(where + ', вариант ' + (j + 1) + ': ступень ' + o.lvl + ' вместо ' + b.options[j].lvl);
      });
    });
    [1, 2, 3].forEach(function (s) {
      if (!pack.septs[s])  problems.push(code + ': нет описания семёрки ' + s);
      if (!pack.advice[s]) problems.push(code + ': нет рекомендации по семёрке ' + s);
    });
    if (!pack.levels || pack.levels.length !== 3) problems.push(code + ': уровней должно быть три');
  });

  /* Семёрки должны быть ровными: по семь Арканов в каждой */
  var count = { 0: 0, 1: 0, 2: 0, 3: 0 };
  base.questions.forEach(function (q) { count[q.sept]++; });
  [1, 2, 3].forEach(function (s) {
    if (count[s] !== 7) problems.push('В семёрке ' + s + ' вопросов ' + count[s] + ', а должно быть 7');
  });
  if (count[0] !== 1) problems.push('Шут должен быть ровно один, найдено ' + count[0]);

  if (problems.length) {
    console.error('%c[Матрица Игрока] Проблемы в контенте:', 'color:#FF4D4D;font-weight:bold');
    problems.forEach(function (p) { console.error('  • ' + p); });
    return false;
  }
  console.log('%c[Матрица Игрока] Контент в порядке: ' + base.questions.length +
              ' Арканов, три семёрки по семь, языки: ' + CFG.languages.join(', ') + '.',
              'color:#D4AF37');
  return true;
}

/* ============================================================
   3. ЯЗЫК
   ============================================================ */
function buildLangSwitch() {
  var box = $('lang-switch');
  box.innerHTML = '';
  CFG.languages.forEach(function (code) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (code === state.lang ? ' active' : '');
    b.textContent = code.toUpperCase();
    b.addEventListener('click', function () { switchLang(code); });
    box.appendChild(b);
  });
}

function switchLang(code) {
  if (code === state.lang || !window.MATRIX[code]) return;
  state.lang = code;
  document.documentElement.lang = code;
  buildLangSwitch();
  applyLanguage();
  if (!elQuiz.classList.contains('hidden')) renderQuestion(true);
  if (!elResult.classList.contains('hidden')) renderResult();
  saveState();
}

function applyLanguage() {
  var u = U(), i = u.intro;

  $('brand-tag').textContent   = u.brandTag;
  $('brand-title').textContent = u.brandTitle;
  $('brand-sub').textContent   = u.brandSub;
  document.title = u.brandTitle + ' | Genesis Solar Life';

  $('intro-lead').textContent  = i.lead;
  $('why-title').textContent   = i.whyTitle;
  $('why-body').innerHTML      = i.whyBody;
  $('gain-title').textContent  = i.forWhoTitle;

  var list = $('gain-list');
  list.innerHTML = '';
  i.forWho.forEach(function (x) {
    var li = document.createElement('li');
    li.textContent = x;
    list.appendChild(li);
  });
  $('gain-after').textContent = i.forWhoAfter;

  $('intro-note').innerHTML = i.note;

  var badges = $('intro-badges');
  badges.innerHTML = '';
  i.badges.forEach(function (x) {
    var d = document.createElement('div');
    d.className = 'badge';
    d.textContent = x;
    badges.appendChild(d);
  });

  $('name-label').textContent    = i.nameLabel;
  elName.placeholder             = i.namePlaceholder;
  $('consent-text').textContent  = i.consent;
  $('consent-open').textContent  = i.consentOpen;
  $('btn-start').textContent     = i.start;
  $('btn-resume').textContent    = i.resume;
  $('btn-last').textContent      = i.last;
  $('intro-author').textContent  = i.author;

  $('timer-label').textContent = u.quiz.timerLabel;
  $('q-hint').textContent      = u.quiz.hintOne;
  elBack.textContent           = u.quiz.back;

  $('modal-title').textContent = L().agreement.title;
  $('modal-body').innerHTML    = L().agreement.body.map(function (p) {
    return '<p>' + esc(p) + '</p>';
  }).join('');
  $('modal-close').textContent = L().agreement.close;
}

/* ============================================================
   4. ТАЙМЕР
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
      /* Время вышло, а ответа нет — не запираем человека,
         просто подсказываем, что пора выбрать. */
      if (state.picks[state.index] === null) toast(U().toast.timeout, '⏳', 5000);
      else nextQuestion();
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
   5. ЭКРАН ВОПРОСА
   ============================================================ */
function renderQuestion(keepTimer) {
  var i = state.index, q = QS()[i], u = U();

  $('q-counter').textContent = t(u.quiz.counter, { n: i + 1, m: TOTAL });
  $('q-fill').style.width = ((i + 1) / TOTAL * 100) + '%';
  $('q-arcana').textContent = q.arcana;
  $('q-title').textContent = q.title;
  $('q-hint').textContent = u.quiz.hintOne;

  elOptions.innerHTML = '';
  state.order[i].forEach(function (optIdx) {
    var card = document.createElement('div');
    card.className = 'opt';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.opt = optIdx;
    card.innerHTML = '<div class="slot"></div><div class="opt-text">' + esc(q.options[optIdx].text) + '</div>';
    card.addEventListener('click', function () { pick(optIdx); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(optIdx); }
    });
    elOptions.appendChild(card);
  });

  elOptions.classList.remove('swap');
  void elOptions.offsetWidth;
  elOptions.classList.add('swap');

  paintPick();
  elBack.classList.toggle('hidden', i === 0);
  if (!keepTimer) startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pick(optIdx) {
  state.picks[state.index] = (state.picks[state.index] === optIdx) ? null : optIdx;
  paintPick();
  saveState();
}

function paintPick() {
  var chosen = state.picks[state.index];
  var cards = elOptions.querySelectorAll('.opt');

  Array.prototype.forEach.call(cards, function (card) {
    var isOn = (+card.dataset.opt === chosen);
    if (isOn) { card.dataset.rank = '✓'; card.querySelector('.slot').textContent = '✓'; }
    else      { delete card.dataset.rank; card.querySelector('.slot').textContent = ''; }
  });

  var u = U(), last = state.index === TOTAL - 1;
  elNext.disabled = (chosen === null);
  elNext.textContent = (chosen === null) ? u.quiz.hintOne : (last ? u.quiz.finish : u.quiz.next);
}

function nextQuestion() {
  stopTimer();
  if (state.index + 1 < TOTAL) {
    state.index++;
    saveState();
    renderQuestion();
  } else {
    finish();
  }
}

function prevQuestion() {
  if (state.index === 0) return;
  stopTimer();
  state.index--;
  saveState();
  renderQuestion();
}

/* ============================================================
   6. СОХРАНЕНИЕ
   ============================================================ */
function saveState() {
  var d = load() || {};
  d.lang = state.lang;
  d.name = state.name;
  d.consent = state.consent;
  d.progress = { index: state.index, picks: state.picks, order: state.order, at: Date.now() };
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

function progressFits(p) {
  if (!p || !p.picks || p.picks.length !== TOTAL || !p.order) return false;
  return p.order.every(function (ord, i) {
    return ord && ord.length === QS()[i].options.length;
  });
}

/* ============================================================
   7. РАСЧЁТ
   ============================================================ */
function calculate() {
  var qs = QS();
  var sept = { 1: { sum: 0, n: 0 }, 2: { sum: 0, n: 0 }, 3: { sum: 0, n: 0 } };
  var zeros = 0, threes = 0, noExp = 0, answered = 0, sum = 0;
  var foolText = '—', foolLvl = null;

  state.picks.forEach(function (idx, i) {
    var q = qs[i];
    if (idx === null || idx === undefined) return;
    var o = q.options[idx];

    if (q.sept === 0) {                      // Шут: отдельная строка, не в подсчёт
      foolText = o.text;
      foolLvl  = o.lvl;
      return;
    }
    if (o.lvl === null) { noExp++; return; } // «не случалось» — своя графа

    sept[q.sept].sum += o.lvl;
    sept[q.sept].n++;
    sum += o.lvl;
    answered++;
    if (o.lvl === 0) zeros++;
    if (o.lvl === 3) threes++;
  });

  /* Проценты считаются от того, на что человек реально ответил:
     «не случалось» не занижает результат, а выносится отдельно. */
  var pctOf = function (s) { return s.n ? Math.round(s.sum / (s.n * 3) * 100) : null; };
  var septPct = { 1: pctOf(sept[1]), 2: pctOf(sept[2]), 3: pctOf(sept[3]) };
  var totalPct = answered ? Math.round(sum / (answered * 3) * 100) : 0;

  var withData = [1, 2, 3].filter(function (s) { return septPct[s] !== null; });
  var strong = null, weak = null;
  withData.forEach(function (s) {
    if (strong === null || septPct[s] > septPct[strong]) strong = s;
    if (weak   === null || septPct[s] < septPct[weak])   weak   = s;
  });

  var level = L().levels.filter(function (x) { return totalPct >= x.min; })[0] || L().levels[L().levels.length - 1];

  /* Преобладающая ступень — для короткой заметки участнику */
  var tally = { 0: 0, 1: 0, 2: 0, 3: 0 };
  state.picks.forEach(function (idx, i) {
    if (idx === null || qs[i].sept === 0) return;
    var lvl = qs[i].options[idx].lvl;
    if (lvl !== null) tally[lvl]++;
  });
  var mode = 0;
  [1, 2, 3].forEach(function (k) { if (tally[k] > tally[mode]) mode = k; });

  var zerosShare = answered ? zeros / answered : 0;
  var strongZone = withData.some(function (s) { return septPct[s] >= CFG.strongZoneAt; });
  var manyZeros  = zerosShare > CFG.manyZerosAt;

  /* Вердикт строится на трёх вещах: есть ли сильная зона, много ли ответов
     нулевого уровня и дотягивает ли человек до авторства в целом.
     Без последнего условия тот, кто везде выбирает из предложенного,
     получал бы «Автор» — а он условий не меняет, он хороший исполнитель. */
  var authorLevel = totalPct >= CFG.authorAt;
  var verdictKey;
  if (strongZone && manyZeros)        verdictKey = 'uneven';
  else if (!strongZone && manyZeros)  verdictKey = 'autopilot';
  else if (strongZone && authorLevel) verdictKey = 'author';
  else                                verdictKey = 'executor';

  return {
    date: state.date || today(),
    name: state.name || U().intro.namePlaceholder,
    septPct: septPct,
    totalPct: totalPct,
    level: level,
    strong: strong,
    weak: weak,
    mode: mode,
    zeros: zeros,
    zerosShare: zerosShare,
    threes: threes,
    noExp: noExp,
    answered: answered,
    foolText: foolText,
    foolLvl: foolLvl,
    verdictKey: verdictKey,
    flagFlat: threes >= CFG.flatFlagAt,
    flagNoExp: noExp >= CFG.noExpFlagAt
  };
}

/* ============================================================
   8. РЕЗУЛЬТАТ УЧАСТНИКА
   Вердикт для того, кто дал ссылку, здесь НЕ показывается:
   он уходит в таблицу вместе с ответами.
   ============================================================ */
function finish() {
  stopTimer();
  state.date = today();
  saveRun();
  renderResult();
  showScreen(elResult);
  submitResult(calculate());
}

function renderResult() {
  var r = calculate(), u = U().result, S = L().septs, A = L().advice;

  var bar = function (s) {
    var pct = r.septPct[s];
    var cls = pct === null ? ' no-data' : (pct >= 66 ? ' high' : (pct >= 36 ? ' mid' : ' low'));
    return '<div class="bar-row' + cls + '">' +
             '<div class="bar-name">' + esc(S[s].name) + '<span class="bar-arcana">' + esc(S[s].arcana) + '</span></div>' +
             '<div class="bar-val">' + (pct === null ? '—' : pct + '%') + '</div>' +
             '<div class="bar-track"><div class="bar-fill" data-w="' + (pct === null ? 0 : pct) + '"></div></div>' +
           '</div>';
  };

  var html =
  '<div class="result-top">' +
    '<div class="result-chip">' + esc(u.chip) + '</div>' +
    '<div class="result-name">' + t(esc(u.dateLine), { name: '<b>' + esc(r.name) + '</b>', date: r.date }) + '</div>' +
  '</div>' +

  /* 1 · уровень */
  '<div class="block">' +
    '<div class="block-title">' + esc(u.levelTitle) + '</div>' +
    '<div class="level-row">' +
      '<div class="level-name shimmer-text">' + esc(r.level.title) + '</div>' +
      '<div class="level-pct">' + r.totalPct + '%</div>' +
    '</div>' +
    '<p class="vector-desc">' + esc(r.level.desc) + '</p>' +
    '<div class="spacer-s"></div>' +
    '<div class="pill"><p>' + esc(L().levelNote[r.mode]) + '</p></div>' +
  '</div>' +

  /* 2 · три шкалы */
  '<div class="block">' +
    '<div class="block-title">' + esc(u.scaleTitle) + '</div>' +
    '<div class="bars">' + bar(1) + bar(2) + bar(3) + '</div>' +
    '<p class="svp-missing">' + esc(u.scaleNote) + '</p>' +
  '</div>';

  /* 3 и 4 · сильная и слабая зона */
  if (r.strong !== null) {
    html +=
    '<div class="block">' +
      '<div class="block-title">' + esc(u.strongTitle) + '</div>' +
      '<div class="sub-label">' + esc(u.strongLead) + '</div>' +
      '<div class="vector-name shimmer-text" style="font-size:1.3rem">' + esc(S[r.strong].name) + '</div>' +
      '<p class="vector-desc">' + esc(S[r.strong].high) + '</p>' +
    '</div>';
  }

  if (r.weak !== null) {
    html +=
    '<div class="block">' +
      '<div class="block-title">' + esc(u.weakTitle) + '</div>' +
      '<div class="sub-label">' + esc(u.weakLead) + '</div>' +
      '<div class="vector-name silver" style="font-size:1.3rem">' + esc(S[r.weak].name) + '</div>' +
      '<p class="vector-desc">' + esc(S[r.weak].low) + '</p>' +
      '<div class="spacer-m"></div>' +
      '<div class="sub-label">' + esc(A[r.weak].title) + '</div>' +
      '<p class="vector-desc">' + A[r.weak].text + '</p>' +
    '</div>' +

    /* 5 · один шаг */
    '<div class="block step-block">' +
      '<div class="block-title">' + esc(u.stepTitle) + '</div>' +
      '<p class="step-text">' + esc(A[r.weak].step) + '</p>' +
    '</div>';
  }

  /* Шут и «не проходил» */
  html +=
  '<div class="block">' +
    '<div class="sub-label">' + esc(u.foolTitle) + '</div>' +
    '<div class="quote-line">' + esc(r.foolText) + '</div>' +
    (r.noExp ? '<div class="spacer-m"></div>' +
               '<div class="sub-label">' + esc(u.noExpTitle) + '</div>' +
               '<p class="vector-desc">' + esc(t(u.noExpText, { n: r.noExp })) + '</p>' : '') +
    '<div class="spacer-m"></div>' +
    '<p class="svp-missing">' + esc(u.sharedNote) + '</p>' +
  '</div>' +

  '<div class="actions no-print">' +
    '<button id="btn-copy" class="btn btn-emerald">' + esc(u.copy) + '</button>' +
    '<button id="btn-print" class="btn btn-sapphire">' + esc(u.print) + '</button>' +
  '</div>' +
  '<button id="btn-restart" class="btn btn-ghost no-print">' + esc(u.restart) + '</button>' +
  '<p class="legal">' + esc(t(u.legal, { date: r.date })) + '</p>';

  elResult.innerHTML = html;

  /* Шкалы наполняются после вставки — чтобы анимация была видна */
  setTimeout(function () {
    var fills = elResult.querySelectorAll('.bar-fill');
    Array.prototype.forEach.call(fills, function (f) { f.style.width = f.dataset.w + '%'; });
  }, 60);

  $('btn-copy').addEventListener('click', copyReport);
  $('btn-print').addEventListener('click', function () { window.print(); });
  $('btn-restart').addEventListener('click', restart);
}

/* ============================================================
   9. ТЕКСТОВЫЙ ОТЧЁТ
   ============================================================ */
function buildReport() {
  var r = calculate(), R = U().result.report, S = L().septs, A = L().advice;
  var line = new Array(45).join('=');
  var out = [
    R.title,
    t(R.user, { name: r.name }),
    t(R.date, { date: r.date }),
    line,
    '',
    t(R.level, { title: r.level.title, pct: r.totalPct }),
    '',
    R.scales
  ];
  [1, 2, 3].forEach(function (s) {
    out.push('  ' + S[s].name + ' — ' + (r.septPct[s] === null ? '—' : r.septPct[s] + '%'));
  });
  out.push('');
  if (r.strong !== null) out.push(t(R.strong, { name: S[r.strong].name }));
  if (r.weak !== null) {
    out.push(t(R.weak, { name: S[r.weak].name }));
    out.push('');
    out.push(t(R.step, { text: A[r.weak].step }));
  }
  out.push('');
  out.push(t(R.fool, { text: r.foolText }));
  if (r.noExp) out.push(t(R.noExp, { n: r.noExp }));
  out.push('');
  out.push(line);
  out.push(R.footer);
  return out.join('\n');
}

function copyReport() {
  var text = buildReport();
  var done = function () { toast(U().toast.copied, '📋', 3000); };
  var fail = function () { toast(U().toast.copyFail, '⚠️', 5000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fail);
  } else {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch (e) { fail(); }
  }
}

/* ============================================================
   10. ОТПРАВКА ОРГАНИЗАТОРУ
   Здесь и только здесь появляется вердикт: участник его не видит.
   ============================================================ */
function buildPayload(r) {
  var E = L().employer, qs = QS();
  var answers = state.picks.map(function (idx, i) {
    return qs[i].arcana + ': ' + (idx === null ? '—' : qs[i].options[idx].text);
  }).join('\n');

  return {
    kind:      'matrix',
    ts:        new Date().toISOString(),
    date:      r.date,
    lang:      state.lang,
    name:      state.name || '',
    consent:   state.consent ? 'да' : '',
    level:     r.level.title,
    totalPct:  r.totalPct,
    sept1:     r.septPct[1],
    sept2:     r.septPct[2],
    sept3:     r.septPct[3],
    strong:    r.strong ? L().septs[r.strong].name : '',
    weak:      r.weak ? L().septs[r.weak].name : '',
    zeros:     r.zeros,
    zerosPct:  Math.round(r.zerosShare * 100),
    threes:    r.threes,
    noExp:     r.noExp,
    verdict:   E[r.verdictKey].title,
    verdictText: E[r.verdictKey].text,
    flagFlat:  r.flagFlat ? t(E.flagFlat, { n: r.threes, m: r.answered }) : '',
    flagNoExp: r.flagNoExp ? t(E.flagNoExp, { n: r.noExp }) : '',
    fool:      r.foolText,
    answers:   answers
  };
}

function postResult(payload) {
  if (!CFG.submitUrl) return Promise.resolve();
  return fetch(CFG.submitUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

function submitResult(r) {
  if (!CFG.submitUrl) return;
  var payload = buildPayload(r);
  postResult(payload).then(function () {
    toast(U().toast.sent, '📨', 3000);
  }, function () {
    /* Нет сети — кладём в очередь, уйдёт при следующем открытии */
    var d = load() || {};
    d.outbox = (d.outbox || []).concat([payload]).slice(-20);
    store(d);
    toast(U().toast.queued, '📡', 5000);
  });
}

function flushOutbox() {
  if (!CFG.submitUrl) return;
  var d = load() || {};
  var pending = d.outbox || [];
  if (!pending.length) return;
  var done = 0, ok = true;
  pending.forEach(function (item) {
    postResult(item).then(function () { done++; settle(); }, function () { ok = false; done++; settle(); });
  });
  function settle() {
    if (done < pending.length) return;
    if (ok) { var fresh = load() || {}; fresh.outbox = []; store(fresh); }
  }
}

/* ============================================================
   11. ЗАПУСК
   ============================================================ */
function newRun() {
  state.index = 0;
  state.date = '';
  state.picks = [];
  state.order = [];
  for (var i = 0; i < TOTAL; i++) {
    state.picks.push(null);
    state.order.push(shuffle(QS()[i].options.map(function (o, j) { return j; })));
  }
}

function startQuiz() {
  state.name = (elName.value || '').trim().slice(0, 40);
  state.consent = elConsent.checked;
  if (!state.consent) { toast(U().toast.consent, '✍️', 4000); return; }
  newRun();
  saveState();
  showScreen(elQuiz);
  renderQuestion();
}

function restart() {
  var d = load() || {};
  delete d.progress;
  delete d.run;
  store(d);
  showScreen(elIntro);
  refreshIntroButtons();
}

function refreshIntroButtons() {
  var d = load() || {};
  $('btn-resume').classList.toggle('hidden', !(d.progress && progressFits(d.progress)));
  $('btn-last').classList.toggle('hidden', !d.run);
}

elNext.addEventListener('click', nextQuestion);
elBack.addEventListener('click', prevQuestion);
$('btn-start').addEventListener('click', startQuiz);
elName.addEventListener('keydown', function (e) { if (e.key === 'Enter') startQuiz(); });

$('consent-open').addEventListener('click', function () { $('modal').classList.remove('hidden'); });
$('modal-close').addEventListener('click', function () { $('modal').classList.add('hidden'); });
$('modal').addEventListener('click', function (e) { if (e.target === $('modal')) $('modal').classList.add('hidden'); });

$('btn-resume').addEventListener('click', function () {
  var d = load() || {};
  if (!d.progress || !progressFits(d.progress)) { toast(U().toast.changed, '↺', 4000); return; }
  state.index = d.progress.index;
  state.picks = d.progress.picks;
  state.order = d.progress.order;
  state.name  = d.name || '';
  state.consent = !!d.consent;
  showScreen(elQuiz);
  renderQuestion();
});

$('btn-last').addEventListener('click', function () {
  var d = load() || {};
  if (!d.run) return;
  state.picks = d.run.picks;
  state.order = d.run.order;
  state.name  = d.run.name || '';
  state.date  = d.run.date || today();
  renderResult();
  showScreen(elResult);
});

/* Цифры 1–5 с клавиатуры — быстрый ответ */
document.addEventListener('keydown', function (e) {
  if (elQuiz.classList.contains('hidden')) return;
  var n = parseInt(e.key, 10);
  if (n >= 1 && n <= state.order[state.index].length) pick(state.order[state.index][n - 1]);
  if (e.key === 'ArrowLeft') prevQuestion();
  if (e.key === 'ArrowRight' && !elNext.disabled) nextQuestion();
});

/* --- Старт приложения --- */
(function init() {
  var saved = load();
  if (saved && saved.lang && window.MATRIX[saved.lang]) state.lang = saved.lang;
  document.documentElement.lang = state.lang;

  TOTAL = window.MATRIX[CFG.defaultLang].questions.length;

  buildLangSwitch();
  applyLanguage();
  validateContent();

  if (saved && saved.name) elName.value = saved.name;
  if (saved && saved.consent) elConsent.checked = true;
  refreshIntroButtons();
  flushOutbox();
})();

})();
