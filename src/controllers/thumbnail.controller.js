const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");
const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_S3_ACCESSKEY,
    secretAccessKey: process.env.AWS_S3_SECRETKEY,
    region: 'ap-south-1'
})

const fs = require("fs");
const path = require("path")

exports.renames3filestooriginal = async (req, res) => {
try {
        let file = await dbMethods.findOne({
            collection: dbModels.FileUpload,
            query: { filepath: new RegExp("https://clothwaris3.s3.ap-south-1.amazonaws.com", "i"), isoriginalname: { $exists: false } }
            // query: { _id: "66266a98aaa2262c7984ee52" }
        })
        if (file) {
            let basename = path.basename(file.filepath)
            if (basename == file.originalname) {
                console.log("add isoriginalname")
                await dbMethods.updateOne({
                    collection: dbModels.FileUpload,
                    query: { _id: file._id },
                    update: { isoriginalname: true }
                })
            } else {
                //rename file into the s3
                // Parameters for copying the file
                let path = file.filepath.replace('https://clothwaris3.s3.ap-south-1.amazonaws.com/', '')
                let arr = path.split("/")
                let key = arr.length ? arr[0] : 'design'
                const copyParams = {
                    Bucket: process.env.AWS_BUCKET,
                    CopySource: file.filepath,
                    Key: `${key}/${file.originalname}`
                };

                const deleteParams = {
                    Bucket: process.env.AWS_BUCKET,
                    Key: path
                };

                let copyfile = await s3.copyObject(copyParams).promise();
                if (copyfile) {
                    await dbMethods.updateOne({
                        collection: dbModels.FileUpload,
                        query: { _id: file._id },
                        update: {
                            filepath: 'https://clothwaris3.s3.ap-south-1.amazonaws.com/' + arr[0] + "/" + file.originalname,
                            isoriginalname: true
                        }
                    })

                    // Once copied, delete the original file
                    s3.deleteObject(deleteParams, (err, data) => {
                        if (err) {
                            console.error('Error deleting object:', err);
                        } else {
                            console.log('Original file deleted successfully:', data);
                        }
                    });
                }
            }
        }
        return true
    } catch (error) {
        console.log("error", error);
        return false
    }

}