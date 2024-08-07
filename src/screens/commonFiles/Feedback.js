import React from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  I18nManager,
} from "react-native";
import { Actions } from "react-native-router-flux";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { Validator } from "../../shared/Validator";
import { AppColors } from "../../shared/AppColors";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import SHButtonDefault from "../../shared/SHButtonDefault";
import { RadioButton, RadioGroup } from "react-native-flexi-radio-button";
import { strings } from "../../locales/i18n";
const isRTL = I18nManager.isRTL;
const { width, height } = Dimensions.get("window");

class Feedback extends React.Component {
  constructor(props) {
    AppUtils.analyticsTracker("Feedback");
    super();
    super(props);
    this.state = {
      name: "",
      email: "",
      message: "",
      feedbackType: "SUGGESTION",
    };
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

  onSelectType(index, value) {
    if (index == 0) {
      this.setState({
        feedbackType: "SUGGESTION",
      });
    } else if (index == 1) {
      this.setState({
        feedbackType: "COMPLAINT",
      });
    } else {
      this.setState({
        feedbackType: "OTHERS",
      });
    }
  }

  validateEmail() {
    if (Validator.validateEmail(this.state.email)) {
      alert(strings("common.common.enterCorrectEmail"));
    } else {
      this.refs.message.focus();
    }
  }

  render() {
    return (
      <ScrollView
        style={{
          height: height,
          width: width,
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <View
          style={{
            margin: moderateScale(20),
            marginTop: verticalScale(50),
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: AppColors.primaryColor,
              fontFamily: AppStyles.fontFamilyMedium,
              fontSize: moderateScale(15),
              textAlign: isRTL ? 'left' : 'auto',

            }}
          >
            {strings("common.common.feedbackMsg")}
          </Text>
          <View style={{ marginTop: verticalScale(30) }}>
            <TextInput
              allowFontScaling={false}
              placeholder={strings("common.common.yourName")}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.name}
              numberOfLines={1}
              onChangeText={(input) => this.setState({ name: input })}
              returnKeyType="next"
              underlineColorAndroid={"white"}
              onSubmitEditing={(event) => {
                Keyboard.dismiss();
                this.refs.email.focus();
              }}
            />
          </View>
          <View style={{ marginTop: verticalScale(30) }}>
            <TextInput
              allowFontScaling={false}
              ref="email"
              placeholder={strings("common.common.email")}
              placeholderTextColor={AppColors.textGray}
              style={styles.inputStyle}
              value={this.state.email}
              onChangeText={(input) => this.setState({ email: input })}
              returnKeyType="next"
              multiLine={false}
              underlineColorAndroid={"white"}
              onSubmitEditing={(event) => {
                Keyboard.dismiss();
                // this.validateEmail();
              }}
            />
          </View>
          <View style={{ flexDirection: "row", marginTop: verticalScale(30) }}>
            <RadioGroup
              style={{ flexDirection: "row" }}
              color={AppColors.primaryGray}
              activeColor={AppColors.primaryColor}
              selectedIndex={0}
              onSelect={(index, value) => this.onSelectType(index, value)}
            >
              <RadioButton value={"Suggestions"}>
                <Text style={{ color: AppColors.blackColor }}>
                  {strings("common.common.suggestions")}
                </Text>
              </RadioButton>

              <RadioButton value={"Complaints"}>
                <Text style={{ color: AppColors.blackColor }}>
                  {strings("common.common.complaints")}
                </Text>
              </RadioButton>
              <RadioButton value={"Others"}>
                <Text style={{ color: AppColors.blackColor }}>
                  {strings("common.common.others")}
                </Text>
              </RadioButton>
            </RadioGroup>
          </View>

          <View style={{ marginTop: verticalScale(30) }}>
            <TextInput
              allowFontScaling={false}
              ref="message"
              placeholder={strings("common.common.description")}
              placeholderTextColor={AppColors.textGray}
              multiline={true}
              style={styles.inputStyle}
              value={this.state.message}
              onChangeText={(input) => this.setState({ message: input })}
              returnKeyType="done"
              underlineColorAndroid={"white"}
              maxLength={300}
            />
          </View>
          <View
            style={{
              alignSelf: "center",
              flexDirection: "row",
              marginTop: verticalScale(50),
            }}
          >
            <SHButtonDefault
              btnText={strings("doctor.button.cancel")}
              btnType={"border-only"}
              btnTextColor={AppColors.blackColor}
              btnPressBackground={"transparent"}
              style={{ margin: moderateScale(5) }}
              onBtnClick={() => this.cancel()}
            />
            <SHButtonDefault
              btnText={strings("doctor.button.submit")}
              btnType={"normal"}
              style={{ margin: moderateScale(5) }}
              onBtnClick={() => this.validateFields()}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  cancel() {
    Actions.pop();
  }

  validateFields() {
    const { name, email, message, feedbackType } = this.state;
    let errorString = "";
    const rjx = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w\w+)+$/;
    const isValid = rjx.test(email.trim());
    if (Validator.isBlank(name.trim())) {
      errorString = errorString + strings("string.mandatory.name") + "\n";
    }
    if (Validator.isBlank(email.trim())) {
      errorString = errorString + strings("string.mandatory.email") + "\n";
    } else if (!isValid) {
      errorString =
        errorString + strings("string.mandatory.invalidEmail") + "\n";
    }
    if (Validator.isBlank(message.trim())) {
      errorString = errorString + strings("string.mandatory.message") + "\n";
    }
    if (errorString) {
      this.callAlert({ error_message: errorString });
    } else {
      alert("Message Sent !!!");
      this.sendFeedBack();
    }
  }

  callAlert = (data) =>
    Alert.alert("", data.error_message, [
      {
        text: "ok",
        onPress: () => console.log("Ok Pressed"),
      },
    ]);

  sendFeedBack() {
    var self = this;
    var details = {
      name: self.state.name,
      mailId: self.state.email,
      description: self.state.message,
      feedBackType: self.state.feedbackType,
    };

    AppUtils.userSessionValidation(function (loggedIn) {
      if (!loggedIn) {
        alert(strings("common.common.loginForFeedback"));
        // Actions.LoginMobile({ screen: "feedback" });
        Actions.LoginOptions();
      } else {
        SHApiConnector.feedback(details, function (err, stat) {
          try {
            if (stat) {
              if (stat.status) {
                self.successFul();
              }
            }
          } catch (e) {
            console.error(e);
          }
        });
      }
    });
  }

  successFul() {
    console.log('hereeeee')
    Alert.alert(
      strings("common.common.thanksForTime"),
      strings("common.common.feedbackSuccess"),
      [{ text: strings("common.common.done"), onPress: () =>             Actions.pop() }]
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
    textAlign: isRTL ? 'right' : 'auto',
  },
});

export default Feedback;
