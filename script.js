/* ══════════════════════════════════════════════════════════════
   MIRAKU ANIMATION — script.js
   All animations, interactions, and effects
══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. LOADING SCREEN
────────────────────────────────────────────────────────────── */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const burst     = loader.querySelector('.loader-star-burst');
  const RAY_COUNT = 12;

  // Build star rays
  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = document.createElement('div');
    ray.className = 'ray';
    ray.style.transform = `translateX(-50%) rotate(${(360 / RAY_COUNT) * i}deg)`;
    burst.appendChild(ray);
  }

  // After bar fills → hide loader
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      document.getElementById('site-logo').classList.add('visible');
      document.getElementById('vertical-nav').classList.add('visible');
      revealHero();
    }, 800);
  }, 3000);
})();


/* ──────────────────────────────────────────────────────────────
   2. BACKGROUND CANVAS — Stars + Particles
────────────────────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  const stars  = [];
  const STAR_COUNT = 200;

  /* ── Gradient mesh ── */
  function drawGradient() {
    // Deep black-to-near-white faint gradient for ambient feel
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, H * 1.2);
    grd.addColorStop(0,   'rgba(18, 14, 10, 0)');
    grd.addColorStop(0.5, 'rgba(10, 10, 14, 0)');
    grd.addColorStop(1,   'rgba(5, 5, 7, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Star class ── */
  class Star {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.4 + 0.2;
      this.base = Math.random() * 0.6 + 0.1;
      this.alpha= this.base;
      this.speed= (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? 1 : -1);
      this.vx   = (Math.random() - 0.5) * 0.08;
      this.vy   = (Math.random() - 0.5) * 0.08;
      this.twinkleSpeed = Math.random() * 0.015 + 0.005;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha = this.base + Math.sin(t * this.twinkleSpeed + this.twinklePhase) * 0.35;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      ctx.fillStyle = '#e8d5b7';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      // subtle glow for brighter stars
      if (this.r > 1.0) {
        ctx.globalAlpha = this.alpha * 0.3;
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
        g.addColorStop(0, '#e8d5b7');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Init stars ── */
  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
  }

  /* ── Parallax offset from mouse ── */
  let mouseOffX = 0, mouseOffY = 0;
  document.addEventListener('mousemove', e => {
    mouseOffX = (e.clientX / window.innerWidth  - 0.5) * 30;
    mouseOffY = (e.clientY / window.innerHeight - 0.5) * 20;
  });

  /* ── Animation loop ── */
  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    t++;
    ctx.clearRect(0, 0, W, H);

    // Parallax translate for atmosphere
    ctx.save();
    ctx.translate(mouseOffX * 0.15, mouseOffY * 0.15);

    stars.forEach(s => { s.update(t); s.draw(); });

    ctx.restore();
  }

  resize();
  initStars();
  loop();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();


/* ──────────────────────────────────────────────────────────────
   3. CUSTOM CURSOR
────────────────────────────────────────────────────────────── */
(function initCursor() {
  const cursor    = document.getElementById('cursor-star');
  const container = document.getElementById('cursor-trail-container');

  let curX = -100, curY = -100;
  let aimX =  curX, aimY =  curY;
  let lastTrail = 0;

  // Smooth cursor follow
  function animateCursor() {
    curX += (aimX - curX) * 0.18;
    curY += (aimY - curY) * 0.18;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  }

  document.addEventListener('mousemove', e => {
    aimX = e.clientX;
    aimY = e.clientY;

    const now = Date.now();
    if (now - lastTrail > 40) {
      lastTrail = now;
      spawnParticle(e.clientX, e.clientY);
    }
  });

  // Hover detection on interactive elements
  const hoverables = 'a, button, [data-hover], input, textarea, .nav-link, .cta-btn, .social-card, .news-card, .enroll-btn, .submit-btn';
  document.querySelectorAll(hoverables).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) cursor.classList.add('hovered');
    else cursor.classList.remove('hovered');
  });

  // Particle trail
  function spawnParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'cursor-particle';
    p.style.left = x + 'px';
    p.style.top  = y + 'px';
    p.style.width  = (Math.random() * 5 + 2) + 'px';
    p.style.height = p.style.width;
    p.style.opacity = (Math.random() * 0.6 + 0.3).toString();
    container.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }

  animateCursor();
})();


/* ──────────────────────────────────────────────────────────────
   4. SMOOTH SCROLLING + ACTIVE NAV
────────────────────────────────────────────────────────────── */
(function initNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  // Smooth anchor scroll
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection Observer for active state
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const id = entry.target.id;
        const active = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


/* ──────────────────────────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
────────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────────────────────
   6. HERO REVEAL
────────────────────────────────────────────────────────────── */
function revealHero() {
  const heroItems = document.querySelectorAll('#hero .reveal-up');
  heroItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, 150 + i * 160);
  });
}


/* ──────────────────────────────────────────────────────────────
   7. PARALLAX on MOUSE MOVE (hero section)
────────────────────────────────────────────────────────────── */
(function initParallax() {
  const hero   = document.getElementById('hero');
  const orbs   = hero.querySelectorAll('.orb');
  const title  = hero.querySelector('.hero-title');

  document.addEventListener('mousemove', e => {
    const xRatio = (e.clientX / window.innerWidth  - 0.5);
    const yRatio = (e.clientY / window.innerHeight - 0.5);

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 18;
      orb.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
    });

    if (title) {
      title.style.transform = `translate(${xRatio * 8}px, ${yRatio * 8}px)`;
    }
  });
})();


/* ──────────────────────────────────────────────────────────────
   8. CONTACT FORM
────────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.querySelector('.submit-text').textContent = 'Sending…';

    setTimeout(() => {
      btn.querySelector('.submit-text').textContent = 'Send Message';
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1400);
  });
})();


/* ──────────────────────────────────────────────────────────────
   9. ENROLL BUTTON sparkle burst
────────────────────────────────────────────────────────────── */
(function initEnrollBtn() {
  const btn = document.getElementById('enroll-btn');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    // Create a burst of tiny stars around the button
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const container = document.getElementById('cursor-trail-container');

    for (let i = 0; i < 18; i++) {
      const p  = document.createElement('div');
      const angle = (360 / 18) * i;
      const dist  = 40 + Math.random() * 60;
      const rad   = (angle * Math.PI) / 180;
      const px = cx + Math.cos(rad) * dist;
      const py = cy + Math.sin(rad) * dist;

      p.className = 'cursor-particle';
      p.style.left    = cx + 'px';
      p.style.top     = cy + 'px';
      p.style.width   = (Math.random() * 6 + 3) + 'px';
      p.style.height  = p.style.width;
      p.style.background = Math.random() > 0.5 ? '#e8d5b7' : '#ffffff';
      p.style.transition = `left 0.6s ease, top 0.6s ease, opacity 0.6s ease`;
      container.appendChild(p);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          p.style.left = px + 'px';
          p.style.top  = py + 'px';
          p.style.opacity = '0';
        });
      });
      setTimeout(() => p.remove(), 700);
    }
  });
})();


/* ──────────────────────────────────────────────────────────────
   10. FLOATING STAR SHIMMER on News / Social Cards
────────────────────────────────────────────────────────────── */
(function initCardShimmer() {
  const cards = document.querySelectorAll('.news-card, .stat-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const xP = ((e.clientX - rect.left) / rect.width)  * 100;
      const yP = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', xP + '%');
      card.style.setProperty('--my', yP + '%');
    });
  });
})();


/* ──────────────────────────────────────────────────────────────
   11. SCROLL PROGRESS — subtle page-top glow line
────────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const line = document.createElement('div');
  line.style.cssText = `
    position:fixed; top:0; left:0; height:2px; width:0%;
    background:linear-gradient(to right, transparent, #e8d5b7, transparent);
    z-index:10000; pointer-events:none; transition:width 0.1s linear;
    box-shadow: 0 0 10px rgba(232,213,183,0.6);
  `;
  document.body.appendChild(line);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.body.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    line.style.width = pct + '%';
  });
})();


/* ──────────────────────────────────────────────────────────────
   12. EXPLORE BUTTON — Smooth Scroll
────────────────────────────────────────────────────────────── */
(function initExploreBtn() {
  const btn = document.getElementById('explore-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
})();
