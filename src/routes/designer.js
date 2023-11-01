const router = require("express").Router()

//controller
const { designerController } = require("../controllers")

//middlewares
const { auth } = require("../middlewares").auth;

/**
 * @typedef designermodel
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {boolean} onlyUpload
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


module.exports = router;