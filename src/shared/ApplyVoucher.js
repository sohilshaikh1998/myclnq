import React, { Component } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  TextInput,
  StyleSheet,
  Text,
  Keyboard,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import images from "../utils/images";
import { AppColors } from "./AppColors";
import { AppStyles } from "./AppStyles";
import { AppStrings } from "./AppStrings";
import PropTypes from "prop-types";
import { AppUtils } from "../utils/AppUtils";
import Geocoder from "react-native-geocoding";
import { SHApiConnector } from "../network/SHApiConnector";
import Toast from "react-native-simple-toast";
import { strings } from "../locales/i18n";
import SHButtonDefault from "./SHButtonDefault";
import SHButton from "./SHButton";
import axios from "axios";
import getSymbolFromCurrency from "currency-map-symbol";

class ApplyVoucher extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    appointmentDetails: PropTypes.object,
    closeModal: PropTypes.func,
    applyVoucherList: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    appointmentDetails: {},
    closeModal: () => {},
    applyVoucherList: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      voucherNumber: "",
      voucherCode: "",
      voucherList: [],
      isAddVoucherOpen: props.isOpen || false,
      appointmentDetails: props.appointmentDetails || {},
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps, nextContext) {
    AppUtils.console(
      "nextPropsView ",
      nextProps,
      nextContext,
      this.state.isAddressOpen,
      nextProps.isOpen != this.state.isAddressOpen
    );
    if (nextProps.isOpen) {
      this.setState({
        isAddVoucherOpen: this.props.isOpen,
        appointmentDetails: this.props.appointmentDetails,
      });
    }
  }

  closeModal() {
    this.setState({ isOpen: false, isAddVoucherOpen: false }, () =>
      this.props.closeModal()
    );
  }

  renderAddVoucher() {
    return (
      <Modal
        style={{ justifyContent: "center", zIndex: 2 }}
        visible={this.state.isAddVoucherOpen}
        onRequestClose={() => this.closeModal()}
        transparent={true}
      >
        <View
          style={{
            width: wp("100"),
            height: hp("100"),
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <TouchableOpacity
            style={{ width: wp("100"), height: hp("100") }}
            onPress={() => this.closeModal()}
          >
            <View />
          </TouchableOpacity>
          <View style={styles.voucherModal}>
            <View style={styles.voucherModalView1}>
              <View style={styles.voucherModalView1TxtView}></View>
              <View style={[styles.voucherModalView1TxtView, { flex: 5 }]}>
                <Text style={styles.modalTxt}>Apply Voucher</Text>
              </View>
              <View style={styles.voucherModalView1TxtView}>
                <TouchableOpacity
                  onPress={() => this.closeModal()}
                  style={{ alignItems: "flex-start", marginBottom: hp(4) }}
                >
                  <Image
                    style={{ height: hp(4) }}
                    resizeMode={"contain"}
                    source={require("../../assets/images/cancel.png")}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.voucherListView}>
              <View
                style={{
                  flexDirection: "row",
                  height: hp(4),
                  marginLeft: wp(5),
                  marginRight: wp(5),
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: wp(4.5),
                    fontFamily: AppStyles.fontFamilyDemi,
                  }}
                >
                  Gross Amount
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontSize: wp(4.5),
                    fontFamily: AppStyles.fontFamilyDemi,
                  }}
                >
                  {this.state.appointmentDetails != {}
                    ? this.state.appointmentDetails.currencySymbol +
                      this.state.appointmentDetails.callCharge
                    : ""}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: hp(6),
                  marginLeft: wp(5),
                  marginRight: wp(5),
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: wp(4.5),
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                >
                  Voucher No.
                </Text>
                <TextInput
                  allowFontScaling={false}
                  placeholder={"Voucher Number"}
                  multiline={false}
                  placeholderTextColor={AppColors.textGray}
                  style={{
                    flex: 1.5,
                    color: AppColors.greyColor,
                    fontSize: wp(4),
                    height: hp(4),
                    padding: wp(1),
                    borderRadius: wp(1),
                    borderColor: AppColors.greyColor,
                    borderWidth: 0.5,
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                  value={this.state.voucherNumber}
                  maxLength={16}
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={(text) =>
                    this.setState({ voucherNumber: text })
                  }
                  returnKeyType={"done"}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: hp(6),
                  marginLeft: wp(5),
                  marginRight: wp(5),
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: wp(4.5),
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                >
                  OTP
                </Text>
                <TextInput
                  allowFontScaling={false}
                  placeholder={"Voucher Code"}
                  multiline={false}
                  placeholderTextColor={AppColors.textGray}
                  style={{
                    flex: 1.5,
                    color: AppColors.greyColor,
                    fontSize: wp(4),
                    height: hp(4),
                    padding: wp(1),
                    borderRadius: wp(1),
                    borderColor: AppColors.greyColor,
                    borderWidth: 0.5,
                    fontFamily: AppStyles.fontFamilyRegular,
                  }}
                  value={this.state.voucherCode}
                  maxLength={4}
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={(text) => this.setState({ voucherCode: text })}
                  returnKeyType={"done"}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  height: hp(4),
                  marginLeft: wp(6),
                  marginRight: wp(5),
                }}
              >
                <View style={{ flex: 1 }} />

                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => this.validateVoucher()}
                    style={{
                      height: hp(4),
                      width: wp(20),
                      backgroundColor:
                        this.state.voucherCode.length > 0 &&
                        this.state.voucherNumber.length > 0
                          ? AppColors.primaryColor
                          : AppColors.primaryGray,
                      alignSelf: "flex-end",
                      alignItems: "center",
                      borderRadius: wp(4),
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: wp(3.5),
                        color: AppColors.whiteColor,
                        fontFamily: AppStyles.fontFamilyDemi,
                      }}
                    >
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                height: hp(5),
                marginTop: hp(4),
                width: wp(90),
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "flex-start", width: wp(80) }}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: wp(4.5),
                    fontFamily: AppStyles.fontFamilyDemi,
                  }}
                >
                  Added Vouchers
                </Text>
              </View>
            </View>
            <FlatList
              style={{ height: hp(30) }}
              showsVerticalScrollIndicator={false}
              renderItem={(item) => this.renderAddedCoupon(item)}
              data={this.state.voucherList}
              keyExtractor={(item, index) => index.toString()}
            />
            <View
              style={{
                flexDirection: "row",
                height: hp(4),
                alignSelf: "center",
                marginBottom: hp(2),
              }}
            >
              <TouchableOpacity
                onPress={() => this.renderApplyVoucher()}
                style={{
                  height: hp(4),
                  width: wp(82),
                  backgroundColor: AppColors.primaryColor,
                  alignSelf: "flex-end",
                  alignItems: "center",
                  borderRadius: wp(1.5),
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: wp(3.5),
                    color: AppColors.whiteColor,
                    fontFamily: AppStyles.fontFamilyDemi,
                  }}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  renderApplyVoucher() {
    let totalVoucherAmount = 0;
    this.state.voucherList.map((voucher) => {
      totalVoucherAmount = totalVoucherAmount + voucher.price;
    });

    if (totalVoucherAmount >= this.state.appointmentDetails.callCharge) {
      this.props.applyVoucherList(this.state.voucherList);
    } else {
      Toast.show(
        "Added coupon value is less than the consultation charge. Please add more vouchers."
      );
    }
    AppUtils.console(
      "sdxfsdzfgdf",
      totalVoucherAmount,
      this.state.appointmentDetails.callCharge
    );
  }

  renderAddedCoupon(item) {
    return (
      <View
        style={{
          flexDirection: "row",
          height: hp(3.5),
          marginLeft: wp(5),
          marginRight: wp(5),
        }}
      >
        <Text
          style={{
            flex: 2,
            fontSize: wp(3.5),
            fontFamily: AppStyles.fontFamilyRegular,
          }}
        >
          {item.item.vcode}
        </Text>
        <Text
          style={{
            flex: 1,
            textAlign: "right",
            fontSize: wp(3.5),
            fontFamily: AppStyles.fontFamilyDemi,
          }}
        >
          {getSymbolFromCurrency(item.item.currencySymbol) + item.item.price}
        </Text>
      </View>
    );
  }

  render() {
    return this.renderAddVoucher();
  }

  validateVoucher() {
    if (
      this.state.voucherCode.length == 0 ||
      this.state.voucherNumber.length == 0
    ) {
      Toast.show("Please first enter voucher details.");
    } else {
      let value = this.state.voucherList.find(
        (voucher) => voucher.vcode == this.state.voucherNumber
      );
      AppUtils.console("sgdxfwserwerf", value);
      if (!value) {
        this.addVoucher();
      } else {
        Toast.show("Voucher you are trying to use is already added.");
      }
    }
  }

  async addVoucher() {
    try {
      let response = await axios.get(
        AppStrings.apiURL.baseURL +
          "/partnerapp/api/voucher/validatevoucher/" +
          this.state.voucherNumber +
          "/" +
          this.state.voucherCode
      );
      AppUtils.console("AddVoucherError123", response);
      if (response.data.status_code == 4011) {
        let voucherList = this.state.voucherList;
        voucherList.push({
          vcode: this.state.voucherNumber,
          secret: this.state.voucherCode,
          price: response.data.data.vamount,
          currencySymbol: response.data.data.vcurrency,
        });
        this.setState({
          voucherList: voucherList,
          voucherNumber: "",
          voucherCode: "",
        });
      } else {
        Toast.show(response.data.status_msg);
      }
    } catch (e) {
      AppUtils.console("AddVoucherError4576", e.response);
    }
  }
}

const styles = StyleSheet.create({
  voucherModal: {
    position: "absolute",
    height: hp(62),
    width: wp(90),
    backgroundColor: AppColors.whiteColor,
    borderRadius: 13,
  },
  voucherModalView1: {
    height: hp(10),
    width: wp(90),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  voucherModalView1TxtView: {
    flex: 1,
    alignItems: "center",
  },
  modalTxt: {
    color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyDemi,
    fontSize: wp(5),
  },
  voucherListView: {
    width: wp(90),
  },
});

export default ApplyVoucher;
