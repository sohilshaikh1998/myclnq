import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  TouchableHighlight,
  Button,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React from "react";
import { AppColors } from "../../shared/AppColors";
import { moderateScale, verticalScale } from "../../utils/Scaling";
import { AppStyles } from "../../shared/AppStyles";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import SHButtonDefault from "../../shared/SHButtonDefault";
import { strings } from "../../locales/i18n";
import { AppUtils } from "../../utils/AppUtils";
import { SHApiConnector } from "../../network/SHApiConnector";
import moment from "moment-timezone";
import ProgressLoader from "rn-progress-loader";
import { Actions } from "react-native-router-flux";
import Toast from "react-native-simple-toast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const { width, height } = Dimensions.get("window");


class AbhaRegistration extends React.Component {
  constructor(props) {
    super(props);
    this.onSuccess.bind(this);
    this.state = {
      aadharNumber: "",
      generateAadharTransactionId: "",
      verifyAadharTransactionId: "",
      verifyMobileTransactionId: "",
      generateMobileTransactionId: "",
      mobileNum: "",
      isAadharOTPVerified: false,
      isMobileOTPVerified: false,
      isLoading: false,
      abhaAddress: "",
      aadharOTP: "",
      mobileOTP: "",
      isModalVisible: false,
    };
  }

  toastTimer(message) {
    AppUtils.console("Sfsfdsd_message", message);
    setTimeout(() => {
      Toast.show(message);
    }, 500);
  }
  goBack() {
    Actions.pop();
  }

  onSuccess = (data) => {
    this.props.onSuccess(data);
  };

  async verifyAadharOTP() {
    var self = this;
    if (this.state.aadharOTP === "" && this.state.aadharOTP < 4) {
      this.toastTimer(strings("common.abha.please_enter_otp"));
      return;
    }
    let body = {
      otp: this.state.aadharOTP,
      txnId: this.state.generateAadharTransactionId,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.verifyAadharOTP(body);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let transactionId = responseBody.data.txnId;
        self.setState({ verifyAadharTransactionId: transactionId });
        self.setState({ isAadharOTPVerified: true });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
        self.setState({ aadharOTP: "" });
      }
    } catch (e) {
      self.setState({ isLoading: false, aadharOTP: "" });
    } finally {
      self.setState({ isModalVisible: false });
    }
  }

  async generateHealthId() {
    var self = this;
    if (
      this.state.verifyAadharTransactionId === "" &&
      this.state.verifyMobileTransactionId === ""
    ) {
      this.toastTimer(strings("common.abha.verify_both"));
      return;
    }
    if (this.state.verifyMobileTransactionId === "") {
      this.toastTimer(strings("common.abha.verify_mobile_first"));
      return;
    }
    if (this.state.abhaAddress < 6) {
      this.toastTimer(strings("common.abha.enter_health_id"));
      return;
    }
    let body = {
      healthId: this.state.abhaAddress.trim(),
      txnId: this.state.verifyMobileTransactionId,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.verifyUserHealthId(body);
      AppUtils.console("sfdafrdfxdzfsdefwfd", response.data);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (responseBody.status) {
        let userDetails = responseBody.data;
        const dob = new Date(
          userDetails.yearOfBirth,
          (Number.parseInt(userDetails.monthOfBirth) - 1).toString(),
          userDetails.dayOfBirth
        );
        let data = {
          firstname: AppUtils.nullChecker(userDetails.firstName),
          lastname: AppUtils.nullChecker(userDetails.lastName),
          mobilenumber: AppUtils.nullChecker(userDetails.mobile),
          email: AppUtils.nullChecker(userDetails.email),
          dob: dob,
          gender: userDetails.gender === "M" ? "Male" : "Female",
          profileurl: AppUtils.nullChecker(userDetails.profilePhoto),
          healthid: userDetails.healthId,
          healthidnumber: userDetails.healthIdNumber,
        };
        this.onSuccess(data);
        this.goBack();
      } else {
        AppUtils.console("sdzxdfgdgfgd_146", responseBody.data);
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      self.setState({ isLoading: false });
    }
  }

  disclaimerFirAadharConfirmation(){
    if (this.state.verifyAadharTransactionId != "") {
      return;
    }
    if (this.state.aadharNumber.length < 12) {
      this.toastTimer(strings("common.abha.enter_aadhar_num"));
      return;
    }
      Alert.alert("Disclaimer", "By clicking Yes I consent to generate ABHA Number and address, by using my AADHAR details.",
      [
        { text: strings('doctor.button.capYes'), onPress: () => this.generateAadharOtp() },
        { text: strings('doctor.button.capNo'), style: 'cancel' }
      ]
    )
     
  }

    async generateAadharOtp() {
    var self = this;

    let body = {
      aadhaar: this.state.aadharNumber,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.generateAadharOTP(body);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let transactionId = responseBody.data.txnId;
        self.setState({
          generateAadharTransactionId: transactionId,
          isModalVisible: true,
        });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      self.setState({ isLoading: false, isModalVisible: false });
    }
  }
  async verifyMobileOTP() {
    var self = this;
    if (this.state.mobileOTP === "" && this.state.mobileOTP < 4) {
      this.toastTimer(strings("common.abha.please_enter_otp"));
      return;
    }
    let body = {
      otp: this.state.mobileOTP,
      txnId: this.state.generateMobileTransactionId,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.verifyMobileOTP(body);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let transactionId = responseBody.data.txnId;
        self.setState({ verifyMobileTransactionId: transactionId });
        self.setState({ isMobileOTPVerified: true });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
        self.setState({ mobileOTP: "" });
      }
    } catch (e) {
      self.setState({ isLoading: false, mobileOTP: "" });
    } finally {
      self.setState({ isModalVisible: false });
    }
  }

  async generateMobileOTP() {
    var self = this;
    if (this.state.verifyAadharTransactionId === "") {
      this.toastTimer(strings("common.abha.verify_aadhar_first"));
      return;
    }

    if (this.state.mobileNum < 10) {
      this.toastTimer(strings("common.abha.enter_valid_mobile"));
      return;
    }

    let body = {
      mobile: this.state.mobileNum,
      txnId: this.state.verifyAadharTransactionId,
    };
    try {
      self.setState({ isLoading: true });
      let response = await SHApiConnector.generateMobileOTP(body);
      self.setState({ isLoading: false });
      let responseBody = response.data;
      if (response.status && responseBody.status) {
        let transactionId = responseBody.data.txnId;
        self.setState({
          generateMobileTransactionId: transactionId,
          isModalVisible: true,
        });
      } else if (response.status && responseBody.status == false) {
        this.toastTimer(responseBody.data.message);
      }
    } catch (e) {
      self.setState({ isLoading: false, isModalVisible: false });
    }
  }

  otpModel(){
    return(
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.isModalVisible}
        onRequestClose={() => {
          this.setState({ isModalVisible: false });
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.otpFieldView}>
          <TouchableHighlight
              style={[{ alignSelf: 'flex-end'}]}
              underlayColor='transparent'
              onPress={() => this.setState({isModalVisible: false})}>

              <Image
                  source={require('../../../assets/images/close.png')}
                  style={{
                      height: hp(2),
                      width: hp(2),
                      marginRight: wp(1)
                  }}
              />
            </TouchableHighlight>
            <Text style={styles.otpEnter}>
              {strings("common.abha.otp_enter")}
            </Text>
            <Text style={styles.enterOtpMobile}>
              {strings("common.abha.enter_otp_mobile")}
            </Text>

            <TextInput
              allowFontScaling={false}
              placeholder={strings("common.abha.otp_enter")}
              keyboardType={"numeric"}
              style={styles.otpFieldStyles}
              placeholderTextColor={AppColors.textGray}
              autoCapitalize={"none"}
              value={
                this.state.isAadharOTPVerified === false
                  ? this.state.aadharOTP
                  : this.state.mobileOTP
              }
              maxLength={8}
              onChangeText={(input) => {
                if (AppUtils.isNumber(input) || input === "") {
                  this.state.isAadharOTPVerified === false
                    ? this.setState({ aadharOTP: input })
                    : this.setState({ mobileOTP: input });
                }
              }}
              returnKeyType={"next"}
              underlineColorAndroid={"transparent"}
            />
            <SHButtonDefault
              btnText={strings("common.abha.verify")}
              btnType={"normal"}
              style={styles.otpVerify}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              onBtnClick={async () => {
                this.state.isAadharOTPVerified === false
                  ? this.verifyAadharOTP()
                  : this.verifyMobileOTP();
              }}
            />
          </View>
        </View>
      </Modal>
    )
  }

  render() {
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <View>
          <Image source={require("../../../assets/images/myclnq-req.png")} />
        </View>
        <View style={styles.center}>
          <Image
            style={styles.abhaLogo}
            source={require("../../../assets/images/abha_logo.png")}
          />
        </View>
        <Text style={styles.abdm}>{strings("common.abha.abdm")}</Text>

        <View>
          <Text style={styles.generateAbhaId}>
            {strings("common.abha.generate_abha_id")}
          </Text>
          <View>
            <Text style={styles.aadharAndMobileVerify}>
              {strings("common.abha.verify_aadhar_and_mobile")}
            </Text>
          </View>

          <View>
            <TextInput
              allowFontScaling={false}
              flex={1}
              placeholder={strings("common.abha.aadhar")}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              keyboardType={"numeric"}
              editable={
                this.state.verifyAadharTransactionId === "" ? true : false
              }
              value={this.state.aadharNumber}
              maxLength={12}
              onChangeText={(input) => {
                if (AppUtils.isNumber(input) || input === "") {
                  this.setState({ aadharNumber: input });
                }
              }}
              returnKeyType={"next"}
              underlineColorAndroid={"transparent"}
            />
            {this.state.verifyAadharTransactionId !== "" && (
              <View style={styles.textinputSuffix}>
                <Image source={require("../../../assets/images/check.png")} />
              </View>
            )}
          </View>
          {this.state.verifyAadharTransactionId === "" && (
            <SHButtonDefault
              btnText={strings("common.abha.verify")}
              btnType={"normal"}
              style={styles.aadharNumberVerify}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              onBtnClick={async () => {            
                this.disclaimerFirAadharConfirmation()
              }}
            />
          )}
          <View>
            <TextInput
              allowFontScaling={false}
              flex={1}
              placeholder={strings("common.abha.mobile_number")}
              style={styles.inputStyle}
              placeholderTextColor={AppColors.textGray}
              keyboardType={"numeric"}
              editable={
                this.state.verifyMobileTransactionId === "" ? true : false
              }
              value={this.state.mobileNum}
              maxLength={10}
              onChangeText={(input) => {
                if (AppUtils.isNumber(input) || input === "") {
                  this.setState({ mobileNum: input });
                }
              }}
              returnKeyType={"next"}
              underlineColorAndroid={"transparent"}
            />
            {this.state.verifyMobileTransactionId !== "" && (
              <View style={styles.textinputSuffix}>
                <Image source={require("../../../assets/images/check.png")} />
              </View>
            )}
          </View>
          {this.state.verifyMobileTransactionId === "" && (
            <SHButtonDefault
              btnText={strings("common.abha.verify")}
              btnType={"normal"}
              style={styles.mobileVerify}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.primaryColor}
              onBtnClick={async () => {
                if (this.state.verifyMobileTransactionId !== "") {
                  return;
                }
                this.generateMobileOTP();
              }}
            />
          )}
        </View>
        <View>
          <View>
            <Text style={styles.setupAbha}>
              {strings("common.abha.setup_abha")}
            </Text>
            <Text style={styles.setupAbhaSubMessage}>
              {"Please enter your preferred ABHA address"}
            </Text>
            <View style={styles.fieldBorder}>
              <TextInput
                allowFontScaling={false}
                placeholder={strings("common.abha.abha_address")}
                style={styles.abhaField}
                placeholderTextColor={AppColors.textGray}
                autoCapitalize={"none"}
                value={this.state.abhaAddress}
                maxLength={25}
                onChangeText={(input) => {
                  this.setState({ abhaAddress: input });
                }}
                returnKeyType={"next"}
                underlineColorAndroid={"transparent"}
              />
              <View style={styles.positionSubText}>
                <Text
                  style={{
                    ...styles.ndhm,
                    color:
                      this.state.abhaAddress === ""
                        ? AppColors.greyColor
                        : AppColors.blackColor,
                  }}
                >
                  @ndhm
                </Text>
              </View>
            </View>
          </View>
          <SHButtonDefault
            btnText={strings("common.abha.save")}
            btnType={"normal"}
            style={styles.save}
            btnTextColor={AppColors.whiteColor}
            btnPressBackground={AppColors.primaryColor}
            onBtnClick={async () => {
              this.generateHealthId();
            }}
          />
        </View>
        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={AppColors.whiteColor}
          color={AppColors.primaryColor}
        />
        {this.otpModel()}
      </KeyboardAwareScrollView>
    );
  }
}

export default AbhaRegistration;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(6),
    backgroundColor: AppColors.whiteColor,
  },
  aadharNumberVerify: {
    alignSelf: "center",
    borderRadius: wp(2),
    height: hp(4),
    marginTop: hp(1.5),
    width: wp(35),
    shadowColor: AppColors.blackColor,
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 4,
  },
  mobileVerify: {
    alignSelf: "center",
    borderRadius: wp(2),
    height: hp(4),
    marginTop: hp(1.5),
    shadowColor: AppColors.blackColor,
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: hp(3),
    width: wp(35),
  },

  setupAbha: {
    fontSize: hp(2),
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    lineHeight: hp(3),
  },
  setupAbhaSubMessage: {
    fontSize: hp(1.5),
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyRegular,
    marginBottom: hp(2),
  },
  otpFieldStyles: {
    height: hp(7),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.blackColor,
    borderStartWidth: hp(0.3),
    borderEndWidth: hp(0.3),
    borderTopWidth: hp(0.3),
    borderColor: AppColors.backgroundGray,
    borderLeftWidth: hp(0.3),
    borderRightWidth: hp(0.3),
    marginBottom: hp(2.7),
    marginTop: hp(2.7),
    borderBottomWidth: hp(0.3),
    paddingLeft: wp(2),
  },
  center: { alignSelf: "center" },
  otpFieldView: {
    backgroundColor: AppColors.whiteColor,
    borderRadius: 20,
    width: wp(80),
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(5),
    shadowColor: AppColors.blackColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  otpEnter: {
    fontSize: hp(2.5),
    marginTop: hp(2),
    color: AppColors.blackColor3,
    fontFamily: AppStyles.fontFamilyDemi,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  enterOtpMobile: {
    fontSize: hp(2.3),
    marginTop: hp(2),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyRegular,
    marginTop: hp(1),
  },
  otpVerify: {
    alignSelf: "center",
    borderRadius: wp(2),
    height: hp(4),
    width: wp(35),
  },
  abdm: {
    fontSize: hp(1.8),
    textAlign: "center",
    marginBottom: hp(3),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyRegular,
    marginTop: hp(1),
  },
  generateAbhaId: {
    fontSize: hp(2.5),
    marginTop: hp(2),
    color: AppColors.blackColor3,
    fontFamily: AppStyles.fontFamilyMedium,
    marginTop: hp(1),
  },
  aadharAndMobileVerify: {
    fontSize: hp(2.1),
    lineHeight: hp(2.5),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyRegular,
    marginTop: hp(1),
  },
  textinputSuffix: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    right: wp(6),
  },
  fieldBorder: {
    borderRadius: hp(0.5),
    padding: hp(0.4),
    borderColor: AppColors.greyColor,
    borderWidth: 0.5,
    marginBottom: hp(2.5),
    flexDirection: 'row',
    alignItems:'center'
  },
  abhaField: {
    flex: 7,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2),
    height: hp(6),
    marginLeft: wp(2),
    color: AppColors.blackColor,
  },
  positionSubText: {
    textAlign:'center',
    justifyContent: "center",
    alignItems: "flex-end",
    right: 10,
  },
  abhaLogo: {
    marginBottom: hp(2),
  },
  ndhm: { fontFamily: AppStyles.fontFamilyMedium, fontSize: 15 },
  save: {
    alignSelf: "center",
    borderRadius: wp(2),
    marginBottom: hp(6),
    height: hp(4),
    width: wp(35),
    shadowColor: AppColors.blackColor,
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 4,
  },
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2),
    color: AppColors.blackColor,
    height: verticalScale(50),
    borderBottomWidth: 1,
    marginBottom: hp(1),
    borderBottomColor: AppColors.backgroundGray,
    marginTop: verticalScale(10),
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.modalBackground,
  },
});
