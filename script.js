// База мемов с картинками (используем прямые ссылки на мемы)
const memes = [
    {
        id: 1,
        name: "distracted boyfriend",
        displayName: "Отвлечённый парень",
        image: "https://i.imgflip.com/1ur9b0.jpg",
        altNames: ["парень смотрит на другую", "измена", "смотрит на другую девушку"]
    },
    {
        id: 2,
        name: "two buttons",
        displayName: "Две кнопки",
        image: "https://i.imgflip.com/1g8my4.jpg",
        altNames: ["красная кнопка", "синяя кнопка", "выбор"]
    },
    {
        id: 3,
        name: "woman yelling at cat",
        displayName: "Женщина кричит на кота",
        image: "https://i.imgflip.com/1e4q1b.jpg",
        altNames: ["кот за столом", "злая женщина", "кот в смокинге"]
    },
    {
        id: 4,
        name: "drake hotline bling",
        displayName: "Дрейк",
        image: "https://i.imgflip.com/1h7in3.jpg",
        altNames: ["дрейк не нравится", "дрейк нравится", "хотлайн блинг"]
    },
    {
        id: 5,
        name: "change my mind",
        displayName: "Измени моё мнение",
        image: "https://i.imgflip.com/1e5q8v.jpg",
        altNames: ["студенческий стол", "стол с табличкой", "измените мое мнение"]
    }
];

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
const voiceIndicator = document.getElementById('voice-indicator');
const hintElement = document.getElementById('hint');
const memeContainer = document.getElementById('meme-container');
const hintOverlay = document.getElementById('hint-overlay');

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
    memeImage.classList.add('blurred');
    memeImage.classList.remove('revealed');
    memeName.textContent = '';
    memeName.classList.add('hidden');
    hintOverlay.textContent = '?';
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
        voiceIndicator.classList.add('active');
        hintElement.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        voiceIndicator.classList.remove('active');
        recognition = null;
    };

    recognition.start();
}

// Проверка ответа
function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    const correctNames = [meme.name, meme.displayName.toLowerCase(), ...meme.altNames];
    
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
        
        // Показываем результат
        const resultEl = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        const resultIcon = document.getElementById('result-icon');
        
        if (resultEl && resultText && resultIcon) {
            resultIcon.className = 'fas fa-check-circle';
            resultText.textContent = 'Верно! +10';
            resultText.style.color = '#4CAF50';
            resultEl.classList.remove('hidden');
        }
        
        // Раскрываем мем
        memeImage.classList.remove('blurred');
        memeImage.classList.add('revealed');
        memeName.textContent = meme.displayName;
        memeName.classList.remove('hidden');
        hintOverlay.textContent = '✓';
        
        // Звук
        if (soundsEnabled) {
            document.getElementById('correct-sound').play().catch(e => {});
        }
        
        // Конфетти при серии
        if (streak % 3 === 0) {
            showConfetti();
        }
        
        // Следующий мем через 2 секунды
        setTimeout(() => {
            nextMeme();
            if (resultEl) resultEl.classList.add('hidden');
        }, 2000);
        
    } else {
        // Неправильный ответ
        streak = 0;
        streakElement.textContent = streak;
        
        // Показываем результат
        const resultEl = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        const resultIcon = document.getElementById('result-icon');
        
        if (resultEl && resultText && resultIcon) {
            resultIcon.className = 'fas fa-times-circle';
            resultText.textContent = 'Не угадал';
            resultText.style.color = '#E94057';
            resultEl.classList.remove('hidden');
        }
        
        // Показываем правильный ответ
        memeName.textContent = meme.displayName;
        memeName.classList.remove('hidden');
        hintOverlay.textContent = '✗';
        
        // Звук
        if (soundsEnabled) {
            document.getElementById('wrong-sound').play().catch(e => {});
        }
        
        // Следующий мем через 3 секунды
        setTimeout(() => {
            nextMeme();
            if (resultEl) resultEl.classList.add('hidden');
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
        document.getElementById('win-sound').play().catch(e => {});
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
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 1,
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

// Обработчики событий
document.getElementById('speak-btn').addEventListener('click', startVoiceRecording);

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    showMeme();
});

document.getElementById('skip-btn').addEventListener('click', nextMeme);

document.getElementById('hint-btn').addEventListener('click', function() {
    const meme = memes[currentMemeIndex];
    hintElement.textContent = `Подсказка: "${meme.displayName.split(' ')[0]}"...`;
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
    
    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.classList.add('hidden');
});

// Инициализация
showMeme();
console.log("Meme Master загружен!");