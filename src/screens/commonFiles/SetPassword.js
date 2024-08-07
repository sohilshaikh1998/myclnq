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
import auth from '@react-native-firebase/auth';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Clipboard from '@react-native-community/clipboard';
import otpStyles from '../../styles/otpStyles';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class SetPassword extends React.Component {
  constructor(props) {
    super(props);
    Geocoder.init(AppStrings.MAP_API_KEY);
    this.onCountry = this.onCountry.bind(this);
    AppUtils.analyticsTracker('Set Password');
    AppUtils.console('sdvfcwsedg345', props);
    this.state = {
      isLoading: false,
      password: '',
      confirmPassword: '',
      code: '',
      confirmResult: null,
      verificationCode: '',
      verificationId: '',
      autoVerify: false,
      resendOtp: false,
      navigate: true,
      isNavigating: false,
      user: null,
      submitOtp: true,
      verifyOtp: false,
      errorOtp: false,
      successOtp: false,
    };
    this.otpRef = React.createRef(null);
  }

  async componentDidMount() {
    if (Platform.OS == 'android') {
      setTimeout(() => {
        this.otpRef.current.focusField(0);
      }, 500);
      Clipboard.setString('');
    }
    /**
     * firebase auth
     */
    this.signInWithPhoneNumber()
      .then(() => {
        this.unsubscribeAuthStateChanged = auth().onAuthStateChanged((user) => {
          if (user) {
            this.setState({ user });
          } else {
            // User is signed out
            this.setState({ user: null });
          }
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuthStateChanged) {
      this.unsubscribeAuthStateChanged();
    }
  }

  // handle otp
  async signInWithPhoneNumber() {
    const countryCode = '+' + this.props.userDetail.countryCode;
    const mobileNumber = this.props.userDetail.phoneNumber;
    this.setState({ resendOtp: false });
    try {
      if(Platform.OS === 'ios') {
        return auth()
        .signInWithPhoneNumber(countryCode + mobileNumber)
        .then((confirmResult) => {
          this.setState({ confirmResult });
          this.setState({
            verifyOtp: false,
            submitOtp: true,
            errorOtp: false,
          });
          return confirmResult;
        })
        .catch((error) => {
          alert(error.message);
          if (error) {
            this.setState({
              verifyOtp: false,
              submitOtp: false,
              errorOtp: true,
            });
          }
        });
      } else {
        auth().verifyPhoneNumber(countryCode + mobileNumber).then((confirmation) => {
          this.setState({
            confirmResult: confirmation,
            verificationId: confirmation.verificationId,
            verifyOtp: false,
            submitOtp: true,
            errorOtp: false,
          });
          return confirmation;
        })
        .catch((error) => {
          alert(error.message);
          if (error) {
            this.setState({
              verifyOtp: false,
              submitOtp: false,
              errorOtp: true,
            });
          }
        });
      }
    } catch (error) {
      alert(error.message);
      if (error) {
        this.setState({
          verifyOtp: false,
          submitOtp: false,
          errorOtp: true,
        });
      }
    }
  }
  /**
   * firebase logout
   */
  firebaseLogout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('firebaselogout');
      })
      .catch((error) => {
        console.log(error);
        // An error happened.
      });
  };
  // handle verification
  handleVerifyCode = async () => {
    // Request for OTP verification
    const { verificationCode, verificationId, confirmResult } = this.state;
    if (verificationCode.length == 6) {
      this.setState({
        verifyOtp: true,
        submitOtp: false,
      });
      if (Platform.OS == 'ios' || verificationId == '' || verificationId == null || verificationId == undefined) {
        confirmResult
        .confirm(verificationCode)
        .then(() => {
          this.verifyOtpAndSetPwd();
        })
        .catch((error) => {
          alert(error.message);
          this.setState({
            verifyOtp: false,
            submitOtp: false,
            errorOtp: true,
          });
        });
      } else {
        try {
          const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
          await auth().signInWithCredential(credential);
          this.verifyOtpAndSetPwd();
        } catch (error) {
          alert(error.message);
          this.setState({
            verifyOtp: false,
            submitOtp: false,
            errorOtp: true,
          });
        }
      }
    } else {
      alert('Please enter a 6 digit OTP code.');
    }
  };

  async validateNumber() {
    AppUtils.console('sdfcasfvdgfc', this.state);
    if (this.state.verificationCode.length != 6) {
      alert(strings('common.common.incorrectOTP'));
    } else if (this.state.password.trim().length < 9) {
      Alert.alert('', strings('common.common.smallPassword'));
    } else if (this.state.password.trim() != this.state.confirmPassword.trim()) {
      Alert.alert('', strings('common.common.passwordNotMatching'));
    } else {
      this.handleVerifyCode();
    }
  }

  async verifyOtpAndSetPwd() {
    console.log('2327623');
    let userDetail = {
      countryCode: this.props.userDetail.countryCode,
      phoneNumber: this.props.userDetail.phoneNumber,
      password: this.state.password.trim(),
      //OTP: this.state.code,
    };
    //console.log('verifyOtpAndSetPwd', userDetail);

    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.otpVerifySetPwd(userDetail);
      if (response.status === 200) {
        // if (response.data.status) {
        this.setState({ isLoading: false });
        setTimeout(() => {
          Alert.alert(
            '',
            strings('common.common.passwordUpdated'),
            [
              {
                text: strings('doctor.button.ok'),
                onPress: () => (this.props.isUserLoggedIn ? Actions.MainScreen() : Actions.LoginOptions()),
                style: 'cancel',
              },
            ],
            { cancelable: false }
          );
        }, 500);
      } else {
        this.setState({ isLoading: false, verifyOtp: false, submitOtp: false, errorOtp: true });
        setTimeout(() => {
          Alert.alert(
            '',
            response.data.message,
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
    const { autoVerify, resendOtp, user, submitOtp, verifyOtp, errorOtp, successOtp } = this.state;
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
              }}
            >
              {strings('common.common.verifySetPwd')}
            </Text>
            <Text
              style={{
                fontSize: hp(1.8),
                color: AppColors.textGray,
                fontFamily: AppStyles.fontFamilyRegular,
                lineHeight: hp(3),
                marginTop: hp(1),
              }}
            >
              {strings('common.common.enterOtp', { number: '' })}
              <Text style={{ color: AppColors.primaryColor, fontFamily: AppStyles.fontFamilyMedium }}>
                {'+' + this.props.userDetail.countryCode + ' ' + this.props.userDetail.phoneNumber}
              </Text>
            </Text>
          </View>
          <View style={{ height: verticalScale(80) }}>
            <OTPInputView
              ref={this.otpRef}
              style={otpStyles.container}
              pinCount={6}
              autoFocusOnLoad
              codeInputFieldStyle={otpStyles.underlineStyleBase}
              codeInputHighlightStyle={otpStyles.underlineStyleHighLighted}
              onCodeFilled={(code) => this.setState({ verificationCode: code })}
            />
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
                // returnKeytype="done"
                activeLineWidth={0}
                lineWidth={0}
              />
            </View>
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
                placeholder={strings('common.common.confirmPassword')}
                placeholderTextColor={AppColors.primaryGray}
                value={this.state.confirmPassword}
                onChangeText={(input) => this.setState({ confirmPassword: input })}
                underlineColorAndroid={'white'}
                //returnKeytype="done"
                activeLineWidth={0}
                lineWidth={0}
                //onSubmitEditing={() => this.validateNumber()}
              />
            </View>
          </View>
          <View
            style={{
              marginTop: verticalScale(15),
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          >
            <>
              {!errorOtp && (
                <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 3, fontWeight: '400' }}>
                  Didn't receive the OTP yet?
                </Text>
              )}
              {!resendOtp && !errorOtp && (
                <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', fontWeight: '400', marginBottom: 10 }}>Resend</Text>
              )}
              {resendOtp && (
                <TouchableOpacity onPress={() => this.signInWithPhoneNumber()}>
                  <Text style={{ fontSize: 14, color: '#fd2f31', textAlign: 'center', fontWeight: '800', marginBottom: 10 }}>Resend</Text>
                </TouchableOpacity>
              )}
              {!resendOtp && !errorOtp && (
                <CountdownCircleTimer
                  onComplete={() => this.setState({ resendOtp: true })}
                  isPlaying
                  duration={30}
                  colors="#fd2f31"
                  colorsTime={[7, 5, 2, 0]}
                  size={60}
                  strokeWidth={4}
                >
                  {({ remainingTime, animatedColor }) => {
                    const minutes = Math.floor(remainingTime / 60);
                    const seconds = remainingTime % 60;
                    return (
                      <View style={{ padding: 0 }}>
                        <Text style={{ fontSize: 12, textAlign: 'center' }}>{`0${minutes}:${seconds}s`}</Text>
                      </View>
                    );
                  }}
                </CountdownCircleTimer>
              )}
            </>
          </View>

          <View style={styles.buttonView}>
            {submitOtp && (
              <SHButtonDefault
                btnText={strings('doctor.button.capContinue')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(15), borderRadius: wp(2) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => this.validateNumber()}
              />
            )}
            {verifyOtp && (
              <SHButtonDefault
                btnText={strings('doctor.button.capVerifying')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(15), borderRadius: wp(2) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
              />
            )}
            {errorOtp && (
              <SHButtonDefault
                btnText={strings('doctor.button.capContinue')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(15), borderRadius: wp(2), backgroundColor: '#eee' }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground="#eee"
              />
            )}
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

  showAlert() {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', strings('common.common.otpSentAgain'), strings('doctor.button.ok'), function () {});
    }, 500);
  }

  async resendOTP() {
    var self = this;
    var countryCode = this.props.userDetail.countryCode;
    var mobileNumber = this.props.userDetail.phoneNumber;

    var userDetail = {
      countryCode: countryCode,
      phoneNumber: mobileNumber,
    };
    this.setState({ isLoading: true });
    let response = await SHApiConnector.forgetOrSetPassword(userDetail);
    AppUtils.console('szxcsfxv', response);
    if (response.data.status) {
      this.setState({ isLoading: false }, () => {
        this.showAlert();
      });
    } else {
      this.setState({ isLoading: false });
      setTimeout(() => {
        Alert.alert(
          '',
          response.data.message,
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
    marginTop: hp(2),
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
  codeResend: {
    color: AppColors.primaryColor,
    fontFamily: AppStyles.fontFamilyBold,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: moderateScale(15),
  },
});

export default SetPassword;
