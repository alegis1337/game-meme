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

// Функция для безопасного получения элемента
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Элемент с id="${id}" не найден!`);
    }
    return element;
}

// Элементы с проверкой
const memeImage = getElement('meme-image');
const memeName = getElement('meme-name');
const scoreElement = getElement('score');
const streakElement = getElement('streak');
const hintElement = getElement('hint');
const gameScreen = getElement('game-screen');
const resultElement = getElement('result');
const resultText = getElement('result-text');

// Показать мем
function showMeme() {
    const meme = memes[currentMemeIndex];
    
    if (memeImage) {
        memeImage.src = meme.image;
    }
    
    if (memeName) {
        memeName.textContent = '';
        memeName.classList.add('hidden');
    }
    
    if (hintElement) {
        hintElement.textContent = "Скажи название мема";
    }
    
    // Скрываем результат если есть
    if (resultElement) {
        resultElement.classList.add('hidden');
    }
    
    // Сброс фона на обычный
    if (gameScreen) {
        gameScreen.classList.remove('green-bg', 'red-bg');
        gameScreen.classList.add('normal-bg');
    }
}

// Запуск распознавания
function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Используй Safari на iPhone для голосового ввода");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecording = true;
        if (hintElement) {
            hintElement.textContent = "Говори сейчас...";
        }
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

    recognition.onerror = (event) => {
        console.log("Ошибка (игнорируем):", event.error);
        isRecording = false;
        if (hintElement) {
            hintElement.textContent = "Скажи громче. Нажми 'ГОВОРИТЬ'";
        }
        recognition = null;
    };

    recognition.start();
}

// Проверка ответа
function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    const correctAnswers = [meme.name.toLowerCase(), ...meme.altNames.map(n => n.toLowerCase())];
    
    console.log("Правильные варианты:", correctAnswers);
    
    let isCorrect = false;
    
    // Простая проверка
    for (const correct of correctAnswers) {
        if (correct && spokenText.includes(correct)) {
            isCorrect = true;
            break;
        }
    }
    
    // Показываем результат
    if (resultElement) {
        resultElement.classList.remove('hidden');
    }
    
    if (isCorrect) {
        handleCorrectAnswer(meme);
    } else {
        handleWrongAnswer(meme);
    }
}

// Правильный ответ
function handleCorrectAnswer(meme) {
    // Обновляем счёт
    score += 10;
    streak++;
    
    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
    
    // ЗЕЛЕНЫЙ фон
    if (gameScreen) {
        gameScreen.classList.remove('normal-bg', 'red-bg');
        gameScreen.classList.add('green-bg');
    }
    
    // Текст результата
    if (resultText) {
        resultText.textContent = "✅ ПРАВИЛЬНО! +10 очков";
        resultText.style.color = "#4CAF50";
    }
    
    // Показываем название мема
    if (memeName) {
        memeName.textContent = meme.name;
        memeName.classList.remove('hidden');
    }
    
    // Конфетти при серии
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

// Неправильный ответ
function handleWrongAnswer(meme) {
    // Сбрасываем серию
    streak = 0;
    if (streakElement) streakElement.textContent = streak;
    
    // КРАСНЫЙ фон
    if (gameScreen) {
        gameScreen.classList.remove('normal-bg', 'green-bg');
        gameScreen.classList.add('red-bg');
    }
    
    // Текст результата
    if (resultText) {
        resultText.textContent = "❌ НЕПРАВИЛЬНО";
        resultText.style.color = "#E94057";
    }
    
    // Показываем правильный ответ
    if (memeName) {
        memeName.textContent = `Правильно: ${meme.name}`;
        memeName.classList.remove('hidden');
    }
    
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
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Бонус за серию
    score += 20;
    if (scoreElement) scoreElement.textContent = score;
    
    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 3,
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
    }, 3000);
}

// ======================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ======================

// Безопасная привязка обработчиков
function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Не могу привязать обработчик к id="${id}" - элемент не найден`);
    }
}

safeAddEventListener('speak-btn', 'click', startVoiceRecording);
safeAddEventListener('start-btn', 'click', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (startScreen) startScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    
    showMeme();
});
safeAddEventListener('skip-btn', 'click', nextMeme);
safeAddEventListener('hint-btn', 'click', function() {
    const meme = memes[currentMemeIndex];
    if (hintElement) {
        hintElement.textContent = `Подсказка: "${meme.name.split(' ')[0]}"...`;
        setTimeout(() => {
            if (hintElement) hintElement.textContent = "Скажи название мема";
        }, 3000);
    }
});
safeAddEventListener('restart-btn', 'click', function() {
    score = 0;
    streak = 0;
    currentMemeIndex = 0;
    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
    showMeme();
});

// Инициализация
if (memeImage && memes.length > 0) {
    showMeme();
    console.log("Игра загружена!");
} else {
    console.error("Ошибка загрузки игры!");
}
