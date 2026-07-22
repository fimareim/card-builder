// Частицы на фоне
function createParticles() {
    const container = document.getElementById('particles');
    const numParticles = 50;
    for (let i = 0; i < numParticles; i++) {
        const dot = document.createElement('div');
        dot.classList.add('particle-dot');
        const size = Math.random() * 4 + 2;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.animationDuration = `${Math.random() * 10 + 10}s`;
        dot.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(dot);
    }
}
createParticles();

// Переключение видимости кастомного поля
document.getElementById('type').addEventListener('change', function () {
    document.getElementById('customGroup').style.display = this.value === 'custom' ? 'block' : 'none';
});

// Генерация открытки
document.getElementById('generateBtn').addEventListener('click', async () => {
    const type = document.getElementById('type').value;
    const style = document.getElementById('style').value;
    const recipient = document.getElementById('recipient').value.trim() || 'Дорогой человек';
    const customText = document.getElementById('customText').value.trim();
    const occasion = type === 'custom' ? customText : {
        birthday: 'День рождения',
        motivation: 'Мотивация и успех',
        love: 'Любовь и нежность',
        thanks: 'Благодарность'
    }[type];

    if (type === 'custom' && !customText) {
        alert('Пожалуйста, введите свой вариант повода');
        return;
    }

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');

    try {
        // Текст
        const textRes = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occasion, mood: style, recipient })
        });
        const { text } = await textRes.json();

        // Картинка
        const imageUrl = `/api/generate-image?description=${encodeURIComponent(occasion)}&style=${encodeURIComponent(style)}`;

        document.getElementById('cardImage').src = imageUrl;
        document.getElementById('cardText').textContent = text;
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('result').classList.remove('hidden');

        // Плавный скролл к результату
        document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        alert('Ошибка генерации. Попробуйте ещё раз.');
        document.getElementById('loader').classList.add('hidden');
    }
});

// Скачивание
document.getElementById('downloadBtn').addEventListener('click', function () {
    const card = document.getElementById('cardToDownload');
    html2canvas(card, { scale: 2, backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'artheart-otkrytka.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

// Кнопка "Новая открытка"
document.getElementById('newCardBtn').addEventListener('click', function () {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    // Сброс изображения, чтобы не грузить память
    document.getElementById('cardImage').src = '';
});});



