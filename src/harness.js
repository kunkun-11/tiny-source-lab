// Kept self-contained so the same behavior checks run in Node and an isolated worker.
export async function executeLesson(payload) {
  const format = (value) => {
    try { return JSON.stringify(value) ?? String(value); }
    catch { return String(value); }
  };
  const same = (a, b) => {
    if (Object.is(a, b)) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) =>
      Object.prototype.hasOwnProperty.call(b, key) && same(a[key], b[key]));
  };
  const helpers = {
    equal(actual, expected, message = 'Values differ') {
      if (!same(actual, expected)) throw new Error(`${message}\nExpected: ${format(expected)}\nReceived: ${format(actual)}`);
    },
    assert(condition, message = 'Assertion failed') {
      if (!condition) throw new Error(message);
    },
    delay(ms = 0) { return new Promise((resolve) => setTimeout(resolve, ms)); },
  };
  const timed = async (fn) => {
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(fn),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Check timed out: a task may never settle.')), 600); }),
      ]);
    } finally { clearTimeout(timer); }
  };
  const compile = () => {
    if (!/^[A-Za-z_$][\w$]*$/.test(payload.entry)) throw new Error('Invalid exercise entry.');
    if (typeof payload.code !== 'string' || payload.code.length > 100000) throw new Error('Source exceeds the 100,000 character limit.');
    const create = new Function(`"use strict";\n${payload.code}\n;return ${payload.entry};`)();
    if (typeof create !== 'function') throw new Error(`Define a function named ${payload.entry}.`);
    return create;
  };
  try { compile(); }
  catch (error) { return { results: [], demo: { steps: [] }, error: `${error.name}: ${error.message}` }; }
  const results = [];
  for (const test of payload.tests) {
    try {
      const check = new Function(`return (${test.run});`)();
      await timed(() => check(compile(), helpers));
      results.push({ id: test.id, passed: true });
    } catch (error) {
      results.push({ id: test.id, passed: false, error: String(error?.message || error) });
    }
  }
  let demo = { steps: [] };
  try {
    const show = new Function(`return (${payload.demo});`)();
    demo = await timed(() => show(compile(), helpers));
    if (!Array.isArray(demo?.steps)) demo = { steps: [] };
  } catch (error) {
    demo = { steps: [{ label: 'Experiment stopped', detail: String(error?.message || error), tone: 'bad' }] };
  }
  return { results, demo };
}

export function lessonPayload(code, lesson) {
  return {
    code, entry: lesson.entry,
    tests: lesson.tests.map((test) => ({ id: test.id, run: test.run.toString() })),
    demo: lesson.demo.toString(),
  };
}
