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
  const card = document.querySelector(".card"); // Добавляем ссылку на карточку

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
    // Размеры canvas зависят от режима
    if (document.fullscreenElement) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      // В обычном режиме canvas занимает всю ширину карточки
      const cardWidth = card.clientWidth;
      canvas.width = cardWidth;
      canvas.height = Math.min(cardWidth * 0.75, window.innerHeight * 0.6);
    }
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
      resize();
    }
  };

  // Исправленный обработчик событий fullscreen
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      // Выход из полноэкранного режима
      canvas.classList.remove("monitor-fullscreen");
      // Восстанавливаем нормальный вид карточки
      card.style.display = "block";
      // Возвращаем canvas внутрь карточки
      card.appendChild(canvas);
    } else {
      // Вход в полноэкранный режим
      canvas.classList.add("monitor-fullscreen");
      // Скрываем карточку, оставляя только canvas
      card.style.display = "none";
    }
    resize();
  });

  // Убираем старый обработчик onkeydown для Esc
  document.onkeydown = e => {
    if (!document.fullscreenElement) return;
    if (e.key === "ArrowRight") next(1);
    if (e.key === "ArrowLeft") next(-1);
    // Esc теперь обрабатывается автоматически браузером
  };

  window.onresize = resize;
  resize();
});