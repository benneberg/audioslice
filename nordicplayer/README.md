# Nordic Player

A beautiful, offline-first music player for your browser. Built as a single-file Progressive Web App (PWA) that works on iPhone, iPad, and desktop.

![Nordic Player](https://img.shields.io/badge/platform-iOS%20%7C%20iPadOS%20%7C%20Safari%20%7C%20Chrome-lightgrey)
![Size](https://img.shields.io/badge/size-~30KB-brightgreen)

## Features

- **IndexedDB Music Library** — Songs persist after closing Safari or killing the PWA. Your library survives reboots.
- **Waveform Timeline** — Professional bar waveform rendered from decoded audio data. Click or drag anywhere on the waveform to seek.
- **Installable PWA** — Add to your iPhone Home Screen for a full-screen, native-app experience.
- **Offline Operation** — Works without an internet connection once installed. All music is stored locally.
- **Media Session API** — Lock screen controls, Bluetooth headset buttons, and car audio integration.
- **Gesture Controls** — Swipe left/right for next/previous track. Swipe up to open the playlist.
- **Keyboard Shortcuts** — Space to play/pause, arrow keys to skip tracks.

## Quick Start

### iPhone / iPad (Recommended)

1. Save `nordic-player.html` to your device (Files app, iCloud Drive, or local storage).
2. Open the file in **Safari**.
3. Tap **Share** → **Add to Home Screen**.
4. Launch Nordic Player from your Home Screen — it runs in full-screen standalone mode.
5. Tap **＋ Add songs** and pick audio files from your Files app.

> **Tip:** For best results, store your music files in the **Files app** (On My iPhone / iCloud Drive) so they're easy to access.

### Desktop (Safari, Chrome, Edge)

1. Open `nordic-player.html` in your browser.
2. Click **＋ Add songs** and select audio files from your computer.
3. Optional: Install the PWA via your browser's install prompt (Chrome/Edge) or Share menu (Safari).

## Supported Formats

The player relies on your browser's native audio support. Generally supported formats include:

| Format | iOS Safari | Chrome | Notes |
|--------|-----------|--------|-------|
| MP3 | ✅ | ✅ | Best compatibility |
| M4A / AAC | ✅ | ✅ | iTunes / Apple Music exports |
| WAV | ✅ | ✅ | Uncompressed, large files |
| OGG | ❌ | ✅ | Not supported on iOS |
| FLAC | ⚠️ | ✅ | iOS 15+ only |
| OPUS | ❌ | ✅ | Not supported on iOS |

## How It Works

### Storage
- Audio files are stored as `ArrayBuffer` data inside the browser's **IndexedDB**.
- Metadata (title, file type, size) is indexed for fast retrieval.
- Storage quota depends on your device — typically 1GB+ on modern iPhones.

### Waveform Generation
- When a track is first loaded, its audio buffer is decoded via the Web Audio API.
- Amplitude peaks are computed and cached in memory for instant redraws.
- The waveform renders at device pixel density for crisp visuals on Retina displays.

### Offline Caching
- A lightweight Service Worker caches the app shell, so Nordic Player opens instantly even without a network connection.
- Your music is already local — no streaming required.

## Controls

| Action | Touch | Keyboard |
|--------|-------|----------|
| Play / Pause | Tap ▶ / Ⅱ | `Space` |
| Next Track | Tap ▶▶ or swipe left | `→` |
| Previous Track | Tap ◀◀ or swipe right | `←` |
| Seek | Drag waveform | — |
| Open Playlist | Swipe up | — |
| Loop | Tap ↻ | — |
| Shuffle | Tap ⤨ | — |
| Delete Song | Tap × in playlist | — |

## Troubleshooting

### "0 songs added" after picking files
- Make sure you're tapping the **＋ Add songs** button directly — iOS requires a real user gesture to open the file picker.
- The file picker shows all file types. If a file isn't a supported audio format, it will be saved but may not play.

### Files are grayed out in the picker
- This version removes the `accept` attribute entirely so all files are selectable. If files still appear gray, they may be stored in an app that restricts access (e.g., some third-party cloud providers).
- Move files to **Files app → On My iPhone** for guaranteed access.

### Music disappears after a week (iOS)
- iOS may clear website data for unused PWAs after 7 days. To prevent this, open Nordic Player regularly.
- Adding it to your Home Screen and launching it from there helps iOS recognize it as an installed app.

### Waveform doesn't appear
- Waveform generation requires decoding the full audio file, which can take a moment for large files.
- Very large files (>50MB) or unusual codecs may fail to decode — the player will still work, just without the visual waveform.

### Can't add to Home Screen
- Make sure you're using **Safari** on iOS. Third-party browsers (Chrome for iOS, etc.) cannot add PWAs to the Home Screen.
- The file must be served over `https://` or opened as a local file — some iOS versions block PWA installation for raw `file://` URLs. Use a simple local server if needed:
  ```bash
  python3 -m http.server 8000
  ```

## Privacy

Nordic Player is completely local. No data leaves your device:
- No analytics
- No cloud uploads
- No account required
- No network requests after initial load

## Technical Details

- **Single file:** Everything (HTML, CSS, JS, manifest, service worker) is embedded in one `.html` file.
- **No build step:** No npm, no bundler, no dependencies.
- **Size:** ~30KB of code + your music library.
- **Browser APIs used:** IndexedDB, Web Audio API, Canvas 2D, Service Worker, Media Session API, File API.

## License

Use freely. Modify as you like. No attribution required.
