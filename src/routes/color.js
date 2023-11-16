const router = require("express").Router()

//controller
const { colorController } = require("../controllers")

//middlewares
const { auth } = require("../middlewares").auth

/**
 * @typedef colorCreateModel
 * @property {string} _id - id of category
 * @property {string} name - name of category
 * @property {string} code - name of category
 */
/**
 * create or edit the category by id
 * @route POST /color/create
 * @param {colorCreateModel.model} data.body.required
 * @group Color - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    colorController.colorCreateEdit
);


/**
 * get category by id
 * @route GET /color/byId/{id}
 * @param {string} id.path.required
 * @group Color - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/byId/:id",
    auth,
    colorController.colorById
);


/**
 * delete category by id
 * @route DELETE /color/byId/{id}
 * @param {string} id.path.required
 * @group Color - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    colorController.colordelete
);

/**
 * @typedef categoryListmodel
 * @property {string} search
 * @property {number} page
 * @property {number} limit
 */
/**
 * get category list with pagination and searching
 * @route post /color/list
 * @param {categoryListmodel.model} data.body.required
 * @group Color - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    colorController.colorList
);


/**
* get category list with 
* @route GET /color/drop/down/list
* @group Color - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/drop/down/list",
    auth,
    colorController.colorDropDown

)
module.exports = router;