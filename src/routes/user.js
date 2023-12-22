const { auth } = require("../middlewares").auth;

const router = require("express").Router()

//import userController
const userController = require("../controllers").userController

//import auth
const { adminAuth } = require("../middlewares").adminAuth

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
module.exports = router;