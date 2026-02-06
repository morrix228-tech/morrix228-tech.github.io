route("/keyboard-test", () => {
  app.innerHTML = `
  <div class="card">
    <h2>Keyboard Test</h2>
    <p class="warning">⚠️ F-клавиши (F1-F12) работают только в тесте, системные функции заблокированы</p>
    
    <div class="keyboard-container">
      <div class="kb" id="kb"></div>
    </div>
    
    <div class="keyboard-info">
      <div class="current-key-display" id="currentKey">
        <span class="key-preview" id="keyPreview">⌨️</span>
        <div class="key-details">
          <div class="key-label">Нажмите любую клавишу...</div>
          <div class="key-code" id="keyCodeDisplay"></div>
        </div>
      </div>
      
      <div class="key-stats-grid" id="keyStats">
        <div class="stat-item">
          <span class="stat-label">Код:</span>
          <span class="stat-value" id="statCode">-</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Клавиша:</span>
          <span class="stat-value" id="statKey">-</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Модификаторы:</span>
          <span class="stat-value" id="statMods">нет</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Нажато:</span>
          <span class="stat-value" id="statCount">0</span>
        </div>
      </div>
    </div>
    
    <div class="keyboard-history">
      <div class="history-header">
        <h3>История нажатий</h3>
        <button class="clear-btn" id="clearHistory">Очистить</button>
      </div>
      <div id="historyList" class="history-list"></div>
    </div>
  </div>
  `;

  const layout = [
    ["Escape","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","PrintScreen","ScrollLock","Pause"],
    ["Backquote","Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0","Minus","Equal","Backspace","Insert","Home","PageUp"],
    ["Tab","KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight","Backslash","Delete","End","PageDown"],
    ["CapsLock","KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon","Quote","Enter"],
    ["ShiftLeft","KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN","KeyM","Comma","Period","Slash","ShiftRight","ArrowUp"],
    ["ControlLeft","MetaLeft","AltLeft","Space","AltRight","ContextMenu","ControlRight","ArrowLeft","ArrowDown","ArrowRight"]
  ];

  const labels = {
    Escape:"Esc", Backspace:"Backspace", CapsLock:"Caps",
    ShiftLeft:"Shift", ShiftRight:"Shift",
    ControlLeft:"Ctrl", ControlRight:"Ctrl",
    AltLeft:"Alt", AltRight:"Alt",
    MetaLeft:"Win", ContextMenu:"Menu",
    Space:"Space", Tab:"Tab", Enter:"Enter",
    PrintScreen:"PrtSc", ScrollLock:"ScrLk", Pause:"Pause",
    Insert:"Ins", Delete:"Del", Home:"Home", End:"End",
    PageUp:"PgUp", PageDown:"PgDn",
    ArrowUp:"↑", ArrowDown:"↓", ArrowLeft:"←", ArrowRight:"→",
    F1: "F1", F2: "F2", F3: "F3", F4: "F4", 
    F5: "F5", F6: "F6", F7: "F7", F8: "F8",
    F9: "F9", F10: "F10", F11: "F11", F12: "F12"
  };

  // Элементы DOM
  const kb = document.getElementById("kb");
  const keyPreview = document.getElementById("keyPreview");
  const keyCodeDisplay = document.getElementById("keyCodeDisplay");
  const statCode = document.getElementById("statCode");
  const statKey = document.getElementById("statKey");
  const statMods = document.getElementById("statMods");
  const statCount = document.getElementById("statCount");
  const historyList = document.getElementById("historyList");
  const clearBtn = document.getElementById("clearHistory");

  // Переменные состояния
  const history = [];
  const keyPressCount = {};
  let totalPresses = 0;
  
  // Инициализация клавиатуры
  function initKeyboard() {
    kb.innerHTML = '';
    
    layout.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = `keyboard-row row-${rowIndex}`;
      
      row.forEach(code => {
        const key = createKeyElement(code);
        rowDiv.appendChild(key);
      });
      
      kb.appendChild(rowDiv);
    });
  }

  // Создание элемента клавиши
  function createKeyElement(code) {
    const key = document.createElement("div");
    key.className = "key";
    key.dataset.code = code;
    key.id = `key-${code}`;
    
    const label = labels[code] || code.replace(/Key|Digit|Arrow/, "");
    key.textContent = label;
    key.title = code;
    
    // Добавляем специальные классы
    if (["Space"].includes(code)) key.classList.add("key-space");
    if (["ShiftLeft","ShiftRight","Backspace","Enter","Tab","CapsLock","ControlLeft","ControlRight"].includes(code)) {
      key.classList.add("key-modifier");
    }
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(code)) key.classList.add("key-arrow");
    if (code.startsWith("F")) {
      key.classList.add("key-function");
      key.title = "F-клавиши заблокированы для системных функций";
    }
    
    return key;
  }

  // Блокировка системных сочетаний
  const blockSystemShortcuts = (e) => {
    // Блокируем ВСЕ F-клавиши (F1-F12)
    if (e.code.startsWith('F') && e.code.length <= 3) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
    
    // Блокировка Alt+Left/Right (навигация браузера)
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'Left', 'Right'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Разрешаем Ctrl+R и F5 для перезагрузки
    if ((e.ctrlKey && (e.key === 'r' || e.key === 'R')) || e.key === 'F5') {
      // Показываем предупреждение
      updateCurrentKeyDisplay(`${e.key === 'F5' ? 'F5' : 'Ctrl+R'}: перезагрузка разрешена`, 'warning');
      return true;
    }
    
    return true;
  };

  // Обновление отображения текущей клавиши
  function updateCurrentKeyDisplay(text, type = 'normal') {
    const keyLabel = document.querySelector('.key-label');
    if (keyLabel) {
      keyLabel.textContent = text;
      keyLabel.className = 'key-label';
      if (type !== 'normal') {
        keyLabel.classList.add(`key-label-${type}`);
      }
    }
  }

  // Обновление статистики
  function updateStats(e) {
    statCode.textContent = e.code;
    statKey.textContent = e.key;
    
    const mods = [];
    if (e.ctrlKey) mods.push("Ctrl");
    if (e.altKey) mods.push("Alt");
    if (e.shiftKey) mods.push("Shift");
    if (e.metaKey) mods.push("Win");
    
    statMods.textContent = mods.length > 0 ? mods.join(" + ") : "нет";
    
    // Счетчик нажатий
    keyPressCount[e.code] = (keyPressCount[e.code] || 0) + 1;
    totalPresses++;
    statCount.textContent = totalPresses;
    
    // Обновляем превью
    keyPreview.textContent = e.key.length === 1 ? e.key : '⌨️';
    keyCodeDisplay.textContent = e.code;
  }

  // Добавление в историю
  function addToHistory(e) {
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const historyItem = {
      time,
      code: e.code,
      key: e.key,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      timestamp: timestamp.getTime()
    };
    
    history.unshift(historyItem);
    
    // Ограничиваем историю 20 записями
    if (history.length > 20) {
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
    
    historyList.innerHTML = history.map(item => {
      const mods = [];
      if (item.ctrl) mods.push("Ctrl");
      if (item.alt) mods.push("Alt");
      if (item.shift) mods.push("Shift");
      if (item.meta) mods.push("Win");
      
      const keyDisplay = mods.length > 0 
        ? `${mods.join('+')}+${item.key}`
        : item.key;
        
      return `
        <div class="history-item">
          <span class="history-time">${item.time}</span>
          <span class="history-key">${keyDisplay}</span>
          <span class="history-code">${item.code}</span>
        </div>
      `;
    }).join('');
  }

  // Очистка истории
  clearBtn.addEventListener("click", () => {
    history.length = 0;
    Object.keys(keyPressCount).forEach(key => delete keyPressCount[key]);
    totalPresses = 0;
    statCount.textContent = "0";
    updateHistoryDisplay();
    updateCurrentKeyDisplay("Нажмите любую клавишу...");
    keyPreview.textContent = '⌨️';
    keyCodeDisplay.textContent = '';
  });

  // Обработчики клавиш
  const handleKeyDown = (e) => {
    if (blockSystemShortcuts(e) === false) {
      // Если клавиша заблокирована, всё равно показываем её нажатой
      const el = document.getElementById(`key-${e.code}`);
      if (el) {
        el.classList.add("active");
        updateStats(e);
        addToHistory(e);
        updateCurrentKeyDisplay(`${e.code} (заблокировано)`, 'blocked');
      }
      return;
    }
    
    // Обновляем статистику
    updateStats(e);
    
    // Обработка подсветки клавиш
    const el = document.getElementById(`key-${e.code}`);
    if (el) {
      el.classList.add("active");
      addToHistory(e);
      
      // Показываем текущую клавишу
      let displayText = `Нажато: ${e.code}`;
      const mods = [];
      if (e.ctrlKey) mods.push("Ctrl");
      if (e.altKey) mods.push("Alt");
      if (e.shiftKey) mods.push("Shift");
      if (e.metaKey) mods.push("Win");
      
      if (mods.length > 0) {
        displayText = `${mods.join('+')} + ${e.key}`;
      }
      updateCurrentKeyDisplay(displayText);
    }
  };

  const handleKeyUp = (e) => {
    const el = document.getElementById(`key-${e.code}`);
    if (el) {
      el.classList.remove("active");
    }
  };

  // Инициализация
  initKeyboard();
  
  // Вешаем обработчики
  document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
  document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
  
  // Адаптация к изменению размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Можно добавить перерисовку клавиатуры при необходимости
      document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('active');
      });
    }, 250);
  });
  
  // Сохраняем ссылки на обработчики для очистки
  window.currentRouteCleanup = () => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('keyup', handleKeyUp, { capture: true });
    window.removeEventListener('resize', resizeTimeout);
  };
});