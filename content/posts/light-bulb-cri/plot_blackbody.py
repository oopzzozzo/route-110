"""
Plot the spectral radiance of a 4500 K blackbody using Planck's law, and
compare it against the Rayleigh–Jeans law (the classical pre-Planck result,
i.e. "blackbody without Planck's law"). The Rayleigh–Jeans curve diverges
as λ → 0 — the famous ultraviolet catastrophe.

Two figures are produced:
  1. Wide range: 100–3000 nm, showing the UV catastrophe clearly.
  2. Visible range: 350–750 nm only.
"""

from __future__ import annotations

import numpy as np
import matplotlib.pyplot as plt

H = 6.62607015e-34      # Planck constant, J·s
C = 2.99792458e8        # speed of light, m/s
KB = 1.380649e-23       # Boltzmann constant, J/K
T = 4500.0              # blackbody temperature, K


def planck(wl_m: np.ndarray, T: float) -> np.ndarray:
    """Planck spectral radiance, W·sr⁻¹·m⁻³."""
    with np.errstate(over="ignore"):
        x = H * C / (wl_m * KB * T)
        return (2.0 * H * C**2 / wl_m**5) / (np.exp(x) - 1.0)


def rayleigh_jeans(wl_m: np.ndarray, T: float) -> np.ndarray:
    """Rayleigh–Jeans classical spectral radiance, W·sr⁻¹·m⁻³."""
    return 2.0 * C * KB * T / wl_m**4


def plot(ax: plt.Axes, wl_nm: np.ndarray, title: str, y_cap: float) -> None:
    wl_m = wl_nm * 1e-9
    B_planck = planck(wl_m, T)
    B_rj = rayleigh_jeans(wl_m, T)

    # Convert from per-metre to per-nanometre for a more readable y axis.
    B_planck_nm = B_planck * 1e-9
    B_rj_nm = B_rj * 1e-9

    ax.plot(wl_nm, B_planck_nm, label="Planck's law (quantum)", color="#1f77b4", linewidth=2.2)
    ax.plot(wl_nm, B_rj_nm, label="Rayleigh–Jeans (classical)", color="#d62728", linewidth=2.2, linestyle="--")

    ax.set_xlim(wl_nm.min(), wl_nm.max())
    ax.set_ylim(0, y_cap)
    ax.set_xlabel("Wavelength (nm)")
    ax.set_ylabel(r"Spectral radiance  (W·sr$^{-1}$·m$^{-2}$·nm$^{-1}$)")
    ax.set_title(title)
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=10, loc="upper right")

    # Annotate where the Planck curve peaks (Wien's displacement law).
    peak_nm = 2.897771955e-3 / T * 1e9
    if wl_nm.min() <= peak_nm <= wl_nm.max():
        peak_val = planck(np.array([peak_nm * 1e-9]), T)[0] * 1e-9
        ax.axvline(peak_nm, color="#1f77b4", alpha=0.2, linewidth=1)
        ax.annotate(
            f"Wien peak\n≈ {peak_nm:.0f} nm",
            xy=(peak_nm, peak_val),
            xytext=(peak_nm + (wl_nm.max() - wl_nm.min()) * 0.08, peak_val * 0.9),
            fontsize=9,
            color="#1f77b4",
            arrowprops=dict(arrowstyle="->", color="#1f77b4", alpha=0.5),
        )


def main() -> None:
    # Cap the y axis at ~1.4× the Planck peak so the Rayleigh–Jeans curve
    # visibly shoots off the top of the chart — that IS the ultraviolet
    # catastrophe, and clipping it preserves the physical punch of the plot.
    peak_nm = 2.897771955e-3 / T * 1e9
    planck_peak = planck(np.array([peak_nm * 1e-9]), T)[0] * 1e-9
    y_cap = planck_peak * 1.4

    # Figure 1 — wide range (100–3000 nm).
    fig1, ax1 = plt.subplots(figsize=(10, 6))
    plot(
        ax1,
        np.linspace(100, 3000, 4000),
        f"Blackbody spectral radiance at T = {T:.0f} K  (100–3000 nm)",
        y_cap,
    )
    fig1.tight_layout()
    fig1.savefig("blackbody_wide.png", dpi=150)
    print("wrote blackbody_wide.png")

    # Figure 2 — visible range (380–780 nm).
    fig2, ax2 = plt.subplots(figsize=(10, 6))
    plot(
        ax2,
        np.linspace(380, 780, 2000),
        f"Blackbody spectral radiance at T = {T:.0f} K  (visible band, 380–780 nm)",
        y_cap,
    )
    fig2.tight_layout()
    fig2.savefig("blackbody_visible.png", dpi=150)
    print("wrote blackbody_visible.png")


if __name__ == "__main__":
    main()
