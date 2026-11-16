(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const projects = window.PORTFOLIO_DATA || [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = $('#hero');
  const world = $('#world');
  const mobile = matchMedia('(max-width: 680px), (pointer: coarse) and (max-width: 950px)');
  const chronology = window.PROJECT_CHRONOLOGY;
  const routeY = 339;
  const lowerY = 716;
  const spacing = 310;
  const stageNumber = order => Number(order.split('.')[0]);
  const stageX = order => Math.floor((stageNumber(order) - 1) / 2) * spacing + 185;
  const stageY = order => [1, 0].includes(stageNumber(order) % 4) ? routeY : lowerY;
  const svg = (tag, attrs, content) => {
    const element = document.createElementNS(world.namespaceURI, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    if (content) element.textContent = content;
    return element;
  };
  const orderOf = project => {
    if (project.id === 'mentoring') return '7';
    const order = chronology[project.sourceId].order;
    const stage = stageNumber(order);
    return String(stage >= 7 ? stage + 1 : stage);
  };
  function roleIcon(role, x, y) {
    const icon = svg('g', {transform: `translate(${x} ${y})`, class: `role-icon role-${role}`});
    icon.append(svg('circle', {r: 12}));
    icon.append(svg('path', {d: role === 1
      ? 'M-8 4H8M-6 3V0a6 6 0 0 1 12 0v3M0-7v5'
      : 'M-5-6h10v13H-5zM-2-7h4v3h-4zM-2 0h4M-2 3h4'}));
    return icon;
  }
  const legend = $('#timeline-role-legend');
  const legendTitle = document.createElement('p');
  legendTitle.textContent = 'Выполняемые роли:';
  legend.append(legendTitle);
  for (const [role, name] of [[1, 'Инженер'], [2, 'Руководитель / наставник']]) {
    const mark = svg('svg', {viewBox: '-13 -13 26 26', 'aria-hidden': 'true'});
    mark.append(roleIcon(role, 0, 0));
    const item = document.createElement('span');
    item.append(mark, name);
    legend.append(item);
  }
  const width = 1920;
  world.setAttribute('viewBox', `0 50 ${width} 950`);
  world.setAttribute('preserveAspectRatio', 'none');
  world.style.setProperty('--timeline-width', width + 'px');
  const terrain = world.querySelector(':scope > g[aria-hidden="true"]');
  const route = svg('g', {class: 'timeline-route', 'aria-hidden': 'true'});

  const stages = Array.from({length: 11}, (_, index) => index + 1);
  const waypoints = [{x: 70, y: routeY}, ...stages.map(stage => ({x: stageX(String(stage)), y: stageY(String(stage))}))];
  const contactStop = {id: 'contacts', order: '12', x: stageX('11'), y: 424, lift: 78};
  waypoints.push({x: contactStop.x, y: contactStop.y});
  const contactApproach = [{x: 1860, y: lowerY}, {x: 1860, y: contactStop.y}];
  const routePoints = [...waypoints.slice(0, -1), ...contactApproach, waypoints.at(-1)];
  const pipeline = routePoints.map(({x, y}, i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  for (const layer of ['shell', 'body', 'highlight']) {
    route.append(svg('path', {d: pipeline, class: `pipeline-${layer}`}));
  }
  const progress = svg('path', {d: pipeline, pathLength: 100, class: 'pipeline-progress'});
  const impulse = svg('path', {d: pipeline, pathLength: 100, class: 'pipeline-impulse'});
  route.append(progress, impulse);
  const distances = [0];
  for (let index = 1; index < routePoints.length; index++) {
    const {x, y} = routePoints[index];
    const previous = routePoints[index - 1];
    distances.push(distances.at(-1) + Math.hypot(x - previous.x, y - previous.y));
  }
  function drawProgress(point) {
    let nearest = Infinity;
    let travelled = 0;
    for (let index = 1; index < routePoints.length; index++) {
      const start = routePoints[index - 1];
      const end = routePoints[index];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = distances[index] - distances[index - 1];
      const ratio = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)));
      const gap = Math.hypot(point.x - start.x - dx * ratio, point.y - start.y - dy * ratio);
      if (gap < nearest) {
        nearest = gap;
        travelled = distances[index - 1] + length * ratio;
      }
    }
    const percentage = travelled / distances.at(-1) * 100;
    progress.setAttribute('stroke-dasharray', `${percentage} 101`);
    progress.style.opacity = percentage ? '1' : '0';
  }
  for (const {x, y} of routePoints.slice(1, -1)) {
    route.append(svg('circle', {cx: x, cy: y, r: 13, class: 'pipeline-flange'}));
  }
  const scenery = svg('g', {class: 'platform-scenery', 'aria-hidden': 'true'});
  const props = {
    trees: [
      ['path', {d: 'M-16 4v-9M8 12V2M-30-5l14-28L-2-5zM-6 2 8-26 22 2z', fill: '#506d5e', stroke: '#8ba28a'}],
    ],
    truck: [
      ['path', {d: 'M-26 2l31-14 21 10L-4 13z', fill: '#9e8960'}],
      ['path', {d: 'M-26 2v9l22 10V13m0 8L26 7V-2L-4 13', fill: '#586967', stroke: '#263d45'}],
      ['path', {d: 'M7-8l10-4 10 5-10 5z', fill: '#b6ad91'}],
      ['circle', {cx: -16, cy: 15, r: 4, fill: '#25383c'}],
      ['circle', {cx: 13, cy: 13, r: 4, fill: '#25383c'}],
    ],
    drill: [
      ['path', {d: 'M-23 7 0-4 24 7 1 18z', fill: '#758878'}],
      ['path', {d: 'M-10 5 0-35 12 5M-8-4H10M-5-15H6M-8-4 6-15M0-29V8', fill: 'none', stroke: '#b3a47d', 'stroke-width': 2.5}],
    ],
    sacks: [
      ['path', {d: 'M-26 8 -8-1 25 9 7 18z', fill: '#52625c'}],
      ['ellipse', {cx: -9, cy: 5, rx: 12, ry: 6, fill: '#998660'}],
      ['ellipse', {cx: 5, cy: 9, rx: 12, ry: 6, fill: '#ab9670'}],
      ['ellipse', {cx: 0, cy: 2, rx: 11, ry: 5, fill: '#bfaa83'}],
    ],
  };
  for (const [type, x, y] of [
    ['trees', 309, 467], ['truck', 655, 513], ['drill', 982, 476],
    ['sacks', 1258, 525], ['trees', 1516, 422],
    ['sacks', 348, 808], ['trees', 608, 849], ['truck', 995, 814],
    ['drill', 1280, 850], ['sacks', 1535, 811],
  ]) {
    const prop = svg('g', {transform: `translate(${x} ${y})`});
    for (const [tag, attributes] of props[type]) prop.append(svg(tag, attributes));
    scenery.append(prop);
  }
  const lanterns = svg('g', {class: 'route-lanterns'});
  for (const [x, y, scale] of [
    [104,378,.85], [222,433,1], [453,389,.86], [570,373,1.03],
    [854,453,.87], [1021,370,.95], [1164,455,.79], [1382,396,1],
    [1646,441,.85], [1817,467,.92], [391,753,.92], [923,770,.82],
    [1519,747,1.03], [1669,758,.78],
  ]) {
    const lamp = svg('g', {transform: `translate(${x} ${y}) scale(${scale})`});
    lamp.append(
      svg('ellipse', {cy: 0, rx: 24, ry: 10, class: 'lantern-pool'}),
      svg('path', {d: 'M0 2v-31M-6-28h12l-3-6h-6z', class: 'lantern-frame'}),
      svg('circle', {cy: -25, r: 3.5, class: 'lantern-bulb'}),
    );
    lanterns.append(lamp);
  }
  scenery.append(lanterns);
  terrain.after(scenery);
  for (const stage of stages) {
    const x = stageX(String(stage));
    const laneY = stageY(String(stage));
    route.append(svg('text', {x: x - 53, y: laneY + 29, class: 'timeline-step'}, `Этап ${stage}`));
  }
  scenery.after(route);
  const acquired = new Set();
  const start = {x: 70, y: routeY};
  const stops = projects.map(project => {
    const {id} = project;
    const order = orderOf(project);
    const x = stageX(order);
    const laneY = stageY(order);
    const object = $('#object-' + id);
    const label = object.querySelector('.node-label');
    const {e, f} = label.transform.baseVal.getItem(0).matrix;
    object.setAttribute('transform', `translate(${x - e * .87} ${laneY - 54 - f * .87}) scale(.87)`);
    label.querySelector('.node-number')?.replaceChildren(order);
    const pedestal = $('#pedestal-' + id);
    pedestal.setAttribute('transform', `translate(${x} ${laneY})`);
    pedestal.querySelector('.pedestal-number')?.replaceChildren(order);
    const marker = svg('circle', {cx: x, cy: laneY, r: 7, class: 'timeline-mark'});
    route.append(marker);
    const roles = project.sourceId ? chronology[project.sourceId].roles : [2];
    const badges = svg('g', {transform: `translate(${x + 32} ${laneY + 10})`, 'aria-hidden': 'true'});
    roles.forEach((role, index) => badges.append(roleIcon(role, index * 27, 0)));
    hero.before(badges);
    return {id, order, x, y: laneY, trigger: object, marker, badges, label, labelX: e, labelY: f};
  });
  const contact = svg('g', {
    id: 'object-contacts', class: 'contact-pedestal', role: 'button', tabindex: 0,
    'data-travel': 'contacts', 'aria-label': 'Открыть контакты',
    transform: `translate(${contactStop.x} ${contactStop.y})`,
  });
  contact.append(
    svg('ellipse', {class: 'contact-glow', cy: -22, rx: 80, ry: 51}),
    svg('path', {class: 'contact-plinth', d: 'M-66 1 0-29 66 1v15L0 46-66 16Z'}),
    svg('path', {class: 'contact-step', d: 'M-58-10 0-36l58 26V0L0 26-58 0Z'}),
    svg('path', {class: 'contact-tower', d: 'M-44-18v-60L0-98l44 20v60L0 2Z'}),
    svg('path', {class: 'contact-tower-face', d: 'M-44-78 0-58l44-20M0-58V2M-33-62v34M33-62v34'}),
    svg('path', {class: 'contact-tower-cap', d: 'M-44-78 0-98l44 20L0-58Z'}),
    svg('path', {class: 'contact-inlay', d: 'M-24-37 0-26l24-11M-24-31 0-20l24-11'}),
    svg('path', {class: 'contact-envelope', d: 'M-17-82 0-90l17 8L0-74zM-17-82 0-80l17-2'}),
    svg('text', {y: -151, class: 'contact-pedestal-label'}, 'Контакты'),
  );
  hero.before(contact);
  contactStop.trigger = contact;
  stops.push(contactStop);
  stops.sort((a, b) => Number(a.order) - Number(b.order));
  const keyOf = stop => stop.key ?? stop.id;
  const nextButton = $('#timeline-next');
  const prevButton = $('#timeline-prev');
  function moveAlong(direction) {
    const index = stops.findIndex(stop => keyOf(stop) === (destination ?? activeStop));
    const target = stops[index + direction];
    if (target) requestTravel(keyOf(target));
  }
  nextButton.addEventListener('click', () => moveAlong(1));
  prevButton.addEventListener('click', () => moveAlong(-1));
  let position = start;
  let active = null;
  let activeStop = null;
  let destination = null;
  let jumpFrame = null;
  let bagTimer;
  const plural = n => n%100>=11&&n%100<=14?'компетенций':n%10===1?'компетенция':n%10>=2&&n%10<=4?'компетенции':'компетенций';

  function getSkills() {
    const skills=new Map();
    for(const project of projects) {
      if(!acquired.has(project.id))continue;
      for(const skill of project.skills){
        if(!skills.has(skill.id))skills.set(skill.id,{...skill,sources:[]});
        skills.get(skill.id).sources.push(project);
      }
    }
    return [...skills.values()];
  }
  function renderBag() {
    const skills=getSkills();
    const growth = Math.min(1.36, 1 + skills.length * .018);
    $('#bag-toggle').style.setProperty('--bag-growth', growth);
    $('#bag-count').textContent=skills.length;
    const projectWord = acquired.size === 1 ? 'проект' : acquired.size < 5 ? 'проекта' : 'проектов';
    $('#bag-status').textContent=skills.length?`${skills.length} ${plural(skills.length)} · ${acquired.size} ${projectWord}`:'Путь начинается с первого проекта';
    $('#pouch-belly').style.transform=`scaleX(${Math.min(1.23,1+skills.length*.012)}) scaleY(${Math.min(1.12,1+skills.length*.006)})`;
    $('#pouch-fill').setAttribute('opacity',String(skills.length*.045));
    window.CompetencyGraph.render(skills);
  }
  function paintStates() {
    const visibleStop = stops.find(stop => stop.id === active) ?? stops[0];
    world.classList.toggle('single-stage', mobile.matches);
    world.setAttribute('preserveAspectRatio', mobile.matches ? 'xMidYMid meet' : 'none');
    world.setAttribute('viewBox', mobile.matches
      ? `${visibleStop.x - 185} ${visibleStop.y - 275} 370 380`
      : `0 50 ${width} 950`);
    for (const {id, trigger, marker, badges, label, labelX, labelY} of stops) {
      if (label) label.setAttribute('transform', `translate(${labelX} ${labelY - (mobile.matches ? 100 : 0)})`);
      const visible = !mobile.matches || visibleStop.id === id;
      for (const element of [trigger, marker, badges, $('#pedestal-' + id)]) {
        if (element) element.style.display = visible ? '' : 'none';
      }
      if (!marker) continue;
      const passed = acquired.has(id);
      const current = active === id;
      const pedestal = $('#pedestal-' + id);
      for (const element of [trigger, pedestal, marker]) {
        element.classList.toggle('unlocked', passed);
        element.classList.toggle('active', current);
      }
      trigger.classList.toggle('locked', !passed);
      const title = projects.find(project => project.id === id).title;
      const status = current ? ' · текущий этап' : passed ? ' · пройден' : '';
      trigger.setAttribute('aria-label', `Посетить проект ${title}${status}`);
      if (current) trigger.setAttribute('aria-current', 'step');
      else trigger.removeAttribute('aria-current');
    }
  }
  function flySkills(count) {
    if(reducedMotion)return;
    const h=hero.getBoundingClientRect(),b=$('#pouch-belly').getBoundingClientRect();
    const start={x:h.x+h.width/2,y:h.y+h.height/2};
    for(let i=0;i<Math.min(count,5);i++){
      const icon=document.createElement('span');icon.className='skill-flight';icon.textContent='✦';icon.setAttribute('aria-hidden','true');
      Object.assign(icon.style,{left:start.x+'px',top:start.y+'px',animationDelay:i*80+'ms'});
      icon.style.setProperty('--travel-x',b.x+b.width/2-start.x+'px');icon.style.setProperty('--travel-y',b.y+b.height/2-start.y+'px');
      document.body.append(icon);setTimeout(()=>icon.remove(),1500);
    }
  }
  function updateCompetencies(stop) {
    const before = getSkills().length;
    acquired.clear();
    stops.filter(item => Number(item.order) <= Number(stop.order))
      .filter(item => item.marker)
      .forEach(item => acquired.add(item.id));
    const count = getSkills().length - before;
    if (count <= 0 || reducedMotion) {
      renderBag();
      return;
    }
    flySkills(count);
    bagTimer = setTimeout(() => {
      renderBag();
      const bag = $('#bag-toggle');
      bag.classList.remove('gaining');
      void bag.offsetWidth;
      bag.classList.add('gaining');
    }, 900);
  }
  function paintHero(point, routePoint = point) {
    if (mobile.matches && destination) {
      world.setAttribute('viewBox', `${routePoint.x - 185} ${routePoint.y - 275} 370 380`);
    }
    position = point;
    drawProgress(routePoint);
    hero.setAttribute('transform', `translate(${point.x} ${point.y})`);
  }

  function resetPosition() {
    contactCard.hidden = true;
    studyButton.hidden = true;
    active = activeStop = null;
    prevButton.disabled = true;
    nextButton.disabled = false;
    hero.classList.remove('standing', 'walking');
    $('#bag-toggle').classList.remove('gaining');
    acquired.clear();
    renderBag();
  }

  function closeBag() {
    if (bagDialog.open) bagDialog.close();
  }

  function cancelJump() {
    clearTimeout(bagTimer);
    $$('.skill-flight').forEach(icon => icon.remove());
    cancelAnimationFrame(jumpFrame);
    jumpFrame = null;
    destination = null;
  }

  function requestTravel(id) {
    const stop = stops.find(item => keyOf(item) === id || item.id === id);
    if (!stop) return;
    cancelJump();
    closeBag();
    destination = id;
    contactCard.hidden = true;
    studyButton.hidden = true;
    $('#map-whisper').classList.add('faded');
    hero.classList.remove('standing');

    const from = position;
    renderBag();
    const finish = () => {
      cancelJump();
      paintHero({x: stop.x, y: stop.y - (stop.lift ?? 0)}, stop);
      hero.classList.remove('walking');
      active = stop.id;
      activeStop = keyOf(stop);
      prevButton.disabled = stops[0] === stop;
      nextButton.disabled = stops.at(-1) === stop;
      hero.classList.add('standing');
      updateCompetencies(stop);
      paintStates();
      if (stop.id === 'contacts') {
        contactCard.hidden = false;
        return;
      }
      placeStudyButton(stop);
      studyButton.hidden = false;
    };
    if (reducedMotion || (from.x === stop.x && from.y === stop.y)) {
      finish();
      return;
    }

    const targetStage = stageNumber(stop.order);
    const originStage = activeStop ? stageNumber(stops.find(item => keyOf(item) === activeStop).order) : 0;
    const direction = Math.sign(targetStage - originStage);
    const path = [from, waypoints[originStage]];
    for (let stage = originStage; stage !== targetStage;) {
      if (stage === 11 && direction === 1) path.push(...contactApproach);
      if (stage === 12 && direction === -1) path.push(...contactApproach.toReversed());
      stage += direction;
      path.push(waypoints[stage]);
    }
    const segments = path.slice(1).map((end, index) => {
      const start = path[index];
      return {start, end, length: Math.hypot(end.x - start.x, end.y - start.y)};
    }).filter(segment => segment.length > 0);
    const distance = segments.reduce((sum, segment) => sum + segment.length, 0);
    const duration = Math.min(3200, Math.max(450, distance * 2.2));
    hero.classList.add('walking');
    let started;
    function step(now) {
      started ??= now;
      const elapsed = now - started;
      const walk = Math.min(1, elapsed / duration);
      const jump = Math.min(1, Math.max(0, (elapsed - duration) / 400));
      if (jump === 1) { finish(); return; }
      const arrival = waypoints[targetStage];
      if (walk === 1) {
        hero.classList.remove('walking');
        const platformLift = stop.lift ?? 0;
        paintHero({x: arrival.x, y: arrival.y - platformLift * jump - 132 * jump * (1 - jump)}, arrival);
      } else {
        let remaining = distance * (walk * walk * (3 - 2 * walk));
        for (const {start, end, length} of segments) {
          if (remaining <= length) {
            const t = remaining / length;
            paintHero({x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t});
            break;
          }
          remaining -= length;
        }
      }
      jumpFrame = requestAnimationFrame(step);
    }
    jumpFrame = requestAnimationFrame(step);
  }

  const contactCard = $('#contact-card');
  const mapStage = $('#map-stage');
  const studyButton = document.createElement('button');
  studyButton.type = 'button';
  studyButton.className = 'study-button';
  studyButton.textContent = 'Изучить';
  studyButton.hidden = true;
  mapStage.append(studyButton);
  function placeStudyButton(stop) {
    const y = stop.y + 45;
    const point = new DOMPoint(stop.x, y).matrixTransform(world.getScreenCTM());
    const bounds = mapStage.getBoundingClientRect();
    studyButton.style.left = `${Math.min(bounds.width - 45, Math.max(45, point.x - bounds.left))}px`;
    studyButton.style.top = `${Math.min(bounds.height - 34, point.y - bounds.top)}px`;
  }
  new ResizeObserver(() => {
    if (studyButton.hidden) return;
    const stop = stops.find(item => keyOf(item) === activeStop);
    if (stop) placeStudyButton(stop);
  }).observe(mapStage);
  studyButton.addEventListener('click', () => {
    const stop = stops.find(item => keyOf(item) === activeStop);
    if (!stop || destination) return;
    if (stop.marker) window.CasePanel.open(stop.id, studyButton);
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-project],[data-travel]');
    if (trigger) requestTravel(trigger.dataset.project ?? trigger.dataset.travel);
  });
  document.addEventListener('keydown', event => {
    if (window.CasePanel.isOpen() || bagDialog.open) return;
    if (event.key === 'Escape') { closeBag(); return; }
    const object = event.target.closest('[data-project],[data-travel]');
    if (object && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      requestTravel(object.dataset.project ?? object.dataset.travel);
      return;
    }
    if (event.target !== $('#map-stage')) return;
    if (['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const forward = ['ArrowRight','ArrowDown'].includes(event.key);
      moveAlong(forward ? 1 : -1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      cancelJump();
      resetPosition();
      paintHero(start);
      paintStates();
    }
    if (event.key === 'End') {
      event.preventDefault();
      requestTravel(keyOf(stops.at(-1)));
    }
  });
  const bagToggle = $('#bag-toggle');
  const bagDialog = $('#bag-panel');
  bagToggle.addEventListener('animationend', event => {
    if (event.animationName === 'bag-gain') bagToggle.classList.remove('gaining');
  });
  bagToggle.addEventListener('click', () => {
    renderBag();
    bagDialog.showModal();
    bagToggle.setAttribute('aria-expanded', 'true');
    $('#close-bag').focus({preventScroll: true});
  });
  $('#close-bag').addEventListener('click', closeBag);
  bagDialog.addEventListener('close', () => {
    bagToggle.setAttribute('aria-expanded', 'false');
    bagToggle.focus({preventScroll: true});
  });

  const depth=window.SIGNALOGI_DEPTH,depthDuration=depth?.duration||4500;let depthIndex=0,depthElapsed=0,depthLast=performance.now();
  function paintDepth(){
    if(!depth?.frames.length)return;
    $('#slice-map-image').setAttribute('href',depth.frames[depthIndex].src);
    $('#slice-map-label').textContent=`${depthIndex+1}/${depth.frames.length}`;
  }
  if(depth?.frames.length){
    depth.frames.forEach(frame=>{const image=new Image();image.src=frame.src;});paintDepth();
    setInterval(()=>{const now=performance.now(),delta=now-depthLast;depthLast=now;if(reducedMotion||document.hidden||!acquired.has('signalogi'))return;depthElapsed=(depthElapsed+delta)%depthDuration;const index=Math.min(depth.frames.length-1,Math.floor(depthElapsed/depthDuration*depth.frames.length));if(index!==depthIndex){depthIndex=index;paintDepth();}},100);
  }
  mobile.addEventListener('change', () => {
    paintStates();
    const stop = stops.find(item => item.id === active);
    if (stop && !studyButton.hidden) placeStudyButton(stop);
  });
  renderBag();paintStates();paintHero(start);
})();
