
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Утилита fetch с таймаутом (используем AbortController)
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

// 1. Генерация текста (Pollinations.ai с запасным вариантом)
app.post('/api/generate-text', async (req, res) => {
    const { occasion, mood, recipient } = req.body;
    const prompt = `Напиши красивое, душевное поздравление или мотивационную фразу.
    Контекст: событие – ${occasion}, настроение – ${mood}, получатель – ${recipient}.
    Длина: 2-4 предложения. Только текст, без кавычек и лишних пояснений. Язык: русский.`;

    console.log('🟡 Запрос текста с промптом:', prompt.substring(0, 80));

    try {
        const textUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
        console.log('🔗 URL текста:', textUrl);
        const response = await fetchWithTimeout(textUrl, {}, 20000);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const text = await response.text();
        console.log('✅ Получен текст:', text.substring(0, 60));
        res.json({ text: text.trim() });
    } catch (error) {
        console.error('❌ Ошибка генерации текста:', error.message);
        // Возвращаем запасной текст, чтобы не ломать интерфейс
        const fallbackText = `Дорогой ${recipient}, пусть этот день принесёт тебе радость, вдохновение и море улыбок. Ты заслуживаешь самого лучшего!`;
        res.json({ text: fallbackText, fallback: true });
    }
});

// 2. Генерация изображения (Pollinations.ai)
app.get('/api/generate-image', async (req, res) => {
    const { description, style } = req.query;
    const imagePrompt = encodeURIComponent(
        `${description}, ${style}, beautiful composition, vibrant colors, digital art, high quality`
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true`;

    console.log('🟡 Запрос изображения:', imageUrl.substring(0, 100));

    try {
        const response = await fetchWithTimeout(imageUrl, {}, 25000);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const buffer = await response.arrayBuffer();
        console.log('✅ Изображение получено, размер:', buffer.byteLength);
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('❌ Ошибка загрузки изображения:', error.message);
        // Отдаём заглушку – красивую картинку с picsum (бесплатно)
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

