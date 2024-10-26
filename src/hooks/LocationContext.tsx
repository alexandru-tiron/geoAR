import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {AppState, Linking} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import {fetchLocation} from '../utils/locationUtils';
import {fetchOrientation} from '../utils/orientationUtils';
import PopupModal from '../PopupModal';
import {
  requestCameraPermission,
  requestLocationPermission,
} from '../utils/permissions';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  azimuth: number | 0;
  isAzimuthReady: boolean | false;
  filter: String | null;
  setFilter: Function;
  setPopup: Function;
}
interface PopUp {
  visible: boolean;
  title: string | null | undefined;
  content: string;
  buttons: any;
}

const initialLocationContext: LocationContextType = {
  currentLocation: null,
  azimuth: 0,
  isAzimuthReady: false,
  filter: null,
  setFilter: () => {},
  setPopup: () => {},
};

const LocationContext = createContext<LocationContextType>(
  initialLocationContext,
);
export const useLocation = () => useContext(LocationContext);
interface LocationProviderProps {
  children: React.ReactNode;
  initialLocation?: Location;
  closeActivity: Function;
}
export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
  initialLocation,
  closeActivity,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(
    initialLocation || null,
  );
  const [azimuth, setAzimuth] = useState(0);
  const [isAzimuthReady, setIsAzimuthReady] = useState(false);
  const [filter, setFilter] = useState(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const accelSubscription = useRef<any | null>(null);
  const magSubscription = useRef<any | null>(null);
  const appState = useRef(AppState.currentState);
  const [popup, setPopup] = useState<PopUp | false>(false);

  async function fetchPermData() {
    let permLocation = await requestLocationPermission();
    if (permLocation) {
      fetchLocation(setCurrentLocation, setWatchId);
      let permCamera = await requestCameraPermission();
      if (permCamera) {
        hideNavigationBar();
        fetchOrientation(
          azimuth,
          setAzimuth,
          setIsAzimuthReady,
          accelSubscription,
          magSubscription,
        );
        const subscription = AppState.addEventListener(
          'change',
          async nextAppState => {
            if (
              appState.current.match(/inactive|background/) &&
              nextAppState === 'active'
            ) {
              fetchLocation(setCurrentLocation, setWatchId);
              fetchOrientation(
                azimuth,
                setAzimuth,
                setIsAzimuthReady,
                accelSubscription,
                magSubscription,
              );
            } else if (nextAppState.match(/inactive|background/)) {
              if (watchId) Geolocation.clearWatch(watchId);
              if (accelSubscription.current)
                accelSubscription.current.unsubscribe();
              if (magSubscription.current)
                magSubscription.current.unsubscribe();
            }

            appState.current = nextAppState;
            console.log('AppState', appState.current);
          },
        );

        return () => {
          // console.log("unsubscribeLocation");
          subscription.remove();
          if (watchId) Geolocation.clearWatch(watchId);
          if (accelSubscription.current)
            accelSubscription.current.unsubscribe();
          if (magSubscription.current) magSubscription.current.unsubscribe();
          showNavigationBar();
        };
      } else {
        if (!popup)
          setPopup({
            visible: true,
            title: 'camera_required',
            content: 'functionality_needs_camera',
            buttons: [
              {
                title: 'no',
                onPress: () => {
                  setPopup(false);
                  closeActivity();
                },
              },
              {
                title: 'go_to_settings',
                onPress: () => {
                  setPopup(false);
                  Linking.openSettings();
                },
              },
            ],
          });
      }
    } else {
      if (!popup)
        setPopup({
          visible: true,
          title: 'location_required',
          content: 'functionality_needs_location',
          buttons: [
            {
              title: 'no',
              onPress: () => {
                setPopup(false);
                closeActivity();
              },
            },
            {
              title: 'go_to_settings',
              onPress: () => {
                setPopup(false);
                Linking.openSettings();
              },
            },
          ],
        });
    }
  }

  useEffect(() => {
    Orientation.lockToPortrait();
    const subscription = AppState.addEventListener('change', fetchPermData);
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        azimuth,
        isAzimuthReady,
        filter,
        setFilter,
        setPopup,
      }}>
      {children}
      {popup && (
        <PopupModal
          visible={popup.visible}
          title={popup.title}
          content={popup.content}
          buttons={popup.buttons}
        />
      )}
    </LocationContext.Provider>
  );
};
