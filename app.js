// ==========================================
// AI HAND TRACKING GAME: PHRA APHAI MANI (MAX GRAPHICS)
// Developed by Senior Computer Vision Engineer
// ==========================================

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

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const questionText = document.getElementById('question_text');
const scoreDisplay = document.getElementById('score_display');
const lifeDisplay = document.getElementById('life_display');
const statusBar = document.getElementById('status_message');

const btnA = document.getElementById('btn_a');
const btnB = document.getElementById('btn_b');

const bgImage = new Image();
bgImage.src = 'https://img2.pic.in.th/Copy-of--2bfaf55ce07909280.png'; 

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

function loadQuestion() {
    if (currentQuestionIndex < quizData.length && lives > 0) {
        questionText.innerText = `ข้อที่ ${currentQuestionIndex + 1}: ${quizData[currentQuestionIndex].q}`;
        statusBar.innerText = "เอื้อมฝ่ามือไปแตะปุ่ม สีเขียว (ก. ถูก) หรือ สีแดง (ข. ผิด)";
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
        statusBar.innerText = `คะแนนของคุณคือ ${score} คะแนน ลองใหม่อีกครั้งนะ`;
        statusBar.style.color = "#ff3333";
        speak("เกมโอเวอร์ ถูกนางผีเสื้อสมุทรจับตัวไปซะแล้ว พยายามใหม่อีกครั้งนะจ๊ะ");
    }
}

// [FIX]: ปรับฟังก์ชันตรวจสอบการชนกันให้ใช้พิกัดแกน X ที่ถูก Flip แล้ว
function checkCollision(handX, handY) {
    const rectA = btnA.getBoundingClientRect();
    const rectB = btnB.getBoundingClientRect();
    const canvasRect = canvasElement.getBoundingClientRect();

    const scaleFactorX = canvasRect.width / canvasElement.width;
    const scaleFactorY = canvasRect.height / canvasElement.height;

    // [COMPUTATION FIXED]: คำนวณพิกัดแกน X ใหม่โดยใช้ความกว้าง Canvas ลบค่าพิกัดเดิม เพื่อแก้สมดุลกระจกเงา
    const fixedHandX = (canvasElement.width - handX);
    const absoluteHandX = canvasRect.left + (fixedHandX * scaleFactorX);
    const absoluteHandY = canvasRect.top + (handY * scaleFactorY);

    if (absoluteHandX >= rectA.left && absoluteHandX <= rectA.right &&
        absoluteHandY >= rectA.top && absoluteHandY <= rectA.bottom) {
        btnA.classList.add('hovered');
        if (canAnswer) checkAnswer('ก');
    } else {
        btnA.classList.remove('hovered');
    }

    if (absoluteHandX >= rectB.left && absoluteHandX <= rectB.right &&
        absoluteHandY >= rectB.top && absoluteHandY <= rectB.bottom) {
        btnB.classList.add('hovered');
        if (canAnswer) checkAnswer('ข');
    } else {
        btnB.classList.remove('hovered');
    }
}

function onResults(results) {
    canvasElement.width = 680;
    canvasElement.height = 480;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (bgImage.complete) {
        canvasCtx.drawImage(bgImage, 0, 0, canvasElement.width, canvasElement.height);
    }

    canvasCtx.save();
    canvasCtx.globalAlpha = 0.55;
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            const targetPoint = landmarks[9];
            
            const pixelX = targetPoint.x * canvasElement.width;
            const pixelY = targetPoint.y * canvasElement.height;

            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#dfb76c', lineWidth: 4});
            drawLandmarks(canvasCtx, landmarks, {color: '#00fff0', lineWidth: 1, radius: 3});

            // ส่งพิกัดแนวแกน X ดั้งเดิมเข้าไป เพื่อทำการกลับแกนภายในฟังก์ชัน checkCollision
            checkCollision(pixelX, pixelY);
        }
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
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
    statusBar.innerText = "🚨 เปิดกล้องไม่ได้! โปรดปิดแอปอื่นที่แย่งกล้องอยู่แล้วรีเฟรชหน้าเว็บ";
});