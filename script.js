const API_KEY = "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"; // ⚠️ Đặt API key của bạn ở đây

let mediaRecorder;
let audioChunks = [];
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const speakBtn = document.getElementById("speakBtn");
const outputText = document.getElementById("outputText");
const waveform = document.getElementById("waveform");

function createWaveform() {
    waveform.innerHTML = "";
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.animationDelay = `${i * 0.05}s`;
        waveform.appendChild(bar);
    }
}

function clearWaveform() {
    waveform.innerHTML = "";
}

startBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstart = createWaveform;

    mediaRecorder.onstop = async () => {
        clearWaveform();
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("model", "whisper-1");

        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${API_KEY}` },
            body: formData
        });

        const data = await res.json();
        outputText.value = data.text || "❌ Không nhận diện được!";
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

speakBtn.onclick = () => {
    const text = outputText.value;
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN"; // Có thể đổi sang ngôn ngữ khác
    speechSynthesis.speak(utterance);
};
