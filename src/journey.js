// Native scrolling choreographs the one existing canvas. No wheel/touch capture.
export function createJourney(section, { scene, motion, selectMode }) {
  if (!section) return { manualSelection() {}, dispose() {} };
  const chapters = [...section.querySelectorAll('[data-journey-mode]')];
  const desktop = matchMedia('(min-width: 901px) and (min-height: 640px)');
  let frame = 0;
  let manualAt = null;
  let current = null;
  let visible = true;
  let disposed = false;

  function update() {
    frame = 0;
    if (disposed || !visible || !desktop.matches) return;
    const y = window.scrollY;
    const bounds = section.getBoundingClientRect();
    const travel = Math.max(1, bounds.height - innerHeight);
    const progress = Math.max(0, Math.min(1, -bounds.top / travel));
    if (manualAt !== null && Math.abs(y - manualAt) > 24) manualAt = null;
    let index = 0;
    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i].getBoundingClientRect().top <= innerHeight * 0.52) index = i;
    }
    chapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === index));
    section.style.setProperty('--journey-progress', progress);
    if (motion.isPaused()) return;
    scene.setScrollProgress?.(progress);
    if (manualAt === null && current !== index) {
      current = index;
      selectMode(chapters[index].dataset.journeyMode, { fromScroll: true });
    }
  }
  function schedule() { if (!frame && !disposed) frame = requestAnimationFrame(update); }
  const unsubscribe = motion.subscribe(() => { current = null; schedule(); });
  const resized = () => { current = null; schedule(); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resized, { passive: true });
  desktop.addEventListener('change', resized);
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) schedule();
  }) : null;
  observer?.observe(section);
  const sizing = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  sizing?.observe(section);
  schedule();
  return {
    manualSelection() { manualAt = window.scrollY; current = null; },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect(); sizing?.disconnect(); unsubscribe();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resized);
      desktop.removeEventListener('change', resized);
    },
  };
}
