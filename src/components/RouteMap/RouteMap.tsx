import React, { useRef, useState } from 'react';
import styles from './routeMap.module.scss';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  Libraries,
} from '@react-google-maps/api';
import { Loader } from '../Loader';
import Location from '../../assets/svg/Location';
import { Button } from '../Button';
import { toast } from 'react-toastify';
const GOOGLE_MAP_API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

interface RouteMapProps {
  origin: string;
  destination: string;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  distance: number;
  setDistance: (distance: number) => void;
}

const libraries: Libraries = ['places'];

const RouteMap: React.FC<RouteMapProps> = ({
  origin,
  destination,
  setOrigin,
  setDestination,
  distance,
  setDistance,
}) => {
  const [flag, setFlag] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(
    null
  );
  const [duration, setDuration] = useState('');
  const [workingField, setWorkingField] = useState<string>('origin');
  const [showMarker, setShowMarker] = useState<boolean>(false);
  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef<HTMLInputElement>(null);
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef<HTMLInputElement>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries: libraries,
  });
  const [center, setCenter] = useState({ lat: 48.8584, lng: 2.2945 });

  if (!flag) {
    setTimeout(() => {
      setFlag(true);
    }, 300);
  }

  async function calculateRoute() {
    setShowMarker(false);
    if (originRef.current && destinationRef.current) {
      if (originRef.current.value === '' || destinationRef.current.value === '') {
        toast.error('Please provide proper locations');
        return;
      }
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      });
      setOrigin(originRef.current.value);
      setDestination(destinationRef.current.value);
      setDirectionsResponse(results);
      if (
        results.routes &&
        results.routes.length > 0 &&
        results.routes[0].legs &&
        results.routes[0].legs.length > 0 &&
        results.routes[0].legs[0].distance &&
        results.routes[0].legs[0].duration
      ) {
        setDistance(parseFloat(results.routes[0].legs[0].distance.text));
        setDuration(results.routes[0].legs[0].duration.text);
      } else {
        setDistance(0);
        setDuration('');
      }
    }
  }

  const positionMarker = (address: string | undefined) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        setCenter({ lat: lat(), lng: lng() });
        setTimeout(() => {
          setFlag(true);
        }, 0);
      } else {
        console.error('Geocoding failed with status:', status);
      }
    });
  };

  const handleLiveLocation = (name: string) => {
    if (originRef.current && destinationRef.current && directionsResponse) {
      toast.error('please clear route before providing new locations');
      return;
    }
    console.log('trying to fetch live location (will set center to live location)');
    navigator.geolocation.getCurrentPosition((position) => {
      const geocoder = new window.google.maps.Geocoder();
      setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      setShowMarker(true);
      setTimeout(() => {
        setFlag(true);
      }, 0);

      geocoder.geocode(
        { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
        (addressResults, addressStatus) => {
          if (addressStatus === 'OK' && addressResults && addressResults.length > 0) {
            if (name === 'origin' && originRef.current) {
              originRef.current.value = addressResults[0].formatted_address;
            }
            if (name === 'destination' && destinationRef.current) {
              destinationRef.current.value = addressResults[0].formatted_address;
            }
          } else {
            console.error('Reverse geocoding failed with status:', addressStatus);
          }
        }
      );
    });
  };

  const handleMapClick = (event: any) => {
    const clickedLatLng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    if (originRef.current && destinationRef.current && directionsResponse) {
      toast.error('please clear route before providing new locations');
      return;
    }
    setCenter(clickedLatLng);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: clickedLatLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        if (workingField === 'origin' && originRef.current) {
          originRef.current.value = address;
          setOrigin(address);
        }
        if (workingField === 'destination' && destinationRef.current) {
          destinationRef.current.value = address;
          setDestination(address);
        }
      }
    });
    setShowMarker(true);
  };

  const handlePlaceChange = (address: string | undefined, name: string) => {
    setShowMarker(true);
    positionMarker(address);
    if (address) {
      if (name === 'origin') {
        setOrigin(address);
      } else if (name === 'destination') {
        setDestination(address);
      }
    }
  };

  const handleSelected = (name: string) => {
    setWorkingField(name);
    if (originRef.current && destinationRef.current && directionsResponse) {
      toast.error('please clear route before providing new locations');
      if (name === 'origin') originRef.current.disabled = true;
      if (name === 'destination') destinationRef.current.disabled = true;
      return;
    }
    if (name === 'origin') {
      if (originRef.current?.value) {
        setShowMarker(true);
        positionMarker(originRef.current?.value);
      } else {
        setShowMarker(false);
      }
    }
    if (name === 'destination') {
      if (destinationRef.current?.value) {
        setShowMarker(true);
        positionMarker(destinationRef.current?.value);
      } else {
        setShowMarker(false);
      }
    }
  };

  async function clearRoute() {
    setFlag(false);
    setDirectionsResponse(null);
    setDistance(0);
    setDuration('');
    setOrigin('');
    setDestination('');
    setShowMarker(false);
    if (originRef.current) {
      originRef.current.value = '';
    }
    if (destinationRef.current) {
      destinationRef.current.value = '';
    }
    if (originRef.current && destinationRef.current) {
      originRef.current.disabled = false;
      destinationRef.current.disabled = false;
    }
    setTimeout(() => {
      setFlag(true);
    }, 0);
  }

  if (!isLoaded) {
    return (
      <div className={styles.loader}>
        <Loader />
      </div>
    );
  }

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className={styles['container']}>
      <div className={styles['bottom-description']}>Enter your pickup location</div>
      <div className={styles['input-container']}>
        <Autocomplete onPlaceChanged={() => handlePlaceChange(originRef.current?.value, 'origin')}>
          <input
            className={styles['map-input']}
            type="text"
            ref={originRef}
            value={origin}
            onChange={(e) => {
              setOrigin(e.currentTarget.value);
            }}
            onFocus={() => handleSelected('origin')}
          />
        </Autocomplete>
        <div className={styles['svg-container']} onClick={() => handleLiveLocation('origin')}>
          <Location />
        </div>
      </div>
      <div className={styles['bottom-description']}>Enter your drop location</div>
      <div className={styles['input-container']}>
        <Autocomplete
          onPlaceChanged={() => handlePlaceChange(destinationRef.current?.value, 'destination')}>
          <input
            className={styles['map-input']}
            type="text"
            ref={destinationRef}
            value={destination}
            onChange={(e) => {
              setDestination(e.currentTarget.value);
            }}
            onFocus={() => handleSelected('destination')}
          />
        </Autocomplete>
        <div className={styles['svg-container']} onClick={() => handleLiveLocation('destination')}>
          <Location />
        </div>
      </div>
      <GoogleMap
        mapContainerClassName={styles['map-container']}
        key={flag ? 'map' : 'map-off'}
        center={center}
        zoom={13}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggableCursor: 'disabled',
        }}
        mapContainerStyle={{ cursor: 'pointer' }}
        onClick={handleMapClick}>
        {flag && showMarker && <Marker position={center} visible />}
        {flag && directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
      </GoogleMap>
      <div className={styles['bottom-buttons-row']}>
        <Button
          onClick={calculateRoute}
          theme={'secondary'}
          fullWidth={true}
          className={styles.button}>
          Calculate Route
        </Button>
        <Button onClick={clearRoute} theme={'primary'} fullWidth={true} className={styles.button}>
          Clear Route
        </Button>
      </div>
      {distance !== 0 && duration && (
        <div className={styles['route-detail-container']}>
          <div className={styles['route-title-description']}>
            <div className={styles['route-title']}>Estimated Distance:</div>
            <div className={styles['route-description']}>{`${distance} mi`}</div>
          </div>
          <div className={styles['route-title-description']}>
            <div className={styles['route-title']}>Minimum Estimated Time:</div>
            <div className={styles['route-description']}>{duration}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
