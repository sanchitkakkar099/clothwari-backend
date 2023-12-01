const router = require("express").Router();
const path = require("path");
const uploadad = require("../middlewares").uploadad;
const sharp = require('sharp');
const pdfPoppler = require('pdf-poppler');
const fs = require("fs");

//import uti;s functions
const { dbMethods, dbModels, helperUtils } = require("../utils")


/**
 * Upload Single File for System
 * @route POST /uploads
 * @consumes multipart/form-data
 * @param {file} file.formData
 * @param {number} type.query.required - file type
 * @param {boolean} watermark.query.required - file type
 *
 *  1:design,
 *  99: default
 * @group FileUpload - File Upload operation
 * @returns {object} 200 - file path object
 * @returns {Error}  Error - Unexpected error
 */
router.post("/", uploadad.single('file'), async (req, res) => {
    try {
        let filepath = req.file.path.replace(/\\/g, '/')
        req.file.filepath = req.file.path.replace(/\\/g, '/')
        req.file.filepath = 'http://' + process.env.HOST + "/" + req.file.filepath
        req.file.originalname = req.file.originalname
        req.file.mimetype = req.file.mimetype
        req.file.size = req.file.size

        if (req.file.mimetype == 'application/pdf') {
            const pdfPath = path.join(__dirname, "../../" + filepath);
            const outputDirectory = path.join(__dirname, "../../uploads/pdf_img");
            await extractImagesFromPDF(pdfPath, outputDirectory); // Adjusted output directory
            let extractfile = path.join(__dirname, "../../uploads/pdf_img/" + path.basename(pdfPath, path.extname(pdfPath)) + "-1.png")
            if (fs.existsSync(extractfile)) {
                if (req.query.watermark == 'true') {
                    let thumbnail = await createThumbnail(extractfile)
                    if (thumbnail) {
                        req.file.pdf_extract_img = thumbnail
                        req.file.thumbnail = thumbnail
                    }
                }
                req.file.pdf_extract_img = 'http://' + process.env.HOST + "/uploads/pdf_img/" + path.basename(req.file.filepath, path.extname(req.file.filename)) + "-1.png"
            }
        }

        let file = await dbMethods.insertOne({
            collection: dbModels.FileUpload,
            document: req.file
        })
        res.send(helperUtils.successRes("Successfully uploaded file", file));
        return;

    } catch (error) {
        console.log(error)
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }

})

async function extractImagesFromPDF(pdfPath, outputPath) {
    try {
        const options = {
            format: 'png',
            out_dir: outputPath,// path.dirname(outputPath),
            out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
            page: null
        };
        let img = await pdfPoppler.convert(pdfPath, options);
        console.log('Images extracted successfully.');
        return img;
    } catch (error) {
        console.log("extractImagesFromPDF ===========", error);
        return false;
    }
}

async function createThumbnail(filepath) {
    try {
        let filename = path.basename(filepath)
        const outputImagePath = path.join(__dirname, "../../uploads/watermark/" + filename);
        // Watermark text and style
        const watermarkText = 'Clothwari';
        const watermarkOptions = {
            font: 'Arial',
            fontSize: 30,
            fontColor: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.5)',
            rotate: 0,
        };

        // Read the input image
        const image = sharp(filepath);
        // Get image metadata (width and height)
        const metadata = await image.metadata();

        // Calculate the center position for the watermark
        const centerX = Math.floor(metadata.width / 2);
        const centerY = Math.floor(metadata.height / 2);

        // Create an SVG string with explicit width and height matching the image
        const svgText = `<svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg"><text x="${centerX}" y="${centerY}" font-family="${watermarkOptions.font}" font-size="${watermarkOptions.fontSize}" fill="${watermarkOptions.fontColor}" transform="rotate(${watermarkOptions.rotate},${centerX},${centerY})" text-anchor="middle" alignment-baseline="middle">${watermarkText}</text></svg>`;

        // Add the watermark text to the image
        const result = await image
            .clone()
            .composite([
                {
                    input: Buffer.from(svgText),
                    left: 0,
                    top: 0,
                },
            ])
            .toFile(outputImagePath);
        return 'http://' + process.env.HOST + "/uploads/watermark/" + filename

    } catch (error) {
        console.log(error)
        return false
    }
}

/**
 * Upload Single File for System
 * @route POST /uploads/multiple
 * @consumes multipart/form-data
 * @param {file} file.formData
 * @param {number} type.query.required - file type
 * @param {boolean} watermark.query.required - file type
 *
 *  1:design,
 *  99: default
 * @group FileUpload - File Upload operation
 * @returns {object} 200 - file path object
 * @returns {Error}  Error - Unexpected error
 */
router.post("/multiple", uploadad.array('file', 10), async (req, res) => {
    try {
        let files = [];
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            element.filepath = element.path.replace(/\\/g, '/')
            element.filepath = 'http://' + process.env.HOST + "/" + element.filepath
            element.originalname = element.originalname
            element.mimetype = element.mimetype
            element.size = element.size

            let file = await dbMethods.insertOne({
                collection: dbModels.FileUpload,
                document: element
            })
            files.push(file);
        }
        res.status(200).send(helperUtils.successRes("Successfully upload file", files));
        return;
    } catch (error) {
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

module.exports = router;