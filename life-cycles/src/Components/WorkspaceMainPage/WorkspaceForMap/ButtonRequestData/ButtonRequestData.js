import styles from './ButtonRequestData.module.css';
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addData, loginSuccessAddToken } from '../../../../Store/Slices/UserSlice';
import { refreshToken } from "../../../EntranceForm/LoginForm/authService";

export function ButtonRequestData() {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const tokenFromStore = useSelector((state) => state.user.tokenAuthorization);
  
  const dateStr = "2024-12-17 19:29:15";
  const date = new Date(dateStr + " UTC");
  const timestamp = Math.floor(date.getTime() / 1000);

  const requestData = async () => {
    let token = tokenFromStore;
    if (!token) {
      // Попробовать достать токен из localStorage
      const savedToken = localStorage.getItem("accessToken");
      if (savedToken) {
        token = savedToken;
        dispatch(loginSuccessAddToken(savedToken)); // Вернуть токен в redux
      } else {
        setError("Токен отсутствует. Пожалуйста, авторизуйтесь заново.");
        return;
      }
    }

    const url = `http://localhost:8080/api/users/get-data?timestamp=${timestamp}`;

    try {
      const response = await axios.post(url, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        dispatch(addData(response.data));
      } else {
        setError(`Ошибка: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.message || "Ошибка при получении данных"
        );
      } else if (error.request) {
        setError("Сервер не отвечает. Попробуйте позже.");
      } else {
        setError("Ошибка: " + error.message);
      }
    }
  };

  return (
    <button className={styles.button} onClick={requestData}>
      <div className={styles.text}>Загрузить данные</div>
      {error && <div className={styles.error}>{error}</div>}
    </button>
  );
}
