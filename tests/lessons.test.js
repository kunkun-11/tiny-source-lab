import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/lessons.js';
import { executeLesson, lessonPayload } from '../src/harness.js';

for (const lesson of lessons) {
  test(`${lesson.id}: reference meets the documented behavior contract`, async () => {
    const outcome = await executeLesson(lessonPayload(lesson.solution, lesson));
    assert.equal(outcome.error, undefined);
    assert.equal(outcome.results.length, lesson.tests.length);
    assert.deepEqual(outcome.results.filter((result) => !result.passed), []);
    assert.ok(outcome.demo.steps.length > 0, 'Must demonstrate actual runtime behavior');
  });
  test(`${lesson.id}: starter exposes the teaching defect`, async () => {
    const outcome = await executeLesson(lessonPayload(lesson.starter, lesson));
    assert.equal(outcome.error, undefined, 'The starter should compile');
    assert.ok(outcome.results.some((result) => !result.passed), 'A deliberately incorrect starter must fail');
    assert.ok(outcome.results.some((result) => result.passed), 'A starter should retain useful working behavior');
  });
  test(`${lesson.id}: invalid source produces actionable feedback`, async () => {
    const outcome = await executeLesson(lessonPayload('function {', lesson));
    assert.match(outcome.error, /SyntaxError/);
    assert.deepEqual(outcome.results, []);
  });
  test(`${lesson.id}: bilingual course metadata and pinned source are complete`, () => {
    assert.match(lesson.entry, /^[A-Za-z_$][\w$]*$/);
    assert.ok(lesson.tests.length >= 5);
    for (const field of ['name', 'title', 'intro', 'concept', 'explanation']) {
      assert.ok(lesson[field].en.trim());
      assert.ok(lesson[field].zh.trim());
    }
    assert.ok(lesson.prediction.options.some((option) => option.id === lesson.prediction.answer));
    assert.match(lesson.source.url, /^https:\/\/github\.com\//);
    assert.ok(lesson.hints.length >= 2);
  });
}

test('emitter: reverse traversal changes the promised order', async () => {
  const lesson = lessons.find((item) => item.id === 'emitter');
  // A tempting repair reverses live iteration. That avoids self-removal skips but changes order.
  const bad = `function createEmitter() {
    const all = new Map();
    return { all,
      on(type, fn) { const list = all.get(type) || []; list.push(fn); all.set(type, list); },
      off(type, fn) { const list = all.get(type) || []; if (!fn) all.set(type, []); else { const i=list.indexOf(fn); if (i>=0) list.splice(i,1); } },
      emit(type, value) { for (const fn of [...(all.get(type)||[])].reverse()) fn(value); for (const fn of [...(all.get('*')||[])].reverse()) fn(type,value); }
    };
  }`;
  const outcome = await executeLesson(lessonPayload(bad, lesson));
  assert.ok(outcome.results.some((result) => !result.passed));
});

test('store: structural equality violates reference identity', async () => {
  const lesson = lessons.find((item) => item.id === 'store');
  const bad = lesson.solution.replace('Object.is(next, previous)', 'JSON.stringify(next) === JSON.stringify(previous)');
  const outcome = await executeLesson(lessonPayload(bad, lesson));
  assert.ok(outcome.results.some((result) => !result.passed));
});

test('store: caching after callback corrupts a reentrant previous value', async () => {
  const lesson = lessons.find((item) => item.id === 'store');
  const bad = lesson.solution.replace('sub.selected = next;\n        sub.listener(next, previous);', 'sub.listener(next, previous);\n        sub.selected = next;');
  assert.notEqual(bad, lesson.solution);
  const outcome = await executeLesson(lessonPayload(bad, lesson));
  assert.ok(outcome.results.some((result) => !result.passed));
});

test('concurrency: releasing before settlement breaks the concurrency bound', async () => {
  const lesson = lessons.find((item) => item.id === 'concurrency');
  const bad = lesson.solution.replace('Promise.resolve().then(job.task)', 'active -= 1;\n      Promise.resolve().then(job.task)').replace('          active -= 1;\n          drain();', '          drain();');
  assert.notEqual(bad, lesson.solution);
  const outcome = await executeLesson(lessonPayload(bad, lesson));
  assert.ok(outcome.results.some((result) => !result.passed));
});
