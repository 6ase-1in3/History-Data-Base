
import csv
import re
import os

input_csv = r"d:\OneDrive\Python_File\Miter Saw\timeline\PT_List_Fixed_Final.csv"
output_csv = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\Model_Image_List.csv"

def clean_filename(s):
    # Remove special chars, replace spaces with _
    s = str(s).strip()
    s = re.sub(r'[\\/*?:"<>|]', '', s)
    s = re.sub(r'\s+', '_', s)
    return s

def main():
    print(f"Reading: {input_csv}")
    
    data_rows = []
    
    # Robust encoding check
    encodings = ['utf-8-sig', 'utf-8', 'cp1252', 'latin1', 'big5', 'gbk']
    rows = []
    
    for enc in encodings:
        try:
            print(f"Trying encoding: {enc}")
            with open(input_csv, 'r', encoding=enc) as f:
                reader = csv.reader(f)
                rows = list(reader) # Read all into memory
                print(f"Success with {enc}")
                break
        except UnicodeDecodeError:
            continue
        except FileNotFoundError:
            print(f"Error: File not found at {input_csv}")
            return
        except Exception as e:
            print(f"Error with {enc}: {e}")
            return

    if not rows:
        print("Failed to read CSV or empty file.")
        return

    header = rows[0]
    # Find columns
    idx_year = -1
    idx_model = -1
    idx_brand = -1

    # Exact match first
    try:
        idx_year = header.index("Released Year")
        idx_model = header.index("Model #")
        idx_brand = header.index("Brand")
    except ValueError:
        # Fuzzy match
        print("Exact headers not found. Trying fuzzy search...")
        for i, h in enumerate(header):
            h_lower = h.lower()
            if "year" in h_lower: idx_year = i
            if "model" in h_lower: idx_model = i
            if "brand" in h_lower: idx_brand = i
    
    if idx_year == -1 or idx_model == -1 or idx_brand == -1:
        print(f"Headers missing. Found: {header}")
        return

    for row in rows[1:]:
        if len(row) <= max(idx_year, idx_model, idx_brand): continue
        
        year = row[idx_year].strip()
        model = row[idx_model].strip()
        brand = row[idx_brand].strip()
        
        if not year or not model: continue
        
        # Target Filename Convention: {Brand}_{Model}_{Year}.jpg
        target_name = f"{clean_filename(brand)}_{clean_filename(model)}_{clean_filename(year)}.jpg"
        
        data_rows.append([year, brand, model, target_name])

    # Sort by Year, then Brand
    data_rows.sort(key=lambda x: (x[0], x[1]))

    print(f"Writing to: {output_csv}")
    with open(output_csv, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Released Year", "Brand", "Model", "Recommended Image Filename (.jpg/.png)"])
        writer.writerows(data_rows)
        
    print(f"Done. Generated {len(data_rows)} rows.")

if __name__ == "__main__":
    main()
