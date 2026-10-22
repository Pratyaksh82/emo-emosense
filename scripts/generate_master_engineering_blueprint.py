# ==============================================================================
# Master Assembler for 30-Page EmoSense Engineering & Patent Blueprint
# Subject: Technical Architecture, Adaptive Closed-Loop, and Patent Specification
# ==============================================================================

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from master_blueprint_part1 import get_pages_part1
from master_blueprint_part2 import get_pages_part2
from master_blueprint_part3 import get_pages_part3
from master_blueprint_part4 import get_pages_part4

css_styles = """
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

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
  padding: 11mm 14mm 10mm 14mm;
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
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  margin-bottom: 10px;
}
.header-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2.5px 8px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  font-weight: 600;
}
.header-title {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
}
.header-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2.5px 7px;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-weight: 600;
}
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.8px;
  color: #64748b;
}
.page-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-subtitle {
  font-size: 9.8px;
  color: #94a3b8;
  line-height: 1.45;
  margin-bottom: 10px;
}
.card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 9px 12px;
  margin-bottom: 9px;
}
.card-glow-cyan {
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.08);
}
.card-glow-emerald {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08);
}
.card-glow-purple {
  border-color: rgba(168, 85, 247, 0.35);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.08);
}
.card-glow-amber {
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.08);
}
.card-glow-rose {
  border-color: rgba(244, 63, 94, 0.35);
  box-shadow: 0 4px 20px rgba(244, 63, 94, 0.08);
}
.kid-box {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.08) 100%);
  border: 1.5px dashed rgba(245, 158, 11, 0.45);
  border-radius: 8px;
  padding: 8px 11px;
  margin-bottom: 9px;
}
.kid-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 3px;
}
.kid-desc {
  font-size: 9.2px;
  color: #fef08a;
  line-height: 1.45;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}
.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 7px;
}
.metric-pill {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
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
  font-size: 8px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.metric-sub {
  font-size: 7px;
  color: #64748b;
  margin-top: 1px;
}
table.tech-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.2px;
  margin-top: 3px;
}
table.tech-table th {
  background: rgba(30, 41, 59, 0.85);
  color: #38bdf8;
  text-align: left;
  padding: 5px 6px;
  font-weight: 700;
  border-bottom: 1.5px solid rgba(56, 189, 248, 0.3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.8px;
  text-transform: uppercase;
}
table.tech-table td {
  padding: 4px 6px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
}
table.tech-table tr:nth-child(even) td {
  background: rgba(15, 23, 42, 0.35);
}
.highlight-green {
  color: #10b981;
  font-weight: 700;
}
.highlight-cyan {
  color: #38bdf8;
  font-weight: 700;
}
.highlight-amber {
  color: #f59e0b;
  font-weight: 700;
}
.highlight-rose {
  color: #f43f5e;
  font-weight: 700;
}
.code-block {
  background: #020617;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 7px 9px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.2px;
  color: #38bdf8;
  line-height: 1.4;
  white-space: pre;
}
</style>
"""

def generate_master_blueprint_html():
    p1 = get_pages_part1()
    p2 = get_pages_part2()
    p3 = get_pages_part3()
    p4 = get_pages_part4()
    all_pages = p1 + p2 + p3 + p4

    print(f"📊 Total pages collected: {len(all_pages)}")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EmoSense Master Engineering Architecture & Patent Defense Blueprint</title>
  {css_styles}
</head>
<body>
{''.join(all_pages)}
</body>
</html>
"""

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'dist')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'master_engineering_blueprint.html')

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✅ Master HTML generated at: {out_file}")
    print(f"📁 Size: {len(html)} bytes")
    return out_file

if __name__ == '__main__':
    generate_master_blueprint_html()
