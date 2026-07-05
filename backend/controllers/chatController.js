const Chat = require("../models/Chat");
const User = require("../models/User");

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot create a chat with yourself",
      });
    }

    const selectedUser = await User.findById(userId);

    if (!selectedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $all: [req.user._id, userId],
        $size: 2,
      },
    })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email avatar",
        },
      });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    let newChat = await Chat.create({
      chatName: "",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    newChat = await Chat.findById(newChat._id).populate("users", "-password");

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating chat",
    });
  }
};

const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: req.user._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email avatar",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching chats",
    });
  }
};

const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users || !Array.isArray(users)) {
      return res.status(400).json({
        message: "Group name and users are required",
      });
    }

    if (users.length < 2) {
      return res.status(400).json({
        message: "Select at least 2 other users",
      });
    }

    const uniqueUsers = [...new Set(users)];

    const existingUsers = await User.find({
      _id: { $in: uniqueUsers },
    });

    if (existingUsers.length !== uniqueUsers.length) {
      return res.status(404).json({
        message: "One or more selected users do not exist",
      });
    }

    const allUsers = [...uniqueUsers, req.user._id.toString()];

    let groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: allUsers,
      groupAdmin: req.user._id,
    });

    groupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(groupChat);
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating group chat",
    });
  }
};

const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        message: "Group chat not found",
      });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the group admin can rename this group",
      });
    }

    chat.chatName = chatName;
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({
      message: "Server error while renaming group",
    });
  }
};

const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        message: "Group chat not found",
      });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the group admin can add members",
      });
    }

    if (chat.users.includes(userId)) {
      return res.status(400).json({
        message: "User is already in the group",
      });
    }

    chat.users.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({
      message: "Server error while adding group member",
    });
  }
};

const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        message: "Group chat not found",
      });
    }

    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();

    const isLeaving = userId === req.user._id.toString();

    if (!isAdmin && !isLeaving) {
      return res.status(403).json({
        message: "Only the group admin can remove other members",
      });
    }

    chat.users = chat.users.filter((user) => user.toString() !== userId);

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({
      message: "Server error while removing group member",
    });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
