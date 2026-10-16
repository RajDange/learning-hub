# Learning Hub

A personal map of data and AI tools and technologies: what each thing is, why it exists, where it fits, and when not to use it. Nine tracks: PySpark, Microsoft Fabric, Databricks, Snowflake, SQL, Python, Machine Learning, AI, and a Tools and Technologies Landscape.

## Requirements

- Python 3.9 or newer (only for the validator and the local server).
- A modern browser. Markdown and diagrams are rendered with `marked` and `mermaid` loaded from a CDN, so the first load needs internet access.

## Run

From this folder:

```bash
python tools/validate.py
```

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in your browser. Opening `index.html` directly from disk does not work, because browsers block it from reading the lesson files; the page shows a message if you try.

## Using the app

- Pick a track in the header. Each tab shows learned / written lessons.
- The sidebar lists the active track's modules. Search (press `/`) looks across all tracks. The filter shows all, not learned, or learned lessons.
- "I learned this" marks the current lesson and stays on it. Click again to undo.
- Progress is kept in your browser's localStorage. Use Export progress to save a JSON file and Import progress to restore it (for example on another browser).
- Links look like `#fabric-m02-lakehouse`, so any lesson can be bookmarked.

## Adding or editing content

See CONTENT_GUIDE.md for the lesson format and writing rules, and `syllabus/_format.md` for the syllabus format. After any change run `python tools/validate.py`; it checks the files and regenerates `content/manifest.json` and `STATUS.md`. Never edit those two files by hand.

## Install on a phone

The app is a Progressive Web App. Open the hosted site in Chrome on Android (or Safari on iPhone), then choose **Install app** (Chrome menu) or **Add to Home Screen** (Safari share menu). After the first visit every lesson is cached, so it also works offline. Progress is stored per device; use Export and Import progress to move it between devices.
