const router = require("express").Router()


//sub-base path for other routes
router.use("/category", require("./category"));
router.use("/client", require("./client"));
router.use("/designupload", require("./designupload"));
router.use("/designer", require("./designer"));
router.use("/uploads", require("./fileUploads"));
router.use("/tag", require("./tag"));
router.use("/user", require("./user"));

module.exports = router