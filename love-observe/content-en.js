/* ============================================================================
   ЯЗЫК ЛЮБВИ БЛИЗКОГО — анкета по наблюдению · Genesis Solar Life
   content-en.js — весь английский текст (добавлен 22.11.2026).
   Порядок групп, вопросов и значения k — точно как в content-ru.js.
   Названия языков — как у Гэри Чепмена в оригинале.
   ============================================================================ */

window.LOVE_OBS = window.LOVE_OBS || {};

window.LOVE_OBS.en = {

ui: {
  code: 'en',
  label: 'EN',
  brandTag:   'Genesis Solar Life',
  brandTitle: 'A LOVED ONE’S LOVE LANGUAGE',
  brandSub:   'A questionnaire by observation — for a child, a teenager or an adult',

  intro: {
    lead: 'A child will not say: “my love language is physical touch”. But they <strong>show</strong> it every day — in their requests, their complaints and the way they love.',

    whyTitle: 'How it works',
    why: [
      'Gary Chapman and Ross Campbell suggest discovering a child’s love language by observation: how they show love to you and to others, what they ask for most often and what they complain about most often.',
      'With teenagers and adults it is the same. A person unconsciously gives what they themselves are waiting for, asks for what they lack, and takes offence where it hurts.'
    ],

    howTitle: 'How to answer',
    how: [
      'Think about what you have seen with your own eyes, not about how it should be',
      'Mark one to three similar answers and put first the one that happens most often',
      'If you do not remember anything like that, tap “Have not noticed”. It is more honest than guessing',
      'Best of all — observe for a week, then take the questionnaire'
    ],

    whoTitle: 'Who are you answering for?',
    note: 'If the person can take the questionnaire themselves, better send them the main one: <a href="../love/">“The Five Love Languages”</a>. Their own answer is more accurate than any observation.',
    nameLabel: 'What is their name?',
    namePlaceholder: 'Name',
    start: 'Start',
    pickWho: 'First choose who you are answering for',
    resume: '▸ Continue from question {n} of {m}',
    last: '↺ Open the previous result',
    author: 'Based on Gary Chapman’s clues from the books “The 5 Love Languages”, “The 5 Love Languages of Children” (with Ross Campbell) and “The 5 Love Languages of Teenagers”. The wording of the questions and recommendations is original.'
  },

  quiz: {
    counter: 'Question {n} of {m}',
    pickOne: 'Mark at least one answer',
    next: 'Next →',
    finish: 'Show the result',
    skip: 'Have not noticed this',
    back: '← Back'
  },

  result: {
    chip: '✦ Love language',
    dateLine: '{name} · {group} · {date}',
    mainLabel: 'Main language',
    secondLabel: 'Second language',
    allLabel: 'All five languages',
    ofPicks: '{n} of {m} points',
    seenTitle: 'How it shows',
    doTitle: 'What to do',
    neverTitle: 'What to avoid',
    shapeTitle: 'Profile shape',
    fewNote: 'Questions answered: {n} of {m}, the rest — “have not noticed”. The result is preliminary: observe for another week or two and take the questionnaire again.',
    allNote: 'Chapman stresses: a loved one needs all five languages. The main one is simply the shortest way to the heart. Do not drop the others.',
    copy: 'Copy the result',
    print: 'Save / Print',
    restart: '↺ Take it again',
    legal: 'Generated automatically · Genesis Solar Life · {date}'
  },

  toast: {
    copied: 'Result copied — you can save or forward it',
    copyFail: 'Could not copy. Select the text by hand',
    full: 'All three places are taken. Tap a number to free a place'
  },

  report: {
    title: '💛 A LOVED ONE’S LOVE LANGUAGE — BY OBSERVATION',
    who: 'For: {name} ({group})',
    date: 'Date: {date}',
    main: 'MAIN LANGUAGE: {name} — {pct}%',
    second: 'SECOND: {name} — {pct}%',
    all: 'ALL FIVE:',
    seen: 'HOW IT SHOWS:',
    todo: 'WHAT TO DO:',
    never: 'WHAT TO AVOID:',
    check: 'CHECK:',
    footer: 'The concept of the five love languages — Gary Chapman.'
  }
},

shapes: {
  dominant: {
    title: 'One leading language',
    text: 'One language sounds noticeably louder than the others. Start with it: it is the shortest way to this person’s heart.'
  },
  dual: {
    title: 'Two leading languages',
    text: 'Two languages are almost level, and both are needed. Speak both — otherwise the person will always be missing something and will not understand what.'
  },
  flat: {
    title: 'Even profile',
    text: 'No clearly pronounced language is visible yet. This happens with small children, whose language is still forming, and when there are few observations. Speak all five and observe for a couple more weeks — especially their requests and complaints.'
  }
},

langs: {
  1: { name: 'Words of Affirmation', tagline: 'Recognition, praise, things said out loud' },
  2: { name: 'Quality Time',         tagline: 'Undivided attention, time together' },
  3: { name: 'Gifts',                tagline: 'Tokens of attention as proof someone thought of them' },
  4: { name: 'Acts of Service',      tagline: 'A deed done as a form of care' },
  5: { name: 'Physical Touch',       tagline: 'Physical closeness and contact' }
},

groups: {

/* ---------- CHILD · about 3–12 · 18 questions ---------- */
child: {
  label: 'Child',
  hint: 'about 3–12 years old',
  questions: [
    { q: 'When the child is glad to see you — after nursery, school, your work — what do they do first?',
      o: [ { t: 'Says “I love you”, tells you how they missed you', k: 1 },
           { t: 'Pulls you to play or to show you something together', k: 2 },
           { t: 'Runs to give you a drawing, a craft or a “find”', k: 3 },
           { t: 'Brings your slippers, tries to help with something', k: 4 },
           { t: 'Rushes to hug you, climbs into your arms', k: 5 } ] },

    { q: 'How does the child show they love you — just like that, for no reason?',
      o: [ { t: 'Says tender words, praises you', k: 1 },
           { t: 'Calls you to be with them: play, read, sit nearby', k: 2 },
           { t: 'Gives you something of their own: a sweet, a pebble, a drawing', k: 3 },
           { t: 'Helps: sets the table, tidies up, fetches things', k: 4 },
           { t: 'Snuggles up, strokes you, sits right next to you', k: 5 } ] },

    { q: 'What does the child do when they see you are sad or tired?',
      o: [ { t: 'Says something kind: “don’t be sad, you’re good”', k: 1 },
           { t: 'Sits next to you and stays there', k: 2 },
           { t: 'Brings something to cheer you up', k: 3 },
           { t: 'Tries to help: tidy up, bring water', k: 4 },
           { t: 'Hugs you, strokes your hand', k: 5 } ] },

    { q: 'How does the child make up after a quarrel or a punishment?',
      o: [ { t: 'Says “sorry” and tender words', k: 1 },
           { t: 'Follows you around, asks you to play', k: 2 },
           { t: 'Brings a “gift” — a drawing, a toy', k: 3 },
           { t: 'Does something good: tidies up, helps', k: 4 },
           { t: 'Comes over for a hug', k: 5 } ] },

    { q: 'How does the child show love to grandparents, brothers, sisters?',
      o: [ { t: 'Says tender words to them, praises them', k: 1 },
           { t: 'Wants to spend time with them, play', k: 2 },
           { t: 'Makes them gifts, draws cards', k: 3 },
           { t: 'Helps them, does things for them', k: 4 },
           { t: 'Hugs, kisses, sits close to them', k: 5 } ] },

    { q: 'How does the child behave with friends?',
      o: [ { t: 'Praises them, says nice things', k: 1 },
           { t: 'The main thing for them is to play together for longer', k: 2 },
           { t: 'Loves giving and swapping things', k: 3 },
           { t: 'Helps out: shares, assists, explains', k: 4 },
           { t: 'Hugs, holds hands, plays rough-and-tumble', k: 5 } ] },

    { q: 'How does the child treat a pet or a favourite toy?',
      o: [ { t: 'Talks to it tenderly, praises it', k: 1 },
           { t: 'Plays with it for a long time and does not leave it', k: 2 },
           { t: 'Brings it treats and “presents”', k: 3 },
           { t: 'Takes care of it: feeds, puts to bed, “treats” it', k: 4 },
           { t: 'Strokes, squeezes, carries it around', k: 5 } ] },

    { q: 'What does the child ask for most often?',
      o: [ { t: '“Look what I made! Did it turn out well?”', k: 1 },
           { t: '“Play with me!”', k: 2 },
           { t: '“Buy me…”', k: 3 },
           { t: '“Help me…”, “Do it for me…”', k: 4 },
           { t: '“Pick me up”, “Hug me”', k: 5 } ] },

    { q: 'What does the child ask for at bedtime?',
      o: [ { t: 'For you to say something tender to them', k: 1 },
           { t: 'For you to sit with them, read, talk', k: 2 },
           { t: 'To have a favourite thing or a present nearby', k: 3 },
           { t: 'To bring water, fix the blanket, turn on the night light', k: 4 },
           { t: 'To lie next to them, stroke their back', k: 5 } ] },

    { q: 'What does the child ask for when you are going away for a few days?',
      o: [ { t: 'To call and say warm words to them', k: 1 },
           { t: 'To come back soon and spend a day together', k: 2 },
           { t: 'To bring them something', k: 3 },
           { t: 'To do something for them before leaving: pack their bag, cook their favourite food', k: 4 },
           { t: 'To hug tight when saying goodbye — and when meeting again', k: 5 } ] },

    { q: 'What does the child boast about to friends or other adults?',
      o: [ { t: 'Your words: “Dad said I did it brilliantly”', k: 1 },
           { t: 'Where you went and what you did together', k: 2 },
           { t: 'Presents and new things', k: 3 },
           { t: 'What was done for them: “Mum fixed my bike”', k: 4 },
           { t: 'How they get hugged and carried in arms', k: 5 } ] },

    { q: 'What does the child complain about most often?',
      o: [ { t: '“You never praise me”, “You only scold me”', k: 1 },
           { t: '“You are always busy”, “You don’t play with me”', k: 2 },
           { t: '“You didn’t buy me anything”, “You forgot the present”', k: 3 },
           { t: '“You don’t help me”, “Why do I have to do everything myself?”', k: 4 },
           { t: '“You don’t hug me”, “Don’t go”', k: 5 } ] },

    { q: 'What upsets the child most?',
      o: [ { t: 'When they are scolded or spoken to harshly', k: 1 },
           { t: 'When you promised to play — and did not', k: 2 },
           { t: 'When a promised present or surprise was forgotten', k: 3 },
           { t: 'When they were not helped although they asked', k: 4 },
           { t: 'When they were pushed away or not hugged', k: 5 } ] },

    { q: 'Which punishment is the hardest for the child?',
      o: [ { t: 'Harsh words, shouting', k: 1 },
           { t: 'Being sent to be alone', k: 2 },
           { t: 'Having a favourite thing taken away', k: 3 },
           { t: 'Being refused help: “do it yourself”', k: 4 },
           { t: 'When nobody comes near and they are not allowed to cuddle up', k: 5 } ] },

    { q: 'When the child is jealous — of a brother, a sister, your work — what do they say or do?',
      o: [ { t: '“You praise him, but not me”', k: 1 },
           { t: '“You play with him, but not with me”', k: 2 },
           { t: '“He got something bought, but I didn’t”', k: 3 },
           { t: '“You help him, but not me”', k: 4 },
           { t: 'Climbs into your arms, pushes the other one aside', k: 5 } ] },

    { q: 'What calms the child fastest when they cry?',
      o: [ { t: 'Tender words: “I’m with you, it’s all right”', k: 1 },
           { t: 'When you sit next to them and listen', k: 2 },
           { t: 'A favourite toy or a treat', k: 3 },
           { t: 'When you solve their trouble: fix it, find it', k: 4 },
           { t: 'Hugs, rocking', k: 5 } ] },

    { q: 'What makes the child light up most?',
      o: [ { t: 'Praise, especially in front of others', k: 1 },
           { t: 'A whole day together with you', k: 2 },
           { t: 'A present, even a small one', k: 3 },
           { t: 'When you did something especially for them', k: 4 },
           { t: 'When you cuddle and tickle them', k: 5 } ] },

    { q: 'What does the child remember for a long time afterwards?',
      o: [ { t: 'What you said to them', k: 1 },
           { t: 'How you went somewhere together', k: 2 },
           { t: 'Who gave them what', k: 3 },
           { t: 'How you helped them in a hard moment', k: 4 },
           { t: 'How you hugged and lay side by side', k: 5 } ] }
  ],

  tips: {
    1: {
      seen: 'The child hears love. Praise and tender words are like food for them, and a harsh word wounds them deeper than other children and is remembered longer.',
      todo: [
        'Say “I love you” every day — just like that, not for something',
        'Praise specifically: not “good”, but “you zipped up your jacket yourself, I saw it”',
        'Leave notes in their school bag or under the pillow',
        'Praise them in front of grandparents and friends'
      ],
      never: [
        'Shout and call names — they will carry these words into adult life',
        'Compare them with other children',
        'Punish with silence'
      ]
    },
    2: {
      seen: 'The child needs your undivided attention. Not “nearby, but on the phone”, but only with them: in those minutes they feel they matter.',
      todo: [
        'Every day 15–20 minutes just the two of you, no phone',
        'Play what they chose',
        'Talk at bedtime: “what was the best thing today?”',
        'Take them along on ordinary errands: to the shop, into the kitchen'
      ],
      never: [
        'Send them “to be alone” as a punishment',
        'Promise to play — and not play',
        'Listen with half an ear, looking at a screen'
      ]
    },
    3: {
      seen: 'For a child a present is a visible sign that someone thought of them. Not the price matters, but that the thing was chosen especially for them.',
      todo: [
        'Bring small surprises for no reason: a sticker, an apple, a pebble',
        'Keep their gifts to you with care: drawings in a visible place',
        'Give with a hug and words, not just hand it over',
        'Remember their little dreams'
      ],
      never: [
        'Take away what was given as a punishment',
        'Replace time and hugs with presents',
        'Throw away their drawings and crafts in front of them'
      ]
    },
    4: {
      seen: 'The child feels love through what is done for them. Help is proof for them: “I am cared for”.',
      todo: [
        'Help with what is still hard for them — and teach them to do it themselves',
        'Cook their favourite food',
        'Fix broken toys without putting it off',
        'Pack the school bag together, get clothes ready for an important day'
      ],
      never: [
        'Answer “do it yourself” when it really is hard for them',
        'Put off promised help',
        'Do everything for them — that is not care either'
      ]
    },
    5: {
      seen: 'The child feels love with their body. Hugs, kisses and rough-and-tumble calm them faster than any words.',
      todo: [
        'Hug in the morning, when meeting and at bedtime',
        'Pick them up, stroke their back, hold their hand',
        'Play rough-and-tumble, tickle, play active games',
        'When they cry — hug first, sort it out later'
      ],
      never: [
        'Push them away when they reach out for a hug',
        'Punish physically — for such a child it is especially painful',
        'Withhold hugs as a punishment'
      ]
    }
  },

  check: {
    title: 'Check by choice',
    text: 'Chapman and Campbell suggest checking your observation by offering a choice. Offer the child one pair a day and write down what they choose. The language that wins more often is theirs.',
    pairs: [
      '“Shall I write you a note about what I like in you — or play together, just the two of us?”',
      '“Shall I tell you what I am proud of in you — or bring you a little surprise?”',
      '“Shall I write you a note — or help you finish your craft?”',
      '“Shall I tell you what I like in you — or lie together in a cuddle?”',
      '“Shall we go to the playground together — or shall I buy you some stickers?”',
      '“Shall we play together — or shall I fix your toy?”',
      '“Shall we go for a walk together — or cuddle on the sofa?”',
      '“A little present — or help with what is not working out for you?”',
      '“A surprise — or a longer cuddle before bed?”',
      '“Shall I help you tidy your room — or shall we laze about together in a cuddle?”'
    ]
  }
},

/* ---------- TEENAGER · 12–18 · 16 questions ---------- */
teen: {
  label: 'Teenager',
  hint: '12–18 years old',
  questions: [
    { q: 'How does the teenager show you warmth — even if rarely?',
      o: [ { t: 'Says something nice or writes “thank you”', k: 1 },
           { t: 'Asks you to watch a film, opens up in a heart-to-heart', k: 2 },
           { t: 'Buys or makes you something for a holiday', k: 3 },
           { t: 'Does something around the house without reminders', k: 4 },
           { t: 'Hugs you, puts their head on your shoulder', k: 5 } ] },

    { q: 'How does the teenager make up after a quarrel?',
      o: [ { t: 'Apologises in words or writes a message', k: 1 },
           { t: 'Comes, sits next to you and starts a conversation', k: 2 },
           { t: 'Brings something: a chocolate, a cup of tea', k: 3 },
           { t: 'Quietly does something useful', k: 4 },
           { t: 'Comes over and hugs you', k: 5 } ] },

    { q: 'What does the teenager do when you feel bad?',
      o: [ { t: 'Says or writes words of support', k: 1 },
           { t: 'Stays at home to be with you', k: 2 },
           { t: 'Brings something to cheer you up', k: 3 },
           { t: 'Takes on tasks: dinner, the younger ones, shopping', k: 4 },
           { t: 'Hugs you', k: 5 } ] },

    { q: 'How does the teenager show they are proud of you or the family?',
      o: [ { t: 'Says so out loud or writes it', k: 1 },
           { t: 'Invites you to their games and performances, wants you to be there', k: 2 },
           { t: 'Gives something meaningful', k: 3 },
           { t: 'Does something for the family without being asked', k: 4 },
           { t: 'Hugs you in front of everyone', k: 5 } ] },

    { q: 'How does the teenager behave with friends?',
      o: [ { t: 'Supports them with words, writes warm messages', k: 1 },
           { t: 'Spends hours walking, calling, spending time with them', k: 2 },
           { t: 'Remembers birthdays, gives presents', k: 3 },
           { t: 'Helps out with deeds: with studies, with gadgets, with a move', k: 4 },
           { t: 'Hugs when meeting, stays close', k: 5 } ] },

    { q: 'How does the teenager behave with younger brothers and sisters, with grandparents?',
      o: [ { t: 'Praises, encourages', k: 1 },
           { t: 'Spends time with them, plays, listens', k: 2 },
           { t: 'Gives, shares their own things', k: 3 },
           { t: 'Helps: with homework, around the house', k: 4 },
           { t: 'Hugs, plays rough-and-tumble, sits them close', k: 5 } ] },

    { q: 'Which adult — a teacher, a coach, a relative — does the teenager speak of warmly? What for?',
      o: [ { t: 'That person praises and notices them', k: 1 },
           { t: 'That person finds time for them, you can talk with them', k: 2 },
           { t: 'That person remembered them and gave them something', k: 3 },
           { t: 'That person helped them with a specific task', k: 4 },
           { t: 'That person pats them on the shoulder, shakes hands — it feels warm with them', k: 5 } ] },

    { q: 'What does the teenager ask for most often?',
      o: [ { t: '“Come on, say it — it turned out fine, didn’t it?”', k: 1 },
           { t: 'To go somewhere together, sit with them, talk', k: 2 },
           { t: 'To buy something specific', k: 3 },
           { t: 'To help, give a lift, do it for them', k: 4 },
           { t: 'To scratch their back, give a massage, sit nearby', k: 5 } ] },

    { q: 'When the teenager starts a conversation with you, where do they usually lead?',
      o: [ { t: 'They want to hear your opinion and approval', k: 1 },
           { t: 'They just want to be with you and talk', k: 2 },
           { t: 'They want to get something', k: 3 },
           { t: 'They want you to help with something', k: 4 },
           { t: 'They sit right next to you, lean against you', k: 5 } ] },

    { q: 'What does the teenager want for their birthday?',
      o: [ { t: 'A warm greeting, words from you', k: 1 },
           { t: 'To spend the day together: a trip, a café, the cinema', k: 2 },
           { t: 'A specific present they have had their eye on for a long time', k: 3 },
           { t: 'For everything to be organised for them', k: 4 },
           { t: 'For someone to come in the morning to hug and congratulate them', k: 5 } ] },

    { q: 'What does the teenager complain about most often?',
      o: [ { t: '“All you do is criticise me”', k: 1 },
           { t: '“You never have time”, “You don’t listen to me”', k: 2 },
           { t: '“Others get things bought for them, but I don’t”', k: 3 },
           { t: '“You never help me”', k: 4 },
           { t: 'Takes offence when you don’t come over and hug them', k: 5 } ] },

    { q: 'What hurts the teenager most?',
      o: [ { t: 'Harsh words, mockery in front of others', k: 1 },
           { t: 'When time together was promised — and cancelled', k: 2 },
           { t: 'When a holiday important to them was forgotten', k: 3 },
           { t: 'When they were not helped although it was promised', k: 4 },
           { t: 'Coldness, when nobody comes near them', k: 5 } ] },

    { q: 'What does the teenager reproach others for — the other parent, friends, grandparents?',
      o: [ { t: '“They don’t value me, they never say anything good”', k: 1 },
           { t: '“They have no time for me”', k: 2 },
           { t: '“They didn’t give me anything even for my birthday”', k: 3 },
           { t: '“They don’t help at all”', k: 4 },
           { t: '“They are cold, they won’t even hug me”', k: 5 } ] },

    { q: 'After what does the teenager noticeably thaw?',
      o: [ { t: 'After sincere praise', k: 1 },
           { t: 'After an evening together without phones', k: 2 },
           { t: 'After an unexpected present', k: 3 },
           { t: 'When you did something important for them', k: 4 },
           { t: 'After hugs or a shoulder massage', k: 5 } ] },

    { q: 'What helps the teenager when they come home tired?',
      o: [ { t: 'A warm word: “how are you? I’m glad to see you”', k: 1 },
           { t: 'Sitting with you and talking', k: 2 },
           { t: 'Something tasty or nice bought for them', k: 3 },
           { t: 'When their tasks are already done: dinner ready, kit washed', k: 4 },
           { t: 'A hug, a stroke on the head', k: 5 } ] },

    { q: 'What does the teenager remember for years?',
      o: [ { t: 'Words said to them — both good and hurtful', k: 1 },
           { t: 'Trips and evenings spent together', k: 2 },
           { t: 'Presents — even from childhood', k: 3 },
           { t: 'Who helped them out and how', k: 4 },
           { t: 'Hugs in a hard moment', k: 5 } ] }
  ],

  tips: {
    1: {
      seen: 'The teenager hears love in words. They may pretend they do not care, but they remember praise — and mockery especially.',
      todo: [
        'Praise the effort, not only the result',
        'Send short messages during the day',
        'Talk about their strengths — in private and without pathos',
        'Thank them for small things'
      ],
      never: [
        'Mock them in front of friends',
        'Say “you always…” and “you never…”',
        'Compare them with brothers, sisters, classmates'
      ]
    },
    2: {
      seen: 'The teenager needs someone to really be with them — without lectures. A heart-to-heart does not happen on schedule, but when they are ready.',
      todo: [
        'Be there when they start a conversation themselves, even late in the evening',
        'Do together what they love: games, music, sport',
        'Drive them yourself — the car is a good place to talk',
        'Once a week — time just the two of you'
      ],
      never: [
        'Turn a conversation into a lecture',
        'Listen with half an ear',
        'Cancel promised time because of work'
      ]
    },
    3: {
      seen: 'For a teenager a present is a sign that they are known: what they love now, not at ten.',
      todo: [
        'Notice what they like now',
        'Give for no reason — something small but spot on',
        'Mark their achievements with a meaningful present',
        'Treasure what they gave you'
      ],
      never: [
        'Buy what you like rather than what they like',
        'Take away what was given as a punishment',
        'Give with a reproach: “for that kind of money…”'
      ]
    },
    4: {
      seen: 'The teenager feels love through help — especially when they do not have to ask for it and do not have to pay for it with reproaches.',
      todo: [
        'Help with things that are still beyond them — without lectures',
        'Drop them off and pick them up when it matters to them',
        'Learn new things together: cooking, fixing, driving',
        'Do what you promised on time'
      ],
      never: [
        'Help with a reproach: “here I am doing it for you again…”',
        'Do everything for them — they need independence',
        'Promise and forget'
      ]
    },
    5: {
      seen: 'The teenager still needs touch, but the “dialect” changes: hugs in public are awkward, at home they are welcome.',
      todo: [
        'Hug at home: in the morning, at bedtime, when meeting',
        'A pat on the shoulder, ruffling their hair, a high five',
        'A shoulder massage after a hard day',
        'Ask: “may I hug you?” — and respect the answer'
      ],
      never: [
        'Force hugs on them in front of friends',
        'Pull away when they come close themselves',
        'Punish with coldness'
      ]
    }
  },

  check: {
    title: 'Check by choice',
    text: 'With a teenager it works the same way as with a child, only the choices are more grown-up. Offer one pair a day and notice not only what they choose, but how their eyes light up.',
    pairs: [
      '“Shall I write you what I value in you — or shall we go to a café together?”',
      '“Shall I tell you what I am proud of — or buy that thing you talked about?”',
      '“Shall I write you a letter — or help with the project that is due?”',
      '“Shall I tell you warm words — or give you a shoulder massage?”',
      '“Shall we go to the cinema together — or shall I buy what you have had your eye on?”',
      '“Shall we spend the evening together — or shall I take over your household chore for a week?”',
      '“Shall we talk, just the two of us — or sit side by side watching a film?”',
      '“A present — or help with what is hard for you right now?”',
      '“A little present — or a hug before bed?”',
      '“Shall I drive you where you need to go — or give you a back massage?”'
    ]
  }
},

/* ---------- ADULT · husband or wife, mum, dad, relatives, friends · 17 questions ---------- */
adult: {
  label: 'Adult',
  hint: 'husband or wife, mum, dad, relatives, friends',
  questions: [
    { q: 'How does this person most often show you love or care?',
      o: [ { t: 'Says warm words, praises, thanks', k: 1 },
           { t: 'Invites you to spend time together, calls to talk', k: 2 },
           { t: 'Gives, brings, treats you', k: 3 },
           { t: 'Helps with deeds: fixes, drives, cooks', k: 4 },
           { t: 'Hugs, touches, takes your hand', k: 5 } ] },

    { q: 'How do they support you when things are hard?',
      o: [ { t: 'Finds the words, says “you will manage”', k: 1 },
           { t: 'Comes over just to be with you', k: 2 },
           { t: 'Brings something to cheer you up', k: 3 },
           { t: 'Takes on part of your tasks', k: 4 },
           { t: 'Hugs you', k: 5 } ] },

    { q: 'How do they make up after a quarrel?',
      o: [ { t: 'Says “sorry”, explains in words', k: 1 },
           { t: 'Suggests sitting down and talking', k: 2 },
           { t: 'Brings flowers, a present, something sweet', k: 3 },
           { t: 'Quietly does something for you', k: 4 },
           { t: 'Comes over and hugs you', k: 5 } ] },

    { q: 'How do they greet you after being apart?',
      o: [ { t: 'Says how much they missed you', k: 1 },
           { t: 'Sits down to talk at once, asks questions', k: 2 },
           { t: 'Brings out what they prepared or bought for you', k: 3 },
           { t: 'Sets the table, takes your bags', k: 4 },
           { t: 'Hugs you for a long time', k: 5 } ] },

    { q: 'How does this person show love to children or grandchildren?',
      o: [ { t: 'Praises, says tender words', k: 1 },
           { t: 'Spends time with them: plays, walks', k: 2 },
           { t: 'Showers them with presents and sweets', k: 3 },
           { t: 'Does things for them: drives, feeds, fixes', k: 4 },
           { t: 'Hugs, kisses, carries them', k: 5 } ] },

    { q: 'How do they behave with friends?',
      o: [ { t: 'Supports with words, congratulates beautifully', k: 1 },
           { t: 'Talks for hours, goes to visit', k: 2 },
           { t: 'Remembers holidays, gives presents', k: 3 },
           { t: 'Is the first to rush to help', k: 4 },
           { t: 'Hugs when meeting', k: 5 } ] },

    { q: 'How do they congratulate loved ones on a holiday?',
      o: [ { t: 'With a long warm greeting, a card', k: 1 },
           { t: 'Comes in person, spends the day together', k: 2 },
           { t: 'Chooses a present long and carefully', k: 3 },
           { t: 'Organises the celebration, takes on the fuss', k: 4 },
           { t: 'Hugs, kisses', k: 5 } ] },

    { q: 'What does this person ask for most often?',
      o: [ { t: '“Tell me, how was it?”, “Did you like it?”', k: 1 },
           { t: '“Be with me”, “Come over”', k: 2 },
           { t: '“Bring me…”, “Don’t forget about me”', k: 3 },
           { t: '“Help me with…”', k: 4 },
           { t: '“Hug me”, “Sit next to me”', k: 5 } ] },

    { q: 'What do they ask for when they are tired or ill?',
      o: [ { t: 'A kind word, support', k: 1 },
           { t: 'For someone to sit with them, not leave them alone', k: 2 },
           { t: 'Something tasty or nice', k: 3 },
           { t: 'For someone to do their tasks for them', k: 4 },
           { t: 'To be stroked, given a massage', k: 5 } ] },

    { q: 'What do they want for their birthday?',
      o: [ { t: 'Warm words and wishes from loved ones', k: 1 },
           { t: 'For everyone to gather and be together', k: 2 },
           { t: 'A good present chosen for them', k: 3 },
           { t: 'For everything to be organised so they do not have to fuss', k: 4 },
           { t: 'To be hugged, and lots of warmth', k: 5 } ] },

    { q: 'How do they behave when they want your attention?',
      o: [ { t: 'Fishes for praise: “so, how did I do?”', k: 1 },
           { t: 'Invites you somewhere together, sits next to you to talk', k: 2 },
           { t: 'Shows what they would like to receive', k: 3 },
           { t: 'Asks for help, even with a small thing', k: 4 },
           { t: 'Comes close, touches you', k: 5 } ] },

    { q: 'What does this person complain about or reproach you for most often?',
      o: [ { t: '“You never say a kind word”', k: 1 },
           { t: '“You never have time”, “You don’t come to see me”', k: 2 },
           { t: '“You didn’t even remember my holiday”', k: 3 },
           { t: '“It’s all on me, nobody will help”', k: 4 },
           { t: '“You won’t even hug me”', k: 5 } ] },

    { q: 'What hurts them most?',
      o: [ { t: 'Harsh words, criticism', k: 1 },
           { t: 'When they are not given time, when meetings are cancelled', k: 2 },
           { t: 'When important dates are forgotten', k: 3 },
           { t: 'When they were not helped although it was promised', k: 4 },
           { t: 'Coldness and distance', k: 5 } ] },

    { q: 'What do they complain about to others — friends, relatives — about their loved ones?',
      o: [ { t: '“I never hear a kind word”', k: 1 },
           { t: '“Nobody comes to see me, everyone is busy”', k: 2 },
           { t: '“They didn’t give me anything even on a holiday”', k: 3 },
           { t: '“Nobody will help, I do everything myself”', k: 4 },
           { t: '“Nobody will hug me”', k: 5 } ] },

    { q: 'What makes them light up most?',
      o: [ { t: 'Praise and thanks', k: 1 },
           { t: 'Time together', k: 2 },
           { t: 'A present chosen with heart', k: 3 },
           { t: 'When they were helped', k: 4 },
           { t: 'Hugs', k: 5 } ] },

    { q: 'What relieves their tension fastest?',
      o: [ { t: 'Words of support', k: 1 },
           { t: 'A calm talk, just the two of you', k: 2 },
           { t: 'A little surprise', k: 3 },
           { t: 'When someone took over their tasks', k: 4 },
           { t: 'Hugs, a massage', k: 5 } ] },

    { q: 'What do they remember for years?',
      o: [ { t: 'Words said to them — both good and hurtful', k: 1 },
           { t: 'Meetings, trips, evenings together', k: 2 },
           { t: 'Presents: who gave what', k: 3 },
           { t: 'Who helped in a hard moment and how', k: 4 },
           { t: 'Hugs at an important moment', k: 5 } ] }
  ],

  tips: {
    1: {
      seen: 'This person hears love. Until warm words are said, it is hard for them to believe they are valued, and a harsh phrase wounds deeper than it seems from the outside.',
      todo: [
        'Thank them specifically — for what exactly',
        'Say out loud “I love you”, “I am proud of you”',
        'Praise them in front of others — family, friends',
        'Send messages for no reason'
      ],
      never: [
        'Criticise them in front of strangers',
        'Reply “it goes without saying” when they ask to hear it out loud',
        'Punish with silence'
      ]
    },
    2: {
      seen: 'This person needs your undivided attention. Time given only to them is love for them.',
      todo: [
        'Put the phone away when you talk',
        'Visit and call regularly, not only on business',
        'Do together what they love',
        'Keep promises about meeting'
      ],
      never: [
        'Cancel meetings at the last moment',
        'Listen with half an ear',
        'Say “we will talk later” — and never come back to it'
      ]
    },
    3: {
      seen: 'For this person a present is a visible sign that someone thought of them. The price does not matter: what matters is that it was chosen especially for them.',
      todo: [
        'Remember holidays and important dates',
        'Bring a small thing back from trips',
        'Give for no reason: a flower, favourite sweets',
        'Notice what they mentioned in passing'
      ],
      never: [
        'Forget birthdays and anniversaries',
        'Give presents “just to tick a box”',
        'Speak dismissively of their presents'
      ]
    },
    4: {
      seen: 'This person feels love through deeds. For them “I did it for you” weighs more than “I love you”.',
      todo: [
        'Take on part of their tasks without being asked',
        'Do what you promised on time',
        'Ask: “how can I help you this week?”',
        'Help with what is physically hard for them'
      ],
      never: [
        'Promise and not do',
        'Help with a reproach',
        'Leave them alone with heavy tasks'
      ]
    },
    5: {
      seen: 'This person feels love through touch. Hugs calm them faster than any words, and distance reads as coldness.',
      todo: [
        'Hug when meeting and saying goodbye',
        'Take their hand, touch their shoulder',
        'Sit next to them, not across from them',
        'A hand and shoulder massage — especially for elderly parents'
      ],
      never: [
        'Pull away during a quarrel',
        'Withhold hugs as a punishment',
        'Touch carelessly, in passing — warmth is what matters'
      ]
    }
  },

  check: {
    title: 'Check by conversation',
    text: 'Chapman suggests asking directly: “On a scale from 0 to 10 — how much do you feel my love right now? What can I do to make it more?” The answer almost always names the language. Then try speaking that language every day for 30 days — not when inspired, but on schedule.',
    pairs: []
  }
}

}

};
