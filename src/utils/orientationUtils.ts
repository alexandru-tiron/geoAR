import {
  SensorTypes,
  accelerometer,
  magnetometer,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import LPF from 'lpf';

setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
setUpdateIntervalForType(SensorTypes.magnetometer, 1000);

export const fetchOrientation = (
  azimuth: number,
  setAzimuth: React.Dispatch<React.SetStateAction<number>>,
  setIsAzimuthReady: React.Dispatch<React.SetStateAction<boolean>>,
  accelSubscription: React.MutableRefObject<any | null>,
  magSubscription: React.MutableRefObject<any | null>,
) => {
  let accelerometerData: {x: number; y: number; z: number} | null = null;
  let magnetometerData: {x: number; y: number; z: number} | null = null;
  LPF.smoothing = 1;
  const updateAzimuth = () => {
    if (accelerometerData && magnetometerData) {
      const {x: ax, y: ay, z: az} = accelerometerData;
      const {x: mx, y: my, z: mz} = magnetometerData;

      const normAcc = Math.sqrt(ax * ax + ay * ay + az * az);
      const normMag = Math.sqrt(mx * mx + my * my + mz * mz);

      const axn = ax / normAcc;
      const ayn = ay / normAcc;
      const azn = az / normAcc;

      const mxn = mx / normMag;
      const myn = my / normMag;
      const mzn = mz / normMag;

      const hx = myn * azn - mzn * ayn;
      const hy = mzn * axn - mxn * azn;
      let angle = 0;

      if (Math.atan2(hy, hx) >= 0) {
        angle = Math.atan2(hy, hx) * (180 / Math.PI);
      } else {
        angle = (Math.atan2(hy, hx) + 2 * Math.PI) * (180 / Math.PI);
      }
      const adjustedAzimuth = LPF.next((Math.round(angle) + 360) % 360);
      // Assuming setAzimuth and setIsAzimuthReady are passed as parameters or imported from context
      setAzimuth(adjustedAzimuth);
      if (azimuth === 0) setIsAzimuthReady(true);
    }
  };

  const subscriptionAccel = accelerometer.subscribe(({x, y, z}) => {
    accelerometerData = {x, y, z};
    if (accelerometerData) {
      updateAzimuth();
    }
  });

  const subscriptionMag = magnetometer.subscribe(({x, y, z}) => {
    magnetometerData = {x, y, z};
    if (magnetometerData) {
      updateAzimuth();
    }
  });

  // Assuming accelSubscription and magSubscription are passed as parameters or imported from context
  accelSubscription.current = subscriptionAccel;
  magSubscription.current = subscriptionMag;
};
