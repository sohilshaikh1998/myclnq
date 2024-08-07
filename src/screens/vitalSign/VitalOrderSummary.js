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
  Dimensions,
  Platform,
  PermissionsAndroid,
  TouchableHighlight,
  DatePickerAndroid,
  Modal,
} from "react-native";
import ElevatedView from "react-native-elevated-view";
import moment from "moment";
import AsyncStorage from "@react-native-community/async-storage";
import { AppColors } from "../../shared/AppColors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-simple-toast";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";
import firebaseNotifications from "../../utils/firebaseNotifications";
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
import BottomUp from "react-native-modal";
import { getUniqueId } from "react-native-device-info";
import { strings } from "../../locales/i18n";
const { width, height } = Dimensions.get("window");

var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;
var minDatee = new Date(2022, 11, 24, 10, 33, 30, 0);
var today = new Date();
var dd = String(new Date().getDate()).padStart(2, "0");
var mm = String(new Date().getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + "-" + mm + "-" + dd;
let tomrwDate = String(new Date().getDate() + 1).padStart(2, "0");
let tomorrow = yyyy + "-" + mm + "-" + tomrwDate;

class AddRecords extends Component {
  constructor(props) {
    super(props);
    AppUtils.console("wqwqwqwqw->" + this.props.openPlan);
    this.state = {
      isLoading: false,
      couponCode: "",
      subscribedPlan: "",
      startTime: "",
      duration: "",
      durationInDays: "",
      durationIsMonth: "",
      applyCoupon: "",
      subscribedDate: "",
      range: "",
      details: "",
      planIs: "",
      inDays: false,
      validity: "",
      planModal: this.props.openPlan ? true : false,
      vitalSubscriptionPlan: [],
      selectedVitalPlan: [],
      selectedPlanTime: "",
      selectedItemIs: "",
      startPlanOption: [
        {
          option: "Today",
          isSelected: true,
          dateIs: today,
        },
        {
          option: "Tomorrow",
          isSelected: false,
          dateIs: tomorrow,
        },
        {
          option: "Select Date",
          isSelected: false,
          dateIs: today,
        },
      ],
      hideTodayTomorrow: false,
      dateToday: _dt,
      maxDate: _dt,
      showDateSelector: false,
      sDate: moment(_dt).format("YYYY-MM-DD"),
      subscriptionenabled: "",
      planEndTime: "",
      supportedOrientations: this.props.supportedOrientations,
      renew: this.props.renewPlan ? true : false,
      dateSelectedIS: moment().format("YYYY-MM-DD"),
      planPrice: 0,
      planPriceWithDiscount: 0,
      discountPrice: 0,
      isCouponApplied: false,
    };
  }

  componentDidMount() {
    this.getSubscriotionPlanDetails();
    this.getVitalSubscription();
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.onBackPress();
      return true;
    });
    if (this.state.selectedItemIs !== "") {
      if (this.state.selectedItemIs["duration"] < 30) {
        if (this.state.selectedItemIs["duration"] == 28) {
          this.setState({ durationIsMonth: 1, inDays: false });
        } else {
          this.setState({
            durationInDays: this.state.selectedItemIs["duration"],
            inDays: true,
          });
        }
      } else {
        this.setState({
          durationIsMonth: Math.floor(
            this.state.selectedItemIs["duration"] / 30
          ),
          inDays: false,
        });
      }
      let rangeStart = moment(this.state.dateSelectedIS).format(" MMM DD-YYYY");
      let rangeEnd = moment(this.state.dateSelectedIS)
        .add(this.state.selectedItemIs["duration"], "days")
        .format(" MMM DD-YYYY");
      AppUtils.console("11111-->" + rangeStart + "2222==>" + rangeEnd);
      this.setState({ validity: rangeStart + "-" + rangeEnd });
    }
  }

  async getVitalSubscription() {
    try {
      this.setState({ isLoading: true });
      let subscriptionPlan = await SHApiConnector.getvitalSubscriptionPlan();
      AppUtils.console("Response:", subscriptionPlan);
      this.setState({ isLoading: false });
      if (subscriptionPlan.data.status) {
        subscriptionPlan.data.response.map((val, arrayIndex) => {
          AppUtils.console("qqqqq--->>>>>" + val.subscriptionPlanName);
          if (val.subscriptionPlanName === "Monthly") {
            Object.assign(val, { selected: true });
          } else {
            Object.assign(val, { selected: false });
          }
        });
        this.setState(
          {
            vitalSubscriptionPlan: subscriptionPlan.data.response,
            selectedItemIs: subscriptionPlan.data.response[0],
            duration: subscriptionPlan.data.response[0].duration,
            selectedPlanTime: "Today",
            planPrice: subscriptionPlan.data.response[0].price,
            planPriceWithDiscount: subscriptionPlan.data.response[0].price,
            discountPrice: 0,
          },
          () => {
            if (this.state.renew) {
              setTimeout(() => {
                this.updatePlanModal();
              }, 1000);
            }
            this.state.vitalSubscriptionPlan.map((val) => {
              AppUtils.console("subbb" + val.subscriptionPlanName);
            });
          }
        );
      }
    } catch (e) {
      AppUtils.console("ResponseVitalSubscriptionerror:", e);
      this.setState({ isLoading: false });
    }
  }

  updatePlanModal = () => {
    AppUtils.console("entereddddd" + this.state.planEndTime);
    let updateNewDate = new Date(this.state.planEndTime);

    AppUtils.console(
      "entereddddd" +
        updateNewDate +
        moment(updateNewDate).add(1, "days").format("YYYY-MM-DD")
    );
    datestring = "";
    let datestring =
      updateNewDate.getFullYear() +
      "-" +
      (updateNewDate.getMonth() + 1) +
      "-" +
      (updateNewDate.getDate() + 1);
    this.setState({ sDate: datestring });
    let planDetails = this.state.vitalSubscriptionPlan;
    let startFrom = this.state.startPlanOption;
    let selectedObj = "";
    planDetails.map((plan, arrayIndex) => {
      if (
        plan._id === this.state.subscriptionenabled["vitalSubscriptionPlanId"]
      ) {
        planDetails[arrayIndex].selected = true;
        selectedObj = plan;
        this.setState({ scrollIndex: arrayIndex });
      } else {
        planDetails[arrayIndex].selected = false;
      }
    });
    AppUtils.console(
      "yyyyy" +
        this.state.planEndsONNextDate +
        moment(this.state.planEndsONNextDate).format("YYYY-MM-DD")
    );
    startFrom.push({ option: this.state.planEndsONNextDate, isSelected: true });

    this.setState({
      vitalSubscriptionPlan: planDetails,
      startPlanOption: startFrom,
      planModal: !this.state.planModal,
      hideTodayTomorrow: true,
      selectedPlanTime: this.state.planEndsON,
      dateSelectedIS: moment(updateNewDate).add(1, "days").format("YYYY-MM-DD"),
      selectedItemIs: selectedObj,
      planPrice: selectedObj.price,
      planPriceWithDiscount: selectedObj.price,
      isCouponApplied: false,
      applyCoupon: "",
    });
  };
  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console("timeout", "----->");
      Actions.refresh({ update: true });
    }, 500);
  }

  getSubscriotionPlanDetails = async () => {
    let tokenData = {
      OSType: Platform.OS === "ios" ? "IOS" : "ANDROID",
      fcmToken: await firebaseNotifications.fetchFCMToken(),
      deviceId: getUniqueId(),
    };
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.storeToken(tokenData);
      AppUtils.console("response-->" + JSON.stringify(response));
      this.setState({
        isLoading: false,
      });
      if (response.data.status) {
        let vitalPlan = response;
        let subscriptionPlanDetails =
          vitalPlan.data.response.vitalSubscriptionPlan;
        if (vitalPlan.data.response.hasOwnProperty("vitalSubscriptionPlan")) {
          if (subscriptionPlanDetails.length >= 1) {
            let vitalPlan = response;
            let subscriptionPlanDetails =
              vitalPlan.data.response.vitalSubscriptionPlan;
            let subscribedPlanData = subscriptionPlanDetails[0];
            this.setState({
              subscriptionenabled: subscribedPlanData,
            });
            var startplan = moment(
              subscribedPlanData.planStartsOn.substr(0, 10)
            ).format("YYYY-MM-DD");
            var currentDateIS = moment().format("YYYY-MM-DD");
            var planEnd = moment(
              subscribedPlanData.planEndsOn.substr(0, 10)
            ).format("YYYY-MM-DD");
            AppUtils.console("endddddon" + planEnd);
            this.setState({
              planEndTime: planEnd,
              planEndsONNextDate: moment(planEnd)
                .add(1, "days")
                .format("DD MMM"),
            });
          }
        }
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console("STORE_TOKEN_ERROR", e);
    }
  };

  openCalender() {
    try {
      AppUtils.console("openCalender");

      var self = this;
      var dateexpireOn = new Date(self.state.planEndTime);
      var selectedDate = self.state.hideTodayTomorrow
        ? dateexpireOn.setDate(dateexpireOn.getDate() + 1)
        : moment(self.state.dateToday)._d;
      var maxDate = new Date(2022, 11, 24, 10, 33, 30, 0);
      if (Platform.OS === "ios") {
        self.setState({ planModal: false }, () => {
          setTimeout(() => {
            self.setState({
              showDateSelector: true,
              date: selectedDate,
              mode: "default",
              maxDate: maxDate,
            });
          }, 500);
        });
        AppUtils.console("openCalenderIOS");
      } else {
        self.setState({ planModal: false }, () => {
          setTimeout(() => {
            if (self.state.hideTodayTomorrow) {
              self.showPicker("dateToday", {
                date: selectedDate,
                mode: "default",
                minDate: selectedDate,
                maxDate: maxDate,
              });
            } else {
              self.showPicker("dateToday", {
                date: selectedDate,
                mode: "default",
                maxDate: maxDate,
              });
            }
          }, 500);
        });
      }
    } catch (e) {
      AppUtils.console("error", e);
    }
  }

  setDate(date) {
    try {
      this.setState({
        sDate: moment(date).format("YYYY-MM-DD"),
        dateSelectedIS: moment(date).format("YYYY-MM-DD"),
        planModal: !this.state.planModal,
      });
    } catch (e) {
      AppUtils.console("DiffError", e);
    }
  }

  openDateSelector() {
    let self = this;
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        supportedOrientations={this.state.supportedOrientations}
        visible={this.state.showDateSelector}
        onRequestClose={this.close}
        animationType="fade"
        key={this.state.showDateSelector ? 1 : 2}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(52, 52, 52, 0.8)",
            height: height,
            width: width,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: hp(30),
              alignSelf: "center",
              backgroundColor: AppColors.whiteColor,
              justifyContent: "center",
              width: width - 30,
            }}
          >
            <View
              style={{
                height: 40,
                width: width - 30,
                backgroundColor: AppColors.whiteColor,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                onPress={() => this.setState({ showDateSelector: false })}
              >
                <Image
                  resizeMode={"contain"}
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: 10,
                  }}
                  source={require("../../../assets/images/cancel.png")}
                />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: AppColors.whiteColor }}>
              <DateTimePicker
                mode="date"
                value={new Date(this.state.sDate)}
                display="spinner"
                maximumDate={this.state.maxDate}
                style={{ backgroundColor: AppColors.whiteColor }}
                onChange={(event, selectDate) => {
                  AppUtils.console("eventIs", selectDate);
                  this.setState({ sDate: selectDate });
                }}
              />
            </View>
            <TouchableHighlight
              onPress={() => {
                self.setState({ showDateSelector: false }, () => {
                  this.setDate(this.state.sDate);
                });
              }}
              underlayColor="transparent"
            >
              <View
                style={{
                  backgroundColor: AppColors.colorHeadings,
                  height: 50,
                  width: width - 30,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: AppStyles.fontFamilyBold,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    alignSelf: "center",
                  }}
                >
                  {moment(this.state.sDate).format("DD MMM Y")}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }

  showPicker = async (stateKey, options) => {
    try {
      var newState = {};
      const { action, year, month, day } = await DatePickerAndroid.open(
        options
      );
      if (action === DatePickerAndroid.dismissedAction) {
      } else {
        var date = new Date(year, month, day);
        newState[stateKey] = date;
      }
      this.setState(newState);
      this.setDate(date);
      this.setState({
        selectedPlanTime: "Select Date",
        dateSelectedIS: moment(date).format("YYYY-MM-DD"),
      });
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  setDate(date) {
    try {
      this.setState({
        sDate: moment(date).format("YYYY-MM-DD"),
        planModal: !this.state.planModal,
      });
      this.setState({
        selectedPlanTime: "Select Date",
        dateSelectedIS: moment(date).format("YYYY-MM-DD"),
      });
    } catch (e) {
      AppUtils.console("DiffError", e);
    }
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

  onChangedText(number) {
    AppUtils.console("appp-->" + number);
    this.setState({ applyCoupon: number });
  }
  async applyCoupon() {
    let self = this;
    if (!this.state.applyCoupon) {
      Toast.show(strings("doctor.text.pleaseEnterCouponCode"));
    } else {
      this.setState({ isLoading: true });
      let coupenDetails = {
        referralCode: this.state.applyCoupon,
        module: AppStrings.label.VITAL_SUBSCRIPTION,
      };

      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        AppUtils.console(
          "DiscountCoupon",
          response.data.status,
          "data",
          response.data
        );
        let discount = 0;
        let total = 0;
        this.setState({ isLoading: false });

        if (response.data.status) {
          AppUtils.console("www" + this.state.selectedItemIs["price"]);
          if (response.data.response.valueType === "PERCENT") {
            let offerVal =
              (response.data.response.couponValue * this.state.planPrice) / 100;

            this.setState(
              {
                planPriceWithDiscount: this.state.planPrice - offerVal,
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
              response.data.response.couponValue >= this.state.planPrice
                ? 1
                : this.state.planPrice - response.data.response.couponValue;
            let discountPrice =
              response.data.response.couponValue >= this.state.planPrice
                ? this.state.planPrice - 1
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
          this.setState({ applyCoupon: "" });
        }
      } catch (e) {
        //AppUtils.console("VERIFY_OFFER_ERROR", e)
      }
    }
  }

  validateCoupon = () => {
    let coupon = this.state.couponCode;
    Alert.alert(coupon);
  };

  startPlanFrom(item, dataLength, selectedOption) {
    var data = this.state.startPlanOption;

    for (var i = 0; i < data.length; i++) {
      if (item.item.option == data[i].option) {
        data[i].isSelected = true;
      } else {
        data[i].isSelected = false;
      }
    }
    if (selectedOption == "Today") {
      this.setState({ dateSelectedIS: moment().format("YYYY-MM-DD") });
    } else if (selectedOption == "Tomorrow") {
      this.setState({
        dateSelectedIS: moment().add(1, "days").format("YYYY-MM-DD"),
      });
    } else if (selectedOption == "Select Date") {
      this.setState({ dateSelectedIS: this.state.sDate });
    }

    this.setState(
      {
        startPlanOption: data,
        selectedPlanTime: selectedOption,
      },
      () => {
        if (item.item.option == "Select Date") {
          this.openCalender();
        }
      }
    );
  }

  _render_Details(item, dataLength) {
    let today = this.state.hideTodayTomorrow;
    if (item.item.isSelected == undefined) {
      item.item.isSelected = false;
    }

    return (today && item.item.option == "Today") ||
      (today && item.item.option == "Tomorrow") ? null : (
      <ElevatedView
        style={{
          width: item.item.option == "Select Date" ? wp(30) : wp(22),
          height: hp(6),
          backgroundColor: item.item.isSelected
            ? AppColors.primaryColor
            : AppColors.whiteColor,
          borderColor: item.item.isSelected
            ? AppColors.primaryColor
            : AppColors.primaryGray,
          borderRadius: wp(1),
          flexDirection: "row",
          marginLeft:
            item.item.option == "Today" ||
            (today && item.item.option == "Tomorrow")
              ? wp(0)
              : wp(5),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
        }}
      >
        <TouchableOpacity
          style={{
            alignSelf: "center",
          }}
          onPress={() => this.startPlanFrom(item, dataLength, item.item.option)}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: 12,
                color: item.item.isSelected
                  ? AppColors.whiteColor
                  : AppColors.primaryGray,
                textAlign: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              {item.item.option == "Select Date"
                ? this.state.sDate
                : item.item.option}
            </Text>
            {item.item.option == "Select Date" ? (
              <Image
                resizeMode={"cover"}
                style={{
                  height: wp(3),
                  width: wp(2),
                  tintColor: item.item.isSelected
                    ? AppColors.whiteColor
                    : AppColors.primaryGray,
                  marginLeft: wp(4),
                }}
                source={require("../../../assets/images/drop_black.png")}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </ElevatedView>
    );
  }

  _renderModalContent = () => (
    <BottomUp
      isVisible={this.state.planModal}
      onBackdropPress={() =>
        this.setState({
          planModal: !this.state.planModal,
        })
      }
      onBackButtonPress={() =>
        this.setState({
          planModal: !this.state.planModal,
        })
      }
      style={{
        justifyContent: "flex-end",
        margin: 0,
      }}
    >
      <View
        style={{
          backgroundColor: AppColors.whiteColor,
          paddingTop: wp("5"),
          justifyContent: "center",
          alignItems: "center",
          borderTopRightRadius: wp(8),
          borderTopLeftRadius: wp(8),
          borderColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={styles.topBar}></View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text
                allowFontScaling={false}
                style={[styles.vitalHeadingText, { paddingRight: wp(50) }]}
              >
                {strings("vital.vital.selectVitalSign")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  planModal: !this.state.planModal,
                })
              }
            >
              <Text
                style={[
                  styles.vitalHeadingText,
                  { color: AppColors.colorHeadings },
                ]}
              >
                {strings("string.btnTxt.close")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dividerVital}></View>
        </View>

        <View
          style={{
            height: hp(25),
            width: wp("90%"),
            flexDirection: "row",
          }}
        >
          <FlatList
            data={this.state.vitalSubscriptionPlan}
            renderItem={(item, index) => this.renderItemPlan(item, index)}
            keyExtractor={(item) => item._id}
            numColumns={3}
          />
        </View>
        <View
          style={{
            width: wp(90),
            marginTop: hp(3),
            height: hp(6),
            justifyContent: "center",
            alignSelf: "flex-start",
            marginLeft: wp(5),
          }}
        >
          <Text
            allowFontScaling={false}
            style={[styles.vitalHeadingText, { color: AppColors.blackColor }]}
          >
            {strings("vital.vital.whenToStartPlan")}
          </Text>
        </View>

        <View
          style={{
            width: wp(90),
            marginBottom: hp("5"),
            height: hp(6),
          }}
        >
          <FlatList
            data={this.state.startPlanOption}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(item) =>
              this._render_Details(item, this.state.startPlanOption.length)
            }
            numColumns={4}
            extraData={this.state}
          />
        </View>

        <TouchableOpacity onPress={() => this.subscriptionDetails()}>
          <View
            style={{
              backgroundColor: AppColors.colorHeadings,
              marginBottom: hp("5"),
              alignSelf: "flex-end",
              borderRadius: wp(2),
              borderColor: "rgba(0, 0, 0, 0.1)",
              width: wp(90),
              height: hp(6),
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                color: AppColors.whiteColor,
                fontFamily: AppStyles.fontFamilyDemi,
              }}
            >
              {strings("doctor.button.continue")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </BottomUp>
  );

  removeCoupon() {
    this.setState({
      discountPrice: 0,
      planPriceWithDiscount: this.state.planPrice,
      isCouponApplied: false,
      applyCoupon: "",
    });
  }

  subscriptionDetails = () => {
    AppUtils.console(
      "selectedInfo" +
        JSON.stringify(this.state.selectedItemIs) +
        "-->" +
        this.state.selectedPlanTime +
        "-->>" +
        this.state.dateSelectedIS
    );
    if (this.state.selectedItemIs["duration"] < 30) {
      if (this.state.selectedItemIs["duration"] == 28) {
        this.setState({ durationIsMonth: 1, inDays: false });
      } else {
        this.setState({
          durationInDays: this.state.selectedItemIs["duration"],
          inDays: true,
        });
      }
    } else {
      this.setState({
        durationIsMonth: Math.floor(this.state.selectedItemIs["duration"] / 30),
        inDays: false,
      });
    }
    let rangeStart = moment(this.state.dateSelectedIS).format(" MMM DD-YYYY");
    let rangeEnd = moment(this.state.dateSelectedIS)
      .add(this.state.selectedItemIs["duration"], "days")
      .format(" MMM DD-YYYY");
    AppUtils.console("11111-->" + rangeStart + "2222==>" + rangeEnd);
    this.setState({ validity: rangeStart + "-" + rangeEnd });

    this.closePlanModal();
  };

  closePlanModal = () => {
    this.setState({ planModal: !this.state.planModal, applyCoupon: "" });
  };

  renderItemPlan = ({ item, index }) => (
    <VitalCard
      title={item.subscriptionPlanName}
      itemIs={item}
      indexValue={index}
      symbol={item.currencySymbol}
      currency={item.price}
      data={this.state.vitalSubscriptionPlan}
      selected={item.selected}
      updatePlan={(indexvall) => this.updatePlanSelected(indexvall, item)}
    />
  );

  updatePlanSelected = (index, itemIs) => {
    let plan = this.state.vitalSubscriptionPlan;
    plan.map((val, arrayIndex) => {
      if (arrayIndex === index) {
        plan[arrayIndex].selected = true;
      } else {
        plan[arrayIndex].selected = false;
      }
    });

    this.setState({
      vitalSubscriptionPlan: plan,
      selectedItemIs: itemIs,
      planPrice: itemIs.price,
      planPriceWithDiscount: itemIs.price,
      isCouponApplied: false,
      applyCoupon: "",
    });
  };

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
                  {this.state.selectedItemIs["subscriptionPlanName"]}
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
                  {this.state.selectedItemIs["currencySymbol"]}
                  {this.state.selectedItemIs["price"]}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => this.closePlanModal()}
                style={{
                  width: wp(20),
                  height: hp(4),
                  backgroundColor: AppColors.colorHeadings,
                  marginTop: hp(2),
                  marginLeft: wp(3),
                  justifyContent: "center",
                  borderRadius: wp(1),
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    textAlign: "center",
                    color: AppColors.whiteColor,
                  }}
                >
                  {strings("vital.vital.changePlan")}
                </Text>
              </TouchableOpacity>
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
                    {this.state.selectedItemIs["currencySymbol"]}
                    {this.state.planPrice}
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
                    {this.state.selectedItemIs["currencySymbol"]}
                    {this.state.discountPrice}
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
                    {this.state.selectedItemIs["currencySymbol"]}
                    {this.state.planPriceWithDiscount}
                  </Text>
                </View>
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
          </View>

          {this._renderModalContent()}
          {this.state.showDateSelector ? this.openDateSelector() : null}
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

  payNow = async () => {
    let couponCodeApplied =
      this.state.applyCoupon == "" ? null : this.state.applyCoupon;
    this.setState({ planModal: false });

    AppUtils.console("isssss" + couponCodeApplied);
    AppUtils.console("isssss" + this.state.selectedItemIs["_id"]);
    let subscriptionDetails = {
      vitalSubscriptionPlanId: this.state.selectedItemIs["_id"],
      planStartsOn: this.state.dateSelectedIS,
      referralCode: couponCodeApplied,
    };

    try {
      let subscribedPlan = await SHApiConnector.payForVitalSubscription(
        subscriptionDetails
      );
      AppUtils.console(
        "ResponseISS_Vital:",
        subscribedPlan,
        subscribedPlan.data,
        subscribedPlan.data.status
      );
      let data = "";
      this.setState({ isLoading: false }, () => {
        setTimeout(() => {
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
                durationDays: this.state.durationInDays,
                durationMonth: this.state.durationIsMonth,
              });
            }
          }
        }, 500);
      });
    } catch (e) {
      AppUtils.console("subscribedPlanerror:", e);
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
          backgroundColor: AppColors.whiteColor,
          paddingBottom: AppUtils.isX ? hp(2) : 0,
          elevation: 2,
          alignItems: "center",
          justifyContent: "center",
          height: AppUtils.isX ? hp(12) : hp(10),
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.payNow();
          }}
          style={{
            width: wp(90),
            borderRadius: hp(1),
            alignSelf: "center",
            backgroundColor: AppColors.colorHeadings,
          }}
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
  mainScreenContainer: {
    flex: 1,
    height: hp(100),
    width: wp(100),
    flexDirection: "column",
    alignItems: "center",
  },
  clnqLogo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: AppUtils.isX ? hp(5) : hp(5),
  },
  selectOption: {
    flexDirection: "column",
    paddingBottom: AppUtils.isIphone ? (AppUtils.isX ? hp(1) : hp(1)) : hp(1),
    elevation: 5,
  },
  bookingButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    width: wp(45),
  },
  bookDoctorAppointment: {
    paddingBottom: hp(2),
    height: hp(17),
    width: wp(41),
    borderRadius: 7,
    borderWidth: 0,
    elevation: 2,
  },
  medicalTransport: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
    color: AppColors.newTitle,
    width: wp(25),
    alignItems: "center",
    marginTop: hp(2),
    height: hp(6),
    lineHeight: hp(1.8),
    fontFamily: AppStyles.fontFamilyDemi,
  },
  medicalTransportSubText: {
    marginLeft: wp(2),
    fontSize: wp(3),
    marginTop: hp(2),
    marginRight: wp(2),
    color: AppColors.newSubTitle,
    lineHeight: hp(1.8),
    fontFamily: AppStyles.fontFamilyMedium,
  },
  bookImages: { height: hp(7), width: wp(7), alignSelf: "center" },
  bookView: { flexDirection: "row", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    width: wp(25),
    height: hp(1),
    borderRadius: hp(2),
    backgroundColor: AppColors.greyBorder,
    marginBottom: hp(3),
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  vitalHeadingText: {
    fontFamily: AppStyles.fontFamilyDemi,
    fontSize: 15,
    color: AppColors.black,
    marginBottom: hp(3),
  },
  dividerVital: {
    width: wp("100%"),
    height: hp(0.2),
    flexDirection: "row",
    backgroundColor: AppColors.greyBorder,
    marginBottom: hp(3),
  },
  renewContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.transparent,
  },
  renewBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.transparent,
    flex: 1,
  },
  innerContainer: {
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    height: hp("38%"),
    width: wp("90%"),
    borderRadius: wp(4),
    marginRight: hp("5%"),
    marginLeft: hp("5%"),
    marginTop: hp("3%"),
  },
  adminInnerContainer: {
    backgroundColor: "#FFFFFF",
    height: hp("38%"),
    width: wp("90%"),
    borderRadius: wp(4),
    marginRight: hp("5%"),
    marginLeft: hp("5%"),
    marginTop: hp("3%"),
  },
  contentView: { flex: 0.5, alignItems: "flex-end" },
  cancelstyle: {
    marginRight: wp(5),
    height: hp(3),
    width: wp(4),
  },
  textView: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: hp("3%"),
    flexDirection: "column",
    marginRight: hp("5%"),
  },
  planButton: {
    backgroundColor: AppColors.colorHeadings,
    flexDirection: "row",
    height: hp("7"),
    width: wp("35%"),
    margin: wp("5%"),
    //marginBottom:hp(10),
    borderRadius: hp("1"),
    alignItems: "flex-end",
    justifyContent: "center",

    marginTop: hp("3"),
  },
  planButtonText: {
    fontSize: 13,
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.whiteColor,
    alignSelf: "center",
  },
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
