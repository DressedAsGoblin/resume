"""Package the map and its checkpoint scenes as one offline HTML."""
from pathlib import Path
import base64,json,re

root=Path(__file__).resolve().parent
html=(root/'index.html').read_text(encoding='utf8')
hero = base64.b64encode((root/'assets/pixel-hero.png').read_bytes()).decode('ascii')
html = html.replace('href="assets/pixel-hero.png"', 'href="data:image/png;base64,' + hero + '"')
data=(root/'projects-data.js').read_text(encoding='utf8')
depth=(root/'depth-data.js').read_text(encoding='utf8')

def inline_study(filename):
    study=(root/filename).read_text(encoding='utf8')
    study=re.sub(r'(<img\b[^>]*\bsrc)="(assets/[^"]+\.png)"',
                 lambda m: m[1]+'="data:image/png;base64,'+base64.b64encode((root/m[2]).read_bytes()).decode('ascii')+'"',
                 study)
    study=re.sub(r'<link rel="stylesheet" href="([^"]+)">',
                 lambda m: '<style>\n'+(root/m[1]).read_text(encoding='utf8')+'\n</style>', study)
    return re.sub(r'<script src="([^"]+)"></script>',
                  lambda m: '<script>\n'+(root/m[1]).read_text(encoding='utf8')+'\n</script>', study)

pages=json.loads(re.search(r'window\.CHECKPOINT_PAGES = (\{.*?\});', data, re.S)[1])
stations=re.findall(r'id="object-([^"]+)"',html)
assert len(stations)==len(pages) and set(stations)==set(pages), 'Map stations must match the embedded checkpoints'
studies={project: inline_study(filename) for project,filename in pages.items()}
data+='\nwindow.CHECKPOINT_STUDIES = '+json.dumps(studies,ensure_ascii=False).replace('<',r'\u003c')+';'

def image(match):
    path=root/match[1]
    mime='image/png' if path.suffix.lower()=='.png' else 'image/jpeg'
    return '"src": "data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')+'"'

depth=re.sub(r"src:\s*'(assets/[^']+)'",lambda m:'src: '+image(m).split(': ',1)[1],depth)
map_images=depth.count('data:image/png;base64,')
assert map_images==3
for name in ('world.css','case-panel.css','skills-graph.css'):
    css=(root/name).read_text(encoding='utf8')
    pattern=rf'<link rel="stylesheet" href="{re.escape(name)}(?:\?[^"]*)?">'
    html,count=re.subn(pattern,lambda _: '<style>\n'+css+'\n</style>',html)
    assert count==1,name
for name,script in [('projects-data.js',data),('depth-data.js',depth),
                    ('case-panel.js',(root/'case-panel.js').read_text(encoding='utf8')),
                    ('skills-graph.js',(root/'skills-graph.js').read_text(encoding='utf8')),
                    ('world.js',(root/'world.js').read_text(encoding='utf8'))]:
    pattern=rf'<script src="{re.escape(name)}(?:\?[^"]*)?"></script>'
    html,count=re.subn(pattern,lambda _: '<script>\n'+script.replace('</script','<\\/script')+'\n</script>',html)
    assert count==1,name
out=root.parent/'Мир проектов — MVP.html'
assert not re.search(r'<script\s+src=|<link\s+rel="stylesheet"',html)
assert html.count('<script>')==5
out.write_text(html,encoding='utf8')
print(f'{out}\n{out.stat().st_size:,} bytes; {map_images} map images; {len(studies)} checkpoint scenes')
