"""Build the editable SVG world. Each project has its own geometry."""
from pathlib import Path
root=Path(__file__).resolve().parent
defs='''
<linearGradient id="ground-top" x2="1" y2="1"><stop stop-color="#48585d"/><stop offset=".5" stop-color="#34454c"/><stop offset="1" stop-color="#273941"/></linearGradient>
<linearGradient id="metal"><stop stop-color="#22343e"/><stop offset=".25" stop-color="#657879"/><stop offset=".52" stop-color="#344950"/><stop offset="1" stop-color="#162d37"/></linearGradient>
<linearGradient id="brass"><stop stop-color="#6e5032"/><stop offset=".26" stop-color="#bb9559"/><stop offset=".5" stop-color="#dfc28c"/><stop offset=".75" stop-color="#9d763f"/><stop offset="1" stop-color="#69482f"/></linearGradient>
<linearGradient id="roof" x2=".8" y2="1"><stop stop-color="#74908c"/><stop offset=".5" stop-color="#3c5d66"/><stop offset="1" stop-color="#193540"/></linearGradient>
<radialGradient id="warm-aura"><stop stop-color="#efb65b" stop-opacity=".28"/><stop offset=".5" stop-color="#c59c56" stop-opacity=".11"/><stop offset="1" stop-color="#c59c56" stop-opacity="0"/></radialGradient>
<radialGradient id="core-fire"><stop stop-color="#fff3c4"/><stop offset=".4" stop-color="#edc372"/><stop offset="1" stop-color="#bb733a"/></radialGradient>
<linearGradient id="beacon-gradient" x2="0" y2="1"><stop stop-color="#efd499" stop-opacity="0"/><stop offset="1" stop-color="#efd499" stop-opacity=".25"/></linearGradient>
<filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="ground-shadow" x="-40%" y="-50%" width="200%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="structure-shadow" x="-40%" y="-40%" width="200%" height="220%"><feDropShadow dx="10" dy="14" stdDeviation="5" flood-color="#071018" flood-opacity=".5"/></filter>
<pattern id="paving" width="70" height="40" patternUnits="userSpaceOnUse"><path d="M0 0L70 40M70 0L0 40" fill="none" stroke="#9ba8a2" stroke-width=".65" opacity=".09"/></pattern>
<symbol id="crate" viewBox="0 0 60 55"><path d="M3 18L31 2l26 16-28 16z" fill="#758076" stroke="#24383e"/><path d="M3 18v20l26 15V34z" fill="#536862" stroke="#24383e"/><path d="M29 34l28-16v20L29 53z" fill="#314d51" stroke="#24383e"/><path d="M10 24l14 8v14l-14-8zm26 11l14-8v10l-14 8z" fill="none" stroke="#a99669" stroke-width="1.6"/></symbol>
<symbol id="lamp" viewBox="0 0 36 92"><ellipse cx="18" cy="83" rx="17" ry="8" fill="#102731" opacity=".7"/><path d="M18 83V21M13 18l5-6 6 6v13H13z" stroke="#ae925f" stroke-width="3" fill="#d4b36c"/><path d="M6 21h24l-6-9H13z" fill="#66766f"/><circle cx="18" cy="24" r="6" fill="#f3d28d" opacity=".5"/></symbol>
'''
ground = '''
<g aria-hidden="true">
<path d="M30 132 121 66H1799L1890 132V848L1815 887H105L30 848Z" fill="#101d27" stroke="#557078" stroke-width="2" transform="translate(0 12)"/>
<path d="M30 132 121 66H1799L1890 132V848L1815 887H105L30 848Z" fill="url(#ground-top)" stroke="#78928e" stroke-width="2"/>
<path d="M30 132 121 66H1799L1890 132V848L1815 887H105L30 848Z" fill="url(#paving)"/>
<path d="M46 139 126 80H1794L1874 139V839L1811 872H109L46 839Z" fill="none" stroke="#81998a" stroke-opacity=".4"/>
</g>
'''



def label(x, y, title, caption, half_width):
    caption_lines = ''.join(
        f'<text x="0" y="{11 + 14*i}" class="node-caption">{line}</text>'
        for i, line in enumerate(caption)
    )
    return (
        f'<g class="node-label" transform="translate({x} {y})" text-anchor="middle">'
        f'<rect class="nameplate" x="{-half_width}" y="-28" width="{2*half_width}" height="61" rx="5"/>'
        f'<text x="0" y="-7" class="node-name">{title}</text>{caption_lines}</g>'
    )


def node(project, x, y, art, plate, scale=1):
    return (
        f'<g id="object-{project}" class="project-object locked" data-project="{project}" role="button" tabindex="0">'
        f'<ellipse class="object-aura" cx="{x}" cy="{y}" rx="164" ry="88" fill="url(#warm-aura)"/>'
        f'<ellipse class="achievement-ring" cx="{x}" cy="{y}" rx="139" ry="76"/>'
        f'<g class="object-art"><g transform="translate({x} {y}) scale({scale})" filter="url(#structure-shadow)">{art}</g></g>{plate}</g>'
    )


# All stations share the same projection and floor plane.
def iso(point):
    x, y, z = point
    return x-y, .56*(x+y)-z


def polygon(points, fill, edge='#819491', width=1.3):
    coords = ' '.join(f'{x:.2f},{y:.2f}' for x, y in map(iso, points))
    return f'<polygon points="{coords}" fill="{fill}" stroke="{edge}" stroke-width="{width}" stroke-linejoin="round"/>'


def rail(points, color='#bba77b', width=2, css_class=None):
    coords = ' '.join(f'{x:.2f},{y:.2f}' for x, y in map(iso, points))
    class_attr = f' class="{css_class}"' if css_class else ''
    return f'<polyline{class_attr} points="{coords}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'


def block(x, y, z, w, d, h, top='#748d85', left='#45606a', right='#2d4955', edge='#82938a'):
    a, b, c, e = [(x,y,z+h), (x+w,y,z+h), (x+w,y+d,z+h), (x,y+d,z+h)]
    f, g, j = [(x+w,y,z), (x+w,y+d,z), (x,y+d,z)]
    return (
        polygon([e,c,g,j], left, edge)
        + polygon([b,c,g,f], right, edge)
        + polygon([a,b,c,e], top, edge)
    )


def deck(size):
    return (
        block(-size,-size,-13,2*size,2*size,13,'#536f74','#344f5a','#253e49')
        + block(-size+6,-size+6,0,2*size-12,2*size-12,4,'#304a53','#354f57','#233d46','#5e7a7c')
    )


def face_y(x, y, z, w, h, color, edge='#9cad9d'):
    return polygon([(x,y,z),(x+w,y,z),(x+w,y,z+h),(x,y,z+h)], color, edge)


def face_x(x, y, z, d, h, color, edge='#9cad9d'):
    return polygon([(x,y,z),(x,y+d,z),(x,y+d,z+h),(x,y,z+h)], color, edge)


def light(x, y, z, radius, color, css_class=None):
    sx, sy = iso((x,y,z))
    class_attr = f' class="{css_class}"' if css_class else ''
    return f'<circle{class_attr} cx="{sx:.2f}" cy="{sy:.2f}" r="{radius}" fill="{color}"/>'


qa = deck(65)
qa += block(-40,-37,4,78,77,18,'#677b77','#354e58','#263f4a')
for index, z in enumerate((22,51,80)):
    cx, cy = iso((-1, 0, z + 13))
    qa += f'<g class="qa-tier" style="transform-origin:{cx:.2f}px {cy:.2f}px;--phase:{index * -.8}s;--turn:{-1 if index % 2 else 1}">'
    qa += block(-31,-28,z,59,57,25,'#759592','#476a75','#304e5b')
    qa += face_y(-23,29.2,z+6,42,12,'#1a3440','#6e9b9a')
    qa += rail([(-17,29.4,z+12),(-8,29.4,z+9),(-1,29.4,z+15),(9,29.4,z+11)],'#acdcd0',1.7)
    qa += light(16,29.5,z+13,2.3,'#cbe7b4','preview-indicator')
    qa += face_x(28.1,-18,z+8,21,8,'#285260','#608b8a')
    qa += '</g>'
qa += block(-37,-34,105,71,69,6,'#8f9b83','#617573','#3b5d60')
qa += block(-19,-15,111,36,32,8,'#b69b65','#8a784e','#594d37','#b9ab79')
qa += polygon([(-14,-10,120),(12,-10,120),(12,11,120),(-14,11,120)],'#2e625d','#b0c0a3')
qa += rail([(-8,1,121),(-1,7,121),(8,-5,121)],'#d5edc1',2.7)
qa += rail([(42,-24,12),(42,-24,86),(28,-24,86)],'#bba070',5)
qa += rail([(42,-24,12),(42,19,12),(28,19,12)],'#9b845a',4)
qa += rail([(28,19,12),(42,19,12),(42,-24,12),(42,-24,86),(28,-24,86)],'#dff5b9',2.5,'preview-flow')

signals = deck(65)
signals += block(-43,-33,4,78,61,54,'#648080','#446572','#2f515e')
signals += block(-47,-37,58,86,69,7,'#819993','#637b7b','#3e646a')
signals += face_y(-34,28.3,16,62,33,'#193944','#8aa9a2')
screen_clip = polygon(
    [(-32,28.6,18),(26,28.6,18),(26,28.6,47),(-32,28.6,47)], '#fff', 'none'
)
signals += f'<clipPath id="signal-screen-clip">{screen_clip}</clipPath>'
signals += '<g clip-path="url(#signal-screen-clip)">'
for i, (color, samples) in enumerate((
    ('#bdecd0', [4, 7, 6, 16, 7, 3, 5, 12, 9, 6]),
    ('#f1ce8c', [6, 9, 4, 5, 8, 13, 16, 6, 3, 4]),
)):
    signals += rail(
        [(-32+j*4.3,28.6,20+i*13+samples[j % len(samples)]*.62) for j in range(25)],
        color, 2, 'signal-wave',
    )
signals += '</g>'
signals += face_x(35.2,-23,15,39,30,'#203d4a','#7d9695')
for y in (-15,-4,7):
    signals += rail([(35.5,y,22),(35.5,y,37)],'#88aaa1',2)
signals += block(6,-21,65,20,17,8,'#a89364','#776846','#62583e')
signals += rail([(16,-13,73),(16,-13,125)],'#b5a176',3)
antenna_x, antenna_y = iso((16,-13,114))
signals += (
    f'<g transform="translate({antenna_x:.2f} {antenna_y:.2f})">'
    '<g class="signal-antenna-rotor">'
    '<path d="M-25 -14L23 13M-19 -11v-7M17 10v-7" fill="none" '
    'stroke="#e2c793" stroke-width="3" stroke-linecap="round"/>'
    '</g></g>'
)
signals += light(16,-13,125,3,'#e9d39a','preview-indicator')
signals += block(14,34,4,43,26,12,'#6e8580','#365963','#234a57')
px, py = iso((17,37,16.6))
signals += (
    f'<g transform="matrix(1 .56 -1 .56 {px} {py})"><rect width="37" height="20" fill="#172c35"/>'
    '<image id="slice-map-image" x="0" y="0" width="37" height="20" preserveAspectRatio="none"/></g>'
    '<text id="slice-map-label" x="42" y="41" class="slice-console-text" text-anchor="middle"></text>'
)

xeek = deck(64)
xeek += block(-53,15,4,40,36,34,'#7a9086','#496874','#2c5060')
xeek += face_y(-47,51.2,15,28,14,'#1f3f4b','#a2b29f')
xeek += rail([(-44,51.4,22),(-37,51.4,19),(-31,51.4,25),(-23,51.4,22)],'#b5d8bc',1.5)
xeek += block(-16,-41,4,59,59,10,'#7d8d7c','#48676e','#2e4951')
corners = [(-1,-1),(1,-1),(1,1),(-1,1)]
levels = [
    [(13+a*r,-12+b*r,z) for a,b in corners]
    for r,z in ((25,14),(19,44),(13,76),(8,108),(5,131))
]
for i, layer in enumerate(levels):
    xeek += rail(layer+[layer[0]],'#c1ab7d',2)
    if i == 0:
        continue
    lower = levels[i-1]
    for j in (1,2,3):
        xeek += rail([lower[j],layer[j]],'#d0b784',3)
    for a,b in ((1,2),(2,3)):
        xeek += rail([lower[a],layer[b]],'#a79068',1.9)
        xeek += rail([lower[b],layer[a]],'#a79068',1.9)
xeek += block(7,-18,131,12,12,6,'#bf9d65','#90744b','#6a563c')
xeek += rail([(13,-12,137),(13,-12,152)],'#c5ae7e',2)
xeek += light(13,-12,153,3,'#f2d393','preview-indicator')
tower_x, tower_y = iso((13,-12,153))
xeek += f'<g transform="translate({tower_x:.2f} {tower_y:.2f})">'
for index in range(3):
    xeek += f'<path class="radio-wave" style="--phase:{index * -.72}s" d="M-10-7Q-17 0-10 7M10-7Q17 0 10 7"/>'
xeek += '</g>'

electro = deck(61)
electro += block(-39,-43,4,70,33,62,'#71928d','#4e6d77','#2e515d')
electro += face_y(-32,-9.8,17,56,40,'#183842','#8da9a0')
electro += '<g class="electro-bars">'
for i, (h, color) in enumerate(((13,'#7db9ac'),(29,'#ddb475'),(20,'#94bcd1'))):
    _, base_y = iso((-22+15*i,-9.5,22))
    electro += f'<g class="electro-bar" style="transform-origin:0 {base_y:.2f}px;--phase:{-.53*i}s">'
    electro += face_y(-26+15*i,-9.5,22,8,h,color,'none') + '</g>'
electro += '</g>'
electro += block(-41,5,4,67,37,7,'#766f5b','#54656a','#384f59')
electro += block(-32,10,11,50,28,5,'#273e48','#354d58','#2d4751','#92a49c')
electro += rail([(-29,14,17),(-24,14,32),(-12,14,29),(-5,14,41),(4,14,25),(13,14,33)],'#c9dda9',2,'electro-trace')
electro += rail([(-29,29,17),(-23,29,23),(-14,29,21),(-6,29,32),(2,29,20),(12,29,27)],'#dbb47d',2,'electro-trace')

facies = deck(61)
facies += block(-39,-39,4,78,78,8,'#68847b','#486b6e','#2b4e58')
for x,y in ((-35,-34),(35,-34),(-35,34),(35,34)):
    facies += rail([(x,y,11),(x,y,66)],'#9db3a2',3)
for index, (z, shift) in enumerate(((20,4),(39,-8),(58,6))):
    facies += f'<g class="facies-layer" style="--lift:{-5 - 10 * index}px">'
    facies += block(-40,-40,z,80,80,5,'#4d8277','#315c60','#254953','#9ab4a4')
    facies += polygon(
        [(-40,-13+shift,z+5.2),(-18,-11+shift,z+5.2),(-4,2+shift,z+5.2),
         (20,7+shift,z+5.2),(40,-1+shift,z+5.2),(40,13+shift,z+5.2),
         (20,20+shift,z+5.2),(-7,15+shift,z+5.2),(-24,1+shift,z+5.2),
         (-40,2+shift,z+5.2)],
        '#cb9e61','none')
    for x,y in ((-23,-7),(8,10),(27,-14)):
        facies += light(x,y,z+6,2.5,'#e8dcc0','preview-indicator')

    facies += '</g>'

history = deck(61)
history += block(-47,-22,4,94,44,8,'#536f72','#365662','#294651')
for x in (-45,-31,-17,-3,11,25,39):
    history += rail([(x,-20,12.5),(x,20,12.5)],'#779899',1.4)
history += rail([(-47,0,12.7),(47,0,12.7)],'#bfe3ad',2,'preview-flow')
# Draw the moving loads before the classification gate so they pass beneath it.
dx, dy = iso((94,0,0))
for index in range(3):
    history += f'<g class="conveyor-load" style="--dx:{dx:.2f}px;--dy:{dy:.2f}px;--phase:{index * -1.4}s">'
    history += block(-54,-9,13,15,17,11,'#83b39a','#477477','#2d5661')
    history += rail([(-47,-9,24.2),(-47,8,24.2)],'#b7c8ae') + '</g>'
history += block(-13,-25,12,20,8,56,'#8f946e','#72664e','#454a46')
history += block(-13,17,12,20,8,56,'#a89c73','#806e51','#50534a')
history += block(-13,-25,68,20,50,10,'#b2a27a','#827458','#5b5747')
history += light(-2,25.3,57,3.4,'#bfe3ad','preview-indicator')

exoil = deck(57)
for origin, colors in ((-44, ('#76a794','#d3a66a','#547783')),
                       (4, ('#50838b','#93b39a','#caac70'))):
    exoil += block(origin,-27,4,39,54,26,'#6e8280','#455e61','#294952')
    for row in range(3):
        for col in range(3):
            x, y = origin + 4 + col * 10, -22 + row * 15
            exoil += f'<g class="map-cell" style="--phase:{-(row*3+col)*.23 - origin*.018:.2f}s">'
            exoil += polygon([(x,y,31),(x+9,y,31),(x+9,y+14,31),(x,y+14,31)],
                             colors[(col+row*2+origin)%3], '#27434b', .65) + '</g>'
exoil += light(-20,34,12,2.5,'#e7c27e','preview-indicator')
exoil += rail([(-23,31,8),(-23,39,8),(23,39,8),(23,31,8)],'#cfab72',3)

ensemble = deck(58)
for x, y, h, color in ((-39,-31,48,'#6c9b90'),(1,-31,31,'#839aaa'),
                       (-39,9,24,'#b3966b'),(1,9,40,'#89a47f')):
    _, base_y = iso((x+15,y+15,4))
    ensemble += f'<g class="ensemble-column" style="transform-origin:0 {base_y:.2f}px;--phase:{-h*.11}s">'
    ensemble += block(x,y,4,30,29,h,color,'#4e6970','#31515b')
    ensemble += light(x+15,y+15,h+5,2.4,'#edd18f','preview-indicator')
    for z in range(14, 4+h, 9):
        ensemble += rail([(x,y+29.3,z),(x+30,y+29.3,z),(x+30.3,y,z)],'#a9b39c',1.25)

    ensemble += '</g>'

frac = deck(57)
for index, (x, y) in enumerate(((-43,-26),(-43,16))):
    frac += f'<g class="frac-truck" style="--phase:{-.13*index}s">'
    frac += block(x,y,4,60,21,12,'#7d887a','#415d61','#2d4a51')
    frac += block(x+5,y+2,16,32,17,16,'#a09372','#75674e','#514d43')
    frac += block(x+41,y+1,16,16,19,22,'#a58a59','#756343','#544839')
    frac += face_y(x+43,y+20.2,28,10,6,'#9dbfba')
    for wheel in (9,25,50):
        frac += light(x+wheel,y+21.7,8,4.2,'#142b35')
    frac += rail([(x+7,y+3,25),(x+7,y+3,35)],'#9a8a72',2)
    frac += '</g>'
    sx, sy = iso((x+7,y+3,35))
    for plume in range(2):
        frac += f'<circle class="exhaust-puff" cx="{sx:.2f}" cy="{sy:.2f}" r="3" style="--phase:{-.7*plume-.3*index}s"/>'
    injection = [(x+18,y+20,14),(x+18,y+24,8),(27,y+24,8),(38,2,8),(38,2,-8)]
    frac += rail(injection,'#647b7b',4) + rail(injection,'#f0c776',2,'preview-flow')
frac += block(30,-7,4,15,19,32,'#a48a63','#75684b','#525345')
frac += rail([(38,2,36),(38,2,46),(28,2,46)],'#d3b384',3)
frac += light(28,2,46,3,'#eed297','preview-indicator')

mentoring = deck(57)
mentoring += block(-43,-31,4,81,65,12,'#648280','#465f62','#2c4a55')
mentoring += block(-36,-24,16,67,44,25,'#7d7660','#625747','#493e37')
mentoring += block(-40,-27,41,75,50,7,'#a28c67','#826d50','#5c5244')
for x, y, z, color in ((-30,-19,48,'#7b9d98'),(-5,0,48,'#ac8e57'),(12,-21,48,'#7892a5')):
    mentoring += block(x,y,z,20,13,4,color,'#c7b58b','#574f43')
mentoring += polygon([(-17,6,49),(11,6,49),(11,24,49),(-17,24,49)], '#d4c5a2', '#947b55')
writing = [(-12,10,49.3),(-4,10,49.3),(4,10,49.3),(4,15,49.3),
           (-11,15,49.3),(-11,20,49.3),(2,20,49.3)]
mentoring += rail(writing,'#334c58',1.6,'writing-trace')
mentoring += rail([(-14,12,48),(-14,12,79),(-3,12,86)],'#cdb582',3)
mentoring += light(-1,12,84,5,'#efd092','preview-indicator')

pump = deck(57)
pump += block(-32,-32,4,55,62,22,'#57777c','#385b66','#294956')
pump += face_y(-24,30.3,7,39,14,'#856f4e','#ad9f7c')
pump_line = [(28,1,81),(-3,1,81),(-3,1,46),(-3,30.8,31),(-3,30.8,7)]
pump += rail(pump_line[2:],'#548783',3)
pump += block(-14,-11,26,23,24,22,'#7e9f94','#516e6a','#3b565c')
pump += block(-10,-7,48,15,16,27,'#a09b78','#7e7358','#5b5e4d')
pump += rail([(-3,1,75),(-3,1,81),(28,1,81)],'#c3a976',3.4)
pump += block(19,15,4,22,25,20,'#7d8a77','#526e6e','#355664')
pump += face_y(23,40.3,12,13,8,'#83b4a7','#a7c2b2')
pump += rail(pump_line,'#9dd6c9',2.7,'preview-flow')
pump += rail([(25,40.6,15),(27,40.6,14),(30,40.6,18),(33,40.6,14)],'#def6d2',1.25,'electro-trace')

# Place stations on the open field. Coordinates are stable between visits.
stations = [
    ('qaqc', 962, 223, qa, 'QA/QC', ('Проверка качества','и согласованности геоданных'), 132, .82),
    ('signalogi', 226, 229, signals, 'СИГНАЛОГИ', ('Сопоставление геологических','сигналов по форме'), 137, .82),
    ('xeek', 733, 442, xeek, 'XEEK', ('Открытый международный','хакатон'), 124, .81),
    ('electrofacies', 198, 675, electro, 'Электрофации', ('Классификация интервалов ГИС','по методике В. С. Муромцева'), 138, .81),
    ('facies', 1292, 248, facies, 'Фациальные карты', ('Комплексирование','разномасштабных данных'), 132, .83),
    ('history', 1297, 697, history, 'Ускорение history matching', ('Отбор кандидатов','для адаптации'), 148, .82),
    ('exoil', 560, 704, exoil, 'ExOil', ('Фациальная модель','и карта проницаемости'), 126, .87),
    ('ensemble', 338, 449, ensemble, 'Кластеризация ансамблей ГДМ', ('Отбор кандидатов','для локальной адаптации ГДМ'), 150, .87),
    ('frac-rate', 1135, 481, frac, 'Прогноз дебита после ГРП', ('Оценка стартового','дебита нефти'), 140, .87),
    ('mentoring', 934, 666, mentoring, 'Научное наставничество', ('Индивидуальные студенческие проекты', 'для слушателей Heriot-Watt'), 134, .87),
    ('pump-risk', 567, 204, pump, 'Оценка остаточного ресурса', ('Построение эмпирической функции','безотказной работы насоса'), 132, .87),
]

nodes = ''.join(node(project, x, y, art, label(x, y+89, title, caption, half), scale)
                for project,x,y,art,title,caption,half,scale in stations)
pedestals = ''.join(
    f'<g id="pedestal-{project}" class="pedestal" data-travel="{project}" transform="translate({x+108} {y+18})" aria-hidden="true"><ellipse class="pedestal-beacon" cy="-20" rx="34" ry="55"/><path d="M-28 0v13l28 16 28-16V0" fill="#233a40" stroke="#8b886c"/><path class="pedestal-surface" d="M-28 0L0-16 28 0 0 16z"/><path class="pedestal-light" d="M-25 7L0 21 25 7v4L0 25-25 11z"/></g>'
    for project,x,y,*_ in stations
)
hero='''
<g id="hero" class="hero" transform="translate(745 647)" aria-hidden="true"><ellipse class="hero-shadow" cy="7" rx="21" ry="9" fill="#071720" opacity=".65"/><ellipse class="hero-compass" cy="7" rx="22" ry="12"/><g id="hero-pose"><image href="assets/pixel-hero.png" x="-27" y="-89" width="60" height="90"/></g><rect class="hero-hit" x="-28" y="-75" width="56" height="98" rx="12"/></g>
'''
pouch='''<svg class="pouch" viewBox="0 0 100 115" aria-hidden="true"><defs><linearGradient id="bag-leather" x2="1" y2="1"><stop stop-color="#b79055"/><stop offset=".45" stop-color="#805734"/><stop offset="1" stop-color="#3f2b20"/></linearGradient></defs><ellipse cx="50" cy="104" rx="36" ry="8" fill="#000" opacity=".35"/><g id="pouch-belly"><path d="M32 36C22 47 13 64 17 84c3 23 63 25 66 0 4-21-7-38-17-48z" fill="url(#bag-leather)" stroke="#d1aa6a" stroke-width="1.4"/><path d="M27 51q-11 34 5 44M72 50q13 32-3 45" fill="none" stroke="#c0a16a" stroke-dasharray="2 4"/><path id="pouch-fill" d="M23 77q27-12 54 0v9c-4 16-51 15-54 0z" fill="#efc56e" opacity="0"/><path d="M36 52q3 18-2 30M62 51q-3 19 4 30" stroke="#513824" stroke-width="1.4" fill="none"/></g><path d="M32 35l-8-19 13 6 10-10 10 10 16-6-8 20" fill="#936b3b" stroke="#caab6e" stroke-width="1.3"/><path d="M30 34q20 8 38 0v9q-20 8-38 0z" fill="#69532e" stroke="#d5bb79" stroke-width="2"/><path d="M47 39l-14 14m14-14l17 12" stroke="#d5bd7c" stroke-width="2.5" fill="none"/><circle cx="51" cy="77" r="16" fill="#cfb072" stroke="#efd29b" stroke-width="1.5"/><circle cx="51" cy="77" r="12.5" fill="none" stroke="#997641"/><text class="pouch-counter" id="bag-count" x="51" y="82" text-anchor="middle">0</text></svg>'''

html='''<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>Портфолио проектов — карта опыта</title><link rel="stylesheet" href="world.css?v=9"><link rel="stylesheet" href="case-panel.css?v=7"><link rel="stylesheet" href="skills-graph.css"></head><body><main class="world-shell" id="world-shell">
<div class="starfield" aria-hidden="true"></div>
<div class="world-heading"><h1>Портфолио выполненных проектов</h1>
<section id="contact-card" class="contact-card" aria-label="Контакты Максима Мельникова" hidden>
  <a href="mailto:melnikovmo@yandex.ru">melnikovmo@yandex.ru</a>
  <a href="tel:+79191522518">+7 919 152 25 18</a>
</section>
</div>
<div class="map-stage" id="map-stage" tabindex="0" aria-label="Карта проектов. Выберите объект, чтобы открыть проект.">
<svg id="world" viewBox="0 0 1520 900" xmlns="http://www.w3.org/2000/svg" aria-labelledby="world-title world-desc"><title id="world-title">Карта проектов</title><desc id="world-desc">Прибытие героя раскрывает карточку проекта и пополняет сумку компетенций.</desc><defs>'''+defs+'</defs>'+ground+nodes+pedestals+hero+'''
<g class="portfolio-axis" role="img" aria-label="Временная шкала. Этапы 1–8 с 2020 по 2024 год. Этапы 9–11 с 2024 по 2026 год.">
  <path class="portfolio-axis-early" d="M30 943H1270"/>
  <path class="portfolio-axis-late" d="M1270 943H1890"/>
  <path class="portfolio-axis-ticks" d="M30 933v20 M340 939v8 M650 939v8 M960 939v8 M1270 933v20 M1580 939v8 M1890 933v20"/>
  <text class="portfolio-axis-range" x="650" y="925">Этапы 1–8</text>
  <text class="portfolio-axis-range" x="1580" y="925">Этапы 9–11</text>
  <text x="30" y="980" text-anchor="start">2020</text>
  <text x="1270" y="980" text-anchor="middle">2024</text>
  <text x="1890" y="980" text-anchor="end">2026</text>
</g></svg></div>
<div id="timeline-role-legend" aria-label="Условные обозначения ролей"></div><nav class="timeline-controls" aria-label="Навигация по хронологии"><button id="timeline-prev" type="button" disabled>← Предыдущий этап</button><button id="timeline-next" type="button">Следующий этап →</button></nav>
<div class="map-whisper" id="map-whisper">Выберите проект на карте</div>
<button class="bag-toggle" id="bag-toggle" aria-expanded="false" aria-controls="bag-panel"><span class="bag-copy"><strong>СУМКА КОМПЕТЕНЦИЙ</strong><small id="bag-status">Путь начинается с первого проекта</small></span>'''+pouch+'''</button>
<dialog id="bag-panel" class="competency-dialog" aria-labelledby="bag-title">
  <header class="competency-header">
    <h2 id="bag-title">Карта компетенций</h2>
    <button id="close-bag" class="close-button" type="button" aria-label="Закрыть карту компетенций">×</button>
  </header>
  <p class="competency-guide">Размер узла показывает, в скольких проектах применялась компетенция.</p>
  <div id="skills-list"></div>
</dialog>

</main><script src="projects-data.js?v=9"></script><script src="depth-data.js"></script><script src="case-panel.js?v=8"></script><script src="skills-graph.js"></script><script src="world.js?v=8"></script></body></html>'''
(root/'index.html').write_text(html,encoding='utf8')
print(f"Built index.html with {len(stations)} project checkpoints")

