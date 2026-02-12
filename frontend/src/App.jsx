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

  const BASE_URL = "https://estateai-backend-o9n9.onrender.com";

  const [area, setArea] = useState(1000);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [price, setPrice] = useState(null);
  const [range, setRange] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/locations`)
      .then(res => res.json())
      .then(data => setLocations(data.locations))
      .catch(err => console.error(err));

    fetch(`${BASE_URL}/model-info`)
      .then(res => res.json())
      .then(data => setAccuracy(data.accuracy))
      .catch(err => console.error(err));
  }, []);

  const formatIndianPrice = (value) => {
    if (!value) return "";
    if (value >= 10000000) {
      return `₹ ${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${value.toLocaleString("en-IN")}`;
    }
  };

  const predictPrice = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, bedrooms, bathrooms, location })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      setPrice(data.predicted_price);
      setRange({
        min: data.min_price,
        max: data.max_price
      });

    } catch (error) {
      alert("Prediction failed.");
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

        <h1>AI Powered Real Estate Price Prediction Platform</h1>
        <p className="subtitle">
          Accurate property valuation based on area, configuration and location intelligence.
        </p>

        {accuracy && (
          <div className="accuracy">
            Model Accuracy: {accuracy}%
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
          {loading ? <div className="spinner"></div> : "Estimate Property Value"}
        </button>

        {price && (
          <div className="result">
            <h2>{formatIndianPrice(price)}</h2>
            <p>
              {formatIndianPrice(range.min)} – {formatIndianPrice(range.max)}
            </p>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
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
        <div className="footer-bottom">
          © {new Date().getFullYear()} EstateAI. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
