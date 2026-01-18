// ======================
// НАСТРОЙКА МЕМОВ - РЕДАКТИРУЙ ЗДЕСЬ!
// ======================

const memes = [
    // ПРИМЕР 1 - скопируй и измени под свои мемы:
    {
        id: 1,
        image: "memes/meme1.png",  // ← путь к картинке в папке memes/
        name: "о как",  // ← как называется мем
        altNames: ["", ""]  // ← другие названия, которые можно сказать
    },
    // ПРИМЕР 2:
    {
        id: 2,
        image: "memes/meme2.png",
        name: "смерть в нищите",
        altNames: ["смерть"]
    },
    // ПРИМЕР 3:
    {
        id: 3,
        image: "memes/meme3.png",
        name: "умный человек в очках",
        altNames: ["умный человек в очках скачать обои"]
    },
    // ДОБАВЛЯЙ СВОИ МЕМЫ ТУТ:
    {
         id: 4,
         image: "memes/meme4.png",
         name: "шлепа",
         altNames: ["большой шлепа"]
     },
    {
         id: 5,
         image: "memes/meme5.png",
         name: "смайл фейс",
         altNames: ["фейс","смайлик фейс"]
     }
    ,
    {
         id: 6,
         image: "memes/meme6.jpg",
         name: "солыншко",
         altNames: ["любимая девочка"]
     }
];

// ======================
// ИГРОВАЯ ЛОГИКА (не трогай)
// ======================

let currentMemeIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null;
let soundsEnabled = false;

// Элементы
const memeImage = document.getElementById('meme-image');
const memeName = document.getElementById('meme-name');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const hintElement = document.getElementById('hint');

// Активация звуков на iOS
document.addEventListener('click', function() {
    if (!soundsEnabled) {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        silentAudio.volume = 0.01;
        silentAudio.play().then(() => {
            soundsEnabled = true;
        }).catch(e => {});
    }
});

// Показать мем
function showMeme() {
    const meme = memes[currentMemeIndex];
    memeImage.src = meme.image;
    memeName.textContent = '';
    memeName.classList.add('hidden');
    hintElement.textContent = "Скажи название мема";
}

// Запуск распознавания
function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Голосовой ввод не поддерживается. Используй Safari на iPhone.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecording = true;
        hintElement.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        recognition = null;
    };

    recognition.start();
}

// Проверка ответа
function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    const correctNames = [meme.name.toLowerCase(), ...meme.altNames.map(n => n.toLowerCase())];
    
    let isCorrect = false;
    for (const name of correctNames) {
        if (spokenText.includes(name) || name.includes(spokenText)) {
            isCorrect = true;
            break;
        }
    }
    
    if (isCorrect) {
        // Правильный ответ
        score += 10;
        streak++;
        scoreElement.textContent = score;
        streakElement.textContent = streak;
        
        // Показываем название мема
        memeName.textContent = meme.name;
        memeName.classList.remove('hidden');
        hintElement.textContent = "Верно! +10 очков";
        
        // Звук
        if (soundsEnabled) {
            document.getElementById('correct').play().catch(e => {});
        }
        
        // Конфетти при серии
        if (streak % 3 === 0) {
            showConfetti();
        }
        
        // Следующий мем через 2 секунды
        setTimeout(() => {
            nextMeme();
        }, 2000);
        
    } else {
        // Неправильный ответ
        streak = 0;
        streakElement.textContent = streak;
        
        // Показываем правильный ответ
        memeName.textContent = `Правильно: ${meme.name}`;
        memeName.classList.remove('hidden');
        hintElement.textContent = "Попробуй ещё!";
        
        // Звук
        if (soundsEnabled) {
            document.getElementById('wrong').play().catch(e => {});
        }
        
        // Следующий мем через 3 секунды
        setTimeout(() => {
            nextMeme();
        }, 3000);
    }
}

// Следующий мем
function nextMeme() {
    currentMemeIndex = (currentMemeIndex + 1) % memes.length;
    showMeme();
}

// Конфетти
function showConfetti() {
    if (soundsEnabled) {
        document.getElementById('win').play().catch(e => {});
    }
    
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    score += 20;
    scoreElement.textContent = score;
    hintElement.textContent = `СЕРИЯ ${streak}! +20 бонус`;
    
    const particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    let animationId;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let p of particles) {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speed;
            
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        }
        
        animationId = requestAnimationFrame(draw);
    }
    
    draw();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hintElement.textContent = "Скажи название мема";
    }, 3000);
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

document.getElementById('speak-btn').addEventListener('click', startVoiceRecording);

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    showMeme();
});

document.getElementById('skip-btn').addEventListener('click', nextMeme);

document.getElementById('hint-btn').addEventListener('click', function() {
    const meme = memes[currentMemeIndex];
    hintElement.textContent = `Подсказка: "${meme.name.split(' ')[0]}"...`;
    setTimeout(() => {
        hintElement.textContent = "Скажи название мема";
    }, 3000);
});

document.getElementById('restart-btn').addEventListener('click', function() {
    score = 0;
    streak = 0;
    currentMemeIndex = 0;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    showMeme();
});

// Инициализация
if (memes.length === 0) {
    console.error("Добавь мемы в массив memes!");
} else {
    showMeme();
    console.log("Meme Master загружен!");
}

