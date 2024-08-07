import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  AppState,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import Toast from 'react-native-simple-toast';
import { Actions } from 'react-native-router-flux';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import ElevatedView from 'react-native-elevated-view';
import { AppUtils } from '../../utils/AppUtils';
import { AppStyles } from '../../shared/AppStyles';
import { SHApiConnector } from '../../network/SHApiConnector';
import moment from 'moment';
import ProgressLoader from 'rn-progress-loader';
import CheckBox from 'react-native-check-box';
import { AppStrings } from '../../shared/AppStrings';

import { Validator } from '../../shared/Validator';
import { strings } from '../../locales/i18n';
import DriverTrackingWidget from '../../components/DriverTrackingWidget';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

class MyWagonBooking extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker('Medical Transport Booking Screen');
    this.state = {
      isUpComing: true,
      isPast: false,
      bookingList: [],
      isLoading: false,
      isDataVisible: false,
      emptyText: '',
      isRefreshing: false,
      isEmpty: false,
      noDataMessage: '',
      savedEmail: '',
      page: 1,
      isReqData: false,
      isReqInvoice: false,
      isReqPay: false,
      invoiceMail: '',
      isFooterLoading: false,
      selectedId: '',
      modalData: {
        driverId: {},
        vehicleId: {},
      },
      appState: AppState.currentState,
      planPrice: 0,
      planPriceWithDiscount: 0,
      discountPrice: 0,
      isCouponApplied: false,
      applyCoupon: '',
      driverLiveCoordinates: [],
      visibleTrackModal: false,
      tripID: '',
      trackPickupLocation: '',
      trackDropLocation: '',
      driverID: '',
    };

    this.getUpcomingDetails = this.getUpcomingDetails.bind(this);
    this.getPastDetails = this.getPastDetails.bind(this);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (this.state.isUpComing) {
        this.setState({ isLoading: true });
        this.getUpcomingDetails();
      } else {
        this.setState({ isLoading: true });
        this.getPastDetails();
      }
    }
    this.setState({ appState: nextAppState });
  };

  async componentDidMount() {
    const { isWagonBookingUpdated } = this.props;
    if (isWagonBookingUpdated) {
      this.setState({ isLoading: false });
    }
    this.upcoming();
    AppState.addEventListener('change', this._handleAppStateChange);

    const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
    AppUtils.console('xdcszxffd', userDetails);
    if (userDetails.email) {
      this.setState({
        invoiceMail: userDetails.email,
        savedEmail: userDetails.email,
      });
    }
    AppUtils.console('dxfcszfx', userDetails);

    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }

  componentDidUpdate(prevProps) {
    const { isWagonBookingUpdated } = this.props;
    const { isWagonBookingUpdated: prevIsWagonBookingUpdated } = prevProps;
    if (isWagonBookingUpdated && isWagonBookingUpdated !== prevIsWagonBookingUpdated) {
      this.setState({ isLoading: false });
    }
  }


  upcoming() {
    this.setState(
      {
        isUpComing: true,
        isPast: false,
        isEmpty: false,
        page: 1,
        modalData: { driverId: {}, vehicleId: {} },
        bookingList: [],
      },
      () => {
        this.getUpcomingDetails();
      }
    );
  }

  passed() {
    this.setState(
      {
        isUpComing: false,
        isPast: true,
        isEmpty: false,
        page: 1,
        modalData: { driverId: {}, vehicleId: {} },
        bookingList: [],
      },
      () => {
        this.getPastDetails();
      }
    );
  }

  goBack() {
    Actions.MyCareWagonDash();
  }

  cancelTrip(bookingData) {
    let cancelDetails = { bookingId: bookingData._id };
    let infoText = strings('common.transport.sureWantToCancel');
    let timeDiff = AppUtils.isTimeDiffMoreThenThreeHours(bookingData.bookingTime);
    if ((bookingData.bookingType == 'BOOK_LATER' && timeDiff) || bookingData.bookingType == 'BOOK_NOW') {
      infoText = strings('common.transport.cancellationCharge', {
        charge: 'S$50',
      });
    }
    setTimeout(() => {
      Alert.alert('', infoText, [
        {
          text: strings('doctor.button.capYes'),
          onPress: () => this.confirmCancel(cancelDetails, bookingData),
        },
        { text: strings('doctor.button.capNo'), style: 'cancel' },
      ]);
    }, 500);
  }

  async confirmCancel(cancelDetails, item) {
    this.setState({ isLoading: true });
    const response = await SHApiConnector.cancelTrip(cancelDetails);
    this.setState({ isLoading: false, isReqData: false });
    AppUtils.console('cancel detailsss', response);
    if (response.data.status) {
      if (item.paymentMethod == 'CARD' && item.paymentStatus == 'successful') {
        Alert.alert('', strings('common.transport.cancellationAccepted'), [{ text: strings('doctor.button.ok'), onPress: () => this.passed() }]);
      } else {
        this.passed();
      }
    } else {
      AppUtils.console('error');
    }
  }

  async paymentAction(bookingId) {
    let couponCodeApplied = this.state.applyCoupon == '' ? null : this.state.applyCoupon;
    let payment = { bookingId: bookingId, referralCode: couponCodeApplied };
    this.setState({ isReqPay: false });
    try {
      const response = await SHApiConnector.payment(payment);
      console.log('wagone payment chek', response);
      this.setState({ isLoading: false, isReqData: false }, () => {
        setTimeout(() => {
          if (response.status === 200) {
            if (response.data.isPayByPayU) {
              let payUData = response.data.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

              Actions.PayUPayment({
                paymentDetails: payUData,
                module: 'transport',
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: 'transport',
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: 'transport',
              });
            } else {
              Actions.OnlinePayment({
                paymentData: response.data,
                bookingId: 'transport',
              });
            }
          } else {
            AppUtils.console('error');
            Alert.alert('', strings('common.transport.cannotPayForTrip'));
          }
        }, 500);
      });
    } catch (e) {
      AppUtils.console('error', e);
      this.setState({ isLoading: false, isReqData: false });
      Alert.alert('', strings('common.transport.cannotPayForTrip'));
    } finally {
      this.setState({ isLoading: false, isReqData: false });
    }
  }
  validateEmail() {
    if (!Validator.validateEmail(this.state.invoiceMail)) {
      alert(strings('common.common.enterCorrectEmail'));
    } else {
      this.invoiceDownload();
    }
  }

  async invoiceDownload() {
    let invoiceBody = {
      bookingId: this.state.selectedId,
      email: this.state.invoiceMail,
    };
    try {
      this.setState({ isLoading: true, isReqInvoice: false });
      const response = await SHApiConnector.invoice(invoiceBody);
      this.setState({ isLoading: false, isReqInvoice: false });
      AppUtils.console('xdvcxd', response, this.state.savedEmail, this.state.invoiceMail);
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
        if (this.state.savedEmail === '') {
          message = strings('common.transport.invoiceSentToMail');
          setTimeout(() => {
            Alert.alert('', message, [
              {
                text: strings('doctor.button.yes'),
                onPress: () => this.updateEmail('YES'),
              },
              {
                text: strings('doctor.button.no'),
                onPress: () => this.updateEmail('NO'),
              },
            ]);
          }, 500);
        } else if (this.state.savedEmail != this.state.invoiceMail) {
          message = strings('common.transport.invoiceSentToMailUpdateMail');
          setTimeout(() => {
            Alert.alert('', message, [
              {
                text: strings('doctor.button.yes'),
                onPress: () => this.updateEmail('YES'),
              },
              {
                text: strings('doctor.button.no'),
                onPress: () => this.updateEmail('NO'),
              },
            ]);
          }, 500);
        } else {
          setTimeout(() => {
            Alert.alert('', message);
          }, 500);
        }
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

  onChangedText(number) {
    AppUtils.console('appp-->' + number);
    this.setState({ applyCoupon: number });
  }

  removeCoupon() {
    this.setState({
      discountPrice: 0,
      planPriceWithDiscount: this.state.modalData.tripFare,
      isCouponApplied: false,
      applyCoupon: '',
    });
  }

  async applyCoupon() {
    if (!this.state.applyCoupon) {
      Toast.show(strings('doctor.text.pleaseEnterCouponCode'));
    } else {
      this.setState({ isLoading: true });
      let coupenDetails = {
        referralCode: this.state.applyCoupon,
        module: AppStrings.label.MEDICAL_TRANSPORT,
      };

      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        console.log('CheckCouponData', response);
        let discount = 0;
        let total = 0;
        this.setState({ isLoading: false });
        let fare = this.state.modalData.tripFare;
        if (response.data.status) {
          AppUtils.console('www' + this.state.modalData.tripFare);

          if (response.data.response.valueType === 'PERCENT') {
            let offerVal = (response.data.response.couponValue * fare) / 100;

            this.setState(
              {
                planPriceWithDiscount: fare - offerVal,
                discountPrice: offerVal,
                isCouponApplied: true,
              },
              () => {
                setTimeout(() => {
                  Toast.show(strings('doctor.text.couponAppliedSuccess'));
                }, 500);
              }
            );
          } else {
            let planPrice = response.data.response.couponValue >= fare ? 1 : fare - response.data.response.couponValue;
            let discountPrice = response.data.response.couponValue >= fare ? fare - 1 : response.data.response.couponValue;
            this.setState(
              {
                planPriceWithDiscount: planPrice,
                discountPrice: discountPrice,
                isCouponApplied: true,
              },
              () => {
                setTimeout(() => {
                  Toast.show(strings('doctor.text.couponAppliedSuccess'));
                }, 500);
              }
            );
          }
        } else {
          Toast.show(response.data.error_message);
          this.setState({ applyCoupon: '' });
        }
      } catch (e) {
        //AppUtils.console("VERIFY_OFFER_ERROR", e)
      }
    }
  }

  async updateEmail(isYesOrNo) {
    if (isYesOrNo === 'YES') {
      try {
        let response = await SHApiConnector.updateEmail({
          email: this.state.invoiceMail,
        });
        AppUtils.console('dzfxczsfx', response);
        if (response.data.status) {
          await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.response));
          this.setState({
            invoiceMail: response.data.response.email,
            savedEmail: response.data.response.email,
          });
        }
      } catch (e) {
        AppUtils.console('UPDATE_EMAIL_ERROR', e);
      }
    } else {
      this.setState({
        invoiceMail: this.state.savedEmail,
        isReqInvoice: false,
      });
    }
  }

  async getUpcomingDetails(isRefresh) {
    let page_num = { page: this.state.page };
    if (this.state.isRefreshing) {
      this.setState({
        isLoading:true
      })
    }
    else{
      this.setState({
        isLoading:false
      })
    }
    // this.setState({ isLoading: tempRefreshing ? false : true });
    AppUtils.console('page no.', page_num);
    const response = await SHApiConnector.getUpcomingDetails(page_num);
    this.setState({ isLoading: false, isRefreshing: false });
    AppUtils.console('upcoming details', response);
    if (response.data.status) {
      AppUtils.console('response status', response);
      if (response.data.data.length == 0) {
        if (this.state.page == 1) {
          this.setState({
            isEmpty: true,
            bookingList: [],
            noDataMessage: strings('common.transport.noUpcomingBooking'),
          });
        } else {
          this.setState({ isFooterLoading: false });
        }
      } else {
        AppUtils.console('array length', response.data.data);
        if (response.data.data.length < 10 || this.state.page >= 10) {
          this.setState({ isFooterLoading: false });
        } else {
          this.setState({ isFooterLoading: true });
        }
        if (this.state.page == 1) {
          this.setState({
            bookingList: response.data.data,
            isRefreshing: false,
            page: this.state.page + 1,
            isDataVisible: true,
          });
        } else {
          this.setState({
            bookingList: [...this.state.bookingList, ...response.data.data],
            page: this.state.page + 1,
            isDataVisible: true,
          });
        }
      }
    } else {
      AppUtils.console('error');
    }
  }

  refreshBookingList = () => {
    AppUtils.console('sdgedrf');
    let self = this;
    self.setState({ isRefreshing: true, page: 1 }, () => {
      self.seeMore(true);
    });
  };

  async getPastDetails(isRefresh) {
    let page_past = { page: this.state.page, paymentBy: null };
    this.setState({ isLoading: this.state.isRefreshing ? false : true });
    AppUtils.console('page', page_past);
    const response = await SHApiConnector.getPastDetails(page_past);
    this.setState({ isLoading: false, isRefreshing: false });
    AppUtils.console('past details', response);
    if (response.data.status) {
      AppUtils.console('past response', response);
      if (response.data.data.length == 0) {
        if (this.state.page == 1) {
          this.setState({
            isEmpty: true,
            bookingList: [],
            noDataMessage: strings('common.transport.noPastBooking'),
          });
        } else {
          this.setState({ isFooterLoading: false });
        }
        AppUtils.console('past array length', response.data.data.length);
      } else {
        AppUtils.console('past data', response.data.data);
        if (response.data.data.length < 10 || this.state.page >= 10) {
          this.setState({ isFooterLoading: false });
        } else {
          this.setState({ isFooterLoading: true });
        }
        if (this.state.page == 1) {
          this.setState({
            bookingList: response.data.data,
            isRefreshing: false,
            page: this.state.page + 1,
            isDataVisible: true,
          });
        } else {
          AppUtils.console('listtt', response.data.data);
          this.setState({
            bookingList: [...this.state.bookingList, ...response.data.data],
            page: this.state.page + 1,
            isDataVisible: true,
          });
        }
      }
    } else {
      AppUtils.console('error');
    }
  }

  render_footer() {
    return (
      <ElevatedView style={{ marginTop: 20 }} elevation={10}>
        {this.state.isFooterLoading && !this.state.isLoading && this.state.bookingList.length > 0 ? (
          <View
            style={{
              backgroundColor: AppColors.white,
              height: verticalScale(40),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              width: width,
            }}
            onPress={() => this.seeMore(false)}
          >
            <TouchableHighlight
              style={{ backgroundColor: AppColors.colorPrimary, width: width }}
              onPress={() => this.seeMore(false)}
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

  closeModal = () => {
    this.setState({ visibleTrackModal: false });
  };

  seeMore(isRefreshing) {
    if (this.state.isUpComing) {
      this.getUpcomingDetails(isRefreshing);
    } else {
      this.getPastDetails(isRefreshing);
    }
  }

  render() {
    AppUtils.console('gggg', this.state.page);

    let upcomingColor = this.state.isUpComing ? AppColors.primaryColor : AppColors.whiteColor;
    let upcomingTextColor = this.state.isUpComing ? AppColors.whiteColor : AppColors.blackColor;
    let pastColor = this.state.isPast ? AppColors.primaryColor : AppColors.whiteColor;
    let pastTextColor = this.state.isPast ? AppColors.whiteColor : AppColors.blackColor;
    const { visibleTrackModal, tripID, trackPickupLocation, trackDropLocation, driverID } = this.state;

    return (
      <View style={{ backgroundColor: AppColors.backgroundGray, flex: 1 }}>
        <View style={styles.mainContainer}>
          <TouchableHighlight
            style={{
              borderBottomLeftRadius: moderateScale(20),
              borderTopLeftRadius: moderateScale(20),
              height: verticalScale(40),
              width: width / 2.5,
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderRightWidth: 0,
              borderLeftWidth: 2,
              borderColor: AppColors.primaryColor,
              backgroundColor: upcomingColor,
              alignContent: 'center',
              justifyContent: 'center',
            }}
            underlayColor={AppColors.primaryColor}
            onPress={() => {
              this.upcoming();
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                alignSelf: 'center',
                color: upcomingTextColor,
                fontSize: 16,
              }}
            >
              {strings('doctor.button.upcoming')}
            </Text>
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
              width: width / 2.5,
              alignContent: 'center',
              justifyContent: 'center',
            }}
            underlayColor={AppColors.primaryColor}
            onPress={() => {
              this.passed();
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                alignSelf: 'center',
                color: pastTextColor,
                fontSize: 16,
              }}
            >
              {strings('doctor.button.past')}
            </Text>
          </TouchableHighlight>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FlatList
            style={{ marginBottom: hp(8) }}
            data={this.state.bookingList}
            ref={(r) => (this.refs = r)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(item) => this._render_booking(item)}
            extraData={this.state}
            onViewableItemsChanged={this.onViewableItemsChanged}
            refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this.refreshBookingList} />}
            ListFooterComponent={this.render_footer()}
          />
        </ScrollView>
        {this.state.isEmpty ? (
          <View
            style={{
              width: width,
              height: height - 400,
              marginRight: moderateScale(5),
              marginLeft: moderateScale(5),
              justifyContent: 'center',
              alignItem: 'center',
              alignSelf: 'center',
            }}
          >
            <Image source={require('../../../assets/images/cancel.png')} style={styles.cancelIcon} />
            <Text allowFontScaling={false} style={styles.emptyMessage}>
              {this.state.noDataMessage}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {this.bookingDetails()}
        {this.state.isPast ? this.invoice() : <View />}
        {this.state.isUpComing ? this.doPayment() : <View />}
        {driverID != '' ? (
          <DriverTrackingWidget
            tripId={tripID}
            driverId={driverID}
            visible={visibleTrackModal}
            closeModal={this.closeModal}
            pickUp={trackPickupLocation}
            drop={trackDropLocation}
          />
        ) : (
          <></>
        )}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }

  _render_booking(item) {
    const { driverLiveCoordinates } = this.state;
    console.log('driverLiveCoordinates', driverLiveCoordinates);
    let isButtonVisible = !(this.state.isPast || (this.state.isUpComing && item.item.bookingStatus == 'ON_GOING'));
    let status = !isButtonVisible ? (this.state.isUpComing ? 'Running' : item.item.status) : 'Not Live';
    if (this.state.isPast) {
      status = item.item.bookingStatus;
    } else {
      if (item.item.bookingStatus == 'ON_GOING') {
        status = 'RUNNING';
      } else {
        status = 'SCHEDULED';
      }
    }
    let paymentStatus =
      item.item.paymentMethod == 'CARD'
        ? item.item.paymentStatus == 'PENDING'
          ? 'Pending'
          : item.item.paymentStatus == 'successful'
          ? 'Paid'
          : item.item.paymentStatus
        : item.item.paymentStatus;
    let paymentType = item.item.paymentMethod == 'CARD' ? (item.item.paymentStatus == 'successful' ? 'CARD' : 'PAY') : 'CASH';

    let fare = item.item.tripFare;
    return (
      <TouchableOpacity onPress={() => this.onModalDataPress(item)}>
        <ElevatedView style={styles.elevatedModel}>
          <View
            style={{
              flex: 3,
              borderBottomWidth: 0,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              style={{ height: 40, flex: 2 }}
              resizeMode={'contain'}
              source={item.item.logo ? item.item.logo : require('../../../assets/images/circuler_ambulance.png')}
            />
            <View style={{ flex: 5 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 12,
                  color: AppColors.blackColor,
                  textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {moment(item.item.bookingTime).format('MMM Do, YYYY hh:mm A')}
              </Text>
              <Text allowFontScaling={false} style={{ color: AppColors.textGray, fontSize: 12 ,textAlign: isRTL ? 'left' : 'auto',}} numberOfLines={1}>
                {strings('common.transport.pickUp')} :{item.item.pickupLocation}
              </Text>
              <Text allowFontScaling={false} style={{ color: AppColors.textGray, fontSize: 12, textAlign: isRTL ? 'left' : 'auto', }} numberOfLines={1}>
                {strings('common.transport.drop')} : {item.item.dropLocation}
              </Text>
              {item.item.paymentMethod === 'CARD' ? (
                <Text allowFontScaling={false} style={{ color: AppColors.primaryColor, fontSize: 12 ,textAlign: isRTL ? 'left' : 'auto',}} numberOfLines={1}>
                  {strings('common.transport.paymentStatus')} : {paymentStatus}
                </Text>
              ) : (
                <View />
              )}
            </View>
            <TouchableOpacity
              onPress={() => this.onPressPay(item)}
              style={{
                flex: 1,
                alignItems: 'center',
                marginRight: wp('2%'),
                marginLeft: wp(2),
              }}
            >
              <View style={styles.fareText}>
                <Text allowFontScaling={false} style={{ color: AppColors.whiteColor, fontSize: 10 }}>
                  {item.item.currencySymbol}
                </Text>
                <Text allowFontScaling={false} style={{ color: AppColors.whiteColor, fontSize: 10 }}>
                  {fare}
                </Text>
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  color: AppColors.primaryColor,
                  marginTop: hp('1%'),
                  fontSize: 10,
                }}
              >
                {paymentType}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.driverDetails} />
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: wp(2),
            }}
          >
            <Image style={{ height: 40, flex: 2 }} resizeMode={'contain'} source={require('../../../assets/images/wagon_user.png')} />
            <View style={{ flex: 3 }}>
              <Text allowFontScaling={false} style={{ fontSize: 12, color: AppColors.blackColor }} numberOfLines={1}>
                {item?.item?.driverId?.driverName}
              </Text>
              <Text allowFontScaling={false} style={{ fontSize: 10, color: AppColors.textGray }} numberOfLines={1}>
                {item?.item?.vehicleId?.vehicleNumber}
              </Text>
            </View>
            <View style={{ flex: 2, marginRight: wp(13) }}>
              {this.state.isPast && item.item.bookingStatus == 'COMPLETED' ? (
                <TouchableHighlight underlayColor="transparent" onPress={() => this.invoiceNote(item.item._id)} style={styles.cancelData}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: AppColors.primaryColor,
                      alignSelf: 'center',
                      fontSize: 12,
                      fontFamily: AppStyles.fontFamilyBold,
                    }}
                  >
                    {strings('string.btnTxt.invoice')}
                  </Text>
                </TouchableHighlight>
              ) : (
                <View />
              )}
            </View>
            <View
              style={{
                flex: 3,
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: wp(3),
              }}
            >
              {/* {isButtonVisible && item.item.paymentStatus == "successful" ? ( */}
              {isButtonVisible && item.item.paymentStatus == 'successful' && item.item.bookingStatus !== 'COMPLETED' ? (
                <>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableHighlight
                      underlayColor="transparent"
                      style={styles.cancelData}
                      onPress={() =>
                        this.setState({
                          visibleTrackModal: true,
                          tripID: item.item._id,
                          driverID: item.item.driverId._id,
                          trackPickupLocation: item.item.pickupLocation,
                          trackDropLocation: item.item.dropLocation,
                        })
                      }
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: AppColors.primaryColor,
                          alignSelf: 'center',
                          fontSize: 12,
                        }}
                      >
                        Track
                      </Text>
                    </TouchableHighlight>
                    {/* <TouchableHighlight
                      underlayColor="transparent"
                      style={[styles.cancelData, { marginLeft: 5 }]}
                      onPress={() => this.cancelTrip(item.item)}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: AppColors.primaryColor,
                          alignSelf: "center",
                          fontSize: 12,
                        }}
                      >
                        {strings("common.transport.cancelTrip")}
                      </Text>
                    </TouchableHighlight> */}
                  </View>
                </>
              ) : (
                <View style={styles.vehicleStatus}>
                  <Text allowFontScaling={false} style={styles.tripStatus}>
                    {status}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ElevatedView>
      </TouchableOpacity>
    );
  }

  makePayment() {}

  onModalDataPress(item) {
    AppUtils.console('booking data', item);
    let self = this;
    self.setState({
      modalData: item.item,
      isReqData: true,
      planPriceWithDiscount: item.item.tripFare,
    });
  }

  invoiceNote(bookingId) {
    this.setState({
      isReqInvoice: true,
      selectedId: bookingId,
    });
  }

  onBackPressInvoice() {
    this.setState({
      isReqInvoice: false,
    });
  }

  onPressPay(item) {
    AppUtils.console('data', item, this.state);
    if (item.item.paymentMethod == 'CARD' && item.item.paymentStatus != 'successful') {
      this.setState({
        isReqPay: true,
        modalData: item.item,
        planPriceWithDiscount: item.item.tripFare,
        isCouponApplied: false,
        applyCoupon: '',
        discountPrice: 0,
      });
    }
  }

  onBackPressPayment() {
    this.setState({
      isReqPay: false,
    });
  }

  doPayment() {
    let userName =
      this.state.modalData && this.state.modalData.requestedBy && this.state.modalData.requestedBy.relativeDetails.length > 0
        ? this.state.modalData.requestedBy.relativeDetails[0].firstName + ' ' + this.state.modalData.requestedBy.relativeDetails[0].lastName
        : 'NA';
    let phoneNumber = this.state.modalData && this.state.modalData.requestedBy ? `+${this.state.modalData.requestedBy.countryCode}-` + this.state.modalData.requestedBy.phoneNumber : 'NA';



    console.log(this.state.modalData,"modalData")


    return (
      <Modal
        visible={this.state.isReqPay}
        data={this.state.modalData}
        transparent={true}
        animationType={'fade'}
        onRequestClose={() => this.onBackPressPayment()}
      >
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
              width: wp(90),
              backgroundColor: AppColors.whiteColor,
              borderRadius: moderateScale(10),
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
                width: wp(72),
                height: moderateScale(50),
                marginLeft: wp(15),
                marginBottom: hp(1),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: AppColors.blackColor,
                  fontFamily: AppStyles.fontFamilyBold,
                  flex: 3,
                  fontSize: 17,
                  // marginTop: hp(3),
                  textAlign: 'center',
                  marginRight: wp(9),
                }}
              >
                {strings('common.transport.paymentDetails')}
              </Text>
              <TouchableOpacity
                style={{
                  marginBottom: hp(2),
                  marginLeft: wp(3),
                  alignSelf: 'center',
                }}
                onPress={() => this.onBackPressPayment()}
              >
                <Image
                  source={require('../../../assets/images/cancel.png')}
                  style={{
                    height: verticalScale(25),
                    width: verticalScale(25),
                    alignSelf: 'center',
                  }}
                ></Image>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: hp(1), alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: wp(70),
                }}
              >
                <Text allowFontScaling={false} style={[styles.popupDetails, , { width: wp(18) }]}>
                  {strings('common.transport.name')}
                </Text>
                <Text allowFontScaling={false} style={[styles.popupHashTag, , { width: wp(5) }]}>
                  :
                </Text>
                <Text allowFontScaling={false} style={[styles.driver, , { width: wp(55),textAlign: isRTL ? 'left' : 'auto', }]}>
                  {userName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('1%'),
                  width: wp(70),
                  alignItems: 'center',
                }}
              >
                <Text allowFontScaling={false} style={[styles.popupDetails, { width: wp(18) }]}>
                  {strings('common.transport.number')}
                </Text>
                <Text allowFontScaling={false} style={[styles.popupHashTag, { width: wp(5) }]}>
                  :
                </Text>
                <Text allowFontScaling={false} style={[styles.driver, { width: wp(55), textAlign: isRTL ? 'left' : 'auto', }]}>
                  {phoneNumber}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('1%'),
                  width: wp(70),
                  alignItems: 'center',
                }}
              >
                <Text allowFontScaling={false} style={[styles.popupDetails, { width: wp(18) }]}>
                  {strings('common.transport.amount')}
                </Text>
                <Text allowFontScaling={false} style={[styles.popupHashTag, { width: wp(5) }]}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.driver,
                    {
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: 15,
                      width: wp(55),
                      textAlign: isRTL ? 'left' : 'auto',
                    },
                  ]}
                >
                  {this.state.modalData.currencySymbol + '' + this.state.modalData.tripFare}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('1%'),
                  width: wp(70),
                  alignItems: 'center',
                }}
              >
                <Text allowFontScaling={false} style={[styles.popupDetails, { width: wp(18) }]}>
                  {strings('doctor.button.discount')}
                </Text>
                <Text allowFontScaling={false} style={[styles.popupHashTag, { width: wp(5) }]}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.driver,
                    {
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: 15,
                      width: wp(55),
                      textAlign: isRTL ? 'left' : 'auto',
                    },
                  ]}
                >
                  {this.state.modalData.currencySymbol + '' + this.state.discountPrice}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('1%'),
                  width: wp(70),
                  alignItems: 'center',
                }}
              >
                <Text allowFontScaling={false} style={[styles.popupDetails, { width: wp(18) }]}>
                  {strings('common.caregiver.total')}
                </Text>
                <Text allowFontScaling={false} style={[styles.popupHashTag, { width: wp(5) }]}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.driver,
                    {
                      color: AppColors.blackColor,
                      fontFamily: AppStyles.fontFamilyBold,
                      fontSize: 15,
                      width: wp(55),
                      textAlign: isRTL ? 'left' : 'auto',
                    },
                  ]}
                >
                  {this.state.modalData.currencySymbol + '' + this.state.planPriceWithDiscount}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: wp(90),
                height: hp(8),
                marginLeft: wp(6),
                marginTop: hp(2),
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  margin: hp(0.5),
                  marginBottom: hp(2),
                }}
              >
                <Image
                  resizeMode="contain"
                  style={{
                    marginRight: wp(2),
                    height: hp(4),
                    width: wp(6),
                  }}
                  source={require('../../../assets/images/discount_1.png')}
                />
                <View
                  style={{
                    height: hp(4),
                    borderWidth: hp(0.2),
                    borderColor: AppColors.backgroundGray,
                    borderRadius: wp(2),
                    width: wp(44),
                    justifyContent: 'center',
                    backgroundColor: AppColors.whiteShadeColor,
                  }}
                >
                  <TextInput
                    allowFontScaling={false}
                    placeholder={strings('doctor.text.enterCouponCode')}
                    value={this.state.applyCoupon}
                    editable={!this.state.isCouponApplied}
                    placeholderTextColor={AppColors.textGray}
                    onChangeText={(text) => this.onChangedText(text)}
                    style={{
                      marginLeft: wp(1),
                      height: hp('5'),
                      fontSize: hp(1.8),
                      color: AppColors.textGray,
                      padding: hp('1'),
                    }}
                  />
                </View>

                {!this.state.isCouponApplied ? (
                  <TouchableOpacity
                    onPress={() => this.applyCoupon()}
                    style={{
                      height: hp(4),
                      marginLeft: wp(5),
                      borderRadius: wp(2),
                      width: wp(22),
                      justifyContent: 'center',
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
                    onPress={() => this.removeCoupon()}
                    style={{
                      height: hp(4),
                      marginLeft: wp(5),
                      borderRadius: wp(2),
                      width: wp(22),
                      justifyContent: 'center',
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

            <View
              style={{
                flexDirection: 'row',
                marginTop: hp(1),
                marginBottom: hp(0.5),
              }}
            >
              <TouchableOpacity
                onPress={() => this.paymentAction(this.state.modalData._id)}
                style={[
                  styles.cancelTripPopup,
                  {
                    marginLeft: 0,
                    backgroundColor: AppColors.primaryColor,
                  },
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: AppColors.whiteColor,
                    alignSelf: 'center',
                    marginTop: Platform.OS === 'ios' ? 5 : 0,
                    fontSize: 13,
                    fontFamily: AppStyles.fontFamilyMedium,
                  }}
                >
                  {strings('common.transport.pay')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
                {strings('doctor.button.invoice')}
              </Text>
              <TouchableOpacity style={{ flex: 0.3, marginBottom: hp(4) }} onPress={() => this.onBackPressInvoice()}>
                <Image
                  source={require('../../../assets/images/cancel.png')}
                  style={{
                    height: verticalScale(17),
                    width: verticalScale(17),
                    //tintColor: AppColors.blackColor,
                  }}
                ></Image>
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
                  onChangeText={this.invoiceMailChange}
                  numberOfLines={1}
                  multiline={false}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: hp(2) }}>
              <TouchableOpacity onPress={() => this.validateEmail()} style={[styles.cancelTripPopup, { backgroundColor: AppColors.primaryColor }]}>
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
                  {strings('common.transport.send')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        </View>
      </Modal>
    );
  }

  invoiceMailChange = (mail) => {
    this.setState({ invoiceMail: mail });
  };

  bookingDetails() {
    AppUtils.console('booking details', this.state.modalData);
    let status = this.state.modalData.bookingStatus == 'ON_GOING' ? 'RUNNING' : this.state.modalData.bookingStatus;
    let paymentStatus =
      this.state.modalData.paymentMethod == 'CARD'
        ? this.state.modalData.paymentStatus == 'PENDING'
          ? 'Pending'
          : this.state.modalData.paymentStatus == 'successful'
          ? 'Paid'
          : this.state.modalData.paymentStatus
        : this.state.modalData.paymentStatus;

    return (
      <Modal
        visible={this.state.isReqData}
        data={this.state.modalData}
        transparent={true}
        animationType={'fade'}
        onRequestClose={() => this.onBackPress()}
      >
        <View style={styles.popupDesign}>
          <View style={styles.modalScrollContainer}>
            <View style={{ alignSelf: 'flex-end' }}>
              <TouchableOpacity onPress={() => this.onBackPress()}>
                <Image source={require('../../../assets/images/cancel.png')} style={styles.closeIcon}></Image>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContainerRes}>
              <View>
                <Image resizeMode={'contain'} style={styles.wagon} source={require('../../../assets/images/circuler_ambulance.png')} />
              </View>
              <View style={{ marginLeft: wp('5%'), marginRight: wp('5%') }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.send')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { width: wp(65) }]}>
                    {moment(this.state.modalData.bookingTime).format('MMM Do, YYYY hh:mm A')}
                  </Text>
                </View>

                {this.state.modalData.tripType == 'SINGLE' ? (
                  <View />
                ) : (
                  <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                    <Text allowFontScaling={false} style={styles.popupDetails}>
                      {strings('common.transport.returnTime')}
                    </Text>
                    <Text allowFontScaling={false} style={styles.popupHashTag}>
                      :
                    </Text>
                    <Text allowFontScaling={false} style={[styles.driver, { width: wp(50) }]}>
                      {this.state.modalData.returnTime
                        ? this.state.modalData.returnTime == 'NOT_SURE'
                          ? 'Not Sure'
                          : moment(this.state.modalData.returnTime).format('MMM Do, YYYY hh:mm A')
                        : 'N/A'}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.pickUp')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.driver,
                      {
                        width: wp(50),
                        lineHeight: 18,
                      },
                    ]}
                  >
                    {this.state.modalData.pickupLocation}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.drop')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.driver,
                      {
                        width: wp(50),
                        lineHeight: 18,
                      },
                    ]}
                  >
                    {this.state.modalData.dropLocation}{' '}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.driver')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { width: wp(45) }]}>
                    {this.state.modalData?.driverId?.driverName}{' '}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.driverContact')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { width: wp(45) }]}>
                    {this.state.modalData?.driverId?.phoneNumber ? this.state.modalData?.driverId?.phoneNumber : 'NA'}{' '}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.vehicle')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { width: wp(45) }]}>
                    {this.state.modalData.vehicleId.vehicleNumber}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.trip')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { width: wp(45) }]}>
                    {this.state.modalData.tripType == 'SINGLE' ? strings('common.transport.oneWay') : strings('common.transport.twoWay')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.fare')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver, { fontFamily: AppStyles.fontFamilyBold }]}>
                    {this.state.modalData.currencySymbol + '' + this.state.modalData.tripFare}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.paymentBy')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver]}>
                    {this.state.modalData.paymentMethod == 'CARD' ? 'Card' : 'Cash'}
                  </Text>
                </View>
                {this.state.modalData.paymentMethod == 'CARD' ? (
                  <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                    <Text allowFontScaling={false} style={styles.popupDetails}>
                      {strings('common.transport.paymentStatus')}
                    </Text>
                    <Text allowFontScaling={false} style={styles.popupHashTag}>
                      :
                    </Text>
                    <Text allowFontScaling={false} style={[styles.driver]}>
                      {paymentStatus}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.bookingStatus')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={[styles.driver]}>
                    {status}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: hp('1%') }}>
                  <Text allowFontScaling={false} style={styles.popupDetails}>
                    {strings('common.transport.additionalItems')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupHashTag}>
                    :
                  </Text>
                  <FlatList
                    style={{ width: wp(100) }}
                    data={this.state.modalData.additionalItem}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={(item) => this._render_additionalItems(item)}
                    extraData={this.state}
                  />
                </View>
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row' }}>
              {this.state.isUpComing && this.state.modalData.paymentMethod == 'CARD' && this.state.modalData.paymentStatus != 'successful' ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() =>
                    this.setState(
                      {
                        isReqData: false,
                        isReqPay: true,
                        discountPrice: 0,
                        planPriceWithDiscount: this.state.modalData.tripFare,
                        isCouponApplied: false,
                        applyCoupon: '',
                      } /*,()=>{this.paymentAction(this.state.modalData._id)} */
                    )
                  }
                  style={{
                    height: hp(5),
                    width: wp(30),
                    borderWidth: 1,
                    justifyContent: 'center',
                    borderColor: AppColors.primaryColor,
                    borderRadius: wp(2),
                    alignSelf: 'flex-start',
                    marginTop: hp(2),
                    marginBottom: hp(2),
                    backgroundColor: AppColors.primaryColor,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: AppColors.whiteColor,
                      alignSelf: 'center',
                      fontSize: 17,
                    }}
                  >
                    {strings('common.transport.pay')}
                  </Text>
                </TouchableHighlight>
              ) : (
                <View />
              )}
              {this.state.isUpComing && this.state.modalData.bookingStatus != 'ON_GOING' ? (
                <TouchableHighlight underlayColor="transparent" style={styles.cancelTripPopup} onPress={() => this.cancelTrip(this.state.modalData)}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: AppColors.primaryColor,
                      alignSelf: 'center',
                      fontSize: 17,
                    }}
                  >
                    {strings('common.transport.cancelTrip')}
                  </Text>
                </TouchableHighlight>
              ) : (
                <View />
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _render_additionalItems(items) {
    AppUtils.console('additional items', items);
    return (
      <View>
        <CheckBox
          style={{ paddingBottom: 10, paddingTop: 0 }}
          onClick={(isChecked) => {
            AppUtils.console('sdxgd');
          }}
          checkBoxColor={AppColors.primaryColor}
          isChecked={items.item.isItemUsed}
          leftText={items.item.itemName}
          leftTextStyle={{
            color: AppColors.blackColor,
            fontFamily: AppStyles.fontFamilyMedium,
          }}
        />
      </View>
    );
  }

  onBackPress() {
    this.setState({
      isReqData: false,
    });
  }
}

export default MyWagonBooking;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  modalContainerRes: {
    flexDirection: 'column',
    height: verticalScale(720),
    width: width - moderateScale(30),
  },

  modalScrollContainer: {
    flexDirection: 'column',
    height: verticalScale(560),
    width: width - moderateScale(30),
    backgroundColor: AppColors.whiteColor,
    margin: moderateScale(65),
    borderRadius: moderateScale(15),
    alignSelf: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  details: {
    fontSize: hp('2.5%'),
    textAlign: 'center',
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.blackColor,
    // paddingTop:hp(2)
  },
  accepted: {
    fontSize: hp('3%'),
    color: AppColors.blackColor,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: AppStyles.fontFamilyMedium,
  },
  driver: {
    color: AppColors.blackColor,
    fontSize: hp('2%'),
    fontFamily: AppStyles.fontFamilyMedium,
    textAlign: isRTL ? 'left' : 'auto',
    marginLeft: isRTL ? wp(1) : null
  },
  wagon: {
    height: hp('20%'),
    width: wp('30%'),
    alignSelf: 'center',
  },
  pickupButton: {
    height: hp(4),
    width: wp(100),
    marginTop: hp(2),
    alignSelf: 'center',
    tintColor: AppColors.primaryColor,
  },
  expandScreenHeader: {
    height: hp(7),
    width: wp(100),
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    marginTop: 0,
  },
  pickupDetails: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
  },
  popupDetails: {
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyBold,
    width: wp(25),
    fontSize: 15,
    textAlign: isRTL ? 'left' : 'auto',
  },
  popupHashTag: {
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyBold,
    width: wp(5),
    fontSize: 15,
  },
  popupDesign: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.transparent,
    height: AppUtils.screenHeight,
    width: AppUtils.screenWidth,
  },
  closeIcon: {
    height: verticalScale(25),
    width: verticalScale(25),
    borderRadius: verticalScale(10),
    backgroundColor: AppColors.whiteColor,
    alignSelf: 'flex-end',
    marginTop: verticalScale(7),
    marginBottom: verticalScale(10),
    //tintColor: AppColors.blackColor,
    marginRight: wp(2),
  },
  cancelTripPopup: {
    height: Platform.OS === 'ios' ? hp(5) : hp(5),
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
  },
  elevatedModel: {
    height: 150,
    borderRadius: wp(2),
    margin: wp(3),
    marginBottom: wp(0),
    backgroundColor: AppColors.whiteColor,
    flexDirection: 'column',
  },
  fareText: {
    backgroundColor: AppColors.primaryColor,
    borderColor: AppColors.primaryColor,
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDetails: {
    width: wp(80),
    alignSelf: 'center',
    height: 1,
    backgroundColor: AppColors.backgroundGray,
  },
  cancelData: {
    height: hp(4),
    width: wp(25),
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: AppColors.primaryColor,
    borderRadius: wp(5),
    alignItems: 'center',
  },
  vehicleStatus: {
    height: hp(4),
    width: wp(25),
    borderWidth: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: AppColors.primaryColor,
    borderRadius: wp(5),
    alignItems: 'center',
  },
  tripStatus: {
    color: AppColors.primaryColor,
    alignSelf: 'center',
    textAlign: 'right',
    fontSize: 12,
    fontFamily: AppStyles.fontFamilyMedium,
  },
  emptyMessage: {
    color: AppColors.primaryColor,
    fontSize: moderateScale(15),
    textAlign: 'center',
    fontFamily: AppStyles.fontFamilyBold,
  },
  cancelIcon: {
    justifyContent: 'center',
    alignSelf: 'center',
    height: verticalScale(100),
    width: moderateScale(100),
  },
  loadingStyle: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
