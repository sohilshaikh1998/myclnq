import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
  Alert,
  BackHandler,
  Dimensions,
  PermissionsAndroid,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  NativeModules,
  I18nManager,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import CountryPicker, { FlagButton } from 'react-native-country-picker-modal';
import { AppUtils } from '../../utils/AppUtils';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import { AppColors } from '../../shared/AppColors';
import SHButtonDefault from '../../shared/SHButtonDefault';
import ProgressLoader from 'rn-progress-loader';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Geocoder from 'react-native-geocoding';
import { Image } from 'react-native-animatable';
import { getCountry, getTimeZone, getLocales } from 'react-native-localize';
import { strings } from '../../locales/i18n';
import PasswordInputText from 'react-native-hide-show-password-input';
import firebaseNotifications from '../../utils/firebaseNotifications';
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
const isRTL = I18nManager.isRTL;
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class ForgetPassword extends React.Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    this.onCountry = this.onCountry.bind(this);
    AppUtils.analyticsTracker('Forget Password');
    AppUtils.console('sdvfcwsedg345', getLocales(), getTimeZone(), getCountry());
    this.state = {
      countryCode: props.countryCode,
      mobileNumber: props.mobileNumber,
      isC: false,
      isLoading: false,
      isCountryListVisible: false,
      numberLimit: props.numberLimit,
      cca2: props.cca2,
      countryName: props.countryName,
      isUserLoggedIn: props.isUserLoggedIn,
      navigate: true,
      isNavigating: false,
    };
  }

  componentDidMount() {
    let self = this;
    if (Platform.OS === 'android') {
      this.focusListener = this.props.navigation.addListener('didFocus', () => {
        this.setState({
         navigate: true,
         isNavigating: false
        })
       });
       BackHandler.addEventListener('hardwareBackPress', () => {
        this.exitAlert();
        return true;
      });
    }
  }

  componentWillUnmount() {
    let self = this;
    if (Platform.OS === 'android') {
      this.focusListener.remove();
      BackHandler.removeEventListener('hardwareBackPress', this.exitAlert);
    }
  }
  exitAlert() {
    AppUtils.console('BackPress', 'Login');
    Alert.alert(strings('common.common.exitApp'), strings('common.common.wantToQuit'), [
      { text: strings('common.common.stay'), style: 'cancel' },
      {
        text: strings('common.common.exit'),
        onPress: () => BackHandler.exitApp(),
      },
    ]);
  }



  async getLocation() {
    if (Platform.OS === 'ios') {
      this.getUserCurrentLocation();
    } else {
      const permissionGranted = await AppUtils.locationPermissionsAccess();
      if (permissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getUserCurrentLocation();
      }
    }
  }

  async getUserCurrentLocation() {
    let self = this;
    const location = await AppUtils.getCurrentLocation();
    this.setState({ isLoading: false });
    const { latitude, longitude } = location.coords;
    Geocoder.from(latitude, longitude).then((json) => {
      this.getCountryName(json.results[0].address_components);
    });

  }

  getCountryName(address_components) {
    for (let i = 0; i < address_components.length; i++) {
      let addressType = address_components[i].types[0];
      if (addressType == 'country') {
        if (address_components[i].long_name === 'India') {
          this.setState({
            countryCode: '91',
            cca2: 'IN',
          });
          return;
        }
        else if (address_components[i].long_name === 'Indonesia') {
          this.setState({
            countryCode: '62',
            cca2: 'ID',
          });
          console.log("country", address_components[i])
          return;
        }
      }
    }
    return '';
  }

  async validateNumber() {
    this.setState({
      navigate: false,
      isNavigating: true
    });
    var numberLength = this.state.mobileNumber.length;
    if (this.state.numberLimit == 12 && numberLength < 8) {
      alert(strings('string.mandatory.mobNumber'));
    } else if (this.state.numberLimit == 13 && numberLength < 8) {
      alert(strings('string.mandatory.mobNumber'));
    }
    else if (this.state.numberLimit != 12 && numberLength < this.state.numberLimit) {
      this.state.countryCode == '62'? this.setPwd() : 
      alert(strings('string.mandatory.mobNumber'));
    } else {
      this.setPwd();
    }
  }

  async setPwd() {
    let userDetail = {
      countryCode: this.state.countryCode,
      phoneNumber: this.state.mobileNumber,
    };

    console.log(userDetail,'userDetail')
    const preCheckResponse = await SHApiConnector.forgetPasswordPreCheck(userDetail);
    // // check if user exist or not
    if (preCheckResponse.status === 200) {
      Actions.SetPassword({ userDetail: userDetail });
    } else {
      setTimeout(() => {
        AppUtils.showMessage(this, '', preCheckResponse.data.message, strings('doctor.button.ok'), () => {
          this.setState({
            navigate: true,
            isNavigating: false
          });
        });
      }, 500);
    }
  }

  onChangedText(number) {
    let newText = '';
    let numbers = '0123456789';

    for (var i = 0; i < number.length; i++) {
      if (numbers.indexOf(number[i]) > -1) {
        newText = newText + number[i];
      } else {
        alert(strings('common.common.enterNumbersOnly'));
      }
    }
    this.setState({ mobileNumber: newText });
  }

  onCountry() {
    this.setState({ isC: !this.state.isC });
  }

  render() {
    let parentMargin = 16;
    let parentWidth = AppUtils.screenWidth - parentMargin * 2;
    let parentHeight = PixelRatio.getPixelSizeForLayoutSize(25);
    let cCodeWidth = PixelRatio.getPixelSizeForLayoutSize(25);
    const { navigate, isNavigating } = this.state;

    return (
      <KeyboardAwareScrollView bounces={false}>
        <View style={styles.container}>
          <View style={styles.clnqLogo}>
            <Image style={{ height: hp(18), width: hp(18) }} source={require('../../../assets/images/myclnq-homescreen.png')} />
          </View>
          <View style={{ marginLeft: wp(5), marginTop: hp(2) }}>
            <Text
              style={{
                fontSize: hp(2.5),
                color: AppColors.blackColor3,
                fontFamily: AppStyles.fontFamilyMedium,
                marginTop: hp(1),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {this.state.isUserLoggedIn ? strings('common.common.changePwd') : strings('common.common.forgetPwd')}
            </Text>
            <Text
              style={{
                fontSize: hp(1.8),
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                lineHeight: hp(3),
                marginTop: hp(1),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {this.state.isUserLoggedIn ? strings('common.common.changePwdMsg') : strings('common.common.fgtPwdMsg')}
            </Text>
            <Text
              style={{
                fontSize: hp(2),
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                marginTop: hp(5),
                marginRight:isRTL ? wp(5) : null
              }}
            >
              {strings('common.common.selectCountry')}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: hp(6),
              width: parentWidth,
              marginTop: hp(2),
              borderWidth: 1,
              borderRadius: wp(1),
              borderColor: AppColors.backgroundGray,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                alignSelf: 'center',
                marginLeft: wp(2),
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <FlagButton
                withCountryNameButton={!this.state.isCountryListVisible}
                withCallingCodeButton={!this.state.isCountryListVisible}
                containerButtonStyle={{
                  marginTop: Platform.OS === 'ios' ? hp(0.6) : hp(1.2),
                  fontFamily: AppStyles.fontFamilyBold,
                  fontSize: 15,
                  flex: 5,
                }}
                onOpen={() =>
                  this.setState({
                    isCountryListVisible: this.state.isUserLoggedIn ? false : true,
                  })
                }
                withEmoji={!this.state.isCountryListVisible}
                withFlag={!this.state.isCountryListVisible}
                countryCode={this.state.cca2}
              />
              {this.state.isCountryListVisible ? (
                <CountryPicker
                  //countryCodes={['SG', 'IN']}
                  //countryCodes={["SG", "IN", "MY", "TH", "ID", "ZA"]}
                  visible={this.state.isUserLoggedIn ? false : this.state.isCountryListVisible}
                  closeable
                  withFilter
                  withFlag
                  withCallingCode
                  withCountryNameButton
                  onClose={() => this.setState({ isCountryListVisible: false })}
                  onSelect={(value) => {
                    this.state.isUserLoggedIn
                      ? null
                      : this.setState({
                          cca2: value.cca2,
                          countryCode: value.callingCode[0],
                          numberLimit: value.callingCode[0] == '91' ? 10 : value.callingCode[0] == '65' ? 8 : value.callingCode[0] == '62' ? 13 : 12,
                          isCountryListVisible: false,
                          mobileNumber: '',
                        });
                  }}
                  cca2={this.state.cca2}
                  translation="eng"
                />
              ) : null}
              <TouchableHighlight
                underlayColor={'transparent'}
                onPress={() =>
                  this.setState({
                    isCountryListVisible: this.state.isUserLoggedIn ? false : true,
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  alignSelf: 'center',
                  marginRight: wp(2),
                  justifyContent: 'flex-end',
                }}
              >
                <Image
                  style={{
                    alignSelf: 'center',
                    width: wp(4),
                    height: wp(4),
                  }}
                  source={require('../../../assets/images/arrow_down.png')}
                />
              </TouchableHighlight>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: hp(6),
              width: parentWidth,
              borderWidth: 1,
              marginTop: hp(3),
              borderColor: AppColors.backgroundGray,
              borderRadius: wp(1),
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginLeft: wp(3),
                width: parentWidth - (cCodeWidth + 10),
              }}
            >
              <TextInput
                allowFontScaling={false}
                testID="loginNumber"
                style={{
                  width: parentWidth - (cCodeWidth + 10),
                  color: AppColors.blackColor3,
                  fontSize: 20,
                  padding: hp(0.5),
                  textAlign: isRTL ? 'right' : 'left',
                }}
                maxLength={this.state.numberLimit}
                autoFocus={false}
                editable={!this.state.isUserLoggedIn}
                placeholder={strings('common.common.enterNumber')}
                placeholderTextColor={AppColors.primaryGray}
                keyboardType="number-pad"
                value={this.state.mobileNumber}
                onChangeText={(input) => this.onChangedText(input)}
                underlineColorAndroid={'white'}
                returnKeytype="done"
              />
            </View>
          </View>
          <View style={styles.buttonView}>
          {navigate && (
            <SHButtonDefault
              btnText={strings('doctor.button.continue')}
              btnType={'normal'}
              style={{ marginTop: verticalScale(30), borderRadius: wp(2) }}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              onBtnClick={() => this.validateNumber()}
            />
          )}
          {isNavigating && (
            <SHButtonDefault
              btnText={'Loading..'}
              btnType={'normal'}
              style={{ marginTop: verticalScale(30), borderRadius: wp(2) }}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
            />
          )}   
          </View>
          <View></View>
        </View>
        <ProgressLoader
          testID={'progressLoaderLogin'}
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={'#FFFFFF'}
          color={AppColors.primaryColor}
        />
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: height,
    width: width,
    backgroundColor: AppColors.whiteColor,
  },
  input: {
    flexDirection: 'row',
    width: moderateScale(320),
    height: verticalScale(80),
    borderBottomWidth: 2,
    borderBottomColor: AppColors.primaryColor,
    alignSelf: 'center',
  },
  clnqLogo: {
    flexDirection: 'column',
    alignItems: 'center',
    //marginTop: AppUtils.isX ? hp(5) : hp(5),
  },
  numberText: {
    color: AppColors.primaryGray,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(20),
    margin: moderateScale(15),
    marginBottom: verticalScale(40),
  },
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.primaryColor,
    margin: moderateScale(12),
    width: moderateScale(200),
    height: verticalScale(80),
    borderBottomWidth: 0,
  },
  continueButton: {
    marginTop: verticalScale(30),
  },
  buttonView: {
    alignItems: 'center',
    marginTop: hp(10),
  },
  countryCode: {
    color: AppColors.primaryColor,
    fontSize: 15,
    marginTop: verticalScale(50),
    fontFamily: AppStyles.fontFamilyBold,
  },
  picker: {
    height: verticalScale(50),
    width: moderateScale(90),
    marginTop: verticalScale(27),
    borderWidth: 0,
    color: AppColors.primaryColor,
    zIndex: 100,
  },
  pickerIOS: {
    height: verticalScale(50),
    width: moderateScale(90),
    top: 0,
    marginBottom: verticalScale(27),
    borderWidth: 0,
  },

  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.primaryColor,
    height: verticalScale(80),
  },
  inputIOS: {
    height: verticalScale(80),
    backgroundColor: AppColors.primaryColor,
    paddingLeft: 15,
    color: AppColors.textGray,
    paddingRight: 15,
  },
  nUserView: {
    height: hp('5'),
    justifyContent: 'center',
    alignItems: 'flex-end',
    //width: wp("30"),
    alignSelf: 'flex-end',
    borderBottomWidth: 1,
    right: Platform.OS === 'ios' ? hp('0') : hp('0'),
  },
  nUserText: {
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(1.5),
    alignSelf: 'center',
    padding: wp(1.8),
    alignSelf: 'center',
    textAlign: 'center',
  },
});

export default ForgetPassword;
