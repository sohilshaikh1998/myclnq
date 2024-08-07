import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
    BackHandler,
    StyleSheet,
    FlatList
} from 'react-native';

import { scale, verticalScale, moderateScale } from '../../utils/Scaling';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppUtils } from '../../utils/AppUtils';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import images from "../../utils/images";
import VitalCard from './card';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import firebaseNotifications from "../../utils/firebaseNotifications";
import { getUniqueId } from "react-native-device-info";
import { SHApiConnector } from "../../network/SHApiConnector";
import ProgressLoader from "rn-progress-loader";
import moment from 'moment';
import { strings } from '../../locales/i18n';


const { width, height } = Dimensions.get('window');
class ManageSubscription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            today: false,
            sevenDays: true,
            oneMonth: false,
            test: "Heart Rate",
            subscriptionData: '',
            durationIs: '',
            isLoading: false,
            subscribedPlanis: '',
            selectedPlan: '',
            planIs: '',
            durationInDays: '',
            durationIsMonth: '',
            inDays: false,
            validity: '',
            currency: '',
            price: '',
            subscriptionenabled: '',
            planavailable: []

        }
    }


    async componentDidMount() {
        this.getSubscriotionPlanDetails();

        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });

    }



    getSubscriotionPlanDetails = async () => {
        let tokenData = {
        }
        let subscribedPlanData = '';
        this.setState({ isLoading: true });
        try {
            let response = await SHApiConnector.storeToken(tokenData);
            AppUtils.console('responsedasas-->', response);
            this.setState({
                isLoading: false
            });
            if (response.data.status) {
                let vitalPlan = response;
                let subscriptionPlanDetails = vitalPlan.data.response.vitalSubscriptionPlan;
                let rangeStart = '';
                let rangeEnd = '';
                let startplan = '';
                let currentDateIS = '';
                let planEnd = '';
                if (vitalPlan.data.response.hasOwnProperty('vitalSubscriptionPlan')) {
                    if (subscriptionPlanDetails.length >= 1) {
                        let vitalPlan = response;
                        let subscriptionPlanDetails = vitalPlan.data.response.vitalSubscriptionPlan;
                        subscribedPlanData = subscriptionPlanDetails[0];
                        this.setState({
                            subscriptionenabled: subscriptionPlanDetails
                        })
                        startplan = moment(subscribedPlanData.planStartsOn.substr(0, 10)).format('YYYY-MM-DD');
                        currentDateIS = moment().format('YYYY-MM-DD');
                        planEnd = moment(subscribedPlanData.planEndsOn.substr(0, 10)).format('YYYY-MM-DD');
                        AppUtils.console('dadada' + JSON.stringify(subscribedPlanData))
                        rangeStart = moment(startplan).format(" MMM DD-YYYY");
                        rangeEnd = moment(planEnd).format(" MMM DD-YYYY");
                        AppUtils.console('11111-->' + rangeStart + '2222==>' + rangeEnd)
                        this.setState({ validity: rangeStart + "-" + rangeEnd })
                        AppUtils.console('endddddon' + planEnd)
                        this.setState({
                            planEndTime: planEnd,
                            planEndsONNextDate: moment(planEnd).add(1, 'days').format('DD MMM'),
                            subscriptionData: subscribedPlanData,
                            planIs: subscriptionPlanDetails[0]._id,

                        })
                    }
                }
            }
        } catch (e) {
            this.setState({ isLoading: false });
            AppUtils.console("STORE_TOKEN_ERROR", e)
        }
        try {
            this.setState({ isLoading: true })
            let subscriptionPlan = await SHApiConnector.getvitalSubscriptionPlan();
            AppUtils.console("Response:", subscriptionPlan)
            this.setState({ isLoading: false })
            if (subscriptionPlan.data.status) {
                this.setState({ planavailable: subscriptionPlan.data.response })
                let planRunning = '';

                subscriptionPlan.data.response.map((val, arrayIndex) => {

                    if (val._id === subscribedPlanData['vitalSubscriptionPlanId']) {
                        this.setState({
                            selectedPlan: val.subscriptionPlanName,
                            currency: val.currencySymbol,
                            price: val.price,
                            planActiveIS: val
                        })
                        planRunning = val;
                    }

                })
                AppUtils.console("qqqqq--->>>>>" + JSON.stringify(planRunning));
                if (planRunning['duration'] < 30) {
                    if (planRunning['duration'] == 28) {
                        this.setState({ durationIsMonth: 1, inDays: false }, () => {
                            AppUtils.console('dadada' + this.state.durationIsMonth);
                        })
                    } else {
                        this.setState({
                            durationInDays: planRunning['duration'],
                            inDays: true
                        }, () => {
                            AppUtils.console('dadada' + this.state.durationInDays)
                        })
                    }
                } else {
                    this.setState({ durationIsMonth: Math.floor(planRunning['duration'] / 30), inDays: false })
                }

            }
        } catch (e) {
            AppUtils.console("ResponseVitalSubscriptionerror:", e)
            this.setState({ isLoading: false })

        }
    }



    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(3),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                                  style={{
                                      width: wp(33),
                                      height: (AppUtils.headerHeight),
                                      justifyContent: 'center'
                                  }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(2),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={2}
                          style={styles.headerTextIOS}>{strings('vital.vital.manageSubscription')}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center',
                    alignItems: 'flex-end'
                }}>
                    <Text
                        style={[styles.headerTextIOS, {
                            color: AppColors.colorHeadings,
                            fontSize: 12,
                            marginRight: wp(5)
                        }]}></Text>
                </TouchableOpacity>


            </View>

        )
    }

    renderAndroid() {

        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(2),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                                  style={{
                                      width: wp(33),
                                      height: (AppUtils.headerHeight),
                                      justifyContent: 'center'
                                  }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(1),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={2}
                          style={styles.headerTextIOS}>{strings('vital.vital.manageSubscription')}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'flex-end',
                    alignSelf: 'flex-end',
                    alignItems: 'flex-end', marginRight: wp(1)
                }}>
                    <Text
                        style={[styles.headerTextIOS, {
                            width: wp(33),
                            textAlign: 'right',
                            color: AppColors.colorHeadings, fontSize: 12, justifyContent: 'flex-end'
                        }]}></Text>
                </TouchableOpacity>


            </View>

        )
    }

    requestsToday = () => {
        this.setState({
            today: !this.state.today
        })
    }

    requestsSevenDays = () => {
        this.setState({
            sevenDays: !this.state.sevenDays
        })
    }
    requestsThirtyDays = () => {
        this.setState({
            oneMonth: !this.state.oneMonth
        })
    }

    updateDetails = (item) => {

    }

    planStatus(item){
        let startDate = moment(item.planStartsOn).format('YYYY-MM-DD');
        let endDate = moment(item.planEndsOn).format('YYYY-MM-DD');
        let currentDate = moment().format('YYYY-MM-DD');
        if (startDate > currentDate){
            return "Upcoming";
        }else if (startDate <= currentDate && endDate >= currentDate ){
            return 'Running'
        }else{
            return ''
        }
    }

    _render_plan({ item, index }) {
        let planName = '';
        let currency = '';
        let price = '';
        let planStartTime = '';
        let planEndOnTime = '';
        let planDuration = '';
        let planStatus = this.planStatus(item)
        this.state.planavailable.map((plan, arrayIndex) => {
            if (plan._id === item.vitalSubscriptionPlanId) {
                price = plan.price
                planName = plan.subscriptionPlanName;
                currency = plan.currencySymbol;
                planDuration = moment(item.planEndsOn).diff(moment(), 'days');
                planStartTime = item.planStartsOn;
                planEndOnTime = item.planEndsOn;
                AppUtils.console("xcszxfsd", item, plan, planDuration);
            }
        });
        let expiryMessage = (planDuration > 1) ?
            `Expiring in ` + planDuration + ` days` :
            (planDuration == 0) ? 'Expiring today' : `Expiring in ` + planDuration + ` day`;

        return (
            <View>
                <View style={{
                    flexDirection: 'row', width: wp('100%'), marginTop: hp('1%'), height: hp('10%'),
                    backgroundColor: AppColors.colorHeadingsLight
                }}>
                    <View style={{
                        flexDirection: 'row', width: wp('100%'), marginTop: hp('1%'), height: hp('10%'),
                    }}>
                        <Image resizeMode="contain" style={{
                            height: hp('9%'), width: wp('12%'), marginLeft: wp(3), marginTop: hp(1)
                        }}
                               source={require('../../../assets/images/membership.png')} />

                        <View style={{
                            flex: 1, marginLeft: wp('2%'), marginTop: hp(2),
                            flexDirection: 'row'
                        }}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontFamily: AppStyles.fontFamilyBold, color: AppColors.blackColor, alignSelf: 'flex-start'
                                }}>{planName + ' (' + planStatus + ')'}</Text>
                                <View style={{
                                    flexDirection: 'row',
                                    marginTop: hp(1)
                                }}>

                                    <Text style={{
                                        fontSize: 10,
                                        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.blackColor, alignSelf: 'flex-end'
                                    }}>{(planDuration > 1) ? planDuration + ' Days' : planDuration + ' Day'}</Text>

                                    <Text style={{ color: AppColors.grey, alignSelf: 'flex-end', paddingLeft: wp('1%'), fontSize: 10 }}>
                                        {moment(planStartTime).format(" MMM DD-YYYY") + " - " + moment(planEndOnTime).subtract(1, "days").format(" MMM DD-YYYY")}</Text>
                                </View>
                            </View>

                            <Text style={{
                                color: AppColors.grey, alignSelf: 'flex-start', paddingRight: wp('3%'), fontSize: 18,
                                fontFamily: AppStyles.fontFamilyMedium
                            }}>{currency}{price}</Text>
                        </View>

                    </View>
                </View>

                <View style={{
                    backgroundColor: AppColors.colorHeadingsLight, width: wp(100), height: hp(9),
                    flexDirection: 'row', justifyContent: 'space-between',
                }}>
                    {planDuration <= 10  &&  index === 0 ?
                        <View style={{
                            backgroundColor: AppColors.colorHeadingsLight, width: wp(100), height: hp(9),
                            flexDirection: 'row', justifyContent: 'space-between',
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: AppStyles.fontFamilyBold,
                                color: AppColors.colorHeadings,
                                alignSelf: 'center',
                                paddingLeft: wp(15)
                            }}>{expiryMessage}</Text>

                            {this.state.subscriptionenabled.length == 1 ?
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: AppColors.colorHeadings,
                                        flexDirection: 'row',
                                        height: hp(5),
                                        width: wp('33%'),
                                        marginRight: wp('3%'),
                                        borderRadius: hp('1'),
                                        justifyContent: 'center',
                                        marginTop: hp('2')
                                    }}
                                    underlayColor='transparent'
                                    onPress={() => Actions.VitalOrderSummary({renewPlan: true})}>

                                    <Text style={{
                                        fontSize: 13,
                                        fontFamily: AppStyles.fontFamilyRegular,
                                        color: AppColors.whiteColor,
                                        alignSelf: 'center',
                                    }}>{strings('vital.vital.renewNow')}</Text>

                                </TouchableOpacity> : null
                            }
                        </View>
                        :<View/>}


                </View>



            </View>
        )
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}

                <View style={{
                    height: hp('4%'), marginLeft: wp('5%'), width: wp('90%'), flexDirection: 'row', marginTop: hp(5),

                }}>
                    <Text style={{ color: AppColors.greyColor, alignSelf: 'flex-start', fontFamily: AppStyles.fontFamilyMedium }}>Your Subscription</Text>
                </View>
                <FlatList
                    data={this.state.subscriptionenabled}
                    keyExtractor={(item, index) => index}
                    renderItem={(item) => this._render_plan(item)}
                    extraData={this.state}
                />

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

    headerStyle: {
        height: (AppUtils.headerHeight),
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerTextIOS: {
        color: AppColors.blackColor, textAlign: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (hp(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }

});


export default ManageSubscription;
