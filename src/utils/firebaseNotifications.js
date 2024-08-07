import React from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Actions } from 'react-native-router-flux';
import { AppStrings } from '../shared/AppStrings';
import { showMessage } from 'react-native-flash-message';
import { AppColors } from '../shared/AppColors';
import { AppStyles } from '../shared/AppStyles';
import { AppUtils } from './AppUtils';

let makeAlert = true;

export default class firebaseNotifications {
  static async listenForNotif() {
    let self = this;
    messaging()
      .onNotificationOpenedApp(async (remoteMessage) => {
        console.log('onNotificationOpenedApp', remoteMessage);
        this.clickActions(remoteMessage);
      })
    

    messaging()
      .setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('setBackgroundMessageHandler', remoteMessage);
        AppUtils.console('Message handled in the background!', remoteMessage);
        this.clickActions(remoteMessage?.data);
      })
    
    messaging()
      .getInitialNotification(async (remoteMessage) => {
        console.log('getInitialNotification', remoteMessage);
        AppUtils.console('Message Initial', remoteMessage);
        this.clickActions(remoteMessage?.data);
      })
   

    messaging()
      .onMessage(async (message) => {
        console.log('onMessage', remoteMessage);
        AppUtils.console('sdzxcdfgc', message, message.notification.body);
        if (message.data.notify_about === 'AMBULANCE_BOOKED_SUCCESSFUL') {
          if (Actions.currentScene === 'SearchingVehicle') {
            await self.PickUpDetailsScreen(JSON.parse(message.data.body));
          } else {
            showMessage({
              message: message.notification.title,
              description: message.notification.body,
              type: 'danger',
              titleStyle: { fontFamily: AppStyles.fontFamilyMedium },
              textStyle: { fontFamily: AppStyles.fontFamilyRegular },
              style: { backgroundColor: AppColors.primaryColor },
              duration: 3000,
              onPress() {
                self.PickUpDetailsScreen(JSON.parse(message.data.body));
              },
            });
          }
        } else {
          showMessage({
            message: message.notification.title,
            description: message.notification.body,
            type: 'danger',
            titleStyle: { fontFamily: AppStyles.fontFamilyMedium },
            textStyle: { fontFamily: AppStyles.fontFamilyRegular },
            style: { backgroundColor: AppColors.primaryColor },
            duration: 3000,
            onPress() {
              self.clickActions(message.data);
            },
          });
        }
      })
     
  }

  static async PickUpDetailsScreen(data) {
    await AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: false }));
    await AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: {} }));
    Actions.PickUpDetailsScreen({ wagonData: data });
  }

  static async backgroundNotification(notif) {
    setTimeout(async () => {
      await this.clickActions(notif);
    }, 2000);
  }

  static async clickActions(notif) {
    // let response = JSON.parse(notif.body);
    AppUtils.console('zcvfdszds', notif);
    if (notif.notify_about === 'AMBULANCE_BOOKED_SUCCESSFUL') {
      await AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: false }));
      await AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: {} }));
      Actions.PickUpDetailsScreen({ wagonData: data });
    } else if (
      notif.notify_about === 'PICKED_UP' ||
      notif.notify_about === 'TRIP_COMPLETED' ||
      notif.notify_about === 'NON_PAYMENT_CANCELLATION' ||
      notif.notify_about === 'AMOUNT_REFUND' ||
      notif.notify_about === 'TRIP_CHANGED' ||
      notif.notify_about === 'NO_RESPONSE' ||
      notif.notify_about === 'TRIP_CANCELLED'
    ) {
      Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
    } else if (
      notif.notify_about === 'BOOK_CAREGIVER' ||
      notif.notify_about === 'JOB_ACCEPTED' ||
      notif.notify_about === 'CAREGIVER_AMOUNT_PAID' ||
      notif.notify_about === 'JOB_CANCELLED' ||
      notif.notify_about === 'JOB_AMOUNT_PAID' ||
      notif.notify_about === 'JOB_COMPLETED' ||
      notif.notify_about === 'JOB_NO_RESPONSE' ||
      notif.notify_about === 'JOB_CANCELLED_DUE_TO_NO_PAYMENT' ||
      notif.notify_about === 'JOB_STARTED'
    ) {
      Actions.caregiverTab({ isCaregiverBookingUpdated: true });
    } else if (
      notif.notify_about === 'ORDER_PRODUCT' ||
      notif.notify_about === 'PRODUCT_PROCESSED' ||
      notif.notify_about === 'PRODUCT_SHIPPED' ||
      notif.notify_about === 'PRODUCT_DELIVERED' ||
      notif.notify_about === 'PRODUCT_CANCELLED' ||
      notif.notify_about === 'REFUND_AMOUNT' ||
      notif.notify_about === 'PRODUCT_PROCESSING' ||
      notif.notify_about === 'PRODUCT_PACKED' ||
      notif.notify_about === 'TRANSACTION_FAILED'
    ) {
      data.data.orderId
        ? Actions.MyOrderSummary({ orderId: data.data.orderId })
        : Actions.MedicalEquipment({ isMedicalEquipmentBookingUpdated: true });
    } else if (notif.notify_about === 'ADMIN_GRANTED_VITAL_SUBSCRIPTION' || notif.notify_about === 'VITAL_AMOUNT_PAID') {
      Actions.VitalDrawer();
    } else if (notif.notify_about === 'AMOUNT_PAID' || notif.notify_about === 'TRANSACTION_FAILED' || notif.notify_about === 'AMOUNT_REFUND') {
      //Actions.MyAppointments();
    } else if (notif.notify_about === 'ARTICLE_UPLOADED' || notif?.data?.articleId) {
      Actions.Article();
    } else if (
      notif.notify_about === 'MAKE_PAYMENT' ||
      notif.notify_about === 'CLINIC_PROPOSED_NEW_TIME' ||
      (notif?.body?.appointmentState === 'WAITING_CLINIC_CONFIRMATION' && notif.notify_about === 'PATIENT_RECEIVED_MESSAGES') ||
      notif.param === 'EXPIRE_AFTER_FIVE_MIN'
    ) {
      AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: true, isUpComing: false, isPast: false }));
      Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
    } else if (notif.notify_about === 'CLINIC_REJECTED_APPOINTMENT' || notif.notify_about === 'CLINIC_CANCEL_APPOINTMENT') {
      AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: false, isUpComing: false, isPast: true }));
      Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
    } else if (
      notif.notify_about === 'PRESCRIPTION_UPLOADED' ||
      notif.notify_about === 'USER_APPOINTMENT_AMOUNT_PAID' ||
      notif.notify_about === 'INCOMING_CALL' ||
      notif.notify_about === 'CLINIC_CONFIRMED_APPOINTMENT' ||
      notif.notify_about === 'PATIENT_RECEIVED_MESSAGES' ||
      notif.notify_about === 'E_PRESCRIPTION_GENERATED'
    ) {
      AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: false, isUpcoming: true, isPast: false }));
      Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
    } else {
      AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true }));
      Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
    }
  }

  static async requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
      AppUtils.console('Permission status_5:', authorizationStatus);
    }
  }

  static checkPermission() {
    makeAlert = true;
    messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          this.listenForNotif();
          // user has permissions
        } else {
          messaging()
            .requestPermission()
            .then(() => {
              this.listenForNotif();
              // User has authorised
            })
            .catch((error) => {
              AppUtils.console('szdxcxd', error);
            });
          // user doesn't have permission
        }
      });
  }

  static _getPermission = async () => {
    messaging()
      .requestPermission()
      .then(() => {
        this.checkPermission();
      })
      .catch((error) => {
        // User has rejected permissions
      });
  };

  static fcmToken = async () => {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      messaging()
        .getToken()
        .then((fcmToken) => {
          AppUtils.console('wafdvdszsd', fcmToken);
          if (fcmToken) {
            return fcmToken;
            // user has a device token
          } else {
            return null;
            // user doesn't have a device token yet
          }
        });
    } else this._getPermission();
  };

  static async fetchFCMToken() {
    try {
      const enabled = await messaging().hasPermission();
      if (enabled) {
        return await messaging().getToken();
      } else this._getPermission();
    } catch (e) {
      AppUtils.console('fetchFCMToken_catch', e);
      return null;
    }
  }

  componentDidMount() {
    this.subs = this.props.navigation.addListener('didFocus', () => (makeAlert = true));
  }
}
