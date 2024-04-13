const { marketingController } = require("../controllers");
const { auth } = require("../middlewares").auth;

const router = require("express").Router()

/**
 * @typedef marketaddmodel
 * @property {string} _id
 * @property {string} title
 * @property {string} image
 * @property {string} description
 */
/**
 * create and edit the marking object
 * @route POST /market/create
 * @param {marketaddmodel.model} data.body.required
 * @group Market - operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    marketingController.marketingAdding
);

/**
* get market by id
* @route GET /market/byId/{id}
* @param {string} id.path.required
* @group Market - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/byId/:id",
    auth,
    marketingController.getMarketDataById
);


/**
 * delete market by id
 * @route DELETE /market/byId/{id}
 * @param {string} id.path.required
 * @group Market - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    marketingController.deleteMarketDataById
);


/**
 * get market list with pagination and searching
 * @route post /market/list
 * @param {categoryListmodel.model} data.body.required
 * @group Market - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    marketingController.marketingList
);


/**
 * @typedef salespersonmodel
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} phone
 */
/**
 * create admin role user
 * @route POST /market/salesperson/create
 * @param {salespersonmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/salesperson/create",
    auth,
    marketingController.salespersonCreateEdit
);

/**
* get client by id
* @route GET /market/salesperson/byId/{id}
* @param {string} id.path.required
* @group Client - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/salesperson/byId/:id",
    auth,
    marketingController.slaespersonById
);

/**
 * delete client by id
 * @route DELETE /market/salesperson/byId/{id}
 * @param {string} id.path.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/salesperson/byId/:id",
    auth,
    marketingController.slaespersondelete
);

/**
 * get client list with pagination and searching
 * @route post /market/salesperson/list
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/salesperson/list",
    auth,
    marketingController.salespersonList
);

/**
 * get client list with pagination and searching
 * @route post /market/drive/create
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/drive/create",
    auth,
    marketingController.createmergepdf
);
router.post("/drive/list",
    auth,
    marketingController.drivelist)

router.get("/salesperson/permission/list",
    marketingController.salespersonpermissionlist)

/**
 * get client list with pagination and searching
 * @route post /market/drive/upload/create
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/drive/upload/create",
    auth,
    marketingController.drivepdfcreate
);

/**
 * get client list with pagination and searching
 * @route post /market/drive/delete
 * @param {categoryListmodel.model} data.body.required
 * @group Client - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/drive/delete",
    auth,
    marketingController.drivedelete)

/**
* get client list with pagination and searching
* @route post /market/drive/edit
* @param {categoryListmodel.model} data.body.required
* @group Client - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.post("/drive/eedit",
    auth,
    marketingController.driveedit)
module.exports = router;