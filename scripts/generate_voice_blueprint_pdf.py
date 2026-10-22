# ==============================================================================
# Master Assembler: EmoSense Voice Engineering & Patent Blueprint
# Assembles 12 Dense Pages into HTML for Puppeteer Rendering
# ==============================================================================

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from voice_blueprint_pages_part1 import get_pages_part1
from voice_blueprint_pages_part2 import get_pages_part2
from voice_blueprint_pages_part3 import get_pages_part3

css_styles = """
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@page {
  size: A4 portrait;
  margin: 0;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #060913;
  color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 10mm 13mm 9mm 13mm;
  page-break-after: always;
  page-break-inside: avoid;
  position: relative;
  background: #070a14 radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08) 0%, rgba(7, 10, 20, 1) 70%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  margin-bottom: 8px;
}
.header-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  font-weight: 600;
}
.header-title {
  font-size: 8.5px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.4px;
}
.header-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-weight: 600;
}
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 5px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5px;
  color: #64748b;
}
.page-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #ffffff;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-subtitle {
  font-size: 8.5px;
  color: #94a3b8;
  margin-bottom: 8px;
  line-height: 1.4;
}
.card {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 7px;
}
.card-glow-cyan {
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.06);
}
.card-glow-emerald {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.06);
}
.card-glow-violet {
  border-color: rgba(192, 132, 252, 0.35);
  box-shadow: 0 0 15px rgba(192, 132, 252, 0.06);
}
.card-glow-amber {
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.06);
}
.card-glow-rose {
  border-color: rgba(244, 63, 94, 0.35);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.06);
}
.card-title {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}
.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.metric-pill {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 5px;
  padding: 6px 8px;
  text-align: center;
}
.metric-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2px;
}
.metric-label {
  font-size: 7.5px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.metric-sub {
  font-size: 6.8px;
  color: #64748b;
  margin-top: 1px;
}
.tech-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7.8px;
  margin-top: 3px;
}
.tech-table th {
  background: rgba(30, 41, 59, 0.8);
  color: #38bdf8;
  font-weight: 700;
  text-align: left;
  padding: 4px 6px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.2px;
}
.tech-table td {
  padding: 4px 6px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  line-height: 1.35;
}
.tech-table tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.4);
}
.code-box {
  background: #030712;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 4px;
  padding: 5px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.2px;
  color: #a5f3fc;
  line-height: 1.4;
  overflow: hidden;
}
.math-block {
  background: rgba(2, 6, 23, 0.7);
  border-left: 2.5px solid #38bdf8;
  padding: 4px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5px;
  color: #e0f2fe;
  margin: 3px 0;
  line-height: 1.45;
}
.badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7px;
  font-weight: 600;
  padding: 1.5px 5px;
  border-radius: 3px;
  margin-right: 4px;
}
.badge-cyan { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
.badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-purple { background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }
.badge-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
</style>
"""

def generate_blueprint_html():
    print("Collecting all 12 Master Blueprint pages...", flush=True)
    all_pages = []
    all_pages.extend(get_pages_part1()) # Pages 1 to 4
    all_pages.extend(get_pages_part2()) # Pages 5 to 8
    all_pages.extend(get_pages_part3()) # Pages 9 to 12
    print(f"Total pages collected: {len(all_pages)}", flush=True)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EmoSense: Adaptive Voice Engine & Closed-Loop Acoustic Entrainment Blueprint</title>
  {css_styles}
</head>
<body>
  {"".join(all_pages)}
</body>
</html>
"""
    out_dir = r"c:\Users\praty\Desktop\2d model\dist"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "voice_master_engineering_blueprint.html")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Master Blueprint HTML generated successfully: {out_file} ({os.path.getsize(out_file):,} bytes)", flush=True)
    return out_file

if __name__ == "__main__":
    generate_blueprint_html()
