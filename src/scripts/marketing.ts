const html = document.documentElement;

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

// ===== Cursor Glow =====
const cursorGlow = document.querySelector<HTMLElement>('.cursor-glow');
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  if (cursorGlow) {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
  }
  requestAnimationFrame(animateGlow);
}
animateGlow();

// ===== Particle System =====
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
  const count = Math.min(Math.floor(window.innerWidth / 15), 80);
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

    particles.slice(i + 1).forEach((p2) => {
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(drawParticles);
}

if (canvas && ctx) {
  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
}

// ===== Scroll Reveal Animations =====
const animatedElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
);

animatedElements.forEach((el) => observer.observe(el));

window.addEventListener('load', () => {
  document.querySelectorAll('.hero [data-animate], .nav [data-animate]').forEach((el) => {
    el.classList.add('visible');
  });
});

// ===== Smooth parallax on orbs =====
const orbs = document.querySelectorAll('.orb');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  orbs.forEach((orb, i) => {
    const speed = (i + 1) * 0.05;
    (orb as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ===== Magnetic button effect =====
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
