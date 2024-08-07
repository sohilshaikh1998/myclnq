import React, { Component } from "react";
import { Alert, Image, Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import { AppColors } from "../../shared/AppColors";
import { Actions } from "react-native-router-flux";
import ProgressLoader from "rn-progress-loader";
import { moderateScale } from "../../utils/Scaling";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import { AppStrings } from "../../shared/AppStrings";
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from "../../locales/i18n";

let success = require("../../../assets/images/success.png");
let unsuccess = require("../../../assets/images/cancel.png");

let successMessage = "Your payment request is successful !";
let cancelledMessage = "Cancelled";
let unsuccessMessage = "Your payment request is failed please try again !";

class OnlinePayment extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Online Payment Screen");
        this.state = {
            isLoading: false,
            isDataVisible: false,
            isRequestDone: false,
            isPaySuccess: false,
            message: "",
            isPaymentProcessCompleted: false,
            expireON:this.props.expireTime
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        });
    }

    _onNavigationStateChange(webViewState) {
        AppUtils.console("webViewState:", webViewState, this.props);
        let responseURL = webViewState.url;
        if (responseURL.includes(this.props.paymentData.backUrl)) {
            this.setState({
                isRequestDone: true,
                isPaySuccess: false,
                message: cancelledMessage,
            });
            if (
                this.props.module === AppStrings.key.medicalEquipment ||
                this.props.module === AppStrings.key.appointment || this.props.module === AppStrings.key.vitalSubscription
            ) {
                Actions.pop();
            } else if (this.props.module === AppStrings.key.ePrescription) {
                Actions.pop()
                setTimeout(() => {
                    AppUtils.console("timeout", "----->")
                    Actions.refresh({ update: true })
                }, 500);
            }
            else if (this.props.module === AppStrings.key.caregiver) {
                Actions.caregiverTab({ isCaregiverBookingUpdated: true });
            } else {
                Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
            }
        }
        if (responseURL.includes(this.props.paymentData.redirectUrl)) {
            this.setState({ isPaymentProcessCompleted: true, isLoading: true });
            this.getPaymentStatus();
        }
    }

    async getPaymentStatus() {
        AppUtils.console("sfsxdf35345bxc");
        let paymentStatusData = {
            request_mid: this.props.paymentData.mid,
            transaction_id: this.props.paymentData.transaction_id,
            signature: this.props.paymentData.redirectSignature,
        };
        AppUtils.console("PaymentStatus", paymentStatusData, this.props.paymentData);
        try {
            let response = null;
            if (this.props.paymentData.isSandboxTesting) {
                response = await SHApiConnector.getSandBoxPaymentStatus(paymentStatusData);//comes till here
                AppUtils.console("PaymentStatusRes", paymentStatusData, response);

            } else {
                response = await SHApiConnector.getPaymentStatus(paymentStatusData);
                AppUtils.console("PaymentStatusRes1", paymentStatusData, this.props.paymentData);

            }
            if (response.data.response_code == 0) {
                this.setState({
                    isRequestDone: true,
                    isPaySuccess: true,
                    isLoading: false,
                    message: successMessage,
                });
                await AppUtils.positiveEventCount();
                setTimeout(() => {
                    if (this.props.module === AppStrings.key.medicalEquipment) {
                        Actions.drawer({ isMedicalEquipmentBookingUpdated: true });
                    } else if (this.props.module === AppStrings.key.caregiver) {
                        Actions.caregiverTab({ isCaregiverBookingUpdated: true });
                    } else if (this.props.module === AppStrings.key.ePrescription) {
                        Actions.pop()
                        setTimeout(() => {
                            AppUtils.console("timeout", "----->")
                            Actions.refresh({ update: true })
                        }, 500);
                    } else if (this.props.module === AppStrings.key.vitalSubscription) {
                        AppUtils.console("came hert"+this.props.subdetails);
                        //  AsyncStorage.setItem("subscriptionDetails",JSON.stringify(this.props.subdetails))
                        const subscribbedPlan = {'data':this.props.subdetails,'expireTime':this.state.expireON,'duration':this.props.durationIs};
                        AsyncStorage.setItem('planInfo', JSON.stringify(subscribbedPlan) )
                        Actions.MainScreen();
                        
                    }
                    else if (this.props.module === AppStrings.key.appointment) {
                        if (this.props.callType == "AUDIO" || this.props.callType == "VIDEO") {

                            Alert.alert(
                                strings('doctor.alertTitle.paySuccess'),
                                strings('doctor.alertMsg.paySuccess'),
                                [
                                    {
                                        text: strings('doctor.button.ok'),
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
                }, 2000);
            } else {
                this.setState({
                    isRequestDone: true,
                    isPaySuccess: false,
                    isLoading: false,
                    message: unsuccessMessage,
                });
                setTimeout(() => {
                    if (
                        this.props.module === AppStrings.key.medicalEquipment || this.props.module === AppStrings.key.appointment 
                    ) {
                        Actions.pop();
                    }else if(this.props.module === AppStrings.key.vitalSubscription){
                        Actions.MainScreen();
                    }
                    else if (this.props.module === AppStrings.key.ePrescription) {
                        Actions.pop()
                        setTimeout(() => {
                            AppUtils.console("timeout", "----->")
                            Actions.refresh({ update: true })
                        }, 500);
                    } else if (this.props.module === AppStrings.key.caregiver) {
                        Actions.caregiverTab({ isCaregiverBookingUpdated: true });
                    } else {
                        Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
                    }
                }, 2000);
            }
        } catch (e) {
            this.setState({
                isRequestDone: true,
                isPaySuccess: false,
                isLoading: false,
                message: unsuccessMessage,
            });
            setTimeout(() => {
                if (
                    this.props.module === AppStrings.key.medicalEquipment ||
                    this.props.module === AppStrings.key.appointment
                ) {
                    Actions.pop(); 
                }else if( this.props.module === AppStrings.key.vitalSubscription){
                    Actions.MainScreen();
                } 
                else if (this.props.module === AppStrings.key.ePrescription) {
                    Actions.pop()
                    setTimeout(() => {
                        AppUtils.console("timeout", "----->")
                        Actions.refresh({ update: true })
                    }, 500);
                }
                else if (this.props.module === AppStrings.key.caregiver) {
                    Actions.caregiverTab({ isCaregiverBookingUpdated: true });
                } else {
                    Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
                }
            }, 2000);
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
                                    marginTop: Platform.OS === "ios" ? (AppUtils.isX ? 60 : 30) : 0,
                                    marginBottom: Platform.OS === "ios" ? (AppUtils.isX ? 50 : 0) : 0,
                                }}
                                startInLoadingState={true}
                                source={{ uri: this.props.paymentData.payment_url }}
                                renderLoading={() => this.renderLoading()}
                                androidHardwareAccelerationDisabled={true}
                                onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                            />
                        )}
            </View>
        );
    }
}

const Header = () => (
    <View style={styles.header1}>
        <Text style={styles.title}>{strings('common.common.payment')}</Text>
    </View>
);

export default OnlinePayment;

const styles = StyleSheet.create({
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
