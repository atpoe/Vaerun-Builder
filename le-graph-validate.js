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

  function collect() {
    const list = nodes();
    const errors = [];
    const warnings = [];
    if (!list.length) {
      errors.push(issue("error", "", "Add at least one node."));
      return { errors, warnings };
    }

    const ids = [];
    const byId = new Map();
    list.forEach((n) => {
      const id = nodeId(n);
      if (!id) {
        errors.push(issue("error", "", "A node has an empty id."));
        return;
      }
      if (byId.has(id)) errors.push(issue("error", id, "Duplicate node id \"" + id + "\"."));
      byId.set(id, n);
      ids.push(id);
    });

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
          errors.push(issue("error", id, "\"" + id + "\" " + label + " points at missing \"" + to + "\"."));
        }
        if (allowed.indexOf(key) < 0) {
          errors.push(issue("error", id, "\"" + id + "\" wires " + label + ", which this node kind does not use."));
        }
      });
      if (kind === "look" || kind === "vfx") {
        const src = String(n.querySelector(".le-flow-look-src")?.value || "procedural").trim();
        if (src !== "vanilla") {
          const fx = String(n.querySelector(".le-flow-look-fx")?.value || "").trim();
          if (!fx) errors.push(issue("error", id, "\"" + id + "\" is missing a VFX effect id."));
          else if (!vfxKnown(fx)) warnings.push(issue("warn", id, "\"" + id + "\" VFX \"" + fx + "\" is not in the toolkit library or open pack."));
        }
      }
      if (kind === "particles") {
        const fx = String(n.querySelector(".le-flow-part-type")?.value || "").trim();
        if (fx && (fx.indexOf("vaerun:") === 0 || fx.indexOf("/") >= 0) && fx.indexOf("minecraft:") !== 0 && !vfxKnown(fx)) {
          warnings.push(issue("warn", id, "\"" + id + "\" particles \"" + fx + "\" is not in the toolkit library or open pack."));
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
      if (id && !seen.has(id)) warnings.push(issue("warn", id, "\"" + id + "\" is unreachable from the start node."));
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

    return { errors, warnings };
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
})();
