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
import { getCountry, getTimeZone } from 'react-native-localize';
import { strings } from '../../locales/i18n';
import PasswordInputText from 'react-native-hide-show-password-input';
import firebaseNotifications from '../../utils/firebaseNotifications';
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import { Validator } from '../../shared/Validator';

const isRTL = I18nManager.isRTL;
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class LoginMobile extends React.Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    this.onCountry = this.onCountry.bind(this);
    AppUtils.analyticsTracker('Login Mobile');

    let callingCode = AppUtils.getCountryCallingCode(getCountry());
    this.state = {
      countryCode: callingCode,
      mobileNumber: '',
      email: '',
      showCountryPicker: true,
      isC: false,
      isLoading: false,
      isCountryListVisible: false,
      password: '',
      numberLimit: callingCode == '91' ? 10 : callingCode == '65' ? 8 : callingCode == '62' ? 13 : 12,
      cca2: getCountry(),
      countryName: getCountry() === 'IN' || getTimeZone() === 'Asia/Kolkata' ? 'India' : 'Singapore',
      uid: '',
      token: '',
      fName: '',
      lName: '',
      signInProgress: false,
    };
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.exitAlert);
    }

    // this.getLocation();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.exitAlert);
  }

  exitAlert = () => {
    Actions.LoginOptions();
    return true;
  };

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
      AppUtils.console('xdfvsdzxfv', address_components);
      if (addressType == 'country') {
        if (address_components[i].long_name === 'India') {
          this.setState({
            countryCode: '91',
            cca2: 'IN',
          });
          return;
        } else if (address_components[i].long_name === 'Indonesia') {
          this.setState({
            countryCode: '62',
            cca2: 'ID',
          });
          return;
        }
      }
    }
    return '';
  }

  async validateNumber() {
    var numberLength = this.state.mobileNumber.length;
    if (Validator.isBlank(this.state.mobileNumber)) {
      alert(strings('string.mandatory.emailOrPhone'), true);
    } else if (this.state.numberLimit == 12 && numberLength < 8) {
      alert(strings('string.mandatory.mobNumber'));
    } else if (this.state.numberLimit == 13 && numberLength < 8) {
      alert(strings('string.mandatory.mobNumber'));
    } else if (this.state.numberLimit != 12 && numberLength < this.state.numberLimit) {
      this.state.countryCode == '62' ? this.loginPassword() : alert(strings('string.mandatory.mobNumber'));
    } else if (!this.state.password || this.state.password.trim() == '') {
      alert(strings('common.common.invalidPwd'));
    } else {
      this.loginPassword();
    }
  }

  async validateEmail() {
    if (Validator.isBlank(this.state.email)) {
      alert(strings('string.mandatory.emailOrPhone'), true);
    } else if (!Validator.validateEmail(this.state.email)) {
      alert(strings('string.mandatory.invalidEmail'), true);
    } else if (!this.state.password || this.state.password.trim() == '') {
      alert(strings('common.common.invalidPwd'));
    } else {
      this.loginPassword();
    }
  }

  async loginPassword() {
    let userDetail = {
      countryCode: this.state.showCountryPicker ? this.state.countryCode : '',
      phoneNumber: this.state.mobileNumber,
      email: this.state.email,
      password: this.state.password.trim(),
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
    };

    let googleUserDetail = {
      email: this.state.email,
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      token: this.state.token,
      uid: this.state.uid,
    };

    const formData = !this.state.uid ? userDetail : googleUserDetail;

    let dataToSendToRegisterScreen = {
      email: this.state.email,
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      token: this.state.token,
      uid: this.state.uid,
      fName: this.state.fName,
      lName: this.state.lName,
    };

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    try {
      this.setState({ isLoading: true });
      await delay(1000);

      let response = await SHApiConnector.userPasswordLogin(formData);
      console.log(response.data, 'responseee1');
      //401,10034
      if (response.status === 401 && response.data.error_code === '10034') {
        await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
        Actions.MainScreen();
      }
      if (response.data.status) {
        this.setState({ isLoading: false });
        await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(AppStrings.contracts.SESSION_INFO, JSON.stringify({ session: response.data.session }));
        await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
        await AsyncStorage.setItem(
          AppStrings.contracts.IS_PROFILE_AVAILABLE,
          JSON.stringify({
            isProfileAvailable: response.data.isProfileAvailable,
          })
        );
        this.setState({ isLoading: false });
        if (response.data.isProfileAvailable) {
          Actions.MainScreen();
        } else {
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.user));
          Actions.UserSignUp({ isNewUser: false });
        }
        this.setState({ isDataVisible: false });
      } else {
        this.setState({ isLoading: false });
        console.log(response?.data?.error_code, 'responseeeeeee2');
        if (response?.data?.error_code == 10004) {
          setTimeout(() => {
            Alert.alert(
              'Unregistered User',
              '',
              [
                {
                  text: strings('doctor.button.ok'),
                  onPress: () => Actions.UserSignUp({ isNewUser: true, userDetail: dataToSendToRegisterScreen }),
                  style: 'cancel',
                },
              ],
              { cancelable: false }
            );
          }, 500);
        }
        if (response?.data?.error_code == 401) {
          setTimeout(() => {
            Alert.alert(
              '',
              response.data.error_message,
              [
                {
                  text: strings('doctor.button.ok'),
                  onPress: () => AppUtils.console('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              { cancelable: false }
            );
          }, 500);
        }
      }
    } catch (err) {
      AppUtils.console('sdx234ertgsdzxc', err);
      this.setState({ isLoading: false });
    }
  }

  async registerUser() {
    let userDetail = {
      countryCode: this.state.countryCode,
      phoneNumber: this.state.mobileNumber,
    };

    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getMobileNumber(userDetail);
      AppUtils.console('szxcsfxv', response);
      if (response.data.status) {
        this.setState({ isLoading: false }, () => {
          Actions.OTPScreen({ userDetail: userDetail });
        });
      } else {
        this.setState({ isLoading: false });
        setTimeout(() => {
          Alert.alert(
            strings('common.common.notRegistered'),
            response.data.error_message,
            [
              {
                text: strings('doctor.button.cancel'),
                onPress: () => AppUtils.console('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: strings('common.common.registerNow'),
                onPress: () => Actions.UserSignUp({ isNewUser: true }),
              },
            ],
            { cancelable: false }
          );
        }, 500);

        // setTimeout(() => {
        //     Toast.show(response.data.error_message);
        // }, 500);
      }
    } catch (err) {
      AppUtils.console('sdx234ertgsdzxc', err);
      this.setState({ isLoading: false });
    }
  }

  onChangedText(input) {
    let newText = '';
    let inputText = '';
    let numbers = '0123456789';
    inputText += input;

    if (!isNaN(parseInt(input[0]))) {
      for (var i = 0; i < input.length; i++) {
        if (AppUtils.hasString(inputText)) {
          newText = newText + input[i];
          this.setState({ showCountryPicker: false, email: newText, mobileNumber: '' });
        } else if (numbers.indexOf(input[i]) > -1) {
          newText = newText + input[i];
          this.setState({ showCountryPicker: true, email: '', mobileNumber: newText });
        }
      }
    } else if (inputText == '') {
      this.setState({ showCountryPicker: true, mobileNumber: '', email: '' });
    } else {
      this.setState({ showCountryPicker: false, email: inputText, mobileNumber: '' });
    }
  }

  onCountry() {
    this.setState({ isC: !this.state.isC });
  }

  render() {
    let parentMargin = 16;
    let parentWidth = AppUtils.screenWidth - parentMargin * 2;
    let parentHeight = PixelRatio.getPixelSizeForLayoutSize(25);
    let cCodeWidth = PixelRatio.getPixelSizeForLayoutSize(25);

    return (
      <KeyboardAwareScrollView bounces={false}>
        <View style={styles.container}>
          <View style={styles.clnqLogo}>
            <Image style={{ height: hp(18), width: hp(18) }} source={require('../../../assets/images/myclnq-homescreen.png')} />
          </View>
          <View style={{ alignItems: 'center', marginTop: hp(2) }}>
            <Text
              style={{
                fontSize: hp(2.5),
                color: AppColors.blackColor3,
                fontFamily: AppStyles.fontFamilyMedium,
                marginTop: hp(1),
              }}
            >
              {strings('common.common.loginRegister')} {AppUtils.isProduction() ? ' ' : 'Staging Build'}
            </Text>
          </View>

          {this.state.showCountryPicker ? (
            <View>
              <Text
                style={{
                  fontSize: hp(2),
                  color: AppColors.textGray,
                  fontFamily: AppStyles.fontFamilyRegular,
                  marginTop: hp(5),
                  marginLeft: wp(5),
                  marginRight: isRTL ? wp(5) : null,
                }}
              >
                {strings('common.common.selectCountry')}
              </Text>
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
                    onOpen={() => this.setState({ isCountryListVisible: true })}
                    withEmoji={!this.state.isCountryListVisible}
                    withFlag={!this.state.isCountryListVisible}
                    countryCode={this.state.cca2}
                  />
                  {this.state.isCountryListVisible ? (
                    <CountryPicker
                      visible={this.state.isCountryListVisible}
                      closeable
                      withFilter
                      withFlag
                      withCallingCode
                      withCountryNameButton
                      onClose={() => this.setState({ isCountryListVisible: false })}
                      onSelect={(value) => {
                        this.setState({
                          cca2: value.cca2,
                          countryCode: value.callingCode[0],
                          numberLimit: value.callingCode[0] == '91' ? 10 : value.callingCode[0] == '65' ? 8 : value.callingCode[0] == '62' ? 13 : 12,
                          isCountryListVisible: false,
                          mobileNumber: this.state.mobileNumber,
                        });
                      }}
                      cca2={this.state.cca2}
                      translation="eng"
                    />
                  ) : (
                    <View></View>
                  )}
                  <TouchableHighlight
                    underlayColor={'transparent'}
                    onPress={() => this.setState({ isCountryListVisible: true })}
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
            </View>
          ) : null}

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
                testID="loginNumber"
                style={{
                  width: parentWidth - (cCodeWidth + 10),
                  color: AppColors.blackColor3,
                  fontSize: 17,
                  padding: hp(0.5),
                  overflow: 'hidden',
                  textAlign: isRTL ? 'right' : 'left',
                }}
                maxLength={this.state.showCountryPicker ? this.state.numberLimit : 100}
                autoFocus={false}
                placeholder={strings('common.common.enterEmailOrNumber')}
                placeholderTextColor={AppColors.primaryGray}
                autoCapitalize={'none'}
                keyboardType="email-address"
                value={this.state.showCountryPicker ? this.state.mobileNumber : this.state.email}
                onChangeText={(input) => this.onChangedText(input)}
                underlineColorAndroid={'white'}
              />
            </View>
          </View>
          <View
            style={{
              alignSelf: 'flex-end',
              justifyContent: 'flex-end',
              marginRight: wp(3),
            }}
          >
            {/* <TouchableOpacity
              onPress={() => Actions.UserSignUp({ isNewUser: true })}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                borderBottomWidth: 0,
                marginTop: hp(1),
                borderRadius: wp(1),
                backgroundColor: AppColors.whiteColor,
              }}
            >
              <Text style={[styles.nUserText]}>{strings('common.common.newUser')}</Text>
            </TouchableOpacity> */}
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: parentWidth,
              borderWidth: 1,
              marginTop: hp(3),
              height: hp(6),
              borderColor: AppColors.backgroundGray,
              borderRadius: wp(1),
              alignSelf: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                marginBottom: hp(0.5),
                width: wp(90),
              }}
            >
              <PasswordInputText
                testID="loginNumber"
                label=""
                style={{
                  width: wp(85),
                  marginLeft: wp(3),
                  color: AppColors.blackColor3,
                  fontSize: 20,
                }}
                placeholder={strings('common.common.password')}
                placeholderTextColor={AppColors.primaryGray}
                value={this.state.password}
                onChangeText={(input) => this.setState({ password: input })}
                underlineColorAndroid={'white'}
                returnKeytype="done"
                activeLineWidth={0}
                lineWidth={0}
                onSubmitEditing={() => (this.state.showCountryPicker ? this.validateNumber() : this.validateEmail())}
              />
            </View>
          </View>
          <View
            style={{
              alignSelf: 'flex-end',
              justifyContent: 'flex-end',
              marginRight: wp(3),
            }}
          >
            <TouchableOpacity
              onPress={() =>
                Actions.ForgetPassword({
                  cca2: this.state.cca2,
                  countryCode: this.state.countryCode,
                  numberLimit: this.state.numberLimit,
                  mobileNumber: this.state.mobileNumber,
                  countryName: this.state.countryName,
                  isUserLoggedIn: false,
                })
              }
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                borderBottomWidth: 0,
                marginTop: hp(1),
                borderRadius: wp(1),
                backgroundColor: AppColors.whiteColor,
              }}
            >
              <Text style={[styles.nUserText]}>{strings('common.common.forgetPwd')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center' }}>
            <SHButtonDefault
              btnText={strings('doctor.button.capContinue')}
              btnType={'normal'}
              style={{ marginTop: verticalScale(30), borderRadius: wp(2) }}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              onBtnClick={() => {
                Actions.MainScreen();
                return;
                this.state.showCountryPicker ? this.validateNumber() : this.validateEmail();
              }}
            />
          </View>
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
    marginTop: AppUtils.isX ? hp(5) : hp(3),
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
  googlebtnView: {
    alignItems: 'center',
    marginVertical: hp(2),
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
    color: AppColors.primaryColor,
    fontFamily: AppStyles.fontFamilyMedium,
    textDecorationLine: 'underline',
    fontSize: hp(1.5),
    alignSelf: 'center',
    padding: wp(1.8),
    alignSelf: 'center',
    textAlign: 'center',
  },

  signInBtnText: {
    fontWeight: '800',
    color: 'rgb(115, 114, 114)',
    fontSize: 14,
    marginRight: '10%',
  },
  googleLogo: {
    width: wp(4),
    height: wp(6),
  },
});

export default LoginMobile;
