"""
Five theoretical illuminant spectra plotted against a 4500 K Planck blackbody
reference. Each spectrum is normalised so that its integrated power across
the visible band (380–780 nm) equals the Planck reference's, so that shape
differences are what you see — not overall brightness.

  1. Planck blackbody at T = 4500 K          (quantum thermal reference)
  2. Low-pressure sodium lamp                (two D-lines at 589.0/589.6 nm)
  3. RGB LED                                 (3 Gaussians at 450/530/615 nm)
  4. Equal-energy illuminant (CIE E)         (S(λ) = const)
  5. Čerenkov radiation                      (Frank–Tamm, I(λ) ∝ 1/λ²)
  6. Wien's approximation to Planck          (1896, no −1 in denominator)
  7. Helium absorption                       (4500 K Planck − He Fraunhofer lines)
  8. Iron-rich soda-lime glass                (thick bottle/window glass, Fe²⁺ + Fe³⁺)
  9. Didymium glass                           (Nd + Pr rare-earth f-f absorption bands)
 10. Blue-light-blocking spectacle lens       (Kodak Total Blue, after Leung 2019)
"""

from __future__ import annotations

import numpy as np
import matplotlib.pyplot as plt

H = 6.62607015e-34
C = 2.99792458e8
KB = 1.380649e-23
T = 4500.0


def planck(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    wl = wl_nm * 1e-9
    with np.errstate(over="ignore"):
        x = H * C / (wl * KB * T)
        return (2.0 * H * C**2 / wl**5) / (np.exp(x) - 1.0)


def wien_approx(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    """Wien's 1896 approximation — Planck's law without the −1."""
    wl = wl_nm * 1e-9
    x = H * C / (wl * KB * T)
    return (2.0 * H * C**2 / wl**5) * np.exp(-x)


def sodium(wl_nm: np.ndarray) -> np.ndarray:
    """Two narrow Gaussians at the sodium D-line wavelengths.

    D2 (589.0 nm) is roughly twice as bright as D1 (589.6 nm); FWHM is set to
    0.5 nm purely for plot visibility — real low-pressure sodium is much
    narrower and wouldn't render at screen resolution.
    """
    sigma = 0.5 / (2 * np.sqrt(2 * np.log(2)))
    d2 = np.exp(-0.5 * ((wl_nm - 589.0) / sigma) ** 2)
    d1 = np.exp(-0.5 * ((wl_nm - 589.6) / sigma) ** 2)
    return 2.0 * d2 + 1.0 * d1


def rgb_led(wl_nm: np.ndarray) -> np.ndarray:
    """Three Gaussians at typical RGB-LED primary wavelengths."""
    def gauss(center: float, fwhm: float, amp: float) -> np.ndarray:
        sigma = fwhm / (2 * np.sqrt(2 * np.log(2)))
        return amp * np.exp(-0.5 * ((wl_nm - center) / sigma) ** 2)

    # Tuned so the chromaticity lands roughly on a ~4500 K white point.
    return gauss(450, 22, 0.8) + gauss(530, 35, 1.0) + gauss(615, 22, 1.1)


def equal_energy(wl_nm: np.ndarray) -> np.ndarray:
    return np.ones_like(wl_nm)


def cherenkov(wl_nm: np.ndarray) -> np.ndarray:
    """Frank–Tamm: radiated intensity per unit wavelength ∝ 1/λ²."""
    return 1.0 / wl_nm**2


# Neutral-helium visible lines (air wavelengths, nm) and relative oscillator
# strengths. These are the absorption lines you see as dark notches in a
# continuum spectrum passed through a cell of cold helium gas — analogous to
# the Fraunhofer lines in sunlight. The 587.56 nm D3 line is how helium was
# discovered in the 1868 solar eclipse spectrum.
HE_LINES_NM: list[tuple[float, float]] = [
    (447.15, 0.40),
    (471.31, 0.15),
    (492.19, 0.25),
    (501.57, 0.45),
    (587.56, 0.90),  # D3 — strongest visible He line
    (667.82, 0.70),
    (706.52, 0.50),
    (728.14, 0.25),
]


def helium_absorption(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    """4500 K Planck continuum with neutral-helium absorption lines carved in.

    Each line is modelled as a Gaussian notch of FWHM 1.2 nm with depth given
    by its relative strength (1.0 = fully absorbed at line centre).
    """
    base = planck(wl_nm, T)
    fwhm = 1.2
    sigma = fwhm / (2 * np.sqrt(2 * np.log(2)))
    transmission = np.ones_like(wl_nm)
    for centre, strength in HE_LINES_NM:
        transmission -= strength * np.exp(-0.5 * ((wl_nm - centre) / sigma) ** 2)
    transmission = np.clip(transmission, 0.0, 1.0)
    return base * transmission


def iron_glass_transmission(wl_nm: np.ndarray) -> np.ndarray:
    """Transmission of thick iron-rich soda-lime glass (green bottle glass).

    Three features, all physically real:
      - UV cutoff from the Si–O electronic edge (~340 nm).
      - Fe³⁺ band in the violet/near-UV (~380–420 nm). Drags the blue
        end down and gives a yellowish cast on its own.
      - Fe²⁺ band centred in the near-IR at ~1050 nm whose tail reaches
        well into the visible red. Combined with Fe³⁺ this produces the
        characteristic bluish-green transmission window of bottle glass.
    The iron coefficients here correspond to a noticeably tinted piece —
    e.g. a thick offcut of low-grade float glass viewed edge-on.
    """
    uv_absorbance = 1.0 / (1.0 + np.exp((wl_nm - 340.0) / 10.0))
    fe3 = 0.60 * np.exp(-((wl_nm - 390.0) / 45.0) ** 2)
    fe2 = 1.20 * np.exp(-((wl_nm - 1050.0) / 250.0) ** 2)
    absorbance = np.clip(uv_absorbance + fe3 + fe2, 0.0, 1.0)
    return 1.0 - absorbance


def iron_glass_filtered(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    return planck(wl_nm, T) * iron_glass_transmission(wl_nm)


# Neutral-glass baseline transmission — two ~4% Fresnel losses from an
# uncoated surface. Used as the ceiling for the rare-earth and blue-blocker
# models so their curves don't visually pretend to have >92% transmission.
GLASS_BASELINE_T = 0.92


def didymium_transmission(wl_nm: np.ndarray) -> np.ndarray:
    """Transmission of didymium glass (Nd₂O₃ + Pr₂O₃ doped).

    The five visible f-f transition bands of Nd³⁺ and Pr³⁺ are narrow
    and well-separated, which is what gives the glass its distinctive
    sawtooth appearance. Band centres/strengths here are a stylised fit
    to Schott BG20-style didymium data; the 585 nm band is by far the
    strongest and is what makes welder's goggles and Nd wine glasses
    visibly shift yellow hues.
    """
    bands = [
        (444.0, 10.0, 0.35),
        (525.0, 8.0, 0.20),
        (585.0, 10.0, 0.70),
        (680.0, 12.0, 0.55),
        (745.0, 15.0, 0.35),
    ]
    absorbance = np.zeros_like(wl_nm)
    for centre, sigma, depth in bands:
        absorbance += depth * np.exp(-0.5 * ((wl_nm - centre) / sigma) ** 2)
    absorbance = np.clip(absorbance, 0.0, 1.0)
    return GLASS_BASELINE_T * (1.0 - absorbance)


def didymium_filtered(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    return planck(wl_nm, T) * didymium_transmission(wl_nm)


def blue_blocker_transmission(wl_nm: np.ndarray) -> np.ndarray:
    """Transmission of a Kodak-Total-Blue-style blue-light-blocking lens.

    Fit to Leung et al. (2019), "Spectral Evaluation of Eyeglass Blocking
    Efficiency of UV/HEV Blue Light for Ocular Protection":
        ~0% T at 400 nm, ~10% T at 420 nm, ~73% T at 426 nm, ≥90% T
        above 450 nm. The transition is sharper than a thermal cutoff
        because the blocking is achieved by a dielectric interference
        stack, not a bulk dye — so a tanh with a 3 nm edge width is a
        reasonable shape approximation.
    """
    edge = 0.5 * (1.0 + np.tanh((wl_nm - 424.0) / 3.0))
    return GLASS_BASELINE_T * edge


def blue_blocker_filtered(wl_nm: np.ndarray, T: float = T) -> np.ndarray:
    return planck(wl_nm, T) * blue_blocker_transmission(wl_nm)


def visible_integral(wl_nm: np.ndarray, spec: np.ndarray) -> float:
    mask = (wl_nm >= 380) & (wl_nm <= 780)
    return float(np.trapz(spec[mask], wl_nm[mask]))


def normalise_to(wl_nm: np.ndarray, spec: np.ndarray, target: float) -> np.ndarray:
    integral = visible_integral(wl_nm, spec)
    return spec * (target / integral) if integral > 0 else spec


def main() -> None:
    wl = np.linspace(380, 780, 5000)
    planck_spec = planck(wl)
    planck_int = visible_integral(wl, planck_spec)
    planck_peak_visible = planck_spec[(wl >= 380) & (wl <= 780)].max()

    panels = [
        ("Planck blackbody\nT = 4500 K (reference)", planck_spec, "black", False),
        ("Low-pressure sodium\ntwo D-lines at 589.0 / 589.6 nm", sodium(wl), "#e8a400", True),
        ("RGB LED\nGaussians at 450 / 530 / 615 nm", rgb_led(wl), "#7b3fa0", True),
        ("Equal-energy illuminant (CIE E)\nS(λ) = const", equal_energy(wl), "#2ca02c", True),
        ("Čerenkov radiation\nI(λ) ∝ 1/λ²  (Frank–Tamm)", cherenkov(wl), "#1f77b4", True),
        ("Wien's approximation (1896)\nPlanck's law without the −1", wien_approx(wl), "#8c564b", True),
        ("Helium absorption\n4500 K Planck minus neutral-He lines", helium_absorption(wl), "#c77d12", True),
        ("Iron-rich soda-lime glass\nthick green bottle glass (Fe²⁺ + Fe³⁺)", iron_glass_filtered(wl), "#386d3a", True),
        ("Didymium glass\nNd³⁺ + Pr³⁺ f-f absorption bands", didymium_filtered(wl), "#a33e8e", True),
        ("Blue-light-blocking spectacle lens\nKodak-style filter, after Leung 2019", blue_blocker_filtered(wl), "#c89e1b", True),
    ]

    fig, axes = plt.subplots(5, 2, figsize=(13, 22))
    axes = axes.ravel()

    y_cap = planck_peak_visible * 2.5

    for ax, (title, spec, color, overlay_planck) in zip(axes, panels):
        if overlay_planck:
            ax.plot(wl, planck_spec, color="gray", alpha=0.55, linewidth=1.4,
                    linestyle="--", label="Planck 4500 K")
            plotted = normalise_to(wl, spec, planck_int)
        else:
            plotted = spec

        ax.plot(wl, plotted, color=color, linewidth=2.0,
                label=title.split("\n")[0])

        ax.set_xlim(380, 780)
        ax.set_ylim(0, y_cap)
        ax.set_xlabel("Wavelength (nm)")
        ax.set_ylabel("Spectral radiance  (a.u.)")
        ax.set_title(title, fontsize=11)
        ax.grid(True, alpha=0.3)
        ax.legend(fontsize=9, loc="upper right")

    fig.suptitle(
        "Theoretical illuminant spectra vs. 4500 K Planck blackbody\n"
        "(each curve normalised to match the reference's 380–780 nm integral)",
        fontsize=13,
        y=1.00,
    )
    fig.tight_layout()
    fig.savefig("theoretical_spectra.png", dpi=150)
    print("wrote theoretical_spectra.png")


if __name__ == "__main__":
    main()
