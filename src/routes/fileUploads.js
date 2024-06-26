const router = require("express").Router();
const path = require("path");
const uploadad = require("../middlewares").uploadad;
const { uploadS3, auth, uploadS3original } = require("../middlewares")
const sharp = require('sharp');
const Jimp = require('jimp');
// const pdfPoppler = require('pdf-poppler');
const fs = require("fs");
// const pdf = require('pdf-poppler');

//import uti;s functions
const { dbMethods, dbModels, helperUtils } = require("../utils")

var pdf2img = require('pdf2img');
const util = require('util');

const { fileuploadController } = require("../controllers")

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
// router.post("/", uploadad.single('file'), async (req, res) => {
router.post("/", uploadS3.single('file'), async (req, res) => {
    try {
        // let filepath = req.file.path.replace(/\\/g, '/')
        // req.file.filepath = req.file.path.replace(/\\/g, '/')
        // req.file.filepath = 'http://' + process.env.HOST + "/" + req.file.filepath
        req.file.filepath = req.file.location;
        req.file.originalname = req.file.originalname
        req.file.mimetype = req.file.mimetype
        req.file.size = req.file.size

        let file = await dbMethods.insertOne({
            collection: dbModels.FileUpload,
            document: req.file
        })

        // if (req.file.mimetype == 'application/pdf') {
        //     const pdfPath = path.join(__dirname, "../../" + filepath);
        //     let extracted = await extractImagesFromPDF(pdfPath, file._id)
        //     console.log(extracted)
        // }

        res.send(helperUtils.successRes("Successfully uploaded file", file));
        return;

    } catch (error) {
        console.log(error)
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }

})

async function extractImagesFromPDF(file, fileId) {
    try {

        let outputpath = path.join(__dirname + '../../uploads/pdf_img')
        // let outputpath = path.dirname(file) 
        console.log("input file path", file)
        console.log(outputpath, path.basename(file, path.extname(file)),)

        // Ensure the output subdirectory exists
        let outputFileName = path.basename(file, path.extname(file))
        const outputSubDirPath = path.join(outputpath);
        console.log("outputSubDirPath", outputSubDirPath)
        const options = {
            type: 'jpg',
            size: 1024,
            density: 600,
            // outputdir: outputSubDirPath,
            outputname: outputFileName, // Set to null so that pdf2img doesn't add outputname as a subdirectory
            page: null
        };



        console.log(options)
        pdf2img.convert(file, async function (err, info) {
            if (err) {
                console.log(err)
                return false
            }
            else {
                console.log(info.message)
                // for (let i = 0; i < 1; i++) {
                //     const element = info.message[i];
                //     let filepath = path.join(__dirname, "../../" + element.path)
                //     let outputpath = path.join(__dirname + '../../../uploads/pdf_img/' + element.name)
                //     const content = fs.readFileSync(filepath);
                //     fs.writeFileSync(outputpath, content)
                //     console.log(outputpath, "filepath", filepath)
                //     await dbMethods.updateOne({
                //         collection: dbModels.FileUpload,
                //         query: { _id: fileId },
                //         update: {
                //             pdf_extract_img: 'http://' + process.env.HOST + "/uploads/pdf_img/" + element.name
                //         }
                //     })

                // }
                return info
            }
        });

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
router.post("/multiple", uploadS3original.array('file', 10), async (req, res) => {
    try {
        let files = [];
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            // element.filepath = element.path.replace(/\\/g, '/')
            // let filepath = element.filepath
            // element.filepath = 'http://' + process.env.HOST + "/" + element.filepath
            element.filepath = element.location
            element.originalname = element.originalname
            element.mimetype = element.mimetype
            element.size = element.size
            element.isoriginalname = true

            let file = await dbMethods.insertOne({
                collection: dbModels.FileUpload,
                document: element
            })
            files.push(file);
            // if (element.mimetype == 'image/tiff') {
            //     const tifpath = path.join(__dirname, "../../" + filepath);
            //     console.log("-------------")
            //     let extracted = await this.extractimgfromtiff(tifpath, file._id);
            //     console.log(extracted)
            // }
        }
        res.status(200).send(helperUtils.successRes("Successfully upload file", files));
        return;
    } catch (error) {
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

exports.extractimgfromtiff = async (filepath, fileId) => {
    try {
        let outputFileName = path.basename(filepath, path.extname(filepath)) + ".png";
        let imagepath = path.join(__dirname, '../../uploads/tif_img', outputFileName);
        // Read the TIFF image
        const image = await Jimp.read(filepath);

        // Convert the image to JPEG format
        await image.quality(100).write(imagepath)
        let img = 'http://' + process.env.HOST + `/uploads/tif_img/${outputFileName}`
        await dbMethods.updateOne({
            collection: dbModels.FileUpload,
            query: { _id: fileId },
            update: { tif_extract_img: img }
        })
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}


/**
 * Upload Single File for System
 * @route POST /uploads/multiple/pdf
 * @consumes multipart/form-data
 * @param {file} file.formData
 * @param {number} type.query.required - file type
 * @param {boolean} watermark.query.required - file type
 *
 *  1:design,
 *  5:design_pdf,
 *  99: default
 * @group FileUpload - File Upload operation
 * @returns {object} 200 - file path object
 * @returns {Error}  Error - Unexpected error
 */
router.post("/multiple/pdf", uploadad.array('file', 10), async (req, res) => {
    try {
        let files = [];
        let filestodeleted = [];
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            element.filepath = element.path.replace(/\\/g, '/')
            let filepath = element.filepath
            // element.filepath = 'http://' + process.env.HOST + "/" + element.filepath
            element.filepath = await helperUtils.uploadfileToS3(
                path.join(__dirname, "../../" + filepath),
                element.originalname,
                element.mimetype
            )
            element.originalname = element.originalname
            element.mimetype = element.mimetype
            element.size = element.size
            element.isoriginalname = true

            let file = await dbMethods.insertOne({
                collection: dbModels.FileUpload,
                document: element
            })
            files.push(file);
            if (element.mimetype == 'application/pdf') {
                const pdfPath = path.join(__dirname, "../../" + filepath);
                filestodeleted.push(pdfPath);
                console.log("-------------", pdfPath)
                let outputpath = path.join(__dirname + '../../../uploads/pdf_img')
                let outputFileName = path.basename(pdfPath, path.extname(pdfPath))
                fileuploadController.extractimage_from_pdf_python(
                    pdfPath, outputpath, file._id, outputFileName
                )
                console.log("extracted successfully")
            }
        }
        res.status(200).send(helperUtils.successRes("Successfully upload file", files));
        return;
    } catch (error) {
        console.log(error);
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.get("/pdf_s3", async (req, res) => {
    try {
        let pdfs = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                mimetype: "application/pdf", pdf_extract_img: {
                    $regex: "http://13.233.130.34:3300/uploads/pdf_img",
                    $options: "i"
                }
            }
        })
        for (let i = 0; i < pdfs.length; i++) {
            const url = pdfs[i].pdf_extract_img
            const uploadsIndex = url.indexOf("/uploads");

            if (uploadsIndex !== -1) {
                const desiredString = url.substring(uploadsIndex);
                console.log(desiredString);
                let image = path.join(__dirname, "../../" + desiredString)
                if (fs.existsSync(image)) {
                    console.log("----", image)
                    let s3 = await helperUtils.uploadfileToS3(
                        image,
                        path.basename(image),
                        "image/png",
                        "pdf_img"
                    )
                    await dbMethods.updateOne({
                        collection: dbModels.FileUpload,
                        query: { _id: pdfs[i]._id },
                        update: { pdf_extract_img: s3 }
                    })
                }
            }

        }
        res.send(helperUtils.successRes("successfully upload to s3", pdfs.length))
    } catch (error) {
        console.log(error);
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.post("/multiple/tiff", uploadS3original.array('file', 10), async (req, res) => {
    try {
        let files = [];
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            // element.filepath = element.path.replace(/\\/g, '/')
            // let filepath = element.filepath
            // element.filepath = 'http://' + process.env.HOST + "/" + element.filepath
            element.filepath = element.location
            element.originalname = element.originalname
            element.mimetype = element.mimetype
            element.size = element.size
            element.isoriginalname = true

            let file = await dbMethods.insertOne({
                collection: dbModels.FileUpload,
                document: element
            })
            files.push(file);
            // if (element.mimetype == 'image/tiff') {
            //     const tifpath = path.join(__dirname, "../../" + filepath);
            //     console.log("-------------")
            //     let extracted = await this.extractimgfromtiff(tifpath, file._id);
            //     console.log(extracted)
            // }
        }
        res.status(200).send(helperUtils.successRes("Successfully upload file", files));
        return;
    } catch (error) {
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.post("/drive/pdf", uploadS3.single('file'), async (req, res) => {
    try {
        let files = [];
        console.log(req.file)

        res.status(200).send(helperUtils.successRes("Successfully upload file", req.file.location));
        return;
    } catch (error) {
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.post("/multiple/pdf/v2", uploadad.array('file', 10), async (req, res) => {
    try {
        let files = [];
        let filestodeleted = [];
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            element.filepath = element.path.replace(/\\/g, '/')
            let filepath = element.filepath
            // element.filepath = 'http://' + process.env.HOST + "/" + element.filepath
            element.filepath = await helperUtils.uploadfileToS3(
                path.join(__dirname, "../../" + filepath),
                element.filename,
                element.mimetype
            )
            element.originalname = element.originalname
            element.mimetype = element.mimetype
            element.size = element.size

            let file = await dbMethods.insertOne({
                collection: dbModels.FileUpload,
                document: element
            })
            files.push(file);
            if (element.mimetype == 'application/pdf') {
                const pdfPath = path.join(__dirname, "../../" + filepath);
                filestodeleted.push(pdfPath);
                console.log("-------------", pdfPath)
                let outputpath = path.join(__dirname + '../../../uploads/pdf_img')
                let outputFileName = path.basename(pdfPath, path.extname(pdfPath))
                fileuploadController.extractimage_from_pdf_pythonv2(
                    pdfPath, outputpath, file._id, outputFileName
                )
                console.log("extracted successfully")
            }
        }
        res.status(200).send(helperUtils.successRes("Successfully upload file", files));
        return;
    } catch (error) {
        console.log(error);
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.post("/design/image", uploadS3.single("file"), async (req, res) => {
    try {
        res.status(200).send(helperUtils.successRes("Successfully upload file", req.file.location));
        return;
    } catch (error) {
        res.send(helperUtils.errorRes("Bad Request", error.message));
        return;
    }
})

router.post("/save",
    fileuploadController.filesave)


router.get("/extract/s3", async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, "../../uploads/design/");
        let files = await new Promise((resolve, reject) => {
            fs.readdir(directoryPath, async (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    reject(err);
                }
                resolve(files);
            })
        })
        let images = []
        for (let i = 0; i < files.length; i++) {
            let element = files[i];
            let filepath = path.join(directoryPath, element)
            let filename = path.basename(filepath, path.extname(filepath))
            let fileexists = await dbMethods.findOne({
                collection: dbModels.FileUpload,
                query: { mimetype: "image/tiff", $and: [{ filepath: new RegExp(filename, "i") }] }
            })
            if (fileexists && fileexists.filepath.includes("http://")) {
                images.push(filename)
                let filetos3 = await helperUtils.uploadfileToS3(
                    filepath,
                    fileexists.originalname,
                    "image/tiff",
                    "design"
                )
                await dbMethods.updateOne({
                    collection: dbModels.FileUpload,
                    query: { _id: fileexists._id },
                    update: { filepath: filetos3, isoriginalname: true }
                })
                fs.unlink(filepath, (err) => {
                    if (err) throw err;
                    console.log(filepath, ' was deleted');
                });
            }
        }
        return res.status(200).send(images)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})
module.exports = router;