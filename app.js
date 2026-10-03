/* quiz logic and page rendering. you shouldn't need to edit this to change content. */
window.Quiz = window.Quiz || {};

/* ===== validate ===== */
/* checks the data files for mistakes and logs problems to the console.
   turn off with validateOnLoad: false in config.js */

Quiz.validate = function () {
  const problems = [];
  const { axes, questions, types } = Quiz;

  // 3 questions per axis
  axes.forEach((ax, i) => {
    const n = questions.filter(q => q.axis === i).length;
    if (n !== 3) problems.push("axis " + i + " (" + ax.names.join("/") + ") has " + n + " questions, expected 3");
  });

  questions.forEach((q, i) => {
    if (!axes[q.axis]) problems.push("question " + (i + 1) + " points to a missing axis");
    if (q.first !== "a" && q.first !== "b") problems.push("question " + (i + 1) + ": first must be 'a' or 'b'");
  });

  // every possible code needs a type
  let codes = [""];
  axes.forEach(ax => { codes = codes.flatMap(c => ax.pair.map(l => c + l)); });
  codes.forEach(c => {
    const t = types[c];
    if (!t) { problems.push("missing type " + c); return; }
    if (!t.name) problems.push(c + " has no name");
    if (!Array.isArray(t.sections) || !t.sections.length) problems.push(c + " has no sections");
  });
  Object.keys(types).forEach(k => { if (!codes.includes(k)) problems.push("type " + k + " does not match any code"); });

  if (problems.length) console.warn("quiz data problems:\n- " + problems.join("\n- "));
  return problems;
};

/* ===== scoring ===== */
/* pure scoring logic, no dom. */

Quiz.scoring = {
  // tally[axis] = [votes for first letter, votes for second letter]
  tally(questions, answers, axes) {
    const t = axes.map(() => [0, 0]);
    questions.forEach((q, i) => {
      const picked = answers[i];
      if (!picked) return;
      t[q.axis][picked === q.first ? 0 : 1]++;
    });
    return t;
  },

  // majority wins each axis. with 3 questions per axis there are no ties.
  code(tally, axes) {
    return tally.map((pair, i) => axes[i].pair[pair[0] >= pair[1] ? 0 : 1]).join("");
  },

  // which side (0 or 1) a code leans on a given axis
  side(code, axes, i) {
    return code[i] === axes[i].pair[0] ? 0 : 1;
  }
};

/* ===== storage ===== */
/* remembers the last result. wrapped in try/catch because storage can be blocked. */

Quiz.storage = {
  key: "quiz-last-result",
  save(code) { try { localStorage.setItem(this.key, code); } catch (e) {} },
  load() { try { return localStorage.getItem(this.key); } catch (e) { return null; } },
  clear() { try { localStorage.removeItem(this.key); } catch (e) {} }
};

/* ===== router ===== */
/* tiny hash router so results can be shared: yoursite.github.io/#VBRI */

Quiz.router = {
  get() { return location.hash.replace("#", "").toUpperCase(); },
  // history.replaceState throws in sandboxed iframes, so fail quietly
  set(code) {
    try { history.replaceState(null, "", code ? "#" + code : location.pathname + location.search); } catch (e) {}
  }
};

/* ===== ui ===== */
/* all dom work lives here. it only renders what it is given. */

Quiz.ui = (function () {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // set an image src; the image hides itself if the file doesn't exist
  function setImage(img, src) {
    if (!img) return;
    if (!img.dataset.bound) {
      img.addEventListener("error", () => { img.style.display = "none"; });
      img.addEventListener("load", () => { img.style.display = ""; });
      img.dataset.bound = "1";
    }
    if (!src) { img.style.display = "none"; return; }
    img.src = src;
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
    $(id).classList.add("on");
    window.scrollTo({ top: 0 });
  }

  function renderStart(cfg, axes, hasLast) {
    $("title").innerHTML = "";
    cfg.siteTitle.split("\n").forEach((line, i) => {
      if (i) $("title").appendChild(document.createElement("br"));
      $("title").appendChild(document.createTextNode(line));
    });
    $("intro").textContent = cfg.intro;
    document.title = cfg.siteTitle.replace(/\n/g, " ");
    setImage($("logo"), cfg.logo);
    setImage($("hero"), cfg.hero);

    const box = $("axes-preview");
    box.innerHTML = "";
    axes.forEach(ax => box.appendChild(el("span", "", ax.names.join(" / "))));
    $("last").hidden = !hasLast;
  }

  function renderQuestion(q, index, total, picked, onChoose) {
    $("qtext").textContent = q.text;
    $("count").textContent = (index + 1) + "/" + total;
    $("fill").style.width = (index / total * 100) + "%";
    $("back").disabled = index === 0;

    const box = $("opts");
    box.innerHTML = "";
    ["a", "b"].forEach(k => {
      const b = el("button", "opt" + (picked === k ? " picked" : ""), q[k]);
      b.onclick = () => onChoose(k);
      box.appendChild(b);
    });
  }

  function fillProgress() { $("fill").style.width = "100%"; }

  // one card per section. body can be a string or array, items makes a list.
  function renderSections(sections) {
    const box = $("sections");
    box.innerHTML = "";
    (sections || []).forEach(s => {
      const card = el("div", "card");
      card.appendChild(el("h2", "", s.title || ""));
      const paras = Array.isArray(s.body) ? s.body : (s.body ? [s.body] : []);
      paras.forEach(p => card.appendChild(el("p", "", p)));
      if (s.items && s.items.length) {
        const ul = el("ul");
        s.items.forEach(i => ul.appendChild(el("li", "", i)));
        card.appendChild(ul);
      }
      if (s.image) {
        const img = el("img");
        img.alt = "";
        setImage(img, s.image);
        card.appendChild(img);
      }
      box.appendChild(card);
    });
  }

  function renderMeters(code, tally, axes, side) {
    const box = $("meters");
    box.innerHTML = "";
    $("meters-card").hidden = !tally;
    if (!tally) return;
    axes.forEach((ax, i) => {
      const s = side(code, axes, i);
      const n = tally[i][s];
      const row = el("div", "meter");

      const top = el("div", "lbl");
      top.appendChild(el("b", "", ax.names[s]));
      top.appendChild(el("span", "", n + " of 3"));

      const track = el("div", "track");
      const fill = el("div", "fill");
      fill.style.width = (n / 3 * 100) + "%";
      fill.style[s === 0 ? "left" : "right"] = "0";
      track.appendChild(fill);

      const ends = el("div", "lbl ends");
      ends.appendChild(el("span", "", ax.names[0]));
      ends.appendChild(el("span", "", ax.names[1]));

      row.append(top, track, ends);
      box.appendChild(row);
    });
  }

  function renderResult(code, type, imageSrc, tally, axes, side) {
    $("code").textContent = code.split("").join(" ");
    $("name").textContent = type.name;
    $("tag").textContent = type.tag || "";
    $("result").style.setProperty("--accent", type.accent || "");
    setImage($("typeimg"), imageSrc);
    renderSections(type.sections);
    renderMeters(code, tally, axes, side);
    $("toast").textContent = "";
    show("result");
  }

  function renderGrid(types, onPick) {
    const g = $("grid");
    g.innerHTML = "";
    Object.keys(types).forEach(code => {
      const a = el("a");
      a.href = "#" + code;
      a.appendChild(el("small", "", code));
      a.appendChild(document.createTextNode(types[code].name));
      a.onclick = (e) => { e.preventDefault(); onPick(code); };
      g.appendChild(a);
    });
  }

  function toast(msg) {
    $("toast").textContent = msg;
    setTimeout(() => { $("toast").textContent = ""; }, 2500);
  }

  return { $, show, renderStart, renderQuestion, fillProgress, renderResult, renderGrid, toast };
})();

/* ===== app ===== */
/* wires data, scoring, and ui together. */
(function () {
  const { config, axes, questions, types, scoring, ui, router, storage } = Quiz;
  const $ = ui.$;

  let current = 0;
  let answers = new Array(questions.length).fill(null);

  function typeImage(code) {
    const t = types[code];
    return (t && t.image) || config.typeImageDir + code.toLowerCase() + config.typeImageExt;
  }

  function showResult(code, tally) {
    const t = types[code];
    if (!t) return showStart();
    ui.renderResult(code, t, typeImage(code), tally, axes, scoring.side);
  }

  function showStart() {
    const last = config.saveLastResult ? storage.load() : null;
    ui.renderStart(config, axes, !!(last && types[last]));
    ui.show("start");
  }

  function startQuiz() {
    current = 0;
    answers.fill(null);
    ui.show("quiz");
    draw();
  }

  function draw() {
    ui.renderQuestion(questions[current], current, questions.length, answers[current], choose);
  }

  function choose(k) {
    answers[current] = k;
    if (current < questions.length - 1) { current++; draw(); return; }
    ui.fillProgress();
    const tally = scoring.tally(questions, answers, axes);
    const code = scoring.code(tally, axes);
    router.set(code);
    if (config.saveLastResult) storage.save(code);
    showResult(code, tally);
  }

  $("go").onclick = startQuiz;
  $("back").onclick = () => { if (current > 0) { current--; draw(); } };
  $("retake").onclick = () => { router.set(""); showStart(); };
  $("last").onclick = () => { const c = storage.load(); router.set(c); showResult(c, null); };
  $("copy").onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); ui.toast("link copied"); }
    catch (e) { ui.toast("copy it from the address bar"); }
  };

  ui.renderGrid(types, (code) => { router.set(code); showResult(code, null); });
  if (config.validateOnLoad) Quiz.validate();

  // open a shared link like /#VBRI straight to that result
  const hash = router.get();
  if (types[hash]) showResult(hash, null); else showStart();
})();

