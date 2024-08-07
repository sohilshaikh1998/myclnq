import React, { Component } from 'react';
import { ActionConst, Actions, Drawer, Reducer, Router, Scene, Stack, Tabs } from 'react-native-router-flux';
import FlashMessage from 'react-native-flash-message';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LoginIn from './screens/commonFiles/LoginIn';
import LoginMobile from './screens/commonFiles/LoginMobile';
import HomeScreen from './screens/doctorBooking/HomeScreen';
import Registration from './screens/doctorBooking/Registration';
import SmsotpScreen from './screens/commonFiles/SmsotpScreen';
import ClinicDetails from './screens/doctorBooking/ClinicDetails';
import BookingSuggestions from './screens/doctorBooking/BookingSuggestions';
import MyAppointments from './screens/doctorBooking/MyAppointments';
import MyCareWagonHome from './screens/medicalTransport/MyCareWagonHome';
import MedicalEquipmentDrawer from './drawer/MedicalEquipmentDrawer';
import headerWithoutShadow from './navigationHeader/headerWithoutShadow';
import VitalHomeDrawer from './drawer/VitalHomeDrawer';
import { SHApiConnector } from './network/SHApiConnector';
import medicalHomeScreen from './screens/medicalEquipment/medicalEquipmentHome/medicalHomeScreen';
import VitalHomeScreen from './screens/vitalSign/VitalHomeScreen';
import PayUPayment from './screens/commonFiles/PayUPayment';
import XenditPayment from './screens/commonFiles/XenditPayment';

import { getUniqueId } from 'react-native-device-info';
import productDetails from './screens/medicalEquipment/productDetails/productDetails';
import productDetailsHeader from './screens/medicalEquipment/productDetails/productDetailsHeader';
import medicalCart from './screens/medicalEquipment/medicalCart/medicalCart';

import orderSummary from './screens/medicalEquipment/orderSummary/orderSummary';
import orderSummaryHeader from './screens/medicalEquipment/orderSummary/orderSummaryHeader';
import myOrderSummary from './screens/medicalEquipment/orderSummary/myOrderSummary';
import searchProduct from './screens/medicalEquipment/searchProduct/searchProduct';

import selectPayment from './screens/medicalEquipment/selectPayment/selectPayment';
import selectPaymentHeader from './screens/medicalEquipment/selectPayment/selectPaymentHeader';

import caregiverHomeScreen from './screens/caregiver/caregiverHome/caregiverHomeScreen';
import caregiverBookingRequestScreen from './screens/caregiver/caregiverBookingRequest/caregiverBookingRequestScreen';
import caregiverNotificationScreen from './screens/caregiver/caregiverNotification/caregiverNotificationScreen';
import confirmBooking from './screens/caregiver/confirmBooking/confirmBooking';
import appointmentDetails from './screens/doctorBooking/AppointmentDetails';

import medicalEquipmentNotification from './screens/medicalEquipment/medicalEquipmentNotification/medicalEquipmentNotification';
import orderList from './screens/medicalEquipment/orderList/orderList';
import wishList from './screens/medicalEquipment/wishList/wishList';
import reviewList from './screens/medicalEquipment/reviewList/reviewList';

import WagonBookingDetails from './screens/medicalTransport/WagonBookingDetails';
import MyCareWagonNotification from './screens/medicalTransport/MyCareWagonNotification';
import OnlinePayment from './screens/commonFiles/OnlinePayment';
import reviewProduct from './screens/commonFiles/ReviewProduct';

import PickUpDetailsScreen from './screens/medicalTransport/PickUpDetailsScreen';
import SearchingVehicle from './screens/medicalTransport/SearchingVehicle';
import { AppUtils } from './utils/AppUtils';
import { AppColors } from './shared/AppColors';
import TabHeader from './navigationHeader/TabHeader';
import TabIcon from './tabBar/TabIcon';
import WagonTab from './tabBar/WagonTab';
import MedicalEquipmentsTab from './tabBar/MedicalEquipmentsTab';
import CaregiverTab from './tabBar/CaregiverTab';
import Profile from './screens/commonFiles/Profile';
import ProfileHeader from './navigationHeader/ProfileHeader';
import SettingsHeader from './navigationHeader/SettingsHeader';
import MyCareWagonHeader from './navigationHeader/MyCareWagonHeader';
import MedicalHomeHeader from './navigationHeader/MedicalHomeHeader';
import VitalHomeHeader from './navigationHeader/VitalHomeHeader';

import caregiverHeader from './navigationHeader/caregiverHeader';
import MyWagonBooking from './screens/medicalTransport/MyWagonBooking';
import Settings from './screens/commonFiles/Settings';
import CommonHeader from './navigationHeader/CommonHeader';
import HeaderwithBack from './navigationHeader/HeaderwithBack';
import EditProfile from './screens/commonFiles/EditProfile';
import Notifications from './screens/doctorBooking/Notifications';
import PrivacyPolicy from './screens/commonFiles/PrivacyPolicy';
import TrackView from './screens/commonFiles/TrackView';
import ArticleWebView from './screens/commonFiles/ArticleWebView';
import EquipmentCommonHeader from './navigationHeader/equipmentCommonHeader';

import TermsAndConditions from './screens/commonFiles/TermsAndConditions';
import ClinicListing from './screens/doctorBooking/ClinicListing';
import Feedback from './screens/commonFiles/Feedback';
import CheckInternet from './utils/CheckInternet';
import HelpTour from './screens/doctorBooking/HelpTour';
import About from './screens/commonFiles/About';
import HelpAndSupport from './screens/commonFiles/HelpAndSupport';
import MainScreen from './screens/commonFiles/Main';
import ChatScreen from './screens/doctorBooking/ChatScreen';
import QuickRequest from './screens/doctorBooking/QuickRequest';
import PrimarySettingsHeader from './navigationHeader/PrimarySettingsHeader';
import { AppStrings } from './shared/AppStrings';
import EntryScreen from './screens/commonFiles/EntryScreen';
import UserSignUp from './screens/commonFiles/UserSignUp';
import EPrescription from './screens/doctorBooking/EPrescription';
import firebaseNotifications from './utils/firebaseNotifications';
import { View } from 'react-native-animatable';
import Article from './screens/article/ArticleHome';

import ModalPopUp from './shared/BottomUpModal';
import AddRecords from './screens/vitalSign/AddRecords';

import EditVital from './screens/vitalSign/EditVital';

import DoctorMapping from './screens/vitalSign/DoctorMapping';

import DeleteRecords from './screens/vitalSign/DeleteRecords';

import SetVitalRange from './screens/vitalSign/SetVitalRange';

import VitalOrderSummary from './screens/vitalSign/VitalOrderSummary';
import VitalCategory from './screens/vitalSign/VitalCategory';
import { MenuProvider } from 'react-native-popup-menu';
import ShareVital from './screens/vitalSign/VitalShare';
import ManageSubscription from './screens/vitalSign/ManageSubcription';
import UpdateRegistrationNumber from './screens/commonFiles/UpdateRegistraionNumber';
import UpdateNumberOTP from './screens/commonFiles/updateNumberOTP';
import MedicalRecords from './screens/commonFiles/MedicalRecords';
import ForgetPassword from './screens/commonFiles/ForgetPassword';
import SetPassword from './screens/commonFiles/SetPassword';
import DeepLinking from 'react-native-deep-linking';
import { Linking } from 'react-native';
import AbhaRegistration from './screens/commonFiles/AadharVerification';
import MySubscriptions from './shared/MySubscriptions';
import DeleteFeedback from './screens/commonFiles/DeleteFeedback';
import CorporatePlan from './screens/commonFiles/CorporatePlan';
import { strings } from './locales/i18n';
import InstantConsult from './screens/doctorBooking/InstantConsult';
import Summary from './screens/doctorBooking/Summary';
import CountdownTimer from './screens/commonFiles/CountDownTimer';
import CancelBooking from './screens/doctorBooking/CancelBooking';
import StripePayment from './screens/commonFiles/StripePayment';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppointmentRequested from './screens/commonFiles/AppointmentRequested';
import DoctorAssigned from './screens/doctorBooking/DoctorAssigned';
import DoctorBusy from './screens/commonFiles/DoctorBusy';
import DigitalCard from './screens/digitalCard/digitalCard';
import IntroScreen from './shared/IntroScreen';
import LoginOptions from './screens/commonFiles/LoginOptions';
import LoginPageHeader from './navigationHeader/LoginPageHeader';
import XenditInstantVc from './screens/commonFiles/XenditInstantVc';
import ForegroundNotifications from './utils/foregroundNotifications';

const getSceneStyle = () => ({
  showOpacity: 0,
  showRadius: 0,
});

const defaultReducer = new Reducer(Actions);
const reducerCreate = () => {
  return (state, action) => {
    return defaultReducer(state, action);
  };
};

const stateHandler = (prevState, newState, action) => {
  AppUtils.console('onStateChange: ACTION:', action);
};

const styles = StyleSheet.create({
  tabView: {
    width: AppUtils.screenWidth,
    height: AppUtils.tabHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.whiteColor,
    flexDirection: 'row',
  },
});

class Navigation extends Component {
  constructor(props) {
    super(props);
  }

  clickActionWagon(notif) {
    AppUtils.console('sedfxgbfg', notif);
    let data = JSON.parse(notif.body);
    AppUtils.console('asfdg', data);
    if (notif.notify_about === 'AMBULANCE_BOOKED_SUCCESSFUL') {
      this.clearBookingDataFromAsyncStorage();
      Actions.PickUpDetailsScreen({ wagonData: data });
    } else if (notif.notify_about === 'NO_RESPONSE') {
    } else {
      Actions.MyBooking();
    }
  }

  async clearBookingDataFromAsyncStorage() {
    await AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: false }));
    await AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: {} }));
  }

  checkReferral() {
    PlayInstallReferrer.getInstallReferrerInfo((installReferrerInfo, error) => {
      if (!error) {
        AppUtils.console('Install referrer = ', installReferrerInfo);
        AppUtils.console('Install referrer = ' + installReferrerInfo.installReferrer);
        AppUtils.console('Referrer click timestamp seconds = ' + installReferrerInfo.referrerClickTimestampSeconds);
        AppUtils.console('Install begin timestamp seconds = ' + installReferrerInfo.installBeginTimestampSeconds);
        AppUtils.console('Referrer click timestamp server seconds = ' + installReferrerInfo.referrerClickTimestampServerSeconds);
        AppUtils.console('Install begin timestamp server seconds = ' + installReferrerInfo.installBeginTimestampServerSeconds);
        AppUtils.console('Install version = ' + installReferrerInfo.installVersion);
        AppUtils.console('Google Play instant = ' + installReferrerInfo.googlePlayInstant);
      } else {
        AppUtils.console('Failed to get install referrer info!');
        AppUtils.console('Response code: ' + error.responseCode);
        AppUtils.console('Message: ' + error.message);
      }
    });
  }

  async checkRequestedWagonStatus() {
    try {
      var wagonStatus = await AsyncStorage.getItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE);
      wagonStatus = JSON.parse(wagonStatus);
      if (wagonStatus) {
        if (wagonStatus.isWagonSearchActive) {
          let bookingData = await AsyncStorage.getItem(AppStrings.wagonSearch.BOOKING_DATA);
          bookingData = JSON.parse(bookingData);
          Actions.SearchingVehicle(bookingData);
        }
      }
    } catch (e) {
      AppUtils.console('WagonCrash', e);
    }
  }
  //

  async componentDidMount() {
    await firebaseNotifications.requestUserPermission();
    firebaseNotifications.checkPermission();

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          Linking.canOpenURL(url).then((supported) => {
            if (supported) {
              this.handleUrl({ url });
            }
          });
        }
      })
      .catch((err) => console.error('An error occurred', err));

    DeepLinking.addScheme('myclnq://');
    Linking.addEventListener('url', this.handleUrl);
    DeepLinking.addRoute('/productDetails', async (response) => {
      const isLoggedIn = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN));
      if (isLoggedIn) {
        Actions.MainScreen();
      } else {
        console.log('Login first');
      }
    });

    DeepLinking.addRoute('/register/:GUI', async (response) => {
      console.log('REGISTER pAGE ');
      let isUserLoggedIn = await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN);
      AppUtils.console('REGISTER pAGE -', isUserLoggedIn);
      let userData = await JSON.parse(isUserLoggedIn);

      if (isUserLoggedIn && userData.isLoggedIn) {
        AppUtils.console('IS USER LOGGED IN-', isUserLoggedIn, userData);
        return;
      }
      AppUtils.console('RESPONSE ->', response);

      try {
        console.log('RESPONSE inside->', response);

        let body = {
          userGuid: response.GUI,
          OSType: AppUtils.isIphone ? 'IOS' : 'ANDROID',
          fcmToken: await firebaseNotifications.fetchFCMToken(),
          deviceId: getUniqueId(),
        };
        AppUtils.console('RESPONSE_JUST_LOGIN JUST_LOGIN_BODY-', body);

        let resp = await SHApiConnector.justLogin(body);
        AppUtils.console('RESPONSE_JUST_LOGIN-', resp.data);

        let responseBody = resp.data;
        if (resp.status && responseBody) {
          AppUtils.console('RESPONSE_JUST_LOGIN IF-', resp.data);
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER, JSON.stringify(responseBody.user));
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(responseBody.user));
          await AsyncStorage.setItem(AppStrings.contracts.SESSION_INFO, JSON.stringify({ session: responseBody.session }));
          await AsyncStorage.setItem(AppStrings.contracts.IS_LOGGED_IN, JSON.stringify({ isLoggedIn: true }));
          await AsyncStorage.setItem(
            AppStrings.contracts.IS_PROFILE_AVAILABLE,
            JSON.stringify({ isProfileAvailable: responseBody.isProfileAvailable })
          );
          if (responseBody.isProfileAvailable) {
            Actions.MainScreen();
          } else {
            await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(responseBody.user));
            Actions.UserSignUp({ isNewUser: false });
          }
        } else if (!resp.status) {
          //   this.toastTimer(responseBody.data.message);
        }
      } catch (e) {
        console.log('Catch block:', e);
      }
    });

    // Linking.getInitialURL()
    //   .then((url) => {
    //     if (url) {
    //       Linking.canOpenURL(url).then((supported) => {
    //         console.log('object', supported);
    //         if (supported) {
    //           console.log(url, 'inside');
    //           // Linking.addEventListener('url', this.handleUrl);
    //           this.handleUrl(url)
    //         }
    //       });
    //     }
    //   })
    //   .catch((err) => console.error('An error occurred', err));
  }

  async handleUrl({ url }) {
    console.log(url, 'deepLinkUrl');
    let [, productId] = url.split('/:');
    const isLoggedIn = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN));
    const productDetailsResponse = await SHApiConnector.getProductDetail(productId);

    if (isLoggedIn) {
      if (productDetailsResponse?.data?.status && productDetailsResponse?.data?.response) {
        Actions.ProductDetails({ productDetails: { _id: productId }, isDashboard: true });
      } else if (
        url === 'myclnq://marketplace' ||
        url === 'myclnq://marketplace/' ||
        url === 'https://myclnq/marketplace' ||
        url === 'https://myclnq/marketplace/'
      ) {
        Actions.drawer();
      } else {
        Actions.MainScreen();
      }
    } else {
      // Actions.LoginMobile();
      Actions.LoginOptions();
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        DeepLinking.evaluateUrl(url);
        //self.appWokeUp(url);
      }
    });
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleUrl);
  }

  clickActionsAndroid(notif) {
    try {
      if (notif.param) {
        if (notif.param === 'PATIENT_RECEIVED_MESSAGES') {
          let data = JSON.parse(notif.paramData);
          Actions.ChatScreen({
            sender: 'PATIENT',
            receiver: 'CLINIC',
            appointmentId: data._id,
            clinicName: data.clinicId.clinicName,
            clinicLogo: data.clinicLogo,
            clinicAddress: data.clinicId.address,
          });
        } else {
          if (
            notif.param === 'CLINIC_REJECTED_APPOINTMENT' ||
            notif.param === 'CLINIC_PROPOSED_NEW_TIME' ||
            notif.param === 'EXPIRE_AFTER_FIVE_MIN'
          ) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true }));
          } else {
            Actions.HomeScreenDash({ isAppointmentUpdated: true });
          }
        }
      }
    } catch (er) {
      console.error(er);
    }
  }

  render() {
    return (
      <MenuProvider>
        <ForegroundNotifications/>
        <StripeProvider publishableKey={AppUtils.isProduction() ? process.env.stripeProdKey : process.env.stripeTestKey}>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <Router
              uriPrefix={'myclnq://'}
              createReducer={reducerCreate}
              backAndroidHandler={Actions.pop}
              getScreenStyle={getSceneStyle}
              onStateChange={stateHandler}
            >
              <Stack hideNavBar>
                <Stack key="IntroScreen" hideNavBar>
                  <Scene key="IntroScreen" component={IntroScreen} initial />
                </Stack>

                <Stack key="HelpTour" hideNavBar>
                  <Scene key="HelpTour" component={HelpTour}></Scene>
                </Stack>

                <Stack key="LoginOptions" hideNavBar>
                  <Scene key="LoginOptions" component={LoginOptions}></Scene>
                </Stack>

                <Stack key="LoginMobile">
                  <Scene
                    key="LoginMobile"
                    navBar={LoginPageHeader}
                    // title={strings('common.titles.signUp')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={LoginMobile}
                  />
                  
                </Stack>

                <Stack key="EntryScreen" hideNavBar>
                  <Scene key="EntryScreen" gestureEnabled={false} panHandlers={null} component={EntryScreen} initial={true} />
                </Stack>

                <Stack key="MainScreen" hideNavBar>
                  <Scene key="MainScreen" gestureEnabled={false} panHandlers={null} component={MainScreen} />
                </Stack>

                <Stack key="VitalOrderSummary" hideNavBar>
                  <Scene
                    key="VitalOrderSummary"
                    component={VitalOrderSummary}
                    gestureEnabled={false}
                    panHandlers={null}
                    navBar={orderSummaryHeader}
                  ></Scene>
                </Stack>

                <Stack key="ShareVital" hideNavBar>
                  <Scene key="ShareVital" component={ShareVital} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="AppointmentRequested" hideNavBar>
                  <Scene key="AppointmentRequested" component={AppointmentRequested} gestureEnabled={false} panHandlers={null} />
                </Stack>

                <Stack key="CountdownTimer" hideNavBar>
                  <Scene key="CountdownTimer" component={CountdownTimer} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="DoctorAssigned" hideNavBar>
                  <Scene key="DoctorAssigned" component={DoctorAssigned} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="CancelBooking" hideNavBar>
                  <Scene key="CancelBooking" component={CancelBooking} gestureEnabled={false} panHandlers={null} />
                </Stack>

                <Stack key="PayUPayment" hideNavBar>
                  <Scene key="PayUPayment" component={PayUPayment} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="StripePayment" hideNavBar>
                  <Scene key="StripePayment" component={StripePayment} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="XenditPayment" hideNavBar>
                  <Scene key="XenditPayment" component={XenditPayment} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>
               
                <Stack key="XenditInstantVc" hideNavBar>
                  <Scene key="XenditInstantVc" component={XenditInstantVc} gestureEnabled={false} panHandlers={null}>
                    </Scene>
                </Stack>

                <Stack key="ManageSubscription" hideNavBar>
                  <Scene key="ManageSubscription" component={ManageSubscription} gestureEnabled={false} panHandlers={null}></Scene>
                </Stack>

                <Stack key="VitalCategory" hideNavBar>
                  <Scene key="VitalCategory" component={VitalCategory} gestureEnabled={false} panHandlers={null} navBar={orderSummaryHeader}></Scene>
                </Stack>

                {Platform.OS === 'ios' ? (
                  <Tabs
                    key="HomeScreenDash"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    showLabel={false}
                    swipeEnabled={false}
                    navBarNoBorder={true}
                    panHandlers={null}
                    gestureEnabled={false}
                    lazy={true}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="HomeScreen"
                      navBar={TabHeader}
                      component={HomeScreen}
                      sceneKey="HomeScreen"
                      title={strings('common.titles.nearbyClinics')}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      isNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.HomeScreenDash()}
                      icon={TabIcon}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />
                    <Scene
                      key="MyAppointments"
                      component={MyAppointments}
                      gestureEnabled={false}
                      backBehavior="none"
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      isNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.HomeScreenDash({ isAppointmentUpdated: true })}
                      panHandlers={null}
                      sceneKey="MyAppointments"
                      title={strings('common.titles.myAppointments')}
                      icon={TabIcon}
                      hideNavBar
                    />

                    <Scene
                      key="Profile"
                      navBar={ProfileHeader}
                      hideNavBar={true}
                      component={Profile}
                      gestureEnabled={false}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      isNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.HomeScreenDash({ isProfileUpdated: true })}
                      panHandlers={null}
                      sceneKey="Profile"
                      title={strings('common.titles.myProfile')}
                      icon={TabIcon}
                    />

                    <Scene
                      key="Notifications"
                      navBar={CommonHeader}
                      component={Notifications}
                      backBehavior="none"
                      gestureEnabled={false}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      isNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.HomeScreenDash({ isNotifictionUpdated: true })}
                      panHandlers={null}
                      sceneKey="Notifications"
                      title={strings('common.titles.notifications')}
                      icon={TabIcon}
                    />
                  </Tabs>
                ) : (
                  <Tabs
                    key="HomeScreenDash"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    showLabel={false}
                    swipeEnabled={false}
                    panHandlers={null}
                    gestureEnabled={false}
                    lazy={true}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="HomeScreen"
                      navBar={TabHeader}
                      component={HomeScreen}
                      sceneKey="HomeScreen"
                      title={strings('common.titles.nearbyClinics')}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      isNotifictionUpdated={false}
                      icon={TabIcon}
                      backBehavior="none"
                      tabBarOnPress={() => Actions.HomeScreenDash()}
                      gestureEnabled={false}
                      panHandlers={null}
                    />
                    <Scene
                      key="MyAppointments"
                      component={MyAppointments}
                      isProfileUpdated={false}
                      isHomeScreenUpdated={false}
                      isAppointmentUpdated={false}
                      isNotifictionUpdated={false}
                      gestureEnabled={false}
                      backBehavior="none"
                      tabBarOnPress={() => Actions.HomeScreenDash({ isAppointmentUpdated: true })}
                      panHandlers={null}
                      sceneKey="MyAppointments"
                      title={strings('common.titles.myAppointments')}
                      icon={TabIcon}
                      hideNavBar
                    />

                    <Scene
                      key="Profile"
                      navBar={ProfileHeader}
                      component={Profile}
                      hideNavBar={true}
                      isNotifictionUpdated={false}
                      gestureEnabled={false}
                      backBehavior="none"
                      tabBarOnPress={() => Actions.HomeScreenDash({ isProfileUpdated: true })}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      panHandlers={null}
                      sceneKey="Profile"
                      title={strings('common.titles.myProfile')}
                      icon={TabIcon}
                    />

                    <Scene
                      key="Notifications"
                      navBar={CommonHeader}
                      component={Notifications}
                      backBehavior="none"
                      isNotifictionUpdated={false}
                      gestureEnabled={false}
                      panHandlers={null}
                      tabBarOnPress={() => Actions.HomeScreenDash({ isNotifictionUpdated: true })}
                      isProfileUpdated={false}
                      isAppointmentUpdated={false}
                      isHomeScreenUpdated={false}
                      sceneKey="Notifications"
                      title={strings('common.titles.notifications')}
                      icon={TabIcon}
                    />
                  </Tabs>
                )}

                <Stack key="LoginIn" hideNavBar>
                  <Scene key="LoginIn" component={LoginIn} />
                </Stack>

             

                <Stack key="UpdateRegistrationNumber">
                  <Scene
                    key="UpdateRegistrationNumber"
                    gestureEnabled={false}
                    panHandlers={null}
                    title={strings('common.titles.updateNumber')}
                    navBar={headerWithoutShadow}
                    component={UpdateRegistrationNumber}
                  />
                </Stack>

                <Stack key="UpdateNumberOTP">
                  <Scene
                    key="UpdateNumberOTP"
                    gestureEnabled={false}
                    panHandlers={null}
                    title={strings('common.titles.mobileVerify')}
                    navBar={headerWithoutShadow}
                    component={UpdateNumberOTP}
                  />
                </Stack>

                <Stack key="MedicalRecords">
                  <Scene
                    key="MedicalRecords"
                    gestureEnabled={false}
                    panHandlers={null}
                    title={strings('common.titles.healthRecords')}
                    navBar={headerWithoutShadow}
                    component={MedicalRecords}
                  />
                </Stack>

                <Stack key="ForgetPassword">
                  <Scene
                    key="ForgetPassword"
                    gestureEnabled={false}
                    panHandlers={null}
                    title={''}
                    navBar={headerWithoutShadow}
                    component={ForgetPassword}
                  />
                </Stack>

                <Stack key="SetPassword">
                  <Scene
                    title={''}
                    key="SetPassword"
                    gestureEnabled={false}
                    panHandlers={null}
                    navBar={headerWithoutShadow}
                    component={SetPassword}
                  />
                </Stack>

                <Stack key="SmsotpScreen">
                  <Scene
                    navBar={headerWithoutShadow}
                    title={''}
                    key="SmsotpScreen"
                    gestureEnabled={false}
                    panHandlers={null}
                    component={SmsotpScreen}
                  />
                </Stack>

                <Stack key="Registration" hideNavBar>
                  <Scene key="Registration" path="/Registration" component={Registration} />
                </Stack>

                <Stack key="ClinicDetails" hideNavBar>
                  <Scene key="ClinicDetails" component={ClinicDetails} />
                </Stack>

                <Stack key="BookingSuggestions" hideNavBar>
                  <Scene key="BookingSuggestions" component={BookingSuggestions} />
                </Stack>

                <Stack key="PrivacyPolicy">
                  <Scene key="PrivacyPolicy" component={PrivacyPolicy} title={strings('common.titles.privacyPolicy')} navBar={HeaderwithBack} />
                </Stack>
                <Stack key="TrackView">
                  <Scene key="TrackView" component={TrackView} title={strings('common.titles.trackOrder')} navBar={HeaderwithBack} />
                </Stack>
                <Stack key="ArticleWebView">
                  <Scene hideNavBar key="ArticleWebView" component={ArticleWebView} title={strings('common.titles.article')} />
                </Stack>

                <Stack key="TermsAndConditions">
                  <Scene
                    key="TermsAndConditions"
                    component={TermsAndConditions}
                    title={strings('common.titles.termsConditions')}
                    navBar={SettingsHeader}
                  />
                </Stack>

                <Stack key="ClinicListing">
                  <Scene key="ClinicListing" component={ClinicListing} title={strings('common.titles.clinicListing')} navBar={CommonHeader} />
                </Stack>

                <Stack key="Feedback">
                  <Scene key="Feedback" component={Feedback} title={strings('common.titles.feedback')} navBar={SettingsHeader} />
                </Stack>

                <Stack key="DeleteFeedback">
                  <Scene key="DeleteFeedback" component={DeleteFeedback} title={strings('common.titles.feedbackForm')} navBar={SettingsHeader} />
                </Stack>

                <Stack key="MySubscriptions">
                  <Scene key="MySubscriptions" component={MySubscriptions} title={strings('common.titles.mySubscriptions')} hideNavBar={true} />
                </Stack>

                <Stack key="CorporatePlan">
                  <Scene key="CorporatePlan" component={CorporatePlan} title={strings('common.titles.corporatePlan')} hideNavBar={true} />
                </Stack>

                <Stack key="DigitalCard">
                  <Scene key="DigitalCard" component={DigitalCard} title={strings('common.titles.digitalIdCard')} hideNavBar={true} />
                </Stack>

                <Stack key="HelpAndSupport">
                  <Scene key="HelpAndSupport" component={HelpAndSupport} title={strings('common.titles.helpSupport')} navBar={SettingsHeader}></Scene>
                </Stack>

                <Stack key="CheckInternet">
                  <Scene key="CheckInternet" component={CheckInternet} />
                </Stack>

                <Stack key="QuickRequest">
                  <Scene
                    key="QuickRequest"
                    title={strings('common.titles.remoteConsult')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={QuickRequest}
                    navBar={HeaderwithBack}
                  ></Scene>
                </Stack>

                <Stack key="InstantConsult">
                  <Scene
                    key="InstantConsult"
                    title={strings('common.titles.consultDoctor')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={InstantConsult}
                    navBar={HeaderwithBack}
                  ></Scene>
                </Stack>

                <Stack key="Summary">
                  <Scene
                    key="Summary"
                    title={strings('common.titles.summary')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={Summary}
                    navBar={HeaderwithBack}
                  ></Scene>
                </Stack>

                <Stack key="DoctorBusy" hideNavBar>
                  <Scene
                    key="DoctorBusy"
                    title={strings('common.titles.doctorBusy')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={DoctorBusy}
                  ></Scene>
                </Stack>

                <Stack key="UserSignUp">
                  <Scene navBar={HeaderwithBack} title={strings('common.titles.signUp')} key="UserSignUp" component={UserSignUp}></Scene>
                </Stack>

                <Stack key="AbhaRegistration">
                  <Scene
                    navBar={HeaderwithBack}
                    title={strings('common.titles.abhaNumber')}
                    key="AbhaRegistration"
                    component={AbhaRegistration}
                  ></Scene>
                </Stack>

                <Stack key="Settings">
                  <Scene key="Settings" component={Settings} navBar={PrimarySettingsHeader}></Scene>
                </Stack>

                <Stack key="EditProfile">
                  <Scene key="EditProfile" navBar={headerWithoutShadow} component={EditProfile}></Scene>
                </Stack>

                <Stack key="VitalProfile">
                  <Scene
                    key="VitalProfile"
                    sceneKey="VitalProfile"
                    component={Profile}
                    title={strings('common.titles.myProfile')}
                    backBehavior="none"
                    panHandlers={null}
                    hideNavBar={true}
                  />
                </Stack>

                <Stack key="AddRecords" hideNavBar>
                  <Scene key="AddRecords" component={AddRecords}></Scene>
                </Stack>
                <Stack key="EditVital" hideNavBar>
                  <Scene key="EditVital" component={EditVital}></Scene>
                </Stack>
                <Stack key="DoctorMapping" hideNavBar>
                  <Scene key="DoctorMapping" component={DoctorMapping}></Scene>
                </Stack>

                <Stack key="DeleteRecords" hideNavBar>
                  <Scene key="DeleteRecords" component={DeleteRecords}></Scene>
                </Stack>

                <Stack key="SetVitalRange" hideNavBar>
                  <Scene key="SetVitalRange" component={SetVitalRange}></Scene>
                </Stack>

                <Stack key="About">
                  <Scene key="About" component={About} title={strings('common.titles.about')} navBar={SettingsHeader}></Scene>
                </Stack>

                <Stack key="ChatScreen" hideNavBar>
                  <Scene key="ChatScreen" component={ChatScreen}></Scene>
                </Stack>

                <Stack key="PickUpDetailsScreen" hideNavBar>
                  <Scene
                    key={'PickUpDetailsScreen'}
                    title={strings('common.titles.pickUpDetails')}
                    component={PickUpDetailsScreen}
                    navBar={MyCareWagonHeader}
                  ></Scene>
                </Stack>

                <Stack key={'SearchingVehicle'} hideNavBar>
                  <Scene key={'SearchingVehicle'} component={SearchingVehicle}></Scene>
                </Stack>

                <Stack key={'WagonBookingDetails'} hideNavBar>
                  <Scene key={'WagonBookingDetails'} component={WagonBookingDetails}></Scene>
                </Stack>

                <Stack key={'OnlinePayment'} hideNavBar>
                  <Scene key={'OnlinePayment'} gestureEnabled={false} component={OnlinePayment}></Scene>
                </Stack>

                <Stack key={'SearchProduct'}>
                  <Scene
                    key={'SearchProduct'}
                    title={strings('common.titles.searchProduct')}
                    navBar={EquipmentCommonHeader}
                    component={searchProduct}
                  ></Scene>
                </Stack>
                <Stack key={'WishList'}>
                  <Scene
                    key="WishList"
                    component={wishList}
                    navBar={EquipmentCommonHeader}
                    title={strings('common.titles.wishList')}
                    sceneKey="WishList"
                  />
                </Stack>

                <Stack key={'ReviewList'}>
                  <Scene
                    key="ReviewList"
                    component={reviewList}
                    navBar={EquipmentCommonHeader}
                    title={strings('common.titles.reviewList')}
                    sceneKey="ReviewList"
                  />
                </Stack>
                <Stack key={'ReviewProduct'}>
                  <Scene
                    key="ReviewProduct"
                    component={reviewProduct}
                    navBar={EquipmentCommonHeader}
                    title={strings('common.titles.reviewProduct')}
                    sceneKey="ReviewProduct"
                  />
                </Stack>

                <Stack key={'MedicalCart'}>
                  <Scene
                    key={'MedicalCart'}
                    title={strings('common.titles.shoppingCart')}
                    navBar={EquipmentCommonHeader}
                    component={medicalCart}
                  ></Scene>
                </Stack>

                {Platform.OS === 'ios' ? (
                  <Tabs
                    key="MyCareWagonDash"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    lazy={true}
                    showLabel={false}
                    swipeEnabled={false}
                    navBarNoBorder={true}
                    panHandlers={null}
                    gestureEnabled={false}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="MyCareWagonHome"
                      navBar={MyCareWagonHeader}
                      component={MyCareWagonHome}
                      sceneKey="MyCareWagonHome"
                      title={strings('common.titles.bookWagon')}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.MyCareWagonDash()}
                      icon={WagonTab}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />

                    <Scene
                      key="MyBooking"
                      component={MyWagonBooking}
                      navBar={MyCareWagonHeader}
                      title={strings('common.titles.myBookings')}
                      sceneKey="MyBooking"
                      icon={WagonTab}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonBookingUpdated: true })}
                      gestureEnabled={false}
                      backBehavior="none"
                      panHandlers={null}
                    />

                    <Scene
                      key="WagonProfile"
                      navBar={MyCareWagonHeader}
                      hideNavBar={true}
                      component={Profile}
                      backBehavior="none"
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonProfileUpdated: true })}
                      panHandlers={null}
                      sceneKey="WagonProfile"
                      title={strings('common.titles.myProfile')}
                      icon={WagonTab}
                    />

                    <Scene
                      key="MyCareWagonNotification"
                      navBar={MyCareWagonHeader}
                      component={MyCareWagonNotification}
                      backBehavior="none"
                      gestureEnabled={false}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonNotifictionUpdated: true })}
                      panHandlers={null}
                      sceneKey="MyCareWagonNotification"
                      title={strings('common.titles.notifications')}
                      icon={WagonTab}
                    />
                  </Tabs>
                ) : (
                  <Tabs
                    key="MyCareWagonDash"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    lazy={true}
                    showLabel={false}
                    swipeEnabled={false}
                    navBarNoBorder={true}
                    panHandlers={null}
                    gestureEnabled={false}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="MyCareWagonHome"
                      navBar={MyCareWagonHeader}
                      component={MyCareWagonHome}
                      sceneKey="MyCareWagonHome"
                      title={strings('common.titles.bookWagon')}
                      tabBarOnPress={() => Actions.MyCareWagonDash()}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      icon={WagonTab}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />

                    <Scene
                      key="MyBooking"
                      component={MyWagonBooking}
                      navBar={MyCareWagonHeader}
                      title={strings('common.titles.myBookings')}
                      sceneKey="MyBooking"
                      icon={WagonTab}
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonBookingUpdated: true })}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      gestureEnabled={false}
                      backBehavior="none"
                      panHandlers={null}
                    />

                    <Scene
                      key="WagonProfile"
                      navBar={MyCareWagonHeader}
                      hideNavBar={true}
                      component={Profile}
                      backBehavior="none"
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonProfileUpdated: true })}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      panHandlers={null}
                      sceneKey="WagonProfile"
                      title={strings('common.titles.myProfile')}
                      icon={WagonTab}
                    />

                    <Scene
                      key="MyCareWagonNotification"
                      navBar={MyCareWagonHeader}
                      component={MyCareWagonNotification}
                      backBehavior="none"
                      gestureEnabled={false}
                      tabBarOnPress={() => Actions.MyCareWagonDash({ isWagonNotifictionUpdated: true })}
                      isWagonProfileUpdated={false}
                      isWagonBookingUpdated={false}
                      isWagonHomeScreenUpdated={false}
                      isWagonNotifictionUpdated={false}
                      panHandlers={null}
                      sceneKey="MyCareWagonNotification"
                      title={strings('common.titles.notifications')}
                      icon={WagonTab}
                    />
                  </Tabs>
                )}

                <Drawer
                  key="drawer"
                  onExit={() => {
                    MedicalEquipmentDrawer.drawerClosed();
                  }}
                  onEnter={() => {}}
                  contentComponent={MedicalEquipmentDrawer}
                  drawerPosition={'left'}
                  drawerWidth={wp(70)}
                  gestureEnabled={true}
                  panHandlers={true}
                  tapToClose={true}
                  type={ActionConst.RESET}
                  swipeEnabled={true}
                  openDrawerOffSet={0.2}
                  panCloseMask={0.2}
                  negotiatePan
                >
                  <Scene hideNavBar panHandlers={null}>
                    {Platform.OS === 'ios' ? (
                      <Tabs
                        key="MedicalEquipment"
                        tabs={true}
                        tabBarPosition={'bottom'}
                        tabBarStyle={styles.tabView}
                        lazy={true}
                        showLabel={false}
                        swipeEnabled={false}
                        navBarNoBorder={true}
                        panHandlers={null}
                        gestureEnabled={false}
                        type={ActionConst.RESET}
                      >
                        <Scene
                          key="MedicalEquipmentHome"
                          navBar={MedicalHomeHeader}
                          component={medicalHomeScreen}
                          sceneKey="MedicalEquipmentHome"
                          title={strings('common.titles.shopNow')}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          tabBarOnPress={() => Actions.MedicalEquipment()}
                          icon={MedicalEquipmentsTab}
                          backBehavior="none"
                          gestureEnabled={false}
                          panHandlers={null}
                        />

                        <Scene
                          key="MedicalEquipmentBooking"
                          component={orderList}
                          navBar={MyCareWagonHeader}
                          title={strings('common.titles.myOrders')}
                          hideNavBar={true}
                          sceneKey="MedicalEquipmentBooking"
                          icon={MedicalEquipmentsTab}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentBookingUpdated: true })}
                          gestureEnabled={false}
                          backBehavior="none"
                          panHandlers={null}
                        />

                        <Scene
                          key="MedicalEquipmentProfile"
                          navBar={MyCareWagonHeader}
                          hideNavBar={true}
                          component={Profile}
                          backBehavior="none"
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentProfileUpdated: true })}
                          panHandlers={null}
                          sceneKey="MedicalEquipmentProfile"
                          title={strings('common.titles.myProfile')}
                          icon={MedicalEquipmentsTab}
                        />

                        <Scene
                          key="MedicalEquipmentNotification"
                          navBar={MyCareWagonHeader}
                          component={medicalEquipmentNotification}
                          backBehavior="none"
                          gestureEnabled={false}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentNotifictionUpdated: true })}
                          panHandlers={null}
                          sceneKey="MedicalEquipmentNotification"
                          title={strings('common.titles.notifications')}
                          icon={MedicalEquipmentsTab}
                        />
                      </Tabs>
                    ) : (
                      <Tabs
                        key="MedicalEquipment"
                        tabs={true}
                        tabBarPosition={'bottom'}
                        tabBarStyle={styles.tabView}
                        lazy={true}
                        showLabel={false}
                        swipeEnabled={false}
                        navBarNoBorder={true}
                        panHandlers={null}
                        gestureEnabled={false}
                        type={ActionConst.RESET}
                      >
                        <Scene
                          key="MedicalEquipmentHome"
                          navBar={MedicalHomeHeader}
                          component={medicalHomeScreen}
                          sceneKey="MedicalEquipmentHome"
                          title={strings('common.titles.shopNow')}
                          tabBarOnPress={() => Actions.MedicalEquipment()}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          icon={MedicalEquipmentsTab}
                          backBehavior="none"
                          gestureEnabled={false}
                          panHandlers={null}
                        />

                        <Scene
                          key="MedicalEquipmentBooking"
                          component={orderList}
                          title={strings('common.titles.allOrders')}
                          sceneKey="MedicalEquipmentBooking"
                          icon={MedicalEquipmentsTab}
                          navBar={MyCareWagonHeader}
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentBookingUpdated: true })}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          gestureEnabled={false}
                          backBehavior="none"
                          panHandlers={null}
                        />

                        <Scene
                          key="MedicalEquipmentProfile"
                          navBar={MyCareWagonHeader}
                          component={Profile}
                          backBehavior="none"
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentProfileUpdated: true })}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          hideNavBar={true}
                          isMedicalEquipmentNotifictionUpdated={false}
                          panHandlers={null}
                          sceneKey="MedicalEquipmentProfile"
                          title={strings('common.titles.myProfile')}
                          icon={MedicalEquipmentsTab}
                        />

                        <Scene
                          key="MedicalEquipmentNotification"
                          navBar={MyCareWagonHeader}
                          component={medicalEquipmentNotification}
                          backBehavior="none"
                          gestureEnabled={false}
                          tabBarOnPress={() => Actions.MedicalEquipment({ isMedicalEquipmentNotifictionUpdated: true })}
                          isMedicalEquipmentProfileUpdated={false}
                          isMedicalEquipmentBookingUpdated={false}
                          isMedicalEquipmentHomeScreenUpdated={false}
                          isMedicalEquipmentNotifictionUpdated={false}
                          panHandlers={null}
                          sceneKey="MedicalEquipmentNotification"
                          title={strings('common.titles.notifications')}
                          icon={MedicalEquipmentsTab}
                        />
                      </Tabs>
                    )}
                  </Scene>
                </Drawer>
                <Drawer
                  key="VitalDrawer"
                  onExit={() => {
                    VitalHomeDrawer.drawerClosed();
                  }}
                  onEnter={() => {}}
                  contentComponent={VitalHomeDrawer}
                  drawerPosition={'left'}
                  drawerWidth={wp(70)}
                  gestureEnabled={true}
                  panHandlers={true}
                  tapToClose={true}
                  type={ActionConst.RESET}
                  swipeEnabled={true}
                  openDrawerOffSet={0.2}
                  panCloseMask={0.2}
                  negotiatePan
                >
                  <Scene
                    key="VitalHome"
                    navBar={VitalHomeHeader}
                    component={VitalHomeScreen}
                    sceneKey="VitalHome"
                    title={strings('common.titles.vitalSignsMonitoring')}
                    icon={MedicalEquipmentsTab}
                    backBehavior="none"
                    gestureEnabled={false}
                    panHandlers={null}
                  />
                </Drawer>

                <Stack key="ProductDetails">
                  <Scene
                    key={'ProductDetails'}
                    title={''}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={productDetails}
                    navBar={productDetailsHeader}
                  />
                </Stack>

                <Stack key="OrderSummary">
                  <Scene
                    key={'OrderSummary'}
                    title={strings('common.titles.orderSummary')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={orderSummary}
                    navBar={orderSummaryHeader}
                  />
                </Stack>
                <Stack key="confirmBooking">
                  <Scene
                    key={'confirmBooking'}
                    title={strings('common.titles.confirmBooking')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={confirmBooking}
                    navBar={orderSummaryHeader}
                  />
                </Stack>
                <Stack key="appointmentDetails">
                  <Scene
                    key={'appointmentDetails'}
                    title={strings('common.titles.appointmentDetails')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={appointmentDetails}
                    navBar={orderSummaryHeader}
                  />
                </Stack>

                <Stack key="EPrescription">
                  <Scene
                    key={'EPrescription'}
                    title={strings('common.titles.ePrescription')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={EPrescription}
                    navBar={orderSummaryHeader}
                  />
                </Stack>

                <Stack key="MyOrderSummary" hideNavBar>
                  <Scene
                    key={'MyOrderSummary'}
                    title={strings('common.titles.reviewOrder')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={myOrderSummary}
                  />
                </Stack>
                <Stack key="Article" hideNavBar>
                  <Scene key={'Article'} title={strings('common.titles.article')} gestureEnabled={false} panHandlers={null} component={Article} />
                </Stack>

                <Stack key="SelectPayment">
                  <Scene
                    key={'SelectPayment'}
                    title={strings('common.titles.selectPayment')}
                    gestureEnabled={false}
                    panHandlers={null}
                    component={selectPayment}
                    navBar={EquipmentCommonHeader}
                  />
                </Stack>
                <Stack key="ModalPopUp" hideNavBar>
                  <Scene key={'ModalPopUp'} title={strings('common.titles.modal')} gestureEnabled={false} panHandlers={null} component={ModalPopUp} />
                </Stack>

                {Platform.OS === 'ios' ? (
                  <Tabs
                    key="caregiverTab"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    lazy={true}
                    showLabel={false}
                    swipeEnabled={false}
                    navBarNoBorder={true}
                    panHandlers={null}
                    gestureEnabled={false}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="CaregiverHome"
                      sceneKey="CaregiverHome"
                      component={caregiverHomeScreen}
                      navBar={caregiverHeader}
                      icon={CaregiverTab}
                      title="Select Caregiver"
                      tabBarOnPress={() => Actions.caregiverTab()}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />

                    <Scene
                      key="CaregiverRequest"
                      sceneKey="CaregiverRequest"
                      component={caregiverBookingRequestScreen}
                      navBar={caregiverHeader}
                      icon={CaregiverTab}
                      title={strings('common.titles.selectCaregiver')}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverBookingUpdated: true })}
                      gestureEnabled={false}
                      backBehavior="none"
                      panHandlers={null}
                    />

                    <Scene
                      key="CaregiverProfile"
                      sceneKey="CaregiverProfile"
                      component={Profile}
                      navBar={MyCareWagonHeader}
                      icon={CaregiverTab}
                      title={strings('common.titles.myProfile')}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverProfileUpdated: true })}
                      backBehavior="none"
                      panHandlers={null}
                      hideNavBar={true}
                    />

                    <Scene
                      key="CaregiverNotification"
                      sceneKey="CaregiverNotification"
                      component={caregiverNotificationScreen}
                      navBar={MyCareWagonHeader}
                      icon={CaregiverTab}
                      title={strings('common.titles.notifications')}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverNotifictionUpdated: true })}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />
                  </Tabs>
                ) : (
                  <Tabs
                    key="caregiverTab"
                    tabs={true}
                    tabBarPosition={'bottom'}
                    tabBarStyle={styles.tabView}
                    lazy={true}
                    showLabel={false}
                    swipeEnabled={false}
                    navBarNoBorder={true}
                    panHandlers={null}
                    gestureEnabled={false}
                    type={ActionConst.RESET}
                  >
                    <Scene
                      key="CaregiverHome"
                      sceneKey="CaregiverHome"
                      component={caregiverHomeScreen}
                      navBar={caregiverHeader}
                      icon={CaregiverTab}
                      title={strings('common.titles.searchCaregiver')}
                      tabBarOnPress={() => Actions.caregiverTab()}
                      isCaregiverProfileUpdated={false}
                      isCaregiverBookingUpdated={false}
                      isCaregiverHomeScreenUpdated={false}
                      isCaregiverNotifictionUpdated={false}
                      backBehavior="none"
                      gestureEnabled={false}
                      panHandlers={null}
                    />

                    <Scene
                      key="CaregiverRequest"
                      sceneKey="CaregiverRequest"
                      component={caregiverBookingRequestScreen}
                      navBar={caregiverHeader}
                      icon={CaregiverTab}
                      title={strings('common.titles.serviceRequests')}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverBookingUpdated: true })}
                      isCaregiverProfileUpdated={false}
                      isCaregiverBookingUpdated={false}
                      isCaregiverHomeScreenUpdated={false}
                      isCaregiverNotifictionUpdated={false}
                      gestureEnabled={false}
                      backBehavior="none"
                      panHandlers={null}
                    />

                    <Scene
                      key="CaregiverProfile"
                      sceneKey="CaregiverProfile"
                      component={Profile}
                      navBar={MyCareWagonHeader}
                      hideNavBar={true}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverProfileUpdated: true })}
                      icon={CaregiverTab}
                      title={strings('common.titles.myProfile')}
                      backBehavior="none"
                      isCaregiverProfileUpdated={false}
                      isCaregiverBookingUpdated={false}
                      isCaregiverHomeScreenUpdated={false}
                      isCaregiverNotifictionUpdated={false}
                      panHandlers={null}
                    />

                    <Scene
                      key="CaregiverNotification"
                      sceneKey="CaregiverNotification"
                      component={caregiverNotificationScreen}
                      navBar={MyCareWagonHeader}
                      tabBarOnPress={() => Actions.caregiverTab({ isCaregiverNotifictionUpdated: true })}
                      icon={CaregiverTab}
                      title={strings('common.titles.notifications')}
                      backBehavior="none"
                      gestureEnabled={false}
                      isCaregiverProfileUpdated={false}
                      isCaregiverBookingUpdated={false}
                      isCaregiverHomeScreenUpdated={false}
                      isCaregiverNotifictionUpdated={false}
                      panHandlers={null}
                    />
                  </Tabs>
                )}
              </Stack>
            </Router>
            <FlashMessage position="top" />
          </View>
        </StripeProvider>
      </MenuProvider>
    );
  }
}

export default Navigation;
