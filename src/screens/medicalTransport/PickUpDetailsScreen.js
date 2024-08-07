import React, { Component } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import styles from "../../styles/PickupDetailsStyles";
import moment from "moment";
import { AppColors } from "../../shared/AppColors";
import { AppStyles } from "../../shared/AppStyles";
import ElevatedView from "react-native-elevated-view";
import { Actions } from "react-native-router-flux";
import CheckBox from "react-native-check-box";
import { AppUtils } from "../../utils/AppUtils";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { SHApiConnector } from "../../network/SHApiConnector";
import ProgressLoader from "rn-progress-loader";
import { AppStrings } from "../../shared/AppStrings";
import Toast from "react-native-simple-toast";
import { strings } from "../../locales/i18n";

class PickUpDetailsScreen extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Medical Transport Pick Up Details Screen");
    this.state = {
      isReqModal: false,
      isLoading: false,
      modalData: {},
      planPriceWithDiscount: this.props.wagonData.trip.tripFare,
      discountPrice: 0,
      isCouponApplied: false,
      applyCoupon: "",
    };
  }

  componentDidMount() {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", () => {
        Actions.MyCareWagonDash();
        return true;
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === "android") {
      BackHandler.removeEventListener("hardwareBackPress", () => {
        Actions.MyCareWagonDash();
        return true;
      });
    }
  }

  render() {
    let tripData = this.props.wagonData.trip;
    AppUtils.console("pickupdetailsss", this.props.wagonData);
    let infoText =
      tripData.bookingType == "BOOK_NOW"
        ? tripData.paymentMethod == "CARD"
          ? strings("string.bookingDetails.tripStartInfoForCardPay")
          : strings("string.bookingDetails.tripStartInfo")
        : tripData.paymentMethod == "CARD"
        ? strings("string.bookingDetails.cardPay")
        : null;

    return (
      <View style={styles.content}>
        <View style={{ height: hp("100%"), width: wp(80) }}>
          <ElevatedView style={styles.pickupScreenHeader} elevation={5}>
            <TouchableOpacity onPress={() => Actions.MyCareWagonDash()}>
              <Image
                style={styles.blackArrowIcon}
                source={require("../../../assets/images/blackarrow.png")}
              />
            </TouchableOpacity>
            <View
              style={{
                justifyContent: "center",
                alignSelf: "center",
                marginLeft: wp(20),
              }}
            >
              <Text allowFontScaling={false} style={styles.pickupDetails}>
                Booking Details
              </Text>
            </View>
            <View style={styles.payHeader}>
              {tripData.paymentMethod == "CARD" ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => this.payOption()}
                  style={styles.payButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.pay,
                      { marginTop: Platform.OS === "ios" ? 5 : 0 },
                    ]}
                  >
                    {strings("common.transport.pay")}
                  </Text>
                </TouchableHighlight>
              ) : (
                <View />
              )}
            </View>
          </ElevatedView>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              <Text allowFontScaling={false} style={styles.details}>
                {strings("common.transport.foundWagon")}
              </Text>
            </View>
            <View>
              <Image
                resizeMode={"contain"}
                style={styles.wagon}
                source={require("../../../assets/images/ambulance.png")}
              />
            </View>
            <View style={{ marginTop: hp(-4) }}>
              <Text allowFontScaling={false} style={styles.accepted}>
                {strings("common.transport.capPickUp")}
              </Text>
              <Text allowFontScaling={false} style={styles.accepted}>
                {strings("common.transport.accepted")}
              </Text>
              <Image
                resizeMode={Platform.OS === "ios" ? "contain" : "center"}
                style={styles.pickupButton}
                source={require("../../../assets/wagon/circular_white_tick_mark.png")}
              />
              {infoText ? (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.accepted,
                    {
                      marginTop: hp(3),
                      fontSize: hp(2.5),
                      color: AppColors.primaryColor,
                    },
                  ]}
                >
                  {infoText}
                </Text>
              ) : (
                <View />
              )}
            </View>
            <View style={{ marginTop: hp(2) }}>
              <View style={{ flexDirection: "row" }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.driver")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.driverId.driverName}{" "}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.driverContact")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.driverId.phoneNumber}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.vehicle")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.vehicleId.vehicleNumber}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.trip")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.tripType == "ROUND"
                    ? strings("common.transport.twoWay")
                    : strings("common.transport.oneWay")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.fare")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.currencySymbol + "" + tripData.tripFare}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: hp("2%") }}>
              <View style={{ flexDirection: "row" }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.unitNo")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.driver, { lineHeight: 18 }]}
                >
                  {tripData.unitNumber ? tripData.unitNumber : "N/A"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.pickUp")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.driver, { lineHeight: 18 }]}
                >
                  {tripData.pickupLocation}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.drop")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.driver, { lineHeight: 18 }]}
                >
                  {tripData.dropLocation}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.date")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={styles.driver}
                >
                  {moment(tripData.requestedTime).format("MMM Do YYYY hh:mm A")}{" "}
                </Text>
              </View>
              {tripData.tripType == "SINGLE" ? (
                <View />
              ) : (
                <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                  <Text allowFontScaling={false} style={styles.driverFields}>
                    {strings("common.transport.returnTime")}
                  </Text>
                  <Text allowFontScaling={false} style={styles.hashTag}>
                    :
                  </Text>
                  <Text allowFontScaling={false} style={styles.driver}>
                    {tripData.returnTime
                      ? tripData.returnTime == "NOT_SURE"
                        ? strings("common.transport.notSure")
                        : moment(tripData.returnTime).format(
                            "MMM Do, YYYY hh:mm A"
                          )
                      : "N/A"}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: "row", marginTop: hp("2%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.additionalItems")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <FlatList
                  style={{ width: wp(50) }}
                  data={tripData.additionalItem}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={(item) => this._render_additionalItems(item)}
                  extraData={this.state}
                  showVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </ScrollView>
        </View>
        {this.paymentDetails()}
      </View>
    );
  }

  payOption() {
    let tripData = this.props.wagonData.trip;
    let self = this;
    self.setState({
      isReqModal: true,
      discountPrice: 0,
      planPriceWithDiscount: tripData.tripFare,
      isCouponApplied: false,
      applyCoupon: "",
    });
  }

  onBackPressDetails() {
    this.setState({
      isReqModal: false,
    });
  }

  onChangedText(number) {
    AppUtils.console("appp-->" + number);
    this.setState({ applyCoupon: number });
  }

  removeCoupon() {
    let tripData = this.props.wagonData.trip;
    this.setState({
      discountPrice: 0,
      planPriceWithDiscount: tripData.tripFare,
      isCouponApplied: false,
      applyCoupon: "",
    });
  }

  async applyCoupon() {
    let tripData = this.props.wagonData.trip;
    if (!this.state.applyCoupon) {
      Toast.show(strings("doctor.text.pleaseEnterCouponCode"));
    } else {
      let coupenDetails = {
        referralCode: this.state.applyCoupon,
        module: AppStrings.label.MEDICAL_TRANSPORT,
      };

      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        console.log("CheckCoupon", JSON.stringify(response.data));

        this.setState({ isLoading: false });
        let fare = tripData.tripFare;
        if (response.data.status) {
          if (response.data.response.valueType === "PERCENT") {
            let offerVal = (response.data.response.couponValue * fare) / 100;
            this.setState(
              {
                planPriceWithDiscount: fare - offerVal,
                discountPrice: offerVal,
                isCouponApplied: true,
              },
              () => {
                setTimeout(() => {
                  Toast.show(strings("doctor.text.couponAppliedSuccess"));
                }, 500);
              }
            );
          } else {
            let planPrice =
              response.data.response.couponValue >= fare
                ? 1
                : fare - response.data.response.couponValue;
            let discountPrice =
              response.data.response.couponValue >= fare
                ? fare - 1
                : response.data.response.couponValue;
            this.setState(
              {
                planPriceWithDiscount: planPrice,
                discountPrice: discountPrice,
                isCouponApplied: true,
              },
              () => {
                setTimeout(() => {
                  Toast.show(strings("doctor.text.couponAppliedSuccess"));
                }, 500);
              }
            );
          }
        } else {
          Toast.show(response.data.error_message);
          this.setState({ applyCoupon: "", isLoading: false });
        }
      } catch (e) {
        //AppUtils.console("VERIFY_OFFER_ERROR", e)
        this.setState({ applyCoupon: "", isLoading: false });
      }
    }
  }

  paymentDetails() {
    let tripData = this.props.wagonData.trip;
    return (
      <Modal
        visible={this.state.isReqModal}
        transparent={true}
        animationType={"fade"}
        onRequestClose={() => this.onBackPressDetails()}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: AppColors.transparent,
            height: AppUtils.screenHeight,
            width: AppUtils.screenWidth,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              height: hp(43),
              width: wp(90),
              backgroundColor: AppColors.whiteColor,
              borderRadius: moderateScale(10),
              alignSelf: "center",
              alignItems: "center",
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignSelf: "center",
                alignItems: "center",
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
                  textAlign: "center",
                  marginRight: wp(28),
                }}
              >
                {strings("common.transport.paymentDetails")}
              </Text>
              <TouchableOpacity
                style={{ marginTop: hp(-3), marginLeft: wp(3) }}
                onPress={() => this.onBackPressDetails()}
              >
                <Image
                  source={require("../../../assets/images/cancel.png")}
                  style={{
                    height: verticalScale(20),
                    width: verticalScale(20),

                    //tintColor: AppColors.blackColor,
                  }}
                ></Image>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: hp(1), marginLeft: wp("5%") }}>
              <View style={{ flexDirection: "row", marginLeft: wp("10%") }}>
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.name")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.driverId.driverName}{" "}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: wp("10%"),
                  marginTop: hp("1%"),
                }}
              >
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.number")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
                  :
                </Text>
                <Text allowFontScaling={false} style={styles.driver}>
                  {tripData.vehicleId.vehicleNumber}{" "}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: wp("10%"),
                  marginTop: hp("1%"),
                }}
              >
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.transport.amount")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
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
                    },
                  ]}
                >
                  {tripData.currencySymbol + "" + tripData.tripFare}{" "}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginLeft: wp("10%"),
                  marginTop: hp("1%"),
                }}
              >
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("doctor.button.discount")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
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
                    },
                  ]}
                >
                  {tripData.currencySymbol + "" + this.state.discountPrice}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: wp("10%"),
                  marginTop: hp("1%"),
                }}
              >
                <Text allowFontScaling={false} style={styles.driverFields}>
                  {strings("common.caregiver.total")}
                </Text>
                <Text allowFontScaling={false} style={styles.hashTag}>
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
                    },
                  ]}
                >
                  {tripData.currencySymbol +
                    "" +
                    this.state.planPriceWithDiscount}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: wp(90),
                height: hp(5),
                marginLeft: wp(6),
                marginTop: hp(2),
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
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
                  source={require("../../../assets/images/discount_1.png")}
                />
                <View
                  style={{
                    height: hp(4),
                    borderWidth: hp(0.2),
                    borderColor: AppColors.backgroundGray,
                    borderRadius: wp(2),
                    width: wp(44),
                    justifyContent: "center",
                    backgroundColor: AppColors.whiteShadeColor,
                  }}
                >
                  <TextInput
                    allowFontScaling={false}
                    placeholder={strings("doctor.text.enterCouponCode")}
                    value={this.state.applyCoupon}
                    editable={!this.state.isCouponApplied}
                    placeholderTextColor={AppColors.textGray}
                    onChangeText={(text) => this.onChangedText(text)}
                    style={{
                      marginLeft: wp(1),
                      height: hp("5"),
                      fontSize: hp(1.8),
                      color: AppColors.textGray,
                      padding: hp("1"),
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
                      justifyContent: "center",
                      backgroundColor: AppColors.primaryColor,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: hp(1.8),
                        color: AppColors.whiteColor,
                      }}
                    >
                      {strings("doctor.button.apply")}
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
                      justifyContent: "center",
                      backgroundColor: AppColors.primaryColor,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: hp(1.8),
                        color: AppColors.whiteColor,
                      }}
                    >
                      {strings("doctor.button.remove")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{ flexDirection: "row", marginTop: hp(4) }}>
              <TouchableOpacity
                onPress={() => this.doingPayment(tripData._id)}
                style={styles.confirmPayment}
              >
                <Text allowFontScaling={false} style={styles.confirmButton}>
                  {strings("common.transport.pay")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ProgressLoader
            visible={this.state.isLoading}
            isModal={true}
            isHUD={true}
            hudColor={"#FFFFFF"}
            color={AppColors.primaryColor}
          />
        </View>
      </Modal>
    );
  }

  async doingPayment(bookingId) {
    let self = this;
    let couponCodeApplied =
      this.state.applyCoupon == "" ? null : this.state.applyCoupon;

    try {
      let payment = { bookingId: bookingId, referralCode: couponCodeApplied };

      self.setState({ isLoading: true, isReqModal: false });
      const response = await SHApiConnector.payment(payment);
      console.log("Testss", JSON.stringify(response.data));
      self.setState({ isLoading: false, isReqModal: false }, () => {
        setTimeout(() => {
          AppUtils.console("payment", response);
          if (response.status == 200) {
            if (response.data.isPayByPayU) {
              let payUData = response.data.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

              Actions.PayUPayment({
                paymentDetails: payUData,
                module: "transport",
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.trip,
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: "transport",
              });
            } else {
              Actions.OnlinePayment({
                paymentData: response.data,
                bookingId: bookingId,
              });
            }
          } else {
            AppUtils.console("errorrrr");
            Alert.alert('', strings('common.transport.cannotPayForTrip'));
          }
        }, 500);
      });
    } catch (e) {
      self.setState({ isLoading: false, isReqModal: false });
      AppUtils.console("Catch", e);
      Alert.alert('', strings('common.transport.cannotPayForTrip'));
    }
  }

  _render_additionalItems(items) {
    //AppUtils.console('checkbox data', items)
    return (
      <View>
        <CheckBox
          style={{ paddingBottom: 10, paddingTop: 0 }}
          onClick={(isChecked) => {}}
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
}

export default PickUpDetailsScreen;
