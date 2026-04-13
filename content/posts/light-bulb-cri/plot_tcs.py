"""
Plot the CIE 1995 Test Colour Samples (TCS01-TCS08) used to compute the
general Colour Rendering Index Ra = mean(R1..R8).

Data source: CIE 13.3-1995, "Method of Measuring and Specifying Colour
Rendering Properties of Light Sources". Machine-readable values taken from
the colour-science library (colour/quality/datasets/tcs.py), which in turn
cites Ohno & Davis (2008), NIST CQS simulation v7.4.
"""

from __future__ import annotations

import ast
import csv
import io
import re
import urllib.request

import matplotlib.pyplot as plt

TCS_SRC_URL = (
    "https://raw.githubusercontent.com/colour-science/colour/develop/"
    "colour/quality/datasets/tcs.py"
)
CMF_URL = "http://cvrl.ioo.ucl.ac.uk/database/data/cmfs/ciexyz31_1.csv"
D65_URL = "http://cvrl.ioo.ucl.ac.uk/database/data/cie/Illuminantd65.csv"

SAMPLE_NAMES = {
    "TCS01": "R1  7.5 R 6/4   (light greyish red)",
    "TCS02": "R2  5 Y 6/4    (dark greyish yellow)",
    "TCS03": "R3  5 GY 6/8   (strong yellow green)",
    "TCS04": "R4  2.5 G 6/6  (moderate yellowish green)",
    "TCS05": "R5  10 BG 6/4  (light bluish green)",
    "TCS06": "R6  5 PB 6/8   (light blue)",
    "TCS07": "R7  2.5 P 6/8  (light violet)",
    "TCS08": "R8  10 P 6/8   (light reddish purple)",
    "TCS09": "R9  4.5 R 4/13 (strong red)",
    "TCS10": "R10 5 Y 8/10   (strong yellow)",
    "TCS11": "R11 4.5 G 5/8  (strong green)",
    "TCS12": "R12 3 PB 3/11  (strong blue)",
    "TCS13": "R13 5 YR 8/4   (light yellowish pink, complexion)",
    "TCS14": "R14 5 GY 4/4   (moderate olive green, foliage)",
    "TCS15": "R15 1 YR 6/4   (Asian skin complexion)",
}


def _extract_dict(src: str, name: str) -> dict:
    m = re.search(rf"{name}:\s*dict\s*=\s*(\{{)", src)
    if not m:
        raise RuntimeError(f"could not locate {name} in source")
    start = m.end() - 1
    depth = 0
    for i in range(start, len(src)):
        c = src[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return ast.literal_eval(src[start : i + 1])
    raise RuntimeError(f"unterminated dict literal for {name}")


def _extract_tcs15(src: str) -> dict[int, float]:
    """Pull just the TCS15 inner dict out of DATA_TCS_CIE2024 (which uses **splat)."""
    m = re.search(r'"TCS15"\s*:\s*(\{)', src)
    if not m:
        raise RuntimeError("could not locate TCS15 in source")
    start = m.end() - 1
    depth = 0
    for i in range(start, len(src)):
        c = src[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return ast.literal_eval(src[start : i + 1])
    raise RuntimeError("unterminated TCS15 dict literal")


def load_tcs_all() -> dict[str, dict[int, float]]:
    """Fetch tcs.py and merge CIE 1995 (TCS01-14) with CIE 2024 TCS15."""
    src = urllib.request.urlopen(TCS_SRC_URL, timeout=30).read().decode("utf-8")
    data = dict(_extract_dict(src, "DATA_TCS_CIE1995"))
    data["TCS15"] = _extract_tcs15(src)
    return data


def load_csv(url: str) -> dict[int, tuple[float, ...]]:
    """Fetch a CVRL-format CSV: wavelength, v1[, v2, v3]."""
    raw = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    out: dict[int, tuple[float, ...]] = {}
    for row in csv.reader(io.StringIO(raw)):
        if not row:
            continue
        wl = int(float(row[0]))
        out[wl] = tuple(float(x) for x in row[1:])
    return out


def sample_to_srgb(
    sd: dict[int, float],
    cmf: dict[int, tuple[float, ...]],
    illum: dict[int, tuple[float, ...]],
) -> tuple[float, float, float]:
    """Integrate sample spectrum under D65 and convert XYZ → sRGB (clipped)."""
    wls = sorted(w for w in sd if w in cmf and w in illum)
    X = Y = Z = Yn = 0.0
    for w in wls:
        S = illum[w][0]
        R = sd[w]
        xb, yb, zb = cmf[w]
        X += S * R * xb
        Y += S * R * yb
        Z += S * R * zb
        Yn += S * yb
    X, Y, Z = X / Yn, Y / Yn, Z / Yn

    # XYZ (D65) → linear sRGB (IEC 61966-2-1)
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z

    def encode(c: float) -> float:
        c = max(0.0, min(1.0, c))
        return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

    return encode(r), encode(g), encode(b)


def plot_samples(
    keys: list[str],
    data: dict[str, dict[int, float]],
    cmf: dict[int, tuple[float, ...]],
    illum: dict[int, tuple[float, ...]],
    title: str,
    out_path: str,
) -> None:
    fig, ax = plt.subplots(figsize=(10, 6))
    for key in keys:
        sd = data[key]
        wl = sorted(sd)
        r = [sd[w] for w in wl]
        colour = sample_to_srgb(sd, cmf, illum)
        ax.plot(wl, r, label=SAMPLE_NAMES[key], color=colour, linewidth=2.0)

    ax.set_xlim(380, 780)
    ax.set_ylim(0, 1)
    ax.set_xlabel("Wavelength (nm)")
    ax.set_ylabel("Spectral radiance factor")
    ax.set_title(title)
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=8, loc="upper left", ncol=1 if len(keys) <= 8 else 2)
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    print(f"wrote {out_path}")


def main() -> None:
    data = load_tcs_all()
    cmf = load_csv(CMF_URL)
    d65 = load_csv(D65_URL)

    plot_samples(
        [f"TCS{i:02d}" for i in range(1, 9)],
        data,
        cmf,
        d65,
        "CIE 13.3-1995 Test Colour Samples TCS01–TCS08 (used for Ra)",
        "tcs_r1_r8.png",
    )
    plot_samples(
        [f"TCS{i:02d}" for i in range(9, 16)],
        data,
        cmf,
        d65,
        "CIE Test Colour Samples TCS09–TCS15 (special CRIs R9–R15)",
        "tcs_r9_r15.png",
    )


if __name__ == "__main__":
    main()
