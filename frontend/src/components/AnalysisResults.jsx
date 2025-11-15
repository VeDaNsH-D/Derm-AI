import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Download } from 'lucide-react';
import { jsPDF } from "jspdf";
import '../styles/AnalysisResults.css';

export default function AnalysisResults({ analysis, isLoading, error }) {
  
  // Helper function to remove markdown special characters
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")   // Remove bold markers (**)
      .replace(/\*/g, "")     // Remove italics/list markers (*)
      .replace(/#{1,6} /g, "") // Remove headers (#)
      .replace(/`/g, "")      // Remove code ticks (`)
      .trim();
  };

  // Create the plain text version to use everywhere
  const plainAnalysis = cleanText(analysis);

  const handleDownload = () => {
    if (!plainAnalysis) return;

    const doc = new jsPDF();

    // --- Header Section ---
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DermAI", 20, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Skin Analysis Report", 20, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    // --- Content Section ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Use the CLEANED text here
    const textLines = doc.splitTextToSize(plainAnalysis, maxWidth);
    
    doc.text(textLines, margin, 55);

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('DermAI - Educational Analysis Only', margin, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`DermAI_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="results-section loading">
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Analyzing image...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-section error">
        <div className="error-box">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!plainAnalysis) {
    return null;
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="header-left">
          <CheckCircle size={20} className="check-icon" />
          <h2>Analysis Results</h2>
        </div>
        
        <button 
          className="download-btn" 
          onClick={handleDownload}
          title="Download Report as PDF"
        >
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="analysis-card">
        <div className="analysis-badge">
          <TrendingUp size={16} />
          <span>AI Analysis</span>
        </div>
        <div className="analysis-content">
          {/* Display the cleaned plain text */}
          {plainAnalysis}
        </div>
      </div>
    </div>
  );
}