import re

with open('wonder_dash_game/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('wonder_dash_game/js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('wonder_dash_game/js/monetization.js', 'r', encoding='utf-8') as f:
    mon_js = f.read()

all_js = js + "\n" + mon_js

ids = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', all_js)
unique_ids = set(ids)

missing = [i for i in unique_ids if f'id="{i}"' not in html and f"id='{i}'" not in html]

print("Total unique IDs queried in JS:", len(unique_ids))
print("Missing IDs:", missing)
