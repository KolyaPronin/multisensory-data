import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import styles from './InformationBlock.module.css';

export function InformationBlock() {
  const stepsData = useSelector(s => s.changebleLifeData.steps);
  const notificationsData = useSelector(s => s.changebleLifeData.notifications);
  const heartbeatData = useSelector(s => s.changebleLifeData.heartbeat);
  const currentTimestamp = useSelector(s => s.time.time);

  const [currentSteps, setCurrentSteps] = useState("Нет данных");
  const [currentNotif, setCurrentNotif] = useState("Нет данных");
  const [currentBeat, setCurrentBeat] = useState("Нет данных");

  // Функция для поиска шагов по timestamp
  const findByTimestamp = (arr, timestamp) => {
    return Array.isArray(arr)
      ? arr.find(item => new Date(item.timestamp).getTime() === new Date(timestamp).getTime())
      : null;
  };

  useEffect(() => {
    //console.log("currentTimestamp:", currentTimestamp); // Логируем текущий таймштамп

    // Преобразуем currentTimestamp в Date объект для правильного сравнения
    const currentStepData = findByTimestamp(stepsData, currentTimestamp);
    const currentNotifData = findByTimestamp(notificationsData, currentTimestamp);
    const currentBeatData = findByTimestamp(heartbeatData, currentTimestamp);

    //console.log("Шаги для текущего времени:", currentStepData); // Логируем найденные данные для шагов

    // Если данные найдены, обновляем состояние
    setCurrentSteps(currentStepData ? currentStepData.value : "Нет данных");
    setCurrentNotif(currentNotifData ? currentNotifData.value : "Нет данных");
    setCurrentBeat(currentBeatData ? currentBeatData.value : "Нет данных");

  }, [currentTimestamp, stepsData, notificationsData, heartbeatData]); // Обновляем при изменении currentTimestamp

  // Форматирование числовых значений
  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerDataContainer}>Информация</div>
      <div className={styles.cardsWrapper}>
        {/* Карточка с шагами */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>👣 Шаги</p>
          <p className={styles.cardValue}>
            {formatValue(currentSteps)}
          </p>
        </div>

        {/* Карточка с пульсом */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>💓 Пульс</p>
          <p className={styles.cardValue}>
            {typeof currentBeat === "number" ? `${currentBeat} уд/мин` : currentBeat}
          </p>
        </div>

        {/* Карточка с уведомлением */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>🔔 Уведомление</p>
          <p className={styles.cardValue}>
            {formatValue(currentNotif)}
          </p>
        </div>
      </div>
    </div>
  );
}
