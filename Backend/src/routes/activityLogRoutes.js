const express = require("express");

const {
  getProjectActivityLogs
} = require("../controllers/activityLogController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:projectId/activities",
  protect,
  getProjectActivityLogs
);

module.exports = router;