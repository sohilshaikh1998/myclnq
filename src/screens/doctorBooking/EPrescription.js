import React, { Component } from "react";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import {
  Alert,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AppColors } from "../../shared/AppColors";
import { AppStyles } from "../../shared/AppStyles";
import AddressView from "../../shared/AddressView";
import AddOrUpdateAddress from "../../shared/AddOrUpdateAddress";
import SelectAddressModal from "../../shared/SelectAddressModal";
import CardView from "react-native-cardview";
import caregiverBookingRequestStyle from "../caregiver/caregiverBookingRequest/caregiverBookingRequestStyle";
import { AppStrings } from "../../shared/AppStrings";
import images from "../../utils/images";
import Toast from "react-native-simple-toast";
import { Actions } from "react-native-router-flux";
import ProgressLoader from "rn-progress-loader";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import ReactNativeBlobUtil from "react-native-blob-util";
import moment from "moment";
import ElevatedView from "react-native-elevated-view";
import { moderateScale } from "../../utils/Scaling";
import { strings } from "../../locales/i18n";

class EPrescription extends Component {
  constructor() {
    super();
    this.state = {
      addressList: [],
      selectedAddress: {},
      isAddAddressOpen: false,
      isAddressOpen: false,
      updateAddressData: {},
      currentAddress: true,
      showApplyCoupon: true,
      medicineDetails: {},
      medicineList: [],
      viewPricingDetails: false,
      isWavedOffDeliveryCharge: false,
      isWavedOffTotalCharge: true,
      medicinePrice: 0,
      deliveryCharge: 0,
      totalAmount: 0,
      isCouponApplied: false,
      totalAmountAfterCoupon: 0,
      discountPrice: 0,
      currencySymbol: "",
      doctorDiscount: 0,
      couponId: null,
      isLoading: false,
      orderStatus: "",
      paymentStatus: "",
      deliveryStatus: null,
      deliveryBoyId: null,
      otp: null,
      createdTime: "",
      deliveryTime: "",
    };
  }

  componentDidMount() {
    this.getEPrescriptionDetails();
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.onBackPress();
      return true;
    });
  }
  componentWillReceiveProps(props) {
    AppUtils.console("MyAppProps", props);
    if (props.update) {
      this.getEPrescriptionDetails();
    }
  }

  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console("timeout", "----->");
      Actions.refresh({ update: true });
    }, 500);
  }

  async getEPrescriptionDetails() {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getEPrescriptionDetails(
        this.props.appointmentId
      );
      this.setState({ isLoading: false });
      AppUtils.console("esfdvsf345tr24", response);
      if (response.data.status) {
        let ePriscription = response.data.response.ePrescription;
        this.setState(
          {
            medicineDetails: ePriscription,
            isWavedOffTotalCharge: ePriscription.isWavedOffTotalCharge,
            isWavedOffDeliveryCharge: ePriscription.isWavedOffDeliveryCharge,
            medicineList: ePriscription.medicineList,
            medicinePrice: ePriscription.finalMedicinePriceByDoctor,
            deliveryCharge: ePriscription.deliveryCharge,
            otherCharge: ePriscription.otherCharge,
            totalAmount: ePriscription.finalAmount,
            isCouponApplied: false,
            totalAmountAfterCoupon: ePriscription.finalAmount,
            discountPrice: 0,
            currencySymbol: ePriscription.currencySymbol,
            doctorDiscount:
              ePriscription.totalRate -
              ePriscription.finalMedicinePriceByDoctor,
            orderStatus: ePriscription.orderStatus,
            paymentStatus: ePriscription.paymentStatus,
            deliveryStatus: ePriscription.deliveryStatus,
            deliveryBoyId: ePriscription.deliveryBoyId,
            otp: ePriscription.OTP,
            createdTime: ePriscription.createdOn,
            deliveryTime: ePriscription.deliveryTime,
          },
          () => this.getSelectedAddress(response.data.response.userAddress)
        );
      }
    } catch (e) {
      this.setState({ isLoading: false });
      console.error("E-Prescription_ERROR", e);
    }
  }

  getMessage() {
    let message = "";
    if (this.state.isWavedOffTotalCharge) {
      message = strings("doctor.text.prescriptionReadyCollect");
    } else if (this.state.orderStatus == "EXPIRED") {
      message = strings("doctor.text.orderExpiredNoPayment");
    } else if (
      this.state.orderStatus == "CONFIRMED" ||
      this.state.orderStatus == "PAYMENT_FAILED"
    ) {
      if (this.state.isWavedOffDeliveryCharge) {
        message = strings(
          "doctor.text.prescriptionReadyMakePyamentCollectMedicine",
          {
            time: moment(this.state.createdTime)
              .add(60, "minutes")
              .format("DD MMM, YYYY h:mm A"),
          }
        );
      } else {
        message = strings("doctor.text.prescriptionReadyMakePyament", {
          time: moment(this.state.createdTime)
            .add(60, "minutes")
            .format("DD MMM, YYYY h:mm A"),
        });
      }
    } else if (
      this.state.orderStatus == "PAYMENT_PAID" &&
      !this.state.deliveryStatus
    ) {
      if (this.state.isWavedOffDeliveryCharge) {
        message = strings("doctor.text.paymentReceivedCollectMedicine");
      } else {
        message = strings("doctor.text.paymentReceivedMedicineWillDelivered");

        if (this.state.deliveryBoyId && !this.state.otp) {
          message = strings("doctor.text.medicineWillDeliver", {
            name: this.state.deliveryBoyId.name,
          });
        } else if (this.state.deliveryBoyId && this.state.otp) {
          message = strings("doctor.text.pleaseShareOTP", {
            otp: this.state.otp,
          });
        }
      }
    } else if (this.state.deliveryStatus) {
      message = strings("doctor.text.medicineDelivered", {
        date: moment(this.state.deliveryTime).format("DD MMM, YYYY"),
        time: moment(this.state.deliveryTime).format("h:mm A"),
        name: this.state.deliveryBoyId.name,
      });
    }

    return message;
  }

  getSelectedAddress(addressList) {
    AppUtils.console("Address", addressList);
    let selectedAddress = addressList.length > 0 ? addressList[0] : {};
    let isDefaultAddressAvail = false;
    addressList.map((address) => {
      AppUtils.console("zxcsdzxfscx", address);
      if (address.isDefaultAddress) {
        selectedAddress = address;
        isDefaultAddressAvail = true;
      }
    });
    if (!isDefaultAddressAvail && addressList.length > 0) {
      addressList[0].isDefaultAddress = true;
    }
    AppUtils.console("SelectedAddress", selectedAddress);

    this.setState({
      selectedAddress: selectedAddress,
      addressList: addressList,
    });
  }
  renderIOS() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView
        style={[styles.headerStyle, { flexDirection: "row" }]}
        elevation={0}
      >
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isIphone ? (AppUtils.isX ? 0 : 16) : 0,
          }}
        >
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => {
              this.onBackPress();
            }}
            testID={"drawer"}
          >
            <Image
              style={{
                height: moderateScale(30),
                width: moderateScale(30),
                marginTop: AppUtils.isX ? 16 + 18 : 0,
                marginLeft: 8,
              }}
              source={images.smallBackIcon}
            />
          </TouchableHighlight>
        </View>
        <View
          style={{
            width:
              this.props.title == "Appointment Details" ? wp(42) : cellWidth,
            height: hp("6"),
            marginTop: hp(1),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
      </ElevatedView>
    );
  }

  renderAndroid() {
    AppUtils.console("sdfvdsedv", this.props);
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView
        style={[styles.headerStyle, { flexDirection: "row" }]}
        elevation={0}
      >
        <TouchableHighlight
          onPress={() => {
            this.onBackPress();
          }}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
            //backgroundColor: '#f18867',
          }}
        >
          <Image
            style={{
              height: moderateScale(30),
              width: moderateScale(30),
              marginTop: AppUtils.isX ? 16 + 18 : 0,
              marginLeft: 8,
            }}
            source={images.smallBackIcon}
          />
        </TouchableHighlight>

        <View
          style={{
            width:
              this.props.title == "Appoinment Details" ? wp(38) : cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
      </ElevatedView>
    );
  }

  render() {
    let message = this.getMessage();
    let showMedicineList = this.state.isWavedOffTotalCharge
      ? true
      : this.state.orderStatus == "EXPIRED"
      ? false
      : this.state.orderStatus == "PAYMENT_PAID"
      ? true
      : false;
    return (
      <View
        style={{
          flex: 1,
          elevation: 2,
          backgroundColor: AppColors.cardBgColor,
        }}
      >
        {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}

        {this.state.isWavedOffTotalCharge ||
        this.state.isWavedOffDeliveryCharge ||
        this.state.orderStatus == "EXPIRED" ||
        this.state.orderStatus == "PAYMENT_PAID" ? null : (
          <View>
            <AddressView
              selectedAddress={this.state.selectedAddress}
              onPress={() => this.setState({ isAddressOpen: true })}
            />
            <AddOrUpdateAddress
              isOpen={this.state.isAddAddressOpen}
              location={this.state.location}
              addressList={this.state.addressList}
              currentAddress={this.state.currentAddress}
              updateAddressData={this.state.updateAddressData}
              closeModal={() =>
                this.setState({
                  isAddAddressOpen: false,
                  isAddressOpen: false,
                  updateAddressData: {},
                })
              }
              onAddressAddedOrUpdated={(addressList) =>
                this.setState(
                  {
                    addressList: addressList,
                    isAddAddressOpen: false,
                    isAddressOpen: false,
                    updateAddressData: {},
                  },
                  () => this.getSelectedAddress(addressList)
                )
              }
            />
            <SelectAddressModal
              isOpen={this.state.isAddressOpen}
              location={this.state.location}
              addressList={this.state.addressList}
              addAddress={() =>
                this.setState({ isAddressOpen: false }, () =>
                  this.setState({ isAddAddressOpen: true })
                )
              }
              selectAddress={(addressList) =>
                this.setState(
                  {
                    addressList: addressList,
                    isAddressOpen: false,
                    isAddAddressOpen: false,
                  },
                  () => this.getSelectedAddress(addressList)
                )
              }
              deleteAddress={(addressList) =>
                this.setState({ addressList: addressList }, () =>
                  this.getSelectedAddress(addressList)
                )
              }
              closeModal={() => this.setState({ isAddressOpen: false })}
              updateAddress={(updateAddress) =>
                this.setState({
                  updateAddressData: updateAddress,
                  isAddressOpen: false,
                  isAddAddressOpen: true,
                })
              }
            />
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: hp(2), marginBottom: hp(3) }}
        >
          {showMedicineList ? (
            <FlatList
              data={this.state.medicineList}
              renderItem={(item) => this.renderMedicine(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : null}
          {this.state.deliveryBoyId &&
          this.state.otp &&
          !this.state.deliveryStatus ? (
            <CardView
              cardElevation={2}
              style={{
                backgroundColor: AppColors.colorHeadings,
                marginBottom: hp(1),
                marginTop: 20,
                width: wp(100),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: AppColors.whiteColor,
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: 16,
                  paddingTop: 10,
                  paddingBottom: 10,
                  lineHeight: 20,
                  width: wp(85),
                }}
              >
                {strings("doctor.text.otp", { otp: this.state.otp })}
              </Text>
            </CardView>
          ) : null}

          <View>
            {(this.state.orderStatus == "CONFIRMED" ||
              this.state.orderStatus == "PAYMENT_FAILED") &&
            !this.state.isWavedOffTotalCharge ? (
              <View>
                {this.state.showApplyCoupon ? (
                  <CardView
                    cardElevation={2}
                    style={{
                      backgroundColor: AppColors.whiteColor,
                      marginBottom: hp(1),
                      width: wp(100),
                      paddingBottom: 10,
                      alignSelf: "center",
                      marginTop: hp(2),
                    }}
                  >
                    <Text
                      numberOfLines={2}
                      style={{
                        alignSelf: "flex-start",
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyRegular,
                        marginTop: 20,
                        fontSize: 14,
                        paddingLeft: hp(3),
                        width: wp(90),
                      }}
                    >
                      {strings("string.label.apply_coupon")}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        margin: hp(2),
                        paddingLeft: hp(0.2),
                        paddingTop: hp(1),
                      }}
                    >
                      <Image
                        style={{
                          height: hp(4),
                          width: hp(4),
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          alignSelf: "center",
                          marginRight: hp(2),
                          marginLeft: hp(1),
                        }}
                        source={images.discount}
                      />

                      <View
                        style={{
                          height: hp(4),
                          borderWidth: hp(0.2),
                          borderColor: AppColors.backgroundGray,
                          borderRadius: wp(2),
                          width: wp(52),
                          justifyContent: "center",
                          backgroundColor: AppColors.whiteShadeColor,
                        }}
                      >
                        <TextInput
                          allowFontScaling={false}
                          placeholder={strings("doctor.text.enterCouponCode")}
                          value={this.state.couponText}
                          placeholderTextColor={AppColors.textGray}
                          onChangeText={(text) =>
                            this.setState({ couponText: text })
                          }
                          style={{
                            height: hp("5"),
                            fontSize: hp(1.8),
                            color: AppColors.textGray,
                            padding: hp("1"),
                          }}
                        />
                      </View>

                      <TouchableOpacity
                        onPress={() => this.applyCoupon(this.state.couponText)}
                        style={{
                          height: hp(4),
                          marginLeft: wp(3),
                          borderRadius: wp(2),
                          width: wp(20),
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
                  </CardView>
                ) : (
                  <CardView
                    cardElevation={2}
                    cornerRadius={5}
                    style={{
                      backgroundColor: AppColors.whiteColor,
                      marginBottom: hp(1),
                      width: wp(100),
                      alignSelf: "center",
                      marginTop: hp(2),
                      padding: hp(1),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        margin: hp(2),
                        paddingLeft: hp(0.2),
                        paddingTop: hp(1),
                      }}
                    >
                      <Image
                        style={{
                          height: hp(4),
                          width: hp(4),
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          alignSelf: "center",
                          marginLeft: hp(1),
                        }}
                        source={images.discount}
                      />

                      <View
                        style={{
                          height: hp(4),
                          width: wp(52),
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          style={{
                            alignSelf: "flex-start",
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyRegular,
                            fontSize: 14,
                            paddingLeft: wp(2),
                            width: wp(90),
                          }}
                        >
                          {strings("doctor.text.couponApplied")}
                          <Text
                            style={{ fontFamily: AppStyles.fontFamilyBold }}
                          >
                            {" "}
                            {this.state.couponText}
                          </Text>
                        </Text>

                        <Text
                          numberOfLines={2}
                          style={{
                            color: AppColors.primaryColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: 14,
                            paddingTop: hp(0.6),
                            alignSelf: "flex-start",
                            paddingLeft: wp(2.8),
                            width: wp(90),
                          }}
                        >
                          {strings("doctor.text.couponSaving")}
                          {this.state.currencySymbol + this.state.discountPrice}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => this.removeCoupon(this.state.couponText)}
                        style={{
                          height: hp(4),
                          justifyContent: "center",
                          marginLeft: wp(12),
                          alignSelf: "flex-end",
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "right",
                            fontSize: hp(1.8),
                            color: AppColors.primaryColor,
                            fontWeight: "bold",
                          }}
                        >
                          {strings("doctor.button.remove")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </CardView>
                )}
              </View>
            ) : null}

            <CardView
              cardElevation={2}
              style={{
                backgroundColor: AppColors.whiteColor,
                marginBottom: hp(1),
                marginTop: 20,
                width: wp(100),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: "#909090",
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: 18,
                  paddingTop: 20,
                  paddingBottom: 20,
                  lineHeight: 30,
                  width: wp(85),
                }}
              >
                {message}
              </Text>
            </CardView>
          </View>
        </ScrollView>

        {this.state.viewPricingDetails ? (
          <CardView
            cardElevation={2}
            style={{
              backgroundColor: AppColors.whiteColor,
              width: wp(100),
              paddingBottom: 10,
              alignSelf: "center",
              marginTop: hp(2),
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                alignSelf: "flex-start",
                color: AppColors.blackColor,
                fontFamily: AppStyles.fontFamilyMedium,
                marginTop: 20,
                fontSize: 16,
                paddingLeft: hp(3),
                width: wp(90),
              }}
            >
              {strings("doctor.text.orderDetails")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                margin: hp(1),
                paddingLeft: hp(0.2),
                paddingTop: hp(1),
              }}
            >
              <View style={{ flex: 2, marginLeft: wp(3) }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: 14,
                    color: AppColors.blackColor,
                  }}
                >
                  {strings("doctor.text.totalPrice")}
                </Text>
              </View>
              <View
                style={{ flex: 1, alignItems: "flex-end", marginRight: wp(5) }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: 14,
                    color: AppColors.blackColor,
                  }}
                >
                  {this.state.currencySymbol + this.state.medicinePrice}
                </Text>
              </View>
            </View>
            {this.state.isWavedOffDeliveryCharge ? null : (
              <View
                style={{
                  flexDirection: "row",
                  margin: hp(1),
                  paddingLeft: hp(0.2),
                  paddingTop: hp(1),
                }}
              >
                <View style={{ flex: 2, marginLeft: wp(3) }}>
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("doctor.text.deliveryCharges")}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    marginRight: wp(5),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.currencySymbol + this.state.deliveryCharge}
                  </Text>
                </View>
              </View>
            )}
            {this.state.otherCharge == 0 ? null : (
              <View
                style={{
                  flexDirection: "row",
                  margin: hp(1),
                  paddingLeft: hp(0.2),
                  paddingTop: hp(1),
                }}
              >
                <View style={{ flex: 2, marginLeft: wp(3) }}>
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.otherCharge < 0
                      ? strings("doctor.button.discount")
                      : strings("doctor.text.otherCost")}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    marginRight: wp(5),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.currencySymbol +
                      Math.abs(this.state.otherCharge)}
                  </Text>
                </View>
              </View>
            )}

            {this.state.isCouponApplied ? (
              <View
                style={{
                  flexDirection: "row",
                  margin: hp(1),
                  paddingLeft: hp(0.2),
                  paddingTop: hp(1),
                }}
              >
                <View style={{ flex: 2, marginLeft: wp(3) }}>
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {strings("doctor.text.couponDiscount")}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    marginRight: wp(5),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    }}
                  >
                    {this.state.currencySymbol + this.state.discountPrice}
                  </Text>
                </View>
              </View>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                margin: hp(1),
                paddingLeft: hp(0.2),
                paddingTop: hp(1),
              }}
            >
              <View style={{ flex: 2, marginLeft: wp(3) }}>
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: 14,
                    color: AppColors.blackColor,
                  }}
                >
                  {strings("doctor.text.totalAmount")}
                </Text>
              </View>
              <View
                style={{ flex: 1, alignItems: "flex-end", marginRight: wp(5) }}
              >
                <Text
                  style={{
                    fontFamily: AppStyles.fontFamilyMedium,
                    fontSize: 14,
                    color: AppColors.blackColor,
                  }}
                >
                  {this.state.currencySymbol +
                    this.state.totalAmountAfterCoupon}
                </Text>
              </View>
            </View>
          </CardView>
        ) : null}
        {this.state.orderStatus == "EXPIRED" ? null : (
          <View
            style={{
              width: wp(100),
              shadowOffset: {
                width: 0,
                height: -1,
              },
              shadowOpacity: 0.1,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000000",
              backgroundColor: AppColors.whiteColor,
              paddingBottom: AppUtils.isX ? hp(1) : 0,
              elevation: 0,
              height: AppUtils.isX ? hp(12) : hp(10),
              flexDirection: "row",
            }}
          >
            {(this.state.orderStatus == "CONFIRMED" ||
              this.state.orderStatus == "PAYMENT_FAILED") &&
            !this.state.isWavedOffTotalCharge ? (
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    viewPricingDetails: !this.state.viewPricingDetails,
                  })
                }
                style={{ flex: 1, marginRight: wp(5), alignItems: "flex-end" }}
              >
                <View
                  style={{
                    height: hp(6),
                    width: wp(40),
                    backgroundColor: AppColors.whiteColor,
                    borderWidth: 0,
                    borderRadius: hp(0.8),
                    borderColor: AppColors.primaryColor,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      color: AppColors.blackColor,
                      marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                      fontSize: hp(3),
                    }}
                  >
                    {this.state.currencySymbol +
                      this.state.totalAmountAfterCoupon}
                  </Text>

                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: "blue",
                      marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                      fontSize: hp(2.5),
                    }}
                  >
                    {this.state.viewPricingDetails
                      ? strings("doctor.button.hideDetails")
                      : strings("doctor.button.viewDetails")}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            {(this.state.orderStatus == "CONFIRMED" ||
              this.state.orderStatus == "PAYMENT_FAILED") &&
            !this.state.isWavedOffTotalCharge ? (
              <TouchableOpacity
                style={{ flex: 1, marginRight: wp(5), alignItems: "flex-end" }}
                onPress={() => this.payNow()}
              >
                <View
                  style={{
                    height: hp(6),
                    width: wp(40),
                    backgroundColor: AppColors.primaryColor,
                    borderWidth: 2,
                    justifyContent: "center",
                    borderRadius: hp(0.8),
                    alignItems: "center",
                    borderColor: AppColors.primaryColor,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyRegular,
                      color: AppColors.whiteColor,
                      marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                      fontSize: hp(2.2),
                    }}
                  >
                    {strings("doctor.button.payNow")}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ flex: 1, marginRight: wp(5), alignItems: "center" }}
                onPress={() => this.downloadEPrescription()}
              >
                <View
                  style={{
                    height: hp(6),
                    backgroundColor: AppColors.whiteColor,
                    borderWidth: 0,
                    justifyContent: "center",
                    borderRadius: hp(0.8),
                    alignItems: "center",
                    borderColor: AppColors.primaryColor,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: AppStyles.fontFamilyMedium,
                      color: AppColors.primaryColor,
                      marginTop: AppUtils.isIphone ? hp(0.5) : 0,
                      fontSize: hp(2.2),
                    }}
                  >
                    {strings("doctor.button.downloadEPrescription")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
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

  async downloadEPrescription() {
    let data = {
      appointmentId: this.props.appointmentId,
      fileType: AppStrings.label.E_PRESCRIPTION,
    };
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.downloadCertificateOrEPrescription(
        data
      );
      this.setState({ isLoading: false });
      AppUtils.console("easfdgdrserf34", response);
      if (response.data.status) {
        this.createPDF_File(response.data.response.EPrescription);
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async createPDF_File(ePrescription) {
    let options = {
      html: ePrescription,
      fileName: "ePrescription",
      base64: true,
      directory: "Download",
    };

    //this.setState({isLoading: true});
    AppUtils.console("sfgdfhmjn235466576", options);
    let file =
      Platform.OS === "ios"
        ? await RNHTMLtoPDF.convert(options)
        : await RNHTMLtoPDF.convert(options);

    AppUtils.console("sfgdfhmjn235466576", file);

    let dirs = ReactNativeBlobUtil.fs.dirs;
    let downloadDir =
      Platform.OS === "ios" ? dirs.LibraryDir : dirs.DownloadDir;
    let date = new Date();

    // RNFetchBlob.fs.dirs.DownloadDir it's getting the download folder from internal storage
    let filePath = downloadDir + "/E-Prescription.pdf";
    AppUtils.console(filePath);
    if (Platform.OS === "android") {
      const checkWritePermission = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (checkWritePermission !== PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: strings("doctor.alertTitle.galPermission"),
              message: strings("doctor.alertMsg.galPermission", {
                name: "E-Presceiption",
              }),
            }
          );
        } catch (e) {
          AppUtils.console("Error:", e);
        }
      }
    }

    ReactNativeBlobUtil.fs
      .writeFile(filePath, file.base64, "base64")
      .then((response) => {
        AppUtils.console("Success Log: ", response);
        this.setState({ filePath: filePath }, () => {
          Alert.alert(
            "",
            strings("doctor.text.fileDownloadedOpen", {
              name: "E-Prescription",
            }),
            [
              {
                text: strings("doctor.button.cancel"),
                onPress: () => AppUtils.console("cancel Pressed"),
                style: "cancel",
              },
              {
                text: strings("doctor.button.open"),
                onPress: () => {
                  AppUtils.isIphone
                    ? ReactNativeBlobUtil.ios.previewDocument(filePath)
                    : ReactNativeBlobUtil.android.actionViewIntent(
                        filePath,
                        "application/pdf"
                      );
                },
              },
            ],
            { cancelable: false }
          );
          //this.refs.toast.show('Downloaded Successfully', DURATION.LENGTH_LONG);
        });
        this.setState({
          isLoading: false,
        });
      })
      .catch((errors) => {
        Alert.alert("", strings("doctor.text.", { name: "E-Prescription" }));
        AppUtils.console(" Error Log: ", errors);
        setTimeout(() => {
          this.setState({
            isLoading: false,
          });
        }, 500);
      });
  }

  async payNow() {
    try {
      // this.setState({ isLoading: true });
      let isAddressSelected =
        !this.state.isWavedOffDeliveryCharge &&
        !this.state.selectedAddress.address;
      if (isAddressSelected) {
        Alert.alert(
          strings("string.label.add_address"),
          strings("string.alert.alert_address"),
          [
            {
              text: strings("string.label.cancel"),
              style: "cancel",
            },
            {
              text: strings("string.label.add_address"),
              onPress: () => this.setState({ isAddAddressOpen: true }),
            },
          ],
          { cancelable: false }
        );
      } else {
        let data = {
          ePrescriptionId: this.state.medicineDetails._id,
          referralCode: this.state.isCouponApplied
            ? this.state.couponText
            : null,
          addressId: this.state.selectedAddress._id,
        };

        let response = await SHApiConnector.medicinePayment(data);
        this.setState({ isLoading: false }, () => {
          setTimeout(() => {
            AppUtils.console(
              "sdxgfhgnesdgf2343",
              data,
              this.state.selectedAddress,
              response
            );
            if (response.data.status) {
              if (response.data.response.isPayByPayU) {
                let payUData = response.data.response.payment;
                payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
                payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
                payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

                Actions.PayUPayment({
                  paymentDetails: payUData,
                  module: AppStrings.key.ePrescription,
                });
              } else if (response.data.response.isPayByStripe) {
                let stripeData = response.data.response.payment;
                Actions.StripePayment({
                  paymentDetails: stripeData,
                  module: AppStrings.key.ePrescription,
                });
              } else if (response.data.response.isPayByXendit) {
                let xenditData = response.data.response.payment;
                Actions.XenditPayment({
                  paymentDetails: xenditData,
                  module: AppStrings.key.medicine,
                });
              } else {
                Actions.OnlinePayment({
                  paymentData: response.data.response.payment,
                  module: AppStrings.key.ePrescription,
                });
              }
            } else {
              Alert.alert("", response.data.error_message);
            }
          }, 500);
        });
      }
    } catch (e) {
      console.error("MEDICINE_PAY", e);
      this.setState({ isLoading: false });
    }
  }

  async applyCoupon(coupon) {
    let self = this;
    if (!this.state.couponText) {
      Toast.show(strings("doctor.text.pleaseEnterCouponCode"));
    } else {
      this.setState({ isLoading: true });
      AppUtils.console("DiscountCoupon", coupon);
      let coupenDetails = {
        referralCode: coupon,
        module: AppStrings.label.DOCTOR_BOOKING,
      };

      try {
        let response = await SHApiConnector.verifyCoupon(coupenDetails);
        AppUtils.console("DiscountCoupon", response);
        this.setState({ isLoading: false });
        if (response.data.status !=="fail") {
          let discount = 0;
          let total = 0;
          if (response.data.response.valueType === "PERCENT") {
            let offerVal =
              (parseFloat(response.data.response.couponValue) *
                parseFloat(this.state.totalAmount)) /
              100;
            AppUtils.console(
              "sedfxg4terdff43",
              offerVal,
              response.data.response.couponValue,
              this.state.totalAmount
            );
            discount = offerVal;
          } else {
            discount = response.data.response.couponValue;
          }

          total = parseFloat(this.state.totalAmount);
          this.setState(
            {
              isCouponApplied: true,
              totalAmountAfterCoupon: total - discount,
              discountPrice: discount,
              isCouponModal: false,
              showApplyCoupon: false,
            },
            () => {
              setTimeout(() => {
                Toast.show(strings("doctor.text.couponAppliedSuccess"));
              }, 500);
            }
          );
        } else {
          Alert.alert("",response.data.message)
          self.setState(
            {
              isCouponApplied: false,
              totalAmountAfterCoupon: this.state.totalAmount,
              discountPrice: 0,
              isCouponModal: false,
            }
          );
        }
        AppUtils.console("sdfzvbdsfv", response);
      } catch (e) {
        AppUtils.console("VERIFY_OFFER_ERROR", e);
      }
    }
  }

  removeCoupon(coupon) {
    this.setState({
      couponText: "",
      isCouponApplied: false,
      totalAmountAfterCoupon: this.state.totalAmount,
      discountPrice: 0,
      isCouponModal: false,
      showApplyCoupon: true,
    });
  }

  getDoseDetails(doseDetails) {
    let medicineDose = AppStrings.medicineDose;
    let index = medicineDose.findIndex(
      (dose) =>
        dose.session.morning === doseDetails.session.morning &&
        dose.session.afterNoon === doseDetails.session.afterNoon &&
        dose.session.night === doseDetails.session.night
    );
    let value = medicineDose[index].value;
    return value + " " + doseDetails.type;
  }

  renderMedicine(item) {
    let price =
      item.item.quantity +
      " x " +
      item.item.currencySymbol +
      item.item.pricePerUnit;

    let dose = this.getDoseDetails(item.item.doseDetails);
    return (
      <CardView
        cardElevation={1}
        style={{
          backgroundColor: AppColors.whiteColor,
          alignSelf: "center",
          borderRadius: 5,
          marginBottom: 10,
          borderColor: "#EBEBEB",
          borderWidth: 0.5,
          width: wp(90),
        }}
      >
        <View
          style={{ height: 50, flexDirection: "row", alignItems: "center" }}
        >
          <Text
            style={{
              flex: 2,
              fontSize: 16,
              color: AppColors.blackColor,
              marginLeft: wp(5),
              fontFamily: AppStyles.fontFamilyMedium,
            }}
          >
            {item.item.medicineName}
          </Text>
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: wp(5) }}>
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyMedium,
                fontSize: 16,
                color: AppColors.blackColor,
              }}
            >
              {price}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 1,
            width: wp(85),
            alignSelf: "center",
            backgroundColor: "#EBEBEB",
          }}
        ></View>
        <View
          style={{ height: 70, marginLeft: wp(5), justifyContent: "center" }}
        >
          <Text
            style={{
              color: "#909090",
              fontSize: 12,
              height: 20,
              fontFamily: AppStyles.fontFamilyMedium,
            }}
          >
            {strings("doctor.text.courseDetail")}
          </Text>
          <Text
            style={{
              color: AppColors.blackColor,
              fontSize: 14,
              fontFamily: AppStyles.fontFamilyRegular,
            }}
          >
            {dose}
          </Text>
        </View>
      </CardView>
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
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === "ios" ? 16 : hp(1),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
});

export default EPrescription;
