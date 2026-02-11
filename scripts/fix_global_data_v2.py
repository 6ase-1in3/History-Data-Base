import csv
import os

file_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\MTS - Year_Timeline.csv'
temp_path = file_path + '.tmp'

# Use utf-8-sig to handle Excel BOM
with open(file_path, mode='r', encoding='utf-8-sig', newline='') as infile, \
     open(temp_path, mode='w', encoding='utf-8-sig', newline='') as outfile:
    
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    count = 0
    for row in reader:
        if row['Brand'] == 'Global':
            # Market Data Migration
            m_note = row.get('Market_Notes', '')
            m_title = row.get('Market Ttile', '')
            
            # If expanding note is empty but title exists (long text in title slot)
            if (not m_note or m_note.strip() == '') and (m_title and len(m_title) > 0):
                # Move Full Title to Notes
                row['Market_Notes'] = m_title
                
                # Generate Short Title (First 6 words)
                words = m_title.split()
                short_title = " ".join(words[:6]).rstrip(',.') + "..."
                row['Market Ttile'] = short_title
                count += 1
                
            # Tech Data Migration
            t_note = row.get('Tech_Notes', '')
            t_title = row.get('Tech Title', '')
            
            if (not t_note or t_note.strip() == '') and (t_title and len(t_title) > 0):
                row['Tech_Notes'] = t_title
                words = t_title.split()
                short_title = " ".join(words[:6]).rstrip(',.') + "..."
                row['Tech Title'] = short_title
                
        writer.writerow(row)

os.replace(temp_path, file_path)
print(f"Updated {count} Global rows with Strict Title/Note mapping.")
