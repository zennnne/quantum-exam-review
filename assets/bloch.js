/* ============================================================
   bloch.js — component วาด Bloch sphere (ภาพนิ่ง ไม่ interactive)
   สร้างตอน ticket 04 ของชุด exam/ — เดิมไม่มีรูป Bloch sphere ในโปรเจกต์เลย

   วิธีใช้:
   <div class="bloch"
        data-theta="90"          มุมจากขั้วเหนือ ∣0⟩ ลงมา (องศา) 0 = ∣0⟩, 180 = ∣1⟩, 90 = เส้นศูนย์สูตร
        data-phi="0"             มุมรอบแกน Z นับจากแกน +X ไปหา +Y (องศา) 0=∣+⟩ 90=∣+Y⟩ 180=∣−⟩ 270=∣−Y⟩
        data-lab="ROTY(90°)"     ป้ายเหนือรูป (รับ HTML — ไม่ใส่ก็ได้)
        data-cap="..."           คำบรรยายใต้รูป (รับ HTML — ไม่ใส่ก็ได้)
        data-alt="..."           aria-label (default "Bloch sphere")
        data-hl="z"              แกนที่เน้นสีส้ม: x / y / z คั่นด้วย , (ไม่ใส่ = ไม่เน้น)
        data-r="92"              รัศมีทรงกลม px (default 92)
        data-arrow="none"        ซ่อนลูกศร state (ไม่ใส่ = แสดง)
        ></div>

   convention: มุมบวก = ทวนเข็มนาฬิกาเมื่อมองจากปลายแกนบวกลงมา (ยึดตาม learning record 0010)
   ⚠️ แกน Z คือแกน "ตั้ง" (∣0⟩ ขั้วเหนือ → ∣1⟩ ขั้วใต้) — สไลด์ Lec02 p71 เขียน horizontal ผิด

   export: window.buildBloch(root)  = build ทุก .bloch ใน root (ไม่ใส่ = ทั้งหน้า)
           window.buildBlochOne(el) = build ทีละ element
   ============================================================ */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var TILT = 30 * Math.PI / 180;      /* มุมกดของแกน X ที่ยื่นเข้าหาคนดู */
  var AX = Math.cos(TILT), AY = Math.sin(TILT);
  var PADX = 62, PADY = 34;

  var INK = "#1a1a1a", SOFT = "#9aa0a6", RULE = "#c9cdd4";
  var ACCENT = "#6a3fb5", HLC = "#e07a3f", FACE = "#f7f5fb";

  function el(tag, a) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function txt(x, y, s, size, weight, anchor, fill) {
    var t = el("text", {
      x: x, y: y, "font-size": size || 13, "font-weight": weight || 700,
      "text-anchor": anchor || "middle", fill: fill || INK
    });
    t.textContent = s;
    return t;
  }
  function num(el2, key, dflt) {
    var v = parseFloat(el2.dataset[key]);
    return isNaN(v) ? dflt : v;
  }

  /* ---------- 3D → 2D ----------
     แกน Z = ตั้ง (ขึ้น) · แกน Y = นอน (ขวา) · แกน X = ยื่นเข้าหาคนดู (ซ้ายล่าง) */
  function proj(p, R, cx, cy) {
    return {
      x: cx + R * (-p[0] * AX + p[1]),
      y: cy + R * (p[0] * AY - p[2])
    };
  }
  function sph(thetaDeg, phiDeg) {
    var t = thetaDeg * Math.PI / 180, f = phiDeg * Math.PI / 180;
    return [Math.sin(t) * Math.cos(f), Math.sin(t) * Math.sin(f), Math.cos(t)];
  }

  /* เส้นศูนย์สูตร (z = 0) วาดเป็น path 2 ท่อน: ครึ่งหน้า (x>0) ทึบ · ครึ่งหลัง ประ */
  function equator(g, R, cx, cy) {
    function arc(from, to, dash) {
      var d = "", i, n = 48;
      for (i = 0; i <= n; i++) {
        var f = from + (to - from) * i / n;
        var p = proj(sph(90, f), R, cx, cy);
        d += (i ? "L" : "M") + p.x.toFixed(2) + "," + p.y.toFixed(2);
      }
      var a = { d: d, fill: "none", stroke: RULE, "stroke-width": 1.4 };
      if (dash) a["stroke-dasharray"] = "4 4";
      g.appendChild(el("path", a));
    }
    arc(-90, 90, false);   /* ครึ่งที่หันมาหาคนดู */
    arc(90, 270, true);    /* ครึ่งที่อยู่หลังทรงกลม */
  }

  /* แกนหนึ่งเส้น: ลากจากขั้วลบไปขั้วบวก + หัวลูกศรที่ปลายบวก */
  function axis(g, unit, R, cx, cy, hl) {
    var a = proj([-unit[0], -unit[1], -unit[2]], R * 1.08, cx, cy);
    var b = proj(unit, R * 1.08, cx, cy);
    var col = hl ? HLC : SOFT;
    g.appendChild(el("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: col, "stroke-width": hl ? 2.4 : 1.5
    }));
    head(g, a, b, col, 6);
  }

  /* หัวลูกศรสามเหลี่ยมที่จุด b โดยหันตามทิศ a→b */
  function head(g, a, b, col, size) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L, px = -uy, py = ux;
    var s = size, w = size * 0.62;
    var p1 = b.x + "," + b.y;
    var p2 = (b.x - ux * s + px * w) + "," + (b.y - uy * s + py * w);
    var p3 = (b.x - ux * s - px * w) + "," + (b.y - uy * s - py * w);
    g.appendChild(el("polygon", { points: p1 + " " + p2 + " " + p3, fill: col }));
  }

  function build(node) {
    var R = num(node, "r", 92);
    var theta = num(node, "theta", 0);
    var phi = num(node, "phi", 0);
    var showArrow = (node.dataset.arrow || "") !== "none";
    var hl = (node.dataset.hl || "").toLowerCase().split(",")
      .map(function (s) { return s.trim(); });
    function isHl(k) { return hl.indexOf(k) >= 0; }

    var W = 2 * R + 2 * PADX, H = 2 * R + 2 * PADY;
    var cx = W / 2, cy = H / 2;

    var svg = el("svg", {
      width: W, height: H, viewBox: "0 0 " + W + " " + H,
      role: "img", "aria-label": node.dataset.alt || "Bloch sphere"
    });

    /* ทรงกลม + เส้นศูนย์สูตร */
    svg.appendChild(el("circle", {
      cx: cx, cy: cy, r: R, fill: FACE, stroke: INK, "stroke-width": 1.6
    }));
    equator(svg, R, cx, cy);

    /* 3 แกน — วาด X ก่อน แล้ว Y แล้ว Z (Z อยู่บนสุด อ่านง่ายสุด) */
    axis(svg, [1, 0, 0], R, cx, cy, isHl("x"));
    axis(svg, [0, 1, 0], R, cx, cy, isHl("y"));
    axis(svg, [0, 0, 1], R, cx, cy, isHl("z"));

    /* ป้ายขั้วทั้ง 6 — ket + ตัวอักษรแกนตัวเล็กสีเทา
       [เวกเตอร์, ข้อความ, dx, dy, anchor, ตัวอักษรแกน, dxA, dyA] */
    var marks = [
      [[0, 0, 1], "∣0⟩", 0, -12, "middle", "Z", 13, 15],
      [[0, 0, -1], "∣1⟩", 0, 20, "middle", "", 0, 0],
      [[1, 0, 0], "∣+⟩", -5, 17, "end", "X", 18, -7],
      [[-1, 0, 0], "∣−⟩", 5, -7, "start", "", 0, 0],
      [[0, 1, 0], "∣+Y⟩", 9, 5, "start", "Y", -17, -9],
      [[0, -1, 0], "∣−Y⟩", -9, 5, "end", "", 0, 0]
    ];
    marks.forEach(function (m) {
      var p = proj(m[0], R, cx, cy);
      var key = m[5].toLowerCase();
      var on = key && isHl(key);
      /* จุดเล็กๆ ที่ขั้ว */
      svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 2.6, fill: INK }));
      svg.appendChild(txt(p.x + m[2], p.y + m[3], m[1], 13, 800, m[4], on ? HLC : INK));
      if (m[5]) {
        var q = proj([m[0][0] * 1.08, m[0][1] * 1.08, m[0][2] * 1.08], R, cx, cy);
        svg.appendChild(txt(q.x + m[6], q.y + m[7], m[5], 11, 700, "middle", on ? HLC : SOFT));
      }
    });

    /* ลูกศร state */
    if (showArrow) {
      var v = sph(theta, phi);
      var tip = proj(v, R, cx, cy);
      var ctr = { x: cx, y: cy };

      /* เส้นประช่วยอ่าน θ/φ: หย่อนจากปลายลูกศรลงระนาบศูนย์สูตร แล้วลากกลับจุดศูนย์กลาง */
      if (Math.abs(Math.sin(theta * Math.PI / 180)) > 0.02 &&
          Math.abs(Math.cos(theta * Math.PI / 180)) > 0.02) {
        var foot = proj([v[0], v[1], 0], R, cx, cy);
        svg.appendChild(el("line", {
          x1: tip.x, y1: tip.y, x2: foot.x, y2: foot.y,
          stroke: ACCENT, "stroke-width": 1.2, "stroke-dasharray": "3 3", opacity: 0.55
        }));
        svg.appendChild(el("line", {
          x1: cx, y1: cy, x2: foot.x, y2: foot.y,
          stroke: ACCENT, "stroke-width": 1.2, "stroke-dasharray": "3 3", opacity: 0.55
        }));
      }

      svg.appendChild(el("line", {
        x1: cx, y1: cy, x2: tip.x, y2: tip.y,
        stroke: ACCENT, "stroke-width": 3, "stroke-linecap": "round",
        "data-role": "state-arrow"
      }));
      head(svg, ctr, tip, ACCENT, 10);
      svg.appendChild(el("circle", { cx: cx, cy: cy, r: 3, fill: ACCENT }));
    }

    node.innerHTML = "";
    if (node.dataset.lab) {
      var lb = document.createElement("div");
      lb.className = "lab";
      lb.innerHTML = node.dataset.lab;
      node.appendChild(lb);
    }
    node.appendChild(svg);
    if (node.dataset.cap) {
      var c = document.createElement("div");
      c.className = "cap";
      c.innerHTML = node.dataset.cap;
      node.appendChild(c);
    }
  }

  function buildAll(root) {
    (root || document).querySelectorAll(".bloch").forEach(build);
  }
  window.buildBloch = buildAll;
  window.buildBlochOne = build;

  function init() { buildAll(document); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
