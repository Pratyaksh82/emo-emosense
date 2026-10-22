# -*- coding: utf-8 -*-
"""
Direct 24-page HTML assembler for Chetana Elevation Blueprint.
Reads raw page HTML chunks directly, avoiding Python f-string brace syntax issues.
"""

import os
import re
from blueprint_builder import get_css, make_header, make_footer
from blueprint_retro_pages import get_retro_pages

# Load old p3 to p20 from make_20page_html.py as raw text chunks
with open("scripts/make_20page_html.py", "r", encoding="utf-8") as f:
    raw_text = f.read()

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

# Get Section I: Retrospectives & Comparative Study (Pages 1 to 6)
pages = get_retro_pages()
print(f"Loaded {len(pages)} retrospective & comparative study pages (Pages 1 to 6).")

# Extract Pages 7 to 24 from raw_text
for old_idx in range(3, 21):
    new_idx = old_idx + 4
    start_tag = f"# PAGE {old_idx}:"
    if old_idx == 20:
        end_tag = "pages.append(p20)"
    else:
        end_tag = f"# PAGE {old_idx+1}:"

    idx_start = raw_text.find(start_tag)
    idx_end = raw_text.find(end_tag, idx_start)

    chunk = raw_text[idx_start:idx_end]

    # Extract the HTML content between `pX = f"""` and `"""\npages.append`
    m_html = re.search(r'p\d+\s*=\s*f?"""(.*?)"""', chunk, re.DOTALL)
    if not m_html:
        raise ValueError(f"Could not extract HTML for old page {old_idx}")
    page_html = m_html.group(1)

    # Evaluate make_header calls inside page_html
    def replace_header(m):
        args = m.group(1)
        # Safely evaluate make_header call
        return eval(f"make_header({args})")
    page_html = re.sub(r'\{make_header\((.*?)\)\}', replace_header, page_html, flags=re.DOTALL)

    # Replace footer with new page number and title
    title = footer_titles[new_idx]
    footer_html = make_footer(new_idx, 24, title)
    page_html = re.sub(r'\{make_footer\(.*?\)\}', lambda _: footer_html, page_html)

    pages.append(page_html.strip())
    print(f"Extracted Page {new_idx} (from old P{old_idx}) - {title}")

print(f"Total Pages Assembled: {len(pages)}")

# Write to output files
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>C.H.E.T.A.N.A. Engineering Elevation &amp; Historical Retrospective Blueprint (24 Pages)</title>
  <style>
{get_css()}
  </style>
</head>
<body>
{"".join(pages)}
</body>
</html>
"""

out1 = r"c:\Users\praty\Desktop\2d model\dist\chetana_elevation_blueprint.html"
out2 = r"c:\Users\praty\Desktop\2d model\dist\chetana_24page_blueprint.html"

os.makedirs(r"c:\Users\praty\Desktop\2d model\dist", exist_ok=True)
with open(out1, "w", encoding="utf-8") as f:
    f.write(full_html)
with open(out2, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"Wrote HTML successfully to {out1} ({len(full_html)} bytes)!")
