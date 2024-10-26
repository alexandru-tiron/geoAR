import {PermissionsAndroid} from 'react-native';

export const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted === 'granted') {
      // console.log("You can use Geolocation");
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
export const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // console.log("You can use the camera");
      return true;
    } else {
      return false;
    }
  } catch (err) {
    // console.error('Failed to request camera permission', err);
    return false;
  }
};
