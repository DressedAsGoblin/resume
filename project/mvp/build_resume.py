from pathlib import Path
import base64
import re
import markdown

root = Path(__file__).resolve().parents[1]
source = root / 'Исходные материалы/Общие материалы/Портфолио Research/baseline_ru.md'
resume = source.read_text(encoding='utf-8-sig')
title, contacts, body = resume.split('\n\n', 2)
contacts = contacts.splitlines()[0].split(' | ', 1)[0].lstrip('| ')
before, early_and_after = body.split('### Август 2018 — Август 2019', 1)
early, after = early_and_after.split('## Владение инструментами', 1)
render = markdown.markdown
portrait = base64.b64encode((root / 'mvp/assets/pixel-hero.png').read_bytes()).decode('ascii')
html = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Максим Мельников · Резюме</title>
<style>
* {{box-sizing:border-box}}
body {{margin:0;color:#eae2d3;background:#101922 radial-gradient(ellipse at top,#263942,transparent 720px) no-repeat;font:16px/1.65 system-ui,sans-serif}}
main {{max-width:880px;margin:auto;padding:clamp(18px,5vw,56px)}}
header {{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:clamp(18px,4vw,36px);background:#1b2b34;border:1px solid #746347;border-radius:12px}}
header img {{width:clamp(84px,17vw,155px);height:auto}}
h1,h2,h3,h4 {{line-height:1.24}}
h1 {{font-size:clamp(25px,5vw,44px);margin:0 0 14px;color:#f7dfb5}}
h2 {{color:#9fd1c7;margin-top:28px;font-size:25px}}
h3,h4 {{color:#efd2a1}}
a {{color:#f6d293}}
hr {{border:0;border-top:1px solid #405257;margin:28px 0}}
li {{margin:.25em 0}}
details {{background:#1a2b34;border:1px solid #526661;border-radius:8px;padding:14px 18px}}
summary {{cursor:pointer;font-weight:650;color:#f4d6a1}}
.cta {{display:block;margin:38px auto 0;padding:16px 24px;text-align:center;border-radius:8px;background:#efc788;color:#18252b;font-size:clamp(17px,3vw,23px);font-weight:750;text-decoration:none}}
main > .cta:first-child {{margin:0 0 20px}}
.cta:hover {{background:#ffddaa}}
:focus-visible {{outline:2px solid #f5ce92;outline-offset:4px}}
@media(max-width:490px) {{header {{display:block}} header img {{display:block;margin:0 auto}}}}
</style></head><body>
<main>
<a class="cta" href="Мир проектов — MVP.html">Изучить портфолио проектов →</a>
<header><div>{render(title)}{render(contacts)}</div><img src="data:image/png;base64,{portrait}" alt="Пиксельный портрет Максима Мельникова"></header>
<article aria-label="Резюме">
{render(before)}
<details><summary>Опыт до Центра Heriot-Watt</summary>
{render('### Август 2018 — Август 2019' + early)}
</details>
{render('## Владение инструментами' + after)}
</article>
<a class="cta" href="Мир проектов — MVP.html">Изучить портфолио проектов →</a>
</main></body></html>'''
(root / 'index.html').write_text(html, encoding='utf-8')
