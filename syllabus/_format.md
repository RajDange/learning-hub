# Syllabus format

One file per track: `syllabus/<track>.md`. Files starting with `_` are ignored by the validator.

```
# Track: <key> — <name>
## <key>-m01 — <Module name>
- <key>-m01-<slug> | <title> | <one-line scope> | code: yes|no | related: <ids or TODO:concept>
```

Rules:

- Exactly five `|`-separated fields per lesson line.
- The lesson id must belong to the module heading it sits under.
- `code: yes` means a snippet is likely useful; it is a hint, not a requirement. Concept-only tracks (fabric, databricks, snowflake, tools) always use `code: no`.
- `related:` lists comma-separated lesson ids from any track, or `TODO:<concept>` when the home lesson is not planned yet. Leave it as `related:` with nothing after it when there is nothing to link.
- Mark uncertain product or feature names with "(verify)" in the title or scope. Resolve them from current sources when the lesson is written.
- Other `#` headings and `>` notes are allowed and ignored.
- Never rename or renumber an id once a lesson with that id exists.
