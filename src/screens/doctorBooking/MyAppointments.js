import React from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  PermissionsAndroid,
  PixelRatio,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  AppState,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { IndicatorViewPager, PagerDotIndicator } from 'react-native-best-viewpager';
import ZoomUs from 'react-native-zoom-us';
// import RNZoomUsBridge from '@mokriya/react-native-zoom-us-bridge';

// import RNFetchBlob from "rn-fetch-blob";
import ReactNativeBlobUtil from 'react-native-blob-util';
import { AppStyles } from '../../shared/AppStyles';
import images from '../../utils/images';

import SHButtonDefault from '../../shared/SHButtonDefault';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';
import { Actions } from 'react-native-router-flux';
import ElevatedView from 'react-native-elevated-view';
import SHButton from '../../shared/SHButton';
import ProgressLoader from 'rn-progress-loader';
import SlotView from '../../shared/SlotView';
import { AppStrings } from '../../shared/AppStrings';
import config from '../../../config';
import Pdf from 'react-native-pdf';
import { CachedImage, ImageCacheProvider } from '../../cachedImage';
import caregiverBookingRequestStyle from './../caregiver/caregiverBookingRequest/caregiverBookingRequestStyle';
import ApplyVoucher from '../../shared/ApplyVoucher';

const confirmLogo = require('../../../assets/images/confirm_icon.png');
import Toast from 'react-native-simple-toast';
import { strings } from '../../locales/i18n';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';

//import Razer Merchant Services package
var molpay = require('molpay-mobile-xdk-reactnative-beta');

var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
const formattedCurrentDate = `${dt.getDate().toString().padStart(2, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getFullYear()}`;
const appointmentDateRegex = /^\d{2}-\d{2}-\d{4}$/;

const unSelectedSlotColor = AppColors.whiteColor;
const selectedSlotColor = AppColors.primaryColor;

const { width, height } = Dimensions.get('window');
const timer = require('react-native-timer');

class MyAppointments extends React.Component {
  constructor(props) {
    super();
    super(props);
    AppUtils.analyticsTracker('View Appointments');
    this.state = {
      isLoading: false,
      isProgressLoader: false,
      isDataVisible: false,
      upcomingAppointment: [],
      startTime: '',
      hour: '',
      minute: '',
      second: '',
      appointmentStatus: '',
      dropDownEnabled: false,
      appointmentId: '',
      slot: [],
      isRescheduling: false,
      animationType: 'bounceInUp',
      emptyText: '',
      isSlotAvailable: false,
      selectedSlot: {},
      clinicId: '',
      doctorId: '',
      patientId: '',
      confirmation: false,
      isPrescriptionView: false,
      isPrescriptionFullView: false,
      prescriptionList: [],
      prescriptionAppointment: {},
      selectedImageIndex: 0,
      patientName: '',
      selectedQueueNumber: '',
      selectedDoctorName: '',
      selectedStartDate: '',
      selectedClinicName: '',
      selectedClinicAddress: '',
      nextAvailableDay: false,
      nextAvailableDate: '',
      dateToday: Platform.OS === 'ios' ? _dt : moment().format('dd mmm'),
      isRefreshing: false,
      advanceBookingDays: '',
      isUpComing: true,
      isFooterLoading: false,
      showDate: false,
      isEmpty: false,
      selectedAppointment: '',
      isRequest: false,
      isPast: false,
      cancelReqData: [],
      cancelReqState: '',
      isCancelReqModal: false,
      message: '',
      field: 'UPCOMING',
      countryCode: '',
      coupon: '',
      couponItem: '',
      showApplyCoupon: false,
      appState: AppState.currentState,
      isOpneVoucherModal: false,
      selectedAppointmentDetails: {},
      modalVisible: false,
      _waveOff: false,
      _waveOffData: [],
      couponApplyStatus: false,
      subscriptionCount: 0,
      featureId: '',
      rmsPaymentStatus: false,
      rmsPaymentData: {},
    };
    this.getMyAppointments = this.getMyAppointments.bind(this);
    this.getLeftTime = this.getLeftTime.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
    selectedPdfUrl = '';
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({ isRefreshing: true });
      this.getMyAppointments();
    }
    this.setState({ appState: nextAppState, couponApplyStatus: false });
  };

  async componentWillMount() {
    var self = this;
    // this.initZoom();
    this.getSubscriptionData();
    self.getAddress();
    const userCountryCode = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)).countryCode;
    this.setState({ countryCode: userCountryCode });
    AsyncStorage.getItem(AppStrings.key.key).then((key) => {
      try {
        var key_key = key;
        key_key = JSON.parse(key);

        if (key && key_key.key) {
          self.setState({
            isUpComing: false,
            isRequest: true,
            isPast: false,
            isLoading: false,
            field: 'REQUEST',
          });
          AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false }));
        } else if (key && key_key.isPast) {
          self.setState({
            isUpComing: false,
            isRequest: false,
            isPast: true,
            isLoading: false,
            field: 'PAST',
          });
          AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false }));
        } else {
          self.setState({
            isRequest: false,
            isUpComing: true,
            isPast: false,
            isLoading: false,
            field: 'UPCOMING',
          });
        }
        self.getMyAppointments();
      } catch (err) {
        self.setState({
          isRequest: false,
          isPast: false,
          isUpComing: true,
          isLoading: false,
          field: 'UPCOMING',
        });
        self.getMyAppointments();
      }
    });
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }

  async requestAppPermission() {
    try {
      if (Platform.OS === 'android') {
        const checkWritePermission = PermissionsAndroid.check('android.permission.BLUETOOTH_CONNECT');
        if (checkWritePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          const granted = await PermissionsAndroid.request('android.permission.BLUETOOTH_CONNECT', {
            title: 'MyCLNQ app requires bluetooth permission',
            message: 'MyCLNQ app requires bluetooth permission for video calls',
          });
        } else {
          return true;
        }
      } else {
        return true;
      }
    } catch (e) {
      AppUtils.console('szdfsasfgfhrwre', e);
      return false;
    }
  }

  async initZoom() {
    // if (RNZoomUsBridge) {
    //   try {
    //     await RNZoomUsBridge.initialize(config.zoom.ZOOM_APP_KEY, config.zoom.ZOOM_SECRET_KEY)
    //       .then()
    //       .catch((err) => {
    //         console.warn(err);
    //         Alert.alert('error!', err.message);
    //       });
    //   } catch (e) {
    //     AppUtils.console('sdfsergdxdsdf', e);
    //   }
    // }
    // const data ={
    //   meetingId :'12345678',
    //   role:1
    // }
    // const zoomSign = await SHApiConnector.getZoomSignature(data)
    // console.log(zoomSign.data,'zoomSign')
    // const jwtToken =
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCLVdhMmR0d1JuNjNKOXR3RzZIMEpRIiwiZXhwIjoxNzE1MDE5NjY3MzUxLCJpYXQiOjE3MTUwMTkxNjd9.hFo8f-OjPI2pJhJn5DR0figoOj-PJC7ggZvTDuuhuMU';
    // await ZoomUs.initialize({
    //   clientKey: config.zoom.CLIENT_ID,
    //   clientSecret: config.zoom.CLIENT_SECRET,
    //   jwtToken: jwtToken,
    // });
  }

  async getSubscriptionData() {
    let response = await SHApiConnector.getUserSubscriptions();
    if (response.data.status) {
      console.log('MyAppointments.js: SubscriptionCheck', JSON.stringify(response.data));
      let selectedFeatures = response?.data?.data?.orders[0]?.remainingAttempts;
      selectedFeatures &&
        selectedFeatures.map((featureData) => {
          if (featureData.feature._id == AppStrings.doctorBookingId) {
            this.setState({ subscriptionCount: response.data.data.orders.length, featureId: featureData.feature._id });
          }
        });
    }
  }

  goBack() {
    Actions.HomeScreenDash();
  }

  componentDidMount() {
    this.getLeftTime();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentDidUpdate() {
    AsyncStorage.getItem(AppStrings.key.key).then((key) => {
      try {
        var key_key = key;
        key_key = JSON.parse(key);
        if (key && key_key.key) {
          if (key_key.isRequest) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false, isRequest: false }));
            this.request();
          } else if (key_key.isUpcoming) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false, isUpcoming: false }));
            this.upcoming();
          } else if (key_key.isPast) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false, isPast: false }));
            this.passed();
          }
        }
      } catch (err) {
        AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false, isRequest: false, isUpcoming: false, isPast: false }));
        this.upcoming();
      }
    });
  }

  _onRefresh = () => {
    var self = this;
    self.setState({ isRefreshing: true });
    self.getMyAppointments();
  };

  onAnimEnd() {
    if (!this.state.isRescheduling) {
      this.setState({
        isRescheduling: !this.state.isRescheduling,
      });
    } else if (this.state.animationType == 'bounceOutDown') {
      this.setState({
        isRescheduling: false,
      });
    }
  }

  onAnimStart() {
    AppUtils.console('OnAnimStart: ', this.state);
  }

  getLeftTime() {
    var arrayData = this.state.upcomingAppointment;
    var arrayLength = arrayData.length;
    var self = this;
    for (var i = 0; i < arrayLength; i++) {
      var timeTocheck = arrayData[i].startTime;

      if (this.state.isRequest == true) {
        timeTocheck = moment(arrayData[i].startTime).subtract(arrayData[i].doctorId.timeout, 'minutes').toDate();
      }

      AppUtils.getTimeDifferenceFromTodayForTransport(timeTocheck, function (hr, min, sec, days) {
        //AppUtils.console("xcvcszdxfcwsz2343", hr, min, sec, days, timeTocheck);

        arrayData[i].days = days;
        arrayData[i].hour = hr;
        arrayData[i].minute = min;
        arrayData[i].second = sec;
      });
    }
    if (self.state.isPast == false) {
      self.setState({ upcomingAppointment: arrayData });
    }
  }

  async handlePayment(selectedAppointmentDetails) {
    let self = this;
    this.setState({ isLoading: true, isProgressLoader: true });
    try {
      let data = {
        appointmentId: selectedAppointmentDetails._id,
        referralCode: selectedAppointmentDetails.couponCode ? selectedAppointmentDetails.couponCode : null,
        clinicCountryCode: selectedAppointmentDetails.clinicId.countryCode,
      };
      if (selectedAppointmentDetails.clinicId.countryCode != '60') {
        self.setState({ isCancelReqModal: false }, () => {
          setTimeout(() => {
            this.setState({ isProgressLoader: false });
          }, 200);
        });
      }
      AppUtils.console('paymentDoctor body', data);

      let response = await SHApiConnector.appointmentPayWithRefferal(data);
      this.setState({ isLoading: false, isProgressLoader: false }, () => {
        setTimeout(() => {
          AppUtils.console('paymentDoctor resp', response);
          if (response.data.status) {
            if (response.data.response.isPayByPayU) {
              let payUData = response.data.response.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;
              // payUData.phone = '6588672672';
              // console.log(payUData,'payUData')
              Actions.PayUPayment({
                paymentDetails: payUData,
                module: 'appointment',
                callType: selectedAppointmentDetails.callType,
              });
            } else if (response.data.response.isPayByRazer) {
              const paymentDetails = response.data.response.payment;
              try {
                molpay.startMolpay(paymentDetails, async (data) => {
                  const rmsResponseData = JSON.parse(data);
                  if (rmsResponseData.status_code === '00' || rmsResponseData.status_code === '22') {
                    const paymentData = {
                      appointmentId: selectedAppointmentDetails._id,
                      txn_ID: rmsResponseData.txn_ID,
                      order_id: rmsResponseData.order_id,
                      amount: rmsResponseData.amount,
                      txID: rmsResponseData.txn_ID,
                      statusCode: rmsResponseData.status_code,
                    };
                    const rmsResponse = await SHApiConnector.razorAppointmentCallback(paymentData);
                    if (rmsResponse.status === 200) {
                      alert('Payment Successfull');
                      this.upcoming();
                      this.setState({ isLoading: false, isProgressLoader: false });
                    } else {
                      alert(rmsResponse.data.message);
                      this.setState({ isLoading: false, isProgressLoader: false });
                    }
                  } else if (rmsResponseData.Error) {
                    alert(rmsResponseData.Error);
                    this.setState({ isLoading: false, isProgressLoader: false });
                  } else if (rmsResponseData.error_message) {
                    alert(rmsResponseData.error_message);
                    this.setState({ isLoading: false, isProgressLoader: false });
                  } else if (rmsResponseData.status_code === '11') {
                    alert(rmsResponseData.err_desc);
                    this.setState({ isLoading: false, isProgressLoader: false });
                  }
                });
              } catch (e) {
                console.log('Razer Exception:', e);
                alert('Sorry something went wrong !');
                this.setState({ isLoading: false, isProgressLoader: false });
              }
            } else if (response.data.response.isPayByStripe) {
              console.log('PayingByStripe');
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: 'appointment',
                callType: selectedAppointmentDetails.callType,
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.appointment,
                callType: selectedAppointmentDetails.callType,
              });
            } else {
              let hundredPercentCouponApplied =
                this.state.couponValue && this.state.couponValueType && this.state.couponValue === 100 && this.state.couponValueType === 'PERCENT';
              if (hundredPercentCouponApplied) {
                if (response.data.response.message)
                  setTimeout(() => {
                    Toast.show(response.data.response.message);
                  }, 500);
                this.upcoming();
                return;
              }
              Actions.OnlinePayment({
                paymentData: response.data.response.payment,
                module: 'appointment',
                callType: selectedAppointmentDetails.callType,
              });
            }
          } else {
            AppUtils.console('error');
            setTimeout(() => {
              Toast.show(response.data.error_message);
            }, 500);
            // Alert.alert(
            //     "",

            //     response.data.error_message? strings('doctor.alertMsg.cantPay')
            // );
          }
        }, 500);
      });
    } catch (e) {
      this.setState({ isLoading: false, isProgressLoader: false });
      AppUtils.console('error', e);
    } finally {
      this.setState({ isLoading: false, isProgressLoader: false });
    }
  }

  getMyAppointments() {
    var self = this;
    self.startTimer();
    self.setState({ isLoading: true, emptyText: 'Loading...' });
    var field = { field: self.state.field };
    SHApiConnector.getMyAppointments(field, function (err, stat) {
      try {
        self.setState(
          {
            isLoading: false,
            confirmation: false,
            emptyText: '',
            isRefreshing: false,
            showApplyCoupon: true,
            coupon: '',
            couponItem: '',
          },
          () => {
            if (!err && stat) {
              if (stat.error_code == '10006') {
                Actions.LoginOptions();
                self.setState({
                  isDataVisible: true,
                  isRefreshing: false,
                  isEmpty: false,
                  isLoading: false,
                });
              } else {
                if (self.state.isUpComing) {
                  if (stat.appointments && stat.appointments.length == 0) {
                    self.setState({
                      upcomingAppointment: [],
                      emptyText: strings('doctor.text.noUpcomingAppoint'),
                      isEmpty: true,
                      isDataVisible: false,
                      isLoading: false,
                    });
                  } else {
                    if (stat.appointments != undefined) {
                      self.setState({
                        upcomingAppointment: stat.appointments ? stat.appointments : [],
                        isDataVisible: true,
                        isRefreshing: false,
                        age: self.state.page + 1,
                        emptyText: '',
                        isEmpty: false,
                        isLoading: false,
                      });
                    }
                  }
                } else if (self.state.isPast) {
                  if (stat.pastAppointment && stat.pastAppointment.length == 0) {
                    self.setState({
                      upcomingAppointment: [],
                      emptyText: strings('doctor.text.noPastAppoint'),
                      isEmpty: true,
                      isDataVisible: false,
                      isLoading: false,
                    });
                  } else {
                    if (stat.pastAppointment != undefined) {
                      self.setState({
                        upcomingAppointment: stat.pastAppointment ? stat.pastAppointment : [],
                        isDataVisible: true,
                        isRefreshing: false,
                        page: self.state.page + 1,
                        emptyText: '',
                        isEmpty: true,
                        isLoading: false,
                      });
                    }
                  }
                } else if (self.state.isRequest) {
                  if (stat.requestAppointment && stat.requestAppointment.length == 0) {
                    self.setState({
                      upcomingAppointment: [],
                      emptyText: strings('doctor.text.noRequestAppoint'),
                      isEmpty: true,
                      isDataVisible: false,
                      isLoading: false,
                    });
                  } else {
                    if (stat.requestAppointment != undefined) {
                      self.setState({
                        upcomingAppointment: stat.requestAppointment ? stat.requestAppointment : [],
                        isDataVisible: true,
                        isRefreshing: false,
                        page: self.state.page + 1,
                        emptyText: '',
                        isEmpty: true,
                        isLoading: false,
                      });
                    }
                  }
                }
              }
            }
          }
        );
      } catch (err) {
        self.setState({ isLoading: false, emptyText: '' });
        console.err('MY_APPOINTMENT', err);
      }
    });
  }

  goHome() {
    Actions.HomeScreenDash();
  }

  startTimer() {
    this.clearTimer();
    AppUtils.timerInterval = setInterval(() => this.getLeftTime(), 1000);
  }

  clearTimer() {
    AppUtils.timerInterval != undefined ? clearInterval(AppUtils.timerInterval) : null;
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    this.clearTimer();
  }
  componentWillReceiveProps(props) {
    AppUtils.console('MyAppProps', props);
    if (props.update) {
      this._onRefresh();
    }
  }

  onExit() {
    this.clearTimer();
  }

  render() {
    var upcomingColor = this.state.isUpComing ? AppColors.primaryColor : AppColors.whiteColor;
    var upcomingTextColor = this.state.isUpComing ? AppColors.whiteColor : AppColors.blackColor;
    var pastColor = this.state.isPast ? AppColors.primaryColor : AppColors.whiteColor;
    var pastTexgColor = this.state.isPast ? AppColors.whiteColor : AppColors.blackColor;
    var requestColor = this.state.isRequest ? AppColors.primaryColor : AppColors.whiteColor;
    var requestTextColor = this.state.isRequest ? AppColors.whiteColor : AppColors.blackColor;
    return (
      <View
        style={{
          width: width,
          backgroundColor: AppColors.backgroundGray,
          height: height,
        }}
      >
        {Platform.OS === 'ios' ? this.openIOSCalender() : <View />}
        {this.state.isOpneVoucherModal ? (
          <ApplyVoucher
            isOpen={this.state.isOpneVoucherModal}
            appointmentDetails={this.state.selectedAppointmentDetails}
            closeModal={() => this.setState({ isOpneVoucherModal: false })}
            applyVoucherList={(voucherList) => this.applyVoucher(voucherList)}
          />
        ) : null}
        <ElevatedView style={styles.headerStyle} elevation={10}>
          <TouchableOpacity onPress={() => Actions.MainScreen()} style={{ flex: 1 }}>
            <Image
              resizeMode={'contain'}
              style={{
                width: wp(8),
                marginLeft: moderateScale(15),
                marginTop: AppUtils.isX ? 40 : moderateScale(5),
              }}
              source={require('../../../assets/images/blackarrow.png')}
            />
          </TouchableOpacity>
          <View
            style={{
              flex: 3,
              alignSelf: 'center',
              alignItem: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={styles.headerText}>{strings('doctor.button.myAppointment')}</Text>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => this.refreshThePage()}>
            <Image
              source={require('../../../assets/images/refresh_button.png')}
              style={{
                width: 20,
                height: 20,
                marginRight: moderateScale(15),
                marginTop: AppUtils.isX ? 40 : moderateScale(5),
                tintColor: AppColors.primaryColor,
                alignSelf: 'flex-end',
              }}
            />
          </TouchableOpacity>
        </ElevatedView>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'transparent',
            alignSelf: 'center',
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          <TouchableHighlight
            style={{
              borderBottomLeftRadius: moderateScale(20),
              borderTopLeftRadius: moderateScale(20),
              height: verticalScale(40),
              width: width / 3.5,
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderRightWidth: 0,
              borderLeftWidth: 2,
              borderColor: AppColors.primaryColor,
              backgroundColor: requestColor,
              alignContent: 'center',
              justifyContent: 'center',
            }}
            onPress={() => this.request()}
            underlayColor={AppColors.primaryColor}
          >
            <Text style={{ alignSelf: 'center', color: requestTextColor }}>{strings('doctor.button.request')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              height: verticalScale(40),
              width: width / 3.5,
              borderWidth: 1,
              borderColor: AppColors.primaryColor,
              backgroundColor: upcomingColor,
              alignContent: 'center',
              justifyContent: 'center',
            }}
            onPress={() => this.upcoming()}
            underlayColor={AppColors.primaryColor}
          >
            <Text style={{ alignSelf: 'center', color: upcomingTextColor }}>{strings('doctor.button.upcoming')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              borderTopRightRadius: moderateScale(20),
              borderBottomRightRadius: moderateScale(20),
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderRightWidth: 2,
              borderLeftWidth: 0,
              marginLeft: -0.1,
              borderColor: AppColors.primaryColor,
              height: verticalScale(40),
              backgroundColor: pastColor,
              width: width / 3.5,
              alignContent: 'center',
              justifyContent: 'center',
            }}
            onPress={() => this.passed()}
            underlayColor={AppColors.primaryColor}
          >
            <Text style={{ alignSelf: 'center', color: pastTexgColor }}>{strings('doctor.button.past')}</Text>
          </TouchableHighlight>
        </View>
        {this.upcomingAppointment()}
        {this.state.isCancelReqModa ? this.rejectRequestModal() : null}
        {this.state.isCouponModal ? this.couponModal() : null}
        {this.state.isPrescriptionView ? this.prescriptionViewModal() : null}
        {this.state.isPrescriptionFullView ? this.prescriptionFullView() : null}
        {this.state.isProgressLoader ? (
          <ProgressLoader visible={this.state.isProgressLoader} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        ) : null}
      </View>
    );
  }

  async applyVoucher(voucherList) {
    AppUtils.console('esdfwesgfbfd', voucherList);
    try {
      let data = {
        voucherList: voucherList,
        appointmentId: this.state.selectedAppointmentDetails._id,
      };
      let response = await SHApiConnector.applyConsultaionVoucher(data);
      if (response.data.status) {
        AppUtils.positiveEventCount();
        if (this.state.selectedAppointmentDetails.callType == 'AUDIO' || this.state.selectedAppointmentDetails.callType == 'VIDEO') {
          this.setState({
            isOpneVoucherModal: false,
            selectedAppointmentDetails: {},
          });
          Alert.alert(strings('doctor.alertTitle.paySuccess'), strings('doctor.alertMsg.paySuccess'), [
            {
              text: strings('doctor.button.ok'),
              onPress: () => this.upcoming(),
            },
          ]);
        } else {
          this.setState({
            isOpneVoucherModal: false,
            selectedAppointmentDetails: {},
          });
          this.upcoming();
        }
      }
      AppUtils.console('dzxzsfxsdzsdsf', response);
    } catch (e) {
      AppUtils.console('dzxzsfxsdzsdsf', e);
    }
  }

  refreshThePage() {
    this.getMyAppointments();
  }

  upcoming() {
    this.setState(
      {
        isUpComing: true,
        isRescheduling: false,
        isRequest: false,
        isPast: false,
        upcomingAppointment: [],
        isEmpty: false,
        field: 'UPCOMING',
      },
      () => {
        this.getMyAppointments();
      }
    );
  }

  passed() {
    this.setState(
      {
        isUpComing: false,
        isRescheduling: false,
        isRequest: false,
        isPast: true,
        upcomingAppointment: [],
        isEmpty: false,
        field: 'PAST',
      },
      () => {
        this.getMyAppointments();
        this.clearTimer();
      }
    );
  }

  request() {
    this.setState(
      {
        isUpComing: false,
        isRescheduling: false,
        isRequest: true,
        isPast: false,
        upcomingAppointment: [],
        isEmpty: false,
        field: 'REQUEST',
      },
      () => {
        this.getMyAppointments();
        this.clearTimer();
      }
    );
  }

  upcomingAppointment() {
    return (
      <View>
        <ScrollView style={styles.scrollView}>
          <View style={{ marginBottom: moderateScale(180) }}>
            {this.state.isDataVisible ? (
              <View
                style={{
                  width: width,
                  marginBottom: Platform.OS === 'ios' ? verticalScale(80) : verticalScale(50),
                }}
              >
                <FlatList
                  data={this.state.upcomingAppointment}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item) => this._render_appointments(item)}
                  extraData={this.state}
                  refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this._onRefresh} />}
                />
              </View>
            ) : this.state.isEmpty ? (
              <View
                style={{
                  width: width,
                  height: height - 200,
                  marginRight: moderateScale(5),
                  marginLeft: moderateScale(5),
                  justifyContent: 'center',
                  alignItem: 'center',
                  alignSelf: 'center',
                }}
              >
                <Image
                  source={require('../../../assets/images/cancel.png')}
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    height: verticalScale(100),
                    width: moderateScale(100),
                  }}
                />
                <Text
                  style={{
                    color: AppColors.primaryColor,
                    fontSize: moderateScale(15),
                    textAlign: 'center',
                    fontFamily: AppStyles.fontFamilyBold,
                  }}
                >
                  {this.state.emptyText}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  width: width,
                  height: height - 200,
                  marginRight: moderateScale(5),
                  marginLeft: moderateScale(5),
                  justifyContent: 'center',
                  alignItem: 'center',
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{
                    color: AppColors.primaryColor,
                    fontSize: moderateScale(15),
                    textAlign: 'center',
                    fontFamily: AppStyles.fontFamilyBold,
                  }}
                >
                  {this.state.emptyText}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        {this.state.isRescheduling ? this.openSlots() : <View />}
        {this.state.confirmation ? this.confirmation() : <View />}
      </View>
    );
  }

  render_footer() {
    return (
      <ElevatedView elevation={10}>
        {this.state.isFooterLoading ? (
          <View
            style={{
              backgroundColor: AppColors.white,
              height: verticalScale(40),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              width: width,
            }}
            onPress={() => this.getMyAppointments()}
          >
            <TouchableHighlight
              style={{ backgroundColor: AppColors.colorPrimary, width: width }}
              onPress={() => this.getMyAppointments()}
              underlayColor="transparent"
            >
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.primaryColor,
                  fontSize: moderateScale(15),
                  alignSelf: 'center',
                  alignItems: 'center',
                }}
              >
                {strings('doctor.button.seeMore')}
              </Text>
            </TouchableHighlight>
          </View>
        ) : (
          <View />
        )}
      </ElevatedView>
    );
  }

  cancel(appointment) {
    setTimeout(() => {
      Alert.alert(strings('doctor.alertTitle.cancelAppt'), strings('doctor.alertMsg.cancelAppt'), [
        {
          text: strings('doctor.button.yes'),
          onPress: () => this.cancelAppointment(appointment),
        },
        { text: strings('doctor.button.no'), style: 'cancel' },
      ]);
    }, 500);
  }

  cancelRescheduling() {
    this.setState({ isRescheduling: false });
  }

  cancelAppointment(appointment) {
    var self = this;

    var details = {
      appointmentId: appointment._id,
      isCalenderBasedAppointment: appointment.isCalenderBasedAppointment,
    };

    SHApiConnector.cancelAppointment(details, function (err, stat) {
      try {
        if (!err && stat) {
          if (stat.status) {
            self.getMyAppointments();
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  reschedule(rescheduleData) {
    var self = this;
    self.setState({
      isLoading: true,
    });
    let rescheduleDate;
    var item = rescheduleData.item;
    let currentDate = moment();
    var selectedDate = moment(rescheduleData.item.startTime);
    var timeDifference = currentDate.diff(rescheduleData.item.startTime, 'hours');

    if (timeDifference > 0) {
      rescheduleDate = currentDate;
    } else {
      rescheduleDate = rescheduleData.item.startTime;
    }
    self.setState({
      dateToday: rescheduleDate,
    });

    var rescheduleDetails = {
      clinicId: item.clinicId._id == undefined ? self.state.clinicId : item.clinicId._id,
      doctorId: item.doctorId._id == undefined ? self.state.doctorId : item.doctorId._id,
      patientId: item.patientId._id == undefined ? self.state.patientId : item.patientId._id,
      slotsDate: rescheduleDate,
    };
    if (item._id == undefined) {
      self.setState({
        selectedAppointment: self.state.selectedAppointment,
      });
    } else {
      self.setState({
        selectedAppointment: item._id,
      });
    }
    SHApiConnector.rescheduleAppointment(rescheduleDetails, function (err, stat) {
      self.setState({ isLoading: false });
      try {
        if (stat) {
          if (
            stat.slotTimings == undefined &&
            (stat.clinicWorkingDay == 'DOCTOR_ADVANCE_BOOKING_EXCEDED' ||
              stat.clinicWorkingDay == 'DOCTOR_CONTINUESLY_CLOSED' ||
              stat.clinicWorkingDay == 'CLINIC_CONTINUESLY_CLOSED' ||
              stat.clinicWorkingDay == 'CLINIC_ADVANCE_BOOKING_EXCEDED')
          ) {
            self.setState({
              isRescheduling: true,
              isSlotAvailable: false,
              advanceBookingDays: stat.clinicAdvanceBookingLimit,
              nextAvailableDay: false,
            });
          } else if (stat.slotTimings == undefined && stat.clinicWorkingDay != undefined) {
            self.setState({
              isRescheduling: true,
              isSlotAvailable: false,
              nextAvailableDay: true,
              nextAvailableDate: stat.clinicWorkingDay,
              clinicId: item.clinicId._id == undefined ? self.state.clinicId : item.clinicId._id,
              doctorId: item.doctorId._id == undefined ? self.state.doctorId : item.doctorId._id,
              patientId: item.patientId._id == undefined ? self.state.patientId : item.patientId._id,
              advanceBookingDays: stat.clinicAdvanceBookingLimit,
            });
          } else {
            self.setState({
              slot: stat.slotTimings,
              isRescheduling: true,
              isSlotAvailable: true,
              clinicId: item.clinicId._id == undefined ? self.state.clinicId : item.clinicId._id,
              doctorId: item.doctorId._id == undefined ? self.state.doctorId : item.doctorId._id,
              patientId: item.patientId._id == undefined ? self.state.patientId : item.patientId._id,
              daySlotId: stat._id,
              advanceBookingDays: stat.clinicAdvanceBookingLimit,
            });
          }
        }
      } catch (e) {
        console.error('Error:', e);
      }
    });
  }

  updateModal = (isUploadSet, appointmentInfo) => {
    AppUtils.console(appointmentInfo);
    this.setState({
      isUploadCheck: isUploadSet,
      prescriptionAppointmentInfo: appointmentInfo,
    });
  };

  _render_appointments(item) {
    AppUtils.console('RenderAppoinment', item.item, item.index);
    let appointmentState;
    let appointmentStatus;
    let messageIcon;
    if (item.item.appointmentState === 'WAITING_CLINIC_CONFIRMATION') {
      appointmentState = 'PENDING';
      appointmentStatus = 'Awaiting Clinic Confirmation';
    } else if (item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION') {
      appointmentState = '';
      appointmentStatus = 'Awaiting Your Confirmation';
    } else if (item.item.appointmentState === 'CALENDER_CANCELLED' || item.item.appointmentState === 'CANCELLED') {
      appointmentState = 'CANCELLED';
      appointmentStatus = '';
    } else if (item.item.appointmentState === 'REJECTED' || item.item.appointmentState === 'EXPIRED' || item.item.appointmentState === 'COMPLETED') {
      appointmentState = item.item.appointmentState;
      appointmentStatus = '';
    }

    let day = item.item.days > 1 ? ' Days' : ' Day';
    let justHours = item.item.hour + ':' + item.item.minute + ':' + item.item.second;
    let withDays = item.item.days + day;
    let date = item.item.days == 0 && item.item.hour < 24 ? justHours : item.item.days == undefined || item.item.days == null ? '' : withDays;
    let isExpired = false;
    if (this.state.isRequest == true) {
      if (date == '00:00:00' || date == null || date == '00:00' || date == undefined) {
        isExpired = true;
      }
    }

    let appointmentData = item.item;

    let currentTime = moment();
    let duration = moment.duration(currentTime.diff(appointmentData.startTime));
    let dInMinutes = parseInt(Math.abs(duration.asMinutes()));
    let showJoinButtonStaging =
      !AppUtils.isProduction() &&
      item.item.appointmentState === 'STARTED' &&
      (item.item.paymentStatus === 'successful' || item.item.paymentStatus === 'WAVED_OFF');
    let showJoinButton = showJoinButtonStaging || item.item.appointmentState === 'STARTED' ? true : false;
    const { couponApplyStatus } = this.state;
    if (item.item.clinicId) {
      return (
        <View>
          {/* <Button title='check' onPress={joincall} /> */}
          {(!isExpired && this.state.isRequest) || this.state.isUpComing || this.state.isPast ? (
            <ScrollView style={{ width: width, backgroundColor: 'transparent' }}>
              <TouchableHighlight underlayColor="transparent">
                <ElevatedView style={styles.flatListMainView}>
                  <View style={styles.view1}>
                    <CachedImage
                      source={{
                        uri: AppUtils.handleNullImg(item.item.doctorId.profilePic),
                      }}
                      style={styles.doctorImage}
                    />
                    <View
                      style={{
                        flexDirection: 'column',
                        marginLeft: moderateScale(10),
                        justifyContent: 'center',
                        width: AppUtils.isLowResiPhone ? moderateScale(95) : moderateScale(100),
                      }}
                    >
                      <Text style={styles.doctorName} numberOfLines={1}>
                        {item.item.doctorId.doctorName}
                      </Text>
                      <Text style={styles.speciality} numberOfLines={1}>
                        {item.item.doctorId.department ? item.item.doctorId.department.departmentName : ''}
                      </Text>
                      <Text style={styles.clinicName} numberOfLines={2}>
                        {item.item.clinicId.clinicName}
                      </Text>
                      {item.item.callType ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            style={{ height: wp(4), width: wp(4) }}
                            resizeMode={'contain'}
                            source={
                              item.item.callType === 'VIDEO'
                                ? require('../../../assets/images/video_camera_red.png')
                                : item.item.callType === 'IN_HOUSE_CALL'
                                ? require('../../../assets/images/house_call_red.png')
                                : item.item.clinicId.countryCode == '65'
                                ? require('../../../assets/images/video_camera_red.png')
                                : require('../../../assets/images/tele_red.png')
                            }
                          />
                          <Text
                            style={[
                              styles.clinicName,
                              {
                                color: AppColors.blackColor,
                                marginLeft: wp(1),
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.item.isInstantVideo
                              ? 'INSTANT VIDEO'
                              : item.item.callType === 'IN_HOUSE_CALL'
                              ? 'HOUSE'
                              : item.item.callType == 'AUDIO'
                              ? item.item.clinicId.countryCode == '65'
                                ? 'VIDEO'
                                : item.item.callType
                              : item.item.callType}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View>
                      {item.item.appointmentState === 'CONFIRMED' && this.state.isUpComing ? (
                        <View style={[styles.queueView1, { marginTop: AppUtils.isLowResiPhone ? 2 : 0 }]}>
                          <View style={styles.queueView2}>
                            <Text style={styles.queueText1}>{item.item.isCalenderBasedAppointment ? '' : '#' + item.item.queueNumber}</Text>
                            <Text style={styles.queueText2}>{date}</Text>
                          </View>
                        </View>
                      ) : item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION' && this.state.isRequest ? (
                        <View style={[styles.queueView1, { marginTop: AppUtils.isLowResiPhone ? 2 : 0 }]}>
                          <View style={styles.queueView2}>
                            <Text style={styles.queueText1}>{item.item.queueNumber}</Text>
                            <Text style={styles.queueText2}>{date}</Text>
                          </View>
                        </View>
                      ) : item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION' && this.state.isRequest ? (
                        <View style={[styles.queueView1, { marginTop: AppUtils.isLowResiPhone ? 2 : 0 }]}>
                          <View style={styles.queueView2}>
                            <Text style={styles.endsInText}>{strings('doctor.text.endsIn')}</Text>
                            <Text style={styles.timePendingRequest}>{date}</Text>
                          </View>
                        </View>
                      ) : item.item.prescription && item.item.prescription.length > 0 ? (
                        <TouchableHighlight
                          style={{
                            height: 30,
                            width: 120,
                            marginLeft: AppUtils.isLowResiPhone ? moderateScale(50) : AppUtils.isX ? moderateScale(25) : moderateScale(50),
                            borderRadius: 15,
                            alignItems: 'center',
                          }}
                          underlayColor="transparent"
                          onPress={() =>
                            this.setState({
                              isPrescriptionView: true,
                              prescriptionAppointment: item.item,
                              prescriptionList: item.item.prescription,
                            })
                          }
                        >
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              borderRadius: 15,
                              height: 30,
                              width: 120,
                              borderWidth: 1,
                              flexDirection: 'row',
                              backgroundColor: AppColors.primaryColor,
                              borderColor: AppColors.primaryColor,
                            }}
                          >
                            <Image
                              style={{ height: 20, width: 20, marginRight: 5 }}
                              resizeMode={'contain'}
                              source={require('../../../assets/images/prescription_view.png')}
                            />
                            <Text
                              numberOfLines={1}
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyMedium,
                                fontSize: moderateScale(10),
                                color: AppColors.whiteColor,
                                marginTop: Platform.OS === 'ios' ? 4 : 0,
                              }}
                            >
                              {strings('doctor.text.doctorNotes')}
                            </Text>
                          </View>
                        </TouchableHighlight>
                      ) : (
                        <View />
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      width: '90%',
                      height: 0.5,
                      backgroundColor: AppColors.radioBorderColor,
                      marginBottom: 10,
                      alignSelf: 'center',
                    }}
                  />
                  <View style={styles.patientView}>
                    <View
                      style={{
                        flexDirection: 'column',
                        flex: 1,
                        marginLeft: moderateScale(10),
                      }}
                    >
                      <Text style={styles.patientName}>
                        {item.item.patientId.firstName} {item.item.patientId.lastName}
                      </Text>
                      <Text style={styles.patientDetail}>
                        {AppUtils.getAgeFromDateOfBirth(item.item.patientId.dateOfBirth)}
                        Yrs,{item.item.patientId.gender}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusView,
                        {
                          marginRight: this.state.isUpComing ? moderateScale(0) : moderateScale(30),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{appointmentState}</Text>
                      <Text style={[styles.appointmentTime, { marginTop: hp(0.2), marginBottom: hp(0.2) }]}>
                        {moment(item.item.startTime).format('hh:mm A')}
                      </Text>
                      <Text style={styles.appointmentDay}>{moment(item.item.startTime).format('MMM DD YYYY')}</Text>
                      {/* <View style={{ flexDirection: "row" }}>
                                                {item.item.waitingTime != null &&
                                                    item.item.appointmentState === "CONFIRMED" ? (
                                                        <View style={{ flexDirection: "row" }}>
                                                            <Text style={styles.waitingText}>
                                                                {strings('doctor.text.waitingTime')}
                                                            </Text>
                                                            <Text style={styles.appointmentDay}>
                                                                {item.item.waitingTime}
                                                            </Text>
                                                            <Text style={styles.appointmentDay}>mins.</Text>
                                                        </View>
                                                    ) : (
                                                        <View />
                                                    )}
                                            </View> */}
                    </View>

                    {!item.item.isInstantVideo && (this.state.isUpComing || this.state.isPast) && item.item.isCalenderBasedAppointment ? (
                      <TouchableOpacity
                        style={{
                          flex: 0.3,
                          flexDirection: 'row',
                          marginLeft: moderateScale(10),
                        }}
                        onPress={() => this.openUserChat(item)}
                        underlayColor="transparent"
                      >
                        <Image
                          style={{
                            height: moderateScale(20),
                            width: moderateScale(20),
                            marginLeft: 5,
                            alignSelf: 'center',
                            marginBottom: moderateScale(10),
                          }}
                          source={require('../../../assets/images/chat.png')}
                        />
                        {item.item.numOfUnreadMessages > 0 ? (
                          <View
                            style={{
                              height: moderateScale(8),
                              width: moderateScale(8),
                              marginBottom: moderateScale(20),
                              borderRadius: moderateScale(4),
                              backgroundColor: AppColors.primaryColor,
                              marginRight: moderateScale(30),
                            }}
                          />
                        ) : (
                          <View />
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View />
                    )}
                  </View>

                  {(this.state.isPast && !item.item.isCalenderBasedAppointment) ||
                  (this.state.isUpComing && item.item.appointmentState !== 'CANCELLED') ||
                  this.state.isRequest ? (
                    <View
                      style={{
                        width: '100%',
                        height: 0.5,
                        // backgroundColor: AppColors.radioBorderColor,
                        marginBottom: 10,
                      }}
                    />
                  ) : (
                    <View />
                  )}
                  {item.item.medicineEPrescription ? (
                    (item.item.medicineEPrescription.orderStatus == 'CONFIRMED' || item.item.medicineEPrescription.orderStatus == 'PAYMENT_FAILED') &&
                    !item.item.medicineEPrescription.isWavedOffTotalCharge ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          flex: 1,
                        }}
                      >
                        {item.item.medicineEPrescription.paymentStatus == 'WAVED_OFF' ? null : (
                          <View
                            style={{
                              flexDirection: 'row',
                              marginBottom: hp(1),
                            }}
                          >
                            <View>
                              <TouchableHighlight
                                onPress={() =>
                                  Actions.EPrescription({
                                    appointmentId: item.item._id,
                                  })
                                }
                                underlayColor="transparent"
                              >
                                <View
                                  style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 20,
                                    marginLeft: 30,
                                    backgroundColor: AppColors.primaryColor,
                                    alignSelf: 'center',
                                    borderRadius: 15,
                                    height: 30,
                                    width: item.item.callType ? 120 : 100,
                                    borderWidth: 1,
                                    borderColor: AppColors.primaryColor,
                                  }}
                                >
                                  <Text
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      fontFamily: AppStyles.fontFamilyRegular,
                                      textAlign: 'center',
                                      fontSize: moderateScale(10),
                                      color: AppColors.whiteColor,
                                      marginTop: Platform.OS === 'ios' ? 4 : 0,
                                    }}
                                  >
                                    {strings('doctor.button.payNow')}
                                    {/* {!item.item.medicineEPrescription.discountedPrice ? "PAY  " + item.item.medicineEPrescription.currencySymbol + (item.item.medicineEPrescription.finalMedicinePriceByDoctor).toFixed(2) : "PAY  " + item.item.medicineEPrescription.currencySymbol + (item.item.medicineEPrescription.discountedPrice).toFixed(2)} */}
                                  </Text>
                                </View>
                              </TouchableHighlight>
                              <Text
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  textAlign: 'center',
                                  fontSize: moderateScale(10),
                                  color: AppColors.blackColor,
                                  marginTop: Platform.OS === 'ios' ? 4 : 0,
                                  marginRight: wp(1),
                                }}
                              >
                                {strings('doctor.text.ePrescriptionPayment')}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    ) : null
                  ) : null}

                  {this.state.isUpComing && item.item.callType && item.item.callType != 'IN_HOUSE_CALL' ? (
                    <View
                      style={{
                        width: AppUtils.isLowResiPhone ? moderateScale(320) : moderateScale(350),
                        backgroundColor: AppColors.whiteColor,
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        borderRadius: moderateScale(20),
                        marginBottom: verticalScale(10),
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        {showJoinButton ? (
                          <TouchableHighlight
                            style={{
                              height: 30,
                              width: 80,
                              borderRadius: 15,
                              alignItems: 'center',
                              marginRight: 20,
                            }}
                            onPress={() => this.joinCall(item.item)}
                            underlayColor="transparent"
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                borderRadius: 15,
                                height: 30,
                                width: 80,
                                borderWidth: 1,
                                borderColor: AppColors.primaryColor,
                                backgroundColor: '#ff4848',
                              }}
                            >
                              <Text
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(12),
                                  color: AppColors.whiteColor,
                                  marginTop: Platform.OS === 'ios' ? 4 : 0,
                                }}
                              >
                                {strings('doctor.button.joinCall')}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        ) : null}
                        {item.item.appointmentState == 'CONFIRMED' &&
                        this.state.isUpComing &&
                        item.item.callType &&
                        !(item.item.appointmentDate === formattedCurrentDate && appointmentDateRegex.test(item.item.appointmentDate)) ? (
                          <TouchableHighlight
                            style={{
                              height: 30,
                              width: 80,
                              borderRadius: 15,
                              alignItems: 'center',
                              marginRight: 20,
                            }}
                            onPress={() => this.cancel(item.item)}
                            underlayColor="transparent"
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                borderRadius: 15,
                                height: 30,
                                width: 80,
                                borderWidth: 1,
                                borderColor: AppColors.primaryColor,
                              }}
                            >
                              <Text
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(12),
                                  color: AppColors.blackColor,
                                  marginTop: Platform.OS === 'ios' ? 4 : 0,
                                }}
                              >
                                {strings('doctor.button.capCancel')}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        ) : (
                          <View />
                        )}
                      </View>

                      {this.state.isPast && item.item.doctorId.isCalender == false ? (
                        item.item.appointmentState == 'CANCELLED' || item.item.appointmentState == 'COMPLETED' ? (
                          <TouchableHighlight
                            style={{
                              height: 30,
                              width: 120,
                              borderRadius: 15,
                              marginRight: 20,
                              alignItems: 'center',
                            }}
                            underlayColor="transparent"
                            onPress={() => this.confirmReschedule(item)}
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                borderRadius: 15,
                                height: 30,
                                width: 120,
                                borderWidth: 1,
                                borderColor: AppColors.primaryColor,
                              }}
                            >
                              <Text
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(12),
                                  color: AppColors.blackColor,
                                  marginTop: Platform.OS === 'ios' ? 4 : 0,
                                }}
                              >
                                {strings('doctor.button.capReschedule')}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        ) : (
                          <View />
                        )
                      ) : this.state.isPast && item.item.doctorId.isCalender && item.item.appointmentState === 'COMPLETED' && item.item.callType ? (
                        <TouchableHighlight
                          style={{
                            height: 30,
                            width: 120,
                            borderRadius: 15,
                            marginRight: 20,
                            alignItems: 'center',
                          }}
                          underlayColor="transparent"
                          onPress={() => this.generateInvoice(item.item)}
                        >
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              borderRadius: 15,
                              height: 30,
                              width: 120,
                              borderWidth: 1,
                              borderColor: AppColors.primaryColor,
                            }}
                          >
                            <Text
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(12),
                                color: AppColors.blackColor,
                                marginTop: Platform.OS === 'ios' ? 4 : 0,
                              }}
                            >
                              {strings(doctor.button.invoice)}
                            </Text>
                          </View>
                        </TouchableHighlight>
                      ) : (
                        <View />
                      )}
                    </View>
                  ) : (
                    <View />
                  )}

                  {this.state.isRequest ? (
                    <View>
                      <View
                        style={{
                          backgroundColor: AppColors.whiteColor,
                          flexDirection: 'row',
                          alignItems: 'center',
                          alignSelf: 'center',
                          justifyContent: 'center',
                          borderTopWidth: 0,
                          marginBottom: verticalScale(10),
                          marginTop: verticalScale(10),
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                          }}
                        >
                          <TouchableHighlight
                            style={{
                              height: 50,
                              width: 50,
                              alignItems: 'center',
                              alignSelf: 'center',
                              justifyContent: 'center',
                            }}
                            onPress={() => this.openTheDialer(item)}
                            underlayColor="transparent"
                          >
                            <Image
                              style={{
                                height: moderateScale(20),
                                width: moderateScale(20),
                                marginLeft: 10,
                                marginRight: moderateScale(10),
                                marginTop: Platform.OS == 'ios' ? moderateScale(0) : moderateScale(0),
                              }}
                              source={require('../../../assets/images/call.png')}
                            />
                          </TouchableHighlight>

                          <TouchableOpacity
                            style={{
                              height: 50,
                              width: 50,
                              alignItems: 'center',
                              alignSelf: 'center',
                              flexDirection: 'row',
                            }}
                            onPress={() => this.openUserChat(item)}
                            underlayColor="transparent"
                          >
                            <Image
                              style={{
                                height: moderateScale(20),
                                width: moderateScale(20),
                                marginLeft: 5,
                                alignSelf: 'center',
                              }}
                              source={require('../../../assets/images/chat.png')}
                            />
                            {item.item.numOfUnreadMessages > 0 ? (
                              <View
                                style={{
                                  height: moderateScale(8),
                                  width: moderateScale(8),
                                  marginBottom: moderateScale(20),
                                  borderRadius: moderateScale(4),
                                  backgroundColor: AppColors.primaryColor,
                                }}
                              />
                            ) : (
                              <View />
                            )}
                          </TouchableOpacity>
                        </View>

                        {item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION' ||
                        (item.item.appointmentState == 'CONFIRMED' && item.item.paymentStatus != 'successful') ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              flex: 1,
                            }}
                          >
                            {item.item.paymentStatus == 'WAVED_OFF' ? null : item.item.callType ? (
                              item.item.appointmentState == 'CONFIRMED' || item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION' ? (
                                <TouchableHighlight onPress={() => this.showCoupon(item.item)} underlayColor="transparent">
                                  <View
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginRight: 1,
                                      marginLeft: 1,
                                      backgroundColor: AppColors.whiteColor,
                                      alignSelf: 'center',
                                      borderRadius: 15,
                                      height: 30,
                                      width: 100,
                                      borderWidth: 1,
                                      borderColor: AppColors.primaryColor,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        fontFamily: AppStyles.fontFamilyRegular,
                                        textAlign: 'center',
                                        fontSize: moderateScale(10),
                                        color: AppColors.blackColor,
                                        marginTop: Platform.OS === 'ios' ? 4 : 0,
                                      }}
                                    >
                                      {couponApplyStatus === true && item.item.showApplyCoupon
                                        ? strings('doctor.text.couponApplied')
                                        : strings('doctor.button.applyCoupon')}
                                    </Text>
                                  </View>
                                </TouchableHighlight>
                              ) : null
                            ) : null}

                            {item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION' && !item.item.callType ? (
                              <TouchableHighlight
                                style={{
                                  height: 30,
                                  width: 80,
                                  borderRadius: 15,
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                }}
                                onPress={() => this.rejectRequestModalBefore(item, 'REJECTED')}
                                underlayColor="transparent"
                              >
                                <View
                                  style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    borderRadius: 15,
                                    height: 30,
                                    width: 80,
                                    borderWidth: 1,
                                    borderColor: AppColors.primaryColor,
                                  }}
                                >
                                  <Text
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      fontFamily: AppStyles.fontFamilyRegular,
                                      fontSize: moderateScale(12),
                                      color: AppColors.blackColor,
                                      marginTop: Platform.OS === 'ios' ? 4 : 0,
                                    }}
                                  >
                                    {strings('doctor.button.capResult')}
                                  </Text>
                                </View>
                              </TouchableHighlight>
                            ) : null}
                            <View>
                              <TouchableHighlight
                                onPress={() => this.updateAppointment(item, 'CONFIRMED', 'Patient accepted new proposed time', 'SYSTEM')}
                                underlayColor="transparent"
                              >
                                <View
                                  style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 20,
                                    marginLeft: 30,
                                    backgroundColor: AppColors.primaryColor,
                                    alignSelf: 'center',
                                    borderRadius: 15,
                                    height: 30,
                                    width: item.item.callType ? 120 : 80,
                                    borderWidth: 1,
                                    borderColor: AppColors.primaryColor,
                                  }}
                                >
                                  <Text
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      fontFamily: AppStyles.fontFamilyMedium,
                                      textAlign: 'center',
                                      fontSize: moderateScale(10),
                                      color: AppColors.whiteColor,
                                      marginTop: Platform.OS === 'ios' ? 4 : 0,
                                    }}
                                  >
                                    {item.item.paymentStatus == 'WAVED_OFF'
                                      ? 'ACCEPT'
                                      : item.item.callType
                                      ? item.item.appointmentState == 'CONFIRMED'
                                        ? 'PAY  ' +
                                          item.item.currencySymbol +
                                          (!item.item.discountedPrice ? item.item.callCharge : item.item.discountedPrice)
                                        : 'ACCEPT & PAY  ' +
                                          item.item.currencySymbol +
                                          (!item.item.discountedPrice ? item.item.callCharge : item.item.discountedPrice)
                                      : 'ACCEPT'}
                                  </Text>
                                  {item.item.clinicId.countryCode == '65' ? (
                                    <Text
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        fontFamily: AppStyles.fontFamilyRegular,
                                        textAlign: 'center',
                                        fontSize: moderateScale(8),
                                        color: AppColors.whiteColor,
                                        marginTop: Platform.OS === 'ios' ? 0 : 0,
                                      }}
                                    >
                                      {item.item.paymentStatus == 'WAVED_OFF'
                                        ? 'ACCEPT'
                                        : item.item.callType
                                        ? this.state.coupon.valueType == 'FIXED'
                                          ? '(Inclusive of GST)'
                                          : item.item.appointmentState == 'CONFIRMED'
                                          ? '(Before GST)'
                                          : '(Before GST)'
                                        : 'Doctor Timing'}
                                    </Text>
                                  ) : null}
                                </View>
                              </TouchableHighlight>
                              <Modal visible={this.state.modalVisible} transparent={true} animationType="none">
                                <View style={styles.modal}>
                                  <View style={styles.modalContainer}>
                                    <View>
                                      <Text style={styles.modalHeader}>Choose Payment Method</Text>
                                      <TouchableOpacity style={styles.closeIcon} onPress={() => this.setState({ modalVisible: false })}>
                                        <AntDesign name="closecircle" size={24} color={selectedSlotColor} />
                                      </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                      activeOpacity={0.5}
                                      onPress={() => {
                                        this.setState({
                                          modalVisible: false,
                                          isOpneVoucherModal: true,
                                        });
                                      }}
                                      style={styles.modalButton}
                                    >
                                      <View style={styles.modalView}>
                                        <Icon name="tags" size={24} color={selectedSlotColor} />
                                        <View style={styles.modalLeftColumn}>
                                          <Text style={styles.modalButtonText}>Voucher</Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      activeOpacity={0.5}
                                      onPress={() => {
                                        this.setState({ modalVisible: false });
                                        this.handlePayment(this.state.selectedAppointmentDetails);
                                      }}
                                      style={styles.modalButton}
                                    >
                                      <View style={styles.modalView}>
                                        <AntDesign name="wallet" size={26} color={selectedSlotColor} />
                                        <View style={styles.modalLeftColumn}>
                                          <Text style={styles.modalButtonText}>Card / Wallet</Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </Modal>
                              {/*  {item.item.appointmentState == 'WAITING_CLINIC_CONFIRMATION'?null:*/}
                              {/*   <Text*/}
                              {/*    style={{*/}
                              {/*        justifyContent: "center",*/}
                              {/*        alignItems: "center",*/}
                              {/*        alignSelf: "center",*/}
                              {/*        fontFamily: AppStyles.fontFamilyRegular,*/}
                              {/*        fontSize: moderateScale(12),*/}
                              {/*        color: AppColors.primaryColor,*/}
                              {/*        marginTop: Platform.OS === "ios" ? 4 : 1,*/}
                              {/*    }}*/}
                              {/*>*/}
                              {/* { item.item.currencySymbol}{item.item.callCharge}*/}
                              {/*</Text>*/}
                            </View>
                          </View>
                        ) : item.item.appointmentState == 'WAITING_CLINIC_CONFIRMATION' &&
                          !(item.item.appointmentDate === formattedCurrentDate && appointmentDateRegex.test(item.item.appointmentDate)) ? (
                          <TouchableHighlight
                            onPress={() => this.updateAppointment(item, 'CALENDER_CANCELLED', 'Patient cancelled appointment request', 'SYSTEM')}
                            underlayColor="transparent"
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                marginRight: 30,
                                marginLeft: 10,
                                backgroundColor: AppColors.primaryColor,
                                borderRadius: 15,
                                height: 30,
                                width: 80,
                                borderWidth: 1,
                                borderColor: AppColors.primaryColor,
                              }}
                            >
                              <Text
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  fontFamily: AppStyles.fontFamilyRegular,
                                  fontSize: moderateScale(12),
                                  color: AppColors.whiteColor,
                                  marginTop: Platform.OS === 'ios' ? 4 : 0,
                                }}
                              >
                                {strings('doctor.button.capCancel')}
                                {/* needs to put condition for today's call */}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        ) : (
                          <View />
                        )}
                      </View>

                      {item.item.appointmentState == 'WAITING_PATIENT_CONFIRMATION' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            marginBottom: 10,
                            marginLeft: 10,
                          }}
                        >
                          <Image
                            style={{
                              height: moderateScale(30),
                              width: moderateScale(30),
                              marginRight: moderateScale(10),
                            }}
                            source={require('../../../assets/images/information.png')}
                          />
                          <Text style={{ color: AppColors.textGray }}>{appointmentStatus}</Text>
                        </View>
                      ) : (
                        <View />
                      )}
                    </View>
                  ) : (
                    <View />
                  )}
                  {this.state.subscriptionCount > 0 ? (
                    this.state.isRequest == true &&
                    (item.item.callType == 'AUDIO' || item.item.callType == 'VIDEO') &&
                    (item.item.appointmentState == 'CONFIRMED' || item.item.appointmentState === 'WAITING_PATIENT_CONFIRMATION') ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          flex: 1,
                          marginRight: 20,
                          marginBottom: verticalScale(10),
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert('', strings('common.common.sureAvailSubscription'), [
                              { text: strings('doctor.button.capNo') },
                              { text: strings('doctor.button.capYes'), onPress: () => this.availSubscription(appointmentData._id) },
                            ]);
                          }}
                          underlayColor="transparent"
                        >
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 1,
                              marginLeft: 1,
                              backgroundColor: AppColors.whiteColor,
                              alignSelf: 'center',
                              borderRadius: 15,
                              height: 30,
                              borderWidth: 1,
                              borderColor: AppColors.primaryColor,
                            }}
                          >
                            <Text
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                fontSize: AppStyles.fontFamilyMedium,
                                textAlign: 'center',
                                fontSize: moderateScale(10),
                                paddingHorizontal: 80,
                                color: AppColors.blackColor,
                                marginTop: Platform.OS === 'ios' ? 4 : 0,
                              }}
                            >
                              Avail Subscription
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View></View>
                    )
                  ) : (
                    <View></View>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      this.clearTimer();
                      console.log('AppointmentData1', item.item._id);
                      Actions.appointmentDetails({
                        appointmentId: item.item._id,
                        isUpComing: this.state.isUpComing,
                        isRequest: this.state.isRequest,
                        isPast: this.state.isPast,
                      });
                    }}
                    style={{
                      height: hp(5),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderBottomLeftRadius: moderateScale(10),
                      borderBottomRightRadius: moderateScale(10),
                      width: AppUtils.isIphone ? AppUtils.screenWidth - 16 : moderateScale(350),
                      alignSelf: 'center',
                      backgroundColor: AppColors.colorHeadings,
                    }}
                  >
                    <Text
                      style={{
                        color: AppColors.whiteColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                      }}
                    >
                      {strings('doctor.text.checkDetails')}
                    </Text>
                  </TouchableOpacity>
                </ElevatedView>
              </TouchableHighlight>
            </ScrollView>
          ) : (
            <View />
          )}
        </View>
      );
    } else {
      return null;
    }
  }

  showCoupon(item) {
    AppUtils.console('CouponData:', item);

    this.setState({ isCouponModal: true, couponItem: item });
  }

  async joinCall(passedData) {
    const data = {
      meetingId: passedData.zoomCall.meetingId,
      role: 0,
    };

    const zoomSign = await SHApiConnector.getZoomSignature(data);
    await ZoomUs.initialize({
      clientKey: config.zoom.CLIENT_ID,
      clientSecret: config.zoom.CLIENT_SECRET,
      jwtToken: zoomSign.data.signature,
      domain: config.zoom.DOMAIN,
      disableShowVideoPreviewWhenJoinMeeting: false,
    }).catch((error) => {
      console.log(error, 'error');
    });

    if (passedData.zoomCall.meetingId) {
      try {
        this.setState({ isLoading: true });
        let meetingStatus = await this.getMeetingStatus(passedData.zoomCall.meetingId);
        console.log(meetingStatus?.status, 'meetingstatus');
        if (
          meetingStatus.code &&
          (meetingStatus.code === 3001 || meetingStatus.code === 1001 || meetingStatus.code === 3000 || meetingStatus.code === 1001)
        ) {
          this.setState({ isLoading: false });
          setTimeout(() => {
            Alert.alert(strings('doctor.alertTitle.consultationCompleted'), strings('doctor.alertMsg.consultationCompleted'));
          }, 1000);
        } else {
          if (meetingStatus.status === 'waiting') {
            this.setState({ isLoading: false });
            setTimeout(() => {
              Alert.alert('', strings('doctor.alertMsg.consultaionNotStarted'));
            }, 1000);
          } else {
          
            this.setState({ isLoading: true });

           

            await ZoomUs.joinMeeting({
              meetingNumber: passedData.zoomCall.meetingId,
              userName: passedData.patientId.firstName + ' ' + passedData.patientId.lastName,
              autoConnectAudio: true,
              password: passedData.zoomCall.password,
              noMeetingErrorMessage: true,
              // noVideo: false,
            })
              .then(async (result) => {
                this.setState({ isLoading: false });
                await ZoomUs.muteMyVideo(false).catch((error) => {
                  console.log(error, 'error in mute');
                });
              })
              .catch((err) => {
                console.warn(err);
                console.log('err1', err);
                this.setState({ isLoading: false });
                Alert.alert('error!', err.message);
              });
          }
        }
      } catch (error) {
        this.setState({ isLoading: false });
        AppUtils.console('Error:', error);
      }
    }
  }

  async getMeetingStatus(meetingId) {
    this.setState({ isLoading: true });
    let zoomOAuth = await SHApiConnector.getZoomAccessToken(config.zoom.ACCOUNT_ID);
    this.setState({ isLoading: false });

    let url = `https://api.zoom.us/v2/meetings/${meetingId}`;

    return await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${zoomOAuth.data.access_token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async availSubscription(appointmentId) {
    this.setState({ isLoading: true, isProgressLoader: true });
    let body = { appointmentId: appointmentId };
    let response = await SHApiConnector.availUserSubscription(this.state.featureId, body);
    if (response.data.status == 'success') {
      Alert.alert(strings('doctor.alertTitle.paySuccess'), strings('doctor.alertMsg.paySuccess'), [
        {
          text: strings('doctor.button.ok'),
          onPress: () => this.upcoming(),
        },
      ]);
    } else {
      Alert.alert('Something went wrong !', response.data.message);
    }
    this.setState({ isLoading: false, isProgressLoader: false });
  }

  rejectRequestModalBefore(item, status) {
    var self = this;
    self.setState({
      cancelReqData: item,
      cancelReqState: status,
      isCancelReqModal: true,
    });
  }

  async generateInvoice(appointmentData) {
    let self = this;
    self.setState({ isLoading: true });
    let userData = await AppUtils.retrieveLocal(AppStrings.contracts.LOGGED_IN_USER_DETAILS);

    let parsedJSON = JSON.parse(userData);
    AppUtils.console('User Data:', parsedJSON);
    let requestBody = {
      appointmentId: appointmentData._id,
      email: parsedJSON.email,
    };
    AppUtils.console('User Data:', requestBody);

    AppUtils.console('Request Body:', requestBody);
    try {
      let sResp = await SHApiConnector.generateInvoice(requestBody);
      self.setState({ isLoading: false });
      AppUtils.console('Server Response:', sResp);
      if (sResp !== null && sResp.data.status) {
        setTimeout(() => {
          Alert.alert('', strings('doctor.alertMsg.invoiceSend', { email: parsedJSON.email }));
        }, 100);
      }
    } catch (error) {
      self.setState({ isLoading: false });
      AppUtils.console('Error:', error);
    }
  }

  prescriptionFullView() {
    return (
      <Modal visible={this.state.isPrescriptionFullView} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPress()}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.blackColor,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              marginTop: AppUtils.isX ? hp(5) : 0,
              width: wp(100),
              height: hp(10),
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              style={{ marginLeft: wp(5) }}
              onPress={() =>
                this.setState({
                  isPrescriptionFullView: false,
                  selectedImageIndex: 0,
                  isPrescriptionView: true,
                })
              }
            >
              <Image
                source={require('../../../assets/images/blackClose.png')}
                style={{
                  tintColor: AppColors.whiteColor,
                  height: verticalScale(25),
                  width: verticalScale(25),
                }}
              ></Image>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: wp(0) }} onPress={() => this.downloadPrescription()}>
              <Image
                source={require('../../../assets/images/downloadIcon.png')}
                style={{
                  // tintColor: AppColors.whiteColor,
                  height: verticalScale(25),
                  width: verticalScale(25),
                }}
              ></Image>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'android' ? (
            this.prescriptionFullViewList(this.state.prescriptionList[this.state.selectedImageIndex])
          ) : (
            <IndicatorViewPager
              style={{ height: AppUtils.isX ? hp(85) : hp(90), width: wp(100) }}
              initialPage={this.state.selectedImageIndex}
              indicator={this._renderDotIndicator()}
            >
              {this.state.prescriptionList.map((prescription, index) => this.prescriptionFullViewList(prescription))}
            </IndicatorViewPager>
          )}
        </View>
      </Modal>
    );
  }

  async downloadPrescription() {
    let dirs = ReactNativeBlobUtil.fs.dirs;
    let PictureDir = Platform.OS === 'ios' ? dirs.LibraryDir : dirs.PictureDir;
    let date = new Date();
    let prescription = this.state.prescriptionList[this.state.selectedImageIndex];
    let path = PictureDir + '/me_' + Math.floor(date.getTime() + date.getSeconds() / 2) + '.' + prescription.fileType;
    if (Platform.OS === 'android') {
      const checkWritePermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (checkWritePermission !== PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: strings('doctor.alertTitle.galPermission'),
            message: strings('doctor.alertMsg.galPermission', {
              name: 'images',
            }),
          });
        } catch (e) {
          AppUtils.console('Error:', e);
        }
      }
    }
    ReactNativeBlobUtil.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: false,
        description: 'Downloading prescription.',
        mime: prescription.fileType.toLowerCase() == 'pdf' ? 'pdf' : 'image/jpg',
        path: path,
      },
      path: path,
    })
      .fetch('GET', prescription.file)
      .then(async (res) => {
        Alert.alert('', strings('doctor.alertMsg.prescriptionSaved'), [
          { text: strings('doctor.button.cancel'), style: 'cancel' },
          {
            text: strings('doctor.button.open'),
            onPress: () => {
              this.setState({ isPrescriptionFullView: false, isPrescriptionView: false }, () => {
                setTimeout(() => {
                  Platform.OS === 'ios'
                    ? ReactNativeBlobUtil.ios.previewDocument(res.path())
                    : ReactNativeBlobUtil.android.actionViewIntent(
                        path,
                        prescription.fileType.toLowerCase() == 'pdf' ? 'application/pdf' : 'image/jpg'
                      );
                }, 500);
              });
            },
          },
        ]);
      })
      .catch((err) => AppUtils.console('skcjsk', err));
  }

  _renderDotIndicator() {
    return (
      <PagerDotIndicator
        selectedDotStyle={{
          backgroundColor: 'transparent',
          width: verticalScale(20),
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          alignSelf: 'flex-start',
        }}
        onPageSelected={(pageNumber) => this.setState({ selectedImageIndex: pageNumber.position })}
        dotStyle={{ backgroundColor: 'transparent' }}
        pageCount={this.state.prescriptionList.length}
        titles={strings('doctor.button.next')}
      />
    );
  }

  prescriptionFullViewList(item) {
    return (
      <View style={{ flex: 1 }}>
        {item.fileType.toLowerCase() === 'pdf' ? (
          <Pdf
            source={{
              uri: Platform.OS === 'android' ? this.state.selectedPdfUrl : item.file,
              cache: true,
            }}
            onLoadComplete={(numberOfPages, filePath) => {
              AppUtils.console(`number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              AppUtils.console(`current page: ${page}`);
            }}
            onError={(error) => {
              AppUtils.console('error');
            }}
            style={{ height: hp(80), width: wp(100) }}
          />
        ) : (
          <Image source={{ uri: AppUtils.handleNullImg(item.file) }} style={{ height: hp(80), width: wp(100) }} />
        )}
      </View>
    );
  }

  prescriptionViewModal() {
    let clinicNumber = null;
    if (this.state.prescriptionAppointment && this.state.prescriptionAppointment.clinicId) {
      clinicNumber = '+' + this.state.prescriptionAppointment.clinicId.countryCode + this.state.prescriptionAppointment.clinicId.phoneNumber;
    }
    return (
      <Modal visible={this.state.isPrescriptionView} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPress()}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
        >
          <View
            style={[
              styles.modalContainerRes,
              {
                height: hp(this.state.countryCode === '65' ? 60 : 52),
                borderRadius: hp(2),
              },
            ]}
          >
            <View style={{ margin: moderateScale(25), marginTop: 0 }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: wp(90),
                  height: hp(8),
                  alignItems: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    flex: 8,
                    fontSize: hp(2.5),
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                  }}
                >
                  {strings('doctor.text.doctorNotes')}
                </Text>

                <TouchableOpacity
                  style={{
                    flex: 3,
                    marginTop: hp(1.5),
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => this.onBackPressPayment()}
                >
                  <Image
                    source={require('../../../assets/images/blackClose.png')}
                    style={{
                      height: verticalScale(25),
                      width: verticalScale(25),
                    }}
                  ></Image>
                </TouchableOpacity>
              </View>
              <FlatList
                style={{ height: hp(35) }}
                data={this.state.prescriptionList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this.prescriptionList(item)}
              />

              {
                //this.state.countryCode === '65' ?
                //     <View style={{
                //         alignItem: 'center',
                //         marginTop: hp(1.5),
                //         alignSelf: 'center',
                //         justifyContent: 'center',
                //         flexDirection: 'column'
                //     }}>
                //         <Text
                //             style={{ fontFamily: AppStyles.fontFamilyRegular, color: AppColors.blackColor }}>Would you like to deliver medicine at your doorstep with cost of $10 delivery.</Text>
                //         <View style={{ flexDirection: 'row', marginTop: hp(1.5) }}>
                //             <TouchableOpacity style={{ flex: 1 }}
                //                 onPress={() => this.sendPrescriptionDeliveryMail()}>
                //                 <Text style={{
                //                     height: hp(4), width: wp(20), textAlign: 'center',
                //                     alignItems: 'center',
                //                     fontFamily: AppStyles.fontFamilyRegular,
                //                     color: AppColors.blackColor,
                //                     fontSize: wp(3),
                //                     paddingTop: hp(.8),
                //                     borderRadius: hp(2), borderWidth: wp(.5),
                //                     borderColor: AppColors.primaryColor
                //                 }}>{strings('doctor.button.cancel')}</Text>
                //             </TouchableOpacity>
                //             <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onBackPressPayment()}>
                //                 <Text style={{
                //                     height: hp(4), width: wp(20), textAlign: 'center',
                //                     alignItems: 'center',
                //                     textAlignVertical: 'center',
                //                     fontFamily: AppStyles.fontFamilyRegular,
                //                     backgroundColor: AppColors.primaryColor,
                //                     overflow: 'hidden',
                //                     color: AppColors.whiteColor,
                //                     fontSize: wp(3),
                //                     paddingTop: hp(.8),
                //                     borderRadius: hp(2),
                //                     borderWidth: wp(.5),
                //                     borderColor: AppColors.primaryColor
                //                 }}>{strings('doctor.button.no')}</Text>
                //             </TouchableOpacity>
                //         </View>
                //     </View> : <View />
                //
              }
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  async sendPrescriptionDeliveryMail() {
    AppUtils.console('dxcszsdsezdwesz', this.state.prescriptionAppointment);
    try {
      let response = await SHApiConnector.sendPrescriptionDeliveryMail(this.state.prescriptionAppointment._id);
      this.onBackPressPayment();
      setTimeout(() => {
        if (response.data.status) {
          Alert.alert('', strings('doctor.alertMsg.deliveryAlert'));
        } else {
          Alert.alert('', response.data.error_message);
        }
      }, 500);
    } catch (e) {}
  }

  onBackPressPayment() {
    this.setState({
      isPrescriptionView: false,
    });
  }

  prescriptionList(item) {
    AppUtils.console('sdvfxvsfdc324sdf', item);
    let image =
      item.item.fileType.toLowerCase() === 'pdf' ? require('../../../assets/images/pdf.png') : { uri: AppUtils.handleNullImg(item.item.file) };
    return (
      <View
        style={{
          padding: hp(1),
          borderBottomWidth: 1,
          borderColor: AppColors.backgroundGray,
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (item.item.fileType.toLowerCase() == 'pdf') {
              ReactNativeBlobUtil.config({ fileCache: true })
                .fetch('GET', item.item.file)
                .then((res) => {
                  console.log(res);
                  this.setState(
                    {
                      isPrescriptionView: false,
                      selectedImageIndex: item.index,
                    },
                    () =>
                      this.setState({
                        isPrescriptionFullView: true,
                        selectedPdfUrl: AppUtils.isIphone ? res.data : 'file:///' + res.data,
                      })
                  );
                })
                .catch((err) => {
                  this.setState({ isLoading: false });
                  AppUtils.consoleLog('Blob catch', err);
                });
            } else
              this.setState({ isPrescriptionView: false, selectedImageIndex: item.index }, () => this.setState({ isPrescriptionFullView: true }));
          }}
        >
          <Image resizeMode={'stretch'} source={image} style={{ height: hp(8), width: hp(8) }} />
        </TouchableOpacity>
        <View style={[styles.prescriptionNameView, { height: hp(8), alignItems: 'center', marginLeft: wp(5) }]}>
          <View style={styles.prescriptionName}>
            <Text allowFontScaling={false} style={[styles.text, { color: AppColors.textGray }]} numberOfLines={1}>
              Note {item.index + 1}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  couponModal() {
    AppUtils.console('CouponLog', this.state.couponItem);
    return (
      <Modal visible={this.state.isCouponModal} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPress()}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: hp(10),
            width: AppUtils.screenWidth,
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              height: verticalScale(200),
              width: width - moderateScale(50),
              backgroundColor: AppColors.whiteColor,
              margin: moderateScale(50),
              marginTop: moderateScale(100),
              alignSelf: 'center',
              elevation: 5,
              borderRadius: 10,
            }}
          >
            <View style={{ margin: moderateScale(15) }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  numberOfLines={2}
                  style={[
                    caregiverBookingRequestStyle.modalListContentViewTxt,
                    {
                      alignSelf: 'flex-start',
                      paddingLeft: hp(3),
                      width: wp(70),
                    },
                  ]}
                >
                  {strings('string.label.apply_coupon')}
                </Text>
                <TouchableOpacity onPress={() => this.onBackPress()}>
                  <Image
                    source={require('../../../assets/images/close_icon.png')}
                    style={{
                      height: verticalScale(20),
                      width: verticalScale(20),
                      borderRadius: verticalScale(10),
                      backgroundColor: AppColors.whiteColor,
                      alignSelf: 'flex-end',
                      //marginTop: verticalScale(20),
                      marginBottom: verticalScale(20),
                      tintColor: AppColors.blackColor,
                    }}
                  ></Image>
                </TouchableOpacity>
              </View>
              {!this.state.couponItem.showApplyCoupon ? (
                <View
                  style={{
                    flexDirection: 'row',
                    margin: hp(2),
                    paddingLeft: hp(0.2),
                    paddingTop: hp(1),
                  }}
                >
                  <Image
                    style={{
                      height: hp(4),
                      width: hp(4),
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                      marginRight: hp(2),
                      marginLeft: hp(1),
                    }}
                    source={images.discount}
                  />

                  <View
                    style={{
                      height: hp(4),
                      borderWidth: hp(0.2),
                      borderColor: AppColors.backgroundGray,
                      borderRadius: wp(2),
                      width: wp(52),
                      justifyContent: 'center',
                      backgroundColor: AppColors.whiteShadeColor,
                    }}
                  >
                    <TextInput
                      allowFontScaling={false}
                      placeholder={strings('doctor.text.enterCouponCode')}
                      placeholderTextColor={AppColors.textGray}
                      onChangeText={(text) => this.setState({ coupon: text })}
                      style={{
                        height: hp('5'),
                        fontSize: hp(1.8),
                        color: AppColors.textGray,
                        padding: hp('1'),
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    margin: hp(2),
                    paddingLeft: hp(0.2),
                    paddingTop: hp(1),
                  }}
                >
                  <Image
                    style={{
                      height: hp(4),
                      width: hp(4),
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                      marginRight: hp(1),
                      marginLeft: hp(1),
                    }}
                    source={images.discount}
                  />

                  <View
                    style={{
                      height: hp(4),
                      width: wp(52),
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      numberOfLines={2}
                      style={[
                        caregiverBookingRequestStyle.modalListContentViewTxt,
                        {
                          alignSelf: 'flex-start',
                          //paddingLeft: hp(3),
                          width: '100%',
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {strings('doctor.text.couponApplied')}
                    </Text>
                    <Text style={{ fontFamily: AppStyles.fontFamilyBold, textAlign: 'center', width: '100%' }}>
                      {this.state.couponItem.couponCode}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            {!this.state.couponItem.showApplyCoupon ? (
              <TouchableOpacity
                onPress={() => this.applyCoupon(this.state.coupon)}
                style={{
                  height: hp(4),
                  marginLeft: wp(3),
                  borderRadius: wp(2),
                  width: wp(20),
                  justifyContent: 'center',
                  alignSelf: 'center',
                  backgroundColor: AppColors.primaryColor,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: hp(1.8),
                    color: AppColors.whiteColor,
                  }}
                >
                  {strings('doctor.button.apply')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => this.removeCoupon(this.state.coupon)}
                style={{
                  height: hp(4),
                  marginLeft: wp(3),
                  borderRadius: wp(2),
                  width: wp(20),
                  justifyContent: 'center',
                  alignSelf: 'center',
                  backgroundColor: AppColors.primaryColor,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: hp(1.8),
                    color: AppColors.whiteColor,
                  }}
                >
                  {strings('doctor.button.remove')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  }
  async getAddress() {
    try {
      let addressData = await SHApiConnector.getAddress();
      AppUtils.console('Sdzfcszd', addressData);
      if (addressData.data.status) {
        this.setState({ addressList: addressData.data.response }, () => this.getSelectedAddress(addressData.data.response));
      }
    } catch (e) {
      AppUtils.console('zdcszdcsx', e);
    }
  }

  getSelectedAddress(addressList) {
    AppUtils.console('Address', addressList);
    let selectedAddress = addressList.length > 0 ? addressList[0] : {};
    let isDefaultAddressAvail = false;
    addressList.map((address) => {
      AppUtils.console('zxcsdzxfscx', address);
      if (address.isDefaultAddress) {
        selectedAddress = address;
        isDefaultAddressAvail = true;
      }
    });
    if (!isDefaultAddressAvail && addressList.length > 0) {
      addressList[0].isDefaultAddress = true;
    }
    this.setState({
      selectedAddress: selectedAddress,
      addressList: addressList,
    });
  }

  async payNow() {
    console.log('payupayment');
    try {
      this.setState({ isLoading: true, isProgressLoader: true });
      AppUtils.console('appointmentDataPres', this.state.upcomingAppointment[0].medicineEPrescription);

      let data = {
        ePrescriptionId: this.state.upcomingAppointment[0].medicineEPrescription._id,
        referralCode: this.state.isCouponApplied ? this.state.couponText : null,
        addressId: this.state.selectedAddress._id,
      };

      let response = await SHApiConnector.medicinePayment(data);
      this.setState({ isLoading: false, isProgressLoader: false }, () => {
        setTimeout(() => {
          console.log(response.data.status, 'response.data.status');
          if (response.data.status) {
            if (response.data.response.isPayByPayU) {
              let payUData = response.data.response.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

              Actions.PayUPayment({
                paymentDetails: payUData,
                module: AppStrings.key.ePrescription,
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: AppStrings.key.ePrescription,
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.medicine,
              });
            } else {
              Actions.OnlinePayment({
                paymentData: response.data.response.payment,
                module: AppStrings.key.ePrescription,
              });
            }
          } else {
            Alert.alert('', response.data.error_message);
          }
        }, 500);
      });
    } catch (e) {
      console.error('MEDICINE_PAY', e);
      this.setState({ isLoading: false, isProgressLoader: false });
    } finally {
      this.setState({ isLoading: false, isProgressLoader: false });
    }
  }

  async applyCoupon(coupons) {
    let self = this;
    if (!this.state.coupon) {
      Toast.show(strings('doctor.text.pleaseEnterCouponCode'));
    } else {
      this.setState({ isLoading: true });
      let coupenDetails = {
        referralCode: coupons,
        module: AppStrings.label.DOCTOR_BOOKING,
        clinicCountryCode: this.state.couponItem && this.state.couponItem.clinicId && this.state.couponItem.clinicId.countryCode, //
      };

      try {
        AppUtils.console('paymentDoctor coupon->', coupenDetails);
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        AppUtils.console('paymentDoctor DiscountCoupon', response.data.status, 'data', response.data);
        this.setState({ isLoading: false });
        let appoinmentData = this.state.upcomingAppointment;
        let discount = 0;
        let total = 0;
        let isPaymentNegative = false;
        let waveOffStatus = false;
        let waveOffItem = [];
        if (response.data.status === 'success') {
          // coupon verify response
          const { coupon } = response.data.data ? response.data.data : '';
          this.setState({
            coupon: coupon,
          });
          console.log('coupon flat value', coupon.couponValue);
          appoinmentData.map((item) => {
            if (item._id == this.state.couponItem._id) {
              // check wafe off
              if (coupon.valueType === 'PERCENT' && coupon.couponValue === 100 && item.callCharge) {
                offerVal = discount + item.callCharge;
                waveOffStatus = true;
                waveOffItem = item;
                return false;
              }
              // applicable for flat coupons
              else if (coupon.valueType === 'FIXED') {
                if (item.callCharge < coupon.couponValue || item?.medicineEPrescription?.finalMedicinePriceByDoctor < coupon.couponValue) {
                  setTimeout(() => {
                    Toast.show('Sorry! Coupon value exceeds');
                  }, 100);
                  return false;
                }
                if (!item.medicineEPrescription) {
                  item.callCharge = coupon.couponValue;
                } else {
                  item.medicineEPrescription.finalMedicinePriceByDoctor = coupon.couponValue;
                }
              }
              // check normal percentage
              else if (coupon.valueType === 'PERCENT') {
                let offerVal;
                if (!item.medicineEPrescription) {
                  offerVal = (coupon.couponValue * item.callCharge) / 100;
                } else {
                  offerVal = (coupon.couponValue * item.medicineEPrescription.finalMedicinePriceByDoctor) / 100;
                }
                discount = discount + offerVal;
              } else {
                discount = discount + coupon.couponValue;
              }

              if (!item.medicineEPrescription) {
                total = item.callCharge;
                let discountPrice = total - discount;
                item.discountedPrice = discountPrice <= 0 && coupon.valueType != 'PERCENT' ? total : discountPrice;
                item.showApplyCoupon = discountPrice <= 0 && coupon.valueType != 'PERCENT' ? false : true;
                isPaymentNegative = discountPrice <= 0 && coupon.valueType != 'PERCENT' ? true : false;
                item.couponCode = discountPrice <= 0 && coupon.valueType != 'PERCENT' ? '' : coupons;
                this.setState({
                  isCouponModal: false,
                  showApplyCoupon: false,
                  couponItem: '',
                  couponApplyStatus: true,
                });
                setTimeout(() => {
                  Toast.show('Coupon applied successfully');
                }, 100);
              } else {
                total = item.medicineEPrescription.finalMedicinePriceByDoctor;
                item.medicineEPrescription.discountedPrice = total - discount;
                item.showApplyCoupon = true;
                item.couponCode = coupons;
                this.setState({
                  isCouponModal: false,
                  showApplyCoupon: false,
                  couponItem: '',
                  couponApplyStatus: true,
                });
                setTimeout(() => {
                  Toast.show('Coupon applied successfully');
                }, 100);
              }
            }
          });

          //check waveOff status
          if (waveOffStatus) {
            const postData = {
              productInfo: 'doctorBooking', //need to change
              couponCode: coupons,
              appointmentId: waveOffItem._id,
              couponId: coupon._id,
              couponValue: coupon.couponValue,
            };
            let response = await SHApiConnector.useCoupon(postData);
            this.setState({
              isCouponModal: false,
              showApplyCoupon: false,
              couponItem: '',
              couponApplyStatus: true,
            });
            if (response && response.status === 200) {
              setTimeout(() => {
                Toast.show('Coupon applied successfully');
              }, 100);
              this.upcoming();
            } else {
              setTimeout(() => {
                Toast.show('Oops, something went wrong');
              }, 100);
            }
          }

          if (isPaymentNegative) {
            setTimeout(() => {
              Toast.show('Coupon pricing is more then consultation price.');
            }, 100);

            this.setState({
              isCouponModal: false,
              showApplyCoupon: false,
              couponItem: '',
            });
            return;
          } else {
            this.setState(
              {
                upcomingAppointment: appoinmentData,
                isCouponModal: false,
                showApplyCoupon: false,
                couponValue: response.data.response.couponValue,
                couponValueType: response.data.response.valueType,
              },
              async () => {
                let hundredPercentCouponApplied =
                  this.state.couponValue && this.state.couponValueType && this.state.couponValue === 100 && this.state.couponValueType === 'PERCENT';
                if (hundredPercentCouponApplied) {
                  let item = {
                    item: this.state.couponItem,
                  };

                  //this.setState({isProgressLoader:true})
                  this.updateAppointment(item, 'CONFIRMED', 'Patient accepted new proposed time', 'SYSTEM');
                  //this.setState({isProgressLoader:false})
                } else {
                  setTimeout(() => {
                    Toast.show(strings('doctor.text.couponAppliedSuccess'));
                  }, 500);
                }
              }
            );
          }
        } else {
          const { error, message } = response.data;
          appoinmentData.map((item) => {
            if (item._id == this.state.couponItem._id) {
              AppUtils.console('couponItem', item);
              if (!item.medicineEPrescription) {
                total = item.callCharge;
                item.discountedPrice = item.callCharge;
                item.showApplyCoupon = false;
                item.couponCode = null;
              } else {
                total = item.medicineEPrescription.finalMedicinePriceByDoctor;
                item.medicineEPrescription.discountedPrice = item.medicineEPrescription.finalMedicinePriceByDoctor;
                item.showApplyCoupon = false;
                item.couponCode = null;
              }
            }
          });

          self.setState(
            {
              upcomingAppointment: appoinmentData,
              isCouponModal: false,
            },
            () => {
              setTimeout(() => {
                Toast.show(message);
              }, 500);
            }
          );
        }
        AppUtils.console('MedicalE', self.state.upcomingAppointment);

        AppUtils.console('sdfzvbdsfv', response);
      } catch (e) {
        AppUtils.console('VERIFY_OFFER_ERROR', e);
      }
    }
  }
  removeCoupon(coupon) {
    let appoinmentData = this.state.upcomingAppointment;
    this.setState({
      couponApplyStatus: false,
    });
    appoinmentData.map((item) => {
      if (item._id == this.state.couponItem._id) {
        AppUtils.console('couponItem', item);
        if (!item.medicineEPrescription) {
          item.discountedPrice = item.callCharge;
          item.showApplyCoupon = false;
          item.couponCode = null;
        } else {
          item.medicineEPrescription.discountedPrice = item.medicineEPrescription.finalMedicinePriceByDoctor;
          item.showApplyCoupon = false;
          item.couponCode = null;
        }
      }
    });

    this.setState({
      upcomingAppointment: appoinmentData,
      isCouponModal: false,
      couponValue: undefined,
      couponValueType: undefined,
    });
  }

  rejectRequestModal() {
    return (
      <Modal visible={this.state.isCancelReqModal} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPress()}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
        >
          <View style={styles.modalContainerRes}>
            <View style={{ margin: moderateScale(25) }}>
              <View>
                <TouchableOpacity onPress={() => this.onBackPress()}>
                  <Image
                    source={require('../../../assets/images/close_icon.png')}
                    style={{
                      height: verticalScale(20),
                      width: verticalScale(20),
                      borderRadius: verticalScale(10),
                      backgroundColor: AppColors.whiteColor,
                      alignSelf: 'flex-end',
                      //marginTop: verticalScale(20),
                      marginBottom: verticalScale(20),
                      tintColor: AppColors.blackColor,
                    }}
                  ></Image>
                </TouchableOpacity>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: moderateScale(13),
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.textGray,
                    marginBottom: moderateScale(5),
                  }}
                  numberOfLines={3}
                >
                  {strings('doctor.text.rejectMsg')}
                </Text>
              </View>
              <View
                style={{
                  height: verticalScale(100),
                  width: moderateScale(250),
                  borderRadius: moderateScale(5),
                  borderWidth: moderateScale(1),
                  borderColor: AppColors.lightGray,
                  marginTop: moderateScale(10),
                  marginLeft: moderateScale(10),
                }}
              >
                <TextInput
                  allowFontScaling={false}
                  style={[
                    {
                      fontSize: moderateScale(12),
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.black,
                    },
                  ]}
                  onChangeText={(text) => this.setState({ message: text })}
                  value={this.state.message}
                  placeholder={strings('doctor.text.typeMsg')}
                  placeholderTextColor={AppColors.textGray}
                  selectionColor={AppColors.primaryColor}
                  underlineColorAndroid="transparent"
                  maxLength={1000}
                  multiline={true}
                  returnKeyType={'done'}
                  clearButtonMode="while-editing"
                  onSubmitEditing={Keyboard.dismiss}
                  onFocus={() => this.setState({ borderColor: AppColors.primaryColor })}
                  ref={(text) => {
                    this.message = text;
                  }}
                />
              </View>
            </View>
            <View style={styles.lastContainerDep}>
              <TouchableOpacity onPress={() => this.rejectTheRequest()}>
                <View style={styles.buttonContainerDep}>
                  <Text allowFontScaling={false} style={styles.buttonTextBgDep}>
                    {strings('doctor.button.capSend')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  onBackPress() {
    this.setState({
      isCancelReqModal: false,
      isCouponModal: false,
      isPrescriptionView: false,
      isPrescriptionFullView: false,
    });
  }

  rejectTheRequest() {
    let self = this;
    let item = self.state.cancelReqData;
    let status = self.state.cancelReqState;
    let message = self.state.message;
    self.updateAppointment(item, status, message, 'PATIENT');
  }

  async updateAppointment(item, status, message, sender) {
    var self = this;

    if (item.item.callType && status !== 'REJECTED' && status !== 'CALENDER_CANCELLED' && item.item.paymentStatus !== 'WAVED_OFF') {
      if (item.item.clinicId.countryCode == '62') {
        this.setState({
          modalVisible: true,
          selectedAppointmentDetails: item.item,
        });
      } else {
        self.handlePayment(item.item);
      }
    } else {
      AppUtils.console('UpdateAppoinment');
      let data = {
        appointmentState: status,
        appointmentId: item.item._id,
        userId: item.item.userId._id,
        sender: sender,
        receiver: 'CLINIC',
        message: message,
      };
      self.setState({ isLoading: true, isCancelReqModal: false });
      SHApiConnector.updateCalenderAppointments(data, function (err, stat) {
        AppUtils.console('UpdateAppoinment', stat);

        self.setState({
          isLoading: false,
          confirmation: false,
          isRefreshing: false,
          message: '',
        });
        try {
          if (!err && stat) {
            if (stat.error_code == '10006') {
              Actions.LoginOptions();
              self.setState({
                isDataVisible: true,
                isRefreshing: false,
                isEmpty: false,
              });
            } else {
              if (stat.state) {
                if (stat.state === 'CONFIRMED') {
                  Alert.alert('', strings('doctor.alertMsg.requestConfirmed'));
                } else if (stat.state === 'EXPIRED') {
                  Alert.alert(strings('', 'doctor.alertMsg.requestExpired'));
                } else if (stat.state === 'CALENDER_CANCELLED' || stat.state === 'CANCELLED') {
                  Alert.alert(strings('', 'doctor.alertMsg.requestCancelled'));
                } else if (stat.state === 'REJECTED') {
                  Alert.alert(strings('', 'doctor.alertMsg.requestRejected'));
                }
                self.setState({
                  upcomingAppointment: stat.requestAppointment,
                  isDataVisible: true,
                  isRefreshing: false,
                  page: self.state.page + 1,
                  emptyText: '',
                  isEmpty: true,
                  isRequest: true,
                  isUpComing: false,
                  isPast: false,
                });
              } else {
                if (status == 'CONFIRMED') {
                  if (stat.appointments.length == 0) {
                    self.setState({
                      emptyText: strings('doctor.text.noUpcomingAppoint'),
                      isEmpty: true,
                      isDataVisible: false,
                      isRequest: false,
                      isUpComing: true,
                      isPast: false,
                    });
                  } else {
                    self.setState({
                      upcomingAppointment: stat.appointments,
                      isDataVisible: true,
                      isRefreshing: false,
                      age: self.state.page + 1,
                      emptyText: '',
                      isEmpty: false,
                      isRequest: false,
                      isUpComing: true,
                      isPast: false,
                    });
                  }
                } else {
                  if (stat.requestAppointment.length == 0) {
                    self.setState({
                      upcomingAppointment: [],
                      emptyText: strings('doctor.text.noRequestAppoint'),
                      isEmpty: true,
                      isDataVisible: false,
                      isRequest: true,
                      isUpComing: false,
                      isPast: false,
                    });
                  } else {
                    self.setState({
                      upcomingAppointment: stat.requestAppointment,
                      isDataVisible: true,
                      isRefreshing: false,
                      page: self.state.page + 1,
                      emptyText: '',
                      isEmpty: true,
                      isRequest: true,
                      isUpComing: false,
                      isPast: false,
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  confirmReschedule(item) {
    Alert.alert(strings('doctor.alertTitle.confirmReschedule'), strings('doctor.alertMsg.confirmReschedule'), [
      { text: strings('doctor.button.cancel'), style: 'cancel' },
      {
        text: strings('doctor.button.reschedule'),
        onPress: () => this.reschedule(item),
      },
    ]);
  }

  openTheDialer(item) {
    AppUtils.console('CallItem', item);

    let phoneNumber = '+' + item.item.clinicId.countryCode + item.item.clinicId.phoneNumber;

    phoneNumber = item.item.callType && item.item.clinicId.countryCode == '65' ? '+65 8189 3129' : phoneNumber;

    Linking.openURL(`tel:${phoneNumber}`);
  }

  openCalender1() {
    var self = this;
    let advanceBookingDays = self.state.advanceBookingDays;
    var maxDate = moment().add(advanceBookingDays, 'days')._d;
    var minDate = moment()._d;
    Keyboard.dismiss();
    Platform.OS === 'ios'
      ? self.setState({ showDate: true, minDate: minDate, maxDate: maxDate })
      : self.showPicker1('dateToday', {
          mode: 'spinner',
          minDate: minDate,
          maxDate: maxDate,
        });
  }

  showPicker1 = async (stateKey, options) => {
    var date = '';
    try {
      var newState = {};
      const { action, year, month, day } = await DateTimePicker.open(options);
      if (action === DateTimePicker.dismissedAction) {
      } else {
        date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      var rescheduleItem = {
        item: {
          clinicId: this.state.clinicId,
          doctorId: this.state.doctorId,
          patientId: this.state.patientId,
          startTime: moment(date).format('YYYY-MM-DD'),
        },
      };
      this.reschedule(rescheduleItem);
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  closeIOSCalender() {
    this.setState({ showDate: false });
    var rescheduleItem = {
      item: {
        clinicId: this.state.clinicId,
        doctorId: this.state.doctorId,
        patientId: this.state.patientId,
        startTime: moment(this.state.dateToday),
      },
    };
    this.reschedule(rescheduleItem);
  }

  openIOSCalender() {
    var dt = new Date(this.state.dateToday);
    dt.setDate(dt.getDate());
    var _dt = dt;
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showDate}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', width: width - 30 }}>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                value={_dt}
                style={{ backgroundColor: AppColors.whiteColor }}
                mode="date"
                display={'spinner'}
                maximumDate={this.state.maxDate}
                minimumDate={this.state.minDate}
                onChange={(event, date) => {
                  this.setState({ dateToday: date });
                }}
              />
            </View>
            <TouchableHighlight onPress={() => this.closeIOSCalender()} underlayColor="transparent">
              <View
                style={{
                  backgroundColor: AppColors.primaryColor,
                  height: 50,
                  width: width - 30,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {moment(this.state.dateToday).format('MMM DD YYYY')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  openSlots() {
    return (
      <ElevatedView
        elevation={15}
        animation={this.state.animationType}
        onAnimationEnd={() => this.onAnimEnd()}
        onAnimationBegin={() => this.onAnimStart()}
        duration={100}
        style={styles.menuParentStyle}
      >
        <View style={styles.cardDoctDetails}>
          <ScrollView style={{ height: height }}>
            <View style={styles.cardSlot}>
              <Text style={styles.cardSelectText}>{strings('doctor.text.selectYourSlotForReschedule')}</Text>
              <TouchableHighlight
                onPress={() => this.openCalender1()}
                underlayColor="transparent"
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    borderRadius: moderateScale(10),
                    width: moderateScale(80),
                    height: verticalScale(50),
                    backgroundColor: AppColors.primaryColor,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={styles.cardDate}>{moment(this.state.dateToday).format('MMM DD')}</Text>
                </View>
              </TouchableHighlight>
            </View>
            <View>
              <View>
                {this.state.isSlotAvailable ? (
                  <View>
                    <View
                      style={{
                        height: verticalScale(250),
                        width: width,
                        flexDirection: 'row',
                      }}
                    >
                      <FlatList
                        data={this.state.slot}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={(item) => this._renderSlot(item)}
                        extraData={this.state}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginTop: verticalScale(15),
                      }}
                    >
                      <SHButton
                        btnText={strings('doctor.button.cancel')}
                        btnType={'border-only'}
                        btnTextColor={AppColors.blackColor}
                        btnPressBackground={'transparent'}
                        style={{
                          alignSelf: 'center',
                          margin: moderateScale(5),
                        }}
                        onBtnClick={() => this.cancelRescheduling()}
                      />

                      <SHButton
                        btnText={strings('doctor.button.rescheduleNow')}
                        btnType={'normal'}
                        btnTextColor={AppColors.whiteColor}
                        btnPressBackground={AppColors.primaryColor}
                        style={{
                          alignSelf: 'center',
                          margin: moderateScale(5),
                        }}
                        onBtnClick={() => this.bookResheduleSlots()}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      height: verticalScale(320),
                      width: width,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    {!this.state.nextAvailableDay ? (
                      <View>
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            fontFamily: AppStyles.fontFamilyBold,
                            color: AppColors.primaryColor,
                            justifyContent: 'center',
                            alignSelf: 'center',
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.doctorNotWorkingToday')}
                        </Text>
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            fontFamily: AppStyles.fontFamilyMedium,
                            color: AppColors.primaryColor,
                            justifyContent: 'center',
                            alignSelf: 'center',
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.docNextWorkDayNotAvail')}
                        </Text>
                        <SHButtonDefault
                          btnText={strings('doctor.button.cancel')}
                          btnType={'normal'}
                          style={{
                            alignSelf: 'center',
                            margin: moderateScale(50),
                          }}
                          onBtnClick={() => this.setState({ isRescheduling: false })}
                        />
                      </View>
                    ) : (
                      <View>
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            fontFamily: AppStyles.fontFamilyBold,
                            color: AppColors.primaryColor,
                            justifyContent: 'center',
                            alignSelf: 'center',
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.doctorNotWorkingToday')}
                        </Text>
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            fontFamily: AppStyles.fontFamilyMedium,
                            color: AppColors.primaryColor,
                            justifyContent: 'center',
                            alignSelf: 'center',
                            margin: moderateScale(10),
                          }}
                        >
                          {strings('doctor.text.nextOperatingDay')}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            margin: moderateScale(25),
                            justifyContent: 'center',
                          }}
                        >
                          <SHButtonDefault
                            btnText={strings('doctor.button.cancel')}
                            btnType={'border-only'}
                            btnTextColor={AppColors.blackColor}
                            style={{
                              alignSelf: 'center',
                              margin: moderateScale(10),
                            }}
                            onBtnClick={() => this.setState({ isRescheduling: false })}
                          />

                          <SHButtonDefault
                            btnText={moment(this.state.nextAvailableDate).format('DD MMM YYYY')}
                            btnType={'normal'}
                            style={{
                              alignSelf: 'center',
                              margin: moderateScale(10),
                            }}
                            onBtnClick={() => this.setNewDate(this.state.nextAvailableDate)}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </ElevatedView>
    );
  }

  setNewDate(newDate) {
    var rescheduleItem = {
      item: {
        clinicId: this.state.clinicId,
        doctorId: this.state.doctorId,
        patientId: this.state.patientId,
        startTime: moment(newDate).format(),
      },
    };
    this.reschedule(rescheduleItem);
  }

  _renderSlot(item) {
    return (
      <ScrollView style={{ width: width, flexDirection: 'column' }}>
        <Text
          style={{
            fontFamily: AppStyles.fontFamilyMedium,
            marginLeft: moderateScale(15),
            fontSize: moderateScale(15),
            color: AppColors.blackColor,
          }}
        >
          {item.item.shift}
        </Text>

        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <FlatList
            data={item.item.slots}
            keyExtractor={(time, index) => index}
            renderItem={(time) => this._render_eveningSlot(item, time)}
            numColumns={4}
            extraData={this.state}
          />
        </View>
      </ScrollView>
    );
  }

  _render_eveningSlot(mainItem, item) {
    var recievedTime = item.item.start;
    var time = moment.parseZone(recievedTime).format('hh:mm A');
    var format = 'hh:mm A';

    var isTimeOver = false;
    AppUtils.getTimeDifferenceFromToday(recievedTime, function (hour, min, sec, days, isOver) {
      isTimeOver = isOver;
    });
    AppUtils.console('xcszxfsd', isTimeOver);
    var isValueSelected = false;
    if (item.item.isSelected) {
      isValueSelected = true;
    }
    return (
      <View style={{ margin: moderateScale(5) }}>
        {!isTimeOver && !item.item.isBooked && !item.item.isLocked ? (
          isValueSelected ? (
            <SlotView slotType={'blocked'} backgroundColor={selectedSlotColor} slotText={time} />
          ) : (
            <SlotView
              slotType={'available'}
              backgroundColor={unSelectedSlotColor}
              slotText={time}
              onSlotClick={() => {
                this.selectEveningSlot(mainItem, item, isTimeOver);
              }}
            />
          )
        ) : (
          <SlotView slotType={'occupied'} slotText={time} />
        )}
      </View>
    );
  }

  confirmation() {
    return (
      <Modal visible={this.state.confirmation} transparent={true} animationType={'fade'} onRequestClose={() => AppUtils.console('Modal Closed')}>
        <View
          style={{
            height: height,
            width: width,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: verticalScale(400),
              elevation: 2,
              backgroundColor: AppColors.whiteColor,
              width: width - moderateScale(20),
              marginLeft: moderateScale(10),
              marginRight: moderateScale(10),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            <Image
              source={confirmLogo}
              style={{
                height: verticalScale(120),
                width: verticalScale(120),
                borderRadius: verticalScale(60),
                backgroundColor: AppColors.whiteColor,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: verticalScale(100),
              }}
            ></Image>
            <View
              style={{
                marginLeft: moderateScale(30),
                marginRight: moderateScale(30),
              }}
            >
              <Text
                style={{
                  marginTop: verticalScale(20),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                }}
              >
                {strings('doctor.text.appointRechedule', {
                  name: this.state.patientName,
                })}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                  marginTop: verticalScale(30),
                }}
              >
                QUEUE #{this.state.selectedQueueNumber} | {this.state.selectedDoctorName}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.blackColor,
                  textAlign: 'center',
                  marginTop: verticalScale(10),
                }}
              >
                {moment(this.state.selectedStartDate).format(' MMM DD YYYY')} | {moment(this.state.selectedStartDate).format('dddd')} |{' '}
                {moment(this.state.selectedStartDate).format('hh:mm A')}
              </Text>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.textGray,
                  textAlign: 'center',
                  marginTop: verticalScale(20),
                }}
                numberOfLines={1}
              >
                {this.state.selectedClinicName} | {this.state.selectedClinicAddress}
              </Text>
            </View>
            <View style={[styles.clinicbuttonView, { marginTop: 20 }]}>
              <SHButtonDefault
                btnText={strings('doctor.button.myAppointment')}
                btnType={'normal'}
                style={{
                  marginLeft: moderateScale(30),
                  width: moderateScale(140),
                }}
                btnTextColor={AppColors.whiteColor}
                btnPressBackground={AppColors.primaryColor}
                onBtnClick={() => this.getMyAppointmentsBefore()}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  getMyAppointmentsBefore() {
    var self = this;
    self.setState({
      confirmation: false,
    });
    self.getMyAppointments();
  }

  bookResheduleSlots() {
    var self = this;
    var arrayData = self.state.slot;
    var dataLength = arrayData.length;
    var isSlotSelected = 0;
    var resheduleData = {
      appointmentData: {
        clinicId: this.state.clinicId,
        doctorId: this.state.doctorId,
        patientId: self.state.patientId,
        appointmentId: this.state.selectedAppointment,
        start: this.state.selectedSlot.start,
        end: this.state.selectedSlot.end,
        daySlotId: this.state.daySlotId,
        shiftSlotId: this.state.shiftID,
        slotId: this.state.selectedSlot._id,
        shiftIndex: this.state.shiftSelected,
        slotIndex: this.state.slotSelected,
        queueNumber: this.state.queueNumber,
        sequence: this.state.sequence,
        isCalender: this.state.isCalender,
      },
    };

    for (var i = 0; i < dataLength; i++) {
      var getSubData = arrayData[i].slots.length;
      for (var j = 0; j < getSubData; j++) {
        if (arrayData[i].slots[j].isSelected) {
          isSlotSelected = 1;
        }
      }
    }

    if (isSlotSelected == 1) {
      SHApiConnector.bookReshedule(resheduleData, function (err, stat) {
        try {
          if (stat.error_code) {
            self.openAlert(stat);
          } else {
            var data = stat.appointment;
            self.setState({
              isRescheduling: false,
              confirmation: true,
              field: 'UPCOMING',
              patientName: data.patientId.firstName + ' ' + data.patientId.lastName,
              selectedQueueNumber: data.queueNumber,
              selectedDoctorName: data.doctorId.doctorName,
              selectedStartDate: data.startTime,
              selectedClinicName: data.clinicId.clinicName,
              selectedClinicAddress: data.clinicId.locationName,
              isUpComing: true,
              isPast: false,
              isRequest: false,
            });
          }
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      alert(strings('doctor.slertMsg.selectSlotReschedule'));
    }
  }

  openAlert(stat) {
    var self = this;
    if (stat.error_code == '10006') {
      self.showAlert(strings('string.error_code.error_10006'), true);
      Actions.LoginMobile({ appointmentData: self.props.appointmentData });
    } else if (stat.error_code == '10002') {
      self.showAlert(strings('string.error_code.error_10002'), true);
    } else if (stat.error_code == '10003') {
      self.showAlert(strings('string.error_code.error_10003'), true);
    } else if (stat.error_code == '10013') {
      self.showAlert(strings('string.error_code.error_10013'), true);
    } else if (stat.error_code == '10014') {
      self.showAlert(strings('string.error_code.error_10014'), true);
    } else if (stat.error_code == '10015') {
      self.showAlert(strings('string.error_code.error_10015'), true);
    } else if (stat.error_code == '10017') {
      self.showAlert(strings('string.error_code.error_10017'), true);
    } else if (stat.error_code == '10021') {
      self.showAlert(strings('string.error_code.error_10021'), true);
    } else if (stat.error_code == '10024') {
      self.showAlert(strings('string.error_code.error_10024'), true);
    } else if (stat.error_code == '10025') {
      self.showAlert(strings('string.error_code.error_10025'), true);
    } else if (stat.error_code == '10028') {
      self.showAlert(strings('string.error_code.error_10028'), true);
    } else if (stat.error_code == '10029') {
      self.showAlert(strings('string.error_code.error_10029'), true);
    }
  }

  selectEveningSlot(mainItem, item, isTimeOver) {
    var arrayData = this.state.slot;
    var getData = arrayData[mainItem.index];
    var dataLength = arrayData.length;

    for (var i = 0; i < dataLength; i++) {
      var getSubData = arrayData[i].slots.length;
      for (var j = 0; j < getSubData; j++) {
        if (mainItem.index == i && item.index == j) {
          arrayData[i].slots[j].isSelected = true;
          let slotDate = moment(arrayData[i].slots[j].start);
          let currentTime = moment();
          var diff = slotDate.diff(currentTime);
          var timeDifferenceinMinutes = diff / 1000 / 60;

          if (timeDifferenceinMinutes < 30) {
            this.showAlert(strings('doctor.alertMsg.selectSlotThirtyMin'), true);
            arrayData[i].slots[j].isSelected = false;
          } else {
            this.setState({
              selectedSlot: arrayData[i].slots[j],
              shiftID: mainItem.item._id,
              shiftSelected: i,
              slotSelected: j,
              queueNumber: arrayData[i].slots[j].queueNumber,
              sequence: arrayData[i].slots[j].sequence,
            });
          }
        } else {
          arrayData[i].slots[j].isSelected = false;
        }
      }
    }
    this.setState({
      morningTimeSlot: arrayData,
    });
  }

  showAlert(msg, ispop) {
    let self = this;
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {
        if (ispop) {
          self.setState({
            isRescheduling: false,
          });
        }
      });
    }, 500);
  }

  openUserChat(item) {
    this.clearTimer();
    Actions.ChatScreen({
      sender: 'CLINIC',
      receiver: 'PATIENT',
      appointmentId: item.item._id,
      clinicName: item.item.clinicId.clinicName,
      clinicLogo: this.state.clinicLogo,
      clinicAddress: this.state.clinicAddress,
      isRequest: this.state.isRequest,
      isUpComing: this.state.isUpComing,
      isPast: this.state.isPast,
    });
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 40 : Platform.OS === 'ios' ? 16 : verticalScale(0),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },

  scrollView: {
    width: width,
    height: height,
    backgroundColor: 'transparent',
  },
  flatListMainView: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(5),
    width: AppUtils.isIphone ? AppUtils.screenWidth - 16 : moderateScale(350),
    borderRadius: moderateScale(10),
    alignSelf: 'center',
    backgroundColor: AppColors.whiteColor,
  },
  view1: {
    flexDirection: 'row',
    height: verticalScale(70),
    margin: verticalScale(10),
    alignItems: 'center',
  },
  queueView1: {
    width: AppUtils.isLowResiPhone ? moderateScale(60) : moderateScale(60),
    height: AppUtils.isLowResiPhone ? moderateScale(60) : moderateScale(60),
    borderRadius: AppUtils.isLowResiPhone ? moderateScale(60 / 2) : moderateScale(30),
    backgroundColor: AppColors.primaryColor,
    marginLeft: AppUtils.isLowResiPhone ? moderateScale(80) : moderateScale(80),
  },
  queueView2: {
    flexDirection: 'column',
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  doctorImage: {
    height: AppUtils.isIphone ? PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) : moderateScale(50),
    width: AppUtils.isIphone ? PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) : moderateScale(50),
    borderRadius: AppUtils.isIphone ? PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 / 2 : 30 / 2) : moderateScale(25),
    alignSelf: 'center',
  },

  doctorName: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
  },
  speciality: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    color: AppColors.primaryGray,
  },
  clinicName: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    color: AppColors.primaryGray,
  },
  queueText1: {
    fontSize: moderateScale(15),
    fontFamily: AppStyles.fontFamilyBold,
    color: AppColors.whiteColor,
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  endsInText: {
    fontSize: moderateScale(8),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.whiteColor,
    alignSelf: 'center',
    marginTop: 10,
  },
  queueText2: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyBold,
    color: AppColors.whiteColor,
    alignSelf: 'center',
  },
  timePendingRequest: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyBold,
    color: AppColors.whiteColor,
    alignSelf: 'center',
    marginTop: moderateScale(5),
  },
  patientView: {
    flexDirection: 'row',
    height: verticalScale(40),
    // borderBottomWidth: moderateScale(1),
    borderBottomColor: AppColors.lightGray,
    margin: verticalScale(10),
  },
  patientName: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(10),
    color: AppColors.blackColor,
  },
  patientDetail: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    color: AppColors.primaryGray,
  },
  statusView: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: moderateScale(30),
    flex: 1,
  },
  statusText: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(10),
    color: AppColors.primaryColor,
  },
  appointmentTime: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(10),
    color: AppColors.blackColor,
  },
  waitingText: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    color: AppColors.blackColor,
  },
  appointmentDay: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    color: AppColors.primaryGray,
  },
  menuParentStyle: {
    position: 'absolute',
    width: width,
    height: AppUtils.screenHeight / 1.1,
    bottom: 0,
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(10),
  },
  cardDoctDetails: {
    height: height,
    width: width,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGray,
  },
  cardDoctImage: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    margin: moderateScale(10),
  },
  cardDoctor: {
    flexDirection: 'column',
    marginTop: verticalScale(30),
    width: moderateScale(280),
    marginLeft: moderateScale(20),
  },
  cardDoctorName: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
    color: AppColors.blackColor,
    alignSelf: 'flex-start',
  },
  cardDoctorSpec: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(13),
    color: AppColors.blackColor,
    alignSelf: 'flex-start',
  },
  cardSlot: {
    height: verticalScale(40),
    flexDirection: 'row',
    margin: moderateScale(20),
    marginTop: verticalScale(40),
  },
  cardSelectText: {
    fontFamily: AppStyles.fontFamilyBold,
    fontSize: moderateScale(13),
    color: AppColors.primaryColor,
    flex: 2.5,
  },
  cardDate: {
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(15),
    color: AppColors.whiteColor,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  cardSpecFree: {
    width: moderateScale(70),
    borderRadius: moderateScale(5),
    height: moderateScale(45),
    alignSelf: 'center',
    borderWidth: moderateScale(1),
    borderColor: AppColors.primaryColor,
  },
  cardSpecOccupied: {
    width: moderateScale(70),
    borderRadius: moderateScale(5),
    height: moderateScale(45),
    alignSelf: 'center',
    backgroundColor: AppColors.primaryGray,
  },
  cardTimeText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    marginTop: moderateScale(15),
  },
  cardTimeText1: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    color: AppColors.whiteColor,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(10),
    marginTop: moderateScale(15),
  },
  clinicbuttonView: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: verticalScale(60),
    flexDirection: 'row',
    //  marginTop:verticalScale(10),
    borderRadius: moderateScale(20),
    marginBottom: moderateScale(100),
  },
  modalContainerRes: {
    flexDirection: 'column',
    height: verticalScale(300),
    width: width - moderateScale(50),
    backgroundColor: AppColors.whiteColor,
    margin: moderateScale(50),
    marginTop: moderateScale(100),
    alignSelf: 'center',
    elevation: 5,
  },
  topContainer: {
    flexDirection: 'column',
    height: verticalScale(60),
    width: width - moderateScale(50),
    backgroundColor: AppColors.primaryColor,
    borderTopRightRadius: moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  lastContainerDep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(20),
    marginTop: moderateScale(10),
    //marginLeft: moderateScale(100)
  },
  buttonContainerDep: {
    backgroundColor: AppColors.primaryColor,
    height: moderateScale(30),
    width: moderateScale(90),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextBgDep: {
    fontSize: moderateScale(12),
    fontFamily: AppStyles.fontFamilyBold,
    color: AppColors.whiteColor,
    marginTop: Platform.OS === 'ios' ? moderateScale(5) : moderateScale(0),
    alignSelf: 'center',
  },
  buttonWithoutBgDep: {
    backgroundColor: AppColors.whiteColor,
    height: moderateScale(30),
    width: moderateScale(90),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryColor,
    marginRight: moderateScale(5),
  },
  buttonWithoutBgTextDep: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.blackColor,
    //margin: moderateScale(15),
    alignSelf: 'center',
  },
  prescriptionList: {
    height: hp(5),
    marginHorizontal: moderateScale(10),
    backgroundColor: AppColors.white,
    borderRadius: moderateScale(10),
    flex: 1,
    flexDirection: 'column',
  },
  prescriptionListContainer: {
    flexDirection: 'row',
    height: hp(4),
    borderColor: AppColors.lightGrey,
    alignItems: 'center',
  },
  prescptionView: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(5),
    borderColor: AppColors.blackColor,
    borderWidth: moderateScale(1),
    marginBottom: moderateScale(15),
    borderBottomWidth: moderateScale(0),
    overflow: 'hidden',
  },
  prescriptionIcon: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(2),
  },
  prescriptionName: {
    flexDirection: 'column',
    marginLeft: moderateScale(5),
  },
  prescriptionNameView: {
    flexDirection: 'row',
  },
  text: {
    fontSize: hp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: '10%',
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalLeftColumn: {
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'black',
    fontSize: 16,
  },
  modalSubButtonText: {
    fontSize: 12,
  },
  closeIcon: {
    position: 'absolute',
    top: 0,
    right: 5,
  },
});

export default MyAppointments;
