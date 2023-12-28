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

router.get("/uploadfile/s3", async (req, res) => {
    try {
        let file = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: { mimetype: "application/pdf", filepath: new RegExp("http://13.233.130.34:3300/", "i") }
        })
        let ids = [];
        for (let i = 0; i < file.length; i++) {
            const element = file[i];
            if (element.path) {
                let file_dir = path.join(__dirname, "../../" + element.path)
                if (fs.existsSync(file_dir)) {
                    let uploads3 = await helperUtils.uploadfileToS3(
                        file_dir,
                        element.originalname,
                        element.mimetype,
                        'design')
                    if (uploads3) {
                        await dbMethods.updateOne({
                            collection: dbModels.FileUpload,
                            query: { _id: element._id },
                            update: { filepath: uploads3, oldpath: element.filepath }
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
            query: { mimetype: "application/pdf", filepath: new RegExp("https://", "i") }
        })
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            // Specify the S3 URL
            const s3Url = element.filepath;

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
            const fileStream = fs.createWriteStream(path.join(__dirname, "../../uploads/design/" + path.basename(s3Url)));
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
        res.send("success" + files.length)
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
})



module.exports = router

