import React, { useState, useEffect } from "react";
import "./styles.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function App() {

  const [area, setArea] = useState(1000);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [price, setPrice] = useState(null);
  const [range, setRange] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://estateai-backend-o9n9.onrender.com";

  useEffect(() => {
    fetch(`${BASE_URL}/locations`)
      .then(res => res.json())
      .then(data => setLocations(data.locations))
      .catch(err => console.error("Error fetching locations:", err));

    fetch(`${BASE_URL}/model-info`)
      .then(res => res.json())
      .then(data => setAccuracy(data.accuracy))
      .catch(err => console.error("Error fetching model info:", err));
  }, []);

  const predictPrice = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          area,
          bedrooms,
          bathrooms,
          location
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Prediction failed");
        return;
      }

      setPrice(data.predicted_price);
      setRange({
        min: data.min_price,
        max: data.max_price
      });

    } catch (error) {
      console.error(error);
      alert("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = price ? [
    { name: "Min", value: range.min },
    { name: "Predicted", value: price },
    { name: "Max", value: range.max }
  ] : [];

  return (
    <div className="page">

      <div className="background-shape shape1"></div>
      <div className="background-shape shape2"></div>

      <nav className="navbar">
        <div className="logo">🏢 EstateAI</div>
        <div className="nav-links">
          <a href="#predict">Predict</a>
        </div>
      </nav>

      <section id="predict" className="card">

        <h1>Smart Property Valuation</h1>

        {accuracy && (
          <div className="accuracy">
            Model Accuracy {accuracy}%
          </div>
        )}

        <input
          type="number"
          value={area}
          onChange={e => setArea(Number(e.target.value))}
          placeholder="Area (sq.ft)"
        />

        <div className="row">
          <input
            type="number"
            value={bedrooms}
            onChange={e => setBedrooms(Number(e.target.value))}
            placeholder="Bedrooms"
          />

          <input
            type="number"
            value={bathrooms}
            onChange={e => setBathrooms(Number(e.target.value))}
            placeholder="Bathrooms"
          />
        </div>

        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
        >
          <option value="">Select Location</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button onClick={predictPrice}>
          {loading ? <div className="spinner"></div> : "Estimate Price"}
        </button>

        {price && (
          <div className="result">
            <h2>₹ {price.toLocaleString("en-IN")}</h2>
            <p>
              ₹ {range.min.toLocaleString("en-IN")} – ₹{" "}
              {range.max.toLocaleString("en-IN")}
            </p>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00f2fe"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </section>

      <footer className="footer">

        <div className="footer-divider"></div>

        <div className="footer-container">

          <div className="footer-brand">
            <h3>EstateAI</h3>
            <div className="accent-line"></div>
            <p>
              Intelligent property valuation powered by machine learning.
            </p>

            <div className="social-icons">
              <a href="#" target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Product</h4>
            <a href="#predict">Valuation</a>
            <a href="#">Analytics</a>
            <a href="#">API Access</a>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-newsletter">
            <h4>Subscribe</h4>
            <p>Get product updates and insights.</p>
            <div className="newsletter-box">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} EstateAI. All rights reserved.
        </div>

      </footer>

    </div>
  );
}
