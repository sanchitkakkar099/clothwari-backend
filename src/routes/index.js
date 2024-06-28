const router = require("express").Router()


//sub-base path for other routes
router.use("/admin", require("./admin"));
router.use("/category", require("./category"));
router.use("/color", require("./color"));
router.use("/client", require("./client"));
router.use("/designupload", require("./designupload"));
router.use("/designer", require("./designer"));
router.use("/market", require("./marketing"));
router.use("/script", require("./script"));
router.use("/tag", require("./tag"));
router.use("/uploads", require("./fileUploads"));
router.use("/user", require("./user"));
router.use("/proxy", require("./proxy"));

module.exports = router