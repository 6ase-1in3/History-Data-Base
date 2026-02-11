import re
import csv
import os

md_path = r"d:\OneDrive\Python_File\Miter Saw\MTS History\Longitudinal_Report_Bosch_Merged_TW.md"
csv_path = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\data\MTS - Year_Timeline.csv"

def extract_content(md_text):
    # Split by Year Header (## ...)
    # The file has headers like "## Bosch Miter Saws 2009: ..."
    # So we split by "## " at start of line
    blocks = re.split(r'^## ', md_text, flags=re.MULTILINE)
    
    data = []
    for block in blocks:
        if not block.strip(): continue
        
        # First line is the header, verify year
        lines = block.split('\n', 1)
        header = lines[0]
        content = lines[1] if len(lines) > 1 else ""
        
        # Find year in header
        year_match = re.search(r'\b(20\d{2})\b', header)
        if not year_match: continue
        
        year = year_match.group(1)
        
        # Extract Market Overview (#### 1. ...)
        market_match = re.search(r'#### 1\. .*?市場概況.*?\n(.*?)(?=\n####|\Z)', content, re.DOTALL)
        market_notes = market_match.group(1).strip() if market_match else ""
        
        # Extract Tech Notes (#### 3. ...)
        tech_match = re.search(r'#### 3\. .*?技術特點.*?\n(.*?)(?=\n####|\Z)', content, re.DOTALL)
        tech_notes = tech_match.group(1).strip() if tech_match else ""
        
        data.append({
            'Year': year,
            'Title': f'Bosch {year}',
            'Market_Notes': market_notes,
            'Tech_Notes': tech_notes,
            'Brand': 'Bosch'
        })
    
    # Sort data by year just in case
    data.sort(key=lambda x: x['Year'])
    return data

def update_csv(new_data):
    # Read existing to verify headers & avoid duplicates?
    # Actually, we know Bosch data is missing except 2025.
    # We will append or rewrite.
    # Safe bet: Read all, filter out existing Bosch entries (to avoid duplication), then add new.
    
    rows = []
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames
            for row in reader:
                # Keep non-Bosch rows, or keep Bosch 2025 if it exists?
                # User's file had Bosch 2025.
                # Let's keep everything and just append new found years if not present.
                rows.append(row)
    else:
        headers = ['Year', 'Title', 'Market_Notes', 'Tech_Notes', 'Brand']

    # Add new data if not present
    existing_keys = set((r['Year'], r['Brand']) for r in rows)
    
    for entry in new_data:
        key = (entry['Year'], 'Bosch')
        if key not in existing_keys:
            rows.append(entry)
            print(f"Added Bosch {entry['Year']}")
        else:
            # Maybe update it?
            # Let's update it to be sure we have content.
            for r in rows:
                if r['Year'] == entry['Year'] and r['Brand'] == 'Bosch':
                    r['Market_Notes'] = entry['Market_Notes']
                    r['Tech_Notes'] = entry['Tech_Notes']
                    print(f"Updated Bosch {entry['Year']}")

    # Write back
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    print("CSV Update Complete.")

if __name__ == '__main__':
    if not os.path.exists(md_path):
        print(f"Markdown file found found: {md_path}")
    else:
        with open(md_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        extracted_data = extract_content(text)
        if extracted_data:
            update_csv(extracted_data)
        else:
            print("No data extracted.")
