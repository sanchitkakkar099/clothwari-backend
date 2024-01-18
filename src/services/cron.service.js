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
}

const extractedpdf = async () => {
    try {

        let pdfs = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                _id: "65a8d9d832f89a67a4211af0",
                mimetype: "application/pdf", pdf_extract_img: {
                    $regex: "http://13.233.130.34:3300/uploads/pdf_img",
                    $options: "i"
                }
            },
            limit: 1,
            sort: { _id: -1 }
        })

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
                }
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
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}