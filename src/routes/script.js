const router = require("express").Router();
const path = require("path");
const fs = require("fs");

const AWS = require('aws-sdk');

// Set your AWS credentials and region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESSKEY,
    secretAccessKey: process.env.AWS_SECRETKEY,
    region: 'ap-south-1',
});
// Create an S3 object
const s3 = new AWS.S3();

//import utils functions
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

// const fastcsv = require("fast-csv");
// const { fileuploadController } = require("../controllers");
// const db = require("../models");

router.get("/uploadfile/s3", async (req, res) => {
    try {
        let file = await dbMethods.find({
            collection: dbModels.FileUpload,
            // query: { mimetype: "application/pdf", filepath: new RegExp("http://13.233.130.34:3300/", "i") }
            query: { mimetype: "application/pdf", path: { $exists: true }, filename: { $exists: true } }
        })
        let ids = [];
        for (let i = 0; i < file.length; i++) {
            const element = file[i];
            if (element.path) {
                let file_dir = path.join(__dirname, "../../" + element.path)
                if (fs.existsSync(file_dir)) {
                    let uploads3 = await helperUtils.uploadfileToS3(
                        file_dir,
                        element.filename,
                        element.mimetype,
                        'design')
                    if (uploads3) {
                        await dbMethods.updateOne({
                            collection: dbModels.FileUpload,
                            query: { _id: element._id },
                            update: { filepath: uploads3, odls3: element.filepath },
                        })
                        ids.push(element._id)
                    }
                }
            }

        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully uploaded on s3", ids))
    } catch (error) {
        console.log(error)
        res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.errorRes("Internal server error", error));
    }
})

router.get("/object", async (req, res) => {
    try {

        let files = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                mimetype: "application/pdf"
                , $and: [{ filepath: /https:/i },
                { filepath: { $nin: [/%20%/i] } }
                ]
            },
            // query: {
            //     mimetype: "application/pdf", path: { $exists: true }, filename: { $exists: true }
            // },
            sort: { _id: -1 }
        })
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            // Specify the S3 URL
            const s3Url = element.filepath;
            let file_name = path.basename(element.filepath)
            console.log(i, fs.existsSync(path.join(__dirname, "../../uploads/server_pdf/" + file_name)),
                path.join(__dirname, "../../uploads/server_pdf/" + file_name))
            if (!fs.existsSync(path.join(__dirname, "../../uploads/server_pdf/" + file_name))) {
                // Extract the bucket name and object key from the URL
                const urlParts = new URL(s3Url);
                const bucketName = urlParts.hostname.split('.')[0];
                const objectKey = urlParts.pathname.slice(1); // Remove the leading "/"

                console.log(bucketName, objectKey)
                console.log(element.filepath)
                // Create a parameters object for the getObject operation
                const params = {
                    Bucket: bucketName,
                    Key: objectKey,
                };
                const fileStream = fs.createWriteStream(path.join(__dirname, "../../uploads/server_pdf/" + file_name));
                // Use the getObject method to read the object from S3
                s3.getObject(params)
                    .createReadStream()
                    .pipe(fileStream)
                    .on('error', function (err) {
                        console.error('Error downloading S3 object:', err);
                    })
                    .on('close', function () {
                        console.log('File downloaded successfully!');
                    });
            }

        }
        res.send("success" + files.length)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})

router.get("/object/remove", async (req, res) => {
    try {
        // Extract the bucket name and object key from the URL
        const urlParts = new URL("https://clothwaris3.s3.ap-south-1.amazonaws.com/design/images%20%281%29.pdf");
        const bucketName = urlParts.hostname.split('.')[0];
        const objectKey = urlParts.pathname.slice(1); // Remove the leading "/"
        // Configure the parameters for deleting the object
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };

        // Delete the object
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error('Error deleting object:', err);
            } else {
                console.log('Object deleted successfully:', data);
            }
        });
        res.send("successfully deleted")
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})


router.get("/read", async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, "../../uploads/pdf_img/");

        // Read the contents of the directory
        fs.readdir(directoryPath, async (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            // List all files in the directory
            console.log('Files in the directory:');
            console.log("totals files", files.length)
        });
        res.send("read successfully")
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})


router.get("/extract", async (req, res) => {
    try {

        const directoryPath = path.join(__dirname, "../../uploads/server_pdf/");
        let files = await new Promise((resolve, reject) => {
            // Read the contents of the directory
            fs.readdir(directoryPath, async (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    reject(err);
                }
                resolve(files);
            })
        })
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            let filepath = path.join(directoryPath, element)
            // console.log(filepath)
            const pdfPath = filepath
            // console.log("-------------", pdfPath)
            let outputpath = path.join(__dirname + '../../../uploads/pdf_img')
            let outputFileName = path.basename(pdfPath, path.extname(pdfPath))
            fileuploadController.extractimage_from_pdf_python(
                pdfPath, outputpath, "", outputFileName
            )
            console.log(filepath, i)
            // console.log(extracted)


        }
        return res.send(files)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})


router.get("/extract/s3", async (req, res) => {
    try {

        const directoryPath = path.join(__dirname, "../../uploads/pdf_img/");
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
            const element = files[i];
            let filepath = path.join(directoryPath, element)
            let filename = path.basename(filepath, path.extname(filepath))
            let fileexists = await dbMethods.findOne({
                collection: dbModels.FileUpload,
                query: { mimetype: "application/pdf", filepath: new RegExp(filename) }
            })
            if (fileexists) {
                images.push(filename)
                let filetos3 = await helperUtils.uploadfileToS3(
                    filepath,
                    filename,
                    "image/png",
                    "pdf_img"
                )
                await dbMethods.updateOne({
                    collection: dbModels.FileUpload,
                    query: { _id: fileexists._id },
                    update: { pdf_extract_img: filetos3 }
                })

            }
        }
        return res.status(200).send(images)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})

router.get("/delete/colors", async (req, res) => {
    try {
        let colors = await dbMethods.findOne({
            collection: dbModels.Color,
            query: { "name": { $regex: new RegExp("^" + "lavend" + "$", "i") } }
        })
        res.send(helperUtils.successRes("successfully delete", colors))
    } catch (error) {

    }
})
module.exports = router

