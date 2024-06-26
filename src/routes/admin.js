const router = require("express").Router();

//controller
const { adminController } = require("../controllers");

const { auth } = require("../middlewares").auth



/**
 * @typedef adminmodel
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {Array<string>} permissions
 */
/**
 * create admin role user
 * @route POST /admin/create
 * @param {adminmodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/create",
    auth,
    adminController.adminCreateEdit
);



/**
* get admin by id
* @route GET /admin/byId/{id}
* @param {string} id.path.required
* @group Admin - Operations
* @returns {object} 200
*      Return JSON object
*
* @security User 
* @returns {Error}  Error - Unexpected error
*/
router.get("/byId/:id",
    auth,
    adminController.adminById
);


/**
 * delete admin by id
 * @route DELETE /admin/byId/{id}
 * @param {string} id.path.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.delete("/byId/:id",
    auth,
    adminController.admindelete
);



/**
 * get admin list with pagination and searching
 * @route post /admin/list
 * @param {categoryListmodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/list",
    auth,
    adminController.adminList
);


/**
 * get admin dashboard
 * @route get /admin/dashboard
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/dashboard",
    auth,
    adminController.getDashboardData
);


/**
 * get admin dashboard
 * @route POST /admin/staff/approval/list
 * @param {categoryListmodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/staff/approval/list",
    auth,
    adminController.approvalStaffList
);

/**
 * @typedef staffapproved
 * @property {string} staffId
 * @property {number} status-
 * @property {Array<string>} permissions
 */
/**
 * get admin dashboard
 * status 0:Pending 1:Approved 2:Rejected
 * @route POST /admin/staff/approved
 * @param {staffapproved.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/staff/approved",
    auth,
    adminController.approvedStaff
);


/**
 * get permission list
 * @route GET /admin/permissions/list
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/permissions/list",
    auth,
    adminController.getpermissionlist
);


/**
 * get notofication count
 * @route GET /admin/notication/count
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.get("/notication/count",
    auth,
    adminController.client_design_addtocart_notfication
);

/**
 * client add to cart model
 * @typedef cleintaddtocartmodel
 * @property {string} search 
 * @property {number} page 
 * @property {number} limit 
 */
/**
 * get admin dashboard
 * status 0:Pending 1:Approved 2:Rejected
 * @route POST /admin/client/cart/data
 * @param {cleintaddtocartmodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/client/cart/data",
    auth,
    adminController.getclientcartdata
);
/**
 * @typedef userdeactivatemodel
 * @property {string} userId
 * @property {boolean} isDel
 */
/**
 * deactiavte user account
 * @route POST /admin/user/deactivate
 * @param {userdeactivatemodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/user/deactivate",
    auth,
    adminController.user_deactivate
)
/**
 * @typedef notimodel
 * @property {string} notificationId
 */
/**
 * deactiavte user account
 * @route POST /admin/read/notification
 * @param {notimodel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 *
 * @security User 
 * @returns {Error}  Error - Unexpected error
 */
router.post("/read/notification",
    auth,
    adminController.readnotification
);

/**
 * @typedef adminLoginModel
 * @property {string} adminId
 */
/**
 * admin login credentails by admin request
 * @route post /admin/login/byadmin
 * @param {adminLoginModel.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/login/byadmin",
    // auth,
    adminController.adminLogin
);

/**
 * @typedef userpasswordchanges
 * @property {string} userId
 * @property {string} password
 */
/**
 * admin login credentails by admin request
 * @route post /admin/user/password/changes
 * @param {userpasswordchanges.model} data.body.required
 * @group Admin - Operations
 * @returns {object} 200
 *      Return JSON object
 * @security User
 * @returns {Error}  Error - Unexpected error
 */
router.post("/user/password/changes",
    auth,
    adminController.userpasswordchanges
);

module.exports = router;