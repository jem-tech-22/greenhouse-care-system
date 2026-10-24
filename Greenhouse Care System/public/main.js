
/* =====================
   HAMBURGER MENU
===================== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');

const closeMobileMenu = () => {
  mobileMenu.classList.remove('open');
  mobileMenuBackdrop.classList.remove('visible');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('mobile-menu-open');
};

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');

  hamburgerBtn.classList.toggle('open', isOpen);
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
  mobileMenuBackdrop.classList.toggle('visible', isOpen);
  document.body.classList.toggle('mobile-menu-open', isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

document.addEventListener('click', (e) => {
  if (
    !mobileMenu.contains(e.target) &&
    !hamburgerBtn.contains(e.target)
  ) {
    closeMobileMenu();
  }
});


/* =====================
   ACTIVE NAV ON SCROLL
===================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll(
  '.nav-links a, .mobile-menu a'
);

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(navLink => {
      navLink.classList.remove('active');
    });

    link.classList.add('active');
  });
});

const setActiveLink = () => {
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 80;

    if (window.scrollY >= top) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      'active',
      link.getAttribute('href') === `#${current}`
    );
  });
};

window.addEventListener('scroll', setActiveLink, {
  passive: true
});


/* =====================
   EXIT
===================== */
const exitButton = document.getElementById('exitButton');
const exitDialog = document.getElementById('exitDialog');
const confirmExit = document.getElementById('confirmExit');

const toggleExitButton = () => {
  const shouldShow = window.scrollY > 320;
  const isVisible = exitButton.classList.contains('visible');

  exitButton.classList.toggle('visible', shouldShow);

  if (shouldShow && !isVisible) {
    exitButton.classList.remove('animate');

    void exitButton.offsetWidth;

    exitButton.classList.add('animate');
  }
};

exitButton.addEventListener('click', () => {
  exitDialog.showModal();
  document.body.classList.add('dialog-open');
});

confirmExit.addEventListener('click', () => {
  document.body.innerHTML = `
    <main class="exit-ended" role="main">
      <p><strong>Access Ended</strong></p>
      <p>You have exited the Greenhouse Care System.</p>
      <p>This page is no longer accessible.</p>
    </main>
  `;
});

exitDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
});

window.addEventListener('scroll', toggleExitButton, {
  passive: true
});

toggleExitButton();


/* =====================
   FADE-IN ON SCROLL
===================== */
const fadeEls = document.querySelectorAll('.fade-in-section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const index = Array.from(fadeEls).indexOf(entry.target);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80 * (index % 4));

      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

fadeEls.forEach(el => observer.observe(el));


/* =====================
   LIVE SENSOR DATA
===================== */

async function updateDashboard() {
  try {
    const response = await fetch('/api/latest');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data) {
      console.log("No sensor data available.");
      return;
    }


    /* =====================
       TEMPERATURE
    ===================== */

    const tempValue = document.getElementById('tempValue');
    const tempBar = document.getElementById('tempBar');

    const temperature = Number(data.temperature);

    if (Number.isFinite(temperature)) {
      tempValue.textContent = `${temperature.toFixed(1)}°C`;

      const tempPercent = Math.min(
        Math.max((temperature / 40) * 100, 0),
        100
      );

      tempBar.style.width = `${tempPercent}%`;
    }


    /* =====================
       HUMIDITY
    ===================== */

    const humidValue = document.getElementById('humidValue');
    const humidBar = document.getElementById('humidBar');

    const humidity = Number(data.humidity);

    if (Number.isFinite(humidity)) {
      humidValue.textContent = `${humidity.toFixed(0)}%`;

      const humidityPercent = Math.min(
        Math.max(humidity, 0),
        100
      );

      humidBar.style.width = `${humidityPercent}%`;
    }


    /* =====================
       WATER LEVEL
    ===================== */

    const waterStatus = document.getElementById('waterStatus');

    const waterLevel = Number(data.water_level);

    // 0–190 = LOW; 191 and above = NORMAL
    const isLowWater =
      Number.isFinite(waterLevel) &&
      waterLevel >= 0 &&
      waterLevel <= 190;

    if (waterStatus) {
      waterStatus.textContent = Number.isFinite(waterLevel)
        ? isLowWater
          ? `LOW (${waterLevel})`
          : `Normal (${waterLevel})`
        : 'Unavailable';
    }


    /* =====================
       FAN STATUS
    ===================== */

    const fanStatus = document.getElementById('fanStatus');

    if (fanStatus) {
      if (data.fan_status === "ON") {
        fanStatus.textContent = "On";
      } else {
        fanStatus.textContent = "Off";
      }
    }


    /* =====================
       ALERT STATUS
    ===================== */

    const alertStatus = document.getElementById('alertStatus');

    if (alertStatus) {
      alertStatus.textContent = isLowWater
        ? "Low Water"
        : "Normal";
    }


    console.log("Dashboard updated:", data);

  } catch (error) {
    console.error(
      "Failed to get sensor data:",
      error
    );
  }
}


/* =====================
   HISTORY TABLE
===================== */

async function updateHistory() {
  try {
    const response = await fetch('/api/history');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const readings = await response.json();

    const tableBody = document.querySelector(
      '#history tbody'
    );

    if (!tableBody) {
      console.error("History table body not found.");
      return;
    }

    tableBody.innerHTML = '';

    if (!Array.isArray(readings) || readings.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');

      cell.colSpan = 6;
      cell.textContent = 'No history available yet.';
      cell.style.textAlign = 'center';

      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    readings.forEach(reading => {
      const row = document.createElement('tr');

      // Preserve the original timestamp formatting
      const date = new Date(
        reading.created_at.endsWith('Z')
          ? reading.created_at
          : reading.created_at + 'Z'
      );

      const dateText = date.toLocaleDateString(
        'en-US',
        {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }
      );

      const timeText = date.toLocaleTimeString(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }
      );

      const waterLevel = Number(reading.water_level);

      // 0–190 = LOW; 191 and above = NORMAL
      const isLowWater =
        Number.isFinite(waterLevel) &&
        waterLevel >= 0 &&
        waterLevel <= 190;

      const waterText = Number.isFinite(waterLevel)
        ? isLowWater
          ? `LOW (${waterLevel})`
          : `Normal (${waterLevel})`
        : 'Unavailable';

      const fanText =
        reading.fan_status === 'ON'
          ? 'ON'
          : 'OFF';

      // Create cells without inserting sensor values as HTML
      const values = [
        dateText,
        timeText,
        `${Number(reading.temperature).toFixed(1)}°C`,
        `${Number(reading.humidity).toFixed(0)}%`,
        waterText,
        fanText
      ];

      values.forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });

    console.log(
      "History updated:",
      readings.length,
      "records"
    );

  } catch (error) {
    console.error(
      "Failed to get history:",
      error
    );
  }
}


/* =====================
   START LIVE UPDATES
===================== */

// Dashboard refreshes every 2 seconds
updateDashboard();
setInterval(updateDashboard, 2000);

// History refreshes every 60 seconds
updateHistory();
setInterval(updateHistory, 60000);
