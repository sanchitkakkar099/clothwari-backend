const router = require("express").Router()

//controller
const { DesignUploadController } = require("../controllers")

//middlewares
const { auth } = require("../middlewares").auth

//controll

/**
 * @typedef designuploadCreateModel
 * @property {string} _id - id of category
 * @property {string} name - name of category
 * @property {string} category - name of category
 * @property {string} tag - name of category
 * @property {Array.<string>} image - name of category
 * @property {Array.<string>} thumbnail**8 - name of category
 */
/**
 * create or edit the category by id
 * @route POST /designupload/create
 * @param {designuploadCreateModel.model} data.body.required
 * @group DesignUpload - oprations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    DesignUploadController.designuploadCreate
);


/**
 * get category by id
 * @route GET /designupload/byId/{id}
 * @param {string} id.path.required
 * @group DesignUpload - oprations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/byId/:id",
    auth,
    DesignUploadController.designuploadById
);


/**
 * delete category by id
 * @route DELETE /designupload/byId/{id}
 * @param {string} id.path.required
 * @group DesignUpload - oprations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    DesignUploadController.designuploadDelete
);

/**
 * @typedef categoryListmodel
 * @property {string} search
 * @property {number} page
 * @property {number} limit
 */
/**
 * get category list with pagination and searching
 * @route post /designupload/list
 * @param {categoryListmodel.model} data.body.required
 * @group DesignUpload - oprations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    DesignUploadController.designuploadList
);

module.exports = router;