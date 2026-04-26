#!/usr/bin/env python3
"""Re-apply theme-aware CSS transforms to draw.io-exported SVGs.

Run after a fresh draw.io export overwrites the per-post SVG files. Pass the
post directory as the only argument; defaults to the current working directory.
"""
import argparse, glob, os, re, sys

STYLE_BLOCK = (
    '<style>'
    ':root{--d-text:rgb(0,0,0);--d-gray:rgb(102,102,102);'
    '--d-blue-stroke:rgb(108,142,191);--d-green-stroke:rgb(130,179,102);'
    '--d-red-stroke:rgb(184,84,80);--d-green-fill:rgb(213,232,212);'
    '--d-yellow-stroke:rgb(214,182,86);--d-blue-fill:rgb(218,232,252);'
    '--d-red-fill:rgb(248,206,204);--d-yellow-fill:rgb(255,242,204)}'
    'html.dark{--d-text:rgb(255,255,255);--d-gray:rgb(149,149,149);'
    '--d-blue-stroke:rgb(92,121,163);--d-green-stroke:rgb(68,110,44);'
    '--d-red-stroke:rgb(215,129,126);--d-green-fill:rgb(31,47,30);'
    '--d-yellow-stroke:rgb(109,81,0);--d-blue-fill:rgb(29,41,59);'
    '--d-red-fill:rgb(81,45,43);--d-yellow-fill:rgb(40,29,0)}'
    # Firefox doesn't always invalidate inline-SVG paint when a CSS variable
    # changes via a parent class toggle. A sub-frame transition forces it to
    # re-evaluate var() and repaint.
    'svg rect,svg path,svg polygon,svg ellipse,svg circle,svg line{'
    'transition:fill 16ms linear,stroke 16ms linear}'
    'svg foreignObject div{transition:color 16ms linear}'
    '</style>'
)

LIGHT_DARK_COLORS = {
    'light-dark(rgb(0, 0, 0), rgb(255, 255, 255))':         'var(--d-text)',
    'light-dark(rgb(102, 102, 102), rgb(149, 149, 149))':    'var(--d-gray)',
    'light-dark(rgb(108, 142, 191), rgb(92, 121, 163))':     'var(--d-blue-stroke)',
    'light-dark(rgb(130, 179, 102), rgb(68, 110, 44))':      'var(--d-green-stroke)',
    'light-dark(rgb(184, 84, 80), rgb(215, 129, 126))':      'var(--d-red-stroke)',
    'light-dark(rgb(213, 232, 212), rgb(31, 47, 30))':       'var(--d-green-fill)',
    'light-dark(rgb(214, 182, 86), rgb(109, 81, 0))':        'var(--d-yellow-stroke)',
    'light-dark(rgb(218, 232, 252), rgb(29, 41, 59))':       'var(--d-blue-fill)',
    'light-dark(rgb(248, 206, 204), rgb(81, 45, 43))':       'var(--d-red-fill)',
    'light-dark(rgb(255, 242, 204), rgb(40, 29, 0))':        'var(--d-yellow-fill)',
}


def transform(content):
    # 1. Make background transparent
    content = re.sub(
        r'background: #[^;]*; background-color: light-dark\([^)]*\)',
        'background: transparent; background-color: transparent',
        content
    )
    content = content.replace('transparent);', 'transparent;')

    # 2. Remove white background fill on background shape
    content = content.replace('fill: light-dark(#ffffff, var(--ge-dark-color, #121212));', 'fill: none;')

    # 3. Replace light-dark() color values with CSS variables
    for old, new in LIGHT_DARK_COLORS.items():
        content = content.replace(old, new)

    # 4. Replace hardcoded black text with --d-text variable
    content = content.replace('color: #000000;', 'color: var(--d-text);')
    content = content.replace('color: light-dark(#000000, #ffffff);', 'color: var(--d-text);')

    # 5. Strip color-scheme from SVG root (handled via CSS in <style> block)
    content = re.sub(r'color-scheme:\s*[^;"]+;?\s*', '', content)

    # 6. Drop redundant fill="#hex" / stroke="#hex" presentation attrs whose
    #    style="" already paints via var() — leaves a single paint source.
    def _strip_redundant_color_attr(m):
        tag = m.group(0)
        for prop in ('fill', 'stroke'):
            if re.search(rf'\sstyle="[^"]*\b{prop}:\s*var\(', tag):
                tag = re.sub(rf'\s{prop}="#[0-9a-fA-F]+"', '', tag, count=1)
        return tag
    content = re.sub(r'<(?:rect|path|circle|ellipse|line|polygon|polyline)\b[^/>]*/?>',
                     _strip_redundant_color_attr, content)

    # 7. Inject <style> block inside <svg> element (once, if not already present)
    if STYLE_BLOCK not in content:
        content = re.sub(r'(<svg\b[^>]*>)', r'\1' + STYLE_BLOCK, content, count=1)

    return content


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('svg_dir', nargs='?', default='.',
                    help='directory containing .svg files (default: current dir)')
    args = ap.parse_args()

    paths = sorted(glob.glob(os.path.join(args.svg_dir, '*.svg')))
    if not paths:
        sys.exit(f'No *.svg files in {args.svg_dir}')

    for path in paths:
        with open(path) as f:
            content = f.read()
        with open(path, 'w') as f:
            f.write(transform(content))
        print(f'  {os.path.basename(path)} done')

    print('All transforms applied.')


if __name__ == '__main__':
    main()
