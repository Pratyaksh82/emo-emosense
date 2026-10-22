# ==============================================================================
# Master Assembler: Generates the 50-Page Performance Whitepaper HTML & PDF
# EmoSense x Chetana: Comprehensive Empirical Performance Audit (50 Pages)
# ==============================================================================

import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from whitepaper_part1 import get_pages_part1
from whitepaper_part2 import get_pages_part2
from whitepaper_part3 import get_pages_part3
from whitepaper_part4 import get_pages_part4
from whitepaper_part5 import get_pages_part5
from build_report_html import css_styles

def main():
    print("🎨 Assembling Definitive 50-Page Performance Whitepaper...")

    part1 = get_pages_part1()
    part2 = get_pages_part2()
    part3 = get_pages_part3()
    part4 = get_pages_part4()
    part5 = get_pages_part5()

    print(f"  Part 1: {len(part1)} pages (Pages 1-10)")
    print(f"  Part 2: {len(part2)} pages (Pages 11-20)")
    print(f"  Part 3: {len(part3)} pages (Pages 21-30)")
    print(f"  Part 4: {len(part4)} pages (Pages 31-40)")
    print(f"  Part 5: {len(part5)} pages (Pages 41-50)")

    all_pages = part1 + part2 + part3 + part4 + part5
    total_count = len(all_pages)
    print(f"📄 Total pages assembled: {total_count}")

    if total_count != 50:
        print(f"⚠️ WARNING: Page count is {total_count}, expected exactly 50!")

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EmoSense × Chetana: Comprehensive Web Performance Whitepaper (50-Page Definitive Edition)</title>
  {css_styles}
</head>
<body>
  {"".join(all_pages)}
</body>
</html>
"""

    out_html = os.path.join(os.path.dirname(__file__), '../dist/performance_whitepaper.html')
    out_html = os.path.abspath(out_html)
    with open(out_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ HTML written to: {out_html} ({os.path.getsize(out_html)} bytes)")

    print("🚀 Invoking Puppeteer to render high-definition 50-page A4 PDF...")
    render_script = os.path.join(os.path.dirname(__file__), 'render_pdf.cjs')
    result = subprocess.run(['node', render_script], capture_output=True, text=True)
    print("STDOUT:", result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)

    if result.returncode == 0:
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../dist/EMOSENSE_CHETANA_AVATAR_PERFORMANCE_WHITEPAPER.pdf'))
        print(f"🎉 SUCCESS! Master 50-Page PDF generated at: {pdf_path}")
        print(f"⚖️ Final PDF Size: {os.path.getsize(pdf_path) / 1024 / 1024:.2f} MB")
    else:
        print("❌ Error during PDF rendering!")

if __name__ == '__main__':
    main()
