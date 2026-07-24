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
const generateBtn = document.getElementById('generateBtn');
const loader = document.getElementById('loader');
const resultDiv = document.getElementById('result');
const emptyState = document.getElementById('emptyState');
const cardImage = document.getElementById('cardImage');
const cardText = document.getElementById('cardText');

generateBtn.addEventListener('click', async () => {
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

    // Блокируем кнопку и показываем загрузку
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация...';
    loader.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    emptyState.classList.add('hidden');

    try {
        // Параллельный запрос текста и картинки
        const textPromise = fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occasion, mood: style, recipient })
        }).then(res => {
            if (!res.ok) throw new Error('Ошибка сервера');
            return res.json();
        });

        const imagePromise = new Promise((resolve, reject) => {
            const url = `/api/generate-image?description=${encodeURIComponent(occasion)}&style=${encodeURIComponent(style)}`;
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('Не удалось загрузить картинку'));
            img.src = url;
        });

        const [textData, imageUrl] = await Promise.all([textPromise, imagePromise]);

        cardImage.src = imageUrl;
        cardText.textContent = textData.text;

        loader.classList.add('hidden');
        resultDiv.classList.remove('hidden');

        // Плавный скролл к результату
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Ошибка генерации:', error);
        alert('Что-то пошло не так. Попробуйте снова.');
        loader.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } finally {
        // Возвращаем кнопку в исходное состояние
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Сгенерировать открытку';
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
    resultDiv.classList.add('hidden');
    emptyState.classList.remove('hidden');
    cardImage.src = '';
});

