// api/register.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let bodyData = '';

    // Чтение тела запроса
    req.on('data', chunk => {
        bodyData += chunk;
    });

    req.on('end', async () => {
        console.log('Полученные данные: ', bodyData); // Логируем тело запроса

        try {
            // Отправка запроса на внешний API для регистрации
            const response = await fetch('http://51.250.108.190:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Устанавливаем Content-Type
                },
                body: bodyData, // Передаем тело запроса
            });

            const data = await response.json(); // Получаем ответ от внешнего API
            console.log('Ответ внешнего API: ', data); // Логируем ответ

            if (!response.ok) {
                console.error('Ошибка с внешним API:', data);
                return res.status(response.status).json({ message: 'Ошибка регистрации через внешний API' });
            }

            // Прокси возвращает ответ от внешнего сервера
            res.status(response.status).json(data);

        } catch (error) {
            console.error('Ошибка прокси регистрации:', error);
            // Возвращаем ошибку, если что-то пошло не так
            res.status(500).json({ message: 'Ошибка регистрации через прокси' });
        }
    });
}
