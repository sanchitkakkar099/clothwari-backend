
# import sys
# import fitz
# import os

# def extract_images_from_pdf(pdf_path, output_folder):
#     doc = fitz.open(pdf_path)
#     image_list = []

#     for page_number in range(doc.page_count):
#         page = doc[page_number]
#         images = page.get_images(full=True)

#         for img_index, img_info in enumerate(images):
#             img_index += 1
#             img_index_str = str(img_index).zfill(3)
#             image_index_str = str(img_info[0])

#             xref = img_info[0]
#             base_image = doc.extract_image(xref)
#             image_bytes = base_image["image"]

#             image_filename = f"{output_folder}/image_{page_number + 1}_{img_index_str}_{image_index_str}.png"
#             image_list.append({"name": os.path.basename(image_filename), "path": os.path.abspath(image_filename)})

#             with open(image_filename, "wb") as image_file:
#                 image_file.write(image_bytes)

#     doc.close()
#     return image_list

# if __name__ == "__main__":
#     if len(sys.argv) != 3:
#         print("Usage: python extract_images.py <pdf_path> <output_folder>")
#         sys.exit(1)

#     pdf_path = sys.argv[1]
#     output_folder = sys.argv[2]

#     extracted_images = extract_images_from_pdf(pdf_path, output_folder)

#     for img_info in extracted_images:
#         # print(f"Image Name: {img_info['name']}")
#         print(f"{img_info['path']}")
#         # print("=" * 30)


import asyncio
import fitz  # PyMuPDF
import os
import sys

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
            image_bytes = base_image["image"]
            image_format = base_image["ext"]  # Retrieve the image format

            image_filename = f"{output_folder}/{filename}{page_number+1}{img_index_str}.{image_format}"
            image_list.append({"name": os.path.basename(image_filename), "path": os.path.abspath(image_filename)})

            with open(image_filename, "wb") as image_file:
                image_file.write(image_bytes)

            print(f"Image Format: {image_format}")  # Print the image format along with the path

    doc.close()
    return image_list

async def main(pdf_path, output_folder, filename):
    try:
        extracted_images = await extract_images_from_pdf(pdf_path, output_folder, filename)
        
        for img_info in extracted_images:
            print(f"Image Name: {img_info['name']}")
            print(f"Image Path: {img_info['path']}")
            print("=" * 30)

        return extracted_images
    except Exception as e:
        return str(e)

if _name_ == "_main_":
    if len(sys.argv) != 4:
        print("Usage: python extract_images.py <pdf_path> <output_folder> <filename>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_folder = sys.argv[2]
    filename = sys.argv[3]

    asyncio.run(main(pdf_path, output_folder, filename))
