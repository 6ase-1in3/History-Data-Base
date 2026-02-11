import re
import csv
import os

def split_models():
    file_path = 'public/data/time record/master_matrix.csv'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find models in brackets
    # 〖...〗
    pattern = re.compile(r'〖(.*?)〗')

    def replace_match(match):
        text = match.group(1)
        if '/' in text:
            # Handle cases like "DW713/715" or "KS 88/120"
            parts = text.split('/')
            parts = [p.strip() for p in parts]
            
            # Logic to reconstruct full model name for subsequent parts
            new_parts = []
            if len(parts) > 0:
                first = parts[0]
                new_parts.append(f'〖{first}〗')
                
                # Analyze prefix of first part
                # e.g. DW713 -> prefix DW
                # KS 88 -> prefix KS 
                # Match letters followed by digits?
                prefix_match = re.match(r'^([A-Za-z\s\-]+)', first)
                prefix = prefix_match.group(1) if prefix_match else ''

                # Filter: Only split if we have a valid letter-prefix (avoids splitting dates like 2023/1230)
                if not prefix:
                   # No prefix found (starts with digit usually), so skip splitting logic for safety
                   # or just return original text?
                   # Return original full string including brackets?
                   # Actually, inside replace_match, returning match.group(0) is better if we abort.
                   return f'〖{text}〗'
                
                for i in range(1, len(parts)):
                    part = parts[i]
                    # If part is just digits (or short), probably shares prefix
                    # e.g. "715" (DW is prefix)
                    # e.g. "120" (KS is prefix)
                    # BUT if part looks like full model (e.g. has letters), keep as is.
                    # Heuristic: if part starts with digit, prepend prefix.
                    if re.match(r'^\d', part) and prefix:
                        full_model = prefix.strip() + part # remove trailing space from prefix if confusing? 
                        # Wait, KS 88. Prefix "KS ". Part "120". Combined "KS 120". Correct.
                        # DW713. Prefix "DW". Part "715". Combined "DW715". Correct.
                        if first.endswith(' ') and not prefix.endswith(' '):
                             full_model = prefix + ' ' + part
                        else:
                             full_model = prefix + part
                        
                        # Fix for space handling
                        # KS 88: prefix match is "KS ". 
                        # DW713: prefix match is "DW".
                        
                        new_parts.append(f'〖{full_model}〗')
                    else:
                        new_parts.append(f'〖{part}〗')
            
            return '/'.join(new_parts)
        
        return match.group(0) # No change

    new_content = pattern.sub(replace_match, content)

    # Show diff/changes?
    if new_content != content:
        print("Changes detected. Writing back to file...")
        # Find raw diffs for logging
        for match in pattern.finditer(content):
            original = match.group(0)
            replacement = replace_match(match)
            if original != replacement:
                print(f"Replacing: {original} -> {replacement}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
    else:
        print("No changes needed.")

if __name__ == "__main__":
    # Ensure current directory is project root
    if not os.path.exists('public/data'):
        # Fallback if running from scripts dir
        os.chdir('..')
    
    split_models()
