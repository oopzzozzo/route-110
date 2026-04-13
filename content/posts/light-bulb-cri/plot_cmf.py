"""
Plot the CIE 1931 2° standard observer colour matching functions x̄, ȳ, z̄.

Data source: CVRL (http://cvrl.ioo.ucl.ac.uk/), ciexyz31_1.csv, sampled at
1 nm from 360 to 830 nm. These are the tabulated 1931 CIE 2° observer values
derived from the Wright (1928-29) and Guild (1931) colour-matching
experiments.
"""

from __future__ import annotations

import csv
import io
import urllib.request

import matplotlib.pyplot as plt

CMF_URL = "http://cvrl.ioo.ucl.ac.uk/database/data/cmfs/ciexyz31_1.csv"


def load_cmf() -> tuple[list[int], list[float], list[float], list[float]]:
    raw = urllib.request.urlopen(CMF_URL, timeout=30).read().decode("utf-8")
    wl: list[int] = []
    x: list[float] = []
    y: list[float] = []
    z: list[float] = []
    for row in csv.reader(io.StringIO(raw)):
        if not row:
            continue
        wl.append(int(float(row[0])))
        x.append(float(row[1]))
        y.append(float(row[2]))
        z.append(float(row[3]))
    return wl, x, y, z


def main() -> None:
    wl, x, y, z = load_cmf()

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(wl, x, label=r"$\bar{x}(\lambda)$", color="#d62728", linewidth=2.0)
    ax.plot(wl, y, label=r"$\bar{y}(\lambda)$", color="#2ca02c", linewidth=2.0)
    ax.plot(wl, z, label=r"$\bar{z}(\lambda)$", color="#1f77b4", linewidth=2.0)

    ax.set_xlim(380, 780)
    ax.set_ylim(0, max(max(x), max(y), max(z)) * 1.05)
    ax.set_xlabel("Wavelength (nm)")
    ax.set_ylabel("Tristimulus value")
    ax.set_title("CIE 1931 2° Standard Observer Colour Matching Functions")
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=11, loc="upper right")
    fig.tight_layout()
    fig.savefig("cmf_xyz.png", dpi=150)
    print("wrote cmf_xyz.png")


if __name__ == "__main__":
    main()
