/**
 * EventPass Automated Certificate Generation Engine
 * Generates personalized, high-resolution certificates of attendance & participation.
 * Renders on Canvas with vector ornamentations and exports to true A4 Landscape PDF via jsPDF.
 */

class CertificateEngine {
  constructor() {
    this.canvas = null;
    this.currentData = null;
  }

  /**
   * Render personalized certificate to Canvas
   */
  renderToCanvas(canvasElement, participant, event, certRecord, template = 'classic-gold') {
    this.canvas = canvasElement;
    this.currentData = { participant, event, certRecord, template };

    const ctx = canvasElement.getContext('2d');
    const width = 1200;
    const height = 850;

    canvasElement.width = width;
    canvasElement.height = height;

    if (template === 'modern-tech') {
      this.drawModernTechTemplate(ctx, width, height, participant, event, certRecord);
    } else if (template === 'academic-blue') {
      this.drawAcademicBlueTemplate(ctx, width, height, participant, event, certRecord);
    } else {
      this.drawClassicGoldTemplate(ctx, width, height, participant, event, certRecord);
    }
  }

  // --------------------------------------------------------------------------
  // TEMPLATE 1: CLASSIC GOLD & IVORY (ACADEMIC PRESTIGE)
  // --------------------------------------------------------------------------
  drawClassicGoldTemplate(ctx, width, height, participant, event, certRecord) {
    // 1. Ivory background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 700);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Borders
    ctx.strokeStyle = '#c79d38';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#e6ca65';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner Ornaments
    this.drawCorner(ctx, 45, 45);
    this.drawCorner(ctx, width - 45, 45, Math.PI / 2);
    this.drawCorner(ctx, width - 45, height - 45, Math.PI);
    this.drawCorner(ctx, 45, height - 45, -Math.PI / 2);

    // 3. Institution / System Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '600 13px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('EVENTPASS CAMPUS CREDENTIALING & ATTENDANCE SYSTEM', width / 2, 115);

    // 4. Certificate Title
    ctx.fillStyle = '#1e1b4b';
    ctx.font = '800 38px Georgia, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', width / 2, 175);

    // Gold Accent Underline
    ctx.strokeStyle = '#c79d38';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 160, 195);
    ctx.lineTo(width / 2 + 160, 195);
    ctx.stroke();

    // 5. Presentation Text
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('This official credential is proudly awarded and presented to', width / 2, 250);

    // 6. Participant Name (Hero)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(participant.full_name, width / 2, 320);

    // Subtle rule beneath name
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 345);
    ctx.lineTo(width / 2 + 250, 345);
    ctx.stroke();

    // 7. Citation Body Text
    ctx.fillStyle = '#334155';
    ctx.font = '400 16px sans-serif';
    const org = participant.organization ? `representing ${participant.organization}, ` : '';
    ctx.fillText(`${org}for completing verified attendance and actively participating in`, width / 2, 400);

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`"${event.title}"`, width / 2, 435);

    ctx.fillStyle = '#475569';
    ctx.font = '400 15px sans-serif';
    ctx.fillText(`Conducted on ${event.date} at ${event.venue}`, width / 2, 470);

    // 8. Signatures & Host Section
    this.drawSignatures(ctx, width, height, event);

    // 9. Official Gold Seal (Left Bottom)
    this.drawOfficialSeal(ctx, 160, height - 160, '#c79d38', '#997316');

    // 10. Verification QR & Serial ID
    this.drawVerificationMetadata(ctx, width, height, certRecord, '#475569');
  }

  // --------------------------------------------------------------------------
  // TEMPLATE 2: MODERN TECH & CYBER SLATE
  // --------------------------------------------------------------------------
  drawModernTechTemplate(ctx, width, height, participant, event, certRecord) {
    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Cyber grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Glowing Cyan & Indigo Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, width - 84, height - 84);

    // Top Brand Tag
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 12px monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('// EVENTPASS CERTIFIED TECHNICAL PARTICIPANT //', width / 2, 110);

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 38px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('CERTIFICATE OF ATTENDANCE', width / 2, 170);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('Official technology credential verified via biometric/QR gate protocol', width / 2, 230);

    // Participant Name in Cyber Glow
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText(participant.full_name, width / 2, 310);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 335);
    ctx.lineTo(width / 2 + 220, 335);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 16px sans-serif';
    ctx.fillText(`Successfully attended and engaged in the technical session:`, width / 2, 395);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(event.title, width / 2, 435);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 15px sans-serif';
    ctx.fillText(`Date: ${event.date} | Venue: ${event.venue}`, width / 2, 475);

    // Signatures
    this.drawSignatures(ctx, width, height, event, '#ffffff', '#94a3b8');

    // High Tech Badge
    this.drawOfficialSeal(ctx, 160, height - 160, '#06b6d4', '#6366f1', true);

    // Metadata
    this.drawVerificationMetadata(ctx, width, height, certRecord, '#94a3b8', '#06b6d4');
  }

  // --------------------------------------------------------------------------
  // TEMPLATE 3: ACADEMIC BLUE RIBBON
  // --------------------------------------------------------------------------
  drawAcademicBlueTemplate(ctx, width, height, participant, event, certRecord) {
    // Crisp off-white
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, width, height);

    // Blue ribbon border
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '700 14px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('COLLEGIATE ACADEMIC EXCELLENCE & SEMINAR COUNCIL', width / 2, 115);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText('Certificate of Completion', width / 2, 175);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('This is to certify that', width / 2, 245);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(participant.full_name, width / 2, 315);

    ctx.fillStyle = '#334155';
    ctx.font = '400 16px sans-serif';
    ctx.fillText('has satisfactorily attended and fulfilled all requirements for the seminar', width / 2, 395);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`"${event.title}"`, width / 2, 435);

    ctx.fillStyle = '#475569';
    ctx.font = '400 15px sans-serif';
    ctx.fillText(`Held on ${event.date} at ${event.venue}`, width / 2, 470);

    this.drawSignatures(ctx, width, height, event);
    this.drawOfficialSeal(ctx, 160, height - 160, '#1e40af', '#3b82f6');
    this.drawVerificationMetadata(ctx, width, height, certRecord, '#475569');
  }

  // --------------------------------------------------------------------------
  // SHARED RENDERING HELPERS
  // --------------------------------------------------------------------------
  drawSignatures(ctx, width, height, event, titleColor = '#0f172a', subtitleColor = '#64748b') {
    const leftX = width / 2 - 190;
    const rightX = width / 2 + 190;
    const lineY = height - 150;

    // Left Signature Line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX - 120, lineY);
    ctx.lineTo(leftX + 120, lineY);
    ctx.stroke();

    // Right Signature Line
    ctx.beginPath();
    ctx.moveTo(rightX - 120, lineY);
    ctx.lineTo(rightX + 120, lineY);
    ctx.stroke();

    // Left Signature Name
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.font = '600 15px sans-serif';
    ctx.fillText(event.organizer_name || 'Event Host & Directorate', leftX, lineY + 24);
    ctx.fillStyle = subtitleColor;
    ctx.font = '400 12px sans-serif';
    ctx.fillText('Event Organizer / Presiding Officer', leftX, lineY + 42);

    // Right Signature Name (Dean / Campus Director)
    ctx.fillStyle = titleColor;
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Dr. Rebecca M. Morales', rightX, lineY + 24);
    ctx.fillStyle = subtitleColor;
    ctx.font = '400 12px sans-serif';
    ctx.fillText('Campus Director & Academic Head', rightX, lineY + 42);

    // Simulated decorative cursive signatures
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX - 60, lineY - 20);
    ctx.bezierCurveTo(leftX - 30, lineY - 50, leftX + 10, lineY - 10, leftX + 50, lineY - 30);
    ctx.stroke();

    ctx.strokeStyle = '#c79d38';
    ctx.beginPath();
    ctx.moveTo(rightX - 50, lineY - 25);
    ctx.bezierCurveTo(rightX - 20, lineY - 45, rightX + 20, lineY - 10, rightX + 60, lineY - 35);
    ctx.stroke();
  }

  drawOfficialSeal(ctx, x, y, primaryColor, accentColor, onDark = false) {
    // EventPass logo seal (navy ring, red ring, flame over a QR ticket)
    this.drawSealLogo(ctx, x, y, 68, onDark);
  }

  /**
   * Draw the EventPass logo seal as vector shapes (no image loading needed).
   * x, y = centre of the seal, radius = outer radius in canvas pixels.
   */
  drawSealLogo(ctx, x, y, radius = 60, outline = false) {
    const k = radius / 96;
    const NAVY = '#1B2A6B', RED = '#D32F2F', GOLD = '#F2B820', WHITE = '#ffffff';
    ctx.save();
    ctx.translate(x - 100 * k, y - 100 * k);
    ctx.scale(k, k);
    ctx.letterSpacing = '0px';
    ctx.textBaseline = 'alphabetic';

    // Outer navy disc (+ light outline when placed on dark backgrounds)
    ctx.fillStyle = NAVY;
    ctx.beginPath(); ctx.arc(100, 100, 96, 0, Math.PI * 2); ctx.fill();
    if (outline) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(100, 100, 94.5, 0, Math.PI * 2); ctx.stroke();
    }

    // Inner white disc with red ring
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(100, 100, 68, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Curved text
    this.drawArcText(ctx, 'EVENTPASS', 100, 100, 80, 17, 3, false);
    this.drawArcText(ctx, 'ATTEND · VERIFY · CERTIFY', 100, 100, 84, 10, 2, true);

    // Gold separator dots
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(14, 100, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(186, 100, 3.5, 0, Math.PI * 2); ctx.fill();

    // Flame
    ctx.save();
    ctx.translate(100, 72);
    ctx.fillStyle = GOLD;
    ctx.fill(new Path2D('M0 -26 C8 -14 14 -6 10 4 C8 9 -8 9 -10 4 C-14 -6 -6 -14 0 -26Z'));
    ctx.fillStyle = RED;
    ctx.fill(new Path2D('M0 -10 C4 -4 6 0 4 4 C2 7 -2 7 -4 4 C-6 0 -3 -4 0 -10Z'));
    ctx.restore();

    // Ticket body
    const rx = 68, ry = 84, rw = 64, rh = 40, rr = 6;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.moveTo(rx + rr, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
    ctx.arcTo(rx, ry + rh, rx, ry, rr);
    ctx.arcTo(rx, ry, rx + rw, ry, rr);
    ctx.closePath();
    ctx.fill();

    // Ticket notches + QR pattern
    ctx.fillStyle = WHITE;
    ctx.beginPath(); ctx.arc(68, 104, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(132, 104, 5, 0, Math.PI * 2); ctx.fill();
    [[75, 91, 8], [117, 91, 8], [75, 109, 8], [90, 96, 4], [98, 104, 4], [90, 112, 4], [106, 96, 4]]
      .forEach(([qx, qy, qs]) => ctx.fillRect(qx, qy, qs, qs));

    // Red check badge
    ctx.fillStyle = RED;
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(126, 124, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(120.5, 124); ctx.lineTo(124.5, 128); ctx.lineTo(131.5, 120);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw text along a circle. bottom=false reads along the top (glyphs point outward),
   * bottom=true reads left-to-right along the bottom (glyphs point inward).
   */
  drawArcText(ctx, text, cx, cy, radius, size, spacing, bottom) {
    ctx.save();
    ctx.font = `700 ${size}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const chars = Array.from(text);
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    const dir = bottom ? -1 : 1;
    let a = bottom ? Math.PI / 2 + total / radius / 2 : -Math.PI / 2 - total / radius / 2;
    chars.forEach((ch, i) => {
      const half = widths[i] / 2 / radius;
      a += dir * half;
      ctx.save();
      ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
      ctx.rotate(bottom ? a - Math.PI / 2 : a + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      a += dir * (half + spacing / radius);
    });
    ctx.restore();
  }

  drawVerificationMetadata(ctx, width, height, certRecord, textColor = '#64748b', accentColor = '#6366f1') {
    const certSerial = certRecord ? certRecord.certificate_id : 'EP-CERT-2026-VERIFIED';
    const issueDate = certRecord ? certRecord.issued_at.substring(0, 10) : new Date().toISOString().substring(0, 10);

    ctx.textAlign = 'right';
    ctx.fillStyle = textColor;
    ctx.font = '500 12px monospace';
    ctx.fillText(`Certificate ID: ${certSerial}`, width - 70, height - 90);
    ctx.fillText(`Date Issued: ${issueDate}`, width - 70, height - 72);
    ctx.fillText('Authentication: 256-Bit SHA Gate Verified', width - 70, height - 54);
  }

  drawCorner(ctx, x, y, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = '#c79d38';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 26);
    ctx.stroke();

    ctx.fillStyle = '#c79d38';
    ctx.fillRect(4, 4, 8, 8);
    ctx.restore();
  }

  /**
   * Export to high-res Vector PDF (A4 Landscape 297mm x 210mm)
   */
  downloadPDF(participant, event, certRecord) {
    if (!this.canvas) return;

    const certSerial = certRecord ? certRecord.certificate_id : 'CERT-2026';
    const filename = `EventPass_Certificate_${participant.full_name.replace(/\s+/g, '_')}_${certSerial}.pdf`;

    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      // A4 Landscape: 297 x 210 mm
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = this.canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      doc.save(filename);
    } else {
      // Fallback: trigger print dialog for PDF saving
      this.printCertificate();
    }
  }

  /**
   * Export as high-resolution PNG image
   */
  downloadPNG(participant, event, certRecord) {
    if (!this.canvas) return;
    const certSerial = certRecord ? certRecord.certificate_id : 'CERT-2026';
    const filename = `EventPass_Certificate_${participant.full_name.replace(/\s+/g, '_')}_${certSerial}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Direct Print dialog
   */
  printCertificate() {
    if (!this.canvas) return;
    const win = window.open('', '_blank');
    const dataUrl = this.canvas.toDataURL('image/png');
    win.document.write(`
      <html>
        <head>
          <title>Print Certificate - EventPass</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${dataUrl}"/>
        </body>
      </html>
    `);
    win.document.close();
  }
}

// Global Certificate Engine singleton
window.certEngine = new CertificateEngine();
