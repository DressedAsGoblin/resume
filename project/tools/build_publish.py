"""Rebuild the standalone map and refresh the two published HTML pages.

Run from a clone of the public repository:
    python project/tools/build_publish.py

The existing published pages are used as resume-page templates. Their embedded
map is replaced with a fresh build from project/mvp. This preserves the
approved resume text without needing the private source document.
"""

from pathlib import Path
import base64
import re
import subprocess
import sys

REPOSITORY = Path(__file__).resolve().parents[2]
PROJECT = REPOSITORY / 'project'
MVP = PROJECT / 'mvp'

for builder in ('build_world.py', 'build_single_file.py'):
    subprocess.run([sys.executable, str(MVP / builder)], check=True)

map_html = (PROJECT / 'Мир проектов — MVP.html').read_text(encoding='utf-8')
mobile_declaration = "const mobile = matchMedia('(max-width: 680px), (pointer: coarse) and (max-width: 950px)');"
desktop_declaration = 'const mobile = {matches: false, addEventListener() {}};'
if map_html.count(mobile_declaration) != 1:
    raise RuntimeError('Expected responsive map declaration was not found exactly once.')

for page, desktop in ((REPOSITORY / 'index.html', False), (REPOSITORY / 'desktop.html', True)):
    html = page.read_text(encoding='utf-8')
    match = re.search(r"atob\('([^']+)'\)", html)
    if not match:
        raise RuntimeError(f'Embedded map not found in {page}')
    embedded = map_html.replace(mobile_declaration, desktop_declaration) if desktop else map_html
    encoded = base64.b64encode(embedded.encode('utf-8')).decode('ascii')
    html = html[:match.start(1)] + encoded + html[match.end(1):]
    page.write_text(html, encoding='utf-8')
    print(f'Updated {page.name}: {len(html):,} characters')
