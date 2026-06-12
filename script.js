/* ===== THEME TOGGLE ===== */
const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeBtn.addEventListener('click', () => {
  document.body.classList.add('theme-transitioning');
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
});

/* ===== TYPEWRITER ===== */
const titles = ['Software Engineer', 'Full-Stack Developer', 'ML / AI Enthusiast', 'Data Science Explorer', 'Indie Builder'];
let tIdx = 0, cIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');
function typeLoop() {
  const cur = titles[tIdx];
  if (deleting) {
    typedEl.textContent = cur.substring(0, cIdx--);
    if (cIdx < 0) { deleting = false; tIdx = (tIdx + 1) % titles.length; setTimeout(typeLoop, 420); return; }
    setTimeout(typeLoop, 42);
  } else {
    typedEl.textContent = cur.substring(0, cIdx++);
    if (cIdx > cur.length) { deleting = true; setTimeout(typeLoop, 1700); return; }
    setTimeout(typeLoop, 78);
  }
}
typeLoop();

/* ===== NAV SCROLL ===== */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ===== PARTICLES ===== */
const particleContainer = document.getElementById('hero-particles');
for (let i = 0; i < 28; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 3 + 1;
  p.style.cssText = `
    width:${size}px;height:${size}px;
    left:${Math.random() * 100}%;
    bottom:${Math.random() * -10}%;
    --dx:${(Math.random() - 0.5) * 120}px;
    animation-duration:${Math.random() * 12 + 8}s;
    animation-delay:${Math.random() * 10}s;
  `;
  particleContainer.appendChild(p);
}

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target = parseInt(el.dataset.count || el.textContent, 10);
  const suffix = el.dataset.suffix || (el.dataset.count ? '+' : '');
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== INTERSECTION OBSERVER ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    // counter
    entry.target.querySelectorAll('.stat-num[data-count], .stat-num[data-suffix]').forEach(animateCounter);
    io.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .timeline-item, .project-card, .achievement-item, .skill-category').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 65}ms`;
  io.observe(el);
});

// hero stats counter on load
const heroStatObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(animateCounter);
      heroStatObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroStatObserver.observe(heroStats);

/* ===== TIMELINE ACTIVE FLOW ===== */
const tlItems = document.querySelectorAll('.timeline-item');
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('tl-active');
      setTimeout(() => e.target.classList.remove('tl-active'), 1800);
    }
  });
}, { threshold: 0.4 });
tlItems.forEach(el => tlObserver.observe(el));

/* ===== ACTIVE NAV HIGHLIGHT ===== */
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navAs.forEach(a => {
    const isActive = a.getAttribute('href') === `#${current}`;
    a.style.color = isActive ? 'var(--text-primary)' : '';
    a.style.fontWeight = isActive ? '600' : '';
  });
}, { passive: true });

/* ===== MODAL SYSTEM ===== */
const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

function openModal(data) {
  document.getElementById('modal-icon').textContent = data.icon || '';
  document.getElementById('modal-meta').textContent = data.meta || '';
  document.getElementById('modal-title').textContent = data.title || '';
  document.getElementById('modal-subtitle').textContent = data.subtitle || '';
  document.getElementById('modal-body').textContent = data.desc || '';

  // points list
  const body = document.getElementById('modal-body');
  if (data.points) {
    const pts = data.points.split('|');
    const ul = document.createElement('ul');
    ul.className = 'modal-points';
    pts.forEach(pt => {
      const li = document.createElement('li');
      li.textContent = pt.trim();
      ul.appendChild(li);
    });
    body.innerHTML = '';
    if (data.desc) {
      const p = document.createElement('p');
      p.textContent = data.desc;
      p.style.marginBottom = '14px';
      body.appendChild(p);
    }
    body.appendChild(ul);
  }

  // tech badges
  const techEl = document.getElementById('modal-tech');
  techEl.innerHTML = '';
  if (data.tech) {
    data.tech.split(',').forEach(t => {
      const span = document.createElement('span');
      span.className = 'modal-tech-badge';
      span.textContent = t.trim();
      techEl.appendChild(span);
    });
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// bind all clickable cards
document.querySelectorAll('[data-modal]').forEach(el => {
  el.addEventListener('click', () => {
    openModal({
      icon: el.dataset.icon,
      title: el.dataset.title,
      subtitle: el.dataset.subtitle || '',
      meta: el.dataset.meta || '',
      desc: el.dataset.desc || '',
      points: el.dataset.points || '',
      tech: el.dataset.tech || ''
    });
  });
});

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===== CONTACT FORM ===== */
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const toast = document.getElementById('toast');
  const btn = this.querySelector('.form-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    toast.classList.add('show');
    this.reset();
    btn.textContent = 'Send message →';
    btn.disabled = false;
    setTimeout(() => toast.classList.remove('show'), 4500);
  }, 900);
});
