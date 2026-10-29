# Contributing

Useful contributions include a clearer explanation, a reproducible browser bug, or one small lesson about a surprising behavior in a real library.

Run `npm ci`, `npm test`, and `npm run test:browser` before submitting a change. Install test browsers with `npx playwright install chromium firefox`. Run `npm run build` to verify the static site.

## Add a lesson

Add a record to `src/lessons.js`. It needs bilingual metadata, a prediction question, readable starter and reference sources, progressive hints, and a pinned upstream source link. Explain whether the code is adapted or independently written. Preserve licenses in `THIRD_PARTY_NOTICES.md` for adapted source.

Checks receive the entry function and `{equal, assert, delay}`. Each check and demonstration must be self-contained: the browser serializes it into a worker, so it cannot capture imports or outer variables. Use controlled promises to test asynchronous behavior rather than assuming exact timer durations. The demonstration must show observations from the learner's implementation.

The reference should pass every check. The starter should compile, retain some correct behavior, and fail the intended edge case. Add a plausible incorrect fix to the Node tests and make sure the checks reject it. Document the contract and simplifications; avoid implying that the teaching defect exists in the upstream library.

Submit a focused pull request with the concept, source version, attribution, and checks you ran. Please open a discussion in an issue before building large features such as arbitrary repository imports, accounts, or AI-generated courses.

## 中文

欢迎改进讲解、修复可复现问题或贡献一个小而完整的源码实验。新课需要固定来源、中英文内容、能运行的初始代码与参考解答、行为检查和真实演示。测试要识别合理但错误的修复，保留源码许可，不把教学错误说成上游缺陷。
