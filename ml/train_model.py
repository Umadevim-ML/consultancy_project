import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
data = pd.read_csv("dataset/mattress_dataset.csv")

# Convert categorical to numeric
encoders = {}

categorical_columns = [
    "sleepPosition",
    "firmnessPreference",
    "temperaturePreference",
    "recommendedCategory"
]

for col in categorical_columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    encoders[col] = le

# Features and target
X = data.drop("recommendedCategory", axis=1)
y = data["recommendedCategory"]

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save model
joblib.dump(model, "model.pkl")

# Save encoders
joblib.dump(encoders, "encoders.pkl")

print("Model trained successfully")
