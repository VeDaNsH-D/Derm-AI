import React, { useState, useRef } from "react";
import axios from "axios";
import AppSidebar from "./components/AppSidebar";
import AnalysisResults from "./components/AnalysisResults";
import ChatHistory from "./components/ChatHistory";
import DermTips from "./components/DermTips";
import "./analyze.css";

export default function Analyze() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [showSidePanels, setShowSidePanels] = useState("tips");

  const fileInputRef = useRef(null);
  const API_URL = "http://127.0.0.1:5000/analyze";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis("");
      setError("");
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleSubmit = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysis("");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysis(response.data.analysis);
      setAnalyses([
        {
          title: `Analysis - ${new Date().toLocaleString()}`,
          date: new Date().toLocaleDateString(),
        },
        ...analyses,
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || "An unknown error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className="analyze-container">
      <AppSidebar onLogout={handleLogout} />
      
      <div className="analyze-main">
        {/* Header */}
        <header className="analyze-header">
          <div className="header-content">
            <h1>DermAI Analysis</h1>
            <p>Professional dermatological lesion analysis</p>
          </div>
        </header>

        {/* Content Area */}
        <div className="analyze-content">
          {/* Left Section - Upload & Results */}
          <div className="analyze-section">
            {/* Upload box */}
            <div className="upload-section" onClick={triggerFileInput}>
              <div className="upload-icon">📸</div>
              <p>Click to upload an image</p>
              <span>PNG, JPG, or WEBP (Max 5MB)</span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Preview */}
            {previewUrl && (
              <div className="preview-section">
                <img src={previewUrl || "/placeholder.svg"} alt="Selected lesion" />
                <button 
                  className="remove-btn"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl("");
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Analyze button */}
            <button
              className="analyze-button"
              onClick={handleSubmit}
              disabled={!image || isLoading}
            >
              {isLoading ? "Analyzing..." : "Run Educational Analysis"}
            </button>

            {/* Results */}
            <AnalysisResults
              analysis={analysis}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Right Sidebar - History & Tips */}
          <div className="analyze-sidebar">
            <div className="sidebar-tabs-toggle">
              <button
                className={`toggle-btn ${showSidePanels === "history" ? "active" : ""}`}
                onClick={() => setShowSidePanels("history")}
              >
                History
              </button>
              <button
                className={`toggle-btn ${showSidePanels === "tips" ? "active" : ""}`}
                onClick={() => setShowSidePanels("tips")}
              >
                Tips
              </button>
            </div>

            <div className="sidebar-content-wrapper">
              {showSidePanels === "history" ? (
                <ChatHistory analyses={analyses} />
              ) : (
                <DermTips />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
