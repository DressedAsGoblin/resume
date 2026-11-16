"""Package the schematic SIGNALOGI checkpoint as one offline HTML."""
from pathlib import Path
import re

root=Path(__file__).resolve().parent
html=(root/'signalogi-study.html').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="signalogi-checkpoint.css">','<style>\n'+(root/'signalogi-checkpoint.css').read_text(encoding='utf8')+'\n</style>')
script=(root/'signalogi-checkpoint.js').read_text(encoding='utf8').replace('</script','<\\/script')
html=html.replace('<script src="signalogi-checkpoint.js"></script>','<script>\n'+script+'\n</script>')
assert not re.search(r'<script\s+src=|<link\s+rel="stylesheet"',html)
assert html.count('<script>')==2
out=root.parent/'СИГНАЛОГИ — чекпойнт.html'
out.write_text(html,encoding='utf8')
print(f'SIGNALOGI checkpoint: {out.stat().st_size:,} bytes, SVG and two inline scripts, no external assets.')
