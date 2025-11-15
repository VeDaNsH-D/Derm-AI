import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import '../styles/AnalysisResults.css';

export default function AnalysisResults({ analysis, isLoading, error }) {
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

  if (!analysis) {
    return null;
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <CheckCircle size={20} className="check-icon" />
        <h2>Analysis Results</h2>
      </div>

      <div className="analysis-card">
        <div className="analysis-badge">
          <TrendingUp size={16} />
          <span>AI Analysis</span>
        </div>
        <div className="analysis-content">
          {analysis}
        </div>
      </div>
    </div>
  );
}
