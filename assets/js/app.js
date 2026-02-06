const app = document.getElementById("app");
const routes = {};

function route(path, render){
  routes[path] = render;
}

function navigate(path){
  history.pushState({}, "", path);
  render();
  closeMobileMenu(); // Закрываем меню после навигации
}

window.onpopstate = render;

// Функция для установки обработчиков навигации
function setupNavigation() {
  document.querySelectorAll("nav a").forEach(a => {
    a.onclick = e => {
      e.preventDefault();
      navigate(a.dataset.route);
      closeMobileMenu(); // Закрываем меню
    };
  });
}

function render(){
  const path = location.pathname;
  app.innerHTML = "";
  
  // Обновляем активные ссылки
  document.querySelectorAll("nav a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === path);
  });
  
  // Обновляем активные ссылки в мобильном меню если оно существует
  if (document.querySelector('.mobile-nav')) {
    document.querySelectorAll(".mobile-nav-link").forEach(a => {
      const route = a.dataset.route || a.getAttribute("href");
      a.classList.toggle("active", route === path);
    });
  }
  
  (routes[path] || routes["/"])();
  setupNavigation(); // Переинициализируем обработчики
}

/* КРАСИВАЯ ГЛАВНАЯ СТРАНИЦА */
route("/", ()=>{
  app.innerHTML = `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">DeviceCheck <span class="highlight">Pro</span></h1>
          <p class="hero-subtitle">Всесторонняя диагностика устройств в одном месте</p>
          <p class="hero-description">
            Бесплатный набор инструментов для тестирования клавиатуры, мыши, геймпада, 
            монитора и скорости интернета. Работает полностью офлайн.
          </p>
          
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <h3>Мгновенный запуск</h3>
                <p>Нет установки, работает в браузере</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔒</div>
              <div class="stat-content">
                <h3>Конфиденциальность</h3>
                <p>Все данные остаются на вашем устройстве</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🌙</div>
              <div class="stat-content">
                <h3>Тёмная тема</h3>
                <p>Поддержка светлого и тёмного режима</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="visual-card">
            <div class="visual-screen">
              <div class="screen-content">
                <div class="screen-row">
                  <div class="screen-dot active"></div>
                  <div class="screen-dot"></div>
                  <div class="screen-dot active"></div>
                </div>
                <div class="screen-text">DeviceCheck Pro v1.0</div>
                <div class="screen-loading">
                  <div class="loading-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="tools-section">
        <h2 class="section-title">Доступные инструменты</h2>
        <p class="section-subtitle">Выберите нужный тест для диагностики вашего устройства</p>
        
        <div class="tools-grid">

          <a href="/keyboard-test" class="tool-card" data-route="/keyboard-test">
            <div class="tool-icon">⌨️</div>
            <h3>Keyboard Test</h3>
            <p>Проверка всех клавиш, F-клавиши, модификаторы</p>
            <div class="tool-badge">Ввод</div>
          </a>
          
          <a href="/mouse-test" class="tool-card" data-route="/mouse-test">
            <div class="tool-icon">🖱️</div>
            <h3>Mouse Test</h3>
            <p>Тест кнопок мыши, скорости движения, двойного клика</p>
            <div class="tool-badge">Ввод</div>
          </a>
          
          <a href="/gamepad-test" class="tool-card" data-route="/gamepad-test">
            <div class="tool-icon">🎮</div>
            <h3>Gamepad Test</h3>
            <p>Проверка геймпада, стиков, триггеров, кнопок</p>
            <div class="tool-badge">Игры</div>
          </a>
          
          <a href="/monitor-test" class="tool-card" data-route="/monitor-test">
            <div class="tool-icon">🖥️</div>
            <h3>Monitor Test</h3>
            <p>Обнаружение битых пикселей, проверка цветопередачи</p>
            <div class="tool-badge">Вывод</div>
          </a>
          
          <div class="tool-card coming-soon">
            <div class="tool-icon">🎵</div>
            <h3>Audio Test</h3>
            <p>Проверка динамиков и микрофона (скоро)</p>
            <div class="tool-badge">Скоро</div>
          </div>
        </div>
      </div>
      
      <div class="features-section">
        <h2 class="section-title">Почему DeviceCheck Pro?</h2>
        
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">🚀</div>
            <h3>Быстро и просто</h3>
            <p>Откройте в браузере — сразу начинайте тестирование. Не требует установки.</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📱</div>
            <h3>Адаптивный дизайн</h3>
            <p>Работает на всех устройствах: компьютеры, ноутбуки, планшеты, телефоны.</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">💾</div>
            <h3>Офлайн-режим</h3>
            <p>Установите как PWA и используйте без подключения к интернету.</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🔧</div>
            <h3>Профессионально</h3>
            <p>Точные инструменты для диагностики, сравнимые с профессиональными.</p>
          </div>
        </div>
      </div>
      
      <div class="cta-section">
        <div class="cta-card">
          <h2>Начните диагностику прямо сейчас!</h2>
          <p>Выберите инструмент выше или используйте навигацию вверху страницы.</p>
          <div class="cta-buttons">
            <a href="/speed-test" class="cta-btn primary" data-route="/speed-test">
              🚀 Начать с Speed Test
            </a>
            <button onclick="navigate('/keyboard-test')" class="cta-btn secondary">
              ⌨️ Проверить клавиатуру
            </button>
          </div>
        </div>
      </div>
      
      <div class="footer-section">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="assets/img/logo.svg" alt="DeviceCheck Pro">
            <span>DeviceCheck Pro</span>
          </div>
          <p class="footer-text">
            Бесплатный инструмент для диагностики устройств. 
            Работает в браузере, не требует установки. 
            Создано с ❤️ для геймеров и IT-специалистов.
          </p>
          <div class="footer-info">
            <span>Версия: 1.0.0</span>
            <span>•</span>
            <span>Поддержка PWA</span>
            <span>•</span>
            <span>© 2024</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Инициализируем обработчики для карточек
  setTimeout(() => {
    document.querySelectorAll('.tool-card[data-route]').forEach(card => {
      card.onclick = (e) => {
        e.preventDefault();
        navigate(card.dataset.route);
        closeMobileMenu(); // Закрываем меню
      };
    });
    
    document.querySelectorAll('.cta-btn[data-route]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        navigate(btn.dataset.route);
        closeMobileMenu(); // Закрываем меню
      };
    });
    
    // Обработчик для кнопки в CTA секции
    document.querySelector('.cta-btn.secondary').onclick = (e) => {
      e.preventDefault();
      navigate('/keyboard-test');
      closeMobileMenu(); // Закрываем меню
    };
  }, 100);
});

// Создаем мобильное меню динамически
function createMobileMenu() {
  // Проверяем, не создано ли уже меню
  if (document.getElementById("mobileNav")) return;
  
  // Создаем контейнер для мобильного меню
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.id = 'mobileNav';
  mobileNav.innerHTML = `
    <div class="mobile-nav-header">
      <div class="mobile-brand">
        <img src="assets/img/logo.svg" alt="DeviceCheck Pro">
        <span>DeviceCheck Pro</span>
      </div>
      <button class="close-btn" id="closeMenu">×</button>
    </div>
    <div class="mobile-nav-links">
      <a href="/" data-route="/" class="mobile-nav-link">
        <span class="nav-icon">🏠</span>
        <span>Главная</span>
      </a>
      <a href="/speed-test" data-route="/speed-test" class="mobile-nav-link">
        <span class="nav-icon">📶</span>
        <span>Speed Test</span>
      </a>
      <a href="/gamepad-test" data-route="/gamepad-test" class="mobile-nav-link">
        <span class="nav-icon">🎮</span>
        <span>Gamepad Test</span>
      </a>
      <a href="/keyboard-test" data-route="/keyboard-test" class="mobile-nav-link">
        <span class="nav-icon">⌨️</span>
        <span>Keyboard Test</span>
      </a>
      <a href="/mouse-test" data-route="/mouse-test" class="mobile-nav-link">
        <span class="nav-icon">🖱️</span>
        <span>Mouse Test</span>
      </a>
      <a href="/monitor-test" data-route="/monitor-test" class="mobile-nav-link">
        <span class="nav-icon">🖥️</span>
        <span>Monitor Test</span>
      </a>
    </div>
  `;
  
  // Создаем оверлей
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'overlay';
  
  // Добавляем в body
  document.body.appendChild(mobileNav);
  document.body.appendChild(overlay);
  
  // Инициализируем обработчики мобильного меню
  initMobileMenu();
}

// Инициализация мобильного меню
function initMobileMenu() {
  const burger = document.getElementById("burger");
  const mobileNav = document.getElementById("mobileNav");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("closeMenu");
  
  if (!burger || !mobileNav || !overlay) return;
  
  function openMobileMenu() {
    mobileNav.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
    burger.classList.add("active");
  }
  
  function closeMobileMenu() {
    mobileNav.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    if (burger) burger.classList.remove("active");
  }
  
  // Бургер кнопка
  burger.onclick = (e) => {
    e.stopPropagation();
    if (mobileNav.classList.contains("active")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };
  
  // Кнопка закрытия
  closeBtn.onclick = closeMobileMenu;
  
  // Закрытие по клику на оверлей
  overlay.onclick = closeMobileMenu;
  
  // Закрытие по клику на ссылку в мобильном меню
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const route = link.dataset.route || link.getAttribute("href");
      if (route) {
        navigate(route);
      }
      // Закрываем меню сразу без задержки
      closeMobileMenu();
    };
  });
  
  // Закрытие при ресайзе на десктоп
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });
  
  // Закрытие по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("active")) {
      closeMobileMenu();
    }
  });
  
  // Экспортируем функцию для использования в других местах
  window.closeMobileMenu = closeMobileMenu;
}

/* Тема */
const themeToggle = document.getElementById("themeToggle");

// Инициализация темы с учетом системных настроек
function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.body.dataset.theme = savedTheme;
  } else {
    // Если тема не сохранена, используем системную
    document.body.dataset.theme = prefersDark ? 'dark' : 'light';
  }
  updateThemeIcon();
}

// Обновление иконки темы
function updateThemeIcon() {
  if (!themeToggle) return;
  const currentTheme = document.body.dataset.theme || '';
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

if (themeToggle) {
  themeToggle.onclick = () => {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
  };
}

// Слушаем изменения системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Меняем тему только если пользователь не выбрал свою
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    updateThemeIcon();
  }
});

/* PWA */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
  // Создаем мобильное меню
  createMobileMenu();
  
  // Инициализируем тему
  initTheme();
  
  // Настраиваем навигацию
  setupNavigation();
  
  // Рендерим начальную страницу
  render();
});
// Проверка поддержки SVG в манифесте
if ('serviceWorker' in navigator && 'manifest' in document) {
  navigator.serviceWorker.ready.then(registration => {
    if (registration.active) {
      console.log('Service Worker активен');
      
      // Проверяем, загрузилась ли SVG-иконка
      fetch('assets/icons/icon.svg')
        .then(response => {
          if (response.ok) {
            console.log('✅ SVG иконка доступна');
          } else {
            console.warn('⚠️ SVG иконка не найдена, используем PNG');
          }
        })
        .catch(() => {
          console.warn('⚠️ Не удалось загрузить SVG иконку');
        });
    }
  });
}
// Также вызываем render при полной загрузке страницы
window.addEventListener('load', render);