import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import UserSearchModal from "../components/UserSearchModal";
import CreateGroupModal from "../components/CreateGroupModal";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false,
});

function Chat() {
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [readUpdate, setReadUpdate] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loadingChats, setLoadingChats] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  const selectedChatRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats");
      setChats(data);
    } catch (error) {
      console.error("Unable to fetch chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const { data } = await api.get("/messages/unread/counts");

      setUnreadCounts(data);
    } catch (error) {
      console.error("Unable to fetch unread counts:", error);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit("setup", user._id);

    socket.on("online users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("message received", (message) => {
      setIncomingMessage(message);

      const chatId = message.chat._id;

      setChats((currentChats) => {
        const chatExists = currentChats.some((chat) => chat._id === chatId);

        if (!chatExists) {
          return currentChats;
        }

        return currentChats
          .map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  latestMessage: message,
                  updatedAt: new Date().toISOString(),
                }
              : chat,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      if (selectedChatRef.current?._id !== chatId) {
        setUnreadCounts((currentCounts) => ({
          ...currentCounts,
          [chatId]: (currentCounts[chatId] || 0) + 1,
        }));
      }
    });

    socket.on("messages read", (data) => {
      setReadUpdate({
        ...data,
        receivedAt: Date.now(),
      });
    });

    return () => {
      socket.off("online users");
      socket.off("message received");
      socket.off("messages read");
      socket.disconnect();
    };
  }, [user._id]);

  const markChatAsRead = async (chat) => {
    setUnreadCounts((currentCounts) => ({
      ...currentCounts,
      [chat._id]: 0,
    }));

    try {
      await api.put(`/messages/${chat._id}/read`);

      socket.emit("messages read", {
        chatId: chat._id,
        users: chat.users,
        readerId: user._id,
      });
    } catch (error) {
      console.error("Unable to mark messages as read:", error);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    markChatAsRead(chat);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  const handleChatCreated = (chat) => {
    setChats((currentChats) => {
      const alreadyExists = currentChats.some(
        (currentChat) => currentChat._id === chat._id,
      );

      if (alreadyExists) {
        return currentChats;
      }

      return [chat, ...currentChats];
    });

    handleSelectChat(chat);
  };

  const handleGroupCreated = (groupChat) => {
    setChats((currentChats) => [groupChat, ...currentChats]);

    handleSelectChat(groupChat);
  };

  return (
    <main className={`chat-app ${selectedChat ? "mobile-chat-open" : ""}`}>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
        loadingChats={loadingChats}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGroup={() => setIsGroupOpen(true)}
      />

      <ChatWindow
        selectedChat={selectedChat}
        setChats={setChats}
        onlineUsers={onlineUsers}
        socket={socket}
        incomingMessage={incomingMessage}
        readUpdate={readUpdate}
        onMarkChatAsRead={markChatAsRead}
        onOpenSearch={() => setIsSearchOpen(true)}
        onBackToChats={handleBackToChats}
      />

      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onChatCreated={handleChatCreated}
      />

      <CreateGroupModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </main>
  );
}

export default Chat;
