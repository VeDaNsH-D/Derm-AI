import React, { useState } from "react";
import { Heart, Sun, Droplets, AlertCircle, Activity, Utensils } from 'lucide-react';
import "../styles/HealthTips.css";

export default function HealthTips() {
  const [expandedTip, setExpandedTip] = useState(null);

  const tips = [
    {
      id: 1,
      icon: Sun,
      title: "Sun Protection",
      description: "Apply SPF 30+ sunscreen daily and reapply every 2 hours",
      details: "UV exposure is the primary cause of skin damage. Use broad-spectrum sunscreen, wear protective clothing, and avoid peak sun hours (10 AM - 4 PM)."
    },
    {
      id: 2,
      icon: Droplets,
      title: "Hydration",
      description: "Keep your skin hydrated with daily moisturizer",
      details: "Moisturizing helps maintain skin barrier integrity and reduces irritation. Choose products suited to your skin type."
    },
    {
      id: 3,
      icon: Heart,
      title: "Healthy Lifestyle",
      description: "Exercise, good sleep, and stress management promote skin health",
      details: "Regular physical activity improves circulation, adequate sleep aids skin repair, and stress management reduces inflammation."
    },
    {
      id: 4,
      icon: AlertCircle,
      title: "Monitor Changes",
      description: "Track any changes in existing lesions using the ABCDE rule",
      details: "Asymmetry, Border irregularity, Color variation, Diameter > 6mm, Elevation/Evolution - if you notice these, consult a dermatologist."
    },
    {
      id: 5,
      icon: Activity,
      title: "Regular Screening",
      description: "Schedule annual skin checks with a dermatologist",
      details: "Early detection is key. Professional screening can identify potential concerns before they become serious."
    },
    {
      id: 6,
      icon: Utensils,
      title: "Nutrition",
      description: "Eat antioxidant-rich foods for skin health",
      details: "Foods rich in vitamins C, E, and selenium support skin health. Include berries, nuts, and leafy greens in your diet."
    }
  ];

  return (
    <div className="health-tips-container">
      <div className="tips-header">
        <h3>Skin Care Tips</h3>
        <p>Evidence-based recommendations for healthy skin</p>
      </div>

      <div className="tips-grid">
        {tips.map((tip) => {
          const Icon = tip.icon;
          const isExpanded = expandedTip === tip.id;

          return (
            <div 
              key={tip.id} 
              className={`tip-card ${isExpanded ? "expanded" : ""}`}
              onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
            >
              <div className="tip-icon">
                <Icon size={24} />
              </div>
              <div className="tip-content">
                <h4>{tip.title}</h4>
                <p className="tip-description">{tip.description}</p>
                {isExpanded && (
                  <p className="tip-details">{tip.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
