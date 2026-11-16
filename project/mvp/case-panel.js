(() => {
  'use strict';
  const projects = window.PORTFOLIO_DATA;
  const pages = window.CHECKPOINT_PAGES;
  const dialog = document.createElement('dialog');
  dialog.id = 'case-presentation';
  dialog.className = 'case-shell';
  dialog.setAttribute('aria-labelledby', 'case-name');
  dialog.innerHTML = `
    <header class="case-header">
      <div class="case-heading">
        <h2 id="case-name"></h2>
      </div>
      <button class="case-close" type="button" aria-label="Закрыть проект" autofocus>×</button>
    </header>
    <div class="case-body">
      <div class="case-visual">
        <section class="case-problem" aria-labelledby="case-problem-title">
          <h3 id="case-problem-title">Проблематика</h3>
          <p id="case-problem-text"></p>
        </section>
        <div class="case-stage"></div>
      </div>
      <div class="case-narrative" tabindex="0" aria-label="Описание проекта">
        <div id="case-fields"></div>
      </div>
    </div>`;
  document.body.append(dialog);

  const $ = selector => dialog.querySelector(selector);
  const stage = $('.case-stage');
  const narrative = $('.case-narrative');
  const fieldList = $('#case-fields');
  let returnFocus;

  function fitNarrative() {
    narrative.style.removeProperty('--case-text-size');
    if (!dialog.open || matchMedia('(max-width: 680px)').matches) return;
    const style = getComputedStyle(narrative);
    const available = narrative.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    let lower = 11;
    const problemSize = parseFloat(getComputedStyle($('#case-problem-text')).fontSize);
    let upper = problemSize * .78;
    for (let step = 0; step < 8; step += 1) {
      const size = (lower + upper) / 2;
      narrative.style.setProperty('--case-text-size', size + 'px');
      if (fieldList.getBoundingClientRect().height <= available) lower = size;
      else upper = size;
    }
    narrative.style.setProperty('--case-text-size', lower + 'px');
  }

  new ResizeObserver(fitNarrative).observe($('.case-body'));

  new ResizeObserver(([{contentRect:{width, height}}]) => {
    const frame = stage.querySelector('iframe');
    if (!frame || !width || !height) return;
    const scale = frame.dataset.nativeScene === 'true' && width >= 830 ? 1 : Math.min(1, width / 1060, height / 580);
    frame.style.width = width / scale + 'px';
    frame.style.height = height / scale + 'px';
    frame.style.transform = 'scale(' + scale + ')';
  }).observe(stage);

  function addText(paragraph, value) {
    for (const part of value.split(/(https:\/\/[^\s<]+)/g)) {
      if (!part.startsWith('https://')) {
        paragraph.append(part);
        continue;
      }
      const link = document.createElement('a');
      link.href = part;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const host = new URL(part).hostname;
      const labels = {'doi.org': 'Публикация', 'geomodel.ru': 'Итоги конференции', 'libgeo.ru': 'Доклад'};
      link.textContent = (labels[host] ?? 'Результаты конкурса') + ' ↗';
      paragraph.append(link);
    }
  }

  const viewport = window.top.visualViewport ?? window.visualViewport;
  function fitViewport() {
    if (!dialog.open || !viewport) return;
    const zoomed = viewport.scale > 1.01;
    dialog.classList.toggle('case-zoom-fit', zoomed);
    if (zoomed) {
      const frame = window.frameElement?.getBoundingClientRect();
      dialog.style.setProperty('--visible-x', Math.max(0, viewport.offsetLeft - (frame?.left ?? 0)) + 'px');
      dialog.style.setProperty('--visible-y', Math.max(0, viewport.offsetTop - (frame?.top ?? 0)) + 'px');
      dialog.style.setProperty('--visible-width', viewport.width + 'px');
      dialog.style.setProperty('--visible-height', viewport.height + 'px');
    }
  }
  viewport?.addEventListener('resize', fitViewport);
  viewport?.addEventListener('scroll', fitViewport);

  function open(id, trigger, sourceNumber) {
    const procedural = id === 'procedural';
    const project = procedural ? {
      title: 'Процедурная генерация фациальных карт',
      fields: [
        {label: 'Задачи', text: 'Проверить идею процедурной генерации фациальных карт.'},
        {label: 'Мой вклад', text: 'Руководство исследовательской постановкой.'},
        {label: 'Результат', text: 'Идею предложили как задачу хакатона. Она осталась исследовательским заделом.'},
      ],
    } : projects.find(item => item.id === id);
    if (!project || (!procedural && !pages[id])) return;
    returnFocus = trigger ?? document.activeElement;
    const fields = project.fields ?? [];
    $('#case-name').textContent = project.heading ?? [project.title, project.subtitle && project.subtitle[0].toLocaleLowerCase('ru') + project.subtitle.slice(1)].filter(Boolean).join(' — ');
    const problem = fields.find(field => field.label === 'Проблематика');
    $('.case-problem').hidden = !problem;
    $('#case-problem-text').textContent = problem?.text ?? '';
    $('#case-fields').replaceChildren(...fields.filter(field => field.label !== 'Проблематика').map(({label, text}) => {
      const section = document.createElement('section');
      section.className = 'case-field';
      const heading = document.createElement('h3');
      heading.textContent = label;
      const content = document.createElement(Array.isArray(text) ? 'ul' : 'p');
      if (Array.isArray(text)) {
        for (const value of text) {
          const item = document.createElement('li');
          addText(item, value);
          content.append(item);
        }
      } else {
        addText(content, text);
      }
      section.append(heading, content);
      return section;
    }));

    const frame = document.createElement('iframe');
    frame.title = project.title;
    frame.dataset.nativeScene = String(Boolean(project.nativeScene));
    frame.setAttribute('sandbox','allow-scripts');
    const study = window.CHECKPOINT_STUDIES?.[id];
    if (study) frame.srcdoc = study.replace('</head>', '<style>html, body { background: transparent !important; } main > h1:first-child { display: none; }</style></head>');
    else if (!procedural) frame.src = encodeURI(pages[id]);
    if (id === 'mentoring' && sourceNumber && study) {
      const order = [11, 14, 10, 12, 13];
      const index = order.indexOf(sourceNumber) + 1;
      frame.srcdoc = frame.srcdoc.replace('</head>', `<style>.projects li:nth-child(${index}) { outline: 2px solid #d7b77f; outline-offset: 2px; }</style></head>`);
    }
    if (procedural) {
      const note = document.createElement('p');
      note.className = 'timeline-idea';
      note.textContent = 'Исследовательская идея';
      stage.replaceChildren(note);
    } else stage.replaceChildren(frame);
    const origin = returnFocus?.getBoundingClientRect();
    dialog.showModal();
    fitViewport();
    $('.case-body').scrollTop = 0;
    if (origin && viewport?.scale <= 1.01 && !matchMedia('(max-width: 680px), (prefers-reduced-motion: reduce)').matches) {
      const panel = dialog.getBoundingClientRect();
      dialog.animate([
        {opacity: 0, transform: `translate(${origin.x + origin.width / 2 - panel.x - panel.width / 2}px, ${origin.y + origin.height / 2 - panel.y - panel.height / 2}px) scale(.22)`},
        {opacity: 1, transform: 'none'},
      ], {duration: 440, easing: 'cubic-bezier(.2,.75,.25,1)'});
    }
    fitNarrative();
    $('.case-narrative').scrollTop = 0;
    $('.case-close').focus({preventScroll:true});
  }

  $('.case-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    stage.replaceChildren();
    returnFocus?.focus({preventScroll:true});
  });
  window.CasePanel = {open, close: () => dialog.close(), isOpen: () => dialog.open};
})();
