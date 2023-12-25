const router = require("express").Router();
const path = require("path");
const fs = require("fs");

//import utils functions
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

router.get("/uploadfile/s3", async (req, res) => {
    try {
        let file = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: { "mimetype": "image/tiff" }
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

module.exports = router

