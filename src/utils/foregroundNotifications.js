import PushNotification, { Importance } from 'react-native-push-notification';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { EventType } from '@notifee/react-native';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import { AppUtils } from './AppUtils';
import { AppStrings } from '../shared/AppStrings';
async function clickActions(notif){
  // let response = JSON.parse(notif.body);
  const notifyAbout = notif.notify_about;
  AppUtils.console('zcvfdszds', notif);
  if (notifyAbout === 'AMBULANCE_BOOKED_SUCCESSFUL') {
    await AsyncStorage.setItem(AppStrings.wagonSearch.IS_SEARCH_ACTIVE, JSON.stringify({ isWagonSearchActive: false }));
    await AsyncStorage.setItem(AppStrings.wagonSearch.BOOKING_DATA, JSON.stringify({ bookingData: {} }));
    Actions.PickUpDetailsScreen({ wagonData: data });
  } else if (
    notifyAbout === 'PICKED_UP' ||
    notifyAbout === 'TRIP_COMPLETED' ||
    notifyAbout === 'NON_PAYMENT_CANCELLATION' ||
    notifyAbout === 'AMOUNT_REFUND' ||
    notifyAbout === 'TRIP_CHANGED' ||
    notifyAbout === 'NO_RESPONSE' ||
    notifyAbout === 'TRIP_CANCELLED'
  ) {
    Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
  } else if (
    notifyAbout === 'BOOK_CAREGIVER' ||
    notifyAbout === 'JOB_ACCEPTED' ||
    notifyAbout === 'CAREGIVER_AMOUNT_PAID' ||
    notifyAbout === 'JOB_CANCELLED' ||
    notifyAbout === 'JOB_AMOUNT_PAID' ||
    notifyAbout === 'JOB_COMPLETED' ||
    notifyAbout === 'JOB_NO_RESPONSE' ||
    notifyAbout === 'JOB_CANCELLED_DUE_TO_NO_PAYMENT' ||
    notifyAbout === 'JOB_STARTED'
  ) {
    Actions.caregiverTab({ isCaregiverBookingUpdated: true });
  } else if (
    notifyAbout === 'ORDER_PRODUCT' ||
    notifyAbout === 'PRODUCT_PROCESSED' ||
    notifyAbout === 'PRODUCT_SHIPPED' ||
    notifyAbout === 'PRODUCT_DELIVERED' ||
    notifyAbout === 'PRODUCT_CANCELLED' ||
    notifyAbout === 'REFUND_AMOUNT' ||
    notifyAbout === 'PRODUCT_PROCESSING' ||
    notifyAbout === 'PRODUCT_PACKED' ||
    notifyAbout === 'TRANSACTION_FAILED'
  ) {
    data.data.orderId
      ? Actions.MyOrderSummary({ orderId: data.data.orderId })
      : Actions.MedicalEquipment({ isMedicalEquipmentBookingUpdated: true });
  } else if (notifyAbout === 'ADMIN_GRANTED_VITAL_SUBSCRIPTION' || notifyAbout === 'VITAL_AMOUNT_PAID') {
    Actions.VitalDrawer();
  } else if (notifyAbout === 'AMOUNT_PAID' || notifyAbout === 'TRANSACTION_FAILED' || notifyAbout === 'AMOUNT_REFUND') {
    //Actions.MyAppointments();
  } else if (notifyAbout === 'ARTICLE_UPLOADED' || notif?.data?.articleId) {
    Actions.Article();
  } else if (
    notifyAbout === 'MAKE_PAYMENT' ||
    notifyAbout === 'CLINIC_PROPOSED_NEW_TIME' ||
    (notif?.body?.appointmentState === 'WAITING_CLINIC_CONFIRMATION' && notifyAbout === 'PATIENT_RECEIVED_MESSAGES') ||
    notif.param === 'EXPIRE_AFTER_FIVE_MIN'
  ) {
    AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: true, isUpComing: false, isPast: false }));
    Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
  } else if (notifyAbout === 'CLINIC_REJECTED_APPOINTMENT' || notifyAbout === 'CLINIC_CANCEL_APPOINTMENT') {
    AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: false, isUpComing: false, isPast: true }));
    Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
  } else if (
    notifyAbout === 'PRESCRIPTION_UPLOADED' ||
    notifyAbout === 'USER_APPOINTMENT_AMOUNT_PAID' ||
    notifyAbout === 'INCOMING_CALL' ||
    notifyAbout === 'CLINIC_CONFIRMED_APPOINTMENT' ||
    notifyAbout === 'PATIENT_RECEIVED_MESSAGES' ||
    notifyAbout === 'E_PRESCRIPTION_GENERATED'
  ) {
    AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true, isRequest: false, isUpcoming: true, isPast: false }));
    Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
  } else {
    AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true }));
    Platform.OS === 'ios' ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
  }
} 

const ForegroundNotifications = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    try {
        if(Platform.OS=='ios'){
          await notifee.requestPermission()
        }
      // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'default',
      importance: AndroidImportance.HIGH,
    });
      // Display a notification
    await notifee.displayNotification({
      title:remoteMessage.notification.title,
      body:remoteMessage.notification.body,
      id:remoteMessage.messageId,
      data:remoteMessage.data,
      ios: {
        // iOS resource (.wav, aiff, .caf)
        sound: remoteMessage.notification.sound,
      },
      android: {
        channelId,
        sound: 'default',
        importance: AndroidImportance.HIGH,
        //smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      }
    });
  } catch (error) {
    console.error('Error in onMessage handler:', error);
  }
});
    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          //console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          //console.log('User pressed notification', detail.notification);
          clickActions(detail.notification.data)
          break;
      }
    }); 
    return unsubscribe;
  }, []);
  
  return null;
};

export default ForegroundNotifications;
