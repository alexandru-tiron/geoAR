import React, {Suspense, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ViroARSceneNavigator,
  isARSupportedOnDevice,
} from '@reactvision/react-viro';
import ARScene from './ARScene';
import DirectionsScene from './Directions';
import {LocationProvider, useLocation} from './hooks/LocationContext';
import Filter from './Filter';
import {BlurView} from '@react-native-community/blur';
import {useTranslation} from 'react-i18next';
// if needed to be opened by another app uncomment these to use props
const TreasureHuntAR = (props: {
  targetLocations: any;
  // initialLocation: {latitude: number; longitude: number};
  closeActivity: Function;
  checkInShop: Function;
}) => {
  // const {targetLocations, initialLocation, closeActivity, checkInShop} = props;
  const {targetLocations, closeActivity, checkInShop} = props;
  const {t} = useTranslation();
  const [targetLock, setTargetLock] = useState<
    null | (typeof targetLocations)[0]
  >(null);
  const {setPopup} = useLocation();
  const [viewLocations, setViewLocations] = useState(false);
  let headBarHeight = StatusBar.currentHeight || 0;
  const [loading, setLoading] = useState(true);
  const [arSupport, setArSupport] = useState(true);
  async function checkARSupport() {
    try {
      const result = await isARSupportedOnDevice();
      if (!result.isARSupported) {
        setArSupport(false);
        setPopup({
          visible: true,
          title: 'ar_support',
          content: 'device_without_ar',
          buttons: [
            {
              title: 'ok',
              onPress: () => {
                setPopup(false);
                setViewLocations(true);
              },
            },
          ],
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    checkARSupport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (targetLocations.length == 0) {
    setPopup({
      visible: true,
      title: 'no_places',
      content: 'no_places_try_again',
      buttons: [
        {
          title: 'ok',
          onPress: () => {
            setPopup(false);
            closeActivity();
          },
        },
      ],
    });
    return null;
  } else {
    return (
      <LocationProvider
        //initialLocation={initialLocation} // improves load time if passed
        closeActivity={closeActivity}>
        <View style={[styles.container, {backgroundColor: '#000000'}]}>
          <StatusBar
            translucent={true}
            showHideTransition={'fade'}
            backgroundColor="rgba(0, 0, 0, 0.1)"
          />

          {arSupport && targetLocations.length > 0 && (
            <ViroARSceneNavigator
              autofocus={true}
              initialScene={{
                scene: () => (
                  <ARScene
                    targetLocations={targetLocations}
                    setTarget={(i: (typeof targetLocations)[0]) =>
                      setTargetLock(i)
                    }
                    setLoading={(i: boolean) => setLoading(i)}
                  />
                ),
              }}
              style={styles.container}
            />
          )}
          {targetLock && (
            <DirectionsScene
              target={targetLock}
              close={(
                i: React.SetStateAction<{
                  place_id: string;
                  name: string;
                  locationlat: number;
                  locationlng: number;
                  address: string;
                  country: string;
                  locality: string;
                  type: string;
                  distance: number;
                  photo_reference: string;
                  registered: boolean;
                  open_now?: boolean;
                } | null>,
              ) => setTargetLock(i)}
              checkin={checkInShop}
            />
          )}
          {!targetLock && (
            <Filter
              targetLocations={targetLocations}
              setTarget={(i: (typeof targetLocations)[0]) => setTargetLock(i)}
              viewLocations={viewLocations}
              setViewLocations={(i: boolean) => setViewLocations(i)}
            />
          )}
          <TouchableOpacity
            onPress={() => {
              // console.log('here close');
              closeActivity();
            }}
            style={{
              position: 'absolute',
              top: 5 + headBarHeight,
              left: 15,
              height: 50,
              width: 40,
              padding: 5,
              paddingRight: 0,
              paddingLeft: 10,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 24,
              zIndex: 2,
            }}>
            <Image
              source={require('../assets/images/arrow_back.png')}
              style={{
                // alignSelf: 'center',
                height: 30,
                width: 30,
              }}
            />
          </TouchableOpacity>
          {loading && (
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: '#00000000',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <BlurView
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
                blurRadius={25}
                blurType="dark" // or 'dark', 'xlight'
                blurAmount={100}
                reducedTransparencyFallbackColor="dark"
              />
              <Text
                style={{
                  fontSize: 26,
                  color: '#FFFFFF',
                  fontFamily: 'CormorantGaramond-Light',
                }}>
                <Suspense fallback={'Loading places near you ...'}>
                  {t('loading') + ' ...'}
                </Suspense>
              </Text>
            </View>
          )}
        </View>
      </LocationProvider>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
});

export default TreasureHuntAR;
