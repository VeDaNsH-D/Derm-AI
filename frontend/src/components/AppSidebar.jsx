import React, { useState } from "react";
import "./AppSidebar.css";

export default function AppSidebar({ onLogout }) {
  const [activeTab, setActiveTab] = useState("analyze");

  return (
    <div className="app-sidebar">
      {/* Header */}
      <div className="sidebar-header">
                <a href="/" className="sidebar-logo">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span>Derm-AI</span>
                </a>
      </div>

      {/* Navigation Tabs */}
      <div className="sidebar-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              title={tab.label}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Tab Content */}
      <div className="sidebar-content">
        {activeTab === "analyze" && (
          <div className="tab-content">
            <h3>Quick Actions</h3>
            <p className="content-subtitle">Analysis tools and shortcuts</p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="tab-content">
            <h3>Recent Analyses</h3>
            <div className="history-list">
              <p className="empty-state">No analyses yet. Start by uploading an image.</p>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="tab-content">
            <h3>Learning Resources</h3>
            <ul className="resources-list">
              <li>
                <FileText size={16} />
                <span>Documentation</span>
              </li>
              <li>
                <BookOpen size={16} />
                <span>Tutorial Videos</span>
              </li>
              <li>
                <HelpCircle size={16} />
                <span>FAQ</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="sidebar-features">
        <p className="features-label">Features</p>
        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                className="feature-button"
                style={{ "--feature-color": feature.color }}
                title={feature.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
