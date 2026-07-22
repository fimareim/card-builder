const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// 1. Генерация текста через Pollinations.ai (бесплатно, без ключа)
app.post('/api/generate-text', async (req, res) => {
    const { occasion, mood, recipient } = req.body;
    const prompt = `Напиши красивое, душевное поздравление или мотивационную фразу.
    Контекст: событие – ${occasion}, настроение – ${mood}, получатель – ${recipient}.
    Длина: 2-4 предложения. Только текст, без кавычек и лишних пояснений. Язык: русский.`;

    try {
        const textUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
        const response = await fetch(textUrl);
        const text = await response.text();
        res.json({ text: text.trim() });
    } catch (error) {
        console.error('Ошибка генерации текста:', error);
        res.status(500).json({ error: 'Ошибка генерации текста' });
    }
});

// 2. Генерация изображения через Pollinations.ai (проксирование)
app.get('/api/generate-image', async (req, res) => {
    const { description, style } = req.query;
    const imagePrompt = encodeURIComponent(
        `${description}, ${style}, beautiful composition, vibrant colors, digital art, high quality`
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true`;

    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        res.status(500).json({ error: 'Ошибка загрузки изображения' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер открыток работает на порту ${PORT}`);
});

