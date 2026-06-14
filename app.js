// ==========================================
// AI HAND TRACKING GAME: PHRA APHAI MANI (PERFECT MIRROR SYSTEM)
// Developed by Senior Computer Vision Engineer
// ==========================================

// --- 1. คลังคำถามวรรณคดีไทย ---
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
let canAnswer = true; 

// --- 2. อ้างอิง HTML Elements ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const questionText = document.getElementById('question_text');
const scoreDisplay = document.getElementById('score_display');
const lifeDisplay = document.getElementById('life_display');
const statusBar = document.getElementById('status_message');

// ซ่อนปุ่ม HTML ภายนอกระบบเพื่อไม่ให้ซ้อนทับ
if (document.getElementById('btn_a')) document.getElementById('btn_a').style.display = 'none';
if (document.getElementById('btn_b')) document.getElementById('btn_b').style.display = 'none';

// [SETTING FIXED]: ล็อกตำแหน่งปุ่ม ก. ถูก ไว้ฝั่งซ้าย (x: 50) และปุ่ม ข. ผิด ไว้ฝั่งขวา (x: 490) ของหน้าจอ
const btnA_Box = { x: 50, y: 220, width: 140, height: 90, hovered: false };  // ก. ถูก (ซ้าย)
const btnB_Box = { x: 490, y: 220, width: 140, height: 90, hovered: false }; // ข. ผิด (ขวา)

// --- 3. ระบบเสียงสังเคราะห์ครูผู้หญิง ---
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

// --- 4. ฟังก์ชันดำเนินเกม ---
function loadQuestion() {
    if (currentQuestionIndex < quizData.length && lives > 0) {
        questionText.innerText = `ข้อที่ ${currentQuestionIndex + 1}: ${quizData[currentQuestionIndex].q}`;
        statusBar.innerText = "เอื้อมฝ่ามือไปแตะปุ่ม ก. ถูก (ฝั่งซ้าย) หรือ ข. ผิด (ฝั่งขวา)";
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
    canAnswer = false;
    if (lives > 0) {
        questionText.innerText = `🎉 ยินดีด้วย! คุณพาพระอภัยมณีหนีรอดถึงเกาะแก้วพิสดารสำเร็จ!`;
        statusBar.innerText = `จบเกม! คุณทำคะแนนไปได้ทั้งสิ้น ${score} คะแนน`;
        statusBar.style.color = "#ffd700";
        speak("ยินดีด้วยจ้า คุณพาพระอภัยมณีหนีรอดถึงเกาะแก้วพิสดารสำเร็จแล้ว");
    } else {
        questionText.innerText = `💀 Game Over! ถูกนางผีเสื้อสมุทรจับตัวไปซะแล้ว!`;
        statusBar.innerText = `พยายามใหม่อีกครั้งนะจ๊ะ`;
        statusBar.style.color = "#ff3333";
        speak("เกมโอเวอร์ ถูกนางผีเสื้อสมุทรจับตัวไปซะแล้ว พยายามใหม่อีกครั้งนะจ๊ะ");
    }
}

// --- 5. ฟังก์ชันวาดปุ่มลงบน Canvas โดยตรง ---
function drawCanvasButtons() {
    // 5.1 วาดปุ่ม ก. ถูก (แสดงผลทางฝั่งซ้ายของหน้าจอปกติ)
    canvasCtx.fillStyle = btnA_Box.hovered ? "rgba(255, 215, 0, 0.95)" : "rgba(40, 167, 69, 0.85)";
    canvasCtx.strokeStyle = "#ffffff";
    canvasCtx.lineWidth = 3;
    roundRect(canvasCtx, btnA_Box.x, btnA_Box.y, btnA_Box.width, btnA_Box.height, 16, true, true);
    
    canvasCtx.fillStyle = btnA_Box.hovered ? "#050b14" : "#ffffff";
    canvasCtx.font = "bold 24px 'Chakra Petch', sans-serif";
    canvasCtx.fillText("ก. ถูก", btnA_Box.x + 35, btnA_Box.y + 53);

    // 5.2 วาดปุ่ม ข. ผิด (แสดงผลทางฝั่งขวาของหน้าจอปกติ)
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

// --- 6. คำนวณขอบเขตการชนปุ่มอิงตามระบบพิกเซลกระจกเงา ---
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

// --- 7. ฟังก์ชันหลักประมวลผลกล้องวิดีโอสดและการสลับทิศทางนิ้วมือ ---
function onResults(results) {
    canvasElement.width = 680;
    canvasElement.height = 480;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // 7.1 วาดภาพวิดีโอจากกล้องเว็บแคมแบบกลับด้านซ้ายขวา (Mirror Effect หน้าไม่เบลอ)
    canvasCtx.save();
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();

    // 7.2 วาดปุ่มทับลงไปบนหน้ากล้อง (ก. ถูก อยู่ด้านซ้ายหน้าจอ และ ข. ผิด อยู่ด้านขวาหน้าจอ)
    drawCanvasButtons();

    // 7.3 ถอดรหัสพิกัดมือและแก้ปัญหามือควบคุมสวนทาง
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            const targetPoint = landmarks[9]; // ดึงโคนนิ้วกลางเป็นพิกัดอ้างอิง
            
            // [MATH PERFECT FIX]: ใช้สูตร (1 - X) พลิกค่าพิกัดความจริงของ AI ให้แมตช์เข้าคู่กับภาพกระจกเงาในข้อ 7.1
            const mirrorX = (1 - targetPoint.x) * canvasElement.width;
            const pixelY = targetPoint.y * canvasElement.height;

            // สั่งวาดเส้นข้อต่อสีกนกทองและจุดข้อนิ้วสีฟ้านีออนให้ตรงกับทิศทางมือจริงในจอ
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#dfb76c', lineWidth: 4});
            drawLandmarks(canvasCtx, landmarks, {color: '#00fff0', lineWidth: 1, radius: 4});

            // ตรวจจับระยะชนปุ่มที่สัมพันธ์กับมือจริง
            checkCollision(mirrorX, pixelY);
        }
    }
}

// --- 8. ติดตั้งโมเดลและเปิดระบบกล้อง ---
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

loadQuestion();
camera.start().catch(err => {
    statusBar.innerText = "🚨 ระบบกล้องขัดข้อง: โปรดกดอนุญาตสิทธิ์ให้เว็บเข้าถึงกล้องเว็บแคม";
});