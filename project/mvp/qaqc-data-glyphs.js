/* Schematic data tokens for the QAQC checkpoint. No measured project data. */
(() => {
  'use strict';

  const panel = '<path d="M-43-32H38l6 6v57H-43z" fill="#12242d" stroke="#8da3aa" stroke-opacity=".62"/><path d="M38-32v7h6M-39-27h13" fill="none" stroke="#d2aa6d" stroke-width="1.2"/><path d="M-41 34h87V-23" fill="none" stroke="#07151b" stroke-opacity=".65" stroke-width="3"/>';

  const logs = `<g class="qc-glyph qc-glyph-logs">${panel}
    <path d="M-34-18H35M-34-2H35M-34 14H35M-34 27H35M-34-18V27M-11-18V27M12-18V27M35-18V27" fill="none" stroke="#8da3aa" stroke-opacity=".23" stroke-width=".7"/>
    <path d="M-37-18h3m-3 8h3m-3 8h3m-3 8h3m-3 8h3m-3 8h3" stroke="#d2aa6d" stroke-width="1"/>
    <path d="M-28-18l6 4-8 4 12 3-4 4 5 3-11 3 4 4-5 3 9 4-2 4 5 3-10 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M0-18l-4 3 6 5-1 4 4 3-6 4 2 4-6 5 3 4-1 4 6 3-5 4" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M20-18l6 3-3 5 6 5-8 3 5 4-7 5 11 3-8 4 5 4-6 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M-33-23h13m11 0H3m12 0h15" stroke="#8da3aa" stroke-opacity=".6" stroke-width="1.3"/>
    <rect x="-33" y="1" width="67" height="7" fill="currentColor" opacity=".07"/>
  </g>`;

  const cloudPoints = [
    [-29,13,1.5],[-24,8,2],[-20,12,1.6],[-24,17,1.4],[-16,7,1.7],[-19,1,1.5],[-13,12,2.1],[-10,5,1.8],[-8,14,1.4],[-13,-1,1.3],
    [-2,-8,1.7],[3,-14,1.5],[7,-7,2.2],[11,-15,1.6],[15,-9,1.8],[10,-2,1.7],[18,-2,1.4],[4,0,1.5],[20,-15,1.3],
    [19,17,1.8],[23,10,1.5],[28,15,2],[30,7,1.4],[33,19,1.6],[25,24,1.4],[15,23,1.3],[5,18,1.3],[-31,-8,1.2],[29,-22,1.2]
  ].map(([x,y,r],i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" opacity="${i%4===0?'.5':'.95'}"/>`).join('');
  const points = `<g class="qc-glyph qc-glyph-points">${panel}
    <path d="M-33 21l25-14 37 21M-8 7v-28M-33 21v-7M29 28v-7M-8-21l-3 4m3-4 3 4M29 28l-6 1m6-1-3-5" fill="none" stroke="#8da3aa" stroke-opacity=".65" stroke-width="1"/>
    <path d="M-26 24l25-14 22 13M-19 28L6 14M-12 31l25-14M-31 17l27 15M-24 13l27 15M-17 9l27 15" fill="none" stroke="#8da3aa" stroke-opacity=".14" stroke-width=".6"/>
    <ellipse cx="-19" cy="9" rx="17" ry="12" fill="currentColor" opacity=".045"/>
    <ellipse cx="11" cy="-8" rx="16" ry="13" fill="currentColor" opacity=".045"/>
    <ellipse cx="25" cy="17" rx="15" ry="12" fill="currentColor" opacity=".045"/>
    ${cloudPoints}
  </g>`;

  // Fixed geological colours show layering; only the perimeter carries the QA/QC status.
  const wells = [[-22,-10],[0,-18],[24,-8]].map(([x,y]) => `<g class="qc-model-well" transform="translate(${x} ${y})">
    <ellipse cy="1" rx="4" ry="2" fill="#0b1d27"/>
    <path d="M0-22V1M-4-17H4M-5-12H5M-3-7H3" fill="none" stroke="#eed29a" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M2-21V0" stroke="#6b5439" stroke-width=".8"/>
    <circle cy="-22" r="2.3" fill="#c49c5b" stroke="#f4dca3" stroke-width=".8"/>
    <circle cx="-4" cy="-12" r="1.5" fill="#d8b778"/>
  </g>`).join('');
  const reservoir = `<g class="qc-glyph qc-glyph-reservoir">
    <path d="M-45 17L2 44 46 18 0-9Z" fill="#07151b" opacity=".65"/>
    <path d="M-43-9L-2-33 43-7 2 18Z" fill="#59736d" stroke="#8da3aa" stroke-width=".8"/>
    <path d="M-43-9Q-31-5-20 5T2 18V23Q-9 22-20 13T-43-4Z" fill="#c6a36a"/>
    <path d="M-43-4Q-31 0-20 10T2 23V29Q-9 27-20 19T-43 2Z" fill="#a96850"/>
    <path d="M-43 2Q-30 7-20 16T2 29V33Q-10 32-21 24T-43 7Z" fill="#657c82"/>
    <path d="M-43 7Q-30 12-20 21T2 33V38Q-9 37-20 29T-43 12Z" fill="#d0b77e"/>
    <path d="M-43 12Q-31 17-20 26T2 38V42L-43 15Z" fill="#47758a"/>
    <path d="M2 18Q14 15 24 5T43-7V-2Q33 5 24 14T2 23Z" fill="#a88a57"/>
    <path d="M2 23Q14 20 24 10T43-2V4Q33 9 24 20T2 29Z" fill="#8d5547"/>
    <path d="M2 29Q14 25 24 16T43 4V8Q33 14 24 24T2 33Z" fill="#4d666e"/>
    <path d="M2 33Q14 29 24 20T43 8V13Q33 19 24 29T2 38Z" fill="#ae985f"/>
    <path d="M2 38Q14 34 24 25T43 13V18L2 42Z" fill="#345869"/>
    <path d="M-35-13L2 9 34-10M-26-18L11 4 25-4M-17-23L20-1M-34-3L-1-23M-25 2L8-18M-16 7L17-13M-7 12L26-8" fill="none" stroke="#b4c4ae" stroke-opacity=".43" stroke-width=".65"/>
    <path d="M-22-9V21M0-17V34M24-7V27" fill="none" stroke="#f1dca5" stroke-width="1.2" stroke-dasharray="2 2" opacity=".8"/>
    ${wells}
    <path d="M-43-9L-2-33 43-7V18L2 42-43 15ZM-43-9L2 18 43-7M2 18V42" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-42 20V24l8 5M36 26l7-4v-5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".65"/>
  </g>`;

  const chart = `<g class="qc-glyph qc-glyph-chart">${panel}
    <path d="M-30-18V23H34M-30-6H34M-30 8H34M-15-18V23M1-18V23M17-18V23M33-18V23" fill="none" stroke="#8da3aa" stroke-opacity=".24" stroke-width=".7"/>
    <path d="M-30-18V23H34" fill="none" stroke="#8da3aa" stroke-opacity=".75" stroke-width="1.1"/>
    <path d="M-29 16l7-2 6 4 6-13 8 5 6-17 7 4 7-13 7 3 7-8" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-29 13l7 1 6-1 6-3 8-2 6-6 7-4 7-5 7-5 7-3" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.8" stroke-dasharray="2.5 3.5" stroke-linecap="round"/>
    <g fill="currentColor"><circle cx="-16" cy="18" r="2.3"/><circle cx="-2" cy="10" r="2.3"/><circle cx="11" cy="-3" r="2.3"/><circle cx="25" cy="-13" r="2.3"/></g>
    <path d="M-30-24h13m5 0h6M28 28h6" stroke="#d2aa6d" stroke-opacity=".8" stroke-width="1.1"/>
  </g>`;

  const production = `<g class="qc-glyph qc-glyph-production">${panel}
    <path d="M-31-19V24H35M-31-7H34M-31 7H34M-15-19V24M1-19V24M17-19V24M33-19V24" fill="none" stroke="#8da3aa" stroke-opacity=".2" stroke-width=".7"/>
    <path d="M-31-19V24H35" fill="none" stroke="#9aafb2" stroke-opacity=".8" stroke-width="1"/>
    <path d="M-30 23C-26 22-24 18-20 12S-12-5-7-11S1-13 8-13C13-13 15-9 19-4S24 8 34 16V24H-30Z" fill="currentColor" opacity=".1"/>
    <path d="M-30 23C-26 22-24 18-20 12S-12-5-7-11S1-13 8-13C13-13 15-9 19-4S24 8 34 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-7-13H8M-20 12L-11-4M20-1L29 12" fill="none" stroke="#d2aa6d" stroke-opacity=".65" stroke-width=".8"/>
    <g fill="currentColor"><circle cx="-20" cy="12" r="1.8"/><circle cx="-7" cy="-11" r="1.8"/><circle cx="8" cy="-13" r="1.8"/><circle cx="24" cy="7" r="1.8"/></g>
    <text x="-37" y="-19" fill="#bdc8c4" font-family="Georgia,serif" font-size="8" font-style="italic">q</text>
    <text x="35" y="32" fill="#bdc8c4" font-family="Georgia,serif" font-size="8" font-style="italic">t</text>
  </g>`;

  // Wiggle traces on two faces suggest inline/crossline sections; colours remain geophysical.
  const seismicTraces = Array.from({length:9},(_,i) => {
    const x=4+i*4.6;
    const y=i*.17;
    return `<path d="M${x} 2v3q-3 2 0 4t0 5q3 2 0 4t0 5q-2 2 0 4t0 5v4" transform="translate(0 ${y})" fill="none" stroke="#adc8ce" stroke-opacity=".66" stroke-width=".6"/>`;
  }).join('');
  const seismic = `<g class="qc-glyph qc-glyph-seismic">
    <path d="M-45 17L2 44 46 19 0-8Z" fill="#07151b" opacity=".65"/>
    <path d="M-43-12L-2-36 43-10 2 15Z" fill="#2b4e5b" stroke="#8da3aa" stroke-opacity=".55"/>
    <g transform="matrix(1 .6 0 .72 -43 -12)">
      <path d="M0 0H45V37H0Z" fill="#152b36"/>
      <path d="M0 5Q9 1 17 6T32 8T45 6V10Q34 15 24 11T9 8T0 10Z" fill="#c77668" opacity=".8"/>
      <path d="M0 14Q10 11 19 15T35 17T45 15V19Q35 23 24 20T9 16T0 19Z" fill="#6d9cac" opacity=".85"/>
      <path d="M0 26Q11 19 22 24T37 28T45 25V29Q35 34 26 29T11 27T0 31Z" fill="#bf8070" opacity=".8"/>
      ${seismicTraces}
    </g>
    <g transform="matrix(1 -.6 0 .72 2 15)">
      <path d="M0 0H41V37H0Z" fill="#102530"/>
      <path d="M0 6Q8 10 17 7T31 3T41 7V11Q32 7 23 11T9 13T0 10Z" fill="#b87267" opacity=".8"/>
      <path d="M0 15Q9 19 18 16T31 13T41 16V20Q32 16 23 20T9 23T0 19Z" fill="#598998" opacity=".9"/>
      <path d="M0 25Q9 29 18 27T31 21T41 24V29Q32 25 23 31T9 32T0 29Z" fill="#b57669" opacity=".85"/>
      ${seismicTraces}
    </g>
    <path d="M-36-16L1 6 34-14M-27-21L10 1 25-8M-18-26L19-4M-34-6L-1-26M-25-1L8-21M-16 4L17-16M-7 9L26-11" fill="none" stroke="#b0c9c4" stroke-opacity=".3" stroke-width=".7"/>
    <path d="M-43-12L-2-36 43-10V17L2 42-43 15ZM-43-12L2 15 43-10M2 15V42" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-42 20V24l8 5M36 26l7-4v-5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".65"/>
  </g>`;

  const glyphs = Object.freeze({logs,points,reservoir,chart,production,seismic});
  const aliases = Object.freeze({gis:'logs',pointcloud:'points',cloud:'points',dependencies:'points',model:'reservoir',plot:'chart',seismiccube:'seismic'});
  window.QaqcDataGlyphs = Object.freeze({
    kinds:Object.freeze(Object.keys(glyphs)),
    markup(kind) { return glyphs[aliases[kind] || kind] || glyphs.logs; }
  });
})();
