import { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';
import { useSelector } from 'react-redux';

// Стандартный маркер для таймлайна
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Флажок для пользователя
const flagIcon = L.divIcon({
  html: '🚩',
  iconSize: [24, 24],
  className: ''
});

export function Map() {
  const rawCoordinates = useSelector((state) => state.changebleLifeData.coordinates);
  const currentTimestamp = useSelector((state) => state.time.time);

  const [userPosition, setUserPosition] = useState(null);

  // Запрашиваем текущее положение пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          setUserPosition([coords.latitude, coords.longitude]);
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Сортировка координат по времени
  const sorted = useMemo(() => {
    if (!Array.isArray(rawCoordinates)) return [];
    return [...rawCoordinates].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [rawCoordinates]);

  const allCoords = useMemo(() => sorted.map((o) => o.coords), [sorted]);

  const currentEntry = useMemo(
    () => sorted.find((o) => o.timestamp === currentTimestamp),
    [sorted, currentTimestamp]
  );
  const currentPosition = currentEntry?.coords || null;

  const traveledPath = useMemo(
    () => sorted.filter((o) => new Date(o.timestamp) <= new Date(currentTimestamp)).map((o) => o.coords),
    [sorted, currentTimestamp]
  );

  const mapBounds = useMemo(() => {
    if (!allCoords.length) return null;
    return allCoords.reduce(
      (bounds, coord) => bounds.extend(coord),
      L.latLngBounds(allCoords[0], allCoords[0])
    );
  }, [allCoords]);

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
        minZoom={17}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        bounds={mapBounds}
        maxBounds={mapBounds?.pad(0.5)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Отрисовка пройденного пути */}
        <Polyline
          positions={traveledPath}
          color="#1890ff"
          weight={6}
          opacity={0.8}
          lineCap="round"
        />

        {/* Метка текущего положения таймлайна */}
        {currentPosition && (
          <Marker position={currentPosition} icon={defaultIcon}>
            <Popup>Время: {currentTimestamp}</Popup>
          </Marker>
        )}

        {/* Метка местоположения пользователя */}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={flagIcon}>
              <Popup>Вы здесь</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
