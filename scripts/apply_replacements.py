
import csv
import re
import os

MATRIX_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.csv"
MISSING_CSV = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\missing_models.csv"
OUTPUT_FILE = MATRIX_FILE # Overwrite

def apply_replacements():
    # 1. Load Replacements
    replacements = {} # (Brand, OldModel) -> NewModel
    
    try:
        with open(MISSING_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                replace_val = str(row.get("REPLACE") or "").strip().upper()
                should_replace = replace_val == "Y"
                if should_replace:
                    brand = str(row.get("Brand") or "").strip()
                    old_model = str(row.get("Matrix Model") or "").strip()
                    new_model = str(row.get("Possible Match (Official)") or "").strip()
                    
                    if brand and old_model and new_model:
                        replacements[(brand, old_model)] = new_model
                        
    except Exception as e:
        print(f"Error reading replacement CSV: {e}")
        return

    print(f"Loaded {len(replacements)} replacements.")
    
    # 2. Read Matrix
    matrix_rows = []
    try:
        with open(MATRIX_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            matrix_rows = list(reader)
    except Exception as e:
        print(f"Error reading Matrix CSV: {e}")
        return

    # 3. Apply Replacements
    # Format: **Brand**_**Model**_**Event**...
    changed_count = 0
    
    new_rows = []
    if not matrix_rows: return
    
    header = matrix_rows[0]
    new_rows.append(header)
    
    for row in matrix_rows[1:]:
        new_row = []
        # Year is idx 0
        new_row.append(row[0]) 
        
        for cell in row[1:]:
            if not cell.strip(): 
                new_row.append(cell)
                continue
                
            entries = cell.split("<br>")
            new_entries = []
            
            for entry in entries:
                # Regex to isolate Brand and Model
                # Entry: **Brand**_**Model**_**Event**
                match = re.match(r'(\*\*(.*?)\*\*(?:_|\\_)\*\*(.*?)\*\*)(.*)', entry)
                
                if match:
                    prefix_full = match.group(1)
                    brand = match.group(2).replace("**", "").strip()
                    model = match.group(3).replace("**", "").strip()
                    remainder = match.group(4) # _**Event...
                    
                    key = (brand, model)
                    # print(f"Checking {key}") 
                    
                    if key in replacements:
                        print(f"MATCH FOUND: {key} -> {replacements[key]}")
                        new_model_str = replacements[key]
                        
                        # Handle user specific "Double Model" request "**A****B**"
                        # If the new string already has formatting (contains *), use it raw?
                        # The regex expects **Model**. item in replacement is likely just "A" or "**A**"?
                        # User Example: "**DWS779****DWS780**"
                        
                        # Construct new prefix
                        # Standard format: **Brand**_**Model**
                        # If new_model_str is raw "DHS790", we wrap it: **DHS790**
                        # If new_model_str is "**DWS779****DWS780**", we keep it.
                        
                        if "**" in new_model_str:
                             formatted_model = new_model_str
                        else:
                             formatted_model = f"**{new_model_str}**"
                        
                        # Rebuild
                        # Note: remainder starts with _**Event... ? No.
                        # Original: **Brand**_**Model**_**Event: ...**
                        # Regex Group 1: **Brand**_**Model**
                        # Regex Group 4: _**Event: ...**
                        
                        # Wait, my regex was:
                        # r'(\*\*(.*?)\*\*(?:_|\\_)\*\*(.*?)\*\*)(.*)'
                        # G1 = **Brand**_**Model**
                        # G2 = Brand
                        # G3 = Model
                        # G4 = _**Event...** (starts with _)
                        
                        # Special check: The user provided replacement might affect how we reconstruct.
                        # If user wants double model, do we keep "_" separator?
                        # user: "**DWS779****DWS780**"
                        # Rebuild: **Brand**_**DWS779****DWS780**_**Event**
                        
                        new_entry = f"**{brand}**_{formatted_model}{remainder}"
                        new_entries.append(new_entry)
                        changed_count += 1
                    else:
                        new_entries.append(entry)
                else:
                    new_entries.append(entry)
            
            new_row.append("<br>".join(new_entries))
        
        new_rows.append(new_row)

    # 4. Write Back
    with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(new_rows)
        
    print(f"Applied {changed_count} replacements to {MATRIX_FILE}")

if __name__ == "__main__":
    apply_replacements()
