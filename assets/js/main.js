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
    const backdrop   = document.getElementById('nav-backdrop');
    const closeBtn   = document.getElementById('nav-drawer-close');

    const openMenu = () => {
      mobileMenu.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close on any link click inside drawer
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on backdrop tap
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Close on X button
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
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
  const loops = document.querySelectorAll('video[loop]');
  loops.forEach(video => {
    if (prefersReducedMotion) {
      video.pause();
      const poster = video.getAttribute('poster');
      if (poster) {
        // Has a poster image — replace video with it
        video.style.display = 'none';
        const img = document.createElement('img');
        img.src = poster;
        img.alt = video.getAttribute('aria-label') || '';
        img.className = video.className;
        video.parentNode.insertBefore(img, video);
      }
      // No poster: leave video visible, paused at first frame
    }
  });

  /* ─── VIDEOS: staggered autoplay, 2s gap between each ───── */
  // On mobile, native autoplay (muted + playsinline) is more reliable than JS .play()
  // from a setTimeout, which can be rejected by mobile browsers as a non-gesture call.
  const isMobile = window.matchMedia('(max-width: 1024px)').matches;
  if (!prefersReducedMotion && !isMobile) {
    loops.forEach((video, i) => {
      // Pause immediately to override HTML autoplay attribute
      video.pause();
      setTimeout(() => {
        video.play().catch(() => {});
      }, i * 2000);
    });
  }

  /* ─── VIDEOS: play/pause toggle button ───────────────── */
  const SVG_PLAY  = '<svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><path d="M0 0l10 6-10 6V0z"/></svg>';
  const SVG_PAUSE = '<svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><rect x="0" y="0" width="3.5" height="12"/><rect x="6.5" y="0" width="3.5" height="12"/></svg>';

  loops.forEach(video => {
    // Skip if video was replaced by a poster image
    if (video.style.display === 'none') return;

    const container = video.parentElement;
    if (!container) return;

    // Ensure the parent can position the button absolutely
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.className = 'video-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Pause animation');
    btn.innerHTML = SVG_PAUSE;

    // If reduced motion: video is paused at first frame, show play button
    if (prefersReducedMotion) {
      btn.innerHTML = SVG_PLAY;
      btn.setAttribute('aria-label', 'Play animation');
    }

    const updateBtn = () => {
      const paused = video.paused;
      btn.innerHTML = paused ? SVG_PLAY : SVG_PAUSE;
      btn.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    };

    btn.addEventListener('click', () => {
      video.paused ? video.play().catch(() => {}) : video.pause();
      updateBtn();
    });

    video.addEventListener('play',  updateBtn);
    video.addEventListener('pause', updateBtn);

    container.appendChild(btn);
  });

  /* ─── VIDEO POSTER: click-to-play ────────────────────── */
  const videoPoster = document.getElementById('showreelPoster');
  if (videoPoster) {
    const activate = () => {
      const vid = videoPoster.dataset.vid;
      videoPoster.classList.add('playing');
      videoPoster.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + vid +
        '?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3"' +
        ' title="Ferghaus Showreel"' +
        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
        ' allowfullscreen></iframe>';
    };
    videoPoster.addEventListener('click', activate);
    videoPoster.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
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
