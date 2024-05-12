const express = require("express");

const preferenceController = require("../controllers/preference");

const router = express.Router();

router.get("/", preferenceController.getPreferences);
router.put("/", preferenceController.updatePreference);

module.exports = router;
