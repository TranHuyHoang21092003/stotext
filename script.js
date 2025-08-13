let mediaRecorder;
let audioChunks = [];

// Nút bắt đầu ghi âm
document.getElementById("startBtn").addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("model", "gpt-4o-mini-transcribe");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: "Bearer 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"
            },
            body: formData
        });

        const result = await response.json();
        document.getElementById("result").value = result.text || "Không nhận diện được.";
    });

    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
});

// Nút dừng ghi âm
document.getElementById("stopBtn").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
});
