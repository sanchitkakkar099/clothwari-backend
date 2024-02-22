const { marketingController } = require("../controllers");
const { auth } = require("../middlewares");

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

module.exports = router;