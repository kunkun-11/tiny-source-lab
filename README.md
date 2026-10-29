# Tiny Source Lab

**Break tiny code. Understand big ideas.**

Edit a small JavaScript implementation, watch a surprising edge case, and fix it with behavior checks. Three guided experiments inspired by **mitt**, **p-limit**, and **Zustand**. No account or AI API key.

[Try the live lab](https://kunkun-11.github.io/tiny-source-lab/) · [中文说明](README.zh-CN.md) · [Add a lesson](CONTRIBUTING.md)

![Tiny Source Lab with editable code and behavior checks](docs/screenshot.png)

## The first experiment

**Why can removing listener A make listener B disappear?**

```js
// Iterating a live listener array can skip the next listener
// when the current listener removes itself.
handlers.forEach((handler) => handler(event));

// A snapshot preserves this dispatch's listener order.
handlers.slice().forEach((handler) => handler(event));
```

That array copy appears in mitt v3.0.1. The lab introduces a deliberate teaching defect so you can discover the behavior yourself. It is not a bug in mitt.

## Inside the lab

| Experiment | Question | Behavior to repair |
| --- | --- | --- |
| Snapshot dispatch | What happens when a listener unsubscribes during dispatch? | Listener ordering and mutation, including wildcard handlers. |
| Concurrency limits | Who gets the slot when a task rejects? | Queue progress, rejection propagation, and the concurrency bound. |
| Selected subscriptions | Should changing an unrelated field notify a subscriber? | Selector equality, previous values, and unsubscribe behavior. |

Predict the result, edit the starter, and run the checks. Progressive hints and reference answers are available. The timeline comes from executing your implementation. Lessons have English and Chinese content; code and progress stay in your browser. Share a direct lesson link such as [the emitter experiment](https://kunkun-11.github.io/tiny-source-lab/#emitter).

This is a curated teaching lab. The concurrency and store implementations are independently written, simplified exercises; they do not replace the production libraries. Source versions and adaptation details are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Run locally

Requires Node.js **20.19+** or **22.12+**; Node 22 is used in CI.

```sh
git clone https://github.com/kunkun-11/tiny-source-lab.git
cd tiny-source-lab
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a static site in `dist/`; `npm run preview` serves it. The built app has no CDN, API, account, or runtime package downloads. After serving its static files, lessons run locally. The website does not collect analytics or send your code to a server.

## Validate

```sh
npm test
npx playwright install chromium firefox
npm run test:browser
npm run build
```

Node checks verify that reference answers pass and deliberately incomplete starters fail, and reject a plausible incorrect repair. Browser checks cover the actual isolated runner and learning flow on desktop, Firefox, and a mobile viewport. CI repeats validation before deploying GitHub Pages.

## Execution boundary

Edited code runs in a disposable Web Worker inside an opaque-origin sandboxed iframe. Its content policy blocks network access; it cannot directly access the application's DOM or local storage. The application stops an entire run after eight seconds, including an infinite loop. Individual asynchronous checks time out sooner.

These measures support a local learning workflow. They are not a hardened service for hosting arbitrary untrusted programs, and browser results are not a tamper-proof certificate. A reference answer passing the lesson checks establishes the documented examples, not every possible input. Very large allocations can still consume browser resources. Use the included exercises and code you understand.

## Contribute and follow

One useful new lesson is more valuable than a large unverified catalog. See the [contribution guide](CONTRIBUTING.md) for the lesson format, behavior checks, and source attribution. Bug reports should include the lesson, browser, code change, and result.

If a lesson helped you understand a tricky behavior, a star makes the project easier to find again. The next release should follow learner feedback; see the [research](docs/RESEARCH.md) and [launch plan](docs/LAUNCH.md) for the rationale.

MIT licensed. Adapted upstream source retains its own attribution and license.
