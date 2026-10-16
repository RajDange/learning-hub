/* Learning Hub app. Plain JavaScript, no build step.
 * Reads content/manifest.json (written by tools/validate.py) and the module
 * Markdown files, and keeps progress in localStorage under one key. */
(function () {
  "use strict";

  var STORAGE_KEY = "learningHub.progress.v1";
  var SECTION_ORDER = ["What we're learning", "Benefit", "Where it fits", "Use case", "Code snippet",
    "Sample data", "Limits and misconceptions", "Compared with", "Remember this", "Related"];

  var el = function (id) { return document.getElementById(id); };
  var main = el("lesson");

  var manifest = null;
  var index = {};          // lesson id -> { track, module, meta, pos }
  var trackLessons = {};   // track key -> [lesson ids in order]
  var fileCache = {};      // module file -> Promise<parsed lessons map>
  var state = loadProgress();
  var current = { track: null, id: null };
  var filter = "all";
  var query = "";

  // ------------------------------------------------------------ progress

  function emptyProgress() { return { version: 1, learned: {}, last: {}, track: null }; }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyProgress();
      var p = JSON.parse(raw);
      return normaliseProgress(p) || emptyProgress();
    } catch (e) { return emptyProgress(); }
  }

  function normaliseProgress(p) {
    if (!p || typeof p !== "object" || typeof p.learned !== "object" || p.learned === null) return null;
    return {
      version: 1,
      learned: p.learned,
      last: (p.last && typeof p.last === "object") ? p.last : {},
      track: typeof p.track === "string" ? p.track : null
    };
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  }

  function isLearned(id) { return Object.prototype.hasOwnProperty.call(state.learned, id); }

  function countLearned(track) {
    return (trackLessons[track] || []).filter(isLearned).length;
  }

  // ------------------------------------------------------------ parsing

  /* Same rules as tools/validate.py: "# " outside a fence starts a lesson,
   * "key: value" lines before the first "##" are metadata, "## " outside a
   * fence starts a section. */
  function parseModule(text) {
    var lessons = {};
    var lines = text.replace(/\r\n?/g, "\n").split("\n");
    var fence = null, cur = null, sec = null, buf = [], inMeta = false;
    function closeSection() {
      if (cur && sec !== null) cur.sections.push({ name: sec, body: buf.join("\n").replace(/^\n+|\n+$/g, "") });
      sec = null; buf = [];
    }
    lines.forEach(function (raw) {
      var fm = raw.match(/^\s*(```+|~~~+)/);
      if (fm) {
        var marker = fm[1];
        if (fence === null) fence = marker;
        else if (marker[0] === fence[0] && marker.length >= fence.length && raw.trim() === marker) fence = null;
        if (sec !== null) buf.push(raw);
        return;
      }
      if (fence === null && raw.indexOf("# ") === 0) {
        closeSection();
        cur = { title: raw.slice(2).trim(), meta: {}, sections: [] };
        inMeta = true;
        return;
      }
      if (fence === null && raw.indexOf("## ") === 0) {
        if (!cur) return;
        closeSection();
        inMeta = false;
        sec = raw.slice(3).trim();
        return;
      }
      if (!cur) return;
      if (inMeta) {
        var mm = raw.trim().match(/^([a-z_]+):\s*(.*)$/);
        if (mm) {
          cur.meta[mm[1]] = mm[2].split(/\s{2,}\(/)[0].trim();
          if (mm[1] === "id") lessons[cur.meta.id] = cur;
        }
        return;
      }
      buf.push(raw);
    });
    closeSection();
    return lessons;
  }

  function loadModuleFile(file) {
    if (!fileCache[file]) {
      fileCache[file] = fetch(file, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("Could not load " + file + " (" + r.status + ")");
        return r.text();
      }).then(parseModule);
      fileCache[file].catch(function () { delete fileCache[file]; });
    }
    return fileCache[file];
  }

  // ------------------------------------------------------------ markdown

  var mermaidCount = 0;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function setupMarked() {
    if (!window.marked) return;
    var renderer = new marked.Renderer();
    var baseCode = renderer.code.bind(renderer);
    renderer.code = function (code, lang) {
      // marked 12 passes (code, infostring, escaped)
      if (typeof code === "object" && code !== null) { lang = code.lang; code = code.text; }
      if ((lang || "").trim().toLowerCase() === "mermaid") {
        return '<div class="mermaid" data-src="' + escapeHtml(code) + '">' + escapeHtml(code) + "</div>";
      }
      return baseCode.apply(null, arguments);
    };
    marked.setOptions({ renderer: renderer, gfm: true, breaks: false });
  }

  function md(text) {
    if (window.marked) return marked.parse(text || "");
    return "<pre>" + escapeHtml(text || "") + "</pre>";
  }

  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function renderMermaid(root) {
    if (!window.mermaid) return;
    var nodes = root.querySelectorAll(".mermaid");
    if (!nodes.length) return;
    try {
      mermaid.initialize({ startOnLoad: false, theme: isDark() ? "dark" : "neutral", securityLevel: "strict",
        flowchart: { htmlLabels: true, useMaxWidth: true } });
      nodes.forEach(function (n) { n.removeAttribute("data-processed"); n.id = "mmd-" + (++mermaidCount); });
      mermaid.run({ nodes: nodes }).catch(function (e) { console.warn("Mermaid:", e); });
    } catch (e) { console.warn("Mermaid:", e); }
  }

  // ------------------------------------------------------------ lookup

  function buildIndex() {
    manifest.tracks.forEach(function (t) {
      trackLessons[t.key] = [];
      t.modules.forEach(function (m) {
        m.lessons.forEach(function (l) {
          if (!l.id) return;
          index[l.id] = { track: t.key, module: m, meta: l, pos: trackLessons[t.key].length };
          trackLessons[t.key].push(l.id);
        });
      });
    });
  }

  function trackOf(key) {
    for (var i = 0; i < manifest.tracks.length; i++) if (manifest.tracks[i].key === key) return manifest.tracks[i];
    return null;
  }

  function trackName(key) { var t = trackOf(key); return t ? t.name : key; }

  function shortTrack(key) {
    return { pyspark: "PySpark", fabric: "Fabric", databricks: "Databricks", snowflake: "Snowflake", sql: "SQL",
      python: "Python", ml: "ML", ai: "AI", tools: "Tools" }[key] || key;
  }

  // ------------------------------------------------------------ header

  function renderTracks() {
    var nav = el("trackSwitcher");
    nav.innerHTML = "";
    manifest.tracks.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "track-tab";
      b.setAttribute("aria-current", t.key === current.track ? "true" : "false");
      b.title = t.name;
      var total = trackLessons[t.key].length;
      b.innerHTML = "<span>" + escapeHtml(shortTrack(t.key)) + "</span><span class=\"count\">" +
        countLearned(t.key) + "/" + total + "</span>";
      b.addEventListener("click", function () { switchTrack(t.key); });
      nav.appendChild(b);
    });
    var active = nav.querySelector('[aria-current="true"]');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
    renderProgress();
  }

  function renderProgress() {
    var t = current.track;
    var total = (trackLessons[t] || []).length;
    var done = countLearned(t);
    var pct = total ? Math.round((done / total) * 100) : 0;
    el("progressFill").style.width = pct + "%";
    el("progressBar").setAttribute("aria-valuenow", String(pct));
    el("progressBar").setAttribute("aria-label", trackName(t) + " progress");
    var planned = (trackOf(t) || {}).planned || 0;
    var label = trackName(t) + ": " + done + " of " + total + " learned";
    if (planned > total) label += " · " + (planned - total) + " more planned";
    el("progressLabel").textContent = label;
  }

  function updateHeaderOffset() {
    var h = document.querySelector(".site-header").offsetHeight;
    document.documentElement.style.setProperty("--header-offset", h + "px");
  }

  // ------------------------------------------------------------ sidebar

  function passesFilter(id) {
    if (filter === "todo") return !isLearned(id);
    if (filter === "done") return isLearned(id);
    return true;
  }

  function lessonLink(id, opts) {
    var info = index[id];
    var a = document.createElement("a");
    a.href = "#" + id;
    a.className = "lesson-link" + (isLearned(id) ? " learned" : "");
    if (id === current.id) a.setAttribute("aria-current", "page");
    var mark = isLearned(id) ? "✓" : "○";
    a.innerHTML = '<span class="mark" aria-hidden="true">' + mark + "</span><span>" + escapeHtml(info.meta.title) +
      "</span>" + (opts && opts.badge ? '<span class="track-badge">' + escapeHtml(shortTrack(info.track)) + "</span>" : "") +
      (isLearned(id) ? '<span class="visually-hidden"> (learned)</span>' : "");
    a.addEventListener("click", closeSidebarOnMobile);
    return a;
  }

  function renderSidebar() {
    var list = el("sidebarList");
    list.innerHTML = "";
    if (query) { renderSearch(list); return; }
    var t = trackOf(current.track);
    if (!t || !t.modules.length) {
      list.innerHTML = '<p class="empty-note">No lessons written for this track yet.' +
        (t && t.planned ? " " + t.planned + " are planned in the syllabus." : "") + "</p>";
      return;
    }
    var any = false;
    t.modules.forEach(function (m) {
      var ids = m.lessons.map(function (l) { return l.id; }).filter(function (id) { return id && index[id]; });
      var shown = ids.filter(passesFilter);
      if (!shown.length && filter !== "all") return;
      any = true;
      var d = document.createElement("details");
      d.className = "module";
      var hasCurrent = ids.indexOf(current.id) >= 0;
      d.open = hasCurrent || filter !== "all" || t.modules.length <= 2;
      var learned = ids.filter(isLearned).length;
      d.innerHTML = "<summary><span>" + escapeHtml(m.num + " · " + m.name) + '</span><span class="mcount">' +
        learned + "/" + ids.length + "</span></summary>";
      var ul = document.createElement("ul");
      shown.forEach(function (id) {
        var li = document.createElement("li");
        li.appendChild(lessonLink(id));
        ul.appendChild(li);
      });
      d.appendChild(ul);
      list.appendChild(d);
    });
    if (!any) list.innerHTML = '<p class="empty-note">No lessons match this filter.</p>';
    var cur = list.querySelector('[aria-current="page"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }

  function renderSearch(list) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var groups = {};
    var count = 0;
    Object.keys(index).forEach(function (id) {
      var info = index[id];
      var hay = (info.meta.title + " " + id + " " + info.meta.summary + " " + info.meta.remember + " " +
        info.module.name + " " + trackName(info.track)).toLowerCase();
      if (!terms.every(function (term) { return hay.indexOf(term) >= 0; })) return;
      if (!passesFilter(id)) return;
      (groups[info.track] = groups[info.track] || []).push(id);
      count++;
    });
    var wrap = document.createElement("div");
    wrap.className = "search-results";
    wrap.setAttribute("aria-live", "polite");
    if (!count) {
      wrap.innerHTML = '<p class="empty-note">No lessons match “' + escapeHtml(query) + "”.</p>";
    }
    manifest.tracks.forEach(function (t) {
      var ids = groups[t.key];
      if (!ids) return;
      var h = document.createElement("h3");
      h.textContent = t.name + " (" + ids.length + ")";
      wrap.appendChild(h);
      var ul = document.createElement("ul");
      ids.forEach(function (id) {
        var li = document.createElement("li");
        li.appendChild(lessonLink(id));
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    });
    list.appendChild(wrap);
  }

  // ------------------------------------------------------------ lesson view

  function renderRelated(body) {
    var ids = body.split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var wrap = document.createElement("div");
    wrap.className = "related-list";
    ids.forEach(function (rid) {
      var info = index[rid];
      if (info) {
        var a = document.createElement("a");
        a.href = "#" + rid;
        a.innerHTML = "<span>" + escapeHtml(info.meta.title) + '</span><span class="rtrack">' +
          escapeHtml(shortTrack(info.track)) + "</span>";
        wrap.appendChild(a);
      } else {
        var s = document.createElement("span");
        s.className = "missing";
        var planned = manifest.planned && manifest.planned[rid];
        s.title = planned ? "Planned, not written yet" : "Unknown lesson id";
        s.innerHTML = "<span>" + escapeHtml(planned ? planned.title : rid) + '</span><span class="rtrack">' +
          (planned ? "planned" : "unknown") + "</span>";
        wrap.appendChild(s);
      }
    });
    return wrap;
  }

  function renderLesson(id) {
    var info = index[id];
    current.id = id;
    current.track = info.track;
    state.track = info.track;
    state.last[info.track] = id;
    saveProgress();
    renderTracks();
    renderSidebar();
    main.innerHTML = '<div class="loading">Loading…</div>';
    return loadModuleFile(info.module.file).then(function (lessons) {
      if (current.id !== id) return;
      var les = lessons[id];
      if (!les) throw new Error("Lesson " + id + " was not found in " + info.module.file + ". Run python tools/validate.py.");
      var art = document.createElement("article");
      art.className = "lesson";

      var chips = '<div class="chips"><span class="chip track">' + escapeHtml(trackName(info.track)) + "</span>" +
        '<span class="chip">Module ' + escapeHtml(info.module.num + " · " + info.module.name) + "</span>";
      var v = les.meta.verified;
      if (v) chips += '<span class="chip' + (v === "pending" ? " pending" : "") + '">' +
        (v === "pending" ? "Verification pending" : "Verified " + escapeHtml(formatMonth(v))) + "</span>";
      chips += "</div>";
      art.innerHTML = chips + "<h1>" + escapeHtml(les.title) + "</h1>";

      var actions = document.createElement("div");
      actions.className = "lesson-actions";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "learn-btn";
      var note = document.createElement("span");
      note.className = "learned-note";
      function sync() {
        var on = isLearned(id);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.textContent = on ? "✓ Learned" : "I learned this";
        note.textContent = on ? "Marked " + formatDate(state.learned[id]) + ". Click again to undo." : "";
      }
      btn.addEventListener("click", function () {
        if (isLearned(id)) delete state.learned[id];
        else state.learned[id] = new Date().toISOString();
        saveProgress();
        sync();
        renderTracks();
        renderSidebar();
      });
      sync();
      actions.appendChild(btn);
      actions.appendChild(note);
      art.appendChild(actions);

      var sections = les.sections.slice().sort(function (a, b) {
        var ia = SECTION_ORDER.indexOf(a.name), ib = SECTION_ORDER.indexOf(b.name);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      sections.forEach(function (s) {
        if (!s.body.trim()) return;
        var sec = document.createElement("section");
        sec.className = "section" + (s.name === "Remember this" ? " remember" : "");
        var h = document.createElement("h2");
        h.textContent = s.name;
        sec.appendChild(h);
        if (s.name === "Related") {
          sec.appendChild(renderRelated(s.body));
        } else {
          var div = document.createElement("div");
          div.className = "prose";
          div.innerHTML = md(s.body);
          sec.appendChild(div);
        }
        art.appendChild(sec);
      });

      art.appendChild(renderPager(id));
      main.innerHTML = "";
      main.appendChild(art);
      document.title = les.title + " · Learning Hub";
      renderMermaid(art);
      window.scrollTo(0, 0);
    }).catch(function (e) {
      showNotice("Could not open this lesson", "<p>" + escapeHtml(e.message) + "</p>");
    });
  }

  function renderPager(id) {
    var ids = trackLessons[index[id].track];
    var pos = ids.indexOf(id);
    var nav = document.createElement("nav");
    nav.className = "pager";
    nav.setAttribute("aria-label", "Neighbouring lessons");
    if (pos > 0) {
      var p = ids[pos - 1];
      nav.innerHTML += '<a class="prev" href="#' + p + '"><small>Previous</small>' + escapeHtml(index[p].meta.title) + "</a>";
    }
    if (pos < ids.length - 1) {
      var n = ids[pos + 1];
      nav.innerHTML += '<a class="next" href="#' + n + '"><small>Next</small>' + escapeHtml(index[n].meta.title) + "</a>";
    }
    return nav;
  }

  function renderEmptyTrack(key) {
    current.track = key;
    current.id = null;
    state.track = key;
    saveProgress();
    renderTracks();
    renderSidebar();
    var t = trackOf(key);
    showNotice(t.name, "<p>No lessons have been written for this track yet." +
      (t.planned ? " The syllabus plans " + t.planned + " lessons." : "") + "</p>");
  }

  function formatMonth(v) {
    var m = /^(\d{4})-(\d{2})$/.exec(v);
    if (!m) return v;
    var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return names[parseInt(m[2], 10) - 1] + " " + m[1];
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "earlier";
    return "on " + d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function showNotice(title, html) {
    main.innerHTML = '<div class="notice"><h1>' + escapeHtml(title) + "</h1>" + html + "</div>";
  }

  // ------------------------------------------------------------ routing

  function firstLessonOf(track) { return (trackLessons[track] || [])[0] || null; }

  function switchTrack(key) {
    var target = state.last[key] && index[state.last[key]] ? state.last[key] : firstLessonOf(key);
    if (target) {
      if (location.hash === "#" + target) renderLesson(target);
      else location.hash = target;
    } else {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      renderEmptyTrack(key);
    }
  }

  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (h && index[h]) { renderLesson(h); return; }
    if (h && trackOf(h)) { switchTrack(h); return; }
    var track = state.track && trackOf(state.track) ? state.track : null;
    if (!track) {
      for (var i = 0; i < manifest.tracks.length; i++) {
        if (trackLessons[manifest.tracks[i].key].length) { track = manifest.tracks[i].key; break; }
      }
    }
    if (!track) {
      current.track = manifest.tracks[0].key;
      renderTracks();
      renderSidebar();
      showNotice("No lessons yet", "<p>Write lessons under <code>content/&lt;track&gt;/</code>, then run " +
        "<code>python tools/validate.py</code> to rebuild the manifest.</p>");
      return;
    }
    if (h) history.replaceState(null, "", location.pathname + location.search);
    switchTrack(track);
  }

  // ------------------------------------------------------------ export / import

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function exportProgress() {
    var data = JSON.stringify({ app: "learning-hub", exported: new Date().toISOString(), progress: state }, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "learning-hub-progress-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var p = normaliseProgress(data && data.progress ? data.progress : data);
        if (!p) throw new Error("not a Learning Hub progress file");
        var n = Object.keys(p.learned).length;
        if (!confirm("Replace your current progress with " + n + " learned lessons from this file?")) return;
        state = p;
        saveProgress();
        toast("Imported " + n + " learned lessons.");
        if (current.id) renderLesson(current.id); else route();
      } catch (e) {
        alert("Import failed: " + e.message);
      }
    };
    reader.readAsText(file);
  }

  // ------------------------------------------------------------ sidebar on mobile

  function openSidebar(open) {
    var sb = el("sidebar");
    sb.classList.toggle("open", open);
    el("scrim").hidden = !open;
    el("sidebarToggle").setAttribute("aria-expanded", open ? "true" : "false");
    if (open) el("search").focus();
  }
  function closeSidebarOnMobile() { if (window.innerWidth <= 860) openSidebar(false); }

  // ------------------------------------------------------------ boot

  function wire() {
    el("exportBtn").addEventListener("click", exportProgress);
    el("importBtn").addEventListener("click", function () { el("importFile").click(); });
    el("importFile").addEventListener("change", function (e) {
      if (e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = "";
    });
    var timer = null;
    el("search").addEventListener("input", function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () { query = e.target.value.trim(); renderSidebar(); }, 120);
    });
    el("search").addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.target.value = ""; query = ""; renderSidebar(); }
    });
    document.querySelectorAll('input[name="filter"]').forEach(function (r) {
      r.addEventListener("change", function () { filter = r.value; renderSidebar(); });
    });
    el("sidebarToggle").addEventListener("click", function () {
      openSidebar(!el("sidebar").classList.contains("open"));
    });
    el("scrim").addEventListener("click", function () { openSidebar(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el("sidebar").classList.contains("open")) openSidebar(false);
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") { e.preventDefault(); el("search").focus(); }
    });
    el("brandLink").addEventListener("click", function (e) {
      e.preventDefault();
      if (current.track) switchTrack(current.track);
    });
    window.addEventListener("hashchange", route);
    window.addEventListener("resize", updateHeaderOffset);
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var rerender = function () { if (current.id) renderLesson(current.id); };
      if (mq.addEventListener) mq.addEventListener("change", rerender);
    }
  }

  function boot() {
    if (location.protocol === "file:") {
      showNotice("Please open Learning Hub through a local server",
        "<p>Browsers block the app from reading its lesson files when the page is opened directly from disk. " +
        "Start a server in the <code>learning-hub</code> folder:</p><pre>python -m http.server 8000</pre>" +
        "<p>Then open <a href=\"http://localhost:8000/\">http://localhost:8000/</a>.</p>");
      return;
    }
    setupMarked();
    wire();
    updateHeaderOffset();
    fetch("content/manifest.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("content/manifest.json returned " + r.status);
      return r.json();
    }).then(function (m) {
      manifest = m;
      buildIndex();
      route();
      updateHeaderOffset();
      if (!window.marked) toast("Markdown library did not load; showing plain text.");
    }).catch(function (e) {
      showNotice("Could not load the lesson manifest",
        "<p>" + escapeHtml(e.message) + "</p><p>Run <code>python tools/validate.py</code> to generate it, " +
        "and serve the folder with <code>python -m http.server 8000</code>.</p>");
    });
  }

  boot();
})();
