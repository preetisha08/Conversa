const Message = require("../models/Message");
const Chat = require("../models/Chat");

const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      users: req.user._id,
    });

    if (!chat) {
      return res.status(403).json({
        message: "You are not authorized to access this chat",
      });
    }

    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email avatar")
      .populate("readBy", "name email avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !content.trim() || !chatId) {
      return res.status(400).json({
        message: "Message content and chat ID are required",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      users: req.user._id,
    });

    if (!chat) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this chat",
      });
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      chat: chatId,
      readBy: [req.user._id],
    });

    message = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .populate("readBy", "name email avatar");

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: "Server error while sending message",
    });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const userChats = await Chat.find({
      users: req.user._id,
    }).select("_id");

    const chatIds = userChats.map((chat) => chat._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chat: { $in: chatIds },
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        },
      },
      {
        $group: {
          _id: "$chat",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {};

    unreadCounts.forEach((item) => {
      counts[item._id.toString()] = item.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching unread counts",
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      users: req.user._id,
    });

    if (!chat) {
      return res.status(403).json({
        message: "You are not authorized to access this chat",
      });
    }

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: {
          readBy: req.user._id,
        },
      },
    );

    res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while marking messages as read",
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getUnreadCounts,
  markMessagesAsRead,
};
