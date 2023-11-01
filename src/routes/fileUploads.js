const router = require("express").Router();
const path = require("path");
const uploadad = require("../middlewares").uploadad;

//import uti;s functions
const { dbMethods, dbModels, helperUtils } = require("../utils")


/**
 * Upload Single File for System
 * @route POST /uploads
 * @consumes multipart/form-data
 * @param {file} file.formData
 * @param {number} type.query.required - file type
 *
 *  1:design,
 *  99: default
 * @group FileUpload - File Upload operation
 * @returns {object} 200 - file path object
 * @returns {Error}  Error - Unexpected error
 */
router.post("/", uploadad.single('file'), async (req, res) => {
    try {
        req.file.filepath = req.file.path.replace(/\\/g, '/')
        req.file.filepath = 'http://' + process.env.HOST + "/" + req.file.filepath
        req.file.originalname = req.file.originalname
        req.file.mimetype = req.file.mimetype
        req.file.size = req.file.size

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