/* Vaerun skill-flow studio chrome: kit, recipes, dock preview, tabs. */
(function () {
  "use strict";

  const VFX_LIB = [
    { id: "vaerun:toolkit/fire_burst", name: "fire_particle", swatch: "#ff7a2a" },
    { id: "vaerun:toolkit/ice_burst", name: "ice_particle", swatch: "#7ecbff" },
    { id: "vaerun:toolkit/holy_ring", name: "heal_particle", swatch: "#c6f08a" },
    { id: "vaerun:toolkit/ice_circle", name: "ice_circle", swatch: "#9ad8ff" },
    { id: "vaerun:toolkit/fire_circle", name: "fire_circle", swatch: "#ffb040" },
    { id: "vaerun:toolkit/slash_burst", name: "slash_burst", swatch: "#ffe08a" },
    { id: "vaerun:toolkit/meteor_impact", name: "meteor_impact", swatch: "#ff6b3d" },
    { id: "vaerun:toolkit/arrow_rain", name: "arrow_rain", swatch: "#d7e6ff" },
    { id: "vaerun:toolkit/flame_pillar", name: "flame_pillar", swatch: "#ff8a3a" },
    { id: "vaerun:toolkit/arcane_spiral", name: "arcane_spiral", swatch: "#b08cff" },
    { id: "vaerun:toolkit/orbital_sphere", name: "orbital_sphere", swatch: "#7ee0ff" },
    { id: "vaerun:toolkit/arcane_rune_circle", name: "arcane_rune_circle", swatch: "#c9a6ff" },
    { id: "vaerun:toolkit/fireball", name: "fireball", swatch: "#ff7a2a" },
    { id: "vaerun:toolkit/ice_shatter", name: "ice_shatter", swatch: "#bfdfff" },
    { id: "vaerun:toolkit/arcane_vortex", name: "arcane_vortex", swatch: "#7b5cff" },
    { id: "vaerun:toolkit/ground_shockwave", name: "ground_shockwave", swatch: "#e8c36a" },
  ];

  const RECIPES = [
    { id: "bolt", name: "Fire Bolt", sub: "Cast → Particle → Sound → Projectile", icon: "🔥" },
    { id: "channel", name: "Channel", sub: "hold + replay until channel ends", icon: "⏳" },
    { id: "arrow_rain", name: "Arrow Rain", sub: "skyfall arrows — set item / entity id", icon: "🏹" },
    { id: "falling", name: "Falling Cube", sub: "block meteor — set block id", icon: "⬛" },
    { id: "trap", name: "Trap", sub: "Ground → on_enter → damage", icon: "◎" },
    { id: "totem", name: "Totem", sub: "summon + on_tick (scan/hit/look)", icon: "⌂" },
    { id: "meteor", name: "Meteor", sub: "Look ground → falling block", icon: "☄" },
    { id: "pull", name: "Pull", sub: "Radius + damage + pull", icon: "↩" },
    { id: "taunt", name: "Taunt", sub: "Radius → aggro", icon: "!" },
    { id: "heal", name: "Heal Song", sub: "instant → heal + restore + buff", icon: "♪" },
    { id: "dice", name: "Lucky Dice", sub: "Roll 1–100 → weighted outcomes", icon: "🎲" },
    { id: "lucky_strike", name: "Lucky Strike", sub: "If / Else 50% buff or damage", icon: "☘" },
  ];

  const ICO = {
    skill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h6l2-6 3 12 2-6h1"/><circle cx="6" cy="12" r="2"/></svg>',
    particles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="9" r="2"/><circle cx="16" cy="8" r="1.4"/><circle cx="13" cy="15" r="2.2"/><circle cx="6" cy="16" r="1.2"/></svg>',
    effect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.2 6.4H21l-5.4 4 2.1 6.6L12 16.6 6.3 20l2.1-6.6L3 9.4h6.8z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    passive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 4v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7z"/></svg>',
    mob: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="3.2"/><path d="M6 19c.8-3 3-5 6-5s5.2 2 6 5"/><path d="M8.5 8.2 7 6.4M15.5 8.2 17 6.4"/></svg>',
    affix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 4h7l3 3v13H7z"/><path d="M14 4v4h4"/><path d="M9 12h6M9 16h4"/></svg>',
    food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11h16v2c0 4-3.5 7-8 7s-8-3-8-7z"/><path d="M8 11c0-4 2-7 4-7s4 3 4 7"/></svg>',
    potion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6M10 3v4L6.5 14a5 5 0 0 0 11 0L14 7V3"/></svg>',
    pack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16v12H4z"/><path d="M9 7V5h6v2"/><path d="M8 12h8"/></svg>',
  };

  const MODE_LABELS = [
    { id: "pack", name: "Pack", sub: "Datapack files", chrome: "Datapack", neu: "New File", icon: ICO.pack },
    { id: "skill_stages", name: "Skill", sub: "Flow graph", chrome: "Skill Builder", neu: "New Skill", icon: ICO.skill },
    { id: "particles", name: "VFX", sub: "Particle studio", chrome: "Particle Studio", neu: "New VFX", icon: ICO.particles },
    { id: "skill", name: "Effect", sub: "Skill buff JSON", chrome: "Effect Builder", neu: "New Effect", icon: ICO.effect },
    { id: "gear", name: "Gear", sub: "Set / proc", chrome: "Gear Builder", neu: "New Gear", icon: ICO.gear },
    { id: "passive", name: "Passive", sub: "Mastery", chrome: "Passive Builder", neu: "New Passive", icon: ICO.passive },
    { id: "mob_affix", name: "Mob", sub: "Mob affix", chrome: "Mob Affix", neu: "New Affix", icon: ICO.mob },
    { id: "gear_affix", name: "Affix", sub: "Prefix / suffix", chrome: "Gear Affix", neu: "New Affix", icon: ICO.affix },
    { id: "food_category", name: "Food", sub: "Food category", chrome: "Food Builder", neu: "New Food", icon: ICO.food },
    { id: "potion_effects", name: "Potion", sub: "Potion stats", chrome: "Potion Builder", neu: "New Potion", icon: ICO.potion },
  ];

  const SK = {
    motes: [],
    playing: true,
    t: 0,
    libSel: "vaerun:toolkit/fire_burst",
    inited: false,
    previewPreset: "",
    cam: { yaw: 0.78, pitch: -0.38, dist: 8.4, panX: 0.05, panY: 0.95, panZ: 0.1 },
    orbit: null,
  };

  function $(id) { return document.getElementById(id); }

  function uniqueId(base) {
    const ids = typeof leSkCollectFlowNodeIds === "function" ? leSkCollectFlowNodeIds() : [];
    if (!ids.includes(base)) return base;
    let i = 2;
    while (ids.includes(base + "_" + i)) i += 1;
    return base + "_" + i;
  }

  function skillStem() {
    const sid = ($("le_sk_skill_id")?.value || "").trim();
    const parts = sid.split(/[/:]/);
    return (parts[parts.length - 1] || "skill").replace(/[^a-z0-9_.-]/gi, "_") || "skill";
  }

  function setSkillTitle(name) {
    const stem = String(name || skillStem() || "skill");
    const disp = $("le_sk_display_name");
    const graph = $("le_sk_graph_title");
    const crumb = $("le_sk_crumb");
    if (disp && document.activeElement !== disp) disp.value = stem;
    if (graph) graph.textContent = stem;
    if (crumb) crumb.textContent = stem;
  }

  function applyDisplayName(name) {
    const stem = String(name || "").trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "") || "skill";
    const sid = $("le_sk_skill_id");
    if (sid) {
      const cur = (sid.value || "").trim();
      const ns = cur.includes(":") ? cur.split(":")[0] : "vaerun";
      const path = cur.includes(":") ? cur.split(":").slice(1).join(":") : cur;
      const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "my_pack";
      sid.value = ns + ":" + folder + "/" + stem.toLowerCase();
      sid.dispatchEvent(new Event("change"));
    }
    setSkillTitle(stem);
  }

  function countWires() {
    const wrap = $("le_sk_flow_nodes");
    if (!wrap) return 0;
    let n = 0;
    wrap.querySelectorAll(".le-flow-node").forEach((node) => {
      const kind = node.querySelector(".le-flow-kind")?.value;
      if (typeof leSkFlowPortsForKind !== "function") return;
      leSkFlowPortsForKind(kind).forEach((key) => {
        const meta = LE_SK_FLOW_PORT_META[key];
        if (meta && String(node.querySelector(meta.sel)?.value || "").trim()) n += 1;
      });
    });
    return n;
  }

  function updateCounts() {
    const wrap = $("le_sk_flow_nodes");
    const nodes = wrap ? wrap.querySelectorAll(":scope > .le-flow-node").length : 0;
    const nc = $("le_sk_node_count");
    const wc = $("le_sk_wire_count");
    if (nc) nc.textContent = String(nodes);
    if (wc) wc.textContent = String(countWires());
    setSkillTitle(skillStem());
  }

  function setSide(tab) {
    document.querySelectorAll("[data-sk-side]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-sk-side") === tab));
    $("le_sk_side_nodes")?.classList.toggle("hidden", tab !== "nodes");
    $("le_sk_side_particles")?.classList.toggle("hidden", tab !== "particles");
    $("le_sk_side_library")?.classList.toggle("hidden", tab !== "library");
  }

  function setRightPane(tab) {
    document.querySelectorAll("[data-sk-rpane]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-sk-rpane") === tab));
    $("le_sk_pane_node")?.classList.toggle("hidden", tab !== "node");
    $("le_sk_pane_settings")?.classList.toggle("hidden", tab !== "settings");
    $("le_sk_pane_preview")?.classList.toggle("hidden", tab !== "preview");
  }

  function addFromKit(spec) {
    if (typeof addLeSkFlowNode !== "function") return;
    const from = (typeof LE_SK_FLOW !== "undefined") ? LE_SK_FLOW.selected : null;
    const params = { ...(spec.params || {}) };
    const fromKind = from ? String(from.querySelector(".le-flow-kind")?.value || "") : "";
    const fromMode = from
      ? String(from.querySelector(".le-flow-del-mode")?.value || from.querySelector(".le-flow-spell-mode")?.value || "")
      : "";
    const fromShot = fromKind === "projectile" || fromMode === "projectile" || fromMode === "falling_block"
      || fromMode === "falling" || fromMode === "projectile_falling";
    if (spec.kind === "look" && from) {
      if (fromShot) params.attachment = "projectile";
      else if (fromKind === "ground" || fromMode === "ground" || fromMode === "trap") params.attachment = "ground";
    }
    const pref = {
      id: uniqueId(spec.id || spec.kind || "n"),
      kind: spec.kind,
      params,
    };
    addLeSkFlowNode(spec.kind, pref);
    const wrap = $("le_sk_flow_nodes");
    const added = wrap ? wrap.querySelector(":scope > .le-flow-node:last-child") : null;
    if (from && added && from !== added && typeof leSkFlowWire === "function") {
      const toId = String(added.querySelector(".le-flow-id")?.value || "").trim();
      const ports = typeof leSkFlowPortsForKind === "function"
        ? leSkFlowPortsForKind(from.querySelector(".le-flow-kind")?.value)
        : ["next"];
      const onHitKind = spec.kind === "trigger_effect" || spec.kind === "debuff" || spec.kind === "buff"
        || spec.kind === "play_sound";
      let port = ports.includes("next") ? "next" : ports[0];
      if (fromShot && onHitKind && ports.includes("per_target")) port = "per_target";
      const meta = typeof LE_SK_FLOW_PORT_META !== "undefined" ? LE_SK_FLOW_PORT_META[port] : null;
      const existing = meta ? String(from.querySelector(meta.sel)?.value || "").trim() : "";
      if (existing && port === "per_target") {
        const dest = [...wrap.querySelectorAll(":scope > .le-flow-node")].find((n) =>
          String(n.querySelector(".le-flow-id")?.value || "").trim() === existing
        );
        if (dest && toId) leSkFlowWire(dest, "next", toId);
      } else if (toId && port) {
        leSkFlowWire(from, port, toId);
      }
      if (typeof leSkFlowRefreshGraph === "function") leSkFlowRefreshGraph();
    }
    updateCounts();
  }

  function clearGraph() {
    const wrap = $("le_sk_flow_nodes");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (typeof LE_SK_FLOW !== "undefined") LE_SK_FLOW.selected = null;
  }

  function wire(fromId, port, toId) {
    const wrap = $("le_sk_flow_nodes");
    if (!wrap) return;
    const from = [...wrap.querySelectorAll(":scope > .le-flow-node")].find((n) =>
      String(n.querySelector(".le-flow-id")?.value || "").trim() === fromId
    );
    if (!from || typeof leSkFlowWire !== "function") return;
    leSkFlowWire(from, port, toId);
  }

  function stampRecipe(id, opts) {
    if (typeof addLeSkFlowNode !== "function") return;
    const wrap = $("le_sk_flow_nodes");
    const existing = wrap ? wrap.querySelectorAll(":scope > .le-flow-node").length : 0;
    if (!opts?.replaceOk) {
      if (typeof window.leBuilderSession?.confirmReplace === "function") {
        if (!window.leBuilderSession.confirmReplace("Replace the current graph with this recipe?")) return;
      } else if (existing > 1 && !window.confirm("Replace the current graph with this recipe?")) {
        return;
      }
    }
    if (typeof window.leBuilderSession?.note === "function") window.leBuilderSession.note({ immediate: true, force: true });
    LE_SK_FLOW.batch = true;
    clearGraph();
    const add = (kind, pref) => addLeSkFlowNode(kind, pref);
    if (id === "bolt") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("look", { id: "look", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/fire_burst" } });
      add("play_sound", { id: "sound", params: { sound: "minecraft:entity.blaze.shoot" } });
      add("projectile", { id: "shot", params: {
        spell_mode: "projectile",
        projectile_kind: "spell",
        visual: "particles",
        damage_stat: "magic_attack",
        damage_ratio: 1,
        projectile_speed: 1.6,
      } });
      add("look", { id: "trail", params: { source: "procedural", attachment: "projectile", effect: "vaerun:toolkit/fireball" } });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "look");
      wire("look", "next", "sound");
      wire("sound", "next", "shot");
      wire("shot", "next", "trail");
    } else if (id === "channel") {
      const ch = $("le_sk_channel");
      if (ch) ch.value = "3";
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("look", { id: "look", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/arcane_spiral" } });
      add("damage", { id: "act" });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "look");
      wire("look", "next", "act");
    } else if (id === "arrow_rain") {
      add("projectile", { id: "rain", params: {
        spell_mode: "projectile_falling",
        projectile_kind: "arrow",
        entity_name: "arrow",
        falling_block_id: "minecraft:air",
        projectile_item: "minecraft:arrow",
        item: "minecraft:arrow",
        block_fall_speed: -0.18,
        find_surface: true,
        life_ticks: 80,
        random_x_offset: 2,
        random_z_offset: 2,
        projectile_count: 20,
        projectile_delay_ticks: 4,
        projectile_drop_height: 12,
        ground_anchor: "look",
        spawn_distance: 8,
        damage_stat: "physical_attack",
        damage_ratio: 2,
      } });
      add("look", { id: "look", params: { source: "procedural", attachment: "ground", effect: "vaerun:toolkit/arrow_rain" } });
      LE_SK_FLOW.batch = false;
      wire("rain", "next", "look");
    } else if (id === "falling") {
      add("delivery", { id: "falling", params: {
        mode: "falling_block",
        falling_block_id: "minecraft:magma_block",
        projectile_drop_height: 18,
        projectile_drop_speed: 0.8,
        ground_anchor: "look",
        spawn_distance: 8,
      } });
      add("look", { id: "look", params: { source: "procedural", attachment: "projectile", effect: "vaerun:toolkit/fire_burst" } });
      add("hit", { id: "hit", params: { shape: "radius", radius: 4 } });
      add("damage", { id: "act", params: { damage_ratio: 1, damage_stat: "magic_attack" } });
      LE_SK_FLOW.batch = false;
      wire("falling", "next", "look");
      wire("look", "next", "hit");
      wire("hit", "on_pass", "act");
    } else if (id === "trap") {
      add("delivery", { id: "trap", params: { mode: "trap", radius: 3 } });
      add("look", { id: "look", params: { source: "procedural", attachment: "ground", effect: "vaerun:toolkit/ice_circle" } });
      add("damage", { id: "act" });
      add("debuff", { id: "debuff" });
      LE_SK_FLOW.batch = false;
      wire("trap", "next", "look");
      wire("trap", "on_enter", "act");
      wire("act", "next", "debuff");
    } else if (id === "totem") {
      add("totem_turret", { id: "totem" });
      add("look", { id: "look", params: { source: "procedural", attachment: "ground", effect: "vaerun:toolkit/holy_ring" } });
      add("damage", { id: "act" });
      LE_SK_FLOW.batch = false;
      wire("totem", "next", "look");
      wire("totem", "on_tick", "act");
    } else if (id === "meteor") {
      add("delivery", { id: "meteor", params: {
        mode: "falling_block",
        falling_block_id: "minecraft:magma_block",
        projectile_drop_height: 22,
        projectile_drop_speed: 1.1,
        ground_anchor: "look",
        spawn_distance: 10,
      } });
      add("look", { id: "look", params: { source: "procedural", attachment: "projectile", effect: "vaerun:toolkit/meteor_impact" } });
      add("hit", { id: "hit", params: { shape: "radius", radius: 5 } });
      add("damage", { id: "land", params: { damage_ratio: 1.2, damage_stat: "magic_attack" } });
      LE_SK_FLOW.batch = false;
      wire("meteor", "next", "look");
      wire("look", "next", "hit");
      wire("hit", "on_pass", "land");
    } else if (id === "pull") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("hit", { id: "hit", params: { shape: "radius", radius: 6 } });
      add("damage", { id: "act" });
      add("knockback", { id: "pull", params: { mode: "pull", hit_knockback: 1.2 } });
      add("debuff", { id: "debuff" });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "hit");
      wire("hit", "on_pass", "act");
      wire("act", "next", "pull");
      wire("pull", "next", "debuff");
    } else if (id === "taunt") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("hit", { id: "hit", params: { shape: "radius", radius: 8 } });
      add("aggro", { id: "aggro" });
      add("look", { id: "look", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/holy_ring" } });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "hit");
      wire("hit", "on_pass", "aggro");
      wire("aggro", "next", "look");
    } else if (id === "heal") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("heal", { id: "heal", params: { amount: 20 } });
      add("restore_mana", { id: "mana", params: { amount: 15 } });
      add("buff", { id: "buff" });
      add("look", { id: "look", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/holy_ring" } });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "heal");
      wire("heal", "next", "mana");
      wire("mana", "next", "buff");
      wire("buff", "next", "look");
    } else if (id === "dice") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("roll", { id: "dice", params: { min: 1, max: 100, store_as: "dice" } });
      add("weighted_choice", { id: "pick", params: { outcomes: [
        { weight: 60, node: "hit" },
        { weight: 30, node: "lucky" },
        { weight: 10, node: "jackpot" },
      ] } });
      add("damage", { id: "hit", params: { damage_ratio: 1, damage_stat: "magic_attack" } });
      add("buff", { id: "lucky" });
      add("damage", { id: "jackpot", params: { damage_ratio: 3, damage_stat: "magic_attack" } });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "dice");
      wire("dice", "next", "pick");
    } else if (id === "lucky_strike") {
      add("delivery", { id: "cast", params: { mode: "instant" } });
      add("if_else", { id: "iff", params: { condition: "chance", chance_percent: 50, chance: 0.5 } });
      add("buff", { id: "lucky" });
      add("look", { id: "green", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/holy_ring" } });
      add("play_sound", { id: "ok", params: { sound: "minecraft:entity.player.levelup" } });
      add("damage", { id: "hit", params: { damage_ratio: 1, damage_stat: "magic_attack" } });
      add("look", { id: "red", params: { source: "procedural", attachment: "caster", effect: "vaerun:toolkit/fire_burst" } });
      add("play_sound", { id: "miss", params: { sound: "minecraft:entity.blaze.shoot" } });
      LE_SK_FLOW.batch = false;
      wire("cast", "next", "iff");
      wire("iff", "on_pass", "lucky");
      wire("lucky", "next", "green");
      wire("green", "next", "ok");
      wire("iff", "on_fail", "hit");
      wire("hit", "next", "red");
      wire("red", "next", "miss");
    } else {
      LE_SK_FLOW.batch = false;
    }
    if (typeof refreshLeSkFlowEdgeSelects === "function") refreshLeSkFlowEdgeSelects();
    if (typeof leSkFlowAutoLayout === "function") leSkFlowAutoLayout();
    else if (typeof leSkFlowRefreshGraph === "function") leSkFlowRefreshGraph();
    updateCounts();
    if (typeof window.leBuilderSession?.note === "function") window.leBuilderSession.note({ immediate: true, force: true });
  }

  function newSkill() {
    if (typeof LE_SK_FLOW !== "undefined" && LE_SK_FLOW.selected) {
      /* keep going */
    }
    const wrap = $("le_sk_flow_nodes");
    const n = wrap ? wrap.querySelectorAll(":scope > .le-flow-node").length : 0;
    if (typeof window.leBuilderSession?.confirmReplace === "function") {
      if (!window.leBuilderSession.confirmReplace("Clear the current skill graph?")) return;
    } else if (n > 1 && !window.confirm("Clear the current skill graph?")) {
      return;
    }
    if (typeof window.leBuilderSession?.note === "function") window.leBuilderSession.note({ immediate: true, force: true });
    clearGraph();
    const sid = $("le_sk_skill_id");
    if (sid) sid.value = "vaerun:my_pack/new_skill";
    const fn = $("le_sk_filename");
    if (fn) fn.value = "new_skill.json";
    const tags = $("le_sk_tags");
    if (tags) tags.value = "";
    const ch = $("le_sk_channel");
    if (ch) ch.value = "";
    stampRecipe("bolt", { replaceOk: true });
    setSkillTitle("new_skill");
  }

  function switchMode(value) {
    const radio = document.querySelector(`input[name="le_builder_mode"][value="${value}"]`);
    if (!radio) return;
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function currentMode() {
    return document.querySelector('input[name="le_builder_mode"]:checked')?.value || "skill_stages";
  }

  function modeMeta(id) {
    return MODE_LABELS.find((m) => m.id === (id || currentMode())) || MODE_LABELS[0];
  }

  function fillSettingsMenu() {
    const menu = $("le_sk_settings_menu");
    if (!menu) return;
    menu.innerHTML = MODE_LABELS.map((m) =>
      `<button type="button" data-sk-mode="${m.id}">${m.sub}</button>`
    ).join("");
  }

  function fillModeRail() {
    const rail = $("le_sk_mode_rail");
    if (!rail) return;
    rail.innerHTML = `<div class="le-sk-mode-lab">Mode</div>` + MODE_LABELS.map((m) =>
      `<button type="button" class="le-sk-mode-tab" data-sk-mode="${m.id}" title="${m.sub}">
        <span class="ico">${m.icon}</span><span class="n">${m.name}</span>
      </button>`
    ).join("");
    rail.querySelectorAll("[data-sk-mode]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        switchMode(b.getAttribute("data-sk-mode"));
      });
    });
  }

  function syncModeChrome(id) {
    const mode = id || currentMode();
    const meta = modeMeta(mode);
    document.body.dataset.skMode = mode;
    document.querySelectorAll("#le_sk_mode_rail [data-sk-mode]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-sk-mode") === mode);
    });
    const brand = $("le_sk_brand_mode");
    if (brand) brand.textContent = meta.chrome;
    const neu = $("le_sk_btn_new")?.querySelector(".lab");
    if (neu) neu.textContent = meta.neu;
    const title = $("le_sk_display_name");
    if (title) {
      title.disabled = mode !== "skill_stages";
      if (mode !== "skill_stages") title.value = meta.name;
      else setSkillTitle(skillStem());
    }
  }

  function fillRecipes() {
    const host = $("le_sk_recipe_list");
    if (!host) return;
    host.innerHTML = RECIPES.map((r) =>
      `<button type="button" class="le-sk-recipe" data-sk-recipe="${r.id}"><span>${r.icon}</span><span><b>${r.name}</b><span class="sub">${r.sub}</span></span></button>`
    ).join("");
  }

  function fillVfxLists() {
    const filter = ($("le_sk_lib_filter")?.value || "").toLowerCase();
    const paint = (host) => {
      if (!host) return;
      host.innerHTML = VFX_LIB.filter((v) => !filter || v.name.includes(filter) || v.id.includes(filter)).map((v) =>
        `<button type="button" class="le-sk-lib-item${SK.libSel === v.id ? " on" : ""}" data-vfx="${v.id}">
          <span class="le-sk-dot" style="background:${v.swatch}"></span>${v.name}
        </button>`
      ).join("");
    };
    paint($("le_sk_lib_list"));
    paint($("le_sk_side_vfx_list"));
  }

  function applyVfxToLook(id) {
    const node = (typeof LE_SK_FLOW !== "undefined" && LE_SK_FLOW.selected) ? LE_SK_FLOW.selected : null;
    const kind = node && node.querySelector(".le-flow-kind")?.value;
    if (node && (kind === "look" || kind === "vfx")) {
      const inp = node.querySelector(".le-flow-look-fx");
      if (inp) inp.value = id;
      const src = node.querySelector(".le-flow-look-src");
      if (src) src.value = "procedural";
    } else if (typeof addLeSkFlowNode === "function") {
      addLeSkFlowNode("look", { id: uniqueId("look"), params: { source: "procedural", attachment: "caster", effect: id } });
    }
    if (typeof leSkFlowRefreshGraph === "function") leSkFlowRefreshGraph();
    burstFromVfx(id, true);
  }

  function currentLookVfx() {
    const sel = (typeof LE_SK_FLOW !== "undefined") ? LE_SK_FLOW.selected : null;
    const fromSel = sel && sel.querySelector(".le-flow-look-fx");
    if (fromSel && String(fromSel.value || "").trim()) return String(fromSel.value).trim();
    const look = document.querySelector("#le_sk_flow_nodes .le-flow-look-fx");
    return String(look?.value || SK.libSel || "vaerun:toolkit/fire_burst");
  }

  function syncPreviewVfx(force) {
    const id = currentLookVfx();
    const preset = typeof window.leParticleStudioPresetForToolkit === "function"
      ? window.leParticleStudioPresetForToolkit(id)
      : "fire_burst";
    if (!force && SK.previewPreset === preset) return;
    SK.previewPreset = preset;
    if (typeof window.leParticleStudioInit === "function") window.leParticleStudioInit();
    if (typeof window.leParticleStudioApplyPreset === "function") window.leParticleStudioApplyPreset(preset);
    if (typeof window.leParticleStudioSetPaused === "function") window.leParticleStudioSetPaused(!SK.playing);
  }

  function burstFromVfx(id, also3d) {
    SK.libSel = id || SK.libSel;
    if (also3d) {
      SK.previewPreset = "";
      syncPreviewVfx(true);
    }
  }

  function drawBlock(ctx, x, y, s, top, side, face) {
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y - s * 0.5);
    ctx.lineTo(x + s * 2, y);
    ctx.lineTo(x + s, y + s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y + s * 0.5);
    ctx.lineTo(x + s, y + s * 1.35);
    ctx.lineTo(x, y + s * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.moveTo(x + s, y + s * 0.5);
    ctx.lineTo(x + s * 2, y);
    ctx.lineTo(x + s * 2, y + s * 0.85);
    ctx.lineTo(x + s, y + s * 1.35);
    ctx.closePath();
    ctx.fill();
  }

  function sizePreviewCanvas() {
    const c = $("le_sk_preview_canvas");
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(180, Math.floor((c.clientWidth || 280) * dpr));
    const h = Math.max(120, Math.floor((c.clientHeight || 168) * dpr));
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
  }

  function drawPreview() {
    const c = $("le_sk_preview_canvas");
    if (!c) return;
    sizePreviewCanvas();
    if (SK.t % 30 === 1) syncPreviewVfx(false);
    if (typeof window.leParticleStudioPaintWorld === "function") {
      window.leParticleStudioPaintWorld(c, SK.cam);
      return;
    }
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#6eb6ea";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  function tick() {
    SK.t += 1;
    if (currentMode() === "skill_stages") drawPreview();
    requestAnimationFrame(tick);
  }

  function onSelect(node) {
    const headT = $("le_sk_prop_title");
    const headS = $("le_sk_prop_sub");
    const ico = $("le_sk_prop_ico");
    const list = $("le_sk_wire_list");
    if (!node) {
      if (headT) headT.textContent = "Select a node";
      if (headS) headS.textContent = "Click a card on the graph";
      if (list) list.innerHTML = "";
      return;
    }
    const kind = String(node.querySelector(".le-flow-kind")?.value || "");
    const id = String(node.querySelector(".le-flow-id")?.value || "");
    const meta = typeof leSkFlowCardMeta === "function" ? leSkFlowCardMeta(node, id, kind) : { title: "Node", sub: kind, cat: "act", icon: "" };
    if (headT) headT.textContent = meta.title;
    if (headS) headS.textContent = meta.sub;
    const helpBtn = $("le_sk_node_help");
    if (helpBtn) helpBtn.hidden = false;
    if (ico) ico.innerHTML = meta.icon || "";
    ico?.classList.remove("cat-cast", "cat-delivery", "cat-hit", "cat-act", "cat-look", "cat-land", "cat-gate");
    ico?.classList.add("cat-" + meta.cat);
    if (list && typeof leSkFlowPortsForKind === "function") {
      const ports = leSkFlowPortsForKind(kind);
      list.innerHTML = ports.map((key) => {
        const pm = LE_SK_FLOW_PORT_META[key];
        const to = String(node.querySelector(pm.sel)?.value || "").trim();
        const toNode = to && typeof leSkCollectFlowNodeIds === "function"
          ? [...document.querySelectorAll("#le_sk_flow_nodes > .le-flow-node")].find((n) => String(n.querySelector(".le-flow-id")?.value || "").trim() === to)
          : null;
        const toKind = toNode ? String(toNode.querySelector(".le-flow-kind")?.value || "") : "";
        const label = to
          ? (typeof LE_SK_FLOW_KIND_SHORT !== "undefined" ? (LE_SK_FLOW_KIND_SHORT[toKind] || toKind || to) : to)
          : "—";
        return `<div class="le-sk-wire-row"><span class="k"><span class="le-sk-dot" style="background:${pm.color}"></span>${pm.label}</span><span>${label}</span></div>`;
      }).join("");
    }
  }

  function init() {
    if (SK.inited) return;
    SK.inited = true;
    fillSettingsMenu();
    fillModeRail();
    syncModeChrome();
    fillRecipes();
    fillVfxLists();

    document.querySelectorAll("[data-sk-side]").forEach((b) => {
      b.addEventListener("click", () => setSide(b.getAttribute("data-sk-side")));
    });
    document.querySelectorAll("[data-sk-rpane]").forEach((b) => {
      b.addEventListener("click", () => setRightPane(b.getAttribute("data-sk-rpane")));
    });
    document.addEventListener("click", (e) => {
      const item = e.target.closest("[data-sk-add]");
      if (item) {
        try { addFromKit(JSON.parse(item.getAttribute("data-sk-add"))); } catch (_) {}
        return;
      }
      const port = e.target.closest("[data-sk-port]");
      if (port && typeof leSkFlowBeginLink === "function" && typeof LE_SK_FLOW !== "undefined" && LE_SK_FLOW.selected) {
        leSkFlowBeginLink(LE_SK_FLOW.selected, port.getAttribute("data-sk-port"));
        return;
      }
      const recipe = e.target.closest("[data-sk-recipe]");
      if (recipe) stampRecipe(recipe.getAttribute("data-sk-recipe"));
    });
    const pickVfx = (e) => {
      const btn = e.target.closest("[data-vfx]");
      if (!btn) return;
      SK.libSel = btn.getAttribute("data-vfx");
      fillVfxLists();
      burstFromVfx(SK.libSel, true);
    };
    $("le_sk_lib_list")?.addEventListener("click", pickVfx);
    $("le_sk_side_vfx_list")?.addEventListener("click", (e) => {
      pickVfx(e);
      const btn = e.target.closest("[data-vfx]");
      if (btn) applyVfxToLook(btn.getAttribute("data-vfx"));
    });
    $("le_sk_lib_to_skill")?.addEventListener("click", () => applyVfxToLook(SK.libSel));
    $("le_sk_lib_filter")?.addEventListener("input", fillVfxLists);
    $("le_sk_open_vfx")?.addEventListener("click", () => switchMode("particles"));
    $("le_sk_lib_open_vfx")?.addEventListener("click", () => switchMode("particles"));
    $("le_sk_preview_full")?.addEventListener("click", () => {
      syncPreviewVfx(true);
      switchMode("particles");
      if (typeof window.leParticleStudioReplay === "function") window.leParticleStudioReplay();
    });
    $("le_sk_preview_play")?.addEventListener("click", () => {
      SK.playing = !SK.playing;
      const b = $("le_sk_preview_play");
      if (b) b.textContent = SK.playing ? "Pause" : "Play";
      if (typeof window.leParticleStudioSetPaused === "function") window.leParticleStudioSetPaused(!SK.playing);
    });
    const pv = $("le_sk_preview_canvas");
    if (pv) {
      pv.addEventListener("pointerdown", (e) => {
        SK.orbit = { x: e.clientX, y: e.clientY, yaw: SK.cam.yaw, pitch: SK.cam.pitch };
        try { pv.setPointerCapture(e.pointerId); } catch (_) {}
      });
      pv.addEventListener("pointermove", (e) => {
        if (!SK.orbit) return;
        SK.cam.yaw = SK.orbit.yaw - (e.clientX - SK.orbit.x) * 0.01;
        SK.cam.pitch = Math.max(-1.15, Math.min(0.12, SK.orbit.pitch + (e.clientY - SK.orbit.y) * 0.01));
      });
      pv.addEventListener("pointerup", () => { SK.orbit = null; });
      pv.addEventListener("pointercancel", () => { SK.orbit = null; });
      pv.addEventListener("wheel", (e) => {
        e.preventDefault();
        SK.cam.dist = Math.max(6, Math.min(22, SK.cam.dist + (e.deltaY > 0 ? 0.8 : -0.8)));
      }, { passive: false });
    }
    $("le_sk_btn_save")?.addEventListener("click", () => $("btn_download")?.click());
    $("le_sk_btn_load")?.addEventListener("click", () => {
      if (currentMode() === "pack") $("le_pack_open_folder")?.click();
      else $("btn_import")?.click();
    });
    $("le_sk_lib_load")?.addEventListener("click", () => $("btn_import")?.click());
    $("le_sk_btn_library")?.addEventListener("click", () => {
      if (currentMode() === "skill_stages") setSide("library");
      else if (currentMode() === "pack") switchMode("skill_stages");
      else switchMode("particles");
    });
    $("le_sk_btn_new")?.addEventListener("click", () => {
      const mode = currentMode();
      if (mode === "skill_stages") newSkill();
      else if (mode === "particles") $("le_pv_new")?.click();
      else if (mode === "pack") $("le_pack_new")?.click();
    });
    $("le_sk_mode_rail")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sk-mode]");
      if (!b) return;
      e.preventDefault();
      switchMode(b.getAttribute("data-sk-mode"));
    });
    $("le_sk_btn_settings")?.addEventListener("click", (e) => {
      e.stopPropagation();
      $("le_sk_settings")?.classList.toggle("open");
    });
    $("le_sk_settings_menu")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sk-mode]");
      if (!b) return;
      switchMode(b.getAttribute("data-sk-mode"));
      $("le_sk_settings")?.classList.remove("open");
    });
    document.addEventListener("click", () => $("le_sk_settings")?.classList.remove("open"));
    $("le_sk_display_name")?.addEventListener("change", () => applyDisplayName($("le_sk_display_name").value));
    $("le_sk_skill_id")?.addEventListener("input", () => setSkillTitle(skillStem()));

    const wrap = $("le_sk_flow_nodes");
    let raf = 0;
    const refreshGraph = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (typeof leSkFlowRefreshGraph === "function") leSkFlowRefreshGraph();
        if (typeof updateLeSkCompileWarn === "function") updateLeSkCompileWarn();
      });
    };
    wrap?.addEventListener("input", refreshGraph);
    $("le_sk_identity")?.addEventListener("input", refreshGraph);
    $("le_sk_identity")?.addEventListener("change", refreshGraph);

    requestAnimationFrame(tick);
    updateCounts();
    onSelect(typeof LE_SK_FLOW !== "undefined" ? LE_SK_FLOW.selected : null);
    burstFromVfx(SK.libSel, true);
    syncPreviewVfx(true);
  }

  window.leSkVfxLibIds = function () {
    return VFX_LIB.map((v) => v.id);
  };
  window.leSkStudioOnSelect = onSelect;
  window.leSkStudioAfterGraph = function () {
    updateCounts();
    onSelect(typeof LE_SK_FLOW !== "undefined" ? LE_SK_FLOW.selected : null);
  };
  window.leSkStudioSync = function () {
    init();
    updateCounts();
    fillVfxLists();
    syncModeChrome();
  };
  window.leSkStudioSyncMode = syncModeChrome;
  window.leSkSwitchMode = switchMode;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("#le_sk_mode_rail [data-sk-mode]");
    if (b) switchMode(b.getAttribute("data-sk-mode"));
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
