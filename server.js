
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

async function fetchWithTimeout(url, options = {}, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// 1. Генерация текста
app.post('/api/generate-text', async (req, res) => {
    const { occasion, recipient } = req.body;
    const prompt = `Напиши красивое, душевное поздравление или мотивационную фразу.
    Контекст: событие – ${occasion}, получатель – ${recipient}.
    Длина: 2-4 предложения. Только текст, без кавычек и лишних пояснений. Язык: русский.`;

    console.log('🟡 Запрос текста:', prompt.substring(0, 80));

    try {
        const textUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Math.random()}`;
        const response = await fetchWithTimeout(textUrl, {}, 20000);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const text = await response.text();
        console.log('✅ Текст:', text.substring(0, 60));
        res.json({ text: text.trim() });
    } catch (error) {
        console.error('❌ Ошибка текста:', error.message);
        const fallbackText = `Дорогой ${recipient}, пусть этот день принесёт тебе радость, вдохновение и море улыбок. Ты заслуживаешь самого лучшего!`;
        res.json({ text: fallbackText, fallback: true });
    }
});

// 2. Генерация изображения
app.get('/api/generate-image', async (req, res) => {
    const { description, style } = req.query;
    const imagePrompt = encodeURIComponent(
        `${description}, in the style of ${style}, high quality digital art`
    );
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

    console.log('🟡 Изображение (seed=' + seed + '):', imageUrl.substring(0, 120));

    try {
        const response = await fetchWithTimeout(imageUrl, {}, 25000);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const buffer = await response.arrayBuffer();
        console.log('✅ Изображение, размер:', buffer.byteLength);
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('❌ Ошибка изображения:', error.message);
        const fallbackUrl = 'https://picsum.photos/1024/1024';
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackBuffer = await fallbackResponse.arrayBuffer();
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(fallbackBuffer));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер открыток запущен на порту ${PORT}`);
});
