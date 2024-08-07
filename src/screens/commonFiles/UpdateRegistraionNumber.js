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
  I18nManager
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
const isRTL = I18nManager.isRTL;

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class UpdateRegistrationNumber extends React.Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    this.onCountry = this.onCountry.bind(this);
    AppUtils.analyticsTracker('Update phone number');
    AppUtils.console('sdvfcwsedg345', props);
    this.state = {
      countryCode: props.countryDetails.dial_code,
      mobileNumber: '',
      isC: false,
      isLoading: false,
      isCountryListVisible: false,
      navigate: true,
      isNavigating: false,
      numberLimit: props.countryDetails.code === 'IN' ? 10 : props.countryDetails.dial_code == '62' ? 13 :  8,
      cca2: props.countryDetails.code,
      countryName: props.countryDetails.name,
    };
  }

  componentDidMount() {
    let self = this;
    if (Platform.OS === 'android') {
      // BackHandler.addEventListener("hardwareBackPress", () => {
      //     self.exitAlert();
      //      return false;
      // });
      this.focusListener = this.props.navigation.addListener('didFocus', () => {
       this.setState({
        navigate: true,
        isNavigating: false
       })
      });
    }
    //this.getLocation();  
  }

  componentWillUnmount() {
    let self = this;
    if (Platform.OS === 'android') {
      // BackHandler.removeEventListener("hardwareBackPress", () => {
      //     self.exitAlert();
      //     return true;
      // });
      this.focusListener.remove();
    }
  }

  async getLocation() {
    if (Platform.OS === 'ios') {
      this.getUserCurrentLocation();
    } else {
      const permissionGranted = await AppUtils.locationPermissionsAccess();
      AppUtils.console('permission granted', permissionGranted, PermissionsAndroid.RESULTS.GRANTED);
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
        }
          else if(address_components[i].long_name ==='Indonesia'){
            this.setState({
              countryCode: '62',
              cca2: 'ID'
            });
            return;
          }
         console.log("adddress",address_components[i])
        }
      }
    return '';
  }

  validateNumber() {
    var numberLength = this.state.mobileNumber.length;
    AppUtils.console('Number', this.state.numberLimit, ' Length ', numberLength);
    if (this.state.mobileNumber == this.props.countryDetails.phoneNumber) {
      Alert.alert('', strings('string.mandatory.mobMatching'));
    } else if (this.state.numberLimit == 12 && numberLength < 8) {
      Alert.alert('', strings('string.mandatory.mobNumber'));
    } else if (this.state.numberLimit == 13 && numberLength < 8) {
      alert(strings('string.mandatory.mobNumber'));
    }else if (this.state.numberLimit != 12 && numberLength < this.state.numberLimit) {
       this.state.countryCode == '62' ? this.registerUser() :
      alert(strings('string.mandatory.mobNumber'));
    } else {
      this.setState({
        navigate: false,
        isNavigating: true
      });
      this.registerUser();
    }
  }

  async registerUser() {
    let userDetail = {
      countryCode: this.state.countryCode,
      phoneNumber: this.state.mobileNumber,
    };
    Actions.UpdateNumberOTP({ userDetail: userDetail });
    // try {
    //     this.setState({ isLoading: true });
    //     let response = await SHApiConnector.updateRegistrationNumber(userDetail);
    //     AppUtils.console("szxcsfxv", response);
    //     if (response.data.status) {
    //         this.setState({ isLoading: false }, () => {
    //             Actions.UpdateNumberOTP({ userDetail: userDetail });
    //         });
    //     } else {
    //         this.setState({ isLoading: false });
    //         setTimeout(() => {
    //             Alert.alert(
    //                 strings('common.common.updationFailed'),
    //                 response.data.error_message,
    //             );
    //         }, 500);
    //     }
    // } catch (err) {
    //     AppUtils.console("sdx234ertgsdzxc", err)
    //     this.setState({ isLoading: false });
    // }
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
            <Image style={{ height: hp(20), width: hp(25) }} source={require('../../../assets/images/myclnq-homescreen.png')} />
          </View>
          <View style={{ marginLeft: wp(5), marginTop: hp(3) }}>
            <Text
              style={{
                fontSize: hp(3),
                color: AppColors.blackColor3,
                fontFamily: AppStyles.fontFamilyMedium,
                marginTop: hp(1),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('common.common.updateNumber')}
            </Text>
            <Text
              style={{
                fontSize: hp(2.2),
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                marginRight: wp(15),
                lineHeight: hp(3),
                marginTop: hp(1),
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings('common.common.enterNumberToReceiveOTP', { otp: '' })}
              <Text style={{ fontFamily: AppStyles.fontFamilyBold }}>OTP</Text>
            </Text>
            <Text
              style={{
                fontSize: hp(2.2),
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                marginTop: hp(8),
                textAlign: isRTL ? 'left' : 'auto',
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
                isProduction={true}
                withEmoji={!this.state.isCountryListVisible}
                withFlag={!this.state.isCountryListVisible}
                countryCode={this.state.cca2}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: parentHeight,
              width: parentWidth,
              borderBottomWidth: 1,
              borderBottomColor: AppColors.backgroundGray,
              alignSelf: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginTop: wp(2),
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
                  textAlign: isRTL ? 'right' : 'auto',
                }}
                maxLength={this.state.numberLimit}
                autoFocus={false}
                placeholder={strings('common.common.enterNumber')}
                placeholderTextColor={AppColors.primaryGray}
                keyboardType="number-pad"
                value={this.state.mobileNumber}
                onChangeText={(input) => this.onChangedText(input)}
                underlineColorAndroid={'white'}
                returnKeytype="done"
                onSubmitEditing={() => this.validateNumber()}
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
    marginTop: AppUtils.isX ? hp(5) : hp(2),
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
    color: AppColors.primaryColor,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp('2'),
    borderBottomColor: AppColors.primaryColor,
    width: wp('35'),
    height: hp('3'),
    alignSelf: 'center',
    textAlign: 'right',
    marginRight: Platform.OS === 'ios' ? wp(8) : wp(12),
    textDecorationLine: Platform.OS === 'ios' ? 'underline' : 'underline',
  },
});

export default UpdateRegistrationNumber;
