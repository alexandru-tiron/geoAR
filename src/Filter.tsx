import React, {Suspense, useCallback, useMemo, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import {useLocation} from './hooks/LocationContext';
import {useTranslation} from 'react-i18next';
import {BlurView} from '@react-native-community/blur';
import {FlashList} from '@shopify/flash-list';

interface Location {
  place_id: string;
  name: string;
  type: string;
  photo_reference: string;
  distance: number;
}

interface FilterItem {
  type: string;
  key: string;
  index?: number;
}

const Filter = (props: {
  targetLocations: any;
  setTarget: any;
  viewLocations: boolean;
  setViewLocations: any;
}) => {
  const {t, i18n} = useTranslation();
  const {targetLocations, setTarget, viewLocations, setViewLocations} = props;
  const {filter, setFilter} = useLocation();
  // const [viewLocations, setViewLocations] = useState(false);
  const [searchText, setSearchText] = useState('');
  let headBarHeight = StatusBar.currentHeight || 0;
  const SCREEN_HEIGHT = Dimensions.get('screen').height; // device height
  const SCREEN_WIDTH = Dimensions.get('screen').width; // device height
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  let bottomBarHeight = SCREEN_HEIGHT - WINDOW_HEIGHT - headBarHeight || 0;
  const [isLoading, setIsLoading] = useState(false);

  const types = useMemo(() => {
    const filteredTypes = targetLocations.reduce(
      (acc: any[], loc: {type: string}) => {
        if (loc.type !== '' && !acc.includes(loc.type)) {
          acc.push(loc.type);
        }
        return acc;
      },
      [],
    );
    return filteredTypes;
  }, [targetLocations]);

  const handleLoadMore = () => {
    setIsLoading(true);
    InteractionManager.runAfterInteractions(() => {
      setIsLoading(false);
    });
  };
  const handleClose = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setViewLocations(false);
      setSearchText('');
    });
  }, []);

  const filteredLocations = useMemo(
    () =>
      targetLocations.filter((location: {name: string}) =>
        location.name.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [targetLocations, searchText],
  );
  const renderItem = useCallback(
    ({item: location}: {item: Location; index: number}) => (
      <TouchableOpacity
        onPress={() => {
          InteractionManager.runAfterInteractions(() => {
            setTarget(location);
            setViewLocations(false);
          });
        }}
        style={[styles.locationContainer, {width: '100%'}]}>
        <Image
          source={{uri: location.photo_reference}}
          style={styles.containerImage}
        />
        <View style={[styles.containerMid, {width: SCREEN_WIDTH - 140}]}>
          <Text
            style={{
              maxWidth: '100%',
              maxHeight: 50,
              fontSize: 24,
              lineHeight: 25,
              color: '#FFFFFF',
              fontWeight: '400',
              fontFamily: 'CormorantGaramond-Light',
            }}
            adjustsFontSizeToFit={true}>
            {location.name}
          </Text>
          <Text
            style={{
              maxWidth: '100%',
              color: '#FFFFFF',
              fontSize: 18,
              fontFamily: 'CormorantGaramond-Light',
            }}>
            <Suspense fallback={location.type || ''}>
              {location.type ? i18n.isInitialized && t(location.type) : ''}
            </Suspense>
          </Text>
        </View>
        <Text
          style={{
            width: 40,
            marginLeft: 'auto',
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: 'CormorantGaramond-Light',
          }}>
          {location.distance}m
        </Text>
      </TouchableOpacity>
    ),
    [setTarget, i18n, t],
  );

  const memoizedRenderItem = useMemo(() => renderItem, []);

  const filterData = useMemo(
    () => [
      {type: 'search', key: 'search'},
      ...types.map((type: string, index: number) => ({type, key: type, index})),
    ],
    [types],
  );
  const renderFilterItem = useCallback(
    ({item}: {item: FilterItem}) => {
      if (item.type === 'search') {
        return (
          <TouchableOpacity
            onPress={() => {
              setViewLocations(true);
              setSearchText('');
            }}
            style={[styles.typeButton, {width: 80, height: 28}]}>
            <Image
              source={require('../assets/images/search.png')}
              style={{height: 22, width: 22}}
            />
          </TouchableOpacity>
        );
      } else {
        const isSelected = filter === item.type;
        return (
          <TouchableOpacity
            key={item.index}
            onPress={() => {
              if (isSelected) {
                setFilter(null);
              } else {
                setFilter(item.type);
              }
            }}
            style={[
              styles.typeButton,
              isSelected
                ? {backgroundColor: '#ce0f5f'}
                : {backgroundColor: '#FFF'},
            ]}>
            <Text
              style={[
                styles.typeText,
                isSelected ? {color: '#FFF'} : {color: '#000'},
              ]}>
              {i18n.isInitialized && (
                <Suspense fallback={item.type}>{t(item.type)}</Suspense>
              )}
            </Text>
          </TouchableOpacity>
        );
      }
    },
    [filter, i18n, t, setFilter],
  );
  const placeholder = (i18n.isInitialized && t('shop_name')) || 'Shop name';
  return (
    <>
      <View
        style={[
          styles.container,
          {bottom: bottomBarHeight > 15 ? 15 : bottomBarHeight},
        ]}>
        <View style={styles.scrollContent}>
          <FlashList
            horizontal
            data={filterData}
            renderItem={renderFilterItem}
            keyExtractor={item => item.key.toString()}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={80} // Adjust based on your item size
            extraData={filter}
          />
        </View>
      </View>

      {viewLocations && (
        <View style={[styles.fullContainer, {top: headBarHeight}]}>
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            blurRadius={25}
            overlayColor="#000000dd"
            blurType="dark"
            blurAmount={100}
            reducedTransparencyFallbackColor="dark"
          />
          <Image
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
          <TextInput
            style={styles.input}
            onChangeText={setSearchText}
            placeholderTextColor="#FFFFFFcc"
            placeholder={placeholder}
            value={searchText}
          />
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, {top: 5}]}>
            <Image
              source={require('../assets/images/close.png')}
              style={{
                height: 35,
                width: 35,
              }}
            />
          </TouchableOpacity>
          <View style={styles.scrollFullContent}>
            <FlashList
              data={filteredLocations.sort(
                (a: {distance: number}, b: {distance: number}) =>
                  a.distance - b.distance,
              )}
              keyExtractor={item => item.place_id.toString()}
              renderItem={memoizedRenderItem}
              // contentContainerStyle={{padding: 100}}
              showsVerticalScrollIndicator={true}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoading ? (
                  <ActivityIndicator size="large" color="#FFF" />
                ) : null
              }
              estimatedItemSize={80}
              removeClippedSubviews={true}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  container: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 15,
  },
  fullContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    backgroundColor: '#00000000',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 25,
    paddingBottom: 50,
  },
  scrollFullView: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    width: '100%',
  },
  scrollFullContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  input: {
    width: '90%',
    padding: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 30,
    color: '#fff',
    fontSize: 18,
    fontFamily: 'CormorantGaramond-Light',
    marginBottom: 10,
  },
  locationContainer: {
    display: 'flex',
    // width: '100%',
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
    gap: 10,
    alignItems: 'center',
  },
  containerImage: {
    position: 'relative',
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: 60,
    shadowColor: '#FFFFFF',
  },
  containerMid: {
    width: 'auto',
    height: 60,
    display: 'flex',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  resetButton: {
    marginRight: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#000',
    fontFamily: 'CormorantGaramond-Light',
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

export default Filter;
