import React from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Actions } from "react-native-router-flux";
import { WebView } from "react-native-webview";
import { strings } from "../../locales/i18n";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppColors } from "../../shared/AppColors";
import { AppStrings } from "../../shared/AppStrings";
import { AppUtils } from "../../utils/AppUtils";
import ProgressLoader from "rn-progress-loader";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
let success = require("../../../assets/images/success.png");
let unsuccess = require("../../../assets/images/cancel.png");
let successMessage = "Your payment request is successful !";
let cancelledMessage = "Cancelled";
import { moderateScale } from "../../utils/Scaling";
import AsyncStorage from "@react-native-community/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";
import { SafeAreaView } from "react-native-safe-area-context";

var sha512 = require("js-sha512");

const { width, height } = Dimensions.get("window");

const delayedCallback = (cb, timeout = 0) =>
  new Promise((resolve) => {
    setTimeout(() => {
      cb();
      resolve();
    }, timeout);
  });

class XenditPayment extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Xendit Payment Screen");

    this.state = {
      isLoading: false,
      isDataVisible: false,
      isRequestDone: false,
      isPaySuccess: false,
      message: "",
      isPaymentProcessCompleted: false,
      moduleName: "",
      expireON: this.props.expireTime,
      invoiceUrl: null,
      invoiceId: null,
    };

    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    this.payment();
    this.backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.handleBackPress();
      return true;
    });
  }

  async _onNavigationStateChange(webViewState) {
    AppUtils.console("webViewState:", webViewState, this.props);
    let responseURL = webViewState.url;
    if (
      Platform.OS === "ios"
        ? responseURL.includes(
            `/${AppStrings.xenditDetails.CANCEL_WEBHOOK_ENDPOINT}`
          )
        : responseURL.startsWith(
            `myclnq://${AppStrings.xenditDetails.CANCEL_CALLBACK_ENDPOINT}`
          )
    ) {
      this.setState({
        isPaymentProcessCompleted: true,
        isLoading: true,
      });
      await delayedCallback(this.handleCancel, 500);
    } else if (
      Platform.OS === "ios"
        ? responseURL.includes(
            `/${AppStrings.xenditDetails.SUCCESS_WEBHOOK_ENDPOINT}`
          )
        : responseURL.startsWith(
            `myclnq://${AppStrings.xenditDetails.SUCCESS_CALLBACK_ENDPOINT}`
          )
    ) {
      this.setState({
        isPaymentProcessCompleted: true,
        isLoading: true,
      });
      await delayedCallback(this.handleSuccess, 500);
    } else {
      AppUtils.console("ignore-------------------------------->", responseURL);
    }
  }

  componentWillUnmount() {
    this.backhandler.remove();
  }

  async handleCancel() {
    AppUtils.console("Payment_Cancelled");
    this.setState({
      isRequestDone: true,
      isPaySuccess: false,
      message: cancelledMessage,
    });
    await delayedCallback(() => {
      AppUtils.console(
        "timeout",
        "--------------------------------------------------->"
      );
    }, 500);
    if (
      this.props.module === AppStrings.key.equipment ||
      this.props.module === AppStrings.key.appointment
    ) {
      Actions.pop();
    } else if (this.props.module === AppStrings.key.vital) {
      Actions.MainScreen();
    } else if (this.props.module === AppStrings.key.medicine) {
      Actions.pop();
      setTimeout(() => {
        AppUtils.console("timeout", "----->");
        Actions.refresh({ update: true });
      }, 500);
    } else if (this.props.module === AppStrings.key.caregiver) {
      Actions.caregiverTab({ isCaregiverBookingUpdated: true });
    } else {
      Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
    }
  }

  async handleBackPress() {
    AppUtils.console("Payment_Cancelled");
    let xenditData = this.props.paymentDetails;
    await SHApiConnector.xenditPaymentCallback(
      this.state.moduleName,
      this.state.invoiceId
    );
    this.setState({
      isPaymentProcessCompleted: true,
      isLoading: true,
    });
    await delayedCallback(this.handleCancel, 500);
  }

  async handleSuccess() {
    AppUtils.console("Payment_Success");
    await AppUtils.positiveEventCount();
    this.setState({
      isRequestDone: true,
      isPaySuccess: true,
      message: successMessage,
    });
    await delayedCallback(() => {
      AppUtils.console(
        "timeout",
        "--------------------------------------------------->"
      );
    }, 500);
    if (this.props.module === AppStrings.key.equipment) {
      Actions.drawer({ isMedicalEquipmentBookingUpdated: true });
    } else if (this.props.module === AppStrings.key.caregiver) {
      Actions.caregiverTab({ isCaregiverBookingUpdated: true });
    } else if (this.props.module === AppStrings.key.medicine) {
      Actions.pop();
      setTimeout(() => {
        Actions.refresh({ update: true });
      }, 500);
    } else if (this.props.module === AppStrings.key.vital) {
      const subscribbedPlan = {
        data: this.props.subdetails,
        expireTime: this.state.expireON,
        duration: this.props.durationIs,
      };
      AsyncStorage.setItem("planInfo", JSON.stringify(subscribbedPlan));
      Actions.MainScreen();
    } else if (this.props.module === AppStrings.key.appointment) {
      if (this.props.callType == "AUDIO" || this.props.callType == "VIDEO") {
        Alert.alert(
          strings("doctor.alertTitle.paySuccess"),
          strings("doctor.alertMsg.paySuccess"),
          [
            {
              text: strings("doctor.button.ok"),
              onPress: () =>
                Actions.HomeScreenDash({ isAppointmentUpdated: true }),
            },
          ]
        );
      } else {
        Actions.HomeScreenDash({ isAppointmentUpdated: true });
      }
    } else {
      Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
    }
  }

  payment() {
    this.setState({ moduleName: this.props.module });
    let xenditData = this.props.paymentDetails;
    AppUtils.console("KSCNJSNC:", xenditData);

    if (!xenditData) {
      AppUtils.console("invalid payment details has been passed");
      return;
    } else if (xenditData.invoice_url && xenditData.invoice_url === null) {
      AppUtils.console("invoice expired or completed");
      return;
    } else if (xenditData.invoice_url) {
      this.setState({
        invoiceUrl: xenditData.invoice_url,
        invoiceId: xenditData.id,
      });
    }
  }

  renderLoading() {
    return (
      <ProgressLoader
        visible={this.state.isLoading}
        isModal={true}
        isHUD={true}
        hudColor={AppColors.whiteColor}
        color={AppColors.primaryColor}
      />
    );
  }

  render() {
    AppUtils.console("paymentData", this.props);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => this.handleBackPress()}>
            <AntDesign name="arrowleft" size={32} color={"white"} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
          {this.state.isRequestDone ? (
            <View
              style={{
                width: wp(100),
                height: hp(100),
                marginRight: moderateScale(5),
                marginLeft: moderateScale(5),
                justifyContent: "center",
                alignItem: "center",
                alignSelf: "center",
              }}
            >
              <Image
                resizeMode={"contain"}
                source={this.state.isPaySuccess ? success : unsuccess}
                style={[
                  styles.cancelIcon,
                  { height: hp(30), width: wp(50), alignSelf: "center" },
                ]}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.emptyMessage,
                  {
                    alignSelf: "center",
                    fontSize: hp(3),
                    textAlign: "center",
                    color: this.state.isPaySuccess
                      ? AppColors.greenColor
                      : AppColors.primaryColor,
                  },
                ]}
              >
                {this.state.message}
              </Text>
            </View>
          ) : this.state.isPaymentProcessCompleted ? (
            this.renderLoading()
          ) : (
            <WebView
              style={{
                height: hp(100),
                width: wp(100),
              }}
              startInLoadingState={true}
              source={{ uri: this.state.invoiceUrl }}
              renderLoading={() => this.renderLoading()}
              androidHardwareAccelerationDisabled={false}
              onNavigationStateChange={this._onNavigationStateChange.bind(this)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default XenditPayment;

const Header = () => (
  <View style={styles.header1}>
    <Text style={styles.title}>{strings("common.common.payment")}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    width: wp(100),
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: AppColors.primaryColor,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    color: AppColors.primaryColor,
  },
  header1: {
    paddingTop: hp(5),
    paddingBottom: 10,
    backgroundColor: "#0c084c",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp(-4),
  },
  blackArrowIcon: {
    height: hp(4),
    width: wp(9),
    marginLeft: 10,
    tintColor: AppColors.whiteColor,
    marginTop: hp(2),
  },
});
