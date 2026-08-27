/* ============================================================
   logicgate.js — สัญลักษณ์ประตูลอจิกดิจิทัล "คลาสสิก" (แบบ distinctive shape)
   สร้างตอน Lec 05 — สไลด์ p56–p60 วางวงจรควอนตัมคู่กับวงจรลอจิกเทียบเท่า
   จงใจแยกไฟล์จาก circuit.js เพราะพวกนี้ *ไม่ใช่* gate บนเส้น qubit
   (ไม่มีสาย, ไม่ reversible, input/output คนละเส้นกัน)

   วิธีใช้:
   <div class="logicgate"
        data-gate="nand"          not | and | or | xor | nand | nor | xnor
        data-in="a,b"             ป้าย input (ไม่ใส่ก็ได้) — not/buf ใช้ตัวเดียว
        data-out="c"              ป้าย output (ไม่ใส่ก็ได้)
        data-cap="c = a NAND b"></div>

   หมายเหตุกันจำผิดตอนสอบ:
     - วงกลมเล็กที่ output (inverting bubble) = "แล้ว NOT ทับอีกที"
       AND + bubble = NAND · OR + bubble = NOR · XOR + bubble = XNOR
     - AND ตัวตรงหลังโค้ง (ทรงตัว D) · OR หลังเว้าเข้า ปลายแหลม
     - XOR = OR ที่มีเส้นโค้งซ้อนอีกเส้นด้านหลัง
   ============================================================ */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var INK = "#1a1a1a", W = 152, H = 70, CY = 35;

  function el(tag, a) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function path(g, d, fill) {
    g.appendChild(el("path", { d: d, fill: fill || "#fff",
      stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round" }));
  }
  function line(g, x1, y1, x2, y2) {
    g.appendChild(el("line", { x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: INK, "stroke-width": 2 }));
  }
  function label(g, x, y, s, anchor) {
    var t = el("text", { x: x, y: y + 4, "font-size": 13, "font-weight": 800,
      "text-anchor": anchor, fill: INK });
    t.textContent = s;
    g.appendChild(t);
  }

  /* body: เส้นทางรูปทรงของ gate · inX: input ลากมาถึง x เท่าไร · tip: ปลาย output */
  var SHAPE = {
    and:  { d: "M48,12 H75 A23,23 0 0 1 75,58 H48 Z", inX: 48, tip: 98, bubble: false },
    nand: { d: "M48,12 H75 A23,23 0 0 1 75,58 H48 Z", inX: 48, tip: 98, bubble: true },
    or:   { d: "M48,12 Q72,12 98,35 Q72,58 48,58 Q60,35 48,12 Z", inX: 56, tip: 98, bubble: false },
    nor:  { d: "M48,12 Q72,12 98,35 Q72,58 48,58 Q60,35 48,12 Z", inX: 56, tip: 98, bubble: true },
    xor:  { d: "M48,12 Q72,12 98,35 Q72,58 48,58 Q60,35 48,12 Z", inX: 56, tip: 98,
            bubble: false, extraArc: true },
    xnor: { d: "M48,12 Q72,12 98,35 Q72,58 48,58 Q60,35 48,12 Z", inX: 56, tip: 98,
            bubble: true, extraArc: true },
    not:  { d: "M48,12 L48,58 L94,35 Z", inX: 48, tip: 94, bubble: true, single: true },
    buf:  { d: "M48,12 L48,58 L94,35 Z", inX: 48, tip: 94, bubble: false, single: true }
  };

  function build(node) {
    var key = (node.dataset.gate || "and").trim().toLowerCase();
    var S = SHAPE[key];
    if (!S) { console.warn("logicgate.js: ไม่รู้จัก gate", key); return; }

    var ins = node.dataset.in ? node.dataset.in.split(",") : [];
    /* ขาเข้า = จำนวนป้ายที่ใส่มา (ไม่ใส่ = 2) · NAND ขาเดียว = NOT (slide p56) */
    var nIn = S.single ? 1 : (ins.length || 2);

    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H,
      role: "img", "aria-label": node.dataset.alt || ("ประตูลอจิก " + key.toUpperCase()) });

    /* เส้น input — 1 เส้นกลาง หรือ n เส้นกระจายรอบแกนกลาง */
    var ys = [];
    if (nIn === 1) ys = [CY];
    else for (var i = 0; i < nIn; i++) ys.push(CY - 12 + (24 / (nIn - 1)) * i);

    ys.forEach(function (y, i) {
      line(svg, 22, y, S.inX + (S.extraArc ? 0 : 0), y);
      if (ins[i]) label(svg, 16, y, ins[i].trim(), "end");
    });

    if (S.extraArc) {                       // เส้นโค้งซ้อนด้านหลัง = เครื่องหมายของ XOR/XNOR
      svg.appendChild(el("path", { d: "M39,12 Q51,35 39,58",
        fill: "none", stroke: INK, "stroke-width": 2.2 }));
    }
    path(svg, S.d);

    var outX = S.tip;
    if (S.bubble) {                         // inverting bubble = NOT ทับ output
      svg.appendChild(el("circle", { cx: S.tip + 6, cy: CY, r: 6,
        fill: "#fff", stroke: INK, "stroke-width": 2.2 }));
      outX = S.tip + 12;
    }
    line(svg, outX, CY, 132, CY);
    if (node.dataset.out) label(svg, 138, CY, node.dataset.out.trim(), "start");

    node.innerHTML = "";
    node.appendChild(svg);
    if (node.dataset.cap) {
      var c = document.createElement("div");
      c.className = "cap";
      c.innerHTML = node.dataset.cap;
      node.appendChild(c);
    }
  }

  /* build ซ้ำได้หลัง inject HTML ใหม่ (gate-drill.html) — ไม่กระทบ auto-init เดิม */
  function buildAll(root) {
    (root || document).querySelectorAll(".logicgate").forEach(build);
  }
  window.buildLogicGates = buildAll;

  function init() { buildAll(document); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
