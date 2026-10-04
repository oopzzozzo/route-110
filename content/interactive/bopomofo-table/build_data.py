"""Build the data files of the bopomofo table.

Usage: python3 build_data.py

Reading sources, covering every Han character each source has:
  chewing  新酷音詞庫 (libchewing-data, LGPL-2.1-or-later): readings from
           word.csv + tsi.csv, frequency per character *and* reading from tsi.csv.
  moe      教育部《重編國語辭典修訂本》 via g0v/moedict-data (CC BY-ND 3.0 TW).
           No frequency.
  cns      CNS11643 全字庫 (政府資料開放授權條款第1版). No frequency.

Character sets:
  moe1/moe2/moe3  教育部常用 / 次常用 / 罕用國字標準字體表, from the 全字庫
                  glyph-source table (CNS_source.txt)
  big5-1/big5-2   Big5 常用字 (0xA440-0xC67E) / 次常用字 (0xC940-0xF9D5)

Each source is split into chunks by (MOE tier, Big5 tier), 0 meaning none, so
the page downloads exactly the chunks a set of selected character sets covers.
bopomofo-data-<source>-<moe tier><big5 tier>.js registers
BOPOMOFO_CHUNKS['<source>-<chunk>'] = entries, a string of records:
  char (1 or 2 UTF-16 units)
  + syllable code in base 36 (3 digits): ((initial * 4 + medial) * 14 + final) * 5 + tone,
    indices into the INITIALS / MEDIALS / FINALS / TONES lists below
  + sort key in base 36 (2 digits), ascending: inverted log frequency for
    sources with frequency, else stroke count
  + '1' if primary reading else '0'
bopomofo-manifest.js registers BOPOMOFO_MANIFEST = {source: {versions, freq, chunks}}.
"""
import collections
import functools
import glob
import io
import json
import lzma
import math
import os
import re
import urllib.request
import zipfile

CHEWING = 'https://raw.githubusercontent.com/chewing/libchewing-data/main/dict/chewing/'
MOEDICT = 'https://raw.githubusercontent.com/g0v/moedict-data/main/dict-revised.json.xz'
MOEDICT_COMMITS = 'https://api.github.com/repos/g0v/moedict-data/commits?path=dict-revised.json.xz&per_page=1'
# Edition of the dictionary text, from the moedict-data README.
MOE_EDITION = '2021-11'
CNS = 'https://www.cns11643.gov.tw/opendata/'
# CNS-to-Unicode tables; plane 15 is private use and left out.
CNS_UNICODE = ['Unicode/CNS2UNICODE_Unicode BMP.txt', 'Unicode/CNS2UNICODE_Unicode 2.txt',
               'Unicode/CNS2UNICODE_Unicode 3.txt']
MOE_LISTS = {'moe1': '常用國字標準字體表', 'moe2': '次常用字國字標準字體表', 'moe3': '罕用國字標準字體表'}

SYLLABLE = re.compile('([ㄅ-ㄙ]?)([ㄧㄨㄩ]?)([ㄚ-ㄦ]?)([ˊˇˋ˙]?)')
# Must match bopomofo-table.js.
INITIALS = ['', *'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ']
MEDIALS = ['', *'ㄧㄨㄩ']
FINALS = ['', *'ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ']
TONES = ['', *'ˊˇˋ˙']
HAN = [(0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xF900, 0xFAFF), (0x20000, 0x3FFFF)]


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'build_data.py'})
    with urllib.request.urlopen(req) as r:
        return r.read()


def is_han(ch):
    return len(ch) == 1 and any(lo <= ord(ch) <= hi for lo, hi in HAN)


def big5_code(ch):
    try:
        b = ch.encode('big5')
    except UnicodeEncodeError:
        return None
    return int.from_bytes(b, 'big') if len(b) == 2 else None


def normalize(reading):
    """Move a leading neutral-tone mark to the end; None if not a syllable."""
    reading = reading.strip()
    if reading.startswith('˙'):
        reading = reading[1:] + '˙'
    if not reading or reading == '˙' or not SYLLABLE.fullmatch(reading):
        return None
    return reading


@functools.lru_cache(None)
def cns_files():
    release = fetch(CNS + 'release.txt').decode('utf-8-sig')
    version = re.search(r'Properties\.zip\s+版本：(\d+)', release).group(1)
    props = zipfile.ZipFile(io.BytesIO(fetch(CNS + 'Properties.zip')))
    tables = zipfile.ZipFile(io.BytesIO(fetch(CNS + 'MapingTables.zip')))
    to_char = {}
    for name in CNS_UNICODE:
        for line in tables.read(name).decode('utf-8-sig').splitlines():
            code, hexval = line.split('\t')[:2]
            to_char[code] = chr(int(hexval, 16))

    def table(name):
        for line in props.read(name).decode('utf-8-sig').splitlines():
            code, value = line.split('\t')[:2]
            if is_han(to_char.get(code, '')):
                yield to_char[code], value
    return version, table


@functools.lru_cache(None)
def strokes():
    _, table = cns_files()
    return {ch: int(n) for ch, n in table('CNS_stroke.txt')}


def chewing():
    freq = collections.defaultdict(int)
    versions = {}
    for name in ('word.csv', 'tsi.csv'):
        for line in fetch(CHEWING + name).decode('utf-8').splitlines():
            if line.startswith('# dc:identifier,'):
                versions[name] = line.split(',')[1]
            if not line or line.startswith('#'):
                continue
            word, f, reading = line.split(',')[:3]
            reading = normalize(reading)
            if is_han(word) and reading:
                freq[word, reading] += int(f)
    return versions, freq


def moe():
    commit = json.loads(fetch(MOEDICT_COMMITS))[0]['commit']['committer']['date'][:10]
    pairs = []
    for entry in json.loads(lzma.decompress(fetch(MOEDICT))):
        ch = entry.get('title', '')
        if not is_han(ch):
            continue
        for h in entry.get('heteronyms', []):
            reading = normalize(h.get('bopomofo', ''))
            if reading:
                pairs.append((ch, reading))
    return {'edition': MOE_EDITION, 'moedict-data': commit}, pairs


def cns():
    version, table = cns_files()
    pairs = [(ch, normalize(r)) for ch, r in table('CNS_phonetic.txt') if normalize(r)]
    return {'release': version}, pairs


def b36(n, width):
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    assert 0 <= n < 36 ** width
    return ''.join(digits[n // 36 ** p % 36] for p in range(width - 1, -1, -1))


def syllable_code(reading):
    i, m, f, t = SYLLABLE.fullmatch(reading).groups()
    return ((INITIALS.index(i) * 4 + MEDIALS.index(m)) * 14 + FINALS.index(f)) * 5 + TONES.index(t)


@functools.lru_cache(None)
def tiers():
    """char -> (MOE tier, Big5 tier), 0 meaning none."""
    _, table = cns_files()
    moe = {}
    for ch, source in table('CNS_source.txt'):
        for tier, label in enumerate(MOE_LISTS.values(), 1):
            if label in source:
                moe.setdefault(ch, tier)
    big5 = {}
    for c in range(0x3400, 0xA000):
        code = big5_code(chr(c)) or 0
        if 0xA440 <= code <= 0xC67E:
            big5[chr(c)] = 1
        elif 0xC940 <= code <= 0xF9D5:
            big5[chr(c)] = 2
    return lambda ch: (moe.get(ch, 0), big5.get(ch, 0))


def write_source(name, versions, freq):
    """freq: {(char, reading): count}, or a list of pairs for sources without frequency."""
    if isinstance(freq, dict):
        weights, has_freq = freq, True
    else:
        # No frequency: keep the source's own reading order within a character.
        weights, has_freq = {}, False
        for pair in freq:
            weights.setdefault(pair, -len(weights))

    primary = {}
    if has_freq:
        for (ch, reading), f in weights.items():
            if ch not in primary or f > weights[ch, primary[ch]]:
                primary[ch] = reading

    stroke = strokes()
    top = math.log1p(max(weights.values())) if has_freq else 0

    def sort_key(ch, reading):
        if has_freq:
            return 1295 - round(1295 * math.log1p(max(weights[ch, reading], 0)) / top)
        return min(stroke.get(ch, 99), 1295)

    # Exact order within a chunk; the coarser sort key only interleaves chunks on the page.
    order = sorted(weights, key=lambda k: (sort_key(*k), -weights[k] if has_freq else 0,
                                           stroke.get(k[0], 99), ord(k[0]), -weights[k]))
    tier = tiers()
    chunks = collections.defaultdict(list)
    for ch, reading in order:
        chunks['%d%d' % tier(ch)].append(
            ch + b36(syllable_code(reading), 3) + b36(sort_key(ch, reading), 2)
            + ('1' if not has_freq or primary[ch] == reading else '0'))

    for old in glob.glob('bopomofo-data-%s-*.js' % name):
        os.remove(old)
    for chunk, records in sorted(chunks.items()):
        key = '%s-%s' % (name, chunk)
        with open('bopomofo-data-%s.js' % key, 'w', encoding='utf-8') as out:
            out.write('// Generated by build_data.py; see its docstring for sources and licenses.\n')
            out.write('(window.BOPOMOFO_CHUNKS = window.BOPOMOFO_CHUNKS || {})[%s] = %s;\n' % (
                json.dumps(key), json.dumps(''.join(records), ensure_ascii=False)))
    print('%s: %d chars, %d readings, chunks %s' % (
        name, len({ch for ch, _ in weights}), len(order), {c: len(r) for c, r in sorted(chunks.items())}))
    return {'versions': versions, 'freq': has_freq, 'chunks': sorted(chunks)}


manifest = {name: write_source(name, *build()) for name, build in (('chewing', chewing), ('moe', moe), ('cns', cns))}
with open('bopomofo-manifest.js', 'w', encoding='utf-8') as out:
    out.write('// Generated by build_data.py; see its docstring for sources and licenses.\n')
    out.write('var BOPOMOFO_MANIFEST = %s;\n' % json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
