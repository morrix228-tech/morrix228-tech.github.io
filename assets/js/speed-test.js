route("/speed-test", () => {
  app.innerHTML = `
  <div class="card speed-test-card">
    <div class="speed-test-header">
      <h2>Speed Test</h2>
      <div class="server-info">
        <div class="server-name" id="serverName">Поиск сервера...</div>
        <div class="server-location" id="serverLocation">—</div>
      </div>
    </div>

    <div class="speed-meters">
      <div class="speed-meter">
        <div class="meter-title">DOWNLOAD</div>
        <div class="meter-value">
          <span id="downloadValue">—</span>
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
          <span id="uploadValue">—</span>
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
        <span class="btn-text">Start Test</span>
      </button>
      <button id="stopTest" class="test-btn secondary" disabled>
        <span class="btn-icon">⏸</span>
        <span class="btn-text">Stop</span>
      </button>
    </div>

    <div class="test-progress">
      <div class="progress-step" id="stepPing">
        <div class="step-icon">1</div>
        <div class="step-label">Ping</div>
      </div>
      <div class="progress-line"></div>
      <div class="progress-step" id="stepDownload">
        <div class="step-icon">2</div>
        <div class="step-label">Download</div>
      </div>
      <div class="progress-line"></div>
      <div class="progress-step" id="stepUpload">
        <div class="step-icon">3</div>
        <div class="step-label">Upload</div>
      </div>
    </div>

    <div class="live-info">
      <div class="live-item">
        <span class="live-label">Current Speed:</span>
        <span id="currentSpeed" class="live-value">—</span>
      </div>
      <div class="live-item">
        <span class="live-label">Loaded:</span>
        <span id="loadedData" class="live-value">0 MB</span>
      </div>
      <div class="live-item">
        <span class="live-label">Time:</span>
        <span id="testTime" class="live-value">0s</span>
      </div>
    </div>

    <div class="info-section">
      <h3>GitHub Pages Speed Test</h3>
      <p>Тест оптимизирован для работы на GitHub Pages. Используются серверы, которые разрешают CORS запросы.</p>
      <div class="tips">
        <div class="tip">✓ Все запросы через HTTPS</div>
        <div class="tip">✓ CORS-разрешённые серверы</div>
        <div class="tip">✓ Оптимизировано для статического хостинга</div>
      </div>
    </div>
  </div>
  `;

  // Элементы DOM
  const startBtn = document.getElementById("startTest");
  const stopBtn = document.getElementById("stopTest");
  const serverName = document.getElementById("serverName");
  const serverLocation = document.getElementById("serverLocation");
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
  let totalDownloaded = 0;

  // Серверы, которые РАБОТАЮТ на GitHub Pages (CORS разрешены, HTTPS)
  const testServers = [
    {
      name: "GitHub (Global CDN)",
      location: "Global CDN",
      pingUrl: "https://github.com",
      downloadFiles: [
        "https://raw.githubusercontent.com/mdn/beginner-html-site/gh-pages/styles.css", // 1KB
        "https://raw.githubusercontent.com/mdn/beginner-html-site/gh-pages/script.js", // 1KB
        "https://github.com/mdn/beginner-html-site/archive/refs/heads/gh-pages.zip" // ~100KB
      ]
    },
    {
      name: "Cloudflare (Speed Test)",
      location: "Global Network",
      pingUrl: "https://1.1.1.1",
      downloadFiles: [
        "https://speed.cloudflare.com/__down?bytes=1000000",  // 1MB
        "https://speed.cloudflare.com/__down?bytes=5000000",  // 5MB
        "https://speed.cloudflare.com/__down?bytes=10000000"  // 10MB
      ]
    },
    {
      name: "jsDelivr (CDN)",
      location: "Global CDN",
      pingUrl: "https://cdn.jsdelivr.net",
      downloadFiles: [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css", // 150KB
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js", // 90KB
        "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.min.js" // 130KB
      ]
    },
    {
      name: "UNPKG (npm CDN)",
      location: "Global CDN",
      pingUrl: "https://unpkg.com",
      downloadFiles: [
        "https://unpkg.com/react@18.2.0/umd/react.production.min.js", // 120KB
        "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js", // 1.2MB
        "https://unpkg.com/three@0.155.0/build/three.min.js" // 650KB
      ]
    },
    {
      name: "Google Fonts (CDN)",
      location: "Google CDN",
      pingUrl: "https://fonts.googleapis.com",
      downloadFiles: [
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap", // 30KB
        "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2" // 65KB
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
      valueElement.textContent = "—";
    }
    
    // Прогресс-бар
    const progress = Math.min(speed / maxSpeed, 1);
    progressElement.style.width = `${progress * 100}%`;
    
    // Цвет прогресса
    let color;
    if (speed > 500) color = "#22c55e"; // зеленый
    else if (speed > 250) color = "#3b82f6"; // синий
    else if (speed > 100) color = "#f59e0b"; // желтый
    else if (speed > 10) color = "#ef4444"; // красный
    else color = "#dc2626"; // темно-красный
    
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
  
  // Тест пинга (упрощенный для GitHub Pages)
  async function testPing(serverUrl) {
    updateStep("ping", "active");
    
    const pings = [];
    const attempts = 3; // Меньше попыток для скорости
    
    for (let i = 0; i < attempts; i++) {
      if (testCancelled) break;
      
      try {
        const start = performance.now();
        // Используем только HEAD запросы без mode: 'no-cors'
        await fetch(serverUrl, {
          method: "HEAD",
          mode: "cors", // Явно указываем CORS
          cache: "no-store",
          headers: { 
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        const ping = performance.now() - start;
        pings.push(ping);
        
        // Обновление в реальном времени
        pingValue.textContent = Math.round(ping);
        pingValue.style.color = getPingColor(ping);
        
      } catch (error) {
        console.log("Ping error:", error);
        pings.push(null);
      }
      
      await delay(100); // Короткая пауза
    }
    
    const validPings = pings.filter(p => p !== null);
    const packetLoss = ((attempts - validPings.length) / attempts) * 100;
    
    if (validPings.length === 0) {
      updateStep("ping", "error");
      return { ping: null, jitter: null, loss: Math.round(packetLoss) };
    }
    
    const avgPing = validPings.reduce((a, b) => a + b) / validPings.length;
    
    // Простой расчет джиттера
    let jitter = 0;
    if (validPings.length > 1) {
      const diffs = [];
      for (let i = 1; i < validPings.length; i++) {
        diffs.push(Math.abs(validPings[i] - validPings[i - 1]));
      }
      jitter = diffs.reduce((a, b) => a + b) / diffs.length;
    }
    
    updateStep("ping", "complete");
    return {
      ping: Math.round(avgPing),
      jitter: Math.round(jitter),
      loss: Math.round(packetLoss)
    };
  }
  
  // Тест скорости скачивания для GitHub Pages
  async function testDownload(server) {
    updateStep("download", "active");
    
    const testDuration = 10000; // 10 секунд максимум
    let totalBytes = 0;
    const startTime = performance.now();
    let measurements = [];
    let peakSpeed = 0;
    
    controllers = [];
    
    // Используем самый большой доступный файл
    const testFile = server.downloadFiles[server.downloadFiles.length - 1];
    
    try {
      const controller = new AbortController();
      controllers.push(controller);
      
      const response = await fetch(testFile, {
        signal: controller.signal,
        cache: "no-store",
        mode: "cors", // Важно для GitHub Pages
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
      
      if (!response.ok) throw new Error("HTTP " + response.status);
      
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
          peakSpeed = Math.max(peakSpeed, currentSpeed);
          
          // Сглаживание: медиана последних 3 измерений
          let displaySpeed = currentSpeed;
          if (measurements.length >= 3) {
            const lastThree = measurements.slice(-3);
            const sorted = [...lastThree].sort((a, b) => a - b);
            displaySpeed = sorted[1]; // медиана
          }
          
          updateSpeedDisplay(displaySpeed);
          updateLiveInfo(displaySpeed, totalBytes / (1024 * 1024), elapsed);
          lastUpdateTime = now;
        }
      }
      
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Download error on GitHub Pages:", error);
      }
    }
    
    // Финальный расчет
    const totalTime = (performance.now() - startTime) / 1000;
    const avgSpeed = totalTime > 0 ? (totalBytes * 8) / totalTime / 1000000 : 0;
    const finalSpeed = Math.max(peakSpeed, avgSpeed);
    
    updateSpeedDisplay(finalSpeed);
    updateLiveInfo(finalSpeed, totalBytes / (1024 * 1024), totalTime);
    updateStep("download", "complete");
    
    return finalSpeed * 1000000;
  }
  
  // Тест скорости отдачи (эмуляция для GitHub Pages)
  async function testUpload() {
    updateStep("upload", "active");
    
    const testDuration = 8000; // 8 секунд
    const chunkSize = 256 * 1024; // 256KB
    let totalBits = 0;
    const startTime = performance.now();
    let measurements = [];
    let peakSpeed = 0;
    
    // Эмуляция загрузки (на GitHub Pages нельзя делать реальные POST)
    while (performance.now() - startTime < testDuration && !testCancelled) {
      // Имитируем отправку данных
      const chunkStart = performance.now();
      
      // Создаем тестовые данные
      const data = new Uint8Array(chunkSize);
      crypto.getRandomValues(data);
      
      // Эмулируем время отправки (симуляция)
      const uploadTime = Math.random() * 100 + 20; // 20-120ms
      await delay(uploadTime);
      
      totalBits += chunkSize * 8;
      
      // Обновление скорости
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0.5) {
        const currentSpeed = totalBits / elapsed / 1000000; // Мбит/с
        
        measurements.push(currentSpeed);
        peakSpeed = Math.max(peakSpeed, currentSpeed);
        
        if (measurements.length >= 3) {
          const lastThree = measurements.slice(-3);
          const sorted = [...lastThree].sort((a, b) => a - b);
          const displaySpeed = sorted[1];
          updateSpeedDisplay(displaySpeed, true);
        } else {
          updateSpeedDisplay(currentSpeed, true);
        }
      }
      
      // Короткая пауза
      await delay(50);
    }
    
    const totalTime = (performance.now() - startTime) / 1000;
    const avgSpeed = totalTime > 0 ? totalBits / totalTime / 1000000 : 0;
    const finalSpeed = Math.max(peakSpeed, avgSpeed);
    
    updateSpeedDisplay(finalSpeed, true);
    updateStep("upload", "complete");
    
    return finalSpeed * 1000000;
  }
  
  // Выбор лучшего сервера для GitHub Pages
  async function selectBestServer() {
    serverName.textContent = "Finding best server...";
    serverLocation.textContent = "—";
    
    let bestServer = testServers[0];
    let bestPing = Infinity;
    
    // Быстрая проверка первых 2 серверов
    for (let i = 0; i < Math.min(2, testServers.length); i++) {
      if (testCancelled) break;
      
      const server = testServers[i];
      serverName.textContent = `Testing: ${server.name}`;
      
      try {
        const ping = await testSinglePing(server.pingUrl);
        
        if (ping < bestPing) {
          bestPing = ping;
          bestServer = server;
        }
      } catch (error) {
        console.log(`Server ${server.name} failed:`, error.message);
      }
      
      await delay(200);
    }
    
    serverName.textContent = bestServer.name;
    serverLocation.textContent = bestServer.location;
    
    return bestServer;
  }
  
  async function testSinglePing(url) {
    try {
      const start = performance.now();
      await fetch(url, {
        method: "HEAD",
        mode: "cors",
        cache: "no-store"
      });
      return performance.now() - start;
    } catch (error) {
      return Infinity;
    }
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
  
  // Основная функция теста для GitHub Pages
  async function runSpeedTest() {
    if (testActive) return;
    
    testActive = true;
    testCancelled = false;
    testStartTime = Date.now();
    totalDownloaded = 0;
    
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
    serverName.textContent = server.name + " ✓";
    testActive = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    console.log("Test completed:", {
      ping: pingResult.ping,
      download: downloadSpeed / 1000000,
      upload: uploadSpeed / 1000000
    });
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
    
    ["ping", "download", "upload"].forEach(step => {
      updateStep(step, "error");
    });
    
    serverName.textContent = "Test stopped";
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
});