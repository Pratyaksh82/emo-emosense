# -*- coding: utf-8 -*-
"""
Script to transform Old P3..P20 from make_20page_html.py into New P7..P24 for blueprint_squad_pages.py.
"""

import re

footer_titles = {
    7: "PART 1: GRAPHICS & KINEMATICS",
    8: "PART 1: NORMAL MAPPING & CEL SHADING",
    9: "PART 1: Z-DEPTH AFFINE FORESHORTENING",
    10: "PART 1: ASYMMETRIC ACTING PRINCIPLES",
    11: "PART 1: IRIS OPTICS & SECONDARY PHYSICS",
    12: "PART 1: BENCHMARKS & SPRINT ROADMAP",
    13: "PART 2: AUDIO & EMOTIONAL DSP",
    14: "PART 2: ACOUSTIC EMOTION RECOGNITION",
    15: "PART 2: CONVERSATIONAL BARGE-IN",
    16: "PART 2: DUAL-FORMANT VISEME LIP-SYNC",
    17: "PART 2: AUTONOMIC ENTRAINMENT",
    18: "PART 2: BENCHMARKS & SPRINT ROADMAP",
    19: "PART 3: ENTERPRISE ARCHITECTURE",
    20: "PART 3: EVENT BRIDGE & OBSIDIAN UI",
    21: "PART 3: CLINICAL TELEHEALTH STUDIO",
    22: "PART 3: OFFLINE ASSETS & HIPAA PRIVACY",
    23: "PART 3: PRODUCTION RESILIENCE & CI",
    24: "CROSS-SQUAD EXECUTION & SIGN-OFF"
}

with open("scripts/make_20page_html.py", "r", encoding="utf-8") as f:
    text = f.read()

squad_lines = [
    "# -*- coding: utf-8 -*-",
    '"""',
    "Chetana 24-Page Elevation Blueprint - Section II, III, IV: Squad Deliverables (Pages 7 to 24).",
    "Pure vector CSS styling: zero backdrop-filter, zero raster blurs, instant rendering.",
    '"""',
    "",
    "from blueprint_builder import make_header, make_footer",
    "",
    "def get_squad_pages():",
    "    pages = []"
]

for old_idx in range(3, 21):
    new_idx = old_idx + 4
    start_tag = f"# PAGE {old_idx}:"
    if old_idx == 20:
        end_tag = "pages.append(p20)"
    else:
        end_tag = f"# PAGE {old_idx+1}:"

    idx_start = text.find(start_tag)
    idx_end = text.find(end_tag, idx_start)
    if old_idx == 20:
        idx_end += len("pages.append(p20)")

    chunk = text[idx_start:idx_end]

    title = footer_titles[new_idx]
    chunk = chunk.replace(f"make_footer({old_idx}, 20)", f'make_footer({new_idx}, 24, "{title}")')
    chunk = chunk.replace(f"p{old_idx} = f\"\"\"", f"p{new_idx} = f\"\"\"")
    chunk = chunk.replace(f"pages.append(p{old_idx})", f"pages.append(p{new_idx})")

    squad_lines.append("")
    squad_lines.append("    # " + "=" * 74)
    squad_lines.append(f"    # PAGE {new_idx}: (Transformed from Old P{old_idx})")
    squad_lines.append("    # " + "=" * 74)

    for line in chunk.split("\n"):
        if line.startswith("# PAGE"):
            continue
        squad_lines.append("    " + line)

squad_lines.append("")
squad_lines.append("    return pages")
squad_lines.append("")

with open("scripts/blueprint_squad_pages.py", "w", encoding="utf-8") as out:
    out.write("\n".join(squad_lines))

print("Successfully written blueprint_squad_pages.py!")
