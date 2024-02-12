const router = require("express").Router()

//controller
const { categoryController } = require("../controllers")

//middlewares
const { auth } = require("../middlewares").auth

/**
 * @typedef categoryCreateModel
 * @property {string} _id - id of category
 * @property {string} name - name of category
 */
/**
 * create or edit the category by id
 * @route POST /category/create
 * @param {categoryCreateModel.model} data.body.required
 * @group Category - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    categoryController.categoryCreateEdit
);


/**
 * get category by id
 * @route GET /category/byId/{id}
 * @param {string} id.path.required
 * @group Category - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/byId/:id",
    auth,
    categoryController.categoryById
);


/**
 * delete category by id
 * @route DELETE /category/byId/{id}
 * @param {string} id.path.required
 * @group Category - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    categoryController.categorydelete
);

/**
 * @typedef categoryListmodel
 * @property {string} search
 * @property {number} page
 * @property {number} limit
 */
/**
 * get category list with pagination and searching
 * @route post /category/list
 * @param {categoryListmodel.model} data.body.required
 * @group Category - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    categoryController.categoryList
);


/**
* get category list with 
* @route GET /category/drop/dwon/list
* @group Category - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/drop/dwon/list",
    auth,
    categoryController.categoryDropDown

)

/**
 * @typedef categoryCreateModel
 * @property {string} name
 */
/**
* get category list with 
* @route POST /category/check
* @param {categoryCreateModel.model} data.body.required
* @group Category - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.post("/check",
    auth,
    categoryController.checkcategory)
module.exports = router;