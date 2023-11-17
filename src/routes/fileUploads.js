const router = require("express").Router();
const path = require("path");
const uploadad = require("../middlewares").uploadad;
const sharp = require('sharp');

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
        if (req.query.watermark == 'true') {
            // Input and output file paths
            req.file.filepath = req.file.path.replace(/\\/g, '/');
            const inputImagePath = path.join(__dirname, "../../" + req.file.filepath);
            const outputImagePath = path.join(__dirname, "../../uploads/watermark/" + req.file.filename);

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
            const image = sharp(inputImagePath);
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
            req.file.originalname = req.file.originalname
            req.file.mimetype = req.file.mimetype
            req.file.size = req.file.size
            req.file.filepath = 'http://' + process.env.HOST + "/uploads/watermark/" + req.file.filename
        } else {
            req.file.filepath = req.file.path.replace(/\\/g, '/')
            req.file.filepath = 'http://' + process.env.HOST + "/" + req.file.filepath
            req.file.originalname = req.file.originalname
            req.file.mimetype = req.file.mimetype
            req.file.size = req.file.size
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