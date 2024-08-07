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
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { AppColors } from "../../shared/AppColors";
import CardView from "react-native-cardview";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";

import { AppUtils } from "../../utils/AppUtils";
import Toast from "react-native-simple-toast";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import AppointmentDetailsStyle from "./AppointmentDetailsStyle";

import moment from "moment";
import { CachedImage, ImageCacheProvider } from "../../cachedImage";
import { moderateScale } from "../../utils/Scaling";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { strings } from "../../locales/i18n";
import ElevatedView from "react-native-elevated-view";
import ReactNativeBlobUtil from "react-native-blob-util";

class AppointmentDetails extends Component {
  constructor(props) {
    super(props);
    AppUtils.console("appointmentDetails", props);
    this.state = {
      appointmentDetails: null,
      appointmentId: this.props.appointmentId,
      bmi: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.getAppointmentDetails();
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.onBackPress();
      return true;
    });
  }
  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console("timeout", "----->");
      Actions.refresh({ update: true });
    }, 500);
  }
  componentWillReceiveProps(props) {
    AppUtils.console("MyAppProps", props);
    if (props.update) {
      this.getAppointmentDetails();
    }
  }

  async getAppointmentDetails() {
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.getAppointmentDetailsById(
        this.state.appointmentId
      );
      AppUtils.console("wetrdthfsedf43", response);
      console.log("AppCheck5", response.data.response);
      this.setState({ isLoading: false });
      if (response.data.status) {
        console.log("AppCheck6", response.data.response.patientId);
        let bmiData = this.calculateBmi(response.data.response.patientId);
        this.setState({
          appointmentDetails: response.data.response,
          bmi: bmiData,
        });
      }

    } catch (e) {
      this.setState({ isLoading: false });
      console.error("Appointment_error", e);
    }
  }

  calculateBmi(patientData) {
    let bmiResult = '';
    if (patientData.weight != undefined && patientData.height != undefined) {
      let weight = AppUtils.convertWeightToKgs(patientData.weight, patientData.weightType);
      let height = AppUtils.convertHeightToCms(patientData.height, patientData.heightType);
      bmiResult = AppUtils.calculateBmi(weight, height);
      return bmiResult;
    } else {
      return bmiResult;
    }
  }

  renderPaymentData() {
    let item = this.state.appointmentDetails;
    // console.log("itemData", item);
    let appointmentState;
    let appointmentStatus;
    if (item.appointmentState === "WAITING_CLINIC_CONFIRMATION") {
      appointmentStatus = strings("doctor.appoitmentStatus.waiting_clinic");
    } else if (item.appointmentState === "WAITING_PATIENT_CONFIRMATION") {
      appointmentStatus = strings("doctor.appoitmentStatus.waiting_user");
    } else if (
      item.appointmentState === "CALENDER_CANCELLED" ||
      item.appointmentState === "CANCELLED"
    ) {
      appointmentStatus = strings("doctor.appoitmentStatus.cancelled");
    } else {
      appointmentStatus = item.appointmentState;
    }
    console.log("appointmentState", appointmentState);

    return (
      <View>
        {item.callType &&
        item.appointmentState != "CALENDER_CANCELLED" &&
        item.appointmentState != "CANCELLED" ? (
          <View style={AppointmentDetailsStyle.modalListContentView}>
            <View
              style={{
                height: 0.6,
                width: wp(80),
                backgroundColor: AppColors.greyBorder,
              }}
            />

            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <View style={{ width: wp(25) }}>
                <Text
                  numberOfLines={2}
                  style={AppointmentDetailsStyle.modalListContentViewTxt}
                >
                  {strings("string.label.payment_status")}{" "}
                </Text>
              </View>
              <View style={{ flexDirection: "column" }}>
                <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                  <Text
                    allowFontScaling={false}
                    style={[
                      AppointmentDetailsStyle.modalListContentViewTxt,
                      { fontSize: 16, marginBottom: hp(1) },
                    ]}
                  >
                    {item.paymentStatus == "WAVED_OFF"
                      ? strings("doctor.paymentStatus.wavedOff")
                      : item.paymentStatus.toUpperCase()}
                  </Text>

                  <View style={{ flexDirection: "column" }}>
                    {item.paymentStatus == "failed" ? (
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          allowFontScaling={false}
                          style={[
                            AppointmentDetailsStyle.modalListContentViewTxt,
                            { flex: 1 },
                          ]}
                        >
                          {strings("string.label.call_charge")}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={
                            AppointmentDetailsStyle.modalListContentViewTxt
                          }
                        >
                          {item.currencySymbol +
                            parseFloat(item.callCharge).toFixed(2)}
                        </Text>
                      </View>
                    ) : null}

                    {item.paymentStatus == "successful" ? (
                      <View>
                        <View style={{ flexDirection: "row" }}>
                          <Text
                            allowFontScaling={false}
                            style={[
                              AppointmentDetailsStyle.modalListContentViewTxt,
                              { flex: 1 },
                            ]}
                          >
                            {strings("string.label.call_charge")}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={
                              AppointmentDetailsStyle.modalListContentViewTxt
                            }
                          >
                            {item.currencySymbol +
                              parseFloat(item.callCharge).toFixed(2)}
                          </Text>
                        </View>
                        {item.discountAmount && item.discountAmount != 0 ? (
                          <View style={{ flexDirection: "row" }}>
                            <Text
                              allowFontScaling={false}
                              style={[
                                AppointmentDetailsStyle.modalListContentViewTxt,
                                { marginVertical: hp(0.5), flex: 1 },
                              ]}
                            >
                              {strings("string.label.discount")}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              style={[
                                AppointmentDetailsStyle.modalListContentViewTxt,
                                { marginVertical: hp(0.5) },
                              ]}
                            >
                              {item.currencySymbol +
                                parseFloat(item.discountAmount).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}

                        {item.gstAmount && item.gstAmount != 0 ? (
                          <View style={{ flexDirection: "row" }}>
                            <Text
                              allowFontScaling={false}
                              style={[
                                AppointmentDetailsStyle.modalListContentViewTxt,
                                { marginVertical: hp(0.5), flex: 1 },
                              ]}
                            >
                              {" "}
                              {strings("string.label.gst")}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              style={[
                                AppointmentDetailsStyle.modalListContentViewTxt,
                                { marginVertical: hp(0.5) },
                              ]}
                            >
                              {" "}
                              {item.currencySymbol +
                                parseFloat(item.gstAmount).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}

                        <View style={{ flexDirection: "row" }}>
                          <Text
                            allowFontScaling={false}
                            style={[
                              AppointmentDetailsStyle.modalListContentViewTxt,
                              {
                                flex: 1,
                                fontFamily: AppStyles.fontFamilyMedium,
                              },
                            ]}
                          >
                            {" "}
                            {strings("string.label.total")}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[
                              AppointmentDetailsStyle.modalListContentViewTxt,
                              { fontFamily: AppStyles.fontFamilyMedium },
                            ]}
                          >
                            {item.currencySymbol}
                            {item.paidAmount && item.paidAmount != 0
                              ? parseFloat(item.paidAmount).toFixed(2)
                              : parseFloat(item.callCharge).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  renderModalData() {
    let self = this;
    let item = this.state.appointmentDetails;
    let appointmentState;
    let appointmentStatus;
    let messageIcon;
    if (item.appointmentState === "WAITING_CLINIC_CONFIRMATION") {
      appointmentStatus = strings("doctor.appoitmentStatus.waiting_clinic");
    } else if (item.appointmentState === "WAITING_PATIENT_CONFIRMATION") {
      appointmentStatus = strings("doctor.appoitmentStatus.waiting_user");
    } else if (
      item.appointmentState === "CALENDER_CANCELLED" ||
      item.appointmentState === "CANCELLED"
    ) {
      appointmentStatus = strings("doctor.appoitmentStatus.cancelled");
    } else {
      appointmentStatus = item.appointmentState;
    }
    let showJoinButtonStaging =
      !AppUtils.isProduction() &&
      item.appointmentState === "CONFIRMED" &&
      (item.paymentStatus === "successful" ||
        item.paymentStatus === "WAVED_OFF");
    let showJoinButton =
      showJoinButtonStaging || item.appointmentState === "STARTED"
        ? true
        : false;
    AppUtils.console("appointmentDetails", item);

    return (
      <View>
        <View style={AppointmentDetailsStyle.modalListContentView}>
          <View style={AppointmentDetailsStyle.modalListContentInnerView}>
            <View style={AppointmentDetailsStyle.modalListContentViewHead}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={AppointmentDetailsStyle.modalListContentViewTxt}
              >
                {strings("string.label.doctorDetail")}
              </Text>
            </View>
            <View style={AppointmentDetailsStyle.modalListContentViewTail}>
              <Text
                allowFontScaling={false}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {item.doctorId.doctorName}
              </Text>
              <Text
                allowFontScaling={false}
                style={AppointmentDetailsStyle.modalListContentViewSubTxt}
              >
                {AppUtils.getAllDepartmentListInString(
                  item.doctorId.departmentList
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={AppointmentDetailsStyle.modalListContentView}>
          <View
            style={{
              height: 0.5,
              width: wp(80),
              backgroundColor: AppColors.greyBorder,
            }}
          />
          <View style={AppointmentDetailsStyle.modalListContentInnerView}>
            <View style={AppointmentDetailsStyle.modalListContentViewHead}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={[AppointmentDetailsStyle.modalListContentViewTxt]}
              >
                {strings("string.label.clinicDetail")}
              </Text>
            </View>
            <View style={AppointmentDetailsStyle.modalListContentViewTail}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {item.clinicId.clinicName}
              </Text>
              <Text
                allowFontScaling={false}
                style={AppointmentDetailsStyle.modalListContentViewSubTxt}
              >
                {item.clinicId.address}
              </Text>
            </View>
          </View>
        </View>

        <View style={AppointmentDetailsStyle.modalListContentView}>
          <View
            style={{
              height: 0.5,
              width: wp(80),
              backgroundColor: AppColors.greyBorder,
            }}
          />

          <View style={AppointmentDetailsStyle.modalListContentInnerView}>
            <View style={AppointmentDetailsStyle.modalListContentViewHead}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={AppointmentDetailsStyle.modalListContentViewTxt}
              >
                {strings("string.label.appointmentDetails")}{" "}
              </Text>
            </View>
            <View style={AppointmentDetailsStyle.modalListContentViewTail}>
              <Text
                allowFontScaling={false}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {appointmentStatus}
              </Text>
              {item.callType ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    allowFontScaling={false}
                    style={[
                      AppointmentDetailsStyle.modalListContentViewTxt,
                      { fontSize: 16 },
                    ]}
                    numberOfLines={1}
                  >
                    {item.callType === "VIDEO"
                      ? strings("doctor.call_type.video")
                      : item.callType === "IN_HOUSE_CALL"
                      ? strings("doctor.call_type.house")
                      : strings("doctor.call_type.audio")}
                  </Text>
                </View>
              ) : null}

              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {moment(item.startTime).format("MMM DD YYYY hh:mm A")}
              </Text>
            </View>
          </View>
        </View>

        <View style={AppointmentDetailsStyle.modalListContentView}>
          <View
            style={{
              height: 0.5,
              width: wp(80),
              backgroundColor: AppColors.greyBorder,
            }}
          />

          <View style={AppointmentDetailsStyle.modalListContentInnerView}>
            <View style={AppointmentDetailsStyle.modalListContentViewHead}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={AppointmentDetailsStyle.modalListContentViewTxt}
              >
                {strings("string.label.patient_detail")}{" "}
              </Text>
            </View>
            <View style={AppointmentDetailsStyle.modalListContentViewTail}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {item.patientId.firstName} {item.patientId.lastName}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  AppointmentDetailsStyle.modalListContentViewTxt,
                  { fontSize: 16 },
                ]}
              >
                {AppUtils.getAgeFromDateOfBirth(item.patientId.dateOfBirth)}
                Yrs, {item.patientId.gender}
              </Text>
            </View>
          </View>
        </View>
        <View style={AppointmentDetailsStyle.modalListContentView}>
            <View
              style={{
                height: 0.6,
                width: wp(80),
                backgroundColor: AppColors.greyBorder,
              }}
            />
        {this.state.bmi != '' ? (
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <View style={AppointmentDetailsStyle.modalListContentViewHead}>
                <Text allowFontScaling={false} numberOfLines={2} style={[AppointmentDetailsStyle.modalListContentViewTxt]}>
                  Patient BMI{' '}
                </Text>
              </View>
              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text allowFontScaling={false} style={[AppointmentDetailsStyle.modalListContentViewTxt, { fontSize: 16 }]}>
                  {this.state.bmi}
                </Text>
              </View>
            </View>
          ) : null}
          </View>
        {item.symptoms ? (
          <View style={AppointmentDetailsStyle.modalListContentView}>
            <View
              style={{
                height: 0.6,
                width: wp(80),
                backgroundColor: AppColors.greyBorder,
              }}
            />

            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <View style={AppointmentDetailsStyle.modalListContentViewHead}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={2}
                  style={[AppointmentDetailsStyle.modalListContentViewTxt]}
                >
                  {strings("string.label.symptoms")}{" "}
                </Text>
              </View>
              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  allowFontScaling={false}
                  style={[
                    AppointmentDetailsStyle.modalListContentViewTxt,
                    { fontSize: 16 },
                  ]}
                >
                  {item.symptoms}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {item.callType === "IN_HOUSE_CALL" ? (
          <View style={AppointmentDetailsStyle.modalListContentView}>
            <View
              style={{
                height: 0.6,
                width: wp(80),
                backgroundColor: AppColors.greyBorder,
              }}
            />

            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <View style={AppointmentDetailsStyle.modalListContentViewHead}>
                <Text
                  numberOfLines={2}
                  style={AppointmentDetailsStyle.modalListContentViewTxt}
                >
                  {strings("string.label.userAddress")}{" "}
                </Text>
              </View>
              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  allowFontScaling={false}
                  style={[
                    AppointmentDetailsStyle.modalListContentViewTxt,
                    { fontSize: 16 },
                  ]}
                >
                  {AppUtils.getAddress(item.userAddress)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {item.isCalenderBasedAppointment ? null : (
          <View style={AppointmentDetailsStyle.modalListContentView}>
            <View
              style={{
                height: 0.6,
                width: wp(80),
                backgroundColor: AppColors.greyBorder,
              }}
            />

            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <View style={AppointmentDetailsStyle.modalListContentViewHead}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={2}
                  style={AppointmentDetailsStyle.modalListContentViewTxt}
                >
                  {strings("string.label.queueNumber")}{" "}
                </Text>
              </View>
              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  allowFontScaling={false}
                  style={[
                    AppointmentDetailsStyle.modalListContentViewTxt,
                    { fontSize: 16 },
                  ]}
                >
                  #{item.queueNumber}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* {(item.callType && item.appointmentState != "CALENDER_CANCELLED" && item.appointmentState != "CANCELLED") ?
                    <View style={AppointmentDetailsStyle.modalListContentView}>
                        <View style={{ height: .6, width: wp(80), backgroundColor: AppColors.greyBorder, }} />

                        <View style={AppointmentDetailsStyle.modalListContentInnerView}>

                            <View style={AppointmentDetailsStyle.modalListContentViewHead}>
                                <Text
                                    numberOfLines={2}
                                    style={AppointmentDetailsStyle.modalListContentViewTxt}
                                >
                                    {strings('string.label.payment_status')}{" "}
                                </Text>
                            </View>
                            <View style={{flexDirection:"column"}}>
                            <View style={AppointmentDetailsStyle.modalListContentViewTail}>

                                <Text
                                    allowFontScaling={false}
                                    style={[AppointmentDetailsStyle.modalListContentViewTxt, { fontSize: 16 }]}
                                >
                                    {item.paymentStatus == 'WAVED_OFF' ? strings('doctor.paymentStatus.wavedOff') : item.paymentStatus.toUpperCase()}
                                </Text>

                                <Text
                                    allowFontScaling={false}
                                    style={[AppointmentDetailsStyle.modalListContentViewTxt, { fontSize: 16 }]}
                                >
                                    {item.currencySymbol + ((item.paidAmount!==null && item.paidAmount!==undefined && item.paidAmount >0) ===true?
                                     item.paidAmount:item.callCharge)}
                                </Text>
                            </View>
                        </View>             
                        </View></View> : null
                } */}
      </View>
    );
  }

  cancel(appointment) {
    setTimeout(() => {
      Alert.alert(
        strings("doctor.alertTitle.cancelAppt"),

        strings("doctor.alertMsg.cancelAppt"),
        [
          {
            text: strings("doctor.button.yes"),
            onPress: () => this.cancelAppointment(appointment),
          },
          { text: strings("doctor.button.no"), style: "cancel" },
        ]
      );
    }, 500);
  }

  cancelAppointment(appointment) {
    var self = this;

    var details = {
      appointmentId: appointment._id,
      isCalenderBasedAppointment: appointment.isCalenderBasedAppointment,
    };

    SHApiConnector.cancelAppointment(details, function (err, stat) {
      try {
        if (!err && stat) {
          if (stat.status) {
            self.getMyAppointments();
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  renderActionData() {
    let self = this;
    let data = this.state.appointmentDetails;
    let showInvoice = this.props.isPast && data.paymentStatus == "successful";
    let showCancel =
      data.appointmentState == "CONFIRMED" &&
      this.props.isUpComing &&
      data.paymentStatus != "successful" &&
      data.callType;
    let isWaitingClinicCancel =
      data.appointmentState == "WAITING_CLINIC_CONFIRMATION";
    let showMRRecords =
      data.appointmentState == "CONFIRMED" ||
      data.appointmentState == "STARTED" ||
      data.appointmentState == "COMPLETED";
    AppUtils.console("sdzdsfgsfd", showMRRecords, data.appointmentState);
    return (
      <View>
        {showCancel || isWaitingClinicCancel ? (
          <TouchableOpacity
            onPress={() =>
              isWaitingClinicCancel
                ? this.updateAppointment(
                    data,
                    "CALENDER_CANCELLED",
                    "Patient cancelled appointment request",
                    "SYSTEM"
                  )
                : this.cancel(data)
            }
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.cancelAppointment}
              />

              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("string.label.cancelAppoinment")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {(this.props.isUpComing && data.isCalenderBasedAppointment) ||
        this.props.isRequest ? (
          <TouchableOpacity
            onPress={() => this.openUserChat(data)}
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.chat}
              />
              {data.numOfUnreadMessages > 0 ? (
                <View
                  style={{
                    height: moderateScale(8),
                    width: moderateScale(8),
                    marginBottom: moderateScale(20),
                    borderRadius: moderateScale(4),
                    backgroundColor: AppColors.primaryColor,
                  }}
                />
              ) : (
                <View />
              )}
              <View
                style={[
                  AppointmentDetailsStyle.modalListContentViewTail,
                  { paddingLeft: 15 },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("string.label.chat")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {
          //TODO: Reschedule
          // <View style={AppointmentDetailsStyle.modalListActionView}>
          //     <View style={AppointmentDetailsStyle.modalListContentInnerView}>
          //         <Image
          //             style={{
          //                 height: wp(5),
          //                 width: wp(5),
          //             }}
          //             source={images.rescheduleAppointment}/>
          //
          //         <View style={AppointmentDetailsStyle.modalListContentViewTail}>
          //             <Text
          //                 numberOfLines={1}
          //                 style={AppointmentDetailsStyle.modalListContentViewTxtAction}
          //             >
          //                 {strings('string.label.reschduleAppoinment')}
          //             </Text>
          //
          //         </View>
          //     </View>
          // </View>
        }

        {data.isMedicalCertificateGenerated ? (
          <TouchableOpacity
            onPress={() => this.downloadMedicalCert()}
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.medicalCertificate}
              />

              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  numberOfLines={1}
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("string.label.medicalCertificate")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {this.state.appointmentDetails.ePrescriptionGenerated ? (
          <TouchableOpacity
            onPress={() =>
              Actions.EPrescription({ appointmentId: this.state.appointmentId })
            }
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.viewPrescription}
              />

              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  numberOfLines={1}
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("string.label.viewPres")}
                </Text>
              </View>
            </View>
            {/*<View style={AppointmentDetailsStyle.modalListContentInnerView}>*/}
            {/*    <Image*/}
            {/*        style={{*/}
            {/*            height: wp(5),*/}
            {/*            width: wp(5),*/}
            {/*        }}*/}
            {/*        source={images.viewNote}/>*/}

            {/*    <View style={AppointmentDetailsStyle.modalListContentViewTail}>*/}

            {/*        <Text*/}
            {/*            style={AppointmentDetailsStyle.modalListContentViewTxtAction}*/}
            {/*        >*/}
            {/*            {strings('string.label.viewNotes')}*/}
            {/*        </Text>*/}
            {/*    </View>*/}
            {/*</View>*/}
          </TouchableOpacity>
        ) : null}

        {showInvoice ? (
          <TouchableOpacity
            onPress={() => this.generateInvoice(data)}
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.viewPrescription}
              />

              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  numberOfLines={1}
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("string.label.invoice")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {showMRRecords ? (
          <TouchableOpacity
            onPress={() => this.medicalRecords(data)}
            style={AppointmentDetailsStyle.modalListActionView}
          >
            <View style={AppointmentDetailsStyle.modalListContentInnerView}>
              <Image
                resizeMode={"contain"}
                style={{
                  height: wp(5),
                  width: wp(5),
                }}
                source={images.viewPrescription}
              />

              <View style={AppointmentDetailsStyle.modalListContentViewTail}>
                <Text
                  numberOfLines={1}
                  style={AppointmentDetailsStyle.modalListContentViewTxtAction}
                >
                  {strings("common.common.medicalRecords")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  async generateInvoice(appointmentData) {
    let self = this;
    AppUtils.console("sdzdcvetdszdfcv", appointmentData);
    self.setState({ isLoading: true });
    let userData = await AppUtils.retrieveLocal(
      AppStrings.contracts.LOGGED_IN_USER_DETAILS
    );

    let parsedJSON = JSON.parse(userData);
    AppUtils.console("User Data:", parsedJSON);
    let requestBody = {
      appointmentId: appointmentData._id,
      email: parsedJSON.email,
    };
    AppUtils.console("User Data:", requestBody);

    AppUtils.console("Request Body:", requestBody);
    try {
      let sResp = await SHApiConnector.generateInvoice(requestBody);
      self.setState({ isLoading: false });
      AppUtils.console("Server Response:", sResp);
      if (sResp !== null && sResp.data.status) {
        setTimeout(() => {
          Alert.alert(
            "",
            strings("doctor.alertMsg.invoiceSend", { email: parsedJSON.email })
          );
        }, 100);
      }
    } catch (error) {
      self.setState({ isLoading: false });
      AppUtils.console("Error:", error);
    }
  }

  async medicalRecords(appointmentData) {
    Actions.MedicalRecords({
      relativeId: appointmentData.relativeId,
      appointmentId: appointmentData._id,
      startTime: appointmentData.startTime,
    });
  }

  async downloadMedicalCert() {
    let data = {
      appointmentId: this.state.appointmentDetails._id,
      fileType: AppStrings.label.MEDICAL_CERTIFICATE,
    };
    try {
      this.setState({ isLoading: true });
      let response = await SHApiConnector.downloadCertificateOrEPrescription(
        data
      );
      this.setState({ isLoading: false });
      AppUtils.console("easfdgdrserf34", response);
      if (response.data.status) {
        this.createPDF_File(response.data.response.MedicalCertificate);
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async createPDF_File(medCert) {
    let options = {
      html: medCert,
      fileName: "Medical Certificate",
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
    let filePath = downloadDir + "/Medical Certificate.pdf";
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
                name: "Medical Certificate",
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
            strings("doctor.alertMsg.medCertDownload"),
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
        Alert.alert("", strings("doctor.alertMsg.medCertNotDownload"));
        AppUtils.console(" Error Log: ", errors);
        setTimeout(() => {
          this.setState({
            isLoading: false,
          });
        }, 500);
      });
  }

  openUserChat(item) {
    Actions.ChatScreen({
      sender: "CLINIC",
      receiver: "PATIENT",
      appointmentId: item._id,
      clinicName: item.clinicId.clinicName,
      clinicLogo: item.clinicId.clinicLogo,
      clinicAddress: item.clinicId.clinicAddress,
      isRequest: this.props.isRequest,
      isUpComing: this.props.isUpComing,
      isAppointmentDetails: true,
    });
  }

  async updateAppointment(item, status, message, sender) {
    var self = this;
    if (
      item.callType &&
      status !== "REJECTED" &&
      status !== "CALENDER_CANCELLED" &&
      item.paymentStatus !== "WAVED_OFF"
    ) {
      try {
        let data = {
          appointmentId: item._id,
          referralCode: item.couponCode ? item.couponCode : null,
        };
        self.setState({ isLoading: true, isCancelReqModal: false });
        let response = await SHApiConnector.appointmentPayWithRefferal(data);
        this.setState({ isLoading: false }, () => {
          setTimeout(() => {
            AppUtils.console("paymentDoctor", response);
            if (response.data.status) {
              if (response.data.response.isPayByPayU) {
                let payUData = response.data.response.payment;
                payUData.key = AppStrings.payUDetails.MERCHANT_KEY;
                payUData.salt = AppStrings.payUDetails.MERCHANT_SALT;
                payUData.merchantId = AppStrings.payUDetails.MERCHANT_ID;

                Actions.PayUPayment({
                  paymentDetails: payUData,
                  module: "appointment",
                  callType: item.callType,
                });
              } else if (response.data.response.isPayByStripe) {
                let stripeData = response.data.response.payment;
                Actions.StripePayment({
                  paymentDetails: stripeData,
                  module: "appointment",
                  callType: item.callType,
                });
              } else if (response.data.response.isPayByXendit) {
                let xenditData = response.data.response.payment;
                Actions.XenditPayment({
                  paymentDetails: xenditData,
                  module: AppStrings.key.appointment,
                  callType: item.callType,
                });
              } else {
                Actions.OnlinePayment({
                  paymentData: response.data.response.payment,
                  module: "appointment",
                  callType: item.callType,
                });
              }
            } else {
              AppUtils.console("error");
              Alert.alert("", strings("doctor.alertMsg.cantPay"));
            }
          }, 500);
        });
      } catch (e) {
        AppUtils.console("error", e);
        this.setState({ isLoading: false });
      }
    } else {
      AppUtils.console("UpdateAppoinment");
      let data = {
        appointmentState: status,
        appointmentId: item._id,
        userId: item.userId._id,
        sender: sender,
        receiver: "CLINIC",
        message: message,
      };
      self.setState({ isLoading: true, isCancelReqModal: false });
      SHApiConnector.updateCalenderAppointments(data, function (err, stat) {
        AppUtils.console("UpdateAppoinment", stat);
        self.setState({
          isLoading: false,
          confirmation: false,
          isRefreshing: false,
          message: "",
        });
        try {
          if (!err && stat) {
            if (stat.error_code == "10006") {
              // Actions.LoginMobile();
              self.setState({
                isDataVisible: true,
                isRefreshing: false,
                isEmpty: false,
              });
            } else {
              if (stat.state) {
                if (stat.state === "CONFIRMED") {
                  Alert.alert(strings("doctor.alert.Msg.requestConfirmed"));
                } else if (stat.state === "EXPIRED") {
                  Alert.alert(strings("doctor.alert.Msg.requestExpired"));
                } else if (
                  stat.state === "CALENDER_CANCELLED" ||
                  stat.state === "CANCELLED"
                ) {
                  Alert.alert(strings("doctor.alert.Msg.requestCancelled"));
                } else if (stat.state === "REJECTED") {
                  Alert.alert(strings("doctor.alert.Msg.requestRejected"));
                }
                self.myAppointments(false, true);
              } else {
                if (status == "CONFIRMED") {
                  self.myAppointments(false, false);
                } else {
                  self.myAppointments(true, false);
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  myAppointments(key, isPast) {
    this.setState({ confirmation: false });
    AsyncStorage.setItem(
      AppStrings.key.key,
      JSON.stringify({ key: key, isPast: isPast })
    );
    Actions.HomeScreenDash({ isAppointmentUpdated: true });
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
            {strings("doctor.text.appontDetail")}
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
            {strings("doctor.text.appontDetail")}
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
      <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
        {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}
        <ScrollView showsVerticalScrollIndicator={false}>
          <CardView
            cardElevation={2}
            cornerRadius={5}
            style={{
              backgroundColor: AppColors.whiteColor,
              marginBottom: hp(1),
              width: wp(90),
              alignSelf: "center",
              marginTop: hp(2),
            }}
          >
            <View style={[AppointmentDetailsStyle.modalView2]}>
              {this.state.appointmentDetails ? this.renderModalData() : null}
            </View>
          </CardView>
          <CardView
            cardElevation={2}
            cornerRadius={5}
            style={{
              backgroundColor: AppColors.whiteColor,
              marginBottom: hp(1),
              width: wp(90),
              alignSelf: "center",
              marginTop: hp(2),
            }}
          >
            {this.state.appointmentDetails ? this.renderPaymentData() : null}
          </CardView>
          <CardView
            cardElevation={0}
            cornerRadius={0}
            style={{
              backgroundColor: AppColors.whiteShadeColor,
              marginBottom: hp(1),
              width: wp(90),
              alignSelf: "center",
              marginTop: hp(2),
            }}
          >
            <View style={[AppointmentDetailsStyle.modalView2]}>
              {this.state.appointmentDetails ? this.renderActionData() : null}
            </View>
          </CardView>
        </ScrollView>

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

export default AppointmentDetails;
