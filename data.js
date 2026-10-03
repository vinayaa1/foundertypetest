/* all editable content lives here: settings, traits, questions, and the 16 types. */
window.Quiz = window.Quiz || {};

/* ===== config ===== */
/* site-wide settings and asset paths.
   every path is relative to index.html. a missing image just hides itself. */

Quiz.config = {
  siteTitle: "how do you\nactually work",
  intro: "twelve quick questions, four traits, sixteen types. no right answers, just go with your gut.",

  // start screen art
  logo: "assets/logo.png",
  hero: "assets/hero.png",

  // result art: assets/types/vbri.png, assets/types/dpcs.png, ...
  // a type can override this with its own "image" field in js/data/types.js
  typeImageDir: "assets/types/",
  typeImageExt: ".png",

  // remember the last result in this browser
  saveLastResult: true,

  // logs data problems (missing types, uneven questions) to the browser console
  validateOnLoad: true
};

/* ===== axes ===== */
/* the four traits. each has two letters and two display names.
   the type code is built in this order: V/D  B/P  R/C  I/S */

Quiz.axes = [
  { pair: ["V", "D"], names: ["visionary", "data-driven"] },
  { pair: ["B", "P"], names: ["builder", "planner"] },
  { pair: ["R", "C"], names: ["risk-taker", "calculator"] },
  { pair: ["I", "S"], names: ["independent", "social"] }
];

/* ===== questions ===== */
/* 12 questions, 3 per axis (axis = index in axes.js).
   "first" says which answer scores the axis' first letter:
   first: "a" means answer a leans toward the first letter.
   flip it on some questions so the same side isn't always "a". */

Quiz.questions = [
  { axis: 0, text: "you're handed a blank page and a free week. you start with...",
    a: "a wild idea of what it could become", b: "research on what's already working", first: "a" },
  { axis: 2, text: "a big opportunity shows up with a short deadline. you...",
    a: "say yes and figure out the rest on the way", b: "ask for time to weigh the downsides", first: "a" },
  { axis: 1, text: "a new project kicks off. your first move is to...",
    a: "make something rough so there's something real to look at", b: "map out the steps before touching anything", first: "a" },
  { axis: 3, text: "you're stuck on a hard problem. you would rather...",
    a: "go off alone and think it through", b: "grab someone and talk it out", first: "a" },

  { axis: 0, text: "when you're deciding between two options, what wins?",
    a: "the numbers, even if the other one feels better", b: "the one that feels like it points somewhere bigger", first: "b" },
  { axis: 1, text: "your ideal workspace right now is...",
    a: "a calendar, a checklist, and a clear order of things", b: "a messy desk with half-finished experiments", first: "b" },
  { axis: 2, text: "the safe path and the long shot are both open. you pick...",
    a: "the path where you know what could go wrong", b: "the long shot, because the upside is worth it", first: "b" },
  { axis: 3, text: "the best kind of work day is one where you...",
    a: "barely talk to anyone and get a lot done", b: "bounce between people and ideas all day", first: "a" },

  { axis: 0, text: "people usually come to you for...",
    a: "a fresh angle nobody else saw", b: "the facts and the evidence behind it", first: "a" },
  { axis: 1, text: "halfway through, the plan stops working. you...",
    a: "tear it up and build something that does work", b: "switch to the backup plan you kept ready", first: "a" },
  { axis: 2, text: "you've got savings and a risky idea. you...",
    a: "put a chunk in and see what happens", b: "test it small first and scale only if it holds up", first: "a" },
  { axis: 3, text: "when something goes well, you most want to...",
    a: "enjoy it quietly and move to the next thing", b: "celebrate with the people who helped", first: "a" }
];

/* ===== types ===== */
/* all 16 types. the key is the four-letter code (V/D, B/P, R/C, I/S).

   each type supports:
     name      display name
     tag       one-line italic tagline under the name
     sections  any number of cards on the result page. each card has a title and either
                 body:  a string, or an array of strings (one paragraph each)
                 items: an array of strings (shown as a bullet list)
                 image: optional path to a picture shown inside the card
     image     (optional) custom result image. default is assets/types/<code>.png
     accent    (optional) a hex color that tints this type's code and meters, e.g. "#6aa6d1"

   to add a new section, copy any { title, body } line and edit it. */

Quiz.types = {
  VBRI: { name: "the prototype", tag: "makes the strange thing real, alone, at 2am.",
    sections: [
      { title: "the short version", body: "you have an idea, you build a rough version of it right away, and you ship before it feels ready. you trust your own judgment and mostly want to be left alone to make it." },
      { title: "at your best", body: "fast, original, and not scared of looking silly. you turn vague ideas into something people can touch." },
      { title: "watch out for", body: "you can skip the feedback that would make it better, and leave a trail of half-finished projects." }
    ] },
  VBRS: { name: "the ringleader", tag: "pulls a crowd into the idea and gets going.",
    sections: [
      { title: "the short version", body: "you see where things could go, start building, and bring everyone along for the ride. momentum is your favorite thing." },
      { title: "at your best", body: "contagious energy. people join your projects because you make them feel like something is happening." },
      { title: "watch out for", body: "enthusiasm can cover for gaps in the plan. check that the team actually knows what they signed up for." }
    ] },
  VBCI: { name: "the tinkerer", tag: "small bets, big imagination, no audience needed.",
    sections: [
      { title: "the short version", body: "you build to explore, but you do it carefully. you try an idea in a corner of your life before you commit the rest of it." },
      { title: "at your best", body: "inventive without being reckless. you find strange solutions and test them before they cost much." },
      { title: "watch out for", body: "testing can turn into endless tinkering. pick a point where the experiment becomes the real thing." }
    ] },
  VBCS: { name: "the workshop host", tag: "builds things with people, one careful step at a time.",
    sections: [
      { title: "the short version", body: "you like making things in good company. you steer the group toward ideas that are exciting but safe enough to try." },
      { title: "at your best", body: "you make it easy for others to contribute, and you keep the wild ideas grounded." },
      { title: "watch out for", body: "you might wait for consensus when someone just needs to make the call." }
    ] },
  VPRI: { name: "the long shot", tag: "has a plan nobody else believes in yet.",
    sections: [
      { title: "the short version", body: "you carry a big picture, plan the route to it, and take the leap without needing permission. you'd rather be early and alone than on time and crowded." },
      { title: "at your best", body: "conviction and follow-through. you can hold a vision for a long time and still work out the steps." },
      { title: "watch out for", body: "being sure can make you hard to advise. ask one person who disagrees with you." }
    ] },
  VPRS: { name: "the pitch", tag: "paints the picture, then makes the room want in.",
    sections: [
      { title: "the short version", body: "you plan big, bet big, and talk people into the future you see. you work best when you can say it out loud to someone." },
      { title: "at your best", body: "persuasive and organized. you get buy-in and you have a roadmap to back it up." },
      { title: "watch out for", body: "the story can run ahead of the evidence. leave room for someone to poke holes." }
    ] },
  VPCI: { name: "the cartographer", tag: "draws the whole map before taking a step.",
    sections: [
      { title: "the short version", body: "you think long term, plan carefully, and weigh the risks quietly on your own. when you finally move, it's usually well-aimed." },
      { title: "at your best", body: "foresight. you spot problems early and design around them." },
      { title: "watch out for", body: "the map is not the territory. at some point you have to walk it." }
    ] },
  VPCS: { name: "the compass", tag: "keeps the group pointed somewhere good.",
    sections: [
      { title: "the short version", body: "you want a future worth working toward and a plan that keeps everyone safe on the way there. people look to you for direction." },
      { title: "at your best", body: "steady and thoughtful. you balance ambition with care for the people involved." },
      { title: "watch out for", body: "being the calm one can mean you hold back your own bold ideas." }
    ] },

  DBRI: { name: "the experimenter", tag: "runs the test, reads the result, goes again.",
    sections: [
      { title: "the short version", body: "you build quickly, let the data tell you whether it worked, and take real risks because you trust your measuring. mostly you do this by yourself." },
      { title: "at your best", body: "quick learning loops. you're comfortable being wrong in public because you'll know why." },
      { title: "watch out for", body: "not everything worth doing shows up in a metric. sometimes the number is late." }
    ] },
  DBRS: { name: "the operator", tag: "gets the team moving and checks the dashboard.",
    sections: [
      { title: "the short version", body: "you like clear numbers, fast action, and a team that's in the room with you. you'd rather try it than discuss it." },
      { title: "at your best", body: "decisive and grounded. you turn goals into action and keep track of what's working." },
      { title: "watch out for", body: "speed can outrun people. check in on how the team is actually doing." }
    ] },
  DBCI: { name: "the mechanic", tag: "quietly fixes what's actually broken.",
    sections: [
      { title: "the short version", body: "you dig into how things work, build the fix, and double check it. you'd rather deliver something solid than something flashy." },
      { title: "at your best", body: "reliable, precise, and hard to rattle. your work holds up." },
      { title: "watch out for", body: "you might not mention what you've done. let people see it." }
    ] },
  DBCS: { name: "the foreman", tag: "keeps the crew safe and the work on track.",
    sections: [
      { title: "the short version", body: "you like building things with a team, using evidence, and avoiding avoidable mistakes. people trust you with the important parts." },
      { title: "at your best", body: "dependable and fair. you make the whole group's work better." },
      { title: "watch out for", body: "caution can turn into saying no too often. save some room for the unproven idea." }
    ] },
  DPRI: { name: "the sharp", tag: "does the math, then makes the unpopular move.",
    sections: [
      { title: "the short version", body: "you plan with data and then commit hard when the numbers say go, even if nobody else sees it yet. you decide on your own." },
      { title: "at your best", body: "clear-eyed and brave. you take risks that are actually calculated." },
      { title: "watch out for", body: "you can be right and still need to bring people with you." }
    ] },
  DPRS: { name: "the dealmaker", tag: "reads the room and the spreadsheet.",
    sections: [
      { title: "the short version", body: "you plan thoroughly, you're not afraid to move big, and you work well with people while you do it. negotiating comes naturally." },
      { title: "at your best", body: "strategic and personable. you see both the numbers and the people behind them." },
      { title: "watch out for", body: "winning every round isn't the point. leave something on the table sometimes." }
    ] },
  DPCI: { name: "the ledger", tag: "knows exactly where everything stands.",
    sections: [
      { title: "the short version", body: "you plan with care, check the evidence twice, and prefer to think it through on your own. very little surprises you." },
      { title: "at your best", body: "thorough, accurate, and calm under pressure. you catch what others miss." },
      { title: "watch out for", body: "perfect information doesn't exist. make the call at ninety percent." }
    ] },
  DPCS: { name: "the anchor", tag: "the reason the whole thing doesn't drift away.",
    sections: [
      { title: "the short version", body: "you like clear plans, solid evidence, and a team you can count on. you make things steady, and people feel it." },
      { title: "at your best", body: "grounded and generous. you make good decisions that last." },
      { title: "watch out for", body: "stability is great until it becomes the only goal. try one new thing a year." }
    ] }
};

