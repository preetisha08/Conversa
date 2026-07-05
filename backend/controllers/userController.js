const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            {
              name: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error while searching users",
    });
  }
};

module.exports = {
  searchUsers,
};
