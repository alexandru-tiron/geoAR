// Popup.js
import React, {Suspense} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const PopupModal = (props: {
  visible: boolean;
  title: string | null | undefined;
  content: string;
  buttons: any;
}) => {
  const {visible, title, content, buttons} = props;
  const {t, i18n} = useTranslation();
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={[styles.centeredView, StyleSheet.absoluteFill]}>
        <View style={styles.modalView}>
          {title && (
            <Text style={styles.modalTitle}>
              <Suspense fallback={''}>
                {(i18n.isInitialized && t(title)) || ''}
              </Suspense>
            </Text>
          )}
          {content && (
            <Text style={styles.modalText}>
              <Suspense fallback={''}>
                {(i18n.isInitialized && t(content)) || ''}
              </Suspense>
            </Text>
          )}
          <View style={styles.buttonContainer}>
            {buttons &&
              buttons.map(
                (item: {onPress: any; title: string}, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, styles.buttonOpen]}
                    onPress={item.onPress}>
                    <Text style={styles.textStyle}>
                      <Suspense fallback={''}>
                        {(i18n.isInitialized && t(item.title)) || ''}
                      </Suspense>
                    </Text>
                  </TouchableOpacity>
                ),
              )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    margin: '0%',
  },
  modalView: {
    width: '80%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonOpen: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    fontWeight: '600',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'CormorantGaramond-Light',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'left',
    fontFamily: 'CormorantGaramond-Light',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'left',
    fontFamily: 'CormorantGaramond-Light',
  },
});

export default PopupModal;
