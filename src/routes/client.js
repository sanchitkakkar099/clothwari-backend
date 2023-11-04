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
module.exports = router;