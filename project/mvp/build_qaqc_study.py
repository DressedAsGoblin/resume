"""Build one offline file for the QAQC checkpoint review, leaving the portfolio map unchanged."""
from pathlib import Path
import re

root=Path(__file__).resolve().parent
html=(root/'qaqc-study.html').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="qaqc-checkpoint.css">','<style>\n'+(root/'qaqc-checkpoint.css').read_text(encoding='utf8')+'\n</style>')
for name in ('qaqc-data-glyphs.js','qaqc-checkpoint.js'):
    script=(root/name).read_text(encoding='utf8').replace('</script','<\\/script')
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+script+'\n</script>')
assert not re.search(r'<script\s+src=|<link\s+rel="stylesheet"',html)
assert html.count('<script>')==3
out=root.parent/'QAQC — цикл данных.html'
out.write_text(html,encoding='utf8')
print(f'QAQC study: {out.stat().st_size:,} bytes; three inline scripts, SVG, no external assets.')
