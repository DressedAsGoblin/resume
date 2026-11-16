/* Navigation metaphor: field measurement, recording and a schematic subsurface wavefield. */
(() => {
  'use strict';
  let count=0;
  const NS='http://www.w3.org/2000/svg';
  const cycleDuration = 6500;
  const frontCount = 12;
  const rockDepth = 150;
  const depthScale = 330;
  const meterWidth = 24;

  // The same expanding front intersects both visible faces of the rock block.
  // Coordinates along the faces use the unit square of the isometric surface.
  const source = {u: .696, v: .282};
  const faces = [
    {x: 170, direction: 1, distance: 1 - source.v, along: source.u},
    {x: 1030, direction: -1, distance: 1 - source.u, along: source.v},
  ];

  function rockFront(radius, reflected = false) {
    return faces.map(face => {
      const section = radius * radius - face.distance * face.distance;
      if (section <= 0) return '';
      const reach = Math.sqrt(section);
      const start = Math.max(0, face.along - reach);
      const end = Math.min(1, face.along + reach);
      const points = [];
      for (let i = 0; i <= 32; i++) {
        const along = start + (end - start) * i / 32;
        const offset = along - face.along;
        const depth = Math.sqrt(Math.max(0, section - offset * offset)) * depthScale;
        const x = face.x + face.direction * 430 * along;
        const y = 390 + 230 * along + (reflected ? 2 * rockDepth - depth : depth);
        points.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return points.join('');
    }).join('');
  }

  function meterSignal(x, phase) {
    const position = x / meterWidth;
    const carrier = Math.sin(2 * Math.PI * (1.65 * position - 5 * phase));
    const overtone = Math.sin(2 * Math.PI * (3.3 * position - 10 * phase + .12));
    const envelope = .75 + .25 * Math.sin(2 * Math.PI * (position - 2 * phase));
    return 12 + envelope * (7.5 * carrier + 1.5 * overtone);
  }

  function mount(target,{selected=true}={}) {
    if(!target)throw new Error('Signalogi stage is required.');
    const uid='signalogi-'+(++count),id=s=>uid+'-'+s;
    target.classList.add('sg-checkpoint');target.dataset.selected=String(selected);
    const leftColors=['#b5a081','#708583','#b0886b','#9f9e7d','#617f87','#967d62'];
    const rightColors=['#927e63','#506d70','#916d56','#7f8569','#426674','#78634f'];
    const layers=leftColors.map((color,i)=>{
      const z=i*25,h=25;
      return `<path d="M170 ${390+z}C310 ${448+z} 450 ${558+z} 600 ${620+z}V${620+z+h}C450 ${558+z+h} 310 ${448+z+h} 170 ${390+z+h}Z" fill="${color}"/>
        <path d="M600 ${620+z}C746 ${553+z} 885 ${452+z} 1030 ${390+z}V${390+z+h}C885 ${452+z+h} 746 ${553+z+h} 600 ${620+z+h}Z" fill="${rightColors[i]}"/>`;
    }).join('');
    target.innerHTML=`<svg class="sg-scene" xmlns="${NS}" viewBox="110 55 980 765" role="img" aria-labelledby="${id('title')} ${id('desc')}">
      <title id="${id('title')}">СИГНАЛОГИ — инженер и регистрация сигналов</title>
      <desc id="${id('desc')}">Инженер записывает показания. На экране полевого прибора колеблется сигнал. Волновые фронты непрерывно проходят через слои породы. Чёрный регистратор отображает трассы и волновое поле.</desc>
      <defs>
        <linearGradient id="${id('metal')}" x2="1" y2="1"><stop stop-color="#58727c"/><stop offset=".45" stop-color="#243f4c"/><stop offset="1" stop-color="#142b38"/></linearGradient>
        <linearGradient id="${id('brass')}" x2="1"><stop stop-color="#82683f"/><stop offset=".32" stop-color="#d9b67b"/><stop offset=".7" stop-color="#a27e49"/><stop offset="1" stop-color="#e0c18c"/></linearGradient>
        <linearGradient id="${id('surface')}" x2=".3" y2="1"><stop stop-color="#4d655f"/><stop offset="1" stop-color="#243c43"/></linearGradient>
        <linearGradient id="${id('cabinet')}" x2="1" y2="1"><stop stop-color="#263d47"/><stop offset=".45" stop-color="#0b1b25"/><stop offset="1" stop-color="#07131c"/></linearGradient>
        <radialGradient id="${id('aura')}"><stop stop-color="#e7bd72" stop-opacity=".42"/><stop offset=".5" stop-color="#c49b61" stop-opacity=".17"/><stop offset="1" stop-color="#b18b57" stop-opacity="0"/></radialGradient>
        <filter id="${id('soft')}" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="15"/></filter>
        <filter id="${id('small-glow')}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="${id('grit')}" width="31" height="24" patternUnits="userSpaceOnUse"><path d="M4 7h3m15 11h4M15 2h1m-7 19h2" stroke="#c5bfa5" stroke-opacity=".13" stroke-width="1"/></pattern>
        <clipPath id="${id('subsurface')}"><path d="M170 390L600 620 1030 390V540L600 770 170 540Z"/></clipPath>
        <clipPath id="${id('screen')}"><rect x="0" y="0" width="154" height="88" rx="2"/></clipPath>
        <clipPath id="${id('field')}"><rect x="5" y="6" width="88" height="65"/></clipPath>
        <clipPath id="${id('traces')}"><rect x="102" y="6" width="45" height="65"/></clipPath>
        <clipPath id="${id('meter-screen')}"><rect width="${meterWidth}" height="24" rx="1"/></clipPath>
      </defs>
      <g aria-hidden="true">
        <ellipse class="sg-selection-aura" cx="600" cy="746" rx="465" ry="91" fill="url(#${id('aura')})" filter="url(#${id('soft')})"/>
        <ellipse cx="600" cy="762" rx="385" ry="37" fill="#040d15" opacity=".34" filter="url(#${id('soft')})"/>
        <g class="sg-earth-block">
          <path d="M170 390L600 620 1030 390V552L600 784 170 552Z" fill="#152d3a" stroke="#899080" stroke-width="1.6"/>
          ${layers}
          <path d="M170 390L600 620 1030 390V540L600 770 170 540Z" fill="url(#${id('grit')})"/>
          <path d="M170 540L600 770 1030 540v12L600 784 170 552Z" fill="#263c46" stroke="#a28b5f" stroke-width="1.6"/>
          <path class="sg-rim-light" d="M171 550L600 781 1029 550" fill="none" stroke="#ecc884" stroke-width="2.5"/>
          <path d="M170 390L600 160 1030 390 600 620Z" fill="url(#${id('surface')})" stroke="#a6a38b" stroke-width="1.5"/>
          <path d="M170 390L600 160 1030 390 600 620Z" fill="url(#${id('grit')})"/>
          <path d="M195 390L600 174 1005 390 600 607Z" fill="none" stroke="#a2b1a0" stroke-opacity=".3"/>
          <path d="M259 381l67-35m-17 50 64-35m533 57 67-35M395 482l98 54m-75-89 98 53" stroke="#a6b19b" stroke-opacity=".2" stroke-width="1.2" fill="none"/>
          <g clip-path="url(#${id('subsurface')})">
            <path d="M778 345V761" stroke="#c5cfb6" stroke-width="1.6" stroke-dasharray="3 6" opacity=".6"/>
            <path d="M778 520V743" stroke="#122832" stroke-width="9" opacity=".4"/>
            <g class="sg-underground-waves"></g>
            <g class="sg-return-waves"></g>
            <path d="M602 682Q769 565 1028 492" fill="none" stroke="#d8bd88" stroke-width="1" stroke-opacity=".35"/>
          </g>
          <path d="M170 390L600 620 1030 390M600 620V770" fill="none" stroke="#c0b697" stroke-opacity=".7" stroke-width="1.4"/>
          <text x="780" y="720" text-anchor="middle" class="sg-earth-label" transform="rotate(-28 780 720)">ВОЛНОВОЕ ПОЛЕ</text>
        </g>
        <g class="sg-cables" fill="none" stroke-linecap="round">
          <path d="M777 354C767 393 761 416 730 438S670 459 631 469" stroke="#0b202d" stroke-width="7"/>
          <path d="M777 354C767 393 761 416 730 438S670 459 631 469" stroke="#a69667" stroke-width="1.8"/>
          <path d="M445 456C468 483 504 501 553 504S592 486 612 466" stroke="#0b202d" stroke-width="6"/>
          <path d="M445 456C468 483 504 501 553 504S592 486 612 466" stroke="#8da19b" stroke-width="1.3"/>
        </g>
        <g class="sg-mast">
          <ellipse cx="778" cy="356" rx="58" ry="27" fill="#0b202b" opacity=".3"/>
          <path d="M734 351l44-25 43 25-43 26Z" fill="#314a50" stroke="#b9a16f" stroke-width="1.5"/>
          <path d="M738 351L778 108 817 351M778 108V363" fill="none" stroke="#d0af76" stroke-width="6" stroke-linejoin="round"/>
          <path d="M741 332l70-35-61-27 53-29-46-27 38-27-32-25 22-22M811 332l-66-35 61-27-53-29 47-27-38-27 31-25-22-22" fill="none" stroke="#9b885c" stroke-width="2.5"/>
          <path d="M754 253h49m-43-53h34m-27-49h23" fill="none" stroke="#7f9b98" stroke-width="2"/>
          <path d="M778 107V68m-18 13h36m-31 12h26" stroke="#c9bb91" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <circle class="sg-source-light" cx="778" cy="68" r="4.5" fill="#a9dec7" filter="url(#${id('small-glow')})"/>
          <g transform="translate(808 147)"><path d="M-4 21V-1" stroke="#849d99" stroke-width="4"/><path d="M-19-19q21 26 43 2L3-43Z" fill="url(#${id('brass')})" stroke="#ddc38d" stroke-width="1.5"/><path d="M3-28L-18-46" stroke="#e0c594" stroke-width="2"/></g>
          <path d="M778 354V385" stroke="#b7b991" stroke-width="6"/><ellipse class="sg-source-pool" cx="778" cy="385" rx="18" ry="9" fill="#b5e5d1" opacity=".4"/>
        </g>
        <g class="sg-recorder">
          <ellipse cx="702" cy="483" rx="133" ry="45" fill="#081823" opacity=".25"/>
          <path d="M605 327L684 282 832 367 752 414Z" fill="#243b46" stroke="#8e9787" stroke-width="1.8"/>
          <path d="M605 327L752 414V513L605 427Z" fill="url(#${id('cabinet')})" stroke="#788b85" stroke-width="1.8"/>
          <path d="M752 414l80-47v101l-80 45Z" fill="#071722" stroke="#697b79" stroke-width="1.6"/>
          <path d="M767 433l49-28v7l-49 28Zm0 15 49-28v7l-49 28Zm0 15 49-28v7l-49 28Z" fill="#3b5055" opacity=".6"/>
          <path d="M658 303v-12l32-18 35 20v12" fill="none" stroke="#93886c" stroke-width="7" stroke-linejoin="round"/>
          <g transform="matrix(.83 .49 0 .84 615 337)">
            <rect x="-5" y="-5" width="164" height="99" rx="3" fill="#0b1821" stroke="#b4a67d" stroke-width="1.5"/>
            <rect width="154" height="88" rx="2" fill="#152b36"/>
            <g clip-path="url(#${id('screen')})">
              <path d="M98 4V73" stroke="#849b9c" stroke-opacity=".45" stroke-width=".8"/>
              <g clip-path="url(#${id('field')})" class="sg-wavefield-screen"></g>
              <g clip-path="url(#${id('traces')})" class="sg-seismic-traces"></g>
              <path class="sg-screen-scan" d="M5 0H147" stroke="#b6ecd5" stroke-opacity=".45" stroke-width=".8"/>
              <text x="7" y="82" class="sg-screen-label">ВОЛНОВОЕ ПОЛЕ</text><text x="106" y="82" class="sg-screen-label">ТРАССЫ</text>
            </g>
          </g>
          <path d="M618 425l124 73" stroke="#4a605f" stroke-width="1"/><g fill="#81978c"><circle cx="618" cy="337" r="2"/><circle cx="741" cy="411" r="2"/><circle cx="618" cy="420" r="2"/><circle cx="741" cy="494" r="2"/></g>
          <circle class="sg-record-light" cx="723" cy="480" r="3" fill="#cead71"/><path d="M623 440l33 19m-33-12 33 19" stroke="#748e8f" stroke-width="2"/>
        </g>
        <g class="sg-field-meter">
          <ellipse cx="431" cy="482" rx="44" ry="19" fill="#0b202b" opacity=".26"/>
          <path d="M436 415l-34 67m34-67 21 71m-21-71 4 64" stroke="#99a79c" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M406 376l36-21 30 17-35 22Z" fill="#566f70" stroke="#b6a576" stroke-width="1.3"/>
          <path d="M406 376l31 18v46l-31-18Z" fill="#243e49" stroke="#8b9c91" stroke-width="1.2"/>
          <path d="M437 394l35-22v47l-35 21Z" fill="#132d3a" stroke="#8b9c91" stroke-width="1.2"/>
          <g transform="matrix(1 .58 0 1 410 383)">
            <rect x="-1" y="-1" width="26" height="26" rx="1.5" fill="#09212b" stroke="#a0b4a6" stroke-width=".9"/>
            <g clip-path="url(#${id('meter-screen')})">
              <path d="M0 6H24M0 12H24M0 18H24M6 0V24M12 0V24M18 0V24" fill="none" stroke="#94c3b1" stroke-opacity=".26" stroke-width=".55"/>
              <path class="sg-meter-trace" fill="none" stroke="#b0f4c8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <circle class="sg-meter-sample" r="1.2" fill="#e5ffe6"/>
            </g>
          </g>
          <path d="M444 402l21-13m-21 21 21-13" stroke="#8e9f98" stroke-width="1.2"/><circle class="sg-meter-light" cx="419" cy="421" r="2.1" fill="#d9bd7f"/>
        </g>
        <g class="sg-engineer">
          <ellipse cx="532" cy="491" rx="48" ry="19" fill="#061a25" opacity=".45"/>
          <g class="sg-engineer-pose">
            <path d="M511 424l-5 59 18 6 12-61Z" fill="#2b4651" stroke="#72918c" stroke-width="1"/>
            <path d="M536 427l1 60 22 4-3-66Z" fill="#183541" stroke="#627f7c" stroke-width="1"/>
            <path d="M507 480l-13 10 4 9 26-2 4-11Z" fill="#172a32" stroke="#9b9f85" stroke-width="1.2"/>
            <path d="M538 483l-4 11 24 10 14-8-16-12Z" fill="#132730" stroke="#9b9f85" stroke-width="1.2"/>
            <path d="M512 338l24-11 26 17 5 79-30 15-31-16Z" fill="#c09151" stroke="#dcbe86" stroke-width="1.3"/>
            <path d="M536 330l26 14 5 79-30 15Z" fill="#927043"/>
            <path d="M516 343l4 65m33-67-4 70" stroke="#ded5af" stroke-width="7" opacity=".9"/>
            <path d="M509 401l56 8v12l-57-8Z" fill="#cfcca8"/>
            <path d="M509 418l27 9 31-9v9l-30 13-30-14Z" fill="#324952"/><path d="M531 427l10 2v8l-10-2Z" fill="#bca674"/>
            <path d="M525 326v-18l22-10 7 14-9 21-9 5Z" fill="#d8b48a"/>
            <path d="M514 295l22-13 24 15v24l-23 12-23-15Z" fill="#d9ba91" stroke="#977a5d" stroke-width=".8"/>
            <path d="M537 296l23 1v24l-23 12Z" fill="#bb936e"/>
            <path d="M549 305h9v7h-9m-18-8h13v8h-13m13-5h5" fill="#203944" stroke="#d8cead" stroke-width="1.3"/>
            <path d="M509 292q4-28 29-31 25 9 27 34l-27 14Z" fill="url(#${id('brass')})" stroke="#e2c48c" stroke-width="1.8"/>
            <path d="M508 292l30 15 30-17v7l-31 18-29-16Z" fill="#cfac6e" stroke="#ead09c" stroke-width="1"/>
            <path d="M537 264l-1 31" stroke="#e4ca93" stroke-width="4"/><path d="M520 288q3-15 12-19" fill="none" stroke="#efd7a0" stroke-opacity=".4" stroke-width="2"/>
            <path class="sg-read-arm" d="M514 350Q499 368 482 382L466 395" fill="none" stroke="#bd955c" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="sg-read-hand" d="M468 393l-8 2-5 9 7 4 11-9Z" fill="#d8b48a" stroke="#b28b64" stroke-width="1"/>
            <g class="sg-notebook"><path d="M524 394l31-10 27 18-32 13Z" fill="#d2c9a5" stroke="#8b8061" stroke-width="1.4"/><path d="M528 394l24 17m-19-17 24 14" fill="none" stroke="#6f8180" stroke-width=".7"/><path d="M545 391l20 13m-14-15 20 13" stroke="#607976" stroke-width=".8"/></g>
            <path class="sg-write-arm" d="M562 352Q587 365 585 386L563 400" fill="none" stroke="#987446" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
            <g class="sg-writing-hand"><path d="M567 393l-9 1-3 8 8 5 10-9Z" fill="#d8b48a" stroke="#b28b64" stroke-width=".8"/><path d="M559 400l10-17" stroke="#243c45" stroke-width="2.6" stroke-linecap="round"/><path d="M557 403l2-3" stroke="#eff0d0" stroke-width="1.4"/></g>
          </g>
        </g>
        <g class="sg-ground-details"><path d="M300 466l25-14 27 16-25 15Z" fill="#41575a" stroke="#a99b70"/><path d="M300 466v20l27 15v-18Zm27 17 25-15v20l-25 13Z" fill="#233e49" stroke="#7f8e7b"/><path d="M307 472l13 8v11l-13-8m14-15 13 7" fill="none" stroke="#a6976a" stroke-width="1.4"/></g>
      </g>
    </svg>`;
    const svg=target.querySelector('svg'),waves=svg.querySelector('.sg-underground-waves'),returns=svg.querySelector('.sg-return-waves');
    const waveNodes = Array.from({length: frontCount}, (_, i) => {
      const front = document.createElementNS(NS, 'path');
      front.classList.add('sg-wave');
      front.setAttribute('fill', 'none');
      front.setAttribute('stroke', i % 2 ? '#b6eee1' : '#f4d59e');
      front.setAttribute('stroke-width', i % 2 ? '2.1' : '2.8');
      waves.append(front);
      return front;
    });
    const returnNodes = Array.from({length: frontCount / 2}, () => {
      const front = document.createElementNS(NS, 'path');
      front.setAttribute('fill', 'none');
      front.setAttribute('stroke', '#c4ece3');
      front.setAttribute('stroke-width', '1.45');
      returns.append(front);
      return front;
    });
    const field=svg.querySelector('.sg-wavefield-screen');
    const bands=Array.from({length:9},(_,i)=>{const p=document.createElementNS(NS,'path');p.setAttribute('fill','none');p.setAttribute('stroke',i%2?'#d9ded8':'#08151f');p.setAttribute('stroke-width',i%2?'3.3':'5');field.append(p);return p;});
    const traceLayer=svg.querySelector('.sg-seismic-traces');
    const traces=Array.from({length:6},(_,i)=>{const p=document.createElementNS(NS,'path');p.setAttribute('fill','none');p.setAttribute('stroke',i%2?'#bacfc3':'#819b95');p.setAttribute('stroke-width','.8');traceLayer.append(p);return p;});
    const meterTrace = svg.querySelector('.sg-meter-trace');
    const meterSample = svg.querySelector('.sg-meter-sample');
    const meterLight = svg.querySelector('.sg-meter-light');
    const pref=matchMedia('(prefers-reduced-motion: reduce)');let moving=!pref.matches,phase=.18,last=0,frame=0,dead=false;
    function render(){
      waveNodes.forEach((front, index) => {
        const progress = (phase + index / frontCount) % 1;
        front.setAttribute('d', rockFront(progress * 1.3));
        front.setAttribute('opacity', String(.86 * Math.sin(Math.PI * progress)));
      });
      returnNodes.forEach((front, index) => {
        const progress = (phase + index / returnNodes.length) % 1;
        front.setAttribute('d', rockFront(progress * 1.3, true));
        front.setAttribute('opacity', String(.3 * Math.sin(Math.PI * progress)));
      });
      const meterPoints = [];
      for (let x = 0; x <= meterWidth; x += .5) {
        meterPoints.push(`${x === 0 ? 'M' : 'L'}${x} ${meterSignal(x, phase).toFixed(2)}`);
      }
      meterTrace.setAttribute('d', meterPoints.join(''));
      meterSample.setAttribute('cx', String(meterWidth - 2));
      meterSample.setAttribute('cy', meterSignal(meterWidth - 2, phase).toFixed(2));
      meterLight.setAttribute('opacity', String(.62 + .34 * Math.sin(10 * Math.PI * phase)));
      bands.forEach((p,i)=>{let d='';for(let x=-4;x<96;x+=2){const y=5+(i*11+phase*99)%99+Math.sqrt(20+(x-39)**2)*.19;d+=(x===-4?'M':'L')+x.toFixed(1)+' '+y.toFixed(1);}p.setAttribute('d',d);});
      traces.forEach((p,i)=>{let d='';for(let y=3;y<=76;y+=1.2){const u=(y-((phase*66+i*3)%66+6))/5;const v=(y-((phase*71+i*4+30)%71))/5;const amp=(1-2*u*u)*Math.exp(-u*u)*3.2+(1-2*v*v)*Math.exp(-v*v)*1.8;d+=(y===3?'M':'L')+(106+i*7+amp).toFixed(2)+' '+y.toFixed(2);}p.setAttribute('d',d);});
      const write=Math.sin(phase*Math.PI*24)*2.6*(.15+.85*Math.sin(phase*Math.PI)**2),read=Math.sin(phase*Math.PI*2)*3;
      svg.querySelector('.sg-writing-hand').setAttribute('transform',`translate(${write.toFixed(2)} ${(write*.35).toFixed(2)})`);
      svg.querySelector('.sg-write-arm').setAttribute('d',`M562 352Q587 365 585 386L${(563+write).toFixed(2)} ${(400+write*.35).toFixed(2)}`);
      svg.querySelector('.sg-read-arm').setAttribute('d',`M514 350Q499 ${368+read} 482 ${382+read}L466 ${395+read}`);
      svg.querySelector('.sg-read-hand').setAttribute('transform',`translate(0 ${read.toFixed(2)})`);
      svg.querySelector('.sg-engineer-pose').setAttribute('transform',`rotate(${(Math.sin(phase*Math.PI*2)*.65).toFixed(2)} 532 485)`);
      svg.querySelector('.sg-screen-scan').setAttribute('transform',`translate(0 ${(6+phase*65).toFixed(2)})`);
      svg.querySelector('.sg-source-pool').setAttribute('opacity',String(.2+.35*(.5+.5*Math.sin(phase*Math.PI*6))));
      svg.querySelector('.sg-source-light').setAttribute('opacity',String(.45+.5*(.5+.5*Math.sin(phase*Math.PI*6))));
      svg.querySelector('.sg-record-light').setAttribute('opacity',String(.45+.5*(.5+.5*Math.sin(phase*Math.PI*4))));
      target.dataset.phase=phase.toFixed(5);
    }
    function tick(now){if(dead)return;if(last&&moving&&!document.hidden)phase=(phase+Math.min(now-last,100)/cycleDuration)%1;last=now;if(moving&&!document.hidden)render();frame=requestAnimationFrame(tick);}
    function onVisibility(){last=0;}
    function onMotion(e){moving=!e.matches;last=0;render();}
    document.addEventListener('visibilitychange',onVisibility);pref.addEventListener('change',onMotion);
    render();frame=requestAnimationFrame(tick);
    return Object.freeze({setSelected(value){target.dataset.selected=String(Boolean(value));},destroy(){dead=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',onVisibility);pref.removeEventListener('change',onMotion);target.replaceChildren();}});
  }
  window.SignalogiCheckpoint=Object.freeze({mount});
})();
