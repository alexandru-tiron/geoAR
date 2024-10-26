/**
 * @format
 */
// if needed to be opened by another app uncomment these to use props
// import {NativeModules} from 'react-native';
import React from 'react';
import TreasureHuntAR from './src/TreasureHuntAR';
import './src/localization/i18n';
import {targetLocations} from './constants';
// const {IntentModule} = NativeModules;

const App = () => {
  //props => {

  // const {initialLocation, targetLocations} = props;
  // console.log('Initial Props:', targetLocations);

  // if (!targetLocations) {
  //   return null; // or a loading indicator
  // }

  // let parsedTargetLocations;
  // try {
  //   if (targetLocations.trim().slice(0, -1).endsWith(',')) {
  //     parsedTargetLocations = JSON.parse(
  //       targetLocations.trim().slice(0, -2) + targetLocations.trim().slice(-1),
  //     ); // Remove the last character (comma)
  //   } else {
  //     parsedTargetLocations = JSON.parse(targetLocations);
  //   }
  //   console.log('Modified Props:', parsedTargetLocations);
  // } catch (error) {
  //   console.error('Error parsing targetLocations:', error);
  //   return null; // Return null if there's an error in parsing
  // }

  // // Check if parsedTargetLocations is an empty array
  // if (!parsedTargetLocations.length) {
  //   return null; // or a loading indicator
  // }
  const closeActivity = () => {
    console.log('Closing Activity');
    // Please adapt it to your needs
  };

  const checkInShop = i => {
    console.log(i);
    // Please adapt it to your needs
  };
  return (
    <>
      {/* {parsedTargetLocations && ( */}
      <TreasureHuntAR
        targetLocations={targetLocations}
        // initialLocation={initialLocation ? JSON.parse(initialLocation) : null}
        // closeActivity={() => IntentModule.closeActivity()}
        // checkInShop={i => IntentModule.checkInShop(i)}
        closeActivity={() => closeActivity()}
        checkInShop={i => checkInShop(i)}
      />
      {/* )} */}
    </>
  );
};

export default App;
