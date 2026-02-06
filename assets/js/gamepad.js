route("/gamepad-test", () => {
  app.innerHTML = `
  <div class="card">
    <h2>Gamepad Test</h2>

    <div id="gamepadStatus" class="status-disconnected">
      <div class="status-icon">🎮</div>
      <div class="status-text">Подключите геймпад и нажмите любую кнопку</div>
      <div class="status-type" id="gamepadType"></div>
    </div>

    <div class="gamepad-layout">
      <div class="gamepad-top">
        <div class="gamepad-left">
          <div class="stick-container">
            <div class="stick-label">L-Stick</div>
            <div class="stick" id="stickLeft">
              <div class="stick-dot" id="ls"></div>
            </div>
            <div class="stick-value" id="lsValue">X: 0.00 Y: 0.00</div>
          </div>
          
          <div class="trigger-section">
            <div class="trigger-row">
              <div class="bumper bumper-left" id="lb">LB</div>
              <div class="trigger trigger-left" id="lt">LT: 0.00</div>
            </div>
          </div>
        </div>

        <div class="gamepad-center">
          <div class="face-buttons">
            <div class="face-btn btn-y" id="y" title="Y">Y</div>
            <div class="face-btn btn-x" id="x" title="X">X</div>
            <div class="face-btn btn-a" id="a" title="A">A</div>
            <div class="face-btn btn-b" id="b" title="B">B</div>
          </div>
          <div class="center-buttons">
            <div class="dpad-container">
              <div class="dpad" id="dpad">
                <div class="dpad-up" id="dpadUp" title="Up">↑</div>
                <div class="dpad-left" id="dpadLeft" title="Left">←</div>
                <div class="dpad-center"></div>
                <div class="dpad-right" id="dpadRight" title="Right">→</div>
                <div class="dpad-down" id="dpadDown" title="Down">↓</div>
              </div>
              <div class="dpad-label">D-Pad</div>
            </div>
            <div class="special-buttons">
              <div class="special-btn btn-view" id="view" title="View/Select">⧉</div>
              <div class="special-btn btn-xbox" id="xbox" title="Home">●</div>
              <div class="special-btn btn-menu" id="menu" title="Menu/Start">☰</div>
            </div>
          </div>
        </div>

        <div class="gamepad-right">
          <div class="stick-container">
            <div class="stick-label">R-Stick</div>
            <div class="stick" id="stickRight">
              <div class="stick-dot" id="rs"></div>
            </div>
            <div class="stick-value" id="rsValue">X: 0.00 Y: 0.00</div>
          </div>
          
          <div class="trigger-section">
            <div class="trigger-row">
              <div class="bumper bumper-right" id="rb">RB</div>
              <div class="trigger trigger-right" id="rt">RT: 0.00</div>
            </div>
          </div>
        </div>
      </div>

      <div class="gamepad-bottom">
        <div class="shoulder-buttons">
          <div class="shoulder-btn" id="l3" title="Left Stick Click">L3</div>
          <div class="shoulder-btn" id="r3" title="Right Stick Click">R3</div>
        </div>
      </div>
    </div>

    <div id="gamepadInfo">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Геймпад:</span>
          <span id="gamepadName">-</span>
        </div>
        <div class="info-item">
          <span class="info-label">Кнопок:</span>
          <span id="gamepadButtons">0</span>
        </div>
        <div class="info-item">
          <span class="info-label">Остей:</span>
          <span id="gamepadAxes">0</span>
        </div>
        <div class="info-item">
          <span class="info-label">Подключен:</span>
          <span id="gamepadIndex">-</span>
        </div>
      </div>
    </div>

    <div id="gamepadHistory">
      <div class="history-header">
        <h3>История нажатий</h3>
        <button class="clear-btn" id="clearHistory">Очистить</button>
      </div>
      <div id="historyList" class="history-list"></div>
    </div>
  </div>
  `;

  // Инициализация элементов
  const ls = document.getElementById("ls");
  const rs = document.getElementById("rs");
  const lsValue = document.getElementById("lsValue");
  const rsValue = document.getElementById("rsValue");
  const stickLeft = document.getElementById("stickLeft");
  const stickRight = document.getElementById("stickRight");
  const status = document.getElementById("gamepadStatus");
  const statusText = status.querySelector(".status-text");
  const statusType = document.getElementById("gamepadType");
  const historyList = document.getElementById("historyList");
  const clearBtn = document.getElementById("clearHistory");

  // Элементы информации
  const gamepadName = document.getElementById("gamepadName");
  const gamepadButtons = document.getElementById("gamepadButtons");
  const gamepadAxes = document.getElementById("gamepadAxes");
  const gamepadIndex = document.getElementById("gamepadIndex");

  // Карта кнопок
  const buttonMap = [
    { id: "a", name: "A", element: document.getElementById("a"), color: "#22c55e" },
    { id: "b", name: "B", element: document.getElementById("b"), color: "#ef4444" },
    { id: "x", name: "X", element: document.getElementById("x"), color: "#3b82f6" },
    { id: "y", name: "Y", element: document.getElementById("y"), color: "#eab308" },
    { id: "lb", name: "LB", element: document.getElementById("lb"), color: "#8b5cf6" },
    { id: "rb", name: "RB", element: document.getElementById("rb"), color: "#8b5cf6" },
    { id: "lt", name: "LT", element: document.getElementById("lt"), color: "#06b6d4" },
    { id: "rt", name: "RT", element: document.getElementById("rt"), color: "#06b6d4" },
    { id: "view", name: "View", element: document.getElementById("view"), color: "#94a3b8" },
    { id: "menu", name: "Menu", element: document.getElementById("menu"), color: "#94a3b8" },
    { id: "l3", name: "L3", element: document.getElementById("l3"), color: "#64748b" },
    { id: "r3", name: "R3", element: document.getElementById("r3"), color: "#64748b" },
    { id: "dpadUp", name: "D-Up", element: document.getElementById("dpadUp"), color: "#475569" },
    { id: "dpadDown", name: "D-Down", element: document.getElementById("dpadDown"), color: "#475569" },
    { id: "dpadLeft", name: "D-Left", element: document.getElementById("dpadLeft"), color: "#475569" },
    { id: "dpadRight", name: "D-Right", element: document.getElementById("dpadRight"), color: "#475569" }
  ];

  // История нажатий
  const history = [];
  let lastGamepadState = {};
  let currentGamepad = null;

  // Определение типа геймпада
  function detectGamepadType(gamepad) {
    const id = gamepad.id.toLowerCase();
    
    if (id.includes("xbox") || id.includes("microsoft") || id.includes("045e")) {
      return "xbox";
    } else if (id.includes("playstation") || id.includes("sony") || id.includes("054c")) {
      return "playstation";
    } else if (id.includes("nintendo") || id.includes("switch")) {
      return "nintendo";
    } else if (id.includes("logitech") || id.includes("gamepad")) {
      return "generic";
    } else {
      return "unknown";
    }
  }

  // Обновление статуса подключения
  function updateConnectionStatus(gamepad) {
    if (gamepad) {
      currentGamepad = gamepad;
      const type = detectGamepadType(gamepad);
      
      // Обновляем статус
      status.classList.remove("status-disconnected");
      status.classList.add("status-connected");
      
      let typeText = "";
      let typeClass = "";
      
      switch(type) {
        case "xbox":
          typeText = "Xbox Controller";
          typeClass = "status-xbox";
          break;
        case "playstation":
          typeText = "PlayStation Controller";
          typeClass = "status-playstation";
          break;
        case "nintendo":
          typeText = "Nintendo Switch";
          typeClass = "status-nintendo";
          break;
        default:
          typeText = "Generic Gamepad";
          typeClass = "status-generic";
      }
      
      statusType.textContent = typeText;
      statusType.className = `status-type ${typeClass}`;
      statusText.textContent = "Геймпад подключен ✓";
      
      // Обновляем информацию
      gamepadName.textContent = gamepad.id.length > 30 ? gamepad.id.substring(0, 30) + "..." : gamepad.id;
      gamepadButtons.textContent = gamepad.buttons.length;
      gamepadAxes.textContent = gamepad.axes.length;
      gamepadIndex.textContent = gamepad.index + 1;
      
    } else {
      currentGamepad = null;
      status.classList.remove("status-connected");
      status.classList.add("status-disconnected");
      statusText.textContent = "Подключите геймпад и нажмите любую кнопку";
      statusType.textContent = "";
      
      // Сбрасываем информацию
      gamepadName.textContent = "-";
      gamepadButtons.textContent = "0";
      gamepadAxes.textContent = "0";
      gamepadIndex.textContent = "-";
    }
  }

  // Добавление в историю
  function addToHistory(buttonName, value, isAxis = false) {
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const historyItem = {
      time,
      button: buttonName,
      value: value.toFixed(2),
      isAxis,
      timestamp: timestamp.getTime()
    };
    
    history.unshift(historyItem);
    
    // Ограничиваем историю 15 записями
    if (history.length > 15) {
      history.pop();
    }
    
    updateHistoryDisplay();
  }

  // Обновление отображения истории
  function updateHistoryDisplay() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">Нет записей</div>';
      return;
    }
    
    historyList.innerHTML = history.map(item => `
      <div class="history-item ${item.isAxis ? 'history-axis' : 'history-button'}">
        <span class="history-time">${item.time}</span>
        <span class="history-button-name">${item.button}</span>
        <span class="history-value">${item.value}</span>
      </div>
    `).join('');
  }

  // Очистка истории
  clearBtn.addEventListener("click", () => {
    history.length = 0;
    updateHistoryDisplay();
  });

  // Функция для расчета смещения стика
  function updateStickPosition(stickElement, dotElement, x, y, valueElement) {
    const stickRect = stickElement.getBoundingClientRect();
    const stickRadius = stickRect.width / 2;
    const dotRadius = 15; // Радиус точки стика
    
    // Рассчитываем максимальное смещение (стик не должен выходить за пределы)
    const maxOffset = stickRadius - dotRadius;
    
    // Применяем смещение с учетом границ
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, x * maxOffset));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, y * maxOffset));
    
    // Применяем трансформацию
    dotElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // Обновляем значения
    if (valueElement) {
      valueElement.textContent = `X: ${x.toFixed(2)} Y: ${y.toFixed(2)}`;
    }
    
    return { offsetX, offsetY };
  }

  // Основной цикл обновления
  function gamepadLoop() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];
    
    updateConnectionStatus(gamepad);
    
    if (gamepad) {
      // Обновление стиков
      const [lx, ly, rx, ry] = gamepad.axes;
      
      // Обновляем позиции стиков с учетом границ
      updateStickPosition(stickLeft, ls, lx, ly, lsValue);
      updateStickPosition(stickRight, rs, rx, ry, rsValue);
      
      // Отслеживание движений стиков
      if (Math.abs(lx) > 0.1 || Math.abs(ly) > 0.1) {
        if (!lastGamepadState["ls"] || lastGamepadState["ls"].x !== lx || lastGamepadState["ls"].y !== ly) {
          addToHistory("L-Stick", Math.hypot(lx, ly), true);
        }
      }
      
      if (Math.abs(rx) > 0.1 || Math.abs(ry) > 0.1) {
        if (!lastGamepadState["rs"] || lastGamepadState["rs"].x !== rx || lastGamepadState["rs"].y !== ry) {
          addToHistory("R-Stick", Math.hypot(rx, ry), true);
        }
      }
      
      lastGamepadState["ls"] = { x: lx, y: ly };
      lastGamepadState["rs"] = { x: rx, y: ry };
      
      // Обновление кнопок
      gamepad.buttons.forEach((button, index) => {
        let buttonConfig = null;
        let element = null;
        
        // Сопоставление индексов кнопок с элементами
        switch(index) {
          case 0: buttonConfig = buttonMap[0]; break; // A
          case 1: buttonConfig = buttonMap[1]; break; // B
          case 2: buttonConfig = buttonMap[2]; break; // X
          case 3: buttonConfig = buttonMap[3]; break; // Y
          case 4: buttonConfig = buttonMap[4]; break; // LB
          case 5: buttonConfig = buttonMap[5]; break; // RB
          case 6: buttonConfig = buttonMap[6]; break; // LT
          case 7: buttonConfig = buttonMap[7]; break; // RT
          case 8: buttonConfig = buttonMap[8]; break; // View/Select
          case 9: buttonConfig = buttonMap[9]; break; // Menu/Start
          case 10: buttonConfig = buttonMap[10]; break; // L3
          case 11: buttonConfig = buttonMap[11]; break; // R3
          case 12: buttonConfig = buttonMap[12]; break; // D-Up
          case 13: buttonConfig = buttonMap[13]; break; // D-Down
          case 14: buttonConfig = buttonMap[14]; break; // D-Left
          case 15: buttonConfig = buttonMap[15]; break; // D-Right
        }
        
        if (buttonConfig && buttonConfig.element) {
          element = buttonConfig.element;
          const isPressed = button.pressed || button.value > 0.5;
          
          // Изменение стиля при нажатии
          if (isPressed) {
            element.classList.add("active");
            element.style.backgroundColor = buttonConfig.color;
            
            // Добавляем в историю при нажатии
            if (!lastGamepadState[index] || !lastGamepadState[index].pressed) {
              let value = button.value || (button.pressed ? 1 : 0);
              addToHistory(buttonConfig.name, value, false);
            }
          } else {
            element.classList.remove("active");
            element.style.backgroundColor = "";
          }
          
          // Для триггеров показываем значение
          if (index === 6 || index === 7) { // LT и RT
            element.textContent = `${buttonConfig.name}: ${button.value.toFixed(2)}`;
          }
          
          lastGamepadState[index] = { 
            pressed: isPressed, 
            value: button.value || (button.pressed ? 1 : 0) 
          };
        }
      });
    } else {
      // Сброс состояния при отключении геймпада
      buttonMap.forEach(btn => {
        if (btn.element) {
          btn.element.classList.remove("active");
          btn.element.style.backgroundColor = "";
          if (btn.id === "lt" || btn.id === "rt") {
            btn.element.textContent = btn.id.toUpperCase();
          }
        }
      });
      
      // Центрируем стики
      ls.style.transform = "translate(0, 0)";
      rs.style.transform = "translate(0, 0)";
      lsValue.textContent = "X: 0.00 Y: 0.00";
      rsValue.textContent = "X: 0.00 Y: 0.00";
      
      lastGamepadState = {};
    }
    
    requestAnimationFrame(gamepadLoop);
  }

  // Запускаем цикл
  gamepadLoop();
  
  // Обработчики событий
  window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad connected:", e.gamepad);
  });
  
  window.addEventListener("gamepaddisconnected", (e) => {
    console.log("Gamepad disconnected:", e.gamepad);
  });
});