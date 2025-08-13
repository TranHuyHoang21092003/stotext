const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultDiv = document.getElementById("result");

let mediaRecorder;
let audioChunks = [];

startBtn.onclick = async () => {
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("model", "gpt-4o-mini-transcribe"); // Hỗ trợ nhiều ngôn ngữ

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: "Bearer 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"
            },
            body: formData
        });

        const data = await response.json();
        resultDiv.innerText = data.text || "Không nhận diện được!";
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
