import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.font_manager as fm

font_path = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
prop = fm.FontProperties(fname=font_path)
plt.rcParams['font.family'] = prop.get_name()

brackets = [
    (610_000,   0.05),
    (1_380_000, 0.12),
    (2_770_000, 0.20),
    (5_190_000, 0.30),
    (6_500_000, 0.40),
]

X_MIN = -500_000
X_MAX = 6_500_000

def calc_tax(income):
    if income <= 0:
        return 0.0
    tax = 0.0
    prev = 0
    for ceiling, rate in brackets:
        if income <= prev:
            break
        taxable = min(income, ceiling) - prev
        tax += taxable * rate
        prev = ceiling
    return tax

incomes = np.linspace(X_MIN, X_MAX, 10_000)
taxes = np.array([calc_tax(x) for x in incomes])

fig, ax = plt.subplots(figsize=(9, 5))
fig.suptitle('台灣綜合所得稅：所得淨額 vs 應繳稅額（115年）', fontsize=14,
             fontproperties=prop)

# Build kink points: include the zero-segment (X_MIN→0, slope=0) as a real segment
kinks = [(X_MIN, 0.0), (0, 0.0)]
prev_x, prev_y = 0, 0.0
for ceiling, rate in brackets[:-1]:
    y = prev_y + (ceiling - prev_x) * rate
    kinks.append((ceiling, y))
    prev_x, prev_y = ceiling, y
kinks.append((X_MAX, calc_tax(X_MAX)))

# Dotted extensions: each segment's slope extended across full x range
for i in range(len(kinks) - 1):
    x0, y0 = kinks[i]
    x1, y1 = kinks[i + 1]
    slope = (y1 - y0) / (x1 - x0)
    y_at_xmin = y0 + slope * (X_MIN - x0)
    y_at_xmax = y0 + slope * (X_MAX - x0)
    ax.plot([X_MIN / 10_000, X_MAX / 10_000],
            [y_at_xmin / 10_000, y_at_xmax / 10_000],
            color='steelblue', linewidth=1.0, linestyle='--', alpha=0.35,
            zorder=2)

# Solid actual curve
ax.plot(incomes / 10_000, taxes / 10_000, color='steelblue', linewidth=2.5,
        zorder=3)

# Inflection points: all interior kinks (skip first and last graph-edge points)
inflection_xs = [x / 10_000 for x, _ in kinks[1:-1]]
inflection_ys = [y / 10_000 for _, y in kinks[1:-1]]
ax.scatter(inflection_xs, inflection_ys, s=55, color='white',
           edgecolors='steelblue', linewidths=2, zorder=5)


# Rate labels near bottom of each segment
rate_labels = [
    (X_MIN,      0,         '0%'),
    (0,          610_000,   '5%'),
    (610_000,  1_380_000,   '12%'),
    (1_380_000, 2_770_000,  '20%'),
    (2_770_000, 5_190_000,  '30%'),
    (5_190_000, 6_500_000,  '40%'),
]
y_label = (taxes.max() / 10_000) * 0.04
for lo, hi, label in rate_labels:
    mid = (lo + hi) / 2 / 10_000
    ax.text(mid, y_label, label, ha='center', fontsize=8.5, color='dimgray',
            fontproperties=prop,
            bbox=dict(boxstyle='round,pad=0.2', fc='white', alpha=0.8))

# Tax bracket table as legend (upper-left)
table_rows = [
    ('所得淨額', '稅率'),
    ('≤ 61萬',  ' 5%'),
    ('≤ 138萬', '12%'),
    ('≤ 277萬', '20%'),
    ('≤ 519萬', '30%'),
    ('> 519萬', '40%'),
]
header = table_rows[0]
body   = table_rows[1:]
col_w  = [6.5, 3.5]   # rough char widths for alignment

def fmt_row(cells):
    return f"{'  '.join(c.ljust(int(w)) for c, w in zip(cells, col_w))}"

divider = '─' * 12
table_str = (
    fmt_row(header) + '\n' +
    divider + '\n' +
    '\n'.join(fmt_row(r) for r in body)
)
ax.text(0.02, 0.97, table_str, transform=ax.transAxes,
        fontsize=8.5, fontproperties=prop,
        verticalalignment='top', fontfamily='monospace',
        bbox=dict(boxstyle='round,pad=0.5', fc='white', ec='lightgray', alpha=0.9),
        zorder=6)

ax.set_xlim(X_MIN / 10_000, X_MAX / 10_000)
y_top = taxes.max() / 10_000 * 1.05
ax.set_ylim(-y_top * 0.03, y_top)
ax.set_xlabel('所得淨額（萬元）', fontproperties=prop, fontsize=11)
ax.set_ylabel('應繳稅額（萬元）', fontproperties=prop, fontsize=11)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:.0f}'))
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:.0f}'))
ax.grid(True, alpha=0.3)

plt.tight_layout()
out = 'tax_plot.png'
plt.savefig(out, dpi=150, bbox_inches='tight')
print(f'Saved {out}')
plt.show()
