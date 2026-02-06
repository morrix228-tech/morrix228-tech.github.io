route("/monitor-test", () => {
  app.innerHTML = `
  <div class="card">
    <h2>Monitor Test</h2>
    <p>Клик — fullscreen | ← → смена режима | Esc — выход</p>
    <canvas id="mon"></canvas>
  </div>
  `;

  const canvas = document.getElementById("mon");
  const ctx = canvas.getContext("2d");

  const modes = [
    () => fill("black"),
    () => fill("white"),
    () => fill("red"),
    () => fill("green"),
    () => fill("blue"),
    gradient,
    checker
  ];

  let mode = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    modes[mode]();
  }

  function fill(color){
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  function gradient(){
    const g = ctx.createLinearGradient(0,0,canvas.width,0);
    g.addColorStop(0,"black");
    g.addColorStop(1,"white");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  function checker(){
    const s = 40;
    for(let y=0;y<canvas.height;y+=s){
      for(let x=0;x<canvas.width;x+=s){
        ctx.fillStyle = ((x+y)/s)%2?"#000":"#fff";
        ctx.fillRect(x,y,s,s);
      }
    }
  }

  function next(dir){
    mode = (mode + dir + modes.length) % modes.length;
    modes[mode]();
  }

  canvas.onclick = () => {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen();
      canvas.classList.add("monitor-fullscreen");
      resize();
    }
  };

  document.onkeydown = e => {
    if (!document.fullscreenElement) return;
    if (e.key === "ArrowRight") next(1);
    if (e.key === "ArrowLeft") next(-1);
    if (e.key === "Escape") {
      document.exitFullscreen();
      canvas.classList.remove("monitor-fullscreen");
      setTimeout(() => location.reload(), 100);
    }
  };

  window.onresize = resize;
  resize();
});