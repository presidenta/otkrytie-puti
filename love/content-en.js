/* ============================================================================
   ПЯТЬ ЯЗЫКОВ ЛЮБВИ · Genesis Solar Life
   content-en.js — весь английский текст теста (добавлен 22.11.2026).
   Порядок вопросов и значения k — точно как в content-ru.js.
   Названия языков — как у Гэри Чепмена в оригинале (Words of Affirmation,
   Quality Time, Gifts, Acts of Service, Physical Touch); формулировки
   вопросов и рекомендаций — оригинальные, перевод с content-ru.js.
   ============================================================================ */

window.LOVE = window.LOVE || {};

window.LOVE.en = {

ui: {
  code: 'en',
  label: 'EN',
  brandTag:   'Genesis Solar Life',
  brandTitle: 'THE FIVE LOVE LANGUAGES',
  brandSub:   'Which language do you hear love in',

  intro: {
    lead: 'People rarely part because there is no love. Far more often it is because <strong>the love does not get through</strong>.',

    whyTitle: 'Why it matters',
    why: [
      'One washes the dishes and fixes the tap, the other waits for warm words. Both are trying — and both feel unappreciated.',
      'Gary Chapman noticed something simple: everyone expresses love the way they understand it themselves. There are only five languages. If two people speak different ones, their efforts go nowhere — like a conversation where both shout louder hoping to be understood.'
    ],

    closesTitle: 'What this clears up',
    closes: [
      'The feeling of “I am not valued” when the person next to you is honestly trying',
      'Arguments about the same thing that repeat for years',
      'Having to guess — and the hurt when you guessed wrong',
      'The question “why is it never enough for me”'
    ],
    closesAfter: 'It works not only in a couple: with parents, children, friends and at work — just the same.',

    note: 'Twenty-two questions, five answers in each. Mark three of the five and put first the one you would find hardest to live without. Answer fast, on your first impulse — it is more honest that way.',
    badges: ['◆ 22 questions', '◆ Priorities 1 · 2 · 3', '◆ 5 love languages'],
    nameLabel: 'What is your name?',
    namePlaceholder: 'Name',
    start: 'Start',
    resume: '▸ Continue from question {n} of {m}',
    last: '↺ Open the previous result',
    author: 'Based on Gary Chapman’s concept of the five love languages. The wording of the questions and recommendations is original.'
  },

  quiz: {
    counter: 'Question {n} of {m}',
    timerLabel: 'seconds',
    picked: 'Marked {n} of 3',
    pickMore: 'Mark {n} more',
    next: 'Next →',
    finish: 'Show the result',
    back: '← Back'
  },

  result: {
    chip: '✦ Your love language',
    dateLine: '{name} · {date}',
    mainLabel: 'Main language',
    mirrorNote: 'The questions looked at you from four sides: what you want to receive, how you show love yourself, what you ask for and what hurts you. Where all four agree — that is your language.',
    secondLabel: 'Supporting language',
    allLabel: 'All five languages',
    ofPicks: '{n} of {m} points',

    tankNote: 'Chapman describes it with the image of a tank: everyone has an emotional tank inside, and it is filled only by “their own” language. A full tank — the person is calm and generous. An empty one — picky, touchy, cold, and they do not understand why themselves. Below is how to fill yours.',

    criticalTitle: 'What is critical for you',
    behaveTitle:   'How to treat you — show this to the person close to you',
    neverTitle:    'What never to do',
    selfTitle:     'What you can do yourself',
    phraseTitle:   'A ready phrase — you can forward it as it is',
    hurtsTitle:    'What hurts most',
    shapeTitle:    'The shape of your profile',

    differsTitle: 'If the person close to you speaks another language',
    differsText: [
      'The most common mistake is to love a person the way you would like to be loved. You give gifts, and they need words; they wash the dishes, and you need hugs. Both try, neither receives.',
      'The way out is simple and unromantic: ask directly what the person needs, and do it regularly, even if it seems like a small thing to you. Chapman suggests an experiment — <b>speak your loved one’s language for 30 days</b>, not when inspired but on schedule. After a month it is not only they who change, but how you see each other.'
    ],

    copy: 'Copy the result',
    print: 'Save / Print',
    restart: '↺ Take it again',
    legal: 'Generated automatically · Genesis Solar Life · {date}'
  },

  toast: {
    copied: 'Result copied — you can send it to someone close',
    copyFail: 'Could not copy. Select the text by hand',
    timeout: 'Trust your first impulse! Mark the three closest answers',
    full: 'All three priorities are taken. Tap a number to free a place'
  },

  report: {
    title: '💛 THE FIVE LOVE LANGUAGES',
    user: 'Taken by: {name}',
    date: 'Date: {date}',
    main: 'MAIN LANGUAGE: {name} — {pct}% ({n} of {m} points)',
    second: 'SUPPORTING: {name} — {pct}%',
    all: 'ALL FIVE:',
    critical: 'WHAT IS CRITICAL FOR ME:',
    behave: 'HOW TO TREAT ME:',
    never: 'WHAT NEVER TO DO:',
    self: 'WHAT I CAN DO MYSELF:',
    phrase: 'IN MY OWN WORDS:',
    hurts: 'WHAT HURTS: {text}',
    footer: 'The concept of the five love languages — Gary Chapman.'
  }
},

/* ============================================================
   ФОРМА ПРОФИЛЯ — выбирается по разбросу процентов
   ============================================================ */
shapes: {
  dominant: {
    title: 'Pronounced profile',
    text: 'Your language sounds noticeably louder than the others. That is convenient: the person close to you only needs to understand one thing, and half the problems go away. But there is a risk — you may miss love expressed in another way. The one who fixes your car but does not say warm words loves you no less. Just in a different language.'
  },
  dual: {
    title: 'Bilingual profile',
    text: 'You have two leading languages, and you need both. This is not vagueness but a wider channel: you can be filled in two different ways. Tell the person close to you about both — otherwise they will pick one and sincerely not understand why it is not enough.'
  },
  flat: {
    title: 'Even profile',
    text: 'You have no strict priority: you feel love in many ways. It is hard to hurt you with a single slip, but just as hard to fill you with a single gesture — you need a little of everything. Tell the people close to you directly, otherwise they will search for “your one key”, which does not exist.'
  }
},

/* ============================================================
   ПЯТЬ ЯЗЫКОВ
   ============================================================ */
langs: {
  1: {
    name: 'Words of Affirmation',
    tagline: 'Recognition, praise, things said out loud',
    desc: 'You hear love. What is done silently weighs less for you than what is spoken: until the words are said, it is hard for you to believe you are valued. The flip side — a harsh phrase wounds you deeper and stays longer than the person who said it can imagine.',
    critical: 'You need to hear it. Not to guess from actions, not to work it out from attitude — to hear it in words. What is left unsaid does not exist for you: if a person values you but stays silent, you will feel unneeded beside them for years.',
    behave: [
      'Be specific: not “you are great”, but “you pulled that project through, I could not have done it”',
      'Praise you in front of others — your parents, friends, colleagues',
      'Send short messages during the day, for no reason',
      'Choose words carefully in an argument: you will remember not the point but the phrase',
      'Answer your words with words, not with silent agreement'
    ],
    never: [
      'Criticise you in front of strangers — you will not forget it',
      'Reply “it goes without saying” when you ask to hear it out loud',
      'Use silence as punishment'
    ],
    self: [
      'Ask directly: “it matters to me to hear it in words”. Most people simply do not guess',
      'Do not mistake silence for indifference: for a person whose language is Acts of Service, care looks like washed dishes',
      'Write down the warm words said to you — you will have something to return to on a bad day'
    ],
    phrase: 'I really need to hear in words that you value me. It is not an empty formality — without it I stop feeling needed. Tell me more often, even if it seems obvious to you.',
    hurts: 'Silence instead of thanks, criticism in front of others and the attitude “it goes without saying that I value you”.'
  },

  2: {
    name: 'Quality Time',
    tagline: 'Undivided attention, time together',
    desc: 'You need not presence but engagement. A person can be in the same room with you and still be absent — you feel it instantly. A real gift for you is not a thing but an evening in which nobody rushes you and nothing distracts.',
    critical: 'You need engagement, not presence. A person can live in the same flat with you and be a thousand miles away — you feel it instantly and experience it as rejection.',
    behave: [
      'Put the phone away during a conversation — screen down, not “I am listening”',
      'Plan time with you in advance, not with whatever is left over',
      'Listen to the end, without interrupting or rushing to fix the problem',
      'Ask questions about you, not only talk about themselves',
      'Keep promised meetings: a cancelled one weighs more for you than it seems'
    ],
    never: [
      'Cancel plans at the last moment without a serious reason',
      'Answer messages in the middle of a conversation with you',
      'Say “we will talk later” instead of a specific “let us sit down at nine”'
    ],
    self: [
      'Ask not “be with me”, but specifically: “Thursday evening, two hours, no phones”',
      'Accept that quality matters more than quantity: you do not need a whole day, you need an honest forty minutes',
      'Do not devalue other forms of care — help and gifts are love too, just in another language'
    ],
    phrase: 'I do not need you to be with me all the time. I need you, when we are together, to really be with me — without the phone and without rushing. Even an hour like that means more to me than a whole day side by side with half your attention.',
    hurts: 'Distraction during a conversation, the endless “we will talk later” and plans cancelled at the last moment.'
  },

  3: {
    name: 'Gifts',
    tagline: 'Tokens of attention as proof someone thought of you',
    desc: 'It is not about price or things. A gift for you is material proof that someone thought of you when you were not around. Chapman also counts “the gift of self” here: when a person drops everything and is beside you in a hard moment. You remember who gave you what, and you notice just as sharply when a date is forgotten.',
    critical: 'It is not about things or money. A gift for you is proof that someone thought of you when you were not around. A forgotten date reads as “I am not on their mind”.',
    behave: [
      'Give small things for no reason: regularity matters, not price',
      'Note what you mention in passing and come back to it',
      'Prepare for dates in advance, not buy something in the last hour',
      'Bring something back from every trip, even the smallest thing',
      'Be there in a hard moment — Chapman calls it “the gift of self”, and for you it is a gift too'
    ],
    never: [
      'Forget your birthday and anniversaries',
      'Give money instead of a gift if you did not ask for it',
      'Say “why do you need things, you are not materialistic”'
    ],
    self: [
      'Explain to the people close to you that it is not about cost — otherwise they will be afraid they “cannot afford it”',
      'Make a wish list and hand it over: it is not greed, it is a hint',
      'Do not measure love by the price of a gift — some people honestly do not know how to choose'
    ],
    phrase: 'For me a gift is not about money. It matters to me to know that you thought of me when I was not around. Let it be a small thing, but chosen for me — it will tell me more than anything.',
    hurts: 'A forgotten date, a dutiful gift “just to have one” and the phrase “why do you need things, you are not materialistic”.'
  },

  4: {
    name: 'Acts of Service',
    tagline: 'A deed done as a form of care',
    desc: 'You believe deeds, not intentions. A task taken off your shoulders tells you more about love than the most beautiful compliment. And the other way round: a broken promise is not forgetfulness to you, but a measure of how important you are.',
    critical: 'You believe deeds. Words are an intention for you, a deed is proof. You read a broken promise not as forgetfulness but as the answer to “how important am I”.',
    behave: [
      'Do things without waiting to be asked: asking is hard for you',
      'Finish what was started — begun and abandoned is worse for you than not done',
      'In a hard period take the load off instead of cheering you on',
      'Keep promises in small things: those are exactly what you judge by',
      'Ask “what can I take off you?” rather than “how can I help?”'
    ],
    never: [
      'Promise and not do it',
      'Say “I will do it later” with no deadline',
      'Make you ask twice'
    ],
    self: [
      'Say specifically what needs to be done — people do not read minds',
      'Learn to accept help: you are used to carrying everything yourself, and that takes away the chance for the people close to you to love you',
      'Do not consider words empty: for a person whose language is Words, saying it is their way of doing'
    ],
    phrase: 'It is hard for me to ask, but for me care looks like a thing done. If you see I am overwhelmed — just take something on, without asking. It will tell me more about your love than any words.',
    hurts: 'Broken promises, “I will do it later” and help you had to ask for three times.'
  },

  5: {
    name: 'Physical Touch',
    tagline: 'Physical closeness and contact',
    desc: 'Your body understands before your head. A hug calms you faster than any conversation, and physical distance reads as cooling, even if everything is fine in words. You do not need special occasions — what matters is how regular the touch is, not how significant.',
    critical: 'Your body understands before your head. Physical distance reads as cooling, even if everything is fine in words. A long absence of touch feels to you like losing the connection.',
    behave: [
      'Hug at every meeting and every goodbye',
      'Touch in passing: a hand on the shoulder, palm in palm',
      'Sit next to you, not across from you',
      'Not pull away physically in an argument: for you it is the hardest punishment',
      'In a hard moment hug first, talk later'
    ],
    never: [
      'Pull away during a conflict',
      'Touch only “on schedule”',
      'Ignore your outstretched hand'
    ],
    self: [
      'Say directly what kind of touch you need — people are shy to guess',
      'Remember it does not come easily to everyone: for someone who grew up without hugs it is a skill, not a feeling',
      'Do not read the absence of touch as rejection — sometimes it is just tiredness'
    ],
    phrase: 'I need touch — it is not about intimacy, it is about how I feel at all that we are together. Hug me when we meet, take my hand, sit next to me. When you keep your distance, I start to think something is wrong.',
    hurts: 'Long physical distance, pulling away during an argument and touch only “on schedule”.'
  }
},

/* 22 вопроса, в каждом 5 ответов — по одному на каждый язык.
   На экране ответы перемешиваются. */
questions: [
  { q: 'What is the most pleasant thing to receive from someone close to you?',
    o: [ { t: 'Warm words and praise', k: 1 },
         { t: 'Time together, without rushing', k: 2 },
         { t: 'A gift or a surprise', k: 3 },
         { t: 'Help with things to do', k: 4 },
         { t: 'Hugs and closeness', k: 5 } ] },

  { q: 'How do you know a person really loves you?',
    o: [ { t: 'They tell me so', k: 1 },
         { t: 'They find time for me', k: 2 },
         { t: 'They give me gifts', k: 3 },
         { t: 'They help me without being asked', k: 4 },
         { t: 'They reach out to hug me', k: 5 } ] },

  { q: 'You come home after a very hard day. What do you need most?',
    o: [ { t: 'To hear: “you made it, I am proud of you”', k: 1 },
         { t: 'For someone to sit beside me and listen', k: 2 },
         { t: 'To be met with something nice for me', k: 3 },
         { t: 'For someone to take some of my tasks and let me rest', k: 4 },
         { t: 'To simply be hugged and held', k: 5 } ] },

  { q: 'What do you most often do yourself when you want to show your love?',
    o: [ { t: 'I say warm words', k: 1 },
         { t: 'I spend time with the person', k: 2 },
         { t: 'I give something', k: 3 },
         { t: 'I help with deeds', k: 4 },
         { t: 'I hug, take their hand', k: 5 } ] },

  { q: 'What hurts you most?',
    o: [ { t: 'When I am not thanked or praised', k: 1 },
         { t: 'When I am not given time', k: 2 },
         { t: 'When dates important to me are forgotten', k: 3 },
         { t: 'When someone promised to help and did not', k: 4 },
         { t: 'When they keep their distance and do not touch me', k: 5 } ] },

  { q: 'What does a perfect evening with someone close look like to you?',
    o: [ { t: 'We tell each other things we usually do not say out loud', k: 1 },
         { t: 'Just the two of us, nobody rushing, nothing distracting', k: 2 },
         { t: 'A little surprise is waiting for me', k: 3 },
         { t: 'Everything is already done, I am taken care of', k: 4 },
         { t: 'We spend the whole evening side by side, holding each other', k: 5 } ] },

  { q: 'What do you miss most when someone close goes away for a long time?',
    o: [ { t: 'Their words and voice', k: 1 },
         { t: 'Evenings and talks together', k: 2 },
         { t: 'The little things they used to bring', k: 3 },
         { t: 'Their help with things', k: 4 },
         { t: 'Their touch', k: 5 } ] },

  { q: 'What is the main sign of real care for you?',
    o: [ { t: 'People speak well of me, out loud', k: 1 },
         { t: 'Someone carves out time for me', k: 2 },
         { t: 'Someone remembers me and brings something', k: 3 },
         { t: 'Someone does the hard things for me', k: 4 },
         { t: 'Someone hugs me and keeps me close', k: 5 } ] },

  { q: 'How do you support a person who is feeling bad?',
    o: [ { t: 'I find words that lift them up', k: 1 },
         { t: 'I simply sit beside them as long as needed', k: 2 },
         { t: 'I bring something to cheer them up', k: 3 },
         { t: 'I take their tasks on myself', k: 4 },
         { t: 'I hug them', k: 5 } ] },

  { q: 'Which act of someone close would move you most?',
    o: [ { t: 'If they say out loud what I mean to them', k: 1 },
         { t: 'If they drop everything and come to me', k: 2 },
         { t: 'If they give me something I mentioned in passing', k: 3 },
         { t: 'If they quietly do what I have long been putting off', k: 4 },
         { t: 'If they hold me tight and do not let go for a long time', k: 5 } ] },

  { q: 'What matters most to you on your birthday?',
    o: [ { t: 'Warm words and wishes in person', k: 1 },
         { t: 'That the people close to me spent the day with me', k: 2 },
         { t: 'A gift chosen especially for me', k: 3 },
         { t: 'That everything was organised for me', k: 4 },
         { t: 'Hugs and lots of warmth from the people close to me', k: 5 } ] },

  { q: 'What do you need to make up after a quarrel?',
    o: [ { t: 'To hear an apology and kind words', k: 1 },
         { t: 'To sit down and calmly talk it all through', k: 2 },
         { t: 'A peace-making gesture or a gift', k: 3 },
         { t: 'To see in deeds that the person will change', k: 4 },
         { t: 'To simply be hugged', k: 5 } ] },

  { q: 'By what sign do you know a relationship has cooled?',
    o: [ { t: 'Warm words stopped being said', k: 1 },
         { t: 'We stopped spending time together', k: 2 },
         { t: 'Tokens of attention and surprises disappeared', k: 3 },
         { t: 'Nobody does anything for each other any more', k: 4 },
         { t: 'Touch disappeared', k: 5 } ] },

  { q: 'What do you expect from a friend in a hard moment?',
    o: [ { t: 'To say: “I am with you, you will make it”', k: 1 },
         { t: 'To be there and listen', k: 2 },
         { t: 'To bring something that will cheer me up', k: 3 },
         { t: 'To help solve the problem', k: 4 },
         { t: 'To hug me', k: 5 } ] },

  { q: 'How do you show love to a child or someone younger?',
    o: [ { t: 'I praise them and tell them warm words', k: 1 },
         { t: 'I spend time with them', k: 2 },
         { t: 'I buy something that will make them happy', k: 3 },
         { t: 'I do things for them, drive them, help', k: 4 },
         { t: 'I hug, kiss, pick them up', k: 5 } ] },

  { q: 'What is hardest for you to forgive?',
    o: [ { t: 'Hurtful words', k: 1 },
         { t: 'Never having time for me — something else always came first', k: 2 },
         { t: 'Being forgotten on an important day — no gift, no sign of attention', k: 3 },
         { t: 'Not being helped with things when it was hard for me', k: 4 },
         { t: 'Being pushed away — no hug, no touch when I needed it', k: 5 } ] },

  { q: 'What do you do first when you are glad to see someone?',
    o: [ { t: 'I say how much I missed them', k: 1 },
         { t: 'I suggest we sit down and talk', k: 2 },
         { t: 'I bring out what I have prepared for them', k: 3 },
         { t: 'I ask how I can help', k: 4 },
         { t: 'I hug them', k: 5 } ] },

  { q: 'What does “a person who is truly there for me” mean to you?',
    o: [ { t: 'They tell me important words', k: 1 },
         { t: 'They spend time with me', k: 2 },
         { t: 'They remember me and bring tokens of attention', k: 3 },
         { t: 'They take on part of my load', k: 4 },
         { t: 'They take my hand, they touch me', k: 5 } ] },

  { q: 'What would you ask someone close for first, and what next? Choose up to three: 1 — what matters most to you, then the less important.',
    o: [ { t: 'Tell me warm words more often', k: 1 },
         { t: 'Spend more time with me', k: 2 },
         { t: 'Delight me with little tokens of attention', k: 3 },
         { t: 'Help me with deeds', k: 4 },
         { t: 'Hug me more often', k: 5 } ] },

  { q: 'What most often gives you the feeling “I am loved”?',
    o: [ { t: 'When I am told so in words', k: 1 },
         { t: 'When someone gives me their time', k: 2 },
         { t: 'When something is brought for me', k: 3 },
         { t: 'When something is done for me', k: 4 },
         { t: 'When I am touched', k: 5 } ] },

  /* 21–22 — как в content-ru.js */
  { q: 'What do you most often ask someone close for — not in dreams, but in everyday life?',
    o: [ { t: '“Tell me what you think of me”', k: 1 },
         { t: '“Put the phone down, be with me”', k: 2 },
         { t: '“Do not forget about me when you are away”', k: 3 },
         { t: '“Help me with this, please”', k: 4 },
         { t: '“Come here, hug me”', k: 5 } ] },

  { q: 'When you are unhappy with someone close, what most often slips out of you?',
    o: [ { t: '“I never hear a kind word from you”', k: 1 },
         { t: '“You are never here, you are always busy”', k: 2 },
         { t: '“You did not even remember my day”', k: 3 },
         { t: '“Everything is on me again, you did not help at all”', k: 4 },
         { t: '“You will not even hug me”', k: 5 } ] }
]

};
