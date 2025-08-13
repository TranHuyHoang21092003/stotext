// Kiểm tra hỗ trợ Web Speech API
if (!('speechSynthesis' in window) || !('SpeechRecognition' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Web Speech API. Hãy thử Chrome để có trải nghiệm tốt nhất.');
}

// Text-to-Speech
const textToSpeak = document.getElementById('textToSpeak');
const speakBtn = document.getElementById('speakBtn');

speakBtn.addEventListener('click', () => {
    const text = textToSpeak.value.trim();
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt (nếu hỗ trợ)
        speechSynthesis.speak(utterance);
    } else {
        alert('Vui lòng nhập văn bản!');
    }
});

// Speech-to-Text
const startListeningBtn = document.getElementById('startListeningBtn');
const output = document.getElementById('output');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt
recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng
recognition.maxAlternatives = 1;

startListeningBtn.addEventListener('click', () => {
    recognition.start();
    startListeningBtn.textContent = 'Đang Nghe...';
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    output.textContent = transcript;
    startListeningBtn.textContent = 'Bắt Đầu Nghe';
};

recognition.onerror = (event) => {
    console.error('Lỗi nhận diện: ', event.error);
    alert('Có lỗi xảy ra: ' + event.error);
    startListeningBtn.textContent = 'Bắt Đầu Nghe';
};

recognition.onend = () => {
    startListeningBtn.textContent = 'Bắt Đầu Nghe';
};
