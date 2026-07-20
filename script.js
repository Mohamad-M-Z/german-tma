// اتصال به شیء اصلی تلگرام
const tg = window.Telegram.WebApp;

// باز کردن مینی‌اپ به صورت تمام‌صفحه
tg.expand();
tg.ready();



// وضعیت بازی
let score = 0;
let combo = 1;
let timeLeft = 60;
let timerId = null;
let currentWord = null;
let wrongGuesses = [];

// عناصر DOM
const timeDisplay = document.getElementById("time-display");
const comboDisplay = document.getElementById("combo-display");
const scoreDisplay = document.getElementById("score-display");
const wordDisplay = document.getElementById("word-display");
const wordLevel = document.getElementById("word-level");
const wordHint = document.getElementById("word-hint");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

// شروع بازی
function startGame() {
    score = 0;
    combo = 1;
    timeLeft = 60;
    wrongGuesses = [];
    
    nextWord();
    
    // تایمر ۶۰ ثانیه‌ای
    timerId = setInterval(() => {
        timeLeft--;
        timeDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// انتخاب کلمه بعدی به صورت راندوم
function nextWord() {
    const randomIndex = Math.floor(Math.random() * wordsDatabase.length);
    currentWord = wordsDatabase[randomIndex];
    
    wordDisplay.innerText = currentWord.word;
    wordLevel.innerText = currentWord.level;
    wordHint.innerText = currentWord.meaning;
}

// بررسی جواب کاربر
function checkAnswer(selectedArticle) {
    if (timeLeft <= 0) return;

    if (selectedArticle === currentWord.article) {
        // پاسخ درست
        score += 10 * combo;
        combo++;
        
        // بازخورد لرزشی گوشی (اگر تلگرام اجازه دهد)
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        // پاسخ غلط
        combo = 1;
        // ثبت کلمه در لیست مرور
        if (!wrongGuesses.some(item => item.word === currentWord.word)) {
            wrongGuesses.push(currentWord);
        }
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }

    // به‌روزرسانی UI و رفتن به کلمه بعد
    scoreDisplay.innerText = score;
    comboDisplay.innerText = combo;
    nextWord();
}

// پایان بازی
function endGame() {
    clearInterval(timerId);
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
    
    document.getElementById("final-score").innerText = score;
    
    // نمایش کلماتی که غلط زده شده
    const list = document.getElementById("wrong-words-list");
    list.innerHTML = "";
    if (wrongGuesses.length === 0) {
        list.innerHTML = "<li>🎉 عالی! هیچ غلطی نداشتی!</li>";
    } else {
        wrongGuesses.forEach(item => {
            const li = document.createElement("li");
            li.innerText = `${item.article.toUpperCase()} ${item.word} (${item.meaning})`;
            list.appendChild(li);
        });
    }
}

// ارسال اطلاعات به ربات پایتون و بستن مینی‌اپ
function sendDataToBot() {
    const payload = {
        score: score,
        wrong_count: wrongGuesses.length,
        wrong_words: wrongGuesses.map(w => `${w.article} ${w.word}`)
    };
    
    // این متد اطلاعات را به عنوان یک پیام web_app_data به چت ربات می‌فرستد و مینی‌اپ را می‌بندد
    tg.sendData(JSON.stringify(payload));
}

// شروع بازی به محض لود شدن صفحه
window.onload = startGame;