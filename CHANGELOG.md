# Changelog

## 2026-10-16: Phase A, foundation

### Fixed decisions (from the master prompt; do not revisit)
- No exercises, quizzes, projects, capstones, checkpoints, or in-browser code execution.
- Code snippets only where a snippet clarifies the idea.
- Nothing is locked or ordered; every lesson is reachable at any time.
- "I learned this" marks the lesson and stays on it; it can be undone.
- Nine tracks: pyspark, fabric, databricks, snowflake, sql, python, ml, ai, tools.
- fabric, databricks, snowflake (and tools) are concept-only. sql: T-SQL and Oracle primary, Spark SQL and Snowflake callouts. python is an ecosystem map. ml modules carry Stage 0 to 5 labels. tools is organised by role in the architecture.
- One home lesson per concept; Delta Lake's home is in pyspark.
- Dropped on purpose: SparkR, Koalas, Dataset as its own lesson.
- Stack: plain HTML/CSS/JS, no build step; Python 3 for tooling; Markdown content; served with `python -m http.server 8000`.

### Choices made during Phase A
- Initialised a local git repository so the resume protocol can commit one unit at a time. Nothing is pushed anywhere.
- marked 12.0.2 and mermaid 10.9.1 are loaded from cdn.jsdelivr.net with pinned versions. If marked fails to load, lessons show as plain text.
- The manifest stores titles, a one-sentence summary and the "Remember this" sentence for every lesson, so search covers all tracks without loading every file. Lesson bodies are fetched per module file and parsed in the browser with the same rules as the validator.
- Module display names come from the syllabus module heading when present (so ml shows "Stage N: ..."), otherwise from the file name.
- Track tabs show learned / written lessons; the progress line also shows how many more are planned.
- Progress lives in localStorage key `learningHub.progress.v1`. Import replaces current progress after a confirmation.
- The validator also errors when an id's module number does not match the file number, when `track:` does not match the folder, and when `verified` is not `YYYY-MM` or `pending`. It treats `TODO:` related entries as warnings in lessons and allows them in the syllabus.
- `tools/status_notes.md` holds free-text notes that the validator appends to STATUS.md, because STATUS.md itself is generated.
- Added `.claude/launch.json` so the preview server can be started from the desktop app.
- Three sample lessons were created (pyspark with a snippet, fabric without code, tools with a Mermaid diagram) to test the parser and the app. They will be deleted when the real first module of each track is written.

## 2026-10-16: Phase B, syllabus

All nine syllabus files written; validator clean (443 planned lessons, 0 errors).

### Choices made during Phase B
- Lesson counts exceed the targets (planned / target): fabric 50/32, pyspark 82/70, tools 52/40, databricks 38/32, snowflake 38/32, sql 48/35, python 34/30, ml 50/45, ai 51/35. The track outlines list more distinct ideas than the targets allow, and "do not drop any" plus "one idea per lesson" won over the targets. Trivial items were merged (for example rollup and cube into groupBy, compression into file formats, continuous processing into triggers, backpressure into exactly-once).
- Modules follow the outlines exactly, so some module files will hold fewer than 6 lessons (for example fabric ALM with 3) and a few more than 10 (pyspark performance 11, fabric governance 12, ml classical algorithms 14). Keeping the outline's module boundaries was judged more useful for navigation than the 6 to 10 rule.
- Eventhouse appears in the fabric storage outline and in Real-Time Intelligence. Its home lesson is `fabric-m05-eventhouse-kql`; the storage choice is covered in `fabric-m10-lakehouse-vs-warehouse`.
- Cross-platform comparison home: `fabric-m10-fabric-vs-databricks-vs-snowflake`. Databricks and Snowflake each have a shorter "from our side" lesson that links to it.
- Concept versus tool homes: ML concepts (experiment tracking, feature stores, serving) live in ml; products (MLflow, Feast and so on) in tools; vector search concept in ai, products in tools.
- Added `.gitattributes` to keep line endings as LF.

## Phase C log

- 2026-10-16: pyspark m01 written; it replaced the pyspark sample lesson. PySpark modules are written while research agents gather current sources for fabric, so the fabric-first order is kept for research but not for writing time.
- 2026-10-16: fabric m01 written from Microsoft Learn sources checked by research agents; it replaced the fabric sample lesson.
- 2026-10-16: fabric track complete (50 lessons). Several statuses conflicted between Microsoft pages (OneLake security GA, data agent GA, native execution engine wording); lessons state the conflict instead of picking one.
- 2026-10-16: pyspark track complete (82 lessons). Spark 4.1 real-time mode added to streaming lessons after tools research confirmed it.
