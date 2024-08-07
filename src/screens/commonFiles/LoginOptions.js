import React, { useState, useEffect } from 'react';
import { Alert, BackHandler, Image, Platform, StyleSheet, Text, TouchableOpacity, View, I18nManager } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firebaseNotifications from '../../utils/firebaseNotifications';
import { Actions } from 'react-native-router-flux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-community/async-storage';
import { AppStyles } from '../../shared/AppStyles';
import { getUniqueId } from 'react-native-device-info';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';
import { AppStrings } from '../../shared/AppStrings';
import ProgressLoader from 'rn-progress-loader';
import { strings } from '../../locales/i18n';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { decode as atob } from 'base-64';
const isRTL = I18nManager.isRTL;
const LoginOptions = () => {
  const [signInProgress, setSignInProgress] = useState(false);

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleBackButtonClick() {
    Alert.alert(strings('common.common.exitApp'), strings('common.common.wantToQuit'), [
      { text: strings('common.common.stay'), style: 'cancel' },
      {
        text: strings('common.common.exit'),
        onPress: () => BackHandler.exitApp(),
      },
    ]);
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    GoogleSignin.configure({
      webClientId:
        Platform.OS === 'android'
          ? '1031743870650-pukdkft6de33n8canfp8to5hmhvbmmbi.apps.googleusercontent.com'
          : '84286705331-2osj8gv696sfpvl37i4p7u2bv5adeqlm.apps.googleusercontent.com',
    });

;
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const selectHandler = (option) => {
    if (option === 'Login') {
      Actions.LoginMobile();
    } else {
      Actions.UserSignUp({ isNewUser: true });
    }
  };

  const signInWithGoogle = async () => {
    try {
      setSignInProgress(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo, 'userInfo');
      if (userInfo) {
        setFirstName(userInfo?.user?.givenName);
        setLastName(userInfo?.user?.familyName);
        await AsyncStorage.setItem(AppStrings.contracts.GOOGLE_USER_DATA, JSON.stringify({ googleUserData: userInfo }));
        await loginUsingGmail(userInfo?.user?.email, userInfo?.idToken, userInfo?.user?.id);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        alert('Login cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('SignIn is in progress already');
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('Play Services not available or outdated');
      } else {
        console.log('GoogleError', error);
        alert('Something went wrong !');
      }
    } finally {
      setSignInProgress(false);
    }
  };

  const loginUsingGmail = async (email, token, id) => {
 
    let userDetails = {
      email: email,
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      token: token,
      uid: id,
    };

    let dataToSendToRegisterScreen = {
      email: email,
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      token: token,
      fName: firstName,
      lName: lastName,
      uid: id,
    };

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    try {
      setLoading(true);
      await delay(1000);

      let response = await SHApiConnector.userPasswordLogin(userDetails);
      console.log(response.data, 'responseee1');

      if (response.status === 401 && response.data.error_code === '10034') {
        await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
        Actions.MainScreen();
      }
      if (response.data.status) {
        setLoading(false);
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
        setLoading(false);
        if (response.data.isProfileAvailable) {
          Actions.MainScreen();
        } else {
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.user));
          Actions.UserSignUp({ isNewUser: false });
        }
        // this.setState({ isDataVisible: false });
      } else {
        setLoading(false);
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
      console.log(err, 'errrror');
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    const isSupported = appleAuth.isSupported;
    console.log(isSupported, 'isSupported');

    if (isSupported) {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      setLoading(true);

      console.log(appleAuthRequestResponse, 'appleAuthRequestResponse');
      if (appleAuthRequestResponse.email) {
        setFirstName(appleAuthRequestResponse?.fullName?.givenName);
        setLastName(appleAuthRequestResponse?.fullName?.familyName);
        await AsyncStorage.setItem(AppStrings.contracts.APPLE_USER_DATA, JSON.stringify({ appleUserData: appleAuthRequestResponse }));

        await loginByApple(
          appleAuthRequestResponse?.email,
          appleAuthRequestResponse.identityToken,
          appleAuthRequestResponse?.nonce,
          appleAuthRequestResponse?.fullName?.givenName,
          appleAuthRequestResponse?.fullName?.familyName
        );
      } else {
        const token = appleAuthRequestResponse.identityToken;
        const parts = token.split('.');

        const decodedPayload = JSON.parse(atob(parts[1]));

        const userData = await SHApiConnector.getAppleUserDetails(decodedPayload?.email);
        console.log(userData?.data?.data, 'userData');
        setFirstName(userData?.data?.data?.user?.firstName);
        setLastName(userData?.data?.data?.user?.lastName);
        await AsyncStorage.setItem(AppStrings.contracts.APPLE_USER_DATA, JSON.stringify({ appleUserData: userData?.data?.data?.user }));
        await loginByApple(
          userData?.data?.data?.user?.email,
          appleAuthRequestResponse?.identityToken,
          appleAuthRequestResponse?.nonce,
          userData?.data?.data?.user?.firstName,
          userData?.data?.data?.user?.lastName
        );
      }
    }
  };

  const loginByApple = async (email, identityToken, nonce, fName, lName) => {
    let appleUserDetails = {
      OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
      email: email,
      firstName: fName,
      lastName: lName,
      identityToken: identityToken,
      nonce: nonce,
    };
    
    console.log(appleUserDetails,'appleUserDetails')



    try {
      
      let response = await SHApiConnector.userPasswordLogin(appleUserDetails);
      console.log(response.data, 'responseee1');

      if (response.data.error_code === '10035') {
        setLoading(false);
        await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
        Actions.MainScreen();
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

      if (response.data.status) {
        setLoading(false);
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
 

        if (response.data.isProfileAvailable) {
          Actions.MainScreen();
        } else {
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.user));
          Actions.UserSignUp({ isNewUser: false });
        }
      }

      
    } catch (error) {
      setLoading(false);
      console.log(error, 'error in apple Sign In');
    }
  };

  const webviewHandler = () => {
    Actions.TermsAndConditions();
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgImg}>
        <View style={styles.imgView}>
          <Image style={styles.clinq_main_logo} resizeMode={'contain'} source={require('../../../assets/images/myclnq-homescreen-min-1.png')} />
          <Image source={require('../../../assets/images/WelcomePic_1.png')} resizeMode="cover" style={styles.entryImg} />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => selectHandler('Login')} style={styles.optionContainer}>
          <Text style={styles.optionText}>LOG IN</Text>
        </TouchableOpacity>

        <View style={{ height: '100%', width: 1, backgroundColor: AppColors.lightPrimaryColor }} />

        <TouchableOpacity style={[styles.optionContainer2]} onPress={() => selectHandler('SignUp')}>
          <Text style={[styles.optionText, { color: AppColors.lightPrimaryColor }]}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      {signInProgress ? (
        <View style={styles.googleSignInButton}>
        <Image style={styles.googleLogo} source={require('../../../assets/images/google_logo.png')} />
          <Text style={styles.signInBtnText}>Sign in with Google</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.googleSignInButton} onPress={signInWithGoogle}>
          <Image style={styles.googleLogo} source={require('../../../assets/images/google_logo_1.png')} />
          <Text style={styles.signInBtnText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleSignButton} onPress={signInWithApple}>
          <Image style={styles.appleLogo} source={require('../../../assets/images/apple_logo_1.png')} />
          <Text style={styles.signInBtnText}>Sign in with Apple</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={webviewHandler} style={styles.footerContainer}>
        <Text style={styles.tnC}>Terms and Conditions</Text>
      </TouchableOpacity>

      <ProgressLoader
        testID={'progressLoaderLogin'}
        visible={loading}
        isModal={true}
        isHUD={true}
        hudColor={'#FFFFFF'}
        color={AppColors.primaryColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    width: wp(100),
    backgroundColor: AppColors.whiteColor,
  },
  imgView: {
    height: hp(46),
    width: wp(100),
  },
  entryImg: {
    height: hp(46),
    width: wp(95),
  },
  clinq_main_logo: {
    position: 'absolute',
    top: hp(12),
    right: isRTL ? 0 : wp(1),
    left: isRTL ? wp(1) : null,
    zIndex: 1,
    height: wp(25),
    width: wp(30),
  },
  tabContainer: {
    height: hp(7),
    width: wp(90),
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: AppColors.lightPrimaryColor,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '5%',
    marginTop: '10%',
  },
  optionContainer: {
    width: '50%',
    height: hp(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: AppColors.lightPrimaryColor,
    borderColor: AppColors.whiteColor,
  },
  optionContainer2: {
    width: '50%',
    height: hp(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  signInBtnText: {
    fontWeight: '700',
    color: 'rgb(115, 114, 114)',
    fontSize: 14,
    marginLeft: '3%',
  },
  googleLogo: {
    width: 25,
    height: 25,
  },
  appleLogo:{
    width: 20,
    height: 30,
  },
  googleSignInButton: {
    height: hp(5),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'5%'
  },
  appleSignButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'2%',
  },
  optionText: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: 14,
    color: AppColors.whiteColor,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '40%',
  },
  tnC: {
    fontSize: 14,
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
  },
  bgImg: {
    backgroundColor: 'rgb(248,248,248)',
    overflow: 'hidden',
    height: 400,
    width: Platform.OS === 'ios' ? wp(90) : 400,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    marginTop: Platform.OS === 'ios' ? '10%' : 0,
    marginLeft: Platform.OS === 'ios' ? '4%' : 0,
    marginBottom: '3%',
  },
});

export default LoginOptions;
