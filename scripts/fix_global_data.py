import pandas as pd
import re

file_path = r'd:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\MTS - Year_Timeline.csv'

# Read CSV
df = pd.read_csv(file_path)

# Function to generate short title from long text
def generate_title(text):
    if not isinstance(text, str) or len(text) < 5:
        return text
    
    # Simple heuristic: extract key phrases or first few words
    # Better: Use simple extraction. 
    # For now, let's try to extract the first clause or subject.
    # Actually, for "The miter saw market reached a state of 'Battery First' maturity..."
    # We want "Battery First Maturity".
    
    # Pattern matching for specific phrases in quotes?
    match = re.search(r'"([^"]+)"', text)
    if match:
        return match.group(1).title()
    
    # If no quotes, take first 5-6 words?
    words = text.split()
    return " ".join(words[:6]).rstrip(',.').title() + "..."

# Filter for Global entries where Market_Notes is empty/NaN
global_mask = (df['Brand'] == 'Global')

count = 0
for index, row in df[global_mask].iterrows():
    # Helper to check if note is empty
    market_note_empty = pd.isna(row['Market_Notes']) or str(row['Market_Notes']).strip() == ''
    tech_note_empty = pd.isna(row['Tech_Notes']) or str(row['Tech_Notes']).strip() == ''
    
    # Process Market Data
    if market_note_empty and not pd.isna(row['Market Ttile']):
        long_text = row['Market Ttile']
        # Move long text to Notes
        df.at[index, 'Market_Notes'] = long_text
        # Generate new Short Title
        # Specific fixes from known data?
        # Let's just use the first 4-5 words for now to ensure it's distinct.
        # User can refine titles later with LLM if needed, but for now we fix structure.
        df.at[index, 'Market Ttile'] = generate_title(long_text)
        count += 1
        
    # Process Tech Data
    if tech_note_empty and not pd.isna(row['Tech Title']):
        long_text = row['Tech Title']
        df.at[index, 'Tech_Notes'] = long_text
        df.at[index, 'Tech Title'] = generate_title(long_text)

# Save back
df.to_csv(file_path, index=False)
print(f"Updated {count} Global rows.")
