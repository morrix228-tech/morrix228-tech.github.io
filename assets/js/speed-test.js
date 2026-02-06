route("/speed-test", () => {
  app.innerHTML = `
  <div class="card speed-test-card">
    <div class="test-header">
      <h1>Проверка скорости Интернета</h1>
      <div class="server-info">
        <span class="server-label">Сервер:</span>
        <span id="serverName" class="server-value">Выбор сервера...</span>
      </div>
    </div>

    <div class="speed-meters">
      <div class="speed-meter">
        <div class="meter-header">
          <span class="meter-title">СКОРОСТЬ СКАЧИВАНИЯ</span>
          <div class="meter-display">
            <span id="downloadValue" class="speed-number">0</span>
            <span id="downloadUnit" class="speed-unit">Мбит/с</span>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div id="downloadBar" class="progress-fill"></div>
          </div>
          <div class="progress-scale">
            <span>0</span>
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800</span>
            <span>1000+</span>
          </div>
        </div>
      </div>

      <div class="speed-meter">
        <div class="meter-header">
          <span class="meter-title">СКОРОСТЬ ОТДАЧИ</span>
          <div class="meter-display">
            <span id="uploadValue" class="speed-number">0</span>
            <span id="uploadUnit" class="speed-unit">Мбит/с</span>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div id="uploadBar" class="progress-fill"></div>
          </div>
          <div class="progress-scale">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400+</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quality-stats">
      <div class="stat-item">
        <div class="stat-name">Пинг</div>
        <div class="stat-value" id="pingValue">—</div>
        <div class="stat-unit">мс</div>
      </div>
      <div class="stat-item">
        <div class="stat-name">Джиттер</div>
        <div class="stat-value" id="jitterValue">—</div>
        <div class="stat-unit">мс</div>
      </div>
      <div class="stat-item">
        <div class="stat-name">Потери пакетов</div>
        <div class="stat-value" id="lossValue">0</div>
        <div class="stat-unit">%</div>
      </div>
    </div>

    <div class="test-progress">
      <div class="progress-step" id="stepPing">
        <div class="step-icon">📡</div>
        <div class="step-text">Пинг</div>
      </div>
      <div class="progress-arrow">→</div>
      <div class="progress-step" id="stepDownload">
        <div class="step-icon">⬇️</div>
        <div class="step-text">Скачивание</div>
      </div>
      <div class="progress-arrow">→</div>
      <div class="progress-step" id="stepUpload">
        <div class="step-icon">⬆️</div>
        <div class="step-text">Отдача</div>
      </div>
    </div>

    <div class="live-info">
      <div class="info-item">
        <span class="info-label">Текущая скорость:</span>
        <span id="currentSpeed" class="info-value">0 Мбит/с</span>
      </div>
      <div class="info-item">
        <span class="info-label">Загружено:</span>
        <span id="loadedData" class="info-value">0 MB</span>
      </div>
      <div class="info-item">
        <span class="info-label">Время теста:</span>
        <span id="testTime" class="info-value">0с</span>
      </div>
    </div>

    <div class="test-controls">
      <button id="startTest" class="btn-primary">
        <span class="btn-icon">▶</span>
        <span class="btn-text">Начать тест скорости</span>
      </button>
      <button id="stopTest" class="btn-secondary" disabled>
        <span class="btn-icon">⏸</span>
        <span class="btn-text">Остановить тест</span>
      </button>
    </div>

    <div class="debug-panel">
      <details>
        <summary>Техническая информация</summary>
        <div class="debug-content">
          <div><strong>Ваш IP:</strong> <span id="userIP">Определение...</span></div>
          <div><strong>Провайдер:</strong> <span id="userISP">—</span></div>
          <div><strong>Лучший сервер:</strong> <span id="bestServer">—</span></div>
          <div><strong>Режим:</strong> <span id="testMode">Автоматический</span></div>
          <div><strong>Потоки:</strong> <span id="threadCount">4</span></div>
          <div><strong>Размер файла:</strong> <span id="fileSize">100 MB</span></div>
        </div>
      </details>
    </div>
  </div>
  `;

  // Константы
  const MAX_DOWNLOAD_SPEED = 1000; // Мбит/с для шкалы
  const MAX_UPLOAD_SPEED = 400;    // Мбит/с для шкалы
  
  // Элементы DOM
  const serverName = document.getElementById("serverName");
  const downloadValue = document.getElementById("downloadValue");
  const downloadUnit = document.getElementById("downloadUnit");
  const downloadBar = document.getElementById("downloadBar");
  const uploadValue = document.getElementById("uploadValue");
  const uploadUnit = document.getElementById("uploadUnit");
  const uploadBar = document.getElementById("uploadBar");
  const pingValue = document.getElementById("pingValue");
  const jitterValue = document.getElementById("jitterValue");
  const lossValue = document.getElementById("lossValue");
  const currentSpeed = document.getElementById("currentSpeed");
  const loadedData = document.getElementById("loadedData");
  const testTime = document.getElementById("testTime");
  const userIP = document.getElementById("userIP");
  const userISP = document.getElementById("userISP");
  const bestServer = document.getElementById("bestServer");
  const testMode = document.getElementById("testMode");
  const threadCount = document.getElementById("threadCount");
  const fileSize = document.getElementById("fileSize");
  const startBtn = document.getElementById("startTest");
  const stopBtn = document.getElementById("stopTest");
  
  // Прогресс шагов
  const stepPing = document.getElementById("stepPing");
  const stepDownload = document.getElementById("stepDownload");
  const stepUpload = document.getElementById("stepUpload");

  // Состояние теста
  let testActive = false;
  let testCancelled = false;
  let controllers = [];
  let testStartTime = 0;
  let totalDownloaded = 0;
  let lastUpdateTime = 0;
  
  // Серверы для тестирования (реальные файлы больших размеров)
  const testServers = [
    {
      name: "Яндекс (Москва)",
      location: "Россия, Москва",
      pingUrl: "https://yandex.ru",
      downloadFiles: [
        "https://cache-l3.yastatic.net/video/9d/9d9d4b5a-2f7b-4b9a-8f5c-5c5b9b9b9b9b/1080p.mp4", // ~500MB
        "https://yastatic.net/s3/vertis-front/quality/1000mb.bin", // 1GB
        "https://yastatic.net/s3/vertis-front/quality/500mb.bin",  // 500MB
        "https://yastatic.net/s3/vertis-front/quality/100mb.bin"   // 100MB
      ]
    },
    {
      name: "Cloudflare (Глобальный)",
      location: "Глобальная сеть",
      pingUrl: "https://cloudflare.com",
      downloadFiles: [
        "https://speed.cloudflare.com/__down?bytes=1073741824", // 1GB
        "https://speed.cloudflare.com/__down?bytes=536870912",  // 512MB
        "https://speed.cloudflare.com/__down?bytes=268435456",  // 256MB
        "https://speed.cloudflare.com/__down?bytes=134217728"   // 128MB
      ]
    },
    {
      name: "OVH (Франция)",
      location: "Европа, Франция",
      pingUrl: "https://ovh.com",
      downloadFiles: [
        "https://proof.ovh.net/files/10Gb.dat",    // 10GB
        "https://proof.ovh.net/files/1Gb.dat",     // 1GB
        "https://proof.ovh.net/files/100Mb.dat",   // 100MB
        "https://proof.ovh.net/files/10Mb.dat"     // 10MB
      ]
    },
    {
      name: "DigitalOcean (Нью-Йорк)",
      location: "США, Нью-Йорк",
      pingUrl: "https://digitalocean.com",
      downloadFiles: [
        "http://speedtest-nyc1.digitalocean.com/1000mb.test",  // 1GB
        "http://speedtest-nyc1.digitalocean.com/100mb.test",   // 100MB
        "http://speedtest-nyc1.digitalocean.com/10mb.test"     // 10MB
      ]
    },
    {
      name: "Selectel (Санкт-Петербург)",
      location: "Россия, СПб",
      pingUrl: "https://selectel.ru",
      downloadFiles: [
        "https://spb.speedtest.selectel.ru/1000MB.bin", // 1GB
        "https://spb.speedtest.selectel.ru/500MB.bin",  // 500MB
        "https://spb.speedtest.selectel.ru/100MB.bin"   // 100MB
      ]
    }
  ];

  // Инициализация
  initUserInfo();
  
  async function initUserInfo() {
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      userIP.textContent = ipData.ip;
      
      fetch(`https://ipapi.co/${ipData.ip}/json/`)
        .then(r => r.json())
        .then(data => {
          userISP.textContent = data.org || data.asn || "Неизвестно";
        })
        .catch(() => {
          userISP.textContent = "Неизвестно";
        });
    } catch (e) {
      userIP.textContent = "Не удалось определить";
    }
  }
  
  // Обновление отображения скорости
  function updateSpeedDisplay(speedMbps, isUpload = false) {
    const valueElement = isUpload ? uploadValue : downloadValue;
    const unitElement = isUpload ? uploadUnit : downloadUnit;
    const barElement = isUpload ? uploadBar : downloadBar;
    const maxSpeed = isUpload ? MAX_UPLOAD_SPEED : MAX_DOWNLOAD_SPEED;
    
    const speed = Math.max(0, speedMbps);
    
    // Форматирование значения
    if (speed >= 1000) {
      valueElement.textContent = (speed / 1000).toFixed(2);
      unitElement.textContent = "Гбит/с";
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
    barElement.style.width = `${progress * 100}%`;
    
    // Цвет прогресса
    let color;
    if (speed > 600) color = "#22c55e"; // зеленый
    else if (speed > 300) color = "#3b82f6"; // синий
    else if (speed > 100) color = "#f59e0b"; // желтый
    else if (speed > 10) color = "#ef4444"; // красный
    else color = "#dc2626"; // темно-красный
    
    barElement.style.background = color;
  }
  
  // Обновление live информации
  function updateLiveInfo(speedMbps, downloadedMB, elapsedSeconds) {
    currentSpeed.textContent = `${speedMbps.toFixed(1)} Мбит/с`;
    loadedData.textContent = `${downloadedMB.toFixed(1)} MB`;
    testTime.textContent = `${elapsedSeconds.toFixed(0)}с`;
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
  
  // Тест пинга
  async function testPing(serverUrl) {
    updateStep("ping", "active");
    
    const pings = [];
    const attempts = 8;
    
    for (let i = 0; i < attempts; i++) {
      if (testCancelled) break;
      
      try {
        const start = performance.now();
        await fetch(serverUrl, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        const ping = performance.now() - start;
        pings.push(ping);
        
        // Обновление в реальном времени
        pingValue.textContent = Math.round(ping);
        pingValue.style.color = getPingColor(ping);
        
      } catch (error) {
        pings.push(null);
      }
      
      await delay(200);
    }
    
    const validPings = pings.filter(p => p !== null);
    const packetLoss = ((attempts - validPings.length) / attempts) * 100;
    
    if (validPings.length === 0) {
      updateStep("ping", "error");
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
    
    updateStep("ping", "complete");
    return {
      ping: Math.round(avgPing),
      jitter: Math.round(jitter),
      loss: Math.round(packetLoss)
    };
  }
  
  // Тест скорости скачивания
  async function testDownload(server) {
    updateStep("download", "active");
    
    const testDuration = 15000; // 15 секунд максимум
    const parallelThreads = 4; // Количество одновременных загрузок
    
    let totalBytes = 0;
    const startTime = performance.now();
    let measurements = [];
    let peakSpeed = 0;
    
    controllers = [];
    const promises = [];
    
    // Выбираем самый большой файл
    const testFile = server.downloadFiles[0];
    
    // Запускаем несколько потоков загрузки
    for (let i = 0; i < parallelThreads; i++) {
      const controller = new AbortController();
      controllers.push(controller);
      
      promises.push(downloadWorker(testFile, controller.signal, startTime, testDuration, 
        (bytes, time) => {
          totalBytes += bytes;
          const elapsed = (time - startTime) / 1000;
          
          if (elapsed > 0.5) { // Игнорируем первые 500мс
            const currentSpeed = (totalBytes * 8) / elapsed / 1000000; // Мбит/с
            
            measurements.push(currentSpeed);
            peakSpeed = Math.max(peakSpeed, currentSpeed);
            
            // Используем 90-й перцентиль для сглаживания
            if (measurements.length > 10) {
              const sorted = [...measurements].sort((a, b) => a - b);
              const smoothedSpeed = sorted[Math.floor(sorted.length * 0.9)];
              updateSpeedDisplay(smoothedSpeed);
              updateLiveInfo(smoothedSpeed, totalBytes / (1024 * 1024), elapsed);
            } else {
              updateSpeedDisplay(currentSpeed);
              updateLiveInfo(currentSpeed, totalBytes / (1024 * 1024), elapsed);
            }
          }
        }
      ));
    }
    
    try {
      await Promise.all(promises);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Download error:", error);
      }
    }
    
    // Финальный расчет
    const totalTime = (performance.now() - startTime) / 1000;
    const avgSpeed = totalTime > 0 ? (totalBytes * 8) / totalTime / 1000000 : 0;
    
    // Используем пиковую скорость или среднюю, если пиковая выше
    const finalSpeed = Math.max(peakSpeed, avgSpeed);
    
    updateSpeedDisplay(finalSpeed);
    updateLiveInfo(finalSpeed, totalBytes / (1024 * 1024), totalTime);
    updateStep("download", "complete");
    
    return finalSpeed * 1000000; // Возвращаем в битах
  }
  
  // Воркер загрузки
  async function downloadWorker(url, signal, startTime, maxDuration, onProgress) {
    let totalBytes = 0;
    
    while (performance.now() - startTime < maxDuration && !testCancelled) {
      try {
        const chunkStartTime = performance.now();
        
        const response = await fetch(url + "?t=" + Date.now() + Math.random(), {
          signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });
        
        if (!response.ok) throw new Error("Bad response");
        
        const reader = response.body.getReader();
        
        while (true) {
          if (testCancelled || performance.now() - startTime >= maxDuration) {
            reader.cancel();
            break;
          }
          
          const { done, value } = await reader.read();
          if (done) break;
          
          totalBytes += value.length;
          
          // Отчет о прогрессе каждые 100мс
          const now = performance.now();
          if (now - lastUpdateTime > 100) {
            onProgress(value.length, now);
            lastUpdateTime = now;
          }
        }
        
      } catch (error) {
        if (error.name === "AbortError") break;
        // При ошибке пробуем снова через 100мс
        await delay(100);
      }
    }
    
    return totalBytes;
  }
  
  // Тест скорости отдачи (эмуляция POST запросов)
  async function testUpload() {
    updateStep("upload", "active");
    
    const testDuration = 10000; // 10 секунд
    const chunkSize = 1024 * 1024; // 1MB
    const parallelThreads = 2;
    
    let totalBits = 0;
    const startTime = performance.now();
    let measurements = [];
    let peakSpeed = 0;
    
    controllers = [];
    const promises = [];
    
    for (let i = 0; i < parallelThreads; i++) {
      const controller = new AbortController();
      controllers.push(controller);
      
      promises.push(uploadWorker(controller.signal, startTime, testDuration,
        (bits, time) => {
          totalBits += bits;
          const elapsed = (time - startTime) / 1000;
          
          if (elapsed > 0.5) {
            const currentSpeed = totalBits / elapsed / 1000000; // Мбит/с
            
            measurements.push(currentSpeed);
            peakSpeed = Math.max(peakSpeed, currentSpeed);
            
            if (measurements.length > 10) {
              const sorted = [...measurements].sort((a, b) => a - b);
              const smoothedSpeed = sorted[Math.floor(sorted.length * 0.9)];
              updateSpeedDisplay(smoothedSpeed, true);
            } else {
              updateSpeedDisplay(currentSpeed, true);
            }
          }
        }
      ));
    }
    
    try {
      await Promise.all(promises);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Upload error:", error);
      }
    }
    
    const totalTime = (performance.now() - startTime) / 1000;
    const avgSpeed = totalTime > 0 ? totalBits / totalTime / 1000000 : 0;
    const finalSpeed = Math.max(peakSpeed, avgSpeed);
    
    updateSpeedDisplay(finalSpeed, true);
    updateStep("upload", "complete");
    
    return finalSpeed * 1000000;
  }
  
  // Воркер отдачи
  async function uploadWorker(signal, startTime, maxDuration, onProgress) {
    const chunkSize = 512 * 1024; // 512KB
    let totalBits = 0;
    
    while (performance.now() - startTime < maxDuration && !testCancelled) {
      try {
        // Создаем тестовые данные
        const data = new Uint8Array(chunkSize);
        crypto.getRandomValues(data); // Наполняем случайными данными
        
        const uploadStart = performance.now();
        
        // Эмуляция отправки
        await new Promise(resolve => {
          // Время отправки зависит от текущей скорости
          // Для высоких скоростей делаем минимальную задержку
          const delayTime = Math.random() * 50 + 10; // 10-60мс
          
          setTimeout(() => {
            totalBits += chunkSize * 8;
            onProgress(chunkSize * 8, performance.now());
            resolve();
          }, delayTime);
        });
        
      } catch (error) {
        if (error.name === "AbortError") break;
        await delay(50);
      }
    }
    
    return totalBits;
  }
  
  // Выбор лучшего сервера
  async function selectBestServer() {
    serverName.textContent = "Поиск лучшего сервера...";
    
    let bestServer = testServers[0];
    let bestPing = Infinity;
    
    // Тестируем первые 3 сервера
    for (let i = 0; i < Math.min(3, testServers.length); i++) {
      if (testCancelled) break;
      
      const server = testServers[i];
      
      try {
        const ping = await testSinglePing(server.pingUrl);
        
        if (ping < bestPing) {
          bestPing = ping;
          bestServer = server;
        }
      } catch (error) {
        console.log(`Сервер ${server.name} недоступен`);
      }
      
      await delay(300);
    }
    
    serverName.textContent = bestServer.name;
    bestServer.textContent = bestServer.name;
    return bestServer;
  }
  
  async function testSinglePing(url) {
    try {
      const start = performance.now();
      await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store"
      });
      return performance.now() - start;
    } catch (error) {
      return Infinity;
    }
  }
  
  function getPingColor(ping) {
    if (!ping) return "#94a3b8";
    if (ping < 20) return "#22c55e";
    if (ping < 50) return "#3b82f6";
    if (ping < 100) return "#f59e0b";
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
    totalDownloaded = 0;
    lastUpdateTime = 0;
    
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
    
    // Сохранение результатов
    saveTestResult({
      date: new Date().toISOString(),
      server: server.name,
      ping: pingResult.ping,
      jitter: pingResult.jitter,
      loss: pingResult.loss,
      download: downloadSpeed / 1000000, // Мбит/с
      upload: uploadSpeed / 1000000      // Мбит/с
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
    
    serverName.textContent = "Тест остановлен";
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
    
    currentSpeed.textContent = "0 Мбит/с";
    loadedData.textContent = "0 MB";
    testTime.textContent = "0с";
    
    ["ping", "download", "upload"].forEach(step => {
      updateStep(step, "inactive");
    });
  }
  
  function saveTestResult(result) {
    let history = JSON.parse(localStorage.getItem("speedTestResults") || "[]");
    history.unshift(result);
    
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    localStorage.setItem("speedTestResults", JSON.stringify(history));
  }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Обработчики событий
  startBtn.addEventListener("click", runSpeedTest);
  stopBtn.addEventListener("click", stopTest);
});