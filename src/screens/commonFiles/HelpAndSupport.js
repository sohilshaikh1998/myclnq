import React from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  I18nManager
} from "react-native";
import { Actions } from "react-native-router-flux";
import { AppStyles } from "../../shared/AppStyles";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { getCountry } from "react-native-localize";
import { AppColors } from "../../shared/AppColors";
import { AppStrings } from "../../shared/AppStrings";
import { AppUtils } from "../../utils/AppUtils";

const { width, height } = Dimensions.get("window");
const isRTL = I18nManager.isRTL;

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { strings } from "../../locales/i18n";
import AsyncStorage from "@react-native-community/async-storage";
import i18next from "i18next";

class HelpAndSupport extends React.Component {
  constructor(props) {
    AppUtils.analyticsTracker("Help & Support");
    super();
    super(props);
    this.state = {
      name: "",
      email: "",
      message: "",
      feedbackType: "",
      contactNumber: "",
      email: "",
    };
  }

  async getContactNumber() {
    try {
      const userCountryCode = JSON.parse(
        await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)
      ).countryCode;
      const { singapore, malaysia, arabic } = AppStrings.contactNumbers;
      if (userCountryCode === "60") {
        this.setState({ contactNumber: malaysia });
      } else if (userCountryCode ==="971"){
        this.setState({contactNumber: arabic})
      }
      else this.setState({ contactNumber: singapore });
    } catch (e) {
      AppUtils.console("ResponseVitalSubscriptionerror:", e);
    }
  }
  getEmail = async () => {
    try {
      const userCountryCode = JSON.parse(
        await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER)
      ).countryCode;
      const { singapore, malaysia } = AppStrings.contactEmails;
      if (userCountryCode === "60") {
        this.setState({ email: malaysia });
      } else this.setState({ email: singapore });
    } catch (e) {
      AppUtils.console("ResponseVitalSubscriptionerror:", e);
    }
  };

  componentDidMount() {
    this.getContactNumber();
    this.getEmail();
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.goBack();
      return true;
    });
  }

  goBack() {
    Actions.Settings();
  }

  render() {
    const { email } = this.state;
    return (
      <View
        style={{
          height: height,
          width: width,
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <View
          style={{
            margin: moderateScale(20),
            marginTop: verticalScale(20),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{ height: verticalScale(70), width: moderateScale(70) }}
            source={require("../../../assets/images/clnq_main_logo.png")}
          />
          <Text
            style={{
              color: AppColors.primaryColor,
              fontFamily: AppStyles.fontFamilyMedium,
              fontSize: moderateScale(20),
            }}
          >
            MyCLNQ
          </Text>
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: moderateScale(15),
              marginTop: moderateScale(20),
              lineHeight: hp(2.5),
              textAlign: isRTL ? 'left' : 'auto',

            }}
          >
            {strings("common.common.reachOutApp", { email })}
          </Text>
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: moderateScale(15),
              lineHeight: hp(2.5),
              marginTop: moderateScale(20),
              marginRight: wp(4),
              textAlign: isRTL ? 'left' : 'auto'
            }}
          >
            {strings("common.common.callUs")}
            <Text
              style={{
                color: AppColors.primaryColor,
                textDecorationLine: "underline",
                textAlign: isRTL ? 'left' : 'auto'

              }}
            >
              {"\n" + this.state.contactNumber}
            </Text>
            .
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
  },
});

export default HelpAndSupport;
