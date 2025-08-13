// === Lấy danh sách ngôn ngữ ===
const languageSelect = document.getElementById("languageSelect");
const languages = [
    { code: "vi-VN", name: "Tiếng Việt" },
    { code: "en-US", name: "English (US)" },
    { code: "ja-JP", name: "日本語" },
    { code: "ko-KR", name: "한국어" },
    { code: "zh-CN", name: "中文 (简体)" },
    { code: "fr-FR", name: "Français" }
];
languages.forEach(lang => {
    let option = document.createElement("option");
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
});

// === Tạo thanh dao động âm thanh ===
const visualizer = document.getElementById("visualizer");
function showBars(active) {
    visualizer.innerHTML = "";
    if (active) {
        for (let i = 0; i < 10; i++) {
            let bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.animationDelay = `${i * 0.05}s`;
            visualizer.appendChild(bar);
        }
    } else {
        visualizer.textContent = "🔇";
    }
}
showBars(false);

// === Speech to Text ===
const startBtn = document.getElementById("startBtn");
const resultText = document.getElementById("resultText");

let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
} else {
    alert("Trình duyệt không hỗ trợ Speech Recognition");
}

if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = true;

    startBtn.onclick = () => {
        recognition.lang = languageSelect.value;
        recognition.start();
        showBars(true);
    };

    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        resultText.textContent = transcript;
    };

    recognition.onend = () => {
        showBars(false);
    };
}

// === Text to Speech ===
const speakBtn = document.getElementById("speakBtn");
const textInput = document.getElementById("textInput");

speakBtn.onclick = () => {
    const utterance = new SpeechSynthesisUtterance(textInput.value);
    utterance.lang = languageSelect.value;
    speechSynthesis.speak(utterance);
};
