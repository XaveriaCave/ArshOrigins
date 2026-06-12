/* ============================================================
   ADARSH MAURYA — PORTFOLIO JAVASCRIPT
   Canvas BG · Typed · Scroll Reveal · Popups · Theme
   ============================================================ */

'use strict';

/* ============================================================
   1. CANVAS INTERACTIVE BACKGROUND
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -1000, y: -1000 };

  const PARTICLE_COUNT = 90;
  const CONNECT_DIST   = 130;
  const MOUSE_REPEL    = 110;
  const ACCENT         = '0, 200, 255';
  const PURPLE         = '123, 47, 255';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init) {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r  = Math.random() * 2.2 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.color = Math.random() > 0.6 ? PURPLE : ACCENT;
      // pulse
      this.pulseSpeed = Math.random() * 0.025 + 0.008;
      this.pulsePhase = Math.random() * Math.PI * 2;
      // bubble-like
      this.isBubble = Math.random() > 0.82;
      this.bubbleR  = this.isBubble ? Math.random() * 18 + 8 : 0;
      if (init) {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
      }
    }

    update() {
      // Repel from mouse
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
        this.x += (dx / dist) * force * 2.4;
        this.y += (dy / dist) * force * 2.4;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.pulsePhase += this.pulseSpeed;

      // Wrap edges
      if (this.x < -20)  this.x = W + 20;
      if (this.x > W+20) this.x = -20;
      if (this.y < -20)  this.y = H + 20;
      if (this.y > H+20) this.y = -20;
    }

    draw() {
      const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;

      if (this.isBubble) {
        // Draw bubble
        const r = this.bubbleR * pulse;
        const grad = ctx.createRadialGradient(
          this.x - r * 0.3, this.y - r * 0.3, 0,
          this.x, this.y, r
        );
        grad.addColorStop(0,   `rgba(${this.color}, ${this.alpha * 0.6 * pulse})`);
        grad.addColorStop(0.6, `rgba(${this.color}, ${this.alpha * 0.1})`);
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bubble ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color}, ${this.alpha * 0.4 * pulse})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha * pulse})`;
        ctx.fill();
      }
    }
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  // Animated whirling curves in the background
  let curveAngle = 0;
  function drawCurves() {
    curveAngle += 0.004;
    for (let i = 0; i < 3; i++) {
      const phase  = curveAngle + (i * Math.PI * 2) / 3;
      const cx1    = W * 0.5 + Math.cos(phase) * W * 0.35;
      const cy1    = H * 0.5 + Math.sin(phase * 1.3) * H * 0.28;
      const cx2    = W * 0.5 + Math.cos(phase + 1.2) * W * 0.28;
      const cy2    = H * 0.5 + Math.sin(phase + 1.8) * H * 0.22;
      const alpha  = 0.025 + Math.sin(phase * 0.7) * 0.01;
      const color  = i % 2 === 0 ? ACCENT : PURPLE;

      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, W, H * 0.5);
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Second whirl
      ctx.beginPath();
      ctx.moveTo(W * 0.5, 0);
      ctx.bezierCurveTo(cx2, cy1, cx1, cy2, W * 0.5, H);
      ctx.strokeStyle = `rgba(${color}, ${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawCurves();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); buildParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  resize();
  buildParticles();
  loop();
})();

/* ============================================================
   2. CLICK / TOUCH RIPPLE
   ============================================================ */
document.addEventListener('click', function(e) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top  = e.clientY + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

/* ============================================================
   3. NAVBAR — SCROLL & ACTIVE LINK
   ============================================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);

    // Active link highlight
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();

/* ============================================================
   4. HAMBURGER MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  const links = menu.querySelectorAll('.nav-link');

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });

  links.forEach(l => l.addEventListener('click', () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
  }));
})();

/* ============================================================
   5. TYPED TEXT EFFECT
   ============================================================ */
(function initTyped() {
  const el     = document.getElementById('typed');
  const roles  = [
    'Software Engineer',
    'ML / AI Developer',
    'Full-Stack Builder',
    'Competitive Programmer',
    'Open-Source Enthusiast',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const role = roles[ri];
    if (!deleting) {
      el.textContent = role.slice(0, ++ci);
      if (ci === role.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = role.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 55 : 90);
  }
  setTimeout(tick, 600);
})();

/* ============================================================
   6. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Animate skill bars when visible
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        // Don't unobserve — keep active state
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Stagger children inside grids
  document.querySelectorAll('.skills-grid, .projects-grid, .achievements-grid').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.style.transitionDelay = (i * 0.1) + 's';
    });
  });

  // Timeline stagger
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.transitionDelay = (i * 0.12) + 's';
  });
})();

/* ============================================================
   7. THEME TOGGLE
   ============================================================ */
(function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const icon = btn.querySelector('.theme-icon');
  const html = document.documentElement;

  const saved = localStorage.getItem('theme') || 'dark';
  html.dataset.theme = saved;
  icon.textContent   = saved === 'dark' ? '☀️' : '🌙';

  btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    icon.textContent   = next === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', next);
  });
})();

/* ============================================================
   8. PROJECT POPUPS
   ============================================================ */
const PROJECT_DATA = {
  workstation: {
    title: 'Workstation',
    sub: 'Personal Project · Dec 2025 – Present',
    icon: '🏗️',
    desc: 'A collaborative platform designed to empower founders to connect, ideate, and build together. Think of it as a GitHub meets LinkedIn for startups — where ideas find team members and turn into reality.',
    points: [
      'Founder and co-founder matching based on skill sets and startup domain.',
      'Project rooms with task management, progress tracking, and collaboration tools.',
      'Idea validation features, community feedback, and investor-readiness checklists.',
      'Built with modern web stack to support real-time collaboration features.',
    ],
    tags: ['Startup', 'Full-Stack', 'Collaboration', 'Dec 2025 – Present'],
  },
  linkpad: {
    title: 'LinkPad — Alumni Portal',
    sub: 'Academic Project · Jan 2024 – Present',
    icon: '🔗',
    desc: 'A feature-rich alumni portal with an integrated fake information classifier, connecting graduates for networking, mentorship, and career opportunities.',
    points: [
      'Fake information classifier using Bi-directional RNN with over 92% accuracy.',
      '10+ features: user profiles/dashboards, job/internship matching, content recommendation.',
      'AI chatbot, event management, analytics & insights, content generation.',
      'Data security, privacy controls, and admin moderation tools.',
      'Built with Django (backend), ReactJS (frontend), and NLP pipelines.',
    ],
    tags: ['Django', 'ReactJS', 'NLP', 'Bi-RNN', 'Full-Stack', '92% Accuracy'],
  },
  antidoping: {
    title: 'Anti-Doping WebApp',
    sub: 'Smart India Hackathon 2022 · Backend Developer',
    icon: '🏅',
    desc: 'A comprehensive web application developed for the Ministry of Youth Affairs and Sports, India, as part of Smart India Hackathon 2022. Designed to educate and assist athletes about anti-doping regulations.',
    points: [
      'Built for Ministry of Youth Affairs & Sports, Government of India.',
      'Features: AI chatbot, multi-language support, drug search database, video conferencing.',
      '10+ core features with focus on accessibility and education.',
      'Backend built with Django + DRF, data stored in MongoDB, REST APIs.',
      'Responsive frontend using HTML, CSS, JavaScript, and Bootstrap.',
    ],
    tags: ['Django', 'DRF', 'MongoDB', 'REST API', 'SIH 2022', 'Government Project'],
  },
};

(function initProjectPopups() {
  const overlay = document.getElementById('popup-overlay');
  const body    = document.getElementById('popup-body');
  const closeBtn= document.getElementById('popup-close');

  function open(key) {
    const d = PROJECT_DATA[key];
    if (!d) return;
    body.innerHTML = `
      <div style="font-size:2.8rem;margin-bottom:12px">${d.icon}</div>
      <h2>${d.title}</h2>
      <div class="popup-sub">${d.sub}</div>
      <p>${d.desc}</p>
      <ul>${d.points.map(p => `<li>${p}</li>`).join('')}</ul>
      <div class="popup-tags">${d.tags.map(t => `<span>${t}</span>`).join('')}</div>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-more').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.project));
  });

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('project-more') && !e.target.classList.contains('proj-link')) {
        open(card.dataset.project);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ============================================================
   9. CONTACT FORM (demo — no real backend)
   ============================================================ */
(function initForm() {
  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = form.name.value.trim();
    const email = form.email.value.trim();
    const msg   = form.message.value.trim();

    if (!name || !email || !msg) return;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending…';

    // Simulate send delay
    setTimeout(() => {
      success.classList.add('show');
      form.reset();
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Send Message';
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1200);
  });
})();

/* ============================================================
   10. SKILL BARS — re-trigger on theme change
   ============================================================ */
function animateVisibleBars() {
  document.querySelectorAll('.skill-category.visible .skill-fill').forEach(bar => {
    bar.style.width = bar.dataset.width + '%';
  });
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  setTimeout(animateVisibleBars, 100);
});

/* ============================================================
   11. SMOOTH HOVER CURSOR GLOW on cards
   ============================================================ */
(function initCardGlow() {
  const cards = document.querySelectorAll('.glass');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

/* ============================================================
   12. PARALLAX HERO TITLE (subtle)
   ============================================================ */
(function initParallax() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    title.style.transform = `translateY(${y * 0.18}px)`;
    title.style.opacity = Math.max(0, 1 - y / 500);
  }, { passive: true });
})();

/* ============================================================
   13. CANVAS — LIGHT MODE COLOR SWAP
   ============================================================ */
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  // canvas opacity adapts to theme
  const canvas = document.getElementById('bg-canvas');
  const isDark  = document.documentElement.dataset.theme === 'dark';
  canvas.style.opacity = isDark ? '0.55' : '0.25';
});

/* ============================================================
   14. NUMBERS COUNTER ANIMATION in hero stats
   ============================================================ */
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  const targets = [1200, 1782, 5];
  const suffixes = ['+', '', '+'];
  let done = false;

  const io = new IntersectionObserver((entries) => {
    if (done) return;
    entries.forEach(e => {
      if (e.isIntersecting) {
        done = true;
        stats.forEach((stat, i) => {
          let start = 0;
          const end = targets[i];
          const duration = 1400;
          const step = end / (duration / 16);

          const timer = setInterval(() => {
            start = Math.min(start + step, end);
            stat.textContent = Math.floor(start) + suffixes[i];
            if (start >= end) clearInterval(timer);
          }, 16);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) io.observe(heroStats);
})();
