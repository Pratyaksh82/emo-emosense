# -*- coding: utf-8 -*-
"""
Generator for Chetana 20-Page Architectural Elevation Blueprint.
Pure vector CSS styling: zero backdrop-filter, zero raster blurs, instant loading.
Divided across 3 parts (Part 1 & 2 coupled, Part 3 separate) for 3 teammates.
"""

import os

HTML_PATH = r"c:\Users\praty\Desktop\2d model\dist\chetana_20page_blueprint.html"

def get_css():
    return """
  @page {
    size: A4 portrait;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    background-color: #060911;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 8.3px;
    line-height: 1.42;
  }
  .page {
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    page-break-inside: avoid;
    overflow: hidden;
    position: relative;
    padding: 10mm 12mm;
    background: #080d1a;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .theme-cover { background-color: #070c18; }
  .theme-part1 { background-color: #080d1c; }
  .theme-part2 { background-color: #0c0b1a; }
  .theme-part3 { background-color: #080f18; }

  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 4.5px;
    border-bottom: 1px solid #1e293b;
    margin-bottom: 6px;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .brand-icon {
    width: 19px;
    height: 19px;
    border-radius: 4px;
    background: #6366f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    color: #fff;
  }
  .brand-title {
    font-size: 8.8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #f8fafc;
  }
  .brand-sub {
    font-size: 7px;
    color: #94a3b8;
  }
  .part-pill {
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .pill-p1 { background: #1e1b4b; border: 1px solid #6366f1; color: #a5b4fc; }
  .pill-p2 { background: #3b0720; border: 1px solid #f43f5e; color: #fda4af; }
  .pill-p3 { background: #062e24; border: 1px solid #10b981; color: #6ee7b7; }
  .pill-meta { background: #1e293b; border: 1px solid #475569; color: #cbd5e1; }

  .title-section {
    margin-bottom: 6px;
  }
  .title-section h1 {
    font-size: 13.5px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.25;
    margin-bottom: 2px;
  }
  .title-section .subtitle {
    font-size: 7.8px;
    color: #94a3b8;
    line-height: 1.35;
  }

  .card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 5px;
    padding: 5.5px 7.5px;
    margin-bottom: 5.5px;
  }
  .card-p1 { border-left: 3px solid #6366f1; }
  .card-p2 { border-left: 3px solid #f43f5e; }
  .card-p3 { border-left: 3px solid #10b981; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
  }
  .card-title {
    font-size: 9.2px;
    font-weight: 700;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .card-tag {
    font-family: ui-monospace, monospace;
    font-size: 6.4px;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 600;
  }
  .tag-spec { background: #0c2838; color: #38bdf8; border: 1px solid #0284c7; }
  .tag-benefit { background: #062e24; color: #34d399; border: 1px solid #059669; }
  .tag-risk { background: #3b0720; color: #fb7185; border: 1px solid #e11d48; }
  .tag-cost { background: #351c04; color: #fbbf24; border: 1px solid #d97706; }

  .spec-text {
    font-size: 7.9px;
    color: #cbd5e1;
    margin-bottom: 3.5px;
    line-height: 1.38;
  }

  .eval-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4.5px;
    margin-top: 3px;
  }
  .eval-col {
    padding: 4px 5.5px;
    border-radius: 4px;
    font-size: 7.5px;
    line-height: 1.32;
  }
  .eval-pro { background: #062e24; border: 1px solid #047857; }
  .eval-pro h4 { font-size: 7.7px; font-weight: 700; color: #34d399; margin-bottom: 2px; }
  .eval-con { background: #3b0720; border: 1px solid #be123c; }
  .eval-con h4 { font-size: 7.7px; font-weight: 700; color: #fb7185; margin-bottom: 2px; }

  .bullet-list { list-style: none; padding-left: 0; }
  .bullet-list li { position: relative; padding-left: 8px; margin-bottom: 1.5px; color: #cbd5e1; }
  .bullet-pro li::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: 800; }
  .bullet-con li::before { content: "✗"; position: absolute; left: 0; color: #f43f5e; font-weight: 800; }

  .meta-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 4px;
    padding: 2.5px 5.5px;
    margin-top: 3px;
    font-size: 7px;
    color: #94a3b8;
  }
  .meta-banner strong { color: #f1f5f9; }

  .table-custom {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.2px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .table-custom th {
    background: #1e293b;
    color: #94a3b8;
    text-align: left;
    padding: 3px 4px;
    font-weight: 700;
    border-bottom: 1px solid #334155;
  }
  .table-custom td {
    padding: 2.8px 4px;
    border-bottom: 1px solid #1e293b;
    color: #cbd5e1;
  }
  .table-custom tr:nth-child(even) td { background: #0f172a; }

  .code-box {
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 4px;
    padding: 4px 6px;
    font-family: ui-monospace, monospace;
    font-size: 6.8px;
    line-height: 1.34;
    color: #e2e8f0;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid #1e293b;
    font-size: 6.6px;
    color: #64748b;
    margin-top: 3.5px;
  }

  .badge-highlight { padding: 1px 3px; border-radius: 3px; font-weight: 700; }
  .hl-emerald { background: #064e3b; color: #34d399; }
  .hl-indigo { background: #312e81; color: #a5b4fc; }
  .hl-rose { background: #881337; color: #fda4af; }
  .hl-amber { background: #78350f; color: #fcd34d; }
  .hl-cyan { background: #0c4a6e; color: #38bdf8; }
  .hl-purple { background: #581c87; color: #c084fc; }

  .metric-strip { display: flex; gap: 4.5px; margin-bottom: 5px; }
  .metric-item { flex: 1; background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 3.5px 5px; text-align: center; }
  .metric-val { font-size: 10.5px; font-weight: 800; color: #38bdf8; font-family: ui-monospace, monospace; line-height: 1.15; }
  .metric-lbl { font-size: 6.5px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-top: 1.5px; }

  .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
  .grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4.5px; }
  .grid-4col { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; }
"""

def make_header(title, subtitle, part_pill, pill_class):
    return f"""
    <div class="header-bar">
      <div class="brand-group">
        <div class="brand-icon">🌸</div>
        <div>
          <div class="brand-title">{title}</div>
          <div class="brand-sub">{subtitle}</div>
        </div>
      </div>
      <div class="part-pill {pill_class}">{part_pill}</div>
    </div>
    """

def make_footer(page_num, total_pages=20, part_name="CHETANA ELEVATION BLUEPRINT"):
    return f"""
    <div class="footer">
      <span>EMOSENSE AI · {part_name}</span>
      <span>CONFIDENTIAL · VECTOR HIGH-DETAIL EDITION</span>
      <span>Page {page_num} of {total_pages}</span>
    </div>
    """

print("Setup ready. Generating 20 pages...")
