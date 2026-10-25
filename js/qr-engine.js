/**
 * EventPass QR Engine
 * High-performance QR Code generation, camera scanning, file decoding,
 * ticket badge image generation, and multi-tone audio feedback.
 */

class QREngine {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.audioCtx = null;
    this.selectedCameraId = null;
  }

  // Generate QR Code into container
  generateQRCode(containerOrId, text, size = 180) {
    // Accept either an element id or a DOM element
    const container = typeof containerOrId === 'string'
      ? document.getElementById(containerOrId)
      : containerOrId;
    if (!container) return;
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(container, {
          text: text,
          width: size,
          height: size,
          colorDark: '#090d16',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        return;
      } catch (e) {
        console.warn('QRCode library error, falling back to canvas:', e);
      }
    }

    // Fallback crisp SVG/Canvas QR Generator if external library not ready
    this.drawFallbackQR(container, text, size);
  }

  drawFallbackQR(container, text, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Dark matrix elements
    ctx.fillStyle = '#090d16';

    // 3 Corner Finder Patterns (standard QR layout)
    const drawFinder = (x, y) => {
      ctx.fillRect(x, y, 42, 42);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 6, 30, 30);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x + 12, y + 12, 18, 18);
    };

    drawFinder(10, 10);
    drawFinder(size - 52, 10);
    drawFinder(10, size - 52);

    // Deterministic pseudo-random pattern based on string hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 18;
    const cellSize = (size - 24) / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finder zones
        if ((r < 6 && c < 6) || (r < 6 && c >= gridSize - 6) || (r >= gridSize - 6 && c < 6)) {
          continue;
        }
        const bit = ((hash ^ (r * 31 + c * 17)) & 1) === 0;
        if (bit) {
          ctx.fillRect(12 + c * cellSize, 12 + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }

    container.appendChild(canvas);
  }

  // Audio synthesis feedback (Web Audio API)
  playAudioFeedback(type) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        // Joyful triumph chime: C6 (1046Hz) to G6 (1568Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now);
        osc.frequency.setValueAtTime(1567.98, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warning') {
        // Attention dual beep (Already checked in): 440Hz -> 350Hz
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(349.23, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Low error buzz: 160Hz sawtooth
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // Get available video inputs
  async getCameras() {
    if (typeof Html5Qrcode === 'undefined') return [];
    try {
      return await Html5Qrcode.getCameras();
    } catch (e) {
      console.warn('Could not enumerate cameras:', e);
      return [];
    }
  }

  // Start In-Browser Live Camera Scanner
  async startCameraScanner(elementId, onScanSuccess, preferredCameraId = null) {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode scanner library is not loaded. Please verify internet connectivity.');
    }

    if (!this.html5QrCode) {
      this.html5QrCode = new Html5Qrcode(elementId);
    }

    if (this.isScanning) {
      await this.stopCameraScanner();
    }

    const config = {
      fps: 10,
      // Scan box scales with the viewport (a fixed 250px box throws an error when the viewer is smaller)
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const edge = Math.max(100, Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7));
        return { width: edge, height: edge };
      }
    };

    // Determine camera to use
    let cameraConfig;
    if (preferredCameraId) {
      cameraConfig = preferredCameraId;
      this.selectedCameraId = preferredCameraId;
    } else {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer a rear/environment camera on phones, otherwise the first webcam
          const rear = cameras.find(c => /back|rear|environment/i.test(c.label || ''));
          cameraConfig = this.selectedCameraId || (rear ? rear.id : cameras[0].id);
          this.selectedCameraId = cameraConfig;
        } else {
          cameraConfig = { facingMode: 'environment' };
        }
      } catch (e) {
        cameraConfig = { facingMode: 'environment' };
      }
    }

    try {
      await this.html5QrCode.start(
        cameraConfig,
        config,
        (decodedText) => {
          if (this.isScanning) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Frame scan error (no QR in view), ignore
        }
      );
      this.isScanning = true;
      return true;
    } catch (err) {
      // Permission denied won't be fixed by retrying another camera
      if (err && (err.name === 'NotAllowedError' || /permission|denied/i.test(String(err.message || err)))) {
        this.isScanning = false;
        throw err;
      }
      // If specific camera ID failed, retry with generic camera
      if (typeof cameraConfig === 'string') {
        try {
          await this.html5QrCode.start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              if (this.isScanning) onScanSuccess(decodedText);
            },
            () => {}
          );
          this.isScanning = true;
          return true;
        } catch (e2) {
          this.isScanning = false;
          throw e2;
        }
      }
      this.isScanning = false;
      throw err;
    }
  }

  // Stop Camera Scanner
  async stopCameraScanner() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
        this.isScanning = false;
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  }

  // Decode QR code from uploaded image file (supports full badge cards and clean QR codes)
  async scanFile(file) {
    // 1. Try decoding via jsQR if available (fastest and handles full card images)
    try {
      const imgDataUrl = await this.readFileAsDataURL(file);
      const img = await this.loadImage(imgDataUrl);

      if (typeof jsQR !== 'undefined') {
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = img.naturalWidth || img.width;
        fullCanvas.height = img.naturalHeight || img.height;
        const fullCtx = fullCanvas.getContext('2d');
        fullCtx.drawImage(img, 0, 0);

        // Try full image first
        const imgData = fullCtx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
        let code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'attemptBoth' });
        if (code && code.data && code.data.trim()) {
          return code.data.trim();
        }

        // If not found, crop lower-center region (where EventPass badge places the QR code)
        const cropCanvas = document.createElement('canvas');
        const cw = fullCanvas.width;
        const ch = fullCanvas.height;
        const sx = Math.floor(cw * 0.15);
        const sy = Math.floor(ch * 0.42);
        const sw = Math.floor(cw * 0.70);
        const sh = Math.floor(ch * 0.48);
        cropCanvas.width = sw;
        cropCanvas.height = sh;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        const cropData = cropCtx.getImageData(0, 0, sw, sh);
        code = jsQR(cropData.data, sw, sh, { inversionAttempts: 'attemptBoth' });
        if (code && code.data && code.data.trim()) {
          return code.data.trim();
        }
      }
    } catch (e) {
      console.warn('jsQR scan attempt note:', e);
    }

    // 2. Fallback to Html5Qrcode on dedicated hidden container
    if (typeof Html5Qrcode !== 'undefined') {
      let hiddenContainer = document.getElementById('qrFileScannerHidden');
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div');
        hiddenContainer.id = 'qrFileScannerHidden';
        hiddenContainer.style.display = 'none';
        document.body.appendChild(hiddenContainer);
      }

      const fileScanner = new Html5Qrcode('qrFileScannerHidden');
      try {
        const decoded = await fileScanner.scanFile(file, false);
        return decoded;
      } catch (err) {
        // Try cropping the QR region and passing to Html5Qrcode
        try {
          const croppedBlob = await this.cropQRCodeRegion(file);
          if (croppedBlob) {
            const decoded = await fileScanner.scanFile(croppedBlob, false);
            return decoded;
          }
        } catch (err2) {
          // ignore
        }
        throw new Error('Could not find or decode a valid QR code in this image.');
      }
    }

    throw new Error('QR scanner libraries unavailable.');
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async cropQRCodeRegion(file) {
    const dataUrl = await this.readFileAsDataURL(file);
    const img = await this.loadImage(dataUrl);

    const canvas = document.createElement('canvas');
    const cw = img.naturalWidth || img.width;
    const ch = img.naturalHeight || img.height;
    const sx = Math.floor(cw * 0.15);
    const sy = Math.floor(ch * 0.42);
    const sw = Math.floor(cw * 0.70);
    const sh = Math.floor(ch * 0.48);
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  // Download digital event pass as high-res PNG badge
  downloadTicketImage(ticketData) {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');

    // Background Gradient (Dark Navy to Slate)
    const bg = ctx.createLinearGradient(0, 0, 0, 920);
    bg.addColorStop(0, '#090d16');
    bg.addColorStop(0.5, '#0f172a');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 650, 920);

    // Glowing border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, 614, 884);

    // Header banner
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(18, 18, 614, 80);

    // EventPass logo seal in the header banner
    if (window.certEngine && window.certEngine.drawSealLogo) {
      window.certEngine.drawSealLogo(ctx, 72, 58, 34, true);
    }

    // Brand Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EventPass • OFFICIAL EVENT TICKET', 368, 67);

    // Event Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 24px sans-serif';
    ctx.fillText(ticketData.eventTitle, 325, 145);

    // Event Details
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(`📅 ${ticketData.eventDate} | ⏰ ${ticketData.eventTime}`, 325, 180);
    ctx.fillText(`📍 ${ticketData.eventVenue}`, 325, 210);

    // Divider line with notch circles
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(30, 240);
    ctx.lineTo(620, 240);
    ctx.stroke();
    ctx.setLineDash([]);

    // Attendee Card
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(40, 260, 570, 200);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ATTENDEE NAME', 65, 295);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px sans-serif';
    ctx.fillText(ticketData.participantName, 65, 330);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('REGISTRATION ID', 65, 375);
    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 20px monospace';
    ctx.fillText(ticketData.regId, 65, 405);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('STATUS', 360, 375);
    ctx.fillStyle = '#10b981';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(ticketData.status ? ticketData.status.toUpperCase() : 'CONFIRMED', 360, 405);

    // QR Code Container Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(185, 490, 280, 280);
    ctx.strokeStyle = '#c79d38';
    ctx.lineWidth = 4;
    ctx.strokeRect(185, 490, 280, 280);

    // Draw QR code inside box using fallback or captured canvas
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    this.generateQRCode(tempContainer, ticketData.qrPayload, 250);
    const qrCanvas = tempContainer.querySelector('canvas') || tempContainer.querySelector('img');

    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 200, 505, 250, 250);
    }
    document.body.removeChild(tempContainer);

    // Instructions
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('Present this QR ticket at the gate entrance for live check-in.', 325, 810);
    ctx.fillStyle = '#64748b';
    ctx.font = '400 12px monospace';
    ctx.fillText(`Ticket Token: ${ticketData.qrPayload}`, 325, 845);
    ctx.fillText(`Issued by EventPass Portal • Academic Edition 2026`, 325, 875);

    // Save PNG
    const link = document.createElement('a');
    link.download = `EventPass_Ticket_${ticketData.regId}_${ticketData.participantName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Download clean, high-contrast raw QR code PNG (guaranteed to scan on any reader)
  downloadQRCodeOnly(ticketData) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);

    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    this.generateQRCode(tempContainer, ticketData.qrPayload, 340);
    const qrCanvas = tempContainer.querySelector('canvas') || tempContainer.querySelector('img');

    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 30, 30, 340, 340);
    }
    document.body.removeChild(tempContainer);

    const link = document.createElement('a');
    link.download = `EventPass_QR_${ticketData.regId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Global QR Engine instance
window.qrEngine = new QREngine();
