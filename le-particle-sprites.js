/* Billboard sprites for the particle studio.
   Default preview uses Snowstorm's free Quick Setup sprites (JannisX11).
   Vaerun sequences and a Minecraft jar remain optional extras. */
(function () {
  "use strict";

  const SNOW_BASES = ["./particle/snowstorm/", "particle/snowstorm/"];
  const LE_BASES = [
    "../src/main/resources/assets/vaerun/textures/particle/",
    "./particle/",
  ];

  const SNOW_FILES = {
    sparkle: "sparkle.png",
    smoke: "smoke.png",
    magic: "magic.png",
    spark: "spark.png",
    dust: "dust.png",
    ball: "ball.png",
    leaves: "leaves.png",
    dirt: "dirt.png",
  };

  const LE_PACK = {
    fireball: prefix("fireball/fire_ball_", 0, 4),
    ice: prefix("ice_burst_small_blue/ice_burst_small_blue_", 0, 15),
    slash: prefix("slash_arc_", 0, 3),
    hit: prefix("hit_burst_", 0, 3),
  };

  const byType = {};
  const extra = {};
  const sheets = {};
  let blockImg = null;
  let inited = false;

  function prefix(p, a, b) {
    const out = [];
    for (let i = a; i <= b; i++) out.push(p + i + ".png");
    return out;
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function splitStrip(img) {
    if (!img || !img.width) return [img];
    if (img.width >= img.height * 1.6) {
      const fh = img.height;
      const n = Math.max(1, Math.floor(img.width / fh));
      const framesOut = [];
      for (let i = 0; i < n; i++) {
        const c = document.createElement("canvas");
        c.width = fh;
        c.height = fh;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, i * fh, 0, fh, fh, 0, 0, fh, fh);
        framesOut.push(c);
      }
      return framesOut;
    }
    if (img.height < img.width * 1.6) return [img];
    const fw = img.width;
    const n = Math.max(1, Math.floor(img.height / fw));
    const framesOut = [];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("canvas");
      c.width = fw;
      c.height = fw;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, i * fw, fw, fw, 0, 0, fw, fw);
      framesOut.push(c);
    }
    return framesOut;
  }

  async function loadNamed(bases, file) {
    for (const base of bases) {
      const img = await loadImage(base + file);
      if (img) return { img, frames: splitStrip(img) };
    }
    return null;
  }

  const uvFrameCache = new Map();
  let imgUid = 1;
  function uidOf(img) {
    if (!img) return 0;
    return img._leUid || (img._leUid = imgUid++);
  }

  function cropFrame(img, sx, sy, sw, sh) {
    const c = document.createElement("canvas");
    const w = Math.max(1, Math.round(sw));
    const h = Math.max(1, Math.round(sh));
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    return c;
  }

  function framesFromUv(img, spec) {
    if (!img) return [];
    const mode = String(spec.uv_mode || "full");
    if (mode === "full") return [img];
    const texW = Math.max(1, Number(spec.tex_w) || img.width);
    const texH = Math.max(1, Number(spec.tex_h) || img.height);
    const uvW = Math.max(1, Number(spec.uv_w) || 16);
    const uvH = Math.max(1, Number(spec.uv_h) || 16);
    const uvX = Number(spec.uv_x) || 0;
    const uvY = Number(spec.uv_y) || 0;
    const stepX = Number(spec.uv_step_x) || 0;
    const stepY = Number(spec.uv_step_y) || 0;
    const max = Math.min(64, Math.max(1, Math.trunc(Number(spec.uv_max) || 1)));
    const key = uidOf(img) + ":" + mode + ":" + texW + ":" + texH + ":" + uvX + ":" + uvY + ":" + uvW + ":" + uvH + ":" + stepX + ":" + stepY + ":" + max;
    const hit = uvFrameCache.get(key);
    if (hit) return hit;
    const scaleX = img.width / texW;
    const scaleY = img.height / texH;
    let out;
    if (mode === "static") {
      out = [cropFrame(img, uvX * scaleX, uvY * scaleY, uvW * scaleX, uvH * scaleY)];
    } else {
      out = [];
      const wrap = stepX > 0 && stepY > 0;
      const cols = Math.max(1, Math.floor(Math.max(uvW, texW - uvX) / Math.max(1, stepX || uvW)));
      for (let i = 0; i < max; i++) {
        let sx = uvX + i * stepX;
        let sy = uvY + i * stepY;
        if (wrap) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          sx = uvX + col * stepX;
          sy = uvY + row * stepY;
        }
        out.push(cropFrame(img, sx * scaleX, sy * scaleY, uvW * scaleX, uvH * scaleY));
      }
    }
    if (uvFrameCache.size > 40) uvFrameCache.delete(uvFrameCache.keys().next().value);
    uvFrameCache.set(key, out);
    return out;
  }

  async function loadList(bases, paths) {
    for (const base of bases) {
      const framesOut = [];
      let ok = 0;
      for (const p of paths) {
        const img = await loadImage(base + p);
        if (img) {
          ok++;
          framesOut.push(...splitStrip(img));
        }
      }
      if (ok > 0) return framesOut;
    }
    return [];
  }

  function makePixel(size, paint) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    paint(ctx, size);
    return c;
  }

  function sparkFallback() {
    return [
      makePixel(16, (ctx) => {
        ctx.fillStyle = "#fff6c8";
        ctx.fillRect(7, 1, 2, 14);
        ctx.fillRect(1, 7, 14, 2);
        ctx.fillStyle = "#ffe566";
        ctx.fillRect(6, 6, 4, 4);
        ctx.fillStyle = "#fff";
        ctx.fillRect(7, 7, 2, 2);
      }),
    ];
  }

  const FALLBACK = {
    sparkle: sparkFallback(),
    smoke: sparkFallback(),
    magic: sparkFallback(),
    spark: sparkFallback(),
    dust: sparkFallback(),
    ball: sparkFallback(),
    leaves: sparkFallback(),
    dirt: sparkFallback(),
  };

  function familyOf(type) {
    const s = String(type || "").toLowerCase();
    if (s.startsWith("snowstorm:") || s.startsWith("qs:")) {
      const key = s.split(":")[1] || "spark";
      const bySprite = {
        sparkle: { key: "sparkle", additive: true, tint: [1, 1, 1], scale: 1.1, fps: 15 },
        smoke: { key: "smoke", additive: false, tint: [1, 1, 1], scale: 1.4, fps: 12 },
        magic: { key: "magic", additive: true, tint: [1, 1, 1], scale: 1.05, fps: 12 },
        spark: { key: "spark", additive: true, tint: [1, 1, 1], scale: 0.9, fps: 1 },
        dust: { key: "dust", additive: false, tint: [1, 1, 1], scale: 0.95, fps: 12 },
        ball: { key: "ball", additive: false, tint: [1, 1, 1], scale: 0.85, fps: 1 },
        leaves: { key: "leaves", additive: false, tint: [1, 1, 1], scale: 0.9, fps: 1 },
        dirt: { key: "dirt", additive: false, tint: [1, 1, 1], scale: 0.85, fps: 1 },
      };
      return bySprite[key] || { key: key || "spark", additive: true, tint: [1, 1, 1], scale: 1, fps: 10 };
    }
    if (s.includes("soul_fire") || s.includes("soul")) {
      return { key: "magic", additive: true, tint: [0.55, 0.9, 1], scale: 1.05, fps: 10 };
    }
    if (s.includes("flame") || s.includes("lava") || s.includes("fire")) {
      return { key: "sparkle", additive: true, tint: [1, 1, 1], scale: 1.15, fps: 12 };
    }
    if (s.includes("snow") || s.includes("ice") || s.includes("drip")) {
      return { key: "ball", additive: false, tint: [0.9, 0.97, 1], scale: 0.72, fps: 1 };
    }
    if (s.includes("smoke") || s.includes("ash") || s.includes("cloud") || s.includes("poof") || s.includes("campfire")) {
      return { key: "smoke", additive: false, tint: [1, 1, 1], scale: 1.45, fps: 8 };
    }
    if (s.includes("enchant") || s.includes("witch") || s.includes("dragon") || s.includes("portal") || s.includes("arcane") || s.includes("ambient") || s.includes("magic") || s.includes("effect")) {
      return { key: "magic", additive: true, tint: [1, 1, 1], scale: 1.05, fps: 10 };
    }
    if (s.includes("dust") || s.includes("redstone")) {
      return { key: "dust", additive: false, tint: [1, 1, 1], scale: 0.95, fps: 8 };
    }
    if (s.includes("leaf") || s.includes("spore") || s.includes("composter")) {
      return { key: "leaves", additive: false, tint: [1, 1, 1], scale: 0.9, fps: 1 };
    }
    if (s.includes("heart")) {
      return { key: "sparkle", additive: true, tint: [1, 0.35, 0.5], scale: 0.85, fps: 10 };
    }
    if (s.includes("happy") || s.includes("villager")) {
      return { key: "sparkle", additive: true, tint: [0.45, 1, 0.4], scale: 0.85, fps: 10 };
    }
    if (s.includes("slash") || s.includes("sweep") || s.includes("crit") || s.includes("spark") || s.includes("firework") || s.includes("end_rod") || s.includes("glow") || s.includes("totem") || s.includes("electric")) {
      return { key: "spark", additive: true, tint: [1, 1, 1], scale: 0.9, fps: 1 };
    }
    if (s.includes("hit_burst") || s.includes("damage") || s.includes("explosion")) {
      return { key: "sparkle", additive: true, tint: [1, 0.55, 0.2], scale: 1.2, fps: 12 };
    }
    if (s.includes("dirt") || s.includes("block")) {
      return { key: "dirt", additive: false, tint: [1, 1, 1], scale: 0.85, fps: 1 };
    }
    if (s.includes("vaerun") && s.includes("ice")) {
      return { key: "ball", additive: false, tint: [1, 1, 1], scale: 0.85, fps: 8 };
    }
    return { key: "spark", additive: true, tint: [1, 1, 1], scale: 0.85, fps: 1 };
  }

  async function init() {
    if (inited) return;
    inited = true;
    for (const [key, file] of Object.entries(SNOW_FILES)) {
      const loaded = await loadNamed(SNOW_BASES, file);
      if (loaded && loaded.img) {
        sheets[key] = loaded.img;
        sheets["snowstorm:" + key] = loaded.img;
        byType[key] = loaded.frames.length ? loaded.frames : FALLBACK[key] || FALLBACK.spark;
      } else {
        byType[key] = FALLBACK[key] || FALLBACK.spark;
      }
    }
    const blockLoaded = await loadNamed(SNOW_BASES, "minecraft_block.png");
    blockImg = blockLoaded && blockLoaded.img ? blockLoaded.img : (blockLoaded && blockLoaded.frames ? blockLoaded.frames[0] : null);
    for (const [key, paths] of Object.entries(LE_PACK)) {
      const loaded = await loadList(LE_BASES, paths);
      if (loaded.length) extra["le:" + key] = loaded;
    }
  }

  function remember(name, framesIn, img) {
    extra[name.toLowerCase()] = framesIn;
    const stem = name.replace(/\.[^.]+$/, "").toLowerCase();
    extra[stem] = framesIn;
    extra[stem.replace(/_\d+$/, "")] = extra[stem.replace(/_\d+$/, "")] || framesIn;
    if (img) {
      sheets[name.toLowerCase()] = img;
      sheets[stem] = img;
      sheets["custom:" + stem] = img;
    }
  }

  function setSheet(id, img) {
    if (!id || !img) return;
    const key = String(id).toLowerCase();
    sheets[key] = img;
    extra[key] = splitStrip(img);
  }

  function getSheet(id) {
    const key = String(id || "").toLowerCase();
    return sheets[key] || sheets[key.replace(/^snowstorm:/, "")] || sheets[key.replace(/^custom:/, "")] || null;
  }

  async function ingestBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const img = await loadImage(url);
    if (!img) return null;
    remember(name, splitStrip(img), img);
    return img;
  }

  async function ingestFile(file) {
    if (!file) return null;
    const img = await ingestBlob(file.name, file);
    return img;
  }

  async function loadFromFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f.name));
    for (const f of files) {
      const rel = (f.webkitRelativePath || f.name).replace(/\\/g, "/");
      await ingestBlob(rel.split("/").pop(), f);
    }
    return files.length;
  }

  async function loadFromZip(file) {
    if (typeof JSZip === "undefined") {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }).catch(() => null);
    }
    if (typeof JSZip === "undefined") throw new Error("Could not load JSZip (need internet once).");
    const zip = await JSZip.loadAsync(file);
    let n = 0;
    const entries = [];
    zip.forEach((path, entry) => {
      if (/assets\/minecraft\/textures\/particle\/.*\.png$/i.test(path) && !entry.dir) entries.push({ path, entry });
    });
    for (const { path, entry } of entries) {
      const blob = await entry.async("blob");
      await ingestBlob(path.split("/").pop(), blob);
      n++;
    }
    return n;
  }

  function getFrames(type) {
    const id = String(type || "").toLowerCase();
    if (extra[id] && extra[id].length) return extra[id];
    const short = id.includes(":") ? id.split(":")[1] : id;
    if (extra[short] && extra[short].length) return extra[short];
    if (id.includes("vaerun")) {
      if (id.includes("slash") && extra["le:slash"]) return extra["le:slash"];
      if (id.includes("hit") && extra["le:hit"]) return extra["le:hit"];
      if ((id.includes("ice") || id.includes("frost")) && extra["le:ice"]) return extra["le:ice"];
      if ((id.includes("fire") || id.includes("flame")) && extra["le:fireball"]) return extra["le:fireball"];
    }
    const fam = familyOf(id);
    return byType[fam.key] || FALLBACK[fam.key] || FALLBACK.spark;
  }

  function style(type) {
    return familyOf(type);
  }

  window.leParticleSprites = {
    init,
    loadFromFiles,
    loadFromZip,
    getFrames,
    framesFromUv,
    setSheet,
    getSheet,
    ingestFile,
    style,
    familyOf,
    snowstormKeys: () => Object.keys(SNOW_FILES),
    getBlockImage: () => blockImg,
  };
})();
