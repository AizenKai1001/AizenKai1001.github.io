// Progressive enhancements for public, static observations. No telemetry requests.
export function createObservatory(motion) {
  const cleanups = [];
  const listen = (node, event, handler) => {
    node?.addEventListener(event, handler);
    if (node) cleanups.push(() => node.removeEventListener(event, handler));
  };
  const index = document.querySelector('[data-system-index]');
  if (index) {
    const buttons = [...index.querySelectorAll('[data-system-filter]')];
    const groups = [...index.querySelectorAll('[data-system-group]')];
    buttons.forEach(button => listen(button, 'click', () => {
      const selection = button.dataset.systemFilter;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      groups.forEach(group => { group.hidden = selection !== 'all' && group.dataset.systemGroup !== selection; });
      const count = groups.filter(group => !group.hidden).length;
      index.querySelector('.system-result').textContent = `${count} system ${count === 1 ? 'group' : 'groups'}`;
    }));
  }
  const explorer = document.querySelector('[data-widget-explorer]');
  if (explorer) {
    const links = [...explorer.querySelectorAll('[data-widget-select]')];
    const panels = [...explorer.querySelectorAll('[data-widget-panel]')];
    function idFromHash() {
      try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; }
    }
    function select(id, updateUrl = true, animate = true) {
      let active = panels.find(panel => panel.id === id);
      // Deep links to credit blocks still open the correct parent study.
      if (!active && id) active = panels.find(panel => [...panel.querySelectorAll('[id]')].some(node => node.id === id));
      active ||= panels[0];
      if (!active) return;
      panels.forEach(panel => { panel.hidden = panel !== active; });
      links.forEach(link => {
        if (link.dataset.widgetSelect === active.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      if (updateUrl) {
        try { history.replaceState(history.state, '', `#${active.id}`); } catch { /* Navigation remains usable. */ }
      }
      if (animate) motion.animate(active, [{opacity:0.4, transform:'translateY(7px)'}, {opacity:1, transform:'translateY(0)'}], {duration:240});
    }
    links.forEach((link,i) => {
      listen(link, 'click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        select(link.dataset.widgetSelect);
        if (matchMedia('(max-width: 760px)').matches) panels.find(p=>!p.hidden)?.scrollIntoView({block:'start',behavior:'instant'});
      });
      listen(link, 'keydown', event => {
        if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key==='Home'?0:event.key==='End'?links.length-1:(i+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;
        links[next].focus();
        select(links[next].dataset.widgetSelect);
      });
    });
    listen(window,'hashchange',()=>select(idFromHash(),false));
    select(idFromHash(),false,false);
  }
  return { dispose() { cleanups.forEach(fn=>fn()); } };
}
