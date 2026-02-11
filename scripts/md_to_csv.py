
import csv
import os

INPUT_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.md"
OUTPUT_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.csv"

def convert_md_to_csv():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: File not found {INPUT_FILE}")
        return

    data_rows = []
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Check if it's a table row
        if line.startswith("|") and line.endswith("|"):
            # Check if it's a separator row (---)
            if "---" in line:
                continue
            
            # Extract cells
            # Split by | and ignore the empty first/last elements created by split
            cells = [c.strip() for c in line.split("|")]
            
            # Markdown table | A | B | produces ['', 'A', 'B', '']
            if len(cells) >= 2:
                # Remove first and last empty strings usually present due to | at ends
                row_content = cells[1:-1]
                data_rows.append(row_content)

    if not data_rows:
        print("No data found.")
        return

    # Write CSV
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f: # utf-8-sig for Excel compatibility
        writer = csv.writer(f)
        writer.writerows(data_rows)
        
    print(f"Successfully converted to CSV: {OUTPUT_FILE}")

if __name__ == "__main__":
    convert_md_to_csv()
