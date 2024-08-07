import React, { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressLoader from 'rn-progress-loader';
import { AppColors } from '../../shared/AppColors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppUtils } from '../../utils/AppUtils';
import { SHApiConnector } from '../../network/SHApiConnector';
import { Actions } from 'react-native-router-flux';
import { moderateScale } from '../../utils/Scaling';
import { AppStrings } from '../../shared/AppStrings';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from '../../locales/i18n';

const paymentSuccessImg = require('../../../assets/images/success.png');
const paymentFailImg = require('../../../assets/images/cancel.png');
const successMessage = 'Your payment request is successful !';
const cancelledMessage = 'Cancelled';

const delayedCallback = (cb, timeout = 0) =>
  new Promise((resolve) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timeout);
  });

const XenditInstantVc = (props) => {
  const { paymentDetails, module, callType,patientDetails} = props;
  AppUtils.analyticsTracker('Xendit Instant Payment Screen');
  const invoiceId = paymentDetails?.appointmentRequest?.xenditPaymentInvoiceId;
  const [invoiceUrl, setInvoiceUrl] = useState(paymentDetails?.appointmentRequest?.xenditPaymentInvoiceUrl);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [msg, setMsg] = useState('');
  const [requestCompleted, setRequestCompleted] = useState(false);
  const [isPaymentSuccess, setPaymentSuccess] = useState(false);
  const backHandlerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      backHandlerRef.current.remove();
      backHandlerRef.current = null;
    };
  }, []);

  const handleSuccess = async () => {
    await AppUtils.positiveEventCount();
    setRequestCompleted(true);
    setPaymentSuccess(true);
    setMsg(successMessage);

    await delayedCallback(() => {
      AppUtils.console('timeout', '---');
    }, 500);
    if (module === AppStrings.key.equipment) {
      Actions.drawer({ isMedicalEquipmentBookingUpdated: true });
    } else if (module === AppStrings.key.caregiver) {
      Actions.caregiverTab({ isCaregiverBookingUpdated: true });
    } else if (module === AppStrings.key.medicine) {
      Actions.pop();
      setTimeout(() => {
        Actions.refresh({ update: true });
      }, 500);
    } else if (module === AppStrings.key.vital) {
      Actions.MainScreen();
    } else if (module === AppStrings.key.appointment) {
      if (callType == 'AUDIO' || callType == 'VIDEO') {
        Alert.alert(strings('doctor.alertTitle.paySuccess'), strings('doctor.alertMsg.paySuccess'), [
          {
            text: strings('doctor.button.ok'),
            onPress: () => handleNavigation(),
          },
        ]);
      } else {
        Actions.HomeScreenDash({ isAppointmentUpdated: true });
      }
    } else {
      Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
    }
  };

  const handleNavigation =()=>{
    Actions.AppointmentRequested({
      requestId: paymentDetails?.appointmentRequest?._id,
      amount: paymentDetails?.appointmentRequest?.callCharge,
      currency:paymentDetails?.appointmentRequest?.country?.currencyCode,
      isWavedOff: paymentDetails?.appointmentRequest?.isWaiveOff,
      patientDetails: patientDetails,
    });
  }

  const handleBackPress = async () => {
    await SHApiConnector.xenditPaymentCallback(module, invoiceId);
    setLoading(true);
    setRequestCompleted(true)
    setPaymentCompleted(true);
    setPaymentSuccess(true);
    setMsg(cancelledMessage);

    await delayedCallback(handleCancel, 500);
  };

  const handleCancel = () => {
    Actions.pop();
  };

  const _onNavigationStateChange = async (webViewState) => {
    let responseURL = webViewState.url;
    if (responseURL.includes("isInstant=true")) {
      if (
        Platform.OS === 'ios'
          ? responseURL.includes(`/${AppStrings.xenditDetails.CANCEL_WEBHOOK_ENDPOINT}`)
          : responseURL.startsWith(`myclnq://${AppStrings.xenditDetails.CANCEL_CALLBACK_ENDPOINT}`)
      ) {
        setPaymentCompleted(true);
        setLoading(true);
        await delayedCallback(handleCancel, 500);
      } else if (
        Platform.OS === 'ios'
          ? responseURL.includes(`/${AppStrings.xenditDetails.SUCCESS_WEBHOOK_ENDPOINT}`)
          : responseURL.startsWith(`myclnq://${AppStrings.xenditDetails.SUCCESS_CALLBACK_ENDPOINT}`)
      ) {
        setLoading(true);
        setPaymentCompleted(true);
        await delayedCallback(handleSuccess, 500);
      } 
    }
   
  };

  const renderLoading = () => {
    return <ProgressLoader visible={loading} isModal={true} isHUD={true} hudColor={AppColors.whiteColor} color={AppColors.primaryColor} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBackPress}>
          <AntDesign name="arrowleft" size={32} color={'white'} />
        </TouchableOpacity>
      </View>

      {requestCompleted ? (
        <View
          style={{
            width: wp(100),
            height: hp(100),
            marginRight: moderateScale(5),
            marginLeft: moderateScale(5),
            justifyContent: 'center',
            alignItem: 'center',
            alignSelf: 'center',
          }}
        >
          <Image resizeMode={'contain'} source={isPaymentSuccess ? paymentSuccessImg : paymentFailImg} style={styles.paymentImg} />
          <Text allowFontScaling={false} style={[styles.msgStyle, { color: isPaymentSuccess ? AppColors.greenColor : AppColors.primaryColor }]}>
            {msg}
          </Text>
        </View>
      ) : paymentCompleted ? (
        renderLoading()
      ) : (
        <WebView
          style={{
            height: hp(100),
            width: wp(100),
          }}
          startInLoadingState={true}
          source={{ uri: invoiceUrl }}
          renderLoading={() => renderLoading()}
          androidHardwareAccelerationDisabled={false}
          onNavigationStateChange={_onNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    width: wp(100),
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: AppColors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    color: AppColors.primaryColor,
  },
  header1: {
    paddingTop: hp(5),
    paddingBottom: 10,
    backgroundColor: '#0c084c',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: hp(-4),
  },
  blackArrowIcon: {
    height: hp(4),
    width: wp(9),
    marginLeft: 10,
    tintColor: AppColors.whiteColor,
    marginTop: hp(2),
  },
  paymentImg: {
    height: hp(30),
    width: wp(50),
    alignSelf: 'center',
  },
  msgStyle: {
    alignSelf: 'center',
    fontSize: hp(3),
    textAlign: 'center',
  },
});

export default XenditInstantVc;
