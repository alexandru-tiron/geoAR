import React, {Suspense, useEffect, useRef, useState} from 'react';
import {getBearing, getDistance} from './utils/GeolocationUtils';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useLocation} from './hooks/LocationContext';
import LPF from 'lpf';
import {useTranslation} from 'react-i18next';

interface Location {
  latitude: number;
  longitude: number;
}
const DirectionsScene = (props: {
  target: any;
  close: Function;
  checkin: Function;
}) => {
  const {target, close, checkin} = props;
  const {t, i18n} = useTranslation();
  const [currentStepDistance, setCurrentStepDistance] = useState(0);
  const [targetDistance, setTargetDistance] = useState(0);
  const [targetCheckin, setTargetCheckin] = useState(false);
  const {currentLocation, azimuth, isAzimuthReady} = useLocation();
  const [bearing, setBearing] = useState(0);
  const currentLocationRef = useRef<Location | null>(null);
  const animatedBearing = useRef(new Animated.Value(0)).current;
  const [intervalT, setIntervalT] = useState(0);
  let headBarHeight = StatusBar.currentHeight || 0;
  const SCREEN_WIGTH = Dimensions.get('screen').width; // device height

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  useEffect(() => {
    LPF.smoothing = 1;
    if (isAzimuthReady) {
      const updateBearing = () => {
        const location = currentLocationRef.current;
        if (!location) {
          console.log('Current location is not available');
          return;
        }
        const {latitude, longitude} = location;
        const currentTargetDistance = getDistance(
          {latitude: latitude, longitude: longitude},
          {latitude: target.locationlat, longitude: target.locationlng},
        );
        setCurrentStepDistance(Math.floor(currentTargetDistance));
        setTargetDistance(Math.floor(currentTargetDistance));
        if (currentTargetDistance < 15) {
          setTargetCheckin(true);
        } else {
          const bearingToEnd = getBearing(
            latitude,
            longitude,
            target.locationlat,
            target.locationlng,
          );
          const finalBearing = Math.floor(
            LPF.next(Math.floor((bearingToEnd - azimuth + 360) % 360)),
          );
          if (finalBearing !== bearing) {
            const currentBearing = bearing;
            setBearing(finalBearing);
            const diff = Math.abs(finalBearing - currentBearing);
            const shortestPath = diff > 300 ? 360 - diff : diff;

            const newValue =
              diff > 300
                ? finalBearing < currentBearing
                  ? currentBearing - shortestPath
                  : currentBearing + shortestPath
                : finalBearing;
            // console.log(newValue);
            Animated.timing(animatedBearing, {
              toValue: newValue,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }).start(() => {
              animatedBearing.setValue(finalBearing);
            });
          }
        }
      };
      if (intervalT / 400 === 0) {
        updateBearing();
      } else {
        setIntervalT(intervalT + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azimuth]);

  const rotation = animatedBearing.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {target.name && (
        <>
          <View style={[styles.containerTop, {top: 50 + headBarHeight}]}>
            <Image
              source={{uri: target.photo_reference}}
              style={[styles.containerImage]}
            />
            <View
              style={[
                styles.containerMid,
                {width: SCREEN_WIGTH * 0.9 - 70 - 45 - 20},
              ]}>
              <Text
                style={{
                  fontSize: 26,
                  lineHeight: 26,
                  maxHeight: 52,
                  color: '#FFFFFF',
                  fontWeight: '400',
                  fontFamily: 'CormorantGaramond-Light',
                }}
                adjustsFontSizeToFit={true}>
                {target.name}
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  lineHeight: 18,
                  fontFamily: 'CormorantGaramond-Light',
                }}>
                <Suspense fallback={target.type}>
                  {target.type ? i18n.isInitialized && t(target.type) : ''}
                </Suspense>
              </Text>
            </View>
            <Text
              style={{
                marginLeft: 'auto',
                color: '#FFFFFF',
                fontSize: 20,
                lineHeight: 20,
                width: 45,
                fontFamily: 'CormorantGaramond-Light',
              }}>
              {targetDistance} m
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => close(null)}
            style={[styles.closeButton, {top: headBarHeight + 5}]}>
            <Image
              source={require('../assets/images/close.png')}
              style={{
                height: 35,
                width: 35,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              checkin(target);
            }}
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              top: 160 + headBarHeight,
              width: '70%',
              height: 35,
              alignSelf: 'center',
              backgroundColor: '#FFF',
              justifyContent: 'center',
              borderRadius: 30,
              zIndex: 1,
            }}>
            <Text
              style={{
                color: '#ce0f5f',
                textAlign: 'center',
                fontFamily: 'CormorantGaramond-Light',
                fontSize: 24,
                width: '100%',
              }}>
              {i18n.isInitialized && (
                <Suspense fallback={'Simulate Checkin Shop'}>
                  {t('simulate_checkin')}
                </Suspense>
              )}
            </Text>
          </TouchableOpacity>
          {!targetCheckin && (
            <View>
              {!isNaN(bearing) && (
                <Animated.Image
                  source={require('../assets/images/arrow.png')}
                  style={[
                    styles.arrow,
                    {
                      transform: [{rotate: rotation}],
                    },
                  ]}
                />
              )}
              <Text style={styles.distance}>{currentStepDistance}m</Text>
            </View>
          )}
          {targetCheckin && (
            <TouchableOpacity
              onPress={() => {
                checkin(target);
              }}
              style={styles.checkin}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 22,
                  alignSelf: 'center',
                  color: '#000',
                  fontFamily: 'CormorantGaramond-Light',
                }}>
                {i18n.isInitialized && (
                  <Suspense fallback={'CHECK IN'}>{t('checkin')}</Suspense>
                )}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerTop: {
    margin: 8,
    position: 'absolute',
    top: 50,
    width: '90%',
    height: 90,
    alignSelf: 'center',
    backgroundColor: '#ce0f5f',
    padding: 10,
    borderRadius: 30,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    overflow: 'visible',
    elevation: 24,
    zIndex: 1,
  },
  containerImage: {
    position: 'relative',
    width: 70,
    height: 70,
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: 60,
    shadowColor: '#FFFFFF',
  },
  containerMid: {
    width: 180,
    height: 60,
    display: 'flex',
    justifyContent: 'space-between',
  },
  arrow: {
    position: 'absolute',
    bottom: 140,
    width: 120,
    height: 120,
    alignSelf: 'center',
    objectFit: 'contain',
  },
  distance: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#00FF00',
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    fontFamily: 'CormorantGaramond-Light',
  },
  checkin: {
    width: '80%',
    height: 60,
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 30,
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    height: 50,
    width: 50,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 2, // Ensure it’s above other components
  },
});

export default DirectionsScene;
