const recordBtn = document.getElementById("recordBtn");
const transcript = document.getElementById("transcript");
const ttsBtn = document.getElementById("ttsBtn");
const ttsText = document.getElementById("ttsText");

let mediaRecorder;
let audioChunks = [];

// Bắt đầu & dừng ghi âm
recordBtn.onclick = async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/stt", { method: "POST", body: formData });
      const data = await res.json();
      transcript.innerText = data.text || "Không nhận diện được.";
    };

    mediaRecorder.start();
    recordBtn.innerText = "⏹ Dừng ghi âm";
  } else {
    mediaRecorder.stop();
    recordBtn.innerText = "🎙 Bắt đầu ghi âm";
  }
};

// TTS
ttsBtn.onclick = async () => {
  const text = ttsText.value.trim();
  if (!text) return alert("Nhập văn bản trước!");

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    alert("Lỗi khi chuyển văn bản thành giọng nói");
    return;
  }

  const blob = await res.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
};
