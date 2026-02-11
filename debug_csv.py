import csv

file_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\MTS - Models_Data.csv'

print(f"Checking {file_path} for 2025 models...")

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        brands = set()
        for row in reader:
            if row.get('Released Year') == '2025':
                count += 1
                print(f"Found: Brand='{row.get('Brand')}', Model='{row.get('Model #')}', Image='{row.get('Image URL')}'")
                brands.add(row.get('Brand'))
        
        print(f"\nTotal 2025 models: {count}")
        print(f"Brands in 2025: {brands}")

except Exception as e:
    print(f"Error reading file: {e}")
