const express = require("express");
const {
    addMember,
    getProjectMembers,
    updateMemberRole,
    removeMember
} = require("../controllers/projectMemberController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:projectId/members", protect, addMember);
router.get("/:projectId/members", protect, getProjectMembers);
router.patch("/:projectId/members/:memberId/role", protect, updateMemberRole);
router.delete("/:projectId/members/:memberId", protect, removeMember);

module.exports = router;