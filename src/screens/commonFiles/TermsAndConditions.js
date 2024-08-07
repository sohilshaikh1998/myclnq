import React from "react";
import { BackHandler, Dimensions } from "react-native";

import { AppUtils } from "../../utils/AppUtils";
import { WebView } from "react-native-webview";
import { Actions } from "react-native-router-flux";
import { strings } from "../../locales/i18n";
import AsyncStorage from "@react-native-community/async-storage";
import { AppStrings } from "../../shared/AppStrings";

const { width, height } = Dimensions.get("window");

class TermsAndConditions extends React.Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Terms & Conditions");
    this.state = {
      uri: "",
    };
  }

  async componentDidMount() {
    const data = await AsyncStorage.getItem(
      AppStrings.contracts.LOGGED_IN_USER_DETAILS
    );
    this.setState({
      uri:
        JSON.parse(data)?.countryCode === "60"
          ? "https://myclnq.co/terms-and-conditions-malaysia/"
          : "http://myclnq.co/termsandcondition.html",
    });
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
    return this.state.uri ? (
      <WebView
        androidHardwareAccelerationDisabled={true}
        source={{ uri: this.state.uri }}
        style={{ height: height, width: width }}
      />
    ) : null;
  }
}

export default TermsAndConditions;
