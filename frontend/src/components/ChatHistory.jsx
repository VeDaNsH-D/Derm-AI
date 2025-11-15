import React from 'react';
import { Clock, Trash2, ChevronRight } from 'lucide-react';
import '../styles/ChatHistory.css';

export default function ChatHistory({ analyses }) {
  const handleDelete = (id) => {
    console.log('Delete analysis:', id);
  };

  return (
    <div className="chat-history">
      <div className="history-header">
        <Clock size={18} />
        <h3>Analysis History</h3>
      </div>

      {analyses.length === 0 ? (
        <div className="empty-state">
          <p>No analyses yet</p>
          <span>Start by uploading an image to begin</span>
        </div>
      ) : (
        <div className="history-list">
          {analyses.map((analysis, idx) => (
            <div key={idx} className="history-item">
              <div className="item-content">
                <p className="item-title">{analysis.title}</p>
                <span className="item-date">{analysis.date}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(idx)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
