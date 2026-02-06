route("/mouse-test",()=>{
  app.innerHTML=`
  <div class="card">
    <h2>Mouse Test</h2>

    <div class="mouse-buttons">
      <div class="mouse-btn" id="mb0">LMB</div>
      <div class="mouse-btn" id="mb1">MMB</div>
      <div class="mouse-btn" id="mb2">RMB</div>
      <div class="mouse-btn" id="mb3">Back</div>
      <div class="mouse-btn" id="mb4">Forward</div>
    </div>

    <p id="mouseStats">Speed: 0 px/s</p>

    <div class="canvas-wrap">
      <canvas id="mouseCanvas"></canvas>
    </div>
  </div>
  `;

  const canvas = document.getElementById("mouseCanvas");
  const wrap = canvas.parentElement;
  const ctx = canvas.getContext("2d");

  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;

  let last=null,lastT=0;

  // ❌ БЛОК ВСЕЙ НАВИГАЦИИ МЫШЬЮ
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    e.stopPropagation();
    const b=document.getElementById("mb"+e.button);
    if(b)b.classList.add("active");
  });
  canvas.addEventListener("pointerup", e => {
    e.preventDefault();
    const b=document.getElementById("mb"+e.button);
    if(b)b.classList.remove("active");
  });

  canvas.addEventListener("pointermove", e => {
    const t = performance.now();
    if(last){
      const dx=e.offsetX-last.x;
      const dy=e.offsetY-last.y;
      const dist=Math.hypot(dx,dy);
      const speed=(dist/(t-lastT))*1000;

      ctx.beginPath();
      ctx.moveTo(last.x,last.y);
      ctx.lineTo(e.offsetX,e.offsetY);
      ctx.strokeStyle="#3b82f6";
      ctx.stroke();

      document.getElementById("mouseStats").textContent =
        `Speed: ${speed.toFixed(1)} px/s`;
    }
    last={x:e.offsetX,y:e.offsetY};
    lastT=t;
  });
});
