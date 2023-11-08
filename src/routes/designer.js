const router = require("express").Router()

//controller
const { designerController } = require("../controllers")

//middlewares
const { auth } = require("../middlewares").auth;

/**
 * @typedef designermodel
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {boolean} onlyUpload
 * @property {Array<string>} permissions
 */
/**
 * create admin role user
 * @route POST /designer/create
 * @param {designermodel.model} data.body.required
 * @group Designer - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    designerController.designerCreateEdit);


/**
* get designer by id
* @route GET /designer/byId/{id}
* @param {string} id.path.required
* @group Designer - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/byId/:id",
    auth,
    designerController.designerById
);



/**
 * delete designer by id
 * @route DELETE /designer/byId/{id}
 * @param {string} id.path.required
 * @group Designer - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    designerController.designerdelete
);


/**
 * get designer list with pagination and searching
 * @route post /designer/list
 * @param {categoryListmodel.model} data.body.required
 * @group Designer - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    designerController.designerList
);

/**
 * @typedef designerLoginModel
 * @property {string} designerById
 */
/**
 * designer login credentails by admin request
 * @route post /designer/login/byadmin
 * @param {designerLoginModel.model} data.body.required
 * @group Designer - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @returns {Error}  Error - Unexpected error
 */
router.post("/login/byadmin",
    designerController.designerLogin
);

/**
 * get permission list
 * @route GET /designer/permissions/list
 * @group Designer - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/permissions/list",

    designerController.designerPermissionslist
);


module.exports = router;