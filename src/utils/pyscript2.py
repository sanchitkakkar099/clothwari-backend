import os
import io
from PIL import Image
import fitz
import fitz  # PyMuPDF

async def extract_images_from_pdf(pdf_path, output_folder, filename):
    doc = fitz.open(pdf_path)
    image_list = []

    for page_number in range(doc.page_count):
        page = doc[page_number]
        images = page.get_images(full=True)

        for img_index, img_info in enumerate(images):
            img_index += 1
            img_index_str = str(img_index).zfill(3)
            image_index_str = str(img_info[0])

            xref = img_info[0]
            base_image = doc.extract_image(xref)

            # Get the original color space of the image
            color_space = base_image.get('colorspace', '')

            image_bytes = base_image["image"]

            # Load the image using PIL (Pillow)
            image = Image.open(io.BytesIO(image_bytes))

            # Convert the image to the original color space if it's CMYK
            if color_space.lower() == 'cmyk':
                image = image.convert('CMYK')

            # Save the image
            image_filename = f"{output_folder}/{filename}_{page_number}_{img_index}.png"
            image_list.append({"name": os.path.basename(image_filename), "path": os.path.abspath(image_filename)})

            image.save(image_filename)

    doc.close()
    return image_list

async def main(pdf_path, output_folder,filename):
    try:
        extracted_images = await extract_images_from_pdf(pdf_path, output_folder,filename)
        
        for img_info in extracted_images:
            # print(f"Image Name: {img_info['name']}")
            print(f"{img_info['path']}")
            # print("=" * 30)

        return extracted_images
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python extract_images.py <pdf_path> <output_folder>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_folder = sys.argv[2]
    filename = sys.argv[3]

    asyncio.run(main(pdf_path, output_folder,filename))