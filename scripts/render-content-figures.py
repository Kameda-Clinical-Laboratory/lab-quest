#!/usr/bin/env python3
"""Render educational diagrams for LAB QUEST (parchment / teal / gold)."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle
import numpy as np
from matplotlib import font_manager

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "art" / "figures"

FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
font_manager.fontManager.addfont(FONT)
FONT_NAME = font_manager.FontProperties(fname=FONT).get_name()

BG = "#F7F0DE"
INK = "#143532"
TEAL = "#1A7A6D"
TEAL_D = "#0F4F46"
GOLD = "#C9A24A"
GOLD_D = "#8B6914"
RED = "#C0392B"
BLUE = "#1A5FB4"
MUTED = "#5C6B68"
WHITE = "#FFFaf0"
PANEL = "#FFF8EA"

plt.rcParams.update(
    {
        "font.family": FONT_NAME,
        "text.color": INK,
        "axes.labelcolor": INK,
        "axes.edgecolor": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "figure.facecolor": BG,
        "axes.facecolor": PANEL,
        "axes.titleweight": "bold",
        "axes.titlesize": 13,
        "axes.labelsize": 11,
        "savefig.facecolor": BG,
        "savefig.edgecolor": BG,
        "axes.unicode_minus": False,
    }
)


def save(fig: plt.Figure, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    fig.tight_layout()
    fig.savefig(path, dpi=160, bbox_inches="tight", pad_inches=0.25)
    plt.close(fig)
    print(f"wrote {path.relative_to(ROOT)}")


def dart_board(ax, title: str, xs, ys, bull=(0, 0)):
    ax.set_aspect("equal")
    ax.set_xlim(-1.25, 1.25)
    ax.set_ylim(-1.25, 1.25)
    ax.axis("off")
    for r, c in [(1.15, "#E8D9A8"), (0.85, "#F3E6C4"), (0.5, "#E4F0EC"), (0.18, GOLD)]:
        ax.add_patch(Circle((0, 0), r, facecolor=c, edgecolor=TEAL_D, linewidth=1.1, zorder=0))
    ax.plot([-1.2, 1.2], [0, 0], color=TEAL, lw=0.6, alpha=0.5)
    ax.plot([0, 0], [-1.2, 1.2], color=TEAL, lw=0.6, alpha=0.5)
    ax.scatter(xs, ys, s=42, c=TEAL_D, zorder=3, edgecolors="white", linewidths=0.6)
    ax.scatter([bull[0]], [bull[1]], s=18, c=RED, zorder=4, marker="x", linewidths=1.4)
    ax.set_title(title, pad=8)


def fig_accuracy_precision() -> None:
    rng = np.random.default_rng(7)
    fig, axes = plt.subplots(2, 2, figsize=(8.4, 8.4))
    fig.suptitle("正確さ（trueness）と精密さ（precision）", fontsize=16, color=TEAL_D, y=0.98)
    dart_board(axes[0, 0], "① 正確かつ精密", rng.normal(0, 0.07, 12), rng.normal(0, 0.07, 12))
    dart_board(axes[0, 1], "② 精密だが不正確", rng.normal(0.55, 0.07, 12), rng.normal(0.45, 0.07, 12))
    dart_board(axes[1, 0], "③ 正確だが精密でない", rng.normal(0, 0.38, 12), rng.normal(0, 0.38, 12))
    dart_board(axes[1, 1], "④ 不正確かつ不精密", rng.normal(0.45, 0.38, 12), rng.normal(-0.4, 0.38, 12))
    fig.text(0.5, 0.02, "中心の× = 真の値。点が中心に近いか（正確さ）と、点が互いに近いか（精密さ）は別の概念。", ha="center", fontsize=10, color=MUTED)
    save(fig, "accuracy-precision.png")


def _lj_base(ax, title: str):
    x = np.arange(1, 21)
    ax.axhline(0, color=INK, lw=1.2)
    for sd, ls, c in [(1, "--", TEAL), (2, "--", GOLD_D), (3, ":", RED)]:
        ax.axhline(sd, color=c, ls=ls, lw=0.9)
        ax.axhline(-sd, color=c, ls=ls, lw=0.9)
    ax.set_xlim(0.5, 20.5)
    ax.set_ylim(-4.2, 4.2)
    ax.set_xlabel("測定回数（日）")
    ax.set_ylabel("平均値からのずれ（SD）")
    ax.set_yticks([-3, -2, -1, 0, 1, 2, 3], ["−3SD", "−2SD", "−1SD", "平均", "+1SD", "+2SD", "+3SD"])
    ax.set_title(title)
    ax.grid(axis="x", alpha=0.15)
    return x


def fig_levy_jennings() -> None:
    rng = np.random.default_rng(3)
    fig, axes = plt.subplots(3, 1, figsize=(9.2, 9.6), sharex=True)
    fig.suptitle("Levey-Jennings 管理図の3パターン", fontsize=16, color=TEAL_D)
    x = _lj_base(axes[0], "① 管理内で安定")
    y = rng.normal(0, 0.55, 20)
    y = np.clip(y, -1.6, 1.6)
    axes[0].plot(x, y, "-o", color=TEAL, ms=5)
    x = _lj_base(axes[1], "② シフト（ある時点から急に一段ずれる）")
    y = np.concatenate([rng.normal(0, 0.4, 8), rng.normal(1.7, 0.35, 12)])
    axes[1].plot(x, y, "-o", color=TEAL, ms=5)
    axes[1].axvline(8.5, color=RED, ls=":", lw=1.2)
    axes[1].text(8.7, 3.4, "試薬ロット交換など", color=RED, fontsize=9)
    x = _lj_base(axes[2], "③ トレンド（徐々に一方向へずれ続ける）")
    y = rng.normal(0, 0.25, 20) + np.linspace(-0.2, 2.4, 20)
    axes[2].plot(x, y, "-o", color=TEAL, ms=5)
    save(fig, "levy-jennings.png")


def _box(ax, xy, w, h, text, fc=PANEL, ec=TEAL, fs=10):
    x, y = xy
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08", facecolor=fc, edgecolor=ec, linewidth=1.4))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs, color=INK, wrap=True)


def fig_westgard() -> None:
    fig, ax = plt.subplots(figsize=(9.0, 10.2))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 12)
    ax.axis("off")
    ax.set_title("Westgard マルチルールの判定の流れ", fontsize=16, color=TEAL_D, pad=16)
    _box(ax, (2.4, 10.4), 5.2, 1.0, "QC結果を管理図にプロット", fc="#E4F0EC")
    ax.annotate("", xy=(5, 9.85), xytext=(5, 10.4), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    _box(ax, (2.4, 8.55), 5.2, 1.15, "1-2s（1点が±2SDを超える）\n→ 警告ルール。これだけでは棄却しない", fc="#FFF3D6", ec=GOLD_D)
    ax.annotate("", xy=(5, 8.0), xytext=(5, 8.55), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    _box(ax, (1.3, 6.35), 7.4, 1.5, "棄却ルールを確認する\n1-3s　／　2-2s　／　R-4s　／　4-1s　／　10x", fc="#FDECEC", ec=RED)
    ax.annotate("", xy=(2.6, 5.55), xytext=(3.6, 6.35), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    ax.annotate("", xy=(7.4, 5.55), xytext=(6.4, 6.35), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    _box(ax, (0.4, 4.15), 4.4, 1.25, "どれかに抵触\n→ 管理外れ。測定を止め原因調査", fc="#FDECEC", ec=RED)
    _box(ax, (5.2, 4.15), 4.4, 1.25, "どれにも抵触しない\n→ 管理内。報告を続行してよい", fc="#E4F0EC", ec=TEAL)
    ax.text(5, 3.2, "1-2s は「よく見る」きっかけ。棄却は 1-3s / 2-2s / R-4s など。", ha="center", fontsize=10, color=MUTED)
    ax.text(5, 2.5, "シフト・トレンドの見分けは管理図の形で行う（別図）。", ha="center", fontsize=10, color=MUTED)
    save(fig, "westgard-flow.png")


def fig_traceability() -> None:
    fig, ax = plt.subplots(figsize=(8.6, 7.4))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("トレーサビリティ連鎖（階層のイメージ）", fontsize=16, color=TEAL_D, pad=12)
    layers = [
        (3.4, 6.35, 3.2, 1.05, "一次標準物質", "#D9EFEA"),
        (2.6, 4.95, 4.8, 1.05, "二次標準物質", "#E4F0EC"),
        (1.8, 3.55, 6.4, 1.05, "常用標準物質・認証標準物質（CRM）", "#FFF3D6"),
        (0.9, 2.15, 8.2, 1.05, "日常検査（キャリブレーター → 患者検体）", "#F7F0DE"),
    ]
    for x, y, w, h, label, fc in layers:
        _box(ax, (x, y), w, h, label, fc=fc, fs=12)
        if y < 6.3:
            ax.annotate("", xy=(5, y + h + 0.08), xytext=(5, y + h + 0.28), arrowprops=dict(arrowstyle="->", color=GOLD_D, lw=1.3))
    ax.text(5, 1.35, "上へ行くほど「真の値」に近い。日常の値は、この鎖をたどって標準につながる。", ha="center", fontsize=10, color=MUTED)
    ax.text(5, 0.7, "CRM は段階のどこにも位置しうる。施設の校正が鎖のどこに乗っているかを意識する。", ha="center", fontsize=10, color=MUTED)
    save(fig, "traceability.png")


def fig_order_of_draw() -> None:
    fig, ax = plt.subplots(figsize=(10.2, 4.8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 5)
    ax.axis("off")
    ax.set_title("推奨される採取順序（キャリーオーバーを最小にする並び）", fontsize=15, color=TEAL_D, pad=10)
    items = [
        ("1", "血液培養", "#C9A24A"),
        ("2", "凝固\n（クエン酸Na）", "#5B8FA8"),
        ("3", "血清\n（プレーン・分離剤）", "#C0392B"),
        ("4", "ヘパリン", "#2E8B57"),
        ("5", "EDTA", "#6B3FA0"),
        ("6", "解糖阻止\n（NaF）", "#6B7280"),
    ]
    for i, (num, label, color) in enumerate(items):
        x = 0.55 + i * 1.9
        ax.add_patch(Circle((x + 0.7, 2.85), 0.55, facecolor=color, edgecolor=INK, lw=1.2))
        ax.text(x + 0.7, 2.85, num, ha="center", va="center", color="white", fontsize=16, fontweight="bold")
        ax.text(x + 0.7, 1.55, label, ha="center", va="center", fontsize=10)
        if i < len(items) - 1:
            ax.annotate("", xy=(x + 1.55, 2.85), xytext=(x + 1.15, 2.85), arrowprops=dict(arrowstyle="->", color=GOLD_D, lw=1.6))
    ax.text(6, 0.45, "添加剤の影響を受けやすい検査ほど先に採る。実際のキャップ色は施設・メーカーで異なる。", ha="center", fontsize=10, color=MUTED)
    save(fig, "order-of-draw.png")


def fig_sandwich_competitive() -> None:
    fig, axes = plt.subplots(1, 2, figsize=(10.4, 5.6))
    fig.suptitle("サンドイッチ法（非競合）と競合法", fontsize=16, color=TEAL_D)

    def draw_ab(ax, x, y, color, label):
        ax.add_patch(mpatches.FancyBboxPatch((x - 0.35, y), 0.7, 0.22, boxstyle="round,pad=0.01", fc=color, ec=INK, lw=0.8))
        ax.text(x, y - 0.22, label, ha="center", fontsize=8, color=MUTED)

    for ax, title in zip(axes, ["サンドイッチ法", "競合法"]):
        ax.set_xlim(0, 6)
        ax.set_ylim(0, 6)
        ax.axis("off")
        ax.set_title(title)
        ax.plot([0.6, 5.4], [1.3, 1.3], color=INK, lw=6, solid_capstyle="round")
        ax.text(3, 0.7, "固相（プレート / 磁性ビーズ）", ha="center", fontsize=9, color=MUTED)

    ax = axes[0]
    draw_ab(ax, 1.6, 1.45, TEAL, "捕捉抗体")
    draw_ab(ax, 3.0, 1.45, TEAL, "捕捉抗体")
    draw_ab(ax, 4.4, 1.45, TEAL, "捕捉抗体")
    for x in (1.6, 3.0, 4.4):
        ax.add_patch(Circle((x, 2.15), 0.22, fc=GOLD, ec=INK, lw=0.8))
        ax.text(x, 2.15, "Ag", ha="center", va="center", fontsize=8)
        ax.add_patch(mpatches.FancyBboxPatch((x - 0.28, 2.45), 0.56, 0.2, boxstyle="round,pad=0.01", fc=RED, ec=INK, lw=0.8))
        ax.text(x, 2.95, "標識抗体", ha="center", fontsize=8, color=MUTED)
    ax.text(3, 4.6, "抗原が多いほど\n標識がたくさん乗る → 信号↑", ha="center", fontsize=11)

    ax = axes[1]
    draw_ab(ax, 2.0, 1.45, TEAL, "抗体")
    draw_ab(ax, 4.0, 1.45, TEAL, "抗体")
    ax.add_patch(Circle((2.0, 2.15), 0.22, fc=GOLD, ec=INK, lw=0.8))
    ax.text(2.0, 2.15, "Ag", ha="center", va="center", fontsize=8)
    ax.add_patch(Circle((4.0, 2.15), 0.22, fc=RED, ec=INK, lw=0.8))
    ax.text(4.0, 2.15, "標識", ha="center", va="center", fontsize=7, color="white")
    ax.text(3, 4.6, "検体の抗原が多いほど\n標識抗原が乗れない → 信号↓", ha="center", fontsize=11)
    save(fig, "sandwich-competitive.png")


def fig_hook_effect() -> None:
    fig, ax = plt.subplots(figsize=(8.6, 5.4))
    conc = np.logspace(0, 4, 200)
    # rise then hook down
    signal = (conc / (80 + conc)) * 100
    hook = 1 / (1 + (conc / 2500) ** 2.4)
    y = signal * hook * (1 + 0.05 * np.sin(np.log10(conc) * 3))
    ax.plot(conc, y, color=TEAL, lw=2.4)
    ax.axvspan(20, 400, color="#E4F0EC", alpha=0.8, label="測定範囲（例）")
    ax.annotate("フック効果\n（抗原過剰で見かけ低値）", xy=(6000, 18), xytext=(900, 55),
                arrowprops=dict(arrowstyle="->", color=RED), color=RED, fontsize=10)
    ax.set_xscale("log")
    ax.set_xlabel("抗原濃度（模式・対数）")
    ax.set_ylabel("測定信号")
    ax.set_title("フック効果（プロゾーン）のイメージ", color=TEAL_D)
    ax.legend(frameon=False, loc="upper left")
    ax.set_ylim(0, 110)
    save(fig, "hook-effect.png")


def fig_immuno_chromatography() -> None:
    fig, ax = plt.subplots(figsize=(10.0, 5.2))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6)
    ax.axis("off")
    ax.set_title("イムノクロマトグラフィ（模式）", fontsize=16, color=TEAL_D, pad=10)
    ax.add_patch(FancyBboxPatch((0.6, 2.4), 10.8, 1.5, boxstyle="round,pad=0.02", fc="#F3E6C4", ec=INK, lw=1.3))
    regions = [
        (0.8, "検体パッド\n滴下"),
        (3.1, "標識抗体\n（コンジュゲート）"),
        (5.6, "テストライン\n（捕捉抗体）"),
        (8.1, "コントロール\nライン"),
        (10.2, "吸収パッド"),
    ]
    for x, label in regions:
        ax.text(x, 1.7, label, ha="center", va="top", fontsize=9)
    ax.annotate("", xy=(11.1, 3.15), xytext=(1.0, 3.15), arrowprops=dict(arrowstyle="->", color=TEAL, lw=2.0))
    ax.plot([6.05, 6.05], [2.5, 3.75], color=RED, lw=5)
    ax.plot([8.55, 8.55], [2.5, 3.75], color=TEAL_D, lw=5)
    ax.text(6.05, 3.95, "T", ha="center", color=RED, fontsize=12, fontweight="bold")
    ax.text(8.55, 3.95, "C", ha="center", color=TEAL_D, fontsize=12, fontweight="bold")
    ax.text(6, 0.55, "判定: Cが出て初めて有効。Tの有無で陽性/陰性。Cが出ないストリップは無効。", ha="center", fontsize=10, color=MUTED)
    save(fig, "immunochromatography.png")


def fig_anion_gap() -> None:
    fig, ax = plt.subplots(figsize=(8.2, 5.8))
    cats = ["陽イオン側", "陰イオン側"]
    # stacked: Na vs Cl + HCO3 + AG
    ax.bar(0, 140, width=0.55, color=TEAL, label="Na+")
    ax.bar(1, 100, width=0.55, color="#5B8FA8", label="Cl-")
    ax.bar(1, 24, width=0.55, bottom=100, color=GOLD, label="HCO3-")
    ax.bar(1, 16, width=0.55, bottom=124, color=RED, label="その他の陰イオン = AG")
    ax.set_xticks([0, 1], cats)
    ax.set_ylabel("模式的な濃度（mEq/L イメージ）")
    ax.set_title("アニオンギャップの考え方", color=TEAL_D)
    ax.legend(frameon=False, loc="upper right")
    ax.set_ylim(0, 170)
    ax.text(0.5, -18, "AG ≒ Na+ − (Cl- + HCO3-)。数値や基準範囲は施設差がある。", ha="center", fontsize=10, color=MUTED)
    save(fig, "anion-gap.png")


def fig_delta_check() -> None:
    fig, ax = plt.subplots(figsize=(8.8, 5.2))
    t = np.array([1, 2, 3, 4, 5, 6])
    y = np.array([0.82, 0.88, 0.85, 0.90, 0.87, 4.9])
    ax.plot(t[:-1], y[:-1], "-o", color=TEAL, lw=2, ms=7)
    ax.plot(t[-2:], y[-2:], "-o", color=RED, lw=2, ms=8)
    ax.axhspan(0.5, 1.2, color="#E4F0EC", alpha=0.5)
    ax.annotate("直近だけが大きく外れる\n（取り違え・急変・測定異常を疑う）", xy=(6, 4.9), xytext=(3.1, 3.6),
                arrowprops=dict(arrowstyle="->", color=RED), color=RED, fontsize=10)
    ax.set_xticks(t, ["3か月前", "2か月前", "1か月前", "2週前", "前回", "今回"])
    ax.set_ylabel("クレアチニン（模式）")
    ax.set_title("デルタチェックのイメージ", color=TEAL_D)
    ax.set_ylim(0, 6.2)
    save(fig, "delta-check.png")


def fig_analysis_flow() -> None:
    fig, ax = plt.subplots(figsize=(8.6, 9.4))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 12)
    ax.axis("off")
    ax.set_title("分析的異常の切り分け（装置 → 試薬 → 検体 → 患者）", fontsize=14, color=TEAL_D, pad=12)
    steps = [
        (9.6, "1. 装置\n校正・エラーフラグ・メンテナンス記録"),
        (7.7, "2. 試薬\nロット・期限・開封後安定性"),
        (5.8, "3. 検体\n性状・取り違え・採取条件"),
        (3.9, "4. 患者\n病態・薬剤・生理的変動"),
    ]
    for y, text in steps:
        _box(ax, (1.6, y - 0.55), 6.8, 1.35, text, fc="#E4F0EC", fs=12)
    for y in (9.05, 7.15, 5.25):
        ax.annotate("", xy=(5, y - 0.55), xytext=(5, y), arrowprops=dict(arrowstyle="->", color=GOLD_D, lw=1.5))
        ax.text(8.55, y - 0.15, "問題なし", fontsize=8, color=MUTED)
    ax.text(5, 2.55, "各段階で「問題あり」ならそこで是正。全部クリアして初めて病態として報告する。", ha="center", fontsize=10, color=MUTED)
    ax.text(5, 1.85, "報告書には、切り分けの結論（分析側 / 検体側 / 患者側）を残す。", ha="center", fontsize=10, color=MUTED)
    save(fig, "analysis-flow.png")


def fig_ogtt() -> None:
    fig, ax = plt.subplots(figsize=(8.8, 5.4))
    t = np.array([0, 30, 60, 90, 120])
    normal = np.array([90, 145, 130, 110, 95])
    diabetic = np.array([140, 230, 250, 235, 220])
    ax.plot(t, normal, "-o", color=TEAL, lw=2, label="正常型の例")
    ax.plot(t, diabetic, "-o", color=RED, lw=2, label="糖尿病型の例")
    ax.axhline(200, color=GOLD_D, ls="--", lw=1.1, label="2時間値 200 mg/dL（診断の目安）")
    ax.set_xticks(t, ["0分\n（空腹時）", "30分", "60分", "90分", "120分"])
    ax.set_ylabel("血糖（mg/dL）")
    ax.set_title("75gOGTT の採血タイミング", color=TEAL_D)
    ax.legend(frameon=False)
    ax.set_ylim(50, 280)
    ax.text(60, 58, "判定は空腹時・2時間値などが基準。数値は施設の手順と最新の診断基準を優先。", ha="center", fontsize=9, color=MUTED)
    save(fig, "ogtt-timeline.png")


def fig_probnp() -> None:
    fig, ax = plt.subplots(figsize=(9.4, 4.8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 5)
    ax.axis("off")
    ax.set_title("proBNP の切断と BNP / NT-proBNP", fontsize=15, color=TEAL_D, pad=8)
    _box(ax, (0.4, 2.1), 2.6, 1.4, "心室の負荷\n→ proBNP 合成", fc="#E4F0EC", fs=11)
    ax.annotate("", xy=(3.5, 2.8), xytext=(3.05, 2.8), arrowprops=dict(arrowstyle="->", color=GOLD_D, lw=1.6))
    _box(ax, (3.5, 2.1), 2.5, 1.4, "proBNP", fc="#FFF3D6", fs=12)
    ax.annotate("", xy=(6.6, 3.35), xytext=(6.05, 3.05), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    ax.annotate("", xy=(6.6, 2.25), xytext=(6.05, 2.55), arrowprops=dict(arrowstyle="->", color=TEAL_D, lw=1.4))
    _box(ax, (6.6, 3.05), 4.6, 1.15, "活性型 BNP（ホルモンとして働く）", fc="#E4F0EC", fs=11)
    _box(ax, (6.6, 1.55), 4.6, 1.15, "NT-proBNP（不活性。安定して測りやすい）", fc="#FDECEC", fs=11)
    ax.text(6, 0.55, "どちらを追うかは施設の採用項目による。採血管・安定性も異なる。", ha="center", fontsize=10, color=MUTED)
    save(fig, "probnp-cleavage.png")


def fig_sop_hierarchy() -> None:
    fig, ax = plt.subplots(figsize=(8.4, 6.6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("標準作業書の階層（方針 → 手順 → 記録）", fontsize=15, color=TEAL_D, pad=10)
    layers = [
        (2.4, 5.9, 5.2, 1.15, "方針（品質方針・精度確保の枠組み）", "#D9EFEA"),
        (1.6, 4.2, 6.8, 1.15, "手順（測定SOP・機器保守SOP）", "#E4F0EC"),
        (0.8, 2.5, 8.4, 1.15, "記録様式（作業日誌・台帳・点検表）", "#FFF3D6"),
    ]
    for x, y, w, h, label, fc in layers:
        _box(ax, (x, y), w, h, label, fc=fc, fs=12)
    ax.text(5, 1.55, "上位が「何をするか」、下位が「どう残すか」。現場のやり方が手順と違うときは手順を正す。", ha="center", fontsize=10, color=MUTED)
    save(fig, "sop-hierarchy.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fig_accuracy_precision()
    fig_levy_jennings()
    fig_westgard()
    fig_traceability()
    fig_order_of_draw()
    fig_sandwich_competitive()
    fig_hook_effect()
    fig_immuno_chromatography()
    fig_anion_gap()
    fig_delta_check()
    fig_analysis_flow()
    fig_ogtt()
    fig_probnp()
    fig_sop_hierarchy()


if __name__ == "__main__":
    main()
