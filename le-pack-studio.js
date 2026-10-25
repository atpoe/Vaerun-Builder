/* Vaerun datapack folder / zip editor. Chrome/Edge can save in place. */
(function () {
  "use strict";

  const SKIP_DIRS = new Set([
    ".git", "build", "node_modules", ".gradle", ".idea", "out", "bin", "classes",
    "generated", ".BACKUPS", "META-INF", "run", "logs", "tmp", "assets",
  ]);
  const KEEP_FILE = /\.(json|mcmeta)$/i;
  const FOCUS_DIRS = [
    "skill_actions", "skill_vfx_particles", "skill_effects", "gear_effects",
    "gear_prefix", "gear_suffix", "mob_affixes", "food_category", "potion_effects",
  ];
  const KIND_FOLDERS = {
    skill_stages: "skill_actions",
    particles: "skill_vfx_particles",
    skill: "skill_effects",
    gear: "gear_effects",
    passive: "skill_actions",
    mob_affix: "mob_affixes",
    gear_affix: "gear_prefix",
    food_category: "food_category",
    potion_effects: "potion_effects",
  };

  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  const PACK = {
    kind: "none",
    name: "",
    writable: false,
    handle: null,
    tree: [],
    zip: new Map(),
    current: "",
    currentHandle: null,
    currentKind: "",
    generic: false,
    ns: "vaerun",
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(text, ok) {
    const el = $("le_pack_status");
    if (el) {
      el.textContent = text || "";
      el.className = "hint" + (ok === false ? " le-pack-err" : "");
    }
    const msg = $("msg");
    if (msg && text) {
      msg.textContent = text;
      msg.className = ok === false ? "msg err" : "msg ok";
    }
  }

  function skipDirName(name) {
    return SKIP_DIRS.has(name) || String(name).startsWith(".");
  }

  function normPath(p) {
    return String(p || "").replace(/\\/g, "/").replace(/^\/+/, "");
  }

  function classifyPath(path) {
    const p = normPath(path).toLowerCase();
    if (p.endsWith("pack.mcmeta") || p.endsWith(".mcmeta")) return "mcmeta";
    if (/\/skill_vfx_particles\//.test(p) || p.startsWith("skill_vfx_particles/")) return "particles";
    if (/\/skill_effects\//.test(p) || p.startsWith("skill_effects/")) return "skill";
    if (/\/gear_effects\//.test(p) || p.startsWith("gear_effects/")) return "gear";
    if (/\/mob_affixes\//.test(p) || p.startsWith("mob_affixes/")) return "mob_affix";
    if (/\/gear_prefix\//.test(p) || /\/gear_suffix\//.test(p) || p.startsWith("gear_prefix/") || p.startsWith("gear_suffix/")) {
      return "gear_affix";
    }
    if (/\/food_category\//.test(p) || p.startsWith("food_category/")) return "food_category";
    if (/\/potion_effects\//.test(p) || p.startsWith("potion_effects/")) return "potion_effects";
    if (/\/skill_actions\//.test(p) || p.startsWith("skill_actions/")) return "skill_action";
    return "json";
  }

  function isFocusPath(path) {
    const p = "/" + normPath(path).toLowerCase() + "/";
    if (p.endsWith("pack.mcmeta/") || p.endsWith(".mcmeta/")) return true;
    return FOCUS_DIRS.some((d) => p.includes("/" + d + "/"));
  }

  function detectNs(paths) {
    for (const p of paths) {
      const m = normPath(p).match(/(?:^|\/)data\/([^/]+)\//);
      if (m) return m[1];
    }
    return "vaerun";
  }

  function crc32(bytes) {
    let c = ~0;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return ~c >>> 0;
  }

  async function inflateRaw(raw, method) {
    if (method === 0) return raw;
    if (method !== 8) throw new Error("Zip uses compression " + method + " (need store or deflate).");
    const ds = new DecompressionStream("deflate-raw");
    const buf = await new Response(new Blob([raw]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(buf);
  }

  async function parseZip(buf) {
    const u8 = new Uint8Array(buf);
    const dv = new DataView(buf);
    let eocd = -1;
    const min = Math.max(0, u8.length - 65557);
    for (let i = u8.length - 22; i >= min; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error("Not a zip file.");
    let cdOff = dv.getUint32(eocd + 16, true);
    const nFiles = dv.getUint16(eocd + 10, true);
    const out = [];
    for (let i = 0; i < nFiles; i++) {
      if (dv.getUint32(cdOff, true) !== 0x02014b50) throw new Error("Bad zip directory.");
      const method = dv.getUint16(cdOff + 10, true);
      const comp = dv.getUint32(cdOff + 20, true);
      const nameLen = dv.getUint16(cdOff + 28, true);
      const extraLen = dv.getUint16(cdOff + 30, true);
      const commentLen = dv.getUint16(cdOff + 32, true);
      const localOff = dv.getUint32(cdOff + 42, true);
      const name = new TextDecoder().decode(u8.subarray(cdOff + 46, cdOff + 46 + nameLen));
      cdOff += 46 + nameLen + extraLen + commentLen;
      if (!name || name.endsWith("/")) continue;
      const localNameLen = dv.getUint16(localOff + 26, true);
      const localExtra = dv.getUint16(localOff + 28, true);
      const dataStart = localOff + 30 + localNameLen + localExtra;
      const raw = u8.subarray(dataStart, dataStart + comp);
      const data = await inflateRaw(raw, method);
      out.push({ path: normPath(name), bytes: data });
    }
    return out;
  }

  function buildStoreZip(entries) {
    const enc = new TextEncoder();
    const parts = [];
    const centrals = [];
    let offset = 0;
    for (const e of entries) {
      const name = enc.encode(e.path);
      const data = e.bytes;
      const crc = crc32(data);
      const local = new Uint8Array(30 + name.length);
      const v = new DataView(local.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, data.length, true);
      v.setUint32(22, data.length, true);
      v.setUint16(26, name.length, true);
      local.set(name, 30);
      parts.push(local, data);
      const central = new Uint8Array(46 + name.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      central.set(name, 46);
      centrals.push(central);
      offset += local.length + data.length;
    }
    const cdStart = offset;
    let cdSize = 0;
    for (const c of centrals) {
      parts.push(c);
      cdSize += c.length;
    }
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdStart, true);
    parts.push(eocd);
    return new Blob(parts, { type: "application/zip" });
  }

  function treeFromPaths(paths) {
    const root = new Map();
    function ensure(map, parts, filePath, extra) {
      let nodes = map;
      let prefix = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        prefix = prefix ? prefix + "/" + part : part;
        const last = i === parts.length - 1;
        if (last) {
          nodes.set(part, { type: "file", name: part, path: filePath, ...extra });
          return;
        }
        if (!nodes.has(part)) nodes.set(part, { type: "dir", name: part, path: prefix, childrenMap: new Map() });
        nodes = nodes.get(part).childrenMap;
      }
    }
    for (const item of paths) {
      const path = typeof item === "string" ? item : item.path;
      const parts = normPath(path).split("/").filter(Boolean);
      if (!parts.length) continue;
      ensure(root, parts, normPath(path), typeof item === "object" ? item : {});
    }
    function flatten(map) {
      const dirs = [];
      const files = [];
      for (const n of map.values()) {
        if (n.type === "dir") {
          n.children = flatten(n.childrenMap);
          if (n.children.length) dirs.push(n);
        } else files.push(n);
      }
      dirs.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
      return [...dirs, ...files];
    }
    return flatten(root);
  }

  async function walkDir(handle, prefix) {
    const dirs = [];
    const files = [];
    for await (const [name, h] of handle.entries()) {
      if (h.kind === "directory") {
        if (skipDirName(name)) continue;
        const children = await walkDir(h, prefix + name + "/");
        if (children.length) dirs.push({ type: "dir", name, path: prefix + name, handle: h, children });
      } else if (KEEP_FILE.test(name)) {
        files.push({ type: "file", name, path: prefix + name, handle: h });
      }
    }
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return [...dirs, ...files];
  }

  function findNode(nodes, path) {
    for (const n of nodes || []) {
      if (n.path === path) return n;
      if (n.children) {
        const hit = findNode(n.children, path);
        if (hit) return hit;
      }
    }
    return null;
  }

  function collectPaths(nodes, out) {
    for (const n of nodes || []) {
      if (n.type === "file") out.push(n.path);
      if (n.children) collectPaths(n.children, out);
    }
    return out;
  }

  function renderTree(nodes, filter, showAll) {
    const q = String(filter || "").trim().toLowerCase();
    let html = "";
    for (const n of nodes) {
      if (n.type === "dir") {
        const inner = renderTree(n.children, filter, showAll);
        if (q && !inner && !n.path.toLowerCase().includes(q)) continue;
        if (!q && !showAll && !isFocusPath(n.path + "/") && !inner) continue;
        const open = !q && (FOCUS_DIRS.includes(n.name) || n.name === "data" || n.name === PACK.ns);
        html += `<details${open ? " open" : ""}><summary>${esc(n.name)}</summary>${inner}</details>`;
      } else {
        if (q && !n.path.toLowerCase().includes(q)) continue;
        if (!q && !showAll && !isFocusPath(n.path)) continue;
        const on = PACK.current === n.path ? " active" : "";
        html += `<button type="button" class="file${on}" data-pack-path="${esc(n.path)}">${esc(n.name)}</button>`;
      }
    }
    return html;
  }

  function paintTree() {
    const host = $("le_pack_tree");
    if (!host) return;
    if (!PACK.tree.length) {
      host.innerHTML = `<p class="le-ss-empty">Open a datapack folder (Chrome / Edge can save in place) or a <span class="mono">.zip</span>. Point at <span class="mono">src/main/resources</span> or <span class="mono">data/vaerun</span>.</p>`;
      return;
    }
    const html = renderTree(PACK.tree, $("le_pack_filter")?.value, !!$("le_pack_show_all")?.checked);
    host.innerHTML = html || `<p class="le-ss-empty">No matching JSON. Tick Show all, or clear the filter.</p>`;
    host.querySelectorAll("[data-pack-path]").forEach((btn) => {
      btn.addEventListener("click", () => openPath(btn.getAttribute("data-pack-path")));
    });
    const title = $("le_pack_folder_name");
    if (title) title.textContent = PACK.name ? PACK.name + (PACK.writable ? " (save in place)" : " (download / zip)") : "No pack open";
    paintStrip();
  }

  function paintStrip() {
    const strip = $("le_pack_strip");
    if (!strip) return;
    const open = PACK.kind !== "none";
    strip.classList.toggle("hidden", !open);
    const name = $("le_pack_strip_name");
    const path = $("le_pack_strip_path");
    const save = $("le_pack_strip_save");
    if (name) name.textContent = PACK.name || "Pack";
    if (path) path.textContent = PACK.current || "—";
    if (save) {
      save.textContent = PACK.writable
        ? "Save writes this file"
        : PACK.kind === "zip"
          ? "Save keeps edits — Download zip to export"
          : "Save downloads a copy";
    }
  }

  function showGeneric(text) {
    PACK.generic = true;
    const ta = $("le_pack_json");
    if (ta) {
      try {
        ta.value = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        ta.value = text;
      }
    }
    $("le_pack_welcome")?.classList.add("hidden");
    $("le_pack_editor")?.classList.remove("hidden");
  }

  function showWelcome() {
    PACK.generic = false;
    $("le_pack_welcome")?.classList.remove("hidden");
    $("le_pack_editor")?.classList.add("hidden");
  }

  function templates() {
    const ns = PACK.ns || "vaerun";
    return {
      skill_stages: {
        path: `data/${ns}/skill_actions/my_pack/new_skill.json`,
        doc: {
          skill_id: ns + ":my_pack/new_skill",
          stamina_cost: 0,
          mana_cost: 10,
          cooldown_seconds: 6,
          execution: {
            type: "flow",
            entry: "cast",
            nodes: {
              cast: { kind: "delivery", params: { mode: "instant" } },
            },
            play_style: "intelligence",
            tags: ["magic"],
          },
          play_style: "intelligence",
          tags: ["magic"],
        },
      },
      particles: {
        path: `data/${ns}/skill_vfx_particles/toolkit/new_look.json`,
        doc: {
          id: ns + ":toolkit/new_look",
          kind: "emitter",
          emitters: [
            {
              shape: { type: "sphere", particle_count: 16, radius: 0.4 },
              particle: { type: "minecraft:flame", size: 0.24, lifetime: 12 },
              motion: { type: "burst", speed: 0.12 },
              animation: { fade_in_ticks: 1, fade_out_ticks: 6 },
            },
          ],
        },
      },
      skill: {
        path: `data/${ns}/skill_effects/my_pack/new_effect.json`,
        doc: { id: ns + ":my_pack/new_effect", duration_seconds: 8, max_stacks: 1, steps: [] },
      },
      passive: {
        path: `data/${ns}/skill_actions/my_pack/new_passive.json`,
        doc: {
          skill_id: ns + ":my_pack/new_passive",
          execution: { type: "passive" },
        },
      },
      mob_affix: {
        path: `data/${ns}/mob_affixes/new_affix.json`,
        doc: { id: ns + ":new_affix", weight: 1 },
      },
      gear_affix: {
        path: `data/${ns}/gear_prefix/new_prefix.json`,
        doc: { id: ns + ":new_prefix" },
      },
      food_category: {
        path: `data/${ns}/food_category/new_food.json`,
        doc: { id: ns + ":new_food", stats: [] },
      },
      potion_effects: {
        path: `data/${ns}/potion_effects/new_potion.json`,
        doc: { id: ns + ":new_potion", stats: [] },
      },
      mcmeta: {
        path: "pack.mcmeta",
        doc: { pack: { pack_format: 15, description: "Vaerun datapack" } },
      },
    };
  }

  function suggestNewPath() {
    const kind = $("le_pack_new_kind")?.value || "skill_stages";
    const t = templates()[kind];
    const inp = $("le_pack_new_path");
    if (inp && t) inp.value = t.path;
  }

  async function ensureDir(root, parts) {
    let dir = root;
    for (const part of parts) dir = await dir.getDirectoryHandle(part, { create: true });
    return dir;
  }

  async function writeBytesToHandle(handle, bytes) {
    const w = await handle.createWritable();
    await w.write(bytes);
    await w.close();
  }

  function textBytes(text) {
    return new TextEncoder().encode(text.endsWith("\n") ? text : text + "\n");
  }

  async function writePath(path, text) {
    const clean = normPath(path);
    const bytes = textBytes(text);
    if (PACK.kind === "folder" && PACK.handle && PACK.writable) {
      const parts = clean.split("/");
      const fileName = parts.pop();
      const dir = await ensureDir(PACK.handle, parts);
      const fh = await dir.getFileHandle(fileName, { create: true });
      await writeBytesToHandle(fh, bytes);
      PACK.currentHandle = fh;
      PACK.tree = await walkDir(PACK.handle, "");
      return true;
    }
    if (PACK.kind === "zip" || PACK.kind === "files") {
      const prev = PACK.zip.get(clean);
      PACK.zip.set(clean, { path: clean, bytes, text, dirty: true, handle: prev && prev.handle });
      PACK.tree = treeFromPaths([...PACK.zip.values()]);
      return true;
    }
    return false;
  }

  function currentExport() {
    if (PACK.generic || PACK.currentKind === "json" || PACK.currentKind === "mcmeta") {
      const ta = $("le_pack_json");
      const text = ta ? ta.value : "";
      JSON.parse(text);
      return { text: text.endsWith("\n") ? text : text + "\n", filename: (PACK.current.split("/").pop() || "file.json") };
    }
    const kind = PACK.currentKind || classifyPath(PACK.current);
    if (typeof window.leBuilderExportKind === "function") return window.leBuilderExportKind(kind);
    if (typeof window.leBuilderExportCurrent === "function") return window.leBuilderExportCurrent();
    throw new Error("Nothing to save.");
  }

  async function saveInPlace() {
    if (!PACK.current && !PACK.generic) return false;
    let payload;
    try {
      payload = currentExport();
    } catch (e) {
      setStatus(e.message || String(e), false);
      return true;
    }
    const path = PACK.current || payload.filename;
    const wrote = await writePath(path, payload.text);
    if (wrote) {
      PACK.current = path;
      paintTree();
      setStatus(PACK.writable ? "Saved " + path : "Updated in pack — Download zip to export.");
      if (typeof window.leBuilderSession?.markSaved === "function") window.leBuilderSession.markSaved();
      return true;
    }
    return false;
  }

  function downloadBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadZip() {
    if (!PACK.zip.size && PACK.kind !== "folder") {
      setStatus("Open a zip or folder first.", false);
      return;
    }
    if (PACK.current) {
      try {
        const payload = currentExport();
        await writePath(PACK.current, payload.text);
      } catch (e) {
        setStatus(e.message || String(e), false);
        return;
      }
    }
    const entries = [];
    if (PACK.kind === "folder") {
      async function walkBytes(nodes) {
        for (const n of nodes) {
          if (n.type === "dir") await walkBytes(n.children || []);
          else if (n.handle && n.handle.getFile) {
            const file = await n.handle.getFile();
            const bytes = new Uint8Array(await file.arrayBuffer());
            entries.push({ path: n.path, bytes });
          }
        }
      }
      await walkBytes(PACK.tree);
    } else {
      for (const e of PACK.zip.values()) entries.push({ path: e.path, bytes: e.bytes });
    }
    downloadBlob(buildStoreZip(entries), (PACK.name || "datapack") + ".zip");
    setStatus("Downloaded " + entries.length + " files as zip.");
  }

  function applyOpenedText(path, text) {
    const kind = classifyPath(path);
    PACK.current = path;
    PACK.currentKind = kind;
    PACK.generic = false;
    if (kind === "mcmeta" || kind === "json") {
      if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
      showGeneric(text);
      paintTree();
      setStatus("Editing " + path);
      return;
    }
    if (typeof window.leBuilderImportJson !== "function") {
      showGeneric(text);
      if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
      paintTree();
      return;
    }
    try {
      const name = path.split("/").pop() || "file.json";
      const res = window.leBuilderImportJson(text, { fileName: name, packPath: path });
      const mode = document.querySelector('input[name="le_builder_mode"]:checked')?.value || "";
      if (kind === "skill_action") PACK.currentKind = mode === "passive" ? "passive" : "skill_stages";
      else if (res && res.kind) PACK.currentKind = res.kind === "passive_mastery" ? "passive" : kind;
      showWelcome();
    } catch (e) {
      if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
      showGeneric(text);
      setStatus((e && e.message) || String(e), false);
      paintTree();
      return;
    }
    paintTree();
    setStatus("Opened " + path);
  }

  async function openPath(path) {
    const node = findNode(PACK.tree, path);
    if (!node || node.type !== "file") return;
    try {
      let text = "";
      if (node.handle && node.handle.getFile) {
        const file = await node.handle.getFile();
        text = await file.text();
        PACK.currentHandle = node.handle;
      } else if (node.file) {
        text = await node.file.text();
        PACK.currentHandle = null;
      } else if (PACK.zip.has(path)) {
        const rec = PACK.zip.get(path);
        if (rec.file) text = await rec.file.text();
        else text = rec.text || new TextDecoder().decode(rec.bytes);
        PACK.currentHandle = rec.handle || null;
      } else {
        throw new Error("Cannot read " + path);
      }
      applyOpenedText(path, text);
    } catch (e) {
      setStatus(e.message || String(e), false);
    }
  }

  function rememberNs() {
    PACK.ns = detectNs(collectPaths(PACK.tree, []));
    suggestNewPath();
  }

  async function idb() {
    return new Promise((res, rej) => {
      const req = indexedDB.open("vaerun-pack", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("kv");
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async function storeHandle(handle) {
    try {
      const db = await idb();
      await new Promise((res, rej) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(handle, "dir");
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (_) {}
  }

  async function restoreHandle() {
    if (!window.showDirectoryPicker) return;
    try {
      const db = await idb();
      const handle = await new Promise((res, rej) => {
        const tx = db.transaction("kv", "readonly");
        const r = tx.objectStore("kv").get("dir");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      if (!handle) return;
      const perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm !== "granted") {
        const next = await handle.requestPermission({ mode: "readwrite" });
        if (next !== "granted") return;
      }
      await adoptFolder(handle);
    } catch (_) {}
  }

  async function adoptFolder(handle) {
    PACK.kind = "folder";
    PACK.handle = handle;
    PACK.name = handle.name;
    PACK.writable = true;
    PACK.zip = new Map();
    PACK.current = "";
    PACK.currentHandle = null;
    setStatus("Reading " + handle.name + "…");
    PACK.tree = await walkDir(handle, "");
    rememberNs();
    showWelcome();
    paintTree();
    await storeHandle(handle);
    setStatus("Opened folder " + handle.name + " — click a JSON to edit.");
  }

  async function openFolderPicker() {
    if (window.showDirectoryPicker) {
      try {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        await adoptFolder(handle);
        if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    $("le_pack_dir_fallback")?.click();
  }

  function onFallbackFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => {
      const rel = String(f.webkitRelativePath || f.name);
      if (rel.split("/").some(skipDirName)) return false;
      return KEEP_FILE.test(f.name);
    });
    if (!files.length) {
      setStatus("No JSON / pack.mcmeta in that folder.", false);
      return;
    }
    PACK.kind = "files";
    PACK.handle = null;
    PACK.writable = false;
    PACK.zip = new Map();
    const root = (files[0].webkitRelativePath || files[0].name).split("/")[0] || "folder";
    PACK.name = root;
    const items = [];
    for (const file of files) {
      const rel = String(file.webkitRelativePath || file.name).replace(/^[^/]+\//, "");
      items.push({ path: rel, file, name: file.name });
      PACK.zip.set(rel, { path: rel, bytes: null, file, dirty: false });
    }
    PACK.tree = treeFromPaths(items);
    rememberNs();
    showWelcome();
    paintTree();
    if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
    setStatus("Loaded " + files.length + " files from " + root + " (save downloads; use Download zip for the pack).");
  }

  async function openZipFile(file) {
    setStatus("Reading zip…");
    const entries = await parseZip(await file.arrayBuffer());
    PACK.kind = "zip";
    PACK.handle = null;
    PACK.writable = false;
    PACK.name = file.name.replace(/\.zip$/i, "");
    PACK.zip = new Map();
    const keep = [];
    for (const e of entries) {
      PACK.zip.set(e.path, e);
      if (KEEP_FILE.test(e.path) || e.path.toLowerCase().endsWith(".mcmeta")) keep.push(e.path);
    }
    PACK.tree = treeFromPaths(keep.length ? keep : [...PACK.zip.keys()]);
    rememberNs();
    showWelcome();
    paintTree();
    if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
    setStatus("Opened " + file.name + " (" + PACK.zip.size + " files). Save keeps edits; Download zip exports the pack.");
  }

  async function createNew() {
    const kind = $("le_pack_new_kind")?.value || "skill_stages";
    const t = templates()[kind];
    if (!t) return;
    let path = normPath($("le_pack_new_path")?.value || t.path);
    if (!path) path = t.path;
    if (!/\.(json|mcmeta)$/i.test(path)) path += ".json";
    const text = JSON.stringify(t.doc, null, 2) + "\n";
    const wrote = await writePath(path, text);
    if (!wrote) {
      PACK.kind = PACK.kind === "none" ? "files" : PACK.kind;
      PACK.zip.set(path, { path, bytes: textBytes(text), text, dirty: true });
      PACK.tree = treeFromPaths([...PACK.zip.keys()].concat(collectPaths(PACK.tree, [])));
    }
    applyOpenedText(path, text);
    paintTree();
    setStatus(PACK.writable ? "Created " + path : "Created " + path + " in pack memory.");
  }

  function builderMatchesPack() {
    const mode = document.querySelector('input[name="le_builder_mode"]:checked')?.value || "";
    if (mode === "pack") return true;
    const k = PACK.currentKind;
    if (mode === "skill_stages" && (k === "skill_stages" || k === "skill_action")) return true;
    if (mode === "passive" && k === "passive") return true;
    return mode === k;
  }

  function interceptSave(e) {
    const btn = e.target && e.target.closest ? e.target.closest("#le_sk_btn_save, #le_pv_save, #btn_download") : null;
    if (!btn) return;
    if (PACK.kind === "none" || !PACK.current) return;
    if (!builderMatchesPack()) return;
    if (btn.id === "le_pv_save" && typeof window.leParticleStudioHasHandle === "function" && window.leParticleStudioHasHandle()) return;
    if (btn.id === "btn_download" && !PACK.writable && PACK.kind !== "zip" && PACK.kind !== "files") return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.leGraphValidatePaint === "function") window.leGraphValidatePaint(true);
    saveInPlace().then((handled) => {
      if (handled) return;
      if (btn.id === "le_pv_save" && typeof window.leParticleStudioSave === "function") {
        window.leParticleStudioSave();
        return;
      }
      if (btn.id === "btn_download") {
        const real = $("btn_download");
        if (real) {
          real.dataset.lePackSkip = "1";
          real.click();
          delete real.dataset.lePackSkip;
        }
      }
    });
  }

  function init() {
    if (document.documentElement.dataset.lePackInit === "1") return;
    document.documentElement.dataset.lePackInit = "1";
    $("le_pack_open_folder")?.addEventListener("click", () => openFolderPicker());
    $("le_pack_open_zip")?.addEventListener("click", () => $("le_pack_zip")?.click());
    $("le_pack_zip")?.addEventListener("change", async (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (f) {
        try {
          await openZipFile(f);
        } catch (err) {
          setStatus(err.message || String(err), false);
        }
      }
    });
    $("le_pack_dir_fallback")?.addEventListener("change", (e) => {
      onFallbackFiles(e.target.files);
      e.target.value = "";
    });
    $("le_pack_filter")?.addEventListener("input", paintTree);
    $("le_pack_show_all")?.addEventListener("change", paintTree);
    $("le_pack_new_kind")?.addEventListener("change", suggestNewPath);
    $("le_pack_new")?.addEventListener("click", () => createNew());
    $("le_pack_download_zip")?.addEventListener("click", () => downloadZip());
    $("le_pack_strip_back")?.addEventListener("click", () => {
      if (typeof window.leBuilderSetMode === "function") window.leBuilderSetMode("pack");
      paintTree();
    });
    $("le_pack_save")?.addEventListener("click", () => {
      if (!PACK.current) {
        setStatus("Open a file first.", false);
        return;
      }
      saveInPlace();
    });
    document.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("#le_sk_btn_save, #le_pv_save, #btn_download");
      if (!t) return;
      if (t.dataset && t.dataset.lePackSkip === "1") return;
      interceptSave(e);
    }, true);
    suggestNewPath();
    paintTree();
    restoreHandle();
  }

  function hasVfxId(id) {
    const raw = String(id || "").trim().toLowerCase();
    if (!raw) return false;
    const rest = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1) : raw;
    const needle = rest.replace(/\.json$/i, "");
    const paths = collectPaths(PACK.tree, []);
    if (PACK.zip && PACK.zip.size) PACK.zip.forEach((_, p) => paths.push(p));
    return paths.some((p) => {
      const np = normPath(p).toLowerCase();
      if (np.indexOf("skill_vfx_particles") < 0) return false;
      const stem = np.replace(/\.json$/i, "");
      return stem.endsWith("/" + needle) || stem.endsWith(needle);
    });
  }

  window.lePackSaveInPlace = saveInPlace;
  window.lePackIsOpen = () => PACK.kind !== "none";
  window.lePackCurrentPath = () => PACK.current;
  window.lePackGenericText = () => (PACK.generic ? ($("le_pack_json")?.value || "") : null);
  window.lePackPaint = paintTree;
  window.lePackHasVfxId = hasVfxId;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
