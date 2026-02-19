from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow backend/frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and encoders
model = joblib.load("model.pkl")
encoders = joblib.load("encoders.pkl")


# Test route
@app.get("/")
def home():
    return {"message": "ML API is running"}


# Prediction route
@app.post("/predict")
def predict(data: dict):

    try:

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Encode categorical features
        df["sleepPosition"] = encoders["sleepPosition"].transform(
            [data["sleepPosition"]]
        )[0]

        df["firmnessPreference"] = encoders["firmnessPreference"].transform(
            [data["firmnessPreference"]]
        )[0]

        df["temperaturePreference"] = encoders["temperaturePreference"].transform(
            [data["temperaturePreference"]]
        )[0]

        # Predict
        prediction = model.predict(df)[0]

        # Decode prediction
        category = encoders["recommendedCategory"].inverse_transform(
            [prediction]
        )[0]

        return {
            "recommendedCategory": category,
            "status": "success"
        }

    except Exception as e:

        return {
            "error": str(e),
            "status": "failed"
        }
