import os
import re

directories = ['src', 'signbridge']
replacements = [
    (re.compile(r'NeuroSign AI', re.IGNORECASE), 'AstraSign'),
    (re.compile(r'NeuroSign', re.IGNORECASE), 'AstraSign'),
    (re.compile(r'SignBridge', re.IGNORECASE), 'AstraSign'),
]
exclude_exts = {'.glb', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.json', '.lock', '.lockb'}

total_replaced = 0

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in exclude_exts:
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, repl in replacements:
                    new_content = pattern.sub(repl, new_content)
                
                if content != new_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {path}")
                    total_replaced += 1
            except Exception as e:
                pass

print(f"Total files updated: {total_replaced}")
