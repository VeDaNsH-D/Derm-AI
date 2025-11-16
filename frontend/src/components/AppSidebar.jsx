import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Plus,
  Microscope,
  FileText,
  Layers,
  ExternalLink,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import DermAILogo from "./DermAILogo";
import "./AppSidebar.css";

export default function AppSidebar({ user, onLogout, onSelectHistory }) {
  const [activeChat, setActiveChat] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  // Load history
  const fetchHistory = async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/history?email=${user.email}`
      );
      setRecentChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Load analysis into UI
  const handleSelect = async (id) => {
    console.log("Clicked history item:", id);  // DEBUG

    try {
      const res = await axios.get(`http://127.0.0.1:5000/history-item?id=${id}`);
      console.log("History item loaded:", res.data);  // DEBUG

      onSelectHistory(res.data);
      setActiveChat(id);
    } catch (err) {
      console.error("Error loading history item:", err);
    }
  };


  // Delete item
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-analysis?id=${id}`);
      fetchHistory(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-sidebar">

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <DermAILogo color={"#FFFFFF"} size={30} />
          <span>DermAI</span>
        </div>

        <button className="new-chat-button">
          <div className="new-chat-icon">
            <Plus size={14} />
          </div>
          <span>New chat</span>
        </button>
      </div>

      <div className="sidebar-nav">
        <button className="nav-button">
          <MessageSquare size={18} />
          <span>Chats</span>
        </button>
        <button className="nav-button">
          <Microscope size={18} />
          <span>Analyses</span>
        </button>
      </div>

      <div className="recents-section">
        <div className="recents-label">Recents</div>

        <div className="recents-list">
          {recentChats.map((chat) => (
            <div
              key={chat._id}
              className={`recent-item ${activeChat === chat._id ? "active" : ""}`}
            >
              <button
                onClick={() => handleSelect(chat._id)}
                className="recent-text"
              >
                {chat.title}
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDelete(chat._id)}
                title="Delete"
              >
                <Trash2 size={14} strokeWidth={1.7} />
              </button>

            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-button" onClick={() => setShowMenu(!showMenu)}>
          {user?.picture ? (
            <img src={user.picture} className="user-avatar" />
          ) : (
            <div className="user-avatar">{user?.name?.[0]}</div>
          )}

          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        {showMenu && (
          <div className="user-menu-dropdown">
            <button className="dropdown-item logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
