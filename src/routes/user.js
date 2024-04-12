const { auth } = require("../middlewares").auth;

const router = require("express").Router()

//import userController
const userController = require("../controllers").userController

//import auth
const { adminAuth } = require("../middlewares").adminAuth

const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils")

const fs = require("fs");
const path = require("path");

/**
 * @typedef usermodel
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {string} role
 */
/**
 * create admin role user
 * @route POST /user/admin/create
 * @param {usermodel.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @returns {Error}  Error - Unexpected error
 */
router.post("/admin/create",
    userController.createAdmin
)

/**
 * @typedef userlogin
 * @property {string} email
 * @property {string} password
 */
/**
 * create admin role user
 * @route POST /user/admin/login
 * @param {userlogin.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @returns {Error}  Error - Unexpected error
 */
router.post("/admin/login",
    userController.adminlogin
);

/**
 * create admin role user
 * @route POST /user/designer/create
 * @param {usermodel.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/designer/create",
    adminAuth,
    userController.createDesigner
)

/**
 * @typedef logoutusermodel
 * @property {string} userId
 * @property {string} lastInActiveTime
 */
/**
 * create admin role user
 * @route POST /user/logout
 * @param {logoutusermodel.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/logout",
    userController.logoutuser)

/**
 * create admin role user
 * @route POST /user/lastactivetime
 * @param {logoutusermodel.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/lastactivetime",
    userController.logoutuser)


/**
 * @typedef passwordchange
 * @property {string} password
 */
/**
 * create admin role user
 * @route POST /user/password/change
 * @param {passwordchange.model} data.body.required
 * @group User - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/password/change",
    auth,
    userController.userpasswordchaange)

router.get("/tiff/s3", async (req, res) => {
    try {
        let tiffs = await dbMethods.find({
            collection: dbModels.FileUpload,
            query: {
                _id: "6618ffd13afe17b91322f6b8",
                mimetype: "image/tiff", filepath: {
                    $regex: "http://43.204.194.160:3300/uploads/design",
                    $options: "i"
                }
            },
            limit: 10,
            sort: { _id: -1 }
        })
        for (let i = 0; i < tiffs.length; i++) {
            const element = tiffs[i];
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
                if (tiffs3) {
                    await dbMethods.updateOne({
                        collection: dbModels.FileUpload,
                        query: { _id: element._id },
                        update: { filepath: tiffs3 }
                    })
                }
                fs.unlink(tiff_path, (err) => {
                    if (err) throw err;
                    console.log(tiff_path, ' was deleted');
                });
            }
        }
        return res.send("successfully")
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})
module.exports = router;