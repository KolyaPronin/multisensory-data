// api/proxy.js

export default async function handler(req, res) {
    const { method, query, body, headers } = req;
  
    // Указываем адрес твоего сервера
    const serverUrl = 'http://51.250.108.190:8080/api/users/get'; // Пример URL твоего сервера
  
    try {
      // Выполняем запрос к твоему серверу
      const response = await fetch(serverUrl, {
        method: method, // Прокси-метод (например, GET или POST)
        headers: {
          'Content-Type': 'application/json',
          ...headers, // Можно передавать другие заголовки из запроса
        },
        body: method === 'POST' ? JSON.stringify(body) : null, // Передаем тело запроса, если это POST
      });
  
      // Проверяем, если ответ от сервера не успешен
      if (!response.ok) {
        return res.status(response.status).json({ message: 'Error from backend' });
      }
  
      // Получаем ответ от сервера
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error during fetch:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  