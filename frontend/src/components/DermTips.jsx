import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import '../styles/DermTips.css';

export default function DermTips() {
  const [expanded, setExpanded] = useState(null);

  const tips = [
    {
      id: 1,
      title: 'Sun Protection is Essential',
      description: 'Daily SPF 30+ protects against UV damage. Reapply every 2 hours when outdoors.',
      category: 'Prevention'
    },
    {
      id: 2,
      title: 'Moisturize Consistently',
      description: 'Use a non-comedogenic moisturizer twice daily to maintain skin barrier health.',
      category: 'Care'
    },
    {
      id: 3,
      title: 'Avoid Picking Lesions',
      description: 'Scratching or picking can lead to infection and scarring. Let lesions heal naturally.',
      category: 'Safety'
    },
    {
      id: 4,
      title: 'Stay Hydrated',
      description: 'Drink 8-10 glasses of water daily for optimal skin health from within.',
      category: 'Wellness'
    },
    {
      id: 5,
      title: 'Regular Check-ups',
      description: 'Visit a dermatologist annually for skin cancer screening and preventive care.',
      category: 'Medical'
    },
    {
      id: 6,
      title: 'Clean Brushes & Tools',
      description: 'Sanitize makeup brushes weekly to prevent bacterial buildup and infections.',
      category: 'Hygiene'
    }
  ];

  return (
    <div className="derm-tips">
      <div className="tips-header">
        <Lightbulb size={18} />
        <h3>Dermatology Tips</h3>
      </div>

      <div className="tips-list">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className={`tip-card ${expanded === tip.id ? 'expanded' : ''}`}
          >
            <button
              className="tip-button"
              onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
            >
              <div className="tip-header">
                <div className="tip-text">
                  <h4>{tip.title}</h4>
                  <span className="tip-category">{tip.category}</span>
                </div>
              </div>
              <ChevronDown size={16} className="chevron" />
            </button>

            {expanded === tip.id && (
              <div className="tip-content">
                <p>{tip.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
