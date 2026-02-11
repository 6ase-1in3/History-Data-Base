import csv
import os

# Map Model # to new Image URL
updates = {
    "LS1110F": "https://cdn.makitatools.com/apps/cms/img/ls1/adbfc575-a56a-4155-a992-e147510702d2_ls1110f_f_1500px.png",
    "DCS714": "https://www.toolservicenet.com/i/DEWALT/GLOBALBOM/QU/DCS714B/1/Product_Image/EN/DCS714.jpg",
    "DCS785": "https://www.dewalt.com/NAG/PRODUCT/IMAGES/HIRES/Ecomm_Large-DCS785WW1_1.jpg"
}

files = [
    r"d:\OneDrive\Python_File\Miter Saw\timeline\MTS - Models_Data.csv",
    r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\MTS - Models_Data.csv"
]

def update_csv(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Updating {file_path}...")
    rows = []
    updated_count = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                model = row.get('Model #')
                if model in updates:
                    row['Image URL'] = updates[model]
                    updated_count += 1
                rows.append(row)

        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
            
        print(f"Updated {updated_count} rows in {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

for f in files:
    update_csv(f)
