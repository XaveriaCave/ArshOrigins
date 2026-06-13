/* ============================================================
   ADARSH MAURYA — PORTFOLIO JAVASCRIPT
   Canvas BG · Typed · Scroll Reveal · Popups · Theme
   ============================================================ */

'use strict';

/* ============================================================
   1. SUMINAGASHI — Japanese Ink Marbling Background
   Concentric ink rings drift, deform, and swirl on water.
   Click / touch drops a new ink ring at that point.
   ============================================================ */
(function initSuminagashi() {

  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  /* ---- colour palettes for dark / light ---- */
  const PALETTES = {
    dark: [
      { h: 195, s: 100, l: 50 },  // cyan
      { h: 210, s: 90,  l: 60 },  // sky blue
      { h: 270, s: 80,  l: 55 },  // violet
      { h: 220, s: 70,  l: 40 },  // deep blue
      { h: 185, s: 85,  l: 45 },  // teal
      { h: 250, s: 70,  l: 65 },  // lavender
    ],
    light: [
      { h: 195, s: 100, l: 32 },  // deep cyan
      { h: 210, s: 95,  l: 28 },  // deep blue
      { h: 270, s: 85,  l: 32 },  // deep violet
      { h: 220, s: 90,  l: 25 },  // navy
      { h: 185, s: 90,  l: 28 },  // deep teal
      { h: 250, s: 80,  l: 35 },  // indigo
    ],
  };

  function getPalette() {
    return document.documentElement.dataset.theme === 'light'
      ? PALETTES.light : PALETTES.dark;
  }

  /* ---- ring pool ---- */
  const rings = [];
  const MAX_RINGS = 28;

  /* Velocity field — a slow 2-D curl flow distorts all rings */
  let fieldT = 0;

  function fieldVelocity(x, y, t) {
    const nx = x / W, ny = y / H;
    const vx = Math.sin(ny * Math.PI * 2 + t * 0.4) * 0.38
             + Math.cos(nx * Math.PI * 1.3 + t * 0.27) * 0.22;
    const vy = Math.cos(nx * Math.PI * 2 + t * 0.35) * 0.38
             + Math.sin(ny * Math.PI * 1.7 + t * 0.31) * 0.22;
    return { vx, vy };
  }

  /* ---- Ring class ---- */
  class InkRing {
    constructor(x, y, isClick) {
      const pal   = getPalette();
      const col   = pal[Math.floor(Math.random() * pal.length)];
      this.cx     = x;
      this.cy     = y;
      this.r      = isClick ? 1 : Math.random() * 60 + 10;
      this.maxR   = isClick
        ? Math.random() * 320 + 180
        : Math.random() * 280 + 120;
      this.speed  = isClick
        ? Math.random() * 1.1 + 0.7
        : Math.random() * 0.55 + 0.18;
      const isLight = document.documentElement.dataset.theme === 'light';
      this.alpha  = isClick
        ? (isLight ? 0.80 : 0.55)
        : (isLight ? Math.random() * 0.45 + 0.28 : Math.random() * 0.28 + 0.10);
      this.lineW  = isClick
        ? Math.random() * 1.8 + 0.8
        : (isLight ? Math.random() * 1.8 + 0.8 : Math.random() * 1.2 + 0.3);
      this.hue    = col.h + (Math.random() - 0.5) * 22;
      this.sat    = col.s;
      this.lit    = col.l;
      this.dead   = false;
      /* deformation: each ring has N control points that drift independently */
      this.N      = Math.floor(Math.random() * 6 + 8);   // 8–13 control pts
      this.phases = Array.from({ length: this.N }, () => Math.random() * Math.PI * 2);
      this.freqs  = Array.from({ length: this.N }, () => Math.random() * 0.025 + 0.006);
      this.amps   = Array.from({ length: this.N }, () => Math.random() * 0.22 + 0.04);
      /* drift velocity */
      this.dvx    = (Math.random() - 0.5) * 0.14;
      this.dvy    = (Math.random() - 0.5) * 0.10;
    }

    update(t) {
      if (this.dead) return;
      this.r += this.speed;
      /* advance deformation phases */
      for (let i = 0; i < this.N; i++) this.phases[i] += this.freqs[i];
      /* drift centre with the velocity field */
      const { vx, vy } = fieldVelocity(this.cx, this.cy, t);
      this.cx += vx * 0.38 + this.dvx;
      this.cy += vy * 0.38 + this.dvy;
      /* fade near death */
      const life = this.r / this.maxR;
      if (life > 0.72) this.alpha *= 0.992;
      if (this.r >= this.maxR || this.alpha < 0.004) this.dead = true;
    }

    draw(t) {
      if (this.dead || this.r <= 0) return;
      const pts = this.N;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        /* radial deformation: blend multiple harmonics */
        let rDelta = 0;
        for (let k = 0; k < pts; k++) {
          rDelta += Math.sin(angle * (k + 1) + this.phases[k]) * this.amps[k];
        }
        const r = this.r * (1 + rDelta * (0.5 + this.r / this.maxR * 0.5));
        const px = this.cx + Math.cos(angle) * r;
        const py = this.cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();

      /* iridescent stroke — hue shifts around the ring */
      const grd = ctx.createConicGradient
        ? ctx.createConicGradient(0, this.cx, this.cy)
        : null;
      if (grd) {
        const steps = 8;
        for (let s = 0; s <= steps; s++) {
          const hShift = this.hue + Math.sin(t * 0.3 + s) * 28;
          grd.addColorStop(s / steps,
            `hsla(${hShift}, ${this.sat}%, ${this.lit}%, ${this.alpha})`);
        }
        ctx.strokeStyle = grd;
      } else {
        ctx.strokeStyle =
          `hsla(${this.hue}, ${this.sat}%, ${this.lit}%, ${this.alpha})`;
      }
      ctx.lineWidth = this.lineW;
      ctx.stroke();
    }
  }

  /* ---- seed the initial rings spread across the canvas ---- */
  function seedRings() {
    rings.length = 0;
    const count = Math.min(MAX_RINGS, Math.floor(W * H / 26000) + 12);
    for (let i = 0; i < count; i++) {
      const ring = new InkRing(
        Math.random() * W,
        Math.random() * H,
        false
      );
      /* stagger them at random ages so they're not all born together */
      ring.r = Math.random() * ring.maxR * 0.6;
      rings.push(ring);
    }
  }

  /* ---- spawn on click / touch ---- */
  function spawnAt(x, y) {
    /* drop 2–3 nested rings per click, offset slightly — authentic suminagashi
       uses a single needle dip that produces concentric rings */
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      if (rings.length >= MAX_RINGS + 8) rings.shift();
      const r = new InkRing(
        x + (Math.random() - 0.5) * 8,
        y + (Math.random() - 0.5) * 8,
        true
      );
      r.r = i * (8 + Math.random() * 14); // slight stagger
      rings.push(r);
    }
  }

  /* ---- main loop ---- */
  let raf;
  function loop() {
    fieldT += 0.008;
    ctx.clearRect(0, 0, W, H);

    /* cull dead rings and respawn to maintain pool */
    for (let i = rings.length - 1; i >= 0; i--) {
      if (rings[i].dead) {
        rings.splice(i, 1);
        /* spawn a replacement somewhere random */
        const r = new InkRing(Math.random() * W, Math.random() * H, false);
        r.r = 0;
        rings.push(r);
      }
    }

    /* draw back-to-front so newer / smaller rings stay on top */
    const sorted = [...rings].sort((a, b) => b.r - a.r);
    for (const ring of sorted) {
      ring.update(fieldT);
      ring.draw(fieldT);
    }

    raf = requestAnimationFrame(loop);
  }

  /* ---- resize ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ---- event wiring ---- */
  window.addEventListener('resize', () => { resize(); seedRings(); });

  canvas.style.pointerEvents = 'none'; // let clicks pass through to DOM
  document.addEventListener('click', e => {
    /* skip clicks on interactive elements */
    const tag = e.target.tagName;
    if (['A','BUTTON','INPUT','TEXTAREA','LABEL'].includes(tag)) return;
    spawnAt(e.clientX, e.clientY);
  });

  document.addEventListener('touchstart', e => {
    for (const t of e.touches) spawnAt(t.clientX, t.clientY);
  }, { passive: true });

  /* gentle mouse-drag stirs the ink */
  let lastMX = -1, lastMY = -1, dragTimer;
  document.addEventListener('mousemove', e => {
    if (lastMX < 0) { lastMX = e.clientX; lastMY = e.clientY; return; }
    const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 22) {
      /* nudge nearby ring centres along the cursor path */
      for (const ring of rings) {
        const rdx = ring.cx - e.clientX, rdy = ring.cy - e.clientY;
        const d = Math.sqrt(rdx * rdx + rdy * rdy);
        if (d < 180) {
          const push = (180 - d) / 180 * 0.9;
          ring.cx += dx * push * 0.18;
          ring.cy += dy * push * 0.18;
        }
      }
    }
    lastMX = e.clientX; lastMY = e.clientY;
    clearTimeout(dragTimer);
    dragTimer = setTimeout(() => { lastMX = -1; lastMY = -1; }, 200);
  }, { passive: true });

  /* theme toggle refreshes hues */
  document.getElementById('theme-toggle').addEventListener('click', () => {
    /* recolour existing rings to new palette */
    const pal = getPalette();
    for (const ring of rings) {
      const col = pal[Math.floor(Math.random() * pal.length)];
      ring.hue = col.h + (Math.random() - 0.5) * 22;
      ring.sat = col.s;
      ring.lit = col.l;
    }
  });

  resize();
  seedRings();
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
   13. (Canvas theme swap handled inside suminagashi init above)
   ============================================================ */

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
