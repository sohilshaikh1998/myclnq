import React, { Component } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Linking,
  AppState,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import caregiverBookingRequestStyle from './caregiverBookingRequestStyle';
import { AppColors } from '../../../shared/AppColors';
import { AppStrings } from '../../../shared/AppStrings';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import images from '../../../utils/images';
import { moderateScale, verticalScale } from '../../../utils/Scaling';

import { SHApiConnector } from '../../../network/SHApiConnector';
import ProgressLoader from 'rn-progress-loader';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import ElevatedView from 'react-native-elevated-view';
import { AppStyles } from '../../../shared/AppStyles';
import { AppUtils } from '../../../utils/AppUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
//import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-simple-toast';
const { width, height } = Dimensions.get('window');
import { strings } from '../../../locales/i18n';

const isRTL = I18nManager.isRTL;
class caregiverBookingRequestScreen extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Caregiver Booking Request Screen');
    let startDate = moment(AppUtils.currentDateTime()).add(2, 'hours');
    let endDate = moment(AppUtils.currentDateTime()).add(3, 'hours');
    let roundStartMin = 30 - (startDate.minute() % 30);
    let roundEndMin = 30 - (endDate.minute() % 30);
    this.onRefreshPast = this.onRefreshPast.bind(this);
    this.onRefreshUpcoming = this.onRefreshUpcoming.bind(this);
    this.onRefreshRequest = this.onRefreshRequest.bind(this);

    this.state = {
      isLoading: false,
      showCalender: false,
      requestPage: 1,
      pastRequestPage: 1,
      upcomingRequestPage: 1,
      isPastFooterLoading: false,
      isUpcomingFooterLoading: false,
      isRequestFooterLoading: false,
      isUpcoming: true,
      isRequest: false,
      isPast: false,
      select_StartDate: false,
      select_StartTime: false,
      isDate: true,
      orderDetailModal: false,
      orderExtendModal: false,
      extendData: '',
      isRefreshing: false,
      isReqInvoice: false,
      invoiceMail: '',
      sDate: true,
      eDate: true,
      selectStartDate: true,
      selectEndDate: false,
      selectStartTime: false,
      selectEndTime: false,
      selectedStartDate: moment(startDate).add(roundEndMin, 'minutes'),
      selectedEndDate: moment(endDate).add(roundEndMin, 'minutes'),
      selectedStartTime: moment(startDate).add(roundStartMin, 'minutes'),
      selectedEndTime: moment(endDate).add(roundEndMin, 'minutes'),
      isSelectedStartDate: true,
      serviceDays: 0,
      serviceHours: 0,
      sTime: true,
      eTime: true,
      isSelectedStartTime: true,

      upcomingRequest: [],
      pastRequest: [],
      request: [],
      upcomingDetail: {
        isUpcoming: true,
        location: '',
        lookingFor: {
          service: '',
          subservice: '',
        },
        Date: {
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
        },
        nurse: {
          name: '',
          providerName: '',
          gender: '',
          age: '',
          lang: [],
        },
        Patient: {
          name: '',
          age: '',
          condition: '',
        },
        orderId: '',
        jobStatus: '',

        isPanExpanded: false,
        selected: 0,
        isMale: true,
        isExperienced: true,
      },
      appState: AppState.currentState,
    };
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (this.state.isRequest) {
        this.onRefreshRequest();
      } else if (this.state.isUpcoming) {
        this.onRefreshUpcoming();
      } else {
        this.onRefreshPast();
      }
    }
    this.setState({ appState: nextAppState });
  };

  async componentDidMount() {
    AppUtils.console('caregiver', this.props);
    // this.setState({ isLoading: true });
    AppState.addEventListener('change', this._handleAppStateChange);

    const value = await AsyncStorage.getItem(AppStrings.key.request);
    AppUtils.console('RequestKey', value);
    if (value == 'Request') {
      this.setState({ isRequest: true, isUpcoming: false });
      this.getRequest();
      await AsyncStorage.setItem(AppStrings.key.request, JSON.stringify(false));
    } else {
      this.setState({ isRequest: false, isUpcoming: true });
      this.getUpcomingRequest();
    }
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (error, stores) => {
        stores.map((result, i, store) => {
          AppUtils.console({ [store[i][0]]: store[i][1] });
          return true;
        });
      });
    });

    const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
    AppUtils.console('userDetails1', userDetails);
    if (userDetails.email) {
      this.setState({
        invoiceMail: userDetails.email,
        savedEmail: userDetails.email,
      });
    }
    1;
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }

  goBack() {
    Actions.CaregiverHome();
  }

  openDialScreen(number) {
    if (Platform.OS === 'ios') {
      number = 'telprompt:${' + number + '}';
    } else {
      number = 'tel:${' + number + '}';
    }
    Linking.openURL(number);
  }

  onRefreshPast() {
    var self = this;
    self.setState(
      {
        isRefreshing: true,
        isLoading: true,
        pastRequestPage: 1,
        pastRequest: [],
      },
      () => self.getPastRequest()
    );
  }

  onRefreshUpcoming() {
    var self = this;
    self.setState(
      {
        isRefreshing: true,
        isLoading: true,
        upcomingRequestPage: 1,
        upcomingRequest: [],
      },
      () => self.getUpcomingRequest()
    );
  }

  onRefreshRequest() {
    var self = this;
    self.setState({ isRefreshing: true, isLoading: true, requestPage: 1, request: [] }, () => self.getRequest());
  }

  async getPastRequest() {
    try {
      let response = await SHApiConnector.getCompletedJob({
        page: this.state.pastRequestPage,
      });
      AppUtils.console('>>>>> RES Past', response);
      if (response.data.status) {
        if (response.data.response.length > 0) {
          if (response.data.response.length < 10) {
            this.setState({ isPastFooterLoading: false });
          } else {
            this.setState({ isPastFooterLoading: true });
          }
          if (this.state.pastRequestPage == 1) {
            this.setState({
              pastRequest: response.data.response,
              isRefreshing: false,
              pastRequestPage: this.state.pastRequestPage + 1,
            });
          } else {
            this.setState({
              pastRequest: [...this.state.pastRequest, ...response.data.response],
              isRefreshing: false,
              pastRequestPage: this.state.pastRequestPage + 1,
            });
          }
        }

        AppUtils.console('>>>>> RES Upcoming ', response, 'currentList', this.state.pastRequest.length);
      } else {
        this.showAlert(response.data.error_message);
      }

      this.setState({ isLoading: false, isRefreshing: false });
    } catch (e) {
      this.showAlert(e.response.data.error_message);
      this.setState({ isLoading: false, isRefreshing: false });
    }
  }

  async getUpcomingRequest() {
    try {
      let response = await SHApiConnector.getUpcomingJob({
        page: this.state.upcomingRequestPage,
      });
      this.setState({ isLoading: false });
      AppUtils.console('getUpcoming', response.data);
      if (response.data.status) {
        if (response.data.response.length > 0) {
          if (response.data.response.length < 10) {
            this.setState({ isUpcomingFooterLoading: false });
          } else {
            this.setState({ isUpcomingFooterLoading: true });
          }
          if (this.state.upcomingRequestPage == 1) {
            this.setState({
              upcomingRequest: response.data.response,
              isRefreshing: false,
              upcomingRequestPage: this.state.upcomingRequestPage + 1,
            });
          } else {
            this.setState({
              upcomingRequest: [...this.state.upcomingRequest, ...response.data.response],
              isRefreshing: false,
              upcomingRequestPage: this.state.upcomingRequestPage + 1,
            });
          }

          AppUtils.console('>>>>> RES Upcoming ', response, 'currentList', this.state.upcomingRequest.length);
        }
      } else {
        this.showAlert(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false, isRefreshing: false });
      this.showAlert(e.response.data.error_message);
    }
  }

  async getRequest() {
    try {
      let response = await SHApiConnector.getRequestedJob(this.state.requestPage);
      this.setState({ isLoading: false });
      if (response.data.status) {
        if (response.data.response.length > 0) {
          if (response.data.response.length < 10) {
            this.setState({ isRequestFooterLoading: false });
          } else {
            this.setState({ isRequestFooterLoading: true });
          }
          if (this.state.requestPage == 1) {
            this.setState({
              request: response.data.response,
              isRefreshing: false,
              requestPage: this.state.requestPage + 1,
            });
          } else {
            this.setState({
              request: [...this.state.request, ...response.data.response],
              isRefreshing: false,
              requestPage: this.state.requestPage + 1,
            });
          }

          AppUtils.console('>>>>> RES Request ', response, 'currentList', this.state.request.length);
        }
      } else {
        this.showAlert(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false, isRefreshing: false });
      this.showAlert(e.response.data.error_message);
    }
  }

  header() {
    return (
      <ElevatedView elevation={5} style={caregiverBookingRequestStyle.header}>
        <View style={caregiverBookingRequestStyle.topTabView}>
          <TouchableOpacity
            onPress={() =>
              this.setState(
                {
                  isRequest: true,
                  isUpcoming: false,
                  isPast: false,
                  isLoading: true,
                },
                () => this.getRequest()
              )
            }
            style={[
              caregiverBookingRequestStyle.requestTab,
              caregiverBookingRequestStyle.tab,
              {
                backgroundColor: this.state.isRequest ? AppColors.primaryColor : AppColors.whiteColor,
                borderColor: AppColors.greyBorder,
                borderWidth: !this.state.isRequest ? 1 : 0.8,
              },
            ]}
            underlayColor={AppColors.primaryColor}
          >
            <Text
              style={[
                caregiverBookingRequestStyle.tabTxt,
                {
                  color: this.state.isRequest ? AppColors.whiteColor : AppColors.blackColor,
                },
              ]}
            >
              {strings('string.label.requests')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              this.setState(
                {
                  isUpcoming: true,
                  isPast: false,
                  isRequest: false,
                  isLoading: true,
                },
                () => this.getUpcomingRequest()
              )
            }
            activeOpacity={this.state.isUpcoming ? 1 : 0.8}
            style={[
              caregiverBookingRequestStyle.upcomingTab,
              caregiverBookingRequestStyle.tab,
              {
                backgroundColor: this.state.isUpcoming ? AppColors.primaryColor : AppColors.whiteColor,
                borderColor: AppColors.greyBorder,
                borderWidth: !this.state.isUpcoming ? 1 : 0,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                caregiverBookingRequestStyle.tabTxt,
                {
                  color: this.state.isUpcoming ? AppColors.whiteColor : AppColors.blackColor,
                },
              ]}
            >
              {strings('string.topTab.upcoming')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              this.setState(
                {
                  isPast: true,
                  isUpcoming: false,
                  isRequest: false,
                  isLoading: true,
                },
                () => this.getPastRequest()
              )
            }
            activeOpacity={this.state.isPast ? 1 : 0.8}
            style={[
              caregiverBookingRequestStyle.pastTab,
              caregiverBookingRequestStyle.tab,
              {
                backgroundColor: this.state.isPast ? AppColors.primaryColor : AppColors.whiteColor,
                borderColor: AppColors.greyBorder,
                borderWidth: !this.state.isPast ? 1 : 0,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                caregiverBookingRequestStyle.tabTxt,
                {
                  color: this.state.isPast ? AppColors.whiteColor : AppColors.blackColor,
                },
              ]}
            >
              {strings('string.topTab.past')}
            </Text>
          </TouchableOpacity>
        </View>
      </ElevatedView>
    );
  }

  setData(item, jobStatus, State) {
    try {
      AppUtils.console('Szcvdgfbdc', jobStatus, State, item);

      let startDate = moment(item.item.jobStartTime).format('DD MMM, YYYY');
      let startTime = moment(item.item.jobStartTime).format('h:mm A');
      let endDate = moment(item.item.jobEndTime).format('DD MMM, YYYY');
      let endTime = moment(item.item.jobEndTime).format('h:mm A');
      let requestDate = moment(item.item.requestedTime).format('DD MMM, YYYY');
      let requestTime = moment(item.item.requestedTime).format('h:mm A');

      this.setState(
        {
          upcomingDetail: {
            isUpcoming: State,
            location: item.item.userDetails,
            lookingFor: {
              service: item.item.serviceTypeId.serviceTypeName,
              subservice: item.item.serviceId.service,
            },
            Date: {
              startDate: startDate,
              startTime: startTime,
              endDate: endDate,
              endTime: endTime,
              requestDate: requestDate,
              requestTime: requestTime,
            },

            nurse: item.item.caregiverId
              ? {
                  name: item.item.caregiverId.firstName + ' ' + item.item.caregiverId.lastName,
                  providerName: item.item.acceptedBy ? item.item.acceptedBy.companyName : 'N/A',
                  gender: item.item.caregiverId.gender,
                  age: item.item.caregiverId.age,
                  lang: ['English', 'Hindi'],
                }
              : null,
            Patient: {
              name: item.item.patientDetail.name,
              age: item.item.patientDetail.age,
              condition: item.item.patientConditionId.conditionType,
            },
            orderId: item.item.orderId,
            jobStatus: jobStatus,
            itemData: item.item,
          },
          // orderDetailModal: true,
        },
        () => {
          this.Confirm();
        }
      );
    } catch (e) {
      AppUtils.console('Error', e);
    }
  }
  Confirm() {
    AppUtils.console('ConfirmLog', this.state.upcomingDetail);

    Actions.confirmBooking({ upcomingDetail: this.state.upcomingDetail });
  }

  upcomingCard(item) {
    AppUtils.console('item>>>>> ', item.item);
    let startDate, startTime, endDate, endTime, jobStatus, buttonTxt;
    startDate = moment(item.item.jobStartTime).format('DD MMM, YYYY');
    startTime = moment(item.item.jobStartTime).format('h:mm A');
    endDate = moment(item.item.jobEndTime).format('DD MMM, YYYY');
    endTime = moment(item.item.jobEndTime).format('h:mm A');

    if (item.item.jobStatus === 'REQUESTED') {
      jobStatus = strings('common.caregiver.waitingResponse');
    } else {
      jobStatus = item.item.jobStatus;
    }

    if (item.item.paymentStatus !== 'successful' && item.item.jobStatus !== 'REQUESTED') {
      buttonTxt = AppStrings.btnTxt.viewPay;
    } else if (item.item.jobStatus === 'REQUESTED') {
      buttonTxt = AppStrings.btnTxt.cancel;
    }

    if (item.item.paymentStatus == 'successful') {
      buttonTxt = AppStrings.btnTxt.paid;
    }
    if (item.item.jobStatus === 'STARTED') {
      buttonTxt = AppStrings.btnTxt.extend;
    }

    return (
      <View
        style={{
          paddingBottom: hp(2),
          marginTop: item.index === 0 ? hp(2) : hp(0),
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => this.setData(item, buttonTxt, true)}>
          <ElevatedView elevation={5} style={caregiverBookingRequestStyle.card}>
            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {item.item.serviceTypeId.serviceTypeName}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.subService}>
                  {item.item.serviceId.service}
                </Text>
              </View>

              <View style={[caregiverBookingRequestStyle.block2, { marginBottom: hp(1) }]}>
                <Text allowFontScaling={false} numberOfLines={1} style={caregiverBookingRequestStyle.requestStatusTxt}>
                  {jobStatus == 'SCHEDULED' ? strings('common.caregiver.paymentPending') : jobStatus}
                </Text>
                {item.item.jobStatus === 'REQUESTED' || !item.item.caregiverId ? (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 10 }]}></Text>
                  </View>
                ) : (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Image
                      resizeMode={'cover'}
                      style={caregiverBookingRequestStyle.providerImage}
                      source={
                        item.item.acceptedBy
                          ? item.item.acceptedBy.logo
                            ? { uri: item.item.acceptedBy.logo }
                            : images.doctorImage
                          : images.doctorImage
                      }
                    />

                    <Text
                      numberOfLines={1}
                      allowFontScaling={false}
                      style={[
                        caregiverBookingRequestStyle.serviceTxt,
                        {
                          fontSize: 10,
                          marginLeft: wp(1),
                          marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                        },
                      ]}
                    >
                      {item.item.acceptedBy ? item.item.acceptedBy.companyName : 'N/A'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(82) }]} />

            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.subService, { fontSize: 10 }]}>
                  {strings('string.label.patient_detail')}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
                  {item.item.patientDetail.name}, {item.item.patientDetail.age}{' '}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.block3}>
                <Text allowFontScaling={false} numberOfLines={1} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
                  {startDate} - {endDate}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.timeStyle}>
                  {startTime} - {endTime}
                </Text>
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(92) }]} />

            <View style={[caregiverBookingRequestStyle.rowView, { height: hp(6) }]}>
              <View
                style={[
                  caregiverBookingRequestStyle.priceBlock,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {item.item.jobStatus == 'REQUESTED' ? '' : strings('common.caregiver.serviceCharge')}
                </Text>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[
                    caregiverBookingRequestStyle.subService,
                    {
                      fontFamily: AppStyles.fontFamilyBold,
                      color: AppColors.primaryColor,
                      fontSize: hp(1.5),
                    },
                  ]}
                >
                  {item.item.jobStatus == 'REQUESTED'
                    ? ''
                    : item.item.referralId && item.item.paymentStatus === 'successful'
                    ? item.item.currencySymbol + ' ' + item.item.paidAmount
                    : item.item.currencySymbol + ' ' + item.item.charge}
                </Text>
              </View>
              <View style={[caregiverBookingRequestStyle.block2]}>
                <TouchableOpacity
                  onPress={() => this.requestListButtonAction(buttonTxt, item.item)}
                  activeOpacity={buttonTxt === AppStrings.btnTxt.paid ? 1 : 0.8}
                  style={[
                    caregiverBookingRequestStyle.btn,
                    {
                      backgroundColor: buttonTxt === AppStrings.btnTxt.paid ? 'transparent' : AppColors.primaryColor,
                    },
                    {
                      alignItems: buttonTxt === AppStrings.btnTxt.paid ? 'flex-end' : 'center',
                    },
                  ]}
                >
                  <Text
                    style={[
                      caregiverBookingRequestStyle.btnTxt,
                      {
                        color: buttonTxt === AppStrings.btnTxt.paid ? AppColors.primaryColor : AppColors.whiteColor,
                        fontSize: buttonTxt === AppStrings.btnTxt.paid ? hp(1.2) : hp(1.2),
                      },
                    ]}
                  >
                    {buttonTxt}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ElevatedView>
        </TouchableOpacity>
      </View>
    );
  }

  requestCard(item) {
    AppUtils.console('item>>>>> ', item);
    let startDate, startTime, endDate, endTime, jobStatus, buttonTxt;
    startDate = moment(item.item.jobStartTime).format('DD MMM, YYYY');
    startTime = moment(item.item.jobStartTime).format('h:mm A');
    endDate = moment(item.item.jobEndTime).format('DD MMM, YYYY');
    endTime = moment(item.item.jobEndTime).format('h:mm A');

    if (item.item.jobStatus === 'REQUESTED') {
      jobStatus = strings('common.caregiver.waitingResponse');
    } else {
      jobStatus = item.item.jobStatus;
    }

    if (item.item.paymentStatus === 'PENDING' && item.item.jobStatus !== 'REQUESTED') {
      buttonTxt = AppStrings.btnTxt.payNow;
    } else if (item.item.jobStatus === 'REQUESTED') {
      buttonTxt = AppStrings.btnTxt.cancel;
    }

    if (item.item.jobStatus === 'STARTED') {
      buttonTxt = AppStrings.btnTxt.extend;
    }
    if (item.item.paymentStatus !== 'PENDING') {
      buttonTxt = AppStrings.btnTxt.paid;
    }

    return (
      <View
        style={{
          paddingBottom: hp(2),
          marginTop: item.index === 0 ? hp(2) : hp(0),
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => this.setData(item, buttonTxt, true)}>
          <ElevatedView elevation={5} style={caregiverBookingRequestStyle.card}>
            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {item.item.serviceTypeId.serviceTypeName}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.subService}>
                  {item.item.serviceId.service}
                </Text>
              </View>

              <View style={[caregiverBookingRequestStyle.block2, { marginBottom: hp(1) }]}>
                <Text allowFontScaling={false} numberOfLines={1} style={caregiverBookingRequestStyle.requestStatusTxt}>
                  {jobStatus}
                </Text>
                {item.item.jobStatus === 'REQUESTED' || !item.item.caregiverId ? (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 10 }]}></Text>
                  </View>
                ) : (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Image
                      resizeMode={'cover'}
                      style={caregiverBookingRequestStyle.providerImage}
                      source={
                        item.item.acceptedBy
                          ? item.item.acceptedBy.logo
                            ? { uri: item.item.acceptedBy.logo }
                            : images.doctorImage
                          : images.doctorImage
                      }
                    />
                    <Text
                      numberOfLines={1}
                      allowFontScaling={false}
                      style={[
                        caregiverBookingRequestStyle.serviceTxt,
                        {
                          fontSize: 10,
                          marginLeft: wp(1),
                          marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                        },
                      ]}
                    >
                      {item.item.acceptedBy ? item.item.acceptedBy.companyName : 'N/A'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(82) }]} />

            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.subService, { fontSize: 10 }]}>
                  {strings('string.label.patient_detail')}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
                  {item.item.patientDetail.name}, {item.item.patientDetail.age}{' '}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.block3}>
                <Text allowFontScaling={false} numberOfLines={1} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
                  {startDate} - {endDate}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.timeStyle}>
                  {startTime} - {endTime}
                </Text>
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(92) }]} />

            <View style={[caregiverBookingRequestStyle.rowView, { height: hp(6) }]}>
              <View
                style={[
                  caregiverBookingRequestStyle.priceBlock,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {item.item.jobStatus == 'REQUESTED' ? '' : strings('common.caregiver.serviceCharge')}
                </Text>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[
                    caregiverBookingRequestStyle.subService,
                    {
                      fontFamily: AppStyles.fontFamilyBold,
                      color: AppColors.primaryColor,
                      fontSize: hp(1.5),
                    },
                  ]}
                >
                  {item.item.jobStatus == 'REQUESTED' ? '' : item.item.currencySymbol + ' ' + item.item.charge}
                </Text>
              </View>
              <View style={[caregiverBookingRequestStyle.block2]}>
                <TouchableOpacity
                  onPress={() => this.requestListButtonAction(buttonTxt, item.item)}
                  activeOpacity={buttonTxt === AppStrings.btnTxt.paid ? 1 : 0.8}
                  style={[
                    caregiverBookingRequestStyle.btn,
                    {
                      backgroundColor: buttonTxt === AppStrings.btnTxt.paid ? 'transparent' : AppColors.primaryColor,
                    },
                    {
                      alignItems: buttonTxt === AppStrings.btnTxt.paid ? 'flex-end' : 'center',
                    },
                  ]}
                >
                  <Text
                    style={[
                      caregiverBookingRequestStyle.btnTxt,
                      {
                        color: buttonTxt === AppStrings.btnTxt.paid ? AppColors.primaryColor : AppColors.whiteColor,
                        fontSize: buttonTxt === AppStrings.btnTxt.paid ? hp(1.2) : hp(1.2),
                      },
                    ]}
                  >
                    {buttonTxt}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ElevatedView>
        </TouchableOpacity>
      </View>
    );
  }

  requestListButtonAction(text, item) {
    AppUtils.console('szdcsdg', text, AppStrings.btnTxt.payNow);
    if (text === AppStrings.btnTxt.viewPay) {
      this.setData({ item: item }, AppStrings.btnTxt.viewPay, false);
      //Actions.confirmBooking({upcomingDetail:this.state.upcomingDetail});
    } else if (text === AppStrings.btnTxt.cancel) {
      this.cancelRequest(item);
    } else if (text === AppStrings.btnTxt.extend) {
      this.setState({ orderExtendModal: true, extendData: item });
      !this.state.selectedStartDate || this.state.sDate
        ? this.setState({
            selectedStartDate: moment(item.jobEndTime).add(1, 'day'),
          })
        : null;
    }
  }

  async payNow(item) {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.caregiverJobPay({ jobId: item._id });
      this.setState({ isLoading: false }, () => {
        setTimeout(() => {
          // this.setState({ isLoading: false, orderDetailModal: false });
          AppUtils.console('payment', response);
          if (response.data.status) {
            if (response.data.response.isPayByPayU) {
              let payUData = response.data.response.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

              Actions.PayUPayment({
                paymentDetails: payUData,
                module: 'caregiver',
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: 'caregiver',
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.caregiver,
              });
            } else {
              Actions.OnlinePayment({
                paymentData: response.data.response.payment,
                module: 'caregiver',
              });
            }
          } else {
            AppUtils.console('error', e);
            Alert.alert('', strings('common.caregiver.youCannotPayTryLater'));
          }
          //AppUtils.console("sdzfxcvgffd", response);
        }, 1000);
      });
    } catch (e) {
      this.setState({ isLoading: false });
      Alert.alert('', strings('common.caregiver.youCannotPayTryLater'));
      AppUtils.console('PAY_NOW_CAREGIVER', e);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  pastCard(item) {
    let startDate, startTime, endDate, endTime, jobStatus, buttonTxt;
    startDate = moment(item.item.jobStartTime).format('DD MMM, YYYY');
    startTime = moment(item.item.jobStartTime).format('h:mm A');
    endDate = moment(item.item.jobEndTime).format('DD MMM, YYYY');
    endTime = moment(item.item.jobEndTime).format('h:mm A');

    if (item.item.jobStatus === 'NO_RESPONSE') {
      jobStatus = strings('common.caregiver.noResponse');
    } else {
      jobStatus = item.item.jobStatus;
    }

    AppUtils.console('sdzxcxsdxfv', item);

    if (item.item.jobStatus === 'COMPLETED') {
      buttonTxt = AppStrings.btnTxt.getInvoive;
    } else {
      buttonTxt = '';
    }

    return (
      <View
        style={{
          paddingBottom: hp(2),
          marginTop: item.index === 0 ? hp(2) : hp(0),
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => this.setData(item, buttonTxt, false)}>
          <ElevatedView elevation={5} style={caregiverBookingRequestStyle.card}>
            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {item.item.serviceTypeId.serviceTypeName}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.subService}>
                  {item.item.serviceId.service}
                </Text>
              </View>

              <View style={[caregiverBookingRequestStyle.block2, { marginBottom: hp(1) }]}>
                <Text allowFontScaling={false} numberOfLines={1} style={caregiverBookingRequestStyle.requestStatusTxt}>
                  {jobStatus}
                </Text>
                {item.item.jobStatus === 'REQUESTED' || !item.item.caregiverId ? (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 10 }]}></Text>
                  </View>
                ) : (
                  <View style={caregiverBookingRequestStyle.providerView}>
                    <Image
                      resizeMode={'cover'}
                      style={caregiverBookingRequestStyle.providerImage}
                      source={
                        item.item.acceptedBy
                          ? item.item.acceptedBy.logo
                            ? { uri: item.item.acceptedBy.logo }
                            : images.doctorImage
                          : images.doctorImage
                      }
                    />
                    <Text
                      numberOfLines={1}
                      allowFontScaling={false}
                      style={[
                        caregiverBookingRequestStyle.serviceTxt,
                        {
                          fontSize: 10,
                          marginLeft: wp(1),
                          marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                        },
                      ]}
                    >
                      {item.item.acceptedBy ? item.item.acceptedBy.companyName : 'N/A'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(82) }]} />

            <View style={caregiverBookingRequestStyle.rowView}>
              <View style={caregiverBookingRequestStyle.block1}>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[caregiverBookingRequestStyle.subService, { textAlign: isRTL ? 'left' : 'auto' }]}
                >
                  {strings('string.label.patient_detail')}
                </Text>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12, textAlign: isRTL ? 'left' : 'auto' }]}
                >
                  {item.item.patientDetail.name}, {item.item.patientDetail.age}{' '}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.block3}>
                <Text allowFontScaling={false} numberOfLines={1} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
                  {startDate} - {endDate}
                </Text>
                <Text numberOfLines={1} allowFontScaling={false} style={[caregiverBookingRequestStyle.timeStyle, { fontSize: 12 }]}>
                  {startTime} - {endTime}
                </Text>
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.line, { width: wp(92) }]} />

            <View style={[caregiverBookingRequestStyle.rowView, { height: hp(6) }]}>
              <View
                style={[
                  caregiverBookingRequestStyle.priceBlock,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
                  {strings('string.label.service_charge')}{' '}
                </Text>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[
                    caregiverBookingRequestStyle.subService,
                    { color: AppColors.primaryColor, width: wp(70), textAlign: isRTL ? 'left' : 'auto', marginLeft: isRTL ? wp(2) : null },
                  ]}
                >
                  {item.item.currencySymbol}
                  {item.item.referralId && item.item.paymentStatus === 'successful' ? item.item.paidAmount : item.item.charge}

                  {item.item.refundStatus
                    ? strings('common.caregiver.refundAmount', {
                        currency: item.item.currencySymbol + item.item.refundAmount,
                      })
                    : null}
                </Text>
              </View>
              <View style={[caregiverBookingRequestStyle.block2]}>
                {buttonTxt != AppStrings.btnTxt.getInvoive ? (
                  <View />
                ) : (
                  <TouchableOpacity onPress={() => this.invoiceNote(item.item._id)} activeOpacity={0.8} style={caregiverBookingRequestStyle.btn}>
                    <Text style={[caregiverBookingRequestStyle.btnTxt, { fontSize: hp(1.2) }]}>{strings('string.btnTxt.getInvoive')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ElevatedView>
        </TouchableOpacity>
      </View>
    );
  }

  langData(langData) {
    let text = 'Speaks :';
    langData.map((lang, i) => {
      text = text + ' ' + lang;
      if (langData.length != i + 1) {
        text = text + ',';
      }
    });

    return text;
  }

  renderModalData() {
    AppUtils.console('Details', this.state.upcomingDetail);
    let data = this.state.upcomingDetail.itemData;

    return (
      <ScrollView>
        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.location')}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {this.state.upcomingDetail.location === '' ? '' : AppUtils.getAddress(this.state.upcomingDetail.location)}
              </Text>
            </View>
          </View>
        </View>

        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.looking_for')}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {this.state.upcomingDetail.lookingFor.service}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.state.upcomingDetail.lookingFor.subservice}</Text>
            </View>
          </View>
        </View>

        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.jobDate')}{' '}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {this.state.upcomingDetail.Date.startDate} - {this.state.upcomingDetail.Date.endDate}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                {this.state.upcomingDetail.Date.startTime} - {this.state.upcomingDetail.Date.endTime}
              </Text>
            </View>
          </View>
        </View>

        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.requestDate')}{' '}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {this.state.upcomingDetail.Date.requestDate}{' '}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.state.upcomingDetail.Date.requestTime}</Text>
            </View>
          </View>
        </View>

        {this.state.upcomingDetail.jobStatus === 'CANCEL' || !this.state.upcomingDetail.nurse ? (
          <View style={caregiverBookingRequestStyle.modalListContentView}>
            <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
              <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
                <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {strings('string.label.nurse')} {strings('string.label.preferences')}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
                <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {data.caregiverType}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {data.gender + ', Age: ' + data.agePreferred.minAge + ' - ' + data.agePreferred.maxAge}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.langData(data.languages)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={caregiverBookingRequestStyle.modalListContentView}>
            <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
              <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
                <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {strings('string.label.nurse_detail')}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
                <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {this.state.upcomingDetail.nurse.name}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{'C/O ' + this.state.upcomingDetail.nurse.providerName}</Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {this.state.upcomingDetail.nurse.gender}, Age: {this.state.upcomingDetail.nurse.age}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.langData(this.state.upcomingDetail.nurse.lang)}</Text>
              </View>
            </View>
          </View>
        )}

        {this.state.upcomingDetail.jobStatus === 'CANCEL' || !this.state.upcomingDetail.nurse ? null : (
          <View style={caregiverBookingRequestStyle.modalListContentView}>
            <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
              <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
                <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {strings('string.label.service_provider')}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
                <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {data.acceptedBy ? data.acceptedBy.companyName : 'N/A'}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {data.acceptedBy.zipcode ? data.acceptedBy.companyAddress + ', ' + data.acceptedBy.zipcode : data.acceptedBy.companyAddress}
                </Text>
                <TouchableOpacity
                  onPress={() => this.openDialScreen('+' + data.acceptedBy.countryCode + ' ' + data.acceptedBy.phoneNumber)}
                  style={caregiverBookingRequestStyle.providerSubView}
                >
                  <Image resizeMode={'contain'} style={caregiverBookingRequestStyle.providerImage} source={images.dashboardCall} />
                  <Text
                    style={[
                      caregiverBookingRequestStyle.modalListContentViewSubTxt,
                      {
                        fontSize: 10,
                        marginLeft: wp(1),
                        marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                      },
                    ]}
                  >
                    {'+' + data.acceptedBy.countryCode + ' ' + data.acceptedBy.phoneNumber}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:' + data.acceptedBy.email)}
                  style={caregiverBookingRequestStyle.providerSubView}
                >
                  <Image resizeMode={'contain'} style={caregiverBookingRequestStyle.providerImage} source={images.dashboardMail} />
                  <Text
                    style={[
                      caregiverBookingRequestStyle.modalListContentViewSubTxt,
                      {
                        fontSize: 10,
                        marginLeft: wp(1),
                        marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                      },
                    ]}
                  >
                    {data.acceptedBy.email}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.patient_detail')}{' '}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {this.state.upcomingDetail.Patient.name}, {this.state.upcomingDetail.Patient.age}{' '}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.state.upcomingDetail.Patient.condition}</Text>
            </View>
          </View>
        </View>

        {data.charge > 0 ? (
          <View style={caregiverBookingRequestStyle.modalListContentView}>
            <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
              <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
                <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {strings('string.label.payment_detail')}
                </Text>
              </View>
              <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
                <Text numberOfLines={1} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {data.paymentMethod}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {strings('common.caregiver.amount') + data.currencySymbol + data.charge}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {strings('common.caregiver.paymentStatus') + data.paymentStatus}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={caregiverBookingRequestStyle.modalListContentView}>
          <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
            <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
              <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                {strings('string.label.additional_info')}
              </Text>
            </View>
            <View style={caregiverBookingRequestStyle.modalListContentViewTail}>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{data.additionalInformation}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
  addCoupon(text, item) {
    AppUtils.console('Coupon', item);

    // let productList = this.state.productList;
    // productList[item.index].couponCode = text;
    // productList[item.index].isCoupenApplied = false;
    // this.setState({ productList: productList });
  }

  invoice() {
    return (
      <Modal visible={this.state.isReqInvoice} transparent={true} animationType={'fade'} onRequestClose={() => this.onBackPressInvoice()}>
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
            style={{
              flexDirection: 'column',
              height: hp(25),
              width: wp(80),
              backgroundColor: AppColors.whiteColor,
              borderRadius: moderateScale(10),
              alignSelf: 'center',
              alignItems: 'center',
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
                width: wp(60),
                height: moderateScale(50),
                marginLeft: wp(15),
                marginBottom: hp(1),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: AppColors.blackColor,
                  fontFamily: AppStyles.fontFamilyMedium,
                  flex: 3,
                  fontSize: 15,
                  // marginTop: hp(3),
                  textAlign: 'center',
                  marginRight: wp(7),
                }}
              >
                {strings('string.btnTxt.invoice')}
              </Text>
              <TouchableOpacity onPress={() => this.onBackPressInvoice()}>
                <Image resizeMode={'contain'} style={caregiverBookingRequestStyle.cancelIcon} source={images.cancelIcon} />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: hp(1), marginLeft: wp('5%') }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: wp('70%'),
                  height: hp('4%'),
                  alignSelf: 'center',
                  borderBottomWidth: 1,
                  borderColor: AppColors.primaryColor,
                  borderRadius: 5,
                  padding: 3,
                  backgroundColor: AppColors.whiteColor,
                }}
              >
                <TextInput
                  allowFontScaling={false}
                  style={{
                    paddingTop: 0,
                    paddingBottom: 0,
                    textAlignVertical: 'top',
                  }}
                  underlineColorAndroid="transparent"
                  value={this.state.invoiceMail}
                  placeholder={strings('common.caregiver.enterEmail')}
                  placeholderTextColor="#808080"
                  onChangeText={(mail) => this.setState({ invoiceMail: mail })}
                  numberOfLines={1}
                  multiline={false}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: hp(2) }}>
              <TouchableOpacity
                onPress={() => this.invoiceDownload()}
                style={{
                  height: Platform.OS === 'ios' ? hp(5) : hp(6),
                  width: wp(30),
                  borderWidth: 1,
                  //flexDirection: 'row',
                  justifyContent: 'center',
                  borderColor: AppColors.primaryColor,
                  borderRadius: Platform.OS === 'ios' ? wp(2) : wp(3),
                  alignSelf: 'flex-end',
                  marginTop: hp(2),
                  marginBottom: hp(2),
                  marginLeft: wp(5),
                  backgroundColor: AppColors.primaryColor,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                    marginTop: Platform.OS === 'ios' ? 5 : 0,
                    fontSize: 14,
                  }}
                >
                  {strings('string.btnTxt.send')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        </View>
      </Modal>
    );
  }

  orderDetailModal() {
    let height =
      this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.payNow ||
      this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.cancel ||
      this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.getInvoive
        ? hp(54)
        : hp(65);
    return (
      <Modal
        style={{ justifyContent: 'center', zIndex: 2 }}
        visible={this.state.orderDetailModal}
        onRequestClose={() => this.setState({ orderDetailModal: false })}
        transparent={true}
        key={this.state.orderDetailModal ? 1 : 2}
      >
        <View style={caregiverBookingRequestStyle.orderDetailModal}>
          <TouchableOpacity style={{ width: wp('100'), height: hp('100') }} onPress={() => this.setState({ orderDetailModal: false })}>
            <View />
          </TouchableOpacity>
          <View style={caregiverBookingRequestStyle.modal}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => this.setState({ orderDetailModal: false })}
              style={caregiverBookingRequestStyle.closeIconView}
            >
              <Image style={caregiverBookingRequestStyle.cancelIcon} source={images.cancelIcon} />
            </TouchableOpacity>
            <View style={caregiverBookingRequestStyle.modalView1}>
              <View style={caregiverBookingRequestStyle.innerModalView1}>
                <Text style={caregiverBookingRequestStyle.modalHeadingTxt}>{strings('string.label.request_detail')}</Text>
                {this.state.upcomingDetail.orderId === '' || this.state.upcomingDetail.orderId === null ? (
                  <View />
                ) : (
                  <Text style={caregiverBookingRequestStyle.subHeadingTxt}>
                    {strings('string.label.order_id')}: {this.state.upcomingDetail.orderId}
                  </Text>
                )}
              </View>
            </View>

            <View style={[caregiverBookingRequestStyle.modalView2, { height: hp(40), backgroundColor: AppColors.whiteShadeColor }]}>
              {this.renderModalData()}
            </View>

            {this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.payNow ||
            this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.cancel ||
            this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.getInvoive ? (
              <View style={caregiverBookingRequestStyle.modalView3}>
                {this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.payNow ? (
                  <Text style={caregiverBookingRequestStyle.priceTxt}>
                    {strings('string.label.order_total')}{' '}
                    {this.state.upcomingDetail.itemData.currencySymbol + this.state.upcomingDetail.itemData.charge}
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={() => this.requestListButtonAction(this.state.upcomingDetail.jobStatus, this.state.upcomingDetail.itemData)}
                  style={caregiverBookingRequestStyle.confirmBtn}
                >
                  <Text style={caregiverBookingRequestStyle.confirmBtnTxt}>{this.state.upcomingDetail.jobStatus}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  }

  orderExtendModal() {
    return (
      <Modal
        visible={this.state.orderExtendModal}
        onRequestClose={() => this.setState({ orderExtendModal: false })}
        transparent={true}
        key={this.state.orderExtendModal ? 3 : 4}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <TouchableOpacity
            style={{ width: wp('100'), height: hp('100') }}
            onPress={() => this.setState({ orderExtendModal: false })}
          ></TouchableOpacity>
          <View style={caregiverBookingRequestStyle.modal1}>{this.renderForm(this.state.extendData)}</View>
        </View>
      </Modal>
    );
  }

  renderForm(extendData) {
    return (
      <View style={{ height: hp(100), alignContent: 'center' }}>
        {<View style={caregiverBookingRequestStyle.gapBy} />}

        <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.txtStyle3}>
          {strings('string.label.extend_request')}
        </Text>

        {<View style={caregiverBookingRequestStyle.gapBy} />}
        {this.renderHeadTitle(extendData)}
        {<View style={caregiverBookingRequestStyle.gapBy} />}

        {this.renderHeadDateTime(extendData)}
        {<View style={caregiverBookingRequestStyle.gapBy} />}

        {this.renderSelectDate(extendData)}
        {<View style={caregiverBookingRequestStyle.gapBy} />}
        {this.renderSelectTime(extendData)}
        {<View style={caregiverBookingRequestStyle.gapBy} />}
        <TouchableOpacity
          onPress={() => this.formCheck(extendData)}
          style={[
            caregiverBookingRequestStyle.btn,
            {
              backgroundColor: AppColors.primaryColor,
            },
            {
              alignItems: 'center',
              alignSelf: 'center',
            },
          ]}
        >
          <Text
            style={[
              caregiverBookingRequestStyle.btnTxt,
              {
                color: AppColors.whiteColor,
                fontSize: hp(1.2),
              },
            ]}
          >
            {strings('string.label.send_request')}
          </Text>
        </TouchableOpacity>
        {<View style={caregiverBookingRequestStyle.gapBy} />}

        {/* {this.renderNightStay()} */}
      </View>
    );
  }

  renderHeadTitle(extendData) {
    AppUtils.console('ExtendData', extendData);

    return (
      <View style={caregiverBookingRequestStyle.block1}>
        <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.serviceTxt}>
          {extendData.serviceId.service}
        </Text>
        <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.subService}>
          {extendData.serviceTypeId.serviceTypeName}
        </Text>
      </View>
    );
  }

  renderHeadDateTime(extendData) {
    let startDate = moment(extendData.jobStartTime).format('DD MMM, YYYY');
    let startTime = moment(extendData.jobStartTime).format('h:mm A');
    let endDate = moment(extendData.jobEndTime).format('DD MMM, YYYY');
    let endTime = moment(extendData.jobEndTime).format('h:mm A');

    return (
      <View style={caregiverBookingRequestStyle.block1}>
        <Text allowFontScaling={false} numberOfLines={1} style={[caregiverBookingRequestStyle.serviceTxt, { fontSize: 12 }]}>
          {startDate} - {endDate}
        </Text>
        <Text numberOfLines={1} allowFontScaling={false} style={caregiverBookingRequestStyle.timeStyle}>
          {startTime} - {endTime}
        </Text>
      </View>
    );
  }

  renderSelectDate(extendData) {
    let till = moment(this.state.selectedEndDate).format('DD MMM, YYYY');
    let from = moment(this.state.selectedStartTime).format('hh : mm A');
    AppUtils.console('sdzxcdfg', this.state.eDate);
    return (
      <View style={caregiverBookingRequestStyle.nightStayLine}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.showDateCalender('START_DATE')} style={caregiverBookingRequestStyle.timeBox}>
          {!this.state.selectedStartDate || this.state.sDate ? (
            <Text style={caregiverBookingRequestStyle.txtStyle2}>{strings('string.label.start_date')}</Text>
          ) : (
            <Text>{moment(this.state.selectedStartDate).format('DD MMM, YYYY')}</Text>
          )}
        </TouchableOpacity>
        <Image style={caregiverBookingRequestStyle.leftRightArrowsImage} source={images.leftRightArrows} />

        <TouchableOpacity activeOpacity={0.8} onPress={() => this.showTimeCalender('START_TIME')} style={caregiverBookingRequestStyle.timeBox}>
          {this.state.selectedStartTime === undefined || this.state.sTime ? (
            <Text style={caregiverBookingRequestStyle.txtStyle2}>{strings('string.label.start_time')}</Text>
          ) : (
            <Text>{from}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  renderSelectTime() {
    let till = moment(this.state.selectedEndTime).format('hh : mm A');
    let from = moment(this.state.selectedStartTime).format('hh : mm A');
    AppUtils.console('sdzxcdfg', this.state.eDate);
    return (
      <View style={caregiverBookingRequestStyle.nightStayLine}>
        <TouchableOpacity activeOpacity={0.8} style={caregiverBookingRequestStyle.timeBox}>
          <TextInput
            allowFontScaling={false}
            value={this.state.serviceDays}
            style={[caregiverBookingRequestStyle.timeBox, { padding: 0 }]}
            multiline={true}
            numberOfLines={1}
            maxLength={3}
            keyboardType="numeric"
            onChangeText={(val) => this.setServiceDays(val)}
            placeholder={strings('string.label.days')}
            placeholderTextColor={AppColors.textGray}
          />
        </TouchableOpacity>
        <Image style={caregiverBookingRequestStyle.leftRightArrowsImage} source={images.leftRightArrows} />
        <TextInput
          allowFontScaling={false}
          value={this.state.serviceHours}
          style={[caregiverBookingRequestStyle.timeBox, { padding: 0 }]}
          multiline={true}
          numberOfLines={1}
          keyboardType="numeric"
          maxLength={2}
          onChangeText={(val) => this.setServiceHours(val)}
          placeholder={strings('string.label.hours')}
          placeholderTextColor={AppColors.textGray}
        />
        {/*<TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => this.showDateCalender("END_DATE")}
                          style={careGiverHomeScreenStyle.timeBox}>
                          {
                              (!this.state.selectedEndDate || this.state.eDate) ?
                                  <Text style={careGiverHomeScreenStyle.txtStyle2}>End Date</Text>
                                  :
                                  <Text>{till}</Text>
                          }

                      </TouchableOpacity>*/}
      </View>
    );
  }

  onBackPressInvoice() {
    this.setState({
      isReqInvoice: false,
    });
  }

  async invoiceDownload() {
    let invoiceBody = {
      requestId: this.state.selectedId,
      email: this.state.invoiceMail,
    };
    try {
      this.setState({ isLoading: true, isReqInvoice: false });
      const response = await SHApiConnector.invoiceRequest(this.state.selectedId);
      this.setState({ isLoading: false, isReqInvoice: false });
      AppUtils.console('invoiceResponse', response, this.state.savedEmail, this.state.invoiceMail);
      if (response.data.status) {
        AppUtils.console(
          'xdvcxd1234',
          response,
          this.state.savedEmail,
          this.state.invoiceMail,
          this.state.savedEmail != this.state.invoiceMail,
          this.state.savedEmail === ''
        );
        let message = strings('string.alert.invoice_success');
        setTimeout(() => {
          Alert.alert('', message);
        }, 500);
      } else {
        setTimeout(() => {
          Alert.alert('', strings('string.alert.try_again'));
        }, 500);
      }
    } catch (e) {
      setTimeout(() => {
        Alert.alert('', strings('string.alert.try_again'));
      }, 500);
    }
  }

  invoiceNote(requestId) {
    this.setState({
      isReqInvoice: true,
      selectedId: requestId,
    });
  }

  async formCheck(extendData) {
    let selectedDateTime = new Date(
      moment(this.state.selectedStartDate).format('MM/DD/YYYY') + moment(this.state.selectedStartTime).format(' HH:mm')
    );
    selectedDateTime = moment(selectedDateTime);
    let diff = selectedDateTime.diff(AppUtils.currentDateTime());
    AppUtils.console('zdazsfxgbv', diff / (60 * 60000), Number(diff), this.state.serviceHours);

    if (this.state.sDate === true) {
      this.showAlert(strings('string.label.select_date'));
    } else if (this.state.sTime === true) {
      this.showAlert(strings('string.label.select_time'));
    } else if (diff / (60 * 60000) <= 2) {
      this.showAlert(strings('string.alert.request_limit'));
    } else if (parseInt(this.state.serviceDays) <= 0) {
      this.showAlert(strings('string.alert.days_limit'));
    } else if (parseInt(this.state.serviceHours) <= 0) {
      this.showAlert(strings('string.alert.hour_limit'));
    } else {
      let finalJobStartDate = moment(
        moment(this.state.selectedStartDate).format('MM/DD/YYYY') + moment(this.state.selectedStartTime).format(' HH:mm:00')
      ).format('dddd, MMMM D, YYYY h:mm A');
      let finalJobEndDate = moment(finalJobStartDate).add({
        hours: this.state.serviceHours,
        days: this.state.serviceDays,
      });

      let object = {
        jobId: extendData._id,
        jobStartTime: moment(finalJobStartDate),
        jobEndTime: moment(finalJobEndDate),

        serviceHours: this.state.serviceHours,
        numberOfDays: this.state.serviceDays,
      };

      AppUtils.console('Data', object);
      this.setState({ isLoading: true, orderExtendModal: false });
      try {
        const response = await SHApiConnector.extendRequest(object);
        AppUtils.console('extend detailsss', response);
        if (response.data.status) {
          Toast.show(strings('string.alert.extend_success'));
          this.setState({ isRequest: true, isUpcoming: false }, () => this.getRequest());
        } else {
          this.setState({ isLoading: false });
          this.showAlert(response.data.error_message);

          AppUtils.console('error');
        }
      } catch (e) {
        this.setState({ isLoading: false });

        this.showAlert(e.response.data.error_message);
      }
    }
  }

  cancelRequest(item) {
    AppUtils.console('cancelData', item);
    //alert("",data)
    let infoText = strings('string.alert.cancel_alert');

    setTimeout(() => {
      Alert.alert('', infoText, [
        {
          text: strings('doctor.button.capYes'),
          onPress: () => this.confirmCancel(item._id),
        },
        { text: strings('doctor.button.capNo'), style: 'cancel' },
      ]);
    }, 500);
  }

  async confirmCancel(id) {
    this.setState({ isLoading: true });
    const response = await SHApiConnector.cancelRequest(id);
    this.setState({ isLoading: false, isReqData: false });
    AppUtils.console('cancel detailsss', response);
    if (response.data.status) {
      this.setState(
        {
          isRefreshing: true,
          upcomingRequestPage: 1,
          upcomingRequest: [],
        },
        () => this.getUpcomingRequest()
      );
      this.setState({ isRefreshing: true, requestPage: 1, request: [] }, () => this.getRequest());

      // this.getRequest();

      this.setState({ orderDetailModal: false });
    } else {
      AppUtils.console('error');
    }
  }

  showAlert(msg, ispop) {
    setTimeout(() => {
      AppUtils.showMessage(this, '', msg, strings('doctor.button.ok'), function () {});
    }, 500);
  }

  placeHolder(txt) {
    return (
      <View style={caregiverBookingRequestStyle.placeHolderView}>
        <Image source={images.cancelIcon} style={caregiverBookingRequestStyle.placeHolderImage} />
        <Text style={caregiverBookingRequestStyle.placeHolderTxt}>
          {strings('string.caregiver.no')} {txt}
        </Text>
      </View>
    );
  }

  page() {
    let pastRequest = this.state.pastRequest;
    let upcomingRequest = this.state.upcomingRequest;
    let request = this.state.request;

    AppUtils.console('Request list ', pastRequest.length > 0, pastRequest);
    return (
      <View style={caregiverBookingRequestStyle.pageContainer}>
        {this.state.isUpcoming ? (
          upcomingRequest.length > 0 ? (
            <FlatList
              refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this.onRefreshUpcoming} />}
              style={{
                width: wp(100),
                height: hp(100) - (verticalScale(30) + hp(19)),
              }}
              data={this.state.upcomingRequest}
              extraData={this.state}
              renderItem={(item) => this.upcomingCard(item)}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => this.upcomingFooterLoading()}
            />
          ) : this.state.isLoading ? null : (
            this.placeHolder(strings('string.caregiver.upcomingRequest'))
          )
        ) : this.state.isPast ? (
          pastRequest.length > 0 ? (
            <FlatList
              refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this.onRefreshPast} />}
              style={{
                width: wp(100),
                height: hp(100) - (verticalScale(30) + hp(19)),
              }}
              data={this.state.pastRequest}
              extraData={this.state}
              renderItem={(item) => this.pastCard(item)}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => this.pastFooterLoading()}
            />
          ) : this.state.isLoading ? null : (
            this.placeHolder(strings('string.caregiver.pastRequest'))
          )
        ) : request.length > 0 ? (
          <FlatList
            refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this.onRefreshRequest} />}
            style={{
              width: wp(100),
              height: hp(100) - (verticalScale(30) + hp(19)),
            }}
            data={this.state.request}
            extraData={this.state}
            renderItem={(item) => this.requestCard(item)}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={() => this.requestFooterLoading()}
          />
        ) : this.state.isLoading ? null : (
          this.placeHolder(strings('string.caregiver.request'))
        )}

        {/*
                        this.state.isUpcoming ?
                            upcomingRequest.length > 0 ? this.upcomingCard() : this.placeHolder("Upcoming Request")
                            :
                            pastRequest.length > 0 ? this.pastCard() : this.placeHolder("Past Request")
                    */}
      </View>
    );
  }

  upcomingFooterLoading() {
    this.state.isUpcomingFooterLoading ? this.getUpcomingRequest() : null;
  }

  pastFooterLoading() {
    this.state.isPastFooterLoading ? this.getPastRequest() : null;
  }

  requestFooterLoading() {
    this.state.isRequestFooterLoading ? this.getRequest() : null;
  }

  setServiceHours(val) {
    if (!val || val <= 24) {
      this.setState({ serviceHours: val });
    } else {
      Toast.show(strings('string.alert.alert_hour'));
      this.setState({ serviceHours: this.state.serviceHours });
    }
  }

  setServiceDays(val) {
    AppUtils.console('sdzdfxgcnvh', val);
    if (!val || val > 0) {
      this.setState({ serviceDays: val });
    } else {
      Toast.show(strings('string.alert.alert_day'));
      this.setState({ serviceDays: this.state.serviceDays });
    }
  }

  showDateCalender(startOrEndDate) {
    if (startOrEndDate === 'START_DATE') {
      AppUtils.console('ShowDateCalender::', this.state.showCalender);
      this.setState({
        showCalender: true,
        orderExtendModal: false,
        isSelectedStartDate: true,
        isDate: true,
      });
    } else if (startOrEndDate === 'END_DATE') {
      if (this.state.selectEndDate) {
        let startDate = moment(this.state.selectedStartDate, 'DD.MM.YYYY'); //Date format
        let endDate = moment(this.state.selectedEndDate, 'DD.MM.YYYY');
        let isAfter = moment(startDate).isAfter(endDate);
        this.setState(
          {
            selectedEndDate: isAfter ? this.state.selectedStartDate : this.state.selectedEndDate,
          },
          () =>
            this.setState({
              showCalender: true,
              orderExtendModal: false,
              isSelectedStartDate: false,
              isDate: true,
            })
        );
      } else {
        Toast.show(strings('string.alert.alert_date'));
      }
    }
  }

  showTimeCalender(startOrEndTime) {
    if (startOrEndTime === 'START_TIME') {
      if (this.state.selectStartTime) {
        // let startTime = moment(AppUtils.currentDateTime()).add(2, 'hours');
        // let endTime = moment(AppUtils.currentDateTime()).add(3, 'hours');
        // let roundStartMin = 30 - (startTime.minute() % 30);
        // let roundEndMin = 30 - (endTime.minute() % 30);
        this.setState({
          showCalender: true,
          orderExtendModal: false,
          isSelectedStartTime: true,
          isDate: false,
        });
      } else {
        Toast.show(strings('string.alert.alert_date'));
      }
    } else if (startOrEndTime === 'END_TIME') {
      let startTime = moment(this.state.selectedStartTime); //Date format
      let endTime = moment(this.state.selectedEndTime);
      let isAfter = moment(startTime).isAfter(endTime);

      endTime = isAfter ? startTime : moment(endTime);
      let roundEndMin = 30 - (endTime.minute() % 30);
      if (this.state.selectEndTime) {
        this.setState({
          showCalender: true,
          orderExtendModal: false,
          isSelectedStartTime: false,
          isDate: false,
          selectedEndTime: moment(endTime).add(roundEndMin, 'minutes'),
        });
      } else {
        Toast.show(strings('string.alert.alert_time'));
      }
    }
  }

  closeDateTimeSelector() {
    this.setState({ showCalender: false, orderExtendModal: true });
    if (this.state.isDate) {
      if (this.state.isSelectedStartDate) {
        if (this.state.sDate) {
          this.setState({
            sDate: false,
            selectEndDate: true,
            selectStartTime: true,
          });
        }
      } else {
        if (this.state.eDate) {
          this.setState({
            selectStartTime: true,
            eDate: false,
          });
        }
      }
    } else {
      if (this.state.isSelectedStartTime) {
        if (this.state.sTime) {
          this.setState({
            sTime: false,
            selectEndTime: true,
          });
        }
      } else {
        if (this.state.eTime) {
          this.setState({
            eTime: false,
          });
        }
      }
    }
  }

  openDateTimeSelector() {
    let _dt = !this.state.isDate ? AppUtils.currentDateTime() : moment(this.state.extendData.jobEndTime).add(1, 'day');
    AppUtils.console('dateTimeSelector', moment(this.state.extendData.jobEndTime).add(1, 'day'));
    AppUtils.console('dateTimeSelector_dt', moment(this.state.extendData.jobEndTime).add(2, 'day'));
    AppUtils.console('dateTimeSelector_selectstart', this.state.selectedStartDate);

    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.props.supportedOrientations}
        visible={this.state.showCalender}
        onRequestClose={this.close}
        animationType={this.props.animationType}
        key={this.state.showCalender ? 5 : 6}
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
            <View
              style={{
                height: 40,
                width: width - 30,
                backgroundColor: AppColors.whiteColor,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => this.setState({ showCalender: false, orderExtendModal: true })}>
                <Image resizeMode={'contain'} style={caregiverBookingRequestStyle.cancelIcon} source={images.cancelIcon} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={
                  new Date(
                    this.state.isDate
                      ? this.state.isSelectedStartDate
                        ? this.state.selectedStartDate
                        : this.state.selectedEndDate
                      : this.state.isSelectedStartTime
                      ? this.state.selectedStartTime
                      : this.state.selectedEndTime
                  )
                }
                mode={this.state.isDate ? 'date' : 'time'}
                style={{ backgroundColor: AppColors.whiteColor }}
                minimumDate={_dt}
                display={'spinner'}
                minuteInterval={30}
                onChange={(event, date) => {
                  this.state.isDate
                    ? this.state.isSelectedStartDate
                      ? this.setState({
                          selectedStartDate: date,
                          sDate: false,
                          selectStartTime: true,
                          selectEndDate: true,
                        })
                      : this.setState({
                          selectedEndDate: date,
                          eDate: false,
                          selectStartTime: true,
                        })
                    : this.state.isSelectedStartTime
                    ? this.setState({
                        selectedStartTime: date,
                        sTime: false,
                        selectEndTime: true,
                      })
                    : this.setState({ selectedEndTime: date, eTime: false });
                }}
              />
            ) : // <DatePicker
            //   date={
            //     new Date(
            //       this.state.isDate
            //         ? this.state.isSelectedStartDate
            //           ? this.state.selectedStartDate
            //           : this.state.selectedEndDate
            //         : this.state.isSelectedStartTime
            //         ? this.state.selectedStartTime
            //         : this.state.selectedEndTime
            //     )
            //   }
            //   mode={this.state.isDate ? 'date' : 'time'}
            //   style={{
            //     backgroundColor: AppColors.whiteColor,
            //     width: width - 30,
            //   }}
            //   minuteInterval={30}
            //   minimumDate={_dt}
            //   onDateChange={(date) => {
            //     this.state.isDate
            //       ? this.state.isSelectedStartDate
            //         ? this.setState({
            //             selectedStartDate: date,
            //             sDate: false,
            //             selectEndDate: true,
            //             selectStartTime: true,
            //           })
            //         : this.setState({
            //             selectedEndDate: date,
            //             eDate: false,
            //             selectStartTime: true,
            //           })
            //       : this.state.isSelectedStartTime
            //       ? this.setState({
            //           selectedStartTime: date,
            //           sTime: false,
            //           selectedEndTime: true,
            //         })
            //       : this.setState({ selectedEndTime: date, eTime: false });
            //   }}
            // />
            null}
            <TouchableHighlight
              onPress={() => {
                this.closeDateTimeSelector();
              }}
              underlayColor="transparent"
            >
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
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                  }}
                >
                  {this.state.isDate
                    ? moment
                        .parseZone(this.state.isSelectedStartDate ? this.state.selectedStartDate : this.state.selectedEndDate)
                        .format('MMM DD YYYY')
                    : moment
                        .parseZone(this.state.isSelectedStartTime ? this.state.selectedStartTime : this.state.selectedEndTime)
                        .format('hh : mm A')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <View style={caregiverBookingRequestStyle.container}>
        {this.state.orderDetailModal ? this.orderDetailModal() : null}

        {this.header()}
        {this.invoice()}

        {this.openDateTimeSelector()}

        {this.state.extendData ? this.orderExtendModal() : null}
        {this.page()}

        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

export default caregiverBookingRequestScreen;
