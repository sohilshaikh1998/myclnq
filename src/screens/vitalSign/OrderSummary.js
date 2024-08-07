import React, { Component } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  BackHandler,
  Platform,
  PermissionsAndroid,
  TouchableHighlight,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { AppColors } from "../../shared/AppColors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";

import { AppUtils } from "../../utils/AppUtils";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import AddRecordsStyles from "./AddRecordsStyles";
import { moderateScale } from "../../utils/Scaling";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FamilyProfile from "./../commonFiles/FamilyProfile";
import VitalCard from "../vital/VitalCard";
import Dash from "react-native-dash";
import moment from "moment";
import { strings } from "../../locales/i18n";

class AddRecords extends Component {
  constructor(props) {
    super(props);
    AppUtils.console("deeeee====" + JSON.stringify(this.props.details));
    this.state = {
      isLoading: false,
      couponCode: "",
      subscribedPlan: this.props.details,
      startTime: this.props.date,
      duration: this.props.details.duration,
      durationInDays: "",
      durationIsMonth: "",
      applyCoupon: "",
      subscribedDate: this.props.details,
      range: "",
      details: this.props.details,
      planIs: this.props.details.subscriptionPlanName,
      inDays: false,
      validity: "",
    };
  }

  componentDidMount() {
    if (this.state.subscribedPlan["duration"] < 30) {
      if (this.state.subscribedPlan["duration"] == 28) {
        this.setState({ durationIsMonth: 1, inDays: false });
      } else {
        this.setState({
          durationInDays: this.state.duration,
          inDays: true,
        });
      }
    } else {
      this.setState({
        durationIsMonth: Math.floor(this.state.subscribedPlan["duration"] / 30),
        inDays: false,
      });
    }
    let rangeStart = moment(this.state.startTime).format(" MMM DD-YYYY");
    let rangeEnd = moment(this.state.startTime)
      .add(this.state.subscribedPlan["duration"], "days")
      .format(" MMM DD-YYYY");
    AppUtils.console("11111-->" + rangeStart + "2222==>" + rangeEnd);
    this.setState({ validity: rangeStart + "-" + rangeEnd });

    this.state.subscribedDate = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        this.onBackPress();
        return true;
      }
    );
  }
  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console("timeout", "----->");
      Actions.refresh({ update: true });
    }, 500);
  }

  renderIOS() {
    const cellWidth = AppUtils.screenWidth / 5;
    return (
      <View
        style={[
          styles.headerStyle,
          { flexDirection: "row", paddingBottom: hp(2), paddingTop: hp(4) },
        ]}
        elevation={5}
      >
        <TouchableOpacity
          onPress={() => this.onBackPress()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(30),
              marginTop: hp(2),
              marginLeft: hp(2),
            }}
            source={images.smallBackIcon}
          />
        </TouchableOpacity>
        <View
          style={{
            width: cellWidth * 3,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Text numberOfLines={1} style={styles.headerTextIOS}>
            {strings("vital.vital.orderSummary")}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isX ? 16 + 18 : 16,
          }}
        ></View>
      </View>
    );
  }

  renderAndroid() {
    const cellWidth = AppUtils.screenWidth / 5;
    return (
      <View
        style={[
          styles.headerStyle,
          { flexDirection: "row", paddingBottom: hp(2), paddingTop: hp(0.5) },
        ]}
        elevation={5}
      >
        <TouchableOpacity
          onPress={() => this.onBackPress()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(30),
              marginTop: hp(2),
              marginLeft: hp(2),
            }}
            source={images.smallBackIcon}
          />
        </TouchableOpacity>
        <View
          style={{
            width: cellWidth * 3,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Text numberOfLines={1} style={styles.headerTextIOS}>
            {strings("vital.vital.orderSummary")}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isX ? 16 + 18 : 16,
          }}
        ></View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.backgroundGray }}>
        {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}

        <KeyboardAwareScrollView style={{ flex: 1 }}>
          <View
            style={{
              marginTop: hp(2),
              marginBottom: hp(3),
              width: wp(100),
              height: hp(58),
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                width: wp("33%"),
                height: hp("20"),
                borderRadius: wp("3%"),
                borderColor: AppColors.primaryColor,
                borderWidth: 1,
                marginLeft: wp(6),
                marginTop: hp(3),
                backgroundColor: "#FFE5E5",
              }}
            >
              <View style={{ height: hp("3%") }}>
                <Image
                  resizeMode="contain"
                  style={{
                    height: hp("4%"),
                    width: wp("5%"),
                    marginLeft: wp(3),
                    marginTop: hp(1),
                  }}
                  source={require("../../../assets/images/membership.png")}
                />
              </View>
              <View style={{ marginLeft: wp(3), marginTop: hp(3) }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: AppStyles.fontFamilyMedium,
                    color: AppColors.blackColor,
                  }}
                >
                  {this.state.subscribedPlan["subscriptionPlanName"]}
                </Text>
              </View>

              <View
                style={{
                  height: hp("3%"),
                  marginLeft: wp("3"),
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    color: AppColors.blackColor,
                    fontFamily: AppStyles.fontFamilyDemi,
                  }}
                >
                  {this.state.subscribedPlan["currencySymbol"]}
                  {this.state.subscribedPlan["price"]}
                </Text>
              </View>
              {/*
                            <TouchableOpacity
                                onPress={() => Actions.MainScreen({ openPlanModal: true })}
                                style={{
                                    width: wp(20),
                                    height: hp(4),
                                    backgroundColor: AppColors.colorHeadings,
                                    marginTop: hp(2),
                                    marginLeft: wp(3),
                                    justifyContent: 'center',
                                    borderRadius: wp(1)
                                }}>
                                <Text style={{ fontSize: 10, textAlign: 'center', color: AppColors.whiteColor }}>Change plan</Text>
                            </TouchableOpacity> */}
            </View>
            <View style={{ flex: 1, marginTop: hp(3), marginBottom: hp(2) }}>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: wp(50),
                    height: hp(7),
                    marginLeft: wp(6),
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("vital.vital.planDuration")}
                  </Text>
                </View>
                <View
                  style={{
                    width: wp(40),
                    height: hp(7),
                    alignItems: "flex-end",
                  }}
                >
                  <View style={{ flexDirection: "column" }}>
                    {this.state.inDays ? (
                      <Text
                        style={{
                          fontSize: moderateScale(15),
                          fontFamily: AppStyles.fontFamilyDemi,
                          color: AppColors.blackColor,
                          alignSelf: "flex-end",
                        }}
                      >
                        {this.state.durationInDays} Days
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: moderateScale(15),
                          fontFamily: AppStyles.fontFamilyDemi,
                          color: AppColors.blackColor,
                          alignSelf: "flex-end",
                        }}
                      >
                        {this.state.durationIsMonth} Months
                      </Text>
                    )}

                    <Text
                      style={{
                        fontSize: moderateScale(8),
                        fontFamily: AppStyles.fontFamilyMedium,
                        color: AppColors.primaryGray,
                        paddingTop: hp(1),
                      }}
                    >
                      {this.state.validity}
                    </Text>
                  </View>
                </View>
              </View>
              <Dash
                dashColor={AppColors.primaryGray}
                dashLength={10}
                dashGap={6}
                style={{ width: wp(100), height: 1, marginBottom: hp(1) }}
              />
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: wp(50),
                    height: hp(5),
                    marginLeft: wp(6),
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("vital.vital.itemTotal")}
                  </Text>
                </View>
                <View
                  style={{
                    width: wp(40),
                    height: hp(5),
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyBold,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.subscribedPlan["currencySymbol"]}
                    {this.state.subscribedPlan["price"]}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: wp(50),
                    height: hp(5),
                    marginLeft: wp(6),
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("vital.vital.bookingDiscount")}
                  </Text>
                </View>
                <View
                  style={{
                    width: wp(40),
                    height: hp(5),
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyMedium,
                      color: AppColors.blackColor,
                    }}
                  >
                    $0.00
                  </Text>
                </View>
              </View>

              <Dash
                dashColor={AppColors.primaryGray}
                dashLength={10}
                dashGap={6}
                style={{
                  width: wp(100),
                  height: 1,
                  marginBottom: hp(2),
                  marginTop: hp(2),
                }}
              />

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: wp(50),
                    height: hp(5),
                    marginLeft: wp(6),
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyBold,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("doctor.text.totalAmount")}
                  </Text>
                </View>
                <View
                  style={{
                    width: wp(40),
                    height: hp(5),
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontFamily: AppStyles.fontFamilyBold,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.subscribedPlan["currencySymbol"]}
                    {this.state.subscribedPlan["price"]}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: wp(50),
                  height: hp(3),
                  marginLeft: wp(6),
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(15),
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.greenColor,
                  }}
                >
                  You're saving $0.00
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              marginBottom: hp(3),
              width: wp(100),
              height: hp(15),
              backgroundColor: AppColors.whiteColor,
            }}
          >
            <View
              style={{
                width: wp(90),
                height: hp(3),
                marginLeft: wp(6),
                marginTop: hp(2),
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontFamily: AppStyles.fontFamilyBold,
                  color: AppColors.blackColor,
                }}
              >
                {strings("doctor.button.applyCoupon")}
              </Text>
            </View>
            <View
              style={{
                width: wp(90),
                height: hp(8),
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
                    width: wp(54),
                    justifyContent: "center",
                    backgroundColor: AppColors.whiteShadeColor,
                  }}
                >
                  <TextInput
                    allowFontScaling={false}
                    placeholder={strings("doctor.text.enterCouponCode")}
                    value={this.state.applyCoupon}
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

                <TouchableOpacity
                  onPress={() => AppUtils.console("clickedapply")}
                  style={{
                    height: hp(4),
                    marginLeft: wp(5),
                    borderRadius: wp(2),
                    width: wp(25),
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
              </View>
              {/* <TextInput allowFontScaling={false}
                                style={{
                                    width: wp(55),
                                    color: AppColors.blackColor3,
                                    fontSize: moderateScale(15), padding: hp(.5),backgroundColor: AppColors.backgroundGray,
                                    borderRadius:wp(3),height: hp(6),textAlign:'center'
                                }}
                                inputStyle={{marginLeft:wp(2)}}
                                maxLength={20}
                                autoFocus={false}
                                placeholder={strings('doctor.text.enterCouponCode')}
                                placeholderTextColor={AppColors.primaryGray}
                                value={this.state.couponCode}
                                onChangeText={(input) => this.onChangedText(input)}
                                returnKeytype="done"
                                onSubmitEditing={() => this.validateCoupon()}


                            />
                             <TouchableOpacity
                                onPress={() => Alert.alert('aaaaaa')}
                                style={{
                                    width: wp(18),
                                    height: hp(6),
                                    backgroundColor: AppColors.colorHeadings,
                                    marginLeft: wp(3),
                                    justifyContent: 'center',
                                    borderRadius:wp(2)
                                }}>
                                <Text style={{ fontSize: moderateScale(15) , textAlign: 'center', color: AppColors.whiteColor }}>{strings('doctor.button.apply')}</Text>
                            </TouchableOpacity> */}
            </View>
          </View>
        </KeyboardAwareScrollView>

        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={"#FFFFFF"}
          color={AppColors.primaryColor}
        />
        {this.footer()}
      </View>
    );
  }

  onChangedText(number) {
    AppUtils.console("appp-->" + number);
    this.setState({ applyCoupon: number });
  }

  validateCoupon = () => {
    let coupon = this.state.couponCode;
    Alert.alert(coupon);
  };

  submit = async () => {
    this.setState({ isLoading: true });
    let couponCodeApplied =
      this.state.applyCoupon == "" ? null : this.state.applyCoupon;
    AppUtils.console("isssss" + this.state.startTime);
    AppUtils.console("isssss" + couponCodeApplied);
    AppUtils.console("isssss" + this.state.subscribedPlan["_id"]);
    let subscriptionDetails = {
      vitalSubscriptionPlanId: this.state.subscribedPlan["_id"],
      planStartsOn: this.state.startTime,
      referralCode: couponCodeApplied,
    };

    try {
      let subscribedPlan = await SHApiConnector.payForVitalSubscription(
        subscriptionDetails
      );
      this.setState({ isLoading: false }, () => {
        setTimeout(() => {
          AppUtils.console(
            "ResponseISS:",
            subscribedPlan,
            subscribedPlan.data,
            subscribedPlan.data.status
          );
          let data = "";
          if (subscribedPlan.data.status) {
            //if (true) {
            if (subscribedPlan.data.response.isPayByPayU) {
              let payUData = subscribedPlan.data.response.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

              Actions.PayUPayment({
                paymentDetails: payUData,
                module: "vital_subscription",
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.vital,
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: "vital_subscription",
              });
            } else {
              Actions.OnlinePayment({
                paymentData: subscribedPlan.data.response.payment,
                module: "vital_subscription",
                subdetails: this.state.details,
                expireTime: this.state.validity,
                duration: this.state.inDays ? this.state.durationInDays : "",
              });
            }
          }
        }, 500);
      });
    } catch (e) {
      AppUtils.console("subscribedPlanerror:", e);
      this.setState({ isLoading: false });
    }
  };

  footer() {
    return (
      <View
        style={{
          width: wp(100),
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.2,
          shadowColor: "#000000",
          backgroundColor: AppColors.backgroundGray,
          paddingBottom: AppUtils.isX ? hp(2) : 0,
          elevation: 2,
          height: AppUtils.isX ? hp(12) : hp(10),
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.submit();
          }}
          style={{ width: wp(90), marginLeft: wp(3) }}
        >
          <Text style={[AddRecordsStyles.btnSubmit]}>
            {strings("doctor.button.payNow")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textViewStyle: {
    alignSelf: "center",
    height: hp(6),
    flexDirection: "row",
    width: wp(90),
    borderColor: AppColors.backgroundGray,
  },

  textTitleStyle: {
    flex: 1,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: "center",
    paddingLeft: wp(5),
  },

  textDataStyle: {
    flex: 1,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginLeft: wp(25),
    alignSelf: "center",
    fontFamily: AppStyles.fontFamilyRegular,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    flexDirection: "row",
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === "ios" ? 16 : hp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
});

export default AddRecords;
