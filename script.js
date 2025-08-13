const API_KEY = "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";

let mediaRecorder;
let audioChunks = [];
const micIcon = document.getElementById("micIcon");
const resultDiv = document.getElementById("result");

document.getElementById("startBtn").addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
            audioChunks.push(e.data);
        }
    };

    mediaRecorder.onstart = () => {
        micIcon.style.animation = "pulse 0.8s infinite";
    };

    mediaRecorder.onstop = async () => {
        micIcon.style.animation = "none";
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
    };

    mediaRecorder.start();
    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
});

document.getElementById("stopBtn").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
});

async function transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "gpt-4o-mini-transcribe"); // hỗ trợ nhiều ngôn ngữ
    formData.append("response_format", "text");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`
        },
        body: formData
    });

    const text = await response.text();
    resultDiv.textContent = text;
}
