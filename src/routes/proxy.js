
const { proxyController } = require("../controllers");

const router = require("express").Router()

router.get("/images",
proxyController.createProxy
)

module.exports = router;