(() => {
  'use strict';
  const projects = window.PORTFOLIO_DATA || [];
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatText = text => escapeHTML(text).replace(/https:\/\/[^\s<]+/g, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">Источник ↗</a>`);
  const panel = $('#project-panel');
  const bagPanel = $('#bag-panel');
  const path = $('#walk-path');
  const pathLength = path.getTotalLength();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const depthPreview = window.SIGNALOGI_DEPTH;
  let sliceIndex = 0;
  let slicesPlaying = !reducedMotion;
  let sliceElapsed = 0;
  let sliceLastTime = performance.now();
  const storageKey = 'melnikov-portfolio-mvp-01-viewed';
  const viewed = new Set();
  let activeProject = null;
  let progress = 0;
  let animation = null;
  let toastTimer;
  let lastAutoStop = null;
  let returnFocus = null;
  const plural = (n, forms) => forms[(n % 100 >= 11 && n % 100 <= 14) ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) saved.forEach(id => { if (projects.some(p => p.id === id)) viewed.add(id); });
  } catch (_) { /* Local file previews may disallow storage. */ }

  const nearestProgress = (x, y) => {
    let closest = 0, distance = Infinity;
    for (let i = 0; i <= 1500; i++) {
      const point = path.getPointAtLength(pathLength * i / 1500);
      const d = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (d < distance) { distance = d; closest = i / 1500; }
    }
    return closest;
  };
  const stops = [
    {id: 'qaqc', position: 0},
    {id: 'signalogi', position: nearestProgress(385, 690)},
    {id: 'xeek', position: nearestProgress(964, 650)}
  ];

  function renderSlice() {
    if (!depthPreview?.frames.length) return;
    const frame = depthPreview.frames[sliceIndex];
    $('#slice-map-image').setAttribute('href', frame.src);
    $('#slice-map-label').textContent = `${sliceIndex + 1}/${depthPreview.frames.length}`;
    $$('.slice-dot').forEach((dot, i) => dot.setAttribute('fill', i === sliceIndex ? '#e2b970' : '#8eac82'));
    if ($('#slice-card-image')) {
      $('#slice-card-image').src = frame.src;
      $('#slice-card-image').alt = `${depthPreview.title}: ${frame.label}`;
      $('#slice-card-label').textContent = frame.label;
      $('#slice-range').value = sliceIndex;
      $('#slice-range').setAttribute('aria-valuetext', frame.label);
    }
    $('#motion-toggle').setAttribute('aria-pressed', String(slicesPlaying));
    $('#motion-toggle').setAttribute('aria-label', slicesPlaying ? 'Остановить анимацию срезов' : 'Включить анимацию срезов');
    $('#motion-toggle .motion-symbol').textContent = slicesPlaying ? 'Ⅱ' : '▷';
    $('#slice-running-dot').setAttribute('fill', slicesPlaying ? '#5b9276' : '#bba477');
    if ($('#slice-play')) {
      $('#slice-play').textContent = slicesPlaying ? 'Ⅱ Пауза' : '▷ Смотреть';
      $('#slice-play').setAttribute('aria-pressed', String(slicesPlaying));
    }
  }

  function selectSlice(index) {
    if (!depthPreview?.frames.length) return;
    sliceIndex = Math.max(0, Math.min(depthPreview.frames.length - 1, Number(index)));
    sliceElapsed = sliceIndex * depthPreview.duration / depthPreview.frames.length;
    slicesPlaying = false;
    renderSlice();
  }

  function toggleSlices() {
    slicesPlaying = !slicesPlaying;
    sliceLastTime = performance.now();
    renderSlice();
  }

  function depthFigure() {
    if (!depthPreview?.frames.length) return '';
    return `<section class="depth-figure" aria-label="Результаты кластеризации по глубине">
      <div class="depth-figure-header"><span class="section-kicker">СОХРАНЁННЫЕ СРЕЗЫ</span><span id="slice-card-label">${escapeHTML(depthPreview.frames[sliceIndex].label)}</span></div>
      <button class="depth-image-button" data-depth-zoom aria-label="Увеличить текущий срез"><img id="slice-card-image" src="${depthPreview.frames[sliceIndex].src}" alt="${escapeHTML(depthPreview.frames[sliceIndex].label)}"><span>Увеличить ↗</span></button>
      <div class="depth-controls"><button id="slice-play" aria-pressed="${slicesPlaying}">${slicesPlaying ? 'Ⅱ Пауза' : '▷ Смотреть'}</button><label for="slice-range">Срез</label><input id="slice-range" type="range" min="0" max="${depthPreview.frames.length - 1}" step="1" value="${sliceIndex}" aria-valuetext="${escapeHTML(depthPreview.frames[sliceIndex].label)}"></div>
      <p>${escapeHTML(depthPreview.note)}</p><small>${escapeHTML(depthPreview.source)}</small>
    </section>`;
  }

  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify([...viewed])); } catch (_) { /* Optional persistence only. */ }
  }

  function showToast(text) {
    $('#toast').textContent = text;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2800);
  }

  function allSkills() {
    const skills = new Map();
    projects.forEach(project => {
      if (!viewed.has(project.id)) return;
      project.skills.forEach(skill => {
        if (!skills.has(skill.id)) skills.set(skill.id, {...skill, sources: []});
        skills.get(skill.id).sources.push(project);
      });
    });
    return [...skills.values()];
  }

  function renderBag() {
    const skills = allSkills();
    $('#bag-count').textContent = skills.length;
    $('#bag-status').textContent = viewed.size ? `${viewed.size} из 3 проектов · ${skills.length} ${plural(skills.length, ['компетенция', 'компетенции', 'компетенций'])}` : 'Опыт, который стоит за проектами';
    $('#skills-list').innerHTML = skills.length ? skills.map(skill => `<details class="skill-detail" data-skill="${escapeHTML(skill.id)}"><summary><span>${escapeHTML(skill.title)}<small>${skill.sources.length > 1 ? 'Применено в нескольких проектах' : 'Подтверждено проектом'}</small></span></summary><p>${escapeHTML(skill.detail)}</p>${skill.sources.map(source => `<button class="skill-source" data-skill-source="${source.id}">${escapeHTML(source.title)} ↗</button>`).join('')}</details>`).join('') : '<div class="empty-bag">Откройте первый проект —<br>здесь появятся компетенции героя.</div>';
    $('#all-skills').hidden = viewed.size === projects.length;
    projects.forEach(p => $('#object-' + p.id).classList.toggle('visited', viewed.has(p.id)));
  }

  function discover(project) {
    if (viewed.has(project.id)) return;
    const before = allSkills().length;
    viewed.add(project.id);
    persist();
    renderBag();
    const added = allSkills().length - before;
    showToast(`${project.title}: в сумке ${added > 0 ? '+' + added + ' ' + plural(added, ['компетенция', 'компетенции', 'компетенций']) : 'новый пример применения'}`);
  }

  function openBag(skillId) {
    bagPanel.hidden = false;
    $('#bag-toggle').setAttribute('aria-expanded', 'true');
    renderBag();
    if (skillId) {
      const detail = $(`[data-skill="${skillId}"]`);
      if (detail) { detail.open = true; detail.scrollIntoView({block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth'}); }
    }
    $('#close-bag').focus({preventScroll: true});
  }

  function closeBag() {
    bagPanel.hidden = true;
    $('#bag-toggle').setAttribute('aria-expanded', 'false');
  }

  function openProject(id, options = {}) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    activeProject = id;
    returnFocus = document.activeElement;
    discover(project);
    panel.hidden = false;
    document.body.classList.add('project-open');
    $('#panel-number').textContent = `ПРОЕКТ ${project.number} / 03`;
    const next = projects[(projects.indexOf(project) + 1) % projects.length];
    const relationship = id === 'signalogi' ? 'Продолжение исследования → результаты СИГНАЛОГОВ применены в конкурсном прототипе XEEK.' : id === 'xeek' ? 'Основа решения → методы и результаты проекта СИГНАЛОГИ. Здесь они применены в конкурсном прототипе.' : 'Центральный узел карты: в каждом проекте есть данные, качество и согласованность которых необходимо контролировать.';
    $('#project-content').innerHTML = `
      <span class="project-role">${escapeHTML(project.role)}</span>
      <h2>${escapeHTML(project.title)}</h2>
      <p class="project-subtitle">${escapeHTML(project.subtitle)}</p>
      <div class="readout"><span class="readout-label">ПРОБЛЕМАТИКА</span><p>${escapeHTML(project.shortProblem)}</p></div>
      <div class="project-fields">${project.fields.map((field, i) => `<details ${i === 0 ? 'open' : ''}><summary>${escapeHTML(field.label)}</summary><p>${formatText(field.text)}</p></details>`).join('')}</div>
      <div class="readout"><span class="readout-label">ОСНОВНОЙ РЕЗУЛЬТАТ</span><p>${escapeHTML(project.shortResult)}</p></div>
      <div class="relationship-callout">${escapeHTML(relationship)}</div>
      <p class="section-kicker">КОМПЕТЕНЦИИ В ЭТОМ ПРОЕКТЕ</p>
      <div class="project-skills">${project.skills.map(skill => `<button class="skill-chip" data-open-skill="${skill.id}">${escapeHTML(skill.title)} ↗</button>`).join('')}</div>
      <p class="section-kicker">ПОСМОТРЕТЬ РЕЗУЛЬТАТ</p>
      ${id === 'signalogi' ? depthFigure() : ''}
      ${project.visuals.map((visual, index) => `<figure class="media-figure"><button data-image-project="${id}" data-image-index="${index}" aria-label="Увеличить: ${escapeHTML(visual.title)}"><img src="${visual.src}" alt="${escapeHTML(visual.title)}" loading="lazy"></button><figcaption><strong>${escapeHTML(visual.title)}</strong>${escapeHTML(visual.caption)}</figcaption></figure>`).join('')}
      <p class="source-note">Визуальные материалы из отчётов и презентаций. В этом черновике сохранены исходные графики; оформление будет приведено к общей стилистике.</p>
      <button class="next-project" data-next-project="${next.id}"><span>${id === 'signalogi' ? 'КАК МЕТОД ПОЛУЧИЛ ПРИМЕНЕНИЕ' : id === 'xeek' ? 'ВЕРНУТЬСЯ К ЦЕНТРУ КАРТЫ' : 'ПРОДОЛЖИТЬ МАРШРУТ'}<strong>${escapeHTML(next.title)}</strong></span><b>→</b></button>`;
    $('#panel-scroll').scrollTop = 0;
    renderSlice();
    $$('.project-nav [data-open]').forEach(button => {
      const active = button.dataset.open === id;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    });
    $$('.project-object').forEach(object => object.classList.toggle('selected', object.dataset.project === id));
    if (options.move !== false) moveTo(stops.find(s => s.id === id).position, false);
    if (options.focus !== false) $('#close-project').focus({preventScroll: true});
  }

  function closeProject(restoreFocus = true) {
    panel.hidden = true;
    document.body.classList.remove('project-open');
    if (restoreFocus && returnFocus && document.contains(returnFocus)) returnFocus.focus({preventScroll: true});
  }

  function paintHero() {
    const point = path.getPointAtLength(pathLength * progress);
    $('#hero').setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
    $('#route-fill').style.width = `${progress * 100}%`;
    const nearest = [...stops].sort((a, b) => Math.abs(a.position - progress) - Math.abs(b.position - progress))[0];
    $('#route-position').textContent = Math.abs(nearest.position - progress) < .025 ? projects.find(p => p.id === nearest.id).title : 'В пути…';
    $('#previous-stop').disabled = progress < .005;
    $('#next-stop').disabled = progress >= stops[2].position - .005;
  }

  function moveTo(value, autoOpen = true) {
    if (animation) cancelAnimationFrame(animation);
    const target = Math.max(0, Math.min(stops[2].position, value));
    const start = progress;
    let startTime;
    const duration = reducedMotion ? 0 : Math.min(750, 160 + Math.abs(target - start) * 650);
    $('#hero').classList.toggle('walking', duration > 0);
    const frame = time => {
      if (startTime === undefined) startTime = time;
      const t = duration ? Math.min(1, (time - startTime) / duration) : 1;
      const ease = 1 - (1 - t) ** 3;
      progress = start + (target - start) * ease;
      paintHero();
      if (t < 1) { animation = requestAnimationFrame(frame); return; }
      animation = null;
      $('#hero').classList.remove('walking');
      if (!autoOpen) return;
      const stop = stops.find(s => Math.abs(s.position - progress) < .014);
      if (stop && lastAutoStop !== stop.id) {
        lastAutoStop = stop.id;
        openProject(stop.id, {move: false, focus: false});
      } else if (!stop) lastAutoStop = null;
    };
    animation = requestAnimationFrame(frame);
  }

  function nextStop(direction) {
    const next = direction > 0 ? stops.find(s => s.position > progress + .0001) : [...stops].reverse().find(s => s.position < progress - .0001);
    if (next) moveTo(next.position);
  }

  document.addEventListener('click', event => {
    const open = event.target.closest('[data-open]');
    const object = event.target.closest('[data-project]');
    const next = event.target.closest('[data-next-project]');
    const skill = event.target.closest('[data-open-skill]');
    const source = event.target.closest('[data-skill-source]');
    const image = event.target.closest('[data-image-project]');
    const depthImage = event.target.closest('[data-depth-zoom]');
    if (open) { closeBag(); openProject(open.dataset.open); }
    if (object) { closeBag(); openProject(object.dataset.project); }
    if (next) openProject(next.dataset.nextProject);
    if (skill) openBag(skill.dataset.openSkill);
    if (source) { closeBag(); openProject(source.dataset.skillSource); }
    if (image) {
      const visual = projects.find(p => p.id === image.dataset.imageProject).visuals[Number(image.dataset.imageIndex)];
      $('#large-image').src = visual.src;
      $('#large-image').alt = visual.title;
      $('#large-caption').textContent = visual.caption;
      $('#image-dialog').showModal();
    }
    if (event.target.closest('#slice-play')) toggleSlices();
    if (depthImage && depthPreview) {
      const frame = depthPreview.frames[sliceIndex];
      slicesPlaying = false;
      renderSlice();
      $('#large-image').src = frame.src;
      $('#large-image').alt = frame.label;
      $('#large-caption').textContent = `${frame.label}. ${depthPreview.note} Источник: ${depthPreview.source}.`;
      $('#image-dialog').showModal();
    }
  });

  document.addEventListener('input', event => { if (event.target.id === 'slice-range') selectSlice(event.target.value); });
  $('#motion-toggle').addEventListener('click', toggleSlices);

  if (depthPreview?.frames.length) {
    depthPreview.frames.forEach(frame => { const image = new Image(); image.src = frame.src; });
    renderSlice();
    setInterval(() => {
      const now = performance.now();
      const delta = now - sliceLastTime;
      sliceLastTime = now;
      if (!slicesPlaying || document.hidden || $('#image-dialog').open) return;
      sliceElapsed = (sliceElapsed + delta) % depthPreview.duration;
      const index = Math.min(depthPreview.frames.length - 1, Math.floor(sliceElapsed / depthPreview.duration * depthPreview.frames.length));
      if (index !== sliceIndex) { sliceIndex = index; renderSlice(); }
    }, 100);
  }

  $('#map-stage').addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 1) return;
    const atEnd = progress >= stops[2].position - .002 && event.deltaY > 0;
    const atStart = progress < .002 && event.deltaY < 0;
    if (atEnd || atStart) return;
    event.preventDefault();
    let target = progress + Math.max(-.085, Math.min(.085, event.deltaY * .0007));
    const crossed = event.deltaY > 0 ? stops.find(s => s.position > progress && s.position <= target) : [...stops].reverse().find(s => s.position < progress && s.position >= target);
    if (crossed) target = crossed.position;
    if (!panel.hidden && Math.abs(target - progress) > .015) closeProject(false);
    moveTo(target);
  }, {passive: false});

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if ($('#image-dialog').open) return;
      if (!bagPanel.hidden) { closeBag(); $('#bag-toggle').focus(); }
      else if (!panel.hidden) closeProject();
    }
    const object = event.target.closest('[data-project]');
    if (object && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openProject(object.dataset.project); }
    if (event.target === $('#map-stage') && ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); nextStop(['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
    }
  });

  $('#close-project').addEventListener('click', () => closeProject());
  $('#bag-toggle').addEventListener('click', () => bagPanel.hidden ? openBag() : closeBag());
  $('#close-bag').addEventListener('click', () => { closeBag(); $('#bag-toggle').focus(); });
  $('#all-skills').addEventListener('click', () => { projects.forEach(p => viewed.add(p.id)); persist(); renderBag(); });
  $('#close-image').addEventListener('click', () => $('#image-dialog').close());
  $('#image-dialog').addEventListener('click', event => { if (event.target === $('#image-dialog')) $('#image-dialog').close(); });
  $('#previous-stop').addEventListener('click', () => nextStop(-1));
  $('#next-stop').addEventListener('click', () => nextStop(1));
  $('#connections').addEventListener('click', () => {
    const hidden = $('#map-stage').classList.toggle('hide-links');
    $('#connections').setAttribute('aria-pressed', String(!hidden));
  });
  $('#start').addEventListener('click', () => { lastAutoStop = 'qaqc'; openProject('qaqc'); });
  $('.identity').addEventListener('click', event => { event.preventDefault(); closeProject(false); closeBag(); });
  $('#reset').addEventListener('click', () => {
    viewed.clear(); persist(); renderBag(); closeProject(false); closeBag(); activeProject = null; lastAutoStop = null;
    $$('.project-object').forEach(o => o.classList.remove('selected'));
    $$('.project-nav [data-open]').forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
    moveTo(0, false); $('#toast').classList.remove('show');
  });

  if (!projects.length) {
    $('#route-position').textContent = 'Не удалось загрузить описания';
    return;
  }
  renderBag();
  paintHero();
})();
