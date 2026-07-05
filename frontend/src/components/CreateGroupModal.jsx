import { useEffect, useState } from "react";
import { FiCheck, FiSearch, FiUsers, FiX } from "react-icons/fi";
import api from "../services/api";

function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSearch("");
      setUsers([]);
      setSelectedUsers([]);
      setError("");
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

  const isSelected = (userId) => {
    return selectedUsers.some((selectedUser) => selectedUser._id === userId);
  };

  const toggleUser = (selectedUser) => {
    setError("");

    setSelectedUsers((currentUsers) => {
      const alreadySelected = currentUsers.some(
        (user) => user._id === selectedUser._id,
      );

      if (alreadySelected) {
        return currentUsers.filter((user) => user._id !== selectedUser._id);
      }

      return [...currentUsers, selectedUser];
    });
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.filter((user) => user._id !== userId),
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (selectedUsers.length < 2) {
      setError("Select at least 2 other users");
      return;
    }

    try {
      setCreating(true);

      const { data } = await api.post("/chats/group", {
        name: groupName.trim(),
        users: selectedUsers.map((user) => user._id),
      });

      onGroupCreated(data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create group chat");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form
        className="group-modal"
        onSubmit={handleCreateGroup}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">NEW GROUP</p>

            <h2>Create a group chat</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="group-modal-body">
          <div className="group-name-field">
            <label>Group name</label>

            <div className="group-name-input">
              <FiUsers />

              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength="50"
              />
            </div>
          </div>

          <div className="selected-members-section">
            <div className="group-section-heading">
              <span>Selected members</span>

              <span>{selectedUsers.length}</span>
            </div>

            {selectedUsers.length === 0 ? (
              <p className="no-selected-members">
                Select at least 2 people for your group.
              </p>
            ) : (
              <div className="selected-members">
                {selectedUsers.map((selectedUser) => (
                  <div key={selectedUser._id} className="selected-member-chip">
                    <span>{selectedUser.name}</span>

                    <button
                      type="button"
                      onClick={() => removeSelectedUser(selectedUser._id)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="group-user-search">
            <label>Add people</label>

            <div className="modal-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="group-search-results">
            {!search.trim() ? (
              <div className="group-search-placeholder">
                <FiSearch />

                <p>Search for people to add</p>
              </div>
            ) : loading ? (
              <p className="search-status">Searching...</p>
            ) : users.length === 0 ? (
              <div className="group-search-placeholder">
                <FiUsers />

                <p>No users found</p>
              </div>
            ) : (
              users.map((searchedUser) => (
                <button
                  key={searchedUser._id}
                  type="button"
                  className={`group-user-result ${
                    isSelected(searchedUser._id) ? "selected" : ""
                  }`}
                  onClick={() => toggleUser(searchedUser)}
                >
                  <div className="search-user-avatar">
                    {searchedUser.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="search-user-info">
                    <h3>{searchedUser.name}</h3>
                    <p>{searchedUser.email}</p>
                  </div>

                  <div className="member-select-indicator">
                    {isSelected(searchedUser._id) && <FiCheck />}
                  </div>
                </button>
              ))
            )}
          </div>

          {error && <div className="group-error">{error}</div>}
        </div>

        <div className="group-modal-footer">
          <button
            type="button"
            className="group-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="group-create-button"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : `Create Group${
                  selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ""
                }`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupModal;
