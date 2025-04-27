import { useState } from "react";
import { ButtonAcceptForm } from "../ButtonAcceptForm/ButtonAcceptForm";
import { FieldForInput } from "../FieldForInput/FieldForInput";
import { FieldForInputPassword } from "../FieldForInputPassword/FieldForInputPassword";
import styles from "./RegistrationForm.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { loginSuccessAddToken, loginSuccessAddUsername } from "../../../Store/Slices/UserSlice";

// Регистрационная форма
export function RegistrationForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDisabled = login === "" || password === "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Проверка совпадения паролей
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      setLoading(false);
      return;
    }

    // Адрес для регистрации
    const url = "/api/register"; 

    // Формируем тело запроса
    const requestBody = new URLSearchParams();
    requestBody.append("username", login);
    requestBody.append("password", password);

    try {
      // Отправка запроса на регистрацию
      const response = await axios.post(url, requestBody.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Тип контента
        },
      });

      // Логируем успешный ответ
      console.log('Ответ сервера регистрации: ', response.data);

      // При успешной регистрации сохраняем токен в Redux и локальном хранилище
      dispatch(loginSuccessAddToken(response.data.accessToken));
      dispatch(loginSuccessAddUsername(login));
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Редирект на главную страницу
      navigate("/home");

    } catch (error) {
      console.error('Ошибка при регистрации:', error); // Логируем ошибку
      // Обработка ошибок
      if (error.response) {
        setError(error.response.data.message || "Не удалось создать пользователя.");
      } else if (error.request) {
        setError("Сервер не отвечает. Попробуйте позже.");
      } else {
        setError("Ошибка: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.text}>Заполните форму для регистрации.</div>
      <FieldForInput signField="Логин" type="text" login={login} setLogin={setLogin} />
      <FieldForInputPassword
        signField="Пароль"
        password={password}
        setPassword={setPassword}
      />
      <FieldForInputPassword
        signField="Подтвердите пароль"
        password={passwordConfirm}
        setPassword={setPasswordConfirm}
      />
      {error && <div className={styles.error}>{error}</div>}
      <ButtonAcceptForm
        type="submit"
        text={loading ? "Загрузка..." : "Подтвердить регистрацию"}
        isDisabled={isDisabled}
      />
    </form>
  );
}
