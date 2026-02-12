import React from "react";

function ResultCard({ price }) {
  if (!price) return null;

  return (
    <div className="card">
      <h2>Predicted Price</h2>
      <p>₹ {price.toLocaleString()}</p>
    </div>
  );
}

export default ResultCard;
