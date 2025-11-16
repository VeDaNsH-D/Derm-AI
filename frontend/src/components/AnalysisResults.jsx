import React from "react";
import "../styles/AnalysisResults.css";

export default function AnalysisResults({ analysis, isLoading, error }) {
  // Debug logging
  console.log("AnalysisResults received:", analysis);

  const cleanAnalysis = analysis?.trim();

  // Don't render empty state
  if (!cleanAnalysis && !isLoading && !error) return null;

  return (
    <div className="analysis-results-container">

      {/* Loading State */}
      {isLoading && (
        <div className="analysis-loading">
          <div className="spinner"></div>
          <p>Analyzing the image…</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="analysis-error">
          <p>{error}</p>
        </div>
      )}

      {/* Actual Analysis Content */}
      {cleanAnalysis && !isLoading && (
        <div className="analysis-output">
          <h2 className="analysis-title">Analysis Result</h2>

          <div className="analysis-text">
            {cleanAnalysis.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
