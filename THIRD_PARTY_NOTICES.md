# Third-party sources and notices

Tiny Source Lab teaches mechanisms from small open-source libraries. The intentionally broken starter code is created for these exercises: it does **not** identify defects in the upstream libraries. Sources are pinned so their behavior and provenance remain reviewable.

## mitt — adapted emitter lesson

- Project: [developit/mitt](https://github.com/developit/mitt)
- Version: 3.0.1, commit `b240473b5707857ba2c6a8e6d707c28d1e39da49`
- Source: [src/index.ts](https://github.com/developit/mitt/blob/b240473b5707857ba2c6a8e6d707c28d1e39da49/src/index.ts)
- License: [MIT](https://github.com/developit/mitt/blob/b240473b5707857ba2c6a8e6d707c28d1e39da49/LICENSE)

The emitter source strings in `src/lessons.js` adapt mitt's implementation into shorter JavaScript. Type annotations and long API comments are omitted; dispatch uses `forEach` instead of `map`. The starter intentionally removes the typed and wildcard listener snapshots. The reference solution restores them. Tests and explanations are original teaching material. The exercise does not support manually emitting the wildcard event, consistent with mitt's documented contract.

The following notice applies to the adapted emitter code:

```text
MIT License

Copyright (c) 2021 Jason Miller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## p-limit — inspiration for the concurrency lesson

- Project: [sindresorhus/p-limit](https://github.com/sindresorhus/p-limit)
- Version: 6.2.0, commit `923811344705a6604967540e19f7653752021438`
- Source: [index.js](https://github.com/sindresorhus/p-limit/blob/923811344705a6604967540e19f7653752021438/index.js)
- License: [MIT](https://github.com/sindresorhus/p-limit/blob/923811344705a6604967540e19f7653752021438/license)

The concurrency lesson is an independently written, simplified implementation inspired by the slot-and-queue mechanism. p-limit already advances the queue after fulfilled and rejected promises. The starter's slot leak is introduced for teaching. This exercise accepts positive integer concurrency only and omits p-limit's public counters, clearing, dynamic limits, argument forwarding and Infinity support. It is not an API-compatible replacement, and p-limit is not a runtime dependency.

## Zustand — inspiration for the selector lesson

- Project: [pmndrs/zustand](https://github.com/pmndrs/zustand)
- Version: 5.0.8, commit `e30db4d1c2cc4a58ef60dd581cff1ff22e2e3a08`
- Source: [subscribeWithSelector.ts](https://github.com/pmndrs/zustand/blob/e30db4d1c2cc4a58ef60dd581cff1ff22e2e3a08/src/middleware/subscribeWithSelector.ts) and [vanilla.ts](https://github.com/pmndrs/zustand/blob/e30db4d1c2cc4a58ef60dd581cff1ff22e2e3a08/src/vanilla.ts)
- License: [MIT](https://github.com/pmndrs/zustand/blob/e30db4d1c2cc4a58ef60dd581cff1ff22e2e3a08/LICENSE)

The selector lesson is an independently written teaching store inspired by selected-value subscription behavior. Zustand already compares selected values. The exercise is deliberately smaller: shallow object patches, pure selectors, `Object.is` equality and no notification at subscription time. It omits middleware composition, custom equality, immediate firing and React bindings. Zustand is not a runtime dependency.

## Method and format inspiration

[CodeTour](https://github.com/microsoft/codetour), [PocketFlow's codebase tutorial](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge), and [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) informed the combination of focused source reading and hands-on behavior checks. Their code, course prose and assets are not copied or bundled. Tiny Source Lab does not claim to invent interactive programming lessons.

Development dependency licenses are provided by their respective packages. Course source links point to specific reviewed commits rather than following an upstream default branch.
