import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from master_blueprint_part1 import get_pages_part1
from master_blueprint_part2 import get_pages_part2
from master_blueprint_part3 import get_pages_part3
from master_blueprint_part4 import get_pages_part4

all_p = get_pages_part1() + get_pages_part2() + get_pages_part3() + get_pages_part4()

print(f"Total pages: {len(all_p)}")

for i, p in enumerate(all_p):
    opens = len(re.findall(r'<div\b', p))
    closes = len(re.findall(r'</div>', p))
    if opens != closes:
        print(f"❌ MISMATCH in Page {i+1}: <div={opens}, </div>={closes}, diff={opens-closes}")

    # Check for raw angle brackets in code-block that could be parsed as HTML tags
    cb_matches = re.finditer(r'<div class="code-block"[^>]*>(.*?)</div>', p, re.DOTALL)
    for cb in cb_matches:
        content = cb.group(1)
        raw_tags = re.findall(r'<[a-zA-Z/][^>]*>', content)
        if raw_tags:
            print(f"⚠️ Page {i+1} has raw tags inside code-block: {raw_tags}")
