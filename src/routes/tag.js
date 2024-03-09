const router = require("express").Router()

//controller
const { tagController } = require("../controllers");
const { auth } = require("../middlewares").auth;

//middlewares
const { adminAuth } = require("../middlewares").adminAuth

/**
 * @typedef tagCreateModel
 * @property {string} _id - id of tag
 * @property {string} label - label of tag
 * @property {string} id - label of tag
 * @property {boolean} customOption - label of tag
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
    auth,
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
    auth,
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
    auth,
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
    auth,
    tagController.tagList
);

/**
* get tag drop down list 
* @route GET /tag/drop/dwon/list
* @group Tag - Operations
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

/**
 * @typedef tagsearchmodel
 * @property {string} search
 */
/**
 * get tag list with pagination and searching
 * @route post /tag/search
 * @param {tagsearchmodel.model} data.body.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/search",
    auth,
    tagController.tagsearch
);

/**
 * @typedef tagcheckavailmodel
 * @property {string} label
 */
/**
 * get tag list with pagination and searching
 * @route post /tag/already/avail
 * @param {tagcheckavailmodel.model} data.body.required
 * @group Tag - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/already/avail",
    // auth,
    tagController.check_tag_avail_already
);
/**
 * @typedef tagmergemodel
 * @property {string} merge_from
 * @property {string} merge_to
 * @property {string} merge_from_tagId
 * @property {string} merge_to_tagId
 */
/**
* get tag list with 
* @route POST /tag/merge
* @param {tagmergemodel.model} data.body.required
* @group Category - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.post("/merge",
    auth,
    tagController.tagmerge
)
module.exports = router;