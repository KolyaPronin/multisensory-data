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
  const mapRef = useRef(null);

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

  // Центрируем карту при изменении currentPosition (ГАРАНТИРОВАННО)
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    const map = mapRef.current;
    const currentZoom = map.getZoom();
    
    // Жёстко центрируем карту на метке (без анимации, если нужно мгновенно)
    map.setView(currentPosition, currentZoom, { animate: true, duration: 0.5 });

    // Либо: плавный flyTo (если предпочтительнее)
    // map.flyTo(currentPosition, currentZoom, { duration: 0.5 });

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
        minZoom={3}  // Можно уменьшать сильнее
        maxZoom={25} // Можно увеличивать сильнее
        style={{ width: '100%', height: '100%' }}
        whenCreated={(map) => (mapRef.current = map)}
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