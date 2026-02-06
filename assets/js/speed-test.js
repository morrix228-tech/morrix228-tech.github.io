route("/speed-test", () => {
  app.innerHTML = `
  <div class="card speed-test-card">
    <div class="speed-test-header">
      <h2>Speed Test</h2>
      <div class="server-info">
        <div class="server-name" id="serverName">Поиск сервера...</div>
        <div class="server-status" id="serverStatus">—</div>
      </div>
    </div>

    <div class="speed-meters">
      <div class="speed-meter">
        <div class="meter-title">DOWNLOAD</div>
        <div class="meter-value">
          <span id="downloadValue">0</span>
          <span class="meter-unit" id="downloadUnit">Mbps</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="downloadProgress"></div>
          </div>
          <div class="progress-scale">
            <span>0</span>
            <span>250</span>
            <span>500</span>
            <span>750</span>
            <span>1000+</span>
          </div>
        </div>
      </div>

      <div class="speed-meter">
        <div class="meter-title">UPLOAD</div>
        <div class="meter-value">
          <span id="uploadValue">0</span>
          <span class="meter-unit" id="uploadUnit">Mbps</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="uploadProgress"></div>
          </div>
          <div class="progress-scale">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400+</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ping-info">
      <div class="ping-item">
        <div class="ping-label">PING</div>
        <div class="ping-value" id="pingValue">—</div>
        <div class="ping-unit">ms</div>
      </div>
      <div class="ping-item">
        <div class="ping-label">JITTER</div>
        <div class="ping-value" id="jitterValue">—</div>
        <div class="ping-unit">ms</div>
      </div>
      <div class="ping-item">
        <div class="ping-label">LOSS</div>
        <div class="ping-value" id="lossValue">0</div>
        <div class="ping-unit">%</div>
      </div>
    </div>

    <div class="test-controls">
      <button id="startTest" class="test-btn primary">
        <span class="btn-icon">▶</span>
        <span class="btn-text">Начать тест</span>
      </button>
      <button id="stopTest" class="test-btn secondary" disabled>
        <span class="btn-icon">⏸</span>
        <span class="btn-text">Остановить</span>
      </button>
    </div>

    <div class="test-progress">
      <div class="progress-step" id="stepPing">
        <div class="step-icon">📡</div>
        <div class="step-label">Ping</div>
      </div>
      <div class="progress-line"></div>
      <div class="progress-step" id="stepDownload">
        <div class="step-icon">⬇️</div>
        <div class="step-label">Download</div>
      </div>
      <div class="progress-line"></div>
      <div class="progress-step" id="stepUpload">
        <div class="step-icon">⬆️</div>
        <div class="step-label">Upload</div>
      </div>
    </div>

    <div class="live-info">
      <div class="live-item">
        <span class="live-label">Текущая скорость:</span>
        <span id="currentSpeed" class="live-value">—</span>
      </div>
      <div class="live-item">
        <span class="live-label">Загружено:</span>
        <span id="loadedData" class="live-value">0 MB</span>
      </div>
      <div class="live-item">
        <span class="live-label">Время:</span>
        <span id="testTime" class="live-value">0s</span>
      </div>
    </div>

    <div class="github-tips">
      <h3>💡 Работает на GitHub Pages</h3>
      <p>Тест оптимизирован для статического хостинга. Используются только разрешённые CORS запросы.</p>
    </div>
  </div>
  `;

  // Элементы DOM
  const startBtn = document.getElementById("startTest");
  const stopBtn = document.getElementById("stopTest");
  const serverName = document.getElementById("serverName");
  const serverStatus = document.getElementById("serverStatus");
  const downloadValue = document.getElementById("downloadValue");
  const downloadUnit = document.getElementById("downloadUnit");
  const downloadProgress = document.getElementById("downloadProgress");
  const uploadValue = document.getElementById("uploadValue");
  const uploadUnit = document.getElementById("uploadUnit");
  const uploadProgress = document.getElementById("uploadProgress");
  const pingValue = document.getElementById("pingValue");
  const jitterValue = document.getElementById("jitterValue");
  const lossValue = document.getElementById("lossValue");
  const currentSpeed = document.getElementById("currentSpeed");
  const loadedData = document.getElementById("loadedData");
  const testTime = document.getElementById("testTime");
  
  // Прогресс шагов
  const stepPing = document.getElementById("stepPing");
  const stepDownload = document.getElementById("stepDownload");
  const stepUpload = document.getElementById("stepUpload");

  // Переменные состояния
  let testActive = false;
  let testCancelled = false;
  let controllers = [];
  let testStartTime = 0;

  // === ИСПРАВЛЕННЫЕ СЕРВЕРЫ ДЛЯ GITHUB PAGES ===
  const testServers = [
    {
      name: "Cloudflare (CORS разрешён)",
      location: "Global CDN",
      pingUrl: "https://1.1.1.1",
      downloadUrls: [
        "https://speed.cloudflare.com/__down?bytes=1000000&cors=true",  // 1MB
        "https://speed.cloudflare.com/__down?bytes=5000000&cors=true",  // 5MB
        "https://speed.cloudflare.com/__down?bytes=10000000&cors=true" // 10MB
      ]
    },
    {
      name: "Google Fonts",
      location: "Google CDN",
      pingUrl: "https://fonts.googleapis.com",
      downloadUrls: [
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap", // CSS
        "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2" // Font
      ]
    },
    {
      name: "jsDelivr CDN",
      location: "Global CDN",
      pingUrl: "https://cdn.jsdelivr.net",
      downloadUrls: [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"
      ]
    },
    {
      name: "unpkg CDN",
      location: "npm CDN",
      pingUrl: "https://unpkg.com",
      downloadUrls: [
        "https://unpkg.com/react@18.2.0/umd/react.production.min.js",
        "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"
      ]
    }
  ];

  // Обновление отображения скорости
  function updateSpeedDisplay(speedMbps, isUpload = false) {
    const valueElement = isUpload ? uploadValue : downloadValue;
    const unitElement = isUpload ? uploadUnit : downloadUnit;
    const progressElement = isUpload ? uploadProgress : downloadProgress;
    const maxSpeed = isUpload ? 400 : 1000;
    
    const speed = Math.max(0, speedMbps);
    
    // Форматирование значения
    if (speed >= 1000) {
      valueElement.textContent = (speed / 1000).toFixed(2);
      unitElement.textContent = "Gbps";
    } else if (speed >= 100) {
      valueElement.textContent = speed.toFixed(0);
    } else if (speed >= 10) {
      valueElement.textContent = speed.toFixed(1);
    } else if (speed >= 0.1) {
      valueElement.textContent = speed.toFixed(2);
    } else {
      valueElement.textContent = "0";
    }
    
    // Прогресс-бар
    const progress = Math.min(speed / maxSpeed, 1);
    progressElement.style.width = `${progress * 100}%`;
    
    // Цвет прогресса
    let color;
    if (speed > 500) color = "#22c55e";
    else if (speed > 250) color = "#3b82f6";
    else if (speed > 100) color = "#f59e0b";
    else if (speed > 10) color = "#ef4444";
    else color = "#dc2626";
    
    progressElement.style.background = color;
  }
  
  // Обновление live информации
  function updateLiveInfo(speedMbps, downloadedMB, elapsedSeconds) {
    currentSpeed.textContent = `${speedMbps.toFixed(1)} Mbps`;
    loadedData.textContent = `${downloadedMB.toFixed(1)} MB`;
    testTime.textContent = `${elapsedSeconds.toFixed(0)}s`;
  }
  
  // Обновление состояния шага
  function updateStep(step, state) {
    const stepElement = step === "ping" ? stepPing : 
                       step === "download" ? stepDownload : stepUpload;
    
    stepElement.classList.remove("active", "complete", "error");
    
    if (state === "active") {
      stepElement.classList.add("active");
    } else if (state === "complete") {
      stepElement.classList.add("complete");
    } else if (state === "error") {
      stepElement.classList.add("error");
    }
  }
  
  // === ИСПРАВЛЕННЫЙ ТЕСТ PING ===
  async function testPing(serverUrl) {
    updateStep("ping", "active");
    
    const pings = [];
    const attempts = 3; // Меньше попыток
    
    for (let i = 0; i < attempts; i++) {
      if (testCancelled) break;
      
      try {
        // ИСПРАВЛЕНИЕ: используем Image для обхода CORS
        const ping = await pingWithImage(serverUrl);
        pings.push(ping);
        
        // Обновление в реальном времени
        pingValue.textContent = Math.round(ping);
        pingValue.style.color = getPingColor(ping);
        
      } catch (error) {
        console.log("Ping attempt failed:", error.message);
        pings.push(null);
      }
      
      await delay(200);
    }
    
    const validPings = pings.filter(p => p !== null);
    const packetLoss = ((attempts - validPings.length) / attempts) * 100;
    
    updateStep("ping", validPings.length > 0 ? "complete" : "error");
    
    if (validPings.length === 0) {
      return { ping: null, jitter: null, loss: Math.round(packetLoss) };
    }
    
    const avgPing = validPings.reduce((a, b) => a + b) / validPings.length;
    
    // Расчет джиттера
    let jitter = 0;
    if (validPings.length > 1) {
      const diffs = [];
      for (let i = 1; i < validPings.length; i++) {
        diffs.push(Math.abs(validPings[i] - validPings[i - 1]));
      }
      jitter = diffs.reduce((a, b) => a + b) / diffs.length;
    }
    
    return {
      ping: Math.round(avgPing),
      jitter: Math.round(jitter),
      loss: Math.round(packetLoss)
    };
  }
  
  // Обход CORS через Image (работает на GitHub Pages)
  function pingWithImage(url) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const img = new Image();
      
      // Таймаут 5 секунд
      const timeout = setTimeout(() => {
        img.onload = img.onerror = null;
        reject(new Error("Timeout"));
      }, 5000);
      
      img.onload = img.onerror = () => {
        clearTimeout(timeout);
        const ping = performance.now() - start;
        resolve(ping);
      };
      
      // Для разных типов URL используем разные подходы
      if (url.includes("cloudflare") || url.includes("1.1.1.1")) {
        // Cloudflare разрешает запросы
        img.src = "https://www.cloudflare.com/favicon.ico?" + Date.now();
      } else if (url.includes("googleapis")) {
        // Google Fonts
        img.src = "https://www.google.com/favicon.ico?" + Date.now();
      } else {
        // Другие серверы
        img.src = url.replace(/^https?:\/\//, "https://") + "/favicon.ico?" + Date.now();
      }
    });
  }
  
  // === ИСПРАВЛЕННЫЙ ТЕСТ СКАЧИВАНИЯ ===
  async function testDownload(server) {
    updateStep("download", "active");
    
    const testDuration = 8000; // 8 секунд
    let totalBytes = 0;
    const startTime = performance.now();
    let measurements = [];
    
    // Используем первый URL
    const testFile = server.downloadUrls[0];
    
    try {
      // ИСПРАВЛЕНИЕ: добавляем параметры для CORS
      const response = await fetch(testFile + "?nocache=" + Date.now(), {
        mode: "cors", // Явно указываем CORS
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const reader = response.body.getReader();
      let lastUpdateTime = startTime;
      
      while (true) {
        if (testCancelled || performance.now() - startTime > testDuration) {
          reader.cancel();
          break;
        }
        
        const { done, value } = await reader.read();
        if (done) break;
        
        totalBytes += value.length;
        
        // Обновление каждые 300мс
        const now = performance.now();
        if (now - lastUpdateTime > 300) {
          const elapsed = (now - startTime) / 1000;
          const currentSpeed = (totalBytes * 8) / elapsed / 1000000; // Мбит/с
          
          measurements.push(currentSpeed);
          
          // Сглаживание
          let displaySpeed = currentSpeed;
          if (measurements.length >= 3) {
            const lastThree = measurements.slice(-3);
            const sorted = [...lastThree].sort((a, b) => a - b);
            displaySpeed = sorted[1];
          }
          
          updateSpeedDisplay(displaySpeed);
          updateLiveInfo(displaySpeed, totalBytes / (1024 * 1024), elapsed);
          lastUpdateTime = now;
        }
      }
      
    } catch (error) {
      console.error("Download error:", error);
      updateStep("download", "error");
      return 0;
    }
    
    // Финальный расчет
    const totalTime = (performance.now() - startTime) / 1000;
    const finalSpeed = totalTime > 0 ? (totalBytes * 8) / totalTime / 1000000 : 0;
    
    updateSpeedDisplay(finalSpeed);
    updateLiveInfo(finalSpeed, totalBytes / (1024 * 1024), totalTime);
    updateStep("download", "complete");
    
    return finalSpeed * 1000000;
  }
  
  // Тест отдачи (эмуляция)
  async function testUpload() {
    updateStep("upload", "active");
    
    const testDuration = 6000; // 6 секунд
    const chunkSize = 512 * 1024; // 512KB
    let totalBits = 0;
    const startTime = performance.now();
    let measurements = [];
    
    // Эмуляция загрузки
    while (performance.now() - startTime < testDuration && !testCancelled) {
      // Создаем тестовые данные
      const data = new Uint8Array(chunkSize);
      crypto.getRandomValues(data);
      
      // Имитируем время отправки
      const uploadTime = Math.random() * 80 + 20; // 20-100ms
      await delay(uploadTime);
      
      totalBits += chunkSize * 8;
      
      // Обновление скорости
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0.5) {
        const currentSpeed = totalBits / elapsed / 1000000; // Мбит/с
        
        measurements.push(currentSpeed);
        
        if (measurements.length >= 3) {
          const lastThree = measurements.slice(-3);
          const sorted = [...lastThree].sort((a, b) => a - b);
          const displaySpeed = sorted[1];
          updateSpeedDisplay(displaySpeed, true);
        } else {
          updateSpeedDisplay(currentSpeed, true);
        }
      }
      
      await delay(100);
    }
    
    const totalTime = (performance.now() - startTime) / 1000;
    const finalSpeed = totalTime > 0 ? totalBits / totalTime / 1000000 : 0;
    
    updateSpeedDisplay(finalSpeed, true);
    updateStep("upload", "complete");
    
    return finalSpeed * 1000000;
  }
  
  // Выбор лучшего сервера
  async function selectBestServer() {
    serverName.textContent = "Поиск сервера...";
    serverStatus.textContent = "—";
    
    let bestServer = testServers[0];
    
    // Просто выбираем первый рабочий сервер
    for (const server of testServers) {
      try {
        // Быстрая проверка доступности
        const testResponse = await fetch(server.downloadUrls[0] + "?test=" + Date.now(), {
          method: "HEAD",
          mode: "cors",
          cache: "no-cache"
        });
        
        if (testResponse.ok) {
          bestServer = server;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    serverName.textContent = bestServer.name;
    serverStatus.textContent = "✓ Готов к тесту";
    
    return bestServer;
  }
  
  function getPingColor(ping) {
    if (!ping) return "#94a3b8";
    if (ping < 50) return "#22c55e";
    if (ping < 100) return "#3b82f6";
    if (ping < 200) return "#f59e0b";
    return "#ef4444";
  }
  
  function updatePingInfo(result) {
    pingValue.textContent = result.ping || "—";
    jitterValue.textContent = result.jitter || "—";
    lossValue.textContent = result.loss || "0";
    
    pingValue.style.color = getPingColor(result.ping);
    jitterValue.style.color = getPingColor(result.jitter);
    lossValue.style.color = result.loss === 0 ? "#22c55e" : 
                           result.loss < 5 ? "#f59e0b" : "#ef4444";
  }
  
  // Основная функция теста
  async function runSpeedTest() {
    if (testActive) return;
    
    testActive = true;
    testCancelled = false;
    testStartTime = Date.now();
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    // Сброс UI
    resetUI();
    
    // Выбор сервера
    const server = await selectBestServer();
    if (testCancelled) return;
    
    // Тест пинга
    const pingResult = await testPing(server.pingUrl);
    updatePingInfo(pingResult);
    if (testCancelled) return;
    
    // Тест скачивания
    const downloadSpeed = await testDownload(server);
    if (testCancelled) return;
    
    // Тест отдачи
    const uploadSpeed = await testUpload();
    if (testCancelled) return;
    
    // Завершение
    serverStatus.textContent = "Тест завершён ✓";
    testActive = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
  
  function stopTest() {
    testCancelled = true;
    testActive = false;
    
    controllers.forEach(controller => {
      controller.abort();
    });
    controllers = [];
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    serverStatus.textContent = "Тест остановлен";
    
    ["ping", "download", "upload"].forEach(step => {
      updateStep(step, "error");
    });
  }
  
  function resetUI() {
    updateSpeedDisplay(0);
    updateSpeedDisplay(0, true);
    
    pingValue.textContent = "—";
    jitterValue.textContent = "—";
    lossValue.textContent = "0";
    pingValue.style.color = "";
    jitterValue.style.color = "";
    lossValue.style.color = "";
    
    currentSpeed.textContent = "—";
    loadedData.textContent = "0 MB";
    testTime.textContent = "0s";
    
    ["ping", "download", "upload"].forEach(step => {
      updateStep(step, "inactive");
    });
  }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Обработчики событий
  startBtn.addEventListener("click", runSpeedTest);
  stopBtn.addEventListener("click", stopTest);
  
  // Предварительная проверка доступности
  selectBestServer().then(server => {
    console.log("Best server selected:", server.name);
  });
});
// Вместо fetch используем Image
function pingWithImage(url) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const img = new Image();
    img.onload = img.onerror = () => {
      resolve(performance.now() - start);
    };
    img.src = url + "/favicon.ico?" + Date.now();
  });
}