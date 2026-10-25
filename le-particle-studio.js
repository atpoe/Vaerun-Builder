/* Vaerun particle studio — Snowstorm-style 3D editor for skill_vfx_particles.
   Loaded after index.html so it can reuse attrEsc / particle type helpers. */
(function () {
  "use strict";

  const SHAPES = [
    ["point", "point"],
    ["disc", "disc"],
    ["circle", "circle"],
    ["circle_2d", "circle_2d"],
    ["segmented_ring", "segmented ring"],
    ["concentric", "concentric rings"],
    ["radial_burst", "radial burst"],
    ["sphere", "sphere"],
    ["box", "box"],
    ["radius", "radius"],
    ["helix", "helix / spiral"],
    ["pillar", "pillar"],
    ["line_forward", "beam / line"],
    ["line_up", "line up"],
    ["curve", "curved path"],
    ["cone", "cone"],
    ["arc", "ribbon / arc"],
    ["shockwave", "shockwave"],
    ["rune", "rune pattern"],
    ["shard", "shards / fragments"],
    ["custom", "custom (draw points)"],
  ];
  const SPRITE_STYLES = [
    ["glow", "glow (energy)"],
    ["core", "core / mote"],
    ["spark", "spark"],
    ["shard", "shard / crystal"],
    ["smoke", "smoke"],
    ["rune", "rune mark"],
    ["slash", "slash / ribbon"],
    ["mote", "small mote"],
  ];
  const CURVES = [
    ["linear", "linear"],
    ["smooth", "smooth"],
    ["fade_in_out", "fade in/out"],
    ["pulse", "pulse"],
    ["flicker", "flicker"],
  ];
  const BLENDS = [
    ["add", "additive glow"],
    ["translucent", "translucent"],
    ["opaque", "opaque"],
  ];
  const SHAPE_GROUPS = [
    ["Rings & discs", [
      ["circle", "ring"],
      ["disc", "filled disc"],
      ["segmented_ring", "segmented ring"],
      ["concentric", "concentric rings"],
      ["shockwave", "shockwave ring"],
      ["torus", "torus / donut"],
      ["portal", "portal"],
      ["spokes", "spokes"],
      ["ripple", "ripple rings"],
    ]],
    ["Volumes", [
      ["sphere", "sphere shell"],
      ["cluster", "cluster / blob"],
      ["box", "box volume"],
      ["cube_edges", "cube edges"],
      ["cylinder", "cylinder"],
      ["dome", "dome / hemisphere"],
      ["pyramid", "pyramid"],
      ["hourglass", "hourglass"],
      ["octahedron", "octahedron"],
      ["tetrahedron", "tetrahedron"],
    ]],
    ["Columns & paths", [
      ["helix", "helix"],
      ["double_helix", "double helix"],
      ["tornado", "tornado funnel"],
      ["spiral_flat", "flat spiral"],
      ["pillar", "pillar / column"],
      ["line_forward", "beam / line"],
      ["line_up", "line up"],
      ["curve", "curved path"],
      ["arch", "arch"],
      ["zigzag", "zigzag"],
      ["cone", "cone"],
      ["fountain", "fountain spray"],
      ["lightning_bolt", "lightning bolt"],
      ["sky_beam", "sky beam"],
      ["meteor_path", "meteor path"],
      ["ground_crack", "ground crack"],
      ["breath", "breath / volume"],
      ["fork", "fork / Y"],
    ]],
    ["Symbols", [
      ["arc", "ribbon / arc"],
      ["star", "star"],
      ["cross", "cross"],
      ["polygon", "polygon"],
      ["crescent", "crescent"],
      ["flower", "flower / petals"],
      ["figure8", "figure-8"],
      ["rune", "rune pattern"],
      ["shard", "shards"],
      ["galaxy", "galaxy arms"],
      ["grid", "grid"],
      ["wall", "wall / plane"],
      ["disc_vertical", "vertical disc"],
      ["chevron", "chevron"],
      ["trefoil", "trefoil knot"],
    ]],
  ];
  const MOTION_GROUPS = [
    ["Spin", [
      ["spin_cw", "spin clockwise"],
      ["spin_ccw", "spin counter-clockwise"],
      ["orbit", "orbit"],
      ["reverse_orbit", "orbit reverse"],
      ["spin_out", "spin out"],
      ["spin_in", "spin in"],
      ["swirl", "swirl (orbit + rise)"],
      ["helix_spin", "helix climb"],
      ["tornado", "tornado"],
    ]],
    ["Push", [
      ["burst", "burst"],
      ["scatter", "scatter + gravity"],
      ["expand", "expand"],
      ["contract", "contract"],
      ["implosion", "implosion"],
      ["attract", "attract to center"],
      ["suction", "suction down"],
    ]],
    ["Lift", [
      ["rise", "rise"],
      ["fall", "fall"],
      ["fountain", "fountain (up then down)"],
      ["rain", "rain"],
      ["flatten", "flatten"],
      ["stretch", "stretch up"],
      ["lightning_strike", "lightning strike"],
      ["slam", "slam from above"],
      ["meteor", "meteor drop"],
      ["chain_fall", "chain fall"],
      ["corkscrew", "corkscrew down"],
    ]],
    ["Waves", [
      ["wave", "wave"],
      ["pulse", "pulse scale"],
      ["wobble", "wobble"],
      ["oscillate", "oscillate"],
      ["drift", "drift"],
      ["flutter", "flutter"],
      ["shake", "shake"],
      ["hover", "hover"],
      ["bounce", "bounce"],
      ["dash", "dash forward"],
      ["whip", "whip / lash"],
    ]],
  ];
  const MOTIONS = MOTION_GROUPS.flatMap((g) => g[1]);
  const RATE_MODES = [["steady", "Steady"], ["instant", "Instant"]];
  const LIFE_MODES = [["looping", "Looping"], ["once", "Once"]];
  const DIR_MODES = [["outwards", "Outwards"], ["inwards", "Inwards"], ["up", "Up"], ["custom", "Custom"]];
  const ANCHORS = [
    ["feet", "feet"],
    ["eye", "eye"],
    ["look", "look"],
    ["world", "world"],
  ];
  const QS_SPRITES = [
    ["ball", "Ball"],
    ["dirt", "Dirt"],
    ["leaves", "Leaves"],
    ["smoke", "Smoke"],
    ["dust", "Dust"],
    ["sparkle", "Sparkle"],
    ["magic", "Magic"],
  ];
  const QS_SPRITE_TYPE = {
    ball: "minecraft:snowflake",
    dirt: "minecraft:crit",
    leaves: "minecraft:spore_blossom_air",
    smoke: "minecraft:smoke",
    dust: "minecraft:ash",
    sparkle: "minecraft:end_rod",
    magic: "minecraft:enchant",
  };
  const QS_SPRITE_LOOK = {
    ball: { size: 0.4, size_end: 0.4 },
    dirt: { size: 0.5, size_end: 0.5 },
    leaves: { size: 0.25, size_end: 0.25 },
    smoke: { size: 0.5, size_end: 0.72 },
    dust: { size: 0.3, size_end: 0.18 },
    sparkle: { size: 0.5, size_end: 0.22 },
    magic: { size: 0.25, size_end: 0.12 },
  };
  const QS_SPRITE_UV = {
    ball: { uv_mode: "full", tex_w: 16, tex_h: 16, uv_w: 16, uv_h: 16, uv_max: 1, uv_fps: 1, uv_loop: false },
    dirt: { uv_mode: "full", tex_w: 16, tex_h: 16, uv_w: 16, uv_h: 16, uv_max: 1, uv_fps: 1, uv_loop: false },
    leaves: { uv_mode: "static", tex_w: 16, tex_h: 16, uv_w: 8, uv_h: 8, uv_max: 1, uv_fps: 1, uv_loop: false },
    smoke: { uv_mode: "animated", tex_w: 16, tex_h: 128, uv_w: 16, uv_h: 16, uv_step_x: 0, uv_step_y: 16, uv_fps: 12, uv_max: 8, uv_stretch: true, uv_loop: false },
    dust: { uv_mode: "animated", tex_w: 8, tex_h: 64, uv_w: 8, uv_h: 8, uv_step_x: 0, uv_step_y: 8, uv_fps: 12, uv_max: 8, uv_stretch: true, uv_loop: false },
    sparkle: { uv_mode: "animated", tex_w: 16, tex_h: 64, uv_w: 16, uv_h: 16, uv_step_x: 0, uv_step_y: 16, uv_fps: 15, uv_max: 4, uv_stretch: false, uv_loop: true },
    magic: { uv_mode: "animated", tex_w: 16, tex_h: 128, uv_w: 8, uv_h: 8, uv_step_x: 0, uv_step_y: 16, uv_fps: 12, uv_max: 8, uv_stretch: true, uv_loop: false },
  };
  const INSPECT_TABS = [
    ["setup", "Setup", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4l5 5-9 9H6v-5z"/><path d="M12.5 6.5l5 5"/></svg>'],
    ["emitter", "Emitter", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>'],
    ["shape", "Shape", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/></svg>'],
    ["motion", "Motion", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19c4-8 8-12 16-14"/><path d="M14 5h6v6"/></svg>'],
    ["appearance", "Look", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.9 6.5l1.6 1.2M17.5 16.3l1.6 1.2M3 12h2M19 12h2M4.9 17.5l1.6-1.2M17.5 7.7l1.6-1.2"/></svg>'],
    ["texture", "Texture", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="M4 16l5-4 4 3 3-2 4 3"/></svg>'],
  ];
  const EMITTER_TABS = [
    ["look", "Look", INSPECT_TABS[4][2]],
    ["shape", "Shape", INSPECT_TABS[2][2]],
    ["motion", "Motion", INSPECT_TABS[3][2]],
    ["timing", "Time", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>'],
  ];

  const LE_PV = {
    yaw: 0.62,
    pitch: 0.52,
    dist: 11,
    panX: 0,
    panY: 0.7,
    panZ: 0,
    paused: false,
    pauseTick: 0,
    t0: 0,
    seed: 1,
    parts: [],
    raf: 0,
    inited: false,
    drag: false,
    moved: false,
    dragMode: "orbit",
    lastX: 0,
    lastY: 0,
    tool: "orbit",
    selected: 0,
    currentPath: "",
    currentHandle: null,
    folderName: "",
    folderHandle: null,
    folderWritable: false,
    tree: [],
    fallbackFiles: null,
    doc: emptyDoc(),
    lastEmit: {},
    showGrid: true,
    showAxis: true,
    showBlock: true,
    showYou: true,
    showArrow: true,
    showMob: true,
    showOrigin: true,
    showHelpers: true,
    previewLoop: "auto",
    scrubbing: false,
    inspectTab: "setup",
    rebuildTimer: 0,
    sheetDrag: null,
    lastSim: 0,
    simCarry: 0,
    vis: [],
    tintCache: null,
    ctx: null,
    drawCanvas: null,
    hudCount: -1,
  };
  const PREVIEW_CAP = 420;
  const PROC_SPRITES = {};
  const tintCache = new Map();
  let tintUid = 1;

  function emptyDoc() {
    return {
      kind: "emitter",
      projectile_trail: "",
      layers: [newLayer("Emitter 1")],
    };
  }

  function newLayer(name, role) {
    const kind = role === "shape" ? "shape" : "emitter";
    return {
      name: name || (kind === "shape" ? "Shape" : "Emitter"),
      role: kind,
      enabled: true,
      type: kind === "shape" ? "minecraft:flame" : "vaerun:emitter",
      shape: "circle",
      count: 32,
      spread: 0.06,
      speed: 0.04,
      shape_radius: 1.2,
      shape_samples: 16,
      line_length: 3,
      pillar_height: 2.4,
      helix_turns: 2,
      spin_steps: 16,
      spin_delay_ticks: 1,
      pillar_layers: 8,
      taper: 0.2,
      anchor: "feet",
      offset_right: 0,
      offset_up: 0.08,
      offset_forward: 0,
      delay_ticks: 0,
      points: [],
      closed: false,
      loop: false,
      loop_interval_ticks: 0,
      duration_ticks: 0,
      emitter: false,
      rate_mode: "instant",
      emit_rate: 8,
      amount: 16,
      maximum: 100,
      lifetime_mode: "once",
      active_time: 1,
      sleep_time: 0,
      particle_lifetime_ticks: 28,
      direction: "outwards",
      dir_x: 0,
      dir_y: 1,
      dir_z: 0,
      surface_only: false,
      accel_x: 0,
      accel_y: 0,
      accel_z: 0,
      gravity: 0,
      drag: 0,
      size: 0.35,
      size_y: 0.25,
      size_end: 0.25,
      collision: false,
      bounce: 0.35,
      expire_on_contact: false,
      additive: true,
      material: "particles_add",
      facing: "rotate_xyz",
      lighting: false,
      color_mode: "static",
      color_hex: "#ffffff",
      gradient: [
        { t: 0, hex: "#ff0000" },
        { t: 0.5, hex: "#21e931" },
        { t: 1, hex: "#7b2cff" },
      ],
      gradient_range: 1,
      gradient_interpolant: "v.particle_age / v.particle_lifetime",
      _colorStop: 0,
      sprite: "",
      qs_shape: "",
      qs_timing: "",
      qs_physics: "none",
      random_rotation: false,
      flutter: false,
      tex_path: "",
      tex_id: "",
      uv_mode: "animated",
      tex_w: 16,
      tex_h: 16,
      uv_x: 0,
      uv_y: 0,
      uv_w: 16,
      uv_h: 16,
      uv_dir: "left_right",
      uv_step_x: 16,
      uv_step_y: 0,
      uv_fps: 10,
      uv_max: 1,
      uv_stretch: false,
      uv_loop: true,
      box_x: 0.5,
      box_y: 0.4,
      box_z: 0.5,
      _acc: 0,
      _age: 0,
      _spawnedInstant: false,
      motion_type: "orbit",
      motion_axis: "y",
      degrees_per_tick: 8,
      color_start: "#70B8FF",
      color_end: "#D9A6FF",
      tint: true,
      fade_in_ticks: 3,
      fade_out_ticks: 8,
      radius_start: 0.2,
      radius_end: 0.8,
      scale_curve: "fade_in_out",
      alpha_curve: "fade_in_out",
      color_curve: "linear",
      speed_curve: "linear",
      emit_curve: "linear",
      sprite_style: "glow",
      size_var: 0.18,
      spin: 0.04,
      rot_start: 0,
      rot_deg: 0,
      flip_x: false,
      flip_y: false,
      blend: "add",
      trail: false,
      trail_len: 6,
      start_tick: 0,
      emit_duration_ticks: 0,
      segments: 6,
      gap: 0.22,
      rings: 3,
      rune_petals: 6,
      rune_mark: "star",
      attach: "origin",
      offset_x: 0,
      offset_y: 0,
      offset_z: 0,
      seed: 1,
      arc_spread: 2.6,
      poly_sides: 5,
      torus_tube: 0.28,
      flower_petals: 6,
      galaxy_arms: 3,
      wave_amp: 0.12,
      wave_freq: 0.35,
    };
  }

  function layerIsEmitter(layer) {
    if (!layer) return false;
    const r = String(layer.role || layer.kind || "").toLowerCase();
    if (r === "shape" || r === "program") return false;
    if (r === "emitter" || r === "toolkit") return true;
    return String(LE_PV.doc.kind || "emitter") !== "shape";
  }

  function syncDocKind() {
    const layers = LE_PV.doc.layers || [];
    LE_PV.doc.kind = layers.some(layerIsEmitter) ? "emitter" : "shape";
  }

  function layerInterval(layer) {
    const custom = Math.max(0, Math.trunc(num(layer.loop_interval_ticks, 0)));
    if (custom > 0) return custom;
    const shape = String(layer.shape || "");
    const delay = Math.max(1, Math.trunc(num(layer.spin_delay_ticks, 1)));
    if (/helix|spiral|spin_/.test(shape)) {
      return Math.max(4, Math.trunc(num(layer.spin_steps, 16)) * delay);
    }
    if (shape === "pillar" || shape === "column") {
      return Math.max(4, Math.trunc(num(layer.pillar_layers, 8)) * delay);
    }
    return 10;
  }

  function usesSteadyEmitter(layer) {
    if (!layer) return false;
    if (String(layer.rate_mode || "") === "steady") return true;
    if (String(layer.rate_mode || "") === "instant") return false;
    return !!layer.emitter && num(layer.emit_rate, 0) > 0;
  }

  function usesPhysEmitter(layer) {
    return !!layer && !!layer.emitter;
  }

  function emitLayer(layer, tick) {
    if (usesSteadyEmitter(layer)) {
      spawnEmitterParticle(layer);
      return;
    }
    const rng = mulberry((LE_PV.seed + Math.trunc(performance.now()) + LE_PV.parts.length * 17) >>> 0);
    const spawned = spawnFromBursts(sampleShape(layer, rng), layer.type, rng, fireish(layer.type) ? 0.0018 : 0.0004);
    const bornAt = Math.max(0, num(tick, 0));
    spawned.forEach((p) => {
      p.born += bornAt;
    });
    LE_PV.parts.push(...spawned);
  }

  function norm(v) {
    const l = Math.hypot(v.x, v.y, v.z) || 1;
    return vec(v.x / l, v.y / l, v.z / l);
  }

  function sampleSpawn(layer, rng, tHint) {
    const o = layerOrigin(layer);
    const radius = Math.max(0.05, num(layer.shape_radius, 0.65));
    const h = Math.max(0.2, num(layer.pillar_height, 2.4));
    const shape = String(layer.shape || "point");
    let local = vec(0, 0, 0);
    let normal = vec(0, 1, 0);
    const along = tHint == null ? rng() : Math.max(0, Math.min(1, tHint));
    if (shape === "sphere" || shape === "radius") {
      const theta = 2 * Math.PI * rng();
      const phi = Math.acos(2 * rng() - 1);
      let r = radius;
      if (shape === "radius" || !layer.surface_only) r *= Math.cbrt(rng());
      local = vec(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      normal = local;
    } else if (shape === "box") {
      local = vec((rng() * 2 - 1) * num(layer.box_x, radius), rng() * num(layer.box_y, 0.4) * 2, (rng() * 2 - 1) * num(layer.box_z, radius));
      normal = vec(local.x, 0.15, local.z);
    } else if (shape === "disc" || shape === "circle" || shape === "circle_2d" || shape === "square") {
      const ang = 2 * Math.PI * rng();
      const r = layer.surface_only ? radius : radius * Math.sqrt(rng());
      local = vec(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      normal = vec(local.x, 0.05, local.z);
    } else if (shape === "helix" || shape === "spiral_up") {
      const t = along;
      const ang = Math.PI * 2 * Math.max(1, num(layer.helix_turns, 2)) * t;
      local = vec(Math.cos(ang) * radius, h * t, Math.sin(ang) * radius);
      normal = vec(local.x, 0.25, local.z);
    } else if (shape === "pillar" || shape === "column") {
      const t = along;
      const ang = 2 * Math.PI * rng();
      const r = radius * (1 - num(layer.taper, 0.2) * t);
      local = vec(Math.cos(ang) * r, h * t, Math.sin(ang) * r);
      normal = vec(local.x, 0.1, local.z);
    } else if (shape === "cone" || shape.startsWith("line_")) {
      const t = rng();
      const len = Math.max(0.2, num(layer.line_length, 2.4));
      if (shape === "line_up") local = vec(0, len * t, 0);
      else local = vec(0, 0, len * t);
      normal = shape === "line_up" ? vec(0, 1, 0) : vec(0, 0.2, 1);
    } else if ((shape === "custom" || shape === "path" || shape === "points") && layer.points.length) {
      const pt = layer.points[Math.floor(rng() * layer.points.length)];
      local = vec(num(pt.x, 0), num(pt.y, 0), num(pt.z, 0));
      normal = vec(local.x, 0.2, local.z);
    }
    const pos = add(o, local);
    const dm = String(layer.direction || "outwards");
    let dir;
    if (dm === "inwards") dir = scale(norm(normal), -1);
    else if (dm === "up") dir = vec(0, 1, 0);
    else if (dm === "custom") dir = norm(vec(num(layer.dir_x, 0), num(layer.dir_y, 1), num(layer.dir_z, 0)));
    else dir = norm(Math.hypot(normal.x, normal.y, normal.z) < 1e-6 ? vec(0, 1, 0) : normal);
    return { pos, dir };
  }

  function spawnEmitterParticle(layer) {
    if (LE_PV.parts.length >= PREVIEW_CAP) return;
    const rng = mulberry((LE_PV.seed + Math.trunc(performance.now() * 10) + LE_PV.parts.length * 17) >>> 0);
    const shape = String(layer.shape || "");
    let tHint;
    if (shape === "helix" || shape === "spiral_up" || shape === "pillar" || shape === "column") {
      const steps = Math.max(4, Math.trunc(num(layer.spin_steps, shape === "pillar" ? num(layer.pillar_layers, 10) : 16)));
      layer._helixStep = (layer._helixStep || 0) + 1;
      tHint = ((layer._helixStep - 1) % steps) / Math.max(1, steps - 1);
    }
    const { pos, dir } = sampleSpawn(layer, rng, tHint);
    const previewType = layer.tex_id || (layer.sprite ? "snowstorm:" + layer.sprite : layer.type);
    const st = window.leParticleSprites ? window.leParticleSprites.style(previewType) : { additive: true, fps: 10, scale: 1 };
    const tinted = particleRgbAt(layer, 0, rng());
    const col = tinted || colorForType(layer.type);
    const speed = num(layer.speed, 3) / 20;
    const life = Math.max(2, num(layer.particle_lifetime_ticks, 28));
    const spinBase = layer.facing === "rotate_xyz" || layer.random_rotation ? (rng() - 0.5) * (layer.random_rotation ? 0.28 : 0.08) : 0;
    const additive = String(layer.material || "") === "particles_add" || (layer.additive !== false && String(layer.material || "") !== "particles_blend" && String(layer.material || "") !== "particles_opaque");
    LE_PV.parts.push({
      x: pos.x,
      y: pos.y,
      z: pos.z,
      vx: dir.x * speed,
      vy: dir.y * speed,
      vz: dir.z * speed,
      born: 0,
      age: 0,
      life,
      size: num(layer.size, 0.25) * 48 * (st.scale || 1),
      sizeY: num(layer.size_y, layer.size || 0.25) * 48 * (st.scale || 1),
      sizeEnd: num(layer.size_end, num(layer.size, 0.25)) * 48 * (st.scale || 1),
      r: col[0],
      g: col[1],
      b: col[2],
      stops: layer.color_mode === "gradient" ? layerGradient(layer).map((s) => ({ t: s.t, hex: s.hex })) : null,
      gradRange: num(layer.gradient_range, 1),
      gradInterp: layer.gradient_interpolant || "",
      gradRand: rng(),
      gravity: 0,
      type: previewType,
      rot: rng() * Math.PI * 2,
      spin: spinBase,
      additive,
      fps: num(layer.uv_fps, st.fps || 10),
      uvStretch: !!layer.uv_stretch,
      uvLoop: layer.uv_loop !== false,
      uvFrames: framesForLayer(layer, previewType),
      tint: st.tint || [1, 1, 1],
      frameOff: Math.floor(rng() * 8),
      ax: num(layer.accel_x, 0) / 20,
      ay: (num(layer.accel_y, 0) - num(layer.gravity, 0)) / 20,
      az: num(layer.accel_z, 0) / 20,
      drag: Math.max(0, Math.min(0.9, num(layer.drag, 0) / 20)),
      collision: !!layer.collision,
      bounce: num(layer.bounce, 0.35),
      expire: !!layer.expire_on_contact,
      flutter: !!layer.flutter,
      live: true,
      _layer: layer,
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function mulberry(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function vec(x, y, z) {
    return { x, y, z };
  }
  function add(a, b) {
    return vec(a.x + b.x, a.y + b.y, a.z + b.z);
  }
  function scale(a, s) {
    return vec(a.x * s, a.y * s, a.z * s);
  }
  function lerp(a, b, t) {
    return vec(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  }
  function num(v, d) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function readLiveNumber(el, fallback, min) {
    if (!el) return fallback;
    const raw = String(el.value ?? "").trim();
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n)) return fallback;
    return min != null ? Math.max(min, n) : n;
  }

  function colorForType(type) {
    if (type && typeof type === "object" && !Array.isArray(type)) {
      return [num(type.r, 0.4), num(type.g, 0.8), num(type.b, 1)];
    }
    const s = String(type || "").toLowerCase();
    if (s.includes("soul_fire")) return [0.35, 0.85, 1];
    if (s.includes("flame") || s.includes("lava")) return [1, 0.48, 0.12];
    if (s.includes("snow") || s.includes("item_snow")) return [0.86, 0.95, 1];
    if (s.includes("enchant") || s.includes("witch") || s.includes("dragon") || s.includes("arcane")) return [0.72, 0.48, 1];
    if (s.includes("end_rod") || s.includes("firework") || s.includes("totem")) return [1, 0.95, 0.72];
    if (s.includes("spark") || s.includes("crit") || s.includes("electric")) return [1, 0.92, 0.32];
    if (s.includes("sweep") || s.includes("slash")) return [0.88, 0.92, 1];
    if (s.includes("cloud") || s.includes("smoke") || s.includes("poof") || s.includes("ash")) return [0.55, 0.58, 0.62];
    if (s.includes("heart")) return [1, 0.28, 0.42];
    if (s.includes("happy") || s.includes("villager")) return [0.42, 1, 0.38];
    if (s.includes("damage") || s.includes("hit_burst") || s.includes("explosion")) return [1, 0.32, 0.18];
    return [0.7, 0.86, 1];
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function hexToRgb(hex) {
    let s = String(hex || "#ffffff").replace("#", "").trim();
    if (s.length === 3) s = s.split("").map((c) => c + c).join("");
    const n = parseInt(s, 16);
    if (!Number.isFinite(n)) return [1, 1, 1];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function rgbToHex(r, g, b) {
    const h = (n) => Math.round(clamp01(n) * 255).toString(16).padStart(2, "0");
    return ("#" + h(r) + h(g) + h(b)).toUpperCase();
  }

  function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d > 1e-6) {
      if (max === r) h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h, s: max <= 1e-6 ? 0 : d / max, v: max };
  }

  function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [r + m, g + m, b + m];
  }

  function defaultGradient() {
    return [
      { t: 0, hex: "#FF0000" },
      { t: 0.5, hex: "#21E931" },
      { t: 1, hex: "#7B2CFF" },
    ];
  }

  function layerGradient(layer) {
    if (!Array.isArray(layer.gradient) || !layer.gradient.length) layer.gradient = defaultGradient();
    return layer.gradient;
  }

  function currentColorHex(layer) {
    if (layer.color_mode === "gradient") {
      const g = layerGradient(layer);
      const i = Math.max(0, Math.min(g.length - 1, layer._colorStop || 0));
      return g[i].hex || "#FFFFFF";
    }
    return layer.color_hex || "#FFFFFF";
  }

  function setCurrentColorHex(layer, hex) {
    hex = rgbToHex(...hexToRgb(hex));
    if (layer.color_mode === "gradient") {
      const g = layerGradient(layer);
      const i = Math.max(0, Math.min(g.length - 1, layer._colorStop || 0));
      g[i].hex = hex;
    } else {
      layer.color_hex = hex;
    }
  }

  function sampleColorStops(stops, t) {
    if (!stops || !stops.length) return [1, 1, 1];
    t = clamp01(t);
    if (t <= stops[0].t) return hexToRgb(stops[0].hex);
    const last = stops[stops.length - 1];
    if (t >= last.t) return hexToRgb(last.hex);
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].t && t <= stops[i + 1].t) {
        const u = (t - stops[i].t) / Math.max(1e-6, stops[i + 1].t - stops[i].t);
        const a = hexToRgb(stops[i].hex);
        const b = hexToRgb(stops[i + 1].hex);
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
      }
    }
    return hexToRgb(last.hex);
  }

  function particleRgbAt(layer, t, rand) {
    if (layer.color_mode === "gradient") {
      const range = Math.max(0.001, num(layer.gradient_range, 1));
      const expr = String(layer.gradient_interpolant || "v.particle_age / v.particle_lifetime");
      let u = t;
      if (expr.includes("random")) u = rand == null ? t : rand;
      return sampleColorStops(layerGradient(layer), u / range);
    }
    if (layer.color_hex && String(layer.color_hex).toLowerCase() !== "#ffffff") return hexToRgb(layer.color_hex);
    return null;
  }

  function typeId(type) {
    if (type && typeof type === "object" && !Array.isArray(type)) {
      return String(type.id || type.type || "minecraft:dust");
    }
    return String(type || "minecraft:enchant");
  }

  function selectedLayer() {
    const layers = LE_PV.doc.layers;
    if (!layers.length) return null;
    LE_PV.selected = Math.max(0, Math.min(LE_PV.selected, layers.length - 1));
    return layers[LE_PV.selected];
  }

  function layerOrigin(p) {
    const mode = String(p.anchor || "feet").toLowerCase();
    let base;
    if (mode === "eye") base = vec(0, 1.62, 0);
    else if (mode === "look") base = vec(0, 1.2, 2.2);
    else base = vec(0, 0.08, 0);
    return vec(
      base.x + num(p.offset_right, 0),
      base.y + num(p.offset_up, 0),
      base.z + num(p.offset_forward, 0)
    );
  }

  function localToWorld(p, local) {
    const o = layerOrigin(p);
    return vec(o.x + local.x, o.y + local.y, o.z + local.z);
  }

  function squarePerimeter(center, right, fwd, half, t) {
    const u = (((t % 1) + 1) % 1) * 4;
    const edge = Math.floor(u);
    const w = u - edge;
    const ne = add(add(center, scale(right, half)), scale(fwd, half));
    const nw = add(add(center, scale(right, -half)), scale(fwd, half));
    const sw = add(add(center, scale(right, -half)), scale(fwd, -half));
    const se = add(add(center, scale(right, half)), scale(fwd, -half));
    if (edge === 0) return lerp(ne, nw, w);
    if (edge === 1) return lerp(nw, sw, w);
    if (edge === 2) return lerp(sw, se, w);
    return lerp(se, ne, w);
  }

  function sampleShape(p, rng) {
    const lookH = vec(0, 0, 1);
    const rightH = vec(1, 0, 0);
    const worldUp = vec(0, 1, 0);
    const count = Math.max(0, Math.trunc(num(p.count, 14)));
    const spread = Math.max(0, num(p.spread, 0.24));
    const speed = Math.max(0, num(p.speed, 0.03));
    const shape = String(p.shape || "point").trim().toLowerCase() || "point";
    const anchor = layerOrigin(p);
    const radius = Math.max(0.05, num(p.shape_radius, 0.65));
    const shapeSamples = Math.max(3, Math.trunc(num(p.shape_samples, 12)));
    const lineLen = Math.max(0.05, num(p.line_length, 1.2));
    const lineSamples = Math.max(2, Math.trunc(num(p.line_samples, p.shape_samples || 6)));
    const spinSteps = Math.max(2, Math.trunc(num(p.spin_steps, 16)));
    const spinDelay = Math.max(0, Math.trunc(num(p.spin_delay_ticks, 1)));
    const pillarH = Math.max(0.2, num(p.pillar_height, 3.2));
    const bursts = [];
    const pushBurst = (pos, n, delayTicks) => {
      bursts.push({ pos, n: Math.max(1, n), delay: (delayTicks || 0) + Math.max(0, num(p.delay_ticks, 0)), spread, speed });
    };
    if (!shape || shape === "point" || shape === "burst" || shape === "none") {
      pushBurst(anchor, Math.max(1, count), 0);
      return bursts;
    }
    if (shape === "circle" || shape === "circle_2d" || shape === "circle2d" || shape === "circle_2d_edge") {
      const per = Math.max(1, Math.trunc(count / Math.max(1, shapeSamples)));
      for (let i = 0; i < shapeSamples; i++) {
        const ang = (Math.PI * 2 * i) / shapeSamples;
        pushBurst(add(add(anchor, scale(rightH, Math.cos(ang) * radius)), scale(lookH, Math.sin(ang) * radius)), per, 0);
      }
      return bursts;
    }
    if (shape === "radius" || shape === "in_radius" || shape === "particles_in_radius") {
      for (let i = 0; i < Math.max(1, count); i++) {
        const theta = 2 * Math.PI * rng();
        const phi = Math.acos(2 * rng() - 1);
        const rr = radius * Math.cbrt(rng());
        pushBurst(add(anchor, vec(rr * Math.sin(phi) * Math.cos(theta), rr * Math.cos(phi), rr * Math.sin(phi) * Math.sin(theta))), 1, 0);
      }
      return bursts;
    }
    if (shape === "square") {
      const per = Math.max(1, Math.trunc(count / Math.max(1, shapeSamples)));
      for (let i = 0; i < shapeSamples; i++) pushBurst(squarePerimeter(anchor, rightH, lookH, radius, i / shapeSamples), per, 0);
      return bursts;
    }
    if (shape.startsWith("line_")) {
      let dir = lookH;
      if (shape === "line_up") dir = worldUp;
      else if (shape === "line_down") dir = scale(worldUp, -1);
      else if (shape === "line_back") dir = scale(lookH, -1);
      else if (shape === "line_right") dir = rightH;
      else if (shape === "line_left") dir = scale(rightH, -1);
      const samples = Math.max(2, lineSamples);
      const per = Math.max(1, Math.trunc(count / samples));
      for (let i = 0; i < samples; i++) pushBurst(add(anchor, scale(dir, lineLen * (samples === 1 ? 0 : i / (samples - 1)))), per, 0);
      return bursts;
    }
    if (shape === "spin_circle" || shape === "helix" || shape === "spiral_up" || shape === "pillar_helix") {
      const h = shape === "spin_circle" ? 0 : pillarH;
      const turns = Math.max(1, Math.trunc(num(p.helix_turns, 2)));
      for (let k = 0; k < spinSteps; k++) {
        const t = k / Math.max(1, spinSteps - 1);
        const ang = Math.PI * 2 * turns * t;
        pushBurst(add(add(anchor, scale(rightH, Math.cos(ang) * radius)), add(scale(lookH, Math.sin(ang) * radius), vec(0, h * t, 0))), Math.max(1, count), spinDelay * k);
      }
      return bursts;
    }
    if (shape === "pillar" || shape === "column") {
      const layers = Math.max(2, Math.trunc(num(p.pillar_layers, 10)));
      const taper = Math.max(-0.9, Math.min(0.9, num(p.taper, 0.2)));
      const per = Math.max(1, Math.trunc(count / layers));
      const samples = Math.max(4, shapeSamples);
      const each = Math.max(1, Math.trunc(per / samples));
      for (let layer = 0; layer < layers; layer++) {
        const t = layer / Math.max(1, layers - 1);
        const ringR = radius * (1 - taper * t);
        for (let i = 0; i < samples; i++) {
          const ang = (Math.PI * 2 * i) / samples;
          pushBurst(add(add(anchor, scale(rightH, Math.cos(ang) * ringR)), add(scale(lookH, Math.sin(ang) * ringR), vec(0, pillarH * t, 0))), each, spinDelay * layer);
        }
      }
      return bursts;
    }
    if (shape === "sphere") {
      const samples = Math.max(4, shapeSamples);
      const per = Math.max(1, Math.trunc(count / Math.max(1, samples)));
      for (let i = 0; i < samples; i++) {
        let y = 1 - (i / Math.max(1, samples - 1)) * 2;
        y = Math.max(-1, Math.min(1, y));
        const ringR = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = i * Math.PI * (3 - Math.sqrt(5));
        pushBurst(add(add(anchor, scale(rightH, Math.cos(theta) * ringR * radius)), add(scale(worldUp, y * radius), scale(lookH, Math.sin(theta) * ringR * radius))), per, 0);
      }
      return bursts;
    }
    if (shape === "cone") {
      const layers = Math.max(3, shapeSamples);
      const per = Math.max(1, Math.trunc(count / layers));
      for (let layer = 0; layer < layers; layer++) {
        const t = layer / Math.max(1, layers - 1);
        const center = add(anchor, scale(lookH, lineLen * t));
        const ringR = radius * t;
        const samples = Math.max(4, 6 + layer);
        const each = Math.max(1, Math.trunc(per / samples));
        for (let i = 0; i < samples; i++) {
          const ang = (Math.PI * 2 * i) / samples;
          pushBurst(add(center, add(scale(rightH, Math.cos(ang) * ringR), scale(worldUp, Math.sin(ang) * ringR * 0.35))), each, 0);
        }
      }
      return bursts;
    }
    if (shape === "points" || shape === "custom" || shape === "path") {
      const pts = Array.isArray(p.points) ? p.points.map((pt) => localToWorld(p, vec(num(pt.x, 0), num(pt.y, 0), num(pt.z, 0)))) : [];
      if (!pts.length) {
        pushBurst(anchor, Math.max(1, count), 0);
        return bursts;
      }
      if (shape === "points" || pts.length === 1) {
        const per = Math.max(1, count);
        for (const pos of pts) pushBurst(pos, per, 0);
        return bursts;
      }
      const loop = !!p.closed && pts.length >= 3;
      const segs = loop ? pts.length : pts.length - 1;
      const perSeg = Math.max(2, shapeSamples);
      const each = Math.max(1, Math.trunc(count / Math.max(1, segs * perSeg)));
      for (let i = 0; i < segs; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        for (let s = 0; s < perSeg; s++) {
          const last = i === segs - 1 && s === perSeg - 1;
          pushBurst(lerp(a, b, last ? 1 : s / perSeg), each, 0);
        }
      }
      return bursts;
    }
    pushBurst(anchor, Math.max(1, count), 0);
    return bursts;
  }

  function spawnFromBursts(bursts, type, rng, gravity) {
    const col = colorForType(type);
    const id = typeId(type);
    const st = window.leParticleSprites
      ? window.leParticleSprites.style(id)
      : { key: "spark", additive: false, scale: 1, fps: 10, tint: [1, 1, 1] };
    const frames = window.leParticleSprites ? window.leParticleSprites.getFrames(id) : null;
    const out = [];
    for (const b of bursts) {
      for (let i = 0; i < b.n; i++) {
        if (LE_PV.parts.length + out.length >= PREVIEW_CAP) return out;
        const spd = b.speed * (0.55 + rng());
        const az = rng() * Math.PI * 2;
        const el = (rng() - 0.35) * Math.PI * 0.6;
        out.push({
          x: b.pos.x + (rng() * 2 - 1) * b.spread,
          y: b.pos.y + (rng() * 2 - 1) * b.spread,
          z: b.pos.z + (rng() * 2 - 1) * b.spread,
          vx: Math.cos(az) * Math.cos(el) * spd,
          vy: Math.sin(el) * spd + (st.key === "sparkle" || st.key === "smoke" ? 0.028 : 0.01),
          vz: Math.sin(az) * Math.cos(el) * spd,
          born: b.delay,
          life: (st.key === "slash" || st.key === "hit" ? 10 : 22) + rng() * 10,
          size: (9 + rng() * 4) * (st.scale || 1),
          r: col[0],
          g: col[1],
          b: col[2],
          gravity,
          type: id,
          rot: rng() * Math.PI * 2,
          spin: (rng() - 0.5) * 0.18,
          additive: !!st.additive,
          fps: st.fps || 10,
          tint: st.tint || [1, 1, 1],
          frameOff: Math.floor(rng() * 16),
          uvFrames: frames,
        });
      }
    }
    return out;
  }

  function fireish(t) {
    const id = typeId(t).toLowerCase();
    return id.includes("flame") || id.includes("lava") || id.includes("smoke") || id.includes("ash");
  }

  function makeProcCanvas(draw) {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    draw(c.getContext("2d"), 64);
    return c;
  }

  function ensureProcSprites() {
    if (PROC_SPRITES.glow) return PROC_SPRITES;
    PROC_SPRITES.glow = makeProcCanvas((g, s) => {
      const grd = g.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.5);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.18, "rgba(255,255,255,0.92)");
      grd.addColorStop(0.45, "rgba(255,255,255,0.38)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
    });
    PROC_SPRITES.core = makeProcCanvas((g, s) => {
      const grd = g.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.48);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.28, "rgba(255,255,255,0.95)");
      grd.addColorStop(0.55, "rgba(255,255,255,0.4)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
      g.strokeStyle = "rgba(255,255,255,0.55)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(s * 0.5, s * 0.5, s * 0.22, 0, Math.PI * 2);
      g.stroke();
    });
    PROC_SPRITES.spark = makeProcCanvas((g, s) => {
      g.translate(s * 0.5, s * 0.5);
      g.fillStyle = "#fff";
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = i % 2 === 0 ? s * 0.46 : s * 0.12;
        if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
    });
    PROC_SPRITES.shard = makeProcCanvas((g, s) => {
      g.translate(s * 0.5, s * 0.52);
      g.fillStyle = "rgba(255,255,255,0.95)";
      g.beginPath();
      g.moveTo(0, -s * 0.42);
      g.lineTo(s * 0.16, s * 0.08);
      g.lineTo(0, s * 0.38);
      g.lineTo(-s * 0.16, s * 0.08);
      g.closePath();
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.beginPath();
      g.moveTo(0, -s * 0.42);
      g.lineTo(s * 0.16, s * 0.08);
      g.lineTo(0, s * 0.04);
      g.closePath();
      g.fill();
    });
    PROC_SPRITES.smoke = makeProcCanvas((g, s) => {
      const blobs = [[0.5, 0.52, 0.28], [0.38, 0.42, 0.2], [0.62, 0.44, 0.18], [0.48, 0.62, 0.16]];
      blobs.forEach(([x, y, r]) => {
        const grd = g.createRadialGradient(s * x, s * y, 0, s * x, s * y, s * r);
        grd.addColorStop(0, "rgba(255,255,255,0.55)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grd;
        g.beginPath();
        g.arc(s * x, s * y, s * r, 0, Math.PI * 2);
        g.fill();
      });
    });
    PROC_SPRITES.rune = makeProcCanvas((g, s) => {
      g.translate(s * 0.5, s * 0.5);
      g.strokeStyle = "#fff";
      g.lineWidth = 3;
      g.lineJoin = "round";
      g.beginPath();
      g.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * s * 0.26;
        const y = Math.sin(a) * s * 0.26;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
    });
    PROC_SPRITES.slash = makeProcCanvas((g, s) => {
      g.translate(s * 0.5, s * 0.5);
      g.rotate(-0.6);
      const grd = g.createLinearGradient(-s * 0.46, 0, s * 0.46, 0);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(0.45, "rgba(255,255,255,0.95)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(0, 0, s * 0.46, s * 0.08, 0, 0, Math.PI * 2);
      g.fill();
    });
    PROC_SPRITES.mote = makeProcCanvas((g, s) => {
      const grd = g.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.28);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.55, "rgba(255,255,255,0.45)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
    });
    PROC_SPRITES.missing = makeProcCanvas((g, s) => {
      g.fillStyle = "#3a1020";
      g.fillRect(0, 0, s, s);
      g.fillStyle = "#c44";
      g.fillRect(0, 0, s * 0.5, s * 0.5);
      g.fillRect(s * 0.5, s * 0.5, s * 0.5, s * 0.5);
      g.strokeStyle = "#fff";
      g.lineWidth = 3;
      g.strokeRect(4, 4, s - 8, s - 8);
    });
    return PROC_SPRITES;
  }

  function hash01(i, salt) {
    let x = ((Math.trunc(i) + 1) * 374761393 + Math.trunc(salt) * 668265263) | 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  }

  function curveAt(name, t, loop) {
    const id = String(name || "linear");
    if (id === "pulse") {
      const u = loop ? t : Math.max(0, Math.min(1, t));
      return 0.55 + 0.45 * Math.sin(u * Math.PI * 4);
    }
    if (id === "flicker") {
      const u = loop ? t : Math.max(0, Math.min(1, t));
      return 0.72 + 0.28 * ((Math.sin(u * 41) + Math.sin(u * 17)) * 0.5);
    }
    const u = Math.max(0, Math.min(1, t));
    if (id === "smooth" || id === "smoothstep") return u * u * (3 - 2 * u);
    if (id === "fade_in_out") {
      if (loop) return u < 0.12 ? u / 0.12 : 1;
      if (u < 0.15) return u / 0.15;
      if (u > 0.7) return Math.max(0, 1 - (u - 0.7) / 0.3);
      return 1;
    }
    return u;
  }

  function inferSpriteStyle(layer) {
    if (layer.sprite_style) return layer.sprite_style;
    const t = String(layer.type || "").toLowerCase();
    if (t.includes("smoke") || t.includes("cloud")) return "smoke";
    if (t.includes("crit") || t.includes("enchant") || t.includes("spark")) return "spark";
    if (t.includes("snow") || t.includes("end_rod")) return "spark";
    if (t.includes("flame") || t.includes("lava")) return "glow";
    if (String(layer.shape || "").includes("rune")) return "rune";
    if (String(layer.shape || "").includes("shard")) return "shard";
    if (String(layer.shape || "").includes("arc") || String(layer.shape || "").includes("slash")) return "slash";
    return "glow";
  }

  function spriteForLayer(layer) {
    ensureProcSprites();
    const frames = framesForLayer(layer, layer.type);
    if (frames && frames.length) return { frames, missing: false };
    if (layer.tex_path && !layer.tex_id && !layer.sprite) {
      return { frames: [PROC_SPRITES.missing], missing: true };
    }
    const style = inferSpriteStyle(layer);
    return { frames: [PROC_SPRITES[style] || PROC_SPRITES.glow], missing: false };
  }

  function clearLayerTexture(layer) {
    if (!layer) return;
    layer.sprite = "";
    layer.tex_id = "";
    layer.tex_path = "";
    layer._frames = null;
    layer._frameKey = "";
  }

  function isCustomSheet(layer) {
    return !!(layer && String(layer.tex_id || "").indexOf("custom:") === 0);
  }

  function isBuiltinSprite(layer) {
    if (!layer || isCustomSheet(layer)) return false;
    const id = String(layer.tex_id || "");
    return id.indexOf("snowstorm:") === 0 || !!layer.sprite;
  }

  function layerTints(layer) {
    return !layer || layer.tint !== false;
  }

  function typeUsesColor(type) {
    const t = String(type || "vaerun:emitter").toLowerCase();
    return !t || t.indexOf("vaerun:emitter") === 0 || t.indexOf("magic_mote") >= 0 || t.indexOf("energy_mote") >= 0;
  }

  function layerHasTexture(layer) {
    return !!(layer && (layer.sprite || layer.tex_id || (layer.tex_path && String(layer.tex_path).trim())));
  }

  function textureSourceLabel(layer) {
    if (layer.sprite) return "Built-in sprite · " + layer.sprite;
    if (layer.tex_id && String(layer.tex_id).indexOf("custom:") === 0) return "Custom PNG · " + (layer.tex_path || layer.tex_id);
    if (layer.tex_path) return "Texture path · " + layer.tex_path;
    return "Procedural style · " + inferSpriteStyle(layer);
  }

  function rotateAxis(p, axis, rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    if (axis === "x") return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
    if (axis === "z") return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
    return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c };
  }

  function fibonacciPoint(i, n, radius) {
    const fy = 1 - (2 * (i + 0.5) / n);
    const r = Math.sqrt(Math.max(0, 1 - fy * fy));
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    return { x: radius * r * Math.cos(theta), y: radius * fy, z: radius * r * Math.sin(theta) };
  }

  function alongPoly(pts, i, n) {
    if (!pts.length) return { x: 0, y: 0, z: 0 };
    if (pts.length === 1) return pts[0];
    const t = (n <= 1 ? 0 : i / n) * pts.length;
    const s = Math.floor(t) % pts.length;
    const u = t - Math.floor(t);
    const a = pts[s];
    const b = pts[(s + 1) % pts.length];
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u };
  }

  function toolkitShapePoint(layer, i, n) {
    const shape = String(layer.shape || "sphere");
    const radius = num(layer.shape_radius, 0.8);
    const height = num(layer.pillar_height, 2);
    const turns = num(layer.helix_turns, 2);
    const u = n <= 1 ? 0 : i / (n - 1);
    const ang = (Math.PI * 2 * i) / n;
    if (shape === "circle" || shape === "ring" || shape === "circle_2d" || shape === "shockwave") {
      return { x: Math.cos(ang) * radius, y: 0.02, z: Math.sin(ang) * radius };
    }
    if (shape === "disc") {
      const r = radius * Math.sqrt((i + 0.5) / n);
      return { x: Math.cos(ang) * r, y: 0.02, z: Math.sin(ang) * r };
    }
    if (shape === "concentric" || shape === "concentric_rings") {
      const rings = Math.max(1, Math.trunc(num(layer.rings, 3)));
      const ring = i % rings;
      const j = Math.floor(i / rings);
      const per = Math.max(1, Math.ceil(n / rings));
      const r = radius * ((ring + 1) / rings);
      const a = (Math.PI * 2 * j) / per;
      return { x: Math.cos(a) * r, y: 0.02, z: Math.sin(a) * r };
    }
    if (shape === "segmented_ring" || shape === "segmented") {
      const segs = Math.max(2, Math.trunc(num(layer.segments, 6)));
      const gap = Math.max(0, Math.min(0.8, num(layer.gap, 0.22)));
      const span = (Math.PI * 2) / segs;
      const filled = span * (1 - gap);
      const t = n <= 1 ? 0 : i / n;
      const seg = Math.floor(t * segs);
      const su = t * segs - seg;
      const a = seg * span + su * filled;
      return { x: Math.cos(a) * radius, y: 0.02, z: Math.sin(a) * radius };
    }
    if (shape === "radial_burst" || shape === "burst_ring") {
      const r = radius * (0.15 + 0.85 * ((i * 0.6180339887) % 1));
      return { x: Math.cos(ang) * r, y: 0.04, z: Math.sin(ang) * r };
    }
    if (shape === "helix" || shape === "spiral_up" || shape === "spiral") {
      const theta = Math.PI * 2 * turns * u;
      const r0 = num(layer.radius_start, radius * 0.25);
      const r1 = num(layer.radius_end, radius);
      const r = r0 + (r1 - r0) * u;
      return { x: r * Math.cos(theta), y: height * u, z: r * Math.sin(theta) };
    }
    if (shape === "double_helix") {
      const arm = i % 2;
      const k = Math.floor(i / 2);
      const nn = Math.max(1, Math.floor(n / 2));
      const uu = nn <= 1 ? 0 : k / (nn - 1);
      const theta = Math.PI * 2 * turns * uu + arm * Math.PI;
      const r = radius * (0.55 + 0.45 * uu);
      return { x: r * Math.cos(theta), y: height * uu, z: r * Math.sin(theta) };
    }
    if (shape === "tornado") {
      const theta = Math.PI * 2 * turns * u;
      const r = radius * (0.12 + 0.88 * u);
      return { x: r * Math.cos(theta), y: height * u, z: r * Math.sin(theta) };
    }
    if (shape === "spiral_flat") {
      const theta = Math.PI * 2 * turns * u;
      const r = radius * u;
      return { x: r * Math.cos(theta), y: 0.03, z: r * Math.sin(theta) };
    }
    if (shape === "pillar" || shape === "column") {
      const layers = Math.max(2, Math.trunc(num(layer.rings, 8)));
      const ring = i % layers;
      const j = Math.floor(i / layers);
      const per = Math.max(1, Math.ceil(n / layers));
      const a = (Math.PI * 2 * j) / per;
      return { x: Math.cos(a) * radius, y: (ring / (layers - 1)) * height, z: Math.sin(a) * radius };
    }
    if (shape === "cylinder") {
      return { x: Math.cos(ang) * radius, y: u * height, z: Math.sin(ang) * radius };
    }
    if (shape === "cone") {
      const r = radius * u;
      return { x: Math.cos(ang) * r, y: 0, z: Math.sin(ang) * r + height * u };
    }
    if (shape === "fountain") {
      const r = radius * u;
      return { x: Math.cos(ang) * r, y: height * (1 - u), z: Math.sin(ang) * r };
    }
    if (shape === "line" || shape === "beam" || shape === "line_forward" || shape === "line_up") {
      const len = num(layer.line_length, 2.4);
      if (shape === "line_up") return { x: 0, y: u * len, z: 0 };
      return { x: 0, y: 0.1, z: (u - 0.5) * len };
    }
    if (shape === "arc" || shape === "ribbon" || shape === "slash_arc") {
      const spread = num(layer.arc_spread, 2.6);
      const a = -spread * 0.5 + spread * u;
      return { x: Math.cos(a) * radius, y: height * Math.sin(u * Math.PI), z: Math.sin(a) * radius };
    }
    if (shape === "arch") {
      const a = Math.PI * u;
      return { x: Math.cos(a) * radius, y: Math.sin(a) * height, z: 0 };
    }
    if (shape === "curve" || shape === "bezier") {
      const omu = 1 - u;
      return {
        x: 0,
        y: omu * omu * 0.1 + 2 * omu * u * height + u * u * 0.1,
        z: omu * omu * (-radius) + u * u * radius,
      };
    }
    if (shape === "zigzag") {
      const len = num(layer.line_length, height || 2.4);
      const zig = ((i % 2) * 2 - 1) * radius * 0.35;
      return { x: zig, y: 0.05, z: (u - 0.5) * len };
    }
    if (shape === "rune" || shape === "rune_circle") {
      const petals = Math.max(3, Math.trunc(num(layer.rune_petals, 6)));
      const mark = String(layer.rune_mark || "star");
      const group = i % 3;
      const petal = Math.floor(i / 3) % petals;
      const a = (Math.PI * 2 * petal) / petals;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      if (group === 0) return { x: ca * radius * 0.42, y: 0.04, z: sa * radius * 0.42 };
      if (group === 1) return { x: ca * radius, y: 0.03, z: sa * radius };
      const inset = mark === "diamond" || mark === "hex" ? 0.78 : 0.62;
      const off = mark === "cross" ? 0.12 : 0.08;
      return { x: ca * radius * inset - sa * off, y: 0.05, z: sa * radius * inset + ca * off };
    }
    if (shape === "shard" || shape === "shard_burst" || shape === "fragments") {
      const p = fibonacciPoint(i, n, radius);
      return { x: p.x, y: Math.abs(p.y) * 0.45, z: p.z };
    }
    if (shape === "dome") {
      const p = fibonacciPoint(i, n, radius);
      return { x: p.x, y: Math.abs(p.y), z: p.z };
    }
    if (shape === "torus") {
      const R = radius;
      const r = Math.max(0.04, num(layer.torus_tube, 0.28) * radius);
      const theta = ang;
      const phi = (Math.PI * 2 * i * 3) / n;
      return {
        x: (R + r * Math.cos(phi)) * Math.cos(theta),
        y: r * Math.sin(phi),
        z: (R + r * Math.cos(phi)) * Math.sin(theta),
      };
    }
    if (shape === "box") {
      const bx = num(layer.box_x, radius);
      const by = num(layer.box_y, height * 0.35);
      const bz = num(layer.box_z, radius);
      const h = hash01(i, Math.trunc(num(layer.seed, 1)));
      const h2 = hash01(i + 17, Math.trunc(num(layer.seed, 1)) + 3);
      const h3 = hash01(i + 31, Math.trunc(num(layer.seed, 1)) + 9);
      return { x: (h * 2 - 1) * bx, y: h2 * by, z: (h3 * 2 - 1) * bz };
    }
    if (shape === "cluster") {
      const h = hash01(i, Math.trunc(num(layer.seed, 1)));
      const h2 = hash01(i + 11, Math.trunc(num(layer.seed, 1)) + 2);
      const h3 = hash01(i + 29, Math.trunc(num(layer.seed, 1)) + 5);
      const rr = radius * Math.pow(h, 0.55);
      const a = h2 * Math.PI * 2;
      const elev = (h3 * 2 - 1) * 0.7;
      const c = Math.sqrt(Math.max(0, 1 - elev * elev));
      return { x: rr * c * Math.cos(a), y: rr * elev, z: rr * c * Math.sin(a) };
    }
    if (shape === "cube_edges") {
      const s = radius;
      const edges = [
        [[-s, 0, -s], [s, 0, -s]], [[s, 0, -s], [s, 0, s]], [[s, 0, s], [-s, 0, s]], [[-s, 0, s], [-s, 0, -s]],
        [[-s, height, -s], [s, height, -s]], [[s, height, -s], [s, height, s]], [[s, height, s], [-s, height, s]], [[-s, height, s], [-s, height, -s]],
        [[-s, 0, -s], [-s, height, -s]], [[s, 0, -s], [s, height, -s]], [[s, 0, s], [s, height, s]], [[-s, 0, s], [-s, height, s]],
      ];
      const e = edges[i % edges.length];
      const t = (Math.floor(i / edges.length) / Math.max(1, Math.ceil(n / edges.length) - 1)) || (i / n);
      const uu = Math.min(1, t);
      return { x: e[0][0] + (e[1][0] - e[0][0]) * uu, y: e[0][1] + (e[1][1] - e[0][1]) * uu, z: e[0][2] + (e[1][2] - e[0][2]) * uu };
    }
    if (shape === "pyramid") {
      const layers = Math.max(2, Math.trunc(num(layer.rings, 5)));
      const ring = i % layers;
      const j = Math.floor(i / layers);
      const per = Math.max(1, Math.ceil(n / layers));
      const uu = ring / (layers - 1);
      const r = radius * (1 - uu);
      const a = (Math.PI * 2 * j) / per + Math.PI / 4;
      return { x: Math.cos(a) * r, y: uu * height, z: Math.sin(a) * r };
    }
    if (shape === "star") {
      const pts = [];
      for (let p = 0; p < 10; p++) {
        const r = p % 2 === 0 ? radius : radius * 0.42;
        const a = (p * Math.PI) / 5 - Math.PI / 2;
        pts.push({ x: Math.cos(a) * r, y: 0.03, z: Math.sin(a) * r });
      }
      return alongPoly(pts, i, n);
    }
    if (shape === "cross") {
      const arm = i % 4;
      const t = (Math.floor(i / 4) / Math.max(1, Math.ceil(n / 4) - 1)) || u;
      const d = (t * 2 - 1) * radius;
      if (arm === 0) return { x: d, y: 0.03, z: 0 };
      if (arm === 1) return { x: 0, y: 0.03, z: d };
      if (arm === 2) return { x: 0, y: d * 0.5 + height * 0.25, z: 0 };
      return { x: d * 0.7, y: 0.03, z: d * 0.7 };
    }
    if (shape === "polygon") {
      const sides = Math.max(3, Math.trunc(num(layer.poly_sides, 5)));
      const pts = [];
      for (let p = 0; p < sides; p++) {
        const a = (Math.PI * 2 * p) / sides - Math.PI / 2;
        pts.push({ x: Math.cos(a) * radius, y: 0.03, z: Math.sin(a) * radius });
      }
      return alongPoly(pts, i, n);
    }
    if (shape === "crescent") {
      const a = -Math.PI * 0.7 + 1.4 * Math.PI * u;
      const r = radius * (0.82 + 0.18 * Math.sin(u * Math.PI));
      return { x: Math.cos(a) * r + radius * 0.18, y: 0.03, z: Math.sin(a) * r };
    }
    if (shape === "flower") {
      const k = Math.max(3, Math.trunc(num(layer.flower_petals, num(layer.rune_petals, 6))));
      const a = ang;
      const r = radius * (0.35 + 0.65 * Math.abs(Math.cos(k * a)));
      return { x: Math.cos(a) * r, y: 0.03, z: Math.sin(a) * r };
    }
    if (shape === "figure8") {
      const a = ang;
      const s = 1 + Math.sin(a) * Math.sin(a);
      return { x: (radius * Math.sin(a)) / s, y: 0.03, z: (radius * Math.sin(a) * Math.cos(a)) / s };
    }
    if (shape === "galaxy") {
      const arms = Math.max(2, Math.trunc(num(layer.galaxy_arms, 3)));
      const arm = i % arms;
      const k = Math.floor(i / arms);
      const nn = Math.max(1, Math.floor(n / arms));
      const uu = nn <= 1 ? 0 : k / (nn - 1);
      const a = (Math.PI * 2 * arm) / arms + uu * turns * Math.PI * 2;
      const r = radius * Math.pow(uu, 0.65);
      return { x: Math.cos(a) * r, y: (hash01(i, 3) - 0.5) * 0.12, z: Math.sin(a) * r };
    }
    if (shape === "grid") {
      const side = Math.max(2, Math.round(Math.sqrt(n)));
      const gx = i % side;
      const gz = Math.floor(i / side) % side;
      const x = side <= 1 ? 0 : (gx / (side - 1) - 0.5) * 2 * radius;
      const z = side <= 1 ? 0 : (gz / (side - 1) - 0.5) * 2 * radius;
      return { x, y: 0.03, z };
    }
    if (shape === "wall") {
      const side = Math.max(2, Math.round(Math.sqrt(n)));
      const gx = i % side;
      const gy = Math.floor(i / side) % side;
      const x = side <= 1 ? 0 : (gx / (side - 1) - 0.5) * 2 * radius;
      const y = side <= 1 ? 0 : (gy / (side - 1)) * height;
      return { x, y, z: 0 };
    }
    if (shape === "disc_vertical") {
      const r = radius * Math.sqrt((i + 0.5) / n);
      return { x: Math.cos(ang) * r, y: Math.sin(ang) * r + height * 0.15, z: 0 };
    }
    if (shape === "spokes") {
      const spokes = Math.max(3, Math.trunc(num(layer.segments, 8)));
      const sp = i % spokes;
      const t = (Math.floor(i / spokes) / Math.max(1, Math.ceil(n / spokes) - 1)) || u;
      const a = (Math.PI * 2 * sp) / spokes;
      const r = radius * t;
      return { x: Math.cos(a) * r, y: 0.03, z: Math.sin(a) * r };
    }
    if (shape === "portal") {
      const group = i % 3;
      const j = Math.floor(i / 3);
      const per = Math.max(1, Math.ceil(n / 3));
      const a = (Math.PI * 2 * j) / per;
      if (group === 0) return { x: Math.cos(a) * radius, y: 0.03, z: Math.sin(a) * radius };
      if (group === 1) return { x: Math.cos(a) * radius * 0.55, y: 0.04, z: Math.sin(a) * radius * 0.55 };
      return { x: Math.cos(a) * radius * 0.78, y: 0.05, z: Math.sin(a) * radius * 0.78 };
    }
    if (shape === "ripple") {
      const rings = Math.max(2, Math.trunc(num(layer.rings, 4)));
      const ring = i % rings;
      const j = Math.floor(i / rings);
      const per = Math.max(1, Math.ceil(n / rings));
      const r = radius * ((ring + 0.35) / rings);
      const a = (Math.PI * 2 * j) / per;
      const y = 0.02 + Math.sin(a * 3 + ring) * 0.04;
      return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
    }
    if (shape === "hourglass") {
      const t = u * 2 - 1;
      const r = radius * Math.max(0.08, Math.abs(t));
      return { x: Math.cos(ang) * r, y: t * height * 0.5, z: Math.sin(ang) * r };
    }
    if (shape === "octahedron") {
      const verts = [
        { x: 0, y: height, z: 0 }, { x: 0, y: 0, z: 0 },
        { x: radius, y: height * 0.5, z: 0 }, { x: -radius, y: height * 0.5, z: 0 },
        { x: 0, y: height * 0.5, z: radius }, { x: 0, y: height * 0.5, z: -radius },
      ];
      const edges = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]];
      const e = edges[i % edges.length];
      const t = (Math.floor(i / edges.length) / Math.max(1, Math.ceil(n / edges.length) - 1)) || u;
      const a = verts[e[0]];
      const b = verts[e[1]];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
    }
    if (shape === "tetrahedron") {
      const verts = [
        { x: 0, y: height, z: 0 },
        { x: radius, y: 0, z: 0 },
        { x: -radius * 0.5, y: 0, z: radius * 0.86 },
        { x: -radius * 0.5, y: 0, z: -radius * 0.86 },
      ];
      const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]];
      const e = edges[i % edges.length];
      const t = (Math.floor(i / edges.length) / Math.max(1, Math.ceil(n / edges.length) - 1)) || u;
      const a = verts[e[0]];
      const b = verts[e[1]];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
    }
    if (shape === "lightning_bolt") {
      const branches = 3;
      const branch = i % branches;
      const k = Math.floor(i / branches);
      const nn = Math.max(1, Math.floor(n / branches));
      const uu = nn <= 1 ? 0 : k / (nn - 1);
      const jag = radius * (0.22 + 0.16 * branch) * Math.sin(uu * 9 * Math.PI + branch);
      const jagz = radius * 0.12 * Math.cos(uu * 7 * Math.PI + branch * 1.7);
      return { x: jag, y: height * (1 - uu), z: jagz };
    }
    if (shape === "sky_beam") {
      return { x: Math.cos(ang) * radius * 0.18, y: height * (1 - u), z: Math.sin(ang) * radius * 0.18 };
    }
    if (shape === "meteor_path") {
      return { x: radius * (1 - u), y: height * (1 - u), z: -radius * 0.45 * (1 - u) };
    }
    if (shape === "ground_crack") {
      const forks = Math.max(3, Math.trunc(num(layer.segments, 5)));
      const fork = i % forks;
      const k = Math.floor(i / forks);
      const nn = Math.max(1, Math.floor(n / forks));
      const uu = nn <= 1 ? 0 : k / (nn - 1);
      const a = -0.9 + (fork / Math.max(1, forks - 1)) * 1.8;
      const jag = Math.sin(uu * 10 + fork) * radius * 0.08;
      return { x: Math.sin(a) * radius * uu + jag, y: 0.03, z: Math.cos(a) * radius * uu };
    }
    if (shape === "breath") {
      const bx = num(layer.box_x, radius * 0.35);
      const by = num(layer.box_y, height * 0.22);
      const bz = num(layer.box_z, num(layer.line_length, 2.4));
      const h = hash01(i, Math.trunc(num(layer.seed, 1)));
      const h2 = hash01(i + 19, Math.trunc(num(layer.seed, 1)) + 2);
      const h3 = hash01(i + 41, Math.trunc(num(layer.seed, 1)) + 7);
      return { x: (h * 2 - 1) * bx, y: h2 * by, z: h3 * bz };
    }
    if (shape === "fork") {
      const arm = i % 3;
      const t = (Math.floor(i / 3) / Math.max(1, Math.ceil(n / 3) - 1)) || u;
      if (arm === 0) return { x: 0, y: t * height * 0.55, z: 0 };
      const side = arm === 1 ? 1 : -1;
      const s = Math.max(0, t * 2 - 1);
      return { x: side * s * radius, y: height * 0.55 + s * height * 0.45, z: s * radius * 0.15 };
    }
    if (shape === "chevron") {
      const arm = i % 2 ? 1 : -1;
      const t = (Math.floor(i / 2) / Math.max(1, Math.ceil(n / 2) - 1)) || u;
      return { x: arm * t * radius, y: 0.04 + (1 - t) * height * 0.35, z: t * radius * 0.15 };
    }
    if (shape === "trefoil") {
      const a = ang;
      return {
        x: radius * (Math.sin(a) + 2 * Math.sin(2 * a)) * 0.28,
        y: height * 0.35 + radius * (Math.cos(a) - 2 * Math.cos(2 * a)) * 0.18,
        z: radius * (-Math.sin(3 * a)) * 0.28,
      };
    }
    return fibonacciPoint(i, n, radius);
  }

  function motionBurst(motion) {
    const m = String(motion || "");
    return m === "burst" || m === "scatter";
  }

  function motionHolds(motion) {
    return !motionBurst(motion);
  }

  function isSpriteSpinMotion(motion) {
    const m = String(motion || "").toLowerCase();
    return m === "spin" || m === "spin_cw" || m === "spin_clockwise" || m === "spin_ccw" || m === "spin_counterclockwise";
  }

  function spriteSpinForLayer(layer, fallback) {
    if (!isSpriteSpinMotion(layer && layer.motion_type)) return num(layer && layer.spin, fallback);
    const dpt = num(layer.degrees_per_tick, 12);
    const rad = (Math.abs(dpt) * Math.PI) / 180 || 0.18;
    const ccw = /ccw|counter/.test(String(layer.motion_type || ""));
    return (ccw ? -1 : 1) * (dpt < 0 ? -1 : 1) * rad;
  }

  function wrapRotDeg(value) {
    let d = num(value, 0) % 360;
    if (d < 0) d += 360;
    return Math.round(d * 10) / 10;
  }

  function layerRotDeg(layer) {
    if (!layer) return 0;
    if (layer.rot_deg != null && layer.rot_deg !== "") return wrapRotDeg(layer.rot_deg);
    if (layer.rotation != null && layer.rotation !== "") return wrapRotDeg(layer.rotation);
    return wrapRotDeg((num(layer.rot_start, 0) * 180) / Math.PI);
  }

  function layerRotRad(layer) {
    return (layerRotDeg(layer) * Math.PI) / 180;
  }

  function toolkitLocalPoint(layer, i, n, tick) {
    let p = toolkitShapePoint(layer, i, n);
    p = {
      x: p.x + num(layer.offset_x, 0),
      y: p.y + num(layer.offset_y, 0),
      z: p.z + num(layer.offset_z, 0),
    };
    const motion = String(layer.motion_type || "orbit");
    const speed = num(layer.speed, 0.08);
    const deg = num(layer.degrees_per_tick, 12) * tick;
    const rad = (deg * Math.PI) / 180;
    const axis = String(layer.motion_axis || "y");
    const amp = num(layer.wave_amp, 0.12);
    const freq = num(layer.wave_freq, 0.35);
    if (motion === "burst" || motion === "scatter") return p;
    if (isSpriteSpinMotion(motion)) return p;
    if (motion === "rise") return { x: p.x, y: p.y + speed * tick, z: p.z };
    if (motion === "fall") return { x: p.x, y: p.y - speed * tick, z: p.z };
    if (motion === "rain") {
      return {
        x: p.x + Math.sin(i * 1.7) * 0.012 * tick,
        y: p.y - speed * tick,
        z: p.z + Math.cos(i * 1.3) * 0.012 * tick,
      };
    }
    if (motion === "fountain") {
      return { x: p.x, y: p.y + speed * 2.1 * tick - 0.022 * tick * tick, z: p.z };
    }
    if (motion === "expand" || motion === "shockwave" || motion === "spin_out") {
      const s = 1 + speed * tick;
      return rotateAxis({ x: p.x * s, y: p.y, z: p.z * s }, axis, rad);
    }
    if (motion === "contract" || motion === "spin_in" || motion === "attract" || motion === "implosion") {
      const s = Math.max(0.04, 1 - speed * tick);
      const yMul = motion === "implosion" ? s : 1;
      return rotateAxis({ x: p.x * s, y: p.y * yMul, z: p.z * s }, axis, motion === "attract" ? 0 : rad);
    }
    if (motion === "suction") {
      const s = Math.max(0.04, 1 - speed * tick);
      return { x: p.x * s, y: p.y - speed * tick * 0.6, z: p.z * s };
    }
    if (motion === "flatten") return { x: p.x, y: p.y * Math.max(0.04, 1 - speed * tick), z: p.z };
    if (motion === "stretch") return { x: p.x, y: p.y * (1 + speed * tick), z: p.z };
    if (motion === "wave") {
      return rotateAxis({ x: p.x, y: p.y + Math.sin(tick * freq + i) * amp, z: p.z }, axis, rad);
    }
    if (motion === "pulse") {
      const s = 1 + Math.sin(tick * freq) * amp * 2.2;
      return { x: p.x * s, y: p.y * s, z: p.z * s };
    }
    if (motion === "wobble") {
      return rotateAxis({
        x: p.x + Math.sin(tick * freq + i) * amp,
        y: p.y,
        z: p.z + Math.cos(tick * freq * 0.8 + i) * amp,
      }, axis, rad);
    }
    if (motion === "oscillate") {
      const s = 1 + Math.sin(tick * freq) * amp * 1.8;
      return { x: p.x * s, y: p.y, z: p.z * s };
    }
    if (motion === "drift") return { x: p.x + speed * tick, y: p.y, z: p.z + speed * 0.35 * tick };
    if (motion === "flutter") {
      return {
        x: p.x + Math.sin(tick * 0.7 + i) * amp,
        y: p.y + Math.cos(tick * 0.9 + i * 0.4) * amp * 0.5,
        z: p.z + Math.cos(tick * 0.55 + i) * amp,
      };
    }
    if (motion === "shake") {
      const h = hash01(Math.trunc(tick) + i, Math.trunc(num(layer.seed, 1)));
      const h2 = hash01(Math.trunc(tick) + i + 9, Math.trunc(num(layer.seed, 1)) + 4);
      return { x: p.x + (h - 0.5) * amp * 2, y: p.y + (h2 - 0.5) * amp, z: p.z + (hash01(i, tick) - 0.5) * amp * 2 };
    }
    if (motion === "swirl" || motion === "helix_spin") {
      return rotateAxis({ x: p.x, y: p.y + speed * tick, z: p.z }, axis, rad);
    }
    if (motion === "tornado") {
      const s = 1 + speed * tick * 0.35;
      return rotateAxis({ x: p.x * s, y: p.y + speed * tick * 0.55, z: p.z * s }, axis, rad);
    }
    if (motion === "reverse_orbit") return rotateAxis(p, axis, -rad);
    if (motion === "lightning_strike" || motion === "slam") {
      const t = Math.min(1, tick * Math.max(0.04, speed) * 0.22);
      const ease = t * t;
      const remain = 1 - ease;
      const h = num(layer.pillar_height, 4);
      const zig = motion === "lightning_strike" ? remain * amp * Math.sin(i * 2.2 + tick * 1.8) : 0;
      return { x: p.x + zig, y: p.y + h * remain, z: p.z + zig * 0.35 };
    }
    if (motion === "meteor") {
      const t = Math.min(1, tick * Math.max(0.04, speed) * 0.16);
      const ease = t * t;
      const remain = 1 - ease;
      const h = num(layer.pillar_height, 4);
      const r = num(layer.shape_radius, 0.8);
      return { x: p.x + r * remain, y: p.y + h * remain, z: p.z - r * 0.4 * remain };
    }
    if (motion === "chain_fall") {
      const localT = Math.max(0, tick - i * 0.55);
      const t = Math.min(1, localT * Math.max(0.04, speed) * 0.2);
      const remain = 1 - t * t;
      return { x: p.x, y: p.y + num(layer.pillar_height, 3) * remain, z: p.z };
    }
    if (motion === "corkscrew") {
      return rotateAxis({ x: p.x, y: p.y - speed * tick, z: p.z }, axis, rad);
    }
    if (motion === "dash") return { x: p.x, y: p.y, z: p.z + speed * tick };
    if (motion === "hover") return { x: p.x, y: p.y + Math.sin(tick * freq + i * 0.2) * amp, z: p.z };
    if (motion === "bounce") {
      return { x: p.x, y: Math.abs(p.y) * Math.abs(Math.sin(tick * Math.max(0.08, freq))) + 0.02, z: p.z };
    }
    if (motion === "whip") {
      const t = Math.min(1, tick * Math.max(0.04, speed) * 0.2);
      const swing = Math.sin(t * Math.PI) * num(layer.shape_radius, 0.8);
      return rotateAxis({ x: p.x + swing, y: p.y, z: p.z }, axis, t * Math.PI);
    }
    return rotateAxis(p, axis, rad);
  }

  function hexToRgb01(hex, fallback) {
    const h = String(hex || "").replace("#", "").trim();
    if (h.length < 6) return fallback;
    const n = parseInt(h.slice(0, 6), 16);
    if (!Number.isFinite(n)) return fallback;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  function spawnToolkitFormation() {
    const origin = vec(0, 0.08, 0);
    let budget = 0;
    const cap = Math.max(8, Math.min(PREVIEW_CAP, num(LE_PV.doc.max_particles, PREVIEW_CAP)));
    (LE_PV.doc.layers || []).forEach((layer) => {
      if (!layer.enabled || !layerIsEmitter(layer)) return;
      const n = Math.max(1, Math.min(160, Math.trunc(num(layer.count, 32))));
      if (budget >= cap) return;
      const take = Math.min(n, cap - budget);
      budget += take;
      const start = hexToRgb01(layer.color_start, { r: 0.44, g: 0.72, b: 1 });
      const end = hexToRgb01(layer.color_end, { r: 0.91, g: 0.98, b: 1 });
      const motion = String(layer.motion_type || "orbit");
      const burst = motionBurst(motion);
      const hold = motionHolds(motion);
      const px = Math.max(14, num(layer.size, 0.35) * 86);
      const spr = spriteForLayer(layer);
      const blend = String(layer.blend || (layer.additive === false ? "translucent" : "add"));
      const startTick = Math.max(0, Math.trunc(num(layer.start_tick, num(layer.delay_ticks, 0))));
      const seed = Math.trunc(num(layer.seed, LE_PV.seed || 1));
      for (let i = 0; i < take; i++) {
        const local = toolkitLocalPoint(layer, i, n, 0);
        const speed = burst ? Math.max(0.04, num(layer.speed, 0.16)) : 0;
        const len = Math.hypot(local.x, local.y, local.z) || 1;
        const vary = 1 + num(layer.size_var, 0.18) * (hash01(i, seed) * 2 - 1);
        const style = inferSpriteStyle(layer);
        const tall = style === "shard" || style === "slash" || style === "smoke";
        LE_PV.parts.push({
          x: origin.x + local.x,
          y: origin.y + local.y,
          z: origin.z + local.z,
          vx: burst ? (local.x / len) * speed : 0,
          vy: burst ? (local.y / len) * speed : 0,
          vz: burst ? (local.z / len) * speed : 0,
          ax: 0,
          ay: burst ? num(layer.gravity, 0.01) : 0,
          az: 0,
          drag: burst ? num(layer.drag, 0.06) : 0,
          collision: !!layer.collision,
          bounce: num(layer.bounce, 0.25),
          age: 0,
          born: startTick,
          life: hold ? 1e6 : Math.max(10, num(layer.lifetime_ticks, 22)),
          live: true,
          hold,
          size: px * vary,
          sizeY: px * vary * (tall ? (style === "slash" ? 0.42 : 1.35) : 1),
          sizeEnd: px * vary * (burst ? 0.32 : (style === "smoke" ? 1.35 : 0.82)),
          r: start.r,
          g: start.g,
          b: start.b,
          rEnd: end.r,
          gEnd: end.g,
          bEnd: end.b,
          type: layer.type || "vaerun:emitter",
          rot: layerRotRad(layer) + (layer.random_rotation ? (i / n) * Math.PI * 2 * (style === "shard" ? 1 : 0.15) : 0),
          spin: spriteSpinForLayer(layer, style === "shard" ? 0.12 : burst ? 0.08 : 0.03),
          flipX: !!layer.flip_x,
          flipY: !!layer.flip_y,
          additive: blend === "add" || blend === "additive" || blend === "glow",
          uvFrames: spr.frames,
          uvLoop: layer.uv_loop !== false,
          fps: num(layer.uv_fps, 10),
          uvStretch: !!layer.uv_stretch,
          missingTex: spr.missing,
          trail: layer.trail ? [] : null,
          trailLen: Math.max(2, Math.trunc(num(layer.trail_len, 6))),
          _tk: true,
          _layer: layer,
          _i: i,
          _n: n,
          _start: startTick,
        });
      }
    });
  }

  function toolkitTickNow() {
    if (LE_PV.paused || LE_PV.scrubbing) return Math.max(0, Math.trunc(LE_PV.pauseTick || 0));
    return Math.max(0, Math.trunc((performance.now() - LE_PV.t0) / 50));
  }

  function stepToolkitTick(tickHint) {
    const origin = vec(0, 0.08, 0);
    const tick = tickHint != null ? Math.max(0, Math.trunc(tickHint)) : toolkitTickNow();
    for (const p of LE_PV.parts) {
      if (!p._tk || !p._layer) continue;
      const start = p._start || 0;
      if (tick < start) {
        p.age = 0;
        continue;
      }
      const localTick = tick - start;
      const emitDur = Math.trunc(num(p._layer.emit_duration_ticks, 0));
      if (emitDur > 0 && localTick > emitDur && p.hold) {
        p.age = p.life + 1;
        continue;
      }
      const motion = String(p._layer.motion_type || "orbit");
      if (!motionBurst(motion)) {
        const local = toolkitLocalPoint(p._layer, p._i, p._n, localTick);
        p.x = origin.x + local.x;
        p.y = origin.y + local.y;
        p.z = origin.z + local.z;
      }
      p.age = localTick;
      if (p.trail) {
        p.trail.push({ x: p.x, y: p.y, z: p.z });
        if (p.trail.length > p.trailLen) p.trail.shift();
      }
    }
  }

  function rebuildParticles(opts) {
    const rng = mulberry(LE_PV.seed || 1);
    if (!opts || !opts.keepClock) {
      LE_PV.t0 = performance.now();
      LE_PV.lastSim = LE_PV.t0;
      LE_PV.simCarry = 0;
    }
    LE_PV.parts = [];
    if (LE_PV.doc.kind === "clip") adoptClipAsEmitter();
    spawnToolkitFormation();
    (LE_PV.doc.layers || []).forEach((layer, i) => {
      layer._acc = 0;
      layer._age = 0;
      layer._spawnedInstant = false;
      layer._helixStep = 0;
      LE_PV.lastEmit[i] = 0;
      if (!layer.enabled || layerIsEmitter(layer)) return;
      if (usesSteadyEmitter(layer)) return;
      if (usesPhysEmitter(layer)) {
        const n = Math.min(PREVIEW_CAP - LE_PV.parts.length, num(layer.maximum, 100), Math.max(1, num(layer.amount, layer.count || 16)));
        for (let k = 0; k < n; k++) spawnEmitterParticle(layer);
        return;
      }
      const extra = spawnFromBursts(sampleShape(layer, rng), layer.type, rng, fireish(layer.type) ? 0.0018 : 0.0004);
      extra.forEach((p) => { p._layer = layer; });
      LE_PV.parts.push(...extra);
    });
    LE_PV.hudCount = -1;
    updateHud();
  }

  function emitterShouldSpawn(layer) {
    if (LE_PV.previewLoop === "loop") return true;
    const mode = String(layer.lifetime_mode || (layer.loop ? "looping" : "once"));
    const active = Math.max(0.05, num(layer.active_time, 2));
    const sleep = Math.max(0, num(layer.sleep_time, 0));
    if (mode === "once") return layer._age <= active;
    const cycle = active + sleep;
    if (cycle <= 0.05) return true;
    return (layer._age % cycle) <= active;
  }

  function stepEmitterTick(tick) {
    for (const p of LE_PV.parts) {
      if (!p.live) continue;
      if ((p.born || 0) > tick) continue;
      if (p.hold || (p._tk && !motionBurst(p._layer?.motion_type))) continue;
      if (p.flutter) {
        p.ax = Math.sin(p.age * 0.22) * 0.03;
        p.az = Math.cos(p.age * 0.1) * 0.022;
      }
      p.vx += p.ax || 0;
      p.vy += p.ay || 0;
      p.vz += p.az || 0;
      const keep = Math.max(0, 1 - (p.drag || 0));
      p.vx *= keep;
      p.vy *= keep;
      p.vz *= keep;
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      if (p.collision && p.y < 0) {
        p.y = 0;
        if (p.expire) p.age = p.life;
        else p.vy = Math.abs(p.vy) * (p.bounce || 0.3);
      }
      p.age += 1;
    }
    const bag = LE_PV.parts;
    let keep = 0;
    for (let i = 0; i < bag.length; i++) {
      const p = bag[i];
      if (p.live && p.age > p.life) continue;
      bag[keep++] = p;
    }
    bag.length = keep;
    stepToolkitTick(tick);
    LE_PV.doc.layers.forEach((layer, i) => {
      if (!layer.enabled || layerIsEmitter(layer)) return;
      layer._age = (layer._age || 0) + 0.05;
      if (usesSteadyEmitter(layer)) {
        if (!emitterShouldSpawn(layer)) return;
        layer._acc = (layer._acc || 0) + num(layer.emit_rate, 8) * 0.05;
        let guard = 0;
        const cap = Math.min(PREVIEW_CAP, Math.max(8, num(layer.maximum, 80)));
        while (layer._acc >= 1 && guard++ < 8 && LE_PV.parts.length < cap) {
          layer._acc -= 1;
          spawnEmitterParticle(layer);
        }
        return;
      }
      if (!layer.loop || LE_PV.previewLoop === "once") return;
      const dur = Math.max(0, Math.trunc(num(layer.duration_ticks, 0)));
      if (dur > 0 && tick > dur) return;
      const interval = layerInterval(layer);
      const last = LE_PV.lastEmit[i] ?? 0;
      if (tick - last >= interval && tick > 0.45) {
        emitLayer(layer, tick);
        LE_PV.lastEmit[i] = tick;
      }
    });
  }

  function tickEmitters(tick) {
    const now = performance.now();
    LE_PV.simCarry = (LE_PV.simCarry || 0) + Math.min(100, now - (LE_PV.lastSim || now));
    LE_PV.lastSim = now;
    let steps = 0;
    while (LE_PV.simCarry >= 50 && steps < 4) {
      LE_PV.simCarry -= 50;
      steps++;
      stepEmitterTick(tick);
    }
    compactParts(tick);
    updateHud();
  }

  function compactParts(tick) {
    const a = LE_PV.parts;
    let w = 0;
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      const age = p.live ? p.age : tick - (p.born || 0);
      if (age <= p.life) a[w++] = p;
    }
    a.length = w;
  }

  function updateHud() {
    const hud = $("le_pv_hud_meta");
    if (!hud || LE_PV.hudCount === LE_PV.parts.length) return;
    LE_PV.hudCount = LE_PV.parts.length;
    const layers = LE_PV.doc.layers || [];
    const emN = layers.filter((l) => l.enabled && layerIsEmitter(l)).length;
    const shN = layers.filter((l) => l.enabled && !layerIsEmitter(l)).length;
    const looping = layers.some((l) => l.enabled && (layerIsEmitter(l) || l.loop || usesSteadyEmitter(l)));
    const budget = layers.reduce((n, l) => n + (l.enabled && layerIsEmitter(l) ? Math.max(0, Math.trunc(num(l.count, 0))) : 0), 0);
    const bits = [`${LE_PV.parts.length} motes`];
    if (emN) bits.push(`${emN} emitter`);
    if (shN) bits.push(`${shN} shape`);
    if (budget) bits.push(`budget ${Math.min(PREVIEW_CAP, budget)}`);
    if (looping) bits.push("loop");
    hud.textContent = bits.join(" · ");
  }

  function effectDurationTicks() {
    let max = 48;
    (LE_PV.doc.layers || []).forEach((l) => {
      if (!l.enabled) return;
      const start = Math.max(0, num(l.start_tick, num(l.delay_ticks, 0)));
      const life = Math.max(8, num(l.lifetime_ticks, 30));
      const dur = num(l.emit_duration_ticks, 0);
      max = Math.max(max, start + (dur > 0 ? dur : life) + num(l.fade_out_ticks, 8));
    });
    return Math.max(20, Math.min(400, Math.trunc(max)));
  }

  function simulateTo(targetTick) {
    const t = Math.max(0, Math.trunc(targetTick));
    LE_PV.scrubbing = true;
    rebuildParticles({ keepClock: true });
    LE_PV.simCarry = 0;
    for (let i = 0; i < t; i++) stepEmitterTick(i);
    LE_PV.pauseTick = t;
    LE_PV.scrubbing = false;
  }

  function updateTimelineHud(tick) {
    const dur = effectDurationTicks();
    const scrub = $("le_pv_scrub");
    if (scrub && document.activeElement !== scrub) {
      scrub.max = String(dur);
      scrub.value = String(Math.max(0, Math.min(dur, Math.trunc(tick))));
    }
    const label = $("le_pv_time");
    if (label) label.textContent = (Math.max(0, tick) / 20).toFixed(2) + " / " + (dur / 20).toFixed(2) + "s";
  }

  function project(x, y, z, w, h) {
    x -= LE_PV.panX;
    y -= LE_PV.panY;
    z -= LE_PV.panZ;
    const cy = Math.cos(LE_PV.yaw);
    const sy = Math.sin(LE_PV.yaw);
    const cp = Math.cos(LE_PV.pitch);
    const sp = Math.sin(LE_PV.pitch);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const cam = z2 + LE_PV.dist;
    if (cam < 0.2) return { x: -9999, y: -9999, z: cam, s: 0 };
    const s = (Math.min(w, h) * 0.78) / cam;
    return { x: w * 0.5 + x1 * s, y: h * 0.54 - y1 * s, z: cam, s };
  }

  function currentTick() {
    if (LE_PV.paused || LE_PV.scrubbing) return LE_PV.pauseTick || 0;
    return (performance.now() - LE_PV.t0) / 50;
  }

  function setPaused(paused) {
    if (paused && !LE_PV.paused) LE_PV.pauseTick = (performance.now() - LE_PV.t0) / 50;
    if (!paused && LE_PV.paused) {
      LE_PV.t0 = performance.now() - (LE_PV.pauseTick || 0) * 50;
      LE_PV.lastSim = performance.now();
      LE_PV.simCarry = 0;
    }
    LE_PV.paused = !!paused;
    const btn = $("le_pv_pause");
    if (btn) btn.textContent = LE_PV.paused ? "Resume" : "Pause";
    paint();
  }

  function drawLine(ctx, a, b, col, w) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w || 1.5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawGizmo(ctx, layer, selected, w, h) {
    const o = layerOrigin(layer);
    const origin = project(o.x, o.y, o.z, w, h);
    const col = selected ? "rgba(255,217,120,0.95)" : "rgba(140,170,210,0.55)";
    const ax = project(o.x + 0.55, o.y, o.z, w, h);
    const ay = project(o.x, o.y + 0.55, o.z, w, h);
    const az = project(o.x, o.y, o.z + 0.55, w, h);
    drawLine(ctx, origin, ax, "rgba(255,90,90,0.85)", 2);
    drawLine(ctx, origin, ay, "rgba(90,220,120,0.85)", 2);
    drawLine(ctx, origin, az, "rgba(90,150,255,0.85)", 2);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, selected ? 5.5 : 4, 0, Math.PI * 2);
    ctx.fill();
    const shape = String(layer.shape || "point");
    const r = Math.max(0.05, num(layer.shape_radius, 1.2));
    ctx.strokeStyle = selected ? "rgba(255,217,120,0.7)" : "rgba(126,184,255,0.35)";
    ctx.lineWidth = 1.25;
    if (shape === "circle" || shape === "circle_2d" || shape === "radius" || shape === "sphere") {
      ctx.beginPath();
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const ang = (Math.PI * 2 * i) / steps;
        const p = project(o.x + Math.cos(ang) * r, o.y, o.z + Math.sin(ang) * r, w, h);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    if (shape === "helix" || shape === "pillar") {
      const hh = Math.max(0.2, num(layer.pillar_height, 2.4));
      const top = project(o.x, o.y + hh, o.z, w, h);
      drawLine(ctx, origin, top, ctx.strokeStyle, 1.25);
    }
    if (shape === "line_forward" || shape === "cone") {
      const len = Math.max(0.2, num(layer.line_length, 3));
      drawLine(ctx, origin, project(o.x, o.y, o.z + len, w, h), ctx.strokeStyle, 1.5);
    }
    if (shape === "line_up") {
      const len = Math.max(0.2, num(layer.line_length, 3));
      drawLine(ctx, origin, project(o.x, o.y + len, o.z, w, h), ctx.strokeStyle, 1.5);
    }
    if (shape === "custom" || shape === "path" || shape === "points") {
      const pts = layer.points || [];
      let prev = null;
      pts.forEach((pt, i) => {
        const wpt = localToWorld(layer, vec(num(pt.x, 0), num(pt.y, 0), num(pt.z, 0)));
        const pr = project(wpt.x, wpt.y, wpt.z, w, h);
        ctx.fillStyle = i === 0 ? "#7ee0a8" : col;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (prev) drawLine(ctx, prev, pr, "rgba(126,224,180,0.75)", 1.5);
        prev = pr;
      });
      if (layer.closed && pts.length >= 3) {
        const a = localToWorld(layer, vec(num(pts[0].x, 0), num(pts[0].y, 0), num(pts[0].z, 0)));
        const b = localToWorld(layer, vec(num(pts[pts.length - 1].x, 0), num(pts[pts.length - 1].y, 0), num(pts[pts.length - 1].z, 0)));
        drawLine(ctx, project(b.x, b.y, b.z, w, h), project(a.x, a.y, a.z, w, h), "rgba(126,224,180,0.75)", 1.5);
      }
    }
  }

  function drawOrigin(ctx, w, h) {
    const o = project(0, 0.08, 0, w, h);
    if (o.s <= 0) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = "rgba(232, 195, 106, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(o.x, o.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(232, 195, 106, 0.9)";
    ctx.beginPath();
    ctx.arc(o.x, o.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGrid(ctx, w, h) {
    if (!LE_PV.showGrid) return;
    const span = 12;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(58, 72, 88, 0.42)";
    ctx.beginPath();
    for (let i = -span; i <= span; i++) {
      if (i === 0) continue;
      const a = project(i, 0, -span, w, h);
      const b = project(i, 0, span, w, h);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      const c = project(-span, 0, i, w, h);
      const d = project(span, 0, i, w, h);
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 110, 130, 0.55)";
    ctx.beginPath();
    const ax = project(0, 0, -span, w, h);
    const bx = project(0, 0, span, w, h);
    ctx.moveTo(ax.x, ax.y);
    ctx.lineTo(bx.x, bx.y);
    const cz = project(-span, 0, 0, w, h);
    const dz = project(span, 0, 0, w, h);
    ctx.moveTo(cz.x, cz.y);
    ctx.lineTo(dz.x, dz.y);
    ctx.stroke();
  }

  function drawAxis(ctx, w, h) {
    if (!LE_PV.showAxis) return;
    const o = project(0, 0, 0, w, h);
    drawLine(ctx, o, project(1, 0, 0, w, h), "#d45454", 2);
    drawLine(ctx, o, project(0, 1, 0, w, h), "#4cbf6a", 2);
    drawLine(ctx, o, project(0, 0, 1, w, h), "#4a86d8", 2);
  }

  function drawBlock(ctx, w, h) {
    if (!LE_PV.showBlock) return;
    const pts = [
      [-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5],
      [-0.5, 1, -0.5], [0.5, 1, -0.5], [0.5, 1, 0.5], [-0.5, 1, 0.5],
    ].map(([x, y, z]) => project(x, y, z, w, h));
    const faces = [
      { i: [0, 1, 5, 4], c: "#7a6240" },
      { i: [1, 2, 6, 5], c: "#8a6d48" },
      { i: [2, 3, 7, 6], c: "#6d5638" },
      { i: [3, 0, 4, 7], c: "#5e4a30" },
      { i: [4, 5, 6, 7], c: "#5b9a3c" },
    ];
    faces.sort((a, b) => {
      const za = a.i.reduce((s, i) => s + pts[i].z, 0);
      const zb = b.i.reduce((s, i) => s + pts[i].z, 0);
      return zb - za;
    });
    ctx.lineWidth = 1;
    for (const f of faces) {
      ctx.beginPath();
      ctx.moveTo(pts[f.i[0]].x, pts[f.i[0]].y);
      for (let n = 1; n < f.i.length; n++) ctx.lineTo(pts[f.i[n]].x, pts[f.i[n]].y);
      ctx.closePath();
      ctx.fillStyle = f.c;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.stroke();
    }
  }

  function pushBox(faces, w, h, x, y, z, sx, sy, sz, top, side, side2, bottom) {
    const p = [
      [x, y, z], [x + sx, y, z], [x + sx, y, z + sz], [x, y, z + sz],
      [x, y + sy, z], [x + sx, y + sy, z], [x + sx, y + sy, z + sz], [x, y + sy, z + sz],
    ].map(([a, b, c]) => project(a, b, c, w, h));
    const add = (idx, c) => {
      const zAvg = (p[idx[0]].z + p[idx[1]].z + p[idx[2]].z + p[idx[3]].z) * 0.25;
      faces.push({ p, idx, c, z: zAvg });
    };
    add([0, 1, 5, 4], side);
    add([1, 2, 6, 5], side2 || side);
    add([2, 3, 7, 6], side);
    add([3, 0, 4, 7], side2 || side);
    add([4, 5, 6, 7], top);
    if (bottom) add([0, 3, 2, 1], bottom);
  }

  function strokeFaces(ctx, faces) {
    faces.sort((a, b) => b.z - a.z);
    ctx.lineWidth = 1;
    for (const f of faces) {
      const p = f.p;
      let skip = false;
      for (let n = 0; n < f.idx.length; n++) {
        const q = p[f.idx[n]];
        if (!q || q.s <= 0 || q.z < 0.7) { skip = true; break; }
      }
      if (skip) continue;
      ctx.beginPath();
      ctx.moveTo(p[f.idx[0]].x, p[f.idx[0]].y);
      for (let n = 1; n < f.idx.length; n++) ctx.lineTo(p[f.idx[n]].x, p[f.idx[n]].y);
      ctx.closePath();
      ctx.fillStyle = f.c;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.stroke();
    }
  }

  function drawBillboardLabel(ctx, pr, text, fill) {
    if (!pr || pr.s <= 0) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = "600 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const pad = 4;
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(10,12,16,0.72)";
    ctx.fillRect(pr.x - tw * 0.5 - pad, pr.y - 8, tw + pad * 2, 16);
    ctx.fillStyle = fill || "#e8eef6";
    ctx.fillText(text, pr.x, pr.y);
    ctx.restore();
  }

  function drawFacingGuide(ctx, w, h) {
    const youOn = LE_PV.showYou !== false;
    const mobOn = LE_PV.showMob !== false;
    const arrowOn = LE_PV.showArrow !== false;
    if (!youOn && !mobOn && !arrowOn) return;
    const faces = [];
    const youX = -0.18;
    const youZ = -0.95;
    if (youOn) {
      pushBox(faces, w, h, youX + 0.08, 0, youZ + 0.08, 0.24, 0.74, 0.24, "#2c241c", "#3c2a1c", "#241810");
      pushBox(faces, w, h, youX + 0.42, 0, youZ + 0.08, 0.24, 0.74, 0.24, "#2c241c", "#3c2a1c", "#241810");
      pushBox(faces, w, h, youX + 0.04, 0.7, youZ + 0.02, 0.66, 0.74, 0.36, "#3d6fc4", "#2f5aa8", "#4a7ad0");
      pushBox(faces, w, h, youX - 0.16, 0.78, youZ + 0.08, 0.22, 0.64, 0.24, "#c4a882", "#b39470", "#d4b894");
      pushBox(faces, w, h, youX + 0.68, 0.78, youZ + 0.08, 0.22, 0.64, 0.24, "#c4a882", "#b39470", "#d4b894");
      pushBox(faces, w, h, youX + 0.12, 1.42, youZ - 0.02, 0.5, 0.5, 0.5, "#2c241c", "#c4a882", "#b39470");
      pushBox(faces, w, h, youX + 0.2, 1.58, youZ + 0.42, 0.12, 0.12, 0.08, "#f4f7fb", "#e8eef6", "#dce4ee");
      pushBox(faces, w, h, youX + 0.42, 1.58, youZ + 0.42, 0.12, 0.12, 0.08, "#f4f7fb", "#e8eef6", "#dce4ee");
    }
    const mx = -0.12;
    const mz = 3.15;
    if (mobOn) {
      pushBox(faces, w, h, mx + 0.1, 0, mz + 0.1, 0.22, 0.7, 0.22, "#4a1818", "#5a2020", "#3a1010");
      pushBox(faces, w, h, mx + 0.38, 0, mz + 0.1, 0.22, 0.7, 0.22, "#4a1818", "#5a2020", "#3a1010");
      pushBox(faces, w, h, mx + 0.06, 0.66, mz + 0.04, 0.58, 0.7, 0.32, "#8a3030", "#6a2020", "#a04040");
      pushBox(faces, w, h, mx + 0.14, 1.34, mz + 0.0, 0.42, 0.42, 0.42, "#3a1010", "#c47868", "#a06050");
      pushBox(faces, w, h, mx + 0.2, 1.48, mz - 0.04, 0.1, 0.1, 0.06, "#f4d0c8", "#e8c0b8", "#dcb0a8");
      pushBox(faces, w, h, mx + 0.38, 1.48, mz - 0.04, 0.1, 0.1, 0.06, "#f4d0c8", "#e8c0b8", "#dcb0a8");
    }
    if (faces.length) strokeFaces(ctx, faces);
    if (arrowOn) {
      const a0 = project(0, 1.15, 0.15, w, h);
      const a1 = project(0, 1.15, 2.55, w, h);
      const tipL = project(-0.2, 1.15, 2.25, w, h);
      const tipR = project(0.2, 1.15, 2.25, w, h);
      drawLine(ctx, a0, a1, "rgba(90, 210, 255, 0.95)", 3);
      if (a1.s > 0 && tipL.s > 0 && tipR.s > 0) {
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y);
        ctx.lineTo(tipL.x, tipL.y);
        ctx.lineTo(tipR.x, tipR.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(90, 210, 255, 0.92)";
        ctx.fill();
      }
      drawBillboardLabel(ctx, project(0, 1.4, 1.35, w, h), "FORWARD", "#7ee0ff");
    }
    if (youOn) drawBillboardLabel(ctx, project(youX + 0.35, 0.08, youZ - 0.12, w, h), "YOU", "#9ec8ff");
    if (mobOn) drawBillboardLabel(ctx, project(mx + 0.3, 0.08, mz + 0.72, w, h), "MOB", "#ff9a8a");
  }

  function drawSky(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#6eb6ea");
    g.addColorStop(0.42, "#a9d4f4");
    g.addColorStop(0.62, "#c5e3a0");
    g.addColorStop(1, "#5a9a48");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawMcWorld(ctx, w, h) {
    const faces = [];
    const grass = "#4c9a34";
    const grass2 = "#5b9a3c";
    const dirt = "#7a6240";
    const dirt2 = "#8a6d48";
    const dirt3 = "#5e4a30";
    for (let gx = -6; gx <= 6; gx++) {
      for (let gz = -6; gz <= 6; gz++) {
        const top = ((gx + gz) & 1) ? grass : grass2;
        pushBox(faces, w, h, gx, -1, gz, 1, 1, 1, top, dirt, dirt2);
      }
    }
    const tree = (tx, tz) => {
      pushBox(faces, w, h, tx + 0.32, 0, tz + 0.32, 0.36, 1.2, 0.36, "#6b4a2a", "#5a3c22", "#7a5630");
      pushBox(faces, w, h, tx - 0.22, 0.9, tz - 0.22, 1.45, 1.25, 1.45, "#3d8a32", "#2f6f28", "#4a9a38");
    };
    tree(4.2, -4.4);
    tree(-4.8, 3.6);
    tree(4.6, 4.2);
    const px = -1.05;
    const pz = -0.15;
    pushBox(faces, w, h, px + 0.08, 0, pz + 0.08, 0.24, 0.74, 0.24, "#2c241c", "#3c2a1c", "#241810");
    pushBox(faces, w, h, px + 0.42, 0, pz + 0.08, 0.24, 0.74, 0.24, "#2c241c", "#3c2a1c", "#241810");
    pushBox(faces, w, h, px + 0.04, 0.7, pz + 0.02, 0.66, 0.74, 0.36, "#3d6fc4", "#2f5aa8", "#4a7ad0");
    pushBox(faces, w, h, px - 0.16, 0.78, pz + 0.08, 0.22, 0.64, 0.24, "#c4a882", "#b39470", "#d4b894");
    pushBox(faces, w, h, px + 0.68, 0.78, pz + 0.08, 0.22, 0.64, 0.24, "#c4a882", "#b39470", "#d4b894");
    pushBox(faces, w, h, px + 0.12, 1.42, pz - 0.04, 0.5, 0.5, 0.5, "#2c241c", "#c4a882", "#b39470");
    pushBox(faces, w, h, px + 0.2, 1.58, pz - 0.08, 0.12, 0.12, 0.08, "#f4f7fb", "#e8eef6", "#dce4ee");
    pushBox(faces, w, h, px + 0.42, 1.58, pz - 0.08, 0.12, 0.12, 0.08, "#f4f7fb", "#e8eef6", "#dce4ee");
    strokeFaces(ctx, faces);
  }

  function previewStamp(img, maxDim) {
    if (!img) return img;
    const w = Math.max(1, img.width || 1);
    const h = Math.max(1, img.height || 1);
    const cap = Math.max(16, maxDim || 48);
    if (Math.max(w, h) <= cap) return img;
    const id = img._leUid || (img._leUid = ++tintUid);
    const key = "stamp:" + id + ":" + cap;
    const hit = tintCache.get(key);
    if (hit) return hit;
    const s = cap / Math.max(w, h);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * s));
    c.height = Math.max(1, Math.round(h * s));
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 0, 0, c.width, c.height);
    if (tintCache.size > 96) tintCache.delete(tintCache.keys().next().value);
    tintCache.set(key, c);
    return c;
  }

  function tintedSprite(img, r, g, b) {
    if (!img) return img;
    const qr = (r * 12 + 0.5) | 0;
    const qg = (g * 12 + 0.5) | 0;
    const qb = (b * 12 + 0.5) | 0;
    if (qr >= 12 && qg >= 12 && qb >= 12) return previewStamp(img, 48);
    const src = previewStamp(img, 48);
    const id = src._leUid || (src._leUid = ++tintUid);
    const key = id + ":" + qr + ":" + qg + ":" + qb;
    const hit = tintCache.get(key);
    if (hit) return hit;
    const tw = Math.max(1, src.width || 16);
    const th = Math.max(1, src.height || 16);
    const c = document.createElement("canvas");
    c.width = tw;
    c.height = th;
    const tctx = c.getContext("2d");
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(src, 0, 0, tw, th);
    tctx.globalCompositeOperation = "multiply";
    tctx.fillStyle = `rgb(${Math.round((qr / 12) * 255)},${Math.round((qg / 12) * 255)},${Math.round((qb / 12) * 255)})`;
    tctx.fillRect(0, 0, tw, th);
    tctx.globalCompositeOperation = "destination-in";
    tctx.drawImage(src, 0, 0, tw, th);
    if (tintCache.size > 96) tintCache.delete(tintCache.keys().next().value);
    tintCache.set(key, c);
    return c;
  }

  function paint(targetCanvas, opts) {
    opts = opts || {};
    const canvas = targetCanvas || $("le_pv_canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!opts.world) {
      LE_PV.drawCanvas = canvas;
      LE_PV.ctx = ctx;
    }
    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (opts.world) {
      drawSky(ctx, w, h);
      drawMcWorld(ctx, w, h);
    } else {
      ctx.fillStyle = "#12151c";
      ctx.fillRect(0, 0, w, h);
      if (LE_PV.showHelpers !== false) {
        drawGrid(ctx, w, h);
        drawBlock(ctx, w, h);
        drawFacingGuide(ctx, w, h);
        drawAxis(ctx, w, h);
        if (LE_PV.showOrigin) drawOrigin(ctx, w, h);
        (LE_PV.doc.layers || []).forEach((layer, i) => {
          if (layer.enabled) drawGizmo(ctx, layer, i === LE_PV.selected, w, h);
        });
      }
    }
    const tick = currentTick();
    if (!LE_PV.paused && !LE_PV.scrubbing && opts.tick !== false) tickEmitters(tick);
    if (!opts.world) updateTimelineHud(tick);
    const vis = LE_PV.vis;
    vis.length = 0;
    const parts = LE_PV.parts;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p._start != null && tick < p._start) continue;
      const age = p.live ? p.age : tick - (p.born || 0);
      if (age < 0 || age > p.life) continue;
      const x = p.live ? p.x : p.x + p.vx * age;
      const y = p.live ? p.y : p.y + p.vy * age - (p.gravity || 0) * age * age;
      const z = p.live ? p.z : p.z + p.vz * age;
      const pr = project(x, y, z, w, h);
      if (pr.s <= 0) continue;
      vis.push({ p, pr, age });
      if (vis.length >= PREVIEW_CAP) break;
    }
    vis.sort((a, b) => b.pr.z - a.pr.z);
    ctx.imageSmoothingEnabled = false;
    let lastAdd = false;
    for (let i = 0; i < vis.length; i++) {
      const it = vis[i];
      const pr = it.pr;
      const layer = it.p._layer;
      const looping = it.p.uvLoop !== false;
      const dur = Math.max(12, effectDurationTicks());
      const lifeT = it.p.hold
        ? (looping ? it.age / dur : Math.min(1, it.age / dur))
        : it.age / Math.max(1, it.p.life);
      const fadeLife = it.p.hold ? 1 : Math.max(0, 1 - it.age / Math.max(1, it.p.life));
      const fadeIn = layer ? Math.min(1, it.age / Math.max(1, num(layer.fade_in_ticks, 3))) : 1;
      const fadeOut = layer && num(layer.fade_out_ticks, 8) > 0 && !it.p.hold && !looping
        ? (it.age > it.p.life - num(layer.fade_out_ticks, 8)
          ? Math.max(0, (it.p.life - it.age) / Math.max(1, num(layer.fade_out_ticks, 8)))
          : 1)
        : fadeLife;
      const alphaCurve = curveAt(layer?.alpha_curve || "fade_in_out", lifeT, looping);
      const fade = Math.max(0, Math.min(1, fadeIn * fadeOut * alphaCurve * (it.p.hold ? 0.55 + 0.45 * curveAt(layer?.scale_curve || "linear", lifeT, looping) : 1)));
      const scaleCurve = curveAt(layer?.scale_curve || "linear", lifeT, looping);
      const t = it.p.hold ? (looping ? lifeT : Math.min(1, lifeT)) : it.age / Math.max(1, it.p.life);
      const sizeLerp = it.p.sizeEnd != null ? it.p.size + (it.p.sizeEnd - it.p.size) * (it.p.hold ? scaleCurve : t) : it.p.size;
      const base = sizeLerp * (0.72 + 0.4 * scaleCurve);
      const baseY = it.p.sizeY != null ? (it.p.sizeEnd != null ? it.p.sizeY + (it.p.sizeEnd - it.p.sizeY) * t : it.p.sizeY) : base;
      const worldMul = opts.world ? 2.15 : 1;
      const sz = Math.max(opts.world ? 5 : 6, base * (pr.s / 42) * (0.75 + fade * 0.35) * worldMul);
      const szY = Math.max(opts.world ? 5 : 6, baseY * (pr.s / 42) * (0.75 + fade * 0.35) * worldMul);
      const frames = (layer && framesForLayer(layer, layer.type)) || it.p.uvFrames;
      let img = null;
      if (frames && frames.length) {
        let idx;
        if (it.p.uvStretch) {
          const st = looping ? ((lifeT % 1) + 1) % 1 : Math.min(0.999, Math.max(0, t));
          idx = Math.min(frames.length - 1, Math.floor(st * frames.length));
        } else {
          idx = Math.floor(it.age * ((it.p.fps || 10) / 20) + (it.p.frameOff || 0));
          if (!looping) idx = Math.min(frames.length - 1, idx);
          else idx = ((idx % frames.length) + frames.length) % frames.length;
        }
        img = frames[idx];
        if (img && (layer?.uv_mode || "animated") === "animated" && num(layer?.uv_max, 1) > 1 && (img.width || 0) > (img.height || 1) * 3) img = null;
      }
      const colorT = curveAt(layer?.color_curve || "linear", looping ? ((t % 1) + 1) % 1 : t, looping);
      let rgb = [it.p.r, it.p.g, it.p.b];
      if (it.p.rEnd != null) {
        rgb = [
          it.p.r + (it.p.rEnd - it.p.r) * colorT,
          (it.p.gEnd != null ? it.p.g + (it.p.gEnd - it.p.g) * colorT : it.p.g),
          (it.p.bEnd != null ? it.p.b + (it.p.bEnd - it.p.b) * colorT : it.p.b),
        ];
      }
      if (it.p.stops && it.p.stops.length) {
        const range = Math.max(0.001, it.p.gradRange || 1);
        const expr = String(it.p.gradInterp || "");
        const u = expr.includes("random") ? (it.p.gradRand || 0) : t;
        rgb = sampleColorStops(it.p.stops, u / range);
      }
      const ang = (it.p.rot || 0) + it.age * (it.p.spin || 0);
      const add = !!it.p.additive;
      if (add !== lastAdd) {
        ctx.globalCompositeOperation = add ? "lighter" : "source-over";
        lastAdd = add;
      }
      if (it.p.trail && it.p.trail.length > 1) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let k = 0; k < it.p.trail.length; k++) {
          const tr = project(it.p.trail[k].x, it.p.trail[k].y, it.p.trail[k].z, w, h);
          if (tr.s <= 0) continue;
          const ta = fade * (k / it.p.trail.length) * 0.4;
          ctx.globalAlpha = ta;
          ctx.fillStyle = `rgba(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)},${ta})`;
          ctx.beginPath();
          ctx.ellipse(tr.x, tr.y, Math.max(2, sz * 0.18), Math.max(2, szY * 0.18), 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = fade;
      if (img) {
        const custom = layer && isCustomSheet(layer);
        const tintOn = layerTints(layer) && (rgb[0] < 0.995 || rgb[1] < 0.995 || rgb[2] < 0.995);
        if (tintOn) img = tintedSprite(img, rgb[0], rgb[1], rgb[2]);
        else img = previewStamp(img, custom ? 64 : 48);
        const aspect = Math.max(0.25, Math.min(4, (img.height || 1) / Math.max(1, img.width || 1)));
        const dw = sz;
        const dh = custom ? sz * aspect : szY;
        ctx.setTransform(1, 0, 0, 1, pr.x, pr.y);
        ctx.rotate(ang);
        ctx.scale(it.p.flipX ? -1 : 1, it.p.flipY ? -1 : 1);
        try { ctx.drawImage(img, -dw * 0.5, -dh * 0.5, dw, dh); } catch (_) { img = null; }
      }
      if (!img) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)},${fade})`;
        const rad = it.p._tk ? Math.max(4, sz * 0.42) : sz * 0.28;
        ctx.ellipse(pr.x, pr.y, rad, it.p._tk ? Math.max(4, szY * 0.42) : szY * 0.28, ang, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const holdOrbit = (LE_PV.doc.layers || []).some((l) => l.enabled && layerIsEmitter(l) && motionHolds(l.motion_type));
    const continuous = holdOrbit || (LE_PV.doc.layers || []).some((l) => l.enabled && !layerIsEmitter(l) && usesSteadyEmitter(l));
    if (!LE_PV.paused && LE_PV.previewLoop !== "once" && vis.length === 0 && tick > 8 && !continuous) {
      LE_PV.seed = (LE_PV.seed + 17) >>> 0;
      rebuildParticles();
    }
    if (!opts.world) {
      try { paintSheetPlay(); } catch (_) { /* inspector sheet is optional */ }
    }
  }

  function loop() {
    if (typeof isParticleStudioMode === "function" && !isParticleStudioMode()) {
      LE_PV.raf = 0;
      return;
    }
    if (!LE_PV.paused && !document.hidden) paint();
    LE_PV.raf = requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const canvas = $("le_pv_canvas");
    const stage = $("le_pv_stage");
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(240, Math.floor(rect.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      LE_PV.drawCanvas = null;
      LE_PV.ctx = null;
    }
  }

  function replay() {
    setPaused(false);
    const first = (LE_PV.doc.layers || []).find((l) => l.enabled);
    LE_PV.seed = Math.max(1, Math.trunc(num(LE_PV.doc.seed, num(first && first.seed, 1))));
    rebuildParticles();
    paint();
  }

  function scheduleReplay() {
    clearTimeout(LE_PV.rebuildTimer);
    LE_PV.rebuildTimer = setTimeout(() => replay(), 90);
  }

  function pickGround(clientX, clientY) {
    const canvas = $("le_pv_canvas");
    const rect = canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (canvas.width / rect.width);
    const sy = (clientY - rect.top) * (canvas.height / rect.height);
    let best = vec(LE_PV.panX, 0, LE_PV.panZ);
    let bestD = 1e12;
    function search(cx, cz, span, step) {
      for (let gx = cx - span; gx <= cx + span; gx += step) {
        for (let gz = cz - span; gz <= cz + span; gz += step) {
          const p = project(gx, 0, gz, canvas.width, canvas.height);
          const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
          if (d < bestD) {
            bestD = d;
            best = vec(gx, 0, gz);
          }
        }
      }
    }
    search(LE_PV.panX, LE_PV.panZ, 14, 1.4);
    search(best.x, best.z, 1.6, 0.12);
    return best;
  }

  function onCanvasClick(clientX, clientY) {
    const layer = selectedLayer();
    if (!layer || layerIsEmitter(layer)) return;
    const hit = pickGround(clientX, clientY);
    if (LE_PV.tool === "place") {
      const baseY = String(layer.anchor).toLowerCase() === "eye" ? 1.62 : 0.08;
      layer.offset_right = hit.x;
      layer.offset_forward = hit.z;
      layer.offset_up = 0.08;
      layer.anchor = "feet";
      setStatus(`Placed ${layer.name} at ${hit.x.toFixed(1)}, ${hit.z.toFixed(1)}`);
      renderInspector();
      replay();
      return;
    }
    if (LE_PV.tool === "draw") {
      layer.shape = "custom";
      const origin = layerOrigin(layer);
      const local = vec(hit.x - origin.x, hit.y + 0.08 - origin.y, hit.z - origin.z);
      if (layer.points.length >= 3) {
        const first = layer.points[0];
        if (Math.hypot(local.x - first.x, local.z - first.z) < 0.35) {
          layer.closed = true;
          setStatus("Closed the shape.");
          renderInspector();
          replay();
          return;
        }
      }
      layer.closed = false;
      layer.points.push(local);
      setStatus(`Point ${layer.points.length} added`);
      renderInspector();
      replay();
    }
  }

  function setTool(tool) {
    LE_PV.tool = tool;
    document.querySelectorAll("[data-pv-tool]").forEach((btn) => {
      btn.classList.toggle("on", btn.getAttribute("data-pv-tool") === tool);
    });
    const canvas = $("le_pv_canvas");
    if (canvas) canvas.style.cursor = tool === "orbit" ? "grab" : "crosshair";
    const help = $("le_pv_hud_help");
    if (help) {
      help.textContent = tool === "place"
        ? "Click to place · drag still orbits · RMB pan"
        : tool === "draw"
          ? "Click to add points · drag orbits · Del removes last"
          : "LMB orbit · RMB pan · wheel zoom";
    }
    setStatus(tool === "place" ? "Click (no drag) to place. Drag still orbits the camera." : tool === "draw" ? "Click to add points. Delete removes the last point." : "LMB orbit · RMB pan · wheel zoom");
  }

  function setStatus(text) {
    const el = $("le_pv_status");
    if (el) el.textContent = text || "";
  }

  function shapeNeeds(shape) {
    const s = String(shape || "point").toLowerCase();
    return {
      radius: /circle|disc|square|sphere|spin|radius|helix|spiral|pillar|column|cone|box|ring|rune|shard|shock|arc|concentric|burst|curve/.test(s),
      samples: /^(circle|circle_2d|square|sphere|pillar|column|custom|path|cone)$/.test(s),
      line: s.startsWith("line_") || s === "cone",
      pillar: /helix|spiral|pillar|column/.test(s),
      custom: s === "custom" || s === "path" || s === "points",
    };
  }

  function hasAnyName(s, names) {
    return names.indexOf(s) >= 0;
  }

  function toolkitShapeFields(shape) {
    const s = String(shape || "sphere").toLowerCase();
    const f = {
      radius: true,
      height: false,
      length: false,
      turns: false,
      segments: false,
      gap: false,
      tube: false,
      rings: false,
      petals: false,
      arms: false,
      sides: false,
      mark: false,
      spread: false,
    };
    if (s === "point" || s === "custom" || s === "path" || s === "points") f.radius = false;
    if (s === "line_forward" || s === "line" || s === "beam") {
      f.radius = false;
      f.length = true;
    }
    if (s === "line_up") {
      f.radius = false;
      f.length = true;
    }
    if (s === "zigzag") f.length = true;
    if (hasAnyName(s, [
      "helix", "spiral", "spiral_up", "double_helix", "tornado", "pillar", "column", "cylinder",
      "cone", "fountain", "arch", "arc", "ribbon", "slash_arc", "curve", "bezier", "box",
      "cube_edges", "pyramid", "cross", "wall", "hourglass", "octahedron", "tetrahedron",
      "lightning_bolt", "sky_beam", "meteor_path", "breath", "fork", "chevron", "trefoil",
      "disc_vertical",
    ])) f.height = true;
    if (hasAnyName(s, ["helix", "spiral", "spiral_up", "double_helix", "tornado", "spiral_flat", "galaxy"])) f.turns = true;
    if (s === "segmented_ring" || s === "segmented") {
      f.segments = true;
      f.gap = true;
    }
    if (s === "spokes") f.segments = true;
    if (s === "torus") f.tube = true;
    if (hasAnyName(s, ["concentric", "concentric_rings", "ripple", "pillar", "column", "pyramid"])) f.rings = true;
    if (s === "flower" || s === "rune" || s === "rune_circle") f.petals = true;
    if (s === "rune" || s === "rune_circle") f.mark = true;
    if (s === "galaxy") f.arms = true;
    if (s === "polygon") f.sides = true;
    if (s === "arc" || s === "ribbon" || s === "slash_arc") f.spread = true;
    return f;
  }

  function toolkitMotionFields(motion) {
    const m = String(motion || "orbit").toLowerCase();
    if (isSpriteSpinMotion(m)) {
      return { degrees: true, axis: false, speed: false, gravity: false, wave: false, drag: false, collision: false };
    }
    if (m === "follow") {
      return { degrees: false, axis: false, speed: false, gravity: false, wave: false, drag: false, collision: false };
    }
    const burst = m === "burst" || m === "scatter";
    const degrees = /^(orbit|reverse_orbit|spin_out|spin_in|expand|contract|implosion|wave|wobble|swirl|helix_spin|tornado|corkscrew)$/.test(m);
    const axis = degrees || m === "whip";
    const speed = burst || /^(rise|fall|rain|fountain|expand|shockwave|spin_out|contract|spin_in|attract|implosion|suction|flatten|stretch|drift|dash|whip|swirl|helix_spin|tornado|lightning_strike|slam|meteor|chain_fall|corkscrew)$/.test(m);
    const wave = /^(wave|pulse|wobble|oscillate|flutter|shake|hover|bounce|lightning_strike)$/.test(m);
    return { degrees, axis, speed, gravity: burst, wave, drag: burst, collision: burst };
  }

  function fieldCell(id, label, value, extra) {
    return `<div><label>${label}</label><input id="${id}" type="number" ${extra || 'step="0.05"'} value="${value}" /></div>`;
  }

  function fieldRow(a, b) {
    const cells = [a, b].filter(Boolean);
    if (!cells.length) return "";
    if (cells.length === 1) cells.push("<div></div>");
    return `<div class="row">${cells.join("")}</div>`;
  }

  function optionsHtml(pairs, selected) {
    if (typeof selectOptionsHtml === "function") return selectOptionsHtml(pairs, selected);
    return pairs.map(([v, l]) => `<option value="${v}"${v === selected ? " selected" : ""}>${l}</option>`).join("");
  }

  function groupedOptionsHtml(groups, selected) {
    return groups.map(([label, pairs]) => `<optgroup label="${esc(label)}">${optionsHtml(pairs, selected)}</optgroup>`).join("");
  }

  function renderLayerList() {
    const host = $("le_pv_layer_list");
    if (!host) return;
    host.innerHTML = LE_PV.doc.layers
      .map((layer, i) => {
        const on = i === LE_PV.selected ? " on" : "";
        const kind = layerIsEmitter(layer) ? "emitter" : "shape";
        return `<div class="le-layer-row${on}">
          <input type="checkbox" data-pv-en="${i}" ${layer.enabled ? "checked" : ""} title="Enable" />
          <button type="button" class="le-layer-btn${on}" data-pv-layer="${i}">${esc(layer.name)} · ${esc(kind)} · ${esc(layer.shape)}</button>
        </div>`;
      })
      .join("");
    host.querySelectorAll("[data-pv-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        LE_PV.selected = Number(btn.getAttribute("data-pv-layer"));
        renderInspector();
        paint();
      });
    });
    host.querySelectorAll("[data-pv-en]").forEach((box) => {
      box.addEventListener("click", (ev) => ev.stopPropagation());
      box.addEventListener("change", () => {
        const i = Number(box.getAttribute("data-pv-en"));
        if (LE_PV.doc.layers[i]) LE_PV.doc.layers[i].enabled = !!box.checked;
        replay();
      });
    });
  }

  function esc(s) {
    return typeof attrEsc === "function" ? attrEsc(s) : String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function qsIcon(name) {
    const icons = {
      sphere: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
      rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 17h9a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.3-1.5A4 4 0 0 0 8 17z"/><path d="M8 19v2M12 19v3M16 19v2"/></svg>',
      ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="12" rx="8" ry="3.5"/><path d="M4 12v3c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-3"/></svg>',
      gravitate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8V4h4M18 8V4h-4M6 16v4h4M18 16v4h-4"/><path d="M8 8l4 4 4-4M8 16l4-4 4 4"/></svg>',
      burst: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="6"/><path d="M12 3v3M10 4l.6 2.2M14 4l-.6 2.2M9 13h6"/></svg>',
      steady: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/></svg>',
      none: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M6 6l12 12"/></svg>',
      solid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 21V12M4 7.5L12 12l8-4.5"/></svg>',
      smoke: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 16h11a3.5 3.5 0 0 0 0-7 4.5 4.5 0 0 0-8.6-1.6A3.5 3.5 0 0 0 6 16z"/></svg>',
      ball: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.6 3.8 5.2 3.8 8S14.5 17.4 12 20M12 4c-2.5 2.6-3.8 5.2-3.8 8S9.5 17.4 12 20"/></svg>',
      paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h9l4 4v12H6z"/><path d="M15 4v4h4"/></svg>',
    };
    return icons[name] || "";
  }

  function qsOpt(id, label, selected, group) {
    return `<button type="button" class="le-qs-opt${selected ? " on" : ""}" data-qs-group="${group}" data-qs-id="${id}">${qsIcon(id)}${esc(label)}</button>`;
  }

  function qsSpriteOpt(id, label, selected) {
    return `<button type="button" class="le-qs-opt${selected ? " on" : ""}" data-qs-group="sprite" data-qs-id="${id}"><img src="./particle/snowstorm/${id}.png" alt="" />${esc(label)}</button>`;
  }

  function applyQuickSetup(group, id) {
    const layer = selectedLayer();
    if (!layer) return;
    layer.emitter = true;
    if (group === "shape") {
      layer.qs_shape = id;
      layer.anchor = "feet";
      if (id === "sphere") {
        Object.assign(layer, { shape: "sphere", shape_radius: 1, surface_only: false, direction: "outwards", offset_right: 0, offset_up: 0, offset_forward: 0, accel_x: 0, accel_y: layer.qs_physics && layer.qs_physics !== "none" ? layer.accel_y : 0, accel_z: 0, speed: 3, name: "Sphere" });
      } else if (id === "rain") {
        Object.assign(layer, { shape: "disc", shape_radius: 6, surface_only: false, direction: "custom", dir_x: 0, dir_y: -1, dir_z: 0, offset_right: 0, offset_up: 6, offset_forward: 0, accel_x: 0, accel_y: -6, accel_z: 0, speed: 5, name: "Rain" });
      } else if (id === "ring") {
        Object.assign(layer, { shape: "disc", shape_radius: 3, surface_only: true, direction: "up", offset_right: 0, offset_up: 0.5, offset_forward: 0, accel_x: 0, accel_y: layer.qs_physics && layer.qs_physics !== "none" ? layer.accel_y : 0, accel_z: 0, speed: 2.5, name: "Ring" });
      } else if (id === "gravitate") {
        Object.assign(layer, { shape: "sphere", shape_radius: 2, surface_only: true, direction: "inwards", offset_right: 0, offset_up: 0, offset_forward: 0, accel_x: 0, accel_y: layer.qs_physics && layer.qs_physics !== "none" ? layer.accel_y : 0, accel_z: 0, speed: 2, particle_lifetime_ticks: 20, name: "Gravitate" });
      }
    } else if (group === "timing") {
      layer.qs_timing = id;
      if (id === "burst") {
        Object.assign(layer, { rate_mode: "instant", amount: 100, lifetime_mode: "once", active_time: 1, loop: false });
      } else {
        Object.assign(layer, { rate_mode: "steady", emit_rate: 60, maximum: 400, lifetime_mode: "looping", active_time: 1, loop: true, loop_until: "skill" });
      }
    } else if (group === "physics") {
      layer.qs_physics = id;
      layer.flutter = false;
      if (id === "none") {
        Object.assign(layer, { collision: false, drag: 0, bounce: 0, expire_on_contact: false });
      } else if (id === "solid") {
        Object.assign(layer, { collision: true, accel_y: -10, drag: 0.1, bounce: 0.3, expire_on_contact: false });
      } else if (id === "smoke") {
        Object.assign(layer, { collision: true, accel_y: 1, drag: 4, bounce: 0, expire_on_contact: false });
      } else if (id === "ball") {
        Object.assign(layer, { collision: true, accel_y: -10, drag: 0.2, bounce: 0.6, expire_on_contact: false });
      } else if (id === "paper") {
        Object.assign(layer, { collision: true, accel_y: -10, drag: 5, bounce: 0, expire_on_contact: false, flutter: true });
      }
    } else if (group === "sprite") {
      layer.sprite = id;
      layer.tex_id = "snowstorm:" + id;
      layer.tex_path = "textures/particle/" + id;
      layer.type = QS_SPRITE_TYPE[id] || layer.type;
      const look = QS_SPRITE_LOOK[id];
      if (look) {
        layer.size = look.size;
        layer.size_end = look.size_end;
        layer.size_y = look.size;
      }
      const uv = QS_SPRITE_UV[id];
      if (uv) Object.assign(layer, uv);
    }
    if (!layer.qs_timing) {
      layer.qs_timing = "burst";
      layer.rate_mode = "instant";
      layer.amount = Math.max(layer.amount || 16, 24);
    }
    if (!layer.sprite) {
      layer.sprite = "sparkle";
      layer.tex_id = "snowstorm:sparkle";
      layer.tex_path = "textures/particle/sparkle";
      layer.type = QS_SPRITE_TYPE.sparkle;
      const look = QS_SPRITE_LOOK.sparkle;
      layer.size = look.size;
      layer.size_end = look.size_end;
      layer.size_y = look.size;
      Object.assign(layer, QS_SPRITE_UV.sparkle);
    }
    renderInspector();
    replay();
  }

  function applyQuickSliders() {
    const layer = selectedLayer();
    const host = $("le_pv_fields");
    if (!layer || !host) return;
    layer.emitter = true;
    const speed = num(host.querySelector(".le-qs-speed")?.value, layer.speed);
    const amount = num(host.querySelector(".le-qs-amount")?.value, layer.amount);
    const life = num(host.querySelector(".le-qs-life")?.value, 2);
    layer.speed = speed;
    layer.particle_lifetime_ticks = Math.max(2, Math.round(life * 20));
    if (String(layer.rate_mode) === "steady") layer.emit_rate = amount;
    else layer.amount = Math.max(1, Math.round(amount));
    layer.random_rotation = !!host.querySelector(".le-qs-spin")?.checked;
    layer.additive = !!host.querySelector(".le-qs-glow")?.checked;
    layer.material = layer.additive ? "particles_add" : "particles_blend";
    layer.lighting = !layer.additive;
    const speedLab = host.querySelector(".le-qs-speed-val");
    const amtLab = host.querySelector(".le-qs-amount-val");
    const lifeLab = host.querySelector(".le-qs-life-val");
    if (speedLab) speedLab.textContent = String(speed);
    if (amtLab) amtLab.textContent = String(Math.round(amount));
    if (lifeLab) lifeLab.textContent = String(life);
  }

  function quickSetupHtml(layer) {
    const timingAmt = String(layer.rate_mode) === "steady" ? num(layer.emit_rate, 60) : num(layer.amount, 16);
    const lifeSec = Math.max(0.1, num(layer.particle_lifetime_ticks, 40) / 20);
    const speed = usesPhysEmitter(layer) ? num(layer.speed, 3) : 3;
    return `
      <div class="le-pv-qs">
        <p class="hint" style="margin:0 0 0.35rem">Shape, timing, and physics from Snowstorm. Click a preset, then fine-tune in the other tabs.</p>
        <div class="hint" style="margin:0.1rem 0 0.15rem;letter-spacing:0.06em;text-transform:uppercase;font-size:0.68rem">Shape &amp; Motion</div>
        <div class="le-qs-list">
          ${qsOpt("sphere", "Sphere", layer.qs_shape === "sphere", "shape")}
          ${qsOpt("rain", "Rain", layer.qs_shape === "rain", "shape")}
          ${qsOpt("ring", "Ring", layer.qs_shape === "ring", "shape")}
          ${qsOpt("gravitate", "Gravitate to Center", layer.qs_shape === "gravitate", "shape")}
        </div>
        <div class="le-qs-bar"><label>Speed</label><input class="le-qs-speed" type="range" min="0" max="10" step="0.5" value="${speed}" /><span class="le-qs-val le-qs-speed-val">${speed}</span></div>
        <div class="hint" style="margin:0.45rem 0 0.15rem;letter-spacing:0.06em;text-transform:uppercase;font-size:0.68rem">Timing</div>
        <div class="le-qs-list">
          ${qsOpt("burst", "Burst", layer.qs_timing === "burst" || (layer.emitter && layer.rate_mode !== "steady"), "timing")}
          ${qsOpt("steady", "Steady", layer.qs_timing === "steady" || (layer.emitter && layer.rate_mode === "steady"), "timing")}
        </div>
        <div class="le-qs-bar"><label>Amount</label><input class="le-qs-amount" type="range" min="1" max="200" step="1" value="${timingAmt}" /><span class="le-qs-val le-qs-amount-val">${Math.round(timingAmt)}</span></div>
        <div class="le-qs-bar"><label>Particle Lifetime</label><input class="le-qs-life" type="range" min="0.2" max="4" step="0.1" value="${lifeSec}" /><span class="le-qs-val le-qs-life-val">${lifeSec}</span></div>
        <div class="hint" style="margin:0.45rem 0 0.15rem;letter-spacing:0.06em;text-transform:uppercase;font-size:0.68rem">Physics</div>
        <div class="le-qs-list">
          ${qsOpt("none", "None", (layer.qs_physics || "none") === "none", "physics")}
          ${qsOpt("solid", "Solid", layer.qs_physics === "solid", "physics")}
          ${qsOpt("smoke", "Smoke", layer.qs_physics === "smoke", "physics")}
          ${qsOpt("ball", "Ball", layer.qs_physics === "ball", "physics")}
          ${qsOpt("paper", "Paper", layer.qs_physics === "paper", "physics")}
        </div>
        <div class="hint" style="margin:0.45rem 0 0.15rem;letter-spacing:0.06em;text-transform:uppercase;font-size:0.68rem">Sprite</div>
        <div class="le-qs-list">
          ${QS_SPRITES.map(([id, label]) => qsSpriteOpt(id, label, layer.sprite === id)).join("")}
        </div>
        <p class="hint" style="margin:0.2rem 0 0.15rem">Sprites are Snowstorm’s free Quick Setup set (CC0).</p>
        <div class="le-qs-checks">
          <label class="inline-check"><input class="le-qs-spin" type="checkbox"${layer.random_rotation ? " checked" : ""} /> Random rotation</label>
          <label class="inline-check"><input class="le-qs-glow" type="checkbox"${layer.additive !== false && String(layer.material || "particles_add") !== "particles_blend" ? " checked" : ""} /> Glow in the dark</label>
        </div>
      </div>`;
  }

  function gradientBarCss(stops) {
    const s = (stops || []).slice().sort((a, b) => a.t - b.t);
    if (!s.length) return "#fff";
    return s.map((st) => `${st.hex} ${Math.round(st.t * 100)}%`).join(", ");
  }

  function colorPickerHtml(hex) {
    const rgb = hexToRgb(hex);
    const hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    const hueRgb = hsvToRgb(hsv.h, 1, 1);
    return `
      <div class="le-pv-sv" style="--hue:${rgbToHex(hueRgb[0], hueRgb[1], hueRgb[2])}">
        <div class="le-pv-sv-knob" style="left:${(hsv.s * 100).toFixed(1)}%;top:${((1 - hsv.v) * 100).toFixed(1)}%"></div>
      </div>
      <input class="le-pv-hue" type="range" min="0" max="360" step="1" value="${hsv.h.toFixed(0)}" />
      <div class="le-pv-hexrow">
        <input class="le-pv-native" type="color" value="${hex}" />
        <input class="le-pv-hex mono" type="text" value="${hex}" maxlength="7" />
      </div>`;
  }

  function colorSectionHtml(layer) {
    const mode = layer.color_mode || "static";
    const hex = currentColorHex(layer);
    const g = layerGradient(layer);
    const sel = Math.max(0, Math.min(g.length - 1, layer._colorStop || 0));
    const stops = g.map((st, i) => `<button type="button" class="le-pv-gstop${i === sel ? " on" : ""}" data-gstop="${i}" style="left:${(st.t * 100).toFixed(1)}%;background:${st.hex}"></button>`).join("");
    return `
      <details class="le-pv-sec le-pv-color" open>
        <summary>Color</summary>
        <label>color mode</label>
        <select class="le-pv-colormode mono">${optionsHtml([["static", "Static"], ["gradient", "Gradient"]], mode)}</select>
        ${mode === "gradient" ? `
          <label>interpolant</label>
          <select class="le-pv-interp mono">${optionsHtml([
            ["v.particle_age / v.particle_lifetime", "v.particle_age / v.particle_lifetime"],
            ["v.particle_random_1", "v.particle_random_1"],
            ["v.particle_age", "v.particle_age"],
          ], layer.gradient_interpolant || "v.particle_age / v.particle_lifetime")}</select>
          <div class="row">
            <div><label>range</label><input class="le-pv-grange" type="number" min="0.05" step="0.05" value="${num(layer.gradient_range, 1)}" /></div>
            <div class="step-actions" style="align-self:end">
              <button type="button" class="ghost mini" id="le_pv_gadd">+</button>
              <button type="button" class="ghost mini" id="le_pv_gdel">×</button>
            </div>
          </div>
          <label>gradient</label>
          <div class="le-pv-gbar" style="background:linear-gradient(to right, ${gradientBarCss(g)})">${stops}</div>
        ` : ""}
        ${colorPickerHtml(hex)}
      </details>`;
  }

  function syncColorPicker(host, hex) {
    const rgb = hexToRgb(hex);
    const hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    const hueRgb = hsvToRgb(hsv.h, 1, 1);
    const sv = host.querySelector(".le-pv-sv");
    const knob = host.querySelector(".le-pv-sv-knob");
    const hue = host.querySelector(".le-pv-hue");
    const native = host.querySelector(".le-pv-native");
    const hexEl = host.querySelector(".le-pv-hex");
    if (sv) sv.style.setProperty("--hue", rgbToHex(hueRgb[0], hueRgb[1], hueRgb[2]));
    if (knob) {
      knob.style.left = (hsv.s * 100).toFixed(1) + "%";
      knob.style.top = ((1 - hsv.v) * 100).toFixed(1) + "%";
    }
    if (hue && document.activeElement !== hue) hue.value = String(Math.round(hsv.h));
    if (native) native.value = hex;
    if (hexEl && document.activeElement !== hexEl) hexEl.value = hex;
  }

  function bindAppearanceColor(host, layer) {
    const applyHex = (hex, replayNow) => {
      setCurrentColorHex(layer, hex);
      syncColorPicker(host, currentColorHex(layer));
      const gbar = host.querySelector(".le-pv-gbar");
      if (gbar) {
        gbar.style.background = `linear-gradient(to right, ${gradientBarCss(layerGradient(layer))})`;
        gbar.querySelectorAll(".le-pv-gstop").forEach((btn, i) => {
          const st = layerGradient(layer)[i];
          if (st) {
            btn.style.left = (st.t * 100).toFixed(1) + "%";
            btn.style.background = st.hex;
          }
        });
      }
      if (replayNow) replay();
      else scheduleReplay();
      noteVfx();
    };
    const sv = host.querySelector(".le-pv-sv");
    const pickSv = (ev) => {
      const rect = sv.getBoundingClientRect();
      const s = clamp01((ev.clientX - rect.left) / Math.max(1, rect.width));
      const v = clamp01(1 - (ev.clientY - rect.top) / Math.max(1, rect.height));
      const cur = rgbToHsv(...hexToRgb(currentColorHex(layer)));
      applyHex(rgbToHex(...hsvToRgb(cur.h, s, v)));
    };
    if (sv) {
      sv.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        pickSv(ev);
        const move = (e) => pickSv(e);
        const up = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
          replay();
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      });
    }
    host.querySelector(".le-pv-hue")?.addEventListener("input", (ev) => {
      const cur = rgbToHsv(...hexToRgb(currentColorHex(layer)));
      applyHex(rgbToHex(...hsvToRgb(Number(ev.target.value), cur.s, cur.v)));
    });
    host.querySelector(".le-pv-native")?.addEventListener("input", (ev) => applyHex(ev.target.value));
    host.querySelector(".le-pv-hex")?.addEventListener("change", (ev) => applyHex(ev.target.value, true));
    host.querySelector(".le-pv-colormode")?.addEventListener("change", () => {
      layer.color_mode = host.querySelector(".le-pv-colormode").value || "static";
      if (layer.color_mode === "gradient") {
        layerGradient(layer);
        if (!layer.gradient_interpolant) layer.gradient_interpolant = "v.particle_age / v.particle_lifetime";
        if (!layer.gradient_range) layer.gradient_range = 1;
      }
      renderInspector();
      replay();
    });
    host.querySelector(".le-pv-interp")?.addEventListener("change", () => {
      layer.gradient_interpolant = host.querySelector(".le-pv-interp").value;
      replay();
    });
    host.querySelector(".le-pv-grange")?.addEventListener("input", () => {
      layer.gradient_range = Math.max(0.05, num(host.querySelector(".le-pv-grange").value, 1));
      scheduleReplay();
    });
    host.querySelector("#le_pv_gadd")?.addEventListener("click", () => {
      const g = layerGradient(layer);
      g.push({ t: 0.5, hex: currentColorHex(layer) });
      g.sort((a, b) => a.t - b.t);
      layer._colorStop = g.length - 1;
      renderInspector();
      replay();
    });
    host.querySelector("#le_pv_gdel")?.addEventListener("click", () => {
      const g = layerGradient(layer);
      if (g.length <= 2) return;
      g.splice(Math.max(0, layer._colorStop || 0), 1);
      layer._colorStop = Math.max(0, g.length - 1);
      renderInspector();
      replay();
    });
    host.querySelectorAll(".le-pv-gstop").forEach((btn) => {
      btn.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        layer._colorStop = Number(btn.getAttribute("data-gstop")) || 0;
        host.querySelectorAll(".le-pv-gstop").forEach((b) => b.classList.toggle("on", b === btn));
        syncColorPicker(host, currentColorHex(layer));
        const bar = host.querySelector(".le-pv-gbar");
        const move = (e) => {
          if (!bar) return;
          const rect = bar.getBoundingClientRect();
          const t = clamp01((e.clientX - rect.left) / Math.max(1, rect.width));
          const g = layerGradient(layer);
          const i = layer._colorStop || 0;
          if (g[i]) g[i].t = t;
          btn.style.left = (t * 100).toFixed(1) + "%";
          bar.style.background = `linear-gradient(to right, ${gradientBarCss(g)})`;
          scheduleReplay();
        };
        const up = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
          replay();
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      });
    });
  }

  function bindQuickSetup(host) {
    host.querySelectorAll("[data-qs-group]").forEach((btn) => {
      btn.addEventListener("click", () => applyQuickSetup(btn.getAttribute("data-qs-group"), btn.getAttribute("data-qs-id")));
    });
    host.querySelectorAll(".le-qs-speed, .le-qs-amount, .le-qs-life, .le-qs-spin, .le-qs-glow").forEach((el) => {
      el.addEventListener("input", () => {
        applyQuickSliders();
        scheduleReplay();
      });
      el.addEventListener("change", () => {
        applyQuickSliders();
        replay();
      });
    });
  }

  function layerUv(layer) {
    return {
      uv_mode: layer.uv_mode || "animated",
      tex_w: layer.tex_w,
      tex_h: layer.tex_h,
      uv_x: layer.uv_x,
      uv_y: layer.uv_y,
      uv_w: layer.uv_w,
      uv_h: layer.uv_h,
      uv_step_x: layer.uv_step_x,
      uv_step_y: layer.uv_step_y,
      uv_max: layer.uv_max,
    };
  }

  function layerSheetId(layer) {
    return layer.tex_id || (layer.sprite ? "snowstorm:" + layer.sprite : "");
  }

  function framesForLayer(layer, type) {
    const sprites = window.leParticleSprites;
    if (!sprites) return null;
    const uv = layerUv(layer);
    const sheetId = layerSheetId(layer);
    const sheet = sprites.getSheet(sheetId);
    if (sheet && isCustomSheet(layer)) {
      uv.tex_w = sheet.width;
      uv.tex_h = sheet.height;
      layer.tex_w = sheet.width;
      layer.tex_h = sheet.height;
    }
    const key = sheetId + "|" + uv.uv_mode + "|" + uv.tex_w + "|" + uv.tex_h + "|" + uv.uv_x + "|" + uv.uv_y + "|" + uv.uv_w + "|" + uv.uv_h + "|" + uv.uv_step_x + "|" + uv.uv_step_y + "|" + uv.uv_max + "|" + (layer.uv_dir || "");
    if (layer._frameKey === key && layer._frames) return layer._frames;
    const frames = sheet && sprites.framesFromUv ? sprites.framesFromUv(sheet, uv) : sprites.getFrames(type || (layer.sprite ? "snowstorm:" + layer.sprite : layer.type));
    layer._frameKey = key;
    layer._frames = frames;
    return frames;
  }

  function sheetDirOf(layer) {
    const sx = num(layer.uv_step_x, 0);
    const sy = num(layer.uv_step_y, 0);
    if (layer.uv_dir === "left_right" || layer.uv_dir === "top_down" || layer.uv_dir === "grid") return layer.uv_dir;
    if (sx > 0 && sy > 0) return "grid";
    if (sx > 0) return "left_right";
    return "top_down";
  }

  function sheetCellCount(span, start, cell) {
    const step = Math.max(1, num(cell, 1));
    const remain = Math.max(0, num(span, 0) - num(start, 0));
    return Math.max(1, Math.ceil(remain / step - 1e-9));
  }

  function applySheetDir(layer, dir, frameW, frameH) {
    const w = Math.max(1, num(layer.tex_w, 16));
    const h = Math.max(1, num(layer.tex_h, 16));
    const fw = Math.max(1, num(frameW, layer.uv_w || 16));
    const fh = Math.max(1, num(frameH, layer.uv_h || 16));
    layer.uv_dir = dir;
    layer.uv_mode = "animated";
    layer.uv_x = 0;
    layer.uv_y = 0;
    layer.uv_w = fw;
    layer.uv_h = fh;
    if (dir === "top_down") {
      layer.uv_step_x = 0;
      layer.uv_step_y = fh;
      layer.uv_max = sheetCellCount(h, 0, fh);
    } else if (dir === "grid") {
      layer.uv_step_x = fw;
      layer.uv_step_y = fh;
      layer.uv_max = sheetCellCount(w, 0, fw) * sheetCellCount(h, 0, fh);
    } else {
      layer.uv_dir = "left_right";
      layer.uv_step_x = fw;
      layer.uv_step_y = 0;
      layer.uv_max = sheetCellCount(w, 0, fw);
    }
    layer._frames = null;
    layer._frameKey = "";
  }

  function autoUvFromImage(layer, img) {
    if (!img) return;
    layer.tex_w = img.width;
    layer.tex_h = img.height;
    if (img.width >= img.height * 1.6) {
      applySheetDir(layer, "left_right", img.height, img.height);
      layer.uv_fps = Math.max(8, num(layer.uv_fps, 12));
      layer.uv_loop = true;
    } else if (img.height >= img.width * 1.6) {
      applySheetDir(layer, "top_down", img.width, img.width);
      layer.uv_fps = Math.max(8, num(layer.uv_fps, 12));
      layer.uv_loop = true;
    } else {
      layer.uv_mode = "full";
      layer.uv_dir = "left_right";
      layer.uv_w = img.width;
      layer.uv_h = img.height;
      layer.uv_max = 1;
      layer.uv_step_x = img.width;
      layer.uv_step_y = 0;
    }
  }

  function textureTabHtml(layer) {
    const mode = layer.uv_mode || "animated";
    const anim = mode === "animated";
    const mapped = mode !== "full";
    const builtins = (window.leParticleSprites && window.leParticleSprites.snowstormKeys ? window.leParticleSprites.snowstormKeys() : ["sparkle", "smoke", "magic", "spark", "dust", "ball", "leaves", "dirt"]);
    return `
      <h3>Texture &amp; UV</h3>
      <label>texture</label>
      <input class="le-pv-texpath mono" type="text" value="${esc(layer.tex_path || layer.tex_id || "")}" placeholder="textures/particle/sparkle" />
      <div class="le-pv-sheet-wrap"><canvas class="le-pv-sheet" width="256" height="160"></canvas></div>
      <p class="hint" id="le_pv_texmeta" style="margin:0.3rem 0">No texture loaded</p>
      <div class="le-pv-texbar">
        <button type="button" class="ghost mini" id="le_pv_choose_strip">Choose file…</button>
        <button type="button" class="ghost mini" id="le_pv_browse_tex">Browse folder…</button>
        <button type="button" class="ghost mini" id="le_pv_browse_jar">Minecraft jar…</button>
      </div>
      <label>built-in sprites</label>
      <div class="le-qs-list le-pv-style-list">
        ${builtins.map((id) => qsSpriteOpt(id, id[0].toUpperCase() + id.slice(1), layer.sprite === id || layer.tex_id === "snowstorm:" + id)).join("")}
      </div>
      <label>UV mode</label>
      <select class="le-pv-uvmode mono">${optionsHtml([["full", "Full Size"], ["static", "Static"], ["animated", "Animated"]], mode)}</select>
      <div class="row${mapped ? "" : " hidden"}">
        <div><label>texture size X</label><input class="le-pv-texw" type="number" min="1" step="1" value="${layer.tex_w || 16}" /></div>
        <div><label>texture size Y</label><input class="le-pv-texh" type="number" min="1" step="1" value="${layer.tex_h || 16}" /></div>
      </div>
      <div class="row${mapped ? "" : " hidden"}">
        <div><label>UV start X</label><input class="le-pv-uvx" type="number" step="1" value="${layer.uv_x || 0}" /></div>
        <div><label>UV start Y</label><input class="le-pv-uvy" type="number" step="1" value="${layer.uv_y || 0}" /></div>
      </div>
      <div class="row${mapped ? "" : " hidden"}">
        <div><label>UV size X</label><input class="le-pv-uvw" type="number" min="1" step="1" value="${layer.uv_w || 16}" /></div>
        <div><label>UV size Y</label><input class="le-pv-uvh" type="number" min="1" step="1" value="${layer.uv_h || 16}" /></div>
      </div>
      <div class="row${anim ? "" : " hidden"}">
        <div><label>UV step X</label><input class="le-pv-uvsx" type="number" step="1" value="${layer.uv_step_x || 0}" /></div>
        <div><label>UV step Y</label><input class="le-pv-uvsy" type="number" step="1" value="${layer.uv_step_y || 16}" /></div>
      </div>
      <div class="row${anim ? "" : " hidden"}">
        <div><label>FPS</label><input class="le-pv-uvfps" type="number" min="0" step="1" value="${layer.uv_fps || 10}" /></div>
        <div><label>max frame</label><input class="le-pv-uvmax" type="number" min="1" step="1" value="${layer.uv_max || 1}" /></div>
      </div>
      <label class="inline-check${anim ? "" : " hidden"}"><input class="le-pv-uvstretch" type="checkbox"${layer.uv_stretch ? " checked" : ""} /> Stretch to lifetime</label>
      <label class="inline-check${anim ? "" : " hidden"}"><input class="le-pv-uvloop" type="checkbox"${layer.uv_loop !== false ? " checked" : ""} /> Loop</label>`;
  }

  function sheetPlayIndex(layer) {
    const n = Math.max(1, Math.trunc(num(layer && layer.uv_max, 1)));
    if (!layer || (layer.uv_mode || "animated") !== "animated" || n <= 1) return 0;
    const fps = Math.max(1, num(layer.uv_fps, 10));
    let idx = Math.floor(currentTick() * (fps / 20));
    if (layer.uv_loop === false) return Math.min(n - 1, idx);
    return ((idx % n) + n) % n;
  }

  function sheetView(canvas, layer) {
    if (!canvas) return null;
    const sprites = window.leParticleSprites;
    const img = sprites ? sprites.getSheet(layerSheetId(layer)) : null;
    const wrap = canvas.parentElement && canvas.parentElement.classList.contains("le-pv-sheet-wrap")
      ? canvas.parentElement : canvas;
    const availW = Math.max(180, Math.floor(wrap.clientWidth || canvas.clientWidth || 256));
    const pad = 8;
    if (!img || !img.width) {
      if (canvas.width !== availW) canvas.width = availW;
      if (canvas.height !== 140) canvas.height = 140;
      return { canvas, img: null, ox: pad, oy: pad, dw: 0, dh: 0, scale: 1, texW: 1, texH: 1 };
    }
    const texW = Math.max(1, num(layer.tex_w, img.width));
    const texH = Math.max(1, num(layer.tex_h, img.height));
    let scale = 128 / Math.max(1, img.height);
    if (img.width <= img.height * 1.25) scale = (availW - pad * 2) / Math.max(1, img.width);
    scale = Math.max(0.5, Math.min(12, scale));
    const dw = img.width * scale;
    const dh = img.height * scale;
    const cw = Math.max(availW, Math.ceil(dw + pad * 2));
    const ch = Math.max(120, Math.ceil(dh + pad * 2));
    if (Math.abs(canvas.width - cw) > 1) canvas.width = cw;
    if (Math.abs(canvas.height - ch) > 1) canvas.height = ch;
    const ox = dw + pad * 2 < canvas.width ? (canvas.width - dw) / 2 : pad;
    const oy = (canvas.height - dh) / 2;
    return { canvas, img, ox, oy, dw, dh, scale, texW, texH };
  }

  function pointerOnCanvas(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width ? canvas.width / rect.width : 1;
    const sy = rect.height ? canvas.height / rect.height : 1;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  function canvasToTex(view, x, y) {
    return {
      u: view.texW * (x - view.ox) / Math.max(1e-6, view.dw),
      v: view.texH * (y - view.oy) / Math.max(1e-6, view.dh),
    };
  }

  function firstFrameCanvasRect(view, layer) {
    return {
      x: view.ox + (num(layer.uv_x, 0) / view.texW) * view.dw,
      y: view.oy + (num(layer.uv_y, 0) / view.texH) * view.dh,
      w: (num(layer.uv_w, 16) / view.texW) * view.dw,
      h: (num(layer.uv_h, 16) / view.texH) * view.dh,
    };
  }

  function sheetHandles(r) {
    return [
      ["nw", r.x, r.y],
      ["n", r.x + r.w * 0.5, r.y],
      ["ne", r.x + r.w, r.y],
      ["e", r.x + r.w, r.y + r.h * 0.5],
      ["se", r.x + r.w, r.y + r.h],
      ["s", r.x + r.w * 0.5, r.y + r.h],
      ["sw", r.x, r.y + r.h],
      ["w", r.x, r.y + r.h * 0.5],
    ];
  }

  function hitSheetHandle(view, layer, x, y) {
    const r = firstFrameCanvasRect(view, layer);
    const hs = sheetHandles(r);
    const hit = Math.max(8, Math.min(14, Math.min(r.w, r.h) * 0.28));
    for (let i = 0; i < hs.length; i++) {
      if (Math.abs(x - hs[i][1]) <= hit && Math.abs(y - hs[i][2]) <= hit) return hs[i][0];
    }
    if (x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h) return "move";
    if (x >= view.ox && y >= view.oy && x <= view.ox + view.dw && y <= view.oy + view.dh) return "draw";
    return "";
  }

  function sheetCursor(handle) {
    if (handle === "n" || handle === "s") return "ns-resize";
    if (handle === "e" || handle === "w") return "ew-resize";
    if (handle === "nw" || handle === "se") return "nwse-resize";
    if (handle === "ne" || handle === "sw") return "nesw-resize";
    if (handle === "move") return "move";
    return "crosshair";
  }

  function applyFrameRect(layer, x, y, w, h, opts) {
    opts = opts || {};
    const texW = Math.max(1, num(layer.tex_w, 16));
    const texH = Math.max(1, num(layer.tex_h, 16));
    let rx = x;
    let ry = y;
    let rw = w;
    let rh = h;
    if (rw < 0) { rx += rw; rw = -rw; }
    if (rh < 0) { ry += rh; rh = -rh; }
    rx = Math.round(rx);
    ry = Math.round(ry);
    rw = Math.round(rw);
    rh = Math.round(rh);
    rx = Math.max(0, Math.min(texW - 1, rx));
    ry = Math.max(0, Math.min(texH - 1, ry));
    rw = Math.max(1, Math.min(texW - rx, rw));
    rh = Math.max(1, Math.min(texH - ry, rh));
    layer.uv_x = rx;
    layer.uv_y = ry;
    layer.uv_w = rw;
    layer.uv_h = rh;
    const covers = rx === 0 && ry === 0 && rw >= texW && rh >= texH;
    if (covers && (layer.uv_mode === "full")) {
      layer.uv_max = 1;
    } else if (layer.uv_mode === "full") {
      layer.uv_mode = "animated";
    }
    if ((layer.uv_mode || "animated") === "static" || layer.uv_mode === "full") {
      layer.uv_step_x = layer.uv_mode === "full" ? rw : 0;
      layer.uv_step_y = 0;
      if (opts.guessCount) layer.uv_max = 1;
    } else {
      const dir = sheetDirOf(layer);
      if (dir === "top_down") {
        layer.uv_step_x = 0;
        layer.uv_step_y = rh;
        if (opts.guessCount) layer.uv_max = sheetCellCount(texH, ry, rh);
      } else if (dir === "grid") {
        layer.uv_step_x = rw;
        layer.uv_step_y = rh;
        if (opts.guessCount) layer.uv_max = sheetCellCount(texW, rx, rw) * sheetCellCount(texH, ry, rh);
      } else {
        layer.uv_step_x = rw;
        layer.uv_step_y = 0;
        if (opts.guessCount) layer.uv_max = sheetCellCount(texW, rx, rw);
      }
    }
    layer._frames = null;
    layer._frameKey = "";
  }

  function syncSheetFields(layer) {
    const host = $("le_pv_fields");
    if (!host) return;
    const set = (sel, val) => {
      const el = host.querySelector(sel);
      if (el && String(el.value) !== String(val)) el.value = val;
    };
    set("#le_pv_uvw, .le-pv-uvw", layer.uv_w);
    set("#le_pv_uvh, .le-pv-uvh", layer.uv_h);
    const maxEl = host.querySelector("#le_pv_uvmax, .le-pv-uvmax");
    if (maxEl && document.activeElement !== maxEl) maxEl.value = layer.uv_max;
    set("#le_pv_uvx, .le-pv-uvx", layer.uv_x || 0);
    set("#le_pv_uvy, .le-pv-uvy", layer.uv_y || 0);
    set("#le_pv_uvmode, .le-pv-uvmode", layer.uv_mode || "animated");
  }

  function sheetFrameUv(layer, i) {
    const fw = num(layer.uv_w, 16);
    const fh = num(layer.uv_h, 16);
    const sx = num(layer.uv_step_x, 0);
    const sy = num(layer.uv_step_y, 0);
    const texW = Math.max(1, num(layer.tex_w, 16));
    let u = num(layer.uv_x, 0) + i * sx;
    let v = num(layer.uv_y, 0) + i * sy;
    if (sx > 0 && sy > 0) {
      const cols = Math.max(1, Math.floor((texW - num(layer.uv_x, 0)) / Math.max(1, sx)));
      u = num(layer.uv_x, 0) + (i % cols) * sx;
      v = num(layer.uv_y, 0) + Math.floor(i / cols) * sy;
    }
    return { u, v, w: fw, h: fh };
  }

  function drawTextureSheet(canvas, layer) {
    if (!canvas || !layer) return;
    const view = sheetView(canvas, layer);
    if (!view) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const meta = $("le_pv_texmeta");
    if (!view.img) {
      if (meta) meta.textContent = "Choose a PNG strip, then drag on the image to draw a frame.";
      return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(view.img, view.ox, view.oy, view.dw, view.dh);
    const frames = Math.max(1, Math.trunc(num(layer.uv_max, 1)));
    const play = sheetPlayIndex(layer);
    for (let i = 0; i < Math.min(frames, 48); i++) {
      const fr = sheetFrameUv(layer, i);
      const rx = view.ox + (fr.u / view.texW) * view.dw;
      const ry = view.oy + (fr.v / view.texH) * view.dh;
      const rw = (fr.w / view.texW) * view.dw;
      const rh = (fr.h / view.texH) * view.dh;
      if (i === play) {
        ctx.fillStyle = "rgba(61,180,230,0.22)";
        ctx.fillRect(rx, ry, rw, rh);
      }
      ctx.strokeStyle = i === 0 ? "#3db4e6" : (i === play ? "rgba(255,214,90,0.9)" : "rgba(61,180,230,0.32)");
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.strokeRect(rx + 0.5, ry + 0.5, Math.max(1, rw - 1), Math.max(1, rh - 1));
    }
    const box = firstFrameCanvasRect(view, layer);
    const editable = isCustomSheet(layer);
    if (editable) {
      const hs = sheetHandles(box);
      const hsSize = Math.max(5, Math.min(8, Math.min(box.w, box.h) * 0.22));
      ctx.fillStyle = "#e8f6ff";
      ctx.strokeStyle = "#1a6a8a";
      ctx.lineWidth = 1;
      for (let i = 0; i < hs.length; i++) {
        const hx = hs[i][1] - hsSize * 0.5;
        const hy = hs[i][2] - hsSize * 0.5;
        ctx.fillRect(hx, hy, hsSize, hsSize);
        ctx.strokeRect(hx + 0.5, hy + 0.5, hsSize - 1, hsSize - 1);
      }
    }
    const dir = sheetDirOf(layer);
    if (meta) {
      if (!editable && isBuiltinSprite(layer)) {
        meta.textContent = `${view.img.width} × ${view.img.height} px · built-in sprite · frames are fixed`;
      } else {
        meta.textContent = `${view.img.width} × ${view.img.height} px · ${layer.uv_mode || "full"} · ${dir.replace("_", " ")} · ${frames} frame${frames === 1 ? "" : "s"} · playing ${play + 1}/${frames}. Drag to draw a frame, drag the blue box to move or resize.`;
      }
    }
  }

  function paintSheetPlay() {
    const layer = selectedLayer();
    if (!layer) return;
    const host = $("le_pv_fields");
    if (!host) return;
    const idx = sheetPlayIndex(layer);
    const key = (layer.tex_id || "") + "|" + layer.uv_x + "|" + layer.uv_y + "|" + layer.uv_w + "|" + layer.uv_h + "|" + layer.uv_max + "|" + idx;
    if (LE_PV.sheetPlayKey === key) return;
    LE_PV.sheetPlayKey = key;
    const preview = host.querySelector(".le-pv-tex-preview");
    if (preview) paintLookPreview(preview, layer);
    if (LE_PV.sheetDrag) return;
    const sheet = host.querySelector(".le-pv-sheet");
    if (sheet) drawTextureSheet(sheet, layer);
  }

  function bindSheetEditor(canvas, layer) {
    if (!canvas || !layer) return;
    LE_PV.sheetPlayKey = "";
    const readOnly = !isCustomSheet(layer);
    canvas.classList.toggle("locked", readOnly);
    canvas.style.cursor = readOnly ? "default" : "crosshair";
    drawTextureSheet(canvas, layer);
    if (readOnly) return;
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const L = selectedLayer() || layer;
      const view = sheetView(canvas, L);
      if (!view || !view.img) return;
      const pt = pointerOnCanvas(canvas, e);
      const handle = hitSheetHandle(view, L, pt.x, pt.y);
      if (!handle) return;
      const tex = canvasToTex(view, pt.x, pt.y);
      LE_PV.sheetDrag = {
        handle,
        u0: tex.u,
        v0: tex.v,
        orig: { x: num(L.uv_x, 0), y: num(L.uv_y, 0), w: num(L.uv_w, 16), h: num(L.uv_h, 16) },
      };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", (e) => {
      const L = selectedLayer() || layer;
      const view = sheetView(canvas, L);
      if (!view || !view.img) return;
      const pt = pointerOnCanvas(canvas, e);
      if (!LE_PV.sheetDrag) {
        canvas.style.cursor = sheetCursor(hitSheetHandle(view, L, pt.x, pt.y));
        return;
      }
      const tex = canvasToTex(view, pt.x, pt.y);
      const d = LE_PV.sheetDrag;
      const o = d.orig;
      if (d.handle === "draw") {
        let w = tex.u - d.u0;
        let h = tex.v - d.v0;
        if (e.shiftKey) {
          const m = Math.max(Math.abs(w), Math.abs(h)) || 1;
          w = m * Math.sign(w || 1);
          h = m * Math.sign(h || 1);
        }
        applyFrameRect(L, d.u0, d.v0, w, h, { guessCount: true });
      } else if (d.handle === "move") {
        applyFrameRect(L, o.x + (tex.u - d.u0), o.y + (tex.v - d.v0), o.w, o.h);
      } else {
        let x1 = o.x;
        let y1 = o.y;
        let x2 = o.x + o.w;
        let y2 = o.y + o.h;
        if (d.handle.indexOf("w") >= 0) x1 = tex.u;
        if (d.handle.indexOf("e") >= 0) x2 = tex.u;
        if (d.handle.indexOf("n") >= 0) y1 = tex.v;
        if (d.handle.indexOf("s") >= 0) y2 = tex.v;
        if (e.shiftKey) {
          const side = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
          if (d.handle.indexOf("w") >= 0) x1 = x2 - side;
          if (d.handle.indexOf("e") >= 0) x2 = x1 + side;
          if (d.handle.indexOf("n") >= 0) y1 = y2 - side;
          if (d.handle.indexOf("s") >= 0) y2 = y1 + side;
        }
        applyFrameRect(L, x1, y1, x2 - x1, y2 - y1);
      }
      canvas.style.cursor = sheetCursor(d.handle);
      drawTextureSheet(canvas, L);
      const preview = $("le_pv_fields")?.querySelector(".le-pv-tex-preview");
      if (preview) paintLookPreview(preview, L);
    });
    const endDrag = () => {
      if (!LE_PV.sheetDrag) return;
      const L = selectedLayer() || layer;
      const tiny = LE_PV.sheetDrag.handle === "draw"
        && Math.abs(num(L.uv_w, 1) - LE_PV.sheetDrag.orig.w) < 1
        && Math.abs(num(L.uv_h, 1) - LE_PV.sheetDrag.orig.h) < 1
        && Math.abs(num(L.uv_x, 0) - LE_PV.sheetDrag.orig.x) < 1
        && Math.abs(num(L.uv_y, 0) - LE_PV.sheetDrag.orig.y) < 1;
      if (tiny) {
        L.uv_x = LE_PV.sheetDrag.orig.x;
        L.uv_y = LE_PV.sheetDrag.orig.y;
        L.uv_w = LE_PV.sheetDrag.orig.w;
        L.uv_h = LE_PV.sheetDrag.orig.h;
      }
      LE_PV.sheetDrag = null;
      LE_PV.sheetPlayKey = "";
      syncSheetFields(L);
      L._frames = null;
      L._frameKey = "";
      drawTextureSheet(canvas, L);
      replay();
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }

  function bindTextureTab(host, layer) {
    bindSheetEditor(host.querySelector(".le-pv-sheet"), layer);
    host.querySelector("#le_pv_choose_strip")?.addEventListener("click", () => $("le_pv_strip")?.click());
    host.querySelector("#le_pv_browse_tex")?.addEventListener("click", () => $("le_pv_load_tex")?.click());
    host.querySelector("#le_pv_browse_jar")?.addEventListener("click", () => $("le_pv_load_jar")?.click());
    host.querySelectorAll("[data-qs-group='sprite']").forEach((btn) => {
      btn.addEventListener("click", () => applyQuickSetup("sprite", btn.getAttribute("data-qs-id")));
    });
    host.querySelector(".le-pv-uvmode")?.addEventListener("change", () => {
      layer.uv_mode = host.querySelector(".le-pv-uvmode").value || "animated";
      renderInspector();
      replay();
    });
  }

  function procStyleOpt(id, label, selected) {
    ensureProcSprites();
    const c = PROC_SPRITES[id];
    const src = c && c.toDataURL ? c.toDataURL() : "";
    return `<button type="button" class="le-qs-opt le-pv-style${selected ? " on" : ""}" data-pv-style="${esc(id)}" title="${esc(label)}"><img src="${src}" alt="" />${esc(label)}</button>`;
  }

  function emitterTabId() {
    const t = String(LE_PV.inspectTab || "look");
    if (t === "look" || t === "shape" || t === "motion" || t === "timing") return t;
    if (t === "appearance" || t === "texture" || t === "setup" || t === "emitter") return "look";
    return "look";
  }

  function paintLookPreview(canvas, layer) {
    if (!canvas || !layer) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#12151c";
    ctx.fillRect(0, 0, w, h);
    const cell = 8;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        if (((x / cell) + (y / cell)) % 2 === 0) {
          ctx.fillStyle = "#1a1e28";
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }
    const spr = spriteForLayer(layer);
    const frames = spr.frames || [];
    const img = frames[sheetPlayIndex(layer)] || frames[0];
    if (!img) return;
    const rgb = hexToRgb01(layer.color_start, { r: 1, g: 1, b: 1 });
    const tinted = (layerTints(layer) && (rgb.r < 0.995 || rgb.g < 0.995 || rgb.b < 0.995)) ? tintedSprite(img, rgb.r, rgb.g, rgb.b) : img;
    ctx.imageSmoothingEnabled = false;
    const pad = 10;
    const dw = w - pad * 2;
    const dh = h - pad * 2;
    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.rotate(layerRotRad(layer));
    ctx.scale(layer.flip_x ? -1 : 1, layer.flip_y ? -1 : 1);
    ctx.drawImage(tinted, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();
  }

  function applyEmitterStyle(id) {
    const layer = selectedLayer();
    if (!layer) return;
    clearLayerTexture(layer);
    layer.sprite_style = id;
    layer.blend = id === "smoke" || id === "shard" ? "translucent" : "add";
    layer.additive = layer.blend === "add";
    renderInspector();
    replay();
  }

  function applyEmitterBuiltin(id) {
    const layer = selectedLayer();
    if (!layer) return;
    layer.sprite = id;
    layer.tex_id = "snowstorm:" + id;
    layer.tex_path = "textures/particle/" + id;
    layer.sprite_style = id === "smoke" ? "smoke" : (id === "spark" || id === "sparkle" || id === "magic" ? "spark" : "glow");
    layer.type = QS_SPRITE_TYPE[id] || layer.type || "vaerun:emitter";
    const look = QS_SPRITE_LOOK[id];
    if (look) {
      layer.size = look.size;
      layer.size_end = look.size_end;
      layer.size_y = look.size;
    }
    const uv = QS_SPRITE_UV[id];
    if (uv) Object.assign(layer, uv);
    layer._frames = null;
    layer._frameKey = "";
    renderInspector();
    replay();
  }

  function emitterLookHtml(layer) {
    ensureProcSprites();
    const builtins = (window.leParticleSprites && window.leParticleSprites.snowstormKeys ? window.leParticleSprites.snowstormKeys() : ["sparkle", "smoke", "magic", "spark", "dust", "ball", "leaves", "dirt"]);
    const style = inferSpriteStyle(layer);
    const usingTex = layerHasTexture(layer);
    const custom = isCustomSheet(layer);
    const builtin = isBuiltinSprite(layer);
    const sheetHint = custom
      ? "Drag on the image to draw a frame. Drag the blue box to move or resize it."
      : (builtin ? "Built-in sprite frames are fixed." : "Choose a PNG to slice frames.");
    const uvBlock = custom ? `
      <label>sheet animation</label>
      <select id="le_pv_uvmode" class="mono le-pv-uvmode">${optionsHtml([["full", "Whole image"], ["static", "One frame"], ["animated", "Animated sheet"]], layer.uv_mode || "animated")}</select>
      <div class="row">
        <div><label>read frames</label><select id="le_pv_uvdir" class="mono">${optionsHtml([["left_right", "left → right"], ["top_down", "top → down"], ["grid", "grid (left → right, wrap)"]], sheetDirOf(layer))}</select></div>
        <div><label>FPS</label><input id="le_pv_uvfps" class="le-pv-uvfps" type="number" min="0" step="1" value="${num(layer.uv_fps, 10)}" /></div>
      </div>
      <div class="row">
        <div><label>start X</label><input id="le_pv_uvx" class="le-pv-uvx" type="number" min="0" step="1" value="${layer.uv_x || 0}" /></div>
        <div><label>start Y</label><input id="le_pv_uvy" class="le-pv-uvy" type="number" min="0" step="1" value="${layer.uv_y || 0}" /></div>
      </div>
      <div class="row">
        <div><label>frame width</label><input id="le_pv_uvw" class="le-pv-uvw" type="number" min="1" step="1" value="${layer.uv_w || 16}" /></div>
        <div><label>frame height</label><input id="le_pv_uvh" class="le-pv-uvh" type="number" min="1" step="1" value="${layer.uv_h || 16}" /></div>
      </div>
      <div class="row">
        <div><label>frame count</label><input id="le_pv_uvmax" class="le-pv-uvmax" type="number" min="1" step="1" value="${layer.uv_max || 1}" /></div>
        <div><label class="inline-check" style="margin-top:1.4rem"><input id="le_pv_uvloop" class="le-pv-uvloop" type="checkbox"${layer.uv_loop !== false ? " checked" : ""} /> Loop</label></div>
      </div>
      <label class="inline-check"><input id="le_pv_uvstretch" class="le-pv-uvstretch" type="checkbox"${layer.uv_stretch ? " checked" : ""} /> Stretch frames across lifetime</label>
      <p class="hint" style="margin:0.15rem 0 0.45rem">Loop keeps the sheet and the particles playing. Untick it to play once and hold the last frame.</p>` : (builtin ? `<p class="hint">Built-in sprite frames cannot be edited. Choose a custom PNG to slice your own sheet.</p>` : "");
    return `
      <h3>Look</h3>
      <p class="hint">Three ways to pick a particle: a procedural style, a built-in sprite, or your own PNG.</p>
      <div class="le-pv-tex-current">
        <canvas class="le-pv-tex-preview" width="112" height="112"></canvas>
        <div>
          <strong>${esc(usingTex ? (layer.sprite || layer.tex_path || layer.tex_id) : style)}</strong>
          <p class="hint" style="margin:0.15rem 0 0">${esc(textureSourceLabel(layer))}${usingTex ? " · this overrides the procedural style" : ""}</p>
        </div>
      </div>
      <label>rotation (degrees)</label>
      <div class="row">
        <div><input id="le_pv_tk_rotdeg" type="number" min="0" max="359" step="1" value="${Math.round(layerRotDeg(layer))}" /></div>
        <div><input id="le_pv_tk_rotrange" class="le-pv-rotrange" type="range" min="0" max="359" step="1" value="${Math.round(layerRotDeg(layer))}" /></div>
      </div>
      <div class="le-pv-rotbar">
        ${[[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"]].map(([deg, label]) =>
          `<button type="button" class="ghost mini${Math.round(layerRotDeg(layer)) === deg ? " on" : ""}" data-pv-rot="${deg}">${label}</button>`
        ).join("")}
        <button type="button" class="ghost mini" data-pv-rot="left">−90°</button>
        <button type="button" class="ghost mini" data-pv-rot="right">+90°</button>
      </div>
      <div class="row">
        <div><label class="inline-check"><input id="le_pv_tk_flipx" type="checkbox"${layer.flip_x ? " checked" : ""} /> Flip horizontal</label></div>
        <div><label class="inline-check"><input id="le_pv_tk_flipy" type="checkbox"${layer.flip_y ? " checked" : ""} /> Flip vertical</label></div>
      </div>
      <p class="hint" style="margin:0.1rem 0 0.45rem">Turn the texture so the art faces the way you want. Spin motion still rolls it after this.</p>
      <label>Procedural styles</label>
      <div class="le-qs-list le-pv-style-list">
        ${SPRITE_STYLES.map(([id, label]) => procStyleOpt(id, label.split(" ")[0], !usingTex && style === id)).join("")}
      </div>
      <label>Built-in sprites</label>
      <div class="le-qs-list le-pv-style-list">
        ${builtins.map((id) => qsSpriteOpt(id, id[0].toUpperCase() + id.slice(1), layer.sprite === id || layer.tex_id === "snowstorm:" + id)).join("")}
      </div>
      <label>Custom PNG or path</label>
      <input class="le-pv-texpath mono" type="text" value="${esc(layer.tex_path || layer.tex_id || "")}" placeholder="textures/particle/sparkle" />
      ${usingTex ? `<div class="le-pv-sheet-wrap"><canvas class="le-pv-sheet${builtin ? " locked" : ""}" width="320" height="140"></canvas></div>
      <p class="hint" id="le_pv_texmeta" style="margin:0.3rem 0">${esc(sheetHint)}</p>` : ""}
      <div class="le-pv-texbar">
        <button type="button" class="ghost mini" id="le_pv_choose_strip">Choose file…</button>
        <button type="button" class="ghost mini" id="le_pv_browse_tex">Browse folder…</button>
        <button type="button" class="ghost mini" id="le_pv_browse_jar">Minecraft jar…</button>
        <button type="button" class="ghost mini" id="le_pv_clear_tex">Clear texture</button>
      </div>
      ${uvBlock}
      <label>blend</label>
      <select id="le_pv_tk_blend" class="mono">${optionsHtml(BLENDS, layer.blend || "add")}</select>
      <div class="row">
        <div><label>color start</label><input id="le_pv_tk_c0" type="color" value="${esc(layer.color_start || "#70B8FF")}" /></div>
        <div><label>color end</label><input id="le_pv_tk_c1" type="color" value="${esc(layer.color_end || "#D9A6FF")}" /></div>
      </div>
      <label class="inline-check"><input id="le_pv_tk_tint" type="checkbox"${layer.tint !== false ? " checked" : ""} /> Tint texture with start / end color</label>
      <p class="hint" style="margin:0.1rem 0 0.45rem">${typeUsesColor(layer.type)
        ? "Tint multiplies the sprite. White / grey art recolors cleanly; a painted fireball only gets darker. Untick to keep the PNG’s own colours."
        : "This in-game particle id ignores color. Use vaerun:emitter to tint."}</p>
      <div class="row">
        <div><label>size</label><input id="le_pv_tk_size" type="number" min="0.04" step="0.02" value="${num(layer.size, 0.28)}" /></div>
        <div><label>size variation</label><input id="le_pv_tk_svar" type="number" min="0" max="1" step="0.02" value="${num(layer.size_var, 0.18)}" /></div>
      </div>
      <div class="row">
        ${isSpriteSpinMotion(layer.motion_type) ? "<div></div>" : `<div><label>spin</label><input id="le_pv_tk_spin" type="number" step="0.01" value="${num(layer.spin, 0.04)}" /></div>`}
        <div><label class="inline-check" style="margin-top:1.4rem"><input id="le_pv_tk_trail" type="checkbox"${layer.trail ? " checked" : ""} /> Trails</label></div>
      </div>
      <label>in-game particle id</label>
      <input id="le_pv_tk_type" class="mono" type="text" value="${esc(layer.type || "vaerun:emitter")}" />
      <p class="hint">Preview uses the style or PNG above. Minecraft uses this id (vaerun:emitter for coloured motes).</p>`;
  }

  function bindEmitterLook(host, layer) {
    paintLookPreview(host.querySelector(".le-pv-tex-preview"), layer);
    bindSheetEditor(host.querySelector(".le-pv-sheet"), layer);
    host.querySelectorAll("[data-pv-style]").forEach((btn) => {
      btn.addEventListener("click", () => applyEmitterStyle(btn.getAttribute("data-pv-style")));
    });
    host.querySelectorAll("[data-qs-group='sprite']").forEach((btn) => {
      btn.addEventListener("click", () => applyEmitterBuiltin(btn.getAttribute("data-qs-id")));
    });
    host.querySelector("#le_pv_choose_strip")?.addEventListener("click", () => $("le_pv_strip")?.click());
    host.querySelector("#le_pv_browse_tex")?.addEventListener("click", () => $("le_pv_load_tex")?.click());
    host.querySelector("#le_pv_browse_jar")?.addEventListener("click", () => $("le_pv_load_jar")?.click());
    host.querySelector("#le_pv_clear_tex")?.addEventListener("click", () => {
      clearLayerTexture(layer);
      renderInspector();
      replay();
    });
    host.querySelector(".le-pv-texpath")?.addEventListener("change", () => {
      layer.tex_path = host.querySelector(".le-pv-texpath").value || "";
      if (layer.tex_path && !layer.tex_id && !layer.sprite) layer.sprite = "";
      replay();
    });
    host.querySelector("#le_pv_uvmode")?.addEventListener("change", () => {
      layer.uv_mode = host.querySelector("#le_pv_uvmode").value || "animated";
      layer._frames = null;
      renderInspector();
      replay();
    });
    host.querySelector("#le_pv_uvdir")?.addEventListener("change", () => {
      applySheetDir(layer, host.querySelector("#le_pv_uvdir").value || "left_right");
      renderInspector();
      replay();
    });
    host.querySelectorAll("[data-pv-rot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const L = selectedLayer();
        if (!L) return;
        const cmd = btn.getAttribute("data-pv-rot");
        let d = layerRotDeg(L);
        if (cmd === "left") d -= 90;
        else if (cmd === "right") d += 90;
        else d = num(cmd, 0);
        L.rot_deg = wrapRotDeg(d);
        L.rot_start = layerRotRad(L);
        renderInspector();
        replay();
      });
    });
  }

  function readEmitterLook() {
    const L = selectedLayer();
    if (!L) return;
    L.blend = $("le_pv_tk_blend")?.value || "add";
    L.additive = L.blend === "add";
    L.color_start = $("le_pv_tk_c0")?.value || "#70B8FF";
    L.color_end = $("le_pv_tk_c1")?.value || "#D9A6FF";
    if ($("le_pv_tk_tint")) L.tint = !!$("le_pv_tk_tint").checked;
    L.size = num($("le_pv_tk_size")?.value, 0.28);
    L.size_var = num($("le_pv_tk_svar")?.value, 0.18);
    const rotRange = $("le_pv_tk_rotrange");
    const rotNum = $("le_pv_tk_rotdeg");
    const rotSrc = document.activeElement === rotRange ? rotRange : rotNum;
    L.rot_deg = wrapRotDeg(rotSrc?.value ?? rotNum?.value ?? rotRange?.value);
    L.rot_start = layerRotRad(L);
    if (rotNum) rotNum.value = String(Math.round(L.rot_deg));
    if (rotRange) rotRange.value = String(Math.round(L.rot_deg));
    if ($("le_pv_tk_flipx")) L.flip_x = !!$("le_pv_tk_flipx").checked;
    if ($("le_pv_tk_flipy")) L.flip_y = !!$("le_pv_tk_flipy").checked;
    if ($("le_pv_tk_spin")) L.spin = num($("le_pv_tk_spin").value, 0.04);
    L.trail = !!$("le_pv_tk_trail")?.checked;
    L.type = $("le_pv_tk_type")?.value || "vaerun:emitter";
    const pathEl = document.querySelector("#le_pv_fields .le-pv-texpath");
    if (pathEl) L.tex_path = pathEl.value || "";
    if (isCustomSheet(L)) {
      const modeEl = $("le_pv_uvmode");
      if (modeEl) L.uv_mode = modeEl.value || L.uv_mode;
      L.uv_x = Math.max(0, readLiveNumber($("le_pv_uvx"), L.uv_x, 0));
      L.uv_y = Math.max(0, readLiveNumber($("le_pv_uvy"), L.uv_y, 0));
      L.uv_w = Math.max(1, readLiveNumber($("le_pv_uvw"), L.uv_w, 1));
      L.uv_h = Math.max(1, readLiveNumber($("le_pv_uvh"), L.uv_h, 1));
      L.uv_fps = Math.max(0, readLiveNumber($("le_pv_uvfps"), L.uv_fps, 0));
      L.uv_max = Math.max(1, Math.trunc(readLiveNumber($("le_pv_uvmax"), L.uv_max, 1)));
      if ($("le_pv_uvloop")) {
        L.uv_loop = !!$("le_pv_uvloop").checked;
        L.loop = L.uv_loop;
        L.lifetime_mode = L.uv_loop ? "looping" : "once";
      }
      if ($("le_pv_uvstretch")) L.uv_stretch = !!$("le_pv_uvstretch").checked;
      const dir = $("le_pv_uvdir")?.value;
      if (dir && dir !== sheetDirOf(L)) applySheetDir(L, dir, L.uv_w, L.uv_h);
      else if (dir === "left_right") {
        L.uv_step_x = L.uv_w;
        L.uv_step_y = 0;
      } else if (dir === "top_down") {
        L.uv_step_x = 0;
        L.uv_step_y = L.uv_h;
      } else if (dir === "grid") {
        L.uv_step_x = L.uv_w;
        L.uv_step_y = L.uv_h;
      }
    }
    L._frames = null;
  }

  function renderInspector() {
    const host = $("le_pv_fields");
    if (!host) return;
    if (LE_PV.doc.kind === "clip") adoptClipAsEmitter();
    const selected = selectedLayer();
    const kindSel = $("le_pv_kind");
    if (kindSel) kindSel.value = selected && !layerIsEmitter(selected) ? "shape" : "emitter";
    $("le_pv_shape_tools")?.classList.remove("hidden");
    if (!selected || layerIsEmitter(selected)) {
      const layer = selectedLayer();
      if (!layer) {
        $("le_pv_tabs")?.classList.add("hidden");
        host.innerHTML = "<p class='hint'>Add an emitter or a shape. The viewer plays every enabled layer together.</p>";
        renderLayerList();
        return;
      }
      LE_PV.inspectTab = emitterTabId();
      renderInspectTabs();
      const tab = LE_PV.inspectTab;
      if (tab === "look") {
        host.innerHTML = `
          <label>name</label>
          <input id="le_pv_tk_name" type="text" value="${esc(layer.name || "Emitter")}" />
          ${emitterLookHtml(layer)}`;
        bindEmitterLook(host, layer);
        bindInspectorInputs(host, () => {
          const L = selectedLayer();
          if (!L) return;
          L.name = $("le_pv_tk_name")?.value || L.name;
          readEmitterLook();
          paintLookPreview(host.querySelector(".le-pv-tex-preview"), L);
        });
      } else if (tab === "shape") {
        const sf = toolkitShapeFields(layer.shape);
        const extraLabel = sf.rings ? "rings" : sf.petals ? "petals" : sf.arms ? "arms" : "";
        host.innerHTML = `
          <h3>Shape</h3>
          <label>shape</label>
          <select id="le_pv_tk_shape" class="mono">${groupedOptionsHtml(SHAPE_GROUPS, layer.shape === "ring" ? "circle" : layer.shape)}</select>
          ${fieldRow(
            fieldCell("le_pv_tk_count", "particle count", Math.max(1, Math.trunc(num(layer.count, 24))), 'min="1" max="160" step="1"'),
            sf.radius ? fieldCell("le_pv_tk_radius", "radius", num(layer.shape_radius, 0.8), 'min="0.05" step="0.05"') : ""
          )}
          ${fieldRow(
            sf.height ? fieldCell("le_pv_tk_height", "height", num(layer.pillar_height, 2), 'min="0.1" step="0.1"') : (sf.turns ? fieldCell("le_pv_tk_turns", "turns", num(layer.helix_turns, 2), 'min="0.25" step="0.25"') : ""),
            sf.length ? fieldCell("le_pv_tk_len", "length", num(layer.line_length, num(layer.pillar_height, 2.4)), 'min="0.1" step="0.1"') : (sf.height && sf.turns ? fieldCell("le_pv_tk_turns", "turns", num(layer.helix_turns, 2), 'min="0.25" step="0.25"') : "")
          )}
          ${fieldRow(
            sf.segments ? fieldCell("le_pv_tk_segs", "segments", Math.max(2, Math.trunc(num(layer.segments, 6))), 'min="2" step="1"') : (sf.sides ? fieldCell("le_pv_tk_segs", "sides", Math.max(3, Math.trunc(num(layer.poly_sides, 5))), 'min="3" step="1"') : ""),
            sf.gap ? fieldCell("le_pv_tk_gap", "gap", num(layer.gap, 0.22), 'min="0" max="0.8" step="0.02"') : (sf.tube ? fieldCell("le_pv_tk_gap", "tube", num(layer.torus_tube, 0.28), 'min="0.04" step="0.02"') : "")
          )}
          ${fieldRow(
            extraLabel ? fieldCell("le_pv_tk_rings", extraLabel, Math.max(1, Math.trunc(num(layer.rings, num(layer.rune_petals, num(layer.flower_petals, num(layer.galaxy_arms, 3)))))), 'min="1" step="1"') : "",
            sf.mark ? `<div><label>rune mark</label><select id="le_pv_tk_mark" class="mono">${optionsHtml([["star","star"],["diamond","diamond"],["hex","hex"],["cross","cross"]], layer.rune_mark || "star")}</select></div>` : (sf.spread ? fieldCell("le_pv_tk_spread", "arc spread", num(layer.arc_spread, 2.6), 'min="0.2" step="0.1"') : "")
          )}
          ${fieldRow(
            fieldCell("le_pv_tk_oy", "local Y", num(layer.offset_y, 0), 'step="0.05"'),
            fieldCell("le_pv_tk_seed", "seed", Math.trunc(num(layer.seed, 1)), 'step="1"')
          )}
          <p class="hint">Only fields this shape uses are shown. Motion and texture live on the other tabs.</p>`;
        host.querySelector("#le_pv_tk_shape")?.addEventListener("change", () => {
          const L = selectedLayer();
          if (L) L.shape = $("le_pv_tk_shape").value || "circle";
          renderInspector();
          replay();
        });
        bindInspectorInputs(host, () => {
          const L = selectedLayer();
          if (!L) return;
          L.shape = $("le_pv_tk_shape")?.value || "circle";
          if ($("le_pv_tk_count")) L.count = Math.max(1, Math.trunc(num($("le_pv_tk_count").value, 24)));
          if ($("le_pv_tk_radius")) L.shape_radius = num($("le_pv_tk_radius").value, 0.8);
          if ($("le_pv_tk_height")) L.pillar_height = num($("le_pv_tk_height").value, 2);
          if ($("le_pv_tk_len")) {
            L.line_length = num($("le_pv_tk_len").value, 2.4);
            if (!$("le_pv_tk_height")) L.pillar_height = L.line_length;
          } else if ($("le_pv_tk_height")) {
            L.line_length = L.pillar_height;
          }
          if ($("le_pv_tk_turns")) L.helix_turns = num($("le_pv_tk_turns").value, 2);
          if ($("le_pv_tk_segs")) {
            L.segments = Math.max(2, Math.trunc(num($("le_pv_tk_segs").value, 6)));
            L.poly_sides = L.segments;
          }
          if ($("le_pv_tk_gap")) {
            L.gap = num($("le_pv_tk_gap").value, 0.22);
            L.torus_tube = L.gap;
          }
          if ($("le_pv_tk_rings")) {
            L.rings = Math.max(1, Math.trunc(num($("le_pv_tk_rings").value, 3)));
            L.rune_petals = L.rings;
            L.flower_petals = L.rings;
            L.galaxy_arms = Math.max(2, L.rings);
          }
          if ($("le_pv_tk_mark")) L.rune_mark = $("le_pv_tk_mark").value || "star";
          if ($("le_pv_tk_spread")) L.arc_spread = num($("le_pv_tk_spread").value, 2.6);
          if ($("le_pv_tk_oy")) L.offset_y = num($("le_pv_tk_oy").value, 0);
          if ($("le_pv_tk_seed")) L.seed = Math.trunc(num($("le_pv_tk_seed").value, 1));
        });
      } else if (tab === "motion") {
        const mf = toolkitMotionFields(layer.motion_type);
        host.innerHTML = `
          <h3>Motion</h3>
          <label>motion</label>
          <select id="le_pv_tk_motion" class="mono">${groupedOptionsHtml(MOTION_GROUPS, layer.motion_type || "orbit")}</select>
          ${fieldRow(
            mf.degrees ? fieldCell("le_pv_tk_dpt", "degrees / tick", num(layer.degrees_per_tick, 8), 'step="0.5"') : "",
            mf.axis ? `<div><label>axis</label><select id="le_pv_tk_axis" class="mono">${optionsHtml([["y","y"],["x","x"],["z","z"]], layer.motion_axis || "y")}</select></div>` : ""
          )}
          ${fieldRow(
            mf.speed ? fieldCell("le_pv_tk_speed", "speed", num(layer.speed, 0.12), 'step="0.01"') : "",
            mf.gravity ? fieldCell("le_pv_tk_grav", "gravity", num(layer.gravity, 0), 'step="0.01"') : ""
          )}
          ${fieldRow(
            mf.wave ? fieldCell("le_pv_tk_amp", "wave amplitude", num(layer.wave_amp, 0.12), 'min="0" step="0.01"') : "",
            mf.wave ? fieldCell("le_pv_tk_freq", "wave frequency", num(layer.wave_freq, 0.35), 'min="0" step="0.01"') : ""
          )}
          ${fieldRow(
            mf.drag ? fieldCell("le_pv_tk_drag", "drag", num(layer.drag, 0), 'min="0" step="0.01"') : "",
            mf.collision ? `<div><label class="inline-check" style="margin-top:1.4rem"><input id="le_pv_tk_col" type="checkbox"${layer.collision ? " checked" : ""} /> Collision</label></div>` : ""
          )}
          <p class="hint">${isSpriteSpinMotion(layer.motion_type)
            ? "Spin clockwise keeps motes in place, facing you, and rolls the sprite. Degrees / tick is how fast. Use Look → rotation if the texture starts facing the wrong way."
            : "Only fields this motion uses are shown. Burst and scatter fly from the shape. Everything else keeps the formation and moves it."}</p>`;
        host.querySelector("#le_pv_tk_motion")?.addEventListener("change", () => {
          const L = selectedLayer();
          if (L) L.motion_type = $("le_pv_tk_motion").value || "orbit";
          renderInspector();
          replay();
        });
        bindInspectorInputs(host, () => {
          const L = selectedLayer();
          if (!L) return;
          L.motion_type = $("le_pv_tk_motion")?.value || "orbit";
          if ($("le_pv_tk_dpt")) L.degrees_per_tick = num($("le_pv_tk_dpt").value, 8);
          if ($("le_pv_tk_axis")) L.motion_axis = $("le_pv_tk_axis").value || "y";
          if ($("le_pv_tk_speed")) L.speed = num($("le_pv_tk_speed").value, 0.12);
          if ($("le_pv_tk_grav")) L.gravity = num($("le_pv_tk_grav").value, 0);
          if ($("le_pv_tk_amp")) L.wave_amp = num($("le_pv_tk_amp").value, 0.12);
          if ($("le_pv_tk_freq")) L.wave_freq = num($("le_pv_tk_freq").value, 0.35);
          if ($("le_pv_tk_drag")) L.drag = num($("le_pv_tk_drag").value, 0);
          if ($("le_pv_tk_col")) L.collision = !!$("le_pv_tk_col").checked;
        });
      } else {
        host.innerHTML = `
          <h3>Timing</h3>
          <div class="row">
            <div><label>start tick</label><input id="le_pv_tk_start" type="number" min="0" step="1" value="${Math.trunc(num(layer.start_tick, 0))}" /></div>
            <div><label>emit duration</label><input id="le_pv_tk_edur" type="number" min="0" step="1" value="${Math.trunc(num(layer.emit_duration_ticks, 0))}" /></div>
          </div>
          <div class="row">
            <div><label>lifetime ticks</label><input id="le_pv_tk_life" type="number" min="4" step="1" value="${Math.max(4, Math.trunc(num(layer.lifetime_ticks, 30)))}" /></div>
            <div><label>seed</label><input id="le_pv_tk_seed" type="number" step="1" value="${Math.trunc(num(layer.seed, 1))}" /></div>
          </div>
          <div class="row">
            <div><label>fade in</label><input id="le_pv_tk_fin" type="number" min="0" step="1" value="${Math.trunc(num(layer.fade_in_ticks, 3))}" /></div>
            <div><label>fade out</label><input id="le_pv_tk_fout" type="number" min="0" step="1" value="${Math.trunc(num(layer.fade_out_ticks, 8))}" /></div>
          </div>
          <div class="row">
            <div><label>size curve</label><select id="le_pv_tk_scurve" class="mono">${optionsHtml(CURVES, layer.scale_curve || "fade_in_out")}</select></div>
            <div><label>alpha curve</label><select id="le_pv_tk_acurve" class="mono">${optionsHtml(CURVES, layer.alpha_curve || "fade_in_out")}</select></div>
          </div>
          <p class="hint">Emit duration 0 = whole effect. Preview budget ${PREVIEW_CAP}; in-game cap is performance.max_particles (max 160).</p>`;
        bindInspectorInputs(host, () => {
          const L = selectedLayer();
          if (!L) return;
          L.start_tick = Math.max(0, Math.trunc(num($("le_pv_tk_start")?.value, 0)));
          L.emit_duration_ticks = Math.max(0, Math.trunc(num($("le_pv_tk_edur")?.value, 0)));
          L.lifetime_ticks = Math.max(4, Math.trunc(num($("le_pv_tk_life")?.value, 30)));
          L.seed = Math.trunc(num($("le_pv_tk_seed")?.value, 1));
          L.fade_in_ticks = Math.max(0, Math.trunc(num($("le_pv_tk_fin")?.value, 3)));
          L.fade_out_ticks = Math.max(0, Math.trunc(num($("le_pv_tk_fout")?.value, 8)));
          L.scale_curve = $("le_pv_tk_scurve")?.value || "fade_in_out";
          L.alpha_curve = $("le_pv_tk_acurve")?.value || "fade_in_out";
        });
      }
      renderLayerList();
      return;
    }
    const layer = selectedLayer();
    if (!layer) {
      host.innerHTML = "<p class='hint'>Add a shape to start.</p>";
      renderLayerList();
      return;
    }
    renderInspectTabs();
    const tab = LE_PV.inspectTab || "setup";
    const need = shapeNeeds(layer.shape);
    const k = typeof inferParticleKindUiFromType === "function" ? inferParticleKindUiFromType(layer.type) : { kind: "__custom__", customStr: layer.type, dustHex: "#88ccff", dustScale: 1 };
    if (tab === "setup") {
      host.innerHTML = quickSetupHtml(layer);
      bindQuickSetup(host);
    } else if (tab === "emitter") {
      host.innerHTML = `
        <h3>${esc(layer.name)}</h3>
        <label>particle type</label>
        <select class="mono fx-f-pvc-kind">${typeof particleTypeKindSelectHtml === "function" ? particleTypeKindSelectHtml(k.kind) : ""}</select>
        <div class="fx-f-pvc-custom-wrap${k.kind === "__custom__" ? "" : " hidden"}" style="margin-top:0.35rem">
          <label>custom particle id</label>
          <input class="mono fx-f-pvc-custom-id" type="text" value="${esc(k.customStr)}" />
        </div>
        <label>spawn amount</label>
        <select class="le-pv-ratemode mono">${optionsHtml(RATE_MODES, layer.rate_mode || "instant")}</select>
        <div class="row">
          <div><label>rate / sec</label><input class="le-pv-rate" type="number" min="0" step="1" value="${layer.emit_rate || 8}" /></div>
          <div><label>amount</label><input class="le-pv-amount" type="number" min="1" step="1" value="${layer.amount || 16}" /></div>
        </div>
        <div class="row">
          <div><label>maximum</label><input class="le-pv-maxp" type="number" min="1" step="1" value="${layer.maximum || 100}" /></div>
          <div><label>particle life ticks</label><input class="le-pv-plife" type="number" min="1" step="1" value="${layer.particle_lifetime_ticks || 28}" /></div>
        </div>
        <label>emitter lifetime</label>
        <select class="le-pv-lifemode mono">${optionsHtml(LIFE_MODES, layer.lifetime_mode || "once")}</select>
        <div class="row">
          <div><label>active time (s)</label><input class="le-pv-active" type="number" min="0.05" step="0.1" value="${layer.active_time || 2}" /></div>
          <div><label>sleep time (s)</label><input class="le-pv-sleep" type="number" min="0" step="0.1" value="${layer.sleep_time || 0}" /></div>
        </div>
        <label class="inline-check"><input class="le-pv-loop" type="checkbox"${layer.loop ? " checked" : ""} /> Loop until skill ends</label>
        <div class="row">
          <div><label>duration ticks (0 = skill)</label><input class="le-pv-loopdur" type="number" min="0" step="1" value="${layer.duration_ticks || 0}" /></div>
          <div></div>
        </div>`;
      if (typeof syncParticleKindAuxInRow === "function") syncParticleKindAuxInRow(host, "pvc");
      host.querySelector(".fx-f-pvc-kind")?.addEventListener("change", () => {
        if (typeof syncParticleKindAuxInRow === "function") syncParticleKindAuxInRow(host, "pvc");
        readShapeFields();
        replay();
      });
      bindInspectorInputs(host, readShapeFields);
    } else if (tab === "shape") {
      host.innerHTML = `
        <h3>Spawn shape</h3>
        <label>shape</label>
        <select class="le-pv-shape mono">${optionsHtml(SHAPES, layer.shape)}</select>
        <div class="row">
          <div><label>count</label><input class="le-pv-count" type="number" min="0" step="1" value="${layer.count}" /></div>
          <div><label>spread</label><input class="le-pv-spread" type="number" min="0" step="0.01" value="${layer.spread}" /></div>
        </div>
        <div class="row">
          <div><label>samples</label><input class="le-pv-samples" type="number" min="3" step="1" value="${layer.shape_samples}" /></div>
          <div><label>delay ticks</label><input class="le-pv-delay" type="number" min="0" step="1" value="${layer.delay_ticks || 0}" /></div>
        </div>
        <label>anchor</label>
        <select class="le-pv-anchor mono">${optionsHtml(ANCHORS, layer.anchor)}</select>
        <div class="row">
          <div><label>offset right</label><input class="le-pv-ox" type="number" step="0.05" value="${layer.offset_right}" /></div>
          <div><label>offset forward</label><input class="le-pv-oz" type="number" step="0.05" value="${layer.offset_forward}" /></div>
        </div>
        <div class="row">
          <div><label>offset up</label><input class="le-pv-oy" type="number" step="0.05" value="${layer.offset_up}" /></div>
          <div><label class="inline-check" style="margin-top:1.4rem"><input class="le-pv-surface" type="checkbox"${layer.surface_only ? " checked" : ""} /> Surface only</label></div>
        </div>
        <div class="row${need.radius ? "" : " hidden"}" data-need="radius">
          <div><label>radius</label><input class="le-pv-radius" type="number" min="0.05" step="0.05" value="${layer.shape_radius}" /></div>
          <div><label>height</label><input class="le-pv-pillarh" type="number" min="0.2" step="0.1" value="${layer.pillar_height}" /></div>
        </div>
        <div class="row${need.pillar ? "" : " hidden"}" data-need="pillar">
          <div><label>helix turns</label><input class="le-pv-turns" type="number" min="1" step="1" value="${layer.helix_turns}" /></div>
          <div><label>taper</label><input class="le-pv-taper" type="number" step="0.05" value="${layer.taper}" /></div>
        </div>
        <div class="row${need.line ? "" : " hidden"}" data-need="line">
          <div><label>length</label><input class="le-pv-linelen" type="number" min="0.05" step="0.05" value="${layer.line_length}" /></div>
          <div></div>
        </div>
        ${need.custom ? `<p class="hint">Points: ${layer.points.length}${layer.closed ? " (closed)" : ""}. Draw in the viewport, or clear.</p>
          <button type="button" class="ghost mini" id="le_pv_clear_pts">Clear points</button>` : `<p class="hint">Place: click the ground (without dragging) to move this emitter.</p>`}`;
      host.querySelector(".le-pv-shape")?.addEventListener("change", () => {
        readShapeFields();
        if (/helix|pillar|spiral|spin_/.test(String(layer.shape || "")) && !layer.loop) layer.loop = true;
        renderInspector();
        replay();
      });
      host.querySelector("#le_pv_clear_pts")?.addEventListener("click", () => {
        layer.points = [];
        layer.closed = false;
        renderInspector();
        replay();
      });
      bindInspectorInputs(host, readShapeFields);
    } else if (tab === "motion") {
      host.innerHTML = `
        <h3>Motion</h3>
        <label>direction</label>
        <select class="le-pv-dir mono">${optionsHtml(DIR_MODES, layer.direction || "outwards")}</select>
        <div class="row">
          <div><label>speed</label><input class="le-pv-speed" type="number" min="0" step="0.05" value="${layer.speed}" /></div>
          <div><label>drag</label><input class="le-pv-drag" type="number" min="0" step="0.05" value="${layer.drag || 0}" /></div>
        </div>
        <div class="row">
          <div><label>accel Y (rise)</label><input class="le-pv-accy" type="number" step="0.1" value="${layer.accel_y || 0}" /></div>
          <div><label>gravity (down)</label><input class="le-pv-grav" type="number" step="0.1" value="${layer.gravity || 0}" /></div>
        </div>
        <div class="row">
          <div><label>accel X</label><input class="le-pv-accx" type="number" step="0.1" value="${layer.accel_x || 0}" /></div>
          <div><label>accel Z</label><input class="le-pv-accz" type="number" step="0.1" value="${layer.accel_z || 0}" /></div>
        </div>
        <label class="inline-check"><input class="le-pv-col" type="checkbox"${layer.collision ? " checked" : ""} /> Collide with ground</label>
        <div class="row">
          <div><label>bounciness</label><input class="le-pv-bounce" type="number" min="0" max="1" step="0.05" value="${layer.bounce || 0}" /></div>
          <div><label class="inline-check" style="margin-top:1.4rem"><input class="le-pv-expire" type="checkbox"${layer.expire_on_contact ? " checked" : ""} /> Expire on contact</label></div>
        </div>`;
      bindInspectorInputs(host, readShapeFields);
    } else if (tab === "appearance") {
      host.innerHTML = `
        <h3>Appearance</h3>
        <div class="row">
          <div><label>size</label><input class="le-pv-size" type="number" min="0.02" step="0.01" value="${layer.size || 0.25}" /></div>
          <div><label>size Y</label><input class="le-pv-sizey" type="number" min="0.02" step="0.01" value="${layer.size_y || layer.size || 0.25}" /></div>
        </div>
        <label>material</label>
        <select class="le-pv-mat mono">${optionsHtml([["particles_blend", "Blend"], ["particles_add", "Additive"], ["particles_alpha", "Alpha Test"], ["particles_opaque", "Opaque"]], layer.material || (layer.additive !== false ? "particles_add" : "particles_blend"))}</select>
        <label>facing</label>
        <select class="le-pv-face mono">${optionsHtml([["rotate_xyz", "Rotate XYZ"], ["rotate_y", "Rotate Y"], ["lookat_xyz", "Look at XYZ"], ["lookat_y", "Look at Y"]], layer.facing || "rotate_xyz")}</select>
        <label class="inline-check"><input class="le-pv-light" type="checkbox"${layer.lighting ? " checked" : ""} /> Environment lighting</label>
        <label>projectile_trail (optional)</label>
        <input id="le_pv_trail" class="mono" type="text" value="${esc(LE_PV.doc.projectile_trail || "")}" placeholder="minecraft:flame" />
        ${colorSectionHtml(layer)}`;
      bindAppearanceColor(host, layer);
      bindInspectorInputs(host, readShapeFields);
    } else {
      host.innerHTML = textureTabHtml(layer);
      bindTextureTab(host, layer);
      bindInspectorInputs(host, readShapeFields);
    }
    renderLayerList();
    refreshJsonPanel();
  }

  function renderInspectTabs() {
    const bar = $("le_pv_tabs");
    if (!bar) return;
    bar.classList.toggle("hidden", false);
    const emitter = layerIsEmitter(selectedLayer());
    const tabs = emitter ? EMITTER_TABS : INSPECT_TABS;
    let cur = emitter ? emitterTabId() : (LE_PV.inspectTab || "setup");
    if (!tabs.some((t) => t[0] === cur)) cur = emitter ? "look" : "setup";
    LE_PV.inspectTab = cur;
    bar.innerHTML = tabs.map(([id, label, svg]) =>
      `<button type="button" class="le-pv-tab${cur === id ? " on" : ""}" data-pv-tab="${id}" title="${label}">${svg}<span>${esc(label)}</span></button>`
    ).join("");
    bar.querySelectorAll("[data-pv-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        LE_PV.inspectTab = btn.getAttribute("data-pv-tab");
        renderInspector();
      });
    });
  }

  function noteVfx(opts) {
    if (typeof window.leBuilderSession?.note !== "function") return;
    window.leBuilderSession.note(Object.assign({ lane: "vfx" }, opts || {}));
  }

  function bindInspectorInputs(host, reader) {
    host.querySelectorAll("input, select").forEach((el) => {
      if (el.classList.contains("fx-f-pvc-kind") || el.classList.contains("le-pv-shape") || el.classList.contains("le-pv-uvmode") || el.id === "le_pv_uvdir" || el.closest(".le-pv-qs") || el.closest(".le-pv-color")) return;
      el.addEventListener("input", () => {
        reader();
        scheduleReplay();
        refreshJsonPanel();
        noteVfx();
      });
      el.addEventListener("change", () => {
        reader();
        replay();
        refreshJsonPanel();
        noteVfx();
      });
    });
  }

  function readClipFields() {
    const c = LE_PV.doc.clip;
    c.clip = $("le_pv_clip")?.value || "hit";
    c.particle = $("le_pv_clip_particle")?.value || c.particle;
    c.count = Math.max(1, Math.trunc(num($("le_pv_clip_count")?.value, 8)));
    c.scale = Math.max(0.05, num($("le_pv_clip_scale")?.value, 1));
    c.spread = Math.max(0, num($("le_pv_clip_spread")?.value, 0.12));
    c.speed = Math.max(0, num($("le_pv_clip_speed")?.value, 0.04));
    c.lifetime_ticks = Math.max(1, Math.trunc(num($("le_pv_clip_life")?.value, 12)));
    c.sound = $("le_pv_clip_sound")?.value || "";
  }

  function readShapeFields() {
    const layer = selectedLayer();
    if (!layer) return;
    const host = $("le_pv_fields");
    if (typeof readParticleTypeFromRow === "function") {
      const t = readParticleTypeFromRow(host, "pvc");
      if (t) layer.type = typeof t === "string" ? t : typeId(t);
    }
    layer.shape = host.querySelector(".le-pv-shape")?.value || layer.shape;
    layer.anchor = host.querySelector(".le-pv-anchor")?.value || layer.anchor;
    layer.count = Math.max(0, Math.trunc(num(host.querySelector(".le-pv-count")?.value, layer.count)));
    layer.spread = Math.max(0, num(host.querySelector(".le-pv-spread")?.value, layer.spread));
    layer.speed = Math.max(0, num(host.querySelector(".le-pv-speed")?.value, layer.speed));
    layer.delay_ticks = Math.max(0, Math.trunc(num(host.querySelector(".le-pv-delay")?.value, layer.delay_ticks)));
    layer.offset_right = num(host.querySelector(".le-pv-ox")?.value, layer.offset_right);
    layer.offset_up = num(host.querySelector(".le-pv-oy")?.value, layer.offset_up);
    layer.offset_forward = num(host.querySelector(".le-pv-oz")?.value, layer.offset_forward);
    layer.shape_radius = Math.max(0.05, num(host.querySelector(".le-pv-radius")?.value, layer.shape_radius));
    layer.shape_samples = Math.max(3, Math.trunc(num(host.querySelector(".le-pv-samples")?.value, layer.shape_samples)));
    layer.line_length = Math.max(0.05, num(host.querySelector(".le-pv-linelen")?.value, layer.line_length));
    layer.pillar_height = Math.max(0.2, num(host.querySelector(".le-pv-pillarh")?.value, layer.pillar_height));
    layer.helix_turns = Math.max(1, Math.trunc(num(host.querySelector(".le-pv-turns")?.value, layer.helix_turns)));
    layer.taper = num(host.querySelector(".le-pv-taper")?.value, layer.taper);
    layer.loop = !!host.querySelector(".le-pv-loop")?.checked;
    layer.duration_ticks = Math.max(0, Math.trunc(num(host.querySelector(".le-pv-loopdur")?.value, 0)));
    layer.rate_mode = host.querySelector(".le-pv-ratemode")?.value || layer.rate_mode;
    if (String(layer.rate_mode) === "steady") layer.emitter = true;
    layer.emit_rate = Math.max(0, num(host.querySelector(".le-pv-rate")?.value, layer.emit_rate));
    layer.amount = Math.max(1, Math.trunc(num(host.querySelector(".le-pv-amount")?.value, layer.amount)));
    layer.maximum = Math.max(1, Math.trunc(num(host.querySelector(".le-pv-maxp")?.value, layer.maximum)));
    layer.particle_lifetime_ticks = Math.max(1, Math.trunc(num(host.querySelector(".le-pv-plife")?.value, layer.particle_lifetime_ticks)));
    layer.lifetime_mode = host.querySelector(".le-pv-lifemode")?.value || layer.lifetime_mode;
    layer.active_time = Math.max(0.05, num(host.querySelector(".le-pv-active")?.value, layer.active_time));
    layer.sleep_time = Math.max(0, num(host.querySelector(".le-pv-sleep")?.value, layer.sleep_time));
    layer.surface_only = !!host.querySelector(".le-pv-surface")?.checked;
    layer.direction = host.querySelector(".le-pv-dir")?.value || layer.direction;
    layer.drag = Math.max(0, num(host.querySelector(".le-pv-drag")?.value, layer.drag));
    layer.accel_x = num(host.querySelector(".le-pv-accx")?.value, layer.accel_x);
    layer.accel_y = num(host.querySelector(".le-pv-accy")?.value, layer.accel_y);
    layer.accel_z = num(host.querySelector(".le-pv-accz")?.value, layer.accel_z);
    layer.gravity = num(host.querySelector(".le-pv-grav")?.value, layer.gravity);
    layer.collision = !!host.querySelector(".le-pv-col")?.checked;
    layer.bounce = Math.max(0, num(host.querySelector(".le-pv-bounce")?.value, layer.bounce));
    layer.expire_on_contact = !!host.querySelector(".le-pv-expire")?.checked;
    layer.size = Math.max(0.02, num(host.querySelector(".le-pv-size")?.value, layer.size));
    layer.size_y = Math.max(0.02, num(host.querySelector(".le-pv-sizey")?.value, layer.size_y || layer.size));
    layer.size_end = num(host.querySelector(".le-pv-sizeend")?.value, layer.size);
    layer.material = host.querySelector(".le-pv-mat")?.value || layer.material || "particles_add";
    layer.facing = host.querySelector(".le-pv-face")?.value || layer.facing || "rotate_xyz";
    layer.lighting = !!host.querySelector(".le-pv-light")?.checked;
    layer.additive = String(layer.material) === "particles_add";
    layer.tex_path = host.querySelector(".le-pv-texpath")?.value || layer.tex_path;
    layer.uv_mode = host.querySelector(".le-pv-uvmode")?.value || layer.uv_mode;
    layer.tex_w = Math.max(1, num(host.querySelector(".le-pv-texw")?.value, layer.tex_w));
    layer.tex_h = Math.max(1, num(host.querySelector(".le-pv-texh")?.value, layer.tex_h));
    layer.uv_x = num(host.querySelector(".le-pv-uvx")?.value, layer.uv_x);
    layer.uv_y = num(host.querySelector(".le-pv-uvy")?.value, layer.uv_y);
    layer.uv_w = Math.max(1, num(host.querySelector(".le-pv-uvw")?.value, layer.uv_w));
    layer.uv_h = Math.max(1, num(host.querySelector(".le-pv-uvh")?.value, layer.uv_h));
    layer.uv_step_x = num(host.querySelector(".le-pv-uvsx")?.value, layer.uv_step_x);
    layer.uv_step_y = num(host.querySelector(".le-pv-uvsy")?.value, layer.uv_step_y);
    layer.uv_fps = Math.max(0, num(host.querySelector(".le-pv-uvfps")?.value, layer.uv_fps));
    layer.uv_max = Math.max(1, Math.trunc(num(host.querySelector(".le-pv-uvmax")?.value, layer.uv_max)));
    if (host.querySelector(".le-pv-uvstretch")) layer.uv_stretch = !!host.querySelector(".le-pv-uvstretch").checked;
    if (host.querySelector(".le-pv-uvloop")) layer.uv_loop = !!host.querySelector(".le-pv-uvloop").checked;
    LE_PV.doc.projectile_trail = $("le_pv_trail")?.value || "";
    if (LE_PV.inspectTab === "texture") drawTextureSheet(host.querySelector(".le-pv-sheet"), layer);
  }

  function layerToProgram(layer) {
    const p = {
      type: layer.type,
      shape: layer.shape === "custom" ? "custom" : layer.shape,
      count: layer.count,
      spread: layer.spread,
      speed: layer.speed,
      shape_radius: layer.shape_radius,
      shape_samples: layer.shape_samples,
      line_length: layer.line_length,
      pillar_height: layer.pillar_height,
      helix_turns: layer.helix_turns,
      spin_steps: layer.spin_steps,
      spin_delay_ticks: layer.spin_delay_ticks,
      pillar_layers: layer.pillar_layers,
      taper: layer.taper,
      anchor: layer.anchor,
      offset_right: layer.offset_right,
      offset_up: layer.offset_up,
      offset_forward: layer.offset_forward,
    };
    if (layer.delay_ticks) p.delay_ticks = layer.delay_ticks;
    if (usesPhysEmitter(layer)) {
      p.emitter = true;
      p.rate_mode = layer.rate_mode || "instant";
      p.emit_rate = layer.emit_rate;
      p.amount = layer.amount;
      p.maximum = layer.maximum;
      p.lifetime_mode = layer.lifetime_mode || (usesSteadyEmitter(layer) ? "looping" : "once");
      p.active_time = layer.active_time;
      if (layer.sleep_time) p.sleep_time = layer.sleep_time;
      p.particle_lifetime_ticks = layer.particle_lifetime_ticks;
      p.direction = layer.direction || "outwards";
      if (layer.direction === "custom") {
        p.dir_x = layer.dir_x;
        p.dir_y = layer.dir_y;
        p.dir_z = layer.dir_z;
      }
      p.surface_only = !!layer.surface_only;
      p.accel_x = layer.accel_x || 0;
      p.accel_y = layer.accel_y || 0;
      p.accel_z = layer.accel_z || 0;
      p.gravity = layer.gravity || 0;
      p.drag = layer.drag || 0;
      p.size = layer.size;
      p.size_end = layer.size_end;
      p.collision = !!layer.collision;
      p.bounce = layer.bounce || 0;
      p.expire_on_contact = !!layer.expire_on_contact;
      if (layer.sprite) p.sprite = layer.sprite;
      if (layer.tex_id) p.tex_id = layer.tex_id;
      if (layer.tex_path) p.tex_path = layer.tex_path;
      p.uv_mode = layer.uv_mode;
      p.tex_w = layer.tex_w;
      p.tex_h = layer.tex_h;
      p.uv_x = layer.uv_x;
      p.uv_y = layer.uv_y;
      p.uv_w = layer.uv_w;
      p.uv_h = layer.uv_h;
      p.uv_step_x = layer.uv_step_x;
      p.uv_step_y = layer.uv_step_y;
      p.uv_fps = layer.uv_fps;
      p.uv_max = layer.uv_max;
      p.uv_stretch = !!layer.uv_stretch;
      p.uv_loop = layer.uv_loop !== false;
    }
    p.size = layer.size;
    p.size_y = layer.size_y;
    p.size_end = layer.size_end;
    p.material = layer.material || (layer.additive !== false ? "particles_add" : "particles_blend");
    p.facing = layer.facing || "rotate_xyz";
    p.lighting = !!layer.lighting;
    p.color_mode = layer.color_mode || "static";
    {
      const rgb = hexToRgb(layer.color_hex || "#ffffff");
      p.color = { r: rgb[0], g: rgb[1], b: rgb[2], hex: layer.color_hex || "#FFFFFF" };
    }
    if (layer.color_mode === "gradient") {
      p.color_gradient = layerGradient(layer).map((s) => {
        const rgb = hexToRgb(s.hex);
        return { t: s.t, r: rgb[0], g: rgb[1], b: rgb[2], hex: s.hex };
      });
      p.gradient_range = num(layer.gradient_range, 1);
      p.gradient_interpolant = layer.gradient_interpolant || "v.particle_age / v.particle_lifetime";
      const last = p.color_gradient[p.color_gradient.length - 1];
      if (last) p.color_end = { r: last.r, g: last.g, b: last.b };
    }
    p.additive = String(p.material) === "particles_add";
    if (layer.tex_id) p.tex_id = layer.tex_id;
    if (layer.tex_path) p.tex_path = layer.tex_path;
    if (layer.uv_mode) p.uv_mode = layer.uv_mode;
    p.tex_w = layer.tex_w;
    p.tex_h = layer.tex_h;
    p.uv_x = layer.uv_x;
    p.uv_y = layer.uv_y;
    p.uv_w = layer.uv_w;
    p.uv_h = layer.uv_h;
    p.uv_step_x = layer.uv_step_x;
    p.uv_step_y = layer.uv_step_y;
    p.uv_fps = layer.uv_fps;
    p.uv_max = layer.uv_max;
    p.uv_stretch = !!layer.uv_stretch;
    p.uv_loop = layer.uv_loop !== false;
    if (layer.loop || layer.lifetime_mode === "looping") {
      p.loop = true;
      p.loop_until = "skill";
      if (layer.duration_ticks > 0) p.duration_ticks = layer.duration_ticks;
    }
    if ((layer.shape === "custom" || layer.shape === "path" || layer.shape === "points") && layer.points.length) {
      p.points = layer.points.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z }));
      if (layer.closed) p.closed = true;
    }
    return p;
  }

  function programToLayer(p, name, delay) {
    const layer = newLayer(name, "shape");
    if (!p || typeof p !== "object") return layer;
    layer.type = p.type || layer.type;
    layer.shape = p.shape || layer.shape;
    layer.count = Math.max(0, Math.trunc(num(p.count, layer.count)));
    layer.spread = num(p.spread, layer.spread);
    layer.speed = num(p.speed, layer.speed);
    layer.shape_radius = num(p.shape_radius, layer.shape_radius);
    layer.shape_samples = Math.trunc(num(p.shape_samples, layer.shape_samples));
    layer.line_length = num(p.line_length, layer.line_length);
    layer.pillar_height = num(p.pillar_height, layer.pillar_height);
    layer.helix_turns = Math.trunc(num(p.helix_turns, layer.helix_turns));
    layer.spin_steps = Math.trunc(num(p.spin_steps, layer.spin_steps));
    layer.spin_delay_ticks = Math.trunc(num(p.spin_delay_ticks, layer.spin_delay_ticks));
    layer.pillar_layers = Math.trunc(num(p.pillar_layers, layer.pillar_layers));
    layer.taper = num(p.taper, layer.taper);
    layer.anchor = p.anchor || layer.anchor;
    layer.offset_right = num(p.offset_right, num(p.right, 0));
    layer.offset_up = num(p.offset_up, 0);
    layer.offset_forward = num(p.offset_forward, num(p.forward, 0));
    if (Math.abs(layer.offset_up) < 1e-6) layer.offset_up = num(p.up, layer.anchor === "feet" ? 0.08 : 0);
    layer.delay_ticks = Math.max(0, Math.trunc(num(delay, num(p.delay_ticks, 0))));
    layer.loop = !!p.loop || ["skill", "duration", "spell"].includes(String(p.loop_until || "").toLowerCase()) || String(p.lifetime_mode || "") === "looping";
    layer.loop_interval_ticks = Math.max(0, Math.trunc(num(p.loop_interval_ticks, 0)));
    layer.duration_ticks = Math.max(0, Math.trunc(num(p.duration_ticks, p.duration_seconds ? Number(p.duration_seconds) * 20 : 0)));
    layer.emitter = !!p.emitter || num(p.emit_rate, 0) > 0 || String(p.rate_mode || "") === "steady";
    layer.rate_mode = p.rate_mode || (layer.emitter ? "steady" : "instant");
    if (p.sprite) layer.sprite = String(p.sprite);
    if (p.tex_id) layer.tex_id = String(p.tex_id);
    if (p.tex_path) layer.tex_path = String(p.tex_path);
    if (p.uv_mode) layer.uv_mode = String(p.uv_mode);
    if (p.tex_w != null) layer.tex_w = num(p.tex_w, layer.tex_w);
    if (p.tex_h != null) layer.tex_h = num(p.tex_h, layer.tex_h);
    if (p.uv_x != null) layer.uv_x = num(p.uv_x, layer.uv_x);
    if (p.uv_y != null) layer.uv_y = num(p.uv_y, layer.uv_y);
    if (p.uv_w != null) layer.uv_w = num(p.uv_w, layer.uv_w);
    if (p.uv_h != null) layer.uv_h = num(p.uv_h, layer.uv_h);
    if (p.uv_step_x != null) layer.uv_step_x = num(p.uv_step_x, layer.uv_step_x);
    if (p.uv_step_y != null) layer.uv_step_y = num(p.uv_step_y, layer.uv_step_y);
    if (p.uv_fps != null) layer.uv_fps = num(p.uv_fps, layer.uv_fps);
    if (p.uv_max != null) layer.uv_max = Math.trunc(num(p.uv_max, layer.uv_max));
    if (p.uv_stretch != null) layer.uv_stretch = !!p.uv_stretch;
    if (p.uv_loop != null) layer.uv_loop = !!p.uv_loop;
    layer.emit_rate = num(p.emit_rate, p.rate != null ? p.rate : layer.emit_rate);
    layer.amount = Math.max(1, Math.trunc(num(p.amount, layer.amount)));
    layer.maximum = Math.max(1, Math.trunc(num(p.maximum, layer.maximum)));
    layer.lifetime_mode = p.lifetime_mode || (layer.loop ? "looping" : "once");
    layer.active_time = num(p.active_time, layer.active_time);
    layer.sleep_time = num(p.sleep_time, layer.sleep_time);
    layer.particle_lifetime_ticks = Math.max(1, Math.trunc(num(p.particle_lifetime_ticks, p.lifetime_ticks != null ? p.lifetime_ticks : layer.particle_lifetime_ticks)));
    layer.direction = p.direction || layer.direction;
    layer.surface_only = !!p.surface_only;
    layer.accel_x = num(p.accel_x, layer.accel_x);
    layer.accel_y = num(p.accel_y, layer.accel_y);
    layer.accel_z = num(p.accel_z, layer.accel_z);
    layer.gravity = num(p.gravity, layer.gravity);
    layer.drag = num(p.drag, layer.drag);
    layer.size = num(p.size, layer.size);
    layer.size_y = num(p.size_y, layer.size);
    layer.size_end = num(p.size_end, layer.size_end);
    layer.material = p.material || layer.material;
    layer.facing = p.facing || layer.facing;
    layer.lighting = !!p.lighting;
    if (p.color_mode) layer.color_mode = String(p.color_mode);
    if (p.color && typeof p.color === "object") {
      if (p.color.hex) layer.color_hex = String(p.color.hex);
      else layer.color_hex = rgbToHex(num(p.color.r, 1), num(p.color.g, 1), num(p.color.b, 1));
    } else if (typeof p.color === "string") {
      layer.color_hex = p.color;
    }
    if (Array.isArray(p.color_gradient) && p.color_gradient.length) {
      layer.gradient = p.color_gradient.map((s) => ({
        t: clamp01(num(s.t, 0)),
        hex: s.hex ? String(s.hex) : rgbToHex(num(s.r, 1), num(s.g, 1), num(s.b, 1)),
      }));
      layer.color_mode = "gradient";
    }
    if (p.gradient_range != null) layer.gradient_range = num(p.gradient_range, 1);
    if (p.gradient_interpolant) layer.gradient_interpolant = String(p.gradient_interpolant);
    layer.collision = !!p.collision;
    layer.bounce = num(p.bounce, layer.bounce);
    layer.expire_on_contact = !!p.expire_on_contact;
    if (p.material) layer.additive = String(p.material) === "particles_add";
    else layer.additive = p.additive !== false;
    layer.dir_x = num(p.dir_x, layer.dir_x);
    layer.dir_y = num(p.dir_y, layer.dir_y);
    layer.dir_z = num(p.dir_z, layer.dir_z);
    if (Array.isArray(p.points)) {
      layer.points = p.points.map((pt) => vec(num(pt.x, 0), num(pt.y, 0), num(pt.z, 0)));
      layer.closed = !!p.closed;
      if (!layer.shape || layer.shape === "point") layer.shape = "custom";
    }
    return layer;
  }

  function hexOfRgb(r, g, b) {
    const h = (n) => Math.max(0, Math.min(255, Math.round(n * 255))).toString(16).padStart(2, "0");
    return "#" + h(r) + h(g) + h(b);
  }

  function layerToEmitter(layer) {
    const shapeMap = {
      circle: "ring", circle_2d: "ring", disc: "disc", helix: "helix", spiral_up: "helix",
      cone: "cone", line_forward: "line", line_up: "line", sphere: "sphere", radius: "sphere",
      segmented_ring: "segmented_ring", concentric: "concentric", radial_burst: "radial_burst",
      arc: "arc", ribbon: "arc", curve: "curve", shockwave: "shockwave", rune: "rune", shard: "shard",
      torus: "torus", portal: "portal", spokes: "spokes", cluster: "cluster", box: "box",
      cube_edges: "cube_edges", cylinder: "cylinder", dome: "dome", pyramid: "pyramid",
      double_helix: "double_helix", tornado: "tornado", spiral_flat: "spiral_flat", pillar: "pillar",
      arch: "arch", zigzag: "zigzag", fountain: "fountain", star: "star", cross: "cross",
      polygon: "polygon", crescent: "crescent", flower: "flower", figure8: "figure8",
      galaxy: "galaxy", grid: "grid", wall: "wall", disc_vertical: "disc_vertical",
      ripple: "ripple", hourglass: "hourglass", octahedron: "octahedron", tetrahedron: "tetrahedron",
      lightning_bolt: "lightning_bolt", sky_beam: "sky_beam", meteor_path: "meteor_path",
      ground_crack: "ground_crack", breath: "breath", fork: "fork", chevron: "chevron", trefoil: "trefoil",
    };
    const motion = String(layer.motion_type || "orbit");
    return {
      name: layer.name || "Emitter",
      enabled: layer.enabled !== false,
      seed: Math.trunc(num(layer.seed, 1)),
      start_tick: Math.max(0, Math.trunc(num(layer.start_tick, 0))),
      emit_duration_ticks: Math.max(0, Math.trunc(num(layer.emit_duration_ticks, 0))),
      attachment: { point: layer.attach || "origin", x: num(layer.offset_x, 0), y: num(layer.offset_y, 0), z: num(layer.offset_z, 0) },
      shape: {
        type: shapeMap[layer.shape] || layer.shape || "sphere",
        particle_count: Math.max(1, Math.trunc(num(layer.count, 24))),
        radius: num(layer.shape_radius, 0.8),
        radius_start: num(layer.radius_start, num(layer.shape_radius, 0.8) * 0.25),
        radius_end: num(layer.radius_end, num(layer.shape_radius, 0.8)),
        height: num(layer.pillar_height, 2),
        turns: num(layer.helix_turns, 2),
        length: num(layer.line_length, 2.4),
        segments: Math.max(2, Math.trunc(num(layer.segments, 6))),
        gap: num(layer.gap, 0.22),
        rings: Math.max(1, Math.trunc(num(layer.rings, 3))),
        petals: Math.max(3, Math.trunc(num(layer.rune_petals, num(layer.flower_petals, 6)))),
        mark: layer.rune_mark || "star",
        spread: num(layer.arc_spread, 2.6),
        sides: Math.max(3, Math.trunc(num(layer.poly_sides, 5))),
        tube: num(layer.torus_tube, 0.28),
        arms: Math.max(2, Math.trunc(num(layer.galaxy_arms, 3))),
        box_x: num(layer.box_x, 0.5),
        box_y: num(layer.box_y, 0.4),
        box_z: num(layer.box_z, 0.5),
      },
      particle: {
        type: layer.type || "vaerun:emitter",
        sprite_style: layer.sprite_style || "glow",
        size: num(layer.size, 0.28),
        size_end: num(layer.size_end, num(layer.size, 0.28) * 0.75),
        size_var: num(layer.size_var, 0.18),
        lifetime: Math.max(4, Math.trunc(num(layer.lifetime_ticks, 30))),
        color_start: layer.color_start || hexOfRgb(num(layer.r, 0.7), num(layer.g, 0.55), num(layer.b, 1)),
        color_end: layer.color_end || hexOfRgb(num(layer.rEnd, 0.45), num(layer.gEnd, 0.7), num(layer.bEnd, 1)),
        tint: layer.tint !== false,
        blend: layer.blend || (layer.additive === false ? "translucent" : "add"),
        additive: layer.blend ? layer.blend === "add" : layer.additive !== false,
        spin: spriteSpinForLayer(layer, num(layer.spin, 0.04)),
        rotation: layerRotDeg(layer),
        flip_x: !!layer.flip_x,
        flip_y: !!layer.flip_y,
        trail: !!layer.trail,
        trail_len: Math.max(2, Math.trunc(num(layer.trail_len, 6))),
        texture: layer.tex_path || layer.tex_id || "",
        sprite: layer.sprite || "",
        collision: !!layer.collision,
        gravity: num(layer.gravity, 0),
        drag: num(layer.drag, 0),
        uv: {
          mode: layer.uv_mode || "animated",
          dir: sheetDirOf(layer),
          tex_w: Math.max(1, Math.trunc(num(layer.tex_w, 16))),
          tex_h: Math.max(1, Math.trunc(num(layer.tex_h, 16))),
          x: num(layer.uv_x, 0),
          y: num(layer.uv_y, 0),
          frame_w: Math.max(1, Math.trunc(num(layer.uv_w, 16))),
          frame_h: Math.max(1, Math.trunc(num(layer.uv_h, 16))),
          step_x: num(layer.uv_step_x, 16),
          step_y: num(layer.uv_step_y, 0),
          fps: Math.max(0, num(layer.uv_fps, 10)),
          frames: Math.max(1, Math.trunc(num(layer.uv_max, 1))),
          loop: layer.uv_loop !== false,
          stretch: !!layer.uv_stretch,
        },
      },
      motion: {
        type: motion,
        axis: layer.motion_axis || "y",
        degrees_per_tick: num(layer.degrees_per_tick, 12),
        speed: num(layer.speed, 0.12),
        gravity: num(layer.gravity, 0),
        drag: num(layer.drag, 0),
        amplitude: num(layer.wave_amp, 0.12),
        frequency: num(layer.wave_freq, 0.35),
        height: num(layer.pillar_height, 4),
        radius: num(layer.shape_radius, 0.8),
      },
      animation: {
        fade_in_ticks: Math.max(0, Math.trunc(num(layer.fade_in_ticks, 3))),
        fade_out_ticks: Math.max(0, Math.trunc(num(layer.fade_out_ticks, 8))),
        scale_curve: layer.scale_curve || "fade_in_out",
        alpha_curve: layer.alpha_curve || "fade_in_out",
        color_curve: layer.color_curve || "linear",
        speed_curve: layer.speed_curve || "linear",
      },
    };
  }

  function buildExportDoc() {
    const all = LE_PV.doc.layers || [];
    const emitters = all.filter(layerIsEmitter).map(layerToEmitter);
    const shapes = all.filter((l) => l.enabled && !layerIsEmitter(l));
    const doc = {};
    if (LE_PV.doc.projectile_trail) doc.projectile_trail = LE_PV.doc.projectile_trail;
    if (emitters.length) {
      let budget = 0;
      emitters.forEach((e) => { if (e.enabled !== false) budget += e.shape.particle_count || 0; });
      doc.kind = "emitter";
      doc.emitters = emitters;
      doc.performance = {
        max_particles: Math.max(1, Math.min(160, num(LE_PV.doc.max_particles, budget || 24))),
        duration_ticks: effectDurationTicks(),
      };
    }
    if (shapes.length) {
      if (!doc.kind) doc.kind = "shape";
      doc.program = layerToProgram(shapes[0]);
      if (shapes.length > 1) {
        doc.pulses = shapes.slice(1).map((l) => ({
          delay_ticks: l.delay_ticks || 0,
          program: layerToProgram(l),
        }));
      }
    }
    if (!doc.kind) {
      doc.kind = "shape";
      doc.program = {};
    }
    return doc;
  }

  function adoptClipAsEmitter(src) {
    const clipSrc = src || LE_PV.doc.clip || {};
    const c = clipSrc.color && typeof clipSrc.color === "object" ? clipSrc.color : clipSrc;
    const clip = String(clipSrc.clip || "hit").toLowerCase();
    const layer = newLayer("Burst", "emitter");
    layer.type = clipSrc.particle || "vaerun:hit_burst";
    layer.count = Math.max(1, Math.trunc(num(clipSrc.count, 8)));
    layer.size = num(clipSrc.scale, 1) * 0.35;
    layer.size_end = layer.size * 0.55;
    layer.lifetime_ticks = Math.max(4, Math.trunc(num(clipSrc.lifetime_ticks, 12)));
    layer.speed = Math.max(0.04, num(clipSrc.speed, 0.08));
    layer.shape_radius = Math.max(0.2, num(clipSrc.spread, 0.12) * 6);
    layer.color_start = hexOfRgb(num(c.r, 1), num(c.g, 0.7), num(c.b, 0.2));
    layer.color_end = "#FFFFFF";
    if (clip === "slash") {
      layer.name = "Slash";
      layer.shape = "arc";
      layer.motion_type = "burst";
      layer.sprite_style = "slash";
      layer.count = Math.max(layer.count, 18);
    } else if (clip === "trail") {
      layer.name = "Trail";
      layer.shape = "line_forward";
      layer.motion_type = "rise";
      layer.sprite_style = "spark";
    } else if (clip === "ring") {
      layer.name = "Ring";
      layer.shape = "circle";
      layer.motion_type = "expand";
      layer.sprite_style = "glow";
      layer.count = Math.max(layer.count, 24);
    } else {
      layer.name = "Hit";
      layer.shape = "sphere";
      layer.motion_type = "burst";
      layer.sprite_style = "glow";
    }
    LE_PV.doc.kind = "emitter";
    layer.role = "emitter";
    LE_PV.doc.layers = [layer];
    LE_PV.selected = 0;
    delete LE_PV.doc.clip;
  }

  function looksLike(root) {
    if (!root || typeof root !== "object" || Array.isArray(root)) return false;
    if (root.skill_id) return false;
    const k = String(root.kind || "").toLowerCase();
    if (k === "shape" || k === "clip" || k === "emitter" || k === "toolkit") return true;
    if (Array.isArray(root.emitters)) return true;
    if (root.program && typeof root.program === "object") return true;
    if (Array.isArray(root.layers)) return true;
    if (root.clip && root.particle) return true;
    if (root.cast_particles && typeof root.cast_particles === "object") return true;
    if (root.type && (root.shape != null || root.count != null || root.spread != null) && !root.execution) return true;
    return false;
  }

  function importFromAny(root) {
    if (!looksLike(root) && !(root && root.type && (root.shape || root.count))) return false;
    const src = root.execution && typeof root.execution === "object" ? root.execution : root;
    const k = String(src.kind || "").toLowerCase();
    if (k === "emitter" || k === "toolkit" || Array.isArray(src.emitters)) {
      LE_PV.doc.kind = "emitter";
      const emitters = Array.isArray(src.emitters) ? src.emitters : [src];
      LE_PV.doc.layers = emitters.map((em, i) => {
        const layer = newLayer("Emitter " + (i + 1), "emitter");
        const sh = em.shape || {};
        const mot = em.motion || {};
        const par = em.particle || {};
        const anim = em.animation || {};
        const att = em.attachment || {};
        layer.name = em.name || layer.name;
        layer.enabled = em.enabled !== false;
        layer.shape = sh.type === "ring" ? "circle" : (sh.type || "sphere");
        layer.count = num(sh.particle_count, num(sh.count, 24));
        layer.shape_radius = num(sh.radius, 0.8);
        layer.radius_start = num(sh.radius_start, layer.shape_radius * 0.25);
        layer.radius_end = num(sh.radius_end, layer.shape_radius);
        layer.pillar_height = num(sh.height, 2);
        layer.helix_turns = num(sh.turns, 2);
        layer.line_length = num(sh.length, 2.4);
        layer.segments = num(sh.segments, 6);
        layer.gap = num(sh.gap, 0.22);
        layer.rings = num(sh.rings, 3);
        layer.rune_petals = num(sh.petals, 6);
        layer.rune_mark = sh.mark || "star";
        layer.arc_spread = num(sh.spread, 2.6);
        layer.poly_sides = num(sh.sides, 5);
        layer.torus_tube = num(sh.tube, 0.28);
        layer.galaxy_arms = num(sh.arms, 3);
        layer.flower_petals = num(sh.petals, layer.rune_petals);
        layer.box_x = num(sh.box_x, layer.box_x);
        layer.box_y = num(sh.box_y, layer.box_y);
        layer.box_z = num(sh.box_z, layer.box_z);
        layer.type = par.type || "vaerun:emitter";
        layer.sprite_style = par.sprite_style || inferSpriteStyle(layer);
        layer.sprite = par.sprite || "";
        layer.tex_path = par.texture || par.tex_path || layer.tex_path || "";
        if (par.texture && String(par.texture).indexOf("snowstorm:") === 0) layer.tex_id = par.texture;
        layer.size = num(par.size, 0.28);
        layer.size_end = num(par.size_end, layer.size * 0.75);
        layer.size_var = num(par.size_var, 0.18);
        layer.lifetime_ticks = num(par.lifetime, 30);
        layer.color_start = par.color_start || "#70B8FF";
        layer.color_end = par.color_end || "#D9A6FF";
        layer.tint = par.tint !== false;
        layer.blend = par.blend || (par.additive === false ? "translucent" : "add");
        layer.additive = layer.blend === "add";
        layer.spin = num(par.spin, 0.04);
        layer.rot_deg = wrapRotDeg(par.rotation != null ? par.rotation : par.rot_deg);
        layer.rot_start = layerRotRad(layer);
        layer.flip_x = !!par.flip_x;
        layer.flip_y = !!par.flip_y;
        layer.trail = !!par.trail;
        layer.trail_len = num(par.trail_len, 6);
        layer.collision = !!par.collision;
        layer.gravity = num(par.gravity, num(mot.gravity, 0));
        layer.drag = num(par.drag, num(mot.drag, 0));
        layer.motion_type = mot.type || "orbit";
        layer.motion_axis = mot.axis || "y";
        layer.degrees_per_tick = num(mot.degrees_per_tick, 12);
        layer.speed = num(mot.speed, layer.speed);
        layer.wave_amp = num(mot.amplitude, 0.12);
        layer.wave_freq = num(mot.frequency, 0.35);
        if (mot.height != null) layer.pillar_height = num(mot.height, layer.pillar_height);
        if (mot.radius != null) layer.shape_radius = num(mot.radius, layer.shape_radius);
        if (par.uv && typeof par.uv === "object") {
          layer.uv_mode = par.uv.mode || "animated";
          layer.uv_dir = par.uv.dir || "left_right";
          layer.tex_w = num(par.uv.tex_w, layer.tex_w);
          layer.tex_h = num(par.uv.tex_h, layer.tex_h);
          layer.uv_x = num(par.uv.x, 0);
          layer.uv_y = num(par.uv.y, 0);
          layer.uv_w = num(par.uv.frame_w, layer.uv_w);
          layer.uv_h = num(par.uv.frame_h, layer.uv_h);
          layer.uv_step_x = num(par.uv.step_x, layer.uv_w);
          layer.uv_step_y = num(par.uv.step_y, 0);
          layer.uv_fps = num(par.uv.fps, 10);
          layer.uv_max = num(par.uv.frames, 1);
          layer.uv_loop = par.uv.loop !== false;
          layer.uv_stretch = !!par.uv.stretch;
        }
        layer.fade_in_ticks = num(anim.fade_in_ticks, 3);
        layer.fade_out_ticks = num(anim.fade_out_ticks, 8);
        layer.scale_curve = anim.scale_curve || "fade_in_out";
        layer.alpha_curve = anim.alpha_curve || "fade_in_out";
        layer.color_curve = anim.color_curve || "linear";
        layer.start_tick = num(em.start_tick, num(anim.start_tick, 0));
        layer.emit_duration_ticks = num(em.emit_duration_ticks, 0);
        layer.offset_x = num(att.x, 0);
        layer.offset_y = num(att.y, 0);
        layer.offset_z = num(att.z, 0);
        layer.attach = att.point || "origin";
        layer.seed = num(em.seed, 1);
        return layer;
      });
      if (src.performance && typeof src.performance === "object") {
        LE_PV.doc.max_particles = num(src.performance.max_particles, 80);
      }
      if (!LE_PV.doc.layers.length) LE_PV.doc.layers = [newLayer("Emitter 1", "emitter")];
      const extra = importShapeLayers(src, true);
      if (extra.length) LE_PV.doc.layers = LE_PV.doc.layers.concat(extra);
      LE_PV.doc.projectile_trail = src.projectile_trail || src.trail_particle || LE_PV.doc.projectile_trail || "";
      syncDocKind();
      LE_PV.selected = 0;
      renderInspector();
      replay();
      if (typeof window.leBuilderSession?.captureBaseline === "function" && !window.leBuilderSession.isRestoring()) {
        window.leBuilderSession.captureBaseline({ lane: "vfx" });
      }
      return true;
    }
    if (k === "clip" || (src.clip && src.particle && k !== "shape" && !src.program && !src.layers && !Array.isArray(src.emitters))) {
      adoptClipAsEmitter(src);
      renderInspector();
      replay();
      if (typeof window.leBuilderSession?.captureBaseline === "function" && !window.leBuilderSession.isRestoring()) {
        window.leBuilderSession.captureBaseline({ lane: "vfx" });
      }
      return true;
    }
    LE_PV.doc.projectile_trail = src.projectile_trail || src.trail_particle || "";
    const layers = importShapeLayers(src, false);
    LE_PV.doc.layers = layers.length ? layers : [newLayer("Shape 1", "shape")];
    LE_PV.selected = 0;
    syncDocKind();
    renderInspector();
    replay();
    if (typeof window.leBuilderSession?.captureBaseline === "function" && !window.leBuilderSession.isRestoring()) {
      window.leBuilderSession.captureBaseline({ lane: "vfx" });
    }
    return true;
  }

  function looksLikeShapeProgram(p) {
    if (!p || typeof p !== "object" || Array.isArray(p)) return false;
    if (Array.isArray(p.emitters) || p.particle || p.motion) return false;
    return p.type != null || p.shape != null || p.count != null || p.shape_radius != null;
  }

  function importShapeLayers(src, companionOnly) {
    const layers = [];
    if (!src || typeof src !== "object") return layers;
    if (!companionOnly && Array.isArray(src.layers)) {
      src.layers.forEach((el, i) => {
        const prog = el && el.program ? el.program : el;
        layers.push(programToLayer(prog, `Shape ${i + 1}`, el && el.delay_ticks));
      });
      return layers;
    }
    const program = looksLikeShapeProgram(src.program) ? src.program
      : (!companionOnly && src.cast_particles && looksLikeShapeProgram(src.cast_particles) ? src.cast_particles
        : (!companionOnly && src.type && !Array.isArray(src.emitters) ? src : null));
    if (program) layers.push(programToLayer(program, "Shape 1", 0));
    const pulses = src.pulses || src.cast_particle_pulses;
    if (Array.isArray(pulses)) {
      pulses.forEach((el) => {
        const prog = el && el.program ? el.program : el;
        layers.push(programToLayer(prog, `Shape ${layers.length + 1}`, el && el.delay_ticks));
      });
    }
    return layers;
  }

  function renderTree(nodes, filter) {
    const q = String(filter || "").trim().toLowerCase();
    let html = "";
    for (const n of nodes) {
      if (n.type === "dir") {
        const inner = renderTree(n.children, filter);
        if (q && !inner && !n.path.toLowerCase().includes(q)) continue;
        html += `<details open><summary>${esc(n.name)}</summary>${inner}</details>`;
      } else {
        if (q && !n.path.toLowerCase().includes(q)) continue;
        const on = LE_PV.currentPath === n.path ? " active" : "";
        html += `<button type="button" class="file${on}" data-pv-path="${esc(n.path)}">${esc(n.name)}</button>`;
      }
    }
    return html || (q ? "<p class='le-ss-empty'>No matching files.</p>" : "");
  }

  function paintTree() {
    const host = $("le_pv_tree");
    if (!host) return;
    if (!LE_PV.tree.length) {
      host.innerHTML = `<p class="le-ss-empty">Open <span class="mono">data/vaerun/skill_vfx_particles</span> (Chrome / Edge) to browse and save files in place.</p>`;
      return;
    }
    host.innerHTML = renderTree(LE_PV.tree, $("le_pv_tree_filter")?.value);
    host.querySelectorAll("[data-pv-path]").forEach((btn) => {
      btn.addEventListener("click", () => openPath(btn.getAttribute("data-pv-path")));
    });
    const title = $("le_pv_folder_name");
    if (title) title.textContent = LE_PV.folderName || "Folder";
  }

  const SKIP_DIRS = new Set([".git", "build", "node_modules", ".gradle", ".idea", "out", "bin", "classes", "generated", ".BACKUPS", "META-INF", "run", "logs", "tmp"]);
  const KEEP_FILE = /\.(json|png|jpe?g|webp|gif|mcmeta)$/i;
  const IMAGE_FILE = /\.(png|jpe?g|webp|gif)$/i;

  function skipDirName(name) {
    return SKIP_DIRS.has(name) || name.startsWith(".");
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
    for (const n of nodes) {
      if (n.path === path) return n;
      if (n.children) {
        const hit = findNode(n.children, path);
        if (hit) return hit;
      }
    }
    return null;
  }

  async function applyCustomImageFile(file) {
    if (!file || !window.leParticleSprites) return false;
    const img = await window.leParticleSprites.ingestFile(file);
    const layer = selectedLayer();
    if (!layer || !img) return false;
    const id = "custom:" + file.name.replace(/\.[^.]+$/, "").toLowerCase();
    window.leParticleSprites.setSheet(id, img);
    layer.tex_id = id;
    layer.tex_path = file.name;
    layer.sprite = "";
    layer.size_y = num(layer.size, 0.28);
    autoUvFromImage(layer, img);
    layer._frames = null;
    layer._frameKey = "";
    renderInspector();
    replay();
    setStatus(`Loaded texture ${file.name} (${img.width}×${img.height})`);
    return true;
  }

  async function openPath(path) {
    const node = findNode(LE_PV.tree, path);
    if (!node || node.type !== "file") return;
    try {
      const file = node.handle && node.handle.getFile ? await node.handle.getFile() : node.file;
      if (!file) return;
      if (IMAGE_FILE.test(node.name)) {
        await applyCustomImageFile(file);
        return;
      }
      if (!/\.json$/i.test(node.name)) {
        setStatus("Skipped " + node.name + " (not JSON or an image).");
        return;
      }
      const text = await file.text();
      await applyOpenedJson(text, node.handle || null, path);
      paintTree();
    } catch (e) {
      setStatus(e.message || String(e));
    }
  }

  async function applyOpenedJson(text, handle, path) {
    const json = JSON.parse(text);
    LE_PV.currentHandle = handle || null;
    LE_PV.currentPath = path || "";
    const fn = $("le_pv_filename");
    if (fn) fn.value = String(path || "opened.json").split("/").pop();
    importFromAny(json);
    setStatus(`Opened ${path || fn?.value || "file"}`);
  }

  async function openFilePicker() {
    if (window.showOpenFilePicker) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{ description: "VFX JSON", accept: { "application/json": [".json"] } }],
        });
        const handle = handles && handles[0];
        if (!handle) return;
        if (handle.requestPermission) {
          try { await handle.requestPermission({ mode: "readwrite" }); } catch (_) { /* read is enough to open */ }
        }
        const file = await handle.getFile();
        const text = await file.text();
        LE_PV.folderWritable = !!(handle.createWritable);
        await applyOpenedJson(text, handle, handle.name || file.name);
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    $("le_pv_file_fallback")?.click();
  }

  async function onFallbackFile(fileList) {
    const file = fileList && fileList[0];
    if (!file) return;
    try {
      const text = await file.text();
      LE_PV.folderWritable = false;
      await applyOpenedJson(text, null, file.name);
    } catch (e) {
      setStatus(e.message || String(e));
    }
  }

  async function openFolderPicker() {
    if (window.showDirectoryPicker) {
      try {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        LE_PV.folderHandle = handle;
        LE_PV.folderName = handle.name;
        LE_PV.folderWritable = true;
        LE_PV.fallbackFiles = null;
        LE_PV.tree = await walkDir(handle, "");
        paintTree();
        setStatus(`Opened folder ${handle.name}`);
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    $("le_pv_dir_fallback")?.click();
  }

  function onFallbackFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => KEEP_FILE.test(f.name) && !String(f.webkitRelativePath || "").split("/").some(skipDirName));
    if (!files.length) return;
    const root = files[0].webkitRelativePath.split("/")[0] || "folder";
    const rootMap = new Map();
    for (const file of files) {
      const rel = file.webkitRelativePath.replace(/^[^/]+\//, "");
      const parts = rel.split("/");
      const name = parts.pop();
      const dirMap = parts.length ? ensureDirInto(rootMap, parts) : rootMap;
      const path = rel;
      dirMap.set(name, { type: "file", name, path, file });
    }
    function ensureDirInto(map, parts) {
      let nodes = map;
      let prefix = "";
      for (const part of parts) {
        prefix = prefix ? prefix + "/" + part : part;
        if (!nodes.has(part)) nodes.set(part, { type: "dir", name: part, path: prefix, childrenMap: new Map() });
        nodes = nodes.get(part).childrenMap;
      }
      return nodes;
    }
    function flatten(map) {
      const dirs = [];
      const filesOut = [];
      for (const n of map.values()) {
        if (n.type === "dir") {
          n.children = flatten(n.childrenMap);
          if (n.children.length) dirs.push(n);
        } else filesOut.push(n);
      }
      dirs.sort((a, b) => a.name.localeCompare(b.name));
      filesOut.sort((a, b) => a.name.localeCompare(b.name));
      return [...dirs, ...filesOut];
    }
    LE_PV.folderHandle = null;
    LE_PV.folderWritable = false;
    LE_PV.folderName = root;
    LE_PV.fallbackFiles = files;
    LE_PV.tree = flatten(rootMap);
    paintTree();
    setStatus(`Loaded ${files.length} json/png files from ${root} (save downloads a copy).`);
  }

  function jsonFileName() {
    let name = ($("le_pv_filename")?.value || String(LE_PV.currentPath || "").split("/").pop() || "new_vfx.json").trim();
    if (!name) name = "new_vfx.json";
    if (!/\.json$/i.test(name)) name += ".json";
    return name;
  }

  function exportText() {
    return JSON.stringify(buildExportDoc(), null, 2) + "\n";
  }

  function jsonPanelOpen() {
    const panel = $("le_pv_json_panel");
    return !!(panel && !panel.classList.contains("hidden"));
  }

  function refreshJsonPanel() {
    const ta = $("le_pv_json");
    if (!ta || !jsonPanelOpen()) return;
    try {
      ta.value = exportText();
    } catch (e) {
      ta.value = "/* export failed: " + (e.message || e) + " */\n";
    }
  }

  function showJsonPanel(show) {
    const panel = $("le_pv_json_panel");
    const btn = $("le_pv_json_btn");
    if (!panel) return;
    const on = show == null ? panel.classList.contains("hidden") : !!show;
    panel.classList.toggle("hidden", !on);
    btn?.classList.toggle("on", on);
    if (on) {
      const ta = $("le_pv_json");
      try {
        if (ta) ta.value = exportText();
      } catch (e) {
        if (ta) ta.value = "/* export failed: " + (e.message || e) + " */\n";
      }
    }
  }

  function downloadTextFile(text, name) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function copyExportText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      try {
        const ta = $("le_pv_json") || document.createElement("textarea");
        const created = !ta.id;
        if (created) {
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
        }
        const prev = created ? "" : ta.value;
        ta.value = text;
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        if (created) ta.remove();
        else if (!jsonPanelOpen()) ta.value = prev;
        return ok;
      } catch (_) {
        return false;
      }
    }
  }

  async function saveAsPicker(text, name) {
    if (!window.showSaveFilePicker) return false;
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: "VFX JSON", accept: { "application/json": [".json"] } }],
      });
      const w = await handle.createWritable();
      await w.write(text);
      await w.close();
      LE_PV.currentHandle = handle;
      LE_PV.currentPath = handle.name || name;
      const fn = $("le_pv_filename");
      if (fn) fn.value = LE_PV.currentPath;
      return true;
    } catch (e) {
      if (e && e.name === "AbortError") return "abort";
      return false;
    }
  }

  async function saveCurrent() {
    let text;
    try {
      text = exportText();
    } catch (e) {
      setStatus("Cannot export: " + (e.message || e));
      showJsonPanel(true);
      return;
    }
    if (jsonPanelOpen()) {
      const ta = $("le_pv_json");
      if (ta) ta.value = text;
    }
    const name = jsonFileName();
    if (LE_PV.currentHandle && LE_PV.currentHandle.createWritable) {
      try {
        if (LE_PV.currentHandle.requestPermission) {
          try { await LE_PV.currentHandle.requestPermission({ mode: "readwrite" }); } catch (_) {}
        }
        const w = await LE_PV.currentHandle.createWritable();
        await w.write(text);
        await w.close();
        setStatus("Saved " + (LE_PV.currentPath || name));
        if (typeof window.leBuilderSession?.markSaved === "function") window.leBuilderSession.markSaved();
        return;
      } catch (_) {
        /* File handle may be read-only after Open file — fall through. */
      }
    }
    const picked = await saveAsPicker(text, name);
    if (picked === true) {
      setStatus("Saved " + (LE_PV.currentPath || name));
      if (typeof window.leBuilderSession?.markSaved === "function") window.leBuilderSession.markSaved();
      return;
    }
    if (picked === "abort") {
      setStatus("Save cancelled — JSON panel has the current file.");
      showJsonPanel(true);
      return;
    }
    downloadTextFile(text, name);
    showJsonPanel(true);
    setStatus("Downloaded " + name + ". If nothing appeared, copy from JSON below.");
    if (typeof window.leBuilderSession?.markSaved === "function") window.leBuilderSession.markSaved();
  }

  async function newFileInFolder() {
    const path = window.prompt("Path inside the opened folder", "sorcerer/new_shape.json");
    if (!path) return;
    const clean = path.replace(/^\/+/, "").replace(/\\/g, "/");
    if (!LE_PV.folderHandle || !LE_PV.folderWritable) {
      LE_PV.doc = emptyDoc();
      LE_PV.currentPath = clean;
      LE_PV.currentHandle = null;
      const fn = $("le_pv_filename");
      if (fn) fn.value = clean.split("/").pop();
      renderInspector();
      replay();
      setStatus("New shape (folder not writable here — use Save / Download).");
      return;
    }
    const parts = clean.split("/");
    const fileName = parts.pop();
    let dir = LE_PV.folderHandle;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    LE_PV.doc = emptyDoc();
    LE_PV.currentHandle = fileHandle;
    LE_PV.currentPath = clean;
    const fn = $("le_pv_filename");
    if (fn) fn.value = fileName;
    const w = await fileHandle.createWritable();
    await w.write(JSON.stringify(buildExportDoc(), null, 2));
    await w.close();
    LE_PV.tree = await walkDir(LE_PV.folderHandle, "");
    paintTree();
    renderInspector();
    replay();
    setStatus(`Created ${clean}`);
  }

  function bindCanvas() {
    const canvas = $("le_pv_canvas");
    if (!canvas || canvas.dataset.lePvBound === "1") return;
    canvas.dataset.lePvBound = "1";
    canvas.addEventListener("pointerdown", (e) => {
      if (e.target !== canvas) return;
      LE_PV.drag = true;
      LE_PV.moved = false;
      LE_PV.lastX = e.clientX;
      LE_PV.lastY = e.clientY;
      LE_PV.dragMode = e.button === 2 || e.button === 1 || e.shiftKey || e.altKey ? "pan" : "orbit";
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!LE_PV.drag) return;
      const dx = e.clientX - LE_PV.lastX;
      const dy = e.clientY - LE_PV.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) LE_PV.moved = true;
      if (!LE_PV.moved) return;
      LE_PV.lastX = e.clientX;
      LE_PV.lastY = e.clientY;
      if (LE_PV.dragMode === "pan") {
        const speed = LE_PV.dist * 0.0028;
        LE_PV.panX -= dx * speed * Math.cos(LE_PV.yaw);
        LE_PV.panZ -= dx * speed * Math.sin(LE_PV.yaw);
        LE_PV.panY += dy * speed;
      } else {
        LE_PV.yaw += dx * 0.008;
        LE_PV.pitch = Math.max(-1.35, Math.min(1.35, LE_PV.pitch + dy * 0.008));
      }
      canvas.classList.add("le-pv-drag");
      paint();
    });
    const endDrag = (e) => {
      const wasClick = LE_PV.drag && !LE_PV.moved;
      const btn = e.button;
      LE_PV.drag = false;
      canvas.classList.remove("le-pv-drag");
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
      if (wasClick && btn === 0 && LE_PV.tool !== "orbit") onCanvasClick(e.clientX, e.clientY);
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      LE_PV.dist = Math.max(3, Math.min(36, LE_PV.dist * (e.deltaY > 0 ? 1.08 : 0.92)));
      paint();
    }, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function ensureInit() {
    const inStudio = typeof isParticleStudioMode !== "function" || isParticleStudioMode();
    const restored = inStudio && restoreStudioFromPreview();
    bindCanvas();
    resizeCanvas();
    if (!LE_PV.inited) {
      LE_PV.inited = true;
      $("le_pv_open_folder")?.addEventListener("click", () => openFolderPicker());
      $("le_pv_open_file")?.addEventListener("click", () => openFilePicker());
      $("le_pv_dir_fallback")?.addEventListener("change", (e) => onFallbackFiles(e.target.files));
      $("le_pv_file_fallback")?.addEventListener("change", (e) => {
        onFallbackFile(e.target.files);
        e.target.value = "";
      });
      $("le_pv_tree_filter")?.addEventListener("input", () => paintTree());
      $("le_pv_save")?.addEventListener("click", () => saveCurrent());
      $("le_pv_json_btn")?.addEventListener("click", () => showJsonPanel());
      $("le_pv_json_close")?.addEventListener("click", () => showJsonPanel(false));
      $("le_pv_json_refresh")?.addEventListener("click", () => {
        showJsonPanel(true);
        setStatus("JSON refreshed.");
      });
      $("le_pv_json_copy")?.addEventListener("click", async () => {
        showJsonPanel(true);
        let text;
        try { text = exportText(); } catch (e) {
          setStatus("Cannot export: " + (e.message || e));
          return;
        }
        const ta = $("le_pv_json");
        if (ta) ta.value = text;
        const ok = await copyExportText(text);
        setStatus(ok ? "Copied JSON." : "Copy failed — select the JSON text and copy it yourself.");
      });
      $("le_pv_json_download")?.addEventListener("click", () => {
        showJsonPanel(true);
        try {
          const text = exportText();
          const ta = $("le_pv_json");
          if (ta) ta.value = text;
          const name = jsonFileName();
          downloadTextFile(text, name);
          setStatus("Downloaded " + name);
        } catch (e) {
          setStatus("Cannot export: " + (e.message || e));
        }
      });
      $("le_pv_new")?.addEventListener("click", () => newFileInFolder());
      $("le_pv_replay")?.addEventListener("click", () => replay());
      $("le_pv_preview_loop")?.addEventListener("change", () => {
        LE_PV.previewLoop = $("le_pv_preview_loop").value || "auto";
        replay();
      });
      const bindToggle = (id, key) => {
        $(id)?.addEventListener("click", () => {
          LE_PV[key] = !LE_PV[key];
          $(id).classList.toggle("on", LE_PV[key]);
          paint();
        });
      };
      bindToggle("le_pv_toggle_grid", "showGrid");
      bindToggle("le_pv_toggle_axis", "showAxis");
      bindToggle("le_pv_toggle_block", "showBlock");
      bindToggle("le_pv_toggle_you", "showYou");
      bindToggle("le_pv_toggle_arrow", "showArrow");
      bindToggle("le_pv_toggle_mob", "showMob");
      bindToggle("le_pv_toggle_origin", "showOrigin");
      $("le_pv_toggle_helpers")?.addEventListener("click", () => {
        LE_PV.showHelpers = !LE_PV.showHelpers;
        $("le_pv_toggle_helpers").classList.toggle("on", LE_PV.showHelpers);
        paint();
      });
      $("le_pv_scrub")?.addEventListener("input", () => {
        const t = Math.max(0, Math.trunc(num($("le_pv_scrub").value, 0)));
        setPaused(true);
        simulateTo(t);
        paint();
      });
      $("le_pv_load_tex")?.addEventListener("click", async () => {
        if (window.showDirectoryPicker) {
          try {
            const dir = await window.showDirectoryPicker({ mode: "read" });
            const files = [];
            async function walk(handle) {
              for await (const [name, h] of handle.entries()) {
                if (h.kind === "directory") {
                  if (!skipDirName(name)) await walk(h);
                } else if (IMAGE_FILE.test(name)) files.push(await h.getFile());
              }
            }
            await walk(dir);
            const n = await window.leParticleSprites.loadFromFiles(files);
            setStatus(`Loaded ${n} particle textures from ${dir.name}`);
            replay();
            return;
          } catch (e) {
            if (e && e.name === "AbortError") return;
          }
        }
        $("le_pv_tex_fallback")?.click();
      });
      $("le_pv_tex_fallback")?.addEventListener("change", async (e) => {
        const n = await window.leParticleSprites.loadFromFiles(e.target.files);
        setStatus(`Loaded ${n} particle textures`);
        if (LE_PV.inspectTab === "texture") renderInspector();
        replay();
      });
      $("le_pv_strip")?.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !window.leParticleSprites) return;
        await applyCustomImageFile(file);
        e.target.value = "";
      });
      $("le_pv_load_jar")?.addEventListener("click", () => $("le_pv_jar")?.click());
      $("le_pv_jar")?.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const n = await window.leParticleSprites.loadFromZip(file);
          setStatus(`Loaded ${n} vanilla particle sheets from ${file.name}`);
          replay();
        } catch (err) {
          setStatus(err.message || String(err));
        }
      });
      if (window.leParticleSprites) {
        window.leParticleSprites.init().then(() => replay());
      }
      $("le_pv_pause")?.addEventListener("click", () => setPaused(!LE_PV.paused));
      document.querySelectorAll("[data-pv-tool]").forEach((btn) => {
        btn.addEventListener("click", () => setTool(btn.getAttribute("data-pv-tool")));
      });
      $("le_pv_kind")?.addEventListener("change", () => {
        const L = selectedLayer();
        const v = $("le_pv_kind").value === "shape" ? "shape" : "emitter";
        if (L) {
          L.role = v;
          if (v === "shape") {
            if (/^emitter/i.test(L.name || "")) L.name = (L.name || "Emitter").replace(/^emitter/i, "Shape");
            if (!L.type || L.type === "vaerun:emitter") L.type = "minecraft:flame";
            LE_PV.inspectTab = "setup";
          } else {
            if (/^shape/i.test(L.name || "")) L.name = (L.name || "Shape").replace(/^shape/i, "Emitter");
            if (!L.type || String(L.type).indexOf("minecraft:") === 0) L.type = "vaerun:emitter";
            LE_PV.inspectTab = "look";
          }
        }
        syncDocKind();
        renderInspector();
        replay();
      });
      $("le_pv_add_layer")?.addEventListener("click", () => {
        LE_PV.doc.layers.push(newLayer("Emitter " + (LE_PV.doc.layers.length + 1), "emitter"));
        LE_PV.selected = LE_PV.doc.layers.length - 1;
        LE_PV.inspectTab = "look";
        syncDocKind();
        setTool("orbit");
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      $("le_pv_add_shape")?.addEventListener("click", () => {
        LE_PV.doc.layers.push(newLayer("Shape " + (LE_PV.doc.layers.length + 1), "shape"));
        LE_PV.selected = LE_PV.doc.layers.length - 1;
        LE_PV.inspectTab = "setup";
        syncDocKind();
        setTool("place");
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      $("le_pv_dup_layer")?.addEventListener("click", () => {
        const src = selectedLayer();
        if (!src) return;
        const copy = JSON.parse(JSON.stringify(src));
        copy.name = (src.name || "Emitter") + " copy";
        delete copy._frames;
        delete copy._frameKey;
        LE_PV.doc.layers.splice(LE_PV.selected + 1, 0, copy);
        LE_PV.selected += 1;
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      $("le_pv_layer_up")?.addEventListener("click", () => {
        if (LE_PV.selected <= 0) return;
        const i = LE_PV.selected;
        const a = LE_PV.doc.layers;
        [a[i - 1], a[i]] = [a[i], a[i - 1]];
        LE_PV.selected = i - 1;
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      $("le_pv_layer_down")?.addEventListener("click", () => {
        const a = LE_PV.doc.layers;
        if (LE_PV.selected >= a.length - 1) return;
        const i = LE_PV.selected;
        [a[i + 1], a[i]] = [a[i], a[i + 1]];
        LE_PV.selected = i + 1;
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      $("le_pv_del_layer")?.addEventListener("click", () => {
        if (LE_PV.doc.layers.length <= 1) {
          const keep = layerIsEmitter(LE_PV.doc.layers[0]) ? "emitter" : "shape";
          LE_PV.doc.layers[0] = newLayer(keep === "emitter" ? "Emitter 1" : "Shape 1", keep);
        } else {
          LE_PV.doc.layers.splice(LE_PV.selected, 1);
          LE_PV.selected = Math.max(0, LE_PV.selected - 1);
        }
        syncDocKind();
        renderInspector();
        replay();
        noteVfx({ immediate: true });
      });
      document.querySelectorAll("[data-pv-preset]").forEach((btn) => {
        btn.addEventListener("click", () => applyPreset(btn.getAttribute("data-pv-preset")));
      });
      window.addEventListener("keydown", (e) => {
        if (typeof isParticleStudioMode === "function" && !isParticleStudioMode()) return;
        const tag = String(document.activeElement?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (e.code === "Space") {
          e.preventDefault();
          setPaused(!LE_PV.paused);
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          replay();
        } else if (e.key === "Escape") {
          setTool("orbit");
        } else if (e.key === "Delete" || e.key === "Backspace") {
          const layer = selectedLayer();
          if (layer && layer.points && layer.points.length) {
            e.preventDefault();
            layer.points.pop();
            layer.closed = false;
            setStatus(`Removed last point (${layer.points.length} left)`);
            renderInspector();
            replay();
          }
        }
      });
      window.addEventListener("resize", () => {
        if (typeof isParticleStudioMode === "function" && !isParticleStudioMode()) return;
        resizeCanvas();
        paint();
      });
      renderInspector();
      paintTree();
      setTool("orbit");
      replay();
    } else if (restored) {
      renderInspector();
      replay();
    }
    resizeCanvas();
    requestAnimationFrame(() => {
      resizeCanvas();
      paint();
    });
    if (!LE_PV.raf) LE_PV.raf = requestAnimationFrame(loop);
    paint();
  }

  function applyPreset(id) {
    const tk = (name, extra) => Object.assign(newLayer(name), extra);
    const presets = {
      ice_ring: { kind: "emitter", layers: [
        tk("Outer ring", { shape: "circle", count: 48, shape_radius: 4, motion_type: "orbit", degrees_per_tick: 4, color_start: "#70B8FF", color_end: "#E8FBFF", type: "vaerun:emitter", sprite_style: "glow", size: 0.32, alpha_curve: "pulse" }),
        tk("Inner ring", { shape: "circle", count: 24, shape_radius: 3.15, motion_type: "orbit", degrees_per_tick: -6, color_start: "#D9F4FF", color_end: "#FFFFFF", type: "vaerun:emitter", sprite_style: "spark", size: 0.28 }),
      ] },
      orbital: { kind: "emitter", layers: [tk("Orb", { shape: "sphere", count: 40, shape_radius: 1.1, motion_type: "orbit", degrees_per_tick: 10, color_start: "#B07CFF", color_end: "#50D8FF", type: "vaerun:emitter", sprite_style: "glow", size: 0.3 })] },
      fire_burst: { kind: "emitter", layers: [tk("Burst", { shape: "sphere", count: 36, shape_radius: 0.45, motion_type: "burst", speed: 0.22, color_start: "#FF7A2A", color_end: "#FFD080", type: "vaerun:emitter", sprite_style: "glow", size: 0.38, lifetime_ticks: 18, trail: true })] },
      slash: { kind: "emitter", layers: [tk("Slash", { shape: "arc", count: 28, shape_radius: 1.2, pillar_height: 0.55, motion_type: "burst", speed: 0.14, color_start: "#FFE9A8", color_end: "#FFFFFF", type: "vaerun:emitter", sprite_style: "slash", size: 0.34, lifetime_ticks: 12 })] },
      meteor: { kind: "emitter", layers: [tk("Impact", { shape: "shockwave", count: 40, shape_radius: 2.4, motion_type: "expand", speed: 0.12, color_start: "#FF6A20", color_end: "#FFC14A", type: "vaerun:emitter", sprite_style: "glow", size: 0.4, lifetime_ticks: 20 })] },
      holy: { kind: "emitter", layers: [tk("Holy ring", { shape: "circle", count: 36, shape_radius: 1.8, motion_type: "orbit", degrees_per_tick: 5, color_start: "#FFE9A0", color_end: "#FFFFFF", type: "vaerun:emitter", sprite_style: "glow", size: 0.3, alpha_curve: "pulse" })] },
      spark_line: { kind: "emitter", layers: [tk("Line", { shape: "line_forward", count: 24, line_length: 2.8, pillar_height: 2.8, motion_type: "rise", speed: 0.06, color_start: "#7EE0FF", color_end: "#FFFFFF", type: "vaerun:emitter", sprite_style: "spark", size: 0.26 })] },
      flame_pillar: { kind: "emitter", layers: [tk("Helix", { shape: "helix", count: 40, shape_radius: 0.85, pillar_height: 3.6, helix_turns: 3, motion_type: "orbit", degrees_per_tick: 9, color_start: "#FF7A2A", color_end: "#FFD080", type: "vaerun:emitter", sprite_style: "glow", size: 0.32 })] },
      arcane_rune: { kind: "emitter", layers: [
        tk("Inner ring", { shape: "circle", count: 28, shape_radius: 1.15, motion_type: "orbit", degrees_per_tick: 5, color_start: "#7B5CFF", color_end: "#E4D7FF", sprite_style: "glow", size: 0.26, alpha_curve: "pulse", scale_curve: "pulse" }),
        tk("Outer segments", { shape: "segmented_ring", count: 36, shape_radius: 1.85, segments: 8, gap: 0.28, motion_type: "orbit", degrees_per_tick: -3.5, color_start: "#C9A6FF", color_end: "#FFFFFF", sprite_style: "rune", size: 0.3, blend: "add" }),
        tk("Rune marks", { shape: "rune", count: 24, shape_radius: 1.5, rune_petals: 6, rune_mark: "star", motion_type: "orbit", degrees_per_tick: 2, color_start: "#F4E6C0", color_end: "#B07CFF", sprite_style: "rune", size: 0.22, blend: "translucent" }),
        tk("Core", { shape: "sphere", count: 8, shape_radius: 0.18, motion_type: "orbit", degrees_per_tick: 14, color_start: "#FFFFFF", color_end: "#C9A6FF", sprite_style: "core", size: 0.55, offset_y: 0.2, alpha_curve: "pulse", scale_curve: "pulse" }),
        tk("Sparks", { shape: "disc", count: 18, shape_radius: 0.7, motion_type: "rise", speed: 0.05, color_start: "#E4D7FF", color_end: "#7B5CFF", sprite_style: "spark", size: 0.16, size_var: 0.4, start_tick: 6, lifetime_ticks: 22 }),
      ] },
      fireball: { kind: "emitter", layers: [
        tk("Core", { shape: "sphere", count: 5, shape_radius: 0.12, motion_type: "spin_cw", degrees_per_tick: 14, color_start: "#FFF3C0", color_end: "#FF7A2A", sprite_style: "core", size: 0.52, offset_y: 0 }),
        tk("Embers", { shape: "sphere", count: 7, shape_radius: 0.22, motion_type: "spin_cw", degrees_per_tick: 10, color_start: "#FF7A2A", color_end: "#FFD080", sprite_style: "glow", size: 0.22, size_var: 0.22, lifetime_ticks: 16 }),
      ] },
      ice_shatter: { kind: "emitter", layers: [
        tk("Core", { shape: "sphere", count: 8, shape_radius: 0.16, motion_type: "orbit", degrees_per_tick: 10, color_start: "#E8FBFF", color_end: "#70B8FF", sprite_style: "core", size: 0.48, offset_y: 0.7 }),
        tk("Shards", { shape: "shard", count: 22, shape_radius: 0.7, motion_type: "burst", speed: 0.2, color_start: "#BFDFFF", color_end: "#FFFFFF", sprite_style: "shard", size: 0.36, size_var: 0.35, spin: 0.16, lifetime_ticks: 18, blend: "translucent" }),
        tk("Fragments", { shape: "radial_burst", count: 16, shape_radius: 0.45, motion_type: "burst", speed: 0.14, color_start: "#70B8FF", color_end: "#D9F4FF", sprite_style: "shard", size: 0.22, spin: 0.22, lifetime_ticks: 16, start_tick: 3 }),
        tk("Motes", { shape: "sphere", count: 14, shape_radius: 0.85, motion_type: "rise", speed: 0.03, color_start: "#E8FBFF", color_end: "#9AD8FF", sprite_style: "mote", size: 0.14, size_var: 0.4, lifetime_ticks: 24, start_tick: 6, alpha_curve: "fade_in_out" }),
      ] },
      arcane_vortex: { kind: "emitter", layers: [
        tk("Spiral A", { shape: "helix", count: 28, shape_radius: 1.05, radius_start: 0.25, radius_end: 1.05, pillar_height: 2.4, helix_turns: 2.5, motion_type: "orbit", degrees_per_tick: 8, color_start: "#7B5CFF", color_end: "#50D8FF", sprite_style: "glow", size: 0.26 }),
        tk("Spiral B", { shape: "helix", count: 24, shape_radius: 0.85, radius_start: 0.9, radius_end: 0.35, pillar_height: 2.2, helix_turns: 2.2, motion_type: "orbit", degrees_per_tick: -6, color_start: "#C9A6FF", color_end: "#FFFFFF", sprite_style: "spark", size: 0.2, start_tick: 4 }),
        tk("Core", { shape: "sphere", count: 10, shape_radius: 0.2, motion_type: "orbit", degrees_per_tick: 18, color_start: "#FFFFFF", color_end: "#B07CFF", sprite_style: "core", size: 0.5, offset_y: 1.1, alpha_curve: "pulse" }),
        tk("Floaters", { shape: "sphere", count: 16, shape_radius: 1.2, motion_type: "wave", degrees_per_tick: 3, speed: 0.02, color_start: "#50D8FF", color_end: "#7B5CFF", sprite_style: "mote", size: 0.16, size_var: 0.45, start_tick: 8, emit_duration_ticks: 40 }),
      ] },
      ground_shock: { kind: "emitter", layers: [
        tk("Ring", { shape: "shockwave", count: 32, shape_radius: 0.55, motion_type: "expand", speed: 0.16, color_start: "#E8C36A", color_end: "#8A5A20", sprite_style: "glow", size: 0.32, lifetime_ticks: 16, alpha_curve: "fade_in_out", scale_curve: "smooth" }),
        tk("Burst", { shape: "radial_burst", count: 20, shape_radius: 0.4, motion_type: "burst", speed: 0.18, color_start: "#FFE9A0", color_end: "#C48A3A", sprite_style: "spark", size: 0.2, size_var: 0.4, lifetime_ticks: 12, start_tick: 2 }),
        tk("Sparks", { shape: "disc", count: 14, shape_radius: 0.9, motion_type: "rise", speed: 0.07, color_start: "#FFF3C0", color_end: "#FFB040", sprite_style: "spark", size: 0.14, lifetime_ticks: 10, start_tick: 4, alpha_curve: "flicker" }),
      ] },
    };
    const p = presets[id];
    if (!p) return;
    const asPreview = typeof isParticleStudioMode === "function" && !isParticleStudioMode();
    if (asPreview && !LE_PV.previewBak) {
      LE_PV.previewBak = { doc: LE_PV.doc, selected: LE_PV.selected };
    } else if (!asPreview) {
      LE_PV.previewBak = null;
    }
    LE_PV.doc.kind = p.kind || "emitter";
    LE_PV.doc.projectile_trail = "";
    LE_PV.doc.layers = p.layers;
    LE_PV.selected = 0;
    if (asPreview) {
      rebuildParticles();
      return;
    }
    renderInspector();
    replay();
    noteVfx({ immediate: true });
  }

  function restoreStudioFromPreview() {
    if (!LE_PV.previewBak) return false;
    LE_PV.doc = LE_PV.previewBak.doc;
    LE_PV.selected = LE_PV.previewBak.selected || 0;
    LE_PV.previewBak = null;
    return true;
  }

  window.leParticleStudioInit = ensureInit;
  window.leParticleStudioExport = buildExportDoc;
  window.leParticleStudioSave = saveCurrent;
  window.leParticleStudioHasHandle = function () {
    return !!(LE_PV.currentHandle && LE_PV.currentHandle.createWritable);
  };
  window.leParticleStudioImport = importFromAny;
  window.leParticleStudioLooksLike = looksLike;
  window.leParticleStudioApplyPreset = applyPreset;
  window.leParticleStudioSetPaused = setPaused;
  window.leParticleStudioReplay = replay;
  window.leParticleStudioPresetForToolkit = function (id) {
    const s = String(id || "").toLowerCase();
    if (s.indexOf("arcane_rune") >= 0 || s.indexOf("rune_circle") >= 0) return "arcane_rune";
    if (s.indexOf("fireball") >= 0) return "fireball";
    if (s.indexOf("ice_shatter") >= 0) return "ice_shatter";
    if (s.indexOf("arcane_vortex") >= 0 || s.indexOf("arcane_spiral") >= 0) return "arcane_vortex";
    if (s.indexOf("ground_shock") >= 0 || s.indexOf("shockwave") >= 0) return "ground_shock";
    if (s.indexOf("ice_circle") >= 0 || s.indexOf("ice_ring") >= 0) return "ice_ring";
    if (s.indexOf("ice") >= 0) return "ice_ring";
    if (s.indexOf("holy") >= 0 || s.indexOf("heal") >= 0) return "holy";
    if (s.indexOf("orbital") >= 0 || s.indexOf("arcane") >= 0) return "orbital";
    if (s.indexOf("slash") >= 0) return "slash";
    if (s.indexOf("meteor") >= 0) return "meteor";
    if (s.indexOf("pillar") >= 0 || s.indexOf("helix") >= 0) return "flame_pillar";
    if (s.indexOf("arrow") >= 0 || s.indexOf("line") >= 0) return "spark_line";
    if (s.indexOf("fire_circle") >= 0) return "meteor";
    return "fire_burst";
  };
  window.leParticleStudioPaintWorld = function (canvas, cam) {
    if (!canvas) return;
    const bak = {
      yaw: LE_PV.yaw, pitch: LE_PV.pitch, dist: LE_PV.dist,
      panX: LE_PV.panX, panY: LE_PV.panY, panZ: LE_PV.panZ,
    };
    if (cam) {
      LE_PV.yaw = cam.yaw;
      LE_PV.pitch = cam.pitch;
      LE_PV.dist = cam.dist;
      LE_PV.panX = cam.panX || 0;
      LE_PV.panY = cam.panY == null ? 1.15 : cam.panY;
      LE_PV.panZ = cam.panZ || 0;
    }
    paint(canvas, { world: true, tick: true });
    LE_PV.yaw = bak.yaw;
    LE_PV.pitch = bak.pitch;
    LE_PV.dist = bak.dist;
    LE_PV.panX = bak.panX;
    LE_PV.panY = bak.panY;
    LE_PV.panZ = bak.panZ;
  };
})();
