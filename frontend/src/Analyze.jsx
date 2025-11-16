import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Plus, Loader2 } from "lucide-react";
import AppSidebar from "./components/AppSidebar";
import HealthTips from "./components/HealthTips";
import DermAILogo from "./components/DermAILogo";
import "./Analyze.css";

// --- HELPER COMPONENT: Format Text ---
// This removes special characters like **, ###, etc., and renders clean HTML
const FormatAIResponse = ({ text }) => {
  if (!text) return null;

  // Split text by lines to handle structure
  const lines = text.split("\n");

  return (
    <div className="formatted-content">
      {lines.map((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <br key={index} />;

        // Handle Headers (### Title)
        if (cleanLine.startsWith("###") || cleanLine.startsWith("##")) {
          return <h4 key={index}>{cleanLine.replace(/#/g, "").trim()}</h4>;
        }

        // Handle Bullet Points (* Item or - Item)
        if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
          const content = cleanLine.substring(2);
          // Parse Bold within bullets
          return (
            <div key={index} className="list-item">
              • <span dangerouslySetInnerHTML={{
                __html: content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              }} />
            </div>
          );
        }

        // Handle Standard Paragraphs with Bold (**text**)
        return (
          <p key={index} dangerouslySetInnerHTML={{
            __html: cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          }} />
        );
      })}
    </div>
  );
};

export default function Analyze({ user, onLogout }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = "https://derm-ai-c8yx.onrender.com/analyze";

  // ✅ SCROLL FIX: Trigger scroll whenever chatHistory or loading state changes
  useEffect(() => {
    if (chatEndRef.current) {
      // Small timeout ensures DOM is fully rendered before scrolling
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
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

    const userEntry = { type: 'user', content: previewUrl, timestamp: new Date() };
    setChatHistory(prev => [...prev, userEntry]);

    const currentImage = image;
    setImage(null);
    setPreviewUrl("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", currentImage);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const botEntry = {
        type: 'bot',
        content: response.data.analysis, // Raw text passed to formatter later
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botEntry]);

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
    setChatHistory([
      { type: 'bot', content: "Here is the archived analysis you requested:" },
      { type: 'bot', content: item.analysis }
    ]);
  };

  return (
    <div className="analyze-container">
      <AppSidebar user={user} onLogout={onLogout} onSelectHistory={handleHistorySelect} />

      <div className="analyze-main">
        <header className="analyze-header">
          <div className="header-content">
            <h1>DermAI Analysis</h1>
            <p>AI Dermatological Assistant</p>
          </div>
        </header>

        <div className="analyze-content">
          {/* LEFT COLUMN: CHAT */}
          <div className="chat-section">

            <div className="chat-window">
              {chatHistory.length === 0 ? (
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
                <div className="message-list">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.type}`}>
                      <div className="message-bubble">
                        {msg.type === 'user' ? (
                          <img src={msg.content} alt="User upload" className="user-uploaded-image" />
                        ) : (
                          <div className="bot-text">
                            {/* ✅ Formatted Component Used Here */}
                            <FormatAIResponse text={msg.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="message-row bot">
                      <div className="message-bubble loading-bubble">
                        <Loader2 className="spin-anim" size={20} />
                        <span>Analyzing lesion topology...</span>
                      </div>
                    </div>
                  )}
                  {/* ✅ Invisible div to anchor scrolling */}
                  <div ref={chatEndRef} style={{ float: "left", clear: "both" }} />
                </div>
              )}
            </div>

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

          <div className="right-panel">
            <HealthTips />
          </div>

        </div>
      </div>
    </div>
  );
}
