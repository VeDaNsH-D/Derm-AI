import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf"; // <--- Import jsPDF
import { Send, Plus, Loader2, Download } from "lucide-react"; // <--- Import Download Icon
import AppSidebar from "./components/AppSidebar";
import HealthTips from "./components/HealthTips";
import DermAILogo from "./components/DermAILogo";
import "./Analyze.css";

// --- HELPER COMPONENT: Format Text ---
const FormatAIResponse = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="formatted-content">
      {lines.map((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <br key={index} />;
        if (cleanLine.startsWith("###") || cleanLine.startsWith("##")) {
          return <h4 key={index}>{cleanLine.replace(/#/g, "").trim()}</h4>;
        }
        if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
          const content = cleanLine.substring(2);
          return (
            <div key={index} className="list-item">
              • <span dangerouslySetInnerHTML={{
                __html: content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              }} />
            </div>
          );
        }
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

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = "https://derm-ai-c8yx.onrender.com/analyze";

  useEffect(() => {
    if (chatEndRef.current) {
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

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownloadPDF = (content) => {
    const doc = new jsPDF();
    
    // 1. Add Title
    doc.setFontSize(18);
    doc.text("DermAI Skin Analysis Report", 15, 20);
    
    // 2. Add Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);
    
    // 3. Add Line Separator
    doc.setDrawColor(200);
    doc.line(15, 32, 195, 32);

    // 4. Clean Text (Remove Markdown symbols for PDF readability)
    const cleanText = content
      .replace(/###/g, "")   // Remove headers
      .replace(/\*\*/g, "")  // Remove bold
      .replace(/\*/g, "•");  // Replace bullets

    // 5. Wrap Text
    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(cleanText, 180); // Width 180mm
    doc.text(splitText, 15, 40);

    // 6. Save
    doc.save("DermAI_Analysis.pdf");
  };

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
        content: response.data.analysis, 
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botEntry]);

      await axios.post("https://derm-ai-c8yx.onrender.com/save-analysis", {
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
                            <FormatAIResponse text={msg.content} />
                            
                            {/* --- DOWNLOAD BUTTON ADDED HERE --- */}
                            {!msg.isError && (
                              <button 
                                className="pdf-download-btn" 
                                onClick={() => handleDownloadPDF(msg.content)}
                              >
                                <Download size={14} />
                                Download PDF Report
                              </button>
                            )}
                            
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