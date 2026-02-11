
import os
import re
import csv

DATA_DIR = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record"
MISSING_CSV = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\missing_models.csv"

def get_targets():
    """
    Reads missing_models.csv to find targets marked as '不是型號' (Not a Model).
    """
    targets = []
    try:
        with open(MISSING_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # The user marked "不是型號" in the REPLACE column (or maybe user put it there)
                # Let's check the REPLACE column value.
                replace_val = str(row.get("REPLACE") or "").strip()
                
                if "不是型號" in replace_val:
                    model = row.get("Matrix Model", "").strip()
                    if model:
                        targets.append(model)
                        
    except Exception as e:
        print(f"Error reading Missing CSV: {e}")
    return targets

def search_in_files(targets):
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".md")]
    
    results = defaultdict(list)
    
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            # Check if any target is in this line
            # We need to be a bit careful about matching. 
            # The matrix model name might be part of a bold string **Model**
            
            for t in targets:
                # Simple substring match might be noisy, but effective for unique strings like "瑕疵 (護罩卡住)"
                if t in line:
                    # Capture context
                    results[t].append({
                        "file": filename,
                        "line": i + 1,
                        "content": line.strip()
                    })
                    
    return results


def main():
    targets = get_targets()
    output_log = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\scripts\trace_report.txt"
    
    print(f"Searching for {len(targets)} targets in markdown files...") # Print to console too
    
    with open(output_log, 'w', encoding='utf-8') as log:
        log.write(f"Searching for {len(targets)} targets in markdown files...\n")
        
        hits = search_in_files(targets)
        
        log.write("\n" + "="*60 + "\n")
        log.write("SOURCE TRACE RESULTS\n")
        log.write("="*60 + "\n")
        
        found_count = 0
        for target in sorted(targets):
            if target in hits:
                log.write(f"\n[Term]: {target}\n")
                for hit in hits[target]:
                    log.write(f"  File: {hit['file']} (Line {hit['line']})\n")
                    log.write(f"  Context: {hit['content'][:100].strip()}...\n") 
                found_count += 1
            else:
                pass
                
        log.write("\n" + "="*60 + "\n")
        log.write(f"Found sources for {found_count}/{len(targets)} terms.\n")
        
    print(f"Trace report written to: {output_log}")

if __name__ == "__main__":
    main()
