"""Validate the static bilingual preview without browser dependencies."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'app.js').read_text()
translations = json.loads(source[source.index('{', source.index('const translations')):source.index('\n};') + 2])
assert translations['fr'].keys() == translations['pt'].keys(), 'Translation keys differ'

class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.ids, self.refs, self.keys, self.required, self.aria = [], [], [], [], []
        self.h1_count = 0
        self.feed((ROOT / filename).read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.h1_count += tag == 'h1'
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append(attrs[key])
        if 'srcset' in attrs:
            self.refs.extend(part.strip().split()[0] for part in attrs['srcset'].split(','))
        for key in ('data-i18n', 'data-i18n-html', 'data-i18n-placeholder'):
            if key in attrs:
                self.keys.append(attrs[key])
        for key in ('aria-labelledby', 'aria-describedby', 'aria-controls'):
            self.aria.extend(attrs.get(key, '').split())
        if 'required' in attrs:
            self.required.append(attrs.get('name'))
        if tag == 'form':
            assert not attrs.get('action'), 'Preview must not submit to a server'

pages = {name: Page(name) for name in ('index.html', 'tarifs.html')}
for name, page in pages.items():
    assert page.h1_count == 1, (name, 'Expected one h1')
    assert not [id for id, count in Counter(page.ids).items() if count > 1], (name, 'Duplicate IDs')
    assert set(page.aria) <= set(page.ids), (name, 'Broken ARIA reference')
    assert all(key in translations['fr'] for key in page.keys), (name, 'Missing translation')
    assert page.required == ['name', 'message'], (name, 'Incorrect required fields')
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme:
            continue
        target = unquote(url.path) or name
        assert (ROOT / target).is_file(), (name, ref, 'Missing file')
        if url.fragment and target in pages:
            assert url.fragment in pages[target].ids, (name, ref, 'Missing anchor')
    print(f'{name}: links, resources, translations, headings, ARIA and form OK')
for css in ('styles.css', 'pricing.css'):
    for asset in re.findall(r"url\(['\"]?([^)'\"]+)", (ROOT / css).read_text()):
        assert (ROOT / asset).is_file(), (css, asset)
assert all((ROOT / f'assets/azulejos-{width}.webp').stat().st_size < 200_000 for width in (640, 960, 1536))
assert sum(asset.stat().st_size for asset in (ROOT / 'assets').glob('*.woff2')) < 80_000
print('CSS resources and image/font size budgets OK')
