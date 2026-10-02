import re

with open(r'c:\Users\diseño web\Desktop\Landing HTML\pages\mechanic-ve.html', 'r', encoding='utf-8') as f:
    content = f.read()

card = re.search(r'<div class="datasheet-card__body".*?</div>\s*</div>', content, re.DOTALL)
if card:
    print(card.group(0))
