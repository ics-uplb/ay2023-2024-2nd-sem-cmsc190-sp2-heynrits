const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");

router.use("/user", require("./user"));
router.use("/organization", [authMiddleware], require("./organization"));
router.use("/notifications", [authMiddleware], require("./notification"));
router.use("/applications", [authMiddleware], require("./application"));
router.use("/preferences", [authMiddleware], require("./preference"));

module.exports = router;
