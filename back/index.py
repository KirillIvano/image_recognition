from flask import Flask, request
from flask_cors import CORS
from train.predict import predict
import cv2
import numpy as np

app = Flask(__name__)
app.debug = True

CORS(app)

@app.route('/check', methods=['POST'])
def home():
    image_np = np.fromstring(request.data, np.uint8)
    res = predict(cv2.imdecode(image_np, cv2.IMREAD_COLOR))

    return {"num": res}

app.run('127.0.0.1', 5000)