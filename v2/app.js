// ==========================================
// AI HAND TRACKING GAME: PHRA APHAI MANI (V2 FULL PRODUCTION WITH BACKGROUND)
// Developed by Senior Computer Vision Engineer
// ==========================================

// --- 1. คลังคำถามวรรณคดีไทย (10 ข้อตามป้ายโฆษณา) ---
const quizData = [
    { q: "นางผีเสื้อสมุทรลักตัวพระอภัยมณีมาจากถ้ำ?", a: "ข" }, 
    { q: "สินสมุทรเป็นลูกของนางผีเสื้อสมุทรกับพระอภัยมณี?", a: "ก" }, 
    { q: "พระอภัยมณีหนีนางผีเสื้อสมุทรไปที่เกาะแก้วพิสดาร?", a: "ก" }, 
    { q: "ผู้ที่พาพระอภัยมณีหนีในช่วงแรกคือ ม้านิลมังกร?", a: "ข" }, 
    { q: "โยคีแห่งเกาะแก้วพิสดารใช้ไม้เท้าเสกป้องกันนางผีเสื้อ?", a: "ก" }, 
    { q: "นางผีเสื้อสมุทรกลัวเสียงปี่ของพระอภัยมณีจนขาดใจตายในตอนท้ายของการหนี?", a: "ก" }, 
    { q: "สินสมุทรมีตาเป็นประกายเหมือนยักษ์ แต่มีรูปร่างเหมือนมนุษย์?", a: "ก" }, 
    { q: "เกาะแก้วพิสดารมีสิ่งศักดิ์สิทธิ์ที่พวกยักษ์ไม่สามารถเข้ามาใกล้ได้?", a: "ก" }, 
    { q: "นางเงือกตัวลูกยอมเสียสละพาสินสมุทรหนีจนตัวเองตาย?", a: "ข" }, 
    { q: "สุนทรภู่แต่งเรื่องพระอภัยมณีด้วยคำประพันธ์ประเภท 'โคลงสี่สุภาพ'?", a: "ข" } 
];

let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let canAnswer = false; 
let gameActive = false; 

// --- เพิ่มส่วนประกอบภาพพื้นหลังตามที่คุณครูต้องการ ---
const bgImage = new Image();
bgImage.src = 'https://img1.pic.in.th/images/Copy-of--1.png'; 

// --- 2. อ้างอิง HTML Elements (DOM) ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const questionText = document.getElementById('question_text');
const scoreDisplay = document.getElementById('score_display');
const lifeDisplay = document.getElementById('life_display');
const statusBar = document.getElementById('status_message');

// พิกัดล็อกปุ่มเสมือนจริง: ก. ถูก อยู่ฝั่งซ้ายของจอ และ ข. ผิด อยู่ฝั่งขวาของจอ (ขนาดเฟรม 680x480)
const btnA_Box = { x: 50, y: 220, width: 140, height: 90, hovered: false };  // ก. ถูก (ซ้าย)
const btnB_Box = { x: 490, y: 220, width: 140, height: 90, hovered: false }; // ข. ผิด (ขวา)

// --- 3. ระบบเสียงสังเคราะห์ครูผู้หญิงสำเนียงไทย ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH'; 
        utterance.rate = 1.1;     
        utterance.pitch = 1.25;   

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.lang === 'th-TH' && 
            (voice.name.includes('Pattara') || voice.name.includes('Google') || voice.name.includes('Narisa'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
        window.speechSynthesis.speak(utterance);
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

// --- 4. ฟังก์ชันจัดการเมนูเปลี่ยนฉากและเคลียร์สเตตัสเกม ---
function startGame() {
    document.getElementById('start_overlay').classList.add('hidden');
    gameActive = true;
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    scoreDisplay.innerText = `คะแนน: 0/10`;
    lifeDisplay.innerText = "❤️❤️❤️";
    
    setTimeout(() => {
        loadQuestion();
    }, 500);
}

function resetGame() {
    document.getElementById('end_overlay').classList.add('hidden');
    gameActive = true;
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    scoreDisplay.innerText = `คะแนน: 0/10`;
    lifeDisplay.innerText = "❤️❤️❤️";
    
    setTimeout(() => {
        loadQuestion();
    }, 500);
}

function loadQuestion() {
    if (currentQuestionIndex < quizData.length && lives > 0) {
        questionText.innerText = `ข้อที่ ${currentQuestionIndex + 1}: ${quizData[currentQuestionIndex].q}`;
        statusBar.innerText = "เอื้อมฝ่ามือไปแตะปุ่ม ก. ถูก (ซ้าย) หรือ ข. ผิด (ขวา)";
        statusBar.style.color = "#bcd1eb";
        speak(quizData[currentQuestionIndex].q);
        canAnswer = true; 
    } else {
        endGame();
    }
}

function checkAnswer(userChoice) {
    if (!canAnswer) return; 
    canAnswer = false; 

    const correctAnswer = quizData[currentQuestionIndex].a;

    if (userChoice === correctAnswer) {
        score++;
        scoreDisplay.innerText = `คะแนน: ${score}/10`;
        statusBar.innerText = "✨ ถูกต้องแล้วจ้า! เก่งมาก ๆ";
        statusBar.style.color = "#00ff66";
        speak("ถูกต้องแล้วจ้า เก่งมาก");
    } else {
        lives--;
        lifeDisplay.innerText = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
        statusBar.innerText = "❌ ว้า... ข้อนี้ตอบผิดนะจ๊ะ";
        statusBar.style.color = "#ff3333";
        speak("ว้า ข้อนี้ตอบผิดนะจ๊ะ");
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 3000);
}

function endGame() {
    gameActive = false; 
    canAnswer = false;
    const endOverlay = document.getElementById('end_overlay');
    const endTitle = document.getElementById('end_title');
    const endStatus = document.getElementById('end_status');
    
    endOverlay.classList.remove('hidden');
    
    if (lives > 0) {
        endTitle.innerText = "🎉 ยินดีด้วย!";
        endTitle.style.color = "#ffd700";
        endStatus.innerText = `คุณพาพระอภัยมณีหนีรอดถึงเกาะแก้วพิสดารได้สำเร็จ! คะแนนทั้งหมดคือ ${score} คะแนน`;
        speak("ยินดีด้วยจ้า คุณพาพระอภัยมณีหนีรอดสำเร็จแล้ว");
    } else {
        endTitle.innerText = "💀 Game Over!";
        endTitle.style.color = "#ff3333";
        endStatus.innerText = `โชคร้ายจัง ถูกนางผีเสื้อสมุทรจับตัวกลับไปซะแล้ว ทำคะแนนไปได้ ${score} คะแนน`;
        speak("เกมโอเวอร์ ถูกนางผีเสื้อสมุทรจับตัวไปซะแล้ว พยายามใหม่อีกครั้งนะจ๊ะ");
    }
}

// --- 5. ฟังก์ชันสร้างและดีไซน์ปุ่มข้อความ (วาดหลังสุดเพื่อให้ปุ่มทึบแสง คมชัดสูง) ---
function drawCanvasButtons() {
    // 5.1 ดีไซน์กล่องปุ่ม ก. ถูก (ซ้ายจอ)
    canvasCtx.fillStyle = btnA_Box.hovered ? "rgba(255, 215, 0, 0.95)" : "rgba(40, 167, 69, 0.85)";
    canvasCtx.strokeStyle = "#ffffff";
    canvasCtx.lineWidth = 3;
    roundRect(canvasCtx, btnA_Box.x, btnA_Box.y, btnA_Box.width, btnA_Box.height, 16, true, true);
    
    canvasCtx.fillStyle = btnA_Box.hovered ? "#050b14" : "#ffffff";
    canvasCtx.font = "bold 24px 'Chakra Petch', sans-serif";
    canvasCtx.fillText("ก. ถูก", btnA_Box.x + 35, btnA_Box.y + 53);

    // 5.2 ดีไซน์กล่องปุ่ม ข. ผิด (ขวาจอ)
    canvasCtx.fillStyle = btnB_Box.hovered ? "rgba(255, 215, 0, 0.95)" : "rgba(220, 53, 69, 0.85)";
    roundRect(canvasCtx, btnB_Box.x, btnB_Box.y, btnB_Box.width, btnB_Box.height, 16, true, true);
    
    canvasCtx.fillStyle = btnB_Box.hovered ? "#050b14" : "#ffffff";
    canvasCtx.fillText("ข. ผิด", btnB_Box.x + 37, btnB_Box.y + 53);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// --- 6. คำนวณขอบเขตการชนปุ่มระนาบพิกเซลตรงกันแบบกระจกเงาสมบูรณ์ ---
function checkCollision(handX, handY) {
    if (handX >= btnA_Box.x && handX <= btnA_Box.x + btnA_Box.width &&
        handY >= btnA_Box.y && handY <= btnA_Box.y + btnA_Box.height) {
        btnA_Box.hovered = true;
        if (canAnswer) checkAnswer('ก');
    } else {
        btnA_Box.hovered = false;
    }

    if (handX >= btnB_Box.x && handX <= btnB_Box.x + btnB_Box.width &&
        handY >= btnB_Box.y && handY <= btnB_Box.y + btnB_Box.height) {
        btnB_Box.hovered = true;
        if (canAnswer) checkAnswer('ข');
    } else {
        btnB_Box.hovered = false;
    }
}

// --- 7. ลูปประมวลผลวิดีโอสดและการซ้อนภาพ Layer พื้นหลังวรรณคดี ---
function onResults(results) {
    canvasElement.width = 680;
    canvasElement.height = 480;

    // 7.1 เคลียร์แผ่นเฟรมกระดานเก่า
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // 7.2 วาดภาพพื้นหลังของคุณครูเป็นฐานล่างสุด (Layer 1)
    if (bgImage.complete) {
        canvasCtx.drawImage(bgImage, 0, 0, canvasElement.width, canvasElement.height);
    }

    // 7.3 พลิกสเกลภาพกล้องเป็นกระจกเงา และวาดซ้อนทับแบบกึ่งโปร่งแสง (Layer 2)
    canvasCtx.save();
    
    // ตั้งค่าความใสของภาพกล้องเว็บแคม (0.65 แปลว่ากล้องชัด 65% มองทะลุเห็นพื้นหลังด้านหลัง 35%)
    canvasCtx.globalAlpha = 0.65; 
    
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (gameActive) {
        // วาดลายเส้นเชื่อมข้อต่อสีทองและจุดเรืองแสงฟ้านีออน (จะล็อกติดกับมือจริงของคุณครูทันที)
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#dfb76c', lineWidth: 4});
                drawLandmarks(canvasCtx, landmarks, {color: '#00fff0', lineWidth: 1, radius: 4});
            }
        }
    }
    canvasCtx.restore(); // คืนค่าความทึบแสง (Alpha) และ Matrix ของ Canvas ให้กลับมาคมชัดเต็ม 100%

    if (gameActive) {
        // 7.4 วาดปุ่มทับเหนือเลเยอร์หน้าจอทั้งหมด (ก. ซ้าย, ข. ขวา)
        drawCanvasButtons();

        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                const targetPoint = landmarks[9]; // โคนนิ้วกลาง
                
                // ถอดพิกัดสมการล็อกแกนควบคุมเข้าคู่กับภาพกระจกเงา
                const mirrorX = (1 - targetPoint.x) * canvasElement.width;
                const pixelY = targetPoint.y * canvasElement.height;

                // ประมวลผลการแตะชนปุ่ม
                checkCollision(mirrorX, pixelY);
            }
        }
    }
}

// --- 8. บูตเครื่องโมเดลปัญญาประดิษฐ์ MediaPipe Hands ---
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.55, 
    minTrackingConfidence: 0.55
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    }
});

camera.start().catch(err => {
    console.error("ระบบกล้องขัดข้อง: ", err);
    statusBar.innerText = "🚨 ระบบกล้องขัดข้อง: โปรดตรวจสอบสิทธิ์การเข้าถึงกล้องเว็บแคมบนเบราว์เซอร์";
});