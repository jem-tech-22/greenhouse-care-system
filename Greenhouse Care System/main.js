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

// Close mobile menu on nav link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    closeMobileMenu();
  }
});

/* =====================
   ACTIVE NAV ON SCROLL
===================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    link.classList.add('active');
  });
});

const setActiveLink = () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 80;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', setActiveLink, { passive: true });

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

window.addEventListener('scroll', toggleExitButton, { passive: true });
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
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

/* =====================
   ANIMATE PROGRESS BARS
===================== */
const animateBars = () => {
  const tempBar = document.getElementById('tempBar');
  const humidBar = document.getElementById('humidBar');

  setTimeout(() => {
    tempBar.style.width = '68%';
    humidBar.style.width = '67%';

    // Remove shimmer after fill completes
    setTimeout(() => {
      tempBar.classList.remove('shimmer');
      humidBar.classList.remove('shimmer');
    }, 1200);
  }, 500);
};

window.addEventListener('load', animateBars);
