import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Plus, Image as ImageIcon, Loader2 } from "lucide-react"; // Added Icons
import AppSidebar from "./components/AppSidebar";
import AnalysisResults from "./components/AnalysisResults"; // We will reuse this inside the chat bubble
import HealthTips from "./components/HealthTips";
import DermAILogo from "./components/DermAILogo";
import "./Analyze.css";

export default function Analyze({ user, onLogout }) {
  const [chatHistory, setChatHistory] = useState([]); // Stores { type: 'user' | 'bot', content: any }
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(""); // For the input area preview
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = "http://127.0.0.1:5000/analyze";

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleSubmit = async () => {
    if (!image) return;

    // 1. Add User Image to Chat
    const userEntry = { type: 'user', content: previewUrl, timestamp: new Date() };
    setChatHistory(prev => [...prev, userEntry]);

    // 2. Clear Input Preview immediately
    const currentImage = image;
    setImage(null);
    setPreviewUrl("");

    // 3. Set Loading State
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", currentImage);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 4. Add Bot Response to Chat
      const botEntry = {
        type: 'bot',
        content: response.data.analysis,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botEntry]);

      // Save to DB
      await axios.post("http://127.0.0.1:5000/save-analysis", {
        email: user.email,
        title: "Skin Analysis " + new Date().toLocaleString(),
        analysis: response.data.analysis,
      });

    } catch (err) {
      const msg = err.response?.data?.error || "An unknown error occurred.";
      setChatHistory(prev => [...prev, { type: 'bot', content: `Error: ${msg}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item) => {
    // Clear current chat and show the selected history as a "replayed" chat
    setChatHistory([
      { type: 'bot', content: "Here is the archived analysis you requested:", timestamp: new Date() },
      { type: 'bot', content: item.analysis, timestamp: new Date() }
    ]);
  };

  return (
    <div className="analyze-container">
      <AppSidebar user={user} onLogout={onLogout} onSelectHistory={handleHistorySelect} />

      <div className="analyze-main">
        {/* Header */}
        <header className="analyze-header">
          <div className="header-content">
            <h1>DermAI Analysis</h1>
            <p>AI Dermatological Assistant</p>
          </div>
        </header>

        {/* Content Grid */}
        <div className="analyze-content">

          {/* --- LEFT COLUMN: CHAT INTERFACE --- */}
          <div className="chat-section">

            {/* Chat Window (Scrollable) */}
            <div className="chat-window">
              {chatHistory.length === 0 ? (
                /* Empty State / Welcome Screen */
                <div className="empty-state">
                  <div style={{ marginBottom: "16px" }}>
                    <DermAILogo size={48} />
                  </div>
                  <h2>Good afternoon</h2>
                  <p>Upload a photo to begin your skin analysis.</p>

                  <div className="suggestion-cards">
                    <div className="suggestion-card" onClick={triggerFileInput}>
                      <h3>Upload Photo</h3>
                      <p>Analyze a skin lesion</p>
                    </div>
                    <div className="suggestion-card">
                      <h3>View History</h3>
                      <p>Past reports</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Message List */
                <div className="message-list">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.type}`}>
                      <div className="message-bubble">
                        {msg.type === 'user' ? (
                          <img src={msg.content} alt="User upload" className="user-uploaded-image" />
                        ) : (
                          <div className="bot-text">
                            {/* Reusing your existing component to render the markdown result */}
                            <AnalysisResults analysis={msg.content} isLoading={false} error={msg.isError ? msg.content : ""} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading Bubble */}
                  {isLoading && (
                    <div className="message-row bot">
                      <div className="message-bubble loading-bubble">
                        <Loader2 className="spin-anim" size={20} />
                        <span>Analyzing lesion topology...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input Area (Fixed at bottom of left col) */}
            <div className="chat-input-area">
              {previewUrl && (
                <div className="mini-preview">
                  <img src={previewUrl} alt="Preview" />
                  <button onClick={() => { setPreviewUrl(""); setImage(null); }}>×</button>
                </div>
              )}

              <div className="input-wrapper">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <button className="icon-btn" onClick={triggerFileInput}>
                  <Plus size={20} />
                </button>

                <div className="fake-input" onClick={triggerFileInput}>
                  {image ? image.name : "Upload a lesion image..."}
                </div>

                <button
                  className="send-btn"
                  onClick={handleSubmit}
                  disabled={!image || isLoading}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: TIPS --- */}
          <div className="right-panel">
            <HealthTips />
          </div>

        </div>
      </div>
    </div>
  );
}
