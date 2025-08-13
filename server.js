import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

// Đọc API Key từ biến môi trường (không public key)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.static(".")); // Cho phép FE truy cập index.html, script.js, style.css

// API Speech-to-Text (Whisper)
app.post("/api/stt", upload.single("audio"), async (req, res) => {
  try {
    const audioFilePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath));
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData
    });

    const data = await response.json();
    fs.unlinkSync(audioFilePath); // Xóa file tạm
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Text-to-Speech
app.post("/api/tts", express.json(), async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
