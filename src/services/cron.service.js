const cronJob = require("cron").CronJob
const fs = require("fs");
const path = require("path")

//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");

module.exports = async () => {

    //check pdf those have successfully extracted images
    let removepdffromserver = new cronJob('*/2 * * * *', extractedpdf)
    removepdffromserver.start()

    let uploadtifpngtos3 = new cronJob('*/3 * * * *', extracttiffuploads3)
    uploadtifpngtos3.start()
}

const extractedpdf = async () => {
    try {

        let pdfs = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                mimetype: "application/pdf", pdf_extract_img: {
                    $regex: "http://43.204.194.160:3300/uploads/pdf_img",
                    $options: "i"
                },
                pdf_img_not_found: { $exists: false }
            },
            limit: 10,
            sort: { _id: -1 }
        })

        let notfound_ids = []
        for (let i = 0; i < pdfs.length; i++) {
            const element = pdfs[i];
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
                } else notfound_ids.push(element._id)
                if (fs.existsSync(image)) {
                    fs.unlink(image, (err) => {
                        if (err) throw err;
                        console.log(image, ' was deleted');
                    });
                }
                let pdf = path.join(__dirname, "../../", pdfs[i].path)
                if (fs.existsSync(pdf)) {
                    fs.unlink(pdf, (err) => {
                        if (err) throw err;
                        console.log(image, ' was deleted');
                    });
                }
            }
        }
        await dbMethods.updateMany({
            collection: dbModels.FileUpload,
            query: { _id: { $in: notfound_ids } },
            update: { pdf_img_not_found: true }
        })
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}


const extracttiffuploads3 = async () => {
    try {

        let tiffs = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                mimetype: "image/tiff", tif_extract_img: {
                    $regex: "http://43.204.194.160:3300/uploads/tif_img",
                    $options: "i"
                }
            },
            limit: 10,
            sort: { _id: -1 }
        })

        for (let i = 0; i < tiffs.length; i++) {
            const element = tiffs[i];
            let path1 = element.tif_extract_img.replace("http://43.204.194.160:3300", "")
            path1 = path.join(__dirname, "../../", path1);
            let s3 = ""
            if (fs.existsSync(path1)) {
                console.log("exists")
                s3 = await helperUtils.uploadfileToS3(
                    path1,
                    path.basename(path1),
                    "image/png",
                    "pdf_img"
                )
                console.log(s3)
            }
            let tiff_path = path.join(__dirname, "../../", element.path);
            let tiffs3 = ""
            if (fs.existsSync(tiff_path)) {
                //upload to s3
                tiffs3 = await helperUtils.uploadfileToS3(
                    tiff_path,
                    path.basename(tiff_path),
                    element.mimetype,
                    'design'
                )
            }
            if (s3 && tiffs3) {
                await dbMethods.updateOne({
                    collection: dbModels.FileUpload,
                    query: { _id: element._id },
                    update: { filepath: tiffs3, tif_extract_img: s3 }
                })
            }
            if (fs.existsSync(path1) && fs.existsSync(tiff_path)) {
                fs.unlink(path1, (err) => {
                    if (err) throw err;
                    console.log(path1, ' was deleted');
                });
                fs.unlink(tiff_path, (err) => {
                    if (err) throw err;
                    console.log(tiff_path, ' was deleted');
                });
            }
        }

        return true
    } catch (error) {
        console.log(error)
        return false;
    }
}