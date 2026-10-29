import './style.css';
import { lessons } from './lessons.js';
import { runLesson } from './runner.js';

const REPO = 'https://github.com/kunkun-11/tiny-source-lab';
const KEY = 'tiny-source-lab:v1';
const app = document.querySelector('#app');
let storageAvailable = true;
let saved;
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { storageAvailable = false; saved = {}; }
const data = {
  lang: saved?.lang === 'zh' ? 'zh' : 'en',
  drafts: saved?.drafts && typeof saved.drafts === 'object' ? saved.drafts : {},
  predictions: saved?.predictions && typeof saved.predictions === 'object' ? saved.predictions : {},
  assisted: saved?.assisted && typeof saved.assisted === 'object' ? saved.assisted : {},
  complete: saved?.complete && typeof saved.complete === 'object' ? saved.complete : {},
};
let selected = lessons.find(l => l.id === location.hash.slice(1)) || lessons[0];
let result = null;
let running = false;
let controller = null;
let hintCount = 0;
let notice = '';
let persistenceTimer;

const words = {
  en: {
    tagline: 'Break tiny code. Understand big ideas.', curriculum: 'THE LAB BENCH',
    practice: 'Three small libraries. Three big ideas.', lab: 'LAB', completed: 'completed',
    idle: 'Ready to explore', independently: 'Solved independently', guided: 'Explored with a reference',
    saved: 'Your code stays in this browser.', memory: 'Progress stays in this tab.', clear: 'Clear progress',
    clearConfirm: 'Clear all saved code, predictions, and progress? This cannot be undone.',
    community: 'Built for the curious.', communityText: 'A small experiment you can finish, explain, and build on.',
    star: 'Star on GitHub', github: 'GitHub', share: 'Copy lesson link', copied: 'Lesson link copied.',
    copyFailed: 'Copy this lesson link: ', language: 'Switch to Chinese',
    predictLabel: '01 · PREDICT', predictTitle: 'Before you touch the code', predictHelp: 'Choose what you think the starter will do. Then run it and compare.',
    predictionRequired: 'Choose a prediction first, then run the checks.', predictionCorrect: 'Your prediction matches the starter behavior.',
    predictionWrong: 'A useful surprise: compare your prediction with the starter behavior.',
    editLabel: '02 · EXPERIMENT', file: 'exercise.js', editor: 'Editable JavaScript source code',
    editHelp: 'Edit the source, then check its behavior. Tab stays a navigation key; use Ctrl+Enter or ⌘+Enter to run.',
    run: 'Run checks', running: 'Running…', reset: 'Reset', resetTitle: 'Reset to starter code',
    resetConfirm: 'Restore the starter code for this lesson? Your changes and this lesson’s completion will be cleared.',
    reference: 'Reference', referenceTitle: 'Reveal reference solution',
    referenceConfirm: 'Reveal the reference solution? This lesson will be marked as guided when checks pass.',
    referenceNotice: 'Reference loaded. Run the checks to explore why it works.',
    starterNotice: 'Starter restored. Make a prediction and try again.',
    checkLabel: '03 · OBSERVE', checkTitle: 'Behavior checks', checkSubtitle: 'We test what your code does, not how you spell the fix.',
    noChecks: 'Make a prediction, then run the starter.', noChecksHelp: 'A failing check is the start of the experiment. Change the code and try again.',
    passed: 'passed', failed: 'failed', allPassed: 'All behaviors checked.', someFailed: 'Something worth investigating.',
    independentDone: 'You repaired this lab independently.', guidedDone: 'You explored the reference. Reset to try solving it yourself.',
    timeline: 'Execution trace', timelineEmpty: 'The trace will come from your running code.',
    hintLabel: 'A NUDGE, NOT A SPOILER', hintTitle: 'Need a new angle?', hint: 'Reveal a hint', moreHint: 'Next hint', noMoreHint: 'All hints revealed',
    explainLabel: 'THE IDEA TO TAKE WITH YOU', explain: 'Why this matters',
    source: 'Inspired by open source', sourceLink: 'Read upstream source ↗', sourceHelp: 'The broken starter is a teaching exercise, not an upstream bug.',
    foot: 'No account. No API key. Just you and a little code.', lessons: 'Lessons', progress: 'Lesson progress',
    codeChanged: 'Code changed. Run again to check this version.', cancelled: 'Run cancelled.',
    loading: 'Checking your implementation…', runnerError: 'The experiment could not finish.',
    mini: 'FREE · BROWSER-BASED · OPEN SOURCE', minutes: 'min',
  },
  zh: {
    tagline: '改一小段代码，懂一个大原理。', curriculum: '源码实验台',
    practice: '三个小型库，三个关键机制。', lab: '实验', completed: '已完成',
    idle: '等待探索', independently: '独立解决', guided: '已参考答案',
    saved: '代码与进度保存在此浏览器。', memory: '进度仅保存在当前标签页。', clear: '清除进度',
    clearConfirm: '清除全部代码、预测和学习进度？此操作无法撤销。',
    community: '为好奇心而造。', communityText: '一个能做完、讲明白，还能继续扩展的小实验。',
    star: '在 GitHub 点 Star', github: 'GitHub', share: '复制课程链接', copied: '课程链接已复制。',
    copyFailed: '请复制此课程链接：', language: '切换为英文',
    predictLabel: '01 · 先预测', predictTitle: '动手改之前，猜一猜', predictHelp: '选择你认为初始代码会产生的结果，再运行验证。',
    predictionRequired: '先选一个预测结果，再运行检查。', predictionCorrect: '你的预测与初始代码的行为一致。',
    predictionWrong: '这个意外很有用：对比你的预测与初始代码的行为。',
    editLabel: '02 · 动手实验', file: 'exercise.js', editor: '可编辑的 JavaScript 源码',
    editHelp: '修改源码，再验证行为。Tab 保留为导航键；按 Ctrl+Enter 或 ⌘+Enter 运行。',
    run: '运行检查', running: '运行中…', reset: '重置', resetTitle: '恢复初始代码',
    resetConfirm: '恢复本课的初始代码？你的修改和本课完成状态将被清除。',
    reference: '参考答案', referenceTitle: '显示参考解答',
    referenceConfirm: '显示参考答案？检查通过后，本课将标记为「已参考答案」。',
    referenceNotice: '参考代码已载入。运行检查，观察它为什么有效。',
    starterNotice: '初始代码已恢复。先预测，再尝试。',
    checkLabel: '03 · 看结果', checkTitle: '行为检查', checkSubtitle: '验证代码做了什么，接受不同的正确实现。',
    noChecks: '先选一个预测，再运行初始代码。', noChecksHelp: '检查失败是实验的开始。修改代码，再试一次。',
    passed: '通过', failed: '失败', allPassed: '全部行为检查通过。', someFailed: '发现了值得研究的行为。',
    independentDone: '你独立修复了这个实验。', guidedDone: '你已探索参考解答。重置后，可以尝试独立解决。',
    timeline: '执行轨迹', timelineEmpty: '运行后，这里会显示你的代码产生的轨迹。',
    hintLabel: '一点提示，留一点探索', hintTitle: '换个角度看看？', hint: '显示一个提示', moreHint: '下一个提示', noMoreHint: '已显示全部提示',
    explainLabel: '带走一个原理', explain: '为什么这很重要',
    source: '从开源中获得灵感', sourceLink: '阅读上游源码 ↗', sourceHelp: '带错误的初始代码是教学实验，不代表上游项目有这个问题。',
    foot: '无需账号，无需 API Key，打开就能动手。', lessons: '课程', progress: '课程进度',
    codeChanged: '代码已修改，请重新运行检查。', cancelled: '运行已取消。',
    loading: '正在检查你的实现…', runnerError: '实验未能完成。',
    mini: '免费 · 浏览器实验 · 开源', minutes: '分钟',
  },
};
const w = key => words[data.lang][key] || words.en[key] || key;
const l = value => typeof value === 'string' ? value : value?.[data.lang] || value?.en || '';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls = '') => {
  const paths = {
    code: '<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    play: '<path d="m9 5 11 7-11 7z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    reset: '<path d="M4 4v6h6M4 10a8 8 0 1 1 0 5"/>',
    link: '<path d="m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -1)"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    hint: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2"/>',
    external: '<path d="M14 4h6v6m0-6-9 9M10 4H4v16h16v-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.circle}</svg>`;
};

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { storageAvailable = false; }
}
function currentCode() { return typeof data.drafts[selected.id] === 'string' ? data.drafts[selected.id] : selected.starter; }
function completionLabel(id) { return data.complete[id] === 'independent' ? w('independently') : data.complete[id] === 'guided' ? w('guided') : w('idle'); }
function sourceLink() {
  try { const url = new URL(selected.source?.url); return url.protocol === 'https:' ? url.href : REPO; } catch { return REPO; }
}
function render() {
  document.documentElement.lang = data.lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${l(selected.name)} · Tiny Source Lab`;
  const count = lessons.filter(lesson => data.complete[lesson.id]).length;
  const n = String(lessons.indexOf(selected) + 1).padStart(2, '0');
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#${esc(selected.id)}" aria-label="Tiny Source Lab">${icon('code')}<span>Tiny Source <strong>Lab</strong><span class="brand-dot"></span></span></a>
      <span class="topbar-tagline">${w('tagline')}</span>
      <div class="topbar-actions"><button class="language-button" id="language" aria-label="${w('language')}">${data.lang === 'en' ? '中文' : 'EN'}<span class="toggle-track">↔</span></button><a class="github-top" href="${REPO}" target="_blank" rel="noreferrer">${w('github')} ${icon('external')}</a></div>
    </header>
    <div class="workspace">
      <aside class="sidebar" aria-label="${w('lessons')}">
        <div class="sidebar-heading"><span class="eyebrow">${w('curriculum')}</span><span class="count">03</span></div>
        <p class="sidebar-intro">${w('practice')}</p>
        <nav class="lesson-list">${lessons.map((lesson, index) => `
          <a href="#${esc(lesson.id)}" class="lesson-card ${lesson.id === selected.id ? 'active' : ''}" ${lesson.id === selected.id ? 'aria-current="page"' : ''} data-lesson="${esc(lesson.id)}">
            <div class="lesson-card-top"><span class="lesson-number">${w('lab')} ${String(index + 1).padStart(2, '0')}</span><span class="lesson-complete ${data.complete[lesson.id] ? 'done' : ''}" title="${completionLabel(lesson.id)}">${icon(data.complete[lesson.id] ? 'check' : 'circle')}</span></div>
            <h2>${esc(l(lesson.name))}</h2><p>${esc(l(lesson.tag))}</p><span class="lesson-time">${esc(data.lang === 'zh' ? lesson.duration.replace('min', '分钟') : lesson.duration)} <span>·</span> JavaScript</span>
          </a>`).join('')}</nav>
        <div class="progress-block"><div class="progress-top"><span>${w('progress')}</span><strong>${count}<span> / ${lessons.length}</span></strong></div><div class="progress-track" role="progressbar" aria-label="${w('progress')}" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="${lessons.length}"><span style="width:${count / lessons.length * 100}%"></span></div><p>${storageAvailable ? w('saved') : w('memory')}</p><button class="text-button clear-progress" id="clear-progress">${w('clear')}</button></div>
        <div class="sidebar-note"><span class="note-orbit">✳</span><h3>${w('community')}</h3><p>${w('communityText')}</p><a href="${REPO}" target="_blank" rel="noreferrer">${w('star')} ${icon('arrow')}</a></div>
      </aside>
      <main class="main-content" id="main-content">
        <div class="lesson-heading"><div><div class="eyebrow lesson-eyebrow"><span class="live-dot"></span>${w('lab')} ${n}<span class="slash">/</span>${esc(l(selected.tag))}</div><h1>${esc(l(selected.title))}</h1><p class="lesson-intro">${esc(l(selected.intro))}</p></div><button id="share" class="icon-button" aria-label="${w('share')}" title="${w('share')}">${icon('link')}</button></div>
        <div class="notice" id="notice" role="status" aria-live="polite">${esc(notice)}</div>
        <section class="prediction-panel panel" aria-labelledby="prediction-title">
          <div class="section-intro"><span class="eyebrow">${w('predictLabel')}</span><h2 id="prediction-title">${w('predictTitle')}</h2><p>${w('predictHelp')}</p></div>
          <fieldset class="prediction-fieldset"><legend>${esc(l(selected.question))}</legend><div class="prediction-options">${selected.prediction.options.map((option, index) => `<label class="prediction-option ${data.predictions[selected.id] === option.id ? 'chosen' : ''}"><input type="radio" name="prediction" value="${esc(option.id)}" ${data.predictions[selected.id] === option.id ? 'checked' : ''}/><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${esc(l(option.label))}</span></label>`).join('')}</div></fieldset>
          ${result ? `<div class="prediction-feedback">${icon(data.predictions[selected.id] === selected.prediction.answer ? 'check' : 'hint')}<p><strong>${data.predictions[selected.id] === selected.prediction.answer ? w('predictionCorrect') : w('predictionWrong')}</strong><span>${esc(l(selected.prediction.explanation))}</span></p></div>` : ''}
        </section>
        <div class="experiment-grid">
          <section class="editor-panel panel" aria-labelledby="editor-title"><div class="panel-top"><div><span class="eyebrow">${w('editLabel')}</span><h2 id="editor-title">${w('file')}</h2></div><div class="editor-actions"><button class="small-button" id="reset" title="${w('resetTitle')}">${icon('reset')}<span>${w('reset')}</span></button><button class="small-button reference-button" id="reference" title="${w('referenceTitle')}">${w('reference')}</button></div></div>
            <div class="editor-wrap"><div class="line-numbers" id="line-numbers" aria-hidden="true"></div><textarea id="source-code" aria-label="${w('editor')}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off">${esc(currentCode())}</textarea></div>
            <div class="editor-footer"><span>${icon('code')} JavaScript <span class="editor-source">· ${esc(selected.entry)}</span></span><button id="run-checks" class="primary-button" ${running ? 'disabled' : ''}>${icon('play')}<span>${running ? w('running') : w('run')}</span><kbd>⌘ / Ctrl ↵</kbd></button></div><p class="editor-help">${w('editHelp')}</p>
          </section>
          <section class="checks-panel panel" aria-labelledby="checks-title"><div class="panel-top"><div><span class="eyebrow">${w('checkLabel')}</span><h2 id="checks-title">${w('checkTitle')}</h2></div><span class="checks-count">${result?.results?.filter(r => r.passed).length || 0}<span> / ${selected.tests.length}</span></span></div><p class="checks-subtitle">${w('checkSubtitle')}</p><div id="check-output" aria-live="polite">${checksMarkup()}</div><div class="trace"><h3>${w('timeline')}<span class="trace-dot"></span></h3>${traceMarkup()}</div></section>
        </div>
        <div class="learning-grid"><section class="hint-panel panel" aria-labelledby="hint-title"><div class="hint-icon">${icon('hint')}</div><div class="hint-content"><span class="eyebrow">${w('hintLabel')}</span><h2 id="hint-title">${w('hintTitle')}</h2><div id="hints">${selected.hints.slice(0, hintCount).map((hint, i) => `<p class="hint-item"><span>${i + 1}</span>${esc(l(hint))}</p>`).join('')}</div><button id="hint" class="hint-button" ${hintCount >= selected.hints.length ? 'disabled' : ''}>${hintCount >= selected.hints.length ? w('noMoreHint') : hintCount ? w('moreHint') : w('hint')}${icon('arrow')}</button></div></section>
        <section class="concept-panel panel" aria-labelledby="concept-title"><span class="eyebrow">${w('explainLabel')}</span><h2 id="concept-title">${w('explain')}</h2><p>${esc(l(result?.results?.length && result.results.every(r => r.passed) ? selected.explanation : selected.concept))}</p></section></div>
        <div class="source-attribution"><div>${icon('code')}<span><strong>${w('source')}: ${esc(selected.source.name)}</strong><span>${esc(selected.source.version)} · ${esc(selected.source.license)} · ${esc(l(selected.source.detail))}</span></span></div><a href="${esc(sourceLink())}" target="_blank" rel="noreferrer">${w('sourceLink')}</a><p>${w('sourceHelp')}</p></div>
        <footer class="page-footer"><span>${w('foot')}</span><span>${w('mini')}</span></footer>
      </main>
    </div>`;
  bind();
  updateLineNumbers();
}

function checksMarkup() {
  if (running) return `<div class="empty-checks running-state"><span class="loader"></span><h3>${w('loading')}</h3></div>`;
  if (!result) return `<div class="empty-checks"><span class="empty-check-icon">${icon('play')}</span><h3>${w('noChecks')}</h3><p>${w('noChecksHelp')}</p></div>`;
  const total = result.results || [];
  const all = total.length === selected.tests.length && total.every(r => r.passed) && !result.error;
  return `${result.error ? `<div class="run-error">${icon('close')}<p><strong>${w('runnerError')}</strong><span>${esc(result.error)}</span></p></div>` : ''}<div class="check-summary ${all ? 'success' : 'needs-work'}">${icon(all ? 'check' : 'hint')}<div><strong>${all ? w('allPassed') : w('someFailed')}</strong>${all ? `<span>${data.assisted[selected.id] ? w('guidedDone') : w('independentDone')}</span>` : ''}</div></div><ul class="check-list">${selected.tests.map(test => {
    const r = total.find(item => item.id === test.id);
    return `<li class="check-row ${r ? r.passed ? 'passed' : 'failed' : 'pending'}">${icon(r ? r.passed ? 'check' : 'close' : 'circle')}<div><span>${esc(l(test.title))}</span>${r?.error ? `<code>${esc(r.error)}</code>` : ''}</div><span class="check-status">${r ? r.passed ? w('passed') : w('failed') : '—'}</span></li>`;
  }).join('')}</ul>`;
}

function traceMarkup() {
  const steps = result?.demo?.steps;
  if (!Array.isArray(steps) || !steps.length) return `<p class="trace-empty">${w('timelineEmpty')}</p>`;
  return `<ol class="trace-list">${steps.map((step, i) => `<li class="trace-step ${['good', 'bad'].includes(step.tone) ? step.tone : 'neutral'}"><span class="trace-index">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(l(step.label))}</strong><span>${esc(l(step.detail))}</span></div></li>`).join('')}</ol>`;
}

function updateLineNumbers() {
  const editor = document.querySelector('#source-code');
  const numbers = document.querySelector('#line-numbers');
  if (!editor || !numbers) return;
  numbers.innerHTML = editor.value.split('\n').map((_, i) => `<span class="${selected.focusLines?.includes(i + 1) ? 'focus-line' : ''}">${i + 1}</span>`).join('');
  numbers.scrollTop = editor.scrollTop;
}

function showNotice(message) {
  notice = message;
  const element = document.querySelector('#notice');
  if (element) element.textContent = message;
}

function abort() {
  controller?.abort();
  controller = null;
  running = false;
}

async function run() {
  if (running) return;
  if (!selected.prediction.options.some(option => option.id === data.predictions[selected.id])) {
    showNotice(w('predictionRequired'));
    document.querySelector('.prediction-fieldset input')?.focus();
    return;
  }
  const lesson = selected;
  const code = document.querySelector('#source-code').value;
  data.drafts[lesson.id] = code;
  persist();
  notice = '';
  running = true;
  result = null;
  controller = new AbortController();
  const runController = controller;
  const scrollY = window.scrollY;
  render();
  window.scrollTo(0, scrollY);
  try {
    const response = await runLesson(code, lesson, { signal: runController.signal });
    if (runController.signal.aborted || selected.id !== lesson.id) return;
    result = response || { results: [], error: 'No result returned.' };
    if (result.results?.length === lesson.tests.length && result.results.every(r => r.passed) && !result.error) data.complete[lesson.id] = data.assisted[lesson.id] ? 'guided' : 'independent';
    else delete data.complete[lesson.id];
    persist();
  } catch (error) {
    if (runController.signal.aborted || selected.id !== lesson.id) return;
    result = { results: [], error: error?.message || String(error) };
  } finally {
    if (controller === runController) {
      running = false;
      controller = null;
      const currentScroll = window.scrollY;
      render();
      window.scrollTo(0, currentScroll);
      document.querySelector('#run-checks')?.focus({ preventScroll: true });
    }
  }
}

function bind() {
  document.querySelector('#language').addEventListener('click', () => { data.lang = data.lang === 'en' ? 'zh' : 'en'; notice = ''; persist(); render(); document.querySelector('#language')?.focus({ preventScroll: true }); });
  document.querySelector('#share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); showNotice(w('copied')); } catch { showNotice(w('copyFailed') + location.href); }
  });
  document.querySelector('#run-checks').addEventListener('click', run);
  document.querySelector('#source-code').addEventListener('input', event => {
    abort();
    data.drafts[selected.id] = event.target.value;
    delete data.complete[selected.id];
    result = null;
    updateLineNumbers();
    showNotice(w('codeChanged'));
    clearTimeout(persistenceTimer);
    persistenceTimer = setTimeout(persist, 250);
    document.querySelector('#check-output').innerHTML = checksMarkup();
    document.querySelector('.checks-count').innerHTML = `0<span> / ${selected.tests.length}</span>`;
    document.querySelector('.concept-panel > p').textContent = l(selected.concept);
    document.querySelector('.trace').innerHTML = `<h3>${w('timeline')}<span class="trace-dot"></span></h3>${traceMarkup()}`;
    document.querySelector('#run-checks').disabled = false;
    document.querySelector('#run-checks span').textContent = w('run');
    document.querySelector('.prediction-feedback')?.remove();
    const count = lessons.filter(lesson => data.complete[lesson.id]).length;
    document.querySelector('.progress-top strong').innerHTML = `${count}<span> / ${lessons.length}</span>`;
    const progress = document.querySelector('.progress-track');
    progress.setAttribute('aria-valuenow', count);
    progress.firstElementChild.style.width = `${count / lessons.length * 100}%`;
    const badge = document.querySelector(`[data-lesson="${selected.id}"] .lesson-complete`);
    badge.classList.remove('done'); badge.title = w('idle'); badge.innerHTML = icon('circle');
  });
  document.querySelector('#source-code').addEventListener('scroll', event => { document.querySelector('#line-numbers').scrollTop = event.target.scrollTop; });
  document.querySelector('#source-code').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); } });
  document.querySelectorAll('input[name="prediction"]').forEach(input => input.addEventListener('change', event => {
    data.predictions[selected.id] = event.target.value; persist();
    document.querySelectorAll('.prediction-option').forEach(label => label.classList.toggle('chosen', label.querySelector('input').checked));
    const feedback = document.querySelector('.prediction-feedback');
    if (feedback) feedback.innerHTML = `${icon(data.predictions[selected.id] === selected.prediction.answer ? 'check' : 'hint')}<p><strong>${data.predictions[selected.id] === selected.prediction.answer ? w('predictionCorrect') : w('predictionWrong')}</strong><span>${esc(l(selected.prediction.explanation))}</span></p>`;
    showNotice('');
  }));
  document.querySelector('#reset').addEventListener('click', () => {
    if (!window.confirm(w('resetConfirm'))) return;
    abort(); delete data.drafts[selected.id]; delete data.assisted[selected.id]; delete data.complete[selected.id]; delete data.predictions[selected.id];
    result = null; hintCount = 0; notice = w('starterNotice'); persist(); render();
  });
  document.querySelector('#reference').addEventListener('click', () => {
    if (!window.confirm(w('referenceConfirm'))) return;
    abort(); data.drafts[selected.id] = selected.solution; data.assisted[selected.id] = true; delete data.complete[selected.id]; result = null; notice = w('referenceNotice'); persist(); render();
  });
  document.querySelector('#hint').addEventListener('click', () => { hintCount = Math.min(hintCount + 1, selected.hints.length); const y = window.scrollY; render(); window.scrollTo(0, y); if (hintCount < selected.hints.length) document.querySelector('#hint')?.focus({ preventScroll: true }); });
  document.querySelector('#clear-progress').addEventListener('click', () => {
    if (!window.confirm(w('clearConfirm'))) return;
    abort(); data.drafts = {}; data.predictions = {}; data.assisted = {}; data.complete = {}; result = null; hintCount = 0; notice = ''; persist(); render();
  });
}

window.addEventListener('hashchange', () => {
  const next = lessons.find(lesson => lesson.id === location.hash.slice(1));
  if (!next || next.id === selected.id) return;
  abort(); persist(); selected = next; result = null; hintCount = 0; notice = ''; render();
  if (window.innerWidth < 900) document.querySelector('#main-content').scrollIntoView({ behavior: 'smooth' });
});
window.addEventListener('beforeunload', persist);
if (location.hash !== `#${selected.id}`) history.replaceState(null, '', `#${selected.id}`);
render();
