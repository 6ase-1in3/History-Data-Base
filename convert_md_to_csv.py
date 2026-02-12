
import pandas as pd
import re
import io

def convert_md_to_csv():
    md_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\master_matrix.md'
    csv_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\master_matrix_ZH.csv'

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Filter table lines
    table_lines = [line for line in lines if line.strip().startswith('|')]
    
    # Remove alignment row (second row usually)
    if len(table_lines) > 1 and '---' in table_lines[1]:
        table_lines.pop(1)

    # Convert to string buffer
    md_content = ''.join(table_lines)

    # Use pandas to read markdown table
    # read_csv with sep='|' might be tricky due to edge pipes. 
    # Better to manually process or use a library, but pandas read_csv with sep='|' and some cleaning works.
    
    # Custom parsing
    data = []
    headers = []
    
    for i, line in enumerate(table_lines):
        # Remove outer pipes and split
        row = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if i == 0:
            headers = row
        else:
            data.append(row)

    df = pd.DataFrame(data, columns=headers)
    
    # Validate headers are what we expect for RevolutionData
    # Expected: Year, Safety, Sliding, Ergonomics, Cutting, Visual, Durability, Dust, Electronic, Portable
    print("Headers match:", headers)

    df.to_csv(csv_path, index=False, encoding='utf-8-sig') # BOM for Excel compatibility if needed
    print(f"Updated {csv_path}")

if __name__ == '__main__':
    convert_md_to_csv()
