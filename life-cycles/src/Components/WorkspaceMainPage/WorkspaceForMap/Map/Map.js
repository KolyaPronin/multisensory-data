import { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';
import { useSelector } from 'react-redux';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function Map() {
  const rawCoordinates = useSelector((state) => state.changebleLifeData.coordinates);
  const currentTimestamp = useSelector((state) => state.time.time);
  const mapRef = useRef(null); // Реф для управления картой

  // Сортировка координат
  const sorted = useMemo(() => {
    if (!Array.isArray(rawCoordinates)) return [];
    return [...rawCoordinates].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [rawCoordinates]);

  const allCoords = useMemo(() => sorted.map((o) => o.coords), [sorted]);

  // Находим текущую позицию (если нет точного совпадения — берём последнюю доступную)
  const currentEntry = useMemo(() => {
    if (!sorted.length) return null;
    const exactMatch = sorted.find((o) => o.timestamp === currentTimestamp);
    return exactMatch || sorted.filter((o) => new Date(o.timestamp) <= new Date(currentTimestamp)).slice(-1)[0];
  }, [sorted, currentTimestamp]);

  const currentPosition = currentEntry?.coords || null;

  // Пройденный путь
  const traveledPath = useMemo(
    () => sorted.filter((o) => new Date(o.timestamp) <= new Date(currentTimestamp)).map((o) => o.coords),
    [sorted, currentTimestamp]
  );

  // Границы карты
  const mapBounds = useMemo(() => {
    if (!allCoords.length) return null;
    return allCoords.reduce((bounds, coord) => bounds.extend(coord), L.latLngBounds(allCoords[0], allCoords[0]));
  }, [allCoords]);

  // Центрируем карту при изменении currentPosition
  useEffect(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.flyTo(currentPosition, mapRef.current.getZoom(), {
        duration: 0.5, // Плавность анимации (в секундах)
        easeLinearity: 0.25 // Параметр плавности
      });
    }
  }, [currentPosition]);

  if (!allCoords.length) {
    return (
      <div className={styles.container}>
        <h3>Нет данных для отображения</h3>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MapContainer
        center={currentPosition || allCoords[0]}
        zoom={18}
        minZoom={15}  // Минимальный зум
        maxZoom={20}  // Максимальный зум
        style={{ width: '100%', height: '100%' }}
        bounds={mapBounds}
        maxBounds={mapBounds?.pad(0.5)}
        whenCreated={(map) => (mapRef.current = map)} // Сохраняем инстанс карты в реф
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Polyline
          positions={traveledPath}
          color="#1890ff"
          weight={6}
          opacity={0.8}
          lineCap="round"
        />

        {currentPosition && (
          <Marker position={currentPosition} icon={defaultIcon}>
            <Popup>Время: {currentTimestamp}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}