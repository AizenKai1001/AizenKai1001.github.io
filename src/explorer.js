// The indexes are real HTML. Search and map selection enhance it without a backend.
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function createExplorer(motion) {
  const disposers = [];
  const listen = (target, name, fn) => {
    target?.addEventListener(name, fn);
    if (target) disposers.push(() => target.removeEventListener(name, fn));
  };

  function initIndex({ rootSelector, itemSelector, inputId, resultId, emptyId, filterAttribute, noun, plural, namespace }) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const items = [...root.querySelectorAll(itemSelector)];
    const searchable = new Map(items.map(item => [item, normalize(item.dataset.search)]));
    const buttons = filterAttribute ? [...root.querySelectorAll(`[${filterAttribute}]`)] : [];
    const categories = new Set(buttons.map(b => b.getAttribute(filterAttribute)));
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    const empty = document.getElementById(emptyId);
    const sort = root.querySelector('#project-sort');
    const grid = root.querySelector('#catalog-grid');
    const viewButtons = [...root.querySelectorAll('[data-layout]')];
    let category = 'all';
    let query = '';
    let layout = 'grid';
    let sortOrder = 'default';
    try {
      const params = new URL(location.href).searchParams;
      category = categories.has(params.get('category')) ? params.get('category') : 'all';
      query = params.get('q') || '';
      layout = params.get('view') === 'list' ? 'list' : 'grid';
      sortOrder = params.get('sort') === 'name' ? 'name' : 'default';
    } catch { /* Optional shareable view. */ }
    if (input) input.value = query;
    if (sort) sort.value = sortOrder;

    function update(writeUrl = true) {
      const words = normalize(query).trim().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const item of items) {
        const itemCategory = item.getAttribute(`data-${namespace}-category`);
        const matches = (category === 'all' || itemCategory === category) && words.every(word => searchable.get(item).includes(word));
        item.hidden = !matches;
        if (matches) count++;
      }
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.getAttribute(filterAttribute) === category));
      if (result) result.textContent = `${count} ${count === 1 ? noun : plural}${count !== items.length ? ` of ${items.length}` : ''}`;
      if (empty) empty.hidden = count !== 0;
      if (grid) {
        grid.dataset.layout = layout;
        const ordered = [...items].sort(sortOrder === 'name'
          ? (a,b) => a.dataset.title.localeCompare(b.dataset.title)
          : (a,b) => Number(a.dataset.order) - Number(b.dataset.order));
        ordered.forEach(item => grid.appendChild(item));
        viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.layout === layout)));
      }
      if (writeUrl) {
        try {
          const url = new URL(location.href);
          for (const [key,value] of Object.entries({ q:query.trim(), category:category==='all'?'':category, view:layout==='list'?'list':'', sort:sortOrder==='name'?'name':'' })) {
            if (value) url.searchParams.set(key,value); else url.searchParams.delete(key);
          }
          history.replaceState(history.state,'',url);
        } catch { /* Search still works in restrictive embedded previews. */ }
      }
    }
    listen(input,'input',()=>{ query=input.value; update(); });
    listen(sort,'change',()=>{ sortOrder=sort.value; update(); });
    buttons.forEach(button=>listen(button,'click',()=>{ category=button.getAttribute(filterAttribute); update(); }));
    viewButtons.forEach(button=>listen(button,'click',()=>{ layout=button.dataset.layout; update(); }));
    root.querySelectorAll('[data-clear-search]').forEach(button=>listen(button,'click',()=>{
      category='all'; query=''; if(input) input.value=''; update(); input?.focus();
    }));
    update(false);
  }

  initIndex({rootSelector:'[data-project-index]',itemSelector:'[data-catalog-item]',inputId:'project-search',resultId:'project-result-count',emptyId:'project-empty',filterAttribute:'data-catalog-filter',noun:'project',plural:'projects',namespace:'catalog'});
  initIndex({rootSelector:'[data-research-index]',itemSelector:'[data-research-item]',inputId:'research-search',resultId:'research-result-count',emptyId:'research-empty',filterAttribute:'data-research-filter',noun:'dossier',plural:'dossiers',namespace:'research'});
  initIndex({rootSelector:'[data-source-index]',itemSelector:'[data-source-item]',inputId:'source-search',resultId:'source-result-count',emptyId:'source-empty',filterAttribute:null,noun:'source',plural:'sources',namespace:'source'});

  const atlas = document.querySelector('[data-atlas]');
  if (atlas) {
    const nodes = [...atlas.querySelectorAll('[data-atlas-category]')];
    const panels = [...atlas.querySelectorAll('[data-atlas-panel]')];
    const paths = [...atlas.querySelectorAll('[data-atlas-line]')];
    let selected = nodes[0]?.dataset.atlasCategory;
    function select(category, animate = true) {
      selected = category;
      nodes.forEach(node=>{
        const active=node.dataset.atlasCategory===category;
        node.setAttribute('aria-pressed',String(active));
        node.setAttribute('aria-controls',`atlas-content-${node.dataset.atlasCategory}`);
      });
      panels.forEach(panel=>{
        panel.id=`atlas-content-${panel.dataset.atlasPanel}`;
        panel.hidden=panel.dataset.atlasPanel!==category;
        if(!panel.hidden && animate) motion.animate(panel,[{opacity:.3,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:300});
      });
      paths.forEach(path=>path.classList.toggle('is-active',path.dataset.atlasLine===category));
    }
    nodes.forEach((node,index)=>{
      listen(node,'click',()=>select(node.dataset.atlasCategory));
      listen(node,'keydown',event=>{
        const key=event.key;
        if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(key)) return;
        event.preventDefault();
        const next=key==='Home'?0:key==='End'?nodes.length-1:(index+(['ArrowRight','ArrowDown'].includes(key)?1:-1)+nodes.length)%nodes.length;
        nodes[next].focus(); select(nodes[next].dataset.atlasCategory);
      });
    });
    if(selected) select(selected,false);
  }
  return { dispose() { disposers.forEach(fn=>fn()); } };
}
