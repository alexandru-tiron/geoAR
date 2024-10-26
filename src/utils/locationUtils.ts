import Geolocation from 'react-native-geolocation-service';

interface Location {
  latitude: number;
  longitude: number;
}

export const fetchLocation = async (
  setCurrentLocation: React.Dispatch<React.SetStateAction<Location | null>>,
  setWatchId: React.Dispatch<React.SetStateAction<number | null>>,
) => {
  const id = Geolocation.watchPosition(
    (position: {coords: {latitude: any; longitude: any}}) => {
      const {latitude, longitude} = position.coords;
      // console.log("New position:", latitude, longitude);
      // Assuming setCurrentLocation is passed as a parameter or imported from context
      setCurrentLocation({latitude, longitude});
    },
    (error: any) => {
      console.error('Error getting location:', error);
    },
    {
      accuracy: {android: 'high', ios: 'bestForNavigation'},
      interval: 2000,
      enableHighAccuracy: true,
      distanceFilter: 5,
      forceRequestLocation: true,
      forceLocationManager: false,
    },
  );

  // Assuming setWatchId is passed as a parameter or imported from context
  setWatchId(id);
};
