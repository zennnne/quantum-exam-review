/* ============================================================
   bars.js — component วาดกราฟแท่ง "ผลการวัดจาก QPU" (measurement histogram)
   สร้างตอนบท 0016 (ผลรัน teleportation 1,024 รอบบน IBM QX)
   ใช้ซ้ำได้ทุกครั้งที่มีผล READ หลายรอบให้อ่าน (Lec 05+ มีอีกแน่)

   วิธีใช้:
   <div class="bars"
        data-labels="00000,00001,00100"     ป้ายใต้แท่ง (คั่นด้วย ,)
        data-vals="172,110,87"              ความสูงแท่ง
        data-max="250"                      ยอดแกน y (ไม่ใส่ = คำนวณให้เอง)
        data-hl="6:ok:Success!; 7:no:Failure"   ไฮไลต์แท่ง (index:ชนิด:ป้ายบน)
                                                ชนิด: ok (เขียว) · no (แดง) · on (ม่วง)
        data-groups="0-5:Bob ทำผิด; 6-7:Bob ทำถูก"   กรอบคร่อมกลุ่มแท่ง + ป้ายใต้กรอบ
        data-cap="คำบรรยายใต้กราฟ"></div>
   ============================================================ */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PADL = 42, PADT = 34, PLOTH = 190, STEP = 56, BARW = 40, PADR = 14;
  var COLOR = {
    ok: { fill: "#cfe8db", stroke: "#1f7a4d" },
    no: { fill: "#f4d4d8", stroke: "#b23a48" },
    on: { fill: "#e0d3f5", stroke: "#6a3fb5" },
    "": { fill: "#dcd8cf", stroke: "#7a746a" }
  };

  function el(tag, a) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function txt(g, x, y, s, size, weight, fill, family) {
    var t = el("text", {
      x: x, y: y, "font-size": size || 12, "font-weight": weight || 700,
      "text-anchor": "middle", fill: fill || "#1a1a1a"
    });
    if (family) t.setAttribute("font-family", family);
    t.textContent = s;
    g.appendChild(t);
    return t;
  }

  function niceMax(v) {
    var step = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)) / 2;
    return Math.ceil(v / step) * step;
  }

  function build(node) {
    var labels = (node.dataset.labels || "").split(",").map(function (s) { return s.trim(); });
    var vals = (node.dataset.vals || "").split(",").map(function (s) { return parseFloat(s); });
    var n = vals.length;
    var max = parseFloat(node.dataset.max) || niceMax(Math.max.apply(null, vals));

    var hl = {};
    (node.dataset.hl || "").split(";").forEach(function (s) {
      if (!s.trim()) return;
      var p = s.split(":");
      hl[parseInt(p[0], 10)] = { kind: (p[1] || "on").trim(), lab: (p[2] || "").trim() };
    });

    var baseY = PADT + PLOTH;
    var W = PADL + 8 + n * STEP + PADR;
    var H = baseY + 54;
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + H, width: "100%",
      style: "max-width:" + W + "px; height:auto; display:block; margin:0 auto;"
    });

    var xOf = function (i) { return PADL + 8 + i * STEP + BARW / 2; };
    var yOf = function (v) { return baseY - (v / max) * PLOTH; };

    /* ---------- แกน y + เส้นตาราง ---------- */
    var tick = max / 5;
    for (var t = 0; t <= max + 0.001; t += tick) {
      var y = yOf(t);
      svg.appendChild(el("line", {
        x1: PADL, y1: y, x2: W - PADR + 6, y2: y,
        stroke: t === 0 ? "#1a1a1a" : "#e3ded3", "stroke-width": t === 0 ? 1.5 : 1
      }));
      var lt = el("text", {
        x: PADL - 7, y: y + 4, "font-size": 10, "font-weight": 600,
        "text-anchor": "end", fill: "#4a4a4a"
      });
      lt.textContent = t;
      svg.appendChild(lt);
    }
    svg.appendChild(el("line", {
      x1: PADL, y1: PADT - 4, x2: PADL, y2: baseY, stroke: "#1a1a1a", "stroke-width": 1.5
    }));

    /* ---------- กรอบกลุ่ม (วาดก่อน = อยู่ใต้แท่ง) ---------- */
    (node.dataset.groups || "").split(";").forEach(function (s) {
      if (!s.trim()) return;
      var p = s.split(":");
      var r = p[0].split("-");
      var a = parseInt(r[0], 10), b = parseInt(r[1] === undefined ? r[0] : r[1], 10);
      var x1 = PADL + 8 + a * STEP - 7, x2 = PADL + 8 + b * STEP + BARW + 7;
      svg.appendChild(el("rect", {
        x: x1, y: PADT - 22, width: x2 - x1, height: baseY + 24 - (PADT - 22),
        fill: "none", stroke: "#7a746a", "stroke-width": 1.3, rx: 6
      }));
      txt(svg, (x1 + x2) / 2, baseY + 42, (p[1] || "").trim(), 12, 700, "#4a4a4a");
    });

    /* ---------- แท่ง ---------- */
    for (var i = 0; i < n; i++) {
      var h = hl[i], kind = h ? h.kind : "";
      var c = COLOR[kind] || COLOR[""];
      var top = yOf(vals[i]);
      var x = PADL + 8 + i * STEP;

      if (h) {
        svg.appendChild(el("rect", {
          x: x - 5, y: PADT - 10, width: BARW + 10, height: baseY + 18 - (PADT - 10),
          fill: "none", stroke: c.stroke, "stroke-width": 1.5,
          "stroke-dasharray": "5 3", rx: 5
        }));
        if (h.lab) txt(svg, xOf(i), PADT - 16, h.lab, 12, 800, c.stroke);
      }
      svg.appendChild(el("rect", {
        x: x, y: top, width: BARW, height: baseY - top,
        fill: c.fill, stroke: c.stroke, "stroke-width": 1.6
      }));
      txt(svg, xOf(i), top - 6, vals[i], 12, 800, c.stroke);
      txt(svg, xOf(i), baseY + 15, labels[i] || "", 11, 700, "#1a1a1a",
        "Consolas, 'Courier New', monospace");
    }

    node.innerHTML = "";
    node.appendChild(svg);
    if (node.dataset.cap) {
      var cp = document.createElement("div");
      cp.className = "cap";
      cp.innerHTML = node.dataset.cap;
      node.appendChild(cp);
    }
  }

  function init() { document.querySelectorAll(".bars").forEach(build); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
