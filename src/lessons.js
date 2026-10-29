// Intentionally broken teaching variants; see THIRD_PARTY_NOTICES.md.
const t = (en, zh) => ({ en, zh });
const test = (id, en, zh, run) => ({ id, title: t(en, zh), run });

const emitterStarter = `// Adapted from mitt 3.0.1; MIT, Copyright (c) 2021 Jason Miller.
// Teaching change: dispatch lists are intentionally not copied.
function createEmitter() {
  const all = new Map();
  return {
    all,
    on(type, handler) {
      const handlers = all.get(type);
      if (handlers) handlers.push(handler);
      else all.set(type, [handler]);
    },
    off(type, handler) {
      const handlers = all.get(type);
      if (!handlers) return;
      if (handler) handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      else all.set(type, []);
    },
    emit(type, payload) {
      const handlers = all.get(type);
      if (handlers) handlers.forEach(fn => fn(payload));
      const wildcards = all.get('*');
      if (wildcards) wildcards.forEach(fn => fn(type, payload));
    }
  };
}`;
const emitterSolution = emitterStarter
  .replace('// Teaching change: dispatch lists are intentionally not copied.',
    '// Each dispatch snapshots its listeners, as in the pinned source.')
  .replace('handlers.forEach(fn', 'handlers.slice().forEach(fn')
  .replace('wildcards.forEach(fn', 'wildcards.slice().forEach(fn');

const concurrencyStarter = `// Independently written, simplified concurrency exercise.
function createLimit(concurrency) {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new TypeError('Use a positive integer concurrency');
  }
  const queue = [];
  let active = 0;
  function drain() {
    while (active < concurrency && queue.length) {
      const job = queue.shift();
      active += 1;
      Promise.resolve().then(job.task).then(
        value => {
          job.resolve(value);
          active -= 1;
          drain();
        },
        error => {
          job.reject(error);
          // A rejected job never releases its slot.
        }
      );
    }
  }
  return task => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    drain();
  });
}`;
const concurrencySolution = `// Independently written, simplified concurrency exercise.
function createLimit(concurrency) {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new TypeError('Use a positive integer concurrency');
  }
  const queue = [];
  let active = 0;
  function drain() {
    while (active < concurrency && queue.length) {
      const job = queue.shift();
      active += 1;
      Promise.resolve().then(job.task)
        .then(job.resolve, job.reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  }
  return task => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    drain();
  });
}`;

const storeStarter = `// Independently written, simplified selector subscription exercise.
function createStore(initial) {
  let state = initial;
  const subscriptions = new Set();
  return {
    getState() { return state; },
    setState(patch) {
      const update = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...update };
      for (const sub of [...subscriptions]) {
        const next = sub.selector(state);
        const previous = sub.selected;
        // Even an unchanged selection notifies its listener.
        sub.selected = next;
        sub.listener(next, previous);
      }
    },
    subscribe(selector, listener) {
      const sub = { selector, listener, selected: selector(state) };
      subscriptions.add(sub);
      return () => subscriptions.delete(sub);
    }
  };
}`;
const storeSolution = storeStarter.replace(
  '// Even an unchanged selection notifies its listener.',
  'if (Object.is(next, previous)) continue;'
);

export const lessons = [
  {
    id: 'emitter',
    name: t('The vanishing listener', '消失的监听器'),
    title: t('One listener leaves. Why does another disappear?', '一个监听器退出，另一个为什么也不执行了？'),
    tag: t('EVENT EMITTER', '事件派发'), duration: '8 min', difficulty: 'Starter', entry: 'createEmitter',
    intro: t('A removes itself during an event dispatch. Keep the current round predictable while letting subscriptions change.', 'A 在事件派发过程中取消自己的订阅。请让本轮派发保持可预测，同时允许订阅关系发生变化。'),
    question: t('In the starter, A and B are registered in that order. A removes itself when called. Who receives this first event?', '初始代码按 A、B 的顺序注册监听器。A 被调用时取消自己。本轮事件会交给谁？'),
    concept: t('An active dispatch uses a snapshot. Removing a listener affects the next round, not the recipients already chosen. Typed listeners run before wildcard listeners, each with its own snapshot.', '正在进行的派发使用订阅快照。取消订阅影响下一轮，不应抹掉本轮已选中的接收者。普通监听器先执行，通配监听器后执行，两组分别取快照。'),
    explanation: t('Removing A shifts B to index 0. The original array traversal advances to index 1, so B is skipped. Copying each list decouples traversal from live subscriptions. mitt already does this: the missing snapshots are introduced here for teaching. Other implementations are welcome if they preserve the tested behavior. Manually emitting an event named "*" is outside this exercise, as in mitt’s documented contract.', '移除 A 后，B 移到索引 0；原数组的遍历继续访问索引 1，于是跳过 B。复制每组列表，就能把遍历与实时订阅分开。mitt 本来就这样做，缺失快照是本课故意引入的教学改写。只要保留所测行为，也可以采用其他实现。与 mitt 的约定一样，本课不支持手动派发名为 "*" 的事件。'),
    starter: emitterStarter, solution: emitterSolution, focusLines: [20, 22],
    hints: [
      t('Draw the array before and after A removes itself. Which index is visited next?', '画出 A 取消自己前后的数组。遍历下一步会访问哪个索引？'),
      t('The live subscription list and this round’s recipient list need not be the same array.', '实时订阅列表与本轮接收者列表不必是同一个数组。'),
      t('Make a shallow snapshot before iterating. Apply the same rule to wildcard listeners.', '遍历前创建浅拷贝快照。通配监听器列表也需要同样处理。')
    ],
    prediction: {
      options: [
        { id: 'only-a', label: t('Only A', '只有 A') },
        { id: 'both', label: t('A, then B', '先 A，再 B') },
        { id: 'none', label: t('Neither listener', '两个都不执行') }
      ],
      answer: 'only-a',
      explanation: t('B shifts into an index that has already been visited. The repaired behavior should be A, then B.', 'B 移到了已经访问过的位置。修复后，本轮应先执行 A，再执行 B。')
    },
    source: {
      name: 'mitt', url: 'https://github.com/developit/mitt/blob/b240473b5707857ba2c6a8e6d707c28d1e39da49/src/index.ts',
      version: '3.0.1 · b240473', license: 'MIT', kind: 'adapted',
      detail: t('JavaScript teaching adaptation of pinned TypeScript source. The missing snapshots are introduced here, not upstream bugs. Types and documentation were shortened; forEach replaces map for traversal.', '基于固定版本 TypeScript 源码改写的 JavaScript 教学实验。快照缺失是本课故意引入的，不是上游缺陷。精简了类型与文档，并以 forEach 代替 map 遍历。')
    },
    tests: [
      test('payload', 'Dispatch in registration order with the payload', '按注册顺序传递事件数据', function (create, { equal }) {
        const bus = create(); const seen = [];
        bus.on('tick', value => seen.push(['A', value]));
        bus.on('tick', value => seen.push(['B', value]));
        bus.emit('tick', 7);
        equal(seen, [['A', 7], ['B', 7]], 'Both recipients receive the payload in order');
      }),
      test('self-removal', 'Self-removal keeps this round intact', '自行取消订阅不破坏本轮派发', function (create, { equal }) {
        const bus = create(); const seen = [];
        const a = () => { seen.push('A'); bus.off('tick', a); };
        bus.on('tick', a); bus.on('tick', () => seen.push('B'));
        bus.emit('tick');
        equal(seen, ['A', 'B'], 'Removing A must not skip B in this round');
        seen.length = 0; bus.emit('tick');
        equal(seen, ['B'], 'A should be absent next round');
      }),
      test('peer-removal', 'Removing a peer takes effect next round', '取消其他监听器在下一轮生效', function (create, { equal }) {
        const bus = create(); const seen = [];
        const b = () => seen.push('B');
        bus.on('tick', () => { seen.push('A'); bus.off('tick', b); });
        bus.on('tick', b); bus.emit('tick');
        equal(seen, ['A', 'B'], 'B was a recipient when dispatch began');
        seen.length = 0; bus.emit('tick');
        equal(seen, ['A'], 'B must be removed from later dispatches');
      }),
      test('late-subscription', 'A newly added listener waits', '派发中新增的监听器等待下一轮', function (create, { equal }) {
        const bus = create(); const seen = []; let added = false;
        bus.on('tick', () => { seen.push('A'); if (!added) { added = true; bus.on('tick', () => seen.push('B')); } });
        bus.emit('tick'); equal(seen, ['A'], 'A newly added typed listener waits until next dispatch');
        seen.length = 0; bus.emit('tick'); equal(seen, ['A', 'B'], 'The new listener runs next round');
      }),
      test('unknown-removal', 'Removing an unknown listener is harmless', '取消未知监听器不误删其他订阅', function (create, { equal }) {
        const bus = create(); const seen = [];
        bus.on('tick', () => seen.push('A')); bus.on('tick', () => seen.push('B'));
        bus.off('tick', () => {}); bus.off('unknown', () => {}); bus.emit('tick');
        equal(seen, ['A', 'B'], 'An absent listener must not remove the last item');
      }),
      test('wildcards', 'Wildcard listeners also use a snapshot', '通配监听器也使用快照', function (create, { equal }) {
        const bus = create(); const seen = [];
        const first = (type, value) => { seen.push(['W1', type, value]); bus.off('*', first); };
        bus.on('tick', value => seen.push(['typed', value]));
        bus.on('*', first); bus.on('*', (type, value) => seen.push(['W2', type, value]));
        bus.emit('tick', 3);
        equal(seen, [['typed', 3], ['W1', 'tick', 3], ['W2', 'tick', 3]], 'Typed listeners run before both wildcard recipients');
      }),
      test('clear-and-symbol', 'Clear a type while keeping wildcard listeners', '清空一个事件类型，保留通配订阅', function (create, { equal, assert }) {
        const bus = create(); const type = Symbol('tick'); let typed = 0; const seen = [];
        bus.on(type, () => typed++);
        bus.on('*', (name, value) => { assert(name === type, 'Preserve the symbol event identity'); seen.push(value); });
        bus.off(type); bus.emit(type, 'payload');
        equal(typed, 0, 'Omitting the handler clears that type');
        equal(seen, ['payload'], 'Wildcard listeners stay subscribed');
      })
    ],
    demo: function (create) {
      const bus = create(); const calls = [];
      const a = () => { calls.push('A'); bus.off('tick', a); };
      bus.on('tick', a); bus.on('tick', () => calls.push('B'));
      bus.emit('tick'); const first = calls.slice(); calls.length = 0;
      bus.emit('tick'); const second = calls.slice();
      return { steps: [
        { label: { en: 'Subscribe', zh: '注册订阅' }, detail: { en: 'A and B listen to tick, in that order.', zh: 'A、B 按这个顺序订阅 tick 事件。' }, tone: 'neutral' },
        { label: { en: 'First dispatch', zh: '第一轮派发' }, detail: { en: `Observed: ${first.join(' → ') || '(no callbacks)'}. A removes itself.`, zh: `实际调用：${first.join(' → ') || '（无回调）'}。A 在回调中取消自己。` }, tone: first.join(',') === 'A,B' ? 'good' : 'bad' },
        { label: { en: 'Next dispatch', zh: '下一轮派发' }, detail: { en: `Observed: ${second.join(' → ') || '(no callbacks)'}. Expected: B.`, zh: `实际调用：${second.join(' → ') || '（无回调）'}。预期只有 B。` }, tone: second.join(',') === 'B' ? 'good' : 'bad' }
      ] };
    }
  },
  {
    id: 'concurrency',
    name: t('The stuck queue', '卡住的任务队列'),
    title: t('One promise rejects. Why does the queue stop?', '一个 Promise 失败，队列为什么不继续了？'),
    tag: t('ASYNC CONCURRENCY', '异步并发'), duration: '12 min', difficulty: 'Intermediate', entry: 'createLimit',
    intro: t('A concurrency limit is a set of reusable slots. Fix a queue that returns a slot after success but keeps it forever after failure.', '并发限制是一组可复用的执行名额。队列成功时归还名额，失败时却永远占着它。请修好这个问题。'),
    question: t('With a limit of 1, A rejects and B is queued. In the starter, what happens to B?', '并发限制为 1，任务 A 失败，B 正在排队。初始代码中 B 会怎样？'),
    concept: t('A job occupies one slot until its promise settles, fulfilled or rejected. Delivering the result and releasing the slot are separate responsibilities. Tasks start in submission order, up to the fixed limit.', '任务占用一个名额，直到其 Promise 成功或失败。把结果交给调用方与释放名额是两件事。任务按提交顺序启动，数量不能超过固定上限。'),
    explanation: t('The rejection branch rejects the caller’s promise but never decrements active. finally can release the slot on both paths. This small array-queue exercise accepts positive integer limits only. It omits p-limit’s argument forwarding, counters, clearing, dynamic limits and Infinity support. Tests gate tasks explicitly; delay(0) is an event-loop checkpoint, not a speed benchmark.', '失败分支把异常交给调用方，却没有减少 active。可以用 finally 在两种结果后归还名额。本课使用简化数组队列，仅接受正整数上限；不实现 p-limit 的参数转发、计数器、清空队列、动态上限和 Infinity 支持。测试用可控 Promise 控制任务，delay(0) 只是事件循环检查点，不是性能计时。'),
    starter: concurrencyStarter, solution: concurrencySolution, focusLines: [18, 19, 20],
    hints: [
      t('Rejecting the caller’s promise does not change active. Which state must change after every finished job?', '拒绝调用方的 Promise 不会自动改变 active。每个任务结束后，需要更新哪个状态？'),
      t('Separate delivering the result from releasing capacity. Both outcomes require cleanup.', '把返回结果与释放容量分开。成功与失败都需要清理。'),
      t('Use finally to decrement active and resume the queue, exactly once per job.', '在 finally 中减少 active，再继续队列；每个任务只释放一次。')
    ],
    prediction: {
      options: [
        { id: 'stuck', label: t('B remains queued', 'B 一直排队') },
        { id: 'runs', label: t('B starts normally', 'B 正常开始') },
        { id: 'rejects', label: t('B rejects with A’s error', 'B 收到 A 的错误') }
      ], answer: 'stuck',
      explanation: t('A’s slot stays occupied, leaving no capacity for B. B’s promise is still pending.', 'A 的名额没有释放，队列就没有容量启动 B。B 的 Promise 仍在等待。')
    },
    source: {
      name: 'p-limit', url: 'https://github.com/sindresorhus/p-limit/blob/923811344705a6604967540e19f7653752021438/index.js',
      version: '6.2.0 · 9238113', license: 'MIT', kind: 'inspired',
      detail: t('Independently written teaching code inspired by p-limit’s slot/queue mechanism. The leak is intentional here; p-limit advances after either outcome. This is not an API-compatible replacement.', '受 p-limit 的名额与队列机制启发，独立编写的教学代码。泄漏是本课故意引入的，p-limit 在两种结果后都会继续队列。本课不是兼容其 API 的替代品。')
    },
    tests: [
      test('bounded', 'Start only as many jobs as available slots', '启动数量不超过可用名额', async function (create, { equal, delay }) {
        const limit = create(2); const releases = [];
        const gates = [0, 1, 2].map(i => new Promise(resolve => { releases[i] = resolve; }));
        const started = [];
        const jobs = gates.map((gate, i) => limit(async () => { started.push(i); await gate; return i; }));
        await delay(0); const first = started.slice(); releases[0]();
        await delay(0); const afterRelease = started.slice(); releases[1](); releases[2]();
        equal(first, [0, 1], 'Only two jobs start before a slot is released');
        equal(afterRelease, [0, 1, 2], 'A released slot starts the next queued job');
        equal(await Promise.all(jobs), [0, 1, 2], 'Each caller receives its own result');
      }),
      test('fifo', 'Queued jobs start in submission order', '排队任务按提交顺序启动', async function (create, { equal, delay }) {
        const limit = create(1); const releases = [];
        const gates = [0, 1, 2].map(i => new Promise(resolve => { releases[i] = resolve; }));
        const started = [];
        const jobs = gates.map((gate, i) => limit(async () => { started.push(i); await gate; return i; }));
        await delay(0); equal(started, [0], 'First submitted starts first'); releases[0]();
        await delay(0); equal(started, [0, 1], 'Second submitted starts next'); releases[1]();
        await delay(0); equal(started, [0, 1, 2], 'Third submitted starts last'); releases[2]();
        await Promise.all(jobs);
      }),
      test('rejection-release', 'A rejected promise releases its slot', 'Promise 失败后释放名额', async function (create, { equal, assert, delay }) {
        const limit = create(1); const failure = new Error('network failed'); let observed; let nextStarted = false;
        const first = limit(() => Promise.reject(failure)).catch(error => { observed = error; });
        const next = limit(() => { nextStarted = true; return 'recovered'; });
        await first; await delay(0);
        assert(observed === failure, 'Original rejection reaches the caller');
        assert(nextStarted, 'The next job must start after rejection');
        equal(await next, 'recovered', 'The next job finishes independently');
      }),
      test('sync-throw-release', 'A synchronous throw also releases its slot', '同步抛错也能释放名额', async function (create, { assert, delay }) {
        const limit = create(1); const failure = new Error('task threw'); let observed; let nextStarted = false;
        const first = limit(() => { throw failure; }).catch(error => { observed = error; });
        const next = limit(() => { nextStarted = true; return 42; });
        await first; await delay(0);
        assert(observed === failure, 'A synchronous throw becomes the caller’s rejection');
        assert(nextStarted, 'A thrown task must not strand the next job'); await next;
      }),
      test('settled-only', 'Keep a slot until an asynchronous job settles', '异步任务结束前保持名额占用', async function (create, { equal, delay }) {
        const limit = create(1); let release;
        const gate = new Promise(resolve => { release = resolve; }); const started = [];
        const first = limit(() => { started.push('A'); return gate.then(() => 'A result'); });
        const next = limit(() => { started.push('B'); return 'B result'; });
        await delay(0); const before = started.slice(); release();
        equal(before, ['A'], 'A pending promise must not release the slot early');
        equal(await Promise.all([first, next]), ['A result', 'B result'], 'Both results are preserved');
        equal(started, ['A', 'B'], 'B starts after A settles');
      }),
      test('many-failures', 'Several failures do not reduce future capacity', '连续失败不减少后续容量', async function (create, { equal, assert, delay }) {
        const limit = create(2); const outcomes = [];
        const jobs = [0, 1, 2, 3].map(i => limit(() => {
          if (i < 2) return Promise.reject(new Error(`failure ${i}`));
          outcomes.push(i); return i;
        }).then(value => ({ value }), error => ({ error: error.message })));
        await delay(0);
        assert(outcomes.length === 2, 'Both failed jobs release capacity for later work');
        equal(await Promise.all(jobs), [{ error: 'failure 0' }, { error: 'failure 1' }, { value: 2 }, { value: 3 }], 'Failures stay local to their callers');
      }),
      test('validation', 'Reject invalid concurrency limits', '拒绝无效的并发上限', function (create, { assert }) {
        for (const value of [0, -1, 1.5, NaN, Infinity, '2']) {
          let threw = false; try { create(value); } catch { threw = true; }
          assert(threw, 'This teaching API accepts positive integers only');
        }
        assert(typeof create(1) === 'function', 'A valid limit returns a task runner');
      })
    ],
    demo: async function (create, { delay }) {
      const limit = create(1); const events = []; let bStarted = false;
      const a = limit(() => { events.push('A started'); throw new Error('A failed'); })
        .catch(error => { events.push(error.message); });
      const b = limit(() => { bStarted = true; events.push('B started'); return 'B completed'; });
      await a; await delay(0); if (bStarted) events.push(await b);
      return { steps: [
        { label: { en: 'Capacity', zh: '并发容量' }, detail: { en: 'One slot. Submit A, then B.', zh: '只有一个名额，先提交 A，再提交 B。' }, tone: 'neutral' },
        { label: { en: 'Observed sequence', zh: '实际执行顺序' }, detail: { en: events.join(' → ') || '(no tasks started)', zh: events.map(event => ({ 'A started': 'A 开始', 'A failed': 'A 失败', 'B started': 'B 开始', 'B completed': 'B 完成' }[event] || event)).join(' → ') || '（没有任务启动）' }, tone: 'neutral' },
        { label: { en: 'Queue after failure', zh: '失败后的队列' }, detail: { en: bStarted ? 'B acquired the released slot and completed.' : 'B never started: the failed job still occupies the slot.', zh: bStarted ? 'B 获得了释放的名额，并执行完成。' : 'B 未能启动：失败的任务仍占着名额。' }, tone: bStarted ? 'good' : 'bad' }
      ] };
    }
  },
  {
    id: 'store',
    name: t('The noisy subscriber', '过度通知的订阅者'),
    title: t('The theme changes. Why does the counter react?', '主题变了，计数器为什么也收到通知？'),
    tag: t('STATE SELECTORS', '状态选择器'), duration: '10 min', difficulty: 'Starter', entry: 'createStore',
    intro: t('A listener subscribes to count, not the whole store. Make notifications follow that selected value while preserving useful previous-value information.', '监听器订阅的是 count，而不是整个状态。请让通知跟随选中值的变化，同时保留正确的上一个值。'),
    question: t('Subscribe once to count. Only theme changes from "light" to "dark". How often does the starter call the count listener?', '注册一个 count 选择器，只把 theme 从 "light" 改为 "dark"。初始代码调用 count 监听器几次？'),
    concept: t('Each subscription stores its last selected value. Recompute after an update; notify only when Object.is says the selection changed. Update the stored value before the callback, passing next and previous selections.', '每个订阅保存上次选中值。更新后重新计算，仅在 Object.is 判断选中值发生变化时通知。回调前更新缓存，并传入本次与上次选中值。'),
    explanation: t('The starter notifies every subscription after every patch. Compare selected values, not entire state objects. Object.is handles NaN and signed zero and compares object references without doing deep comparison. This API shallow-merges object patches, accepts updater functions and does not notify on subscribe. Selectors should be pure. It is not Zustand’s full API or a React integration.', '初始代码在每次更新后通知所有订阅。应比较选中值，而不是整个状态对象。Object.is 能处理 NaN 与带符号零，对对象比较引用，不进行深比较。本 API 浅合并对象补丁、支持更新函数，注册时不立即通知。选择器应保持纯函数。本课不实现 Zustand 的完整 API 或 React 集成。'),
    starter: storeStarter, solution: storeSolution, focusLines: [11, 12, 13, 14, 15],
    hints: [
      t('The state object gets a new identity. Does the value selected by this listener change too?', '状态对象的引用变了，但这个监听器选中的值也变了吗？'),
      t('Each subscription already stores a previous selection. Compare it before calling the listener.', '每个订阅已经保存了上次选中值。在调用监听器前先比较它。'),
      t('Use Object.is(next, previous). Skip unchanged selections; retain the previous value in notifications.', '使用 Object.is(next, previous)。跳过未改变的选中值，通知时保留旧值。')
    ],
    prediction: {
      options: [
        { id: 'one', label: t('Once, unnecessarily', '一次，多余的通知') },
        { id: 'zero', label: t('Zero times', '零次') },
        { id: 'two', label: t('Twice', '两次') }
      ], answer: 'one',
      explanation: t('The starter does not compare selections. The repaired listener stays quiet until count itself changes.', '初始代码没有比较选中值。修复后，在 count 本身变化前，监听器应保持安静。')
    },
    source: {
      name: 'Zustand · subscribeWithSelector', url: 'https://github.com/pmndrs/zustand/blob/e30db4d1c2cc4a58ef60dd581cff1ff22e2e3a08/src/middleware/subscribeWithSelector.ts',
      version: '5.0.8 · e30db4d', license: 'MIT', kind: 'inspired',
      detail: t('Independently written teaching store inspired by selector subscriptions. Zustand already checks selected-value equality. This omits middleware composition, custom equality, immediate firing and React bindings.', '受选择器订阅启发，独立编写的教学状态容器。Zustand 本来就检查选中值相等性。本课不实现中间件组合、自定义相等函数、立即通知或 React 绑定。')
    },
    tests: [
      test('unrelated', 'An unrelated update stays quiet', '无关状态更新不发送通知', function (create, { equal }) {
        const store = create({ count: 0, theme: 'light' }); const seen = [];
        store.subscribe(state => state.count, (next, previous) => seen.push([next, previous]));
        store.setState({ theme: 'dark' });
        equal(seen, [], 'A count subscriber must not react to a theme-only update');
        equal(store.getState(), { count: 0, theme: 'dark' }, 'The patch still updates the store');
      }),
      test('previous-selection', 'Changes include their previous selected values', '变化通知带有正确的上一个选中值', function (create, { equal }) {
        const store = create({ count: 0 }); const seen = [];
        store.subscribe(state => state.count, (next, previous) => seen.push([next, previous]));
        store.setState({ count: 1 }); store.setState({ count: 2 });
        equal(seen, [[1, 0], [2, 1]], 'Each listener gets next and immediately previous selections');
      }),
      test('reentrant-selection', 'Cache the selection before calling the listener', '调用监听器前更新选中值缓存', function (create, { equal }) {
        const store = create({ count: 0 }); const seen = [];
        store.subscribe(state => state.count, (next, previous) => {
          seen.push([next, previous]);
          if (next === 1) store.setState({ count: 2 });
        });
        store.setState({ count: 1 });
        equal(seen, [[1, 0], [2, 1]], 'A nested update sees the selection from the outer notification');
        store.setState({ count: 2 });
        equal(seen, [[1, 0], [2, 1]], 'The nested update leaves the latest selection cached');
      }),
      test('same-value', 'Writing the same selected value stays quiet', '重复写入同一选中值不发送通知', function (create, { equal }) {
        const store = create({ count: 4 }); const seen = [];
        store.subscribe(state => state.count, value => seen.push(value));
        store.setState({ count: 4 }); store.setState({ count: 5 }); store.setState({ count: 5 });
        equal(seen, [5], 'Only an actual change in selected value notifies');
      }),
      test('independent-selectors', 'Each selector tracks its own value', '每个选择器独立跟踪自己的值', function (create, { equal }) {
        const store = create({ count: 0, theme: 'light' }); const counts = []; const themes = [];
        store.subscribe(state => state.count, value => counts.push(value));
        store.subscribe(state => state.theme, value => themes.push(value));
        store.setState({ count: 1 }); store.setState({ theme: 'dark' });
        equal(counts, [1], 'The count listener tracks count only'); equal(themes, ['dark'], 'The theme listener tracks theme only');
      }),
      test('unsubscribe', 'Unsubscribe removes only that subscription', '取消订阅只移除对应监听器', function (create, { equal }) {
        const store = create({ count: 0 }); const seen = [];
        const stop = store.subscribe(state => state.count, value => seen.push(['A', value]));
        store.subscribe(state => state.count, value => seen.push(['B', value]));
        stop(); stop(); store.setState({ count: 1 });
        equal(seen, [['B', 1]], 'Unsubscribe is repeatable and does not remove another subscription');
      }),
      test('object-is', 'Use Object.is for NaN and signed zero', '按 Object.is 处理 NaN 与带符号零', function (create, { equal, assert }) {
        const store = create({ value: NaN }); const seen = [];
        store.subscribe(state => state.value, (next, previous) => seen.push([next, previous]));
        store.setState({ value: NaN }); equal(seen.length, 0, 'NaN to NaN is unchanged');
        store.setState({ value: 0 }); store.setState({ value: -0 });
        equal(seen.length, 2, 'Positive to negative zero changes under Object.is');
        assert(Object.is(seen[1][0], -0) && Object.is(seen[1][1], 0), 'Retain signed values in the callback');
      }),
      test('object-reference', 'Objects are compared by reference', '对象选中值按引用比较', function (create, { equal, assert }) {
        const original = { name: 'Ada' }; const store = create({ user: original, count: 0 }); const seen = [];
        store.subscribe(state => state.user, (next, previous) => seen.push([next, previous]));
        store.setState({ count: 1 }); store.setState({ user: original });
        equal(seen.length, 0, 'An unchanged object reference stays quiet');
        const replacement = { name: 'Ada' }; store.setState({ user: replacement });
        equal(seen.length, 1, 'A new reference notifies even if its properties look equal');
        assert(seen[0][0] === replacement && seen[0][1] === original, 'Preserve actual selected references');
      }),
      test('updater-and-initial', 'Updater uses current state; subscribe is quiet', '更新函数读当前状态，注册时不立即通知', function (create, { equal }) {
        const store = create({ count: 2, label: 'counter' }); const seen = [];
        store.subscribe(state => state.count, (next, previous) => seen.push([next, previous]));
        equal(seen, [], 'Subscribe captures the initial selection without firing');
        store.setState(state => ({ count: state.count + 3 }));
        equal(seen, [[5, 2]], 'Updater reads current state');
        equal(store.getState(), { count: 5, label: 'counter' }, 'Patch shallow-merges, rather than replacing state');
      })
    ],
    demo: function (create) {
      const store = create({ count: 0, theme: 'light' }); const seen = [];
      store.subscribe(state => state.count, (next, previous) => seen.push(`${previous} → ${next}`));
      store.setState({ theme: 'dark' }); const themeCalls = seen.slice(); seen.length = 0;
      store.setState({ count: 1 }); const countCalls = seen.slice();
      return { steps: [
        { label: { en: 'Subscribe', zh: '注册订阅' }, detail: { en: 'The listener selects count. Initial count: 0.', zh: '监听器选择 count，初始值为 0。' }, tone: 'neutral' },
        { label: { en: 'Change theme', zh: '修改主题' }, detail: { en: `Count notifications: ${themeCalls.length}${themeCalls.length ? ` (${themeCalls.join(', ')})` : ' (quiet)'}.`, zh: `count 通知次数：${themeCalls.length}${themeCalls.length ? `（${themeCalls.join(', ')}）` : '（保持安静）'}。` }, tone: themeCalls.length === 0 ? 'good' : 'bad' },
        { label: { en: 'Change count', zh: '修改计数' }, detail: { en: `Observed: ${countCalls.join(', ') || '(no notification)'}. Expected: 0 → 1.`, zh: `实际通知：${countCalls.join(', ') || '（无通知）'}。预期：0 → 1。` }, tone: countCalls.join(',') === '0 → 1' ? 'good' : 'bad' }
      ] };
    }
  }
];
