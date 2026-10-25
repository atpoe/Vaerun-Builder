/* Skill-flow graph checks. Does not change exported JSON. */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function nodes() {
    const wrap = $("le_sk_flow_nodes");
    return wrap ? [...wrap.querySelectorAll(":scope > .le-flow-node")] : [];
  }

  function nodeId(n) {
    return String(n.querySelector(".le-flow-id")?.value || "").trim();
  }

  function nodeKind(n) {
    return String(n.querySelector(".le-flow-kind")?.value || "").trim();
  }

  function portValue(n, key) {
    const meta = typeof LE_SK_FLOW_PORT_META !== "undefined" ? LE_SK_FLOW_PORT_META[key] : null;
    if (!meta) return "";
    return String(n.querySelector(meta.sel)?.value || "").trim();
  }

  function portsFor(kind) {
    return typeof leSkFlowPortsForKind === "function" ? leSkFlowPortsForKind(kind) : ["next"];
  }

  function allPortKeys() {
    return typeof LE_SK_FLOW_PORT_META !== "undefined" ? Object.keys(LE_SK_FLOW_PORT_META) : ["next"];
  }

  function vfxKnown(id) {
    const s = String(id || "").trim();
    if (!s) return false;
    if (s.indexOf("minecraft:") === 0) return true;
    const lib = typeof window.leSkVfxLibIds === "function" ? window.leSkVfxLibIds() : [];
    if (lib.indexOf(s) >= 0) return true;
    if (typeof window.lePackHasVfxId === "function" && window.lePackHasVfxId(s)) return true;
    return false;
  }

  function issue(level, id, message) {
    return { level, id: id || "", message };
  }

  function isCast(n) {
    return typeof leSkFlowIsCastNode === "function" ? leSkFlowIsCastNode(n) : false;
  }

  function displayName(n, fallbackId) {
    if (n && typeof leSkFlowCardMeta === "function") {
      try {
        const id = nodeId(n) || fallbackId || "";
        const kind = nodeKind(n);
        const meta = leSkFlowCardMeta(n, id, kind, new Map());
        if (meta && meta.title) return meta.title;
      } catch (_) { /* ignore */ }
    }
    const k = n ? nodeKind(n) : "";
    if (typeof LE_SK_FLOW_KIND_SHORT !== "undefined" && LE_SK_FLOW_KIND_SHORT[k]) return LE_SK_FLOW_KIND_SHORT[k];
    return fallbackId || k || "Node";
  }

  function collect() {
    const list = nodes();
    const errors = [];
    const warnings = [];
    if (!list.length) {
      errors.push(issue("error", "", "Add When Skill Cast to start the graph."));
      return { errors, warnings };
    }

    const ids = [];
    const byId = new Map();
    list.forEach((n) => {
      const id = nodeId(n);
      if (!id) {
        errors.push(issue("error", "", displayName(n, "A node") + " is missing an id (open Advanced)."));
        return;
      }
      if (byId.has(id)) errors.push(issue("error", id, displayName(n, id) + " uses the same id as another node."));
      byId.set(id, n);
      ids.push(id);
    });

    const casts = list.filter(isCast);
    if (!casts.length) {
      errors.push(issue("error", "", "Every skill needs one When Skill Cast. New Skill always creates it."));
    } else if (casts.length > 1) {
      casts.slice(1).forEach((n) => {
        errors.push(issue("error", nodeId(n), "Only one When Skill Cast is allowed. Extra copies cannot be wired into."));
      });
    }

    list.forEach((n) => {
      const id = nodeId(n);
      if (!id) return;
      const kind = nodeKind(n);
      const allowed = portsFor(kind);
      allPortKeys().forEach((key) => {
        const to = portValue(n, key);
        if (!to) return;
        const meta = LE_SK_FLOW_PORT_META[key];
        const label = meta ? meta.label : key;
        if (!byId.has(to)) {
          errors.push(issue("error", id, displayName(n, id) + " " + label + " points at a missing node."));
        } else if (isCast(byId.get(to))) {
          errors.push(issue("error", id, displayName(n, id) + " cannot wire " + label + " into When Skill Cast."));
        }
        if (allowed.indexOf(key) < 0) {
          errors.push(issue("error", id, displayName(n, id) + " cannot use a " + label + " wire."));
        }
      });
      if (kind === "look" || kind === "vfx") {
        const src = String(n.querySelector(".le-flow-look-src")?.value || "procedural").trim();
        if (src !== "vanilla") {
          const fx = String(n.querySelector(".le-flow-look-fx")?.value || "").trim();
          if (!fx) errors.push(issue("error", id, displayName(n, id) + " needs a particle effect."));
          else if (!vfxKnown(fx)) warnings.push(issue("warn", id, displayName(n, id) + " uses VFX \"" + fx + "\" that is not in the toolkit library or open pack."));
        }
      }
      if (kind === "particles") {
        const fx = String(n.querySelector(".le-flow-part-type")?.value || "").trim();
        if (fx && (fx.indexOf("vaerun:") === 0 || fx.indexOf("/") >= 0) && fx.indexOf("minecraft:") !== 0 && !vfxKnown(fx)) {
          warnings.push(issue("warn", id, displayName(n, id) + " particles \"" + fx + "\" is not in the toolkit library or open pack."));
        }
      }
    });

    const entry = list[0];
    const entryId = nodeId(entry);
    const seen = new Set();
    const q = [];
    if (entryId && byId.has(entryId)) {
      seen.add(entryId);
      q.push(entry);
    }
    while (q.length) {
      const n = q.shift();
      const kind = nodeKind(n);
      portsFor(kind).forEach((key) => {
        const to = portValue(n, key);
        if (!to || seen.has(to) || !byId.has(to)) return;
        seen.add(to);
        q.push(byId.get(to));
      });
      n.querySelectorAll(".le-flow-roll-node, .le-flow-roll-def, .le-flow-wchoice-node, .le-flow-seq-node, .le-flow-repeat-body").forEach((el) => {
        const to = String(el.value || "").trim();
        if (!to || seen.has(to) || !byId.has(to)) return;
        seen.add(to);
        q.push(byId.get(to));
      });
    }
    list.forEach((n) => {
      const id = nodeId(n);
      if (id && !seen.has(id) && !isCast(n)) {
        warnings.push(issue("warn", id, displayName(n, id) + " is not on an execution path."));
      }
    });

    function walkCycle(startId, keys) {
      const stack = [];
      const onStack = new Set();
      const vis = new Set();
      let found = null;
      function dfs(id) {
        if (found || !byId.has(id)) return;
        vis.add(id);
        onStack.add(id);
        stack.push(id);
        const n = byId.get(id);
        keys.forEach((key) => {
          const to = portValue(n, key);
          if (!to || !byId.has(to)) return;
          if (onStack.has(to)) {
            found = stack.concat([to]).join(" → ");
            return;
          }
          if (!vis.has(to)) dfs(to);
        });
        stack.pop();
        onStack.delete(id);
      }
      if (startId) dfs(startId);
      return found;
    }
    const loop = walkCycle(entryId, ["next", "on_tick"]);
    if (loop) warnings.push(issue("warn", entryId, "Event loop on next/on_tick: " + loop));

    const EVENT_PORTS = ["per_target", "first_only", "on_tick", "on_expire", "on_attacked", "on_enter", "on_exit", "on_death"];
    const SPAWN_KINDS = ["delivery", "ground", "projectile", "spell_visual", "spell"];
    const DAMAGE_KINDS = ["damage", "deal_damage", "debuff", "buff", "trigger_effect"];

    function sequenceSteps(n) {
      return [...n.querySelectorAll(".le-flow-seq-node")].map((el) => String(el.value || "").trim()).filter(Boolean);
    }

    function walkNextChain(startId, cap) {
      const out = [];
      let cur = startId;
      let hops = cap || 24;
      while (cur && hops-- > 0 && byId.has(cur) && out.indexOf(cur) < 0) {
        out.push(cur);
        cur = portValue(byId.get(cur), "next");
      }
      return out;
    }

    list.forEach((n) => {
      const id = nodeId(n);
      if (!id) return;
      const kind = nodeKind(n);
      const next = portValue(n, "next");
      const dest = next ? byId.get(next) : null;
      const destKind = dest ? nodeKind(dest) : "";
      if (SPAWN_KINDS.includes(kind) && dest && DAMAGE_KINDS.includes(destKind)) {
        const mode = String(n.querySelector(".le-flow-del-mode")?.value || "").trim();
        const hint = (kind === "delivery" && (mode === "trap" || mode === "ground")) || kind === "ground"
          ? "On Enter / On Tick"
          : "On Hit";
        warnings.push(issue("warn", id, displayName(n, id) + " wires Deal Damage on Next. Next is spawn-time (Particle / Sound). Put combat on " + hint + " so it does not run at spawn."));
      }
      if ((kind === "if_else" || kind === "compare" || kind === "branch" || kind === "chance") && next && (portValue(n, "on_pass") || portValue(n, "on_fail"))) {
        warnings.push(issue("warn", id, displayName(n, id) + " has True/False and Next. Next is ignored when a branch is wired."));
      }
      if (kind === "sequence") {
        const steps = sequenceSteps(n);
        const seenStep = new Set();
        steps.forEach((sid) => {
          if (seenStep.has(sid)) warnings.push(issue("warn", id, "Sequence lists \"" + sid + "\" twice — the second copy is skipped."));
          seenStep.add(sid);
          const sn = byId.get(sid);
          if (!sn) return;
          const sk = nodeKind(sn);
          if (sk === "delay" || sk === "wait") {
            const waitNext = portValue(sn, "next");
            if (waitNext) warnings.push(issue("warn", sid, "Wait \"" + sid + "\" is a Sequence stage, so its Next is ignored. List the follow-up as the next stage."));
          } else {
            const chain = walkNextChain(sid, 24);
            chain.slice(1).forEach((cid) => {
              const ck = nodeKind(byId.get(cid));
              if (ck === "delay" || ck === "wait") {
                errors.push(issue("error", sid, "Wait on \"" + cid + "\" is inside a stage chain. Sequence does not pause for that. Make Wait its own Sequence stage."));
              }
              if (seenStep.has(cid) && cid !== sid) {
                warnings.push(issue("warn", id, "Stage \"" + cid + "\" also sits on Next of \"" + sid + "\". It will run in that chain and be skipped as a later stage."));
              }
            });
          }
        });
        if (next && seenStep.has(next)) {
          warnings.push(issue("warn", id, "Sequence Next is also a listed stage (\"" + next + "\") — it will be skipped after the stages finish."));
        }
      }
      EVENT_PORTS.forEach((key) => {
        const to = portValue(n, key);
        if (!to) return;
        if (to === next && next) {
          warnings.push(issue("warn", id, "\"" + id + "\" wires the same node on Next and " + (LE_SK_FLOW_PORT_META[key] ? LE_SK_FLOW_PORT_META[key].label : key) + ". That node can run twice."));
        }
      });
    });

    return { errors, warnings };
  }

  function explain() {
    const list = nodes();
    const byId = new Map();
    list.forEach((n) => {
      const id = nodeId(n);
      if (id) byId.set(id, n);
    });
    const lines = [];
    const order = [];
    const seen = new Set();
    function labelOf(id) {
      const n = byId.get(id);
      if (!n) return id;
      const k = nodeKind(n);
      const short = (typeof LE_SK_FLOW_KIND_SHORT !== "undefined" && LE_SK_FLOW_KIND_SHORT[k]) ? LE_SK_FLOW_KIND_SHORT[k] : k;
      return short + " (" + id + ")";
    }
    function walkNow(id, prefix) {
      let cur = id;
      let hops = 32;
      while (cur && hops-- > 0 && byId.has(cur) && !seen.has("now:" + cur)) {
        seen.add("now:" + cur);
        order.push(cur);
        const n = byId.get(cur);
        const k = nodeKind(n);
        lines.push({ id: cur, lane: "now", text: prefix + labelOf(cur) });
        if (k === "sequence") {
          const steps = [...n.querySelectorAll(".le-flow-seq-node")].map((el) => String(el.value || "").trim()).filter(Boolean);
          steps.forEach((sid, i) => {
            lines.push({ id: sid, lane: "now", text: prefix + "  stage " + (i + 1) + ": " + labelOf(sid) });
            walkNow(sid, prefix + "    ");
          });
          cur = portValue(n, "next");
          continue;
        }
        if (k === "if_else" || k === "compare" || k === "branch" || k === "chance" || k === "hit") {
          const pass = portValue(n, "on_pass");
          const fail = portValue(n, "on_fail");
          if (pass) {
            lines.push({ id: pass, lane: "branch", text: prefix + "  True → " + labelOf(pass) });
            walkNow(pass, prefix + "    ");
          }
          if (fail) {
            lines.push({ id: fail, lane: "branch", text: prefix + "  False → " + labelOf(fail) });
            walkNow(fail, prefix + "    ");
          }
          if (!pass && !fail) cur = portValue(n, "next");
          else cur = "";
          continue;
        }
        if (k === "delay" || k === "wait") {
          const ticks = String(n.querySelector(".le-flow-wait-ticks")?.value || "").trim();
          const nxt = portValue(n, "next");
          const waitLab = ticks ? "Wait " + ticks + " ticks" : "Wait";
          if (nxt) lines.push({ id: nxt, lane: "later", text: prefix + "  " + waitLab + " then → " + labelOf(nxt) });
          walkNow(nxt, prefix + "    ");
          cur = "";
          continue;
        }
        const events = [
          ["per_target", "When Attack Hits"],
          ["on_enter", "Enters Zone"],
          ["on_exit", "Leaves Zone"],
          ["on_tick", "Every Tick"],
          ["on_expire", "Duration Ends"],
          ["on_death", "Summon Dies"],
          ["on_attacked", "When Attacked"],
        ];
        events.forEach(([key, lab]) => {
          const to = portValue(n, key);
          if (!to) return;
          lines.push({ id: to, lane: "later", text: prefix + "  later " + lab + " → " + labelOf(to) });
        });
        cur = portValue(n, "next");
      }
    }
    if (list[0]) walkNow(nodeId(list[0]), "");
    return { lines, order };
  }

  let traceTimer = 0;
  function clearTrace() {
    if (traceTimer) {
      clearTimeout(traceTimer);
      traceTimer = 0;
    }
    document.querySelectorAll(".le-sk-gnode.trace, .le-sk-gnode.trace-later").forEach((el) => {
      el.classList.remove("trace", "trace-later");
    });
  }

  function trace() {
    const skill = (typeof isSkillStagesMode === "function") ? isSkillStagesMode() : (document.querySelector('input[name="le_builder_mode"]:checked')?.value === "skill_stages");
    if (!skill) return;
    paint(true);
    const host = $("le_sk_issues");
    const { lines, order } = explain();
    if (host) {
      host.classList.remove("hidden");
      const body = (lines.length ? lines : [{ id: "", lane: "now", text: "Empty graph." }]).map((ln) =>
        `<button type="button" class="le-sk-issue ${ln.lane === "later" ? "warn" : (ln.lane === "branch" ? "ok" : "")}" data-issue-id="${esc(ln.id)}">${esc(ln.text)}</button>`
      ).join("");
      host.innerHTML = "<p class='le-sk-issue ok'>Now = same tick after When Skill Cast. Later = When Attack Hits / Enters Zone / Duration Ends / Wait. True and False are exclusive.</p>" + body;
      host.querySelectorAll("[data-issue-id]").forEach((btn) => {
        btn.addEventListener("click", () => selectId(btn.getAttribute("data-issue-id")));
      });
    }
    clearTrace();
    const uids = [];
    order.forEach((id) => {
      const n = nodes().find((el) => nodeId(el) === id);
      if (n && n.dataset.flowUid) uids.push(n.dataset.flowUid);
    });
    let i = 0;
    const step = () => {
      document.querySelectorAll(".le-sk-gnode.trace").forEach((el) => el.classList.remove("trace"));
      if (i >= uids.length) {
        traceTimer = 0;
        return;
      }
      const card = document.querySelector('.le-sk-gnode[data-uid="' + uids[i] + '"]');
      if (card) {
        card.classList.add("trace");
        card.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      i += 1;
      traceTimer = setTimeout(step, 420);
    };
    step();
  }

  function selectId(id) {
    if (!id) return;
    const hit = nodes().find((n) => nodeId(n) === id);
    if (hit && typeof leSkFlowSelectNode === "function") leSkFlowSelectNode(hit);
  }

  function paint(open) {
    const host = $("le_sk_issues");
    const compile = $("le_sk_compile_warn");
    const skill = (typeof isSkillStagesMode === "function") ? isSkillStagesMode() : (document.querySelector('input[name="le_builder_mode"]:checked')?.value === "skill_stages");
    if (!skill) {
      if (host) {
        host.innerHTML = "";
        host.classList.add("hidden");
      }
      if (compile) {
        compile.textContent = "";
        compile.className = "msg";
      }
      return { errors: [], warnings: [] };
    }
    const { errors, warnings } = collect();
    const items = errors.concat(warnings);
    if (host) {
      if (!items.length) {
        host.innerHTML = open ? "<p class='le-sk-issue ok'>Graph looks ok.</p>" : "";
        host.classList.toggle("hidden", !open && !errors.length);
      } else {
        host.classList.remove("hidden");
        host.innerHTML = items.map((it) =>
          `<button type="button" class="le-sk-issue ${it.level}" data-issue-id="${esc(it.id)}">${esc(it.message)}</button>`
        ).join("");
        host.querySelectorAll("[data-issue-id]").forEach((btn) => {
          btn.addEventListener("click", () => selectId(btn.getAttribute("data-issue-id")));
        });
      }
    }
    if (compile) {
      if (errors.length) {
        compile.textContent = errors[0].message;
        compile.className = "msg err";
      } else if (warnings.length) {
        compile.textContent = warnings[0].message;
        compile.className = "msg";
      } else {
        compile.textContent = "Flow: nodes OK. Entry is the first node id.";
        compile.className = "msg";
      }
    }
    return { errors, warnings };
  }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  window.leGraphValidate = collect;
  window.leGraphValidatePaint = paint;
  window.leGraphSelectNodeId = selectId;
  window.leGraphExplain = explain;
  window.leGraphTrace = trace;
  window.leGraphClearTrace = clearTrace;
})();
