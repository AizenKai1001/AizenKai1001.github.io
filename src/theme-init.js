// Inlined before styles by the page builder to avoid a light flash on dark visits.
(() => {
  let saved;
  let motion = null;
  try {
    saved = localStorage.getItem('research-theme');
    motion = localStorage.getItem('research-motion') === 'playing' ? 'playing' : null;
  } catch { /* Storage can be disabled without disabling the site. */ }
  try {
    const request = new URL(location.href).searchParams.get('motion');
    if (request === 'play') motion = 'playing';
    if (request === 'pause') motion = 'paused';
    if (request === 'system') motion = null;
  } catch { /* Optional playback link. */ }
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;
  root.dataset.theme = saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light';
  root.dataset.motion = motion === 'paused' ? 'paused' : motion !== 'playing' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#101914' : '#f2f0e9');
})();
