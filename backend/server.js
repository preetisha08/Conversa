const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat Application API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userId) => {
    socket.userId = userId;
    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    io.emit("online users", Array.from(onlineUsers.keys()));
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("new message", (message) => {
    const chat = message.chat;

    if (!chat || !chat.users) {
      return;
    }

    chat.users.forEach((chatUser) => {
      const userId = typeof chatUser === "string" ? chatUser : chatUser._id;

      if (userId.toString() !== message.sender._id.toString()) {
        io.to(userId.toString()).emit("message received", message);
      }
    });
  });

  socket.on("typing", ({ chatId, users, senderId }) => {
    users.forEach((chatUser) => {
      const userId = typeof chatUser === "string" ? chatUser : chatUser._id;

      if (userId.toString() !== senderId.toString()) {
        io.to(userId.toString()).emit("typing", chatId);
      }
    });
  });

  socket.on("stop typing", ({ chatId, users, senderId }) => {
    users.forEach((chatUser) => {
      const userId = typeof chatUser === "string" ? chatUser : chatUser._id;

      if (userId.toString() !== senderId.toString()) {
        io.to(userId.toString()).emit("stop typing", chatId);
      }
    });
  });

  socket.on("messages read", ({ chatId, users, readerId }) => {
    users.forEach((chatUser) => {
      const userId = typeof chatUser === "string" ? chatUser : chatUser._id;

      if (userId.toString() !== readerId.toString()) {
        io.to(userId.toString()).emit("messages read", {
          chatId,
          readerId,
        });
      }
    });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      const storedSocketId = onlineUsers.get(socket.userId);

      if (storedSocketId === socket.id) {
        onlineUsers.delete(socket.userId);
      }

      io.emit("online users", Array.from(onlineUsers.keys()));
    }

    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
