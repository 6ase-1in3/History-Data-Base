
import csv
import re
from collections import defaultdict

MATRIX_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.csv"

def check_duplicates():
    duplicates = [] # List of (Year, Column, Entry)
    
    try:
        with open(MATRIX_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            
            for row in reader:
                if not row: continue
                year = row[0]
                
                # Check for duplicates across the ENTIRE year or just per cell?
                # User asked "Same year content duplicate".
                # It's possible the same event is listed in "Safety" and "Electronic" columns.
                # So we should track duplicates for the *Year*.
                
                seen_entries = {} # Entry String -> List of Columns where it appeared
                
                for col_idx, cell in enumerate(row[1:]):
                    if not cell.strip(): continue
                    col_name = header[col_idx + 1]
                    
                    entries = cell.split("<br>")
                    for entry in entries:
                        entry = entry.strip()
                        if not entry: continue
                        
                        if entry in seen_entries:
                            seen_entries[entry].append(col_name)
                        else:
                            seen_entries[entry] = [col_name]
                            
                # Collect duplicates for this year
                for entry, cols in seen_entries.items():
                    if len(cols) > 1:
                        duplicates.append({
                            "year": year,
                            "entry": entry,
                            "columns": cols
                        })
                        
    except Exception as e:
        print(f"Error reading matrix: {e}")
        return

    if duplicates:
        print(f"Found {len(duplicates)} duplicate entries:")
        print("="*60)
        for d in duplicates:
            print(f"\n[Year {d['year']}]")
            print(f"  Entry: {d['entry']}")
            print(f"  Appears in columns: {', '.join(d['columns'])}")
    else:
        print("No duplicate entries found within the same year.")

if __name__ == "__main__":
    check_duplicates()
