const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!('speechSynthesis' in window)) {
    alert('Trình duyệt không hỗ trợ Text-to-Speech. Hãy thử Chrome, Safari, hoặc Edge.');
}

if (typeof SpeechRecognition === 'undefined') {
    alert('Trình duyệt không hỗ trợ Speech-to-Text. Hãy thử Chrome, Safari (phiên bản mới), hoặc Cốc Cốc.');
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
        utterance.lang = 'vi-VN';
        utterance.volume = 1.0;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    } else {
        alert('Vui lòng nhập văn bản!');
    }
});

// Speech-to-Text
if (typeof SpeechRecognition !== 'undefined') {
    const startListeningBtn = document.getElementById('startListeningBtn');
    const stopListeningBtn = document.getElementById('stopListeningBtn');
    const output = document.getElementById('output');

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let silenceTimeout;

    // Kiểm tra quyền microphone trước khi ghi âm
    async function checkMicPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (err) {
            alert('Không thể truy cập microphone. Vui lòng cấp quyền trong cài đặt trình duyệt!');
            return false;
        }
    }

    startListeningBtn.addEventListener('click', async () => {
        const hasPermission = await checkMicPermission();
        if (!hasPermission) return;

        recognition.start();
        startListeningBtn.disabled = true;
        stopListeningBtn.disabled = false;
        startListeningBtn.textContent = 'Đang Nghe...';
        startListeningBtn.classList.add('recording');

        silenceTimeout = setTimeout(() => {
            recognition.stop();
            alert('Không phát hiện giọng nói. Đã dừng ghi âm.');
        }, 7000);
    });

    stopListeningBtn.addEventListener('click', () => {
        recognition.stop();
        clearTimeout(silenceTimeout);
    });

    recognition.onstart = () => {
        console.log('Bắt đầu nhận diện giọng nói');
    };

    recognition.onresult = (event) => {
        clearTimeout(silenceTimeout);
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        output.textContent = transcript;

        // Reset timeout cho mỗi lần nhận diện mới
        silenceTimeout = setTimeout(() => {
            recognition.stop();
            alert('Không phát hiện giọng nói tiếp theo. Đã dừng ghi âm.');
        }, 7000);
    };

    recognition.onerror = (event) => {
        clearTimeout(silenceTimeout);
        console.error('Lỗi nhận diện: ', event.error);
        if (event.error === 'no-speech') {
            alert('Không phát hiện giọng nói. Hãy thử lại!');
        } else if (event.error === 'audio-capture') {
            alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền!');
        } else if (event.error === 'not-allowed') {
            alert('Quyền microphone bị từ chối. Vui lòng cấp quyền trong cài đặt!');
        } else {
            alert('Lỗi: ' + event.error);
        }
        startListeningBtn.disabled = false;
        stopListeningBtn.disabled = true;
        startListeningBtn.textContent = 'Bắt Đầu Nghe';
        startListeningBtn.classList.remove('recording');
    };

    recognition.onend = () => {
        clearTimeout(silenceTimeout);
        startListeningBtn.disabled = false;
        stopListeningBtn.disabled = true;
        startListeningBtn.textContent = 'Bắt Đầu Nghe';
        startListeningBtn.classList.remove('recording');
    };

    // Kiểm tra Safari-specific issues
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        console.log('Running on Safari');
        alert('Nếu nhận diện giọng nói không hoạt động, hãy tắt Siri (Cài đặt > Siri & Tìm kiếm) và đảm bảo quyền microphone đã được cấp.');
    }
}
