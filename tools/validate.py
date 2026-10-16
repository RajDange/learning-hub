#!/usr/bin/env python3
"""Learning Hub validator.

Parses every lesson file under content/<track>/NN-module-name.md and every
syllabus file under syllabus/<track>.md, reports problems, and writes the
generated files content/manifest.json and STATUS.md.

Exit code is non-zero when any error is found.

Usage:  python tools/validate.py
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SYLLABUS = ROOT / "syllabus"

TRACK_ORDER = ["pyspark", "fabric", "databricks", "snowflake", "sql", "python", "ml", "ai", "tools"]
DEFAULT_TRACK_NAMES = {
    "pyspark": "PySpark",
    "fabric": "Microsoft Fabric",
    "databricks": "Databricks",
    "snowflake": "Snowflake",
    "sql": "SQL",
    "python": "Python",
    "ml": "Machine Learning",
    "ai": "AI",
    "tools": "Tools and Technologies Landscape",
}
VERIFIED_REQUIRED = {"fabric", "databricks", "snowflake", "tools", "ai"}

KNOWN_SECTIONS = [
    "What we're learning",
    "Benefit",
    "Where it fits",
    "Use case",
    "Code snippet",
    "Sample data",
    "Limits and misconceptions",
    "Compared with",
    "Remember this",
    "Related",
]
REQUIRED_SECTIONS = ["What we're learning", "Benefit", "Remember this"]

ID_RE = re.compile(r"^(?P<track>[a-z]+)-m(?P<module>\d{2})-(?P<slug>[a-z0-9]+(?:-[a-z0-9]+)*)$")
MODULE_FILE_RE = re.compile(r"^(?P<num>\d{2})-(?P<slug>[a-z0-9]+(?:-[a-z0-9]+)*)\.md$")
VERIFIED_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
FENCE_RE = re.compile(r"^\s*(```+|~~~+)")
META_RE = re.compile(r"^(?P<key>[a-z_]+):\s*(?P<value>.*)$")

SYL_TRACK_RE = re.compile(r"^#\s+Track:\s*(?P<key>[a-z]+)\s*[—–-]+\s*(?P<name>.+?)\s*$")
SYL_MODULE_RE = re.compile(r"^##\s+(?P<key>[a-z]+-m\d{2})\s*[—–-]+\s*(?P<name>.+?)\s*$")


@dataclass
class Lesson:
    id: str
    title: str
    track: str
    file: str
    line: int
    meta: dict = field(default_factory=dict)
    sections: list = field(default_factory=list)  # list of (name, body)

    def section(self, name: str) -> str:
        for n, body in self.sections:
            if n == name:
                return body
        return ""


@dataclass
class PlannedLesson:
    id: str
    title: str
    scope: str
    code: str
    related: list
    module: str
    line: int


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.by_track: dict[str, list[str]] = {t: [] for t in TRACK_ORDER}

    def error(self, msg: str, track: str | None = None) -> None:
        self.errors.append(msg)
        if track in self.by_track:
            self.by_track[track].append("ERROR " + msg)

    def warn(self, msg: str, track: str | None = None) -> None:
        self.warnings.append(msg)
        if track in self.by_track:
            self.by_track[track].append("warning " + msg)


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


# ---------------------------------------------------------------- lessons

def parse_lesson_file(path: Path, track: str, report: Report) -> list[Lesson]:
    lessons: list[Lesson] = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    fence: str | None = None
    fence_line = 0
    current: Lesson | None = None
    sec_name: str | None = None
    sec_lines: list[str] = []
    in_meta = False

    def close_section() -> None:
        nonlocal sec_name, sec_lines
        if current is not None and sec_name is not None:
            current.sections.append((sec_name, "\n".join(sec_lines).strip("\n")))
        sec_name, sec_lines = None, []

    for i, raw in enumerate(lines, start=1):
        m = FENCE_RE.match(raw)
        if m:
            marker = m.group(1)
            if fence is None:
                fence, fence_line = marker, i
            elif marker[0] == fence[0] and len(marker) >= len(fence) and raw.strip() == marker:
                fence = None
            if sec_name is not None:
                sec_lines.append(raw)
            elif current is not None and in_meta and raw.strip():
                report.error(f"{rel(path)}:{i}: code fence before the first section in '{current.title}'", track)
            continue

        if fence is None and raw.startswith("# "):
            close_section()
            current = Lesson(id="", title=raw[2:].strip(), track=track, file=rel(path), line=i)
            lessons.append(current)
            in_meta = True
            continue

        if fence is None and raw.startswith("## "):
            if current is None:
                report.error(f"{rel(path)}:{i}: section before any lesson title", track)
                continue
            close_section()
            in_meta = False
            sec_name = raw[3:].strip()
            continue

        if current is None:
            if raw.strip():
                report.error(f"{rel(path)}:{i}: text before the first lesson title", track)
            continue

        if in_meta:
            if not raw.strip():
                continue
            mm = META_RE.match(raw.strip())
            if mm:
                key = mm.group("key")
                value = re.split(r"\s{2,}\(", mm.group("value"))[0].strip()
                if key in current.meta:
                    report.error(f"{rel(path)}:{i}: duplicate metadata '{key}' in '{current.title}'", track)
                current.meta[key] = value
            else:
                report.error(f"{rel(path)}:{i}: unexpected text before first section in '{current.title}': {raw.strip()[:60]}", track)
            continue

        sec_lines.append(raw)

    close_section()
    if fence is not None:
        report.error(f"{rel(path)}:{fence_line}: unclosed code fence", track)

    for les in lessons:
        les.id = les.meta.get("id", "")
    return lessons


def check_lesson(les: Lesson, module_num: str, report: Report) -> None:
    where = f"{les.file}:{les.line}"
    t = les.track
    if not les.id:
        report.error(f"{where}: lesson '{les.title}' has no id", t)
    else:
        m = ID_RE.match(les.id)
        if not m:
            report.error(f"{where}: bad id '{les.id}' (expected <track>-m<NN>-<slug>)", t)
        else:
            if m.group("track") != t:
                report.error(f"{where}: id '{les.id}' does not match folder '{t}'", t)
            if m.group("module") != module_num:
                report.error(f"{where}: id '{les.id}' module number does not match file number {module_num}", t)
    if les.meta.get("track") != t:
        report.error(f"{where}: track metadata '{les.meta.get('track')}' does not match folder '{t}'", t)

    verified = les.meta.get("verified")
    if t in VERIFIED_REQUIRED and not verified:
        report.error(f"{where}: '{les.id}' is missing 'verified' (required for {t})", t)
    if verified:
        if verified == "pending":
            report.warn(f"{where}: '{les.id}' has verified: pending", t)
        elif not VERIFIED_RE.match(verified):
            report.error(f"{where}: '{les.id}' verified '{verified}' is not YYYY-MM or pending", t)

    seen: set[str] = set()
    for name, body in les.sections:
        if name in seen:
            report.error(f"{where}: '{les.id}' has duplicate section '{name}'", t)
        seen.add(name)
        if name not in KNOWN_SECTIONS:
            report.warn(f"{where}: '{les.id}' has unknown section '{name}'", t)
        if name in REQUIRED_SECTIONS and not body.strip():
            report.error(f"{where}: '{les.id}' section '{name}' is empty", t)
    for req in REQUIRED_SECTIONS:
        if req not in seen:
            report.error(f"{where}: '{les.id}' is missing required section '{req}'", t)


def related_ids(body: str) -> list[str]:
    return [x.strip() for x in re.split(r"[,\n]", body) if x.strip()]


# ---------------------------------------------------------------- syllabus

def parse_syllabus(path: Path, report: Report):
    track_key = path.stem
    name = DEFAULT_TRACK_NAMES.get(track_key, track_key)
    modules: list[dict] = []
    planned: list[PlannedLesson] = []
    current_module: dict | None = None
    header_seen = False
    for i, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.rstrip()
        if not line.strip():
            continue
        m = SYL_TRACK_RE.match(line)
        if m:
            header_seen = True
            if m.group("key") != track_key:
                report.error(f"{rel(path)}:{i}: track key '{m.group('key')}' does not match file name", track_key)
            name = m.group("name")
            continue
        m = SYL_MODULE_RE.match(line)
        if m:
            if not m.group("key").startswith(track_key + "-m"):
                report.error(f"{rel(path)}:{i}: module '{m.group('key')}' does not belong to track '{track_key}'", track_key)
            current_module = {"key": m.group("key"), "num": m.group("key")[-2:], "name": m.group("name")}
            modules.append(current_module)
            continue
        if line.startswith("- "):
            parts = [p.strip() for p in line[2:].split("|")]
            if len(parts) != 5:
                report.error(f"{rel(path)}:{i}: syllabus line needs 5 '|' fields, found {len(parts)}", track_key)
                continue
            lid, title, scope, code, related = parts
            mi = ID_RE.match(lid)
            if not mi or mi.group("track") != track_key:
                report.error(f"{rel(path)}:{i}: bad syllabus id '{lid}'", track_key)
                continue
            if current_module is None or mi.group("module") != current_module["num"]:
                report.error(f"{rel(path)}:{i}: '{lid}' is not under its module heading", track_key)
            if not re.match(r"^code:\s*(yes|no)$", code):
                report.error(f"{rel(path)}:{i}: '{lid}' code field must be 'code: yes' or 'code: no'", track_key)
            if not related.startswith("related:"):
                report.error(f"{rel(path)}:{i}: '{lid}' related field must start with 'related:'", track_key)
            rel_list = related_ids(related[len("related:"):])
            planned.append(PlannedLesson(lid, title, scope, code.split(":")[1].strip(), rel_list,
                                         current_module["key"] if current_module else "", i))
            continue
        if line.startswith("#") or line.startswith(">"):
            continue
        report.warn(f"{rel(path)}:{i}: unrecognised syllabus line: {line[:60]}", track_key)
    if not header_seen:
        report.error(f"{rel(path)}: missing '# Track: <key> — <name>' header", track_key)
    return name, modules, planned


# ---------------------------------------------------------------- helpers

def first_sentence(md: str, limit: int = 220) -> str:
    text = re.sub(r"```.*?```", " ", md, flags=re.S)
    text = re.sub(r"[`*_>#|\[\]]", "", text)
    text = re.sub(r"\(https?://[^)]*\)", "", text)
    text = " ".join(text.split())
    m = re.match(r"(.+?[.!?])(\s|$)", text)
    s = m.group(1) if m else text
    return s[:limit]


def module_title_from_file(slug: str) -> str:
    words = slug.split("-")
    return " ".join(w.capitalize() if i == 0 else w for i, w in enumerate(words))


# ---------------------------------------------------------------- main

def main() -> int:
    report = Report()

    # syllabus
    syllabus: dict[str, dict] = {}
    if SYLLABUS.exists():
        for path in sorted(SYLLABUS.glob("*.md")):
            if path.name.startswith("_"):
                continue
            if path.stem not in TRACK_ORDER:
                report.warn(f"{rel(path)}: unknown track file")
                continue
            name, modules, planned = parse_syllabus(path, report)
            syllabus[path.stem] = {"name": name, "modules": modules, "planned": planned}
    planned_ids: dict[str, PlannedLesson] = {}
    for t, s in syllabus.items():
        for p in s["planned"]:
            if p.id in planned_ids:
                report.error(f"syllabus/{t}.md:{p.line}: duplicate syllabus id '{p.id}'", t)
            planned_ids[p.id] = p

    # lessons
    lessons: dict[str, Lesson] = {}
    manifest_tracks = []
    for t in TRACK_ORDER:
        tdir = CONTENT / t
        modules_out = []
        if tdir.exists():
            for path in sorted(tdir.glob("*.md")):
                mf = MODULE_FILE_RE.match(path.name)
                if not mf:
                    report.error(f"{rel(path)}: module file name must be NN-module-name.md", t)
                    continue
                num = mf.group("num")
                parsed = parse_lesson_file(path, t, report)
                if not parsed:
                    report.warn(f"{rel(path)}: no lessons found", t)
                out_lessons = []
                for les in parsed:
                    check_lesson(les, num, report)
                    if les.id:
                        if les.id in lessons:
                            report.error(f"{les.file}:{les.line}: duplicate id '{les.id}' (also in {lessons[les.id].file})", t)
                        else:
                            lessons[les.id] = les
                    if les.id and les.id not in planned_ids:
                        report.warn(f"{les.file}:{les.line}: '{les.id}' is not in the syllabus", t)
                    out_lessons.append({
                        "id": les.id,
                        "title": les.title,
                        "verified": les.meta.get("verified", ""),
                        "summary": first_sentence(les.section("What we're learning")),
                        "remember": first_sentence(les.section("Remember this"), 300),
                    })
                syl_mod = next((m for m in syllabus.get(t, {}).get("modules", []) if m["num"] == num), None)
                modules_out.append({
                    "key": f"{t}-m{num}",
                    "num": num,
                    "name": syl_mod["name"] if syl_mod else module_title_from_file(mf.group("slug")),
                    "file": rel(path),
                    "lessons": out_lessons,
                })
        s = syllabus.get(t)
        manifest_tracks.append({
            "key": t,
            "name": s["name"] if s else DEFAULT_TRACK_NAMES[t],
            "planned": len(s["planned"]) if s else 0,
            "modules": modules_out,
        })

    # related links
    known = set(lessons) | set(planned_ids)
    for les in lessons.values():
        for rid in related_ids(les.section("Related")):
            if rid.startswith("TODO:"):
                report.warn(f"{les.file}:{les.line}: '{les.id}' has unresolved related '{rid}'", les.track)
            elif rid not in known:
                report.error(f"{les.file}:{les.line}: '{les.id}' related id '{rid}' exists nowhere", les.track)
    for p in planned_ids.values():
        t = p.id.split("-")[0]
        for rid in p.related:
            if rid.startswith("TODO:"):
                continue
            if rid not in known:
                report.error(f"syllabus/{t}.md:{p.line}: '{p.id}' related id '{rid}' exists nowhere", t)

    # manifest
    manifest = {"generated_by": "tools/validate.py", "tracks": manifest_tracks,
                "planned": {pid: {"title": p.title, "track": pid.split("-")[0]} for pid, p in planned_ids.items()}}
    CONTENT.mkdir(exist_ok=True)
    (CONTENT / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    # status
    out = ["# STATUS", "", "Generated by `python tools/validate.py`. Do not edit by hand.", ""]
    total_written = sum(len(m["lessons"]) for tr in manifest_tracks for m in tr["modules"])
    total_planned = len(planned_ids)
    out.append(f"Overall: {total_written} lessons written, {total_planned} planned in syllabus, "
               f"{len(report.errors)} errors, {len(report.warnings)} warnings.")
    out.append("")
    out.append("| Track | Written | Planned | Remaining |")
    out.append("|---|---|---|---|")
    for tr in manifest_tracks:
        written_ids = {l["id"] for m in tr["modules"] for l in m["lessons"]}
        planned_t = [p for p in planned_ids.values() if p.id.startswith(tr["key"] + "-")]
        remaining = [p for p in planned_t if p.id not in written_ids]
        out.append(f"| {tr['key']} | {len(written_ids)} | {len(planned_t)} | {len(remaining)} |")
    out.append("")
    for tr in manifest_tracks:
        t = tr["key"]
        written_ids = {l["id"] for m in tr["modules"] for l in m["lessons"]}
        planned_t = [p for p in planned_ids.values() if p.id.startswith(t + "-")]
        remaining = [p for p in planned_t if p.id not in written_ids]
        out.append(f"## {t}: {tr['name']}")
        out.append("")
        out.append(f"- Syllabus: {'yes' if t in syllabus else 'not written'}")
        out.append(f"- Written: {len(written_ids)}; remaining of planned: {len(remaining)} of {len(planned_t)}")
        if remaining:
            nxt = ", ".join(p.id for p in remaining[:8])
            out.append(f"- Next unwritten: {nxt}")
        probs = report.by_track.get(t, [])
        if probs:
            out.append(f"- Problems ({len(probs)}):")
            for p in probs[:30]:
                out.append(f"  - {p}")
            if len(probs) > 30:
                out.append(f"  - ... and {len(probs) - 30} more")
        else:
            out.append("- Problems: none")
        out.append("")
    other = [e for e in report.errors if not any(e in v[6:] for v in sum(report.by_track.values(), []))]
    if other:
        out.append("## Other problems")
        out.extend(f"- {e}" for e in other)
        out.append("")
    notes = ROOT / "tools" / "status_notes.md"
    if notes.exists():
        out.append("## Notes")
        out.append("")
        out.append(notes.read_text(encoding="utf-8").strip())
        out.append("")
    (ROOT / "STATUS.md").write_text("\n".join(out), encoding="utf-8")

    for w in report.warnings:
        print("warning:", w)
    for e in report.errors:
        print("ERROR:", e)
    print(f"\n{len(lessons)} lessons, {total_planned} planned, {len(report.errors)} errors, {len(report.warnings)} warnings.")
    return 1 if report.errors else 0


if __name__ == "__main__":
    sys.exit(main())
