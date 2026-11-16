/* Reusable, schematic QAQC checkpoint. Geometry represents types of data, not project results. */
(() => {
  'use strict';
  let instances = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const OUTSIDE = 'M720 390C900 375 1020 280 895 220C745 133 455 133 305 220C180 280 300 375 480 390';
  const PORTRAIT_OUTSIDE = 'M720 390C860 385 900 230 815 180C700 80 490 110 385 200C300 280 340 365 480 390';
  const THROUGH = 'C540 395 660 395 720 390';
  const PALETTE = {green:[123,213,178],gray:[139,157,166],red:[238,125,112]};
  const lerp = (a,b,t) => a.map((n,i) => n+(b[i]-n)*t);
  const smooth = t => {t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const rgb = a => `rgb(${a.map(Math.round).join(',')})`;

  function mount(target, {duration=22000, compact=false, selected=false}={}) {
    if (!target || !window.QaqcDataGlyphs) throw new Error('QAQC stage and data glyphs are required.');
    const uid = 'qc'+(++instances), id = s => uid+'-'+s;
    target.classList.add('qc-checkpoint');
    target.classList.toggle('qc-compact',compact);
    target.classList.toggle('qc-selected',Boolean(selected));
    target.dataset.selected=String(Boolean(selected));
    target.innerHTML = `<svg class="qc-scene" viewBox="100 45 1000 595" xmlns="${NS}" role="img" aria-labelledby="${id('title')} ${id('desc')}">
      <title id="${id('title')}">QA/QC — цикл контроля данных</title>
      <desc id="${id('desc')}">Модели РИГИС, кривые ГИС, зависимости ФЕС, модели пласта, данные добычи и сейсмический куб проходят контроль. Слева данные ожидают проверки, справа проверенные данные. За базой скрытые процессы меняют данные: новая версия требует повторной проверки.</desc>
      <defs>
        <linearGradient id="${id('steel')}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#253d48"/><stop offset=".18" stop-color="#49636c"/><stop offset=".44" stop-color="#2d4651"/><stop offset=".72" stop-color="#142d39"/><stop offset="1" stop-color="#203c48"/></linearGradient>
        <linearGradient id="${id('cap')}" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#668087"/><stop offset=".55" stop-color="#38535e"/><stop offset="1" stop-color="#203b47"/></linearGradient>
        <linearGradient id="${id('brass')}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#826440"/><stop offset=".24" stop-color="#d9bb82"/><stop offset=".5" stop-color="#b38e56"/><stop offset=".8" stop-color="#77603f"/><stop offset="1" stop-color="#bd9b64"/></linearGradient>
        <linearGradient id="${id('glass')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a0c4c3" stop-opacity=".25"/><stop offset="1" stop-color="#0b202b" stop-opacity=".7"/></linearGradient>
        <linearGradient id="${id('flow')}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ee7d70"/><stop offset=".4" stop-color="#7b8e94"/><stop offset=".6" stop-color="#7b8e94"/><stop offset="1" stop-color="#7bd5b2"/></linearGradient>
        <radialGradient id="${id('halo')}"><stop stop-color="#bd9d69" stop-opacity=".16"/><stop offset="1" stop-color="#bd9d69" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id('pool')}"><stop stop-color="#8ebeb8" stop-opacity=".13"/><stop offset="1" stop-color="#8ebeb8" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id('red-field')}"><stop stop-color="#b45549" stop-opacity=".24"/><stop offset="1" stop-color="#b45549" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id('green-field')}"><stop stop-color="#4aa489" stop-opacity=".23"/><stop offset="1" stop-color="#4aa489" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id('selection')}"><stop stop-color="#ffda90" stop-opacity=".6"/><stop offset=".4" stop-color="#e5b86b" stop-opacity=".28"/><stop offset="1" stop-color="#e5b86b" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id('process')}"><stop stop-color="#101e27"/><stop offset=".65" stop-color="#101e27" stop-opacity=".95"/><stop offset="1" stop-color="#101e27" stop-opacity="0"/></radialGradient>
        <filter id="${id('glow')}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="${id('shadow')}" x="-60%" y="-60%" width="220%" height="240%"><feGaussianBlur stdDeviation="13"/></filter>
        <path id="${id('outside')}" d="${OUTSIDE}"/>
        <path id="${id('route')}" d="${OUTSIDE}${THROUGH}"/>
        <clipPath id="${id('scan-clip')}"><path d="M491 283V440C491 499 709 499 709 440V283Z"/></clipPath>
        <clipPath id="${id('token-clip')}"><rect x="-43" y="-33" width="88" height="73"/></clipPath>
      </defs>
      <g aria-hidden="true">
        <ellipse cx="335" cy="342" rx="345" ry="265" fill="url(#${id('red-field')})"/>
        <ellipse cx="865" cy="342" rx="345" ry="265" fill="url(#${id('green-field')})"/>
        <ellipse cx="600" cy="464" rx="352" ry="98" fill="url(#${id('pool')})"/>
        <ellipse cx="600" cy="347" rx="298" ry="221" fill="url(#${id('halo')})"/>
        <g class="qc-orbit-track">
          <use href="#${id('outside')}" fill="none" stroke="#64808b" stroke-opacity=".12" stroke-width="9"/>
          <use href="#${id('outside')}" fill="none" stroke="#81969c" stroke-opacity=".38" stroke-width="1.1"/>
          <use href="#${id('outside')}" class="qc-flow-dashes" fill="none" stroke="url(#${id('flow')})" stroke-width="2" stroke-dasharray="2 18"/>
          <path class="qc-direction-arrows" d="M935 291l-1-11-9 6M606 157l-9-5 9-5M269 314l9 5-1-11" fill="none" stroke="#b2a17d" stroke-width="1.5" stroke-linejoin="round"/>
        </g>
        <g class="qc-data-layer"></g>
        <g class="qc-change-zone">
          <path class="qc-process-haze" fill="none" stroke="#10212a" stroke-width="69" stroke-linecap="round"/>
          <ellipse class="qc-process-cloud" rx="108" ry="48" fill="url(#${id('process')})"/>
          <path class="qc-process-left" d="M-9-18H-18v36h9" fill="none" stroke="#9ca7a6" stroke-opacity=".55" stroke-width="1"/>
          <path class="qc-process-right" d="M9-18h9v36H9" fill="none" stroke="#9ca7a6" stroke-opacity=".55" stroke-width="1"/>
          <g class="qc-change-symbol" fill="none" stroke="#c4b28d" stroke-width="1.6" stroke-linejoin="round">
            <path d="M-76 10h30m-26 0 12-24 10 24m-19-7h17m-14-6h11m-8-6h5m-1-5v26"/>
            <path d="M-40 0h30m-5-4 5 4-5 4" />
            <path d="M-5-7h26v18H-5zM-5-7l5-5h10l4 5M2 0h12"/>
            <rect x="-39" y="-3" width="6" height="6" fill="#ead2a2" stroke="none">
              <animate attributeName="x" values="-39;-39;5;5" keyTimes="0;.25;.75;1" dur="4s" repeatCount="indefinite"/>
            </rect>
            <path d="M29 0h19m-5-4 5 4-5 4M55-11h17l7 7v15H55zM60 0h13m-13 5h10"/>
          </g>
          <text class="qc-change-label" text-anchor="middle">ИЗМЕНЕНИЕ ДАННЫХ</text>
          <text class="qc-change-note" text-anchor="middle">Новые данные скважины или переинтерпретация → новая версия</text>
        </g>
        <g class="qc-database">
          <ellipse cx="600" cy="495" rx="142" ry="41" fill="#000" opacity=".4" filter="url(#${id('shadow')})"/>
          <g class="qc-selection-aura"><ellipse cx="600" cy="573" rx="250" ry="73" fill="url(#${id('selection')})"/><ellipse cx="600" cy="579" rx="203" ry="37" fill="none" stroke="#f0cc87" stroke-opacity=".32" stroke-width="2" filter="url(#${id('glow')})"/></g>
          <path d="M392 468L600 588 808 468v30L600 620 392 498Z" fill="#142b36" stroke="#7a806e" stroke-width="1.3"/>
          <path d="M600 588v32l208-122v-30Z" fill="#1b333b" stroke="#7a806e" stroke-width="1"/>
          <path d="M392 468L600 348 808 468 600 588Z" fill="#263e46" stroke="url(#${id('brass')})" stroke-width="2"/>
          <path d="M409 469L600 359 791 469 600 578Z" fill="#1a303a" stroke="#697d71" stroke-width=".8"/>
          <path class="qc-selected-rim" d="M392 496L600 616 808 496" fill="none" stroke="#d4ae6b" stroke-width="3"/>
          <path d="M417 492l59 34m27 16 59 34m76-1 59-34m28-16 59-34" fill="none" stroke="#445c5e" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="600" cy="469" rx="123" ry="51" fill="#1b333d" stroke="url(#${id('brass')})" stroke-width="3"/>
          <ellipse cx="600" cy="469" rx="133" ry="58" fill="none" stroke="#c0a06a" stroke-opacity=".32" stroke-dasharray="2 10" stroke-width="2"/>
          <path d="M488 283V440C488 499 712 499 712 440V283Z" fill="url(#${id('steel')})" stroke="#8a9e9c" stroke-width="1.8"/>
          <path d="M501 296v143c0 23 12 32 23 36" fill="none" stroke="#9eb6b1" stroke-opacity=".16" stroke-width="5"/>
          <path d="M695 296v141c0 15-7 28-17 35" fill="none" stroke="#030f17" stroke-opacity=".35" stroke-width="10"/>
          <g fill="none" stroke-linejoin="round">
            <path d="M488 332C488 387 712 387 712 332" stroke="#102631" stroke-width="14"/>
            <path d="M488 331C488 386 712 386 712 331" stroke="url(#${id('brass')})" stroke-width="7"/>
            <path d="M488 393C488 448 712 448 712 393" stroke="#102631" stroke-width="14"/>
            <path d="M488 392C488 447 712 447 712 392" stroke="url(#${id('brass')})" stroke-width="7"/>
            <path d="M488 440C488 495 712 495 712 440" stroke="url(#${id('brass')})" stroke-width="8"/>
          </g>
          <ellipse cx="600" cy="283" rx="112" ry="43" fill="url(#${id('cap')})" stroke="url(#${id('brass')})" stroke-width="3"/>
          <ellipse cx="600" cy="283" rx="93" ry="34" fill="url(#${id('glass')})" stroke="#99aea5" stroke-opacity=".4"/>
          <ellipse cx="600" cy="283" rx="76" ry="27" fill="none" stroke="#94b1ae" stroke-opacity=".18" stroke-dasharray="3 5"/>
          <path d="M562 282l38-22 38 22-38 23Z" fill="#18333f" stroke="#c7ad78" stroke-width=".9"/>
          <path d="M578 283l22-12 22 12-22 12Z" fill="none" stroke="#9dbeb5" stroke-opacity=".55"/>
          <circle cx="600" cy="283" r="3" fill="#e6c995"/>
          <g class="qc-scanner" clip-path="url(#${id('scan-clip')})">
            <path class="qc-scan-band" d="M482 0H718V13H482Z" fill="#96e0ce" opacity=".16"/>
            <path class="qc-scan-line" d="M490 0H710" stroke="#b1f5de" stroke-width="1.4" opacity=".6"/>
          </g>
          <g class="qc-db-front">
            <path d="M550 365q50 16 100 0v33q-50 20-100 0Z" fill="#132b36" stroke="#9c8b63" stroke-width=".8"/>
            <text x="600" y="391" text-anchor="middle" class="qc-db-mark">QA/QC</text>
            <path d="M573 444q27 7 54 0" fill="none" stroke="#a6bcb5" stroke-opacity=".28"/>
            <g class="qc-server-lights" fill="#8da9a9"><circle cx="584" cy="444" r="2"/><circle cx="600" cy="446" r="2"/><circle cx="616" cy="444" r="2"/></g>
          </g>
          <g class="qc-port qc-port-in">
            <path d="M459 382l32-10v36l-32 12Z" fill="#172d36" stroke="#b19665" stroke-width="1.5"/>
            <ellipse cx="478" cy="392" rx="15" ry="20" fill="#0b1b24" stroke="#c17f65" stroke-width="3"/>
            <ellipse class="qc-in-glow" cx="478" cy="392" rx="10" ry="14" fill="#ee7d70" opacity=".2" filter="url(#${id('glow')})"/>
            <path d="M469 392h15m-5-5 5 5-5 5" fill="none" stroke="#f2ac9a" stroke-width="1.5"/>
          </g>
          <g class="qc-port qc-port-out">
            <path d="M709 372l32 10v38l-32-12Z" fill="#172d36" stroke="#b19665" stroke-width="1.5"/>
            <ellipse cx="722" cy="392" rx="15" ry="20" fill="#0b1b24" stroke="#7daa8d" stroke-width="3"/>
            <ellipse class="qc-out-glow" cx="722" cy="392" rx="10" ry="14" fill="#7bd5b2" opacity=".2" filter="url(#${id('glow')})"/>
            <path d="M715 392h15m-5-5 5 5-5 5" fill="none" stroke="#b0e7c5" stroke-width="1.5"/>
          </g>
          <g class="qc-bolts" fill="#b6a078" stroke="#142c36" stroke-width=".9"><circle cx="420" cy="468" r="3"/><circle cx="780" cy="468" r="3"/><circle cx="600" cy="568" r="3"/><circle cx="525" cy="510" r="2.5"/><circle cx="676" cy="510" r="2.5"/></g>
        </g>
        <g class="qc-scene-labels">
          <path d="M430 410l-35 33v57h-97" fill="none" stroke="#c38673" stroke-opacity=".4"/>
          <rect x="220" y="513" width="156" height="30" rx="3" fill="#783e36" fill-opacity=".27" stroke="#bb7766" stroke-opacity=".55"/>
          <circle cx="298" cy="500" r="2" fill="#ee7d70"/><text x="298" y="533" text-anchor="middle" class="qc-port-label qc-red">ДО ПРОВЕРКИ</text>
          <path d="M770 410l35 33v57h97" fill="none" stroke="#81b69d" stroke-opacity=".4"/>
          <rect x="824" y="513" width="156" height="30" rx="3" fill="#33745f" fill-opacity=".27" stroke="#77ab91" stroke-opacity=".55"/>
          <circle cx="902" cy="500" r="2" fill="#7bd5b2"/><text x="902" y="533" text-anchor="middle" class="qc-port-label qc-green">ПОСЛЕ КОНТРОЛЯ</text>
        </g>
      </g>
    </svg>`;

    const svg = target.querySelector('svg');
    const path = svg.querySelector('#'+id('route'));
    const outsidePath = svg.querySelector('#'+id('outside'));
    let outside=outsidePath.getTotalLength(),total=path.getTotalLength(),inner=total-outside,portrait=null;
    const layer = svg.querySelector('.qc-data-layer');
    const specs = [
      ['logs',['Модели РИГИС,','кривые ГИС']],['points',['Зависимости ФЕС','и/или иные']],
      ['reservoir',['Модель пласта']],['production',['Данные добычи']],['seismic',['Сейсмический куб']]
    ];
    const tokens = specs.map(([kind,name],index) => {
      const node = document.createElementNS(NS,'g');
      node.classList.add('qc-token');node.dataset.kind=kind;
      node.innerHTML=`<ellipse cy="45" rx="32" ry="6" fill="#030d14" opacity=".28"/>
        <g class="qc-token-content">${window.QaqcDataGlyphs.markup(kind)}
          <g clip-path="url(#${id('token-clip')})"><path class="qc-token-scan" d="M-43-34V41" fill="none" stroke="currentColor" stroke-width="9" opacity=".07"/></g>
          <circle class="qc-state-badge" cx="37" cy="-28" r="8" fill="#10242e" stroke="currentColor" stroke-width="1.3"/>
          <path class="qc-token-check" d="M33-28l3 3 5-6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <g class="qc-token-wait" fill="currentColor"><circle cx="34" cy="-28" r="1"/><circle cx="37" cy="-28" r="1"/><circle cx="40" cy="-28" r="1"/></g>
          <text y="-68" text-anchor="middle" class="qc-token-name">${name.map((line,i)=>`<tspan x="0" dy="${i?12:0}">${line}</tspan>`).join('')}</text>
        </g>`;
      layer.append(node);
      return {node,index,check:node.querySelector('.qc-token-check'),wait:node.querySelector('.qc-token-wait'),scan:node.querySelector('.qc-token-scan')};
    });
    const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
    let cycle=.22, speed=1, running=!motionPreference.matches, last=0, frame=0, destroyed=false;
    function fit() {
      const narrow=!compact&&target.getBoundingClientRect().width<680;
      if(narrow===portrait)return;
      portrait=narrow;target.classList.toggle('qc-portrait',portrait);
      const route=portrait?PORTRAIT_OUTSIDE:OUTSIDE;
      outsidePath.setAttribute('d',route);path.setAttribute('d',route+THROUGH);
      svg.setAttribute('viewBox',portrait?'250 45 700 595':'100 45 1000 595');
      outside=outsidePath.getTotalLength();total=path.getTotalLength();inner=total-outside;
      const center=path.getPointAtLength(outside*.5),before=path.getPointAtLength(outside*.423),after=path.getPointAtLength(outside*.577);
      const section=Array.from({length:15},(_,i)=>{const p=path.getPointAtLength(outside*(.423+i*.154/14));return `${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;}).join('');
      svg.querySelector('.qc-process-haze').setAttribute('d',section);
      svg.querySelector('.qc-process-cloud').setAttribute('cx',center.x);svg.querySelector('.qc-process-cloud').setAttribute('cy',center.y);
      svg.querySelector('.qc-change-symbol').setAttribute('transform',`translate(${center.x} ${center.y})`);
      svg.querySelector('.qc-process-left').setAttribute('transform',`translate(${after.x} ${after.y})`);
      svg.querySelector('.qc-process-right').setAttribute('transform',`translate(${before.x} ${before.y})`);
      svg.querySelector('.qc-change-label').setAttribute('x',center.x);svg.querySelector('.qc-change-label').setAttribute('y',center.y-42);
      svg.querySelector('.qc-change-note').setAttribute('x',center.x);svg.querySelector('.qc-change-note').setAttribute('y',center.y+38);
      render();
    }
    function render() {
      let inspecting=0,incoming=0,outgoing=0;
      for (const token of tokens) {
        const t=(cycle+token.index/tokens.length)%1,d=t*total,p=path.getPointAtLength(d);
        const outer=d/outside, inside=d>outside, q=inside?(d-outside)/inner:0;
        let color,state,opacity=1;
        if(inside){
          state='checking';color=q<.5?PALETTE.red:PALETTE.green;
          opacity=q<.22?1-q/.22:q>.78?(q-.78)/.22:0;
          inspecting=Math.max(inspecting,Math.sin(q*Math.PI));
        }else if(outer<.405){state='verified';color=PALETTE.green;}
        else if(outer<.455){state='changing';color=PALETTE.green;opacity=1-smooth((outer-.405)/.05);}
        else if(outer<.545){state='changing';color=PALETTE.gray;opacity=0;}
        else if(outer<.595){state='new';color=PALETTE.gray;opacity=smooth((outer-.545)/.05);}
        else if(outer<.66){state='new';color=PALETTE.gray;}
        else if(outer<.77){state='pending';color=lerp(PALETTE.gray,PALETTE.red,smooth((outer-.66)/.11));}
        else{state='pending';color=PALETTE.red;}
        const far=1-Math.max(0,Math.min(1,(p.y-153)/245)),scale=.79+.25*(1-far);
        token.node.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) scale(${scale.toFixed(4)})`);
        token.node.style.color=rgb(color);token.node.style.opacity=String(opacity*(1-far*.17));
        token.node.dataset.state=state;
        token.check.style.opacity=state==='verified'||(state==='checking'&&q>.5)?'1':'0';
        token.wait.style.opacity=state==='verified'||(state==='checking'&&q>.5)?'0':state==='pending'||state==='checking'?'1':'.35';
        token.scan.setAttribute('transform',`translate(${((cycle*3+token.index*.21)%1)*90} 0)`);
        if(d>outside-130&&d<outside+inner*.3)incoming=Math.max(incoming,1-Math.min(1,Math.abs(d-outside)/130));
        if(d<130||q>.7)outgoing=Math.max(outgoing,d<130?1-d/130:(q-.7)/.3);
      }
      const scanY=288+(cycle*6%1)*178;
      svg.querySelector('.qc-scan-band').setAttribute('transform',`translate(0 ${scanY.toFixed(2)})`);
      svg.querySelector('.qc-scan-line').setAttribute('transform',`translate(0 ${scanY.toFixed(2)})`);
      svg.querySelector('.qc-scanner').style.opacity=String(.2+.8*inspecting);
      svg.querySelector('.qc-in-glow').setAttribute('opacity',String(.15+.65*incoming));
      svg.querySelector('.qc-out-glow').setAttribute('opacity',String(.15+.65*outgoing));
      svg.querySelector('.qc-server-lights').style.fill=rgb(lerp([141,169,169],PALETTE.green,inspecting));
      target.dataset.cycle=cycle.toFixed(5);target.dataset.playing=String(running);
    }
    function tick(now) {
      if(destroyed)return;
      if(last&&running&&!document.hidden)cycle=(cycle+Math.min(now-last,100)*speed/duration)%1;
      last=now;if(running&&!document.hidden)render();
      frame=requestAnimationFrame(tick);
    }
    function setPlaying(value){running=Boolean(value);last=0;render();target.dispatchEvent(new CustomEvent('qcplaychange',{detail:{playing:running}}));}
    function onVisibility(){last=0;target.classList.toggle('qc-suspended',document.hidden);}
    function onMotionPreference(event){setPlaying(!event.matches);}
    document.addEventListener('visibilitychange',onVisibility);
    motionPreference.addEventListener('change',onMotionPreference);
    const observer=new ResizeObserver(fit);observer.observe(target);
    fit();render();frame=requestAnimationFrame(tick);
    return Object.freeze({
      setPlaying,toggle:()=>setPlaying(!running),
      setSelected(value){target.classList.toggle('qc-selected',Boolean(value));target.dataset.selected=String(Boolean(value));},
      setSpeed(value){speed=Math.max(.25,Math.min(2,Number(value)||1));},
      get playing(){return running;},
      destroy(){destroyed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);motionPreference.removeEventListener('change',onMotionPreference);target.replaceChildren();}
    });
  }
  window.QaqcCheckpoint=Object.freeze({mount});
})();
