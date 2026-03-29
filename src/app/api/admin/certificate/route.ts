import { NextResponse } from "next/server";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json({ success: false, error: "Test ID required" }, { status: 400 });
    }

    const completedTestsRef = adminRealtimeDb.ref(`completedTests/${testId}`);
    const snapshot = await completedTestsRef.once("value");
    const test = snapshot.val();

    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    let userIIN = "N/A";
    if (test.userId) {
      try {
        const userDoc = await adminDb.collection("users").doc(test.userId).get();
        if (userDoc.exists) {
          userIIN = userDoc.data()?.iin || "N/A";
        }
      } catch {
        userIIN = "N/A";
      }
    }

    const completedDate = new Date(test.completedAt);
    const formattedDate = completedDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const passed = test.percentage >= 70;
    const status = passed ? "СДАН" : "НЕ СДАН";

    const documentNumber = `ПТ-${testId.slice(0, 6).toUpperCase()}/${completedDate.getFullYear()}`;
    
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подтверждение № ${documentNumber}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Montserrat', sans-serif;
      background: #1a1a2e;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .certificate {
      width: 297mm;
      height: 210mm;
      background: #fffef8;
      position: relative;
      box-shadow: 0 25px 80px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    
    .border-outer {
      position: absolute;
      top: 8mm;
      left: 8mm;
      right: 8mm;
      bottom: 8mm;
      border: 2px solid #1e3a5f;
    }
    
    .border-inner {
      position: absolute;
      top: 12mm;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      border: 1px solid #c9a227;
    }
    
    .corner {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 3px solid #c9a227;
    }
    .corner-tl { top: 14mm; left: 14mm; border-right: none; border-bottom: none; }
    .corner-tr { top: 14mm; right: 14mm; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 14mm; left: 14mm; border-right: none; border-top: none; }
    .corner-br { bottom: 14mm; right: 14mm; border-left: none; border-top: none; }
    
    .content-wrapper {
      position: absolute;
      top: 20mm;
      left: 20mm;
      right: 20mm;
      bottom: 20mm;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      text-align: center;
      padding-bottom: 8mm;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .org-name {
      font-size: 11px;
      font-weight: 600;
      color: #1e3a5f;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 5mm;
    }
    
    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 52px;
      font-weight: 700;
      color: #1e3a5f;
      letter-spacing: 8px;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }
    
    .cert-number {
      font-size: 12px;
      color: #666;
      letter-spacing: 2px;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 8mm 15mm;
    }
    
    .confirm-text {
      font-size: 14px;
      color: #444;
      margin-bottom: 6mm;
      font-weight: 500;
    }
    
    .recipient-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 38px;
      font-weight: 700;
      color: #1e3a5f;
      padding: 4mm 0;
      border-bottom: 2px solid #c9a227;
      margin-bottom: 3mm;
      min-width: 200px;
    }
    
    .iin-text {
      font-size: 13px;
      color: #666;
      margin-bottom: 8mm;
      font-weight: 500;
    }
    
    .description {
      font-size: 14px;
      color: #444;
      line-height: 1.6;
      max-width: 500px;
      margin-bottom: 8mm;
    }
    
    .result-section {
      display: flex;
      align-items: center;
      gap: 20mm;
      padding: 6mm 12mm;
      background: ${passed ? 'linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'};
      border: 1px solid ${passed ? '#a5d6a7' : '#fca5a5'};
      border-radius: 4px;
    }
    
    .result-item {
      text-align: center;
    }
    
    .result-label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2mm;
      font-weight: 600;
    }
    
    .result-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 700;
      color: ${passed ? '#2e7d32' : '#c62828'};
    }
    
    .result-status {
      font-size: 14px;
      font-weight: 700;
      color: white;
      background: ${passed ? '#2e7d32' : '#c62828'};
      padding: 3mm 8mm;
      border-radius: 3px;
      letter-spacing: 2px;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 8mm;
      border-top: 1px solid #e5e5e5;
    }
    
    .footer-block {
      text-align: center;
      min-width: 60mm;
    }
    
    .footer-label {
      font-size: 9px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2mm;
    }
    
    .footer-value {
      font-size: 13px;
      color: #333;
      font-weight: 600;
    }
    
    .signature-line {
      width: 50mm;
      border-bottom: 1px solid #333;
      margin: 0 auto 2mm;
      height: 8mm;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Cormorant Garamond', serif;
      font-size: 180px;
      font-weight: 700;
      color: rgba(30, 58, 95, 0.03);
      pointer-events: none;
      white-space: nowrap;
      letter-spacing: 20px;
    }
    
    .download-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #c9a227 0%, #a68523 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(201, 162, 39, 0.4);
      transition: all 0.2s;
      z-index: 1000;
      font-family: 'Montserrat', sans-serif;
    }
    
    .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(201, 162, 39, 0.5);
    }
    
    .download-btn svg { width: 20px; height: 20px; }
    .download-btn.loading { opacity: 0.7; pointer-events: none; }
    
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; }
      .download-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <button class="download-btn" onclick="downloadPDF()" id="downloadBtn">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Скачать PDF
  </button>

  <div class="certificate" id="certificate">
    <div class="watermark">CERTIFICATE</div>
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    
    <div class="content-wrapper">
      <div class="header">
        <p class="org-name">Система Квалификационного Тестирования</p>
        <h1 class="title">Подтверждение</h1>
        <p class="cert-number">о прохождении тестирования № ${documentNumber}</p>
      </div>
      
      <div class="main-content">
        <p class="confirm-text">Настоящий документ подтверждает, что</p>
        <h2 class="recipient-name">${test.userName || "Имя не указано"}</h2>
        <p class="iin-text">Идентификационный номер (ИИН): ${userIIN}</p>
        <p class="description">
          прошёл(а) процедуру квалификационного тестирования<br>
          и показал(а) следующие результаты:
        </p>
        
        <div class="result-section">
          <div class="result-item">
            <p class="result-label">Правильных ответов</p>
            <p class="result-value">${test.score} / ${test.totalQuestions}</p>
          </div>
          <div class="result-item">
            <p class="result-label">Процент выполнения</p>
            <p class="result-value">${test.percentage}%</p>
          </div>
          <div class="result-item">
            <p class="result-label">Статус</p>
            <p class="result-status">${status}</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-block">
          <p class="footer-label">Дата выдачи</p>
          <p class="footer-value">${formattedDate}</p>
        </div>
        <div class="footer-block">
          <div class="signature-line"></div>
          <p class="footer-label">Подпись ответственного лица</p>
        </div>
        <div class="footer-block">
          <p class="footer-label">Регистрационный номер</p>
          <p class="footer-value">${documentNumber}</p>
        </div>
      </div>
    </div>
    
    </div>

  <script>
    function downloadPDF() {
      const btn = document.getElementById('downloadBtn');
      btn.classList.add('loading');
      btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"></path></svg> Генерация...';
      
      const element = document.getElementById('certificate');
      const fileName = 'Подтверждение_${documentNumber}_${(test.userName || "user").replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}.pdf';
      
      const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, backgroundColor: '#fffef8' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: 'avoid-all' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        btn.classList.remove('loading');
        btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Скачано!';
        setTimeout(() => {
          btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Скачать PDF';
        }, 2000);
      });
    }
  </script>
</body>
</html>
`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ success: false, error: "Failed to generate certificate" }, { status: 500 });
  }
}
