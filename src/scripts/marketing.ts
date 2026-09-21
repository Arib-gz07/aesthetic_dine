const html = document.documentElement;
const isTouch =
  window.matchMedia('(hover: none), (pointer: coarse)').matches ||
  window.matchMedia('(max-width: 768px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep the landing hero at the true top on reload / soft navigation.
// Browser scroll restoration + late font load was pushing content under the fixed nav.
try {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} catch {
  /* ignore */
}

function shouldResetScrollToTop() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const hash = location.hash;
  return (path === '/' || path === '') && (!hash || hash === '#home');
}

function resetScrollToTop() {
  if (!shouldResetScrollToTop()) return;
  window.scrollTo(0, 0);
}

resetScrollToTop();
requestAnimationFrame(resetScrollToTop);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) resetScrollToTop();
});

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('aesthetic-theme');
if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
}

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('aesthetic-theme', next);
});

// ===== Mobile Nav =====
const nav = document.querySelector('.nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('nav-locked', Boolean(open));
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav?.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-locked');
  });
});

// ===== Cursor Glow (desktop only) =====
const cursorGlow = document.querySelector<HTMLElement>('.cursor-glow');

if (cursorGlow && !isTouch && !prefersReducedMotion) {
  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// ===== Particle System (lighter on mobile) =====
const canvas = document.getElementById('particles') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

let particles: Particle[] = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  if (!canvas) return;
  particles = [];
  const density = isTouch ? 28 : 15;
  const max = isTouch ? 28 : 80;
  const count = Math.min(Math.floor(window.innerWidth / density), max);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

function getParticleColor() {
  const theme = html.getAttribute('data-theme');
  return theme === 'dark' ? '192, 132, 252' : '147, 51, 234';
}

function drawParticles() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = getParticleColor();
  const linkDist = isTouch ? 80 : 120;

  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
    ctx.fill();

    if (!isTouch) {
      particles.slice(i + 1).forEach((p2) => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / linkDist)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    }
  });

  requestAnimationFrame(drawParticles);
}

if (canvas && ctx && !prefersReducedMotion) {
  resizeCanvas();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
} else if (canvas) {
  canvas.style.display = 'none';
}

// ===== Scroll Reveal Animations =====
function reveal(el: Element) {
  el.classList.add('visible');
}

function revealHeroAndNav() {
  document.querySelectorAll('.hero [data-animate], .nav [data-animate]').forEach(reveal);
}

// Modules often run after `window.load` — reveal immediately instead of waiting on load.
revealHeroAndNav();
requestAnimationFrame(revealHeroAndNav);

const animatedElements = document.querySelectorAll('[data-animate]');

if (prefersReducedMotion) {
  animatedElements.forEach(reveal);
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Gentler on short mobile viewports — older rootMargin hid content forever
      threshold: 0.05,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  animatedElements.forEach((el) => {
    // Already in view (e.g. hero): reveal without waiting
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      reveal(el);
    } else {
      observer.observe(el);
    }
  });

  // Safety net: never leave content invisible if observer misses
  window.setTimeout(() => {
    animatedElements.forEach((el) => {
      if (!el.classList.contains('visible')) reveal(el);
    });
  }, 2500);
}

// ===== Smooth parallax on orbs (desktop only) =====
const orbs = document.querySelectorAll('.orb');

if (!isTouch && !prefersReducedMotion && orbs.length) {
  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.05;
        (orb as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
      });
    },
    { passive: true },
  );
}

// ===== Magnetic button effect (desktop only) =====
if (!isTouch) {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const event = e as MouseEvent;
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      (btn as HTMLElement).style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      (btn as HTMLElement).style.transform = '';
    });
  });
}
