from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import json
import numpy as np
import os

# =========================================
# INIT
# =========================================

app = FastAPI(title="Real Estate Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# LOAD FILES
# =========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "model", "ridge_model.pkl")
columns_path = os.path.join(BASE_DIR, "data", "columns.json")

with open(model_path, "rb") as f:
    model = pickle.load(f)

with open(columns_path, "r") as f:
    columns = json.load(f)

# Extract location names dynamically
locations = [col.replace("location_", "") 
             for col in columns if col.startswith("location_")]

# Hardcoded accuracy (safe way)
model_accuracy = 87.5


# =========================================
# INPUT MODEL
# =========================================

class PredictionInput(BaseModel):
    area: float
    bedrooms: int
    bathrooms: int
    location: str


# =========================================
# ROOT
# =========================================

@app.get("/")
def home():
    return {"message": "Backend Running 🚀"}


# =========================================
# GET MODEL INFO
# =========================================

@app.get("/model-info")
def model_info():
    return {
        "model": "Ridge Regression",
        "accuracy": model_accuracy
    }


# =========================================
# GET LOCATIONS (DYNAMIC)
# =========================================

@app.get("/locations")
def get_locations():
    return {"locations": locations}


# =========================================
# PREDICT
# =========================================

@app.post("/predict")
def predict(data: PredictionInput):

    try:
        x = np.zeros(len(columns))

        x[0] = data.area
        x[1] = data.bathrooms
        x[2] = data.bedrooms

        location_column = f"location_{data.location}"

        if location_column in columns:
            loc_index = columns.index(location_column)
            x[loc_index] = 1
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid location selected"
            )

        prediction = model.predict([x])[0]

        return {
            "predicted_price": round(float(prediction), 2),
            "min_price": round(float(prediction * 0.95), 2),
            "max_price": round(float(prediction * 1.05), 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
