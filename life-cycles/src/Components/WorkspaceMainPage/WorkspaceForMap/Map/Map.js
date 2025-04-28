import { useMemo } from 'react';
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

  // Проверка: если координат вообще нет или все нулевые — НЕ показываем карту
  const hasValidCoords = allCoords.length > 0 && !allCoords.every(
    ([lat, lng]) => lat === 0 && lng === 0
  );

  if (!hasValidCoords) {
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
