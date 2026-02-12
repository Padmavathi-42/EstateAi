import React, { useState } from "react";
import { predictPrice } from "../api";

function PropertyForm({ onResult }) {
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await predictPrice({
      area: Number(area),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
    });

    onResult(result.predicted_price);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <input placeholder="Area (sqft)" value={area} onChange={(e) => setArea(e.target.value)} />
      <input placeholder="Bedrooms" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
      <input placeholder="Bathrooms" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
      <button type="submit">Predict Price</button>
    </form>
  );
}

export default PropertyForm;
