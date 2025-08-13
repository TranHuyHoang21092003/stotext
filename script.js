// Định nghĩa SpeechRecognition với prefix cho các trình duyệt khác nhau
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Kiểm tra hỗ trợ Web Speech API
if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech. Hãy thử Chrome, Safari, hoặc Edge.');
}

if (typeof SpeechRecognition === 'undefined') {
    alert('Trình duyệt của bạn không hỗ trợ Speech-to-Text. Hãy thử Chrome, Safari (phiên bản mới), hoặc các trình duyệt dựa trên Chromium như Cốc Cốc.');
    document.getElementById('startListeningBtn').disabled = true;
    document.getElementById('stopListeningBtn').disabled = true;
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

// Speech-to-Text (nếu hỗ trợ)
if (typeof SpeechRecognition !== 'undefined') {
    const startListeningBtn = document.getElementById('startListeningBtn');
    const stopListeningBtn = document.getElementById('stopListeningBtn');
    const output = document.getElementById('output');

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt (nếu hỗ trợ)
    recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng
    recognition.maxAlternatives = 1;

    startListeningBtn.addEventListener('click', () => {
        recognition.start();
        startListeningBtn.disabled = true;
        stopListeningBtn.disabled = false;
        startListeningBtn.textContent = 'Đang Nghe...';
    });

    stopListeningBtn.addEventListener('click', () => {
        recognition.stop();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        output.textContent = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Lỗi nhận diện: ', event.error);
        if (event.error === 'no-speech') {
            alert('Không phát hiện giọng nói. Hãy thử lại!');
        } else if (event.error === 'audio-capture') {
            alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập!');
        } else {
            alert('Có lỗi xảy ra: ' + event.error);
        }
        startListeningBtn.disabled = false;
        stopListeningBtn.disabled = true;
        startListeningBtn.textContent = 'Bắt Đầu Nghe';
    };

    recognition.onend = () => {
        startListeningBtn.disabled = false;
        stopListeningBtn.disabled = true;
        startListeningBtn.textContent = 'Bắt Đầu Nghe';
    };
}
