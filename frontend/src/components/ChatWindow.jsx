import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiMessageCircle,
  FiSearch,
  FiSend,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function ChatWindow({
  selectedChat,
  setChats,
  onlineUsers,
  socket,
  incomingMessage,
  readUpdate,
  onMarkChatAsRead,
  onOpenSearch,
  onBackToChats,
}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const getOtherUser = (chat) => {
    return chat.users.find((chatUser) => chatUser._id !== user._id);
  };

  const getChatName = () => {
    if (!selectedChat) {
      return "";
    }

    if (selectedChat.isGroupChat) {
      return selectedChat.chatName;
    }

    return getOtherUser(selectedChat)?.name || "Unknown User";
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isOnline = () => {
    if (!selectedChat || selectedChat.isGroupChat) {
      return false;
    }

    const otherUser = getOtherUser(selectedChat);

    return onlineUsers.includes(otherUser?._id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderId = (message) => {
    return typeof message.sender === "string"
      ? message.sender
      : message.sender._id;
  };

  const hasUserReadMessage = (message, userId) => {
    return message.readBy?.some((readUser) => {
      const readUserId = typeof readUser === "string" ? readUser : readUser._id;

      return readUserId?.toString() === userId.toString();
    });
  };

  const getPrivateMessageStatus = (message) => {
    if (selectedChat.isGroupChat) {
      return "";
    }

    const otherUser = getOtherUser(selectedChat);

    if (otherUser && hasUserReadMessage(message, otherUser._id)) {
      return "Seen";
    }

    return "Sent";
  };

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);

        const { data } = await api.get(`/messages/${selectedChat._id}`);

        setMessages(data);
        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        console.error("Unable to fetch messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChat, socket]);

  useEffect(() => {
    if (
      !incomingMessage ||
      !selectedChat ||
      incomingMessage.chat._id !== selectedChat._id
    ) {
      return;
    }

    setMessages((currentMessages) => {
      const alreadyExists = currentMessages.some(
        (message) => message._id === incomingMessage._id,
      );

      if (alreadyExists) {
        return currentMessages;
      }

      return [...currentMessages, incomingMessage];
    });

    onMarkChatAsRead(selectedChat);
  }, [incomingMessage, selectedChat, onMarkChatAsRead]);

  useEffect(() => {
    if (
      !readUpdate ||
      !selectedChat ||
      readUpdate.chatId !== selectedChat._id
    ) {
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) => {
        const senderId = getSenderId(message);

        if (senderId.toString() !== user._id.toString()) {
          return message;
        }

        if (hasUserReadMessage(message, readUpdate.readerId)) {
          return message;
        }

        return {
          ...message,
          readBy: [...(message.readBy || []), readUpdate.readerId],
        };
      }),
    );
  }, [readUpdate, selectedChat, user._id]);

  useEffect(() => {
    const handleTyping = (chatId) => {
      if (selectedChat?._id === chatId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (chatId) => {
      if (selectedChat?._id === chatId) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    setIsTyping(false);
    setNewMessage("");

    clearTimeout(typingTimeoutRef.current);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const stopTyping = () => {
    if (!selectedChat) {
      return;
    }

    socket.emit("stop typing", {
      chatId: selectedChat._id,
      users: selectedChat.users,
      senderId: user._id,
    });
  };

  const handleTypingChange = (e) => {
    const value = e.target.value;

    setNewMessage(value);

    if (!selectedChat) {
      return;
    }

    socket.emit("typing", {
      chatId: selectedChat._id,
      users: selectedChat.users,
      senderId: user._id,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat || sending) {
      return;
    }

    try {
      setSending(true);

      clearTimeout(typingTimeoutRef.current);
      stopTyping();

      const { data } = await api.post("/messages", {
        content: newMessage.trim(),
        chatId: selectedChat._id,
      });

      const socketMessage = {
        ...data,
        chat: selectedChat,
      };

      setMessages((currentMessages) => [...currentMessages, data]);

      setChats((currentChats) =>
        currentChats
          .map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  latestMessage: data,
                  updatedAt: new Date().toISOString(),
                }
              : chat,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );

      socket.emit("new message", socketMessage);

      setNewMessage("");
    } catch (error) {
      console.error("Unable to send message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!selectedChat) {
    return (
      <section className="chat-window empty-chat-window">
        <div className="empty-chat-content">
          <div className="empty-chat-logo">
            <FiMessageCircle />
          </div>

          <h1>Your conversations, all in one place</h1>

          <p>
            Select a conversation from the sidebar or start a new chat to begin
            messaging.
          </p>

          <button
            type="button"
            className="start-chat-button"
            onClick={onOpenSearch}
          >
            <FiSearch />
            Find someone to chat with
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button
          type="button"
          className="mobile-back-button"
          onClick={onBackToChats}
          title="Back to conversations"
        >
          <FiArrowLeft />
        </button>
        <div className="chat-header-user">
          <div className="chat-header-avatar">
            {selectedChat.isGroupChat ? (
              <FiUsers />
            ) : (
              getInitials(getChatName())
            )}
          </div>

          <div>
            <h2>{getChatName()}</h2>

            <p>
              {selectedChat.isGroupChat
                ? `${selectedChat.users.length} members`
                : isOnline()
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>
      </header>

      <div className="messages-area">
        {loadingMessages ? (
          <div className="message-status">Loading messages...</div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="empty-message-history">
            <FiMessageCircle />

            <h3>Start the conversation</h3>

            <p>Send the first message below.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message) => {
              const senderId = getSenderId(message);

              const isOwnMessage = senderId.toString() === user._id.toString();

              return (
                <div
                  key={message._id}
                  className={`message-row ${isOwnMessage ? "own" : "received"}`}
                >
                  <div className="message-bubble">
                    {selectedChat.isGroupChat && !isOwnMessage && (
                      <span className="message-sender-name">
                        {message.sender.name}
                      </span>
                    )}

                    <p>{message.content}</p>

                    <div className="message-meta">
                      <span className="message-time">
                        {formatTime(message.createdAt)}
                      </span>

                      {isOwnMessage && !selectedChat.isGroupChat && (
                        <span
                          className={`message-read-status ${
                            getPrivateMessageStatus(message) === "Seen"
                              ? "seen"
                              : ""
                          }`}
                        >
                          {getPrivateMessageStatus(message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="message-row received">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="message-composer" onSubmit={handleSendMessage}>
        <div className="message-input-wrapper">
          <input
            type="text"
            placeholder={`Message ${getChatName()}`}
            value={newMessage}
            onChange={handleTypingChange}
            autoComplete="off"
          />

          <button
            type="submit"
            className="send-message-button"
            disabled={!newMessage.trim() || sending}
            title="Send message"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChatWindow;
