(() => {
  'use strict';
  const container = document.querySelector('#skills-list');
  const groups = [
    ['hard', 'Инженерно-аналитические', '#84d6bd', -Math.PI / 2, Math.PI * .92],
    ['soft', 'Коммуникация и работа с людьми', '#e5be87', Math.PI * .42, Math.PI * .48],
    ['management', 'Управление и организация', '#92bdf2', Math.PI * .9, Math.PI * .6],
  ];

  function svg(tag, attrs, text) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    if (text) element.textContent = text;
    return element;
  }

  function render(skills) {
    if (!skills.length) {
      const empty = document.createElement('p');
      empty.className = 'competency-empty';
      empty.textContent = 'Достигни первого проекта, чтобы открыть карту компетенций.';
      container.replaceChildren(empty);
      return;
    }
    const projects = [...new Map(skills.flatMap(skill => skill.sources).map(project => [project.id, project])).values()];
    const width = 1080;
    const height = 620;
    const graph = svg('svg', {viewBox: `0 0 ${width} ${height}`, class: 'competency-graph',
      tabindex: 0, 'aria-label': 'Граф компетенций. Стрелки перемещают граф, плюс и минус меняют масштаб.'});
    const scene = svg('g', {});
    const links = svg('g', {class: 'flower-links', 'aria-hidden': 'true'});
    const nodes = svg('g', {});
    scene.append(links, nodes);
    graph.append(scene);
    const detail = document.createElement('p');
    detail.className = 'competency-detail';
    detail.setAttribute('aria-live', 'polite');
    const guide = 'Выбери компетенцию или проект, чтобы увидеть связи.';
    const filter = document.createElement('select');
    filter.setAttribute('aria-label', 'Выделить связи проекта');
    filter.append(new Option('Все проекты', ''));
    for (const project of projects) filter.append(new Option(project.title, project.id));
    const initialScale = () => Math.min(graph.clientWidth / width, graph.clientHeight / height);
    const camera = {x: 0, y: 0, scale: 1};
    let drag;
    let suppressClick = false;
    let selected = null;
    const views = [];
    const centers = [[350, 230, 280, 190], [825, 137, 119, 83], [825, 346, 119, 83]];

    function update() {
      links.replaceChildren();
      const project = projects.find(item => item.id === filter.value);
      const visible = selected ? selected.skill.sources : project ? [project] : [];
      for (const view of views) {
        const relevant = selected ? view === selected : project && view.skill.sources.some(item => item.id === project.id);
        view.node.classList.toggle('selected', Boolean(relevant));
        view.node.classList.toggle('muted', Boolean(selected || project) && !relevant);
        view.node.setAttribute('aria-pressed', String(view === selected));
      }
      const columns = Math.min(5, visible.length);
      for (const [index, source] of visible.entries()) {
        const row = Math.floor(index / columns);
        const items = Math.min(columns, visible.length - row * columns);
        const x = 540 + (index % columns - (items - 1) / 2) * 208;
        const y = 478 + row * 44;
        const linked = selected ? [selected] : views.filter(view => view.skill.sources.some(item => item.id === source.id));
        for (const view of linked) {
          links.append(svg('path', {d: `M${view.x} ${view.y}Q${x} ${view.y} ${x} ${y}`, stroke: view.color}));
        }
        const label = svg('g', {class: 'competency-project-label'});
        label.append(svg('rect', {x: x - 99, y, width: 198, height: 38, rx: 6}));
        const words = source.title.split(' ');
        const lines = [''];
        for (const word of words) {
          const last = lines.length - 1;
          if ((lines[last] + ' ' + word).length > 28 && lines[last]) lines.push(word);
          else lines[last] += (lines[last] ? ' ' : '') + word;
        }
        const text = svg('text', {x, y: y + (lines.length === 1 ? 23 : 15), 'text-anchor': 'middle'});
        for (const [line, value] of lines.entries()) text.append(svg('tspan', {x, dy: line ? 13 : 0}, value));
        label.append(text);
        links.append(label);
      }
      detail.textContent = selected ? `${selected.skill.title} · проектов: ${visible.length}. ${selected.skill.detail}` :
        project ? project.title : `Компетенций: ${skills.length}. ${guide}`;
    }

    for (const [index, [category, , color]] of groups.entries()) {
      const members = skills.filter(skill => skill.category === category).sort((a, b) => b.sources.length - a.sources.length);
      const [cx, cy, rx, ry] = centers[index];
      for (const [slot, skill] of members.entries()) {
        const distance = Math.sqrt(slot / Math.max(1, members.length - 1));
        const angle = slot * 2.39996;
        const x = cx + Math.cos(angle) * rx * distance;
        const y = cy + Math.sin(angle) * ry * distance;
        const radius = 8 + 4 * Math.sqrt(skill.sources.length - 1);
        const node = svg('g', {class: 'flower-skill', transform: `translate(${x} ${y})`,
          role: 'button', tabindex: 0, 'aria-label': `${skill.title}, проектов: ${skill.sources.length}`});
        node.classList.toggle('prominent', slot === 0);
        node.append(svg('circle', {r: radius, fill: color}),
          svg('text', {y: radius + 15, 'text-anchor': 'middle'}, skill.title), svg('title', {}, skill.title));
        const view = {node, skill, color, x, y};
        views.push(view);
        nodes.append(node);
        function toggle() {
          selected = selected === view ? null : view;
          filter.value = '';
          update();
        }
        node.addEventListener('click', () => { if (!suppressClick) toggle(); });
        node.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          toggle();
        });
      }
    }
    filter.addEventListener('change', () => { selected = null; update(); });
    function paint() {
      scene.setAttribute('transform', `translate(${camera.x} ${camera.y}) scale(${camera.scale})`);
      graph.classList.toggle('flower-zoomed', initialScale() * camera.scale >= .9);
    }
    function zoom(factor, x = width / 2, y = height / 2) {
      const scale = Math.max(.55, Math.min(6, camera.scale * factor));
      const ratio = scale / camera.scale;
      camera.x = x - (x - camera.x) * ratio;
      camera.y = y - (y - camera.y) * ratio;
      camera.scale = scale;
      paint();
    }
    function point(event) {
      return new DOMPoint(event.clientX, event.clientY).matrixTransform(graph.getScreenCTM().inverse());
    }
    graph.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      const start = point(event);
      const view = views.find(item => item.node === event.target.closest('.flower-skill'));
      drag = {id: event.pointerId, start, view, x: view?.x ?? camera.x, y: view?.y ?? camera.y};
      suppressClick = false;
    });
    graph.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const next = point(event);
      const dx = next.x - drag.start.x;
      const dy = next.y - drag.start.y;
      if (!suppressClick && Math.hypot(dx, dy) * initialScale() < 5) return;
      if (!suppressClick) graph.setPointerCapture(event.pointerId);
      suppressClick = true;
      if (drag.view) {
        drag.view.x = drag.x + dx / camera.scale;
        drag.view.y = drag.y + dy / camera.scale;
        drag.view.node.setAttribute('transform', `translate(${drag.view.x} ${drag.view.y})`);
        update();
        return;
      }
      camera.x = drag.x + dx;
      camera.y = drag.y + dy;
      paint();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave']) {
      graph.addEventListener(event, () => { drag = null; });
    }
    graph.addEventListener('wheel', event => {
      event.preventDefault();
      const {x, y} = point(event);
      zoom(event.deltaY < 0 ? 1.2 : 1 / 1.2, x, y);
    }, {passive: false});
    graph.addEventListener('keydown', event => {
      if (event.target !== graph) return;
      const movement = {ArrowUp: [0, 50], ArrowDown: [0, -50], ArrowLeft: [50, 0], ArrowRight: [-50, 0]};
      if (movement[event.key]) {
        const [dx, dy] = movement[event.key];
        camera.x += dx;
        camera.y += dy;
        paint();
      } else if (event.key === '+' || event.key === '=') zoom(1.25);
      else if (event.key === '-') zoom(1 / 1.25);
      else return;
      event.preventDefault();
    });

    const legend = document.createElement('ul');
    legend.className = 'competency-legend';
    for (const [, title, color] of groups) {
      const item = document.createElement('li');
      item.textContent = title;
      item.style.setProperty('--group-color', color);
      legend.append(item);
    }
    const toolbar = document.createElement('div');
    toolbar.className = 'competency-toolbar';
    toolbar.append(filter);
    for (const [label, name, action] of [
      ['−', 'Уменьшить масштаб', () => zoom(1 / 1.25)],
      ['+', 'Увеличить масштаб', () => zoom(1.25)],
      ['Обзор', 'Вернуть общий вид', () => {
        Object.assign(camera, {x: 0, y: 0, scale: 1});
        selected = null;
        filter.value = '';
        update();
        paint();
      }],
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', name);
      button.addEventListener('click', action);
      toolbar.append(button);
    }
    const surface = document.createElement('div');
    surface.className = 'competency-surface';
    surface.append(graph);
    container.replaceChildren(legend, toolbar, surface, detail);
    paint();
    update();
  }
  window.CompetencyGraph = {render};
})();
