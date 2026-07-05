const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getMessages,
  sendMessage,
  getUnreadCounts,
  markMessagesAsRead,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/unread/counts", protect, getUnreadCounts);
router.put("/:chatId/read", protect, markMessagesAsRead);
router.get("/:chatId", protect, getMessages);
router.post("/", protect, sendMessage);

module.exports = router;
