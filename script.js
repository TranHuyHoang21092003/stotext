// === API KEY của bạn ===
const API_KEY = "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";

const recordBtn = document.getElementById("recordBtn");
const transcriptEl = document.getElementById("transcript");
const speakBtn = document.getElementById("speakBtn");
const textToSpeech = document.getElementById("textToSpeech");

let mediaRecorder;
let audioChunks = [];

// === Thu âm và gửi lên Whisper ===
recordBtn.onclick = async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        audioChunks = [];
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            recordBtn.textContent = "⏹ Dừng ghi âm";

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                recordBtn.textContent = "🎙 Bắt đầu ghi âm";
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                const formData = new FormData();
                formData.append("file", audioBlob, "recording.webm");
                formData.append("model", "whisper-1");

                const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${API_KEY}`
                    },
                    body: formData
                });

                const data = await res.json();
                transcriptEl.textContent = data.text || "❌ Lỗi nhận diện";
            };
        });
    } else {
        mediaRecorder.stop();
    }
};

// === Văn bản → Giọng nói (TTS) ===
speakBtn.onclick = async () => {
    const text = textToSpeech.value.trim();
    if (!text) return alert("Vui lòng nhập văn bản!");

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini-tts",
            voice: "alloy",
            input: text
        })
    });

    if (!res.ok) {
        alert("❌ Lỗi TTS");
        return;
    }

    const audioBlob = await res.blob();
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
};
