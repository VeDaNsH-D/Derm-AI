import React, { useState } from "react";
import { Sun, Droplets, Moon, Shield, Utensils, ChevronRight, Sparkles } from 'lucide-react';
import "../styles/HealthTips.css";

export default function HealthTips() {
  const [activeTip, setActiveTip] = useState(1);

  const tips = [
    {
      id: 1,
      icon: Sun,
      title: "Sun Defense",
      summary: "SPF 30+ is your best anti-aging tool.",
      details: "UV rays cause 90% of skin aging. Apply broad-spectrum sunscreen every morning, even on cloudy days."
    },
    {
      id: 2,
      icon: Droplets,
      title: "Hydration Barrier",
      summary: "Lock in moisture while skin is damp.",
      details: "Apply moisturizer within 3 minutes of washing your face to trap water in your skin barrier effectively."
    },
    {
      id: 3,
      icon: Moon,
      title: "Night Recovery",
      summary: "Skin repairs itself while you sleep.",
      details: "Cell turnover peaks between 11 PM and 4 AM. Use this time for heavy creams or retinoids."
    },
    {
      id: 4,
      icon: Shield,
      title: "The ABCDE Rule",
      summary: "Monitor moles for changes.",
      details: "Check for Asymmetry, Border irregularity, Color changes, Diameter >6mm, and Evolving shapes."
    },
    {
      id: 5,
      icon: Utensils,
      title: "Skin Nutrition",
      summary: "Antioxidants fight free radicals.",
      details: "Vitamin C (citrus) and Vitamin E (nuts/seeds) protect skin cells from oxidative stress."
    }
  ];

  return (
    <div className="health-tips-container">
      <div className="tips-header-modern">
        <div className="header-icon-bg">
          <Sparkles size={18} className="header-icon-svg" strokeWidth={1.5} />
        </div>
        <div>
          <h3>Daily Insights</h3>
          <p>Evidence-based dermatology advice</p>
        </div>
      </div>

      <div className="tips-list-modern">
        {tips.map((tip) => {
          const Icon = tip.icon;
          const isActive = activeTip === tip.id;

          return (
            <div 
              key={tip.id} 
              className={`tip-card-modern ${isActive ? "active" : ""}`}
              onClick={() => setActiveTip(isActive ? null : tip.id)}
            >
              <div className="tip-summary">
                <div className="tip-icon-modern">
                  <Icon size={18} strokeWidth={2} />
                </div>
                
                <div className="tip-text-content">
                  <h4 className={isActive ? "active-text" : ""}>{tip.title}</h4>
                  {!isActive && <span className="tip-preview">{tip.summary}</span>}
                </div>

                <ChevronRight 
                  size={16} 
                  className={`tip-chevron ${isActive ? "rotated" : ""}`} 
                />
              </div>

              <div className="tip-details-wrapper">
                <div className="tip-details-inner">
                  <p className="main-detail">{tip.details}</p>
                  <div className="tip-tag">
                    <span>Recommended</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}