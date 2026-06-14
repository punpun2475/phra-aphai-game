// ==========================================
// AI HAND TRACKING GAME: PHRA APHAI MANI
// Developed by Senior Computer Vision Engineer
// ==========================================

// --- 1. คลังคำถามวรรณคดีไทย (10 ข้อตามป้ายโฆษณา) ---
const quizData = [
    { q: "นางผีเสื้อสมุทรลักตัวพระอภัยมณีมาจากถ้ำ?", a: "ข" }, // ผิด (ลักมาจากชายหาด)
    { q: "สินสมุทรเป็นลูกของนางผีเสื้อสมุทรกับพระอภัยมณี?", a: "ก" }, // ถูก
    { q: "พระอภัยมณีหนีนางผีเสื้อสมุทรไปที่เกาะแก้วพิสดาร?", a: "ก" }, // ถูก
    { q: "ผู้ที่พาพระอภัยมณีหนีในช่วงแรกคือ ม้านิลมังกร?", a: "ข" }, // ผิด (เงือกผัวเมียและลูกเงือก)
    { q: "โยคีแห่งเกาะแก้วพิสดารใช้ไม้เท้าเสกป้องกันนางผีเสื้อ?", a: "ก" }, // ถูก
    { q: "นางผีเสื้อสมุทรกลัวเสียงปี่ของพระอภัยมณีจนขาดใจตายในตอนท้ายของการหนี?", a: "ก" }, // ถูก
    { q: "สินสมุทรมีตาเป็นประกายเหมือนยักษ์ แต่มีรูปร่างเหมือนมนุษย์?", a: "ก" }, // ถูก
    { q: "เกาะแก้วพิสดารมีสิ่งศักดิ์สิทธิ์ที่พวกยักษ์ไม่สามารถเข้ามาใกล้ได้?", a: "ก" }, // ถูก
    { q: "นางเงือกตัวลูกยอมเสียสละพาสินสมุทรหนีจนตัวเองตาย?", a: "ข" }, // ผิด (นางเงือกรอดและได้เป็นชายา)
    { q: "สุนทรภู่แต่งเรื่องพระอภัยมณีด้วยคำประพันธ์ประเภท 'โคลงสี่สุภาพ'?", a: "ข" } // ผิด (แต่งด้วยกลอนสุภาพ)
];

let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let canAnswer = true; // ดักไม่ให้ผู้เล่นตอบซ้ำรัวๆ ในเฟรมถัดไป (Cool-down state)

// --- 2. อ้างอิง HTML Elements (DOM) ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const questionText = document.getElementById('question_text');
const scoreDisplay = document.getElementById('score_display');
const lifeDisplay = document.getElementById('life_display');
const statusBar = document.getElementById('status_message');

const btnA = document.getElementById('btn_a');
const btnB = document.getElementById('btn_b');

// --- 3. ระบบเสียงสังเคราะห์ภาษาไทย (Text-to-Speech เวอร์ชันเสียงผู้หญิงสดใส) ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // หยุดเสียงเก่าทันทีเพื่อไม่ให้เสียงพูดซ้อนกัน

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH'; // กำหนดสำเนียงภาษาไทย
        utterance.rate = 1.1;     // เร่งความเร็วเล็กน้อยให้ดูเป็นธรรมชาติ
        utterance.pitch = 1.25;   // ดันโทนเสียงให้สูงขึ้นเพื่อเปลี่ยนคีย์เป็นผู้หญิงหวานๆ

        // ค้นหาไฟล์เสียงผู้หญิงไทยจากระบบปฏิบัติการ (Windows/Chrome)
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.lang === 'th-TH' && 
            (voice.name.includes('Pattara') || voice.name.includes('Google') || voice.name.includes('Narisa'))
        );

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

// โหลดรายชื่อเสียงมารอไว้ล่วงหน้า (แก้บั๊กบางเบราว์เซอร์เสียงไม่ยอมโหลดตอนเปิดเว็บครั้งแรก)
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// --- 4. ฟังก์ชันควบคุมสถานะและการดำเนินเกม ---
function loadQuestion() {
    if (currentQuestionIndex < quizData.length && lives > 0) {
        questionText.innerText = `ข้อที่ ${currentQuestionIndex + 1}: ${quizData[currentQuestionIndex].q}`;
        statusBar.innerText = "เอื้อมฝ่ามือไปแตะปุ่ม สีเขียว (ก. ถูก) หรือ สีแดง (ข. ผิด)";
        statusBar.style.color = "#bcd1eb";
        speak(quizData[currentQuestionIndex].q);
        canAnswer = true; // เปิดให้รับคำตอบในข้อใหม่
    } else {
        endGame();
    }
}

function checkAnswer(userChoice) {
    if (!canAnswer) return; 
    canAnswer = false; // ล็อคทันทีเพื่อป้องกันเฟรมถัดไปตรวจซ้ำ (Anti-spam)

    const correctAnswer = quizData[currentQuestionIndex].a;

    if (userChoice === correctAnswer) {
        score++;
        scoreDisplay.innerText = `คะแนน: ${score}/10`;
        statusBar.innerText = "✨ ถูกต้องแล้วจ้า! เก่งมาก ๆ";
        statusBar.style.color = "#00ff66";
        speak("ถูกต้องแล้วจ้า เก่งมาก");
    } else {
        lives--;
        // อัปเดตหัวใจสีแดงและหัวใจสีดำตามชีวิตที่เหลือ
        lifeDisplay.innerText = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
        statusBar.innerText = "❌ ว้า... ข้อนี้ตอบผิดนะจ๊ะ";
        statusBar.style.color = "#ff3333";
        speak("ว้า ข้อนี้ตอบผิดนะจ๊ะ");
    }

    // ดีเลย์ 3 วินาที เพื่อให้ผู้เล่นมีเวลาชักมือกลับมาตรงกลางจอก่อนเริ่มข้อถัดไป
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
        statusBar.innerText = `คะแนนของคุณคือ ${score} คะแนน ลองใหม่อีกครั้งนะ`;
        statusBar.style.color = "#ff3333";
        speak("เกมโอเวอร์ ถูกนางผีเสื้อสมุทรจับตัวไปซะแล้ว พยายามใหม่อีกครั้งนะจ๊ะ");
    }
}

// --- 5. อัลกอริทึมคณิตศาสตร์ตรวจจับพิกัดชนปุ่ม (Collision Detection) ---
function checkCollision(handX, handY) {
    // ดึงค่าขอบเขตพิกเซลจริงของปุ่ม ก. และ ปุ่ม ข. บนเบราว์เซอร์
    const rectA = btnA.getBoundingClientRect();
    const rectB = btnB.getBoundingClientRect();
    const canvasRect = canvasElement.getBoundingClientRect();

    // แปลงพิกัดมือที่ได้จาก Canvas ให้เป็นพิกัดสากลบนหน้าจอ (Absolute Viewport X, Y)
    const absoluteHandX = canvasRect.left + handX;
    const absoluteHandY = canvasRect.top + handY;

    // ตรวจสอบกับปุ่ม ก. (ฝั่งซ้ายของจอ)
    if (absoluteHandX >= rectA.left && absoluteHandX <= rectA.right &&
        absoluteHandY >= rectA.top && absoluteHandY <= rectA.bottom) {
        btnA.classList.add('hovered'); // สั่งให้ CSS แสดงเอฟเฟกต์ปุ่มขยาย/เรืองแสง
        if (canAnswer) checkAnswer('ก');
    } else {
        btnA.classList.remove('hovered');
    }

    // ตรวจสอบกับปุ่ม ข. (ฝั่งขวาของจอ)
    if (absoluteHandX >= rectB.left && absoluteHandX <= rectB.right &&
        absoluteHandY >= rectB.top && absoluteHandY <= rectB.bottom) {
        btnB.classList.add('hovered'); // สั่งให้ CSS แสดงเอฟเฟกต์ปุ่มขยาย/เรืองแสง
        if (canAnswer) checkAnswer('ข');
    } else {
        btnB.classList.remove('hovered');
    }
}

// --- 6. ฟังก์ชัน Callback เมื่อโมเดล AI ประมวลผลเสร็จสิ้น (Real-time Frame Handler) ---
function onResults(results) {
    // ปรับสัดส่วน Canvas ให้ยืดหยุ่นตามมิติภาพจริงของกล้องที่ส่งเข้ามา
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // ล้างภาพเฟรมเก่าทิ้งเพื่อเตรียมวาดเฟรมใหม่
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // วาดภาพวิดีโอสดจากกล้องลงไปบน Canvas เพื่อเป็นฉากหลังเกม
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // เช็คว่าในเฟรมปัจจุบันมีมือปรากฏอยู่หรือไม่
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            
            // เลือกจุดกึ่งกลางฝ่ามือ (Landmark หมายเลข 9: ข้อต่อโคนนิ้วกลาง) เป็นตัวชี้เป้า
            const targetPoint = landmarks[9];
            
            // MATH HACK: พลิกพิกัด X ในโค้ดกลับด้าน (1 - x) เพื่อให้ตรงกับหน้าจอ CSS ที่เรา Mirror ไว้
            const flippedX = (1 - targetPoint.x) * canvasElement.width;
            const pixelY = targetPoint.y * canvasElement.height;

            // วาดเส้นข้อต่อกระดูกมือ (สีทองตามธีมไทยโบราณ)
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#dfb76c', lineWidth: 4});
            
            // วาดจุดข้อต่อทั้ง 21 จุด (สีฟ้านีออนให้ตัดกับเส้น)
            drawLandmarks(canvasCtx, landmarks, {color: '#00fff0', lineWidth: 1, radius: 4});

            // ส่งค่าพิกัดที่แปลงแล้วไปคำนวณการชนปุ่มทันที
            checkCollision(flippedX, pixelY);
        }
    }
}

// --- 7. ตั้งค่าเปิดใช้งานโมเดล MediaPipe Hands ---
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,              // ตรวจจับแค่ 1 มือเพื่อประหยัดทรัพยากรและแม่นยำที่สุด
    modelComplexity: 1,          // บาลานซ์ความเร็วและความแม่นยำให้เหมาะกับเว็บเบราว์เซอร์
    minDetectionConfidence: 0.6, // ค่าความมั่นใจ 60% ในการเริ่มจับภาพมือ
    minTrackingConfidence: 0.6   // ค่าความมั่นใจ 60% ในการติดตามการเคลื่อนไหวต่อเนื่อง
});
hands.onResults(onResults);

// --- 8. เริ่มต้นระบบกล้องเว็บแคม (เวอร์ชันยืดหยุ่น ป้องกันปัญหากล้องค้าง) ---
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    }
});

// เริ่มต้นเรียกคำถามข้อแรกขึ้นมาเตรียมพร้อม
loadQuestion();

// สั่งสตาร์ทกล้องเว็บแคม และทำ Error Handling เผื่อกรณีโดนแย่งกล้องหรือไม่ได้อนุญาตสิทธิ์
camera.start().catch(err => {
    console.error("เกิดข้อผิดพลาดในการเปิดระบบกล้อง: ", err);
    statusBar.innerText = "🚨 เปิดกล้องไม่ได้! โปรดปิดโปรแกรมอื่นที่ใช้กล้องอยู่ (เช่น Zoom, LINE) แล้วกดอนุญาตสิทธิ์ให้เว็บเข้าถึงกล้อง";
    statusBar.style.color = "#ff3333";
    statusBar.style.fontWeight = "bold";
});