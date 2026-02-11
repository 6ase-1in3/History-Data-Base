
import os
import re
import pandas as pd
from collections import defaultdict

# Configuration
DATA_DIR = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record"
OUTPUT_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.md"

# Mappings (Filename -> Column Name)
# Note: 002 requires special parsing.
FILE_MAP = {
    "003": "Safety",       # 安規
    "001": "Sliding",      # 滑動
    "009": "Ergonomics",   # 人體
    "006": "Cutting",      # 切削
    "007": "Visual",       # 視覺
    "008": "Durability",   # 耐久
    "004": "Dust",         # 集塵
    "005": "Electronic",   # 電控
    "002": "Portable"      # 攜帶 (Special List Format)
}

def parse_markdown_table(file_path):
    """
    Parses a markdown table into a list of dictionaries.
    Assumes standard pipe-separated format.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Warning: File not found {file_path}")
        return []

    data = []
    headers = []
    inside_table = False

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Detect Table Header
        if "|" in line and "---" not in line and not inside_table:
            # Heuristic: looks like a header row
            if "年份" in line or "Year" in line:
                headers = [h.strip() for h in line.split("|") if h.strip()]
                inside_table = True
                continue

        # Skip separator line
        if set(line.replace("|", "").replace("-", "").replace(":", "").strip()) == set():
             continue

        # Parse Row
        if inside_table and "|" in line:
            cells = [c.strip() for c in line.split("|") if c] # Note: this might drop empty cells if not careful, but usually split adds empty strings.
            # Better split: line.strip("|").split("|")
            cells = [c.strip() for c in line.strip("|").split("|")]
            
            if len(cells) >= 3: # Expect at least Year, Content, Brand/Model
                row_data = {}
                # Map by index since headers might vary slightly
                # Standard order in most files: | Year | Event | Brand/Model | Detail |
                # But 003 is: | Year | Standard | Recall |
                
                # Extract Base Data
                row_data['full_row'] = cells
                row_data['headers'] = headers
                data.append(row_data)

    return data

def extract_year(text):
    match = re.search(r'\d{4}', text)
    return int(match.group(0)) if match else None

def clean_cell(text):
    text = text.replace("**", "").replace("\\", "")
    # Remove BOM and non-breaking spaces
    text = text.replace('\ufeff', '').replace('\xa0', ' ')
    return text.strip()

def process_standard_file(filename, category, matrix, ignore_list):
    """
    Processes standard table-based files (001, 004, 005, 006, 007, 008, 009).
    Expected columns: Year | Event | Brand/Model | ...
    """
    file_path = os.path.join(DATA_DIR, filename)
    rows = parse_markdown_table(file_path)

    for row in rows:
        cells = row['full_row']
        if len(cells) < 3: continue

        # Heuristic to identify columns
        year_text = cells[0]
        year = extract_year(year_text)
        if not year: continue
        
        # Logic for Brand/Model/Event extraction
        brand_model_str = ""
        event_str = ""
        
        # File-specific heuristics based on inspection
        if "001" in filename: # | Year | Design | Brand | Event |
             # Col 2 (idx 1): Design Type -> Part of Event
             # Col 3 (idx 2): Brand/Model
             # Col 4 (idx 3): Event Detail
             if len(cells) > 2:
                 brand_model_str = cells[2]
                 detail = cells[3] if len(cells) > 3 else ""
                 event_str = f"{cells[1]}: {clean_cell(detail)}"

        elif "004" in filename or "005" in filename or "006" in filename or "007" in filename or "008" in filename or "009" in filename:
            # Common Format: | Year | Event/Feature | Brand/Model | Detail |
            if len(cells) > 2:
                event = cells[1]
                detail = cells[3] if len(cells) > 3 else ""
                brand_model_str = cells[2]
                # Combine Event title with detail if detail exists
                if detail and detail != "nan":
                     event_str = f"{event}: {clean_cell(detail)}"
                else:
                     event_str = event
        
        elif "003" in filename: # Safety: | Year | Standard | Recall/Issue | Detail
             # Col 2: Standard, Col 3: Recall, Col 4: Detail
             recall_col = cells[2]
             standard_col = cells[1]
             detail = cells[3] if len(cells) > 3 else ""
             
             # Attempt to find Brand in Recall Column
             if "**" in recall_col:
                 brand_model_str = recall_col 
                 event_str = f"{standard_col}: {clean_cell(detail)}"
             else:
                 brand_model_str = "Industry"
                 event_str = f"{standard_col} / {recall_col}: {clean_cell(detail)}"

        # Clean and Format: 【Brand】 〖Model〗 «Event»
        formatted_entry = format_entry(brand_model_str, event_str, ignore_list)
        if formatted_entry:
            matrix[year][category].append(formatted_entry)

def process_002_file(filename, category, matrix, ignore_list):
    """
    Processes 002 (Portable) which uses a Bullet List format.
    """
    file_path = os.path.join(DATA_DIR, filename)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        return

    current_year = None
    
    for line in lines:
        line = line.strip()
        
        # Detect Year: * **2008年**
        year_match = re.match(r'\*\s*\*\*(20\d{2})', line)
        if year_match:
            current_year = int(year_match.group(1))
            continue
        
        # Detect Item: * **【Tag】Brand Model：** Content
        # Regex: * **【(.*?)】(.*?)：** (Content)
        if current_year and line.startswith("*") and "【" in line:
            # Extract content
            # Example: * **【便攜設計】Festool Kapex KS 120：** ...
            # We want to capture the part AFTER the colon too.
            parts = re.split(r'[:：]', line, 1) # Split on first colon
            
            if len(parts) > 1:
                header_part = parts[0]
                content_part = parts[1].strip()
                
                item_match = re.search(r'【(.*?)】(.*)', header_part)
                if item_match:
                    tag = item_match.group(1) # e.g. 便攜設計
                    brand_model_raw = item_match.group(2).replace("**", "").strip() # e.g. Festool Kapex KS 120
                    

                    # Use standard formatter to handle brand extraction and normalization
                    event_desc = f"{tag}: {clean_cell(content_part)}"
                    entry = format_entry(brand_model_raw, event_desc, ignore_list)
                    matrix[current_year][category].append(entry)


def normalize_brand(brand_raw):
    """
    Normalizes brand names to match MTS - Models_Data.csv
    """
    b = brand_raw.strip()
    
    # Direct mappings for known variations
    mapping = {
        "Hitachi": "MetaboHPT - Hitachi",
        "Hitachi (Metabo HPT)": "MetaboHPT - Hitachi",
        "Metabo HPT": "MetaboHPT - Hitachi",
        "Metabo HPT (Hitachi)": "MetaboHPT - Hitachi",
        "MetaboHPT": "MetaboHPT - Hitachi",
        "Metabo (German)": "Metabo",
        "Metabo (Germany)": "Metabo",
        "Kobalt (Lowes)": "Kobalt",
        "Dewalt": "DeWalt",
        "Ridgid Power Tools": "Ridgid",
        "Festool US": "Festool",
        "Metabo": "Metabo" # Explicitly keep Metabo as Metabo
    }
    
    if b in mapping:
        return mapping[b]
    
    # Fallback/Pass-through
    return b

def extract_brand_model(text):
    """
    Splits 'Brand Model' string into Brand and Model using known prefixes.
    """
    cleaned = clean_cell(text)
    
    # Known prefixes sorted by length DESC to match longest first
    prefixes = [
        "Metabo HPT (Hitachi)",
        "Hitachi (Metabo HPT)",
        "Metabo (German)",
        "Metabo (Germany)",
        "Kobalt (Lowes)",
        "Metabo HPT",
        "Metabo",
        "Hitachi",
        "Festool",
        "Milwaukee",
        "Ridgid",
        "DeWalt",
        "Makita",
        "Kobalt",
        "Einhell",
        "Delta",
        "Bosch",
        "Scheppach"
    ]
    
    for p in prefixes:
        # Case insensitive match start
        if cleaned.lower().startswith(p.lower()):
            # Check boundary (space or end of string)
            if len(cleaned) == len(p) or cleaned[len(p)] == " ":
                brand_raw = cleaned[:len(p)]
                model_raw = cleaned[len(p):].strip()
                return brand_raw, model_raw
                
    # Fallback: Split by first space
    if " " in cleaned:
        parts = cleaned.split(" ", 1)
        return parts[0], parts[1]
    
    return cleaned, "-"

# New Configuration
MISSING_CSV = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\missing_models.csv"

def load_ignore_list():
    """
    Loads terms marked as '不是型號' from missing_models.csv.
    Returns a set of strings to ignore as models.
    """
    ignore_set = set()
    try:
        with open(MISSING_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                replace_val = str(row.get("REPLACE") or "").strip()
                if "不是型號" in replace_val:
                    model = row.get("Matrix Model", "").strip()
                    if model:
                        ignore_set.add(model.lower()) # Store distinct lower case for check
    except Exception as e:
        print(f"Warning: Could not load ignore list: {e}")
    return ignore_set

def format_entry(brand_model_raw, event_raw, ignore_list=None):
    """
    Standardizes the output string to 【Brand】 〖Model〗 «Event»
    """
    event_clean = clean_cell(event_raw)
    
    # 1. Extract using smart logic
    brand_raw, model_raw = extract_brand_model(brand_model_raw)
        
    # 2. Normalize Brand
    brand = normalize_brand(brand_raw)
    
    # 3. Clean Model
    model = model_raw
    if model.startswith("-") or model.startswith(":"):
         model = model.lstrip("-:").strip()
    if not model:
        model = "-"
        
    # 4. Filter Non-Models
    if ignore_list and model.lower() in ignore_list:
        model = "-"
        # Optionally, we could append the original text to event description?
        # But for now, just blank the model as requested.
        
    return f"【{brand}】 〖{model}〗 «{event_clean}»"

def generate_matrix():
    matrix = defaultdict(lambda: defaultdict(list))
    ignore_list = load_ignore_list()
    
    # 1. Identify files
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".md")]
    
    for f in files:
        prefix = f.split(" ")[0] # e.g. "001"
        if prefix in FILE_MAP:
            category = FILE_MAP[prefix]
            if prefix == "002":
                process_002_file(f, category, matrix, ignore_list)
            else:
                process_standard_file(f, category, matrix, ignore_list)
    
    # 2. Output to Markdown
    # Columns in order
    columns = ["Safety", "Sliding", "Ergonomics", "Cutting", "Visual", "Durability", "Dust", "Electronic", "Portable"]
    
    # Get all years range
    if not matrix:
         print("No data found!")
         return

    min_year = min(matrix.keys())
    max_year = max(matrix.keys())
    
    # Build Table
    md_output = []
    
    # Header
    header_row = "| Year | " + " | ".join(columns) + " |"
    md_output.append(header_row)
    separator_row = "| :--- | " + " | ".join([":---"] * len(columns)) + " |"
    md_output.append(separator_row)
    
    for year in sorted(matrix.keys()):
        row = [str(year)]
        for col in columns:
            entries = matrix[year][col]
            if entries:
                # Join with <br>
                cell_content = "<br>".join(entries)
            else:
                cell_content = " "
            row.append(cell_content)
        
        md_output.append("| " + " | ".join(row) + " |")
        
    # Write to File
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("\n".join(md_output))
    
    print(f"Successfully generated matrix at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_matrix()
