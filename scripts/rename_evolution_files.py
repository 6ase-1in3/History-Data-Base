import os
import shutil

# Paths
timeline_project_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project'
pages_dir = os.path.join(timeline_project_path, r'public\data\time record\Miter_Saw_Design_Evolution_Pages')
movie_dir = os.path.join(timeline_project_path, r'public\data\time record\Movie')

# Mapping: Old Prefix -> New Prefix
# Order: Ergonomics(001), Portable(002), Sliding(003), Cutting(004), Electronic(005), Visual(006), Dust(007), Durability(008), Safety(009)
prefix_map = {
    '009': '001', # Ergonomics
    '002': '002', # Portable (No change)
    '001': '003', # Sliding
    '006': '004', # Cutting
    '005': '005', # Electronic (No change)
    '007': '006', # Visual
    '004': '007', # Dust
    '008': '008', # Durability (No change)
    '003': '009', # Safety
}

def rename_files_in_dir(directory):
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return

    print(f"Processing {directory}...")
    files = [f for f in os.listdir(directory) if f.startswith('00') and (f.endswith('.jpg') or f.endswith('.mp4'))]
    
    # Validation
    for old_p in prefix_map.keys():
        found = False
        for f in files:
            if f.startswith(old_p):
                found = True
                break
        if not found:
            print(f"Warning: No file found with prefix {old_p} in {directory}")

    # Step 1: Rename to temp names to avoid collision
    temp_map = {} # old_filename -> temp_filename
    final_map = {} # temp_filename -> new_filename

    for filename in files:
        prefix = filename[:3]
        if prefix in prefix_map:
            new_prefix = prefix_map[prefix]
            suffix = filename[3:]
            new_filename = new_prefix + suffix
            
            temp_filename = f"TEMP_{filename}"
            temp_map[filename] = temp_filename
            final_map[temp_filename] = new_filename
            
            print(f"Plan: {filename} -> {new_filename}")

    # Execute Step 1: Rename to TEMP
    for old_name, temp_name in temp_map.items():
        old_path = os.path.join(directory, old_name)
        temp_path = os.path.join(directory, temp_name)
        try:
            os.rename(old_path, temp_path)
        except OSError as e:
            print(f"Error renaming {old_name} to {temp_name}: {e}")

    # Execute Step 2: Rename TEMP to Final
    for temp_name, final_name in final_map.items():
        temp_path = os.path.join(directory, temp_name)
        final_path = os.path.join(directory, final_name)
        try:
            os.rename(temp_path, final_path)
            print(f"Renamed: {temp_name.replace('TEMP_', '')} -> {final_name}")
        except OSError as e:
            print(f"Error renaming {temp_name} to {final_name}: {e}")

if __name__ == '__main__':
    rename_files_in_dir(pages_dir)
    rename_files_in_dir(movie_dir)
    print("Renaming completed.")
