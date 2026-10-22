# ==============================================================================
# Master HTML Generator for 34-Page Performance Whitepaper
# Subject: Will the Chetana 2D Humanoid Avatar Slow Down the EmoSense Main Project?
# ==============================================================================

import os
import base64

def get_base64_img(rel_path):
    p = os.path.join(os.path.dirname(__file__), '..', rel_path)
    if os.path.exists(p):
        with open(p, 'rb') as f:
            encoded = base64.b64encode(f.read()).decode('utf-8')
            ext = 'jpeg' if rel_path.endswith('.jpg') else 'png'
            return f"data:image/{ext};base64,{encoded}"
    return ""

img_happy = get_base64_img('dist/report_assets/happy.jpg')
img_calm = get_base64_img('dist/report_assets/calm.jpg')
img_namaste = get_base64_img('dist/report_assets/namaste.jpg')
img_wave = get_base64_img('dist/report_assets/wave.jpg')
img_lipsync = get_base64_img('dist/report_assets/lipsync.jpg')

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
  padding: 12mm 15mm 11mm 15mm;
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
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  margin-bottom: 11px;
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
  font-size: 9.5px;
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
  padding-top: 7px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #64748b;
}
.page-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-title-gradient {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.page-subtitle {
  font-size: 10.5px;
  color: #94a3b8;
  line-height: 1.45;
  margin-bottom: 12px;
}
.card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
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
  padding: 9px 12px;
  margin-bottom: 10px;
}
.kid-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 4px;
}
.kid-desc {
  font-size: 9.8px;
  color: #fef08a;
  line-height: 1.45;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
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
  padding: 7px 9px;
  text-align: center;
}
.metric-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2px;
}
.metric-label {
  font-size: 8.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.metric-sub {
  font-size: 7.5px;
  color: #64748b;
  margin-top: 1px;
}
table.tech-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.8px;
  margin-top: 4px;
}
table.tech-table th {
  background: rgba(30, 41, 59, 0.85);
  color: #38bdf8;
  text-align: left;
  padding: 6px 7px;
  font-weight: 700;
  border-bottom: 1.5px solid rgba(56, 189, 248, 0.3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.2px;
  text-transform: uppercase;
}
table.tech-table td {
  padding: 5px 7px;
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
.badge-green {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 1.5px 5px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  display: inline-block;
}
.badge-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.35);
  padding: 1.5px 5px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  display: inline-block;
}
.badge-cyan {
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 1.5px 5px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  display: inline-block;
}
.code-block {
  background: #020617;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 7px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #e2e8f0;
  line-height: 1.4;
  overflow: hidden;
  margin-top: 4px;
}
.bar-track {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  height: 8px;
  width: 100%;
  overflow: hidden;
  margin-top: 3px;
  display: flex;
}
.bar-fill-cyan {
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  height: 100%;
}
.bar-fill-emerald {
  background: linear-gradient(90deg, #10b981, #34d399);
  height: 100%;
}
.bar-fill-amber {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  height: 100%;
}
.bar-fill-rose {
  background: linear-gradient(90deg, #f43f5e, #fb7185);
  height: 100%;
}
</style>
"""

print("Writing master Python builder...")
