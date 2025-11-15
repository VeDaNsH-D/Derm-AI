import React, { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud } from "lucide-react"; 
import AppSidebar from "./components/AppSidebar";
import AnalysisResults from "./components/AnalysisResults";
import HealthTips from "./components/HealthTips";
import DermAILogo from "./components/DermAILogo";
import "./Analyze.css";

export default function Analyze({ onLogout }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const API_URL = "https://derm-ai-c8yx.onrender.com/analyze";

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
    } catch (err) {
      const msg = err.response?.data?.error || "An unknown error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analyze-container">
      {/* Sidebar now handles its own open/close on hover via CSS */}
      <AppSidebar onLogout={onLogout} />
      
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
          {/* Left Column: Analysis Interface */}
          <div className="analyze-section">
            
            <div className="greeting-section">
              <div style={{ marginBottom: '16px' }}>
                <DermAILogo size={56} />
              </div>
              <h2>Good afternoon</h2>
              <p>How can I assist with dermatological analysis today?</p>
            </div>

            <div className="suggestion-cards">
              <div className="suggestion-card">
                <h3>Analyze skin condition</h3>
                <p>Upload image for AI-powered analysis</p>
              </div>
              <div className="suggestion-card">
                <h3>View analysis history</h3>
                <p>Browse your past dermatology reports</p>
              </div>
              <div className="suggestion-card">
                <h3>Learn about conditions</h3>
                <p>Explore skin condition resources</p>
              </div>
              <div className="suggestion-card">
                <h3>Get personalized advice</h3>
                <p>Ask questions about skin health</p>
              </div>
            </div>

            <div className="upload-section" onClick={triggerFileInput}>
              <div className="upload-icon-placeholder">
                <UploadCloud size={32} color="#000000" />
              </div>
              <p>Click to upload an image</p>
              <span>PNG, JPG, or WEBP (Max 5MB)</span>
            </div>

            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

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
                  ×
                </button>
              </div>
            )}

            <button
              className="analyze-button"
              onClick={handleSubmit}
              disabled={!image || isLoading}
            >
              {isLoading ? "Analyzing..." : "Run Educational Analysis"}
            </button>

            <AnalysisResults
              analysis={analysis}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Right Column: Tips Only */}
          <div className="right-panel">
            <HealthTips />
          </div>
        </div>
      </div>
    </div>
  );
}
