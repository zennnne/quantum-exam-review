/* ============================================================
   circles.js — component วาดแถว circle notation
   สร้างตอนบท 0011 (เดิมเขียน SVG ซ้ำมือทีละวง — บท 0010 มี 24 วง!)

   วิธีใช้:
   <div class="crow"
        data-n="8"                          จำนวนวง (label |0⟩..|7⟩ อัตโนมัติ)
        data-phase="0,36,0,36,0,36,0,36"    มุมเข็ม (องศา, บวก = ทวนเข็ม)
        data-mag="1,1,1,1,1,1,1,1"          ขนาด 0–1 (0 = วงว่าง) — ไม่ใส่ = 1 หมด
        data-hl="1,3,5,7"                   วงที่ไฮไลต์สีส้ม (= "โดนกระทำ")
        data-lab="PHASE บน 0x1"             ป้ายหน้าแถว (ไม่ใส่ก็ได้)
        data-sub="50%,,,50%"                ข้อความใต้ label แต่ละวง (ไม่ใส่ก็ได้)
        data-labels="0,1,2,3"               override label (ไม่ใส่ = 0..n-1)
        data-r="16"></div>                  รัศมีวง (default 16)

   หมายเหตุ convention: มุมบวก = ทวนเข็มนาฬิกา (ยึดตาม learning record 0010)
   ============================================================ */
(function () {
  function nums(el, key, n, dflt) {
    var raw = el.dataset[key];
    if (!raw) return new Array(n).fill(dflt);
    var a = raw.split(",").map(function (s) {
      var v = parseFloat(s.trim());
      return isNaN(v) ? dflt : v;
    });
    while (a.length < n) a.push(dflt);
    return a;
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function circle(phase, mag, hl, r) {
    var pad = 4, size = (r + pad) * 2;
    var c = r + pad;
    var svg = svgEl("svg", { width: size, height: size + 2 });
    svg.appendChild(svgEl("circle", {
      cx: c, cy: c, r: r, fill: "#fff",
      stroke: hl ? "#e07a3f" : "#1a1a1a",
      "stroke-width": hl ? 2.2 : 1.5
    }));
    if (mag > 0) {
      // พื้นที่วง ∝ ความน่าจะเป็น → รัศมี ∝ √magnitude
      var ri = r * Math.sqrt(Math.max(0, Math.min(1, mag)));
      svg.appendChild(svgEl("circle", {
        cx: c, cy: c, r: ri, fill: hl ? "#f6c9a8" : "#b9d4ee"
      }));
      var th = (phase * Math.PI) / 180;
      var len = r - 2;
      svg.appendChild(svgEl("line", {
        x1: c, y1: c,
        x2: c - len * Math.sin(th),   // มุมบวก = ทวนเข็ม
        y2: c - len * Math.cos(th),
        stroke: "#2b6cb0", "stroke-width": 2
      }));
    }
    return svg;
  }

  function build(el) {
    var n = parseInt(el.dataset.n || "0", 10);
    var labels = el.dataset.labels ? el.dataset.labels.split(",") : null;
    if (!n) n = labels ? labels.length : 0;
    if (!n) return;

    var r = parseFloat(el.dataset.r || "16");
    var phase = nums(el, "phase", n, 0);
    var mag = nums(el, "mag", n, 1);
    var hl = (el.dataset.hl || "").split(",").map(function (s) { return s.trim(); });
    var sub = (el.dataset.sub || "").split(",");

    el.innerHTML = "";
    if (el.dataset.lab) {
      var lab = document.createElement("div");
      lab.className = "lab";
      lab.innerHTML = el.dataset.lab;
      el.appendChild(lab);
    }
    for (var i = 0; i < n; i++) {
      var isHl = hl.indexOf(String(i)) >= 0;
      var cell = document.createElement("div");
      cell.className = "c" + (isHl ? " hl" : "");
      cell.appendChild(circle(phase[i], mag[i], isHl, r));
      var cap = document.createElement("small");
      var name = labels ? labels[i].trim() : String(i);
      cap.innerHTML = (isHl ? "<b>|" + name + "⟩</b> ↺" : "|" + name + "⟩") +
        (sub[i] && sub[i].trim() ? "<br>" + sub[i].trim() : "");
      cell.appendChild(cap);
      el.appendChild(cell);
    }
  }

  function init() {
    document.querySelectorAll(".crow").forEach(build);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
