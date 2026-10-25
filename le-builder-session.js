/* Undo / redo, dirty mark, and recoverable drafts for Skill + VFX. */
(function () {
  "use strict";

  const MAX = 80;
  const COALESCE_MS = 400;
  const DRAFT_MS = 800;
  const KEYS = { skill: "vaerun-draft-skill", vfx: "vaerun-draft-vfx" };
  const IDB_NAME = "vaerun-builder";
  const IDB_STORE = "drafts";

  const lanes = {
    skill: emptyLane(),
    vfx: emptyLane(),
  };
  let restoring = false;
  let inited = false;
  let draftOffer = { skill: null, vfx: null };

  function emptyLane() {
    return { stack: [], index: -1, saved: "", timer: 0, draftTimer: 0 };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function mode() {
    return document.querySelector('input[name="le_builder_mode"]:checked')?.value || "";
  }

  function laneId() {
    const m = mode();
    if (m === "skill_stages") return "skill";
    if (m === "particles") return "vfx";
    return "";
  }

  function capture(id) {
    const lane = id || laneId();
    try {
      if (lane === "skill") {
        if (typeof buildSkillFlowDocLe !== "function") return null;
        return JSON.stringify(buildSkillFlowDocLe());
      }
      if (lane === "vfx") {
        const fn = window.leParticleStudioExport;
        if (typeof fn !== "function") return null;
        return JSON.stringify(fn());
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function apply(lane, text) {
    restoring = true;
    if (typeof LE_SK_FLOW !== "undefined") LE_SK_FLOW.batch = true;
    try {
      const doc = JSON.parse(text);
      if (lane === "skill") {
        if (typeof importSkillActionFromDocLe === "function") importSkillActionFromDocLe(doc);
        if (typeof leSkFlowRefreshGraph === "function") leSkFlowRefreshGraph();
        if (typeof updateLeSkCompileWarn === "function") updateLeSkCompileWarn();
      } else if (lane === "vfx" && typeof window.leParticleStudioImport === "function") {
        window.leParticleStudioImport(doc);
        if (typeof window.leParticleStudioReplay === "function") window.leParticleStudioReplay();
      }
    } finally {
      if (typeof LE_SK_FLOW !== "undefined") LE_SK_FLOW.batch = false;
      restoring = false;
    }
    paintChrome();
    if (typeof window.leGraphValidatePaint === "function") window.leGraphValidatePaint();
  }

  function push(lane, text, replaceLast) {
    const h = lanes[lane];
    if (!h) return;
    if (replaceLast && h.index >= 0 && h.stack[h.index] !== undefined) {
      h.stack[h.index] = text;
      h.stack.length = h.index + 1;
      return;
    }
    if (h.stack[h.index] === text) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(text);
    if (h.stack.length > MAX) h.stack.shift();
    h.index = h.stack.length - 1;
  }

  function note(opts) {
    opts = opts || {};
    if (restoring) return;
    if (typeof LE_SK_FLOW !== "undefined" && LE_SK_FLOW.batch && !opts.force) return;
    const lane = opts.lane || laneId();
    if (!lane) return;
    const h = lanes[lane];
    const text = capture(lane);
    if (text == null) return;
    if (h.stack[h.index] === text) {
      scheduleDraft(lane, text);
      paintChrome();
      return;
    }
    const immediate = !!opts.immediate;
    if (immediate) {
      if (h.timer) {
        clearTimeout(h.timer);
        h.timer = 0;
      }
      push(lane, text, false);
      scheduleDraft(lane, text);
      paintChrome();
      return;
    }
    if (h.timer) clearTimeout(h.timer);
    h.timer = setTimeout(() => {
      h.timer = 0;
      const later = capture(lane);
      if (later == null) return;
      push(lane, later, false);
      scheduleDraft(lane, later);
      paintChrome();
    }, COALESCE_MS);
  }

  function scheduleDraft(lane, text) {
    const h = lanes[lane];
    if (h.draftTimer) clearTimeout(h.draftTimer);
    h.draftTimer = setTimeout(() => {
      h.draftTimer = 0;
      writeDraft(lane, text || capture(lane));
    }, DRAFT_MS);
  }

  function writeDraft(lane, text) {
    if (!text) return;
    const rec = {
      savedAt: Date.now(),
      path: typeof window.lePackCurrentPath === "function" ? (window.lePackCurrentPath() || "") : "",
      filename: lane === "skill"
        ? ($("le_sk_filename")?.value || "skill_action.json")
        : ($("le_pv_filename")?.value || "new_vfx.json"),
      json: text,
    };
    const key = KEYS[lane];
    try {
      localStorage.setItem(key, JSON.stringify(rec));
    } catch (_) {
      idbPut(key, rec);
    }
  }

  function idbOpen(cb) {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => cb(req.result);
      req.onerror = () => {};
    } catch (_) {}
  }

  function idbPut(key, rec) {
    idbOpen((db) => {
      try {
        db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(rec, key);
      } catch (_) {}
    });
  }

  function idbGet(key, cb) {
    idbOpen((db) => {
      try {
        const g = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
        g.onsuccess = () => cb(g.result || null);
        g.onerror = () => cb(null);
      } catch (_) {
        cb(null);
      }
    });
  }

  function idbDel(key) {
    idbOpen((db) => {
      try {
        db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(key);
      } catch (_) {}
    });
  }

  function readDraft(lane) {
    try {
      const raw = localStorage.getItem(KEYS[lane]);
      if (!raw) return null;
      const rec = JSON.parse(raw);
      if (!rec || typeof rec.json !== "string") return null;
      return rec;
    } catch (_) {
      return null;
    }
  }

  function clearDraft(lane) {
    try { localStorage.removeItem(KEYS[lane]); } catch (_) {}
    idbDel(KEYS[lane]);
    draftOffer[lane] = null;
    paintDraftStrip();
  }

  function isDirty() {
    const lane = laneId();
    if (!lane) return false;
    const h = lanes[lane];
    const text = capture(lane);
    if (text == null) return false;
    if (h.saved === "") return h.index >= 0;
    return text !== h.saved;
  }

  function markSaved() {
    const lane = laneId();
    if (!lane) return;
    const text = capture(lane);
    if (text == null) return;
    const h = lanes[lane];
    h.saved = text;
    if (h.stack[h.index] !== text) push(lane, text, false);
    clearDraft(lane);
    paintChrome();
  }

  function captureBaseline(opts) {
    opts = opts || {};
    const lane = opts.lane || laneId();
    if (!lane) return;
    const text = capture(lane);
    if (text == null) return;
    const h = lanes[lane];
    h.stack = [text];
    h.index = 0;
    if (opts.keepDirty) {
      /* keep previous saved */
    } else {
      h.saved = text;
    }
    if (!opts.keepDirty && !opts.keepDraft) clearDraft(lane);
    else if (opts.keepDirty) scheduleDraft(lane, text);
    paintChrome();
  }

  function undo() {
    const lane = laneId();
    if (!lane) return;
    const h = lanes[lane];
    if (h.timer) {
      clearTimeout(h.timer);
      h.timer = 0;
      const pending = capture(lane);
      if (pending && h.stack[h.index] !== pending) push(lane, pending, false);
    }
    if (h.index <= 0) return;
    h.index -= 1;
    apply(lane, h.stack[h.index]);
    scheduleDraft(lane, h.stack[h.index]);
  }

  function redo() {
    const lane = laneId();
    if (!lane) return;
    const h = lanes[lane];
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    apply(lane, h.stack[h.index]);
    scheduleDraft(lane, h.stack[h.index]);
  }

  function canUndo() {
    const lane = laneId();
    return !!(lane && lanes[lane].index > 0);
  }

  function canRedo() {
    const lane = laneId();
    return !!(lane && lanes[lane].index < lanes[lane].stack.length - 1);
  }

  function confirmReplace(message) {
    if (!isDirty()) return true;
    return window.confirm(message || "Replace unsaved work?");
  }

  function paintChrome() {
    const save = $("le_sk_btn_save");
    if (save) {
      save.classList.toggle("dirty", isDirty());
      save.title = isDirty() ? "Unsaved changes" : "Save";
    }
    const und = $("le_sk_btn_undo");
    const red = $("le_sk_btn_redo");
    if (und) und.disabled = !canUndo();
    if (red) red.disabled = !canRedo();
    paintDraftStrip();
  }

  function paintDraftStrip() {
    const strip = $("le_session_draft");
    const msg = $("le_session_draft_msg");
    if (!strip) return;
    const lane = laneId();
    const rec = lane ? draftOffer[lane] : null;
    if (!rec || !lane) {
      strip.classList.add("hidden");
      return;
    }
    const when = rec.savedAt ? new Date(rec.savedAt).toLocaleTimeString() : "";
    if (msg) msg.textContent = "Draft from " + when + (rec.filename ? " (" + rec.filename + ")" : "");
    strip.classList.remove("hidden");
  }

  function restoreDraft() {
    const lane = laneId();
    const rec = lane && draftOffer[lane];
    if (!rec || !rec.json) return;
    apply(lane, rec.json);
    const h = lanes[lane];
    h.stack = [rec.json];
    h.index = 0;
    h.saved = "";
    draftOffer[lane] = null;
    paintChrome();
    scheduleDraft(lane, rec.json);
  }

  function dismissDraft() {
    const lane = laneId();
    if (!lane) return;
    draftOffer[lane] = null;
    paintDraftStrip();
  }

  function considerDraft(lane, rec) {
    if (!rec || typeof rec.json !== "string") return;
    const cur = capture(lane);
    if (cur && cur === rec.json) return;
    draftOffer[lane] = rec;
  }

  function maybeOfferDrafts() {
    ["skill", "vfx"].forEach((lane) => {
      const rec = readDraft(lane);
      if (rec) considerDraft(lane, rec);
      else {
        idbGet(KEYS[lane], (idbRec) => {
          if (!draftOffer[lane]) considerDraft(lane, idbRec);
          paintDraftStrip();
        });
      }
    });
    paintDraftStrip();
  }

  function fieldAllowsBrowserUndo(el) {
    if (!el) return false;
    const tag = String(el.tagName || "").toLowerCase();
    if (tag !== "input" && tag !== "textarea") return false;
    if (el.classList && el.classList.contains("le-flow-id")) return false;
    return true;
  }

  function onKey(e) {
    const key = String(e.key || "").toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (key !== "z" && key !== "y") return;
    if (fieldAllowsBrowserUndo(document.activeElement)) return;
    const lane = laneId();
    if (!lane) return;
    e.preventDefault();
    if (key === "y" || (key === "z" && e.shiftKey)) redo();
    else undo();
  }

  function onBeforeUnload(e) {
    if (!isDirty()) return;
    e.preventDefault();
    e.returnValue = "";
  }

  function bind() {
    if (inited) return;
    inited = true;
    $("le_sk_btn_undo")?.addEventListener("click", () => undo());
    $("le_sk_btn_redo")?.addEventListener("click", () => redo());
    $("le_sk_btn_check")?.addEventListener("click", () => {
      if (typeof window.leGraphValidatePaint === "function") window.leGraphValidatePaint(true);
    });
    $("le_session_draft_restore")?.addEventListener("click", () => restoreDraft());
    $("le_session_draft_dismiss")?.addEventListener("click", () => dismissDraft());
    document.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.querySelectorAll('input[name="le_builder_mode"]').forEach((r) => {
      r.addEventListener("change", () => {
        const lane = laneId();
        if (lane && lanes[lane].stack.length === 0) captureBaseline({ lane, keepDraft: true });
        paintChrome();
        if (typeof window.leGraphValidatePaint === "function") window.leGraphValidatePaint();
      });
    });
    setTimeout(() => {
      const lane = laneId();
      if (lane && lanes[lane].stack.length === 0) captureBaseline({ lane, keepDraft: true });
      maybeOfferDrafts();
      paintChrome();
    }, 80);
  }

  window.leBuilderSession = {
    note,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
    markSaved,
    captureBaseline,
    confirmReplace,
    paintChrome,
    isRestoring: () => restoring,
    laneId,
    restoreDraft,
    dismissDraft,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
