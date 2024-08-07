import React from 'react';
import { Actions } from 'react-native-router-flux';
import { Alert, Dimensions, BackHandler, Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import { SHApiConnector } from '../../network/SHApiConnector';
import { getUniqueId } from 'react-native-device-info';
import SHButtonDefault from '../../shared/SHButtonDefault';
import { AppUtils } from '../../utils/AppUtils';
import firebaseNotifications from '../../utils/firebaseNotifications';
import auth from '@react-native-firebase/auth';
import ProgressLoader from 'rn-progress-loader';
import AsyncStorage from '@react-native-community/async-storage';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { strings } from '../../locales/i18n';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Clipboard from '@react-native-community/clipboard';
import otpStyles from '../../styles/otpStyles';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const children = ({ remainingTime }) => {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return `${minutes}:${seconds}`;
};
class SmsotpScreen extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('OTP Screen');
    this.state = {
      code: '',
      confirmResult: null,
      isLoading: false,
      isDataVisible: false,
      verificationCode: '',
      verificationId: '',
      resendOtp: false,
      user: null,
      submitOtp: true,
      verifyOtp: false,
      errorOtp: false,
      successOtp: false,
    };
    this.otpRef = React.createRef(null);
  }

  async componentDidMount() {
    const { manualVerify } = this.state;
    if (Platform.OS === 'android') {
      setTimeout(() => {
        this.otpRef.current.focusField(0);
      }, 500);
      Clipboard.setString('');
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Check current route before navigating back
        const currentRoute = Actions.currentScene;
        if (currentRoute === 'SmsotpScreen') {
          Actions.LoginMobile();
          return true;
        }
        return false;
      });
    }
    //this.getLocation();
    /**
     * firebase
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
        console.log(error);
      });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuthStateChanged) {
      this.unsubscribeAuthStateChanged();
    }
    
    if (this.backHandler) {
      this.backHandler.remove();
    }
}


  _onFinishCheckingCode(otpCode) {
    if (otpCode || otpCode !== '') {
      this.getOtpMessage(otpCode);
    } else {
      alert(strings('common.common.incorrectOTP'));
    }
  }

  showAlert() {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', strings('common.common.otpSentAgain'), strings('doctor.button.ok'), function () {});
    }, 500);
  }

  /**
   * firebase
   */
  // Handle the button press
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
          console.log("Check confirmation", confirmation);
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

  saveUserData = async () => {
    this.setState({ isLoading: true });
    const sResp = await SHApiConnector.registerNewUser(this.props.userDetail);
    console.log(this.props.userDetail,'this.props.userDetail')
    this.setState({ isLoading: false });
    if (sResp) {
      if (sResp.status !== 200) {
        this.firebaseLogout();
        setTimeout(() => {
          //AppUtils.showMessage(this, '', sResp.data.message, () => {});
          AppUtils.showMessage(this, '', sResp.data.message, strings('doctor.button.ok'), () => {});
        }, 500);
        Actions.LoginMobile();
      } else {
        //susccess
        await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER, JSON.stringify(sResp.data.data.user));
        await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(sResp.data.data.user));
        await AsyncStorage.setItem(AppStrings.contracts.SESSION_INFO, JSON.stringify({ session: sResp.data.data.session }));
        await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
        await AsyncStorage.setItem(AppStrings.contracts.IS_PROFILE_AVAILABLE, JSON.stringify({ isProfileAvailable: true }));
       
        this.setState({ isLoading: false, verifyOtp: false, submitOtp: false, errorOtp: true });
        const googleUserData = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.GOOGLE_USER_DATA));
        if (googleUserData) {
          Alert.alert(
            '',
            strings('common.common.profileCompleted'),
           
            [
              {
                text: strings('doctor.button.ok'),
                onPress: () => Actions.MainScreen(),
              },
            ],
            { cancelable: false }
          );
          await AsyncStorage.setItem(AppStrings.contracts.GOOGLE_USER_DATA, JSON.stringify({ googleUserData : null}))
        } else {
          Alert.alert(
            strings('common.common.registrationSuccess'),
            strings('common.common.registrationSuccessEnterOTP'),
            [
              {
                text: strings('doctor.button.ok'),
                onPress: () => Actions.MainScreen(),
              },
            ],
            { cancelable: false }
          );
        }
       
      }
    } else {
      setTimeout(() => {
        AppUtils.showMessage(this, '', strings('string.mandatory.error_10003'), strings('doctor.button.ok'), () => {});
      }, 500);
    }
  };

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
          this.saveUserData();
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
          this.saveUserData();
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

  render() {
    const { autoVerify, resendOtp, user, submitOtp, verifyOtp, errorOtp, successOtp } = this.state;
    return (
      <KeyboardAwareScrollView>
        {/* <Spinner visible={true} textContent={'Auto Verifying...'} textStyle={styles.spinnerTextStyle} /> */}
        <View testId="otpView" style={styles.container}>
          <View style={styles.mobVeri}>
            <Text style={styles.nameText}>{strings('common.common.mobVerification')}</Text>
            <Text style={styles.verMess}>{strings('common.common.sentAccessCode')}</Text>
          </View>
          <View style={{ height: verticalScale(50) }}>
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
              marginTop: verticalScale(80),
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
                btnText={strings('doctor.button.continue')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(30), borderRadius: widthPercentageToDP(2), margin: moderateScale(5) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                //onBtnClick={() => this._onFinishCheckingCode(this.state.code)}
                onBtnClick={() => this.handleVerifyCode()}
              />
            )}
            {verifyOtp && (
              <SHButtonDefault
                btnText={strings('doctor.button.capVerifying')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(30), borderRadius: widthPercentageToDP(2), margin: moderateScale(5) }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
              />
            )}
            {errorOtp && (
              <SHButtonDefault
                btnText={strings('doctor.button.continue')}
                btnType={'normal'}
                style={{ marginTop: verticalScale(30), borderRadius: widthPercentageToDP(2), margin: moderateScale(5), backgroundColor: '#eee' }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
              />
            )}
          </View>
        </View>
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </KeyboardAwareScrollView>
    );
  }

  cancel() {
    Actions.MainScreen();
  }

  sendOTP(code) {
    this.setState({ code: code }, () => this._onFinishCheckingCode(code));
  }
}

const styles = StyleSheet.create({
  container: {
    height: height,
    width: width,
    backgroundColor: AppColors.whiteColor,
  },
  mobVeri: {
    height: verticalScale(100),
    alignItems: 'center',
    marginTop: moderateScale(100),
    margin: moderateScale(10),
  },
  nameText: {
    color: AppColors.primaryColor,
    fontWeight: 'bold',
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(22),
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: verticalScale(15),
  },
  verMess: {
    alignSelf: 'center',
    color: AppColors.textGray,
    textAlign: 'center',
    lineHeight: heightPercentageToDP(3),
    fontFamily: AppStyles.fontFamilyBold,
  },
  codeText: {
    marginLeft: moderateScale(20),
    color: AppColors.primaryColor,
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyBold,
  },
  codeResend: {
    color: AppColors.primaryColor,
    fontFamily: AppStyles.fontFamilyBold,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: moderateScale(15),
    height: verticalScale(90),
  },
  buttonView: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  continuetext: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
  },
  continueButton: {
    height: verticalScale(50),
    width: moderateScale(120),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    backgroundColor: AppColors.primaryColor,
    alignSelf: 'center',
  },
});

export default SmsotpScreen;
