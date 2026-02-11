import re

with open(r'd:/OneDrive/Python_File/Miter Saw/Timeline_Project/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

# Find TIMELINE_CSV and MODELS_CSV sections
in_csv = False
csv_name = None
results = []

for i, line in enumerate(lines, 1):
    # Detect start of template literal CSV
    if 'const TIMELINE_CSV = `' in line or 'const MODELS_CSV = `' in line:
        in_csv = True
        csv_name = 'TIMELINE' if 'TIMELINE' in line else 'MODELS'
        continue
    
    # Detect end of template literal
    if in_csv and line.strip() == '`;':
        in_csv = False
        continue
    
    # Look for backticks inside CSV data
    if in_csv and '`' in line:
        results.append((i, csv_name, line[:100]))

print(f"Found {len(results)} lines with backticks in CSV data:")
for line_no, csv_type, content in results:
    print(f"  Line {line_no} [{csv_type}]: {content}...")
