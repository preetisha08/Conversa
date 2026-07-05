import { useEffect, useState } from "react";
import { FiSearch, FiUser, FiX } from "react-icons/fi";
import api from "../services/api";

function UserSearchModal({ isOpen, onClose, onChatCreated }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !search.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          `/users?search=${encodeURIComponent(search.trim())}`,
        );

        setUsers(data);
      } catch (error) {
        console.error("Unable to search users:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const startChat = async (userId) => {
    try {
      setStartingChat(userId);

      const { data } = await api.post("/chats", {
        userId,
      });

      onChatCreated(data);
      onClose();
    } catch (error) {
      console.error("Unable to start chat:", error);
    } finally {
      setStartingChat("");
    }
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="search-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">NEW CONVERSATION</p>

            <h2>Find someone to chat with</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="modal-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {!search.trim() ? (
            <div className="search-placeholder">
              <FiSearch />

              <h3>Search for people</h3>

              <p>Enter a name or email address to find registered users.</p>
            </div>
          ) : loading ? (
            <p className="search-status">Searching...</p>
          ) : users.length === 0 ? (
            <div className="search-placeholder">
              <FiUser />

              <h3>No users found</h3>

              <p>Try searching with another name or email.</p>
            </div>
          ) : (
            users.map((searchedUser) => (
              <button
                key={searchedUser._id}
                type="button"
                className="user-search-result"
                onClick={() => startChat(searchedUser._id)}
                disabled={startingChat === searchedUser._id}
              >
                <div className="search-user-avatar">
                  {getInitials(searchedUser.name)}
                </div>

                <div className="search-user-info">
                  <h3>{searchedUser.name}</h3>
                  <p>{searchedUser.email}</p>
                </div>

                <span>
                  {startingChat === searchedUser._id ? "Opening..." : "Chat"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSearchModal;
