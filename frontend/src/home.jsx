import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">Derm<span>AI</span></div>

          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <button className="btn-outline" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-text">
          <h1>AI-Powered Skin Analysis</h1>
          <p>
            Upload an image of your skin condition and receive an instant,
            educational, and AI-driven analysis to help you understand your skin
            better.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Get Started
            </button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-placeholder">
            Skin Analysis Preview
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="features">
        <h2 className="section-title">Features</h2>
        <p className="section-subtitle">
          Smart, fast, and reliable skin analysis tools
        </p>

        <div className="features-grid">
          {[
            ["Instant Analysis", "Get results in seconds using advanced AI"],
            ["High Accuracy", "Trained on thousands of dermatology cases"],
            ["Detailed Reports", "Severity levels, description & education"],
            ["Privacy First", "Your data is always encrypted"],
            ["Mobile Ready", "Works on all devices"],
            ["Educational", "Learn about different skin conditions"],
          ].map(([title, desc]) => (
            <div key={title} className="feature-card">
              <div className="feature-icon" />
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="process">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple 3-step flow</p>

        <div className="process-steps">
          {[
            ["Upload Image", "Upload a clear photo of the affected area"],
            ["AI Analysis", "The AI model evaluates your image"],
            ["Get Results", "Receive an instant & educational report"],
          ].map(([title, desc], index) => (
            <div key={title} className="step">
              <div className="step-number">{index + 1}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta">
        <h2>Ready to check your skin?</h2>
        <p>Join thousands using DermAI to understand their skin better</p>
        <button className="btn-primary btn-large" onClick={() => navigate("/login")}>
          Get Started Now
        </button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>Derm-AI</h4>
            <p>AI-powered skin analysis</p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2025 Derm-AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
