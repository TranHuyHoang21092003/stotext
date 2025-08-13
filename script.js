// Configuration
const CONFIG = {
    API_KEY: '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', // Thay thế bằng API key hợp lệ
    WHISPER_API: 'https://api.openai.com/v1/audio/transcriptions',
    TTS_API: 'https://api.openai.com/v1/audio/speech'
};

// Global variables
let mediaRecorder;
let recordedChunks = [];
let selectedVoice = 'alloy';
let generatedAudioBlob = null;

// DOM elements
const elements = {
    // Speech to Text elements
    recordBtn: document.getElementById('recordBtn'),
    stopBtn: document.getElementById('stopBtn'),
    recordingIndicator: document.getElementById('recordingIndicator'),
    audioControls: document.getElementById('audioControls'),
    audioPlayer: document.getElementById('audioPlayer'),
    transcribeBtn: document.getElementById('transcribeBtn'),
    audioFile: document.getElementById('audioFile'),
    transcriptOutput: document.getElementById('transcriptOutput'),
    sttStatus: document.getElementById('sttStatus'),
    language: document.getElementById('language'),
    
    // Text to Speech elements
    textInput: document.getElementById('textInput'),
    generateSpeechBtn: document.getElementById('generateSpeechBtn'),
    generatedAudioControls: document.getElementById('generatedAudioControls'),
    generatedAudioPlayer: document.getElementById('generatedAudioPlayer'),
    downloadAudioBtn: document.getElementById('downloadAudioBtn'),
    ttsStatus: document.getElementById('ttsStatus'),
    speed: document.getElementById('speed'),
    voiceOptions: document.querySelectorAll('.voice-option')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkBrowserCompatibility();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Speech to Text event listeners
    elements.recordBtn.addEventListener('click', startRecording);
    elements.stopBtn.addEventListener('click', stopRecording);
    elements.transcribeBtn.addEventListener('click', transcribeAudio);
    elements.audioFile.addEventListener('change', handleFileUpload);
    
    // Text to Speech event listeners
    elements.generateSpeechBtn.addEventListener('click', generateSpeech);
    elements.downloadAudioBtn.addEventListener('click', downloadAudio);
    
    // Voice selection
    elements.voiceOptions.forEach(option => {
        option.addEventListener('click', () => selectVoice(option));
    });
    
    // Auto-resize textareas
    elements.textInput.addEventListener('input', () => autoResize(elements.textInput));
    elements.transcriptOutput.addEventListener('input', () => autoResize(elements.transcriptOutput));
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showStatus(elements.sttStatus, 'Trình duyệt không hỗ trợ ghi âm. Vui lòng sử dụng trình duyệt hiện đại.', 'error');
        elements.recordBtn.disabled = true;
    }
}

/**
 * Show status message
 * @param {HTMLElement} element - Status element
 * @param {string} message - Message to display
 * @param {string} type - Status type (success, error, loading)
 */
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status show ${type}`;
}

/**
 * Hide status message
 * @param {HTMLElement} element - Status element
 */
function hideStatus(element) {
    element.classList.remove('show');
}

/**
 * Auto-resize textarea based on content
 * @param {HTMLTextAreaElement} textarea - Textarea element
 */
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

/**
 * Select voice option
 * @param {HTMLElement} option - Voice option element
 */
function selectVoice(option) {
    elements.voiceOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedVoice = option.dataset.voice;
}

// ================== SPEECH TO TEXT FUNCTIONS ==================

/**
 * Start audio recording
 */
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            elements.audioPlayer.src = url;
            elements.audioControls.classList.add('show');
            
            // Stop all tracks to free up the microphone
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        
        // Update UI
        elements.recordBtn.disabled = true;
        elements.stopBtn.disabled = false;
        elements.recordingIndicator.classList.add('show');
        
        showStatus(elements.sttStatus, 'Đang ghi âm...', 'loading');
        
    } catch (error) {
        console.error('Error starting recording:', error);
        showStatus(elements.sttStatus, 'Lỗi: Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.', 'error');
    }
}

/**
 * Stop audio recording
 */
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        // Update UI
        elements.recordBtn.disabled = false;
        elements.stopBtn.disabled = true;
        elements.recordingIndicator.classList.remove('show');
        
        showStatus(elements.sttStatus, 'Ghi âm hoàn tất! Nhấn "Chuyển thành văn bản" để tiếp tục.', 'success');
    }
}

/**
 * Handle file upload
 * @param {Event} event - File input change event
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        elements.audioPlayer.src = url;
        elements.audioControls.classList.add('show');
        showStatus(elements.sttStatus, 'File âm thanh đã tải lên! Nhấn "Chuyển thành văn bản" để tiếp tục.', 'success');
    }
}

/**
 * Transcribe audio to text using OpenAI Whisper API
 */
async function transcribeAudio() {
    const audioSrc = elements.audioPlayer.src;
    if (!audioSrc) {
        showStatus(elements.sttStatus, 'Vui lòng ghi âm hoặc tải lên file âm thanh trước.', 'error');
        return;
    }

    try {
        showStatus(elements.sttStatus, 'Đang chuyển đổi giọng nói thành văn bản...', 'loading');
        
        // Get audio blob
        let audioBlob;
        if (recordedChunks.length > 0) {
            audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
        } else if (elements.audioFile.files[0]) {
            audioBlob = elements.audioFile.files[0];
        } else {
            throw new Error('Không tìm thấy dữ liệu âm thanh');
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', elements.language.value);

        // Call OpenAI Whisper API
        const response = await fetch(CONFIG.WHISPER_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Lỗi API');
        }

        const result = await response.json();
        elements.transcriptOutput.value = result.text;
        autoResize(elements.transcriptOutput);
        
        showStatus(elements.sttStatus, 'Chuyển đổi thành công!', 'success');
        
        // Auto hide status after 3 seconds
        setTimeout(() => hideStatus(elements.sttStatus), 3000);
        
    } catch (error) {
        console.error('Transcription error:', error);
        showStatus(elements.sttStatus, `Lỗi: ${error.message}`, 'error');
    }
}

// ================== TEXT TO SPEECH FUNCTIONS ==================

/**
 * Generate speech from text using OpenAI TTS API
 */
async function generateSpeech() {
    const text = elements.textInput.value.trim();
    if (!text) {
        showStatus(elements.ttsStatus, 'Vui lòng nhập văn bản cần chuyển thành giọng nói.', 'error');
        return;
    }

    try {
        showStatus(elements.ttsStatus, 'Đang tạo giọng nói...', 'loading');

        // Call OpenAI TTS API
        const response = await fetch(CONFIG.TTS_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: selectedVoice,
                speed: parseFloat(elements.speed.value)
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Lỗi API');
        }

        // Handle response
        generatedAudioBlob = await response.blob();
        const url = URL.createObjectURL(generatedAudioBlob);
        elements.generatedAudioPlayer.src = url;
        elements.generatedAudioControls.classList.add('show');
        
        showStatus(elements.ttsStatus, 'Tạo giọng nói thành công!', 'success');
        
        // Auto hide status after 3 seconds
        setTimeout(() => hideStatus(elements.ttsStatus), 3000);
        
    } catch (error) {
        console.error('TTS error:', error);
        showStatus(elements.ttsStatus, `Lỗi: ${error.message}`, 'error');
    }
}

/**
 * Download generated audio file
 */
function downloadAudio() {
    if (generatedAudioBlob) {
        const url = URL.createObjectURL(generatedAudioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speech_${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
