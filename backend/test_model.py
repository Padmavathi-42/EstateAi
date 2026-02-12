import pickle
import time

print("Starting model load...")
start = time.time()

with open("model/ridge_model.pkl", "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully")
print("Time taken:", time.time() - start)
