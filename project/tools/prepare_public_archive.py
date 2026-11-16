"""Copy authored portfolio artifacts into a GitHub checkout.

Run from the local project root:
    python prepare_public_archive.py .publish-resume

The list is deliberately explicit: private source documents and raw chat
exports must never be copied by a broad recursive upload.
"""

from pathlib import Path
import json
import shutil
import sys

SOURCE = Path(__file__).resolve().parent
REPOSITORY = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
if REPOSITORY is None or not (REPOSITORY / '.git').exists():
    raise SystemExit('Pass the path to an existing Git checkout.')

ARCHIVE = REPOSITORY / 'project'


def copy_file(relative: str, destination: str | None = None) -> None:
    origin = SOURCE / relative
    target = ARCHIVE / (destination or relative)
    if not origin.is_file():
        raise FileNotFoundError(origin)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(origin, target)


for path in (SOURCE / 'mvp').rglob('*'):
    if path.is_file():
        copy_file(str(path.relative_to(SOURCE)))

for name in (
    'Истории проектов — задача, вклад и польза.md',
    'План правок MVP — на согласование.md',
    'Проекты для распределения по этапам.md',
    'Промпт нового эскиза.txt',
    'Сопоставление проектов и источников.md',
    'Тексты чекпойнтов — для правок.md',
    'Хронология проектов — для заполнения.md',
    'MVP — визуалы и компетенции.md',
    'MVP — объём и проектные истории.md',
):
    copy_file(name, f'docs/{name}')

for name in (
    'Мир проектов — MVP.html',
    'Резюме и портфолио.html',
    'Резюме и портфолио — компьютер.html',
    'QAQC — цикл данных.html',
    'index.html',
    'Эскиз изометрического резюме — новая версия.png',
):
    copy_file(name, f'iterations/{name}')

for name in (
    'DTW_Agglomerative-original-video-assembly.py',
    'DTW_KMeans-original-video-assembly.py',
    'README.md',
):
    copy_file(f'assets/signalogi/animation-recovery/{name}')

for name in ('README.md', 'slice-1.png', 'slice-2.png', 'slice-3.png'):
    copy_file(f'assets/signalogi/depth-preview/{name}')

provenance = json.loads((SOURCE / 'assets/signalogi/depth-preview/provenance.json').read_text(encoding='utf-8'))
provenance['source_deck'] = 'Сигналоги_FINAL.pptx (слайд 64; исходный документ хранится локально)'
target = ARCHIVE / 'assets/signalogi/depth-preview/provenance.json'
target.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

copy_file('prepare_public_archive.py', 'tools/prepare_public_archive.py')
copy_file('build_publish.py', 'tools/build_publish.py')
copy_file('PUBLIC_ARCHIVE_README.md', 'README.md')
print(f'Prepared {sum(p.is_file() for p in ARCHIVE.rglob("*"))} files in {ARCHIVE}')
