
import csv
import re
import difflib
from collections import defaultdict

MATRIX_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.csv"
MODELS_FILE = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\MTS - Models_Data.csv"

def normalize_model_id(brand, model):
    """
    Creates a unique key for comparison. 
    """
    if not model or model == "-": return None
    return f"{brand.strip()}::{model.strip()}".lower()

def get_matrix_models():
    """
    Extracts (Brand, Model) tuples from the matrix CSV.
    """
    models = set()
    try:
        with open(MATRIX_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader) # Skip header
            
            for row in reader:
                # Skip year column (idx 0)
                for cell in row[1:]:
                    if not cell.strip(): continue
                    
                    entries = cell.split("<br>")
                    for entry in entries:
                        match = re.search(r'\*\*(.*?)\*\*(?:_|\\_)\*\*(.*?)\*\*', entry)
                        if match:
                            brand = match.group(1).replace("**", "").strip()
                            model = match.group(2).replace("**", "").strip()
                            
                            key = normalize_model_id(brand, model)
                            if key:
                                models.add((brand, model)) 
    except Exception as e:
        print(f"Error reading Matrix: {e}")
        
    return models

def get_official_models_by_brand():
    """
    Returns a dict: Brand -> List of Official Models
    """
    brand_models = defaultdict(list)
    try:
        with open(MODELS_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            
            try:
                brand_idx = header.index("Brand")
                model_idx = header.index("Model #")
            except ValueError:
                brand_idx = 7
                model_idx = 6
            
            for row in reader:
                if len(row) > max(brand_idx, model_idx):
                    brand = row[brand_idx].strip()
                    model = row[model_idx].strip()
                    if model:
                        brand_models[brand].append(model)
                        
    except Exception as e:
        print(f"Error reading Official Models: {e}")
        
    return brand_models

def check_missing():
    matrix_pairs = get_matrix_models()
    official_brand_models = get_official_models_by_brand()
    
    # Flatten official keys for easy existence check
    official_keys = set()
    for brand, models in official_brand_models.items():
        for m in models:
            official_keys.add(normalize_model_id(brand, m))
    
    missing_data = []
    
    print(f"Loaded {len(matrix_pairs)} unique models from Matrix.")
    print(f"Loaded {len(official_keys)} unique models from Official List.")
    print("---------------------------------------------------")
    
    for brand, model in matrix_pairs:
        # Ignore generic placeholders
        if model in ["-", "General", "Series", "(German) KGS M Series", "(German) KGS M"]:
             continue
        if "Series" in model or "Generation" in model:
             continue
             
        key = normalize_model_id(brand, model)
        
        # Check if missing
        if key and key not in official_keys:
            # Find closest match within the SAME Brand
            possible_match = ""
            candidates = official_brand_models.get(brand, [])
            
            if candidates:
                # 1. Try case-insensitive exact match first (sometimes normalization differs)
                for c in candidates:
                    if c.lower() == model.lower():
                        possible_match = c
                        break
                
                # 2. Fuzzy match
                if not possible_match:
                    matches = difflib.get_close_matches(model, candidates, n=1, cutoff=0.5)
                    if matches:
                        possible_match = matches[0]
            
            missing_data.append([brand, model, possible_match])

    output_path = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\missing_models.csv"
    
    if missing_data:
        # Sort by Brand then Model
        missing_data.sort(key=lambda x: (x[0], x[1]))
        
        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Brand", "Matrix Model", "Possible Match (Official)"])
            writer.writerows(missing_data)
            
        print(f"Successfully wrote {len(missing_data)} missing models to: {output_path}")
    else:
        print("All models in Matrix are present in the Official List.")

if __name__ == "__main__":
    check_missing()
