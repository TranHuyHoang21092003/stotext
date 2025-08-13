const OPENAI_API_KEY = "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"; // 🔹 Thay bằng API key thật

let audioContext, analyser, dataArray, source;
let isRecording = false;

// 🎙 Bắt đầu ghi âm + gửi lên Whisper API
document.getElementById("start-record-btn").addEventListener("click", async () => {
    if (isRecording) {
        stopRecording();
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    visualize();

    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", blob, "audio.webm");
        formData.append("model", "whisper-1");

        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
            body: formData
        });

        const data = await res.json();
        document.getElementById("speech-result").value = data.text || "Không nhận diện được.";
    };

    mediaRecorder.start();
    isRecording = true;
    document.getElementById("start-record-btn").innerText = "⏹ Dừng ghi âm";

    // Dừng sau 15s
    setTimeout(() => {
        if (isRecording) stopRecording(mediaRecorder, stream);
    }, 15000);
});

function stopRecording(mediaRecorder, stream) {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    isRecording = false;
    document.getElementById("start-record-btn").innerText = "Bắt đầu ghi âm";
}

// 🎵 Hiệu ứng dao động
function visualize() {
    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

// 🗣 Text to Speech
document.getElementById("speak-btn").addEventListener("click", () => {
    const text = document.getElementById("text-input").value;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "auto";
    speechSynthesis.speak(utterance);
});
