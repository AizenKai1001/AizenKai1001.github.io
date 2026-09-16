const KEY = 'research-theme';

export function createThemeController() {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const buttons = [...document.querySelectorAll('.theme-toggle')];
  let preference = null;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* A tab-local choice still works without storage. */ }
  const subscribers = new Set();
  let current = preference || (system.matches ? 'dark' : 'light');

  function apply() {
    current = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = current;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', current === 'dark' ? '#101914' : '#f2f0e9');
    for (const button of buttons) {
      const label = `Switch to ${current === 'dark' ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(current === 'dark'));
      button.querySelector('.theme-label').textContent = current === 'dark' ? 'Light' : 'Dark';
    }
    for (const listener of subscribers) listener(current);
  }

  function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    preference = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* Keep the in-memory preference. */ }
    apply();
  }
  const toggle = () => setTheme(current === 'dark' ? 'light' : 'dark');
  const systemChanged = () => { if (!preference) apply(); };
  const stored = event => {
    if (event.key !== KEY && event.key !== null) return;
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    apply();
  };
  buttons.forEach(button => button.addEventListener('click', toggle));
  system.addEventListener('change', systemChanged);
  window.addEventListener('storage', stored);
  apply();

  return {
    getTheme: () => current,
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); },
    dispose() {
      buttons.forEach(button => button.removeEventListener('click', toggle));
      system.removeEventListener('change', systemChanged);
      window.removeEventListener('storage', stored);
      subscribers.clear();
    },
  };
}
