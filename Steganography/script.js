let finalImage = null;
function embedText() {
    const imageFile = document.getElementById("imgInput").files[0];
    const secretText = document.getElementById("msgInput").value;
    if (!imageFile || secretText.trim() === "") {
        alert("Please choose an image and enter text.");
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => encodeLSB(img, secretText);
        img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
}
function encodeLSB(image, text) {
    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fullCanvas = document.createElement("canvas");
    const fullCtx = fullCanvas.getContext("2d");
    fullCanvas.width = image.width;
    fullCanvas.height = image.height;
    fullCtx.drawImage(image, 0, 0);
    const imgData = fullCtx.getImageData(0, 0, image.width, image.height);
    const pixels = imgData.data;
    const stopKey = text + "|||STOP|||";
    let binary = "";
    for (let ch of stopKey) {
        binary += ch.charCodeAt(0).toString(2).padStart(8, "0");
    }
    if (binary.length > pixels.length / 4) {
        alert("Text too long for this image.");
        return;
    }
    for (let i = 0; i < binary.length; i++) {
        pixels[i * 4] = (pixels[i * 4] & 254) | parseInt(binary[i]);
    }
    fullCtx.putImageData(imgData, 0, 0);
    finalImage = fullCanvas.toDataURL("image/png");
    const maxWidth = canvas.parentElement.clientWidth;
    const maxHeight = 420;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);
    ctx.drawImage(fullCanvas, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";
    document.getElementById("saveBtn").style.display = "inline-block";
    alert("Text embedded successfully!");
}
function saveImage() {
    const a = document.createElement("a");
    a.href = finalImage;
    a.download = "secure_image.png";
    a.click();
}
function extractText() {
    const imageFile = document.getElementById("decodeInput").files[0];
    if (!imageFile) {
        alert("Please select an image.");
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => decodeLSB(img);
        img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
}
function decodeLSB(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let binary = "";
    for (let i = 0; i < pixels.length; i += 4) {
        binary += (pixels[i] & 1);
    }
    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
        const char = String.fromCharCode(parseInt(binary.substr(i, 8), 2));
        text += char;
        if (text.endsWith("|||STOP|||")) break;
    }
    text = text.replace("|||STOP|||", "");

    const finalText = text.trim()
        ? text
        : "No hidden message detected.";
    const output = document.getElementById("outputText");
    output.textContent = finalText;
    speakText(finalText);
}
function speakText(message) {
    if (!message || message === "No hidden message detected.") return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}
function speakMessage() {
    const message = document.getElementById("outputText").innerText;
    speakText(message);
}
