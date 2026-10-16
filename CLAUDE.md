# CLAUDE.md: Learning Hub

Every session starts here. Read this file, CONTENT_GUIDE.md, STATUS.md and the relevant syllabus file before doing anything.

## What this is

A personal learning app for Raj, a data engineer working on legacy-system migration and Microsoft Fabric governance, moving toward streaming and modern data engineering. The goal is a **mental blueprint of data and AI tools and technologies**, not a coding course: what each thing is, why it exists, where it fits, what it connects to, when to use it and when NOT to. No practice work.

Work autonomously. Do not ask questions; where something is ambiguous, choose the most reasonable option, log it in CHANGELOG.md, and continue. Stop only at a usage limit or a blocker, and leave everything saved with the validator passing.

## Fixed decisions (do not revisit)

- No exercises, quizzes, projects, capstones, checkpoints, or in-browser code execution.
- Code snippets ONLY where a snippet clarifies the idea. Never force code.
- Nothing is locked or ordered. Every lesson in every track is reachable at any time.
- "I learned this" marks the lesson as learned and STAYS on that lesson (no auto-advance). It can be undone.
- Nine tracks, switchable at any time: pyspark, fabric, databricks, snowflake, sql, python, ml, ai, tools.
- fabric, databricks, snowflake are concept-only (no code). sql uses T-SQL and Oracle as primary dialects with Spark SQL and Snowflake callouts. python is an ecosystem map, not a syntax tutorial. ml modules carry visible Stage 0 to 5 roadmap labels (not enforced). tools is the "Tools and Technologies Landscape" organised by role in the architecture.
- One home lesson per concept. Other tracks give their own platform view and link to the home lesson through `Related`. Delta Lake's home is in pyspark.
- Dropped on purpose: SparkR (not PySpark), Koalas (merged into pandas API on Spark), Dataset as its own lesson (Scala/Java only; one conceptual note inside the RDD vs DataFrame lesson).
- Stack: plain HTML, CSS, JavaScript, no framework, no build step. Python 3 for tooling only. Content is Markdown. Served locally with `python -m http.server 8000`.

## Layout

```
index.html  app.css  app.js              the app
CLAUDE.md  CONTENT_GUIDE.md  CHANGELOG.md  README.md
STATUS.md                                generated, never edit by hand
syllabus/_format.md  syllabus/<track>.md the plan for each track
tools/validate.py                        validator, writes manifest and STATUS
tools/status_notes.md                    free notes appended to STATUS.md
content/manifest.json                    generated, never edit by hand
content/<track>/NN-module-name.md        lessons
```

## Resume protocol (every session starts here)

1. Read CLAUDE.md, CONTENT_GUIDE.md, STATUS.md and the relevant syllabus file.
2. Run `python tools/validate.py`. Fix errors before anything else.
3. Continue with the first unfinished item in this order: Phase A (foundation), then Phase B (syllabus for all tracks), then Phase C (lessons).
4. After each completed unit of work (a syllabus file, a module file) run the validator, fix errors, and make one git commit per unit.
5. Never rename or renumber an existing id. Never edit STATUS.md or manifest.json by hand.
6. Do not change the app or validator after Phase A unless a real bug is found; fix it, run the validator, log it in CHANGELOG.md.

Phase order for tracks (both B and C): **fabric, pyspark, tools, databricks, snowflake, sql, python, ml, ai**. Phase C goes module by module in that track order. Target lesson counts: fabric 32, pyspark 70, tools 40, databricks 32, snowflake 32, sql 35, python 30, ml 45, ai 35.

Working method: one module per cycle. Read the syllabus entries, research if the track needs it (fabric, databricks, snowflake, tools, ai need current sources), write the module file, validate, commit. If a usage limit is near, finish the current file in a valid state first. When everything is written: check cross-track Related links, resolve TODO:concept entries, write a final summary in CHANGELOG.md.

## Writing and accuracy rules (apply to every lesson)

1. Accuracy over fluency. Never invent features, version numbers, prices or product names. If you cannot confirm something, say so in the lesson or mark the title "(verify)".
2. fabric, databricks, snowflake, tools and ai lessons must be written from current sources found with web search or fetch, preferring official documentation. Set `verified` to the month you checked. Do not leave `verified: pending` in finished content.
3. Plain English, short sentences, no marketing wording. Explain the idea before the tool. State limits and when NOT to use the thing.
4. Each lesson is self-contained but ends with `Related` links to the home lesson of any concept it leans on, so concepts are explained once.
5. Mermaid: `flowchart LR` or `TD`, labels in double quotes. Add a diagram to "Where it fits" when it clarifies the architecture, not by default.
6. A lesson is typically 150 to 400 words plus optional snippet or table. Depth comes from correct, specific content and good connections, not length.
7. No practice tasks of any kind.
