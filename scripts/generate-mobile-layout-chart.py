from pathlib import Path

import matplotlib.pyplot as plt


WIDTHS = list(range(40, 81, 2))


def horizontal_padding(columns: int, compact_columns: int) -> int:
    if columns < compact_columns:
        return 0
    if columns >= 72:
        return 2
    return 1


def usable_width(columns: int, compact_columns: int) -> int:
    return columns - 2 * horizontal_padding(columns, compact_columns)


original = [usable_width(width, 48) for width in WIDTHS]
mobile = [usable_width(width, 56) for width in WIDTHS]

plt.style.use("default")
fig, ax = plt.subplots(figsize=(11, 6.2), dpi=180)
fig.patch.set_facecolor("#10131a")
ax.set_facecolor("#10131a")

ax.plot(
    WIDTHS,
    original,
    color="#8f9bb3",
    linewidth=2.8,
    marker="o",
    markersize=4.5,
    label="Original MiniMax Code",
)
ax.plot(
    WIDTHS,
    mobile,
    color="#55d6be",
    linewidth=3.2,
    marker="o",
    markersize=4.5,
    label="MiniMax Code Termux",
)

ax.axvspan(48, 56, color="#55d6be", alpha=0.08)
ax.annotate(
    "Termux advantage:\n+2 usable columns",
    xy=(52, usable_width(52, 56)),
    xytext=(55, 48),
    color="#55d6be",
    fontsize=10,
    fontweight="bold",
    arrowprops={"arrowstyle": "->", "color": "#55d6be", "lw": 1.5},
)

ax.set_title(
    "Phone Layout Comparison: Usable Terminal Width",
    color="#f5f7fb",
    fontsize=16,
    fontweight="bold",
    pad=18,
)
ax.text(
    0.5,
    1.02,
    "Derived from the layout breakpoints: compact mode preserves editor space earlier",
    transform=ax.transAxes,
    ha="center",
    color="#aeb8c9",
    fontsize=10,
)
ax.set_xlabel("Terminal width (columns)", color="#dce3ef", labelpad=10)
ax.set_ylabel("Usable content width (columns)", color="#dce3ef", labelpad=10)
ax.set_xlim(40, 80)
ax.set_ylim(38, 82)
ax.set_xticks(range(40, 81, 4))
ax.set_yticks(range(40, 81, 4))
ax.grid(True, color="#384151", alpha=0.55, linewidth=0.8)
ax.tick_params(colors="#c7d0df")
for spine in ax.spines.values():
    spine.set_color("#4b5669")

legend = ax.legend(
    loc="lower right",
    frameon=True,
    facecolor="#1a202b",
    edgecolor="#4b5669",
    labelcolor="#f5f7fb",
    fontsize=9,
)
for text in legend.get_texts():
    text.set_color("#f5f7fb")

fig.text(
    0.01,
    0.015,
    "At 48–55 columns, the Termux build removes standard padding while the original still reserves it.",
    color="#aeb8c9",
    fontsize=8.5,
)
fig.tight_layout(rect=(0, 0.045, 1, 0.95))

output = Path(__file__).resolve().parents[1] / "docs" / "assets" / "mobile-layout-comparison.png"
output.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(output, facecolor=fig.get_facecolor(), bbox_inches="tight")
print(output)
