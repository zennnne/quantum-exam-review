/* ============================================================
   Quiz widget — ใช้ร่วมกันทุกบทเรียน
   วิธีใช้ใน HTML:
   <div class="quiz" data-answer="1">
     <div class="q">คำถาม…</div>
     <button class="opt">ตัวเลือก 0</button>
     <button class="opt">ตัวเลือก 1</button>   <-- ถูก (index = data-answer)
     <div class="fb ok"  data-for="ok">ฟีดแบ็กเมื่อตอบถูก</div>
     <div class="fb no"  data-for="no">ฟีดแบ็กเมื่อตอบผิด</div>
   </div>
   ให้ feedback ทันที (tight feedback loop) และล็อกไม่ให้กดซ้ำ
   ============================================================ */
document.addEventListener("click", function (e) {
  var btn = e.target.closest(".quiz button.opt");
  if (!btn) return;
  var quiz = btn.closest(".quiz");
  if (quiz.dataset.done === "1") return;

  var opts = Array.prototype.slice.call(quiz.querySelectorAll("button.opt"));
  var answer = parseInt(quiz.dataset.answer, 10);
  var picked = opts.indexOf(btn);

  opts.forEach(function (o, i) {
    o.disabled = true;
    if (i === answer) o.classList.add("correct");
  });
  if (picked !== answer) btn.classList.add("wrong");

  var fbOk = quiz.querySelector('.fb[data-for="ok"]');
  var fbNo = quiz.querySelector('.fb[data-for="no"]');
  if (picked === answer) { if (fbOk) fbOk.classList.add("show"); }
  else { if (fbNo) fbNo.classList.add("show"); }

  quiz.dataset.done = "1";
});
