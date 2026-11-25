(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- nav: shadow on scroll, mobile menu, active link ---------- */
  const nav = document.getElementById('nav');
  const links = document.getElementById('navLinks');
  const menuBtn = document.getElementById('menuBtn');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  const sections = [...document.querySelectorAll('main section[id]')];
  const linkFor = (id) => links.querySelector(`a[href="#${id}"]`);
  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const a = linkFor(e.target.id);
      if (a && e.isIntersecting) {
        links.querySelectorAll('a').forEach((x) => x.classList.remove('active'));
        a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => activeObs.observe(s));

  /* ---------- reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealObs.observe(el);
  });

  /* ---------- typed role ---------- */
  const roles = ['Oracle APEX Developer', 'PL/SQL Developer', 'Oracle Forms & Reports', 'Database Designer'];
  const typed = document.getElementById('typed');
  if (!reduced) {
    let r = 0, i = roles[0].length, deleting = true;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, i);
      if (deleting) {
        i--;
        if (i < 0) { deleting = false; r = (r + 1) % roles.length; i = 0; }
        setTimeout(tick, 45);
      } else {
        i++;
        if (i > roles[r].length) { deleting = true; i = roles[r].length; setTimeout(tick, 1800); return; }
        setTimeout(tick, 85);
      }
    };
    setTimeout(tick, 2200);
  }

  /* ---------- count-up stats ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count;
      countObs.unobserve(el);
      if (reduced) { el.textContent = end; return; }
      const t0 = performance.now(), dur = 1200;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- galleries ---------- */
  const GALLERIES = {
    socrat: ['assets/img/socrat/', [
      ['dashboard', 'Manager dashboard — revenue KPIs, 30-day revenue, job cards by status, alerts'],
      ['job-cards', 'Job cards — Faceted Search by status, technician and late cards'],
      ['job-card-form', 'Job card form — services grid with a technician on each line'],
      ['invoice', 'Invoice view — lines, summary with discount and 14% VAT, payments, print'],
      ['receiving-form', 'Goods receiving — parts, quantities and costs; stock updates on save'],
      ['parts-issue', 'Parts issue — live price, stock and total while choosing'],
      ['technicians', 'Technicians — cards with workload bars'],
      ['my-cars', 'Customer portal — my cars with Egyptian-style plates'],
      ['booking', 'Customer portal — book an available slot'],
      ['alerts', 'Alerts — late job cards and low-stock parts'],
      ['login', 'Login — branded, with light / dark switch'],
      ['dashboard-light', 'Light theme — every user can switch'],
    ]],
    nagma: ['assets/img/nagma/', [
      ['menu-manager', 'Manager menu — operations, store & workshop, invoices & purchasing, alerts & reports'],
      ['login', 'Login — each role opens its own menu'],
      ['dashboard', 'KPI dashboard — today\'s and this month\'s revenue, open work orders, dues, stock value'],
      ['alerts', 'Alerts — unpaid invoices, low-stock parts, late work orders'],
      ['customers', 'Customers and their vehicles — master-detail with search by plate or mobile'],
      ['job-card', 'Job card — services and spare parts with totals'],
      ['job-tracking', 'Job-card tracking — inspection, customer approval, ready'],
      ['car-wash', 'Car wash request'],
      ['invoice', 'Invoice — from a job card, with discount and 14% VAT'],
      ['payments', 'Payments and collection'],
      ['menu-store', 'Storekeeper menu — suppliers, parts, issue and goods receiving'],
      ['services', 'Services and prices'],
    ]],
  };

  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  let lbGallery = null;

  function initGallery(root) {
    const [dir, shots] = GALLERIES[root.dataset.gallery];
    const img = root.querySelector('.gallery-main img');
    const cap = root.querySelector('figcaption');
    const thumbs = root.querySelector('.thumbs');
    const g = { cur: 0, shots, dir, show: null };
    const src = (k) => dir + shots[k][0] + '.jpg';
    g.show = (k) => {
      g.cur = (k + shots.length) % shots.length;
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = src(g.cur); img.alt = shots[g.cur][1];
        cap.textContent = shots[g.cur][1];
        img.style.opacity = 1;
      }, reduced ? 0 : 150);
      thumbs.querySelectorAll('button').forEach((b, j) => b.classList.toggle('active', j === g.cur));
    };
    shots.forEach(([name, label], k) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', label);
      b.innerHTML = `<img src="${dir}${name}.jpg" alt="" loading="lazy">`;
      b.addEventListener('click', () => g.show(k));
      thumbs.appendChild(b);
    });
    img.src = src(0); img.alt = shots[0][1]; cap.textContent = shots[0][1];
    thumbs.firstChild.classList.add('active');
    root.querySelector('.gal-nav.prev').addEventListener('click', (e) => { e.stopPropagation(); g.show(g.cur - 1); });
    root.querySelector('.gal-nav.next').addEventListener('click', (e) => { e.stopPropagation(); g.show(g.cur + 1); });
    root.querySelector('.gallery-main').addEventListener('click', () => {
      lbGallery = g; lbImg.src = src(g.cur); lbImg.alt = shots[g.cur][1]; lb.hidden = false;
    });
  }
  document.querySelectorAll('[data-gallery]').forEach(initGallery);

  /* ---------- lightbox ---------- */
  const closeLb = () => { lb.hidden = true; };
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden || !lbGallery) return;
    if (e.key === 'Escape') closeLb();
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (step) {
      lbGallery.show(lbGallery.cur + step);
      lbImg.src = lbGallery.dir + lbGallery.shots[lbGallery.cur][0] + '.jpg';
      lbImg.alt = lbGallery.shots[lbGallery.cur][1];
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
