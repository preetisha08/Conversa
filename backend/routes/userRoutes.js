const express = require("express");
const protect = require("../middleware/authMiddleware");
const { searchUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, searchUsers);

module.exports = router;
