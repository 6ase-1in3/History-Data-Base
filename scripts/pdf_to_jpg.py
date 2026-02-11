
import fitz  # PyMuPDF
import os

def pdf_to_jpg(pdf_path, output_folder):
    """
    Splits a PDF into JPG images, one per page.
    """
    doc = fitz.open(pdf_path)
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created output directory: {output_folder}")

    print(f"Processing: {pdf_path}")
    print(f"Total pages: {len(doc)}")

    for i, page in enumerate(doc):
        # Render the page to an image (pixmap)
        # matrix=fitz.Matrix(2, 2) makes the image 2x larger resolution (better quality)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) 
        
        output_filename = f"Page_{i+1:03d}.jpg"
        output_path = os.path.join(output_folder, output_filename)
        
        pix.save(output_path)
        print(f"Saved: {output_filename}")

    print(f"Done! {len(doc)} pages saved to {output_folder}")

if __name__ == "__main__":
    pdf_file = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\Miter_Saw_Design_Evolution.pdf"
    output_dir = r"d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\time record\Miter_Saw_Design_Evolution_Pages"
    
    if os.path.exists(pdf_file):
        pdf_to_jpg(pdf_file, output_dir)
    else:
        print(f"Error: File not found at {pdf_file}")
