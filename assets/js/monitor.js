route("/monitor-test", () => {
  app.innerHTML = `
  <div class="card">
    <h2>Monitor Test</h2>
    <p>Клик — fullscreen | ← → смена режима | Esc — выход на главную</p>
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
  let isFullscreen = false;

  function resize() {
    if (isFullscreen) {
      // В полноэкранном режиме - на весь экран
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.classList.add("monitor-fullscreen");
    } else {
      // В обычном режиме - в карточке
      const card = canvas.closest('.card');
      const cardWidth = card.clientWidth;
      canvas.width = cardWidth;
      canvas.height = cardWidth * 0.75; // Соотношение 4:3
      canvas.classList.remove("monitor-fullscreen");
    }
    modes[mode]();
  }

  function fill(color){
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function gradient(){
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0, "black");
    g.addColorStop(1, "white");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function checker(){
    const s = 40;
    for(let y = 0; y < canvas.height; y += s){
      for(let x = 0; x < canvas.width; x += s){
        ctx.fillStyle = ((x + y) / s) % 2 ? "#000" : "#fff";
        ctx.fillRect(x, y, s, s);
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
      isFullscreen = true;
      resize();
    }
  };

  // Обработчик изменения полноэкранного режима
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      // Вышли из полноэкранного режима
      isFullscreen = false;
      resize();
    } else {
      // Вошли в полноэкранный режим
      isFullscreen = true;
      resize();
    }
  });

  document.onkeydown = e => {
    if (e.key === "Escape") {
      if (document.fullscreenElement) {
        // Выходим из полноэкранного режима
        document.exitFullscreen();
      } else {
        // Если не в полноэкранном режиме - переход на главную
        navigate('/');
      }
      return;
    }
    
    // Стрелки работают только в полноэкранном режиме
    if (!document.fullscreenElement) return;
    
    if (e.key === "ArrowRight") next(1);
    if (e.key === "ArrowLeft") next(-1);
  };

  // При изменении размера окна
  window.onresize = () => {
    if (isFullscreen) {
      resize();
    }
  };

  // Инициализация
  resize();
});