const router = require("express").Router()

//controller
const { tagController } = require("../controllers");
const { auth } = require("../middlewares").auth;

//middlewares
const { adminAuth } = require("../middlewares").adminAuth

/**
 * @typedef tagCreateModel
 * @property {string} _id - id of tag
 * @property {string} name - name of tag
 */
/**
 * create or edit the tag by id
 * @route POST /tag/create
 * @param {tagCreateModel.model} data.body.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    adminAuth,
    tagController.tagCreateEdit
);


/**
 * get tag by id
 * @route GET /tag/byId/{id}
 * @param {string} id.path.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/byId/:id",
    adminAuth,
    tagController.tagById
);


/**
 * delete tag by id
 * @route DELETE /tag/byId/{id}
 * @param {string} id.path.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    adminAuth,
    tagController.tagdelete
);

/**
 * @typedef tagListmodel
 * @property {string} search
 * @property {number} page
 * @property {number} limit
 */
/**
 * get tag list with pagination and searching
 * @route post /tag/list
 * @param {tagListmodel.model} data.body.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    adminAuth,
    tagController.tagList
);

/**
* get tag drop down list 
* @route GET /tag/drop/dwon/list
* @group TAG - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/drop/dwon/list",
    auth,
    tagController.tagDropDown

)

module.exports = router;