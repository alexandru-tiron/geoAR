import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  ViroARScene,
  ViroText,
  ViroNode,
  ViroFlexView,
  ViroImage,
  ViroMaterials,
  ViroTrackingReason,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';
import {getBearing, toRadians} from './utils/GeolocationUtils';
import {useLocation} from './hooks/LocationContext';
import {useTranslation} from 'react-i18next';

const MemoizedViroNode = React.memo(ViroNode);
const MemoizedViroFlexView = React.memo(ViroFlexView);

const ARScene = (props: {
  targetLocations: any;
  setTarget: any;
  setLoading: any;
}) => {
  const {t, i18n} = useTranslation();
  const {targetLocations, setTarget, setLoading} = props;
  const {currentLocation, azimuth, isAzimuthReady, filter} = useLocation();
  const [initialBearings, setInitialBearings] = useState([]);
  const [positions, setPositions] = useState([]);
  const closeLocations = useMemo(
    () =>
      targetLocations
        .filter((target: {type: string}) =>
          filter ? target.type === filter : true,
        )
        .sort(
          (a: {distance: number}, b: {distance: number}) =>
            a.distance - b.distance,
        )
        .slice(0, 29),
    [targetLocations, filter],
  );

  const fetchPermissionsAndLocation = useCallback(() => {
    if (currentLocation && isAzimuthReady) {
      const {latitude, longitude} = currentLocation;
      const bearings = closeLocations.map(
        (target: {locationlat: number; locationlng: number}) =>
          getBearing(
            latitude,
            longitude,
            target.locationlat,
            target.locationlng,
          ),
      );
      setInitialBearings(bearings);
      const newPositions = bearings.map((bearing: number, index: any) => {
        const relativeAngle = (bearing - azimuth + 360) % 360;
        const positionX =
          Number(Math.sin(toRadians(relativeAngle)).toFixed(2)) * 10;
        const positionZ = Number(Math.cos(toRadians(relativeAngle)).toFixed(2));
        const finalPositionX = positionZ < 0 ? -positionX - 5 : positionX + 5;
        const finalPositionZ = positionZ < 0 ? 8 : -8;
        return {x: finalPositionX, z: finalPositionZ, targetIndex: index};
      });

      newPositions.forEach((pos: {x: number}, index: string | number) => {
        let y = 0;
        let occ = 0;
        newPositions.forEach((otherPos: {x: number}, otherIndex: number) => {
          if (
            otherPos.x - 0.25 <= pos.x &&
            pos.x >= otherPos.x + 0.25 &&
            otherIndex !== index
          ) {
            occ += 1;
            y =
              closeLocations[index].distance <
              closeLocations[otherIndex].distance
                ? -y -
                  0.175 * occ -
                  ((closeLocations[otherIndex].distance /
                    closeLocations[index].distance) %
                    1)
                : y +
                  0.175 * occ +
                  ((closeLocations[otherIndex].distance /
                    closeLocations[index].distance) %
                    1);
          }
        });
        newPositions[index].y = y;
      });

      setPositions(newPositions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, isAzimuthReady, closeLocations]);

  useEffect(() => {
    fetchPermissionsAndLocation();
  }, [closeLocations, filter, currentLocation, fetchPermissionsAndLocation]);

  const renderTargets = useMemo(() => {
    if (initialBearings.length !== closeLocations.length) return null;

    return closeLocations.map((target: any, index: any) => {
      const {x, y, z} = positions[index] || {x: 0, y: 0, z: 0};
      // console.log('updated ' + target.name);
      return (
        <MemoizedViroNode key={index} position={[x, y, z]}>
          <MemoizedViroFlexView
            width={4.5}
            height={1.2}
            materials={
              target.registered
                ? 'roundedCornerShadowReg'
                : 'roundedCornerShadow'
            }
            onClick={() => setTarget(target)}
            style={{flexDirection: 'row', alignItems: 'center', padding: 0.2}}
            transformBehaviors={['billboard']}>
            <ViroNode width={0.9} height={0.9}>
              <ViroImage
                position={[0, 0.03, 0]}
                height={0.9}
                width={0.9}
                source={{uri: target.photo_reference}}
              />
              <ViroImage
                position={[0, 0.03, -0.01]}
                height={0.91}
                width={0.91}
                source={
                  target.registered
                    ? require('../assets/images/holeReg.png')
                    : require('../assets/images/hole.png')
                }
              />
            </ViroNode>
            <MemoizedViroFlexView
              width={2.7}
              position={[0.35, 0, 0]}
              height={1}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                paddingLeft: 0.1,
              }}>
              <ViroText
                text={target.name}
                width={2.7}
                height={0.6}
                textLineBreakMode="WordWrap"
                style={{
                  fontFamily: 'CormorantGaramond-Light, serif',
                  fontSize: 26,
                  color: target.registered ? '#FFFFFF' : '#000000',
                  fontWeight: '500',
                  textAlign: 'left',
                  textAlignVertical: 'top',
                }}
              />
              <ViroText
                text={i18n.isInitialized ? t(target.type) : ''}
                width={2.7}
                height={0.3}
                style={{
                  fontFamily: 'CormorantGaramond-Light,serif',
                  fontSize: 20,
                  color: target.registered ? '#FFFFFFaa' : '#000000aa',
                  fontWeight: '500',
                  textAlign: 'left',
                  textAlignVertical: 'top',
                }}
              />
            </MemoizedViroFlexView>
            <ViroText
              text={`${target.distance}m`}
              width={0.4}
              height={0.3}
              style={{
                justifyContent: 'flex-end',
                fontFamily: 'CormorantGaramond-Light,serif',
                fontSize: 20,
                color: target.registered ? '#FFFFFFaa' : '#000000aa',
                fontWeight: '500',
                textAlign: 'center',
                textAlignVertical: 'center',
                backgroundColor: '#8ac2c8',
              }}
            />
          </MemoizedViroFlexView>
        </MemoizedViroNode>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBearings, closeLocations, filter]);
  function onInitialized(state: any, reason: ViroTrackingReason) {
    console.log('onInitialized', state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setLoading(false);
    }
  }
  return (
    <ViroARScene onTrackingUpdated={onInitialized}>{renderTargets}</ViroARScene>
  );
};

ViroMaterials.createMaterials({
  roundedCornerShadow: {
    diffuseTexture: require('../assets/images/RectangleShadow.png'),
    wrapS: 'Clamp',
    wrapT: 'Clamp',
  },
  roundedCornerShadowReg: {
    diffuseTexture: require('../assets/images/RectangleShadowReg.png'),
    wrapS: 'Clamp',
    wrapT: 'Clamp',
  },
});

export default ARScene;
