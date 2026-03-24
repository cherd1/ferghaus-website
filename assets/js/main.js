/* ============================================================
   FERGHAUS — Main JavaScript
   ferghaus.com
   ============================================================ */

(function () {
  'use strict';

  /* ─── NAV: sticky + hamburger ─────────────────────────── */
  const nav       = document.getElementById('main-nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link inside it is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
  }

  /* ─── SCROLL ANIMATIONS ───────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      fadeEls.forEach(el => observer.observe(el));
    }
  } else {
    // Reduced motion: make all fade-up elements immediately visible
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }

  /* ─── VIDEOS: respect prefers-reduced-motion ──────────── */
  const loops = document.querySelectorAll('video[data-loop]');
  loops.forEach(video => {
    if (prefersReducedMotion) {
      video.pause();
      // Show poster frame instead
      video.style.display = 'none';
      const poster = video.getAttribute('poster');
      if (poster) {
        const img = document.createElement('img');
        img.src = poster;
        img.alt = video.getAttribute('aria-label') || '';
        img.className = video.className;
        video.parentNode.insertBefore(img, video);
      }
    } else {
      video.play().catch(() => {
        // Autoplay blocked — show poster
        video.style.display = 'none';
      });
    }
  });

  /* ─── VIDEOS: only play when in viewport ─────────────── */
  if (!prefersReducedMotion) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    loops.forEach(video => videoObserver.observe(video));
  }

  /* ─── ACTIVE NAV LINK ─────────────────────────────────── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.startsWith(href) && href !== '/') {
      link.setAttribute('aria-current', 'page');
    } else if (href === '/' && currentPath === '/') {
      link.setAttribute('aria-current', 'page');
    }
  });

})();
