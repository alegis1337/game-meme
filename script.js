// ======================
// НАСТРОЙКА МЕМОВ
// ======================

const memes = [
    {
        id: 1,
        image: "memes/meme1.png",
        name: "о как",
        altNames: ["ох", "ух ты"]
    },
    {
        id: 2,
        image: "memes/meme2.png",
        name: "смерть в нищите",
        altNames: ["смерть", "бедность", "нищета"]
    },
    {
        id: 3,
        image: "memes/meme3.png",
        name: "умный человек в очках",
        altNames: ["умный", "очки", "интеллектуал"]
    },
    {
        id: 4,
        image: "memes/meme4.png",
        name: "шлепа",
        altNames: ["большой шлепа", "медвежонок", "плюшевый"]
    },
    {
        id: 5,
        image: "memes/meme5.png",
        name: "смайл фейс",
        altNames: ["фейс", "смайлик", "улыбка"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "солнышко",
        altNames: ["любимая девочка", "милая", "девочка"]
    }
];

// ======================
// ИГРОВАЯ ЛОГИКА
// ======================

let currentMemeIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null;

// Элементы
const memeImage = document.getElementById('meme-image');
const memeName = document.getElementById('meme-name');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const hintElement = document.getElementById('hint');
const memeContainer = document.getElementById('meme-container');

// Звуковые элементы
let correctSound, wrongSound, winSound;

// Инициализация звуков
function initSounds() {
    correctSound = new Audio('sounds/correct.mp3');
    wrongSound = new Audio('sounds/wrong.mp3');
    winSound = new Audio('sounds/win.mp3');
    
    // Настройка звуков
    [correctSound, wrongSound, winSound].forEach(sound => {
        sound.volume = 0.7;
        sound.preload = 'auto';
    });
}

// Воспроизвести звук
function playSound(soundElement) {
    try {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {
            console.log("Звук не воспроизвелся, но это нормально для iOS");
        });
    } catch (e) {
        console.log("Ошибка звука:", e);
    }
}

// Показать мем
function showMeme() {
    const meme = memes[currentMemeIndex];
    memeImage.src = meme.image;
    memeName.textContent = '';
    memeName.classList.add('hidden');
    hintElement.textContent = "Скажи название мема";
    
    // Сброс стилей контейнера
    memeContainer.classList.remove('correct', 'wrong');
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
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        hintElement.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Вы сказали:", spokenText);
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
    
    // Создаем массив всех допустимых ответов
    const correctAnswers = [
        meme.name.toLowerCase(),
        ...meme.altNames.map(name => name.toLowerCase())
    ].filter(name => name.trim() !== '');
    
    console.log("Правильные варианты:", correctAnswers);
    
    let isCorrect = false;
    
    // Упрощенная проверка
    for (const correctAnswer of correctAnswers) {
        if (correctAnswer && spokenText.includes(correctAnswer)) {
            isCorrect = true;
            break;
        }
    }
    
    console.log("Результат:", isCorrect ? "ПРАВИЛЬНО" : "НЕПРАВИЛЬНО");
    
    if (isCorrect) {
        handleCorrectAnswer(meme);
    } else {
        handleWrongAnswer(meme);
    }
}

// Обработка правильного ответа
function handleCorrectAnswer(meme) {
    // Обновляем счет
    score += 10;
    streak++;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    // Визуальный фидбек - ЗЕЛЕНЫЙ
    memeContainer.classList.add('correct');
    memeContainer.classList.remove('wrong');
    
    // Показываем название мема
    memeName.textContent = `✅ ${meme.name}`;
    memeName.classList.remove('hidden');
    hintElement.textContent = "Правильно! +10 очков";
    
    // Звук правильного ответа
    if (correctSound) playSound(correctSound);
    
    // Конфетти при серии из 3
    if (streak % 3 === 0) {
        setTimeout(() => {
            showConfetti();
        }, 500);
    }
    
    // Следующий мем через 2 секунды
    setTimeout(() => {
        nextMeme();
    }, 2000);
}

// Обработка неправильного ответа
function handleWrongAnswer(meme) {
    // Сбрасываем серию
    streak = 0;
    streakElement.textContent = streak;
    
    // Визуальный фидбек - КРАСНЫЙ
    memeContainer.classList.add('wrong');
    memeContainer.classList.remove('correct');
    
    // Показываем правильный ответ
    memeName.textContent = `❌ Правильно: ${meme.name}`;
    memeName.classList.remove('hidden');
    hintElement.textContent = "Попробуй ещё!";
    
    // Звук ошибки
    if (wrongSound) playSound(wrongSound);
    
    // Следующий мем через 3 секунды
    setTimeout(() => {
        nextMeme();
    }, 3000);
}

// Следующий мем
function nextMeme() {
    currentMemeIndex = (currentMemeIndex + 1) % memes.length;
    showMeme();
}

// Конфетти
function showConfetti() {
    // Победный звук
    if (winSound) playSound(winSound);
    
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Бонус за серию
    score += 20;
    scoreElement.textContent = score;
    hintElement.textContent = `🔥 СЕРИЯ ${streak}! +20 бонус`;
    
    // Создаем частицы
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
    
    // Останавливаем через 3 секунды
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hintElement.textContent = "Скажи название мема";
    }, 3000);
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

document.getElementById('speak-btn').addEventListener('click', function() {
    // Простая активация звуков - воспроизводим тихий звук при первом клике
    if (!correctSound) {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        silentAudio.volume = 0.001;
        silentAudio.play().then(() => {
            initSounds(); // Инициализируем звуки после активации
            startVoiceRecording();
        }).catch(e => {
            initSounds(); // Все равно инициализируем
            startVoiceRecording();
        });
    } else {
        startVoiceRecording();
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    showMeme();
});

document.getElementById('skip-btn').addEventListener('click', nextMeme);

document.getElementById('hint-btn').addEventListener('click', function() {
    const meme = memes[currentMemeIndex];
    const firstWord = meme.name.split(' ')[0];
    hintElement.textContent = `Подсказка: "${firstWord}"...`;
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
initSounds();
showMeme();
console.log("Meme Master загружен! Мемов:", memes.length);
