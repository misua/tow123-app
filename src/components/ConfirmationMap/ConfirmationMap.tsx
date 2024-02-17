import { GoogleMap, Libraries, Marker, useJsApiLoader } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Loader } from '../Loader';
import styles from './confirmationMap.module.scss';
import useDebounce from '../../hooks/useDebounce';

const GOOGLE_MAP_API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

interface MapProps {
  address: string;
}
const libraries: Libraries = ['places'];

const ConfirmationMap: React.FC<MapProps> = ({ address }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries: libraries,
  });
  const [center, setCenter] = useState({ lat: 48.8584, lng: 2.2945 });
  const [flag, setFlag] = useState(false);

  useDebounce(
    async () => {
      if (isLoaded && address && address.trim()) {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            setCenter({ lat: lat(), lng: lng() });
          } else {
            console.error('Geocoding initial address failed with status:', status);
          }
        });
      }
    },
    [address, isLoaded],
    500
  );

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className={styles.loader}>
        <Loader />
      </div>
    );
  }

  if (!flag) {
    setTimeout(() => {
      setFlag(true);
    }, 0);
  }
  return (
    <div className={styles['container']}>
      <GoogleMap
        mapContainerClassName={styles['map-container']}
        center={center}
        zoom={13}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}>
        {flag && <Marker position={center} visible />}
      </GoogleMap>
    </div>
  );
};

export default ConfirmationMap;
