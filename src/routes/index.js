const router = require("express").Router()


//sub-base path for other routes
router.use("/user", require("./user"));

module.exports = router