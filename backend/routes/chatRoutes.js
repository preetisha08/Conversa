const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);

router.post("/group", protect, createGroupChat);
router.put("/group/rename", protect, renameGroup);
router.put("/group/add", protect, addToGroup);
router.put("/group/remove", protect, removeFromGroup);

module.exports = router;
