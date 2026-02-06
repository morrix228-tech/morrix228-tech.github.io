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
      e.preventDefault();
      
      // Сначала выходим из полноэкранного режима
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {}).then(() => {
          // Затем переходим на главную
          setTimeout(() => {
            // Используем ваш навигационный метод
            if (typeof navigate === 'function') {
              navigate('/');
            } else if (typeof window.history !== 'undefined') {
              window.history.pushState({}, '', '/');
              // Триггерим событие для роутера
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }, 100);
        });
      }
    }
  };

  // Также обрабатываем выход из полноэкранного режима другим способом
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      // Если вышел из полноэкранного режима (например, нажал Esc вне нашего обработчика)
      canvas.classList.remove("monitor-fullscreen");
    }
  });

  window.onresize = resize;
  resize();
});