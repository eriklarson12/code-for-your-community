/* =====================================================================
   Bits of Good section: the interactive parts
   - "Run" on the code window in "What Bits of Good does": steps through
     the project timeline and prints each step in the console under the
     code. Text: SITE.bogRun (js/content.js)
   - "Which role fits you?" quiz under the Roles list. Questions, roles,
     openings and apply links: SITE.roleQuiz (js/content.js)
   ===================================================================== */
(function () {
  'use strict';

  const SITE = window.SITE || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const behavior = reduceMotion ? 'auto' : 'smooth';

  /* Builds an element: h('p', { class: 'x', text: 'Hi' }, child, ...) */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'onclick') el.addEventListener('click', v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  /* Scrolls so an element sits a little above the middle of the screen. */
  function scrollToEl(el, at) {
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * at, behavior });
  }

  /* ---------------- Run: step through a project ---------------- */
  function setupRun() {
    const R = SITE.bogRun, win = $('.code-window');
    if (!R || !win) return;
    const btn = $('.code-window__run', win), con = $('.code-window__console', win);
    if (!btn || !con) return;
    const log = $('.run__log', con);
    const lines = $$('.l[data-line]', win);
    const ICON = {
      play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>',
      stop: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5h7v7h-7z"/></svg>',
    };
    let runId = 0, timers = [], running = false;

    function setButton(state) {
      const label = state === 'stop' ? 'Stop' : state === 'again' ? 'Run again' : 'Run';
      btn.innerHTML = (state === 'stop' ? ICON.stop : ICON.play) + '<span>' + label + '</span>';
      btn.classList.toggle('is-running', state === 'stop');
    }
    function mark(line, state) {
      for (const l of lines) {
        if (l.dataset.line !== line) continue;
        l.classList.toggle('is-current', state === 'current');
        l.classList.toggle('is-done', state === 'done');
      }
    }
    // The console has a fixed height and scrolls itself to the newest line,
    // so the page never moves while the run plays.
    function print(kind, tag, text) {
      const row = h('div', { class: 'run__line' + (kind ? ' run__line--' + kind : '') },
        tag != null ? h('span', { class: 'run__tag', text: tag }) : null,
        h('span', { class: 'run__text', text }));
      log.append(row);
      con.scrollTop = con.scrollHeight;
      return row;
    }
    function wait(ms) {
      return new Promise(res => timers.push(setTimeout(res, ms)));
    }

    async function run() {
      const id = ++runId, live = () => id === runId;
      timers.forEach(clearTimeout); timers = [];
      running = true; setButton('stop');
      log.textContent = '';
      lines.forEach(l => l.classList.remove('is-current', 'is-done'));
      print('note', null, R.intro);
      print('cmd', null, '$ node project.js');
      await wait(600); if (!live()) return;

      for (const s of R.steps) {
        mark(s.line, 'current');
        if (s.sprints) {
          for (let k = 1; k <= s.sprints; k++) {
            const row = print(null, s.tag + ' ' + k, s.text);
            await wait(700); if (!live()) return;
            row.lastChild.append(h('span', { class: 'run__check', text: '  ✓' }));
          }
          if (s.after) print(null, '', s.after);
          await wait(900); if (!live()) return;
        } else {
          print(null, s.tag, s.text);
          await wait(1200); if (!live()) return;
        }
        mark(s.line, 'done');
      }

      print('ok', null, '✓ ' + R.done);
      const next = h('button', { type: 'button', class: 'run__next', onclick: goToQuiz }, R.next + ' ↓');
      log.append(h('div', { class: 'run__line run__line--plain' }, next));
      con.scrollTop = con.scrollHeight;
      running = false; setButton('again');
    }

    function stop() {
      runId++;
      timers.forEach(clearTimeout); timers = [];
      running = false;
      lines.forEach(l => l.classList.remove('is-current'));
      print('stop', null, '^C  stopped');
      setButton('again');
    }

    btn.addEventListener('click', () => (running ? stop() : run()));
    setButton('run');
  }

  function goToQuiz() {
    const box = $('#role-quiz');
    if (!box) return;
    scrollToEl(box, 0.36);
    const target = $('.quiz__q, .quiz__role', box);
    if (target) target.focus({ preventScroll: true });
  }

  /* ---------------- "Which role fits you?" quiz ---------------- */
  function setupQuiz() {
    const Q = SITE.roleQuiz, wrap = $('#role-quiz');
    const box = wrap && $('.quiz', wrap);
    if (!Q || !box) return;
    const deadline = Date.parse(Q.deadline);
    const roundOpen = () => !(deadline < Date.now());
    let history = [];

    // A result takes the color of its track in the Roles list (Learn, Build
    // or Connect). Questions use the default Bits of Good orange from the CSS.
    function setColor(family) {
      const d = family && roleEl(family), t = d && d.closest('.track');
      const c = t ? getComputedStyle(t).getPropertyValue('--tc').trim() : '';
      if (c) {
        box.style.setProperty('--qc', c);
        box.style.setProperty('--qt', 'color-mix(in srgb, ' + c + ' 85%, #000)');
      } else {
        box.style.removeProperty('--qc');
        box.style.removeProperty('--qt');
      }
    }
    function render(nodes, focusEl, focus) {
      box.replaceChildren(...nodes.filter(Boolean));
      if (focus) focusEl.focus({ preventScroll: true });
    }
    const back = () => h('button', { type: 'button', class: 'quiz__link', text: '← Back', onclick: () => askQuestion(history.pop(), true) });
    const restart = () => { history = []; askQuestion(Q.start, true); };

    function askQuestion(id, focus) {
      const node = Q.questions[id];
      if (!node) return;
      setColor(null);
      const head = h('h4', { class: 'quiz__q', tabindex: '-1', text: node.q });
      const opts = h('div', { class: 'quiz__opts' }, node.options.map(o =>
        h('button', { type: 'button', class: 'quiz__opt', text: o.text, onclick: () => {
          history.push(id);
          if (o.role) showResult(o.role, true); else askQuestion(o.next, true);
        } })));
      render([
        h('p', { class: 'quiz__step', text: '// question ' + (history.length + 1) }),
        head, opts,
        history.length ? h('div', { class: 'quiz__nav' }, back()) : null,
      ], head, focus);
    }

    // The role in the Roles list above, by the name on its button (summary).
    const roleEl = family => $$('.role').find(d => { const s = $('summary', d); return s && s.textContent.trim() === family; });
    function trackOf(family) {
      const d = roleEl(family), t = d && d.closest('.track'), title = t && $('.track__title', t);
      return title ? title.textContent.trim() : '';
    }
    function showRole(family) {
      const d = roleEl(family);
      if (!d) return;
      d.open = true;
      const sum = $('summary', d);
      scrollToEl(sum, 0.42);
      d.classList.remove('is-flash'); void d.offsetWidth; d.classList.add('is-flash');
      sum.focus({ preventScroll: true });
    }

    function showResult(id, focus) {
      const r = Q.roles[id];
      if (!r) return;
      const open = !!r.apply && roundOpen();
      const track = trackOf(r.family);
      setColor(r.family);
      const head = h('h4', { class: 'quiz__role', tabindex: '-1', text: r.name });
      const reopen = 'Some roles re-open at the start of the next semester (' + Q.cite + ').';
      const newTab = () => h('span', { class: 'sr-only', text: ' (opens in a new tab)' });
      const status = open
        ? h('p', { class: 'quiz__status' }, h('b', { text: 'Open now. ' }),
            'Applications for ' + Q.round + ' close ' + Q.deadlineText + '.')
        : h('p', { class: 'quiz__status is-closed' }, h('b', { text: 'Not open right now. ' }),
            (r.apply ? 'Applications for ' + Q.round + ' closed on ' + Q.deadlineText + '. ' : 'Bits of Good isn’t taking applications for this role this round. ') + reopen);
      const apply = open
        ? h('a', { class: 'btn btn--primary', href: r.apply, target: '_blank', rel: 'noopener' },
            r.apply === Q.joinPage ? 'Apply on the join page' : 'Apply for this role', newTab())
        : h('a', { class: 'btn', href: Q.joinPage, target: '_blank', rel: 'noopener' }, 'Check the join page', newTab());
      render([
        h('p', { class: 'quiz__step', text: '// your best fit' }),
        head,
        h('p', { class: 'quiz__family', text: (track ? track + ' track · ' : '') + r.family }),
        h('p', { class: 'quiz__about', text: r.about }),
        h('p', { class: 'quiz__quote', text: 'In Bits of Good’s words: “' + r.tagline + '” (' + Q.cite + ').' }),
        status,
        h('div', { class: 'quiz__actions' }, apply,
          h('button', { type: 'button', class: 'quiz__link', text: 'See this role above', onclick: () => showRole(r.family) }),
          back(),
          h('button', { type: 'button', class: 'quiz__link', text: 'Start over', onclick: restart })),
      ], head, focus);
    }

    askQuestion(Q.start, false);
  }

  setupRun();
  setupQuiz();
})();
