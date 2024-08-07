import React, { Component } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
} from "react-native";
import { AppColors } from "../../../shared/AppColors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import { SHApiConnector } from "../../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import { AppStrings } from "../../../shared/AppStrings";
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment";
import selectPaymentStyle from "./selectPyamentStyle";
import { strings } from "../../../locales/i18n";
import ProgressLoader from "rn-progress-loader";
class selectPayment extends Component {
  constructor(props) {
    super(props);
    AppUtils.console("sdzfvbdsefd123", props);
    AppUtils.analyticsTracker("Medical Equipment Select Payment Screen");
    this.state = {
      discount: 0,
      delivery: 0,
      isLoading: false,
    };
  }

  componentDidMount() {
    AppUtils.console("paymentDetails", this.props.paymentDetails);
    BackHandler.addEventListener("hardwareBackPress", () => {
      Actions.pop();

      return true;
    });

    let discount = 0;
    let subTotal = 0;
    this.props.paymentDetails.product.map((product) => {
      if (product.offer) {
        discount = discount + product.offer;
      }
      subTotal =
        subTotal + parseFloat(product.amount) * product.productQuantity;
    });
    this.setState({
      discount: discount,
      subTotal: subTotal,
      delivery: this.props.paymentDetails.totalShippingCharge,
    });
  }

  renderProduct(item) {
    AppUtils.console("itemszdfcszw23w4", item.item);
    return (
      <View style={styles.textViewStyle}>
        <View style={{ flex: 3, flexDirection: "row" }}>
          <Text numberOfLines={1} style={[styles.textTitleStyle, { flex: 5 }]}>
            {item.item.productName}
          </Text>
          <Text numberOfLines={1} style={styles.textTitleStyle}>
            {"x " + item.item.productQuantity}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.textDataStyle}>
            {this.props.currencySymbol +
              item.item.productQuantity * parseFloat(item.item.amount)}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={selectPaymentStyle.container}>
        <View style={selectPaymentStyle.paymentHeader}>
          <Text style={selectPaymentStyle.paymentText}>
            {strings("equip.makePayment")}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={selectPaymentStyle.orderView}>
            <View style={selectPaymentStyle.orderTotalView}>
              <Text style={selectPaymentStyle.totalLabel}>
                {"Order Total: "}
                <Text style={selectPaymentStyle.totalText}>
                  {this.props.currencySymbol +
                    this.props.paymentDetails.subTotal}
                </Text>
              </Text>
              <View style={selectPaymentStyle.detailView}>
                <Text style={selectPaymentStyle.detailText}>
                  {strings("equip.viewDetails")}
                </Text>
              </View>
            </View>
            <View>
              <FlatList
                data={this.props.paymentDetails.product}
                renderItem={(item) => this.renderProduct(item)}
                keyExtractor={(item, index) => index.toString()}
              />
              <View style={styles.textViewStyle}>
                <Text style={styles.textTitleStyle}>
                  {strings("equip.subTotal")}
                </Text>
                <View style={selectPaymentStyle.commonView}>
                  <Text style={styles.textDataStyle}>
                    {this.props.currencySymbol + this.state.subTotal}
                  </Text>
                </View>
              </View>
              <View style={styles.textViewStyle}>
                <Text style={styles.textTitleStyle}>
                  {strings("equip.delivery")}
                </Text>
                <View style={selectPaymentStyle.commonView}>
                  <Text style={styles.textDataStyle}>
                    {this.props.currencySymbol + this.state.delivery}
                  </Text>
                </View>
              </View>
              <View style={styles.textViewStyle}>
                <Text style={styles.textTitleStyle}>
                  {strings("doctor.button.discount")}
                </Text>
                <View style={selectPaymentStyle.commonView}>
                  <Text style={styles.textDataStyle}>
                    {this.props.currencySymbol + this.state.discount}
                  </Text>
                </View>
              </View>
              <View style={styles.textViewStyle}>
                <Text style={styles.textTitleStyle}>
                  {strings("common.caregiver.total")}
                </Text>
                <View style={selectPaymentStyle.commonView}>
                  <Text
                    style={[
                      styles.textDataStyle,
                      { color: AppColors.primaryColor },
                    ]}
                  >
                    {this.props.currencySymbol +
                      this.props.paymentDetails.subTotal}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "column" }}>
                <Text style={selectPaymentStyle.addressLabel}>
                  {strings("equip.billingAddress")}
                </Text>
                <Text style={selectPaymentStyle.contactView}>
                  {this.props.paymentDetails.deliveryAddress.title +
                    ",  +" +
                    this.props.paymentDetails.deliveryAddress.countryCode +
                    " " +
                    this.props.paymentDetails.deliveryAddress.contactNumber}
                </Text>

                <Text style={selectPaymentStyle.addressText}>
                  {AppUtils.getAddress(
                    this.props.paymentDetails.deliveryAddress
                  )}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={selectPaymentStyle.totalView}>
          <View style={{ flex: 1 }}>
            <Text style={selectPaymentStyle.totalPrice}>
              {strings("common.caregiver.total")}:{" "}
              {this.props.currencySymbol + this.props.paymentDetails.subTotal}
            </Text>
          </View>
          <TouchableOpacity
            style={selectPaymentStyle.pay}
            onPress={() => this.placeOrder()}
          >
            <View style={selectPaymentStyle.payView}>
              <Text style={selectPaymentStyle.payText}>
                {strings("doctor.button.payNow")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={"#FFFFFF"}
          color={AppColors.primaryColor}
        />
      </View>
    );
  }

  async placeOrder() {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.makePayment({
        purchaseId: this.props.paymentDetails.purchaseId,
      });
      this.setState({ isLoading: false }, () => {
        setTimeout(() => {
          let data = "";
          if (response.data.status) {
            AppUtils.console("MakePayment", response);
            console.log(
              "---------------------------------------------------------------------------->  ",
              response.data
            );
            if (response.data.response.isPayByPayU) {
              let payUData = response.data.response.payment;
              payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
              payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
              payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;
              Actions.PayUPayment({
                paymentDetails: payUData,
                module: "medical_equipment",
              });
            } else if (response.data.response.isPayByStripe) {
              let stripeData = response.data.response.payment;
              Actions.StripePayment({
                paymentDetails: stripeData,
                module: "medical_equipment",
              });
            } else if (response.data.response.isPayByXendit) {
              let xenditData = response.data.response.payment;
              Actions.XenditPayment({
                paymentDetails: xenditData,
                module: AppStrings.key.equipment,
              });
            } else {
              Actions.OnlinePayment({
                paymentData: response.data.response.payment,
                module: "medical_equipment",
              });
            }
          }
        }, 500);
      });
    } catch (e) {
      AppUtils.console("MakePayment", e);
      this.setState({ isLoading: false });
    }
  }
}

const styles = StyleSheet.create({
  textViewStyle: {
    alignSelf: "center",
    height: hp(4),
    flexDirection: "row",
    width: wp(90),
  },

  textTitleStyle: {
    flex: 1,
    fontSize: hp(2),
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: "center",
    paddingLeft: wp(1),
    fontFamily: AppStyles.fontFamilyRegular,
  },

  textDataStyle: {
    flex: 1,
    fontSize: hp(1.8),
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginRight: wp(1),
    alignSelf: "center",
    textAlign: "right",
    fontFamily: AppStyles.fontFamilyRegular,
  },
});

export default selectPayment;
