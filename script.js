// ======================
// НАСТРОЙКА МЕМОВ
// ======================

const memes = [
    {
        id: 1,
        image: "memes/meme1.png",
        name: "о как",
        altNames: ["22"]
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
        altNames: ["умный человек в очках скачать обои"]
    },
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
        altNames: ["фейс", "смайлик", "улыбка"]
    },
    {
        id: 6,
        image: "memes/meme6.jpg",
        name: "солнышко",
        altNames: ["любимая девочка"]
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
            console.log("Звуки активированы");
            // Предзагрузка звуков
            preloadSounds();
        }).catch(e => {
            console.log("Не удалось активировать звуки");
        });
    }
});

// Предзагрузка звуков
function preloadSounds() {
    const sounds = ['correct', 'wrong', 'win'];
    sounds.forEach(sound => {
        const audio = new Audio(`sounds/${sound}.mp3`);
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(e => {});
    });
}

// Воспроизвести звук
function playSound(soundName) {
    if (!soundsEnabled) {
        console.log("Звуки не активированы");
        return;
    }
    
    try {
        const audio = new Audio(`sounds/${soundName}.mp3`);
        audio.volume = 0.7;
        audio.play().catch(e => {
            console.log("Ошибка воспроизведения:", soundName, e);
        });
    } catch (e) {
        console.log("Ошибка создания звука:", e);
    }
}

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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isRecording = true;
        hintElement.textContent = "Слушаю...";
        console.log("Запись начата");
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Вы сказали:", spokenText);
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        recognition = null;
        console.log("Запись завершена");
    };

    recognition.onerror = (event) => {
        console.log("Ошибка распознавания:", event.error);
        isRecording = false;
        hintElement.textContent = "Ошибка. Попробуй ещё раз";
    };

    try {
        recognition.start();
    } catch (e) {
        console.log("Ошибка при старте распознавания:", e);
    }
}

// Проверка ответа - ИСПРАВЛЕННАЯ
function checkAnswer(spokenText) {
    const meme = memes[currentMemeIndex];
    
    // Создаем массив всех допустимых ответов
    const correctAnswers = [
        meme.name.toLowerCase(),
        ...meme.altNames.map(name => name.toLowerCase())
    ].filter(name => name.trim() !== ''); // Убираем пустые строки
    
    console.log("Правильные варианты:", correctAnswers);
    console.log("Сказал пользователь:", spokenText);
    
    let isCorrect = false;
    
    // Проверяем каждый вариант
    for (const correctAnswer of correctAnswers) {
        // Проверяем, содержит ли сказанный текст правильный ответ
        if (spokenText.includes(correctAnswer)) {
            isCorrect = true;
            break;
        }
        
        // Также проверяем на частичное совпадение (для длинных фраз)
        const spokenWords = spokenText.split(' ');
        const correctWords = correctAnswer.split(' ');
        
        // Если хотя бы 2 слова совпадают, считаем правильным
        let matchingWords = 0;
        for (const word of spokenWords) {
            if (correctWords.includes(word) && word.length > 2) {
                matchingWords++;
            }
        }
        
        if (matchingWords >= 2 || (correctWords.length === 1 && spokenWords.includes(correctWords[0]))) {
            isCorrect = true;
            break;
        }
    }
    
    console.log("Результат проверки:", isCorrect ? "ПРАВИЛЬНО" : "НЕПРАВИЛЬНО");
    
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
        
        // Звук правильного ответа
        playSound('correct');
        
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
        
    } else {
        // Неправильный ответ
        streak = 0;
        streakElement.textContent = streak;
        
        // Показываем правильный ответ
        memeName.textContent = `Правильно: ${meme.name}`;
        memeName.classList.remove('hidden');
        hintElement.textContent = "Попробуй ещё!";
        
        // Звук ошибки
        playSound('wrong');
        
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
    // Победный звук
    playSound('win');
    
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Бонус за серию
    score += 20;
    scoreElement.textContent = score;
    hintElement.textContent = `СЕРИЯ ${streak}! +20 бонус`;
    
    // Создаем частицы
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
    // Активируем звуки при первом нажатии
    if (!soundsEnabled) {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        silentAudio.volume = 0.01;
        silentAudio.play().then(() => {
            soundsEnabled = true;
            preloadSounds();
            // Запускаем запись после активации звуков
            startVoiceRecording();
        }).catch(e => {
            startVoiceRecording(); // Все равно запускаем запись
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
if (memes.length === 0) {
    console.error("Добавь мемы в массив memes!");
} else {
    showMeme();
    console.log("Meme Master загружен! Мемов:", memes.length);
}
