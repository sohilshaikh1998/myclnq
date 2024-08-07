import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, I18nManager } from 'react-native';
import { AppColors } from '../shared/AppColors';
import { AppUtils } from '../utils/AppUtils';
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from '../locales/i18n';
const isRTL = I18nManager.isRTL;
const bulletPoints = [
  ['common.advisoryNote.cardiacArrest', 'common.advisoryNote.boneFracture'],
  ['common.advisoryNote.unconsciousness', 'common.advisoryNote.asthma'],
  ['common.advisoryNote.breathlessness', 'common.advisoryNote.uncontrollableBleeding'],
  ['common.advisoryNote.stroke', 'common.advisoryNote.drugOverdose'],
  ['common.advisoryNote.emergencyLabour', 'common.advisoryNote.choking'],
  ['common.advisoryNote.headInjury'],
];

class CustomAlert extends React.Component {
  constructor(){
    super();
    this.state={
     countryCode:null,
     message:""
    }
  }
  componentDidMount(){
    this.getLoggedInCountry();
    
  }
  


  async getLoggedInCountry() {
    const userDetails = JSON.parse(await AsyncStorage.getItem('logged_in_user'));
    const countryCode = AppUtils.getCountryDetails(userDetails.countryCode);
    this.setState({
      countryCode: countryCode.dial_code ,
    });
   
    this.setAlertMessage();
  }
  setAlertMessage(){
   
    if (this.state.countryCode=='91'){
      this.setState({message:strings('common.emergencyMessage.india')})

    }
    else if (this.state.countryCode=='65'){
      this.setState({message:strings('common.emergencyMessage.singapore')})

    }
    else{
      this.setState({message:strings('common.emergencyMessage.default')})

    }
  } 

  render() {
    const { visible, title, onCancel, onConfirm } = this.props;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.container}>
          <View style={styles.alert}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{this.state.message}</Text>

            {bulletPoints.map((items, index) => {
              return (
                <View style={[styles.bulletList, { padding: 10 }]}>
                  <View style={{ flexDirection: 'row' }}>
                    {items.map((item, index) => (
                      <>
                        <Text key={index} style={styles.bulletItem}>
                          &#x2022; {strings(item)}
                        </Text>
                        {index < items.length - 1 && <View style={styles.verticalLine} />}
                      </>
                    ))}
                    {index < bulletPoints.length - 1 && <View style={styles.verticalLine} />}
                  </View>
                </View>
              );
            })}

            <Text style={styles.subMessage}>{strings('common.advisoryNote.nonEmergencyMessage')}</Text>
            <Text style={styles.subMessage}>
            {strings('common.advisoryNote.wheelchairMessage')}
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.outlinedButton} onPress={onCancel}>
                <Text style={styles.outlinedBtnText}>{strings('common.advisoryNote.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onConfirm}>
                <Text style={styles.buttonText}>{strings('common.advisoryNote.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'left',
  },
  subMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'left',
  },

  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: AppColors.primaryColor,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  outlinedButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderColor: AppColors.primaryColor,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  outlinedBtnText: {
    color: AppColors.primaryColor,
    fontSize: 14,
  },
  bulletList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 0.5,
    // borderColor: AppColors.blackColor,
    paddingVertical: 5,
    width: '100%',
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 16,
    width: '50%',
    textAlign: isRTL ? 'left' : 'auto',
  },
  verticalLine: {
    borderLeftWidth: 1,
    borderLeftColor: 'gray',
    height: '100%',
    // marginLeft: 10,
  },
});

export default CustomAlert;
