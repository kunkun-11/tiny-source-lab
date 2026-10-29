# A practical launch for Tiny Source Lab

Working title: **Tiny Source Lab — Learn JavaScript by breaking tiny implementations.**

Chinese title: **删掉一行代码，为什么另一个监听器就不执行了？**

Use the descriptive title for the repository and the concrete listener question for the first lesson post. Both should lead to an actual runnable example.

## Prepare the first release

- Put the live demo and the repository link near the top of the English and Chinese READMEs.
- Include a real screenshot or short recording of the failing starter, the code change, and the resulting behavior checks. Use the tool's own interface; label reference-answer use accurately.
- Provide the tested local setup command, prerequisites, license and attribution, known runner limitations, and a small lesson contribution guide.
- Confirm that a fresh checkout builds and that the published demo uses the same version. Check a mobile viewport and keyboard access.
- Use relevant repository topics such as `javascript`, `learning`, `interactive-tutorial`, and `developer-tools`; avoid unrelated trending keywords.
- Release the first complete version with an honest changelog. Name what works now and what remains experimental.

Do not publish a milestone claim before its checks pass. Do not use screenshots of passing results that the released implementation cannot reproduce.

## First-week sequence

| When | Action | Evidence to keep |
| --- | --- | --- |
| Release day | Publish the repository and live lesson; open the same demo from a fresh browser session. | Release URL, demo URL, exact version, observed setup failures. |
| Days 1–2 | Share one useful lesson walkthrough in a place where JavaScript learners already ask these questions, following that community's rules. | Questions and concrete usability feedback. |
| Days 2–4 | Ask a few willing learners to try the lesson and explain the listener behavior in their own words. | Confusing wording, failed steps, whether they can finish independently. |
| Days 4–7 | Fix the most consequential feedback, then publish one substantive update if there is something useful to show. | Before/after behavior and the change that addressed it. |
| End of week | Review GitHub traffic when available and the feedback received. Choose one improvement or next lesson. | Visits and referring sites available to the owner; stars as an outcome, not a promised quota. |

This plan does not send messages automatically. Community posts below are drafts for the author to adapt and post. Avoid repeated cross-posting, unsolicited messages, reciprocal-star arrangements, and automated stars. A single relevant explanation is more useful than identical promotion in many places.

An English launch can use [Show HN](https://news.ycombinator.com/showhn.html) when there is a working artifact and the author is ready to answer questions. A Chinese launch can consider [HelloGitHub](https://hellogithub.com/), using its current submission rules and a relevant project category. Acceptance and exposure are not guaranteed.

## English post draft

**Title:** Show HN: Tiny Source Lab — experiment with small JavaScript implementations

I built Tiny Source Lab to make a small part of reading source code more hands-on: observe a failing behavior, change the implementation, and run checks that explain the edge case.

The first example asks why an event emitter copies its listener array before dispatch. If listener A removes itself while we iterate the original array, listener B can be skipped. The lesson is inspired by the behavior in mitt v3.0.1, with attribution and a deliberately simplified teaching implementation. It is not a bug in mitt.

You can edit the code and try the checks in your browser. No account or AI API key is needed. The source, lesson definitions, and behavior checks are available in the repository.

Demo: https://kunkun-11.github.io/tiny-source-lab/

Source: https://github.com/kunkun-11/tiny-source-lab

I'd like feedback on one thing: after trying a lesson, is the failing behavior easier to explain than it was after reading the code? Suggestions for small, useful next lessons are welcome.

## 中文发布草稿

**标题：** 删掉事件库里的一次数组复制，另一个监听器为什么不执行了？

我做了一个可以直接在浏览器里试的 JavaScript 源码实验台 Tiny Source Lab。它把一个小知识点变成“观察失败 → 改代码 → 跑行为检查 → 解释原因”的完整练习。

第一课来自 mitt v3.0.1 的一个实现细节：派发事件时先复制监听器数组。如果 A 在执行时取消自己的订阅，而我们正在遍历原数组，B 就可能被跳过。课里的错误是为了教学特意设置的，不是 mitt 的 bug；页面会说明固定来源和简化范围。

不用注册，也不用配置 AI API key。源码、课包与行为检查都公开，欢迎自己改一改，看看你的修复能不能处理边界情况。

在线体验：https://kunkun-11.github.io/tiny-source-lab/

GitHub：https://github.com/kunkun-11/tiny-source-lab

我最想了解的是：动手之后，你能不能更清楚地解释“为什么会跳过 B”？如果觉得有用，欢迎收藏或 star，也欢迎指出讲解不清楚的地方。

## Decide what to improve from the evidence

If people cannot tell what the project does, rewrite the opening example. If the demo fails to load, fix deployment before promotion. If a lesson passes with a known bad repair, improve its behavior checks. If learners finish but do not want a second lesson, ask what they expected to learn before adding more features.

A small first release can validate the experience. It cannot validate a long-term star target, and there is no promised conversion rate in this plan.

## 中文摘要

首发先准备真实可试用页面、演示、中英文说明和来源许可，再发布一个具体教学话题。第一周重点观察能否独立完成、讲解哪里难懂、是否愿意继续下一课；根据反馈更新。社区文案只是草稿，由作者按当地规则自己发布，不自动群发，不刷星。
