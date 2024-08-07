import React, { Component } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, BackHandler,I18nManager } from 'react-native';
import { AppColors } from '../../../shared/AppColors';
import CardView from 'react-native-cardview';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from '../../../shared/AppStyles';
import { AppStrings } from '../../../shared/AppStrings';
import ProgressLoader from 'rn-progress-loader';

import { AppUtils } from '../../../utils/AppUtils';
import Toast from 'react-native-simple-toast';
import images from '../../../utils/images';
import AddressView from '../../../shared/AddressView';
import { SHApiConnector } from '../../../network/SHApiConnector';
import AddOrUpdateAddress from '../../../shared/AddOrUpdateAddress';
import SelectAddressModal from '../../../shared/SelectAddressModal';
import { Actions } from 'react-native-router-flux';
import caregiverBookingRequestStyle from './../caregiverBookingRequest/caregiverBookingRequestStyle';

import moment from 'moment';

import { CachedImage, ImageCacheProvider } from '../../../cachedImage';
import { strings } from '../../../locales/i18n';
//import Razer Merchant Services package
const isRTL = I18nManager.isRTL;
var molpay = require('molpay-mobile-xdk-reactnative-beta');
const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
class confirmBooking extends Component {
  constructor(props) {
    super(props);
    AppUtils.console('confirmBooking', props);
    this.state = {
      coupon: '',
      upcomingDetail: props.upcomingDetail,
      discount: props.upcomingDetail.itemData.paymentStatus === 'successful' ? props.upcomingDetail.itemData.discountAmount : 0,
      discountedPrice:
        props.upcomingDetail.itemData.paymentStatus === 'successful'
          ? props.upcomingDetail.itemData.paidAmount
          : props.upcomingDetail.itemData.charge,
      total: props.upcomingDetail.itemData.charge,
      isLoading: false,
      couponText: '',
      showApplyCoupon: true,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.caregiverTab({ isCaregiverBookingUpdated: true });
      return true;
    });
  }
  async applyCoupon(coupon) {
    let self = this;
    if (!this.state.couponText) {
      Toast.show(strings('doctor.text.pleaseEnterCouponCode'));
    } else {
      this.setState({ isLoading: true });

      AppUtils.console('DiscountCoupon', coupon);
      let coupenDetails = {
        referralCode: coupon ? coupon : null,
        module: AppStrings.label.CAREGIVER,
      };

      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        AppUtils.console('DiscountCoupon', response.data.status, 'data', response.data);
        this.setState({ isLoading: false });

        if (response.data.status) {
          let discount = 0;
          let total = 0;
          if (response.data.response.valueType === 'PERCENT') {
            let offerVal = (response.data.response.couponValue * this.state.total) / 100;
            discount = discount + offerVal;
          } else {
            discount = discount + response.data.response.couponValue;
          }

          total = this.state.total;

          this.setState(
            {
              discountedPrice: total - discount,
              discount: discount,
              coupon: coupon,
              showApplyCoupon: false,
            },
            () => {
              setTimeout(() => {
                Toast.show(strings('doctor.text.couponAppliedSuccess'));
              }, 500);
            }
          );
        } else {
          self.setState(
            {
              discountedPrice: this.state.total,
              discount: 0,
              coupon: '',
              couponText: '',
              showApplyCoupon: true,
            },
            () => {
              setTimeout(() => {
                Toast.show(response.data.error_message);
              }, 500);
            }
          );
        }
        AppUtils.console('sdfzvbdsfv', response);
      } catch (e) {
        AppUtils.console('VERIFY_OFFER_ERROR', e);
      }
    }
  }

  removeCoupon(coupon) {
    this.setState({
      discountedPrice: this.state.total,
      discount: 0,
      coupon: '',
      couponText: '',
      showApplyCoupon: true,
    });
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
    let self = this;
    AppUtils.console('ConfirmDetails', self.props.upcomingDetail);
    let data = self.props.upcomingDetail.itemData;

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
                {self.props.upcomingDetail.location === '' ? '' : AppUtils.getAddress(self.props.upcomingDetail.location)}
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
                {self.props.upcomingDetail.lookingFor.service}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{self.props.upcomingDetail.lookingFor.subservice}</Text>
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
                {self.props.upcomingDetail.Date.startDate} - {self.props.upcomingDetail.Date.endDate}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                {self.props.upcomingDetail.Date.startTime} - {self.props.upcomingDetail.Date.endTime}
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
                {self.props.upcomingDetail.Date.requestDate}{' '}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{self.props.upcomingDetail.Date.requestTime}</Text>
            </View>
          </View>
        </View>

        {self.props.upcomingDetail.jobStatus === 'CANCEL' || !self.props.upcomingDetail.nurse ? (
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
                  {self.props.upcomingDetail.nurse.name}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{'C/O ' + self.props.upcomingDetail.nurse.providerName}</Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>
                  {self.props.upcomingDetail.nurse.gender}, Age: {self.props.upcomingDetail.nurse.age}
                </Text>
                <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{this.langData(self.props.upcomingDetail.nurse.lang)}</Text>
              </View>
            </View>
          </View>
        )}

        {self.props.upcomingDetail.jobStatus === 'CANCEL' || !self.props.upcomingDetail.nurse ? null : (
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
                {self.props.upcomingDetail.Patient.name}, {self.props.upcomingDetail.Patient.age}{' '}
              </Text>
              <Text style={caregiverBookingRequestStyle.modalListContentViewSubTxt}>{self.props.upcomingDetail.Patient.condition}</Text>
            </View>
          </View>
        </View>

        {data.charge > 0 ? (
          <View style={caregiverBookingRequestStyle.modalListContentView}>
            <View style={caregiverBookingRequestStyle.modalListContentInnerView}>
              <View style={caregiverBookingRequestStyle.modalListContentViewHead}>
                <Text numberOfLines={2} style={caregiverBookingRequestStyle.modalListContentViewTxt}>
                  {strings('string.label.payment_status')}
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

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            numberOfLines={2}
            style={[
              caregiverBookingRequestStyle.modalListContentViewTxt,
              { alignSelf: 'flex-start', paddingLeft: hp(3), paddingTop: hp(2), width: wp(90),  textAlign: isRTL ? 'left' : 'auto', marginLeft: isRTL ? wp(5):null,
            },
            ]}
          >
            {strings('common.caregiver.requestDetails')}
          </Text>
          <CardView
            cardElevation={2}
            cornerRadius={5}
            style={{
              backgroundColor: AppColors.whiteColor,
              marginBottom: hp(1),
              width: wp(90),
              alignSelf: 'center',
              marginTop: hp(2),
            }}
          >
            <View
              style={[
                caregiverBookingRequestStyle.modalView2,
                {
                  height:
                    this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.viewPay ||
                    (this.state.upcomingDetail.itemData.paymentStatus === 'successful' && this.state.upcomingDetail.itemData.referralId)
                      ? hp(35)
                      : hp(55),
                  backgroundColor: AppColors.whiteColor,
                  paddingBottom: hp(2),
                },
              ]}
            >
              {this.renderModalData()}
            </View>
          </CardView>
          {this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.viewPay ||
          (this.state.upcomingDetail.itemData.paymentStatus === 'successful' && this.state.upcomingDetail.itemData.referralId) ? (
            <View>
              {this.state.showApplyCoupon && this.state.upcomingDetail.itemData.paymentStatus !== 'successful' ? (
                <CardView
                  cardElevation={2}
                  cornerRadius={5}
                  style={{
                    backgroundColor: AppColors.whiteColor,
                    marginBottom: hp(1),
                    width: wp(100),
                    alignSelf: 'center',
                    marginTop: hp(2),
                    padding: hp(1),
                  }}
                >
                  <Text
                    numberOfLines={2}
                    style={[caregiverBookingRequestStyle.modalListContentViewTxt, { alignSelf: 'flex-start', paddingLeft: hp(3), width: wp(90) }]}
                  >
                    {strings('string.label.apply_coupon')}
                  </Text>
                  <View style={{ flexDirection: 'row', margin: hp(2), paddingLeft: hp(0.2), paddingTop: hp(1) }}>
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
                        value={this.state.couponText}
                        placeholderTextColor={AppColors.textGray}
                        onChangeText={(text) => this.setState({ couponText: text })}
                        style={{ height: hp('5'), fontSize: hp(1.8), color: AppColors.textGray, padding: hp('1') }}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => this.applyCoupon(this.state.couponText)}
                      style={{
                        height: hp(4),
                        marginLeft: wp(3),
                        borderRadius: wp(2),
                        width: wp(20),
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
                  </View>
                </CardView>
              ) : (
                <CardView
                  cardElevation={2}
                  cornerRadius={5}
                  style={{
                    backgroundColor: AppColors.whiteColor,
                    marginBottom: hp(1),
                    width: wp(100),
                    alignSelf: 'center',
                    marginTop: hp(2),
                    padding: hp(1),
                  }}
                >
                  <View style={{ flexDirection: 'row', margin: hp(2), paddingLeft: hp(0.2), paddingTop: hp(1) }}>
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
                        style={[caregiverBookingRequestStyle.modalListContentViewTxt, { alignSelf: 'flex-start', paddingLeft: hp(3), width: wp(90) }]}
                      >
                        {strings('doctor.text.couponApplied')}
                        <Text style={{ fontFamily: AppStyles.fontFamilyBold }}>
                          {' '}
                          {this.state.upcomingDetail.itemData.paymentStatus === 'successful' && this.state.upcomingDetail.itemData.referralId
                            ? this.state.upcomingDetail.itemData.referralId.referralCode
                            : this.state.coupon}
                        </Text>
                      </Text>

                      <Text
                        numberOfLines={2}
                        style={{
                          color: AppColors.primaryColor,
                          fontFamily: AppStyles.fontFamilyMedium,
                          paddingTop: hp(0.6),
                          fontSize: hp(1.6),
                          alignSelf: 'flex-start',
                          paddingLeft: hp(3),
                          width: wp(90),
                        }}
                      >
                        {strings('doctor.text.couponSaving')} {this.state.upcomingDetail.itemData.currencySymbol + this.state.discount}
                      </Text>
                    </View>

                    {this.state.upcomingDetail.itemData.paymentStatus === 'successful' ? null : (
                      <TouchableOpacity
                        onPress={() => this.removeCoupon(this.state.couponText)}
                        style={{
                          height: hp(4),
                          marginLeft: wp(3),
                          width: wp(20),
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: hp(1.8),
                            color: AppColors.primaryColor,
                            fontWeight: 'bold',
                          }}
                        >
                          {strings('doctor.button.remove')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </CardView>
              )}
            </View>
          ) : null}
          <CardView
            cardElevation={2}
            cornerRadius={5}
            style={{
              backgroundColor: AppColors.whiteColor,
              marginBottom: hp(1),
              width: wp(100),
              alignSelf: 'center',
              marginTop: hp(2),
              padding: hp(1),
            }}
          >
            <Text
              numberOfLines={2}
              style={[caregiverBookingRequestStyle.modalListContentViewTxt, { alignSelf: 'flex-start', paddingLeft: hp(3), width: wp(90) ,textAlign: isRTL ? 'left' : 'auto',}]}
            >
              {strings('doctor.text.orderDetails')}
            </Text>
            <View
              style={{
                width: wp(90),
                marginTop: hp(1),

                elevation: 0,
                borderRadius: hp(0.5),
                alignSelf: 'center',
                backgroundColor: AppColors.whiteColor,
              }}
            >
              <View style={styles.textViewStyle}>
                <Text style={[styles.textTitleStyle,{textAlign: isRTL ? 'left' : 'auto'}] }>{strings('string.label.service_charge')}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.textDataStyle}> {this.state.upcomingDetail.itemData.currencySymbol + this.state.total}</Text>
                </View>
              </View>

              <View style={styles.textViewStyle}>
                <Text style={[styles.textTitleStyle,{textAlign: isRTL ? 'left' : 'auto'}]}>{strings('doctor.button.discount')}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.textDataStyle}> {this.state.upcomingDetail.itemData.currencySymbol + this.state.discount}</Text>
                </View>
              </View>
               
             <View>{this.displayGST(this.state.upcomingDetail.itemData.gstAmount)}</View>
            
              
              <View style={styles.textViewStyle}>
                <Text style={[styles.textTitleStyle, { color: AppColors.blackColor , textAlign: isRTL ? 'left' : 'auto',}]}>{strings('common.caregiver.total')}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.textDataStyle, { color: AppColors.blackColor }]}>
                    {' '}
                    {this.state.upcomingDetail.itemData.currencySymbol + this.state.discountedPrice}
                  </Text>
                </View>
              </View>
            </View>
          </CardView>
        </ScrollView>

        {this.state.upcomingDetail.jobStatus === AppStrings.btnTxt.viewPay ? (
          <View
            style={{
              width: wp(100),
              shadowOffset: {
                width: 0,
                height: -3,
              },
              shadowOpacity: 0.2,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              backgroundColor: AppColors.whiteColor,
              paddingBottom: AppUtils.isX ? hp(2) : 0,
              elevation: 2,
              height: AppUtils.isX ? hp(12) : hp(10),
              flexDirection: 'row',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: AppColors.blackColor,
                  marginLeft: wp(5),
                  marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                  fontSize: hp(2),
                  fontFamily: AppStyles.fontFamilyMedium,
                }}
              >
                {strings('common.caregiver.total')} {this.state.upcomingDetail.itemData.currencySymbol + this.state.discountedPrice}
              </Text>
            </View>

            <TouchableOpacity
              style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
              onPress={() => this.payNow(this.state.upcomingDetail.itemData)}
            >
              <View
                style={{
                  height: hp(6),
                  width: wp(35),
                  backgroundColor: AppColors.primaryColor,
                  borderWidth: 2,
                  justifyContent: 'center',
                  borderRadius: hp(0.8),
                  alignItems: 'center',
                  borderColor: AppColors.primaryColor,
                }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.whiteColor,
                    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                    fontSize: hp(2),
                  }}
                >
                  {strings('doctor.button.payNow')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
         </View>
    );
  }
  displayGST(value){
    if(value !=0){return(
    <View style={styles.textViewStyle}>
      <Text style={[styles.textTitleStyle, { color: AppColors.blackColor }]}>{"GST"}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.textDataStyle, { color: AppColors.blackColor }]}>
          {' '}
          {this.state.upcomingDetail.itemData.currencySymbol +  value}
        </Text>
      </View>
    </View>)}
  }


  async payNow(item) {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.caregiverJobPay({ jobId: item._id, referralCode: this.state.coupon ? this.state.coupon : null });
      this.setState({ isLoading: false });

      AppUtils.console('payment', response);
      if (response.data.status) {
        if (response.data.response.isPayByPayU) {
          let payUData = response.data.response.payment;
          payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
          payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
          payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;
          Actions.PayUPayment({ paymentDetails: payUData, module: 'caregiver' });
        } else if (response.data.response.isPayByRazer) {
          const pd = response?.data?.response?.payment;
          molpay.startMolpay(pd, async (data) => {
            const rmsResponseData = JSON.parse(data);
            if (rmsResponseData.status_code === '00' || rmsResponseData.status_code === '22') {
              const paymentData = {
                txn_ID: rmsResponseData.txn_ID,
                orderId: rmsResponseData.order_id,
                amount: rmsResponseData.amount,
                txID: rmsResponseData.txn_ID,
                statusCode: rmsResponseData.status_code,
              };
              const rmsResponse = await SHApiConnector.razorCaregiverCallback(paymentData);
              if (rmsResponse.status === 200) {
                
              Alert.alert('Payment Successfull',"",[{text:"OK",onPress:()=> Actions.caregiverTab({ isCaregiverBookingUpdated: true })}],{cancelable: false},
            );
                
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
        } else if (response.data.response.isPayByStripe) {
          let stripeData = response.data.response.payment;
          Actions.StripePayment({ paymentDetails: stripeData, module: 'caregiver' });
        } else if (response.data.response.isPayByXendit) {
          let xenditData = response.data.response.payment;
          Actions.XenditPayment({ paymentDetails: xenditData, module: AppStrings.key.caregiver });
        } else {
          Actions.OnlinePayment({
            paymentData: response.data.response.payment,
            module: 'caregiver',
          });
        }
      } else {
        // AppUtils.console("error", e);
        Alert.alert('', strings('common.caregiver.youCannotPayTryLater'));
      }
      //AppUtils.console("sdzfxcvgffd", response);
    } catch (e) {
      this.setState({ isLoading: false });
      Alert.alert('', strings('common.caregiver.youCannotPayTryLater'));
      AppUtils.console('PAY_NOW_CAREGIVER', e);
    }
  }
}

const styles = StyleSheet.create({
  textViewStyle: {
    alignSelf: 'center',
    height: hp(6),
    flexDirection: 'row',
    width: wp(90),
    borderColor: AppColors.backgroundGray,
  },

  textTitleStyle: {
    flex: 1,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: 'center',
    paddingLeft: wp(5),
  },

  textDataStyle: {
    flex: 1,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginLeft: wp(25),
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyRegular,
  },
});

export default confirmBooking;
