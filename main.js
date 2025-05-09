// main.js

// Remove the ES module import, use FFmpeg from the global variable
const { createFFmpeg, fetchFile } = FFmpeg;

// Initialize FFmpeg
const ffmpeg = createFFmpeg({ 
    log: true,
    wasmOptions: { threads: false  // Disable threads for compatibility
    },
});
let ffmpegReady = false;

async function loadFFmpeg() {
    if (!ffmpegReady) {
        const loadingStatus = document.getElementById('loadingStatus');
        loadingStatus.classList.remove('hidden');
        loadingStatus.textContent = 'Loading FFmpeg...';
        await ffmpeg.load();
        ffmpegReady = true;
        loadingStatus.classList.add('hidden');
    }
}

// UI Elements
const audioFileInput = document.getElementById('audioFile');
const fileNameDisplay = document.getElementById('fileName');
const editorSection = document.getElementById('editorSection');
const importSection = document.getElementById('importSection');
const exportSection = document.getElementById('exportSection');
const waveformCanvas = document.getElementById('waveformCanvas');
const playPauseButton = document.getElementById('playPauseButton');

// Trim, stretch, and export logic
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const applyTrimButton = document.getElementById('applyTrimButton');
const stretchFactorInput = document.getElementById('stretchFactor');
const stretchValue = document.getElementById('stretchValue');
const exportButton = document.getElementById('exportButton');
const outputFileNameInput = document.getElementById('outputFileName');
const outputFormatSelect = document.getElementById('outputFormat');

// Placeholder for audio buffer and file
let audioBuffer = null;
let audioFile = null;

// Audio context and playback variables
let audioContext = null;
let sourceNode = null;
let isPlaying = false;
let startTime = 0;
let endTime = 0;

// Draw waveform on canvas
function drawWaveform(buffer) {
    const canvas = waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, amp);
    for (let i = 0; i < width; i++) {
        let min = 1.0, max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.lineTo(i, (1 + min) * amp);
    }
    ctx.lineTo(width, amp);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Update start/end time inputs
function updateTimeInputs() {
    startTimeInput.value = startTime.toFixed(2);
    endTimeInput.value = endTime.toFixed(2);
    startTimeInput.max = endTime;
    endTimeInput.min = startTime;
    startTimeInput.min = 0;
    endTimeInput.max = audioBuffer ? audioBuffer.duration : 0;
}

// On waveform load
function onWaveformReady() {
    startTime = 0;
    endTime = audioBuffer.duration;
    updateTimeInputs();
    stretchFactorInput.value = 1;
    stretchValue.textContent = '1.0x';
}

// Decode and render waveform after file import
async function decodeAndRender(file) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    drawWaveform(audioBuffer);
    onWaveformReady();
    playPauseButton.disabled = false;
}

// File import handler
audioFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileNameDisplay.textContent = file.name;
    audioFile = file;
    await loadFFmpeg();
    await decodeAndRender(file);
    editorSection.classList.remove('hidden');
    importSection.classList.remove('active');
    editorSection.classList.add('active');
});

// Audio playback logic
playPauseButton.addEventListener('click', () => {
    if (!audioBuffer) return;
    if (isPlaying) {
        sourceNode.stop();
        isPlaying = false;
        playPauseButton.textContent = 'Play';
    } else {
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);
        sourceNode.start(0, startTime, endTime - startTime);
        isPlaying = true;
        playPauseButton.textContent = 'Pause';
        sourceNode.onended = () => {
            isPlaying = false;
            playPauseButton.textContent = 'Play';
        };
    }
});

// Update trim from input
startTimeInput.addEventListener('input', () => {
    startTime = Math.max(0, Math.min(parseFloat(startTimeInput.value), endTime));
});
endTimeInput.addEventListener('input', () => {
    endTime = Math.max(startTime, Math.min(parseFloat(endTimeInput.value), audioBuffer.duration));
});

// Apply trim button (just updates playback region)
applyTrimButton.addEventListener('click', () => {
    updateTimeInputs();
});

// Stretch factor
stretchFactorInput.addEventListener('input', () => {
    stretchValue.textContent = parseFloat(stretchFactorInput.value).toFixed(2) + 'x';
});

import { exportWAV, exportMP3 } from './exporter.js'; // Adjust path as needed

exportButton.addEventListener('click', async () => {
    if (!processedAudioBuffer) {
        alert("No audio to export.");
        return;
    }

    const format = outputFormatSelect.value;
    const fileName = (outputFileNameInput.value || "edited_audio") + "." + format;

    exportButton.disabled = true;
    exportButton.textContent = 'Exporting...';

    try {
        if (format === 'wav') {
            exportWAV(processedAudioBuffer, fileName);
        } else if (format === 'mp3') {
            exportMP3(processedAudioBuffer, fileName);
        } else {
            alert(`Unsupported format: ${format}`);
        }
    } catch (err) {
        console.error('Export error:', err);
        alert('An error occurred while exporting the audio.');
    }

    exportButton.disabled = false;
    exportButton.textContent = 'Export & Download';
});