import React from 'react';
import {Alert, BackHandler, Dimensions, NativeEventEmitter, Platform, View} from 'react-native';

import {AppUtils} from "../../utils/AppUtils";
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import { strings } from '../../locales/i18n';
import PayUBizSdk from 'payu-non-seam-less-react';
import { AppColors } from '../../shared/AppColors';
import { AppStrings } from '../../shared/AppStrings';
import Toast from 'react-native-simple-toast';
var sha512 = require('js-sha512');

const {width, height} = Dimensions.get('window');

class PayUPayment extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("PayUPayment");
    }

    componentDidMount() {
        this.payUBizEventEmitter();
        this.payment();
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        })
    }

    payUBizEventEmitter(){
        const eventEmitter = new NativeEventEmitter(PayUBizSdk);
        this.paymentSuccess = eventEmitter.addListener('onPaymentSuccess', this.onPaymentSuccess.bind(this));
        this.paymentFailure = eventEmitter.addListener('onPaymentFailure', this.onPaymentFailure);
        this.paymentCancel = eventEmitter.addListener('onPaymentCancel', this.onPaymentCancel);
        this.error = eventEmitter.addListener('onError', this.onError);
        this.generateHash = eventEmitter.addListener('generateHash', this.generateHash);
    }

    componentWillUnmount(){
        this.paymentSuccess.remove();
        this.paymentFailure.remove();
        this.paymentCancel.remove();
        this.error.remove();
        this.generateHash.remove();
    }

    async onPaymentSuccess(e, self){
        AppUtils.console("Payment_Success", e);
        await AppUtils.positiveEventCount();
        if (this.props.module === AppStrings.key.transport) {
            Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
        } else if (this.props.module === AppStrings.key.medicalEquipment) {
            Actions.drawer({ isMedicalEquipmentBookingUpdated: true });
        } else if (this.props.module === AppStrings.key.caregiver) {
            Actions.caregiverTab({ isCaregiverBookingUpdated: true });
        } else if (this.props.module === AppStrings.key.ePrescription) {
            Actions.pop()
            setTimeout(() => {
                Actions.refresh({ update: true })
            }, 500);
        } else if (this.props.module === AppStrings.key.vitalSubscription) {
            const subscribbedPlan = {'data':this.props.subdetails,'expireTime':this.state.expireON,'duration':this.props.durationIs};
            AsyncStorage.setItem('planInfo', JSON.stringify(subscribbedPlan) )
            Actions.MainScreen();  
        }
        else if (this.props.module === AppStrings.key.appointment) {
            if (this.props.callType == "AUDIO" || this.props.callType == "VIDEO") {
                if (Platform.OS === 'ios') {
                    Alert.alert(strings('doctor.alertTitle.paySuccess'), strings('doctor.alertMsg.paySuccess'), [
                      {
                        text: strings('doctor.button.ok'),
                        onPress: () => Actions.HomeScreenDash({ isAppointmentUpdated: true }),
                      },
                    ]);
                  } else {
                      Actions.HomeScreenDash({ isAppointmentUpdated: true });
                      Toast.show(strings('doctor.alertTitle.paySuccess'));
                  }
            } else {
                Actions.HomeScreenDash({ isAppointmentUpdated: true });

            }
        }
        else if(this.props.module === AppStrings.key.membership){
            Actions.MembershipOrderSummary({fromPaymentScreen: true, isPaymentSuccess: true, amount: this.props.paymentDetails.amount});
        }
    }

    paymentFailed(){
        if (this.props.module === AppStrings.key.medicalEquipment || this.props.module === AppStrings.key.appointment ) {
            Actions.pop();
        }else if(this.props.module === AppStrings.key.vitalSubscription){
            Actions.MainScreen();
        }else if (this.props.module === AppStrings.key.ePrescription) {
            Actions.pop()
            setTimeout(() => {
                AppUtils.console("timeout", "----->")
                Actions.refresh({ update: true })
            }, 500);
        } else if (this.props.module === AppStrings.key.caregiver) {
            Actions.caregiverTab({ isCaregiverBookingUpdated: true });
        }
        else if(this.props.module === AppStrings.key.membership){
            Actions.MembershipOrderSummary({fromPaymentScreen: true, isPaymentSuccess: false, amount: this.props.paymentDetails.amount});
        } else {
            Actions.MyCareWagonDash({ isWagonBookingUpdated: true });
        }
    }

    onPaymentFailure = (e) => {
        AppUtils.console("Payment_Failure", e);
        this.paymentFailed()
        Alert.alert('', 'Payment Failed');
    }
    onPaymentCancel = (e) => {
        AppUtils.console("Payment_Cancelled", e);
        this.paymentFailed()
        Alert.alert('','Payment Cancelled');
    }
    onError = (e) => {
       console.log("Payment_Error", e);
        this.paymentFailed()
        Alert.alert('','Payment Error');
    }
    generateHash = (e) => {
        let salt = this.props.paymentDetails.isSandbox ? '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW' : this.props.paymentDetails.salt;
        this.sendBackHash(e.hashName, e.hashString + salt);
    }

    sendBackHash(hashName, hashData){
        var hashValue = this.calculateHash(hashData);
        var result = { [hashName]: hashValue };
        PayUBizSdk.hashGenerated(result);
    }
    calculateHash(data){
        var result = sha512(data);
        return result;
    }

    payment(){
        let payUData = this.props.paymentDetails;
        //Anurag's changes here replaced key with txnId and productName with txn id
        var payUPaymentParams = {
            key: payUData.isSandbox ? 'gtKFFx' : payUData.txnId,
            transactionId: payUData.txnId,
            amount: payUData.amount,
            productInfo: payUData.txnId,
            firstName: payUData.firstName,
            email: payUData.email,
            phone: payUData.phone,
            ios_surl: payUData.successUrl,
            ios_furl: payUData.failedUrl,
            android_surl: payUData.successUrl,
            android_furl: payUData.failedUrl,
            environment: payUData.isSandbox ? '1' : '0',
            userCredential: payUData.firstName + ":" + payUData.productName,
            additionalParam: {
                udf1: '',
                udf2: '',
                udf3: '',
                udf4: '',
                udf5: '',
            }
        }

        var payUCheckoutProConfig = {
            primaryColor: AppColors.primaryColor,
            secondaryColor: AppColors.whiteColor,
            merchantName: 'MyCLNQ Health',
            merchantLogo: Platform.OS == 'ios' ?'AppIcon' : 'ic_launcher',
            showExitConfirmationOnCheckoutScreen: true,
            showExitConfirmationOnPaymentScreen: true,
        }
       

        let payUParam = {
            payUPaymentParams: payUPaymentParams,
            payUCheckoutProConfig: payUCheckoutProConfig
        }

        AppUtils.console("KSCNJSNC:". payUPaymentParams)

        PayUBizSdk.openCheckoutScreen(payUParam)
    }

    goBack() {
        Actions.pop();
    }


    render() {
        return (
            <View style={{flex:1}}></View>
        )
    }


}

export default PayUPayment;
