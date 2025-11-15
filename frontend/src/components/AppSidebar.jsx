import React, { useState } from "react";
import { MessageSquare, Plus, Microscope, FileText, Layers, ExternalLink, MoreHorizontal } from 'lucide-react';
import DermAILogo from './DermAILogo';
import './AppSidebar.css';

export default function AppSidebar({ onLogout }) {
  const [activeChat, setActiveChat] = useState(null);
  
  const recentChats = [
    "Skin rash analysis on forearm",
    "Mole examination and evaluation",
    "Acne treatment consultation",
    "Eczema symptoms discussion",
    "Psoriasis flare-up management",
    "Dermatitis diagnosis assistance",
    "Skin discoloration concerns",
    "Rosacea symptoms evaluation",
    "Melanoma screening request",
    "Hives and allergic reaction",
    "Seborrheic dermatitis help",
    "Vitiligo progression tracking",
  ];

  return (
    <div className="app-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <DermAILogo size={30} />
          <span style={{ fontWeight: 600, letterSpacing: '-0.5px' }}>DermAI</span>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-button">
          <div className="new-chat-icon">
            <Plus size={14} strokeWidth={2} />
          </div>
          <span>New chat</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <button className="nav-button">
          <MessageSquare size={18} strokeWidth={1.8} />
          <span>Chats</span>
        </button>
        <button className="nav-button">
          <Microscope size={18} strokeWidth={1.8} />
          <span>Analyses</span>
        </button>
        <button className="nav-button">
          <Layers size={18} strokeWidth={1.8} />
          <span>Artifacts</span>
        </button>
        <button className="nav-button">
          <FileText size={18} strokeWidth={1.8} />
          <span>Reports</span>
          <ExternalLink size={14} strokeWidth={1.8} className="nav-external-icon" />
        </button>
      </div>

      {/* Recents Section */}
      <div className="recents-section">
        <div className="recents-label">Recents</div>
        <div className="recents-list">
          {recentChats.map((chat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveChat(idx)}
              className={`recent-item ${activeChat === idx ? 'active' : ''}`}
            >
              <span className="recent-text">{chat}</span>
              <MoreHorizontal 
                size={14} 
                strokeWidth={1.8} 
                className="recent-more-icon" 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Footer - User Section */}
      <div className="sidebar-footer">
        <button onClick={onLogout} className="user-button">
          <div className="user-avatar">DU</div>
          <div className="user-info">
            <p className="user-name">DermAI User</p>
            <p className="user-email">user@dermai.com</p>
          </div>
        </button>
      </div>
    </div>
  );
}