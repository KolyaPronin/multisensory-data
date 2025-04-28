import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function FlyToCurrentPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}
