import {
  FiEdit,
  FiLogOut,
  FiMessageCircle,
  FiSearch,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  onlineUsers,
  unreadCounts,
  loadingChats,
  onOpenSearch,
  onOpenGroup,
}) {
  const { user, logout } = useAuth();

  const getOtherUser = (chat) => {
    return chat.users.find((chatUser) => chatUser._id !== user._id);
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) {
      return chat.chatName;
    }

    return getOtherUser(chat)?.name || "Unknown User";
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isUserOnline = (chat) => {
    if (chat.isGroupChat) {
      return false;
    }

    const otherUser = getOtherUser(chat);

    return onlineUsers.includes(otherUser?._id);
  };

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <FiMessageCircle />
          </div>

          <span>Conversa</span>
        </div>

        <div className="sidebar-actions">
          <button
            className="icon-button"
            type="button"
            title="Create group"
            onClick={onOpenGroup}
          >
            <FiUserPlus />
          </button>

          <button
            className="icon-button"
            type="button"
            title="New conversation"
            onClick={onOpenSearch}
          >
            <FiEdit />
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <FiSearch />

        <input type="text" placeholder="Search conversations" />
      </div>

      <div className="conversation-heading">
        <span>Messages</span>

        <span className="conversation-count">{chats.length}</span>
      </div>

      <div className="conversation-list">
        {loadingChats ? (
          <p className="sidebar-status">Loading conversations...</p>
        ) : chats.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-conversations-icon">
              <FiMessageCircle />
            </div>

            <h3>No conversations yet</h3>

            <p>Search for someone and start your first conversation.</p>
          </div>
        ) : (
          chats.map((chat) => {
            const unreadCount = unreadCounts[chat._id] || 0;

            return (
              <button
                key={chat._id}
                type="button"
                className={`conversation-item ${
                  selectedChat?._id === chat._id ? "active" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="conversation-avatar">
                  {chat.isGroupChat ? (
                    <FiUsers />
                  ) : (
                    getInitials(getChatName(chat))
                  )}

                  {isUserOnline(chat) && <span className="online-dot" />}
                </div>

                <div className="conversation-info">
                  <div className="conversation-name-row">
                    <h3>{getChatName(chat)}</h3>

                    {unreadCount > 0 && (
                      <span className="unread-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>

                  <p className={unreadCount > 0 ? "unread-preview" : ""}>
                    {chat.latestMessage
                      ? chat.latestMessage.content
                      : chat.isGroupChat
                        ? `${chat.users.length} members`
                        : "Start a conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">{getInitials(user.name)}</div>

        <div className="profile-details">
          <h3>{user.name}</h3>
          <p>Online</p>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={logout}
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
}

export default ChatSidebar;
