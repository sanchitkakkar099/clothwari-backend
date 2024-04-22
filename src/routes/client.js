const router = require("express").Router();

//import controller
const { clientController } = require("../controllers");

///import middleware authentication 
const { auth } = require("../middlewares").auth


/**
 * @typedef clientmodel
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} allowLoginTime
 * @property {number} allowLoginSec
 */
/**
 * create admin role user
 * @route POST /client/create
 * @param {clientmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    clientController.clientCreateEdit
);

/**
* get client by id
* @route GET /client/byId/{id}
* @param {string} id.path.required
* @group Client - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/byId/:id",
    auth,
    clientController.clientById
);

/**
 * delete client by id
 * @route DELETE /client/byId/{id}
 * @param {string} id.path.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    clientController.clientdelete
);

/**
 * get client list with pagination and searching
 * @route post /client/list
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    clientController.clientList
);

/**
 * @typedef addtocartmodel
 * @property {Array<string>} designId
 */
/**
 * get client list with pagination and searching
 * @route post /client/add/cart
 * @param {addtocartmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/add/cart",
    auth,
    clientController.clientaddTocart
);

/**
 * get client list with pagination and searching
 * @route POST /client/my/design
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/my/design",
    auth,
    clientController.getmyagdesignlist
);


/**
* get client my design by id
* @route GET /client/my/design/byId/{id}
* @param {string} id.path.required
* @group Client - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/my/design/byId/:id",
    auth,
    clientController.clientDesignById
);


/**
 * @typedef clientLoginModel
 * @property {string} clientId
 */
/**
 * client login credentails by admin request
 * @route post /client/login/byadmin
 * @param {clientLoginModel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/login/byadmin",
    // auth,
    clientController.clientLogin
);

router.post("/cart/save",
    auth,
    clientController.clientcartsave)

router.get("/drop/down/list",
    auth,
    clientController.clientdropdown)

module.exports = router;