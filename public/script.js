const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Бесплатный ключ Gemini – хранится ТОЛЬКО на сервере
const GEMINI_API_KEY = process.env.GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 1) Генерация текста через Gemini
app.post('/api/generate-text', async (req, res) => {
    const { occasion, mood, recipient } = req.body;
    const prompt = `Напиши красивое, душевное поздравление или мотивационную фразу.
    Контекст: событие – ${occasion}, настроение – ${mood}, получатель – ${recipient}.
    Длина: 2-4 предложения. Только текст, без кавычек и лишних пояснений. Язык: русский.`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }]
            })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Ошибка генерации текста';
        res.json({ text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка генерации текста' });
    }
});

// 2) Генерация изображения через Pollinations.ai (проксирование)
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
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки изображения' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер открыток работает на порту ${PORT}`);
});

