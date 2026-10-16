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
