// Finite, viewport-triggered animations. Content is visible even if this module fails.
export function createMotionController() {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const controls = [...document.querySelectorAll('.motion-toggle')];
  const subscribers = new Set();
  const active = new Set();
  const seen = new WeakSet();
  let userChoice = null;
  let scrollFrame = 0;
  let scrollProgress = 0;
  try {
    const stored = localStorage.getItem('research-motion');
    // Autoplay is restored on each new page. Keep an explicit Play opt-in for
    // reduced-motion devices, but never resurrect a pause from an old visit.
    if (stored === 'playing') userChoice = stored;
    if (stored === 'paused') localStorage.removeItem('research-motion');
  } catch { /* optional */ }
  // A Play action is an explicit opt-in, even on a device that normally reduces
  // motion. Merely visiting the site continues to honor the system setting.
  const isReduced = () => reduced.matches && userChoice !== 'playing';
  const isPaused = () => userChoice === 'paused' || isReduced();
  try {
    const url = new URL(location.href);
    const requested = url.searchParams.get('motion');
    if (['play', 'pause', 'system'].includes(requested)) {
      userChoice = requested === 'play' ? 'playing' : requested === 'pause' ? 'paused' : null;
      try {
        if (userChoice === 'playing') localStorage.setItem('research-motion', userChoice);
        else localStorage.removeItem('research-motion');
      } catch { /* A URL or button choice also works without storage. */ }
      url.searchParams.delete('motion');
      history.replaceState(history.state, '', url);
    }
  } catch { /* Embedded previews may restrict history. */ }

  function cancelAnimations() {
    for (const animation of active) animation.cancel();
    active.clear();
  }
  function sync() {
    root.dataset.motion = userChoice === 'paused' ? 'paused' : isReduced() ? 'reduced' : 'full';
    root.dataset.motionChoice = userChoice || 'system';
    if (isPaused()) cancelAnimations();
    for (const control of controls) {
      control.disabled = false;
      control.setAttribute('aria-pressed', String(isPaused()));
      control.setAttribute('aria-label', isPaused() ? 'Resume page animations' : 'Pause page animations');
      control.innerHTML = `<span aria-hidden="true">${isPaused() ? '▷' : 'Ⅱ'}</span> ${isPaused() ? 'Play animations' : 'Pause motion'}`;
    }
    for (const subscriber of subscribers) subscriber(isPaused(), isReduced());
  }
  function setPaused(value) {
    userChoice = value ? 'paused' : 'playing';
    // Pause applies to the current page; reopening/reloading starts the studies.
    try {
      if (userChoice === 'playing') localStorage.setItem('research-motion', userChoice);
      else localStorage.removeItem('research-motion');
    } catch { /* optional */ }
    sync();
  }
  function animate(element, frames, options = {}) {
    if (!element || isPaused() || document.hidden || typeof element.animate !== 'function') return null;
    const animation = element.animate(frames, { duration: 720, easing: 'cubic-bezier(.2,.75,.2,1)', ...options });
    active.add(animation);
    const release = () => active.delete(animation);
    animation.addEventListener('finish', release, { once: true });
    animation.addEventListener('cancel', release, { once: true });
    return animation;
  }
  function reveal(element, delay = 0) {
    animate(element, [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay, fill: 'backwards' });
    element.querySelectorAll('.chart-track i').forEach((bar, index) => {
      animate(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1000, delay: delay + 130 + index * 120, fill: 'backwards' });
    });
  }

  const targets = [...document.querySelectorAll('.section-heading, .journey-step > *, .experiment-card, .other-study, .method-intro, .method-steps > div, .notebook-row, .about-copy, .contact-inner, .article-body > section, .evidence-note, .detail-image')];
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    let stagger = 0;
    for (const entry of entries) {
      entry.target.classList.toggle('is-inview', entry.isIntersecting);
      if (!entry.isIntersecting || seen.has(entry.target) || entry.target.hidden) continue;
      seen.add(entry.target);
      reveal(entry.target, Math.min(stagger++ * 85, 255));
    }
  }, { threshold: 0.08 }) : null;
  targets.forEach(element => observer?.observe(element));

  // Decorative loops run only while their own section is visible.
  const ambientObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('ambient-visible', entry.isIntersecting);
  }, { threshold: 0.05 }) : null;
  document.querySelectorAll('.hero-visual, .about-stamp, .diagram-visual, .research-band, .research-atlas, .archive-card, .hardware-card, [data-widget-art]').forEach(el => ambientObserver?.observe(el));

  function updateScroll() {
    scrollFrame = 0;
    const travel = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0;
    document.querySelector('.reading-progress')?.style.setProperty('transform', `scaleX(${scrollProgress})`);
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();

  // Hover follows the pointer slightly; touch retains native scrolling and taps.
  const hoverDisposers = [];
  document.querySelectorAll('.experiment-visual').forEach(element => {
    let frame = 0;
    let x = 50;
    let y = 50;
    const move = event => {
      if (isPaused() || coarse.matches || event.pointerType === 'touch') return;
      const box = element.getBoundingClientRect();
      x = ((event.clientX - box.left) / box.width) * 100;
      y = ((event.clientY - box.top) / box.height) * 100;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        element.style.setProperty('--pointer-x', `${x}%`);
        element.style.setProperty('--pointer-y', `${y}%`);
      });
    };
    const leave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--pointer-x');
      element.style.removeProperty('--pointer-y');
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', leave);
    hoverDisposers.push(() => { leave(); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); });
  });

  const toggle = () => setPaused(!isPaused());
  const resetControls = [...document.querySelectorAll('.motion-reset')];
  const useSystem = () => {
    userChoice = null;
    try { localStorage.removeItem('research-motion'); } catch { /* optional */ }
    sync();
  };
  resetControls.forEach(button => button.addEventListener('click', useSystem));
  controls.forEach(button => button.addEventListener('click', toggle));
  const visibility = () => {
    root.dataset.pageHidden = String(document.hidden);
    if (document.hidden) cancelAnimations();
  };
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', sync);
  sync();
  requestAnimationFrame(() => {
    if (window.scrollY > 150 || location.hash) return;
    const intro = [...document.querySelectorAll('.hero-copy > .eyebrow, .hero-line > span, .hero-intro, .hero-actions, .hero-footnote, .detail-hero > h1, .detail-question')];
    intro.forEach((el, index) => reveal(el, 60 + index * 85));
    // Do not scale the measured canvas ancestor during renderer initialization.
    animate(document.querySelector('.hero-visual'), [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1100, delay: 100, fill: 'backwards' });
  });

  return {
    isPaused,
    isReduced,
    setPaused,
    animate,
    revealFiltered(elements) {
      cancelAnimations();
      elements.forEach((element, index) => { seen.add(element); reveal(element, Math.min(index * 60, 240)); });
      scheduleScroll();
    },
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); },
    getStats: () => ({ paused: isPaused(), reducedMotion: isReduced(), systemReducedMotion: reduced.matches, choice: userChoice || 'system', activeAnimations: active.size, scrollProgress }),
    dispose() {
      cancelAnimations();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      observer?.disconnect();
      ambientObserver?.disconnect();
      hoverDisposers.forEach(dispose => dispose());
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', sync);
      controls.forEach(button => button.removeEventListener('click', toggle));
      resetControls.forEach(button => button.removeEventListener('click', useSystem));
      subscribers.clear();
    },
  };
}
