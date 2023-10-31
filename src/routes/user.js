const router = require("express").Router()

//import userController
const userController = require("../controllers").userController

router.post("/admin/create",
    userController.createAdmin
)

module.exports = router;