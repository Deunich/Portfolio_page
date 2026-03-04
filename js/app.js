// js/app.js
document.addEventListener('DOMContentLoaded', () => {

  /* ── Image modal ─────────────────────────────────────── */
  const modal    = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.close');

  document.querySelectorAll('.clickable-img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'block';
      modalImg.src = img.getAttribute('data-img');
      modalImg.alt = img.alt;
    });
  });

  if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });

  /* ── Hamburger menu ──────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navRight  = document.getElementById('nav-right');

  if (hamburger && navRight) {
    hamburger.addEventListener('click', () => {
      const isOpen = navRight.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close when any nav link is clicked
    navRight.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navRight.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Scroll reveal ───────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Active nav link on scroll ───────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-right a[href^="#"]');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-right a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => activeObserver.observe(section));

});
