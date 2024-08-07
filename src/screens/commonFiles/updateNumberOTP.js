import React from 'react';
import { Actions } from 'react-native-router-flux';
import { Alert, Dimensions, BackHandler, Platform, StyleSheet, Text, TouchableHighlight, View, TouchableOpacity } from 'react-native';
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
import ProgressLoader from 'rn-progress-loader';
import AsyncStorage from '@react-native-community/async-storage';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { strings } from '../../locales/i18n';
import auth from '@react-native-firebase/auth';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Clipboard from '@react-native-community/clipboard';
import otpStyles from '../../styles/otpStyles';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class UpdateNumberOTP extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Update Number OTP Screen');
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

  getOtpMessage(otpNumber) {
    Platform.OS === 'ios' ? this.getOtpMessageIOS(otpNumber) : this.getOtpMessageAndroid(otpNumber);
  }
  componentDidMount() {
    let self = this;
    if (Platform.OS === 'android') {
        setTimeout(() => {
            self.otpRef.current.focusField(0);
        }, 500);
        Clipboard.setString('');
        BackHandler.addEventListener('hardwareBackPress', () => {
            // Ensure this navigation logic is not causing unintended refresh
            Actions.LoginMobile();
            return true;
        });
    }
    // Additional debugging
    console.log("Component mounted");

    //this.getLocation();
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
        console.log(error);
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
        alert(error.message);
        // An error happened.
      });
  };
  // handle verification
  handleVerifyCode = async () => {
    console.log("Verifying code");
    // Request for OTP verification
    const { verificationCode, verificationId, confirmResult } = this.state;
    if (verificationCode.length === 6) {
        this.setState({
            verifyOtp: true,
            submitOtp: false,
        });
        try {
            if (Platform.OS === 'ios' || verificationId == '' || verificationId == null || verificationId == undefined) {
                confirmResult
                .confirm(verificationCode)
                .then(async () => {
                    let countryCode = this.props.userDetail.countryCode;
                    let mobileNumber = this.props.userDetail.phoneNumber;
                    let otpDetails = {
                        countryCode: countryCode,
                        phoneNumber: mobileNumber,
                    };
                    await this.sendOTPInfo(otpDetails);
                    console.log("OTP confirmed successfully");
                })
                .catch((error) => {
                    // Handle authentication error
                    console.log("Authentication error:", error);
                    alert("Authentication failed. Please try again.");
                    this.setState({
                        verifyOtp: false,
                        submitOtp: true,
                        errorOtp: true,
                    });
                });
            } else {
                const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
                await auth().signInWithCredential(credential);
                let countryCode = this.props.userDetail.countryCode;
                let mobileNumber = this.props.userDetail.phoneNumber;
                let otpDetails = {
                    countryCode: countryCode,
                    phoneNumber: mobileNumber,
                };
                await this.sendOTPInfo(otpDetails);
                console.log("OTP confirmed successfully");
            }
        } catch (error) {
            // Handle other errors
            console.log("Error:", error);
            alert("An error occurred. Please try again.");
            this.setState({
                verifyOtp: false,
                submitOtp: true,
                errorOtp: true,
            });
        }
    } else {
        alert('Please enter a 6 digit OTP code.');
    }
};


  async getOtpMessageAndroid(otpNumber) {
    let countryCode = this.props.userDetail.countryCode;
    let mobileNumber = this.props.userDetail.phoneNumber;
    try {
      let otpDetails = {
        countryCode: countryCode,
        phoneNumber: mobileNumber,
        OTP: otpNumber,
      };
      await this.sendOTPInfo(otpDetails);
    } catch (error) {
      AppUtils.console('errrroor', error);
    }
  }

  async getOtpMessageIOS(otpNumber) {
    let countryCode = this.props.userDetail.countryCode;
    let mobileNumber = this.props.userDetail.phoneNumber;

    let otpDetails = {
      countryCode: countryCode,
      phoneNumber: mobileNumber,
      OTP: otpNumber,
    };
    AppUtils.console('sfdgbdaewrsrdqwresrd>>>>>>>>>', otpDetails);
    await this.sendOTPInfo(otpDetails);
  }

  async sendOTPInfo(otpDetails) {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getOtpMessageForUpdateNumbers(otpDetails);
      if (response.status === 200) {
        await AsyncStorage.clear();
        this.setState({ isLoading: false }, () => {
          setTimeout(() => {
            Alert.alert('', strings('common.common.numberUpdated'), [{ text: strings('doctor.button.ok'), onPress: () => AppUtils.logout() }], {
              cancelable: false,
            });
          }, 500);
        });
      } else {
        this.setState({ isLoading: false, verifyOtp: false, submitOtp: false, errorOtp: true });
        setTimeout(() => {
          Alert.alert('', response.data.message);
        }, 500);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      setTimeout(() => {
        Alert.alert(strings('doctor.alertTitle.sorry'), strings('common.common.incorrectOTP'));
      }, 500);
    }
  }

  _onFinishCheckingCode(otpCode) {
    if (otpCode || otpCode !== '') {
      this.getOtpMessage(otpCode);
    } else {
      alert(strings('common.common.incorrectOTP'));
    }
  }

  async resendOTP() {
    var self = this;
    var countryCode = this.props.userDetail.countryCode;
    var mobileNumber = this.props.userDetail.phoneNumber;

    var userDetail = {
      countryCode: countryCode,
      phoneNumber: mobileNumber,
    };
    console.log('userdetails', userDetail);
    const response = await SHApiConnector.updateRegistrationNumber(userDetail);
    console.log('check the response', response);
    if (response) {
      if (response.data.status === 'fail' || response.data.statusCode === 400) {
        setTimeout(() => {
          AppUtils.showMessage(this, '', response.data.message, strings('doctor.button.ok'), function () {});
        }, 500);
      } else {
        self.showAlert();
      }
    }
  }

  showAlert() {
    var self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', strings('common.common.otpSentAgain'), strings('doctor.button.ok'), function () {});
    }, 500);
  }

  render() {
    const { autoVerify, resendOtp, user, submitOtp, verifyOtp, errorOtp, successOtp } = this.state;
    return (
      <KeyboardAwareScrollView>
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
              keyboardType="number-pad"
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
    marginTop: moderateScale(50),
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

export default UpdateNumberOTP;
