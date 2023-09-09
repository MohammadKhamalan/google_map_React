import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Map.scss';
function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
  
      if (delay !== null) {
        const intervalId = setInterval(tick, delay);
        return () => clearInterval(intervalId);
      }
    }, [delay]);
  }
const Maps = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [modal, setModal] = useState(false);
  const [numberOfMarker, setNumberOfMarker] = useState('');
  const [numberOfMarkerError, setNumberOfMarkerError] = useState('');
  const [time, setTime] = useState('');
  const [timeerror, setTimeerror] = useState('');
  const [isSavingData, setIsSavingData] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  const mapStyles = {
    height: '600px',
    width: '100%',
  };

  const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060,
  };

  const togglemodal = () => {
    setModal(!modal);
    setIsSavingData(false);
    setSaveSuccess(false);
  };

  const validateNumberOfMarker = useCallback((value) => {
    if (value < 500 || value > 10000) {
      setNumberOfMarkerError('Number of markers must be between 500 and 10,000.');
    } else {
      setNumberOfMarkerError('');
    }
  }, []);

  const validatetime = useCallback((val) => {
    if (val < 1000 || val > 5000) {
      setTimeerror('Value of time must be between 1000 and 5000 milliseconds');
    } else {
      setTimeerror('');
    }
  }, []);

  const handleNumberOfMarkerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfMarker(value);
    validateNumberOfMarker(value);
  };

  const handleTimeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTime(val);
    validatetime(val);
  };

  const isFormValid = () => {
    return !numberOfMarkerError && !timeerror;
  };

  const handleSaveClick = () => {
    if (isFormValid()) {
      setIsSavingData(true);
      const updatedTime = parseInt(document.getElementById('updateTimeInput').value, 10);
      if (updatedTime < 1000 || updatedTime > 5000) {
        setTimeerror('Value of time must be between 1000 and 5000 milliseconds');
        setIsSavingData(false);
        return;
      }
      setTime(updatedTime); // Update the time state
      setIsStarted(true); // Start updating markers
      setTimeout(() => {
        setSaveSuccess(true);
        setIsSavingData(false);
      }, 1000);
    } else {
      setIsSavingData(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSavingData(false);
      }, 1000);
    }
  };

  const handleGetLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
    }
  };

  const handleApiloaded = (map) => {
    mapRef.current = map;
  };
  useInterval(() => {
    if (isStarted && numberOfMarker && time) {
      const newMarkers = [];
      for (let i = 0; i < numberOfMarker; i++) {
        const lat = defaultCenter.lat + (Math.random() - 0.5) * 10;
        const lng = defaultCenter.lng + (Math.random() - 0.5) * 10;
        newMarkers.push({ lat, lng });
      }
      setMarkers(newMarkers);
    }
  }, time);

  // Use useEffect to fit the map to the bounds of all markers when markers change
  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
      });

      // Fit the map to the bounds
      mapRef.current.fitBounds(bounds);
    }
  }, [markers]);


  return (
    <LoadScript googleMapsApiKey="AIzaSyDnF2nn5_JAQoo6xsUYixIQB0Dru7YU-_0" onLoad={handleApiloaded}>
      <span>Click to get my location button to give your location on map</span>
      <button onClick={handleGetLocationClick}>Get My Location</button>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={10}
        center={currentLocation || defaultCenter}
        onLoad={handleApiloaded}
        options={{
          zoomControl: true,
          fullscreenControl: false,
        }}
      >
        {currentLocation && <Marker position={currentLocation} />}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}
      </GoogleMap>
      <div className="butt">
        <button onClick={() => setIsStarted(!isStarted)}>
          {isStarted ? 'Stop' : 'Start'}
        </button>
        <button onClick={togglemodal}>Edit configuration</button>
        {modal && (
          <div className="modal">
            <div className="modal-content">
              <div className="data">
                <div className="markers">
                  <span>Number of Marker</span>
                  <input
                    type="text"
                    placeholder="Number of marker"
                    value={numberOfMarker}
                    onChange={handleNumberOfMarkerChange}
                  />
                  {numberOfMarkerError && <div className="error">{numberOfMarkerError}</div>}
                  <div className="time">
                    <span>Time for Update</span>
                    <input
                      type="text"
                      id="updateTimeInput"
                      placeholder="Time"
                      value={time}
                      onChange={handleTimeChange}
                    />
                    {timeerror && <div className="error">{timeerror}</div>}
                  </div>
                </div>
                <button
                  className={`close-modal ${isSavingData ? 'disabled' : ''}`}
                  onClick={handleSaveClick}
                >
                  {isSavingData
                    ? 'Saving Data...'
                    : saveSuccess
                    ? 'Data Saved'
                    : 'Click to Save'}
                </button>
                <button className="close-modall" onClick={togglemodal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default Maps;
