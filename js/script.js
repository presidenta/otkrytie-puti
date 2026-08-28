/* ============================================================================
   ОТКРЫТИЕ ПУТИ · Genesis Solar Life
   script.js — ЛОГИКА. Ни текстов, ни стилей здесь нет.
   ----------------------------------------------------------------------------
   Тексты живут в js/content-ru.js и js/content-ua.js, настройки — в js/config.js.

   КЛЮЧЕВАЯ ИДЕЯ АРХИТЕКТУРЫ
     Состояние хранит только ЧИСЛА: порядок перемешивания и номера
     выбранных вариантов. Текст подставляется в момент отрисовки из
     активного языка. Поэтому переключение языка — это просто повторная
     отрисовка: прогресс, выборы и результат сохраняются полностью.

   Разделы:
     1. Состояние и DOM            6. Автосохранение
     2. Языки                      7. Расчёт
     3. Проверка контента          8. Результат «Ваш путь открыт»
     4. Утилиты и таймер           9. Копирование
     5. Экран вопроса             10. Запуск
   ============================================================================ */
(function(){
'use strict';

/* ============================================================
   1. СОСТОЯНИЕ И DOM
   ============================================================ */
var CFG = window.appConfig;

var state = {
  lang:    CFG.defaultLang,
  name:    '',
  contact: '',
  tg:      null,   // данные пользователя Telegram, если вход был оттуда
  tgInitData: '',  // подписанная строка Telegram — для проверки на стороне сервера
  consent: false,  // отмечено ли согласие на обработку данных
  consentAt: '',
  qIndex: 0,
  order:  [],   // order[q] = перемешанные НОМЕРА вариантов вопроса q
  picks:  [],   // picks[q] = номера выбранных вариантов по приоритетам
  timedOut: [],  // вопросы, где истекло время — там можно идти дальше неполным набором
  tick:   null,
  left:   CFG.timeLimit,
  date:   ''
};

var $ = function(id){ return document.getElementById(id); };
var elIntro = $('screen-intro'), elQuiz = $('screen-quiz'), elResult = $('screen-result');
var elOptions = $('options'), elNext = $('btn-next');
var elName = $('user-name'), elContact = $('user-contact');
var elDigits = $('timer-digits'), elTimerFill = $('timer-fill');
var elToast = $('toast'), elToastText = $('toast-text'), elToastIcon = $('toast-icon');

/* ============================================================
   2. ЯЗЫКИ
   ============================================================ */
function L(){ return window.CONTENT[state.lang]; }          // активный языковой пакет
function U(){ return L().ui; }                               // его интерфейсные строки
function Q(){ return L().questions; }                        // его вопросы
function T(){ return L().types; }                            // его психотипы

/* Подстановка {переменных} в строку */
function t(str, vars){
  if (!str) return '';
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, function(all, key){
    return vars[key] !== undefined ? vars[key] : all;
  });
}

var SCORED = [];       // индексы вопросов, участвующих в подсчёте
var MAX_SCORE = 0;     // максимум баллов по одному вектору

function recalcLimits(){
  SCORED = [];
  Q().forEach(function(q, i){ if (q.scored !== false) SCORED.push(i); });
  MAX_SCORE = SCORED.length * (CFG.scoring === 'weighted' ? CFG.weights[0] : 1);
}

function picksOf(qi){
  var q = Q()[qi];
  return q.picks || CFG.picksDefault;
}

/* Переключатель языка в шапке */
function buildLangSwitch(){
  var box = $('lang-switch');
  box.innerHTML = '';
  CFG.languages.forEach(function(code){
    var pack = window.CONTENT[code];
    if (!pack) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (code === state.lang ? ' active' : '');
    b.textContent = pack.ui.label;
    b.title = pack.ui.labelFull;
    b.addEventListener('click', function(){ switchLang(code); });
    box.appendChild(b);
  });
}

function switchLang(code){
  if (code === state.lang || !window.CONTENT[code]) return;
  state.lang = code;
  recalcLimits();
  saveState();
  applyLanguage();
}

/* Перерисовывает ВСЁ на активном языке, сохраняя текущий экран и прогресс */
function applyLanguage(){
  var u = U();

  document.documentElement.lang = u.code;
  document.title = u.brandTitle + ' | Genesis Solar Life';

  $('brand-tag').textContent   = u.brandTag;
  $('brand-title').textContent = u.brandTitle;
  $('brand-sub').textContent   = u.brandSub;

  $('intro-lead').innerHTML  = u.intro.lead;
  $('intro-note').innerHTML  = u.intro.note;
  $('consent-text').textContent = u.intro.consent;
  $('consent-open').textContent = u.intro.consentLink;
  $('name-label').textContent  = u.intro.nameLabel;
  elName.placeholder           = u.intro.namePlaceholder;
  $('contact-label').textContent = u.intro.contactLabel;
  elContact.placeholder          = u.intro.contactPlaceholder;
  $('btn-start').textContent   = u.intro.start;
  $('btn-last').textContent    = u.intro.last;

  var badges = $('intro-badges');
  badges.innerHTML = '';
  u.intro.badges.forEach(function(text){
    var s = document.createElement('span');
    s.className = 'badge';
    s.textContent = text;
    badges.appendChild(s);
  });

  var resume = $('btn-resume');
  if (!resume.classList.contains('hidden')){
    resume.textContent = t(u.intro.resume, { n: state.qIndex + 1, m: Q().length });
  }

  $('timer-label').textContent = u.quiz.timerLabel;

  /* Текст согласия и приветствие Telegram */
  $('modal-title').textContent = L().agreement.title;
  $('modal-body').innerHTML = L().agreement.body.map(function(p){ return '<p>' + p + '</p>'; }).join('');
  $('modal-close').textContent = L().agreement.close;
  if (state.tg) $('tg-hello').textContent = t(u.intro.tgHello, { user: tgLabel() });

  buildLangSwitch();

  if (!elQuiz.classList.contains('hidden')) renderQuestion(true);
  if (!elResult.classList.contains('hidden')) renderResult();
}

/* ============================================================
   2б. ВХОД ЧЕРЕЗ TELEGRAM (Mini App)
   ------------------------------------------------------------
   Если анкету открыли внутри Telegram, приложение само узнаёт,
   кто её проходит: id, имя и @username приходят от Telegram.
   Спрашивать контакт больше не нужно.

   Официальный скрипт Telegram подключается ТОЛЬКО внутри Telegram —
   чтобы обычная страница и офлайн-файл остались без внешних
   зависимостей и работали без интернета.
   ============================================================ */
function inTelegram(){
  return (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined) ||
         (location.hash || '').indexOf('tgWebAppData') !== -1 ||
         !!window.TelegramWebviewProxy;
}

function tgLabel(){
  if (!state.tg) return '';
  return state.tg.username ? '@' + state.tg.username
       : [state.tg.first_name, state.tg.last_name].filter(Boolean).join(' ') || ('id ' + state.tg.id);
}

/* Данные пользователя из адреса — запасной путь, если скрипт Telegram не загрузился */
function tgUserFromHash(){
  try{
    var m = /tgWebAppData=([^&]+)/.exec(location.hash || '');
    if (!m) return null;
    var params = new URLSearchParams(decodeURIComponent(m[1]));
    var raw = params.get('user');
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function initTelegram(done){
  if (!inTelegram()) { done(); return; }

  var apply = function(){
    var W = window.Telegram && window.Telegram.WebApp;
    var user = (W && W.initDataUnsafe && W.initDataUnsafe.user) || tgUserFromHash();
    if (user){
      state.tg = user;
      state.tgInitData = (W && W.initData) || '';
      state.name    = [user.first_name, user.last_name].filter(Boolean).join(' ');
      state.contact = user.username ? '@' + user.username : '';
    }
    if (W){
      try { W.ready(); W.expand(); } catch(e){}
    }
    document.body.classList.add('in-telegram');
    done();
  };

  if (window.Telegram && window.Telegram.WebApp) { apply(); return; }

  var s = document.createElement('script');
  s.src = 'https://telegram.org/js/telegram-web-app.js';
  s.onload = apply;
  s.onerror = apply;                 /* без скрипта читаем данные из адреса */
  document.head.appendChild(s);
  setTimeout(function(){ if (!state.tg) apply(); }, 2500);   /* страховка от зависания */
}

/* ============================================================
   3. ПРОВЕРКА КОНТЕНТА
   Ловит рассинхрон языков и опечатки до того, как их увидит участник.
   ============================================================ */
function validateContent(){
  var problems = [];
  var base = window.CONTENT[CFG.defaultLang];

  if (!base){ console.error('Нет языкового пакета ' + CFG.defaultLang); return false; }

  CFG.languages.forEach(function(code){
    var pack = window.CONTENT[code];
    if (!pack){ problems.push('Не подключён файл языка: ' + code); return; }

    if (pack.questions.length !== base.questions.length){
      problems.push(code + ': вопросов ' + pack.questions.length +
                    ', а в ' + CFG.defaultLang + ' — ' + base.questions.length);
      return;
    }

    pack.questions.forEach(function(q, i){
      var b = base.questions[i], where = code + ', вопрос #' + (i + 1);
      if (q.id !== b.id) problems.push(where + ': id ' + q.id + ' вместо ' + b.id);
      if (!q.title)      problems.push(where + ': пустой заголовок');
      if (q.options.length !== b.options.length){
        problems.push(where + ': вариантов ' + q.options.length + ', а должно быть ' + b.options.length);
        return;
      }
      var seen = {};
      q.options.forEach(function(o, j){
        if (!o.text) problems.push(where + ', вариант ' + (j + 1) + ': пустой текст');
        if (o.type !== b.options[j].type)
          problems.push(where + ', вариант ' + (j + 1) + ': type ' + o.type + ' вместо ' + b.options[j].type);
        if (seen[o.type]) problems.push(where + ': type ' + o.type + ' повторяется');
        seen[o.type] = true;
      });
      var need = q.picks || CFG.picksDefault;
      if (need > q.options.length) problems.push(where + ': нужно выбрать ' + need + ' из ' + q.options.length);
      if (q.scored !== false){
        q.options.forEach(function(o){
          if (!pack.types[o.type]) problems.push(where + ': нет описания вектора ' + o.type);
        });
      }
    });
  });

  /* Расширенный профиль: у каждого банка текстов должны быть все 8 векторов */
  CFG.languages.forEach(function(code){
    var pack = window.CONTENT[code];
    if (!pack) return;
    if (!pack.psych){ problems.push(code + ': нет блока psych'); return; }
    ['shadow', 'sabotage', 'pressure', 'tradeoff', 'role', 'safety'].forEach(function(bank){
      if (!pack.psych[bank]){ problems.push(code + ': нет psych.' + bank); return; }
      for (var ty = 1; ty <= 8; ty++){
        if (!pack.psych[bank][ty]) problems.push(code + ': psych.' + bank + ' — нет записи для вектора ' + ty);
      }
    });
  });

  var ids = base.questions.map(function(q){ return q.id; });
  Object.keys(CFG.transcript).forEach(function(k){
    if (ids.indexOf(CFG.transcript[k]) === -1)
      problems.push('config.js → transcript.' + k + ' ссылается на вопрос ' + CFG.transcript[k] + ', которого нет');
  });
  Object.keys(CFG.triggers).forEach(function(k){
    if (ids.indexOf(CFG.triggers[k]) === -1)
      problems.push('config.js → triggers.' + k + ' ссылается на вопрос ' + CFG.triggers[k] + ', которого нет');
  });

  if (problems.length){
    console.error('%c[Открытие Пути] Проблемы в контенте:', 'color:#FF4D4D;font-weight:bold');
    problems.forEach(function(p){ console.error('  • ' + p); });
    return false;
  }
  console.log('%c[Открытие Пути] Контент в порядке: ' + base.questions.length + ' вопросов, ' +
              SCORED.length + ' в подсчёте, максимум ' + MAX_SCORE + ' баллов, режим «' +
              CFG.scoring + '», языки: ' + CFG.languages.join(', ') + '.', 'color:#D4AF37');
  return true;
}

/* ============================================================
   4. УТИЛИТЫ И ТАЙМЕР
   ============================================================ */
function shuffle(arr){                       // Fisher–Yates
  var a = arr.slice(), i, j, tmp;
  for (i = a.length - 1; i > 0; i--){
    j = Math.floor(Math.random() * (i + 1));
    tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

function load(){ try { return JSON.parse(localStorage.getItem(CFG.storeKey)); } catch(e){ return null; } }
function store(v){ try { localStorage.setItem(CFG.storeKey, JSON.stringify(v)); } catch(e){} }

function today(){
  var d = new Date(), p = function(n){ return String(n).length < 2 ? '0' + n : String(n); };
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

var toastTimer = null;
function toast(text, icon, ms){
  elToastText.textContent = text;
  elToastIcon.textContent = icon || '✨';
  elToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ elToast.classList.remove('show'); }, ms || 4500);
}
elToast.addEventListener('click', function(){ elToast.classList.remove('show'); });

/* Если что-то всё же сломается на чужом устройстве — человек увидит причину
   и сможет её переслать, вместо молчаливо застывшего экрана. */
window.addEventListener('error', function(e){
  try { toast('Сбой: ' + (e.message || 'неизвестная ошибка'), '⚠️', 15000); } catch(x){}
});

function showScreen(el){
  [elIntro, elQuiz, elResult].forEach(function(s){ s.classList.add('hidden'); });
  el.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startTimer(){
  stopTimer();
  state.left = CFG.timeLimit;
  paintTimer();
  resumeTimer();
}

function resumeTimer(){
  if (state.tick || state.left <= 0) return;
  state.tick = setInterval(function(){
    state.left--;
    paintTimer();
    if (state.left <= 0){
      stopTimer();
      if (isComplete()) nextQuestion();
      else {
        /* Время вышло, а отмечено меньше трёх — не запираем человека:
           разрешаем идти дальше с тем, что он успел отметить. */
        state.timedOut[state.qIndex] = true;
        paintPicks();
        toast(U().toast.timeout, '🕊', 6000);
      }
    }
  }, 1000);
}

function stopTimer(){ if (state.tick){ clearInterval(state.tick); state.tick = null; } }

function paintTimer(){
  var left = Math.max(0, state.left);
  elDigits.textContent = left;                                    // чистые цифры: 88, 87, 86…
  elTimerFill.style.width = (left / CFG.timeLimit * 100) + '%';
  elQuiz.classList.toggle('state-warn',   left <= CFG.warnAt && left > CFG.dangerAt);
  elQuiz.classList.toggle('state-danger', left <= CFG.dangerAt);
}

document.addEventListener('visibilitychange', function(){
  if (elQuiz.classList.contains('hidden')) return;
  if (document.hidden) stopTimer();
  else { paintTimer(); resumeTimer(); }
});

/* ============================================================
   5. ЭКРАН ВОПРОСА
   На экране только заголовок вопроса и карточки — без подсказок.
   ============================================================ */
function renderQuestion(keepTimer){
  var qi = state.qIndex, q = Q()[qi], u = U();

  $('q-counter').textContent = t(u.quiz.counter, { n: qi + 1, m: Q().length });
  $('q-fill').style.width = ((qi + 1) / Q().length * 100) + '%';
  $('q-title').textContent = q.title;

  elOptions.innerHTML = '';
  state.order[qi].forEach(function(optIdx){
    var card = document.createElement('div');
    card.className = 'opt';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.opt = optIdx;
    card.innerHTML = '<div class="slot"></div><div class="opt-text">' + esc(q.options[optIdx].text) + '</div>';
    card.addEventListener('click', function(){ pick(optIdx); });
    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(optIdx); }
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

/* Клик по карточке: 1 → 2 → 3, повторный клик снимает именно эту цифру */
function pick(optIdx){
  var slots = state.picks[state.qIndex];
  var at = slots.indexOf(optIdx);

  if (at !== -1){
    slots[at] = null;
  } else {
    var free = slots.indexOf(null);
    if (free === -1){ toast(U().toast.full, '↺', 2600); return; }
    slots[free] = optIdx;
  }
  paintPicks();
  saveState();
}

function paintPicks(){
  var slots = state.picks[state.qIndex];
  var cards = elOptions.querySelectorAll('.opt');

  Array.prototype.forEach.call(cards, function(card){
    var optIdx = +card.dataset.opt;
    var rank = slots.indexOf(optIdx) + 1;
    var slot = card.querySelector('.slot');
    if (rank){ card.dataset.rank = rank; slot.textContent = rank; }
    else { delete card.dataset.rank; slot.textContent = ''; }
  });

  var need = picksOf(state.qIndex);
  var done = slots.filter(function(v){ return v !== null; }).length;
  var last = state.qIndex === Q().length - 1;
  var u = U();

  var allowed = (done === need) || (state.timedOut[state.qIndex] && done > 0);

  elNext.disabled = !allowed;
  elNext.textContent = allowed
    ? (last ? u.quiz.finish : u.quiz.next)
    : t(u.quiz.pickMore, { n: need - done });
}

function isComplete(){
  return state.picks[state.qIndex].every(function(v){ return v !== null; });
}

function nextQuestion(){
  stopTimer();
  if (state.qIndex + 1 < Q().length){
    state.qIndex++;
    saveState();
    renderQuestion();
  } else {
    finish();
  }
}

/* ============================================================
   6. АВТОСОХРАНЕНИЕ
   ============================================================ */
function saveState(){
  var data = load() || {};
  data.lang = state.lang;
  data.name = state.name;
  data.contact = state.contact;
  data.consent = state.consent;
  data.consentAt = state.consentAt;
  data.progress = {
    qIndex: state.qIndex,
    order:  state.order,
    picks:  state.picks,
    at:     Date.now()
  };
  store(data);
}

function saveRun(){
  var data = load() || {};
  data.lang = state.lang;
  data.name = state.name;
  data.run  = { order: state.order, picks: state.picks, date: state.date, name: state.name };
  delete data.progress;
  store(data);
}

function progressFits(p){
  if (!p || !p.picks || p.picks.length !== Q().length) return false;
  return p.picks.every(function(slots, qi){
    return slots.length === picksOf(qi) && p.order[qi].length === Q()[qi].options.length;
  });
}

/* ============================================================
   7. РАСЧЁТ
   ============================================================ */
function calculate(){
  var scores = {}, i;
  for (i = 1; i <= 8; i++) scores[i] = 0;

  state.picks.forEach(function(slots, qi){
    if (Q()[qi].scored === false) return;                 // вопросы 14–16 баллов не дают
    slots.forEach(function(optIdx, slotPos){
      if (optIdx === null) return;
      var type = Q()[qi].options[optIdx].type;
      scores[type] += (CFG.scoring === 'weighted') ? CFG.weights[slotPos] : 1;
    });
  });

  var ranking = Object.keys(scores).map(function(k){
    return { type: +k, score: scores[k] };
  }).sort(function(a, b){ return b.score - a.score || a.type - b.type; });

  /* Дословный ответ: qId — id вопроса, slot — приоритет (0 = первый) */
  function optOf(qId, slot){
    var qi = -1;
    Q().forEach(function(q, i){ if (q.id === qId) qi = i; });
    if (qi === -1 || !state.picks[qi]) return null;
    var idx = state.picks[qi][slot];
    return (idx === null || idx === undefined) ? null : Q()[qi].options[idx];
  }
  function textOf(qId, slot){
    var o = optOf(qId, slot);
    return o ? o.text : '—';
  }

  var tr = CFG.transcript;
  var priceOpt  = optOf(tr.price, 0);
  var commitOpt = optOf(tr.commitment, 0);
  var need = priceOpt  ? CFG.hoursByType[priceOpt.type]  : 0;
  var give = commitOpt ? CFG.hoursByType[commitOpt.type] : 0;

  /* Триггерные ответы расширенного профиля: берётся вариант,
     поставленный на 1 приоритет. Если вопрос не отвечен — null,
     и соответствующий блок просто не выводится. */
  function triggerType(qId){
    var o = optOf(qId, 0);
    return o ? o.type : null;
  }
  var trig = {
    sabotage: triggerType(CFG.triggers.sabotage),
    pressure: triggerType(CFG.triggers.pressure),
    tradeoff: triggerType(CFG.triggers.tradeoff),
    shadow:   triggerType(CFG.triggers.shadow)
  };

  return {
    date:      state.date || today(),
    name:      state.name || U().intro.namePlaceholder,
    ranking:   ranking,
    lead:      ranking[0].type,
    leadScore: ranking[0].score,
    sub:       ranking[1].type,
    subScore:  ranking[1].score,
    tie:       ranking[0].score === ranking[1].score,
    dream:     [textOf(tr.dream, 0), textOf(tr.dream, 1), textOf(tr.dream, 2)],
    price:     textOf(tr.price, 0),
    commit:    textOf(tr.commitment, 0),
    income:    textOf(tr.income, 0),
    needHours: need,
    giveHours: give,
    readiness: need ? Math.min(100, Math.round(give / need * 100)) : 0,
    trig:      trig
  };
}

function readinessLevel(v){
  var list = U().readiness, i;
  for (i = 0; i < list.length; i++) if (v >= list[i].min) return list[i];
  return list[list.length - 1];
}

/* ============================================================
   8. РЕЗУЛЬТАТ · «ВАШ ПУТЬ ОТКРЫТ»
   ============================================================ */
function finish(){
  stopTimer();
  state.date = today();
  saveRun();
  renderResult();
  showScreen(elResult);
  submitResult(calculate());     // передача организатору, если сбор включён
}

function renderResult(){
  var r = calculate(), u = U().result, types = T();
  var Lt = types[r.lead], St = types[r.sub];
  var lvl = readinessLevel(r.readiness);
  var tr  = CFG.transcript;
  var pct = function(s){ return Math.round(s / MAX_SCORE * 100); };

  /* ---------- Расширенный психологический профиль ----------
     Каждый блок собирается из конкретного ответа. Если триггерный вопрос
     остался без ответа, блок молча не выводится, а не ломает отчёт. */
  var P = L().psych, pu = P.ui;

  function blockState(){
    if (!r.trig.shadow) return '';
    var sh = P.shadow[r.trig.shadow];
    var echo = (r.trig.shadow === r.lead)
      ? t(pu.echoSame, { lead: Lt.name })
      : t(pu.echoDiff, { shadow: types[r.trig.shadow].name, lead: Lt.name });
    return '<div class="block">' +
      '<div class="block-title">' + esc(pu.stateTitle) + '</div>' +
      '<div class="sub-label">' + esc(pu.stateLead) + '</div>' +
      '<div class="vector-name shimmer-text" style="font-size:1.3rem">' + esc(sh.title) + '</div>' +
      '<p class="vector-desc">' + esc(sh.text) + '</p>' +
      '<div class="spacer-s"></div>' +
      '<div class="pill"><p>' + esc(echo) + '</p></div>' +
    '</div>';
  }

  function blockStress(){
    if (!r.trig.sabotage && !r.trig.pressure) return '';
    var sab = r.trig.sabotage ? P.sabotage[r.trig.sabotage] : null;
    var cop = r.trig.pressure ? P.pressure[r.trig.pressure] : null;
    return '<div class="block">' +
      '<div class="block-title">' + esc(pu.stressTitle) + '</div>' +
      '<div class="split">' +
        (sab ? '<div>' +
                 '<div class="sub-label">' + esc(pu.stressStop) + '</div>' +
                 '<div class="vector-name silver" style="font-size:1.22rem">' + esc(sab.title) + '</div>' +
                 '<p class="vector-desc">' + esc(sab.text) + '</p>' +
               '</div>' : '') +
        (cop ? '<div>' +
                 '<div class="sub-label">' + esc(pu.stressCope) + '</div>' +
                 '<div class="vector-name shimmer-text" style="font-size:1.22rem">' + esc(cop.title) + '</div>' +
                 '<p class="vector-desc">' + esc(cop.text) + '</p>' +
               '</div>' : '') +
      '</div>' +
      (cop ? '<div class="spacer-m"></div>' +
             '<div class="pill burn"><h4>' + esc(pu.stressRisk) + '</h4><p>' + esc(cop.risk) + '</p></div>' : '') +
    '</div>';
  }

  function blockProject(){
    var ro = P.role[r.lead];
    var td = r.trig.tradeoff ? P.tradeoff[r.trig.tradeoff] : null;
    return '<div class="block">' +
      '<div class="block-title">' + esc(pu.projectTitle) + '</div>' +
      '<div class="sub-label">' + esc(pu.projectRole) + '</div>' +
      '<div class="vector-name shimmer-text" style="font-size:1.3rem">' + esc(ro.role) + '</div>' +
      '<div class="spacer-s"></div>' +
      '<div class="pill-grid">' +
        '<div class="pill"><h4>' + esc(pu.projectDeleg) + '</h4><p>' + esc(ro.delegation) + '</p></div>' +
        '<div class="pill burn"><h4>' + esc(pu.projectFric) + '</h4><p>' + esc(ro.friction) + '</p></div>' +
      '</div>' +
      (td ? '<div class="spacer-m"></div>' +
            '<div class="sub-label">' + esc(pu.projectPrice) + '</div>' +
            '<div class="quote-line"><b>' + esc(td.title) + '.</b> ' + esc(td.text) + '</div>' : '') +
    '</div>';
  }

  function blockSafety(){
    var sf = P.safety[r.lead];
    var qs = [CFG.triggers.sabotage, CFG.triggers.pressure, CFG.triggers.tradeoff, CFG.triggers.shadow]
             .sort(function(a, b){ return a - b; }).join(', ');
    return '<div class="block">' +
      '<div class="block-title">' + esc(pu.safetyTitle) + '</div>' +
      '<ul class="task-list">' +
        '<li><b>' + esc(pu.safetyAvoid)  + '</b><br>' + esc(sf.avoid)    + '</li>' +
        '<li><b>' + esc(pu.safetyMetric) + '</b><br>' + esc(sf.metric)   + '</li>' +
        '<li><b>' + esc(pu.safetyDeleg)  + '</b><br>' + esc(sf.delegate) + '</li>' +
      '</ul>' +
      '<div class="spacer-s"></div>' +
      '<p class="legal" style="text-align:left">' + esc(t(pu.disclaimer, { q: qs })) + '</p>' +
    '</div>';
  }

  var bars = r.ranking.map(function(row, idx){
    var cls = idx === 0 ? ' top' : (idx === 1 ? ' second' : '');
    return '<div class="bar-row' + cls + '">' +
             '<div class="bar-name">' + esc(types[row.type].name) + '</div>' +
             '<div class="bar-val">' + row.score + ' · ' + pct(row.score) + '%</div>' +
             '<div class="bar-track"><div class="bar-fill" data-w="' + pct(row.score) + '"></div></div>' +
           '</div>';
  }).join('');

  var tasks = Lt.tasks.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');

  var reflect = U().reflect.map(function(x){
    return '<li>' + esc(t(x, { lead: Lt.name, sub: St.name, readiness: r.readiness })) +
           '<span class="write-line"></span><span class="write-line"></span></li>';
  }).join('');

  var tieNote = r.tie
    ? '<p class="vector-desc" style="margin-top:12px"><b>' + esc(u.mixedWord) + '</b> ' + esc(u.mixedText) + '</p>'
    : '';

  elResult.innerHTML =
  '<div class="result-top">' +
    '<div class="result-chip">' + esc(u.chip) + '</div>' +
    '<div class="result-name">' + t(esc(u.dateLine), { name: '<b>' + esc(r.name) + '</b>', date: r.date }) + '</div>' +
  '</div>' +

  '<div class="block">' +
    '<div class="block-title">' + esc(u.block1) + '</div>' +
    '<div class="sub-label">' + esc(t(u.dream, { id: tr.dream })) + '</div>' +
    '<ul class="dream-list">' +
      '<li><span class="medal">🥇</span><span>' + esc(r.dream[0]) + '</span></li>' +
      '<li><span class="medal">🥈</span><span>' + esc(r.dream[1]) + '</span></li>' +
      '<li><span class="medal">🥉</span><span>' + esc(r.dream[2]) + '</span></li>' +
    '</ul>' +
    '<div class="spacer-m"></div>' +
    '<div class="sub-label">' + esc(t(u.price, { id: tr.price })) + '</div>' +
    '<div class="quote-line">' + esc(r.price) + '</div>' +
    '<div class="spacer-s"></div>' +
    '<div class="sub-label">' + esc(t(u.commit, { id: tr.commitment })) + '</div>' +
    '<div class="quote-line">' + esc(r.commit) + '</div>' +
    '<div class="spacer-s"></div>' +
    '<div class="sub-label">' + esc(t(u.income, { id: tr.income })) + '</div>' +
    '<div class="quote-line">' + esc(r.income) + '</div>' +

    '<div class="gauge ' + levelClass(r.readiness) + '">' +
      '<div class="gauge-head">' +
        '<span class="sub-label">' + esc(t(u.gauge, { title: lvl.title })) + '</span>' +
        '<span class="gauge-value">' + r.readiness + '%</span>' +
      '</div>' +
      '<div class="gauge-track"><div class="gauge-fill" data-w="' + r.readiness + '"></div></div>' +
      '<p class="gauge-note">' + esc(lvl.note) + '</p>' +
      '<p class="gauge-note" style="font-size:.8rem;color:#5A636E">' +
        esc(t(u.gaugeHint, { need: r.needHours, give: r.giveHours })) + '</p>' +
    '</div>' +
  '</div>' +

  '<div class="block">' +
    '<div class="block-title">' + esc(u.block2) + '</div>' +
    '<div class="split">' +
      '<div>' +
        '<div class="sub-label">' + esc(u.leadLabel) + '</div>' +
        '<div class="vector-name shimmer-text">' + esc(Lt.name) + '</div>' +
        '<div class="vector-score">' + esc(t(u.score, { s: r.leadScore, m: MAX_SCORE, p: pct(r.leadScore) })) +
          ' · ' + esc(Lt.tagline) + '</div>' +
        '<p class="vector-desc">' + esc(Lt.desc) + '</p>' +
      '</div>' +
      '<div>' +
        '<div class="sub-label">' + esc(u.subLabel) + '</div>' +
        '<div class="vector-name silver">' + esc(St.name) + '</div>' +
        '<div class="vector-score">' + esc(t(u.score, { s: r.subScore, m: MAX_SCORE, p: pct(r.subScore) })) +
          ' · ' + esc(St.tagline) + '</div>' +
        '<p class="vector-desc"><b>' + esc(u.synergyWord) + '</b> ' +
          esc(t(u.synergyText, { lead: Lt.name, text: St.synergy })) + '</p>' +
        tieNote +
      '</div>' +
    '</div>' +
    '<div class="spacer-m"></div>' +
    '<div class="sub-label">' + esc(u.histogram) + '</div>' +
    '<div class="spacer-s"></div>' +
    '<div class="bars">' + bars + '</div>' +
    '<div class="spacer-m"></div>' +
    '<div class="pill-grid">' +
      '<div class="pill power"><h4>' + esc(u.power) + '</h4><p>' + esc(Lt.power) + '</p></div>' +
      '<div class="pill burn"><h4>' + esc(u.burnout) + '</h4><p>' + esc(Lt.burnout) + '</p></div>' +
    '</div>' +
  '</div>' +

  /* ---------- 3 · состояние на сейчас, 4 · стресс-профиль ---------- */
  blockState() +
  blockStress() +

  /* ---------- 5 · реализация в экосистеме ---------- */
  '<div class="block">' +
    '<div class="block-title">' + esc(u.block3) + '</div>' +
    '<div class="sub-label">' + esc(u.direction) + '</div>' +
    '<div class="vector-name shimmer-text" style="font-size:1.35rem">' + esc(Lt.role) + '</div>' +
    '<div class="spacer-s"></div>' +
    '<div class="sub-label">' + esc(u.tasks) + '</div>' +
    '<ul class="task-list">' + tasks + '</ul>' +
    '<div class="spacer-m"></div>' +
    '<div class="pill">' +
      '<h4>' + esc(u.allyTitle) + '</h4>' +
      '<p>' + t(u.allyText, { sub: esc(St.name), text: esc(St.synergy) }) + '<br><br>' +
        t(u.allyMore, { list: esc(Lt.allies.map(function(x){ return types[x].name; }).join(' · ')) }) + '</p>' +
    '</div>' +
  '</div>' +

  /* ---------- 6 · операционный профиль, 7 · правила безопасности ---------- */
  blockProject() +
  blockSafety() +

  '<div class="actions no-print">' +
    '<button id="btn-copy" class="btn btn-emerald">' + esc(u.copy) + '</button>' +
    '<button id="btn-print" class="btn btn-sapphire">' + esc(u.print) + '</button>' +
  '</div>' +

  '<div class="block">' +
    '<div class="block-title">' + esc(u.block4) + '</div>' +
    '<ol class="reflect-list">' + reflect + '</ol>' +
  '</div>' +

  '<button id="btn-restart" class="btn btn-ghost no-print">' + esc(u.restart) + '</button>' +
  '<p class="legal">' + esc(t(u.legal, { date: r.date })) + '</p>';

  requestAnimationFrame(function(){
    Array.prototype.forEach.call(elResult.querySelectorAll('[data-w]'), function(f){
      f.style.width = f.dataset.w + '%';
    });
  });

  $('btn-copy').addEventListener('click', copyReport);
  $('btn-print').addEventListener('click', function(){ window.print(); });
  $('btn-restart').addEventListener('click', function(){ showScreen(elIntro); });
}

/* Класс шкалы готовности по её значению */
function levelClass(v){ return v >= 65 ? 'lvl-high' : (v >= 40 ? 'lvl-mid' : 'lvl-low'); }

/* ============================================================
   8б. ПЕРЕДАЧА ОТВЕТОВ ОРГАНИЗАТОРУ
   ------------------------------------------------------------
   Сайт статический, своего сервера у него нет. Результат уходит
   POST-запросом в веб-приложение Google Apps Script, которое пишет
   строку в вашу приватную Google Таблицу.

   Ответ сервера прочитать нельзя (браузер запрещает читать ответ
   с чужого домена), но факт ухода запроса виден: если сети нет,
   промис отклоняется — тогда результат кладётся в очередь и уходит
   при следующем открытии страницы.
   ============================================================ */
function buildPayload(r){
  var types = T(), out = [];

  /* Все ответы дословно, в порядке вопросов */
  state.picks.forEach(function(slots, qi){
    var q = Q()[qi];
    out.push({
      id: q.id,
      picks: slots.map(function(idx){
        return idx === null ? '' : q.options[idx].text;
      })
    });
  });

  var pu = L().psych;
  var nameOf = function(bank, ty){ return ty ? pu[bank][ty].title : ''; };

  return {
    ts:        new Date().toISOString(),
    date:      r.date,
    lang:      state.lang,
    name:      state.name || '',
    contact:   state.contact || '',
    tgId:      state.tg ? state.tg.id : '',
    tgUser:    state.tg ? (state.tg.username || '') : '',
    tgInitData: state.tgInitData || '',
    consent:   state.consent ? 'да' : '',
    consentAt: state.consentAt || '',
    lead:      types[r.lead].name,
    leadScore: r.leadScore,
    sub:       types[r.sub].name,
    subScore:  r.subScore,
    maxScore:  MAX_SCORE,
    scores:    r.ranking.map(function(x){ return types[x.type].name + ': ' + x.score; }).join(' | '),
    readiness: r.readiness,
    needHours: r.needHours,
    giveHours: r.giveHours,
    dream1:    r.dream[0],
    dream2:    r.dream[1],
    dream3:    r.dream[2],
    price:     r.price,
    commit:    r.commit,
    income:    r.income,
    state:     nameOf('shadow',   r.trig.shadow),
    sabotage:  nameOf('sabotage', r.trig.sabotage),
    coping:    nameOf('pressure', r.trig.pressure),
    tradeoff:  nameOf('tradeoff', r.trig.tradeoff),
    answers:   out
  };
}

/* Отправка одной записи. Возвращает промис. */
function postResult(payload){
  return fetch(CFG.submit.url, {
    method: 'POST',
    mode: 'no-cors',
    /* text/plain — иначе браузер отправит предварительный запрос OPTIONS,
       который Apps Script не обрабатывает */
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

function submitResult(r){
  if (!CFG.submit.url) return;                 // сбор выключен — молча выходим
  var payload = buildPayload(r);
  queuePush(payload);
  flushQueue(true);
}

/* Очередь неотправленного живёт в том же хранилище браузера */
function queuePush(payload){
  var data = load() || {};
  data.outbox = (data.outbox || []).concat([payload]).slice(-20);
  store(data);
}

function flushQueue(notify){
  if (!CFG.submit.url) return;
  var data = load() || {};
  var box = data.outbox || [];
  if (!box.length) return;

  var pending = box.slice();
  var sentAll = true;
  var done = 0;

  pending.forEach(function(item){
    postResult(item).then(function(){
      done++;
      settle();
    }, function(){
      sentAll = false;
      done++;
      settle();
    });
  });

  /* Названа settle, а не finish, чтобы не путать с finish() —
     функцией завершения диагностики выше по файлу. */
  function settle(){
    if (done < pending.length) return;
    var fresh = load() || {};
    if (sentAll){
      fresh.outbox = [];
      store(fresh);
      if (notify) toast(U().toast.sent, '📨', 3500);
    } else if (notify){
      toast(U().toast.queued, '📡', 5000);
    }
  }
}

/* ============================================================
   9. КОПИРОВАНИЕ ОТЧЁТА
   ============================================================ */
function buildReportText(){
  var r = calculate(), R = U().report, types = T();
  var Lt = types[r.lead], St = types[r.sub];
  var tr = CFG.transcript, line = new Array(51).join('=');

  return [
    R.title,
    t(R.user, { name: r.name }),
    t(R.date, { date: r.date }),
    line,
    '',
    t(R.s1, { id: tr.dream }),
    R.p1 + r.dream[0],
    R.p2 + r.dream[1],
    R.p3 + r.dream[2],
    '',
    t(R.s2, { a: tr.price, b: tr.commitment }),
    R.need,
    '   » ' + r.price,
    R.give,
    '   » ' + r.commit,
    R.income,
    '   » ' + r.income,
    t(R.readiness, { v: r.readiness, title: readinessLevel(r.readiness).title }),
    '',
    R.s3,
    t(R.leadLine, { name: Lt.name, score: r.leadScore }),
    t(R.subLine,  { name: St.name, score: r.subScore }),
    t(R.powerLine, { text: Lt.power }),
    t(R.burnLine,  { text: Lt.burnout }),
    '',
    R.s4,
    t(R.roleLine, { role: Lt.role, tasks: Lt.tasks.join('; ') }),
    t(R.allyLine, { name: St.name })
  ].concat(psychReportLines(r)).concat([
    '',
    line,
    R.footer
  ]).join('\n');
}

/* Расширенный профиль в текстовом отчёте: то же содержание, что на экране,
   но сжато до строк, которые удобно читать в мессенджере. */
function psychReportLines(r){
  var P = L().psych, pu = P.ui, R = U().report, types = T();
  var out = [];

  if (r.trig.shadow){
    out.push('', R.s5, '• ' + P.shadow[r.trig.shadow].title + ': ' + P.shadow[r.trig.shadow].text);
    out.push('• ' + (r.trig.shadow === r.lead
      ? t(pu.echoSame, { lead: types[r.lead].name })
      : t(pu.echoDiff, { shadow: types[r.trig.shadow].name, lead: types[r.lead].name })));
  }

  if (r.trig.sabotage || r.trig.pressure){
    out.push('', R.s6);
    if (r.trig.sabotage) out.push('• ' + pu.stressStop + ': ' + P.sabotage[r.trig.sabotage].title +
                                  ' — ' + P.sabotage[r.trig.sabotage].text);
    if (r.trig.pressure) out.push('• ' + pu.stressCope + ': ' + P.pressure[r.trig.pressure].title +
                                  ' — ' + P.pressure[r.trig.pressure].text,
                                  '• ' + pu.stressRisk + ': ' + P.pressure[r.trig.pressure].risk);
  }

  var ro = P.role[r.lead], sf = P.safety[r.lead];
  out.push('', R.s7,
           '• ' + pu.projectRole  + ': ' + ro.role,
           '• ' + pu.projectDeleg + ': ' + ro.delegation,
           '• ' + pu.projectFric  + ': ' + ro.friction);
  if (r.trig.tradeoff) out.push('• ' + pu.projectPrice + ': ' + P.tradeoff[r.trig.tradeoff].title +
                                ' — ' + P.tradeoff[r.trig.tradeoff].text);

  out.push('', R.s8,
           '• ' + pu.safetyAvoid  + ': ' + sf.avoid,
           '• ' + pu.safetyMetric + ': ' + sf.metric,
           '• ' + pu.safetyDeleg  + ': ' + sf.delegate);

  return out;
}

function copyReport(){
  var text = buildReportText();
  var ok   = function(){ toast(U().toast.copied, '✅', 3500); };
  var fail = function(){ toast(U().toast.copyFail, '⚠️', 5000); };

  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(ok, function(){ legacyCopy(text) ? ok() : fail(); });
  } else {
    legacyCopy(text) ? ok() : fail();     // file:// не является secure context
  }
}

function legacyCopy(text){
  try{
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var okFlag = document.execCommand('copy');
    document.body.removeChild(ta);
    return okFlag;
  }catch(e){ return false; }
}

/* ============================================================
   10. ЗАПУСК
   ============================================================ */
function startQuiz(){
  /* Без согласия анкета не запускается */
  if (!$('consent-box').checked){
    toast(U().intro.consentNeed, '📋', 4000);
    $('consent-box').focus();
    return;
  }
  state.consent   = true;
  state.consentAt = new Date().toISOString();

  state.name    = (elName.value || '').trim().slice(0, 40);
  state.contact = (elContact.value || '').trim().slice(0, 60);
  state.qIndex = 0;
  state.date   = '';
  state.order  = Q().map(function(q){
    return shuffle(q.options.map(function(o, i){ return i; }));      // Fisher–Yates
  });
  state.timedOut = [];
  state.picks  = Q().map(function(q, i){
    var arr = [], n = picksOf(i);
    while (arr.length < n) arr.push(null);
    return arr;
  });
  saveState();
  $('btn-resume').classList.add('hidden');
  showScreen(elQuiz);
  renderQuestion();
}

elNext.addEventListener('click', function(){ if (!elNext.disabled) nextQuestion(); });
$('btn-start').addEventListener('click', startQuiz);
elName.addEventListener('keydown', function(e){ if (e.key === 'Enter') startQuiz(); });

/* Горячие клавиши 1–8 на экране вопроса */
document.addEventListener('keydown', function(e){
  if (elQuiz.classList.contains('hidden')) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  var n = parseInt(e.key, 10);
  if (n >= 1 && n <= state.order[state.qIndex].length) pick(state.order[state.qIndex][n - 1]);
});

/* Окно с текстом согласия */
$('consent-open').addEventListener('click', function(){ $('modal').classList.remove('hidden'); });
$('modal-close').addEventListener('click', function(){ $('modal').classList.add('hidden'); });
$('modal').addEventListener('click', function(e){
  if (e.target === $('modal')) $('modal').classList.add('hidden');
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') $('modal').classList.add('hidden');
});

function boot(){
  var saved = load() || {};

  if (saved.lang && window.CONTENT[saved.lang]) state.lang = saved.lang;
  recalcLimits();
  if (!validateContent()) { /* приложение продолжит работу, ошибки уже в консоли */ }

  if (saved.name) elName.value = saved.name;
  if (saved.contact) elContact.value = saved.contact;

  /* Согласие, отмеченное в прошлый раз, повторно отмечать не нужно */
  if (saved.consent){
    $('consent-box').checked = true;
    state.consent = true;
    state.consentAt = saved.consentAt || '';
  }
  $('consent-box').addEventListener('change', function(){
    var d = load() || {};
    d.consent = this.checked;
    d.consentAt = this.checked ? new Date().toISOString() : '';
    store(d);
  });

  /* Вход через Telegram: имя и @username уже известны, поле контакта прячем */
  if (state.tg){
    if (state.name) elName.value = state.name;
    elContact.value = state.contact;
    $('contact-field').classList.add('hidden');
    $('tg-hello').classList.remove('hidden');
  } else if (!CFG.submit.askContact){
    $('contact-field').classList.add('hidden');
  }

  /* Если с прошлого раза что-то не ушло — досылаем молча */
  flushQueue(false);

  /* Незавершённая диагностика */
  if (saved.progress && progressFits(saved.progress)){
    var btn = $('btn-resume');
    btn.classList.remove('hidden');
    state.qIndex = saved.progress.qIndex;
    btn.addEventListener('click', function(){
      state.name   = (elName.value || '').trim().slice(0, 40) || saved.name || '';
      state.order  = saved.progress.order;
      state.picks  = saved.progress.picks;
      state.qIndex = saved.progress.qIndex;
      state.timedOut = [];
      showScreen(elQuiz);
      renderQuestion();
    });
  }

  /* Готовый результат прошлого прохождения */
  if (saved.run && saved.run.picks && saved.run.picks.length === Q().length){
    var btnLast = $('btn-last');
    btnLast.classList.remove('hidden');
    btnLast.addEventListener('click', function(){
      state.order = saved.run.order;
      state.picks = saved.run.picks;
      state.name  = saved.run.name || saved.name || '';
      state.date  = saved.run.date;
      renderResult();
      showScreen(elResult);
    });
  }

  applyLanguage();
}

/* Сначала выясняем, не открыт ли Mini App внутри Telegram, и только потом
   запускаем интерфейс — иначе поля успеют отрисоваться без данных пользователя. */
initTelegram(boot);

})();
