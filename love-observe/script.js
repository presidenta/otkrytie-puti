/* ============================================================================
   ЯЗЫК ЛЮБВИ БЛИЗКОГО — анкета по наблюдению · Genesis Solar Life
   script.js — логика. Текстов здесь нет, они в content-ru.js / content-ua.js.
   ----------------------------------------------------------------------------
   Чем отличается от основной анкеты (../love/):
     • сначала выбирают, за кого отвечают: ребёнок, подросток или взрослый —
       у каждой группы свои вопросы и свои советы;
     • таймера нет: наблюдение надо вспомнить, а не выпалить;
     • можно отметить от одного до трёх ответов (баллы 3 · 2 · 1) или
       нажать «Не замечал(а)» — вопрос тогда в подсчёт не идёт;
     • проценты считаются от отвеченных вопросов; если отвечено меньше двух
       третей, итог помечается как предварительный.

   Состояние хранит только ЧИСЛА: номера ответов и порядок показа.
   Текст подставляется при отрисовке — переключение языка ничего не сбивает.
   ============================================================================ */
(function () {
'use strict';

var CFG = {
  languages: ['ru', 'ua'],
  defaultLang: 'ru',
  storeKey: 'genesis_love_observe_v1',
  groups: ['child', 'teen', 'adult'],
  weights: [3, 2, 1],
  picks: 3,            // больше трёх отметить нельзя
  enoughShare: 2 / 3   // меньше этой доли отвеченных — итог предварительный
};

var state = {
  lang:  CFG.defaultLang,
  group: '',
  name:  '',
  index: 0,
  picks: [],    // picks[i] = [номер ответа|null] по приоритетам
  skipped: [],  // skipped[i] = true — «не замечал(а)»
  order: [],    // order[i] = порядок показа ответов вопроса i
  date:  ''
};

var $ = function (id) { return document.getElementById(id); };
var elIntro = $('screen-intro'), elQuiz = $('screen-quiz'), elResult = $('screen-result');
var elName = $('user-name'), elToast = $('toast'), elToastText = $('toast-text'), elToastIcon = $('toast-icon');
var elOptions = $('options'), elNext = $('btn-next');

function L()  { return window.LOVE_OBS[state.lang]; }
function U()  { return L().ui; }
function G()  { return L().groups[state.group]; }
function QS() { return G().questions; }
function LG() { return L().langs; }
function total() { return QS().length; }

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
   Проверка контента: оба языка устроены одинаково
   ============================================================ */
function validate() {
  var problems = [], base = window.LOVE_OBS && window.LOVE_OBS[CFG.defaultLang];
  if (!base) { console.error('Нет языкового пакета ' + CFG.defaultLang); return false; }

  CFG.languages.forEach(function (code) {
    var pack = window.LOVE_OBS[code];
    if (!pack) { problems.push('Не подключён язык: ' + code); return; }

    ['dominant', 'dual', 'flat'].forEach(function (s) {
      if (!pack.shapes || !pack.shapes[s] || !pack.shapes[s].title || !pack.shapes[s].text) problems.push(code + ': нет формы профиля ' + s);
    });
    for (var m = 1; m <= 5; m++) {
      if (!pack.langs[m] || !pack.langs[m].name || !pack.langs[m].tagline) problems.push(code + ': нет названия языка ' + m);
    }

    CFG.groups.forEach(function (g) {
      var gr = pack.groups[g], bg = base.groups[g], where = code + ', ' + g;
      if (!gr) { problems.push(where + ': нет группы'); return; }
      if (!gr.label || !gr.hint) problems.push(where + ': нет названия или подсказки');
      if (gr.questions.length !== bg.questions.length) {
        problems.push(where + ': вопросов ' + gr.questions.length + ', а должно быть ' + bg.questions.length);
        return;
      }
      gr.questions.forEach(function (qu, i) {
        var w = where + ', вопрос ' + (i + 1), seen = {};
        if (!qu.q) problems.push(w + ': пустой текст вопроса');
        if (qu.o.length !== 5) { problems.push(w + ': ответов ' + qu.o.length + ', а должно быть 5'); return; }
        qu.o.forEach(function (opt, j) {
          if (!opt.t) problems.push(w + ', ответ ' + (j + 1) + ': пустой текст');
          if (opt.k !== bg.questions[i].o[j].k) problems.push(w + ', ответ ' + (j + 1) + ': язык не совпадает с ' + CFG.defaultLang);
          if (seen[opt.k]) problems.push(w + ': язык ' + opt.k + ' встречается дважды');
          seen[opt.k] = true;
        });
        for (var n = 1; n <= 5; n++) if (!seen[n]) problems.push(w + ': нет ответа для языка ' + n);
      });
      for (var k = 1; k <= 5; k++) {
        var tip = gr.tips && gr.tips[k];
        if (!tip || !tip.seen) { problems.push(where + ', язык ' + k + ': нет описания'); continue; }
        ['todo', 'never'].forEach(function (f) {
          if (!tip[f] || !tip[f].length) problems.push(where + ', язык ' + k + ': пустой список ' + f);
        });
      }
      if (!gr.check || !gr.check.title || !gr.check.text) problems.push(where + ': нет проверки');
      else if (gr.check.pairs.length !== bg.check.pairs.length) problems.push(where + ': пар выбора ' + gr.check.pairs.length + ', а должно быть ' + bg.check.pairs.length);
    });
  });

  if (problems.length) {
    console.error('%c[Язык любви близкого] Проблемы в контенте:', 'color:#FF4D4D;font-weight:bold');
    problems.forEach(function (p) { console.error('  • ' + p); });
    return false;
  }
  console.log('%c[Язык любви близкого] Контент в порядке: ' +
              CFG.groups.map(function (g) { return g + ' ' + base.groups[g].questions.length; }).join(', ') +
              ' вопросов.', 'color:#D4AF37');
  return true;
}

/* ============================================================
   Языки интерфейса
   ============================================================ */
function buildLangSwitch() {
  var box = $('lang-switch');
  box.innerHTML = '';
  CFG.languages.forEach(function (code) {
    if (!window.LOVE_OBS[code]) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (code === state.lang ? ' active' : '');
    b.textContent = window.LOVE_OBS[code].ui.label;
    b.addEventListener('click', function () {
      if (code === state.lang) return;
      state.lang = code;
      save();
      applyLanguage();
    });
    box.appendChild(b);
  });
}

/* Выбор «за кого»: три карточки */
function buildWho() {
  var box = $('who-list');
  box.innerHTML = '';
  CFG.groups.forEach(function (g) {
    var gr = L().groups[g];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'who-btn' + (g === state.group ? ' active' : '');
    b.dataset.group = g;
    b.setAttribute('aria-pressed', g === state.group ? 'true' : 'false');
    b.innerHTML = '<span class="who-label">' + esc(gr.label) + '</span>' +
                  '<span class="who-hint">' + esc(gr.hint) + '</span>';
    b.addEventListener('click', function () {
      state.group = g;
      save();
      buildWho();
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

  $('intro-lead').innerHTML    = u.intro.lead;
  $('why-title').textContent   = u.intro.whyTitle;
  $('why-body').innerHTML      = u.intro.why.map(function (p) { return '<p class="vector-desc why-p">' + esc(p) + '</p>'; }).join('');
  $('how-title').textContent   = u.intro.howTitle;
  $('how-list').innerHTML      = u.intro.how.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  $('who-title').textContent   = u.intro.whoTitle;
  $('intro-note').innerHTML    = u.intro.note;
  $('name-label').textContent  = u.intro.nameLabel;
  elName.placeholder           = u.intro.namePlaceholder;
  $('btn-start').textContent   = u.intro.start;
  $('btn-last').textContent    = u.intro.last;
  $('intro-author').textContent = u.intro.author;
  $('btn-back').textContent    = u.quiz.back;
  $('btn-skip').textContent    = u.quiz.skip;

  var resume = $('btn-resume');
  if (!resume.classList.contains('hidden') && resume.dataset.group) {
    var keep = state.group;
    state.group = resume.dataset.group;
    resume.textContent = t(u.intro.resume, { n: +resume.dataset.index + 1, m: total() }) + ' · ' + G().label;
    state.group = keep;
  }

  buildLangSwitch();
  buildWho();
  if (!elQuiz.classList.contains('hidden')) renderQuestion();
  if (!elResult.classList.contains('hidden')) renderResult();
}

/* ============================================================
   Экран вопроса
   ============================================================ */
function renderQuestion() {
  var i = state.index, qu = QS()[i], u = U(), m = total();

  $('q-counter').textContent = t(u.quiz.counter, { n: i + 1, m: m });
  $('q-who').textContent = (state.name ? state.name + ' · ' : '') + G().label;
  $('q-fill').style.width = ((i + 1) / m * 100) + '%';
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Клик по ответу: 1 → 2 → 3, повторный клик снимает именно эту цифру */
function pick(optIdx) {
  var slots = state.picks[state.index];
  var at = slots.indexOf(optIdx);

  if (at !== -1) {
    slots.splice(at, 1);   // остальные цифры сдвигаются: 1 · 3 не бывает
    slots.push(null);
  } else {
    var free = slots.indexOf(null);
    if (free === -1) { toast(U().toast.full, '↺', 2600); return; }
    slots[free] = optIdx;
  }
  state.skipped[state.index] = false;
  paintPicks();
  save();
}

function picked(i) {
  return state.picks[i].filter(function (v) { return v !== null; }).length;
}

function paintPicks() {
  var slots = state.picks[state.index];
  Array.prototype.forEach.call(elOptions.querySelectorAll('.opt'), function (card) {
    var rank = slots.indexOf(+card.dataset.opt) + 1;
    var slot = card.querySelector('.slot');
    if (rank) { card.dataset.rank = rank; slot.textContent = rank; }
    else { delete card.dataset.rank; slot.textContent = ''; }
  });

  var u = U(), done = picked(state.index), last = state.index === total() - 1;
  elNext.disabled = done === 0;
  elNext.textContent = done ? (last ? u.quiz.finish : u.quiz.next) : u.quiz.pickOne;
}

function nextQuestion() {
  if (state.index + 1 < total()) {
    state.index++;
    save();
    renderQuestion();
  } else {
    finish();
  }
}

/* «Не замечал(а)»: отметки снимаются, вопрос в подсчёт не идёт */
function skipQuestion() {
  state.picks[state.index] = [null, null, null].slice(0, CFG.picks);
  state.skipped[state.index] = true;
  nextQuestion();
}

function back() {
  if (state.index === 0) return;
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
  d.group = state.group;
  if (!elQuiz.classList.contains('hidden')) {
    d.progress = { group: state.group, index: state.index, picks: state.picks, skipped: state.skipped, order: state.order, name: state.name };
  }
  store(d);
}

function saveRun() {
  var d = load() || {};
  d.lang = state.lang;
  d.run = { group: state.group, name: state.name, date: state.date, picks: state.picks, skipped: state.skipped, order: state.order };
  delete d.progress;
  store(d);
}

/* ============================================================
   Расчёт: 1 место = 3 балла, 2 = 2, 3 = 1.
   Максимум по языку = отвеченные вопросы × 3, то есть 100%.
   ============================================================ */
function calculate() {
  var scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, answered = 0;

  state.picks.forEach(function (slots, qi) {
    if (state.skipped[qi] || !picked(qi)) return;
    answered++;
    slots.forEach(function (optIdx, slotPos) {
      if (optIdx === null || optIdx === undefined) return;
      scores[QS()[qi].o[optIdx].k] += CFG.weights[slotPos];
    });
  });

  var max = answered * CFG.weights[0];
  var ranking = Object.keys(scores).map(function (k) {
    return { k: +k, n: scores[k], pct: max ? Math.round(scores[k] / max * 100) : 0 };
  }).sort(function (a, b) { return b.n - a.n || a.k - b.k; });

  return {
    date: state.date || today(),
    name: state.name || G().label,
    answered: answered,
    total: total(),
    max: max,
    ranking: ranking,
    main: ranking[0],
    second: ranking[1],
    shape: shapeOf(ranking)
  };
}

/* Форма профиля по разбросу процентов — как в основной анкете */
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
  state.date = today();
  saveRun();
  renderResult();
  showScreen(elResult);
}

function list(arr) {
  return '<ul class="task-list">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
}

function renderResult() {
  var r = calculate(), u = U().result, langs = LG(), gr = G();
  var M = langs[r.main.k], S = langs[r.second.k];
  var TM = gr.tips[r.main.k], TS = gr.tips[r.second.k];
  var shape = L().shapes[r.shape];
  var few = r.answered < Math.ceil(r.total * CFG.enoughShare);

  var bars = r.ranking.map(function (row, idx) {
    var cls = idx === 0 ? ' top' : (idx === 1 ? ' second' : '');
    return '<div class="bar-row' + cls + '">' +
             '<div class="bar-name">' + esc(langs[row.k].name) + '</div>' +
             '<div class="bar-val">' + row.pct + '% · ' + esc(t(u.ofPicks, { n: row.n, m: r.max })) + '</div>' +
             '<div class="bar-track"><div class="bar-fill" data-w="' + row.pct + '"></div></div>' +
           '</div>';
  }).join('');

  var pairs = gr.check.pairs.length
    ? '<ol class="task-list obs-pairs">' + gr.check.pairs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'
    : '';

  elResult.innerHTML =
    '<div class="result-top">' +
      '<div class="result-chip">' + esc(u.chip) + '</div>' +
      '<div class="result-name">' + t(esc(u.dateLine), { name: '<b>' + esc(r.name) + '</b>', group: esc(gr.label.toLowerCase()), date: r.date }) + '</div>' +
    '</div>' +

    /* Главный язык и процент */
    '<div class="block">' +
      '<div class="sub-label">' + esc(u.mainLabel) + '</div>' +
      '<div class="love-main">' +
        '<div class="vector-name shimmer-text">' + esc(M.name) + '</div>' +
        '<div class="love-pct">' + r.main.pct + '%</div>' +
      '</div>' +
      '<div class="vector-score">' + esc(M.tagline) + ' · ' + esc(t(u.ofPicks, { n: r.main.n, m: r.max })) + '</div>' +
      '<div class="sub-label obs-gap">' + esc(u.seenTitle) + '</div>' +
      '<p class="vector-desc">' + esc(TM.seen) + '</p>' +
      '<div class="spacer-s"></div>' +
      '<div class="pill"><h4>' + esc(u.shapeTitle) + ' · ' + esc(shape.title) + '</h4><p>' + esc(shape.text) + '</p></div>' +
      (few ? '<div class="spacer-s"></div><div class="pill burn"><p>' + esc(t(u.fewNote, { n: r.answered, m: r.total })) + '</p></div>' : '') +
    '</div>' +

    /* Что делать и чего избегать — на главном языке */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.doTitle) + '</div>' +
      list(TM.todo) +
      '<div class="spacer-m"></div>' +
      '<div class="sub-label">' + esc(u.neverTitle) + '</div>' +
      list(TM.never) +
    '</div>' +

    /* Второй язык */
    '<div class="block">' +
      '<div class="sub-label">' + esc(u.secondLabel) + '</div>' +
      '<div class="vector-name silver">' + esc(S.name) + '</div>' +
      '<div class="vector-score">' + r.second.pct + '% · ' + esc(S.tagline) + '</div>' +
      '<p class="vector-desc">' + esc(TS.seen) + '</p>' +
      '<div class="spacer-s"></div>' +
      list(TS.todo.slice(0, 2)) +
    '</div>' +

    /* Шкала по всем пяти */
    '<div class="block">' +
      '<div class="block-title">' + esc(u.allLabel) + '</div>' +
      '<div class="bars">' + bars + '</div>' +
      '<div class="spacer-m"></div>' +
      '<div class="pill"><p>' + esc(u.allNote) + '</p></div>' +
    '</div>' +

    /* Проверка: выбором (дети, подростки) или разговором (взрослые) */
    '<div class="block">' +
      '<div class="block-title">' + esc(gr.check.title) + '</div>' +
      '<p class="vector-desc">' + esc(gr.check.text) + '</p>' +
      pairs +
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
  var r = calculate(), R = U().report, langs = LG(), gr = G();
  var M = langs[r.main.k], S = langs[r.second.k], TM = gr.tips[r.main.k];
  var line = new Array(43).join('=');

  var out = [
    R.title,
    t(R.who, { name: r.name, group: gr.label.toLowerCase() }),
    t(R.date, { date: r.date }),
    line,
    '',
    t(R.main, { name: M.name, pct: r.main.pct }),
    t(R.second, { name: S.name, pct: r.second.pct }),
    '',
    R.all
  ];
  r.ranking.forEach(function (row) { out.push('  ' + langs[row.k].name + ' — ' + row.pct + '%'); });
  if (r.answered < Math.ceil(r.total * CFG.enoughShare)) out.push('', t(U().result.fewNote, { n: r.answered, m: r.total }));
  out.push('', R.seen, '  ' + TM.seen);
  out.push('', R.todo);
  TM.todo.forEach(function (x) { out.push('  • ' + x); });
  out.push('', R.never);
  TM.never.forEach(function (x) { out.push('  • ' + x); });
  out.push('', R.check, '  ' + gr.check.text);
  gr.check.pairs.forEach(function (x, i) { out.push('  ' + (i + 1) + '. ' + x); });
  out.push('', line, R.footer);
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
   Запуск
   ============================================================ */
function startTest() {
  if (!state.group) { toast(U().intro.pickWho, '👆', 3500); $('who-list').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  state.name  = (elName.value || '').trim().slice(0, 40);
  state.index = 0;
  state.date  = '';
  state.picks = [];
  state.skipped = [];
  state.order = [];
  for (var i = 0; i < total(); i++) {
    state.picks.push([null, null, null].slice(0, CFG.picks));
    state.skipped.push(false);
    state.order.push(shuffle([0, 1, 2, 3, 4]));   // ответы перемешиваются
  }
  $('btn-resume').classList.add('hidden');
  showScreen(elQuiz);
  save();
  renderQuestion();
}

elNext.addEventListener('click', function () { if (!elNext.disabled) nextQuestion(); });
$('btn-skip').addEventListener('click', skipQuestion);
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

/* Сохранённое прохождение годится, только если совпадает с текущими вопросами группы */
function fits(run) {
  if (!run || CFG.groups.indexOf(run.group) === -1) return false;
  var m = window.LOVE_OBS[CFG.defaultLang].groups[run.group].questions.length;
  return run.picks && run.picks.length === m && run.order && run.order.length === m &&
         run.skipped && run.skipped.length === m;
}

(function init() {
  var saved = load() || {};
  if (saved.lang && window.LOVE_OBS[saved.lang]) state.lang = saved.lang;
  if (saved.group && CFG.groups.indexOf(saved.group) !== -1) state.group = saved.group;
  validate();
  if (saved.name) elName.value = saved.name;

  var p = saved.progress;
  if (fits(p)) {
    var btn = $('btn-resume');
    btn.classList.remove('hidden');
    btn.dataset.group = p.group;
    btn.dataset.index = p.index;
    btn.addEventListener('click', function () {
      state.group = p.group;
      state.name  = p.name || '';
      state.picks = p.picks;
      state.skipped = p.skipped;
      state.order = p.order;
      state.index = p.index;
      showScreen(elQuiz);
      renderQuestion();
    });
  }

  if (fits(saved.run)) {
    var btnLast = $('btn-last');
    btnLast.classList.remove('hidden');
    btnLast.addEventListener('click', function () {
      var run = saved.run;
      state.group = run.group;
      state.picks = run.picks;
      state.skipped = run.skipped;
      state.order = run.order;
      state.name  = run.name || '';
      state.date  = run.date;
      renderResult();
      showScreen(elResult);
    });
  }

  applyLanguage();
})();

})();
