# Why Tiny Source Lab exists

Research snapshot: **29 October 2026**. Star counts below are observations from GitHub repository search at this date; they will change. They describe the existing projects' reach, not a forecast for this project.

Tiny Source Lab is a small learning tool: change a short JavaScript implementation, run behavior checks, and explain the edge case you just observed. The first audience is a developer who can write JavaScript but wants to understand what makes a tiny library reliable.

## What popular projects teach us

| Project | Stars at snapshot | Observed approach | Useful lesson |
| --- | ---: | --- | --- |
| [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) | 557,118 | Organizes tutorials around rebuilding a recognizable technology. | Explain a concrete skill the learner can acquire. A tutorial collection's stars do not establish demand for our particular lessons. |
| [PocketFlow: Codebase to Tutorial](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge) | 12,725 | Turns repository analysis into a structured tutorial. | Organize material around concepts and code relationships. Generating another repository explanation alone would have little differentiation. |
| [CodeTour](https://github.com/microsoft/codetour) | 4,598 | Records and plays guided tours of a codebase in VS Code. | Connect an explanation to the code it discusses. Guided code exploration already exists. |
| [Sandpack](https://github.com/codesandbox/sandpack) | 6,257 | Provides components for editing and running code in a browser. | Reduce the setup before a learner can try an idea. Sandpack is an adjacent toolkit, not a runtime dependency of this implementation. |
| [Codojo](https://github.com/ttguy0707/codojo) | 73 | Offers an AI learning workflow for understanding and modifying real projects. | Project-based learning with AI is already represented; our case needs to stand on curated examples and immediate feedback. |
| [Repomix](https://github.com/yamadashy/repomix) | 29,064 | Offers a one-command path and an online tool for packing a repository for AI. | A clear input and a tangible output are easier to explain than a broad platform. |
| [Gitingest](https://github.com/coderamp-labs/gitingest) | 16,046 | Makes its workflow memorable: replace `hub` with `ingest` in a GitHub URL. | A short description should name the action and the result. |

These are selected successful examples, with substantial survivorship bias. Existing audiences, timing, contributions, and distribution also affect popularity. We have not measured whether any README feature caused stars.

## Why we did not start with another agent utility

The context-packing and agent-configuration directions were examined as alternatives:

- Repomix already documents per-file token counts, include/exclude patterns, ignore-file support, Secretlint-based credential detection, Tree-sitter compression, and Git diffs/logs. A generic packer with those features would duplicate a mature workflow.
- [Gitingest issue #20](https://github.com/coderamp-labs/gitingest/issues/20) reports a large token contribution from a lock file and requests exclusion patterns. It is **closed**, so this historical request is not evidence that current Gitingest lacks exclusion support.
- [Repomix issue #36](https://github.com/yamadashy/repomix/issues/36) requests compression levels. It was open when read, but the current README already documents a compression option. The issue does not justify saying Repomix cannot compress code.
- [Ruler](https://github.com/intellectronica/ruler), with 2,953 stars, centralizes instructions for coding agents. [Rulesync](https://github.com/dyoshikawa/rulesync), with 1,566 stars, already supports broad configuration generation, import/export, direct conversion, and multiple feature types. Another generic rules synchronizer would need a more specific reason to exist.
- [Rulesync issue #2588](https://github.com/dyoshikawa/rulesync/issues/2588) describes silent field loss during hook conversion. It is **closed**. It illustrates the maintenance involved in format conversion, not an unresolved bug we can use to advertise this project.

These README and issue reads did not include installing or benchmarking the competing utilities. They are a scope decision, not a claim that our project outperforms them.

## The proposed improvement

The useful combination is a short code tour, a browser experiment, and behavior checks for one defined concept. A learner should be able to answer a question, observe a failure, modify the relevant code, and verify a fix without configuring an AI service.

Tiny Source Lab contributes its own lesson organization, teaching implementations, hints, behavior checks, and feedback interface. It borrows the *approach* of concrete build exercises and guided code reading. It does not merge or rebrand the repositories above, and it does not claim to be the first interactive programming course.

The first lesson has a precise source observation: [mitt v3.0.1](https://github.com/developit/mitt/blob/3.0.1/src/index.ts) copies a listener array with `.slice()` before invoking handlers. The teaching question is why a listener removing itself can affect iteration over a live array. The deliberately incomplete classroom implementation is not a bug report against mitt. The lesson's reduced API and chosen semantics must be distinguished from mitt's complete implementation.

Concurrency limits and state-store notifications are useful follow-up concepts because small changes produce observable ordering and identity behavior. Each lesson must specify its own contract; a teaching implementation is not a production substitute for the library that inspired its subject.

## What the first release needs to prove

1. A new visitor can run an example and understand its failing behavior without an account or API key.
2. The reference implementation passes the behavior checks; the starter and a plausible incorrect repair fail for the intended reason.
3. Feedback explains the behavior rather than accepting a particular answer string.
4. Source references, source versions, and any copied or adapted code are attributed with their licenses.
5. The page works on a narrow screen and the build can be reproduced from its lockfile.
6. A lesson can be added without changing the application shell.

Browser checks are learning feedback, not certification or proof against deliberate tampering. Running editable JavaScript also has execution limits; the application documentation should state the actual runner boundary. A reference answer passing our checks does not prove correctness for every possible input.

## Growth hypotheses to test

A lesson can provide a useful reason to share a link: “Why does deleting this array copy skip a listener?” That is more specific than announcing another AI platform. A visitor can try a small lesson immediately, and a new verified lesson creates a substantive future update.

These are hypotheses. If people view a demo but do not try a lesson, first review the audience and explanation. If they try it but do not understand the result or want another lesson, improve the lesson before expanding the catalog. Stars are one outcome to observe alongside use and feedback.

## 中文摘要

首发选择“小而完整的 JavaScript 源码实验课”：看到失败、修改代码、运行行为检查、理解边界。借鉴热门项目的一句话用途、快速试用和具体结果；不把上游 star 当成我们的增长预测。源码教程、导览、在线编辑和 Agent 配置工具已有成熟竞品，差异应落在精选内容、可复现行为与低门槛体验。mitt 的数组复制是教学材料，上游并没有被我们发现这个 bug。
