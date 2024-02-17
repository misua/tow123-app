import React, { useRef, useState } from 'react';
import styles from './map.module.scss';

import { useJsApiLoader, GoogleMap, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import Location from '../../assets/svg/Location';
import useDebounce from '../../hooks/useDebounce';
import { Loader } from '../Loader';

const GOOGLE_MAP_API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

interface MapProps {
  address: string;
  setAddress: (address: string) => void;
}

const libraries: Libraries = ['places'];

const Map: React.FC<MapProps> = ({ address, setAddress }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries: libraries,
  });
  const [center, setCenter] = useState({ lat: 48.8584, lng: 2.2945 });
  const [flag, setFlag] = useState(false);
  const originRef = useRef<HTMLInputElement>(null);

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

  const handlePlaceChange = () => {
    setFlag(false);

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: originRef.current?.value }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        setCenter({ lat: lat(), lng: lng() });
        setTimeout(() => {
          setFlag(true);
        }, 0);

        // Reverse geocode to get the address
        geocoder.geocode(
          { location: { lat: lat(), lng: lng() } },
          (addressResults, addressStatus) => {
            if (addressStatus === 'OK' && addressResults && addressResults.length > 0) {
              setAddress(addressResults[0].formatted_address);
            } else {
              console.error('Reverse geocoding failed with status:', addressStatus);
            }
          }
        );
      } else {
        console.error('Geocoding failed with status:', status);
      }
    });
  };

  const handleLiveLocation = () => {
    console.log('trying to fetch live location (will set center to live location)');
    navigator.geolocation.getCurrentPosition((position) => {
      const geocoder = new window.google.maps.Geocoder();
      setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });

      setTimeout(() => {
        setFlag(true);
      }, 0);

      geocoder.geocode(
        { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
        (addressResults, addressStatus) => {
          if (addressStatus === 'OK' && addressResults && addressResults.length > 0) {
            setAddress(addressResults[0].formatted_address);
            console.log(addressResults[0].formatted_address);
          } else {
            console.error('Reverse geocoding failed with status:', addressStatus);
          }
        }
      );
    });
  };

  const handleMapDragEnd = (map: google.maps.Map) => {
    const newCenter = map.getCenter();
    const geocoder = new window.google.maps.Geocoder();

    if (newCenter) {
      setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });

      setTimeout(() => {
        setFlag(true);
      }, 0);

      geocoder.geocode(
        { location: { lat: newCenter.lat(), lng: newCenter.lng() } },
        (addressResults, addressStatus) => {
          if (addressStatus === 'OK' && addressResults && addressResults.length > 0) {
            setAddress(addressResults[0].formatted_address);
          } else {
            console.error('Reverse geocoding failed with status:', addressStatus);
          }
        }
      );
    }
  };
  const handleMapZoomEnd = (map: google.maps.Map) => {
    const newCenter = map.getCenter();
    const geocoder = new window.google.maps.Geocoder();

    if (newCenter) {
      setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });

      setTimeout(() => {
        setFlag(true);
      }, 0);

      geocoder.geocode(
        { location: { lat: newCenter.lat(), lng: newCenter.lng() } },
        (addressResults, addressStatus) => {
          if (addressStatus === 'OK' && addressResults && addressResults.length > 0) {
            setAddress(addressResults[0].formatted_address);
          } else {
            console.error('Reverse geocoding failed with status:', addressStatus);
          }
        }
      );
    }
  };

  return (
    <div className={styles['container']}>
      <div className={styles['input-container']}>
        <Autocomplete onPlaceChanged={handlePlaceChange}>
          <input
            className={styles['map-input']}
            type="text"
            ref={originRef}
            value={address}
            onChange={(e) => {
              setAddress(e.currentTarget.value);
            }}
          />
        </Autocomplete>
        <div className={styles['svg-container']} onClick={handleLiveLocation}>
          <Location />
        </div>
      </div>
      <div className={styles['map-or']}>Or Share Current Location</div>
      <GoogleMap
        mapContainerClassName={styles['map-container']}
        center={center}
        zoom={13}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => {
          map.addListener('dragend', () => handleMapDragEnd(map));
          map.addListener('zoom_changed', () => handleMapZoomEnd(map));
        }}>
        {flag && <Marker position={center} visible />}
      </GoogleMap>
    </div>
  );
};

export default Map;
