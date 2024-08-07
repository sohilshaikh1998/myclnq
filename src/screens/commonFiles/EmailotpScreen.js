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
import Spinner from 'react-native-loading-spinner-overlay';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Clipboard from '@react-native-community/clipboard'
import otpStyles from '../../styles/otpStyles';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
class SmsotpScreen extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('OTP Screen');
    this.state = {
      code: '',
      isLoading: false,
      isDataVisible: false,
    };
    this.otpRef = React.createRef(null);
  }

  async componentDidMount() {
    let self = this;
    const { manualVerify } = this.state;
    if (Platform.OS === 'android') {
      setTimeout(() => {
        self.otpRef.current.focusField(0);
      }, 500);
      Clipboard.setString('');
      BackHandler.addEventListener('hardwareBackPress', () => {
        Actions.LoginMobile();
        return true;
      });
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

  render() {
    const { autoVerify, resendOtp, user } = this.state;
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
            {!resendOtp && (
              <CountdownCircleTimer
                onComplete={() => this.setState({ resendOtp: true })}
                isPlaying
                duration={30}
                colors="#fd2f31"
                colorsTime={[7, 5, 2, 0]}
                size={50}
                strokeWidth={4}
              >
                {({ remainingTime }) => <Text>{remainingTime}</Text>}
              </CountdownCircleTimer>
            )}
            {resendOtp && (
              <TouchableOpacity onPress={() => this.signInWithPhoneNumber()} underlayColor="transparent">
                <Text style={styles.codeResend}>
                  {/* {strings('common.common.resendOTP', { number: this.props.userDetail.countryCode + '-' + this.props.userDetail.phoneNumber })} */}
                  {strings('common.common.resendOTP')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.buttonView}>
            <SHButtonDefault
              btnText={strings('doctor.button.continue')}
              btnType={'normal'}
              style={{ marginTop: verticalScale(30), borderRadius: widthPercentageToDP(2), margin: moderateScale(5) }}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              //onBtnClick={() => this._onFinishCheckingCode(this.state.code)}
              onBtnClick={() => this.handleVerifyCode()}
            />
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
