# Tiny Source Lab v0.1.0

**Break tiny code. Understand big ideas.**

[Open the live lab](https://kunkun-11.github.io/tiny-source-lab/)

Three complete JavaScript experiments explore event dispatch snapshots, concurrency slots after rejection, and selected state subscriptions. Predict an edge case, edit a short implementation, run behavior checks, and compare the observed trace. Includes English/Chinese content, progressive hints, reference answers, local progress, and shareable lesson links.

No account or API key is needed. Source versions and teaching adaptations are attributed; deliberate starter defects are not upstream bugs. This is a curated learning tool, with simplified APIs and documented execution limits.

Validation for the release:

- 23 reference behavior checks pass; deliberately incomplete starters fail the intended cases.
- 16 Node verification tests, including plausible incorrect repairs, pass.
- 24 browser tests across Chromium, Firefox, and a mobile viewport pass in GitHub Actions.
- Production build and GitHub Pages deployment pass; the deployed emitter and store flows were verified in Edge with no page errors.

中文：三个能直接动手的源码专题，覆盖事件派发、并发限制和状态订阅。先预测、观察失败、修改代码，再用行为检查验证。中英文、提示、参考答案与来源许可完整；课程错误是人为设置的教学材料。
